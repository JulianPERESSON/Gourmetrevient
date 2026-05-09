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
    
    // 1. Root Admin permanent
    if (email === ADMIN_EMAIL) return true;

    // 2. Liste blanche stricte (Emails uniquement)
    const STRICT_WHITELIST = [
      'ju2503@gmail.com', // Exemple d'email complet si besoin
      'ju 2503'           // Gardé temporairement pour vos tests si vous utilisez cet identifiant comme email
    ];

    return STRICT_WHITELIST.includes(email);
  }

  function isAdmin(user) {
    if (!user) return false;
    return user.email?.toLowerCase().trim() === ADMIN_EMAIL;
  }

  // ── VÉRIFICATION ABONNEMENT SUPABASE ────────────────────────────────────────
  async function _checkSubscription(user) {
    if (!user) return 'free';
    if (isAdmin(user)) return 'admin';
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('plan, subscription_status')
        .eq('id', user.id)
        .single();
      if (error || !data) return 'free';
      return data.plan || 'free';
    } catch(e) { return 'free'; }
  }

  function checkPlan(feature) {
    const plan = _currentPlan;
    if (plan === 'admin' || plan === 'pro' || plan === 'labo') return true;
    
    const freeFeatures = ['base_calc'];
    if (freeFeatures.includes(feature)) return true;

    // Feature gating
    const limits = {
        'pdf_export': 3, // exemple
        'max_recipes': 5
    };

    if (feature === 'pro_tools' || feature === 'haccp_full' || feature === 'crm' || feature === 'planning_full') {
        _showUpgradeModal();
        return false;
    }
    return true;
  }

  function _showUpgradeModal() {
    if (typeof showToast === 'function') {
        showToast('✨ Cette fonctionnalité est réservée aux membres Pro. <a href="#" onclick="GourmetBilling.checkout(\'pro_monthly\')">Passer Pro</a>', 'info');
    }
  }

  // ── INIT ─────────────────────────────────────────────────────────────────────
  async function init() {
    console.log('🔐 AuthUI : Initialisation...');

    gourmetSupabase.auth.onAuthStateChange(async (event, session) => {
      _currentUser = session?.user || null;

      // Autorisation : Admin ou tout utilisateur avec un abonnement valide
      // (La vérification du plan se fait juste après)
      if (_currentUser) {
        console.info('🔐 Utilisateur détecté :', _currentUser.email);
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
    const { data: { session } } = await gourmetSupabase.auth.getSession();
    _currentUser = session?.user || null;

    // Support du mode démo (si pas de session réelle)
    if (!_currentUser && localStorage.getItem('gourmet_demo_mode') === 'true') {
      console.info('🚀 Mode Démo actif');
      _currentPlan = 'pro';
      window.GOURMET_PLAN = 'pro';
      _currentUser = { 
        id: 'demo-user', 
        email: 'demo@gourmetrevient.fr', 
        user_metadata: { full_name: 'Visiteur Chef' } 
      };
    }
    
    if (_currentUser) {
      if (_currentUser.id !== 'demo-user') {
        _currentPlan = await _checkSubscription(_currentUser);
      }
      window.GOURMET_PLAN = _currentPlan;
    }

    _renderButton();
    _updateUI(_currentUser);

    // Ouverture automatique du modal si demandé par l'URL (Inscription)
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('tab') === 'signup' && !_currentUser) {
      setTimeout(() => showModal('signup'), 500);
    }
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
      const isDemo = user.id === 'demo-user';
      let name = user.user_metadata?.full_name || user.email.split('@')[0];
      
      // Nettoyage spécial pour l'admin : forcer "Ju"
      if (isAdmin(user)) {
         name = 'Ju';
         if(typeof showToast === 'function') showToast('Supabase: Admin reconnu', 'success');
      } else {
         if (!isDemo && typeof showToast === 'function') showToast('Supabase: Connecté', 'info');
         // Prendre uniquement le prénom
         name = name.split(' ')[0];
         name = name.replace(/[\s-]*2503$/, '');
      }

      if (isDemo) name += ' (Démo)';

      btn.className = 'auth-nav-btn auth-nav-btn--logged';
      btn.innerHTML = `<span class="auth-btn-icon">👨‍🍳</span><span class="auth-btn-label">${GourmetSecurity?.sanitize(name) || name}</span>`;
      btn.onclick = _showUserMenu;

      // Style spécial pour le bouton Pro si l'utilisateur est déjà abonné
      const manualOverlay = document.getElementById('authManualOverlay');
      if (manualOverlay) manualOverlay.style.display = 'none';
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

      // Synchronise l'identité avec le système multi-chef et le localStorage legacy
      localStorage.setItem('gourmet_auth', 'true');
      localStorage.setItem('gourmet_current_user', name);
      
      if (typeof window.currentUser !== 'undefined') {
        window.currentUser = name;
      }

      // Mise à jour des champs legacy dans le DOM
      const headerName = document.getElementById('userNameHeader');
      if (headerName) headerName.textContent = name;
      
      const welcomeName = document.getElementById('welcomeUserName');
      if (welcomeName) welcomeName.textContent = name;

      const hAvatar = document.getElementById('headerAvatar');
      const dAvatar = document.getElementById('dashAvatar');
      if (hAvatar) hAvatar.textContent = '👨‍🍳';
      if (dAvatar) dAvatar.textContent = '👨‍🍳';

      // Force la mise à jour du dashboard global si disponible
      if (typeof updateDashboard === 'function') {
        updateDashboard();
      }
    } else {
      if(typeof showToast === 'function') showToast('Supabase: AUCUNE session trouvée', 'warning');
      btn.className = 'auth-nav-btn auth-nav-btn--guest';
      btn.innerHTML = '<span class="auth-btn-icon">👤</span><span class="auth-btn-label">Connexion</span>';
      btn.onclick = showModal;

      if (proBtn) proBtn.style.display = 'flex';
      
      // Nettoyage legacy en cas de déconnexion UNIQUEMENT si ce n'est pas un admin legacy
      const legacyUser = localStorage.getItem('gourmet_current_user') || '';
      const isLegacyAdmin = ['ju 2503', 'ju', 'julian31.peresson@gmail.com', 'julian31.peresson'].includes(legacyUser.toLowerCase());
      
      if (!isLegacyAdmin) {
        localStorage.removeItem('gourmet_auth');
        localStorage.removeItem('gourmet_current_user');
      }
      
      // Force la mise à jour pour refléter l'état
      if (typeof updateDashboard === 'function') {
        updateDashboard();
      }
    }
  }

  // ── MODAL PRINCIPALE ─────────────────────────────────────────────────────────
  function showModal(tab = 'login') {
    // Si on ouvre le vrai modal, on cache l'overlay de bienvenue
    const manualOverlay = document.getElementById('authManualOverlay');
    if (manualOverlay) manualOverlay.style.display = 'none';

    if (document.getElementById('authModal')) return;

    const modal = document.createElement('div');
    modal.id = 'authModal';
    modal.className = 'glass-modal-overlay';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Connexion à GourmetRevient');

    modal.innerHTML = `
      <div class="auth-modal-box">

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
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
              <div class="auth-field">
                <label for="authFirstName">👤 Prénom</label>
                <input type="text" id="authFirstName" placeholder="Marie" class="auth-input">
              </div>
              <div class="auth-field">
                <label for="authLastName">👤 Nom</label>
                <input type="text" id="authLastName" placeholder="Dupont" class="auth-input">
              </div>
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
    document.getElementById('authSubmitBtn').textContent      = isSignup ? 'S\'inscrire & S\'abonner 🚀' : 'Se connecter';
    document.getElementById('authModalTitle').textContent     = isSignup ? 'Rejoindre l\'Atelier' : 'Bienvenue Chef !';
    document.getElementById('authModalSubtitle').textContent  = isSignup ? 'Commencez vos 14 jours d\'essai gratuit dès maintenant.' : 'Connectez-vous pour synchroniser vos recettes.';
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
        await _handleSignUp(email, pwd);
      } else {
        await _handleLogin(email, pwd);
      }
    } finally {
      btn.disabled = false;
      btn.textContent = tab === 'signup' ? 'Créer mon compte 🚀' : 'Se connecter';
    }
  }

  async function _handleLogin(email, password) {
    const { data, error } = await gourmetSupabase.auth.signInWithPassword({ email, password });
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
    const firstName = document.getElementById('authFirstName')?.value.trim();
    const lastName = document.getElementById('authLastName')?.value.trim();
    const confirm  = document.getElementById('authPasswordConfirm')?.value;

    if (!firstName || !lastName) { _showError('Veuillez renseigner votre prénom et votre nom.'); return; }
    
    // Validation email stricte pour éviter les "Bounces" Supabase
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { _showError('Veuillez entrer une adresse email valide.'); return; }
    if (password !== confirm) { _showError('Les mots de passe ne correspondent pas.'); return; }
    if (password.length < 8)  { _showError('Le mot de passe doit faire au moins 8 caractères.'); return; }

    const { data, error } = await gourmetSupabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          first_name: firstName,
          last_name: lastName,
          full_name: `${firstName} ${lastName}`
        } 
      }
    });

    if (error) {
      _showError(error.message);
    } else {
      if (typeof showToast === 'function') showToast('Compte créé ! Redirection vers le paiement... 💳', 'success');
      
      // On attend un court instant pour laisser Supabase traiter l'inscription
      setTimeout(async () => {
        if (window.GourmetBilling) {
          // On redirige vers Stripe pour le plan Pro (avec essai 14j configuré sur Stripe)
          // On passe l'email pour pré-remplir le formulaire Stripe
          await window.GourmetBilling.checkout('pro_monthly', email);
        } else {
          document.getElementById('authModal')?.remove();
          _showConfirmationMessage(email);
        }
      }, 1500);
    }
  }

  async function handleForgotPassword() {
    const email = document.getElementById('authEmail')?.value.trim();
    if (!email) { _showError('Entrez votre email pour recevoir le lien de réinitialisation.'); return; }

    const { error } = await gourmetSupabase.auth.resetPasswordForEmail(email, {
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

    const isDemo = _currentUser?.id === 'demo-user';

    menu.innerHTML = `
      <div class="auth-menu-header">
        <div class="auth-menu-avatar">👨‍🍳</div>
        <div>
          <div class="auth-menu-name">${GourmetSecurity?.sanitize(displayName) || 'Chef'} ${isDemo ? '<span style="font-size:0.7rem; color:var(--accent); font-weight:800;">DÉMO</span>' : ''}</div>
          <div class="auth-menu-email">${GourmetSecurity?.sanitize(_currentUser?.email || '') || ''}</div>
        </div>
      </div>
      <hr class="auth-menu-divider">
      <div class="auth-menu-item" style="display:flex; justify-content:space-between; align-items:center;">
        <span>Mode Démo</span>
        <label class="switch">
          <input type="checkbox" id="demoToggle" ${localStorage.getItem('gourmet_demo_mode') === 'true' ? 'checked' : ''} onchange="AuthUI.toggleDemoMode(this.checked)">
          <span class="slider round"></span>
        </label>
      </div>
      <button onclick="AuthUI.resetUserData()" class="auth-menu-item" style="color:var(--accent);">🗑️ Vider mes données</button>
      <hr class="auth-menu-divider">
      <button onclick="AuthUI.replayOnboarding()" class="auth-menu-item" style="color:var(--primary, #10b981); font-weight:700;">✨ Relancer le guide</button>
      <button onclick="AuthUI.exportData()" class="auth-menu-item">📤 Exporter mes données</button>
      ${!isDemo ? `<button onclick="GourmetBilling.openCustomerPortal()" class="auth-menu-item">💳 Mon abonnement</button>` : ''}
      <button onclick="AuthUI.openLegal()" class="auth-menu-item">⚖️ Mentions légales</button>
      <hr class="auth-menu-divider">
      ${isDemo ? 
        `<button onclick="AuthUI.quitDemo()" class="auth-menu-item" style="color:var(--accent); font-weight:700;">🚪 Quitter le mode Démo</button>` : 
        `<button onclick="AuthUI.logout()" class="auth-menu-item auth-menu-danger">🚪 Se déconnecter</button>`
      }
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
    localStorage.removeItem('gourmet_demo_mode');
    await gourmetSupabase.auth.signOut();
    if (typeof showToast === 'function') showToast('👋 Déconnecté avec succès.', 'info');
  }

  function quitDemo() {
    document.getElementById('authUserMenu')?.remove();
    localStorage.removeItem('gourmet_demo_mode');
    localStorage.removeItem('gourmet_current_user');
    window.location.href = 'landing.html';
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

  function toggleDemoMode(enabled) {
    localStorage.setItem('gourmet_demo_mode', enabled ? 'true' : 'false');
    if (typeof showToast === 'function') showToast(enabled ? 'Mode Démo activé 🎭' : 'Mode Réel activé (Données Cloud) ☁️', 'info');
    setTimeout(() => window.location.reload(), 1000);
  }

  function handleResetClick(btn) {
    if (!btn.dataset.confirmed) {
      // Premier clic : Demander confirmation
      btn.dataset.confirmed = "true";
      btn.style.background = "#ef4444";
      btn.style.color = "#ffffff";
      btn.innerHTML = "⚠️ CONFIRMER LA SUPPRESSION";
      
      // Reset le bouton après 5 secondes si pas de 2ème clic
      setTimeout(() => {
        if (btn.dataset.confirmed === "true") {
          delete btn.dataset.confirmed;
          btn.style.background = "transparent";
          btn.style.color = "#ef4444";
          btn.innerHTML = "🗑️ Vider mes données";
        }
      }, 5000);
    } else {
      // Deuxième clic : Exécuter le reset
      btn.disabled = true;
      btn.innerHTML = "⏳ Nettoyage en cours...";
      resetUserData();
    }
  }

  async function resetUserData() {
    console.warn("🚀 Lancement du reset complet des données...");
    try {
      if (typeof GourmetSync !== 'undefined' && GourmetSync.resetUserData) {
          // Note: On ne passe pas par confirm() ici car déjà géré par le bouton
          await GourmetSync.resetUserData(true); 
      } else {
          // Fallback si GourmetSync est absent
          localStorage.clear();
          window.location.reload();
      }
    } catch (err) {
      console.error("Erreur Reset:", err);
      localStorage.clear();
      window.location.reload();
    }
  }

  function replayOnboarding() {
    document.getElementById('authUserMenu')?.remove();
    if (window.GourmetOnboarding) {
      window.GourmetOnboarding.start();
    } else {
      if (typeof showToast === 'function') showToast('Le guide est en cours de chargement...', 'info');
    }
  }

  function getCurrentUser() { 
    if (_currentUser) return _currentUser;
    // Support du Pass Admin local
    if (localStorage.getItem('gourmet_auth') === 'true' && localStorage.getItem('gourmet_current_user') === 'Ju 2503') {
      return { email: 'julian31.peresson@gmail.com', user_metadata: { full_name: 'Julian Peresson' } };
    }
    return null; 
  }
  function getCurrentPlan() { return _currentPlan; }
  function isPro() { return _currentPlan === 'pro' || _currentPlan === 'admin'; }
  function isAdminUser() { return _currentPlan === 'admin'; }

  // ── GESTION MANUELLE (Fallback Sécurité) ──────────────────────────────────
  async function handleSubmitManual() {
    const btn = document.querySelector('#authManualOverlay .auth-btn-primary');
    const email = document.getElementById('authEmailManual')?.value;
    const password = document.getElementById('authPasswordManual')?.value;
    const errorZone = document.getElementById('authErrorManual');

    if (!email || !password) {
      if (errorZone) { errorZone.textContent = 'Veuillez remplir tous les champs.'; errorZone.style.display = 'block'; }
      return;
    }

    if (btn) { 
      btn.disabled = true; 
      btn.textContent = 'Connexion en cours...';
      btn.style.opacity = '0.7';
    }

    const { data, error } = await gourmetSupabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (errorZone) { errorZone.textContent = 'Erreur : ' + error.message; errorZone.style.display = 'block'; }
      if (btn) { btn.disabled = false; btn.textContent = 'Se connecter'; btn.style.opacity = '1'; }
    } else {
       // Succès
       const manualOverlay = document.getElementById('authManualOverlay');
       if (manualOverlay) manualOverlay.style.display = 'none';
       document.body.classList.remove('auth-pending');
       if (typeof window.checkAuth === 'function') window.checkAuth();
    }
  }

  return { 
    init, 
    showModal, 
    switchTab, 
    handleSubmit, 
    handleSubmitManual, 
    handleForgotPassword, 
    logout, 
    quitDemo, 
    exportData, 
    openLegal, 
    togglePwd, 
    replayOnboarding, 
    getCurrentUser, 
    getCurrentPlan, 
    isPro, 
    isAdminUser, 
    checkPlan, 
    toggleDemoMode, 
    resetUserData, 
    handleResetClick 
  };

})();

window.AuthUI = AuthUI;
window.addEventListener('DOMContentLoaded', () => AuthUI.init());
