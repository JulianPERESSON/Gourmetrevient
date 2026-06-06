// PRODUCTION MODE
// =====================================================================

let prodState = { step: 0, recipe: null, timer: null, seconds: 0 };

function showProductionMode(recipeId) {
  const recipe = RECIPES.find(r => r.id === recipeId) || JSON.parse(localStorage.getItem('gourmet_saved_recipes') || '[]').find(r => r.id === recipeId);
  if (!recipe) return;
  prodState = { step: 0, recipe, timer: null, seconds: 0 };

  window.openModal('productionModal');
  document.getElementById('prodRecipeName').textContent = recipe.name;
  document.getElementById('prodTimerDisplay').textContent = '00:00:00';

  const ingList = document.getElementById('prodIngredientsList');
  ingList.innerHTML = (recipe.ingredients || []).map((ing, idx) => `
    <div class="prod-check-item">
      <input type="checkbox" id="p-ing-${idx}">
      <label for="p-ing-${idx}">${ing.quantity} ${ing.unit} ${ing.name}</label>
    </div>
  `).join('');

  renderProdSteps();
}

function renderProdSteps() {
  const container = document.getElementById('prodStepsContainer');
  const steps = prodState.recipe.steps || [];
  container.innerHTML = steps.map((s, idx) => `<div class="prod-step-slide" style="display: ${idx === prodState.step ? 'block' : 'none'}"><div class="prod-step-number">Etape ${idx + 1}</div><div class="prod-step-content">${s}</div></div>`).join('');
  document.getElementById('prodStepIndicator').textContent = `Étape ${prodState.step + 1} / ${steps.length}`;
  document.getElementById('btnPrevProdStep').disabled = prodState.step === 0;
  document.getElementById('btnNextProdStep').textContent = prodState.step === steps.length - 1 ? t('ui.btn.finish') || 'Terminer' : 'Suivant →';
}

function nextProdStep() {
  if (prodState.step < prodState.recipe.steps.length - 1) { prodState.step++; renderProdSteps(); } else { finishProduction(); }
}

function prevProdStep() { if (prodState.step > 0) { prodState.step--; renderProdSteps(); } }

function toggleProdTimer() {
  const btn = document.getElementById('btnProdTimer');
  if (prodState.timer) {
    clearInterval(prodState.timer); prodState.timer = null; btn.textContent = 'Démarrer';
  } else {
    prodState.timer = setInterval(() => {
      prodState.seconds++;
      const h = Math.floor(prodState.seconds / 3600).toString().padStart(2, '0');
      const m = Math.floor((prodState.seconds % 3600) / 60).toString().padStart(2, '0');
      const s = (prodState.seconds % 60).toString().padStart(2, '0');
      document.getElementById('prodTimerDisplay').textContent = `${h}:${m}:${s}`;
    }, 1000);
    btn.textContent = 'Pause';
  }
}

function finishProduction() {
  prodState.recipe.ingredients.forEach(ing => {
    const inv = APP.inventory.find(i => i.name.toLowerCase() === ing.name.toLowerCase());
    if (inv) inv.stock = Math.max(0, inv.stock - ing.quantity);
  });
  saveInventory();
  window.closeModal('productionModal');
  if (prodState.timer) clearInterval(prodState.timer);
  showToast("Production terminée, stocks mis à jour !");
  
  setTimeout(() => {
    if (typeof window.openProductionLogger === 'function') {
      window.openProductionLogger(prodState.recipe.id, prodState.recipe.portions);
    }
  }, 400);
}

function scanInvoiceReal(file) {
  if (!window.Tesseract) { showToast("Bibliothèque OCR non chargée."); return; }
  showToast("Scanning de la facture...", 3000);
  Tesseract.recognize(file, 'fra').then(({ data: { text } }) => {
    const keywords = ["Beurre", "Farine", "Sucre", "Chocolat", "Lait"];
    let count = 0;
    keywords.forEach(key => {
      const match = text.match(new RegExp(`${key}.*?(\\d+[,.]\\d{2})`, "i"));
      if (match) {
        const ing = APP.ingredientDb.find(i => i.name.toLowerCase().includes(key.toLowerCase()));
        if (ing) { ing.pricePerUnit = parseFloat(match[1].replace(',', '.')); count++; }
      }
    });
    if (count > 0) { saveIngredientDb(); showToast(`${count} prix mis à jour !`); } else { showToast("Aucun prix détecté."); }
  });
}

function hideProductionMode() {
  window.closeModal('productionModal');
  if (prodState.timer) { clearInterval(prodState.timer); prodState.timer = null; }
}

function showAddSupplierModal() {
  $('#editSupplierId').value = '';
  $('#supName').value = '';
  $('#supContact').value = '';
  $('#supEmail').value = '';
  $('#supCategory').value = 'Général';
  $('#supRating').value = '5';
  $('#supplierModalTitle').textContent = '📦 Ajouter un Fournisseur';
  window.openModal('supplierModal');
}

function closeSupplierModal() {
  window.closeModal('supplierModal');
}

function saveSupplier() {
  const id = $('#editSupplierId').value;
  const name = $('#supName').value.trim();
  const contact = $('#supContact').value.trim();
  const email = $('#supEmail').value.trim();
  const category = $('#supCategory').value;
  const rating = parseFloat($('#supRating').value) || 5;

  if (!name) {
    showToast("Le nom est obligatoire", "error");
    return;
  }

  let targetSupplier;
  if (id) {
    // Edit mode — chercher par id string ou number
    const s = APP.suppliers.find(sup => sup.id == id || sup.id.toString() === id.toString());
    if (s) {
      s.name = name;
      s.contact = contact;
      s.email = email;
      s.categories = [category];
      s.rating = rating;
      targetSupplier = s;
    }
  } else {
    // Add mode — UUID pour sync cloud
    const newUUID = window.GourmetSync ? GourmetSync.uuid() : ('sup_' + Date.now());
    const newSup = { id: newUUID, name, contact, email, categories: [category], rating, leadTime: 3 };
    APP.suppliers.push(newSup);
    targetSupplier = newSup;
  }

  saveSuppliers();
  // Sync cloud immédiat pour ce fournisseur
  if (window.GourmetSync && targetSupplier) {
    const isValidUUID = str => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
    if (isValidUUID(targetSupplier.id)) GourmetSync.sauvegarderFournisseur(targetSupplier).catch(() => {});
  }
  renderSuppliers();
  closeSupplierModal();
  showToast(id ? "Fournisseur mis à jour" : "Fournisseur ajouté", "success");
}

function editSupplier(id) {
  // Gérer à la fois les IDs numériques (démos) et UUIDs (cloud)
  const s = APP.suppliers.find(sup => sup.id == id || sup.id.toString() === id.toString());
  if (!s) return;

  $('#editSupplierId').value = s.id;
  $('#supName').value = s.name;
  $('#supContact').value = s.contact || '';
  $('#supEmail').value = s.email || '';
  $('#supCategory').value = (s.categories && s.categories[0]) || 'Général';
  $('#supRating').value = Math.round(s.rating || 5).toString();

  $('#supplierModalTitle').textContent = '✏️ Modifier ' + s.name;
  window.openModal('supplierModal');
}

function deleteSupplier(id) {
  if (!confirm("Voulez-vous vraiment supprimer ce fournisseur ?")) return;
  APP.suppliers = APP.suppliers.filter(s => s.id != id && s.id.toString() !== id.toString());
  saveSuppliers();
  // Supprimer du cloud (seulement pour les UUIDs)
  if (window.GourmetSync) {
    const isValidUUID = str => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(String(str));
    if (isValidUUID(id)) GourmetSync.supprimerFournisseur(id).catch(() => {});
  }
  renderSuppliers();
  showToast("Fournisseur supprimé", "info");
}

function loadNotifications() {
  const user = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!user) return;
  const allNotifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
  APP.notifications = allNotifs[user.toLowerCase()] || [];
  renderNotifications();
}

function saveNotifications() {
  const user = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!user) return;
  const allNotifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
  allNotifs[user.toLowerCase()] = APP.notifications;
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(allNotifs));
}

function addNotification(targetUser, notif) {
  const allNotifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.notifications) || '{}');
  const userKey = targetUser.toLowerCase();
  if (!allNotifs[userKey]) allNotifs[userKey] = [];
  allNotifs[userKey].push(notif);
  localStorage.setItem(STORAGE_KEYS.notifications, JSON.stringify(allNotifs));

  if (targetUser.toLowerCase() === localStorage.getItem(STORAGE_KEYS.currentUser)?.toLowerCase()) {
    APP.notifications.push(notif);
    renderNotifications();
  }
}

function renderNotifications() {
  const badge = $('#notifBadge');
  const list = $('#notifList');
  const area = $('#notificationArea');
  if (!area) return;

  const unreadCount = APP.notifications.filter(n => !n.read).length;
  if (unreadCount > 0) {
    badge.style.display = 'block';
    badge.textContent = unreadCount;
    area.style.display = 'block';
  } else {
    badge.style.display = 'none';
    area.style.display = 'block'; // Always show bell if logged in
  }

  if (APP.notifications.length === 0) {
    list.innerHTML = '<div class="notif-empty">Aucune nouvelle notification</div>';
  } else {
    list.innerHTML = [...APP.notifications].reverse().map(n => {
      let msg = '';
      if (n.type === 'leave_request') msg = t('plan.notif.leave_req', { from: capitalizeFirstLetter(n.from), name: capitalizeFirstLetter(n.memberName) });
      if (n.type === 'invite') msg = t('plan.notif.invite', { from: capitalizeFirstLetter(n.from) });

      let actions = '';
      if (n.type === 'invite' && n.status === 'pending') {
        actions = `
          <div style="display:flex; gap:0.5rem; margin-top:0.5rem;" onclick="event.stopPropagation()">
            <button onclick="acceptInvite('${n.id}')" class="btn btn-sm btn-accent" style="padding:2px 8px; font-size:0.75rem; border-radius:4px;">${t('plan.btn.approve').split(' ')[0]}</button>
            <button onclick="rejectInvite('${n.id}')" class="btn btn-sm btn-outline" style="padding:2px 8px; font-size:0.75rem; border-radius:4px; color:var(--danger); border-color:var(--danger);">${t('plan.btn.reject').split(' ')[0]}</button>
          </div>
        `;
      }

      return `
        <div class="notif-item ${n.read ? 'read' : 'unread'}" onclick="handleNotifClick('${n.id}')">
          <div style="font-size:0.8rem; margin-bottom:0.3rem;">${msg}</div>
          ${actions}
          <div style="font-size:0.7rem; color:var(--text-muted); opacity:0.7; margin-top:0.3rem;">${new Date(n.timestamp).toLocaleString('fr-FR')}</div>
        </div>
      `;
    }).join('');
  }
}

function handleNotifClick(id) {
  const notif = APP.notifications.find(n => n.id === id);
  if (!notif) return;
  notif.read = true;
  saveNotifications();
  renderNotifications();

  if (notif.type === 'leave_request') {
    document.getElementById('navHub').click(); // Show on dashboard
  } else if (notif.type === 'invite' && notif.status === 'accepted') {
    // Already shared, just inform
    showToast(t('plan.toast.invited', { name: notif.from }), 'info');
  }
}

function acceptInvite(id) {
  const notif = APP.notifications.find(n => n.id === id);
  if (!notif) return;

  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const owner = notif.from;
  const ownerKey = owner.toLowerCase();

  // 1. Update shared list (Owner grants access to Invited User)
  const shared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
  if (!shared[ownerKey]) shared[ownerKey] = [];
  if (!shared[ownerKey].includes(currentUser.toLowerCase())) {
    shared[ownerKey].push(currentUser.toLowerCase());
  }
  localStorage.setItem(STORAGE_KEYS.sharedPlannings, JSON.stringify(shared));

  // 2. Synchronize Team (Invited User becomes member of Owner's team)
  const teamKey = `${STORAGE_KEYS.teamMembers}_${ownerKey}`;
  let ownerTeam = JSON.parse(localStorage.getItem(teamKey) || '[]');

  // Ensure owner is Chef in their own team
  let ownerInTeam = ownerTeam.find(m => m.name.toLowerCase() === ownerKey);
  if (!ownerInTeam) {
    ownerTeam.push({ id: 'owner_' + Date.now(), name: owner, role: 'Chef de Labo', colorIdx: 0 });
  }

  // Add guest to owner's team
  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const guestData = usersDb[currentUser.toLowerCase()];
  const isFemale = guestData?.gender === 'female';
  const alreadyInTeam = ownerTeam.find(m => m.name.toLowerCase() === currentUser.toLowerCase());

  if (!alreadyInTeam) {
    ownerTeam.push({
      id: 'member_' + Date.now(),
      name: currentUser,
      role: isFemale ? 'Apprentie' : 'Apprenti',
      colorIdx: ownerTeam.length
    });
  }
  localStorage.setItem(teamKey, JSON.stringify(ownerTeam));

  // 3. Update Notif Status
  notif.status = 'accepted';
  notif.read = true;
  saveNotifications();
  renderNotifications();

  // 4. Global Refresh
  renderInvitations();
  if (APP.viewOwner === owner) {
    loadTeamMembers();
    renderTeam();
  }

  showToast(t('plan.toast.invited', { name: owner }), 'success');
}

function rejectInvite(id) {
  const notif = APP.notifications.find(n => n.id === id);
  if (!notif) return;
  notif.status = 'rejected';
  notif.read = true;
  saveNotifications();
  renderNotifications();
  showToast("Invitation refusée", 'info');
}

function inviteUserToPlanning() {
  const username = $('#inviteUser').value.trim();
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!username) return;

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  if (!usersDb[username.toLowerCase()]) {
    showToast(t('plan.toast.user_not_found'), 'error');
    return;
  }

  // 1. Send Notification (Invite only, actual sharing happens on acceptance)
  addNotification(username, {
    id: 'inv_' + Date.now(),
    type: 'invite',
    from: currentUser,
    timestamp: new Date().toISOString(),
    status: 'pending'
  });

  showToast(t('plan.toast.invite_sent', { name: username }), 'success');
  $('#inviteUser').value = '';
  $('#inviteAutocomplete').style.display = 'none';
}

function handleInviteAutocomplete() {
  const input = $('#inviteUser');
  const dropdown = $('#inviteAutocomplete');
  const query = input.value.trim().toLowerCase();

  if (query.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const matches = Object.keys(usersDb).filter(u => u.startsWith(query));

  if (matches.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  dropdown.style.display = 'block';
  dropdown.innerHTML = matches.map(m => `
    <div class="ac-suggestion" onclick="selectInviteUser('${m}')">
      <span class="avatar-mini">👨‍🍳</span>
      <span>${capitalizeFirstLetter(m)}</span>
    </div>
  `).join('');
}

function selectInviteUser(user) {
  $('#inviteUser').value = user;
  $('#inviteAutocomplete').style.display = 'none';
  inviteUserToPlanning();
}

function renderSharedList() {
  const container = $('#sharedWithList');
  if (!container) return;
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const shared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
  const list = shared[currentUser?.toLowerCase()] || [];

  if (list.length === 0) {
    container.innerHTML = '';
    return;
  }

  const owner = currentUser?.toLowerCase();
  const teamName = localStorage.getItem(`gourmet_team_name_${owner}`) || t('plan.shared.co_founder');

  container.innerHTML = `<div style="font-size:0.7rem; font-weight:700; color:var(--text-muted); text-transform:uppercase; margin-bottom:0.5rem;">${teamName}</div>` +
    list.map(u => `
      <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-alt); padding:0.5rem; border-radius:var(--radius-sm); margin-bottom:0.3rem;">
        <span style="font-size:0.85rem; font-weight:600;">@${capitalizeFirstLetter(u)}</span>
        <button onclick="removeShare('${u}')" style="color:var(--danger); font-size:0.8rem;">✕</button>
      </div>
    `).join('');
}

function removeShare(user) {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const shared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
  const ownerKey = currentUser.toLowerCase();

  // 1. Remove from share list
  shared[ownerKey] = shared[ownerKey].filter(u => u !== user.toLowerCase());
  localStorage.setItem(STORAGE_KEYS.sharedPlannings, JSON.stringify(shared));

  // 2. Remove from team members too
  const teamKey = `${STORAGE_KEYS.teamMembers}_${ownerKey}`;
  let team = JSON.parse(localStorage.getItem(teamKey) || '[]');
  team = team.filter(m => m.name.toLowerCase() !== user.toLowerCase());
  localStorage.setItem(teamKey, JSON.stringify(team));

  renderSharedList();
  loadTeamMembers();
  renderTeam();
  showToast(t('plan.shared.access_removed', { name: user }), 'info');
}

function renderInvitations() {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (!currentUser) return;

  const allShared = JSON.parse(localStorage.getItem(STORAGE_KEYS.sharedPlannings) || '{}');
  const invitedTo = [];

  for (const owner in allShared) {
    if (owner.toLowerCase() !== currentUser.toLowerCase() && allShared[owner].includes(currentUser.toLowerCase())) {
      invitedTo.push(owner);
    }
  }

  const selector = $('#planningOwnerSelector');
  if (!selector) return;

  // Clear existing options except the first one (Mon Planning)
  while (selector.options.length > 1) {
    selector.remove(1);
  }

  invitedTo.forEach(owner => {
    const teamName = localStorage.getItem(`gourmet_team_name_${owner.toLowerCase()}`) || owner;
    const option = document.createElement('option');
    option.value = owner;
    option.textContent = teamName;
    selector.appendChild(option);
  });

  // Show dropdown only if > 2 plannings (Mine + 2+ others)
  const wrap = $('.planning-selector-wrap');
  if (wrap) {
    wrap.style.display = (invitedTo.length >= 2) ? 'block' : 'none';
  }

  // Default to first invitation if available and not already viewing someone
  if (invitedTo.length > 0 && !APP.viewOwner) {
    APP.viewOwner = invitedTo[0];
    loadTeamMembers();
    renderTeam();
    renderLeaves();
  }

  // Sync selector value
  if (APP.viewOwner && APP.viewOwner !== currentUser) {
    selector.value = APP.viewOwner;
  } else {
    selector.value = 'current';
  }
}

function switchPlanningView(owner) {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  if (owner === 'current' || owner === currentUser) {
    APP.viewOwner = currentUser;
    showToast(t('plan.selector.personal'), 'info');
  } else {
    APP.viewOwner = owner;
    const teamName = localStorage.getItem(`gourmet_team_name_${owner.toLowerCase()}`) || owner;
    showToast(t('plan.shared.viewing', { name: teamName }), 'info');
  }

  loadTeamMembers();
  renderTeam();
  renderLeaves();
  renderAnnualCalendar();
}

function addTeamMember() {
  const nameInput = $('#memberName');
  const roleInput = $('#memberRole');
  const name = nameInput.value.trim();
  const role = roleInput.value;

  if (!name) {
    showToast(t('auth.error.empty'), 'error');
    return;
  }

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const targetUserData = usersDb[name.toLowerCase()];
  if (!targetUserData) {
    showToast(t('plan.team.not_found', { name }), 'error');
    return;
  }

  // Check if already in team
  if (APP.teamMembers.find(m => m.name.toLowerCase() === name.toLowerCase())) {
    showToast(t('plan.team.already_in', { name }), 'info');
    return;
  }

  // Define gender for the helper
  const isFemale = targetUserData.gender === 'female';

  // Use profile role if specified, otherwise use role input
  let roleToProcess = targetUserData.role || role;

  // Force 'Chef de Labo' if it's the very first member added to the team
  if (APP.teamMembers.length === 0) {
    roleToProcess = 'Chef de Labo';
  }

  // Use the new gender-sensitive role helper
  const finalRole = getGenderedRole(roleToProcess, isFemale);

  const nextColorIdx = APP.teamMembers.length > 0
    ? (Math.max(...APP.teamMembers.map(m => m.colorIdx || 0)) + 1)
    : 0;

  APP.teamMembers.push({
    id: Date.now().toString(),
    name,
    role: finalRole,
    colorIdx: nextColorIdx
  });

  saveTeamMembers();
  renderTeam();
  nameInput.value = '';
  $('#memberAutocomplete').style.display = 'none';
  showToast(t('plan.team.added', { name }), 'success');
}

function handleMemberAutocomplete() {
  const input = $('#memberName');
  const dropdown = $('#memberAutocomplete');
  const query = input.value.trim().toLowerCase();

  if (query.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const matches = Object.keys(usersDb).filter(u => u.startsWith(query));

  if (matches.length === 0) {
    dropdown.style.display = 'none';
    return;
  }

  dropdown.style.display = 'block';
  dropdown.innerHTML = matches.map(m => `
    <div class="ac-suggestion" onclick="selectMemberUser('${m}')">
      <span class="avatar-mini">👨‍🍳</span>
      <span>${capitalizeFirstLetter(m)}</span>
    </div>
  `).join('');
}

function selectMemberUser(user) {
  $('#memberName').value = user;
  $('#memberAutocomplete').style.display = 'none';
  addTeamMember();
}

function removeTeamMember(id) {
  if (!confirm(t('plan.team.confirm_remove'))) return;
  APP.teamMembers = APP.teamMembers.filter(m => m.id !== id);
  saveTeamMembers();
  renderTeam();
  showToast(t('plan.team.removed'), 'info');
}

function editMemberRole(id) {
  const member = APP.teamMembers.find(m => m.id === id);
  if (!member) return;

  const modal = $('#roleModal');
  const nameEl = $('#roleModalMemberName');
  const select = $('#roleSelect');

  nameEl.textContent = capitalizeFirstLetter(member.name);
  select.value = member.role; // This will only work if current role matches one of the options

  // Store the member ID in the save button for later retrieval
  $('#btnSaveRole').onclick = () => confirmRoleUpdate(id);

  modal.style.display = 'flex';
}

function confirmRoleUpdate(id) {
  const member = APP.teamMembers.find(m => m.id === id);
  if (!member) return;

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const targetUserData = usersDb[member.name.toLowerCase()];
  const isFemale = targetUserData?.gender === 'female';

  const select = $('#roleSelect');
  member.role = getGenderedRole(select.value, isFemale);

  saveTeamMembers();
  renderTeam();
  closeRoleModal();
  showToast(t('plan.team.role_updated', { role: member.role }), 'success');
}

function closeRoleModal() {
  $('#roleModal').style.display = 'none';
}

function renderAnnualCalendar() {
    const container = document.getElementById('annualCalendarView');
    if (!container) return;
    
    const currentZone = localStorage.getItem('gourmet_vacation_zone') || 'C';
    const currentYear = 2026;
    const months = {
      1:'Janvier', 2:'Février', 3:'Mars', 4:'Avril', 5:'Mai', 6:'Juin',
      7:'Juillet', 8:'Août', 9:'Septembre', 10:'Octobre', 11:'Novembre', 12:'Décembre'
    };

    const zoneHolidays = {
      'A': ['2026-02-07', '2026-02-23', '2026-04-11', '2026-04-27'],
      'B': ['2026-02-14', '2026-03-02', '2026-04-18', '2026-05-04'],
      'C': ['2026-02-21', '2026-03-09', '2026-04-04', '2026-04-20']
    };

    const events = {
      '01-01': '✨ Nouvel An', '01-06': '👑 Épiphanie', '02-02': '🥞 Chandeleur', '02-14': '💖 Valentin',
      '03-01': '👵 Fête G-Mères', '04-05': '🐣 Pâques', '04-06': '🍫 Lundi Pâques', '05-01': '🌿 Fête Travail',
      '05-08': '🎖️ Victoire 1945', '05-14': '☁️ Ascension', '05-24': '🕊️ Pentecôte', '05-31': '🌸 Fête Mères',
      '06-21': '👔 Fête Pères', '07-14': '🎆 Fête Nationale', '08-15': '⛪ Assomption', '11-01': '🕯️ Toussaint',
      '12-25': '🎄 Noël', '12-31': '🍾 St Sylvestre'
    };

    let html = '';
    for (let m = 0; m < 12; m++) {
        const daysInMonth = new Date(currentYear, m + 1, 0).getDate();
        html += `<div class="month-view" style="display:grid; grid-template-columns: 160px 1fr; align-items:center; gap:2rem; padding:1.2rem; border-bottom:1px solid rgba(0,0,0,0.05);">
            <h4 style="margin:0; font-family:var(--font-heading); color:var(--primary); font-size:1.3rem; font-weight:900; text-transform:capitalize;">${months[m+1]}</h4>
            <div style="display:grid; grid-template-columns: repeat(31, 1fr); gap:5px; width:100%;">`;
        
        for (let d = 1; d <= 31; d++) {
            if (d > daysInMonth) { html += `<div></div>`; continue; }
            const date = new Date(currentYear, m, d);
            const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            const mmDd = dateStr.slice(5);
            const isWE = date.getDay() === 0 || date.getDay() === 6;
            const holidayRange = zoneHolidays[currentZone] || zoneHolidays.C;
            
            let isVacation = false;
            if ((dateStr >= holidayRange[0] && dateStr <= holidayRange[1]) || 
                (dateStr >= holidayRange[2] && dateStr <= holidayRange[3]) ||
                (dateStr >= '2026-07-04' && dateStr <= '2026-08-31') ||
                (dateStr >= '2026-10-17' && dateStr <= '2026-11-02') ||
                (dateStr >= '2026-12-19' && dateStr <= '2027-01-04')) {
                isVacation = true;
            }

            const event = events[mmDd];
            let cellStyle = `height:46px; display:flex; align-items:center; justify-content:center; font-size:0.9rem; font-weight:800; border-radius:8px; position:relative; `;
            
            if (event) cellStyle += `background:var(--accent); color:white; scale:1.15; z-index:2; box-shadow:0 6px 12px var(--accent-glow); margin:0 2px;`;
            else if (isVacation) cellStyle += `background:rgba(16, 185, 129, 0.15); color:var(--success); `;
            else if (isWE) cellStyle += `background:var(--bg-alt); opacity:0.6; `;
            else cellStyle += `background:rgba(0,0,0,0.02); color:var(--text-secondary);`;

            html += `<div style="${cellStyle}" title="${event || (isVacation ? 'Vacances' : '')}">
                ${d}${event ? `<span style="position:absolute; bottom:0px; font-size:0.55rem; width:100%; text-align:center;">${event.split(' ')[0]}</span>` : ''}
            </div>`;
        }
        html += `</div></div>`;
    }
    container.innerHTML = html;
}

async function renderAdminUsers() {
  const container = $('#adminUserList');
  if (!container) return;

  container.innerHTML = `<tr><td colspan="5" style="padding:2rem; text-align:center;"><div class="spinner-pro"></div><br>Chargement des utilisateurs Supabase...</td></tr>`;

  try {
    // Fetch all profiles from Supabase
    const { data: profiles, error } = await gourmetSupabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!profiles || profiles.length === 0) {
      container.innerHTML = `<tr><td colspan="5" style="padding:1rem; text-align:center;">${t('admin.col.user') === 'User' ? 'No registered users.' : 'Aucun utilisateur enregistré.'}</td></tr>`;
      return;
    }

    container.innerHTML = profiles.map(u => {
      const isAdmin = u.plan === 'admin' || u.is_admin === true;
      const isBanned = u.is_banned || false;
      const planLabel = u.plan ? u.plan.toUpperCase() : 'FREE';
      const planColor = u.plan === 'admin' ? 'var(--primary)' : (u.plan === 'pro' ? 'var(--secondary)' : 'var(--text-muted)');

      return `
        <tr style="border-bottom:1px solid var(--surface-border); ${isBanned ? 'opacity:0.6; background:rgba(254,226,226,0.3);' : ''}">
          <td style="padding:1rem; font-weight:600;">
            <div style="display:flex; align-items:center; gap:10px;">
               <span style="font-size:1.2rem;">${u.gender === 'female' ? '👩‍🍳' : '👨‍🍳'}</span>
               <div>
                  ${escapeHtml(u.full_name || u.email.split('@')[0])}
                  ${isAdmin ? '<span style="margin-left:5px; font-size:0.65rem; background:var(--primary); color:white; padding:1px 4px; border-radius:3px; font-weight:800;">ADMIN</span>' : ''}
               </div>
            </div>
          </td>
          <td style="padding:1rem; color:var(--text-muted); font-size:0.85rem;">${escapeHtml(u.email || '—')}</td>
          <td style="padding:1rem;">
             <span style="font-size:0.7rem; font-weight:800; padding:3px 8px; border-radius:20px; background:${planColor}22; color:${planColor}; border:1px solid ${planColor}44;">
                ${planLabel}
             </span>
          </td>
          <td style="padding:1rem; font-size:0.85rem;">${escapeHtml(u.role || 'Chef de Labo')}</td>
          <td style="padding:1rem; text-align:right; display:flex; gap:0.5rem; justify-content:flex-end;">
            <button class="btn btn-sm btn-outline" onclick="openAdminModeration('${u.id}')">🛡️ ${t('nav.admin') === 'Admin' ? 'Moderate' : 'Modérer'}</button>
            ${!isAdmin ?
          `<button class="btn btn-sm btn-outline" style="color:var(--danger); border-color:var(--danger);" onclick="deleteUserSupabase('${u.id}')">🗑️</button>` :
          '<small style="color:var(--text-muted); padding:0 0.5rem;">Admin</small>'}
          </td>
        </tr>
      `;
    }).join('');
  } catch (err) {
    console.error('Admin Fetch Error:', err);
    container.innerHTML = `<tr><td colspan="5" style="padding:1rem; text-align:center; color:var(--danger);">Erreur de connexion Supabase. Vérifiez vos politiques RLS.</td></tr>`;
  }
}

let selectedModerationUser = null;

async function openAdminModeration(userId) {
  const container = $('#adminUserDetail');
  if (!container) return;

  selectedModerationUser = userId;
  window.openModal('adminUserModal');
  container.innerHTML = '<div style="padding:1rem; text-align:center;"><div class="spinner-pro"></div></div>';

  try {
    const { data: u, error } = await gourmetSupabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw error;

    const isAdmin = u.plan === 'admin';
    const isBanned = u.is_banned || false;

    container.innerHTML = `
      <div style="background:var(--bg-alt); padding:1.5rem; border-radius:var(--radius-md); border:1px solid var(--surface-border);">
        <div style="display:flex; align-items:center; gap:12px; margin-bottom:1rem;">
           <span style="font-size:2rem;">${u.gender === 'female' ? '👩‍🍳' : '👨‍🍳'}</span>
           <div>
              <div style="font-weight:900; font-size:1.2rem;">${escapeHtml(u.full_name || 'Chef')}</div>
              <div style="font-size:0.85rem; color:var(--text-muted);">${escapeHtml(u.email)}</div>
           </div>
        </div>
        <div style="display:grid; grid-template-columns:auto 1fr; gap:0.5rem 1rem; font-size:0.9rem; padding-top:1rem; border-top:1px dashed var(--surface-border);">
          <span style="color:var(--text-muted);">ID Supabase:</span> <code style="font-size:0.7rem;">${u.id}</code>
          <span style="color:var(--text-muted);">Plan Actuel:</span> <b style="color:var(--primary);">${u.plan?.toUpperCase() || 'FREE'}</b>
          <span style="color:var(--text-muted);">Inscrit le:</span> <b>${new Date(u.created_at).toLocaleDateString()}</b>
        </div>
      </div>
    `;

    const btnAdmin = $('#btnAdminToggle');
    const btnBan = $('#btnBanToggle');

    if (btnAdmin) {
      btnAdmin.textContent = isAdmin ? '🛡️ Retirer Admin' : '🛡️ Rendre Admin';
      btnAdmin.className = isAdmin ? 'btn btn-primary btn-full' : 'btn btn-outline btn-full';
      btnAdmin.onclick = () => toggleAdminStatusSupabase(u.id, isAdmin);
    }

    if (btnBan) {
      btnBan.textContent = isBanned ? '✅ Débannir' : '🚫 Bannir l\'utilisateur';
      btnBan.style.color = isBanned ? 'var(--success)' : 'var(--danger)';
      btnBan.style.borderColor = isBanned ? 'var(--success)' : 'var(--danger)';
      btnBan.onclick = () => toggleBanStatusSupabase(u.id, isBanned);
    }
    
    $('#btnDeleteUserModal').onclick = () => deleteUserSupabase(u.id, u.full_name || u.email);

  } catch (err) {
    container.innerHTML = `<div style="color:var(--danger); padding:1rem;">Erreur de chargement du profil.</div>`;
  }
}

async function toggleAdminStatusSupabase(userId, currentStatus) {
  const newPlan = currentStatus ? 'pro' : 'admin';
  try {
    const { error } = await gourmetSupabase.from('profiles').update({ plan: newPlan }).eq('id', userId);
    if (error) throw error;
    showToast('Statut Admin mis à jour', 'success');
    openAdminModeration(userId);
    renderAdminUsers();
  } catch (err) {
    showToast('Erreur lors de la mise à jour', 'error');
  }
}

async function toggleBanStatusSupabase(userId, currentStatus) {
  try {
    const { error } = await gourmetSupabase.from('profiles').update({ is_banned: !currentStatus }).eq('id', userId);
    if (error) throw error;
    showToast(currentStatus ? 'Utilisateur débanni' : 'Utilisateur banni', 'info');
    openAdminModeration(userId);
    renderAdminUsers();
  } catch (err) {
    showToast('Erreur lors du bannissement', 'error');
  }
}

async function deleteUserSupabase(userId, name) {
  if (confirm(`⚠️ ATTENTION : Voulez-vous vraiment supprimer définitivement le profil de ${name} ?\n\nNote : Cela supprimera son profil dans la base mais pas son accès Auth (à faire manuellement dans le dashboard Supabase).`)) {
    try {
      const { error } = await gourmetSupabase.from('profiles').delete().eq('id', userId);
      if (error) throw error;
      showToast('Profil supprimé avec succès', 'success');
      closeAdminModeration();
      renderAdminUsers();
    } catch (err) {
      showToast('Erreur lors de la suppression', 'error');
    }
  }
}

function closeAdminModeration() {
  window.closeModal('adminUserModal');
}

// ============================================================================
// MODULAR EXTENSIONS — ROADMAP ENHANCEMENTS
// ============================================================================

// 1. PRODUCTION & STOCK SYNC
function confirmProduction() {
  const portionsInput = document.getElementById('prodPortions');
  const portions = portionsInput ? (parseInt(portionsInput.value) || 0) : 0;
  if (portions <= 0) {
    if (typeof showToast === 'function') showToast('Quantité invalide', 'error');
    return;
  }

  const recipe = APP.recipe;
  const originalPortions = recipe.portions || 10;
  const ratio = portions / originalPortions;

  const deductions = [];
  const unknown = [];

  recipe.ingredients.forEach(ing => {
    if (!ing.name || ing.quantity <= 0) return;
    const needed = ing.quantity * ratio;

    // Find in inventory (exact match)
    let invItem = APP.inventory.find(i => i.name.toLowerCase() === ing.name.toLowerCase());

    if (invItem) {
      deductions.push({ item: invItem, needed });
    } else {
      unknown.push(ing.name);
    }
  });

  if (unknown.length > 0) {
    const proceed = confirm(`Certains ingrédients (${unknown.join(', ')}) ne sont pas dans votre inventaire. Continuer quand même ?`);
    if (!proceed) return;
  }

  // Apply deductions
  let lowStockList = [];
  deductions.forEach(d => {
    d.item.stock = Math.round((Math.max(0, d.item.stock - d.needed)) * 100) / 100;
    if (d.item.stock <= d.item.alertThreshold) {
      lowStockList.push(d.item.name);
    }
  });

  // Save changes
  saveInventory();
  renderInventory();
  updateDashboard();

  // Record Traceability Entry (Module 3)
  const lotNumber = 'L' + new Date().getFullYear().toString().slice(-2) +
    (Math.floor(Date.now() / 1000) % 100000).toString().padStart(5, '0');

  const traceEntry = {
    id: 'tr_' + Date.now(),
    lot: lotNumber,
    product: recipe.name || 'Produit Inconnu',
    date: new Date().toISOString(),
    exp: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Default +3 days
    qty: portions + ' ' + (typeof t === 'function' ? t('unit.portions') : 'portions')
  };

  if (!APP.haccpLogs.trace) APP.haccpLogs.trace = [];
  APP.haccpLogs.trace.unshift(traceEntry);
  saveHaccpLogs();

  if (typeof showToast === 'function') {
    showToast(typeof t === 'function' ? t('ui.prod.success') : 'Production validée et stocks mis à jour.', 'success');
  }
}

// 2. SCAN FACTURE (Simulated IA)
function simulateInvoiceScan() {
  // Open the real OCR scanner modal if available
  const ocrModal = document.getElementById('ocrScannerModal');
  if (ocrModal) {
    // Clear previous state
    const preview = document.getElementById('ocrPreview');
    const status = document.getElementById('ocrStatus');
    const results = document.getElementById('ocrResults');
    if (preview) preview.innerHTML = '';
    if (status) { status.style.display = 'none'; status.textContent = ''; }
    if (results) results.innerHTML = '';

    ocrModal.style.display = 'flex';

    // Inject a file picker directly if none exists yet
    if (preview && !preview.querySelector('input[type=file]')) {
      const label = document.createElement('label');
      label.style.cssText = 'display:flex; flex-direction:column; align-items:center; gap:1rem; padding:2rem; border:2px dashed var(--surface-border); border-radius:12px; cursor:pointer; transition:all 0.3s;';
      label.innerHTML = `
        <span style="font-size:3rem;">📸</span>
        <span style="font-weight:700; font-size:1rem;">Cliquez pour choisir une photo de facture</span>
        <span style="font-size:0.8rem; color:var(--text-muted);">Formats acceptés : JPG, PNG, WEBP, PDF</span>
        <input type="file" accept="image/*,application/pdf" style="display:none;">
      `;
      preview.appendChild(label);

      label.querySelector('input').onchange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show image preview
        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (ev) => {
            preview.innerHTML = `<img src="${ev.target.result}" style="max-width:100%; max-height:300px; border-radius:8px; object-fit:contain;">` ;
          };
          reader.readAsDataURL(file);
        } else {
          preview.innerHTML = `<div style="padding:1rem; background:var(--bg-alt); border-radius:8px;">📄 ${file.name}</div>`;
        }

        // Status
        if (status) {
          status.style.display = 'block';
          status.innerHTML = '⏳ Analyse de la facture en cours… (simulation OCR)';
        }

        // Simulate OCR extraction after delay
        setTimeout(() => {
          if (status) status.innerHTML = '✅ Analyse terminée ! Voici les ingrédients détectés :';

          // Pick 3–5 random items from inventory/DB to simulate detected prices
          const pool = APP.inventory.length > 0 ? APP.inventory : (APP.ingredientDb || []).map(d => ({ name: d.name, unit: d.unit, price: d.pricePerUnit }));
          const detected = pool.slice(0, Math.min(5, pool.length)).map(item => ({
            name: item.name,
            unit: item.unit,
            detectedPrice: Math.round(((item.price || 1) * (1 + (Math.random() * 0.3 - 0.05))) * 100) / 100
          }));

          if (results) {
            results.innerHTML = detected.map((d, i) => `
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0.7rem 1rem; background:var(--bg-alt); border-radius:8px; margin-bottom:6px;">
                <span>${getIngredientEmoji(d.name)} <strong>${d.name}</strong></span>
                <span style="color:var(--accent); font-weight:700;">${d.detectedPrice.toFixed(2)} € / ${d.unit === 'g' ? 'kg' : d.unit === 'ml' ? 'L' : d.unit}</span>
                <button class="btn btn-sm btn-primary" onclick="applyOCRPrice(${i}, '${d.name}', ${d.detectedPrice})" style="padding:4px 10px;">✅ Appliquer</button>
              </div>
            `).join('');
            // Store detected data globally for apply function
            window._ocrDetected = detected;
          }
        }, 2500);
      };
    }
    return;
  }

  // Fallback: simple file picker if modal is missing
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (typeof showToast === 'function') showToast('⏳ Scan de la facture en cours…', 'info');
    setTimeout(() => {
      if (typeof showToast === 'function') showToast('✅ Scan terminé ! Ouvrez la fenêtre OCR pour voir les résultats.', 'success');
    }, 2500);
  };
  input.click();
}

function applyOCRPrice(index, name, price) {
  const item = APP.inventory.find(i => i.name === name);
  if (item) {
    recordPriceChange(item, price);
    item.price = price;
    const dbIng = (APP.ingredientDb || []).find(i => i.name === name);
    if (dbIng) dbIng.pricePerUnit = price;
    saveIngredientDb();
    saveInventory();
    renderInventory();
  }
  // Update button to mark as applied
  const btn = document.querySelectorAll('#ocrResults button')[index];
  if (btn) { btn.textContent = '✓ Appliqué'; btn.disabled = true; btn.style.background = 'var(--success)'; }
  if (typeof showToast === 'function') showToast(`✅ Prix de ${name} mis à jour : ${price} €`, 'success');
}
window.applyOCRPrice = applyOCRPrice;
