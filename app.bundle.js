/* 
  =============================================================================
  GourmetRevient Application Bundle (Production)
  Généré automatiquement le : 2026-06-11T16:32:06.647Z
  =============================================================================
*/


// --- MODULE: app-state.js ---
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
labShares: [],
membresPartages: [],     // Membres que j'ai invités dans mon labo
activeLab: null,
suppliers: [
{ id: 101, name: 'Metro Cash & Carry', contact: 'M. Lefebvre', email: 'service-client@metro.fr', categories: ['Général', 'Frais', 'Sec'], rating: 4.8 },
{ id: 102, name: 'Valrhona', contact: 'Claire Val', email: 'pro@valrhona.com', categories: ['Chocolat', 'Praliné', 'Couverture'], rating: 5.0 },
{ id: 103, name: 'Grands Moulins de Paris', contact: 'Jean Meunier', email: 'commandes@gmp.fr', categories: ['Farine', 'Mixes', 'Céréales'], rating: 4.9 }
],
history: [],
haccpLogs: { temp: [], trace: [], clean: [], reception: [] },
viewOwner: null,
notifications: [],
baselineCosts: null,
wasteLogs: []
};
window.APP = APP;
let v2Charts = { margin: null, performance: null, scatter: null };
let perfMode = 'top';
window.currentStatsCat = 'all';
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
const DEFAULT_INGREDIENT_DB = [
{ name: 'Farine T45', unit: 'g', pricePerUnit: 0.48, priceRef: 'kg', allergens: ['Gluten'] , origin: 'france' },
{ name: 'Farine T55', unit: 'g', pricePerUnit: 0.44, priceRef: 'kg', allergens: ['Gluten'] , origin: 'france' },
{ name: 'Farine de Gruau T45', unit: 'g', pricePerUnit: 1.10, priceRef: 'kg', allergens: ['Gluten'] , origin: 'france' },
{ name: 'Farine T55 Label Rouge', unit: 'g', pricePerUnit: 0.95, priceRef: 'kg', allergens: ['Gluten'] , origin: 'local' },
{ name: 'Farine de Seigle T130', unit: 'g', pricePerUnit: 1.50, priceRef: 'kg', allergens: ['Gluten'] , origin: 'france' },
{ name: 'Farine de Sarrasin', unit: 'g', pricePerUnit: 2.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Farine de Riz (S.G)', unit: 'g', pricePerUnit: 3.20, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Farine de Châtaigne', unit: 'g', pricePerUnit: 9.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Fécule de Pomme de Terre', unit: 'g', pricePerUnit: 2.20, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Maïzena', unit: 'g', pricePerUnit: 1.80, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Beurre AOP', unit: 'g', pricePerUnit: 6.15, priceRef: 'kg', allergens: ['Lait'] , origin: 'local' },
{ name: 'Beurre doux', unit: 'g', pricePerUnit: 5.50, priceRef: 'kg', allergens: ['Lait'] , origin: 'france' },
{ name: 'Beurre Tourage AOP 82%', unit: 'g', pricePerUnit: 10.50, priceRef: 'kg', allergens: ['Lait'] , origin: 'local' },
{ name: 'Beurre de Cacao', unit: 'g', pricePerUnit: 12.50, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Beurre de Cacao Mycryo', unit: 'g', pricePerUnit: 28.00, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Huile de Coco Vierge', unit: 'ml', pricePerUnit: 12.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Sucre semoule', unit: 'g', pricePerUnit: 0.68, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Sucre glace', unit: 'g', pricePerUnit: 1.60, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Sucre Muscovado', unit: 'g', pricePerUnit: 3.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Vergeoise Brune', unit: 'g', pricePerUnit: 2.80, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Sucre de Fleur de Coco', unit: 'g', pricePerUnit: 11.00, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Glucose', unit: 'g', pricePerUnit: 3.50, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Sirop de Glucose', unit: 'g', pricePerUnit: 2.80, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Trimoline (Sucre Inverti)', unit: 'g', pricePerUnit: 3.80, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Miel de Fleurs', unit: 'g', pricePerUnit: 6.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Sirop d\'Erable Grade A', unit: 'ml', pricePerUnit: 28.00, priceRef: 'L', allergens: [] , origin: 'france' },
{ name: 'Isomalt', unit: 'g', pricePerUnit: 6.50, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Sorbitol Poudre', unit: 'g', pricePerUnit: 18.00, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Lait entier', unit: 'ml', pricePerUnit: 0.72, priceRef: 'L', allergens: ['Lait'] , origin: 'france' },
{ name: 'Lait d\'Amande Pro', unit: 'ml', pricePerUnit: 2.80, priceRef: 'L', allergens: ['Fruits à coque'] , origin: 'france' },
{ name: 'Crème 35% MG Excellence', unit: 'ml', pricePerUnit: 4.50, priceRef: 'L', allergens: ['Lait'] , origin: 'france' },
{ name: 'Crème 35% MG', unit: 'ml', pricePerUnit: 3.25, priceRef: 'L', allergens: ['Lait'] , origin: 'france' },
{ name: 'Mascarpone', unit: 'g', pricePerUnit: 6.80, priceRef: 'kg', allergens: ['Lait'] , origin: 'france' },
{ name: 'Œufs Frais (L)', unit: 'pièce', pricePerUnit: 0.18, priceRef: 'pièce', allergens: ['Œufs'] , origin: 'local' },
{ name: 'Œufs entiers', unit: 'pièce', pricePerUnit: 0.11, priceRef: 'pièce', allergens: ['Œufs'] , origin: 'france' },
{ name: 'Jaunes d\'œufs', unit: 'pièce', pricePerUnit: 0.11, priceRef: 'pièce', allergens: ['Œufs'] , origin: 'france' },
{ name: 'Blancs d\'œufs', unit: 'pièce', pricePerUnit: 0.08, priceRef: 'pièce', allergens: ['Œufs'] , origin: 'france' },
{ name: 'Blanc d\'œuf Pasteurisé', unit: 'g', pricePerUnit: 4.50, priceRef: 'kg', allergens: ['Œufs'] , origin: 'france' },
{ name: 'Jaune d\'œuf Pasteurisé', unit: 'g', pricePerUnit: 9.00, priceRef: 'kg', allergens: ['Œufs'] , origin: 'france' },
{ name: 'Poudre de Blanc d\'Œuf', unit: 'g', pricePerUnit: 35.00, priceRef: 'kg', allergens: ['Œufs'] , origin: 'france' },
{ name: 'Chocolat noir 64%', unit: 'g', pricePerUnit: 11.50, priceRef: 'kg', allergens: ['Lait', 'Soja'] , origin: 'import' },
{ name: 'Chocolat Guanaja 70%', unit: 'g', pricePerUnit: 18.50, priceRef: 'kg', allergens: ['Lait', 'Soja'] , origin: 'import' },
{ name: 'Chocolat au Lait 35%', unit: 'g', pricePerUnit: 10.20, priceRef: 'kg', allergens: ['Lait', 'Soja'] , origin: 'import' },
{ name: 'Chocolat Jivara 40%', unit: 'g', pricePerUnit: 17.20, priceRef: 'kg', allergens: ['Lait', 'Soja'] , origin: 'import' },
{ name: 'Chocolat Blanc 33%', unit: 'g', pricePerUnit: 9.80, priceRef: 'kg', allergens: ['Lait', 'Soja'] , origin: 'import' },
{ name: 'Chocolat Opalys 33%', unit: 'g', pricePerUnit: 18.90, priceRef: 'kg', allergens: ['Lait', 'Soja'] , origin: 'import' },
{ name: 'Chocolat Dulcey 35%', unit: 'g', pricePerUnit: 19.80, priceRef: 'kg', allergens: ['Lait', 'Soja'] , origin: 'import' },
{ name: 'Cacao poudre', unit: 'g', pricePerUnit: 12.00, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Poudre Cacao Barry', unit: 'g', pricePerUnit: 18.00, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Pâte à glacer Brune', unit: 'g', pricePerUnit: 8.50, priceRef: 'kg', allergens: ['Soja'] , origin: 'france' },
{ name: 'Fraises fraîches', unit: 'g', pricePerUnit: 4.50, priceRef: 'kg', allergens: [] , origin: 'local' },
{ name: 'Pomme Golden', unit: 'kg', pricePerUnit: 2.20, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Poire Williams', unit: 'kg', pricePerUnit: 3.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Menthe Fraîche', unit: 'g', pricePerUnit: 25.00, priceRef: 'kg', allergens: [] , origin: 'local' },
{ name: 'Citron Vert', unit: 'pièce', pricePerUnit: 0.45, priceRef: 'pièce', allergens: [] , origin: 'france' },
{ name: 'Orange', unit: 'pièce', pricePerUnit: 0.35, priceRef: 'pièce', allergens: [] , origin: 'france' },
{ name: 'Griottes au Sirop', unit: 'g', pricePerUnit: 12.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Purée de Fraise', unit: 'ml', pricePerUnit: 11.50, priceRef: 'L', allergens: [] , origin: 'local' },
{ name: 'Purée de Framboise', unit: 'ml', pricePerUnit: 13.20, priceRef: 'L', allergens: [] , origin: 'france' },
{ name: 'Purée de Mangue', unit: 'ml', pricePerUnit: 12.80, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Purée de Passion', unit: 'ml', pricePerUnit: 14.80, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Purée de Cassis', unit: 'ml', pricePerUnit: 11.20, priceRef: 'L', allergens: [] , origin: 'france' },
{ name: 'Purée de Yuzu', unit: 'ml', pricePerUnit: 55.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Purée de Litchi', unit: 'ml', pricePerUnit: 16.50, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Purée de Noix de Coco', unit: 'ml', pricePerUnit: 14.20, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Purée de Goyave Rose', unit: 'ml', pricePerUnit: 15.80, priceRef: 'L', allergens: [] , origin: 'france' },
{ name: 'Purée de Bergamote', unit: 'ml', pricePerUnit: 24.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Poudre de Fraise Lyophilisée', unit: 'g', pricePerUnit: 120.00, priceRef: 'kg', allergens: [] , origin: 'local' },
{ name: 'Poudre d\'amandes', unit: 'g', pricePerUnit: 9.50, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'france' },
{ name: 'Amandes effilées', unit: 'g', pricePerUnit: 9.50, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Amandes blanchies', unit: 'g', pricePerUnit: 11.20, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Noisettes torréfiées', unit: 'g', pricePerUnit: 12.50, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Poudre de Noisette', unit: 'g', pricePerUnit: 14.50, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Pâte de Noisette 100%', unit: 'g', pricePerUnit: 24.00, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Pâte Noisette Piémont I.G.P', unit: 'g', pricePerUnit: 42.00, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Praliné noisette', unit: 'g', pricePerUnit: 14.50, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Pistaches Entières', unit: 'g', pricePerUnit: 28.50, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Pâte de pistache', unit: 'g', pricePerUnit: 38.00, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Pistache de Bronte D.O.P', unit: 'g', pricePerUnit: 85.00, priceRef: 'kg', allergens: ['Fruits à coque'] , origin: 'import' },
{ name: 'Noix de Coco Râpée', unit: 'g', pricePerUnit: 7.20, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Vanille (gousse)', unit: 'pièce', pricePerUnit: 1.80, priceRef: 'pièce', allergens: [] , origin: 'import' },
{ name: 'Gousse Vanille Bourbon', unit: 'pièce', pricePerUnit: 2.50, priceRef: 'pièce', allergens: [] , origin: 'import' },
{ name: 'Gousses de Vanille Tahiti', unit: 'pièce', pricePerUnit: 4.50, priceRef: 'pièce', allergens: [] , origin: 'import' },
{ name: 'Arôme Naturel Vanille', unit: 'ml', pricePerUnit: 45.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Arôme Amande Amère', unit: 'ml', pricePerUnit: 35.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Extrait Café Trablit', unit: 'ml', pricePerUnit: 52.00, priceRef: 'L', allergens: [] , origin: 'france' },
{ name: 'Café soluble', unit: 'g', pricePerUnit: 18.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Matcha Cérémonial', unit: 'g', pricePerUnit: 250.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Thé Matcha', unit: 'g', pricePerUnit: 85.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Tonka (fèves entières)', unit: 'g', pricePerUnit: 110.00, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Poivre de Timut', unit: 'g', pricePerUnit: 95.00, priceRef: 'kg', allergens: [] , origin: 'import' },
{ name: 'Eau de Fleur d\'Oranger', unit: 'ml', pricePerUnit: 18.00, priceRef: 'L', allergens: [] , origin: 'france' },
{ name: 'Sel', unit: 'g', pricePerUnit: 0.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Fleur de sel', unit: 'g', pricePerUnit: 18.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Fleur de Sel de Guérande', unit: 'g', pricePerUnit: 12.00, priceRef: 'kg', allergens: [] , origin: 'local' },
{ name: 'Sel de Guérande Moulu', unit: 'g', pricePerUnit: 0.85, priceRef: 'kg', allergens: [] , origin: 'local' },
{ name: 'Rhum Ambré 54%', unit: 'ml', pricePerUnit: 42.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Grand Marnier 54%', unit: 'ml', pricePerUnit: 48.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Amaretto Disaronno', unit: 'ml', pricePerUnit: 32.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Kirsh Pâtissier', unit: 'ml', pricePerUnit: 35.00, priceRef: 'L', allergens: [] , origin: 'import' },
{ name: 'Levure fraîche', unit: 'g', pricePerUnit: 6.50, priceRef: 'kg', allergens: [] , origin: 'local' },
{ name: 'Levure chimique', unit: 'g', pricePerUnit: 8.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Poudre à lever', unit: 'g', pricePerUnit: 4.20, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Bicarbonate de soude', unit: 'g', pricePerUnit: 2.50, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Gélatine en feuilles (Or)', unit: 'g', pricePerUnit: 28.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Gélatine poudre 200 Bloom', unit: 'g', pricePerUnit: 22.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Agar-agar', unit: 'g', pricePerUnit: 65.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Pectine NH', unit: 'g', pricePerUnit: 45.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Pectine X58', unit: 'g', pricePerUnit: 75.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Pectine Jaune', unit: 'g', pricePerUnit: 68.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Pectine Rapide (Nappage)', unit: 'g', pricePerUnit: 52.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Acide Citrique', unit: 'g', pricePerUnit: 12.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Crème de Tartre', unit: 'g', pricePerUnit: 28.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Feuillantine', unit: 'g', pricePerUnit: 18.50, priceRef: 'kg', allergens: ['Gluten'] , origin: 'france' },
{ name: 'Speculoos', unit: 'g', pricePerUnit: 6.20, priceRef: 'kg', allergens: ['Gluten'] , origin: 'france' },
{ name: 'Colorant Jaune Hydrosoluble', unit: 'g', pricePerUnit: 95.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Colorant Noir Carbone', unit: 'g', pricePerUnit: 150.00, priceRef: 'kg', allergens: [] , origin: 'france' },
{ name: 'Feuille d\'Or 24 carats', unit: 'pièce', pricePerUnit: 2.50, priceRef: 'pièce', allergens: [] , origin: 'france' },
];
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
const titleEl = document.getElementById('planningCalendarTitle');
const legendEl = document.getElementById('planningHolidayLegend');
if (titleEl) {
titleEl.textContent = t('plan.calendar.title');
}
if (legendEl) {
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

// --- MODULE: app-core.js ---
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
window.closeModal = function(id) {
const m = document.getElementById(id);
if (!m) return;
m.classList.remove('modal-visible');
setTimeout(() => { if (!m.classList.contains('modal-visible')) m.style.display = 'none'; }, 260);
};
window.openModal = function(id) {
const m = document.getElementById(id);
if (!m) return;
m.style.display = 'flex';
requestAnimationFrame(() => m.classList.add('modal-visible'));
m._openedAt = Date.now();
const closeOnBackdrop = [
'chefsBrainModal', 'assemblyModal', 'masterConverterModal', 'labSwitcherModal',
'lotRegistreModal', 'priceComparatorModal', 'modalHaccpTemp', 'modalHaccpReception',
'lotTraceabilityModal', 'ingredientConfigModal', 'dbModal', 'offModal', 'comparatorModal',
'restockModal', 'pinModal', 'productionModal', 'supplierModal', 'adminUserModal', 'ocrScannerModal', 'qrModal',
'recipeComparatorModal', 'workloadModal', 'vitrineLabelsModal', 'inflationComparatorModal',
'invoiceGeneratorModal', 'haccpReminderModal', 'supplierOrderModal', 'seasonalTimelineModal',
'recipeHistoryModal', 'incoModal', 'foisonnementModal', 'cloudSyncModal', 'clientQRModal', 'eCatalogueModal'
];
if (closeOnBackdrop.includes(id) && !m._backdropHandlerBound) {
let mousedownOnSelf = false;
m.addEventListener('mousedown', (e) => {
mousedownOnSelf = (e.target === m);
});
m.addEventListener('click', (e) => {
if (e.target === m && mousedownOnSelf) {
if (Date.now() - (m._openedAt || 0) < 300) {
return;
}
if (id === 'chefsBrainModal' && typeof window.closeChefsBrain === 'function') {
window.closeChefsBrain();
} else if (id === 'assemblyModal' && typeof window.closeAssemblySimulator === 'function') {
window.closeAssemblySimulator();
} else if (id === 'masterConverterModal' && typeof window.closeMasterConverter === 'function') {
window.closeMasterConverter();
} else {
window.closeModal(id);
}
}
});
m._backdropHandlerBound = true;
}
};
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
function calcIngredientCost(ing, depth = 0) {
if (depth > 5) return 0;
const qty = parseFloat(ing.quantity) || 0;
const unit = ing.unit || 'g';
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
if (window.SousRecettes && subRecipe.sousRecettes) {
subRecipe.sousRecettes.forEach(sr => {
subCost += SousRecettes.calcCoutSousRecette(sr);
subWeightGrams += parseFloat(sr.quantiteUtilisee) || 0;
});
}
if (subWeightGrams === 0) return 0;
let reqQtyInGrams = qty;
if (unit === 'kg' || unit === 'L') reqQtyInGrams *= 1000;
const rendement = parseFloat(ing.rendement) || 100;
if (unit === 'pièce') {
return (subCost * qty) / (rendement / 100);
}
return ((subCost / subWeightGrams) * reqQtyInGrams) / (rendement / 100);
}
let price = parseFloat(ing.pricePerUnit);
if (isNaN(price)) price = parseFloat(ing.pricePerKg);
if (isNaN(price)) price = parseFloat(ing.pricePerL);
if (isNaN(price)) price = parseFloat(ing.pricePerPc);
if (isNaN(price)) price = 0;
if (window.ingredientPriceOverrides && ing.name) {
const overridePercent = window.ingredientPriceOverrides[ing.name.trim().toLowerCase()];
if (overridePercent !== undefined) {
price = price * (1 + overridePercent / 100);
}
}
if (unit === 'g' || unit === 'ml') return (qty / 1000) * price;
return qty * price;
}
function calcTotalMaterialCost() {
const ingCost = APP.recipe.ingredients.reduce((sum, ing) => sum + calcIngredientCost(ing), 0);
const srCost = (window.SousRecettes && APP.recipe.sousRecettes)
? APP.recipe.sousRecettes.reduce((sum, sr) => sum + SousRecettes.calcCoutSousRecette(sr), 0)
: 0;
return ingCost + srCost;
}
function calcFullCost(margin, customRecipe = null, forcedInflation = null) {
if (!window.calcFullCost) window.calcFullCost = calcFullCost;
const r = customRecipe || APP.recipe;
const portions = r.portions || 10;
const infl = (forcedInflation !== null) ? forcedInflation : (window.inflationFactor || 0);
const costMultiplier = infl / 100 + 1;
const ingCost = r.ingredients ? r.ingredients.reduce((sum, ing) => sum + calcIngredientCost(ing), 0) : 0;
const srCost = (window.SousRecettes && r.sousRecettes)
? r.sousRecettes.reduce((sum, sr) => sum + SousRecettes.calcCoutSousRecette(sr), 0)
: 0;
const totalMaterial = (ingCost + srCost) * costMultiplier;
let laborRate = 0, fixedCharges = 0, productions = 1, energyRate = 0, amortization = 0;
let packagingCost = 0, apprenticeTime = 0, commisTime = 0, chefTime = 0;
const isCurrent = (r === APP.recipe);
const advEl = $('#advLaborRate');
if (isCurrent && advEl && APP.currentStep === 4) {
laborRate = parseFloat($('#advLaborRate').value) || 0;
fixedCharges = parseFloat($('#advFixedCharges').value) || 0;
productions = Math.max(1, parseInt($('#advProductions').value) || 1);
energyRate = parseFloat($('#advEnergy').value) || 0;
amortization = parseFloat($('#advAmortization').value) || 0;
packagingCost = parseFloat($('#advPackagingCost').value) || 0;
apprenticeTime = parseFloat($('#advApprenticeTime').value) || 0;
commisTime = parseFloat($('#advCommisTime').value) || 0;
chefTime = parseFloat($('#advChefTime').value) || 0;
} else if (r.advanced) {
laborRate = r.advanced.laborRate || 0;
fixedCharges = r.advanced.fixedCharges || 0;
productions = r.advanced.productions || 1;
energyRate = r.advanced.energyRate || 0;
amortization = r.advanced.amortization || 0;
packagingCost = r.advanced.packagingCost || 0;
apprenticeTime = r.advanced.apprenticeTime || 0;
commisTime = r.advanced.commisTime || 0;
chefTime = r.advanced.chefTime || 0;
}
const prepTime = parseFloat(r.prepTime) || 0;
const cookTime = parseFloat(r.cookTime) || 0;
const totalTimeH = (prepTime + cookTime) / 60;
let laborCost = 0;
const profileTotalTime = apprenticeTime + commisTime + chefTime;
if (profileTotalTime > 0) {
laborCost = (apprenticeTime * 8 + commisTime * 14 + chefTime * 24) / 60;
} else {
laborCost = laborRate * totalTimeH;
}
const energyCost = (energyRate * (cookTime / 60)) * costMultiplier;
const fixedShare = fixedCharges / productions;
const amortShare = amortization / productions;
const additionalCosts = laborCost + energyCost + fixedShare + amortShare;
const totalFullCost = totalMaterial + additionalCosts + (packagingCost * portions);
const costPerPortion = totalFullCost / portions;
const marginRate = (margin || APP.margin) / 100;
const sellingPrice = marginRate < 1 ? costPerPortion / (1 - marginRate) : costPerPortion * 10;
const marginPerPortion = sellingPrice - costPerPortion;
const marginPct = sellingPrice > 0 ? (marginPerPortion / sellingPrice) * 100 : 0;
let tvaRate = 5.5;
const tvaEl = document.getElementById('recipeTvaRate');
if (isCurrent && tvaEl) {
tvaRate = parseFloat(tvaEl.value) || 5.5;
} else if (r && r.tvaRate !== undefined) {
tvaRate = parseFloat(r.tvaRate) || 5.5;
}
const tvaAmount = sellingPrice * (tvaRate / 100);
const sellingPriceTTC = sellingPrice + tvaAmount;
return {
tvaRate,
tvaAmount: round2(tvaAmount),
sellingPriceTTC: round2(sellingPriceTTC),
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
productions,
packagingCost: round2(packagingCost),
apprenticeTime,
commisTime,
chefTime
};
}
function getViewOwner() {
return APP.viewOwner || localStorage.getItem(STORAGE_KEYS.currentUser) || 'Ami';
}
function getUserRecipesKey() {
const uid = localStorage.getItem('gourmet_user_id');
if (uid) return `gourmet_recettes_${uid}`;
const owner = getViewOwner();
return `gourmetrevient_recipes_${owner.toLowerCase()}`;
}
function getUserTeamKey() {
const uid = localStorage.getItem('gourmet_user_id');
if (uid) return `gourmet_team_${uid}`;
const owner = getViewOwner();
return `${STORAGE_KEYS.teamMembers}_${owner.toLowerCase()}`;
}
function getUserInventoryKey() {
const uid = localStorage.getItem('gourmet_user_id');
if (uid) return `gourmet_inventory_${uid}`;
const owner = getViewOwner();
return `gourmet_inventory_${owner.toLowerCase()}`;
}
function getUserLeavesKey() {
const uid = localStorage.getItem('gourmet_user_id');
if (uid) return `gourmet_leaves_${uid}`;
const owner = getViewOwner();
return `${STORAGE_KEYS.staffLeaves}_${owner.toLowerCase()}`;
}
function getUserLabPlanKey() {
const uid = localStorage.getItem('gourmet_user_id');
if (uid) return `gourmet_lab_${uid}`;
const owner = getViewOwner();
return `gourmet_lab_plan_${owner.toLowerCase()}`;
}
function getUserPlacementsKey() {
const uid = localStorage.getItem('gourmet_user_id');
if (uid) return `gourmet_placements_${uid}`;
const owner = getViewOwner();
return `labpatiss_placements_${owner.toLowerCase()}`;
}
async function loadSavedRecipes() {
try {
const key = getUserRecipesKey();
const uid = localStorage.getItem('gourmet_user_id');
if (uid) {
const newKey = `gourmet_recettes_${uid}`;
if (!localStorage.getItem(newKey)) {
const owner = getViewOwner();
const oldKey = `gourmetrevient_recipes_${owner.toLowerCase()}`;
const oldData = localStorage.getItem(oldKey);
if (oldData) {
localStorage.setItem(newKey, oldData);
console.info('[GourmetSync] Migration clé localStorage : username → UUID');
}
}
}
const localData = localStorage.getItem(key);
if (localData) APP.savedRecipes = JSON.parse(localData);
if (window.GourmetSync && navigator.onLine) {
const cloudData = await GourmetSync.chargerRecettes();
if (cloudData !== null && cloudData !== undefined) {
APP.savedRecipes = cloudData;
localStorage.setItem(key, JSON.stringify(cloudData));
}
}
let needsSave = false;
APP.savedRecipes.forEach(r => {
if (!r.costs && typeof calcFullCost === 'function') {
r.margin = r.margin || 70;
r.costs = calcFullCost(r.margin, r);
needsSave = true;
}
});
if (needsSave) saveSavedRecipes();
const isDemo = localStorage.getItem('gourmet_demo_mode') === 'true';
if (APP.savedRecipes.length === 0 && isDemo) {
seedDemoData();
}
} catch (err) {
console.error('Erreur chargement recettes:', err);
APP.savedRecipes = [];
}
}
function seedDemoData() {
const demoPool = (typeof RECIPES !== 'undefined') ? RECIPES.slice(0, 15) : [];
demoPool.forEach(r => {
const exists = APP.savedRecipes.some(saved => saved.name === r.name);
if (!exists) {
const copy = JSON.parse(JSON.stringify(r));
copy.savedAt = new Date().toISOString();
copy.margin = 68 + (Math.random() * 12);
copy.costs = calcFullCost(copy.margin, copy);
APP.savedRecipes.push(copy);
}
});
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
async function saveSavedRecipes() {
const key = getUserRecipesKey();
localStorage.setItem(key, JSON.stringify(APP.savedRecipes));
if (window.GourmetSync && navigator.onLine) {
for (const recipe of APP.savedRecipes) {
await GourmetSync.sauvegarderRecette(recipe);
}
}
}
function loadIngredientDb() {
try {
const data = localStorage.getItem(STORAGE_KEYS.ingredientDb);
const saved = data ? JSON.parse(data) : [];
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
async function loadInventory() {
const userKey = getUserInventoryKey();
const userData = localStorage.getItem(userKey);
if (userData) {
try { APP.inventory = JSON.parse(userData); } catch(e) { APP.inventory = []; }
}
if (navigator.onLine && window.gourmetSupabase) {
try {
const { data: { session } } = await gourmetSupabase.auth.getSession();
const userId = session?.user?.id;
if (userId) {
const { data: cloudItems, error } = await gourmetSupabase
.from('ingredients')
.select('*')
.eq('user_id', userId)
.order('nom', { ascending: true }); // colonne réelle : 'nom'
if (!error && cloudItems !== null) {
if (cloudItems.length > 0) {
APP.inventory = cloudItems.map(row => ({
id: row.id,
name: row.nom || row.name || '',   // 'nom' est la colonne réelle
stock: row.stock_actuel || 0,
unit: row.unite || 'g',
price: row.prix_unitaire || 0,
alertThreshold: row.seuil_alerte || (row.unite === 'g' || row.unite === 'ml' ? 1000 : 5),
lastUpdate: row.updated_at || new Date().toISOString(),
priceHistory: row.price_history || []
}));
localStorage.setItem(userKey, JSON.stringify(APP.inventory));
} else {
APP.inventory = [];
DEFAULT_INGREDIENT_DB.forEach(ing => {
APP.inventory.push({
id: 'inv_' + Math.random().toString(36).substr(2, 9),
name: ing.name,
stock: 0,
unit: ing.unit,
price: ing.pricePerUnit,
alertThreshold: ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 5,
lastUpdate: new Date().toISOString()
});
});
localStorage.setItem(userKey, JSON.stringify(APP.inventory));
}
}
if (typeof GourmetSync !== 'undefined' && typeof GourmetSync.chargerIngredientPrices === 'function') {
const prices = await GourmetSync.chargerIngredientPrices();
if (prices !== null) {
APP.ingredientPrices = prices;
}
}
}
} catch (e) {
console.warn('[Inventory] Erreur cloud, cache local utilisé:', e.message);
}
}
if (typeof GourmetSync !== 'undefined' && typeof GourmetSync.chargerLabsPartagesAvecMoi === 'function') {
const shared = await GourmetSync.chargerLabsPartagesAvecMoi();
APP.labShares = shared || [];
refreshLabSwitcher();
}
if (APP.inventory.length === 0) {
const isDemo = localStorage.getItem('gourmet_demo_mode') === 'true';
if (isDemo) {
initInventoryFromDb();
} else {
DEFAULT_INGREDIENT_DB.forEach(ing => {
APP.inventory.push({
id: 'inv_' + Math.random().toString(36).substr(2, 9),
name: ing.name,
stock: 0,
unit: ing.unit,
price: ing.pricePerUnit,
alertThreshold: ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 5,
lastUpdate: new Date().toISOString()
});
});
localStorage.setItem(userKey, JSON.stringify(APP.inventory));
}
}
}
function refreshLabSwitcher() {
const activeShares = APP.labShares.filter(s => s.status === 'active');
const pendingShares = APP.labShares.filter(s => s.status === 'pending');
let btn = $('#labSwitcherBtn');
if (activeShares.length === 0 && pendingShares.length === 0) {
if (btn) btn.style.display = 'none';
return;
}
if (!btn) {
const navRight = document.querySelector('.nav-right') || document.querySelector('.nav-actions');
if (navRight) {
btn = document.createElement('button');
btn.id = 'labSwitcherBtn';
btn.className = 'btn btn-outline btn-sm';
btn.style = 'position:relative; display:flex; align-items:center; gap:6px; font-size:0.8rem;';
btn.onclick = () => openLabSwitcherModal();
navRight.insertBefore(btn, navRight.firstChild);
}
}
if (btn) {
const isOnSharedLab = APP.activeLab !== null;
const badgeCount = pendingShares.length;
btn.innerHTML = `
🏭 ${isOnSharedLab ? `<strong>${escapeHtml(APP.activeLab.owner_name || 'Lab Partagé')}</strong>` : 'Mon Labo'}
${badgeCount > 0 ? `<span style="background:var(--danger);color:white;border-radius:50%;width:16px;height:16px;font-size:0.65rem;display:inline-flex;align-items:center;justify-content:center;font-weight:800;">${badgeCount}</span>` : ''}
`;
btn.title = isOnSharedLab ? 'Cliquer pour changer de laboratoire' : 'Vous visualisez votre propre laboratoire';
btn.style.display = 'flex';
}
const badge = $('#labPendingBadge');
if (badge) {
if (pendingShares.length > 0) {
badge.textContent = pendingShares.length;
badge.style.display = 'inline-block';
} else {
badge.style.display = 'none';
}
}
const indicator = $('#activeLabIndicator');
const activeLabel = $('#activeLabLabel');
const btnLabel = $('#btnLabSwitcherLabel');
if (indicator) {
if (APP.activeLab !== null) {
indicator.style.display = 'block';
if (activeLabel) activeLabel.textContent = APP.activeLab.owner_name || 'Lab Partagé';
if (btnLabel) btnLabel.textContent = 'Changer de laboratoire';
} else {
indicator.style.display = 'none';
if (btnLabel) btnLabel.textContent = 'Gérer les accès partagés';
}
}
}
async function openLabSwitcherModal() {
const modal = $('#labSwitcherModal');
if (!modal) return;
if (typeof GourmetSync !== 'undefined' && typeof GourmetSync.chargerMembresPartages === 'function') {
const membres = await GourmetSync.chargerMembresPartages();
APP.membresPartages = membres || [];
}
const banner = $('#labActiveBanner');
if (banner) {
if (APP.activeLab !== null) {
banner.style.display = 'flex';
const nameEl = $('#labActiveName');
if (nameEl) nameEl.textContent = `🏭 ${APP.activeLab.owner_name || 'Lab Partagé'}`;
} else {
banner.style.display = 'none';
}
}
renderLabSwitcherModal();
window.openModal('labSwitcherModal');
}
function renderLabSwitcherModal() {
const activeShares = APP.labShares.filter(s => s.status === 'active');
const pendingShares = APP.labShares.filter(s => s.status === 'pending');
const membresInvites = APP.membresPartages || [];
const isOnMine = APP.activeLab === null;
const labsHtml = `
<div style="margin-bottom:1.5rem;">
<h4 style="font-weight:800; margin:0 0 0.8rem 0; color:var(--text-main);">📌 Labs disponibles</h4>
<div style="display:flex; flex-direction:column; gap:8px;">
<div class="lab-option ${isOnMine ? 'active' : ''}"
onclick="switchToLab(null)"
style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;cursor:pointer;border:2px solid ${isOnMine ? 'var(--accent)' : 'var(--border)'};background:${isOnMine ? 'rgba(var(--accent-rgb),0.08)' : 'var(--surface)'};">
<span style="font-size:1.5rem;">🏠</span>
<div style="flex:1;">
<strong style="display:block;">Mon Laboratoire</strong>
<small style="color:var(--text-muted);">Mes propres recettes, planning et inventaire</small>
</div>
${isOnMine ? '<span style="color:var(--accent);font-weight:800;">✓ Actif</span>' : ''}
</div>
${activeShares.map(s => `
<div class="lab-option ${APP.activeLab?.share_id === s.share_id ? 'active' : ''}"
onclick="switchToLab('${s.share_id}', '${s.owner_user_id}', '${escapeHtml(s.owner_name || s.owner_email)}', '${s.role}')"
style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;cursor:pointer;border:2px solid ${APP.activeLab?.share_id === s.share_id ? 'var(--accent)' : 'var(--border)'};background:${APP.activeLab?.share_id === s.share_id ? 'rgba(var(--accent-rgb),0.08)' : 'var(--surface)'};">
<span style="font-size:1.5rem;">🏭</span>
<div style="flex:1;">
<strong style="display:block;">${escapeHtml(s.owner_name || s.owner_email)}</strong>
<small style="color:var(--text-muted);">Rôle : ${s.role === 'editor' ? '✏️ Éditeur' : '👁️ Observateur'}</small>
</div>
${APP.activeLab?.share_id === s.share_id ? '<span style="color:var(--accent);font-weight:800;">✓ Actif</span>' : ''}
<button class="btn btn-sm" style="background:transparent;color:var(--danger);border:none;font-size:0.8rem;cursor:pointer;"
onclick="event.stopPropagation(); quitterLab('${s.share_id}')">Quitter</button>
</div>
`).join('')}
</div>
</div>
${pendingShares.length > 0 ? `
<div style="margin-bottom:1.5rem;">
<h4 style="font-weight:800; margin:0 0 0.8rem 0; color:var(--warning);">🔔 Invitations en attente</h4>
<div style="display:flex; flex-direction:column; gap:8px;">
${pendingShares.map(s => `
<div style="display:flex;align-items:center;gap:12px;padding:12px 16px;border-radius:12px;border:2px dashed var(--warning);background:rgba(245,158,11,0.05);">
<span style="font-size:1.5rem;">✉️</span>
<div style="flex:1;">
<strong style="display:block;">${escapeHtml(s.owner_name || s.owner_email)}</strong>
<small style="color:var(--text-muted);">Rôle proposé : ${s.role === 'editor' ? '✏️ Éditeur' : '👁️ Observateur'}</small>
</div>
<div style="display:flex;gap:6px;">
<button class="btn btn-sm btn-primary" onclick="accepterInvitation('${s.share_id}')">✓ Accepter</button>
<button class="btn btn-sm btn-outline" onclick="refuserInvitation('${s.share_id}')" style="color:var(--danger);">✕ Refuser</button>
</div>
</div>
`).join('')}
</div>
</div>
` : ''}
<div>
<h4 style="font-weight:800; margin:0 0 0.8rem 0; color:var(--text-main);">👥 Membres invités dans mon labo</h4>
${membresInvites.length === 0 ? `<p style="color:var(--text-muted);font-size:0.85rem;">Aucun membre invité pour l'instant.</p>` : `
<div style="display:flex; flex-direction:column; gap:6px; margin-bottom:1rem;">
${membresInvites.map(m => `
<div style="display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;background:var(--surface);border:1px solid var(--border);">
<span style="font-size:1.2rem;">${m.status === 'active' ? '✅' : m.status === 'pending' ? '⏳' : '❌'}</span>
<div style="flex:1;">
<strong style="font-size:0.9rem;">${escapeHtml(m.member_email)}</strong>
<small style="color:var(--text-muted); display:block;">${m.role === 'editor' ? 'Éditeur' : 'Observateur'} — ${m.status === 'active' ? 'Actif' : m.status === 'pending' ? 'En attente' : 'Refusé'}</small>
</div>
<button class="btn btn-sm" style="color:var(--danger);background:transparent;border:none;cursor:pointer;"
onclick="revoquerMembre('${m.id}')">✕ Révoquer</button>
</div>
`).join('')}
</div>
`}
<div style="display:flex; gap:8px; flex-wrap:wrap;">
<input type="email" id="inviteEmailInput" class="form-input" placeholder="email@collaborateur.fr" style="flex:1;min-width:200px;" />
<select id="inviteRoleSelect" class="form-input" style="width:130px;">
<option value="viewer">👁️ Observateur</option>
<option value="editor">✏️ Éditeur</option>
</select>
<button class="btn btn-primary" onclick="envoyerInvitation()">📨 Inviter</button>
</div>
</div>
`;
const body = $('#labSwitcherBody');
if (body) body.innerHTML = labsHtml;
}
async function switchToLab(shareId, ownerUserId = null, ownerName = null, role = null) {
if (shareId === null) {
APP.activeLab = null;
await loadInventory();
if (typeof renderPlanning === 'function') renderPlanning();
showToast('✅ Vous consultez votre propre laboratoire', 'success');
} else {
APP.activeLab = { share_id: shareId, owner_user_id: ownerUserId, owner_name: ownerName, role };
showToast(`🔄 Chargement du labo de ${ownerName}…`, 'info');
if (typeof GourmetSync !== 'undefined') {
const planning = await GourmetSync.chargerPlanningPartage(ownerUserId);
if (planning !== null) {
APP.productionPlanning = planning;
if (typeof renderPlanning === 'function') renderPlanning();
}
const inventory = await GourmetSync.chargerInventairePartage(ownerUserId);
if (inventory !== null) {
APP.inventory = inventory;
if (typeof renderInventory === 'function') renderInventory();
}
}
showToast(`✅ Vous consultez le labo de ${ownerName}`, 'success');
}
refreshLabSwitcher();
const modal = $('#labSwitcherModal');
if (modal) modal.style.display = 'none';
}
async function accepterInvitation(shareId) {
const result = await GourmetSync.accepterInvitationLab(shareId);
if (result?.success) {
showToast('✅ Invitation acceptée ! Rechargement des labs…', 'success');
const shared = await GourmetSync.chargerLabsPartagesAvecMoi();
APP.labShares = shared || [];
refreshLabSwitcher();
renderLabSwitcherModal();
} else {
showToast('⚠️ Erreur : ' + (result?.error || 'Impossible d\'accepter'), 'error');
}
}
async function refuserInvitation(shareId) {
await GourmetSync.revoquerAccesLab(shareId);
APP.labShares = APP.labShares.filter(s => s.share_id !== shareId);
showToast('Invitation refusée', 'info');
refreshLabSwitcher();
renderLabSwitcherModal();
}
async function quitterLab(shareId) {
await GourmetSync.revoquerAccesLab(shareId);
if (APP.activeLab?.share_id === shareId) {
await switchToLab(null);
}
APP.labShares = APP.labShares.filter(s => s.share_id !== shareId);
refreshLabSwitcher();
renderLabSwitcherModal();
showToast('Vous avez quitté ce laboratoire', 'info');
}
async function revoquerMembre(shareId) {
await GourmetSync.revoquerAccesLab(shareId);
APP.membresPartages = APP.membresPartages.filter(m => m.id !== shareId);
renderLabSwitcherModal();
showToast('✅ Accès révoqué', 'success');
}
async function envoyerInvitation() {
const email = ($('#inviteEmailInput')?.value || '').trim();
const role = $('#inviteRoleSelect')?.value || 'viewer';
if (!email || !email.includes('@')) {
showToast('⚠️ Veuillez entrer un email valide', 'warning');
return;
}
const btn = document.querySelector('#labSwitcherModal button[onclick="envoyerInvitation()"]');
if (btn) { btn.textContent = '⏳ Envoi…'; btn.disabled = true; }
const result = await GourmetSync.inviterMembreLab(email, role);
if (btn) { btn.textContent = '📨 Inviter'; btn.disabled = false; }
if (result?.success) {
showToast(`✅ Invitation envoyée à ${email}`, 'success');
if ($('#inviteEmailInput')) $('#inviteEmailInput').value = '';
const membres = await GourmetSync.chargerMembresPartages();
APP.membresPartages = membres || [];
renderLabSwitcherModal();
} else {
showToast('⚠️ Erreur : ' + (result?.error || 'Envoi échoué'), 'error');
}
}
async function syncInventoryWithCloud() {
if (typeof showToast === 'function') showToast('🔄 Synchronisation en cours…', 'info');
if (!navigator.onLine) {
if (typeof showToast === 'function') showToast('⚠️ Vous êtes hors ligne. Synchronisation impossible.', 'warning');
return;
}
try {
const { data: { session } } = await gourmetSupabase.auth.getSession();
const userId = session?.user?.id;
if (!userId) {
initInventoryFromDb();
if (typeof showToast === 'function') showToast('✅ Structure chargée (non connecté, stocks = 0).', 'info');
return;
}
const { data: cloudItems, error } = await gourmetSupabase
.from('ingredients')
.select('*')
.eq('user_id', userId)
.order('nom', { ascending: true }); // colonne réelle : 'nom'
if (error) throw error;
const userKey = getUserInventoryKey();
if (cloudItems && cloudItems.length > 0) {
APP.inventory = cloudItems.map(row => ({
id: row.id,
name: row.nom || row.name || '',   // 'nom' est la colonne réelle
stock: row.stock_actuel || 0,
unit: row.unite || 'g',
price: row.prix_unitaire || 0,
alertThreshold: row.seuil_alerte || (row.unite === 'g' || row.unite === 'ml' ? 1000 : 5),
lastUpdate: row.updated_at || new Date().toISOString(),
priceHistory: row.price_history || []
}));
DEFAULT_INGREDIENT_DB.forEach(ing => {
const exists = APP.inventory.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
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
localStorage.setItem(userKey, JSON.stringify(APP.inventory));
if (typeof showToast === 'function') showToast(`✅ ${cloudItems.length} produit(s) synchronisés depuis le cloud.`, 'success');
} else {
APP.inventory = [];
DEFAULT_INGREDIENT_DB.forEach(ing => {
APP.inventory.push({
id: 'inv_' + Math.random().toString(36).substr(2, 9),
name: ing.name,
stock: 0,
unit: ing.unit,
price: ing.pricePerUnit,
alertThreshold: ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 5,
lastUpdate: new Date().toISOString()
});
});
localStorage.setItem(userKey, JSON.stringify(APP.inventory));
if (typeof showToast === 'function') showToast(`✅ ${APP.inventory.length} produits chargés (aucune donnée cloud → stocks = 0).`, 'info');
}
renderInventory();
if (typeof updateDashboard === 'function') updateDashboard();
} catch (err) {
console.error('[syncInventoryWithCloud]', err);
initInventoryFromDb();
if (typeof showToast === 'function') showToast('⚠️ Erreur cloud, structure locale chargée.', 'warning');
}
}
window.syncInventoryWithCloud = syncInventoryWithCloud;
async function saveInventory() {
const userKey = getUserInventoryKey();
localStorage.setItem(userKey, JSON.stringify(APP.inventory));
if (window.GourmetSync) {
for (const item of APP.inventory) {
await GourmetSync.sauvegarderIngredient(item);
}
}
}
function recordPriceChange(item, newPrice) {
if (!item) return;
const oldPrice = item.price || 0;
if (Math.abs(oldPrice - newPrice) < 0.001) return;
if (!item.priceHistory) item.priceHistory = [];
item.priceHistory.push({
price: newPrice,
previousPrice: oldPrice,
date: new Date().toISOString(),
change: oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice * 100).toFixed(1) : '0'
});
if (item.priceHistory.length > 20) {
item.priceHistory = item.priceHistory.slice(-20);
}
}
function initInventoryFromDb() {
if (!Array.isArray(APP.inventory)) APP.inventory = [];
let addedCount = 0;
DEFAULT_INGREDIENT_DB.forEach(ing => {
const searchName = ing.name.toLowerCase().trim();
const exists = APP.inventory.find(inv =>
inv.name.toLowerCase().trim() === searchName
);
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
addedCount++;
}
});
saveInventory();
if (typeof showToast === 'function') {
if (addedCount > 0) {
showToast(`✅ ${addedCount} ingrédient(s) ajouté(s) à l'inventaire (stock = 0).`, 'success');
} else {
showToast('✅ Inventaire déjà à jour avec la base d\'ingrédients.', 'info');
}
}
renderInventory();
updateDashboard();
}
window.initInventoryFromDb = initInventoryFromDb;
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
function showToast(message, type = 'info') {
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
APP.baselineCosts = null;
['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization', 'recipeTvaRate'].forEach(id => {
const el = document.getElementById(id);
if (el) delete el.dataset.initialized;
});
goToStep(0);
}
window.importStarterPack = async function() {
const toastFn = typeof showToast === 'function' ? showToast : console.log;
toastFn("Importation des données de base... ⏳", "info");
const basicNames = [
'Farine T45', 'Farine T55', 'Beurre doux', 'Beurre AOP', 'Sucre semoule',
'Sucre glace', 'Lait entier', 'Œufs entiers', 'Jaunes d\'œufs', 'Blancs d\'œufs',
'Crème 35% MG', 'Chocolat noir 64%', 'Maïzena', 'Poudre d\'amandes', 'Vanille (gousse)',
'Sel', 'Levure fraîche', 'Levure chimique', 'Gélatine en feuilles (Or)', 'Mascarpone'
];
let addedIngCount = 0;
if (typeof DEFAULT_INGREDIENT_DB !== 'undefined') {
basicNames.forEach(name => {
const exists = APP.inventory.some(item => item.name.toLowerCase() === name.toLowerCase());
if (!exists) {
const ing = DEFAULT_INGREDIENT_DB.find(db => db.name.toLowerCase() === name.toLowerCase());
if (ing) {
APP.inventory.push({
id: 'inv_' + Math.random().toString(36).substr(2, 9),
name: ing.name,
stock: 0,
unit: ing.unit,
price: ing.pricePerUnit,
alertThreshold: ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 5,
lastUpdate: new Date().toISOString()
});
addedIngCount++;
}
}
});
}
let addedRecipe = false;
if (typeof RECIPES !== 'undefined') {
const eclair = RECIPES.find(r => r.id === 'eclair');
if (eclair) {
const exists = APP.savedRecipes.some(saved => saved.name.toLowerCase() === eclair.name.toLowerCase());
if (!exists) {
const copy = JSON.parse(JSON.stringify(eclair));
copy.savedAt = new Date().toISOString();
copy.margin = 70;
if (typeof calcFullCost === 'function') {
copy.costs = calcFullCost(copy.margin, copy);
}
APP.savedRecipes.push(copy);
addedRecipe = true;
}
}
}
if (addedIngCount > 0) {
await saveInventory();
}
if (addedRecipe) {
await saveSavedRecipes();
}
if (typeof renderInventory === 'function') renderInventory();
if (typeof renderSavedRecipes === 'function') renderSavedRecipes();
if (typeof updateDashboard === 'function') updateDashboard();
toastFn(`🎉 Pack importé : ${addedIngCount} ingrédients de base et 1 recette modèle ajoutée !`, 'success');
};

// --- MODULE: app-recipes.js ---
function goToStep(step) {
if (APP.currentStep >= 1) collectCurrentStepData();
APP.currentStep = step;
$('#heroSection').style.display = step === 0 ? 'block' : 'none';
$('#stepIndicator').style.display = step === 0 ? 'none' : 'flex';
$('#savedSection').style.display = 'none';
for (let i = 1; i <= 5; i++) {
const el = $(`#step${i}`);
if (el) {
el.classList.toggle('active', i === step);
}
}
$$('.step-dot').forEach((dot, idx) => {
const s = idx + 1;
dot.classList.remove('active', 'completed');
if (s === step) dot.classList.add('active');
else if (s < step) dot.classList.add('completed');
});
$$('.step-line').forEach((line, idx) => {
line.classList.toggle('active', idx + 1 < step);
});
if (step === 2) renderIngredients();
if (step === 3) renderProcedure();
if (step === 4) renderCostAnalysis();
if (step === 5) renderSummary();
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
amortization: parseFloat($('#advAmortization').value) || 0,
packagingCost: parseFloat($('#advPackagingCost').value) || 0,
apprenticeTime: parseFloat($('#advApprenticeTime').value) || 0,
commisTime: parseFloat($('#advCommisTime').value) || 0,
chefTime: parseFloat($('#advChefTime').value) || 0
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
function renderIngredients() {
const container = $('#ingredientsList');
if (!container) return;
container.innerHTML = '';
APP.recipe.ingredients.forEach((ing, idx) => {
const row = createIngredientRow(ing, idx);
container.appendChild(row);
});
if (window.SousRecettes) {
SousRecettes.renderSousRecetteRows();
}
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
row.querySelectorAll('.ing-input').forEach(input => {
input.addEventListener('input', () => onIngredientChange(row, idx));
input.addEventListener('change', () => onIngredientChange(row, idx));
});
const nameInput = row.querySelector('[data-field="name"]');
const acList = row.querySelector('.autocomplete-list');
nameInput.addEventListener('input', () => showAutocomplete(nameInput, acList, idx));
nameInput.addEventListener('focus', () => showAutocomplete(nameInput, acList, idx));
nameInput.addEventListener('blur', () => setTimeout(() => acList.classList.remove('show'), 200));
row.querySelector('[data-remove]').addEventListener('click', () => {
APP.recipe.ingredients.splice(idx, 1);
renderIngredients();
});
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
function showAutocomplete(input, listEl, idx) {
const val = input.value.toLowerCase().trim();
if (val.length < 1) { listEl.classList.remove('show'); return; }
let matches = [];
const matchingDb = APP.ingredientDb.filter(i => i.name.toLowerCase().includes(val));
matchingDb.forEach(i => {
const supplierPrices = (APP.ingredientPrices || []).filter(ip =>
ip.ingredient_name.toLowerCase().trim() === i.name.toLowerCase().trim()
);
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
matches.push({
...i,
isRecipe: false
});
});
const savedRecipes = JSON.parse(localStorage.getItem(getUserRecipesKey()) || '[]');
const allAvailableRecipes = [...RECIPES, ...savedRecipes];
const currentRecipeName = (APP.recipe.name || '').toLowerCase();
const recipeMatches = allAvailableRecipes
.filter(r => r.name.toLowerCase().includes(val) && r.name.toLowerCase() !== currentRecipeName)
.map(r => {
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
function renderProcedure() {
const container = $('#procedureList');
if (!container) return;
container.innerHTML = '';
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
function renderCostAnalysis() {
const kpiGrid = $('#kpiGrid');
const nutritionGrid = document.getElementById('nutritionGrid');
if (kpiGrid) {
kpiGrid.innerHTML = Array(4).fill(0).map(() => `
<div class="kpi-card skeleton" style="height: 120px;"></div>
`).join('');
}
if (nutritionGrid) {
const valueEls = nutritionGrid.querySelectorAll('[id^="nutri"]');
valueEls.forEach(el => {
el.classList.add('skeleton-text');
el.style.minWidth = '40px';
el.style.display = 'inline-block';
el.textContent = ' '; // Empty while loading
});
}
setTimeout(() => {
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
setVal('advPackagingCost', adv.packagingCost || 0);
setVal('advApprenticeTime', adv.apprenticeTime || 0);
setVal('advCommisTime', adv.commisTime || 0);
setVal('advChefTime', adv.chefTime || 0);
}
if (APP.recipe.tvaRate !== undefined) {
const el = document.getElementById('recipeTvaRate');
if (el && !el.dataset.initialized) {
el.value = APP.recipe.tvaRate;
el.dataset.initialized = 'true';
}
}
const costs = calcFullCost(APP.margin);
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
el.textContent = '0.00' + suffix;
animateTicker(el, val, 1200, suffix);
});
}
if (window.gsap) {
gsap.fromTo('#kpiGrid .kpi-card',
{ opacity: 0, scale: 0.95 },
{ opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, ease: 'back.out(1.7)' }
);
}
}
renderDonutChart();
renderBatchScaling(costs);
const marginValEl = $('#marginValue');
const marginSliderEl = $('#marginSlider');
if (marginValEl) marginValEl.textContent = APP.margin + '%';
if (marginSliderEl) marginSliderEl.value = APP.margin;
renderAdvancedCostKPI(costs);
if (nutritionGrid) {
nutritionGrid.querySelectorAll('[id^="nutri"]').forEach(el => {
el.classList.remove('skeleton-text');
el.style.minWidth = '';
});
renderNutritionAnalysis();
}
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
const profileTotalTime = (costs.apprenticeTime || 0) + (costs.commisTime || 0) + (costs.chefTime || 0);
let laborSubText = `${costs.laborRate.toFixed(2)} €/h × ${totalTimeH.toFixed(1)}h`;
if (profileTotalTime > 0) {
const details = [];
if (costs.apprenticeTime > 0) details.push(`Appr. ${costs.apprenticeTime}m`);
if (costs.commisTime > 0) details.push(`Comm. ${costs.commisTime}m`);
if (costs.chefTime > 0) details.push(`Chef ${costs.chefTime}m`);
laborSubText = details.join(' | ');
}
const additionalSum = costs.laborCost + costs.energyCost + costs.fixedShare + costs.amortShare;
const totalMaterialWithPkg = costs.totalMaterial + (costs.packagingCost * costs.portions);
grid.innerHTML = `
<div class="kpi-card">
<div class="kpi-label">${t('s4.adv.kpi.labor') || 'Main d\'œuvre'}</div>
<div class="kpi-value">${costs.laborCost.toFixed(2)} €</div>
<div class="kpi-sub">${laborSubText}</div>
</div>
<div class="kpi-card">
<div class="kpi-label">${t('s4.adv.kpi.energy') || 'Énergie'}</div>
<div class="kpi-value">${costs.energyCost.toFixed(2)} €</div>
<div class="kpi-sub">${costs.energyRate.toFixed(2)} €/h × ${(costs.cookTime / 60).toFixed(1)}h</div>
</div>
<div class="kpi-card">
<div class="kpi-label">📦 Emballages</div>
<div class="kpi-value">${(costs.packagingCost * costs.portions).toFixed(2)} €</div>
<div class="kpi-sub">${costs.packagingCost.toFixed(2)} €/port. × ${costs.portions}</div>
</div>
<div class="kpi-card">
<div class="kpi-label">${t('s4.adv.kpi.fixed') || 'Charges fixes'}</div>
<div class="kpi-value">${costs.fixedShare.toFixed(2)} €</div>
<div class="kpi-sub">${costs.fixedCharges.toFixed(0)} € / ${costs.productions}</div>
</div>
<div class="kpi-card">
<div class="kpi-label">${t('s4.adv.kpi.amort') || 'Amortissement'}</div>
<div class="kpi-value">${costs.amortShare.toFixed(2)} €</div>
<div class="kpi-sub">${costs.amortization.toFixed(0)} € / ${costs.productions}</div>
</div>
<div class="kpi-card accent">
<div class="kpi-label">${t('s4.adv.kpi.full_cost') || 'Coût complet'}</div>
<div class="kpi-value" style="font-size:1.3rem">${costs.totalFullCost.toFixed(2)} €</div>
<div class="kpi-sub">Mat.+Pkg: ${totalMaterialWithPkg.toFixed(2)} € + Frais: ${additionalSum.toFixed(2)} €</div>
</div>
<div class="kpi-card success">
<div class="kpi-label">${t('s4.adv.kpi.full_portion') || 'Coût portion'}</div>
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
const colors = [
'#e67e22', '#3498db', '#2ecc71', '#e74c3c', '#9b59b6',
'#f39c12', '#1abc9c', '#34495e', '#d35400', '#2980b9',
'#27ae60', '#c0392b', '#8e44ad', '#f1c40f', '#16a085'
];
const segments = ingredients.map(ing => ({
name: t(ing.name),
cost: calcIngredientCost(ing),
color: colors[Math.floor(Math.random() * colors.length)]
})).sort((a, b) => b.cost - a.cost);
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
function renderSummary() {
const container = document.getElementById('summaryContent');
if (!container) return;
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
if (window.renderNutriBadge) {
window.renderNutriBadge('summaryNutriBadge', r);
}
if (window.GourmetBaseline && APP.baselineCosts && APP.baselineCosts.recipeName === r.name) {
window.GourmetBaseline.renderComparison();
}
}, 400);
}
async function saveCurrentRecipe() {
collectCurrentStepData();
const r = APP.recipe;
if (!r.name.trim()) {
showToast(t('toast.recipe.name_required'), 'error');
return;
}
const isNew = !r.id;
if (isNew) {
if (window.GourmetBilling && !await GourmetBilling.canSaveRecipe()) {
return;
}
r.id = generateId();
}
const toSave = {
...JSON.parse(JSON.stringify(r)),
savedAt: new Date().toISOString(),
margin: APP.margin
};
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
['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization', 'recipeTvaRate', 'advPackagingCost', 'advApprenticeTime', 'advCommisTime', 'advChefTime'].forEach(id => {
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
return { name: ing.name, quantity: ing.quantity, unit, pricePerUnit };
}),
steps: example.steps.map((step, sIdx) => {
const stepKey = `data.recipe.${example.id}.step.${sIdx}`;
const tStep = t(stepKey);
return tStep !== stepKey ? tStep : step;
})
};
populateStep1();
['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization', 'recipeTvaRate', 'advPackagingCost', 'advApprenticeTime', 'advCommisTime', 'advChefTime'].forEach(id => {
const el = document.getElementById(id);
if (el) delete el.dataset.initialized;
});
goToStep(1);
showToast(t('recipe.toast.loaded', { name: APP.recipe.name }), 'success');
}
function exportRecipePdfDirect(idx) {
const allRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];
if (allRecipes.length === 0 || idx >= allRecipes.length) return;
const example = allRecipes[idx];
exportPdf(example, example.margin || 70);
}
let currentLibraryFilter = 'all';
let currentLibraryDomain = 'patisserie';
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
return a.name.localeCompare(b.name);
}
const idxA = LIBRARY_SORT_ORDER.indexOf(catA);
const idxB = LIBRARY_SORT_ORDER.indexOf(catB);
if (idxA !== -1 && idxB !== -1) return idxA - idxB;
if (idxA !== -1) return -1;
if (idxB !== -1) return 1;
return catA.localeCompare(catB);
}
window.setLibraryDomain = function(domain) {
currentLibraryDomain = domain;
currentLibraryFilter = 'all'; // Reset category filter on domain switch
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
const domainRecipes = allRecipes.filter(r => {
const isBoulangerie = DOMAIN_BOULANGERIE.includes(r.category);
return (currentLibraryDomain === 'boulangerie') ? isBoulangerie : !isBoulangerie;
});
if (filtersContainer) {
const rawCategories = Array.from(new Set(domainRecipes.map(r => r.category)));
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
function renderPortfolio() {
const container = $('#portfolioGallery');
if (!container) return;
let allRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];
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
allRecipes.sort((a, b) => portfolioFilter.indexOf(a.id) - portfolioFilter.indexOf(b.id));
if (allRecipes.length === 0) {
container.innerHTML = `<p style="text-align:center; color:var(--text-muted); width:100%;">${t('portfolio.empty')}</p>`;
return;
}
container.innerHTML = allRecipes.map((r, idx) => {
const hue = (idx * 137.5) % 360;
const fallBackColor = `hsl(${hue}, 70%, 85%)`;
const dezoomIds = [];
const zoomIds = [];
let extraClass = dezoomIds.includes(r.id) ? ' dezoom' : '';
if (zoomIds.includes(r.id)) extraClass += ' zoom-in';
let extraStyle = '';
if (r.id === 'saint-honore') extraStyle = ' style="object-position: top;"';
const tCatRaw = t(r.category);
const tCat = tCatRaw !== r.category ? tCatRaw : r.category;
const tNameRaw = t(`data.recipe.${r.id}.name`);
const displayName = tNameRaw !== `data.recipe.${r.id}.name` ? tNameRaw : r.name;
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
function calcRecipeEcoScore(recipe) {
if (!recipe) return { score: 75, grade: 'B', color: '#84cc16' };
let totalWeight = 0;
let totalScore = 0;
const getIngredientOrigin = (ingName) => {
if (window.APP && APP.ingredientDb) {
const match = APP.ingredientDb.find(i => i.name.toLowerCase() === ingName.toLowerCase());
if (match && match.origin) return match.origin;
}
if (typeof DEFAULT_INGREDIENT_DB !== 'undefined') {
const match = DEFAULT_INGREDIENT_DB.find(i => i.name.toLowerCase() === ingName.toLowerCase());
if (match && match.origin) return match.origin;
}
return 'france';
};
const originScores = { 'local': 100, 'france': 80, 'import': 30 };
if (recipe.ingredients) {
recipe.ingredients.forEach(ing => {
let qty = parseFloat(ing.quantity || ing.qty) || 0;
const unit = ing.unit || 'g';
if (unit === 'kg' || unit === 'L') qty *= 1000;
else if (unit === 'cl') qty *= 10;
else if (unit === 'pcs' || unit === 'pièce') qty *= 50;
const origin = ing.origin || getIngredientOrigin(ing.name || '');
const score = originScores[origin] || 80;
totalWeight += qty;
totalScore += qty * score;
});
}
if (recipe.sousRecettes && recipe.sousRecettes.length > 0) {
const fromApp = window.APP ? (APP.savedRecipes || []) : [];
let local = [];
try {
const key = window.getUserRecipesKey ? getUserRecipesKey() : 'gourmetrevient_recipes_';
local = JSON.parse(localStorage.getItem(key) || '[]');
} catch(e) {}
const allRecipes = [...fromApp, ...local];
recipe.sousRecettes.forEach(sr => {
const child = allRecipes.find(r => r.id === sr.recetteEnfantId);
const qte = parseFloat(sr.quantiteUtilisee) || 0;
totalWeight += qte;
if (child) {
const childRes = calcRecipeEcoScore(child);
totalScore += qte * childRes.score;
} else {
totalScore += qte * 80;
}
});
}
if (totalWeight === 0) {
return { score: 80, grade: 'B', color: '#84cc16' };
}
const finalScore = totalScore / totalWeight;
let grade = 'C';
let color = '#eab308';
if (finalScore >= 85) { grade = 'A'; color = '#22c55e'; }
else if (finalScore >= 70) { grade = 'B'; color = '#84cc16'; }
else if (finalScore >= 50) { grade = 'C'; color = '#eab308'; }
else if (finalScore >= 35) { grade = 'D'; color = '#f97316'; }
else { grade = 'E'; color = '#ef4444'; }
return { score: Math.round(finalScore), grade, color };
}
function exportPdf(recipeToExport = null, marginToExport = null) {
const r = recipeToExport || APP.recipe;
if (!r || !r.name) { showToast('Erreur: Aucune recette chargée.', 'error'); return; }
const ecoRes = calcRecipeEcoScore(r);
const targetMargin = marginToExport !== null ? marginToExport : APP.margin;
const costs = calcFullCost(targetMargin, r);
const nutData = typeof calculateFullNutrition === 'function' ? calculateFullNutrition(r) : null;
let nutriHtml = '';
if (nutData) {
nutriHtml = `
<div style="margin-top: 20px;">
<div style="border-left: 2px solid #3730a3; padding-left: 8px; font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; color: #3730a3; margin-bottom: 12px; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif; text-align:left;">
DÉCLARATION NUTRITIONNELLE (LOI INCO)
</div>
<table style="width:100%; border-collapse:collapse; font-size:8px; border:1px solid #e2e8f0; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<thead>
<tr style="background:#f8fafc; font-weight:700; border-bottom:1px solid #e2e8f0; text-align:left;">
<th style="padding:6px 10px; text-align:left; font-size:8px;">Valeurs moyennes</th>
<th style="padding:6px 10px; text-align:right; font-size:8px;">Pour 100g</th>
<th style="padding:6px 10px; text-align:right; font-size:8px;">Par portion (${nutData.portionWeight}g)</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom:1px solid #e2e8f0;">
<td style="padding:5px 10px; text-align:left; font-weight:600; font-size:8px;">Énergie</td>
<td style="padding:5px 10px; text-align:right; font-weight:600; font-size:8px;">${nutData.per100g.kj} kJ / ${nutData.per100g.kcal} kcal</td>
<td style="padding:5px 10px; text-align:right; font-weight:600; font-size:8px;">${nutData.perPortion.kj} kJ / ${nutData.perPortion.kcal} kcal</td>
</tr>
<tr style="border-bottom:1px solid #e2e8f0;">
<td style="padding:5px 10px; text-align:left; font-size:8px;">Matières grasses</td>
<td style="padding:5px 10px; text-align:right; font-size:8px;">${nutData.per100g.fats.toFixed(1)}g</td>
<td style="padding:5px 10px; text-align:right; font-size:8px;">${nutData.perPortion.fats.toFixed(1)}g</td>
</tr>
<tr style="border-bottom:1px solid #e2e8f0;">
<td style="padding:5px 10px; text-align:left; padding-left:20px; color:#475569; font-size:8px;">dont acides gras saturés</td>
<td style="padding:5px 10px; text-align:right; color:#475569; font-size:8px;">${nutData.per100g.saturatedFat.toFixed(1)}g</td>
<td style="padding:5px 10px; text-align:right; color:#475569; font-size:8px;">${nutData.perPortion.saturatedFat.toFixed(1)}g</td>
</tr>
<tr style="border-bottom:1px solid #e2e8f0;">
<td style="padding:5px 10px; text-align:left; font-size:8px;">Glucides</td>
<td style="padding:5px 10px; text-align:right; font-size:8px;">${nutData.per100g.carbs.toFixed(1)}g</td>
<td style="padding:5px 10px; text-align:right; font-size:8px;">${nutData.perPortion.carbs.toFixed(1)}g</td>
</tr>
<tr style="border-bottom:1px solid #e2e8f0;">
<td style="padding:5px 10px; text-align:left; padding-left:20px; color:#475569; font-size:8px;">dont sucres</td>
<td style="padding:5px 10px; text-align:right; color:#475569; font-size:8px;">${nutData.per100g.sugar.toFixed(1)}g</td>
<td style="padding:5px 10px; text-align:right; color:#475569; font-size:8px;">${nutData.perPortion.sugar.toFixed(1)}g</td>
</tr>
<tr style="border-bottom:1px solid #e2e8f0;">
<td style="padding:5px 10px; text-align:left; font-size:8px;">Protéines</td>
<td style="padding:5px 10px; text-align:right; font-size:8px;">${nutData.per100g.proteins.toFixed(1)}g</td>
<td style="padding:5px 10px; text-align:right; font-size:8px;">${nutData.perPortion.proteins.toFixed(1)}g</td>
</tr>
<tr style="border-bottom:none;">
<td style="padding:5px 10px; text-align:left; font-size:8px;">Sel</td>
<td style="padding:5px 10px; text-align:right; font-size:8px;">${nutData.per100g.salt.toFixed(2)}g</td>
<td style="padding:5px 10px; text-align:right; font-size:8px;">${nutData.perPortion.salt.toFixed(2)}g</td>
</tr>
</tbody>
</table>
</div>
`;
}
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
function renderNiveau(niveau) {
const niveaux = ['●', '●', '●', '●', '●'];
return niveaux.map((dot, i) =>
`<span style="color:${i < niveau ? '#3730a3' : '#e2e8f0'}; font-size:10px; margin-right:2px;">●</span>`
).join('');
}
const filigraneHTML = `
<div style="position:absolute; top:50%; left:50%; transform:translate(-50%,-50%) rotate(-45deg); font-size:72px; font-weight:900; color:rgba(55,48,163,0.03); letter-spacing:0.1em; pointer-events:none; white-space:nowrap; z-index:0; font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
GOURMETREVIENT
</div>`;
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
${nutriHtml}
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
${costs.packagingCost > 0 ? `
<div style="display:flex; justify-content:space-between; padding:4px 0; border-bottom:1px solid #e2e8f0;">
<span style="color:#64748b;">Emballages</span>
<span style="font-weight:700; color:#0f0f0f;">${(costs.packagingCost * portions).toFixed(2)} €</span>
</div>
` : ''}
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
<!-- Eco-Score -->
<div>
<div style="border-left: 2px solid #3730a3; padding-left: 8px; font-size: 8px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #3730a3; margin-bottom: 8px; text-align:left;">
ÉCO-SCORE SOURCING
</div>
<div style="background:#f8fafc; padding:10px 12px; border-radius:6px; border:1px solid #e2e8f0; text-align:left;">
<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
<span style="font-size:10px; color:#64748b;">Eco-Score</span>
<span style="font-size:11px; font-weight:900; color:${ecoRes.color}; background:${ecoRes.color}15; padding:2px 8px; border-radius:4px; border:1px solid ${ecoRes.color}33;">🎯 Classe ${ecoRes.grade}</span>
</div>
<div style="font-size:8px; color:#94a3b8; line-height:1.3;">
Score : <strong>${ecoRes.score}/100</strong>. Calculé selon la provenance des matières premières.
</div>
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

// --- MODULE: app-inventory.js ---
function showIngredientDbModal() {
window.openModal('dbModal');
renderDbIngredients();
}
function hideIngredientDbModal() {
window.closeModal('dbModal');
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
function showOffModal() {
window.openModal('offModal');
$('#offSearchInput').value = '';
$('#offResultsList').innerHTML = '';
}
function hideOffModal() {
window.closeModal('offModal');
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
const n = p.nutriments || {};
const nutriData = {
kcal: parseFloat(n['energy-kcal_100g']) || 0,
proteins: parseFloat(n['proteins_100g']) || 0,
carbs: parseFloat(n['carbohydrates_100g']) || 0,
fats: parseFloat(n['fat_100g']) || 0
};
const allergensData = p.allergens_tags ? p.allergens_tags.map(a => a.replace('en:', '').replace('fr:', '')) : [];
if (!APP.ingredientDb) loadIngredientDb();
let existing = APP.ingredientDb.find(db => db.name.toLowerCase() === name.toLowerCase());
let price = existing ? existing.pricePerUnit : 0;
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
window.calculateFullNutrition = function(recipe) {
if (!recipe || !recipe.ingredients) return null;
let totalKcal = 0;
let totalKj = 0;
let totalPro = 0;
let totalGlu = 0;
let totalSugar = 0;
let totalLip = 0;
let totalSatFat = 0;
let totalSalt = 0;
let weightInGrams = 0;
const getMockNutrition = (name) => {
const n = name.toLowerCase();
const matches = (keywords) => keywords.some(k => n.includes(k));
if (matches(['beurre', 'huile', 'graisse', 'gras'])) return { kcal: 717, kj: 3000, proteins: 1, carbs: 1, sugar: 0.1, fats: 81, saturatedFat: 51, salt: 0.1 };
if (matches(['sucre', 'sirop', 'miel', 'glucose', 'semoule', 'glace'])) return { kcal: 387, kj: 1619, proteins: 0, carbs: 100, sugar: 100, fats: 0, saturatedFat: 0, salt: 0 };
if (matches(['farine', 'fécule', 'fecule', 'amidon', 'maïzena'])) return { kcal: 364, kj: 1523, proteins: 10, carbs: 76, sugar: 1.5, fats: 1, saturatedFat: 0.2, salt: 0.01 };
if (matches(['crème', 'creme', 'mascarpone', 'chantilly'])) return { kcal: 345, kj: 1443, proteins: 2, carbs: 3, sugar: 3, fats: 35, saturatedFat: 23, salt: 0.1 };
if (matches(['lait'])) return { kcal: 42, kj: 176, proteins: 3.4, carbs: 4.8, sugar: 4.8, fats: 1, saturatedFat: 0.6, salt: 0.1 };
if (matches(['chocolat', 'cacao', 'couverture', 'ganache', 'pralin', 'gianduja'])) return { kcal: 546, kj: 2284, proteins: 5, carbs: 31, sugar: 28, fats: 36, saturatedFat: 22, salt: 0.05 };
if (matches(['œuf', 'oeuf', 'jaune', 'blanc', 'oufs'])) return { kcal: 143, kj: 598, proteins: 13, carbs: 1, sugar: 0.6, fats: 10, saturatedFat: 3, salt: 0.3 };
if (matches(['fraise', 'framboise', 'pomme', 'citron', 'fruit', 'purée', 'coulis', 'griotte'])) return { kcal: 50, kj: 209, proteins: 1, carbs: 12, sugar: 9, fats: 0.2, saturatedFat: 0.05, salt: 0.01 };
if (matches(['amande', 'noisette', 'noix', 'pistache', 'pignon'])) return { kcal: 600, kj: 2510, proteins: 20, carbs: 10, sugar: 4, fats: 50, saturatedFat: 4, salt: 0.01 };
if (matches(['eau', 'water', 'glace hydrique'])) return { kcal: 0, kj: 0, proteins: 0, carbs: 0, sugar: 0, fats: 0, saturatedFat: 0, salt: 0 };
if (matches(['gelatine', 'gélatine', 'agar'])) return { kcal: 335, kj: 1400, proteins: 86, carbs: 0, sugar: 0, fats: 0, saturatedFat: 0, salt: 0.1 };
if (matches(['levure'])) return { kcal: 105, kj: 439, proteins: 14, carbs: 19, sugar: 0, fats: 2, saturatedFat: 0.3, salt: 0.1 };
if (matches(['sel'])) return { kcal: 0, kj: 0, proteins: 0, carbs: 0, sugar: 0, fats: 0, saturatedFat: 0, salt: 100 };
return { kcal: 250, kj: 1046, proteins: 5, carbs: 30, sugar: 10, fats: 10, saturatedFat: 3, salt: 0.1 };
};
recipe.ingredients.forEach(ing => {
if (!ing.name || ing.quantity <= 0) return;
let qtyGrams = 0;
const unit = (ing.unit || '').toLowerCase();
if (unit === 'g' || unit === 'ml') {
qtyGrams = parseFloat(ing.quantity);
} else if (unit === 'kg' || unit === 'l') {
qtyGrams = parseFloat(ing.quantity) * 1000;
} else if (unit === 'pièce' || unit === 'piece' || unit === 'pcs' || unit === 'unité' || unit === 'u') {
qtyGrams = parseFloat(ing.quantity) * 50;
}
weightInGrams += qtyGrams;
const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
let nut = null;
if (dbItem && dbItem.nutrition) {
nut = dbItem.nutrition;
} else {
nut = getMockNutrition(ing.name);
}
if (qtyGrams > 0 && nut) {
const ratio = qtyGrams / 100;
totalKcal += (nut.kcal || 0) * ratio;
totalKj += (nut.kj || nut.kcal * 4.184 || 0) * ratio;
totalPro += (nut.proteins || nut.prot || 0) * ratio;
totalGlu += (nut.carbs || nut.carb || 0) * ratio;
totalSugar += (nut.sugar !== undefined ? nut.sugar : (nut.carbs || nut.carb || 0) * 0.3) * ratio;
totalLip += (nut.fats || nut.fat || 0) * ratio;
totalSatFat += (nut.saturatedFat !== undefined ? nut.saturatedFat : (nut.fats || nut.fat || 0) * 0.6) * ratio;
totalSalt += (nut.salt !== undefined ? nut.salt : 0.01) * ratio;
}
});
if (weightInGrams === 0) return null;
const portions = recipe.portions || 10;
const portionWeight = weightInGrams / portions;
const factor100 = 100 / weightInGrams;
const per100g = {
kcal: Math.round(totalKcal * factor100),
kj: Math.round(totalKj * factor100),
proteins: +(totalPro * factor100).toFixed(1),
carbs: +(totalGlu * factor100).toFixed(1),
sugar: +(totalSugar * factor100).toFixed(1),
fats: +(totalLip * factor100).toFixed(1),
saturatedFat: +(totalSatFat * factor100).toFixed(1),
salt: +(totalSalt * factor100).toFixed(2)
};
const factorPortion = portionWeight / 100;
const perPortion = {
kcal: Math.round(per100g.kcal * factorPortion),
kj: Math.round(per100g.kj * factorPortion),
proteins: +(per100g.proteins * factorPortion).toFixed(1),
carbs: +(per100g.carbs * factorPortion).toFixed(1),
sugar: +(per100g.sugar * factorPortion).toFixed(1),
fats: +(per100g.fats * factorPortion).toFixed(1),
saturatedFat: +(per100g.saturatedFat * factorPortion).toFixed(1),
salt: +(per100g.salt * factorPortion).toFixed(2)
};
return {
weightInGrams: Math.round(weightInGrams),
portionWeight: Math.round(portionWeight),
per100g,
perPortion
};
};
function renderNutritionAnalysis() {
const nutData = window.calculateFullNutrition(APP.recipe);
const foundAllergens = new Set();
APP.recipe.ingredients.forEach(ing => {
if (!ing.name || ing.quantity <= 0) return;
const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
if (dbItem && dbItem.allergens) {
dbItem.allergens.forEach(a => foundAllergens.add(a));
}
const n = ing.name.toLowerCase();
if (n.includes('lait') || n.includes('crème') || n.includes('creme') || n.includes('beurre')) foundAllergens.add('Lait');
if (n.includes('farine') || n.includes('gluten')) foundAllergens.add('Gluten');
if (n.includes('œuf') || n.includes('oeuf') || n.includes('oufs')) foundAllergens.add('Œufs');
if (n.includes('noisette') || n.includes('amande') || n.includes('noix') || n.includes('pistache')) foundAllergens.add('Fruits à coque');
});
if (window.SousRecettes) {
const cascadeAllergens = SousRecettes.getAllergenesFromRecipe(APP.recipe);
cascadeAllergens.forEach(a => foundAllergens.add(a));
}
const k = document.getElementById('nutriKcal');
const p = document.getElementById('nutriPro');
const g = document.getElementById('nutriGlu');
const l = document.getElementById('nutriLip');
const al = document.getElementById('allergensList');
const tableContainer = document.getElementById('incoNutritionTable');
if (nutData) {
if (k) k.textContent = Math.round(nutData.per100g.kcal);
if (p) p.textContent = nutData.per100g.proteins.toFixed(1) + 'g';
if (g) g.textContent = nutData.per100g.carbs.toFixed(1) + 'g';
if (l) l.textContent = nutData.per100g.fats.toFixed(1) + 'g';
if (tableContainer) {
tableContainer.innerHTML = `
<div style="margin-top: 1rem; border: 1px solid var(--surface-border); border-radius: 8px; overflow: hidden; background: var(--surface);">
<table style="width: 100%; border-collapse: collapse; font-size: 0.82rem; color: var(--text);">
<thead>
<tr style="background: var(--surface-hover); font-weight: 700; border-bottom: 1px solid var(--surface-border);">
<th style="padding: 8px 12px; text-align: left;">Valeurs moyennes</th>
<th style="padding: 8px 12px; text-align: right;">Pour 100g</th>
<th style="padding: 8px 12px; text-align: right;">Par portion (${Math.round(nutData.portionWeight)}g)</th>
</tr>
</thead>
<tbody>
<tr style="border-bottom: 1px solid var(--surface-border);">
<td style="padding: 8px 12px; text-align: left; font-weight: 600;">Énergie</td>
<td style="padding: 8px 12px; text-align: right; font-weight: 600;">${nutData.per100g.kj} kJ / ${nutData.per100g.kcal} kcal</td>
<td style="padding: 8px 12px; text-align: right; font-weight: 600;">${nutData.perPortion.kj} kJ / ${nutData.perPortion.kcal} kcal</td>
</tr>
<tr style="border-bottom: 1px solid var(--surface-border);">
<td style="padding: 8px 12px; text-align: left;">Matières grasses</td>
<td style="padding: 8px 12px; text-align: right;">${nutData.per100g.fats.toFixed(1)}g</td>
<td style="padding: 8px 12px; text-align: right;">${nutData.perPortion.fats.toFixed(1)}g</td>
</tr>
<tr style="border-bottom: 1px solid var(--surface-border);">
<td style="padding: 8px 12px; text-align: left; padding-left: 20px; color: var(--text-muted);">dont acides gras saturés</td>
<td style="padding: 8px 12px; text-align: right; color: var(--text-muted);">${nutData.per100g.saturatedFat.toFixed(1)}g</td>
<td style="padding: 8px 12px; text-align: right; color: var(--text-muted);">${nutData.perPortion.saturatedFat.toFixed(1)}g</td>
</tr>
<tr style="border-bottom: 1px solid var(--surface-border);">
<td style="padding: 8px 12px; text-align: left;">Glucides</td>
<td style="padding: 8px 12px; text-align: right;">${nutData.per100g.carbs.toFixed(1)}g</td>
<td style="padding: 8px 12px; text-align: right;">${nutData.perPortion.carbs.toFixed(1)}g</td>
</tr>
<tr style="border-bottom: 1px solid var(--surface-border);">
<td style="padding: 8px 12px; text-align: left; padding-left: 20px; color: var(--text-muted);">dont sucres</td>
<td style="padding: 8px 12px; text-align: right; color: var(--text-muted);">${nutData.per100g.sugar.toFixed(1)}g</td>
<td style="padding: 8px 12px; text-align: right; color: var(--text-muted);">${nutData.perPortion.sugar.toFixed(1)}g</td>
</tr>
<tr style="border-bottom: 1px solid var(--surface-border);">
<td style="padding: 8px 12px; text-align: left;">Protéines</td>
<td style="padding: 8px 12px; text-align: right;">${nutData.per100g.proteins.toFixed(1)}g</td>
<td style="padding: 8px 12px; text-align: right;">${nutData.perPortion.proteins.toFixed(1)}g</td>
</tr>
<tr style="border-bottom: none;">
<td style="padding: 8px 12px; text-align: left;">Sel</td>
<td style="padding: 8px 12px; text-align: right;">${nutData.per100g.salt.toFixed(2)}g</td>
<td style="padding: 8px 12px; text-align: right;">${nutData.perPortion.salt.toFixed(2)}g</td>
</tr>
</tbody>
</table>
</div>
`;
}
} else {
if (k) k.textContent = '0';
if (p) p.textContent = '0g';
if (g) g.textContent = '0g';
if (l) l.textContent = '0g';
if (tableContainer) tableContainer.innerHTML = '';
}
if (al) {
if (foundAllergens.size > 0) {
al.textContent = Array.from(foundAllergens).map(a => t(a) || a).join(', ').toUpperCase();
} else {
al.textContent = "Aucun / Non renseigné";
}
}
}
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
<div style="display:flex; flex-direction:column; align-items:center; gap:12px; justify-content:center;">
<p>${t('inv.table.empty') || 'Votre inventaire est vide.'}</p>
<div style="display:flex; gap:10px; justify-content:center;">
<button class="btn btn-sm btn-primary" onclick="window.importStarterPack()" style="background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; padding:8px 16px; border-radius:8px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(99,102,241,0.2);">⚡ Importer 20 ingrédients de base</button>
<button class="btn btn-sm btn-outline" onclick="syncInventoryWithCloud()">✨ ${t('inv.btn.sync') || 'Synchronisation'}</button>
</div>
</div>
</td>
</tr>
`;
return;
}
container.innerHTML = APP.inventory.map(item => {
const isCritical = item.stock <= item.alertThreshold;
const isLow = item.stock <= (item.alertThreshold * 2);
const healthPercent = Math.min(100, (item.stock / (item.alertThreshold * 4)) * 100);
const healthClass = isCritical ? 'health-critical' : (isLow ? 'health-low' : 'health-ok');
const statusClass = isCritical ? 'status-critical' : 'status-ok';
const statusLabel = isCritical ? '⚠️ ' + t('inv.health.critical') : '✅ ' + t('inv.health.ok');
const emoji = getIngredientEmoji(item.name);
let trendHTML = '';
if (item.priceHistory && item.priceHistory.length >= 2) {
const last = item.priceHistory[item.priceHistory.length - 1];
const prev = item.priceHistory[item.priceHistory.length - 2];
const pctChange = parseFloat(last.change) || 0;
if (pctChange > 1) {
trendHTML = `<span style="color:var(--danger); font-size:0.7rem; font-weight:700;" title="Hausse de ${pctChange}%">▲ +${pctChange}%</span>`;
} else if (pctChange < -1) {
trendHTML = `<span style="color:var(--success); font-size:0.7rem; font-weight:700;" title="Baisse de ${Math.abs(pctChange)}%">▼ ${pctChange}%</span>`;
} else {
trendHTML = `<span style="color:var(--text-muted); font-size:0.7rem;" title="Prix stable">→</span>`;
}
} else if (item.priceHistory && item.priceHistory.length === 1) {
trendHTML = `<span style="color:var(--text-muted); font-size:0.65rem;">1er enregistrement</span>`;
}
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
<div>${(item.stock * (item.price || 0) / (item.unit === 'g' || item.unit === 'ml' ? 1000 : 1)).toFixed(2)} €</div>
${trendHTML ? `<div style="margin-top:2px;">${trendHTML}</div>` : ''}
</td>
<td style="text-align:center;"><span class="badge ${statusClass}">${statusLabel}</span></td>
<td style="text-align:center;">
<button class="btn btn-sm btn-outline btn-round" onclick="event.stopPropagation(); editInventoryItem('${item.id}')" title="Seuil d'alerte">⚙️</button>
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
const allItems = [];
APP.inventory.forEach(item => {
allItems.push({ id: item.id, name: item.name, unit: item.unit, fromInventory: true });
});
(APP.ingredientDb || []).forEach(dbIng => {
const already = APP.inventory.find(i => i.name.toLowerCase().trim() === dbIng.name.toLowerCase().trim());
if (!already) {
allItems.push({ id: 'db_' + dbIng.name, name: dbIng.name, unit: dbIng.unit, fromInventory: false, dbEntry: dbIng });
}
});
allItems.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
selector.innerHTML = '<option value="">— Sélectionner un ingrédient —</option>' +
allItems.map(item => `<option value="${item.id}" data-unit="${item.unit}">${getIngredientEmoji(item.name)} ${item.name}</option>`).join('');
selector.onchange = () => {
const selected = allItems.find(i => i.id === selector.value);
if (selected && $('#restockUnit')) $('#restockUnit').value = selected.unit;
};
if (allItems.length > 0 && selector.value) {
const first = allItems.find(i => i.id === selector.value);
if (first && $('#restockUnit')) $('#restockUnit').value = first.unit;
}
window.openModal('restockModal');
}
function hideRestockModal() {
window.closeModal('restockModal');
}
function confirmRestock() {
const itemId = $('#restockItemSelector').value;
const qty = parseFloat($('#restockQty').value) || 0;
const totalLotPrice = parseFloat($('#restockTotalPrice').value);
if (!itemId) {
if (typeof showToast === 'function') showToast('Veuillez sélectionner un ingrédient.', 'warning');
return;
}
if (qty <= 0) {
if (typeof showToast === 'function') showToast('Veuillez entrer une quantité valide.', 'warning');
return;
}
let item = APP.inventory.find(i => i.id === itemId);
if (!item && itemId.startsWith('db_')) {
const ingName = itemId.replace('db_', '');
const dbEntry = (APP.ingredientDb || []).find(i => i.name === ingName);
if (dbEntry) {
item = {
id: 'inv_' + Math.random().toString(36).substr(2, 9),
name: dbEntry.name,
stock: 0,
unit: dbEntry.unit,
price: dbEntry.pricePerUnit,
alertThreshold: dbEntry.unit === 'g' || dbEntry.unit === 'ml' ? 1000 : 5,
lastUpdate: new Date().toISOString()
};
APP.inventory.push(item);
}
}
if (item) {
item.stock += qty;
item.lastUpdate = new Date().toISOString();
if (!isNaN(totalLotPrice) && totalLotPrice > 0) {
let unitPrice;
if (item.unit === 'g' || item.unit === 'ml') {
unitPrice = (totalLotPrice / qty) * 1000;
} else {
unitPrice = totalLotPrice / qty;
}
recordPriceChange(item, unitPrice);
item.price = unitPrice;
const dbIng = (APP.ingredientDb || []).find(i => i.name === item.name);
if (dbIng) dbIng.pricePerUnit = unitPrice;
saveIngredientDb();
}
saveInventory();
hideRestockModal();
renderInventory();
updateDashboard();
if (typeof renderSuppliers === 'function') renderSuppliers();
if (typeof showToast === 'function') showToast(`✅ Arrivage de ${item.name} enregistré (${qty} ${item.unit})`, 'success');
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
$('#ingConfigId').value = item.id;
$('#ingConfigTitle').textContent = `Configuration de ${t(item.name)}`;
$('#ingConfigAlert').value = item.alertThreshold;
$('#ingConfigUnit').textContent = item.unit;
$('#ingConfigPrice').value = item.price || 0;
$('#ingConfigPriceUnit').textContent = getPriceRef(item.unit);
const container = $('#ingConfigSuppliersList');
if (container) {
container.innerHTML = '';
const activeSuppliers = APP.suppliers || [];
if (activeSuppliers.length === 0) {
container.innerHTML = `<p style="font-size:0.8rem; text-align:center; color:var(--text-muted);">Aucun fournisseur enregistré. <br/>Ajoutez des fournisseurs dans l'onglet "Fournisseurs".</p>`;
} else {
activeSuppliers.forEach(sup => {
const existing = (APP.ingredientPrices || []).find(ip =>
ip && ip.ingredient_name && item.name &&
ip.ingredient_name.toLowerCase().trim() === item.name.toLowerCase().trim() &&
String(ip.fournisseur_id) === String(sup.id)
);
const priceVal = existing ? existing.prix_unitaire : '';
const unitVal = existing ? existing.unite : getPriceRef(item.unit);
const div = document.createElement('div');
div.className = 'supplier-price-row';
div.style = 'display:flex; justify-content:space-between; align-items:center; gap:10px; border-bottom: 1px solid var(--border-light); padding-bottom: 8px;';
div.innerHTML = `
<div style="flex:1;">
<strong style="font-size:0.9rem; display:block;">${escapeHtml(sup.name)}</strong>
<small style="color:var(--text-muted); font-size:0.7rem;">${escapeHtml(sup.categories?.join(', ') || 'Fournisseur')}</small>
</div>
<div style="display:flex; align-items:center; gap:6px; max-width:200px;">
<input type="number" class="form-input supplier-price-input" data-supplier-id="${sup.id}" value="${priceVal}" placeholder="Défaut" style="width:90px;" min="0" step="0.0001" />
<select class="form-input supplier-unit-select" data-supplier-id="${sup.id}" style="width:70px;">
<option value="kg" ${unitVal === 'kg' ? 'selected' : ''}>kg</option>
<option value="L" ${unitVal === 'L' ? 'selected' : ''}>L</option>
<option value="pièce" ${unitVal === 'pièce' ? 'selected' : ''}>pièce</option>
</select>
</div>
`;
container.appendChild(div);
});
}
}
window.openModal('ingredientConfigModal');
}
async function saveIngredientConfig() {
const id = $('#ingConfigId').value;
const item = APP.inventory.find(i => i.id === id);
if (!item) return;
item.alertThreshold = parseFloat($('#ingConfigAlert').value) || 0;
item.price = parseFloat($('#ingConfigPrice').value) || 0;
await saveInventory();
const inputs = $$('.supplier-price-input');
for (const input of inputs) {
const supplierId = input.dataset.supplierId;
const priceVal = parseFloat(input.value);
const unitSelect = document.querySelector(`.supplier-unit-select[data-supplier-id="${supplierId}"]`);
const unitVal = unitSelect ? unitSelect.value : 'kg';
const existingIdx = (APP.ingredientPrices || []).findIndex(ip =>
ip && ip.ingredient_name && item.name &&
ip.ingredient_name.toLowerCase().trim() === item.name.toLowerCase().trim() &&
String(ip.fournisseur_id) === String(supplierId)
);
if (!isNaN(priceVal) && priceVal >= 0) {
const priceData = {
ingredient_name: item.name,
fournisseur_id: String(supplierId),
prix_unitaire: priceVal,
unite: unitVal
};
if (existingIdx !== -1) {
priceData.id = APP.ingredientPrices[existingIdx].id;
APP.ingredientPrices[existingIdx] = { ...APP.ingredientPrices[existingIdx], ...priceData };
} else {
priceData.id = GourmetSync.uuid();
APP.ingredientPrices.push(priceData);
}
if (window.GourmetSync && typeof GourmetSync.sauvegarderIngredientPrice === 'function') {
await GourmetSync.sauvegarderIngredientPrice(priceData);
}
} else {
if (existingIdx !== -1) {
const toDelete = APP.ingredientPrices[existingIdx];
if (window.GourmetSync && typeof GourmetSync.supprimerIngredientPrice === 'function') {
await GourmetSync.supprimerIngredientPrice(toDelete.id);
}
APP.ingredientPrices.splice(existingIdx, 1);
}
}
}
renderInventory();
updateDashboard();
window.closeModal('ingredientConfigModal');
if (typeof showToast === 'function') {
showToast('✅ Configuration enregistrée !', 'success');
}
}
function loadSuppliers() {
const saved = localStorage.getItem('gourmet_suppliers');
APP.suppliers = saved ? JSON.parse(saved) : [];
if (!saved) saveSuppliers();
if (navigator.onLine && window.GourmetSync) {
GourmetSync.chargerFournisseurs().then(cloudSuppliers => {
if (cloudSuppliers !== null) {
APP.suppliers = cloudSuppliers;
localStorage.setItem('gourmet_suppliers', JSON.stringify(APP.suppliers));
if (typeof renderSuppliers === 'function') renderSuppliers();
}
}).catch(() => {});
}
}
function saveSuppliers() {
localStorage.setItem('gourmet_suppliers', JSON.stringify(APP.suppliers));
if (window.GourmetSync) {
APP.suppliers.forEach(s => GourmetSync.sauvegarderFournisseur(s).catch(() => {}));
}
}
window.currentSupplierCat = 'all';
function filterSupplierCat(cat) {
window.currentSupplierCat = cat;
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
<button class="btn btn-outline" style="padding:6px 12px; font-size:0.75rem;" onclick="window.openSupplierOrderGenerator('${s.id}')">📝 Commander</button>
<button class="btn-icon" title="Modifier" onclick="editSupplier('${s.id}')">✏️</button>
<button class="btn-icon" title="Supprimer" onclick="deleteSupplier('${s.id}')" style="color:var(--danger); opacity:0.6;">🗑️</button>
</div>
</div>
`;
}).join('');
}
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

// --- MODULE: app-auth.js ---
async function showSubscriptionRequiredOverlay(email) {
let overlay = document.getElementById('stripeSubscriptionRequiredOverlay');
if (overlay) return;
overlay = document.createElement('div');
overlay.id = 'stripeSubscriptionRequiredOverlay';
overlay.className = 'glass-modal-overlay';
overlay.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(15,23,42,0.85); backdrop-filter:blur(16px); z-index:99999; display:flex; justify-content:center; align-items:center; color:#fff; font-family:Inter, sans-serif;';
overlay.innerHTML = `
<div style="background:var(--surface, #1e293b); border:1px solid var(--border, #334155); border-radius:24px; padding:3rem; max-width:480px; width:90%; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); display:flex; flex-direction:column; align-items:center; justify-content:center; gap:1.5rem;">
<div class="spinner-premium" style="width:40px; height:40px; border:3px solid rgba(99,102,241,0.2); border-top-color:#6366f1; border-radius:50%; animation:spin 1s linear infinite;"></div>
<p style="color:#94a3b8; font-size:0.95rem;">Vérification du statut de l'abonnement...</p>
</div>
`;
document.body.appendChild(overlay);
['mainNav', 'mobileNavBar', 'appMain', 'hubSection'].forEach(id => {
const el = document.getElementById(id);
if (el) el.style.display = 'none';
});
let subStatus = { plan: 'free', status: 'inactive', subscription_active: false, has_subscription: false };
try {
if (window.GourmetBilling && typeof window.GourmetBilling.checkSubscriptionStatus === 'function') {
subStatus = await window.GourmetBilling.checkSubscriptionStatus();
}
} catch (err) {
console.error('Error fetching subscription status in overlay:', err);
}
const hasSub = subStatus.has_subscription;
const isTrialExpired = hasSub && !subStatus.subscription_active;
let title = "Abonnement requis";
let description = "Bienvenue ! GourmetRevient est un outil professionnel. Pour accéder à votre laboratoire et commencer vos calculs, veuillez activer votre abonnement Pro Chef.";
let priceBadgeTitle = "👨‍🍳 Offre Pro Chef";
let priceBadgeText = "29,99 € <span style=\"font-size:0.9rem; font-weight:400; color:#94a3b8;\">/ mois HT</span>";
let buttonText = "Commencer l'essai gratuit (14 jours)";
let buttonAction = `GourmetBilling.checkout('pro_monthly', '${email}')`;
if (isTrialExpired) {
title = "Votre essai a expiré";
description = "Votre période d'essai gratuit de 14 jours ou votre abonnement a expiré. Pour retrouver l'accès à vos fiches techniques, vos stocks et votre outil HACCP, veuillez activer votre abonnement Pro Chef en ajoutant un moyen de paiement.";
priceBadgeTitle = "👨‍🍳 Statut de l'abonnement";
priceBadgeText = "Essai / Abonnement Expiré";
buttonText = "Activer mon abonnement Pro Chef";
buttonAction = `GourmetBilling.openCustomerPortal()`;
}
overlay.innerHTML = `
<div style="background:var(--surface, #1e293b); border:1px solid var(--border, #334155); border-radius:24px; padding:3rem; max-width:480px; width:90%; text-align:center; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5);">
<div style="font-size:3rem; margin-bottom:1.5rem;">🧁</div>
<h2 style="font-size:1.8rem; font-weight:800; margin-bottom:1rem; color:#fff;">${title}</h2>
<p style="color:#94a3b8; font-size:0.95rem; margin-bottom:2rem; line-height:1.5;">
${description}
</p>
<div style="background:rgba(99,102,241,0.1); border:1px solid rgba(99,102,241,0.3); border-radius:16px; padding:1.25rem; margin-bottom:2rem;">
<div style="font-weight:700; font-size:1.1rem; color:#818cf8; margin-bottom:4px;">${priceBadgeTitle}</div>
<div style="font-size:1.5rem; font-weight:900; color:#fff;">${priceBadgeText}</div>
${!isTrialExpired ? `<div style="font-size:0.8rem; color:#a5b4fc; margin-top:6px; font-weight:600;">14 jours d'essai gratuits · Sans engagement</div>` : `<div style="font-size:0.8rem; color:#f87171; margin-top:6px; font-weight:600;">Accès restreint aux fonctionnalités</div>`}
</div>
<button class="btn btn-primary" onclick="${buttonAction}" style="width:100%; padding:1rem; font-size:1.1rem; font-weight:700; border-radius:12px; background:linear-gradient(135deg, #6366f1, #4f46e5); color:#fff; border:none; cursor:pointer; margin-bottom:1rem; box-shadow:0 10px 20px -5px rgba(99,102,241,0.4);">
${buttonText}
</button>
<button id="authOverlayLogoutBtn" style="background:none; border:none; color:#94a3b8; cursor:pointer; font-size:0.9rem; text-decoration:underline;">
Se déconnecter
</button>
</div>
`;
const logoutBtn = document.getElementById('authOverlayLogoutBtn');
if (logoutBtn) {
logoutBtn.addEventListener('click', () => {
if (window.AuthUI && typeof window.AuthUI.logout === 'function') {
window.AuthUI.logout();
} else {
localStorage.removeItem('gourmet_auth');
location.reload();
}
});
}
}
function removeSubscriptionRequiredOverlay() {
const overlay = document.getElementById('stripeSubscriptionRequiredOverlay');
if (overlay) overlay.remove();
}
function showTrialCountdownBanner(daysLeft) {
let banner = document.getElementById('trialCountdownBanner');
if (!banner) {
banner = document.createElement('div');
banner.id = 'trialCountdownBanner';
banner.style.cssText = `
position: fixed;
bottom: 24px;
left: 50%;
transform: translateX(-50%);
z-index: 9999;
background: rgba(30, 41, 59, 0.85);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(99, 102, 241, 0.3);
border-radius: 9999px;
padding: 10px 24px;
display: flex;
align-items: center;
gap: 16px;
box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(99, 102, 241, 0.1);
font-family: Inter, sans-serif;
font-size: 0.9rem;
color: #fff;
transition: all 0.3s ease;
`;
document.body.appendChild(banner);
}
banner.innerHTML = `
<span style="display: flex; align-items: center; gap: 8px;">
<span style="font-size: 1.1rem;">⏳</span>
<span>Il vous reste <strong style="color: #a5b4fc;">${daysLeft} jour${daysLeft > 1 ? 's' : ''}</strong> d'essai gratuit</span>
</span>
<button onclick="GourmetBilling.openCustomerPortal()" style="
background: linear-gradient(135deg, #6366f1, #4f46e5);
color: #fff;
border: none;
border-radius: 9999px;
padding: 6px 16px;
font-size: 0.8rem;
font-weight: 700;
cursor: pointer;
box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
transition: all 0.2s ease;
" onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
S'abonner
</button>
`;
}
function removeTrialCountdownBanner() {
const banner = document.getElementById('trialCountdownBanner');
if (banner) banner.remove();
}
function checkAuth() {
const user = window.AuthUI?.getCurrentUser();
const isLegacyAuth = localStorage.getItem('gourmet_auth') === 'true';
if (user || isLegacyAuth) {
const isProOrAdmin = window.AuthUI && typeof window.AuthUI.isPro === 'function' ? window.AuthUI.isPro() : false;
const name = localStorage.getItem('gourmet_current_user') || '';
const lowerName = name.toLowerCase().trim();
const isAdminBypass = ['ju 2503', 'ju', 'support@gourmetrevient.fr', 'contact', 'julian', 'julian peresson', 'julian31.peresson@gmail.com', 'contact@gourmetrevient.fr', 'julianperesson@gmail.com', 'peresson', 'julia'].includes(lowerName) ||
lowerName.includes('julian') ||
lowerName.includes('peresson') ||
lowerName.includes('julia') ||
lowerName === 'ju';
if (!isProOrAdmin && !isAdminBypass && user) {
console.info('🔒 Abonnement requis. Accès bloqué.');
showSubscriptionRequiredOverlay(user.email);
return;
}
removeSubscriptionRequiredOverlay();
console.info('🔓 Authentification confirmée, déverrouillage de l\'interface...');
(async () => {
try {
if (window.GourmetBilling && typeof window.GourmetBilling.checkSubscriptionStatus === 'function') {
const subStatus = await window.GourmetBilling.checkSubscriptionStatus();
if (subStatus.status === 'trialing' && subStatus.trial_end) {
const trialEndMs = new Date(subStatus.trial_end).getTime();
const nowMs = Date.now();
const diffMs = trialEndMs - nowMs;
if (diffMs > 0) {
const daysLeft = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
showTrialCountdownBanner(daysLeft);
} else {
removeTrialCountdownBanner();
}
} else {
removeTrialCountdownBanner();
}
}
} catch (err) {
console.error('Error handling trial countdown banner:', err);
}
})();
const wasPending = document.body.classList.contains('auth-pending');
document.body.classList.remove('auth-pending');
const isMobile = window.innerWidth <= 768;
['mainNav', 'mobileNavBar', 'userProfileArea', 'headerBrand', 'appMain'].forEach(id => {
const el = document.getElementById(id);
if (el) {
if (id === 'mobileNavBar') {
el.style.setProperty('display', isMobile ? 'flex' : 'none', 'important');
} else if (id === 'mainNav') {
el.style.setProperty('display', isMobile ? 'none' : 'flex', 'important');
} else {
const displayType = (id === 'appMain') ? 'block' : 'flex';
el.style.setProperty('display', displayType, 'important');
}
}
});
if (wasPending) {
const isAnyAppVisible = [
'appRecettes', 'appMgmt', 'appInventaire', 'appCRM', 'planningSection',
'appLaboratoire', 'appPortfolio', 'appHygiene', 'appScheduler', 'appAdmin'
].some(id => {
const el = document.getElementById(id);
if (!el) return false;
const display = window.getComputedStyle(el).display;
return display !== 'none';
});
if (!isAnyAppVisible) {
const hub = document.getElementById('hubSection');
if (hub) {
hub.style.display = 'block';
hub.classList.add('active');
}
if (typeof showHub === 'function') showHub();
}
}
const overlay = document.getElementById('authManualOverlay');
if (overlay) overlay.style.display = 'none';
updateDashboard();
loadSavedRecipes();
} else {
document.body.classList.add('auth-pending');
}
}
function loginSuccess(user) {
localStorage.setItem('gourmet_auth', 'true');
location.reload();
}
function updateDashboard() {
const name = localStorage.getItem(STORAGE_KEYS.currentUser) || 'Artisan';
const displayName = name.replace(/[\s-]*2503.*$/i, '');
let usersDb = {};
try {
usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
} catch(e) {
console.error('Error parsing usersDb', e);
}
const userKey = name.toLowerCase();
const userData = usersDb[userKey] || {};
const gender = userData.gender || 'male';
const welcome = $('#welcomeUserName');
if (welcome) welcome.textContent = displayName;
const headerName = $('#userNameHeader');
if (headerName) headerName.textContent = displayName;
const lowerNameLocal = name.toLowerCase().trim();
const isAdminLocal = ['ju 2503', 'ju', 'support@gourmetrevient.fr', 'contact', 'julian', 'julian peresson', 'julian31.peresson@gmail.com', 'contact@gourmetrevient.fr', 'julianperesson@gmail.com', 'peresson', 'julia'].includes(lowerNameLocal) ||
lowerNameLocal.includes('julian') ||
lowerNameLocal.includes('peresson') ||
lowerNameLocal.includes('julia') ||
lowerNameLocal === 'ju';
if (isAdminLocal) {
window.GOURMET_PLAN = 'admin';
const proBtn = document.getElementById('btnSubscribePro');
if (proBtn) {
proBtn.classList.add('btn-pro-active');
proBtn.innerHTML = '<span>⭐ Pro</span>';
proBtn.onclick = () => { if(typeof showToast === 'function') showToast('✨ Mode Administrateur Actif', 'info'); };
}
}
if (typeof hydratePremiumDashboard === 'function') {
hydratePremiumDashboard();
}
const greeting = $('.dash-greeting');
if (greeting) {
const greetingText = t('dash.greeting');
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
const navAdmin = $('#navAdmin');
if (navAdmin) {
const isJulianAdmin = ['ju 2503', 'ju', 'support@gourmetrevient.fr', 'contact', 'julian', 'julian peresson', 'julian31.peresson@gmail.com', 'contact@gourmetrevient.fr', 'julianperesson@gmail.com', 'peresson', 'julia'].includes(userKey.trim()) ||
userKey.includes('julian') ||
userKey.includes('peresson') ||
userKey.includes('julia') ||
userKey.trim() === 'ju';
const isAdmin = isJulianAdmin || (userKey === 'ju 2503') || (userKey === 'ju' && userData?.isAdmin) || (userKey === 'ju' && userData?.pin === '2503');
navAdmin.style.display = isAdmin ? 'block' : 'none';
}
const locale = (typeof getLang === 'function') ? (getLang() === 'en' ? 'en-GB' : (getLang() === 'es' ? 'es-ES' : 'fr-FR')) : 'fr-FR';
const dateEl = $('#dashDateHeader');
if (dateEl) {
const options = { day: 'numeric', month: 'long', year: 'numeric' };
dateEl.textContent = new Date().toLocaleDateString(locale, options);
}
const recipeCount = APP.savedRecipes.length;
if ($('#statRecipeCount')) $('#statRecipeCount').textContent = recipeCount;
const teamCount = APP.teamMembers.length;
if ($('#statTeamCount')) $('#statTeamCount').textContent = teamCount;
const ingInDb = typeof DEFAULT_INGREDIENT_DB !== 'undefined' ? DEFAULT_INGREDIENT_DB.length : 0;
if ($('#statIngCount')) $('#statIngCount').textContent = ingInDb;
const lowStockCount = APP.inventory.filter(item => item.stock <= item.alertThreshold).length;
const priceAlertCount = APP.inventory.filter(item => {
if (!item.priceHistory || item.priceHistory.length < 2) return false;
const last = item.priceHistory[item.priceHistory.length - 1];
return parseFloat(last.change) > 1;
}).length;
if (invTotalItems) invTotalItems.textContent = APP.inventory.length;
if (invLowStock) invLowStock.textContent = lowStockCount;
if (invPriceAlerts) invPriceAlerts.textContent = priceAlertCount;
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
let lastTipIndex = -1;
function updateRandomTip() {
const tipTextEl = $('#dashTipBody');
if (!tipTextEl) return;
const count = 11;
let newIndex;
do {
newIndex = Math.floor(Math.random() * count) + 1;
} while (newIndex === lastTipIndex);
lastTipIndex = newIndex;
tipTextEl.style.transition = 'none';
tipTextEl.style.opacity = '0';
setTimeout(() => {
tipTextEl.innerHTML = `<strong>${t('dash.tip_prefix')}</strong> ${t('tip.' + newIndex)}`;
tipTextEl.style.transition = 'opacity 0.5s ease-in-out';
tipTextEl.style.opacity = '1';
}, 300);
}
function toggleProfileDropdown() {
$('#profileDropdown').classList.toggle('show');
}
function showPinModal() {
window.openModal('pinModal');
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
const demoToggleModal = $('#demoToggleModal');
if (demoToggleModal) {
demoToggleModal.checked = (localStorage.getItem('gourmet_demo_mode') === 'true');
}
}
function hidePinModal() {
window.closeModal('pinModal');
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
if (!usersDb[userKey]) usersDb[userKey] = {};
if (pin1) {
if (!GourmetSecurity.validate('password', pin1)) {
showToast(t('toast.pin.short'), 'error');
return;
}
if (pin1 !== pin2) {
showToast(t('toast.pin.mismatch'), 'error');
return;
}
usersDb[userKey].password = pin1;
usersDb[userKey].pin = pin1;
}
usersDb[userKey].gender = gender || usersDb[userKey].gender || 'male';
usersDb[userKey].email = email;
usersDb[userKey].role = $('#profileRole').value;
localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(usersDb)); if (window.GourmetCloud && window.GourmetCloud.syncUsersToCloud) GourmetCloud.syncUsersToCloud();
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

// --- MODULE: app-planning.js ---
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
if (navigator.onLine && window.GourmetSync) {
Promise.all([
GourmetSync.chargerTeam(),
GourmetSync.chargerLeaves()
]).then(([cloudTeam, cloudLeaves]) => {
if (cloudTeam !== null && cloudTeam.length > 0) {
APP.teamMembers = cloudTeam;
APP.teamMembers.forEach((m, i) => { if (m.colorIdx === undefined) m.colorIdx = i; });
localStorage.setItem(getUserTeamKey(), JSON.stringify(APP.teamMembers));
if (typeof renderTeamList === 'function') renderTeamList();
}
if (cloudLeaves !== null && cloudLeaves.length > 0) {
APP.staffLeaves = cloudLeaves;
localStorage.setItem(getUserLeavesKey(), JSON.stringify(APP.staffLeaves));
if (typeof renderLeaveCalendar === 'function') renderLeaveCalendar();
}
}).catch(() => {});
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
if (window.GourmetSync) {
APP.teamMembers.forEach(m => GourmetSync.sauvegarderMember(m).catch(() => {}));
APP.staffLeaves.forEach(l => GourmetSync.sauvegarderLeave(l).catch(() => {}));
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
const profileRole = usersDb[userKey]?.role || 'Consultant';
let role = myEntry ? myEntry.role : (isOwner ? profileRole : 'Consultant');
const isChef = (role === 'Chef de Labo');
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
notif.status = action === 'approve' ? 'approved' : 'denied';
notif.handled = true;
notif.read = true;
saveNotifications();
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

// --- MODULE: app-analytics.js ---
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
const saved = APP.savedRecipes || [];
const library = typeof RECIPES !== 'undefined' ? RECIPES : [];
let recipes = [...saved, ...library];
if (recipes.length === 0) {
const grid = document.querySelector('.stats-main-grid');
if (grid) {
grid.style.opacity = '0.5';
grid.style.pointerEvents = 'none';
}
const insightText = document.getElementById('statsInsightText');
if (insightText) insightText.innerHTML = "Créez vos premières recettes pour activer l'analyse stratégique.";
const vigilanceList = document.getElementById('statsVigilanceList');
if (vigilanceList) vigilanceList.innerHTML = '<div style="text-align:center; padding:1rem; color:var(--text-muted); font-size:0.8rem;">Aucune donnée à analyser.</div>';
return;
} else {
const grid = document.querySelector('.stats-main-grid');
if (grid) {
grid.style.opacity = '1';
grid.style.pointerEvents = 'auto';
}
}
const allResults = recipes.map(r => ({
...r,
data: calcFullCost(r.margin || 70, r)
}));
const filteredResults = window.currentStatsCat === 'all'
? allResults
: allResults.filter(r => r.category === window.currentStatsCat);
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
const vigilanceList = document.getElementById('statsVigilanceList');
if (vigilanceList) vigilanceList.innerHTML = '<div style="text-align:center; padding:1rem; color:var(--text-muted); font-size:0.8rem;">Aucune recette dans cette catégorie.</div>';
return;
}
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
const clone = container.cloneNode(true);
clone.style.display = 'block';
clone.style.background = '#ffffff';
clone.classList.add('pdf-export-mode');
clone.querySelectorAll('button, input').forEach(el => el.remove());
clone.querySelector('.stats-filter-bar')?.remove();
const exportContainer = document.createElement('div');
exportContainer.style.position = 'fixed';
exportContainer.style.top = '0';
exportContainer.style.left = '0';
exportContainer.style.zIndex = '-9999';
exportContainer.style.width = '1200px';
exportContainer.appendChild(clone);
document.body.appendChild(exportContainer);
opt.html2canvas.windowWidth = 1200;
opt.html2canvas.scrollY = 0;
opt.html2canvas.scrollX = 0;
try {
await html2pdf().set(opt).from(exportContainer).save();
showToast(i18n.t('ui.toast.exported') || "Rapport exporté avec succès", "success");
} catch (err) {
console.error("PDF Export Error:", err);
showToast("Erreur lors de l'export PDF", "error");
} finally {
if (document.body.contains(exportContainer)) document.body.removeChild(exportContainer);
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
const quadrantPlugin = {
id: 'quadrants',
beforeDraw(chart) {
const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;
const midX = x.getPixelForValue((x.max + x.min) / 2);
const midY = y.getPixelForValue(50);
ctx.save();
ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
ctx.fillRect(left, top, midX - left, midY - top);
ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
ctx.fillRect(midX, top, right - midX, midY - top);
ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
ctx.fillRect(left, midY, midX - left, bottom - midY);
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
const container = document.getElementById('statsVigilanceList');
if (!container) return;
const threshold = (APP.config?.criticalMargin || 65);
const problematic = results.filter(r => r.data.marginPct < threshold).sort((a, b) => a.data.marginPct - b.data.marginPct);
if (problematic.length === 0) {
container.innerHTML = `
<div style="text-align:center; padding:1.5rem; background:rgba(34,197,94,0.05); border-radius:15px; border:1px dashed rgba(34,197,94,0.2);">
<div style="font-size:1.5rem; margin-bottom:0.5rem;">🎉</div>
<div style="color:#166534; font-weight:700; font-size:0.85rem;">Tout est sous contrôle</div>
<div style="color:#166534; font-size:0.75rem; opacity:0.8;">Toutes vos marges sont au-dessus de ${threshold}%.</div>
</div>`;
return;
}
container.innerHTML = problematic.map(r => {
const isCritical = r.data.marginPct < (threshold - 10);
const suggestion = isCritical
? `Augmentez le prix de ~${(r.data.sellingPrice * 0.15).toFixed(2)}€`
: `Optimisez les coûts matières`;
return `
<div class="vigilance-item">
<div class="vigilance-icon ${isCritical ? 'critical' : 'warn'}">
${isCritical ? '🚨' : '⚠️'}
</div>
<div class="vigilance-content">
<span class="vigilance-title">${escapeHtml(r.name)} : ${r.data.marginPct.toFixed(1)}%</span>
<span class="vigilance-desc">${suggestion}</span>
</div>
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

// --- MODULE: app-production.js ---
let prodState = { step: 0, recipe: null, timer: null, seconds: 0 };
function showProductionMode(recipeId) {
const recipe = RECIPES.find(r => r.id === recipeId) || JSON.parse(localStorage.getItem('gourmet_saved_recipes') || '[]').find(r => r.id === recipeId);
if (!recipe) return;
prodState = { step: 0, recipe, timer: null, seconds: 0 };
window.openModal('productionModal');
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
window.closeModal('productionModal');
if (prodState.timer) clearInterval(prodState.timer);
showToast("Production terminée, stocks mis à jour !");
setTimeout(() => {
if (typeof window.openProductionLogger === 'function') {
window.openProductionLogger(prodState.recipe.id, prodState.recipe.portions);
}
}, 400);
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
window.closeModal('productionModal');
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
window.openModal('supplierModal');
}
function closeSupplierModal() {
window.closeModal('supplierModal');
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
let targetSupplier;
if (id) {
const s = APP.suppliers.find(sup => sup.id == id || sup.id.toString() === id.toString());
if (s) {
s.name = name;
s.contact = contact;
s.email = email;
s.categories = [category];
s.rating = rating;
targetSupplier = s;
}
} else {
const newUUID = window.GourmetSync ? GourmetSync.uuid() : ('sup_' + Date.now());
const newSup = { id: newUUID, name, contact, email, categories: [category], rating, leadTime: 3 };
APP.suppliers.push(newSup);
targetSupplier = newSup;
}
saveSuppliers();
if (window.GourmetSync && targetSupplier) {
const isValidUUID = str => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
if (isValidUUID(targetSupplier.id)) GourmetSync.sauvegarderFournisseur(targetSupplier).catch(() => {});
}
renderSuppliers();
closeSupplierModal();
showToast(id ? "Fournisseur mis à jour" : "Fournisseur ajouté", "success");
}
function editSupplier(id) {
const s = APP.suppliers.find(sup => sup.id == id || sup.id.toString() === id.toString());
if (!s) return;
$('#editSupplierId').value = s.id;
$('#supName').value = s.name;
$('#supContact').value = s.contact || '';
$('#supEmail').value = s.email || '';
$('#supCategory').value = (s.categories && s.categories[0]) || 'Général';
$('#supRating').value = Math.round(s.rating || 5).toString();
$('#supplierModalTitle').textContent = '✏️ Modifier ' + s.name;
window.openModal('supplierModal');
}
function deleteSupplier(id) {
if (!confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;
APP.suppliers = APP.suppliers.filter(s => s.id != id && s.id.toString() !== id.toString());
saveSuppliers();
if (window.GourmetSync) {
const isValidUUID = str => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
if (isValidUUID(id)) GourmetSync.supprimerFournisseur(id).catch(() => {});
}
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
showToast(t('plan.toast.invited', { name: notif.from }), 'info');
}
}
function acceptInvite(id) {
const notif = APP.notifications.find(n => n.id === id);
if (!notif) return;
const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
const owner = notif.from;
const ownerKey = owner.toLowerCase();
const shared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
if (!shared[ownerKey]) shared[ownerKey] = [];
if (!shared[ownerKey].includes(currentUser.toLowerCase())) {
shared[ownerKey].push(currentUser.toLowerCase());
}
localStorage.setItem(STORAGE_KEYS.sharedPlannings, JSON.stringify(shared));
const teamKey = `${STORAGE_KEYS.teamMembers}_${ownerKey}`;
let ownerTeam = JSON.parse(localStorage.getItem(teamKey) || '[]');
let ownerInTeam = ownerTeam.find(m => m.name.toLowerCase() === ownerKey);
if (!ownerInTeam) {
ownerTeam.push({ id: 'owner_' + Date.now(), name: owner, role: 'Chef de Labo', colorIdx: 0 });
}
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
notif.status = 'accepted';
notif.read = true;
saveNotifications();
renderNotifications();
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
shared[ownerKey] = shared[ownerKey].filter(u => u !== user.toLowerCase());
localStorage.setItem(STORAGE_KEYS.sharedPlannings, JSON.stringify(shared));
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
const wrap = $('.planning-selector-wrap');
if (wrap) {
wrap.style.display = (invitedTo.length >= 2) ? 'block' : 'none';
}
if (invitedTo.length > 0 && !APP.viewOwner) {
APP.viewOwner = invitedTo[0];
loadTeamMembers();
renderTeam();
renderLeaves();
}
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
if (APP.teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase())) {
showToast(t('plan.team.already_in', { name }), 'info');
return;
}
const isFemale = targetUserData.gender === 'female';
let roleToProcess = targetUserData.role || role;
if (APP.teamMembers.length === 0) {
roleToProcess = 'Chef de Labo';
}
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
select.value = member.role;
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
const container = document.getElementById('annualCalendarView');
if (!container) return;
const currentZone = localStorage.getItem('gourmet_vacation_zone') || 'C';
const currentYear = 2026;
const months = {
1:'Janvier', 2:'Février', 3:'Mars', 4:'Avril', 5:'Mai', 6:'Juin',
7:'Juillet', 8:'Août', 9:'Septembre', 10:'Octobre', 11:'Novembre', 12:'Décembre'
};
const zoneHolidays = {
'A': ['2026-02-07', '2026-02-23', '2026-04-11', '2026-04-27'],
'B': ['2026-02-14', '2026-03-02', '2026-04-18', '2026-05-04'],
'C': ['2026-02-21', '2026-03-09', '2026-04-04', '2026-04-20']
};
const events = {
'01-01': '✨ Nouvel An', '01-06': '👑 Épiphanie', '02-02': '🥞 Chandeleur', '02-14': '💖 Valentin',
'03-01': '👵 Fête G-Mères', '04-05': '🐣 Pâques', '04-06': '🍫 Lundi Pâques', '05-01': '🌿 Fête Travail',
'05-08': '🎖️ Victoire 1945', '05-14': '☁️ Ascension', '05-24': '🕊️ Pentecôte', '05-31': '🌸 Fête Mères',
'06-21': '👔 Fête Pères', '07-14': '🎆 Fête Nationale', '08-15': '⛪ Assomption', '11-01': '🕯️ Toussaint',
'12-25': '🎄 Noël', '12-31': '🍾 St Sylvestre'
};
let html = '';
for (let m = 0; m < 12; m++) {
const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
html += `<div class="month-view" style="display:grid; grid-template-columns: 160px 1fr; align-items:center; gap:2rem; padding:1.2rem; border-bottom:1px solid rgba(0,0,0,0.05);">
<h4 style="margin:0; font-family:var(--font-heading); color:var(--primary); font-size:1.3rem; font-weight:900; text-transform:capitalize;">${months[m+1]}</h4>
<div style="display:grid; grid-template-columns: repeat(31, 1fr); gap:5px; width:100%;">`;
for (let d = 1; d <= 31; d++) {
if (d > daysInMonth) { html += `<div></div>`; continue; }
const date = new Date(currentYear, m, d);
const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const mmDd = dateStr.slice(5);
const isWE = date.getDay() === 0 || date.getDay() === 6;
const holidayRange = zoneHolidays[currentZone] || zoneHolidays.C;
let isVacation = false;
if ((dateStr >= holidayRange[0] && dateStr <= holidayRange[1]) ||
(dateStr >= holidayRange[2] && dateStr <= holidayRange[3]) ||
(dateStr >= '2026-07-04' && dateStr <= '2026-08-31') ||
(dateStr >= '2026-10-17' && dateStr <= '2026-11-02') ||
(dateStr >= '2026-12-19' && dateStr <= '2027-01-04')) {
isVacation = true;
}
const event = events[mmDd];
let cellStyle = `height:46px; display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:800; border-radius:8px; position:relative; `;
if (event) cellStyle += `background:var(--accent); color:white; scale:1.15; z-index:2; box-shadow:0 6px 12px var(--accent-glow); margin:0 2px;`;
else if (isVacation) cellStyle += `background:rgba(16, 185, 129, 0.15); color:var(--success); `;
else if (isWE) cellStyle += `background:var(--bg-alt); opacity:0.6; `;
else cellStyle += `background:rgba(0,0,0,0.02); color:var(--text-secondary);`;
html += `<div style="${cellStyle}" title="${event || (isVacation ? 'Vacances' : '')}">
${d}${event ? `<span style="position:absolute; bottom:0px; font-size:0.55rem; width:100%; text-align:center;">${event.split(' ')[0]}</span>` : ''}
</div>`;
}
html += `</div></div>`;
}
container.innerHTML = html;
}
async function renderAdminUsers() {
const container = $('#adminUserList');
if (!container) return;
container.innerHTML = `<tr><td colspan="5" style="padding:2rem; text-align:center;"><div class="spinner-pro"></div><br>Chargement des utilisateurs Supabase...</td></tr>`;
try {
const { data: profiles, error } = await gourmetSupabase
.from('profiles')
.select('*')
.order('created_at', { ascending: false });
if (error) throw error;
if (!profiles || profiles.length === 0) {
container.innerHTML = `<tr><td colspan="5" style="padding:1rem; text-align:center;">${t('admin.col.user') === 'User' ? 'No registered users.' : 'Aucun utilisateur enregistré.'}</td></tr>`;
return;
}
container.innerHTML = profiles.map(u => {
const isAdmin = u.plan === 'admin' || u.is_admin === true;
const isBanned = u.is_banned || false;
const planLabel = u.plan ? u.plan.toUpperCase() : 'FREE';
const planColor = u.plan === 'admin' ? 'var(--primary)' : (u.plan === 'pro' ? 'var(--secondary)' : 'var(--text-muted)');
return `
<tr style="border-bottom:1px solid var(--surface-border); ${isBanned ? 'opacity:0.6; background:rgba(254,226,226,0.3);' : ''}">
<td style="padding:1rem; font-weight:600;">
<div style="display:flex; align-items:center; gap:10px;">
<span style="font-size:1.2rem;">${u.gender === 'female' ? '👩‍🍳' : '👨‍🍳'}</span>
<div>
${escapeHtml(u.full_name || u.email.split('@')[0])}
${isAdmin ? '<span style="margin-left:5px; font-size:0.65rem; background:var(--primary); color:white; padding:1px 4px; border-radius:3px; font-weight:800;">ADMIN</span>' : ''}
</div>
</div>
</td>
<td style="padding:1rem; color:var(--text-muted); font-size:0.85rem;">${escapeHtml(u.email || '—')}</td>
<td style="padding:1rem;">
<span style="font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:20px; background:${planColor}22; color:${planColor}; border:1px solid ${planColor}44;">
${planLabel}
</span>
</td>
<td style="padding:1rem; font-size:0.85rem;">${escapeHtml(u.role || 'Chef de Labo')}</td>
<td style="padding:1rem; text-align:right; display:flex; gap:0.5rem; justify-content:flex-end;">
<button class="btn btn-sm btn-outline" onclick="openAdminModeration('${u.id}')">🛡️ ${t('nav.admin') === 'Admin' ? 'Moderate' : 'Modérer'}</button>
${!isAdmin ?
`<button class="btn btn-sm btn-outline" style="color:var(--danger); border-color:var(--danger);" onclick="deleteUserSupabase('${u.id}')">🗑️</button>` :
'<small style="color:var(--text-muted); padding:0 0.5rem;">Admin</small>'}
</td>
</tr>
`;
}).join('');
} catch (err) {
console.error('Admin Fetch Error:', err);
container.innerHTML = `<tr><td colspan="5" style="padding:1rem; text-align:center; color:var(--danger);">Erreur de connexion Supabase. Vérifiez vos politiques RLS.</td></tr>`;
}
}
let selectedModerationUser = null;
async function openAdminModeration(userId) {
const container = $('#adminUserDetail');
if (!container) return;
selectedModerationUser = userId;
window.openModal('adminUserModal');
container.innerHTML = '<div style="padding:1rem; text-align:center;"><div class="spinner-pro"></div></div>';
try {
const { data: u, error } = await gourmetSupabase
.from('profiles')
.select('*')
.eq('id', userId)
.single();
if (error) throw error;
const isAdmin = u.plan === 'admin';
const isBanned = u.is_banned || false;
container.innerHTML = `
<div style="background:var(--bg-alt); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--surface-border);">
<div style="display:flex; align-items:center; gap:12px; margin-bottom:1rem;">
<span style="font-size:2rem;">${u.gender === 'female' ? '👩‍🍳' : '👨‍🍳'}</span>
<div>
<div style="font-weight:900; font-size:1.2rem;">${escapeHtml(u.full_name || 'Chef')}</div>
<div style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(u.email)}</div>
</div>
</div>
<div style="display:grid; grid-template-columns:auto 1fr; gap:0.5rem 1rem; font-size:0.9rem; padding-top:1rem; border-top:1px dashed var(--surface-border);">
<span style="color:var(--text-muted);">ID Supabase:</span> <code style="font-size:0.7rem;">${u.id}</code>
<span style="color:var(--text-muted);">Plan Actuel:</span> <b style="color:var(--primary);">${u.plan?.toUpperCase() || 'FREE'}</b>
<span style="color:var(--text-muted);">Inscrit le:</span> <b>${new Date(u.created_at).toLocaleDateString()}</b>
</div>
</div>
`;
const btnAdmin = $('#btnAdminToggle');
const btnBan = $('#btnBanToggle');
if (btnAdmin) {
btnAdmin.textContent = isAdmin ? '🛡️ Retirer Admin' : '🛡️ Rendre Admin';
btnAdmin.className = isAdmin ? 'btn btn-primary btn-full' : 'btn btn-outline btn-full';
btnAdmin.onclick = () => toggleAdminStatusSupabase(u.id, isAdmin);
}
if (btnBan) {
btnBan.textContent = isBanned ? '✅ Débannir' : '🚫 Bannir l\'utilisateur';
btnBan.style.color = isBanned ? 'var(--success)' : 'var(--danger)';
btnBan.style.borderColor = isBanned ? 'var(--success)' : 'var(--danger)';
btnBan.onclick = () => toggleBanStatusSupabase(u.id, isBanned);
}
$('#btnDeleteUserModal').onclick = () => deleteUserSupabase(u.id, u.full_name || u.email);
} catch (err) {
container.innerHTML = `<div style="color:var(--danger); padding:1rem;">Erreur de chargement du profil.</div>`;
}
}
async function toggleAdminStatusSupabase(userId, currentStatus) {
const newPlan = currentStatus ? 'pro' : 'admin';
try {
const { error } = await gourmetSupabase.from('profiles').update({ plan: newPlan }).eq('id', userId);
if (error) throw error;
showToast('Statut Admin mis à jour', 'success');
openAdminModeration(userId);
renderAdminUsers();
} catch (err) {
showToast('Erreur lors de la mise à jour', 'error');
}
}
async function toggleBanStatusSupabase(userId, currentStatus) {
try {
const { error } = await gourmetSupabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', userId);
if (error) throw error;
showToast(currentStatus ? 'Utilisateur débanni' : 'Utilisateur banni', 'info');
openAdminModeration(userId);
renderAdminUsers();
} catch (err) {
showToast('Erreur lors du bannissement', 'error');
}
}
async function deleteUserSupabase(userId, name) {
if (confirm(`⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement le profil de ${name} ?\n\nNote : Cela supprimera son profil dans la base mais pas son accès Auth (à faire manuellement dans le dashboard Supabase).`)) {
try {
const { error } = await gourmetSupabase.from('profiles').delete().eq('id', userId);
if (error) throw error;
showToast('Profil supprimé avec succès', 'success');
closeAdminModeration();
renderAdminUsers();
} catch (err) {
showToast('Erreur lors de la suppression', 'error');
}
}
}
function closeAdminModeration() {
window.closeModal('adminUserModal');
}
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
let lowStockList = [];
deductions.forEach(d => {
d.item.stock = Math.round((Math.max(0, d.item.stock - d.needed)) * 100) / 100;
if (d.item.stock <= d.item.alertThreshold) {
lowStockList.push(d.item.name);
}
});
saveInventory();
renderInventory();
updateDashboard();
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
function simulateInvoiceScan() {
const ocrModal = document.getElementById('ocrScannerModal');
if (ocrModal) {
const preview = document.getElementById('ocrPreview');
const status = document.getElementById('ocrStatus');
const results = document.getElementById('ocrResults');
if (preview) preview.innerHTML = '';
if (status) { status.style.display = 'none'; status.textContent = ''; }
if (results) results.innerHTML = '';
ocrModal.style.display = 'flex';
if (preview && !preview.querySelector('input[type=file]')) {
const label = document.createElement('label');
label.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:1rem; padding:2rem; border:2px dashed var(--surface-border); border-radius:12px; cursor:pointer; transition:all 0.3s;';
label.innerHTML = `
<span style="font-size:3rem;">📸</span>
<span style="font-weight:700; font-size:1rem;">Cliquez pour choisir une photo de facture</span>
<span style="font-size:0.8rem; color:var(--text-muted);">Formats acceptés : JPG, PNG, WEBP, PDF</span>
<input type="file" accept="image/*,application/pdf" style="display:none;">
`;
preview.appendChild(label);
label.querySelector('input').onchange = (e) => {
const file = e.target.files[0];
if (!file) return;
if (file.type.startsWith('image/')) {
const reader = new FileReader();
reader.onload = (ev) => {
preview.innerHTML = `<img src="${ev.target.result}" style="max-width:100%; max-height:300px; border-radius:8px; object-fit:contain;">` ;
};
reader.readAsDataURL(file);
} else {
preview.innerHTML = `<div style="padding:1rem; background:var(--bg-alt); border-radius:8px;">📄 ${file.name}</div>`;
}
if (status) {
status.style.display = 'block';
status.innerHTML = '⏳ Analyse de la facture en cours… (simulation OCR)';
}
setTimeout(() => {
if (status) status.innerHTML = '✅ Analyse terminée ! Voici les ingrédients détectés :';
const pool = APP.inventory.length > 0 ? APP.inventory : (APP.ingredientDb || []).map(d => ({ name: d.name, unit: d.unit, price: d.pricePerUnit }));
const detected = pool.slice(0, Math.min(5, pool.length)).map(item => ({
name: item.name,
unit: item.unit,
detectedPrice: Math.round(((item.price || 1) * (1 + (Math.random() * 0.3 - 0.05))) * 100) / 100
}));
if (results) {
results.innerHTML = detected.map((d, i) => `
<div style="display:flex; justify-content:space-between; align-items:center; padding:0.7rem 1rem; background:var(--bg-alt); border-radius:8px; margin-bottom:6px;">
<span>${getIngredientEmoji(d.name)} <strong>${d.name}</strong></span>
<span style="color:var(--accent); font-weight:700;">${d.detectedPrice.toFixed(2)} € / ${d.unit === 'g' ? 'kg' : d.unit === 'ml' ? 'L' : d.unit}</span>
<button class="btn btn-sm btn-primary" onclick="applyOCRPrice(${i}, '${d.name}', ${d.detectedPrice})" style="padding:4px 10px;">✅ Appliquer</button>
</div>
`).join('');
window._ocrDetected = detected;
}
}, 2500);
};
}
return;
}
const input = document.createElement('input');
input.type = 'file';
input.accept = 'image/*';
input.onchange = (e) => {
const file = e.target.files[0];
if (!file) return;
if (typeof showToast === 'function') showToast('⏳ Scan de la facture en cours…', 'info');
setTimeout(() => {
if (typeof showToast === 'function') showToast('✅ Scan terminé ! Ouvrez la fenêtre OCR pour voir les résultats.', 'success');
}, 2500);
};
input.click();
}
function applyOCRPrice(index, name, price) {
const item = APP.inventory.find(i => i.name === name);
if (item) {
recordPriceChange(item, price);
item.price = price;
const dbIng = (APP.ingredientDb || []).find(i => i.name === name);
if (dbIng) dbIng.pricePerUnit = price;
saveIngredientDb();
saveInventory();
renderInventory();
}
const btn = document.querySelectorAll('#ocrResults button')[index];
if (btn) { btn.textContent = '✓ Appliqué'; btn.disabled = true; btn.style.background = 'var(--success)'; }
if (typeof showToast === 'function') showToast(`✅ Prix de ${name} mis à jour : ${price} €`, 'success');
}
window.applyOCRPrice = applyOCRPrice;

// --- MODULE: app-haccp.js ---
window.printDLCLabel = function(recipeId, isExample = false) {
let recipe;
if (isExample) {
recipe = (typeof RECIPES !== 'undefined' ? RECIPES : []).find(r => r.id === recipeId);
} else {
recipe = APP.savedRecipes.find(r => r.id === recipeId);
}
if (!recipe) return;
const today = new Date();
const dlc = new Date();
dlc.setDate(today.getDate() + 3);
const content = `
<div style="width: 300px; padding: 15px; border: 2px solid #000; font-family: sans-serif; text-align: center; background: #fff; color: #000;">
<div style="font-weight: 800; font-size: 1.2rem; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
🧁 GourmetRevient
</div>
<div style="font-size: 1rem; font-weight: 700; margin-bottom: 5px;">${recipe.name}</div>
<div style="font-size: 0.8rem; margin-bottom: 10px;">Catégorie: ${recipe.category || 'Pâtisserie'}</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
<div style="text-align: left;">
<div style="font-size: 0.6rem; text-transform: uppercase;">Fabriqué le</div>
<div style="font-weight: 700;">${today.toLocaleDateString('fr-FR')}</div>
</div>
<div style="text-align: right;">
<div style="font-size: 0.6rem; text-transform: uppercase; color: #ef4444;">À consommer jusqu'au</div>
<div style="font-weight: 700; color: #ef4444;">${dlc.toLocaleDateString('fr-FR')}</div>
</div>
</div>
<div style="font-size: 0.6rem; text-align: left; margin-bottom: 10px; padding: 5px; background: #f1f5f9;">
<strong>ALLERGÈNES:</strong> Gluten, Œufs, Lait, Fruits à coque.
</div>
<div style="font-size: 0.7rem; border-top: 1px dashed #000; padding-top: 5px;">
Conserver entre 0°C et +4°C
</div>
</div>
`;
const opt = {
margin: 5,
filename: `label_${recipeId}.pdf`,
image: { type: 'jpeg', quality: 0.98 },
html2canvas: { scale: 3 },
jsPDF: { unit: 'mm', format: [100, 60], orientation: 'landscape' }
};
if (typeof html2pdf !== 'undefined') {
html2pdf().from(content).set(opt).save();
showToast('🏷️ Étiquette DLC générée', 'success');
} else {
showToast('Erreur: html2pdf non disponible', 'error');
}
};
function saveHaccpLogs() {
localStorage.setItem(STORAGE_KEYS.haccpLogs, JSON.stringify(APP.haccpLogs));
}
function loadHaccpLogs() {
try {
const saved = localStorage.getItem(STORAGE_KEYS.haccpLogs);
if (saved) {
try {
APP.haccpLogs = JSON.parse(saved);
} catch(e) {}
}
if (typeof APP.haccpLogs !== 'object' || APP.haccpLogs === null) {
APP.haccpLogs = {};
}
if (!Array.isArray(APP.haccpLogs.temp)) APP.haccpLogs.temp = [];
if (!Array.isArray(APP.haccpLogs.trace)) APP.haccpLogs.trace = [];
if (!Array.isArray(APP.haccpLogs.reception)) APP.haccpLogs.reception = [];
if (!Array.isArray(APP.haccpLogs.clean)) APP.haccpLogs.clean = [];
} catch (err) {
console.error('CRITICAL HACCP LOAD FIX:', err);
}
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
if (APP.haccpLogs.clean) {
const keyMap = { c1: 'haccp.clean.c1', c2: 'haccp.clean.c2', c3: 'haccp.clean.c3', c4: 'haccp.clean.c4', c5: 'haccp.clean.c5', c6: 'haccp.clean.c6', c7: 'haccp.clean.c7' };
APP.haccpLogs.clean.forEach(c => {
if (!c.areaKey && keyMap[c.id]) c.areaKey = keyMap[c.id];
});
}
const todayStr = new Date().toISOString().split('T')[0];
if (APP.haccpLogs.cleanLastDate !== todayStr) {
if (APP.haccpLogs.clean) {
APP.haccpLogs.clean.forEach(c => c.done = false);
}
APP.haccpLogs.cleanLastDate = todayStr;
saveHaccpLogs();
}
if (navigator.onLine && window.GourmetSync) {
Promise.all([
GourmetSync.chargerTemps(),
GourmetSync.chargerNettoyage()
]).then(([cloudTemps, cloudClean]) => {
let changed = false;
if (cloudTemps !== null && cloudTemps.length > 0) {
APP.haccpLogs.temp = cloudTemps;
changed = true;
}
if (cloudClean !== null && cloudClean.length > 0) {
APP.haccpLogs.clean = cloudClean;
changed = true;
}
if (changed) {
saveHaccpLogs();
renderHygiene();
}
}).catch(err => console.warn('[GourmetSync] Erreur chargement HACCP:', err));
}
}
const EQUIP_KEY_MAP = {
'Frigo 1 (Vitrine)': 'haccp.equip.frigo1',
'Frigo 2 (Réserve)': 'haccp.equip.frigo2',
'Congélateur 1': 'haccp.equip.congelateur',
'Cellule': 'haccp.equip.cellule'
};
function switchHaccpTab(tab) {
const views = ['Temp', 'Clean', 'Trace', 'Reception', 'Allergens'];
views.forEach(v => {
const el = document.getElementById('haccpView' + v);
const btn = document.getElementById('tabHaccp' + v);
if (el) el.style.display = v.toLowerCase() === tab ? 'block' : 'none';
if (btn) btn.classList.toggle('active', v.toLowerCase() === tab);
});
if (tab === 'allergens') renderAllergenMatrix();
else renderHygiene();
}
function renderHygiene() {
renderHygieneDashboard();
renderTempLogs();
renderCleaningChecklist();
renderTraceability();
renderReceptionLogs();
}
function renderHygieneDashboard() {
const lastTempEl = document.getElementById('kpiHaccpLastTemp');
const lastTempDateEl = document.getElementById('kpiHaccpLastTempDate');
const cleanPctEl = document.getElementById('kpiHaccpCleanPct');
const activeLotsEl = document.getElementById('kpiHaccpActiveLots');
const shortExpEl = document.getElementById('kpiHaccpShortExp');
if (!lastTempEl) return;
const temps = APP.haccpLogs.temp || [];
if (temps.length > 0) {
const last = temps[0];
lastTempEl.textContent = last.val.toFixed(1) + ' °C';
lastTempDateEl.textContent = new Date(last.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
lastTempEl.style.color = (last.val > 5 || last.val < -22) ? 'var(--danger)' : 'var(--success)';
}
const cleaning = APP.haccpLogs.cleaning || [];
const today = new Date().toISOString().split('T')[0];
const todaysTasks = cleaning.filter(t => t.date === today);
const completed = todaysTasks.filter(t => t.status === 'ok').length;
const pct = todaysTasks.length > 0 ? Math.round((completed / todaysTasks.length) * 100) : 0;
if (cleanPctEl) cleanPctEl.textContent = pct + '%';
const trace = APP.haccpLogs.trace || [];
if (activeLotsEl) activeLotsEl.textContent = trace.length;
const now = new Date();
const shortExp = trace.filter(t => {
const expDate = new Date(t.exp);
const diffHours = (expDate - now) / (1000 * 60 * 60);
return diffHours > 0 && diffHours < 48;
}).length;
if (shortExpEl) shortExpEl.textContent = shortExp;
}
function renderTempLogs() {
const container = document.getElementById('tempLogsBody');
if (!container) return;
if (!APP.haccpLogs.temp) APP.haccpLogs.temp = [];
if (!APP.haccpLogs.temp || APP.haccpLogs.temp.length === 0) {
container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">' + t('haccp.temp.empty') + '</td></tr>';
return;
}
container.innerHTML = APP.haccpLogs.temp.map(function (log) {
var isWarn = log.val > 5 || log.val < -22;
var equipLabel = log.equipKey ? t(log.equipKey) : (EQUIP_KEY_MAP[log.equip] ? t(EQUIP_KEY_MAP[log.equip]) : (log.equip || ''));
var actionBadge = '';
var shiftIcon = log.shift === 'soir' ? '🌙' : '🌅';
var shiftText = log.shift === 'soir' ? 'Soir' : 'Matin';
if (log.action) {
var actionText = (log.action.indexOf('haccp.') === 0) ? t(log.action) : log.action;
actionBadge = '<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; margin-top:4px;">💬 ' + actionText + '</div>';
}
return '<tr>' +
'<td>' + new Date(log.date).toLocaleString(undefined, {dateStyle: "short", timeStyle: "short"}) + '<br><small style="color:var(--text-muted); font-weight:700;">' + shiftIcon + ' ' + shiftText + '</small></td>' +
'<td style="font-weight:700;">' + equipLabel + '</td>' +
'<td style="font-size:1.1rem; font-weight:800; color:' + (isWarn ? 'var(--danger)' : 'var(--success)') + '">' + log.val + '°C</td>' +
'<td>' + (log.user || t('haccp.chef')) + '</td>' +
'<td><span class="badge ' + (isWarn ? 'status-critical' : 'status-ok') + '">' + (isWarn ? '⚠️ ' + t('haccp.status.warn') : '✅ ' + t('haccp.status.ok')) + '</span>' + actionBadge + '</td>' +
'<td><button class="btn btn-sm btn-outline btn-round" onclick="deleteTempLog(\'' + log.id + '\')">🗑️</button></td>' +
'</tr>';
}).join('');
}
function showAddTempModal() {
window.openModal('modalHaccpTemp');
var sel = document.getElementById('haccpTempEquip');
if (sel) {
sel.innerHTML = '<option value="haccp.equip.frigo1">' + t('haccp.equip.frigo1') + '</option>' +
'<option value="haccp.equip.frigo2">' + t('haccp.equip.frigo2') + '</option>' +
'<option value="haccp.equip.congelateur">' + t('haccp.equip.congelateur') + '</option>' +
'<option value="haccp.equip.cellule">' + t('haccp.equip.cellule') + '</option>';
}
}
function hideAddTempModal() {
window.closeModal('modalHaccpTemp');
}
function addTempLog() {
var equipSelector = document.getElementById('haccpTempEquip');
var valInput = document.getElementById('haccpTempVal');
var actionField = document.getElementById('haccpTempAction');
var shiftNode = document.querySelector('input[name="haccpTempShift"]:checked');
if (!equipSelector || !valInput) return;
var equipKey = equipSelector.value;
var val = parseFloat(valInput.value);
var action = actionField ? actionField.value.trim() : '';
var shift = shiftNode ? shiftNode.value : 'matin';
if (isNaN(val)) {
if (typeof showToast === 'function') showToast(t('haccp.temp.empty'), 'error');
return;
}
var log = {
id: window.GourmetSync ? GourmetSync.uuid() : ('t_log_' + Date.now()),
date: new Date().toISOString(),
equipKey: equipKey,
val: val,
shift: shift,
action: action || null,
user: APP.viewOwner || localStorage.getItem(STORAGE_KEYS.currentUser) || t('haccp.chef')
};
if (!APP.haccpLogs.temp) APP.haccpLogs.temp = [];
APP.haccpLogs.temp.unshift(log);
if (APP.haccpLogs.temp.length > 50) APP.haccpLogs.temp.pop();
saveHaccpLogs();
if (window.GourmetSync) GourmetSync.sauvegarderTemp(log).catch(() => {});
hideAddTempModal();
valInput.value = '';
if (actionField) actionField.value = '';
renderTempLogs();
if (typeof showToast === 'function') showToast(t('haccp.status.ok'), 'success');
}
function deleteTempLog(id) {
APP.haccpLogs.temp = APP.haccpLogs.temp.filter(function (l) { return l.id !== id; });
saveHaccpLogs();
if (window.GourmetSync) GourmetSync.supprimerTemp(id).catch(() => {});
renderTempLogs();
}
function showAddReceptionModal() {
window.openModal('modalHaccpReception');
}
function hideAddReceptionModal() {
window.closeModal('modalHaccpReception');
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
if (!APP.haccpLogs.reception) APP.haccpLogs.reception = [];
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
const container = document.getElementById('cleaningChecklistArea');
if (!container) return;
if (!APP.haccpLogs.clean || APP.haccpLogs.clean.length === 0) {
APP.haccpLogs.clean = [
{ id: 'cl_1', areaKey: 'haccp.clean.area1', area: 'Postes de Travail', icon: '🔪', done: false },
{ id: 'cl_2', areaKey: 'haccp.clean.area2', area: 'Sols & Caniveaux', icon: '🧼', done: false },
{ id: 'cl_3', areaKey: 'haccp.clean.area3', area: 'Enceintes Froides', icon: '❄️', done: false },
{ id: 'cl_4', areaKey: 'haccp.clean.area4', area: 'Plongerie', icon: '🚿', done: false },
{ id: 'cl_5', areaKey: 'haccp.clean.area5', area: 'Sanitaires', icon: '🚽', done: false },
{ id: 'cl_6', areaKey: 'haccp.clean.area6', area: 'Réserve Sèche', icon: '📦', done: false }
];
try { saveHaccpLogs(); } catch(e){}
}
container.innerHTML = APP.haccpLogs.clean.map(function (task) {
var areaName = task.areaKey ? (typeof t === 'function' ? t(task.areaKey) : task.area) : (task.area || '');
return `
<div class="mgmt-glass-card ${task.done ? 'cleaned' : ''}"
onclick="toggleCleaning('${task.id}')"
style="display:flex; align-items:center; gap:1.2rem; cursor:pointer; padding:1.5rem; transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position:relative; overflow:hidden;">
<div style="font-size:2rem; background:${task.done ? 'rgba(16, 185, 129, 0.1)' : 'rgba(197, 165, 90, 0.08)'};
width:60px; height:60px; display:flex; align-items:center; justify-content:center; border-radius:18px;
border: 1px solid ${task.done ? 'rgba(16, 185, 129, 0.2)' : 'rgba(197, 165, 90, 0.15)'};">
${task.icon}
</div>
<div style="flex:1;">
<h4 style="margin:0; font-size:1.1rem; color:var(--primary); font-family:var(--font-display);">${areaName}</h4>
<div style="display:flex; align-items:center; gap:0.5rem; margin-top:2px;">
<span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px; color:${task.done ? '#10b981' : 'var(--text-muted)'};">
${task.done ? 'CONFORME' : 'À TRAITER'}
</span>
</div>
</div>
<div style="font-size:1.5rem; filter: ${task.done ? 'none' : 'grayscale(1) opacity(0.3)'};">
${task.done ? '✅' : '⭕'}
</div>
${task.done ? '<div style="position:absolute; top:0; left:0; width:4px; height:100%; background:#10b981;"></div>' : ''}
</div>`;
}).join('');
}
function toggleCleaning(id) {
var task = APP.haccpLogs.clean.find(function (c) { return c.id === id; });
if (task) {
task.done = !task.done;
saveHaccpLogs();
if (window.GourmetSync) GourmetSync.sauvegarderNettoyage(task).catch(() => {});
renderCleaningChecklist();
}
}
function renderTraceability() {
const container = document.getElementById('traceLogsBody');
if (!container) return;
if (!APP.haccpLogs.trace) APP.haccpLogs.trace = [];
filterTraceLogs();
}
window.openProductionLogger = function(recipeIdOrName = null, portions = null, defaultName = '') {
const modal = document.getElementById('lotRegistreModal');
if (!modal) return;
let productName = defaultName || '';
let qty = portions || 10;
let recipeId = '';
if (recipeIdOrName) {
const allRecipes = [
...(APP.savedRecipes || []),
...(typeof RECIPES !== 'undefined' ? RECIPES : [])
];
const found = allRecipes.find(r => r.id === recipeIdOrName || r.name === recipeIdOrName);
if (found) {
productName = found.name;
recipeId = found.id;
if (!portions) qty = found.portions || 10;
} else {
productName = recipeIdOrName;
}
}
document.getElementById('lotRecipeId').value = recipeId;
document.getElementById('lotProductName').value = productName;
document.getElementById('lotQuantity').value = qty;
const today = new Date().toISOString().split('T')[0];
document.getElementById('lotDateFabrication').value = today;
const dlcDate = new Date();
dlcDate.setDate(dlcDate.getDate() + 3);
document.getElementById('lotDLC').value = dlcDate.toISOString().split('T')[0];
const user = localStorage.getItem('gourmet_current_user') || 'Chef';
document.getElementById('lotOperator').value = user;
const generateLot = () => {
const d = new Date(document.getElementById('lotDateFabrication').value || new Date());
const yy = d.getFullYear().toString().slice(-2);
const mm = String(d.getMonth()+1).padStart(2,'0');
const dd = String(d.getDate()).padStart(2,'0');
const pName = document.getElementById('lotProductName').value || 'PROD';
const initials = pName.trim().toUpperCase().replace(/[^A-Z]/g,'').slice(0,3) || 'PRD';
const randomNum = Math.floor(Math.random() * 900) + 100;
document.getElementById('lotNumberField').value = `L-${yy}${mm}${dd}-${initials}-${randomNum}`;
};
generateLot();
document.getElementById('lotProductName').oninput = generateLot;
document.getElementById('lotDateFabrication').onchange = generateLot;
window.openModal('lotRegistreModal');
};
window.saveProductionLot = function(printLabel = false) {
const product = document.getElementById('lotProductName').value.trim();
const lot = document.getElementById('lotNumberField').value.trim();
const date = document.getElementById('lotDateFabrication').value;
const exp = document.getElementById('lotDLC').value;
const qty = document.getElementById('lotQuantity').value;
const operator = document.getElementById('lotOperator').value.trim();
if (!product || !lot || !date || !exp || !qty) {
showToast('Veuillez remplir tous les champs', 'error');
return;
}
const traceEntry = {
id: 'tr_' + Date.now(),
lot: lot,
product: product,
date: new Date(date).toISOString(),
exp: exp,
qty: qty + ' portions',
operator: operator
};
if (!APP.haccpLogs.trace) APP.haccpLogs.trace = [];
APP.haccpLogs.trace.unshift(traceEntry);
saveHaccpLogs();
if (typeof renderTraceability === 'function') renderTraceability();
else filterTraceLogs();
if (window.GourmetHACCPAlerts && typeof window.GourmetHACCPAlerts.renderAlertBanner === 'function') {
window.GourmetHACCPAlerts.renderAlertBanner();
}
window.closeModal('lotRegistreModal');
showToast('Lot de production enregistré ✓', 'success');
if (window.pendingProductionStatusChange) {
const { idx, status } = window.pendingProductionStatusChange;
window.pendingProductionStatusChange = null;
const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
const item = plan[idx];
if (item) {
item.status = status;
localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
if (window.GourmetSync) GourmetSync.sauvegarderPlanning(item).catch(() => {});
if (typeof renderProductionPlan === 'function') renderProductionPlan();
if (window.syncInventoryWithProduction) window.syncInventoryWithProduction({ ...item, status: 'done' });
}
}
if (printLabel) {
window.printDLCLabelCustom(product, lot, date, exp, operator);
}
};
window.printDLCLabelCustom = function(product, lot, date, exp, operator) {
const dateFabStr = new Date(date).toLocaleDateString('fr-FR');
const dateDlcStr = new Date(exp).toLocaleDateString('fr-FR');
const content = `
<div style="width: 300px; padding: 15px; border: 2px solid #000; font-family: sans-serif; text-align: center; background: #fff; color: #000;">
<div style="font-weight: 800; font-size: 1.2rem; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
🧁 GourmetRevient
</div>
<div style="font-size: 1rem; font-weight: 700; margin-bottom: 5px;">${product}</div>
<div style="font-size: 0.8rem; margin-bottom: 10px; font-family:monospace; font-weight:bold;">LOT: ${lot}</div>
<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
<div style="text-align: left;">
<div style="font-size: 0.6rem; text-transform: uppercase;">Fabriqué le</div>
<div style="font-weight: 700;">${dateFabStr}</div>
</div>
<div style="text-align: right;">
<div style="font-size: 0.6rem; text-transform: uppercase; color: #ef4444;">À consommer jusqu'au</div>
<div style="font-weight: 700; color: #ef4444;">${dateDlcStr}</div>
</div>
</div>
<div style="font-size: 0.6rem; text-align: left; margin-bottom: 10px; padding: 5px; background: #f1f5f9;">
<strong>ALLERGÈNES:</strong> Gluten, Œufs, Lait, Fruits à coque.
</div>
<div style="font-size: 0.7rem; border-top: 1px dashed #000; padding-top: 5px; display:flex; justify-content:space-between;">
<span>Conserver entre 0°C et +4°C</span>
<span>Opérateur: ${operator || 'Chef'}</span>
</div>
</div>
`;
const opt = {
margin: 5,
filename: `label_${lot}.pdf`,
image: { type: 'jpeg', quality: 0.98 },
html2canvas: { scale: 3 },
jsPDF: { unit: 'mm', format: [100, 60], orientation: 'landscape' }
};
if (typeof html2pdf !== 'undefined') {
html2pdf().from(content).set(opt).save();
showToast('🏷️ Étiquette DLC générée', 'success');
} else {
showToast('Erreur: html2pdf non disponible', 'error');
}
};
window.filterTraceLogs = function() {
const productQuery = document.getElementById('traceFilterProduct').value.toLowerCase().trim();
const dateQuery = document.getElementById('traceFilterDate').value;
const container = document.getElementById('traceLogsBody');
if (!container) return;
const trace = APP.haccpLogs.trace || [];
const filtered = trace.filter(d => {
const matchesProduct = d.product.toLowerCase().includes(productQuery);
const matchesDate = !dateQuery || d.date.split('T')[0] === dateQuery;
return matchesProduct && matchesDate;
});
if (filtered.length === 0) {
container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Aucun lot correspondant</td></tr>';
return;
}
container.innerHTML = filtered.map(function (d) {
return '<tr>' +
'<td style="font-family:monospace; font-weight:800; color:var(--accent);">' + d.lot + '</td>' +
'<td style="font-weight:700;">' + d.product + '</td>' +
'<td>' + new Date(d.date).toLocaleDateString() + '</td>' +
'<td style="color:var(--danger); font-weight:700;">' + d.exp + '</td>' +
'<td>' + d.qty + '</td>' +
'<td><button class="btn btn-sm btn-outline btn-round" onclick="window.printDLCLabelCustom(\'' + d.product.replace(/'/g, "\\'") + '\', \'' + d.lot + '\', \'' + d.date + '\', \'' + d.exp + '\', \'' + (d.operator || 'Chef') + '\')">🖨️</button></td>' +
'</tr>';
}).join('');
};
window.resetTraceFilters = function() {
document.getElementById('traceFilterProduct').value = '';
document.getElementById('traceFilterDate').value = '';
filterTraceLogs();
};
window.exportTraceability = function() {
const trace = APP.haccpLogs.trace || [];
if (trace.length === 0) {
showToast('Aucune donnée à exporter', 'warning');
return;
}
let csv = 'Lot,Produit,Date Fabrication,DLC/DLUO,Quantité,Opérateur\n';
trace.forEach(t => {
const dStr = new Date(t.date).toLocaleDateString('fr-FR');
csv += `"${t.lot}","${t.product}","${dStr}","${t.exp}","${t.qty}","${t.operator || ''}"\n`;
});
const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
const url = URL.createObjectURL(blob);
const link = document.createElement('a');
link.setAttribute('href', url);
link.setAttribute('download', `registre_tracabilite_${new Date().toISOString().split('T')[0]}.csv`);
document.body.appendChild(link);
link.click();
document.body.removeChild(link);
showToast('Registre exporté en CSV ✓', 'success');
};

// --- MODULE: app-omnisearch.js ---
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
if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
e.preventDefault();
toggleOmniSearch();
}
if (e.key === 'Escape' && $('#omniModal').style.display === 'flex') {
toggleOmniSearch();
}
});
window.addEventListener('load', () => {
if ('serviceWorker' in navigator) {
navigator.serviceWorker.register('./sw.js').then(reg => {
setInterval(() => {
reg.update();
}, 1000 * 60 * 60);
reg.onupdatefound = () => {
const installingWorker = reg.installing;
if (!installingWorker) return;
installingWorker.onstatechange = () => {
if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
if (typeof showToast === 'function') {
showToast("🔄 Mise à jour disponible — rechargez pour l'appliquer.", "info", 5000);
}
}
};
};
}).catch(err => console.warn('[SW] Register error:', err));
let refreshing = false;
navigator.serviceWorker.addEventListener('controllerchange', () => {
if (refreshing) return;
const lastReload = sessionStorage.getItem('sw_last_reload');
const now = Date.now();
if (lastReload && (now - parseInt(lastReload)) < 2000) {
console.warn('[SW] Loop detected, skipping reload.');
return;
}
refreshing = true;
sessionStorage.setItem('sw_last_reload', now.toString());
setTimeout(() => {
window.location.reload();
}, 500);
});
navigator.serviceWorker.addEventListener('message', ({ data }) => {
if (!data) return;
if (data.type === 'SYNC_OP' && data.payload) {
try {
const op = data.payload;
if (op.action === 'save_recipe' && op.key && op.data) {
localStorage.setItem(op.key, JSON.stringify(op.data));
if (typeof loadSavedRecipes === 'function') loadSavedRecipes();
}
} catch(e) { console.warn('[SW SYNC] Error:', e); }
}
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
function playPremiumSuccessSound() {
try {
const AudioContext = window.AudioContext || window.webkitAudioContext;
if (!AudioContext) return;
if (!window.audioCtx) window.audioCtx = new AudioContext();
const ctx = window.audioCtx;
if (ctx.state === 'suspended') ctx.resume();
const osc = ctx.createOscillator();
const gainNode = ctx.createGain();
osc.type = 'sine';
osc.frequency.setValueAtTime(1567.98, ctx.currentTime);
osc.frequency.exponentialRampToValueAtTime(3135.96, ctx.currentTime + 0.05);
gainNode.gain.setValueAtTime(0, ctx.currentTime);
gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
osc.connect(gainNode);
gainNode.connect(ctx.destination);
osc.start();
osc.stop(ctx.currentTime + 0.8);
} catch (e) {  }
}
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
if (type === 'success') {
icon = '✅';
playPremiumSuccessSound();
}
if (type === 'error') icon = '❌';
if (type === 'warning') icon = '⚠️';
toast.innerHTML = `
<div class="toast-icon">${icon}</div>
<div class="toast-content">
<p class="toast-message">${message}</p>
</div>
`;
container.appendChild(toast);
setTimeout(() => toast.classList.add('show'), 10);
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
function renderAntiGaspi() {
const mod = $('#antiGaspiModule');
const content = $('#antiGaspiContent');
if (!mod || !content || !APP.recipe || !APP.recipe.ingredients) return;
let hasWaste = false;
let suggestions = [];
APP.recipe.ingredients.forEach(ing => {
if(!ing.name) return;
const name = ing.name.toLowerCase();
if ((name.includes('jaune') && name.includes('oeuf')) || (name.includes('jaune') && name.includes('œuf'))) {
hasWaste = true;
suggestions.push(`🥚 <strong>Blancs d'œufs orphelins :</strong> Vous utilisez beaucoup de jaunes. Pensez à réaliser des <em>Macarons</em>, des <em>Financiers</em> ou des <em>Meringues</em> pour écouler vos blancs et optimiser la rentabilité.`);
}
else if ((name.includes('blanc') && name.includes('oeuf')) || (name.includes('blanc') && name.includes('œuf'))) {
hasWaste = true;
suggestions.push(`🥚 <strong>Jaunes d'œufs orphelins :</strong> Vous utilisez beaucoup de blancs. Vous pourriez préparer une <em>Crème anglaise</em>, un <em>Crémeux</em> ou une <em>Pâte sablée</em>.`);
}
if (name.includes('citron') || name.includes('orange') || name.includes('pamplemousse')) {
hasWaste = true;
suggestions.push(`🍋 <strong>Agrumes :</strong> Si vous n'utilisez que le jus, pensez à zester vos agrumes avant. Les zestes peuvent être séchés ou confits pour de futures préparations.`);
}
if (name.includes('fraise') || name.includes('framboise') || name.includes('pomme')) {
hasWaste = true;
suggestions.push(`🍓 <strong>Parures de fruits :</strong> Les parures ou fruits abîmés peuvent être converties en <em>Coulis</em>, <em>Confiture</em> ou <em>Pâte de fruits</em>.`);
}
});
suggestions = [...new Set(suggestions)];
if (hasWaste && suggestions.length > 0) {
mod.style.display = 'block';
content.innerHTML = `<ul style="margin:0; padding-left:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
${suggestions.map(s => `<li>${s}</li>`).join('')}
</ul>`;
} else {
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
const suggestedPrice = costData.sellingPriceTTC.toFixed(2);
let totalWeightG = 0;
if (APP.recipe.ingredients) {
APP.recipe.ingredients.forEach(ing => {
let qty = parseFloat(ing.quantity) || 0;
const unit = ing.unit || 'g';
if (unit === 'kg' || unit === 'L') {
totalWeightG += qty * 1000;
} else if (unit === 'cl') {
totalWeightG += qty * 10;
} else if (unit === 'g' || unit === 'ml') {
totalWeightG += qty;
} else {
totalWeightG += qty * 50;
}
});
}
if (window.SousRecettes && APP.recipe.sousRecettes) {
APP.recipe.sousRecettes.forEach(sr => {
totalWeightG += parseFloat(sr.quantiteUtilisee) || 0;
});
}
const portions = costData.portions || APP.recipe.portions || 10;
const netWeightPortionG = portions > 0 ? totalWeightG / portions : 0;
const netWeightPortionKg = netWeightPortionG / 1000;
const pricePerKgTTC = netWeightPortionKg > 0 ? costData.sellingPriceTTC / netWeightPortionKg : 0;
$('#qrRecipeName').textContent = APP.recipe.name;
$('#qrRecipePrice').textContent = suggestedPrice + ' € TTC';
const qrWeightEl = document.getElementById('qrRecipeWeight');
const qrPriceKgEl = document.getElementById('qrRecipePricePerKg');
if (qrWeightEl) qrWeightEl.textContent = netWeightPortionG.toFixed(0) + ' g';
if (qrPriceKgEl) qrPriceKgEl.textContent = pricePerKgTTC.toFixed(2) + ' €/kg';
const al = document.getElementById('allergensList');
$('#qrAllergens').textContent = al ? al.textContent : 'Non spécifié';
const qrbox = document.getElementById('qrcode');
if(qrbox) qrbox.innerHTML = '';
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
window.openModal('qrModal');
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
container.style.position = 'fixed';
container.style.top = '0';
container.style.left = '0';
container.style.zIndex = '-9999';
container.style.width = '400px';
const clone = label.cloneNode(true);
clone.style.width = '100%';
clone.style.height = 'auto';
clone.style.padding = '40px';
clone.style.backgroundColor = '#ffffff';
clone.style.display = 'block';
clone.querySelectorAll('*').forEach(el => {
el.style.opacity = '1';
el.style.visibility = 'visible';
el.style.color = '#333333';
});
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
windowWidth: 800,
scrollY: 0,
scrollX: 0
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
}, 1000);
}
let wasteChart = null;
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
function renderAllergenMatrix() {
const table = document.getElementById('allergenMatrixTable');
if (!table) return;
const recipes = [...(APP.savedRecipes || []), ...(typeof RECIPES !== 'undefined' ? RECIPES : [])];
if (recipes.length === 0) {
table.innerHTML = `<tr><td colspan="15" style="text-align:center; padding:3rem;">
<div class="mgmt-empty-state">
<div class="empty-icon">\ud83d\udee1\ufe0f</div>
<h4>Aucune recette d\u00e9tect\u00e9e</h4>
<p>Enregistrez des recettes pour g\u00e9n\u00e9rer la matrice.</p>
</div>
</td></tr>`;
return;
}
const allAllergens = [
{ key: "Lait", emoji: "\ud83e\udd5b" },
{ key: "\u0152ufs", emoji: "\ud83e\udd5a" },
{ key: "Gluten", emoji: "\ud83c\udf3e" },
{ key: "Fruits \u00e0 coque", emoji: "\ud83e\udd5c" },
{ key: "Soja", emoji: "\ud83e\uddab" },
{ key: "Arachides", emoji: "\ud83e\udd5c" },
{ key: "S\u00e9same", emoji: "\ud83e\udd6f" },
{ key: "Moutarde", emoji: "\ud83d\udfe1" },
{ key: "Lupin", emoji: "\ud83c\udf3f" },
{ key: "Sulfites", emoji: "\ud83e\uddea" },
{ key: "Poisson", emoji: "\ud83d\udc1f" },
{ key: "Crustac\u00e9s", emoji: "\ud83e\udd90" },
{ key: "Mollusques", emoji: "\ud83d\udc1a" },
{ key: "C\u00e9leri", emoji: "\ud83e\udd6c" }
];
let html = `
<thead>
<tr>
<th style="padding: 1rem; background: rgba(0,0,0,0.05); text-align: left;">Recette</th>
${allAllergens.map(a => `<th style="padding: 1rem; background: rgba(0,0,0,0.05);"><span title="${a.key}">${a.emoji}</span><br><span style="font-size:0.55rem;">${a.key}</span></th>`).join('')}
</tr>
</thead>
<tbody>
`;
recipes.forEach(r => {
const foundAllergens = new Set();
const ings = r.ingredients || [];
ings.forEach(ing => {
const n = (ing.name || '').toLowerCase();
if (n.includes('lait') || n.includes('beurre') || n.includes('cr\u00e8me') || n.includes('cream') || n.includes('mascarpone')) foundAllergens.add('Lait');
if (n.includes('\u0153uf') || n.includes('oeuf') || n.includes('jaune') || n.includes('blanc')) foundAllergens.add('\u0152ufs');
if (n.includes('farine') || n.includes('bl\u00e9') || n.includes('gluten')) foundAllergens.add('Gluten');
if (n.includes('amande') || n.includes('noisette') || n.includes('noix') || n.includes('pistache')) foundAllergens.add('Fruits \u00e0 coque');
if (n.includes('soja')) foundAllergens.add('Soja');
if (n.includes('arachide') || n.includes('cacahu')) foundAllergens.add('Arachides');
if (n.includes('s\u00e9same')) foundAllergens.add('S\u00e9same');
if (n.includes('moutarde')) foundAllergens.add('Moutarde');
if (n.includes('sulfite') || n.includes('vin')) foundAllergens.add('Sulfites');
});
html += `
<tr>
<td style="text-align:left; font-weight:600; padding: 0.8rem; border-bottom: 1px solid rgba(0,0,0,0.05);">${r.name}</td>
${allAllergens.map(a => `
<td style="padding: 0.8rem; border-bottom: 1px solid rgba(0,0,0,0.05);">
<span class="allergen-badge ${foundAllergens.has(a.key) ? 'present' : 'absent'}">
${foundAllergens.has(a.key) ? '\u25cf' : '\u2014'}
</span>
</td>
`).join('')}
</tr>
`;
});
html += `</tbody>`;
table.innerHTML = html;
}
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
id: window.GourmetSync ? GourmetSync.uuid() : ('waste_' + Date.now()),
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
if (window.GourmetSync) GourmetSync.sauvegarderPerte(entry).catch(() => {});
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
renderWasteChart(logs);
if (typeof window.renderWasteMonthlyReport === 'function') {
window.renderWasteMonthlyReport();
}
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
const colors = ['#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];
if (wasteChart) {
wasteChart.destroy();
wasteChart = null;
}
const reportEl = document.getElementById('wasteMonthlyReport');
if (reportEl) {
if (typeof window.renderWasteMonthlyReport === 'function') {
window.renderWasteMonthlyReport();
} else if (logs.length > 0) {
const wasteByReason = {};
let maxReason = '';
let maxVal = 0;
logs.forEach(l => {
wasteByReason[l.reason] = (wasteByReason[l.reason] || 0) + (l.lossValue || 0);
if (wasteByReason[l.reason] > maxVal) { maxVal = wasteByReason[l.reason]; maxReason = l.reason; }
});
const totalLoss = Object.values(wasteByReason).reduce((a, b) => a + b, 0);
const reasonLabel = reasonLabels[maxReason] || maxReason;
reportEl.innerHTML = `
<div style="background:rgba(239, 68, 68, 0.05); padding:1rem; border-radius:12px; border:1px dashed rgba(239, 68, 68, 0.2); text-align:center; margin-bottom:1rem;">
<div style="font-size:1.8rem; font-weight:800; color:#ef4444;">${totalLoss.toFixed(2)} €</div>
<div style="font-size:0.65rem; text-transform:uppercase; color:var(--text-muted);">Perte ce mois-ci</div>
</div>
<div style="display:flex; justify-content:space-between; padding:0.6rem; background:rgba(197, 165, 90, 0.03); border-radius:8px; margin-bottom:0.5rem;">
<span style="font-size:0.75rem;">Cause n°1 :</span>
<span style="font-size:0.75rem; font-weight:700;">${reasonLabel}</span>
</div>
<p style="font-size:0.7rem; color:var(--text-muted); font-style:italic;">ℹ️ Les ${reasonLabel.toLowerCase()} sont votre premier levier d'optimisation.</p>
`;
}
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
if (navigator.onLine && window.GourmetSync) {
GourmetSync.chargerPertes().then(cloudLogs => {
if (cloudLogs !== null) {
APP.wasteLogs = cloudLogs;
localStorage.setItem(STORAGE_KEYS.wasteLogs, JSON.stringify(APP.wasteLogs));
if (typeof renderWasteAnalysis === 'function') renderWasteAnalysis();
if (typeof updateMgmtKpis === 'function') updateMgmtKpis();
}
}).catch(() => {});
}
}
function exportWasteHistory() {
const logs = APP.wasteLogs || [];
if (logs.length === 0) {
showToast("Aucune donnée à exporter", "error");
return;
}
let csv = 'Date,Recette,Quantite,Motif,Notes,ValeurLoss_EUR\n';
logs.forEach(l => {
csv += `${l.date},"${l.recipeName}",${l.qty},${l.reason},"${l.notes || ''}",${l.lossValue.toFixed(2)}\n`;
});
const blob = new Blob([csv], { type: 'text/csv' });
const url = window.URL.createObjectURL(blob);
const a = document.createElement('a');
a.setAttribute('hidden', '');
a.setAttribute('href', url);
a.setAttribute('download', `pertes_gourmet_revient_${new Date().toISOString().split('T')[0]}.csv`);
document.body.appendChild(a);
a.click();
document.body.removeChild(a);
}
function renderObjectives() {
const grid = document.getElementById('objectivesGrid');
if (!grid) return;
const recipes = APP.savedRecipes || [];
const wasteLogs = APP.wasteLogs || [];
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
calculateBreakingPoint();
bindBreakingPointEvents();
}
function bindBreakingPointEvents() {
const inputs = ['bpRent', 'bpSalaries', 'bpEnergy', 'bpOther'];
const savedData = JSON.parse(localStorage.getItem('gourmet_fixed_costs') || '{}');
inputs.forEach(id => {
const el = document.getElementById(id);
if (el) {
if (savedData[id] !== undefined) el.value = savedData[id];
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
function loadProductionPlan() {
if (navigator.onLine && window.GourmetSync) {
GourmetSync.chargerPlanning().then(cloudPlan => {
if (cloudPlan !== null) {
localStorage.setItem('gourmet_production_plan', JSON.stringify(cloudPlan));
if (typeof renderProductionPlan === 'function') renderProductionPlan();
if (typeof updateDashboard === 'function') updateDashboard();
}
}).catch(err => console.warn('[GourmetSync] Erreur lors du chargement du planning:', err));
}
}
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
const userRecipes = APP.savedRecipes || [];
const catalogRecipes = typeof RECIPES !== 'undefined' ? RECIPES : [];
const allAvailable = [...userRecipes, ...catalogRecipes];
if (allAvailable.length === 0) {
showToast(t('mgmt.production.no_recipes') || "Ajoutez d'abord des recettes.", "error");
return;
}
const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
const defaultRecipe = allAvailable[0];
const newItem = {
id: window.GourmetSync ? GourmetSync.uuid() : ('prod_' + Date.now()),
name: defaultRecipe.name,
recipeId: defaultRecipe.id,
qty: 10,
status: 'todo',
date: new Date().toISOString().split('T')[0]
};
plan.push(newItem);
localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
if (window.GourmetSync) GourmetSync.sauvegarderPlanning(newItem).catch(() => {});
renderProductionPlan();
showToast(t('mgmt.production.added') || "Production ajoutée !", "success");
}
function updateProductionStatus(idx, status) {
const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
if (plan[idx]) {
plan[idx].status = status;
localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
if (window.GourmetSync) GourmetSync.sauvegarderPlanning(plan[idx]).catch(() => {});
renderProductionPlan();
}
}
function removeProductionItem(idx) {
const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
const removed = plan[idx];
plan.splice(idx, 1);
localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
if (window.GourmetSync && removed && removed.id) {
const isValidUUID = str => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
if (isValidUUID(removed.id)) GourmetSync.supprimerPlanning(removed.id).catch(() => {});
}
renderProductionPlan();
}
function launchProductionFromRecipe() {
if (!APP.recipe.name) {
showToast(t('s5.subtitle.empty'), 'error');
return;
}
saveCurrentRecipe();
const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
plan.push({
name: APP.recipe.name,
recipeId: APP.recipe.id,
qty: APP.recipe.portions || 10,
status: 'todo',
date: new Date().toISOString().split('T')[0]
});
localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
if (typeof showMgmt === 'function') {
showMgmt();
if (typeof switchMgmtTab === 'function') switchMgmtTab('production');
}
if (typeof renderProductionPlan === 'function') renderProductionPlan();
showToast(t('mgmt.production.added') || "Production lancée !", "success");
}
(function initSplashScreen() {
const splash = document.getElementById('premiumSplash');
if (!splash) return;
const dismissTime = 2800;
setTimeout(() => {
splash.classList.add('fade-out');
setTimeout(() => {
splash.style.display = 'none';
}, 800);
}, dismissTime);
})();
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
setTimeout(() => {
container.innerHTML = '';
}, duration);
}
window.triggerChocolateRain = triggerChocolateRain;
const _originalGoToStep = goToStep;
goToStep = function(step) {
const previousStep = APP.currentStep;
_originalGoToStep(step);
if (step > previousStep && previousStep >= 1) {
triggerChocolateRain('light');
}
const stepEl = document.querySelector(`#step${step}`);
if (stepEl) {
stepEl.classList.remove('page-transition-active');
void stepEl.offsetWidth;
stepEl.classList.add('page-transition-active');
}
};
if (typeof saveCurrentRecipe === 'function') {
const _originalSave = saveCurrentRecipe;
saveCurrentRecipe = function() {
_originalSave.apply(this, arguments);
triggerChocolateRain('epic');
};
}
(function addGoldenDividers() {
document.addEventListener('DOMContentLoaded', () => {
const briefing = document.querySelector('.morning-briefing');
if (briefing && !briefing.nextElementSibling?.classList.contains('section-divider')) {
const divider = document.createElement('div');
divider.className = 'section-divider';
briefing.after(divider);
}
});
})();
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
})();
document.addEventListener("DOMContentLoaded", () => {
});
function updateSeasonalityBadge(row, idx, name) {
const badge = row.querySelector('.seasonality-badge');
if (!badge) return;
if (!name) { badge.innerHTML = ''; return; }
const currentMonth = new Date().getMonth() + 1;
const check = checkSeasonality(name, currentMonth);
if (!check) { badge.innerHTML = ''; return; }
badge.innerHTML = `<span class="season-warn" title="Hors saison ! Évitez l'impact écologique et économique.">⚠️ Éco-Alerte</span>
<button class="btn btn-sm btn-outline" style="font-size:0.65rem; padding:2px 6px; margin-left:4px; border-color:var(--danger, #ef4444); color:var(--danger, #ef4444);" onclick="applySeasonSubstitute(${idx}, '${check.sub}')">Remplacer par ${check.subIcon} ${check.sub}</button>`;
}
function applySeasonSubstitute(idx, subName) {
const ing = APP.recipe.ingredients[idx];
if (!ing) return;
ing.name = subName;
const dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === subName.toLowerCase());
if (dbItem) {
ing.pricePerUnit = dbItem.pricePerUnit;
ing.unit = dbItem.unit;
}
renderIngredients();
showToast('Ingrédient substitué pour respecter la saisonnalité !', 'success');
if (typeof triggerChocolateRain === 'function') triggerChocolateRain('light');
}
function checkSeasonality(name, currentMonth) {
const SEASONALITY_DB = {
'fraise': { season: [5,6,7,8], sub: 'Pomme', subIcon: '🍎' },
'framboise': { season: [6,7,8,9], sub: 'Poire', subIcon: '🍐' },
'cerise': { season: [5,6,7], sub: 'Pruneau', subIcon: '🍒' },
'abricot': { season: [6,7,8], sub: 'Pomme', subIcon: '🍎' },
'pêche': { season: [6,7,8,9], sub: 'Poire', subIcon: '🍐' },
'figue': { season: [7,8,9,10], sub: 'Datte', subIcon: '🌴' },
'melon': { season: [6,7,8,9], sub: 'Pomme', subIcon: '🍎' },
'mûre': { season: [7,8,9], sub: 'Myrtille (surgelée)', subIcon: '🫐' },
};
const n = name.toLowerCase();
for (let key in SEASONALITY_DB) {
if (n.includes(key)) {
if (!SEASONALITY_DB[key].season.includes(currentMonth) && !n.includes('purée') && !n.includes('confit') && !n.includes('surgelé') && !n.includes('congelé')) {
return SEASONALITY_DB[key];
}
}
}
return null;
}
document.addEventListener('DOMContentLoaded', () => {
setInterval(() => {
if (APP.currentStep > 0 && APP.recipe && APP.recipe.name.trim() !== '') {
if (APP.currentStep === 1) collectIngredients();
if (APP.currentStep === 2) collectProcedure();
const draftToSave = {
...APP.recipe,
margin: APP.margin
};
localStorage.setItem('gourmet_recipe_draft', JSON.stringify(draftToSave));
}
}, 15000);
});
function renderAllergenMatrix() {
const table = document.getElementById('allergenMatrixTable');
if (!table) return;
const recipes = [...(APP.savedRecipes || []), ...(typeof RECIPES !== 'undefined' ? RECIPES : [])];
if (recipes.length === 0) {
table.innerHTML = `<tr><td colspan="15" style="text-align:center; padding:3rem;">
<div class="mgmt-empty-state">
<div class="empty-icon">\ud83d\udee1\ufe0f</div>
<h4>Aucune recette d\u00e9tect\u00e9e</h4>
<p>Enregistrez des recettes pour g\u00e9n\u00e9rer la matrice.</p>
</div>
</td></tr>`;
return;
}
const allAllergens = [
{ key: "Lait", emoji: "\ud83e\udd5b" },
{ key: "\u0152ufs", emoji: "\ud83e\udd5a" },
{ key: "Gluten", emoji: "\ud83c\udf3e" },
{ key: "Fruits \u00e0 coque", emoji: "\ud83e\udd5c" },
{ key: "Soja", emoji: "\ud83e\uddab" },
{ key: "Arachides", emoji: "\ud83e\udd5c" },
{ key: "S\u00e9same", emoji: "\ud83e\udd6f" },
{ key: "Moutarde", emoji: "\ud83d\udfe1" },
{ key: "Lupin", emoji: "\ud83c\udf3f" },
{ key: "Sulfites", emoji: "\ud83e\uddea" },
{ key: "Poisson", emoji: "\ud83d\udc1f" },
{ key: "Crustac\u00e9s", emoji: "\ud83e\udd90" },
{ key: "Mollusques", emoji: "\ud83d\udc1a" },
{ key: "C\u00e9leri", emoji: "\ud83e\udd6c" }
];
let html = `
<thead>
<tr>
<th style="padding: 1rem; background: rgba(0,0,0,0.05); text-align: left;">Recette</th>
${allAllergens.map(a => `<th style="padding: 1rem; background: rgba(0,0,0,0.05);"><span title="${a.key}">${a.emoji}</span><br><span style="font-size:0.55rem;">${a.key}</span></th>`).join('')}
</tr>
</thead>
<tbody>
`;
recipes.forEach(r => {
const foundAllergens = new Set();
const ings = r.ingredients || [];
ings.forEach(ing => {
const n = (ing.name || '').toLowerCase();
if (n.includes('lait') || n.includes('beurre') || n.includes('cr\u00e8me') || n.includes('cream')) foundAllergens.add('Lait');
if (n.includes('\u0153uf') || n.includes('oeuf') || n.includes('jaune') || n.includes('blanc')) foundAllergens.add('\u0152ufs');
if (n.includes('farine') || n.includes('bl\u00e9') || n.includes('gluten')) foundAllergens.add('Gluten');
if (n.includes('amande') || n.includes('noisette') || n.includes('noix') || n.includes('pistache')) foundAllergens.add('Fruits \u00e0 coque');
if (n.includes('soja')) foundAllergens.add('Soja');
if (n.includes('arachide') || n.includes('cacahu')) foundAllergens.add('Arachides');
if (n.includes('s\u00e9same')) foundAllergens.add('S\u00e9same');
if (n.includes('moutarde')) foundAllergens.add('Moutarde');
if (n.includes('sulfite') || n.includes('vin')) foundAllergens.add('Sulfites');
});
html += `
<tr>
<td style="text-align:left; font-weight:600; padding: 0.8rem; border-bottom: 1px solid rgba(0,0,0,0.05);">${r.name}</td>
${allAllergens.map(a => `
<td style="padding: 0.8rem; border-bottom: 1px solid rgba(0,0,0,0.05);">
<span class="allergen-badge ${foundAllergens.has(a.key) ? 'present' : 'absent'}">
${foundAllergens.has(a.key) ? '\u25cf' : '\u2014'}
</span>
</td>
`).join('')}
</tr>
`;
});
html += `</tbody>`;
table.innerHTML = html;
}
window.openPriceComparator = function() {
const modal = document.getElementById('priceComparatorModal');
if (modal) {
window.openModal('priceComparatorModal');
const select = document.getElementById('comparatorIngredientSelect');
if (select) {
select.innerHTML = '';
const ingredients = APP.inventory.map(i => i.name).sort();
if (ingredients.length === 0) {
select.innerHTML = '<option value="">Aucun ingrédient</option>';
} else {
ingredients.forEach(name => {
const opt = document.createElement('option');
opt.value = name;
opt.textContent = name;
select.appendChild(opt);
});
}
onComparatorIngredientChange();
}
}
};
window.onComparatorIngredientChange = function() {
const select = document.getElementById('comparatorIngredientSelect');
if (!select) return;
const ingName = select.value;
const body = document.getElementById('priceComparatorTableBody');
if (!body) return;
body.innerHTML = '';
const invItem = APP.inventory.find(i => i.name.toLowerCase().trim() === ingName.toLowerCase().trim());
const basePrice = invItem ? invItem.price || 0 : 0;
const unit = invItem ? invItem.unit || 'kg' : 'kg';
const prices = (APP.ingredientPrices || []).filter(ip =>
ip && ip.ingredient_name && ip.ingredient_name.toLowerCase().trim() === ingName.toLowerCase().trim()
);
const allOffers = [];
if (invItem) {
allOffers.push({
name: 'Tarif de Référence (Inventaire)',
price: basePrice,
unit: unit,
isBase: true
});
}
prices.forEach(ip => {
const supplier = (APP.suppliers || []).find(s => String(s.id) === String(ip.fournisseur_id));
allOffers.push({
name: supplier ? supplier.name : 'Fournisseur Inconnu',
price: ip.prix_unitaire,
unit: ip.unite || unit,
isBase: false,
supplierId: ip.fournisseur_id
});
});
if (allOffers.length === 0) {
body.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:1.5rem; color:var(--text-muted);">Aucun tarif disponible pour cet ingrédient.</td></tr>`;
document.getElementById('priceComparatorAnalysis').style.display = 'none';
return;
}
allOffers.sort((a, b) => a.price - b.price);
const cheapest = allOffers[0];
body.innerHTML = allOffers.map(o => {
const isCheapest = o.price === cheapest.price;
const badge = o.isBase
? `<span style="background:var(--bg-alt); color:var(--text-muted); font-size:0.7rem; padding:4px 8px; border-radius:100px;">Référence</span>`
: (isCheapest
? `<span style="background:rgba(16,185,129,0.12); color:#10b981; font-weight:800; font-size:0.7rem; padding:4px 8px; border-radius:100px;">Meilleur Prix 🟢</span>`
: `<span style="background:var(--bg-alt); color:var(--text-muted); font-size:0.7rem; padding:4px 8px; border-radius:100px;">Option</span>`);
const actionBtn = o.isBase
? '—'
: `<button class="btn btn-sm btn-primary" style="font-size:0.75rem; padding:4px 10px;" onclick="applySupplierPriceToIngredient('${ingName.replace(/'/g, "\\'")}', '${o.supplierId}', ${o.price})">Appliquer</button>`;
return `
<tr>
<td style="font-weight:700; padding:0.8rem 0.5rem;">${escapeHtml(o.name)}</td>
<td style="font-family:monospace; font-weight:800; color:var(--primary); padding:0.8rem 0.5rem;">${o.price.toFixed(4)} € / ${o.unit}</td>
<td style="padding:0.8rem 0.5rem;">Par ${o.unit}</td>
<td style="padding:0.8rem 0.5rem;">${badge}</td>
<td style="text-align:right; padding:0.8rem 0.5rem;">${actionBtn}</td>
</tr>
`;
}).join('');
const analysisDiv = document.getElementById('priceComparatorAnalysis');
const analysisText = document.getElementById('priceComparatorAnalysisText');
if (analysisDiv && analysisText) {
if (allOffers.length > 1) {
const mostExpensive = allOffers[allOffers.length - 1];
const diff = mostExpensive.price - cheapest.price;
if (diff > 0) {
analysisDiv.style.display = 'block';
analysisText.innerHTML = `Le meilleur tarif est proposé par <strong>${cheapest.name}</strong> à <strong>${cheapest.price.toFixed(2)} €/${cheapest.unit}</strong>.<br/>` +
`Vous économisez <strong>${diff.toFixed(2)} €/${cheapest.unit}</strong> par rapport à l'offre la plus chère (<strong>${mostExpensive.name}</strong> à ${mostExpensive.price.toFixed(2)} €).<br/>` +
`Sur une consommation estimée de 20 ${cheapest.unit}/mois, cela représente une économie de <strong>${(diff * 20).toFixed(2)} € / mois</strong>.`;
} else {
analysisDiv.style.display = 'none';
}
} else {
analysisDiv.style.display = 'none';
}
}
};
window.applySupplierPriceToIngredient = function(ingName, supplierId, price) {
const invItem = APP.inventory.find(i => i.name.toLowerCase().trim() === ingName.toLowerCase().trim());
if (invItem) {
invItem.price = parseFloat(price);
saveInventory();
renderInventory();
updateDashboard();
if (typeof renderCostAnalysis === 'function') renderCostAnalysis();
showToast(`Tarif appliqué ✓ ${ingName} mis à jour à ${price} €`, 'success');
onComparatorIngredientChange();
}
};

// --- MODULE: app-main.js ---
function bindEvents() {
const btnCreateRecipe = $('#btnCreateRecipe');
if (btnCreateRecipe) {
btnCreateRecipe.addEventListener('click', () => {
newRecipe();
populateStep1();
goToStep(1);
});
}
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
$$('.step-dot').forEach(dot => {
dot.addEventListener('click', () => {
const step = parseInt(dot.dataset.step);
if (step <= APP.currentStep || step === APP.currentStep + 1) {
goToStep(step);
}
});
});
const btnAddIng = $('#btnAddIngredient');
if (btnAddIng) btnAddIng.addEventListener('click', () => addIngredient());
const btnAddSousRecette = $('#btnAddSousRecette');
if (btnAddSousRecette) {
btnAddSousRecette.addEventListener('click', () => {
if (window.SousRecettes) SousRecettes.openAddModal();
});
}
const btnVoirStructure = $('#btnVoirStructure');
if (btnVoirStructure) {
btnVoirStructure.addEventListener('click', () => {
if (window.SousRecettes) SousRecettes.openTreeModal();
});
}
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
const btnAddStep = $('#btnAddStep');
if (btnAddStep) btnAddStep.addEventListener('click', addProcedureStep);
const marginSlider = $('#marginSlider');
if (marginSlider) {
marginSlider.addEventListener('input', (e) => {
APP.margin = parseInt(e.target.value);
renderCostAnalysis();
});
}
['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization', 'advPackagingCost', 'advApprenticeTime', 'advCommisTime', 'advChefTime'].forEach(id => {
const el = $('#' + id);
if (el) el.addEventListener('input', () => renderCostAnalysis());
});
const tvaSelectorEl = $('#recipeTvaRate');
if (tvaSelectorEl) tvaSelectorEl.addEventListener('change', () => renderCostAnalysis());
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
const btnSavedRecipes = $('#btnSavedRecipes');
if (btnSavedRecipes) btnSavedRecipes.addEventListener('click', toggleSavedRecipes);
const btnLogout = $('#btnLogout');
if (btnLogout) {
btnLogout.addEventListener('click', () => {
localStorage.removeItem('gourmet_auth');
localStorage.removeItem('gourmet_current_user');
location.reload();
});
}
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
window.addEventListener('resize', () => {
if (localStorage.getItem('gourmet_auth') === 'true') {
const mainNav = $('#mainNav');
const mobNav = $('#mobileNavBar');
if (window.innerWidth <= 768) {
if (mainNav) mainNav.style.setProperty('display', 'none', 'important');
if (mobNav) mobNav.style.setProperty('display', 'flex', 'important');
} else {
if (mainNav) mainNav.style.setProperty('display', 'flex', 'important');
if (mobNav) mobNav.style.setProperty('display', 'none', 'important');
}
}
});
$$('.gender-btn-profile').forEach(btn => {
btn.addEventListener('click', () => {
$$('.gender-btn-profile').forEach(b => b.classList.remove('active', 'btn-primary'));
$$('.gender-btn-profile').forEach(b => b.classList.add('btn-outline'));
btn.classList.add('active', 'btn-primary');
btn.classList.remove('btn-outline');
});
});
const adminModal = $('#adminUserModal');
if (adminModal) {
adminModal.addEventListener('click', (e) => {
if (e.target.id === 'adminUserModal') adminModal.style.display = 'none';
});
}
}
function init() {
checkAuth();
loadIngredientDb();
loadSavedRecipes();
loadTeamMembers();
loadInventory();
loadNotifications();
loadSuppliers();
loadWasteLogs();
loadProductionPlan();
bindEvents();
renderSavedRecipes();
renderInvitations();
goToStep(0);
renderLibraryRecipes();
updateRandomTip();
const throttledDashboard = throttle(updateDashboard, 500);
window.updateDashboardThrottled = throttledDashboard;
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
function capitalizeFirstLetter(str) {
if (!str) return '';
return str.charAt(0).toUpperCase() + str.slice(1);
}
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
$('#labelingFields').style.opacity = '1';
$('#labelingFields').style.pointerEvents = 'auto';
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
const today = new Date().toISOString().split('T')[0];
$('#labelFabDate').value = today;
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
const ings = selectedLabelRecipe.ingredients.map(ing => {
const translatedName = t(ing.name);
return translatedName;
}).join(', ');
$('#prevIngredients').textContent = ings + '.';
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
const allergenList = Array.from(allergenSet);
const prevAllergens = $('#prevAllergens');
if (allergenList.length > 0) {
prevAllergens.textContent = allergenList.join(', ');
} else {
prevAllergens.textContent = t('labeling.preview.no_allergens') || 'Aucun';
}
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
document.body.classList.add('printing-label');
window.print();
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
html2canvas: {
scale: 2,
logging: false,
windowWidth: 800,
scrollY: 0,
scrollX: 0
},
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
