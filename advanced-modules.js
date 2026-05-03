/*
  =====================================================================
  ADVANCED-MODULES.JS — GourmetRevient v7.0
  1. 🎨 E-Catalogue Templates (Luxe, Rustique, Ardoise)
  2. ⚖️ Comparateur de Recettes Côte à Côte
  3. 🚨 Alertes Seuil de Rentabilité (Breaking Point Auto)
  4. 📊 Charge de Travail & Capacité Équipe
  5. 🍎 Module Nutri-Score Automatique
  =====================================================================
*/

// Legacy theme logic removed.


// ============================================================================
// 2. COMPARATEUR DE RECETTES CÔTE À CÔTE
// ============================================================================

window.openRecipeComparator = function() {
  let modal = document.getElementById('recipeComparatorModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'recipeComparatorModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal-content glass-panel" style="max-width:1000px; width:95%; max-height:90vh; overflow-y:auto;">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
          <h3 style="margin:0;">⚖️ Comparateur de Recettes</h3>
          <button class="btn-icon" onclick="document.getElementById('recipeComparatorModal').style.display='none';">✕</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
          <div class="form-group">
            <label style="font-weight:700; margin-bottom:0.5rem; display:block;">📗 Recette A</label>
            <select id="compareRecipeA" class="form-input" onchange="runRecipeComparison()"></select>
          </div>
          <div class="form-group">
            <label style="font-weight:700; margin-bottom:0.5rem; display:block;">📕 Recette B</label>
            <select id="compareRecipeB" class="form-input" onchange="runRecipeComparison()"></select>
          </div>
        </div>
        <div id="comparisonResults"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  const recipes = APP.savedRecipes || [];
  const libRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];
  const allRecipes = [...recipes, ...libRecipes];
  
  const optionsHTML = '<option value="">— Sélectionner —</option>' + 
    allRecipes.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');
  
  document.getElementById('compareRecipeA').innerHTML = optionsHTML;
  document.getElementById('compareRecipeB').innerHTML = optionsHTML;
  document.getElementById('comparisonResults').innerHTML = `
    <div style="text-align:center; padding:3rem; color:var(--text-muted);">
      <div style="font-size:3rem; margin-bottom:1rem;">⚖️</div>
      <p>Sélectionnez deux recettes pour comparer leurs coûts, leurs marges et leur composition.</p>
    </div>`;
  
  modal.style.display = 'flex';
};

window.runRecipeComparison = function() {
  const idxA = document.getElementById('compareRecipeA').value;
  const idxB = document.getElementById('compareRecipeB').value;
  const container = document.getElementById('comparisonResults');
  
  if (idxA === '' || idxB === '') return;
  
  const allRecipes = [...(APP.savedRecipes || []), ...(typeof RECIPES !== 'undefined' ? RECIPES : [])];
  const rA = allRecipes[parseInt(idxA)];
  const rB = allRecipes[parseInt(idxB)];
  if (!rA || !rB) return;
  
  const costsA = typeof calcFullCost === 'function' ? calcFullCost(rA.margin || 70, rA) : (rA.costs || {});
  const costsB = typeof calcFullCost === 'function' ? calcFullCost(rB.margin || 70, rB) : (rB.costs || {});
  
  const metrics = [
    { label: 'Coût matière total', keyA: costsA.totalMaterial, keyB: costsB.totalMaterial, unit: '€', lower: true },
    { label: 'Coût par portion', keyA: costsA.costPerPortion, keyB: costsB.costPerPortion, unit: '€', lower: true },
    { label: 'Prix de vente', keyA: costsA.sellingPrice, keyB: costsB.sellingPrice, unit: '€', lower: false },
    { label: 'Marge brute', keyA: costsA.marginPct, keyB: costsB.marginPct, unit: '%', lower: false },
    { label: 'Marge par portion', keyA: costsA.marginPerPortion, keyB: costsB.marginPerPortion, unit: '€', lower: false },
    { label: 'Temps total (min)', keyA: (rA.prepTime||0)+(rA.cookTime||0), keyB: (rB.prepTime||0)+(rB.cookTime||0), unit: 'min', lower: true },
    { label: 'Ingrédients', keyA: (rA.ingredients||[]).length, keyB: (rB.ingredients||[]).length, unit: '', lower: true },
  ];
  
  container.innerHTML = `
    <div style="border:1px solid var(--surface-border); border-radius:var(--radius); overflow:hidden;">
      <div style="display:grid; grid-template-columns:2fr 1fr 1fr; background:var(--bg-alt); padding:0.8rem 1rem; font-weight:700; font-size:0.8rem; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid var(--surface-border);">
        <span>Critère</span>
        <span style="text-align:center; color:var(--primary);">📗 ${rA.name}</span>
        <span style="text-align:center; color:var(--danger);">📕 ${rB.name}</span>
      </div>
      ${metrics.map(m => {
        const valA = parseFloat(m.keyA) || 0;
        const valB = parseFloat(m.keyB) || 0;
        const diff = valA - valB;
        const winnerA = m.lower ? valA <= valB : valA >= valB;
        const winnerB = !winnerA;
        return `
          <div style="display:grid; grid-template-columns:2fr 1fr 1fr; padding:0.7rem 1rem; border-bottom:1px solid var(--surface-border); font-size:0.9rem;">
            <span style="font-weight:600;">${m.label}</span>
            <span style="text-align:center; font-weight:${winnerA ? '800' : '400'}; color:${winnerA ? 'var(--success)' : 'var(--text-muted)'};">
              ${valA.toFixed(2)} ${m.unit} ${winnerA ? '✅' : ''}
            </span>
            <span style="text-align:center; font-weight:${winnerB ? '800' : '400'}; color:${winnerB ? 'var(--success)' : 'var(--text-muted)'};">
              ${valB.toFixed(2)} ${m.unit} ${winnerB ? '✅' : ''}
            </span>
          </div>`;
      }).join('')}
    </div>
    <div style="margin-top:1.5rem; padding:1.2rem; background:var(--bg-alt); border-radius:var(--radius); border-left:4px solid var(--accent);">
      <div style="font-weight:700; margin-bottom:0.5rem;">💡 Recommandation</div>
      <p style="font-size:0.9rem; color:var(--text-secondary); margin:0;">
        ${costsA.marginPct > costsB.marginPct 
          ? `<strong>${rA.name}</strong> offre une meilleure marge (+${(costsA.marginPct - costsB.marginPct).toFixed(1)} pts). ${costsA.totalMaterial < costsB.totalMaterial ? 'Elle est aussi moins coûteuse en matière première.' : `Cependant, <strong>${rB.name}</strong> a un coût matière inférieur de ${(costsA.totalMaterial - costsB.totalMaterial).toFixed(2)}€.`}`
          : `<strong>${rB.name}</strong> offre une meilleure marge (+${(costsB.marginPct - costsA.marginPct).toFixed(1)} pts). ${costsB.totalMaterial < costsA.totalMaterial ? 'Elle est aussi moins coûteuse en matière première.' : `Cependant, <strong>${rA.name}</strong> a un coût matière inférieur de ${(costsB.totalMaterial - costsA.totalMaterial).toFixed(2)}€.`}`
        }
      </p>
    </div>
  `;
};


// ============================================================================
// 3. ALERTES SEUIL DE RENTABILITÉ
// ============================================================================

const MARGIN_ALERT_THRESHOLD = 60; // % minimum acceptable

window.checkMarginAlerts = function(silent = false) {
  const savedRecs = (APP && APP.savedRecipes) || [];
  if (savedRecs.length === 0) return [];
  
  const alerts = [];
  const inflationPct = window.inflationFactor || 0;
  
  savedRecs.forEach(r => {
    try {
      const costs = typeof calcFullCost === 'function' 
        ? calcFullCost(r.margin || 70, r, inflationPct)
        : (r.costs || {});
      
      const margin = costs.marginPct || 0;
      
      if (margin < MARGIN_ALERT_THRESHOLD) {
        // Find the most expensive ingredient
        let topIng = { name: '—', pct: 0 };
        const totalMat = costs.totalMaterial || 1;
        (r.ingredients || []).forEach(ing => {
          const ingCost = typeof calcIngredientCost === 'function' ? calcIngredientCost(ing) : 0;
          const pct = (ingCost / totalMat) * 100;
          if (pct > topIng.pct) topIng = { name: ing.name, pct };
        });
        
        alerts.push({
          recipe: r.name,
          margin: margin.toFixed(1),
          threshold: MARGIN_ALERT_THRESHOLD,
          deficit: (MARGIN_ALERT_THRESHOLD - margin).toFixed(1),
          topIngredient: topIng.name,
          topIngredientPct: topIng.pct.toFixed(0),
          severity: margin < 40 ? 'critical' : 'warning'
        });
      }
    } catch(e) {}
  });
  
  if (!silent && alerts.length > 0) {
    showMarginAlertBanner(alerts);
  }
  
  return alerts;
};

function showMarginAlertBanner(alerts) {
  // Remove existing banner
  const existing = document.getElementById('marginAlertBanner');
  if (existing) existing.remove();
  
  const banner = document.createElement('div');
  banner.id = 'marginAlertBanner';
  banner.style.cssText = `
    position: fixed; bottom: 20px; right: 20px; max-width: 420px; z-index: 10000;
    background: linear-gradient(135deg, #1a1a2e, #2d1b3d); color: white;
    border-radius: 16px; padding: 1.2rem 1.5rem; box-shadow: 0 12px 40px rgba(0,0,0,0.3);
    border: 1px solid rgba(239,68,68,0.3); animation: slideInRight 0.4s ease;
    font-family: 'Inter', sans-serif;
  `;
  
  const critical = alerts.filter(a => a.severity === 'critical');
  banner.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
      <span style="font-weight:700; font-size:1rem;">🚨 Alertes Rentabilité</span>
      <button onclick="this.closest('#marginAlertBanner').remove();" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer;">✕</button>
    </div>
    <div style="font-size:0.85rem; line-height:1.6;">
      ${alerts.slice(0, 3).map(a => `
        <div style="padding:0.4rem 0; border-bottom:1px solid rgba(255,255,255,0.08);">
          <span style="color:${a.severity === 'critical' ? '#ef4444' : '#f59e0b'};">${a.severity === 'critical' ? '💀' : '⚠️'}</span>
          <strong>${a.recipe}</strong> — marge ${a.margin}% 
          <span style="font-size:0.75rem; opacity:0.7;">(objectif: ${a.threshold}%)</span>
          <br><span style="font-size:0.75rem; opacity:0.6;">Poste principal : ${a.topIngredient} (${a.topIngredientPct}% du coût)</span>
        </div>
      `).join('')}
      ${alerts.length > 3 ? `<div style="font-size:0.75rem; opacity:0.6; margin-top:0.5rem;">+${alerts.length - 3} autres alertes</div>` : ''}
    </div>
    <button onclick="openRecipeComparator(); this.closest('#marginAlertBanner').remove();" 
      class="btn btn-sm" style="margin-top:0.8rem; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.2); color:white; width:100%; padding:8px; border-radius:8px; cursor:pointer;">
      ⚖️ Ouvrir le Comparateur
    </button>
  `;
  
  document.body.appendChild(banner);
  
  // Auto-dismiss after 15s
  setTimeout(() => {
    if (banner.parentElement) {
      banner.style.opacity = '0';
      banner.style.transform = 'translateX(100px)';
      banner.style.transition = 'all 0.4s ease';
      setTimeout(() => banner.remove(), 400);
    }
  }, 15000);
}


// ============================================================================
// 4. PLANIFICATION CHARGE DE TRAVAIL
// ============================================================================

window.analyzeWorkload = function() {
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  const recipes = APP.savedRecipes || [];
  const team = APP.teamMembers || JSON.parse(localStorage.getItem(
    `gourmet_team_members_${(localStorage.getItem('gourmet_current_user') || 'chef').toLowerCase()}`
  ) || '[]');
  
  if (plan.length === 0) {
    if (typeof showToast === 'function') showToast('Aucune production planifiée.', 'info');
    return;
  }
  
  // Calculate total work hours needed
  let totalMinutes = 0;
  let breakdown = [];
  
  plan.forEach(item => {
    const recipe = recipes.find(r => r.name === item.name || r.id === item.recipeId);
    if (!recipe) return;
    
    const factor = (item.qty || 1) / (recipe.portions || 1);
    const prepMin = (recipe.prepTime || 0) * factor;
    const cookMin = (recipe.cookTime || 0) * factor;
    const totalMin = prepMin + cookMin;
    totalMinutes += totalMin;
    
    breakdown.push({
      name: recipe.name,
      qty: item.qty || 1,
      prep: Math.round(prepMin),
      cook: Math.round(cookMin),
      total: Math.round(totalMin)
    });
  });
  
  const totalHours = totalMinutes / 60;
  const teamSize = Math.max(1, team.length || 1);
  const hoursPerPerson = totalHours / teamSize;
  const workDaysNeeded = Math.ceil(hoursPerPerson / 8); // 8h work day
  
  let status = 'ok', statusIcon = '✅', statusText = 'Charge maîtrisée';
  if (hoursPerPerson > 16) { status = 'critical'; statusIcon = '🔴'; statusText = 'Surcharge critique'; }
  else if (hoursPerPerson > 10) { status = 'warning'; statusIcon = '⚠️'; statusText = 'Charge élevée'; }
  
  // Render in a modal
  let modal = document.getElementById('workloadModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'workloadModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }
  
  modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:700px; width:95%; max-height:90vh; overflow-y:auto;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h3 style="margin:0;">📊 Analyse de Charge</h3>
        <button class="btn-icon" onclick="document.getElementById('workloadModal').style.display='none';">✕</button>
      </div>
      
      <div style="display:grid; grid-template-columns:repeat(4, 1fr); gap:1rem; margin-bottom:1.5rem;">
        <div style="text-align:center; padding:1rem; background:var(--bg-alt); border-radius:var(--radius); border:1px solid var(--surface-border);">
          <div style="font-size:1.8rem; font-weight:800; color:var(--accent);">${totalHours.toFixed(1)}h</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Heures totales</div>
        </div>
        <div style="text-align:center; padding:1rem; background:var(--bg-alt); border-radius:var(--radius); border:1px solid var(--surface-border);">
          <div style="font-size:1.8rem; font-weight:800; color:var(--primary);">${teamSize}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Pâtissier(s)</div>
        </div>
        <div style="text-align:center; padding:1rem; background:var(--bg-alt); border-radius:var(--radius); border:1px solid var(--surface-border);">
          <div style="font-size:1.8rem; font-weight:800; color:${status === 'critical' ? 'var(--danger)' : (status === 'warning' ? '#f59e0b' : 'var(--success)')};">${hoursPerPerson.toFixed(1)}h</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">/ personne</div>
        </div>
        <div style="text-align:center; padding:1rem; background:var(--bg-alt); border-radius:var(--radius); border:1px solid var(--surface-border);">
          <div style="font-size:1.8rem; font-weight:800;">${workDaysNeeded}</div>
          <div style="font-size:0.75rem; color:var(--text-muted); font-weight:600;">Jour(s) néc.</div>
        </div>
      </div>
      
      <div style="padding:1rem; background:${status === 'critical' ? 'rgba(239,68,68,0.06)' : (status === 'warning' ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)')}; border-radius:var(--radius); border-left:4px solid ${status === 'critical' ? 'var(--danger)' : (status === 'warning' ? '#f59e0b' : 'var(--success)')}; margin-bottom:1.5rem;">
        <div style="font-weight:700; font-size:1rem;">${statusIcon} ${statusText}</div>
        <p style="font-size:0.85rem; margin:0.5rem 0 0; color:var(--text-secondary);">
          ${status === 'critical' 
            ? `Attention : ${hoursPerPerson.toFixed(1)}h de travail par personne dépassent largement une journée de 8h. Envisagez de répartir la production sur ${workDaysNeeded} jours ou de renforcer l'équipe.`
            : (status === 'warning' 
              ? `La charge est élevée mais gérable. Prévoyez ${workDaysNeeded} jour(s) plein pour finaliser la production.`
              : `La charge est parfaitement répartie. Votre équipe peut absorber cette production sur ${workDaysNeeded} jour(s).`)
          }
        </p>
      </div>
      
      <div style="border:1px solid var(--surface-border); border-radius:var(--radius); overflow:hidden;">
        <div style="display:grid; grid-template-columns:2fr 0.5fr 1fr 1fr 1fr; background:var(--bg-alt); padding:0.6rem 1rem; font-weight:700; font-size:0.75rem; text-transform:uppercase; letter-spacing:0.05em;">
          <span>Recette</span><span style="text-align:center;">Qté</span><span style="text-align:center;">Prép</span><span style="text-align:center;">Cuisson</span><span style="text-align:center;">Total</span>
        </div>
        ${breakdown.map(b => `
          <div style="display:grid; grid-template-columns:2fr 0.5fr 1fr 1fr 1fr; padding:0.6rem 1rem; border-top:1px solid var(--surface-border); font-size:0.85rem;">
            <span style="font-weight:600;">${b.name}</span>
            <span style="text-align:center;">${b.qty}</span>
            <span style="text-align:center;">${b.prep} min</span>
            <span style="text-align:center;">${b.cook} min</span>
            <span style="text-align:center; font-weight:700;">${b.total} min</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
  
  modal.style.display = 'flex';
};


// ============================================================================
// 5. MODULE NUTRI-SCORE AUTOMATIQUE
// ============================================================================

// Simplified nutritional estimates per 100g for common pastry ingredients
const NUTRI_DB = {
  'farine': { kcal: 364, prot: 10, carb: 76, fat: 1, sugar: 1, fiber: 2.7 },
  'beurre': { kcal: 717, prot: 0.9, carb: 0.1, fat: 81, sugar: 0, fiber: 0 },
  'sucre': { kcal: 387, prot: 0, carb: 100, fat: 0, sugar: 100, fiber: 0 },
  'œuf': { kcal: 155, prot: 13, carb: 1.1, fat: 11, sugar: 1, fiber: 0 }, // per 50g
  'lait': { kcal: 64, prot: 3.3, carb: 4.8, fat: 3.6, sugar: 4.8, fiber: 0 },
  'crème': { kcal: 340, prot: 2, carb: 3, fat: 35, sugar: 3, fiber: 0 },
  'chocolat': { kcal: 540, prot: 5, carb: 55, fat: 32, sugar: 48, fiber: 6 },
  'cacao': { kcal: 228, prot: 20, carb: 58, fat: 14, sugar: 2, fiber: 33 },
  'amande': { kcal: 575, prot: 21, carb: 22, fat: 49, sugar: 4, fiber: 12 },
  'noisette': { kcal: 628, prot: 15, carb: 17, fat: 61, sugar: 4, fiber: 10 },
  'pistache': { kcal: 560, prot: 20, carb: 28, fat: 45, sugar: 8, fiber: 10 },
  'fraise': { kcal: 32, prot: 0.7, carb: 8, fat: 0.3, sugar: 5, fiber: 2 },
  'framboise': { kcal: 52, prot: 1.2, carb: 12, fat: 0.7, sugar: 4, fiber: 7 },
  'pomme': { kcal: 52, prot: 0.3, carb: 14, fat: 0.2, sugar: 10, fiber: 2.4 },
  'poire': { kcal: 57, prot: 0.4, carb: 15, fat: 0.1, sugar: 10, fiber: 3 },
  'citron': { kcal: 29, prot: 1.1, carb: 9, fat: 0.3, sugar: 2.5, fiber: 2.8 },
  'gélatine': { kcal: 335, prot: 86, carb: 0, fat: 0, sugar: 0, fiber: 0 },
  'mascarpone': { kcal: 429, prot: 5, carb: 4, fat: 44, sugar: 4, fiber: 0 },
  'praliné': { kcal: 550, prot: 10, carb: 40, fat: 38, sugar: 35, fiber: 3 },
  'vanille': { kcal: 288, prot: 0, carb: 13, fat: 0, sugar: 13, fiber: 0 },
  'miel': { kcal: 304, prot: 0.3, carb: 82, fat: 0, sugar: 82, fiber: 0 },
  'sel': { kcal: 0, prot: 0, carb: 0, fat: 0, sugar: 0, fiber: 0 },
  'rhum': { kcal: 231, prot: 0, carb: 0, fat: 0, sugar: 0, fiber: 0 },
  'levure': { kcal: 105, prot: 14, carb: 19, fat: 2, sugar: 0, fiber: 9 },
  'maïzena': { kcal: 381, prot: 0.3, carb: 91, fat: 0.1, sugar: 0, fiber: 0.9 },
  'pectine': { kcal: 320, prot: 0, carb: 80, fat: 0, sugar: 0, fiber: 70 },
};

function matchNutriDb(ingredientName) {
  const n = ingredientName.toLowerCase();
  for (const [key, val] of Object.entries(NUTRI_DB)) {
    if (n.includes(key)) return val;
  }
  return null;
}

window.calculateNutriScore = function(recipe) {
  if (!recipe || !recipe.ingredients) return null;
  
  let totalWeightG = 0;
  let totals = { kcal: 0, prot: 0, carb: 0, fat: 0, sugar: 0, fiber: 0 };
  
  recipe.ingredients.forEach(ing => {
    let qtyG = parseFloat(ing.quantity) || 0;
    const unit = (ing.unit || 'g').toLowerCase();
    
    if (unit === 'kg' || unit === 'l') qtyG *= 1000;
    if (unit === 'pcs' || unit === 'pièce') qtyG *= 50; // ~50g per egg/piece
    
    const nutri = matchNutriDb(ing.name);
    if (!nutri) { totalWeightG += qtyG; return; }
    
    totalWeightG += qtyG;
    const factor = qtyG / 100;
    totals.kcal += nutri.kcal * factor;
    totals.prot += nutri.prot * factor;
    totals.carb += nutri.carb * factor;
    totals.fat  += nutri.fat * factor;
    totals.sugar += nutri.sugar * factor;
    totals.fiber += nutri.fiber * factor;
  });
  
  if (totalWeightG === 0) return null;
  
  // Per 100g
  const per100 = {
    kcal: Math.round((totals.kcal / totalWeightG) * 100),
    prot: +((totals.prot / totalWeightG) * 100).toFixed(1),
    carb: +((totals.carb / totalWeightG) * 100).toFixed(1),
    fat:  +((totals.fat / totalWeightG) * 100).toFixed(1),
    sugar: +((totals.sugar / totalWeightG) * 100).toFixed(1),
    fiber: +((totals.fiber / totalWeightG) * 100).toFixed(1),
    totalWeight: Math.round(totalWeightG)
  };
  
  // Simplified Nutri-Score calculation (official algorithm is complex, this is an approximation)
  // Negative points: energy, sugar, saturated fat, sodium
  let negPoints = 0;
  if (per100.kcal > 335) negPoints += 5; else if (per100.kcal > 270) negPoints += 4; else if (per100.kcal > 200) negPoints += 3; else if (per100.kcal > 135) negPoints += 2; else if (per100.kcal > 60) negPoints += 1;
  if (per100.sugar > 36) negPoints += 5; else if (per100.sugar > 27) negPoints += 4; else if (per100.sugar > 18) negPoints += 3; else if (per100.sugar > 9) negPoints += 2; else if (per100.sugar > 4.5) negPoints += 1;
  if (per100.fat > 28) negPoints += 5; else if (per100.fat > 21) negPoints += 4; else if (per100.fat > 14) negPoints += 3; else if (per100.fat > 7) negPoints += 2; else if (per100.fat > 1) negPoints += 1;
  
  // Positive points: protein, fiber, fruits
  let posPoints = 0;
  if (per100.prot > 8) posPoints += 5; else if (per100.prot > 6.4) posPoints += 4; else if (per100.prot > 4.8) posPoints += 3; else if (per100.prot > 3.2) posPoints += 2; else if (per100.prot > 1.6) posPoints += 1;
  if (per100.fiber > 4.7) posPoints += 5; else if (per100.fiber > 3.5) posPoints += 4; else if (per100.fiber > 2.3) posPoints += 3; else if (per100.fiber > 0.9) posPoints += 2; else if (per100.fiber > 0.7) posPoints += 1;
  
  const score = negPoints - posPoints;
  
  let grade, color;
  if (score <= -1) { grade = 'A'; color = '#038c3e'; }
  else if (score <= 2) { grade = 'B'; color = '#85bb2f'; }
  else if (score <= 10) { grade = 'C'; color = '#f5c623'; }
  else if (score <= 18) { grade = 'D'; color = '#e63312'; }
  else { grade = 'E'; color = '#8b0000'; }
  
  return { ...per100, score, grade, color };
};

window.renderNutriScoreBadge = function(recipe) {
  const nutri = calculateNutriScore(recipe);
  if (!nutri) return '<span style="color:var(--text-muted); font-size:0.8rem;">N/A</span>';
  
  return `
    <div style="display:inline-flex; align-items:center; gap:8px;">
      <div style="width:36px; height:36px; border-radius:50%; background:${nutri.color}; color:white; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:1.1rem; box-shadow:0 2px 8px ${nutri.color}44;">${nutri.grade}</div>
      <div style="font-size:0.7rem; line-height:1.3; color:var(--text-muted);">
        ${nutri.kcal} kcal<br>
        P:${nutri.prot}g G:${nutri.carb}g L:${nutri.fat}g
      </div>
    </div>
  `;
};


// ============================================================================
// INITIALIZATION — Wire up buttons & auto-alerts
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    // Add Comparator button to the Pro Tools grid
    const proToolsGrid = document.querySelector('#mgmtViewProTools .protools-grid');
    if (proToolsGrid && !document.getElementById('comparatorProCard')) {
      proToolsGrid.insertAdjacentHTML('beforeend', `
        <div class="protools-card" onclick="openRecipeComparator()" id="comparatorProCard">
          <div class="protools-card-icon" style="background:rgba(245,158,11,0.1); color:#f59e0b;">⚖️</div>
          <div class="protools-card-body">
            <h3>Comparateur de Recettes</h3>
            <p>Comparez deux recettes côte à côte : coûts, marges, temps de production et composition.</p>
          </div>
          <div class="protools-card-footer">
            <span class="protools-tag">Analyse</span>
            <span class="protools-arrow">→</span>
          </div>
        </div>
      `);
      
      proToolsGrid.insertAdjacentHTML('beforeend', `
        <div class="protools-card" onclick="analyzeWorkload()" id="workloadProCard">
          <div class="protools-card-icon" style="background:rgba(99,102,241,0.1); color:#6366f1;">📊</div>
          <div class="protools-card-body">
            <h3>Charge de Travail</h3>
            <p>Analysez si votre équipe peut absorber le volume de production planifié dans les délais.</p>
          </div>
          <div class="protools-card-footer">
            <span class="protools-tag">Planning</span>
            <span class="protools-arrow">→</span>
          </div>
        </div>
      `);


    }
    
    // Check margin alerts after everything is loaded
    setTimeout(() => {
      checkMarginAlerts(false);
    }, 3000);
    
  }, 2000);
});


// ============================================================================
// 6. GÉNÉRATEUR D'ÉTIQUETTES DE VITRINE AVEC QR CODE
// ============================================================================

window.openVitrineLabels = function() {
  let modal = document.getElementById('vitrineLabelsModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'vitrineLabelsModal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }
  
  const savedRecs = APP.savedRecipes || [];
  const libRecs = typeof RECIPES !== 'undefined' ? RECIPES : [];
  const allRecipes = [...savedRecs, ...libRecs];
  const shopName = localStorage.getItem('gourmet_current_user') || 'Mon Atelier';
  
  modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:900px; width:95%; max-height:90vh; overflow-y:auto;">
      <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h3 style="margin:0;">🏷️ Étiquettes de Vitrine</h3>
        <button class="btn-icon" onclick="document.getElementById('vitrineLabelsModal').style.display='none';">✕</button>
      </div>
      
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.5rem;">
        Sélectionnez les produits à étiqueter. Chaque étiquette contiendra le nom, le prix, les allergènes et un QR code renvoyant vers la fiche produit.
      </p>
      
      <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; flex-wrap:wrap;">
        <button class="btn btn-sm btn-outline" onclick="toggleAllVitrineCheckboxes(true)">✅ Tout sélectionner</button>
        <button class="btn btn-sm btn-outline" onclick="toggleAllVitrineCheckboxes(false)">❌ Tout désélectionner</button>
      </div>
      
      <div id="vitrineRecipeList" style="display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem; margin-bottom:2rem;">
        ${allRecipes.map((r, i) => {
          const margin = r.margin || (typeof APP !== 'undefined' && APP.margin) || 75;
          const costs = typeof calcFullCost === 'function' ? calcFullCost(margin, r) : {};
          const rawPrice = costs.sellingPrice || 0;
          const priceTTC = rawPrice * 1.055; 
          const smartPrice = typeof applySmartPricing === 'function' ? applySmartPricing(priceTTC) : priceTTC;
          const displayPrice = smartPrice.toFixed(2).replace('.', ',');
          return `
            <label class="vitrine-item-card" style="display:flex; align-items:center; gap:0.8rem; padding:1rem; background:var(--surface); border-radius:12px; cursor:pointer; border:1px solid var(--surface-border); transition:all 0.2s;">
              <input type="checkbox" class="vitrine-check" value="${i}" checked style="width:20px; height:20px; accent-color:var(--accent);">
              <div style="flex:1;">
                <div style="font-weight:700; font-size:0.9rem; color:var(--text);">${r.name}</div>
                <div style="font-size:0.8rem; color:var(--text-muted); font-weight:600;">${displayPrice} € TTC <span style="opacity:0.6; font-weight:400; margin-left:4px;">· ${r.category || ''}</span></div>
              </div>
            </label>`;
        }).join('')}
      </div>
      
      <div style="display:flex; gap:0.75rem; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="generateVitrineLabels()">🖨️ Générer les étiquettes</button>
        <button class="btn btn-outline" onclick="printVitrineLabels()">🖨️ Imprimer</button>
      </div>
      
      <div id="vitrinePreview" style="margin-top:1.5rem;"></div>
    </div>
  `;
  
  modal.style.display = 'flex';
};

window.toggleAllVitrineCheckboxes = function(state) {
  document.querySelectorAll('.vitrine-check').forEach(cb => cb.checked = state);
};

window.generateVitrineLabels = function() {
  const checks = document.querySelectorAll('.vitrine-check:checked');
  if (checks.length === 0) {
    showToast('Sélectionnez au moins un produit.', 'warning');
    return;
  }
  
  const savedRecs = APP.savedRecipes || [];
  const libRecs = typeof RECIPES !== 'undefined' ? RECIPES : [];
  const allRecipes = [...savedRecs, ...libRecs];
  const shopName = localStorage.getItem('gourmet_current_user') || 'Mon Atelier';
  
  function detectAllergens(recipe) {
    const allergens = new Set();
    const ALLERGEN_MAP = {
      'Gluten': ['farine', 'blé', 'ble', 'semoule', 'maïzena', 'fondant', 'spéculoos', 'biscuit', 'seigle', 'orge', 'avoine'],
      'Œufs': ['œuf', 'oeuf', 'jaune', 'blanc', 'albumine'],
      'Lait': ['lait', 'beurre', 'crème', 'creme', 'mascarpone', 'fromage', 'yaourt', 'lacto', 'caséine'],
      'Fruits à coque': ['amande', 'noisette', 'pistache', 'noix', 'praliné', 'pignon', 'pecan', 'macadamia', 'cajou'],
      'Soja': ['lécithine', 'soja', 'tonka'],
      'Arachides': ['arachide', 'cacahuète', 'beurre de cacahuète'],
      'Sésame': ['sésame', 'sesame', 'tahini'],
      'Poissons': ['poisson', 'gélatine de poisson'],
      'Sulfites': ['vin', 'sirop d\'érable', 'fruits confits', 'vinaigre']
    };
    (recipe.ingredients || []).forEach(ing => {
      const name = (ing.name || '').toLowerCase();
      for (const [allergen, keywords] of Object.entries(ALLERGEN_MAP)) {
        if (keywords.some(k => name.includes(k))) allergens.add(allergen);
      }
    });
    return [...allergens];
  }
  
  // Function to update placeholders with real QR codes using the library
  function renderRealQRs() {
    document.querySelectorAll('.vitrine-qr-target').forEach(el => {
      if (el.dataset.rendered === '1') return;
      el.innerHTML = '';
      new QRCode(el, {
        text: el.dataset.url,
        width: 60,
        height: 60,
        colorDark: "#1a1b1e",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
      });
      el.dataset.rendered = '1';
    });
  }
  
  let labelsHTML = '';
  
  checks.forEach(cb => {
    const idx = parseInt(cb.value);
    const r = allRecipes[idx];
    if (!r) return;
    
    const margin = r.margin || (typeof APP !== 'undefined' && APP.margin) || 75;
    const costs = typeof calcFullCost === 'function' ? calcFullCost(margin, r) : {};
    
    // Calculate Public Price (TTC) with 5.5% VAT
    const priceHT = costs.sellingPrice || 0;
    const priceTTC = priceHT * 1.055;
    
    // Applying the new Bakery-Smart pricing
    const smartPrice = typeof applySmartPricing === 'function' ? applySmartPricing(priceTTC) : priceTTC;
    const finalPrice = smartPrice.toFixed(2).replace('.', ',');
    
    const allergens = detectAllergens(r);
    const qrData = `https://julianperesson.github.io/Gourmetrevient/?product=${encodeURIComponent(r.name)}`;
    const nutri = typeof calculateNutriScore === 'function' ? calculateNutriScore(r) : null;
    
    const portions = parseInt(r.portions) || 10;
    const isSingle = portions <= 1;
    
    labelsHTML += `
      <div class="vitrine-label" style="
        width: 320px; min-height: 180px; padding: 20px; 
        background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px;
        display: flex; flex-direction: column; gap: 8px; page-break-inside: avoid;
        font-family: 'Inter', sans-serif; position: relative; overflow: hidden;
        box-shadow: 0 4px 20px rgba(0,0,0,0.06); margin-bottom: 1rem;
      ">
        <div style="position:absolute; top:0; left:0; right:0; height:4px; background:linear-gradient(90deg, #10b981, #3b82f6);"></div>
        
        <div style="display:flex; justify-content:space-between; align-items:flex-start;">
          <div style="flex:1; padding-right:10px;">
            <div style="font-size:0.65rem; text-transform:uppercase; letter-spacing:0.12em; color:#64748b; font-weight:700; margin-bottom:2px;">${r.category || 'Pâtisserie'}</div>
            <div style="font-size:1.25rem; font-weight:800; color:#0f172a; line-height:1.2; font-family:'Outfit',sans-serif;">${r.name}</div>
          </div>
          <div class="vitrine-qr-target" data-url="${qrData}" style="width:60px; height:60px; flex-shrink:0; background:#f8fafc; border-radius:8px; border:1px solid #f1f5f9; display:flex; align-items:center; justify-content:center;"></div>
        </div>
        
        <div style="display:flex; align-items:baseline; gap:6px; margin: 4px 0;">
          <div style="font-size:2rem; font-weight:200; color:#0f172a; font-family:'Outfit',sans-serif;">${finalPrice}</div>
          <div style="font-size:1rem; font-weight:700; color:#0f172a;">€</div>
          <div style="font-size:0.7rem; color:#94a3b8; font-weight:600; margin-left:2px;">TTC</div>
          
          ${!isSingle ? `<div style="font-size:0.75rem; color:#64748b; font-weight:600; margin-left:5px;">/ la part</div>` : ''}
          
          ${nutri ? `
            <div style="margin-left:auto; display:flex; align-items:center; background:#f8fafc; padding:4px 8px; border-radius:20px; border:1px solid #f1f5f9;">
              <span style="font-size:0.6rem; font-weight:800; color:#64748b; text-transform:uppercase; margin-right:6px;">Nutri</span>
              <span style="width:22px; height:22px; border-radius:50%; background:${nutri.color}; color:white; display:flex; align-items:center; justify-content:center; font-weight:900; font-size:0.7rem;">${nutri.grade}</span>
            </div>
          ` : ''}
        </div>
        
        <div style="margin-top:auto;">
          ${allergens.length > 0 ? `
            <div style="font-size:0.7rem; color:#dc2626; font-weight:700; line-height:1.4; padding:6px 10px; background:#fef2f2; border-radius:8px; border:1px solid #fee2e2;">
              ⚠️ Allergènes : <span style="font-weight:600;">${allergens.join(', ')}</span>
            </div>
          ` : `
            <div style="font-size:0.7rem; color:#059669; font-weight:700; padding:6px 10px; background:#ecfdf5; border-radius:8px; border:1px solid #d1fae5; display:flex; align-items:center; gap:6px;">
              <span style="font-size:1rem;">✓</span> Aucun allergène majeur
            </div>
          `}
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px; padding-top:8px; border-top:1px dashed #e2e8f0;">
           <div style="font-size:0.6rem; color:#94a3b8; font-weight:600;">${shopName}</div>
           <div style="font-size:0.55rem; color:#64748b; font-style:italic;">Scannez pour la composition</div>
        </div>
      </div>
    `;
  });
  
  const preview = document.getElementById('vitrinePreview');
  if (preview) {
    preview.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
        <div style="font-weight:800; font-size:1rem; color:var(--primary);">Aperçu de vos étiquettes (${checks.length})</div>
        <div style="font-size:0.75rem; color:var(--text-muted);">Prêtes pour impression laser ou jet d'encre</div>
      </div>
      <div id="vitrinePrintZone" style="display:flex; flex-wrap:wrap; gap:1.5rem; justify-content:center; padding:1rem; background:rgba(0,0,0,0.02); border-radius:12px;">
        ${labelsHTML}
      </div>
    `;
    // Generate real QRs after DOM is ready
    setTimeout(renderRealQRs, 100);
  }
  
  showToast(`${checks.length} étiquette(s) générée(s) !`, 'success');
};

window.printVitrineLabels = function() {
  const zone = document.getElementById('vitrinePrintZone');
  if (!zone || zone.children.length === 0) {
    showToast('Générez d\'abord les étiquettes.', 'warning');
    return;
  }
  
  const printWin = window.open('', '_blank');
  printWin.document.write(`<!DOCTYPE html>
<html><head><title>Étiquettes Vitrine</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;800&family=Outfit:wght@400;600;700;800&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { display: flex; flex-wrap: wrap; gap: 12px; padding: 12px; justify-content: center; }
  @media print { body { gap: 8px; padding: 8px; } }
</style></head><body>${zone.innerHTML}</body></html>`);
  printWin.document.close();
  setTimeout(() => printWin.print(), 500);
};
