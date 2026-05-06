/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   GOURMETREVIENT — Auth UI v2.0                              ║
 * ║   Authentification Supabase · Session · Premium Design       ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const AuthUI = (() => {

  let _currentUser = null;
  let _currentPlan = 'free';
  const ADMIN_EMAIL = 'julian31.peresson@gmail.com';
  const WHITELIST = [ADMIN_EMAIL, 'ju2503', 'ju 2503'];

  function isAuthorized(user) {
    if (!user) return false;
    const email = user.email?.toLowerCase();
    const fullName = user.user_metadata?.full_name?.toLowerCase();
    return WHITELIST.includes(email) ||
           (fullName && (fullName.includes('ju 2503') || fullName.includes('ju2503') || fullName === 'ju'));
  }

  function isAdmin(user) {
    if (!user) return false;
    return user.email?.toLowerCase() === ADMIN_EMAIL;
  }

  // ── VÉRIFICATION ABONNEMENT SUPABASE ────────────────────────────────────────
  async function _checkSubscription(user) {
    if (!user) return 'free';
    if (isAdmin(user)) return 'admin';
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('plan_type, status')
        .eq('user_id', user.id)
        .single();
      if (error || !data) return 'free';
      if (data.status === 'active' || data.status === 'trialing') return data.plan_type || 'pro';
      return 'free';
    } catch(e) { return 'free'; }
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────
  async function init() {
    console.log('🔐 AuthUI : Initialisation...');

    supabase.auth.onAuthStateChange(async (event, session) => {
      _currentUser = session?.user || null;

      // Whitelist stricte — seuls les utilisateurs autorisés peuvent accéder
      if (_currentUser && !isAuthorized(_currentUser)) {
        console.warn('🚫 Accès refusé :', _currentUser.email);
        await supabase.auth.signOut();
        _currentUser = null;
        if (typeof showToast === 'function') showToast('🚫 Accès non autorisé. Veuillez souscrire à un abonnement.', 'error');
        _updateUI(null);
        return;
      }

      if (_currentUser) {
        _currentPlan = await _checkSubscription(_currentUser);
        window.GOURMET_PLAN = _currentPlan;
        console.info(`[Auth] Plan actif : ${_currentPlan}`);
      } else {
        _currentPlan = 'free';
        window.GOURMET_PLAN = 'free';
      }

      _updateUI(_currentUser);

      if (event === 'SIGNED_IN') {
        console.info('%c[Auth] ✅ Connecté :', 'color:#10b981', _currentUser?.email);
        window.dispatchEvent(new CustomEvent('gourmet:authSuccess', { detail: { user: _currentUser } }));
      }
      if (event === 'SIGNED_OUT') console.info('%c[Auth] 👋 Déconnecté', 'color:#f59e0b');
      if (event === 'TOKEN_REFRESHED') console.info('%c[Auth] 🔄 Token rafraîchi', 'color:#6366f1');
    });

    // Vérification de la session existante au chargement
    const { data: { session } } = await supabase.auth.getSession();
    _currentUser = session?.user || null;

    _renderButton();
    _updateUI(_currentUser);
  }


  // ── BOUTON NAV ────────────────────────────────────────────────────────────────
  function _renderButton() {
    // Ne pas dupliquer le bouton
    if (document.getElementById('authMainBtn')) return;

    // Cherche la barre de navigation de l'app
    const targets = [
      '.nav-user-zone',
      '.topbar-actions',
      '.nav-actions',
      '.header-right',
      '#navbarRight',
    ];

    let container = null;
    for (const sel of targets) {
      container = document.querySelector(sel);
      if (container) break;
    }

    // Fallback : injecter directement dans le body en position fixe
    if (!container) {
      container = document.createElement('div');
      container.id = 'authFloatingZone';
      container.style.cssText = 'position:fixed;top:12px;right:16px;z-index:9000;';
      document.body.appendChild(container);
    }

    const btn = document.createElement('button');
    btn.id = 'authMainBtn';
    btn.className = 'auth-nav-btn auth-nav-btn--guest';
    btn.innerHTML = '<span class="auth-btn-icon">👤</span><span class="auth-btn-label">Connexion</span>';
    btn.onclick = showModal;
    container.prepend(btn);
  }

  // ── MISE À JOUR UI ──────────────────────────────────────────────────────────
  function _updateUI(user) {
    const btn = document.getElementById('authMainBtn');
    const proBtn = document.getElementById('btnSubscribePro');
    if (!btn) return;

    if (user) {
      let name = user.user_metadata?.full_name || user.email.split('@')[0];
      
      // Nettoyage spécial pour l'admin : retirer le suffixe 2503
      name = name.replace(/[\s-]*2503$/, '');

      btn.className = 'auth-nav-btn auth-nav-btn--logged';
      btn.innerHTML = `<span class="auth-btn-icon">👨‍🍳</span><span class="auth-btn-label">${GourmetSecurity?.sanitize(name) || name}</span>`;
      btn.onclick = _showUserMenu;

      // Style spécial pour le bouton Pro si l'utilisateur est déjà abonné
      if (proBtn) {
        if (_currentPlan === 'pro' || _currentPlan === 'admin') {
          proBtn.classList.add('btn-pro-active');
          proBtn.innerHTML = '<span>⭐ Pro</span>';
          proBtn.onclick = () => { if(typeof showToast === 'function') showToast('✨ Vous profitez déjà de l\'accès complet !', 'info'); };
        } else {
          proBtn.classList.remove('btn-pro-active');
          proBtn.innerHTML = '<span>💎 Devenir Pro</span>';
          proBtn.onclick = () => window.GourmetBilling.checkout('pro_monthly');
        }
        proBtn.style.display = 'flex';
      }

      // Synchronise l'identité avec le système multi-chef de app.js si disponible
      if (typeof window.currentUser !== 'undefined') {
        window.currentUser = name;
      }
    } else {
      btn.className = 'auth-nav-btn auth-nav-btn--guest';
      btn.innerHTML = '<span class="auth-btn-icon">👤</span><span class="auth-btn-label">Connexion</span>';
      btn.onclick = showModal;

      if (proBtn) proBtn.style.display = 'flex';
    }
  }

  // ── MODAL PRINCIPALE ─────────────────────────────────────────────────────────
  function showModal(tab = 'login') {
    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'glass-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Connexion à GourmetRevient');

    modal.innerHTML = `
      <div class="glass-modal-content auth-modal-box">

        <!-- Header -->
        <div class="auth-modal-header">
          <div class="auth-modal-logo">🧁</div>
          <h2 id="authModalTitle">Bienvenue Chef !</h2>
          <p id="authModalSubtitle">Connectez-vous pour synchroniser vos recettes.</p>
        </div>

        <!-- Tabs -->
        <div class="auth-tabs" role="tablist">
          <button id="tabLogin"  class="auth-tab ${tab==='login' ?'active':''}" onclick="AuthUI.switchTab('login')"  role="tab">Se connecter</button>
          <button id="tabSignup" class="auth-tab ${tab==='signup'?'active':''}" onclick="AuthUI.switchTab('signup')" role="tab">Créer un compte</button>
        </div>

        <!-- Formulaire -->
        <div class="auth-form" id="authFormZone">
          <div class="auth-field">
            <label for="authEmail">📧 Email</label>
            <input type="email" id="authEmail" placeholder="chef@patisserie.fr" class="auth-input" autocomplete="email">
          </div>
          <div class="auth-field">
            <label for="authPassword">🔑 Mot de passe</label>
            <input type="password" id="authPassword" placeholder="••••••••" class="auth-input" autocomplete="current-password">
            <button type="button" class="auth-pwd-toggle" onclick="AuthUI.togglePwd()" title="Afficher/masquer">👁</button>
          </div>
          <div id="authSignupFields" style="display:none;">
            <div class="auth-field">
              <label for="authFullName">👨‍🍳 Votre nom</label>
              <input type="text" id="authFullName" placeholder="Ex: Marie Dupont" class="auth-input" maxlength="100">
            </div>
            <div class="auth-field">
              <label for="authPasswordConfirm">🔑 Confirmer le mot de passe</label>
              <input type="password" id="authPasswordConfirm" placeholder="••••••••" class="auth-input">
            </div>
          </div>
          <div id="authError" class="auth-error" style="display:none;"></div>
          <button id="authSubmitBtn" class="auth-btn-primary" onclick="AuthUI.handleSubmit()">Se connecter</button>
          <div id="authForgotZone" class="auth-forgot">
            <button type="button" onclick="AuthUI.handleForgotPassword()">Mot de passe oublié ?</button>
          </div>
        </div>

        <p class="auth-legal-note">En continuant, vous acceptez nos <a href="./legal.html#cgu" target="_blank">CGU</a> et notre <a href="./legal.html#confidentialite" target="_blank">politique de confidentialité</a>.</p>

        <button onclick="document.getElementById('authModal').remove()" class="auth-close" aria-label="Fermer">✕</button>
      </div>
    `;

    document.body.appendChild(modal);

    // Fermeture en cliquant en dehors
    modal.addEventListener('click', (e) => {
      if (e.target === modal) modal.remove();
    });

    // Soumission par Enter
    modal.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') handleSubmit();
      if (e.key === 'Escape') modal.remove();
    });

    // Focus sur l'email
    setTimeout(() => document.getElementById('authEmail')?.focus(), 100);
  }

  // ── GESTION DES ONGLETS ──────────────────────────────────────────────────────
  function switchTab(tab) {
    const isSignup = tab === 'signup';
    document.getElementById('tabLogin') .classList.toggle('active', !isSignup);
    document.getElementById('tabSignup').classList.toggle('active',  isSignup);
    document.getElementById('authSignupFields').style.display = isSignup ? 'block' : 'none';
    document.getElementById('authForgotZone').style.display   = isSignup ? 'none'  : 'block';
    document.getElementById('authSubmitBtn').textContent      = isSignup ? 'Création désactivée 🔒' : 'Se connecter';
    document.getElementById('authModalTitle').textContent     = isSignup ? 'Accès Restreint' : 'Bienvenue Chef !';
    document.getElementById('authModalSubtitle').textContent  = isSignup ? 'Les inscriptions sont actuellement fermées. Souscrivez à un abonnement pour obtenir l\'accès.' : 'Connectez-vous pour synchroniser vos recettes.';
    document.getElementById('authError').style.display = 'none';
    document.getElementById('authSubmitBtn').dataset.tab = tab;
  }

  // ── SOUMISSION ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    // Rate limiting client-side
    if (GourmetSecurity && !GourmetSecurity.rateLimit('auth_submit', 2000)) {
      _showError('Veuillez patienter avant de réessayer.');
      return;
    }

    const btn    = document.getElementById('authSubmitBtn');
    const tab    = btn.dataset.tab || 'login';
    const email  = document.getElementById('authEmail')?.value.trim();
    const pwd    = document.getElementById('authPassword')?.value;

    // Validation des champs
    if (!email || !pwd) { _showError('Veuillez remplir tous les champs.'); return; }
    if (GourmetSecurity && !GourmetSecurity.validate('email', email)) { _showError('Adresse email invalide.'); return; }
    if (GourmetSecurity && !GourmetSecurity.validate('password', pwd)) { _showError('Le mot de passe doit contenir au moins 8 caractères.'); return; }

    btn.disabled = true;
    btn.textContent = '⏳ Chargement...';

    try {
      if (tab === 'signup') {
        _showError('🔒 Les inscriptions sont actuellement fermées. Contactez l\'administrateur ou souscrivez à un abonnement.');
        return;
      } else {
        await _handleLogin(email, pwd);
      }
    } finally {
      btn.disabled = false;
      btn.textContent = tab === 'signup' ? 'Créer mon compte 🚀' : 'Se connecter';
    }
  }

  async function _handleLogin(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.includes('Invalid login') ? 'Email ou mot de passe incorrect.' : error.message;
      _showError(msg);
    } else {
      const plan = await _checkSubscription(data.user);
      _currentPlan = plan;
      window.GOURMET_PLAN = plan;
      document.getElementById('authModal')?.remove();
      const greeting = plan === 'admin' ? '👑' : plan === 'pro' ? '⭐' : '🆓';
      if (typeof showToast === 'function') showToast(`${greeting} Bonjour ${data.user.email.split('@')[0]} ! Plan : ${plan.toUpperCase()}`, 'success');
    }
  }

  async function _handleSignUp(email, password) {
    const fullName = document.getElementById('authFullName')?.value.trim();
    const confirm  = document.getElementById('authPasswordConfirm')?.value;

    if (password !== confirm) { _showError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8)  { _showError('Le mot de passe doit faire au moins 8 caractères.'); return; }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName || email.split('@')[0] } }
    });

    if (error) {
      _showError(error.message);
    } else {
      document.getElementById('authModal')?.remove();
      _showConfirmationMessage(email);
    }
  }

  async function handleForgotPassword() {
    const email = document.getElementById('authEmail')?.value.trim();
    if (!email) { _showError('Entrez votre email pour recevoir le lien de réinitialisation.'); return; }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + window.location.pathname,
    });

    if (error) {
      _showError(error.message);
    } else {
      _showError('📬 Lien de réinitialisation envoyé ! Vérifiez votre boîte mail.', 'success');
    }
  }

  // ── AFFICHAGE ERREURS / SUCCÈS ───────────────────────────────────────────────
  function _showError(msg, type = 'error') {
    const el = document.getElementById('authError');
    if (!el) return;
    el.textContent = msg;
    el.style.display = 'block';
    el.className = type === 'success' ? 'auth-success' : 'auth-error';
  }

  function _showConfirmationMessage(email) {
    const overlay = document.createElement('div');
    overlay.className = 'glass-modal-overlay';
    overlay.innerHTML = `
      <div class="glass-modal-content" style="text-align:center;max-width:420px;">
        <div style="font-size:3rem;margin-bottom:1rem;">📬</div>
        <h2 style="color:white;margin-bottom:0.75rem;">Vérifiez votre email !</h2>
        <p style="color:rgba(255,255,255,0.6);margin-bottom:2rem;">Un lien de confirmation a été envoyé à <strong style="color:white;">${GourmetSecurity?.sanitize(email)||email}</strong>. Cliquez sur le lien pour activer votre compte.</p>
        <button onclick="this.closest('.glass-modal-overlay').remove()" class="auth-btn-primary">C'est noté !</button>
      </div>
    `;
    document.body.appendChild(overlay);
  }

  // ── MENU UTILISATEUR ────────────────────────────────────────────────────────
  function _showUserMenu() {
    if (document.getElementById('authUserMenu')) {
      document.getElementById('authUserMenu').remove();
      return;
    }
    const btn = document.getElementById('authMainBtn');
    const rect = btn.getBoundingClientRect();

    const menu = document.createElement('div');
    menu.id = 'authUserMenu';
    menu.className = 'auth-user-menu';
    menu.style.cssText = `position:fixed;top:${rect.bottom + 8}px;right:${window.innerWidth - rect.right}px;z-index:9999;`;
    let displayName = _currentUser?.user_metadata?.full_name || _currentUser?.email?.split('@')[0] || 'Chef';
    displayName = displayName.replace(/[\s-]*2503$/, '');

    menu.innerHTML = `
      <div class="auth-menu-header">
        <div class="auth-menu-avatar">👨‍🍳</div>
        <div>
          <div class="auth-menu-name">${GourmetSecurity?.sanitize(displayName) || 'Chef'}</div>
          <div class="auth-menu-email">${GourmetSecurity?.sanitize(_currentUser?.email || '') || ''}</div>
        </div>
      </div>
      <hr class="auth-menu-divider">
      <button onclick="AuthUI.replayOnboarding()" class="auth-menu-item" style="color:var(--primary, #10b981); font-weight:700;">✨ Relancer le guide</button>
      <button onclick="AuthUI.exportData()" class="auth-menu-item">📤 Exporter mes données</button>
      <button onclick="AuthUI.openLegal()" class="auth-menu-item">⚖️ Mentions légales</button>
      <hr class="auth-menu-divider">
      <button onclick="AuthUI.logout()" class="auth-menu-item auth-menu-danger">🚪 Se déconnecter</button>
    `;
    document.body.appendChild(menu);
    setTimeout(() => document.addEventListener('click', function close(e) {
      if (!menu.contains(e.target) && e.target !== btn) {
        menu.remove();
        document.removeEventListener('click', close);
      }
    }), 10);
  }

  // ── ACTIONS UTILISATEUR ─────────────────────────────────────────────────────
  async function logout() {
    document.getElementById('authUserMenu')?.remove();
    await supabase.auth.signOut();
    if (typeof showToast === 'function') showToast('👋 Déconnecté avec succès.', 'info');
  }

  function exportData() {
    document.getElementById('authUserMenu')?.remove();
    // Exporte les données localStorage comme JSON
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('gourmet')) data[key] = localStorage.getItem(key);
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `gourmetrevient-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click(); URL.revokeObjectURL(url);
    if (typeof showToast === 'function') showToast('📤 Export RGPD téléchargé !', 'success');
  }

  function openLegal() {
    document.getElementById('authUserMenu')?.remove();
    window.open('./legal.html', '_blank');
  }

  function replayOnboarding() {
    document.getElementById('authUserMenu')?.remove();
    if (window.GourmetOnboarding) {
      window.GourmetOnboarding.start();
    } else {
      if (typeof showToast === 'function') showToast('Le guide est en cours de chargement...', 'info');
    }
  }

  function getCurrentUser() { return _currentUser; }
  function getCurrentPlan() { return _currentPlan; }
  function isPro() { return _currentPlan === 'pro' || _currentPlan === 'admin'; }
  function isAdminUser() { return _currentPlan === 'admin'; }

  return { init, showModal, switchTab, handleSubmit, handleForgotPassword, logout, exportData, openLegal, togglePwd, replayOnboarding, getCurrentUser, getCurrentPlan, isPro, isAdminUser };

})();

window.AuthUI = AuthUI;
window.addEventListener('DOMContentLoaded', () => AuthUI.init());
