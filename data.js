/*
  =====================================================================
  COÛT DE REVIENT PÂTISSERIE — BASE DE DONNÉES
  Toutes les recettes, ingrédients, prix et niveaux de qualité
  =====================================================================
*/

// =====================================================================
// NIVEAUX DE QUALITÉ
// =====================================================================

const QUALITY_LEVELS = [
  {
    id: 'industriel',
    name: 'Industriel',
    coefficient: 0.45,
    laborCoeff: 0.40,
    color: '#6b7280',
    description: 'Ingrédients gros volume, standardisés, haute automatisation'
  },
  {
    id: 'standard',
    name: 'Standard',
    coefficient: 0.75,
    laborCoeff: 0.75,
    color: '#3b82f6',
    description: 'Qualité grande surface, process optimisés'
  },
  {
    id: 'artisanal',
    name: 'Artisanal',
    coefficient: 1.00,
    laborCoeff: 1.00,
    color: '#10b981',
    description: 'Fournisseurs professionnels, matières sélectionnées, savoir-faire traditionnel'
  },
  {
    id: 'premium',
    name: 'Premium',
    coefficient: 1.85,
    laborCoeff: 1.50,
    color: '#f59e0b',
    description: 'Matières premières nobles, origines sélectionnées, finitions manuelles haute précision'
  }
];

// =====================================================================
// RECETTES — 10 Grandes Pâtisseries Françaises
// Prix de référence au niveau Artisanal (coefficient 1.00)
// Base: 10 portions par recette
// =====================================================================

const RECIPES = [
  {
    id: 'mille-feuille',
    name: 'Mille-feuille',
    category: 'Feuilletage',
    portions: 10,
    prepTime: 90,
    cookTime: 30,
    image: './img/mille-feuille.jpg',
    description: 'Trois couches de pâte feuilletée croustillante, crème pâtissière vanille et glaçage marbré.',
    ingredients: [
      { name: 'Farine T55', quantity: 300, unit: 'g', pricePerKg: 1.20 },
      { name: 'Beurre AOP', quantity: 250, unit: 'g', pricePerKg: 12.00 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 1.50 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 1.50 },
      { name: 'Jaunes d\'œufs', quantity: 6, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Maïzena', quantity: 50, unit: 'g', pricePerKg: 4.00 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 4.00 },
      { name: 'Sucre glace', quantity: 100, unit: 'g', pricePerKg: 3.00 },
      { name: 'Sel', quantity: 5, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser la détrempe : mélanger farine, eau, sel et beurre fondu.',
      'Effectuer le tourage (6 tours simples) avec le beurre de tourage froid.',
      'Hachurer la pâte et cuire à 180°C pendant 30 min entre deux plaques.',
      'Préparer la crème pâtissière à la vanille bourbon.',
      'Détendre la crème et monter le Mille-feuille : 3 couches de pâte, 2 de crème.',
      'Saupoudrer de sucre glace ou glacer au fondant.'
    ]
  },
  {
    id: 'paris-brest',
    name: 'Paris-Brest',
    category: 'Pâte à choux',
    portions: 10,
    prepTime: 75,
    cookTime: 35,
    image: './img/paris-brest.jpg',
    description: 'Couronne de pâte à choux garnie d\'une crème mousseline au praliné noisette.',
    ingredients: [
      { name: 'Farine T55', quantity: 200, unit: 'g', pricePerKg: 1.20 },
      { name: 'Beurre AOP', quantity: 250, unit: 'g', pricePerKg: 12.00 },
      { name: 'Œufs entiers', quantity: 8, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Noisettes torréfiées', quantity: 200, unit: 'g', pricePerKg: 16.00 },
      { name: 'Praliné noisette', quantity: 150, unit: 'g', pricePerKg: 20.00 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 1.50 },
      { name: 'Lait entier', quantity: 250, unit: 'ml', pricePerL: 1.50 },
      { name: 'Crème 35% MG', quantity: 200, unit: 'ml', pricePerL: 6.00 },
      { name: 'Amandes effilées', quantity: 50, unit: 'g', pricePerKg: 14.00 },
      { name: 'Sel', quantity: 3, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Bouillir eau, lait, beurre et sel. Verser la farine d\'un coup.',
      'Dessécher la panade, puis incorporer les œufs progressivement.',
      'Pocher une couronne, saupoudrer d\'amandes effilées.',
      'Cuire à 170°C pendant 35 min.',
      'Réaliser une crème mousseline praliné très onctueuse.',
      'Garnir la couronne coupée en deux avec une douille cannelée.'
    ]
  },
  {
    id: 'opera',
    name: 'Opéra',
    category: 'Entremets',
    portions: 10,
    prepTime: 120,
    cookTime: 15,
    image: './img/opera.jpg',
    description: 'Biscuit Joconde, ganache chocolat, crème au beurre café et glaçage miroir chocolat.',
    ingredients: [
      { name: 'Poudre d\'amandes', quantity: 200, unit: 'g', pricePerKg: 14.00 },
      { name: 'Sucre glace', quantity: 200, unit: 'g', pricePerKg: 3.00 },
      { name: 'Farine T55', quantity: 60, unit: 'g', pricePerKg: 1.20 },
      { name: 'Œufs entiers', quantity: 6, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Beurre AOP', quantity: 250, unit: 'g', pricePerKg: 12.00 },
      { name: 'Chocolat noir 64%', quantity: 200, unit: 'g', pricePerKg: 18.00 },
      { name: 'Café soluble', quantity: 10, unit: 'g', pricePerKg: 40.00 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 1.50 },
      { name: 'Crème 35% MG', quantity: 200, unit: 'ml', pricePerL: 6.00 }
    ],
    steps: [
      'Biscuit Joconde : mélanger amandes, sucre glace, œufs et farine. Ajouter beurre fondu.',
      'Cuire en plaques fines à 200°C pendant 10 min.',
      'Préparer le sirop d\'imbibage au café et la ganache chocolat.',
      'Réaliser la crème au beurre au café.',
      'Montage : alterner biscuit imbibé, crème au beurre et ganache.',
      'Finir par un glaçage miroir chocolat.'
    ]
  },
  {
    id: 'saint-honore',
    name: 'Saint-Honoré',
    category: 'Choux & Feuilletage',
    portions: 10,
    prepTime: 105,
    cookTime: 40,
    image: './img/saint-honore.jpg',
    description: 'Base feuilletée, choux caramélisés et crème Chiboust à la vanille.',
    ingredients: [
      { name: 'Farine T55', quantity: 350, unit: 'g', pricePerKg: 1.20 },
      { name: 'Beurre AOP', quantity: 300, unit: 'g', pricePerKg: 12.00 },
      { name: 'Œufs entiers', quantity: 10, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Sucre semoule', quantity: 300, unit: 'g', pricePerKg: 1.50 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 1.50 },
      { name: 'Crème 35% MG', quantity: 400, unit: 'ml', pricePerL: 6.00 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 4.00 },
      { name: 'Gélatine', quantity: 6, unit: 'g', pricePerKg: 30.00 },
      { name: 'Sel', quantity: 5, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser un disque de pâte feuilletée et une couronne de choux.',
      'Pocher des petits choux, les plonger dans un caramel blond.',
      'Fixer les choux caramélisés sur la bordure du disque.',
      'Garnir le centre avec une crème Chiboust à la vanille.',
      'Décorer à la poche à Saint-Honoré.'
    ]
  },
  {
    id: 'fraisier',
    name: 'Fraisier',
    category: 'Entremets fruits',
    portions: 10,
    prepTime: 80,
    cookTime: 20,
    image: './img/fraisier.jpg',
    description: 'Génoise imbibée, crème mousseline vanille et fraises fraîches sous pâte d\'amandes.',
    ingredients: [
      { name: 'Fraises fraîches', quantity: 500, unit: 'g', pricePerKg: 8.00 },
      { name: 'Farine T55', quantity: 120, unit: 'g', pricePerKg: 1.20 },
      { name: 'Œufs entiers', quantity: 6, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Sucre semoule', quantity: 200, unit: 'g', pricePerKg: 1.50 },
      { name: 'Beurre AOP', quantity: 200, unit: 'g', pricePerKg: 12.00 },
      { name: 'Lait entier', quantity: 300, unit: 'ml', pricePerL: 1.50 },
      { name: 'Kirsch', quantity: 30, unit: 'ml', pricePerL: 25.00 },
      { name: 'Crème 35% MG', quantity: 200, unit: 'ml', pricePerL: 6.00 },
      { name: 'Pâte d\'amandes', quantity: 150, unit: 'g', pricePerKg: 15.00 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 4.00 }
    ],
    steps: [
      'Génoise : œufs et sucre blanchis au bain-marie, ajouter la farine.',
      'Cuire sur plaque à 180°C pendant 12 min.',
      'Réaliser une crème mousseline à la vanille.',
      'Imbiber le biscuit de sirop au Kirsch.',
      'Disposer les fraises contre les parois.',
      'Garnir de crème et fraises, recouvrir de pâte d\'amandes.'
    ]
  },
  {
    id: 'tarte-tatin',
    name: 'Tarte Tatin',
    category: 'Tarte',
    portions: 10,
    prepTime: 40,
    cookTime: 45,
    image: './img/tarte-tatin.jpg',
    description: 'Tarte renversée aux pommes caramélisées sur pâte brisée dorée.',
    ingredients: [
      { name: 'Pommes (Golden)', quantity: 1500, unit: 'g', pricePerKg: 3.00 },
      { name: 'Farine T55', quantity: 250, unit: 'g', pricePerKg: 1.20 },
      { name: 'Beurre AOP', quantity: 250, unit: 'g', pricePerKg: 12.00 },
      { name: 'Sucre semoule', quantity: 200, unit: 'g', pricePerKg: 1.50 },
      { name: 'Œufs entiers', quantity: 1, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Sel', quantity: 5, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser un caramel à sec avec le sucre, verser dans le moule.',
      'Éplucher et trancher les pommes, les disposer serrées dans le moule.',
      'Ajouter des dés de beurre sur les pommes.',
      'Recouvrir d\'un disque de pâte brisée.',
      'Cuire à 180°C pendant 45 min.',
      'Démouler tiède en retournant d\'un geste vif.'
    ]
  },
  {
    id: 'eclair',
    name: 'Éclair au chocolat',
    category: 'Pâte à choux',
    portions: 10,
    prepTime: 60,
    cookTime: 30,
    image: './img/eclair.jpg',
    description: 'Pâte à choux allongée, crème pâtissière chocolat et glaçage fondant.',
    ingredients: [
      { name: 'Farine T55', quantity: 150, unit: 'g', pricePerKg: 1.20 },
      { name: 'Beurre AOP', quantity: 180, unit: 'g', pricePerKg: 12.00 },
      { name: 'Œufs entiers', quantity: 5, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Chocolat noir 64%', quantity: 200, unit: 'g', pricePerKg: 18.00 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 1.50 },
      { name: 'Sucre semoule', quantity: 120, unit: 'g', pricePerKg: 1.50 },
      { name: 'Crème 35% MG', quantity: 200, unit: 'ml', pricePerL: 6.00 },
      { name: 'Maïzena', quantity: 40, unit: 'g', pricePerKg: 4.00 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 4.00 },
      { name: 'Sel', quantity: 3, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser la pâte à choux (panade + œufs).',
      'Pocher des bâtons réguliers sur plaque.',
      'Cuire à 170°C pendant 30 min sans ouvrir le four.',
      'Préparer la crème pâtissière chocolatée.',
      'Percer 3 trous sous les éclairs et les garnir de crème.',
      'Glacer au fondant chocolaté.'
    ]
  },
  {
    id: 'baba-au-rhum',
    name: 'Baba au rhum',
    category: 'Pâte levée',
    portions: 10,
    prepTime: 50,
    cookTime: 25,
    image: './img/baba-au-rhum.jpg',
    description: 'Savarin doré imbibé de sirop au rhum, crème chantilly et fruits frais.',
    ingredients: [
      { name: 'Farine T45', quantity: 250, unit: 'g', pricePerKg: 1.30 },
      { name: 'Beurre AOP', quantity: 100, unit: 'g', pricePerKg: 12.00 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Levure fraîche', quantity: 10, unit: 'g', pricePerKg: 10.00 },
      { name: 'Sucre semoule', quantity: 250, unit: 'g', pricePerKg: 1.50 },
      { name: 'Rhum ambré', quantity: 100, unit: 'ml', pricePerL: 20.00 },
      { name: 'Crème 35% MG', quantity: 200, unit: 'ml', pricePerL: 6.00 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 4.00 },
      { name: 'Citron (zeste)', quantity: 1, unit: 'pcs', pricePerPc: 0.30 },
      { name: 'Sel', quantity: 3, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Pétrir la pâte levée (baba) avec levure, œufs et farine. Ajouter le beurre.',
      'Laisser pointer 30 min.',
      'Garnir les moules et laisser pousser une seconde fois.',
      'Cuire à 180°C pendant 25 min.',
      'Imbiber généreusement dans le sirop au rhum chaud.',
      'Garnir le centre de crème chantilly vanillée.'
    ]
  },
  {
    id: 'macaron',
    name: 'Macaron',
    category: 'Meringue',
    portions: 10,
    prepTime: 60,
    cookTime: 14,
    image: './img/macaron.jpg',
    description: 'Coques d\'amandes croustillantes et fondantes, ganache chocolat noir.',
    ingredients: [
      { name: 'Poudre d\'amandes', quantity: 200, unit: 'g', pricePerKg: 14.00 },
      { name: 'Sucre glace', quantity: 200, unit: 'g', pricePerKg: 3.00 },
      { name: 'Sucre semoule', quantity: 75, unit: 'g', pricePerKg: 1.50 },
      { name: 'Blancs d\'œufs', quantity: 6, unit: 'pcs', pricePerPc: 0.20 },
      { name: 'Chocolat noir 64%', quantity: 100, unit: 'g', pricePerKg: 18.00 },
      { name: 'Crème 35% MG', quantity: 100, unit: 'ml', pricePerL: 6.00 },
      { name: 'Colorant alimentaire', quantity: 5, unit: 'ml', pricePerL: 30.00 }
    ],
    steps: [
      'Tant-pour-tant : mixer et tamiser poudre d\'amandes et sucre glace.',
      'Réaliser une meringue italienne avec sucre semoule et blancs.',
      'Macaronnage : incorporer la meringue au mélange sec.',
      'Pocher sur tapis cuisson et laisser croûter 30 min.',
      'Cuire à 150°C pendant 14 min.',
      'Garnir de ganache chocolat noir.'
    ]
  },
  {
    id: 'foret-noire',
    name: 'Forêt-Noire',
    category: 'Entremets',
    portions: 10,
    prepTime: 90,
    cookTime: 25,
    image: './img/foret-noire.jpg',
    description: 'Génoise au chocolat, chantilly, cerises griottes au kirsch et copeaux de chocolat.',
    ingredients: [
      { name: 'Farine T55', quantity: 120, unit: 'g', pricePerKg: 1.20 },
      { name: 'Sucre semoule', quantity: 200, unit: 'g', pricePerKg: 1.50 },
      { name: 'Œufs entiers', quantity: 6, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Cacao poudre', quantity: 50, unit: 'g', pricePerKg: 15.00 },
      { name: 'Chocolat noir 64%', quantity: 200, unit: 'g', pricePerKg: 18.00 },
      { name: 'Crème 35% MG', quantity: 500, unit: 'ml', pricePerL: 6.00 },
      { name: 'Cerises griottes', quantity: 300, unit: 'g', pricePerKg: 12.00 },
      { name: 'Kirsch', quantity: 50, unit: 'ml', pricePerL: 25.00 },
      { name: 'Beurre AOP', quantity: 50, unit: 'g', pricePerKg: 12.00 }
    ],
    steps: [
      'Génoise chocolatée : monter œufs/sucre, ajouter farine et cacao.',
      'Cuire et découper en trois disques.',
      'Imbiber de sirop au Kirsch.',
      'Monter avec crème chantilly et cerises griottes.',
      'Recouvrir de chantilly et décorer de copeaux de chocolat noir.'
    ]
  }
];

// =====================================================================
// VIENNOISERIES (catégorie bonus)
// =====================================================================

const VIENNOISERIES = [
  {
    id: 'croissant',
    name: 'Croissant',
    category: 'Viennoiserie',
    portions: 10,
    prepTime: 180,
    cookTime: 18,
    image: './img/croissant.jpg',
    description: 'Croissant pur beurre, feuilletage croustillant et mie alvéolée.',
    ingredients: [
      { name: 'Farine T45', quantity: 500, unit: 'g', pricePerKg: 1.30 },
      { name: 'Beurre AOP (tourage)', quantity: 280, unit: 'g', pricePerKg: 12.00 },
      { name: 'Lait entier', quantity: 150, unit: 'ml', pricePerL: 1.50 },
      { name: 'Sucre semoule', quantity: 60, unit: 'g', pricePerKg: 1.50 },
      { name: 'Levure fraîche', quantity: 20, unit: 'g', pricePerKg: 10.00 },
      { name: 'Œufs entiers', quantity: 1, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Sel', quantity: 10, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser la détrempe, laisser pointer au frais.',
      'Enchâsser le beurre de tourage froid.',
      'Donner 3 tours simples avec repos entre chaque tour.',
      'Détailler des triangles, rouler serré.',
      'Laisser pousser 2h à 25°C.',
      'Dorer et cuire à 190°C pendant 18 min.'
    ]
  },
  {
    id: 'pain-au-chocolat',
    name: 'Pain au chocolat',
    category: 'Viennoiserie',
    portions: 10,
    prepTime: 180,
    cookTime: 18,
    image: './img/pain-au-chocolat.jpg',
    description: 'Pâte feuilletée levée pur beurre avec deux barres de chocolat noir.',
    ingredients: [
      { name: 'Farine T45', quantity: 500, unit: 'g', pricePerKg: 1.30 },
      { name: 'Beurre AOP (tourage)', quantity: 280, unit: 'g', pricePerKg: 12.00 },
      { name: 'Chocolat noir bâtons', quantity: 200, unit: 'g', pricePerKg: 18.00 },
      { name: 'Lait entier', quantity: 150, unit: 'ml', pricePerL: 1.50 },
      { name: 'Sucre semoule', quantity: 60, unit: 'g', pricePerKg: 1.50 },
      { name: 'Levure fraîche', quantity: 20, unit: 'g', pricePerKg: 10.00 },
      { name: 'Œufs entiers', quantity: 1, unit: 'pcs', pricePerPc: 0.35 },
      { name: 'Sel', quantity: 10, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser la pâte feuilletée levée (PFL).',
      'Abaisser la pâte en un long rectangle.',
      'Détailler des bandes à la largeur des bâtons de chocolat.',
      'Placer deux bâtons et rouler.',
      'Apprêt (pousse) puis dorure.',
      'Cuire à 190°C pendant 18 min.'
    ]
  }
];

// =====================================================================
// UTILITY — Calcul du coût d'un ingrédient
// =====================================================================

/**
 * Calcule le coût d'un ingrédient selon la quantité et le niveau de qualité
 * @param {Object} ingredient - L'ingrédient avec ses propriétés
 * @param {number} qualityCoeff - Coefficient du niveau de qualité
 * @returns {number} Coût en euros
 */
function computeIngredientCost(ingredient, qualityCoeff = 1.0) {
  let baseCost = 0;

  if (ingredient.pricePerUnit !== undefined) {
    // Custom recipe format: pricePerUnit is per unit of quantity
    baseCost = ingredient.quantity * ingredient.pricePerUnit;
  } else if (ingredient.pricePerKg !== undefined) {
    baseCost = (ingredient.quantity / 1000) * ingredient.pricePerKg;
  } else if (ingredient.pricePerL !== undefined) {
    baseCost = (ingredient.quantity / 1000) * ingredient.pricePerL;
  } else if (ingredient.pricePerPc !== undefined) {
    baseCost = ingredient.quantity * ingredient.pricePerPc;
  }

  return baseCost * qualityCoeff;
}

/**
 * Retourne le prix unitaire affiché pour un ingrédient
 * @param {Object} ing - L'ingrédient
 * @param {number} coeff - Coefficient qualité
 * @returns {string} Prix formaté avec unité
 */
function getIngredientDisplayPrice(ing, coeff = 1.0) {
  if (ing.pricePerUnit !== undefined) {
    return `${(ing.pricePerUnit * coeff).toFixed(2)} €/${ing.unit}`;
  } else if (ing.pricePerKg !== undefined) {
    return `${(ing.pricePerKg * coeff).toFixed(2)} €/kg`;
  } else if (ing.pricePerL !== undefined) {
    return `${(ing.pricePerL * coeff).toFixed(2)} €/L`;
  } else if (ing.pricePerPc !== undefined) {
    return `${(ing.pricePerPc * coeff).toFixed(2)} €/pcs`;
  }
  return '—';
}

/**
 * Calcule le coût matière total d'une recette
 * @param {Object} recipe - La recette
 * @param {number} qualityCoeff - Coefficient qualité
 * @param {number} matiereHike - Hausse globale (0.1 = +10%)
 * @returns {number} Coût matière total en euros
 */
function computeRecipeMaterialCost(recipe, qualityCoeff = 1.0, matiereHike = 0) {
  return recipe.ingredients.reduce((sum, ing) => {
    // Apply quality coeff AND market hike
    const totalCoeff = qualityCoeff * (1 + matiereHike);
    return sum + computeIngredientCost(ing, totalCoeff);
  }, 0);
}

/**
 * Calcule tous les coûts et indicateurs financiers
 * @param {Object} recipe - La recette
 * @param {number} qualityCoeff - Coefficient qualité
 * @param {Object} params - Paramètres de simulation
 * @param {number} matiereHike - Hausse globale
 * @returns {Object} Tous les indicateurs calculés
 */
function computeFullCost(recipe, quality = 1.0, params = {}, matiereHike = 0) {
  const qualityCoeff = typeof quality === 'object' ? quality.coefficient : quality;
  const laborCoeff = typeof quality === 'object' ? (quality.laborCoeff || 1.0) : 1.0;

  const nbPortions = params.portions || recipe.portions || 10;
  const tauxPerte = params.tauxPerte ?? 0.05;
  const tauxHoraire = params.tauxHoraire ?? 15.00;
  const chargesFixes = params.chargesFixes ?? 2000;
  const coutEnergieH = params.coutEnergie ?? 2.50;
  const nbProductionsMois = params.nbProdMois ?? 100;
  const prixVenteManuel = params.prixVente ?? null;
  const margeSouhaitee = params.margeSouhaitee ?? 0.70;

  // Coût matière (with quality and market hike)
  const coutMatiere = computeRecipeMaterialCost(recipe, qualityCoeff, matiereHike);
  const coutMatiereAvecPerte = coutMatiere / (1 - tauxPerte);

  // Coût main d'œuvre (V6.0: Scaling labor based on quality level)
  const coutMO = (recipe.prepTime / 60) * tauxHoraire * laborCoeff;

  // Coût énergie
  const coutEnergie = ((recipe.cookTime || 0) / 60) * coutEnergieH;

  // Charges fixes par production
  const partChargesFixes = chargesFixes / nbProductionsMois;

  // Coût de production complet
  const coutProduction = coutMatiereAvecPerte + coutMO + coutEnergie + partChargesFixes;

  // Coût par portion
  const coutParPortion = coutProduction / nbPortions;

  // Prix de vente
  const pvRecommande = coutParPortion / (1 - margeSouhaitee);
  const pvHT = prixVenteManuel || pvRecommande;

  // TVA (V4.1: Support taxe inclue)
  const tauxTva = params.tva || 0.055; // 5.5% standard pour pâtisserie à emporter
  const pvTTC = pvHT * (1 + tauxTva);

  // Marges
  const margeBrute = pvHT > 0 ? (pvHT - coutParPortion) / pvHT : 0; // fraction (0-1)

  // Seuil de rentabilité (V6.0: Detailed calculation)
  const coutVariableParPortion = (coutMatiereAvecPerte + coutMO + coutEnergie) / nbPortions;
  const marginPerPortion = pvHT - coutVariableParPortion;
  const tMscv = pvHT > 0 ? marginPerPortion / pvHT : 0; // Taux de Marge sur Coût Variable

  // Seuil en portions par mois
  const seuilPortions = marginPerPortion > 0 ? chargesFixes / marginPerPortion : Infinity;
  // Seuil en Chiffre d'Affaires HT par mois
  const seuilCA = tMscv > 0 ? chargesFixes / tMscv : Infinity;

  return {
    baseMatiere: round2(coutMatiere),
    coutMatiereAvecPerte: round2(coutMatiereAvecPerte),
    coutMO: round2(coutMO),
    coutEnergie: round2(coutEnergie),
    partChargesFixes: round2(partChargesFixes),
    coutProduction: round2(coutProduction),
    coutParPortion: round2(coutParPortion),
    pvRecommande: round2(pvRecommande),
    prixVenteHT: round2(pvHT),
    prixVenteTTC: round2(pvTTC),
    tva: round2(pvTTC - pvHT),
    margeBrute: round2(margeBrute),
    seuilPortions: Math.ceil(seuilPortions),
    seuilCA: round2(seuilCA),
    matiereHike: matiereHike // added for reference
  };
}

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Combine toutes les recettes en une seule liste
RECIPES.push(...VIENNOISERIES);

