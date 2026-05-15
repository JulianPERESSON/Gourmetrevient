const fs = require('fs');

function fixNavbar() {
    try {
        const content = fs.readFileSync('index.html', 'utf8');
        const startMarker = '<div class="header-actions" id="userProfileArea"';
        const endMarker = '</header>';

        const startIdx = content.indexOf(startMarker);
        if (startIdx === -1) {
            console.log("Start marker not found");
            return;
        }

        const endIdx = content.indexOf(endMarker, startIdx) + endMarker.length;
        if (endIdx === -1) {
            console.log("End marker not found");
            return;
        }

        const newActions = `    <div class="header-actions" id="userProfileArea" style="display:none; align-items:center; gap:12px; margin-left: auto;">
      <!-- Cloud Sync Pill -->
      <div id="syncStatus" class="sync-status" title="État de la synchronisation cloud" style="display: flex; align-items: center; gap: 6px; background: var(--bg-alt); padding: 4px 10px; border-radius: 20px; border: 1px solid var(--surface-border);">
         <span id="offlineStatusDot" class="sync-dot sync-dot--online" style="width:8px; height:8px; border-radius:50%; display:inline-block;"></span>
         <span class="status-text" style="font-size:0.7rem; font-weight:700; color:var(--text-secondary);">Cloud : Actif</span>
      </div>

      <button class="btn btn-primary btn-sm" id="btnSubscribePro" onclick="window.GourmetBilling.checkout('pro_monthly')" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); border: none; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); padding: 0.5rem 1rem; border-radius: 12px;">
        <span style="font-weight: 800;">💎 Pro</span>
      </button>

      <!-- Theme Toggle -->
      <button id="themeToggleBtn" class="theme-toggle-btn" aria-label="Changer de thème">
        <span class="theme-icon-sun">☀️</span>
        <span class="theme-icon-moon" style="display:none;">🌙</span>
      </button>

      <div class="profile-dropdown">
        <button class="btn btn-profile" id="btnProfile">
          <span class="avatar" id="headerAvatar">👨‍🍳</span>
          <span class="user-name" id="userNameHeader">Artisan</span>
        </button>
        <div class="dropdown-content" id="profileDropdown">
          <button id="btnChangePin" data-i18n="nav.my_profile">👤 Mon Profil</button>
          <button id="btnManageBilling" onclick="window.GourmetBilling.openCustomerPortal()" style="border-top: 1px solid var(--surface-border); margin-top: 5px; padding-top: 10px; color: var(--accent); font-weight: 700;">💳 Mon Abonnement</button>
          <button id="btnLogout" class="logout-link" data-i18n="nav.logout">🚪 Déconnexion</button>
        </div>
      </div>
    </div>
  </header>`;

        const finalContent = content.substring(0, startIdx) + newActions + content.substring(endIdx);
        fs.writeFileSync('index.html', finalContent, 'utf8');
        console.log("Navbar fixed successfully with Node.js");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixNavbar();
