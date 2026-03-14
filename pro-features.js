/*
  =====================================================================
  PRO-FEATURES.JS Ã¢â‚¬â€ GourmetRevient v4.0 Advanced Modules
  - Scanner OCR Factures (Tesseract.js)
  - Ãƒâ€°tiquettes INCO RÃƒÂ©glementaires
  - Calculateur de Foisonnement
  - Matrice de Boston (BCG)
  - Simulation d'Inflation / ScÃƒÂ©nario Crise
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
  // Reset state
  const preview = document.getElementById('ocrPreview');
  const results = document.getElementById('ocrResults');
  const status = document.getElementById('ocrStatus');
  if (preview) preview.innerHTML = '<div class="ocr-upload-zone" id="ocrUploadZone"><span class="ocr-upload-icon">Ã°Å¸â€œÂ·</span><p>' + t('ocr.upload.hint') + '</p><input type="file" id="ocrFileInput" accept="image/*" capture="environment" style="display:none"></div>';
  if (results) results.innerHTML = '';
  if (status) { status.style.display = 'none'; status.textContent = ''; }

  // Bind upload
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
  const results = document.getElementById('ocrResults');

  // Show preview
  const reader = new FileReader();
  reader.onload = (e) => {
    if (preview) preview.innerHTML = `<img src="${e.target.result}" class="ocr-preview-img" alt="Facture">`;
  };
  reader.readAsDataURL(file);

  // Show loading
  if (status) {
    status.style.display = 'flex';
    status.innerHTML = '<div class="spinner-ocr"></div> <span>' + (t('ocr.processing') || 'Analyse OCR en cours...') + '</span>';
  }

  try {
    if (!ocrWorker) await initOCR();
    if (!ocrWorker) throw new Error('OCR not available');

    const { data } = await ocrWorker.recognize(file);
    const extractedText = data.text;

    // Parse invoice items
    const items = parseInvoiceText(extractedText);

    if (status) status.style.display = 'none';
    renderOCRResults(items, extractedText);
  } catch (err) {
    console.error('OCR Error:', err);
    if (status) {
      status.innerHTML = 'Ã¢ÂÅ’ ' + (t('ocr.error') || 'Erreur lors de l\'analyse. RÃƒÂ©essayez avec une image plus nette.');
    }
  }
}

function parseInvoiceText(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const items = [];

  // Common patterns for French invoices:
  // Product name ... quantity ... unit price ... total
  const priceRegex = /(\d+[.,]\d{2})\s*Ã¢â€šÂ¬?/g;
  const qtyRegex = /(\d+[.,]?\d*)\s*(kg|g|L|ml|pce?s?|unit[ÃƒÂ©e]s?)/gi;

  for (const line of lines) {
    const prices = [...line.matchAll(priceRegex)];
    const quantities = [...line.matchAll(qtyRegex)];

    if (prices.length > 0) {
      // Try to extract ingredient name (text before first number)
      const nameMatch = line.match(/^([A-Za-zÃƒâ‚¬-ÃƒÂ¿\s\-']+)/);
      const name = nameMatch ? nameMatch[1].trim() : '';

      if (name.length > 2) {
        const lastPrice = parseFloat(prices[prices.length - 1][1].replace(',', '.'));
        const unitPrice = prices.length > 1 ? parseFloat(prices[0][1].replace(',', '.')) : lastPrice;

        let qty = '', unit = '';
        if (quantities.length > 0) {
          qty = quantities[0][1];
          unit = quantities[0][2].toLowerCase();
        }

        items.push({
          name: name,
          unitPrice: unitPrice,
          total: lastPrice,
          qty: qty,
          unit: unit,
          matched: false
        });
      }
    }
  }

  // Try to match with existing ingredient DB
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
    results.innerHTML = `
      <div class="ocr-no-results">
        <span>Ã°Å¸â€Â</span>
        <p>${t('ocr.no_items') || 'Aucun article dÃƒÂ©tectÃƒÂ©. Texte brut extrait :'}</p>
        <pre class="ocr-raw-text">${escapeHtml(rawText)}</pre>
      </div>`;
    return;
  }

  results.innerHTML = `
    <div class="ocr-results-header">
      <h4>Ã°Å¸â€œâ€¹ ${t('ocr.found') || 'Articles dÃƒÂ©tectÃƒÂ©s'} (${items.length})</h4>
    </div>
    <div class="ocr-items-list">
      ${items.map((item, i) => `
        <div class="ocr-item ${item.matched ? 'matched' : ''}">
          <div class="ocr-item-info">
            <div class="ocr-item-name">${escapeHtml(item.name)}</div>
            ${item.matched ? `<span class="ocr-match-badge">Ã¢Å“â€¦ ${item.dbName}</span>` : '<span class="ocr-no-match-badge">Ã¢Ââ€œ Non reconnu</span>'}
            <div class="ocr-item-price">
              ${item.unitPrice.toFixed(2)} Ã¢â€šÂ¬${item.unit ? '/' + item.unit : ''}
              ${item.matched && item.oldPrice ? `<span class="ocr-old-price">(ancien: ${item.oldPrice.toFixed(2)} Ã¢â€šÂ¬)</span>` : ''}
            </div>
          </div>
          <div class="ocr-item-actions">
            ${item.matched ? `<button class="btn btn-sm btn-primary" onclick="applyOCRPrice(${i})" data-items='${JSON.stringify(item).replace(/'/g, "&#39;")}'>${t('ocr.btn.apply') || 'Mettre ÃƒÂ  jour'}</button>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="ocr-actions-bar">
      <button class="btn btn-primary btn-full" onclick="applyAllOCRPrices()">${t('ocr.btn.apply_all') || 'Ã¢Å“â€¦ Appliquer toutes les mises ÃƒÂ  jour'}</button>
    </div>`;

  // Store items for later use
  window._ocrItems = items;
}

function applyOCRPrice(idx) {
  const items = window._ocrItems;
  if (!items || !items[idx] || !items[idx].matched) return;

  const item = items[idx];
  const dbItem = APP.ingredientDb.find(db => db.name === item.dbName);
  if (dbItem) {
    dbItem.pricePerUnit = item.unitPrice;
    saveIngredientDb();
    showToast(`${item.dbName}: ${item.oldPrice?.toFixed(2)}Ã¢â€šÂ¬ Ã¢â€ â€™ ${item.unitPrice.toFixed(2)}Ã¢â€šÂ¬`, 'success');

    // Update visual
    const el = document.querySelectorAll('.ocr-item')[idx];
    if (el) {
      el.classList.add('applied');
      el.querySelector('.btn-primary')?.remove();
    }
  }
}

function applyAllOCRPrices() {
  const items = window._ocrItems;
  if (!items) return;
  let count = 0;
  items.forEach((item, idx) => {
    if (item.matched) {
      const dbItem = APP.ingredientDb.find(db => db.name === item.dbName);
      if (dbItem) {
        dbItem.pricePerUnit = item.unitPrice;
        count++;
      }
    }
  });
  saveIngredientDb();
  showToast(`${count} ${t('ocr.updated') || 'prix mis ÃƒÂ  jour depuis la facture'}`, 'success');
  closeOCRScanner();
}


// ============================================================================
// 2. GÃƒâ€°NÃƒâ€°RATEUR D'Ãƒâ€°TIQUETTES INCO
// ============================================================================

function openINCoGenerator() {
  const modal = document.getElementById('incoModal');
  if (modal) modal.style.display = 'flex';
  populateINCoRecipeSelect();
}

function closeINCoModal() {
  const modal = document.getElementById('incoModal');
  if (modal) modal.style.display = 'none';
}

function populateINCoRecipeSelect() {
  const select = document.getElementById('incoRecipeSelect');
  if (!select) return;
  const recipes = APP.savedRecipes || [];
  select.innerHTML = '<option value="">' + (t('inco.select') || 'Ã¢â‚¬â€ SÃƒÂ©lectionner une recette Ã¢â‚¬â€') + '</option>' +
    recipes.map((r, i) => `<option value="${i}">${escapeHtml(r.name)}</option>`).join('');
}

function generateINCOLabel() {
  const select = document.getElementById('incoRecipeSelect');
  const preview = document.getElementById('incoLabelPreview');
  if (!select || !preview) return;

  const idx = parseInt(select.value);
  if (isNaN(idx)) return;

  const recipe = APP.savedRecipes[idx];
  if (!recipe) return;

  // 1. Sort ingredients by weight (descending)
  const sortedIngredients = [...recipe.ingredients].sort((a, b) => {
    const wa = convertToGrams(a);
    const wb = convertToGrams(b);
    return wb - wa;
  });

  // 2. Collect allergens
  const allergenSet = new Set();
  recipe.ingredients.forEach(ing => {
    const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
    if (dbItem && dbItem.allergens) {
      dbItem.allergens.forEach(a => allergenSet.add(a));
    }
  });

  // 3. Build ingredient list with allergens in bold
  const ingredientList = sortedIngredients.map(ing => {
    let name = ing.name;
    const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === name.toLowerCase());
    if (dbItem && dbItem.allergens && dbItem.allergens.length > 0) {
      // Bold the name if it contains allergens
      name = `<strong>${name}</strong>`;
    }
    return name;
  }).join(', ') + '.';

  // 4. Allergen list
  const allergenList = allergenSet.size > 0
    ? Array.from(allergenSet).map(a => `<strong>${a}</strong>`).join(', ')
    : (t('inco.no_allergens') || 'Aucun allergÃƒÂ¨ne dÃƒÂ©clarÃƒÂ©');

  // 5. Compute costs for price
  const costs = calcFullCost(recipe.margin || 70, recipe);
  const price = costs.sellingPrice;

  // 6. Net weight
  let totalWeight = 0;
  recipe.ingredients.forEach(ing => {
    totalWeight += convertToGrams(ing);
  });
  const netWeightPerPortion = (totalWeight / (recipe.portions || 10)).toFixed(0);

  // Render label preview (60x40mm format)
  preview.innerHTML = `
    <div class="inco-label" id="incoLabelContent">
      <div class="inco-label-name">${escapeHtml(recipe.name)}</div>
      <div class="inco-label-section">
        <div class="inco-label-title">${t('inco.ingredients_list') || 'IngrÃƒÂ©dients :'}</div>
        <div class="inco-label-text">${ingredientList}</div>
      </div>
      <div class="inco-label-section">
        <div class="inco-label-title">${t('inco.allergens') || 'AllergÃƒÂ¨nes :'}</div>
        <div class="inco-label-text inco-allergens">${allergenList}</div>
      </div>
      <div class="inco-label-footer">
        <span>${t('inco.net_weight') || 'Poids net'} : ~${netWeightPerPortion}g</span>
        <span>${t('inco.price') || 'PVC'} : ${price.toFixed(2)} Ã¢â€šÂ¬</span>
      </div>
      <div class="inco-label-legal">${t('inco.storage') || 'Conserver au frais entre 2Ã‚Â°C et 6Ã‚Â°C. Ãƒâ‚¬ consommer dans les 48h.'}</div>
    </div>`;
}

function convertToGrams(ing) {
  const qty = parseFloat(ing.quantity) || 0;
  const unit = (ing.unit || 'g').toLowerCase();
  if (unit === 'kg') return qty * 1000;
  if (unit === 'l') return qty * 1000;
  if (unit === 'ml') return qty;
  if (unit === 'piÃƒÂ¨ce' || unit === 'pcs' || unit === 'pce') return qty * 50; // avg weight
  return qty; // g
}

function exportINCOPdf() {
  const el = document.getElementById('incoLabelContent');
  if (!el || typeof html2pdf === 'undefined') {
    showToast(t('toast.pdf.error') || 'html2pdf non chargÃƒÂ©', 'error');
    return;
  }
  html2pdf().set({
    margin: [2, 2, 2, 2],
    filename: 'etiquette-inco.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3, useCORS: true },
    jsPDF: {
      unit: 'mm',
      format: [60, 40],
      orientation: 'landscape'
    }
  }).from(el).save().then(() => {
    showToast(t('inco.exported') || 'Ãƒâ€°tiquette INCO exportÃƒÂ©e !', 'success');
  });
}


// ============================================================================
// 3. CALCULATEUR DE FOISONNEMENT
// ============================================================================

function openFoisonnement() {
  const modal = document.getElementById('foisonnementModal');
  if (modal) modal.style.display = 'flex';
  // Reset
  document.getElementById('foisVolumeBefore')?.setAttribute('value', '');
  document.getElementById('foisVolumeAfter')?.setAttribute('value', '');
  const result = document.getElementById('foisResult');
  if (result) result.innerHTML = '';
}

function closeFoisonnement() {
  const modal = document.getElementById('foisonnementModal');
  if (modal) modal.style.display = 'none';
}

function calcFoisonnement() {
  const before = parseFloat(document.getElementById('foisVolumeBefore')?.value) || 0;
  const after = parseFloat(document.getElementById('foisVolumeAfter')?.value) || 0;
  const result = document.getElementById('foisResult');
  if (!result) return;

  if (before <= 0 || after <= 0) {
    result.innerHTML = `<div class="fois-error">${t('fois.error') || 'Veuillez saisir des volumes valides.'}</div>`;
    return;
  }

  const coeff = ((after - before) / before * 100).toFixed(1);
  const multiplier = (after / before).toFixed(2);
  const gainVolume = (after - before).toFixed(0);

  let qualityLabel, qualityClass;
  if (coeff < 50) { qualityLabel = t('fois.dense') || 'Dense Ã¢â‚¬â€ CrÃƒÂ¨me ÃƒÂ©paisse, ganache'; qualityClass = 'fois-dense'; }
  else if (coeff < 100) { qualityLabel = t('fois.medium') || 'Moyen Ã¢â‚¬â€ Mousse chocolat, bavaroise'; qualityClass = 'fois-medium'; }
  else if (coeff < 200) { qualityLabel = t('fois.light') || 'AÃƒÂ©rÃƒÂ© Ã¢â‚¬â€ Mousse aux fruits, chantilly'; qualityClass = 'fois-light'; }
  else { qualityLabel = t('fois.ultra') || 'Ultra-aÃƒÂ©rÃƒÂ© Ã¢â‚¬â€ Chantilly trÃƒÂ¨s montÃƒÂ©e, espuma'; qualityClass = 'fois-ultra'; }

  result.innerHTML = `
    <div class="fois-results-grid">
      <div class="fois-kpi">
        <div class="fois-kpi-val">${coeff}%</div>
        <div class="fois-kpi-label">${t('fois.coefficient') || 'Coefficient de foisonnement'}</div>
      </div>
      <div class="fois-kpi">
        <div class="fois-kpi-val">Ãƒâ€”${multiplier}</div>
        <div class="fois-kpi-label">${t('fois.multiplier') || 'Multiplicateur de volume'}</div>
      </div>
      <div class="fois-kpi">
        <div class="fois-kpi-val">+${gainVolume} ml</div>
        <div class="fois-kpi-label">${t('fois.gain') || 'Gain de volume'}</div>
      </div>
    </div>
    <div class="fois-quality ${qualityClass}">
      <span class="fois-quality-icon">Ã°Å¸â€™Â¨</span>
      <span>${qualityLabel}</span>
    </div>
    <div class="fois-tip">
      Ã°Å¸â€™Â¡ ${t('fois.tip') || 'Le foisonnement affecte le rendement final. Ajustez la quantitÃƒÂ© de votre appareil en consÃƒÂ©quence.'}
    </div>`;
}


// ============================================================================
// 4. MATRICE DE BOSTON (BCG) Ã¢â‚¬â€ ANALYSE DE MIX-PRODUIT
// ============================================================================

let bcgChartInstance = null;

function renderBCGMatrix() {
  const container = document.getElementById('bcgChartCanvas');
  const legendContainer = document.getElementById('bcgLegend');
  if (!container || !legendContainer) return;

  const recipes = APP.savedRecipes || [];
  if (recipes.length === 0) {
    legendContainer.innerHTML = `<p style="text-align:center; color:var(--text-muted);">${t('bcg.no_data') || 'Aucune recette pour l\'analyse.'}</p>`;
    return;
  }

  // Calculate metrics for each recipe
  const metrics = recipes.map(r => {
    const costs = r.costs || calcFullCost(r.margin || 70, r);
    const margin = costs.marginPct || 0;
    // Popularity simulated by recipe age & category diversity
    const daysOld = (Date.now() - new Date(r.savedAt || Date.now()).getTime()) / (1000 * 60 * 60 * 24);
    const popularity = Math.min(100, 30 + daysOld * 2 + Math.random() * 40);
    return { name: r.name, margin, popularity, costs };
  });

  // Average values for quadrant dividers
  const avgMargin = metrics.reduce((s, m) => s + m.margin, 0) / metrics.length;
  const avgPop = metrics.reduce((s, m) => s + m.popularity, 0) / metrics.length;

  // Classify into BCG quadrants
  metrics.forEach(m => {
    if (m.margin >= avgMargin && m.popularity >= avgPop) m.quadrant = 'star';
    else if (m.margin >= avgMargin && m.popularity < avgPop) m.quadrant = 'cash_cow';
    else if (m.margin < avgMargin && m.popularity >= avgPop) m.quadrant = 'question';
    else m.quadrant = 'dead_weight';
  });

  const colors = {
    star: '#10b981',
    cash_cow: '#3b82f6',
    question: '#f59e0b',
    dead_weight: '#ef4444'
  };

  const labels = {
    star: t('bcg.star') || 'Ã¢Â­Â Stars',
    cash_cow: t('bcg.cash_cow') || 'Ã°Å¸Ââ€ž Vaches ÃƒÂ  Lait',
    question: t('bcg.question') || 'Ã¢Ââ€œ Dilemmes',
    dead_weight: t('bcg.dead_weight') || 'Ã°Å¸â€™â‚¬ Poids Morts'
  };

  // Destroy previous chart
  if (bcgChartInstance) bcgChartInstance.destroy();

  // Create scatter chart
  const ctx = container.getContext('2d');
  bcgChartInstance = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: Object.keys(colors).map(quad => ({
        label: labels[quad],
        data: metrics.filter(m => m.quadrant === quad).map(m => ({ x: m.popularity, y: m.margin, name: m.name })),
        backgroundColor: colors[quad] + 'CC',
        borderColor: colors[quad],
        borderWidth: 2,
        pointRadius: 10,
        pointHoverRadius: 14
      }))
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top', labels: { font: { family: "'Inter', sans-serif", weight: '600' } } },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const pt = ctx.raw;
              return `${pt.name}: Marge ${pt.y.toFixed(1)}% | Pop. ${pt.x.toFixed(0)}`;
            }
          }
        }
      },
      scales: {
        x: {
          title: { display: true, text: t('bcg.axis.popularity') || 'PopularitÃƒÂ© Ã¢â€ â€™', font: { weight: '700' } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          title: { display: true, text: t('bcg.axis.margin') || 'RentabilitÃƒÂ© (%) Ã¢â€ â€™', font: { weight: '700' } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });

  // Legend with recommendations
  legendContainer.innerHTML = metrics.map(m => {
    const icon = m.quadrant === 'star' ? 'Ã¢Â­Â' : m.quadrant === 'cash_cow' ? 'Ã°Å¸Ââ€ž' : m.quadrant === 'question' ? 'Ã¢Ââ€œ' : 'Ã°Å¸â€™â‚¬';
    let action = '';
    if (m.quadrant === 'star') action = t('bcg.action.star') || 'Maintenir et promouvoir';
    else if (m.quadrant === 'cash_cow') action = t('bcg.action.cash_cow') || 'Optimiser les coÃƒÂ»ts';
    else if (m.quadrant === 'question') action = t('bcg.action.question') || 'Augmenter le prix ou rÃƒÂ©duire les coÃƒÂ»ts';
    else action = t('bcg.action.dead_weight') || 'Retirer ou transformer la recette';

    return `
      <div class="bcg-item" style="border-left: 3px solid ${colors[m.quadrant]};">
        <div class="bcg-item-header">
          <span>${icon} ${escapeHtml(m.name)}</span>
          <span class="bcg-item-margin" style="color:${colors[m.quadrant]};">${m.margin.toFixed(1)}%</span>
        </div>
        <div class="bcg-item-action">Ã°Å¸â€™Â¡ ${action}</div>
      </div>`;
  }).join('');
}


// ============================================================================
// 5. SIMULATION D'INFLATION / SCÃƒâ€°NARIO CRISE
// ============================================================================

function renderInflationSimulation() {
  const container = document.getElementById('inflationResults');
  const slider = document.getElementById('inflationSlider');
  const valueDisplay = document.getElementById('inflationValue');
  if (!container || !slider) return;

  const pct = parseFloat(slider.value) || 0;
  if (valueDisplay) valueDisplay.textContent = pct + '%';

  const recipes = APP.savedRecipes || [];
  if (recipes.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-muted);">${t('inflation.no_data') || 'Aucune recette ÃƒÂ  simuler.'}</p>`;
    return;
  }

  const results = recipes.map(r => {
    const originalCosts = r.costs || calcFullCost(r.margin || 70, r);
    const inflationFactor = 1 + (pct / 100);

    // Simulate inflated material cost
    const originalMaterial = r.ingredients.reduce((sum, ing) => sum + calcIngredientCost(ing), 0);
    const inflatedMaterial = originalMaterial * inflationFactor;
    const diff = inflatedMaterial - originalMaterial;
    const newCostPerPortion = (inflatedMaterial + (originalCosts.additionalCosts || 0)) / (r.portions || 10);

    const originalMarginPct = originalCosts.marginPct || 0;
    const newSellingPrice = originalCosts.sellingPrice || 0;
    const newMarginPerPortion = newSellingPrice - newCostPerPortion;
    const newMarginPct = newSellingPrice > 0 ? (newMarginPerPortion / newSellingPrice) * 100 : 0;
    const marginDrop = originalMarginPct - newMarginPct;

    return {
      name: r.name,
      originalMargin: originalMarginPct,
      newMargin: newMarginPct,
      marginDrop,
      costIncrease: diff,
      isDeficit: newMarginPct < 50,
      isCritical: newMarginPct < 30
    };
  });

  // Sort by impact
  results.sort((a, b) => b.marginDrop - a.marginDrop);

  const criticalCount = results.filter(r => r.isCritical).length;
  const deficitCount = results.filter(r => r.isDeficit).length;

  container.innerHTML = `
    <div class="inflation-summary">
      <div class="inflation-kpi ${criticalCount > 0 ? 'critical' : 'ok'}">
        <span class="inflation-kpi-val">${criticalCount}</span>
        <span class="inflation-kpi-label">${t('inflation.critical') || 'Recettes en danger'}</span>
      </div>
      <div class="inflation-kpi ${deficitCount > 0 ? 'warning' : 'ok'}">
        <span class="inflation-kpi-val">${deficitCount}</span>
        <span class="inflation-kpi-label">${t('inflation.deficit') || 'Marge < 50%'}</span>
      </div>
      <div class="inflation-kpi ok">
        <span class="inflation-kpi-val">${results.length - deficitCount}</span>
        <span class="inflation-kpi-label">${t('inflation.safe') || 'Recettes saines'}</span>
      </div>
    </div>
    <div class="inflation-table-wrap">
      <table class="inflation-table">
        <thead>
          <tr>
            <th>${t('inflation.col.recipe') || 'Recette'}</th>
            <th>${t('inflation.col.original') || 'Marge actuelle'}</th>
            <th>${t('inflation.col.new') || 'Nouvelle marge'}</th>
            <th>${t('inflation.col.impact') || 'Impact'}</th>
            <th>${t('inflation.col.status') || 'Statut'}</th>
          </tr>
        </thead>
        <tbody>
          ${results.map(r => `
            <tr class="${r.isCritical ? 'row-critical' : r.isDeficit ? 'row-warning' : ''}">
              <td style="font-weight:700;">${escapeHtml(r.name)}</td>
              <td>${r.originalMargin.toFixed(1)}%</td>
              <td style="color:${r.isCritical ? '#ef4444' : r.isDeficit ? '#f59e0b' : '#10b981'}; font-weight:800;">${r.newMargin.toFixed(1)}%</td>
              <td style="color:#ef4444;">-${r.marginDrop.toFixed(1)}%</td>
              <td>
                ${r.isCritical ? '<span class="badge-crisis">Ã°Å¸Å¡Â¨ ' + (t('inflation.status.critical') || 'CRITIQUE') + '</span>'
                  : r.isDeficit ? '<span class="badge-warn">Ã¢Å¡Â Ã¯Â¸Â ' + (t('inflation.status.warning') || 'ALERTE') + '</span>'
                  : '<span class="badge-ok">Ã¢Å“â€¦ ' + (t('inflation.status.ok') || 'OK') + '</span>'}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>`;
}


// ============================================================================
// 6. SYNCHRONISATION CLOUD (Supabase-Ready)
// ============================================================================

const SUPABASE_CONFIG = {
  url: '',  // User fills this in Settings
  key: ''   // User fills this in Settings
};

function openCloudSync() {
  const modal = document.getElementById('cloudSyncModal');
  if (modal) modal.style.display = 'flex';
  updateCloudStatus();
}

function closeCloudSync() {
  const modal = document.getElementById('cloudSyncModal');
  if (modal) modal.style.display = 'none';
}

function updateCloudStatus() {
  const statusEl = document.getElementById('cloudStatus');
  const urlInput = document.getElementById('supabaseUrl');
  const keyInput = document.getElementById('supabaseKey');

  // Load saved config
  const saved = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  if (urlInput && saved.url) urlInput.value = saved.url;
  if (keyInput && saved.key) keyInput.value = saved.key;

  if (statusEl) {
    if (saved.url && saved.key) {
      statusEl.innerHTML = `<span class="cloud-status-dot connected"></span> ${t('cloud.connected') || 'ConnectÃƒÂ© ÃƒÂ  Supabase'}`;
    } else {
      statusEl.innerHTML = `<span class="cloud-status-dot disconnected"></span> ${t('cloud.disconnected') || 'Non configurÃƒÂ©'}`;
    }
  }
}

async function saveCloudConfig() {
  const url = document.getElementById('supabaseUrl')?.value?.trim();
  const key = document.getElementById('supabaseKey')?.value?.trim();

  if (!url || !key) {
    showToast(t('cloud.error.config') || 'Veuillez remplir les deux champs', 'error');
    return;
  }

  localStorage.setItem('gourmet_cloud_config', JSON.stringify({ url, key }));
  SUPABASE_CONFIG.url = url;
  SUPABASE_CONFIG.key = key;
  updateCloudStatus();
  showToast(t('cloud.saved') || 'Configuration cloud enregistrÃƒÂ©e !', 'success');
}

async function syncToCloud() {
  const config = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  if (!config.url || !config.key) {
    showToast(t('cloud.error.not_configured') || 'Configurez Supabase d\'abord', 'error');
    return;
  }

  const syncBtn = document.getElementById('btnCloudSync');
  if (syncBtn) {
    syncBtn.disabled = true;
    syncBtn.innerHTML = '<span class="spinner-ocr"></span> ' + (t('cloud.syncing') || 'Synchronisation...');
  }

  try {
    const data = {
      user: getViewOwner(),
      recipes: JSON.stringify(APP.savedRecipes),
      ingredientDb: JSON.stringify(APP.ingredientDb),
      inventory: JSON.stringify(APP.inventory),
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

    if (response.ok) {
      localStorage.setItem('gourmet_last_sync', new Date().toISOString());
      showToast(t('cloud.sync_success') || 'DonnÃƒÂ©es synchronisÃƒÂ©es avec le cloud !', 'success');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    console.error('Cloud sync error:', err);
    showToast(t('cloud.sync_error') || 'Erreur de synchronisation: ' + err.message, 'error');
  }

  if (syncBtn) {
    syncBtn.disabled = false;
    syncBtn.innerHTML = 'Ã¢ËœÂÃ¯Â¸Â ' + (t('cloud.btn.sync') || 'Synchroniser maintenant');
  }
}

async function syncFromCloud() {
  const config = JSON.parse(localStorage.getItem('gourmet_cloud_config') || '{}');
  if (!config.url || !config.key) return;

  try {
    const user = getViewOwner();
    const response = await fetch(`${config.url}/rest/v1/gourmet_sync?user=eq.${encodeURIComponent(user)}&order=timestamp.desc&limit=1`, {
      headers: {
        'apikey': config.key,
        'Authorization': `Bearer ${config.key}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (data.length > 0) {
        const record = data[0];
        if (record.recipes) {
          APP.savedRecipes = JSON.parse(record.recipes);
          saveSavedRecipes();
        }
        if (record.ingredientDb) {
          APP.ingredientDb = JSON.parse(record.ingredientDb);
          saveIngredientDb();
        }
        showToast(t('cloud.restored') || 'DonnÃƒÂ©es restaurÃƒÂ©es depuis le cloud !', 'success');
      }
    }
  } catch (err) {
    console.error('Cloud restore error:', err);
    showToast(t('cloud.restore_error') || 'Erreur de restauration', 'error');
  }
}


// ============================================================================
// 7. QR CODE "FICHE CLIENT"
// ============================================================================

function generateClientQR(recipeIdx) {
  const recipe = APP.savedRecipes[recipeIdx];
  if (!recipe) return;

  const modal = document.getElementById('clientQRModal');
  if (!modal) return;
  modal.style.display = 'flex';

  // Collect allergens
  const allergenSet = new Set();
  recipe.ingredients.forEach(ing => {
    const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
    if (dbItem && dbItem.allergens) {
      dbItem.allergens.forEach(a => allergenSet.add(a));
    }
  });

  const costs = recipe.costs || calcFullCost(recipe.margin || 70, recipe);

  // Sorted ingredients
  const sortedIngs = [...recipe.ingredients].sort((a, b) => convertToGrams(b) - convertToGrams(a));
  const ingredientList = sortedIngs.map(ing => ing.name).join(', ');

  // Generate client-facing content
  const clientData = {
    name: recipe.name,
    description: recipe.description || '',
    category: recipe.category || '',
    allergens: Array.from(allergenSet),
    ingredients: ingredientList,
    price: costs.sellingPrice?.toFixed(2) || 'Ã¢â‚¬â€'
  };

  // Render card
  document.getElementById('clientQRRecipeName').textContent = recipe.name;
  document.getElementById('clientQRPrice').textContent = costs.sellingPrice?.toFixed(2) + ' Ã¢â€šÂ¬';
  document.getElementById('clientQRDescription').textContent = recipe.description || '';
  document.getElementById('clientQRIngredients').innerHTML = ingredientList;
  document.getElementById('clientQRAllergens').innerHTML = clientData.allergens.length > 0
    ? clientData.allergens.map(a => `<strong>${a}</strong>`).join(', ')
    : (t('inco.no_allergens') || 'Aucun allergÃƒÂ¨ne dÃƒÂ©clarÃƒÂ©');

  // Generate QR Code
  const qrBox = document.getElementById('clientQRCode');
  qrBox.innerHTML = '';
  const qrData = JSON.stringify({
    app: 'GourmetRevient',
    recipe: clientData.name,
    allergens: clientData.allergens,
    price: clientData.price
  });

  if (typeof QRCode !== 'undefined') {
    new QRCode(qrBox, {
      text: qrData,
      width: 120,
      height: 120,
      colorDark: '#1e293b',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M
    });
  }
}

function closeClientQR() {
  const modal = document.getElementById('clientQRModal');
  if (modal) modal.style.display = 'none';
}

function exportClientQRPdf() {
  const el = document.getElementById('clientQRContent');
  if (!el || typeof html2pdf === 'undefined') {
    showToast(t('toast.pdf.error') || 'html2pdf non chargÃƒÂ©', 'error');
    return;
  }
  html2pdf().set({
    margin: 5,
    filename: 'fiche-client-qr.pdf',
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a6', orientation: 'portrait' }
  }).from(el).save();
}


// ============================================================================
// INIT Ã¢â‚¬â€ Register new nav items and modules
// ============================================================================

// Initialize all pro features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  // Initialize OCR worker in background
  setTimeout(initOCR, 3000);

  // Bind inflation slider
  const inflSlider = document.getElementById('inflationSlider');
  if (inflSlider) {
    inflSlider.addEventListener('input', renderInflationSimulation);
  }
});

// ============================================================================
// 8. SIMULATEUR ORDONNANCEMENT CAP 2026
// ============================================================================

let examTimerInterval = null;
let examSecondsRemaining = 0;
let isExamRunning = false;
let currentOrdonnancement = [];

const CAP_DATABASE = {
  EP1_S1: {
    totalDuration: 5.5 * 3600,
    tasks: [
      { time: 0, duration: 30, title: "Ã‰preuve Ã‰crite (EP1)", desc: "Ordonnancement, technologie et calculs de pesÃ©es." },
      { time: 30, duration: 25, title: "PesÃ©es & Mise en place", desc: "Effectuer toutes les pesÃ©es (PFL, PÃ¢te BrisÃ©e, SablÃ©s, Compote)." },
      { time: 55, duration: 15, title: "DÃ©trempe PFL", desc: "PÃ©trissage court, boulage, mise au frais (0 Ã  4Â°C)." },
      { time: 70, duration: 15, title: "PÃ¢te BrisÃ©e / FonÃ§age Pomme", desc: "RÃ©alisation de la pÃ¢te et fonÃ§age." },
      { time: 85, duration: 20, title: "PÃ¢te Ã  SablÃ©s", desc: "CrÃ©mage, sablage, mise au frais." },
      { time: 105, duration: 15, title: "PFL : Premier Tour", desc: "Tourage (1 tour simple + 1 tour double ou 2 simples)." },
      { time: 120, duration: 20, title: "PrÃ©paration compote & fruits", desc: "Ã‰pluchage, tranchage des pommes pour la tarte." },
      { time: 140, duration: 15, title: "PFL : DeuxiÃ¨me Tour", desc: "Finition du tourage, repos au frais." },
      { time: 155, duration: 30, title: "FaÃ§onnage SablÃ©s", desc: "DÃ©taillage et mise sur plaque / cuisson." },
      { time: 185, duration: 30, title: "FaÃ§onnage Croissants", desc: "Abaisser, dÃ©tailler, rouler, mise en pousse." },
      { time: 215, duration: 30, title: "Garnissage & Cuisson Tarte", desc: "Compote, pommes rangÃ©es, cuisson." },
      { time: 245, duration: 25, title: "Cuisson Croissants", desc: "Dorer, cuisson Ã  180Â°C." },
      { time: 270, duration: 45, title: "Lustrage & Finition", desc: "Nappage tarte, prÃ©sentation." },
      { time: 315, duration: 15, title: "Nettoyage final", desc: "Rendu du poste propre." }
    ]
  },
  EP1_S2: {
    totalDuration: 5.5 * 3600,
    tasks: [
      { time: 0, duration: 30, title: "Accueil & Ã‰crit", desc: "Ordonnancement pour Pains Choc / Bourdaloue / Madeleines." },
      { time: 30, duration: 25, title: "PesÃ©es", desc: "Peser ingrÃ©dients pour PFL, PÃ¢te SucrÃ©e, Mousseline, Madeleines." },
      { time: 55, duration: 20, title: "DÃ©trempe PFL & SucrÃ©e", desc: "RÃ©alisation des deux pÃ¢tes de base." },
      { time: 75, duration: 20, title: "Appareil Ã  Madeleines", desc: "RÃ©aliser l'appareil (doit reposer au frais)." },
      { time: 95, duration: 15, title: "PFL : Tourage 1", desc: "Premier tourage du pÃ¢ton." },
      { time: 110, duration: 20, title: "FonÃ§age Tarte Bourdaloue", desc: "Abaisser, foncer, prÃ©parer la crÃ¨me d'amande." },
      { time: 130, duration: 15, title: "PFL : Tourage 2", desc: "Dernier tourage, repos." },
      { time: 145, duration: 40, title: "Cuisson Madeleines", desc: "Pochage et cuisson Ã  210Â°C puis 180Â°C." },
      { time: 185, duration: 30, title: "FaÃ§onnage Pains au Chocolat", desc: "DÃ©taillage, insertion bÃ¢tons, rouler, pousse." },
      { time: 215, duration: 40, title: "Cuisson Bourdaloue", desc: "Poires, amandes effilÃ©es, cuisson." },
      { time: 255, duration: 25, title: "Cuisson PFL", desc: "Dorer et cuire les pains au chocolat." },
      { time: 280, duration: 35, title: "Finition & PrÃ©sentation", desc: "Nappage, dÃ©cors, nettoyage." }
    ]
  },
  EP2_S1: {
    totalDuration: 5.5 * 3600,
    tasks: [
      { time: 0, duration: 45, title: "Ã‰preuve Ã‰crite (EP2)", desc: "Gestion, hygiÃ¨ne et ordonnancement." },
      { time: 45, duration: 20, title: "PesÃ©es GÃ©nÃ©rales", desc: "Royal Choco & Ã‰clairs." },
      { time: 65, duration: 30, title: "Fabrication Biscuit SuccÃ¨s", desc: "Monter les blancs, mÃ©langer, pocher, cuire." },
      { time: 95, duration: 15, title: "Panade PÃ¢te Ã  Choux", desc: "Cuisson de la panade sur feu." },
      { time: 110, duration: 15, title: "Appareil PÃ¢te Ã  Choux", desc: "Incorporation Å“ufs, pochage Ã©clairs." },
      { time: 125, duration: 40, title: "Cuisson Ã‰clairs", desc: "Cuisson sans ouvrir la porte." },
      { time: 165, duration: 30, title: "RÃ©alisation Croustillant & Montage Royal", desc: "Ã‰taler croustillant sur biscuit, mousse choco, montage." },
      { time: 195, duration: 30, title: "Blocage froid Royal", desc: "Mise au congÃ©lateur." },
      { time: 225, duration: 30, title: "CrÃ¨me pÃ¢tissiÃ¨re Choco", desc: "RÃ©aliser, refroidir, garnir les Ã©clairs." },
      { time: 255, duration: 30, title: "GlaÃ§age Ã‰clairs", desc: "Fondant chocolat Ã  37Â°C." },
      { time: 285, duration: 30, title: "DÃ©coration Royal", desc: "Poudrage, dÃ©cors chocolat, transfert." },
      { time: 315, duration: 15, title: "Nettoyage & Oral", desc: "Entretien final." }
    ]
  },
  EP2_S2: {
    totalDuration: 5.5 * 3600,
    tasks: [
      { time: 0, duration: 45, title: "Accueil & Ã‰crit", desc: "Fraisier & Religieuses." },
      { time: 45, duration: 20, title: "PesÃ©es", desc: "GÃ©noise, Mousseline, Choux, CrÃ¨me CafÃ©." },
      { time: 65, duration: 25, title: "GÃ©noise", desc: "Bain-marie, montage, cuisson." },
      { time: 90, duration: 30, title: "PÃ¢te Ã  Choux", desc: "PrÃ©paration et pochage gros/petits choux." },
      { time: 120, duration: 35, title: "Cuisson Choux", desc: "Surveiller la cuisson." },
      { time: 155, duration: 30, title: "CrÃ¨me Mousseline (Partie 1)", desc: "Faire la pÃ¢tissiÃ¨re de base, refroidir." },
      { time: 185, duration: 40, title: "Montage Fraisier", desc: "Chemiser fraises, biscuit imbibÃ©, crÃ¨me, blocage froide." },
      { time: 225, duration: 30, title: "Garnissage Religieuses", desc: "CrÃ¨me cafÃ© et montage tÃªte sur corps." },
      { time: 255, duration: 30, title: "GlaÃ§age & Collerette", desc: "Fondant cafÃ©, crÃ¨me beurre pour collerette." },
      { time: 285, duration: 30, title: "Finition Fraisier", desc: "PÃ¢te d'amande, dÃ©cors." },
      { time: 315, duration: 15, title: "Nettoyage", desc: "Fin de l'Ã©preuve." }
    ]
  }
};

function generateCapOrdonnancement(type) {
  const data = CAP_DATABASE[type];
  if (!data) return;

  currentOrdonnancement = data.tasks;
  examSecondsRemaining = data.totalDuration;

  document.getElementById("examOrdonnancementOutput").style.display = "block";
  document.getElementById("examSubjectBadge").textContent = type;
  updateExamTimerDisplay();

  const grid = document.getElementById("examTimelineGrid");
  grid.innerHTML = currentOrdonnancement.map((task, i) => `
    <div class="exam-task-row" id="examTask_${i}">
      <div class="exam-task-dot"></div>
      <div class="exam-task-time">T+${task.time}'</div>
      <div class="exam-task-card">
        <div class="exam-task-title">
          <span>${task.title}</span>
          <span class="exam-duration-badge">â±ï¸ ${task.duration} min</span>
        </div>
        <div class="exam-task-desc">${task.desc}</div>
      </div>
    </div>
  `).join("");

  // Sync translation for new elements if needed
  if (typeof i18n !== "undefined") i18n.translatePage();
}

function updateExamTimerDisplay() {
  const h = Math.floor(examSecondsRemaining / 3600);
  const m = Math.floor((examSecondsRemaining % 3600) / 60);
  const s = examSecondsRemaining % 60;
  
  const display = document.getElementById("examTimerDisplay");
  if (display) {
    display.textContent = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  }

  // Update active task based on elapsed time
  const elapsedMinutes = (CAP_DATABASE[document.getElementById("examSubjectBadge").textContent].totalDuration - examSecondsRemaining) / 60;
  
  currentOrdonnancement.forEach((task, i) => {
    const el = document.getElementById(`examTask_${i}`);
    if (!el) return;
    
    if (elapsedMinutes >= task.time && elapsedMinutes < (task.time + task.duration)) {
      el.classList.add("active");
      el.classList.remove("done");
    } else if (elapsedMinutes >= (task.time + task.duration)) {
      el.classList.add("done");
      el.classList.remove("active");
    } else {
      el.classList.remove("active", "done");
    }
  });
}

function toggleExamTimer() {
  const btn = document.getElementById("btnStartExam");
  if (isExamRunning) {
    clearInterval(examTimerInterval);
    isExamRunning = false;
    btn.textContent = t("exam.btn.start") || "DÃ©marrer";
    btn.classList.replace("btn-danger", "btn-primary");
  } else {
    isExamRunning = true;
    btn.textContent = "â¸ï¸ Pause";
    btn.classList.replace("btn-primary", "btn-danger");
    
    examTimerInterval = setInterval(() => {
      if (examSecondsRemaining > 0) {
        examSecondsRemaining--;
        updateExamTimerDisplay();
      } else {
        clearInterval(examTimerInterval);
        showToast("Ã‰preuve terminÃ©e !", "info");
      }
    }, 1000);
  }
}


// ============================================================================
// 9. CATALOGUE CAP 2026 (Seeding)
// ============================================================================

function seedCapToolkit() {
  const capRecipes = [
    {
      name: "CAP : Croissants (PFL)",
      category: "EP1 - Tourtage",
      portions: 12,
      prepTime: 180,
      cookTime: 18,
      ingredients: [
        { name: "Farine T45", quantity: 500, unit: "g", pricePerUnit: 0.0013 },
        { name: "Beurre de tourage (AOP)", quantity: 250, unit: "g", pricePerUnit: 0.0085 },
        { name: "Lait entier", quantity: 150, unit: "ml", pricePerUnit: 0.0009 },
        { name: "Sucre", quantity: 60, unit: "g", pricePerUnit: 0.001 },
        { name: "Levure fraÃ®che", quantity: 20, unit: "g", pricePerUnit: 0.012 },
        { name: "Sel", quantity: 10, unit: "g", pricePerUnit: 0.001 }
      ],
      steps: ["DÃ©trempe", "Pointage", "Tourage (3 tours simples)", "DÃ©taillage (triangles 120g)", "Pousse (2h)", "Cuisson 180Â°C"],
      isCap: true
    },
    {
      name: "CAP : Brioche Ã  TÃªte",
      category: "EP1 - Tourtage",
      portions: 10,
      prepTime: 120,
      cookTime: 20,
      ingredients: [
        { name: "Farine T45", quantity: 500, unit: "g", pricePerUnit: 0.0013 },
        { name: "Å’ufs entiers", quantity: 300, unit: "g", pricePerUnit: 0.004 },
        { name: "Beurre (pommade)", quantity: 250, unit: "g", pricePerUnit: 0.008 },
        { name: "Sucre", quantity: 60, unit: "g", pricePerUnit: 0.001 },
        { name: "Levure fraÃ®che", quantity: 20, unit: "g", pricePerUnit: 0.012 },
        { name: "Sel", quantity: 10, unit: "g", pricePerUnit: 0.001 }
      ],
      steps: ["PÃ©trissage", "Premier pointage (1h ambient)", "DeuxiÃ¨me pointage (froid)", "Division & Boulage", "Pousse (1h30 @ 28Â°C)", "Cuisson"],
      isCap: true
    },
    {
      name: "CAP : Tarte aux Pommes (PÃ¢te BrisÃ©e)",
      category: "EP1 - Tartes",
      portions: 8,
      prepTime: 60,
      cookTime: 35,
      ingredients: [
        { name: "Farine T55", quantity: 250, unit: "g", pricePerUnit: 0.001 },
        { name: "Beurre doux", quantity: 125, unit: "g", pricePerUnit: 0.008 },
        { name: "Eau", quantity: 50, unit: "ml", pricePerUnit: 0.0001 },
        { name: "Sel", quantity: 5, unit: "g", pricePerUnit: 0.001 },
        { name: "Pommes Golden", quantity: 1000, unit: "g", pricePerUnit: 0.0025 },
        { name: "Compote de pommes", quantity: 200, unit: "g", pricePerUnit: 0.004 }
      ],
      steps: ["Sablage farine/beurre", "Frasage avec eau/sel", "Abaissage & FonÃ§age", "Garnissage compote + pommes rangÃ©es", "Cuisson 180Â°C", "Nappage aprÃ¨s cuisson"],
      isCap: true
    },
    {
      name: "CAP : Ã‰clairs Chocolat (PÃ¢te Ã  Choux)",
      category: "EP2 - Petits GÃ¢teaux",
      portions: 10,
      prepTime: 90,
      cookTime: 30,
      ingredients: [
        { name: "Eau/Lait", quantity: 250, unit: "ml", pricePerUnit: 0.0008 },
        { name: "Beurre", quantity: 100, unit: "g", pricePerUnit: 0.008 },
        { name: "Farine", quantity: 150, unit: "g", pricePerUnit: 0.001 },
        { name: "Å’ufs", quantity: 4, unit: "pcs", pricePerUnit: 0.20 },
        { name: "CrÃ¨me pÃ¢tissiÃ¨re chocolat", quantity: 500, unit: "g", pricePerUnit: 0.005 },
        { name: "Fondant chocolat", quantity: 200, unit: "g", pricePerUnit: 0.004 }
      ],
      steps: ["Mise en Ã©bullition eau/lait/beurre/sel", "DessÃ¨chement de la panade", "Incorporation des Å“ufs", "Pochage (12cm)", "Cuisson", "Garnissage & GlaÃ§age"],
      isCap: true
    },
    {
      name: "CAP : Royal Chocolat (Entremets)",
      category: "EP2 - Entremets",
      portions: 8,
      prepTime: 120,
      cookTime: 15,
      ingredients: [
        { name: "Biscuit SuccÃ¨s/Dacquoise amande", quantity: 200, unit: "g", pricePerUnit: 0.008 },
        { name: "Croustillant pralinÃ©", quantity: 150, unit: "g", pricePerUnit: 0.012 },
        { name: "Mousse au chocolat noir", quantity: 450, unit: "g", pricePerUnit: 0.009 }
      ],
      steps: ["Biscuit Dacquoise (cuisson)", "Ã‰taler croustillant", "RÃ©aliser mousse chocolat (pÃ¢te Ã  bombe ou anglaise)", "Montage en cercle", "Blocage froid", "Poudrage cacao"],
      isCap: true
    },
    {
      name: "CAP : Fraisier (CrÃ¨me Mousseline)",
      category: "EP2 - Entremets",
      portions: 8,
      prepTime: 100,
      cookTime: 20,
      ingredients: [
        { name: "GÃ©noise", quantity: 300, unit: "g", pricePerUnit: 0.005 },
        { name: "CrÃ¨me mousseline vanille", quantity: 600, unit: "g", pricePerUnit: 0.007 },
        { name: "Fraises fraÃ®ches", quantity: 500, unit: "g", pricePerUnit: 0.009 },
        { name: "PÃ¢te d'amandes", quantity: 100, unit: "g", pricePerUnit: 0.015 }
      ],
      steps: ["RÃ©alisation gÃ©noise (bain-marie)", "CrÃ¨me pÃ¢tissiÃ¨re -> Incorporation beurre (mousseline)", "Montage chemisÃ© fraises", "Imbibage sirop kirsch", "Finition pÃ¢te d'amandes"],
      isCap: true
    }
  ];

  // Add more common CAP subjects...
  const moreCap = [
    { name: "CAP : Tarte au Citron MeringuÃ©e", category: "EP1 - Tartes", portions: 8, prepTime: 90, cookTime: 25 },
    { name: "CAP : Flan PÃ¢tissier", category: "EP1 - GoÃ»ters", portions: 8, prepTime: 40, cookTime: 50 },
    { name: "CAP : Paris-Brest", category: "EP2 - Petits GÃ¢teaux", portions: 8, prepTime: 120, cookTime: 35 },
    { name: "CAP : Mille-Feuille", category: "EP2 - Entremets", portions: 8, prepTime: 180, cookTime: 30 },
    { name: "CAP : ForÃªt Noire", category: "EP2 - Entremets", portions: 8, prepTime: 120, cookTime: 20 }
  ];

  // Merge (simulate real recipes for the missing ones)
  moreCap.forEach(m => {
     if (!capRecipes.find(r => r.name === m.name)) {
        capRecipes.push({ ...m, ingredients: [{name: "Base PÃ¢tissiÃ¨re", quantity:1000, unit:"g", pricePerUnit:0.005}], steps: ["RÃ©alisation pas Ã  pas"] });
     }
  });

  // Inject into APP.savedRecipes
  if (!APP.savedRecipes) APP.savedRecipes = [];
  
  let added = 0;
  capRecipes.forEach(r => {
    if (!APP.savedRecipes.find(existing => existing.name === r.name)) {
      APP.savedRecipes.push({
        ...r,
        id: "cap_" + Math.random().toString(36).substr(2, 9),
        savedAt: new Date().toISOString()
      });
      added++;
    }
  });

  saveSavedRecipes();
  if (typeof renderRecipeLibrary === "function") renderRecipeLibrary();
  showToast(`${added} recettes CAP ajoutÃ©es Ã  votre bibliothÃ¨que !`, "success");
}


// Extended CAP Subjects
CAP_DATABASE.EP1_S3 = {
  totalDuration: 5.5 * 3600,
  tasks: [
    { time: 0, duration: 40, title: "Écrit & Ordonnancement", desc: "Brioche / Tarte Citron / Tuiles Amandes." },
    { time: 40, duration: 20, title: "Pesées", desc: "Tous les éléments." },
    { time: 60, duration: 25, title: "Pétrissage Brioche", desc: "Vitesse 1 puis 2 jusqu'au décollement." },
    { time: 85, duration: 20, title: "Pâte Sucrée (Tarte Citron)", desc: "Crémage, repos frais." },
    { time: 105, duration: 20, title: "Appareil à Tuiles", desc: "Mélange blancs, sucre, amandes effilées, beurre fondu." },
    { time: 125, duration: 20, title: "Crémeux Citron", desc: "Cuisson à 85°C, refroidissement." },
    { time: 145, duration: 30, title: "Fonçage & Cuisson à blanc", desc: "Tarte citron." },
    { time: 175, duration: 30, title: "Façonnage Brioche", desc: "Nanterre ou tressée, mise en étuve." },
    { time: 205, duration: 30, title: "Cuisson Tuiles", desc: "Pochage fin et cuisson rapide." },
    { time: 235, duration: 20, title: "Meringue Italienne", desc: "Sirop 118°C sur blancs." },
    { time: 255, duration: 25, title: "Cuisson Brioche", desc: "Dorure et four." },
    { time: 280, duration: 40, title: "Finition Tarte Citron", desc: "Garnissage crémeux, pochage meringue, chalumeau." },
    { time: 320, duration: 10, title: "Nettoyage final", desc: "Poste propre." }
  ]
};

CAP_DATABASE.EP2_S3 = {
  totalDuration: 5.5 * 3600,
  tasks: [
    { time: 0, duration: 45, title: "Épreuve Écrite", desc: "Opéra & Paris-Brest." },
    { time: 45, duration: 20, title: "Pesées", desc: "Joconde, Ganache, Crème Beurre, Mousseline Praliné." },
    { time: 65, duration: 30, title: "Biscuit Joconde", desc: "Plaquage et cuisson 200°C." },
    { time: 95, duration: 20, title: "Pâte à Choux (Paris-Brest)", desc: "Pochage en couronne." },
    { time: 115, duration: 40, title: "Cuisson Choux", desc: "Sur plaque." },
    { time: 155, duration: 30, title: "Sirop Café & Ganache Choco", desc: "Éléments de l'Opéra." },
    { time: 185, duration: 30, title: "Crème au Beurre Café", desc: "Réalisation pâte à bombe + beurre." },
    { time: 215, duration: 40, title: "Montage Opéra", desc: "Succession biscuits imbibés et crèmes." },
    { time: 255, duration: 25, title: "Crème Mousseline Praliné", desc: "Garnir les couronnes Paris-Brest." },
    { time: 280, duration: 30, title: "Glaçage Opéra", desc: "Glaçage chocolat noir et écriture." },
    { time: 310, duration: 20, title: "Finition & Présentation", desc: "Coupe des bords, sucre glace." }
  ]
};

