/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   GOURMETREVIENT — Module RGPD v1.0                          ║
 * ║   Bannière Cookies · Consentement · Conformité EU            ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const RGPDManager = (() => {

  const CONSENT_KEY = 'gourmet_rgpd_consent';
  const CONSENT_VERSION = '1.0'; // Incrémenter si la politique change

  // Vérifie si le consentement a déjà été donné
  function hasConsent() {
    try {
      const stored = JSON.parse(localStorage.getItem(CONSENT_KEY));
      return stored && stored.version === CONSENT_VERSION;
    } catch {
      return false;
    }
  }

  // Enregistre le consentement
  function saveConsent(preferences) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify({
      version: CONSENT_VERSION,
      date: new Date().toISOString(),
      preferences,
    }));
  }

  // Affiche la bannière si pas encore de consentement
  function showBannerIfNeeded() {
    if (hasConsent()) return;
    setTimeout(renderBanner, 800); // Léger délai pour laisser l'app charger
  }

  // Crée et injecte la bannière dans le DOM
  function renderBanner() {
    if (document.getElementById('rgpdBanner')) return;

    const banner = document.createElement('div');
    banner.id = 'rgpdBanner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Politique de cookies');
    banner.innerHTML = `
      <div class="rgpd-inner">
        <div class="rgpd-left">
          <div class="rgpd-icon">🍪</div>
          <div class="rgpd-text">
            <strong>Vos données, votre contrôle</strong>
            <span>GourmetRevient utilise des cookies pour mémoriser vos préférences et améliorer votre expérience. Vos données restent <em>sur votre appareil</em> et ne sont jamais vendues.</span>
            <a href="./legal.html#politique-cookies" target="_blank" class="rgpd-link">En savoir plus →</a>
          </div>
        </div>
        <div class="rgpd-actions">
          <button id="rgpdCustomize" class="rgpd-btn-secondary">Personnaliser</button>
          <button id="rgpdRefuse"    class="rgpd-btn-secondary">Refuser</button>
          <button id="rgpdAccept"    class="rgpd-btn-primary">Accepter tout ✓</button>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    // Animation d'entrée
    requestAnimationFrame(() => banner.classList.add('rgpd-visible'));

    document.getElementById('rgpdAccept').addEventListener('click', () => {
      saveConsent({ analytics: true, functional: true });
      hideBanner();
    });

    document.getElementById('rgpdRefuse').addEventListener('click', () => {
      saveConsent({ analytics: false, functional: true });
      hideBanner();
    });

    document.getElementById('rgpdCustomize').addEventListener('click', showPreferencesModal);
  }

  function hideBanner() {
    const banner = document.getElementById('rgpdBanner');
    if (!banner) return;
    banner.classList.remove('rgpd-visible');
    banner.classList.add('rgpd-hiding');
    setTimeout(() => banner.remove(), 400);
  }

  // Modal de personnalisation avancée
  function showPreferencesModal() {
    const modal = document.createElement('div');
    modal.id = 'rgpdModal';
    modal.className = 'glass-modal-overlay';
    modal.innerHTML = `
      <div class="glass-modal-content" style="max-width:500px;">
        <button onclick="document.getElementById('rgpdModal').remove()" class="auth-close">✕</button>
        <div class="auth-header" style="margin-bottom:1.5rem;">
          <h2 style="font-size:1.3rem;">🔒 Préférences de confidentialité</h2>
          <p style="color:rgba(255,255,255,0.6);font-size:0.9rem;">Choisissez les cookies que vous acceptez.</p>
        </div>
        
        <div class="rgpd-pref-row">
          <div>
            <strong>🔧 Cookies fonctionnels</strong>
            <p>Mémorisent vos recettes, préférences de langue et thème. Nécessaires au bon fonctionnement.</p>
          </div>
          <div class="rgpd-toggle rgpd-toggle-locked" title="Obligatoires">✓</div>
        </div>

        <div class="rgpd-pref-row">
          <div>
            <strong>📊 Cookies analytiques</strong>
            <p>Mesures d'utilisation anonymes pour améliorer l'application.</p>
          </div>
          <label class="rgpd-switch">
            <input type="checkbox" id="analyticsToggle" checked>
            <span class="rgpd-slider"></span>
          </label>
        </div>

        <div style="margin-top:1.5rem;display:flex;gap:12px;">
          <button onclick="RGPDManager.saveFromModal()" class="auth-btn-primary" style="flex:1;">Enregistrer mes choix</button>
        </div>

        <p style="font-size:0.72rem;color:rgba(255,255,255,0.35);margin-top:1rem;text-align:center;">
          Conformément au RGPD (UE) 2016/679 — <a href="./legal.html" target="_blank" style="color:rgba(255,255,255,0.5);">Politique de confidentialité</a>
        </p>
      </div>
    `;
    document.body.appendChild(modal);
  }

  // Appelé depuis le bouton "Enregistrer mes choix" de la modal
  function saveFromModal() {
    const analytics = document.getElementById('analyticsToggle')?.checked ?? false;
    saveConsent({ analytics, functional: true });
    document.getElementById('rgpdModal')?.remove();
    hideBanner();
    if (typeof showToast === 'function') {
      showToast('✅ Préférences de confidentialité enregistrées.', 'success');
    }
  }

  // Lien "Gérer mes cookies" affiché dans le footer
  function renderConsentLink() {
    const footer = document.querySelector('.app-footer, footer, #footerZone');
    if (!footer) return;
    const link = document.createElement('button');
    link.className = 'rgpd-manage-link';
    link.textContent = '🔒 Gérer mes cookies';
    link.onclick = () => {
      localStorage.removeItem(CONSENT_KEY);
      renderBanner();
    };
    footer.appendChild(link);
  }

  return { showBannerIfNeeded, hideBanner, saveFromModal, renderConsentLink };

})();

// Exposition globale
window.RGPDManager = RGPDManager;

// Auto-démarrage après chargement de la page
window.addEventListener('DOMContentLoaded', () => {
  RGPDManager.showBannerIfNeeded();
  RGPDManager.renderConsentLink();
});
