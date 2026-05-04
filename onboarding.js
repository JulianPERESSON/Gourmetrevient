/**
 * GOURMETREVIENT — Module Onboarding Premium
 * Guide interactif haute fidélité pour les nouveaux utilisateurs
 */

const GourmetOnboarding = {
  STORAGE_KEY: 'gourmet_onboarding_done_v1',
  currentStep: 0,
  overlay: null,

  steps: [
    {
      target: null,
      icon: '✨',
      title: 'Bienvenue Chef !',
      text: 'GourmetRevient est votre nouvel allié pour piloter votre rentabilité. Laissez-nous vous montrer les outils essentiels en 1 minute.',
      position: 'center'
    },
    {
      target: '#nav-recettes, [data-section="recettes"]',
      icon: '📖',
      title: 'Le Grimoire Numérique',
      text: 'C\'est ici que la magie opère. Créez vos recettes et voyez instantanément votre coût de revient se calculer ligne par ligne.',
      position: 'bottom'
    },
    {
      target: '#nav-inventaire, [data-section="inventaire"]',
      icon: '📦',
      title: 'Gestion des Stocks',
      text: 'Mettez à jour vos prix d\'achat ici. Toutes vos recettes liées se recalculeront automatiquement. Un gain de temps colossal !',
      position: 'bottom'
    },
    {
      target: '#nav-stats, [data-section="stats"]',
      icon: '📈',
      title: 'Votre Cockpit',
      text: 'Visualisez vos marges, repérez vos produits les plus rentables et protégez-vous contre l\'inflation grâce aux analyses prédictives.',
      position: 'bottom'
    },
    {
      target: '#btnSubscribePro, .btn-pro',
      icon: '💎',
      title: 'Libérez le potentiel Pro',
      text: 'Accédez au Cloud, au CRM clients et aux exports PDF premium. Idéal pour passer du stade artisanal au stade entrepreneurial.',
      position: 'bottom'
    },
    {
      target: null,
      icon: '🚀',
      title: 'Prêt pour l\'enfournement ?',
      text: 'Votre laboratoire numérique est prêt. Commencez par explorer les 61 recettes de démonstration ou créez votre premier chef-d\'œuvre.',
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
    window.addEventListener('resize', () => this._showStep(this.currentStep));
  },

  _buildOverlay() {
    if (document.getElementById('onboarding-overlay')) document.getElementById('onboarding-overlay').remove();

    this.overlay = document.createElement('div');
    this.overlay.id = 'onboarding-overlay';
    this.overlay.innerHTML = `
      <style>
        #onboarding-overlay {
          position: fixed; inset: 0; z-index: 10000;
          pointer-events: none; font-family: 'Inter', system-ui, sans-serif;
        }
        #onboarding-backdrop {
          position: fixed; inset: 0;
          background: radial-gradient(circle at center, rgba(15, 23, 42, 0.4) 0%, rgba(15, 23, 42, 0.8) 100%);
          backdrop-filter: blur(4px);
          pointer-events: all; transition: opacity 0.5s ease;
        }
        #onboarding-spotlight {
          position: fixed;
          border-radius: 12px;
          box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.75);
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
          pointer-events: none; z-index: 10001;
          outline: 2px solid var(--primary, #10b981);
          outline-offset: 4px;
        }
        #onboarding-card {
          position: fixed;
          background: rgba(30, 41, 59, 0.8);
          backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 24px;
          padding: 2.5rem;
          width: 400px;
          max-width: calc(100vw - 40px);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          pointer-events: all;
          z-index: 10002;
          transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
        }
        .ob-icon {
          font-size: 3rem; margin-bottom: 1.5rem; display: block;
          filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.3));
        }
        .ob-title {
          color: white; font-size: 1.5rem; font-weight: 800;
          margin-bottom: 0.75rem; letter-spacing: -0.02em;
        }
        .ob-text {
          color: #94a3b8; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem;
        }
        .ob-footer {
          display: flex; align-items: center; justify-content: space-between;
        }
        .ob-progress-container {
          flex: 1; margin-right: 2rem;
        }
        .ob-progress-bar {
          height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; overflow: hidden;
        }
        .ob-progress-fill {
          height: 100%; background: linear-gradient(90deg, #10b981, #6366f1);
          transition: width 0.5s ease;
        }
        .ob-btn {
          padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700;
          cursor: pointer; border: none; transition: all 0.2s;
        }
        .ob-btn-next {
          background: #10b981; color: white;
          box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
        }
        .ob-btn-next:hover { transform: scale(1.05); background: #059669; }
        .ob-skip {
          background: transparent; color: #64748b; font-size: 0.875rem;
          margin-top: 1rem; cursor: pointer; border: none; display: block;
          text-align: center; width: 100%;
        }
      </style>
      <div id="onboarding-backdrop"></div>
      <div id="onboarding-spotlight"></div>
      <div id="onboarding-card">
        <span class="ob-icon" id="ob-icon"></span>
        <h3 class="ob-title" id="ob-title"></h3>
        <p class="ob-text" id="ob-text"></p>
        <div class="ob-footer">
          <div class="ob-progress-container">
            <div class="ob-progress-bar"><div class="ob-progress-fill" id="ob-progress"></div></div>
          </div>
          <button class="ob-btn ob-btn-next" id="ob-next">Suivant</button>
        </div>
        <button class="ob-skip" id="ob-skip">Passer la visite</button>
      </div>
    `;
    document.body.appendChild(this.overlay);

    document.getElementById('ob-next').onclick = () => this.next();
    document.getElementById('ob-skip').onclick = () => this.finish();
  },

  _showStep(idx) {
    const step = this.steps[idx];
    const card = document.getElementById('onboarding-card');
    const spotlight = document.getElementById('onboarding-spotlight');
    const progress = document.getElementById('ob-progress');

    document.getElementById('ob-icon').innerText = step.icon;
    document.getElementById('ob-title').innerText = step.title;
    document.getElementById('ob-text').innerText = step.text;
    progress.style.width = ((idx + 1) / this.steps.length * 100) + '%';

    const nextBtn = document.getElementById('ob-next');
    nextBtn.innerText = idx === this.steps.length - 1 ? 'C\'est parti !' : 'Suivant';

    const target = step.target ? document.querySelector(step.target) : null;
    if (target && target.offsetParent !== null) {
      const rect = target.getBoundingClientRect();
      spotlight.style.opacity = '1';
      spotlight.style.left = (rect.left - 8) + 'px';
      spotlight.style.top = (rect.top - 8) + 'px';
      spotlight.style.width = (rect.width + 16) + 'px';
      spotlight.style.height = (rect.height + 16) + 'px';

      // Smart positioning
      let cardTop = rect.bottom + 24;
      let cardLeft = rect.left + (rect.width / 2) - 200;

      if (cardTop + 300 > window.innerHeight) cardTop = rect.top - 320;
      cardLeft = Math.max(20, Math.min(cardLeft, window.innerWidth - 420));

      card.style.top = cardTop + 'px';
      card.style.left = cardLeft + 'px';
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
    if (this.currentStep < this.steps.length) {
      this._showStep(this.currentStep);
    } else {
      this.finish();
    }
  },

  finish() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 500);
  }
};

window.GourmetOnboarding = GourmetOnboarding;

