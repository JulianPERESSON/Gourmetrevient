/**
 * GOURMETREVIENT — Module Onboarding Expert v6.1
 * Transitions ultra-fluides et enchaînements rapides
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
      title: 'Bienvenue Chef !',
      text: 'Je vais vous présenter l\'intégralité de vos outils. Accrochez-vous, votre laboratoire est prêt !',
      position: 'center'
    },
    // --- MENU 1 : L'ATELIER ---
    {
      target: '.nav-dropdown:nth-child(3) .nav-dropdown-trigger',
      icon: '💡',
      title: 'L\'Atelier Créatif',
      text: 'C\'est ici que vous concevez vos créations.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navRecettes',
      icon: '📖',
      title: 'Calculateur de Recettes',
      text: 'Gérez vos fiches techniques et calculez vos marges en temps réel.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navChefsBrain',
      icon: '🧠',
      title: 'Cerveau du Chef',
      text: 'Utilisez l\'intelligence artificielle pour générer des idées de recettes ou optimiser vos processus.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navAssembly',
      icon: '🏗️',
      title: 'Simulateur de Montage',
      text: 'Concevez vos entremets en coupe et visualisez les couches.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navConverter',
      icon: '📏',
      title: 'Convertisseur de Moules',
      text: 'Adaptez vos recettes à n\'importe quelle taille de moule instantanément.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navPortfolio',
      icon: '🖼️',
      title: 'Portfolio Client',
      text: 'Exposez vos plus belles créations pour vos clients.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navScheduler',
      icon: '🎓',
      title: 'Ordonnancement',
      text: 'Planifiez vos étapes de production pour un examen ou un rush.',
      action: function() { this._toggleDropdown(0, true); }
    },
    // --- MENU 2 : PILOTAGE ---
    {
      target: '.nav-dropdown:nth-child(4) .nav-dropdown-trigger',
      icon: '📈',
      title: 'Pilotage & Outils',
      text: 'Gérez la rentabilité de votre entreprise.',
      action: function() { this._closeAllDropdowns(); this._toggleDropdown(1, true); }
    },
    {
      target: '#navStats',
      icon: '📊',
      title: 'Dashboard & Statistiques',
      text: 'Analyse complète de vos performances et de vos marges.',
      action: function() { this._toggleDropdown(1, true); }
    },
    {
      target: '#navCatalogue',
      icon: '🌐',
      title: 'E-Catalogue Client',
      text: 'Votre boutique numérique pour présenter vos tarifs.',
      action: function() { this._toggleDropdown(1, true); }
    },
    {
      target: '#navCRM',
      icon: '🤝',
      title: 'Commandes & CRM',
      text: 'Suivez vos clients et gérez vos livraisons.',
      action: function() { this._toggleDropdown(1, true); }
    },
    {
      target: '#navProTools',
      icon: '🛠️',
      title: 'Outils Métier',
      text: 'Calculateurs avancés et utilitaires de laboratoire.',
      action: function() { this._toggleDropdown(1, true); }
    },
    // --- MENU 3 : LABO ---
    {
      target: '.nav-dropdown:nth-child(5) .nav-dropdown-trigger',
      icon: '🛡️',
      title: 'Labo & Sécurité',
      text: 'Organisation interne et normes sanitaires.',
      action: function() { this._closeAllDropdowns(); this._toggleDropdown(2, true); }
    },
    {
      target: '#navPlanning',
      icon: '🌴',
      title: 'Équipe & Congés',
      text: 'Gérez le planning de votre personnel.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navInventaire',
      icon: '📦',
      title: 'Inventaire des Stocks',
      text: 'Gérez vos prix d\'achat et vos niveaux de stock.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navSuppliers',
      icon: '🏢',
      title: 'Fournisseurs',
      text: 'Annuaire complet de vos partenaires commerciaux.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navHygiene',
      icon: '🧼',
      title: 'Hygiène & HACCP',
      text: 'Contrôles sanitaires et traçabilité obligatoire.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navLabo',
      icon: '📐',
      title: 'Matériel & Outillage',
      text: 'Plans de laboratoire et inventaire matériel.',
      action: function() { this._toggleDropdown(2, true); }
    },
    // --- FIN ---
    {
      target: '#btnSubscribePro, .btn-pro',
      icon: '💎',
      title: 'Le Futur est Pro',
      text: 'Débloquez l\'intégralité des fonctionnalités premium pour votre entreprise.',
      action: function() { this._closeAllDropdowns(); }
    },
    {
      target: null,
      icon: '🚀',
      title: 'Prêt pour le service !',
      text: 'Vous connaissez maintenant tout de GourmetRevient. À vous de créer !',
      position: 'center'
    }
  ],

  _toggleDropdown(index, open) {
    const dropdowns = document.querySelectorAll('.nav-dropdown');
    const el = dropdowns[index];
    if (!el) return;

    const trigger = el.querySelector('.nav-dropdown-trigger');
    const content = el.querySelector('.nav-dropdown-content');

    if (open) {
      el.classList.add('active');
      if (trigger) trigger.dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
      if (content) {
        content.style.setProperty('display', 'block', 'important');
        content.style.setProperty('opacity', '1', 'important');
        content.style.setProperty('visibility', 'visible', 'important');
        content.style.setProperty('transform', 'translateY(0)', 'important');
        content.style.zIndex = '10002';
      }
    } else {
      el.classList.remove('active');
      if (trigger) trigger.dispatchEvent(new MouseEvent('mouseleave', { bubbles: true }));
      if (content) {
        content.style.display = '';
        content.style.opacity = '';
        content.style.visibility = '';
      }
    }
  },

  _closeAllDropdowns() {
    for (let i = 0; i < 5; i++) this._toggleDropdown(i, false);
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
        #onboarding-spotlight { position: fixed; border-radius: 12px; box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.65); transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); pointer-events: none; z-index: 10000; outline: 3px solid #10b981; outline-offset: 4px; background: transparent; }
        
        #onboarding-card { 
          position: fixed; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 30px; padding: 0; width: 600px; max-width: calc(100vw - 40px); 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.6); pointer-events: all; 
          z-index: 10001; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1); 
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
        
        .ob-content { flex: 1; padding: 2.2rem; display: flex; flex-direction: column; justify-content: center; position: relative; transition: opacity 0.2s; }
        .ob-content.fading { opacity: 0; }
        .ob-content::before {
          content: ''; position: absolute; left: -12px; top: 50%; transform: translateY(-50%);
          border-top: 12px solid transparent; border-bottom: 12px solid transparent; border-right: 12px solid #1e293b;
        }

        .ob-icon { font-size: 2.5rem; margin-bottom: 0.8rem; display: block; transition: transform 0.3s; }
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
        <div class="ob-content" id="ob-inner-content">
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
    const inner = document.getElementById('ob-inner-content');
    
    // Animation de sortie rapide
    inner.classList.add('fading');
    
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
            inner.classList.remove('fading');
          }
        }, 30); // Plus rapide (30ms)
      } else {
        clearInterval(this.refreshTimer);
        this._updateSpotlight(null);
        setTimeout(() => {
          card.classList.add('visible');
          inner.classList.remove('fading');
        }, 100);
      }
    }, 250); // Délai réduit à 250ms pour plus de nervosité
  },

  _updateSpotlight(target) {
    const spotlight = document.getElementById('onboarding-spotlight');
    const card = document.getElementById('onboarding-card');
    
    if (target && target.offsetParent !== null) {
      const rect = target.getBoundingClientRect();
      if (rect.height === 0 || rect.width === 0) return;

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
    } else if (target === null) {
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
    this._closeAllDropdowns();
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 500);
  }
};

window.GourmetOnboarding = GourmetOnboarding;
