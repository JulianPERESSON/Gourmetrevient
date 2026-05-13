/*
 * ============================================================
 * CORE UPGRADE — GourmetRevient v12.2.0
 * Fonctionnalités : Pont Production→Inventaire, Alertes HACCP,
 *                   Allergènes, Historique Recettes, Baseline Lock
 * ============================================================
 */

// ============================================================
// 1. PONT PRODUCTION → INVENTAIRE
// Décrémente l'inventaire quand une production passe à "done"
// ============================================================
window.syncInventoryWithProduction = async function(productionItem) {
  if (!productionItem || productionItem.status !== 'done') return;

  // Trouver la recette correspondante
  const allRecipes = [
    ...(APP.savedRecipes || []),
    ...(typeof RECIPES !== 'undefined' ? RECIPES : [])
  ];
  const recipe = allRecipes.find(r =>
    r.id === productionItem.recipeId || r.name === productionItem.name
  );

  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    console.warn('[SyncInventory] Recette introuvable ou sans ingrédients:', productionItem.name);
    return;
  }

  const qtyMultiplier = (productionItem.qty || 1) / (recipe.portions || 10);
  let updatedCount = 0;
  const alerts = [];

  APP.inventory.forEach(invItem => {
    const ing = recipe.ingredients.find(i =>
      i.name.toLowerCase().trim() === invItem.name.toLowerCase().trim()
    );
    if (!ing) return;

    // Calculer la quantité utilisée (en grammes/ml/pièces selon l'ingrédient)
    const used = (parseFloat(ing.qty) || 0) * qtyMultiplier;
    const before = invItem.stock || 0;
    invItem.stock = Math.max(0, before - used);
    invItem.lastUpdate = new Date().toISOString();
    updatedCount++;

    // Alerte si stock tombe sous le seuil
    if (invItem.stock <= (invItem.alertThreshold || 0)) {
      alerts.push(invItem.name);
    }
  });

  if (updatedCount > 0) {
    if (typeof saveInventory === 'function') saveInventory();

    // Sync Supabase si dispo
    if (window.gourmetSupabase && navigator.onLine) {
      try {
        const { data: { session } } = await gourmetSupabase.auth.getSession();
        const userId = session?.user?.id;
        if (userId) {
          const updates = APP.inventory.map(item => ({
            user_id: userId,
            name: item.name,
            stock_actuel: item.stock,
            updated_at: item.lastUpdate
          }));
          await gourmetSupabase.from('ingredients').upsert(updates, { onConflict: 'user_id,name' });
        }
      } catch(e) { console.warn('[SyncInventory] Supabase sync failed:', e.message); }
    }

    if (typeof showToast === 'function') {
      showToast(`✅ Stocks mis à jour (${updatedCount} ingrédients décrementés)`, 'success');
    }

    if (alerts.length > 0 && typeof showToast === 'function') {
      setTimeout(() => {
        showToast(`⚠️ Stock critique : ${alerts.slice(0,3).join(', ')}${alerts.length > 3 ? '…' : ''}`, 'warning');
      }, 1500);
    }
  }

  // Re-render l'inventaire si visible
  if (typeof renderInventoryTable === 'function') renderInventoryTable();
  if (typeof updateDashboard === 'function') updateDashboard();
};

// Patch updateProductionStatus pour déclencher le pont automatiquement
const _origUpdateProductionStatus = window.updateProductionStatus;
window.updateProductionStatus = function(idx, status) {
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  const item = plan[idx];
  if (item && status === 'done' && item.status !== 'done') {
    // Déclencher la synchro inventaire avant la mise à jour du statut
    window.syncInventoryWithProduction({ ...item, status: 'done' });
  }
  if (_origUpdateProductionStatus) _origUpdateProductionStatus(idx, status);
};


// ============================================================
// 2. ALERTES HACCP — PÉREMPTION PRÉDICTIVE
// ============================================================
window.GourmetHACCPAlerts = {

  /** Analyse les lots de traçabilité et retourne les alertes */
  getExpiryAlerts() {
    const trace = APP.haccpLogs?.trace || [];
    const now = new Date();
    const alerts = [];

    trace.forEach(lot => {
      if (!lot.exp) return;
      const expDate = new Date(lot.exp);
      const diffHours = (expDate - now) / (1000 * 60 * 60);

      if (diffHours < 0) {
        alerts.push({ ...lot, severity: 'expired', diffHours });
      } else if (diffHours < 24) {
        alerts.push({ ...lot, severity: 'critical', diffHours });
      } else if (diffHours < 72) {
        alerts.push({ ...lot, severity: 'warning', diffHours });
      }
    });

    return alerts.sort((a, b) => a.diffHours - b.diffHours);
  },

  /** Injecte une bannière d'alertes dans le module HACCP */
  renderAlertBanner() {
    // Crée le container s'il n'existe pas encore
    let container = document.getElementById('haccpExpiryAlerts');
    if (!container) {
      // Injection dynamique avant le tableau de traçabilité
      const tableResponsive = document.querySelector('#haccpViewTrace .table-responsive');
      if (!tableResponsive) return;
      container = document.createElement('div');
      container.id = 'haccpExpiryAlerts';
      container.style.marginBottom = '1.5rem';
      tableResponsive.parentElement.insertBefore(container, tableResponsive);
    }

    const alerts = this.getExpiryAlerts();
    if (alerts.length === 0) {
      container.innerHTML = `
        <div style="display:flex;align-items:center;gap:0.8rem;padding:1rem 1.5rem;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);border-radius:12px;color:#10b981;font-weight:700;">
          ✅ Aucun produit en péremption imminente
        </div>`;
      return;
    }

    container.innerHTML = alerts.map(a => {
      const cfg = {
        expired:  { bg: 'rgba(239,68,68,0.1)',  border: '#ef4444', icon: '🔴', label: 'PÉRIMÉ',   col: '#ef4444' },
        critical: { bg: 'rgba(245,158,11,0.1)', border: '#f59e0b', icon: '🟠', label: 'CRITIQUE',  col: '#f59e0b' },
        warning:  { bg: 'rgba(99,102,241,0.08)', border: '#6366f1', icon: '🟡', label: 'ATTENTION', col: '#6366f1' }
      }[a.severity];
      const timeLabel = a.diffHours < 0
        ? `Périmé depuis ${Math.abs(Math.round(a.diffHours))}h`
        : `Expire dans ${Math.round(a.diffHours)}h`;

      return `
        <div style="display:flex;align-items:center;gap:1rem;padding:1rem 1.5rem;
          background:${cfg.bg};border:1px solid ${cfg.border};border-radius:12px;margin-bottom:0.5rem;">
          <span style="font-size:1.5rem;">${cfg.icon}</span>
          <div style="flex:1;">
            <div style="font-weight:800;color:${cfg.col};">${a.product} — Lot ${a.lot}</div>
            <div style="font-size:0.8rem;color:var(--text-muted);">${timeLabel} · ${a.qty} portions</div>
          </div>
          <span style="font-size:0.7rem;font-weight:900;padding:4px 10px;border-radius:100px;
            background:${cfg.border};color:white;">${cfg.label}</span>
          <button onclick="window.GourmetHACCPAlerts.solderStock('${a.id}')"
            style="background:#ef4444;color:white;border:none;padding:6px 14px;border-radius:8px;
            font-size:0.8rem;font-weight:700;cursor:pointer;">Solder</button>
        </div>`;
    }).join('');
  },

  /** Solde un lot : le retire de la traçabilité et décrémente l'inventaire */
  solderStock(lotId) {
    const lot = (APP.haccpLogs.trace || []).find(t => t.id === lotId);
    if (!lot) return;

    // Retirer de la traçabilité
    APP.haccpLogs.trace = APP.haccpLogs.trace.filter(t => t.id !== lotId);

    // Mettre à jour l'inventaire : ramener le stock à 0 pour ce produit
    const invItem = APP.inventory.find(i =>
      i.name.toLowerCase().includes(lot.product.toLowerCase().split(' ')[0])
    );
    if (invItem) {
      invItem.stock = 0;
      invItem.lastUpdate = new Date().toISOString();
      if (typeof saveInventory === 'function') saveInventory();
    }

    if (typeof saveHaccpLogs === 'function') saveHaccpLogs();
    if (typeof renderHygiene === 'function') renderHygiene();
    this.renderAlertBanner();
    if (typeof showToast === 'function') showToast('🗑️ Lot soldé et stock mis à zéro', 'success');
  }
};


// ============================================================
// 3. CALCULATEUR D'ALLERGÈNES AUTOMATIQUE
// ============================================================
window.calcRecipeAllergens = function(recipe) {
  const r = recipe || APP.recipe;
  if (!r || !r.ingredients) return [];

  const allergenSet = new Set();

  r.ingredients.forEach(ing => {
    // Chercher dans la DB locale en priorité
    const dbEntry = APP.ingredientDb?.find(d =>
      d.name.toLowerCase().trim() === ing.name.toLowerCase().trim()
    ) || DEFAULT_INGREDIENT_DB?.find(d =>
      d.name.toLowerCase().trim() === ing.name.toLowerCase().trim()
    );

    if (dbEntry?.allergens) {
      dbEntry.allergens.forEach(a => allergenSet.add(a));
    }
  });

  return [...allergenSet];
};

/** Render un badge allergènes dans un conteneur donné */
window.renderAllergenBadges = function(containerId, recipe) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const allergens = calcRecipeAllergens(recipe);
  const allergenEmojis = {
    'Gluten': '🌾', 'Lait': '🥛', 'Œufs': '🥚', 'Arachides': '🥜',
    'Fruits à coque': '🌰', 'Soja': '🫘', 'Poisson': '🐟',
    'Crustacés': '🦐', 'Mollusques': '🦑', 'Céleri': '🌿',
    'Moutarde': '🟡', 'Sésame': '🌱', 'Sulfites': '🍷', 'Lupin': '🌸'
  };

  if (allergens.length === 0) {
    container.innerHTML = `<span style="color:var(--success);font-size:0.85rem;font-weight:700;">✅ Aucun allergène majeur détecté</span>`;
    return;
  }

  container.innerHTML = `
    <div style="display:flex;flex-wrap:wrap;gap:0.5rem;align-items:center;">
      <span style="font-size:0.75rem;font-weight:800;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Allergènes :</span>
      ${allergens.map(a => `
        <span style="display:inline-flex;align-items:center;gap:4px;padding:4px 10px;background:rgba(245,158,11,0.12);
          border:1px solid rgba(245,158,11,0.3);border-radius:100px;font-size:0.78rem;font-weight:700;color:#d97706;">
          ${allergenEmojis[a] || '⚠️'} ${a}
        </span>`).join('')}
    </div>`;
};


// ============================================================
// 3b. CALCULATEUR NUTRI-SCORE (SIMULÉ)
// ============================================================
window.calcNutriScore = function(recipe) {
  if (!recipe || !recipe.ingredients) return 'C'; // Default

  let negativePoints = 0; // Energy, Sugar, Sat Fat, Sodium
  let positivePoints = 0; // Fruits, Veggies, Protein, Fiber

  recipe.ingredients.forEach(ing => {
    const name = ing.name.toLowerCase();
    const qty = parseFloat(ing.qty) || 0;

    // Simplified heuristics
    if (name.includes('sucre') || name.includes('miel') || name.includes('sirop')) negativePoints += (qty / 100) * 10;
    if (name.includes('beurre') || name.includes('crème') || name.includes('huile')) negativePoints += (qty / 100) * 8;
    if (name.includes('sel')) negativePoints += (qty / 10) * 15;
    
    if (name.includes('pomme') || name.includes('fruit') || name.includes('fraise') || name.includes('framboise')) positivePoints += (qty / 100) * 15;
    if (name.includes('noix') || name.includes('amande') || name.includes('noisette')) positivePoints += (qty / 100) * 10;
    if (name.includes('farine complète')) positivePoints += (qty / 100) * 5;
  });

  const finalScore = negativePoints - positivePoints;

  if (finalScore < 0) return 'A';
  if (finalScore < 5) return 'B';
  if (finalScore < 15) return 'C';
  if (finalScore < 25) return 'D';
  return 'E';
};

/** Render le badge Nutri-Score */
window.renderNutriBadge = function(containerId, recipe) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const score = calcNutriScore(recipe);
  const colors = {
    'A': '#038141', 'B': '#85BB2F', 'C': '#FECB02', 'D': '#EE8100', 'E': '#E63E11'
  };

  container.innerHTML = `
    <div style="display:inline-flex; align-items:center; border-radius:6px; overflow:hidden; font-family:sans-serif; font-weight:900; color:white; font-size:0.8rem; box-shadow:0 2px 5px rgba(0,0,0,0.1);">
      ${['A','B','C','D','E'].map(l => `
        <div style="padding:4px 8px; background:${l === score ? colors[l] : '#eee'}; color:${l === score ? 'white' : '#aaa'}; ${l === score ? 'transform:scale(1.15); z-index:1; box-shadow:0 0 10px rgba(0,0,0,0.2);' : ''} transition:0.3s;">
          ${l}
        </div>
      `).join('')}
    </div>
  `;
};


// ============================================================
// 4. HISTORIQUE DES VERSIONS DE RECETTES
// ============================================================
window.GourmetRecipeHistory = {

  getKey(recipeName) {
    return `gourmet_recipe_history_${(recipeName || '').replace(/\s/g,'_').toLowerCase()}`;
  },

  /** Sauvegarde une snapshot de la recette courante */
  saveVersion(recipe) {
    if (!recipe?.name) return;
    const key = this.getKey(recipe.name);
    const history = JSON.parse(localStorage.getItem(key) || '[]');
    history.unshift({
      savedAt: new Date().toISOString(),
      author: APP.viewOwner || localStorage.getItem('gourmet_current_user') || 'Chef',
      snapshot: JSON.parse(JSON.stringify(recipe))
    });
    // Garder max 10 versions
    if (history.length > 10) history.pop();
    localStorage.setItem(key, JSON.stringify(history));
  },

  /** Affiche le panneau d'historique dans un modal */
  showHistory(recipeName) {
    const key = this.getKey(recipeName);
    const history = JSON.parse(localStorage.getItem(key) || '[]');

    let modal = document.getElementById('recipeHistoryModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'recipeHistoryModal';
      modal.style.cssText = 'position:fixed;inset:0;background:rgba(15,23,42,0.7);backdrop-filter:blur(8px);z-index:99999;display:flex;align-items:center;justify-content:center;';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div style="background:var(--bg-surface,white);border-radius:24px;padding:2rem;width:600px;max-width:95vw;max-height:85vh;overflow-y:auto;box-shadow:0 30px 60px rgba(0,0,0,0.3);">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.5rem;">
          <h3 style="margin:0;font-family:var(--font-display);color:var(--primary);">📜 Historique — ${recipeName}</h3>
          <button onclick="document.getElementById('recipeHistoryModal').style.display='none'"
            style="background:none;border:none;font-size:1.5rem;cursor:pointer;color:var(--text-muted);">✕</button>
        </div>
        ${history.length === 0 ? `<p style="color:var(--text-muted);text-align:center;padding:2rem;">Aucun historique disponible.<br>Les versions sont sauvegardées à chaque modification.</p>` :
          history.map((v, i) => {
            const costs = v.snapshot?.costs;
            return `
              <div style="border:1px solid var(--surface-border);border-radius:12px;padding:1.2rem;margin-bottom:0.75rem;${i===0?'border-color:var(--primary);background:rgba(99,102,241,0.04);':''}">
                <div style="display:flex;justify-content:space-between;align-items:center;">
                  <div>
                    <span style="font-weight:800;color:var(--primary);">v${history.length - i}</span>
                    ${i===0 ? '<span style="font-size:0.7rem;background:var(--primary);color:white;padding:2px 8px;border-radius:100px;margin-left:8px;">ACTUELLE</span>' : ''}
                    <div style="font-size:0.8rem;color:var(--text-muted);margin-top:2px;">
                      ${new Date(v.savedAt).toLocaleString('fr-FR')} · par ${v.author}
                    </div>
                  </div>
                  <div style="text-align:right;font-size:0.85rem;">
                    ${costs ? `<div style="font-weight:700;">💰 ${costs.sellingPrice?.toFixed(2)}€/portion</div>
                    <div style="color:var(--text-muted);">Marge : ${costs.marginPct?.toFixed(1)}%</div>` : ''}
                  </div>
                </div>
                <div style="margin-top:0.75rem;font-size:0.8rem;color:var(--text-muted);">
                  ${v.snapshot.ingredients?.length || 0} ingrédients · ${v.snapshot.portions || 0} portions
                </div>
              </div>`;
          }).join('')}
      </div>`;

    modal.style.display = 'flex';
  }
};


// ============================================================
// 5. BASELINE COSTS — VERROUILLAGE DES PRIX DE RÉFÉRENCE
// ============================================================
window.GourmetBaseline = {

  lock() {
    if (!APP.recipe?.name) {
      if (typeof showToast === 'function') showToast('Ouvrez une recette avant de verrouiller.', 'error');
      return;
    }
    if (typeof calcFullCost !== 'function') return;
    APP.baselineCosts = {
      lockedAt: new Date().toISOString(),
      recipeName: APP.recipe.name,
      costs: calcFullCost(APP.margin)
    };
    localStorage.setItem('gourmet_baseline_costs', JSON.stringify(APP.baselineCosts));
    if (typeof showToast === 'function') showToast('🔒 Prix de référence verrouillés !', 'success');
    this.renderComparison();
  },

  unlock() {
    APP.baselineCosts = null;
    localStorage.removeItem('gourmet_baseline_costs');
    const panel = document.getElementById('baselineComparisonPanel');
    if (panel) panel.style.display = 'none';
    if (typeof showToast === 'function') showToast('🔓 Verrou supprimé', 'success');
  },

  load() {
    const saved = localStorage.getItem('gourmet_baseline_costs');
    if (saved) APP.baselineCosts = JSON.parse(saved);
  },

  renderComparison() {
    const panel = document.getElementById('baselineComparisonPanel');
    if (!panel || !APP.baselineCosts) return;

    const ref = APP.baselineCosts.costs;
    const cur = typeof calcFullCost === 'function' ? calcFullCost(APP.margin) : null;
    if (!cur) return;

    const delta = v => {
      const d = v.cur - v.ref;
      const pct = v.ref > 0 ? (d / v.ref * 100) : 0;
      const col = d > 0 ? '#ef4444' : '#10b981';
      const sign = d > 0 ? '+' : '';
      return `<span style="color:${col};font-weight:700;">${sign}${d.toFixed(2)}€ (${sign}${pct.toFixed(1)}%)</span>`;
    };

    panel.style.display = 'block';
    panel.innerHTML = `
      <div style="background:rgba(99,102,241,0.05);border:1px solid rgba(99,102,241,0.2);border-radius:16px;padding:1.5rem;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1rem;">
          <h4 style="margin:0;font-family:var(--font-display);">⚖️ Comparaison Avant/Après</h4>
          <button onclick="window.GourmetBaseline.unlock()"
            style="background:none;border:1px solid var(--surface-border);border-radius:8px;padding:4px 10px;cursor:pointer;font-size:0.8rem;">
            🔓 Déverrouiller
          </button>
        </div>
        <div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:1rem;">
          Référence : ${APP.baselineCosts.recipeName} — ${new Date(APP.baselineCosts.lockedAt).toLocaleDateString('fr-FR')}
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:0.85rem;">
          <tr style="border-bottom:1px solid var(--surface-border);">
            <th style="text-align:left;padding:0.5rem 0;color:var(--text-muted);">Indicateur</th>
            <th style="text-align:right;padding:0.5rem;color:var(--text-muted);">Référence</th>
            <th style="text-align:right;padding:0.5rem;color:var(--accent);">Actuel</th>
            <th style="text-align:right;padding:0.5rem;">Écart</th>
          </tr>
          ${[
            { label: 'Coût Matières', ref: ref.totalMaterial, cur: cur.totalMaterial },
            { label: 'Coût Total', ref: ref.totalFullCost, cur: cur.totalFullCost },
            { label: 'Prix de Vente', ref: ref.sellingPrice, cur: cur.sellingPrice },
          ].map(r => `
            <tr style="border-bottom:1px solid var(--surface-border);">
              <td style="padding:0.6rem 0;font-weight:600;">${r.label}</td>
              <td style="text-align:right;padding:0.6rem;">${r.ref.toFixed(2)}€</td>
              <td style="text-align:right;padding:0.6rem;font-weight:700;color:var(--accent);">${r.cur.toFixed(2)}€</td>
              <td style="text-align:right;padding:0.6rem;">${delta(r)}</td>
            </tr>`).join('')}
        </table>
      </div>`;
  }
};

// ============================================================
// 6. INIT — Chargement au démarrage
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  // Charger le baseline sauvegardé
  window.GourmetBaseline.load();

  // Patcher saveSavedRecipes pour auto-sauver l'historique
  const _origSave = window.saveSavedRecipes;
  if (_origSave) {
    window.saveSavedRecipes = async function() {
      // Sauvegarder une version avant chaque sauvegarde
      if (APP.recipe?.name && APP.recipe?.ingredients?.length > 0) {
        window.GourmetRecipeHistory.saveVersion({
          ...APP.recipe,
          costs: typeof calcFullCost === 'function' ? calcFullCost(APP.margin) : null
        });
      }
      return _origSave();
    };
  }

  // Alertes HACCP initiales (après chargement des données)
  setTimeout(() => {
    if (typeof loadHaccpLogs === 'function') {
      loadHaccpLogs();
      window.GourmetHACCPAlerts.renderAlertBanner();
    }
  }, 2000);

  console.log('[CoreUpgrade] ✅ Modules chargés : Production↔Inventaire, HACCP Alerts, Allergènes, Historique, Baseline');
});
