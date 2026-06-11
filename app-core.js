// ============================================================================
// UTILITIES
// ============================================================================

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
// round2 is already defined in data.js

// Global helper: close any modal by ID (used by CRM, index.html onclick handlers)
window.closeModal = function(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.classList.remove('modal-visible');
  // Wait for CSS transition then hide
  setTimeout(() => { if (!m.classList.contains('modal-visible')) m.style.display = 'none'; }, 260);
};

// Global helper: open any modal-overlay by ID (adds modal-visible for fade-in)
window.openModal = function(id) {
  const m = document.getElementById(id);
  if (!m) return;
  m.style.display = 'flex';
  requestAnimationFrame(() => m.classList.add('modal-visible'));

  // Enregistrer le moment de l'ouverture pour éviter les fermetures intempestives (ghost clicks mobiles)
  m._openedAt = Date.now();

  // Liste des modals devant se fermer au clic sur l'arrière-plan (backdrop)
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
      // Le clic doit impérativement commencer sur le fond du modal lui-même
      mousedownOnSelf = (e.target === m);
    });
    
    m.addEventListener('click', (e) => {
      // Le clic doit également se terminer sur le fond du modal lui-même
      if (e.target === m && mousedownOnSelf) {
        // Bloquer les fermetures immédiates dans les 300ms suivant l'ouverture (anti-rebond tactile)
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

// ============================================================================
// INGREDIENT COST CALCULATION
// ============================================================================

function calcIngredientCost(ing, depth = 0) {
  if (depth > 5) return 0; // Prevent infinite recursion

  const qty = parseFloat(ing.quantity) || 0;
  const unit = ing.unit || 'g';

  // RECURSIVE COST CALCULATION: Check if ingredient is a sub-recipe (Composition)
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

    // Convert requested qty to grams
    let reqQtyInGrams = qty;
    if (unit === 'kg' || unit === 'L') reqQtyInGrams *= 1000;

    const rendement = parseFloat(ing.rendement) || 100;

    // If unit is 'piece', we fallback to treating qty as chunks of total weight (e.g. 1 piece = 1 whole recipe).
    if (unit === 'pièce') {
       return (subCost * qty) / (rendement / 100); // Total sub-recipe cost * number of pieces
    }

    // Cost per gram * requested grams
    return ((subCost / subWeightGrams) * reqQtyInGrams) / (rendement / 100);
  }

  let price = parseFloat(ing.pricePerUnit);
  if (isNaN(price)) price = parseFloat(ing.pricePerKg);
  if (isNaN(price)) price = parseFloat(ing.pricePerL);
  if (isNaN(price)) price = parseFloat(ing.pricePerPc);
  if (isNaN(price)) price = 0;

  // Appliquer la hausse spécifique d'ingrédient si présente
  if (window.ingredientPriceOverrides && ing.name) {
    const overridePercent = window.ingredientPriceOverrides[ing.name.trim().toLowerCase()];
    if (overridePercent !== undefined) {
      price = price * (1 + overridePercent / 100);
    }
  }

  // price is per kg, per L, or per pièce
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
  // Ensure it's available globally for pro-features.js
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

  // Use either live UI values or saved values
  let laborRate = 0, fixedCharges = 0, productions = 1, energyRate = 0, amortization = 0;
  let packagingCost = 0, apprenticeTime = 0, commisTime = 0, chefTime = 0;

  // Only use DOM values if we are processing the CURRENT active recipe
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

  const energyCost = (energyRate * (cookTime / 60)) * costMultiplier; // Energy also affected by inflation
  const fixedShare = fixedCharges / productions;
  const amortShare = amortization / productions;

  const additionalCosts = laborCost + energyCost + fixedShare + amortShare;
  // Packaging is a direct material cost per portion, total full cost includes packaging * portions
  const totalFullCost = totalMaterial + additionalCosts + (packagingCost * portions);

  const costPerPortion = totalFullCost / portions;
  const marginRate = (margin || APP.margin) / 100;

  // Selling price based on FULL cost
  const sellingPrice = marginRate < 1 ? costPerPortion / (1 - marginRate) : costPerPortion * 10;
  const marginPerPortion = sellingPrice - costPerPortion;
  const marginPct = sellingPrice > 0 ? (marginPerPortion / sellingPrice) * 100 : 0;

  // TVA calculations
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

// ============================================================================
// LOCAL STORAGE
// ============================================================================

function getViewOwner() {
  return APP.viewOwner || localStorage.getItem(STORAGE_KEYS.currentUser) || 'Ami';
}

function getUserRecipesKey() {
  const uid = localStorage.getItem('gourmet_user_id');
  if (uid) return `gourmet_recettes_${uid}`;
  // Fallback legacy (avant connexion Supabase)
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

    // Migration automatique : si des données existent sous l'ancienne clé (username)
    // et que la nouvelle clé (UUID) est vide, on les transfère une seule fois
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

    // 1. Charger du cache local (Immédiat pour affichage instantané)
    const localData = localStorage.getItem(key);
    if (localData) APP.savedRecipes = JSON.parse(localData);

    // 2. Le cloud est la source de vérité si connecté
    if (window.GourmetSync && navigator.onLine) {
        const cloudData = await GourmetSync.chargerRecettes();
        // Accepter le cloud même si vide (l'utilisateur a pu tout supprimer sur un autre appareil)
        if (cloudData !== null && cloudData !== undefined) {
            APP.savedRecipes = cloudData;
            localStorage.setItem(key, JSON.stringify(cloudData));
        }
    }

    // Calcul des coûts si manquants
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
  // Classic recipes to showcase stats
  const demoPool = (typeof RECIPES !== 'undefined') ? RECIPES.slice(0, 15) : [];

  demoPool.forEach(r => {
    // Check if a recipe with the same name already exists in savedRecipes
    const exists = APP.savedRecipes.some(saved => saved.name === r.name);
    if (!exists) {
      const copy = JSON.parse(JSON.stringify(r));
      copy.savedAt = new Date().toISOString();
      copy.margin = 68 + (Math.random() * 12); // Realistic variety in margins
      copy.costs = calcFullCost(copy.margin, copy);
      APP.savedRecipes.push(copy);
    }
  });

  // Fill some inventory to show stock value
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

    // Merge logic: keep saved values for existing names, add new missing names from DEFAULT
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
  
  // 1. Load local cache as a starting point (offline fallback only)
  const userData = localStorage.getItem(userKey);
  if (userData) {
    try { APP.inventory = JSON.parse(userData); } catch(e) { APP.inventory = []; }
  }

  // 2. Cloud = source de vérité si connecté
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
            // Cloud a des données → vérité absolue
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
            // Cloud vide → nouveau compte, initialiser à stock 0
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

        // --- CHARGEMENT DES PRIX PAR FOURNISSEUR ---
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

  // 3. Charger les labs partagés avec moi
  if (typeof GourmetSync !== 'undefined' && typeof GourmetSync.chargerLabsPartagesAvecMoi === 'function') {
    const shared = await GourmetSync.chargerLabsPartagesAvecMoi();
    APP.labShares = shared || [];
    refreshLabSwitcher();
  }

  // 4. If still empty offline, load structure at stock=0
  if (APP.inventory.length === 0) {
    const isDemo = localStorage.getItem('gourmet_demo_mode') === 'true';
    if (isDemo) {
      initInventoryFromDb(); // demo mode: add fake stocks
    } else {
      // Real mode offline: add structure with stock=0
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


// ============================================================================
// PARTAGE COLLABORATIF DE LABORATOIRE
// ============================================================================

/**
 * Met à jour le bouton de changement de labo dans la barre supérieure.
 * Visible uniquement si l'utilisateur a au moins un labo partagé actif.
 */
function refreshLabSwitcher() {
  const activeShares = APP.labShares.filter(s => s.status === 'active');
  const pendingShares = APP.labShares.filter(s => s.status === 'pending');
  let btn = $('#labSwitcherBtn');

  if (activeShares.length === 0 && pendingShares.length === 0) {
    if (btn) btn.style.display = 'none';
    return;
  }

  if (!btn) {
    // Créer le bouton dynamiquement dans la barre de navigation
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

  // ── Mettre à jour le widget sidebar ──
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

/**
 * Ouvre le modal de gestion des labs partagés
 */
async function openLabSwitcherModal() {
  const modal = $('#labSwitcherModal');
  if (!modal) return;
  // Charger les membres invités à l'ouverture
  if (typeof GourmetSync !== 'undefined' && typeof GourmetSync.chargerMembresPartages === 'function') {
    const membres = await GourmetSync.chargerMembresPartages();
    APP.membresPartages = membres || [];
  }
  // Mettre à jour la bannière du lab actif
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

/**
 * Génère le contenu du modal de gestion des labs partagés
 */
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

/**
 * Bascule vers un lab partagé ou vers son propre lab
 */
async function switchToLab(shareId, ownerUserId = null, ownerName = null, role = null) {
  if (shareId === null) {
    APP.activeLab = null;
    await loadInventory();
    if (typeof renderPlanning === 'function') renderPlanning();
    showToast('✅ Vous consultez votre propre laboratoire', 'success');
  } else {
    APP.activeLab = { share_id: shareId, owner_user_id: ownerUserId, owner_name: ownerName, role };
    showToast(`🔄 Chargement du labo de ${ownerName}…`, 'info');

    // Charger planning partagé
    if (typeof GourmetSync !== 'undefined') {
      const planning = await GourmetSync.chargerPlanningPartage(ownerUserId);
      if (planning !== null) {
        APP.productionPlanning = planning;
        if (typeof renderPlanning === 'function') renderPlanning();
      }
      // Charger inventaire partagé
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

/** Accepte une invitation de labo */
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

/** Refuse une invitation de labo */
async function refuserInvitation(shareId) {
  await GourmetSync.revoquerAccesLab(shareId);
  APP.labShares = APP.labShares.filter(s => s.share_id !== shareId);
  showToast('Invitation refusée', 'info');
  refreshLabSwitcher();
  renderLabSwitcherModal();
}

/** Quitte un labo partagé */
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

/** Révoque l'accès d'un membre invité */
async function revoquerMembre(shareId) {
  await GourmetSync.revoquerAccesLab(shareId);
  APP.membresPartages = APP.membresPartages.filter(m => m.id !== shareId);
  renderLabSwitcherModal();
  showToast('✅ Accès révoqué', 'success');
}

/** Envoie une invitation à un collaborateur */
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

/**
 * Synchronise l'inventaire avec le cloud (bouton "Synchronisation Ingrédients").
 * Le cloud est la source de vérité : si aucune donnée cloud, stocks = 0.
 */

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
      // Not authenticated → just add ingredient structure at stock=0
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
      // Cloud a des données → source de vérité
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

      // Ensure any DB ingredients not yet in cloud are added at stock=0 locally
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
      // Cloud has NO data for this user → fresh start, all stocks = 0
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
    // Fallback: just refresh the structure
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

// Price History Tracking — records each price change for trend analysis
function recordPriceChange(item, newPrice) {
  if (!item) return;
  const oldPrice = item.price || 0;
  // Don't record if price didn't actually change
  if (Math.abs(oldPrice - newPrice) < 0.001) return;
  
  if (!item.priceHistory) item.priceHistory = [];
  
  // Add snapshot
  item.priceHistory.push({
    price: newPrice,
    previousPrice: oldPrice,
    date: new Date().toISOString(),
    change: oldPrice > 0 ? ((newPrice - oldPrice) / oldPrice * 100).toFixed(1) : '0'
  });
  
  // Keep only last 20 entries to avoid localStorage bloat
  if (item.priceHistory.length > 20) {
    item.priceHistory = item.priceHistory.slice(-20);
  }
}

function initInventoryFromDb() {
  if (!Array.isArray(APP.inventory)) APP.inventory = [];
  
  let addedCount = 0;
  
  // Merge: add missing ingredients with stock=0, NEVER overwrite existing stock
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
    // Mettre à jour si de nouvelles données OFF arrivent
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

// TOAST NOTIFICATIONS
// ============================================================================

function showToast(message, type = 'info') {
  // Remove existing toasts
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

// ============================================================================
// NEW RECIPE (RESET)
// ============================================================================

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

  // Reset initialization state for advanced inputs
  ['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization', 'recipeTvaRate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) delete el.dataset.initialized;
  });

  goToStep(0);
}

// ============================================================================
// ONBOARDING STARTER DATA SEEDING
// ============================================================================

window.importStarterPack = async function() {
  const toastFn = typeof showToast === 'function' ? showToast : console.log;
  toastFn("Importation des données de base... ⏳", "info");

  // 1. List of 20 basic ingredients to seed (from DEFAULT_INGREDIENT_DB)
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
            stock: 0, // stock initialized to 0
            unit: ing.unit,
            price: ing.pricePerUnit, // at national average price
            alertThreshold: ing.unit === 'g' || ing.unit === 'ml' ? 1000 : 5,
            lastUpdate: new Date().toISOString()
          });
          addedIngCount++;
        }
      }
    });
  }

  // 2. Add Éclair au Chocolat model recipe if not exists
  let addedRecipe = false;
  if (typeof RECIPES !== 'undefined') {
    const eclair = RECIPES.find(r => r.id === 'eclair');
    if (eclair) {
      const exists = APP.savedRecipes.some(saved => saved.name.toLowerCase() === eclair.name.toLowerCase());
      if (!exists) {
        const copy = JSON.parse(JSON.stringify(eclair));
        copy.savedAt = new Date().toISOString();
        copy.margin = 70; // 70% standard margin
        if (typeof calcFullCost === 'function') {
          copy.costs = calcFullCost(copy.margin, copy);
        }
        APP.savedRecipes.push(copy);
        addedRecipe = true;
      }
    }
  }

  // Save changes locally and to Supabase
  if (addedIngCount > 0) {
    await saveInventory();
  }
  if (addedRecipe) {
    await saveSavedRecipes();
  }

  // Refresh UI
  if (typeof renderInventory === 'function') renderInventory();
  if (typeof renderSavedRecipes === 'function') renderSavedRecipes();
  if (typeof updateDashboard === 'function') updateDashboard();

  toastFn(`🎉 Pack importé : ${addedIngCount} ingrédients de base et 1 recette modèle ajoutée !`, 'success');
};

// ============================================================================