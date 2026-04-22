/*
  =====================================================================
  CREATIVE-TOOLS.JS — GourmetRevient v6.0
  - Chef's Brain: Flavor Pairing Generator with Cost Analysis
  - Assembly Simulator: Drag & Drop Entremets Builder
  - Cross-Section SVG: Premium visual mockup (NEW)
  - Storyboard: Step-by-step dressing guide (NEW)
  =====================================================================
*/

// ============================================================================
// 1. CHEF'S BRAIN — FLAVOR PAIRING ENGINE
// ============================================================================

const FLAVOR_PAIRINGS = {
  'framboise': [
    { name: 'Chocolat noir 64%', harmony: 'classique', icon: '🍫', note: 'Accord incontournable' },
    { name: 'Chocolat Blanc 33%', harmony: 'classique', icon: '🤍', note: 'Douceur et acidité' },
    { name: 'Pistache', harmony: 'classique', icon: '💚', note: 'Le duo magique' },
    { name: "Poudre d'amandes", harmony: 'classique', icon: '🥜', note: 'Tarte biscuit' },
    { name: 'Vanille (gousse)', harmony: 'classique', icon: '🍦', note: 'Crème pâtissière' },
    { name: 'Citron Vert', harmony: 'audacieux', icon: '🍋', note: 'Vivacité tropicale' },
    { name: 'Menthe Fraîche', harmony: 'audacieux', icon: '🌿', note: 'Fraîcheur estivale' },
    { name: "Eau de Fleur d'Oranger", harmony: 'signature', icon: '🌸', note: 'Touche orientale' },
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
    { name: "Poudre d'amandes", harmony: 'classique', icon: '🥜', note: 'Frangipane' },
    { name: 'Miel de Fleurs', harmony: 'audacieux', icon: '🍯', note: 'Subtilité florale' },
    { name: 'Thé Matcha', harmony: 'audacieux', icon: '🍵', note: 'Umami et douceur' },
    { name: 'Purée de Mangue', harmony: 'audacieux', icon: '🥭', note: 'Exotisme solaire' },
    { name: 'Tonka (fèves entières)', harmony: 'signature', icon: '✨', note: 'Mystère boisé' },
  ],
  'pistache': [
    { name: 'Purée de Framboise', harmony: 'classique', icon: '🍓', note: 'Le duo star' },
    { name: 'Purée de Fraise', harmony: 'classique', icon: '🫐', note: 'Fruit et croquant' },
    { name: 'Chocolat Blanc 33%', harmony: 'classique', icon: '🤍', note: 'Douceur verte' },
    { name: "Eau de Fleur d'Oranger", harmony: 'audacieux', icon: '🌸', note: 'Inspiration orientale' },
    { name: 'Miel de Fleurs', harmony: 'audacieux', icon: '🍯', note: 'Nougat glacé' },
    { name: 'Purée de Mangue', harmony: 'signature', icon: '🥭', note: 'Contraste exotique' },
    { name: 'Amaretto Disaronno', harmony: 'signature', icon: '🥃', note: 'Liqueur italienne' },
  ],
  'citron': [
    { name: 'Beurre AOP', harmony: 'classique', icon: '🧈', note: 'Tarte au citron' },
    { name: "Poudre d'amandes", harmony: 'classique', icon: '🥜', note: 'Financier citron' },
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
    { name: "Sirop d'Erable Grade A", harmony: 'signature', icon: '🍁', note: 'Saveur québécoise' },
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

const PAIRING_KEYWORDS = {};
Object.keys(FLAVOR_PAIRINGS).forEach(key => { PAIRING_KEYWORDS[key] = key; });

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
  const grid = document.getElementById('chefBrainPairings');
  grid.innerHTML = '<div class="cb-empty-state" style="grid-column:1/-1;"><span class="cb-empty-icon">🧠</span><p>Tapez le nom d\'un ingrédient pour découvrir ses meilleurs accords.</p><p style="font-size:.75rem;margin-top:.5rem;opacity:.7;">Essayez : Framboise, Chocolat, Vanille, Pistache, Citron, Café, Caramel, Noisette, Mangue</p></div>';
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
  let matchedKey = null;
  for (const key of Object.keys(FLAVOR_PAIRINGS)) {
    if (key.includes(q) || q.includes(key)) { matchedKey = key; break; }
  }
  if (!matchedKey) {
    document.getElementById('chefBrainPairings').innerHTML = '<div class="cb-empty-state" style="grid-column:1/-1;"><span class="cb-empty-icon">🔍</span><p>Aucun accord trouvé pour "<strong>' + query + '</strong>".</p></div>';
    document.getElementById('chefBrainSelected').style.display = 'none';
    document.getElementById('chefBrainCost').style.display = 'none';
    return;
  }
  const dbIng = (typeof APP !== 'undefined' && APP.ingredientDb) ? APP.ingredientDb.find(i => i.name.toLowerCase().includes(matchedKey)) : null;
  cbSelectedIngredient = { key: matchedKey, name: dbIng ? dbIng.name : (matchedKey.charAt(0).toUpperCase() + matchedKey.slice(1)), price: dbIng ? dbIng.pricePerUnit : 0, priceRef: dbIng ? (dbIng.priceRef || 'kg') : 'kg', icon: getIngredientIcon(matchedKey) };
  const selDiv = document.getElementById('chefBrainSelected');
  selDiv.style.display = 'block';
  document.getElementById('cbSelectedIcon').textContent = cbSelectedIngredient.icon;
  document.getElementById('cbSelectedName').textContent = cbSelectedIngredient.name;
  document.getElementById('cbSelectedPrice').textContent = cbSelectedIngredient.price.toFixed(2) + ' €/' + cbSelectedIngredient.priceRef;
  cbSelectedPairings = [];
  renderChefsBrainPairings(FLAVOR_PAIRINGS[matchedKey]);
}

function renderChefsBrainPairings(pairings) {
  const grid = document.getElementById('chefBrainPairings');
  if (!grid || !pairings) return;
  const groups = { 'classique': { label: '🏛️ Accords Classiques', items: [] }, 'audacieux': { label: '🔥 Accords Audacieux', items: [] }, 'signature': { label: '✨ Accords Signature', items: [] } };
  pairings.forEach(p => {
    const group = groups[p.harmony] || groups['classique'];
    const dbItem = (typeof APP !== 'undefined' && APP.ingredientDb) ? APP.ingredientDb.find(i => i.name.toLowerCase() === p.name.toLowerCase()) : null;
    group.items.push(Object.assign({}, p, { price: dbItem ? dbItem.pricePerUnit : null, priceRef: dbItem ? (dbItem.priceRef || 'kg') : 'kg' }));
  });
  let html = '';
  for (const key in groups) {
    const group = groups[key];
    if (group.items.length === 0) continue;
    html += '<div class="cb-pairing-category-label">' + group.label + '</div>';
    group.items.forEach(p => {
      const globalIdx = pairings.indexOf(pairings.find(pp => pp.name === p.name));
      const harmonyClass = p.harmony === 'audacieux' ? 'medium' : (p.harmony === 'signature' ? 'bold' : '');
      const priceText = p.price !== null ? p.price.toFixed(2) + '€/' + p.priceRef : '—';
      const harmonyIcon = p.harmony === 'classique' ? '★' : (p.harmony === 'audacieux' ? '⚡' : '💎');
      html += '<div class="cb-pairing-card" onclick="toggleChefPairing(' + globalIdx + ')" id="cbPair-' + globalIdx + '"><span class="cb-pair-harmony ' + harmonyClass + '">' + harmonyIcon + '</span><span class="cb-pair-icon">' + p.icon + '</span><span class="cb-pair-name">' + (p.name.length > 20 ? p.name.substring(0,18)+'…' : p.name) + '</span><span class="cb-pair-price">' + priceText + '</span><span style="font-size:.7rem;color:var(--text-muted);margin-top:2px;display:block;font-style:italic;">' + p.note + '</span></div>';
    });
  }
  grid.innerHTML = html;
}

function toggleChefPairing(idx) {
  if (!cbSelectedIngredient) return;
  const pairings = FLAVOR_PAIRINGS[cbSelectedIngredient.key];
  if (!pairings || !pairings[idx]) return;
  const card = document.getElementById('cbPair-' + idx);
  const isSelected = cbSelectedPairings.includes(idx);
  if (isSelected) { cbSelectedPairings = cbSelectedPairings.filter(i => i !== idx); if (card) card.classList.remove('selected'); }
  else { cbSelectedPairings.push(idx); if (card) card.classList.add('selected'); }
  updateChefBrainCost(pairings);
}

function updateChefBrainCost(pairings) {
  const costPanel = document.getElementById('chefBrainCost');
  const costDetails = document.getElementById('cbCostDetails');
  if (!costPanel || !costDetails) return;
  if (cbSelectedPairings.length === 0) { costPanel.style.display = 'none'; return; }
  costPanel.style.display = 'block';
  const items = [{ icon: cbSelectedIngredient.icon, name: cbSelectedIngredient.name, price: cbSelectedIngredient.price, qty: 200, unit: 'g', priceRef: cbSelectedIngredient.priceRef }];
  cbSelectedPairings.forEach(idx => {
    const p = pairings[idx];
    const dbItem = (typeof APP !== 'undefined' && APP.ingredientDb) ? APP.ingredientDb.find(i => i.name.toLowerCase() === p.name.toLowerCase()) : null;
    items.push({ icon: p.icon, name: p.name, price: dbItem ? dbItem.pricePerUnit : 5, qty: 100, unit: dbItem ? dbItem.unit : 'g', priceRef: dbItem ? (dbItem.priceRef || 'kg') : 'kg' });
  });
  let totalCost = 0; let html = '';
  items.forEach(item => {
    const cost = item.unit === 'pièce' ? item.price * (item.qty / 100) : (item.qty / 1000) * item.price;
    totalCost += cost;
    html += '<div class="cb-cost-row"><span class="cb-cost-name">' + item.icon + ' ' + item.name + ' <small style="color:var(--text-muted)">(~' + item.qty + item.unit + ')</small></span><span class="cb-cost-value">' + cost.toFixed(2) + ' €</span></div>';
  });
  const sellingPrice = totalCost / (1 - 0.70);
  html += '<div class="cb-cost-row"><span class="cb-cost-name">💰 Coût matière estimé</span><span class="cb-cost-value">' + totalCost.toFixed(2) + ' €</span></div>';
  let verdictClass = 'profitable', verdictText = '✅ Rentable ! Prix de vente suggéré : ' + sellingPrice.toFixed(2) + '€ (marge 70%)';
  if (totalCost > 5) { verdictClass = 'warning'; verdictText = '⚠️ Coût élevé. Prix suggéré : ' + sellingPrice.toFixed(2) + '€'; }
  if (totalCost > 10) { verdictClass = 'danger'; verdictText = '⛔ Coût très élevé (' + totalCost.toFixed(2) + '€).'; }
  html += '<div class="cb-cost-verdict ' + verdictClass + '">' + verdictText + '</div>';
  costDetails.innerHTML = html;
}

// ============================================================================
// 2. ASSEMBLY SIMULATOR — ENTREMETS BUILDER + SVG CROSS-SECTION + STORYBOARD
// ============================================================================

const ASSEMBLY_COMPONENTS = [
  { id: 'biscuit_joconde', name: 'Biscuit Joconde', height: 1.0, color: '#D4A574', grad: ['#D4A574','#B8845A'], icon: '🍰', category: 'Biscuits', texture: 'grain' },
  { id: 'genoise',         name: 'Génoise',         height: 1.5, color: '#E8C99B', grad: ['#E8C99B','#D4A574'], icon: '🧁', category: 'Biscuits', texture: 'grain' },
  { id: 'dacquoise',       name: 'Dacquoise',       height: 1.0, color: '#C9A96E', grad: ['#C9A96E','#A8825A'], icon: '🥜', category: 'Biscuits', texture: 'grain' },
  { id: 'sable_breton',    name: 'Sablé Breton',    height: 0.8, color: '#6366f1', grad: ['#818cf8','#4f46e5'], icon: '🍪', category: 'Biscuits', texture: 'dots' },
  { id: 'croustillant',    name: 'Croustillant',    height: 0.5, color: '#A67B3D', grad: ['#C49A4E','#8B6530'], icon: '✨', category: 'Biscuits', texture: 'dots' },
  { id: 'streusel',        name: 'Streusel',         height: 0.5, color: '#B8956A', grad: ['#C9A97A','#9A7A55'], icon: '🔶', category: 'Biscuits', texture: 'grain' },
  { id: 'mousse_chocolat', name: 'Mousse Chocolat',  height: 3.0, color: '#5C3A1E', grad: ['#7A4E2A','#3D2010'], icon: '🍫', category: 'Mousses', texture: 'smooth' },
  { id: 'mousse_fruit',    name: 'Mousse Fruits',    height: 3.0, color: '#E85D75', grad: ['#F07090','#C04060'], icon: '🍓', category: 'Mousses', texture: 'smooth' },
  { id: 'mousse_vanille',  name: 'Mousse Vanille',   height: 3.0, color: '#FFF5E1', grad: ['#FFFBF0','#F5E8C0'], icon: '🍦', category: 'Mousses', texture: 'smooth' },
  { id: 'bavarois',        name: 'Bavarois',          height: 2.5, color: '#FFE4C4', grad: ['#FFF0D8','#F0D090'], icon: '🥛', category: 'Mousses', texture: 'smooth' },
  { id: 'cremeux',         name: 'Crémeux',           height: 1.5, color: '#6B4226', grad: ['#8B5A36','#50300E'], icon: '🤎', category: 'Crèmes', texture: 'smooth' },
  { id: 'creme_brulee',    name: 'Crème Brûlée',     height: 1.5, color: '#E8D5A3', grad: ['#F0E0B0','#D0B870'], icon: '🔥', category: 'Crèmes', texture: 'smooth' },
  { id: 'ganache',         name: 'Ganache',           height: 1.0, color: '#3C1F0E', grad: ['#5A3020','#201008'], icon: '🍫', category: 'Crèmes', texture: 'smooth' },
  { id: 'curd_citron',     name: 'Curd Citron',      height: 1.0, color: '#F5E050', grad: ['#FFEC70','#E0C820'], icon: '🍋', category: 'Crèmes', texture: 'smooth' },
  { id: 'insert_fruit',    name: 'Insert Fruits',    height: 1.5, color: '#FF6B6B', grad: ['#FF8080','#E04040'], icon: '🍒', category: 'Inserts', texture: 'bubble' },
  { id: 'insert_caramel',  name: 'Insert Caramel',   height: 1.0, color: '#D4840A', grad: ['#F0A020','#B06000'], icon: '🍯', category: 'Inserts', texture: 'bubble' },
  { id: 'confit',          name: 'Confit / Compotée', height: 1.0, color: '#8B2252', grad: ['#AA3870','#6A1040'], icon: '🫙', category: 'Inserts', texture: 'bubble' },
  { id: 'gelee',           name: 'Gelée Mirror',     height: 0.5, color: '#FF4757', grad: ['#FF7080','#DD2040'], icon: '💎', category: 'Inserts', texture: 'glass' },
  { id: 'glacage_miroir',  name: 'Glaçage Miroir',   height: 0.3, color: '#2C3E50', grad: ['#4A6070','#1A2830'], icon: '🪞', category: 'Finitions', texture: 'glass' },
  { id: 'velours',         name: 'Velours Chocolat',  height: 0.2, color: '#654321', grad: ['#806040','#482010'], icon: '🧶', category: 'Finitions', texture: 'velvet' },
  { id: 'chantilly',       name: 'Chantilly',         height: 2.0, color: '#FFFCF0', grad: ['#FFFFFF','#F5F0E0'], icon: '☁️', category: 'Finitions', texture: 'cloud' },
  { id: 'meringue',        name: 'Meringue',          height: 1.0, color: '#FFF8F0', grad: ['#FFFFFF','#F8F0E8'], icon: '🔮', category: 'Finitions', texture: 'cloud' },
];

let assemblyLayers = [];
let currentMold = 'cercle';
let currentView = 'stack';
let selectedLayerInstanceId = null;

// --- Open / Close -------------------------------------------------------
function openAssemblySimulator() {
  const modal = document.getElementById('assemblyModal');
  if (modal) modal.style.display = 'flex';
  loadAssemblyFromStorage(); // Load saved state
  initAssemblyPalette();
  initAssemblyDragDrop();
  renderAssemblyCanvas();
  switchAssemblyView('stack');
}

function closeAssemblySimulator() {
  const modal = document.getElementById('assemblyModal');
  if (modal) modal.style.display = 'none';
}

// --- View Switching -----------------------------------------------------
function switchAssemblyView(view) {
  currentView = view;
  var views = ['stack','cross'];
  views.forEach(function(v) {
    var vName = v.charAt(0).toUpperCase() + v.slice(1);
    var el = document.getElementById('asmView' + vName);
    var tab = document.getElementById('asmTab' + vName);
    if (el) el.style.display = v === view ? '' : 'none';
    if (tab) tab.classList.toggle('active', v === view);
  });
  if (view === 'cross') renderCrossSection();
}

// --- Palette ------------------------------------------------------------
function initAssemblyPalette() {
  var container = document.getElementById('assemblyPaletteItems');
  if (!container) return;
  var categories = {};
  ASSEMBLY_COMPONENTS.forEach(function(comp) {
    if (!categories[comp.category]) categories[comp.category] = [];
    categories[comp.category].push(comp);
  });
  var html = '';
  Object.keys(categories).forEach(function(cat) {
    html += '<div style="font-size:.7rem;font-weight:800;text-transform:uppercase;letter-spacing:.08em;color:var(--text-muted);padding:.3rem 0;margin-top:.5rem;">' + cat + '</div>';
    categories[cat].forEach(function(comp) {
      html += '<div class="assembly-palette-item" draggable="true" data-component-id="' + comp.id + '" ondragstart="onAssemblyDragStart(event,\'' + comp.id + '\')">' +
        '<span class="asm-icon">' + comp.icon + '</span>' +
        '<div class="asm-info"><span class="asm-name">' + comp.name + '</span><span class="asm-height">' + comp.height + ' cm</span></div></div>';
    });
  });
  container.innerHTML = html;
}

function onAssemblyDragStart(e, componentId) {
  e.dataTransfer.setData('text/plain', componentId);
  e.dataTransfer.effectAllowed = 'copy';
}

function initAssemblyDragDrop() {
  var canvas = document.getElementById('assemblyCanvas');
  if (!canvas) return;
  canvas.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; canvas.classList.add('drag-over'); });
  canvas.addEventListener('dragleave', function() { canvas.classList.remove('drag-over'); });
  canvas.addEventListener('drop', function(e) {
    e.preventDefault(); canvas.classList.remove('drag-over');
    var componentId = e.dataTransfer.getData('text/plain');
    var comp = ASSEMBLY_COMPONENTS.find(function(c) { return c.id === componentId; });
    if (comp) addAssemblyLayer(comp);
  });
}

function addAssemblyLayer(comp) {
  assemblyLayers.push(Object.assign({}, comp, {
    instanceId: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
    annotation: { temp: '', rest: '', note: '' }
  }));
  renderAssemblyCanvas();
  if (currentView === 'cross') renderCrossSection();
}

function removeAssemblyLayer(instanceId) {
  assemblyLayers = assemblyLayers.filter(function(l) { return l.instanceId !== instanceId; });
  if (selectedLayerInstanceId === instanceId) {
    selectedLayerInstanceId = null;
    var panel = document.getElementById('asmAnnotationPanel');
    if (panel) panel.style.display = 'none';
  }
  renderAssemblyCanvas();
  if (currentView === 'cross') renderCrossSection();
}

function clearAssembly() {
  assemblyLayers = [];
  selectedLayerInstanceId = null;
  var panel = document.getElementById('asmAnnotationPanel');
  if (panel) panel.style.display = 'none';
  renderAssemblyCanvas();
  if (currentView === 'cross') renderCrossSection();
}

function changeAssemblyMold() {
  var select = document.getElementById('assemblyMoldSelect');
  currentMold = select ? select.value : 'cercle';
  renderAssemblyCanvas();
  if (currentView === 'cross') renderCrossSection();
}

// --- Layer Manager (Montage) --------------------------------------------
function renderAssemblyCanvas() {
  var layersContainer = document.getElementById('assemblyLayers');
  var totalEl = document.getElementById('assemblyTotal');
  var moldContainer = document.querySelector('.assembly-mold');
  
  if (!layersContainer) return;
  
  // Montage view transition: From cake representation to Layer Manager List
  var totalHeight = 0;
  var html = '';
  
  if (assemblyLayers.length === 0) {
    html = '<div style="text-align:center;padding:2rem;color:var(--text-muted);border:2px dashed var(--surface-border);border-radius:12px;">' +
           '<p>Glissez des composants ici pour commencer le montage</p></div>';
  } else {
    assemblyLayers.forEach(function(layer, idx) {
      totalHeight += layer.height;
      var isSelected = layer.instanceId === selectedLayerInstanceId;
      var hasAnnot = layer.annotation && (layer.annotation.temp || layer.annotation.rest || layer.annotation.note);
      
      html += '<div class="asm-layer-row' + (isSelected ? ' active' : '') + '" ' +
        'draggable="true" data-idx="' + idx + '" ' +
        'ondragstart="onLayerReorder(event,' + idx + ')" ' +
        'onclick="selectLayerForAnnotation(\'' + layer.instanceId + '\')">' +
        '<div class="asm-row-drag">⋮⋮</div>' +
        '<div class="asm-row-icon" style="background:linear-gradient(135deg,' + layer.grad[0] + ',' + layer.grad[1] + ')">' + layer.icon + '</div>' +
        '<div class="asm-row-info">' +
          '<span class="asm-row-name">' + layer.name + '</span>' +
          '<span class="asm-row-meta">' + layer.height + ' cm' + (hasAnnot ? ' • 📌 Annoté' : '') + '</span>' +
        '</div>' +
        '<div class="asm-row-actions">' +
          '<button class="asm-row-btn" onclick="event.stopPropagation(); removeAssemblyLayer(\'' + layer.instanceId + '\')" title="Supprimer">✕</button>' +
        '</div>' +
        '</div>';
    });
  }
  
  layersContainer.innerHTML = html;
  if (totalEl) totalEl.innerHTML = 'Hauteur totale : <strong>' + totalHeight.toFixed(1) + ' cm</strong> — ' + assemblyLayers.length + ' couche' + (assemblyLayers.length > 1 ? 's' : '');
  
  initLayerReorder();
}

function onLayerReorder(e, idx) {
  e.dataTransfer.setData('text/plain', 'reorder:' + idx);
  e.dataTransfer.effectAllowed = 'move';
  if (e.target) e.target.classList.add('dragging');
}

function initLayerReorder() {
  var layers = document.querySelectorAll('.asm-layer-row');
  layers.forEach(function(layer) {
    layer.addEventListener('dragover', function(e) { e.preventDefault(); layer.classList.add('drag-over-row'); });
    layer.addEventListener('dragleave', function() { layer.classList.remove('drag-over-row'); });
    layer.addEventListener('drop', function(e) {
      e.preventDefault(); e.stopPropagation(); layer.classList.remove('drag-over-row');
      var data = e.dataTransfer.getData('text/plain');
      if (data.startsWith('reorder:')) {
        var fromIdx = parseInt(data.split(':')[1]);
        var toIdx = parseInt(layer.dataset.idx);
        if (fromIdx !== toIdx) { 
          var moved = assemblyLayers.splice(fromIdx, 1)[0]; 
          assemblyLayers.splice(toIdx, 0, moved); 
          renderAssemblyCanvas(); 
          if (currentView === 'cross') renderCrossSection();
        }
      } else {
        var comp = ASSEMBLY_COMPONENTS.find(function(c) { return c.id === data; });
        if (comp) {
          var newLayer = Object.assign({}, comp, { instanceId: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2,4), annotation: { temp:'', rest:'', note:'' } });
          assemblyLayers.splice(parseInt(layer.dataset.idx) + 1, 0, newLayer);
          renderAssemblyCanvas();
          if (currentView === 'cross') renderCrossSection();
        }
      }
    });
    layer.addEventListener('dragend', function() { layer.classList.remove('dragging'); });
  });
}

// --- Annotation ---------------------------------------------------------
function selectLayerForAnnotation(instanceId) {
  selectedLayerInstanceId = instanceId;
  var layer = assemblyLayers.find(function(l) { return l.instanceId === instanceId; });
  if (!layer) return;
  var panel = document.getElementById('asmAnnotationPanel');
  if (panel) panel.style.display = 'block';
  var nameEl = document.getElementById('asmAnnotLayerName');
  if (nameEl) nameEl.textContent = layer.icon + ' ' + layer.name;
  var tempEl = document.getElementById('asmAnnotTemp');
  var restEl = document.getElementById('asmAnnotRest');
  var noteEl = document.getElementById('asmAnnotNote');
  if (tempEl) tempEl.value = (layer.annotation && layer.annotation.temp) || '';
  if (restEl) restEl.value = (layer.annotation && layer.annotation.rest) || '';
  if (noteEl) noteEl.value = (layer.annotation && layer.annotation.note) || '';
  renderAssemblyCanvas();
}

function saveLayerAnnotation() {
  const layer = assemblyLayers.find(l => l.instanceId === selectedLayerInstanceId);
  if (!layer) return;
  layer.annotation = {
    temp: document.getElementById('asmAnnotTemp').value,
    rest: document.getElementById('asmAnnotRest').value,
    note: document.getElementById('asmAnnotNote').value
  };
  renderAssemblyCanvas();
  if (currentView === 'cross') renderCrossSection();
  if (typeof showToast === 'function') showToast('Annotation sauvegardée ✓', 'success');
}

// --- PREMIUM SVG CROSS-SECTION -----------------------------------------
function renderCrossSection() {
  const container = document.getElementById('assemblyCrossSection');
  if (!container) return;
  
  if (assemblyLayers.length === 0) {
    container.innerHTML = `
      <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:300px;color:#888;gap:12px;">
        <span style="font-size:3rem;">🍰</span>
        <p style="font-size:.9rem;font-family:Inter,sans-serif;">Ajoutez des couches pour voir la coupe transversale</p>
      </div>`;
    return;
  }

  const PX      = 45;    // pixels per cm (slightly zoomed)
  const SVG_W   = 800;   // LARGE FORMAT
  const MOLD_W  = 300;   // Wider mold for better detail
  const MOLD_X  = 140;   // Centered better
  const LABEL_X = MOLD_X + MOLD_W + 60;
  const totalHeight = assemblyLayers.reduce((s, l) => s + l.height, 0);
  const SVG_H   = Math.max(500, totalHeight * PX + 180);
  const BASE_Y  = SVG_H - 80;
  const TOP_Y   = BASE_Y - totalHeight * PX;

  const moldLabels = {
    cercle:  'Cercle ø 22 cm',
    carre:   'Carré 20 cm',
    buche:   'Bûche 30 cm',
    tarte:   'Moule à tarte 24 cm',
    verrine: 'Verrine ø 8 cm'
  };

  // ── Mold paths ─────────────────────────────────────────────────────────
  // Cercle  : Section d'un anneau = parois STRAIGHT
  // Carré   : Rectangle
  // Bûche   : U shape rounded at the bottom (mould has a rounded bottom)
  // Tarte   : Trapezoid wider at the TOP (mould is flared)
  // Verrine : Tapered cylinder
  const mx = MOLD_X, mw = MOLD_W, by = BASE_Y, ty = TOP_Y;
  const r = 24; // corner radius for buche
  
  const moldPaths = {
    cercle: `M${mx},${by} L${mx},${ty} L${mx + mw},${ty} L${mx + mw},${by} Z`,
    carre:  `M${mx},${by} L${mx},${ty} L${mx + mw},${ty} L${mx + mw},${by} Z`,
    buche:  `M${mx},${ty} L${mx},${by - r} Q${mx},${by} ${mx + r},${by} L${mx + mw - r},${by} Q${mx + mw},${by} ${mx + mw},${by - r} L${mx + mw},${ty} Z`,
    tarte:  `M${mx + 15},${by} L${mx},${ty} L${mx + mw},${ty} L${mx + mw - 15},${by} Z`,
    verrine:`M${mx + 25},${by} L${mx},${ty} L${mx + mw},${ty} L${mx + mw - 25},${by} Z`
  };
  const moldPath = moldPaths[currentMold] || moldPaths.carre;

  // ── Defs: Gradients + Patterns + Effects ───────────────────────────────
  let gradDefs = '';
  let patDefs  = '';
  let curY     = BASE_Y;
  const layerData = [];

  assemblyLayers.forEach((layer, i) => {
    const h   = layer.height * PX;
    const y   = curY - h;
    const gId = `sg${i}`;
    const pId = `sp${i}`;

    gradDefs += `
      <linearGradient id="${gId}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${layer.grad[0]}"/>
        <stop offset="100%" stop-color="${layer.grad[1]}" stop-opacity="0.9"/>
      </linearGradient>`;

    let p = `<pattern id="${pId}" patternUnits="userSpaceOnUse" width="12" height="12">
               <rect width="12" height="12" fill="url(#${gId})"/>`;
    
    if (layer.texture === 'grain') {
      p += `<circle cx="2" cy="2" r="0.5" fill="rgba(0,0,0,0.05)"/>
            <circle cx="8" cy="7" r="0.4" fill="rgba(0,0,0,0.03)"/>`;
    } else if (layer.texture === 'dots') {
      p += `<circle cx="6" cy="6" r="1.5" fill="rgba(255,255,255,0.2)"/>`;
    } else if (layer.texture === 'bubble') {
      p += `<circle cx="4" cy="4" r="2.5" fill="rgba(255,255,255,0.15)"/>
            <circle cx="9" cy="9" r="1.2" fill="rgba(255,255,255,0.1)"/>`;
    } else if (layer.texture === 'glass') {
      p += `<rect width="12" height="1" fill="rgba(255,255,255,0.2)"/>`;
    } else if (layer.texture === 'velvet') {
      p += `<rect width="12" height="12" fill="rgba(0,0,0,0.05)"/>
            <path d="M0,6 L12,6" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/>`;
    } else if (layer.texture === 'cloud') {
      p += `<ellipse cx="6" cy="6" rx="4" ry="3" fill="rgba(255,255,255,0.2)"/>`;
    }
    p += `</pattern>`;
    patDefs += p;

    layerData.push({ layer, y, h, pId });
    curY = y;
  });

  const defs = `
    <defs>
      ${gradDefs}
      ${patDefs}
      <linearGradient id="titleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#334155"/>
        <stop offset="50%" stop-color="#6366f1">
          <animate attributeName="offset" values="0;1;0" dur="4s" repeatCount="indefinite" />
        </stop>
        <stop offset="100%" stop-color="#334155"/>
      </linearGradient>
      <clipPath id="sClip"><path d="${moldPath}"/></clipPath>
      <filter id="sdrp" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="3" dy="5" stdDeviation="8" flood-color="rgba(0,0,0,0.2)"/>
      </filter>
    </defs>`;

  // ── Construction ───────────────────────────────────────────────────────
  let layerRects = '';
  layerData.forEach(d => {
    layerRects += `
      <rect x="${MOLD_X}" y="${d.y}" width="${MOLD_W}" height="${d.h}" fill="url(#${d.pId})"/>
      <rect x="${MOLD_X}" y="${d.y}" width="${MOLD_W}" height="2" fill="rgba(255,255,255,0.3)"/>
      <line x1="${MOLD_X}" y1="${d.y + d.h}" x2="${MOLD_X + MOLD_W}" y2="${d.y + d.h}" stroke="rgba(0,0,0,0.1)" stroke-width="0.5"/>`;
  });

  // ── Dimensions (Architectural Style) ───────────────────────────────────
  let dimSvg = '';
  const DIM_X = MOLD_X - 60;
  
  layerData.forEach((d, i) => {
    const midY = d.y + d.h / 2;
    
    dimSvg += `
      <!-- Segment marks -->
      <line x1="${DIM_X - 5}" y1="${d.y}" x2="${MOLD_X - 10}" y2="${d.y}" stroke="#cbd5e1" stroke-width="0.5" stroke-dasharray="2,2"/>
      <line x1="${DIM_X}" y1="${d.y}" x2="${DIM_X}" y2="${d.y + d.h}" stroke="#64748b" stroke-width="2"/>
      
      <!-- Arrowheads -->
      <path d="M${DIM_X-2},${d.y+6} L${DIM_X},${d.y} L${DIM_X+2},${d.y+6}" fill="none" stroke="#64748b" stroke-width="1.5"/>
      <path d="M${DIM_X-2},${d.y+d.h-6} L${DIM_X},${d.y+d.h} L${DIM_X+2},${d.y+d.h-6}" fill="none" stroke="#64748b" stroke-width="1.5"/>

      <!-- Individual segment height -->
      <text x="${DIM_X - 12}" y="${midY + 4}" text-anchor="end" font-size="11" fill="#1e293b" font-family="Outfit, sans-serif" font-weight="800">${d.layer.height.toFixed(1)} cm</text>
    `;
  });

  // ── Laboratory Labels (De-collided) ────────────────────────────────────
  let labelSvg = '';
  const usedY = [];
  const MIN_GAP = 30;
  
  layerData.forEach((d, i) => {
    const originY = d.y + d.h / 2;
    let labelY = originY;
    
    // Improved De-collision
    let tries = 0;
    while (usedY.some(p => Math.abs(p - labelY) < MIN_GAP) && tries < 80) {
      labelY += (i % 2 === 0 ? 10 : -10);
      tries++;
    }
    usedY.push(labelY);

    const cx = MOLD_X + MOLD_W; 
    const lx = LABEL_X;        
    
    const path = `M${cx},${originY} L${cx + 30},${originY} L${lx - 15},${labelY} L${lx + 5},${labelY}`;
    
    labelSvg += `
      <path d="${path}" fill="none" stroke="#cbd5e1" stroke-width="1.5" stroke-dasharray="3,3"/>
      <circle cx="${cx}" cy="${originY}" r="4" fill="${d.layer.color}" stroke="#1e293b" stroke-width="1.5"/>
      
      <g transform="translate(${lx}, ${labelY})">
        <text y="2" font-size="13" fill="#0f172a" font-family="Outfit, sans-serif" font-weight="900" dominant-baseline="middle">
          ${d.layer.icon} ${d.layer.name.toUpperCase()}
        </text>
        ${d.layer.annotation && (d.layer.annotation.temp || d.layer.annotation.rest || d.layer.annotation.note) ? `
          <text y="16" font-size="10" fill="#64748b" font-family="Inter, sans-serif" font-weight="600">
            ${[
              d.layer.annotation.temp ? `🌡️ ${d.layer.annotation.temp}°C` : null,
              d.layer.annotation.rest ? `⏱️ ${d.layer.annotation.rest}m` : null,
              d.layer.annotation.note ? `📝 ${d.layer.annotation.note}` : null
            ].filter(Boolean).join('  •  ')}
          </text>
        ` : ''}
      </g>`;
  });

  // ── Technical Cross-Hatching for Cylindrical Molds ─────────────────────
  let wallHatch = '';
  if (currentMold === 'cercle') {
    for (let h=0; h<totalHeight*3; h++) {
      const hy = TOP_Y + (h * 15);
      if (hy < BASE_Y - 5) {
        wallHatch += `<line x1="${MOLD_X}" y1="${hy}" x2="${MOLD_X+8}" y2="${hy+8}" stroke="rgba(0,0,0,0.04)" stroke-width="0.5"/>`;
        wallHatch += `<line x1="${MOLD_X+MOLD_W-8}" y1="${hy}" x2="${MOLD_X+MOLD_W}" y2="${hy+8}" stroke="rgba(0,0,0,0.04)" stroke-width="0.5"/>`;
      }
    }
  }

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}" width="${SVG_W}" height="${SVG_H}" style="max-width:100%;height:auto;background:#ffffff;display:block;border:1px solid #e2e8f0;box-shadow: 0 20px 50px rgba(0,0,0,0.1);">
      ${defs}
      
      <!-- Frame & Background -->
      <rect x="10" y="10" width="${SVG_W - 20}" height="${SVG_H - 20}" fill="#ffffff" stroke="#cbd5e1" stroke-width="1"/>
      <rect x="15" y="15" width="${SVG_W - 30}" height="${SVG_H - 30}" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>

      <!-- Engineering Grid -->
      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#f1f5f9" stroke-width="1"/>
        <path d="M 15 0 L 15 30 M 0 15 L 30 15" fill="none" stroke="#f8fafc" stroke-width="0.5"/>
      </pattern>
      <rect x="20" y="20" width="${SVG_W - 40}" height="${SVG_H - 40}" fill="url(#grid)"/>

      <!-- Cartouche (Information Block) -->
      <g transform="translate(${SVG_W - 320}, 40)">
        <rect width="280" height="85" fill="#f8fafc" stroke="#334155" stroke-width="1.5" rx="2"/>
        <text x="12" y="25" font-size="16" font-family="Outfit" font-weight="900" fill="url(#titleGrad)">FICHE TECHNIQUE MONTAGE</text>
        <line x1="12" y1="35" x2="268" y2="35" stroke="#6366f1" stroke-width="2"/>
        <g font-family="Inter" font-weight="700" font-size="10" fill="#64748b">
          <text x="12" y="52">PROJET : RECETTE EN COURS</text>
          <text x="12" y="66">MOULE : ${moldLabels[currentMold].toUpperCase()}</text>
          <text x="12" y="80">VERSION : REV.${assemblyLayers.length} / ${new Date().toLocaleDateString('fr-FR')}</text>
        </g>
        <rect x="190" y="42" width="78" height="35" fill="none" stroke="#e2e8f0" stroke-width="1"/>
        <text x="229" y="54" text-anchor="middle" font-size="8" fill="#94a3b8">ÉCHELLE</text>
        <text x="229" y="70" text-anchor="middle" font-size="11" fill="#475569" font-weight="800">1 : 1.25</text>
      </g>

      <!-- Main Drawing Area -->
      <g filter="url(#sdrp)">
        <path d="${moldPath}" fill="rgba(241,245,249,0.5)"/>
        <g clip-path="url(#sClip)">
          ${layerRects}
          ${wallHatch}
        </g>
        <path d="${moldPath}" fill="none" stroke="#0f172a" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"/>
      </g>
      
      <!-- Ground Level -->
      <line x1="${MOLD_X - 100}" y1="${BASE_Y}" x2="${MOLD_X + MOLD_W + 50}" y2="${BASE_Y}" stroke="#334155" stroke-width="2"/>
      <text x="${MOLD_X + MOLD_W/2}" y="${BASE_Y + 22}" text-anchor="middle" font-size="9" font-family="Inter" font-weight="900" fill="#94a3b8" letter-spacing="4">BASE DE MONTAGE / FOND DU MOULE</text>

      ${dimSvg}
      ${labelSvg}

      <!-- Production Stamp -->
      <g transform="translate(${SVG_W - 80}, ${SVG_H - 80})">
        <circle cx="0" cy="0" r="45" fill="none" stroke="#6366f1" stroke-width="1" stroke-dasharray="3,3" opacity="0.3"/>
        <text text-anchor="middle" font-size="9" font-family="Outfit" font-weight="900" fill="#6366f1" opacity="0.5">CERTIFIÉ LABO</text>
        <text y="12" text-anchor="middle" font-size="8" font-family="Inter" fill="#94a3b8">GourmetRevient</text>
      </g>

      <!-- Total Height Indicator -->
      <g transform="translate(${MOLD_X + MOLD_W / 2}, ${TOP_Y - 40})">
         <rect x="-60" y="-15" width="120" height="30" rx="15" fill="#6366f1"/>
         <text text-anchor="middle" y="5" font-size="12" font-family="Outfit" font-weight="900" fill="#ffffff">H. TOTALE: ${totalHeight.toFixed(1)} cm</text>
      </g>
    </svg>`;

  container.innerHTML = svg;
  saveAssemblyToStorage();
}

function saveAssemblyToStorage() {
  localStorage.setItem('gourmet_assembly_layers', JSON.stringify(assemblyLayers));
  localStorage.setItem('gourmet_assembly_mold', currentMold);
}

function loadAssemblyFromStorage() {
  const savedLayers = localStorage.getItem('gourmet_assembly_layers');
  const savedMold = localStorage.getItem('gourmet_assembly_mold');
  if (savedLayers) {
    try {
      assemblyLayers = JSON.parse(savedLayers);
    } catch(e) { assemblyLayers = []; }
  }
  if (savedMold) currentMold = savedMold;
}

// --- EXPORT -------------------------------------------------------------
function exportAssemblyPNG() {
  if (assemblyLayers.length === 0) {
    if (typeof showToast === 'function') showToast("Ajoutez des couches avant d'exporter.", 'error');
    return;
  }

  if (currentView !== 'cross') switchAssemblyView('cross');
  else renderCrossSection();

  setTimeout(() => {
    const svgEl = document.querySelector('#assemblyCrossSection svg');
    if (svgEl) {
      try {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coupe_${currentMold}_${Date.now()}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        if (typeof showToast === 'function') showToast('Coupe SVG exportée ✓', 'success');
      } catch (e) {
        console.error('Export failed', e);
        if (typeof showToast === 'function') showToast('Échec de l\'export SVG', 'error');
      }
    }
  }, 200);
}

// --- UTILITY ------------------------------------------------------------
function isLightColor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.substr(0, 2), 16);
  const g = parseInt(c.substr(2, 2), 16);
  const b = parseInt(c.substr(4, 2), 16);
  return (r * 0.299 + g * 0.587 + b * 0.114) > 180;
}

// --- GLOBAL EXPORTS -----------------------------------------------------
window.openChefsBrain         = openChefsBrain;
window.closeChefsBrain        = closeChefsBrain;
window.searchChefsBrain       = searchChefsBrain;
window.toggleChefPairing      = toggleChefPairing;
window.openAssemblySimulator  = openAssemblySimulator;
window.closeAssemblySimulator = closeAssemblySimulator;
window.clearAssembly          = clearAssembly;
window.changeAssemblyMold     = changeAssemblyMold;
window.onAssemblyDragStart    = onAssemblyDragStart;
window.onAssemblyDragStart    = onAssemblyDragStart;
window.onLayerReorder         = onLayerReorder;
window.removeAssemblyLayer    = removeAssemblyLayer;
window.exportAssemblyPNG      = exportAssemblyPNG;
window.switchAssemblyView     = switchAssemblyView;
window.selectLayerForAnnotation = selectLayerForAnnotation;
window.saveLayerAnnotation    = saveLayerAnnotation;
