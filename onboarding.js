/**
 * GOURMETREVIENT — Module Onboarding Expert v8.9
 * Correction : Rétablissement du cadre (spotlight) interactif pour les étapes d'action
 */

const GourmetOnboarding = {
  STORAGE_KEY: 'gourmet_onboarding_done_v1',
  currentStep: 0,
  overlay: null,
  refreshTimer: null,
  typingTimer: null,

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
      text: 'Cliquez sur "L\'Atelier" pour débloquer les outils de création.',
      action: function() { this._toggleDropdown(0, false); },
      requireClick: '.nav-dropdown:nth-child(3) .nav-dropdown-trigger'
    },
    {
      target: '#navRecettes',
      icon: '📖',
      title: 'Calculateur de Recettes',
      text: 'Créez vos fiches techniques et maîtrisez votre rentabilité au gramme près.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navChefsBrain',
      icon: '🧠',
      title: 'Cerveau du Chef',
      text: 'Trouvez l\'accord parfait ! Ce dictionnaire expert vous suggère les meilleures associations de saveurs.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navAssembly',
      icon: '🏗️',
      title: 'Simulateur de Montage',
      text: 'Visualisez vos entremets en coupe et ajustez vos épaisseurs de couches graphiquement.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navConverter',
      icon: '📏',
      title: 'Convertisseur de Moules',
      text: 'Adaptez vos quantités à n\'importe quel format de moule en un clic.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navPortfolio',
      icon: '🖼️',
      title: 'Portfolio Client',
      text: 'Une galerie visuelle pour présenter vos réalisations à vos clients.',
      action: function() { this._toggleDropdown(0, true); }
    },
    {
      target: '#navScheduler',
      icon: '🎓',
      title: 'Ordonnancement',
      text: 'Planifiez vos étapes de production pas à pas pour ne jamais être pris de court.',
      action: function() { this._toggleDropdown(0, true); }
    },
    // --- MENU 2 : PILOTAGE ---
    {
      target: '.nav-dropdown:nth-child(4) .nav-dropdown-trigger',
      icon: '📈',
      title: 'Pilotage & Outils',
      text: 'Cliquez sur ce menu pour voir vos outils analytiques.',
      action: function() { this._closeAllDropdowns(); },
      requireClick: '.nav-dropdown:nth-child(4) .nav-dropdown-trigger'
    },
    {
      target: '#navStats',
      icon: '📊',
      title: 'Dashboard Analytique',
      text: 'Suivez vos prix, vos marges et l\'impact de l\'inflation sur votre catalogue.',
      action: function() { this._toggleDropdown(1, true); }
    },
    {
      target: '#navCatalogue',
      icon: '🌐',
      title: 'E-Catalogue Pro',
      text: 'Générez une vitrine numérique propre pour présenter vos tarifs aux clients.',
      action: function() { this._toggleDropdown(1, true); }
    },
    {
      target: '#navCRM',
      icon: '🤝',
      title: 'Commandes & CRM',
      text: 'Gérez votre base client et suivez l\'historique de chaque commande.',
      action: function() { this._toggleDropdown(1, true); }
    },
    {
      target: '#navProTools',
      icon: '🛠️',
      title: 'Outils Métier',
      text: 'Des calculateurs spécifiques pour les professionnels de la pâtisserie.',
      action: function() { this._toggleDropdown(1, true); }
    },
    // --- MENU 3 : LABO ---
    {
      target: '.nav-dropdown:nth-child(5) .nav-dropdown-trigger',
      icon: '🛡️',
      title: 'Labo & Sécurité',
      text: 'Cliquez ici pour accéder à la gestion du laboratoire.',
      action: function() { this._closeAllDropdowns(); },
      requireClick: '.nav-dropdown:nth-child(5) .nav-dropdown-trigger'
    },
    {
      target: '#navPlanning',
      icon: '🌴',
      title: 'Équipe & Congés',
      text: 'Organisez les plannings et suivez les absences de vos collaborateurs.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navInventaire',
      icon: '📦',
      title: 'Stocks & Ingrédients',
      text: 'Mettez à jour vos prix d\'achat une seule fois ici pour impacter toutes vos recettes.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navSuppliers',
      icon: '🏢',
      title: 'Fournisseurs',
      text: 'Centralisez les contacts et les tarifs de tous vos partenaires.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navHygiene',
      icon: '🧼',
      title: 'Hygiène & HACCP Pro',
      text: 'Suivez vos protocoles de nettoyage et de sécurité alimentaire.',
      action: function() { this._toggleDropdown(2, true); }
    },
    {
      target: '#navLabo',
      icon: '📐',
      title: 'Matériel & Outillage (2D)',
      text: 'Aménagement de votre laboratoire en 2D et gestion du petit matériel.',
      action: function() { this._toggleDropdown(2, true); }
    },
    // --- FIN ---
    {
      target: '#btnSubscribePro, .btn-pro',
      icon: '💎',
      title: 'Le Futur est Pro',
      text: 'Débloquez l\'intégralité des fonctionnalités premium pour booster votre croissance.',
      action: function() { this._closeAllDropdowns(); }
    },
    {
      target: null,
      icon: '🚀',
      title: 'À vous de jouer !',
      text: 'Votre laboratoire numérique est maintenant entre vos mains. Bonne réussite !',
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
    this._initParallax();
  },

  _initParallax() {
    document.addEventListener('mousemove', (e) => {
      const card = document.getElementById('onboarding-card');
      const char = document.getElementById('ob-char');
      if (!card || !char) return;
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      char.style.transform = `scale(1.1) translateX(${x * 12}px) translateY(${y * 12}px)`;
    });
  },

  _buildOverlay() {
    if (document.getElementById('onboarding-overlay')) document.getElementById('onboarding-overlay').remove();
    this.overlay = document.createElement('div');
    this.overlay.id = 'onboarding-overlay';
    this.overlay.innerHTML = `
      <style>
        #onboarding-overlay { position: fixed; inset: 0; z-index: 9998; pointer-events: none; font-family: 'Inter', sans-serif; }
        #onboarding-backdrop { position: fixed; inset: 0; background: transparent; pointer-events: all; transition: opacity 0.4s; z-index: 9999; }
        
        #onboarding-spotlight { 
          position: fixed; border-radius: 12px; box-shadow: 0 0 0 9999px rgba(15, 23, 42, 0.7); 
          transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1); pointer-events: none; z-index: 10000; 
          outline: 3px solid #10b981; outline-offset: 4px; background: transparent;
          animation: obPulse 2s infinite ease-in-out;
        }
        
        @keyframes obPulse {
          0%, 100% { outline-color: #10b981; outline-width: 3px; }
          50% { outline-color: #34d399; outline-width: 5px; }
        }
        
        #onboarding-card { 
          position: fixed; background: #1e293b; border: 1px solid rgba(255, 255, 255, 0.1); 
          border-radius: 24px; padding: 0; width: 620px; max-width: calc(100vw - 40px); 
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); pointer-events: all; 
          z-index: 10001; transition: all 0.6s cubic-bezier(0.19, 1, 0.22, 1); 
          opacity: 0; transform: scale(0.9); color: white; display: flex; overflow: hidden;
        }
        #onboarding-card.visible { opacity: 1; transform: scale(1); }
        
        .ob-character-container {
          width: 250px; position: relative; display: flex; overflow: hidden; flex-shrink: 0;
          background: #e2f4e6;
        }
        .ob-character-img {
          width: 100%; height: 100%; object-fit: cover;
          object-position: top center;
          will-change: transform;
        }
        
        .ob-content { flex: 1; padding: 2rem; display: flex; flex-direction: column; justify-content: center; position: relative; }
        .ob-icon { font-size: 2.2rem; margin-bottom: 0.8rem; display: block; }
        .ob-title { color: white; font-size: 1.4rem; font-weight: 800; margin-bottom: 0.6rem; line-height: 1.2; }
        .ob-text { color: #cbd5e1; font-size: 0.95rem; line-height: 1.5; margin-bottom: 1.8rem; min-height: 3rem; }
        .ob-footer { display: flex; align-items: center; justify-content: space-between; margin-top: auto; }
        .ob-progress-bar { flex: 1; height: 5px; background: rgba(255,255,255,0.1); border-radius: 10px; margin-right: 1.5rem; overflow: hidden; }
        .ob-progress-fill { height: 100%; background: #10b981; transition: width 0.3s; }
        .ob-btn { padding: 0.7rem 1.5rem; border-radius: 12px; font-weight: 800; cursor: pointer; border: none; background: #10b981; color: white; font-size: 0.95rem; transition: all 0.2s; }
        .ob-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
        .ob-btn.disabled { opacity: 0; pointer-events: none; }
        .ob-skip { background: transparent; color: #94a3b8; font-size: 0.8rem; margin-top: 1.2rem; cursor: pointer; border: none; display: block; width: 100%; text-align: center; text-decoration: underline; opacity: 0.6; }
        
        .confetti { position: fixed; width: 10px; height: 10px; z-index: 10002; top: -10px; border-radius: 2px; animation: confettiFall 3s ease-in forwards; }
        @keyframes confettiFall {
          0% { transform: translateY(0) rotate(0); opacity: 1; }
          100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
        }
      </style>
      <div id="onboarding-backdrop"></div>
      <div id="onboarding-spotlight"></div>
      <div id="onboarding-card">
        <div class="ob-character-container">
          <img src="./personnage.jpg?v=3.4.0" id="ob-char" class="ob-character-img" alt="Chef">
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

  _typeWriter(element, text, speed = 20) {
    element.innerHTML = '';
    let i = 0;
    clearInterval(this.typingTimer);
    this.typingTimer = setInterval(() => {
      if (i < text.length) {
        element.innerHTML += text.charAt(i);
        i++;
      } else {
        clearInterval(this.typingTimer);
      }
    }, speed);
  },

  _showStep(idx) {
    const step = this.steps[idx];
    const card = document.getElementById('onboarding-card');
    const nextBtn = document.getElementById('ob-next');
    const spotlight = document.getElementById('onboarding-spotlight');
    const backdrop = document.getElementById('onboarding-backdrop');
    
    if (step.action) step.action.call(this);

    if (step.requireClick) {
      nextBtn.classList.add('disabled');
      // On garde le spotlight mais on rend le backdrop non-bloquant
      spotlight.style.opacity = '1';
      backdrop.style.opacity = '0';
      backdrop.style.pointerEvents = 'none';
      
      const targetEl = document.querySelector(step.requireClick);
      if (targetEl) {
        const handler = () => {
          // On remet le backdrop bloquant après le clic
          backdrop.style.opacity = '1';
          backdrop.style.pointerEvents = 'all';
          targetEl.removeEventListener('click', handler);
          this.next();
        };
        targetEl.addEventListener('click', handler);
      }
    } else {
      nextBtn.classList.remove('disabled');
      spotlight.style.opacity = '1';
      backdrop.style.opacity = '1';
      backdrop.style.pointerEvents = 'all';
      nextBtn.innerText = idx === this.steps.length - 1 ? 'Terminer ✨' : 'Suivant';
    }

    setTimeout(() => {
      document.getElementById('ob-icon').innerText = step.icon;
      document.getElementById('ob-title').innerText = step.title;
      this._typeWriter(document.getElementById('ob-text'), step.text);
      document.getElementById('ob-progress').style.width = ((idx + 1) / this.steps.length * 100) + '%';
      const target = step.target ? document.querySelector(step.target) : null;
      if (idx === 0) card.classList.add('visible');
      this._updateSpotlight(target);
    }, 200); 
  },

  _getCurrentTarget() {
    const step = this.steps[this.currentStep];
    return step && step.target ? document.querySelector(step.target) : null;
  },

  _updateSpotlight(target) {
    const spotlight = document.getElementById('onboarding-spotlight');
    const card = document.getElementById('onboarding-card');
    if (target && target.offsetParent !== null) {
      const rect = target.getBoundingClientRect();
      spotlight.style.left = (rect.left - 10) + 'px';
      spotlight.style.top = (rect.top - 10) + 'px';
      spotlight.style.width = (rect.width + 20) + 'px';
      spotlight.style.height = (rect.height + 20) + 'px';
      spotlight.style.opacity = '1';
      
      const cardHeight = card.offsetHeight || 350;
      const cardWidth = card.offsetWidth || 620;
      
      let top = rect.bottom + 40;
      if (top + cardHeight > window.innerHeight) {
        top = rect.top - cardHeight - 40;
      }
      
      top = Math.max(80, Math.min(top, window.innerHeight - cardHeight - 30));
      
      let left = rect.left + (rect.width / 2) - (cardWidth / 2);
      left = Math.max(20, Math.min(left, window.innerWidth - cardWidth - 20));
      
      card.style.top = top + 'px';
      card.style.left = left + 'px';
      card.style.transform = 'none';
      card.classList.add('visible');
    } else {
      spotlight.style.opacity = '0';
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.transform = 'translate(-50%, -50%)';
    }
  },

  _launchConfetti() {
    for (let i = 0; i < 120; i++) {
      const c = document.createElement('div');
      c.className = 'confetti';
      c.style.left = Math.random() * 100 + 'vw';
      c.style.backgroundColor = ['#f2d74e', '#95c3de', '#ff9a91', '#10b981'][Math.floor(Math.random() * 4)];
      c.style.animationDelay = Math.random() * 2 + 's';
      c.style.width = Math.random() * 8 + 4 + 'px';
      c.style.height = c.style.width;
      document.body.appendChild(c);
      setTimeout(() => c.remove(), 4000);
    }
  },

  next() {
    this.currentStep++;
    if (this.currentStep < this.steps.length) {
      this._showStep(this.currentStep);
    } else {
      this._launchConfetti();
      setTimeout(() => this.finish(), 2500);
    }
  },

  finish() {
    localStorage.setItem(this.STORAGE_KEY, 'true');
    this._closeAllDropdowns();
    document.getElementById('onboarding-card').classList.remove('visible');
    this.overlay.style.opacity = '0';
    setTimeout(() => this.overlay.remove(), 400);
  }
};

window.GourmetOnboarding = GourmetOnboarding;
