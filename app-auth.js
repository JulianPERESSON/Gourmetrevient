// AUTHENTICATION
// ============================================================================
// ============================================================================
// AUTHENTICATION — Bridged to AuthUI.js (Supabase)
// ============================================================================

async function showSubscriptionRequiredOverlay(email) {
  let overlay = document.getElementById('stripeSubscriptionRequiredOverlay');
  if (overlay) return;

  overlay = document.createElement('div');
  overlay.id = 'stripeSubscriptionRequiredOverlay';
  overlay.className = 'glass-modal-overlay';
  overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.85); backdrop-filter:blur(16px); z-index:99999; display:flex; justify-content:center; align-items:center; color:#fff; font-family:Inter, sans-serif;';
  
  // State: Loading initially
  overlay.innerHTML = `
    <div style="background:var(--surface, #1e293b); border:1px solid var(--border, #334155); border-radius:24px; padding:3rem; max-width:480px; width:90%; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.5rem;">
      <div class="spinner-premium" style="width:40px; height:40px; border:3px solid rgba(99,102,241,0.2); border-top-color:#6366f1; border-radius:50%; animation:spin 1s linear infinite;"></div>
      <p style="color:#94a3b8; font-size:0.95rem;">Vérification du statut de l'abonnement...</p>
    </div>
  `;
  document.body.appendChild(overlay);

  // Masquer les conteneurs de l'app
  ['mainNav', 'mobileNavBar', 'appMain', 'hubSection'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  // Fetch true status
  let subStatus = { plan: 'free', status: 'inactive', subscription_active: false, has_subscription: false };
  try {
    if (window.GourmetBilling && typeof window.GourmetBilling.checkSubscriptionStatus === 'function') {
      subStatus = await Promise.race([
        window.GourmetBilling.checkSubscriptionStatus(),
        new Promise((resolve) => setTimeout(() => resolve(subStatus), 10000))
      ]);
    }
  } catch (err) {
    console.error('Error fetching subscription status in overlay:', err);
  }

  const hasSub = subStatus.has_subscription;
  const isTrialExpired = hasSub && !subStatus.subscription_active;

  let title = "Abonnement requis";
  let description = "Bienvenue ! GourmetRevient est un outil professionnel. Pour accéder à votre laboratoire et commencer vos calculs, veuillez activer votre abonnement Pro Chef.";
  let priceBadgeTitle = "👨‍🍳 Offre Pro Chef";
  let priceBadgeText = "29,99 € <span style=\"font-size:0.9rem; font-weight:400; color:#94a3b8;\">/ mois HT</span>";
  let buttonText = "Commencer l'essai gratuit (14 jours)";
  let buttonAction = `GourmetBilling.checkout('pro_monthly', '${email}')`;

  if (isTrialExpired) {
    title = "Votre essai a expiré";
    description = "Votre période d'essai gratuit de 14 jours ou votre abonnement a expiré. Pour retrouver l'accès à vos fiches techniques, vos stocks et votre outil HACCP, veuillez activer votre abonnement Pro Chef en ajoutant un moyen de paiement.";
    priceBadgeTitle = "👨‍🍳 Statut de l'abonnement";
    priceBadgeText = "Essai / Abonnement Expiré";
    buttonText = "Activer mon abonnement Pro Chef";
    buttonAction = `GourmetBilling.openCustomerPortal()`;
  }

  overlay.innerHTML = `
    <div style="background:var(--surface, #1e293b); border:1px solid var(--border, #334155); border-radius:24px; padding:3rem; max-width:480px; width:90%; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
      <div style="font-size:3rem; margin-bottom:1.5rem;">🧁</div>
      <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:1rem; color:#fff;">${title}</h2>
      <p style="color:#94a3b8; font-size:0.95rem; margin-bottom:2rem; line-height:1.5;">
        ${description}
      </p>
      
      <div style="background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3); border-radius:16px; padding:1.25rem; margin-bottom:2rem;">
        <div style="font-weight:700; font-size:1.1rem; color:#818cf8; margin-bottom:4px;">${priceBadgeTitle}</div>
        <div style="font-size:1.5rem; font-weight:900; color:#fff;">${priceBadgeText}</div>
        ${!isTrialExpired ? `<div style="font-size:0.8rem; color:#a5b4fc; margin-top:6px; font-weight:600;">14 jours d'essai gratuits · Sans engagement</div>` : `<div style="font-size:0.8rem; color:#f87171; margin-top:6px; font-weight:600;">Accès restreint aux fonctionnalités</div>`}
      </div>
      
      <button class="btn btn-primary" onclick="${buttonAction}" style="width:100%; padding:1rem; font-size:1.1rem; font-weight:700; border-radius:12px; background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; cursor:pointer; margin-bottom:1rem; box-shadow:0 10px 20px -5px rgba(99,102,241,0.4);">
        ${buttonText}
      </button>
      
      <button id="authOverlayLogoutBtn" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:0.9rem; text-decoration:underline;">
        Se déconnecter
      </button>
    </div>
  `;

  const logoutBtn = document.getElementById('authOverlayLogoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (window.AuthUI && typeof window.AuthUI.logout === 'function') {
        window.AuthUI.logout();
      } else {
        localStorage.removeItem('gourmet_auth');
        location.reload();
      }
    });
  }
}

function removeSubscriptionRequiredOverlay() {
  const overlay = document.getElementById('stripeSubscriptionRequiredOverlay');
  if (overlay) overlay.remove();
}

function showTrialCountdownBanner(daysLeft) {
  let banner = document.getElementById('trialCountdownBanner');
  if (!banner) {
    banner = document.createElement('div');
    banner.id = 'trialCountdownBanner';
    banner.style.cssText = `
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 9999;
      background: rgba(30, 41, 59, 0.85);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: 9999px;
      padding: 10px 24px;
      display: flex;
      align-items: center;
      gap: 16px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(99, 102, 241, 0.1);
      font-family: Inter, sans-serif;
      font-size: 0.9rem;
      color: #fff;
      transition: all 0.3s ease;
    `;
    document.body.appendChild(banner);
  }

  banner.innerHTML = `
    <span style="display: flex; align-items: center; gap: 8px;">
      <span style="font-size: 1.1rem;">⏳</span>
      <span>Il vous reste <strong style="color: #a5b4fc;">${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong> d'essai gratuit</span>
    </span>
    <button onclick="GourmetBilling.openCustomerPortal()" style="
      background: linear-gradient(135deg, #6366f1, #4f46e5);
      color: #fff;
      border: none;
      border-radius: 9999px;
      padding: 6px 16px;
      font-size: 0.8rem;
      font-weight: 700;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
      transition: all 0.2s ease;
    " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
      S'abonner
    </button>
  `;
}

function removeTrialCountdownBanner() {
  const banner = document.getElementById('trialCountdownBanner');
  if (banner) banner.remove();
}

function checkAuth() {
  const user = window.AuthUI?.getCurrentUser();

  if (user) {
    // Vérifier l'abonnement
    const isProOrAdmin = window.AuthUI && typeof window.AuthUI.isPro === 'function' ? window.AuthUI.isPro() : false;

    if (!isProOrAdmin) {
      console.info('🔒 Abonnement requis. Accès bloqué.');
      showSubscriptionRequiredOverlay(user.email);
      return;
    }

    removeSubscriptionRequiredOverlay();
    console.info('🔓 Authentification confirmée, déverrouillage de l\'interface...');

    // Vérification asynchrone complète et en temps réel de l'abonnement
    (async () => {
      try {
        if (window.GourmetBilling && typeof window.GourmetBilling.checkSubscriptionStatus === 'function') {
          const subStatus = await window.GourmetBilling.checkSubscriptionStatus();
          
          // Sécurité renforcée : Si pas admin et abonnement non actif, on bloque l'accès immédiatement
          if (!subStatus.subscription_active) {
            console.info('🔒 Abonnement expiré ou invalide détecté en arrière-plan. Blocage immédiat.');
            showSubscriptionRequiredOverlay(user.email);
            removeTrialCountdownBanner();
            return;
          }

          if (subStatus.status === 'trialing' && subStatus.trial_end) {
            const trialEndMs = new Date(subStatus.trial_end).getTime();
            const nowMs = Date.now();
            const diffMs = trialEndMs - nowMs;
            if (diffMs > 0) {
              const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
              showTrialCountdownBanner(daysLeft);
            } else {
              removeTrialCountdownBanner();
            }
          } else {
            removeTrialCountdownBanner();
          }
        }
      } catch (err) {
        console.error('Error handling subscription validation:', err);
      }
    })();
    const wasPending = document.body.classList.contains('auth-pending');
    document.body.classList.remove('auth-pending');

    // On s'assure que le menu et la zone utilisateur sont visibles dès qu'on est logué
    const isMobile = window.innerWidth <= 768;
    ['mainNav', 'mobileNavBar', 'userProfileArea', 'headerBrand', 'appMain'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === 'mobileNavBar') {
          el.style.setProperty('display', isMobile ? 'flex' : 'none', 'important');
        } else if (id === 'mainNav') {
          el.style.setProperty('display', isMobile ? 'none' : 'flex', 'important');
        } else {
          const displayType = (id === 'appMain') ? 'block' : 'flex';
          el.style.setProperty('display', displayType, 'important');
        }
      }
    });

    // On ne force l'affichage du Hub que si on vient de déverrouiller l'app
    // ET qu'aucune autre vue n'est déjà active (évite le téléportage)
    if (wasPending) {
      const isAnyAppVisible = [
        'appRecettes', 'appMgmt', 'appInventaire', 'appCRM', 'planningSection', 
        'appLaboratoire', 'appPortfolio', 'appHygiene', 'appScheduler', 'appAdmin'
      ].some(id => {
        const el = document.getElementById(id);
        if (!el) return false;
        const display = window.getComputedStyle(el).display;
        return display !== 'none';
      });

      if (!isAnyAppVisible) {
        const hub = document.getElementById('hubSection');
        if (hub) {
          hub.style.display = 'block';
          hub.classList.add('active');
        }
        if (typeof showHub === 'function') showHub();
      }
    }

    // Cache l'overlay si présent
    const overlay = document.getElementById('authManualOverlay');
    if (overlay) overlay.style.display = 'none';

    updateDashboard();
    loadSavedRecipes();
  } else {
    document.body.classList.add('auth-pending');
  }
}

function loginSuccess(user) {
  // Cette fonction est conservée pour la compatibilité avec les anciens modules
  // mais la session réelle est gérée par Supabase
  localStorage.setItem('gourmet_auth', 'true');
  location.reload();
}

function updateDashboard() {
  const name = localStorage.getItem(STORAGE_KEYS.currentUser) || 'Artisan';
  const displayName = name.replace(/[\s-]*2503.*$/i, '');
  let usersDb = {};
  try {
    usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  } catch(e) {
    console.error('Error parsing usersDb', e);
  }
  const userKey = name.toLowerCase();
  const userData = usersDb[userKey] || {};
  const gender = userData.gender || 'male';

  const welcome = $('#welcomeUserName');
  if (welcome) welcome.textContent = displayName;
  const headerName = $('#userNameHeader');
  if (headerName) headerName.textContent = displayName;

  // Bridge to the premium dashboard if available
  if (typeof hydratePremiumDashboard === 'function') {
    hydratePremiumDashboard();
  }

  const greeting = $('.dash-greeting');
  if (greeting) {
    const greetingText = t('dash.greeting');
    // For the new structure we might have multiple greeting elements or different structure
    // We target specifically the one with the id or class if needed.
  }

  const emoji = $('#welcomeGenderEmoji');
  const label = $('#userGenderLabel');
  const avatar = $('#dashUserAvatar');
  const hAvatar = $('#headerAvatar');

  if (gender === 'female') {
    if (emoji) emoji.textContent = '👩‍🍳';
    if (avatar) avatar.textContent = '👩‍🍳';
    if (hAvatar) hAvatar.textContent = '👩‍🍳';
  } else {
    if (emoji) emoji.textContent = '👨‍🍳';
    if (avatar) avatar.textContent = '👨‍🍳';
    if (hAvatar) hAvatar.textContent = '👨‍🍳';
  }
  const navAdmin = $('#navAdmin');
  if (navAdmin) {
    navAdmin.style.display = window.AuthUI?.isAdminUser?.() ? 'block' : 'none';
  }

  // 1. Update Date
  const locale = (typeof getLang === 'function') ? (getLang() === 'en' ? 'en-GB' : (getLang() === 'es' ? 'es-ES' : 'fr-FR')) : 'fr-FR';
  const dateEl = $('#dashDateHeader');
  if (dateEl) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(locale, options);
  }

  // 2. Update Stats
  const recipeCount = APP.savedRecipes.length;
  if ($('#statRecipeCount')) $('#statRecipeCount').textContent = recipeCount;

  const teamCount = APP.teamMembers.length;
  if ($('#statTeamCount')) $('#statTeamCount').textContent = teamCount;

  const ingInDb = typeof DEFAULT_INGREDIENT_DB !== 'undefined' ? DEFAULT_INGREDIENT_DB.length : 0;
  if ($('#statIngCount')) $('#statIngCount').textContent = ingInDb;

  // Inventory Stats for App Hub
  const lowStockCount = APP.inventory.filter(item => item.stock <= item.alertThreshold).length;
  const priceAlertCount = APP.inventory.filter(item => {
    if (!item.priceHistory || item.priceHistory.length < 2) return false;
    const last = item.priceHistory[item.priceHistory.length - 1];
    return parseFloat(last.change) > 1; // Only up trends
  }).length;
  if (invTotalItems) invTotalItems.textContent = APP.inventory.length;
  if (invLowStock) invLowStock.textContent = lowStockCount;
  if (invPriceAlerts) invPriceAlerts.textContent = priceAlertCount;

  // 4. Populate Recent Recipes (Modern Style)
  const recentList = $('#dashRecentRecipes');
  if (recentList) {
    const recent = [...APP.savedRecipes].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)).slice(0, 4);

    if (recent.length === 0) {
      recentList.innerHTML = `
        <div class="empty-state" style="padding:1rem; color:var(--text-muted); text-align:center;">
          <p>${t('dash.no_recent')}</p>
        </div>`;
    } else {
      recentList.innerHTML = recent.map(r => {
        const totalCost = r.ingredients.reduce((s, i) => s + (i.pricePerUnit * (i.unit === 'g' || i.unit === 'ml' ? i.quantity / 1000 : i.quantity)), 0);
        return `
          <div class="recent-item-premium" onclick="loadRecipe('${r.id}'); document.getElementById('navRecettes').click();">
            <div class="ri-info">
              <strong style="display:block; font-size:0.95rem;">${escapeHtml(r.name)}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(r.category || 'Pâtisserie')}</span>
            </div>
            <div class="ri-price" style="font-weight:700; color:var(--accent);">${totalCost.toFixed(2)} €</div>
          </div>
        `;
      }).join('');
    }
  }

  // 5. New Premium Widgets
  renderFeaturedRecipe();
  renderTodayTeam();
  renderPendingLeavesDashboard();
}

let currentFeaturedRecipe = null;
function renderFeaturedRecipe() {
  const container = $('#featuredRecipeContent');
  if (!container) return;

  if (!currentFeaturedRecipe && typeof RECIPES !== 'undefined' && RECIPES.length > 0) {
    const idx = Math.floor(Math.random() * RECIPES.length);
    currentFeaturedRecipe = { ...RECIPES[idx], libIdx: idx };
  }

  if (!currentFeaturedRecipe) {
    container.innerHTML = `<p>${t('dash.featured.empty')}</p>`;
    return;
  }

  const r = currentFeaturedRecipe;
  container.innerHTML = `
    <img src="${r.image}" class="featured-img" alt="${r.name}" onerror="this.src='https://placehold.co/200x200?text=${escapeHtml(r.name).replace(/ /g, '+')}'; this.classList.add('error');">
    <div class="featured-info">
      <h4>${escapeHtml(r.name)}</h4>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.4;">${escapeHtml(r.description)}</p>
      <div class="featured-meta">
        <span style="display:flex; align-items:center; gap:4px;">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
           ${r.prepTime + r.cookTime} min
        </span>
        <span style="display:flex; align-items:center; gap:4px;">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
           ${r.portions} portions
        </span>
      </div>
      <button class="btn btn-sm btn-outline" style="margin-top:1rem;" onclick="loadExampleRecipe(${r.libIdx}); document.getElementById('navRecettes').click();">${t('ui.btn.view_sheet')}</button>
    </div>
  `;
}

function renderTodayTeam() {
  const container = $('#todayTeamList');
  if (!container) return;

  if (APP.teamMembers.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">${t('plan.team.no_members')}</p>`;
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const presentMembers = APP.teamMembers.filter(m => {
    const isOnLeave = APP.staffLeaves.some(l =>
      l.memberId === m.id &&
      l.status === 'approved' &&
      today >= l.start && today <= l.end
    );
    return !isOnLeave;
  });

  if (presentMembers.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--danger); font-weight:700;">${t('dash.team.no_present')}</p>`;
    return;
  }

  container.innerHTML = presentMembers.map(m => {
    const c = getMemberColor(m.id);
    return `
      <div class="today-member" style="border-left: 3px solid ${c.dot}; background:rgba(255,255,255,0.5); border-radius:8px; margin-bottom:4px;">
        <span class="member-dot" style="background:${c.dot}; margin-left:8px;"></span>
        <div class="member-info">
          <strong style="font-size:0.95rem;">${capitalizeFirstLetter(m.name)}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(m.role)}</span>
        </div>
        <div class="presence-indicator" style="margin-left:auto; width:8px; height:8px; background:var(--success); border-radius:50%; margin-right:12px;"></div>
      </div>
    `;
  }).join('');
}
// ============================================================================
// CHEF TIPS SYSTEM
// ============================================================================

let lastTipIndex = -1;
function updateRandomTip() {
  const tipTextEl = $('#dashTipBody');
  if (!tipTextEl) return;

  const count = 11; // Number of tips available in i18n (tip.1 to tip.11)
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * count) + 1;
  } while (newIndex === lastTipIndex);

  lastTipIndex = newIndex;

  // Flash animation
  tipTextEl.style.transition = 'none';
  tipTextEl.style.opacity = '0';

  setTimeout(() => {
    tipTextEl.innerHTML = `<strong>${t('dash.tip_prefix')}</strong> ${t('tip.' + newIndex)}`;
    tipTextEl.style.transition = 'opacity 0.5s ease-in-out';
    tipTextEl.style.opacity = '1';
  }, 300);
}

// ============================================================================
// PROFILE & PIN CHANGE
// ============================================================================

function toggleProfileDropdown() {
  $('#profileDropdown').classList.toggle('show');
}

function showPinModal() {
  window.openModal('pinModal');
  $('#profileDropdown').classList.remove('show');

  const user = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!user) return;

  const userKey = user.toLowerCase();
  let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const userData = usersDb[userKey] || {};
  const gender = userData.gender || 'male';
  const email = userData.email || '';
  const role = userData.role || 'Chef de Labo';

  $('#profileEmail').value = email;
  $('#profileRole').value = role;

  $$('.gender-btn-profile').forEach(btn => {
    if (btn.dataset.gender === gender) {
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline');
    } else {
      btn.classList.remove('active', 'btn-primary');
      btn.classList.add('btn-outline');
    }
  });

  // Sync demo mode toggle
  const demoToggleModal = $('#demoToggleModal');
  if (demoToggleModal) {
      demoToggleModal.checked = (localStorage.getItem('gourmet_demo_mode') === 'true');
  }
}

function hidePinModal() {
  window.closeModal('pinModal');
}

function saveNewProfile() {
  const pin1 = $('#newPin').value;
  const pin2 = $('#confirmPin').value;
  const user = localStorage.getItem(STORAGE_KEYS.currentUser);
  const activeGenderBtn = document.querySelector('.gender-btn-profile.active');
  const gender = activeGenderBtn ? activeGenderBtn.dataset.gender : null;

  const email = $('#profileEmail').value;

  let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const userKey = user.toLowerCase();

  // Ensure user entry exists
  if (!usersDb[userKey]) usersDb[userKey] = {};

  if (pin1) {
    if (!GourmetSecurity.validate('password', pin1)) {
      showToast(t('toast.pin.short'), 'error');
      return;
    }
    if (pin1 !== pin2) {
      showToast(t('toast.pin.mismatch'), 'error');
      return;
    }
    usersDb[userKey].password = pin1;
    // On garde .pin pour la compatibilité avec d'anciens systèmes si nécessaire, 
    // mais on privilégie désormais .password
    usersDb[userKey].pin = pin1; 
  }

  // Persist gender, email, and role
  usersDb[userKey].gender = gender || usersDb[userKey].gender || 'male';
  usersDb[userKey].email = email;
  usersDb[userKey].role = $('#profileRole').value;

  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb)); if (window.GourmetCloud && window.GourmetCloud.syncUsersToCloud) GourmetCloud.syncUsersToCloud();
  showToast(t('toast.profile.updated'), 'success');
  hidePinModal();
  updateDashboard();

  $('#newPin').value = '';
  $('#confirmPin').value = '';
}

function getGenderedRole(role, isFemale) {
  if (!role.includes('/') && !role.includes('(')) return role;

  if (role.includes('/')) {
    const parts = role.split('/').map(p => p.trim());
    return isFemale ? parts[1] : parts[0];
  }

  if (role.includes('(')) {
    if (isFemale) {
      if (role.toLowerCase().includes('apprenti')) return 'Apprentie';
      if (role.toLowerCase().includes('ouvrier')) return 'Ouvrière';
      if (role.toLowerCase().includes('chef')) return 'Cheffe';
      return role.replace(/\(|\)/g, '');
    }
    return role.replace(/\(.*\)/, '');
  }
  return role;
}

// ============================================================================
