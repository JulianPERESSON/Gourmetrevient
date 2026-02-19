/*
  =====================================================================
  SIMULATOR.JS — Simulateur de Coût de Revient V2
  Features: real-time calc, Chart.js, html2pdf.js export, custom recipes
  =====================================================================
*/

// ============================================================================
// PASTRY IMAGES (local)
// ============================================================================

const PASTRY_IMAGES = {
    'mille-feuille': './img/mille-feuille.jpg',
    'paris-brest': './img/paris-brest.jpg',
    'opera': './img/opera.jpg',
    'saint-honore': './img/saint-honore.jpg',
    'fraisier': './img/fraisier.jpg',
    'tarte-tatin': './img/tarte-tatin.jpg',
    'eclair': './img/eclair.jpg',
    'baba-au-rhum': './img/baba-au-rhum.jpg',
    'macaron': './img/macaron.jpg',
    'foret-noire': './img/foret-noire.jpg',
    'croissant': './img/croissant.jpg',
    'pain-au-chocolat': './img/pain-au-chocolat.jpg'
};

// ============================================================================
// CUSTOM RECIPES (localStorage)
// ============================================================================

// Custom Recipes (handled by auth.js)
// getAllRecipes(), loadCustomRecipes(), saveCustomRecipes() available via auth.js

// ============================================================================
// STATE
// ============================================================================

let currentRecipe = null;
let currentQualityIndex = 2; // Artisanal by default
let breakdownChart = null;
let comparisonChart = null;

// ============================================================================
// DOM REFERENCES
// ============================================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
    const params = new URLSearchParams(window.location.search);
    const recipeId = params.get('recipe') || 'mille-feuille';
    const tabId = params.get('tab');

    const allRecipes = getAllRecipes();
    currentRecipe = allRecipes.find(r => r.id === recipeId);
    if (!currentRecipe) {
        currentRecipe = allRecipes[0];
    }

    renderHero();
    renderQualitySlider();
    renderIngredients();
    renderParams();
    recalculate();
    renderRecipeNav();
    initCharts();
    bindEvents();

    // Auto-switch tab if requested (V5.1)
    if (tabId === 'technical') {
        const techBtn = $('.tab-btn[data-tab="technical"]');
        if (techBtn) techBtn.click();
    }
}

// ============================================================================
// HERO SECTION
// ============================================================================

function renderHero() {
    const imgSrc = PASTRY_IMAGES[currentRecipe.id] || './img/mille-feuille.jpg';
    $('#heroImg').src = imgSrc;
    $('#heroImg').alt = currentRecipe.name;
    $('#heroCategory').textContent = currentRecipe.category || 'Pâtisserie';
    $('#heroName').textContent = currentRecipe.name;
    $('#heroDesc').textContent = currentRecipe.description || '';
    const prepTime = currentRecipe.prepTime + (currentRecipe.cookTime || 0);
    $('#heroPrepTime').textContent = `${prepTime} min`;
    $('#heroPortions').textContent = `${currentRecipe.portions} portions`;
}

// ============================================================================
// QUALITY SLIDER
// ============================================================================

function renderQualitySlider() {
    updateQualityInfo();
}

function updateQualityInfo() {
    const q = QUALITY_LEVELS[currentQualityIndex];
    $('#qualityCoeff').textContent = `×${q.coefficient.toFixed(2)}`;
    $('#qualityDesc').textContent = q.description;

    // Update active label in slider
    $$('.quality-slider__labels span').forEach((el, i) => {
        el.classList.toggle('active', i === currentQualityIndex);
    });
}

// ============================================================================
// INGREDIENTS TABLE
// ============================================================================

function renderIngredients(matiereHike = 0) {
    const tbody = $('#ingredientsBody');
    tbody.innerHTML = '';
    const coeff = QUALITY_LEVELS[currentQualityIndex].coefficient;
    let total = 0;

    currentRecipe.ingredients.forEach(ing => {
        // Market hike applies directly to ingredient prices
        const currentCoeff = coeff * (1 + matiereHike);
        const displayPrice = getIngredientDisplayPrice(ing, currentCoeff);
        const cost = computeIngredientCost(ing, currentCoeff);
        total += cost;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ing.name}</td>
            <td>${ing.quantity} ${ing.unit}</td>
            <td>${displayPrice}</td>
            <td>${cost.toFixed(2)} €</td>
        `;
        tbody.appendChild(tr);
    });

    $('#totalMatiere').textContent = `${total.toFixed(2)} €`;
    $('#displayTauxPerte').textContent = (parseFloat($('#paramTauxPerte').value) || 5);
}

// ============================================================================
// PARAMETERS
// ============================================================================

function renderParams() {
    $('#paramPortions').value = currentRecipe.portions;
}

function getParams() {
    return {
        portions: parseFloat($('#paramPortions').value) || currentRecipe.portions,
        tauxHoraire: parseFloat($('#paramTauxHoraire').value) || 15,
        chargesFixes: parseFloat($('#paramChargesFixes').value) || 2000,
        coutEnergie: parseFloat($('#paramCoutEnergie').value) || 2.5,
        tauxPerte: (parseFloat($('#paramTauxPerte').value) || 5) / 100,
        nbProdMois: parseFloat($('#paramNbProd').value) || 100,
        prixVente: parseFloat($('#paramPrixVente').value) || null,
        margeSouhaitee: (parseFloat($('#paramMarge').value) || 70) / 100,
    };
}

// ============================================================================
// RECALCULATE
// ============================================================================

// ============================================================================
// RECALCULATE
// ============================================================================

function recalculate() {
    const params = getParams();
    const q = QUALITY_LEVELS[currentQualityIndex];

    // Apply Market Simulation adjustments to the local calculation
    const matiereHike = (parseFloat($('#marketMatiere').value) || 0) / 100;
    const prodDrop = (parseFloat($('#marketProd').value) || 0) / 100;
    const chargesHike = (parseFloat($('#marketCharges').value) || 0) / 100;

    // We pass a modified version of params to reflect market simulation
    const simulatedParams = {
        ...params,
        chargesFixes: params.chargesFixes * (1 + chargesHike),
        nbProdMois: params.nbProdMois * (1 - prodDrop)
    };

    // We also need to hike the ingredient prices
    const result = computeFullCost(currentRecipe, q, simulatedParams, matiereHike);

    // Update KPIs
    updateKPI('kpiCoutPortion', result.coutParPortion, '€');
    updateKPI('kpiPvRecommande', result.prixVenteTTC, '€');
    updateKPI('kpiMargeBrute', result.margeBrute * 100, '%');

    const seuilText = isFinite(result.seuilPortions) && result.seuilPortions > 0
        ? `${result.seuilPortions} u. / ${result.seuilCA.toFixed(0)} €`
        : '∞';
    $('#kpiSeuil').textContent = seuilText;

    // KPI Alerts & Colors
    updateKPIStatusColors(result);

    // Update ingredients UI
    renderIngredients(matiereHike);

    // Update Technical Sheet
    renderTechnicalSheet(params.portions);

    // Update charts
    updateBreakdownChart(result);
    updateComparisonChart(simulatedParams, matiereHike);
    updateComparisonGrid(simulatedParams, matiereHike);

    // Market Impact Section
    updateMarketImpact(result, params, simulatedParams, matiereHike);
}

function updateKPI(id, val, unit) {
    const el = $('#' + id);
    if (!el) return;
    el.textContent = unit === '%' ? `${val.toFixed(1)} %` : `${val.toFixed(2)} ${unit}`;
}

function updateKPIStatusColors(result) {
    const cardMarge = $('#cardMargeBrute');
    const alertBox = $('#kpiAlert');

    // reset
    cardMarge.classList.remove('kpi-card--danger', 'kpi-card--success');
    alertBox.hidden = true;

    if (result.margeBrute < 0.60) {
        cardMarge.classList.add('kpi-card--danger');
        alertBox.textContent = "⚠️ Alerte Rentabilité : Votre marge est inférieure à 60%. L'activité est à risque.";
        alertBox.hidden = false;
    } else if (result.margeBrute >= 0.75) {
        cardMarge.classList.add('kpi-card--success');
    }

    // Seuil alert
    const cardSeuil = $('#cardSeuil');
    cardSeuil.classList.remove('kpi-card--danger');
    if (result.seuilPortions > 500) {
        cardSeuil.classList.add('kpi-card--danger');
        alertBox.textContent = (alertBox.hidden ? "" : alertBox.textContent + " | ") + "⚠️ Point mort élevé (> 500u).";
        alertBox.hidden = false;
    }
}

function updateMarketImpact(result, originalParams, simulatedParams, matiereHike) {
    const impactCard = $('#marketImpact');
    const isImpacted = matiereHike > 0 || originalParams.nbProdMois !== simulatedParams.nbProdMois || originalParams.chargesFixes !== simulatedParams.chargesFixes;

    if (!isImpacted) {
        impactCard.hidden = true;
        return;
    }

    impactCard.hidden = false;

    // Simple impact logic: compare marge with or without market changes
    const baseResult = computeFullCost(currentRecipe, QUALITY_LEVELS[currentQualityIndex], originalParams);
    const diffMarge = (result.margeBrute - baseResult.margeBrute) * 100;

    $('#impactMarge').textContent = `${diffMarge.toFixed(1)}%`;
    $('#impactPV').textContent = `${result.prixVenteTTC.toFixed(2)} €`;
}

// ============================================================================
// TECHNICAL SHEET RENDERING (V5.0)
// ============================================================================

function renderTechnicalSheet(portions) {
    const ingredientsContainer = $('#techIngredientsList');
    const stepsContainer = $('#techStepsList');

    if (!ingredientsContainer || !stepsContainer) return;

    // 1. Render scaled ingredients
    ingredientsContainer.innerHTML = '';
    const ratio = portions / (currentRecipe.portions || 10);

    currentRecipe.ingredients.forEach(ing => {
        const scaledQty = (ing.quantity * ratio);

        const item = document.createElement('div');
        item.className = 'tech-ing-item';
        item.innerHTML = `
            <span class="tech-ing-name">${ing.name}</span>
            <span class="tech-ing-qty">${formatQty(scaledQty)} ${ing.unit}</span>
        `;
        ingredientsContainer.appendChild(item);
    });

    // 2. Render steps
    stepsContainer.innerHTML = '';
    if (currentRecipe.steps && currentRecipe.steps.length > 0) {
        currentRecipe.steps.forEach((step, idx) => {
            const stepDiv = document.createElement('div');
            stepDiv.className = 'tech-step';
            stepDiv.innerHTML = `
                <div class="tech-step-num">${idx + 1}</div>
                <div class="tech-step-text">${step}</div>
            `;
            stepsContainer.appendChild(stepDiv);
        });
    } else {
        stepsContainer.innerHTML = '<p class="empty-state">Aucune étape de fabrication enregistrée pour cette recette.</p>';
    }
}

function formatQty(qty) {
    if (qty >= 100) return Math.round(qty);
    if (qty >= 10) return qty.toFixed(1);
    return qty.toFixed(2);
}

// ============================================================================
// CHARTS
// ============================================================================

const CHART_COLORS = {
    matiere: { bg: 'rgba(59, 130, 246, 0.7)', border: '#3b82f6' },
    mo: { bg: 'rgba(16, 185, 129, 0.7)', border: '#10b981' },
    energie: { bg: 'rgba(245, 158, 11, 0.7)', border: '#f59e0b' },
    charges: { bg: 'rgba(168, 85, 247, 0.7)', border: '#a855f7' },
    cout: { bg: 'rgba(239, 68, 68, 0.6)', border: '#ef4444' },
    pv: { bg: 'rgba(16, 185, 129, 0.6)', border: '#10b981' },
};

function initCharts() {
    const defaults = Chart.defaults;
    defaults.color = '#a1a1aa';
    defaults.borderColor = 'rgba(255,255,255,0.06)';
    defaults.font.family = "'Inter', sans-serif";

    const params = getParams();
    const coeff = QUALITY_LEVELS[currentQualityIndex].coefficient;
    const result = computeFullCost(currentRecipe, coeff, params);

    // Breakdown chart
    const ctxBreakdown = $('#chartBreakdown').getContext('2d');
    breakdownChart = new Chart(ctxBreakdown, {
        type: 'doughnut',
        data: {
            labels: ['Matière', 'Main d\'œuvre', 'Énergie', 'Charges fixes'],
            datasets: [{
                data: [
                    result.coutMatiereAvecPerte,
                    result.coutMO,
                    result.coutEnergie,
                    result.partChargesFixes
                ],
                backgroundColor: [
                    CHART_COLORS.matiere.bg,
                    CHART_COLORS.mo.bg,
                    CHART_COLORS.energie.bg,
                    CHART_COLORS.charges.bg
                ],
                borderColor: '#0a0a12',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const val = ctx.parsed;
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const pct = ((val / total) * 100).toFixed(1);
                            return ` ${ctx.label}: ${val.toFixed(2)} € (${pct}%)`;
                        }
                    }
                }
            },
            cutout: '55%'
        }
    });

    // Comparison chart
    const ctxComparison = $('#chartComparison').getContext('2d');
    const compData = buildComparisonData(params);
    comparisonChart = new Chart(ctxComparison, {
        type: 'bar',
        data: {
            labels: QUALITY_LEVELS.map(q => q.name),
            datasets: [
                {
                    label: 'Coût / portion',
                    data: compData.costs,
                    backgroundColor: CHART_COLORS.cout.bg,
                    borderColor: CHART_COLORS.cout.border,
                    borderWidth: 1,
                    borderRadius: 4
                },
                {
                    label: 'PV recommandé',
                    data: compData.prices,
                    backgroundColor: CHART_COLORS.pv.bg,
                    borderColor: CHART_COLORS.pv.border,
                    borderWidth: 1,
                    borderRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { padding: 16, usePointStyle: true, pointStyleWidth: 10 }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(2)} €`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { callback: (v) => `${v}€` },
                    grid: { color: 'rgba(255,255,255,0.04)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });
}

function buildComparisonData(params, matiereHike = 0) {
    const costs = [];
    const prices = [];
    QUALITY_LEVELS.forEach(q => {
        const r = computeFullCost(currentRecipe, q, params, matiereHike);
        costs.push(r.coutParPortion);
        prices.push(r.pvRecommande);
    });
    return { costs, prices };
}

function updateBreakdownChart(result) {
    if (!breakdownChart) return;
    breakdownChart.data.datasets[0].data = [
        result.coutMatiereAvecPerte,
        result.coutMO,
        result.coutEnergie,
        result.partChargesFixes
    ];
    breakdownChart.update('none');
}

function updateComparisonChart(params, matiereHike = 0) {
    if (!comparisonChart) return;
    const compData = buildComparisonData(params, matiereHike);
    comparisonChart.data.datasets[0].data = compData.costs;
    comparisonChart.data.datasets[1].data = compData.prices;
    comparisonChart.update('none');
}

// ============================================================================
// COMPARISON GRID (V4)
// ============================================================================

function updateComparisonGrid(params, matiereHike = 0) {
    QUALITY_LEVELS.forEach((q, i) => {
        const result = computeFullCost(currentRecipe, q, params, matiereHike);

        // Update cost/portion
        const costEl = $(`#compCost_${i}`);
        if (costEl) costEl.textContent = `${result.coutParPortion.toFixed(2)} €`;

        // Update Selling Price
        const pvEl = $(`#compPV_${i}`);
        if (pvEl) pvEl.textContent = `PV TTC: ${result.prixVenteTTC.toFixed(2)} €`;

        // Highlight active level
        const card = document.querySelector(`.comparison-card[data-level="${q.id}"]`);
        if (card) {
            card.classList.toggle('active', i === currentQualityIndex);
        }
    });
}

// ============================================================================
// RECIPE NAVIGATION
// ============================================================================

function renderRecipeNav() {
    const container = $('#recipesNav');
    container.innerHTML = '';

    getAllRecipes().forEach(recipe => {
        const card = document.createElement('a');
        card.className = 'recipe-nav-card' + (recipe.id === currentRecipe.id ? ' active' : '');
        card.href = `simulator.html?recipe=${recipe.id}`;

        const imgSrc = PASTRY_IMAGES[recipe.id] || './img/mille-feuille.jpg';
        card.innerHTML = `
            <img class="recipe-nav-card__img" src="${imgSrc}" alt="${recipe.name}" />
            <span class="recipe-nav-card__name">${recipe.name}</span>
        `;
        container.appendChild(card);
    });
}

// ============================================================================
// EVENT BINDINGS
// ============================================================================

function bindEvents() {
    // Quality slider
    const slider = $('#qualityRange');
    if (slider) {
        slider.addEventListener('input', (e) => {
            currentQualityIndex = parseInt(e.target.value);
            updateQualityInfo();
            recalculate();
        });
    }

    // Parameter inputs - Auto-recalc on input
    $$('.params-grid input').forEach(input => {
        input.addEventListener('input', () => recalculate());
    });

    // Market Simulation inputs
    ['marketMatiere', 'marketProd', 'marketCharges'].forEach(id => {
        const el = $('#' + id);
        if (el) {
            el.addEventListener('input', (e) => {
                $(`#val${id.charAt(0).toUpperCase() + id.slice(1)}`).textContent = e.target.value;
                recalculate();
            });
        }
    });

    // Recalculate button
    const btnCalc = $('#btnRecalculate');
    if (btnCalc) {
        btnCalc.addEventListener('click', () => {
            btnCalc.classList.add('loading');
            setTimeout(() => {
                recalculate();
                btnCalc.classList.remove('loading');
            }, 300);
        });
    }

    // PDF export
    $('#exportPdf').addEventListener('click', exportPDF);

    // Tab Switching (V5.0)
    $$('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;

            // Toggle buttons
            $$('.tab-btn').forEach(b => b.classList.toggle('active', b === btn));

            // Toggle panes
            $$('.tab-pane').forEach(pane => {
                const isTarget = pane.id === (tabId === 'analysis' ? 'tabAnalysis' : 'tabTechnical');
                pane.classList.toggle('active', isTarget);
            });
        });
    });

    // Custom recipe modal
    $('#btnAddRecipe').addEventListener('click', openRecipeModal);
    $('#modalClose').addEventListener('click', closeRecipeModal);
    $('#modalCancel').addEventListener('click', closeRecipeModal);
    $('#recipeModal .modal__backdrop').addEventListener('click', closeRecipeModal);
    $('#addIngredientBtn').addEventListener('click', addIngredientRow);
    $('#recipeForm').addEventListener('submit', saveRecipe);
}

// ============================================================================
// PDF EXPORT (html2pdf.js)
// ============================================================================

async function exportPDF() {
    const btn = $('#exportPdf');
    btn.disabled = true;

    // Show loading toast
    const toast = showToast('📄 Génération du PDF en cours…', true);

    try {
        // Build a clean PDF container
        const pdfEl = document.createElement('div');
        pdfEl.style.cssText = `
            font-family: 'Inter', sans-serif;
            color: #1a1a2e;
            background: #fff;
            padding: 32px;
            width: 800px;
        `;

        const q = QUALITY_LEVELS[currentQualityIndex];
        const params = getParams();
        const result = computeFullCost(currentRecipe, q, params);
        const coeff = q.coefficient;

        // Title
        pdfEl.innerHTML = `
            <div style="text-align:center; margin-bottom:24px;">
                <h1 style="font-family:'Playfair Display',serif; font-size:28px; margin:0 0 4px; color:#1a1a2e;">
                    ${currentRecipe.name}
                </h1>
                <p style="color:#888; font-size:13px; margin:0;">
                    ${currentRecipe.category || 'Pâtisserie'} — Niveau ${q.name} (×${coeff.toFixed(2)})
                </p>
                <p style="color:#aaa; font-size:11px; margin:4px 0 0;">
                    Généré le ${new Date().toLocaleDateString('fr-FR')} — Coût de Revient Pâtisserie
                </p>
            </div>
            <hr style="border:none; border-top:2px solid #c9a84c; margin:0 0 20px;">
        `;

        // KPIs
        pdfEl.innerHTML += `
            <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:12px; margin-bottom:24px;">
                <div style="background:#f1f5f9; border-radius:8px; padding:12px; text-align:center;">
                    <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#666; margin-bottom:4px;">Coût / portion</div>
                    <div style="font-size:22px; font-weight:700; color:#3b82f6;">${result.coutParPortion.toFixed(2)} €</div>
                </div>
                <div style="background:#fef9ee; border-radius:8px; padding:12px; text-align:center;">
                    <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#666; margin-bottom:4px;">PV recommandé</div>
                    <div style="font-size:22px; font-weight:700; color:#c9a84c;">${result.pvRecommande.toFixed(2)} €</div>
                </div>
                <div style="background:#ecfdf5; border-radius:8px; padding:12px; text-align:center;">
                    <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#666; margin-bottom:4px;">Marge brute</div>
                    <div style="font-size:22px; font-weight:700; color:#10b981;">${(result.margeBrute * 100).toFixed(1)} %</div>
                </div>
                <div style="background:#f1f5f9; border-radius:8px; padding:12px; text-align:center;">
                    <div style="font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#666; margin-bottom:4px;">Seuil rentabilité</div>
                    <div style="font-size:18px; font-weight:700; color:#6b7280;">${isFinite(result.seuilPortions) && result.seuilPortions > 0 ? result.seuilPortions + ' u. / ' + result.seuilCA.toFixed(0) + ' €' : '∞'}</div>
                </div>
            </div>
        `;

        // Ingredients table (Financial View: scaled to portions)
        let ingRows = '';
        let totalMatiere = 0;
        const ratio = params.portions / (currentRecipe.portions || 10);

        currentRecipe.ingredients.forEach(ing => {
            const scaledIng = { ...ing, quantity: ing.quantity * ratio };
            const cost = computeIngredientCost(scaledIng, coeff);
            totalMatiere += cost;
            const displayPrice = getIngredientDisplayPrice(ing, coeff);
            ingRows += `
                <tr>
                    <td style="padding:6px 10px; border-bottom:1px solid #eee;">${ing.name}</td>
                    <td style="padding:6px 10px; border-bottom:1px solid #eee; text-align:center;">${formatQty(scaledIng.quantity)} ${ing.unit}</td>
                    <td style="padding:6px 10px; border-bottom:1px solid #eee; text-align:right;">${displayPrice}</td>
                    <td style="padding:6px 10px; border-bottom:1px solid #eee; text-align:right; font-weight:600;">${cost.toFixed(2)} €</td>
                </tr>
            `;
        });

        pdfEl.innerHTML += `
            <h2 style="font-family:'Playfair Display',serif; font-size:16px; margin:0 0 12px; color:#1a1a2e; border-bottom:1px solid #ddd; padding-bottom:6px;">
                Ingrédients (pour ${params.portions} portions)
            </h2>
            <table style="width:100%; border-collapse:collapse; font-size:12px; margin-bottom:24px;">
                <thead>
                    <tr style="background:#f8fafc;">
                        <th style="padding:8px 10px; text-align:left; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#888; border-bottom:2px solid #ddd;">Ingrédient</th>
                        <th style="padding:8px 10px; text-align:center; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#888; border-bottom:2px solid #ddd;">Quantité</th>
                        <th style="padding:8px 10px; text-align:right; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#888; border-bottom:2px solid #ddd;">Prix unit.</th>
                        <th style="padding:8px 10px; text-align:right; font-size:10px; text-transform:uppercase; letter-spacing:0.08em; color:#888; border-bottom:2px solid #ddd;">Coût</th>
                    </tr>
                </thead>
                <tbody>${ingRows}</tbody>
                <tfoot>
                    <tr style="background:#fef9ee;">
                        <td colspan="3" style="padding:8px 10px; font-weight:700; border-top:2px solid #c9a84c;">Total matière</td>
                        <td style="padding:8px 10px; text-align:right; font-weight:700; border-top:2px solid #c9a84c; color:#c9a84c;">${totalMatiere.toFixed(2)} €</td>
                    </tr>
                </tfoot>
            </table>
        `;

        // Comparison table
        let compRows = '';
        const rowDefs = [
            { label: 'Coût matière', key: 'coutMatiereAvecPerte', fmt: v => `${v.toFixed(2)} €` },
            { label: 'Coût / portion', key: 'coutParPortion', fmt: v => `${v.toFixed(2)} €` },
            { label: 'PV recommandé', key: 'pvRecommande', fmt: v => `${v.toFixed(2)} €` },
            { label: 'Marge brute', key: 'margeBrute', fmt: v => `${(v * 100).toFixed(1)} %` },
        ];
        const allResults = QUALITY_LEVELS.map(ql => computeFullCost(currentRecipe, ql.coefficient, params));

        rowDefs.forEach(row => {
            compRows += `<tr>`;
            compRows += `<td style="padding:6px 10px; border-bottom:1px solid #eee; font-weight:600;">${row.label}</td>`;
            allResults.forEach((r, i) => {
                const bg = i === currentQualityIndex ? 'background:#fef9ee;' : '';
                const fw = i === currentQualityIndex ? 'font-weight:700;' : '';
                compRows += `<td style="padding:6px 10px; border-bottom:1px solid #eee; text-align:center; ${bg}${fw}">${row.fmt(r[row.key])}</td>`;
            });
            compRows += `</tr>`;
        });

        pdfEl.innerHTML += `
            <div style="margin-bottom:24px;">
                <h2 style="font-family:'Playfair Display',serif; font-size:16px; margin:0 0 12px; color:#1a1a2e; border-bottom:1px solid #ddd; padding-bottom:6px;">
                    Comparatif des 5 niveaux
                </h2>
                <table style="width:100%; border-collapse:collapse; font-size:11px;">
                    <thead>
                        <tr style="background:#f8fafc;">
                            <th style="padding:8px 10px; text-align:left; font-size:9px; text-transform:uppercase; color:#888; border-bottom:2px solid #ddd;">Indicateur</th>
                            ${QUALITY_LEVELS.map((q, i) => {
            const act = i === currentQualityIndex ? 'color:#c9a84c; border-bottom:2px solid #c9a84c;' : 'border-bottom:2px solid #ddd;';
            return `<th style="padding:8px 6px; text-align:center; font-size:9px; text-transform:uppercase; ${act}">${q.name}</th>`;
        }).join('')}
                        </tr>
                    </thead>
                    <tbody>${compRows}</tbody>
                </table>
            </div>
        `;

        // Parameters summary
        pdfEl.innerHTML += `
            <div style="background:#f8fafc; border-radius:8px; padding:16px; margin-bottom:32px;">
                <h2 style="font-family:'Playfair Display',serif; font-size:14px; margin:0 0 12px; color:#1a1a2e;">
                    Paramètres de simulation
                </h2>
                <div style="display:grid; grid-template-columns:1fr 1fr 1fr 1fr; gap:8px; font-size:10px;">
                    <div><span style="color:#888;">Portions :</span> <strong>${params.portions}</strong></div>
                    <div><span style="color:#888;">Taux horaire :</span> <strong>${params.tauxHoraire.toFixed(2)} €/h</strong></div>
                    <div><span style="color:#888;">Charges fixes :</span> <strong>${params.chargesFixes.toFixed(0)} €/m</strong></div>
                    <div><span style="color:#888;">Énergie :</span> <strong>${params.coutEnergie.toFixed(2)} €/h</strong></div>
                    <div><span style="color:#888;">Perte :</span> <strong>${(params.tauxPerte * 100).toFixed(0)} %</strong></div>
                    <div><span style="color:#888;">Prod./mois :</span> <strong>${params.nbProdMois}</strong></div>
                    <div><span style="color:#888;">Marge :</span> <strong>${(params.margeSouhaitee * 100).toFixed(0)} %</strong></div>
                </div>
            </div>
        `;

        // --- PAGE 2 : FICHE TECHNIQUE ---
        pdfEl.innerHTML += `
            <div class="html2pdf__page-break"></div>
            <div style="padding-top:20px;">
                <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:20px; border-bottom:2px solid #c9a84c; padding-bottom:10px;">
                    <h1 style="font-family:'Playfair Display',serif; font-size:24px; margin:0; color:#1a1a2e;">
                        Fiche Technique : ${currentRecipe.name}
                    </h1>
                    <span style="color:#c9a84c; font-weight:700; font-size:14px;">${params.portions} portions</span>
                </div>

                <div style="margin-bottom:30px;">
                    <h2 style="font-size:16px; color:#1a1a2e; margin-bottom:15px; text-transform:uppercase; letter-spacing:0.05em;">
                        Pesées Réelles
                    </h2>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                        ${currentRecipe.ingredients.map(ing => `
                            <div style="display:flex; justify-content:space-between; padding:8px 12px; background:#f9f9f9; border-radius:4px; font-size:12px;">
                                <span style="color:#555;">${ing.name}</span>
                                <span style="font-weight:700; color:#000;">${formatQty(ing.quantity * ratio)} ${ing.unit}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div>
                    <h2 style="font-size:16px; color:#1a1a2e; margin-bottom:15px; text-transform:uppercase; letter-spacing:0.05em;">
                        Procédure de Fabrication
                    </h2>
                    <div style="display:flex; flex-direction:column; gap:12px;">
                        ${(currentRecipe.steps || []).map((step, idx) => `
                            <div style="display:flex; gap:15px; border-left:3px solid #c9a84c; padding:8px 0 8px 15px; background:#fff;">
                                <div style="font-weight:900; color:#c9a84c; font-size:18px;">${idx + 1}</div>
                                <div style="font-size:13px; line-height:1.6; color:#1a1a2e;">${step}</div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        // Generate PDF
        document.body.appendChild(pdfEl);

        const opt = {
            margin: [10, 10, 10, 10],
            filename: `cout-revient-${currentRecipe.id}-${q.name.toLowerCase()}.pdf`,
            image: { type: 'jpeg', quality: 0.95 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
        };

        await html2pdf().set(opt).from(pdfEl).save();

        document.body.removeChild(pdfEl);

        // Show success
        removeToast(toast);
        showToast('✅ PDF exporté avec succès !');
        setTimeout(() => removeToast(), 3000);

    } catch (err) {
        console.error('PDF export error:', err);
        removeToast(toast);
        showToast('❌ Erreur d\'export PDF');
        setTimeout(() => removeToast(), 4000);
    }

    btn.disabled = false;
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

function showToast(message, isLoading = false) {
    removeToast();
    const toast = document.createElement('div');
    toast.className = 'pdf-toast' + (isLoading ? ' pdf-toast--loading' : '');
    toast.id = 'pdfToast';
    toast.textContent = message;
    document.body.appendChild(toast);
    return toast;
}

function removeToast(toastEl) {
    const existing = toastEl || document.getElementById('pdfToast');
    if (existing) existing.remove();
}

// ============================================================================
// CUSTOM RECIPE MODAL
// ============================================================================

function openRecipeModal() {
    const modal = $('#recipeModal');
    modal.hidden = false;

    // Reset form
    $('#recipeForm').reset();
    $('#customIngredients').innerHTML = '';

    // Add 3 default ingredient rows
    for (let i = 0; i < 3; i++) addIngredientRow();
}

function closeRecipeModal() {
    $('#recipeModal').hidden = true;
}

function addIngredientRow() {
    const container = $('#customIngredients');
    const row = document.createElement('div');
    row.className = 'ingredient-row';
    row.innerHTML = `
        <input type="text" placeholder="Nom (ex: Farine)" class="ing-name" />
        <input type="text" placeholder="Qté (ex: 500g)" class="ing-qty" />
        <input type="number" placeholder="Prix €" step="0.01" min="0" class="ing-price" />
        <button type="button" class="btn-remove-ing" title="Supprimer">&times;</button>
    `;
    row.querySelector('.btn-remove-ing').addEventListener('click', () => row.remove());
    container.appendChild(row);
}

function saveRecipe(e) {
    e.preventDefault();

    const name = $('#customName').value.trim();
    if (!name) return;

    // Generate ID
    const id = 'custom-' + name.toLowerCase()
        .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');

    // Parse ingredients
    const ingredients = [];
    $$('#customIngredients .ingredient-row').forEach(row => {
        const ingName = row.querySelector('.ing-name').value.trim();
        const qtyStr = row.querySelector('.ing-qty').value.trim();
        const price = parseFloat(row.querySelector('.ing-price').value) || 0;

        if (!ingName || !qtyStr) return;

        // Parse quantity (e.g. "500g", "3 unités", "250 ml")
        const qtyMatch = qtyStr.match(/^([\d.,]+)\s*(.*)$/);
        const quantity = qtyMatch ? parseFloat(qtyMatch[1].replace(',', '.')) : 1;
        const unit = qtyMatch && qtyMatch[2] ? qtyMatch[2].trim() : 'g';

        ingredients.push({
            name: ingName,
            quantity,
            unit,
            pricePerUnit: price / Math.max(quantity, 0.001)
        });
    });

    if (ingredients.length === 0) {
        alert('Ajoutez au moins un ingrédient.');
        return;
    }

    const recipe = {
        id,
        name,
        category: $('#customCategory').value.trim() || 'Personnalisé',
        description: $('#customDesc').value.trim() || `Recette personnalisée : ${name}`,
        portions: parseInt($('#customPortions').value) || 10,
        prepTime: parseInt($('#customPrepTime').value) || 60,
        cookTime: parseInt($('#customCookTime').value) || 30,
        ingredients,
        isCustom: true
    };

    // Save to localStorage
    const customs = loadCustomRecipes();
    // Replace if same ID exists
    const idx = customs.findIndex(r => r.id === id);
    if (idx >= 0) customs[idx] = recipe;
    else customs.push(recipe);
    saveCustomRecipes(customs);

    closeRecipeModal();

    // Navigate to the new recipe
    window.location.href = `simulator.html?recipe=${id}`;
}

// ============================================================================
// START
// ============================================================================

init();
