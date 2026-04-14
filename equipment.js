/* Equipment Database — LabPâtiss' Configurateur */
window.EQUIPMENT_DB = [
    // ── USTENSILES & PETIT ÉQUIPEMENT ──
    {
        id: 'couteaux', name: "Jeu de couteaux d'office", category: 'ustensiles', sub: 'Couteaux', icon: '🔪', essential: true, tiers: [
            { level: 'Accessoire', brand: 'Pradel', model: 'Eco Set 2p', price: 15 },
            { level: 'Entrée de gamme', brand: 'Pradel Excellence', model: 'Set Essentiel 3p', price: 35 },
            { level: 'Standard', brand: 'Deglon', model: 'Gamme Stop-Glisse', price: 65 },
            { level: 'Intermédiaire', brand: 'Victorinox', model: 'Swiss Classic Set 5p', price: 89 },
            { level: 'Avancé', brand: 'Sabtier', model: 'L\'Unique 4p', price: 130 },
            { level: 'Professionnel', brand: 'Wüsthof', model: 'Grand Prix II Set', price: 185 },
            { level: 'Expert', brand: 'Global', model: 'Set G-257 Chef', price: 260 },
            { level: 'Premium', brand: 'Kai Shun', model: 'Classic DMS-300', price: 340 }
        ]
    },
    {
        id: 'spatules', name: 'Spatules droites et coudées', category: 'ustensiles', sub: 'Spatules', icon: '🥄', essential: true, tiers: [
            { level: 'Accessoire', brand: 'Generic', model: 'Lot 2 spatules inox', price: 12 },
            { level: 'Entrée de gamme', brand: 'Mallard Ferrière', model: 'Set 3 spatules', price: 22 },
            { level: 'Standard', brand: 'Paderno', model: 'Gamme 12900', price: 38 },
            { level: 'Intermédiaire', brand: 'De Buyer', model: 'Set Giesser 4p', price: 45 },
            { level: 'Avancé', brand: 'Triangle', model: 'Set Pro 5p', price: 75 },
            { level: 'Professionnel', brand: 'Matfer Bourgeat', model: 'Set professionnel 5p', price: 95 },
            { level: 'Expert', brand: 'Dick', model: 'Premier Plus Set', price: 130 },
            { level: 'Premium', brand: 'JB Prince', model: 'Set complet 8p', price: 160 }
        ]
    },
    {
        id: 'maryses', name: 'Maryses, cornes et raclettes', category: 'ustensiles', sub: 'Maryses', icon: '🥣', essential: true, tiers: [
            { level: 'Accessoire', brand: 'Generic', model: 'Lot 3 maryses eco', price: 8 },
            { level: 'Entrée de gamme', brand: 'Mallard Ferrière', model: 'Set silicone 4p', price: 18 },
            { level: 'Standard', brand: 'Oxo', model: 'Good Grips Pro', price: 28 },
            { level: 'Intermédiaire', brand: 'De Buyer', model: 'Set Moul\'flex 6p', price: 35 },
            { level: 'Avancé', brand: 'Le Creuset', model: 'Set Pro silicone', price: 52 },
            { level: 'Professionnel', brand: 'Matfer Bourgeat', model: 'Set Exoglass 8p', price: 65 },
            { level: 'Expert', brand: 'Vollrath', model: 'HeatSheild Set', price: 88 },
            { level: 'Premium', brand: 'Silikomart', model: 'Set premium 10p', price: 110 }
        ]
    },
    {
        id: 'fouets', name: 'Fouets et mélangeurs manuels', category: 'ustensiles', sub: 'Fouets', icon: '🫘', essential: true, tiers: [
            { level: 'Eco', brand: 'Generic', model: 'Set 2p', price: 10 },
            { level: 'Standard', brand: 'De Buyer', model: 'Fouet inox', price: 22 },
            { level: 'Pro', brand: 'Matfer', model: 'Set performance', price: 45 },
            { level: 'Inter', brand: 'Mastrad', model: 'Set 3p Silicone', price: 65 },
            { level: 'Avancé', brand: 'Rösle', model: 'Set Expert', price: 95 },
            { level: 'Expert', brand: 'JB Prince', model: 'Master collection', price: 130 },
            { level: 'Master', brand: 'De Buyer', model: 'Set Prestige', price: 185 },
            { level: 'Premium', brand: 'Mauviel', model: 'Cuivre Collection', price: 260 }
        ]
    },
    {
        id: 'mixeur', name: 'Mixeur plongeant professionnel', category: 'ustensiles', sub: 'Électrique', icon: '⚡', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Moulinex', model: 'Quickchef 800W', price: 65 },
            { level: 'Standard', brand: 'Bosch', model: 'ErgoMixx 1000W', price: 95 },
            { level: 'Intermédiaire', brand: 'Bamix', model: 'Mono M140', price: 140 },
            { level: 'Avancé', brand: 'Bamix', model: 'Gastro 200', price: 210 },
            { level: 'Professionnel', brand: 'Robot Coupe', model: 'MicroMix', price: 290 },
            { level: 'Expert', brand: 'Robot Coupe', model: 'CMP 300 Combi', price: 420 },
            { level: 'Master', brand: 'Dynamic', model: 'Junior Combi', price: 540 },
            { level: 'Premium', brand: 'Dynamic', model: 'MX091 Master', price: 680 }
        ]
    },
    {
        id: 'balance-prec', name: 'Balance de précision', category: 'ustensiles', sub: 'Mesure', icon: '⚖️', essential: true, tiers: [
            { level: 'Accessoire', brand: 'Generic', model: 'Digit 2000/0.1g', price: 12 },
            { level: 'Entrée de gamme', brand: 'Terraillon', model: 'Macaron 5kg', price: 28 },
            { level: 'Standard', brand: 'Duronic', model: 'KS5000', price: 35 },
            { level: 'Intermédiaire', brand: 'Soehnle', model: 'Page Profi 15kg', price: 62 },
            { level: 'Avancé', brand: 'Kern', model: 'EMS 3000', price: 95 },
            { level: 'Professionnel', brand: 'Ohaus', model: 'Navigator NV2201', price: 165 },
            { level: 'Expert', brand: 'Sartorius', model: 'Entris II', price: 340 },
            { level: 'Premium', brand: 'Adam Equipment', model: 'Nimbus 0.01g', price: 520 }
        ]
    },
    {
        id: 'thermo-sonde', name: 'Thermomètre à sonde', category: 'ustensiles', sub: 'Mesure', icon: '🌡️', essential: true, tiers: [
            { level: 'Eco', brand: 'Hanna', model: 'Basic', price: 15 },
            { level: 'Standard', brand: 'Mastrad', model: 'Pro Digital', price: 32 },
            { level: 'Pro', brand: 'Testo', model: '104', price: 58 },
            { level: 'Inter', brand: 'ETI', model: 'Thermapen One', price: 89 },
            { level: 'Avancé', brand: 'Testo', model: '108-2 Pro', price: 145 },
            { level: 'Expert', brand: 'ETI', model: 'ThermaQ 2', price: 230 },
            { level: 'Master', brand: 'Fluke', model: '52 II Dual', price: 380 },
            { level: 'Premium', brand: 'Reference', model: 'High Spec Lab', price: 540 }
        ]
    },
    {
        id: 'thermo-laser', name: 'Thermomètre infrarouge laser', category: 'ustensiles', sub: 'Mesure', icon: '🎯', essential: false, tiers: [
            { level: 'Eco', brand: 'Generic', model: 'Laser basic', price: 25 },
            { level: 'Standard', brand: 'Mastrad', model: 'Laser', price: 55 },
            { level: 'Pro', brand: 'Testo', model: '830-T1', price: 95 },
            { level: 'Inter', brand: 'Fluke', model: '62 Max', price: 145 },
            { level: 'Avancé', brand: 'Testo', model: '835-T1', price: 210 },
            { level: 'Expert', brand: 'Fluke', model: '59 Mini Pro', price: 340 },
            { level: 'Master', brand: 'Fluke', model: '572-2', price: 680 },
            { level: 'Premium', brand: 'High Accuracy', model: 'Lab Grade', price: 950 }
        ]
    },
    {
        id: 'culdpoule', name: 'Culs-de-poule inox (set)', category: 'ustensiles', sub: 'Contenants', icon: '🥗', essential: true, tiers: [
            { level: 'Eco', brand: 'Vogue', model: 'Set 3p', price: 22 },
            { level: 'Standard', brand: 'Mallard', model: 'Set 5p', price: 45 },
            { level: 'Pro', brand: 'De Buyer', model: 'Set 6p Silicone', price: 85 },
            { level: 'Inter', brand: 'Matfer', model: 'Set Expert', price: 130 },
            { level: 'Avancé', brand: 'Mauviel', model: 'Set Passion 5p', price: 195 },
            { level: 'Expert', brand: 'Mauviel', model: 'Set Passion 8p', price: 280 },
            { level: 'Master', brand: 'Mauviel', model: 'Heritage Suite', price: 450 },
            { level: 'Premium', brand: 'Prestige', model: 'Copper Collection', price: 720 }
        ]
    },
    {
        id: 'gastro', name: 'Bacs gastronormes GN inox', category: 'ustensiles', sub: 'Contenants', icon: '📦', essential: true, tiers: [
            { level: 'Eco', brand: 'Vogue', model: 'Set 4p', price: 38 },
            { level: 'Standard', brand: 'Vogue', model: 'Set 8p', price: 75 },
            { level: 'Pro', brand: 'Matfer', model: 'Set 10p', price: 145 },
            { level: 'Inter', brand: 'De Buyer', model: 'Set performance', price: 260 },
            { level: 'Avancé', brand: 'Blanco', model: 'Professional kit', price: 420 },
            { level: 'Expert', brand: 'Rieber', model: 'Set Airtight', price: 680 },
            { level: 'Master', brand: 'Industrial', model: 'High Cap System', price: 950 },
            { level: 'Premium', brand: 'Prestige', model: 'Stainless Suite', price: 1350 }
        ]
    },

    // ── MACHINES & GROS MATÉRIEL ──
    {
        id: 'batteur', name: 'Batteur-mélangeur planétaire', category: 'machines', sub: 'Robots', icon: '🤖', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Kenwood', model: 'Prospero 4.3L', price: 250 },
            { level: 'Standard', brand: 'KitchenAid', model: 'Artisan 4.8L', price: 480 },
            { level: 'Intermédiaire', brand: 'Kenwood', model: 'Chef XL 6.7L', price: 720 },
            { level: 'Avancé', brand: 'KitchenAid', model: 'Heavy Duty 6.9L', price: 950 },
            { level: 'Expert', brand: 'Santos', model: 'N°27 10L', price: 1800 },
            { level: 'Professionnel', brand: 'Hobart', model: 'N50 5L Pro', price: 2950 },
            { level: 'Master', brand: 'Dito Sama', model: 'BE5 5L', price: 3800 },
            { level: 'Premium', brand: 'Hobart', model: 'HSM20 20L Premium', price: 6200 }
        ]
    },
    {
        id: 'robot-coupe', name: 'Robot Coupe / Cutter', category: 'machines', sub: 'Robots', icon: '🌪️', essential: true, tiers: [
            { level: 'Eco', brand: 'Moulinex', model: 'Home', price: 145 },
            { level: 'Standard', brand: 'Magimix', model: '3200XL', price: 280 },
            { level: 'Pro', brand: 'Robot Coupe', model: 'R 201 XL', price: 480 },
            { level: 'Inter', brand: 'Robot Coupe', model: 'R 301 Ultra', price: 850 },
            { level: 'Avancé', brand: 'Robot Coupe', model: 'R 4 V.V.', price: 1450 },
            { level: 'Expert', brand: 'Robot Coupe', model: 'R 5 Plus', price: 2200 },
            { level: 'Master', brand: 'Robot Coupe', model: 'R 8 V.V.', price: 3800 },
            { level: 'Premium', brand: 'Robot Coupe', model: 'R 15 V.V. Industriel', price: 6500 }
        ]
    },
    {
        id: 'petrin', name: 'Pétrin à spirale', category: 'machines', sub: 'Robots', icon: '🥣', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Fimar', model: '7/SN 7kg', price: 750 },
            { level: 'Standard', brand: 'Famags', model: 'IM 8 8kg', price: 980 },
            { level: 'Intermédiaire', brand: 'Sunmix', model: 'Sun6 6kg', price: 1250 },
            { level: 'Avancé', brand: 'Resto Italia', model: 'SK 20 20L', price: 1850 },
            { level: 'Professionnel', brand: 'Esmach', model: 'SPI 30 30kg', price: 3400 },
            { level: 'Expert', brand: 'VMI', model: 'Spiral Evomix 45kg', price: 5200 },
            { level: 'Master', brand: 'Bongard', model: 'Spiral 70kg', price: 8500 },
            { level: 'Premium', brand: 'VMI', model: 'SPI 160 semi-industriel', price: 14500 }
        ]
    },
    {
        id: 'laminoir', name: 'Laminoir à pâte', category: 'machines', sub: 'Façonnage', icon: '📏', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Imperia', model: 'Manual 150', price: 85 },
            { level: 'Standard', brand: 'KitchenAid', model: 'Module Laminoir', price: 195 },
            { level: 'Intermédiaire', brand: 'Imperia', model: 'Restaurant Electric', price: 720 },
            { level: 'Avancé', brand: 'Pavailler', model: 'Laminoir de table', price: 1850 },
            { level: 'Professionnel', brand: 'Rondo', model: 'STM 513 Pro', price: 3200 },
            { level: 'Expert', brand: 'Seewer Rondo', model: 'Econom 4000', price: 5800 },
            { level: 'Master', brand: 'Rondo', model: 'Doge 6000', price: 9500 },
            { level: 'Premium', brand: 'Rondo', model: 'Compas 3.0 Auto', price: 18500 }
        ]
    },
    {
        id: 'chefcut', name: 'Découpe jet d\'eau (ChefCut)', category: 'machines', sub: 'Découpe', icon: '💧', essential: false, tiers: [
            { level: 'Expert', brand: 'Hydroprocess', model: 'ChefCut CC250', price: 65000 },
            { level: 'Master', brand: 'Hydroprocess', model: 'ChefCut CC350', price: 85000 },
            { level: 'Premium', brand: 'Hydroprocess', model: 'ChefCut CC500 Industriel', price: 120000 }
        ]
    },
    {
        id: 'tempereuse', name: 'Tempéreuse à chocolat', category: 'machines', sub: 'Chocolat', icon: '🍫', essential: false, tiers: [
            { level: 'Eco', brand: 'ICB', model: 'Mini 5L', price: 340 },
            { level: 'Standard', brand: 'Mol d\'Art', model: '12kg', price: 890 },
            { level: 'Pro', brand: 'Mol d\'Art', model: '24kg Expert', price: 1650 },
            { level: 'Inter', brand: 'Selmi', model: 'Color EX 12kg', price: 5800 },
            { level: 'Avancé', brand: 'Selmi', model: 'Plus EX 24kg', price: 9800 },
            { level: 'Expert', brand: 'Selmi', model: 'Futura 35kg', price: 16500 },
            { level: 'Master', brand: 'Selmi', model: 'One 100kg', price: 28000 },
            { level: 'Premium', brand: 'Selmi', model: 'Industrial Suite', price: 45000 }
        ]
    },

    // ── CUISSON & FROID ──
    {
        id: 'four', name: 'Four professionnel ventilé', category: 'cuisson', sub: 'Fours', icon: '🔥', essential: true, tiers: [
            { level: 'Entrée de gamme', brand: 'Hkoenig', model: 'V65 Convection', price: 350 },
            { level: 'Standard', brand: 'Burco', model: 'BC CTC001', price: 850 },
            { level: 'Intermédiaire', brand: 'UNOX', model: 'Anna 4 niv', price: 1650 },
            { level: 'Avancé', brand: 'Pavailler', model: 'Topaze Style 4', price: 2800 },
            { level: 'Professionnel', brand: 'UNOX', model: 'Bakerlux SHOP.Pro', price: 4200 },
            { level: 'Expert', brand: 'Rational', model: 'iCombi Classic 6', price: 7500 },
            { level: 'Master', brand: 'Rational', model: 'iCombi Pro 6', price: 11500 },
            { level: 'Premium', brand: 'Rational', model: 'iCombi Pro 10-2/1', price: 18500 }
        ]
    },
    {
        id: 'four-sole', name: 'Four à sole (Boulangerie)', category: 'cuisson', sub: 'Fours', icon: '🧱', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Resto Italia', model: 'Start 1 Mono', price: 1250 },
            { level: 'Standard', brand: 'GGF', model: 'Micro 1 chambre', price: 2800 },
            { level: 'Intermédiaire', brand: 'Moretti Forni', model: 'SerieS 50', price: 5500 },
            { level: 'Avancé', brand: 'Pavailler', model: 'Emeraude 2 bouches', price: 12500 },
            { level: 'Professionnel', brand: 'Bongard', model: 'Soave 3 étages', price: 24000 },
            { level: 'Expert', brand: 'Tagliavini', model: 'Tronik Modular', price: 38000 },
            { level: 'Master', brand: 'Bongard', model: 'Orion EVO 4 bouches', price: 55000 },
            { level: 'Premium', brand: 'Tagliavini', model: 'Anniversary 5 étages XL', price: 82000 }
        ]
    },
    {
        id: 'fermentation', name: 'Chambre de fermentation', category: 'cuisson', sub: 'Fermentation', icon: '🫗', essential: false, tiers: [
            { level: 'Eco', brand: 'Generic', model: 'ProofBox', price: 380 },
            { level: 'Standard', brand: 'Hengel', model: 'Armoire 8 niv', price: 1450 },
            { level: 'Pro', brand: 'Bongard', model: 'BFC Evo 1 porte', price: 2950 },
            { level: 'Inter', brand: 'Bongard', model: 'BFC Evo 2 portes', price: 4800 },
            { level: 'Avancé', brand: 'Hengel', model: 'Expert Pro', price: 7500 },
            { level: 'Expert', brand: 'Pavailler', model: 'Industriel', price: 12500 },
            { level: 'Master', brand: 'Vision', model: 'Premium Auto', price: 18500 },
            { level: 'Premium', brand: 'Custom', model: 'Bakery Lab HighSpec', price: 28000 }
        ]
    },
    {
        id: 'induction', name: 'Plaque de cuisson induction', category: 'cuisson', sub: 'Cuisson', icon: '🫕', essential: false, tiers: [
            { level: 'Eco', brand: 'Bartscher', model: 'IK 35', price: 125 },
            { level: 'Standard', brand: 'Adventys', model: '3500W', price: 380 },
            { level: 'Pro', brand: 'Adventys', model: 'Double Pro', price: 950 },
            { level: 'Inter', brand: 'De Buyer', model: 'Double FE', price: 1550 },
            { level: 'Avancé', brand: 'Berner', model: 'Dual zone', price: 2800 },
            { level: 'Expert', brand: 'Berner', model: 'Quad High Spec', price: 4500 },
            { level: 'Master', brand: 'Industrial', model: 'High Output Suite', price: 7800 },
            { level: 'Premium', brand: 'Custom', model: 'Chef Island Suite', price: 14500 }
        ]
    },
    {
        id: 'frigo', name: 'Réfrigérateur positif professionnel', category: 'cuisson', sub: 'Froid', icon: '🧊', essential: true, tiers: [
            { level: 'Accessoire', brand: 'Beko', model: 'Eco 300L', price: 320 },
            { level: 'Entrée de gamme', brand: 'Polar', model: 'Serie C 400L', price: 580 },
            { level: 'Standard', brand: 'Polar', model: 'Serie G 600L', price: 850 },
            { level: 'Intermédiaire', brand: 'Liebherr', model: 'GKPv 6513 Pro', price: 1550 },
            { level: 'Avancé', brand: 'Liebherr', model: 'Profiline 850L', price: 2400 },
            { level: 'Professionnel', brand: 'Foster', model: 'EcoShow 600L', price: 3800 },
            { level: 'Expert', brand: 'Electrolux', model: 'Ecostore 700L', price: 5200 },
            { level: 'Premium', brand: 'Williams', model: 'Jade High Spec 900L', price: 7800 }
        ]
    },
    {
        id: 'congelateur', name: 'Congélateur négatif', category: 'cuisson', sub: 'Froid', icon: '🥶', essential: true, tiers: [
            { level: 'Accessoire', brand: 'Generic', model: 'Box 200L', price: 280 },
            { level: 'Entrée de gamme', brand: 'Polar', model: 'Serie C -18°C', price: 620 },
            { level: 'Standard', brand: 'Liebherr', model: 'GGPv 4500', price: 950 },
            { level: 'Intermédiaire', brand: 'Liebherr', model: 'GGPv 6513', price: 1850 },
            { level: 'Avancé', brand: 'Electrolux', model: 'Ecostore Negative', price: 2800 },
            { level: 'Professionnel', brand: 'Foster', model: 'EcoPro G2', price: 4200 },
            { level: 'Expert', brand: 'Gram', model: 'Superior Plus K84', price: 6500 },
            { level: 'Premium', brand: 'Electrolux', model: 'Ecostore HP 1400L', price: 9800 }
        ]
    },
    {
        id: 'cellule', name: 'Cellule de refroidissement', category: 'cuisson', sub: 'Froid', icon: '❄️', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Polar', model: '3 niveaux Compact', price: 950 },
            { level: 'Standard', brand: 'Frenox', model: 'C5 5 niveaux', price: 1650 },
            { level: 'Intermédiaire', brand: 'Hoshizaki', model: 'DCM-60A', price: 2850 },
            { level: 'Avancé', brand: 'Tactronic', model: 'T5 Multi', price: 4200 },
            { level: 'Professionnel', brand: 'Irinox', model: 'Ef 10.1 Multi', price: 6800 },
            { level: 'Expert', brand: 'Irinox', model: 'MF 30.2 Plus', price: 10500 },
            { level: 'Master', brand: 'Irinox', model: 'MF 70.2 Deluxe', price: 16500 },
            { level: 'Premium', brand: 'Irinox', model: 'Multifresh Next Large', price: 24500 }
        ]
    },
    {
        id: 'plaques', name: 'Plaques pâtissières & grilles (set)', category: 'cuisson', sub: 'Supports', icon: '🍪', essential: true, tiers: [
            { level: 'Eco', brand: 'Vogue', model: 'Set 5p Alu', price: 48 },
            { level: 'Standard', brand: 'De Buyer', model: 'Set 10p', price: 125 },
            { level: 'Pro', brand: 'Matfer', model: 'Expert Collection', price: 280 },
            { level: 'Inter', brand: 'Mauviel', model: 'Set 12p', price: 450 },
            { level: 'Avancé', brand: 'Gobel', model: 'Prestige Set 20p', price: 680 },
            { level: 'Expert', brand: 'Mauviel', model: 'Professional Suite', price: 950 },
            { level: 'Master', brand: 'High Cap', model: 'Industrial Suite', price: 1450 },
            { level: 'Premium', brand: 'Prestige', model: 'Complete Lab Suite', price: 2200 }
        ]
    },
    {
        id: 'silpat', name: 'Silpat & tapis de cuisson', category: 'cuisson', sub: 'Supports', icon: '📋', essential: false, tiers: [
            { level: 'Eco', brand: 'Silpat', model: 'Set 3p', price: 28 },
            { level: 'Standard', brand: 'Silpat', model: 'Set 6p', price: 65 },
            { level: 'Pro', brand: 'Demarle', model: 'Expert Kit', price: 145 },
            { level: 'Inter', brand: 'Silkomart', model: 'Set 10p', price: 230 },
            { level: 'Avancé', brand: 'Demarle', model: 'Large Suite', price: 380 },
            { level: 'Expert', brand: 'Demarle', model: 'Industrial Set', price: 650 },
            { level: 'Master', brand: 'Prestige', model: 'Master Suite', price: 980 },
            { level: 'Premium', brand: 'Custom', model: 'Professional Academy kit', price: 1650 }
        ]
    },
    {
        id: 'cercles', name: 'Cercles & cadres inox', category: 'cuisson', sub: 'Moules', icon: '⭕', essential: false, tiers: [
            { level: 'Eco', brand: 'De Buyer', model: 'Basic 5p', price: 25 },
            { level: 'Standard', brand: 'Matfer', model: 'Set 10p', price: 65 },
            { level: 'Pro', brand: 'Pavoni', model: 'Microperforé set', price: 110 },
            { level: 'Inter', brand: 'De Buyer', model: 'Expert Kit 15p', price: 180 },
            { level: 'Avancé', brand: 'Pavoni', model: 'Design Collection', price: 280 },
            { level: 'Expert', brand: 'Pavoni', model: 'Master Suite', price: 420 },
            { level: 'Master', brand: 'Prestige', model: 'Academy Suite', price: 650 },
            { level: 'Premium', brand: 'Custom', model: 'Pastry Lab Suite', price: 950 }
        ]
    },
    {
        id: 'moules', name: 'Moules variés (entremets, tartes)', category: 'cuisson', sub: 'Moules', icon: '🧁', essential: true, tiers: [
            { level: 'Eco', brand: 'Gobel', model: 'Set 6p', price: 28 },
            { level: 'Standard', brand: 'Silikomart', model: 'Set 8p', price: 75 },
            { level: 'Pro', brand: 'Silikomart', model: 'Expert Kit', price: 145 },
            { level: 'Inter', brand: 'Pavoni', model: 'Pavoflex Set', price: 260 },
            { level: 'Avancé', brand: 'Silikomart', model: 'Master collection', price: 420 },
            { level: 'Expert', brand: 'Pavoni', model: 'Collection Expert', price: 680 },
            { level: 'Master', brand: 'High End', model: 'Design Suite', price: 950 },
            { level: 'Premium', brand: 'Prestige', model: 'Full Academy Suite', price: 1450 }
        ]
    },

    // ── STOCKAGE & ORGANISATION ──
    {
        id: 'etageres', name: 'Étagères inox professionnelles', category: 'stockage', sub: 'Rangement', icon: '🗄️', essential: true, tiers: [
            { level: 'Eco', brand: 'Generic', model: 'Rayonage 4 niv alu', price: 85 },
            { level: 'Entrée de gamme', brand: 'Vogue', model: 'L120cm Inox', price: 145 },
            { level: 'Standard', brand: 'Tournus', model: 'Gamme Espace', price: 260 },
            { level: 'Intermédiaire', brand: 'Tournus', model: 'Set 2 modules', price: 480 },
            { level: 'Avancé', brand: 'Tournus', model: 'Set 3 modules Pro', price: 850 },
            { level: 'Professionnel', brand: 'Fermostock', model: 'Serie 6611 Pro', price: 1450 },
            { level: 'Expert', brand: 'Tournus', model: 'Rayonnage Intensif 5m', price: 2800 },
            { level: 'Premium', brand: 'Fermostock', model: 'Chambre Froide Setup', price: 4500 }
        ]
    },
    {
        id: 'chambre-froide', name: 'Chambre froide positive', category: 'stockage', sub: 'Froid', icon: '🏠', essential: false, tiers: [
            { level: 'Entrée de gamme', brand: 'Combisteel', model: 'Box 120', price: 2200 },
            { level: 'Standard', brand: 'Mercatus', model: 'Compact 3m³', price: 3400 },
            { level: 'Intermédiaire', brand: 'Dagard', model: 'Modulaire 4m³', price: 4500 },
            { level: 'Avancé', brand: 'Dagard', model: 'Pro 6m³ Renforcée', price: 6800 },
            { level: 'Professionnel', brand: 'Dagard', model: 'Teryal 8m³ Expert', price: 9500 },
            { level: 'Expert', brand: 'Dagard', model: 'Premium 12m³ XL', price: 14500 },
            { level: 'Master', brand: 'Dagard', model: 'Double Zone Bi-temp', price: 22000 },
            { level: 'Premium', brand: 'Dagard', model: 'Sur mesure Industriel', price: 35000 }
        ]
    },
    {
        id: 'armoire', name: 'Armoire de rangement sèche', category: 'stockage', sub: 'Rangement', icon: '🚪', essential: false, tiers: [
            { level: 'Eco', brand: 'Vogue', model: 'Basic 2 doors', price: 195 },
            { level: 'Standard', brand: 'Tournus', model: 'L120 Stainless', price: 450 },
            { level: 'Pro', brand: 'Matfer', model: 'Expert Rangement', price: 780 },
            { level: 'Inter', brand: 'Tournus', model: 'High Spec 3 doors', price: 1250 },
            { level: 'Avancé', brand: 'Tournus', model: 'Industriel 4 doors', price: 2100 },
            { level: 'Expert', brand: 'Prestige', model: 'Master Suite', price: 3400 },
            { level: 'Master', brand: 'Custom', model: 'Lab Suite', price: 5500 },
            { level: 'Premium', brand: 'Legendary', model: 'Professional Suite', price: 8900 }
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
    { max: 15000, label: 'Labo Artisanal', tagline: 'L\'essentiel pour démarrer votre activité artisanale avec les bases solides du métier.' },
    { max: 45000, label: 'Labo Intermédiaire', tagline: 'Un équipement équilibré pour travailler avec efficacité et régularité au quotidien.' },
    { max: 85000, label: 'Labo Professionnel', tagline: 'Du matériel professionnel de qualité pour un travail d\'excellence et de précision.' },
    { max: 150000, label: 'Labo Haute Performance', tagline: 'Un laboratoire haut de gamme avec des équipements de référence dans le métier.' },
    { max: 250000, label: 'Labo Premium Expert', tagline: 'L\'excellence absolue : un laboratoire équipé des meilleures marques professionnelles.' },
    { max: 380000, label: 'Labo Semi-Industriel', tagline: 'Une capacité de production industrielle avec des équipements de haute technologie.' },
    { max: 500000, label: 'Labo Industriel / Prestige XL', tagline: 'Le summum de l\'équipement : performance maximale, durabilité extrême et automation pour gros volumes.' }
];

// ── PHASE 3 — MODE SPECIALISATIONS ──
window.MODE_CONFIGS = {
    standard: { label: 'Configuration Standard', icon: '📋', desc: 'Laboratoire polyvalent pour toutes activités pâtissières.', essentials: [], excludes: ['four-sole', 'petrin'], boosts: [] },
    patisserie: { label: 'Pâtisserie Boutique', icon: '🧁', desc: 'Configuration idéale pour une pâtisserie artisanale de quartier.', essentials: ['tempereuse', 'cercles', 'silpat'], excludes: ['four-sole', 'petrin'], boosts: ['batteur', 'four', 'moules', 'cercles', 'silpat'] },
    chocolatier: { label: 'Chocolatier', icon: '🍫', desc: 'Atelier spécialisé dans le travail du chocolat et de la confiserie.', essentials: ['tempereuse', 'thermo-laser'], excludes: ['laminoir', 'fermentation', 'four-sole', 'petrin'], boosts: ['tempereuse', 'thermo-sonde', 'thermo-laser', 'cellule'] },
    viennoiserie: { label: 'Viennoiserie', icon: '🥐', desc: 'Production de viennoiseries, pains spéciaux et brioches.', essentials: ['laminoir', 'fermentation', 'petrin'], excludes: ['tempereuse', 'four-sole'], boosts: ['laminoir', 'fermentation', 'four', 'batteur', 'petrin'] },
    traiteur: { label: 'Traiteur', icon: '🍽️', desc: 'Service traiteur, desserts à l\'assiette et événementiel.', essentials: ['induction', 'cellule'], excludes: ['tempereuse', 'laminoir', 'four-sole', 'petrin'], boosts: ['four', 'frigo', 'congelateur', 'induction', 'cellule', 'gastro'] },
    boulangerie: { label: 'Boulangerie', icon: '🥖', desc: 'Fournil complet pour la production de pains et baguettes.', essentials: ['four-sole', 'petrin', 'fermentation'], excludes: ['tempereuse'], boosts: ['four-sole', 'petrin', 'fermentation', 'laminoir', 'frigo'] }
};

// ── EQUIPMENT FLOOR DIMENSIONS (meters) for 2D/3D ──
window.EQUIPMENT_DIMS = {
    'batteur': { w: 0.5, d: 0.6, h: 1.2, color: '#3498db', floor: true, label: 'Batteur' },
    'robot-coupe': { w: 0.4, d: 0.5, h: 0.5, color: '#9b59b6', floor: true, label: 'Robot Coupe' },
    'laminoir': { w: 0.7, d: 1.4, h: 1.0, color: '#1abc9c', floor: true, label: 'Laminoir' },
    'chefcut': { w: 1.2, d: 1.2, h: 1.8, color: '#3498db', floor: true, label: 'ChefCut' },
    'tempereuse': { w: 0.5, d: 0.7, h: 1.0, color: '#8b4513', floor: true, label: 'Tempéreuse' },
    'four': { w: 0.9, d: 0.85, h: 1.8, color: '#e74c3c', floor: true, label: 'Four' },
    'four-sole': { w: 1.5, d: 1.8, h: 2.1, color: '#d35400', floor: true, label: 'Four à sole' },
    'petrin': { w: 0.8, d: 0.8, h: 1.4, color: '#7f8c8d', floor: true, label: 'Pétrin' },
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
// Budget allocation algorithm with mode support
window.selectEquipment = function (budget, mode) {
    mode = mode || 'standard';
    const mc = window.MODE_CONFIGS[mode] || window.MODE_CONFIGS.standard;

    // 8 Tiers calculation - Adjusted for 500k range
    let tierIndex = 0;
    if (budget < 25000) tierIndex = 0;
    else if (budget < 60000) tierIndex = 1;
    else if (budget < 110000) tierIndex = 2;
    else if (budget < 180000) tierIndex = 3;
    else if (budget < 260000) tierIndex = 4;
    else if (budget < 350000) tierIndex = 5;
    else if (budget < 440000) tierIndex = 6;
    else tierIndex = 7;

    const results = [];
    let total = 0;
    const boostSet = new Set(mc.boosts);
    const excludeSet = new Set(mc.excludes);

    // Build items list with mode overrides
    let items = EQUIPMENT_DB.filter(eq => !excludeSet.has(eq.id)).map(eq => ({
        ...eq,
        essential: eq.essential || mc.essentials.includes(eq.id) || (budget > 350000 && eq.id === 'chefcut'), // Chefcut essential at high budget
        boosted: boostSet.has(eq.id) || (budget > 250000 && eq.id === 'chefcut') // Boost chefcut at med-high
    }));

    // Sort: boosted first, then essential, then rest
    items.sort((a, b) => {
        if (a.boosted !== b.boosted) return b.boosted ? 1 : -1;
        if (a.essential !== b.essential) return a.essential ? -1 : 1;
        return 0;
    });

    // Helper for quantity scaling
    const getQty = (id, category, currentBudget) => {
        if (currentBudget < 40000) return 1;

        // Small tools scale faster
        const smallTools = ['couteaux', 'spatules', 'maryses', 'fouets', 'pinceaux', 'rapes', 'balance-prec', 'thermo-sonde', 'thermo-laser', 'gastro', 'culdpoule', 'plaques', 'silpat', 'cercles', 'moules', 'bacs-alim', 'consommables'];
        if (smallTools.includes(id)) {
            const factor = Math.floor(currentBudget / 60000); // Scale every 60k (reduced)
            return 1 + factor;
        }

        // Mid-sized and heavy equipment scales slower
        const equipment = ['etageres', 'frigo', 'congelateur', 'table', 'evier', 'batteur', 'petrin'];
        if (equipment.includes(id)) {
            // Boulangerie needs more mixers
            if (id === 'petrin' && mode === 'boulangerie') {
                const factor = Math.floor(currentBudget / 150000);
                return Math.min(4, 1 + factor);
            }
            const factor = Math.floor(currentBudget / 120000); // Scale every 120k (reduced)
            return 1 + factor;
        }

        return 1;
    };

    // Pass 1: essentials
    const essentials = items.filter(e => e.essential);
    const optionals = items.filter(e => !e.essential);

    essentials.forEach(eq => {
        let activeTierIndex = tierIndex;
        // Boost quality for specific items in mode
        if (mode === 'boulangerie' && eq.id === 'four-sole' && budget > 100000) {
            activeTierIndex = Math.min(eq.tiers.length - 1, tierIndex + 1);
        }
        // Pastry oven quality boost
        if (mode === 'patisserie' && eq.id === 'four' && budget > 120000) {
            activeTierIndex = Math.min(eq.tiers.length - 1, tierIndex + 1);
        }

        const tier = eq.tiers[Math.min(activeTierIndex, eq.tiers.length - 1)];
        const qty = getQty(eq.id, eq.category, budget);
        results.push({ ...eq, selected: tier, qty });
        total += tier.price * qty;
    });

    // Pass 2: optionals within remaining budget
    let remaining = budget - total;
    let spent = 0;
    optionals.sort((a, b) => {
        const pa = a.tiers[Math.min(tierIndex, a.tiers.length - 1)].price;
        const pb = b.tiers[Math.min(tierIndex, b.tiers.length - 1)].price;
        return (a.boosted ? -10000 : 0) + pa - ((b.boosted ? -10000 : 0) + pb);
    });

    optionals.forEach(eq => {
        const qty = getQty(eq.id, eq.category, budget);
        for (let t = Math.min(tierIndex, eq.tiers.length - 1); t >= 0; t--) {
            const price = eq.tiers[t].price * qty;
            if (spent + price <= remaining) {
                results.push({ ...eq, selected: eq.tiers[t], qty });
                spent += price;
                total += price;
                break;
            }
        }
    });

    // Pass 3: upgrade if budget allows
    remaining = budget - total;
    for (let i = 0; i < results.length && remaining > 0; i++) {
        const eq = results[i];
        const qty = eq.qty || 1;
        const ci = eq.tiers.findIndex(t => t.price === eq.selected.price);

        if (ci < eq.tiers.length - 1) {
            const diff = (eq.tiers[ci + 1].price - eq.selected.price) * qty;
            if (diff <= remaining) {
                total += diff;
                remaining -= diff;
                results[i].selected = eq.tiers[ci + 1];
            }
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
    localStorage.setItem(getLabConfigKey(), JSON.stringify({ budget, mode, results: results.map(r => ({ id: r.id, name: r.name, icon: r.icon, category: r.category, selected: r.selected, qty: r.qty })), total, ts: Date.now() }));
};
window.loadConfig = function () {
    try { return JSON.parse(localStorage.getItem(getLabConfigKey())); } catch { return null; }
};

