/* Equipment Database — LabPâtiss' Configurateur */
window.EQUIPMENT_DB = [
    // ── USTENSILES & PETIT ÉQUIPEMENT ──
    {
        id: 'couteaux', name: "Jeu de couteaux d'office", category: 'ustensiles', sub: 'Couteaux', icon: '🔪', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Pradel Excellence', model: 'Set Essentiel 3p', price: 35 },
            { level: 'Intermédiaire', brand: 'Victorinox', model: 'Swiss Classic Set 5p', price: 89 },
            { level: 'Professionnel', brand: 'Wüsthof', model: 'Grand Prix II Set', price: 185 },
            { level: 'Premium', brand: 'Kai Shun', model: 'Classic DMS-300', price: 340 }
        ]
    },
    {
        id: 'spatules', name: 'Spatules droites et coudées', category: 'ustensiles', sub: 'Spatules', icon: '🥄', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Mallard Ferrière', model: 'Set 3 spatules', price: 18 },
            { level: 'Intermédiaire', brand: 'De Buyer', model: 'Set Giesser 4p', price: 45 },
            { level: 'Professionnel', brand: 'Matfer Bourgeat', model: 'Set professionnel 5p', price: 95 },
            { level: 'Premium', brand: 'JB Prince', model: 'Set complet 8p', price: 160 }
        ]
    },
    {
        id: 'maryses', name: 'Maryses, cornes et raclettes', category: 'ustensiles', sub: 'Maryses', icon: '🥣', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Mallard Ferrière', model: 'Set silicone 4p', price: 12 },
            { level: 'Intermédiaire', brand: 'De Buyer', model: 'Set Moul\'flex 6p', price: 32 },
            { level: 'Professionnel', brand: 'Matfer Bourgeat', model: 'Set Exoglass 8p', price: 65 },
            { level: 'Premium', brand: 'Silikomart', model: 'Set premium 10p', price: 110 }
        ]
    },
    {
        id: 'fouets', name: 'Fouets et ustensiles de mélange', category: 'ustensiles', sub: 'Fouets', icon: '🫘', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'De Buyer', model: 'Fouet inox + maryse', price: 15 },
            { level: 'Intermédiaire', brand: 'Matfer Bourgeat', model: 'Set fouets 3 tailles', price: 42 },
            { level: 'Professionnel', brand: 'Rösle', model: 'Set professionnel 5p', price: 85 },
            { level: 'Premium', brand: 'Rösle', model: 'Gamme complète 8p', price: 145 }
        ]
    },
    {
        id: 'mixeur', name: 'Mixeur plongeant professionnel', category: 'ustensiles', sub: 'Électrique', icon: '⚡', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Moulinex', model: 'Quickchef DD655', price: 45 },
            { level: 'Intermédiaire', brand: 'Bamix', model: 'Gastro 200', price: 180 },
            { level: 'Professionnel', brand: 'Robot Coupe', model: 'CMP 300 Combi', price: 380 },
            { level: 'Premium', brand: 'Dynamic', model: 'MX091 Master', price: 520 }
        ]
    },
    {
        id: 'pinceaux', name: 'Pinceaux alimentaires', category: 'ustensiles', sub: 'Accessoires', icon: '🖌️', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Mallard Ferrière', model: 'Set silicone 3p', price: 8 },
            { level: 'Intermédiaire', brand: 'De Buyer', model: 'Set poils naturels 4p', price: 22 },
            { level: 'Professionnel', brand: 'Matfer Bourgeat', model: 'Set complet 6p', price: 45 },
            { level: 'Premium', brand: 'Ateco', model: 'Set artiste 8p', price: 75 }
        ]
    },
    {
        id: 'rapes', name: 'Râpes, zesteurs et éplucheurs', category: 'ustensiles', sub: 'Découpe', icon: '🍋', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Zyliss', model: 'Set 3 pièces', price: 15 },
            { level: 'Intermédiaire', brand: 'Microplane', model: 'Premium Classic + zesteur', price: 38 },
            { level: 'Professionnel', brand: 'Microplane', model: 'Set Pro 4 lames', price: 72 },
            { level: 'Premium', brand: 'Microplane', model: 'Master Series complet', price: 120 }
        ]
    },
    {
        id: 'culdpoule', name: 'Culs-de-poule inox (set)', category: 'ustensiles', sub: 'Contenants', icon: '🥗', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Mallard Ferrière', model: 'Set 3 tailles', price: 25 },
            { level: 'Intermédiaire', brand: 'De Buyer', model: 'Set 5 tailles fond silicone', price: 65 },
            { level: 'Professionnel', brand: 'Matfer Bourgeat', model: 'Set pro 6 tailles', price: 120 },
            { level: 'Premium', brand: 'Mauviel', model: 'Set M\'cook 8 tailles', price: 195 }
        ]
    },
    {
        id: 'gastro', name: 'Bacs gastronormes GN inox', category: 'ustensiles', sub: 'Contenants', icon: '📦', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Vogue', model: 'Set 6 bacs GN essentiels', price: 45 },
            { level: 'Intermédiaire', brand: 'De Buyer', model: 'Set 10 bacs + couvercles', price: 120 },
            { level: 'Professionnel', brand: 'Matfer Bourgeat', model: 'Set 15 bacs complet', price: 240 },
            { level: 'Premium', brand: 'Blanco', model: 'Set 20 bacs pro', price: 380 }
        ]
    },
    {
        id: 'balance-prec', name: 'Balance de précision', category: 'ustensiles', sub: 'Mesure', icon: '⚖️', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Terraillon', model: 'Macaron 5kg/1g', price: 25 },
            { level: 'Intermédiaire', brand: 'Soehnle', model: 'Page Profi 15kg/1g', price: 55 },
            { level: 'Professionnel', brand: 'Ohaus', model: 'Navigator NV2101', price: 130 },
            { level: 'Premium', brand: 'Adam Equipment', model: 'Nimbus 0.01g', price: 280 }
        ]
    },
    {
        id: 'balance-cap', name: 'Balance grande capacité', category: 'ustensiles', sub: 'Mesure', icon: '⚖️', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Bartscher', model: 'A300068 15kg', price: 55 },
            { level: 'Intermédiaire', brand: 'Casselin', model: 'CBAL30 30kg', price: 120 },
            { level: 'Professionnel', brand: 'Ohaus', model: 'Defender 60kg', price: 280 },
            { level: 'Premium', brand: 'Mettler Toledo', model: 'ICS445 100kg', price: 450 }
        ]
    },
    {
        id: 'thermo-sonde', name: 'Thermomètre à sonde', category: 'ustensiles', sub: 'Mesure', icon: '🌡️', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Hanna', model: 'Checktemp 1', price: 18 },
            { level: 'Intermédiaire', brand: 'Testo', model: 'Testo 104', price: 55 },
            { level: 'Professionnel', brand: 'Testo', model: 'Testo 926 Set', price: 130 },
            { level: 'Premium', brand: 'ETI', model: 'ThermaQ 2 multicanal', price: 240 }
        ]
    },
    {
        id: 'thermo-laser', name: 'Thermomètre infrarouge laser', category: 'ustensiles', sub: 'Mesure', icon: '🎯', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Hanna', model: 'HI99551-00', price: 30 },
            { level: 'Intermédiaire', brand: 'Testo', model: 'Testo 830-T2', price: 75 },
            { level: 'Professionnel', brand: 'Fluke', model: '62 MAX+', price: 150 },
            { level: 'Premium', brand: 'Fluke', model: '572-2 haute précision', price: 280 }
        ]
    },

    // ── MACHINES & GROS MATÉRIEL ──
    {
        id: 'batteur', name: 'Batteur-mélangeur planétaire', category: 'machines', sub: 'Robots', icon: '🤖', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'KitchenAid', model: 'Artisan 4.8L', price: 450 },
            { level: 'Intermédiaire', brand: 'Kenwood', model: 'Chef XL Titanium 6.7L', price: 850 },
            { level: 'Professionnel', brand: 'Hobart', model: 'N50 5L professionnel', price: 2800 },
            { level: 'Premium', brand: 'Hobart', model: 'HSM40 40L semi-industriel', price: 5500 }
        ]
    },
    {
        id: 'robot-coupe', name: 'Robot Coupe / Cutter', category: 'machines', sub: 'Robots', icon: '⚙️', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Moulinex', model: 'Masterchef Gourmet', price: 180 },
            { level: 'Intermédiaire', brand: 'Robot Coupe', model: 'R 301 Ultra', price: 650 },
            { level: 'Professionnel', brand: 'Robot Coupe', model: 'R 5 Plus triphasé', price: 1800 },
            { level: 'Premium', brand: 'Robot Coupe', model: 'R 8 V.V. inox', price: 3200 }
        ]
    },
    {
        id: 'laminoir', name: 'Laminoir à pâte', category: 'machines', sub: 'Façonnage', icon: '📏', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Imperia', model: 'Restaurant Manual 150mm', price: 280 },
            { level: 'Intermédiaire', brand: 'Rondo', model: 'STM 503 de table', price: 1500 },
            { level: 'Professionnel', brand: 'Rondo', model: 'Doge 605mm', price: 4200 },
            { level: 'Premium', brand: 'Rondo', model: 'Compas 2.0 auto', price: 7500 }
        ]
    },
    {
        id: 'tempereuse', name: 'Tempéreuse à chocolat', category: 'machines', sub: 'Chocolat', icon: '🍫', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'ICB Tecnologie', model: 'Baño miniTemp 5.5L', price: 250 },
            { level: 'Intermédiaire', brand: 'Mol d\'Art', model: 'Pralina 6kg', price: 950 },
            { level: 'Professionnel', brand: 'Selmi', model: 'Plus EX 30kg', price: 3500 },
            { level: 'Premium', brand: 'Selmi', model: 'One 100kg automatique', price: 6800 }
        ]
    },

    // ── CUISSON & FROID ──
    {
        id: 'four', name: 'Four professionnel ventilé', category: 'cuisson', sub: 'Fours', icon: '🔥', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Burco', model: 'BC CTC002 convection', price: 650 },
            { level: 'Intermédiaire', brand: 'UNOX', model: 'LineMicro Anna 4 niveaux', price: 2200 },
            { level: 'Professionnel', brand: 'UNOX', model: 'Bakerlux SHOP.Pro LED', price: 5800 },
            { level: 'Premium', brand: 'Rational', model: 'iCombi Pro 6-1/1', price: 13500 }
        ]
    },
    {
        id: 'cellule', name: 'Cellule de refroidissement', category: 'cuisson', sub: 'Froid', icon: '❄️', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Polar', model: 'CK640 10 niveaux', price: 850 },
            { level: 'Intermédiaire', brand: 'Irinox', model: 'EF 10.1 MultiFresh', price: 2200 },
            { level: 'Professionnel', brand: 'Irinox', model: 'MF 30.2 Plus', price: 4800 },
            { level: 'Premium', brand: 'Irinox', model: 'MF 70.2 MultiFresh', price: 8500 }
        ]
    },
    {
        id: 'fermentation', name: 'Chambre de fermentation', category: 'cuisson', sub: 'Fermentation', icon: '🫗', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Brod & Taylor', model: 'FP-205 pliable', price: 350 },
            { level: 'Intermédiaire', brand: 'Hengel', model: 'Armoire 400×600 8 niv', price: 1200 },
            { level: 'Professionnel', brand: 'Bongard', model: 'BFC Évolution 2 portes', price: 3500 },
            { level: 'Premium', brand: 'Bongard', model: 'BFC Premium auto', price: 6500 }
        ]
    },
    {
        id: 'induction', name: 'Plaques de cuisson induction', category: 'cuisson', sub: 'Cuisson', icon: '🫕', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Bartscher', model: 'IK 35 mono', price: 120 },
            { level: 'Intermédiaire', brand: 'Adventys', model: 'GLI3500 Induction', price: 380 },
            { level: 'Professionnel', brand: 'De Buyer', model: 'Induction double FE', price: 850 },
            { level: 'Premium', brand: 'Berner', model: 'BI2EG3.5 encastrable', price: 1400 }
        ]
    },
    {
        id: 'frigo', name: 'Réfrigérateur positif professionnel', category: 'cuisson', sub: 'Froid', icon: '🧊', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Polar', model: 'Serie C 600L', price: 550 },
            { level: 'Intermédiaire', brand: 'Liebherr', model: 'GKPv 6573 ProfiLine', price: 1200 },
            { level: 'Professionnel', brand: 'Liebherr', model: 'BKPv 8470 BioFresh', price: 2400 },
            { level: 'Premium', brand: 'Electrolux', model: 'ecostore Premium 670L', price: 4200 }
        ]
    },
    {
        id: 'congelateur', name: 'Congélateur négatif', category: 'cuisson', sub: 'Froid', icon: '🥶', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Polar', model: 'Serie C -18°C 600L', price: 480 },
            { level: 'Intermédiaire', brand: 'Liebherr', model: 'GGPv 6573 630L', price: 950 },
            { level: 'Professionnel', brand: 'Liebherr', model: 'BGPv 8470 BioFresh', price: 2100 },
            { level: 'Premium', brand: 'Electrolux', model: 'ecostore Premium -22°C', price: 3800 }
        ]
    },
    {
        id: 'plaques', name: 'Plaques pâtissières & grilles (set)', category: 'cuisson', sub: 'Supports', icon: '🍪', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'De Buyer', model: 'Set 6 plaques alu', price: 45 },
            { level: 'Intermédiaire', brand: 'Matfer Bourgeat', model: 'Set 10 plaques + 6 grilles', price: 150 },
            { level: 'Professionnel', brand: 'Matfer Bourgeat', model: 'Set complet 15p', price: 320 },
            { level: 'Premium', brand: 'Gobel', model: 'Set premium 20 pièces', price: 520 }
        ]
    },
    {
        id: 'silpat', name: 'Silpat, feuilles et tapis cuisson', category: 'cuisson', sub: 'Supports', icon: '📋', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Silpat', model: 'Set 3 tapis basiques', price: 25 },
            { level: 'Intermédiaire', brand: 'Silpat', model: 'Set 6 tapis + toile', price: 65 },
            { level: 'Professionnel', brand: 'Demarle', model: 'Set pro 10p varié', price: 140 },
            { level: 'Premium', brand: 'Demarle', model: 'Set complet Flexipan', price: 250 }
        ]
    },
    {
        id: 'cercles', name: 'Cercles, cadres et emporte-pièces', category: 'cuisson', sub: 'Moules', icon: '⭕', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'De Buyer', model: 'Set 6 cercles inox', price: 35 },
            { level: 'Intermédiaire', brand: 'Matfer Bourgeat', model: 'Set 12 cercles + cadres', price: 95 },
            { level: 'Professionnel', brand: 'Pavoni', model: 'Set pro 20p', price: 220 },
            { level: 'Premium', brand: 'Pavoni', model: 'Set complet micro-perforé', price: 380 }
        ]
    },
    {
        id: 'moules', name: 'Moules variés (entremets, tartes…)', category: 'cuisson', sub: 'Moules', icon: '🧁', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Gobel', model: 'Set 8 moules essentiels', price: 40 },
            { level: 'Intermédiaire', brand: 'Silikomart', model: 'Set 12 silicone + inox', price: 110 },
            { level: 'Professionnel', brand: 'Pavoni', model: 'Set 18 moules Pavoflex', price: 260 },
            { level: 'Premium', brand: 'Silikomart', model: 'Set 25 moules design', price: 420 }
        ]
    },

    // ── STOCKAGE & ORGANISATION ──
    {
        id: 'etageres', name: 'Étagères inox professionnelles', category: 'stockage', sub: 'Rangement', icon: '🗄️', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Vogue', model: '4 niveaux 120cm', price: 110 },
            { level: 'Intermédiaire', brand: 'Tournus', model: 'Set 2 étagères 150cm', price: 350 },
            { level: 'Professionnel', brand: 'Tournus', model: 'Set 3 étagères + chariot', price: 680 },
            { level: 'Premium', brand: 'Tournus', model: 'Set complet 5 modules', price: 1200 }
        ]
    },
    {
        id: 'bacs-alim', name: 'Bacs alimentaires & hermétiques', category: 'stockage', sub: 'Contenants', icon: '🫙', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Araven', model: 'Set 8 bacs empilables', price: 35 },
            { level: 'Intermédiaire', brand: 'Araven', model: 'Set 15 bacs ColorClip', price: 85 },
            { level: 'Professionnel', brand: 'Cambro', model: 'Set 20 CamSquare', price: 180 },
            { level: 'Premium', brand: 'Cambro', model: 'Set complet 30p', price: 320 }
        ]
    },
    {
        id: 'chambre-froide', name: 'Chambre froide positive', category: 'stockage', sub: 'Froid', icon: '🏠', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Combisteel', model: 'Mini 1.5m³', price: 1800 },
            { level: 'Intermédiaire', brand: 'Dagard', model: 'Modulaire 3m³', price: 3500 },
            { level: 'Professionnel', brand: 'Dagard', model: 'Pro 6m³ sol inclus', price: 5800 },
            { level: 'Premium', brand: 'Dagard', model: 'Premium 10m³ double zone', price: 9500 }
        ]
    },
    {
        id: 'armoire', name: 'Armoire de rangement sèche', category: 'stockage', sub: 'Rangement', icon: '🚪', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Vogue', model: '2 portes inox', price: 180 },
            { level: 'Intermédiaire', brand: 'Tournus', model: 'Armoire 3 portes', price: 420 },
            { level: 'Professionnel', brand: 'Tournus', model: 'Armoire haute 4 portes', price: 750 },
            { level: 'Premium', brand: 'Tournus', model: 'Armoire pro modulaire', price: 1100 }
        ]
    },
    {
        id: 'consommables', name: 'Consommables (films, papiers, boîtes)', category: 'stockage', sub: 'Consommables', icon: '📦', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Divers', model: 'Starter pack essentiel', price: 35 },
            { level: 'Intermédiaire', brand: 'Divers', model: 'Pack intermédiaire', price: 85 },
            { level: 'Professionnel', brand: 'Divers', model: 'Pack pro complet', price: 160 },
            { level: 'Premium', brand: 'Divers', model: 'Pack premium 6 mois', price: 280 }
        ]
    }
];

// Category definitions
window.CATEGORIES_INFO = {
    ustensiles: { label: 'Ustensiles & Précision', icon: '🔪', color: '#e67e22', allocation: 0.12 },
    machines: { label: 'Machines & Robots', icon: '🤖', color: '#3498db', allocation: 0.35 },
    cuisson: { label: 'Cuisson & Froid', icon: '🔥', color: '#e74c3c', allocation: 0.35 },
    stockage: { label: 'Stockage & Organisation', icon: '📦', color: '#27ae60', allocation: 0.18 }
};

// Taglines by budget range
window.BUDGET_TAGLINES = [
    { max: 8000, label: 'Labo Artisanal', tagline: 'L\'essentiel pour démarrer votre activité artisanale avec les bases solides du métier.' },
    { max: 15000, label: 'Labo Intermédiaire', tagline: 'Un équipement équilibré pour travailler avec efficacité et régularité au quotidien.' },
    { max: 25000, label: 'Labo Professionnel', tagline: 'Du matériel professionnel de qualité pour un travail d\'excellence et de précision.' },
    { max: 38000, label: 'Labo Haute Performance', tagline: 'Un laboratoire haut de gamme avec des équipements de référence dans le métier.' },
    { max: 99999, label: 'Labo Premium Semi-Industriel', tagline: 'L\'excellence absolue : un laboratoire équipé des meilleures marques professionnelles.' }
];

// ── PHASE 3 — MODE SPECIALISATIONS ──
window.MODE_CONFIGS = {
    standard: { label: 'Configuration Standard', icon: '📋', desc: 'Laboratoire polyvalent pour toutes activités pâtissières.', essentials: [], excludes: [], boosts: [] },
    patisserie: { label: 'Pâtisserie Boutique', icon: '🧁', desc: 'Configuration idéale pour une pâtisserie artisanale de quartier.', essentials: ['tempereuse', 'cercles', 'silpat'], excludes: [], boosts: ['batteur', 'four', 'moules', 'cercles', 'silpat'] },
    chocolatier: { label: 'Chocolatier', icon: '🍫', desc: 'Atelier spécialisé dans le travail du chocolat et de la confiserie.', essentials: ['tempereuse', 'thermo-laser'], excludes: ['laminoir', 'fermentation'], boosts: ['tempereuse', 'thermo-sonde', 'thermo-laser', 'cellule'] },
    viennoiserie: { label: 'Viennoiserie', icon: '🥐', desc: 'Production de viennoiseries, pains spéciaux et brioches.', essentials: ['laminoir', 'fermentation'], excludes: ['tempereuse'], boosts: ['laminoir', 'fermentation', 'four', 'batteur'] },
    traiteur: { label: 'Traiteur', icon: '🍽️', desc: 'Service traiteur, desserts à l\'assiette et événementiel.', essentials: ['induction', 'cellule'], excludes: ['tempereuse', 'laminoir'], boosts: ['four', 'frigo', 'congelateur', 'induction', 'cellule', 'gastro'] }
};

// ── EQUIPMENT FLOOR DIMENSIONS (meters) for 2D/3D ──
window.EQUIPMENT_DIMS = {
    'batteur': { w: 0.5, d: 0.6, h: 1.2, color: '#3498db', floor: true, label: 'Batteur' },
    'robot-coupe': { w: 0.4, d: 0.5, h: 0.5, color: '#9b59b6', floor: true, label: 'Robot Coupe' },
    'laminoir': { w: 0.7, d: 1.4, h: 1.0, color: '#1abc9c', floor: true, label: 'Laminoir' },
    'tempereuse': { w: 0.5, d: 0.7, h: 1.0, color: '#8b4513', floor: true, label: 'Tempéreuse' },
    'four': { w: 0.9, d: 0.85, h: 1.8, color: '#e74c3c', floor: true, label: 'Four' },
    'cellule': { w: 0.8, d: 0.8, h: 2.0, color: '#00bcd4', floor: true, label: 'Cellule froid' },
    'fermentation': { w: 0.8, d: 0.9, h: 2.0, color: '#ff9800', floor: true, label: 'Ch. fermentation' },
    'induction': { w: 0.4, d: 0.6, h: 0.9, color: '#607d8b', floor: true, label: 'Plaque induction' },
    'frigo': { w: 0.7, d: 0.8, h: 2.0, color: '#2196f3', floor: true, label: 'Réfrigérateur' },
    'congelateur': { w: 0.7, d: 0.8, h: 2.0, color: '#0d47a1', floor: true, label: 'Congélateur' },
    'etageres': { w: 0.5, d: 1.5, h: 1.8, color: '#78909c', floor: true, label: 'Étagères' },
    'chambre-froide': { w: 1.5, d: 2.0, h: 2.4, color: '#4fc3f7', floor: true, label: 'Chambre froide' },
    'armoire': { w: 0.6, d: 1.2, h: 2.0, color: '#90a4ae', floor: true, label: 'Armoire' },
    'table': { w: 0.8, d: 2.0, h: 0.9, color: '#bdbdbd', floor: true, label: 'Table de travail' },
    'evier': { w: 0.6, d: 1.2, h: 0.9, color: '#42a5f5', floor: true, label: 'Évier double' },
    'porte': { w: 0.1, d: 1.0, h: 2.1, color: '#795548', floor: true, label: 'Porte' }
};

// Budget allocation algorithm with mode support
window.selectEquipment = function (budget, mode) {
    mode = mode || 'standard';
    const mc = window.MODE_CONFIGS[mode] || window.MODE_CONFIGS.standard;
    const tierIndex = budget < 10000 ? 0 : budget < 20000 ? 1 : budget < 35000 ? 2 : 3;
    const results = [];
    let total = 0;
    const boostSet = new Set(mc.boosts);
    const excludeSet = new Set(mc.excludes);

    // Build items list with mode overrides
    let items = EQUIPMENT_DB.filter(eq => !excludeSet.has(eq.id)).map(eq => ({
        ...eq,
        essential: eq.essential || mc.essentials.includes(eq.id),
        boosted: boostSet.has(eq.id)
    }));

    // Sort: boosted first, then essential, then rest
    items.sort((a, b) => {
        if (a.boosted !== b.boosted) return b.boosted ? 1 : -1;
        if (a.essential !== b.essential) return a.essential ? -1 : 1;
        return 0;
    });

    // Pass 1: essentials
    const essentials = items.filter(e => e.essential);
    const optionals = items.filter(e => !e.essential);

    essentials.forEach(eq => {
        const tier = eq.tiers[Math.min(tierIndex, eq.tiers.length - 1)];
        results.push({ ...eq, selected: tier });
        total += tier.price;
    });

    // Pass 2: optionals within remaining budget
    const remaining = budget - total;
    let spent = 0;
    optionals.sort((a, b) => {
        const pa = a.tiers[Math.min(tierIndex, a.tiers.length - 1)].price;
        const pb = b.tiers[Math.min(tierIndex, b.tiers.length - 1)].price;
        return (a.boosted ? -10000 : 0) + pa - ((b.boosted ? -10000 : 0) + pb);
    });
    optionals.forEach(eq => {
        for (let t = Math.min(tierIndex, eq.tiers.length - 1); t >= 0; t--) {
            if (spent + eq.tiers[t].price <= remaining) {
                results.push({ ...eq, selected: eq.tiers[t] });
                spent += eq.tiers[t].price;
                total += eq.tiers[t].price;
                break;
            }
        }
    });

    // Pass 3: upgrade if budget allows
    for (let i = 0; i < results.length && total < budget; i++) {
        const eq = results[i];
        const ci = eq.tiers.findIndex(t => t.price === eq.selected.price);
        if (ci < eq.tiers.length - 1) {
            const diff = eq.tiers[ci + 1].price - eq.selected.price;
            if (diff <= budget - total) { total += diff; results[i].selected = eq.tiers[ci + 1]; }
        }
    }

    return { results, total };
};

// Save/load config for 2D/3D pages
function getLabConfigKey() {
    const user = localStorage.getItem('gourmet_current_user') || 'Ami';
    return `labpatiss_config_${user.toLowerCase()}`;
}

window.saveConfig = function (budget, mode, results, total) {
    localStorage.setItem(getLabConfigKey(), JSON.stringify({ budget, mode, results: results.map(r => ({ id: r.id, name: r.name, icon: r.icon, category: r.category, selected: r.selected })), total, ts: Date.now() }));
};
window.loadConfig = function () {
    try { return JSON.parse(localStorage.getItem(getLabConfigKey())); } catch { return null; }
};

