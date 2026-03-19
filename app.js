/*
  =====================================================================
  APP.JS — GourmetRevient Professional Recipe Cost Calculator
  Modular Vanilla JavaScript
  =====================================================================
*/

// ============================================================================
// STATE
// ============================================================================

const APP = {
  currentStep: 0,
  recipe: { id: null, name: '', category: '', portions: 10, prepTime: 60, cookTime: 30, description: '', ingredients: [], steps: [] },
  margin: 70,
  savedRecipes: [],
  ingredientDb: [],
  teamMembers: [],
  staffLeaves: [],
  inventory: [],
  suppliers: [
    { id: 101, name: 'Metro Cash & Carry', contact: 'M. Lefebvre', email: 'service-client@metro.fr', categories: ['Général', 'Frais', 'Sec'], rating: 4.8 },
    { id: 102, name: 'Valrhona', contact: 'Claire Val', email: 'pro@valrhona.com', categories: ['Chocolat', 'Praliné', 'Couverture'], rating: 5.0 },
    { id: 103, name: 'Grands Moulins de Paris', contact: 'Jean Meunier', email: 'commandes@gmp.fr', categories: ['Farine', 'Mixes', 'Céréales'], rating: 4.9 }
  ],
  history: [], // New for stats
  haccpLogs: { temp: [], trace: [], clean: [], reception: [] },
  viewOwner: null,
  notifications: [],
  baselineCosts: null,
  wasteLogs: []
};
window.APP = APP;

// --- Global States & State Containers ---
let v2Charts = { margin: null, performance: null, scatter: null };
let perfMode = 'top';
window.currentStatsCat = 'all';

// ============================================================================
// UTILS
// ============================================================================

function throttle(func, limit) {
  let inThrottle;
  return function () {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}

const STORAGE_KEYS = {
  users: 'gourmet_users_db',
  currentUser: 'gourmet_current_user',
  ingredientDb: 'gourmetrevient_ingredient_db',
  teamMembers: 'gourmet_team_members',
  staffLeaves: 'gourmet_staff_leaves',
  sharedPlannings: 'gourmet_shared_plannings',
  notifications: 'gourmet_notifications',
  vacationZone: 'gourmet_vacation_zone',
  inventory: 'gourmet_inventory',
  haccpLogs: 'gourmet_haccp_logs',
  wasteLogs: 'gourmet_waste_logs'
};

// Default ingredient database (pre-loaded)
const DEFAULT_INGREDIENT_DB = [
  // --- 1. FARINES, FÉCULES & CÉRÉALES ---
  { name: 'Farine T45', unit: 'g', pricePerUnit: 0.48, priceRef: 'kg', allergens: ['Gluten'] },
  { name: 'Farine T55', unit: 'g', pricePerUnit: 0.44, priceRef: 'kg', allergens: ['Gluten'] },
  { name: 'Farine de Gruau T45', unit: 'g', pricePerUnit: 1.10, priceRef: 'kg', allergens: ['Gluten'] },
  { name: 'Farine T55 Label Rouge', unit: 'g', pricePerUnit: 0.95, priceRef: 'kg', allergens: ['Gluten'] },
  { name: 'Farine de Seigle T130', unit: 'g', pricePerUnit: 1.50, priceRef: 'kg', allergens: ['Gluten'] },
  { name: 'Farine de Sarrasin', unit: 'g', pricePerUnit: 2.50, priceRef: 'kg', allergens: [] },
  { name: 'Farine de Riz (S.G)', unit: 'g', pricePerUnit: 3.20, priceRef: 'kg', allergens: [] },
  { name: 'Farine de Châtaigne', unit: 'g', pricePerUnit: 9.50, priceRef: 'kg', allergens: [] },
  { name: 'Fécule de Pomme de Terre', unit: 'g', pricePerUnit: 2.20, priceRef: 'kg', allergens: [] },
  { name: 'Maïzena', unit: 'g', pricePerUnit: 1.80, priceRef: 'kg', allergens: [] },

  // --- 2. BEURRES & MATIÈRES GRASSES ---
  { name: 'Beurre AOP', unit: 'g', pricePerUnit: 6.15, priceRef: 'kg', allergens: ['Lait'] },
  { name: 'Beurre doux', unit: 'g', pricePerUnit: 5.50, priceRef: 'kg', allergens: ['Lait'] },
  { name: 'Beurre Tourage AOP 82%', unit: 'g', pricePerUnit: 10.50, priceRef: 'kg', allergens: ['Lait'] },
  { name: 'Beurre de Cacao', unit: 'g', pricePerUnit: 12.50, priceRef: 'kg', allergens: [] },
  { name: 'Beurre de Cacao Mycryo', unit: 'g', pricePerUnit: 28.00, priceRef: 'kg', allergens: [] },
  { name: 'Huile de Coco Vierge', unit: 'ml', pricePerUnit: 12.00, priceRef: 'L', allergens: [] },

  // --- 3. SUCRES & PRODUITS SUCRANTS ---
  { name: 'Sucre semoule', unit: 'g', pricePerUnit: 0.68, priceRef: 'kg', allergens: [] },
  { name: 'Sucre glace', unit: 'g', pricePerUnit: 1.60, priceRef: 'kg', allergens: [] },
  { name: 'Sucre Muscovado', unit: 'g', pricePerUnit: 3.50, priceRef: 'kg', allergens: [] },
  { name: 'Vergeoise Brune', unit: 'g', pricePerUnit: 2.80, priceRef: 'kg', allergens: [] },
  { name: 'Sucre de Fleur de Coco', unit: 'g', pricePerUnit: 11.00, priceRef: 'kg', allergens: [] },
  { name: 'Glucose', unit: 'g', pricePerUnit: 3.50, priceRef: 'kg', allergens: [] },
  { name: 'Sirop de Glucose', unit: 'g', pricePerUnit: 2.80, priceRef: 'kg', allergens: [] },
  { name: 'Trimoline (Sucre Inverti)', unit: 'g', pricePerUnit: 3.80, priceRef: 'kg', allergens: [] },
  { name: 'Miel de Fleurs', unit: 'g', pricePerUnit: 6.50, priceRef: 'kg', allergens: [] },
  { name: 'Sirop d\'Erable Grade A', unit: 'ml', pricePerUnit: 28.00, priceRef: 'L', allergens: [] },
  { name: 'Isomalt', unit: 'g', pricePerUnit: 6.50, priceRef: 'kg', allergens: [] },
  { name: 'Sorbitol Poudre', unit: 'g', pricePerUnit: 18.00, priceRef: 'kg', allergens: [] },

  // --- 4. PRODUITS LAITIERS ---
  { name: 'Lait entier', unit: 'ml', pricePerUnit: 0.72, priceRef: 'L', allergens: ['Lait'] },
  { name: 'Lait d\'Amande Pro', unit: 'ml', pricePerUnit: 2.80, priceRef: 'L', allergens: ['Fruits à coque'] },
  { name: 'Crème 35% MG Excellence', unit: 'ml', pricePerUnit: 4.50, priceRef: 'L', allergens: ['Lait'] },
  { name: 'Crème 35% MG', unit: 'ml', pricePerUnit: 3.25, priceRef: 'L', allergens: ['Lait'] },
  { name: 'Mascarpone', unit: 'g', pricePerUnit: 6.80, priceRef: 'kg', allergens: ['Lait'] },

  // --- 5. ŒUFS & DÉRIVÉS ---
  { name: 'Œufs Frais (L)', unit: 'pièce', pricePerUnit: 0.18, priceRef: 'pièce', allergens: ['Œufs'] },
  { name: 'Œufs entiers', unit: 'pièce', pricePerUnit: 0.11, priceRef: 'pièce', allergens: ['Œufs'] },
  { name: 'Jaunes d\'œufs', unit: 'pièce', pricePerUnit: 0.11, priceRef: 'pièce', allergens: ['Œufs'] },
  { name: 'Blancs d\'œufs', unit: 'pièce', pricePerUnit: 0.08, priceRef: 'pièce', allergens: ['Œufs'] },
  { name: 'Blanc d\'œuf Pasteurisé', unit: 'g', pricePerUnit: 4.50, priceRef: 'kg', allergens: ['Œufs'] },
  { name: 'Jaune d\'œuf Pasteurisé', unit: 'g', pricePerUnit: 9.00, priceRef: 'kg', allergens: ['Œufs'] },
  { name: 'Poudre de Blanc d\'Œuf', unit: 'g', pricePerUnit: 35.00, priceRef: 'kg', allergens: ['Œufs'] },

  // --- 6. CHOCOLATERIE & CACAO ---
  { name: 'Chocolat noir 64%', unit: 'g', pricePerUnit: 11.50, priceRef: 'kg', allergens: ['Lait', 'Soja'] },
  { name: 'Chocolat Guanaja 70%', unit: 'g', pricePerUnit: 18.50, priceRef: 'kg', allergens: ['Lait', 'Soja'] },
  { name: 'Chocolat au Lait 35%', unit: 'g', pricePerUnit: 10.20, priceRef: 'kg', allergens: ['Lait', 'Soja'] },
  { name: 'Chocolat Jivara 40%', unit: 'g', pricePerUnit: 17.20, priceRef: 'kg', allergens: ['Lait', 'Soja'] },
  { name: 'Chocolat Blanc 33%', unit: 'g', pricePerUnit: 9.80, priceRef: 'kg', allergens: ['Lait', 'Soja'] },
  { name: 'Chocolat Opalys 33%', unit: 'g', pricePerUnit: 18.90, priceRef: 'kg', allergens: ['Lait', 'Soja'] },
  { name: 'Chocolat Dulcey 35%', unit: 'g', pricePerUnit: 19.80, priceRef: 'kg', allergens: ['Lait', 'Soja'] },
  { name: 'Cacao poudre', unit: 'g', pricePerUnit: 12.00, priceRef: 'kg', allergens: [] },
  { name: 'Poudre Cacao Barry', unit: 'g', pricePerUnit: 18.00, priceRef: 'kg', allergens: [] },
  { name: 'Pâte à glacer Brune', unit: 'g', pricePerUnit: 8.50, priceRef: 'kg', allergens: ['Soja'] },

  // --- 7. FRUITS FRAIS & SECS ---
  { name: 'Fraises fraîches', unit: 'g', pricePerUnit: 4.50, priceRef: 'kg', allergens: [] },
  { name: 'Pomme Golden', unit: 'kg', pricePerUnit: 2.20, priceRef: 'kg', allergens: [] },
  { name: 'Poire Williams', unit: 'kg', pricePerUnit: 3.50, priceRef: 'kg', allergens: [] },
  { name: 'Menthe Fraîche', unit: 'g', pricePerUnit: 25.00, priceRef: 'kg', allergens: [] },
  { name: 'Citron Vert', unit: 'pièce', pricePerUnit: 0.45, priceRef: 'pièce', allergens: [] },
  { name: 'Orange', unit: 'pièce', pricePerUnit: 0.35, priceRef: 'pièce', allergens: [] },
  { name: 'Griottes au Sirop', unit: 'g', pricePerUnit: 12.50, priceRef: 'kg', allergens: [] },

  // --- 8. PURÉES & COULIS DE FRUITS ---
  { name: 'Purée de Fraise', unit: 'ml', pricePerUnit: 11.50, priceRef: 'L', allergens: [] },
  { name: 'Purée de Framboise', unit: 'ml', pricePerUnit: 13.20, priceRef: 'L', allergens: [] },
  { name: 'Purée de Mangue', unit: 'ml', pricePerUnit: 12.80, priceRef: 'L', allergens: [] },
  { name: 'Purée de Passion', unit: 'ml', pricePerUnit: 14.80, priceRef: 'L', allergens: [] },
  { name: 'Purée de Cassis', unit: 'ml', pricePerUnit: 11.20, priceRef: 'L', allergens: [] },
  { name: 'Purée de Yuzu', unit: 'ml', pricePerUnit: 55.00, priceRef: 'L', allergens: [] },
  { name: 'Purée de Litchi', unit: 'ml', pricePerUnit: 16.50, priceRef: 'L', allergens: [] },
  { name: 'Purée de Noix de Coco', unit: 'ml', pricePerUnit: 14.20, priceRef: 'L', allergens: [] },
  { name: 'Purée de Goyave Rose', unit: 'ml', pricePerUnit: 15.80, priceRef: 'L', allergens: [] },
  { name: 'Purée de Bergamote', unit: 'ml', pricePerUnit: 24.00, priceRef: 'L', allergens: [] },
  { name: 'Poudre de Fraise Lyophilisée', unit: 'g', pricePerUnit: 120.00, priceRef: 'kg', allergens: [] },

  // --- 9. FRUITS À COQUE & PÂTES ---
  { name: 'Poudre d\'amandes', unit: 'g', pricePerUnit: 9.50, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Amandes effilées', unit: 'g', pricePerUnit: 9.50, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Amandes blanchies', unit: 'g', pricePerUnit: 11.20, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Noisettes torréfiées', unit: 'g', pricePerUnit: 12.50, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Poudre de Noisette', unit: 'g', pricePerUnit: 14.50, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Pâte de Noisette 100%', unit: 'g', pricePerUnit: 24.00, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Pâte Noisette Piémont I.G.P', unit: 'g', pricePerUnit: 42.00, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Praliné noisette', unit: 'g', pricePerUnit: 14.50, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Pistaches Entières', unit: 'g', pricePerUnit: 28.50, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Pâte de pistache', unit: 'g', pricePerUnit: 38.00, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Pistache de Bronte D.O.P', unit: 'g', pricePerUnit: 85.00, priceRef: 'kg', allergens: ['Fruits à coque'] },
  { name: 'Noix de Coco Râpée', unit: 'g', pricePerUnit: 7.20, priceRef: 'kg', allergens: [] },

  // --- 10. ÉPICES, VANILLES & ARÔMES ---
  { name: 'Vanille (gousse)', unit: 'pièce', pricePerUnit: 1.80, priceRef: 'pièce', allergens: [] },
  { name: 'Gousse Vanille Bourbon', unit: 'pièce', pricePerUnit: 2.50, priceRef: 'pièce', allergens: [] },
  { name: 'Gousses de Vanille Tahiti', unit: 'pièce', pricePerUnit: 4.50, priceRef: 'pièce', allergens: [] },
  { name: 'Arôme Naturel Vanille', unit: 'ml', pricePerUnit: 45.00, priceRef: 'L', allergens: [] },
  { name: 'Arôme Amande Amère', unit: 'ml', pricePerUnit: 35.00, priceRef: 'L', allergens: [] },
  { name: 'Extrait Café Trablit', unit: 'ml', pricePerUnit: 52.00, priceRef: 'L', allergens: [] },
  { name: 'Café soluble', unit: 'g', pricePerUnit: 18.00, priceRef: 'kg', allergens: [] },
  { name: 'Matcha Cérémonial', unit: 'g', pricePerUnit: 250.00, priceRef: 'kg', allergens: [] },
  { name: 'Thé Matcha', unit: 'g', pricePerUnit: 85.00, priceRef: 'kg', allergens: [] },
  { name: 'Tonka (fèves entières)', unit: 'g', pricePerUnit: 110.00, priceRef: 'kg', allergens: [] },
  { name: 'Poivre de Timut', unit: 'g', pricePerUnit: 95.00, priceRef: 'kg', allergens: [] },
  { name: 'Eau de Fleur d\'Oranger', unit: 'ml', pricePerUnit: 18.00, priceRef: 'L', allergens: [] },
  { name: 'Sel', unit: 'g', pricePerUnit: 0.50, priceRef: 'kg', allergens: [] },
  { name: 'Fleur de sel', unit: 'g', pricePerUnit: 18.00, priceRef: 'kg', allergens: [] },
  { name: 'Fleur de Sel de Guérande', unit: 'g', pricePerUnit: 12.00, priceRef: 'kg', allergens: [] },
  { name: 'Sel de Guérande Moulu', unit: 'g', pricePerUnit: 0.85, priceRef: 'kg', allergens: [] },

  // --- 11. ALCOOLS & SPIRITUEUX ---
  { name: 'Rhum Ambré 54%', unit: 'ml', pricePerUnit: 42.00, priceRef: 'L', allergens: [] },
  { name: 'Grand Marnier 54%', unit: 'ml', pricePerUnit: 48.00, priceRef: 'L', allergens: [] },
  { name: 'Amaretto Disaronno', unit: 'ml', pricePerUnit: 32.00, priceRef: 'L', allergens: [] },
  { name: 'Kirsh Pâtissier', unit: 'ml', pricePerUnit: 35.00, priceRef: 'L', allergens: [] },

  // --- 12. GÉLIFIANTS, ADDITIFS & AIDES ---
  { name: 'Levure fraîche', unit: 'g', pricePerUnit: 6.50, priceRef: 'kg', allergens: [] },
  { name: 'Levure chimique', unit: 'g', pricePerUnit: 8.50, priceRef: 'kg', allergens: [] },
  { name: 'Poudre à lever', unit: 'g', pricePerUnit: 4.20, priceRef: 'kg', allergens: [] },
  { name: 'Bicarbonate de soude', unit: 'g', pricePerUnit: 2.50, priceRef: 'kg', allergens: [] },
  { name: 'Gélatine en feuilles (Or)', unit: 'g', pricePerUnit: 28.00, priceRef: 'kg', allergens: [] },
  { name: 'Gélatine poudre 200 Bloom', unit: 'g', pricePerUnit: 22.00, priceRef: 'kg', allergens: [] },
  { name: 'Agar-agar', unit: 'g', pricePerUnit: 65.00, priceRef: 'kg', allergens: [] },
  { name: 'Pectine NH', unit: 'g', pricePerUnit: 45.00, priceRef: 'kg', allergens: [] },
  { name: 'Pectine X58', unit: 'g', pricePerUnit: 75.00, priceRef: 'kg', allergens: [] },
  { name: 'Pectine Jaune', unit: 'g', pricePerUnit: 68.00, priceRef: 'kg', allergens: [] },
  { name: 'Pectine Rapide (Nappage)', unit: 'g', pricePerUnit: 52.00, priceRef: 'kg', allergens: [] },
  { name: 'Acide Citrique', unit: 'g', pricePerUnit: 12.00, priceRef: 'kg', allergens: [] },
  { name: 'Crème de Tartre', unit: 'g', pricePerUnit: 28.00, priceRef: 'kg', allergens: [] },

  // --- 13. DIVERS & DÉCORS ---
  { name: 'Feuillantine', unit: 'g', pricePerUnit: 18.50, priceRef: 'kg', allergens: ['Gluten'] },
  { name: 'Speculoos', unit: 'g', pricePerUnit: 6.20, priceRef: 'kg', allergens: ['Gluten'] },
  { name: 'Colorant Jaune Hydrosoluble', unit: 'g', pricePerUnit: 95.00, priceRef: 'kg', allergens: [] },
  { name: 'Colorant Noir Carbone', unit: 'g', pricePerUnit: 150.00, priceRef: 'kg', allergens: [] },
  { name: 'Feuille d\'Or 24 carats', unit: 'pièce', pricePerUnit: 2.50, priceRef: 'pièce', allergens: [] },
];

// Planning Constants - 2026 (Zone C - Toulouse)
const HOLIDAYS_A_2026 = [
  { start: "2025-12-20", end: "2026-01-05", label: "Vacances de Noël" },
  { start: "2026-02-07", end: "2026-02-23", label: "Vacances d'Hiver" },
  { start: "2026-04-04", end: "2026-04-20", label: "Vacances de Printemps" },
  { start: "2026-05-14", end: "2026-05-17", label: "Pont de l'Ascension" },
  { start: "2026-07-04", end: "2026-08-31", label: "Vacances d'Été" },
  { start: "2026-10-17", end: "2026-11-02", label: "Vacances de la Toussaint" },
  { start: "2026-12-19", end: "2027-01-04", label: "Vacances de Noël" }
];
const HOLIDAYS_B_2026 = [
  { start: "2025-12-20", end: "2026-01-05", label: "Vacances de Noël" },
  { start: "2026-02-14", end: "2026-03-02", label: "Vacances d'Hiver" },
  { start: "2026-04-11", end: "2026-04-27", label: "Vacances de Printemps" },
  { start: "2026-05-14", end: "2026-05-17", label: "Pont de l'Ascension" },
  { start: "2026-07-04", end: "2026-08-31", label: "Vacances d'Été" },
  { start: "2026-10-17", end: "2026-11-02", label: "Vacances de la Toussaint" },
  { start: "2026-12-19", end: "2027-01-04", label: "Vacances de Noël" }
];
const HOLIDAYS_C_2026 = [
  { start: "2025-12-20", end: "2026-01-05", label: "Vacances de Noël" },
  { start: "2026-02-21", end: "2026-03-09", label: "Vacances d'Hiver" },
  { start: "2026-04-18", end: "2026-05-04", label: "Vacances de Printemps" },
  { start: "2026-05-14", end: "2026-05-17", label: "Pont de l'Ascension" },
  { start: "2026-07-04", end: "2026-08-31", label: "Vacances d'Été" },
  { start: "2026-10-17", end: "2026-11-02", label: "Vacances de la Toussaint" },
  { start: "2026-12-19", end: "2027-01-04", label: "Vacances de Noël" }
];
const HOLIDAYS_2026 = { A: HOLIDAYS_A_2026, B: HOLIDAYS_B_2026, C: HOLIDAYS_C_2026 };

const PASTRY_EVENTS_2026 = {
  "01-01": "Jour de l'An",
  "01-06": "Épiphanie (Galettes)",
  "02-02": "Chandeleur (Crêpes)",
  "02-14": "Saint Valentin (Cœur)",
  "02-17": "Mardi Gras (Beignets)",
  "04-05": "Pâques (Chocolats)",
  "04-06": "Lundi de Pâques",
  "05-01": "Fête du Travail",
  "05-08": "Victoire 1945",
  "05-14": "Ascension",
  "05-24": "Pentecôte",
  "05-25": "Lundi de Pentecôte",
  "05-31": "Fête des Mères",
  "06-21": "Fête des Pères / Musique",
  "07-14": "Fête Nationale",
  "08-15": "Assomption",
  "11-01": "Toussaint",
  "11-11": "Armistice 1918",
  "12-25": "Noël (Bûches)",
  "12-31": "Réveillon St Sylvestre"
};

// --- Localization Helpers ---
function getTranslatedEvent(dateStr) {
  const keys = {
    "01-01": "event.nye", "01-06": "event.epiphany", "02-02": "event.candlemass",
    "02-14": "event.valentine", "02-17": "event.mardigras", "04-05": "event.easter",
    "04-06": "event.easter_monday", "05-01": "event.labor", "05-08": "event.vday_1945",
    "05-14": "event.ascension", "05-24": "event.pentecost", "05-25": "event.pentecost_monday",
    "05-31": "event.mothers", "06-21": "event.fathers", "07-14": "event.nat_day",
    "08-15": "event.assumption", "11-01": "event.all_saints", "11-11": "event.armistice",
    "12-25": "event.christmas", "12-31": "event.nye_eve"
  };
  const key = keys[dateStr];
  return key ? t(key) : PASTRY_EVENTS_2026[dateStr];
}

function updateVacationZone() {
  const selector = $('#vacationZoneSelector');
  if (!selector) return;
  const zone = selector.value;
  localStorage.setItem(STORAGE_KEYS.vacationZone, zone);

  // Update UI text in real-time
  const titleEl = document.getElementById('planningCalendarTitle');
  const legendEl = document.getElementById('planningHolidayLegend');

  if (titleEl) {
    // We can also make the title dynamic if desired
    titleEl.textContent = t('plan.calendar.title');
  }
  if (legendEl) {
    // The i18n system now handles the {zone} placeholder
    legendEl.textContent = t('plan.legend.holidays', { zone: zone });
  }

  renderAnnualCalendar();
  if (typeof showToast === 'function') {
    showToast(t('plan.toast.updated') || 'Zone mise à jour');
  }
}

function getTranslatedHoliday(label) {
  const keys = {
    "Vacances d'Hiver": "holiday.winter",
    "Vacances de Printemps": "holiday.spring",
    "Vacances d'Été": "holiday.summer",
    "Vacances de la Toussaint": "holiday.autumn",
    "Vacances de Noël": "holiday.xmas"
  };
  const key = keys[label];
  return key ? t(key) : label;
}

// ============================================================================
// UTILITIES
// ============================================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
// round2 is already defined in data.js

function generateId() {
  return 'r_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function getIngredientIcon(name) {
  const n = (name || '').toLowerCase();
  if (n.includes('beurre')) return '🧈';
  if (n.includes('lait') || n.includes('crème') || n.includes('creme')) return '🥛';
  if (n.includes('œuf') || n.includes('oeuf') || n.includes('oufs')) return '🥚';
  if (n.includes('farine')) return '🌾';
  if (n.includes('sucre')) return '🍬';
  if (n.includes('chocolat') || n.includes('cacao')) return '🍫';
  if (n.includes('fraise') || n.includes('framboise') || n.includes('fruit')) return '🍓';
  if (n.includes('vanille')) return '🍦';
  if (n.includes('sel')) return '🧂';
  if (n.includes('huile')) return '🫗';
  if (n.includes('amande') || n.includes('noisette') || n.includes('noix')) return '🥜';
  if (n.includes('levure')) return '🍞';
  if (n.includes('citron')) return '🍋';
  return '📦';
}

// ============================================================================
// INGREDIENT COST CALCULATION
// ============================================================================

function calcIngredientCost(ing, depth = 0) {
  if (depth > 5) return 0; // Prevent infinite recursion

  const qty = parseFloat(ing.quantity) || 0;
  const unit = ing.unit || 'g';

  // RECURSIVE COST CALCULATION: Check if ingredient is a sub-recipe (Composition)
  const savedRecipes = JSON.parse(localStorage.getItem(getUserRecipesKey()) || '[]');
  const subRecipe = savedRecipes.find(r => r.name.toLowerCase() === ing.name.toLowerCase());

  if (subRecipe) {
    let subCost = 0;
    let subWeightGrams = 0;
    subRecipe.ingredients.forEach(subIng => {
      subCost += calcIngredientCost(subIng, depth + 1);
      let subQty = parseFloat(subIng.quantity) || 0;
      if (subIng.unit === 'kg' || subIng.unit === 'L') subQty *= 1000;
      subWeightGrams += subQty;
    });

    if (subWeightGrams === 0) return 0;

    // Convert requested qty to grams
    let reqQtyInGrams = qty;
    if (unit === 'kg' || unit === 'L') reqQtyInGrams *= 1000;
    // If unit is 'piece', we fallback to treating qty as chunks of total weight (e.g. 1 piece = 1 whole recipe).
    if (unit === 'pièce') {
       return subCost * qty; // Total sub-recipe cost * number of pieces
    }

    // Cost per gram * requested grams
    return (subCost / subWeightGrams) * reqQtyInGrams;
  }

  let price = parseFloat(ing.pricePerUnit);
  if (isNaN(price)) price = parseFloat(ing.pricePerKg);
  if (isNaN(price)) price = parseFloat(ing.pricePerL);
  if (isNaN(price)) price = parseFloat(ing.pricePerPc);
  if (isNaN(price)) price = 0;

  // price is per kg, per L, or per pièce
  if (unit === 'g' || unit === 'ml') return (qty / 1000) * price;
  return qty * price;
}

function calcTotalMaterialCost() {
  return APP.recipe.ingredients.reduce((sum, ing) => sum + calcIngredientCost(ing), 0);
}

function calcFullCost(margin, customRecipe = null, forcedInflation = null) {
  // Ensure it's available globally for pro-features.js
  if (!window.calcFullCost) window.calcFullCost = calcFullCost;

  const r = customRecipe || APP.recipe;
  const portions = r.portions || 10;
  const infl = (forcedInflation !== null) ? forcedInflation : (window.inflationFactor || 0);
  const costMultiplier = infl / 100 + 1;
  const totalMaterial = r.ingredients.reduce((sum, ing) => sum + calcIngredientCost(ing), 0) * costMultiplier;

  // Use either live UI values or saved values
  let laborRate = 0, fixedCharges = 0, productions = 1, energyRate = 0, amortization = 0;

  // Only use DOM values if we are processing the CURRENT active recipe
  const isCurrent = (r === APP.recipe);
  const advEl = $('#advLaborRate');

  if (isCurrent && advEl && APP.currentStep === 4) {
    laborRate = parseFloat($('#advLaborRate').value) || 0;
    fixedCharges = parseFloat($('#advFixedCharges').value) || 0;
    productions = Math.max(1, parseInt($('#advProductions').value) || 1);
    energyRate = parseFloat($('#advEnergy').value) || 0;
    amortization = parseFloat($('#advAmortization').value) || 0;
  } else if (r.advanced) {
    laborRate = r.advanced.laborRate || 0;
    fixedCharges = r.advanced.fixedCharges || 0;
    productions = r.advanced.productions || 1;
    energyRate = r.advanced.energyRate || 0;
    amortization = r.advanced.amortization || 0;
  }

  const prepTime = parseFloat(r.prepTime) || 0;
  const cookTime = parseFloat(r.cookTime) || 0;
  const totalTimeH = (prepTime + cookTime) / 60;

  const laborCost = laborRate * totalTimeH;
  const energyCost = (energyRate * (cookTime / 60)) * costMultiplier; // Energy also affected by inflation
  const fixedShare = fixedCharges / productions;
  const amortShare = amortization / productions;

  const additionalCosts = laborCost + energyCost + fixedShare + amortShare;
  const totalFullCost = totalMaterial + additionalCosts;

  const costPerPortion = totalFullCost / portions;
  const marginRate = (margin || APP.margin) / 100;

  // Selling price based on FULL cost
  const sellingPrice = marginRate < 1 ? costPerPortion / (1 - marginRate) : costPerPortion * 10;
  const marginPerPortion = sellingPrice - costPerPortion;
  const marginPct = sellingPrice > 0 ? (marginPerPortion / sellingPrice) * 100 : 0;

  return {
    totalMaterial: round2(totalMaterial),
    additionalCosts: round2(additionalCosts),
    laborCost: round2(laborCost),
    energyCost: round2(energyCost),
    fixedShare: round2(fixedShare),
    amortShare: round2(amortShare),
    totalFullCost: round2(totalFullCost),
    costPerPortion: round2(costPerPortion),
    sellingPrice: round2(sellingPrice),
    marginPerPortion: round2(marginPerPortion),
    marginPct: round2(marginPct),
    portions,
    prepTime,
    cookTime,
    laborRate,
    energyRate,
    fixedCharges,
    amortization,
    productions
  };
}

// ============================================================================
// LOCAL STORAGE
// ============================================================================

function getViewOwner() {
  return APP.viewOwner || localStorage.getItem(STORAGE_KEYS.currentUser) || 'Ami';
}

function getUserRecipesKey() {
  const owner = getViewOwner();
  return `gourmetrevient_recipes_${owner.toLowerCase()}`;
}

function getUserTeamKey() {
  const owner = getViewOwner();
  return `${STORAGE_KEYS.teamMembers}_${owner.toLowerCase()}`;
}

function getUserLeavesKey() {
  const owner = getViewOwner();
  return `${STORAGE_KEYS.staffLeaves}_${owner.toLowerCase()}`;
}

function getUserLabPlanKey() {
  const owner = getViewOwner();
  return `gourmet_lab_plan_${owner.toLowerCase()}`;
}

function getUserPlacementsKey() {
  const owner = getViewOwner();
  return `labpatiss_placements_${owner.toLowerCase()}`;
}

function getUserInventoryKey() {
  const owner = getViewOwner();
  return `gourmet_inventory_${owner.toLowerCase()}`;
}

function loadSavedRecipes() {
  try {
    const key = getUserRecipesKey();
    const data = localStorage.getItem(key);
    APP.savedRecipes = data ? JSON.parse(data) : [];

    // ENHANCEMENT: Ensure all recipes have cost data for the dashboard
    let needsSave = false;
    APP.savedRecipes.forEach(r => {
      if (!r.costs && typeof calcFullCost === 'function') {
        r.margin = r.margin || 70;
        r.costs = calcFullCost(r.margin, r);
        needsSave = true;
      }
    });
    if (needsSave) saveSavedRecipes();

    // Seed examples if totally empty or very low to show off the stats/portfolio
    if (APP.savedRecipes.length < 6) {
      seedDemoData();
    }
  } catch { APP.savedRecipes = []; }
}

function seedDemoData() {
  // Classic recipes to showcase stats
  const demoPool = (typeof RECIPES !== 'undefined') ? RECIPES.slice(0, 15) : [];

  demoPool.forEach(r => {
    // Check if a recipe with the same name already exists in savedRecipes
    const exists = APP.savedRecipes.some(saved => saved.name === r.name);
    if (!exists) {
      const copy = JSON.parse(JSON.stringify(r));
      copy.savedAt = new Date().toISOString();
      copy.margin = 68 + (Math.random() * 12); // Realistic variety in margins
      copy.costs = calcFullCost(copy.margin, copy);
      APP.savedRecipes.push(copy);
    }
  });

  // Fill some inventory to show stock value
  if (APP.inventory.length === 0) {
    initInventoryFromDb();
  }

  APP.inventory.forEach(item => {
    if (!item.stock || item.stock < 10) {
      item.stock = Math.floor(Math.random() * 2000) + 100;
      item.lastUpdate = new Date().toISOString();
    }
  });

  saveSavedRecipes();
  saveInventory();
}

function saveSavedRecipes() {
  const key = getUserRecipesKey();
  localStorage.setItem(key, JSON.stringify(APP.savedRecipes));
}

function loadIngredientDb() {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.ingredientDb);
    const saved = data ? JSON.parse(data) : [];

    // Merge logic: keep saved values for existing names, add new missing names from DEFAULT
    const merged = [...saved];
    DEFAULT_INGREDIENT_DB.forEach(def => {
      if (!merged.find(m => m.name.toLowerCase() === def.name.toLowerCase())) {
        merged.push(def);
      }
    });

    APP.ingredientDb = merged.length > 0 ? merged : [...DEFAULT_INGREDIENT_DB];
    saveIngredientDb();
  } catch {
    APP.ingredientDb = [...DEFAULT_INGREDIENT_DB];
  }
}

function saveIngredientDb() { localStorage.setItem(STORAGE_KEYS.ingredientDb, JSON.stringify(APP.ingredientDb)); }

function loadInventory() {
  const data = localStorage.getItem(getUserInventoryKey());
  if (data) {
    APP.inventory = JSON.parse(data);
  } else {
    initInventoryFromDb();
  }
}

function saveInventory() {
  localStorage.setItem(getUserInventoryKey(), JSON.stringify(APP.inventory));
}

function initInventoryFromDb() {
  // Merge items from DEFAULT_INGREDIENT_DB into existing APP.inventory if not present
  DEFAULT_INGREDIENT_DB.forEach(ing => {
    const exists = APP.inventory.find(inv => inv.name === ing.name);
    if (!exists) {
      APP.inventory.push({
        id: 'inv_' + Math.random().toString(36).substr(2, 9),
        name: ing.name,
        stock: 0,
        unit: ing.unit,
        price: ing.pricePerUnit,
        alertThreshold: ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 5,
        lastUpdate: new Date().toISOString()
      });
    }
  });
  saveInventory();
  if (typeof showToast === 'function') showToast('Inventaire synchronisé avec la base', 'success');
  renderInventory();
  updateDashboard();
}

function addToIngredientDb(ing) {
  const exists = APP.ingredientDb.find(i =>
    i.name.toLowerCase() === ing.name.toLowerCase()
  );
  if (!exists && ing.name.trim()) {
    APP.ingredientDb.push({
      name: ing.name,
      unit: ing.unit,
      pricePerUnit: ing.pricePerUnit,
      priceRef: ing.priceRef || getPriceRef(ing.unit),
      nutrition: ing.nutrition || null,
      allergens: ing.allergens || []
    });
    saveIngredientDb();
  } else if (exists && ing.nutrition) {
    // Mettre à jour si de nouvelles données OFF arrivent
    exists.nutrition = ing.nutrition;
    if (ing.allergens && ing.allergens.length) exists.allergens = ing.allergens;
    saveIngredientDb();
  }
}

function getPriceRef(unit) {
  if (unit === 'g' || unit === 'kg') return 'kg';
  if (unit === 'ml' || unit === 'L') return 'L';
  return 'pièce';
}

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
    APP.recipe.name = $('#recipeName').value.trim();
    APP.recipe.category = $('#recipeCategory').value.trim();
    APP.recipe.portions = parseInt($('#recipePortions').value) || 10;
    APP.recipe.prepTime = parseInt($('#recipePrepTime').value) || 0;
    APP.recipe.cookTime = parseInt($('#recipeCookTime').value) || 0;
    APP.recipe.description = $('#recipeDesc').value.trim();
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

  // GSAP Stagger Animation (Using gsap.from for safety)
  if (window.gsap && APP.recipe.ingredients.length > 0) {
    gsap.from('#ingredientsList .ing-row', {
      opacity: 0,
      y: 15,
      duration: 0.4,
      stagger: 0.05,
      ease: 'power2.out'
    });
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
    <div class="ing-name autocomplete-wrap">
      <div class="ing-row-icon">${getIngredientIcon(ing.name)}</div>
      <input type="text" class="form-input ing-input" data-field="name" value="${escapeHtml(t(ing.name))}" placeholder="${t('ui.ph.name')}" />
      <div class="autocomplete-list" id="ac-${idx}"></div>
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
  const rows = container.querySelectorAll('.ing-row');

  // SÉCURITÉ : Si aucune ligne n'est présente dans le DOM (UI non initialisée), 
  // on ne vide pas APP.recipe.ingredients pour éviter d'effacer les données chargées en mémoire.
  if (rows.length === 0) return;

  APP.recipe.ingredients = [];
  rows.forEach(row => {
    const name = row.querySelector('[data-field="name"]').value.trim();
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

  // 1. Core ingredients
  let matches = APP.ingredientDb.filter(i =>
    i.name.toLowerCase().includes(val)
  ).map(i => ({...i, isRecipe: false}));

  // 2. Saved Recipes (Compositions)
  const savedRecipes = JSON.parse(localStorage.getItem(getUserRecipesKey()) || '[]');
  
  // Filter out the *current* recipe to prevent self-reference
  const currentRecipeName = (APP.recipe.name || '').toLowerCase();
  
  const recipeMatches = savedRecipes
    .filter(r => r.name.toLowerCase().includes(val) && r.name.toLowerCase() !== currentRecipeName)
    .map(r => {
      // Calculate sub-recipe total cost and weight to give a price per kg
      let subCost = 0;
      let subWeightGrams = 0;
      r.ingredients.forEach(subIng => {
        subCost += calcIngredientCost(subIng);
        let subQty = parseFloat(subIng.quantity) || 0;
        if (subIng.unit === 'kg' || subIng.unit === 'L') subQty *= 1000;
        subWeightGrams += subQty;
      });
      // Cost per kg = (Cost / Weight in g) * 1000
      let pricePerKg = subWeightGrams > 0 ? (subCost / subWeightGrams) * 1000 : 0;
      
      return {
        name: r.name,
        unit: 'kg', // By default, we use compositions by weight
        pricePerUnit: pricePerKg,
        priceRef: 'kg',
        isRecipe: true
      };
    });

  matches = [...recipeMatches, ...matches].slice(0, 8);

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
  container.innerHTML = '';

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
  APP.recipe.steps = [];
  steps.forEach(stepEl => {
    const input = stepEl.querySelector('.proc-input');
    const day = stepEl.querySelector('.proc-day');
    const val = input ? input.value.trim() : '';
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

    const costs = calcFullCost(APP.margin);

    // KPI Cards
    if (kpiGrid) {
      kpiGrid.innerHTML = `
        <div class="kpi-card">
          <div class="kpi-label">${t('ui.kpi.total_material')}</div>
          <div class="kpi-value">${costs.totalMaterial.toFixed(2)} €</div>
          <div class="kpi-sub">${t('label.per_portion')} ${costs.portions} ${costs.portions > 1 ? t('unit.portions') : t('unit.portion')}</div>
        </div>
        <div class="kpi-card accent">
          <div class="kpi-label">${t('ui.kpi.per_portion')}</div>
          <div class="kpi-value">${costs.costPerPortion.toFixed(2)} €</div>
          <div class="kpi-sub">${t('label.cost')} / ${t('unit.portion')}</div>
        </div>
        <div class="kpi-card success">
          <div class="kpi-label">${t('ui.kpi.suggested_price')}</div>
          <div class="kpi-value">${costs.sellingPrice.toFixed(2)} €</div>
          <div class="kpi-sub">${t('s4.margin')} ${APP.margin}%</div>
        </div>
        <div class="kpi-card warning">
          <div class="kpi-label">${t('ui.kpi.margin_portion')}</div>
          <div class="kpi-value">${costs.marginPerPortion.toFixed(2)} €</div>
          <div class="kpi-sub">${costs.marginPct.toFixed(1)}% ${t('s4.margin')}</div>
        </div>
      `;

      // Animate KPI Cards
      if (window.gsap) {
        gsap.from('#kpiGrid .kpi-card', {
          opacity: 0,
          scale: 0.95,
          duration: 0.4,
          stagger: 0.08,
          ease: 'back.out(1.7)'
        });
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
  if (!container) return;

  const current = calcFullCost(APP.margin);
  const base = APP.baselineCosts || current;

  const rows = [
    { label: t('ui.kpi.total_material'), key: 'totalMaterial', unit: '€' },
    { label: t('ui.kpi.per_portion'), key: 'costPerPortion', unit: '€' },
    { label: t('ui.kpi.suggested_price'), key: 'sellingPrice', unit: '€' },
    { label: t('ui.kpi.margin_portion'), key: 'marginPerPortion', unit: '€' }
  ];

  container.innerHTML = rows.map(row => {
    const valA = base[row.key] || 0;
    const valB = current[row.key] || 0;
    const diff = valB - valA;
    const diffColor = (row.key === 'marginPerPortion' || row.key === 'sellingPrice')
      ? (diff >= 0 ? 'var(--success)' : 'var(--danger)')
      : (diff <= 0 ? 'var(--success)' : 'var(--danger)');

    return `
      <tr style="border-bottom:1px solid var(--surface-border);">
        <td style="padding:0.8rem 0.5rem; font-weight:600;">${row.label}</td>
        <td style="padding:0.8rem 0.5rem; color:var(--text-muted);">${valA.toFixed(2)} ${row.unit}</td>
        <td style="padding:0.8rem 0.5rem; font-weight:700;">
          ${valB.toFixed(2)} ${row.unit}
          <div style="font-size:0.75rem; color:${diffColor};">${diff > 0 ? '+' : ''}${diff.toFixed(2)} ${row.unit}</div>
        </td>
      </tr>
    `;
  }).join('');

  const diffTotal = current.totalMaterial - base.totalMaterial;
  if (Math.abs(diffTotal) < 0.01) {
    verdict.textContent = "Versions identiques. Modifiez les ingrédients pour comparer !";
    verdict.style.color = "var(--text-muted)";
  } else if (diffTotal < 0) {
    verdict.textContent = `✅ Économie de ${Math.abs(diffTotal).toFixed(2)}€ sur le coût matière total !`;
    verdict.style.color = "var(--success)";
  } else {
    verdict.textContent = `⚠️ Surcoût de ${diffTotal.toFixed(2)}€ par rapport à la référence.`;
    verdict.style.color = "var(--danger)";
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
      <p style="color:var(--text-muted); font-size:0.85rem; margin-bottom:1.5rem;">
        ⏱ ${t('ui.label.prep')}: ${prepStr} · ${t('ui.label.cook')}: ${cookStr} · ${r.portions} ${r.portions > 1 ? t('unit.portions') : t('unit.portion')}
      </p>

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
  }, 400);
}

// ============================================================================
// SAVE / LOAD / DELETE RECIPES
// ============================================================================


function saveCurrentRecipe() {
  collectCurrentStepData();
  const r = APP.recipe;

  if (!r.name.trim()) {
    showToast(t('toast.recipe.name_required'), 'error');
    return;
  }

  if (!r.id) r.id = generateId();

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

function loadRecipe(id) {
  const recipe = APP.savedRecipes.find(r => r.id === id);
  if (!recipe) return;

  APP.recipe = JSON.parse(JSON.stringify(recipe));
  APP.margin = recipe.margin || 70;

  populateStep1();

  // Reset initialization for advanced inputs
  ['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization'].forEach(id => {
    const el = document.getElementById(id);
    if (el) delete el.dataset.initialized;
  });

  goToStep(1);
  showToast(t('recipe.toast.loaded', { name: recipe.name }), 'success');
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
      <div class="saved-card">
        <div class="sc-name">${escapeHtml(r.name)}</div>
        <div class="sc-meta">${escapeHtml(r.category || t('lab.cat.all'))} · ${r.portions} portions · ${date}</div>
        <div class="sc-cost">${costLabel}: ${costs.totalFullCost.toFixed(2)} € · ${costs.costPerPortion.toFixed(2)} €/${t('unit.portion')}</div>
        <div class="sc-actions">
          <button class="btn btn-outline btn-sm" onclick="loadRecipe('${r.id}')">${t('nav.home') === 'Home' ? 'Load' : (t('nav.home') === 'Inicio' ? 'Cargar' : 'Charger')}</button>
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
    description: t(`data.recipe.${example.id}.desc`) || example.description,
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
  ['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization'].forEach(id => {
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

  // Store current recipe to restore it later
  const oldRecipe = JSON.parse(JSON.stringify(APP.recipe));
  const oldStep = APP.currentStep;

  // Temporarily load this recipe for rendering
  loadExampleRecipe(idx);

  // Render the summary (it's hidden but we need it in the DOM)
  renderSummary();

  // Call the main export function
  exportPdf();

  // Restore previous state after a delay or after PDF starts
  setTimeout(() => {
    APP.recipe = oldRecipe;
    APP.currentStep = oldStep;
    goToStep(oldStep);
    renderSummary(); // refresh hidden summary back to original
  }, 1000);
}

// ============================================================================
// RECIPE LIBRARY (HUB EXPLORER)
// ============================================================================

let currentLibraryFilter = 'all';

// Define a professional sort order for pastry categories
const LIBRARY_SORT_ORDER = [
  'Entremets', 
  'Tarte', 
  'Tarte Signature', 
  'Tarte Fruits', 
  'Tarte Gourmande',
  'Classique',
  'Viennoiserie', 
  'Brioche', 
  'Feuilletage',
  'Pâte à choux', 
  'Choux & Feuilletage',
  'Pâte levée',
  'Meringue',
  'Dessert à l\'assiette'
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
function renderLibraryRecipes() {
  const container = $('#recipeLibraryGrid');
  const filtersContainer = $('#libraryFilters');
  if (!container) return;

  const allRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];
  if (allRecipes.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); padding: 2rem;">${t('library.none') || 'Aucune recette dans la bibliothèque.'}</p>`;
    return;
  }

  // Populate Filters
  if (filtersContainer) {
    const rawCategories = Array.from(new Set(allRecipes.map(r => r.category)));
    
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
    const tName = t(`data.recipe.${r.id}.name`).toLowerCase();
    const name = r.name.toLowerCase();
    const tCat = t(r.category).toLowerCase();
    const cat = r.category.toLowerCase();
    
    const matchesSearch = name.includes(query) || tName.includes(query) || cat.includes(query) || tCat.includes(query);
    const matchesFilter = currentLibraryFilter === 'all' || r.category === currentLibraryFilter;
    
    return matchesSearch && matchesFilter;
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
    if (catLo.includes('chocolat')) emoji = '🍫';
    if (catLo.includes('fruit') || catLo.includes('tarte')) emoji = '🍓';
    if (catLo.includes('base')) emoji = '🥣';

    const tCatRaw = t(r.category);
    const tCat = tCatRaw !== r.category ? tCatRaw : r.category;
    const tNameRaw = t(`data.recipe.${r.id}.name`);
    const displayName = tNameRaw !== `data.recipe.${r.id}.name` ? tNameRaw : r.name;

    return `
      <div class="library-card" onclick="loadExampleRecipe(${originalIdx})">
        <button class="library-card-pdf" onclick="event.stopPropagation(); exportRecipePdfDirect(${originalIdx})" title="${t('recipe.lib.export_pdf')}">📄 PDF</button>
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

    // Specific styling for certain images (dezoom or position)
    const dezoomIds = [];
    const extraClass = dezoomIds.includes(r.id) ? ' dezoom' : '';
    const extraStyle = r.id === 'saint-honore' ? ' style="object-position: top;"' : '';

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

function exportPdf() {
  const summaryCard = document.getElementById('summaryCard');
  if (!summaryCard) {
    showToast('Erreur: Conteneur de résumé introuvable.', 'error');
    return;
  }

  const recipeName = APP.recipe.name || 'recette';
  showToast(`${t('toast.pdf.preparing')} ${recipeName}...`, 'info');

  // Create a clean container for export and append to body
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-10000px';
  container.style.left = '0';
  container.style.width = '800px';
  container.style.backgroundColor = '#ffffff';
  container.style.color = '#333333';
  
  const pdfClone = summaryCard.cloneNode(true);
  pdfClone.id = "pdf-export-temp-node";
  pdfClone.style.display = 'block';
  pdfClone.style.padding = '40px';
  pdfClone.style.boxShadow = 'none';
  pdfClone.style.border = 'none';
  pdfClone.style.width = '100%';
  pdfClone.style.backgroundColor = '#ffffff';

  // Force all text colors and opacity
  pdfClone.querySelectorAll('*').forEach(el => {
    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.style.color = '#333333';
    el.style.backgroundColor = 'transparent';
    el.style.transition = 'none';
    el.style.animation = 'none';
    if (el.tagName === 'H1' || el.tagName === 'H2' || el.tagName === 'H3' || el.classList.contains('card-title')) {
      el.style.color = '#10b981';
    }
    // Fix grid issues by converting to flex for PDF rendering
    if (getComputedStyle(el).display === 'grid' || el.classList.contains('summary-sections-grid')) {
       el.style.display = 'flex';
       el.style.flexDirection = 'row';
       el.style.flexWrap = 'wrap';
       el.style.gap = '20px';
    }
  });

  pdfClone.classList.add('pdf-export-mode');

  // Clean UI elements
  const uiElements = pdfClone.querySelectorAll('.export-actions, .step-nav, .btn, button, .close-qr');
  uiElements.forEach(el => el.remove());

  container.appendChild(pdfClone);
  document.body.appendChild(container);

  const safeFilename = recipeName.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `${safeFilename}_fiche.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      backgroundColor: '#ffffff',
      letterRendering: true,
      logging: false,
      scrollY: -window.scrollY // Key fix for scrolled pages
    },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  setTimeout(() => {
    html2pdf().from(container).set(opt).save().then(() => {
      document.body.removeChild(container);
      showToast(t('toast.pdf.done'), 'success');
    }).catch((err) => {
      console.error('PDF Export Error:', err);
      if (document.body.contains(container)) document.body.removeChild(container);
      showToast(t('toast.pdf.error'), 'error');
    });
  }, 800); 
}

function exportDevisPdf() {
  const recipeName = APP.recipe.name || 'Prestation';
  const costs = calcFullCost(APP.margin);

  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-10000px';
  container.style.left = '0';
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
          <span>TVA (5.5%)</span>
          <span>${((costs.sellingPrice * APP.recipe.portions) * 0.055).toFixed(2)} €</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:1.5rem; font-weight:900; border-top:2px solid #1a202c; padding-top:12px; margin-top:5px;">
          <span>TOTAL TTC</span>
          <span style="color:#10b981;">${((costs.sellingPrice * APP.recipe.portions) * 1.055).toFixed(2)} €</span>
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
      scrollY: -window.scrollY
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

// ============================================================================
// INGREDIENT DATABASE MODAL
// ============================================================================

function showIngredientDbModal() {
  const modal = $('#dbModal');
  modal.style.display = 'flex';
  renderDbIngredients();
}

function hideIngredientDbModal() {
  $('#dbModal').style.display = 'none';
}

function renderDbIngredients() {
  const container = $('#dbIngredientsList');
  container.innerHTML = APP.ingredientDb.map((ing, i) => `
    <div class="autocomplete-item" style="padding:0.65rem 0.75rem; cursor:pointer; border-bottom:1px solid var(--surface-border); display:flex; align-items:center; gap:12px;"
         data-db-idx="${i}">
      <span style="font-size:1.4rem; width:30px; text-align:center;">${getIngredientIcon(ing.name)}</span>
      <div style="flex:1;">
        <div style="font-weight:600; font-size:0.95rem;">${escapeHtml(ing.name)}</div>
        <small style="color:var(--text-muted)">${ing.unit} · ${ing.pricePerUnit.toFixed(2)} €/${ing.priceRef}</small>
      </div>
    </div>
  `).join('');

  container.querySelectorAll('[data-db-idx]').forEach(item => {
    item.addEventListener('click', () => {
      const ing = APP.ingredientDb[parseInt(item.dataset.dbIdx)];
      addIngredient({
        name: ing.name,
        quantity: 0,
        unit: ing.unit,
        pricePerUnit: ing.pricePerUnit
      });
      hideIngredientDbModal();
    });
  });
}

// ============================================================================
// OPEN FOOD FACTS (OFF) API INTEGRATION
// ============================================================================

function showOffModal() {
  $('#offModal').style.display = 'flex';
  $('#offSearchInput').value = '';
  $('#offResultsList').innerHTML = '';
}

function hideOffModal() {
  $('#offModal').style.display = 'none';
}

async function searchOffProduct() {
  const query = $('#offSearchInput').value.trim();
  if (!query) return;

  const resultsList = $('#offResultsList');
  const loader = $('#offLoader');

  resultsList.innerHTML = '';
  loader.style.display = 'block';

  try {
    const isEAN = /^\d+$/.test(query);
    let url = '';

    if (isEAN) {
      url = `https://world.openfoodfacts.org/api/v2/product/${query}.json`;
    } else {
      url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1`;
    }

    const res = await fetch(url);
    const data = await res.json();
    loader.style.display = 'none';

    let products = [];
    if (isEAN) {
      if (data.status === 1) products = [data.product];
    } else {
      products = data.products || [];
    }

    if (products.length === 0) {
      resultsList.innerHTML = '<div style="padding:1rem; text-align:center; color:var(--text-muted);">Aucun produit trouvé. Vérifiez le code-barres ou le nom.</div>';
      return;
    }

    window._offTempResults = products.slice(0, 10);

    resultsList.innerHTML = products.slice(0, 10).map((p, i) => {
      const name = p.product_name || p.product_name_fr || 'Produit inconnu';
      const brands = p.brands ? `(${p.brands})` : '';
      const kcal = p.nutriments && p.nutriments['energy-kcal_100g'] !== undefined ? p.nutriments['energy-kcal_100g'] : '?';
      return `
        <div class="autocomplete-item" style="padding:0.65rem 0.75rem; cursor:pointer; border-bottom:1px solid var(--surface-border); display:flex; justify-content:space-between; align-items:center;"
             onclick="selectOffProduct(${i})">
          <div>
            <div style="font-weight:bold;">${escapeHtml(name)} <span style="font-weight:normal; font-size:0.8rem; color:var(--text-muted);">${escapeHtml(brands)}</span></div>
            <div style="font-size:1.2rem; background:var(--surface-border); padding:4px 8px; border-radius:4px;">➕</div>
          </div>
          <span style="font-size:0.75rem; color:var(--primary); font-weight:600; margin-top:2px;">${kcal} kcal / 100g</span>
        </div>
      `;
    }).join('');

  } catch (e) {
    loader.style.display = 'none';
    resultsList.innerHTML = '<div style="padding:1rem; text-align:center; color:var(--danger);">Erreur réseau lors de la connexion à Open Food Facts.</div>';
    console.error(e);
  }
}

function selectOffProduct(index) {
  const p = window._offTempResults[index];
  if (!p) return;

  const name = p.product_name || p.product_name_fr || 'Produit inconnu';

  // Extract nutritions
  const n = p.nutriments || {};
  const nutriData = {
    kcal: parseFloat(n['energy-kcal_100g']) || 0,
    proteins: parseFloat(n['proteins_100g']) || 0,
    carbs: parseFloat(n['carbohydrates_100g']) || 0,
    fats: parseFloat(n['fat_100g']) || 0
  };
  const allergensData = p.allergens_tags ? p.allergens_tags.map(a => a.replace('en:', '').replace('fr:', '')) : [];

  // Ensure ingredient DB is initialized
  if (!APP.ingredientDb) loadIngredientDb(); // Handle just in case

  let existing = APP.ingredientDb.find(db => db.name.toLowerCase() === name.toLowerCase());
  let price = existing ? existing.pricePerUnit : 0;

  // Create ingredient with basic nutrition data
  const offIngredient = {
    name: name,
    quantity: 0,
    unit: existing ? existing.unit : 'g',
    pricePerUnit: price,
    kcal: nutriData.kcal,
    isOffData: true
  };

  addIngredient(offIngredient);

  addToIngredientDb({
    name: name, unit: 'g', pricePerUnit: price,
    nutrition: nutriData, allergens: allergensData
  });

  hideOffModal();
  showToast(`Ingrédient associé avec Open Food Facts (${nutriData.kcal} kcal/100g)`, 'success');
}

function renderNutritionAnalysis() {
  let totalKcal = 0;
  let totalPro = 0;
  let totalGlu = 0;
  let totalLip = 0;
  let weightInGrams = 0;
  const foundAllergens = new Set();

  // Fonction locale pour simuler la nutrition des ingrédients par défaut
  const getMockNutrition = (name) => {
    const n = name.toLowerCase();
    const matches = (keywords) => keywords.some(k => n.includes(k));

    if (matches(['beurre', 'huile', 'graisse', 'gras'])) return { kcal: 717, proteins: 1, carbs: 1, fats: 81 };
    if (matches(['sucre', 'sirop', 'miel', 'glucose', 'semoule', 'glace'])) return { kcal: 387, proteins: 0, carbs: 100, fats: 0 };
    if (matches(['farine', 'fécule', 'fecule', 'amidon', 'maïzena'])) return { kcal: 364, proteins: 10, carbs: 76, fats: 1 };
    if (matches(['crème', 'creme', 'mascarpone', 'chantilly'])) return { kcal: 345, proteins: 2, carbs: 3, fats: 35 };
    if (matches(['lait'])) return { kcal: 42, proteins: 3.4, carbs: 4.8, fats: 1 };
    if (matches(['chocolat', 'cacao', 'couverture', 'ganache', 'pralin', 'gianduja'])) return { kcal: 546, proteins: 5, carbs: 31, fats: 36 };
    if (matches(['œuf', 'oeuf', 'jaune', 'blanc', 'oufs'])) return { kcal: 143, proteins: 13, carbs: 1, fats: 10 };
    if (matches(['fraise', 'framboise', 'pomme', 'citron', 'fruit', 'purée', 'coulis', 'griotte'])) return { kcal: 50, proteins: 1, carbs: 12, fats: 0 };
    if (matches(['amande', 'noisette', 'noix', 'pistache', 'pignon'])) return { kcal: 600, proteins: 20, carbs: 10, fats: 50 };
    if (matches(['sel'])) return { kcal: 0, proteins: 0, carbs: 0, fats: 0 };
    return { kcal: 250, proteins: 5, carbs: 30, fats: 10 }; // Default
  };

  APP.recipe.ingredients.forEach(ing => {
    if (!ing.name || ing.quantity <= 0) return;

    // Convert to grams
    let qtyGrams = 0;
    const unit = (ing.unit || '').toLowerCase();

    if (unit === 'g' || unit === 'ml') {
      qtyGrams = parseFloat(ing.quantity);
    } else if (unit === 'kg' || unit === 'l') {
      qtyGrams = parseFloat(ing.quantity) * 1000;
    } else if (unit === 'pièce' || unit === 'piece' || unit === 'pcs' || unit === 'unité' || unit === 'u') {
      // Conversion arbitraire mais nécessaire (50g par pièce/oeuf)
      qtyGrams = parseFloat(ing.quantity) * 50;
    }

    weightInGrams += qtyGrams;

    const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());

    // Fallback nutrition if exact API data is not present
    const nutrition = (dbItem && dbItem.nutrition) ? dbItem.nutrition : getMockNutrition(ing.name);

    if (qtyGrams > 0) {
      const ratio = qtyGrams / 100; // Database nutrition is for 100g
      totalKcal += nutrition.kcal * ratio;
      totalPro += nutrition.proteins * ratio;
      totalGlu += nutrition.carbs * ratio;
      totalLip += nutrition.fats * ratio;
    }

    // Allergens from DB if available
    if (dbItem && dbItem.allergens) {
      dbItem.allergens.forEach(a => foundAllergens.add(a));
    }
    // Simple name-based allergen fallback if DB missing (safety)
    const n = ing.name.toLowerCase();
    if (n.includes('lait') || n.includes('crème') || n.includes('creme') || n.includes('beurre')) foundAllergens.add('Lait');
    if (n.includes('farine') || n.includes('gluten')) foundAllergens.add('Gluten');
    if (n.includes('œuf') || n.includes('oeuf') || n.includes('oufs')) foundAllergens.add('Œufs');
    if (n.includes('noisette') || n.includes('amande') || n.includes('noix') || n.includes('pistache')) foundAllergens.add('Fruits à coque');
  });

  // Calculate per 100g
  if (weightInGrams > 0) {
    const factor = 100 / weightInGrams;
    totalKcal *= factor;
    totalPro *= factor;
    totalGlu *= factor;
    totalLip *= factor;
  }

  const k = document.getElementById('nutriKcal');
  const p = document.getElementById('nutriPro');
  const g = document.getElementById('nutriGlu');
  const l = document.getElementById('nutriLip');
  const al = document.getElementById('allergensList');

  if (k) k.textContent = Math.round(totalKcal);
  if (p) p.textContent = totalPro.toFixed(1) + 'g';
  if (g) g.textContent = totalGlu.toFixed(1) + 'g';
  if (l) l.textContent = totalLip.toFixed(1) + 'g';

  if (al) {
    if (foundAllergens.size > 0) {
      al.textContent = Array.from(foundAllergens).map(a => t(a) || a).join(', ').toUpperCase();
    } else {
      al.textContent = "Aucun / Non renseigné";
    }
  }
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

function showToast(message, type = 'info') {
  // Remove existing toasts
  document.querySelectorAll('.toast').forEach(t => t.remove());

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================================================
// NEW RECIPE (RESET)
// ============================================================================

function newRecipe() {
  APP.recipe = {
    id: null,
    name: '',
    category: '',
    portions: 10,
    prepTime: 60,
    cookTime: 30,
    description: '',
    ingredients: [],
    steps: [],
    advanced: null
  };
  APP.margin = 70;

  // Reset initialization state for advanced inputs
  ['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization'].forEach(id => {
    const el = document.getElementById(id);
    if (el) delete el.dataset.initialized;
  });

  goToStep(0);
}

// ============================================================================
// EVENT BINDINGS
// ============================================================================

function bindEvents() {
  const btnCreateRecipe = $('#btnCreateRecipe');
  if (btnCreateRecipe) {
    btnCreateRecipe.addEventListener('click', () => {
      newRecipe();
      populateStep1();
      goToStep(1);
    });
  }

  // Step navigation
  const btnBackToHero = $('#btnBackToHero');
  if (btnBackToHero) btnBackToHero.addEventListener('click', () => goToStep(0));

  const btnToStep2 = $('#btnToStep2');
  if (btnToStep2) {
    btnToStep2.addEventListener('click', () => {
      if (!$('#recipeName').value.trim()) {
        showToast(t('toast.recipe.name_required'), 'error');
        $('#recipeName').focus();
        return;
      }
      goToStep(2);
    });
  }

  const btnToStep1 = $('#btnToStep1');
  if (btnToStep1) btnToStep1.addEventListener('click', () => goToStep(1));

  const btnToStep3 = $('#btnToStep3');
  if (btnToStep3) btnToStep3.addEventListener('click', () => goToStep(3));

  const btnToStep2b = $('#btnToStep2b');
  if (btnToStep2b) btnToStep2b.addEventListener('click', () => goToStep(2));

  const btnToStep4 = $('#btnToStep4');
  if (btnToStep4) btnToStep4.addEventListener('click', () => goToStep(4));

  const btnToStep3b = $('#btnToStep3b');
  if (btnToStep3b) btnToStep3b.addEventListener('click', () => goToStep(3));

  const btnToStep5 = $('#btnToStep5');
  if (btnToStep5) {
    btnToStep5.addEventListener('click', () => {
      goToStep(5);
      if (typeof renderAntiGaspi === 'function') renderAntiGaspi();
    });
  }

  const btnToStep4b = $('#btnToStep4b');
  if (btnToStep4b) btnToStep4b.addEventListener('click', () => goToStep(4));

  const btnNewRecipeInStep = $('#btnNewRecipe');
  if (btnNewRecipeInStep) btnNewRecipeInStep.addEventListener('click', newRecipe);

  // Step indicator click navigation
  $$('.step-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.dataset.step);
      if (step <= APP.currentStep || step === APP.currentStep + 1) {
        goToStep(step);
      }
    });
  });

  // Ingredients
  const btnAddIng = $('#btnAddIngredient');
  if (btnAddIng) btnAddIng.addEventListener('click', () => addIngredient());

  const btnAddFromDb = $('#btnAddFromDb');
  if (btnAddFromDb) btnAddFromDb.addEventListener('click', showIngredientDbModal);

  const btnSearchOff = $('#btnSearchOff');
  if (btnSearchOff) btnSearchOff.addEventListener('click', showOffModal);

  const dbModalClose = $('#dbModalClose');
  if (dbModalClose) dbModalClose.addEventListener('click', hideIngredientDbModal);

  const btnComp = $('#btnOpenComparator');
  if (btnComp) {
    btnComp.addEventListener('click', () => {
      if (!APP.baselineCosts) APP.baselineCosts = JSON.parse(JSON.stringify(calcFullCost(APP.margin)));
      $('#comparatorModal').style.display = 'flex';
      updateComparator();
    });
  }

  const btnCompClose = $('#comparatorClose');
  if (btnCompClose) btnCompClose.addEventListener('click', () => $('#comparatorModal').style.display = 'none');

  const btnSnap = $('#btnSnapBaseline');
  if (btnSnap) btnSnap.addEventListener('click', snapBaseline);

  const offModalClose = $('#offModalClose');
  if (offModalClose) offModalClose.addEventListener('click', hideOffModal);
  
  const btnOffSearch = $('#btnOffSearch');
  if (btnOffSearch) btnOffSearch.addEventListener('click', searchOffProduct);

  const offSearchInput = $('#offSearchInput');
  if (offSearchInput) {
    offSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchOffProduct();
    });
  }

  // Close DB modal on backdrop click
  const dbModal = $('#dbModal');
  if (dbModal) {
    dbModal.addEventListener('click', (e) => {
      if (e.target.id === 'dbModal') hideIngredientDbModal();
    });
  }

  const offModal = $('#offModal');
  if (offModal) {
    offModal.addEventListener('click', (e) => {
      if (e.target.id === 'offModal') hideOffModal();
    });
  }

  // Procedure
  const btnAddStep = $('#btnAddStep');
  if (btnAddStep) btnAddStep.addEventListener('click', addProcedureStep);

  const marginSlider = $('#marginSlider');
  if (marginSlider) {
    marginSlider.addEventListener('input', (e) => {
      APP.margin = parseInt(e.target.value);
      renderCostAnalysis();
    });
  }

  // Advanced cost inputs
  ['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization'].forEach(id => {
    const el = $('#' + id);
    if (el) el.addEventListener('input', () => renderCostAnalysis());
  });

  // Exports
  const btnExportPdf = $('#btnExportPdf');
  if (btnExportPdf && typeof exportPdf === 'function') btnExportPdf.addEventListener('click', exportPdf);
  
  const btnGenQR = $('#btnGenerateQR');
  if (btnGenQR && typeof generateQRLable === 'function') btnGenQR.addEventListener('click', generateQRLable);
  
  const btnExportDevis = $('#btnExportDevis');
  if (btnExportDevis && typeof exportDevisPdf === 'function') btnExportDevis.addEventListener('click', exportDevisPdf);
  
  const btnExportJson = $('#btnExportJson');
  if (btnExportJson && typeof exportJson === 'function') btnExportJson.addEventListener('click', exportJson);
  
  const btnSaveRecipe = $('#btnSaveRecipe');
  if (btnSaveRecipe) btnSaveRecipe.addEventListener('click', saveCurrentRecipe);

  const btnLaunchProd = $('#btnLaunchProd');
  if (btnLaunchProd) btnLaunchProd.addEventListener('click', launchProductionFromRecipe);

  // Saved recipes
  const btnSavedRecipes = $('#btnSavedRecipes');
  if (btnSavedRecipes) btnSavedRecipes.addEventListener('click', toggleSavedRecipes);

  // Logout
  const btnLogout = $('#btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('gourmet_auth');
      localStorage.removeItem('gourmet_current_user');
      location.reload();
    });
  }

  // Profile Dropdown
  const btnProfile = $('#btnProfile');
  if (btnProfile) {
    btnProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProfileDropdown();
    });
  }

  document.addEventListener('click', (e) => {
    const dropdown = $('#profileDropdown');
    if (dropdown && !e.target.closest('.profile-dropdown')) {
      dropdown.classList.remove('show');
    }
  });

  // PIN Modal
  const btnChangePin = $('#btnChangePin');
  if (btnChangePin) btnChangePin.addEventListener('click', showPinModal);

  const pinModalClose = $('#pinModalClose');
  if (pinModalClose) pinModalClose.addEventListener('click', hidePinModal);

  const btnSaveProfile = $('#btnSaveProfile');
  if (btnSaveProfile) btnSaveProfile.addEventListener('click', saveNewProfile);

  const pinModal = $('#pinModal');
  if (pinModal) {
    pinModal.addEventListener('click', (e) => {
      if (e.target.id === 'pinModal') hidePinModal();
    });
  }

  // Planning & Sharing
  const btnAddMember = $('#btnAddMember');
  if (btnAddMember) btnAddMember.addEventListener('click', addTeamMember);

  const btnAddLeave = $('#btnAddLeave');
  if (btnAddLeave) btnAddLeave.addEventListener('click', showAddLeaveModal);

  const memberName = $('#memberName');
  if (memberName) {
    memberName.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTeamMember(); });
    memberName.addEventListener('input', typeof handleMemberAutocomplete === 'function' ? handleMemberAutocomplete : null);
  }

  const memberRole = $('#memberRole');
  if (memberRole) memberRole.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTeamMember(); });

  const btnInviteMember = $('#btnInviteMember');
  if (btnInviteMember) btnInviteMember.addEventListener('click', showInviteModal);

  const inviteUser = $('#inviteUser');
  if (inviteUser) {
    inviteUser.addEventListener('input', typeof handleInviteAutocomplete === 'function' ? handleInviteAutocomplete : null);
    inviteUser.addEventListener('keypress', (e) => { if (e.key === 'Enter') inviteUserToPlanning(); });
  }

  const teamNameInput = $('#teamNameInput');
  if (teamNameInput) teamNameInput.addEventListener('change', saveTeamMembers);

  const btnSyncToCloud = $('#btnSyncToCloud');
  if (btnSyncToCloud) btnSyncToCloud.addEventListener('click', () => syncToCloud());

  const btnSyncFromCloud = $('#btnSyncFromCloud');
  if (btnSyncFromCloud) btnSyncFromCloud.addEventListener('click', () => syncFromCloud());

  const btnPrintRecipe = $('#btnPrintRecipe');
  if (btnPrintRecipe) btnPrintRecipe.addEventListener('click', () => window.print());

  const btnExportFullPdf = $('#btnExportFullPdf');
  if (btnExportFullPdf && typeof exportFullRecipePdf === 'function') {
    btnExportFullPdf.addEventListener('click', exportFullRecipePdf);
  }

  // Notifications
  const notifArea = $('#notificationArea');
  if (notifArea) {
    notifArea.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = $('#notifDropdown');
      if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notificationArea')) {
      const dropdown = $('#notifDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }
    if (!e.target.closest('#inviteUser')) {
      const auto = $('#inviteAutocomplete');
      if (auto) auto.style.display = 'none';
    }
    if (!e.target.closest('#memberName')) {
      const auto = $('#memberAutocomplete');
      if (auto) auto.style.display = 'none';
    }
  });

  // Navigation context reset
  const navPlan = $('#navPlanning');
  if (navPlan) {
    navPlan.addEventListener('click', () => {
      const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
      if (APP.viewOwner !== currentUser) {
        APP.viewOwner = currentUser;
        loadTeamMembers();
        if (typeof renderTeam === 'function') renderTeam();
        if (typeof renderLeaves === 'function') renderLeaves();
        if (typeof renderAnnualCalendar === 'function') renderAnnualCalendar();
        if (typeof renderSharedList === 'function') renderSharedList();
      }
    });
  }

  // Handle responsive navigation on resize
  window.addEventListener('resize', () => {
    if (localStorage.getItem('gourmet_auth') === 'true') {
      const mainNav = $('#mainNav');
      const mobNav = $('#mobileNavBar');
      if (window.innerWidth <= 768) {
        if (mainNav) mainNav.style.display = 'none';
        if (mobNav) mobNav.style.display = 'flex';
      } else {
        if (mainNav) mainNav.style.display = 'flex';
        if (mobNav) mobNav.style.display = 'none';
      }
    }
  });

  // Gender selection in profile
  $$('.gender-btn-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.gender-btn-profile').forEach(b => b.classList.remove('active', 'btn-primary'));
      $$('.gender-btn-profile').forEach(b => b.classList.add('btn-outline'));
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline');
    });
  });

  // Admin Moderation
  const adminUserModalClose = $('#adminUserModalClose');
  if (adminUserModalClose) adminUserModalClose.addEventListener('click', () => {
    const m = $('#adminUserModal');
    if (m) m.style.display = 'none';
  });

  const btnAdminToggle = $('#btnAdminToggle');
  if (btnAdminToggle) btnAdminToggle.addEventListener('click', toggleAdminStatus);

  const btnBanToggle = $('#btnBanToggle');
  if (btnBanToggle) btnBanToggle.addEventListener('click', toggleBanStatus);

  const btnDeleteUserModal = $('#btnDeleteUserModal');
  if (btnDeleteUserModal) btnDeleteUserModal.addEventListener('click', () => {
    const user = APP.adminSelectedUser;
    if (user && confirm(`Voulez-vous vraiment supprimer le compte de ${user.username} ?`)) {
      deleteUser(user.username);
      const m = $('#adminUserModal');
      if (m) m.style.display = 'none';
    }
  });

  const adminModal = $('#adminUserModal');
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target.id === 'adminUserModal') adminModal.style.display = 'none';
    });
  }
}

// ============================================================================
// AUTHENTICATION
// ============================================================================

function checkAuth() {
  const isAuth = localStorage.getItem('gourmet_auth') === 'true';
  const overlay = $('#authOverlay');

  if (isAuth) {
    overlay.classList.add('hidden');
    document.body.classList.remove('auth-pending');
    $('#userProfileArea').style.display = 'flex';
    
    // Proper responsive navigation switching
    if (window.innerWidth <= 768) {
      if ($('#mainNav')) $('#mainNav').style.display = 'none';
      if ($('#mobileNavBar')) $('#mobileNavBar').style.display = 'flex';
    } else {
      if ($('#mainNav')) $('#mainNav').style.display = 'flex';
      if ($('#mobileNavBar')) $('#mobileNavBar').style.display = 'none';
    }
    
    updateDashboard();
    loadSavedRecipes();
  } else {
    overlay.classList.remove('hidden');
    document.body.classList.add('auth-pending');
    $('#userProfileArea').style.display = 'none';
    if ($('#mainNav')) $('#mainNav').style.display = 'none';
    if ($('#mobileNavBar')) $('#mobileNavBar').style.display = 'none';

    let authMode = 'login'; // 'login' or 'register'

    const switchMode = (mode) => {
      authMode = mode;
      $$('.auth-tab').forEach(tab => tab.classList.toggle('active', tab.dataset.mode === mode));

      if (mode === 'login') {
        $('#authTitle').textContent = t('auth.title.secure');
        $('#authDescription').innerHTML = t('auth.desc.login');
        $('#pinGroup').style.display = 'block';
        $('#registerInfo').style.display = 'none';
        $('#btnAuthSubmit').textContent = t('auth.btn.login');
        $('#btnAuthSubmit').style.display = 'block';
        $('#genderSelection').style.display = 'none';
      } else {
        $('#authTitle').textContent = t('auth.title.register');
        $('#authDescription').innerHTML = t('auth.desc.register');
        $('#pinGroup').style.display = 'none';
        $('#registerInfo').style.display = 'flex';
        $('#btnAuthSubmit').textContent = t('auth.btn.continue');
        $('#btnAuthSubmit').style.display = 'block';
        $('#genderSelection').style.display = 'none';
      }
      $('#authError').style.display = 'none';
    };

    $$('.auth-tab').forEach(tab => {
      tab.onclick = () => switchMode(tab.dataset.mode);
    });

    $('#btnAuthSubmit').onclick = async () => {
      const user = $('#authUsername').value.trim();
      const pin = $('#authPin').value;
      const error = $('#authError');
      const genderSel = $('#genderSelection');

      if (user === '') {
        error.style.display = 'block';
        error.textContent = t('auth.error.empty');
        return;
      }

      let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
      const userKey = user.toLowerCase();

      // Special case for pre-existing admin or developers
      if (userKey === 'ju' && !usersDb[userKey]) {
        usersDb[userKey] = {
          pin: '2503',
          gender: 'male',
          email: 'admin@gourmetrevient.fr',
          role: 'Apprenti(e)'
        };
        localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb));
      }

      if (authMode === 'login') {
        if (!usersDb[userKey]) {
          // If profile not found locally, try Cloud Recovery if configured
          if (typeof window.tryRemoteLogin === 'function') {
            const remoteData = await window.tryRemoteLogin(user, pin);
            if (remoteData) {
              // Account Found in Cloud!
              usersDb[userKey] = remoteData.profile;
              localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb));
              
              // Hydrate data recovered from cloud
              localStorage.setItem(`gourmetrevient_recipes_${userKey}`, JSON.stringify(remoteData.recipes));
              localStorage.setItem(`gourmetrevient_ingredient_db`, JSON.stringify(remoteData.ingredients));
              
              showToast(t('auth.sync.success') || "Données récupérées depuis le Cloud !", 'success');
              loginSuccess(user);
              return;
            }
          }
          
          error.style.display = 'block';
          error.textContent = t('auth.error.unknown');
          error.style.animation = 'none';
          setTimeout(() => error.style.animation = 'shake 0.4s ease-in-out', 10);
          return;
        }

        if (usersDb[userKey].pin !== pin) {
          error.style.display = 'block';
          error.textContent = t('auth.error.pin');
          error.style.animation = 'none';
          setTimeout(() => error.style.animation = 'shake 0.4s ease-in-out', 10);
          return;
        }

        if (usersDb[userKey].isBanned) {
          error.style.display = 'block';
          error.textContent = t('auth.error.banned');
          return;
        }

        loginSuccess(user);
      } else {
        // Registration mode
        if (usersDb[userKey]) {
          error.style.display = 'block';
          error.textContent = t('auth.error.taken');
          return;
        }

        // Proceed to gender selection
        genderSel.style.display = 'block';
        error.style.display = 'none';
        $('#btnAuthSubmit').style.display = 'none';
        $('#registerInfo').style.display = 'none';
        $('#authTitle').textContent = t('auth.title.gender');
        $('#authDescription').innerHTML = t('auth.desc.gender');

        $$('.gender-btn').forEach(btn => {
          btn.onclick = () => {
            const gender = btn.dataset.gender;
            usersDb[userKey] = {
              pin: '0000',
              gender: gender,
              createdAt: new Date().toISOString()
            };
            localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb));
            loginSuccess(user);
          };
        });
      }
    };

    function loginSuccess(user) {
      localStorage.setItem('gourmet_auth', 'true');
      localStorage.setItem(STORAGE_KEYS.currentUser, user);
      location.reload();
    }

    $('#authUsername').onkeypress = (e) => { if (e.key === 'Enter') $('#btnAuthSubmit').click(); };
    $('#authPin').onkeypress = (e) => { if (e.key === 'Enter') $('#btnAuthSubmit').click(); };
  }
}

function updateDashboard() {
  const name = localStorage.getItem(STORAGE_KEYS.currentUser) || 'Artisan';
  let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const userKey = name.toLowerCase();
  const userData = usersDb[userKey] || {};
  const gender = userData.gender || 'male';

  const welcome = $('#welcomeUserName');
  if (welcome) welcome.textContent = name;
  const headerName = $('#userNameHeader');
  if (headerName) headerName.textContent = name;

  // Bridge to the premium dashboard if available
  if (typeof hydratePremiumDashboard === 'function') {
    hydratePremiumDashboard();
  }

  const greeting = $('.dash-greeting');
  if (greeting) {
    const greetingText = t('dash.greeting');
    // For the new structure we might have multiple greeting elements or different structure
    // We target specifically the one with the id or class if needed.
  }

  const emoji = $('#welcomeGenderEmoji');
  const label = $('#userGenderLabel');
  const avatar = $('#dashUserAvatar');
  const hAvatar = $('#headerAvatar');

  if (gender === 'female') {
    if (emoji) emoji.textContent = '👩‍🍳';
    if (avatar) avatar.textContent = '👩‍🍳';
    if (hAvatar) hAvatar.textContent = '👩‍🍳';
  } else {
    if (emoji) emoji.textContent = '👨‍🍳';
    if (avatar) avatar.textContent = '👨‍🍳';
    if (hAvatar) hAvatar.textContent = '👨‍🍳';
  }

  // Update Admin Tab Visibility
  const navAdmin = $('#navAdmin');
  if (navAdmin) {
    if (userKey === 'ju' && userData?.pin === '2503') {
      navAdmin.style.display = 'block';
    } else {
      navAdmin.style.display = 'none';
    }
  }

  // 1. Update Date
  const locale = (typeof getLang === 'function') ? (getLang() === 'en' ? 'en-GB' : (getLang() === 'es' ? 'es-ES' : 'fr-FR')) : 'fr-FR';
  const dateEl = $('#dashDateHeader');
  if (dateEl) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    dateEl.textContent = new Date().toLocaleDateString(locale, options);
  }

  // 2. Update Stats
  const recipeCount = APP.savedRecipes.length;
  if ($('#statRecipeCount')) $('#statRecipeCount').textContent = recipeCount;

  const teamCount = APP.teamMembers.length;
  if ($('#statTeamCount')) $('#statTeamCount').textContent = teamCount;

  const ingInDb = typeof DEFAULT_INGREDIENT_DB !== 'undefined' ? DEFAULT_INGREDIENT_DB.length : 0;
  if ($('#statIngCount')) $('#statIngCount').textContent = ingInDb;

  // Inventory Stats for App Hub
  const lowStockCount = APP.inventory.filter(item => item.stock <= item.alertThreshold).length;
  const invTotalItems = $('#invTotalItems');
  const invLowStock = $('#invLowStock');
  const invPriceAlerts = $('#invPriceAlerts');

  if (invTotalItems) invTotalItems.textContent = APP.inventory.length;
  if (invLowStock) invLowStock.textContent = lowStockCount;
  if (invPriceAlerts) invPriceAlerts.textContent = 0; // Placeholder for now

  // 4. Populate Recent Recipes (Modern Style)
  const recentList = $('#dashRecentRecipes');
  if (recentList) {
    const recent = [...APP.savedRecipes].sort((a, b) => new Date(b.savedAt) - new Date(a.savedAt)).slice(0, 4);

    if (recent.length === 0) {
      recentList.innerHTML = `
        <div class="empty-state" style="padding:1rem; color:var(--text-muted); text-align:center;">
          <p>${t('dash.no_recent')}</p>
        </div>`;
    } else {
      recentList.innerHTML = recent.map(r => {
        const totalCost = r.ingredients.reduce((s, i) => s + (i.pricePerUnit * (i.unit === 'g' || i.unit === 'ml' ? i.quantity / 1000 : i.quantity)), 0);
        return `
          <div class="recent-item-premium" onclick="loadRecipe('${r.id}'); document.getElementById('navRecettes').click();">
            <div class="ri-info">
              <strong style="display:block; font-size:0.95rem;">${escapeHtml(r.name)}</strong>
              <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(r.category || 'Pâtisserie')}</span>
            </div>
            <div class="ri-price" style="font-weight:700; color:var(--accent);">${totalCost.toFixed(2)} €</div>
          </div>
        `;
      }).join('');
    }
  }

  // 5. New Premium Widgets
  renderFeaturedRecipe();
  renderTodayTeam();
  renderPendingLeavesDashboard();
}

let currentFeaturedRecipe = null;
function renderFeaturedRecipe() {
  const container = $('#featuredRecipeContent');
  if (!container) return;

  if (!currentFeaturedRecipe && typeof RECIPES !== 'undefined' && RECIPES.length > 0) {
    const idx = Math.floor(Math.random() * RECIPES.length);
    currentFeaturedRecipe = { ...RECIPES[idx], libIdx: idx };
  }

  if (!currentFeaturedRecipe) {
    container.innerHTML = `<p>${t('dash.featured.empty')}</p>`;
    return;
  }

  const r = currentFeaturedRecipe;
  container.innerHTML = `
    <img src="${r.image}" class="featured-img" alt="${r.name}" onerror="this.src='https://placehold.co/200x200?text=${escapeHtml(r.name).replace(/ /g, '+')}'; this.classList.add('error');">
    <div class="featured-info">
      <h4>${escapeHtml(r.name)}</h4>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem; line-height:1.4;">${escapeHtml(r.description)}</p>
      <div class="featured-meta">
        <span style="display:flex; align-items:center; gap:4px;">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
           ${r.prepTime + r.cookTime} min
        </span>
        <span style="display:flex; align-items:center; gap:4px;">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
           ${r.portions} portions
        </span>
      </div>
      <button class="btn btn-sm btn-outline" style="margin-top:1rem;" onclick="loadExampleRecipe(${r.libIdx}); document.getElementById('navRecettes').click();">${t('ui.btn.view_sheet')}</button>
    </div>
  `;
}

function renderTodayTeam() {
  const container = $('#todayTeamList');
  if (!container) return;

  if (APP.teamMembers.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--text-muted);">${t('plan.team.no_members')}</p>`;
    return;
  }

  const today = new Date().toISOString().split('T')[0];
  const presentMembers = APP.teamMembers.filter(m => {
    const isOnLeave = APP.staffLeaves.some(l =>
      l.memberId === m.id &&
      l.status === 'approved' &&
      today >= l.start && today <= l.end
    );
    return !isOnLeave;
  });

  if (presentMembers.length === 0) {
    container.innerHTML = `<p style="font-size:0.85rem; color:var(--danger); font-weight:700;">${t('dash.team.no_present')}</p>`;
    return;
  }

  container.innerHTML = presentMembers.map(m => {
    const c = getMemberColor(m.id);
    return `
      <div class="today-member" style="border-left: 3px solid ${c.dot}; background:rgba(255,255,255,0.5); border-radius:8px; margin-bottom:4px;">
        <span class="member-dot" style="background:${c.dot}; margin-left:8px;"></span>
        <div class="member-info">
          <strong style="font-size:0.95rem;">${capitalizeFirstLetter(m.name)}</strong>
          <span style="font-size:0.75rem; color:var(--text-muted);">${escapeHtml(m.role)}</span>
        </div>
        <div class="presence-indicator" style="margin-left:auto; width:8px; height:8px; background:var(--success); border-radius:50%; margin-right:12px;"></div>
      </div>
    `;
  }).join('');
}

// ============================================================================
// INVENTORY SYSTEM
// ============================================================================

function getIngredientEmoji(name) {
  const n = name.toLowerCase();
  if (n.includes('farine')) return '🌾';
  if (n.includes('beurre')) return '🧈';
  if (n.includes('sucre')) return '🍬';
  if (n.includes('lait') || n.includes('crème')) return '🥛';
  if (n.includes('œuf')) return '🥚';
  if (n.includes('chocolat')) return '🍫';
  if (n.includes('amande') || n.includes('noisette')) return '🥜';
  if (n.includes('sel')) return '🧂';
  if (n.includes('vanille')) return '🍦';
  if (n.includes('fraise') || n.includes('fruit')) return '🍓';
  if (n.includes('levure')) return '🍞';
  return '📦';
}

function renderInventory() {
  const container = $('#inventoryListBody');
  if (!container) return;

  if (APP.inventory.length === 0) {
    container.innerHTML = `
      <tr>
        <td colspan="6" style="text-align:center; padding:3rem; color:var(--text-muted);">
          ${t('inv.table.empty') || 'Module d\'inventaire vide.'} <button class="btn btn-sm btn-outline" onclick="initInventoryFromDb(); renderInventory();">✨ ${t('inv.btn.sync') || 'Initialiser la Réserve'}</button>
        </td>
      </tr>
    `;
    return;
  }

  container.innerHTML = APP.inventory.map(item => {
    const isCritical = item.stock <= item.alertThreshold;
    const isLow = item.stock <= (item.alertThreshold * 2);

    // Health Bar logic
    const healthPercent = Math.min(100, (item.stock / (item.alertThreshold * 4)) * 100);
    const healthClass = isCritical ? 'health-critical' : (isLow ? 'health-low' : 'health-ok');
    const statusClass = isCritical ? 'status-critical' : 'status-ok';
    const statusLabel = isCritical ? '⚠️ ' + t('inv.health.critical') : '✅ ' + t('inv.health.ok');

    const emoji = getIngredientEmoji(item.name);

    return `
      <tr class="inv-row ${isCritical ? 'row-alert' : ''}">
        <td>
          <div style="display:flex; align-items:center; gap:12px;">
            <div class="inv-icon" style="font-size:1.8rem; background:var(--bg-body); width:50px; height:50px; display:flex; align-items:center; justify-content:center; border-radius:12px; position:relative; z-index:2;">${emoji}</div>
            <div style="flex:1;">
              <strong style="display:block; font-size:1rem;">${escapeHtml(t(item.name))}</strong>
              <div class="stock-health-container">
                <div class="stock-health-bar ${healthClass}" style="width: ${healthPercent}%"></div>
              </div>
              <small style="color:var(--text-muted); font-size:0.7rem;">${t('inv.last_restock') || 'Dernier arrivage'}: ${new Date(item.lastUpdate).toLocaleDateString()}</small>
            </div>
          </div>
        </td>
        <td style="text-align:center;">
          <div class="stock-control">
            <button class="btn-stock minus" onclick="updateStock('${item.id}', -100)">-</button>
            <span class="stock-val ${isCritical ? 'text-danger' : ''}">${item.stock}</span>
            <button class="btn-stock plus" onclick="updateStock('${item.id}', 100)">+</button>
          </div>
        </td>
        <td style="font-weight:700; color:var(--text-secondary); text-align:center; font-size:0.85rem;">${item.unit}</td>
        <td style="font-weight:900; color:var(--text-main); text-align:right; font-size:1rem;">
          ${(item.stock * (item.price || 0) / (item.unit === 'g' || item.unit === 'ml' ? 1000 : 1)).toFixed(2)} €
        </td>
        <td style="text-align:center;"><span class="badge ${statusClass}">${statusLabel}</span></td>
        <td style="text-align:center;">
          <button class="btn btn-sm btn-outline btn-round" onclick="editInventoryItem('${item.id}')" title="Seuil d'alerte">🔔</button>
        </td>
      </tr>
    `;
  }).join('');
}

function filterInventory() {
  const query = $('#invSearchInput').value.toLowerCase();
  const rows = $$('#inventoryListBody tr');
  rows.forEach(row => {
    const text = row.querySelector('strong')?.textContent.toLowerCase() || '';
    row.style.display = text.includes(query) ? '' : 'none';
  });
}

function showRestockModal() {
  const modal = $('#restockModal');
  const selector = $('#restockItemSelector');
  if (!modal || !selector) return;

  // Fill selector with all ingredients from DB
  selector.innerHTML = APP.inventory.map(item => `<option value="${item.id}">${getIngredientEmoji(item.name)} ${item.name}</option>`).join('');

  selector.onchange = () => {
    const item = APP.inventory.find(i => i.id === selector.value);
    if (item) $('#restockUnit').value = item.unit;
  };

  // Trigger initial value
  if (APP.inventory.length > 0) {
    $('#restockUnit').value = APP.inventory[0].unit;
  }

  modal.style.display = 'flex';
}

function hideRestockModal() {
  $('#restockModal').style.display = 'none';
}

function confirmRestock() {
  const itemId = $('#restockItemSelector').value;
  const qty = parseFloat($('#restockQty').value) || 0;
  const totalLotPrice = parseFloat($('#restockTotalPrice').value);

  const item = APP.inventory.find(i => i.id === itemId);
  if (item && qty > 0) {
    item.stock += qty;
    item.lastUpdate = new Date().toISOString();

    // Logic: if totalLotPrice is provided, update the reference price in the DB
    if (!isNaN(totalLotPrice) && totalLotPrice > 0) {
      // Calculate new unit price (pricePerKg or pricePerL)
      let unitPrice;
      if (item.unit === 'g' || item.unit === 'ml') {
        unitPrice = (totalLotPrice / qty) * 1000;
      } else {
        unitPrice = totalLotPrice / qty;
      }
      item.price = unitPrice;

      // Also update the global ingredient DB for future recipes
      const dbIng = APP.ingredientDb.find(i => i.name === item.name);
      if (dbIng) dbIng.pricePerUnit = unitPrice;
      saveIngredientDb();
    }

    saveInventory();
    hideRestockModal();
    renderInventory();
    updateDashboard();
    renderSuppliers();
    if (typeof showToast === 'function') showToast(`Arrivage de ${item.name} enregistré`, 'success');
  }
}

function updateStock(id, delta) {
  const item = APP.inventory.find(i => i.id === id);
  if (item) {
    item.stock = Math.max(0, item.stock + delta);
    item.lastUpdate = new Date().toISOString();
    saveInventory();
    renderInventory();
    updateDashboard();
    renderSuppliers();
  }
}

function editInventoryItem(id) {
  const item = APP.inventory.find(i => i.id === id);
  if (!item) return;

  const newVal = prompt(`Modifier le seuil d'alerte pour ${item.name} (${item.unit}):`, item.alertThreshold);
  if (newVal !== null) {
    item.alertThreshold = parseFloat(newVal) || 0;
    saveInventory();
    renderInventory();
    updateDashboard();
  }
}

// ============================================================================
// CHEF TIPS SYSTEM
// ============================================================================

let lastTipIndex = -1;
function updateRandomTip() {
  const tipTextEl = $('#dashTipBody');
  if (!tipTextEl) return;

  const count = 11; // Number of tips available in i18n (tip.1 to tip.11)
  let newIndex;
  do {
    newIndex = Math.floor(Math.random() * count) + 1;
  } while (newIndex === lastTipIndex);

  lastTipIndex = newIndex;

  // Flash animation
  tipTextEl.style.transition = 'none';
  tipTextEl.style.opacity = '0';

  setTimeout(() => {
    tipTextEl.innerHTML = `<strong>${t('dash.tip_prefix')}</strong> ${t('tip.' + newIndex)}`;
    tipTextEl.style.transition = 'opacity 0.5s ease-in-out';
    tipTextEl.style.opacity = '1';
  }, 300);
}

// ============================================================================
// PROFILE & PIN CHANGE
// ============================================================================

function toggleProfileDropdown() {
  $('#profileDropdown').classList.toggle('show');
}

function showPinModal() {
  $('#pinModal').style.display = 'flex';
  $('#profileDropdown').classList.remove('show');

  const user = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!user) return;

  const userKey = user.toLowerCase();
  let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const userData = usersDb[userKey] || {};
  const gender = userData.gender || 'male';
  const email = userData.email || '';
  const role = userData.role || 'Chef de Labo';

  $('#profileEmail').value = email;
  $('#profileRole').value = role;

  $$('.gender-btn-profile').forEach(btn => {
    if (btn.dataset.gender === gender) {
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline');
    } else {
      btn.classList.remove('active', 'btn-primary');
      btn.classList.add('btn-outline');
    }
  });
}

function hidePinModal() {
  $('#pinModal').style.display = 'none';
}

function saveNewProfile() {
  const pin1 = $('#newPin').value;
  const pin2 = $('#confirmPin').value;
  const user = localStorage.getItem(STORAGE_KEYS.currentUser);
  const activeGenderBtn = document.querySelector('.gender-btn-profile.active');
  const gender = activeGenderBtn ? activeGenderBtn.dataset.gender : null;

  const email = $('#profileEmail').value;

  let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const userKey = user.toLowerCase();

  // Ensure user entry exists
  if (!usersDb[userKey]) usersDb[userKey] = {};

  if (pin1) {
    if (pin1.length < 4) {
      showToast(t('toast.pin.short'), 'error');
      return;
    }
    if (pin1 !== pin2) {
      showToast(t('toast.pin.mismatch'), 'error');
      return;
    }
    usersDb[userKey].pin = pin1;
  }

  // Persist gender, email, and role
  usersDb[userKey].gender = gender || usersDb[userKey].gender || 'male';
  usersDb[userKey].email = email;
  usersDb[userKey].role = $('#profileRole').value;

  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb));
  showToast(t('toast.profile.updated'), 'success');
  hidePinModal();
  updateDashboard();

  $('#newPin').value = '';
  $('#confirmPin').value = '';
}

function getGenderedRole(role, isFemale) {
  if (!role.includes('/') && !role.includes('(')) return role;

  if (role.includes('/')) {
    const parts = role.split('/').map(p => p.trim());
    return isFemale ? parts[1] : parts[0];
  }

  if (role.includes('(')) {
    if (isFemale) {
      if (role.toLowerCase().includes('apprenti')) return 'Apprentie';
      if (role.toLowerCase().includes('ouvrier')) return 'Ouvrière';
      if (role.toLowerCase().includes('chef')) return 'Cheffe';
      return role.replace(/\(|\)/g, '');
    }
    return role.replace(/\(.*\)/, '');
  }
  return role;
}

// ============================================================================
// PLANNING & TEAM MANAGEMENT
// ============================================================================

const TEAM_COLORS = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' }, // Bleu
  { bg: '#dcfce7', border: '#22c55e', text: '#166534', dot: '#22c55e' }, // Vert
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' }, // Ambre
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', dot: '#ec4899' }, // Rose
  { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3', dot: '#6366f1' }, // Indigo
  { bg: '#ffedd5', border: '#f97316', text: '#9a3412', dot: '#f97316' }, // Orange
  { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' }, // Violet
  { bg: '#ccfbf1', border: '#14b8a6', text: '#115e59', dot: '#14b8a6' }, // Turquoise
  { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' }, // Rouge
  { bg: '#f0fdf4', border: '#10b981', text: '#065f46', dot: '#10b981' }, // Émeraude
  { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12', dot: '#fb923c' }, // Sorbet
  { bg: '#faf5ff', border: '#c084fc', text: '#581c87', dot: '#c084fc' }, // Mauve
];

function getMemberColor(memberId) {
  const member = APP.teamMembers.find(m => m.id === memberId);
  if (member && member.colorIdx !== undefined) return TEAM_COLORS[member.colorIdx % TEAM_COLORS.length];
  const idx = APP.teamMembers.findIndex(m => m.id === memberId);
  return TEAM_COLORS[(idx >= 0 ? idx : 0) % TEAM_COLORS.length];
}

function loadTeamMembers() {
  const teamKey = getUserTeamKey();
  const data = localStorage.getItem(teamKey);
  APP.teamMembers = data ? JSON.parse(data) : [];
  APP.teamMembers.forEach((m, i) => { if (m.colorIdx === undefined) m.colorIdx = i; });

  const leavesKey = getUserLeavesKey();
  const leaveData = localStorage.getItem(leavesKey);
  APP.staffLeaves = leaveData ? JSON.parse(leaveData) : [];

  const owner = getViewOwner().toLowerCase();
  const teamName = localStorage.getItem(`gourmet_team_name_${owner}`) || '';
  const nameInput = $('#teamNameInput');
  if (nameInput) {
    nameInput.value = teamName;
    nameInput.disabled = (localStorage.getItem(STORAGE_KEYS.currentUser)?.toLowerCase() !== owner);
  }
}

function saveTeamMembers() {
  const teamKey = getUserTeamKey();
  const leavesKey = getUserLeavesKey();
  localStorage.setItem(teamKey, JSON.stringify(APP.teamMembers));
  localStorage.setItem(leavesKey, JSON.stringify(APP.staffLeaves));

  const owner = getViewOwner().toLowerCase();
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser)?.toLowerCase();
  if (owner === currentUser) {
    const teamName = $('#teamNameInput')?.value || '';
    localStorage.setItem(`gourmet_team_name_${owner}`, teamName);
    renderSharedList();
  }
}

function checkPermissions() {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const owner = getViewOwner();
  const isOwner = currentUser?.toLowerCase() === owner.toLowerCase();

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const userKey = currentUser?.toLowerCase();
  const isJuAdmin = userKey === 'ju' && usersDb[userKey]?.pin === '2503';

  const teamKey = getUserTeamKey();
  const team = JSON.parse(localStorage.getItem(teamKey) || '[]');
  const myEntry = team.find(m => m.name.toLowerCase() === userKey);

  // Use profile role if available, fallback to team entry or default roles
  const profileRole = usersDb[userKey]?.role || 'Consultant';
  let role = myEntry ? myEntry.role : (isOwner ? profileRole : 'Consultant');

  // No longer auto-promoting owners to Chef. They must explicitly have the role.
  const isChef = (role === 'Chef de Labo');

  // Owners and super admin (Ju) can always manage their team
  const canModifyTeam = isOwner || isJuAdmin;
  const canModifyLeaves = (isChef && isOwner) || isJuAdmin;

  if ($('#btnAddMember')) {
    $('#btnAddMember').parentElement.style.display = canModifyTeam ? 'block' : 'none';
  }

  if ($('#btnInviteUser')) {
    $('#btnInviteUser').parentElement.style.display = isOwner ? 'block' : 'none';
  }

  const leaveForm = document.querySelector('.leave-form');
  if (leaveForm) {
    leaveForm.style.display = isOwner ? 'block' : 'none';
  }

  const leaveBtn = $('#btnAddLeave');
  if (leaveBtn) {
    leaveBtn.textContent = (isChef || isJuAdmin) ? t('plan.leave.btn') : t('plan.leave.request_btn');
  }

  // Dashboard Workflow visibility
  const chefWorkflow = $('#chefWorkflowArea');
  if (chefWorkflow) {
    chefWorkflow.style.display = (isChef || isJuAdmin) ? 'block' : 'none';
  }

  const clearBtn = $('#btnClearPlanning');
  if (clearBtn) {
    clearBtn.style.display = (isChef || isJuAdmin) ? 'block' : 'none';
  }

  return { isChef, isOwner, isJuAdmin, canModify: canModifyLeaves, role };
}

function renderTeam() {
  const container = $('#teamMemberList');
  const select = $('#leaveMemberId');
  if (!container) return;
  const { isChef, isOwner, isJuAdmin } = checkPermissions();
  const canRemove = (isOwner && isChef) || isJuAdmin;

  if (APP.teamMembers.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">${t('plan.team.no_members')}</p>`;
    if (select) select.innerHTML = `<option value="">${t('plan.team.no_employee')}</option>`;
    return;
  }

  container.innerHTML = APP.teamMembers.map(m => {
    const c = getMemberColor(m.id);
    return `
    <div class="team-member">
      <div class="member-main-content">
        <span class="member-dot" style="background:${c.dot}"></span>
        <div class="member-info">
          <h4>${capitalizeFirstLetter(escapeHtml(m.name))}</h4>
          <span>${escapeHtml(m.role)}</span>
        </div>
      </div>
      <div class="member-actions-group">
        ${canRemove ? `
          <button class="action-btn edit-btn" onclick="editMemberRole('${m.id}')" title="${t('plan.team.assign_role')}">✏️</button>
          <button class="action-btn remove-btn" onclick="removeTeamMember('${m.id}')" title="${t('ui.btn.delete')}">✕</button>
        ` : ''}
      </div>
    </div>`;
  }).join('');

  if (select) {
    select.innerHTML = `<option value="">— ${t('plan.leave.choose')} —</option>` +
      APP.teamMembers.map(m => {
        const c = getMemberColor(m.id);
        return `<option value="${m.id}" style="border-left:3px solid ${c.dot};">${capitalizeFirstLetter(escapeHtml(m.name))}</option>`;
      }).join('');

    // Auto-select if user is in team
    const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
    const myEntry = APP.teamMembers.find(m => m.name.toLowerCase() === currentUser?.toLowerCase());
    if (myEntry) select.value = myEntry.id;
  }
}

function addLeave() {
  const memberId = $('#leaveMemberId').value;
  const start = $('#leaveStart').value;
  const end = $('#leaveEnd').value;
  const { isChef, isOwner } = checkPermissions();

  if (!memberId || !start || !end) {
    showToast(t('plan.leave.empty_fields'), 'error');
    return;
  }

  const member = APP.teamMembers.find(m => m.id === memberId);
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const owner = getViewOwner();

  if (canModify || (isChef && isOwner)) {
    // Direct add
    APP.staffLeaves.push({
      id: Date.now().toString(),
      memberId,
      memberName: member ? member.name : 'Inconnu',
      start,
      end,
      status: 'approved'
    });
    saveTeamMembers();
    renderLeaves();
    renderAnnualCalendar();
    showToast(t('plan.leave.registered_for', { name: member ? member.name : '' }), 'success');
  } else {
    // Request permission
    const requestId = 'req_' + Date.now();
    addNotification(owner, {
      id: requestId,
      type: 'leave_request',
      status: 'pending',
      from: currentUser,
      memberId,
      memberName: member ? member.name : currentUser,
      start,
      end,
      timestamp: new Date().toISOString()
    });
    showToast(t('plan.leave.sent'), 'info');
  }

  // Reset inputs
  $('#leaveStart').value = '';
  $('#leaveEnd').value = '';
}

function renderPendingLeavesDashboard() {
  const container = $('#pendingLeavesDashboard');
  const countBadge = $('#pendingRequestsCount');
  if (!container) return;

  const { isChef, isJuAdmin } = checkPermissions();
  const area = $('#chefWorkflowArea');
  if (!isChef && !isJuAdmin) {
    if (area) area.style.display = 'none';
    return;
  }

  const pending = APP.notifications.filter(n => n.type === 'leave_request' && !n.handled);

  if (countBadge) {
    countBadge.textContent = pending.length;
    countBadge.style.display = pending.length > 0 ? 'inline-block' : 'none';
  }

  if (area) {
    area.style.display = pending.length > 0 ? 'block' : 'none';
  }

  if (pending.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:1.5rem;">Aucune demande en attente.</p>';
    return;
  }

  container.innerHTML = pending.map(n => {
    const s = new Date(n.start);
    const e = new Date(n.end);
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;

    return `
      <div class="pending-leave-card card" style="margin-bottom:1rem; padding:1.2rem; border-left:4px solid var(--accent-light);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
          <div>
            <div style="font-weight:700; font-size:1.1rem; color:var(--text);">${capitalizeFirstLetter(n.memberName)}</div>
            <div style="font-size:0.85rem; color:var(--text-secondary);">${t('plan.leave.requested_by', { name: capitalizeFirstLetter(n.from) })}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800; color:var(--accent); font-size:0.9rem;">${days} ${days > 1 ? t('plan.leave.days') : t('plan.leave.day')}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${new Date(n.timestamp).toLocaleDateString()}</div>
          </div>
        </div>
        <div style="background:var(--bg-alt); padding:0.8rem; border-radius:var(--radius-sm); margin-bottom:1.2rem; display:flex; gap:1.5rem; font-size:0.95rem;">
          <div><span style="color:var(--text-muted); font-size:0.8rem; display:block;">${t('plan.leave.from_short')}</span> <b>${s.toLocaleDateString()}</b></div>
          <div><span style="color:var(--text-muted); font-size:0.8rem; display:block;">${t('plan.leave.to_short')}</span> <b>${e.toLocaleDateString()}</b></div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem;">
          <button class="btn btn-primary btn-sm" onclick="handleLeaveAction('${n.id}', 'approve')">${t('plan.btn.approve')}</button>
          <button class="btn btn-outline btn-sm" onclick="handleLeaveAction('${n.id}', 'reject')" style="color:var(--danger); border-color:var(--danger);">${t('plan.btn.reject')}</button>
        </div>
      </div>
    `;
  }).join('');
}

function handleLeaveAction(requestId, action) {
  const notif = APP.notifications.find(n => n.id === requestId);
  if (!notif) return;

  if (action === 'approve') {
    APP.staffLeaves.push({
      id: Date.now().toString(),
      memberId: notif.memberId,
      memberName: notif.memberName,
      start: notif.start,
      end: notif.end,
      status: 'approved'
    });
    saveTeamMembers();
    showToast(t('plan.leave.approved', { name: notif.memberName }), 'success');
  } else {
    showToast(t('plan.leave.denied_for', { name: notif.memberName }), 'info');
  }

  // Update notification status
  notif.status = action === 'approve' ? 'approved' : 'denied';
  notif.handled = true;
  notif.read = true;
  saveNotifications();

  // Re-render
  renderPendingLeavesDashboard();
  renderNotifications();
  renderAnnualCalendar();
}

function removeLeave(id) {
  const { isChef, isOwner, isJuAdmin } = checkPermissions();
  if (!isJuAdmin && (!isChef || !isOwner)) {
    showToast(t('plan.leave.error.admin_only'), 'error');
    return;
  }

  if (!confirm(t('plan.leave.confirm_delete'))) return;

  APP.staffLeaves = APP.staffLeaves.filter(l => l.id !== id);
  saveTeamMembers();
  renderLeaves();
  renderAnnualCalendar();
  showToast(t('plan.leave.deleted'), 'info');
}

function clearPlanning() {
  const { isChef, isJuAdmin } = checkPermissions();
  if (!isChef && !isJuAdmin) return;

  if (!confirm(t('plan.confirm_clear_all'))) return;

  APP.staffLeaves = [];
  saveTeamMembers();
  renderLeaves();
  renderAnnualCalendar();
  showToast(t('plan.toast.cleared'), 'success');
}

function renderLeaves() {
  const container = $('#leaveList');
  if (!container) return;
  const { isChef, isOwner } = checkPermissions();

  if (APP.staffLeaves.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:0.5rem 0;">${t('plan.leave.none')}</p>`;
    return;
  }

  const sorted = [...APP.staffLeaves].sort((a, b) => new Date(a.start) - new Date(b.start));

  container.innerHTML = `<div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.5px; margin-bottom:0.6rem;">${t('plan.leave.registered')} (${sorted.length})</div>` +
    sorted.map(l => {
      const s = new Date(l.start);
      const e = new Date(l.end);
      const sStr = s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const eStr = e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      const c = getMemberColor(l.memberId);
      const canRemove = (isOwner && isChef) || isJuAdmin;
      return `
      <div class="leave-card" style="border-left-color:${c.dot}; background:${c.bg}">
        <span class="member-dot" style="background:${c.dot}"></span>
        <div class="leave-card-left">
          <div class="leave-card-name">${capitalizeFirstLetter(escapeHtml(l.memberName))}</div>
          <div class="leave-card-dates">📅 ${sStr} → ${eStr} <span class="leave-card-days" style="color:${c.text}">(${days}${t('plan.leave.day').charAt(0)})</span></div>
        </div>
        ${canRemove ? `<button class="remove-member" onclick="removeLeave('${l.id}')" title="Supprimer ce congé">✕</button>` : ''}
      </div>
    `;
    }).join('');
}

// ============================================================================
// SHARING & NOTIFICATIONS SYSTEM
// ============================================================================

// =====================================================================
// SUPPLIER & ORDER MANAGEMENT
// =====================================================================

function loadSuppliers() {
  const saved = localStorage.getItem('gourmet_suppliers');
  APP.suppliers = saved ? JSON.parse(saved) : [
    { id: 1, name: 'Metro Cash & Carry', contact: '01 02 03 04 05', email: 'contact@metro.fr', categories: ['Général', 'Frais'], leadTime: 2 },
    { id: 2, name: 'Valrhona (Chocolat)', contact: '04 75 07 60 60', email: 'serviceclient@valrhona.fr', categories: ['Chocolat', 'Décoration'], leadTime: 5 },
    { id: 3, name: 'Grands Moulins de Paris', contact: '01 49 59 75 00', email: 'commercial@gmp.fr', categories: ['Farine', 'Céréales'], leadTime: 3 },
    { id: 4, name: 'Fruits Rouge Co.', contact: '03 23 28 49 49', email: 'pro@fruitsrouge.com', categories: ['Purées', 'Coulis', 'Surgelés'], leadTime: 4 },
    { id: 5, name: 'Laiterie Echiré', contact: '05 49 25 70 03', email: 'contact@echire-aop.fr', categories: ['Beurre AOP', 'Crème'], leadTime: 3 },
    { id: 6, name: 'Vanille & Co', contact: '02 40 12 34 56', email: 'vanille@pro-reunion.re', categories: ['Vanille', 'Epices'], leadTime: 7 },
    { id: 7, name: 'PCB Création', contact: '03 88 58 75 75', email: 'orders@pcb-creation.fr', categories: ['Décoration', 'Colorants'], leadTime: 4 },
    { id: 8, name: 'Matfer Bourgeat', contact: '01 43 62 60 40', email: 'info@matferbourgeat.com', categories: ['Matériel Ops'], leadTime: 5 }
  ];
  if (!saved) saveSuppliers();
}

function saveSuppliers() { localStorage.setItem('gourmet_suppliers', JSON.stringify(APP.suppliers)); }

window.currentSupplierCat = 'all';

function filterSupplierCat(cat) {
  window.currentSupplierCat = cat;

  // Update UI active state
  document.querySelectorAll('.filter-pill').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.cat === cat);
  });

  renderSuppliers();
}

function renderSuppliers() {
  const grid = document.getElementById('suppliersGrid');
  if (!grid) return;

  const lowStock = APP.inventory.filter(item => item.stock <= (item.alertThreshold || 0));
  const searchInput = document.getElementById('supplierSearchInput');
  const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const currentCat = window.currentSupplierCat || 'all';

  const filtered = APP.suppliers.filter(s => {
    const matchesQuery = s.name.toLowerCase().includes(query) ||
      s.categories.some(c => c.toLowerCase().includes(query));
    const matchesCat = currentCat === 'all' ||
      s.categories.some(c => c.toLowerCase().includes(currentCat.toLowerCase()));
    return matchesQuery && matchesCat;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align:center; padding:4rem; background:rgba(0,0,0,0.02); border-radius:20px; border:2px dashed var(--surface-border);">
      <div style="font-size:4rem; margin-bottom:1.5rem; filter: grayscale(1);">🏢</div>
      <p style="font-weight:700; color:var(--text-muted); font-size:1.1rem;">${i18n.t('suppliers.none_found')}</p>
    </div>`;
  } else {
    grid.innerHTML = filtered.map(s => {
      // Find matching items in low stock
      const matchingLowStock = lowStock.filter(item =>
        s.categories.some(cat =>
          item.name.toLowerCase().includes(cat.toLowerCase()) ||
          cat.toLowerCase().includes(item.name.toLowerCase()) ||
          (cat.toLowerCase().includes('lait') && item.name.toLowerCase().includes('lait')) ||
          (cat.toLowerCase().includes('beurre') && item.name.toLowerCase().includes('beurre')) ||
          (cat.toLowerCase().includes('farine') && item.name.toLowerCase().startsWith('farine')) ||
          (cat.toLowerCase().includes('fruit') && (item.name.toLowerCase().includes('purée') || item.name.toLowerCase().includes('fruit')))
        )
      );

      const hasAlert = matchingLowStock.length > 0;
      const stars = '⭐'.repeat(Math.round(s.rating || 5));

      // BRAND COLORS Logic
      let brandColor = 'var(--primary)';
      if (s.name.includes('Metro')) brandColor = '#0055a4';
      if (s.name.includes('Valrhona')) brandColor = '#e67e22';
      if (s.name.includes('Moulins')) brandColor = '#c0392b';

      return `
        <div class="supplier-card ${hasAlert ? 'alert-active' : ''}" style="border-top: 4px solid ${brandColor};">
          <div class="supplier-card-header">
            <div class="supplier-avatar" style="background: ${brandColor};">${s.name.charAt(0).toUpperCase()}</div>
            <div class="supplier-info-main">
              <h3>${escapeHtml(s.name)}</h3>
              <div class="rating-stars">${stars} <span style="font-size:0.7rem; color:#aaa;">(${s.rating || '5.0'})</span></div>
            </div>
          </div>
          <div class="supplier-card-body">
            <div class="supplier-contact-row"><i>📞</i> ${escapeHtml(s.contact || 'Directeur')}</div>
            <div class="supplier-contact-row" style="word-break: break-all; opacity:0.8; font-size:0.9rem;"><i>✉️</i> ${escapeHtml(s.email || 'contact@fournisseur.fr')}</div>
            
            <div class="supplier-tags">
              ${s.categories.map(c => `<span class="tag-supplier">${escapeHtml(c)}</span>`).join('')}
            </div>
            
            ${hasAlert ? `
              <div class="supplier-crit-list" style="margin-top:1.5rem; border-top:1px solid rgba(243, 156, 18, 0.2); padding-top:1rem;">
                <div style="font-size:0.75rem; font-weight:800; margin-bottom:0.8rem; color:var(--warning); display:flex; align-items:center; gap:8px;">
                  ⚠️ ${i18n.t('suppliers.need_order') || 'ARTICLES À RECOMMANDER'} :
                </div>
                ${matchingLowStock.map(item => `
                  <div class="supplier-crit-item" style="font-size:0.8rem; padding:4px 0;">
                    • ${escapeHtml(item.name)} <span style="color:#ef4444; font-weight:700;">(${item.stock} ${item.unit})</span>
                  </div>
                `).join('')}
              </div>
            ` : ''}
          </div>
          <div class="supplier-card-footer">
            <button class="btn btn-outline" style="padding:6px 12px; font-size:0.75rem;" onclick="window.location.href='mailto:${s.email}'">📧 ${i18n.t('suppliers.btn.contact') || 'Email'}</button>
            <button class="btn-icon" title="Modifier" onclick="editSupplier(${s.id})">✏️</button>
            <button class="btn-icon" title="Supprimer" onclick="deleteSupplier(${s.id})" style="color:var(--danger); opacity:0.6;">🗑️</button>
          </div>
        </div>
      `;
    }).join('');
  }

  // Update Stats
  const totalEl = document.getElementById('statsTotalSuppliers');
  if (totalEl) totalEl.textContent = APP.suppliers.length;

  renderSuggestedOrders();
}



function renderSuggestedOrders() {
  const container = document.getElementById('suggestedOrderList');
  if (!container) return;

  const lowStock = APP.inventory.filter(item => item.stock <= item.alertThreshold);

  const pendingEl = document.getElementById('statsPendingOrders');
  if (pendingEl) pendingEl.textContent = lowStock.length;

  if (lowStock.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">${i18n.t('orders.all_safe')}</td></tr>`;
    return;
  }

  container.innerHTML = lowStock.map(item => {
    const ratio = item.stock / item.alertThreshold;
    const isCritical = ratio <= 0.2;
    const need = (item.alertThreshold * 4) - item.stock;

    return `
      <tr class="order-row">
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <span class="order-status-dot ${isCritical ? 'critical' : 'warning'}"></span>
            <span class="order-item-name">${escapeHtml(item.name)}</span>
          </div>
        </td>
        <td style="font-weight:700;">${item.stock} ${item.unit}</td>
        <td style="color:var(--text-muted);">${item.alertThreshold} ${item.unit}</td>
        <td><span class="order-qty-pill">+ ${need} ${item.unit}</span></td>
        <td style="text-align: right;">
          <span style="font-size:0.7rem; font-weight:800; text-transform:uppercase; color:${isCritical ? 'var(--danger)' : 'var(--warning)'};">
            ${isCritical ? i18n.t('orders.critical') : i18n.t('orders.urgent')}
          </span>
        </td>
      </tr>
    `;
  }).join('');
}

function exportShoppingList() {
  const lowStock = APP.inventory.filter(item => item.stock <= item.alertThreshold);
  if (lowStock.length === 0) { showToast(i18n.t('orders.no_low_stock')); return; }
  let text = i18n.t('orders.export_title') + new Date().toLocaleDateString() + "\n\n";
  lowStock.forEach(item => { text += `- ${item.name}: ${(item.alertThreshold * 4) - item.stock} ${item.unit}\n`; });
  const blob = new Blob([text], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `Commande_${new Date().toISOString().split('T')[0]}.txt`;
  a.click();
  showToast(i18n.t('orders.export_success'));
}

// =====================================================================
// STATISTICS & CHARTS (V2)
// =====================================================================

// =====================================================================
// STATISTICS & CHARTS (V2)
// =====================================================================

function filterStatsCat(cat) {
  window.currentStatsCat = cat;
  const btns = document.querySelectorAll('#statsCategoryFilters .stats-toggle-btn');
  btns.forEach(b => {
    if (b.getAttribute('data-cat') === cat) b.classList.add('active');
    else b.classList.remove('active');
  });
  renderStats();
}

function renderStats() {
  const container = document.getElementById('mgmtViewDashboard');
  if (!container || container.style.display === 'none') return;

  if (APP.savedRecipes.length === 0) {
    // Optional: seed demo if empty, or show empty state
    // seedDemoData(); 
  }

  let recipes = APP.savedRecipes;
  if (!recipes || recipes.length === 0) {
    // Show empty state if no recipes
    const grid = document.querySelector('.stats-main-grid');
    if (grid) grid.style.opacity = '0.5';
    return;
  }

  // Calculate full data for all recipes
  const allResults = recipes.map(r => ({
    ...r,
    data: calcFullCost(r.margin || 70, r)
  }));

  // Filter based on selected category
  const filteredResults = window.currentStatsCat === 'all'
    ? allResults
    : allResults.filter(r => r.category === window.currentStatsCat);

  // --- 0. POPULATE CATEGORY FILTERS ---
  const catFilterContainer = document.getElementById('statsCategoryFilters');
  if (catFilterContainer) {
    const categories = [...new Set(allResults.map(r => r.category).filter(Boolean))];
    let html = `<button class="stats-toggle-btn ${window.currentStatsCat === 'all' ? 'active' : ''}" 
                 onclick="filterStatsCat('all')" data-cat="all" data-i18n="ui.all">${i18n.t('ui.all') || 'Toutes'}</button>`;

    categories.forEach(cat => {
      html += `<button class="stats-toggle-btn ${window.currentStatsCat === cat ? 'active' : ''}" 
                onclick="filterStatsCat('${cat}')" data-cat="${cat}">${cat}</button>`;
    });
    catFilterContainer.innerHTML = html;
  }

  if (filteredResults.length === 0) {
    // Handle case where category has no recipes (unlikely but safe)
    return;
  }

  // --- 1. KPI UPDATES ---
  const avgMargin = filteredResults.reduce((sum, r) => sum + r.data.marginPct, 0) / filteredResults.length;
  const sortedByMargin = [...filteredResults].sort((a, b) => b.data.marginPct - a.data.marginPct);
  const bestRecipe = sortedByMargin[0];
  const worstRecipe = sortedByMargin[sortedByMargin.length - 1];
  const avgCost = filteredResults.reduce((sum, r) => sum + r.data.costPerPortion, 0) / filteredResults.length;
  const avgPrice = filteredResults.reduce((sum, r) => sum + r.data.sellingPrice, 0) / filteredResults.length;

  if ($('#v2KpiAvgMargin')) $('#v2KpiAvgMargin').textContent = avgMargin.toFixed(1) + '%';
  if ($('#v2KpiBestRecipe')) $('#v2KpiBestRecipe').textContent = bestRecipe.name;
  if ($('#v2KpiWorstRecipe')) $('#v2KpiWorstRecipe').textContent = worstRecipe.name;
  if ($('#v2KpiAvgCost')) $('#v2KpiAvgCost').textContent = avgCost.toFixed(2) + '€';
  if ($('#v2KpiAvgPrice')) $('#v2KpiAvgPrice').textContent = avgPrice.toFixed(2) + '€';

  // --- 2. INSIGHTS ---
  let insightText = i18n.t('stats.insight.template', {
    avg: avgMargin.toFixed(1),
    best: bestRecipe.name,
    bestMargin: bestRecipe.data.marginPct.toFixed(1)
  }) || `Votre marge moyenne est de <strong>${avgMargin.toFixed(1)}%</strong>. Le produit le plus rentable est <strong>${bestRecipe.name}</strong> (${bestRecipe.data.marginPct.toFixed(1)}%).`;

  if (worstRecipe.data.marginPct < 50) {
    insightText += " " + (i18n.t('stats.insight.attention', {
      worst: worstRecipe.name,
      worstMargin: worstRecipe.data.marginPct.toFixed(1)
    }) || `Attention à <strong>${worstRecipe.name}</strong> dont la marge est faible (${worstRecipe.data.marginPct.toFixed(1)}%).`);
  } else {
    insightText += " " + (i18n.t('stats.insight.balanced') || "Vos marges sont globalement saines et équilibrées.");
  }

  if ($('#statsInsightText')) $('#statsInsightText').innerHTML = insightText;

  // --- 3. CHARTS ---
  renderV2MarginDonut(filteredResults);
  renderV2PerformanceBars(filteredResults);
  renderV2ScatterPlot(filteredResults);
  renderV2Alerts(filteredResults);
  renderV2Table(filteredResults);
  setupStatsListeners(filteredResults);
}

async function exportStatsPDF() {
  const container = document.getElementById('appStats');
  if (!container) return;

  const opt = {
    margin: 10,
    filename: `Rapport_Performance_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  showToast(i18n.t('ui.toast.exporting') || "Génération du PDF...");

  // Clone element to avoid modifying live view
  const clone = container.cloneNode(true);
  clone.style.display = 'block';
  clone.style.background = '#ffffff';
  clone.classList.add('pdf-export-mode');

  // Remove buttons and inputs from clone
  clone.querySelectorAll('button, input').forEach(el => el.remove());
  clone.querySelector('.stats-filter-bar')?.remove();

  try {
    await html2pdf().set(opt).from(clone).save();
    showToast(i18n.t('ui.toast.exported') || "Rapport exporté avec succès", "success");
  } catch (err) {
    console.error("PDF Export Error:", err);
    showToast("Erreur lors de l'export PDF", "error");
  }
}

function renderV2MarginDonut(results) {
  const ctx = document.getElementById('v2MarginChart')?.getContext('2d');
  if (!ctx) return;
  if (v2Charts.margin) v2Charts.margin.destroy();

  const buckets = { critical: 0, warning: 0, good: 0, excellent: 0 };
  results.forEach(r => {
    const m = r.data.marginPct;
    if (m < 30) buckets.critical++;
    else if (m < 50) buckets.warning++;
    else if (m < 70) buckets.good++;
    else buckets.excellent++;
  });

  v2Charts.margin = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['< 30%', '30-50%', '50-70%', '> 70%'],
      datasets: [{
        data: [buckets.critical, buckets.warning, buckets.good, buckets.excellent],
        backgroundColor: ['#EF4444', '#F59E0B', '#6366F1', '#22C55E'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 10, weight: '600' } } },
        tooltip: { padding: 12, backgroundColor: '#1E293B' }
      }
    }
  });

  const excellentPct = (buckets.excellent / results.length * 100).toFixed(0);
  const analysisEl = $('#v2MarginAnalysis');
  if (analysisEl) {
    analysisEl.innerHTML = i18n.t('stats.analysis.excellent_pct', {
      pct: excellentPct,
      status: Number(excellentPct) > 50 ? i18n.t('stats.analysis.profitable') : i18n.t('stats.analysis.to_optimize')
    });
  }
}

function renderV2PerformanceBars(results) {
  const ctx = document.getElementById('v2PerformanceChart')?.getContext('2d');
  if (!ctx) return;
  if (v2Charts.performance) v2Charts.performance.destroy();

  const sorted = [...results].sort((a, b) =>
    perfMode === 'top' ? b.data.marginPct - a.data.marginPct : a.data.marginPct - b.data.marginPct
  ).slice(0, 5);

  v2Charts.performance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(r => r.name),
      datasets: [{
        label: i18n.t('stats.chart.margin_label'),
        data: sorted.map(r => r.data.marginPct),
        backgroundColor: perfMode === 'top' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
        barThickness: 24
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { max: 100, grid: { display: false }, ticks: { font: { weight: '600' } } },
        y: { grid: { display: false }, ticks: { color: '#1E293B', font: { weight: '700' } } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${i18n.t('stats.chart.tooltip_margin')}: ${ctx.raw.toFixed(1)}% | ${i18n.t('stats.chart.tooltip_price')}: ${sorted[ctx.dataIndex].data.sellingPrice.toFixed(2)}€`
          }
        }
      }
    }
  });
}

function renderV2ScatterPlot(results) {
  const ctx = document.getElementById('v2ScatterChart')?.getContext('2d');
  if (!ctx) return;
  if (v2Charts.scatter) v2Charts.scatter.destroy();

  const data = results.map(r => ({
    x: r.data.totalMaterial,
    y: r.data.marginPct,
    name: r.name
  }));

  // Plugin for Quadrants Background
  const quadrantPlugin = {
    id: 'quadrants',
    beforeDraw(chart) {
      const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;
      const midX = x.getPixelForValue((x.max + x.min) / 2);
      const midY = y.getPixelForValue(50); // 50% margin is mid-point strictly for quadrants

      ctx.save();
      // TL: Low Cost, High Margin (Stars)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
      ctx.fillRect(left, top, midX - left, midY - top);
      // TR: High Cost, High Margin (Premium)
      ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.fillRect(midX, top, right - midX, midY - top);
      // BL: Low Cost, Low Margin (Volume)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.fillRect(left, midY, midX - left, bottom - midY);
      // BR: High Cost, Low Margin (Danger)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
      ctx.fillRect(midX, midY, right - midX, bottom - midY);
      ctx.restore();
    }
  };

  v2Charts.scatter = new Chart(ctx, {
    type: 'scatter',
    plugins: [quadrantPlugin],
    data: {
      datasets: [{
        label: i18n.t('stats.chart.recipes_label') || 'Recettes',
        data: data,
        backgroundColor: '#6366F1',
        pointRadius: 8,
        pointHoverRadius: 12,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: i18n.t('stats.chart.cost_axis') || 'Coût Matière (€)', font: { weight: '800', size: 12 } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          title: { display: true, text: i18n.t('stats.chart.margin_axis') || 'Marge (%)', font: { weight: '800', size: 12 } },
          min: 0, max: 100,
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      },
      plugins: {
        tooltip: {
          padding: 15,
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          titleFont: { size: 14, weight: 'bold' },
          callbacks: {
            label: (ctx) => {
              const r = data[ctx.dataIndex];
              return [
                ` ${r.name}`,
                ` • ${i18n.t('stats.chart.tooltip_cost') || 'Coût'}: ${ctx.parsed.x.toFixed(2)}€`,
                ` • ${i18n.t('stats.chart.tooltip_margin') || 'Marge'}: ${ctx.parsed.y.toFixed(1)}%`
              ];
            }
          }
        }
      }
    }
  });
}

function renderV2Alerts(results) {
  const container = $('#v2AlertsContainer');
  if (!container) return;

  const problematic = results.filter(r => r.data.marginPct < 55).sort((a, b) => a.data.marginPct - b.data.marginPct).slice(0, 3);

  if (problematic.length === 0) {
    container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-secondary);">${i18n.t('stats.alerts.none')}</div>`;
    return;
  }

  container.innerHTML = problematic.map(r => {
    const isCritical = r.data.marginPct < 35;
    const suggestion = isCritical
      ? i18n.t('stats.alerts.critical_suggestion', { amount: (r.data.sellingPrice * 0.15).toFixed(2) })
      : i18n.t('stats.alerts.standard_suggestion');
    return `
      <div class="alert-recipe-card ${isCritical ? 'danger' : ''}">
        <div class="alert-title">⚠️ ${escapeHtml(r.name)}</div>
        <div class="alert-desc">
          ${i18n.t('stats.alerts.margin_at', { margin: r.data.marginPct.toFixed(1) })} 
          ${i18n.t('stats.alerts.material_cost', { cost: r.data.totalMaterial.toFixed(2) })}
        </div>
        <div class="alert-suggestion">${suggestion}</div>
      </div>
    `;
  }).join('');
}

function renderV2Table(results) {
  const body = $('#v2DetailedTableBody');
  if (!body) return;

  const searchInput = $('#statsSearch');
  if (searchInput) {
    searchInput.placeholder = i18n.t('stats.table.search_ph');
  }

  const searchTerm = (searchInput?.value || '').toLowerCase();
  const filtered = results.filter(r => r.name.toLowerCase().includes(searchTerm));

  body.innerHTML = filtered.map(r => {
    const m = r.data.marginPct;
    const color = m > 70 ? '#22C55E' : (m > 50 ? '#6366F1' : (m > 30 ? '#F59E0B' : '#EF4444'));
    return `
      <tr>
        <td style="font-weight:700;">${escapeHtml(r.name)}</td>
        <td>${r.data.totalMaterial.toFixed(2)} €</td>
        <td>${r.data.costPerPortion.toFixed(2)} €</td>
        <td style="font-weight:800; color:var(--primary);">${r.data.sellingPrice.toFixed(2)} €</td>
        <td>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-weight:700; min-width:35px;">${m.toFixed(0)}%</span>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width:${m}%; background:${color};"></div>
            </div>
          </div>
        </td>
        <td style="text-align:right;">
          <button class="btn btn-sm btn-outline" onclick="loadRecipe('${r.id}'); showRecettes();">🔍</button>
        </td>
      </tr>
    `;
  }).join('');
}

function setupStatsListeners(results) {
  const btnTop = $('#toggleTopProfitable');
  const btnWorst = $('#toggleWorstProfitable');
  const searchInput = $('#statsSearch');

  if (btnTop && btnWorst) {
    btnTop.onclick = () => {
      perfMode = 'top';
      btnTop.classList.add('active');
      btnWorst.classList.remove('active');
      renderV2PerformanceBars(results);
    };
    btnWorst.onclick = () => {
      perfMode = 'worst';
      btnWorst.classList.add('active');
      btnTop.classList.remove('active');
      renderV2PerformanceBars(results);
    };
  }

  if (searchInput) {
    searchInput.oninput = () => renderV2Table(results);
  }
}

// =====================================================================
// PRODUCTION MODE
// =====================================================================

let prodState = { step: 0, recipe: null, timer: null, seconds: 0 };

function showProductionMode(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId) || JSON.parse(localStorage.getItem('gourmet_saved_recipes') || '[]').find(r => r.id === recipeId);
  if (!recipe) return;
  prodState = { step: 0, recipe, timer: null, seconds: 0 };

  document.getElementById('productionModal').style.display = 'flex';
  document.getElementById('prodRecipeName').textContent = recipe.name;
  document.getElementById('prodTimerDisplay').textContent = '00:00:00';

  const ingList = document.getElementById('prodIngredientsList');
  ingList.innerHTML = (recipe.ingredients || []).map((ing, idx) => `
    <div class="prod-check-item">
      <input type="checkbox" id="p-ing-${idx}">
      <label for="p-ing-${idx}">${ing.quantity} ${ing.unit} ${ing.name}</label>
    </div>
  `).join('');

  renderProdSteps();
}

function renderProdSteps() {
  const container = document.getElementById('prodStepsContainer');
  const steps = prodState.recipe.steps || [];
  container.innerHTML = steps.map((s, idx) => `<div class="prod-step-slide" style="display: ${idx === prodState.step ? 'block' : 'none'}"><div class="prod-step-number">Etape ${idx + 1}</div><div class="prod-step-content">${s}</div></div>`).join('');
  document.getElementById('prodStepIndicator').textContent = `Étape ${prodState.step + 1} / ${steps.length}`;
  document.getElementById('btnPrevProdStep').disabled = prodState.step === 0;
  document.getElementById('btnNextProdStep').textContent = prodState.step === steps.length - 1 ? t('ui.btn.finish') || 'Terminer' : 'Suivant →';
}

function nextProdStep() {
  if (prodState.step < prodState.recipe.steps.length - 1) { prodState.step++; renderProdSteps(); } else { finishProduction(); }
}

function prevProdStep() { if (prodState.step > 0) { prodState.step--; renderProdSteps(); } }

function toggleProdTimer() {
  const btn = document.getElementById('btnProdTimer');
  if (prodState.timer) {
    clearInterval(prodState.timer); prodState.timer = null; btn.textContent = 'Démarrer';
  } else {
    prodState.timer = setInterval(() => {
      prodState.seconds++;
      const h = Math.floor(prodState.seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((prodState.seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (prodState.seconds % 60).toString().padStart(2, '0');
      document.getElementById('prodTimerDisplay').textContent = `${h}:${m}:${s}`;
    }, 1000);
    btn.textContent = 'Pause';
  }
}

function finishProduction() {
  prodState.recipe.ingredients.forEach(ing => {
    const inv = APP.inventory.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
    if (inv) inv.stock = Math.max(0, inv.stock - ing.quantity);
  });
  saveInventory();
  document.getElementById('productionModal').style.display = 'none';
  if (prodState.timer) clearInterval(prodState.timer);
  showToast("Production terminée, stocks mis à jour !");
}

function scanInvoiceReal(file) {
  if (!window.Tesseract) { showToast("Bibliothèque OCR non chargée."); return; }
  showToast("Scanning de la facture...", 3000);
  Tesseract.recognize(file, 'fra').then(({ data: { text } }) => {
    const keywords = ["Beurre", "Farine", "Sucre", "Chocolat", "Lait"];
    let count = 0;
    keywords.forEach(key => {
      const match = text.match(new RegExp(`${key}.*?(\\d+[,.]\\d{2})`, "i"));
      if (match) {
        const ing = APP.ingredientDb.find(i => i.name.toLowerCase().includes(key.toLowerCase()));
        if (ing) { ing.pricePerUnit = parseFloat(match[1].replace(',', '.')); count++; }
      }
    });
    if (count > 0) { saveIngredientDb(); showToast(`${count} prix mis à jour !`); } else { showToast("Aucun prix détecté."); }
  });
}

function hideProductionMode() {
  document.getElementById('productionModal').style.display = 'none';
  if (prodState.timer) { clearInterval(prodState.timer); prodState.timer = null; }
}

function showAddSupplierModal() {
  $('#editSupplierId').value = '';
  $('#supName').value = '';
  $('#supContact').value = '';
  $('#supEmail').value = '';
  $('#supCategory').value = 'Général';
  $('#supRating').value = '5';
  $('#supplierModalTitle').textContent = '📦 Ajouter un Fournisseur';
  $('#supplierModal').style.display = 'flex';
}

function closeSupplierModal() {
  $('#supplierModal').style.display = 'none';
}

function saveSupplier() {
  const id = $('#editSupplierId').value;
  const name = $('#supName').value.trim();
  const contact = $('#supContact').value.trim();
  const email = $('#supEmail').value.trim();
  const category = $('#supCategory').value;
  const rating = parseFloat($('#supRating').value) || 5;

  if (!name) {
    showToast("Le nom est obligatoire", "error");
    return;
  }

  if (id) {
    // Edit mode
    const s = APP.suppliers.find(sup => sup.id.toString() === id);
    if (s) {
      s.name = name;
      s.contact = contact;
      s.email = email;
      s.categories = [category];
      s.rating = rating;
    }
  } else {
    // Add mode
    APP.suppliers.push({
      id: Date.now(),
      name,
      contact,
      email,
      categories: [category],
      rating,
      leadTime: 3
    });
  }

  saveSuppliers();
  renderSuppliers();
  closeSupplierModal();
  showToast(id ? "Fournisseur mis à jour" : "Fournisseur ajouté", "success");
}

function editSupplier(id) {
  const s = APP.suppliers.find(sup => sup.id === id);
  if (!s) return;

  $('#editSupplierId').value = s.id;
  $('#supName').value = s.name;
  $('#supContact').value = s.contact || '';
  $('#supEmail').value = s.email || '';
  $('#supCategory').value = s.categories[0] || 'Général';
  $('#supRating').value = Math.round(s.rating || 5).toString();

  $('#supplierModalTitle').textContent = '✏️ Modifier ' + s.name;
  $('#supplierModal').style.display = 'flex';
}

function deleteSupplier(id) {
  if (!confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;
  APP.suppliers = APP.suppliers.filter(s => s.id !== id);
  saveSuppliers();
  renderSuppliers();
  showToast("Fournisseur supprimé", "info");
}

function loadNotifications() {
  const user = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!user) return;
  const allNotifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
  APP.notifications = allNotifs[user.toLowerCase()] || [];
  renderNotifications();
}

function saveNotifications() {
  const user = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!user) return;
  const allNotifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
  allNotifs[user.toLowerCase()] = APP.notifications;
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(allNotifs));
}

function addNotification(targetUser, notif) {
  const allNotifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
  const userKey = targetUser.toLowerCase();
  if (!allNotifs[userKey]) allNotifs[userKey] = [];
  allNotifs[userKey].push(notif);
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(allNotifs));

  if (targetUser.toLowerCase() === localStorage.getItem(STORAGE_KEYS.currentUser)?.toLowerCase()) {
    APP.notifications.push(notif);
    renderNotifications();
  }
}

function renderNotifications() {
  const badge = $('#notifBadge');
  const list = $('#notifList');
  const area = $('#notificationArea');
  if (!area) return;

  const unreadCount = APP.notifications.filter(n => !n.read).length;
  if (unreadCount > 0) {
    badge.style.display = 'block';
    badge.textContent = unreadCount;
    area.style.display = 'block';
  } else {
    badge.style.display = 'none';
    area.style.display = 'block'; // Always show bell if logged in
  }

  if (APP.notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty">Aucune nouvelle notification</div>';
  } else {
    list.innerHTML = [...APP.notifications].reverse().map(n => {
      let msg = '';
      if (n.type === 'leave_request') msg = t('plan.notif.leave_req', { from: capitalizeFirstLetter(n.from), name: capitalizeFirstLetter(n.memberName) });
      if (n.type === 'invite') msg = t('plan.notif.invite', { from: capitalizeFirstLetter(n.from) });

      let actions = '';
      if (n.type === 'invite' && n.status === 'pending') {
        actions = `
          <div style="display:flex; gap:0.5rem; margin-top:0.5rem;" onclick="event.stopPropagation()">
            <button onclick="acceptInvite('${n.id}')" class="btn btn-sm btn-accent" style="padding:2px 8px; font-size:0.75rem; border-radius:4px;">${t('plan.btn.approve').split(' ')[0]}</button>
            <button onclick="rejectInvite('${n.id}')" class="btn btn-sm btn-outline" style="padding:2px 8px; font-size:0.75rem; border-radius:4px; color:var(--danger); border-color:var(--danger);">${t('plan.btn.reject').split(' ')[0]}</button>
          </div>
        `;
      }

      return `
        <div class="notif-item ${n.read ? 'read' : 'unread'}" onclick="handleNotifClick('${n.id}')">
          <div style="font-size:0.8rem; margin-bottom:0.3rem;">${msg}</div>
          ${actions}
          <div style="font-size:0.7rem; color:var(--text-muted); opacity:0.7; margin-top:0.3rem;">${new Date(n.timestamp).toLocaleString('fr-FR')}</div>
        </div>
      `;
    }).join('');
  }
}

function handleNotifClick(id) {
  const notif = APP.notifications.find(n => n.id === id);
  if (!notif) return;
  notif.read = true;
  saveNotifications();
  renderNotifications();

  if (notif.type === 'leave_request') {
    document.getElementById('navHub').click(); // Show on dashboard
  } else if (notif.type === 'invite' && notif.status === 'accepted') {
    // Already shared, just inform
    showToast(t('plan.toast.invited', { name: notif.from }), 'info');
  }
}

function acceptInvite(id) {
  const notif = APP.notifications.find(n => n.id === id);
  if (!notif) return;

  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const owner = notif.from;
  const ownerKey = owner.toLowerCase();

  // 1. Update shared list (Owner grants access to Invited User)
  const shared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
  if (!shared[ownerKey]) shared[ownerKey] = [];
  if (!shared[ownerKey].includes(currentUser.toLowerCase())) {
    shared[ownerKey].push(currentUser.toLowerCase());
  }
  localStorage.setItem(STORAGE_KEYS.sharedPlannings, JSON.stringify(shared));

  // 2. Synchronize Team (Invited User becomes member of Owner's team)
  const teamKey = `${STORAGE_KEYS.teamMembers}_${ownerKey}`;
  let ownerTeam = JSON.parse(localStorage.getItem(teamKey) || '[]');

  // Ensure owner is Chef in their own team
  let ownerInTeam = ownerTeam.find(m => m.name.toLowerCase() === ownerKey);
  if (!ownerInTeam) {
    ownerTeam.push({ id: 'owner_' + Date.now(), name: owner, role: 'Chef de Labo', colorIdx: 0 });
  }

  // Add guest to owner's team
  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const guestData = usersDb[currentUser.toLowerCase()];
  const isFemale = guestData?.gender === 'female';
  const alreadyInTeam = ownerTeam.find(m => m.name.toLowerCase() === currentUser.toLowerCase());

  if (!alreadyInTeam) {
    ownerTeam.push({
      id: 'member_' + Date.now(),
      name: currentUser,
      role: isFemale ? 'Apprentie' : 'Apprenti',
      colorIdx: ownerTeam.length
    });
  }
  localStorage.setItem(teamKey, JSON.stringify(ownerTeam));

  // 3. Update Notif Status
  notif.status = 'accepted';
  notif.read = true;
  saveNotifications();
  renderNotifications();

  // 4. Global Refresh
  renderInvitations();
  if (APP.viewOwner === owner) {
    loadTeamMembers();
    renderTeam();
  }

  showToast(t('plan.toast.invited', { name: owner }), 'success');
}

function rejectInvite(id) {
  const notif = APP.notifications.find(n => n.id === id);
  if (!notif) return;
  notif.status = 'rejected';
  notif.read = true;
  saveNotifications();
  renderNotifications();
  showToast("Invitation refusée", 'info');
}

function inviteUserToPlanning() {
  const username = $('#inviteUser').value.trim();
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!username) return;

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  if (!usersDb[username.toLowerCase()]) {
    showToast(t('plan.toast.user_not_found'), 'error');
    return;
  }

  // 1. Send Notification (Invite only, actual sharing happens on acceptance)
  addNotification(username, {
    id: 'inv_' + Date.now(),
    type: 'invite',
    from: currentUser,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });

  showToast(t('plan.toast.invite_sent', { name: username }), 'success');
  $('#inviteUser').value = '';
  $('#inviteAutocomplete').style.display = 'none';
}

function handleInviteAutocomplete() {
  const input = $('#inviteUser');
  const dropdown = $('#inviteAutocomplete');
  const query = input.value.trim().toLowerCase();

  if (query.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const matches = Object.keys(usersDb).filter(u => u.startsWith(query));

  if (matches.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  dropdown.style.display = 'block';
  dropdown.innerHTML = matches.map(m => `
    <div class="ac-suggestion" onclick="selectInviteUser('${m}')">
      <span class="avatar-mini">👨‍🍳</span>
      <span>${capitalizeFirstLetter(m)}</span>
    </div>
  `).join('');
}

function selectInviteUser(user) {
  $('#inviteUser').value = user;
  $('#inviteAutocomplete').style.display = 'none';
  inviteUserToPlanning();
}

function renderSharedList() {
  const container = $('#sharedWithList');
  if (!container) return;
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const shared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
  const list = shared[currentUser?.toLowerCase()] || [];

  if (list.length === 0) {
    container.innerHTML = '';
    return;
  }

  const owner = currentUser?.toLowerCase();
  const teamName = localStorage.getItem(`gourmet_team_name_${owner}`) || t('plan.shared.co_founder');

  container.innerHTML = `<div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.5rem;">${teamName}</div>` +
    list.map(u => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-alt); padding:0.5rem; border-radius:var(--radius-sm); margin-bottom:0.3rem;">
        <span style="font-size:0.85rem; font-weight:600;">@${capitalizeFirstLetter(u)}</span>
        <button onclick="removeShare('${u}')" style="color:var(--danger); font-size:0.8rem;">✕</button>
      </div>
    `).join('');
}

function removeShare(user) {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const shared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
  const ownerKey = currentUser.toLowerCase();

  // 1. Remove from share list
  shared[ownerKey] = shared[ownerKey].filter(u => u !== user.toLowerCase());
  localStorage.setItem(STORAGE_KEYS.sharedPlannings, JSON.stringify(shared));

  // 2. Remove from team members too
  const teamKey = `${STORAGE_KEYS.teamMembers}_${ownerKey}`;
  let team = JSON.parse(localStorage.getItem(teamKey) || '[]');
  team = team.filter(m => m.name.toLowerCase() !== user.toLowerCase());
  localStorage.setItem(teamKey, JSON.stringify(team));

  renderSharedList();
  loadTeamMembers();
  renderTeam();
  showToast(t('plan.shared.access_removed', { name: user }), 'info');
}

function renderInvitations() {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!currentUser) return;

  const allShared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
  const invitedTo = [];

  for (const owner in allShared) {
    if (owner.toLowerCase() !== currentUser.toLowerCase() && allShared[owner].includes(currentUser.toLowerCase())) {
      invitedTo.push(owner);
    }
  }

  const selector = $('#planningOwnerSelector');
  if (!selector) return;

  // Clear existing options except the first one (Mon Planning)
  while (selector.options.length > 1) {
    selector.remove(1);
  }

  invitedTo.forEach(owner => {
    const teamName = localStorage.getItem(`gourmet_team_name_${owner.toLowerCase()}`) || owner;
    const option = document.createElement('option');
    option.value = owner;
    option.textContent = teamName;
    selector.appendChild(option);
  });

  // Show dropdown only if > 2 plannings (Mine + 2+ others)
  const wrap = $('.planning-selector-wrap');
  if (wrap) {
    wrap.style.display = (invitedTo.length >= 2) ? 'block' : 'none';
  }

  // Default to first invitation if available and not already viewing someone
  if (invitedTo.length > 0 && !APP.viewOwner) {
    APP.viewOwner = invitedTo[0];
    loadTeamMembers();
    renderTeam();
    renderLeaves();
  }

  // Sync selector value
  if (APP.viewOwner && APP.viewOwner !== currentUser) {
    selector.value = APP.viewOwner;
  } else {
    selector.value = 'current';
  }
}

function switchPlanningView(owner) {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (owner === 'current' || owner === currentUser) {
    APP.viewOwner = currentUser;
    showToast(t('plan.selector.personal'), 'info');
  } else {
    APP.viewOwner = owner;
    const teamName = localStorage.getItem(`gourmet_team_name_${owner.toLowerCase()}`) || owner;
    showToast(t('plan.shared.viewing', { name: teamName }), 'info');
  }

  loadTeamMembers();
  renderTeam();
  renderLeaves();
  renderAnnualCalendar();
}

function addTeamMember() {
  const nameInput = $('#memberName');
  const roleInput = $('#memberRole');
  const name = nameInput.value.trim();
  const role = roleInput.value;

  if (!name) {
    showToast(t('auth.error.empty'), 'error');
    return;
  }

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const targetUserData = usersDb[name.toLowerCase()];
  if (!targetUserData) {
    showToast(t('plan.team.not_found', { name }), 'error');
    return;
  }

  // Check if already in team
  if (APP.teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase())) {
    showToast(t('plan.team.already_in', { name }), 'info');
    return;
  }

  // Define gender for the helper
  const isFemale = targetUserData.gender === 'female';

  // Use profile role if specified, otherwise use role input
  let roleToProcess = targetUserData.role || role;

  // Force 'Chef de Labo' if it's the very first member added to the team
  if (APP.teamMembers.length === 0) {
    roleToProcess = 'Chef de Labo';
  }

  // Use the new gender-sensitive role helper
  const finalRole = getGenderedRole(roleToProcess, isFemale);

  const nextColorIdx = APP.teamMembers.length > 0
    ? (Math.max(...APP.teamMembers.map(m => m.colorIdx || 0)) + 1)
    : 0;

  APP.teamMembers.push({
    id: Date.now().toString(),
    name,
    role: finalRole,
    colorIdx: nextColorIdx
  });

  saveTeamMembers();
  renderTeam();
  nameInput.value = '';
  $('#memberAutocomplete').style.display = 'none';
  showToast(t('plan.team.added', { name }), 'success');
}

function handleMemberAutocomplete() {
  const input = $('#memberName');
  const dropdown = $('#memberAutocomplete');
  const query = input.value.trim().toLowerCase();

  if (query.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const matches = Object.keys(usersDb).filter(u => u.startsWith(query));

  if (matches.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  dropdown.style.display = 'block';
  dropdown.innerHTML = matches.map(m => `
    <div class="ac-suggestion" onclick="selectMemberUser('${m}')">
      <span class="avatar-mini">👨‍🍳</span>
      <span>${capitalizeFirstLetter(m)}</span>
    </div>
  `).join('');
}

function selectMemberUser(user) {
  $('#memberName').value = user;
  $('#memberAutocomplete').style.display = 'none';
  addTeamMember();
}

function removeTeamMember(id) {
  if (!confirm(t('plan.team.confirm_remove'))) return;
  APP.teamMembers = APP.teamMembers.filter(m => m.id !== id);
  saveTeamMembers();
  renderTeam();
  showToast(t('plan.team.removed'), 'info');
}

function editMemberRole(id) {
  const member = APP.teamMembers.find(m => m.id === id);
  if (!member) return;

  const modal = $('#roleModal');
  const nameEl = $('#roleModalMemberName');
  const select = $('#roleSelect');

  nameEl.textContent = capitalizeFirstLetter(member.name);
  select.value = member.role; // This will only work if current role matches one of the options

  // Store the member ID in the save button for later retrieval
  $('#btnSaveRole').onclick = () => confirmRoleUpdate(id);

  modal.style.display = 'flex';
}

function confirmRoleUpdate(id) {
  const member = APP.teamMembers.find(m => m.id === id);
  if (!member) return;

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const targetUserData = usersDb[member.name.toLowerCase()];
  const isFemale = targetUserData?.gender === 'female';

  const select = $('#roleSelect');
  member.role = getGenderedRole(select.value, isFemale);

  saveTeamMembers();
  renderTeam();
  closeRoleModal();
  showToast(t('plan.team.role_updated', { role: member.role }), 'success');
}

function closeRoleModal() {
  $('#roleModal').style.display = 'none';
}

function renderAnnualCalendar() {
  const container = $('#annualCalendarView');
  if (!container || container.offsetParent === null) return; // Lazy render

  const currentZone = localStorage.getItem(STORAGE_KEYS.vacationZone) || 'C';
  const holidays = HOLIDAYS_2026[currentZone] || HOLIDAYS_2026.C;

  // OPTIMIZATION: Maps for O(1) lookups
  const leavesMap = new Map();
  (APP.staffLeaves || []).forEach(l => {
    if (l.status !== 'approved') return;
    const start = new Date(l.start);
    const end = new Date(l.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      leavesMap.set(d.toISOString().split('T')[0], l.memberName);
    }
  });

  const hMap = new Map();
  holidays.forEach(h => {
    const start = new Date(h.start);
    const end = new Date(h.end);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      hMap.set(d.toISOString().split('T')[0], h.label);
    }
  });

  const monthNames = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(m => t('month.' + m));
  const dayNames = [1, 2, 3, 4, 5, 6, 7].map(d => t('day.' + d));
  const currentYear = 2026;
  let html = '';

  for (let month = 0; month < 12; month++) {
    const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
    html += `<div class="month-view"><h4 class="month-title">${monthNames[month]}</h4><div class="days-grid">`;

    for (let day = 1; day <= 31; day++) {
      if (day > daysInMonth) { html += `<div class="day-cell empty"></div>`; continue; }

      const date = new Date(currentYear, month, day);
      const dateStr = date.toISOString().split('T')[0];
      const mmDd = dateStr.slice(5); // "MM-DD"
      const dayNum = date.getDay();
      const classes = ['day-cell'];
      let toolTip = `${day} ${monthNames[month]}`;

      if (dayNum === 0 || dayNum === 6) classes.push('sunday-day');
      if (PASTRY_EVENTS_2026[mmDd]) {
        classes.push('event-day');
        toolTip += ` - 🔥 ${getTranslatedEvent(mmDd)}`;
      }
      if (hMap.has(dateStr)) {
        classes.push('holiday-day');
        toolTip += ` - 🏖️ ${getTranslatedHoliday(hMap.get(dateStr))}`;
      }
      if (leavesMap.has(dateStr)) {
        classes.push('leave-active-day');
        toolTip += ` - 🌴 ${t('plan.leave.employee')}: ${leavesMap.get(dateStr)}`;
      }

      html += `<div class="${classes.join(' ')}" title="${toolTip}">${day}</div>`;
    }
    html += `</div></div>`;
  }
  container.innerHTML = html;
}

function renderAdminUsers() {
  const container = $('#adminUserList');
  if (!container) return;

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const userKeys = Object.keys(usersDb);

  if (userKeys.length === 0) {
    container.innerHTML = `<tr><td colspan="5" style="padding:1rem; text-align:center;">${t('admin.col.user') === 'User' ? 'No registered users.' : (t('admin.col.user') === 'Usuario' ? 'No hay usuarios registrados.' : 'Aucun utilisateur enregistré.')}</td></tr>`;
    return;
  }

  container.innerHTML = userKeys.map(key => {
    const u = usersDb[key];
    const isPinSet = u.pin && u.pin !== '0000';
    const isAdmin = u.isAdmin || key.toLowerCase() === 'ju';
    const isBanned = u.isBanned || false;

    return `
      <tr style="border-bottom:1px solid var(--surface-border); ${isBanned ? 'opacity:0.6; background:rgba(254,226,226,0.3);' : ''}">
        <td style="padding:1rem; font-weight:600;">
          ${escapeHtml(key)}
          ${isAdmin ? '<span style="margin-left:5px; font-size:0.65rem; background:var(--primary); color:white; padding:1px 4px; border-radius:3px;">ADMIN</span>' : ''}
          ${isBanned ? '<span style="margin-left:5px; font-size:0.65rem; background:var(--danger); color:white; padding:1px 4px; border-radius:3px;">BAN</span>' : ''}
        </td>
        <td style="padding:1rem;">${escapeHtml(u.email || '—')}</td>
        <td style="padding:1rem;">${u.gender === 'female' ? t('auth.gender.female') : t('auth.gender.male')}</td>
        <td style="padding:1rem;">
          <span style="padding:0.25rem 0.5rem; border-radius:4px; font-size:0.75rem; background:${isPinSet ? '#dcfce7' : '#fee2e2'}; color:${isPinSet ? '#166534' : '#b91c1c'};">
            ${isPinSet ? (t('admin.col.user') === 'User' ? 'PIN Set' : (t('admin.col.user') === 'Usuario' ? 'PIN Definido' : 'PIN Défini')) : (t('admin.col.user') === 'User' ? 'Default PIN' : (t('admin.col.user') === 'Usuario' ? 'PIN Por defecto' : 'PIN Par défaut'))}
          </span>
        </td>
        <td style="padding:1rem; text-align:right; display:flex; gap:0.5rem; justify-content:flex-end;">
          <button class="btn btn-sm btn-outline" onclick="openAdminModeration('${key}')">🛡️ ${t('nav.admin') === 'Admin' ? 'Moderate' : (t('nav.admin') === 'Admin' ? 'Moderar' : 'Modérer')}</button>
          ${key.toLowerCase() !== 'ju' ?
        `<button class="btn btn-sm btn-outline" style="color:var(--danger); border-color:var(--danger);" onclick="deleteUser('${key}')">🗑️</button>` :
        '<small style="color:var(--text-muted); padding:0 0.5rem;">Admin</small>'}
        </td>
      </tr>
    `;
  }).join('');
}

let selectedModerationUser = null;

function openAdminModeration(user) {
  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const u = usersDb[user.toLowerCase()];
  if (!u) return;

  selectedModerationUser = user;
  const isAdmin = u.isAdmin || user.toLowerCase() === 'ju';
  const isBanned = u.isBanned || false;

  $('#adminUserDetail').innerHTML = `
    <div style="background:var(--bg-alt); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--surface-border);">
      <div style="font-weight:700; font-size:1.1rem; margin-bottom:0.5rem;">${escapeHtml(user)}</div>
      <div style="display:grid; grid-template-columns:auto 1fr; gap:0.5rem 1rem; font-size:0.9rem;">
        <span style="color:var(--text-muted);">Email:</span> <b>${escapeHtml(u.email || 'Non renseigné')}</b>
        <span style="color:var(--text-muted);">Code PIN:</span> <b style="letter-spacing:2px; color:var(--accent);">${u.pin}</b>
        <span style="color:var(--text-muted);">Genre:</span> <b>${u.gender === 'female' ? 'Femme' : 'Homme'}</b>
      </div>
    </div>
  `;

  const btnAdmin = $('#btnAdminToggle');
  const btnBan = $('#btnBanToggle');

  btnAdmin.textContent = isAdmin ? '🛡️ Retirer Admin' : '🛡️ Rendre Admin';
  btnAdmin.style.background = isAdmin ? 'var(--primary-glow)' : 'transparent';
  btnAdmin.disabled = user.toLowerCase() === 'ju'; // Cannot demote 'Ju'

  btnBan.textContent = isBanned ? '✅ Débannir' : '🚫 Bannir';
  btnBan.style.background = isBanned ? 'rgba(34,197,94,0.1)' : 'transparent';
  btnBan.style.color = isBanned ? 'var(--success)' : 'var(--danger)';
  btnBan.style.borderColor = isBanned ? 'var(--success)' : 'var(--danger)';
  btnBan.disabled = user.toLowerCase() === 'ju'; // Cannot ban 'Ju'

  $('#btnDeleteUserModal').style.display = user.toLowerCase() === 'ju' ? 'none' : 'block';

  $('#adminUserModal').style.display = 'flex';
}

function toggleAdminStatus() {
  if (!selectedModerationUser) return;
  const userKey = selectedModerationUser.toLowerCase();
  let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');

  usersDb[userKey].isAdmin = !usersDb[userKey].isAdmin;
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb));

  openAdminModeration(selectedModerationUser);
  renderAdminUsers();
  showToast(t('admin.status.admin_updated', { name: selectedModerationUser }), 'info');
}

function toggleBanStatus() {
  if (!selectedModerationUser) return;
  const userKey = selectedModerationUser.toLowerCase();
  let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');

  usersDb[userKey].isBanned = !usersDb[userKey].isBanned;
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb));

  openAdminModeration(selectedModerationUser);
  renderAdminUsers();
  const statusMsg = usersDb[userKey].isBanned ? t('admin.status.banned', { name: selectedModerationUser }) : t('admin.status.unbanned', { name: selectedModerationUser });
  showToast(statusMsg, 'info');
}

function deleteUser(user) {
  const userKey = user.toLowerCase();

  if (confirm(t('admin.confirm.delete_user', { name: user }))) {
    // 1. Remove from database
    let usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
    delete usersDb[userKey];
    localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb));

    // 2. Remove user specific data
    localStorage.removeItem(`gourmetrevient_recipes_${userKey}`);
    localStorage.removeItem(`gourmet_team_members_${userKey}`);
    localStorage.removeItem(`gourmet_staff_leaves_${userKey}`);
    localStorage.removeItem(`gourmet_lab_plan_${userKey}`);
    localStorage.removeItem(`labpatiss_config_${userKey}`);
    localStorage.removeItem(`labpatiss_placements_${userKey}`);

    // If deleting the current user (theoretically possible if admin deletes itself, but we blocked it)
    if (localStorage.getItem(STORAGE_KEYS.currentUser)?.toLowerCase() === userKey) {
      localStorage.removeItem('gourmet_auth');
      localStorage.removeItem(STORAGE_KEYS.currentUser);
      location.reload();
    } else {
      renderAdminUsers();
      showToast(t('admin.user.deleted', { name: user }), 'info');
    }
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  checkAuth();
  loadIngredientDb();
  loadSavedRecipes();
  loadTeamMembers();
  loadInventory();
  loadNotifications();
  loadSuppliers();
  loadWasteLogs();
  bindEvents();
  renderSavedRecipes();
  renderInvitations();

  // Start at hero screen
  goToStep(0);
  renderLibraryRecipes();
  updateRandomTip();
  if (typeof showHub === 'function') showHub();

  // Optimized Dashboard Update
  const throttledDashboard = throttle(updateDashboard, 500);
  window.updateDashboardThrottled = throttledDashboard;

  // Listen for language changes - optimized to only re-render visible components
  document.addEventListener('languageChanged', (e) => {
    if (APP.currentStep >= 1 && APP.currentStep <= 3) collectCurrentStepData();

    const isVisible = (selector) => {
      const el = document.querySelector(selector);
      return el && el.offsetParent !== null;
    };

    updateRandomTip();
    updateDashboard();

    if (APP.currentStep === 2) renderIngredients();
    if (APP.currentStep === 3) renderProcedure();
    if (APP.currentStep === 4) renderCostAnalysis();
    if (APP.currentStep === 5) renderSummary();

    if (typeof renderLibraryRecipes === 'function') renderLibraryRecipes();
    if (typeof renderSavedRecipes === 'function') renderSavedRecipes();

    if (isVisible('#appPlanning')) {
      renderTeam();
      renderLeaves();
      renderAnnualCalendar();
      if (typeof updateVacationZone === 'function') updateVacationZone();
    }
    if (isVisible('#appLaboratoire') && typeof renderDevis === 'function') renderDevis();
    if (isVisible('#appInventaire')) renderInventory();
    if (isVisible('#appHygiene') && typeof renderHygiene === 'function') renderHygiene();
    if (isVisible('#appSuppliers')) renderSuppliers();
    if (isVisible('#appStats')) renderStats();
    if (isVisible('#appMgmt')) {
      if (typeof renderAllergenMatrix === 'function') renderAllergenMatrix();
      if (typeof renderWasteAnalysis === 'function') renderWasteAnalysis();
    }
  });

  loadHaccpLogs();
  renderHygiene();
}

document.addEventListener('DOMContentLoaded', init);

// Capitalization helper
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ============================================================================ */
/* LABELING & ALLERGEN TRACKING                                                */
/* ============================================================================ */

let selectedLabelRecipe = null;

function showLabelingDropdown() {
  const userRecipes = (APP.savedRecipes || []).map(r => ({ ...r, origin: 'user' }));
  const defaultRecipes = (typeof RECIPES !== 'undefined' ? RECIPES : []).map(r => ({ ...r, origin: 'default' }));
  const recipes = [...userRecipes, ...defaultRecipes];

  const dropdown = $('#labelingRecipeDropdown');
  if (!dropdown) return;

  if (recipes.length === 0) {
    dropdown.innerHTML = `<div class="autocomplete-item disabled">${t('recipe.lib.empty')}</div>`;
  } else {
    dropdown.innerHTML = recipes.map(r => `
      <div class="autocomplete-item" onclick="selectLabelingRecipe('${r.id}', '${r.origin}')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
          <div>
            <strong>${escapeHtml(r.name)}</strong>
            <small style="display: block;">${r.category || ''}</small>
          </div>
          <span class="badge" style="font-size: 0.65rem; padding: 2px 6px; background: ${r.origin === 'user' ? 'var(--primary-light)' : 'var(--bg-alt)'}; color: ${r.origin === 'user' ? 'var(--primary)' : 'var(--text-muted)'};">
            ${r.origin === 'user' ? 'Mien' : 'Site'}
          </span>
        </div>
      </div>
    `).join('');
  }
  dropdown.style.display = 'block';

  // Close dropdown when clicking outside
  const closeHandler = (e) => {
    if (!e.target.closest('#labelingSearchInput') && !e.target.closest('#labelingRecipeDropdown')) {
      dropdown.style.display = 'none';
      document.removeEventListener('click', closeHandler);
    }
  };
  document.addEventListener('click', closeHandler);
}

function filterLabelingRecipes() {
  const val = $('#labelingSearchInput').value.toLowerCase();
  const dropdown = $('#labelingRecipeDropdown');
  const items = dropdown.querySelectorAll('.autocomplete-item');

  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(val) ? 'flex' : 'none';
  });
}

function selectLabelingRecipe(id, origin) {
  if (origin === 'user') {
    selectedLabelRecipe = APP.savedRecipes.find(r => r.id === id);
  } else {
    const list = typeof RECIPES !== 'undefined' ? RECIPES : [];
    selectedLabelRecipe = list.find(r => r.id === id);
  }

  if (!selectedLabelRecipe) return;

  $('#labelingSearchInput').value = selectedLabelRecipe.name;
  $('#labelingRecipeDropdown').style.display = 'none';

  // Enable form fields
  $('#labelingFields').style.opacity = '1';
  $('#labelingFields').style.pointerEvents = 'auto';

  // Auto-fill some data
  const costs = calcFullCost(APP.margin, selectedLabelRecipe);
  $('#labelPrice').value = costs.sellingPrice;

  let totalWeight = selectedLabelRecipe.advanced?.weight || 0;
  if (!totalWeight) {
    totalWeight = selectedLabelRecipe.ingredients.reduce((sum, ing) => {
      return sum + (ing.unit === 'g' || ing.unit === 'ml' ? parseFloat(ing.quantity) || 0 : 0);
    }, 0);
    const portions = selectedLabelRecipe.portions || 10;
    totalWeight = Math.round(totalWeight / portions);
  }
  $('#labelWeight').value = totalWeight;

  // Dates
  const today = new Date().toISOString().split('T')[0];
  $('#labelFabDate').value = today;

  // Exp info: default 3 days for fresh pastries
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + 3);
  $('#labelExpDate').value = expDate.toISOString().split('T')[0];

  $('#labelStorage').value = t('labeling.form.storage_ph') || 'À conserver entre 0°C et +4°C';

  updateLabelPreview();
}

function updateLabelPreview() {
  if (!selectedLabelRecipe) return;

  $('#prevRecipeName').textContent = selectedLabelRecipe.name.toUpperCase();
  $('#prevProducer').textContent = t('labeling.producer') || 'ARTISAN PÂTISSIER';

  // Ingredients list (comma separated)
  const ings = selectedLabelRecipe.ingredients.map(ing => {
    const translatedName = t(ing.name);
    return translatedName;
  }).join(', ');
  $('#prevIngredients').textContent = ings + '.';

  // Allergen tracking
  const allergenSet = new Set();
  selectedLabelRecipe.ingredients.forEach(ing => {
    let dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
    if (dbItem && dbItem.allergens && dbItem.allergens.length > 0) {
      dbItem.allergens.forEach(a => allergenSet.add(a));
    } else {
      // Let's try to find it in DEFAULT_INGREDIENT_DB directly just in case local db lacks allergens
      let defItem = DEFAULT_INGREDIENT_DB.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
      if (defItem && defItem.allergens) {
        defItem.allergens.forEach(a => allergenSet.add(a));
      } else {
        // Try reverse lookup if it's a French name
        const key = REVERSE_LOOKUP[ing.name.toLowerCase()] || REVERSE_LOOKUP[ing.name];
        if (key) {
          let item = APP.ingredientDb.find(db => db.name === t(key));
          if (item && item.allergens && item.allergens.length > 0) {
            item.allergens.forEach(a => allergenSet.add(a));
          } else {
            let defItem2 = DEFAULT_INGREDIENT_DB.find(db => db.name === t(key) || db.name.toLowerCase() === ing.name.toLowerCase());
            if (defItem2 && defItem2.allergens) defItem2.allergens.forEach(a => allergenSet.add(a));
          }
        }
      }
    }
  });

  const allergenList = Array.from(allergenSet);
  const prevAllergens = $('#prevAllergens');
  if (allergenList.length > 0) {
    prevAllergens.textContent = allergenList.join(', ');
  } else {
    prevAllergens.textContent = t('labeling.preview.no_allergens') || 'Aucun';
  }

  // Form fields
  $('#prevWeight').textContent = $('#labelWeight').value || '0';
  $('#prevPrice').textContent = (parseFloat($('#labelPrice').value) || 0).toFixed(2) + ' €';

  const fabDate = $('#labelFabDate').value;
  $('#prevFabDate').textContent = fabDate ? new Date(fabDate).toLocaleDateString() : '--/--/----';

  const expDate = $('#labelExpDate').value;
  $('#prevExpDate').textContent = expDate ? new Date(expDate).toLocaleDateString() : '--/--/----';

  $('#prevStorage').textContent = $('#labelStorage').value;

  if (typeof renderLabelingStats === 'function') renderLabelingStats();
}

function printLabel() {
  if (!selectedLabelRecipe) {
    showToast(t('labeling.toast.no_recipe'), 'warning');
    return;
  }

  // Add class to body for print styles
  document.body.classList.add('printing-label');
  window.print();

  // Clean up
  setTimeout(() => {
    document.body.classList.remove('printing-label');
  }, 100);
}

function downloadLabelImage() {
  if (!selectedLabelRecipe) {
    showToast(t('labeling.toast.no_recipe'), 'warning');
    return;
  }

  if (typeof html2pdf === 'undefined') {
    showToast('Bibliothèque html2pdf non chargée', 'error');
    return;
  }

  const element = document.getElementById('labelCaptureArea');
  const opt = {
    margin: [0, 0],
    filename: `Etiquette_${selectedLabelRecipe.name.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, logging: false },
    jsPDF: { unit: 'mm', format: [100, 100], orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
  showToast(t('labeling.toast.print_success'), 'success');
}

function renderLabelingStats() {
  const total = APP.savedRecipes.length;
  $('#labTotalRecipes').textContent = total;

  if (selectedLabelRecipe) {
    const allergenSet = new Set();
    selectedLabelRecipe.ingredients.forEach(ing => {
      let dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
      if (dbItem && dbItem.allergens && dbItem.allergens.length > 0) {
        dbItem.allergens.forEach(a => allergenSet.add(a));
      } else {
        let defItem = DEFAULT_INGREDIENT_DB.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
        if (defItem && defItem.allergens) {
          defItem.allergens.forEach(a => allergenSet.add(a));
        } else {
          const key = REVERSE_LOOKUP[ing.name.toLowerCase()] || REVERSE_LOOKUP[ing.name];
          if (key) {
            let item = APP.ingredientDb.find(db => db.name === t(key));
            if (item && item.allergens && item.allergens.length > 0) {
              item.allergens.forEach(a => allergenSet.add(a));
            } else {
              let defItem2 = DEFAULT_INGREDIENT_DB.find(db => db.name === t(key) || db.name.toLowerCase() === ing.name.toLowerCase());
              if (defItem2 && defItem2.allergens) defItem2.allergens.forEach(a => allergenSet.add(a));
            }
          }
        }
      }
    });
    $('#labAllergenCount').textContent = allergenSet.size;

    const box = $('#labAllergenStatusBox');
    if (allergenSet.size > 0) {
      box.classList.add('warning');
      box.classList.remove('success');
    } else {
      box.classList.remove('warning');
      box.classList.add('success');
    }
  } else {
    $('#labAllergenCount').textContent = '0';
    $('#labAllergenStatusBox').classList.remove('warning', 'success');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
// MODULAR EXTENSIONS — ROADMAP ENHANCEMENTS
// ============================================================================

// 1. PRODUCTION & STOCK SYNC
function confirmProduction() {
  const portionsInput = document.getElementById('prodPortions');
  const portions = portionsInput ? (parseInt(portionsInput.value) || 0) : 0;
  if (portions <= 0) {
    if (typeof showToast === 'function') showToast('Quantité invalide', 'error');
    return;
  }

  const recipe = APP.recipe;
  const originalPortions = recipe.portions || 10;
  const ratio = portions / originalPortions;

  const deductions = [];
  const unknown = [];

  recipe.ingredients.forEach(ing => {
    if (!ing.name || ing.quantity <= 0) return;
    const needed = ing.quantity * ratio;

    // Find in inventory (exact match)
    let invItem = APP.inventory.find(i => i.name.toLowerCase() === ing.name.toLowerCase());

    if (invItem) {
      deductions.push({ item: invItem, needed });
    } else {
      unknown.push(ing.name);
    }
  });

  if (unknown.length > 0) {
    const proceed = confirm(`Certains ingrédients (${unknown.join(', ')}) ne sont pas dans votre inventaire. Continuer quand même ?`);
    if (!proceed) return;
  }

  // Apply deductions
  let lowStockList = [];
  deductions.forEach(d => {
    d.item.stock = Math.round((Math.max(0, d.item.stock - d.needed)) * 100) / 100;
    if (d.item.stock <= d.item.alertThreshold) {
      lowStockList.push(d.item.name);
    }
  });

  // Save changes
  saveInventory();
  renderInventory();
  updateDashboard();

  // Record Traceability Entry (Module 3)
  const lotNumber = 'L' + new Date().getFullYear().toString().slice(-2) +
    (Math.floor(Date.now() / 1000) % 100000).toString().padStart(5, '0');

  const traceEntry = {
    id: 'tr_' + Date.now(),
    lot: lotNumber,
    product: recipe.name || 'Produit Inconnu',
    date: new Date().toISOString(),
    exp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default +3 days
    qty: portions + ' ' + (typeof t === 'function' ? t('unit.portions') : 'portions')
  };

  if (!APP.haccpLogs.trace) APP.haccpLogs.trace = [];
  APP.haccpLogs.trace.unshift(traceEntry);
  saveHaccpLogs();

  if (typeof showToast === 'function') {
    showToast(typeof t === 'function' ? t('ui.prod.success') : 'Production validée et stocks mis à jour.', 'success');
  }
}

// 2. SCAN FACTURE (Simulated IA)
function simulateInvoiceScan() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (typeof showToast === 'function') showToast('Scan de la facture en cours (IA)...', 'info');
      // Simulated AI Processing Delay
      setTimeout(() => {
        // We find a few ingredients to update "randomly" to simulate reading prices
        const toUpdate = APP.inventory.slice(0, 3);
        if (toUpdate.length === 0) return showToast('Inventaire vide, rien à mettre à jour.', 'warning');

        toUpdate.forEach(item => {
          const oldPrice = item.price || 1;
          const fluctuation = (Math.random() * 0.2) - 0.05; // -5% to +15%
          item.price = Math.round((oldPrice * (1 + fluctuation)) * 100) / 100;
        });

        saveInventory();
        renderInventory();
        showToast(`Scan terminé ! ${toUpdate.length} prix mis à jour automatiquement via IA.`, 'success');
      }, 3000);
    }
  };
  input.click();
}

// 3. HYGIÈNE & HACCP LOGIC
function saveHaccpLogs() {
  localStorage.setItem(STORAGE_KEYS.haccpLogs, JSON.stringify(APP.haccpLogs));
}

function loadHaccpLogs() {
  const saved = localStorage.getItem(STORAGE_KEYS.haccpLogs);
  if (saved) {
    try {
      APP.haccpLogs = JSON.parse(saved);
      if (!APP.haccpLogs.reception) APP.haccpLogs.reception = [];
      if (!APP.haccpLogs.trace) APP.haccpLogs.trace = [];
      if (!APP.haccpLogs.temp) APP.haccpLogs.temp = [];
      if (!APP.haccpLogs.clean) APP.haccpLogs.clean = [];
    } catch (e) { console.error("Error loading HACCP logs", e); }
  }

  if (!APP.haccpLogs.temp) APP.haccpLogs.temp = [];
  if (!APP.haccpLogs.trace) APP.haccpLogs.trace = [];
  if (!APP.haccpLogs.reception) APP.haccpLogs.reception = [];
  if (!APP.haccpLogs.clean) APP.haccpLogs.clean = [];

  const needsDemo = APP.haccpLogs.temp.length === 0 && APP.haccpLogs.trace.length === 0 && APP.haccpLogs.reception.length === 0;
  if (needsDemo) {
    const now = new Date();
    APP.haccpLogs.temp = [
      { id: 't_demo1', date: new Date(now - 1000 * 60 * 60 * 2).toISOString(), equipKey: 'haccp.equip.frigo1', val: 3.2, user: 'Julian', action: null },
      { id: 't_demo2', date: new Date(now - 1000 * 60 * 60 * 14).toISOString(), equipKey: 'haccp.equip.frigo2', val: 4.5, user: 'Julian', action: null },
      { id: 't_demo3', date: new Date(now - 1000 * 60 * 60 * 26).toISOString(), equipKey: 'haccp.equip.congelateur', val: -18.5, user: 'Julian', action: null }
    ];
    APP.haccpLogs.reception = [
      { id: 'r_demo1', date: new Date(now - 1000 * 60 * 60 * 3).toISOString(), supplier: 'Métro', temp: 2.5, hygiene: 'ok' },
      { id: 'r_demo2', date: new Date(now - 1000 * 60 * 60 * 24 * 2).toISOString(), supplier: 'Pomona Passion Froid', temp: 3.1, hygiene: 'ok' },
      { id: 'r_demo3', date: new Date(now - 1000 * 60 * 60 * 24 * 5).toISOString(), supplier: 'Transgourmet', temp: 6.8, hygiene: 'ko' }
    ];
    APP.haccpLogs.trace = [
      { id: 'tr_demo1', lot: 'L260301', product: 'Éclair Chocolat', date: new Date(now - 1000 * 60 * 60 * 24).toISOString(), exp: '2026-03-06', qty: '50' },
      { id: 'tr_demo2', lot: 'L260302', product: 'Tarte Citron Meringuée', date: new Date(now - 1000 * 60 * 60 * 12).toISOString(), exp: '2026-03-07', qty: '12' },
      { id: 'tr_demo3', lot: 'L260303', product: 'Paris-Brest', date: new Date(now - 1000 * 60 * 60 * 48).toISOString(), exp: '2026-03-05', qty: '24' }
    ];
    saveHaccpLogs();
  }

  // Toujours initialiser le plan de nettoyage par défaut s'il est vide
  if (!APP.haccpLogs.clean || APP.haccpLogs.clean.length === 0) {
    APP.haccpLogs.clean = [
      { id: 'c1', areaKey: 'haccp.clean.c1', done: false, icon: '🧼' },
      { id: 'c2', areaKey: 'haccp.clean.c2', done: false, icon: '🧹' },
      { id: 'c3', areaKey: 'haccp.clean.c3', done: false, icon: '🔥' },
      { id: 'c4', areaKey: 'haccp.clean.c4', done: false, icon: '📦' },
      { id: 'c5', areaKey: 'haccp.clean.c5', done: false, icon: '❄️' },
      { id: 'c6', areaKey: 'haccp.clean.c6', done: false, icon: '🥣' },
      { id: 'c7', areaKey: 'haccp.clean.c7', done: false, icon: '🗑️' }
    ];
    saveHaccpLogs();
  }


  // Migrate: ensure cleaning items have areaKey for translation
  if (APP.haccpLogs.clean) {
    const keyMap = { c1: 'haccp.clean.c1', c2: 'haccp.clean.c2', c3: 'haccp.clean.c3', c4: 'haccp.clean.c4', c5: 'haccp.clean.c5', c6: 'haccp.clean.c6', c7: 'haccp.clean.c7' };
    APP.haccpLogs.clean.forEach(c => {
      if (!c.areaKey && keyMap[c.id]) c.areaKey = keyMap[c.id];
    });
  }
}

const EQUIP_KEY_MAP = {
  'Frigo 1 (Vitrine)': 'haccp.equip.frigo1',
  'Frigo 2 (Réserve)': 'haccp.equip.frigo2',
  'Congélateur 1': 'haccp.equip.congelateur',
  'Cellule': 'haccp.equip.cellule'
};

function switchHaccpTab(tab) {
  const views = ['Temp', 'Clean', 'Trace', 'Reception'];
  views.forEach(v => {
    const el = document.getElementById('haccpView' + v);
    const btn = document.getElementById('tabHaccp' + v);
    if (el) el.style.display = v.toLowerCase() === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', v.toLowerCase() === tab);
  });
  renderHygiene();
}

function renderHygiene() {
  renderTempLogs();
  renderCleaningChecklist();
  renderTraceability();
  renderReceptionLogs();
}

function renderTempLogs() {
  const container = document.getElementById('tempLogsBody');
  if (!container) return;
  if (!APP.haccpLogs.temp || APP.haccpLogs.temp.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">' + t('haccp.temp.empty') + '</td></tr>';
    return;
  }
  container.innerHTML = APP.haccpLogs.temp.map(function (log) {
    var isWarn = log.val > 5;
    var equipLabel = log.equipKey ? t(log.equipKey) : (EQUIP_KEY_MAP[log.equip] ? t(EQUIP_KEY_MAP[log.equip]) : (log.equip || ''));
    var actionBadge = '';
    if (log.action) {
      var actionText = (log.action.indexOf('haccp.') === 0) ? t(log.action) : log.action;
      actionBadge = '<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; margin-top:4px;">💬 ' + actionText + '</div>';
    }
    return '<tr>' +
      '<td>' + new Date(log.date).toLocaleString() + '</td>' +
      '<td style="font-weight:700;">' + equipLabel + '</td>' +
      '<td style="font-size:1.1rem; font-weight:800; color:' + (isWarn ? 'var(--danger)' : 'var(--success)') + '">' + log.val + '°C</td>' +
      '<td>' + (log.user || t('haccp.chef')) + '</td>' +
      '<td><span class="badge ' + (isWarn ? 'status-critical' : 'status-ok') + '">' + (isWarn ? '⚠️ ' + t('haccp.status.warn') : '✅ ' + t('haccp.status.ok')) + '</span>' + actionBadge + '</td>' +
      '<td><button class="btn btn-sm btn-outline btn-round" onclick="deleteTempLog(\'' + log.id + '\')">🗑️</button></td>' +
      '</tr>';
  }).join('');
}

function showAddTempModal() {
  var modal = document.getElementById('modalHaccpTemp');
  if (modal) modal.style.display = 'flex';
  var sel = document.getElementById('haccpTempEquip');
  if (sel) {
    sel.innerHTML = '<option value="haccp.equip.frigo1">' + t('haccp.equip.frigo1') + '</option>' +
      '<option value="haccp.equip.frigo2">' + t('haccp.equip.frigo2') + '</option>' +
      '<option value="haccp.equip.congelateur">' + t('haccp.equip.congelateur') + '</option>' +
      '<option value="haccp.equip.cellule">' + t('haccp.equip.cellule') + '</option>';
  }
}

function hideAddTempModal() {
  var modal = document.getElementById('modalHaccpTemp');
  if (modal) modal.style.display = 'none';
}

function addTempLog() {
  var equipSelector = document.getElementById('haccpTempEquip');
  var valInput = document.getElementById('haccpTempVal');
  var actionField = document.getElementById('haccpTempAction');
  if (!equipSelector || !valInput) return;
  var equipKey = equipSelector.value;
  var val = parseFloat(valInput.value);
  var action = actionField ? actionField.value.trim() : '';
  if (isNaN(val)) {
    if (typeof showToast === 'function') showToast(t('haccp.temp.empty'), 'error');
    return;
  }
  var log = {
    id: 't_log_' + Date.now(),
    date: new Date().toISOString(),
    equipKey: equipKey,
    val: val,
    action: action || null,
    user: APP.viewOwner || localStorage.getItem(STORAGE_KEYS.currentUser) || t('haccp.chef')
  };
  if (!APP.haccpLogs.temp) APP.haccpLogs.temp = [];
  APP.haccpLogs.temp.unshift(log);
  if (APP.haccpLogs.temp.length > 50) APP.haccpLogs.temp.pop();
  saveHaccpLogs();
  hideAddTempModal();
  valInput.value = '';
  if (actionField) actionField.value = '';
  renderTempLogs();
  if (typeof showToast === 'function') showToast(t('haccp.status.ok'), 'success');
}

function deleteTempLog(id) {
  APP.haccpLogs.temp = APP.haccpLogs.temp.filter(function (l) { return l.id !== id; });
  saveHaccpLogs();
  renderTempLogs();
}

function showAddReceptionModal() {
  var modal = document.getElementById('modalHaccpReception');
  if (modal) modal.style.display = 'flex';
}
function hideAddReceptionModal() {
  var modal = document.getElementById('modalHaccpReception');
  if (modal) modal.style.display = 'none';
}
function addReceptionLog() {
  var supplier = document.getElementById('haccpReceptSupplier').value;
  var temp = parseFloat(document.getElementById('haccpReceptTemp').value);
  var hygiene = document.getElementById('haccpReceptHygiene').value;
  if (!supplier) return;
  var log = { id: 'recept_' + Date.now(), date: new Date().toISOString(), supplier: supplier, temp: temp, hygiene: hygiene };
  if (!APP.haccpLogs.reception) APP.haccpLogs.reception = [];
  APP.haccpLogs.reception.unshift(log);
  saveHaccpLogs();
  hideAddReceptionModal();
  renderReceptionLogs();
  if (typeof showToast === 'function') showToast(t('haccp.status.ok'), 'success');
}
function renderReceptionLogs() {
  var container = document.getElementById('receptionLogsBody');
  if (!container) return;
  if (!APP.haccpLogs.reception || APP.haccpLogs.reception.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">' + t('haccp.reception.empty') + '</td></tr>';
    return;
  }
  container.innerHTML = APP.haccpLogs.reception.map(function (log) {
    return '<tr>' +
      '<td>' + new Date(log.date).toLocaleDateString() + '</td>' +
      '<td style="font-weight:700;">' + log.supplier + '</td>' +
      '<td style="font-weight:800;">' + log.temp + '°C</td>' +
      '<td>' + (log.hygiene === 'ok' ? '✅ ' + t('haccp.reception.ok') : '❌ ' + t('haccp.reception.ko')) + '</td>' +
      '<td><span class="badge ' + (log.hygiene === 'ok' ? 'status-ok' : 'status-critical') + '">' + (log.hygiene === 'ok' ? t('haccp.status.ok') : t('haccp.status.warn')) + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline btn-round" onclick="deleteReceptionLog(\'' + log.id + '\')">🗑️</button></td>' +
      '</tr>';
  }).join('');
}
function deleteReceptionLog(id) {
  APP.haccpLogs.reception = APP.haccpLogs.reception.filter(function (l) { return l.id !== id; });
  saveHaccpLogs();
  renderReceptionLogs();
}

function renderCleaningChecklist() {
  var container = document.getElementById('cleaningChecklistArea');
  if (!container) return;
  if (!APP.haccpLogs.clean) return;
  container.innerHTML = APP.haccpLogs.clean.map(function (task) {
    var areaName = task.areaKey ? t(task.areaKey) : (task.area || '');
    return '<div class="card glass-widget ' + (task.done ? 'cleaned' : '') + '" onclick="toggleCleaning(\'' + task.id + '\')">' +
      '<div style="font-size:2rem;">' + task.icon + '</div>' +
      '<div style="flex:1;">' +
      '<h4 style="margin:0; font-size:1.1rem; color:var(--primary);">' + areaName + '</h4>' +
      '<small style="color:var(--text-muted);">' + (task.done ? t('haccp.clean.stat_done') : t('haccp.clean.stat_todo')) + '</small>' +
      '</div>' +
      '<div style="font-size:1.5rem;">' + (task.done ? '✅' : '⭕') + '</div>' +
      '</div>';
  }).join('');
}

function toggleCleaning(id) {
  var task = APP.haccpLogs.clean.find(function (c) { return c.id === id; });
  if (task) {
    task.done = !task.done;
    saveHaccpLogs();
    renderCleaningChecklist();
  }
}

function renderTraceability() {
  var container = document.getElementById('traceLogsBody');
  if (!container) return;
  if (!APP.haccpLogs.trace || APP.haccpLogs.trace.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">' + t('haccp.trace.empty') + '</td></tr>';
    return;
  }
  container.innerHTML = APP.haccpLogs.trace.map(function (d) {
    return '<tr>' +
      '<td style="font-family:monospace; font-weight:800; color:var(--accent);">' + d.lot + '</td>' +
      '<td style="font-weight:700;">' + d.product + '</td>' +
      '<td>' + new Date(d.date).toLocaleDateString() + '</td>' +
      '<td style="color:var(--danger); font-weight:700;">' + d.exp + '</td>' +
      '<td>' + d.qty + ' ' + t('haccp.portions') + '</td>' +
      '<td><button class="btn btn-sm btn-outline btn-round" onclick="window.print()">🖨️</button></td>' +
      '</tr>';
  }).join('');
}

// ============================================================================
// OMNISEARCH SPOTLIGHT (CTRL+K)
// ============================================================================

let omniSelectedIndex = -1;
let currentOmniActions = [];

function toggleOmniSearch() {
  const modal = $('#omniModal');
  if (modal.style.display === 'flex') {
    modal.style.display = 'none';
  } else {
    modal.style.display = 'flex';
    $('#omniSearchInput').value = '';
    $('#omniResults').innerHTML = '';
    $('#omniEmpty').style.display = 'none';
    setTimeout(() => $('#omniSearchInput').focus(), 100);
  }
}

document.addEventListener('keydown', (e) => {
  // Handle Cmd+K (Mac) or Ctrl+K (Windows)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    toggleOmniSearch();
  }

  // Handle mobile bottom bar logic
  if (e.key === 'Escape' && $('#omniModal').style.display === 'flex') {
    toggleOmniSearch();
  }
});

// PWA Registration with update handling
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      // Check for updates periodically
      setInterval(() => {
        reg.update();
      }, 1000 * 60 * 60); // Check every hour
      
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available; show notification
            showToast("Une nouvelle version est disponible ! Elle s'installera au prochain rechargement.", "info", 5000);
          }
        };
      };
    }).catch(err => console.log('SW register error', err));

    // Handle the 'controllerchange' event to reload when the new SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });
  }
});

$('#omniModal').addEventListener('click', (e) => {
  if (e.target.id === 'omniModal') toggleOmniSearch();
});

if ($('#navOmniSearch')) {
  $('#navOmniSearch').addEventListener('click', toggleOmniSearch);
}

$('#omniSearchInput').addEventListener('input', (e) => {
  const query = e.target.value.toLowerCase().trim();
  omniSelectedIndex = -1;

  if (!query) {
    $('#omniResults').innerHTML = '';
    $('#omniEmpty').style.display = 'none';
    currentOmniActions = [];
    return;
  }

  currentOmniActions = [];

  // 1. Navigation / Modules
  const modules = [
    { title: t('nav.home') || 'Accueil', desc: 'Retourner à l\'accueil', icon: '🏠', action: () => $('#navHub').click() },
    { title: t('nav.recipes') || 'Recettes', desc: 'Créer ou modifier une recette', icon: '📝', action: () => $('#navRecettes').click() },
    { title: t('nav.lab') || 'Laboratoire', desc: 'Gestion du local et des équipements', icon: '🔬', action: () => $('#navLabo').click() },
    { title: t('nav.hygiene') || 'Hygiène & HACCP', desc: 'Relevés de température et traçabilité', icon: '🧼', action: () => $('#navHygiene').click() },
    { title: t('nav.inventory') || 'Inventaire', desc: 'Gérer les stocks et alertes', icon: '📦', action: () => $('#navInventaire').click() },
    { title: t('nav.suppliers') || 'Fournisseurs', desc: 'Consulter la liste des fournisseurs', icon: '🚚', action: () => $('#navSuppliers').click() },
    { title: t('nav.mgmt') || 'Gestion Pro', desc: 'Planning de production et suivi des pertes', icon: '🏢', action: () => $('#navMgmt').click() }
  ];

  modules.forEach(m => {
    if (m.title.toLowerCase().includes(query) || m.desc.toLowerCase().includes(query)) {
      currentOmniActions.push(m);
    }
  });

  // 2. Saved Recipes
  APP.savedRecipes.forEach(r => {
    if (r.name.toLowerCase().includes(query)) {
      currentOmniActions.push({
        title: r.name,
        desc: `Recette sauvegardée · ${r.category || 'Général'}`,
        icon: '🍰',
        action: () => {
          toggleOmniSearch();
          $('#navRecettes').click();
          loadRecipeToEditor(r.id);
        }
      });
    }
  });

  // 3. Quick Actions
  const qActions = [
    { title: 'Nouvel Ingrédient', desc: 'Ajouter à la base de données', icon: '➕', action: () => { toggleOmniSearch(); $('#navRecettes').click(); setTimeout(() => showIngredientDbModal(), 300); } },
    { title: 'Nouvelle Recette', desc: 'Commencer une feuille de calcul vide', icon: '✨', action: () => { toggleOmniSearch(); $('#navRecettes').click(); setTimeout(() => $('#btnCreateRecipe').click(), 300); } }
  ];

  qActions.forEach(m => {
    if (m.title.toLowerCase().includes(query) || m.desc.toLowerCase().includes(query)) {
      currentOmniActions.push(m);
    }
  });

  renderOmniResults();
});

function renderOmniResults() {
  const container = $('#omniResults');
  container.innerHTML = '';

  if (currentOmniActions.length === 0) {
    $('#omniEmpty').style.display = 'block';
    return;
  }

  $('#omniEmpty').style.display = 'none';

  currentOmniActions.slice(0, 8).forEach((item, index) => {
    const el = document.createElement('div');
    el.className = 'omni-item' + (index === omniSelectedIndex ? ' active' : '');

    el.innerHTML = `
      <div class="omni-item-icon">${item.icon}</div>
      <div class="omni-item-content">
        <div class="omni-item-title">${escapeHtml(item.title)}</div>
        <div class="omni-item-desc">${escapeHtml(item.desc)}</div>
      </div>
      <div class="omni-item-action">Ouvrir ➜</div>
    `;

    el.addEventListener('click', () => {
      if (item.action) item.action();
      toggleOmniSearch();
    });

    container.appendChild(el);
  });
}

$('#omniSearchInput').addEventListener('keydown', (e) => {
  const items = $$('#omniResults .omni-item');
  if (items.length === 0) return;

  if (e.key === 'ArrowDown') {
    e.preventDefault();
    omniSelectedIndex = (omniSelectedIndex + 1) % items.length;
    updateOmniSelection(items);
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    omniSelectedIndex = omniSelectedIndex - 1 < 0 ? items.length - 1 : omniSelectedIndex - 1;
    updateOmniSelection(items);
  } else if (e.key === 'Enter' && omniSelectedIndex >= 0) {
    e.preventDefault();
    items[omniSelectedIndex].click();
  }
});

function updateOmniSelection(items) {
  items.forEach((item, i) => {
    item.classList.toggle('active', i === omniSelectedIndex);
    if (i === omniSelectedIndex) {
      item.scrollIntoView({ block: 'nearest' });
    }
  });
}

// ============================================================================
// UI HELPERS (EMPTY STATES & TOAST)
// ============================================================================

function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;

  let icon = 'ℹ️';
  if (type === 'success') icon = '✅';
  if (type === 'error') icon = '❌';
  if (type === 'warning') icon = '⚠️';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <p class="toast-message">${message}</p>
    </div>
  `;

  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    toast.classList.add('removing');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  }, duration);
}

function renderEmptyState(container, title, message, icon = '📋') {
  if (!container) return;
  container.innerHTML = `
    <div class="empty-state">
      <div class="empty-state-icon">${icon}</div>
      <h3 class="empty-state-title">${title}</h3>
      <p class="empty-state-text">${message}</p>
    </div>
  `;
}

// ============================================================================
// NEW MODULES: ANTI-GASPI & QR CODE
// ============================================================================

function renderAntiGaspi() {
  const mod = $('#antiGaspiModule');
  const content = $('#antiGaspiContent');
  if (!mod || !content || !APP.recipe || !APP.recipe.ingredients) return;

  let hasWaste = false;
  let suggestions = [];

  // Analyze ingredients for potential waste/optimization
  APP.recipe.ingredients.forEach(ing => {
    if(!ing.name) return;
    const name = ing.name.toLowerCase();
    
    // Example 1: Egg Yolks/Whites
    if ((name.includes('jaune') && name.includes('oeuf')) || (name.includes('jaune') && name.includes('œuf'))) {
      hasWaste = true;
      suggestions.push(`🥚 <strong>Blancs d'œufs orphelins :</strong> Vous utilisez beaucoup de jaunes. Pensez à réaliser des <em>Macarons</em>, des <em>Financiers</em> ou des <em>Meringues</em> pour écouler vos blancs et optimiser la rentabilité.`);
    }
    else if ((name.includes('blanc') && name.includes('oeuf')) || (name.includes('blanc') && name.includes('œuf'))) {
      hasWaste = true;
      suggestions.push(`🥚 <strong>Jaunes d'œufs orphelins :</strong> Vous utilisez beaucoup de blancs. Vous pourriez préparer une <em>Crème anglaise</em>, un <em>Crémeux</em> ou une <em>Pâte sablée</em>.`);
    }

    // Example 2: Fruits
    if (name.includes('citron') || name.includes('orange') || name.includes('pamplemousse')) {
      hasWaste = true;
      suggestions.push(`🍋 <strong>Agrumes :</strong> Si vous n'utilisez que le jus, pensez à zester vos agrumes avant. Les zestes peuvent être séchés ou confits pour de futures préparations.`);
    }
    
    if (name.includes('fraise') || name.includes('framboise') || name.includes('pomme')) {
      hasWaste = true;
      suggestions.push(`🍓 <strong>Parures de fruits :</strong> Les parures ou fruits abîmés peuvent être converties en <em>Coulis</em>, <em>Confiture</em> ou <em>Pâte de fruits</em>.`);
    }
  });

  // Make suggestions unique
  suggestions = [...new Set(suggestions)];

  if (hasWaste && suggestions.length > 0) {
    mod.style.display = 'block';
    content.innerHTML = `<ul style="margin:0; padding-left:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
      ${suggestions.map(s => `<li>${s}</li>`).join('')}
    </ul>`;
  } else {
    // Standard tip if no direct matching
    mod.style.display = 'block';
    content.innerHTML = `<p style="margin:0;">✅ <strong>Bilan Anti-Gaspi :</strong> Aucune perte critique identifiée. Pensez à bien peser vos déchets (ex: coquilles, épluchures) pour affiner votre coût de revient réel.</p>`;
  }
}

function generateQRLable() {
  if (!APP.recipe || !APP.recipe.name) {
    showToast("Veuillez d'abord nommer la recette.", "error");
    return;
  }
  
  const costData = calcFullCost(APP.margin);
  const suggestedPrice = costData.suggestedPrice.toFixed(2);
  
  $('#qrRecipeName').textContent = APP.recipe.name;
  $('#qrRecipePrice').textContent = suggestedPrice + ' €';
  
  const al = document.getElementById('allergensList');
  $('#qrAllergens').textContent = al ? al.textContent : 'Non spécifié';
  
  // Clear old QR Code
  const qrbox = document.getElementById('qrcode');
  if(qrbox) qrbox.innerHTML = '';
  
  // Generate QR linking to a fake product page (or the tool itself with recipe param)
  const recipeUrl = window.location.origin + window.location.pathname;
  
  try {
    if(typeof QRCode !== 'undefined') {
      new QRCode(qrbox, {
          text: recipeUrl + "?view=" + encodeURIComponent(APP.recipe.name),
          width: 140,
          height: 140,
          colorDark : "#1f2937",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.H
      });
      $('#qrModal').style.display = 'flex';
    } else {
      showToast("La bibliothèque QR Code est en cours de chargement...", "info");
    }
  } catch(e) {
    console.error("QR Code generation failed", e);
    showToast("Erreur lors de la génération du QR Code.", "error");
  }
}

function exportQRLabelPdf() {
  const label = document.getElementById('labelPreview');
  if (!label) return;

  const recipeName = APP.recipe.name || 'etiquette';
  
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.top = '-10000px';
  container.style.left = '0';
  container.style.width = '400px';

  // Clone for export
  const clone = label.cloneNode(true);
  clone.style.width = '100%';
  clone.style.height = 'auto';
  clone.style.padding = '40px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.display = 'block';
  
  // Force visibility of children
  clone.querySelectorAll('*').forEach(el => {
    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.style.color = '#333333';
  });
  
  // Explicitly fix QR code container if needed
  const qrInClone = clone.querySelector('#qrcode');
  if (qrInClone) {
     qrInClone.style.display = 'block';
     qrInClone.style.margin = '0 auto';
  }

  container.appendChild(clone);
  document.body.appendChild(container);

  const opt = {
    margin: [10, 10, 10, 10],
    filename: `Etiquette_${recipeName.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
       scale: 3, 
       useCORS: true, 
       backgroundColor: '#ffffff',
       scrollY: -window.scrollY
    },
    jsPDF: { unit: 'mm', format: 'a5', orientation: 'portrait' }
  };

  showToast('Génération de l\'étiquette PDF...', 'info');
  
  setTimeout(() => {
    html2pdf().from(container).set(opt).save().then(() => {
      document.body.removeChild(container);
      showToast('Étiquette exportée.', 'success');
    }).catch(err => {
      console.error('PDF Label Error:', err);
      if(document.body.contains(container)) document.body.removeChild(container);
      showToast('Erreur lors de l\'export PDF.', 'error');
    });
  }, 1000); // More time for QR code
}

// ============================================================================
// GESTION PRO MODULE: SHOPPING LIST, ALLERGENS, WASTE, OBJECTIVES, PRODUCTION
// ============================================================================

let wasteChart = null;

// --- KPI Dashboard ---
function updateMgmtKpis() {
  const recipes = APP.savedRecipes || [];
  const kpiRecipes = document.getElementById('mgmtKpiRecipes');
  const kpiMargin = document.getElementById('mgmtKpiMargin');
  const kpiWaste = document.getElementById('mgmtKpiWaste');
  const kpiAllergens = document.getElementById('mgmtKpiAllergens');

  if (kpiRecipes) kpiRecipes.textContent = recipes.length;

  if (kpiMargin) {
    if (recipes.length > 0) {
      let totalMargin = 0;
      recipes.forEach(r => {
        totalMargin += (r.margin || 70);
      });
      kpiMargin.textContent = (totalMargin / recipes.length).toFixed(1) + '%';
    } else {
      kpiMargin.textContent = '—';
    }
  }

  if (kpiWaste) {
    const logs = APP.wasteLogs || [];
    let totalLoss = 0;
    logs.forEach(l => totalLoss += (l.lossValue || 0));
    kpiWaste.textContent = totalLoss.toFixed(2) + ' €';
  }

  if (kpiAllergens) {
    const allAllergens = new Set();
    recipes.forEach(r => {
      if (!r.ingredients) return;
      r.ingredients.forEach(ing => {
        const n = (ing.name || '').toLowerCase();
        if (n.includes('lait') || n.includes('beurre') || n.includes('crème')) allAllergens.add('Lait');
        if (n.includes('œuf') || n.includes('oeuf')) allAllergens.add('Œufs');
        if (n.includes('farine') || n.includes('blé')) allAllergens.add('Gluten');
        if (n.includes('amande') || n.includes('noisette') || n.includes('noix')) allAllergens.add('Fruits à coque');
      });
    });
    kpiAllergens.textContent = allAllergens.size;
  }
}

// --- Shopping List ---
function addShoppingRecipeRow() {
  const container = document.getElementById('shoppingRecipeSelectors');
  if (!container) return;

  const row = document.createElement('div');
  row.className = 'shopping-row-premium';

  const recipes = [...APP.savedRecipes];
  const options = recipes.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');

  row.innerHTML = `
    <select class="form-select" style="flex:2;">
      <option value="">— ${t('mgmt.shopping.choose') || 'Choisir une recette'} —</option>
      ${options}
    </select>
    <input type="number" class="form-input" value="10" min="1" style="width:80px; text-align:center; font-weight:700;">
    <span style="font-size:0.75rem; color:var(--text-muted); white-space:nowrap;">${t('unit.portions') || 'portions'}</span>
    <button class="remove-row-btn" onclick="this.parentElement.remove()" title="Supprimer">✕</button>
  `;
  container.appendChild(row);
}

function generateShoppingList() {
  const container = document.getElementById('shoppingRecipeSelectors');
  const rows = container.querySelectorAll('.shopping-row-premium');
  const needs = {};

  rows.forEach(row => {
    const id = row.querySelector('select').value;
    const qty = parseInt(row.querySelector('input').value) || 0;
    if (!id || qty <= 0) return;

    const recipe = APP.savedRecipes.find(r => r.id === id);
    if (!recipe) return;

    const ratio = qty / (recipe.portions || 10);
    recipe.ingredients.forEach(ing => {
      const name = ing.name.toLowerCase();
      if (!needs[name]) {
        needs[name] = { name: ing.name, qty: 0, unit: ing.unit };
      }
      needs[name].qty += (parseFloat(ing.quantity) || 0) * ratio;
    });
  });

  const resultContainer = document.getElementById('shoppingListContainer');
  const resultCard = document.getElementById('shoppingResultCard');
  const exportBar = document.getElementById('shoppingExportBar');
  const exportSummary = document.getElementById('shoppingExportSummary');

  if (Object.keys(needs).length === 0) {
    showToast(t('mgmt.shopping.error_empty') || "Veuillez sélectionner au moins une recette.", "error");
    return;
  }

  let totalItems = 0;
  let itemsToBuy = 0;

  let html = `
    <table class="mgmt-result-table">
      <thead>
        <tr>
          <th>${t('s2.header.ingredient') || 'Ingrédient'}</th>
          <th>${t('mgmt.shopping.col_total') || 'Quantité Totale'}</th>
          <th>${t('mgmt.shopping.col_stock') || 'En Stock'}</th>
          <th>${t('mgmt.shopping.col_buy') || "Besoin d'Achat"}</th>
        </tr>
      </thead>
      <tbody>
  `;

  for (const key in needs) {
    const item = needs[key];
    const inv = APP.inventory.find(i => i.name.toLowerCase() === key);
    const stockQty = inv ? inv.stock : 0;
    const buy = Math.max(0, item.qty - stockQty);
    totalItems++;
    if (buy > 0) itemsToBuy++;

    html += `
      <tr>
        <td><strong>${escapeHtml(item.name)}</strong></td>
        <td>${item.qty.toFixed(0)} ${item.unit}</td>
        <td>${stockQty} ${item.unit}</td>
        <td><span class="buy-needed ${buy > 0 ? 'critical' : 'ok'}">${buy > 0 ? '⚠ ' : '✅ '}${buy.toFixed(0)} ${item.unit}</span></td>
      </tr>
    `;
  }

  html += `</tbody></table>`;
  resultContainer.innerHTML = html;
  resultCard.style.display = 'block';

  if (exportBar) {
    exportBar.style.display = 'flex';
    if (exportSummary) {
      exportSummary.innerHTML = `<strong>${totalItems}</strong> ${t('s2.header.ingredient') || 'ingrédients'} · <strong style="color: var(--danger);">${itemsToBuy}</strong> ${t('mgmt.shopping.to_buy') || 'à commander'}`;
    }
  }

  resultCard.scrollIntoView({ behavior: 'smooth' });

  // Store needs data for CSV export
  window._lastShoppingNeeds = needs;
}

function exportShoppingCSV() {
  const needs = window._lastShoppingNeeds;
  if (!needs || Object.keys(needs).length === 0) {
    showToast("Aucune donnée à exporter.", "error");
    return;
  }

  let csv = "Ingrédient;Quantité Totale;Unité;En Stock;Besoin d'Achat\n";
  for (const key in needs) {
    const item = needs[key];
    const inv = APP.inventory.find(i => i.name.toLowerCase() === key);
    const stockQty = inv ? inv.stock : 0;
    const buy = Math.max(0, item.qty - stockQty);
    csv += `${item.name};${item.qty.toFixed(0)};${item.unit};${stockQty};${buy.toFixed(0)}\n`;
  }

  const blob = new Blob(["\uFEFF" + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `GourmetRevient_Courses_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  showToast(t('mgmt.shopping.export_success') || "Liste exportée en CSV !", "success");
}

// --- Allergen Matrix ---
function renderAllergenMatrix() {
  const table = document.getElementById('allergenMatrixTable');
  if (!table) return;

  const recipes = APP.savedRecipes;
  if (recipes.length === 0) {
    table.innerHTML = `<tr><td colspan="15" style="text-align:center; padding:3rem;">
      <div class="mgmt-empty-state">
        <div class="empty-icon">🛡️</div>
        <h4>${t('mgmt.allergens.empty_title') || 'Aucune recette enregistrée'}</h4>
        <p>${t('mgmt.allergens.empty_desc') || 'Créez et sauvegardez des recettes pour générer la matrice des allergènes automatiquement.'}</p>
      </div>
    </td></tr>`;
    return;
  }

  const allAllergens = [
    { key: "Lait", emoji: "🥛" },
    { key: "Œufs", emoji: "🥚" },
    { key: "Gluten", emoji: "🌾" },
    { key: "Fruits à coque", emoji: "🥜" },
    { key: "Soja", emoji: "🫘" },
    { key: "Arachides", emoji: "🥜" },
    { key: "Sésame", emoji: "🌰" },
    { key: "Moutarde", emoji: "🟡" },
    { key: "Lupin", emoji: "🌿" },
    { key: "Sulfites", emoji: "🧪" },
    { key: "Poisson", emoji: "🐟" },
    { key: "Crustacés", emoji: "🦐" },
    { key: "Mollusques", emoji: "🐚" },
    { key: "Céleri", emoji: "🥬" }
  ];
  
  let html = `
    <thead>
      <tr>
        <th>${t('mgmt.allergens.col_recipe') || 'Recette'}</th>
        ${allAllergens.map(a => `<th><span title="${a.key}">${a.emoji}</span><br><span style="font-size:0.55rem;">${a.key}</span></th>`).join('')}
      </tr>
    </thead>
    <tbody>
  `;

  recipes.forEach(r => {
    const foundAllergens = new Set();
    r.ingredients.forEach(ing => {
      const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
      if (dbItem && dbItem.allergens) {
        dbItem.allergens.forEach(a => foundAllergens.add(a));
      }
      const n = ing.name.toLowerCase();
      if (n.includes('lait') || n.includes('beurre') || n.includes('crème')) foundAllergens.add('Lait');
      if (n.includes('œuf') || n.includes('oeuf')) foundAllergens.add('Œufs');
      if (n.includes('farine') || n.includes('blé')) foundAllergens.add('Gluten');
      if (n.includes('amande') || n.includes('noisette') || n.includes('noix') || n.includes('pistache')) foundAllergens.add('Fruits à coque');
      if (n.includes('soja')) foundAllergens.add('Soja');
      if (n.includes('arachide') || n.includes('cacahu')) foundAllergens.add('Arachides');
      if (n.includes('sésame')) foundAllergens.add('Sésame');
      if (n.includes('moutarde')) foundAllergens.add('Moutarde');
    });

    html += `
      <tr>
        <td>${escapeHtml(r.name)}</td>
        ${allAllergens.map(a => `
          <td><span class="allergen-badge ${foundAllergens.has(a.key) ? 'present' : 'absent'}">${foundAllergens.has(a.key) ? '●' : '—'}</span></td>
        `).join('')}
      </tr>
    `;
  });

  html += `</tbody>`;
  table.innerHTML = html;
}

// --- Waste Tracking ---
function populateWasteDropdown() {
  const select = document.getElementById('wasteRecipeSelect');
  if (!select) return;
  const recipes = APP.savedRecipes;
  select.innerHTML = recipes.map(r => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
}

function logWaste() {
  const id = document.getElementById('wasteRecipeSelect').value;
  const qty = parseFloat(document.getElementById('wasteQty').value) || 0;
  const reason = document.getElementById('wasteReason').value;
  const notesEl = document.getElementById('wasteNotes');
  const notes = notesEl ? notesEl.value.trim() : '';

  if (!id || qty <= 0) {
    showToast(t('mgmt.waste.error_qty') || "Veuillez saisir une quantité valide.", "error");
    return;
  }

  const recipe = APP.savedRecipes.find(r => r.id === id);
  if (!recipe) return;

  const costData = calcFullCost(recipe.margin || 70, recipe);
  const lossAmount = costData.costPerPortion * qty;

  const entry = {
    date: new Date().toISOString(),
    recipeId: id,
    recipeName: recipe.name,
    qty: qty,
    reason: reason,
    notes: notes,
    lossValue: lossAmount
  };

  APP.wasteLogs.push(entry);
  localStorage.setItem(STORAGE_KEYS.wasteLogs, JSON.stringify(APP.wasteLogs));

  showToast(`${t('mgmt.toast.loss') || 'Perte enregistrée'} (${lossAmount.toFixed(2)} €)`, "warning");
  
  if (notesEl) notesEl.value = '';
  document.getElementById('wasteQty').value = '1';
  
  renderWasteAnalysis();
  if (typeof updateMgmtKpis === 'function') updateMgmtKpis();
}

const WASTE_REASON_ICONS = {
  invendu: '📦',
  casse: '💥',
  degustation: '🍴',
  peremption: '⏰'
};

function renderWasteAnalysis() {
  const totalLossEl = document.getElementById('totalWasteValue');
  const impactMarginEl = document.getElementById('impactMarginValue');
  const totalCountEl = document.getElementById('totalWasteCount');

  if (!totalLossEl) return;

  const logs = APP.wasteLogs || [];
  let totalLoss = 0;
  logs.forEach(l => totalLoss += (l.lossValue || 0));

  totalLossEl.textContent = totalLoss.toFixed(2) + ' €';

  const turnover = 5000; 
  const impact = (totalLoss / turnover) * 100;
  if (impactMarginEl) impactMarginEl.textContent = '-' + impact.toFixed(2) + '%';
  if (totalCountEl) totalCountEl.textContent = logs.length;
  
  // Render history
  const history = document.getElementById('wasteHistoryList');
  if (history) {
    if (logs.length === 0) {
      history.innerHTML = `<div class="mgmt-empty-state" style="padding:2rem;">
        <div class="empty-icon">📋</div>
        <p>${t('mgmt.waste.empty') || 'Aucun historique de pertes.'}</p>
      </div>`;
    } else {
      history.innerHTML = [...logs].reverse().slice(0, 15).map(l => {
        const icon = WASTE_REASON_ICONS[l.reason] || '📋';
        return `
        <div class="waste-entry">
          <div class="waste-entry-icon reason-${l.reason}">${icon}</div>
          <div class="waste-entry-info">
            <div class="waste-entry-name">${escapeHtml(l.recipeName)}</div>
            <div class="waste-entry-meta">${new Date(l.date).toLocaleDateString()} · ${t('mgmt.reason.' + l.reason) || l.reason}${l.notes ? ' · ' + escapeHtml(l.notes) : ''}</div>
          </div>
          <div class="waste-entry-amount">
            <div class="waste-entry-loss">-${(l.lossValue || 0).toFixed(2)} €</div>
            <div class="waste-entry-qty">${l.qty} ${l.qty > 1 ? (t('unit.portions') || 'portions') : (t('unit.portion') || 'portion')}</div>
          </div>
        </div>`;
      }).join('');
    }
  }

  // Render waste chart
  renderWasteChart(logs);
}

function renderWasteChart(logs) {
  const canvas = document.getElementById('wasteChartCanvas');
  if (!canvas || typeof Chart === 'undefined') return;

  const reasonCounts = {};
  const reasonLabels = {
    invendu: t('mgmt.reason.invendu') || 'Invendu',
    casse: t('mgmt.reason.casse') || 'Casse',
    degustation: t('mgmt.reason.degustation') || 'Dégustation',
    peremption: t('mgmt.reason.peremption') || 'Péremption'
  };

  logs.forEach(l => {
    const r = l.reason || 'invendu';
    reasonCounts[r] = (reasonCounts[r] || 0) + (l.lossValue || 0);
  });

  const labels = Object.keys(reasonCounts).map(k => reasonLabels[k] || k);
  const data = Object.values(reasonCounts);
  const colors = ['#f59e0b', '#ef4444', '#6366f1', '#6b7280'];

  if (wasteChart) {
    wasteChart.destroy();
    wasteChart = null;
  }

  if (data.length === 0) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }

  wasteChart = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: data,
        backgroundColor: colors.slice(0, data.length),
        borderWidth: 2,
        borderColor: getComputedStyle(document.documentElement).getPropertyValue('--surface').trim() || '#ffffff',
        hoverBorderWidth: 3
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            padding: 12,
            usePointStyle: true,
            pointStyleWidth: 8,
            font: { size: 11, family: "'Inter', sans-serif" }
          }
        }
      }
    }
  });
}

function loadWasteLogs() {
  const saved = localStorage.getItem(STORAGE_KEYS.wasteLogs);
  APP.wasteLogs = saved ? JSON.parse(saved) : [];
}

// --- Cost Objectives ---
function renderObjectives() {
  const grid = document.getElementById('objectivesGrid');
  if (!grid) return;

  const recipes = APP.savedRecipes || [];
  const wasteLogs = APP.wasteLogs || [];

  // Calculate real metrics
  let avgMargin = 0;
  let avgCost = 0;
  let totalWaste = 0;
  let recipeCount = recipes.length;

  recipes.forEach(r => {
    avgMargin += (r.margin || 70);
    const cd = calcFullCost(r.margin || 70, r);
    avgCost += cd.costPerPortion;
  });
  if (recipeCount > 0) {
    avgMargin /= recipeCount;
    avgCost /= recipeCount;
  }
  wasteLogs.forEach(l => totalWaste += (l.lossValue || 0));

  // Define objectives
  const objectives = [
    {
      title: t('mgmt.obj.margin_target') || 'Marge Moyenne ≥ 70%',
      current: avgMargin,
      target: 70,
      unit: '%',
      color: avgMargin >= 70 ? '#10b981' : avgMargin >= 60 ? '#f59e0b' : '#ef4444',
      status: avgMargin >= 70 ? 'on-track' : avgMargin >= 60 ? 'warning' : 'critical',
      statusLabel: avgMargin >= 70 ? (t('mgmt.obj.on_track') || '✅ Atteint') : avgMargin >= 60 ? (t('mgmt.obj.warning') || '⚠️ Proche') : (t('mgmt.obj.critical') || '❌ Critique')
    },
    {
      title: t('mgmt.obj.cost_target') || 'Coût Moyen/Portion ≤ 3.00 €',
      current: 3.00 - avgCost,
      target: 3.00,
      unit: '€',
      color: avgCost <= 3 ? '#10b981' : avgCost <= 4 ? '#f59e0b' : '#ef4444',
      status: avgCost <= 3 ? 'on-track' : avgCost <= 4 ? 'warning' : 'critical',
      statusLabel: avgCost <= 3 ? (t('mgmt.obj.on_track') || '✅ Atteint') : (t('mgmt.obj.warning') || '⚠️ Proche'),
      displayValue: avgCost.toFixed(2) + ' €',
      displayTarget: '≤ 3.00 €'
    },
    {
      title: t('mgmt.obj.waste_target') || 'Pertes Mensuelles ≤ 50 €',
      current: 50 - totalWaste,
      target: 50,
      unit: '€',
      color: totalWaste <= 50 ? '#10b981' : totalWaste <= 100 ? '#f59e0b' : '#ef4444',
      status: totalWaste <= 50 ? 'on-track' : totalWaste <= 100 ? 'warning' : 'critical',
      statusLabel: totalWaste <= 50 ? (t('mgmt.obj.on_track') || '✅ Atteint') : (t('mgmt.obj.critical') || '❌ Critique'),
      displayValue: totalWaste.toFixed(2) + ' €',
      displayTarget: '≤ 50 €'
    },
    {
      title: t('mgmt.obj.recipe_count') || 'Catalogue ≥ 10 Recettes',
      current: recipeCount,
      target: 10,
      unit: '',
      color: recipeCount >= 10 ? '#10b981' : recipeCount >= 5 ? '#f59e0b' : '#ef4444',
      status: recipeCount >= 10 ? 'on-track' : recipeCount >= 5 ? 'warning' : 'critical',
      statusLabel: recipeCount >= 10 ? (t('mgmt.obj.on_track') || '✅ Atteint') : (t('mgmt.obj.in_progress') || '🔄 En cours')
    }
  ];

  grid.innerHTML = objectives.map(obj => {
    const pct = obj.title.includes('Marge') ? Math.min(100, (obj.current / obj.target) * 100)
              : obj.title.includes('Catalogue') ? Math.min(100, (obj.current / obj.target) * 100)
              : obj.status === 'on-track' ? 100 
              : obj.status === 'warning' ? 65 : 30;

    const currentDisplay = obj.displayValue || (obj.title.includes('Marge') ? obj.current.toFixed(1) + '%' : obj.current + (obj.unit ? ' ' + obj.unit : ''));
    const targetDisplay = obj.displayTarget || (obj.target + (obj.unit ? ' ' + obj.unit : ''));

    return `
      <div class="objective-card">
        <div class="objective-header">
          <div class="objective-title">${obj.title}</div>
          <span class="objective-badge ${obj.status}">${obj.statusLabel}</span>
        </div>
        <div class="objective-progress-bar">
          <div class="objective-progress-fill" style="width:${pct}%; background:${obj.color};"></div>
        </div>
        <div class="objective-stats">
          <span>${t('mgmt.obj.current') || 'Actuel'}: <strong>${currentDisplay}</strong></span>
          <span>${t('mgmt.obj.target') || 'Objectif'}: <strong>${targetDisplay}</strong></span>
        </div>
      </div>
    `;
  }).join('');

  // Breaking Point module
  calculateBreakingPoint();
  bindBreakingPointEvents();
}

function bindBreakingPointEvents() {
  const inputs = ['bpRent', 'bpSalaries', 'bpEnergy', 'bpOther'];
  
  // Load saved fixed costs
  const savedData = JSON.parse(localStorage.getItem('gourmet_fixed_costs') || '{}');
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (savedData[id] !== undefined) el.value = savedData[id];
      // Avoid binding multiple times
      el.removeEventListener('input', calculateBreakingPoint);
      el.addEventListener('input', calculateBreakingPoint);
    }
  });
}

function calculateBreakingPoint() {
  const rent = parseFloat(document.getElementById('bpRent')?.value) || 0;
  const salaries = parseFloat(document.getElementById('bpSalaries')?.value) || 0;
  const energy = parseFloat(document.getElementById('bpEnergy')?.value) || 0;
  const other = parseFloat(document.getElementById('bpOther')?.value) || 0;

  const totalFixed = rent + salaries + energy + other;

  // Save to localStorage
  localStorage.setItem('gourmet_fixed_costs', JSON.stringify({ bpRent: rent, bpSalaries: salaries, bpEnergy: energy, bpOther: other }));

  const elFixed = document.getElementById('bpTotalFixed');
  if (elFixed) elFixed.textContent = totalFixed.toLocaleString('fr-FR') + ' €';

  const recipes = APP.savedRecipes || [];
  let avgMargin = 0;
  let validRecipesCount = 0;

  recipes.forEach(r => {
    let m = r.costs || r.data;
    if (!m && typeof calcFullCost === 'function') {
        try { m = calcFullCost(r.margin || 70, r); } catch(e){}
    }
    avgMargin += (m ? m.marginPct : (r.margin || 70));
    validRecipesCount++;
  });

  const marginRate = validRecipesCount > 0 ? (avgMargin / validRecipesCount) : 70;
  const elAvgMargin = document.getElementById('bpAvgMargin');
  if (elAvgMargin) elAvgMargin.textContent = marginRate.toFixed(1) + ' %';

  const breakingPoint = (marginRate > 0) ? (totalFixed / (marginRate / 100)) : 0;
  
  const elTarget = document.getElementById('bpTargetRevenue');
  if (elTarget) elTarget.textContent = breakingPoint.toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';

  const elDaily = document.getElementById('bpDailyRevenue');
  if (elDaily) elDaily.textContent = (breakingPoint / 24).toLocaleString('fr-FR', { maximumFractionDigits: 0 }) + ' €';
}

// --- Production Planning ---
function renderProductionPlan() {
  const grid = document.getElementById('productionPlanGrid');
  if (!grid) return;

  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  const recipes = APP.savedRecipes || [];

  if (plan.length === 0 && recipes.length === 0) {
    grid.innerHTML = `<div class="mgmt-empty-state">
      <div class="empty-icon">📅</div>
      <h4>${t('mgmt.production.empty_title') || 'Aucune production planifiée'}</h4>
      <p>${t('mgmt.production.empty_desc') || 'Ajoutez des productions pour organiser votre semaine de travail.'}</p>
    </div>`;
    return;
  }

  if (plan.length === 0) {
    grid.innerHTML = `<div class="mgmt-empty-state">
      <div class="empty-icon">📅</div>
      <h4>${t('mgmt.production.empty_title') || 'Aucune production planifiée'}</h4>
      <p>${t('mgmt.production.empty_desc') || 'Cliquez sur "Ajouter" pour planifier votre première production.'}</p>
    </div>`;
    return;
  }

  const statusLabels = {
    todo: { label: t('dash.prod.todo') || 'À produire', color: 'var(--text-muted)', bg: 'var(--bg-alt)' },
    ongoing: { label: t('dash.prod.ongoing') || 'En cours', color: '#6366f1', bg: 'rgba(99,102,241,0.1)' },
    done: { label: t('dash.prod.done') || 'Terminé', color: '#10b981', bg: 'rgba(16,185,129,0.1)' }
  };

  grid.innerHTML = `<div style="display:flex; flex-direction:column; gap:0.75rem;">
    ${plan.map((item, idx) => {
      const st = statusLabels[item.status] || statusLabels.todo;
      return `
      <div style="display:flex; align-items:center; gap:1rem; padding:1rem; background:var(--bg-alt); border-radius:var(--radius); border:1px solid var(--surface-border); transition:all 0.2s;"
        onmouseover="this.style.borderColor='var(--accent)'" onmouseout="this.style.borderColor='var(--surface-border)'">
        <div style="font-size:1.5rem; opacity:0.7;">🧁</div>
        <div style="flex:1;">
          <div style="font-weight:700; font-size:0.9rem;">${escapeHtml(item.name)}</div>
          <div style="font-size:0.75rem; color:var(--text-muted);">${item.qty} ${t('unit.portions') || 'portions'} · ${item.date || ''}</div>
        </div>
        <select onchange="updateProductionStatus(${idx}, this.value)" class="form-select" style="width:auto; font-size:0.8rem; padding:0.4rem 0.8rem;">
          <option value="todo" ${item.status === 'todo' ? 'selected' : ''}>${statusLabels.todo.label}</option>
          <option value="ongoing" ${item.status === 'ongoing' ? 'selected' : ''}>${statusLabels.ongoing.label}</option>
          <option value="done" ${item.status === 'done' ? 'selected' : ''}>${statusLabels.done.label}</option>
        </select>
        <span style="display:inline-block; padding:4px 10px; border-radius:100px; font-size:0.7rem; font-weight:800; background:${st.bg}; color:${st.color};">${st.label}</span>
        <button class="remove-row-btn" onclick="removeProductionItem(${idx})" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--surface-border);background:var(--surface);color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:0.75rem;" title="Supprimer">🗑️</button>
      </div>`;
    }).join('')}
  </div>`;
}

function addProductionItem() {
  const recipes = APP.savedRecipes || [];
  if (recipes.length === 0) {
    showToast(t('mgmt.production.no_recipes') || "Ajoutez d'abord des recettes.", "error");
    return;
  }

  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  
  // Pick first recipe as default
  const defaultRecipe = recipes[0];
  plan.push({
    name: defaultRecipe.name,
    recipeId: defaultRecipe.id,
    qty: 10,
    status: 'todo',
    date: new Date().toLocaleDateString()
  });

  localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
  renderProductionPlan();
  showToast(t('mgmt.production.added') || "Production ajoutée !", "success");
}

function updateProductionStatus(idx, status) {
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  if (plan[idx]) {
    plan[idx].status = status;
    localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
    renderProductionPlan();
  }
}

function removeProductionItem(idx) {
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  plan.splice(idx, 1);
  localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
  renderProductionPlan();
}

/**
 * Professional Workflow: Launch production from a recipe summary
 */
function launchProductionFromRecipe() {
  if (!APP.recipe.name) {
    showToast(t('s5.subtitle.empty'), 'error');
    return;
  }
  
  // 1. Save it first to ensure existence
  saveCurrentRecipe();
  
  // 2. Add to production log
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  plan.push({
    name: APP.recipe.name,
    recipeId: APP.recipe.id,
    qty: APP.recipe.portions || 10,
    status: 'todo',
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
  
  // 3. Navigate to appropriate module
  if (typeof showMgmt === 'function') {
    showMgmt();
    if (typeof switchMgmtTab === 'function') switchMgmtTab('production');
  }
  
  if (typeof renderProductionPlan === 'function') renderProductionPlan();
  
  showToast(t('mgmt.production.added') || "Production lancée !", "success");
}

// ============================================================================
// PREMIUM BRANDING — MICRO-INTERACTIONS ENGINE
// ============================================================================

/**
 * 1. SPLASH SCREEN — Auto-dismiss with elegant fade
 */
(function initSplashScreen() {
  const splash = document.getElementById('premiumSplash');
  if (!splash) return;

  // Dismiss splash after animation completes (≈ 2.8s)
  const dismissTime = 2800;

  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 800); // matches CSS transition duration
  }, dismissTime);
})();

/**
 * 2. CHOCOLATE RAIN — Celebration effect
 *    Triggered on step validation and recipe save
 */
function triggerChocolateRain(intensity = 'normal') {
  const container = document.getElementById('chocolateRainContainer');
  if (!container) return;

  const pieces = intensity === 'epic' ? 50 : (intensity === 'light' ? 15 : 30);
  const emojis = ['🍫', '🍪', '🧁', '🍩', '🎂', '🥐', '🍰', '✨', '⭐'];
  const duration = intensity === 'epic' ? 3500 : 2500;

  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement('div');
    piece.className = 'choco-piece';
    piece.textContent = emojis[Math.floor(Math.random() * emojis.length)];
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
    piece.style.animationDuration = `${1.5 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    container.appendChild(piece);
  }

  // Cleanup
  setTimeout(() => {
    container.innerHTML = '';
  }, duration);
}

// Make it globally available
window.triggerChocolateRain = triggerChocolateRain;

/**
 * 3. HOOK INTO goToStep — Add celebration on step forward navigation
 */
const _originalGoToStep = goToStep;
goToStep = function(step) {
  const previousStep = APP.currentStep;

  // Call original
  _originalGoToStep(step);

  // Trigger chocolate rain when advancing to next step (not going back)
  if (step > previousStep && previousStep >= 1) {
    triggerChocolateRain('light');
  }

  // Add page transition class
  const stepEl = document.querySelector(`#step${step}`);
  if (stepEl) {
    stepEl.classList.remove('page-transition-active');
    void stepEl.offsetWidth; // Force reflow
    stepEl.classList.add('page-transition-active');
  }
};

/**
 * 4. HOOK INTO saveCurrentRecipe — Epic rain on recipe save
 */
if (typeof saveCurrentRecipe === 'function') {
  const _originalSave = saveCurrentRecipe;
  saveCurrentRecipe = function() {
    _originalSave.apply(this, arguments);
    triggerChocolateRain('epic');
  };
}

/**
 * Premium features initialized.
 */

/**
 * 6. GOLDEN SEPARATOR — Automatically add elegant dividers
 */
(function addGoldenDividers() {
  document.addEventListener('DOMContentLoaded', () => {
    // Add a golden line under the morning briefing
    const briefing = document.querySelector('.morning-briefing');
    if (briefing && !briefing.nextElementSibling?.classList.contains('golden-divider')) {
      const divider = document.createElement('div');
      divider.className = 'golden-divider';
      briefing.after(divider);
    }
  });
})();

/**
 * 7. PREMIUM LOGO ANIMATION — Subtle shine on header brand hover
 */
(function initLogoShine() {
  const brand = document.getElementById('headerBrand');
  if (!brand) return;

  brand.addEventListener('mouseenter', () => {
    const h1 = brand.querySelector('h1');
    if (h1) {
      h1.style.transition = 'transform 0.3s ease';
      h1.style.transform = 'scale(1.03)';
    }
  });

  brand.addEventListener('mouseleave', () => {
    const h1 = brand.querySelector('h1');
    if (h1) {
      h1.style.transform = 'scale(1)';
    }
  });
// End of features
})();

/**
 * 8. MAGNETIC CURSOR & GLOSSY CARDS
 */
document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.getElementById('magnetCursor');
  const dot = document.getElementById('magnetCursorDot');
  
  if (cursor && dot) {
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;
    
    // Track mouse
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // Immediate update for dot
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      
      // Update CSS variables for glossy cards
      const glossyCards = document.querySelectorAll('.cockpit-card, .card, .dash-card');
      glossyCards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const x = mouseX - rect.left;
        const y = mouseY - rect.top;
        card.style.setProperty('--mouse-x', `${x}px`);
        card.style.setProperty('--mouse-y', `${y}px`);
      });
    });
    
    // Smooth trailing update for main cursor circle
    const renderCursor = () => {
      cursorX += (mouseX - cursorX) * 0.2;
      cursorY += (mouseY - cursorY) * 0.2;
      cursor.style.transform = `translate(${cursorX}px, ${cursorY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderCursor);
    };
    requestAnimationFrame(renderCursor);
    
    // Hover states for magnetic effect
    const addMagnetEffect = () => cursor.classList.add('hovering');
    const removeMagnetEffect = () => cursor.classList.remove('hovering');
    
    const bindHover = () => {
      document.querySelectorAll('button, a, .clickable, input, select, .ing-row, .card, .cockpit-card').forEach(el => {
        el.removeEventListener('mouseenter', addMagnetEffect);
        el.removeEventListener('mouseleave', removeMagnetEffect);
        
        el.addEventListener('mouseenter', addMagnetEffect);
        el.addEventListener('mouseleave', removeMagnetEffect);
      });
    };
    
    // Bind initial
    bindHover();
    
    // Re-bind when DOM changes (simplified with interval or mutations, here we hook into navigation)
    const observer = new MutationObserver(() => bindHover());
    observer.observe(document.body, { childList: true, subtree: true });
  }
});
