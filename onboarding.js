/**
 * GOURMETREVIENT — Module Onboarding Expert v5.0
 * Exploration détaillée des menus et navigation immersive
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
    // --- MENU 1 : L'ATELIER ---
    {
      target: '.nav-dropdown:nth-child(2) .nav-dropdown-trigger',
      icon: '💡',
      title: 'L\'Atelier Créatif',
      text: 'C\'est ici que la magie opère. Cliquez pour découvrir vos outils de création.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navRecettes',
      icon: '📖',
      title: 'Calculateur de Recettes',
      text: 'Le cœur de l\'app. Saisissez vos ingrédients et obtenez instantanément votre coût de revient et votre marge brute.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navAssembly',
      icon: '🏗️',
      title: 'Simulateur de Montage',
      text: 'Visualisez vos entremets en coupe avant de les produire. Ajustez les épaisseurs de couches pour un équilibre parfait.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navConverter',
      icon: '📏',
      title: 'Convertisseur de Moules',
      text: 'Passez d\'un cercle de 18cm à un cadre de 40x60 en un clic. Toutes vos quantités s\'adaptent automatiquement.',
      action: function() { this._toggleDropdown(0, true); }
    },
    // --- MENU 2 : PILOTAGE ---
    {
      target: '.nav-dropdown:nth-child(3) .nav-dropdown-trigger',
      icon: '📈',
      title: 'Pilotage & Outils',
      text: 'Gérez votre rentabilité comme un vrai chef d\'entreprise.',
      action: function() { this._toggleDropdown(0, false); this._toggleDropdown(1, true); }
    },
    {
      target: '#navStats',
      icon: '📊',
      title: 'Dashboard Analytique',
      text: 'Suivez l\'évolution de vos prix et vos marges globales. Identifiez vos produits "stars" et ceux à optimiser.',
      action: function() { this._toggleDropdown(1, true); }
    },
    {
      target: '#navCRM',
      icon: '🤝',
      title: 'Commandes & CRM',
      text: 'Centralisez vos commandes clients et suivez votre historique de production.',
      action: function() { this._toggleDropdown(1, true); }
    },
    // --- MENU 3 : LABO ---
    {
      target: '.nav-dropdown:nth-child(4) .nav-dropdown-trigger',
      icon: '🛡️',
      title: 'Labo & Sécurité',
      text: 'Organisation, hygiène et gestion des stocks.',
      action: function() { this._toggleDropdown(1, false); this._toggleDropdown(2, true); }
    },
    {
      target: '#navInventaire',
      icon: '📦',
      title: 'Inventaire des Stocks',
      text: 'Mettez à jour vos prix d\'achat une seule fois ici, et l\'ensemble de vos recettes se mettra à jour partout.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navHygiene',
      icon: '🧼',
      title: 'Hygiène & HACCP',
      text: 'Gérez vos fiches de traçabilité et vos contrôles sanitaires directement dans l\'outil.',
      action: function() { this._toggleDropdown(2, true); }
    },
    // --- FIN ---
    {
      target: '#btnSubscribePro, .btn-pro',
      icon: '💎',
      title: 'Devenez un Chef Pro',
      text: 'Débloquez l\'export PDF personnalisé, le mode hors-ligne avancé et le support prioritaire.',
      action: function() { this._toggleDropdown(2, false); }
    },
    {
      target: null,
      icon: '🚀',
      title: 'À vous de jouer !',
      text: 'Votre laboratoire numérique est prêt. Bonne réussite dans vos créations !',
      position: 'center'
    }
  ],

  _toggleDropdown(index, open) {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    if (dropdowns[index]) {
      if (open) dropdowns[index].classList.add('active');
      else dropdowns[index].classList.remove('active');
    }
  },

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

    if (step.action) step.action.call(this);

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
    }, 400); 
  },

  _updateSpotlight(target) {
    const spotlight = document.getElementById('onboarding-spotlight');
    const card = document.getElementById('onboarding-card');
    
    if (target && target.offsetParent !== null) {
      const rect = target.getBoundingClientRect();
      spotlight.style.opacity = '1';
      spotlight.style.left = (rect.left - 10) + 'px';
      spotlight.style.top = (rect.top - 10) + 'px';
      spotlight.style.width = (rect.width + 20) + 'px';
      spotlight.style.height = (rect.height + 20) + 'px';

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
    document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('active'));
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 500);
  }
};

window.GourmetOnboarding = GourmetOnboarding;
