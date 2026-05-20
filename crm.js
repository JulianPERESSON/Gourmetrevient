// ============================================================================
// GOURMET REVIENT — MINI CRM V2 (Luxe)
// Gestion des Clients & Commandes Pâtissières (Supabase Sync Cloud-First)
// ============================================================================

const CRM_STORAGE_KEY = 'gourmet_crm_data';

if (!APP.crm) {
  APP.crm = { clients: [], orders: [] };
}

async function loadCrm() {
  try {
    const saved = localStorage.getItem(CRM_STORAGE_KEY);
    if (saved) APP.crm = JSON.parse(saved);
  } catch (e) {
    console.error('Error loading CRM data', e);
  }

  // S'assurer que les tableaux existent
  if (!APP.crm.clients) APP.crm.clients = [];
  if (!APP.crm.orders) APP.crm.orders = [];

  // Demo Data — ensure all 5 demo contacts exist and stay up-to-date
  const demoClients = [
    { id: 'c1', name: 'Hôtel de la Cité', contact: '06 12 34 56 78', notes: 'Livraison par l\'arrière' },
    { id: 'c2', name: 'Mme Dupont (Mariage)', contact: 'lucie@email.com', notes: 'Allergie fruits à coque' },
    { id: 'c4', name: 'CMA Muret', contact: 'lpelletier@cm-toulouse.fr', notes: 'Un chef qui maîtrise le chocolat … et les baguettes du diabolo 🪀🍫' },
    { id: 'c5', name: 'Mr Bouvier-Gaz', contact: '', notes: 'Un chef qui soigne plus son image que ses productions ✌️😎' },
    { id: 'c3', name: 'Restaurant Le Gourmet', contact: 'facturation@gourmet.fr', notes: 'Facturation fin de mois' }
  ];

  let clientsChanged = false;
  demoClients.forEach(dc => {
    const existing = APP.crm.clients.find(c => c.id === dc.id);
    if (!existing) {
      APP.crm.clients.push(dc);
      clientsChanged = true;
    } else if (existing.name !== dc.name || existing.contact !== dc.contact || existing.notes !== dc.notes) {
      existing.name = dc.name;
      existing.contact = dc.contact;
      existing.notes = dc.notes;
      clientsChanged = true;
    }
  });

  if (!APP.crm.orders || APP.crm.orders.length === 0) {
    const now = new Date();
    const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    APP.crm.orders = [
      { id: 'o1', clientId: 'c1', products: '10x Tartes Citron, 15x Éclairs', date: tmrw.toISOString().slice(0,16), price: '120.00', status: 'pending' },
      { id: 'o2', clientId: 'c2', products: 'Pièce Montée 50 pers.', date: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().slice(0,16), price: '450.00', status: 'paid' }
    ];
    clientsChanged = true;
  }

  if (clientsChanged) saveCrm();

  // Chargement bidirectionnel en ligne avec Supabase
  if (navigator.onLine && window.gourmetSupabase && typeof GourmetSync !== 'undefined') {
    try {
      const { data: { session } } = await gourmetSupabase.auth.getSession();
      if (session?.user?.id) {
        const cloudClients = await GourmetSync.chargerClients();
        const cloudOrders = await GourmetSync.chargerCommandes();

        if (cloudClients !== null) {
          APP.crm.clients = cloudClients;
          // Réinjecter les démos locaux s'ils manquent dans le cloud
          demoClients.forEach(dc => {
            if (!APP.crm.clients.some(c => c.id === dc.id)) {
              APP.crm.clients.push(dc);
            }
          });
        }

        if (cloudOrders !== null) {
          APP.crm.orders = cloudOrders;
          // Réinjecter les démos locaux s'ils manquent dans le cloud
          const now = new Date();
          const tmrw = new Date(now.getTime() + 24 * 60 * 60 * 1000);
          const demoOrders = [
            { id: 'o1', clientId: 'c1', products: '10x Tartes Citron, 15x Éclairs', date: tmrw.toISOString().slice(0,16), price: '120.00', status: 'pending' },
            { id: 'o2', clientId: 'c2', products: 'Pièce Montée 50 pers.', date: new Date(now.getTime() + 48 * 60 * 60 * 1000).toISOString().slice(0,16), price: '450.00', status: 'paid' }
          ];
          demoOrders.forEach(demoOrder => {
            if (!APP.crm.orders.some(o => o.id === demoOrder.id)) {
              APP.crm.orders.push(demoOrder);
            }
          });
          APP.crm.orders.sort((a,b) => new Date(a.date) - new Date(b.date));
        }

        saveCrm();
        updateCrmKpis();
      }
    } catch (err) {
      console.warn('[GourmetSync] Erreur lors du chargement CRM en ligne, utilisation du cache local:', err);
    }
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
  loadCrm().then(() => {
    switchCrmTab('orders');
  });
}

function updateCrmKpis() {
  const pendingOrders = APP.crm.orders.filter(o => o.status !== 'delivered');
  let pendingCA = 0;
  pendingOrders.forEach(o => {
    pendingCA += parseFloat(o.price) || 0;
  });

  const elCA = document.getElementById('kpiCrmRevenue');
  const elPen = document.getElementById('kpiCrmPending');
  const elCli = document.getElementById('kpiCrmClients');

  if (elCA) elCA.textContent = pendingCA.toFixed(2) + ' €';
  if (elPen) elPen.textContent = pendingOrders.length;
  if (elCli) elCli.textContent = APP.crm.clients.length;
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

  const newClient = { id: GourmetSync.uuid(), name, contact, notes };
  APP.crm.clients.push(newClient);
  saveCrm();
  closeModal('modalAddClient');
  renderCrmClients();

  // Envoyer au cloud
  if (typeof GourmetSync !== 'undefined') {
    GourmetSync.sauvegarderClient(newClient);
  }

  if (typeof showToast === 'function') showToast('Client VIP ajouté', 'success');
}

function renderCrmClients() {
  updateCrmKpis();
  const container = document.getElementById('crmClientsBody');
  if (!container) return;

  if (APP.crm.clients.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:2rem; width:100%; color:var(--text-muted);">Aucun client enregistré.</p>';
    return;
  }

  container.innerHTML = APP.crm.clients.map(c => `
    <div class="vip-client-card">
      <div class="vip-avatar">${c.name.charAt(0).toUpperCase()}</div>
      <div class="vip-name">${escapeHtml(c.name)}</div>
      <div class="vip-contact">📞 ${escapeHtml(c.contact || '-')}</div>
      ${c.notes ? `<div class="vip-notes">⚠️ ${escapeHtml(c.notes)}</div>` : ''}
      <button class="btn btn-outline btn-sm" onclick="deleteCrmClient('${c.id}')" style="color:var(--danger); border-color:var(--danger); margin-top:1.5rem; width:100%;">Supprimer ce client</button>
    </div>
  `).join('');
}

function deleteCrmClient(id) {
  if (confirm("Voulez-vous supprimer ce client ?")) {
    APP.crm.clients = APP.crm.clients.filter(c => c.id !== id);
    saveCrm();
    renderCrmClients();

    // Supprimer du cloud
    if (typeof GourmetSync !== 'undefined') {
      GourmetSync.supprimerClient(id);
    }

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
    if (typeof showToast === 'function') showToast('Informations incomplètes.', 'error');
    return;
  }

  const newOrder = { id: GourmetSync.uuid(), clientId, products, date, price, status };
  APP.crm.orders.push(newOrder);
  APP.crm.orders.sort((a,b) => new Date(a.date) - new Date(b.date));
  saveCrm();
  closeModal('modalAddOrder');
  renderCrmOrders();

  // Envoyer au cloud
  if (typeof GourmetSync !== 'undefined') {
    GourmetSync.sauvegarderCommande(newOrder);
  }

  if (typeof showToast === 'function') showToast('Commande planifiée', 'success');
}

function renderCrmOrders() {
  updateCrmKpis();
  const container = document.getElementById('crmOrdersBody');
  if (!container) return;

  if (APP.crm.orders.length === 0) {
    container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">Aucune commande en cours.</p>';
    return;
  }

  container.innerHTML = APP.crm.orders.map(o => `
    <div class="order-card" data-status="${o.status}">
      <div class="order-header">
        <div>
          <div class="order-client">${escapeHtml(getClientName(o.clientId))}</div>
          <div class="order-id">CMD #${o.id.startsWith('cmd_') ? o.id.substring(4, 9) : o.id.substring(0, 5)}</div>
        </div>
        <button class="btn btn-sm btn-outline btn-round" style="border-color:var(--danger); color:var(--danger);" onclick="deleteCrmOrder('${o.id}')" title="Supprimer">🗑️</button>
      </div>
      <div class="order-date">🗓️ ${new Date(o.date).toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}</div>
      <div class="order-products">${escapeHtml(o.products)}</div>
      <div class="order-footer">
        <div class="order-price">${parseFloat(o.price || 0).toFixed(2)} €</div>
        <select onchange="updateOrderStatus('${o.id}', this.value)" class="form-input" style="padding:0.4rem; height:auto; width:auto; border:1px solid var(--accent)!important;">
          <option value="pending" ${o.status==='pending'?'selected':''}>⏳ En prod / Attente</option>
          <option value="paid" ${o.status==='paid'?'selected':''}>✅ Payée / Prête</option>
          <option value="delivered" ${o.status==='delivered'?'selected':''}>📦 Livrée</option>
        </select>
      </div>
    </div>
  `).join('');
}

function updateOrderStatus(id, newStatus) {
  const o = APP.crm.orders.find(x => x.id === id);
  if (o) {
    o.status = newStatus;
    saveCrm();
    renderCrmOrders();

    // Mettre à jour dans le cloud
    if (typeof GourmetSync !== 'undefined') {
      GourmetSync.sauvegarderCommande(o);
    }

    if (typeof showToast === 'function') showToast('Mise à jour du statut', 'info');
  }
}

function deleteCrmOrder(id) {
  if (confirm("Supprimer définitivement cette commande ?")) {
    APP.crm.orders = APP.crm.orders.filter(o => o.id !== id);
    saveCrm();
    renderCrmOrders();

    // Supprimer du cloud
    if (typeof GourmetSync !== 'undefined') {
      GourmetSync.supprimerCommande(id);
    }

    if (typeof showToast === 'function') showToast('Commande supprimée', 'info');
  }
}

// Initial Call to load data quietly in background
setTimeout(loadCrm, 1000);
