// ============================================================================
// INGREDIENT DATABASE MODAL
// ============================================================================

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

// ============================================================================
// OPEN FOOD FACTS (OFF) API INTEGRATION
// ============================================================================

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
    return { kcal: 250, kj: 1046, proteins: 5, carbs: 30, sugar: 10, fats: 10, saturatedFat: 3, salt: 0.1 }; // Default
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

    // Health Bar logic
    const healthPercent = Math.min(100, (item.stock / (item.alertThreshold * 4)) * 100);
    const healthClass = isCritical ? 'health-critical' : (isLow ? 'health-low' : 'health-ok');
    const statusClass = isCritical ? 'status-critical' : 'status-ok';
    const statusLabel = isCritical ? '⚠️ ' + t('inv.health.critical') : '✅ ' + t('inv.health.ok');

    const emoji = getIngredientEmoji(item.name);

    // Price trend indicator from history
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

  // Build a combined list: inventory items (with real IDs) + DB ingredients not yet in inventory
  const allItems = [];

  // 1. All existing inventory items
  APP.inventory.forEach(item => {
    allItems.push({ id: item.id, name: item.name, unit: item.unit, fromInventory: true });
  });

  // 2. Ingredients from DB not yet in inventory (will be added on restock)
  (APP.ingredientDb || []).forEach(dbIng => {
    const already = APP.inventory.find(i => i.name.toLowerCase().trim() === dbIng.name.toLowerCase().trim());
    if (!already) {
      allItems.push({ id: 'db_' + dbIng.name, name: dbIng.name, unit: dbIng.unit, fromInventory: false, dbEntry: dbIng });
    }
  });

  // Sort alphabetically
  allItems.sort((a, b) => a.name.localeCompare(b.name, 'fr'));

  selector.innerHTML = '<option value="">— Sélectionner un ingrédient —</option>' +
    allItems.map(item => `<option value="${item.id}" data-unit="${item.unit}">${getIngredientEmoji(item.name)} ${item.name}</option>`).join('');

  selector.onchange = () => {
    const selected = allItems.find(i => i.id === selector.value);
    if (selected && $('#restockUnit')) $('#restockUnit').value = selected.unit;
  };

  // Trigger initial value
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

  // Check if item is already in inventory
  let item = APP.inventory.find(i => i.id === itemId);

  // If not in inventory but from DB (id starts with 'db_'), auto-create it
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

    // Logic: if totalLotPrice is provided, update the reference price in the DB
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
    
    // Sort suppliers
    const activeSuppliers = APP.suppliers || [];
    if (activeSuppliers.length === 0) {
      container.innerHTML = `<p style="font-size:0.8rem; text-align:center; color:var(--text-muted);">Aucun fournisseur enregistré. <br/>Ajoutez des fournisseurs dans l'onglet "Fournisseurs".</p>`;
    } else {
      activeSuppliers.forEach(sup => {
        // Find existing price configuration
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

  // Show the modal
  window.openModal('ingredientConfigModal');
}

async function saveIngredientConfig() {
  const id = $('#ingConfigId').value;
  const item = APP.inventory.find(i => i.id === id);
  if (!item) return;

  // 1. Update ingredient base data
  item.alertThreshold = parseFloat($('#ingConfigAlert').value) || 0;
  item.price = parseFloat($('#ingConfigPrice').value) || 0;

  // Save base inventory
  await saveInventory();

  // 2. Save supplier prices
  const inputs = $$('.supplier-price-input');
  for (const input of inputs) {
    const supplierId = input.dataset.supplierId;
    const priceVal = parseFloat(input.value);
    const unitSelect = document.querySelector(`.supplier-unit-select[data-supplier-id="${supplierId}"]`);
    const unitVal = unitSelect ? unitSelect.value : 'kg';

    // Find existing to update or create
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
      // If empty/invalid and existing, we delete it
      if (existingIdx !== -1) {
        const toDelete = APP.ingredientPrices[existingIdx];
        if (window.GourmetSync && typeof GourmetSync.supprimerIngredientPrice === 'function') {
          await GourmetSync.supprimerIngredientPrice(toDelete.id);
        }
        APP.ingredientPrices.splice(existingIdx, 1);
      }
    }
  }

  // Reload UI
  renderInventory();
  updateDashboard();
  
  // Close modal
  window.closeModal('ingredientConfigModal');
  if (typeof showToast === 'function') {
    showToast('✅ Configuration enregistrée !', 'success');
  }
}

// ============================================================================
// SUPPLIER & ORDER MANAGEMENT
// =====================================================================

function loadSuppliers() {
  const saved = localStorage.getItem('gourmet_suppliers');
  APP.suppliers = saved ? JSON.parse(saved) : [];
  if (!saved) saveSuppliers();

  // Charger les fournisseurs cloud en arrière-plan
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
            <button class="btn btn-outline" style="padding:6px 12px; font-size:0.75rem;" onclick="window.openSupplierOrderGenerator('${s.id}')">📝 Commander</button>
            <button class="btn-icon" title="Modifier" onclick="editSupplier('${s.id}')">✏️</button>
            <button class="btn-icon" title="Supprimer" onclick="deleteSupplier('${s.id}')" style="color:var(--danger); opacity:0.6;">🗑️</button>
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