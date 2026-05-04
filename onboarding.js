/**
 * GOURMETREVIENT — Module Onboarding
 * Guide interactif pour les nouveaux utilisateurs (première connexion)
 */

const GourmetOnboarding = {
  STORAGE_KEY: 'gourmet_onboarding_done_v1',
  currentStep: 0,
  overlay: null,

  steps: [
    {
      target: null, // écran d'accueil centré
      icon: '🧁',
      title: 'Bienvenue sur GourmetRevient !',
      text: 'Votre outil professionnel pour calculer vos coûts de revient, gérer vos marges et piloter votre activité de pâtissier artisan.',
      position: 'center'
    },
    {
      target: '[data-section="recettes"], #nav-recettes, .nav-item:first-child',
      icon: '📋',
      title: 'Vos Recettes',
      text: 'Créez et gérez toutes vos fiches techniques. Chaque recette calcule automatiquement le coût matière, la marge et le prix de vente conseillé.',
      position: 'bottom'
    },
    {
      target: '[data-section="inventaire"], #nav-inventaire',
      icon: '📦',
      title: 'Inventaire & Ingrédients',
      text: 'Renseignez vos prix d\'achat fournisseurs. GourmetRevient met à jour vos coûts de revient automatiquement à chaque modification.',
      position: 'bottom'
    },
    {
      target: '[data-section="stats"], #nav-stats, .nav-stats',
      icon: '📊',
      title: 'Cockpit de Pilotage',
      text: 'Analysez vos performances en temps réel : marge par catégorie, matrice BCG, simulateur d\'inflation et tableau de bord quotidien.',
      position: 'bottom'
    },
    {
      target: '#btnSubscribePro, .btn-pro',
      icon: '⭐',
      title: 'Passer en mode Pro',
      text: 'Débloquez la synchronisation Cloud, le CRM clients, les exports PDF et bien plus. Commencez gratuitement, passez Pro quand vous voulez.',
      position: 'bottom'
    },
    {
      target: null,
      icon: '🚀',
      title: 'C\'est parti !',
      text: 'GourmetRevient est prêt. Commencez par créer votre première recette ou explorez la bibliothèque des 61 recettes intégrées.',
      position: 'center'
    }
  ],

  /**
   * Démarre l'onboarding si c'est la première connexion
   */
  init() {
    const done = localStorage.getItem(this.STORAGE_KEY);
    if (done) return;
    // Délai court pour laisser l'UI se charger
    setTimeout(() => this.start(), 1500);
  },

  /**
   * Force le démarrage (pour re-voir le tour)
   */
  start() {
    this.currentStep = 0;
    this._buildOverlay();
    this._showStep(0);
  },

  _buildOverlay() {
    // Nettoyer si déjà présent
    const existing = document.getElementById('onboarding-overlay');
    if (existing) existing.remove();

    this.overlay = document.createElement('div');
    this.overlay.id = 'onboarding-overlay';
    this.overlay.innerHTML = `
      <style>
        #onboarding-overlay {
          position: fixed; inset: 0; z-index: 99999;
          pointer-events: none;
        }
        #onboarding-backdrop {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.65);
          backdrop-filter: blur(3px);
          pointer-events: all;
        }
        #onboarding-spotlight {
          position: fixed;
          border-radius: 16px;
          box-shadow: 0 0 0 9999px rgba(0,0,0,0.65);
          transition: all 0.4s cubic-bezier(.4,0,.2,1);
          pointer-events: none;
          display: none;
        }
        #onboarding-card {
          position: fixed;
          background: linear-gradient(135deg, #1e293b, #0f172a);
          border: 1px solid rgba(99,102,241,0.3);
          border-radius: 20px;
          padding: 2rem;
          max-width: 380px;
          width: calc(100vw - 3rem);
          box-shadow: 0 25px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1);
          pointer-events: all;
          z-index: 100000;
          transition: all 0.4s cubic-bezier(.4,0,.2,1);
          animation: onboardFadeIn 0.3s ease;
        }
        @keyframes onboardFadeIn {
          from { opacity:0; transform: scale(0.92) translateY(10px); }
          to   { opacity:1; transform: scale(1)   translateY(0); }
        }
        #onboarding-card .ob-icon {
          font-size: 2.5rem; margin-bottom: 0.75rem; display: block;
          animation: obBounce 1s ease infinite alternate;
        }
        @keyframes obBounce { from { transform: translateY(0); } to { transform: translateY(-6px); } }
        #onboarding-card h3 {
          font-family: 'Inter', sans-serif;
          color: #f1f5f9; font-size: 1.15rem; font-weight: 800;
          margin-bottom: 0.6rem; line-height: 1.3;
        }
        #onboarding-card p {
          color: #94a3b8; font-size: 0.88rem; line-height: 1.6; margin-bottom: 1.5rem;
        }
        .ob-footer {
          display: flex; align-items: center; justify-content: space-between; gap: 1rem;
        }
        .ob-dots { display: flex; gap: 6px; }
        .ob-dot {
          width: 8px; height: 8px; border-radius: 50%;
          background: rgba(255,255,255,0.2); transition: all 0.3s;
        }
        .ob-dot.active { background: #6366f1; width: 22px; border-radius: 4px; }
        .ob-btns { display: flex; gap: 0.5rem; }
        .ob-btn {
          padding: 0.5rem 1.1rem; border-radius: 10px; font-size: 0.82rem;
          font-weight: 700; cursor: pointer; border: none; font-family: 'Inter', sans-serif;
          transition: all 0.2s;
        }
        .ob-btn-skip {
          background: transparent; color: #64748b;
          border: 1px solid rgba(255,255,255,0.1);
        }
        .ob-btn-skip:hover { color: #94a3b8; }
        .ob-btn-next {
          background: linear-gradient(135deg, #6366f1, #8b5cf6);
          color: #fff;
          box-shadow: 0 4px 15px rgba(99,102,241,0.35);
        }
        .ob-btn-next:hover { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.5); }
        .ob-btn-finish {
          background: linear-gradient(135deg, #10b981, #059669);
          color: #fff;
          box-shadow: 0 4px 15px rgba(16,185,129,0.35);
        }
        .ob-btn-finish:hover { transform: translateY(-1px); }
        .ob-progress-text {
          font-size: 0.72rem; color: #475569; font-family: 'Inter', sans-serif;
        }
      </style>
      <div id="onboarding-backdrop"></div>
      <div id="onboarding-spotlight"></div>
      <div id="onboarding-card">
        <span class="ob-icon" id="ob-icon"></span>
        <h3 id="ob-title"></h3>
        <p id="ob-text"></p>
        <div class="ob-footer">
          <div>
            <div class="ob-dots" id="ob-dots"></div>
            <div class="ob-progress-text" id="ob-progress"></div>
          </div>
          <div class="ob-btns">
            <button class="ob-btn ob-btn-skip" id="ob-skip">Passer</button>
            <button class="ob-btn ob-btn-next" id="ob-next">Suivant →</button>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(this.overlay);

    document.getElementById('ob-skip').addEventListener('click', () => this.finish());
    document.getElementById('ob-next').addEventListener('click', () => this.next());
  },

  _showStep(idx) {
    const step = this.steps[idx];
    const total = this.steps.length;
    const card = document.getElementById('onboarding-card');
    const spotlight = document.getElementById('onboarding-spotlight');

    // Content
    document.getElementById('ob-icon').textContent = step.icon;
    document.getElementById('ob-title').textContent = step.title;
    document.getElementById('ob-text').textContent = step.text;
    document.getElementById('ob-progress').textContent = `${idx + 1} / ${total}`;

    // Dots
    const dotsEl = document.getElementById('ob-dots');
    dotsEl.innerHTML = this.steps.map((_, i) =>
      `<div class="ob-dot ${i === idx ? 'active' : ''}"></div>`
    ).join('');

    // Last step button
    const nextBtn = document.getElementById('ob-next');
    if (idx === total - 1) {
      nextBtn.textContent = '✅ Commencer !';
      nextBtn.className = 'ob-btn ob-btn-finish';
    } else {
      nextBtn.textContent = 'Suivant →';
      nextBtn.className = 'ob-btn ob-btn-next';
    }

    // Spotlight on target
    const target = step.target ? document.querySelector(step.target) : null;
    if (target) {
      const rect = target.getBoundingClientRect();
      const pad = 8;
      spotlight.style.display = 'block';
      spotlight.style.left = (rect.left - pad) + 'px';
      spotlight.style.top = (rect.top - pad) + 'px';
      spotlight.style.width = (rect.width + pad * 2) + 'px';
      spotlight.style.height = (rect.height + pad * 2) + 'px';

      // Position card near target
      const cardW = 380;
      const cardH = 220;
      let top = rect.bottom + 16;
      let left = rect.left;
      if (top + cardH > window.innerHeight) top = rect.top - cardH - 16;
      if (left + cardW > window.innerWidth - 16) left = window.innerWidth - cardW - 16;
      left = Math.max(16, left);
      card.style.top = top + 'px';
      card.style.left = left + 'px';
      card.style.transform = '';
    } else {
      // Center card
      spotlight.style.display = 'none';
      card.style.top = '50%';
      card.style.left = '50%';
      card.style.transform = 'translate(-50%, -50%)';
    }
  },

  next() {
    if (this.currentStep < this.steps.length - 1) {
      this.currentStep++;
      this._showStep(this.currentStep);
    } else {
      this.finish();
    }
  },

  finish() {
    localStorage.setItem(this.STORAGE_KEY, '1');
    const overlay = document.getElementById('onboarding-overlay');
    if (overlay) {
      overlay.style.opacity = '0';
      overlay.style.transition = 'opacity 0.4s ease';
      setTimeout(() => overlay.remove(), 400);
    }
    if (typeof showToast === 'function') {
      showToast('🚀 Bienvenue ! Votre espace est prêt.', 'success');
    }
  },

  /**
   * Réinitialise l'onboarding (pour tests ou menu "Aide")
   */
  reset() {
    localStorage.removeItem(this.STORAGE_KEY);
    this.start();
  }
};

window.GourmetOnboarding = GourmetOnboarding;
