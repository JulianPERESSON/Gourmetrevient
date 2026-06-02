/**
 * =====================================================================
 * SOUS-RECETTES.JS — Système de sous-recettes imbriquées
 * GourmetRevient Professional — Vanilla JS
 * =====================================================================
 * Fonctionnalités :
 *  - Ajout de sous-recettes dans une recette parente
 *  - Calcul du coût au prorata du poids + coefficient de rendement
 *  - Détection et blocage des dépendances circulaires (DFS)
 *  - Remontée automatique des allergènes en cascade
 *  - Visualisation de l'arbre de composition
 *  - Sync Supabase + file offline
 * =====================================================================
 */

const SousRecettes = (() => {

  // ====================================================================
  // UTILITAIRES INTERNES
  // ====================================================================

  /** Récupère toutes les recettes sauvegardées (locale + mémoire) */
  function _getAllRecipes() {
    const fromApp = window.APP ? (APP.savedRecipes || []) : [];
    try {
      const key = window.getUserRecipesKey ? getUserRecipesKey() : 'gourmetrevient_recipes_';
      const local = JSON.parse(localStorage.getItem(key) || '[]');
      // Merge : préférer APP.savedRecipes (plus récent)
      const merged = [...fromApp];
      local.forEach(r => {
        if (!merged.find(m => m.id === r.id)) merged.push(r);
      });
      return merged;
    } catch (e) {
      return fromApp;
    }
  }

  /** Calcule le poids total d'une recette en grammes */
  function getPoidsTotal(recipe) {
    if (!recipe || !recipe.ingredients) return 0;
    let total = 0;
    recipe.ingredients.forEach(ing => {
      const qty = parseFloat(ing.quantity) || 0;
      const unit = ing.unit || 'g';
      if (unit === 'kg' || unit === 'L') {
        total += qty * 1000;
      } else if (unit === 'g' || unit === 'ml') {
        total += qty;
      } else {
        // pièce : approximation 50g par pièce (comportement existant)
        total += qty * 50;
      }
    });
    // Inclure aussi le poids des sous-recettes enfants si elles existent
    if (recipe.sousRecettes && recipe.sousRecettes.length > 0) {
      recipe.sousRecettes.forEach(sr => {
        total += parseFloat(sr.quantiteUtilisee) || 0;
      });
    }
    return total;
  }

  /** Calcule le coût total d'une recette (ingrédients + sous-recettes), avec protection anti-boucle */
  function _calcCoutTotal(recipe, visited = new Set()) {
    if (!recipe) return 0;
    if (visited.has(recipe.id)) return 0; // Protection anti-boucle
    visited.add(recipe.id);

    let cout = 0;

    // Ingrédients classiques
    if (recipe.ingredients) {
      recipe.ingredients.forEach(ing => {
        if (window.calcIngredientCost) {
          cout += calcIngredientCost(ing);
        }
      });
    }

    // Sous-recettes imbriquées
    if (recipe.sousRecettes) {
      recipe.sousRecettes.forEach(sr => {
        const enfant = _getAllRecipes().find(r => r.id === sr.recetteEnfantId);
        if (enfant) {
          const visitedCopy = new Set(visited);
          const coutEnfant = _calcCoutTotal(enfant, visitedCopy);
          const poidsEnfant = getPoidsTotal(enfant);
          if (poidsEnfant > 0) {
            const qte = parseFloat(sr.quantiteUtilisee) || 0;
            const rendement = parseFloat(sr.rendement) || 100;
            cout += (coutEnfant / poidsEnfant) * qte / (rendement / 100);
          }
        }
      });
    }

    return cout;
  }

  // ====================================================================
  // ANTI-BOUCLE (DFS — Depth First Search)
  // ====================================================================

  /**
   * Détecte si ajouter `enfantId` dans `parentId` créerait une boucle.
   * @param {string} parentId - ID de la recette parente (celle qu'on édite)
   * @param {string} enfantId - ID de la recette enfant qu'on veut ajouter
   * @returns {boolean} true si circulaire
   */
  function detectCircularDependency(parentId, enfantId) {
    if (parentId === enfantId) return true;

    const allRecipes = _getAllRecipes();
    const enfant = allRecipes.find(r => r.id === enfantId);
    if (!enfant || !enfant.sousRecettes) return false;

    for (const sr of enfant.sousRecettes) {
      if (detectCircularDependency(parentId, sr.recetteEnfantId)) {
        return true;
      }
    }
    return false;
  }

  // ====================================================================
  // CALCUL DU COÛT D'UNE SOUS-RECETTE IMPUTÉE
  // ====================================================================

  /**
   * Calcule le coût imputé d'une sous-recette dans la recette parente.
   * Formule : (coût_total_enfant / poids_total_enfant) × quantité_utilisée / (rendement/100)
   * @param {object} sr - entrée sousRecette { recetteEnfantId, quantiteUtilisee, rendement }
   * @returns {number} coût en euros
   */
  function calcCoutSousRecette(sr) {
    if (!sr || !sr.recetteEnfantId) return 0;
    const allRecipes = _getAllRecipes();
    const enfant = allRecipes.find(r => r.id === sr.recetteEnfantId);
    if (!enfant) return 0;

    const coutEnfant = _calcCoutTotal(enfant, new Set());
    const poidsEnfant = getPoidsTotal(enfant);
    if (poidsEnfant <= 0) return 0;

    const qte = parseFloat(sr.quantiteUtilisee) || 0;
    const rendement = parseFloat(sr.rendement) || 100;

    return (coutEnfant / poidsEnfant) * qte / (rendement / 100);
  }

  // ====================================================================
  // TOTAL COÛT MATIÈRE (ingrédients + sous-recettes)
  // ====================================================================

  /** Recalcule le coût matière total incluant les sous-recettes */
  function calcTotalAvecSousRecettes() {
    const r = window.APP ? APP.recipe : null;
    if (!r) return 0;

    let total = 0;

    // Ingrédients classiques
    if (r.ingredients && window.calcIngredientCost) {
      r.ingredients.forEach(ing => { total += calcIngredientCost(ing); });
    }

    // Sous-recettes
    if (r.sousRecettes) {
      r.sousRecettes.forEach(sr => { total += calcCoutSousRecette(sr); });
    }

    return total;
  }

  // ====================================================================
  // ALLERGÈNES EN CASCADE
  // ====================================================================

  /**
   * Remonte tous les allergènes d'une recette, en cascade dans ses sous-recettes.
   * @param {object} recipe
   * @param {Set} visited - protection anti-boucle
   * @returns {string[]} liste dédupliquée d'allergènes
   */
  function getAllergenesFromRecipe(recipe, visited = new Set()) {
    if (!recipe || visited.has(recipe.id)) return [];
    visited.add(recipe.id);

    const allergens = new Set();

    // Depuis les ingrédients classiques
    if (recipe.ingredients) {
      recipe.ingredients.forEach(ing => {
        const dbIng = window.APP
          ? APP.ingredientDb.find(i => i.name.toLowerCase() === ing.name.toLowerCase())
          : null;
        if (dbIng && dbIng.allergens) {
          dbIng.allergens.forEach(a => allergens.add(a));
        }
        if (ing.allergens) {
          ing.allergens.forEach(a => allergens.add(a));
        }
      });
    }

    // Depuis les sous-recettes (cascade)
    if (recipe.sousRecettes) {
      const allRecipes = _getAllRecipes();
      recipe.sousRecettes.forEach(sr => {
        const enfant = allRecipes.find(r => r.id === sr.recetteEnfantId);
        if (enfant) {
          getAllergenesFromRecipe(enfant, new Set(visited)).forEach(a => allergens.add(a));
        }
      });
    }

    return [...allergens];
  }

  // ====================================================================
  // INITIALISATION DE APP.recipe.sousRecettes
  // ====================================================================

  function _ensureSousRecettes() {
    if (!window.APP) return;
    if (!APP.recipe.sousRecettes) APP.recipe.sousRecettes = [];
  }

  // ====================================================================
  // AJOUT / SUPPRESSION
  // ====================================================================

  function addSousRecette(recetteEnfantId, quantite, rendement) {
    _ensureSousRecettes();
    const r = APP.recipe;

    // Vérification anti-boucle
    if (detectCircularDependency(r.id, recetteEnfantId)) {
      if (window.showToast) {
        showToast('⚠️ Cette sous-recette crée une dépendance circulaire. Ajout annulé.', 'error');
      }
      return false;
    }

    const allRecipes = _getAllRecipes();
    const enfant = allRecipes.find(re => re.id === recetteEnfantId);
    if (!enfant) {
      if (window.showToast) showToast('Recette enfant introuvable.', 'error');
      return false;
    }

    const sr = {
      id: 'sr_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
      recetteEnfantId,
      recetteEnfantNom: enfant.name,
      quantiteUtilisee: parseFloat(quantite) || 0,
      rendement: parseFloat(rendement) || 100,
    };

    APP.recipe.sousRecettes.push(sr);
    if (window.renderIngredients) renderIngredients();
    if (window.updateIngredientsTotal) updateIngredientsTotal();
    return true;
  }

  function removeSousRecette(idx) {
    _ensureSousRecettes();
    APP.recipe.sousRecettes.splice(idx, 1);
    if (window.renderIngredients) renderIngredients();
    if (window.updateIngredientsTotal) updateIngredientsTotal();
  }

  // ====================================================================
  // RENDU DES LIGNES DE SOUS-RECETTES
  // ====================================================================

  function renderSousRecetteRows() {
    const container = document.getElementById('ingredientsList');
    if (!container || !window.APP) return;

    _ensureSousRecettes();
    const r = APP.recipe;
    if (!r.sousRecettes || r.sousRecettes.length === 0) return;

    const allRecipes = _getAllRecipes();

    r.sousRecettes.forEach((sr, idx) => {
      const cout = calcCoutSousRecette(sr);
      const enfant = allRecipes.find(re => re.id === sr.recetteEnfantId);
      const poidsTotal = enfant ? getPoidsTotal(enfant) : 0;
      const coutTotal = enfant ? _calcCoutTotal(enfant, new Set()) : 0;
      const rendementLabel = (parseFloat(sr.rendement) || 100) < 100
        ? ` <span class="sr-rendement-badge">⚙ ${sr.rendement}% rdt</span>`
        : '';

      const row = document.createElement('div');
      row.className = 'ing-row sr-row';
      row.dataset.srIdx = idx;

      row.innerHTML = `
        <div class="ing-name" style="position:relative;">
          <div class="ing-row-icon">🔗</div>
          <div class="sr-name-block">
            <em class="sr-name">${escapeHtml ? escapeHtml(sr.recetteEnfantNom) : sr.recetteEnfantNom}</em>
            <span class="sr-badge">Sous-recette</span>
            ${rendementLabel}
          </div>
        </div>
        <div class="ing-qty">
          <input type="number" class="form-input sr-input" data-sr-field="quantiteUtilisee"
            value="${sr.quantiteUtilisee}" min="0" step="any" placeholder="g" />
        </div>
        <div class="ing-unit">
          <span class="sr-unit-label">g</span>
        </div>
        <div class="ing-price sr-info">
          <small class="sr-ratio">${poidsTotal > 0 ? (coutTotal / poidsTotal * 1000).toFixed(2) : '—'} €/kg</small>
          <input type="number" class="form-input sr-input sr-rendement-input" data-sr-field="rendement"
            value="${sr.rendement}" min="1" max="100" step="1" placeholder="%" title="Rendement (%)" style="width:70px; font-size:0.8rem;" />
        </div>
        <div class="ing-cost sr-cost">${cout.toFixed(2)} €</div>
        <button class="btn-remove sr-remove" data-sr-remove="${idx}" title="Supprimer cette sous-recette">✕</button>
      `;

      // Inputs de modification
      row.querySelectorAll('.sr-input').forEach(input => {
        input.addEventListener('input', () => {
          const field = input.dataset.srField;
          APP.recipe.sousRecettes[idx][field] = parseFloat(input.value) || 0;
          // Recalcul du coût affiché
          const newCout = calcCoutSousRecette(APP.recipe.sousRecettes[idx]);
          row.querySelector('.sr-cost').textContent = newCout.toFixed(2) + ' €';
          if (window.updateIngredientsTotal) updateIngredientsTotal();
        });
      });

      // Lien vers la sous-recette
      row.querySelector('.sr-name').style.cursor = 'pointer';
      row.querySelector('.sr-name').title = 'Ouvrir la recette ' + sr.recetteEnfantNom;
      row.querySelector('.sr-name').addEventListener('click', () => {
        if (window.loadRecipe && sr.recetteEnfantId) {
          loadRecipe(sr.recetteEnfantId);
          if (window.goToStep) goToStep(5);
        }
      });

      // Bouton supprimer
      row.querySelector('[data-sr-remove]').addEventListener('click', () => {
        removeSousRecette(idx);
      });

      container.appendChild(row);
    });
  }

  // ====================================================================
  // MODAL D'AJOUT DE SOUS-RECETTE
  // ====================================================================

  function openAddModal() {
    // Créer ou récupérer le modal
    let modal = document.getElementById('sousRecetteModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'sousRecetteModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-box sr-modal-box">
          <div class="modal-header">
            <h3>🔗 Ajouter une sous-recette</h3>
            <button class="modal-close" id="srModalClose">✕</button>
          </div>
          <div class="modal-body">
            <div class="form-group">
              <label for="srRecetteSelect">Sélectionner la recette :</label>
              <select class="form-input" id="srRecetteSelect">
                <option value="">— Choisir une recette —</option>
              </select>
            </div>
            <div class="form-group">
              <label for="srQuantite">Quantité utilisée (g) :</label>
              <input type="number" class="form-input" id="srQuantite" min="0" step="any" placeholder="Ex: 200" />
            </div>
            <div class="form-group">
              <label for="srRendement">
                Rendement (%) <span style="color:var(--text-muted); font-weight:400;">— optionnel</span>
              </label>
              <input type="number" class="form-input" id="srRendement" min="1" max="100" step="1" value="100" />
              <small style="color:var(--text-muted);">
                Ex: fraises à parer → 85%, réduction → 60%
              </small>
            </div>
            <div id="srCoutEstime" class="sr-cout-preview" style="display:none;">
              <span class="sr-cout-icon">💰</span>
              <span id="srCoutEstimeVal"></span>
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="srCancelBtn">Annuler</button>
            <button class="btn btn-primary" id="srConfirmBtn">🔗 Ajouter la sous-recette</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Event: fermer
      modal.querySelector('#srModalClose').addEventListener('click', () => closeAddModal());
      modal.querySelector('#srCancelBtn').addEventListener('click', () => closeAddModal());
      modal.addEventListener('click', e => { if (e.target === modal) closeAddModal(); });

      // Event: confirmer
      modal.querySelector('#srConfirmBtn').addEventListener('click', () => {
        const select = modal.querySelector('#srRecetteSelect');
        const quantite = parseFloat(modal.querySelector('#srQuantite').value);
        const rendement = parseFloat(modal.querySelector('#srRendement').value) || 100;

        if (!select.value) {
          if (window.showToast) showToast('Veuillez sélectionner une recette.', 'error');
          return;
        }
        if (!quantite || quantite <= 0) {
          if (window.showToast) showToast('Veuillez saisir une quantité valide.', 'error');
          return;
        }

        const success = addSousRecette(select.value, quantite, rendement);
        if (success) {
          closeAddModal();
          if (window.showToast) showToast('✅ Sous-recette ajoutée avec succès.', 'success');
        }
      });

      // Event: preview coût estimé
      const updatePreview = () => {
        const select = modal.querySelector('#srRecetteSelect');
        const qte = parseFloat(modal.querySelector('#srQuantite').value) || 0;
        const rdt = parseFloat(modal.querySelector('#srRendement').value) || 100;
        const previewEl = modal.querySelector('#srCoutEstime');
        const valEl = modal.querySelector('#srCoutEstimeVal');

        if (select.value && qte > 0) {
          const allRecipes = _getAllRecipes();
          const enfant = allRecipes.find(r => r.id === select.value);
          if (enfant) {
            const coutEnfant = _calcCoutTotal(enfant, new Set());
            const poidsEnfant = getPoidsTotal(enfant);
            if (poidsEnfant > 0) {
              const cout = (coutEnfant / poidsEnfant) * qte / (rdt / 100);
              valEl.textContent = `Coût imputé estimé : ${cout.toFixed(2)} € pour ${qte}g`;
              previewEl.style.display = 'flex';
              return;
            }
          }
        }
        previewEl.style.display = 'none';
      };

      modal.querySelector('#srRecetteSelect').addEventListener('change', updatePreview);
      modal.querySelector('#srQuantite').addEventListener('input', updatePreview);
      modal.querySelector('#srRendement').addEventListener('input', updatePreview);
    }

    // Peupler le select avec les recettes disponibles (sauf la recette courante)
    const select = modal.querySelector('#srRecetteSelect');
    select.innerHTML = '<option value="">— Choisir une recette —</option>';
    const allRecipes = _getAllRecipes();
    const currentId = window.APP ? APP.recipe.id : null;

    allRecipes
      .filter(r => r.id !== currentId && r.name && r.name.trim())
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach(r => {
        const poidsTotal = getPoidsTotal(r);
        const coutTotal = _calcCoutTotal(r, new Set());
        const prixKg = poidsTotal > 0 ? (coutTotal / poidsTotal * 1000).toFixed(2) : '—';
        const option = document.createElement('option');
        option.value = r.id;
        option.textContent = `${r.name} (${prixKg} €/kg)`;
        select.appendChild(option);
      });

    // Reset
    modal.querySelector('#srQuantite').value = '';
    modal.querySelector('#srRendement').value = '100';
    modal.querySelector('#srCoutEstime').style.display = 'none';

    // Afficher
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-visible'));
  }

  function closeAddModal() {
    const modal = document.getElementById('sousRecetteModal');
    if (modal) {
      modal.classList.remove('modal-visible');
      setTimeout(() => { modal.style.display = 'none'; }, 250);
    }
  }

  // ====================================================================
  // MODAL ARBRE DE COMPOSITION
  // ====================================================================

  /**
   * Construit l'arbre textuel d'une recette.
   * @param {object} recipe
   * @param {string} prefix
   * @param {Set} visited
   * @returns {string} HTML
   */
  function _buildTreeHTML(recipe, prefix = '', visited = new Set()) {
    if (!recipe || visited.has(recipe.id)) return '';
    visited.add(recipe.id);

    const allRecipes = _getAllRecipes();
    let html = '';
    const items = [];

    // Ingrédients classiques
    if (recipe.ingredients) {
      recipe.ingredients.filter(i => i.name).forEach(ing => {
        const cout = window.calcIngredientCost ? calcIngredientCost(ing) : 0;
        const unitLabel = ing.unit === 'pièce' ? ' pcs' : ing.unit;
        items.push({
          label: `${ing.name}`,
          detail: `${ing.quantity}${unitLabel} — ${cout.toFixed(2)} €`,
          children: null,
          isSr: false,
        });
      });
    }

    // Sous-recettes
    if (recipe.sousRecettes) {
      recipe.sousRecettes.forEach(sr => {
        const cout = calcCoutSousRecette(sr);
        const enfant = allRecipes.find(r => r.id === sr.recetteEnfantId);
        items.push({
          label: sr.recetteEnfantNom,
          detail: `${sr.quantiteUtilisee}g — ${cout.toFixed(2)} €${parseFloat(sr.rendement) < 100 ? ` (rdt ${sr.rendement}%)` : ''}`,
          children: enfant,
          enfantVisited: new Set(visited),
          isSr: true,
          enfantId: sr.recetteEnfantId,
        });
      });
    }

    items.forEach((item, i) => {
      const isLast = i === items.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const childPrefix = isLast ? '    ' : '│   ';

      if (item.isSr) {
        html += `<div class="tree-line tree-sr-line">
          <span class="tree-connector">${prefix}${connector}</span>
          <span class="tree-sr-name">🔗 ${escapeHtml ? escapeHtml(item.label) : item.label}</span>
          <span class="tree-detail"> — ${item.detail}</span>
        </div>`;
        if (item.children) {
          html += _buildTreeHTML(item.children, prefix + childPrefix, item.enfantVisited);
        }
      } else {
        html += `<div class="tree-line">
          <span class="tree-connector">${prefix}${connector}</span>
          <span class="tree-ing-name">${escapeHtml ? escapeHtml(item.label) : item.label}</span>
          <span class="tree-detail"> — ${item.detail}</span>
        </div>`;
      }
    });

    return html;
  }

  function openTreeModal(recipe) {
    const r = recipe || (window.APP ? APP.recipe : null);
    if (!r) return;

    let modal = document.getElementById('srTreeModal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'srTreeModal';
      modal.className = 'modal-overlay';
      modal.innerHTML = `
        <div class="modal-box sr-tree-modal-box">
          <div class="modal-header">
            <h3>🌳 Structure de composition</h3>
            <button class="modal-close" id="srTreeClose">✕</button>
          </div>
          <div class="modal-body">
            <div id="srTreeContent" class="tree-container"></div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="srTreeCloseBtn">Fermer</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);
      modal.querySelector('#srTreeClose').addEventListener('click', () => closeTreeModal());
      modal.querySelector('#srTreeCloseBtn').addEventListener('click', () => closeTreeModal());
      modal.addEventListener('click', e => { if (e.target === modal) closeTreeModal(); });
    }

    // En-tête recette
    const coutTotal = calcTotalAvecSousRecettes();
    const poids = getPoidsTotal(r);
    const treeContent = modal.querySelector('#srTreeContent');

    treeContent.innerHTML = `
      <div class="tree-root">
        <span class="tree-root-icon">🎂</span>
        <strong>${escapeHtml ? escapeHtml(r.name || 'Recette') : (r.name || 'Recette')}</strong>
        <span class="tree-detail"> (coût total : ${coutTotal.toFixed(2)} €${poids > 0 ? ` · ${poids}g` : ''})</span>
      </div>
      <div class="tree-body">
        ${_buildTreeHTML(r)}
      </div>
    `;

    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('modal-visible'));
  }

  function closeTreeModal() {
    const modal = document.getElementById('srTreeModal');
    if (modal) {
      modal.classList.remove('modal-visible');
      setTimeout(() => { modal.style.display = 'none'; }, 250);
    }
  }

  // ====================================================================
  // SYNC SUPABASE
  // ====================================================================

  /**
   * Sauvegarde les sous-recettes de la recette courante dans Supabase.
   * Fallback vers la file offline si hors ligne.
   */
  async function syncToSupabase(parentRecipeId) {
    if (!parentRecipeId || !window.APP) return;
    _ensureSousRecettes();

    const sousRecettes = APP.recipe.sousRecettes || [];

    if (!navigator.onLine || !window.gourmetSupabase) {
      // File offline
      sousRecettes.forEach(sr => {
        addToOfflineQueue({ parentRecipeId, sr });
      });
      return;
    }

    try {
      const { data: { session } } = await gourmetSupabase.auth.getSession();
      if (!session?.user?.id) return;
      const userId = session.user.id;

      // Supprimer les anciennes entrées pour cette recette parente
      await gourmetSupabase
        .from('recette_sous_recettes')
        .delete()
        .eq('recette_parente_id', parentRecipeId)
        .eq('user_id', userId);

      // Insérer les nouvelles
      if (sousRecettes.length > 0) {
        const rows = sousRecettes.map(sr => ({
          id: sr.supabaseId || undefined, // UUID Supabase si déjà connu
          user_id: userId,
          recette_parente_id: parentRecipeId,
          recette_enfant_id: sr.recetteEnfantId,
          quantite_utilisee: sr.quantiteUtilisee,
          rendement: sr.rendement || 100,
          updated_at: new Date().toISOString(),
        }));

        const { error } = await gourmetSupabase
          .from('recette_sous_recettes')
          .insert(rows);

        if (error) throw error;
      }
    } catch (err) {
      console.warn('[SousRecettes] Sync Supabase échoué, mise en queue:', err.message);
      sousRecettes.forEach(sr => addToOfflineQueue({ parentRecipeId, sr }));
    }
  }

  /**
   * Charge les sous-recettes depuis Supabase pour une recette parente.
   */
  async function loadFromSupabase(parentRecipeId) {
    if (!parentRecipeId) return;
    _ensureSousRecettes();

    if (!navigator.onLine || !window.gourmetSupabase) return;

    try {
      const { data: { session } } = await gourmetSupabase.auth.getSession();
      if (!session?.user?.id) return;

      const { data, error } = await gourmetSupabase
        .from('recette_sous_recettes')
        .select('*')
        .eq('recette_parente_id', parentRecipeId)
        .eq('user_id', session.user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        const allRecipes = _getAllRecipes();
        APP.recipe.sousRecettes = data.map(row => {
          const enfant = allRecipes.find(r => r.id === row.recette_enfant_id);
          return {
            id: 'sr_' + row.id.replace(/-/g, '').substr(0, 12),
            supabaseId: row.id,
            recetteEnfantId: row.recette_enfant_id,
            recetteEnfantNom: enfant ? enfant.name : '(Recette supprimée)',
            quantiteUtilisee: parseFloat(row.quantite_utilisee) || 0,
            rendement: parseFloat(row.rendement) || 100,
          };
        });
      }
    } catch (err) {
      console.warn('[SousRecettes] Chargement Supabase échoué:', err.message);
    }
  }

  // ====================================================================
  // FILE OFFLINE
  // ====================================================================

  const OFFLINE_KEY = 'gourmet_sr_offline_queue';

  function addToOfflineQueue(operation) {
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
      queue.push({ ...operation, timestamp: Date.now() });
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(queue));
    } catch (e) {
      console.warn('[SousRecettes] Impossible d\'ajouter à la file offline:', e);
    }
  }

  async function processOfflineQueue() {
    if (!navigator.onLine || !window.gourmetSupabase) return;
    try {
      const queue = JSON.parse(localStorage.getItem(OFFLINE_KEY) || '[]');
      if (queue.length === 0) return;

      const { data: { session } } = await gourmetSupabase.auth.getSession();
      if (!session?.user?.id) return;

      const remaining = [];
      for (const op of queue) {
        try {
          const row = {
            user_id: session.user.id,
            recette_parente_id: op.parentRecipeId,
            recette_enfant_id: op.sr.recetteEnfantId,
            quantite_utilisee: op.sr.quantiteUtilisee,
            rendement: op.sr.rendement || 100,
            updated_at: new Date().toISOString(),
          };
          const { error } = await gourmetSupabase
            .from('recette_sous_recettes')
            .upsert(row, { onConflict: 'recette_parente_id,recette_enfant_id' });
          if (error) throw error;
        } catch (err) {
          remaining.push(op);
        }
      }
      localStorage.setItem(OFFLINE_KEY, JSON.stringify(remaining));
    } catch (e) {
      console.warn('[SousRecettes] Erreur traitement file offline:', e);
    }
  }

  // Écouter le retour en ligne
  window.addEventListener('online', processOfflineQueue);

  // ====================================================================
  // MISE À JOUR DU TOTAL DANS L'UI
  // ====================================================================

  /**
   * Patch de updateIngredientsTotal pour inclure les sous-recettes.
   * Appelée après que app.js définit la fonction originale.
   */
  function patchUpdateIngredientsTotal() {
    const original = window.updateIngredientsTotal;
    window.updateIngredientsTotal = function() {
      const total = calcTotalAvecSousRecettes();
      const el = document.getElementById('ingredientsTotal');
      if (el) el.textContent = total.toFixed(2) + ' €';
    };
  }

  // ====================================================================
  // PATCH calcTotalMaterialCost
  // ====================================================================

  function patchCalcTotalMaterialCost() {
    window.calcTotalMaterialCost = function() {
      return calcTotalAvecSousRecettes();
    };
  }

  // ====================================================================
  // INIT
  // ====================================================================

  function init() {
    patchUpdateIngredientsTotal();
    patchCalcTotalMaterialCost();
    processOfflineQueue();
    console.log('[SousRecettes] Module initialisé ✅');
  }

  // Init dès que le DOM est prêt
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Léger délai pour s'assurer que app.js est chargé
    setTimeout(init, 0);
  }

  // ====================================================================
  // API PUBLIQUE
  // ====================================================================
  return {
    addSousRecette,
    removeSousRecette,
    calcCoutSousRecette,
    calcTotalAvecSousRecettes,
    getPoidsTotal,
    getAllergenesFromRecipe,
    detectCircularDependency,
    renderSousRecetteRows,
    openAddModal,
    closeAddModal,
    openTreeModal,
    closeTreeModal,
    syncToSupabase,
    loadFromSupabase,
    addToOfflineQueue,
    processOfflineQueue,
  };

})();

window.SousRecettes = SousRecettes;
