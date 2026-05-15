/**
 * GOURMETREVIENT — Module Logistique & Radar
 * Gestion des passages fournisseurs et commerciaux
 */

const LogisticsManager = (() => {
    const STORAGE_KEY = 'gourmet_deliveries';

    function getDeliveries() {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    }

    function saveDeliveries(deliveries) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(deliveries));
        // Trigger sync if enabled
        if (window.GourmetSync && typeof window.GourmetSync.sauvegarder === 'function') {
            window.GourmetSync.sauvegarder('deliveries', STORAGE_KEY);
        }
        hydrateLogistics();
        if (typeof hydratePremiumDashboard === 'function') hydratePremiumDashboard();
    }

    function hydrateLogistics() {
        const listBody = document.getElementById('logisticsListBody');
        if (!listBody) return;

        const deliveries = getDeliveries();
        if (deliveries.length === 0) {
            listBody.innerHTML = `<tr><td colspan="5" style="text-align:center; padding:2rem; color:var(--text-muted);">Aucun passage planifié.</td></tr>`;
            return;
        }

        listBody.innerHTML = deliveries.map(d => `
            <tr>
                <td style="font-weight:600;">${d.supplier}</td>
                <td>${d.eta || '—'}</td>
                <td style="font-size:0.85rem; color:var(--text-muted);">${d.items || '—'}</td>
                <td>
                    <span class="badge" style="background:${getStatusColor(d.status)}; color:white; padding:2px 8px; border-radius:50px; font-size:0.75rem;">
                        ${d.status === 'planned' ? 'Planifié' : (d.status === 'confirmed' ? 'Confirmé' : 'Livré')}
                    </span>
                </td>
                <td>
                    <button class="btn btn-sm btn-outline" onclick="LogisticsManager.deleteDelivery('${d.id}')" title="Supprimer">🗑️</button>
                    <button class="btn btn-sm btn-outline" onclick="LogisticsManager.toggleStatus('${d.id}')" title="Changer statut">🔄</button>
                    <button class="btn btn-sm btn-outline" onclick="LogisticsManager.exportDelivery('${d.id}')" title="Exporter PDF">📄</button>
                </td>
            </tr>
        `).join('');
    }

    function getStatusColor(status) {
        switch(status) {
            case 'delivered': return '#10b981';
            case 'confirmed': return '#6366f1';
            default: return '#f59e0b';
        }
    }

    function addDelivery(data) {
        const deliveries = getDeliveries();
        const newDelivery = {
            id: Date.now().toString(),
            supplier: data.supplier,
            eta: data.eta,
            items: data.items,
            status: 'planned',
            delivery_date: new Date().toISOString().split('T')[0]
        };
        deliveries.push(newDelivery);
        saveDeliveries(deliveries);
    }

    function deleteDelivery(id) {
        if (!confirm('Supprimer ce passage ?')) return;
        const deliveries = getDeliveries().filter(d => d.id !== id);
        saveDeliveries(deliveries);
    }

    function toggleStatus(id) {
        const deliveries = getDeliveries();
        const d = deliveries.find(item => item.id === id);
        if (d) {
            if (d.status === 'planned') d.status = 'confirmed';
            else if (d.status === 'confirmed') d.status = 'delivered';
            else d.status = 'planned';
            saveDeliveries(deliveries);
        }
    }

    function exportDelivery(id) {
        const deliveries = getDeliveries();
        const d = deliveries.find(item => item.id === id);
        if (!d) return;

        const content = `
            <div style="padding:40px; font-family:sans-serif; color:#333;">
                <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:2px solid #6366f1; padding-bottom:20px; margin-bottom:30px;">
                    <div>
                        <h1 style="margin:0; color:#6366f1;">BON DE COMMANDE</h1>
                        <p style="margin:5px 0; color:#666;">GourmetRevient — Logistique</p>
                    </div>
                    <div style="text-align:right;">
                        <p style="margin:0; font-weight:bold;">Date: ${new Date().toLocaleDateString('fr-FR')}</p>
                        <p style="margin:5px 0;">Réf: CMD-${d.id.substring(0,6)}</p>
                    </div>
                </div>

                <div style="margin-bottom:40px; background:#f8fafc; padding:20px; border-radius:12px;">
                    <h3 style="margin-top:0; color:#1e293b;">Fournisseur / Grossiste</h3>
                    <p style="margin:5px 0; font-size:1.2rem; font-weight:bold;">${d.supplier}</p>
                    <p style="margin:5px 0; color:#64748b;">Heure de passage prévue: ${d.eta || 'Non spécifiée'}</p>
                </div>

                <div style="margin-bottom:40px;">
                    <h3 style="border-bottom:1px solid #e2e8f0; padding-bottom:10px; color:#1e293b;">Articles attendus / Instructions</h3>
                    <div style="padding:15px; background:#fff; border:1px solid #e2e8f0; border-radius:8px; min-height:100px;">
                        ${d.items ? d.items.replace(/\n/g, '<br>') : 'Aucun article spécifié.'}
                    </div>
                </div>

                <div style="margin-top:100px; display:flex; justify-content:space-between;">
                    <div style="text-align:center; width:200px;">
                        <p style="margin-bottom:40px; color:#64748b;">Signature Client</p>
                        <div style="border-bottom:1px solid #94a3b8;"></div>
                    </div>
                    <div style="text-align:center; width:200px;">
                        <p style="margin-bottom:40px; color:#64748b;">Signature Livreur</p>
                        <div style="border-bottom:1px solid #94a3b8;"></div>
                    </div>
                </div>
            </div>
        `;

        const opt = {
            margin:       0,
            filename:     `commande_${d.supplier.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2 },
            jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
        };

        const worker = html2pdf().from(content).set(opt).save();
        if (typeof showToast === 'function') showToast('📄 Export PDF lancé...', 'success');
    }

    return { hydrateLogistics, addDelivery, deleteDelivery, toggleStatus, exportDelivery };
})();

window.LogisticsManager = LogisticsManager;

// Modal Logic
window.openAddDeliveryModal = function() {
    const supplier = prompt("Nom du grossiste / commercial :");
    if (!supplier) return;
    const eta = prompt("Heure de passage (ex: 08h00 - 10h00) :", "08h00");
    const items = prompt("Articles ou motif de visite :");
    
    LogisticsManager.addDelivery({ supplier, eta, items });
};
