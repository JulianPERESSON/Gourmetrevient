/*
  =====================================================================
  PREMIUM-EFFECTS.JS — GourmetRevient v5.5
  ✨ Atmosphère Pâtissière (Particules Interactives)
  ✨ Glassmorphism 2.0 (Réfraction Lumineuse Spéculaire)
  ✨ Micro-animations GSAP Haptiques
  ✨ Alerte de Marge Prédictive (Cockpit)
  ✨ Audit Allergènes Production du Jour
  ✨ Master Converter Intégré dans l'éditeur
  ✨ Scanner OCR Smart (Batch Fournisseur)
  =====================================================================
*/

// ============================================================================
// 1. ATMOSPHÈRE PÂTISSIÈRE — Système de Particules Interactives
// ============================================================================

(function initAtmosphere() {
  document.addEventListener('DOMContentLoaded', () => {
    // Create canvas for particles
    const canvas = document.createElement('canvas');
    canvas.id = 'atmosphereCanvas';
    canvas.style.cssText = `
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      width: 100vw; height: 100vh; opacity: 0.6;
    `;
    document.body.prepend(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let animFrame;

    function resize() {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Track mouse with gentle lerp
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    const PARTICLE_COUNT = 45;
    const COLORS_LIGHT = [
      'rgba(197, 165, 90, 0.35)',   // Gold shimmer
      'rgba(212, 186, 122, 0.25)',  // Light gold
      'rgba(232, 213, 163, 0.2)',   // Pale gold
      'rgba(255, 253, 247, 0.4)',   // Flour white
      'rgba(245, 230, 200, 0.3)',   // Cream
      'rgba(196, 122, 63, 0.15)',   // Praline
    ];
    const COLORS_DARK = [
      'rgba(212, 186, 122, 0.2)',
      'rgba(197, 165, 90, 0.15)',
      'rgba(232, 213, 163, 0.1)',
      'rgba(255, 253, 247, 0.08)',
      'rgba(245, 230, 200, 0.12)',
    ];

    class Particle {
      constructor() { this.reset(); }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 3 + 0.8;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.2 - 0.15; // Gentle upward drift (tamisage)
        this.opacity = Math.random() * 0.6 + 0.2;
        this.life = Math.random() * 400 + 200;
        this.maxLife = this.life;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;

        const isDark = document.body.classList.contains('dark-theme');
        const colors = isDark ? COLORS_DARK : COLORS_LIGHT;
        this.color = colors[Math.floor(Math.random() * colors.length)];

        // Shape: 0 = circle (flour), 1 = sparkle (gold glitter)
        this.shape = Math.random() > 0.7 ? 1 : 0;
      }

      update() {
        // Mouse influence (gentle attraction within range)
        const dx = mouseX - this.x;
        const dy = mouseY - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 200 && dist > 10) {
          const force = 0.015 / (dist / 50);
          this.speedX += dx * force * 0.01;
          this.speedY += dy * force * 0.01;
        }

        // Damping
        this.speedX *= 0.995;
        this.speedY *= 0.995;

        this.x += this.speedX;
        this.y += this.speedY;
        this.rotation += this.rotationSpeed;
        this.life--;

        // Fade based on life
        const lifeRatio = this.life / this.maxLife;
        this.currentOpacity = this.opacity * (lifeRatio < 0.2 ? lifeRatio / 0.2 : (lifeRatio > 0.8 ? (1 - lifeRatio) / 0.2 : 1));

        if (this.life <= 0 || this.x < -20 || this.x > canvas.width + 20 || this.y < -20 || this.y > canvas.height + 20) {
          this.reset();
        }
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.globalAlpha = this.currentOpacity;

        if (this.shape === 0) {
          // Soft circle (flour particle)
          ctx.beginPath();
          ctx.arc(0, 0, this.size, 0, Math.PI * 2);
          ctx.fillStyle = this.color;
          ctx.fill();
        } else {
          // 4-point sparkle (gold glitter)
          ctx.fillStyle = this.color;
          const s = this.size * 1.5;
          ctx.beginPath();
          for (let i = 0; i < 4; i++) {
            const angle = (i * Math.PI) / 2;
            const outerX = Math.cos(angle) * s;
            const outerY = Math.sin(angle) * s;
            const innerAngle = angle + Math.PI / 4;
            const innerX = Math.cos(innerAngle) * s * 0.3;
            const innerY = Math.sin(innerAngle) * s * 0.3;
            if (i === 0) ctx.moveTo(outerX, outerY);
            else ctx.lineTo(outerX, outerY);
            ctx.lineTo(innerX, innerY);
          }
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }
    }

    // Initialize particles
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new Particle());
    }

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => { p.update(); p.draw(ctx); });
      animFrame = requestAnimationFrame(animate);
    }
    animate();

    // Pause animation when page is not visible
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrame);
      } else {
        animate();
      }
    });
  });
})();


// ============================================================================
// 2. GLASSMORPHISM 2.0 — Réfraction Lumineuse Spéculaire
// ============================================================================

(function initSpecularCards() {
  document.addEventListener('DOMContentLoaded', () => {
    // Inject gradient overlay on cards that reacts to cursor
    document.addEventListener('mousemove', (e) => {
      const cards = document.querySelectorAll('.cockpit-card, .mgmt-glass-card, .priority-card, .ai-expert-card, .production-main-card, .stock-compact-card, .business-compact-card, .activity-compact-card, .crm-kpi-card');
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Only apply when mouse is near the card
        if (x >= -80 && x <= rect.width + 80 && y >= -80 && y <= rect.height + 80) {
          card.style.setProperty('--specular-x', `${x}px`);
          card.style.setProperty('--specular-y', `${y}px`);
          card.classList.add('specular-active');
        } else {
          card.classList.remove('specular-active');
        }
      });
    });
  });
})();


// ============================================================================
// 3. MICRO-ANIMATIONS GSAP — Effet Haptique
// ============================================================================

(function initHapticEffects() {
  document.addEventListener('DOMContentLoaded', () => {

    // --- 3a. Success Ripple on buttons ---
    function createRipple(e) {
      const btn = e.currentTarget;
      const ripple = document.createElement('span');
      ripple.className = 'haptic-ripple';
      const rect = btn.getBoundingClientRect();
      ripple.style.left = `${e.clientX - rect.left}px`;
      ripple.style.top = `${e.clientY - rect.top}px`;
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 700);
    }

    // Attach ripple to primary buttons
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-primary, .p-action-btn');
      if (btn) createRipple(e);
    });

    // --- 3b. Toast Enhancement (bounce in) ---
    const origShowToast = window.showToast;
    if (typeof origShowToast === 'function') {
      window.showToast = function(message, type, duration) {
        origShowToast.call(this, message, type, duration);
        // Find the latest toast and add bounce animation
        setTimeout(() => {
          const toasts = document.querySelectorAll('.toast');
          const latest = toasts[toasts.length - 1];
          if (latest && window.gsap) {
            gsap.fromTo(latest,
              { scale: 0.8, opacity: 0, y: 20 },
              { scale: 1, opacity: 1, y: 0, duration: 0.5, ease: 'elastic.out(1.2, 0.5)' }
            );
          }
        }, 50);
      };
    }

    // --- 3c. Save Celebration Pulse ---
    // Observe DOM for new toasts with "sauvegard" to trigger a success pulse
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1 && node.classList?.contains('toast')) {
            const text = node.textContent?.toLowerCase() || '';
            if (text.includes('sauveg') || text.includes('saved') || text.includes('guard') || text.includes('succès')) {
              triggerSuccessPulse();
            }
          }
        });
      });
    });
    const toastContainer = document.getElementById('toast-container');
    if (toastContainer) {
      observer.observe(toastContainer, { childList: true });
    }

    function triggerSuccessPulse() {
      const pulse = document.createElement('div');
      pulse.className = 'haptic-success-pulse';
      document.body.appendChild(pulse);
      setTimeout(() => pulse.remove(), 1000);
    }
  });
})();


// ============================================================================
// 4. ALERTE DE MARGE PRÉDICTIVE — Cockpit Intelligence
// ============================================================================

window.renderPredictiveMarginAlert = function() {
  const container = document.getElementById('dashAIAdvice');
  if (!container) return;

  const lang = window.currentLang || localStorage.getItem('gourmet_lang') || 'fr';
  const t = (key, data) => (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t(key, data) : key;

  const currUser = localStorage.getItem('gourmet_current_user') || 'Chef';
  const recipes = (window.APP && window.APP.savedRecipes && window.APP.savedRecipes.length > 0)
    ? window.APP.savedRecipes
    : JSON.parse(localStorage.getItem(`gourmetrevient_recipes_${currUser.toLowerCase()}`) || '[]');

  if (recipes.length === 0) return;

  // Simulate ingredient price changes (butter, chocolate, flour)
  const priceChanges = [
    { ingredient: 'Beurre', icon: '🧈', change: +15, affected: [] },
    { ingredient: 'Chocolat', icon: '🍫', change: +8, affected: [] },
    { ingredient: 'Farine', icon: '🌾', change: +5, affected: [] },
  ];

  const MARGIN_THRESHOLD = 70;

  recipes.forEach(r => {
    if (!r.ingredients) return;
    const currentMargin = r.costs?.marginPct || 70;

    r.ingredients.forEach(ing => {
      const n = (ing.name || '').toLowerCase();
      priceChanges.forEach(pc => {
        if (n.includes(pc.ingredient.toLowerCase())) {
          // Estimate new margin impact
          const ingCost = typeof calcIngredientCost === 'function' ? calcIngredientCost(ing) : 0;
          const totalCost = r.costs?.totalMaterial || 1;
          const ingRatio = ingCost / Math.max(totalCost, 0.01);
          const marginDrop = ingRatio * pc.change;
          const newMargin = currentMargin - marginDrop;
          if (newMargin < MARGIN_THRESHOLD) {
            pc.affected.push({
              name: r.name,
              oldMargin: Math.round(currentMargin),
              newMargin: Math.round(newMargin),
              drop: Math.round(marginDrop * 10) / 10
            });
          }
        }
      });
    });
  });

  // Find the most impactful change
  const alerts = priceChanges
    .filter(pc => pc.affected.length > 0)
    .sort((a, b) => b.affected.length - a.affected.length);

  if (alerts.length === 0) {
    // All good - do NOT overwrite; let dashboard-premium.js keep its insight
    // (e.g. "Eclair café est votre recette la plus rentable")
    return;
  }

  const primary = alerts[0];
  const affectedNames = primary.affected.slice(0, 3).map(a => a.name).join(', ');
  const remaining = primary.affected.length > 3 ? ` +${primary.affected.length - 3} autres` : '';

  container.innerHTML = `
    <div class="ai-bubble ai-bubble-warning">
      <div class="ai-alert-header">
        <span class="ai-alert-icon">⚠️</span>
        <p><strong>Alerte Marge Prédictive</strong></p>
      </div>
      <p>Avec la hausse du ${primary.icon} ${primary.ingredient} (+${primary.change}%), 
      <strong>${primary.affected.length} recette${primary.affected.length > 1 ? 's' : ''}</strong> 
      ${primary.affected.length > 1 ? 'sont passées' : 'est passée'} sous la barre des ${MARGIN_THRESHOLD}% :</p>
      <div class="ai-affected-list">
        ${primary.affected.slice(0, 4).map(a => `
          <div class="ai-affected-item">
            <span class="ai-affected-name">${a.name}</span>
            <span class="ai-affected-margin">${a.oldMargin}% → <strong class="text-danger">${a.newMargin}%</strong></span>
          </div>
        `).join('')}
        ${remaining ? `<div class="ai-affected-more">${remaining}</div>` : ''}
      </div>
      <div class="ai-actions">
        <span class="ai-tip" onclick="showMgmt && showMgmt(); switchMgmtTab && switchMgmtTab('inflation');" style="cursor:pointer;">🔥 Voir la simulation d'inflation</span>
        <span class="ai-tip" onclick="showStats && showStats();" style="cursor:pointer;">📊 Voir les statistiques</span>
      </div>
    </div>
  `;
};

// Hook into dashboard hydration
const _origHydrate = window.hydratePremiumDashboard;
window.hydratePremiumDashboard = function() {
  if (typeof _origHydrate === 'function') _origHydrate();
  // Add predictive margin after brief delay
  setTimeout(() => {
    if (typeof renderPredictiveMarginAlert === 'function') renderPredictiveMarginAlert();
  }, 100);
};


// ============================================================================
// 5. AUDIT ALLERGÈNES — Production du Jour
// ============================================================================

window.renderAllergenAudit = function() {
  const container = document.getElementById('dashAllergenAudit');
  if (!container) return;

  const currUser = localStorage.getItem('gourmet_current_user') || 'Chef';
  const recipes = (window.APP && window.APP.savedRecipes && window.APP.savedRecipes.length > 0)
    ? window.APP.savedRecipes
    : JSON.parse(localStorage.getItem(`gourmetrevient_recipes_${currUser.toLowerCase()}`) || '[]');

  if (recipes.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.85rem; text-align:center; padding:1rem;">Aucune recette en production.</p>';
    return;
  }

  // Use first 4 recipes as "today's production"
  const todayProd = recipes.slice(0, 4);
  const allergenMap = {};
  const ALLERGEN_ICONS = {
    'Gluten': '🌾', 'Lait': '🥛', 'Œufs': '🥚', 'Fruits à coque': '🥜',
    'Soja': '🫘', 'Arachides': '🥜', 'Sésame': '🌱', 'Céleri': '🥬',
    'Moutarde': '🟡', 'Lupin': '🌿', 'Mollusques': '🦑', 'Crustacés': '🦐',
    'Poissons': '🐟', 'Sulfites': '🧪'
  };

  todayProd.forEach(r => {
    if (!r.ingredients) return;
    r.ingredients.forEach(ing => {
      const dbItem = (window.APP?.ingredientDb || []).find(db =>
        db.name.toLowerCase() === (ing.name || '').toLowerCase()
      );
      if (dbItem && dbItem.allergens) {
        dbItem.allergens.forEach(a => {
          if (!allergenMap[a]) allergenMap[a] = new Set();
          allergenMap[a].add(r.name);
        });
      }
    });
  });

  const allergens = Object.keys(allergenMap);

  if (allergens.length === 0) {
    container.innerHTML = '<p style="color:var(--success); font-size:0.85rem; text-align:center; padding:1rem;">✅ Aucun allergène majeur détecté dans la production du jour.</p>';
    return;
  }

  container.innerHTML = `
    <div class="allergen-audit-grid">
      ${allergens.map(a => {
        const icon = ALLERGEN_ICONS[a] || '⚠️';
        const recipesWithThis = [...allergenMap[a]];
        return `
          <div class="allergen-audit-item">
            <div class="allergen-icon">${icon}</div>
            <div class="allergen-info">
              <span class="allergen-name">${a}</span>
              <span class="allergen-recipes">${recipesWithThis.join(', ')}</span>
            </div>
          </div>
        `;
      }).join('')}
    </div>
    <div class="allergen-audit-footer">
      <span>📋 ${allergens.length} allergène${allergens.length > 1 ? 's' : ''} | ${todayProd.length} recettes en production</span>
    </div>
  `;
};


// ============================================================================
// 6. MASTER CONVERTER INTÉGRÉ — Bouton dans l'éditeur de recette
// ============================================================================

window.openMasterConverterForRecipe = function(recipeIdx) {
  // Open the standard Master Converter but pre-select the recipe
  if (typeof openMasterConverter === 'function') {
    openMasterConverter();
    // Pre-select the recipe
    setTimeout(() => {
      const sel = document.getElementById('mcRecipeSelect');
      if (sel && recipeIdx !== undefined && recipeIdx !== null) {
        sel.value = recipeIdx;
        if (typeof mcSelectRecipe === 'function') mcSelectRecipe(recipeIdx);
      }
    }, 200);
  }
};

// Inject "Adapter la taille" button on recipe cards
window.injectMoldAdapterButtons = function() {
  const savedCards = document.querySelectorAll('.saved-card');
  savedCards.forEach((card, idx) => {
    // Avoid adding duplicate buttons
    if (card.querySelector('.btn-mold-adapter')) return;
    const actionsArea = card.querySelector('.saved-card-actions') || card.querySelector('.card-actions');
    if (actionsArea) {
      const btn = document.createElement('button');
      btn.className = 'btn btn-sm btn-outline btn-mold-adapter';
      btn.innerHTML = '📐 Adapter la taille';
      btn.title = 'Adapter les quantités à un nouveau format de moule';
      btn.onclick = (e) => {
        e.stopPropagation();
        openMasterConverterForRecipe(idx);
      };
      actionsArea.appendChild(btn);
    }
  });
};

// Hook into recipe rendering to inject buttons
const _origRenderSaved = window.renderSavedRecipesGrid;
if (typeof _origRenderSaved === 'function') {
  window.renderSavedRecipesGrid = function() {
    _origRenderSaved.apply(this, arguments);
    setTimeout(injectMoldAdapterButtons, 300);
  };
}


// ============================================================================
// 7. SCANNER OCR SMART — Détection Fournisseur & Batch Update
// ============================================================================

window.renderSmartOCRResults = function(items, rawText) {
  const results = document.getElementById('ocrResults');
  if (!results) return;

  if (items.length === 0) {
    const t = (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t : (k) => k;
    results.innerHTML = `<div class="ocr-no-results"><p>${t('ocr.no_items') || 'Aucun article détecté.'}</p><pre>${rawText}</pre></div>`;
    return;
  }

  // Smart supplier detection
  const supplierKeywords = {
    'Valrhona': ['guanaja', 'jivara', 'dulcey', 'opalys', 'valrhona', 'inspiration', 'caramélia', 'manjari'],
    'Grands Moulins': ['grands moulins', 'gmp', 'gruau', 'farine t45', 'farine t55'],
    'Metro': ['metro', 'chef', 'horeca'],
    'Cacao Barry': ['barry', 'callebaut', 'ocoa', 'ghana', 'extra brut'],
    'Elle & Vire': ['elle & vire', 'elle et vire', 'excellence']
  };

  let detectedSupplier = null;
  const textLower = rawText.toLowerCase();
  for (const [supplier, keywords] of Object.entries(supplierKeywords)) {
    if (keywords.some(kw => textLower.includes(kw))) {
      detectedSupplier = supplier;
      break;
    }
  }

  // Group items by match status
  const matched = items.filter(i => i.matched);
  const unmatched = items.filter(i => !i.matched);

  // Calculate price changes
  const priceChanges = matched.map(item => {
    const oldPrice = item.oldPrice || 0;
    const newPrice = item.unitPrice || 0;
    const change = oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice * 100) : 0;
    return { ...item, priceChange: change };
  });

  const increases = priceChanges.filter(i => i.priceChange > 1);
  const decreases = priceChanges.filter(i => i.priceChange < -1);

  results.innerHTML = `
    ${detectedSupplier ? `
      <div class="ocr-supplier-badge">
        <span class="ocr-supplier-icon">🏢</span>
        <span>Fournisseur détecté : <strong>${detectedSupplier}</strong></span>
      </div>
    ` : ''}

    ${increases.length > 0 ? `
      <div class="ocr-batch-alert ocr-batch-danger">
        <div class="ocr-batch-header">
          <span>🔺 ${increases.length} hausse${increases.length > 1 ? 's' : ''} de prix détectée${increases.length > 1 ? 's' : ''}</span>
          <button class="btn btn-sm btn-primary" onclick="applyOCRBatch('increases')">Mettre à jour tout</button>
        </div>
        <div class="ocr-batch-items">
          ${increases.map((item, i) => `
            <div class="ocr-smart-item">
              <span class="ocr-item-name">${item.dbName || item.name}</span>
              <span class="ocr-item-old">${item.oldPrice?.toFixed(2)}€</span>
              <span class="ocr-item-arrow">→</span>
              <span class="ocr-item-new text-danger">${item.unitPrice.toFixed(2)}€ (+${item.priceChange.toFixed(1)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${decreases.length > 0 ? `
      <div class="ocr-batch-alert ocr-batch-success">
        <div class="ocr-batch-header">
          <span>🔻 ${decreases.length} baisse${decreases.length > 1 ? 's' : ''} de prix</span>
          <button class="btn btn-sm btn-outline" onclick="applyOCRBatch('decreases')">Appliquer</button>
        </div>
        <div class="ocr-batch-items">
          ${decreases.map((item, i) => `
            <div class="ocr-smart-item">
              <span class="ocr-item-name">${item.dbName || item.name}</span>
              <span class="ocr-item-old">${item.oldPrice?.toFixed(2)}€</span>
              <span class="ocr-item-arrow">→</span>
              <span class="ocr-item-new text-success">${item.unitPrice.toFixed(2)}€ (${item.priceChange.toFixed(1)}%)</span>
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    ${matched.length > 0 ? `
      <div class="ocr-summary-bar">
        <span>📊 ${matched.length} ingrédients reconnus sur ${items.length} lignes analysées</span>
      </div>
    ` : ''}

    <button class="btn btn-primary btn-full" style="margin-top:1rem;" onclick="applyAllOCRPrices(); closeOCRScanner();">
      ✅ Appliquer toutes les mises à jour (${matched.length})
    </button>
  `;

  // Store items for batch operations
  window._ocrItems = items;
  window._ocrPriceChanges = priceChanges;
};

window.applyOCRBatch = function(type) {
  const changes = window._ocrPriceChanges || [];
  const targets = type === 'increases'
    ? changes.filter(i => i.priceChange > 1)
    : changes.filter(i => i.priceChange < -1);

  let updated = 0;
  targets.forEach(item => {
    if (item.matched && item.dbName) {
      const dbItem = APP.ingredientDb.find(db => db.name === item.dbName);
      if (dbItem) {
        dbItem.pricePerUnit = item.unitPrice;
        updated++;
      }
    }
  });

  if (updated > 0) {
    saveIngredientDb();
    showToast(`✅ ${updated} prix mis à jour en lot !`, 'success');
    if (typeof triggerChocolateRain === 'function') triggerChocolateRain('light');
  }
};

// Override render to use smart version
const _origRenderOCR = window.renderOCRResults;
window.renderOCRResults = function(items, rawText) {
  renderSmartOCRResults(items, rawText);
};

// ============================================================================
// 8. INJECT ALLERGEN AUDIT CARD INTO COCKPIT
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Add Allergen Audit card to cockpit bottom grid
  const bottomGrid = document.querySelector('.bottom-stats-grid');
  if (bottomGrid && !document.getElementById('dashAllergenAudit')) {
    const allergenCard = document.createElement('div');
    allergenCard.className = 'cockpit-card allergen-audit-card';
    allergenCard.innerHTML = `
      <div class="card-header-premium">
        <div class="header-main">
          <span class="icon-p" style="color:#ef4444;">⚠️</span>
          <h3>Audit Allergènes</h3>
        </div>
        <span class="badge-new">INCO</span>
      </div>
      <div id="dashAllergenAudit"></div>
    `;
    bottomGrid.appendChild(allergenCard);
  }

  // Wait for auth to disappear to trigger initial render
  const checkAuthAndRenderAllergens = () => {
    if (!document.body.classList.contains('auth-pending')) {
      setTimeout(() => {
        if (typeof renderAllergenAudit === 'function') renderAllergenAudit();
      }, 500);
    } else {
      setTimeout(checkAuthAndRenderAllergens, 100);
    }
  };
  checkAuthAndRenderAllergens();
});

// ============================================================================
// 9. TICKER ANIMATION — Compteurs de Précision
// ============================================================================

window.animateTicker = function(element, endValue, duration = 1200, suffix = '') {
  if (!element) return;
  const startValue = parseFloat(element.getAttribute('data-val') || 0);
  const end = parseFloat(endValue);
  
  if (isNaN(end)) {
    element.textContent = endValue + suffix;
    return;
  }
  
  element.setAttribute('data-val', end);
  
  const startTime = performance.now();
  const isInteger = Number.isInteger(end) && Number.isInteger(startValue);
  
  function step(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease out expo (like a luxury watch settling on the number)
    const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
    const currentVal = startValue + (end - startValue) * easeProgress;
    
    if (isInteger) {
      element.textContent = Math.round(currentVal) + suffix;
    } else {
      element.textContent = currentVal.toFixed(2) + suffix;
    }
    
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      element.textContent = (isInteger ? Math.round(end) : end.toFixed(2)) + suffix;
    }
  }
  
  requestAnimationFrame(step);
};
