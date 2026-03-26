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
    prepTime: 35,
    cookTime: 30,
    image: './img/mille-feuille.jpg',
    description: 'Trois couches de pâte feuilletée croustillante, crème pâtissière vanille et glaçage marbré.',
    ingredients: [
      { name: 'Farine T55', quantity: 400, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 300, unit: 'g', pricePerKg: 6.15 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Jaunes d\'œufs', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Maïzena', quantity: 45, unit: 'g', pricePerKg: 4.00 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Sucre glace', quantity: 50, unit: 'g', pricePerKg: 2.10 },
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
    prepTime: 30,
    cookTime: 35,
    image: './img/paris-brest.jpg',
    description: 'Couronne de pâte à choux garnie d\'une crème mousseline au praliné noisette.',
    ingredients: [
      { name: 'Farine T55', quantity: 150, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 120, unit: 'g', pricePerKg: 6.15 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Noisettes torréfiées', quantity: 100, unit: 'g', pricePerKg: 12.50 },
      { name: 'Praliné noisette', quantity: 120, unit: 'g', pricePerKg: 10.50 },
      { name: 'Sucre semoule', quantity: 80, unit: 'g', pricePerKg: 0.68 },
      { name: 'Lait entier', quantity: 250, unit: 'ml', pricePerL: 0.72 },
      { name: 'Beurre pommade', quantity: 100, unit: 'g', pricePerKg: 6.15 },
      { name: 'Amandes effilées', quantity: 30, unit: 'g', pricePerKg: 9.50 },
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
    prepTime: 45,
    cookTime: 15,
    image: './img/opera.jpg',
    description: 'Biscuit Joconde, ganache chocolat, crème au beurre café et glaçage miroir chocolat.',
    ingredients: [
      { name: 'Poudre d\'amandes', quantity: 120, unit: 'g', pricePerKg: 9.50 },
      { name: 'Sucre glace', quantity: 120, unit: 'g', pricePerKg: 2.10 },
      { name: 'Farine T55', quantity: 40, unit: 'g', pricePerKg: 0.44 },
      { name: 'Œufs entiers', quantity: 3, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Beurre AOP', quantity: 150, unit: 'g', pricePerKg: 6.15 },
      { name: 'Chocolat noir 64%', quantity: 120, unit: 'g', pricePerKg: 11.50 },
      { name: 'Café soluble', quantity: 5, unit: 'g', pricePerKg: 40.00 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Crème 35% MG', quantity: 100, unit: 'ml', pricePerL: 3.25 }
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
    prepTime: 50,
    cookTime: 40,
    image: './img/saint-honore.jpg',
    description: 'Base feuilletée, choux caramélisés et crème Chiboust à la vanille.',
    ingredients: [
      { name: 'Farine T55', quantity: 200, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 150, unit: 'g', pricePerKg: 6.15 },
      { name: 'Œufs entiers', quantity: 5, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Lait entier', quantity: 400, unit: 'ml', pricePerL: 0.72 },
      { name: 'Crème 35% MG', quantity: 250, unit: 'ml', pricePerL: 3.25 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Gélatine', quantity: 4, unit: 'g', pricePerKg: 30.00 },
      { name: 'Sel', quantity: 3, unit: 'g', pricePerKg: 0.80 }
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
    id: 'dame-blanche',
    name: 'Dame Blanche',
    category: 'Entremets',
    portions: 10,
    prepTime: 90,
    cookTime: 25,
    image: './img/dame-blanche.jpg',
    description: 'Une réinterprétation pâtissière du classique : mousse vanille intense, ganache chocolat noir et éclats de meringue.',
    ingredients: [
      { name: 'Crème 35% MG', quantity: 500, unit: 'ml', pricePerL: 3.25 },
      { name: 'Lait entier', quantity: 250, unit: 'ml', pricePerL: 0.72 },
      { name: 'Chocolat noir 64%', quantity: 200, unit: 'g', pricePerKg: 11.50 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Blancs d\'œufs', quantity: 3, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Jaunes d\'œufs', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Vanille (gousse)', quantity: 2, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Gélatine en feuilles', quantity: 10, unit: 'g', pricePerKg: 28.00 },
      { name: 'Poudre d\'amandes', quantity: 100, unit: 'g', pricePerKg: 9.50 }
    ],
    steps: [
      'Réaliser une dacquoise amande et cuire à 180°C pendant 12 min.',
      'Préparer une crème anglaise vanillée et coller à la gélatine.',
      'Réaliser une ganache chocolat noir souple.',
      'Monter la crème et l\'incorporer à la crème anglaise refroidie.',
      'Montage à l\'envers : mousse vanille, insert ganache, dacquoise.',
      'Bloquer au froid, glacer et décorer de petites meringues.'
    ]
  },
  {
    id: 'pomme-tatin-vanille',
    name: 'Entremet Pomme Tatin Caramel Vanille',
    category: 'Entremets',
    portions: 10,
    prepTime: 120,
    cookTime: 45,
    image: './img/tatin-vanille.jpg',
    description: 'Le fondant des pommes caramélisées allié à la douceur d\'un crémeux caramel et d\'une mousse vanille légère.',
    ingredients: [
      { name: 'Pomme Golden', quantity: 1000, unit: 'g', pricePerKg: 2.20 },
      { name: 'Sucre semoule', quantity: 300, unit: 'g', pricePerKg: 0.68 },
      { name: 'Beurre AOP', quantity: 150, unit: 'g', pricePerKg: 6.15 },
      { name: 'Crème 35% MG', quantity: 400, unit: 'ml', pricePerL: 3.25 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Farine T55', quantity: 150, unit: 'g', pricePerKg: 0.44 },
      { name: 'Jaunes d\'œufs', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Gélatine en feuilles', quantity: 8, unit: 'g', pricePerKg: 28.00 }
    ],
    steps: [
      'Caraméliser les pommes coupées en dés avec beurre et sucre.',
      'Réaliser un disque de sablé breton et cuire à 170°C.',
      'Préparer un crémeux caramel au beurre salé.',
      'Confectionner une mousse bavaroise à la vanille.',
      'Montage : insert pommes tatin, crémeux caramel, mousse vanille, biscuit.',
      'Congeler minimum 4h avant de démouler et napper.'
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
      { name: 'Pommes (Golden)', quantity: 1500, unit: 'g', pricePerKg: 2.10 },
      { name: 'Farine T55', quantity: 250, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 250, unit: 'g', pricePerKg: 6.15 },
      { name: 'Sucre semoule', quantity: 200, unit: 'g', pricePerKg: 0.68 },
      { name: 'Œufs entiers', quantity: 1, unit: 'pcs', pricePerPc: 0.11 },
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
    prepTime: 25,
    cookTime: 30,
    image: './img/eclair.jpg',
    description: 'Pâte à choux allongée, crème pâtissière chocolat et glaçage fondant.',
    ingredients: [
      { name: 'Farine T55', quantity: 150, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 120, unit: 'g', pricePerKg: 6.15 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Chocolat noir 64%', quantity: 150, unit: 'g', pricePerKg: 11.50 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Maïzena', quantity: 40, unit: 'g', pricePerKg: 4.00 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
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
      { name: 'Beurre AOP', quantity: 100, unit: 'g', pricePerKg: 6.15 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Levure fraîche', quantity: 10, unit: 'g', pricePerKg: 10.00 },
      { name: 'Sucre semoule', quantity: 250, unit: 'g', pricePerKg: 0.68 },
      { name: 'Rhum ambré', quantity: 100, unit: 'ml', pricePerL: 20.00 },
      { name: 'Crème 35% MG', quantity: 200, unit: 'ml', pricePerL: 3.25 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
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
      { name: 'Poudre d\'amandes', quantity: 200, unit: 'g', pricePerKg: 9.50 },
      { name: 'Sucre glace', quantity: 200, unit: 'g', pricePerKg: 2.10 },
      { name: 'Sucre semoule', quantity: 75, unit: 'g', pricePerKg: 0.68 },
      { name: 'Blancs d\'œufs', quantity: 6, unit: 'pcs', pricePerPc: 0.20 },
      { name: 'Chocolat noir 64%', quantity: 100, unit: 'g', pricePerKg: 11.50 },
      { name: 'Crème 35% MG', quantity: 100, unit: 'ml', pricePerL: 3.25 },
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
      { name: 'Farine T55', quantity: 120, unit: 'g', pricePerKg: 0.44 },
      { name: 'Sucre semoule', quantity: 200, unit: 'g', pricePerKg: 0.68 },
      { name: 'Œufs entiers', quantity: 6, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Cacao poudre', quantity: 50, unit: 'g', pricePerKg: 15.00 },
      { name: 'Chocolat noir 64%', quantity: 200, unit: 'g', pricePerKg: 11.50 },
      { name: 'Crème 35% MG', quantity: 500, unit: 'ml', pricePerL: 3.25 },
      { name: 'Cerises griottes', quantity: 300, unit: 'g', pricePerKg: 6.15 },
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
  },
  {
    id: 'tarte-citron-meringuee',
    name: 'Tarte Citron Meringuée',
    category: 'Tarte',
    portions: 10,
    prepTime: 90,
    cookTime: 25,
    image: './img/tarte-citron.jpg',
    description: 'Pâte sucrée craquante, crémeux citron jaune acidulé et meringue italienne fondante.',
    ingredients: [
      { name: 'Beurre AOP', quantity: 300, unit: 'g', pricePerKg: 6.15 },
      { name: 'Sucre glace', quantity: 90, unit: 'g', pricePerKg: 2.10 },
      { name: 'Farine T55', quantity: 250, unit: 'g', pricePerKg: 0.44 },
      { name: 'Œufs entiers', quantity: 6, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Jus de citron', quantity: 150, unit: 'ml', pricePerL: 4.50 },
      { name: 'Zeste de citron', quantity: 3, unit: 'pcs', pricePerPc: 0.60 },
      { name: 'Sucre semoule', quantity: 300, unit: 'g', pricePerKg: 0.68 },
      { name: 'Blancs d\'œufs', quantity: 3, unit: 'pcs', pricePerPc: 0.20 },
      { name: 'Sel', quantity: 2, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser la pâte sucrée (crémage beurre/sucre), foncer les cercles et cuire à blanc (160°C).',
      'Préparer le crémeux citron : chauffer le jus/zestes, blanchir œufs et sucre.',
      'Cuire le crémeux à 85°C. À 40°C, incorporer le beurre au mixeur.',
      'Garnir les fonds de tarte avec le crémeux. Réserver au frais.',
      'Réaliser la meringue italienne (sirop à 118°C versé sur les blancs montés).',
      'Pocher la meringue sur les tartes et colorer au chalumeau.'
    ]
  },
  {
    id: 'tarte-bourdaloue',
    name: 'Tarte Bourdaloue',
    category: 'Tarte',
    portions: 10,
    prepTime: 60,
    cookTime: 35,
    image: './img/tarte-bourdaloue.jpg',
    description: 'Tarte traditionnelle aux poires pochées sur une base de crème d\'amandes.',
    ingredients: [
      { name: 'Pâte sablée (Pâton)', quantity: 300, unit: 'g', pricePerKg: 4.50 },
      { name: 'Poudre d\'amandes', quantity: 100, unit: 'g', pricePerKg: 9.50 },
      { name: 'Beurre AOP', quantity: 100, unit: 'g', pricePerKg: 6.15 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Œufs entiers', quantity: 2, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Poires au sirop', quantity: 400, unit: 'g', pricePerKg: 5.50 },
      { name: 'Amandes effilées', quantity: 30, unit: 'g', pricePerKg: 9.50 },
      { name: 'Rhum ambré', quantity: 10, unit: 'ml', pricePerL: 20.00 }
    ],
    steps: [
      'Foncer un cercle à tarte avec la pâte sablée.',
      'Réaliser la crème d\'amandes : travailler le beurre pommade avec le sucre, ajouter la poudre d\'amandes puis les œufs.',
      'Parfumer la crème d\'amandes avec un trait de rhum.',
      'Garnir le fond de tarte avec la crème d\'amandes.',
      'Émincer les poires pochées et les disposer harmonieusement sur la crème.',
      'Parsemer d\'amandes effilées et cuire à 170°C pendant 35 min.'
    ]
  },
  {
    id: 'eclair-cafe',
    name: 'Éclair au café',
    category: 'Pâte à choux',
    portions: 10,
    prepTime: 60,
    cookTime: 30,
    image: './img/eclair-cafe.png',
    description: 'Pâte à choux moelleuse, crème pâtissière riche au café et fondant classique.',
    ingredients: [
      { name: 'Farine T55', quantity: 150, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 180, unit: 'g', pricePerKg: 6.15 },
      { name: 'Œufs entiers', quantity: 5, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 120, unit: 'g', pricePerKg: 0.68 },
      { name: 'Extrait de café', quantity: 20, unit: 'ml', pricePerL: 45.00 },
      { name: 'Maïzena', quantity: 40, unit: 'g', pricePerKg: 4.00 },
      { name: 'Fondant blanc', quantity: 200, unit: 'g', pricePerKg: 3.50 },
      { name: 'Sel', quantity: 3, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser la pâte à choux (panade + œufs) et pocher des éclairs de 12cm.',
      'Cuire à 170°C (four à sole ou avec oura ouvert) pendant 30 min.',
      'Préparer la crème pâtissière et l\'aromatiser avec l\'extrait de café pur.',
      'Lisser la crème refroidie et garnir les éclairs par 3 points en dessous.',
      'Mettre au point le fondant à 35-37°C et l\'aromatiser légèrement au café.',
      'Glacer les éclairs d\'un geste franc pour un résultat brillant.'
    ]
  },
  {
    id: 'baba-cointreau-poire',
    name: 'Verrine Baba Cointreau Poires Spéculoos',
    category: 'Dessert à l\'assiette',
    portions: 10,
    prepTime: 75,
    cookTime: 15,
    image: './img/baba-verrine.png',
    description: 'Baba de forme bouchon imbibé au Cointreau, brunoise de poires fraîches, crème vanille légère et crumble spéculoos.',
    ingredients: [
      { name: 'Pâte à baba (Pâton)', quantity: 200, unit: 'g', pricePerKg: 4.80 },
      { name: 'Cointreau', quantity: 80, unit: 'ml', pricePerL: 28.00 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Poires fraîches', quantity: 500, unit: 'g', pricePerKg: 3.80 },
      { name: 'Crème 35% MG', quantity: 300, unit: 'ml', pricePerL: 3.25 },
      { name: 'Mascarpone', quantity: 100, unit: 'g', pricePerKg: 8.50 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Spéculoos', quantity: 120, unit: 'g', pricePerKg: 6.00 },
      { name: 'Beurre doux', quantity: 30, unit: 'g', pricePerKg: 10.00 }
    ],
    steps: [
      'Cuire de petits babas (moules à bouchons) à 180°C.',
      'Préparer un sirop chaud avec eau, sucre et l\'infusion de poire, puis y rajouter le Cointreau hors du feu.',
      'Imbiber les babas dans le sirop tiède jusqu\'à parfaite saturation.',
      'Tailler les poires en brunoise fine et les faire compoter légèrement avec de la vanille.',
      'Monter la crème et le mascarpone en chantilly avec les grains d\'une demi-gousse de vanille.',
      'Broyer les spéculoos et les mélanger au beurre fondu pour le crumble.',
      'Montage verrine : brunoise de poire, baba imbibé coupé en deux, chantilly vanille, et parsemer de crumble au moment de servir.'
    ]
  },
  {
    id: 'tarte-chocolat-poire-fleur',
    name: 'Tarte Poire & Chocolat Fleur',
    category: 'Tarte Signature',
    portions: 10,
    prepTime: 110,
    cookTime: 35,
    image: './img/tarte-chocolat-poire.jpg',
    description: 'Tarte gourmande associant la douceur des poires pochées à une crème diplomate onctueuse au chocolat noir, sublimée par un pochage en fleur.',
    ingredients: [
      { name: 'Farine T55', quantity: 200, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 120, unit: 'g', pricePerKg: 6.15 },
      { name: 'Poires au sirop', quantity: 500, unit: 'g', pricePerKg: 4.80 },
      { name: 'Chocolat noir 64%', quantity: 150, unit: 'g', pricePerKg: 11.50 },
      { name: 'Crème 35% MG', quantity: 300, unit: 'ml', pricePerL: 3.25 },
      { name: 'Lait entier', quantity: 250, unit: 'ml', pricePerL: 0.72 },
      { name: 'Jaunes d\'œufs', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Sucre semoule', quantity: 80, unit: 'g', pricePerKg: 0.68 },
      { name: 'Gélatine', quantity: 4, unit: 'g', pricePerKg: 22.00 }
    ],
    steps: [
      'Cuire le fond de tarte cacao à blanc à 160°C pendant 20 min.',
      'Réaliser une crème pâtissière chocolatée, puis incorporer la gélatine.',
      'Une fois froide, détendre la crème et incorporer la crème montée (Diplomate).',
      'Disposer les poires émincées au fond de la tarte.',
      'Réaliser le pochage en fleur avec la diplomate chocolat sur toute la surface.',
      'Ajouter une touche de nappage au centre.'
    ]
  },
  {
    id: 'tarte-fruits-rouges-fleur',
    name: 'Tarte Fleur Fruits Rouges',
    category: 'Tarte Fruits',
    portions: 10,
    prepTime: 95,
    cookTime: 25,
    image: './img/tarte-fleur-rouge.jpg',
    description: 'Une explosion de fraîcheur avec un confit de fruits rouges et un pochage artistique à la vanille en forme de fleur.',
    ingredients: [
      { name: 'Farine T55', quantity: 200, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 150, unit: 'g', pricePerKg: 6.15 },
      { name: 'Fraises/Framboises', quantity: 400, unit: 'g', pricePerKg: 6.50 },
      { name: 'Mascarpone', quantity: 200, unit: 'g', pricePerKg: 8.50 },
      { name: 'Crème 35% MG', quantity: 300, unit: 'ml', pricePerL: 3.25 },
      { name: 'Sucre glace', quantity: 100, unit: 'g', pricePerKg: 2.10 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Pectine NH', quantity: 5, unit: 'g', pricePerKg: 45.00 }
    ],
    steps: [
      'Réaliser un fond de tarte sablée croustillant.',
      'Préparer un confit de fruits rouges (cuisson avec sucre et pectine).',
      'Garnir le fond de tarte de confit refroidi.',
      'Monter une ganache ou chantilly mascarpone vanille très ferme.',
      'Pocher la fleur rouge de l\'extérieur vers le centre avec une douille spécifique.',
      'Zester un peu de citron vert pour le peps.'
    ]
  },
  {
    id: 'tarte-praline-fleur',
    name: 'Tarte Praliné Fleur',
    category: 'Tarte Gourmande',
    portions: 10,
    prepTime: 85,
    cookTime: 20,
    image: './img/tarte-fleur-praline.jpg',
    description: 'Le mariage parfait du croquant des amandes et noisettes avec la légèreté d\'un pochage fleur à la vanille.',
    ingredients: [
      { name: 'Farine T55', quantity: 200, unit: 'g', pricePerKg: 0.44 },
      { name: 'Praliné noisette', quantity: 200, unit: 'g', pricePerKg: 10.50 },
      { name: 'Crème 35% MG', quantity: 400, unit: 'ml', pricePerL: 3.25 },
      { name: 'Noisettes entières', quantity: 50, unit: 'g', pricePerKg: 12.50 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Sucre glace', quantity: 60, unit: 'g', pricePerKg: 2.10 },
      { name: 'Feuillantine', quantity: 50, unit: 'g', pricePerKg: 15.00 }
    ],
    steps: [
      'Foncer et cuire le fond de tarte à 165°C.',
      'Mélanger le praliné avec un peu de feuillantine pour le croustillant.',
      'Étaler une fine couche au fond de la tarte.',
      'Monter la crème vanillée en chantilly avec le mascarpone.',
      'Pocher en rosace / fleur blanche élégante.',
      'Parsemer d\'éclats de noisettes torréfiées et de brisures de biscuits.'
    ]
  },
  {
    id: 'tarte-framboise-pistache-fleur',
    name: 'Tarte Framboise Pistache Fleur',
    category: 'Tarte Fruits',
    portions: 10,
    prepTime: 120,
    cookTime: 30,
    image: './img/tarte-framboise-pistache.jpg',
    description: 'Élégance et finesse : crème d\'amande pistache, framboises fraîches et un double pochage vanille-pistache.',
    ingredients: [
      { name: 'Farine T55', quantity: 200, unit: 'g', pricePerKg: 0.44 },
      { name: 'Pâte de pistache', quantity: 80, unit: 'g', pricePerKg: 45.00 },
      { name: 'Framboises fraîches', quantity: 300, unit: 'g', pricePerKg: 8.50 },
      { name: 'Beurre doux', quantity: 100, unit: 'g', pricePerKg: 6.80 },
      { name: 'Poudre d\'amandes', quantity: 100, unit: 'g', pricePerKg: 9.50 },
      { name: 'Crème 35% MG', quantity: 400, unit: 'ml', pricePerL: 3.25 },
      { name: 'Pistaches concassées', quantity: 30, unit: 'g', pricePerKg: 35.00 }
    ],
    steps: [
      'Réaliser une crème d\'amande à la pistache et la cuire dans le fond de tarte.',
      'Disposer des framboises fraîches harmonieusement.',
      'Préparer deux pochages : l\'un à la vanille, l\'autre à la pistache.',
      'Réaliser le pochage fleur bicolore (blanc et vert pastel).',
      'Décorer avec quelques framboises entières et des pistaches torréfiées.'
    ]
  },
  {
    id: 'negresco',
    name: 'Negresco',
    category: 'Entremets',
    portions: 8,
    prepTime: 120,
    cookTime: 20,
    image: './img/negresco.jpg',
    description: 'Une création signature fleurie : biscuit chocolat intense, ganache fondante, mousse légère et décor framboises fraîches.',
    ingredients: [
      { name: 'Chocolat noir 64%', quantity: 200, unit: 'g', pricePerKg: 11.50 },
      { name: 'Crème 35% MG', quantity: 400, unit: 'ml', pricePerL: 3.25 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Farine T45', quantity: 50, unit: 'g', pricePerKg: 1.30 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Fraises/Framboises', quantity: 150, unit: 'g', pricePerKg: 6.50 }
    ],
    steps: [
      'Préparer le biscuit chocolat de base.',
      'Réaliser la ganache et la mousse au chocolat.',
      'Effectuer le montage en cercle.',
      'Réaliser le pochage artistique en pétales.',
      'Déposer les framboises et les décors en chocolat noir.'
    ]
  },
  {
    id: 'frangipane',
    name: 'Frangipane',
    category: 'Feuilletage',
    portions: 8,
    prepTime: 60,
    cookTime: 40,
    image: './img/frangine.jpg',
    description: 'La classique galette des rois : feuilletage inversé pur beurre et crème frangipane onctueuse aux amandes.',
    ingredients: [
      { name: 'Beurre AOP (tourage)', quantity: 300, unit: 'g', pricePerKg: 6.15 },
      { name: 'Farine T55', quantity: 400, unit: 'g', pricePerKg: 0.44 },
      { name: 'Poudre d\'amandes', quantity: 200, unit: 'g', pricePerKg: 9.50 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Œufs entiers', quantity: 3, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Rhum ambré', quantity: 10, unit: 'ml', pricePerL: 18.00 }
    ],
    steps: [
      'Réaliser le feuilletage (ou utiliser un pâton frais).',
      'Préparer la crème d\'amandes et la mélanger à la pâtissière pour la frangipane.',
      'Détailler deux disques de pâte.',
      'Garnir le premier disque, dorer les bords et refermer.',
      'Chiqueter les bords et rayer le dessus.',
      'Cuire à 180°C jusqu\'à coloration dorée.'
    ]
  },
  {
    id: 'flan-patissier',
    name: 'Flan Pâtissier',
    category: 'Classique',
    portions: 10,
    prepTime: 40,
    cookTime: 50,
    image: './img/flan-patissier.jpg',
    description: 'Crème onctueuse à la vanille sur pâte brisée croustillante, cuit au four pour une croûte dorée.',
    ingredients: [
      { name: 'Lait entier', quantity: 1000, unit: 'ml', pricePerL: 0.72 },
      { name: 'Crème 35% MG', quantity: 200, unit: 'ml', pricePerL: 3.25 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Sucre semoule', quantity: 200, unit: 'g', pricePerKg: 0.68 },
      { name: 'Maïzena', quantity: 90, unit: 'g', pricePerKg: 4.00 },
      { name: 'Beurre AOP', quantity: 50, unit: 'g', pricePerKg: 6.15 },
      { name: 'Vanille (gousse)', quantity: 2, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Farine T55', quantity: 250, unit: 'g', pricePerKg: 0.44 }
    ],
    steps: [
      'Réaliser la pâte brisée et foncer un cercle haut.',
      'Bouillir le lait et la crème avec la vanille.',
      'Mélanger œufs, sucre et Maïzena. Verser le lait chaud dessus.',
      'Remettre sur le feu et faire épaissir en remuant constamment.',
      'Ajouter le beurre, verser dans le moule fonçé.',
      'Cuire à 180°C pendant 50 min. Laisser refroidir totalement.'
    ]
  },
  {
    id: 'religieuse-chocolat',
    name: 'Religieuse au Chocolat',
    category: 'Pâte à choux',
    portions: 10,
    prepTime: 35,
    cookTime: 35,
    image: './img/religieuse-chocolat.jpg',
    description: 'Deux choux superposés, garnis de crème pâtissière chocolat, glacés au fondant.',
    ingredients: [
      { name: 'Œufs entiers', quantity: 5, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Beurre AOP', quantity: 120, unit: 'g', pricePerKg: 6.15 },
      { name: 'Farine T55', quantity: 150, unit: 'g', pricePerKg: 0.44 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 0.72 },
      { name: 'Chocolat noir 64%', quantity: 150, unit: 'g', pricePerKg: 11.50 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Fondant blanc', quantity: 150, unit: 'g', pricePerKg: 3.50 }
    ],
    steps: [
      'Réaliser la pâte à choux et pocher 10 gros choux et 10 petits.',
      'Cuire à 170°C pendant 35 min.',
      'Préparer la crème pâtissière chocolatée.',
      'Garnir tous les choux par le dessous.',
      'Glacer au fondant chocolaté et assembler (le petit sur le gros).',
      'Décorer d\'une collerette de crème au beurre.'
    ]
  },
  {
    id: 'royal-chocolat',
    name: 'Royal Chocolat (Trianon)',
    category: 'Entremets',
    portions: 10,
    prepTime: 120,
    cookTime: 15,
    image: './img/royal-chocolat.jpg',
    description: 'Biscuit dacquoise noisette, croustillant praliné et mousse au chocolat noir intense.',
    ingredients: [
      { name: 'Chocolat noir 64%', quantity: 300, unit: 'g', pricePerKg: 11.50 },
      { name: 'Crème 35% MG', quantity: 500, unit: 'ml', pricePerL: 3.25 },
      { name: 'Praliné noisette', quantity: 200, unit: 'g', pricePerKg: 10.50 },
      { name: 'Feuillantine', quantity: 100, unit: 'g', pricePerKg: 12.00 },
      { name: 'Poudre de noisette', quantity: 150, unit: 'g', pricePerKg: 12.50 },
      { name: 'Blancs d\'œufs', quantity: 5, unit: 'pcs', pricePerPc: 0.20 },
      { name: 'Sucre glace', quantity: 150, unit: 'g', pricePerKg: 2.10 }
    ],
    steps: [
      'Réaliser la dacquoise noisette et cuire à 170°C (15 min).',
      'Mélanger le praliné et la feuillantine, étaler sur le biscuit.',
      'Réaliser une mousse au chocolat sur base de crème montée.',
      'Verser la mousse sur le croustillant dans un cercle.',
      'Bloquer au froid 4h minimum.',
      'Décorer de cacao poudre et de plaquettes de chocolat.'
    ]
  },
  {
    id: 'tarte-fraises',
    name: 'Tarte aux Fraises',
    category: 'Tarte',
    portions: 10,
    prepTime: 60,
    cookTime: 20,
    image: './img/tarte-fraises.jpg',
    description: 'Pâte sablée, crème pâtissière vanille et fraises fraîches nappées.',
    ingredients: [
      { name: 'Fraises fraîches', quantity: 750, unit: 'g', pricePerKg: 5.50 },
      { name: 'Farine T55', quantity: 250, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 125, unit: 'g', pricePerKg: 6.15 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Vanille (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 1.80 },
      { name: 'Nappage blond', quantity: 50, unit: 'g', pricePerKg: 8.00 }
    ],
    steps: [
      'Réaliser la pâte sablée, l\'abaisser et cuire à blanc à 170°C.',
      'Préparer une crème pâtissière onctueuse à la vanille.',
      'Garnir le fond de tarte refroidi de crème.',
      'Disposer les fraises harmonieusement sur le dessus.',
      'Napper les fruits pour le brillant et la conservation.'
    ]
  },
  {
    id: 'charlotte-fraises',
    name: 'Charlotte aux Fraises',
    category: 'Entremets',
    portions: 10,
    prepTime: 90,
    cookTime: 0,
    image: './img/charlotte.jpg',
    description: 'Biscuits cuiller imbibés, mousse légère à la fraise et morceaux de fruits frais.',
    ingredients: [
      { name: 'Biscuits cuiller', quantity: 30, unit: 'pcs', pricePerPc: 0.10 },
      { name: 'Purée de fraise', quantity: 500, unit: 'ml', pricePerL: 11.50 },
      { name: 'Crème 35% MG', quantity: 400, unit: 'ml', pricePerL: 3.25 },
      { name: 'Fraises fraîches', quantity: 300, unit: 'g', pricePerKg: 5.50 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Gélatine', quantity: 10, unit: 'g', pricePerKg: 22.00 }
    ],
    steps: [
      'Chemiser un moule à charlotte avec les biscuits imbibés de sirop.',
      'Préparer la mousse fraise : purée de fruit + gélatine + crème montée.',
      'Couler la moitié de la mousse, ajouter des morceaux de fraises.',
      'Recouvrir du reste de mousse.',
      'Réserver au froid 12h avant de démouler.',
      'Décorer de fruits frais et d\'un ruban.'
    ]
  },
  {
    id: 'trois-chocolats',
    name: 'Entremet Trois Chocolats',
    category: 'Entremets',
    portions: 10,
    prepTime: 150,
    cookTime: 12,
    image: './img/trois-chocs.jpg',
    description: 'Succession de trois mousses : chocolat noir, lait et blanc sur un biscuit cacao.',
    ingredients: [
      { name: 'Chocolat noir 64%', quantity: 150, unit: 'g', pricePerKg: 11.50 },
      { name: 'Chocolat au lait 35%', quantity: 150, unit: 'g', pricePerKg: 10.50 },
      { name: 'Chocolat blanc 33%', quantity: 150, unit: 'g', pricePerKg: 9.80 },
      { name: 'Crème 35% MG', quantity: 600, unit: 'ml', pricePerL: 3.25 },
      { name: 'Lait entier', quantity: 150, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Cacao poudre', quantity: 30, unit: 'g', pricePerKg: 12.00 }
    ],
    steps: [
      'Cuire un biscuit au cacao moelleux.',
      'Réaliser la mousse chocolat noir et couler sur le biscuit.',
      'Réserver au congélateur 20 min.',
      'Réaliser la mousse chocolat au lait et couler par-dessus.',
      'Réserver encore 20 min.',
      'Finir par la mousse chocolat blanc et bloquer au froid.'
    ]
  },
  {
    id: 'kouign-amann',
    name: 'Kouign-Amann',
    category: 'Viennoiserie',
    portions: 10,
    prepTime: 120,
    cookTime: 30,
    image: './img/kouign-amann.jpg',
    description: 'Gâteau breton feuilleté au beurre et au sucre, caramélisé à la cuisson.',
    ingredients: [
      { name: 'Farine T55', quantity: 500, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 300, unit: 'g', pricePerKg: 6.15 },
      { name: 'Sucre semoule', quantity: 300, unit: 'g', pricePerKg: 0.68 },
      { name: 'Eau', quantity: 300, unit: 'ml', pricePerL: 0.00 },
      { name: 'Levure fraîche', quantity: 20, unit: 'g', pricePerKg: 10.00 },
      { name: 'Sel', quantity: 10, unit: 'g', pricePerKg: 0.80 }
    ],
    steps: [
      'Réaliser une pâte à pain souple.',
      'Effectuer le tourage en incorporant le beurre demi-sel.',
      'Ajouter le sucre à chaque tour (tours doubles).',
      'Plier la pâte dans un moule beurré et sucré.',
      'Cuire à 200°C pendant 30 min jusqu\'à caramélisation intense.',
      'Démouler dès la sortie du four.'
    ]
  },
  {
    id: 'tropezienne',
    name: 'Tarte Tropézienne',
    category: 'Brioche',
    portions: 10,
    prepTime: 120,
    cookTime: 20,
    image: './img/tropezienne.jpg',
    description: 'Brioche moelleuse parfumée à la fleur d\'oranger, garnie d\'un mélange onctueux de deux crèmes.',
    ingredients: [
      { name: 'Farine T45', quantity: 500, unit: 'g', pricePerKg: 1.30 },
      { name: 'Beurre AOP', quantity: 200, unit: 'g', pricePerKg: 6.15 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Fleur d\'oranger', quantity: 20, unit: 'ml', pricePerL: 15.00 },
      { name: 'Crème 35% MG', quantity: 300, unit: 'ml', pricePerL: 3.25 },
      { name: 'Sucre grain', quantity: 50, unit: 'g', pricePerKg: 2.50 }
    ],
    steps: [
      'Réaliser la pâte à brioche et laisser pousser 2h.',
      'Détailler un disque, dorer et parsemer de sucre grain.',
      'Cuire à 180°C pendant 20 min.',
      'Préparer une crème diplomate parfumée à la fleur d\'oranger.',
      'Couper la brioche froide en deux et garnir généreusement.',
      'Saupoudrer de sucre glace avant de servir.'
    ]
  },
  {
    id: 'entremet-exotique',
    name: 'Entremet Exotique Mangue Passion',
    category: 'Entremets',
    portions: 10,
    prepTime: 150,
    cookTime: 15,
    image: './img/exotique.jpg',
    description: 'Mousse mangue-passion légère, insert confit de fruits exotiques sur biscuit coco.',
    ingredients: [
      { name: 'Purée mangue/passion', quantity: 500, unit: 'ml', pricePerL: 12.50 },
      { name: 'Crème 35% MG', quantity: 400, unit: 'ml', pricePerL: 3.25 },
      { name: 'Noix de coco râpée', quantity: 100, unit: 'g', pricePerKg: 8.50 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Gélatine', quantity: 12, unit: 'g', pricePerKg: 28.00 },
      { name: 'Blancs d\'œufs', quantity: 4, unit: 'pcs', pricePerPc: 0.11 }
    ],
    steps: [
      'Réaliser un biscuit dacquoise coco et cuire 15 min.',
      'Préparer un confit mangue-passion et couler en insert.',
      'Réaliser la mousse bavaroise exotique.',
      'Montage à l\'envers : mousse, insert congelé, dacquoise coco.',
      'Bloquer au froid et glacer avec un nappage neutre coloré.',
      'Décorer de fruits frais exotiques.'
    ]
  },
  {
    id: 'russe-noisette',
    name: 'Le Russe (Succès Noisette)',
    category: 'Entremets',
    portions: 10,
    prepTime: 90,
    cookTime: 25,
    image: './img/le-russe.jpg',
    description: 'Biscuit dacquoise noisette fondant et crème pralinée intense.',
    ingredients: [
      { name: 'Poudre de noisette', quantity: 250, unit: 'g', pricePerKg: 13.50 },
      { name: 'Sucre glace', quantity: 250, unit: 'g', pricePerKg: 2.10 },
      { name: 'Blancs d\'œufs', quantity: 8, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Beurre AOP', quantity: 250, unit: 'g', pricePerKg: 6.15 },
      { name: 'Praliné noisette', quantity: 150, unit: 'g', pricePerKg: 10.50 },
      { name: 'Lait entier', quantity: 100, unit: 'ml', pricePerL: 0.72 }
    ],
    steps: [
      'Réaliser deux disques de biscuit dacquoise noisette.',
      'Cuire à 170°C pendant 25 min.',
      'Préparer une crème mousseline au praliné noisette.',
      'Monter l\'entremet : biscuit, couche épaisse de crème, biscuit.',
      'Lisser les bords et saupoudrer généreusement de sucre glace.',
      'Réserver au frais avant dégustation.'
    ]
  },
  {
    id: 'salambo',
    name: 'Salambo',
    category: 'Pâte à choux',
    portions: 10,
    prepTime: 25,
    cookTime: 35,
    image: './img/salambo.jpg',
    description: 'Chou allongé garni de crème pâtissière au Kirsch, glacé au fondant vert et parsemé de vermicelles chocolat.',
    ingredients: [
      { name: ' Farine T55', quantity: 150, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 100, unit: 'g', pricePerKg: 6.15 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Lait entier', quantity: 500, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 100, unit: 'g', pricePerKg: 0.68 },
      { name: 'Kirsch', quantity: 10, unit: 'ml', pricePerL: 25.00 },
      { name: 'Fondant blanc', quantity: 150, unit: 'g', pricePerKg: 3.50 },
      { name: 'Jaunes d\'œufs', quantity: 3, unit: 'pcs', pricePerPc: 0.11 }
    ],
    steps: [
      'Réaliser la pâte à choux et pocher des bâtons de 8cm.',
      'Cuire à 170°C pendant 35 min.',
      'Préparer la crème pâtissière et l\'aromatiser au Kirsch.',
      'Garnir les choux refroidis par le dessous.',
      'Colorer le fondant en vert clair et glacer les choux.',
      'Décorer les extrémités avec des vermicelles au chocolat.'
    ]
  },

  // =====================================================================
  // NOUVELLES RECETTES — Enrichissement Bibliothèque des Chefs
  // Ajout Mars 2026 — 10 recettes de référence additionnelles
  // =====================================================================

  // --- CHOCOLATERIE ---
  {
    id: 'mendiants-chocolat',
    name: 'Mendiants au Chocolat Noir',
    category: 'Chocolaterie',
    portions: 30,
    prepTime: 30,
    cookTime: 0,
    image: './img/chocolat.jpg',
    description: 'Palets de chocolat noir grand cru tempéré, décorés de fruits secs et d\'épices – confiserie de maison classique revisitée.',
    ingredients: [
      { name: 'Chocolat noir 72%', quantity: 400, unit: 'g', pricePerKg: 14.50 },
      { name: 'Noisettes torréfiées', quantity: 60, unit: 'g', pricePerKg: 12.50 },
      { name: 'Amandes entières', quantity: 60, unit: 'g', pricePerKg: 10.00 },
      { name: 'Cranberries séchées', quantity: 50, unit: 'g', pricePerKg: 18.00 },
      { name: 'Pistaches émondées', quantity: 40, unit: 'g', pricePerKg: 35.00 },
      { name: 'Fleur de sel', quantity: 5, unit: 'g', pricePerKg: 12.00 },
      { name: 'Zeste d\'orange confite', quantity: 30, unit: 'g', pricePerKg: 22.00 }
    ],
    steps: [
      'Tempérer le chocolat noir selon la courbe : fonte à 50°C, tablage à 27°C, travail à 31°C.',
      'Pocher des palets de 3cm de diamètre sur feuille guitare.',
      'Avant cristallisation, déposer sur chaque palet : une noisette, une amande, une cranberry et une pistache.',
      'Ajouter un cristal de fleur de sel et un zeste d\'orange.',
      'Laisser cristalliser 30 min à 17°C.',
      'Décoller délicatement et conditionner en boîte.'
    ]
  },
  {
    id: 'truffes-chocolat-cognac',
    name: 'Truffes Chocolat & Cognac',
    category: 'Chocolaterie',
    portions: 20,
    prepTime: 40,
    cookTime: 0,
    image: './img/chocolat.jpg',
    description: 'Ganache fondante au cognac enrobée de chocolat noir et roulée dans le cacao pur – la truffe de Noël par excellence.',
    ingredients: [
      { name: 'Chocolat noir 64%', quantity: 300, unit: 'g', pricePerKg: 11.50 },
      { name: 'Crème 35% MG', quantity: 150, unit: 'ml', pricePerL: 3.25 },
      { name: 'Beurre AOP', quantity: 30, unit: 'g', pricePerKg: 6.15 },
      { name: 'Cognac VSOP', quantity: 20, unit: 'ml', pricePerL: 45.00 },
      { name: 'Cacao poudre amère', quantity: 60, unit: 'g', pricePerKg: 15.00 },
      { name: 'Sucre inverti (Trimoline)', quantity: 20, unit: 'g', pricePerKg: 8.00 }
    ],
    steps: [
      'Chauffer la crème avec le Trimoline. Verser sur le chocolat haché pour créer une ganache.',
      'Émulsionner au mixeur plongeant, ajouter le cognac et le beurre pommade.',
      'Couler en cadre 1cm d\'épaisseur et laisser cristalliser 12h.',
      'Détailler des cubes de 2cm, rouler dans la ganache pour les sphériser.',
      'Rouler abondamment dans le cacao pur.',
      'Réfrigérer et conditionner dans caissettes dorées.'
    ]
  },

  // --- PÂTISSERIES TOULOUSAINES ---
  {
    id: 'fenetra-toulouse',
    name: 'Fénétra de Toulouse',
    category: 'Pâtisserie Toulousaine',
    portions: 10,
    prepTime: 60,
    cookTime: 40,
    image: './img/tarte-bourdaloue.jpg',
    description: 'Emblème de la pâtisserie toulousaine : fond de pâte sablée, crème d\'amandes aux fruits confits, couvert d\'un glaçage royal et d\'amandes effilées.',
    ingredients: [
      { name: 'Farine T55', quantity: 250, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 200, unit: 'g', pricePerKg: 6.15 },
      { name: 'Poudre d\'amandes', quantity: 150, unit: 'g', pricePerKg: 9.50 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Œufs entiers', quantity: 3, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Écorces d\'orange confites', quantity: 80, unit: 'g', pricePerKg: 22.00 },
      { name: 'Cédrat confit', quantity: 60, unit: 'g', pricePerKg: 28.00 },
      { name: 'Rhum ambré', quantity: 20, unit: 'ml', pricePerL: 20.00 },
      { name: 'Sucre glace (glaçage)', quantity: 100, unit: 'g', pricePerKg: 2.10 },
      { name: 'Amandes effilées', quantity: 40, unit: 'g', pricePerKg: 9.50 }
    ],
    steps: [
      'Réaliser la pâte sablée toulousaine (riche en beurre), fraser et laisser reposer 1h au frais.',
      'Foncer un moule à tarte avec la pâte. Cuire à blanc 10 min à 170°C.',
      'Préparer la crème d\'amandes : crémer le beurre et le sucre, ajouter les œufs un à un, puis la poudre d\'amandes.',
      'Incorporer les fruits confits (écorces d\'orange et cédrat) coupés en brunoise et le rhum.',
      'Garnir le fond de tarte précuit et cuire 30 min à 170°C jusqu\'à légère coloration.',
      'Refroidir complètement. Napper d\'un glaçage royal fluide et parsemer d\'amandes effilées.'
    ]
  },
  {
    id: 'gimblette-toulouse',
    name: 'Gimblette de Toulouse',
    category: 'Pâtisserie Toulousaine',
    portions: 20,
    prepTime: 45,
    cookTime: 20,
    image: './img/macaron.jpg',
    description: 'Biscuit annulaire traditionnel toulousain : léger et croustillant, parfumé à la fleur d\'oranger et à l\'anis, poché dans l\'eau bouillante avant cuisson.',
    ingredients: [
      { name: 'Farine T55', quantity: 400, unit: 'g', pricePerKg: 0.44 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Beurre AOP', quantity: 80, unit: 'g', pricePerKg: 6.15 },
      { name: 'Œufs entiers', quantity: 3, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Fleur d\'oranger', quantity: 20, unit: 'ml', pricePerL: 15.00 },
      { name: 'Anis vert (graines)', quantity: 10, unit: 'g', pricePerKg: 25.00 },
      { name: 'Levure chimique', quantity: 8, unit: 'g', pricePerKg: 5.00 },
      { name: 'Sel', quantity: 4, unit: 'g', pricePerKg: 0.80 },
      { name: 'Sucre glace (finition)', quantity: 50, unit: 'g', pricePerKg: 2.10 }
    ],
    steps: [
      'Mélanger farine, sucre, levure, sel et graines d\'anis.',
      'Incorporer le beurre fondu refroidi, les œufs battus et la fleur d\'oranger.',
      'Pétrir jusqu\'à obtenir une pâte souple et homogène. Laisser reposer 20 min.',
      'Rouler la pâte en boudins fins de 1cm et former des anneaux soudés.',
      'Pocher les gimblettes 2 min dans l\'eau bouillante (elles remontent à la surface).',
      'Égoutter, disposer sur plaque et cuire à 190°C pendant 18-20 min jusqu\'à coloration dorée.',
      'Refroidir sur grille. Saupoudrer légèrement de sucre glace avant conditionnement.'
    ]
  },

  // --- ENTREMETS MODERNES ---
  {
    id: 'entremet-caramel-beurre-sale',
    name: 'Entremet Caramel Beurre Salé',
    category: 'Entremets',
    portions: 10,
    prepTime: 150,
    cookTime: 20,
    image: './img/tatin-vanille.jpg',
    description: 'Mousse légère au caramel beurre salé, insert fondant et biscuit breton sablé – un hommage à la Bretagne.',
    ingredients: [
      { name: 'Sucre semoule', quantity: 300, unit: 'g', pricePerKg: 0.68 },
      { name: 'Beurre demi-sel', quantity: 150, unit: 'g', pricePerKg: 7.50 },
      { name: 'Crème 35% MG', quantity: 500, unit: 'ml', pricePerL: 3.25 },
      { name: 'Lait entier', quantity: 200, unit: 'ml', pricePerL: 0.72 },
      { name: 'Jaunes d\'œufs', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Gélatine en feuilles', quantity: 10, unit: 'g', pricePerKg: 28.00 },
      { name: 'Farine T55', quantity: 200, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 120, unit: 'g', pricePerKg: 6.15 },
      { name: 'Fleur de sel', quantity: 3, unit: 'g', pricePerKg: 12.00 }
    ],
    steps: [
      'Cuire le caramel à sec jusqu\'à coloration ambrée, décuire avec la crème chaude et le beurre demi-sel.',
      'Réaliser la crème anglaise vanillée avec jaunes, lait et une partie du caramel.',
      'Coller la crème anglaise à la gélatine, laisser refroidir à 25°C puis incorporer la crème montée.',
      'Réaliser le sablé breton : crémage beurre/sucre, ajouter farine et fleur de sel. Cuire à 160°C.',
      'Montage : couler la mousse caramel, insérer le disque de caramel confit, sceller avec le sablé breton.',
      'Bloquer 6h au froid, démouler, napper d\'un nappage caramel brillant.'
    ]
  },
  {
    id: 'entremet-the-matcha-yuzu',
    name: 'Entremet Thé Matcha & Yuzu',
    category: 'Entremets',
    portions: 8,
    prepTime: 180,
    cookTime: 15,
    image: './img/exotique.jpg',
    description: 'Création signature franco-japonaise : mousse thé matcha, insert gélifié au yuzu et biscuit dacquoise noisette.',
    ingredients: [
      { name: 'Poudre de thé matcha', quantity: 20, unit: 'g', pricePerKg: 120.00 },
      { name: 'Crème 35% MG', quantity: 450, unit: 'ml', pricePerL: 3.25 },
      { name: 'Lait entier', quantity: 200, unit: 'ml', pricePerL: 0.72 },
      { name: 'Jus de yuzu', quantity: 80, unit: 'ml', pricePerL: 55.00 },
      { name: 'Sucre semoule', quantity: 200, unit: 'g', pricePerKg: 0.68 },
      { name: 'Gélatine en feuilles', quantity: 12, unit: 'g', pricePerKg: 28.00 },
      { name: 'Poudre de noisette', quantity: 100, unit: 'g', pricePerKg: 12.50 },
      { name: 'Blancs d\'œufs', quantity: 4, unit: 'pcs', pricePerPc: 0.20 },
      { name: 'Chocolat blanc 33%', quantity: 100, unit: 'g', pricePerKg: 9.80 }
    ],
    steps: [
      'Préparer la dacquoise noisette et cuire 15 min à 170°C. Réserver.',
      'Préparer l\'insert yuzu : jus de yuzu + sucre + gélatine, couler en insert et congeler.',
      'Réaliser la mousse matcha : infuser la poudre dans le lait chaud, préparer une crème anglaise, coller à la gélatine et incorporer la crème montée.',
      'Montage à l\'envers dans un moule silicone : mousse matcha, insert yuzu congelé, dacquoise noisette.',
      'Bloquer au congélateur minimum 8h.',
      'Démouler, glacer au nappage vert et décorer de poudre de matcha et zestes de yuzu.'
    ]
  },

  // --- BOULANGERIE FINE ---
  {
    id: 'brioche-feuilletee',
    name: 'Brioche Feuilletée (Suisse)',
    category: 'Viennoiserie',
    portions: 10,
    prepTime: 220,
    cookTime: 18,
    image: './img/tropezienne.jpg',
    description: 'Viennoiserie feuilletée d\'origine suisse : pâte briochée tourée au beurre, garnie de crème pâtissière vanille et pépites de chocolat.',
    ingredients: [
      { name: 'Farine T45', quantity: 500, unit: 'g', pricePerKg: 1.30 },
      { name: 'Beurre AOP (tourage)', quantity: 250, unit: 'g', pricePerKg: 6.15 },
      { name: 'Lait entier', quantity: 150, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 80, unit: 'g', pricePerKg: 0.68 },
      { name: 'Levure fraîche', quantity: 25, unit: 'g', pricePerKg: 10.00 },
      { name: 'Œufs entiers', quantity: 3, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Sel', quantity: 8, unit: 'g', pricePerKg: 0.80 },
      { name: 'Crème pâtissière (pâton)', quantity: 200, unit: 'g', pricePerKg: 3.50 },
      { name: 'Pépites de chocolat noir', quantity: 100, unit: 'g', pricePerKg: 10.50 }
    ],
    steps: [
      'Réaliser la pâte à brioche (sans le beurre de tourage), laisser pointer au froid 1h.',
      'Enchâsser le beurre de tourage froid et donner 3 tours simples.',
      'Abaisser la pâte en un rectangle de 3mm.',
      'Étaler uniformément la crème pâtissière et parsemer de pépites de chocolat.',
      'Rouler en boudin serré et détailler des rondelles de 3cm.',
      'Couvrir et apprêter 1h30 à 25°C, dorer puis cuire à 180°C pendant 18 min.'
    ]
  },
  {
    id: 'pain-de-genes',
    name: 'Pain de Gênes',
    category: 'Biscuit de Voyage',
    portions: 12,
    prepTime: 30,
    cookTime: 35,
    image: './img/frangine.jpg',
    description: 'Gâteau moelleux à la pâte d\'amandes fondante et aux zestes de citron – le biscuit de conserve classique de la pâtisserie française.',
    ingredients: [
      { name: 'Pâte d\'amandes 50%', quantity: 300, unit: 'g', pricePerKg: 12.00 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Beurre AOP', quantity: 80, unit: 'g', pricePerKg: 6.15 },
      { name: 'Farine T55', quantity: 60, unit: 'g', pricePerKg: 0.44 },
      { name: 'Maïzena', quantity: 20, unit: 'g', pricePerKg: 4.00 },
      { name: 'Sucre glace', quantity: 30, unit: 'g', pricePerKg: 2.10 },
      { name: 'Liqueur d\'amaretto', quantity: 20, unit: 'ml', pricePerL: 22.00 },
      { name: 'Zeste de citron', quantity: 2, unit: 'pcs', pricePerPc: 0.60 }
    ],
    steps: [
      'Ramollir la pâte d\'amandes au batteur, incorporer les œufs un par un en montant.',
      'Ajouter le beurre fondu refroidi, l\'amaretto et les zestes de citron.',
      'Tamiser et incorporer la farine et la Maïzena délicatement à la maryse.',
      'Verser dans un moule à manqué beurré et fariné.',
      'Cuire à 170°C pendant 35 min (lame sèche = cuit).',
      'Démouler tiède, saupoudrer de sucre glace et servir à température ambiante.'
    ]
  },

  // --- CONFISERIE ---
  {
    id: 'guimauve-framboise',
    name: 'Guimauve Framboise',
    category: 'Confiserie',
    portions: 30,
    prepTime: 40,
    cookTime: 5,
    image: './img/macaron.jpg',
    description: 'Marshmallow artisanal à la framboise, léger et fondant, enrobé d\'un mélange sucre glace‑Maïzena.',
    ingredients: [
      { name: 'Sucre semoule', quantity: 300, unit: 'g', pricePerKg: 0.68 },
      { name: 'Trimoline (sucre inverti)', quantity: 60, unit: 'g', pricePerKg: 8.00 },
      { name: 'Eau', quantity: 100, unit: 'ml', pricePerL: 0.00 },
      { name: 'Gélatine en feuilles', quantity: 20, unit: 'g', pricePerKg: 28.00 },
      { name: 'Purée de framboise', quantity: 100, unit: 'ml', pricePerL: 14.00 },
      { name: 'Blancs d\'œufs', quantity: 2, unit: 'pcs', pricePerPc: 0.20 },
      { name: 'Sucre glace (enrobage)', quantity: 80, unit: 'g', pricePerKg: 2.10 },
      { name: 'Maïzena (enrobage)', quantity: 40, unit: 'g', pricePerKg: 4.00 },
      { name: 'Colorant rouge', quantity: 3, unit: 'ml', pricePerL: 30.00 }
    ],
    steps: [
      'Hydrater la gélatine dans l\'eau froide.',
      'Cuire l\'eau, le sucre et le Trimoline à 130°C (petit boulé).',
      'En parallèle, monter les blancs en neige avec la purée de framboise.',
      'Verser le sirop chaud sur les blancs montés en filet, tout en fouettant.',
      'Essorer et incorporer la gélatine fondue. Ajouter le colorant.',
      'Couler en cadre huilé sur 2cm, laisser figer 4h.',
      'Détailler en cubes et rouler dans le mélange sucre glace‑Maïzena.'
    ]
  },
  {
    id: 'caramels-mous-vanille-fleur-sel',
    name: 'Caramels Mous Vanille & Fleur de Sel',
    category: 'Confiserie',
    portions: 30,
    prepTime: 20,
    cookTime: 15,
    image: './img/chocolat.jpg',
    description: 'Caramels fondants à la vanille de Tahiti, au beurre d\'Isigny et fleur de sel de Guérande – confiserie de prestige.',
    ingredients: [
      { name: 'Sucre semoule', quantity: 300, unit: 'g', pricePerKg: 0.68 },
      { name: 'Glucose (sirop)', quantity: 100, unit: 'g', pricePerKg: 5.00 },
      { name: 'Crème 35% MG', quantity: 250, unit: 'ml', pricePerL: 3.25 },
      { name: 'Beurre AOP', quantity: 80, unit: 'g', pricePerKg: 6.15 },
      { name: 'Vanille Tahiti (gousse)', quantity: 1, unit: 'pcs', pricePerPc: 3.50 },
      { name: 'Fleur de sel de Guérande', quantity: 5, unit: 'g', pricePerKg: 15.00 }
    ],
    steps: [
      'Chauffer la crème avec la vanille fendue et grattée. Laisser infuser 15 min.',
      'Dans une casserole large, cuire le sucre et le glucose à sec jusqu\'au caramel ambré.',
      'Décuire hors du feu avec la crème chaude (attention aux projections).',
      'Ajouter le beurre en dés et mélanger jusqu\'à incorporation totale.',
      'Cuire à nouveau jusqu\'à 120°C (caramel mou) au thermomètre.',
      'Couler dans un cadre huilé, parsemer de fleur de sel, laisser cristalliser 2h.',
      'Détailler en rectangles de 3×1cm et emballer dans du papier cellophane.'
    ]
  },

  // --- MACARONS ---
  {
    id: 'macaron-caramel-beurre-sale',
    name: 'Macaron Caramel Beurre Salé',
    category: 'Macaron',
    portions: 30,
    prepTime: 90,
    cookTime: 14,
    image: './img/macaron.jpg',
    description: 'Coques amandes lisses au ton ambré, garnies d\'une ganache montée généreuse au caramel beurre salé.',
    ingredients: [
      { name: 'Poudre d\'amandes', quantity: 200, unit: 'g', pricePerKg: 9.50 },
      { name: 'Sucre glace', quantity: 200, unit: 'g', pricePerKg: 2.10 },
      { name: 'Sucre semoule', quantity: 250, unit: 'g', pricePerKg: 0.68 },
      { name: 'Blancs d\'œufs', quantity: 6, unit: 'pcs', pricePerPc: 0.20 },
      { name: 'Crème 35% MG', quantity: 250, unit: 'ml', pricePerL: 3.25 },
      { name: 'Chocolat blanc 33%', quantity: 150, unit: 'g', pricePerKg: 9.80 },
      { name: 'Beurre demi-sel', quantity: 80, unit: 'g', pricePerKg: 7.50 }
    ],
    steps: [
      'Réaliser les coques : meringue italienne incorporée au tant-pour-tant.',
      'Pocher, croûter 30 min et cuire à 150°C pendant 14 min.',
      'Réaliser le caramel au beurre salé (sucre à sec, décuisson crème, ajout beurre).',
      'Verser le caramel chaud sur le chocolat blanc pour créer la ganache de base.',
      'Laisser cristalliser, puis monter légèrement au batteur.',
      'Garnir les coques généreusement et laisser maturer 24h au frais avant vente.'
    ]
  },

  // --- BÛCHES DE NOËL ---
  {
    id: 'buche-roulee-chocolat-passion',
    name: 'Bûche Roulée Chocolat Passion',
    category: 'Bûche de Noël',
    portions: 1,
    prepTime: 120,
    cookTime: 15,
    image: './img/trois-chocs.jpg',
    description: 'Une bûche traditionnelle revisitée pour une production rapide. Biscuit pâte à choux très moelleux, crémeux passion et ganache montée chocolat lait.',
    ingredients: [
      { name: 'Chocolat au lait 35%', quantity: 200, unit: 'g', pricePerKg: 10.50 },
      { name: 'Crème 35% MG', quantity: 450, unit: 'ml', pricePerL: 3.25 },
      { name: 'Purée passion', quantity: 150, unit: 'ml', pricePerL: 12.50 },
      { name: 'Œufs entiers', quantity: 4, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Sucre semoule', quantity: 150, unit: 'g', pricePerKg: 0.68 },
      { name: 'Farine T55', quantity: 60, unit: 'g', pricePerKg: 0.44 },
      { name: 'Beurre AOP', quantity: 50, unit: 'g', pricePerKg: 6.15 },
      { name: 'Gélatine en feuilles', quantity: 4, unit: 'g', pricePerKg: 28.00 }
    ],
    steps: [
      'La veille, réaliser la ganache au chocolat au lait et réserver au frais.',
      'Préparer le biscuit pâte à choux : faire chauffer lait/beurre/farine, ajouter les jaunes, puis monter les blancs. Cuire à 170°C (12 min).',
      'Réaliser le crémeux passion (œufs, sucre, purée, cuisson 85°C, collage gélatine + beurre).',
      'Monter la ganache chocolat lait.',
      'Étaler le crémeux passion sur le biscuit, rouler la bûche en serrant bien.',
      'Masquer et décorer la bûche avec la ganache montée. Ajouter des décors de Noël.'
    ]
  },
  {
    id: 'buche-contemporaine-vanille-pecan',
    name: 'Bûche Contemporaine Vanille Pécan',
    category: 'Bûche de Noël',
    portions: 1,
    prepTime: 180,
    cookTime: 25,
    image: './img/tatin-vanille.jpg',
    description: 'Bûche design en moule gouttière : Mousse vanille intense, insert praliné pécan coulant, biscuit croustillant et glaçage miroir blanc.',
    ingredients: [
      { name: 'Noix de pécan', quantity: 150, unit: 'g', pricePerKg: 25.00 },
      { name: 'Sucre semoule', quantity: 250, unit: 'g', pricePerKg: 0.68 },
      { name: 'Crème 35% MG', quantity: 500, unit: 'ml', pricePerL: 3.25 },
      { name: 'Lait entier', quantity: 200, unit: 'ml', pricePerL: 0.72 },
      { name: 'Vanille Tahiti (gousse)', quantity: 2, unit: 'pcs', pricePerPc: 3.50 },
      { name: 'Gélatine en feuilles', quantity: 14, unit: 'g', pricePerKg: 28.00 },
      { name: 'Chocolat blanc 33%', quantity: 300, unit: 'g', pricePerKg: 9.80 },
      { name: 'Feuillantine', quantity: 50, unit: 'g', pricePerKg: 15.00 }
    ],
    steps: [
      'Réaliser un praliné pécan pur. Mélanger une partie avec la feuillantine pour la base croustillante. Couler le reste en moule insert à bûche.',
      'Préparer la base du biscuit moelleux pécan et cuire 15 min. Poser sur le croustillant.',
      'Réaliser la mousse bavaroise vanille richement infusée, coller à la gélatine et incorporer la crème montée.',
      'Montage à l\'envers dans une gouttière : mousse vanille, insert praliné congelé, biscuit/croustillant.',
      'Bloquer 12h à -18°C.',
      'Préparer le glaçage miroir blanc (chocolat, lait concentré). Démouler et glacer à 32°C. Décor embout de bûche chocolat blanc.'
    ]
  },

  // --- BISCUIT DE VOYAGE (Longue conservation, haute rentabilité) ---
  {
    id: 'cake-citron-menton',
    name: 'Cake Ultime au Citron de Menton',
    category: 'Biscuit de Voyage',
    portions: 6,
    prepTime: 30,
    cookTime: 45,
    image: './img/tarte-citron.jpg',
    description: 'Le grand classique de la pâtisserie d\'hôtel : pâte extrêmement moelleuse, sirop d\'imbibage acidulé au citron frais et glaçage royal croquant.',
    ingredients: [
      { name: 'Farine T55', quantity: 200, unit: 'g', pricePerKg: 0.44 },
      { name: 'Sucre semoule', quantity: 250, unit: 'g', pricePerKg: 0.68 },
      { name: 'Œufs entiers', quantity: 3, unit: 'pcs', pricePerPc: 0.11 },
      { name: 'Beurre doux', quantity: 100, unit: 'g', pricePerKg: 6.80 },
      { name: 'Crème liquide entière', quantity: 90, unit: 'ml', pricePerL: 3.25 },
      { name: 'Citron de Menton (zeste et jus)', quantity: 3, unit: 'pcs', pricePerPc: 0.80 },
      { name: 'Levure chimique', quantity: 6, unit: 'g', pricePerKg: 5.00 },
      { name: 'Sucre glace', quantity: 150, unit: 'g', pricePerKg: 2.10 }
    ],
    steps: [
      'Blanchir les œufs avec le sucre et les zestes fins de citron.',
      'Ajouter la crème liquide, puis la farine tamisée avec la levure.',
      'Incorporer le beurre fondu chaud, puis une partie du jus de citron. Ajouter une pointe de sel.',
      'Couler dans un moule à cake chemisé. Cuire à 160°C pendant 45 min.',
      'Pendant ce temps, préparer le sirop d\'imbibage avec le reste de jus de citron et un peu d\'eau sucrée.',
      'À la sortie du four, imbiber le cake chaud avec le sirop froid.',
      'Refroidir, puis glacer avec un mélange sucre glace / jus de citron. Sécher 2 min au four pour croûter le glaçage.'
    ]
  },
  {
    id: 'financier-noisette-praline',
    name: 'Financier Tigré Noisette & Praliné',
    category: 'Biscuit de Voyage',
    portions: 15,
    prepTime: 20,
    cookTime: 12,
    image: './img/frangine.jpg',
    description: 'Format individuel très rentable. Pâte à financier onctueuse à la noisette torréfiée, poché avec un cœur coulant au praliné.',
    ingredients: [
      { name: 'Beurre doux (Beurre Noisette)', quantity: 150, unit: 'g', pricePerKg: 6.80 },
      { name: 'Sucre glace', quantity: 170, unit: 'g', pricePerKg: 2.10 },
      { name: 'Poudre de noisette', quantity: 80, unit: 'g', pricePerKg: 12.50 },
      { name: 'Poudre d\'amandes', quantity: 40, unit: 'g', pricePerKg: 9.50 },
      { name: 'Farine T45', quantity: 50, unit: 'g', pricePerKg: 1.30 },
      { name: 'Blancs d\'œufs', quantity: 5, unit: 'pcs', pricePerPc: 0.20 },
      { name: 'Praliné noisette (Insert)', quantity: 100, unit: 'g', pricePerKg: 10.50 }
    ],
    steps: [
      'Réaliser un beurre noisette : cuire le beurre jusqu\'à l\'obtention d\'une couleur ambrée et de l\'arôme de noisette grillée. Laisser tiédir.',
      'Dans un cul-de-poule, mélanger toutes les poudres (sucre glace, poudres de fruits secs, farine).',
      'Ajouter les blancs d\'œufs non montés, fouetter pour obtenir une pâte lisse.',
      'Incorporer le beurre noisette tiède (chinoisé) et mélanger.',
      'Pocher dans des moules à petits fours (type savarins, avec un trou central).',
      'Cuire 12 min à 180°C.',
      'Démouler. Une fois froids, pocher le praliné pur dans la cavité centrale du financier.'
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
    prepTime: 20,
    cookTime: 12,
    image: './img/croissant.jpg',
    description: 'Croissant pur beurre, feuilletage croustillant et mie alvéolée.',
    ingredients: [
      { name: 'Farine T45', quantity: 500, unit: 'g', pricePerKg: 1.30 },
      { name: 'Beurre AOP (tourage)', quantity: 250, unit: 'g', pricePerKg: 6.15 },
      { name: 'Lait entier', quantity: 150, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 60, unit: 'g', pricePerKg: 0.68 },
      { name: 'Levure fraîche', quantity: 20, unit: 'g', pricePerKg: 10.00 },
      { name: 'Œufs entiers', quantity: 1, unit: 'pcs', pricePerPc: 0.11 },
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
    name: 'Chocolatine',
    category: 'Viennoiserie',
    portions: 10,
    prepTime: 180,
    cookTime: 18,
    image: './img/pain-au-chocolat.jpg',
    description: 'Pâte feuilletée levée pur beurre avec deux barres de chocolat noir.',
    ingredients: [
      { name: 'Farine T45', quantity: 500, unit: 'g', pricePerKg: 1.30 },
      { name: 'Beurre AOP (tourage)', quantity: 280, unit: 'g', pricePerKg: 6.15 },
      { name: 'Chocolat noir bâtons', quantity: 200, unit: 'g', pricePerKg: 11.50 },
      { name: 'Lait entier', quantity: 150, unit: 'ml', pricePerL: 0.72 },
      { name: 'Sucre semoule', quantity: 60, unit: 'g', pricePerKg: 0.68 },
      { name: 'Levure fraîche', quantity: 20, unit: 'g', pricePerKg: 10.00 },
      { name: 'Œufs entiers', quantity: 1, unit: 'pcs', pricePerPc: 0.11 },
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
  const tauxHoraire = params.tauxHoraire ?? 12.00;
  const chargesFixes = params.chargesFixes ?? 1200;
  const coutEnergieH = params.coutEnergie ?? 1.20;
  const nbProductionsMois = params.nbProdMois ?? 400;
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

