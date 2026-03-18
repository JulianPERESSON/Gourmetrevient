/* ============================================================
   EXAM-SCHEDULER.JS — Ordonnancement CAP Pâtissier
   Gantt | 4h30 = 18 créneaux de 15 min — Durées CONFORTABLES
   L'apprenti ne court pas : on utilise TOUT le temps disponible
   ============================================================ */
(function () {
  'use strict';

  const COL = {
    plf:'#E65100',brioche:'#FF8F00',cake:'#6D4C41',quatrequarts:'#795548',
    madeleines:'#D84315',financiers:'#BF360C',tuiles:'#F9A825',sables:'#A1887F',
    langues_chat:'#FFB74D',spritz:'#FFCC80',tarte_pommes:'#2E7D32',
    tarte_fruits:'#43A047',tarte_amandine:'#558B2F',eclairs:'#4A148C',
    religieuses:'#6A1B9A',paris_brest:'#7B1FA2',choux_creme:'#8E24AA',
    fraisier:'#C62828',charlotte:'#AD1457',tarte_citron:'#F9A825',
    opera:'#37474F',foret_noire:'#3E2723',bavarois:'#E91E63'
  };

  /* ============================================================
     EP1 — Durées réalistes et confortables
     Repos 30 min, pousse 90 min, cuissons vraies
     ============================================================ */
  const EP1 = [
    { id:'plf', name:'PLF (Croissants / Pains choc)', cat:'Viennoiserie', icon:'🥐', steps:[
      {n:'Pétrissage détrempe (frasage, pétrissage 1ʳᵉ + 2ᵉ vit.)',dur:15,type:'MANUAL'},
      {n:'Repos détrempe au froid positif',dur:30,type:'REST'},
      {n:'Beurrage — Tourage 3 tours simples',dur:15,type:'MANUAL'},
      {n:'Repos au froid (détente du gluten)',dur:30,type:'REST'},
      {n:'Abaisse — Détaillage — Façonnage (roulage / pliage)',dur:30,type:'MANUAL'},
      {n:'Apprêt — Pousse en étuve 27°C / 75% HR',dur:90,type:'RISE',alert:'⚠️ Volume ×2,5 — ne pas dépasser'},
      {n:'Dorage (dorure œuf + lait) — Cuisson 180°C',dur:15,type:'OVEN',alert:'⚠️ Surveiller coloration'},
      {n:'Ressuage sur grille — Refroidissement',dur:15,type:'COOL'}
    ]},
    { id:'brioche', name:'Brioche (Nanterre / Tressée)', cat:'Viennoiserie', icon:'🍞', steps:[
      {n:'Pétrissage (1ʳᵉ vit. frasage, 2ᵉ vit. + beurre pommade)',dur:15,type:'MANUAL'},
      {n:'Pointage (1ʳᵉ fermentation température ambiante)',dur:45,type:'RISE'},
      {n:'Rabat — Dégazage — Division — Boulage',dur:15,type:'MANUAL'},
      {n:'Détente au froid (raffermissement pâte)',dur:15,type:'REST'},
      {n:'Façonnage (boudin tressé ou boulage Nanterre)',dur:15,type:'MANUAL'},
      {n:'Apprêt (2ᵉ pousse étuve — volume ×2)',dur:75,type:'RISE',alert:'⚠️ Surveiller le volume'},
      {n:'Dorage — Cuisson 170°C',dur:30,type:'OVEN'},
      {n:'Démoulage — Ressuage sur grille',dur:15,type:'COOL'}
    ]},
    { id:'cake', name:'Cake de Voyage (citron / fruits / marbré)', cat:'Gâteau de voyage', icon:'🍰', steps:[
      {n:'Crémage beurre pommade + sucre (blanchiment)',dur:15,type:'MANUAL'},
      {n:'Incorporation œufs 1 à 1 — Tamisage farine + levure — Moulage',dur:15,type:'MANUAL'},
      {n:'Cuisson 170°C (inciser à 10 min — pointe de couteau sèche)',dur:45,type:'OVEN',alert:'⚠️ Vérifier cuisson pointe de couteau'},
      {n:'Démoulage — Ressuage sur grille',dur:30,type:'COOL'},
      {n:'Puncher au sirop — Nappage abricot (lustrage) — Décor',dur:15,type:'MANUAL'}
    ]},
    { id:'quatrequarts', name:'Quatre-Quarts', cat:'Gâteau de voyage', icon:'🧁', steps:[
      {n:'Crémage beurre + sucre — Incorporation œufs — Farine tamisée',dur:15,type:'MANUAL'},
      {n:'Chemisage moule — Pochage appareil',dur:15,type:'MANUAL'},
      {n:'Cuisson 170°C',dur:45,type:'OVEN'},
      {n:'Démoulage — Ressuage',dur:30,type:'COOL'},
      {n:'Nappage — Décor (fruits confits, glaçage)',dur:15,type:'MANUAL'}
    ]},
    { id:'madeleines', name:'Madeleines', cat:'PF moelleux', icon:'🧈', steps:[
      {n:'Confection appareil (œufs + sucre → farine → beurre fondu)',dur:15,type:'MANUAL'},
      {n:'Repos obligatoire au froid (choc thermique pour la bosse)',dur:60,type:'REST',alert:'⚠️ Ne pas écourter ce repos'},
      {n:'Beurrage + farinage moules — Pochage appareil',dur:15,type:'MANUAL'},
      {n:'Cuisson 220°C saisie puis 180°C',dur:15,type:'OVEN',alert:'⚠️ Cuisson courte'},
      {n:'Démoulage immédiat — Ressuage',dur:15,type:'COOL'}
    ]},
    { id:'financiers', name:'Financiers', cat:'PF moelleux', icon:'💰', steps:[
      {n:'Réalisation beurre noisette — Confection appareil (blancs + TPT + farine)',dur:15,type:'MANUAL'},
      {n:'Pochage en moules Flexipan / individuels',dur:15,type:'MANUAL'},
      {n:'Cuisson 180°C',dur:15,type:'OVEN'},
      {n:'Démoulage — Ressuage',dur:15,type:'COOL'}
    ]},
    { id:'tuiles', name:'Tuiles aux Amandes', cat:'PF secs', icon:'🍪', steps:[
      {n:'Confection appareil (blancs + sucre + farine + amandes effilées)',dur:15,type:'MANUAL'},
      {n:'Dressage régulier sur Silpat (pochoir ou cuillère)',dur:15,type:'MANUAL'},
      {n:'Cuisson 180°C (blonde, attention coloration rapide)',dur:15,type:'OVEN',alert:'⚠️ Coloration très rapide'},
      {n:'Cintrage à chaud sur rouleau — Ressuage',dur:15,type:'MANUAL'}
    ]},
    { id:'sables', name:'Sablés décorés', cat:'PF secs', icon:'⭐', steps:[
      {n:'Sablage (ou crémage) — Fraiser — Former la pâte',dur:15,type:'MANUAL'},
      {n:'Repos au froid (pâte ferme pour abaisse)',dur:30,type:'REST'},
      {n:'Abaisse 3 mm — Détaillage emporte-pièce — Dressage plaques',dur:15,type:'MANUAL'},
      {n:'Cuisson 170°C (coloration blonde uniforme)',dur:15,type:'OVEN'},
      {n:'Ressuage complet (indispensable avant décor)',dur:15,type:'COOL'},
      {n:'Décor soigné (glaçage royal / tempérage chocolat)',dur:15,type:'MANUAL'}
    ]},
    { id:'langues_chat', name:'Langues de Chat', cat:'PF secs', icon:'🐱', steps:[
      {n:'Crémage beurre + sucre — Incorporation blancs — Farine tamisée',dur:15,type:'MANUAL'},
      {n:'Dressage à la poche unie (bâtonnets réguliers, espacés)',dur:15,type:'MANUAL'},
      {n:'Cuisson 180°C (coloration périmétrique uniquement)',dur:15,type:'OVEN',alert:'⚠️ Cuisson très courte'},
      {n:'Ressuage — Décoller délicatement',dur:15,type:'COOL'}
    ]},
    { id:'spritz', name:'Spritz', cat:'PF secs', icon:'🌀', steps:[
      {n:'Crémage beurre pommade + sucre glace — Œuf — Farine',dur:15,type:'MANUAL'},
      {n:'Dressage poche cannelée (formes en S, W, spirale)',dur:15,type:'MANUAL'},
      {n:'Cuisson 170°C (pas de coloration excessive)',dur:15,type:'OVEN'},
      {n:'Ressuage complet',dur:15,type:'COOL'}
    ]},
    { id:'tarte_pommes', name:'Tarte aux Pommes', cat:'Tarte', icon:'🍏', steps:[
      {n:'Confection pâte brisée (sablage, frasage) — Bouler + filmer',dur:15,type:'MANUAL'},
      {n:'Repos au froid (hydratation + détente gluten)',dur:30,type:'REST'},
      {n:'Abaisse 2,5 mm — Fonçage cercle — Épluchage + tournage pommes',dur:30,type:'MANUAL'},
      {n:'Garnissage compote maison + rosace de pommes émincées',dur:15,type:'MANUAL'},
      {n:'Cuisson 180°C (fond doré, pommes caramélisées)',dur:30,type:'OVEN'},
      {n:'Ressuage — Nappage abricot à chaud (lustrage)',dur:15,type:'COOL'}
    ]},
    { id:'tarte_fruits', name:'Tarte aux Fruits Frais', cat:'Tarte', icon:'🍓', steps:[
      {n:'Confection pâte sucrée (crémage) — Fraiser — Bouler',dur:15,type:'MANUAL'},
      {n:'Repos au froid (raffermir la pâte)',dur:30,type:'REST'},
      {n:'Abaisse — Fonçage — Piquage — Papier + poids',dur:15,type:'MANUAL'},
      {n:'Cuisson à blanc (fond blanc, sec, sans fissure)',dur:15,type:'OVEN'},
      {n:'Ressuage fond de tarte',dur:15,type:'COOL'},
      {n:'Confection crème pâtissière (cuire 2 min à ébullition) — Filmer au contact',dur:15,type:'MANUAL'},
      {n:'Refroidissement crème pâtissière',dur:30,type:'COOL'},
      {n:'Garnissage crème lissée + disposition harmonieuse des fruits — Nappage neutre',dur:15,type:'MANUAL'}
    ]},
    { id:'tarte_amandine', name:'Tarte Amandine (poires)', cat:'Tarte', icon:'🥧', steps:[
      {n:'Confection pâte sucrée — Fraiser — Bouler',dur:15,type:'MANUAL'},
      {n:'Repos au froid',dur:30,type:'REST'},
      {n:'Fonçage — Crème d\'amandes (crémage beurre + TPT + œufs)',dur:15,type:'MANUAL'},
      {n:'Garnissage crème + disposition fruits (demi-poires en éventail)',dur:15,type:'MANUAL'},
      {n:'Cuisson 175°C (crème d\'amandes bien prise, dorée)',dur:30,type:'OVEN'},
      {n:'Ressuage — Nappage abricot — Amandes effilées torréfiées',dur:15,type:'COOL'}
    ]}
  ];

  /* ============================================================
     EP2 — Durées confortables
     ============================================================ */
  const EP2 = [
    { id:'eclairs', name:'Éclairs Chocolat', cat:'Pâte à choux', icon:'⚡', steps:[
      {n:'Confection pâte à choux (desséchage complet + incorporation œufs)',dur:15,type:'MANUAL'},
      {n:'Dressage éclairs à la poche unie 12 (réguliers, 12 cm)',dur:15,type:'MANUAL'},
      {n:'Cuisson 190°C → 170°C (four fermé, ne pas ouvrir)',dur:30,type:'OVEN',alert:'⚠️ Ne jamais ouvrir le four'},
      {n:'Ressuage complet (choux secs à cœur)',dur:15,type:'COOL'},
      {n:'Confection crème pâtissière chocolat — Filmer au contact',dur:15,type:'MANUAL'},
      {n:'Refroidissement crème (froid positif)',dur:30,type:'COOL'},
      {n:'Garnissage à la poche (percer 3 trous par éclair)',dur:15,type:'MANUAL'},
      {n:'Mise au point fondant chocolat (36°C) — Glaçage par trempage — Lisser au doigt',dur:15,type:'MANUAL'}
    ]},
    { id:'religieuses', name:'Religieuses', cat:'Pâte à choux', icon:'⛪', steps:[
      {n:'Confection pâte à choux (desséchage + œufs)',dur:15,type:'MANUAL'},
      {n:'Dressage corps (douille 14) + têtes (douille 10)',dur:15,type:'MANUAL'},
      {n:'Cuisson 190°C → 170°C (four fermé)',dur:30,type:'OVEN',alert:'⚠️ Four fermé impérativement'},
      {n:'Ressuage complet',dur:15,type:'COOL'},
      {n:'Confection crème pâtissière — Filmer au contact',dur:15,type:'MANUAL'},
      {n:'Refroidissement crème',dur:30,type:'COOL'},
      {n:'Garnissage corps + têtes — Glaçage fondant par trempage',dur:15,type:'MANUAL'},
      {n:'Montage : tête sur corps + collerette crème au beurre (douille cannelée)',dur:15,type:'MANUAL'}
    ]},
    { id:'paris_brest', name:'Paris-Brest', cat:'Pâte à choux', icon:'🎡', steps:[
      {n:'Confection pâte à choux',dur:15,type:'MANUAL'},
      {n:'Dressage couronnes (douille 12) — Parsemer amandes effilées',dur:15,type:'MANUAL'},
      {n:'Cuisson 190°C → 170°C (bien sécher les couronnes)',dur:30,type:'OVEN',alert:'⚠️ Séchage résiduel important'},
      {n:'Ressuage complet',dur:15,type:'COOL'},
      {n:'Confection crème mousseline praliné (pâtissière + beurre)',dur:15,type:'MANUAL'},
      {n:'Découpe horizontale — Garnissage poche cannelée — Décor pralin + sucre glace',dur:15,type:'MANUAL'}
    ]},
    { id:'choux_creme', name:'Choux Chantilly / Crème', cat:'Pâte à choux', icon:'🍩', steps:[
      {n:'Confection pâte à choux',dur:15,type:'MANUAL'},
      {n:'Dressage choux réguliers (douille 12)',dur:15,type:'MANUAL'},
      {n:'Cuisson 190°C (four fermé, bien sécher)',dur:30,type:'OVEN'},
      {n:'Ressuage complet',dur:15,type:'COOL'},
      {n:'Confection crème pâtissière vanille — Filmer au contact',dur:15,type:'MANUAL'},
      {n:'Refroidissement crème',dur:30,type:'COOL'},
      {n:'Garnissage (percer + poche) — Glaçage fondant ou caramel',dur:15,type:'MANUAL'}
    ]},
    { id:'fraisier', name:'Fraisier', cat:'Entremets', icon:'🍓', steps:[
      {n:'Confection génoise (blancs montés + sucre au ruban → farine tamisée)',dur:15,type:'MANUAL'},
      {n:'Cuisson génoise (cadre ou cercle)',dur:15,type:'OVEN'},
      {n:'Ressuage génoise',dur:15,type:'COOL'},
      {n:'Confection crème pâtissière (base mousseline) — Filmer au contact',dur:15,type:'MANUAL'},
      {n:'Refroidissement crème pâtissière',dur:45,type:'COOL'},
      {n:'Crémage beurre → Crème mousseline + Équeutage et détaillage fraises',dur:15,type:'MANUAL'},
      {n:'Montage complet : chemisage cercle rhodoïd, crème, fraises, génoise imbibée',dur:30,type:'MANUAL'},
      {n:'Prise au froid (stabilisation indispensable)',dur:45,type:'REST',alert:'⚠️ Prise indispensable — ne pas écourter'},
      {n:'Décor pâte d\'amande lissée + inscription + finitions',dur:15,type:'MANUAL'}
    ]},
    { id:'charlotte', name:'Charlotte aux Fruits', cat:'Entremets', icon:'🎀', steps:[
      {n:'Confection + dressage biscuit cuillère (méthode meringue française)',dur:15,type:'MANUAL'},
      {n:'Cuisson biscuit cuillère',dur:15,type:'OVEN'},
      {n:'Ressuage biscuit',dur:15,type:'COOL'},
      {n:'Confection mousse bavaroise (anglaise collée gélatine + crème fouettée)',dur:15,type:'MANUAL'},
      {n:'Chemisage moule charlotte + Garnissage mousse + fruits préparés',dur:30,type:'MANUAL'},
      {n:'Prise au froid (gélification)',dur:60,type:'REST',alert:'⚠️ Minimum 1h de prise'},
      {n:'Démoulage délicat — Glaçage neutre — Décor soigné',dur:15,type:'MANUAL'}
    ]},
    { id:'tarte_citron', name:'Tarte Citron Meringuée', cat:'Tarte', icon:'🍋', steps:[
      {n:'Confection pâte sucrée (crémage) — Fraiser — Bouler',dur:15,type:'MANUAL'},
      {n:'Repos au froid (détente)',dur:30,type:'REST'},
      {n:'Abaisse — Fonçage — Piquage — Cuisson à blanc',dur:30,type:'OVEN'},
      {n:'Ressuage fond de tarte',dur:15,type:'COOL'},
      {n:'Confection crème citron (cuire, beurrer hors feu) — Coulage dans le fond',dur:15,type:'MANUAL'},
      {n:'Prise au froid (gélification crème citron)',dur:30,type:'REST'},
      {n:'Confection meringue italienne (sirop 121°C + blancs montés)',dur:15,type:'MANUAL'},
      {n:'Dressage meringue (poche St-Honoré) — Caramélisation au chalumeau',dur:15,type:'MANUAL'}
    ]},
    { id:'opera', name:'Opéra', cat:'Entremets', icon:'🎼', steps:[
      {n:'Confection biscuit joconde (TPT + blancs montés + beurre fondu)',dur:15,type:'MANUAL'},
      {n:'Cuisson biscuit joconde en cadre',dur:15,type:'OVEN'},
      {n:'Ressuage biscuit',dur:15,type:'COOL'},
      {n:'Sirop de punchage café — Crème au beurre café (pâte à bombe + beurre)',dur:15,type:'MANUAL'},
      {n:'Ganache chocolat noir (crème bouillante + couverture hachée)',dur:15,type:'MANUAL'},
      {n:'Refroidissement ganache (cristallisation)',dur:15,type:'COOL'},
      {n:'Montage : puncher — crème au beurre — ganache (×3 couches alternées)',dur:30,type:'MANUAL'},
      {n:'Prise au froid (stabilisation avant glaçage)',dur:30,type:'REST'},
      {n:'Glaçage miroir chocolat — Découpe nette au couteau chaud — Décor feuille d\'or',dur:15,type:'MANUAL'}
    ]},
    { id:'foret_noire', name:'Forêt Noire', cat:'Entremets', icon:'🌲', steps:[
      {n:'Confection génoise chocolat (œufs + sucre au ruban + farine + cacao)',dur:15,type:'MANUAL'},
      {n:'Cuisson génoise chocolat',dur:15,type:'OVEN'},
      {n:'Ressuage — Refroidissement',dur:15,type:'COOL'},
      {n:'Sirop kirsch + Préparation griottes + Foisonnement chantilly',dur:15,type:'MANUAL'},
      {n:'Montage : puncher, chantilly, griottes (×2 disques superposés)',dur:30,type:'MANUAL'},
      {n:'Prise au froid (stabilisation)',dur:30,type:'REST'},
      {n:'Masquage chantilly — Habillage copeaux chocolat noir — Décor rosaces + griottes',dur:15,type:'MANUAL'}
    ]},
    { id:'bavarois', name:'Bavarois aux Fruits', cat:'Entremets', icon:'🍑', steps:[
      {n:'Confection génoise (ou biscuit cuillère)',dur:15,type:'MANUAL'},
      {n:'Cuisson biscuit',dur:15,type:'OVEN'},
      {n:'Ressuage biscuit',dur:15,type:'COOL'},
      {n:'Crème anglaise collée (gélatine hydratée) — Refroidir sur bain-marie froid',dur:15,type:'MANUAL'},
      {n:'Refroidissement crème anglaise (épaississement)',dur:15,type:'COOL'},
      {n:'Incorporation crème fouettée → Appareil bavarois',dur:15,type:'MANUAL'},
      {n:'Montage en cercle chemisé : biscuit imbibé + appareil bavarois',dur:15,type:'MANUAL'},
      {n:'Prise au froid (gélification complète)',dur:60,type:'REST',alert:'⚠️ Minimum 1h de prise'},
      {n:'Décercler — Glaçage neutre — Décor soigné',dur:15,type:'MANUAL'}
    ]}
  ];

  const DB = { EP1, EP2 };

  /* ============================================================
     MOTEUR — 4h30 = 270 min = 18 créneaux de 15 min
     On utilise TOUT le temps. L'apprenti ne court pas.
     ============================================================ */
  function schedule(recipes) {
    const SLOT = 15, TOTAL = 270, NS = TOTAL / SLOT; // 18
    const N = recipes.length;
    let grid = Array.from({length:NS}, ()=> Array(N).fill(null));

    // Slot 0 : Lecture sujet + Pesées
    for (let i = 0; i < N; i++)
      grid[0][i] = {type:'MANUAL',n:'⚖️ Lecture sujet — Pesées — Mise en place poste'};

    let mF = 1, oF = 0; // manual free, oven free (slot index)

    let S = recipes.map((r,i) => ({
      i, idx:0, at:1, done:false,
      steps: r.steps.map(s=>({...s})),
      total: r.steps.reduce((a,s)=>a+s.dur,0)
    }));

    // Dernier slot réservé
    const LAST = NS - 1;

    for (let t = 1; t < LAST; t++) {
      // Trier par urgence dynamique
      let prio = S.filter(s=>!s.done).sort((a,b) => {
        let rA = a.steps.slice(a.idx).reduce((x,s)=>x+s.dur,0);
        let rB = b.steps.slice(b.idx).reduce((x,s)=>x+s.dur,0);
        return rB - rA;
      });

      // 1. Démarrer les étapes passives
      for (let s of prio) {
        if (s.at > t || s.idx >= s.steps.length) continue;
        let st = s.steps[s.idx];
        if (['REST','RISE','COOL'].includes(st.type)) {
          let sl = Math.ceil(st.dur / SLOT);
          for (let k = 0; k < sl && (t+k) < NS; k++)
            if (!grid[t+k][s.i]) grid[t+k][s.i] = {type:st.type, n:st.n, alert:st.alert};
          s.idx++; s.at = t + sl;
          if (s.idx >= s.steps.length) s.done = true;
        }
      }

      // 2. Four (1 seul)
      if (oF <= t) {
        // Priorité four : recette dont le step actuel est OVEN et qui a le plus de travail restant
        let cand = prio.filter(s => s.at <= t && s.idx < s.steps.length && s.steps[s.idx].type === 'OVEN');
        if (cand.length) {
          let s = cand[0];
          let st = s.steps[s.idx], sl = Math.ceil(st.dur / SLOT);
          for (let k = 0; k < sl && (t+k) < NS; k++)
            grid[t+k][s.i] = {type:'OVEN', n:st.n, alert:st.alert};
          oF = t + sl; s.idx++; s.at = t + sl;
          if (s.idx >= s.steps.length) s.done = true;
        }
      }

      // 3. Manuel (1 opérateur)
      if (mF <= t) {
        let best = null, bSc = -1;
        for (let s of prio) {
          if (s.at > t || s.idx >= s.steps.length) continue;
          if (s.steps[s.idx].type === 'MANUAL') {
            let nxt = s.steps[s.idx+1];
            let bg = nxt && ['REST','RISE','COOL'].includes(nxt.type) ? nxt.dur : 0;
            let rem = s.steps.slice(s.idx).reduce((a,x)=>a+x.dur,0);
            let sc = bg * 10 + rem;
            if (sc > bSc) { bSc = sc; best = s; }
          }
        }
        if (best) {
          let st = best.steps[best.idx], sl = Math.ceil(st.dur / SLOT);
          for (let k = 0; k < sl && (t+k) < NS; k++)
            grid[t+k][best.i] = {type:'MANUAL', n:st.n, alert:st.alert};
          mF = t + sl; best.idx++; best.at = t + sl;
          if (best.idx >= best.steps.length) best.done = true;
        }
      }
    }

    // Dernier slot : Nettoyage + Présentation
    for (let i = 0; i < N; i++)
      grid[LAST][i] = {type:'MANUAL',n:'🧹 Nettoyage poste — 🎯 Dressage — Présentation jury'};

    return { grid, S, NS };
  }

  /* ============================================================
     RENDU GANTT PLEINE LARGEUR
     ============================================================ */
  function render(res, recipes) {
    const ct = document.getElementById('schedulerResult');
    if (!ct) return;
    const { grid, S, NS } = res;
    const N = recipes.length;

    const inc = S.filter(s => !s.done);
    let h = '';
    if (inc.length)
      h += `<div class="g-warn">⚠️ <strong>Attention :</strong> ${inc.map(s => recipes[s.i].name).join(', ')} — non terminé(es) dans le temps imparti. Réduisez le nombre de recettes.</div>`;

    h += '<div class="g-wrap"><table class="g-tbl">';
    h += '<thead><tr><th class="g-hd-t">Heure</th>';
    recipes.forEach(r => {
      h += `<th class="g-hd-r" style="border-bottom:5px solid ${COL[r.id]||'#888'}">${r.icon} ${r.name}</th>`;
    });
    h += '</tr></thead><tbody>';

    for (let t = 0; t < NS; t++) {
      let hr = Math.floor((t*15)/60), mn = (t*15)%60;
      let tm = `${hr}h${mn.toString().padStart(2,'0')}`;
      let last = t === NS-1;
      h += `<tr class="g-row${last?' g-last':''}"><td class="g-tm">${tm}</td>`;
      for (let i = 0; i < N; i++) {
        let c = grid[t][i];
        if (!c) { h += '<td class="g-c g-free"><div class="g-in g-empty-in">— libre —</div></td>'; continue; }
        let cls='g-c ',ic='';
        switch(c.type){
          case'OVEN':cls+='g-ov';ic='🔥';break;
          case'REST':cls+='g-rs';ic='❄️';break;
          case'RISE':cls+='g-ri';ic='⏳';break;
          case'COOL':cls+='g-co';ic='🧊';break;
          default:cls+='g-ma';ic='🧑‍🍳';break;
        }
        h += `<td class="${cls}"><div class="g-in">${ic} <span class="g-tx">${c.n}</span>`;
        if (c.alert) h += `<br><em class="g-al">${c.alert}</em>`;
        h += '</div></td>';
      }
      h += '</tr>';
    }
    h += '</tbody></table></div>';

    // Légende
    h += `<div class="g-leg">
      <span class="gl"><span class="glb g-ma"></span>🧑‍🍳 Action manuelle</span>
      <span class="gl"><span class="glb g-ov"></span>🔥 Cuisson (four)</span>
      <span class="gl"><span class="glb g-rs"></span>❄️ Repos froid</span>
      <span class="gl"><span class="glb g-ri"></span>⏳ Pousse étuve</span>
      <span class="gl"><span class="glb g-co"></span>🧊 Ressuage / Refroidissement</span>
    </div>`;

    // Bouton imprimer
    h += `<div class="g-prt"><button class="btn btn-primary" onclick="window.print()" style="padding:1rem 3rem;font-size:1.1rem;border-radius:12px">🖨️ Imprimer l'ordonnancement</button></div>`;

    ct.innerHTML = h;
  }

  /* ============================================================
     CSS
     ============================================================ */
  function css() {
    if (document.getElementById('gCSS')) return;
    const s = document.createElement('style'); s.id = 'gCSS';
    s.textContent = `
#mgmtViewScheduler .mgmt-glass-card{max-width:none!important}
.scheduler-setup{margin-bottom:1.5rem}
.exam-type-selectors{display:flex;gap:1rem;margin:1rem 0;flex-wrap:wrap}
.exam-type-selectors .stats-toggle-btn{cursor:pointer;padding:.7rem 1.5rem;border-radius:10px;border:2px solid var(--surface-border,#ddd);background:var(--surface,#fff);transition:all .2s;font-size:.9rem;font-weight:600}
.exam-type-selectors .stats-toggle-btn:has(input:checked){border-color:var(--gold,#C5A55A);background:rgba(197,165,90,.12);box-shadow:0 0 0 3px rgba(197,165,90,.18)}
#schedulerRecipeList{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:.5rem}
.scheduler-recipe-card{display:flex;align-items:center;gap:10px;padding:10px 14px;border-radius:10px;border:1.5px solid var(--surface-border,#e0e0e0);background:var(--surface,#fff);cursor:pointer;transition:all .15s}
.scheduler-recipe-card:hover{border-color:var(--gold,#C5A55A);background:rgba(197,165,90,.04)}
.scheduler-recipe-card input[type="checkbox"]{width:20px;height:20px;accent-color:var(--gold,#C5A55A);cursor:pointer;flex-shrink:0}
.scheduler-recipe-card label{cursor:pointer;font-size:.88rem;font-weight:500;line-height:1.3}
.g-warn{background:rgba(255,152,0,.08);border:1px solid rgba(255,152,0,.3);border-left:5px solid #FF9800;border-radius:10px;padding:1rem 1.2rem;margin-bottom:1.5rem;font-size:.9rem}
.g-wrap{overflow-x:auto;border-radius:14px;border:2px solid var(--surface-border,#ddd);box-shadow:0 6px 30px rgba(0,0,0,.07)}
.g-tbl{width:100%;border-collapse:collapse;table-layout:fixed;min-width:850px}
.g-hd-t{background:#2A1508;color:#F5E6C8;padding:1rem .6rem;font-size:.82rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;width:85px;min-width:85px;text-align:center;position:sticky;top:0;left:0;z-index:4}
.g-hd-r{background:#2A1508;color:#F5E6C8;padding:1rem .6rem;font-size:.88rem;font-weight:700;text-align:center;position:sticky;top:0;z-index:3}
.g-row{transition:background .1s}
.g-row:hover{background:rgba(197,165,90,.04)!important}
.g-row:nth-child(even){background:rgba(0,0,0,.012)}
.g-last td{border-top:3px solid var(--gold,#C5A55A)!important}
.g-tm{font-weight:800;font-family:'Courier New',monospace;font-size:1.05rem;color:var(--primary,#333);padding:.8rem .5rem;text-align:center;background:var(--bg-alt,#faf8f5);border-right:3px solid var(--surface-border,#ddd);vertical-align:middle;position:sticky;left:0;z-index:2}
.g-c{padding:4px 6px;vertical-align:middle;border:1px solid rgba(0,0,0,.04);height:56px}
.g-in{padding:7px 10px;border-radius:8px;min-height:42px;display:flex;align-items:center;gap:6px;flex-wrap:wrap;line-height:1.35}
.g-empty-in{color:var(--text-muted,#bbb);font-size:.78rem;font-style:italic;justify-content:center;min-height:42px;background:rgba(0,0,0,.01);border-radius:8px}
.g-tx{font-weight:600;font-size:.84rem}
.g-al{font-size:.7rem;color:#BF360C;font-style:italic;width:100%}
.g-ma{background:rgba(255,255,255,.95)}
.g-ma .g-in{background:rgba(250,248,243,.95);border-left:5px solid var(--gold,#C5A55A)}
.g-ov{background:rgba(211,47,47,.07)}
.g-ov .g-in{background:rgba(244,67,54,.1);border-left:5px solid #C62828;color:#B71C1C;font-weight:700}
.g-rs{background:rgba(21,101,192,.06)}
.g-rs .g-in{background:rgba(33,150,243,.09);border-left:5px solid #1565C0;color:#0D47A1}
.g-ri{background:rgba(230,108,0,.06)}
.g-ri .g-in{background:rgba(255,152,0,.09);border-left:5px solid #E65100;color:#BF360C}
.g-co{background:rgba(2,119,189,.05)}
.g-co .g-in{background:rgba(3,169,244,.08);border-left:5px solid #0277BD;color:#01579B}
.g-free{background:rgba(0,0,0,.01)}
.g-leg{display:flex;gap:1.8rem;flex-wrap:wrap;justify-content:center;margin-top:1.8rem;padding:1.2rem 2rem;background:var(--bg-alt,#faf8f5);border-radius:12px;border:1px solid var(--surface-border,#eee)}
.gl{display:flex;align-items:center;gap:7px;font-size:.88rem;font-weight:600}
.glb{width:32px;height:20px;border-radius:5px;border:1px solid rgba(0,0,0,.06)}
.glb.g-ma{background:rgba(250,248,243,1);border-left:4px solid var(--gold,#C5A55A)}
.glb.g-ov{background:rgba(244,67,54,.13);border-left:4px solid #C62828}
.glb.g-rs{background:rgba(33,150,243,.1);border-left:4px solid #1565C0}
.glb.g-ri{background:rgba(255,152,0,.1);border-left:4px solid #E65100}
.glb.g-co{background:rgba(3,169,244,.1);border-left:4px solid #0277BD}
.g-prt{display:flex;justify-content:center;margin-top:2.5rem;padding-bottom:1rem}
@media print{
  .g-prt,.scheduler-setup,.g-leg,.mgmt-tabs-premium,.mgmt-kpi-row,.hero,.app-header,.mobile-nav-bar,.g-warn{display:none!important}
  #mgmtViewScheduler,#appMgmt{display:block!important}
  .g-wrap{box-shadow:none;border:1px solid #ccc}
  .g-tbl{font-size:.74rem;min-width:0}
  .g-c{height:auto}
  .g-hd-t,.g-hd-r{background:#333!important;color:#fff!important;-webkit-print-color-adjust:exact;print-color-adjust:exact;padding:.5rem .3rem}
  .g-ov,.g-ov .g-in{background:rgba(244,67,54,.12)!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .g-rs .g-in,.g-co .g-in{background:rgba(33,150,243,.08)!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .g-ri .g-in{background:rgba(255,152,0,.08)!important;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  .g-last td{border-top:2px solid #333!important}
}
@media(max-width:768px){
  .g-tbl{font-size:.72rem}.g-hd-t{width:55px;min-width:55px}.g-c{height:auto}
  .g-in{padding:4px 5px;gap:4px;min-height:32px}.g-tx{font-size:.72rem}
}`;
    document.head.appendChild(s);
  }

  /* ============================================================
     API
     ============================================================ */
  window.switchExamType = function(type) {
    css();
    const list = document.getElementById('schedulerRecipeList');
    if (!list) return;
    list.innerHTML = '';
    (DB[type]||[]).forEach(r => {
      const d = document.createElement('div');
      d.className = 'scheduler-recipe-card';
      d.innerHTML = `<input type="checkbox" id="schk_${r.id}" value="${r.id}">
        <label for="schk_${r.id}">${r.icon} <strong>${r.name}</strong> <small style="color:var(--text-muted)">${r.cat}</small></label>`;
      d.addEventListener('click', e => { if (e.target.tagName !== 'INPUT') d.querySelector('input').click(); });
      list.appendChild(d);
    });
    document.querySelectorAll('input[name="examType"]').forEach(i => { i.checked = i.value === type; });
  };

  window.generateSchedule = function() {
    const cbs = document.querySelectorAll('#schedulerRecipeList input:checked');
    if (!cbs.length) { if (typeof showToast==='function') showToast('Sélectionnez au moins une recette.','warning'); return; }
    const type = document.querySelector('input[name="examType"]:checked').value;
    const sel = (DB[type]||[]).filter(r => Array.from(cbs).some(c=>c.value===r.id));
    render(schedule(sel), sel);
    if (typeof showToast==='function') showToast('✅ Chronogramme 4h30 généré !','success');
  };

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',css);
  else css();
})();
