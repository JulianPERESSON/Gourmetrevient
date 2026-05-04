/**
 * GOURMETREVIENT — Module Onboarding Expert v4.0
 * Navigation immersive, explications détaillées et personnage dynamique
 */

const GourmetOnboarding = {
  STORAGE_KEY: 'gourmet_onboarding_done_v1',
  currentStep: 0,
  overlay: null,
  refreshTimer: null,

  steps: [
    {
      target: null,
      icon: '👨‍🍳',
      title: 'Bienvenue dans votre Labo !',
      text: 'Je suis votre assistant Gourmet. Je vais vous montrer comment transformer votre passion en une entreprise rentable et organisée. Suivez-moi !',
      position: 'center'
    },
    {
      target: '.nav-dropdown:nth-child(2) .nav-dropdown-trigger, #mLinkRecettes',
      icon: '📖',
      title: 'Le Grimoire Numérique',
      text: 'Tout commence ici. Créez vos fiches techniques avec une précision chirurgicale. Chaque gramme compte pour votre marge.',
      position: 'bottom',
      action: () => document.querySelector('#navRecettes')?.click()
    },
    {
      target: '#recipeContainer, .recipe-grid',
      icon: '⚖️',
      title: 'Calcul de Coût en Direct',
      text: 'GourmetRevient calcule automatiquement votre coût de revient, votre marge et votre prix de vente conseillé. Finies les erreurs de calcul !',
      position: 'bottom'
    },
    {
      target: '.nav-dropdown:nth-child(4) .nav-dropdown-trigger, #mLinkInv',
      icon: '📦',
      title: 'Stocks & Ingrédients',
      text: 'Gérez votre économat. Une hausse de prix chez votre fournisseur ? Mettez-la à jour ici, et toutes vos recettes se recalculeront instantanément.',
      position: 'bottom',
      action: () => document.querySelector('#navInventaire')?.click()
    },
    {
      target: '.nav-dropdown:nth-child(3) .nav-dropdown-trigger, #mLinkStats',
      icon: '📈',
      title: 'Tableau de Bord Stratégique',
      text: 'Analysez vos performances. Quels sont vos produits les plus rentables ? Où part votre budget ? Prenez des décisions basées sur des chiffres réels.',
      position: 'bottom',
      action: () => document.querySelector('#navStats')?.click()
    },
    {
      target: '#userMenuTrigger, .auth-status',
      icon: '☁️',
      title: 'Sécurité & Cloud',
      text: 'Vos données sont précieuses. Grâce au Cloud, retrouvez votre laboratoire sur votre téléphone, tablette ou ordinateur, partout dans le monde.',
      position: 'bottom'
    },
    {
      target: '#navCRM, .nav-dropdown:nth-child(5)',
      icon: '🤝',
      title: 'Gestion Clients & Commandes',
      text: 'Suivez vos clients et vos commandes passées. Un véritable mini-CRM pour ne plus jamais oublier une livraison.',
      position: 'bottom'
    },
    {
      target: '#btnSubscribePro, .btn-pro',
      icon: '💎',
      title: 'Devenez un Chef Pro',
      text: 'Débloquez l\'export PDF personnalisé, le mode hors-ligne avancé et le support prioritaire pour booster votre croissance.',
      position: 'bottom'
    },
    {
      target: null,
      icon: '🚀',
      title: 'À vous de jouer !',
      text: 'La visite est terminée, mais votre aventure commence. Créez votre première recette et maîtrisez votre rentabilité dès aujourd\'hui !',
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
        #onboarding-overlay { position: fixed; inset: 0; z-index: 9998; pointer-events: none; font-family: 'Inter', sans-serif; }
        #onboarding-backdrop { position: fixed; inset: 0; background: transparent; pointer-events: all; transition: opacity 0.5s; z-index: 9999; }
        #onboarding-spotlight { position: fixed; border-radius: 12px; box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.65); transition: all 0.3s ease; pointer-events: none; z-index: 10000; outline: 3px solid #10b981; outline-offset: 4px; background: transparent; }
        
        #onboarding-card { 
          position: fixed; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 30px; padding: 0; width: 600px; max-width: calc(100vw - 40px); 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); pointer-events: all; 
          z-index: 10001; transition: all 0.4s cubic-bezier(0.19, 1, 0.22, 1); 
          opacity: 0; transform: scale(0.9); color: white; display: flex; overflow: visible;
        }
        #onboarding-card.visible { opacity: 1; transform: scale(1); }
        
        .ob-character-container {
          width: 220px; position: relative; display: flex; align-items: center; justify-content: center;
          background: #c9f2c9; border-radius: 30px 0 0 30px; overflow: hidden; flex-shrink: 0;
        }
        .ob-character-img {
          width: 100%; height: 90%; object-fit: contain;
          animation: obWiggle 4s ease-in-out infinite;
        }
        @keyframes obWiggle {
          0%, 100% { transform: rotate(-1deg) translateY(0); }
          50% { transform: rotate(1deg) translateY(-5px); }
        }
        
        .ob-content { flex: 1; padding: 2.2rem; display: flex; flex-direction: column; justify-content: center; position: relative; }
        .ob-content::before {
          content: ''; position: absolute; left: -12px; top: 50%; transform: translateY(-50%);
          border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-right: 12px solid #1e293b;
        }

        .ob-icon { font-size: 2.5rem; margin-bottom: 0.8rem; }
        .ob-title { color: white; font-size: 1.5rem; font-weight: 800; margin-bottom: 0.8rem; line-height: 1.2; }
        .ob-text { color: #cbd5e1; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem; }
        .ob-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
        .ob-progress-bar { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-right: 2rem; overflow: hidden; }
        .ob-progress-fill { height: 100%; background: #10b981; transition: width 0.3s; }
        .ob-btn { padding: 0.8rem 1.8rem; border-radius: 14px; font-weight: 800; cursor: pointer; border: none; background: #10b981; color: white; font-size: 1rem; transition: all 0.2s; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .ob-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.4); }
        .ob-skip { background: transparent; color: #94a3b8; font-size: 0.85rem; margin-top: 1.5rem; cursor: pointer; border: none; display: block; width: 100%; text-align: center; text-decoration: underline; opacity: 0.6; }
      </style>
      <div id="onboarding-backdrop"></div>
      <div id="onboarding-spotlight"></div>
      <div id="onboarding-card">
        <div class="ob-character-container">
          <img src="./personnage.jpg?v=3.2.0" class="ob-character-img" alt="Chef">
        </div>
        <div class="ob-content">
          <span class="ob-icon" id="ob-icon"></span>
          <h3 class="ob-title" id="ob-title"></h3>
          <p class="ob-text" id="ob-text"></p>
          <div class="ob-footer">
            <div class="ob-progress-bar"><div class="ob-progress-fill" id="ob-progress"></div></div>
            <button class="ob-btn" id="ob-next">Suivant</button>
          </div>
          <button class="ob-skip" id="ob-skip">Quitter la visite</button>
        </div>
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

    // Exécuter l'action associée à l'étape (navigation forcée)
    if (step.action) step.action();

    setTimeout(() => {
      document.getElementById('ob-icon').innerText = step.icon;
      document.getElementById('ob-title').innerText = step.title;
      document.getElementById('ob-text').innerText = step.text;
      document.getElementById('ob-progress').style.width = ((idx + 1) / this.steps.length * 100) + '%';
      document.getElementById('ob-next').innerText = idx === this.steps.length - 1 ? 'C\'est parti ! ✨' : 'Suivant';

      const target = step.target ? document.querySelector(step.target) : null;
      
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        let counts = 0;
        clearInterval(this.refreshTimer);
        this.refreshTimer = setInterval(() => {
          this._updateSpotlight(target);
          if (counts++ > 15) {
            clearInterval(this.refreshTimer);
            card.classList.add('visible');
          }
        }, 100);
      } else {
        clearInterval(this.refreshTimer);
        this._updateSpotlight(null);
        setTimeout(() => card.classList.add('visible'), 200);
      }
    }, 300); // Petit délai pour laisser le temps à l'interface de changer
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

      let top = rect.bottom + 30;
      let left = rect.left + (rect.width / 2) - 300; 
      if (top + 350 > window.innerHeight) top = rect.top - 400;
      left = Math.max(20, Math.min(left, window.innerWidth - 620));

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
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 500);
  }
};

window.GourmetOnboarding = GourmetOnboarding;

