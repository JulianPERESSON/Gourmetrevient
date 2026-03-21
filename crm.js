// ============================================================================
// GOURMET REVIENT — MINI CRM V1
// Gestion des Clients & Commandes Pâtissières
// ============================================================================

const CRM_STORAGE_KEY = 'gourmet_crm_data';

if (!APP.crm) {
  APP.crm = { clients: [], orders: [] };
}

function loadCrm() {
  try {
    const saved = localStorage.getItem(CRM_STORAGE_KEY);
    if (saved) {
      APP.crm = JSON.parse(saved);
    }
  } catch (e) {
    console.error('Error loading CRM data', e);
  }

  // Inject Demo Data if completely empty
  if (!APP.crm.clients || APP.crm.clients.length === 0) {
    APP.crm.clients = [
      { id: 'c1', name: 'Hôtel de la Cité', contact: '06 12 34 56 78', notes: 'Livraison avant 9h' },
      { id: 'c2', name: 'Mme Dupont (Mariage)', contact: 'lucie.d@email.com', notes: 'Allergie aux fruits à coque' },
      { id: 'c3', name: 'Restaurant Le Gourmet', contact: '05 61 00 00 00', notes: 'Facturation fin de mois' }
    ];
    saveCrm();
  }

  if (!APP.crm.orders || APP.crm.orders.length === 0) {
    const now = new Date();
    const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    APP.crm.orders = [
      { id: 'o1', clientId: 'c1', products: '10x Tartes Citron, 15x Éclairs', date: tmrw.toISOString().slice(0,16), price: '120', status: 'pending' },
      { id: 'o2', clientId: 'c2', products: 'Pièce Montée 50 pers.', date: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().slice(0,16), price: '450', status: 'paid' }
    ];
    saveCrm();
  }
}

function saveCrm() {
  localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(APP.crm));
}

function switchCrmTab(tab) {
  document.getElementById('crmViewOrders').style.display = 'none';
  document.getElementById('crmViewClients').style.display = 'none';
  document.getElementById('dotCrmOrders').classList.remove('active');
  document.getElementById('dotCrmClients').classList.remove('active');

  if (tab === 'orders') {
    document.getElementById('crmViewOrders').style.display = 'block';
    document.getElementById('dotCrmOrders').classList.add('active');
    renderCrmOrders();
  } else {
    document.getElementById('crmViewClients').style.display = 'block';
    document.getElementById('dotCrmClients').classList.add('active');
    renderCrmClients();
  }
}

function renderCRM() {
  loadCrm();
  switchCrmTab('orders');
}

// --- CLIENTS ---

function showAddClientModal() {
  document.getElementById('crmClientName').value = '';
  document.getElementById('crmClientContact').value = '';
  document.getElementById('crmClientNotes').value = '';
  document.getElementById('modalAddClient').style.display = 'flex';
}

function saveCrmClient() {
  const name = document.getElementById('crmClientName').value.trim();
  const contact = document.getElementById('crmClientContact').value.trim();
  const notes = document.getElementById('crmClientNotes').value.trim();

  if (!name) {
    if (typeof showToast === 'function') showToast('Le nom du client est requis.', 'error');
    return;
  }

  const newClient = {
    id: 'client_' + Date.now(),
    name,
    contact,
    notes
  };

  APP.crm.clients.push(newClient);
  saveCrm();
  closeModal('modalAddClient');
  renderCrmClients();
  if (typeof showToast === 'function') showToast('Client enregistré', 'success');
}

function renderCrmClients() {
  const container = document.getElementById('crmClientsBody');
  if (!container) return;

  if (APP.crm.clients.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:2rem; width:100%; color:var(--text-muted);">Aucun client enregistré.</p>';
    return;
  }

  container.innerHTML = APP.crm.clients.map(c => {
    return `
      <div class="supplier-card" style="border-top: 4px solid var(--accent);">
        <div class="supplier-card-header">
          <div class="supplier-avatar" style="background: var(--accent); color:var(--bg);">${c.name.charAt(0).toUpperCase()}</div>
          <div class="supplier-info-main">
            <h4 class="supplier-name">${escapeHtml(c.name)}</h4>
          </div>
        </div>
        <div class="supplier-card-body">
          <div class="supplier-contact-row"><i>📞</i> ${escapeHtml(c.contact || '-')}</div>
          <div class="supplier-contact-row"><i>📝</i> ${escapeHtml(c.notes || '-')}</div>
        </div>
        <div class="supplier-card-footer">
          <button class="btn btn-outline btn-sm" onclick="deleteCrmClient('${c.id}')" style="color:var(--danger); border-color:var(--danger); margin-left:auto;">Supprimer</button>
        </div>
      </div>
    `;
  }).join('');
}

function deleteCrmClient(id) {
  if (confirm("Voulez-vous vraiment supprimer ce client ?")) {
    APP.crm.clients = APP.crm.clients.filter(c => c.id !== id);
    saveCrm();
    renderCrmClients();
    if (typeof showToast === 'function') showToast('Client supprimé', 'info');
  }
}

// --- COMMANDES ---

function getClientName(id) {
  const c = APP.crm.clients.find(x => x.id === id);
  return c ? c.name : 'Inconnu';
}

function showAddOrderModal() {
  const sel = document.getElementById('crmOrderClient');
  sel.innerHTML = '<option value="">Sélectionnez un client...</option>' + 
    APP.crm.clients.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');

  document.getElementById('crmOrderProducts').value = '';
  document.getElementById('crmOrderDate').value = '';
  document.getElementById('crmOrderPrice').value = '';
  document.getElementById('crmOrderStatus').value = 'pending';

  document.getElementById('modalAddOrder').style.display = 'flex';
}

function saveCrmOrder() {
  const clientId = document.getElementById('crmOrderClient').value;
  const products = document.getElementById('crmOrderProducts').value.trim();
  const date = document.getElementById('crmOrderDate').value;
  const price = document.getElementById('crmOrderPrice').value;
  const status = document.getElementById('crmOrderStatus').value;

  if (!clientId || !products || !date) {
    if (typeof showToast === 'function') showToast('Veuillez remplir les informations principales.', 'error');
    return;
  }

  const newOrder = {
    id: 'cmd_' + Date.now(),
    clientId,
    products,
    date,
    price,
    status
  };

  APP.crm.orders.push(newOrder);
  // Trier par date la plus proche
  APP.crm.orders.sort((a,b) => new Date(a.date) - new Date(b.date));
  saveCrm();
  closeModal('modalAddOrder');
  renderCrmOrders();
  if (typeof showToast === 'function') showToast('Commande enregistrée', 'success');
}

function renderCrmOrders() {
  const container = document.getElementById('crmOrdersBody');
  if (!container) return;

  if (APP.crm.orders.length === 0) {
    container.innerHTML = '<tr><td colspan="6" style="text-align:center; padding:2rem; color:var(--text-muted);">Aucune commande enregistrée.</td></tr>';
    return;
  }

  container.innerHTML = APP.crm.orders.map(o => {
    let badgeClass = 'status-warn';
    let badgeText = '⏳ En attente';
    if (o.status === 'paid') { badgeClass = 'status-ok'; badgeText = '✅ Payée'; }
    if (o.status === 'delivered') { badgeClass = 'status-critical'; badgeText = '📦 Livrée'; } // Utilise l'acier

    let selectStatus = `
      <select onchange="updateOrderStatus('${o.id}', this.value)" class="form-input" style="padding:0.2rem; height:auto; width:auto; display:inline-block; font-size:0.8rem;">
        <option value="pending" ${o.status==='pending'?'selected':''}>Attente</option>
        <option value="paid" ${o.status==='paid'?'selected':''}>Payée</option>
        <option value="delivered" ${o.status==='delivered'?'selected':''}>Livrée</option>
      </select>
    `;

    return `
      <tr>
        <td style="font-family:monospace; font-size:0.8rem;">#${o.id.substring(4, 9)}</td>
        <td style="font-weight:bold;">${escapeHtml(getClientName(o.clientId))}</td>
        <td style="max-width:200px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${escapeHtml(o.products)}">${escapeHtml(o.products)}</td>
        <td style="font-weight:bold; color:var(--primary);">${new Date(o.date).toLocaleString([], {dateStyle:'short', timeStyle:'short'})}</td>
        <td><span class="badge ${badgeClass}">${badgeText}</span> ${selectStatus}</td>
        <td>
          <button class="btn btn-sm btn-outline btn-round" onclick="deleteCrmOrder('${o.id}')" title="Supprimer">🗑️</button>
        </td>
      </tr>
    `;
  }).join('');
}

function updateOrderStatus(id, newStatus) {
  const o = APP.crm.orders.find(x => x.id === id);
  if (o) {
    o.status = newStatus;
    saveCrm();
    renderCrmOrders();
    if (typeof showToast === 'function') showToast('Statut mis à jour', 'info');
  }
}

function deleteCrmOrder(id) {
  if (confirm("Voulez-vous vraiment supprimer cette commande ?")) {
    APP.crm.orders = APP.crm.orders.filter(o => o.id !== id);
    saveCrm();
    renderCrmOrders();
    if (typeof showToast === 'function') showToast('Commande supprimée', 'info');
  }
}

// Initial Call to load data quietly in background
setTimeout(loadCrm, 1000);
