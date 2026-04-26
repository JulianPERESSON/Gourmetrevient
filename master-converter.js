/*
  =====================================================================
  MASTER-CONVERTER.JS — GourmetRevient v5.2
  Géométrie Culinaire — Convertisseur de Moules Premium
  Calcul de volumes 3D → Coefficient → Adaptation quantités
  + Conversion rapide fonds de tarte par taille
  =====================================================================
*/

// ============================================================================
// GEOMETRY ENGINE
// ============================================================================

const MC_SHAPES = {
  cercle:    { label: '⭕ Cercle / Entremets',   fields: ['diameter', 'height'], icon: '⭕' },
  carre:     { label: '⬛ Carré / Cadre carré',   fields: ['side', 'height'],     icon: '⬛' },
  rectangle: { label: '▭ Rectangle / Cadre',      fields: ['length', 'width', 'height'], icon: '▭' },
  buche:     { label: '🪵 Bûche / Gouttière',     fields: ['length', 'diameter', 'height'], icon: '🪵' },
  verrine:   { label: '🥃 Verrine / Demi-Sphère', fields: ['diameter', 'height'], icon: '🥃' },
  tarte:     { label: '🥧 Moule à tarte / Cercle tarte', fields: ['diameter', 'height'], icon: '🥧' },
};

// Tailles standard de cercles à tarte (diamètre cm → hauteur standard cm)
const TART_SIZES = [
  { d: 16, h: 2,   label: 'Ø16 cm (individuel+)' },
  { d: 18, h: 2,   label: 'Ø18 cm (2-3 parts)' },
  { d: 20, h: 2,   label: 'Ø20 cm (4 parts)' },
  { d: 22, h: 2,   label: 'Ø22 cm (6 parts)' },
  { d: 24, h: 2.5, label: 'Ø24 cm (6-8 parts)' },
  { d: 26, h: 2.5, label: 'Ø26 cm (8 parts)' },
  { d: 28, h: 2.5, label: 'Ø28 cm (8-10 parts)' },
  { d: 30, h: 3,   label: 'Ø30 cm (10-12 parts)' },
  { d: 32, h: 3,   label: 'Ø32 cm (12+ parts)' },
];

/**
 * Calculate the volume (cm³) of a mold shape
 * All dimensions in cm
 */
function mcVolume(shape, dims) {
  const d    = dims.diameter || 0;
  const h    = dims.height   || 0;
  const l    = dims.length   || 0;
  const w    = dims.width    || 0;
  const side = dims.side     || 0;

  switch (shape) {
    case 'cercle':
    case 'tarte':
      return Math.PI * Math.pow(d / 2, 2) * h;

    case 'carre':
      return side * side * h;

    case 'rectangle':
      return l * w * h;

    case 'buche':
      // Half-cylinder: (π * r² / 2) * l
      return (Math.PI * Math.pow(d / 2, 2) / 2) * l;

    case 'verrine':
      return Math.PI * Math.pow(d / 2, 2) * h;

    default:
      return 0;
  }
}

/**
 * Compute the scaling coefficient between two mold volumes
 */
function mcCoefficient(volFrom, volTo) {
  if (volFrom <= 0) return 1;
  return volTo / volFrom;
}

// ============================================================================
// STATE
// ============================================================================

let mcState = {
  fromShape: 'tarte',
  toShape:   'tarte',
  fromDims:  { diameter: 22, height: 2 },
  toDims:    { diameter: 28, height: 2.5 },
  coefficient: 1,
  linkedRecipeIdx: null,
};

let mcFilteredRecipes = [];

// ============================================================================
// OPEN / CLOSE
// ============================================================================

function openMasterConverter() {
  const modal = document.getElementById('masterConverterModal');
  if (modal) modal.style.display = 'flex';
  initMCShapeSelectors();
  populateMCRecipeSelect();
  mcCalculate();
}

function closeMasterConverter() {
  const modal = document.getElementById('masterConverterModal');
  if (modal) modal.style.display = 'none';
}

window.openMasterConverter = openMasterConverter;
window.closeMasterConverter = closeMasterConverter;

// ============================================================================
// INIT UI
// ============================================================================

function initMCShapeSelectors() {
  const fromSel = document.getElementById('mcFromShape');
  const toSel   = document.getElementById('mcToShape');
  if (!fromSel || !toSel) return;

  fromSel.value = mcState.fromShape;
  toSel.value   = mcState.toShape;

  renderMCFields('from', mcState.fromShape);
  renderMCFields('to',   mcState.toShape);
}

/**
 * Render dimension input fields for a given side (from/to
 * Uses CLEAR key names: diameter, height, side, length, width
 */
function renderMCFields(side, shape) {
  const container = document.getElementById(`mc${cap(side)}Fields`);
  if (!container) return;

  const dims = side === 'from' ? mcState.fromDims : mcState.toDims;
  const fields = MC_SHAPES[shape]?.fields || [];
  const labels = {
    diameter: 'Diamètre (cm)',
    side:     'Côté (cm)',
    length:   'Longueur (cm)',
    width:    'Largeur (cm)',
    height:   'Hauteur (cm)',
  };
  const defaults = {
    diameter: side === 'from' ? 22 : 28,
    side:     side === 'from' ? 16 : 22,
    length:   side === 'from' ? 30 : 40,
    width:    side === 'from' ? 10 : 12,
    height:   side === 'from' ? 2 : 2.5,
  };

  let html = fields.map(f => `
    <div class="mc-field-group">
      <label>${labels[f]}</label>
      <div class="mc-input-wrapper">
        <input type="number"
               id="mc${cap(side)}_${f}"
               class="form-input mc-input"
               value="${dims[f] !== undefined ? dims[f] : defaults[f]}"
               min="0.5" max="200" step="0.5"
               oninput="mcUpdateDim('${side}', '${f}', this.value)">
        <span class="mc-unit">cm</span>
      </div>
    </div>
  `).join('');

  // Ajouter les boutons raccourcis pour les tartes
  if (shape === 'tarte') {
    html += `<div class="mc-tart-presets">
      <div class="mc-tart-presets-label">Tailles courantes :</div>
      <div class="mc-tart-presets-btns">
        ${TART_SIZES.map(t => `
          <button class="mc-tart-btn${dims.diameter === t.d ? ' active' : ''}"
                  onclick="mcSetTartSize('${side}', ${t.d}, ${t.h})"
                  title="${t.label}">
            Ø${t.d}
          </button>
        `).join('')}
      </div>
    </div>`;
  }

  container.innerHTML = html;
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function populateMCRecipeSelect() {
  const sel = document.getElementById('mcRecipeSelect');
  if (!sel) return;

  const globalRecipes = (typeof RECIPES !== 'undefined') ? RECIPES : [];
  const savedRecipes = (typeof APP !== 'undefined' && APP.savedRecipes) ? APP.savedRecipes : [];
  
  // Tag and merge
  const all = [
    ...globalRecipes.map(r => ({ ...r, source: 'global' })),
    ...savedRecipes.map(r => ({ ...r, source: 'saved' }))
  ];

  // Filter: Keep Entremets and Tartes, exclude Choux/Baba/Macaron/etc.
  mcFilteredRecipes = all.filter(r => {
    const cat = (r.category || '').toLowerCase();
    const name = (r.name || '').toLowerCase();
    
    // Explicit exclusions (Pâte à choux, Baba, Macaron, Boulangerie)
    if (cat.includes('choux') || cat.includes('baba') || cat.includes('macaron') || 
        cat.includes('brioche') || cat.includes('viennoiserie') || cat.includes('pain') ||
        name.includes('baba') || name.includes('éclair') || name.includes('chou')) {
        return false;
    }
    
    // Explicit inclusions (Entremets, Tartes, Bûches, Classiques/Feuilletage if entremets-like)
    return cat.includes('entremet') || cat.includes('tarte') || cat.includes('bûche') || 
           cat.includes('buche') || cat.includes('feuilletage') || cat.includes('classique');
  });

  sel.innerHTML = `<option value="">— Sélectionner un Entremets ou Tarte —</option>` +
    mcFilteredRecipes.map((r, i) => `<option value="${i}">${r.name} ${r.source === 'global' ? '🌐' : '💾'}</option>`).join('');
  
  sel.value = mcState.linkedRecipeIdx !== null ? mcState.linkedRecipeIdx : '';
}

// ============================================================================
// EVENTS
// ============================================================================

function mcChangeFromShape(val) {
  mcState.fromShape = val;
  mcState.fromDims  = {};
  renderMCFields('from', val);
  mcCalculate();
}

function mcChangeToShape(val) {
  mcState.toShape = val;
  mcState.toDims  = {};
  renderMCFields('to', val);
  mcCalculate();
}

function mcUpdateDim(side, field, val) {
  const dimObj = side === 'from' ? mcState.fromDims : mcState.toDims;
  dimObj[field] = parseFloat(val) || 0;
  mcCalculate();
}

function mcSetTartSize(side, diameter, height) {
  const dimObj = side === 'from' ? mcState.fromDims : mcState.toDims;
  dimObj.diameter = diameter;
  dimObj.height = height;
  renderMCFields(side, 'tarte');
  mcCalculate();
}
window.mcSetTartSize = mcSetTartSize;

function mcSelectRecipe(idx) {
  mcState.linkedRecipeIdx = idx !== '' ? parseInt(idx) : null;
  mcCalculate();
}

// ============================================================================
// CORE CALCULATION
// ============================================================================

function mcCalculate() {
  syncMCDims('from');
  syncMCDims('to');

  const vFrom = mcVolume(mcState.fromShape, mcState.fromDims);
  const vTo   = mcVolume(mcState.toShape,   mcState.toDims);
  const coeff = mcCoefficient(vFrom, vTo);

  mcState.coefficient = coeff;

  renderMCResult(vFrom, vTo, coeff);
  renderMCSVG(mcState.fromShape, mcState.fromDims, mcState.toShape, mcState.toDims);
  renderMCIngredients(coeff);
}

function syncMCDims(side) {
  const shape = side === 'from' ? mcState.fromShape : mcState.toShape;
  const dims  = side === 'from' ? mcState.fromDims  : mcState.toDims;
  const fields = MC_SHAPES[shape]?.fields || [];

  fields.forEach(f => {
    const el = document.getElementById(`mc${cap(side)}_${f}`);
    if (el) {
      dims[f] = parseFloat(el.value) || 0;
    }
  });
}

// ============================================================================
// RESULT PANEL
// ============================================================================

function renderMCResult(vFrom, vTo, coeff) {
  const panel = document.getElementById('mcResultPanel');
  if (!panel) return;

  const pct   = ((coeff - 1) * 100).toFixed(1);
  const arrow = coeff > 1 ? '↑' : coeff < 1 ? '↓' : '=';
  const color = coeff > 1 ? 'var(--accent)' : coeff < 1 ? '#6366f1' : 'var(--success)';

  const portionLabel = coeff > 1
    ? `Multipliez toutes les quantités par <strong>${coeff.toFixed(3)}</strong>`
    : coeff < 1
      ? `Divisez toutes les quantités par <strong>${(1/coeff).toFixed(3)}</strong>`
      : `Les quantités restent identiques`;

  panel.innerHTML = `
    <div class="mc-result-grid">
      <div class="mc-kpi">
        <div class="mc-kpi-label">Volume Initial</div>
        <div class="mc-kpi-value">${Math.round(vFrom)} cm³</div>
        <div class="mc-kpi-sub">${(vFrom / 1000).toFixed(2)} L</div>
      </div>

      <div class="mc-kpi mc-kpi-main" style="border-color:${color};">
        <div class="mc-kpi-label">Coefficient Géométrique</div>
        <div class="mc-kpi-value" style="color:${color}; font-size:2.4rem;">
          ${arrow} ${coeff.toFixed(3)}
        </div>
        <div class="mc-kpi-sub">${pct > 0 ? '+' : ''}${pct}% de volume</div>
      </div>

      <div class="mc-kpi">
        <div class="mc-kpi-label">Nouveau Volume</div>
        <div class="mc-kpi-value">${Math.round(vTo)} cm³</div>
        <div class="mc-kpi-sub">${(vTo / 1000).toFixed(2)} L</div>
      </div>
    </div>

    <div class="mc-instruction-box">
      💡 ${portionLabel} — appliquez ce coefficient à chaque ingrédient.
    </div>
  `;
}

// ============================================================================
// SVG COMPARISON
// ============================================================================

function renderMCSVG(shapeFrom, dimsFrom, shapeTo, dimsTo) {
  const container = document.getElementById('mcSVGContainer');
  if (!container) return;

  const W = 520, H = 220;
  const MAX_W = 180;

  function normShape(shape, dims) {
    switch (shape) {
      case 'cercle':
      case 'tarte':
      case 'verrine':
        return { type: 'ellipse', w: (dims.diameter || 18), h: (dims.height || 4.5) };
      case 'carre':
        return { type: 'rect', w: (dims.side || 18), h: (dims.height || 4.5) };
      case 'rectangle':
        return { type: 'rect', w: (dims.length || 30), h: (dims.height || 4.5) };
      case 'buche':
        return { type: 'buche', w: (dims.length || 30), h: (dims.diameter || 8) };
      default:
        return { type: 'rect', w: 20, h: 5 };
    }
  }

  const from = normShape(shapeFrom, dimsFrom);
  const to   = normShape(shapeTo, dimsTo);

  const maxDim = Math.max(from.w, to.w, from.h * 6, to.h * 6, 1);
  function scale(v)  { return (v / maxDim) * MAX_W; }
  function scaleH(v) { return Math.max(20, (v / maxDim) * 150 * 2.5); }

  function drawShape(shape, x, y, color, label) {
    const sw = scale(shape.w);
    const sh = scaleH(shape.h);
    let svg = '';

    if (shape.type === 'ellipse') {
      const rx = sw / 2, ry = rx * 0.22;
      svg += `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" opacity="0.7"/>`;
      svg += `<path d="M ${x - rx} ${y - sh} Q ${x} ${y - sh - ry * 2} ${x + rx} ${y - sh}
                 L ${x + rx} ${y} Q ${x} ${y + ry * 2} ${x - rx} ${y} Z" fill="${color}" opacity="0.5"/>`;
      svg += `<ellipse cx="${x}" cy="${y - sh}" rx="${rx}" ry="${ry}" fill="${color}" opacity="0.9" stroke="white" stroke-width="1"/>`;
    } else if (shape.type === 'buche') {
      const rx = sw / 2, ry = Math.max(10, sh / 2);
      svg += `<path d="M ${x - rx} ${y} A ${sw} ${ry} 0 0 1 ${x + rx} ${y}
                 L ${x + rx} ${y - sh * 0.6} A ${sw} ${ry * 0.4} 0 0 0 ${x - rx} ${y - sh * 0.6} Z" fill="${color}" opacity="0.65"/>`;
      svg += `<ellipse cx="${x}" cy="${y - sh * 0.6}" rx="${rx}" ry="${ry * 0.4}" fill="${color}" opacity="0.9" stroke="white" stroke-width="1"/>`;
    } else {
      const hw = sw / 2, p = 12;
      svg += `<rect x="${x - hw}" y="${y - sh}" width="${sw}" height="${sh}" fill="${color}" opacity="0.6"/>`;
      svg += `<path d="M ${x - hw} ${y - sh} L ${x - hw + p} ${y - sh - p * 0.5} L ${x + hw + p} ${y - sh - p * 0.5} L ${x + hw} ${y - sh} Z" fill="${color}" opacity="0.9"/>`;
      svg += `<path d="M ${x + hw} ${y - sh} L ${x + hw + p} ${y - sh - p * 0.5} L ${x + hw + p} ${y - p * 0.5} L ${x + hw} ${y} Z" fill="${color}" opacity="0.4"/>`;
      svg += `<rect x="${x - hw}" y="${y - sh}" width="${sw}" height="${sh}" fill="none" stroke="white" stroke-width="1" opacity="0.6"/>`;
    }

    svg += `<text x="${x}" y="${y + 20}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="var(--text-muted)">${label}</text>`;
    return svg;
  }

  const yBase = H - 30, x1 = W * 0.27, x2 = W * 0.73;
  const fromLabel = buildLabel(shapeFrom, dimsFrom);
  const toLabel   = buildLabel(shapeTo,   dimsTo);
  const coeff     = mcState.coefficient;
  const arrowColor = coeff > 1.05 ? '#6366f1' : coeff < 0.95 ? '#818cf8' : '#10b981';

  const svgContent = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <pattern id="mcGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(99,102,241,0.06)" stroke-width="1"/>
        </pattern>
        <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${arrowColor}"/>
        </marker>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#mcGrid)" rx="12"/>

      <text x="${x1}" y="22" text-anchor="middle" font-family="Playfair Display, serif" font-size="13" font-weight="700" fill="var(--text)">Moule initial</text>
      ${drawShape(from, x1, yBase - 10, '#8B5E3C', fromLabel)}

      <line x1="${x1 + 40}" y1="${yBase - 50}" x2="${x2 - 40}" y2="${yBase - 50}"
            stroke="${arrowColor}" stroke-width="2.5" stroke-dasharray="6,3" marker-end="url(#arrowHead)"/>

      <rect x="${W/2 - 32}" y="${yBase - 72}" width="64" height="26" rx="13" fill="${arrowColor}" opacity="0.15"/>
      <text x="${W/2}" y="${yBase - 54}" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="${arrowColor}">
        × ${coeff.toFixed(2)}
      </text>

      <text x="${x2}" y="22" text-anchor="middle" font-family="Playfair Display, serif" font-size="13" font-weight="700" fill="var(--text)">Nouveau moule</text>
      ${drawShape(to, x2, yBase - 10, '#6366f1', toLabel)}
    </svg>
  `;

  container.innerHTML = svgContent;
}

function buildLabel(shape, dims) {
  switch (shape) {
    case 'cercle':
    case 'tarte':
    case 'verrine': return `Ø${dims.diameter || '?'}cm × H${dims.height || '?'}cm`;
    case 'carre':   return `${dims.side || '?'}×${dims.side || '?'}cm × H${dims.height || '?'}cm`;
    case 'rectangle': return `${dims.length || '?'}×${dims.width || '?'}cm × H${dims.height || '?'}cm`;
    case 'buche':   return `L${dims.length || '?'}cm × Ø${dims.diameter || '?'}cm`;
    default:        return '';
  }
}

// ============================================================================
// INGREDIENT SCALING
// ============================================================================

function renderMCIngredients(coeff) {
  const container = document.getElementById('mcIngredientsPanel');
  if (!container) return;

  const idx = mcState.linkedRecipeIdx;
  if (idx === null || !mcFilteredRecipes[idx]) {
    container.innerHTML = `
      <div class="mc-ingredients-empty">
        <span>🥧</span>
        <p>Sélectionnez un entremets ou une tarte pour adapter ses quantités.</p>
      </div>`;
    return;
  }

  const recipe = mcFilteredRecipes[idx];
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    container.innerHTML = `<div class="mc-ingredients-empty"><span>📭</span><p>Cette recette n'a pas d'ingrédients enregistrés.</p></div>`;
    return;
  }

  const rows = recipe.ingredients.map(ing => {
    const origQty  = parseFloat(ing.quantity) || 0;
    const newQty   = origQty * coeff;
    const isUp     = newQty > origQty;
    const diffPct  = origQty > 0 ? Math.abs(((newQty - origQty) / origQty) * 100).toFixed(0) : '0';
    const arrow    = isUp ? '↑' : newQty < origQty ? '↓' : '=';
    const arrowCls = isUp ? 'mc-ing-up' : 'mc-ing-down';

    return `
      <div class="mc-ing-row">
        <div class="mc-ing-name">
          <span class="mc-ing-icon">${getIngredientIcon(ing.name)}</span>
          <span>${ing.name}</span>
        </div>
        <div class="mc-ing-from">${origQty.toFixed(1)} ${ing.unit || 'g'}</div>
        <div class="mc-ing-arrow ${arrowCls}">${arrow} ${diffPct}%</div>
        <div class="mc-ing-to"><strong>${newQty.toFixed(1)}</strong> ${ing.unit || 'g'}</div>
      </div>
    `;
  }).join('');

  // Cost impact — use the REAL calcIngredientCost from app.js
  let oldCost = 0, newCost = 0;
  if (typeof calcIngredientCost === 'function') {
    recipe.ingredients.forEach(ing => {
      const origCost = calcIngredientCost(ing);
      oldCost += origCost;
      newCost += origCost * coeff;
    });
  }

  const costRow = (oldCost > 0) ? `
    <div class="mc-cost-summary">
      <span>💰 Coût matière estimé :</span>
      <span><s style="color:var(--text-muted)">${oldCost.toFixed(2)}€</s> → <strong style="color:var(--accent)">${newCost.toFixed(2)}€</strong></span>
    </div>
  ` : '';

  container.innerHTML = `
    <div class="mc-ing-header">
      <span class="mc-ing-col">Ingrédient</span>
      <span class="mc-ing-col">Avant</span>
      <span class="mc-ing-col">Évolution</span>
      <span class="mc-ing-col">Après</span>
    </div>
    ${rows}
    ${costRow}
    <div style="margin-top:1.2rem; display:flex; gap:0.8rem; justify-content:flex-end;">
      <button class="btn btn-sm btn-outline" onclick="mcCopyIngredients()">📋 Copier</button>
      <button class="btn btn-sm btn-primary" onclick="mcApplyToRecipe()">✅ Appliquer à la recette</button>
    </div>
  `;
}

// ============================================================================
// ACTIONS
// ============================================================================

function mcCopyIngredients() {
  const idx = mcState.linkedRecipeIdx;
  if (idx === null || !mcFilteredRecipes[idx]) return;
  const recipe = mcFilteredRecipes[idx];

  const coeff = mcState.coefficient;
  let text = `=== ${recipe.name} — Moule adapté ===\n`;
  text += `Coefficient : ×${coeff.toFixed(3)}\n\n`;
  recipe.ingredients.forEach(ing => {
    const origQty = parseFloat(ing.quantity) || 0;
    text += `• ${ing.name} : ${(origQty * coeff).toFixed(1)} ${ing.unit || 'g'}\n`;
  });

  navigator.clipboard.writeText(text).then(() => {
    showToast('Quantités adaptées copiées !', 'success');
  }).catch(() => {
    showToast('Impossible de copier automatiquement.', 'info');
  });
}

function mcApplyToRecipe() {
  const idx = mcState.linkedRecipeIdx;
  if (idx === null || !mcFilteredRecipes[idx]) return;
  
  let recipe = mcFilteredRecipes[idx];
  const coeff = mcState.coefficient;

  // If global, we clone and save to APP.savedRecipes
  if (recipe.source === 'global') {
    recipe = JSON.parse(JSON.stringify(recipe));
    recipe.id = 'r_' + Date.now();
    recipe.name += ' (Adapté)';
    recipe.source = 'saved';
    if (typeof APP !== 'undefined') {
       APP.savedRecipes.push(recipe);
    }
  }

  recipe.ingredients = recipe.ingredients.map(ing => ({
    ...ing,
    quantity: ((parseFloat(ing.quantity) || 0) * coeff).toFixed(2)
  }));

  if (typeof saveSavedRecipes === 'function') saveSavedRecipes();
  showToast(`✅ Recette "${recipe.name}" mise à jour avec les nouvelles quantités !`, 'success');
  if (typeof triggerChocolateRain === 'function') triggerChocolateRain('light');
}

// ============================================================================
// HELPERS
// ============================================================================

function getIngredientIcon(name) {
  if (!name) return '🥄';
  const n = name.toLowerCase();
  if (n.includes('chocolat') || n.includes('cacao')) return '🍫';
  if (n.includes('framboise') || n.includes('fraise')) return '🍓';
  if (n.includes('beurre')) return '🧈';
  if (n.includes('farine') || n.includes('fécule')) return '🌾';
  if (n.includes('sucre') || n.includes('glucose')) return '🍬';
  if (n.includes('oeuf') || n.includes('œuf')) return '🥚';
  if (n.includes('crème') || n.includes('lait')) return '🥛';
  if (n.includes('vanille')) return '🍦';
  if (n.includes('citron')) return '🍋';
  if (n.includes('amande') || n.includes('noisette') || n.includes('pistache')) return '🥜';
  if (n.includes('gélatine') || n.includes('pectine')) return '🧪';
  if (n.includes('sel')) return '🧂';
  if (n.includes('café') || n.includes('expresso')) return '☕';
  if (n.includes('miel') || n.includes('caramel')) return '🍯';
  if (n.includes('mangue') || n.includes('passion')) return '🥭';
  if (n.includes('noix de coco')) return '🥥';
  return '🥄';
}
window.getIngredientIcon = getIngredientIcon;

// Inject tart preset button styles
(function injectMCExtras() {
  if (document.getElementById('mcExtrasCSS')) return;
  const s = document.createElement('style');
  s.id = 'mcExtrasCSS';
  s.textContent = `
    .mc-tart-presets { margin-top: 0.8rem; }
    .mc-tart-presets-label { font-size: 0.72rem; font-weight: 700; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.4rem; }
    .mc-tart-presets-btns { display: flex; flex-wrap: wrap; gap: 5px; }
    .mc-tart-btn {
      padding: 4px 10px; font-size: 0.78rem; font-weight: 700;
      border: 1.5px solid var(--surface-border, #ddd); border-radius: 8px;
      background: var(--surface, #fff); color: var(--text-secondary);
      cursor: pointer; transition: all 0.15s;
    }
    .mc-tart-btn:hover { border-color: var(--accent, #6366f1); color: var(--accent); background: rgba(99,102,241,0.06); }
    .mc-tart-btn.active { border-color: var(--accent, #6366f1); background: var(--accent, #6366f1); color: #fff; }
  `;
  document.head.appendChild(s);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => {});
})();

// Global event bindings
window.mcChangeFromShape = mcChangeFromShape;
window.mcChangeToShape   = mcChangeToShape;
window.mcUpdateDim       = mcUpdateDim;
window.mcSelectRecipe    = mcSelectRecipe;
window.mcCalculate       = mcCalculate;
window.mcCopyIngredients = mcCopyIngredients;
window.mcApplyToRecipe   = mcApplyToRecipe;
