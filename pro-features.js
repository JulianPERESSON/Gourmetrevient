/*
  =====================================================================
  PRO-FEATURES.JS â€” GourmetRevient v4.0 Advanced Modules
  - Scanner OCR Factures (Tesseract.js)
  - Ã‰tiquettes INCO RÃ©glementaires
  - Calculateur de Foisonnement
  - Matrice de Boston (BCG)
  - Simulation d'Inflation / ScÃ©nario Crise
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
  if (preview) preview.innerHTML = '<div class="ocr-upload-zone" id="ocrUploadZone"><span class="ocr-upload-icon">ðŸ“·</span><p>' + t('ocr.upload.hint') + '</p><input type="file" id="ocrFileInput" accept="image/*" capture="environment" style="display:none"></div>';
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
      status.innerHTML = 'âŒ ' + (t('ocr.error') || 'Erreur lors de l\'analyse. RÃ©essayez avec une image plus nette.');
    }
  }
}

function parseInvoiceText(text) {
  const lines = text.split('\n').filter(l => l.trim());
  const items = [];

  // Common patterns for French invoices:
  // Product name ... quantity ... unit price ... total
  const priceRegex = /(\d+[.,]\d{2})\s*â‚¬?/g;
  const qtyRegex = /(\d+[.,]?\d*)\s*(kg|g|L|ml|pce?s?|unit[Ã©e]s?)/gi;

  for (const line of lines) {
    const prices = [...line.matchAll(priceRegex)];
    const quantities = [...line.matchAll(qtyRegex)];

    if (prices.length > 0) {
      // Try to extract ingredient name (text before first number)
      const nameMatch = line.match(/^([A-Za-zÃ€-Ã¿\s\-']+)/);
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
        <span>ðŸ”</span>
        <p>${t('ocr.no_items') || 'Aucun article dÃ©tectÃ©. Texte brut extrait :'}</p>
        <pre class="ocr-raw-text">${escapeHtml(rawText)}</pre>
      </div>`;
    return;
  }

  results.innerHTML = `
    <div class="ocr-results-header">
      <h4>ðŸ“‹ ${t('ocr.found') || 'Articles dÃ©tectÃ©s'} (${items.length})</h4>
    </div>
    <div class="ocr-items-list">
      ${items.map((item, i) => `
        <div class="ocr-item ${item.matched ? 'matched' : ''}">
          <div class="ocr-item-info">
            <div class="ocr-item-name">${escapeHtml(item.name)}</div>
            ${item.matched ? `<span class="ocr-match-badge">âœ… ${item.dbName}</span>` : '<span class="ocr-no-match-badge">â“ Non reconnu</span>'}
            <div class="ocr-item-price">
              ${item.unitPrice.toFixed(2)} â‚¬${item.unit ? '/' + item.unit : ''}
              ${item.matched && item.oldPrice ? `<span class="ocr-old-price">(ancien: ${item.oldPrice.toFixed(2)} â‚¬)</span>` : ''}
            </div>
          </div>
          <div class="ocr-item-actions">
            ${item.matched ? `<button class="btn btn-sm btn-primary" onclick="applyOCRPrice(${i})" data-items='${JSON.stringify(item).replace(/'/g, "&#39;")}'>${t('ocr.btn.apply') || 'Mettre Ã  jour'}</button>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    <div class="ocr-actions-bar">
      <button class="btn btn-primary btn-full" onclick="applyAllOCRPrices()">${t('ocr.btn.apply_all') || 'âœ… Appliquer toutes les mises Ã  jour'}</button>
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
    showToast(`${item.dbName}: ${item.oldPrice?.toFixed(2)}â‚¬ â†’ ${item.unitPrice.toFixed(2)}â‚¬`, 'success');

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
  showToast(`${count} ${t('ocr.updated') || 'prix mis Ã  jour depuis la facture'}`, 'success');
  closeOCRScanner();
}


// ============================================================================
// 2. GÃ‰NÃ‰RATEUR D'Ã‰TIQUETTES INCO
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
  select.innerHTML = '<option value="">' + (t('inco.select') || 'â€” SÃ©lectionner une recette â€”') + '</option>' +
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
    : (t('inco.no_allergens') || 'Aucun allergÃ¨ne dÃ©clarÃ©');

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
        <div class="inco-label-title">${t('inco.ingredients_list') || 'IngrÃ©dients :'}</div>
        <div class="inco-label-text">${ingredientList}</div>
      </div>
      <div class="inco-label-section">
        <div class="inco-label-title">${t('inco.allergens') || 'AllergÃ¨nes :'}</div>
        <div class="inco-label-text inco-allergens">${allergenList}</div>
      </div>
      <div class="inco-label-footer">
        <span>${t('inco.net_weight') || 'Poids net'} : ~${netWeightPerPortion}g</span>
        <span>${t('inco.price') || 'PVC'} : ${price.toFixed(2)} â‚¬</span>
      </div>
      <div class="inco-label-legal">${t('inco.storage') || 'Conserver au frais entre 2Â°C et 6Â°C. Ã€ consommer dans les 48h.'}</div>
    </div>`;
}

function convertToGrams(ing) {
  const qty = parseFloat(ing.quantity) || 0;
  const unit = (ing.unit || 'g').toLowerCase();
  if (unit === 'kg') return qty * 1000;
  if (unit === 'l') return qty * 1000;
  if (unit === 'ml') return qty;
  if (unit === 'piÃ¨ce' || unit === 'pcs' || unit === 'pce') return qty * 50; // avg weight
  return qty; // g
}

function exportINCOPdf() {
  const el = document.getElementById('incoLabelContent');
  if (!el || typeof html2pdf === 'undefined') {
    showToast(t('toast.pdf.error') || 'html2pdf non chargÃ©', 'error');
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
    showToast(t('inco.exported') || 'Ã‰tiquette INCO exportÃ©e !', 'success');
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
  if (coeff < 50) { qualityLabel = t('fois.dense') || 'Dense â€” CrÃ¨me Ã©paisse, ganache'; qualityClass = 'fois-dense'; }
  else if (coeff < 100) { qualityLabel = t('fois.medium') || 'Moyen â€” Mousse chocolat, bavaroise'; qualityClass = 'fois-medium'; }
  else if (coeff < 200) { qualityLabel = t('fois.light') || 'AÃ©rÃ© â€” Mousse aux fruits, chantilly'; qualityClass = 'fois-light'; }
  else { qualityLabel = t('fois.ultra') || 'Ultra-aÃ©rÃ© â€” Chantilly trÃ¨s montÃ©e, espuma'; qualityClass = 'fois-ultra'; }

  result.innerHTML = `
    <div class="fois-results-grid">
      <div class="fois-kpi">
        <div class="fois-kpi-val">${coeff}%</div>
        <div class="fois-kpi-label">${t('fois.coefficient') || 'Coefficient de foisonnement'}</div>
      </div>
      <div class="fois-kpi">
        <div class="fois-kpi-val">Ã—${multiplier}</div>
        <div class="fois-kpi-label">${t('fois.multiplier') || 'Multiplicateur de volume'}</div>
      </div>
      <div class="fois-kpi">
        <div class="fois-kpi-val">+${gainVolume} ml</div>
        <div class="fois-kpi-label">${t('fois.gain') || 'Gain de volume'}</div>
      </div>
    </div>
    <div class="fois-quality ${qualityClass}">
      <span class="fois-quality-icon">ðŸ’¨</span>
      <span>${qualityLabel}</span>
    </div>
    <div class="fois-tip">
      ðŸ’¡ ${t('fois.tip') || 'Le foisonnement affecte le rendement final. Ajustez la quantitÃ© de votre appareil en consÃ©quence.'}
    </div>`;
}


// ============================================================================
// 4. MATRICE DE BOSTON (BCG) â€” ANALYSE DE MIX-PRODUIT
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
    star: t('bcg.star') || 'â­ Stars',
    cash_cow: t('bcg.cash_cow') || 'ðŸ„ Vaches Ã  Lait',
    question: t('bcg.question') || 'â“ Dilemmes',
    dead_weight: t('bcg.dead_weight') || 'ðŸ’€ Poids Morts'
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
          title: { display: true, text: t('bcg.axis.popularity') || 'PopularitÃ© â†’', font: { weight: '700' } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          title: { display: true, text: t('bcg.axis.margin') || 'RentabilitÃ© (%) â†’', font: { weight: '700' } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      }
    }
  });

  // Legend with recommendations
  legendContainer.innerHTML = metrics.map(m => {
    const icon = m.quadrant === 'star' ? 'â­' : m.quadrant === 'cash_cow' ? 'ðŸ„' : m.quadrant === 'question' ? 'â“' : 'ðŸ’€';
    let action = '';
    if (m.quadrant === 'star') action = t('bcg.action.star') || 'Maintenir et promouvoir';
    else if (m.quadrant === 'cash_cow') action = t('bcg.action.cash_cow') || 'Optimiser les coÃ»ts';
    else if (m.quadrant === 'question') action = t('bcg.action.question') || 'Augmenter le prix ou rÃ©duire les coÃ»ts';
    else action = t('bcg.action.dead_weight') || 'Retirer ou transformer la recette';

    return `
      <div class="bcg-item" style="border-left: 3px solid ${colors[m.quadrant]};">
        <div class="bcg-item-header">
          <span>${icon} ${escapeHtml(m.name)}</span>
          <span class="bcg-item-margin" style="color:${colors[m.quadrant]};">${m.margin.toFixed(1)}%</span>
        </div>
        <div class="bcg-item-action">ðŸ’¡ ${action}</div>
      </div>`;
  }).join('');
}


// ============================================================================
// 5. SIMULATION D'INFLATION / SCÃ‰NARIO CRISE
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
    container.innerHTML = `<p style="text-align:center; color:var(--text-muted);">${t('inflation.no_data') || 'Aucune recette Ã  simuler.'}</p>`;
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
                ${r.isCritical ? '<span class="badge-crisis">ðŸš¨ ' + (t('inflation.status.critical') || 'CRITIQUE') + '</span>'
                  : r.isDeficit ? '<span class="badge-warn">âš ï¸ ' + (t('inflation.status.warning') || 'ALERTE') + '</span>'
                  : '<span class="badge-ok">âœ… ' + (t('inflation.status.ok') || 'OK') + '</span>'}
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
      statusEl.innerHTML = `<span class="cloud-status-dot connected"></span> ${t('cloud.connected') || 'ConnectÃ© Ã  Supabase'}`;
    } else {
      statusEl.innerHTML = `<span class="cloud-status-dot disconnected"></span> ${t('cloud.disconnected') || 'Non configurÃ©'}`;
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
  showToast(t('cloud.saved') || 'Configuration cloud enregistrÃ©e !', 'success');
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
      showToast(t('cloud.sync_success') || 'DonnÃ©es synchronisÃ©es avec le cloud !', 'success');
    } else {
      throw new Error(`HTTP ${response.status}`);
    }
  } catch (err) {
    console.error('Cloud sync error:', err);
    showToast(t('cloud.sync_error') || 'Erreur de synchronisation: ' + err.message, 'error');
  }

  if (syncBtn) {
    syncBtn.disabled = false;
    syncBtn.innerHTML = 'â˜ï¸ ' + (t('cloud.btn.sync') || 'Synchroniser maintenant');
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
        showToast(t('cloud.restored') || 'DonnÃ©es restaurÃ©es depuis le cloud !', 'success');
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
    price: costs.sellingPrice?.toFixed(2) || 'â€”'
  };

  // Render card
  document.getElementById('clientQRRecipeName').textContent = recipe.name;
  document.getElementById('clientQRPrice').textContent = costs.sellingPrice?.toFixed(2) + ' â‚¬';
  document.getElementById('clientQRDescription').textContent = recipe.description || '';
  document.getElementById('clientQRIngredients').innerHTML = ingredientList;
  document.getElementById('clientQRAllergens').innerHTML = clientData.allergens.length > 0
    ? clientData.allergens.map(a => `<strong>${a}</strong>`).join(', ')
    : (t('inco.no_allergens') || 'Aucun allergÃ¨ne dÃ©clarÃ©');

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
    showToast(t('toast.pdf.error') || 'html2pdf non chargÃ©', 'error');
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
// INIT â€” Register new nav items and modules
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
      { time: 0, duration: 30, title: "Épreuve Écrite (EP1)", desc: "Ordonnancement, technologie et calculs de pesées." },
      { time: 30, duration: 25, title: "Pesées & Mise en place", desc: "Effectuer toutes les pesées (PFL, Pâte Brisée, Sablés, Compote)." },
      { time: 55, duration: 15, title: "Détrempe PFL", desc: "Pétrissage court, boulage, mise au frais (0 à 4°C)." },
      { time: 70, duration: 15, title: "Pâte Brisée / Fonçage Pomme", desc: "Réalisation de la pâte et fonçage." },
      { time: 85, duration: 20, title: "Pâte à Sablés", desc: "Crémage, sablage, mise au frais." },
      { time: 105, duration: 15, title: "PFL : Premier Tour", desc: "Tourage (1 tour simple + 1 tour double ou 2 simples)." },
      { time: 120, duration: 20, title: "Préparation compote & fruits", desc: "Épluchage, tranchage des pommes pour la tarte." },
      { time: 140, duration: 15, title: "PFL : Deuxième Tour", desc: "Finition du tourage, repos au frais." },
      { time: 155, duration: 30, title: "Façonnage Sablés", desc: "Détaillage et mise sur plaque / cuisson." },
      { time: 185, duration: 30, title: "Façonnage Croissants", desc: "Abaisser, détailler, rouler, mise en pousse." },
      { time: 215, duration: 30, title: "Garnissage & Cuisson Tarte", desc: "Compote, pommes rangées, cuisson." },
      { time: 245, duration: 25, title: "Cuisson Croissants", desc: "Dorer, cuisson à 180°C." },
      { time: 270, duration: 45, title: "Lustrage & Finition", desc: "Nappage tarte, présentation." },
      { time: 315, duration: 15, title: "Nettoyage final", desc: "Rendu du poste propre." }
    ]
  },
  EP1_S2: {
    totalDuration: 5.5 * 3600,
    tasks: [
      { time: 0, duration: 30, title: "Accueil & Écrit", desc: "Ordonnancement pour Pains Choc / Bourdaloue / Madeleines." },
      { time: 30, duration: 25, title: "Pesées", desc: "Peser ingrédients pour PFL, Pâte Sucrée, Mousseline, Madeleines." },
      { time: 55, duration: 20, title: "Détrempe PFL & Sucrée", desc: "Réalisation des deux pâtes de base." },
      { time: 75, duration: 20, title: "Appareil à Madeleines", desc: "Réaliser l'appareil (doit reposer au frais)." },
      { time: 95, duration: 15, title: "PFL : Tourage 1", desc: "Premier tourage du pâton." },
      { time: 110, duration: 20, title: "Fonçage Tarte Bourdaloue", desc: "Abaisser, foncer, préparer la crème d'amande." },
      { time: 130, duration: 15, title: "PFL : Tourage 2", desc: "Dernier tourage, repos." },
      { time: 145, duration: 40, title: "Cuisson Madeleines", desc: "Pochage et cuisson à 210°C puis 180°C." },
      { time: 185, duration: 30, title: "Façonnage Pains au Chocolat", desc: "Détaillage, insertion bâtons, rouler, pousse." },
      { time: 215, duration: 40, title: "Cuisson Bourdaloue", desc: "Poires, amandes effilées, cuisson." },
      { time: 255, duration: 25, title: "Cuisson PFL", desc: "Dorer et cuire les pains au chocolat." },
      { time: 280, duration: 35, title: "Finition & Présentation", desc: "Nappage, décors, nettoyage." }
    ]
  },
  EP2_S1: {
    totalDuration: 5.5 * 3600,
    tasks: [
      { time: 0, duration: 45, title: "Épreuve Écrite (EP2)", desc: "Gestion, hygiène et ordonnancement." },
      { time: 45, duration: 20, title: "Pesées Générales", desc: "Royal Choco & Éclairs." },
      { time: 65, duration: 30, title: "Fabrication Biscuit Succès", desc: "Monter les blancs, mélanger, pocher, cuire." },
      { time: 95, duration: 15, title: "Panade Pâte à Choux", desc: "Cuisson de la panade sur feu." },
      { time: 110, duration: 15, title: "Appareil Pâte à Choux", desc: "Incorporation œufs, pochage éclairs." },
      { time: 125, duration: 40, title: "Cuisson Éclairs", desc: "Cuisson sans ouvrir la porte." },
      { time: 165, duration: 30, title: "Réalisation Croustillant & Montage Royal", desc: "Étaler croustillant sur biscuit, mousse choco, montage." },
      { time: 195, duration: 30, title: "Blocage froid Royal", desc: "Mise au congélateur." },
      { time: 225, duration: 30, title: "Crème pâtissière Choco", desc: "Réaliser, refroidir, garnir les éclairs." },
      { time: 255, duration: 30, title: "Glaçage Éclairs", desc: "Fondant chocolat à 37°C." },
      { time: 285, duration: 30, title: "Décoration Royal", desc: "Poudrage, décors chocolat, transfert." },
      { time: 315, duration: 15, title: "Nettoyage & Oral", desc: "Entretien final." }
    ]
  },
  EP2_S2: {
    totalDuration: 5.5 * 3600,
    tasks: [
      { time: 0, duration: 45, title: "Accueil & Écrit", desc: "Fraisier & Religieuses." },
      { time: 45, duration: 20, title: "Pesées", desc: "Génoise, Mousseline, Choux, Crème Café." },
      { time: 65, duration: 25, title: "Génoise", desc: "Bain-marie, montage, cuisson." },
      { time: 90, duration: 30, title: "Pâte à Choux", desc: "Préparation et pochage gros/petits choux." },
      { time: 120, duration: 35, title: "Cuisson Choux", desc: "Surveiller la cuisson." },
      { time: 155, duration: 30, title: "Crème Mousseline (Partie 1)", desc: "Faire la pâtissière de base, refroidir." },
      { time: 185, duration: 40, title: "Montage Fraisier", desc: "Chemiser fraises, biscuit imbibé, crème, blocage froide." },
      { time: 225, duration: 30, title: "Garnissage Religieuses", desc: "Crème café et montage tête sur corps." },
      { time: 255, duration: 30, title: "Glaçage & Collerette", desc: "Fondant café, crème beurre pour collerette." },
      { time: 285, duration: 30, title: "Finition Fraisier", desc: "Pâte d'amande, décors." },
      { time: 315, duration: 15, title: "Nettoyage", desc: "Fin de l'épreuve." }
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
          <span class="exam-duration-badge">⏱️ ${task.duration} min</span>
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
    btn.textContent = t("exam.btn.start") || "Démarrer";
    btn.classList.replace("btn-danger", "btn-primary");
  } else {
    isExamRunning = true;
    btn.textContent = "⏸️ Pause";
    btn.classList.replace("btn-primary", "btn-danger");
    
    examTimerInterval = setInterval(() => {
      if (examSecondsRemaining > 0) {
        examSecondsRemaining--;
        updateExamTimerDisplay();
      } else {
        clearInterval(examTimerInterval);
        showToast("Épreuve terminée !", "info");
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
        { name: "Levure fraîche", quantity: 20, unit: "g", pricePerUnit: 0.012 },
        { name: "Sel", quantity: 10, unit: "g", pricePerUnit: 0.001 }
      ],
      steps: ["Détrempe", "Pointage", "Tourage (3 tours simples)", "Détaillage (triangles 120g)", "Pousse (2h)", "Cuisson 180°C"],
      isCap: true
    },
    {
      name: "CAP : Brioche à Tête",
      category: "EP1 - Tourtage",
      portions: 10,
      prepTime: 120,
      cookTime: 20,
      ingredients: [
        { name: "Farine T45", quantity: 500, unit: "g", pricePerUnit: 0.0013 },
        { name: "Œufs entiers", quantity: 300, unit: "g", pricePerUnit: 0.004 },
        { name: "Beurre (pommade)", quantity: 250, unit: "g", pricePerUnit: 0.008 },
        { name: "Sucre", quantity: 60, unit: "g", pricePerUnit: 0.001 },
        { name: "Levure fraîche", quantity: 20, unit: "g", pricePerUnit: 0.012 },
        { name: "Sel", quantity: 10, unit: "g", pricePerUnit: 0.001 }
      ],
      steps: ["Pétrissage", "Premier pointage (1h ambient)", "Deuxième pointage (froid)", "Division & Boulage", "Pousse (1h30 @ 28°C)", "Cuisson"],
      isCap: true
    },
    {
      name: "CAP : Tarte aux Pommes (Pâte Brisée)",
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
      steps: ["Sablage farine/beurre", "Frasage avec eau/sel", "Abaissage & Fonçage", "Garnissage compote + pommes rangées", "Cuisson 180°C", "Nappage après cuisson"],
      isCap: true
    },
    {
      name: "CAP : Éclairs Chocolat (Pâte à Choux)",
      category: "EP2 - Petits Gâteaux",
      portions: 10,
      prepTime: 90,
      cookTime: 30,
      ingredients: [
        { name: "Eau/Lait", quantity: 250, unit: "ml", pricePerUnit: 0.0008 },
        { name: "Beurre", quantity: 100, unit: "g", pricePerUnit: 0.008 },
        { name: "Farine", quantity: 150, unit: "g", pricePerUnit: 0.001 },
        { name: "Œufs", quantity: 4, unit: "pcs", pricePerUnit: 0.20 },
        { name: "Crème pâtissière chocolat", quantity: 500, unit: "g", pricePerUnit: 0.005 },
        { name: "Fondant chocolat", quantity: 200, unit: "g", pricePerUnit: 0.004 }
      ],
      steps: ["Mise en ébullition eau/lait/beurre/sel", "Dessèchement de la panade", "Incorporation des œufs", "Pochage (12cm)", "Cuisson", "Garnissage & Glaçage"],
      isCap: true
    },
    {
      name: "CAP : Royal Chocolat (Entremets)",
      category: "EP2 - Entremets",
      portions: 8,
      prepTime: 120,
      cookTime: 15,
      ingredients: [
        { name: "Biscuit Succès/Dacquoise amande", quantity: 200, unit: "g", pricePerUnit: 0.008 },
        { name: "Croustillant praliné", quantity: 150, unit: "g", pricePerUnit: 0.012 },
        { name: "Mousse au chocolat noir", quantity: 450, unit: "g", pricePerUnit: 0.009 }
      ],
      steps: ["Biscuit Dacquoise (cuisson)", "Étaler croustillant", "Réaliser mousse chocolat (pâte à bombe ou anglaise)", "Montage en cercle", "Blocage froid", "Poudrage cacao"],
      isCap: true
    },
    {
      name: "CAP : Fraisier (Crème Mousseline)",
      category: "EP2 - Entremets",
      portions: 8,
      prepTime: 100,
      cookTime: 20,
      ingredients: [
        { name: "Génoise", quantity: 300, unit: "g", pricePerUnit: 0.005 },
        { name: "Crème mousseline vanille", quantity: 600, unit: "g", pricePerUnit: 0.007 },
        { name: "Fraises fraîches", quantity: 500, unit: "g", pricePerUnit: 0.009 },
        { name: "Pâte d'amandes", quantity: 100, unit: "g", pricePerUnit: 0.015 }
      ],
      steps: ["Réalisation génoise (bain-marie)", "Crème pâtissière -> Incorporation beurre (mousseline)", "Montage chemisé fraises", "Imbibage sirop kirsch", "Finition pâte d'amandes"],
      isCap: true
    }
  ];

  // Add more common CAP subjects...
  const moreCap = [
    { name: "CAP : Tarte au Citron Meringuée", category: "EP1 - Tartes", portions: 8, prepTime: 90, cookTime: 25 },
    { name: "CAP : Flan Pâtissier", category: "EP1 - Goûters", portions: 8, prepTime: 40, cookTime: 50 },
    { name: "CAP : Paris-Brest", category: "EP2 - Petits Gâteaux", portions: 8, prepTime: 120, cookTime: 35 },
    { name: "CAP : Mille-Feuille", category: "EP2 - Entremets", portions: 8, prepTime: 180, cookTime: 30 },
    { name: "CAP : Forêt Noire", category: "EP2 - Entremets", portions: 8, prepTime: 120, cookTime: 20 }
  ];

  // Merge (simulate real recipes for the missing ones)
  moreCap.forEach(m => {
     if (!capRecipes.find(r => r.name === m.name)) {
        capRecipes.push({ ...m, ingredients: [{name: "Base Pâtissière", quantity:1000, unit:"g", pricePerUnit:0.005}], steps: ["Réalisation pas à pas"] });
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
  showToast(`${added} recettes CAP ajoutées à votre bibliothèque !`, "success");
}


// Extended CAP Subjects
CAP_DATABASE.EP1_S3 = {
  totalDuration: 5.5 * 3600,
  tasks: [
    { time: 0, duration: 40, title: "�crit & Ordonnancement", desc: "Brioche / Tarte Citron / Tuiles Amandes." },
    { time: 40, duration: 20, title: "Pes�es", desc: "Tous les �l�ments." },
    { time: 60, duration: 25, title: "P�trissage Brioche", desc: "Vitesse 1 puis 2 jusqu'au d�collement." },
    { time: 85, duration: 20, title: "P�te Sucr�e (Tarte Citron)", desc: "Cr�mage, repos frais." },
    { time: 105, duration: 20, title: "Appareil � Tuiles", desc: "M�lange blancs, sucre, amandes effil�es, beurre fondu." },
    { time: 125, duration: 20, title: "Cr�meux Citron", desc: "Cuisson � 85�C, refroidissement." },
    { time: 145, duration: 30, title: "Fon�age & Cuisson � blanc", desc: "Tarte citron." },
    { time: 175, duration: 30, title: "Fa�onnage Brioche", desc: "Nanterre ou tress�e, mise en �tuve." },
    { time: 205, duration: 30, title: "Cuisson Tuiles", desc: "Pochage fin et cuisson rapide." },
    { time: 235, duration: 20, title: "Meringue Italienne", desc: "Sirop 118�C sur blancs." },
    { time: 255, duration: 25, title: "Cuisson Brioche", desc: "Dorure et four." },
    { time: 280, duration: 40, title: "Finition Tarte Citron", desc: "Garnissage cr�meux, pochage meringue, chalumeau." },
    { time: 320, duration: 10, title: "Nettoyage final", desc: "Poste propre." }
  ]
};

CAP_DATABASE.EP2_S3 = {
  totalDuration: 5.5 * 3600,
  tasks: [
    { time: 0, duration: 45, title: "�preuve �crite", desc: "Op�ra & Paris-Brest." },
    { time: 45, duration: 20, title: "Pes�es", desc: "Joconde, Ganache, Cr�me Beurre, Mousseline Pralin�." },
    { time: 65, duration: 30, title: "Biscuit Joconde", desc: "Plaquage et cuisson 200�C." },
    { time: 95, duration: 20, title: "P�te � Choux (Paris-Brest)", desc: "Pochage en couronne." },
    { time: 115, duration: 40, title: "Cuisson Choux", desc: "Sur plaque." },
    { time: 155, duration: 30, title: "Sirop Caf� & Ganache Choco", desc: "�l�ments de l'Op�ra." },
    { time: 185, duration: 30, title: "Cr�me au Beurre Caf�", desc: "R�alisation p�te � bombe + beurre." },
    { time: 215, duration: 40, title: "Montage Op�ra", desc: "Succession biscuits imbib�s et cr�mes." },
    { time: 255, duration: 25, title: "Cr�me Mousseline Pralin�", desc: "Garnir les couronnes Paris-Brest." },
    { time: 280, duration: 30, title: "Gla�age Op�ra", desc: "Gla�age chocolat noir et �criture." },
    { time: 310, duration: 20, title: "Finition & Pr�sentation", desc: "Coupe des bords, sucre glace." }
  ]
};

