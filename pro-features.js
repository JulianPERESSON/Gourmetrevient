/*
  =====================================================================
  PRO-FEATURES.JS — GourmetRevient v4.0 Advanced Modules
  - Scanner OCR Factures (Tesseract.js)
  - Étiquettes INCO Réglementaires
  - Calculateur de Foisonnement
  - Matrice de Boston (BCG)
  - Simulation d'Inflation / Scénario Crise
  - Synchronisation Cloud (Supabase)
  - QR Code "Fiche Client"
  =====================================================================
*/

// ============================================================================
// 1. SCANNER OCR DE FACTURES
// ============================================================================

let ocrWorker = null;

async function initOCR() {
  if (typeof Tesseract === 'undefined') {
    console.warn('Tesseract.js not loaded');
    return;
  }
  try {
    ocrWorker = await Tesseract.createWorker('fra');
  } catch (e) {
    console.error('OCR init error:', e);
  }
}

async function openOCRScanner() {
  // Gate Pro — accès conditionné à un abonnement actif
  if (window.GourmetBilling && !await GourmetBilling.isPro()) {
    await GourmetBilling.requirePro('Le Scanner OCR de Factures');
    return;
  }
  window.openModal('ocrScannerModal');
  const preview = document.getElementById('ocrPreview');
  const results = document.getElementById('ocrResults');
  const status = document.getElementById('ocrStatus');
  if (preview) preview.innerHTML = '<div class="ocr-upload-zone" id="ocrUploadZone"><span class="ocr-upload-icon">📸</span><p>' + t('ocr.upload.hint') + '</p><input type="file" id="ocrFileInput" accept="image/*" capture="environment" style="display:none"></div>';
  if (results) results.innerHTML = '';
  if (status) { status.style.display = 'none'; status.textContent = ''; }

  setTimeout(() => {
    const zone = document.getElementById('ocrUploadZone');
    const input = document.getElementById('ocrFileInput');
    if (zone) zone.onclick = () => input && input.click();
    if (input) input.onchange = (e) => handleOCRFile(e.target.files[0]);
  }, 100);
}

function closeOCRScanner() {
  window.closeModal('ocrScannerModal');
}

async function handleOCRFile(file) {
  if (!file) return;
  const preview = document.getElementById('ocrPreview');
  const status = document.getElementById('ocrStatus');
  const reader = new FileReader();
  reader.onload = (e) => {
    if (preview) preview.innerHTML = `<img src="${e.target.result}" class="ocr-preview-img" alt="Facture">`;
  };
  reader.readAsDataURL(file);

  if (status) {
    status.style.display = 'flex';
    status.innerHTML = '<div class="spinner-ocr"></div> <span>' + (t('ocr.processing') || 'Analyse OCR en cours...') + '</span>';
  }

  try {
    if (!ocrWorker) await initOCR();
    const { data } = await ocrWorker.recognize(file);
    const items = parseInvoiceText(data.text);
    if (status) status.style.display = 'none';
    renderOCRResults(items, data.text);
  } catch (err) {
    console.error('OCR Error:', err);
    if (status) status.innerHTML = '⚠️ ' + (t('ocr.error') || 'Erreur lors de l\'analyse.');
  }
}

function parseInvoiceText(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const items = [];
  const priceRegex = /(\d+[.,]\d{2})\s*€?/g;
  const qtyRegex = /(\d+[.,]?\d*)\s*(kg|g|L|ml|pcs?|unités?)/gi;

  for (const line of lines) {
    const prices = [...line.matchAll(priceRegex)];
    const quantities = [...line.matchAll(qtyRegex)];
    if (prices.length > 0) {
      const nameMatch = line.match(/^([A-Za-zÀ-ÿ\s\-']+)/);
      const name = nameMatch ? nameMatch[1].trim() : '';
      if (name.length > 2) {
        const lastPrice = parseFloat(prices[prices.length - 1][1].replace(',', '.'));
        const unitPrice = prices.length > 1 ? parseFloat(prices[0][1].replace(',', '.')) : lastPrice;
        let qty = '', unit = '';
        if (quantities.length > 0) {
          qty = quantities[0][1];
          unit = quantities[0][2].toLowerCase();
        }
        items.push({ name, unitPrice, total: lastPrice, qty, unit, matched: false });
      }
    }
  }

  items.forEach(item => {
    const match = APP.ingredientDb.find(db => 
      db.name.toLowerCase().includes(item.name.toLowerCase()) || 
      item.name.toLowerCase().includes(db.name.toLowerCase().split(' ')[0])
    );
    if (match) {
      item.matched = true;
      item.dbName = match.name;
      item.oldPrice = match.pricePerUnit;
    }
  });
  return items;
}

function renderOCRResults(items, rawText) {
  const results = document.getElementById('ocrResults');
  if (!results) return;
  if (items.length === 0) {
    results.innerHTML = `<div class="ocr-no-results"><p>${t('ocr.no_items') || 'Aucun article détecté.'}</p><pre>${rawText}</pre></div>`;
    return;
  }
  results.innerHTML = `<h4>${t('ocr.found') || 'Articles détectés'} (${items.length})</h4>` + 
    items.map((item, i) => `
      <div class="ocr-item ${item.matched ? 'matched' : ''}">
        <div>
          <b>${item.name}</b> ${item.matched ? `(→ ${item.dbName})` : ''}<br>
          ${item.unitPrice.toFixed(2)}€ ${item.matched ? `(Ancien: ${item.oldPrice?.toFixed(2)}€)` : ''}
        </div>
        <button class="btn btn-sm" onclick="applyOCRPrice(${i})">Appliquer</button>
      </div>
    `).join('') + 
    `<button class="btn btn-primary" onclick="applyAllOCRPrices()">Appliquer tout</button>`;
  window._ocrItems = items;
}

function applyOCRPrice(idx) {
  const item = window._ocrItems?.[idx];
  if (!item || !item.matched) return;

  // Validation : prix positif et non nul
  if (isNaN(item.unitPrice) || item.unitPrice <= 0) {
    if (typeof showToast === 'function')
      showToast(`⚠️ Prix invalide pour ${item.name || 'cet article'} : doit être supérieur à 0€.`, 'warning');
    return;
  }

  const dbItem = APP.ingredientDb.find(db => db.name === item.dbName);
  if (dbItem) {
    dbItem.pricePerUnit = item.unitPrice;
    saveIngredientDb();
    if (typeof showToast === 'function')
      showToast(`✅ ${item.dbName} mis à jour — ${item.unitPrice.toFixed(2)}€`, 'success');
  }
}

function applyAllOCRPrices() {
  if (!window._ocrItems?.length) return;
  let applied = 0;
  window._ocrItems.forEach((item, i) => {
    if (item.matched && item.unitPrice > 0) { applyOCRPrice(i); applied++; }
  });
  if (typeof showToast === 'function') showToast(`✅ ${applied} prix appliqués.`, 'success');
  closeOCRScanner();
}

// ============================================================================
// 2. ÉTIQUETTES INCO
// ============================================================================

async function openINCoGenerator() {
  // Gate Pro — accès conditionné à un abonnement actif
  if (window.GourmetBilling && !await GourmetBilling.isPro()) {
    await GourmetBilling.requirePro('Le Générateur d\'Étiquettes INCO');
    return;
  }
  window.openModal('incoModal');
  const select = document.getElementById('incoRecipeSelect');
  if (select) {
    select.innerHTML = '<option value="">-- Sélectionner --</option>' + 
      APP.savedRecipes.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');
  }
}

function closeINCoModal() {
  window.closeModal('incoModal');
}

function generateINCOLabel() {
  const selectEl = document.getElementById('incoRecipeSelect');
  const idx = selectEl?.value;

  // Validation : recette sélectionnée et non vide
  if (idx === '' || idx === null || idx === undefined) {
    _showModalError('incoModal', 'Veuillez sélectionner une recette.');
    return;
  }

  const recipe = APP.savedRecipes[idx];
  if (!recipe || !recipe.name?.trim()) {
    _showModalError('incoModal', 'Recette invalide ou sans nom.');
    return;
  }
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    _showModalError('incoModal', 'Cette recette ne contient aucun ingrédient.');
    return;
  }

  const allergenSet = new Set();
  recipe.ingredients.forEach(ing => {
    const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
    dbItem?.allergens?.forEach(a => allergenSet.add(a));
  });

  const ingredientList = [...recipe.ingredients]
    .sort((a,b) => convertToGrams(b) - convertToGrams(a))
    .map(ing => {
      const isAllergen = APP.ingredientDb.find(db => db.name === ing.name)?.allergens?.length > 0;
      return isAllergen ? `<strong>${ing.name}</strong>` : ing.name;
    }).join(', ');

  document.getElementById('incoLabelPreview').innerHTML = `
    <div class="inco-label" id="incoLabelContent">
      <h3>${recipe.name}</h3>
      <p><b>Ingrédients:</b> ${ingredientList}</p>
      <p><b>Allergènes:</b> ${Array.from(allergenSet).join(', ') || 'Aucun'}</p>
    </div>`;
}

function convertToGrams(ing) {
  const q = parseFloat(ing.quantity) || 0;
  const u = (ing.unit || 'g').toLowerCase();
  if (u === 'kg' || u === 'l') return q * 1000;
  return q;
}

// ============================================================================
// UTILITAIRES VALIDATION MODAUX
// ============================================================================

/**
 * Affiche une erreur inline dans un modal (non bloquante).
 * Cherche ou crée un élément #<modalId>-error dans le modal.
 */
function _showModalError(modalId, message) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  let errEl = modal.querySelector('.modal-validation-error');
  if (!errEl) {
    errEl = document.createElement('div');
    errEl.className = 'modal-validation-error';
    errEl.style.cssText = [
      'background:rgba(239,68,68,0.12)',
      'border:1px solid rgba(239,68,68,0.35)',
      'border-radius:10px',
      'color:#fca5a5',
      'font-size:0.85rem',
      'font-weight:600',
      'padding:0.6rem 1rem',
      'margin-top:0.75rem',
      'display:flex',
      'align-items:center',
      'gap:6px',
      'animation:shakeModal 0.35s ease'
    ].join(';');
    // Insérer juste avant le premier bouton d'action du modal
    const firstBtn = modal.querySelector('button.btn, button[class*="btn"]');
    if (firstBtn) modal.insertBefore(errEl, firstBtn);
    else modal.appendChild(errEl);
  }
  errEl.innerHTML = `⚠️ ${message}`;
  errEl.style.display = 'flex';
  // Auto-hide après 5s
  clearTimeout(errEl._hideTimer);
  errEl._hideTimer = setTimeout(() => { errEl.style.display = 'none'; }, 5000);
}

function _clearModalError(modalId) {
  const modal = document.getElementById(modalId);
  const errEl = modal?.querySelector('.modal-validation-error');
  if (errEl) errEl.style.display = 'none';
}

// Injection du keyframe shake si absent
if (!document.getElementById('modalShakeStyle')) {
  const s = document.createElement('style');
  s.id = 'modalShakeStyle';
  s.textContent = `@keyframes shakeModal{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}} .input-error{border-color:#ef4444!important;box-shadow:0 0 0 3px rgba(239,68,68,0.2)!important;}`;
  document.head.appendChild(s);
}

// ============================================================================
// 3. FOISONNEMENT
// ============================================================================

async function openFoisonnement() {
  // Gate Pro — accès conditionné à un abonnement actif
  if (window.GourmetBilling && !await GourmetBilling.isPro()) {
    await GourmetBilling.requirePro('Le Calculateur de Foisonnement');
    return;
  }
  window.openModal('foisonnementModal');
}

function closeFoisonnement() {
  window.closeModal('foisonnementModal');
}

function calcFoisonnement() {
  const beforeEl = document.getElementById('foisVolumeBefore');
  const afterEl  = document.getElementById('foisVolumeAfter');
  const before = parseFloat(beforeEl?.value) || 0;
  const after  = parseFloat(afterEl?.value)  || 0;

  // Validation stricte
  if (before <= 0) {
    _showModalError('foisonnementModal', 'Le volume initial doit être supérieur à zéro.');
    if (beforeEl) { beforeEl.classList.add('input-error'); beforeEl.focus(); }
    return;
  }
  if (after < 0) {
    _showModalError('foisonnementModal', 'Le volume final ne peut pas être négatif.');
    if (afterEl) { afterEl.classList.add('input-error'); afterEl.focus(); }
    return;
  }
  // Effacer les erreurs précédentes
  if (beforeEl) beforeEl.classList.remove('input-error');
  if (afterEl)  afterEl.classList.remove('input-error');
  _clearModalError('foisonnementModal');

  const result = ((after - before) / before * 100).toFixed(1);
  document.getElementById('foisResult').innerHTML = `<h3>${result}%</h3><p style="font-size:0.82rem;opacity:0.6;margin-top:4px;">${after > before ? '⬆️ Foisonnement positif' : after < before ? '⬇️ Contraction' : '↔️ Neutre'}</p>`;
}

// ============================================================================
// 5. SIMULATION INFLATION — High-Performance Slider
// ============================================================================

// Cache: pre-computed baseline data (only changes when recipes change, not on slider move)
let _inflationCache = { recipes: null, baselines: null, version: 0 };
let _inflationDomBuilt = false;
let _inflationRAF = null;
let _inflationStorageTimeout = null;
let _inflationCascadeTimeout = null;

function _buildInflationBaselines() {
  const savedRecs = (window.APP && window.APP.savedRecipes) || [];
  const libraryRecs = typeof RECIPES !== 'undefined' ? RECIPES : [];
  const recipes = [...savedRecs, ...libraryRecs];
  
  const baselines = recipes.map(r => {
    try {
      let currentCosts = null;
      if (typeof window.calcFullCost === 'function') {
        currentCosts = window.calcFullCost(r.margin || 70, r, 0);
      } else {
        currentCosts = r.costs || r.data;
      }
      if (!currentCosts) return null;
      
      const oldMargin = currentCosts.marginPct || 0;
      const oldCost = currentCosts.costPerPortion || 0;
      const sellPrice = currentCosts.sellingPrice || (oldMargin < 100 ? (oldCost / (1 - (oldMargin/100))) : oldCost * 4);
      return { name: r.name, oldMargin, oldCost, sellPrice };
    } catch(e) { return null; }
  }).filter(Boolean);
  
  _inflationCache = { recipes, baselines, version: (_inflationCache.version || 0) + 1 };
  return baselines;
}

window.ingredientPriceOverrides = window.ingredientPriceOverrides || {};

function getUniqueIngredients() {
  const savedRecs = (window.APP && window.APP.savedRecipes) || [];
  const libraryRecs = typeof RECIPES !== 'undefined' ? RECIPES : [];
  const recipes = [...savedRecs, ...libraryRecs];
  
  const ings = new Set();
  recipes.forEach(r => {
    if (r.ingredients) {
      r.ingredients.forEach(i => {
        if (i.name && i.name.trim()) ings.add(i.name.trim());
      });
    }
  });
  return [...ings].sort();
}

window.renderCockpitIngredientsList = function() {
  const container = document.getElementById('cockpitIngredientsList');
  if (!container) return;
  
  const ings = getUniqueIngredients();
  container.innerHTML = ings.map(ing => {
    const key = ing.toLowerCase();
    const val = window.ingredientPriceOverrides[key] || 0;
    return `
      <div class="cockpit-ing-row" style="display:flex; justify-content:space-between; align-items:center; font-size:0.8rem; padding: 4px 0; border-bottom: 1px dotted rgba(255,255,255,0.05);">
        <span style="color:var(--text-secondary); max-width: 170px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${ing}">${ing}</span>
        <div style="display:flex; align-items:center; gap:4px;">
          <input type="number" class="form-input cockpit-override-input" data-ing="${key}" value="${val}" style="width:60px; padding:3px 5px; font-size:0.75rem; text-align:center; height:auto; border: 1px solid var(--surface-border)!important; background:rgba(0,0,0,0.3); color:#fff;" oninput="window.onCockpitOverrideChange(this)">
          <span style="color:var(--text-muted); font-size:0.7rem;">%</span>
        </div>
      </div>
    `;
  }).join('');
};

window.filterCockpitIngredients = function() {
  const query = (document.getElementById('cockpitSearch').value || '').toLowerCase().trim();
  const rows = document.querySelectorAll('.cockpit-ing-row');
  rows.forEach(row => {
    const label = row.querySelector('span').textContent.toLowerCase();
    if (label.includes(query)) {
      row.style.display = 'flex';
    } else {
      row.style.display = 'none';
    }
  });
};

window.onCockpitOverrideChange = function(input) {
  const ingName = input.dataset.ing;
  const val = parseFloat(input.value) || 0;
  
  if (val === 0) {
    delete window.ingredientPriceOverrides[ingName];
  } else {
    window.ingredientPriceOverrides[ingName] = val;
  }
  
  // Refresh simulation
  const slider = document.getElementById('inflationSlider');
  const pct = slider ? parseFloat(slider.value) : 0;
  _updateInflationValues(pct);
};

window.resetCockpitOverrides = function() {
  window.ingredientPriceOverrides = {};
  const inputs = document.querySelectorAll('.cockpit-override-input');
  inputs.forEach(input => input.value = 0);
  
  const search = document.getElementById('cockpitSearch');
  if (search) search.value = '';
  window.filterCockpitIngredients();
  
  const slider = document.getElementById('inflationSlider');
  if (slider) {
    slider.value = 0;
    const valDisp = document.getElementById('inflationValue');
    if (valDisp) valDisp.textContent = '0%';
    window.inflationFactor = 0;
  }
  
  _updateInflationValues(0);
};

function _buildInflationDOM(baselines) {
  const container = document.getElementById('inflationResults');
  if (!container) return;
  
  if (baselines.length === 0) {
    container.innerHTML = `<div class="insight-box" style="margin-top:2rem;"><div class="insight-icon">🔍</div><div class="insight-text"><p>${i18n.t('inflation.no_data')}</p></div></div>`;
    _inflationDomBuilt = false;
    return;
  }
  
  const summaryHTML = `
    <div class="inflation-summary">
      <div class="summary-pill safe" id="inflationPillStatus">🛡️ ${i18n.t('inflation.safe')}</div>
      <div class="summary-pill info" id="inflationPillLoss">📉 Perte moyenne : 0.0%</div>
    </div>`;

  const cardsHTML = baselines.map((b, i) => `
    <div class="inflation-card status-ok" id="inflCard_${i}">
      <div class="inflation-card-header">
        <span class="recipe-name">${b.name}</span>
        <span class="status-icon" id="inflIcon_${i}">✅</span>
      </div>
      <div class="inflation-stats">
        <div class="stat-item">
          <span class="label">${i18n.t('inflation.col.original')}</span>
          <span class="val">${b.oldMargin.toFixed(1)}%</span>
        </div>
        <div class="stat-item">
          <span class="label">${i18n.t('inflation.col.new')}</span>
          <span class="val highlighted" id="inflNewMargin_${i}">${b.oldMargin.toFixed(1)}%</span>
        </div>
      </div>
      <div class="inflation-impact-bar">
        <div class="impact-fill" id="inflBar_${i}" style="width:${Math.max(0, Math.min(100, b.oldMargin))}%; background:var(--cockpit-success); transition: width 0.08s linear, background 0.12s linear;"></div>
      </div>
      <div class="inflation-diff" id="inflDiff_${i}">${i18n.t('inflation.status.ok')}</div>
    </div>
  `).join('');

  container.innerHTML = summaryHTML + `<div class="inflation-grid">${cardsHTML}</div>`;
  _inflationDomBuilt = true;
  
  // Render cockpit unique ingredients list
  window.renderCockpitIngredientsList();
}

function _updateInflationValues(pct) {
  const baselines = _inflationCache.baselines;
  if (!baselines || !_inflationDomBuilt) return;
  
  let inDanger = 0;
  let totalMarginLoss = 0;
  
  const targetMarginInput = document.getElementById('cockpitTargetMargin');
  const targetMargin = targetMarginInput ? (parseFloat(targetMarginInput.value) || 70) : 70;
  
  for (let i = 0; i < baselines.length; i++) {
    const b = baselines[i];
    const recipeObj = _inflationCache.recipes[i];
    
    let newCost = b.oldCost;
    if (recipeObj && typeof window.calcFullCost === 'function') {
      try {
        const costData = window.calcFullCost(recipeObj.margin || 70, recipeObj, pct);
        newCost = costData.costPerPortion || 0;
      } catch (e) {
        console.error(e);
        newCost = b.oldCost * (1 + pct / 100);
      }
    } else {
      newCost = b.oldCost * (1 + pct / 100);
    }
    
    const newMargin = b.sellPrice > 0 ? (((b.sellPrice - newCost) / b.sellPrice) * 100) : 0;
    const marginImpact = b.oldMargin - newMargin;
    totalMarginLoss += marginImpact;
    if (newMargin < targetMargin) inDanger++;
    
    const card = document.getElementById('inflCard_' + i);
    const icon = document.getElementById('inflIcon_' + i);
    const newMarginEl = document.getElementById('inflNewMargin_' + i);
    const bar = document.getElementById('inflBar_' + i);
    const diff = document.getElementById('inflDiff_' + i);
    
    if (!card) continue;
    
    let cls = 'status-ok', ico = '✅';
    if (newMargin < targetMargin) { cls = 'status-danger'; ico = '❌'; }
    else if (newMargin < targetMargin + 5) { cls = 'status-warning'; ico = '⚠️'; }
    
    card.className = 'inflation-card ' + cls;
    if (icon) icon.textContent = ico;
    if (newMarginEl) newMarginEl.textContent = newMargin.toFixed(1) + '%';
    if (bar) {
      bar.style.width = Math.max(0, Math.min(100, newMargin)) + '%';
      bar.style.background = newMargin < targetMargin ? '#ef4444' : (newMargin < targetMargin + 5 ? '#f59e0b' : '#10b981');
    }
    if (diff) {
      const lossText = Math.abs(marginImpact) < 0.1 
        ? 'Marge stable' 
        : `-${marginImpact.toFixed(1)} pts de marge`;
      const recommendedPrice = targetMargin < 100 ? (newCost / (1 - targetMargin / 100)) : newCost * 3.33;
      diff.innerHTML = `
        <div style="font-size:0.75rem; color:var(--text-muted);">${lossText}</div>
        <div style="font-size:0.75rem; font-weight:700; color:var(--primary); margin-top:2px;">PV cible : ${recommendedPrice.toFixed(2)} €</div>
      `;
    }
  }
  
  const pillStatus = document.getElementById('inflationPillStatus');
  const pillLoss = document.getElementById('inflationPillLoss');
  const avgLoss = baselines.length > 0 ? (totalMarginLoss / baselines.length) : 0;
  
  if (pillStatus) {
    if (inDanger > 0) {
      pillStatus.className = 'summary-pill danger';
      pillStatus.textContent = `❗ ${inDanger} sous la cible (${targetMargin}%)`;
    } else {
      pillStatus.className = 'summary-pill safe';
      pillStatus.textContent = `🛡️ Catalogue résilient (>${targetMargin}%)`;
    }
  }
  if (pillLoss) {
    pillLoss.className = 'summary-pill ' + (avgLoss > 5 ? 'danger' : 'info');
    pillLoss.textContent = `📉 Perte Moyenne : -${avgLoss.toFixed(1)} pts`;
  }
}

function renderInflationSimulation() {
  const slider = document.getElementById('inflationSlider');
  if (!slider) return;
  const pct = parseFloat(slider.value) || 0;
  
  const valDisp = document.getElementById('inflationValue');
  if (valDisp) valDisp.textContent = pct + '%';
  window.inflationFactor = pct;
  
  if (_inflationStorageTimeout) clearTimeout(_inflationStorageTimeout);
  _inflationStorageTimeout = setTimeout(() => {
    localStorage.setItem('gourmet_inflation_factor', pct);
  }, 100);

  if (!_inflationCache.baselines || !_inflationDomBuilt) {
    _buildInflationBaselines();
    _buildInflationDOM(_inflationCache.baselines);
  }
  
  if (_inflationRAF) cancelAnimationFrame(_inflationRAF);
  _inflationRAF = requestAnimationFrame(() => {
    _updateInflationValues(pct);
  });

  if (_inflationCascadeTimeout) clearTimeout(_inflationCascadeTimeout);
  _inflationCascadeTimeout = setTimeout(() => {
    const hub = document.getElementById('hubSection');
    if (hub && hub.style.display !== 'none' && typeof hydratePremiumDashboard === 'function') {
      hydratePremiumDashboard();
    }
    if (typeof calculateBreakingPoint === 'function') calculateBreakingPoint();
    if (typeof renderBCGMatrix === 'function') renderBCGMatrix(true);
  }, 300);
}reakingPoint === 'function') calculateBreakingPoint();
    if (typeof renderBCGMatrix === 'function') renderBCGMatrix(true);
  }, 300);
}

// Force a full rebuild (call when recipes list changes)
function invalidateInflationCache() {
  _inflationDomBuilt = false;
  _inflationCache.baselines = null;
}

// ============================================================================
// 6. SYNCHRONISATION CLOUD
// ============================================================================

const SUPABASE_CONFIG = { url: '', key: '' };

async function openCloudSync() {
  // Gate Pro — accès conditionné à un abonnement actif
  if (window.GourmetBilling && !await GourmetBilling.isPro()) {
    await GourmetBilling.requirePro('La Synchronisation Cloud Avancée');
    return;
  }
  window.openModal('cloudSyncModal');
  const saved = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  document.getElementById('supabaseUrl').value = saved.url || '';
  document.getElementById('supabaseKey').value = saved.key || '';
}

function closeCloudSync() {
  window.closeModal('cloudSyncModal');
}

async function saveCloudConfig() {
  const url = document.getElementById('supabaseUrl').value;
  const key = document.getElementById('supabaseKey').value;
  localStorage.setItem('gourmet_cloud_config', JSON.stringify({ url, key }));
  showToast('Config enregistrée', 'success');
}

const STICKY_CLOUD_CONFIG = { 
  url: '', // L'administrateur peut remplir ceci pour un déploiement "Zéro-Config"
  key: '' 
};

async function syncToCloud(silent = false) {
  const localConfig = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  const config = {
    url: localConfig.url || STICKY_CLOUD_CONFIG.url,
    key: localConfig.key || STICKY_CLOUD_CONFIG.key
  };
  
  if (!config.url) {
    if (!silent) showToast('Config manquante', 'error');
    return;
  }
  
  try {
    const data = {
      user: getViewOwner(),
      recipes: JSON.stringify(APP.savedRecipes),
      ingredientDb: JSON.stringify(APP.ingredientDb),
      haccp: JSON.stringify(APP.haccpLogs),
      profile: JSON.stringify(getUserProfile(getViewOwner())),
      timestamp: new Date().toISOString()
    };
    const response = await fetch(`${config.url}/rest/v1/gourmet_sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    if (response.ok) showToast('Sync réussie', 'success');
  } catch (e) {
    showToast('Erreur sync', 'error');
  }
}

async function syncFromCloud() {
  const localConfig = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  const config = {
    url: localConfig.url || STICKY_CLOUD_CONFIG.url,
    key: localConfig.key || STICKY_CLOUD_CONFIG.key
  };
  if (!config.url) return;
  try {
    const response = await fetch(`${config.url}/rest/v1/gourmet_sync?user=eq.${encodeURIComponent(getViewOwner())}&order=timestamp.desc&limit=1`, {
      headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
    });
    const data = await response.json();
    if (data?.[0]) {
      if (data[0].recipes) {
        APP.savedRecipes = JSON.parse(data[0].recipes);
        saveSavedRecipes();
      }
      if (data[0].haccp) {
        APP.haccpLogs = JSON.parse(data[0].haccp);
        if (typeof saveHaccpLogs === 'function') saveHaccpLogs();
      }
      showToast('Données restaurées', 'success');
    }
  } catch (e) {
    showToast('Erreur restauration', 'error');
  }
}

function getUserProfile(name) {
  const users = JSON.parse(localStorage.getItem('gourmet_users') || '{}');
  return users[name.toLowerCase()] || {};
}

async function tryRemoteLogin(user, pin) {
  const localConfig = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  const config = {
    url: localConfig.url || STICKY_CLOUD_CONFIG.url,
    key: localConfig.key || STICKY_CLOUD_CONFIG.key
  };
  if (!config.url) return null;

  try {
    const response = await fetch(`${config.url}/rest/v1/gourmet_sync?user=eq.${encodeURIComponent(user)}&order=timestamp.desc&limit=1`, {
      headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
    });
    const data = await response.json();
    if (data?.[0]?.profile) {
      const cloudProfile = JSON.parse(data[0].profile);
      if (cloudProfile.pin === pin) {
        // Success! Return the data to hydrate local state
        return {
          profile: cloudProfile,
          recipes: JSON.parse(data[0].recipes || '[]'),
          ingredients: JSON.parse(data[0].ingredientDb || '[]')
        };
      }
    }
  } catch (e) {
    console.error("Remote login error:", e);
  }
  return null;
}

// ============================================================================
// 7. QR CODE
// ============================================================================

function generateClientQR(idx) {
  const recipe = APP.savedRecipes[idx];
  if (!recipe) return;
  window.openModal('clientQRModal');
  document.getElementById('clientQRRecipeName').textContent = recipe.name;
  
  const qrContainer = document.getElementById('clientQRCode');
  qrContainer.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrContainer, { text: recipe.name, width: 156, height: 156 });
  }
}

function closeClientQR() {
  window.closeModal('clientQRModal');
}

// ============================================================================
// 8. AUTO-SYNC & ZERO-CONFIG
// ============================================================================

function setupAutoSync() {
  // 1. Process URL Parameters for Zero-Config
  const urlParams = new URLSearchParams(window.location.search);
  const url = urlParams.get('cloud_url');
  const key = urlParams.get('cloud_key');
  
  if (url && key) {
    localStorage.setItem('gourmet_cloud_config', JSON.stringify({ url, key }));
    // Clear URL parameters to avoid leaking key in screenshots/shares
    window.history.replaceState({}, document.title, window.location.pathname);
    showToast('Cloud auto-configuré !', 'success');
  }

  // 2. Monkey-patch save functions to trigger auto-upload
  const originalSaveRecipes = window.saveSavedRecipes;
  window.saveSavedRecipes = function() {
    if (typeof originalSaveRecipes === 'function') originalSaveRecipes();
    triggerAutoSync();
  };

  const originalSaveDb = window.saveIngredientDb;
  window.saveIngredientDb = function() {
    if (typeof originalSaveDb === 'function') originalSaveDb();
    triggerAutoSync();
  };

  // 3. Initial pull if auth is already valid
  if (localStorage.getItem('gourmet_auth') === 'true') {
     syncFromCloud();
  }
}

let syncTimeout = null;
function triggerAutoSync() {
  const config = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  if (!config.url || !config.key) return;

  // Debounce to avoid too many requests during rapid edits
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    syncToCloud(true); // silent sync
  }, 2000);
}

// Update syncToCloud to support silent mode
const originalSyncToCloud = window.syncToCloud;
window.syncToCloud = async function(silent = false) {
  const config = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  if (!config.url) {
    if (!silent) showToast('Config manquante', 'error');
    return;
  }
  
  try {
    const data = {
      user: typeof getViewOwner === 'function' ? getViewOwner() : (localStorage.getItem('gourmet_current_user') || 'Chef'),
      recipes: JSON.stringify(APP.savedRecipes),
      ingredientDb: JSON.stringify(APP.ingredientDb),
      timestamp: new Date().toISOString()
    };
    
    const response = await fetch(`${config.url}/rest/v1/gourmet_sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`,
        'Prefer': 'resolution=merge-duplicates'
      },
      body: JSON.stringify(data)
    });
    
    if (response.ok && !silent) showToast('Sync réussie', 'success');
  } catch (e) {
    if (!silent) showToast('Erreur sync', 'error');
    console.error("Auto-sync error:", e);
  }
};

// Auto-run initialization
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('inflationSlider');
  if (slider) {
    slider.addEventListener('input', renderInflationSimulation);
    // Initialize global factor from slider
    window.inflationFactor = parseFloat(slider.value) || 0;
    renderInflationSimulation(); 
  }
  
  // Initialize Auto-Sync
  setTimeout(setupAutoSync, 1000);
});
