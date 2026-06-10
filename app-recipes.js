// ============================================================================
// NAVIGATION
// ============================================================================

function goToStep(step) {
  // Collect data from current step before navigating
  if (APP.currentStep >= 1) collectCurrentStepData();

  APP.currentStep = step;

  // Show/hide hero
  $('#heroSection').style.display = step === 0 ? 'block' : 'none';
  $('#stepIndicator').style.display = step === 0 ? 'none' : 'flex';
  $('#savedSection').style.display = 'none';

  // Show/hide step content
  for (let i = 1; i <= 5; i++) {
    const el = $(`#step${i}`);
    if (el) {
      el.classList.toggle('active', i === step);
    }
  }

  // Update step indicator
  $$('.step-dot').forEach((dot, idx) => {
    const s = idx + 1;
    dot.classList.remove('active', 'completed');
    if (s === step) dot.classList.add('active');
    else if (s < step) dot.classList.add('completed');
  });

  $$('.step-line').forEach((line, idx) => {
    line.classList.toggle('active', idx + 1 < step);
  });

  // Render step-specific content
  if (step === 2) renderIngredients();
  if (step === 3) renderProcedure();
  if (step === 4) renderCostAnalysis();
  if (step === 5) renderSummary();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function collectCurrentStepData() {
  if (APP.currentStep === 1) {
    APP.recipe.name = GourmetSecurity.sanitize($('#recipeName').value.trim());
    APP.recipe.category = GourmetSecurity.sanitize($('#recipeCategory').value.trim());
    APP.recipe.portions = parseInt($('#recipePortions').value) || 10;
    APP.recipe.prepTime = parseInt($('#recipePrepTime').value) || 0;
    APP.recipe.cookTime = parseInt($('#recipeCookTime').value) || 0;
    APP.recipe.description = GourmetSecurity.sanitize($('#recipeDesc').value.trim());
  }
  if (APP.currentStep === 2) collectIngredients();
  if (APP.currentStep === 3) collectProcedure();
  if (APP.currentStep === 4) {
    if ($('#advLaborRate')) {
      APP.recipe.advanced = {
        laborRate: parseFloat($('#advLaborRate').value) || 0,
        fixedCharges: parseFloat($('#advFixedCharges').value) || 0,
        productions: parseInt($('#advProductions').value) || 1,
        energyRate: parseFloat($('#advEnergy').value) || 0,
        amortization: parseFloat($('#advAmortization').value) || 0
      };
    }
    if ($('#recipeTvaRate')) {
      APP.recipe.tvaRate = parseFloat($('#recipeTvaRate').value) || 5.5;
    }
  }
}

function populateStep1() {
  $('#recipeName').value = APP.recipe.name;
  $('#recipeCategory').value = APP.recipe.category;
  $('#recipePortions').value = APP.recipe.portions;
  $('#recipePrepTime').value = APP.recipe.prepTime;
  $('#recipeCookTime').value = APP.recipe.cookTime;
  $('#recipeDesc').value = APP.recipe.description;
}

// ============================================================================
// STEP 2 — INGREDIENTS
// ============================================================================

function renderIngredients() {
  const container = $('#ingredientsList');
  if (!container) return;

  // Clear container
  container.innerHTML = '';

  // Add rows
  APP.recipe.ingredients.forEach((ing, idx) => {
    const row = createIngredientRow(ing, idx);
    container.appendChild(row);
  });

  if (window.SousRecettes) {
    SousRecettes.renderSousRecetteRows();
  }

  // GSAP Stagger Animation (Guaranteed opacity 1)
  if (window.gsap && (APP.recipe.ingredients.length > 0 || (APP.recipe.sousRecettes && APP.recipe.sousRecettes.length > 0))) {
    gsap.fromTo('#ingredientsList .ing-row', 
      { opacity: 0, y: 15 },
      { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out' }
    );
  }

  updateIngredientsTotal();
}

function createIngredientRow(ing, idx) {
  const row = document.createElement('div');
  row.className = 'ing-row';
  row.dataset.idx = idx;

  const cost = calcIngredientCost(ing);
  const priceRef = getPriceRef(ing.unit);

  row.innerHTML = `
    <div class="ing-name autocomplete-wrap" style="position:relative;">
      <div class="ing-row-icon">${getIngredientIcon(ing.name)}</div>
      <input type="text" class="form-input ing-input" data-field="name" value="${escapeHtml(t(ing.name))}" placeholder="${t('ui.ph.name')}" />
      <div class="autocomplete-list" id="ac-${idx}"></div>
      <div class="seasonality-badge" id="season-${idx}"></div>
    </div>
    <div class="ing-qty">
      <input type="number" class="form-input ing-input" data-field="quantity" value="${ing.quantity}" min="0" step="any" placeholder="${t('ui.ph.qty')}" />
    </div>
    <div class="ing-unit">
      <select class="form-input ing-input" data-field="unit">
        <option value="g" ${ing.unit === 'g' ? 'selected' : ''}>g</option>
        <option value="kg" ${ing.unit === 'kg' ? 'selected' : ''}>kg</option>
        <option value="ml" ${ing.unit === 'ml' ? 'selected' : ''}>ml</option>
        <option value="L" ${ing.unit === 'L' ? 'selected' : ''}>L</option>
        <option value="pièce" ${ing.unit === 'pièce' ? 'selected' : ''}>${t('unit.portion')}</option>
      </select>
    </div>
    <div class="ing-price" style="display:flex; align-items:center; gap:8px;">
      <input type="number" class="form-input ing-input" data-field="pricePerUnit" value="${ing.pricePerUnit}" min="0" step="0.01" placeholder="€/${priceRef}" title="${t('ui.ph.price')}" />
      <svg class="ing-sparkline" viewBox="0 0 100 30" preserveAspectRatio="none">
        <path d="M0,${15 + Math.random()*10} L25,${5 + Math.random()*20} L50,${10 + Math.random()*15} L75,${5 + Math.random()*20} L100,${15 + Math.random()*10}" fill="none" class="spark-path"></path>
      </svg>
    </div>
    <div class="ing-cost">${cost.toFixed(2)} €</div>
    <button class="btn-remove" data-remove="${idx}" title="${t('ui.btn.delete')}">✕</button>
  `;

  // Input events
  row.querySelectorAll('.ing-input').forEach(input => {
    input.addEventListener('input', () => onIngredientChange(row, idx));
    input.addEventListener('change', () => onIngredientChange(row, idx));
  });

  // Autocomplete on name field
  const nameInput = row.querySelector('[data-field="name"]');
  const acList = row.querySelector('.autocomplete-list');
  nameInput.addEventListener('input', () => showAutocomplete(nameInput, acList, idx));
  nameInput.addEventListener('focus', () => showAutocomplete(nameInput, acList, idx));
  nameInput.addEventListener('blur', () => setTimeout(() => acList.classList.remove('show'), 200));

  // Remove button
  row.querySelector('[data-remove]').addEventListener('click', () => {
    APP.recipe.ingredients.splice(idx, 1);
    renderIngredients();
  });
  
  // Update seasonality on render
  updateSeasonalityBadge(row, idx, ing.name);

  return row;
}

function onIngredientChange(row, idx) {
  const ing = APP.recipe.ingredients[idx];
  const nameInput = row.querySelector('[data-field="name"]');
  const qtyInput = row.querySelector('[data-field="quantity"]');
  const unitSelect = row.querySelector('[data-field="unit"]');
  const priceInput = row.querySelector('[data-field="pricePerUnit"]');

  ing.name = nameInput.value;
  ing.quantity = parseFloat(qtyInput.value) || 0;
  ing.unit = unitSelect.value;
  ing.pricePerUnit = parseFloat(priceInput.value) || 0;

  const cost = calcIngredientCost(ing);
  row.querySelector('.ing-cost').textContent = cost.toFixed(2) + ' €';

  // Update price placeholder
  const priceRef = getPriceRef(ing.unit);
  priceInput.placeholder = `€/${priceRef}`;

  updateIngredientsTotal();
  updateSeasonalityBadge(row, idx, ing.name);
}

function updateIngredientsTotal() {
  const total = calcTotalMaterialCost();
  $('#ingredientsTotal').textContent = total.toFixed(2) + ' €';
}

function addIngredient(preset = null) {
  const ing = preset || {
    name: '',
    quantity: 0,
    unit: 'g',
    pricePerUnit: 0
  };
  APP.recipe.ingredients.push(ing);
  renderIngredients();

  // Focus the last name input
  const rows = $$('.ing-row');
  if (rows.length > 0) {
    const lastRow = rows[rows.length - 1];
    const nameInput = lastRow.querySelector('[data-field="name"]');
    if (nameInput) nameInput.focus();
  }
}

function collectIngredients() {
  const container = $('#ingredientsList');
  if (!container) return;
  const rows = container.querySelectorAll('.ing-row:not(.sr-row)');
  const allRows = container.querySelectorAll('.ing-row');

  // SÉCURITÉ : Si aucune ligne n'est présente dans le DOM (UI non initialisée), 
  // on ne vide pas APP.recipe.ingredients pour éviter d'effacer les données chargées en mémoire.
  if (allRows.length === 0) return;

  APP.recipe.ingredients = [];
  rows.forEach(row => {
    const nameInput = row.querySelector('[data-field="name"]');
    if (!nameInput) return;
    const name = GourmetSecurity.sanitize(nameInput.value.trim());
    const quantity = parseFloat(row.querySelector('[data-field="quantity"]').value) || 0;
    const unit = row.querySelector('[data-field="unit"]').value;
    const pricePerUnit = parseFloat(row.querySelector('[data-field="pricePerUnit"]').value) || 0;
    if (name) {
      APP.recipe.ingredients.push({ name, quantity, unit, pricePerUnit });
    }
  });
}

// Autocomplete
function showAutocomplete(input, listEl, idx) {
  const val = input.value.toLowerCase().trim();
  if (val.length < 1) { listEl.classList.remove('show'); return; }

  // 1. Core ingredients + Supplier-specific prices
  let matches = [];
  const matchingDb = APP.ingredientDb.filter(i => i.name.toLowerCase().includes(val));
  
  matchingDb.forEach(i => {
    // Check if we have supplier prices configured for this ingredient name
    const supplierPrices = (APP.ingredientPrices || []).filter(ip => 
      ip.ingredient_name.toLowerCase().trim() === i.name.toLowerCase().trim()
    );
    
    // Add supplier-specific options first
    supplierPrices.forEach(ip => {
      const supplier = (APP.suppliers || []).find(s => String(s.id) === String(ip.fournisseur_id));
      const supplierName = supplier ? supplier.name : 'Fournisseur';
      matches.push({
        name: `${i.name} (${supplierName})`,
        unit: ip.unite || i.unit,
        pricePerUnit: ip.prix_unitaire,
        priceRef: ip.unite || i.unit,
        isRecipe: false
      });
    });
    
    // Add default option
    matches.push({
      ...i,
      isRecipe: false
    });
  });

  // 2. Saved Recipes & Library Recipes (Compositions)
  const savedRecipes = JSON.parse(localStorage.getItem(getUserRecipesKey()) || '[]');
  const allAvailableRecipes = [...RECIPES, ...savedRecipes];
  
  // Filter out the *current* recipe to prevent self-reference
  const currentRecipeName = (APP.recipe.name || '').toLowerCase();
  
  const recipeMatches = allAvailableRecipes
    .filter(r => r.name.toLowerCase().includes(val) && r.name.toLowerCase() !== currentRecipeName)
    .map(r => {
      // Calculate sub-recipe total cost and weight to give a price per kg
      let subCost = 0;
      let subWeightGrams = 0;
      r.ingredients.forEach(subIng => {
        subCost += calcIngredientCost(subIng);
        let subQty = parseFloat(subIng.quantity) || 0;
        if (subIng.unit === 'kg' || subIng.unit === 'L') subQty *= 1000;
        else if (subIng.unit === 'g' || subIng.unit === 'ml') subQty *= 1;
        else subQty *= 50; // Approximative for units like 'pièce'
        subWeightGrams += subQty;
      });
      // Cost per kg = (Cost / Weight in g) * 1000
      let pricePerKg = subWeightGrams > 0 ? (subCost / subWeightGrams) * 1000 : 0;
      
      return {
        name: `(📚) ${r.name}`, // Prefix to indicate it's a sub-recipe
        unit: 'kg', // By default, we use compositions by weight
        pricePerUnit: pricePerKg,
        priceRef: 'kg',
        isRecipe: true
      };
    });

  matches = [...recipeMatches, ...matches].slice(0, 10);

  if (matches.length === 0) { listEl.classList.remove('show'); return; }

  listEl.innerHTML = matches.map(m => {
    const icon = m.isRecipe ? '📦' : getIngredientIcon(m.name);
    const badgeHtml = m.isRecipe ? `<span style="font-size:0.6rem; background:var(--accent); color:white; padding:2px 4px; border-radius:4px; margin-left:6px; font-weight:800; text-transform:uppercase;">COMPOSITION</span>` : '';
    
    return `
    <div class="autocomplete-item" data-name="${escapeHtml(m.name)}" data-unit="${escapeHtml(m.unit || 'g')}" data-price="${m.pricePerUnit}" style="display:flex; align-items:center; gap:8px;">
      <span style="font-size:1.1rem; width:24px; text-align:center;">${icon}</span>
      <div style="flex:1;">
        <div style="font-weight:600;">${escapeHtml(m.name)}${badgeHtml}</div>
        <small style="color:var(--text-muted)">${parseFloat(m.pricePerUnit).toFixed(2)} €/${escapeHtml(m.priceRef || m.unit)}</small>
      </div>
    </div>
    `;
  }).join('');

  listEl.classList.add('show');

  listEl.querySelectorAll('.autocomplete-item').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const ing = APP.recipe.ingredients[idx];
      ing.name = item.dataset.name;
      ing.unit = item.dataset.unit;
      ing.pricePerUnit = parseFloat(item.dataset.price);
      renderIngredients();
    });
  });
}


// ============================================================================
// STEP 3 — PROCEDURE
// ============================================================================

function renderProcedure() {
  const container = $('#procedureList');
  if (!container) return;
  
  container.innerHTML = '';

  // UI ENHANCEMENT: If no steps, add one empty row to guide the user
  if (APP.recipe.steps.length === 0) {
    APP.recipe.steps.push('');
  }

  APP.recipe.steps.forEach((step, idx) => {
    container.appendChild(createProcedureStep(step, idx));
  });
}

function createProcedureStep(textObj, idx) {
  const div = document.createElement('div');
  div.className = 'procedure-step';

  const isObj = typeof textObj === 'object' && textObj !== null;
  const stepText = isObj ? textObj.text : textObj;
  const stepDay = isObj ? textObj.day : 'Jour J';

  div.innerHTML = `
    <div class="step-num">${idx + 1}</div>
    <select class="form-input proc-day" style="max-width:100px; padding:0.4rem; font-size:0.85rem; border-right:none; border-radius:var(--radius-sm) 0 0 var(--radius-sm); border-right: 1px solid var(--surface-border);">
      <option value="J-3" ${stepDay === 'J-3' ? 'selected' : ''}>J-3</option>
      <option value="J-2" ${stepDay === 'J-2' ? 'selected' : ''}>J-2</option>
      <option value="J-1" ${stepDay === 'J-1' ? 'selected' : ''}>J-1</option>
      <option value="Jour J" ${stepDay === 'Jour J' ? 'selected' : ''}>Jour J</option>
      <option value="J+1" ${stepDay === 'J+1' ? 'selected' : ''}>J+1</option>
    </select>
    <input type="text" class="form-input proc-input" style="border-radius:0 var(--radius-sm) var(--radius-sm) 0;" value="${escapeHtml(t(stepText))}" placeholder="${t('ui.ph.step')}" />
    <button class="btn-remove" data-remove-step="${idx}" title="${t('ui.btn.delete')}">✕</button>
  `;

  div.querySelector('[data-remove-step]').addEventListener('click', () => {
    APP.recipe.steps.splice(idx, 1);
    renderProcedure();
  });

  return div;
}

function addProcedureStep() {
  APP.recipe.steps.push('');
  renderProcedure();
  const inputs = $$('.proc-input');
  if (inputs.length > 0) inputs[inputs.length - 1].focus();
}

function collectProcedure() {
  const steps = $$('.procedure-step');
  
  // SÉCURITÉ : Ne pas vider la mémoire si le DOM est vide (ex: navigation rapide ou erreur de rendu)
  if (steps.length === 0) return;

  APP.recipe.steps = [];
  steps.forEach(stepEl => {
    const input = stepEl.querySelector('.proc-input');
    const day = stepEl.querySelector('.proc-day');
    const val = input ? GourmetSecurity.sanitize(input.value.trim()) : '';
    const dayVal = day ? day.value : 'Jour J';

    if (val) {
      APP.recipe.steps.push({ text: val, day: dayVal });
    }
  });
}

// ============================================================================
// STEP 4 — COST ANALYSIS
// ============================================================================

function renderCostAnalysis() {
  const kpiGrid = $('#kpiGrid');
  const nutritionGrid = document.getElementById('nutritionGrid');

  // Show skeletons for perceived smoothness
  if (kpiGrid) {
    kpiGrid.innerHTML = Array(4).fill(0).map(() => `
      <div class="kpi-card skeleton" style="height: 120px;"></div>
    `).join('');
  }

  if (nutritionGrid) {
    // Instead of wiping the whole grid (which deletes IDs), 
    // we just empty the values or add skeleton class to specific elements
    const valueEls = nutritionGrid.querySelectorAll('[id^="nutri"]');
    valueEls.forEach(el => {
      el.classList.add('skeleton-text');
      el.style.minWidth = '40px';
      el.style.display = 'inline-block';
      el.textContent = ' '; // Empty while loading
    });
  }

  // Small timeout to allow skeleton to be visible (150ms is perfect for perceived speed)
  setTimeout(() => {
    // Populate advanced inputs from saved data if available
    if (APP.recipe.advanced) {
      const adv = APP.recipe.advanced;
      const setVal = (id, val) => {
        const el = document.getElementById(id);
        if (el && !el.dataset.initialized) {
          el.value = val;
          el.dataset.initialized = 'true';
        }
      };
      setVal('advLaborRate', adv.laborRate);
      setVal('advFixedCharges', adv.fixedCharges);
      setVal('advProductions', adv.productions);
      setVal('advEnergy', adv.energyRate);
      setVal('advAmortization', adv.amortization);
    }

    if (APP.recipe.tvaRate !== undefined) {
      const el = document.getElementById('recipeTvaRate');
      if (el && !el.dataset.initialized) {
        el.value = APP.recipe.tvaRate;
        el.dataset.initialized = 'true';
      }
    }

    const costs = calcFullCost(APP.margin);

    // KPI Cards
    if (kpiGrid) {
      kpiGrid.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">${t('ui.kpi.total_material')}</div>
          <div class="kpi-value ticker-val" data-val="${costs.totalMaterial}" data-suffix=" €">${costs.totalMaterial.toFixed(2)} €</div>
          <div class="kpi-sub">${t('label.per_portion')} ${costs.portions} ${costs.portions > 1 ? t('unit.portions') : t('unit.portion')}</div>
        </div>
        <div class="kpi-card accent">
          <div class="kpi-label">${t('ui.kpi.per_portion')}</div>
          <div class="kpi-value ticker-val" data-val="${costs.costPerPortion}" data-suffix=" €">${costs.costPerPortion.toFixed(2)} €</div>
          <div class="kpi-sub">${t('label.cost')} / ${t('unit.portion')}</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">${t('ui.kpi.suggested_price')} HT</div>
          <div class="kpi-value ticker-val" data-val="${costs.sellingPrice}" data-suffix=" €">${costs.sellingPrice.toFixed(2)} €</div>
          <div class="kpi-sub">TTC: ${costs.sellingPriceTTC.toFixed(2)} € (TVA ${costs.tvaRate}%)</div>
        </div>
        <div class="kpi-card warning">
          <div class="kpi-label">${t('ui.kpi.margin_portion')}</div>
          <div class="kpi-value ticker-val" data-val="${costs.marginPerPortion}" data-suffix=" €">${costs.marginPerPortion.toFixed(2)} €</div>
          <div class="kpi-sub">${costs.marginPct.toFixed(1)}% ${t('s4.margin')}</div>
        </div>
      `;

      if (typeof animateTicker === 'function') {
        kpiGrid.querySelectorAll('.ticker-val').forEach(el => {
          const val = el.getAttribute('data-val');
          const suffix = el.getAttribute('data-suffix');
          // Reset visually to 0 before animating
          el.textContent = '0.00' + suffix; 
          animateTicker(el, val, 1200, suffix);
        });
      }

      // Animate KPI Cards (Guaranteed opacity 1)
      if (window.gsap) {
        gsap.fromTo('#kpiGrid .kpi-card', 
          { opacity: 0, scale: 0.95 },
          { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.7)' }
        );
      }
    }

    // Donut chart
    renderDonutChart();

    // Batch scaling
    renderBatchScaling(costs);

    // Margin slider value
    const marginValEl = $('#marginValue');
    const marginSliderEl = $('#marginSlider');
    if (marginValEl) marginValEl.textContent = APP.margin + '%';
    if (marginSliderEl) marginSliderEl.value = APP.margin;

    // Advanced cost KPI
    renderAdvancedCostKPI(costs);

    // Nutrition & Allergens calculation
    if (nutritionGrid) {
      // Remove skeleton classes before updating values
      nutritionGrid.querySelectorAll('[id^="nutri"]').forEach(el => {
        el.classList.remove('skeleton-text');
        el.style.minWidth = '';
      });
      renderNutritionAnalysis();
    }

    // Update comparator if open
    if ($('#comparatorModal').style.display === 'flex') {
      updateComparator();
    }
  }, 150);
}

function updateComparator() {
  const container = $('#comparatorBody');
  const verdict = $('#comparatorVerdict');
  const breakdown = $('#comparatorBreakdown');
  const healthIcon = $('#comparatorHealthIcon');
  const healthLabel = $('#comparatorHealthLabel');
  
  if (!container) return;

  const current = calcFullCost(APP.margin);
  const base = APP.baselineCosts || current;

  // 1. Core KPIs Table
  const rows = [
    { label: t('ui.kpi.total_material') || 'Coût Matières (Total)', key: 'totalMaterial', unit: '€' },
    { label: t('ui.kpi.per_portion') || 'Coût par Portion', key: 'costPerPortion', unit: '€' },
    { label: t('ui.kpi.suggested_price') || 'Prix de Vente Conseillé', key: 'sellingPrice', unit: '€' },
    { label: t('ui.kpi.margin_portion') || 'Marge par Portion', key: 'marginPerPortion', unit: '€' }
  ];

  container.innerHTML = rows.map(row => {
    const valA = base[row.key] || 0;
    const valB = current[row.key] || 0;
    const diff = valB - valA;
    const diffColor = (row.key === 'marginPerPortion' || row.key === 'sellingPrice' || row.key === 'marginPct')
      ? (diff >= 0 ? 'var(--success)' : 'var(--danger)')
      : (diff <= 0 ? 'var(--success)' : 'var(--danger)');

    return `
      <tr style="border-bottom:1px solid var(--surface-border);">
        <td style="padding:0.8rem 0.5rem; font-weight:600;">${row.label}</td>
        <td style="padding:0.8rem 0.5rem; color:var(--text-muted);">${valA.toFixed(2)}${row.unit}</td>
        <td style="padding:0.8rem 0.5rem; font-weight:700;">
          ${valB.toFixed(2)}${row.unit}
          <div style="font-size:0.75rem; color:${diffColor}; font-weight:800;">
            ${diff > 0 ? '+' : ''}${diff.toFixed(2)}${row.unit}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  // 2. Cost Breakdown Analysis
  if (breakdown) {
    const matPct = (current.totalMaterial / current.totalFullCost * 100) || 0;
    const laborPct = (current.laborCost / current.totalFullCost * 100) || 0;
    const otherPct = 100 - matPct - laborPct;
    
    breakdown.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;"><span>Matières</span> <strong>${matPct.toFixed(1)}%</strong></div>
      <div style="display:flex; justify-content:space-between; margin-bottom:0.3rem;"><span>Main d'œuvre</span> <strong>${laborPct.toFixed(1)}%</strong></div>
      <div style="display:flex; justify-content:space-between;"><span>Frais / Énergie</span> <strong>${otherPct.toFixed(1)}%</strong></div>
    `;
  }

  // 3. Health Indicator & Verdict
  const diffMargin = current.marginPerPortion - base.marginPerPortion;
  const diffMaterial = current.totalMaterial - base.totalMaterial;
  
  if (Math.abs(diffMargin) < 0.01 && Math.abs(diffMaterial) < 0.01) {
    healthIcon.textContent = '⚖️';
    healthLabel.textContent = 'Statut Quo';
    healthLabel.style.color = 'var(--text-muted)';
    verdict.textContent = "Aucun changement détecté. Modifiez les quantités ou les prix pour voir l'impact en temps réel.";
    verdict.style.color = "var(--text-muted)";
  } else if (diffMargin > 0) {
    healthIcon.textContent = '🚀';
    healthLabel.textContent = 'Rentable';
    healthLabel.style.color = 'var(--success)';
    verdict.innerHTML = `L'optimisation actuelle augmente votre profit de <span style="color:var(--success)">+${diffMargin.toFixed(2)}€</span> par portion. <br><small>Continuez ainsi pour maximiser vos marges.</small>`;
    verdict.style.color = "var(--text)";
  } else {
    healthIcon.textContent = '📉';
    healthLabel.textContent = 'Alerte';
    healthLabel.style.color = 'var(--danger)';
    verdict.innerHTML = `Attention : Cette variation réduit votre marge de <span style="color:var(--danger)">${diffMargin.toFixed(2)}€</span> par portion. <br><small>Vérifiez le coût des nouveaux ingrédients ou ajustez votre prix de vente.</small>`;
    verdict.style.color = "var(--text)";
  }
}

function snapBaseline() {
  APP.baselineCosts = JSON.parse(JSON.stringify(calcFullCost(APP.margin)));
  updateComparator();
  showToast("Référence (A) mise à jour !", "success");
}

function renderAdvancedCostKPI(costs) {
  const grid = $('#advancedKpiGrid');
  if (!grid) return;

  const totalTimeH = (costs.prepTime + costs.cookTime) / 60;
  const additionalSum = costs.laborCost + costs.energyCost + costs.fixedShare + costs.amortShare;

  grid.innerHTML = `
    <div class="kpi-card">
      <div class="kpi-label">${t('s4.adv.kpi.labor')}</div>
      <div class="kpi-value">${costs.laborCost.toFixed(2)} €</div>
      <div class="kpi-sub">${costs.laborRate.toFixed(2)} €/h × ${totalTimeH.toFixed(1)}h</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${t('s4.adv.kpi.energy')}</div>
      <div class="kpi-value">${costs.energyCost.toFixed(2)} €</div>
      <div class="kpi-sub">${costs.energyRate.toFixed(2)} €/h × ${(costs.cookTime / 60).toFixed(1)}h</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${t('s4.adv.kpi.fixed')}</div>
      <div class="kpi-value">${costs.fixedShare.toFixed(2)} €</div>
      <div class="kpi-sub">${costs.fixedCharges.toFixed(0)} € / ${costs.productions}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">${t('s4.adv.kpi.amort')}</div>
      <div class="kpi-value">${costs.amortShare.toFixed(2)} €</div>
      <div class="kpi-sub">${costs.amortization.toFixed(0)} € / ${costs.productions}</div>
    </div>
    <div class="kpi-card accent">
      <div class="kpi-label">${t('s4.adv.kpi.full_cost')}</div>
      <div class="kpi-value" style="font-size:1.3rem">${costs.totalFullCost.toFixed(2)} €</div>
      <div class="kpi-sub">${t('ui.kpi.total_material')}: ${costs.totalMaterial.toFixed(2)} € + ${additionalSum.toFixed(2)} €</div>
    </div>
    <div class="kpi-card success">
      <div class="kpi-label">${t('s4.adv.kpi.full_portion')}</div>
      <div class="kpi-value" style="font-size:1.3rem">${costs.costPerPortion.toFixed(2)} €</div>
      <div class="kpi-sub">${costs.totalFullCost.toFixed(2)} € / ${costs.portions} ${costs.portions > 1 ? t('unit.portions') : t('unit.portion')}</div>
    </div>
  `;
}

function renderDonutChart() {
  const container = $('#chartContainer');
  const ingredients = APP.recipe.ingredients.filter(i => i.name && calcIngredientCost(i) > 0);
  const total = calcTotalMaterialCost();

  if (total === 0 || ingredients.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); text-align:center;">${t('ui.chart.empty')}</p>`;
    return;
  }

  // Colors for chart segments
  const colors = [
    '#e67e22', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6',
    '#f39c12', '#1abc9c', '#34495e', '#d35400', '#2980b9',
    '#27ae60', '#c0392b', '#8e44ad', '#f1c40f', '#16a085'
  ];

  // Build segments
  const segments = ingredients.map(ing => ({
    name: t(ing.name),
    cost: calcIngredientCost(ing),
    color: colors[Math.floor(Math.random() * colors.length)] // Random color for now
  })).sort((a, b) => b.cost - a.cost);

  // SVG donut
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  const circles = segments.map(seg => {
    const pct = seg.cost / total;
    const dash = pct * circumference;
    const circle = `<circle cx="100" cy="100" r="${radius}"
      stroke="${seg.color}" stroke-dasharray="${dash} ${circumference - dash}"
      stroke-dashoffset="${-offset}" />`;
    offset += dash;
    return circle;
  }).join('');

  // Legend
  const legend = segments.map(seg => {
    const pct = ((seg.cost / total) * 100).toFixed(1);
    return `<div class="legend-item">
      <div class="legend-color" style="background:${seg.color}"></div>
      <span>${escapeHtml(seg.name)}</span>
      <span class="legend-pct">${pct}%</span>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div class="donut-wrap">
      <svg viewBox="0 0 200 200">
        ${circles}
      </svg>
      <div class="donut-center">
        <div class="dc-value">${total.toFixed(2)} €</div>
        <div class="dc-label">${t('label.total')}</div>
      </div>
    </div>
    <div class="chart-legend">
      ${legend}
    </div>
  `;
}

function renderBatchScaling(costs) {
  const batches = [1, 10, 100];
  const grid = $('#batchGrid');
  grid.innerHTML = batches.map(n => {
    const totalCost = round2(costs.totalMaterial * n);
    const totalRevenue = round2(costs.sellingPrice * costs.portions * n);
    const totalProfit = round2(totalRevenue - totalCost);
    const label = n === 1 ? t('ui.batch.count').replace('{n}', n) : t('ui.batch.count_plural').replace('{n}', n);
    return `
      <div class="batch-card">
        <div class="batch-label">${label}</div>
        <div class="batch-value">${totalCost.toFixed(2)} €</div>
        <div class="batch-sub">${t('ui.batch.material_cost')}</div>
        <div style="margin-top:0.5rem; font-size:0.8rem; color:var(--success); font-weight:700;">
          ${t('ui.batch.revenue')}: ${totalRevenue.toFixed(2)} € · ${t('ui.batch.profit')}: ${totalProfit.toFixed(2)} €
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// STEP 5 — SUMMARY
// ============================================================================

function renderSummary() {
  const container = document.getElementById('summaryContent');
  if (!container) return;

  // Show skeleton
  container.innerHTML = `
    <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 1.5rem;"></div>
    <div class="skeleton" style="height: 15px; width: 40%; margin-bottom: 2rem;"></div>
    <div class="summary-sections-grid">
      <div class="summary-section skeleton" style="height: 300px;"></div>
      <div class="summary-section skeleton" style="height: 300px;"></div>
    </div>
  `;

  setTimeout(() => {
    collectCurrentStepData();
    const costs = calcFullCost(APP.margin);
    const r = APP.recipe;

    const subtitleEl = $('#summarySubtitle');
    if (subtitleEl) {
      subtitleEl.textContent = r.name
        ? `${r.name} — ${r.portions} ${r.portions > 1 ? t('unit.portions') : t('unit.portion')} · ${r.category || t('label.unclassified')}`
        : t('s5.subtitle.empty');
    }

    // Ingredients table
    let ingRows = r.ingredients.filter(i => i.name).map(ing => {
      const cost = calcIngredientCost(ing);
      const priceRef = getPriceRef(ing.unit);
      const unitLabel = ing.unit === 'pièce' ? t('unit.portion') : ing.unit;
      return `<tr>
        <td>${escapeHtml(t(ing.name))}</td>
        <td>${ing.quantity} ${unitLabel}</td>
        <td>${ing.pricePerUnit.toFixed(2)} €/${priceRef}</td>
        <td style="font-weight:700; color:var(--accent)">${cost.toFixed(2)} €</td>
      </tr>`;
    }).join('');

    // Append sub-recipes rows
    if (window.SousRecettes && r.sousRecettes && r.sousRecettes.length > 0) {
      const savedRecipesForSummary = JSON.parse(localStorage.getItem(getUserRecipesKey()) || '[]');
      const srRows = r.sousRecettes.map(sr => {
        const cost = SousRecettes.calcCoutSousRecette(sr);
        const enfant = savedRecipesForSummary.find(re => re.id === sr.recetteEnfantId);
        const poidsTotal = enfant ? SousRecettes.getPoidsTotal(enfant) : 0;
        const priceRef = poidsTotal > 0 ? (SousRecettes.calcCoutSousRecette({ recetteEnfantId: sr.recetteEnfantId, quantiteUtilisee: poidsTotal, rendement: 100 }) / poidsTotal * 1000).toFixed(2) + ' €/kg' : '— €/kg';
        const rdtLabel = (parseFloat(sr.rendement) || 100) < 100 ? ` (rdt ${sr.rendement}%)` : '';
        return `<tr class="sr-summary-row" style="background-color: rgba(230, 126, 34, 0.04); cursor: pointer;" onclick="if(window.loadRecipe && '${sr.recetteEnfantId}') { loadRecipe('${sr.recetteEnfantId}'); if(window.goToStep) goToStep(5); }">
          <td><span class="sr-badge" style="font-size:0.75rem; margin-right:0.4rem; padding: 2px 6px; background-color: var(--primary); color: white; border-radius: 4px;">🔗 Sous-recette</span> <em>${escapeHtml(sr.recetteEnfantNom)}</em></td>
          <td>${sr.quantiteUtilisee} g${rdtLabel}</td>
          <td>${priceRef}</td>
          <td style="font-weight:700; color:var(--accent)">${cost.toFixed(2)} €</td>
        </tr>`;
      }).join('');
      ingRows += srRows;
    }

    // Procedure list
    let procHtml = '';
    if (r.steps && r.steps.length > 0) {
      let currentDay = '';
      r.steps.filter(s => s).forEach((s, i) => {
        const isObj = typeof s === 'object';
        const text = isObj ? s.text : s;
        const day = isObj ? s.day : 'Jour J';

        if (day !== currentDay) {
          currentDay = day;
          procHtml += `<div style="font-weight:800; color:var(--accent); margin-top:0.8rem; margin-bottom:0.2rem; font-size:0.85rem;">📅 ${currentDay}</div>`;
        }
        procHtml += `<li>${escapeHtml(t(text))}</li>`;
      });
    }

    // Time display
    const prepH = Math.floor(r.prepTime / 60);
    const prepM = r.prepTime % 60;
    const prepStr = prepH > 0 ? `${prepH}h${prepM > 0 ? (prepM < 10 ? '0' + prepM : prepM) : ''}` : `${prepM} min`;
    const cookH = Math.floor(r.cookTime / 60);
    const cookM = r.cookTime % 60;
    const cookStr = cookH > 0 ? `${cookH}h${cookM > 0 ? (cookM < 10 ? '0' + cookM : cookM) : ''}` : `${cookM} min`;

    container.innerHTML = `
      ${r.description ? `<p style="color:var(--text-secondary); margin-bottom:1.2rem; font-style:italic;">${escapeHtml(r.description)}</p>` : ''}
      <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.5rem; display:flex; align-items:center; gap:1.5rem; flex-wrap:wrap;">
        <span>⏱ ${t('ui.label.prep')}: ${prepStr} · ${t('ui.label.cook')}: ${cookStr} · ${r.portions} ${r.portions > 1 ? t('unit.portions') : t('unit.portion')}</span>
        <span id="summaryNutriBadge"></span>
        <button onclick="window.GourmetRecipeHistory.showHistory('${r.name}')" class="btn btn-sm btn-outline" style="padding:4px 10px; font-size:0.7rem;">📜 Historique Versions</button>
        <button onclick="window.GourmetBaseline.lock()" class="btn btn-sm btn-outline" style="padding:4px 10px; font-size:0.7rem;">🔒 Verrouiller Prix Réf.</button>
      </p>

      <div id="baselineComparisonPanel" style="margin-bottom:1.5rem; display:none;"></div>

      <div class="summary-sections-grid">
        <div class="summary-section">
          <h3>🥄 ${t('step.ingredients')}</h3>
          <table class="summary-table">
            <thead>
              <tr><th>${t('s5.table.ingredient')}</th><th>${t('s5.table.quantity')}</th><th>${t('s5.table.price')}</th><th>${t('s5.table.cost')}</th></tr>
            </thead>
            <tbody>${ingRows || `<tr><td colspan="4" style="color:var(--text-muted)">${t('label.no_ingredient')}</td></tr>`}</tbody>
            <tfoot>
              <tr><td colspan="3"><strong>${t('ui.label.total_material')}</strong></td><td><strong>${costs.totalMaterial.toFixed(2)} €</strong></td></tr>
            </tfoot>
          </table>
        </div>

        <div class="summary-right-col">
          ${r.steps.length > 0 ? `
          <div class="summary-section">
            <h3>👨‍🍳 ${t('step.procedure')}</h3>
            <div class="summary-procedures">
              <ol>${procHtml}</ol>
            </div>
          </div>` : ''}

          <div class="summary-section">
            <h3>📊 ${t('ui.label.financial_analysis')}</h3>
            <div class="summary-financials">
              <div class="fin-row">
                <span class="fin-label">${t('ui.kpi.total_material')}</span>
                <span class="fin-value">${costs.totalMaterial.toFixed(2)} €</span>
              </div>
              ${costs.additionalCosts > 0 ? `
              <div class="fin-row" style="font-size: 0.8rem; color: var(--text-muted); padding-left: 0.5rem; border-left: 2px solid var(--surface-border);">
                <span>${t('s4.adv.kpi.labor')} + ${t('s4.adv.kpi.energy')} + ...</span>
                <span>+ ${costs.additionalCosts.toFixed(2)} €</span>
              </div>
              <div class="fin-row" style="font-weight: 700; border-top: 1px dashed var(--surface-border); margin-top: 0.2rem; padding-top: 0.2rem;">
                <span>${t('s4.adv.kpi.full_cost')}</span>
                <span>${costs.totalFullCost.toFixed(2)} €</span>
              </div>
              ` : ''}
              <div class="fin-row">
                <span class="fin-label">${t('s1.portions')}</span>
                <span class="fin-value">${costs.portions}</span>
              </div>
              <div class="fin-row highlight">
                <span class="fin-label">${costs.additionalCosts > 0 ? t('s4.adv.kpi.full_portion') : t('ui.kpi.per_portion')}</span>
                <span class="fin-value">${costs.costPerPortion.toFixed(2)} €</span>
              </div>
              <div class="fin-row highlight">
                <span class="fin-label">${t('ui.kpi.suggested_price')}</span>
                <span class="fin-value" style="color:var(--success)">${costs.sellingPrice.toFixed(2)} €</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Animations GSAP
    if (window.gsap) {
      gsap.from('.summary-section', {
        opacity: 0,
        y: 20,
        duration: 0.5,
        stagger: 0.1,
        ease: 'power2.out'
      });

      gsap.from('.summary-table tbody tr', {
        opacity: 0,
        x: -10,
        duration: 0.3,
        stagger: 0.03,
        delay: 0.3
      });
    }

    // Render Nutri-Score badge
    if (window.renderNutriBadge) {
      window.renderNutriBadge('summaryNutriBadge', r);
    }
    
    // Render Baseline comparison if active
    if (window.GourmetBaseline && APP.baselineCosts && APP.baselineCosts.recipeName === r.name) {
      window.GourmetBaseline.renderComparison();
    }
  }, 400);
}

// ============================================================================
// SAVE / LOAD / DELETE RECIPES
// ============================================================================


async function saveCurrentRecipe() {
  collectCurrentStepData();
  const r = APP.recipe;

  if (!r.name.trim()) {
    showToast(t('toast.recipe.name_required'), 'error');
    return;
  }

  // Si c'est une nouvelle recette (pas d'ID), on vérifie la limite du plan
  const isNew = !r.id;
  if (isNew) {
      if (window.GourmetBilling && !await GourmetBilling.canSaveRecipe()) {
          return; // Limite atteinte, canSaveRecipe affiche déjà le toast/upgrade
      }
      r.id = generateId();
  }

  const toSave = {
    ...JSON.parse(JSON.stringify(r)),
    savedAt: new Date().toISOString(),
    margin: APP.margin
  };

  // Update if exists, otherwise add
  const idx = APP.savedRecipes.findIndex(s => s.id === r.id);
  if (idx >= 0) {
    APP.savedRecipes[idx] = toSave;
  } else {
    APP.savedRecipes.push(toSave);
  }

  saveSavedRecipes();
  if (window.SousRecettes) {
    SousRecettes.syncToSupabase(r.id);
  }
  // Save new ingredients to DB
  r.ingredients.forEach(ing => {
    if (ing.name.trim() && ing.pricePerUnit > 0) {
      addToIngredientDb(ing);
    }
  });

  showToast(t('toast.recipe.saved'), 'success');
  renderSavedRecipes();
  updateDashboard();
}

async function loadRecipe(id) {
  const recipe = APP.savedRecipes.find(r => r.id === id);
  if (!recipe) return;

  APP.recipe = JSON.parse(JSON.stringify(recipe));
  APP.margin = recipe.margin || 70;
  APP.baselineCosts = null;

  populateStep1();

  // Reset initialization for advanced inputs
  ['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization', 'recipeTvaRate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) delete el.dataset.initialized;
  });

  goToStep(1);
  showToast(t('recipe.toast.loaded', { name: recipe.name }), 'success');

  if (window.SousRecettes) {
    await SousRecettes.loadFromSupabase(recipe.id);
  }
}

function deleteRecipe(id) {
  const idx = APP.savedRecipes.findIndex(r => r.id === id);
  if (idx >= 0) {
    const name = APP.savedRecipes[idx].name;
    APP.savedRecipes.splice(idx, 1);
    saveSavedRecipes();
    renderSavedRecipes();
    showToast(t('recipe.toast.deleted', { name }), 'success');
  }
}

function renderSavedRecipes() {
  const grid = $('#savedGrid');
  const empty = $('#savedEmpty');

  if (APP.savedRecipes.length === 0) {
    grid.innerHTML = '';
    empty.style.display = 'block';
    return;
  }

  empty.style.display = 'none';
  grid.innerHTML = APP.savedRecipes.map(r => {
    const costs = calcFullCost(r.margin || 70, r);
    const locale = (typeof getLang === 'function') ? (getLang() === 'en' ? 'en-GB' : (getLang() === 'es' ? 'es-ES' : 'fr-FR')) : 'fr-FR';
    const date = new Date(r.savedAt).toLocaleDateString(locale);

    const costLabel = costs.additionalCosts > 0 ? t('s4.adv.kpi.full_cost') : t('label.cost');

    return `
      <div class="saved-card" style="position:relative;">
        ${r._isOffline ? '<div class="sync-badge pending" style="position:absolute; top:1rem; right:1rem;">⏳ Hors Ligne</div>' : ''}
        <div class="sc-name">${escapeHtml(r.name)}</div>
        <div class="sc-meta">${escapeHtml(r.category || t('lab.cat.all'))} · ${r.portions} portions · ${date}</div>
        <div class="sc-cost">${costLabel}: ${costs.totalFullCost.toFixed(2)} € · ${costs.costPerPortion.toFixed(2)} €/${t('unit.portion')}</div>
        <div class="sc-nutri" style="margin:0.4rem 0;">${typeof renderNutriScoreBadge === 'function' ? renderNutriScoreBadge(r) : ''}</div>
        <div class="sc-actions">
          <button class="btn btn-outline btn-sm" onclick="loadRecipe('${r.id}')">${t('nav.home') === 'Home' ? 'Load' : (t('nav.home') === 'Inicio' ? 'Cargar' : 'Charger')}</button>
          <button class="btn btn-outline btn-sm" onclick="window.printDLCLabel('${r.id}', false)">🏷️</button>
          <button class="btn btn-danger btn-sm" onclick="deleteRecipe('${r.id}')">${t('nav.home') === 'Home' ? 'Delete' : (t('nav.home') === 'Inicio' ? 'Eliminar' : 'Supprimer')}</button>
        </div>
      </div>
    `;
  }).join('');
}

function toggleSavedRecipes() {
  const section = $('#savedSection');
  const isHidden = section.style.display === 'none';
  section.style.display = isHidden ? 'block' : 'none';
  if (isHidden) {
    renderSavedRecipes();
    section.scrollIntoView({ behavior: 'smooth' });
  }
}

// ============================================================================
// LOAD EXAMPLE RECIPE
// ============================================================================

// ============================================================================
// HELPERS
// ============================================================================

function loadExampleRecipe(idOrIdx) {
  const allRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];
  if (allRecipes.length === 0) {
    showToast(t('recipe.toast.not_found'), 'error');
    return;
  }

  const example = typeof idOrIdx === 'string'
    ? allRecipes.find(r => r.id === idOrIdx)
    : allRecipes[idOrIdx];

  if (!example) {
    showToast(t('recipe.toast.not_found'), 'error');
    return;
  }

  const displayName = t(`data.recipe.${example.id}.name`);
  const tName = displayName !== `data.recipe.${example.id}.name` ? displayName : example.name;

  const displayCat = t(example.category);
  const tCat = displayCat !== example.category ? displayCat : example.category;

  APP.recipe = {
    id: null,
    name: tName,
    category: tCat,
    portions: example.portions,
    prepTime: example.prepTime,
    cookTime: example.cookTime,
    description: (() => { const dk = `data.recipe.${example.id}.desc`; const dv = t(dk); return dv !== dk ? dv : example.description; })(),
    ingredients: example.ingredients.map(ing => {
      let unit = ing.unit;
      let pricePerUnit = 0;
      if (unit === 'pcs') unit = t('unit.piece');
      if (ing.pricePerKg !== undefined) { pricePerUnit = ing.pricePerKg; }
      else if (ing.pricePerL !== undefined) { pricePerUnit = ing.pricePerL; }
      else if (ing.pricePerPc !== undefined) { pricePerUnit = ing.pricePerPc; unit = t('unit.piece'); }

      // Keep the original name for the DB ingredients so t() can handle it
      return { name: ing.name, quantity: ing.quantity, unit, pricePerUnit };
    }),
    steps: example.steps.map((step, sIdx) => {
      const stepKey = `data.recipe.${example.id}.step.${sIdx}`;
      const tStep = t(stepKey);
      return tStep !== stepKey ? tStep : step;
    })
  };

  populateStep1();

  // Reset initialization for advanced inputs
  ['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization', 'recipeTvaRate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) delete el.dataset.initialized;
  });

  goToStep(1);
  showToast(t('recipe.toast.loaded', { name: APP.recipe.name }), 'success');
}

// Function to export a recipe directly from the library without loading it in the editor
function exportRecipePdfDirect(idx) {
  const allRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];
  if (allRecipes.length === 0 || idx >= allRecipes.length) return;

  const example = allRecipes[idx];
  // Dynamically generate the premium PDF using the same logic
  exportPdf(example, example.margin || 70);
}

// ============================================================================
// RECIPE LIBRARY (HUB EXPLORER)
// ============================================================================

let currentLibraryFilter = 'all';
let currentLibraryDomain = 'patisserie';

// Domains classification
const DOMAIN_BOULANGERIE = [
  'Boulangerie',
  'Viennoiserie', 
  'Viennoiseries',
  'Viennoiserie (PLF)',
  'Viennoiseries (PLF)',
  'Pâte levée',
  'Pâte levée feuilletée',
  'Pâtes levées feuilletées',
  'Brioche'
];

// Define a professional sort order for pastry categories
const LIBRARY_SORT_ORDER = [
  'Entremets', 
  'Bûche de Noël',
  'Tarte Signature', 
  'Tarte Fruits', 
  'Tarte Gourmande',
  'Tarte', 
  'Classique',
  'Classique Boutique',
  'Dessert Boutique',
  'Petits Gâteaux',
  'Petits Fours',
  'Pâtisserie Régionale',
  'Pâtisserie Toulousaine',
  'Pâte à choux', 
  'Choux & Feuilletage',
  'Dessert à l\'assiette',
  'Biscuit de Voyage',
  'Macaron',
  'Meringue',
  'Feuilletage',
  'Pâte levée',
  'Pâte levée feuilletée',
  'Pâtes levées feuilletées',
  'Brioche', 
  'Viennoiserie', 
  'Viennoiseries',
  'Viennoiserie (PLF)',
  'Viennoiseries (PLF)',
  'Boulangerie',
  'Chocolaterie',
  'Confiserie'
];

function sortLibraryByOrder(a, b) {
  const catA = a.category;
  const catB = b.category;
  
  if (catA === catB) {
    // If same category, sort alphabetically by name
    return a.name.localeCompare(b.name);
  }
  
  const idxA = LIBRARY_SORT_ORDER.indexOf(catA);
  const idxB = LIBRARY_SORT_ORDER.indexOf(catB);
  
  // If both in list, sort by list index
  if (idxA !== -1 && idxB !== -1) return idxA - idxB;
  // If only one in list, it comes first
  if (idxA !== -1) return -1;
  if (idxB !== -1) return 1;
  // If neither in list, sort alphabetically by category
  return catA.localeCompare(catB);
}

window.setLibraryDomain = function(domain) {
  currentLibraryDomain = domain;
  currentLibraryFilter = 'all'; // Reset category filter on domain switch
  
  // Update UI buttons
  const btnPatisserie = document.getElementById('btnLibDomainPatisserie');
  const btnBoulangerie = document.getElementById('btnLibDomainBoulangerie');
  
  if (btnPatisserie && btnBoulangerie) {
    if (domain === 'patisserie') {
      btnPatisserie.classList.add('active');
      btnBoulangerie.classList.remove('active');
    } else {
      btnBoulangerie.classList.add('active');
      btnPatisserie.classList.remove('active');
    }
  }
  
  renderLibraryRecipes();
};

function renderLibraryRecipes() {
  const container = $('#recipeLibraryGrid');
  const filtersContainer = $('#libraryFilters');
  if (!container) return;

  const allRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];
  if (allRecipes.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); padding: 2rem;">${t('library.none') || 'Aucune recette dans la bibliothèque.'}</p>`;
    return;
  }

  // Filter recipes by active domain
  const domainRecipes = allRecipes.filter(r => {
    const isBoulangerie = DOMAIN_BOULANGERIE.includes(r.category);
    return (currentLibraryDomain === 'boulangerie') ? isBoulangerie : !isBoulangerie;
  });

  // Populate Filters
  if (filtersContainer) {
    const rawCategories = Array.from(new Set(domainRecipes.map(r => r.category)));
    
    // Sort based on predefined order
    const sortedCategories = ['all', ...rawCategories.sort((a, b) => {
      const idxA = LIBRARY_SORT_ORDER.indexOf(a);
      const idxB = LIBRARY_SORT_ORDER.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.localeCompare(b);
    })];

    filtersContainer.innerHTML = sortedCategories.map(cat => {
      const label = cat === 'all' ? (t('filter.all') || 'Tout') : (t(cat) || cat);
      return `<button class="filter-chip ${cat === currentLibraryFilter ? 'active' : ''}" data-category="${cat}" onclick="setLibraryFilter('${cat}')">${label}</button>`;
    }).join('');
  }

  filterLibrary();
}

window.setLibraryFilter = function(cat) {
  currentLibraryFilter = cat;
  const chips = document.querySelectorAll('.filter-chip');
  chips.forEach(c => {
    c.classList.toggle('active', c.getAttribute('data-category') === cat);
  });
  filterLibrary();
};

window.filterLibrary = function() {
  const container = $('#recipeLibraryGrid');
  const searchInput = $('#librarySearchInput');
  if (!container) return;

  const query = searchInput ? searchInput.value.toLowerCase() : '';
  const allRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];

  // 1. Filter
  let filtered = allRecipes.filter(r => {
    const isBoulangerie = DOMAIN_BOULANGERIE.includes(r.category);
    const matchesDomain = (currentLibraryDomain === 'boulangerie') ? isBoulangerie : !isBoulangerie;

    const tName = t(`data.recipe.${r.id}.name`).toLowerCase();
    const name = r.name.toLowerCase();
    const tCat = t(r.category).toLowerCase();
    const cat = r.category.toLowerCase();
    
    const matchesSearch = name.includes(query) || tName.includes(query) || cat.includes(query) || tCat.includes(query);
    const matchesFilter = currentLibraryFilter === 'all' || r.category === currentLibraryFilter;
    
    return matchesDomain && matchesSearch && matchesFilter;
  });

  // 2. Sort by Order
  filtered.sort(sortLibraryByOrder);

  if (filtered.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); grid-column: 1/-1; text-align:center; padding: 4rem;">🔍 ${t('search.no_results') || 'Aucun résultat trouvé.'}</p>`;
    return;
  }

  container.innerHTML = filtered.map((r) => {
    const originalIdx = allRecipes.indexOf(r);
    
    let emoji = '🍰';
    const catLo = r.category.toLowerCase();
    if (catLo.includes('viennoiserie')) emoji = '🥐';
    else if (catLo.includes('boulangerie')) emoji = '🥖';
    else if (catLo.includes('chocolat')) emoji = '🍫';
    else if (catLo.includes('fruit') || catLo.includes('tarte')) emoji = '🍓';
    else if (catLo.includes('base')) emoji = '🥣';

    const tCatRaw = t(r.category);
    const tCat = tCatRaw !== r.category ? tCatRaw : r.category;
    const tNameRaw = t(`data.recipe.${r.id}.name`);
    const displayName = tNameRaw !== `data.recipe.${r.id}.name` ? tNameRaw : r.name;

    return `
      <div class="library-card" onclick="loadExampleRecipe(${originalIdx})">
        <div style="position:absolute; top:1.2rem; right:1.2rem; display:flex; gap:0.5rem; z-index:10; align-items:center;">
           <button class="library-card-pdf" onclick="event.stopPropagation(); exportRecipePdfDirect(${originalIdx})" title="${t('recipe.lib.export_pdf')}">📄 PDF</button>
           <button class="library-card-pdf" style="background:#10b981;" onclick="event.stopPropagation(); window.printDLCLabel('${r.id}', true)" title="Étiquette DLC">🏷️</button>
        </div>
        <div class="library-card-img-placeholder">${emoji}</div>
        <div class="library-card-category">${escapeHtml(tCat)}</div>
        <h4 class="library-card-title">${escapeHtml(displayName)}</h4>
        <div class="library-card-meta">
          <span>⏱ ${r.prepTime} min</span>
          <span>⚖️ ${r.portions || '10'} ${t('unit.portions')}</span>
        </div>
      </div>
    `;
  }).join('');
};

    // Removed legacy carousel drag logic


// ============================================================================
// PORTFOLIO
// ============================================================================

function renderPortfolio() {
  const container = $('#portfolioGallery');
  if (!container) return;

  // We reuse the beautifully crafted recipes from data.js
  let allRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];

  // Filter to show only specific portfolio items requested by user
  const portfolioFilter = [
    'saint-honore',
    'negresco',
    'frangipane',
    'mille-feuille',
    'paris-brest',
    'tarte-citron-meringuee',
    'tarte-chocolat-poire-fleur',
    'tarte-fruits-rouges-fleur',
    'tarte-praline-fleur',
    'tarte-framboise-pistache-fleur',
    'croissant',
    'pain-au-chocolat'
  ];

  allRecipes = allRecipes.filter(r => portfolioFilter.includes(r.id));

  // Re-order to match user's requested sequence if possible
  allRecipes.sort((a, b) => portfolioFilter.indexOf(a.id) - portfolioFilter.indexOf(b.id));

  if (allRecipes.length === 0) {
    container.innerHTML = `<p style="text-align:center; color:var(--text-muted); width:100%;">${t('portfolio.empty')}</p>`;
    return;
  }

  // Generate cards
  container.innerHTML = allRecipes.map((r, idx) => {
    // Generate an abstract pastel color hash based on the id just in case there's no image
    const hue = (idx * 137.5) % 360;
    const fallBackColor = `hsl(${hue}, 70%, 85%)`;

    // Specific styling for certain images (dezoom, zoom or position)
    const dezoomIds = [];
    const zoomIds = [];
    let extraClass = dezoomIds.includes(r.id) ? ' dezoom' : '';
    if (zoomIds.includes(r.id)) extraClass += ' zoom-in';
    
    let extraStyle = '';
    if (r.id === 'saint-honore') extraStyle = ' style="object-position: top;"';

    // Translation logic
    const tCatRaw = t(r.category);
    const tCat = tCatRaw !== r.category ? tCatRaw : r.category;
    const tNameRaw = t(`data.recipe.${r.id}.name`);
    const displayName = tNameRaw !== `data.recipe.${r.id}.name` ? tNameRaw : r.name;

    // We use the image from local if provided, otherwise fallback background
    const imgOrFallback = r.image
      ? `<img class="portfolio-img${extraClass}" src="${r.image}" alt="${escapeHtml(displayName)}"${extraStyle} onerror="this.onerror=null; this.src=''; this.parentElement.style.background='${fallBackColor}'; this.style.display='none';">`
      : `<div style="width:100%; height:100%; background:${fallBackColor};"></div>`;

    return `
      <div class="portfolio-item" onclick="loadExampleRecipe('${r.id}'); document.getElementById('navRecettes').click();">
        ${imgOrFallback}
        <div class="portfolio-overlay">
          <h3 class="portfolio-title">${escapeHtml(displayName)}</h3>
          <span class="portfolio-category">${escapeHtml(tCat)}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// EXPORT — JSON
// ============================================================================

function exportJson() {
  collectCurrentStepData();
  const data = JSON.stringify(APP.recipe, null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${APP.recipe.name || 'recette'}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  showToast(t('toast.recipe.exported_json'), 'success');
}

// ============================================================================
// EXPORT — PDF
// ============================================================================

function getIngCategory(name) {
   const lower = name.toLowerCase();
   if (lower.match(/farine|beurre|levure|sel|pâte/)) return { badge: '🍪 Base & Pâte', color: '#92400e', bg: '#fef3c7' };
   if (lower.match(/fruit|pomme|fraise|citron|jus|poire/)) return { badge: '🍋 Fruits & Acidité', color: '#1d4ed8', bg: '#dbeafe' };
   if (lower.match(/chocolat|cacao|praliné|noisette|amande/)) return { badge: '🍫 Chocolat & Noisettes', color: '#7c2d12', bg: '#ffedd5' };
   if (lower.match(/crème|lait|mascarpone|oeuf|œuf/)) return { badge: '🥛 Crèmes & Laitages', color: '#0369a1', bg: '#e0f2fe' };
   if (lower.match(/sucre|blanc|gélatine/)) return { badge: '🔮 Structure & Sucres', color: '#6d28d9', bg: '#ede9fe' };
   return { badge: '✨ Divers', color: '#065f46', bg: '#d1fae5' };
}

function getHaccp(text) {
   const lower = text.toLowerCase();
   if (lower.match(/cuir|cuisson|four|bouill|chauff|1[0-9]{2}°/)) return `<span style="background:#fef3c7; color:#b45309; padding:2px 6px; font-size:0.55rem; font-weight:700; border-radius:4px; text-transform:uppercase; letter-spacing:0.05em;">🔥 CC1 — Cuisson</span>`;
   if (lower.match(/froid|réfrigé|congéla|refroid|glace/)) return `<span style="background:#dbeafe; color:#1e40af; padding:2px 6px; font-size:0.55rem; font-weight:700; border-radius:4px; text-transform:uppercase; letter-spacing:0.05em;">❄️ CC2 — Froid</span>`;
   if (lower.match(/montage|poche/)) return `<span style="background:#d1fae5; color:#065f46; padding:2px 6px; font-size:0.55rem; font-weight:700; border-radius:4px; text-transform:uppercase; letter-spacing:0.05em;">🛡️ Hygiène</span>`;
   return '';
}

function exportPdf(recipeToExport = null, marginToExport = null) {
  const r = recipeToExport || APP.recipe;
  if (!r || !r.name) { showToast('Erreur: Aucune recette chargée.', 'error'); return; }

  const targetMargin = marginToExport !== null ? marginToExport : APP.margin;
  const costs = calcFullCost(targetMargin, r);
  const recipeName = r.name || 'Recette';
  showToast(`Génération de la fiche technique de ${recipeName}...`, 'info');

  const safeFilename = recipeName.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const today = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const refId = r.ref || 'FT-' + (recipeName.replace(/[^a-zA-Z0-9]/g, '').substring(0, 6).toUpperCase() || 'REC');
  const margin = Math.round(costs.marginPct || targetMargin || 70);
  const totalMat = (costs.totalMaterial || 0).toFixed(2);
  const sellPrice = (costs.sellingPrice || 0).toFixed(2);
  const tvaRate = costs.tvaRate !== undefined ? costs.tvaRate : 5.5;
  const tvaAmount = (costs.tvaAmount !== undefined ? costs.tvaAmount : ((costs.sellingPrice || 0) * 0.055)).toFixed(2);
  const tvaTTC = (costs.sellingPriceTTC !== undefined ? costs.sellingPriceTTC : ((costs.sellingPrice || 0) * 1.055)).toFixed(2);
  const portions = r.portions || 10;
  const prepTime = r.prepTime ? `${r.prepTime} min` : '—';
  const cookTime = r.cookTime ? `${r.cookTime} min` : '—';
  const category = r.category || r.style || 'Pâtisserie';
  const user = localStorage.getItem('gourmet_current_user') || 'Chef Julian';
  const totalTime = (r.prepTime || 0) + (r.cookTime || 0);

  // DESIGN 1 — Palette de couleurs cohérente
  const PALETTE = {
    noir:        '#0f0f0f',
    indigo:      '#3730a3',
    indigoClair: '#eef2ff',
    indigoMoyen: '#4f46e5',
    or:          '#b8960c',
    orClair:     '#fefce8',
    gris1:       '#f8fafc',
    gris2:       '#e2e8f0',
    gris3:       '#94a3b8',
    gris4:       '#475569',
    blanc:       '#ffffff',
    rouge:       '#dc2626',
    vert:        '#166534',
    vertClair:   '#f0fdf4',
  };

  function esc(str) { return typeof str !== 'string' ? String(str || '') : str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

  // DESIGN 9 — Indicateur visuel de niveau de difficulté
  function renderNiveau(niveau) {
    const niveaux = ['●', '●', '●', '●', '●'];
    return niveaux.map((dot, i) => 
      `<span style="color:${i < niveau ? '#3730a3' : '#e2e8f0'}; font-size:10px; margin-right:2px;">●</span>`
    ).join('');
  }

  // DESIGN 10 — Filigrane discret
  const filigraneHTML = `
    <div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-45deg); font-size:72px; font-weight:900; color:rgba(55,48,163,0.03); letter-spacing:0.1em; pointer-events:none; white-space:nowrap; z-index:0; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      GOURMETREVIENT
    </div>`;

  // DESIGN 2 — Header repensé
  const headerHTML = `
    <div style="display:flex; min-height:100px; border-bottom: 3px solid #3730a3; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; background:#fff;">
      <div style="flex:0.6; padding:24px 28px; background:#fff; text-align:left;">
        <div style="font-size:9px; color:#4f46e5; font-weight:600; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:16px;">
          GourmetRevient · Solution Pâtisserie Pro
        </div>
        <div style="display:inline-block; background:#eef2ff; color:#3730a3; font-size:8px; font-weight:600; padding:3px 8px; border-radius:4px; letter-spacing:0.05em; text-transform:uppercase; margin-bottom:10px;">
          Fiche Technique Intégrale
        </div>
        <div style="font-size:26px; font-weight:700; color:#0f0f0f; letter-spacing:-0.02em; line-height:1.1;">${esc(recipeName)}</div>
        <div style="font-size:11px; color:#94a3b8; margin-top:6px;">${esc(category)} — ${esc(r.description || 'Production en laboratoire')}</div>
      </div>
      <div style="flex:0.4; padding:24px 24px; background:#3730a3; color:#fff; text-align:right;">
        <div style="font-size:10px; color:#c7d2fe; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.15);">
          <span style="color:rgba(255,255,255,0.6)">Réf · </span>${esc(refId)}
        </div>
        <div style="font-size:10px; color:#c7d2fe; margin-bottom:8px; padding-bottom:8px; border-bottom:1px solid rgba(255,255,255,0.15);">
          <span style="color:rgba(255,255,255,0.6)">Date · </span>${today}
        </div>
        <div style="font-size:10px; color:#c7d2fe;">
          <span style="color:rgba(255,255,255,0.6)">Validée par · </span>${esc(user)}
        </div>
      </div>
    </div>`;

  // DESIGN 3 — Bande KPI redessinée
  const kpiHTML = `
    <div style="display:grid; grid-template-columns:repeat(5,1fr); gap:0; border-bottom:2px solid #e2e8f0; background:#f8fafc; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      ${[
        { label:'PORTIONS', value: portions, unit:'', color:'#0f0f0f' },
        { label:'COÛT MATIÈRE', value: parseFloat(totalMat).toFixed(2), unit:'€', color:'#4f46e5' },
        { label:'MARGE BRUTE', value: margin + '%', unit:'', color: margin >= 60 ? '#166534' : '#dc2626' },
        { label:'PRIX VENTE HT', value: parseFloat(sellPrice).toFixed(2), unit:'€', color:'#b8960c' },
        { label:'TEMPS TOTAL', value: totalTime || '-', unit:'min', color:'#64748b' },
      ].map((kpi, i) => `
        <div style="padding:16px 12px; text-align:center; ${i < 4 ? 'border-right:1px solid #e2e8f0;' : ''}">
          <div style="font-size:22px; font-weight:700; color:${kpi.color}; letter-spacing:-0.02em; line-height:1;">${kpi.value}${kpi.unit}</div>
          <div style="font-size:8px; color:#94a3b8; letter-spacing:0.1em; text-transform:uppercase; margin-top:6px; font-weight:500;">${kpi.label}</div>
        </div>`).join('')}
    </div>`;

  // DESIGN 4 — Table des ingrédients redessinée
  // Couleurs catégories — sobre et professionnel
  const CATEGORIE_STYLES = {
    'BASE & PÂTE':        { bg: '#eef2ff', color: '#3730a3', label: 'BASE & PÂTE' },
    'CRÈMES & LAITAGES':  { bg: '#f0fdf4', color: '#166534', label: 'CRÈMES & LAITAGES' },
    'STRUCTURE & SUCRES': { bg: '#fefce8', color: '#854d0e', label: 'STRUCTURE & SUCRES' },
    'DIVERS':             { bg: '#faf5ff', color: '#6b21a8', label: 'DIVERS' },
    'CHOCOLAT & NOISETTES': { bg: '#ffedd5', color: '#7c2d12', label: 'CHOCOLAT & NOISETTES' },
    'FRUITS & ACIDITÉ':   { bg: '#ecfeff', color: '#0891b2', label: 'FRUITS & ACIDITÉ' }
  };

  function getPdfCategoryStyle(badge) {
    const cleanBadge = badge.replace(/[^a-zA-Z0-9\s&]/g, '').trim().toUpperCase();
    if (cleanBadge.includes('BASE')) {
      return CATEGORIE_STYLES['BASE & PÂTE'];
    } else if (cleanBadge.includes('CRME') || cleanBadge.includes('LAIT') || cleanBadge.includes('CREME')) {
      return CATEGORIE_STYLES['CRÈMES & LAITAGES'];
    } else if (cleanBadge.includes('STRUCTURE') || cleanBadge.includes('SUCRE')) {
      return CATEGORIE_STYLES['STRUCTURE & SUCRES'];
    } else if (cleanBadge.includes('CHOCOLAT') || cleanBadge.includes('NOISETTE')) {
      return CATEGORIE_STYLES['CHOCOLAT & NOISETTES'];
    } else if (cleanBadge.includes('FRUIT') || cleanBadge.includes('ACIDIT')) {
      return CATEGORIE_STYLES['FRUITS & ACIDITÉ'];
    } else {
      return CATEGORIE_STYLES['DIVERS'];
    }
  }

  const groups = {};
  (r.ingredients || []).forEach(ing => {
    const cat = getIngCategory(ing.name||'');
    if(!groups[cat.badge]) groups[cat.badge] = { meta: cat, items: [] };
    groups[cat.badge].items.push(ing);
  });

  let ingRows = '';
  let rowCounter = 0;
  for (let key in groups) {
    const style = getPdfCategoryStyle(key);
    ingRows += `<tr><td colspan="5" style="padding:6px 12px; background:${style.bg}; color:${style.color}; font-size:9px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em; border-bottom:1px solid #e2e8f0; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-align:left;">${style.label}</td></tr>`;
    
    groups[key].items.forEach(ing => {
      const isEven = (rowCounter % 2 === 0);
      const rowBg = isEven ? '#f8fafc' : '#ffffff';
      rowCounter++;

      const qty = ing.quantity || ing.qty || 0;
      const unit = ing.unit || 'g';
      const ingCost = calcIngredientCost(ing).toFixed(2);
      const priceU = ing.pricePerUnit ? `${parseFloat(ing.pricePerUnit).toFixed(2)} &euro;/${esc(ing.priceRef||'kg')}` : '—';
      const note = ing.note || ing.description || '';

      ingRows += `
        <tr style="background:${rowBg}; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
          <td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; vertical-align:middle; text-align:left;">
            <span style="font-weight:600; color:#0f0f0f; font-size:10px;">${esc(ing.name||'—')}</span>
            ${note ? `<div style="font-size:8px; color:#94a3b8; margin-top:2px;">${esc(note)}</div>` : ''}
          </td>
          <td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; vertical-align:middle; text-align:left; font-size:10px; color:#475569;">${qty}</td>
          <td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; vertical-align:middle; text-align:left; font-size:10px; color:#475569;">${esc(unit)}</td>
          <td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; vertical-align:middle; text-align:left; font-size:10px; color:#475569;">${priceU}</td>
          <td style="padding:6px 12px; border-bottom:1px solid #e2e8f0; vertical-align:middle; text-align:right; font-weight:700; color:#0f0f0f; font-size:10px;">${ingCost} &euro;</td>
        </tr>
      `;
    });
  }

  // DESIGN 5 — Side Column and Allergens Monochrome
  const allergens = r.allergens && r.allergens.length > 0
    ? r.allergens
    : ['Gluten', 'Œufs', 'Lait'];

  const allergenListHTML = allergens.map(a => {
    const cleanAllergen = a.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const isMajor = cleanAllergen.includes('gluten') || cleanAllergen.includes('lait') || cleanAllergen.includes('oeuf') || cleanAllergen.includes('œuf') || cleanAllergen.includes('arachide') || cleanAllergen.includes('noix') || cleanAllergen.includes('fruit a coque');
    
    if (isMajor) {
      return `<span style="background:#fef2f2; color:#991b1b; border:1px solid #fecaca; border-radius:4px; padding:3px 8px; font-size:9px; font-weight:600; text-transform:uppercase; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; display:inline-block; margin-right:4px; margin-bottom:4px;">${esc(a)}</span>`;
    } else {
      return `<span style="background:#f1f5f9; color:#1e293b; border:1px solid #cbd5e1; border-radius:4px; padding:3px 8px; font-size:9px; font-weight:600; text-transform:uppercase; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; display:inline-block; margin-right:4px; margin-bottom:4px;">${esc(a)}</span>`;
    }
  }).join('');

  // DESIGN 6 — Protocole de production redessiné
  const steps = r.steps || r.instructions || [];
  let stepsHtml = '';
  if (steps.length > 0) {
    stepsHtml = steps.slice(0, 8).map((step, i) => {
      const title = typeof step === 'string' ? `Étape ${i + 1}` : (step.title || step.name || `Étape ${i + 1}`);
      const desc = typeof step === 'string' ? step : (step.description || step.text || '');
      const temp = step && step.temperature ? `🌡️ ${step.temperature}` : '';
      
      const lowerDesc = desc.toLowerCase();
      let type = 'base';
      if (lowerDesc.match(/cuir|cuisson|four|bouill|chauff|1[0-9]{2}°/)) {
        type = 'cuisson';
      } else if (lowerDesc.match(/froid|réfrigé|congéla|refroid|glace/)) {
        type = 'froid';
      }
      
      let haccpTag = '';
      if (type === 'cuisson') haccpTag = 'CC1 — Cuisson';
      else if (type === 'froid') haccpTag = 'CC2 — Froid';
      else if (lowerDesc.match(/montage|poche/)) haccpTag = 'Hygiène';
      
      return `
      <div style="display:flex; gap:14px; padding:14px 0; border-bottom:1px solid #f1f5f9; align-items:flex-start; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-align:left;">
        <div style="width:28px; height:28px; border-radius:50%; background:${type === 'cuisson' ? '#fef3c7' : type === 'froid' ? '#eff6ff' : '#eef2ff'}; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
          <span style="font-size:11px; font-weight:700; color:${type === 'cuisson' ? '#92400e' : type === 'froid' ? '#1e40af' : '#3730a3'};">${i + 1}</span>
        </div>
        <div style="flex:1;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
            <span style="font-size:11px; font-weight:600; color:#0f0f0f;">${esc(title)}</span>
            ${haccpTag ? `<span style="font-size:8px; font-weight:600; padding:2px 8px; border-radius:20px; background:${type === 'cuisson' ? '#fef3c7' : '#eff6ff'}; color:${type === 'cuisson' ? '#92400e' : '#1e40af'}; letter-spacing:0.05em;">${haccpTag}</span>` : ''}
          </div>
          <div style="font-size:11px; color:#475569; line-height:1.6;">${esc(desc)}</div>
          ${temp ? `<div style="font-size:10px; color:#dc2626; font-weight:600; margin-top:4px;">🌡️ ${esc(temp)}</div>` : ''}
        </div>
      </div>`;
    }).join('');
  } else {
    stepsHtml = `
    <div style="display:flex; gap:14px; padding:14px 0; border-bottom:1px solid #f1f5f9; align-items:flex-start; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-align:left;">
      <div style="width:28px; height:28px; border-radius:50%; background:#eef2ff; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
        <span style="font-size:11px; font-weight:700; color:#3730a3;">1</span>
      </div>
      <div style="flex:1;">
        <div style="font-size:11px; font-weight:600; color:#0f0f0f; margin-bottom:4px;">Procédé de fabrication</div>
        <div style="font-size:11px; color:#475569; line-height:1.6;">${esc(r.description || 'Suivre le protocole de production défini pour cette recette.')}</div>
      </div>
    </div>`;
  }

  // DESIGN 7 — Footer premium
  const footerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 28px; border-top:2px solid #3730a3; margin-top:24px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
      <div style="font-size:8px; color:#94a3b8; text-align:left;">
        <span style="color:#3730a3; font-weight:600;">GourmetRevient</span> · Fiche Technique Premium · gourmetrevient.fr
      </div>
      <div style="font-size:8px; color:#94a3b8; text-align:center;">
        ${esc(recipeName)} · Réf. ${esc(refId)} · © ${new Date().getFullYear()}
      </div>
      <div style="font-size:8px; color:#94a3b8; text-align:right;">
        Document confidentiel · Usage interne uniquement
      </div>
    </div>`;

  // DESIGN 8 — Main body and side column layout
  const html = `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <title>Fiche Technique - ${esc(recipeName)}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background: #ffffff;
      color: #0f0f0f;
      line-height: 1.6;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
      position: relative;
    }
  </style>
</head>
<body style="padding: 24px 28px; background: #ffffff;">
  ${filigraneHTML}
  <div style="position: relative; z-index: 1;">
    ${headerHTML}
    ${kpiHTML}
    
    <div style="display:grid; grid-template-columns: 1fr 220px; gap: 24px; margin-top: 20px; background: #ffffff;">
      <!-- Main Column -->
      <div class="main-col" style="display:flex; flex-direction:column; gap:20px;">
        <div>
          <div style="border-left: 2px solid #3730a3; padding-left: 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3730a3; margin-bottom: 12px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-align:left;">
            COMPOSITION HARMONISÉE
          </div>
          <table style="width:100%; border-collapse:collapse; font-size:11px; border-radius:8px; overflow:hidden; box-shadow:0 1px 3px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
            <thead>
              <tr style="background:#0f0f0f; color:#ffffff; text-transform:uppercase; font-size:8px; letter-spacing:0.1em; text-align:left;">
                <th style="padding:10px 12px; font-weight:700;">Ingrédient</th>
                <th style="padding:10px 12px; font-weight:700;">Qté</th>
                <th style="padding:10px 12px; font-weight:700;">Unité</th>
                <th style="padding:10px 12px; font-weight:700;">Prix U.</th>
                <th style="padding:10px 12px; text-align:right; font-weight:700;">Coût</th>
              </tr>
            </thead>
            <tbody>
              ${ingRows || '<tr><td colspan="5" style="text-align:center;color:#94a3b8;padding:20px">Aucun ingrédient enregistré</td></tr>'}
              <tr style="background:#0f0f0f; color:#ffffff; font-weight:700;">
                <td colspan="4" style="text-align:right; font-size:9px; letter-spacing:0.08em; padding:10px 12px;">TOTAL MATIÈRE</td>
                <td style="text-align:right; padding:10px 12px; font-size:10px;">${totalMat} €</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div>
          <div style="border-left: 2px solid #3730a3; padding-left: 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3730a3; margin-bottom: 12px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-align:left;">
            PROTOCOLE DE PRODUCTION
          </div>
          <div>
            ${stepsHtml}
          </div>
        </div>
      </div>
      
      <!-- Side Column -->
      <div class="side-col" style="display:flex; flex-direction:column; gap:16px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
        <!-- Infos Recette -->
        <div>
          <div style="border-left: 2px solid #3730a3; padding-left: 8px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3730a3; margin-bottom: 8px; text-align:left;">
            INFO RECETTE
          </div>
          <div style="background:#f8fafc; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:10px; border-bottom:1px dotted #e2e8f0;">
              <span style="color:#64748b;">Catégorie</span>
              <span style="font-weight:700; color:#0f0f0f;">${esc(category)}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:10px; border-bottom:1px dotted #e2e8f0;">
              <span style="color:#64748b;">Portions</span>
              <span style="font-weight:700; color:#0f0f0f;">${portions}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:10px; border-bottom:1px dotted #e2e8f0;">
              <span style="color:#64748b;">Préparation</span>
              <span style="font-weight:700; color:#0f0f0f;">${prepTime}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:10px; ${r.difficulty ? 'border-bottom:1px dotted #e2e8f0;' : ''}">
              <span style="color:#64748b;">Cuisson</span>
              <span style="font-weight:700; color:#0f0f0f;">${cookTime}</span>
            </div>
            ${r.difficulty ? `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:10px;">
              <span style="color:#64748b;">Niveau</span>
              <span style="font-weight:700; color:#0f0f0f;">${renderNiveau(parseInt(r.difficulty) || 3)}</span>
            </div>` : ''}
          </div>
        </div>

        <!-- Rentabilité -->
        <div>
          <div style="border-left: 2px solid #3730a3; padding-left: 8px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3730a3; margin-bottom: 8px; text-align:left;">
            SYNTHÈSE RENTABILITÉ
          </div>
          <div style="background:#f8fafc; padding:12px; border-radius:6px; border:1px solid #e2e8f0;">
            <div style="display:flex; justify-content:space-between; font-size:10px; margin-bottom:6px;">
              <span style="color:#64748b;">Marge brute</span>
              <span style="font-weight:700; color:#3730a3;">${margin} %</span>
            </div>
            <div style="background:#e2e8f0; border-radius:20px; height:6px; overflow:hidden; margin-bottom:12px; width:100%;">
              <div style="height:100%; border-radius:20px; background:linear-gradient(90deg, #4f46e5, #06b6d4); width:${Math.min(margin, 100)}%;"></div>
            </div>
            
            <div style="font-size:10px;">
              <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;">Coût matière</span>
                <span style="font-weight:700; color:#0f0f0f;">${totalMat} €</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;">Prix vente HT</span>
                <span style="font-weight:700; color:#0f0f0f;">${sellPrice} €</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
                <span style="color:#64748b;">TVA (${tvaRate}%)</span>
                <span style="font-weight:700; color:#0f0f0f;">${tvaAmount} €</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding:6px 0 0 0; align-items:center;">
                <span style="color:#3730a3; font-weight:700;">Prix TTC</span>
                <span style="font-size:14px; font-weight:700; color:#3730a3;">${tvaTTC} €</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Allergènes -->
        <div>
          <div style="border-left: 2px solid #3730a3; padding-left: 8px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3730a3; margin-bottom: 8px; text-align:left;">
            ALLERGÈNES
          </div>
          <div style="background:#f8fafc; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0; display:flex; flex-wrap:wrap; gap:4px; text-align:left;">
            ${allergenListHTML || '<span style="font-size:10px; color:#94a3b8;">Aucun</span>'}
          </div>
        </div>

        <!-- HACCP -->
        <div>
          <div style="border-left: 2px solid #3730a3; padding-left: 8px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3730a3; margin-bottom: 8px; text-align:left;">
            HYGIÈNE & HACCP
          </div>
          <div style="background:#f8fafc; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0;">
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:10px; border-bottom:1px dotted #e2e8f0;">
              <span style="color:#64748b;">Stockage</span>
              <span style="font-weight:700; color:#3730a3;">0–4 °C</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:10px; border-bottom:1px dotted #e2e8f0;">
              <span style="color:#64748b;">DLC</span>
              <span style="font-weight:700; color:#dc2626;">48 h max</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; padding:4px 0; font-size:10px;">
              <span style="color:#64748b;">Service</span>
              <span style="font-weight:700; color:#3730a3;">2–4 °C</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    ${footerHTML}
  </div>
</body>
</html>`;

  if (typeof html2pdf === 'undefined') { showToast('Bibliothèque html2pdf non chargée', 'error'); return; }
  html2pdf().set({ margin:0, filename:`${safeFilename}_fiche.pdf`, image:{type:'jpeg',quality:.98}, html2canvas:{scale:2,useCORS:true,logging:false}, jsPDF:{unit:'mm',format:'a4',orientation:'portrait'} }).from(html).save().then(() => showToast('Fiche technique exportée ✓','success')).catch(err => { console.error(err); showToast('Erreur PDF','error'); });
}

function exportDevisPdf() {
  const recipeName = APP.recipe.name || 'Prestation';
  const costs = calcFullCost(APP.margin);

  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.zIndex = '-9999';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';

  const quoteDiv = document.createElement('div');
  quoteDiv.style.padding = '40px';
  quoteDiv.style.fontFamily = "'Inter', Arial, sans-serif";
  quoteDiv.style.color = '#1a202c';
  quoteDiv.style.backgroundColor = '#ffffff';
  quoteDiv.style.width = '100%';
  quoteDiv.classList.add('pdf-export-mode');

  quoteDiv.innerHTML = `
    <div style="border-bottom:3px solid #10b981; padding-bottom:20px; margin-bottom:30px; display:flex; justify-content:space-between; align-items:flex-end;">
      <div>
        <h1 style="color:#10b981; margin:0; font-size:2.5rem; font-weight:900;">DEVIS CLIENT</h1>
        <p style="margin:5px 0 0; color:#4a5568; font-size:1.1rem;">GourmetRevient — Solution Pâtissière Pro</p>
      </div>
      <div style="text-align:right;">
        <p style="margin:5px 0 0; color:#4a5568;"><strong>Date:</strong> ${new Date().toLocaleDateString()}</p>
        <p style="margin:2px 0 0; color:#718096; font-size:0.8rem;">Réf: DEVIS-${Date.now().toString().slice(-6)}</p>
      </div>
    </div>
    
    <div style="margin-bottom:40px; background:#f8fafc; padding:25px; border-radius:12px; border:1px solid #e2e8f0;">
      <h3 style="margin:0 0 15px; color:#2d3748; text-transform:uppercase; font-size:0.9rem; letter-spacing:1px;">Prestation détaillée</h3>
      <p style="font-size:1.4rem; font-weight:800; color:#1a202c; margin-bottom:10px;">${recipeName}</p>
      <p style="color:#4a5568; margin-bottom:15px; line-height:1.6;">${APP.recipe.description || 'Réalisation artisanale personnalisée selon vos exigences de qualité.'}</p>
      <div style="display:inline-block; background:#10b981; color:white; padding:4px 12px; border-radius:20px; font-size:0.85rem; font-weight:700;">
        Qté : ${APP.recipe.portions} portions
      </div>
    </div>
    
    <table style="width:100%; border-collapse:collapse; margin-bottom:40px;">
      <thead>
        <tr style="background:#1a202c; color:#ffffff; text-align:left;">
          <th style="padding:15px; border-radius:8px 0 0 0;">Description</th>
          <th style="padding:15px; text-align:center;">Unité</th>
          <th style="padding:15px; text-align:right;">P.U HT</th>
          <th style="padding:15px; text-align:right; border-radius:0 8px 0 0;">Total HT</th>
        </tr>
      </thead>
      <tbody>
        <tr style="border-bottom:1px solid #e2e8f0;">
          <td style="padding:20px 15px;">
            <strong>${recipeName}</strong><br>
            <small style="color:#718096;">Fiche technique professionnelle</small>
          </td>
          <td style="padding:20px 15px; text-align:center;">${APP.recipe.portions}</td>
          <td style="padding:20px 15px; text-align:right;">${costs.sellingPrice.toFixed(2)} €</td>
          <td style="padding:20px 15px; text-align:right; font-weight:700;">${(costs.sellingPrice * APP.recipe.portions).toFixed(2)} €</td>
        </tr>
      </tbody>
    </table>

    <div style="display:flex; justify-content:flex-end;">
      <div style="width:300px; background:#f8fafc; padding:20px; border-radius:12px; border:1px solid #e2e8f0;">
        <div style="display:flex; justify-content:space-between; margin-bottom:12px; color:#4a5568; font-weight:600;">
          <span>TOTAL HT</span>
          <span>${(costs.sellingPrice * APP.recipe.portions).toFixed(2)} €</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:12px; color:#4a5568;">
          <span>TVA (${costs.tvaRate}%)</span>
          <span>${(costs.tvaAmount * APP.recipe.portions).toFixed(2)} €</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:1.5rem; font-weight:900; border-top:2px solid #1a202c; padding-top:12px; margin-top:5px;">
          <span>TOTAL TTC</span>
          <span style="color:#10b981;">${(costs.sellingPriceTTC * APP.recipe.portions).toFixed(2)} €</span>
        </div>
      </div>
    </div>

    <div style="margin-top:60px; font-size:0.8rem; color:#718096; border-top:1px solid #e2e8f0; padding-top:25px; text-align:center;">
      <p>Conditions de règlement : À réception · Devis valable 30 jours</p>
      <p style="margin-top:8px; font-weight:700; color:#1a202c;">GourmetRevient — L'Excellence Artisanale au service de votre rentabilité</p>
    </div>
  `;

  container.appendChild(quoteDiv);
  document.body.appendChild(container);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Devis_${recipeName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      useCORS: true, 
      backgroundColor: '#ffffff',
      windowWidth: 800,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  showToast('Génération du devis PDF...', 'info');

  setTimeout(() => {
    html2pdf().from(container).set(opt).save().then(() => {
      document.body.removeChild(container);
      showToast('Devis exporté avec succès !', 'success');
    }).catch(err => {
      console.error("Devis PDF Error:", err);
      showToast("Erreur lors de l'export du devis.", "error");
      if (document.body.contains(container)) document.body.removeChild(container);
    });
  }, 1000);
}
