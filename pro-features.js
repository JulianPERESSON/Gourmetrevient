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

function renderBCGMatrix() {
  const ctx = document.getElementById('bcgChartCanvas')?.getContext('2d');
  if (!ctx) return;
  if (bcgChartInstance) bcgChartInstance.destroy();
  
  const data = APP.savedRecipes.map(r => ({
    x: Math.random() * 100, // Simulated popularity
    y: (r.costs?.marginPct || 70),
    name: r.name
  }));

  bcgChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Produits',
        data: data,
        backgroundColor: 'rgba(75, 192, 192, 0.6)'
      }]
    },
    options: {
      scales: {
        x: { title: { display: true, text: 'Popularité' } },
        y: { title: { display: true, text: 'Marge %' } }
      }
    }
  });
}

// ============================================================================
// 5. SIMULATION INFLATION
// ============================================================================

function renderInflationSimulation() {
  const pct = parseFloat(document.getElementById('inflationSlider').value) || 0;
  document.getElementById('inflationValue').textContent = pct + '%';
  const container = document.getElementById('inflationResults');
  
  const rows = APP.savedRecipes.map(r => {
    const oldCost = r.id ? calcFullCost(70, r).costPerPortion : 0;
    const newCost = oldCost * (1 + pct/100);
    return `<tr><td>${r.name}</td><td>${oldCost.toFixed(2)}€</td><td>${newCost.toFixed(2)}€</td></tr>`;
  }).join('');
  
  container.innerHTML = `<table class="table"><thead><tr><th>Recette</th><th>Actuel</th><th>+${pct}%</th></tr></thead><tbody>${rows}</tbody></table>`;
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
