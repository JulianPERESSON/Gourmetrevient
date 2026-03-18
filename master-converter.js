/*
  =====================================================================
  MASTER-CONVERTER.JS — GourmetRevient v5.1
  Géométrie Culinaire — Convertisseur de Moules Premium
  Calcul de volumes 3D → Coefficient → Adaptation quantités
  =====================================================================
*/

// ============================================================================
// GEOMETRY ENGINE
// ============================================================================

const MC_SHAPES = {
  cercle:    { label: '⭕ Cercle',          fields: ['diameter', 'height'],              icon: '⭕' },
  carre:     { label: '⬛ Carré',            fields: ['side', 'height'],                  icon: '⬛' },
  rectangle: { label: '▭ Rectangle/Cadre', fields: ['length', 'width', 'height'],        icon: '▭'  },
  buche:     { label: '🪵 Bûche',            fields: ['length', 'diameter', 'height'],    icon: '🪵' },
  verrine:   { label: '🥃 Verrine/Demi-Sphère', fields: ['diameter', 'height'],          icon: '🥃' },
  tarte:     { label: '🥧 Moule à tarte',   fields: ['diameter', 'height'],              icon: '🥧' },
};

/**
 * Calculate the volume (cm³) of a mold shape
 * All dimensions in cm
 */
function mcVolume(shape, dims) {
  const { d = 0, h = 0, l = 0, w = 0, side = 0 } = dims;

  switch (shape) {
    case 'cercle':
    case 'tarte':
      // Cylinder: π * r² * h
      return Math.PI * Math.pow(d / 2, 2) * h;

    case 'carre':
      // Cube/prism: a² * h
      return side * side * h;

    case 'rectangle':
      // Box: l * w * h
      return l * w * h;

    case 'buche':
      // Half-cylinder log: (π * r² / 2) * l
      return (Math.PI * Math.pow(d / 2, 2) / 2) * l;

    case 'verrine':
      // Cylinder (treat as simple cylinder for ratio)
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
  fromShape: 'cercle',
  toShape:   'cercle',
  fromDims:  { d: 18, h: 4.5 },
  toDims:    { d: 24, h: 5.0 },
  coefficient: 1,
  linkedRecipeIdx: null,
};

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

  const opts = Object.entries(MC_SHAPES).map(([k, s]) =>
    `<option value="${k}">${s.label}</option>`
  ).join('');

  fromSel.innerHTML = opts;
  toSel.innerHTML   = opts;

  fromSel.value = mcState.fromShape;
  toSel.value   = mcState.toShape;

  renderMCFields('from', mcState.fromShape);
  renderMCFields('to',   mcState.toShape);
}

function renderMCFields(side, shape) {
  const container = document.getElementById(`mc${cap(side)}Fields`);
  if (!container) return;

  const dims = mcState[side === 'from' ? 'fromDims' : 'toDims'];
  const fields = MC_SHAPES[shape]?.fields || [];
  const labels = {
    diameter: 'Diamètre (cm)',
    side:     'Côté (cm)',
    length:   'Longueur (cm)',
    width:    'Largeur (cm)',
    height:   'Hauteur (cm)',
  };
  const defaults = {
    diameter: side === 'from' ? 18 : 24,
    side:     side === 'from' ? 16 : 22,
    length:   side === 'from' ? 30 : 40,
    width:    side === 'from' ? 10 : 12,
    height:   side === 'from' ? 4.5 : 5.0,
  };

  container.innerHTML = fields.map(f => `
    <div class="mc-field-group">
      <label>${labels[f]}</label>
      <div class="mc-input-wrapper">
        <input type="number" 
               id="mc${cap(side)}_${f}" 
               class="form-input mc-input" 
               value="${dims[f[0]] || defaults[f]}" 
               min="1" max="200" step="0.5"
               oninput="mcUpdateDim('${side}', '${f}', this.value)">
        <span class="mc-unit">cm</span>
      </div>
    </div>
  `).join('');
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

function populateMCRecipeSelect() {
  const sel = document.getElementById('mcRecipeSelect');
  if (!sel) return;
  const recipes = (typeof APP !== 'undefined' && APP.savedRecipes) ? APP.savedRecipes : [];
  sel.innerHTML = `<option value="">— Aucune recette (calcul seul) —</option>` +
    recipes.map((r, i) => `<option value="${i}">${r.name}</option>`).join('');
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
  const key = field === 'diameter' ? 'd' : field === 'side' ? 'side' : field === 'length' ? 'l' : field === 'width' ? 'w' : 'h';
  const dimObj = side === 'from' ? mcState.fromDims : mcState.toDims;
  dimObj[key] = parseFloat(val) || 0;
  mcCalculate();
}

function mcSelectRecipe(idx) {
  mcState.linkedRecipeIdx = idx !== '' ? parseInt(idx) : null;
  mcCalculate();
}

// ============================================================================
// CORE CALCULATION
// ============================================================================

function mcCalculate() {
  // Sync dims from inputs
  syncMCDims('from');
  syncMCDims('to');

  const vFrom = mcVolume(mcState.fromShape, mcState.fromDims);
  const vTo   = mcVolume(mcState.toShape,   mcState.toDims);
  const coeff = mcCoefficient(vFrom, vTo);

  mcState.coefficient = coeff;

  // Render results
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
      const key = f === 'diameter' ? 'd' : f === 'side' ? 'side' : f === 'length' ? 'l' : f === 'width' ? 'w' : 'h';
      dims[key] = parseFloat(el.value) || 0;
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
  const color = coeff > 1 ? 'var(--gold)' : coeff < 1 ? '#6366f1' : 'var(--success)';

  // Round to nearest "nice" portion adjustment
  const portionLabel = coeff > 1
    ? `Multipliez les quantités par <strong>${coeff.toFixed(3)}</strong>`
    : `Réduisez les quantités par <strong>${(1/coeff).toFixed(3)}</strong>`;

  panel.innerHTML = `
    <div class="mc-result-grid">

      <div class="mc-kpi">
        <div class="mc-kpi-label">Volume Initial</div>
        <div class="mc-kpi-value">${Math.round(vFrom)} cm³</div>
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
  const MAX_W = 180, MAX_H = 150;

  // Normalize sizes for visual representation
  function normShape(shape, dims) {
    switch (shape) {
      case 'cercle':
      case 'tarte':
      case 'verrine':
        return { type: 'ellipse', w: (dims.d || 18), h: (dims.h || 4.5) };
      case 'carre':
        return { type: 'rect', w: (dims.side || 18), h: (dims.h || 4.5) };
      case 'rectangle':
        return { type: 'rect', w: (dims.l || 30), h: (dims.h || 4.5) };
      case 'buche':
        return { type: 'buche', w: (dims.l || 30), h: (dims.d || 8) };
      default:
        return { type: 'rect', w: 20, h: 5 };
    }
  }

  const from = normShape(shapeFrom, dimsFrom);
  const to   = normShape(shapeTo, dimsTo);

  // Scale to fit within MAX_W/MAX_H
  const maxDim = Math.max(from.w, to.w, from.h * 6, to.h * 6, 1);
  function scale(v)  { return (v / maxDim) * MAX_W; }
  function scaleH(v) { return Math.max(20, (v / maxDim) * MAX_H * 2.5); }

  function drawShape(shape, x, y, color, label, dims) {
    const sw = scale(shape.w);
    const sh = scaleH(shape.h);
    let svg = '';
    const cx = x, cy = y - sh / 2;

    // Top face (ellipse cap for 3D effect on circles)
    if (shape.type === 'ellipse') {
      const rx = sw / 2, ry = rx * 0.22;
      // Side wall (darker)
      svg += `<ellipse cx="${cx}" cy="${y}" rx="${rx}" ry="${ry}" fill="${color}" opacity="0.7"/>`;
      // Cylinder body
      svg += `
        <path d="M ${cx - rx} ${y - sh} Q ${cx} ${y - sh - ry * 2} ${cx + rx} ${y - sh}
                 L ${cx + rx} ${y}
                 Q ${cx} ${y + ry * 2} ${cx - rx} ${y} Z"
              fill="${color}" opacity="0.5"/>
      `;
      // Top cap
      svg += `<ellipse cx="${cx}" cy="${y - sh}" rx="${rx}" ry="${ry}" fill="${color}" opacity="0.9" stroke="white" stroke-width="1"/>`;
    } else if (shape.type === 'buche') {
      const rx = sw / 2, ry = Math.max(10, sh / 2);
      // Half-cylinder (bûche shape)
      svg += `
        <path d="M ${cx - rx} ${y}
                 A ${sw} ${ry} 0 0 1 ${cx + rx} ${y}
                 L ${cx + rx} ${y - sh * 0.6}
                 A ${sw} ${ry * 0.4} 0 0 0 ${cx - rx} ${y - sh * 0.6} Z"
              fill="${color}" opacity="0.65"/>
        <ellipse cx="${cx}" cy="${y - sh * 0.6}" rx="${rx}" ry="${ry * 0.4}" fill="${color}" opacity="0.9" stroke="white" stroke-width="1"/>
      `;
    } else {
      // Rectangle/square prism
      const hw = sw / 2;
      const perspective = 12;
      svg += `
        <!-- Front face -->
        <rect x="${cx - hw}" y="${y - sh}" width="${sw}" height="${sh}" fill="${color}" opacity="0.6"/>
        <!-- Top face with perspective -->
        <path d="M ${cx - hw} ${y - sh}
                 L ${cx - hw + perspective} ${y - sh - perspective * 0.5}
                 L ${cx + hw + perspective} ${y - sh - perspective * 0.5}
                 L ${cx + hw} ${y - sh} Z"
              fill="${color}" opacity="0.9"/>
        <!-- Right face -->
        <path d="M ${cx + hw} ${y - sh}
                 L ${cx + hw + perspective} ${y - sh - perspective * 0.5}
                 L ${cx + hw + perspective} ${y - perspective * 0.5}
                 L ${cx + hw} ${y} Z"
              fill="${color}" opacity="0.4"/>
        <rect x="${cx - hw}" y="${y - sh}" width="${sw}" height="${sh}" fill="none" stroke="white" stroke-width="1" opacity="0.6"/>
      `;
    }

    // Size label below
    svg += `
      <text x="${cx}" y="${y + 20}" text-anchor="middle" font-family="Inter, sans-serif" font-size="11" fill="var(--text-muted)">${label}</text>
    `;
    return svg;
  }

  // Positions
  const yBase = H - 30;
  const x1 = W * 0.27;
  const x2 = W * 0.73;

  const fromLabel = buildLabel(shapeFrom, dimsFrom);
  const toLabel   = buildLabel(shapeTo,   dimsTo);
  const coeff     = mcState.coefficient;
  const arrowColor = coeff > 1.05 ? '#C5A55A' : coeff < 0.95 ? '#6366f1' : '#10b981';

  const svgContent = `
    <svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      <!-- Background grid -->
      <defs>
        <pattern id="mcGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(197,165,90,0.06)" stroke-width="1"/>
        </pattern>
      </defs>
      <rect width="${W}" height="${H}" fill="url(#mcGrid)" rx="12"/>

      <!-- FROM label -->
      <text x="${x1}" y="22" text-anchor="middle" font-family="Playfair Display, serif" font-size="13" font-weight="700" fill="var(--text)">Moule initial</text>

      <!-- Mold FROM -->
      ${drawShape(normShape(shapeFrom, dimsFrom), x1, yBase - 10, '#8B5E3C', fromLabel, dimsFrom)}

      <!-- Arrow with coefficient -->
      <line x1="${x1 + 40}" y1="${yBase - 50}" x2="${x2 - 40}" y2="${yBase - 50}" 
            stroke="${arrowColor}" stroke-width="2.5" stroke-dasharray="6,3" marker-end="url(#arrowHead)"/>
      <defs>
        <marker id="arrowHead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
          <polygon points="0 0, 10 3.5, 0 7" fill="${arrowColor}"/>
        </marker>
      </defs>

      <!-- Coefficient badge -->
      <rect x="${W/2 - 32}" y="${yBase - 72}" width="64" height="26" rx="13" fill="${arrowColor}" opacity="0.15"/>
      <text x="${W/2}" y="${yBase - 54}" text-anchor="middle" font-family="Inter, sans-serif" font-size="13" font-weight="800" fill="${arrowColor}">
        × ${coeff.toFixed(2)}
      </text>

      <!-- TO label -->
      <text x="${x2}" y="22" text-anchor="middle" font-family="Playfair Display, serif" font-size="13" font-weight="700" fill="var(--text)">Nouveau moule</text>

      <!-- Mold TO -->
      ${drawShape(normShape(shapeTo, dimsTo), x2, yBase - 10, '#C5A55A', toLabel, dimsTo)}

    </svg>
  `;

  container.innerHTML = svgContent;
}

function buildLabel(shape, dims) {
  switch (shape) {
    case 'cercle':
    case 'tarte':
    case 'verrine': return `Ø${dims.d || '?'}cm × H${dims.h || '?'}cm`;
    case 'carre':   return `${dims.side || '?'}×${dims.side || '?'}cm × H${dims.h || '?'}cm`;
    case 'rectangle': return `${dims.l || '?'}×${dims.w || '?'}cm × H${dims.h || '?'}cm`;
    case 'buche':   return `L${dims.l || '?'}cm × Ø${dims.d || '?'}cm`;
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

  // If no recipe linked, show placeholder
  if (idx === null || idx === undefined || idx === '') {
    const savedRecipes = (typeof APP !== 'undefined' && APP.savedRecipes) ? APP.savedRecipes : [];
    if (savedRecipes.length === 0) {
      container.innerHTML = `
        <div class="mc-ingredients-empty">
          <span>🍽️</span>
          <p>Créez ou sélectionnez une recette pour voir les quantités adaptées.</p>
        </div>`;
    } else {
      container.innerHTML = `
        <div class="mc-ingredients-empty">
          <span>👆</span>
          <p>Sélectionnez une recette dans le menu ci-dessus pour adapter ses quantités.</p>
        </div>`;
    }
    return;
  }

  const recipes = (typeof APP !== 'undefined' && APP.savedRecipes) ? APP.savedRecipes : [];
  const recipe = recipes[idx];
  if (!recipe || !recipe.ingredients || recipe.ingredients.length === 0) {
    container.innerHTML = `<div class="mc-ingredients-empty"><span>📭</span><p>Cette recette n'a pas d'ingrédients enregistrés.</p></div>`;
    return;
  }

  const rows = recipe.ingredients.map(ing => {
    const origQty  = parseFloat(ing.quantity) || 0;
    const newQty   = origQty * coeff;
    const isUp     = newQty > origQty;
    const diffPct  = Math.abs(((newQty - origQty) / (origQty || 1)) * 100).toFixed(0);
    const arrow    = isUp ? '↑' : '↓';
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

  // Cost impact
  let oldCost = 0, newCost = 0;
  recipe.ingredients.forEach(ing => {
    const dbItem = (typeof APP !== 'undefined' && APP.ingredientDb)
      ? APP.ingredientDb.find(d => d.name.toLowerCase() === ing.name.toLowerCase())
      : null;
    if (dbItem) {
      const qty = parseFloat(ing.quantity) || 0;
      const ppu = dbItem.pricePerUnit || 0;
      const unit = (ing.unit || 'g').toLowerCase();
      const factor = (unit === 'kg' || unit === 'l') ? 1 : 0.001;
      oldCost += qty * factor * ppu;
      newCost += qty * coeff * factor * ppu;
    }
  });

  const costRow = (oldCost > 0) ? `
    <div class="mc-cost-summary">
      <span>💰 Coût matière estimé :</span>
      <span><s style="color:var(--text-muted)">${oldCost.toFixed(2)}€</s> → <strong style="color:var(--gold)">${newCost.toFixed(2)}€</strong></span>
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
  const recipes = (typeof APP !== 'undefined' && APP.savedRecipes) ? APP.savedRecipes : [];
  const recipe = recipes[idx];
  if (!recipe) return;

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
  if (idx === null) return;
  const recipes = (typeof APP !== 'undefined' && APP.savedRecipes) ? APP.savedRecipes : [];
  const recipe = recipes[idx];
  if (!recipe) return;

  const coeff = mcState.coefficient;
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

// Global event bindings
window.mcChangeFromShape = mcChangeFromShape;
window.mcChangeToShape   = mcChangeToShape;
window.mcUpdateDim       = mcUpdateDim;
window.mcSelectRecipe    = mcSelectRecipe;
window.mcCalculate       = mcCalculate;
window.mcCopyIngredients = mcCopyIngredients;
window.mcApplyToRecipe   = mcApplyToRecipe;
