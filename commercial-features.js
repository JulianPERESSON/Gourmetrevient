/*
  =====================================================================
  COMMERCIAL-FEATURES.JS — GourmetRevient v6.0
  🛒 Passerelle Catalogue ↔ Commande (Smart Order Builder)
  📦 Explosion des Besoins (Bon d'Économat Automatique)
  🚨 Gestion du Gaspillage Avancée (Waste Tracking Pro)
  🌐 Portail Client E-Catalogue (Public Link Generator)
  =====================================================================
*/

/**
 * Psychological pricing helper (ends in .00, .50, or .90)
 * Rounds UP to the next smart threshold to protect margin while being attractive.
 */
function applySmartPricing(val) {
  let p = parseFloat(val);
  if (isNaN(p) || p <= 0) return p;
  
  // High-End Pastry floor: ensure no premium creation is undervalued
  if (p < 4.50) p = 4.50;

  let whole = Math.floor(p);
  let dec = p - whole;
  
  // Luxury rounding: primarily .50 and .90
  if (dec <= 0.50) return whole + 0.50;
  return whole + 0.90;
}

// ============================================================================
// 1. PASSERELLE CATALOGUE ↔ COMMANDE — Smart Order Builder
// ============================================================================

/**
 * Upgraded CRM Order Modal with recipe picker, auto-cost and margin analysis
 */
window.showSmartOrderModal = function(editOrderId) {
  const modal = document.getElementById('modalAddOrder');
  if (!modal) return;

  // 1. Populate client selector (existing logic)
  const sel = document.getElementById('crmOrderClient');
  if (sel) {
    sel.innerHTML = '<option value="">Sélectionnez un client...</option>' +
      APP.crm.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
  }

  // 2. Inject smart order builder into the products field area
  const productsField = document.getElementById('crmOrderProducts');
  const productsGroup = productsField?.closest('.form-group');
  
  // Check if we already injected (avoid duplicates)
  let builderContainer = document.getElementById('smartOrderBuilder');
  if (!builderContainer && productsGroup) {
    productsGroup.style.display = 'none'; // Hide old text input
    
    builderContainer = document.createElement('div');
    builderContainer.id = 'smartOrderBuilder';
    builderContainer.innerHTML = `
      <div class="form-group">
        <label>Produits (depuis le catalogue)</label>
        <div id="smartOrderLines" class="smart-order-lines"></div>
        <button type="button" class="btn btn-outline btn-sm btn-full" onclick="addSmartOrderLine()" style="margin-top:0.5rem;">
          ✚ Ajouter un produit
        </button>
      </div>
      <div id="smartOrderMarginPanel" class="smart-order-margin" style="display:none;">
        <div class="margin-header">
          <span class="margin-icon">📊</span>
          <span class="margin-title">Analyse de Rentabilité</span>
        </div>
        <div class="margin-grid">
          <div class="margin-item">
            <span class="margin-label">Coût Matière Total</span>
            <span class="margin-val" id="smartOrderCostTotal">0.00 €</span>
          </div>
          <div class="margin-item">
            <span class="margin-label">Prix de Vente Total</span>
            <span class="margin-val accent" id="smartOrderSellTotal">0.00 €</span>
          </div>
          <div class="margin-item highlight">
            <span class="margin-label">Marge Brute</span>
            <span class="margin-val" id="smartOrderMargin">0.00 € (0%)</span>
          </div>
        </div>
      </div>
    `;
    productsGroup.after(builderContainer);
  }

  // Clear previous lines
  const linesContainer = document.getElementById('smartOrderLines');
  if (linesContainer) linesContainer.innerHTML = '';
  
  // Add first line
  addSmartOrderLine();

  // Reset other fields
  document.getElementById('crmOrderDate').value = '';
  document.getElementById('crmOrderPrice').value = '';
  document.getElementById('crmOrderStatus').value = 'pending';

  // If editing, load existing data
  if (editOrderId) {
    const order = APP.crm.orders.find(o => o.id === editOrderId);
    if (order) {
      document.getElementById('crmOrderClient').value = order.clientId;
      document.getElementById('crmOrderDate').value = order.date;
      document.getElementById('crmOrderPrice').value = order.price;
      document.getElementById('crmOrderStatus').value = order.status;
      
      // Load smart items if they exist
      if (order.items && order.items.length > 0) {
        linesContainer.innerHTML = '';
        order.items.forEach(item => addSmartOrderLine(item));
      }
    }
  }

  modal.style.display = 'flex';
};

window.addSmartOrderLine = function(preloadItem) {
  const container = document.getElementById('smartOrderLines');
  if (!container) return;
  
  const recipes = APP.savedRecipes || [];
  const lineIdx = container.children.length;
  
  const line = document.createElement('div');
  line.className = 'smart-order-line';
  line.innerHTML = `
    <select class="form-input sol-recipe" onchange="updateSmartOrderLine(this)" style="flex:2;">
      <option value="">— Choisir une recette —</option>
      ${recipes.map((r, i) => `<option value="${i}" ${preloadItem && preloadItem.recipeIdx == i ? 'selected' : ''}>${escapeHtml(r.name)}</option>`).join('')}
      <option value="custom">✏️ Saisie libre...</option>
    </select>
    <input type="number" class="form-input sol-qty" value="${preloadItem ? preloadItem.qty : 1}" min="1" 
      onchange="recalcSmartOrder()" oninput="recalcSmartOrder()" placeholder="Qté" style="flex:0.5; min-width:60px;">
    <div class="sol-unit-cost" style="flex:0.8; text-align:right; font-size:0.8rem; color:var(--text-muted);">—</div>
    <button type="button" class="btn-icon sol-remove" onclick="this.closest('.smart-order-line').remove(); recalcSmartOrder();" title="Supprimer">✕</button>
  `;
  container.appendChild(line);
  
  // If preloaded, trigger calculation
  if (preloadItem) {
    setTimeout(recalcSmartOrder, 50);
  }
};

window.updateSmartOrderLine = function(selectEl) {
  if (selectEl.value === 'custom') {
    // Replace select with free text input
    const line = selectEl.closest('.smart-order-line');
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'form-input sol-recipe-custom';
    input.placeholder = 'Ex: Pièce Montée sur mesure...';
    input.style.flex = '2';
    input.dataset.custom = 'true';
    selectEl.replaceWith(input);
    input.focus();
  }
  recalcSmartOrder();
};

window.recalcSmartOrder = function() {
  const lines = document.querySelectorAll('.smart-order-line');
  let totalCost = 0;
  let totalSell = 0;
  let hasItems = false;
  const recipes = APP.savedRecipes || [];
  
  lines.forEach(line => {
    const select = line.querySelector('.sol-recipe');
    const qtyInput = line.querySelector('.sol-qty');
    const costDisplay = line.querySelector('.sol-unit-cost');
    const qty = parseInt(qtyInput?.value) || 0;
    
    if (select && select.value && select.value !== 'custom' && select.value !== '') {
      const recipeIdx = parseInt(select.value);
      const recipe = recipes[recipeIdx];
      if (recipe) {
        let costs = null;
        if (typeof calcFullCost === 'function') {
          try { costs = calcFullCost(recipe.margin || 70, recipe); } catch(e) { costs = recipe.costs || recipe.data; }
        } else {
          costs = recipe.costs || recipe.data;
        }
        
        if (costs) {
          const unitCost = costs.costPerPortion || 0;
          const unitSell = applySmartPricing(costs.sellingPrice || costs.sellPriceHT || 0);
          const lineCost = unitCost * qty;
          const lineSell = unitSell * qty;
          totalCost += lineCost;
          totalSell += lineSell;
          hasItems = true;
          
          if (costDisplay) {
            costDisplay.innerHTML = `<span style="font-weight:600;">${lineSell.toFixed(2)} €</span><br><span style="font-size:0.7rem;">(coût: ${lineCost.toFixed(2)} €)</span>`;
          }
        }
      }
    }
  });

  // Update margin panel
  const panel = document.getElementById('smartOrderMarginPanel');
  if (panel) panel.style.display = hasItems ? 'block' : 'none';
  
  const margin = totalSell - totalCost;
  const marginPct = totalSell > 0 ? ((margin / totalSell) * 100) : 0;
  
  document.getElementById('smartOrderCostTotal').textContent = totalCost.toFixed(2) + ' €';
  document.getElementById('smartOrderSellTotal').textContent = totalSell.toFixed(2) + ' €';
  
  const marginEl = document.getElementById('smartOrderMargin');
  if (marginEl) {
    marginEl.textContent = margin.toFixed(2) + ' € (' + marginPct.toFixed(1) + '%)';
    marginEl.style.color = marginPct >= 60 ? 'var(--success)' : (marginPct >= 40 ? 'var(--warning, #f59e0b)' : 'var(--danger)');
  }
  
  // Auto-fill price field
  const priceField = document.getElementById('crmOrderPrice');
  if (priceField && totalSell > 0) {
    priceField.value = totalSell.toFixed(2);
  }
};

// Override the original modal opener
const _origShowAddOrderModal = window.showAddOrderModal;
window.showAddOrderModal = function() {
  showSmartOrderModal();
};

// Override save to include smart items data
const _origSaveCrmOrder = window.saveCrmOrder;
window.saveCrmOrder = function() {
  const clientId = document.getElementById('crmOrderClient').value;
  const date = document.getElementById('crmOrderDate').value;
  const price = document.getElementById('crmOrderPrice').value;
  const status = document.getElementById('crmOrderStatus').value;
  
  if (!clientId || !date) {
    if (typeof showToast === 'function') showToast('Informations incomplètes.', 'error');
    return;
  }

  // Collect smart order items
  const lines = document.querySelectorAll('.smart-order-line');
  const items = [];
  let productNames = [];
  const recipes = APP.savedRecipes || [];
  
  lines.forEach(line => {
    const select = line.querySelector('.sol-recipe');
    const customInput = line.querySelector('.sol-recipe-custom');
    const qtyInput = line.querySelector('.sol-qty');
    const qty = parseInt(qtyInput?.value) || 1;
    
    if (select && select.value && select.value !== '' && select.value !== 'custom') {
      const recipeIdx = parseInt(select.value);
      const recipe = recipes[recipeIdx];
      if (recipe) {
        let costs = null;
        if (typeof calcFullCost === 'function') {
          try { costs = calcFullCost(recipe.margin || 70, recipe); } catch(e) { costs = recipe.costs || recipe.data; }
        } else {
          costs = recipe.costs || recipe.data;
        }
        items.push({
          recipeIdx: recipeIdx,
          recipeName: recipe.name,
          qty: qty,
          unitCost: costs?.costPerPortion || 0,
          unitSell: applySmartPricing(costs?.sellingPrice || costs?.sellPriceHT || 0)
        });
        productNames.push(`${qty}x ${recipe.name}`);
      }
    } else if (customInput) {
      const customName = customInput.value.trim();
      if (customName) {
        items.push({ recipeName: customName, qty: qty, unitCost: 0, unitSell: parseFloat(price) || 0, custom: true });
        productNames.push(`${qty}x ${customName}`);
      }
    }
  });

  if (items.length === 0 && productNames.length === 0) {
    if (typeof showToast === 'function') showToast('Ajoutez au moins un produit.', 'error');
    return;
  }

  // Calculate margin
  let totalCost = items.reduce((sum, i) => sum + (i.unitCost * i.qty), 0);
  let totalSell = parseFloat(price) || items.reduce((sum, i) => sum + (i.unitSell * i.qty), 0);
  const marginPct = totalSell > 0 ? (((totalSell - totalCost) / totalSell) * 100) : 0;

  APP.crm.orders.push({
    id: 'cmd_' + Date.now(),
    clientId,
    products: productNames.join(', '),
    items: items,
    date,
    price: totalSell.toFixed(2),
    totalCost: totalCost.toFixed(2),
    marginPct: marginPct.toFixed(1),
    status
  });
  
  APP.crm.orders.sort((a, b) => new Date(a.date) - new Date(b.date));
  saveCrm();
  closeModal('modalAddOrder');
  renderCrmOrders();
  if (typeof showToast === 'function') showToast('Commande planifiée avec analyse de marge !', 'success');
  if (typeof triggerChocolateRain === 'function') triggerChocolateRain('light');
};

// Enhanced order card rendering with margin badge
const _origRenderCrmOrders = window.renderCrmOrders;
window.renderCrmOrders = function() {
  updateCrmKpis();
  const container = document.getElementById('crmOrdersBody');
  if (!container) return;

  if (APP.crm.orders.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">Aucune commande en cours.</p>';
    return;
  }

  container.innerHTML = APP.crm.orders.map(o => {
    const marginBadge = o.marginPct
      ? `<div class="order-margin-badge ${parseFloat(o.marginPct) >= 60 ? 'margin-good' : (parseFloat(o.marginPct) >= 40 ? 'margin-warn' : 'margin-bad')}">
          Marge: ${o.marginPct}%
        </div>`
      : '';
    
    const itemsList = o.items && o.items.length > 0
      ? `<div class="order-items-detail">${o.items.map(item =>
          `<span class="order-item-chip">${item.qty}× ${escapeHtml(item.recipeName)}</span>`
        ).join('')}</div>`
      : '';

    return `
      <div class="order-card" data-status="${o.status}">
        <div class="order-header">
          <div>
            <div class="order-client">${escapeHtml(getClientName(o.clientId))}</div>
            <div class="order-id">CMD #${o.id.substring(4, 9)}</div>
          </div>
          <button class="btn btn-sm btn-outline btn-round" style="border-color:var(--danger); color:var(--danger);" onclick="deleteCrmOrder('${o.id}')" title="Supprimer">🗑️</button>
        </div>
        <div class="order-date">🗓️ ${new Date(o.date).toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}</div>
        ${itemsList}
        <div class="order-products">${escapeHtml(o.products)}</div>
        ${marginBadge}
        <div class="order-footer">
          <div class="order-price">${parseFloat(o.price || 0).toFixed(2)} €</div>
          <select onchange="updateOrderStatus('${o.id}', this.value)" class="form-input" style="padding:0.4rem; height:auto; width:auto; border:1px solid var(--accent)!important;">
            <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>⏳ En prod / Attente</option>
            <option value="paid" ${o.status === 'paid' ? 'selected' : ''}>✅ Payée / Prête</option>
            <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>📦 Livrée</option>
          </select>
        </div>
      </div>
    `;
  }).join('');
};


// ============================================================================
// 2. EXPLOSION DES BESOINS — Bon d'Économat Automatique
// ============================================================================

window.generateBonEconomat = function() {
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  const recipes = APP.savedRecipes || [];
  
  if (plan.length === 0) {
    showToast("Aucune production planifiée. Ajoutez des items au planning d'abord.", 'error');
    return;
  }

  // 1. Aggregate all ingredients needed
  const needs = {};
  
  plan.forEach(item => {
    // Find the recipe
    const recipe = recipes.find(r => r.name === item.name || r.id === item.recipeId);
    if (!recipe || !recipe.ingredients) return;
    
    const factor = (item.qty || 1) / (recipe.portions || 1);
    
    recipe.ingredients.forEach(ing => {
      const key = (ing.name || '').toLowerCase().trim();
      if (!key) return;
      
      const rawQty = (parseFloat(ing.quantity) || 0) * factor;
      const unit = (ing.unit || 'g').toLowerCase();
      
      // Normalize to base units (g, ml)
      let normalizedQty = rawQty;
      let normalizedUnit = unit;
      if (unit === 'kg' || unit === 'l') { normalizedQty = rawQty * 1000; normalizedUnit = unit === 'kg' ? 'g' : 'ml'; }
      
      if (!needs[key]) {
        needs[key] = { name: ing.name, totalQty: 0, unit: normalizedUnit, recipes: [], pricePerUnit: ing.pricePerUnit || 0 };
      }
      needs[key].totalQty += normalizedQty;
      if (!needs[key].recipes.includes(item.name)) {
        needs[key].recipes.push(item.name);
      }
      
      // Get price from DB
      const dbItem = (APP.ingredientDb || []).find(db => db.name.toLowerCase() === key);
      if (dbItem) {
        needs[key].pricePerUnit = dbItem.pricePerUnit || needs[key].pricePerUnit;
      }
    });
  });
  
  // 2. Compare with current inventory
  const inventory = JSON.parse(localStorage.getItem(`gourmet_inventory_${(localStorage.getItem('gourmet_current_user') || 'chef').toLowerCase()}`) || '[]');
  
  const results = Object.values(needs).map(n => {
    const invItem = inventory.find(inv => (inv.name || '').toLowerCase() === n.name.toLowerCase());
    const stockQty = invItem ? (parseFloat(invItem.quantity) || 0) : 0;
    
    // Convert stock to same unit
    let stockNorm = stockQty;
    const invUnit = (invItem?.unit || n.unit).toLowerCase();
    if ((invUnit === 'kg' || invUnit === 'l') && (n.unit === 'g' || n.unit === 'ml')) {
      stockNorm = stockQty * 1000;
    }
    
    const deficit = Math.max(0, n.totalQty - stockNorm);
    const displayUnit = n.totalQty >= 1000 ? (n.unit === 'g' ? 'kg' : 'L') : n.unit;
    const displayQty = n.totalQty >= 1000 ? (n.totalQty / 1000) : n.totalQty;
    const displayDeficit = deficit >= 1000 ? (deficit / 1000) : deficit;
    const displayDeficitUnit = deficit >= 1000 ? (n.unit === 'g' ? 'kg' : 'L') : n.unit;
    
    // Cost estimation
    let estimatedCost = 0;
    if (deficit > 0 && n.pricePerUnit > 0) {
      // pricePerUnit is usually per kg or per L
      estimatedCost = (deficit / 1000) * n.pricePerUnit;
    }
    
    return {
      name: n.name,
      needed: displayQty,
      neededUnit: displayUnit,
      stock: stockNorm >= 1000 ? (stockNorm / 1000) : stockNorm,
      stockUnit: stockNorm >= 1000 ? (n.unit === 'g' ? 'kg' : 'L') : n.unit,
      deficit: displayDeficit,
      deficitUnit: displayDeficitUnit,
      deficitRaw: deficit,
      recipes: n.recipes,
      estimatedCost: estimatedCost,
      status: deficit <= 0 ? 'ok' : (stockNorm > 0 ? 'partial' : 'critical')
    };
  }).sort((a, b) => b.deficitRaw - a.deficitRaw);
  
  // 3. Render results
  renderBonEconomat(results, plan);
};

function renderBonEconomat(results, plan) {
  const container = document.getElementById('bonEconomatResults');
  if (!container) return;
  
  const totalCost = results.reduce((s, r) => s + r.estimatedCost, 0);
  const criticalItems = results.filter(r => r.status === 'critical').length;
  const partialItems = results.filter(r => r.status === 'partial').length;
  const okItems = results.filter(r => r.status === 'ok').length;

  container.innerHTML = `
    <div class="bon-economat-header">
      <h3>📦 Bon d'Économat</h3>
      <div class="bon-meta">
        <span>📅 ${new Date().toLocaleDateString('fr-FR')}</span>
        <span>📋 ${plan.length} production${plan.length > 1 ? 's' : ''} planifiée${plan.length > 1 ? 's' : ''}</span>
      </div>
    </div>
    
    <div class="bon-kpi-row">
      <div class="bon-kpi" style="border-color:var(--danger);">
        <div class="bon-kpi-val" style="color:var(--danger);">${criticalItems}</div>
        <div class="bon-kpi-label">À commander</div>
      </div>
      <div class="bon-kpi" style="border-color:var(--warning, #f59e0b);">
        <div class="bon-kpi-val" style="color:var(--warning, #f59e0b);">${partialItems}</div>
        <div class="bon-kpi-label">Stock partiel</div>
      </div>
      <div class="bon-kpi" style="border-color:var(--success);">
        <div class="bon-kpi-val" style="color:var(--success);">${okItems}</div>
        <div class="bon-kpi-label">En stock</div>
      </div>
      <div class="bon-kpi" style="border-color:var(--accent);">
        <div class="bon-kpi-val" style="color:var(--accent);">${totalCost.toFixed(0)} €</div>
        <div class="bon-kpi-label">Coût estimé</div>
      </div>
    </div>

    <div class="table-responsive">
      <table class="premium-table bon-table">
        <thead>
          <tr>
            <th>Ingrédient</th>
            <th>Besoin Total</th>
            <th>Stock Actuel</th>
            <th>À Commander</th>
            <th>Coût Estimé</th>
            <th>Recettes</th>
            <th>Statut</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr class="bon-row bon-${r.status}">
              <td><strong>${escapeHtml(r.name)}</strong></td>
              <td>${r.needed.toFixed(1)} ${r.neededUnit}</td>
              <td>${r.stock.toFixed(1)} ${r.stockUnit}</td>
              <td class="${r.status === 'ok' ? '' : 'text-bold'}">${r.status === 'ok' ? '✅ OK' : r.deficit.toFixed(1) + ' ' + r.deficitUnit}</td>
              <td>${r.estimatedCost > 0 ? r.estimatedCost.toFixed(2) + ' €' : '—'}</td>
              <td><span class="bon-recipes-list">${r.recipes.map(n => `<span class="bon-recipe-chip">${escapeHtml(n)}</span>`).join('')}</span></td>
              <td>
                <span class="bon-status-badge bon-status-${r.status}">
                  ${r.status === 'ok' ? '✅' : r.status === 'partial' ? '⚠️' : '🔴'}
                </span>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>

    <div class="bon-actions">
      <button class="btn btn-primary" onclick="exportBonEconomatCSV()">📁 Exporter en CSV</button>
      <button class="btn btn-outline" onclick="window.print()">🖨️ Imprimer</button>
    </div>
  `;
  
  container.style.display = 'block';
  
  // Store for export
  window._bonEconomatData = results;
}

window.exportBonEconomatCSV = function() {
  const data = window._bonEconomatData;
  if (!data || data.length === 0) return;
  
  let csv = 'Ingrédient;Besoin Total;Unité;Stock Actuel;À Commander;Coût Estimé (€);Recettes;Statut\n';
  data.forEach(r => {
    csv += `${r.name};${r.needed.toFixed(1)};${r.neededUnit};${r.stock.toFixed(1)};${r.deficit.toFixed(1)};${r.estimatedCost.toFixed(2)};${r.recipes.join(', ')};${r.status}\n`;
  });
  
  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `bon_economat_${new Date().toISOString().slice(0,10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Bon d\'économat exporté en CSV !', 'success');
};


// ============================================================================
// 3. GESTION DU GASPILLAGE AVANCÉE — Monthly Report Generator
// ============================================================================

window.renderWasteMonthlyReport = function() {
  const container = document.getElementById('wasteMonthlyReport');
  if (!container) return;
  
  let wasteLog = JSON.parse(localStorage.getItem('gourmet_waste_log') || '[]');
  
  // Inject Demo Data for WOW effect if empty
  if (wasteLog.length === 0) {
    const defaultRecipes = APP.savedRecipes || [];
    const recipeName1 = defaultRecipes.length > 0 ? defaultRecipes[0].name : "Paris-Brest";
    const recipeName2 = defaultRecipes.length > 1 ? defaultRecipes[1].name : "Tarte Citron";
    
    wasteLog = [
      {
        id: "w_demo_1", date: new Date().toISOString(), recipeIdx: 0, recipeName: recipeName1,
        qty: 12, reason: "invendu", value: 34.50, notes: "Mauvaise météo"
      },
      {
        id: "w_demo_2", date: new Date(Date.now() - 86400000*2).toISOString(), recipeIdx: 1, recipeName: recipeName2,
        qty: 3, reason: "casse", value: 8.40, notes: "Chute en vitrine"
      },
      {
        id: "w_demo_3", date: new Date(Date.now() - 86400000*5).toISOString(), recipeIdx: 0, recipeName: recipeName1,
        qty: 5, reason: "degustation", value: 14.20, notes: "Influenceurs"
      }
    ];
    localStorage.setItem('gourmet_waste_log', JSON.stringify(wasteLog));
    
    // Also trigger update of the chart and history
    if (typeof renderWasteAnalysis === 'function') setTimeout(renderWasteAnalysis, 100);
  }
  
  // Group by month
  const byMonth = {};
  wasteLog.forEach(w => {
    const date = new Date(w.date || w.timestamp);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (!byMonth[key]) byMonth[key] = { items: [], totalValue: 0, totalQty: 0, byReason: {}, byRecipe: {} };
    
    const value = parseFloat(w.value) || 0;
    byMonth[key].items.push(w);
    byMonth[key].totalValue += value;
    byMonth[key].totalQty += (parseInt(w.qty) || 1);
    
    // By reason
    const reason = w.reason || 'autre';
    if (!byMonth[key].byReason[reason]) byMonth[key].byReason[reason] = 0;
    byMonth[key].byReason[reason] += value;
    
    // By recipe
    const recipe = w.recipeName || 'Inconnu';
    if (!byMonth[key].byRecipe[recipe]) byMonth[key].byRecipe[recipe] = 0;
    byMonth[key].byRecipe[recipe] += value;
  });
  
  const months = Object.keys(byMonth).sort().reverse();
  const currentMonth = months[0];
  const data = byMonth[currentMonth];
  
  if (!data) {
    container.innerHTML = '<p style="text-align:center; padding:2rem; color:var(--text-muted);">Aucune donnée pour ce mois.</p>';
    return;
  }
  
  // Find worst recipe
  const worstRecipe = Object.entries(data.byRecipe).sort((a, b) => b[1] - a[1])[0];
  const worstReason = Object.entries(data.byReason).sort((a, b) => b[1] - a[1])[0];
  
  const reasonLabels = {
    'invendu': 'Invendus', 'casse': 'Casse / Erreur', 
    'degustation': 'Dégustation', 'peremption': 'Péremption', 'autre': 'Autre'
  };
  
  const monthName = new Date(currentMonth + '-01').toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
  
  container.innerHTML = `
    <div class="waste-report-card">
      <div class="waste-report-header">
        <h4>📊 Rapport Mensuel — ${monthName}</h4>
        <span class="waste-report-period">${data.totalQty} incident${data.totalQty > 1 ? 's' : ''}</span>
      </div>
      
      <div class="waste-report-hero">
        <div class="waste-report-amount">${data.totalValue.toFixed(2)} €</div>
        <div class="waste-report-subtitle">de marge perdue ce mois-ci</div>
      </div>
      
      ${worstRecipe ? `
        <div class="waste-report-insight">
          <span class="waste-insight-icon">💡</span>
          <p>La recette <strong>"${escapeHtml(worstRecipe[0])}"</strong> représente la plus grande perte 
          (${worstRecipe[1].toFixed(2)} €, soit ${((worstRecipe[1] / data.totalValue) * 100).toFixed(0)}% du total).
          ${worstReason ? ` Cause principale : <strong>${reasonLabels[worstReason[0]] || worstReason[0]}</strong>.` : ''}</p>
        </div>
      ` : ''}
      
      
      <div class="waste-report-breakdown">
        <h5>Répartition par cause</h5>
        ${Object.entries(data.byReason).sort((a,b) => b[1] - a[1]).map(([reason, val]) => {
          const pct = (val / data.totalValue * 100).toFixed(0);
          return `
            <div class="waste-bar-row">
              <span class="waste-bar-label">${reasonLabels[reason] || reason}</span>
              <div class="waste-bar-track">
                <div class="waste-bar-fill" style="width:${pct}%;"></div>
              </div>
              <span class="waste-bar-val">${val.toFixed(2)} € (${pct}%)</span>
            </div>
          `;
        }).join('')}
      </div>
      
      ${months.length > 1 ? `
        <div class="waste-report-trend">
          <h5>Évolution mensuelle</h5>
          <div class="waste-trend-row">
            ${months.slice(0, 6).reverse().map(m => {
              const d = byMonth[m];
              const monthLabel = new Date(m + '-01').toLocaleDateString('fr-FR', { month: 'short' });
              const maxVal = Math.max(...months.slice(0, 6).map(k => byMonth[k].totalValue));
              const barHeight = maxVal > 0 ? ((d.totalValue / maxVal) * 100) : 0;
              return `
                <div class="waste-trend-bar-wrap">
                  <div class="waste-trend-bar" style="height:${Math.max(4, barHeight)}%;"></div>
                  <span class="waste-trend-label">${monthLabel}</span>
                  <span class="waste-trend-val">${d.totalValue.toFixed(0)}€</span>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      ` : ''}
    </div>
  `;
};


// ============================================================================
// 4. PORTAIL CLIENT E-CATALOGUE — Public Link Generator
// ============================================================================

window.generateECatalogue = function() {
  console.log("Generating E-Catalogue for all recipes...");
  const saved = APP.savedRecipes || [];
  const reference = typeof RECIPES !== 'undefined' ? RECIPES : [];
  
  // Merge and remove duplicates by name
  const allRecipesMap = new Map();
  [...reference, ...saved].forEach(r => {
    if (r.name) allRecipesMap.set(r.name.toLowerCase(), r);
  });
  
  const recipes = Array.from(allRecipesMap.values());
  
  if (recipes.length === 0) {
    showToast("Aucune recette à afficher dans le catalogue.", 'error');
    return;
  }

  const userName = localStorage.getItem('gourmet_current_user') || 'Chef';
  const users = JSON.parse(localStorage.getItem('gourmet_users') || '{}');
  const profile = users[userName.toLowerCase()] || {};
  const shopName = profile.shopName || 'Ma Pâtisserie';
  
  // Build catalog data
  const catalogItems = recipes.map(r => {
    let costs = null;
    if (typeof calcFullCost === 'function') {
      try { 
        // Force a Premium Margin for the catalogue (82% vs standard 70%)
        costs = calcFullCost(r.margin || 82, r); 
      } catch(e) {
        costs = r.costs || r.data;
      }
    } else {
      costs = r.costs || r.data;
    }
    
    const allergens = new Set();
    (r.ingredients || []).forEach(ing => {
      const dbItem = (APP.ingredientDb || []).find(db => db.name.toLowerCase() === (ing.name || '').toLowerCase());
      dbItem?.allergens?.forEach(a => allergens.add(a));
    });
    
    return {
      name: r.name,
      category: r.category || 'Pâtisserie',
      price: costs?.sellingPrice ? applySmartPricing(costs.sellingPrice).toFixed(2) : (costs?.sellPriceHT ? applySmartPricing(costs.sellPriceHT).toFixed(2) : '—'),
      description: r.description || '',
      portions: r.portions || '—',
      allergens: [...allergens],
      ingredients: (r.ingredients || []).map(i => i.name).join(', ')
    };
  });

    // Generate standalone HTML page
    try {
      const html = window.generateCatalogueHTML(catalogItems, shopName, userName);
      window.showCataloguePreview(html, catalogItems, shopName);
    } catch(e) {
      console.error("Manual HTML Generation Error:", e);
      showToast("Erreur lors de la génération du contenu visuel.", 'error');
    }
};

window.groupByCategory = function(items) {
  const g = {};
  items.forEach(it => {
    const cat = it.category || 'Pâtisserie';
    if (!g[cat]) g[cat] = [];
    g[cat].push(it);
  });
  return g;
};

window.generateCatalogueHTML = function(items, shopName, userName) {
  console.log("Building HTML for", items.length, "items");
  const sName = String(shopName || 'Mon Atelier');
  const uName = String(userName || 'Chef');

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${shopName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400;0,6..96,700;1,6..96,400&family=Inter:wght@300;400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --gold: #b39449;
      --gold-light: #d4bc82;
      --charcoal: #1a1a1a;
      --ivory: #fcfaf7;
      --border: #eaddca;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { 
      font-family: 'Inter', sans-serif; 
      background-color: var(--ivory); 
      color: var(--charcoal); 
      line-height: 1.6;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .header {
      text-align: center;
      padding: 6rem 2rem;
      border-bottom: 1px solid var(--border);
      background: white;
      position: relative;
    }
    .header::after {
      content: "";
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 100px;
      height: 3px;
      background: var(--gold);
    }
    .header span {
      display: block;
      text-transform: uppercase;
      letter-spacing: 0.4em;
      font-size: 0.75rem;
      color: var(--gold);
      margin-bottom: 1.5rem;
      font-weight: 600;
    }
    h1 {
      font-family: 'Bodoni Moda', serif;
      font-size: clamp(2.5rem, 6vw, 4.5rem);
      font-weight: 400;
      color: var(--charcoal);
      margin-bottom: 1rem;
    }
    .header p {
      font-family: 'Bodoni Moda', serif;
      font-style: italic;
      font-size: 1.2rem;
      color: #777;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 5rem 2rem;
    }
    .category-section {
      margin-bottom: 6rem;
    }
    .category-title {
      font-family: 'Bodoni Moda', serif;
      font-size: 2.2rem;
      text-align: center;
      margin-bottom: 4rem;
      color: var(--gold);
      position: relative;
    }
    .category-title::after {
      content: "✧";
      display: block;
      font-size: 1.2rem;
      margin-top: 0.5rem;
      opacity: 0.5;
    }
    .items-list {
      display: flex;
      flex-direction: column;
      gap: 3.5rem;
    }
    .item {
      display: grid;
      grid-template-columns: 1fr auto;
      align-items: baseline;
      gap: 1.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(179, 148, 73, 0.1);
    }
    .item-main {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .item-name {
      font-family: 'Bodoni Moda', serif;
      font-size: 1.8rem;
      font-weight: 500;
      color: var(--charcoal);
    }
    .item-desc {
      font-size: 0.95rem;
      color: #666;
      max-width: 80%;
      font-style: italic;
    }
    .item-price {
      font-family: 'Bodoni Moda', serif;
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--gold);
    }
    .item-meta {
      grid-column: 1 / -1;
      display: flex;
      gap: 2rem;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      color: #aaa;
      margin-top: 0.5rem;
    }
    .allergen-warning {
      color: #c0a080;
    }
    footer {
      text-align: center;
      padding: 6rem 2rem;
      background: white;
      border-top: 1px solid var(--border);
    }
    .footer-signature {
      font-family: 'Bodoni Moda', serif;
      font-size: 1.2rem;
      margin-bottom: 1rem;
    }
    .footer-tag {
      font-size: 0.7rem;
      text-transform: uppercase;
      letter-spacing: 0.2em;
      color: #ccc;
    }
    @media (max-width: 600px) {
      .item { grid-template-columns: 1fr; gap: 0.5rem; }
      .item-price { order: -1; font-size: 1.4rem; }
      .header { padding: 4rem 1rem; }
      h1 { font-size: 2.2rem; }
    }
  </style>
</head>
<body>
  <div class="header">
    <span>Collection Exclusive</span>
    <h1>${shopName}</h1>
    <p>Créations signées par ${userName}</p>
  </div>

  <div class="container">
    ${Object.entries(window.groupByCategory(items)).map(([cat, catItems]) => `
      <div class="category-section">
        <h2 class="category-title">${cat}</h2>
        <div class="items-list">
          ${catItems.map(item => `
            <div class="item">
              <div class="item-main">
                <div class="item-name">${item.name}</div>
                <div class="item-desc">
                  ${item.description || "Une création artisanale alliant la noblesse des produits à la précision du geste."}
                </div>
              </div>
              <div class="item-price">${item.price}€</div>
              <div class="item-meta">
                <span>Portions : ${item.portions}</span>
                <span class="allergen-warning">${item.allergens.length > 0 ? 'Allergènes : ' + item.allergens.join(', ') : 'Exclusivité Maison'}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `).join('')}
  </div>

  <footer>
    <div class="footer-signature">L'Art de la Pâtisserie par ${shopName}</div>
    <div class="footer-tag">GourmetRevient • Haute Gastronomie</div>
  </footer>
</body>
</html>`;
}

window.showCataloguePreview = function(html, items, shopName) {
  let modal = document.getElementById('eCatalogueModal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'eCatalogueModal';
    modal.className = 'modal-overlay';
    modal.style.display = 'none';
    modal.innerHTML = `
      <div class="modal-content glass-panel" style="max-width:1200px; width:95%; max-height:95vh; display:flex; flex-direction:column;">
        <div class="modal-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
          <h3 style="margin:0;">🌐 E-Catalogue Client</h3>
          <button class="btn-icon" onclick="document.getElementById('eCatalogueModal').style.display='none';">✕</button>
        </div>
        <div id="eCataloguePreviewArea" style="flex:1; overflow:auto; border:1px solid var(--surface-border); border-radius:var(--radius); margin-bottom:1rem;"></div>
        <div id="eCatalogueActions" style="display:flex; gap:0.75rem; flex-wrap:wrap;"></div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  // Render preview in iframe
  const previewArea = document.getElementById('eCataloguePreviewArea');
  previewArea.innerHTML = '';
  const iframe = document.createElement('iframe');
  iframe.id = 'eCatIframePreview_' + Date.now();
  iframe.style.cssText = 'width:100%; height:750px; border:none; border-radius:var(--radius);';
  previewArea.appendChild(iframe);
  iframe.contentDocument.open();
  iframe.contentDocument.write(html);
  iframe.contentDocument.close();
  
  // Actions
  const actions = document.getElementById('eCatalogueActions');
  actions.innerHTML = `
    <button class="btn btn-primary" onclick="downloadECatalogue()">
      💾 Télécharger le HTML
    </button>
    <button class="btn btn-outline" onclick="generateECatalogueQR()">
      📱 Générer QR Code
    </button>
    <button class="btn btn-outline" onclick="copyECatalogueLink()">
      📋 Copier le lien
    </button>
    <div style="flex:1;"></div>
    <div style="display:flex; align-items:center; gap:0.5rem; font-size:0.8rem; color:var(--text-muted);">
      <span>📊 ${items.length} produits</span>
    </div>
  `;
  
  // Store generated HTML
  window._eCatalogueHTML = html;
  
  modal.style.display = 'flex';
}

window.downloadECatalogue = function() {
  const html = window._eCatalogueHTML;
  if (!html) return;
  
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `catalogue_${new Date().toISOString().slice(0,10)}.html`;
  link.click();
  URL.revokeObjectURL(url);
  showToast('Catalogue téléchargé !', 'success');
};

window.generateECatalogueQR = function() {
  // Create a data URL for the QR (for offline use, encode a summary)
  const recipes = APP.savedRecipes || [];
  const userName = localStorage.getItem('gourmet_current_user') || 'Chef';
  
  // For a real deployment, this would be a public URL
  // For now, show a message about deployment
  const qrContainer = document.getElementById('eCataloguePreviewArea');
  if (qrContainer) {
    const qrDiv = document.createElement('div');
    qrDiv.style.cssText = 'text-align:center; padding:2rem; background:var(--bg-alt); border-radius:var(--radius); margin-top:1rem;';
    qrDiv.innerHTML = `
      <div id="eCatQRCode" style="display:inline-block; padding:1rem; background:white; border-radius:12px; box-shadow:0 4px 15px rgba(0,0,0,0.05);"></div>
      <p style="margin-top:1rem; font-size:0.85rem; color:var(--text-muted);">
        📱 Ce QR Code pourra pointer vers votre catalogue en ligne une fois déployé.
      </p>
    `;
    qrContainer.appendChild(qrDiv);
    
    // Generate QR if library available
    if (typeof QRCode !== 'undefined') {
      new QRCode(document.getElementById('eCatQRCode'), {
        text: `https://gourmetrevient.github.io/?chef=${encodeURIComponent(userName)}`,
        width: 180,
        height: 180
      });
    }
  }
  showToast('QR Code généré !', 'success');
};

window.copyECatalogueLink = function() {
  const userName = localStorage.getItem('gourmet_current_user') || 'Chef';
  const link = `https://gourmetrevient.github.io/?chef=${encodeURIComponent(userName)}`;
  navigator.clipboard?.writeText(link).then(() => {
    showToast('Lien copié dans le presse-papier !', 'success');
  }).catch(() => {
    showToast('Lien : ' + link, 'info');
  });
};


// ============================================================================
// 5. INJECTION — Add Bon d'Économat button to production planning
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
  // Wait for DOM to be ready, then enhance the production planning section
  setTimeout(() => {
    // Add "Explosion des Besoins" button to production planning
    const prodGrid = document.getElementById('productionPlanGrid');
    if (prodGrid && !document.getElementById('bonEconomatBtn')) {
      const btnContainer = document.createElement('div');
      btnContainer.style.cssText = 'margin-top:1.5rem; display:flex; gap:0.75rem; flex-wrap:wrap;';
      btnContainer.innerHTML = `
        <button id="bonEconomatBtn" class="btn btn-primary" onclick="generateBonEconomat()" style="flex:1;">
          📦 Générer le Bon d'Économat
        </button>
      `;
      prodGrid.after(btnContainer);
      
      // Add results container
      const resultsDiv = document.createElement('div');
      resultsDiv.id = 'bonEconomatResults';
      resultsDiv.style.display = 'none';
      resultsDiv.style.marginTop = '1.5rem';
      btnContainer.after(resultsDiv);
    }
    
    // Add E-Catalogue button to Portfolio section
    const portfolioSection = document.getElementById('portfolioSection');
    if (portfolioSection && !document.getElementById('eCatalogueBtn')) {
      const heroSection = portfolioSection.querySelector('.hero');
      if (heroSection) {
        const btn = document.createElement('button');
        btn.id = 'eCatalogueBtn';
        btn.className = 'btn btn-primary';
        btn.style.cssText = 'margin-top:1.5rem;';
        btn.innerHTML = '🌐 Générer E-Catalogue Client';
        btn.onclick = generateECatalogue;
        heroSection.appendChild(btn);
      }
    }
    
    // Render waste monthly report if container exists
    if (document.getElementById('wasteMonthlyReport') && typeof renderWasteMonthlyReport === 'function') {
      renderWasteMonthlyReport();
    }
  }, 1500);
});
