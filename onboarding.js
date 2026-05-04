/**
 * GOURMETREVIENT — Module Onboarding Premium v2.3
 * Fix: Opacité & Transparence du Spotlight
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
      target: '.nav-dropdown:nth-child(2) .nav-dropdown-trigger, #mLinkRecettes',
      icon: '📖',
      title: 'Le Grimoire Numérique',
      text: 'C\'est ici que vous créez vos fiches techniques. Le coût de revient se calcule en temps réel selon vos ingrédients.',
      position: 'bottom'
    },
    {
      target: '.nav-dropdown:nth-child(4) .nav-dropdown-trigger, #mLinkInv',
      icon: '📦',
      title: 'Gestion des Stocks',
      text: 'Mettez à jour vos prix d\'achat ici. Vos recettes se recalculeront instantanément. Un gain de temps magique !',
      position: 'bottom'
    },
    {
      target: '.nav-dropdown:nth-child(3) .nav-dropdown-trigger, #mLinkStats',
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
    const nav = document.querySelector('.header, .top-nav, nav');
    if (nav) nav.style.zIndex = '10005';
    this._showStep(0);
    window.addEventListener('resize', () => this._updateSpotlight(this._getCurrentTarget()));
  },

  _getCurrentTarget() {
    const step = this.steps[this.currentStep];
    return step.target ? document.querySelector(step.target) : null;
  },

  _buildOverlay() {
    if (document.getElementById('onboarding-overlay')) document.getElementById('onboarding-overlay').remove();

    this.overlay = document.createElement('div');
    this.overlay.id = 'onboarding-overlay';
    this.overlay.innerHTML = `
      <style>
        #onboarding-overlay { position: fixed; inset: 0; z-index: 10000; pointer-events: none; font-family: 'Inter', sans-serif; }
        #onboarding-backdrop { position: fixed; inset: 0; background: transparent; backdrop-filter: blur(3px); pointer-events: all; transition: opacity 0.5s; }
        #onboarding-spotlight { position: fixed; border-radius: 12px; box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.85); transition: all 0.3s ease; pointer-events: none; z-index: 10001; outline: 3px solid #10b981; outline-offset: 4px; background: transparent; }
        #onboarding-card { position: fixed; background: rgba(30, 41, 59, 0.98); backdrop-filter: blur(20px); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 24px; padding: 2rem; width: 380px; max-width: calc(100vw - 40px); box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); pointer-events: all; z-index: 10002; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); opacity: 0; transform: scale(0.9); }
        #onboarding-card.visible { opacity: 1; transform: scale(1); }
        .ob-icon { font-size: 2.5rem; margin-bottom: 0.8rem; display: block; }
        .ob-title { color: white; font-size: 1.4rem; font-weight: 800; margin-bottom: 0.6rem; }
        .ob-text { color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.5rem; }
        .ob-footer { display: flex; align-items: center; justify-content: space-between; }
        .ob-progress-bar { flex: 1; height: 4px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-right: 1.5rem; overflow: hidden; }
        .ob-progress-fill { height: 100%; background: #10b981; transition: width 0.3s; }
        .ob-btn { padding: 0.6rem 1.2rem; border-radius: 10px; font-weight: 800; cursor: pointer; border: none; background: #10b981; color: white; font-size: 0.9rem; }
        .ob-skip { background: transparent; color: #94a3b8; font-size: 0.8rem; margin-top: 0.8rem; cursor: pointer; border: none; display: block; width: 100%; text-align: center; text-decoration: underline; }
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
    
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      let counts = 0;
      clearInterval(this.refreshTimer);
      this.refreshTimer = setInterval(() => {
        this._updateSpotlight(target);
        if (counts++ > 10) {
          clearInterval(this.refreshTimer);
          card.classList.add('visible');
        }
      }, 100);
    } else {
      clearInterval(this.refreshTimer);
      this._updateSpotlight(null);
      setTimeout(() => card.classList.add('visible'), 200);
    }
  },

  _updateSpotlight(target) {
    const spotlight = document.getElementById('onboarding-spotlight');
    const card = document.getElementById('onboarding-card');
    
    if (target && target.offsetParent !== null) {
      const rect = target.getBoundingClientRect();
      spotlight.style.opacity = '1';
      spotlight.style.left = (rect.left - 6) + 'px';
      spotlight.style.top = (rect.top - 6) + 'px';
      spotlight.style.width = (rect.width + 12) + 'px';
      spotlight.style.height = (rect.height + 12) + 'px';

      let top = rect.bottom + 20;
      let left = rect.left + (rect.width / 2) - 190;
      if (top + 250 > window.innerHeight) top = rect.top - 300;
      left = Math.max(15, Math.min(left, window.innerWidth - 400));

      card.style.top = top + 'px';
      card.style.left = left + 'px';
      card.style.transform = 'none';
    } else {
      spotlight.style.opacity = '0';
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.transform = 'translate(-50%, -50%)';
    }
  },

  next() {
    this.currentStep++;
    if (this.currentStep < this.steps.length) this._showStep(this.currentStep);
    else this.finish();
  },

  finish() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    const nav = document.querySelector('.header, .top-nav, nav');
    if (nav) nav.style.zIndex = '';
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 500);
  }
};

window.GourmetOnboarding = GourmetOnboarding;

