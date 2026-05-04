/**
 * GOURMETREVIENT — Module Onboarding Premium v2.1
 * Fix: Alignement précis & support des menus déroulants
 */

const GourmetOnboarding = {
  STORAGE_KEY: 'gourmet_onboarding_done_v1',
  currentStep: 0,
  overlay: null,
  refreshTimer: null,

  steps: [
    {
      target: null,
      icon: '✨',
      title: 'Bienvenue Chef !',
      text: 'GourmetRevient est votre nouvel allié pour piloter votre rentabilité. Laissez-nous vous montrer les outils essentiels.',
      position: 'center'
    },
    {
      target: '#navRecettes, #mLinkRecettes',
      icon: '📖',
      title: 'Le Grimoire Numérique',
      text: 'C\'est ici que vous créez vos fiches techniques. Le coût de revient se calcule en temps réel selon vos ingrédients.',
      position: 'bottom'
    },
    {
      target: '#navInventaire, #mLinkInv',
      icon: '📦',
      title: 'Gestion des Stocks',
      text: 'Mettez à jour vos prix d\'achat ici. Vos recettes se recalculeront instantanément. Un gain de temps magique !',
      position: 'bottom'
    },
    {
      target: '#navStats, #mLinkStats',
      icon: '📈',
      title: 'Analyses & Marges',
      text: 'Visualisez vos bénéfices, repérez les produits "Stars" et protégez votre labo contre l\'inflation.',
      position: 'bottom'
    },
    {
      target: '#btnSubscribePro, .btn-pro',
      icon: '💎',
      title: 'Potentiel Illimité',
      text: 'Accédez au Cloud, au CRM et aux outils avancés. Votre passion mérite une gestion de haut vol.',
      position: 'bottom'
    },
    {
      target: null,
      icon: '🚀',
      title: 'Prêt pour le service ?',
      text: 'Votre laboratoire numérique est opérationnel. Bonne réussite dans vos créations !',
      position: 'center'
    }
  ],

  init() {
    if (localStorage.getItem(this.STORAGE_KEY)) return;
    setTimeout(() => this.start(), 2000);
  },

  start() {
    this.currentStep = 0;
    this._buildOverlay();
    this._showStep(0);
    window.addEventListener('resize', () => this._updateSpotlight());
  },

  _buildOverlay() {
    if (document.getElementById('onboarding-overlay')) document.getElementById('onboarding-overlay').remove();

    this.overlay = document.createElement('div');
    this.overlay.id = 'onboarding-overlay';
    this.overlay.innerHTML = `
      <style>
        #onboarding-overlay { position: fixed; inset: 0; z-index: 10000; pointer-events: none; font-family: 'Inter', sans-serif; }
        #onboarding-backdrop { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(4px); pointer-events: all; transition: opacity 0.5s; }
        #onboarding-spotlight { position: fixed; border-radius: 12px; box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.75); transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); pointer-events: none; z-index: 10001; outline: 3px solid #10b981; outline-offset: 4px; animation: obPulse 2s infinite; }
        @keyframes obPulse { 0%, 100% { outline-offset: 4px; opacity: 1; } 50% { outline-offset: 10px; opacity: 0.6; } }
        #onboarding-card { position: fixed; background: rgba(30, 41, 59, 0.9); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 2.2rem; width: 400px; max-width: calc(100vw - 40px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5); pointer-events: all; z-index: 10002; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0; transform: scale(0.9); }
        #onboarding-card.visible { opacity: 1; transform: scale(1); }
        .ob-icon { font-size: 3rem; margin-bottom: 1rem; display: block; }
        .ob-title { color: white; font-size: 1.5rem; font-weight: 800; margin-bottom: 0.8rem; }
        .ob-text { color: #cbd5e1; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
        .ob-footer { display: flex; align-items: center; justify-content: space-between; }
        .ob-progress-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-right: 2rem; overflow: hidden; }
        .ob-progress-fill { height: 100%; background: #10b981; transition: width 0.5s; }
        .ob-btn { padding: 0.7rem 1.5rem; border-radius: 12px; font-weight: 800; cursor: pointer; border: none; background: #10b981; color: white; }
        .ob-skip { background: transparent; color: #94a3b8; font-size: 0.85rem; margin-top: 1rem; cursor: pointer; border: none; display: block; width: 100%; text-align: center; text-decoration: underline; }
      </style>
      <div id="onboarding-backdrop"></div>
      <div id="onboarding-spotlight"></div>
      <div id="onboarding-card">
        <span class="ob-icon" id="ob-icon"></span>
        <h3 class="ob-title" id="ob-title"></h3>
        <p class="ob-text" id="ob-text"></p>
        <div class="ob-footer">
          <div class="ob-progress-bar"><div class="ob-progress-fill" id="ob-progress"></div></div>
          <button class="ob-btn" id="ob-next">Suivant</button>
        </div>
        <button class="ob-skip" id="ob-skip">Quitter la visite</button>
      </div>
    `;
    document.body.appendChild(this.overlay);
    document.getElementById('ob-next').onclick = () => this.next();
    document.getElementById('ob-skip').onclick = () => this.finish();
  },

  _showStep(idx) {
    const step = this.steps[idx];
    const card = document.getElementById('onboarding-card');
    card.classList.remove('visible');

    document.getElementById('ob-icon').innerText = step.icon;
    document.getElementById('ob-title').innerText = step.title;
    document.getElementById('ob-text').innerText = step.text;
    document.getElementById('ob-progress').style.width = ((idx + 1) / this.steps.length * 100) + '%';
    document.getElementById('ob-next').innerText = idx === this.steps.length - 1 ? 'Terminer' : 'Suivant';

    const target = step.target ? document.querySelector(step.target) : null;
    
    // Si la cible est dans un dropdown, on l'ouvre
    if (target && target.closest('.nav-dropdown')) {
      target.closest('.nav-dropdown').classList.add('active');
    }

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // On rafraîchit la position plusieurs fois pour suivre le scroll/l'ouverture du menu
      let counts = 0;
      clearInterval(this.refreshTimer);
      this.refreshTimer = setInterval(() => {
        this._updateSpotlight(target);
        if (counts++ > 20) {
          clearInterval(this.refreshTimer);
          card.classList.add('visible');
        }
      }, 50);
    } else {
      clearInterval(this.refreshTimer);
      this._updateSpotlight(null);
      setTimeout(() => card.classList.add('visible'), 100);
    }
  },

  _updateSpotlight(target) {
    const spotlight = document.getElementById('onboarding-spotlight');
    const card = document.getElementById('onboarding-card');
    
    if (target && target.offsetParent !== null) {
      const rect = target.getBoundingClientRect();
      spotlight.style.opacity = '1';
      spotlight.style.left = (rect.left - 8) + 'px';
      spotlight.style.top = (rect.top - 8) + 'px';
      spotlight.style.width = (rect.width + 16) + 'px';
      spotlight.style.height = (rect.height + 16) + 'px';

      let top = rect.bottom + 25;
      let left = rect.left + (rect.width / 2) - 200;
      if (top + 300 > window.innerHeight) top = rect.top - 350;
      left = Math.max(20, Math.min(left, window.innerWidth - 420));

      card.style.top = top + 'px';
      card.style.left = left + 'px';
      card.style.transform = 'none';
    } else if (!target) {
      spotlight.style.opacity = '0';
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.transform = 'translate(-50%, -50%)';
    }
  },

  next() {
    // Fermer les dropdowns avant de passer à la suite
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active'));
    this.currentStep++;
    if (this.currentStep < this.steps.length) this._showStep(this.currentStep);
    else this.finish();
  },

  finish() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 500);
  }
};

window.GourmetOnboarding = GourmetOnboarding;

