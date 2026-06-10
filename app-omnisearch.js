// OMNISEARCH SPOTLIGHT (CTRL+K)
// ============================================================================

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
  // Handle Cmd+K (Mac) or Ctrl+K (Windows)
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    toggleOmniSearch();
  }

  // Handle mobile bottom bar logic
  if (e.key === 'Escape' && $('#omniModal').style.display === 'flex') {
    toggleOmniSearch();
  }
});

// PWA Registration with update handling
window.addEventListener('load', () => {
  if ('serviceWorker' in navigator) {
    // Register the SW. Using a versioned URL helps force updates.
    navigator.serviceWorker.register('./sw.js').then(reg => {
      // Check for updates periodically
      setInterval(() => {
        reg.update();
      }, 1000 * 60 * 60); // Check every hour
      
      reg.onupdatefound = () => {
        const installingWorker = reg.installing;
        if (!installingWorker) return;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New content is available; show notification
            if (typeof showToast === 'function') {
              showToast("🔄 Mise à jour disponible — rechargez pour l'appliquer.", "info", 5000);
            }
          }
        };
      };
    }).catch(err => console.warn('[SW] Register error:', err));

    // Handle the 'controllerchange' event to reload when the new SW takes control
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      
      // Safety check: avoid reload loops
      const lastReload = sessionStorage.getItem('sw_last_reload');
      const now = Date.now();
      if (lastReload && (now - parseInt(lastReload)) < 2000) {
        console.warn('[SW] Loop detected, skipping reload.');
        return;
      }
      
      refreshing = true;
      sessionStorage.setItem('sw_last_reload', now.toString());
      
      // Add a small delay to avoid rapid reload loops and let the user see the notification
      setTimeout(() => {
        window.location.reload();
      }, 500);
    });

    // Handle messages from the SW (e.g. for offline sync)
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

  // 1. Navigation / Modules
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

  // 2. Saved Recipes
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

  // 3. Quick Actions
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

// ============================================================================
// UI HELPERS (EMPTY STATES & TOAST)
// ============================================================================

// ============================================================================
// EARCONS (UX Premium Sounds)
// ============================================================================

function playPremiumSuccessSound() {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    if (!window.audioCtx) window.audioCtx = new AudioContext();
    const ctx = window.audioCtx;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    // Son cristallin pur (clochette légère)
    osc.type = 'sine';
    osc.frequency.setValueAtTime(1567.98, ctx.currentTime); // G6
    osc.frequency.exponentialRampToValueAtTime(3135.96, ctx.currentTime + 0.05); // G7
    
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) { /* Fail silencieux */ }
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

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove toast
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

// ============================================================================
// NEW MODULES: ANTI-GASPI & QR CODE
// ============================================================================

function renderAntiGaspi() {
  const mod = $('#antiGaspiModule');
  const content = $('#antiGaspiContent');
  if (!mod || !content || !APP.recipe || !APP.recipe.ingredients) return;

  let hasWaste = false;
  let suggestions = [];

  // Analyze ingredients for potential waste/optimization
  APP.recipe.ingredients.forEach(ing => {
    if(!ing.name) return;
    const name = ing.name.toLowerCase();
    
    // Example 1: Egg Yolks/Whites
    if ((name.includes('jaune') && name.includes('oeuf')) || (name.includes('jaune') && name.includes('œuf'))) {
      hasWaste = true;
      suggestions.push(`🥚 <strong>Blancs d'œufs orphelins :</strong> Vous utilisez beaucoup de jaunes. Pensez à réaliser des <em>Macarons</em>, des <em>Financiers</em> ou des <em>Meringues</em> pour écouler vos blancs et optimiser la rentabilité.`);
    }
    else if ((name.includes('blanc') && name.includes('oeuf')) || (name.includes('blanc') && name.includes('œuf'))) {
      hasWaste = true;
      suggestions.push(`🥚 <strong>Jaunes d'œufs orphelins :</strong> Vous utilisez beaucoup de blancs. Vous pourriez préparer une <em>Crème anglaise</em>, un <em>Crémeux</em> ou une <em>Pâte sablée</em>.`);
    }

    // Example 2: Fruits
    if (name.includes('citron') || name.includes('orange') || name.includes('pamplemousse')) {
      hasWaste = true;
      suggestions.push(`🍋 <strong>Agrumes :</strong> Si vous n'utilisez que le jus, pensez à zester vos agrumes avant. Les zestes peuvent être séchés ou confits pour de futures préparations.`);
    }
    
    if (name.includes('fraise') || name.includes('framboise') || name.includes('pomme')) {
      hasWaste = true;
      suggestions.push(`🍓 <strong>Parures de fruits :</strong> Les parures ou fruits abîmés peuvent être converties en <em>Coulis</em>, <em>Confiture</em> ou <em>Pâte de fruits</em>.`);
    }
  });

  // Make suggestions unique
  suggestions = [...new Set(suggestions)];

  if (hasWaste && suggestions.length > 0) {
    mod.style.display = 'block';
    content.innerHTML = `<ul style="margin:0; padding-left:1.5rem; display:flex; flex-direction:column; gap:0.5rem;">
      ${suggestions.map(s => `<li>${s}</li>`).join('')}
    </ul>`;
  } else {
    // Standard tip if no direct matching
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
  
  // Calcule de la masse totale de la recette
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
        totalWeightG += qty * 50; // pièce approx 50g
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
  
  // Clear old QR Code
  const qrbox = document.getElementById('qrcode');
  if(qrbox) qrbox.innerHTML = '';
  
  // Generate QR linking to a fake product page (or the tool itself with recipe param)
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

  // Clone for export
  const clone = label.cloneNode(true);
  clone.style.width = '100%';
  clone.style.height = 'auto';
  clone.style.padding = '40px';
  clone.style.backgroundColor = '#ffffff';
  clone.style.display = 'block';
  
  // Force visibility of children
  clone.querySelectorAll('*').forEach(el => {
    el.style.opacity = '1';
    el.style.visibility = 'visible';
    el.style.color = '#333333';
  });
  
  // Explicitly fix QR code container if needed
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
  }, 1000); // More time for QR code
}

// ============================================================================
// GESTION PRO MODULE: SHOPPING LIST, ALLERGENS, WASTE, OBJECTIVES, PRODUCTION
// ============================================================================

let wasteChart = null;

// --- KPI Dashboard ---
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

// --- Shopping List ---
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

  // Store needs data for CSV export
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

// --- Allergen Matrix ---
function renderAllergenMatrix() {
  const table = document.getElementById('allergenMatrixTable');
  if (!table) return;

  // Aggregate saved and reference recipes
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
      // Manual detection rules
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

// --- Waste Tracking ---
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

  // Sync cloud
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
  
  // Render history
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

  // Render waste chart
  renderWasteChart(logs);
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

  // Monthly Report
  const reportEl = document.getElementById('wasteMonthlyReport');
  if (reportEl && logs.length > 0) {
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

  // Charger depuis Supabase en arrière-plan
  if (navigator.onLine && window.GourmetSync) {
    GourmetSync.chargerPertes().then(cloudLogs => {
      if (cloudLogs !== null && cloudLogs.length > 0) {
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

// --- Cost Objectives ---
function renderObjectives() {
  const grid = document.getElementById('objectivesGrid');
  if (!grid) return;

  const recipes = APP.savedRecipes || [];
  const wasteLogs = APP.wasteLogs || [];

  // Calculate real metrics
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

  // Define objectives
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

  // Breaking Point module
  calculateBreakingPoint();
  bindBreakingPointEvents();
}

function bindBreakingPointEvents() {
  const inputs = ['bpRent', 'bpSalaries', 'bpEnergy', 'bpOther'];
  
  // Load saved fixed costs
  const savedData = JSON.parse(localStorage.getItem('gourmet_fixed_costs') || '{}');
  inputs.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      if (savedData[id] !== undefined) el.value = savedData[id];
      // Avoid binding multiple times
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

  // Save to localStorage
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

// --- Production Planning ---
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
  
  // Pick first recipe as default
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

  // Sync cloud
  if (window.GourmetSync) GourmetSync.sauvegarderPlanning(newItem).catch(() => {});

  renderProductionPlan();
  showToast(t('mgmt.production.added') || "Production ajoutée !", "success");
}

function updateProductionStatus(idx, status) {
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  if (plan[idx]) {
    plan[idx].status = status;
    localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
    // Sync cloud
    if (window.GourmetSync) GourmetSync.sauvegarderPlanning(plan[idx]).catch(() => {});
    renderProductionPlan();
  }
}

function removeProductionItem(idx) {
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  const removed = plan[idx];
  plan.splice(idx, 1);
  localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
  // Supprimer du cloud si l'item a un UUID
  if (window.GourmetSync && removed && removed.id) {
    const isValidUUID = str => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
    if (isValidUUID(removed.id)) GourmetSync.supprimerPlanning(removed.id).catch(() => {});
  }
  renderProductionPlan();
}

/**
 * Professional Workflow: Launch production from a recipe summary
 */
function launchProductionFromRecipe() {
  if (!APP.recipe.name) {
    showToast(t('s5.subtitle.empty'), 'error');
    return;
  }
  
  // 1. Save it first to ensure existence
  saveCurrentRecipe();
  
  // 2. Add to production log
  const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
  plan.push({
    name: APP.recipe.name,
    recipeId: APP.recipe.id,
    qty: APP.recipe.portions || 10,
    status: 'todo',
    date: new Date().toISOString().split('T')[0]
  });
  localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
  
  // 3. Navigate to appropriate module
  if (typeof showMgmt === 'function') {
    showMgmt();
    if (typeof switchMgmtTab === 'function') switchMgmtTab('production');
  }
  
  if (typeof renderProductionPlan === 'function') renderProductionPlan();
  
  showToast(t('mgmt.production.added') || "Production lancée !", "success");
}

// ============================================================================
// PREMIUM BRANDING — MICRO-INTERACTIONS ENGINE
// ============================================================================

/**
 * 1. SPLASH SCREEN — Auto-dismiss with elegant fade
 */
(function initSplashScreen() {
  const splash = document.getElementById('premiumSplash');
  if (!splash) return;

  // Dismiss splash after animation completes (≈ 2.8s)
  const dismissTime = 2800;

  setTimeout(() => {
    splash.classList.add('fade-out');
    setTimeout(() => {
      splash.style.display = 'none';
    }, 800); // matches CSS transition duration
  }, dismissTime);
})();

/**
 * 2. CHOCOLATE RAIN — Celebration effect
 *    Triggered on step validation and recipe save
 */
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

  // Cleanup
  setTimeout(() => {
    container.innerHTML = '';
  }, duration);
}

// Make it globally available
window.triggerChocolateRain = triggerChocolateRain;

/**
 * 3. HOOK INTO goToStep — Add celebration on step forward navigation
 */
const _originalGoToStep = goToStep;
goToStep = function(step) {
  const previousStep = APP.currentStep;

  // Call original
  _originalGoToStep(step);

  // Trigger chocolate rain when advancing to next step (not going back)
  if (step > previousStep && previousStep >= 1) {
    triggerChocolateRain('light');
  }

  // Add page transition class
  const stepEl = document.querySelector(`#step${step}`);
  if (stepEl) {
    stepEl.classList.remove('page-transition-active');
    void stepEl.offsetWidth; // Force reflow
    stepEl.classList.add('page-transition-active');
  }
};

/**
 * 4. HOOK INTO saveCurrentRecipe — Epic rain on recipe save
 */
if (typeof saveCurrentRecipe === 'function') {
  const _originalSave = saveCurrentRecipe;
  saveCurrentRecipe = function() {
    _originalSave.apply(this, arguments);
    triggerChocolateRain('epic');
  };
}

/**
 * Premium features initialized.
 */

/**
 * 6. GOLDEN SEPARATOR — Automatically add elegant dividers
 */
(function addGoldenDividers() {
  document.addEventListener('DOMContentLoaded', () => {
    // Add a golden line under the morning briefing
    const briefing = document.querySelector('.morning-briefing');
    if (briefing && !briefing.nextElementSibling?.classList.contains('section-divider')) {
      const divider = document.createElement('div');
      divider.className = 'section-divider';
      briefing.after(divider);
    }
  });
})();

/**
 * 7. PREMIUM LOGO ANIMATION — Subtle shine on header brand hover
 */
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
// End of features
})();

/**
 * 8. GLOSSY CARDS EFFECT - DISABLED FOR PERFORMANCE
 */
document.addEventListener("DOMContentLoaded", () => {
  // Effect disabled to optimize performance and remove lag
});

// === ASSISTANT DE SAISONNALITÉ ===
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
// ===============================

// ============================================================================
// AUTO-SAVE DRAFTS & RECOVERY (PREMIUM)
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  // 1. Recover Draft (DEACTIVATED)
  /*
  setTimeout(() => {
    const draftStr = localStorage.getItem('gourmet_recipe_draft');
    if (draftStr && APP.currentStep === 0 && (!APP.recipe.name || APP.recipe.name === '')) {
      try {
        const draft = JSON.parse(draftStr);
        if (draft && draft.name && draft.ingredients && draft.ingredients.length > 0) {
          const wantRestore = confirm(t('draft.restore') || 'Un brouillon de recette non sauvegardé a été détecté. Voulez-vous restaurer votre travail ?');
          if (wantRestore) {
            APP.recipe = draft;
            APP.margin = draft.margin || 70;
            // Restore UI inputs
            if ($('#recipeName')) $('#recipeName').value = draft.name;
            if ($('#recipeCategory')) $('#recipeCategory').value = draft.category || '';
            if ($('#recipePortions')) $('#recipePortions').value = draft.portions || 10;
            if ($('#recipePrepTime')) $('#recipePrepTime').value = draft.prepTime || 60;
            if ($('#recipeCookTime')) $('#recipeCookTime').value = draft.cookTime || 30;
            if ($('#recipeDesc')) $('#recipeDesc').value = draft.description || '';
            
            showToast('Brouillon restauré avec succès.', 'success');
            goToStep(1); // Jump to ingredients
          } else {
            localStorage.removeItem('gourmet_recipe_draft');
          }
        }
      } catch (e) {
        console.warn('Draft parsing failed:', e);
      }
    }
  }, 500);
  */

  // 2. Background Auto-save every 15 seconds if editing
  setInterval(() => {
    // Only save if we are actively editing a recipe that has at least a name
    if (APP.currentStep > 0 && APP.recipe && APP.recipe.name.trim() !== '') {
        // Collect current state from UI just in case
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

// ============================================================================
// STREAMLINED MANAGEMENT NAVIGATION
// ============================================================================
// Navigation and management functions are handled in index.html to avoid conflicts


// --- Allergen Matrix (Character Safe) ---
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

// ============================================================================
// SUPPLIER PRICE COMPARATOR MODULE
// ============================================================================
window.openPriceComparator = function() {
  const modal = document.getElementById('priceComparatorModal');
  if (modal) {
    window.openModal('priceComparatorModal');
    // Populate select with unique ingredients from inventory
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
  
  // Find base price in inventory
  const invItem = APP.inventory.find(i => i.name.toLowerCase().trim() === ingName.toLowerCase().trim());
  const basePrice = invItem ? invItem.price || 0 : 0;
  const unit = invItem ? invItem.unit || 'kg' : 'kg';
  
  // Find all prices in APP.ingredientPrices
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
  
  // Sort by price
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
  
  // Savings analysis
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
