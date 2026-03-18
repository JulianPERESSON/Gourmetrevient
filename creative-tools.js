/*
  =====================================================================
  CREATIVE-TOOLS.JS — GourmetRevient v5.0
  - Chef's Brain: Flavor Pairing Generator with Cost Analysis
  - Assembly Simulator: Drag & Drop Entremets Builder
  =====================================================================
*/

// ============================================================================
// 1. CHEF'S BRAIN — FLAVOR PAIRING ENGINE
// ============================================================================

/**
 * Comprehensive flavor pairing database
 * Each ingredient maps to an array of pairings with:
 * - name: matching ingredient
 * - harmony: 'classique' | 'audacieux' | 'signature'
 * - icon: visual emoji
 */
const FLAVOR_PAIRINGS = {
  'framboise': [
    { name: 'Chocolat noir 64%', harmony: 'classique', icon: '🍫', note: 'Accord incontournable' },
    { name: 'Chocolat Blanc 33%', harmony: 'classique', icon: '🤍', note: 'Douceur et acidité' },
    { name: 'Pistache', harmony: 'classique', icon: '💚', note: 'Le duo magique' },
    { name: 'Poudre d\'amandes', harmony: 'classique', icon: '🥜', note: 'Tarte biscuit' },
    { name: 'Vanille (gousse)', harmony: 'classique', icon: '🍦', note: 'Crème pâtissière' },
    { name: 'Citron Vert', harmony: 'audacieux', icon: '🍋', note: 'Vivacité tropicale' },
    { name: 'Menthe Fraîche', harmony: 'audacieux', icon: '🌿', note: 'Fraîcheur estivale' },
    { name: 'Eau de Fleur d\'Oranger', harmony: 'signature', icon: '🌸', note: 'Touche orientale' },
    { name: 'Mascarpone', harmony: 'signature', icon: '🧀', note: 'Velouté crémeux' },
  ],
  'chocolat': [
    { name: 'Purée de Framboise', harmony: 'classique', icon: '🍓', note: 'Fondant fruité' },
    { name: 'Purée de Passion', harmony: 'classique', icon: '🥝', note: 'Exotique intense' },
    { name: 'Noisettes torréfiées', harmony: 'classique', icon: '🌰', note: 'Praliné croustillant' },
    { name: 'Pâte de Noisette 100%', harmony: 'classique', icon: '🥜', note: 'Gianduja' },
    { name: 'Café soluble', harmony: 'classique', icon: '☕', note: 'Profondeur torréfiée' },
    { name: 'Fleur de Sel de Guérande', harmony: 'audacieux', icon: '🧂', note: 'Contraste saisissant' },
    { name: 'Beurre de Cacao', harmony: 'classique', icon: '🧈', note: 'Onctuosité pure' },
    { name: 'Purée de Yuzu', harmony: 'signature', icon: '🍊', note: 'Agrume rare japonais' },
    { name: 'Poivre de Timut', harmony: 'signature', icon: '🌶️', note: 'Notes florales épicées' },
  ],
  'vanille': [
    { name: 'Fraises fraîches', harmony: 'classique', icon: '🍓', note: 'Classique indémodable' },
    { name: 'Crème 35% MG', harmony: 'classique', icon: '🥛', note: 'Crème Chantilly' },
    { name: 'Chocolat au Lait 35%', harmony: 'classique', icon: '🍫', note: 'Doux et gourmand' },
    { name: 'Poudre d\'amandes', harmony: 'classique', icon: '🥜', note: 'Frangipane' },
    { name: 'Miel de Fleurs', harmony: 'audacieux', icon: '🍯', note: 'Subtilité florale' },
    { name: 'Thé Matcha', harmony: 'audacieux', icon: '🍵', note: 'Umami et douceur' },
    { name: 'Purée de Mangue', harmony: 'audacieux', icon: '🥭', note: 'Exotisme solaire' },
    { name: 'Tonka (fèves entières)', harmony: 'signature', icon: '✨', note: 'Mystère boisé' },
  ],
  'pistache': [
    { name: 'Purée de Framboise', harmony: 'classique', icon: '🍓', note: 'Le duo star' },
    { name: 'Purée de Fraise', harmony: 'classique', icon: '🫐', note: 'Fruit et croquant' },
    { name: 'Chocolat Blanc 33%', harmony: 'classique', icon: '🤍', note: 'Douceur verte' },
    { name: 'Eau de Fleur d\'Oranger', harmony: 'audacieux', icon: '🌸', note: 'Inspiration orientale' },
    { name: 'Miel de Fleurs', harmony: 'audacieux', icon: '🍯', note: 'Nougat glacé' },
    { name: 'Purée de Mangue', harmony: 'signature', icon: '🥭', note: 'Contraste exotique' },
    { name: 'Amaretto Disaronno', harmony: 'signature', icon: '🥃', note: 'Liqueur italienne' },
  ],
  'citron': [
    { name: 'Beurre AOP', harmony: 'classique', icon: '🧈', note: 'Tarte au citron' },
    { name: 'Poudre d\'amandes', harmony: 'classique', icon: '🥜', note: 'Financier citron' },
    { name: 'Purée de Framboise', harmony: 'classique', icon: '🍓', note: 'Acidité doublée' },
    { name: 'Thé Matcha', harmony: 'audacieux', icon: '🍵', note: 'Zen et pep' },
    { name: 'Menthe Fraîche', harmony: 'audacieux', icon: '🌿', note: 'Mojito glacé' },
    { name: 'Purée de Bergamote', harmony: 'signature', icon: '🍊', note: 'Earl Grey effect' },
    { name: 'Purée de Yuzu', harmony: 'signature', icon: '✨', note: 'Agrume noble' },
  ],
  'café': [
    { name: 'Chocolat noir 64%', harmony: 'classique', icon: '🍫', note: 'Opéra, Moka' },
    { name: 'Noisettes torréfiées', harmony: 'classique', icon: '🌰', note: 'Craquant torréfié' },
    { name: 'Beurre AOP', harmony: 'classique', icon: '🧈', note: 'Crème au beurre café' },
    { name: 'Mascarpone', harmony: 'classique', icon: '🧀', note: 'Tiramisu' },
    { name: 'Chocolat Dulcey 35%', harmony: 'audacieux', icon: '🤎', note: 'Blond et torréfié' },
    { name: 'Purée de Cassis', harmony: 'signature', icon: '🫐', note: 'Fruité sombre' },
  ],
  'caramel': [
    { name: 'Beurre AOP', harmony: 'classique', icon: '🧈', note: 'Caramel au beurre salé' },
    { name: 'Fleur de Sel de Guérande', harmony: 'classique', icon: '🧂', note: 'Le CBS parfait' },
    { name: 'Pomme Golden', harmony: 'classique', icon: '🍎', note: 'Tatin' },
    { name: 'Poire Williams', harmony: 'audacieux', icon: '🍐', note: 'Fondant automnal' },
    { name: 'Chocolat au Lait 35%', harmony: 'classique', icon: '🍫', note: 'Snickers gourmet' },
    { name: 'Tonka (fèves entières)', harmony: 'signature', icon: '✨', note: 'Profondeur mystérieuse' },
  ],
  'noisette': [
    { name: 'Chocolat noir 64%', harmony: 'classique', icon: '🍫', note: 'Gianduja noir' },
    { name: 'Chocolat au Lait 35%', harmony: 'classique', icon: '🤎', note: 'Praliné lait' },
    { name: 'Beurre AOP', harmony: 'classique', icon: '🧈', note: 'Dacquoise' },
    { name: 'Café soluble', harmony: 'audacieux', icon: '☕', note: 'Torréfaction doublée' },
    { name: 'Purée de Framboise', harmony: 'audacieux', icon: '🍓', note: 'Fruité contrasté' },
    { name: 'Sirop d\'Erable Grade A', harmony: 'signature', icon: '🍁', note: 'Saveur québécoise' },
  ],
  'mangue': [
    { name: 'Purée de Passion', harmony: 'classique', icon: '🥝', note: 'Exotique classique' },
    { name: 'Noix de Coco Râpée', harmony: 'classique', icon: '🥥', note: 'Tropical dream' },
    { name: 'Citron Vert', harmony: 'classique', icon: '🍋', note: 'Vivacité tropicale' },
    { name: 'Chocolat Blanc 33%', harmony: 'audacieux', icon: '🤍', note: 'Insert mangue' },
    { name: 'Pâte de pistache', harmony: 'signature', icon: '💚', note: 'Vert et or' },
    { name: 'Purée de Bergamote', harmony: 'signature', icon: '🍊', note: 'Agrume raffiné' },
  ],
};

// Reverse map for finding pairings by ingredient name
const PAIRING_KEYWORDS = {};
Object.keys(FLAVOR_PAIRINGS).forEach(key => {
  PAIRING_KEYWORDS[key] = key;
});

// Selected pairings state
let cbSelectedIngredient = null;
let cbSelectedPairings = [];

function openChefsBrain() {
  const modal = document.getElementById('chefsBrainModal');
  if (modal) modal.style.display = 'flex';
  document.getElementById('chefBrainSearch').value = '';
  document.getElementById('chefBrainSelected').style.display = 'none';
  document.getElementById('chefBrainCost').style.display = 'none';
  cbSelectedIngredient = null;
  cbSelectedPairings = [];

  // Show initial empty state
  const grid = document.getElementById('chefBrainPairings');
  grid.innerHTML = `
    <div class="cb-empty-state" style="grid-column: 1/-1;">
      <span class="cb-empty-icon">🧠</span>
      <p>Tapez le nom d'un ingrédient pour découvrir ses meilleurs accords de saveurs.</p>
      <p style="font-size:0.75rem; margin-top:0.5rem; opacity:0.7;">
        Essayez : Framboise, Chocolat, Vanille, Pistache, Citron, Café, Caramel, Noisette, Mangue
      </p>
    </div>
  `;
}

function closeChefsBrain() {
  const modal = document.getElementById('chefsBrainModal');
  if (modal) modal.style.display = 'none';
}

function searchChefsBrain(query) {
  const q = query.toLowerCase().trim();
  if (q.length < 2) {
    document.getElementById('chefBrainSelected').style.display = 'none';
    document.getElementById('chefBrainCost').style.display = 'none';
    cbSelectedPairings = [];
    return;
  }

  // Find matching flavor category
  let matchedKey = null;
  for (const key of Object.keys(FLAVOR_PAIRINGS)) {
    if (key.includes(q) || q.includes(key)) {
      matchedKey = key;
      break;
    }
  }

  if (!matchedKey) {
    document.getElementById('chefBrainPairings').innerHTML = `
      <div class="cb-empty-state" style="grid-column: 1/-1;">
        <span class="cb-empty-icon">🔍</span>
        <p>Aucun accord trouvé pour "<strong>${query}</strong>".</p>
        <p style="font-size:0.75rem; margin-top:0.5rem; opacity:0.7;">
          Essayez : Framboise, Chocolat, Vanille, Pistache, Citron, Café, Caramel, Noisette, Mangue
        </p>
      </div>
    `;
    document.getElementById('chefBrainSelected').style.display = 'none';
    document.getElementById('chefBrainCost').style.display = 'none';
    return;
  }

  // Find the ingredient in the DB to show price
  const dbIng = (typeof APP !== 'undefined' && APP.ingredientDb)
    ? APP.ingredientDb.find(i => i.name.toLowerCase().includes(matchedKey))
    : null;

  cbSelectedIngredient = {
    key: matchedKey,
    name: dbIng ? dbIng.name : (matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1)),
    price: dbIng ? dbIng.pricePerUnit : 0,
    priceRef: dbIng ? (dbIng.priceRef || 'kg') : 'kg',
    icon: getIngredientIcon(matchedKey)
  };

  // Show selected card
  const selDiv = document.getElementById('chefBrainSelected');
  selDiv.style.display = 'block';
  document.getElementById('cbSelectedIcon').textContent = cbSelectedIngredient.icon;
  document.getElementById('cbSelectedName').textContent = cbSelectedIngredient.name;
  document.getElementById('cbSelectedPrice').textContent = `${cbSelectedIngredient.price.toFixed(2)} €/${cbSelectedIngredient.priceRef}`;

  // Render pairings
  cbSelectedPairings = [];
  renderChefsBrainPairings(FLAVOR_PAIRINGS[matchedKey]);
}

function renderChefsBrainPairings(pairings) {
  const grid = document.getElementById('chefBrainPairings');
  if (!grid || !pairings) return;

  // Group by harmony
  const groups = {
    'classique': { label: '🏛️ Accords Classiques', items: [] },
    'audacieux': { label: '🔥 Accords Audacieux', items: [] },
    'signature': { label: '✨ Accords Signature', items: [] }
  };

  pairings.forEach(p => {
    const group = groups[p.harmony] || groups['classique'];
    // Find price in DB
    const dbItem = (typeof APP !== 'undefined' && APP.ingredientDb)
      ? APP.ingredientDb.find(i => i.name.toLowerCase() === p.name.toLowerCase())
      : null;
    group.items.push({ ...p, price: dbItem ? dbItem.pricePerUnit : null, priceRef: dbItem ? (dbItem.priceRef || 'kg') : 'kg' });
  });

  let html = '';
  for (const [key, group] of Object.entries(groups)) {
    if (group.items.length === 0) continue;
    html += `<div class="cb-pairing-category-label">${group.label}</div>`;
    group.items.forEach((p, idx) => {
      const globalIdx = pairings.indexOf(pairings.find(pp => pp.name === p.name));
      const harmonyClass = p.harmony === 'audacieux' ? 'medium' : (p.harmony === 'signature' ? 'bold' : '');
      const priceText = p.price !== null ? `${p.price.toFixed(2)}€/${p.priceRef}` : '—';
      html += `
        <div class="cb-pairing-card" onclick="toggleChefPairing(${globalIdx})" id="cbPair-${globalIdx}">
          <span class="cb-pair-harmony ${harmonyClass}">${p.harmony === 'classique' ? '★' : (p.harmony === 'audacieux' ? '⚡' : '💎')}</span>
          <span class="cb-pair-icon">${p.icon}</span>
          <span class="cb-pair-name">${p.name.length > 20 ? p.name.substring(0, 18) + '…' : p.name}</span>
          <span class="cb-pair-price">${priceText}</span>
          <span style="font-size:0.7rem; color:var(--text-muted); margin-top:2px; display:block; font-style:italic;">${p.note}</span>
        </div>
      `;
    });
  }

  grid.innerHTML = html;
}

function toggleChefPairing(idx) {
  if (!cbSelectedIngredient) return;
  const pairings = FLAVOR_PAIRINGS[cbSelectedIngredient.key];
  if (!pairings || !pairings[idx]) return;

  const card = document.getElementById(`cbPair-${idx}`);
  const isSelected = cbSelectedPairings.includes(idx);

  if (isSelected) {
    cbSelectedPairings = cbSelectedPairings.filter(i => i !== idx);
    if (card) card.classList.remove('selected');
  } else {
    cbSelectedPairings.push(idx);
    if (card) card.classList.add('selected');
  }

  updateChefBrainCost(pairings);
}

function updateChefBrainCost(pairings) {
  const costPanel = document.getElementById('chefBrainCost');
  const costDetails = document.getElementById('cbCostDetails');
  if (!costPanel || !costDetails) return;

  if (cbSelectedPairings.length === 0) {
    costPanel.style.display = 'none';
    return;
  }

  costPanel.style.display = 'block';

  // Build cost rows
  const items = [];
  // Add base ingredient
  items.push({
    icon: cbSelectedIngredient.icon,
    name: cbSelectedIngredient.name,
    price: cbSelectedIngredient.price,
    qty: 200, // default 200g base
    unit: 'g',
    priceRef: cbSelectedIngredient.priceRef
  });

  // Add selected pairings
  cbSelectedPairings.forEach(idx => {
    const p = pairings[idx];
    const dbItem = (typeof APP !== 'undefined' && APP.ingredientDb)
      ? APP.ingredientDb.find(i => i.name.toLowerCase() === p.name.toLowerCase())
      : null;
    items.push({
      icon: p.icon,
      name: p.name,
      price: dbItem ? dbItem.pricePerUnit : 5,
      qty: 100, // default 100g companion
      unit: dbItem ? dbItem.unit : 'g',
      priceRef: dbItem ? (dbItem.priceRef || 'kg') : 'kg'
    });
  });

  let totalCost = 0;
  let html = '';

  items.forEach(item => {
    let cost = 0;
    if (item.unit === 'pièce') {
      cost = item.price * (item.qty / 100); // approximation
    } else {
      cost = (item.qty / 1000) * item.price;
    }
    totalCost += cost;
    html += `
      <div class="cb-cost-row">
        <span class="cb-cost-name">${item.icon} ${item.name} <small style="color:var(--text-muted)">(~${item.qty}${item.unit})</small></span>
        <span class="cb-cost-value">${cost.toFixed(2)} €</span>
      </div>
    `;
  });

  // Estimated selling price (70% margin)
  const sellingPrice = totalCost / (1 - 0.70);
  const marginPerPortion = sellingPrice - totalCost;

  html += `
    <div class="cb-cost-row">
      <span class="cb-cost-name">💰 Coût matière estimé (1 portion)</span>
      <span class="cb-cost-value">${totalCost.toFixed(2)} €</span>
    </div>
  `;

  // Verdict
  let verdictClass = 'profitable';
  let verdictText = `✅ Rentable ! Prix de vente suggéré : ${sellingPrice.toFixed(2)}€ (marge 70%)`;
  if (totalCost > 5) {
    verdictClass = 'warning';
    verdictText = `⚠️ Coût élevé. Prix de vente suggéré : ${sellingPrice.toFixed(2)}€ — Réduisez les quantités.`;
  }
  if (totalCost > 10) {
    verdictClass = 'danger';
    verdictText = `⛔ Coût très élevé (${totalCost.toFixed(2)}€). Ce mélange sera difficile à vendre rentablement.`;
  }

  html += `<div class="cb-cost-verdict ${verdictClass}">${verdictText}</div>`;

  costDetails.innerHTML = html;
}

// ============================================================================
// 2. ASSEMBLY SIMULATOR — ENTREMETS BUILDER
// ============================================================================

/**
 * Component palette for entremets layers
 */
const ASSEMBLY_COMPONENTS = [
  { id: 'biscuit_joconde', name: 'Biscuit Joconde', height: 1.0, color: '#D4A574', icon: '🍰', category: 'Biscuits' },
  { id: 'genoise',         name: 'Génoise',         height: 1.5, color: '#E8C99B', icon: '🧁', category: 'Biscuits' },
  { id: 'dacquoise',       name: 'Dacquoise',       height: 1.0, color: '#C9A96E', icon: '🥜', category: 'Biscuits' },
  { id: 'sable_breton',    name: 'Sablé Breton',    height: 0.8, color: '#C5A55A', icon: '🍪', category: 'Biscuits' },
  { id: 'croustillant',    name: 'Croustillant',     height: 0.5, color: '#A67B3D', icon: '✨', category: 'Biscuits' },
  { id: 'streusel',        name: 'Streusel',         height: 0.5, color: '#B8956A', icon: '🔶', category: 'Biscuits' },
  { id: 'mousse_chocolat', name: 'Mousse Chocolat',  height: 3.0, color: '#5C3A1E', icon: '🍫', category: 'Mousses' },
  { id: 'mousse_fruit',    name: 'Mousse Fruit',     height: 3.0, color: '#E85D75', icon: '🍓', category: 'Mousses' },
  { id: 'mousse_vanille',  name: 'Mousse Vanille',   height: 3.0, color: '#FFF5E1', icon: '🍦', category: 'Mousses' },
  { id: 'bavarois',        name: 'Bavarois',         height: 2.5, color: '#FFE4C4', icon: '🥛', category: 'Mousses' },
  { id: 'cremeux',         name: 'Crémeux',          height: 1.5, color: '#6B4226', icon: '🤎', category: 'Crèmes' },
  { id: 'creme_brulee',    name: 'Crème Brûlée',     height: 1.5, color: '#E8D5A3', icon: '🔥', category: 'Crèmes' },
  { id: 'ganache',         name: 'Ganache',          height: 1.0, color: '#3C1F0E', icon: '🍫', category: 'Crèmes' },
  { id: 'curd_citron',     name: 'Curd Citron',      height: 1.0, color: '#F5E050', icon: '🍋', category: 'Crèmes' },
  { id: 'insert_fruit',    name: 'Insert Fruits',    height: 1.5, color: '#FF6B6B', icon: '🍒', category: 'Inserts' },
  { id: 'insert_caramel',  name: 'Insert Caramel',   height: 1.0, color: '#D4840A', icon: '🍯', category: 'Inserts' },
  { id: 'confit',          name: 'Confit / Compotée', height: 1.0, color: '#8B2252', icon: '🫙', category: 'Inserts' },
  { id: 'gelee',           name: 'Gelée Mirror',     height: 0.5, color: '#FF4757', icon: '💎', category: 'Inserts' },
  { id: 'glacage_miroir',  name: 'Glaçage Miroir',   height: 0.3, color: '#2C3E50', icon: '🪞', category: 'Finitions' },
  { id: 'velours',         name: 'Velours Chocolat',  height: 0.2, color: '#654321', icon: '🧶', category: 'Finitions' },
  { id: 'chantilly',       name: 'Chantilly',        height: 2.0, color: '#FFFCF0', icon: '☁️', category: 'Finitions' },
  { id: 'meringue',        name: 'Meringue',         height: 1.0, color: '#FFF8F0', icon: '🔮', category: 'Finitions' },
];

let assemblyLayers = [];
let currentMold = 'cercle';

function openAssemblySimulator() {
  const modal = document.getElementById('assemblyModal');
  if (modal) modal.style.display = 'flex';
  initAssemblyPalette();
  initAssemblyDragDrop();
  renderAssemblyCanvas();
}

function closeAssemblySimulator() {
  const modal = document.getElementById('assemblyModal');
  if (modal) modal.style.display = 'none';
}

function initAssemblyPalette() {
  const container = document.getElementById('assemblyPaletteItems');
  if (!container) return;

  // Group by category
  const categories = {};
  ASSEMBLY_COMPONENTS.forEach(comp => {
    if (!categories[comp.category]) categories[comp.category] = [];
    categories[comp.category].push(comp);
  });

  let html = '';
  for (const [cat, items] of Object.entries(categories)) {
    html += `<div style="font-size:0.7rem; font-weight:800; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); padding:0.3rem 0; margin-top:0.5rem;">${cat}</div>`;
    items.forEach(comp => {
      html += `
        <div class="assembly-palette-item" draggable="true" data-component-id="${comp.id}"
             ondragstart="onAssemblyDragStart(event, '${comp.id}')">
          <span class="asm-icon">${comp.icon}</span>
          <div class="asm-info">
            <span class="asm-name">${comp.name}</span>
            <span class="asm-height">${comp.height} cm</span>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = html;
}

function onAssemblyDragStart(e, componentId) {
  e.dataTransfer.setData('text/plain', componentId);
  e.dataTransfer.effectAllowed = 'copy';
}

function initAssemblyDragDrop() {
  const canvas = document.getElementById('assemblyCanvas');
  if (!canvas) return;

  canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    canvas.classList.add('drag-over');
  });

  canvas.addEventListener('dragleave', () => {
    canvas.classList.remove('drag-over');
  });

  canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    canvas.classList.remove('drag-over');
    const componentId = e.dataTransfer.getData('text/plain');
    const comp = ASSEMBLY_COMPONENTS.find(c => c.id === componentId);
    if (comp) {
      addAssemblyLayer(comp);
    }
  });
}

function addAssemblyLayer(comp) {
  assemblyLayers.push({
    ...comp,
    instanceId: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
  });
  renderAssemblyCanvas();
  if (typeof triggerChocolateRain === 'function') {
    // Small celebration
    triggerChocolateRain('light');
  }
}

function removeAssemblyLayer(instanceId) {
  assemblyLayers = assemblyLayers.filter(l => l.instanceId !== instanceId);
  renderAssemblyCanvas();
}

function clearAssembly() {
  assemblyLayers = [];
  renderAssemblyCanvas();
}

function changeAssemblyMold() {
  const select = document.getElementById('assemblyMoldSelect');
  currentMold = select ? select.value : 'cercle';
  renderAssemblyCanvas();
}

function renderAssemblyCanvas() {
  const layersContainer = document.getElementById('assemblyLayers');
  const moldEl = document.getElementById('assemblyMold');
  const totalEl = document.getElementById('assemblyTotal');
  const rulerEl = document.getElementById('assemblyRuler');
  if (!layersContainer || !moldEl) return;

  // Update mold class
  moldEl.className = `assembly-mold mold-${currentMold}`;

  // Scale: 1cm = 30px
  const scale = 30;
  let totalHeight = 0;

  let html = '';
  assemblyLayers.forEach((layer, idx) => {
    const heightPx = layer.height * scale;
    totalHeight += layer.height;
    const textColor = isLightColor(layer.color) ? '#3C1F0E' : '#FFFFFF';
    html += `
      <div class="assembly-layer" style="height:${heightPx}px; background:${layer.color}; color:${textColor};"
           draggable="true" data-idx="${idx}"
           ondragstart="onLayerReorder(event, ${idx})">
        <span style="font-size:1rem; pointer-events:none;">${layer.icon}</span>
        <span class="layer-label">${layer.name} (${layer.height}cm)</span>
        <div class="layer-remove" onclick="removeAssemblyLayer('${layer.instanceId}')">✕</div>
      </div>
    `;
  });

  layersContainer.innerHTML = html;

  // Update mold min-height
  const minMoldHeight = Math.max(40, totalHeight * scale);
  moldEl.style.minHeight = minMoldHeight + 'px';

  // Total
  if (totalEl) {
    totalEl.innerHTML = `Hauteur totale : <strong>${totalHeight.toFixed(1)} cm</strong> — ${assemblyLayers.length} couche${assemblyLayers.length > 1 ? 's' : ''}`;
  }

  // Ruler
  if (rulerEl) {
    let rulerHtml = '';
    const maxCm = Math.max(10, Math.ceil(totalHeight) + 2);
    for (let i = 0; i <= maxCm; i++) {
      rulerHtml += `<div class="ruler-mark">${i}</div>`;
    }
    rulerEl.innerHTML = rulerHtml;
  }

  // Reorder drag & drop for layers
  initLayerReorder();
}

function onLayerReorder(e, idx) {
  e.dataTransfer.setData('text/plain', 'reorder:' + idx);
  e.dataTransfer.effectAllowed = 'move';
  e.target.classList.add('dragging');
}

function initLayerReorder() {
  const layers = document.querySelectorAll('.assembly-layer');
  layers.forEach(layer => {
    layer.addEventListener('dragover', (e) => {
      e.preventDefault();
      layer.classList.add('drag-over-layer');
    });
    layer.addEventListener('dragleave', () => {
      layer.classList.remove('drag-over-layer');
    });
    layer.addEventListener('drop', (e) => {
      e.preventDefault();
      e.stopPropagation();
      layer.classList.remove('drag-over-layer');
      const data = e.dataTransfer.getData('text/plain');
      if (data.startsWith('reorder:')) {
        const fromIdx = parseInt(data.split(':')[1]);
        const toIdx = parseInt(layer.dataset.idx);
        if (fromIdx !== toIdx) {
          const [moved] = assemblyLayers.splice(fromIdx, 1);
          assemblyLayers.splice(toIdx, 0, moved);
          renderAssemblyCanvas();
        }
      } else {
        // New component from palette dropped on a layer
        const comp = ASSEMBLY_COMPONENTS.find(c => c.id === data);
        if (comp) {
          const toIdx = parseInt(layer.dataset.idx);
          const newLayer = {
            ...comp,
            instanceId: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
          };
          assemblyLayers.splice(toIdx + 1, 0, newLayer);
          renderAssemblyCanvas();
        }
      }
    });
    layer.addEventListener('dragend', () => {
      layer.classList.remove('dragging');
    });
  });
}

function isLightColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 180;
}

function exportAssemblyPNG() {
  // Simple export: screenshot the mold 
  const moldEl = document.getElementById('assemblyMold');
  if (!moldEl) return;
  
  // Use html2canvas if available, otherwise provide text summary
  if (typeof html2pdf !== 'undefined' || typeof html2canvas !== 'undefined') {
    // Future: real screenshot export
    showToast('Export visuel en cours de développement.', 'info');
  }
  
  // Generate text summary
  let summary = `=== MONTAGE ${currentMold.toUpperCase()} ===\n`;
  summary += `Hauteur totale: ${assemblyLayers.reduce((s, l) => s + l.height, 0).toFixed(1)}cm\n\n`;
  
  // Bottom to top (reversed display order)
  assemblyLayers.forEach((layer, idx) => {
    summary += `${idx + 1}. ${layer.name} — ${layer.height}cm\n`;
  });
  
  // Copy to clipboard
  navigator.clipboard.writeText(summary).then(() => {
    showToast('Résumé du montage copié dans le presse-papiers !', 'success');
  }).catch(() => {
    showToast('Impossible de copier. Voici le résumé:\n' + summary, 'info');
  });
}

// Make functions globally available
window.openChefsBrain = openChefsBrain;
window.closeChefsBrain = closeChefsBrain;
window.searchChefsBrain = searchChefsBrain;
window.toggleChefPairing = toggleChefPairing;
window.openAssemblySimulator = openAssemblySimulator;
window.closeAssemblySimulator = closeAssemblySimulator;
window.clearAssembly = clearAssembly;
window.changeAssemblyMold = changeAssemblyMold;
window.onAssemblyDragStart = onAssemblyDragStart;
window.onLayerReorder = onLayerReorder;
window.removeAssemblyLayer = removeAssemblyLayer;
window.exportAssemblyPNG = exportAssemblyPNG;
