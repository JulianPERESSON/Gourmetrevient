/* ============================================================
   EXAM-SCHEDULER.JS — Moteur Tactique CAP Pâtissier v3.9
   CATALOGUE INTÉGRAL RESTAURÉ (45+ Recettes)
   STYLE : VERT PASTEL 🍏
   ============================================================ */
(function () {
  'use strict';

  /* ============================================================
     EP1 — Tour, petits fours secs et moelleux, gâteaux de voyage
     ============================================================ */
  const EP1 = [
    // VIENNOISERIE & TOUR
    { id:'croissant', name:'Croissants', cat:'Viennoiserie', icon:'🥐', steps:[{n:'Pétrissage PFL',dur:15,type:'MANUAL'},{n:'Pointage',dur:30,type:'RISE'},{n:'Rompre & Dégazer la pâte',dur:5,type:'MANUAL'},{n:'Mise au frais',dur:30,type:'REST'},{n:'Tours 1+2',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tour 3',dur:10,type:'MANUAL'},{n:'Repos froid (Détente)',dur:20,type:'REST'},{n:'Détaillage & Façonnage',dur:15,type:'MANUAL'},{n:'Apprêt',dur:90,type:'RISE'},{n:'Cuisson',dur:15,type:'OVEN'}] },
    { id:'pain_choco', name:'Chocolatine', cat:'Viennoiserie', icon:'🍫', steps:[{n:'Pétrissage PFL',dur:15,type:'MANUAL'},{n:'Pointage',dur:30,type:'RISE'},{n:'Rompre & Dégazer la pâte',dur:5,type:'MANUAL'},{n:'Mise au frais',dur:30,type:'REST'},{n:'Tours 1+2',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tour 3',dur:10,type:'MANUAL'},{n:'Repos froid (Détente)',dur:20,type:'REST'},{n:'Façonnage bâtons choco',dur:15,type:'MANUAL'},{n:'Apprêt',dur:90,type:'RISE'},{n:'Cuisson',dur:15,type:'OVEN'}] },
    { id:'pain_raisins', name:'Pains aux raisins', cat:'Viennoiserie', icon:'🌀', steps:[{n:'Pétrissage PFL',dur:15,type:'MANUAL'},{n:'Pointage',dur:30,type:'RISE'},{n:'Rompre & Dégazer la pâte',dur:5,type:'MANUAL'},{n:'Mise au frais',dur:30,type:'REST'},{n:'Tours 1+2',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tour 3 & Abaisse',dur:15,type:'MANUAL'},{n:'Garniture crème & raisins',dur:15,type:'MANUAL'},{n:'Repos froid (Détente)',dur:20,type:'REST'},{n:'Roulage & Découpe',dur:15,type:'MANUAL'},{n:'Apprêt',dur:75,type:'RISE'},{n:'Cuisson',dur:20,type:'OVEN'}] },
    { id:'brioche_nanterre', name:'Brioche Nanterre', cat:'Viennoiserie', icon:'🍞', steps:[{n:'Pétrissage',dur:15,type:'MANUAL'},{n:'Pointage',dur:45,type:'RISE'},{n:'Rompre & Dégazer',dur:5,type:'MANUAL'},{n:'Bouler 8 billes',dur:10,type:'MANUAL'},{n:'Apprêt',dur:75,type:'RISE'},{n:'Cuisson',dur:25,type:'OVEN'}] },
    { id:'brioche_tresse', name:'Brioche Tressée', cat:'Viennoiserie', icon:'➰', steps:[{n:'Pétrissage',dur:15,type:'MANUAL'},{n:'Pointage',dur:45,type:'RISE'},{n:'Rompre & Dégazer',dur:5,type:'MANUAL'},{n:'Division & Boulage 3 brins',dur:10,type:'MANUAL'},{n:'Tressage',dur:10,type:'MANUAL'},{n:'Apprêt',dur:60,type:'RISE'},{n:'Cuisson',dur:25,type:'OVEN'}] },
    { id:'brioche_individuelle', name:'Brioche Individuelle', cat:'Viennoiserie', icon:'🥯', steps:[{n:'Pétrissage',dur:15,type:'MANUAL'},{n:'Pointage',dur:45,type:'RISE'},{n:'Rompre & Dégazer',dur:5,type:'MANUAL'},{n:'Façonnage boules',dur:15,type:'MANUAL'},{n:'Apprêt',dur:60,type:'RISE'},{n:'Cuisson',dur:20,type:'OVEN'}] },
    { id:'brioche_feuilletee', name:'Brioche Feuilletée', cat:'Viennoiserie', icon:'🥐', steps:[{n:'Pétrissage Brioche',dur:15,type:'MANUAL'},{n:'Pointage',dur:30,type:'RISE'},{n:'Rompre & Dégazer la pâte',dur:5,type:'MANUAL'},{n:'Mise au frais',dur:30,type:'REST'},{n:'Tours 1+2',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tour 3',dur:10,type:'MANUAL'},{n:'Repos froid (Détente)',dur:20,type:'REST'},{n:'Façonnage cylindres',dur:15,type:'MANUAL'},{n:'Apprêt',dur:90,type:'RISE'},{n:'Cuisson',dur:20,type:'OVEN'}] },
    { id:'chinois', name:'Chinois', cat:'Viennoiserie', icon:'🥨', steps:[{n:'Pétrissage brioche',dur:15,type:'MANUAL'},{n:'Pointage',dur:30,type:'RISE'},{n:'Rompre & Dégazer',dur:5,type:'MANUAL'},{n:'Mise au frais',dur:20,type:'REST'},{n:'Abaisse & Pochage crème',dur:20,type:'MANUAL'},{n:'Roulage & Découpe',dur:10,type:'MANUAL'},{n:'Apprêt',dur:75,type:'RISE'},{n:'Cuisson',dur:25,type:'OVEN'}] },
    { id:'kouglof', name:'Kouglof', cat:'Viennoiserie', icon:'🏰', steps:[{n:'Pétrissage pâte levée',dur:15,type:'MANUAL'},{n:'Pointage',dur:30,type:'RISE'},{n:'Rompre & Dégazer',dur:5,type:'MANUAL'},{n:'Mise en moule & Apprêt',dur:90,type:'RISE'},{n:'Cuisson',dur:40,type:'OVEN'}] },
    { id:'pain_au_lait', name:'Pains au lait', cat:'Viennoiserie', icon:'🍞', steps:[{n:'Pétrissage pâte au lait',dur:15,type:'MANUAL'},{n:'Pointage',dur:30,type:'RISE'},{n:'Rompre & Dégazer',dur:5,type:'MANUAL'},{n:'Façonnage navettes',dur:15,type:'MANUAL'},{n:'Apprêt',dur:60,type:'RISE'},{n:'Cuisson',dur:15,type:'OVEN'}] },
    { id:'chausson_pommes', name:'Chausson aux Pommes', cat:'Viennoiserie', icon:'🍏', steps:[{n:'Détrempe PF',dur:15,type:'MANUAL'},{n:'Repos froid (Détente détrempe)',dur:20,type:'REST'},{n:'Tours 1+2',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tours 3+4',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tours 5+6',dur:15,type:'MANUAL'},{n:'Repos froid (Détente finale)',dur:20,type:'REST'},{n:'Abaisse & Garniture pommes',dur:20,type:'MANUAL'},{n:'Détaillage & Façonnage chaussons',dur:15,type:'MANUAL'},{n:'Cuisson',dur:20,type:'OVEN'}] },

    // VOYAGE
    { id:'cake', name:'Cake Marbré/Fruits', cat:'Voyage', icon:'🍰', steps:[{n:'Appareil cake',dur:15,type:'MANUAL'},{n:'Cuisson longue',dur:45,type:'OVEN'}] },
    { id:'quatre_quarts', name:'Quatre-quarts', cat:'Voyage', icon:'🥮', steps:[{n:'Appareil 4/4',dur:15,type:'MANUAL'},{n:'Cuisson',dur:40,type:'OVEN'}] },
    { id:'pain_epice', name:'Pain d’épices', cat:'Voyage', icon:'🍯', steps:[{n:'Appareil miel',dur:15,type:'MANUAL'},{n:'Cuisson',dur:45,type:'OVEN'}] },
    { id:'gâteau_yaourt', name:'Gâteau au yaourt', cat:'Voyage', icon:'🥣', steps:[{n:'Mélange simple',dur:10,type:'MANUAL'},{n:'Cuisson',dur:35,type:'OVEN'}] },
    { id:'moelleux_choco', name:'Moelleux Chocolat', cat:'Voyage', icon:'🍫', steps:[{n:'Appareil moelleux',dur:15,type:'MANUAL'},{n:'Cuisson rapide',dur:15,type:'OVEN'}] },
    { id:'brownie', name:'Brownie Noix', cat:'Voyage', icon:'🥜', steps:[{n:'Appareil brownie',dur:15,type:'MANUAL'},{n:'Cuisson',dur:25,type:'OVEN'}] },
    { id:'financiers', name:'Financiers', cat:'Voyage', icon:'💰', steps:[{n:'Beurre noisette & Amandes',dur:15,type:'MANUAL'},{n:'Cuisson',dur:12,type:'OVEN'}] },

    // SECS & MOELLEUX
    { id:'sables', name:'Sablés (Diamants/Bretons)', cat:'Sec', icon:'🍪', steps:[{n:'Sablage & Boudins',dur:15,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Détaillage & Cuisson',dur:15,type:'OVEN'}] },
    { id:'spritz', name:'Spritz (Viennois)', cat:'Sec', icon:'🥨', steps:[{n:'Appareil souple',dur:15,type:'MANUAL'},{n:'Pochage cannelé',dur:15,type:'MANUAL'},{n:'Cuisson',dur:12,type:'OVEN'}] },
    { id:'langues_chat', name:'Langues de chat', cat:'Sec', icon:'🐱', steps:[{n:'Pochage fin',dur:10,type:'MANUAL'},{n:'Cuisson rapide',dur:8,type:'OVEN'}] },
    { id:'tuiles', name:'Tuiles Amandes', cat:'Sec', icon:'🍂', steps:[{n:'Appareil & Dressage',dur:15,type:'MANUAL'},{n:'Cuisson & Forme',dur:12,type:'OVEN'}] },
    { id:'rochers', name:'Rochers Coco', cat:'Sec', icon:'🥥', steps:[{n:'Mélange coco',dur:10,type:'MANUAL'},{n:'Cuisson',dur:15,type:'OVEN'}] },
    { id:'macarons', name:'Macarons', cat:'Sec', icon:'🍬', steps:[{n:'Tant pour tant & Sirop',dur:15,type:'MANUAL'},{n:'Meringue Italienne',dur:20,type:'MANUAL'},{n:'Macaronnage & Pochage',dur:15,type:'MANUAL'},{n:'Croûtage',dur:20,type:'REST'},{n:'Cuisson',dur:15,type:'OVEN'},{n:'Garnissage',dur:20,type:'MANUAL'}] },
    { id:'palmiers', name:'Palmiers', cat:'Sec', icon:'🦩', steps:[{n:'Abaisse PF & Sucrage',dur:15,type:'MANUAL'},{n:'Roulage & Découpe',dur:10,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Cuisson',dur:15,type:'OVEN'}] },
    { id:'allumettes', name:'Allumettes Glacées', cat:'Sec', icon:'🍰', steps:[{n:'Abaisse PF & Glace royale',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Cuisson',dur:15,type:'OVEN'}] },
    { id:'sable_amande', name:'Sablé Amande', cat:'Sec', icon:'🍪', steps:[{n:'Sablage farine-beurre',dur:10,type:'MANUAL'},{n:'Fraisage pâte',dur:10,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Détaillage & Cuisson',dur:20,type:'OVEN'}] }
  ];

  /* ============================================================
     EP2 — Entremets et petits gâteaux
     ============================================================ */
  const EP2 = [
    // ENTREMETS
    { id:'fraisier', name:'Fraisier', cat:'Entremet', icon:'🍰', steps:[{n:'Génoise base',dur:15,type:'MANUAL'},{n:'Cuisson génoise',dur:15,type:'OVEN'},{n:'Crème mousseline',dur:15,type:'MANUAL'},{n:'Refroidissement',dur:45,type:'COOL'},{n:'Montage entremet',dur:30,type:'MANUAL'},{n:'Prise froid',dur:60,type:'REST'},{n:'Finition décor',dur:15,type:'MANUAL'}] },
    { id:'framboisier', name:'Framboisier', cat:'Entremet', icon:'🍓', steps:[{n:'Génoise amande',dur:15,type:'MANUAL'},{n:'Cuisson biscuit',dur:15,type:'OVEN'},{n:'Refroidissement biscuit',dur:20,type:'COOL'},{n:'Crème mousseline framboise',dur:20,type:'MANUAL'},{n:'Montage & Framboises',dur:30,type:'MANUAL'},{n:'Prise froid',dur:60,type:'REST'},{n:'Finition & Décor',dur:15,type:'MANUAL'}] },
    { id:'royal', name:'Royal Chocolat', cat:'Entremet', icon:'🍩', steps:[{n:'Dacquoise',dur:15,type:'MANUAL'},{n:'Cuisson base',dur:15,type:'OVEN'},{n:'Croustillant praliné',dur:15,type:'MANUAL'},{n:'Mousse chocolat',dur:25,type:'MANUAL'},{n:'Surgélation',dur:60,type:'REST'},{n:'Glaçage miroir',dur:15,type:'MANUAL'}] },
    { id:'opera', name:'Opéra', cat:'Entremet', icon:'🎼', steps:[{n:'Biscuit joconde',dur:15,type:'MANUAL'},{n:'Cuisson biscuit',dur:10,type:'OVEN'},{n:'Sirop café',dur:10,type:'MANUAL'},{n:'Crème beurre café & Ganache',dur:20,type:'MANUAL'},{n:'Montage (3 couches)',dur:25,type:'MANUAL'},{n:'Prise froid',dur:30,type:'REST'},{n:'Glaçage & Décor',dur:15,type:'MANUAL'}] },
    { id:'charlotte', name:'Charlotte Fruits', cat:'Entremet', icon:'🎀', steps:[{n:'Biscuit cuillère',dur:20,type:'MANUAL'},{n:'Cuisson biscuit',dur:15,type:'OVEN'},{n:'Bavaroise fruits',dur:20,type:'MANUAL'},{n:'Montage moule',dur:20,type:'MANUAL'},{n:'Prise froid',dur:60,type:'COOL'}] },
    { id:'bavarois', name:'Bavarois Parfums', cat:'Entremet', icon:'🍮', steps:[{n:'Base biscuit',dur:15,type:'MANUAL'},{n:'Cuisson biscuit',dur:15,type:'OVEN'},{n:'Mousse & Montage',dur:45,type:'MANUAL'},{n:'Prise froid',dur:60,type:'REST'}] },
    { id:'succès', name:'Succès Praliné', cat:'Entremet', icon:'🌰', steps:[{n:'Meringue & Poudre amande',dur:20,type:'MANUAL'},{n:'Cuisson dacquoise',dur:25,type:'OVEN'},{n:'Crème praliné',dur:20,type:'MANUAL'},{n:'Montage & Finition',dur:30,type:'MANUAL'},{n:'Prise froid',dur:30,type:'REST'}] },
    { id:'moka', name:'Moka Café', cat:'Entremet', icon:'☕', steps:[{n:'Génoise',dur:15,type:'MANUAL'},{n:'Cuisson génoise',dur:20,type:'OVEN'},{n:'Sirop café & Crème beurre café',dur:20,type:'MANUAL'},{n:'Montage & Masquage',dur:30,type:'MANUAL'},{n:'Décors & Finition',dur:20,type:'MANUAL'}] },
    { id:'foret_noire', name:'Forêt Noire', cat:'Entremet', icon:'🍒', steps:[{n:'Génoise chocolat',dur:15,type:'MANUAL'},{n:'Cuisson génoise',dur:20,type:'OVEN'},{n:'Chantilly & Griottes',dur:20,type:'MANUAL'},{n:'Montage & Copeaux choco',dur:30,type:'MANUAL'},{n:'Prise froid',dur:30,type:'REST'}] },

    // TARTES
    { id:'tarte_pommes', name:'Tarte aux Pommes', cat:'Tarte', icon:'🍎', steps:[{n:'Pâte brisée',dur:15,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Foncer la tortière',dur:10,type:'MANUAL'},{n:'Dressage pommes',dur:20,type:'MANUAL'},{n:'Cuisson 180°C',dur:30,type:'OVEN'},{n:'Finition',dur:15,type:'MANUAL'}] },
    { id:'tarte_normande', name:'Tarte Normande', cat:'Tarte', icon:'🥧', steps:[{n:'Pâte brisée',dur:15,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Foncer la tortière',dur:10,type:'MANUAL'},{n:'Appareil normand & Pommes',dur:15,type:'MANUAL'},{n:'Cuisson',dur:40,type:'OVEN'}] },
    { id:'tarte_alsacienne', name:'Tarte Alsacienne', cat:'Tarte', icon:'🍮', steps:[{n:'Pâte brisée',dur:15,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Foncer la tortière',dur:10,type:'MANUAL'},{n:'Appareil alsacien (fruits & crème)',dur:15,type:'MANUAL'},{n:'Cuisson',dur:45,type:'OVEN'}] },
    { id:'tarte_bourdaloue', name:'Tarte Bourdaloue', cat:'Tarte', icon:'🍐', steps:[{n:'Pâte sucrée',dur:15,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Foncer & Crème amande',dur:20,type:'MANUAL'},{n:'Disposer les poires',dur:10,type:'MANUAL'},{n:'Cuisson',dur:30,type:'OVEN'},{n:'Nappage & Finition',dur:10,type:'MANUAL'}] },
    { id:'tarte_citron', name:'Tarte Citron (M/S)', cat:'Tarte', icon:'🍋', steps:[{n:'Pâte sucrée',dur:15,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Foncer & Cuisson à blanc',dur:30,type:'OVEN'},{n:'Crème citron',dur:15,type:'MANUAL'},{n:'Refroidissement fond',dur:15,type:'COOL'},{n:'Garnissage & Meringue Italienne',dur:25,type:'MANUAL'},{n:'Finition chalumeau',dur:5,type:'MANUAL'}] },
    { id:'tarte_tropezienne', name:'Tarte Tropézienne', cat:'Tarte', icon:'🥨', steps:[{n:'Pâte briochée',dur:15,type:'MANUAL'},{n:'Pointage',dur:45,type:'RISE'},{n:'Rompre & Dégazer',dur:5,type:'MANUAL'},{n:'Façonnage disque',dur:10,type:'MANUAL'},{n:'Apprêt',dur:60,type:'RISE'},{n:'Cuisson',dur:20,type:'OVEN'},{n:'Refroidissement & Crème diplomate',dur:25,type:'MANUAL'},{n:'Montage & Finition sucre',dur:15,type:'MANUAL'}] },

    // PETITS GATEAUX
    { id:'eclair', name:'Éclairs (Choco/Café)', cat:'Choux', icon:'🧁', steps:[{n:'Pâte à choux',dur:15,type:'MANUAL'},{n:'Dressage bâtons',dur:15,type:'MANUAL'},{n:'Cuisson',dur:35,type:'OVEN'},{n:'Refroidissement choux',dur:15,type:'COOL'},{n:'Crème pâtissière & Garnissage',dur:20,type:'MANUAL'},{n:'Fondant & Finition',dur:15,type:'MANUAL'}] },
    { id:'religieuse', name:'Religieuses', cat:'Choux', icon:'⛪', steps:[{n:'Pâte à choux',dur:15,type:'MANUAL'},{n:'Dressage chouquettes',dur:15,type:'MANUAL'},{n:'Cuisson',dur:35,type:'OVEN'},{n:'Refroidissement choux',dur:15,type:'COOL'},{n:'Crème & Garnissage',dur:15,type:'MANUAL'},{n:'Montage & Glaçage fondant',dur:15,type:'MANUAL'}] },
    { id:'paris_brest', name:'Paris-Brest', cat:'Choux', icon:'🎡', steps:[{n:'Pâte à choux couronnes',dur:15,type:'MANUAL'},{n:'Dressage à la poche',dur:10,type:'MANUAL'},{n:'Cuisson',dur:30,type:'OVEN'},{n:'Refroidissement',dur:20,type:'COOL'},{n:'Crème mousseline praliné',dur:20,type:'MANUAL'},{n:'Garnissage & Montage',dur:20,type:'MANUAL'},{n:'Finition pralin & sucre glace',dur:10,type:'MANUAL'}] },
    { id:'st_honore', name:'Saint-Honoré', cat:'Choux', icon:'👑', steps:[{n:'Détrempe PF',dur:10,type:'MANUAL'},{n:'Repos froid (détrempe)',dur:20,type:'REST'},{n:'Tours 1+2',dur:10,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tours 3+4',dur:10,type:'MANUAL'},{n:'Repos froid (Détente)',dur:20,type:'REST'},{n:'Foncer disque PF & Choux',dur:15,type:'MANUAL'},{n:'Cuisson',dur:30,type:'OVEN'},{n:'Refroidissement',dur:15,type:'COOL'},{n:'Crème Chiboust & Chantilly',dur:20,type:'MANUAL'},{n:'Montage caramel & Finition',dur:25,type:'MANUAL'}] },
    { id:'millefeuille', name:'Mille-feuille', cat:'PF', icon:'🍰', steps:[{n:'Détrempe PF',dur:10,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tours 1+2',dur:10,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tours 3+4',dur:10,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Tours 5+6',dur:10,type:'MANUAL'},{n:'Repos froid (Détente)',dur:20,type:'REST'},{n:'Abaisse & Cuisson plaques',dur:45,type:'OVEN'},{n:'Refroidissement feuilletage',dur:15,type:'COOL'},{n:'Crème pâtissière',dur:15,type:'MANUAL'},{n:'Montage & Glaçage fondant',dur:30,type:'MANUAL'}] },
    { id:'salambo', name:'Salambo / Glands', cat:'Choux', icon:'🌳', steps:[{n:'Pâte à choux ovales',dur:15,type:'MANUAL'},{n:'Cuisson',dur:35,type:'OVEN'},{n:'Finition verte/choco',dur:30,type:'MANUAL'}] },
    { id:'tarte_fraise', name:'Tarte aux Fraises', cat:'Tarte', icon:'🍓', steps:[{n:'Pâte sucrée',dur:15,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Fonçage & Cuisson à blanc',dur:35,type:'OVEN'},{n:'Crème pâtissière',dur:15,type:'MANUAL'},{n:'Refroidissement crème',dur:30,type:'COOL'},{n:'Dressage fraises & Nappage',dur:20,type:'MANUAL'}] },
    { id:'tarte_chocolat', name:'Tarte Chocolat', cat:'Tarte', icon:'🍫', steps:[{n:'Pâte sablée',dur:15,type:'MANUAL'},{n:'Repos froid',dur:30,type:'REST'},{n:'Foncer & Cuisson à blanc',dur:25,type:'OVEN'},{n:'Refroidissement fond',dur:15,type:'COOL'},{n:'Ganache chocolat',dur:15,type:'MANUAL'},{n:'Cristallisation',dur:45,type:'COOL'}] },
    { id:'conversation', name:'Conversation', cat:'PF', icon:'💬', steps:[{n:'Abaisse PF',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Foncer tartelettes',dur:10,type:'MANUAL'},{n:'Frangipane & Garnissage',dur:15,type:'MANUAL'},{n:'Glace royale',dur:10,type:'MANUAL'},{n:'Cuisson',dur:25,type:'OVEN'}] },
    { id:'dartois', name:'Dartois', cat:'PF', icon:'📏', steps:[{n:'Abaisse PF',dur:15,type:'MANUAL'},{n:'Garniture amande',dur:15,type:'MANUAL'},{n:'Repos froid',dur:20,type:'REST'},{n:'Cuisson',dur:25,type:'OVEN'},{n:'Détaillage & Finition',dur:10,type:'MANUAL'}] }
  ];

  const DB = { EP1, EP2 };

  function schedule(recipes, type) {
    const SLOT = 15, NS = 20; // 5h
    let grid = Array.from({length:NS}, () => Array(recipes.length).fill(null));
    let timeline = Array(NS).fill(false);
    for (let i = 0; i < recipes.length; i++) grid[0][i] = { type:'MANUAL', n:'⚖️ Pesées & Mise en place' };
    timeline[0] = true;
    let queues = recipes.map(r => {
      let steps = [...r.steps];
      if (type === 'EP2' && r.cat === 'Entremet') {
        steps.push({ n: 'Mise au point chocolat', dur: 15, type: 'MANUAL' });
        steps.push({ n: 'Réalisation décors chocolats', dur: 15, type: 'MANUAL' });
      }
      return { steps, next: 1 };
    });
    for (let s = 1; s < NS; s++) {
      queues.forEach((q, i) => {
        if (q.steps.length > 0 && q.steps[0].type !== 'MANUAL' && s >= q.next) {
          let st = q.steps.shift(), ns = Math.ceil(st.dur / SLOT), text = st.n.toLowerCase();
          let em = '⏲️'; if(st.type==='OVEN'||text.includes('cuiss')) em='🔥';
          if(text.includes('apprêt')||text.includes('pousse')) em='🌡️';
          else if(['REST','COOL','RISE'].includes(st.type)||text.includes('froid')||text.includes('repos')) em='❄️';
          for (let k = 0; k < ns && (s+k) < NS; k++) grid[s+k][i] = { type:st.type, n: em + ' ' + st.n };
          q.next = s + ns;
        }
      });
      if (!timeline[s]) {
        let targets = queues.filter((q, i) => q.steps.length > 0 && q.steps[0].type === 'MANUAL' && s >= q.next);
        if (targets.length > 0) {
          let q = targets[0], st = q.steps.shift(), ns = Math.ceil(st.dur / SLOT), ci = queues.indexOf(q), text = st.n.toLowerCase();
          let em = '🧤'; 
          if(text.includes('chocolat')||text.includes('mise au point')) em='🍫';
          if(text.includes('décor')||text.includes('fini')||text.includes('glaç')||text.includes('montag')) em='🎨';
          if(text.includes('crème')||text.includes('appari')||text.includes('pétri')||text.includes('biscuit')||text.includes('base')) em='🥣';
          if(text.includes('pesée')) em='⚖️';
          for (let k = 0; k < ns && (s+k) < NS; k++) { 
            grid[s+k][ci] = { type:st.type, n: em + ' ' + st.n }; 
            timeline[s+k] = true; 
          }
          q.next = s + ns;
        } else if (s % 4 === 0 && s < NS - 1) {
            for(let i=0; i<recipes.length; i++) { if(!grid[s][i]) { grid[s][i] = { type:'CLEAN', n:'🧽 Nettoyage stratégique du poste' }; break; } }
        }
      }
    }
    for (let i = 0; i < recipes.length; i++) grid[NS-1][i] = { type:'MANUAL', n:'🏆 Présentation finale et Envoi au Jury' };
    return grid;
  }

  function css() {
    if (document.getElementById('gStyle')) return;
    const s = document.createElement('style');
    s.id = 'gStyle';
    s.textContent = `
      #schedulerRecipeList { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 10px; margin-top: 15px; }
      .scheduler-recipe-card { display: flex; align-items: center; gap: 12px; padding: 12px 15px; background: var(--surface); border: 1px solid var(--surface-border); border-radius: 10px; cursor: pointer; color: var(--text); will-change: transform, box-shadow; transform: translateY(0) scale(1); box-shadow: 0 1px 4px rgba(0,0,0,0.07); transition: transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.28s ease, border-color 0.2s ease, background 0.2s ease; }
      .scheduler-recipe-card:hover { transform: translateY(-4px) scale(1.025); box-shadow: 0 10px 28px rgba(0,0,0,0.15); border-color: var(--accent); }
      .scheduler-recipe-card:active { transform: translateY(-1px) scale(1.005); box-shadow: 0 2px 8px rgba(0,0,0,0.10); transition: transform 0.08s ease, box-shadow 0.08s ease; }
      .scheduler-recipe-card.selected { border-color: var(--accent); background: var(--accent-glow); box-shadow: 0 0 0 2px var(--accent), 0 6px 20px rgba(0,0,0,0.12); transform: translateY(-2px) scale(1.015); }
      .scheduler-recipe-card input[type="checkbox"] { accent-color: var(--accent); width: 16px; height: 16px; flex-shrink: 0; cursor: pointer; }
      .g-wrap { overflow-x: auto; background: var(--surface); padding: 1rem; border-radius: 12px; border: 1px solid var(--surface-border); }
      .g-tbl { width: 100%; border-collapse: collapse; min-width: 900px; }
      .g-tm { width: 70px; text-align: center; font-weight: 800; background: var(--bg-alt); border: 1px solid var(--surface-border); font-size: 0.85rem; color: var(--text); }
      .g-hd-r { background: var(--primary); color: var(--text-inverse); padding: 12px; font-size: 0.8rem; text-align: center; border: 1px solid var(--surface-border); }
      .g-c { border: 1px solid var(--surface-border); height: 55px; padding: 4px; vertical-align: middle; }
      .g-in { padding: 6px 10px; border-radius: 6px; font-size: 0.78rem; font-weight: 700; display: flex; align-items: center; height: 100%; background: var(--success-light); border-left: 4px solid var(--success); color: var(--text); }
      .g-oven { background: var(--danger-light) !important; border-left: 4px solid var(--danger) !important; font-style: italic; opacity: 0.9; }
      .g-rest,.g-cool { background: rgba(59, 130, 246, 0.1) !important; border-left: 4px solid var(--info) !important; font-style: italic; opacity: 0.9; }
      .g-rise { background: var(--warning-light) !important; border-left: 4px solid var(--warning) !important; font-style: italic; opacity: 0.9; }
      .g-cold-neg { background: var(--accent) !important; color: white !important; border-left: 4px solid var(--accent-dark) !important; font-style: italic; opacity: 0.9; }
      .g-clean { background: var(--surface-border) !important; border-left: 4px solid var(--text-muted) !important; color: var(--text-muted); font-size: 0.72rem; }
      .route-tactique { margin-top: 1.5rem; background: var(--bg-alt); padding: 1.2rem; border-radius: 15px; border: 1px solid var(--surface-border); }
      .route-tactique h3 { margin: 0 0 1rem 0; font-size: 1.1rem; color: var(--primary); border-bottom: 2px solid var(--accent); padding-bottom: 5px; display: inline-block; }
      .route-step { display: flex; gap: 12px; margin-bottom: 8px; font-size: 0.9rem; font-weight: 600; color: var(--text); }
      .step-num { width: 22px; height: 22px; background: var(--primary); color: var(--text-inverse); border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 0.75rem; flex-shrink:0; }
    `;
    document.head.appendChild(s);
  }

  window.switchExamType = function(type) {
    css();
    const l = document.getElementById('schedulerRecipeList');
    if (!l) return; l.innerHTML = '';
    (DB[type]||[]).forEach(r => {
      const d = document.createElement('div');
      d.className = 'scheduler-recipe-card';
      d.innerHTML = `<input type="checkbox" id="sch_${r.id}" value="${r.id}"><label for="sch_${r.id}">${r.icon} <strong>${r.name}</strong></label>`;
      d.onclick = (e) => {
        if(e.target.tagName !== 'INPUT') { const cb = d.querySelector('input'); cb.checked = !cb.checked; d.classList.toggle('selected', cb.checked); }
        else d.classList.toggle('selected', e.target.checked);
      };
      l.appendChild(d);
    });
    document.querySelectorAll('input[name="examType"]').forEach(i => i.checked = (i.value === type));
  };

  function render(grid, recipes) {
    const res = document.getElementById('schedulerResult'); if(!res) return;
    let h = `<div class="g-wrap"><table class="g-tbl"><thead><tr><th class="g-hd-t">Temps</th>`;
    recipes.forEach(r => h += `<th class="g-hd-r">${r.icon} ${r.name}</th>`);
    h += `</tr></thead><tbody>`;
    for (let s = 0; s < grid.length; s++) {
      let hrs = Math.floor((s * 15) / 60), mins = (s * 15) % 60;
      let ts = (hrs < 10 ? '0' : '') + hrs + 'h' + (mins === 0 ? '00' : mins);
      h += `<tr><td class="g-tm">${ts}</td>`;
      if (s === grid.length - 1) {
        h += `<td class="g-c" colspan="${recipes.length}"><div class="g-in g-manual" style="justify-content:center; font-size:1.1rem; background:rgba(76,175,80,0.1) !important;">${grid[s][0].n}</div></td>`;
      } else {
        grid[s].forEach(cell => { 
          if(!cell) h += `<td class="g-c"></td>`; 
          else {
            let cls = cell.type.toLowerCase();
            let txt = cell.n.toLowerCase();
            if (cls !== 'manual' && (txt.includes('négatif') || txt.includes('surgél') || txt.includes('cellule'))) cls = 'cold-neg';
            h += `<td class="g-c"><div class="g-in g-${cls}">${cell.n}</div></td>`;
          }
        });
      }
      h += `</tr>`;
    }
    h += `</tbody></table></div><div class="route-tactique"><h3>🎯 Feuille de Route Tactique</h3>`;
    let path = []; grid.forEach(row => row.forEach(cell => { if(cell && cell.type==='MANUAL' && !path.includes(cell.n)) path.push(cell.n); }));
    path.forEach((s, i) => h += `<div class="route-step"><div class="step-num">${i+1}</div><div>${s}</div></div>`);
    h += `</div>`;
    res.innerHTML = h;
  }

  window.generateSchedule = function() {
    const cbs = document.querySelectorAll('#schedulerRecipeList input:checked');
    if (!cbs.length) { if (typeof showToast === 'function') showToast('Choisissez vos recettes !', 'warning'); return; }
    const type = document.querySelector('input[name="examType"]:checked').value;
    const sel = (DB[type]||[]).filter(r => Array.from(cbs).some(c => c.value === r.id));
    render(schedule(sel, type), sel);
    if (typeof showToast === 'function') showToast('✅ Chronogramme optimisé généré !', 'success');
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => switchExamType('EP1'));
  else switchExamType('EP1');

})();
