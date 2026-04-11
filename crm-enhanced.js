// ============================================================================
// CRM-ENHANCED.JS — GourmetRevient v8.0
// Nouvelles fonctionnalités CRM & Autres améliorations
//
//  1. 📄 Générateur de Devis / Factures PDF
//  2. 👑 Lifetime Value (LTV) & Clients VIP
//  3. 🏢 Comparateur inter-Fournisseurs automatique
//  4. 🗓️ Prévisions IA Saisonnières (Calendrier)
//  5. 🔬 Traçabilité des Lots HACCP (Ascendante/Descendante)
//  6. 🔔 Alertes Push HACCP (Service Worker + Cockpit)
//  7. 📊 Jauge Seuil de Rentabilité Mensuelle (Live)
//  8. 📈 Simulateur d'Inflation Multi-Périodes
// ============================================================================

'use strict';

// ── Variables partagées (déclarées en tête pour éviter la TDZ en strict mode) ──
let _invoiceLines       = [];
let _invoiceType        = 'devis';
let _inflCompChartInstance = null;

// ============================================================================
// 1. 📄 GÉNÉRATEUR DE DEVIS / FACTURES PDF
// ============================================================================

window.openInvoiceGenerator = function(orderId = null) {
    // Pre-load the CRM data
    if (typeof loadCrm === 'function') loadCrm();

    let modal = document.getElementById('invoiceGeneratorModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'invoiceGeneratorModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const clients = (window.APP && window.APP.crm && window.APP.crm.clients) || [];
    const orders  = (window.APP && window.APP.crm && window.APP.crm.orders)  || [];
    const shopName = localStorage.getItem('gourmet_current_user') || 'Mon Atelier';

    // Pre-select order if ID provided
    const selectedOrder = orderId ? orders.find(o => o.id === orderId) : null;

    modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:780px; width:95%; max-height:92vh; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h3 style="margin:0; font-size:1.3rem;">📄 Générateur de Devis / Facture</h3>
        <button class="btn-icon" onclick="document.getElementById('invoiceGeneratorModal').style.display='none';">✕</button>
      </div>

      <!-- Type Toggle -->
      <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem; background:var(--bg-alt); padding:6px; border-radius:14px;">
        <button id="invTypeBtnDevis" onclick="setInvoiceType('devis')" style="flex:1; padding:10px; border-radius:10px; border:none; cursor:pointer; background:var(--accent); color:#fff; font-weight:700; transition:all 0.2s;">📋 Devis</button>
        <button id="invTypeBtnFacture" onclick="setInvoiceType('facture')" style="flex:1; padding:10px; border-radius:10px; border:none; cursor:pointer; background:transparent; color:var(--text-secondary); font-weight:600; transition:all 0.2s;">🧾 Facture</button>
      </div>
      <input type="hidden" id="invDocType" value="devis">

      <!-- Form Grid -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
        <div class="form-group">
          <label class="form-label">Client *</label>
          <select id="invClientSel" class="form-input" onchange="prefillInvoiceFromClient()">
            <option value="">— Sélectionner un client —</option>
            ${clients.map(c => `<option value="${c.id}" ${selectedOrder && selectedOrder.clientId === c.id ? 'selected' : ''}>${_escHtml(c.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">Commande liée (optionnel)</label>
          <select id="invOrderSel" class="form-input" onchange="prefillInvoiceFromOrder()">
            <option value="">— Aucune —</option>
            ${orders.map(o => {
                const client = clients.find(c => c.id === o.clientId);
                return `<option value="${o.id}" ${selectedOrder && selectedOrder.id === o.id ? 'selected' : ''}>${client ? _escHtml(client.name) : 'Client inconnu'} — ${_escHtml(o.products || '').substring(0, 30)}</option>`;
            }).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">N° Document</label>
          <input type="text" id="invNumber" class="form-input" value="${_generateDocNumber()}">
        </div>
        <div class="form-group">
          <label class="form-label">Date du document</label>
          <input type="date" id="invDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
        </div>
        <div class="form-group">
          <label class="form-label">Validité / Échéance (jours)</label>
          <input type="number" id="invValidity" class="form-input" value="30" min="1">
        </div>
        <div class="form-group">
          <label class="form-label">Coordonnées de votre boutique</label>
          <input type="text" id="invShopAddress" class="form-input" placeholder="12 rue du Four, 75001 Paris" value="${localStorage.getItem('gourmet_shop_address') || ''}">
        </div>
      </div>

      <!-- Line Items -->
      <div style="margin-bottom:1rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.7rem;">
          <label class="form-label" style="margin:0;">Lignes de prestation</label>
          <button class="btn btn-sm btn-outline" onclick="addInvoiceLine()">✚ Ajouter</button>
        </div>
        <div id="invLinesContainer">
          <div style="display:grid; grid-template-columns:3fr 1fr 1fr 1fr 36px; gap:6px; font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); padding:0 4px; margin-bottom:4px;">
            <span>Description</span><span>Qté</span><span>Prix U. (€)</span><span>Total</span><span></span>
          </div>
          <!-- Lines inserted by JS -->
        </div>
        <div style="text-align:right; margin-top:0.8rem; padding:0.8rem; background:var(--bg-alt); border-radius:10px;">
          <div style="display:flex; justify-content:flex-end; gap:2rem; font-size:0.9rem;">
            <span>Sous-total HT :</span><strong id="invSubtotal">0,00 €</strong>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:2rem; font-size:0.9rem; margin-top:4px;">
            <span>TVA (10%) :</span><strong id="invTVA">0,00 €</strong>
          </div>
          <div style="display:flex; justify-content:flex-end; gap:2rem; font-size:1.1rem; font-weight:900; color:var(--accent); margin-top:8px; border-top:2px solid var(--surface-border); padding-top:8px;">
            <span>Total TTC :</span><strong id="invTotal">0,00 €</strong>
          </div>
        </div>
      </div>

      <!-- Notes + Signature block for devis -->
      <div class="form-group" style="margin-bottom:1.5rem;">
        <label class="form-label">Conditions / Mentions légales</label>
        <textarea id="invNotes" class="form-input" rows="3" style="resize:vertical;">${_getDefaultInvoiceNotes()}</textarea>
      </div>

      <div style="display:flex; gap:0.8rem; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="generateInvoicePDF()">📥 Générer le PDF</button>
        <button class="btn btn-outline" onclick="previewInvoice()">👁️ Aperçu HTML</button>
        <button class="btn btn-outline" onclick="document.getElementById('invoiceGeneratorModal').style.display='none';">Annuler</button>
      </div>
    </div>`;

    // Init with one line
    _invoiceLines = [];
    if (selectedOrder) {
        _initInvoiceFromOrder(selectedOrder);
    } else {
        addInvoiceLine();
    }

    modal.style.display = 'flex';
    // Save address on blur
    setTimeout(() => {
        const addrInput = document.getElementById('invShopAddress');
        if (addrInput) addrInput.addEventListener('blur', () => {
            localStorage.setItem('gourmet_shop_address', addrInput.value);
        });
    }, 100);
};

// (variables déclarées en haut du fichier)

window.setInvoiceType = function(type) {
    _invoiceType = type;
    document.getElementById('invDocType').value = type;
    const btnDevis = document.getElementById('invTypeBtnDevis');
    const btnFact  = document.getElementById('invTypeBtnFacture');
    if (btnDevis && btnFact) {
        if (type === 'devis') {
            btnDevis.style.background = 'var(--accent)'; btnDevis.style.color = '#fff';
            btnFact.style.background = 'transparent'; btnFact.style.color = 'var(--text-secondary)';
        } else {
            btnFact.style.background = 'var(--accent)'; btnFact.style.color = '#fff';
            btnDevis.style.background = 'transparent'; btnDevis.style.color = 'var(--text-secondary)';
        }
    }
};

function _generateDocNumber() {
    const d = new Date();
    const seq = (parseInt(localStorage.getItem('gourmet_doc_seq') || '0') + 1);
    localStorage.setItem('gourmet_doc_seq', String(seq));
    return `GR-${d.getFullYear()}-${String(seq).padStart(4, '0')}`;
}

function _getDefaultInvoiceNotes() {
    return `Paiement à réception de facture. En cas de retard de paiement, des pénalités de retard de 3x le taux légal seront appliquées. TVA non applicable, article 293B du CGI (si applicable).`;
}

function _initInvoiceFromOrder(order) {
    _invoiceLines = [];
    if (order && order.products) {
        const prods = order.products.split(',').map(p => p.trim()).filter(Boolean);
        prods.forEach(p => {
            // Try to parse qty from "10x Tartes"
            const qMatch = p.match(/^(\d+)[xX×]\s*/);
            const qty = qMatch ? parseInt(qMatch[1]) : 1;
            const desc = qMatch ? p.replace(qMatch[0], '').trim() : p;
            const unitPrice = order.price && prods.length === 1 ? parseFloat(order.price) : 0;
            _appendInvoiceLine({ desc, qty, unitPrice });
        });
    }
    if (_invoiceLines.length === 0) addInvoiceLine();
    _updateInvoiceTotals();
}

window.prefillInvoiceFromOrder = function() {
    const orderId = document.getElementById('invOrderSel').value;
    if (!orderId) return;
    const orders = (window.APP && window.APP.crm && window.APP.crm.orders) || [];
    const order = orders.find(o => o.id === orderId);
    if (order) {
        // Set client
        document.getElementById('invClientSel').value = order.clientId;
        _initInvoiceFromOrder(order);
    }
};

window.prefillInvoiceFromClient = function() { /* keep focus on client */ };

function _appendInvoiceLine(data = {}) {
    const id = Date.now() + Math.random();
    _invoiceLines.push({ id, desc: data.desc || '', qty: data.qty || 1, unitPrice: data.unitPrice || 0 });
    _renderInvoiceLines();
}

window.addInvoiceLine = function() {
    _appendInvoiceLine();
};

window.removeInvoiceLine = function(id) {
    _invoiceLines = _invoiceLines.filter(l => l.id !== id);
    _renderInvoiceLines();
};

window.updateInvoiceLine = function(id, field, value) {
    const line = _invoiceLines.find(l => l.id === id);
    if (line) {
        line[field] = field === 'qty' || field === 'unitPrice' ? parseFloat(value) || 0 : value;
        _updateInvoiceTotals();
    }
};

function _renderInvoiceLines() {
    const container = document.getElementById('invLinesContainer');
    if (!container) return;
    // Keep the header
    const header = container.querySelector('div:first-child');
    container.innerHTML = '';
    if (header) container.appendChild(header);
    else {
        container.innerHTML = `<div style="display:grid; grid-template-columns:3fr 1fr 1fr 1fr 36px; gap:6px; font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); padding:0 4px; margin-bottom:4px;"><span>Description</span><span>Qté</span><span>Prix U. (€)</span><span>Total</span><span></span></div>`;
    }
    _invoiceLines.forEach(line => {
        const div = document.createElement('div');
        div.style.cssText = 'display:grid; grid-template-columns:3fr 1fr 1fr 1fr 36px; gap:6px; margin-bottom:6px; align-items:center;';
        div.innerHTML = `
          <input type="text" class="form-input" value="${_escHtml(line.desc)}" placeholder="Description du produit/service" oninput="updateInvoiceLine(${line.id}, 'desc', this.value)" style="font-size:0.85rem; padding:8px 10px;">
          <input type="number" class="form-input" value="${line.qty}" min="0.5" step="0.5" oninput="updateInvoiceLine(${line.id}, 'qty', this.value)" style="font-size:0.85rem; padding:8px 10px; text-align:center;">
          <input type="number" class="form-input" value="${line.unitPrice}" min="0" step="0.01" oninput="updateInvoiceLine(${line.id}, 'unitPrice', this.value)" style="font-size:0.85rem; padding:8px 10px; text-align:right;">
          <span style="font-size:0.9rem; font-weight:700; text-align:right; color:var(--text-primary);">${(line.qty * line.unitPrice).toFixed(2)} €</span>
          <button onclick="removeInvoiceLine(${line.id})" style="background:none; border:none; cursor:pointer; color:var(--danger); font-size:1.1rem; padding:4px;">🗑️</button>`;
        container.appendChild(div);
    });
    _updateInvoiceTotals();
}

function _updateInvoiceTotals() {
    const subtotal = _invoiceLines.reduce((s, l) => s + (l.qty * l.unitPrice), 0);
    const tva = subtotal * 0.10;
    const total = subtotal + tva;
    const fmt = v => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
    const el = id => document.getElementById(id);
    if (el('invSubtotal')) el('invSubtotal').textContent = fmt(subtotal);
    if (el('invTVA'))      el('invTVA').textContent      = fmt(tva);
    if (el('invTotal'))    el('invTotal').textContent   = fmt(total);
}

function _buildInvoiceHTML(docType) {
    const clients = (window.APP && window.APP.crm && window.APP.crm.clients) || [];
    const clientId = document.getElementById('invClientSel').value;
    const client   = clients.find(c => c.id === clientId);
    const docNum   = document.getElementById('invNumber').value;
    const docDate  = document.getElementById('invDate').value;
    const validity = document.getElementById('invValidity').value;
    const notes    = document.getElementById('invNotes').value;
    const shopName = localStorage.getItem('gourmet_current_user') || 'Mon Atelier';
    const shopAddr = document.getElementById('invShopAddress').value;
    const isDevis  = docType === 'devis';
    const subtotal = _invoiceLines.reduce((s, l) => s + (l.qty * l.unitPrice), 0);
    const tva = subtotal * 0.10;
    const total = subtotal + tva;
    const fmt = v => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';

    const expiryDate = new Date(docDate);
    expiryDate.setDate(expiryDate.getDate() + parseInt(validity || 30));

    return `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${isDevis ? 'Devis' : 'Facture'} ${docNum}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700;900&display=swap" rel="stylesheet">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: 'Inter', sans-serif; background: #fff; color: #1a1a2e; font-size: 14px; line-height: 1.6; }
.doc-wrap { max-width: 860px; margin: 0 auto; padding: 40px; }
.doc-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 24px; border-bottom: 3px solid #C5A55A; }
.shop-name { font-size: 2rem; font-weight: 900; color: #1a1a2e; letter-spacing: -0.02em; }
.shop-sub  { color: #888; font-size: 0.85rem; margin-top: 4px; }
.doc-badge { text-align: right; }
.doc-type  { font-size: 2rem; font-weight: 900; color: #C5A55A; text-transform: uppercase; letter-spacing: 0.05em; }
.doc-num   { font-size: 0.8rem; color: #888; margin-top: 4px; }
.doc-meta  { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 36px; }
.meta-block h4 { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #C5A55A; margin-bottom: 8px; font-weight: 700; }
.meta-block p  { font-size: 0.9rem; color: #333; line-height: 1.7; }
table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
thead tr { background: #1a1a2e; color: #fff; }
thead th { padding: 12px 16px; text-align: left; font-size: 0.75rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
thead th:last-child, thead th:nth-child(n+2) { text-align: right; }
tbody tr:nth-child(even) { background: #f9f9f9; }
tbody td { padding: 12px 16px; border-bottom: 1px solid #eee; font-size: 0.9rem; }
tbody td:last-child, tbody td:nth-child(n+2) { text-align: right; }
.totals-block { margin-left: auto; width: 300px; }
.totals-row { display: flex; justify-content: space-between; padding: 6px 0; font-size: 0.9rem; border-bottom: 1px solid #eee; }
.totals-row.grand { font-weight: 900; font-size: 1.1rem; color: #C5A55A; border-top: 2px solid #C5A55A; padding-top: 10px; margin-top: 4px; }
.notes-block { margin-top: 32px; padding: 16px; background: #f5f5f5; border-radius: 8px; font-size: 0.8rem; color: #666; line-height: 1.7; }
.signature-block { margin-top: 40px; display: grid; grid-template-columns: 1fr 1fr; gap: 40px; }
.sign-box { border: 1px dashed #ccc; border-radius: 8px; padding: 24px; text-align: center; min-height: 120px; }
.sign-label { font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.08em; color: #888; margin-bottom: 8px; }
.sign-mention { font-size: 0.7rem; color: #aaa; margin-top: 12px; font-style: italic; }
.footer { margin-top: 40px; text-align: center; font-size: 0.75rem; color: #aaa; border-top: 1px solid #eee; padding-top: 16px; }
@media print { .doc-wrap { padding: 20px; } }
</style></head><body>
<div class="doc-wrap">
  <div class="doc-header">
    <div>
      <div class="shop-name">🧁 ${_escHtml(shopName)}</div>
      <div class="shop-sub">${_escHtml(shopAddr) || 'Artisan Pâtissier'}</div>
    </div>
    <div class="doc-badge">
      <div class="doc-type">${isDevis ? 'Devis' : 'Facture'}</div>
      <div class="doc-num">N° ${_escHtml(docNum)}</div>
    </div>
  </div>

  <div class="doc-meta">
    <div class="meta-block">
      <h4>Émis par</h4>
      <p><strong>${_escHtml(shopName)}</strong><br>${_escHtml(shopAddr).replace(/,/g, '<br>')}</p>
    </div>
    <div class="meta-block">
      <h4>Client</h4>
      <p><strong>${client ? _escHtml(client.name) : 'Non spécifié'}</strong><br>${client && client.contact ? _escHtml(client.contact) : ''}</p>
    </div>
    <div class="meta-block">
      <h4>Date du document</h4>
      <p>${new Date(docDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
    <div class="meta-block">
      <h4>${isDevis ? 'Validité jusqu\'au' : 'Date d\'échéance'}</h4>
      <p>${expiryDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
    </div>
  </div>

  <table>
    <thead><tr>
      <th style="width:50%">Description</th>
      <th>Quantité</th>
      <th>Prix unitaire HT</th>
      <th>Total HT</th>
    </tr></thead>
    <tbody>
      ${_invoiceLines.map(l => `<tr>
        <td>${_escHtml(l.desc) || '<em>—</em>'}</td>
        <td>${l.qty}</td>
        <td>${l.unitPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
        <td>${(l.qty * l.unitPrice).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <div class="totals-block">
    <div class="totals-row"><span>Sous-total HT</span><span>${fmt(subtotal)}</span></div>
    <div class="totals-row"><span>TVA (10%)</span><span>${fmt(tva)}</span></div>
    <div class="totals-row grand"><span>Total TTC</span><span>${fmt(total)}</span></div>
  </div>

  ${notes ? `<div class="notes-block"><strong>Conditions :</strong><br>${_escHtml(notes)}</div>` : ''}

  ${isDevis ? `
  <div class="signature-block">
    <div class="sign-box">
      <div class="sign-label">Signature du prestataire</div>
      <div class="sign-mention">("Bon pour accord")</div>
    </div>
    <div class="sign-box">
      <div class="sign-label">Signature du client</div>
      <div class="sign-mention">Lu et approuvé — ${_escHtml(client ? client.name : '')}</div>
    </div>
  </div>` : ''}

  <div class="footer">Document généré par GourmetRevient · ${new Date().toLocaleDateString('fr-FR')}</div>
</div>
</body></html>`;
}

window.previewInvoice = function() {
    const docType = document.getElementById('invDocType').value || 'devis';
    const html = _buildInvoiceHTML(docType);
    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
};

window.generateInvoicePDF = function() {
    const docType = document.getElementById('invDocType').value || 'devis';
    const html = _buildInvoiceHTML(docType);
    const docNum = document.getElementById('invNumber').value;
    if (typeof html2pdf !== 'undefined') {
        const elem = document.createElement('div');
        elem.innerHTML = html;
        document.body.appendChild(elem);
        html2pdf().set({ margin: 0, filename: `${docType}_${docNum}.pdf`, image: { type: 'jpeg', quality: 0.98 }, html2canvas: { scale: 2 }, jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' } }).from(elem).save().then(() => document.body.removeChild(elem));
    } else {
        // Fallback: open as printable window
        previewInvoice();
        if (typeof showToast === 'function') showToast('Utilisez Ctrl+P du navigateur pour imprimer/sauvegarder en PDF.', 'info');
    }
};

// ============================================================================
// 2. 👑 LIFETIME VALUE (LTV) & BADGE CLIENTS VIP
// ============================================================================

window.computeClientLTV = function(clientId) {
    const orders = (window.APP && window.APP.crm && window.APP.crm.orders) || [];
    return orders
        .filter(o => o.clientId === clientId)
        .reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);
};

window.getClientVIPBadge = function(ltv) {
    if (ltv >= 1000) return { label: '👑 VIP Or', color: '#C5A55A', bg: 'rgba(197,165,90,0.1)' };
    if (ltv >= 500)  return { label: '🥈 VIP Argent', color: '#9ca3af', bg: 'rgba(156,163,175,0.1)' };
    if (ltv >= 200)  return { label: '🥉 VIP Bronze', color: '#b45309', bg: 'rgba(180,83,9,0.1)' };
    return null;
};

// Patch renderCrmClients to add LTV
const _origRenderCrmClients = window.renderCrmClients;
window.renderCrmClients = function() {
    if (typeof updateCrmKpis === 'function') updateCrmKpis();
    const container = document.getElementById('crmClientsBody');
    if (!container) { if (typeof _origRenderCrmClients === 'function') _origRenderCrmClients(); return; }

    const clients = (window.APP && window.APP.crm && window.APP.crm.clients) || [];
    if (clients.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:2rem; width:100%; color:var(--text-muted);">Aucun client enregistré.</p>';
        return;
    }

    // Sort by LTV desc
    const sorted = [...clients].sort((a, b) => computeClientLTV(b.id) - computeClientLTV(a.id));

    container.innerHTML = sorted.map(c => {
        const ltv = computeClientLTV(c.id);
        const badge = getClientVIPBadge(ltv);
        const ordersCount = ((window.APP && window.APP.crm && window.APP.crm.orders) || []).filter(o => o.clientId === c.id).length;
        return `
    <div class="vip-client-card" style="position:relative;">
      ${badge ? `<div style="position:absolute; top:12px; right:12px; font-size:0.7rem; font-weight:700; color:${badge.color}; background:${badge.bg}; padding:3px 10px; border-radius:20px; border:1px solid ${badge.color}44;">${badge.label}</div>` : ''}
      <div class="vip-avatar">${c.name.charAt(0).toUpperCase()}</div>
      <div class="vip-name">${_escHtml(c.name)}</div>
      <div class="vip-contact">📞 ${_escHtml(c.contact || '-')}</div>
      ${c.notes ? `<div class="vip-notes">⚠️ ${_escHtml(c.notes)}</div>` : ''}
      <div style="display:flex; justify-content:space-between; margin-top:1rem; font-size:0.8rem; color:var(--text-muted); border-top:1px solid var(--surface-border); padding-top:0.8rem;">
        <span>📦 ${ordersCount} commande(s)</span>
        <span style="font-weight:700; color:${ltv > 0 ? 'var(--success)' : 'var(--text-muted)'};">CA : ${ltv.toFixed(2)} €</span>
      </div>
      <div style="display:flex; gap:6px; margin-top:0.8rem;">
        <button class="btn btn-outline btn-sm" onclick="openInvoiceGenerator(); setTimeout(() => { const s = document.getElementById('invClientSel'); if(s) s.value = '${c.id}'; }, 100);" style="flex:1;">📄 Devis/Facture</button>
        <button class="btn btn-outline btn-sm" onclick="deleteCrmClient('${c.id}')" style="color:var(--danger); border-color:var(--danger);">🗑️</button>
      </div>
    </div>`;
    }).join('');
};

// Patch renderCrmOrders to add invoice button per order
const _origRenderCrmOrders = window.renderCrmOrders;
window.renderCrmOrders = function() {
    if (typeof updateCrmKpis === 'function') updateCrmKpis();
    const container = document.getElementById('crmOrdersBody');
    if (!container) { if (typeof _origRenderCrmOrders === 'function') _origRenderCrmOrders(); return; }
    const clients = (window.APP && window.APP.crm && window.APP.crm.clients) || [];
    const orders  = (window.APP && window.APP.crm && window.APP.crm.orders)  || [];

    if (orders.length === 0) {
        container.innerHTML = '<p style="grid-column:1/-1; text-align:center; padding:2rem; color:var(--text-muted);">Aucune commande en cours.</p>';
        return;
    }

    container.innerHTML = orders.map(o => {
        const client = clients.find(x => x.id === o.clientId);
        return `
    <div class="order-card" data-status="${o.status}">
      <div class="order-header">
        <div>
          <div class="order-client">${_escHtml(client ? client.name : 'Client inconnu')}</div>
          <div class="order-id">CMD #${o.id.substring(4, 9)}</div>
        </div>
        <div style="display:flex; gap:4px;">
          <button class="btn btn-sm btn-outline btn-round" style="border-color:var(--accent); color:var(--accent);" onclick="openInvoiceGenerator('${o.id}')" title="Générer devis/facture">📄</button>
          <button class="btn btn-sm btn-outline btn-round" style="border-color:var(--danger); color:var(--danger);" onclick="deleteCrmOrder('${o.id}')" title="Supprimer">🗑️</button>
        </div>
      </div>
      <div class="order-date">🗓️ ${new Date(o.date).toLocaleString([], {dateStyle:'medium', timeStyle:'short'})}</div>
      <div class="order-products">${_escHtml(o.products)}</div>
      <div class="order-footer">
        <div class="order-price">${parseFloat(o.price || 0).toFixed(2)} €</div>
        <select onchange="updateOrderStatus('${o.id}', this.value)" class="form-input" style="padding:0.4rem; height:auto; width:auto; border:1px solid var(--accent)!important;">
          <option value="pending"   ${o.status === 'pending'    ? 'selected' : ''}>⏳ En prod / Attente</option>
          <option value="paid"      ${o.status === 'paid'       ? 'selected' : ''}>✅ Payée / Prête</option>
          <option value="delivered" ${o.status === 'delivered'  ? 'selected' : ''}>📦 Livrée</option>
        </select>
      </div>
    </div>`;
    }).join('');
};

// ============================================================================
// 3. 🏢 COMPARATEUR INTER-FOURNISSEURS AUTOMATIQUE
// ============================================================================

/**
 * Called whenever an ingredient row is built in the recipe editor.
 * Shows a badge if the same ingredient exists from another supplier at a lower price.
 * Hook: called by app.js buildIngredientRow (patched below).
 */
window.checkSupplierPriceAlert = function(ingredientName, currentPrice) {
    const db = (window.APP && window.APP.ingredientDb) || [];
    const name = ingredientName.toLowerCase().trim();

    // Find all entries that could match this ingredient
    const matches = db.filter(item => {
        if (!item || !item.name) return false;
        const n = item.name.toLowerCase();
        return n === name || n.includes(name.split(' ')[0]) || name.includes(n.split(' ')[0]);
    });

    if (matches.length < 2) return null;

    // Sort by price
    const sorted = [...matches].sort((a, b) => (a.pricePerUnit || 0) - (b.pricePerUnit || 0));
    const cheapest = sorted[0];
    const curPrice = parseFloat(currentPrice) || 0;

    if (cheapest.pricePerUnit < curPrice * 0.98) { // >2% cheaper
        const saving = ((curPrice - cheapest.pricePerUnit) / curPrice * 100).toFixed(0);
        return {
            name: cheapest.name,
            price: cheapest.pricePerUnit,
            supplier: cheapest.supplier || 'Fournisseur alternatif',
            saving: saving
        };
    }
    return null;
};

// Inject supplier comparison badge into ingredient rows
// This patches the inventory render to show a badge when a cheaper alternative exists
function _patchInventoryForSupplierCompare() {
    const origRenderInv = window.renderInventaire;
    if (!origRenderInv) return;
    window.renderInventaire = function(...args) {
        origRenderInv.apply(this, args);
        _injectSupplierBadges();
    };
}

function _injectSupplierBadges() {
    const db = (window.APP && window.APP.ingredientDb) || [];
    const rows = document.querySelectorAll('.inv-table tbody tr, .ingredient-row');
    rows.forEach(row => {
        // Avoid double-injection
        if (row.querySelector('.supplier-compare-badge')) return;
        const nameCell = row.querySelector('td:first-child, .ing-name');
        const priceCell = row.querySelector('td[data-price], .ing-price');
        if (!nameCell || !priceCell) return;
        const name = nameCell.textContent.trim();
        const price = parseFloat(priceCell.textContent) || 0;
        const alert = checkSupplierPriceAlert(name, price);
        if (alert) {
            const badge = document.createElement('span');
            badge.className = 'supplier-compare-badge';
            badge.title = `${alert.supplier}: ${alert.price.toFixed(2)}€ (-${alert.saving}%)`;
            badge.style.cssText = 'margin-left:6px; font-size:0.65rem; background:rgba(16,185,129,0.12); color:#10b981; padding:2px 7px; border-radius:10px; font-weight:700; cursor:help;';
            badge.textContent = `💡 -${alert.saving}% dispo`;
            nameCell.appendChild(badge);
        }
    });
}

// ============================================================================
// 4. 🗓️ PRÉVISIONS IA SAISONNIÈRES
// ============================================================================

const SEASONAL_EVENTS = [
    { name: 'Noël',             month: 12, day: 25, daysAhead: 30, ingredients: ['chocolat', 'beurre', 'farine', 'sucre', 'praliné'], emoji: '🎄' },
    { name: 'Pâques',          month: 4,  day: 6,  daysAhead: 21, ingredients: ['chocolat', 'beurre', 'œuf', 'praliné', 'noisette'], emoji: '🐣', dynamic: true },
    { name: 'Galette des Rois', month: 1,  day: 6,  daysAhead: 14, ingredients: ['farine', 'beurre', 'amande', 'frangipane', 'pithiviers'], emoji: '👑' },
    { name: 'Saint-Valentin',   month: 2,  day: 14, daysAhead: 14, ingredients: ['chocolat', 'framboise', 'fraise', 'rose'], emoji: '❤️' },
    { name: 'Fête des Mères',   month: 5,  day: 26, daysAhead: 14, ingredients: ['fraise', 'framboise', 'crème', 'vanille'], emoji: '💐', dynamic: true },
    { name: 'La Toussaint',     month: 11, day: 1,  daysAhead: 10, ingredients: ['caramel', 'pomme', 'cannelle'], emoji: '🍂' },
];

window.getSeasonalAIForecasts = function() {
    const now = new Date();
    const forecasts = [];

    SEASONAL_EVENTS.forEach(evt => {
        // Find next occurrence
        let evtDate = new Date(now.getFullYear(), evt.month - 1, evt.day);
        if (evtDate < now) evtDate = new Date(now.getFullYear() + 1, evt.month - 1, evt.day);

        const daysUntil = Math.floor((evtDate - now) / (1000 * 60 * 60 * 24));

        if (daysUntil >= 0 && daysUntil <= evt.daysAhead) {
            // Check stock levels
            const inv = (window.APP && window.APP.inventory) || JSON.parse(localStorage.getItem(`gourmet_inventory_${(localStorage.getItem('gourmet_current_user') || 'chef').toLowerCase()}`) || '[]');
            const criticalIngredients = evt.ingredients.filter(ingName => {
                const item = inv.find(i => i.name && i.name.toLowerCase().includes(ingName));
                if (!item) return false; // Not tracked — flag it anyway
                return (item.stock || 0) <= (item.alertThreshold || 5);
            });

            forecasts.push({
                event: evt.name,
                emoji: evt.emoji,
                daysUntil,
                date: evtDate.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' }),
                ingredients: evt.ingredients,
                criticalIngredients,
                urgency: daysUntil <= 7 ? 'high' : (daysUntil <= 14 ? 'medium' : 'low')
            });
        }
    });

    return forecasts.sort((a, b) => a.daysUntil - b.daysUntil);
};

// Inject seasonal forecast into AI Expert advice panel on dashboard
function _injectSeasonalForecastInDashboard() {
    const aiAdvice = document.getElementById('dashAIAdvice');
    if (!aiAdvice) return;

    const forecasts = getSeasonalAIForecasts();
    if (forecasts.length === 0) return;

    const top = forecasts[0];
    const urgencyColor = top.urgency === 'high' ? 'var(--danger)' : (top.urgency === 'medium' ? '#f59e0b' : 'var(--accent)');
    const criticalText = top.criticalIngredients.length > 0
        ? `Stock critique : <strong>${top.criticalIngredients.join(', ')}</strong>.`
        : `Vérifiez vos stocks de ${top.ingredients.slice(0, 3).join(', ')}.`;

    // Prepend seasonal bubble
    const existingBubble = aiAdvice.querySelector('.ai-bubble');
    const seasonalBubble = document.createElement('div');
    seasonalBubble.className = 'ai-bubble seasonal-forecast';
    seasonalBubble.style.cssText = `border-left: 3px solid ${urgencyColor}; margin-bottom: 8px;`;
    seasonalBubble.innerHTML = `
      <p>${top.emoji} <strong>${top.event}</strong> dans <strong>${top.daysUntil} jour(s)</strong> (${top.date}). ${criticalText}</p>
      <div class="ai-actions">
        <span class="ai-tip">💡 Commander à l'avance</span>
        <span class="ai-tip" onclick="showInventaire()" style="cursor:pointer;">📦 Voir stock</span>
      </div>`;
    if (existingBubble) aiAdvice.insertBefore(seasonalBubble, existingBubble);
    else aiAdvice.appendChild(seasonalBubble);
}

// ============================================================================
// 5. 🔬 TRAÇABILITÉ DES LOTS HACCP
// ============================================================================

const LOT_TRACE_KEY = 'gourmet_lot_traceability';

window.getLotTraceData = function() {
    return JSON.parse(localStorage.getItem(LOT_TRACE_KEY) || '[]');
};
window.saveLotTraceData = function(data) {
    localStorage.setItem(LOT_TRACE_KEY, JSON.stringify(data));
};

window.openLotTraceability = function() {
    let modal = document.getElementById('lotTraceabilityModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'lotTraceabilityModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const recipes = (window.APP && window.APP.savedRecipes) || [];
    const lots = getLotTraceData();

    modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:850px; width:95%; max-height:90vh; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h3 style="margin:0;">🔬 Traçabilité des Lots (HACCP)</h3>
        <button class="btn-icon" onclick="document.getElementById('lotTraceabilityModal').style.display='none';">✕</button>
      </div>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.5rem;">
        Enregistrez les numéros de lots de vos matières premières sensibles lors de chaque production. En cas de rappel produit, retrouvez instantanément quelles recettes et quels clients ont été impactés.
      </p>

      <!-- Add new lot record -->
      <div style="background:var(--bg-alt); border-radius:14px; padding:1.2rem; margin-bottom:1.5rem; border:1px solid var(--surface-border);">
        <h4 style="margin:0 0 1rem; font-size:0.95rem;">➕ Enregistrer un lot de production</h4>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:0.8rem; margin-bottom:0.8rem;">
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.75rem;">Date de production</label>
            <input type="date" id="lotProdDate" class="form-input" value="${new Date().toISOString().split('T')[0]}">
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.75rem;">Recette produite</label>
            <select id="lotRecipeSel" class="form-input">
              <option value="">— Sélectionner —</option>
              ${recipes.map(r => `<option value="${_escHtml(r.name)}">${_escHtml(r.name)}</option>`).join('')}
            </select>
          </div>
          <div class="form-group" style="margin:0;">
            <label class="form-label" style="font-size:0.75rem;">Quantité produite</label>
            <input type="number" id="lotQty" class="form-input" placeholder="ex: 24" min="1">
          </div>
        </div>
        <div id="lotIngredientsContainer">
          <label class="form-label" style="font-size:0.75rem; margin-bottom:0.5rem; display:block;">Numéros de lots des ingrédients sensibles</label>
          <div id="lotIngRows" style="display:flex; flex-direction:column; gap:6px;">
            ${_renderLotIngRow()}
          </div>
          <button class="btn btn-sm btn-outline" style="margin-top:6px;" onclick="_addLotIngRow()">✚ Ajouter un ingrédient</button>
        </div>
        <div class="form-group" style="margin-top:0.8rem;">
          <label class="form-label" style="font-size:0.75rem;">Client(s) destinataire(s) (optionnel)</label>
          <input type="text" id="lotClients" class="form-input" placeholder="ex: Hôtel de la Cité, Mme Dupont">
        </div>
        <button class="btn btn-primary" style="margin-top:0.8rem;" onclick="saveLotRecord()">💾 Enregistrer le lot</button>
      </div>

      <!-- Search / Recall alert -->
      <div style="background:rgba(239,68,68,0.04); border:1px solid rgba(239,68,68,0.2); border-radius:14px; padding:1.2rem; margin-bottom:1.5rem;">
        <h4 style="margin:0 0 0.8rem; color:var(--danger); font-size:0.95rem;">🚨 Simulation Rappel Produit</h4>
        <div style="display:flex; gap:0.6rem; align-items:center;">
          <input type="text" id="recallLotSearch" class="form-input" placeholder="Entrez un n° de lot suspect (ex: LOT-2024-FR-001)" style="flex:1;">
          <button class="btn btn-sm" style="background:var(--danger); color:#fff; border:none;" onclick="simulateProductRecall()">🔍 Tracer</button>
        </div>
        <div id="recallResults" style="margin-top:0.8rem;"></div>
      </div>

      <!-- Existing lot records -->
      <h4 style="margin:0 0 0.8rem; font-size:0.95rem;">📋 Historique des lots (${lots.length})</h4>
      <div id="lotHistoryList">
        ${lots.length === 0 ? '<p style="color:var(--text-muted); text-align:center; padding:1.5rem;">Aucun lot enregistré.</p>' :
            [...lots].reverse().slice(0, 20).map(lot => `
            <div style="display:flex; justify-content:space-between; align-items:flex-start; padding:0.8rem; background:var(--bg-alt); border-radius:10px; margin-bottom:6px; font-size:0.82rem; border:1px solid var(--surface-border);">
              <div>
                <div style="font-weight:700; margin-bottom:2px;">${_escHtml(lot.recipe)} — ${lot.qty || '?'} pcs</div>
                <div style="color:var(--text-muted);">📅 ${lot.date} ${lot.clients ? `· 👤 ${_escHtml(lot.clients)}` : ''}</div>
                <div style="margin-top:4px; display:flex; flex-wrap:wrap; gap:4px;">
                  ${(lot.ingredients || []).map(i => `<span style="background:var(--surface-border); padding:2px 8px; border-radius:6px;">${_escHtml(i.name)} — <strong>${_escHtml(i.lot)}</strong></span>`).join('')}
                </div>
              </div>
              <button onclick="deleteLotRecord('${lot.id}')" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:1rem; flex-shrink:0;">🗑️</button>
            </div>`).join('')}
      </div>
    </div>`;

    modal.style.display = 'flex';
};

window._renderLotIngRow = function(name = '', lot = '') {
    return `<div style="display:grid; grid-template-columns:1fr 1fr 30px; gap:6px; align-items:center;" class="lot-ing-row">
      <input type="text" class="form-input lot-ing-name" value="${_escHtml(name)}" placeholder="Ingrédient (ex: Beurre Lescure)" style="font-size:0.82rem; padding:7px 10px;">
      <input type="text" class="form-input lot-ing-lot"  value="${_escHtml(lot)}"  placeholder="N° de lot (ex: FR-123-456)" style="font-size:0.82rem; padding:7px 10px;">
      <button onclick="this.closest('.lot-ing-row').remove()" style="background:none; border:none; color:var(--danger); cursor:pointer; font-size:0.95rem;">✕</button>
    </div>`;
};

window._addLotIngRow = function() {
    const container = document.getElementById('lotIngRows');
    if (container) container.insertAdjacentHTML('beforeend', _renderLotIngRow());
};

window.saveLotRecord = function() {
    const date   = document.getElementById('lotProdDate').value;
    const recipe = document.getElementById('lotRecipeSel').value;
    const qty    = document.getElementById('lotQty').value;
    const clients = document.getElementById('lotClients').value.trim();

    if (!date || !recipe) {
        if (typeof showToast === 'function') showToast('Date et recette sont obligatoires.', 'error');
        return;
    }

    const ingRows  = document.querySelectorAll('.lot-ing-row');
    const ingredients = [];
    ingRows.forEach(row => {
        const name = row.querySelector('.lot-ing-name').value.trim();
        const lot  = row.querySelector('.lot-ing-lot').value.trim();
        if (name && lot) ingredients.push({ name, lot });
    });

    const lots = getLotTraceData();
    lots.push({ id: 'lot_' + Date.now(), date, recipe, qty: parseInt(qty) || 0, clients, ingredients, createdAt: new Date().toISOString() });
    saveLotTraceData(lots);

    if (typeof showToast === 'function') showToast('Lot enregistré ✓', 'success');
    openLotTraceability(); // Refresh
};

window.deleteLotRecord = function(id) {
    const lots = getLotTraceData().filter(l => l.id !== id);
    saveLotTraceData(lots);
    openLotTraceability();
};

window.simulateProductRecall = function() {
    const search = document.getElementById('recallLotSearch').value.trim().toLowerCase();
    const results = document.getElementById('recallResults');
    if (!search || !results) return;

    const lots = getLotTraceData();
    const impacted = lots.filter(lot =>
        (lot.ingredients || []).some(i => (i.lot || '').toLowerCase().includes(search))
    );

    if (impacted.length === 0) {
        results.innerHTML = `<div style="color:var(--success); font-size:0.85rem;">✅ Aucun lot impacté trouvé pour ce numéro.</div>`;
        return;
    }

    results.innerHTML = `
      <div style="background:rgba(239,68,68,0.08); border:1px solid var(--danger); border-radius:10px; padding:1rem;">
        <div style="font-weight:700; color:var(--danger); margin-bottom:0.6rem;">⚠️ ${impacted.length} lot(s) impacté(s) !</div>
        ${impacted.map(lot => `
          <div style="font-size:0.82rem; padding:4px 0; border-bottom:1px solid rgba(239,68,68,0.15);">
            <strong>${_escHtml(lot.recipe)}</strong> — ${lot.date} — ${lot.qty} pcs${lot.clients ? ` — <span style="color:var(--danger);">Clients : ${_escHtml(lot.clients)}</span>` : ''}
          </div>`).join('')}
      </div>`;
};

// ============================================================================
// 6. 🔔 ALERTES PUSH HACCP (SW + Cockpit)
// ============================================================================

const HACCP_REMINDER_KEY = 'gourmet_haccp_reminders';

window.openHACCPReminderSettings = function() {
    let modal = document.getElementById('haccpReminderModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'haccpReminderModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const saved = JSON.parse(localStorage.getItem(HACCP_REMINDER_KEY) || '{"enabled":false,"times":["10:00","18:00"]}');

    modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:480px; width:95%;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h3 style="margin:0;">🔔 Alertes Relevés HACCP</h3>
        <button class="btn-icon" onclick="document.getElementById('haccpReminderModal').style.display='none';">✕</button>
      </div>
      <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1.5rem;">
        Activez les rappels pour que votre brigade n'oublie jamais de relever les températures des frigos et chambres froides.
      </p>

      <div style="display:flex; align-items:center; justify-content:space-between; padding:1rem; background:var(--bg-alt); border-radius:12px; margin-bottom:1rem; border:1px solid var(--surface-border);">
        <span style="font-weight:700;">Activer les alertes</span>
        <label style="position:relative; display:inline-block; width:52px; height:28px; cursor:pointer;">
          <input type="checkbox" id="haccpAlertEnabled" ${saved.enabled ? 'checked' : ''} style="opacity:0; width:0; height:0;" onchange="toggleHACCPReminders(this.checked)">
          <span style="position:absolute; inset:0; background:${saved.enabled ? 'var(--accent)' : '#ccc'}; border-radius:28px; transition:0.3s;" id="haccpToggleSlider"></span>
          <span style="position:absolute; top:4px; left:${saved.enabled ? '28px' : '4px'}; width:20px; height:20px; background:white; border-radius:50%; transition:0.3s; box-shadow:0 2px 4px rgba(0,0,0,0.2);" id="haccpToggleThumb"></span>
        </label>
      </div>

      <div style="margin-bottom:1rem;">
        <label class="form-label">Horaires de rappel</label>
        <div id="haccpTimesContainer" style="display:flex; flex-direction:column; gap:6px;">
          ${saved.times.map((t, i) => `
            <div style="display:flex; gap:6px; align-items:center;">
              <input type="time" class="form-input haccp-time-input" value="${t}" style="flex:1; padding:10px;">
              ${saved.times.length > 1 ? `<button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1rem;">✕</button>` : ''}
            </div>`).join('')}
        </div>
        <button class="btn btn-sm btn-outline" style="margin-top:6px;" onclick="_addHACCPTimeRow()">✚ Ajouter un horaire</button>
      </div>

      <div style="padding:0.8rem; background:rgba(245,158,11,0.06); border-radius:10px; font-size:0.8rem; color:var(--text-secondary); margin-bottom:1.5rem;">
        💡 Les alertes apparaîtront dans le Cockpit + en notification navigateur (si autorisé). Elles sont gérées en local, aucune donnée n'est envoyée.
      </div>

      <button class="btn btn-primary btn-full" onclick="saveHACCPReminderSettings()">💾 Enregistrer</button>
    </div>`;

    modal.style.display = 'flex';
};

window._addHACCPTimeRow = function() {
    const c = document.getElementById('haccpTimesContainer');
    if (c) c.insertAdjacentHTML('beforeend', `
      <div style="display:flex; gap:6px; align-items:center;">
        <input type="time" class="form-input haccp-time-input" value="12:00" style="flex:1; padding:10px;">
        <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--danger);cursor:pointer;font-size:1rem;">✕</button>
      </div>`);
};

window.toggleHACCPReminders = function(enabled) {
    const slider = document.getElementById('haccpToggleSlider');
    const thumb  = document.getElementById('haccpToggleThumb');
    if (slider) slider.style.background = enabled ? 'var(--accent)' : '#ccc';
    if (thumb)  thumb.style.left = enabled ? '28px' : '4px';
};

window.saveHACCPReminderSettings = function() {
    const enabled = document.getElementById('haccpAlertEnabled').checked;
    const times   = [...document.querySelectorAll('.haccp-time-input')].map(i => i.value).filter(Boolean);
    const config  = { enabled, times };
    localStorage.setItem(HACCP_REMINDER_KEY, JSON.stringify(config));

    if (enabled) {
        // Request browser notification permission
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission().then(perm => {
                if (perm === 'granted' && typeof showToast === 'function') {
                    showToast('Notifications activées ! Vous serez rappelé pour les relevés HACCP.', 'success');
                }
            });
        }
        _setupHACCPReminderTimer(config);
    }

    if (typeof showToast === 'function') showToast('Paramètres HACCP enregistrés ✓', 'success');
    document.getElementById('haccpReminderModal').style.display = 'none';
};

function _setupHACCPReminderTimer(config) {
    // Clear any existing timer
    if (window._haccpReminderInterval) clearInterval(window._haccpReminderInterval);
    if (!config.enabled || !config.times || config.times.length === 0) return;

    window._haccpReminderInterval = setInterval(() => {
        const now = new Date();
        const hhmm = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        if (config.times.includes(hhmm)) {
            // Browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
                new Notification('🌡️ GourmetRevient — Relevé HACCP', {
                    body: `Il est ${hhmm}. Pensez à effectuer votre relevé de température des frigos et chambres froides !`,
                    icon: './img/macaron.jpg',
                    tag: 'haccp-reminder'
                });
            }
            // Cockpit visual alert banner
            _showHACCPCockpitBanner(hhmm);
        }
    }, 60000); // Check every minute
}

function _showHACCPCockpitBanner(time) {
    const existing = document.getElementById('haccpReminderBanner');
    if (existing) existing.remove();

    const banner = document.createElement('div');
    banner.id = 'haccpReminderBanner';
    banner.style.cssText = `
      position: fixed; top: 80px; left: 50%; transform: translateX(-50%);
      z-index: 99999; background: linear-gradient(135deg, #0f172a, #1e3a5f);
      color: white; padding: 1rem 1.5rem; border-radius: 16px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4); border: 1px solid rgba(59,130,246,0.4);
      display: flex; align-items: center; gap: 1rem; animation: slideDown 0.4s ease;
      max-width: 480px; width: 90%;`;

    const hackHref = `onclick="showHygiene(); document.getElementById('haccpReminderBanner').remove();"`;
    banner.innerHTML = `
      <span style="font-size:2rem;">🌡️</span>
      <div style="flex:1;">
        <div style="font-weight:700; margin-bottom:2px;">Relevé HACCP — ${time}</div>
        <div style="font-size:0.82rem; opacity:0.8;">Pensez à relever les températures des équipements réfrigérants.</div>
      </div>
      <div style="display:flex; flex-direction:column; gap:4px;">
        <button style="background:rgba(59,130,246,0.8); border:none; color:white; padding:6px 12px; border-radius:8px; cursor:pointer; font-size:0.8rem; white-space:nowrap;" ${hackHref}>📋 Saisir</button>
        <button onclick="document.getElementById('haccpReminderBanner').remove();" style="background:rgba(255,255,255,0.1); border:none; color:white; padding:4px 12px; border-radius:8px; cursor:pointer; font-size:0.75rem;">✕ Plus tard</button>
      </div>`;

    document.body.appendChild(banner);

    // Auto-dismiss after 30 seconds
    setTimeout(() => { if (banner.parentElement) banner.remove(); }, 30000);
}

// ============================================================================
// 7. 📊 JAUGE SEUIL DE RENTABILITÉ MENSUELLE (LIVE)
// ============================================================================

window.renderBreakevenGauge = function() {
    const container = document.getElementById('breakevenGaugeWidget');
    if (!container) return;

    // Get fixed costs config (from BP config panel)
    const rent     = parseFloat(document.getElementById('bpRent')?.value)     || 1500;
    const salaries = parseFloat(document.getElementById('bpSalaries')?.value) || 5000;
    const energy   = parseFloat(document.getElementById('bpEnergy')?.value)   || 800;
    const other    = parseFloat(document.getElementById('bpOther')?.value)    || 400;
    const totalFixed = rent + salaries + energy + other;

    // Get CRM revenue for current month
    const now = new Date();
    const orders = (window.APP && window.APP.crm && window.APP.crm.orders) || [];
    const monthlyRevenue = orders
        .filter(o => {
            const d = new Date(o.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && o.status !== 'pending';
        })
        .reduce((sum, o) => sum + (parseFloat(o.price) || 0), 0);

    const pct = Math.min(100, totalFixed > 0 ? (monthlyRevenue / totalFixed) * 100 : 0);
    const covered = pct >= 100;
    const dayOfMonth = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const gaugeColor = covered ? '#10b981' : (pct >= 70 ? '#f59e0b' : '#ef4444');

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.8rem;">
        <div>
          <div style="font-size:0.7rem; text-transform:uppercase; letter-spacing:0.08em; color:var(--text-muted); font-weight:700;">Seuil de Rentabilité — ${now.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</div>
          <div style="font-size:1.4rem; font-weight:900; color:${gaugeColor}; margin-top:2px;">${monthlyRevenue.toFixed(0)} € <span style="font-size:0.75rem; color:var(--text-muted); font-weight:400;">/ ${totalFixed.toFixed(0)} € de charges</span></div>
        </div>
        <div style="width:60px; height:60px; position:relative;">
          <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform:rotate(-90deg);">
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--surface-border)" stroke-width="3"/>
            <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="${gaugeColor}" stroke-width="3" stroke-dasharray="${pct},100" style="transition:stroke-dasharray 1s ease;"/>
          </svg>
          <div style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.75rem; font-weight:800; color:${gaugeColor};">${Math.round(pct)}%</div>
        </div>
      </div>

      <!-- Progress bar -->
      <div style="background:var(--surface-border); border-radius:100px; height:10px; overflow:hidden; margin-bottom:0.6rem; position:relative;">
        <div style="height:100%; width:${pct}%; background:${gaugeColor}; border-radius:100px; transition:width 1s ease; position:relative;">
          ${covered ? '' : `<div style="position:absolute; right:0; top:50%; transform:translateY(-50%); width:10px; height:10px; border-radius:50%; background:#fff; box-shadow:0 0 6px ${gaugeColor};"></div>`}
        </div>
        <!-- Day of month marker -->
        <div style="position:absolute; top:0; left:${(dayOfMonth/daysInMonth)*100}%; width:2px; height:100%; background:rgba(255,255,255,0.7);"></div>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-muted);">
        <span>0 €</span>
        <span style="color:${gaugeColor}; font-weight:700;">
          ${covered
              ? `🎉 Charges couvertes depuis le ${_findBreakevenDay(orders, totalFixed, now)}`
              : `📍 Jour ${dayOfMonth} — ${(totalFixed - monthlyRevenue).toFixed(0)} € à couvrir`}
        </span>
        <span>${totalFixed.toFixed(0)} €</span>
      </div>`;
};

function _findBreakevenDay(orders, fixedCosts, now) {
    let cumulative = 0;
    const sorted = [...orders]
        .filter(o => {
            const d = new Date(o.date);
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && o.status !== 'pending';
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

    for (const o of sorted) {
        cumulative += parseFloat(o.price) || 0;
        if (cumulative >= fixedCosts) {
            return new Date(o.date).toLocaleDateString('fr-FR', { day: 'numeric' });
        }
    }
    return 'N/A';
}

// Inject gauge widget into dashboard if not present
function _injectBreakevenGaugeWidget() {
    const bottomGrid = document.querySelector('.bottom-stats-grid');
    if (!bottomGrid || document.getElementById('breakevenGaugeWidget')) return;

    const card = document.createElement('div');
    card.className = 'cockpit-card breakeven-gauge-card';
    card.style.cssText = 'grid-column: 1 / -1;';
    card.innerHTML = `
      <div class="card-header-premium">
        <div class="header-main">
          <span class="icon-p" style="color:#10b981;">🎯</span>
          <h3>Seuil de Rentabilité Mensuel</h3>
        </div>
        <button class="btn btn-sm btn-outline" onclick="switchMgmtTab('dashboard_config')" style="font-size:0.75rem; padding:4px 10px;">⚙️ Configurer</button>
      </div>
      <div id="breakevenGaugeWidget"></div>`;
    bottomGrid.appendChild(card);
    renderBreakevenGauge();
}

// ============================================================================
// 8. 📈 SIMULATEUR D'INFLATION MULTI-PÉRIODES
// ============================================================================

window.openInflationComparator = function() {
    let modal = document.getElementById('inflationComparatorModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'inflationComparatorModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    // Destroy previous chart instance before rebuilding the modal DOM
    if (_inflCompChartInstance) { _inflCompChartInstance.destroy(); _inflCompChartInstance = null; }

    const recipes = [...((window.APP && window.APP.savedRecipes) || []), ...(typeof RECIPES !== 'undefined' ? RECIPES : [])];

    modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:920px; width:95%; max-height:92vh; overflow-y:auto;">
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
        <div>
          <h3 style="margin:0;">📈 Comparateur d'Inflation Multi-Périodes</h3>
          <p style="margin:6px 0 0; font-size:0.82rem; color:var(--text-secondary);">Simulez l'érosion de vos marges à différents niveaux d'inflation des matières premières.</p>
        </div>
        <button class="btn-icon" onclick="document.getElementById('inflationComparatorModal').style.display='none';">✕</button>
      </div>

      <!-- Controls bar -->
      <div style="display:grid; grid-template-columns:2fr 1fr 1fr auto; gap:0.8rem; margin-bottom:1.5rem; align-items:flex-end; background:var(--bg-alt); padding:1rem; border-radius:14px; border:1px solid var(--surface-border);">
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.78rem;">🍰 Recette à analyser</label>
          <select id="inflCompRecipe" class="form-input">
            <option value="">— Toutes les recettes (${recipes.length}) —</option>
            ${recipes.map((r, i) => `<option value="${i}">${_escHtml(r.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.78rem;">📉 Scénario A — Hausse (%)</label>
          <input type="number" id="inflComp3M" class="form-input" value="5" min="0" max="200" step="0.5">
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.78rem;">🔥 Scénario B — Hausse (%)</label>
          <input type="number" id="inflComp6M" class="form-input" value="15" min="0" max="200" step="0.5">
        </div>
        <button class="btn btn-primary" onclick="runInflationComparison()" style="height:44px; padding:0 1.4rem; white-space:nowrap; border-radius:12px;">
          🔍 Analyser
        </button>
      </div>

      <!-- Table + Chart are both rendered inside inflCompResults by runInflationComparison() -->
      <div id="inflCompResults">
        <div style="text-align:center; padding:3rem 1rem; color:var(--text-muted);">
          <div style="font-size:3rem; margin-bottom:0.8rem;">📊</div>
          <p>Cliquez sur <strong>🔍 Analyser</strong> pour voir l'impact sur vos marges.</p>
        </div>
      </div>
    </div>`;

    modal.style.display = 'flex';
    // Auto-run: show results immediately on open
    setTimeout(runInflationComparison, 200);
};

// (variable déclarée en haut du fichier)

window.runInflationComparison = function() {
    const recipeIdxEl = document.getElementById('inflCompRecipe');
    const pct3mEl     = document.getElementById('inflComp3M');
    const pct6mEl     = document.getElementById('inflComp6M');
    const container   = document.getElementById('inflCompResults');
    if (!container) return;

    const recipeIdx = recipeIdxEl ? recipeIdxEl.value : '';
    const pct3m     = parseFloat(pct3mEl ? pct3mEl.value : 5)  || 5;
    const pct6m     = parseFloat(pct6mEl ? pct6mEl.value : 15) || 15;

    const savedRecipes = (window.APP && window.APP.savedRecipes) || [];
    const libRecipes   = (typeof RECIPES !== 'undefined') ? RECIPES : [];
    const allRecipes   = [...savedRecipes, ...libRecipes];

    const recipesToAnalyze = (recipeIdx !== '')
        ? [allRecipes[parseInt(recipeIdx, 10)]].filter(Boolean)
        : allRecipes.slice(0, 15);

    if (recipesToAnalyze.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:2rem; color:var(--text-muted);">⚠️ Aucune recette trouvée. Créez ou sauvegardez d'abord une recette.</div>`;
        return;
    }

    // Destroy any old chart before rebuilding DOM
    if (_inflCompChartInstance) { _inflCompChartInstance.destroy(); _inflCompChartInstance = null; }

    const results = recipesToAnalyze.map(r => {
        // Best-effort cost computation
        let baseMargin = 0, baseCost = 0, sellPrice = 0;
        try {
            const costs = (typeof window.calcFullCost === 'function')
                ? window.calcFullCost(r.margin || 70, r, 0)
                : (r.costs || r.data || {});
            baseMargin = parseFloat(costs.marginPct)  || parseFloat(r.margin) || 70;
            baseCost   = parseFloat(costs.costPerPortion || costs.unitCost) || 0;
            sellPrice  = parseFloat(costs.sellPriceHT  || costs.sellingPrice) || 0;
            // derive sell price from margin if missing
            if (sellPrice <= 0 && baseCost > 0) {
                sellPrice = baseCost / Math.max(0.01, 1 - baseMargin / 100);
            }
        } catch(e) {
            baseMargin = r.margin || 70;
        }

        const computeNewMargin = (inflPct) => {
            if (sellPrice <= 0 || baseCost <= 0) {
                // Approximate: each 1% cost increase erodes margin by ~0.3 pts for a 70% margin recipe
                return Math.max(0, baseMargin - (baseMargin / 100) * inflPct);
            }
            const newCost = baseCost * (1 + inflPct / 100);
            return Math.max(0, ((sellPrice - newCost) / sellPrice) * 100);
        };

        const margin3m = computeNewMargin(pct3m);
        const margin6m = computeNewMargin(pct6m);
        return {
            name: r.name,
            baseMargin,
            margin3m,
            margin6m,
            loss3m: baseMargin - margin3m,
            loss6m: baseMargin - margin6m,
        };
    });

    // Table
    container.innerHTML = `
      <div style="border:1px solid var(--surface-border); border-radius:var(--radius); overflow:hidden; margin-bottom:1.5rem;">
        <div style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; background:var(--bg-alt); padding:0.7rem 1rem; font-weight:700; font-size:0.72rem; text-transform:uppercase; letter-spacing:0.05em; border-bottom:1px solid var(--surface-border);">
          <span>Recette</span>
          <span style="text-align:center;">Marge actuelle</span>
          <span style="text-align:center; color:#f59e0b;">📉 Scén. A +${pct3m}%</span>
          <span style="text-align:center; color:var(--danger);">🔥 Scén. B +${pct6m}%</span>
          <span style="text-align:center;">Perte max</span>
        </div>
        ${results.map(r => {
            const statusColor = r.margin6m < 50 ? 'var(--danger)' : (r.margin6m < 65 ? '#f59e0b' : 'var(--success)');
            return `<div style="display:grid; grid-template-columns:2fr 1fr 1fr 1fr 1fr; padding:0.6rem 1rem; border-bottom:1px solid var(--surface-border); font-size:0.85rem; align-items:center;">
              <span style="font-weight:600;">${_escHtml(r.name)}</span>
              <span style="text-align:center; color:var(--success); font-weight:700;">${r.baseMargin.toFixed(1)}%</span>
              <span style="text-align:center; color:#f59e0b; font-weight:600;">${r.margin3m.toFixed(1)}% <small style="opacity:0.7;">(-${r.loss3m.toFixed(1)})</small></span>
              <span style="text-align:center; color:${statusColor}; font-weight:600;">${r.margin6m.toFixed(1)}% <small style="opacity:0.7;">(-${r.loss6m.toFixed(1)})</small></span>
              <span style="text-align:center;">
                <span style="background:${statusColor}22; color:${statusColor}; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">-${r.loss6m.toFixed(1)} pts</span>
              </span>
            </div>`;
        }).join('')}
      </div>`;

    // Append chart canvas dynamically after the table (canvas is NOT in static HTML anymore)
    const canvasWrap = document.createElement('div');
    canvasWrap.style.cssText = 'position:relative; height:280px; margin-top:1rem;';
    const canvas = document.createElement('canvas');
    canvas.id = 'inflCompChart';
    canvasWrap.appendChild(canvas);
    container.appendChild(canvasWrap);

    if (_inflCompChartInstance) { _inflCompChartInstance.destroy(); _inflCompChartInstance = null; }

    _inflCompChartInstance = new Chart(canvas.getContext('2d'), {
        type: 'bar',
        data: {
            labels: results.map(r => r.name.length > 18 ? r.name.substring(0,18) + '…' : r.name),
            datasets: [
                { label: 'Marge actuelle',         data: results.map(r => r.baseMargin), backgroundColor: 'rgba(16,185,129,0.7)',  borderRadius: 6 },
                { label: `Scénario A (+${pct3m}%)`, data: results.map(r => r.margin3m),  backgroundColor: 'rgba(245,158,11,0.7)', borderRadius: 6 },
                { label: `Scénario B (+${pct6m}%)`, data: results.map(r => r.margin6m),  backgroundColor: 'rgba(239,68,68,0.7)',  borderRadius: 6 },
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { family: 'Inter', size: 11 }, padding: 16 } },
                tooltip: { callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}%` } }
            },
            scales: {
                y: { min: 0, max: 100, title: { display: true, text: 'Marge (%)', font: { family: 'Inter', size: 11 } }, grid: { color: 'rgba(0,0,0,0.04)' } },
                x: { grid: { display: false } }
            }
        }
    });
};

// ============================================================================
// UTILITAIRES INTERNES
// ============================================================================

function _escHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

// ============================================================================
// INJECTION DANS LA NAVIGATION & INIT
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {

    // 1. Hook into dashboard hydration to inject seasonal forecasts + gauge
    const _origHydrate = window.hydratePremiumDashboard;
    window.hydratePremiumDashboard = function(...args) {
        if (typeof _origHydrate === 'function') _origHydrate(...args);
        // Slight delay to ensure DOM is ready
        setTimeout(() => {
            _injectBreakevenGaugeWidget();
            renderBreakevenGauge();
            _injectSeasonalForecastInDashboard();
        }, 200);
    };

    // 2. Add new entries to pro-tools grid
    setTimeout(() => {
        const proToolsGrid = document.querySelector('#mgmtViewProTools .protools-grid');
        if (proToolsGrid) {
            if (!document.getElementById('invoiceProCard')) {
                proToolsGrid.insertAdjacentHTML('afterbegin', `
                  <div class="protools-card" onclick="openInvoiceGenerator()" id="invoiceProCard">
                    <div class="protools-card-icon" style="background:rgba(197,165,90,0.1); color:var(--gold-dark);">📄</div>
                    <div class="protools-card-body">
                      <h3>Devis & Factures PDF</h3>
                      <p>Générez des devis professionnels avec bloc de signature ou des factures clients directement depuis le CRM.</p>
                    </div>
                    <div class="protools-card-footer">
                      <span class="protools-tag">CRM</span>
                      <span class="protools-arrow">→</span>
                    </div>
                  </div>`);
            }

            if (!document.getElementById('lotTraceCard')) {
                proToolsGrid.insertAdjacentHTML('afterbegin', `
                  <div class="protools-card" onclick="openLotTraceability()" id="lotTraceCard">
                    <div class="protools-card-icon" style="background:rgba(239,68,68,0.08); color:var(--danger);">🔬</div>
                    <div class="protools-card-body">
                      <h3>Traçabilité des Lots</h3>
                      <p>Liez les numéros de lots de vos matières premières à chaque production. Simulez un rappel produit en 1 clic.</p>
                    </div>
                    <div class="protools-card-footer">
                      <span class="protools-tag">HACCP</span>
                      <span class="protools-arrow">→</span>
                    </div>
                  </div>`);
            }

            if (!document.getElementById('inflCompCard')) {
                proToolsGrid.insertAdjacentHTML('afterbegin', `
                  <div class="protools-card" onclick="openInflationComparator()" id="inflCompCard">
                    <div class="protools-card-icon" style="background:rgba(99,102,241,0.1); color:#6366f1;">📈</div>
                    <div class="protools-card-body">
                      <h3>Inflation Multi-Périodes</h3>
                      <p>Comparez votre rentabilité actuelle avec ce qu'elle aurait été il y a 3 ou 6 mois face à l'inflation.</p>
                    </div>
                    <div class="protools-card-footer">
                      <span class="protools-tag">Analyse</span>
                      <span class="protools-arrow">→</span>
                    </div>
                  </div>`);
            }
        }

        // 3. Add HACCP reminder button to HACCP section
        const haccpSection = document.getElementById('hygieneSection') || document.querySelector('#hygieneSection');
        if (haccpSection && !document.getElementById('haccpReminderBtn')) {
            const btn = document.createElement('button');
            btn.id = 'haccpReminderBtn';
            btn.className = 'btn btn-outline btn-sm';
            btn.style.cssText = 'position:fixed; bottom:100px; right:20px; z-index:1000; background:var(--bg-card); border-radius:50px; padding:10px 16px; box-shadow:0 4px 15px rgba(0,0,0,0.15);';
            btn.innerHTML = '🔔 Alertes HACCP';
            btn.onclick = openHACCPReminderSettings;
            document.body.appendChild(btn);
        }

        // 4. Initialize HACCP reminders if previously configured
        const savedReminders = JSON.parse(localStorage.getItem(HACCP_REMINDER_KEY) || '{"enabled":false}');
        if (savedReminders.enabled) {
            _setupHACCPReminderTimer(savedReminders);
        }

        // 5. Patch supplier comparison into inventory
        _patchInventoryForSupplierCompare();

    }, 2500);

    // 6. Add "Alertes HACCP" shortcut to hygiene section header, when it becomes visible
    const observer = new MutationObserver(() => {
        const hygieneHeader = document.querySelector('#hygieneSection .mgmt-card-header, #hygieneSection .section-header');
        if (hygieneHeader && !document.getElementById('haccpReminderShortcut')) {
            const btn = document.createElement('button');
            btn.id = 'haccpReminderShortcut';
            btn.className = 'btn btn-sm btn-outline';
            btn.innerHTML = '🔔 Configurer alertes';
            btn.onclick = openHACCPReminderSettings;
            hygieneHeader.appendChild(btn);
        }
    });
    observer.observe(document.body, { childList: true, subtree: true });

});

// Make functions available for nav menu
window.openInflationComparator = window.openInflationComparator;
window.openLotTraceability     = window.openLotTraceability;
window.openInvoiceGenerator    = window.openInvoiceGenerator;
