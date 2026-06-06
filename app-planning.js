// PLANNING & TEAM MANAGEMENT
// ============================================================================

const TEAM_COLORS = [
  { bg: '#dbeafe', border: '#3b82f6', text: '#1e40af', dot: '#3b82f6' }, // Bleu
  { bg: '#dcfce7', border: '#22c55e', text: '#166534', dot: '#22c55e' }, // Vert
  { bg: '#fef3c7', border: '#f59e0b', text: '#92400e', dot: '#f59e0b' }, // Ambre
  { bg: '#fce7f3', border: '#ec4899', text: '#9d174d', dot: '#ec4899' }, // Rose
  { bg: '#e0e7ff', border: '#6366f1', text: '#3730a3', dot: '#6366f1' }, // Indigo
  { bg: '#ffedd5', border: '#f97316', text: '#9a3412', dot: '#f97316' }, // Orange
  { bg: '#f3e8ff', border: '#a855f7', text: '#6b21a8', dot: '#a855f7' }, // Violet
  { bg: '#ccfbf1', border: '#14b8a6', text: '#115e59', dot: '#14b8a6' }, // Turquoise
  { bg: '#fee2e2', border: '#ef4444', text: '#991b1b', dot: '#ef4444' }, // Rouge
  { bg: '#f0fdf4', border: '#10b981', text: '#065f46', dot: '#10b981' }, // Émeraude
  { bg: '#fff7ed', border: '#fb923c', text: '#7c2d12', dot: '#fb923c' }, // Sorbet
  { bg: '#faf5ff', border: '#c084fc', text: '#581c87', dot: '#c084fc' }, // Mauve
];

function getMemberColor(memberId) {
  const member = APP.teamMembers.find(m => m.id === memberId);
  if (member && member.colorIdx !== undefined) return TEAM_COLORS[member.colorIdx % TEAM_COLORS.length];
  const idx = APP.teamMembers.findIndex(m => m.id === memberId);
  return TEAM_COLORS[(idx >= 0 ? idx : 0) % TEAM_COLORS.length];
}

function loadTeamMembers() {
  const teamKey = getUserTeamKey();
  const data = localStorage.getItem(teamKey);
  APP.teamMembers = data ? JSON.parse(data) : [];
  APP.teamMembers.forEach((m, i) => { if (m.colorIdx === undefined) m.colorIdx = i; });

  const leavesKey = getUserLeavesKey();
  const leaveData = localStorage.getItem(leavesKey);
  APP.staffLeaves = leaveData ? JSON.parse(leaveData) : [];

  const owner = getViewOwner().toLowerCase();
  const teamName = localStorage.getItem(`gourmet_team_name_${owner}`) || '';
  const nameInput = $('#teamNameInput');
  if (nameInput) {
    nameInput.value = teamName;
    nameInput.disabled = (localStorage.getItem(STORAGE_KEYS.currentUser)?.toLowerCase() !== owner);
  }

  // Cloud sync en arrière-plan
  if (navigator.onLine && window.GourmetSync) {
    Promise.all([
      GourmetSync.chargerTeam(),
      GourmetSync.chargerLeaves()
    ]).then(([cloudTeam, cloudLeaves]) => {
      if (cloudTeam !== null && cloudTeam.length > 0) {
        APP.teamMembers = cloudTeam;
        APP.teamMembers.forEach((m, i) => { if (m.colorIdx === undefined) m.colorIdx = i; });
        localStorage.setItem(getUserTeamKey(), JSON.stringify(APP.teamMembers));
        if (typeof renderTeamList === 'function') renderTeamList();
      }
      if (cloudLeaves !== null && cloudLeaves.length > 0) {
        APP.staffLeaves = cloudLeaves;
        localStorage.setItem(getUserLeavesKey(), JSON.stringify(APP.staffLeaves));
        if (typeof renderLeaveCalendar === 'function') renderLeaveCalendar();
      }
    }).catch(() => {});
  }
}

function saveTeamMembers() {
  const teamKey = getUserTeamKey();
  const leavesKey = getUserLeavesKey();
  localStorage.setItem(teamKey, JSON.stringify(APP.teamMembers));
  localStorage.setItem(leavesKey, JSON.stringify(APP.staffLeaves));

  const owner = getViewOwner().toLowerCase();
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser)?.toLowerCase();
  if (owner === currentUser) {
    const teamName = $('#teamNameInput')?.value || '';
    localStorage.setItem(`gourmet_team_name_${owner}`, teamName);
    renderSharedList();
  }

  // Sync cloud chaque membre & absence
  if (window.GourmetSync) {
    APP.teamMembers.forEach(m => GourmetSync.sauvegarderMember(m).catch(() => {}));
    APP.staffLeaves.forEach(l => GourmetSync.sauvegarderLeave(l).catch(() => {}));
  }
}

function checkPermissions() {
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const owner = getViewOwner();
  const isOwner = currentUser?.toLowerCase() === owner.toLowerCase();

  const usersDb = JSON.parse(localStorage.getItem(STORAGE_KEYS.users) || '{}');
  const userKey = currentUser?.toLowerCase();
  const isJuAdmin = userKey === 'ju' && usersDb[userKey]?.pin === '2503';

  const teamKey = getUserTeamKey();
  const team = JSON.parse(localStorage.getItem(teamKey) || '[]');
  const myEntry = team.find(m => m.name.toLowerCase() === userKey);

  // Use profile role if available, fallback to team entry or default roles
  const profileRole = usersDb[userKey]?.role || 'Consultant';
  let role = myEntry ? myEntry.role : (isOwner ? profileRole : 'Consultant');

  // No longer auto-promoting owners to Chef. They must explicitly have the role.
  const isChef = (role === 'Chef de Labo');

  // Owners and super admin (Ju) can always manage their team
  const canModifyTeam = isOwner || isJuAdmin;
  const canModifyLeaves = (isChef && isOwner) || isJuAdmin;

  if ($('#btnAddMember')) {
    $('#btnAddMember').parentElement.style.display = canModifyTeam ? 'block' : 'none';
  }

  if ($('#btnInviteUser')) {
    $('#btnInviteUser').parentElement.style.display = isOwner ? 'block' : 'none';
  }

  const leaveForm = document.querySelector('.leave-form');
  if (leaveForm) {
    leaveForm.style.display = isOwner ? 'block' : 'none';
  }

  const leaveBtn = $('#btnAddLeave');
  if (leaveBtn) {
    leaveBtn.textContent = (isChef || isJuAdmin) ? t('plan.leave.btn') : t('plan.leave.request_btn');
  }

  // Dashboard Workflow visibility
  const chefWorkflow = $('#chefWorkflowArea');
  if (chefWorkflow) {
    chefWorkflow.style.display = (isChef || isJuAdmin) ? 'block' : 'none';
  }

  const clearBtn = $('#btnClearPlanning');
  if (clearBtn) {
    clearBtn.style.display = (isChef || isJuAdmin) ? 'block' : 'none';
  }

  return { isChef, isOwner, isJuAdmin, canModify: canModifyLeaves, role };
}

function renderTeam() {
  const container = $('#teamMemberList');
  const select = $('#leaveMemberId');
  if (!container) return;
  const { isChef, isOwner, isJuAdmin } = checkPermissions();
  const canRemove = (isOwner && isChef) || isJuAdmin;

  if (APP.teamMembers.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.85rem;">${t('plan.team.no_members')}</p>`;
    if (select) select.innerHTML = `<option value="">${t('plan.team.no_employee')}</option>`;
    return;
  }

  container.innerHTML = APP.teamMembers.map(m => {
    const c = getMemberColor(m.id);
    return `
    <div class="team-member">
      <div class="member-main-content">
        <span class="member-dot" style="background:${c.dot}"></span>
        <div class="member-info">
          <h4>${capitalizeFirstLetter(escapeHtml(m.name))}</h4>
          <span>${escapeHtml(m.role)}</span>
        </div>
      </div>
      <div class="member-actions-group">
        ${canRemove ? `
          <button class="action-btn edit-btn" onclick="editMemberRole('${m.id}')" title="${t('plan.team.assign_role')}">✏️</button>
          <button class="action-btn remove-btn" onclick="removeTeamMember('${m.id}')" title="${t('ui.btn.delete')}">✕</button>
        ` : ''}
      </div>
    </div>`;
  }).join('');

  if (select) {
    select.innerHTML = `<option value="">— ${t('plan.leave.choose')} —</option>` +
      APP.teamMembers.map(m => {
        const c = getMemberColor(m.id);
        return `<option value="${m.id}" style="border-left:3px solid ${c.dot};">${capitalizeFirstLetter(escapeHtml(m.name))}</option>`;
      }).join('');

    // Auto-select if user is in team
    const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
    const myEntry = APP.teamMembers.find(m => m.name.toLowerCase() === currentUser?.toLowerCase());
    if (myEntry) select.value = myEntry.id;
  }
}

function addLeave() {
  const memberId = $('#leaveMemberId').value;
  const start = $('#leaveStart').value;
  const end = $('#leaveEnd').value;
  const { isChef, isOwner } = checkPermissions();

  if (!memberId || !start || !end) {
    showToast(t('plan.leave.empty_fields'), 'error');
    return;
  }

  const member = APP.teamMembers.find(m => m.id === memberId);
  const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
  const owner = getViewOwner();

  if (canModify || (isChef && isOwner)) {
    // Direct add
    APP.staffLeaves.push({
      id: Date.now().toString(),
      memberId,
      memberName: member ? member.name : 'Inconnu',
      start,
      end,
      status: 'approved'
    });
    saveTeamMembers();
    renderLeaves();
    renderAnnualCalendar();
    showToast(t('plan.leave.registered_for', { name: member ? member.name : '' }), 'success');
  } else {
    // Request permission
    const requestId = 'req_' + Date.now();
    addNotification(owner, {
      id: requestId,
      type: 'leave_request',
      status: 'pending',
      from: currentUser,
      memberId,
      memberName: member ? member.name : currentUser,
      start,
      end,
      timestamp: new Date().toISOString()
    });
    showToast(t('plan.leave.sent'), 'info');
  }

  // Reset inputs
  $('#leaveStart').value = '';
  $('#leaveEnd').value = '';
}

function renderPendingLeavesDashboard() {
  const container = $('#pendingLeavesDashboard');
  const countBadge = $('#pendingRequestsCount');
  if (!container) return;

  const { isChef, isJuAdmin } = checkPermissions();
  const area = $('#chefWorkflowArea');
  if (!isChef && !isJuAdmin) {
    if (area) area.style.display = 'none';
    return;
  }

  const pending = APP.notifications.filter(n => n.type === 'leave_request' && !n.handled);

  if (countBadge) {
    countBadge.textContent = pending.length;
    countBadge.style.display = pending.length > 0 ? 'inline-block' : 'none';
  }

  if (area) {
    area.style.display = pending.length > 0 ? 'block' : 'none';
  }

  if (pending.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted); font-size:0.9rem; text-align:center; padding:1.5rem;">Aucune demande en attente.</p>';
    return;
  }

  container.innerHTML = pending.map(n => {
    const s = new Date(n.start);
    const e = new Date(n.end);
    const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;

    return `
      <div class="pending-leave-card card" style="margin-bottom:1rem; padding:1.2rem; border-left:4px solid var(--accent-light);">
        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem;">
          <div>
            <div style="font-weight:700; font-size:1.1rem; color:var(--text);">${capitalizeFirstLetter(n.memberName)}</div>
            <div style="font-size:0.85rem; color:var(--text-secondary);">${t('plan.leave.requested_by', { name: capitalizeFirstLetter(n.from) })}</div>
          </div>
          <div style="text-align:right;">
            <div style="font-weight:800; color:var(--accent); font-size:0.9rem;">${days} ${days > 1 ? t('plan.leave.days') : t('plan.leave.day')}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">${new Date(n.timestamp).toLocaleDateString()}</div>
          </div>
        </div>
        <div style="background:var(--bg-alt); padding:0.8rem; border-radius:var(--radius-sm); margin-bottom:1.2rem; display:flex; gap:1.5rem; font-size:0.95rem;">
          <div><span style="color:var(--text-muted); font-size:0.8rem; display:block;">${t('plan.leave.from_short')}</span> <b>${s.toLocaleDateString()}</b></div>
          <div><span style="color:var(--text-muted); font-size:0.8rem; display:block;">${t('plan.leave.to_short')}</span> <b>${e.toLocaleDateString()}</b></div>
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:0.8rem;">
          <button class="btn btn-primary btn-sm" onclick="handleLeaveAction('${n.id}', 'approve')">${t('plan.btn.approve')}</button>
          <button class="btn btn-outline btn-sm" onclick="handleLeaveAction('${n.id}', 'reject')" style="color:var(--danger); border-color:var(--danger);">${t('plan.btn.reject')}</button>
        </div>
      </div>
    `;
  }).join('');
}

function handleLeaveAction(requestId, action) {
  const notif = APP.notifications.find(n => n.id === requestId);
  if (!notif) return;

  if (action === 'approve') {
    APP.staffLeaves.push({
      id: Date.now().toString(),
      memberId: notif.memberId,
      memberName: notif.memberName,
      start: notif.start,
      end: notif.end,
      status: 'approved'
    });
    saveTeamMembers();
    showToast(t('plan.leave.approved', { name: notif.memberName }), 'success');
  } else {
    showToast(t('plan.leave.denied_for', { name: notif.memberName }), 'info');
  }

  // Update notification status
  notif.status = action === 'approve' ? 'approved' : 'denied';
  notif.handled = true;
  notif.read = true;
  saveNotifications();

  // Re-render
  renderPendingLeavesDashboard();
  renderNotifications();
  renderAnnualCalendar();
}

function removeLeave(id) {
  const { isChef, isOwner, isJuAdmin } = checkPermissions();
  if (!isJuAdmin && (!isChef || !isOwner)) {
    showToast(t('plan.leave.error.admin_only'), 'error');
    return;
  }

  if (!confirm(t('plan.leave.confirm_delete'))) return;

  APP.staffLeaves = APP.staffLeaves.filter(l => l.id !== id);
  saveTeamMembers();
  renderLeaves();
  renderAnnualCalendar();
  showToast(t('plan.leave.deleted'), 'info');
}

function clearPlanning() {
  const { isChef, isJuAdmin } = checkPermissions();
  if (!isChef && !isJuAdmin) return;

  if (!confirm(t('plan.confirm_clear_all'))) return;

  APP.staffLeaves = [];
  saveTeamMembers();
  renderLeaves();
  renderAnnualCalendar();
  showToast(t('plan.toast.cleared'), 'success');
}

function renderLeaves() {
  const container = $('#leaveList');
  if (!container) return;
  const { isChef, isOwner } = checkPermissions();

  if (APP.staffLeaves.length === 0) {
    container.innerHTML = `<p style="color:var(--text-muted); font-size:0.8rem; text-align:center; padding:0.5rem 0;">${t('plan.leave.none')}</p>`;
    return;
  }

  const sorted = [...APP.staffLeaves].sort((a, b) => new Date(a.start) - new Date(b.start));

  container.innerHTML = `<div style="font-size:0.7rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); letter-spacing:0.5px; margin-bottom:0.6rem;">${t('plan.leave.registered')} (${sorted.length})</div>` +
    sorted.map(l => {
      const s = new Date(l.start);
      const e = new Date(l.end);
      const sStr = s.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const eStr = e.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
      const days = Math.round((e - s) / (1000 * 60 * 60 * 24)) + 1;
      const c = getMemberColor(l.memberId);
      const canRemove = (isOwner && isChef) || isJuAdmin;
      return `
      <div class="leave-card" style="border-left-color:${c.dot}; background:${c.bg}">
        <span class="member-dot" style="background:${c.dot}"></span>
        <div class="leave-card-left">
          <div class="leave-card-name">${capitalizeFirstLetter(escapeHtml(l.memberName))}</div>
          <div class="leave-card-dates">📅 ${sStr} → ${eStr} <span class="leave-card-days" style="color:${c.text}">(${days}${t('plan.leave.day').charAt(0)})</span></div>
        </div>
        ${canRemove ? `<button class="remove-member" onclick="removeLeave('${l.id}')" title="Supprimer ce congé">✕</button>` : ''}
      </div>
    `;
    }).join('');
}

// ============================================================================
// SHARING & NOTIFICATIONS SYSTEM
// ============================================================================

// =====================================================================