// ============================================================================
// TRACEABILITY LABELS (DLC)
// ============================================================================

window.printDLCLabel = function(recipeId, isExample = false) {
    let recipe;
    if (isExample) {
        recipe = (typeof RECIPES !== 'undefined' ? RECIPES : []).find(r => r.id === recipeId);
    } else {
        recipe = APP.savedRecipes.find(r => r.id === recipeId);
    }
    
    if (!recipe) return;

    const today = new Date();
    const dlc = new Date();
    dlc.setDate(today.getDate() + 3); // Default 3 days

    const content = `
        <div style="width: 300px; padding: 15px; border: 2px solid #000; font-family: sans-serif; text-align: center; background: #fff; color: #000;">
            <div style="font-weight: 800; font-size: 1.2rem; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
                🧁 GourmetRevient
            </div>
            <div style="font-size: 1rem; font-weight: 700; margin-bottom: 5px;">${recipe.name}</div>
            <div style="font-size: 0.8rem; margin-bottom: 10px;">Catégorie: ${recipe.category || 'Pâtisserie'}</div>
            
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
                <div style="text-align: left;">
                    <div style="font-size: 0.6rem; text-transform: uppercase;">Fabriqué le</div>
                    <div style="font-weight: 700;">${today.toLocaleDateString('fr-FR')}</div>
                </div>
                <div style="text-align: right;">
                    <div style="font-size: 0.6rem; text-transform: uppercase; color: #ef4444;">À consommer jusqu'au</div>
                    <div style="font-weight: 700; color: #ef4444;">${dlc.toLocaleDateString('fr-FR')}</div>
                </div>
            </div>

            <div style="font-size: 0.6rem; text-align: left; margin-bottom: 10px; padding: 5px; background: #f1f5f9;">
                <strong>ALLERGÈNES:</strong> Gluten, Œufs, Lait, Fruits à coque.
            </div>

            <div style="font-size: 0.7rem; border-top: 1px dashed #000; padding-top: 5px;">
                Conserver entre 0°C et +4°C
            </div>
        </div>
    `;

    const opt = {
        margin: 5,
        filename: `label_${recipeId}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 3 },
        jsPDF: { unit: 'mm', format: [100, 60], orientation: 'landscape' }
    };

    if (typeof html2pdf !== 'undefined') {
        html2pdf().from(content).set(opt).save();
        showToast('🏷️ Étiquette DLC générée', 'success');
    } else {
        showToast('Erreur: html2pdf non disponible', 'error');
    }
};

// 3. HYGIÈNE & HACCP LOGIC
function saveHaccpLogs() {
  localStorage.setItem(STORAGE_KEYS.haccpLogs, JSON.stringify(APP.haccpLogs));
}

function loadHaccpLogs() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.haccpLogs);
    if (saved) {
      try {
        APP.haccpLogs = JSON.parse(saved);
      } catch(e) {}
    }
    
    if (typeof APP.haccpLogs !== 'object' || APP.haccpLogs === null) {
      APP.haccpLogs = {};
    }
    if (!Array.isArray(APP.haccpLogs.temp)) APP.haccpLogs.temp = [];
    if (!Array.isArray(APP.haccpLogs.trace)) APP.haccpLogs.trace = [];
    if (!Array.isArray(APP.haccpLogs.reception)) APP.haccpLogs.reception = [];
    if (!Array.isArray(APP.haccpLogs.clean)) APP.haccpLogs.clean = [];

    // No demo data seeding
  } catch (err) {
    console.error('CRITICAL HACCP LOAD FIX:', err);
  }

  // Toujours initialiser le plan de nettoyage par défaut s'il est vide
  if (!APP.haccpLogs.clean || APP.haccpLogs.clean.length === 0) {
    APP.haccpLogs.clean = [
      { id: 'c1', areaKey: 'haccp.clean.c1', done: false, icon: '🧼' },
      { id: 'c2', areaKey: 'haccp.clean.c2', done: false, icon: '🧹' },
      { id: 'c3', areaKey: 'haccp.clean.c3', done: false, icon: '🔥' },
      { id: 'c4', areaKey: 'haccp.clean.c4', done: false, icon: '📦' },
      { id: 'c5', areaKey: 'haccp.clean.c5', done: false, icon: '❄️' },
      { id: 'c6', areaKey: 'haccp.clean.c6', done: false, icon: '🥣' },
      { id: 'c7', areaKey: 'haccp.clean.c7', done: false, icon: '🗑️' }
    ];
    saveHaccpLogs();
  }


  // Migrate: ensure cleaning items have areaKey for translation
  if (APP.haccpLogs.clean) {
    const keyMap = { c1: 'haccp.clean.c1', c2: 'haccp.clean.c2', c3: 'haccp.clean.c3', c4: 'haccp.clean.c4', c5: 'haccp.clean.c5', c6: 'haccp.clean.c6', c7: 'haccp.clean.c7' };
    APP.haccpLogs.clean.forEach(c => {
      if (!c.areaKey && keyMap[c.id]) c.areaKey = keyMap[c.id];
    });
  }

  // Activer le plan de nettoyage quotidien (reset si nouveau jour)
  const todayStr = new Date().toISOString().split('T')[0];
  if (APP.haccpLogs.cleanLastDate !== todayStr) {
    if (APP.haccpLogs.clean) {
        APP.haccpLogs.clean.forEach(c => c.done = false);
    }
    APP.haccpLogs.cleanLastDate = todayStr;
    saveHaccpLogs();
  }

  // Cloud sync en arrière-plan
  if (navigator.onLine && window.GourmetSync) {
    Promise.all([
      GourmetSync.chargerTemps(),
      GourmetSync.chargerNettoyage()
    ]).then(([cloudTemps, cloudClean]) => {
      let changed = false;
      if (cloudTemps !== null && cloudTemps.length > 0) {
        APP.haccpLogs.temp = cloudTemps;
        changed = true;
      }
      if (cloudClean !== null && cloudClean.length > 0) {
        APP.haccpLogs.clean = cloudClean;
        changed = true;
      }
      if (changed) {
        saveHaccpLogs();
        renderHygiene();
      }
    }).catch(err => console.warn('[GourmetSync] Erreur chargement HACCP:', err));
  }
}

const EQUIP_KEY_MAP = {
  'Frigo 1 (Vitrine)': 'haccp.equip.frigo1',
  'Frigo 2 (Réserve)': 'haccp.equip.frigo2',
  'Congélateur 1': 'haccp.equip.congelateur',
  'Cellule': 'haccp.equip.cellule'
};

function switchHaccpTab(tab) {
  const views = ['Temp', 'Clean', 'Trace', 'Reception', 'Allergens'];
  views.forEach(v => {
    const el = document.getElementById('haccpView' + v);
    const btn = document.getElementById('tabHaccp' + v);
    if (el) el.style.display = v.toLowerCase() === tab ? 'block' : 'none';
    if (btn) btn.classList.toggle('active', v.toLowerCase() === tab);
  });
  if (tab === 'allergens') renderAllergenMatrix();
  else renderHygiene();
}

function renderHygiene() {
  renderHygieneDashboard();
  renderTempLogs();
  renderCleaningChecklist();
  renderTraceability();
  renderReceptionLogs();
}

function renderHygieneDashboard() {
  const lastTempEl = document.getElementById('kpiHaccpLastTemp');
  const lastTempDateEl = document.getElementById('kpiHaccpLastTempDate');
  const cleanPctEl = document.getElementById('kpiHaccpCleanPct');
  const activeLotsEl = document.getElementById('kpiHaccpActiveLots');
  const shortExpEl = document.getElementById('kpiHaccpShortExp');

  if (!lastTempEl) return;

  // 1. Last Temp
  const temps = APP.haccpLogs.temp || [];
  if (temps.length > 0) {
    const last = temps[0];
    lastTempEl.textContent = last.val.toFixed(1) + ' °C';
    lastTempDateEl.textContent = new Date(last.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    lastTempEl.style.color = (last.val > 5 || last.val < -22) ? 'var(--danger)' : 'var(--success)';
  }

  // 2. Cleaning Pct
  const cleaning = APP.haccpLogs.cleaning || [];
  const today = new Date().toISOString().split('T')[0];
  const todaysTasks = cleaning.filter(t => t.date === today);
  const completed = todaysTasks.filter(t => t.status === 'ok').length;
  const pct = todaysTasks.length > 0 ? Math.round((completed / todaysTasks.length) * 100) : 0;
  if (cleanPctEl) cleanPctEl.textContent = pct + '%';

  // 3. Active Lots
  const trace = APP.haccpLogs.trace || [];
  if (activeLotsEl) activeLotsEl.textContent = trace.length;

  // 4. Short Expiry
  const now = new Date();
  const shortExp = trace.filter(t => {
     const expDate = new Date(t.exp);
     const diffHours = (expDate - now) / (1000 * 60 * 60);
     return diffHours > 0 && diffHours < 48;
  }).length;
  if (shortExpEl) shortExpEl.textContent = shortExp;
}

function renderTempLogs() {
  const container = document.getElementById('tempLogsBody');
  if (!container) return;

  if (!APP.haccpLogs.temp) APP.haccpLogs.temp = [];

  if (!APP.haccpLogs.temp || APP.haccpLogs.temp.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">' + t('haccp.temp.empty') + '</td></tr>';
    return;
  }
  container.innerHTML = APP.haccpLogs.temp.map(function (log) {
    var isWarn = log.val > 5 || log.val < -22; // Quick check for freezer / fridge
    var equipLabel = log.equipKey ? t(log.equipKey) : (EQUIP_KEY_MAP[log.equip] ? t(EQUIP_KEY_MAP[log.equip]) : (log.equip || ''));
    var actionBadge = '';
    var shiftIcon = log.shift === 'soir' ? '🌙' : '🌅';
    var shiftText = log.shift === 'soir' ? 'Soir' : 'Matin';
    if (log.action) {
      var actionText = (log.action.indexOf('haccp.') === 0) ? t(log.action) : log.action;
      actionBadge = '<div style="font-size:0.75rem; color:var(--text-muted); font-style:italic; margin-top:4px;">💬 ' + actionText + '</div>';
    }
    return '<tr>' +
      '<td>' + new Date(log.date).toLocaleString(undefined, {dateStyle: "short", timeStyle: "short"}) + '<br><small style="color:var(--text-muted); font-weight:700;">' + shiftIcon + ' ' + shiftText + '</small></td>' +
      '<td style="font-weight:700;">' + equipLabel + '</td>' +
      '<td style="font-size:1.1rem; font-weight:800; color:' + (isWarn ? 'var(--danger)' : 'var(--success)') + '">' + log.val + '°C</td>' +
      '<td>' + (log.user || t('haccp.chef')) + '</td>' +
      '<td><span class="badge ' + (isWarn ? 'status-critical' : 'status-ok') + '">' + (isWarn ? '⚠️ ' + t('haccp.status.warn') : '✅ ' + t('haccp.status.ok')) + '</span>' + actionBadge + '</td>' +
      '<td><button class="btn btn-sm btn-outline btn-round" onclick="deleteTempLog(\'' + log.id + '\')">🗑️</button></td>' +
      '</tr>';
  }).join('');
}

function showAddTempModal() {
  window.openModal('modalHaccpTemp');
  var sel = document.getElementById('haccpTempEquip');
  if (sel) {
    sel.innerHTML = '<option value="haccp.equip.frigo1">' + t('haccp.equip.frigo1') + '</option>' +
      '<option value="haccp.equip.frigo2">' + t('haccp.equip.frigo2') + '</option>' +
      '<option value="haccp.equip.congelateur">' + t('haccp.equip.congelateur') + '</option>' +
      '<option value="haccp.equip.cellule">' + t('haccp.equip.cellule') + '</option>';
  }
}

function hideAddTempModal() {
  window.closeModal('modalHaccpTemp');
}

function addTempLog() {
  var equipSelector = document.getElementById('haccpTempEquip');
  var valInput = document.getElementById('haccpTempVal');
  var actionField = document.getElementById('haccpTempAction');
  var shiftNode = document.querySelector('input[name="haccpTempShift"]:checked');
  if (!equipSelector || !valInput) return;
  var equipKey = equipSelector.value;
  var val = parseFloat(valInput.value);
  var action = actionField ? actionField.value.trim() : '';
  var shift = shiftNode ? shiftNode.value : 'matin';
  if (isNaN(val)) {
    if (typeof showToast === 'function') showToast(t('haccp.temp.empty'), 'error');
    return;
  }
  var log = {
    id: window.GourmetSync ? GourmetSync.uuid() : ('t_log_' + Date.now()),
    date: new Date().toISOString(),
    equipKey: equipKey,
    val: val,
    shift: shift,
    action: action || null,
    user: APP.viewOwner || localStorage.getItem(STORAGE_KEYS.currentUser) || t('haccp.chef')
  };
  if (!APP.haccpLogs.temp) APP.haccpLogs.temp = [];
  APP.haccpLogs.temp.unshift(log);
  if (APP.haccpLogs.temp.length > 50) APP.haccpLogs.temp.pop();
  saveHaccpLogs();
  // Sync cloud
  if (window.GourmetSync) GourmetSync.sauvegarderTemp(log).catch(() => {});
  hideAddTempModal();
  valInput.value = '';
  if (actionField) actionField.value = '';
  renderTempLogs();
  if (typeof showToast === 'function') showToast(t('haccp.status.ok'), 'success');
}

function deleteTempLog(id) {
  APP.haccpLogs.temp = APP.haccpLogs.temp.filter(function (l) { return l.id !== id; });
  saveHaccpLogs();
  if (window.GourmetSync) GourmetSync.supprimerTemp(id).catch(() => {});
  renderTempLogs();
}

function showAddReceptionModal() {
  window.openModal('modalHaccpReception');
}
function hideAddReceptionModal() {
  window.closeModal('modalHaccpReception');
}
function addReceptionLog() {
  var supplier = document.getElementById('haccpReceptSupplier').value;
  var temp = parseFloat(document.getElementById('haccpReceptTemp').value);
  var hygiene = document.getElementById('haccpReceptHygiene').value;
  if (!supplier) return;
  var log = { id: 'recept_' + Date.now(), date: new Date().toISOString(), supplier: supplier, temp: temp, hygiene: hygiene };
  if (!APP.haccpLogs.reception) APP.haccpLogs.reception = [];
  APP.haccpLogs.reception.unshift(log);
  saveHaccpLogs();
  hideAddReceptionModal();
  renderReceptionLogs();
  if (typeof showToast === 'function') showToast(t('haccp.status.ok'), 'success');
}
function renderReceptionLogs() {
  var container = document.getElementById('receptionLogsBody');
  if (!container) return;
  if (!APP.haccpLogs.reception) APP.haccpLogs.reception = [];
  if (!APP.haccpLogs.reception || APP.haccpLogs.reception.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">' + t('haccp.reception.empty') + '</td></tr>';
    return;
  }
  container.innerHTML = APP.haccpLogs.reception.map(function (log) {
    return '<tr>' +
      '<td>' + new Date(log.date).toLocaleDateString() + '</td>' +
      '<td style="font-weight:700;">' + log.supplier + '</td>' +
      '<td style="font-weight:800;">' + log.temp + '°C</td>' +
      '<td>' + (log.hygiene === 'ok' ? '✅ ' + t('haccp.reception.ok') : '❌ ' + t('haccp.reception.ko')) + '</td>' +
      '<td><span class="badge ' + (log.hygiene === 'ok' ? 'status-ok' : 'status-critical') + '">' + (log.hygiene === 'ok' ? t('haccp.status.ok') : t('haccp.status.warn')) + '</span></td>' +
      '<td><button class="btn btn-sm btn-outline btn-round" onclick="deleteReceptionLog(\'' + log.id + '\')">🗑️</button></td>' +
      '</tr>';
  }).join('');
}
function deleteReceptionLog(id) {
  APP.haccpLogs.reception = APP.haccpLogs.reception.filter(function (l) { return l.id !== id; });
  saveHaccpLogs();
  renderReceptionLogs();
}

function renderCleaningChecklist() {
  const container = document.getElementById('cleaningChecklistArea');
  if (!container) return;

  // Initialize defaults if empty
  if (!APP.haccpLogs.clean || APP.haccpLogs.clean.length === 0) {
    APP.haccpLogs.clean = [
      { id: 'cl_1', areaKey: 'haccp.clean.area1', area: 'Postes de Travail', icon: '🔪', done: false },
      { id: 'cl_2', areaKey: 'haccp.clean.area2', area: 'Sols & Caniveaux', icon: '🧼', done: false },
      { id: 'cl_3', areaKey: 'haccp.clean.area3', area: 'Enceintes Froides', icon: '❄️', done: false },
      { id: 'cl_4', areaKey: 'haccp.clean.area4', area: 'Plongerie', icon: '🚿', done: false },
      { id: 'cl_5', areaKey: 'haccp.clean.area5', area: 'Sanitaires', icon: '🚽', done: false },
      { id: 'cl_6', areaKey: 'haccp.clean.area6', area: 'Réserve Sèche', icon: '📦', done: false }
    ];
    try { saveHaccpLogs(); } catch(e){}
  }

  container.innerHTML = APP.haccpLogs.clean.map(function (task) {
    var areaName = task.areaKey ? (typeof t === 'function' ? t(task.areaKey) : task.area) : (task.area || '');
    return `
      <div class="mgmt-glass-card ${task.done ? 'cleaned' : ''}" 
           onclick="toggleCleaning('${task.id}')" 
           style="display:flex; align-items:center; gap:1.2rem; cursor:pointer; padding:1.5rem; transition:all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); position:relative; overflow:hidden;">
        
        <div style="font-size:2rem; background:${task.done ? 'rgba(16, 185, 129, 0.1)' : 'rgba(197, 165, 90, 0.08)'}; 
                    width:60px; height:60px; display:flex; align-items:center; justify-content:center; border-radius:18px; 
                    border: 1px solid ${task.done ? 'rgba(16, 185, 129, 0.2)' : 'rgba(197, 165, 90, 0.15)'};">
          ${task.icon}
        </div>

        <div style="flex:1;">
          <h4 style="margin:0; font-size:1.1rem; color:var(--primary); font-family:var(--font-display);">${areaName}</h4>
          <div style="display:flex; align-items:center; gap:0.5rem; margin-top:2px;">
             <span style="font-size:0.7rem; font-weight:800; letter-spacing:0.5px; color:${task.done ? '#10b981' : 'var(--text-muted)'};">
               ${task.done ? 'CONFORME' : 'À TRAITER'}
             </span>
          </div>
        </div>

        <div style="font-size:1.5rem; filter: ${task.done ? 'none' : 'grayscale(1) opacity(0.3)'};">
          ${task.done ? '✅' : '⭕'}
        </div>

        ${task.done ? '<div style="position:absolute; top:0; left:0; width:4px; height:100%; background:#10b981;"></div>' : ''}
      </div>`;
  }).join('');
}

function toggleCleaning(id) {
  var task = APP.haccpLogs.clean.find(function (c) { return c.id === id; });
  if (task) {
    task.done = !task.done;
    saveHaccpLogs();
    if (window.GourmetSync) GourmetSync.sauvegarderNettoyage(task).catch(() => {});
    renderCleaningChecklist();
  }
}

function renderTraceability() {
  const container = document.getElementById('traceLogsBody');
  if (!container) return;
  if (!APP.haccpLogs.trace) APP.haccpLogs.trace = [];
  filterTraceLogs();
}

// ============================================================================
// ============================================================================
// HACCP PRODUCTION LOTS & TRACEABILITY REGISTER
// ============================================================================
window.openProductionLogger = function(recipeIdOrName = null, portions = null, defaultName = '') {
  const modal = document.getElementById('lotRegistreModal');
  if (!modal) return;
  
  let productName = defaultName || '';
  let qty = portions || 10;
  let recipeId = '';
  
  if (recipeIdOrName) {
    const allRecipes = [
      ...(APP.savedRecipes || []),
      ...(typeof RECIPES !== 'undefined' ? RECIPES : [])
    ];
    const found = allRecipes.find(r => r.id === recipeIdOrName || r.name === recipeIdOrName);
    if (found) {
      productName = found.name;
      recipeId = found.id;
      if (!portions) qty = found.portions || 10;
    } else {
      productName = recipeIdOrName;
    }
  }
  
  document.getElementById('lotRecipeId').value = recipeId;
  document.getElementById('lotProductName').value = productName;
  document.getElementById('lotQuantity').value = qty;
  
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('lotDateFabrication').value = today;
  
  const dlcDate = new Date();
  dlcDate.setDate(dlcDate.getDate() + 3);
  document.getElementById('lotDLC').value = dlcDate.toISOString().split('T')[0];
  
  const user = localStorage.getItem('gourmet_current_user') || 'Chef';
  document.getElementById('lotOperator').value = user;
  
  const generateLot = () => {
    const d = new Date(document.getElementById('lotDateFabrication').value || new Date());
    const yy = d.getFullYear().toString().slice(-2);
    const mm = String(d.getMonth()+1).padStart(2,'0');
    const dd = String(d.getDate()).padStart(2,'0');
    const pName = document.getElementById('lotProductName').value || 'PROD';
    const initials = pName.trim().toUpperCase().replace(/[^A-Z]/g,'').slice(0,3) || 'PRD';
    const randomNum = Math.floor(Math.random() * 900) + 100;
    document.getElementById('lotNumberField').value = `L-${yy}${mm}${dd}-${initials}-${randomNum}`;
  };
  
  generateLot();
  
  document.getElementById('lotProductName').oninput = generateLot;
  document.getElementById('lotDateFabrication').onchange = generateLot;
  
  window.openModal('lotRegistreModal');
};

window.saveProductionLot = function(printLabel = false) {
  const product = document.getElementById('lotProductName').value.trim();
  const lot = document.getElementById('lotNumberField').value.trim();
  const date = document.getElementById('lotDateFabrication').value;
  const exp = document.getElementById('lotDLC').value;
  const qty = document.getElementById('lotQuantity').value;
  const operator = document.getElementById('lotOperator').value.trim();
  
  if (!product || !lot || !date || !exp || !qty) {
    showToast('Veuillez remplir tous les champs', 'error');
    return;
  }
  
  const traceEntry = {
    id: 'tr_' + Date.now(),
    lot: lot,
    product: product,
    date: new Date(date).toISOString(),
    exp: exp,
    qty: qty + ' portions',
    operator: operator
  };
  
  if (!APP.haccpLogs.trace) APP.haccpLogs.trace = [];
  APP.haccpLogs.trace.unshift(traceEntry);
  saveHaccpLogs();
  
  // Render tables
  if (typeof renderTraceability === 'function') renderTraceability();
  else filterTraceLogs();
  
  if (window.GourmetHACCPAlerts && typeof window.GourmetHACCPAlerts.renderAlertBanner === 'function') {
    window.GourmetHACCPAlerts.renderAlertBanner();
  }
  
  window.closeModal('lotRegistreModal');
  showToast('Lot de production enregistré ✓', 'success');
  
  // If there was a pending status change in the planning grid, apply it now
  if (window.pendingProductionStatusChange) {
    const { idx, status } = window.pendingProductionStatusChange;
    window.pendingProductionStatusChange = null;
    const plan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
    const item = plan[idx];
    if (item) {
      item.status = status;
      localStorage.setItem('gourmet_production_plan', JSON.stringify(plan));
      if (window.GourmetSync) GourmetSync.sauvegarderPlanning(item).catch(() => {});
      if (typeof renderProductionPlan === 'function') renderProductionPlan();
      if (window.syncInventoryWithProduction) window.syncInventoryWithProduction({ ...item, status: 'done' });
    }
  }
  
  if (printLabel) {
    window.printDLCLabelCustom(product, lot, date, exp, operator);
  }
};

window.printDLCLabelCustom = function(product, lot, date, exp, operator) {
  const dateFabStr = new Date(date).toLocaleDateString('fr-FR');
  const dateDlcStr = new Date(exp).toLocaleDateString('fr-FR');
  
  const content = `
    <div style="width: 300px; padding: 15px; border: 2px solid #000; font-family: sans-serif; text-align: center; background: #fff; color: #000;">
        <div style="font-weight: 800; font-size: 1.2rem; border-bottom: 1px solid #000; padding-bottom: 5px; margin-bottom: 10px;">
            🧁 GourmetRevient
        </div>
        <div style="font-size: 1rem; font-weight: 700; margin-bottom: 5px;">${product}</div>
        <div style="font-size: 0.8rem; margin-bottom: 10px; font-family:monospace; font-weight:bold;">LOT: ${lot}</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px;">
            <div style="text-align: left;">
                <div style="font-size: 0.6rem; text-transform: uppercase;">Fabriqué le</div>
                <div style="font-weight: 700;">${dateFabStr}</div>
            </div>
            <div style="text-align: right;">
                <div style="font-size: 0.6rem; text-transform: uppercase; color: #ef4444;">À consommer jusqu'au</div>
                <div style="font-weight: 700; color: #ef4444;">${dateDlcStr}</div>
            </div>
        </div>

        <div style="font-size: 0.6rem; text-align: left; margin-bottom: 10px; padding: 5px; background: #f1f5f9;">
            <strong>ALLERGÈNES:</strong> Gluten, Œufs, Lait, Fruits à coque.
        </div>

        <div style="font-size: 0.7rem; border-top: 1px dashed #000; padding-top: 5px; display:flex; justify-content:space-between;">
            <span>Conserver entre 0°C et +4°C</span>
            <span>Opérateur: ${operator || 'Chef'}</span>
        </div>
    </div>
  `;

  const opt = {
    margin: 5,
    filename: `label_${lot}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 3 },
    jsPDF: { unit: 'mm', format: [100, 60], orientation: 'landscape' }
  };

  if (typeof html2pdf !== 'undefined') {
    html2pdf().from(content).set(opt).save();
    showToast('🏷️ Étiquette DLC générée', 'success');
  } else {
    showToast('Erreur: html2pdf non disponible', 'error');
  }
};

window.filterTraceLogs = function() {
  const productQuery = document.getElementById('traceFilterProduct').value.toLowerCase().trim();
  const dateQuery = document.getElementById('traceFilterDate').value;
  
  const container = document.getElementById('traceLogsBody');
  if (!container) return;
  
  const trace = APP.haccpLogs.trace || [];
  const filtered = trace.filter(d => {
    const matchesProduct = d.product.toLowerCase().includes(productQuery);
    const matchesDate = !dateQuery || d.date.split('T')[0] === dateQuery;
    return matchesProduct && matchesDate;
  });
  
  if (filtered.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Aucun lot correspondant</td></tr>';
    return;
  }
  
  container.innerHTML = filtered.map(function (d) {
    return '<tr>' +
      '<td style="font-family:monospace; font-weight:800; color:var(--accent);">' + d.lot + '</td>' +
      '<td style="font-weight:700;">' + d.product + '</td>' +
      '<td>' + new Date(d.date).toLocaleDateString() + '</td>' +
      '<td style="color:var(--danger); font-weight:700;">' + d.exp + '</td>' +
      '<td>' + d.qty + '</td>' +
      '<td><button class="btn btn-sm btn-outline btn-round" onclick="window.printDLCLabelCustom(\'' + d.product.replace(/'/g, "\\'") + '\', \'' + d.lot + '\', \'' + d.date + '\', \'' + d.exp + '\', \'' + (d.operator || 'Chef') + '\')">🖨️</button></td>' +
      '</tr>';
  }).join('');
};

window.resetTraceFilters = function() {
  document.getElementById('traceFilterProduct').value = '';
  document.getElementById('traceFilterDate').value = '';
  filterTraceLogs();
};

window.exportTraceability = function() {
  const trace = APP.haccpLogs.trace || [];
  if (trace.length === 0) {
    showToast('Aucune donnée à exporter', 'warning');
    return;
  }
  let csv = 'Lot,Produit,Date Fabrication,DLC/DLUO,Quantité,Opérateur\n';
  trace.forEach(t => {
    const dStr = new Date(t.date).toLocaleDateString('fr-FR');
    csv += `"${t.lot}","${t.product}","${dStr}","${t.exp}","${t.qty}","${t.operator || ''}"\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `registre_tracabilite_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Registre exporté en CSV ✓', 'success');
};
