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
  ingredientPrices: [],
  labShares: [],           // Labs partagés avec moi
  membresPartages: [],     // Membres que j'ai invités dans mon labo
  activeLab: null,         // { share_id, owner_user_id, owner_name, role } ou null (= mon propre labo)
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
