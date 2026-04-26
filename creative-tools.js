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
  // --- BISCUITS & BASES ---
  { id: 'biscuit_joconde', name: 'Biscuit Joconde', height: 0.8, color: '#D4A574', grad: ['#E2B386','#C69668'], icon: '🍰', category: 'Biscuits', texture: 'grain', costPerKg: 5.80, density: 0.45 },
  { id: 'genoise',         name: 'Génoise Nature',  height: 1.5, color: '#E8C99B', grad: ['#E8C99B','#D4A574'], icon: '🧁', category: 'Biscuits', texture: 'grain', costPerKg: 2.80, density: 0.35 },
  { id: 'genoise_choc',    name: 'Génoise Chocolat', height: 1.5, color: '#3D2010', grad: ['#4A2511','#2A1508'], icon: '🍫', category: 'Biscuits', texture: 'grain', costPerKg: 3.50, density: 0.35 },
  { id: 'dacquoise_hz',    name: 'Dacquoise Noisette', height: 1.0, color: '#C9A96E', grad: ['#D9B97E','#B9995E'], icon: '🌰', category: 'Biscuits', texture: 'grain', costPerKg: 8.50, density: 0.40 },
  { id: 'sable_breton',    name: 'Sablé Breton',    height: 1.2, color: '#E5C49F', grad: ['#F5D4AF','#D5B48F'], icon: '🍪', category: 'Biscuits', texture: 'dots', costPerKg: 4.20, density: 0.60 },
  { id: 'pate_sucree',     name: 'Pâte Sucrée',     height: 0.3, color: '#D2B48C', grad: ['#E6CCB2','#B08968'], icon: '🥧', category: 'Biscuits', texture: 'grain', costPerKg: 4.10, density: 0.70 },
  { id: 'pate_sablee',     name: 'Pâte Sablée',     height: 0.3, color: '#D2B48C', grad: ['#E6CCB2','#B08968'], icon: '🥧', category: 'Biscuits', texture: 'grain', costPerKg: 3.90, density: 0.70 },
  { id: 'pate_brisee',     name: 'Pâte Brisée',     height: 0.3, color: '#EEDC82', grad: ['#FFF8DC','#EEDC82'], icon: '🥧', category: 'Biscuits', texture: 'grain', costPerKg: 2.50, density: 0.75 },
  { id: 'pate_cacao',      name: 'Pâte Sucrée Cacao', height: 0.3, color: '#2A1508', grad: ['#3D2010','#1A0A04'], icon: '🍫', category: 'Biscuits', texture: 'grain', costPerKg: 4.80, density: 0.70 },
  { id: 'feuilletage',     name: 'Pâte Feuilletée', height: 0.4, color: '#D4A574', grad: ['#E2B386','#C69668'], icon: '🥐', category: 'Biscuits', texture: 'grain', costPerKg: 4.50, density: 0.55 },
  { id: 'biscuit_cuillere',name: 'Biscuit Cuillère', height: 1.5, color: '#F3E5AB', grad: ['#FFF8DC','#EEDC82'], icon: '🥖', category: 'Biscuits', texture: 'grain', costPerKg: 3.80, density: 0.30 },
  { id: 'financier',       name: 'Financier Vanille', height: 1.0, color: '#E5C49F', grad: ['#F5D4AF','#D5B48F'], icon: '🍯', category: 'Biscuits', texture: 'grain', costPerKg: 6.80, density: 0.55 },
  { id: 'biscuit_choc_i',  name: 'Biscuit Choc Intense', height: 1.0, color: '#1A0A04', grad: ['#2A1508','#000000'], icon: '🖤', category: 'Biscuits', texture: 'grain', costPerKg: 6.20, density: 0.50 },

  // --- MOUSSES & LÉGÈRETÉ ---
  { id: 'mousse_choc_64',  name: 'Mousse Choc Noir 64%', height: 3.0, color: '#3D2010', grad: ['#5C3A1E','#2A1508'], icon: '🍫', category: 'Mousses', texture: 'smooth', costPerKg: 6.90, density: 0.55 },
  { id: 'mousse_fraise',   name: 'Mousse Fraise Mara', height: 3.0, color: '#E85D75', grad: ['#F07090','#C04060'], icon: '🍓', category: 'Mousses', texture: 'smooth', costPerKg: 5.80, density: 0.50 },
  { id: 'mousse_vanille',  name: 'Mousse Vanille Bourbon', height: 3.0, color: '#FFF5E1', grad: ['#FFFBF0','#F5E8C0'], icon: '🍦', category: 'Mousses', texture: 'cloud', costPerKg: 7.20, density: 0.45 },
  { id: 'ganache_montee_v',name: 'Ganache Montée Vanille', height: 2.5, color: '#FFF5E1', grad: ['#FFFBF0','#F5E8C0'], icon: '🍦', category: 'Mousses', texture: 'cloud', costPerKg: 8.50, density: 0.50 },
  { id: 'ganache_montee_p',name: 'Ganache Montée Pistache', height: 2.5, color: '#9ACD32', grad: ['#ADFF2F','#6B8E23'], icon: '💚', category: 'Mousses', texture: 'cloud', costPerKg: 12.80, density: 0.50 },
  { id: 'creme_diplomate', name: 'Crème Diplomate Vanille', height: 2.0, color: '#FFE4C4', grad: ['#FFF0D8','#F0D090'], icon: '🥛', category: 'Mousses', texture: 'cloud', costPerKg: 4.80, density: 0.60 },
  { id: 'diplomate_choc',  name: 'Diplomate Chocolat', height: 2.0, color: '#4A2511', grad: ['#5C3A1E','#3D2010'], icon: '🍫', category: 'Mousses', texture: 'cloud', costPerKg: 6.20, density: 0.60 },
  { id: 'mousse_exo',      name: 'Mousse Passion-Mangue', height: 3.0, color: '#FFB347', grad: ['#FFCC33','#FF8C00'], icon: '🥭', category: 'Mousses', texture: 'smooth', costPerKg: 6.80, density: 0.55 },
  { id: 'mousse_hz',       name: 'Mousse Noisette Grillée', height: 3.0, color: '#AE8964', grad: ['#C5A582','#8E6A44'], icon: '🌰', category: 'Mousses', texture: 'smooth', costPerKg: 7.90, density: 0.55 },
  { id: 'bavarois',        name: 'Bavarois Vanille',  height: 2.5, color: '#FFE4C4', grad: ['#FFF0D8','#F0D090'], icon: '🥛', category: 'Mousses', texture: 'smooth', costPerKg: 5.50, density: 0.65 },

  // --- CRÈMES & ONCTUOSITÉ ---
  { id: 'namelaka_choc',   name: 'Namelaka Chocolat', height: 1.5, color: '#6B4226', grad: ['#8B5A36','#50300E'], icon: '🤎', category: 'Crèmes', texture: 'smooth', costPerKg: 7.20, density: 0.95 },
  { id: 'cremeux_caramel', name: 'Crémeux Caramel Salé', height: 1.2, color: '#D4840A', grad: ['#F0A020','#B06000'], icon: '🍯', category: 'Crèmes', texture: 'smooth', costPerKg: 4.80, density: 1.05 },
  { id: 'cremeux_citron',  name: 'Crémeux Citron Jaune', height: 1.0, color: '#F5E050', grad: ['#FFEC70','#E0C820'], icon: '🍋', category: 'Crèmes', texture: 'smooth', costPerKg: 5.20, density: 1.05 },
  { id: 'pasticciere',     name: 'Crème Pâtissière', height: 2.0, color: '#FDF5E6', grad: ['#FFFACD','#F5DEB3'], icon: '🥚', category: 'Crèmes', texture: 'smooth', costPerKg: 2.80, density: 1.10 },
  { id: 'creme_amande',    name: 'Crème d\'Amandes', height: 1.5, color: '#E5C49F', grad: ['#F5D4AF','#D5B48F'], icon: '🥜', category: 'Crèmes', texture: 'grain', costPerKg: 7.80, density: 1.00 },
  { id: 'amande_pistache', name: 'Crème Amande Pistache', height: 1.5, color: '#9ACD32', grad: ['#ADFF2F','#6B8E23'], icon: '💚', category: 'Crèmes', texture: 'grain', costPerKg: 10.50, density: 1.00 },
  { id: 'creme_frangipane',name: 'Crème Frangipane', height: 1.5, color: '#F5D4AF', grad: ['#FFE4C4','#D5B48F'], icon: '🥐', category: 'Crèmes', texture: 'smooth', costPerKg: 6.20, density: 1.00 },
  { id: 'appareil_flan',   name: 'Appareil à Flan', height: 4.0, color: '#FFFACD', grad: ['#FAFAD2','#F5DEB3'], icon: '🍮', category: 'Crèmes', texture: 'smooth', costPerKg: 3.50, density: 1.10 },
  { id: 'creme_beurre_c',  name: 'Crème au Beurre Café', height: 1.0, color: '#6F4E37', grad: ['#8B5A36','#5D3A1A'], icon: '☕', category: 'Crèmes', texture: 'smooth', costPerKg: 5.50, density: 0.90 },

  // --- INSERTS & FRUITS ---
  { id: 'croustillant_pr', name: 'Croustillant Praliné', height: 0.5, color: '#A67B3D', grad: ['#C49A4E','#8B6530'], icon: '✨', category: 'Inserts', texture: 'dots', costPerKg: 9.80, density: 1.10 },
  { id: 'confit_framboise',name: 'Confit Framboise', height: 0.8, color: '#8B2252', grad: ['#AA3870','#6A1040'], icon: '🫙', category: 'Inserts', texture: 'bubble', costPerKg: 6.50, density: 1.15 },
  { id: 'confit_rouge',    name: 'Confit Fruits Rouges', height: 0.8, color: '#A52A2A', grad: ['#CD5C5C','#800000'], icon: '🫐', category: 'Inserts', texture: 'bubble', costPerKg: 5.90, density: 1.15 },
  { id: 'compotee_pomme',  name: 'Pommes Tatin', height: 1.5, color: '#CD853F', grad: ['#D2B48C','#8B4513'], icon: '🍎', category: 'Inserts', texture: 'bubble', costPerKg: 3.20, density: 1.05 },
  { id: 'poires_pochees',  name: 'Poires Pochées', height: 1.5, color: '#F5F5DC', grad: ['#FFFFF0','#EEDC82'], icon: '🍐', category: 'Inserts', texture: 'bubble', costPerKg: 4.10, density: 1.05 },
  { id: 'cerises_griottes',name: 'Cerises Griottes', height: 1.0, color: '#800000', grad: ['#A52A2A','#4B0000'], icon: '🍒', category: 'Inserts', texture: 'bubble', costPerKg: 5.50, density: 1.10 },
  { id: 'framboises_f',    name: 'Framboises Fraîches', height: 1.5, color: '#DC143C', grad: ['#FF4D4D','#B30000'], icon: '🍓', category: 'Inserts', texture: 'bubble', costPerKg: 11.50, density: 0.50 },
  { id: 'insert_praline',  name: 'Insert Praliné Coulant', height: 1.0, color: '#8B4513', grad: ['#A0522D','#5D2E0B'], icon: '🌋', category: 'Inserts', texture: 'bubble', costPerKg: 9.50, density: 1.05 },

  // --- FINITIONS ---
  { id: 'glacage_miroir',  name: 'Glaçage Miroir', height: 0.3, color: '#2C3E50', grad: ['#4A6070','#1A2830'], icon: '🪞', category: 'Finitions', texture: 'glass', costPerKg: 4.80, density: 1.10 },
  { id: 'velours_choc',    name: 'Velours Chocolat', height: 0.2, color: '#654321', grad: ['#806040','#482010'], icon: '🧶', category: 'Finitions', texture: 'velvet', costPerKg: 10.50, density: 0.80 },
  { id: 'chantilly_v',     name: 'Chantilly Vanille', height: 2.5, color: '#FFFCF0', grad: ['#FFFFFF','#F5F0E0'], icon: '☁️', category: 'Finitions', texture: 'cloud', costPerKg: 5.80, density: 0.40 },
  { id: 'meringue_italienne', name: 'Meringue Italienne', height: 1.5, color: '#FFF8F0', grad: ['#FFFFFF','#F8F0E8'], icon: '🔮', category: 'Finitions', texture: 'cloud', costPerKg: 3.20, density: 0.30 },
  { id: 'nappage_neutre',  name: 'Nappage Brillance', height: 0.2, color: '#FFFFFF', grad: ['#F8F9FA','#E9ECEF'], icon: '✨', category: 'Finitions', texture: 'glass', costPerKg: 3.50, density: 1.05 },
];

const ASSEMBLY_TEMPLATES = {
  opera: ['biscuit_joconde', 'creme_beurre_c', 'biscuit_joconde', 'namelaka_choc', 'biscuit_joconde', 'creme_beurre_c', 'glacage_miroir'],
  foret_noire: ['genoise_choc', 'chantilly_v', 'cerises_griottes', 'genoise_choc', 'chantilly_v', 'genoise_choc', 'chantilly_v'],
  tarte_citron: ['pate_sucree', 'cremeux_citron', 'meringue_italienne'],
  royal: ['dacquoise_hz', 'croustillant_pr', 'mousse_choc_64', 'glacage_miroir'],
  tatin: ['sable_breton', 'cremeux_caramel', 'compotee_pomme', 'mousse_vanille', 'nappage_neutre'],
  bourdaloue: ['pate_sablee', 'creme_amande', 'poires_pochees'],
  negresco: ['biscuit_choc_i', 'mousse_choc_64', 'confit_rouge', 'mousse_choc_64', 'framboises_f']
};

let assemblyLayers = [];
let currentMold = 'cercle';
let currentView = 'split'; 
let selectedLayerInstanceId = null;

function loadAssemblyTemplate() {
  const select = document.getElementById('assemblyTemplateSelect');
  const templateId = select ? select.value : '';
  if (!templateId || !ASSEMBLY_TEMPLATES[templateId]) return;
  
  const componentIds = ASSEMBLY_TEMPLATES[templateId];
  const newLayers = [];
  
  componentIds.forEach(id => {
    const comp = ASSEMBLY_COMPONENTS.find(c => c.id === id);
    if (comp) {
      newLayers.push(Object.assign({}, comp, {
        instanceId: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
        annotation: { temp: '', rest: '', note: '' }
      }));
    }
  });
  
  assemblyLayers = newLayers;
  
  // Auto-adjust mold and size for templates
  const sizeInput = document.getElementById('assemblyMoldSize');
  const moldSelect = document.getElementById('assemblyMoldSelect');

  if (templateId.startsWith('tarte') || templateId === 'bourdaloue') {
    currentMold = 'tarte';
    if (moldSelect) moldSelect.value = 'tarte';
    if (sizeInput) sizeInput.value = '24';
  } else if (templateId === 'opera') {
    currentMold = 'carre';
    if (moldSelect) moldSelect.value = 'carre';
    if (sizeInput) sizeInput.value = '20';
  } else {
    currentMold = 'cercle';
    if (moldSelect) moldSelect.value = 'cercle';
    if (sizeInput) sizeInput.value = '22';
  }

  renderAssemblyCanvas();
  renderCrossSection();
  if (typeof showToast === 'function') showToast('Modèle chargé avec succès ✓', 'success');
}

// --- Open / Close -------------------------------------------------------
function openAssemblySimulator() {
  const modal = document.getElementById('assemblyModal');
  if (modal) modal.style.display = 'flex';
  loadAssemblyFromStorage(); 
  initAssemblyPalette();
  initAssemblyDragDrop();
  renderAssemblyCanvas();
  renderCrossSection(); // Always render cross section in split view
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
  var zones = ['asmViewStack', 'assemblyCrossSection'];
  zones.forEach(function(id) {
    var zone = document.getElementById(id);
    if (!zone) return;
    zone.addEventListener('dragover', function(e) { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; zone.style.boxShadow = 'inset 0 0 10px var(--accent)'; });
    zone.addEventListener('dragleave', function() { zone.style.boxShadow = ''; });
    zone.addEventListener('drop', function(e) {
      e.preventDefault(); 
      zone.style.boxShadow = '';
      var componentId = e.dataTransfer.getData('text/plain');
      if (componentId && !componentId.startsWith('reorder:')) {
        var comp = ASSEMBLY_COMPONENTS.find(function(c) { return c.id === componentId; });
        if (comp) addAssemblyLayer(comp);
      }
    });
  });
}

function addAssemblyLayer(comp) {
  assemblyLayers.push(Object.assign({}, comp, {
    instanceId: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2,4),
    annotation: { temp: '', rest: '', note: '' }
  }));
  renderAssemblyCanvas();
  renderCrossSection();
}

function duplicateAssemblyLayer(instanceId) {
  const layer = assemblyLayers.find(l => l.instanceId === instanceId);
  if (!layer) return;
  const newLayer = JSON.parse(JSON.stringify(layer));
  newLayer.instanceId = 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2,4);
  const idx = assemblyLayers.indexOf(layer);
  assemblyLayers.splice(idx + 1, 0, newLayer);
  renderAssemblyCanvas();
  renderCrossSection();
}

function removeAssemblyLayer(instanceId) {
  assemblyLayers = assemblyLayers.filter(function(l) { return l.instanceId !== instanceId; });
  if (selectedLayerInstanceId === instanceId) {
    selectedLayerInstanceId = null;
    var panel = document.getElementById('asmAnnotationPanel');
    if (panel) panel.style.display = 'none';
  }
  renderAssemblyCanvas();
  renderCrossSection();
}

function clearAssembly() {
  assemblyLayers = [];
  selectedLayerInstanceId = null;
  var panel = document.getElementById('asmAnnotationPanel');
  if (panel) panel.style.display = 'none';
  renderAssemblyCanvas();
  renderCrossSection();
}

function changeAssemblyMold() {
  var select = document.getElementById('assemblyMoldSelect');
  var sizeInput = document.getElementById('assemblyMoldSize');
  currentMold = select ? select.value : 'cercle';
  
  // Basic constraints
  if (sizeInput) {
    let val = parseFloat(sizeInput.value);
    if (isNaN(val) || val < 1) sizeInput.value = 22;
  }

  renderAssemblyCanvas();
  renderCrossSection();
}

// --- Layer Manager (Montage) --------------------------------------------
function renderAssemblyCanvas() {
  var layersContainer = document.getElementById('assemblyLayers');
  var totalEl = document.getElementById('assemblyTotal');
  
  if (!layersContainer) return;
  
  const sizeInput = document.getElementById('assemblyMoldSize');
  const size = sizeInput ? parseFloat(sizeInput.value) : 22;

  // Real-time Area calculation
  let currentArea = 0;
  if (currentMold === 'cercle' || currentMold === 'tarte' || currentMold === 'verrine') {
    currentArea = Math.PI * Math.pow(size / 2, 2);
  } else if (currentMold === 'carre') {
    currentArea = Math.pow(size, 2);
  } else if (currentMold === 'buche') {
    currentArea = size * 8; // length * standard width
  }

  var totalHeight = 0;
  var totalWeight = 0;
  var totalCost = 0;
  var html = '';
  
  if (assemblyLayers.length === 0) {
    html = '<div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);border:2px dashed var(--surface-border);border-radius:12px;font-size:0.85rem;">' +
           '<div style="font-size:2rem;margin-bottom:10px;opacity:0.3;">🎨</div>' +
           '<p>Glissez des composants ici pour démarrer votre création</p></div>';
  } else {
    assemblyLayers.forEach(function(layer, idx) {
      totalHeight += layer.height;
      
      // Calculations
      const volumeCm3 = currentArea * layer.height;
      const weightG = volumeCm3 * (layer.density || 1.0);
      const layerCost = (weightG / 1000) * (layer.costPerKg || 10);
      
      totalWeight += weightG;
      totalCost += layerCost;

      var isSelected = layer.instanceId === selectedLayerInstanceId;
      var hasAnnot = layer.annotation && (layer.annotation.temp || layer.annotation.rest || layer.annotation.note);
      
      html += '<div class="asm-layer-row' + (isSelected ? ' active' : '') + '" ' +
        'draggable="true" data-idx="' + idx + '" ' +
        'ondragstart="onLayerReorder(event,' + idx + ')" ' +
        'onclick="selectLayerForAnnotation(\'' + layer.instanceId + '\')">' +
        '<div class="asm-row-drag">⋮⋮</div>' +
        '<div class="asm-row-icon" style="background:linear-gradient(135deg,' + layer.grad[0] + ',' + layer.grad[1] + ')">' + layer.icon + '</div>' +
        '<div class="asm-row-info">' +
          '<div style="display:flex; justify-content:space-between; align-items:center;">' +
            '<span class="asm-row-name">' + layer.name + '</span>' +
            '<span style="font-size:0.75rem; font-weight:800; color:var(--accent); font-family:\'JetBrains Mono\', monospace;">' + layerCost.toFixed(2) + ' €</span>' +
          '</div>' +
          '<span class="asm-row-meta">' + layer.height + ' cm • ' + Math.round(weightG) + 'g' + (hasAnnot ? ' • 📌' : '') + '</span>' +
        '</div>' +
        '<div class="asm-row-actions">' +
          '<button class="asm-row-btn" onclick="event.stopPropagation(); duplicateAssemblyLayer(\'' + layer.instanceId + '\')" title="Dupliquer">👯</button>' +
          '<button class="asm-row-btn" onclick="event.stopPropagation(); removeAssemblyLayer(\'' + layer.instanceId + '\')" title="Supprimer">✕</button>' +
        '</div>' +
        '</div>';
    });
  }
  
  layersContainer.innerHTML = html;
  
  if (totalEl) {
    const portInput = document.getElementById('assemblyPortions');
    const portions = portInput ? parseInt(portInput.value) || 10 : 10;
    const costPerPortion = totalCost / portions;
    
    totalEl.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:12px;">
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div style="background:var(--surface); padding:10px; border-radius:10px; border:1px solid var(--surface-border); display:flex; flex-direction:column; gap:2px;">
            <span style="font-size:0.6rem; font-weight:800; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.05em;">Poids Estimé</span>
            <span style="font-family:'Outfit', sans-serif; font-size:1.2rem; font-weight:900; color:var(--text);">${(totalWeight/1000).toFixed(3)} <small style="font-size:0.6em; opacity:0.6;">kg</small></span>
          </div>
          <div style="background:var(--surface); padding:10px; border-radius:10px; border:1px solid var(--surface-border); display:flex; flex-direction:column; gap:2px;">
            <span style="font-size:0.6rem; font-weight:800; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.05em;">Coût Matière</span>
            <span style="font-family:'Outfit', sans-serif; font-size:1.2rem; font-weight:900; color:var(--accent-dark);">${totalCost.toFixed(2)} <small style="font-size:0.6em; opacity:0.6;">€</small></span>
          </div>
        </div>
        
        <div style="display:flex; justify-content:space-between; align-items:center; padding:0 4px; border-top:1px dashed var(--surface-border); pt:10px;">
          <div style="display:flex; flex-direction:column;">
            <span style="font-size:0.6rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Volume Total</span>
            <span style="font-size:0.85rem; font-weight:700;">${totalHeight.toFixed(1)} <small>cm</small></span>
          </div>
          <div style="display:flex; flex-direction:column; align-items:flex-end;">
            <span style="font-size:0.6rem; font-weight:800; color:var(--text-muted); text-transform:uppercase;">Prix / Part (${portions}p)</span>
            <span style="font-size:0.85rem; font-weight:700; color:var(--accent);">${costPerPortion.toFixed(2)} €</span>
          </div>
        </div>
      </div>
    `;
  }
  
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
          renderCrossSection();
        }
      } else {
        var comp = ASSEMBLY_COMPONENTS.find(function(c) { return c.id === data; });
        if (comp) {
          // Check if we should REPLACE or INSERT
          // For simplicity, we'll INSERT after by default, 
          // but if we want to "SWITCH" (replace), we can use a prompt or a specific drop zone.
          // Let's implement REPLACE if they drop it while holding Alt, or just provide a REPLACE button.
          // Better: If they drop it on a row, we ask if they want to replace or insert.
          // Actually, let's just REPLACE for now if dropped on a row, it's what "Switch" usually means.
          var idx = parseInt(layer.dataset.idx);
          var newLayer = Object.assign({}, comp, { 
            instanceId: 'layer_' + Date.now() + '_' + Math.random().toString(36).substr(2,4), 
            annotation: assemblyLayers[idx].annotation // Preserve annotations when switching!
          });
          assemblyLayers[idx] = newLayer; // REPLACE
          renderAssemblyCanvas();
          renderCrossSection();
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
  var heightEl = document.getElementById('asmAnnotHeight');
  if (tempEl) tempEl.value = (layer.annotation && layer.annotation.temp) || '';
  if (restEl) restEl.value = (layer.annotation && layer.annotation.rest) || '';
  if (noteEl) noteEl.value = (layer.annotation && layer.annotation.note) || '';
  if (heightEl) heightEl.value = layer.height || 0;
  renderAssemblyCanvas();
}

function saveLayerAnnotation() {
  const layer = assemblyLayers.find(l => l.instanceId === selectedLayerInstanceId);
  if (!layer) return;
  const heightVal = parseFloat(document.getElementById('asmAnnotHeight').value);
  if (!isNaN(heightVal)) layer.height = heightVal;
  layer.annotation = {
    temp: document.getElementById('asmAnnotTemp').value,
    rest: document.getElementById('asmAnnotRest').value,
    note: document.getElementById('asmAnnotNote').value
  };
  renderAssemblyCanvas();
  renderCrossSection();
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
      <filter id="innerShadow">
        <feComponentTransfer in="SourceAlpha">
          <feFuncA type="table" tableValues="1 0" />
        </feComponentTransfer>
        <feGaussianBlur stdDeviation="3"/>
        <feOffset dx="0" dy="2" result="offsetblur"/>
        <feFlood flood-color="black" flood-opacity="0.3"/>
        <feComposite in2="offsetblur" operator="in"/>
        <feComposite in2="SourceAlpha" operator="in" />
        <feMerge>
          <feMergeNode in="SourceGraphic" />
          <feMergeNode />
        </feMerge>
      </filter>
      <clipPath id="sClip"><path d="${moldPath}"/></clipPath>
      <filter id="sdrp" x="-10%" y="-10%" width="120%" height="120%">
        <feDropShadow dx="0" dy="15" stdDeviation="20" flood-color="rgba(0,0,0,0.15)"/>
      </filter>
    </defs>`;

  // ── Construction ───────────────────────────────────────────────────────
  let layerRects = '';
  layerData.forEach(d => {
    layerRects += `
      <rect x="${MOLD_X}" y="${d.y}" width="${MOLD_W}" height="${d.h}" fill="url(#${d.pId})" filter="url(#innerShadow)"/>
      <rect x="${MOLD_X}" y="${d.y}" width="${MOLD_W}" height="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="${MOLD_X}" y="${d.y + d.h - 1}" width="${MOLD_W}" height="1" fill="rgba(0,0,0,0.1)"/>`;
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
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SVG_W} ${SVG_H}" width="${SVG_W}" height="${SVG_H}" style="max-width:100%;height:auto;background:#ffffff;display:block;border-radius:16px;box-shadow: 0 40px 100px rgba(0,0,0,0.12);">
      ${defs}
      
      <!-- Premium Background -->
      <rect width="${SVG_W}" height="${SVG_H}" fill="white"/>
      <defs>
        <radialGradient id="bgGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#f8fafc"/>
          <stop offset="100%" stop-color="#ffffff"/>
        </radialGradient>
      </defs>
      <rect width="${SVG_W}" height="${SVG_H}" fill="url(#bgGrad)"/>

      <!-- Blueprint Grid -->
      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#f1f5f9" stroke-width="1"/>
      </pattern>
      <rect width="${SVG_W}" height="${SVG_H}" fill="url(#grid)"/>

      <!-- Cartouche High-End -->
      <g transform="translate(50, 50)">
        <text font-family="Outfit" font-weight="900" font-size="28" fill="#1e293b" letter-spacing="-0.02em">Gourmet<tspan fill="#6366f1">Revient</tspan></text>
        <text y="22" font-family="Inter" font-weight="700" font-size="10" fill="#94a3b8" letter-spacing="0.2em">DESIGN TECHNIQUE ET COUPE</text>
      </g>

      <g transform="translate(${SVG_W - 250}, 50)">
        <rect width="200" height="60" rx="12" fill="#1e293b"/>
        <text x="100" y="25" text-anchor="middle" font-family="Outfit" font-weight="900" font-size="14" fill="white">MODE : ${moldLabels[currentMold].toUpperCase()}</text>
        <text x="100" y="45" text-anchor="middle" font-family="Inter" font-weight="700" font-size="9" fill="#94a3b8">H. TOTALE : ${totalHeight.toFixed(1)} cm</text>
      </g>

      <!-- Main Drawing Area -->
      <g filter="url(#sdrp)">
        <g clip-path="url(#sClip)">
          ${layerRects}
        </g>
        <path d="${moldPath}" fill="none" stroke="#1e293b" stroke-width="4" stroke-linejoin="round" stroke-linecap="round"/>
      </g>
      
      <!-- Designer Dimensions -->
      ${dimSvg}
      ${labelSvg}

      <!-- Production Watermark -->
      <text x="${SVG_W/2}" y="${SVG_H - 30}" text-anchor="middle" font-family="Outfit" font-weight="900" font-size="12" fill="#cbd5e1" letter-spacing="0.5em">DOCUMENT TECHNIQUE - PROPRIÉTÉ DU CHEF</text>
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
window.loadAssemblyTemplate   = loadAssemblyTemplate;
