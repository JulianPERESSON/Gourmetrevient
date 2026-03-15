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

function openOCRScanner() {
  const modal = document.getElementById('ocrScannerModal');
  if (modal) modal.style.display = 'flex';
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
  const modal = document.getElementById('ocrScannerModal');
  if (modal) modal.style.display = 'none';
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
  if (item && item.matched) {
    const dbItem = APP.ingredientDb.find(db => db.name === item.dbName);
    if (dbItem) {
      dbItem.pricePerUnit = item.unitPrice;
      saveIngredientDb();
      showToast(`${item.dbName} mis à jour`, 'success');
    }
  }
}

function applyAllOCRPrices() {
  window._ocrItems?.forEach((item, i) => applyOCRPrice(i));
  closeOCRScanner();
}

// ============================================================================
// 2. ÉTIQUETTES INCO
// ============================================================================

function openINCoGenerator() {
  const modal = document.getElementById('incoModal');
  if (modal) modal.style.display = 'flex';
  const select = document.getElementById('incoRecipeSelect');
  if (select) {
    select.innerHTML = '<option value="">-- Sélectionner --</option>' + 
      APP.savedRecipes.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');
  }
}

function generateINCOLabel() {
  const idx = document.getElementById('incoRecipeSelect')?.value;
  const recipe = APP.savedRecipes[idx];
  if (!recipe) return;
  
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
// 3. FOISONNEMENT
// ============================================================================

function openFoisonnement() {
  document.getElementById('foisonnementModal').style.display = 'flex';
}

function calcFoisonnement() {
  const before = parseFloat(document.getElementById('foisVolumeBefore').value) || 0;
  const after = parseFloat(document.getElementById('foisVolumeAfter').value) || 0;
  if (before > 0) {
    const result = ((after - before) / before * 100).toFixed(1);
    document.getElementById('foisResult').innerHTML = `<h3>${result}%</h3>`;
  }
}

// ============================================================================
// 4. MATRICE DE BOSTON (BCG)
// ============================================================================

let bcgChartInstance = null;

function renderBCGMatrix(isUpdate = false) {
  const canvas = document.getElementById('bcgChartCanvas');
  const ctx = canvas?.getContext('2d');
  const legendContainer = document.getElementById('bcgLegend');
  if (!ctx) return;
  
  const recipes = (window.APP && window.APP.savedRecipes) || [];
  if (recipes.length === 0) {
    if (bcgChartInstance) { bcgChartInstance.destroy(); bcgChartInstance = null; }
    if (legendContainer) legendContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted); padding:2rem;">${i18n.t('bcg.no_data')}</p>`;
    return;
  }

  // 1. Prepare Data
  const data = recipes.map(r => {
    let costObj = (window.inflationFactor > 0 && typeof window.calcFullCost === 'function') 
        ? window.calcFullCost(r.margin || 70, r)
        : (r.costs || r.data);
        
    const margin = costObj?.marginPct || 70;
    
    // Stable "random" popularity based on name to prevent jumpy animation
    const seed = r.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const popularity = 10 + ((seed * 7) % 80); 
    
    let quadrant = '';
    let color = '';
    
    if (margin >= 75 && popularity >= 50) { quadrant = 'star'; color = '#10b981'; } 
    else if (margin >= 75 && popularity < 50) { quadrant = 'question'; color = '#f59e0b'; } 
    else if (margin < 75 && popularity >= 50) { quadrant = 'cash_cow'; color = '#3b82f6'; } 
    else { quadrant = 'dead_weight'; color = '#ef4444'; } 
    
    return {
      x: popularity,
      y: margin,
      v: r.costs?.unitCost || 0,
      name: r.name,
      quadrant: quadrant,
      color: color
    };
  });

  // If chart exists, just update data and colors for maximum smoothness
  if (bcgChartInstance) {
     bcgChartInstance.data.datasets[0].data = data;
     bcgChartInstance.data.datasets[0].pointBackgroundColor = data.map(d => d.color);
     bcgChartInstance.options.animation = false; // Disable animation during live moves
     bcgChartInstance.update('none'); 
     updateBCGLegend(data, legendContainer);
     return;
  }

  // 2. Custom Plugin for Quadrants
  const quadrantPlugin = {
    id: 'quadrantPlugin',
    beforeDraw(chart) {
      const { ctx, chartArea: { top, bottom, left, right, width, height }, scales: { x, y } } = chart;
      const midX = x.getPixelForValue(50);
      const midY = y.getPixelForValue(75);

      ctx.save();
      
      // Draw Quadrants
      // Top Right: Stars (Green)
      ctx.fillStyle = 'rgba(16, 185, 129, 0.05)';
      ctx.fillRect(midX, top, right - midX, midY - top);
      
      // Top Left: Dilemmas (Orange)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.fillRect(left, top, midX - left, midY - top);
      
      // Bottom Right: Cash Cows (Blue)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.05)';
      ctx.fillRect(midX, midY, right - midX, bottom - midY);
      
      // Bottom Left: Dogs (Red)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
      ctx.fillRect(left, midY, midX - left, bottom - midY);

      // Draw Axis Lines
      ctx.strokeStyle = 'rgba(0,0,0,0.1)';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]);
      
      ctx.beginPath();
      ctx.moveTo(midX, top);
      ctx.lineTo(midX, bottom);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.moveTo(left, midY);
      ctx.lineTo(right, midY);
      ctx.stroke();

      // Quadrant Labels
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.font = 'bold 12px Inter';
      ctx.textAlign = 'center';
      
      const starTxt = i18n.t('bcg.star').toUpperCase();
      const questionTxt = i18n.t('bcg.question').toUpperCase();
      const cowTxt = i18n.t('bcg.cash_cow').toUpperCase();
      const dogTxt = i18n.t('bcg.dead_weight').toUpperCase();

      // Draw Labels with icons (relying on i18n keys having emojis)
      ctx.fillText(starTxt, midX + (right - midX)/2, top + 25);
      ctx.fillText(questionTxt, left + (midX - left)/2, top + 25);
      ctx.fillText(cowTxt, midX + (right - midX)/2, bottom - 15);
      ctx.fillText(dogTxt, left + (midX - left)/2, bottom - 15);
      
      ctx.restore();
    }
  };

  // 3. Render Chart
  bcgChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Recettes',
        data: data,
        pointBackgroundColor: data.map(d => d.color),
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 }, // Default animation for initial load
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (context) => {
              const p = context.raw;
              return ` ${p.name}: ${p.y.toFixed(1)}% Marge | Pop: ${p.x.toFixed(0)}`;
            }
          }
        }
      },
      scales: {
        x: {
          min: 0, max: 100,
          title: { display: true, text: i18n.t('bcg.axis.popularity'), font: { weight: 'bold' } },
          grid: { display: false }
        },
        y: {
          min: 40, max: 100,
          title: { display: true, text: i18n.t('bcg.axis.margin'), font: { weight: 'bold' } },
          grid: { display: false }
        }
      }
    },
    plugins: [quadrantPlugin]
  });

  updateBCGLegend(data, legendContainer);
}

function updateBCGLegend(data, legendContainer) {
  if (!legendContainer) return;
  legendContainer.innerHTML = `
    <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap:1rem; margin-top:1rem;">
      ${['star', 'cash_cow', 'question', 'dead_weight'].map(q => {
        const items = data.filter(d => d.quadrant === q);
        if (items.length === 0) return '';
        return `
          <div class="bcg-quadrant-group" style="padding:1rem; border-radius:12px; border: 1px solid rgba(0,0,0,0.05); background: #fdfdfd;">
            <h4 style="margin:0 0 10px 0; font-size:0.8rem; display:flex; align-items:center; gap:8px;">
              <span style="width:10px; height:10px; border-radius:50%; background:${items[0].color}"></span>
              ${i18n.t('bcg.' + q)}
            </h4>
            <ul style="list-style:none; padding:0; margin:0; font-size:0.75rem; color:var(--text-muted);">
              ${items.map(it => `<li>• ${it.name}</li>`).join('')}
            </ul>
            <div style="margin-top:8px; font-size:0.65rem; font-style:italic; color:var(--accent);">
              Target: ${i18n.t('bcg.action.' + q)}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

// ============================================================================
// 5. SIMULATION INFLATION
// ============================================================================

function renderInflationSimulation() {
  const slider = document.getElementById('inflationSlider');
  if (!slider) return;
  const pct = parseFloat(slider.value) || 0;
  
  const valDisp = document.getElementById('inflationValue');
  if (valDisp) valDisp.textContent = pct + '%';
  
  // Set global factor for cross-app simulation
  window.inflationFactor = pct;
  if (typeof localStorage !== 'undefined') localStorage.setItem('gourmet_inflation_factor', pct);

  const container = document.getElementById('inflationResults');
  if (!container) return;

  const recipes = (window.APP && window.APP.savedRecipes) || [];
  if (recipes.length === 0) {
    container.innerHTML = `<div class="insight-box" style="margin-top:2rem;"><div class="insight-icon">🔍</div><div class="insight-text"><p>${i18n.t('inflation.no_data')}</p></div></div>`;
    return;
  }

  let inDanger = 0;
  let totalMarginLoss = 0;
  let resultsArr = [];

  recipes.forEach(r => {
    try {
      // ALWAYS get baseline (0% inflation) for "Marge Actuelle" in simulation cards
      let currentCosts = null;
      if (typeof window.calcFullCost === 'function') {
        currentCosts = window.calcFullCost(r.margin || 70, r, 0); 
      } else {
        currentCosts = r.costs || r.data;
      }
      
      if (!currentCosts) return;

      const oldMargin = currentCosts.marginPct || 0;
      const oldCost = currentCosts.costPerPortion || 0;
      const sellPrice = currentCosts.sellPriceHT || (oldMargin < 100 ? (oldCost / (1 - (oldMargin/100))) : oldCost * 4);

      // New cost = old cost + percentage
      const newCost = oldCost * (1 + pct / 100);
      const newMargin = sellPrice > 0 ? (((sellPrice - newCost) / sellPrice) * 100) : 0;
      const marginImpact = oldMargin - newMargin;

      totalMarginLoss += marginImpact;
      if (newMargin < 50) inDanger++;

      let statusClass = 'status-ok';
      let icon = '✅';
      if (newMargin < 50) { statusClass = 'status-danger'; icon = '💀'; }
      else if (newMargin < 65) { statusClass = 'status-warning'; icon = '⚠️'; }

      resultsArr.push(`
        <div class="inflation-card ${statusClass}">
          <div class="inflation-card-header">
             <span class="recipe-name">${r.name}</span>
             <span class="status-icon">${icon}</span>
          </div>
          <div class="inflation-stats">
            <div class="stat-item">
              <span class="label">${i18n.t('inflation.col.original')}</span>
              <span class="val">${oldMargin.toFixed(1)}%</span>
            </div>
            <div class="stat-item">
              <span class="label">${i18n.t('inflation.col.new')}</span>
              <span class="val highlighted">${newMargin.toFixed(1)}%</span>
            </div>
          </div>
          <div class="inflation-impact-bar">
            <div class="impact-fill" style="width: ${Math.max(0, Math.min(100, newMargin))}%; background: ${newMargin < 50 ? 'var(--cockpit-danger)' : (newMargin < 65 ? 'var(--cockpit-accent)' : 'var(--cockpit-success)')}"></div>
          </div>
          <div class="inflation-diff">
          ${Math.abs(marginImpact) < 0.1 ? i18n.t('inflation.status.ok') : `-${marginImpact.toFixed(1)} pts de marge`}
        </div>
        </div>
      `);
    } catch (err) {
      console.warn("Failed to simulate inflation for recipe", r.name, err);
    }
  });

  if (resultsArr.length === 0) {
     container.innerHTML = `<p style="text-align:center; padding:2rem; color:var(--text-muted);">${i18n.t('inflation.no_data')}</p>`;
     return;
  }

  container.innerHTML = `
    <div class="inflation-summary">
      <div class="summary-pill ${inDanger > 0 ? 'danger' : 'safe'}">
        ${inDanger > 0 ? `❗ ${inDanger} ${i18n.t('inflation.critical')}` : `🛡️ ${i18n.t('inflation.safe')}`}
      </div>
      <div class="summary-pill info">
        📉 Perte moyenne : ${(totalMarginLoss / recipes.length).toFixed(1)}%
      </div>
    </div>
    <div class="inflation-grid">
      ${resultsArr.join('')}
    </div>
  `;

  // Trigger UI refreshes in other parts (throttled to avoid layout thrashing)
  if (this.simTimeout) clearTimeout(this.simTimeout);
  this.simTimeout = setTimeout(() => {
    // Only hydrate if the hub is potentially visible to avoid off-screen layout work
    const hub = document.getElementById('hubSection');
    if (hub && hub.style.display !== 'none' && typeof hydratePremiumDashboard === 'function') {
        hydratePremiumDashboard();
    }
    if (typeof calculateBreakingPoint === 'function') calculateBreakingPoint();
    if (typeof renderBCGMatrix === 'function') renderBCGMatrix(true);
  }, 32); // ~30fps for cross-app updates
}

// ============================================================================
// 6. SYNCHRONISATION CLOUD
// ============================================================================

const SUPABASE_CONFIG = { url: '', key: '' };

function openCloudSync() {
  document.getElementById('cloudSyncModal').style.display = 'flex';
  const saved = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  document.getElementById('supabaseUrl').value = saved.url || '';
  document.getElementById('supabaseKey').value = saved.key || '';
}

async function saveCloudConfig() {
  const url = document.getElementById('supabaseUrl').value;
  const key = document.getElementById('supabaseKey').value;
  localStorage.setItem('gourmet_cloud_config', JSON.stringify({ url, key }));
  showToast('Config enregistrée', 'success');
}

async function syncToCloud() {
  const config = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  if (!config.url) return showToast('Config manquante', 'error');
  
  try {
    const data = {
      user: getViewOwner(),
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
    if (response.ok) showToast('Sync réussie', 'success');
  } catch (e) {
    showToast('Erreur sync', 'error');
  }
}

async function syncFromCloud() {
  const config = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  if (!config.url) return;
  try {
    const response = await fetch(`${config.url}/rest/v1/gourmet_sync?user=eq.${encodeURIComponent(getViewOwner())}&order=timestamp.desc&limit=1`, {
      headers: { 'apikey': config.key, 'Authorization': `Bearer ${config.key}` }
    });
    const data = await response.json();
    if (data?.[0]?.recipes) {
      APP.savedRecipes = JSON.parse(data[0].recipes);
      saveSavedRecipes();
      showToast('Données restaurées', 'success');
    }
  } catch (e) {
    showToast('Erreur restauration', 'error');
  }
}

// ============================================================================
// 7. QR CODE
// ============================================================================

function generateClientQR(idx) {
  const recipe = APP.savedRecipes[idx];
  if (!recipe) return;
  document.getElementById('clientQRModal').style.display = 'flex';
  document.getElementById('clientQRRecipeName').textContent = recipe.name;
  
  const qrContainer = document.getElementById('clientQRCode');
  qrContainer.innerHTML = '';
  if (typeof QRCode !== 'undefined') {
    new QRCode(qrContainer, { text: recipe.name, width: 156, height: 156 });
  }
}

function closeClientQR() {
  document.getElementById('clientQRModal').style.display = 'none';
}

// Auto-run initialization
document.addEventListener('DOMContentLoaded', () => {
  const slider = document.getElementById('inflationSlider');
  if (slider) {
    slider.addEventListener('input', renderInflationSimulation);
    // Initialize global factor from slider
    window.inflationFactor = parseFloat(slider.value) || 0;
    renderInflationSimulation(); 
  }
});
