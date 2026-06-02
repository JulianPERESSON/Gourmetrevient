/**
 * GourmetRevient — Roadmap V2 Module
 * 🌟 Features:
 *  1. Devis PDF V2 (Croquis, Chiffrage Rapide, Signature Tactile)
 *  2. Commandes Fournisseurs V2 (Calcul des besoins, Bon de Commande PDF, mailto:)
 *  3. Calendrier Saisonner V2 (Timeline Interactive, Anticipation des Volumes, Liaison Stock)
 *  4. Comparateur de Recettes A/B V2 (Différentiel Marge/Coût, Allergènes, Simulateur d'Inflation)
 */

'use strict';

// Global variables for Devis V2 state
window._devisPhotoBase64 = '';

// ============================================================================
// 1. DEVIS V2 - CHIFFRAGE RAPIDE, PHOTO & SIGNATURE CANVASES
// ============================================================================

// Rapid pricing calculations
window.addFastRecipeToInvoice = function() {
    const recipeId = document.getElementById('invFastRecipeSel').value;
    const parts = parseInt(document.getElementById('invFastRecipeQty').value) || 10;
    if (!recipeId) {
        if (typeof showToast === 'function') showToast('Veuillez sélectionner une recette.', 'error');
        return;
    }
    const recipes = (window.APP && window.APP.savedRecipes) || [];
    const r = recipes.find(x => x.id === recipeId);
    if (!r) return;
    
    // Calculate cost per portion
    const costs = calcFullCost(r.margin || 70, r);
    const pricePerPortion = costs.sellingPrice / (r.portions || 1);
    const lineTotal = pricePerPortion * parts;

    // Append to lines
    if (typeof addInvoiceLine === 'function') {
        const id = Date.now();
        if (!window._invoiceLines) window._invoiceLines = [];
        window._invoiceLines.push({
            id,
            desc: `${r.name} (${parts} parts)`,
            qty: 1,
            unitPrice: parseFloat(lineTotal.toFixed(2))
        });
        if (typeof _renderInvoiceLines === 'function') {
            _renderInvoiceLines();
        }
        if (typeof showToast === 'function') showToast(`${r.name} ajouté au devis !`, 'success');
    }
};

// Base64 Photo Upload Handler
window.handleDevisPhotoUpload = function(input) {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function(e) {
        window._devisPhotoBase64 = e.target.result;
        const preview = document.getElementById('invPhotoPreview');
        if (preview) {
            preview.innerHTML = `<img src="${window._devisPhotoBase64}" style="width:100%; height:100%; object-fit:cover; border-radius:8px;">`;
        }
        if (typeof showToast === 'function') showToast('Photo de référence chargée !', 'success');
    };
    reader.readAsDataURL(file);
};

// Drawing Canvas for Signatures
window._initSignatureCanvas = function() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Size to container
    canvas.width = canvas.parentElement.clientWidth;
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    
    let drawing = false;
    let lastX = 0;
    let lastY = 0;
    
    function getMousePos(e) {
        const rect = canvas.getBoundingClientRect();
        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }
    
    function startDrawing(e) {
        drawing = true;
        const pos = getMousePos(e);
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }
    
    function draw(e) {
        if (!drawing) return;
        const pos = getMousePos(e);
        ctx.beginPath();
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        lastX = pos.x;
        lastY = pos.y;
        e.preventDefault();
    }
    
    function stopDrawing() {
        drawing = false;
    }
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);
    
    canvas.addEventListener('touchstart', startDrawing);
    canvas.addEventListener('touchmove', draw);
    canvas.addEventListener('touchend', stopDrawing);
};

window.clearSignatureCanvas = function() {
    const canvas = document.getElementById('signatureCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
};


// ============================================================================
// 2. COMMANDES FOURNISSEURS V2 - CALCUL DES BESOINS & ENVOI DIRECT
// ============================================================================

window._orderSupplierLines = [];

window.openSupplierOrderGenerator = function(supplierId) {
    let modal = document.getElementById('supplierOrderModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'supplierOrderModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const suppliers = (window.APP && window.APP.suppliers) || [];
    const s = suppliers.find(x => String(x.id) === String(supplierId));
    if (!s) {
        if (typeof showToast === 'function') showToast('Fournisseur non trouvé', 'error');
        return;
    }

    // Get ingredients under threshold that could match this supplier
    const inv = (window.APP && window.APP.inventory) || [];
    const lowStock = inv.filter(item => (item.stock || 0) <= (item.alertThreshold || 5));
    
    // Match heuristics
    const matchingLow = lowStock.filter(item =>
        s.categories.some(cat =>
            item.name.toLowerCase().includes(cat.toLowerCase()) ||
            cat.toLowerCase().includes(item.name.toLowerCase()) ||
            (cat.toLowerCase().includes('lait') && item.name.toLowerCase().includes('lait')) ||
            (cat.toLowerCase().includes('beurre') && item.name.toLowerCase().includes('beurre')) ||
            (cat.toLowerCase().includes('farine') && item.name.toLowerCase().startsWith('farine')) ||
            (cat.toLowerCase().includes('fruit') && (item.name.toLowerCase().includes('purée') || item.name.toLowerCase().includes('fruit')))
        )
    );

    // Initial lines
    window._orderSupplierLines = matchingLow.map(item => {
        const suggestQty = Math.max(1, (item.alertThreshold || 5) - (item.stock || 0) + 2);
        return {
            id: Date.now() + Math.random(),
            name: item.name,
            qty: suggestQty,
            unit: item.unit || 'kg',
            price: item.price || 0
        };
    });

    if (window._orderSupplierLines.length === 0) {
        // Seed at least one blank row
        window._orderSupplierLines.push({
            id: Date.now(),
            name: '',
            qty: 5,
            unit: 'kg',
            price: 0
        });
    }

    _renderSupplierOrderModal(s);
};

function _renderSupplierOrderModal(s) {
    const modal = document.getElementById('supplierOrderModal');
    if (!modal) return;

    modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:780px; width:95%; max-height:90vh; overflow-y:auto; padding:2rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h3 style="margin:0; font-size:1.3rem; color:var(--primary);">📦 Bon de Commande Fournisseur</h3>
        <button class="btn-icon" onclick="document.getElementById('supplierOrderModal').style.display='none';">✕</button>
      </div>

      <div style="background:var(--bg-alt); padding:1rem; border-radius:12px; margin-bottom:1.5rem; font-size:0.85rem; border:1px solid var(--surface-border);">
        <strong>Fournisseur :</strong> ${s.name} (${s.email || 'contact@fournisseur.fr'})<br>
        <strong>Catégories :</strong> ${s.categories.join(', ')}
      </div>

      <h4 style="margin:0 0 0.8rem; font-size:0.95rem;">📝 Lignes de commande</h4>
      <div id="supplierOrderLines" style="margin-bottom:1.5rem;">
        <!-- Rows populated by JS -->
      </div>

      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <button class="btn btn-sm btn-outline" onclick="addSupplierOrderLine()">✚ Ajouter une ligne</button>
        <div style="font-size:1.1rem; font-weight:800; color:var(--accent);">
          Total estimé : <span id="supplierOrderTotal">0,00 €</span>
        </div>
      </div>

      <div style="display:flex; gap:0.8rem; flex-wrap:wrap;">
        <button class="btn btn-primary" onclick="sendSupplierOrderEmail('${s.id}')">📧 Envoyer la commande (Email)</button>
        <button class="btn btn-outline" onclick="printSupplierOrderPDF('${s.id}')">📥 Exporter en PDF</button>
        <button class="btn btn-outline" onclick="document.getElementById('supplierOrderModal').style.display='none';">Annuler</button>
      </div>
    </div>`;

    _renderSupplierOrderRows();
    modal.style.display = 'flex';
}

window.addSupplierOrderLine = function() {
    window._orderSupplierLines.push({
        id: Date.now() + Math.random(),
        name: '',
        qty: 1,
        unit: 'kg',
        price: 0
    });
    _renderSupplierOrderRows();
};

window.removeSupplierOrderLine = function(id) {
    window._orderSupplierLines = window._orderSupplierLines.filter(l => l.id !== id);
    _renderSupplierOrderRows();
};

window.updateSupplierOrderLine = function(id, field, value) {
    const line = window._orderSupplierLines.find(l => l.id === id);
    if (line) {
        if (field === 'qty') line.qty = parseFloat(value) || 0;
        else if (field === 'price') line.price = parseFloat(value) || 0;
        else line[field] = value;
        _updateSupplierOrderTotal();
    }
};

function _renderSupplierOrderRows() {
    const container = document.getElementById('supplierOrderLines');
    if (!container) return;

    container.innerHTML = `
      <div style="display:grid; grid-template-columns:3fr 1fr 1fr 1fr 1fr 36px; gap:6px; font-size:0.75rem; font-weight:700; text-transform:uppercase; color:var(--text-muted); padding:0 4px; margin-bottom:6px;">
        <span>Ingrédient</span><span>Qté</span><span>Unité</span><span>Prix U. (€)</span><span>Total</span><span></span>
      </div>`;

    window._orderSupplierLines.forEach(line => {
        const div = document.createElement('div');
        div.style.cssText = 'display:grid; grid-template-columns:3fr 1fr 1fr 1fr 1fr 36px; gap:6px; margin-bottom:6px; align-items:center;';
        div.innerHTML = `
          <input type="text" class="form-input" value="${line.name}" placeholder="Beurre, farine..." oninput="updateSupplierOrderLine(${line.id}, 'name', this.value)" style="font-size:0.85rem; padding:8px;">
          <input type="number" class="form-input" value="${line.qty}" min="0.1" step="0.1" oninput="updateSupplierOrderLine(${line.id}, 'qty', this.value)" style="font-size:0.85rem; padding:8px; text-align:center;">
          <input type="text" class="form-input" value="${line.unit}" placeholder="kg" oninput="updateSupplierOrderLine(${line.id}, 'unit', this.value)" style="font-size:0.85rem; padding:8px; text-align:center;">
          <input type="number" class="form-input" value="${line.price}" min="0" step="0.01" oninput="updateSupplierOrderLine(${line.id}, 'price', this.value)" style="font-size:0.85rem; padding:8px; text-align:right;">
          <span style="font-size:0.9rem; font-weight:700; text-align:right; color:var(--text-primary);">${(line.qty * line.price).toFixed(2)} €</span>
          <button onclick="removeSupplierOrderLine(${line.id})" style="background:none; border:none; cursor:pointer; color:var(--danger); font-size:1.1rem; padding:4px;">🗑️</button>`;
        container.appendChild(div);
    });

    _updateSupplierOrderTotal();
}

function _updateSupplierOrderTotal() {
    const total = window._orderSupplierLines.reduce((s, l) => s + (l.qty * l.price), 0);
    const totalEl = document.getElementById('supplierOrderTotal');
    if (totalEl) totalEl.textContent = total.toLocaleString('fr-FR', { minimumFractionDigits: 2 }) + ' €';
}

window.sendSupplierOrderEmail = function(supplierId) {
    const suppliers = (window.APP && window.APP.suppliers) || [];
    const s = suppliers.find(x => String(x.id) === String(supplierId));
    if (!s) return;

    let body = `Bonjour ${s.name},\n\nVeuillez trouver ci-dessous notre commande de matières premières :\n\n`;
    window._orderSupplierLines.forEach(l => {
        if (l.name) {
            body += `• ${l.name} : ${l.qty} ${l.unit} ${l.price > 0 ? `(Tarif de réf : ${l.price.toFixed(2)} €/${l.unit})` : ''}\n`;
        }
    });

    const total = window._orderSupplierLines.reduce((sum, l) => sum + (l.qty * l.price), 0);
    if (total > 0) body += `\nMontant estimé de la commande : ${total.toFixed(2)} € HT.\n`;
    body += `\nMerci de bien vouloir nous confirmer la prise en compte de cette commande et la date de livraison.\n\nCordialement,\n${localStorage.getItem('gourmet_current_user') || 'Chef Pâtissier'}`;

    window.location.href = `mailto:${s.email || 'contact@fournisseur.fr'}?subject=${encodeURIComponent('[Commande] Approvisionnement GourmetRevient')}&body=${encodeURIComponent(body)}`;
    if (typeof showToast === 'function') showToast('Client email ouvert avec le bon de commande !', 'success');
};

window.printSupplierOrderPDF = function(supplierId) {
    const suppliers = (window.APP && window.APP.suppliers) || [];
    const s = suppliers.find(x => String(x.id) === String(supplierId));
    if (!s) return;

    const total = window._orderSupplierLines.reduce((sum, l) => sum + (l.qty * l.price), 0);
    const shopName = localStorage.getItem('gourmet_current_user') || 'Mon Atelier';

    const html = `<!DOCTYPE html>
<html lang="fr"><head>
<meta charset="UTF-8"><title>Bon de Commande — ${s.name}</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
<style>
body { font-family: 'Inter', sans-serif; padding: 40px; color:#1e293b; }
.header { display: flex; justify-content: space-between; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 40px; }
.title { font-size: 2rem; font-weight: 900; color: #4f46e5; text-transform: uppercase; }
table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
th { text-align: left; background: #f8fafc; padding: 12px; font-size: 0.75rem; text-transform: uppercase; border-bottom: 2px solid #cbd5e1; }
td { padding: 12px; border-bottom: 1px solid #f1f5f9; font-size: 0.9rem; }
.price { text-align: right; }
.total-box { margin-left: auto; width: 260px; font-size: 1.1rem; font-weight: 900; color: #4f46e5; border-top: 2px solid #4f46e5; padding-top: 10px; text-align: right; }
</style></head><body>
<div class="header">
  <div>
    <h2>🧁 ${shopName}</h2>
    <p>Bon de Commande Approvisionnement</p>
  </div>
  <div style="text-align:right;">
    <div class="title">COMMANDE</div>
    <p>Date : ${new Date().toLocaleDateString('fr-FR')}</p>
  </div>
</div>
<div style="margin-bottom: 30px;">
  <strong>Destinataire :</strong> ${s.name}<br>
  <strong>Email :</strong> ${s.email || '-'}<br>
</div>
<table>
  <thead><tr><th>Ingrédient</th><th>Quantité</th><th class="price">Prix U. HT</th><th class="price">Total HT</th></tr></thead>
  <tbody>
    ${window._orderSupplierLines.map(l => `
      <tr>
        <td><strong>${l.name}</strong></td>
        <td>${l.qty} ${l.unit}</td>
        <td class="price">${l.price.toFixed(2)} €</td>
        <td class="price">${(l.qty * l.price).toFixed(2)} €</td>
      </tr>`).join('')}
  </tbody>
</table>
<div class="total-box">Total estimé : ${total.toFixed(2)} € HT</div>
<div style="margin-top:80px; text-align:center; font-size:0.8rem; color:#94a3b8;">Document généré automatiquement par GourmetRevient.</div>
<script>window.onload = () => { setTimeout(() => { window.print(); }, 300); }</script>
</body></html>`;

    const win = window.open('', '_blank');
    if (win) { win.document.write(html); win.document.close(); }
};


// ============================================================================
// 3. CALENDRIER SAISONNIER V2 - TIMELINE & CALCULATEUR D'ANTICIPATION
// ============================================================================

window.openSeasonalTimelineModal = function() {
    let modal = document.getElementById('seasonalTimelineModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'seasonalTimelineModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:820px; width:95%; max-height:92vh; overflow-y:auto; padding:2rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h3 style="margin:0; font-size:1.4rem; color:var(--primary); display:flex; align-items:center; gap:10px;">
          🗓️ Cockpit Saisonnalité & Anticipation
        </h3>
        <button class="btn-icon" onclick="document.getElementById('seasonalTimelineModal').style.display='none';">✕</button>
      </div>

      <!-- Timeline visual track -->
      <div style="display:flex; gap:10px; overflow-x:auto; padding:10px 4px; margin-bottom:2rem; border-bottom:1px solid var(--surface-border); scrollbar-width:thin;">
        ${_getSeasonalTimelineTracksHTML()}
      </div>

      <!-- Detail Card & Calculator -->
      <div id="seasonalDetailsCard" style="background:var(--bg-alt); border-radius:16px; padding:1.5rem; border:1px solid var(--surface-border);">
        <p style="text-align:center; color:var(--text-secondary); margin:2rem 0;">Sélectionnez une fête saisonnière ci-dessus pour anticiper sa production.</p>
      </div>
    </div>`;

    modal.style.display = 'flex';
};

const SEASONS_CONFIG = [
    { key: 'xmas', name: 'Noël (Bûches)', emoji: '🎄', dateStr: '25 Déc.', ingredients: ['chocolat', 'beurre', 'crème', 'sucre', 'praliné'] },
    { key: 'kings', name: 'Galette des Rois', emoji: '👑', dateStr: '6 Janv.', ingredients: ['amande', 'beurre', 'farine', 'œuf'] },
    { key: 'valentine', name: 'Saint-Valentin', emoji: '❤️', dateStr: '14 Fév.', ingredients: ['chocolat', 'framboise', 'rose', 'fraise'] },
    { key: 'easter', name: 'Pâques (Chocolats)', emoji: '🐣', dateStr: 'Avril', ingredients: ['chocolat', 'praliné', 'noisette', 'beurre'] },
    { key: 'mothers', name: 'Fête des Mères', emoji: '💐', dateStr: 'Fin Mai', ingredients: ['fraise', 'framboise', 'vanille', 'crème'] }
];

function _getSeasonalTimelineTracksHTML() {
    return SEASONS_CONFIG.map(s => `
      <div class="seasonal-pill-track" onclick="selectSeasonalEvent('${s.key}')" style="flex:0 0 140px; text-align:center; padding:12px; border-radius:12px; background:var(--surface); border:2px solid var(--surface-border); cursor:pointer; transition:all 0.2s;">
        <div style="font-size:2rem; margin-bottom:6px;">${s.emoji}</div>
        <div style="font-weight:700; font-size:0.85rem; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</div>
        <div style="font-size:0.75rem; color:var(--text-muted); margin-top:2px;">${s.dateStr}</div>
      </div>`).join('');
}

window.selectSeasonalEvent = function(key) {
    // Styling highlight
    document.querySelectorAll('.seasonal-pill-track').forEach((p, idx) => {
        if (SEASONS_CONFIG[idx].key === key) {
            p.style.borderColor = 'var(--accent)';
            p.style.background = 'rgba(99, 102, 241, 0.05)';
        } else {
            p.style.borderColor = 'var(--surface-border)';
            p.style.background = 'var(--surface)';
        }
    });

    const s = SEASONS_CONFIG.find(x => x.key === key);
    if (!s) return;

    const recipes = (window.APP && window.APP.savedRecipes) || [];
    const container = document.getElementById('seasonalDetailsCard');
    if (!container) return;

    container.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem;">
        <div>
          <h4 style="margin:0; font-size:1.2rem;">${s.emoji} Anticipation : ${s.name}</h4>
          <p style="font-size:0.8rem; color:var(--text-muted); margin:4px 0 0;">Estimez vos besoins bruts de production et comparez en direct avec vos stocks.</p>
        </div>
      </div>

      <!-- Recipe Target Picker -->
      <div style="display:grid; grid-template-columns:3fr 1fr; gap:10px; margin-bottom:1.5rem; align-items:flex-end;">
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.75rem;">Recette phare associée</label>
          <select id="seasonRecipeSel" class="form-input">
            <option value="">— Sélectionner une recette —</option>
            ${recipes.map(r => `<option value="${r.id}">${_escHtml(r.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-size:0.75rem;">Volume cible (unités)</label>
          <input type="number" id="seasonRecipeQty" class="form-input" value="100" min="1">
        </div>
      </div>

      <button class="btn btn-primary btn-full" onclick="calculateSeasonalVolume('${key}')" style="margin-bottom:1.5rem;">📊 Anticiper la Production</button>

      <div id="seasonCalcResults"></div>`;
};

window.calculateSeasonalVolume = function(key) {
    const recipeId = document.getElementById('seasonRecipeSel').value;
    const qty = parseInt(document.getElementById('seasonRecipeQty').value) || 100;
    
    if (!recipeId) {
        if (typeof showToast === 'function') showToast('Veuillez sélectionner une recette.', 'error');
        return;
    }

    const recipes = (window.APP && window.APP.savedRecipes) || [];
    const r = recipes.find(x => x.id === recipeId);
    if (!r) return;

    const resultsDiv = document.getElementById('seasonCalcResults');
    if (!resultsDiv) return;

    const inv = (window.APP && window.APP.inventory) || [];
    
    // Accumulate total raw ingredients needed
    // Recipe ingredients are given for r.portions
    const factor = qty / (r.portions || 1);
    
    let html = `
      <h5 style="margin:0 0 0.8rem; font-size:0.9rem; text-transform:uppercase; color:var(--primary);">📦 Besoins d'achat cumulés</h5>
      <table style="width:100%; border-collapse:collapse; font-size:0.85rem; margin-bottom:1rem;">
        <thead>
          <tr style="border-bottom:2px solid var(--surface-border); text-align:left; color:var(--text-muted);">
            <th style="padding:8px 0;">Matière Première</th>
            <th style="padding:8px 0;">Besoin global</th>
            <th style="padding:8px 0;">Stock Actuel</th>
            <th style="padding:8px 0; text-align:right;">Statut</th>
          </tr>
        </thead>
        <tbody>`;

    let missingAny = false;
    let missingMap = [];

    r.ingredients.forEach(ing => {
        const required = ing.quantity * factor;
        const stockItem = inv.find(i => i.name && i.name.toLowerCase().trim() === ing.name.toLowerCase().trim());
        const stockQty = stockItem ? parseFloat(stockItem.stock) || 0 : 0;
        const missing = Math.max(0, required - stockQty);
        
        let statusText = '';
        if (missing > 0) {
            statusText = `<span style="background:rgba(239,68,68,0.12); color:#ef4444; padding:3px 8px; border-radius:6px; font-weight:700;">Manque ${missing.toFixed(1)} ${ing.unit}</span>`;
            missingAny = true;
            missingMap.push({ name: ing.name, qty: missing, unit: ing.unit, price: stockItem ? stockItem.price || 0 : 0 });
        } else {
            statusText = `<span style="background:rgba(16,185,129,0.12); color:#10b981; padding:3px 8px; border-radius:6px; font-weight:700;">OK ✓</span>`;
        }

        html += `
          <tr style="border-bottom:1px solid var(--surface-border);">
            <td style="padding:8px 0;"><strong>${ing.name}</strong></td>
            <td style="padding:8px 0;">${required.toFixed(1)} ${ing.unit}</td>
            <td style="padding:8px 0; color:var(--text-secondary);">${stockQty.toFixed(1)} ${ing.unit}</td>
            <td style="padding:8px 0; text-align:right;">${statusText}</td>
          </tr>`;
    });

    html += `</tbody></table>`;

    if (missingAny) {
        window._storedMissingOrderLines = missingMap;
        html += `
          <div style="background:rgba(245,158,11,0.06); padding:1rem; border-radius:12px; border:1px solid rgba(245,158,11,0.2); font-size:0.82rem; display:flex; justify-content:space-between; align-items:center; margin-top:1.2rem;">
            <div>
              ⚠️ Des matières premières critiques manquent à l'appel pour atteindre l'objectif de ${qty} pièces.
            </div>
            <button class="btn btn-sm" style="background:#f59e0b; color:#fff; border:none;" onclick="triggerQuickOrderFromMissing()">
              📦 Commander les manquants
            </button>
          </div>`;
    } else {
        html += `<div style="background:rgba(16,185,129,0.08); padding:1rem; border-radius:12px; color:#10b981; font-weight:600; font-size:0.85rem; text-align:center;">
          🚀 Félicitations ! Vos stocks actuels sont entièrement suffisants pour honorer votre production saisonnière !
        </div>`;
    }

    resultsDiv.innerHTML = html;
};

window.triggerQuickOrderFromMissing = function() {
    if (!window._storedMissingOrderLines || window._storedMissingOrderLines.length === 0) return;
    
    // Open standard purchase order generator but prefill with missing lines
    let modal = document.getElementById('supplierOrderModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'supplierOrderModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    // Standard prefill
    window._orderSupplierLines = window._storedMissingOrderLines.map((l, idx) => ({
        id: Date.now() + idx,
        name: l.name,
        qty: parseFloat(l.qty.toFixed(1)),
        unit: l.unit,
        price: l.price
    }));

    // Close seasonal modal
    document.getElementById('seasonalTimelineModal').style.display = 'none';

    // Open first supplier as default or Metro
    const suppliers = (window.APP && window.APP.suppliers) || [];
    const bestSup = suppliers[0] || { id: 'temp', name: 'Fournisseur de dépannage', email: 'achat@patisserie.fr', categories: ['Matière première'] };
    _renderSupplierOrderModal(bestSup);
};


// ============================================================================
// 4. COMPARATEUR DE RECETTES A/B V2 - DOUBLE COLONNE, INFATION & ALLERGENS
// ============================================================================

window.openRecipeComparatorModal = function() {
    let modal = document.getElementById('recipeComparatorModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'recipeComparatorModal';
        modal.className = 'modal-overlay';
        document.body.appendChild(modal);
    }

    const recipes = (window.APP && window.APP.savedRecipes) || [];

    modal.innerHTML = `
    <div class="modal-content glass-panel" style="max-width:860px; width:95%; max-height:92vh; overflow-y:auto; padding:2rem;">
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
        <h3 style="margin:0; font-size:1.4rem; color:var(--primary); display:flex; align-items:center; gap:10px;">
          🔬 Comparateur de Recettes A/B
        </h3>
        <button class="btn-icon" onclick="document.getElementById('recipeComparatorModal').style.display='none';">✕</button>
      </div>

      <!-- Grid A/B selectors -->
      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; margin-bottom:1.5rem;">
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-weight:700;">🟢 Recette Référence (A)</label>
          <select id="compRecipeA" class="form-input" onchange="renderRecipeComparison()">
            <option value="">— Choisir Recette A —</option>
            ${recipes.map(r => `<option value="${r.id}">${_escHtml(r.name)}</option>`).join('')}
          </select>
        </div>
        <div class="form-group" style="margin:0;">
          <label class="form-label" style="font-weight:700;">🟡 Recette Alternative (B)</label>
          <select id="compRecipeB" class="form-input" onchange="renderRecipeComparison()">
            <option value="">— Choisir Recette B —</option>
            ${recipes.map(r => `<option value="${r.id}">${_escHtml(r.name)}</option>`).join('')}
          </select>
        </div>
      </div>

      <!-- Inflation Simulator -->
      <div style="background:var(--bg-alt); padding:1rem; border-radius:12px; margin-bottom:1.5rem; border:1px solid var(--surface-border);">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; font-size:0.85rem;">
          <strong>🔥 Simulateur de Résilience à l'Inflation</strong>
          <span id="compInflationPct" style="font-weight:700; color:var(--danger);">Hausse : +0%</span>
        </div>
        <input type="range" id="compInflationRange" min="0" max="50" value="0" style="width:100%;" oninput="simulateRecipeInflation(this.value)">
      </div>

      <!-- Results columns -->
      <div id="recipeCompDetails" style="display:grid; grid-template-columns:1fr 1fr; gap:1.5rem;">
        <p style="grid-column: 1/-1; text-align:center; color:var(--text-secondary); margin:3rem 0;">
          Sélectionnez deux recettes ci-dessus pour lancer l'analyse comparative.
        </p>
      </div>
    </div>`;

    modal.style.display = 'flex';
};

window.renderRecipeComparison = function() {
    const idA = document.getElementById('compRecipeA').value;
    const idB = document.getElementById('compRecipeB').value;

    const container = document.getElementById('recipeCompDetails');
    if (!container) return;

    if (!idA || !idB) {
        container.innerHTML = `<p style="grid-column: 1/-1; text-align:center; color:var(--text-secondary); margin:3rem 0;">Sélectionnez deux recettes ci-dessus pour lancer l'analyse comparative.</p>`;
        return;
    }

    const recipes = (window.APP && window.APP.savedRecipes) || [];
    const rA = recipes.find(x => x.id === idA);
    const rB = recipes.find(x => x.id === idB);

    if (!rA || !rB) return;

    // Reset inflation range
    document.getElementById('compInflationRange').value = 0;
    document.getElementById('compInflationPct').textContent = 'Hausse : +0%';

    window._storedRecipeA = rA;
    window._storedRecipeB = rB;

    _buildComparisonHTML(rA, rB, 0);
};

window.simulateRecipeInflation = function(pct) {
    document.getElementById('compInflationPct').textContent = `Hausse : +${pct}%`;
    if (window._storedRecipeA && window._storedRecipeB) {
        _buildComparisonHTML(window._storedRecipeA, window._storedRecipeB, parseFloat(pct) / 100);
    }
};

function _buildComparisonHTML(rA, rB, inflationFactor = 0) {
    const container = document.getElementById('recipeCompDetails');
    if (!container) return;

    // Calculate details with optional inflation
    const costsA = _calcRecipeCompCosts(rA, inflationFactor);
    const costsB = _calcRecipeCompCosts(rB, inflationFactor);

    // Allergens computation
    const allergensA = _getRecipeAllergens(rA);
    const allergensB = _getRecipeAllergens(rB);

    // Cost differentials
    const costDiff = costsB.costPerPortion - costsA.costPerPortion;
    const marginDiff = costsB.marginPct - costsA.marginPct;

    const diffCostText = costDiff > 0 
        ? `<span style="color:#ef4444; font-weight:700;">+${costDiff.toFixed(2)} € (plus chère)</span>` 
        : `<span style="color:#10b981; font-weight:700;">${costDiff.toFixed(2)} € (moins chère)</span>`;

    const diffMarginText = marginDiff > 0 
        ? `<span style="color:#10b981; font-weight:700;">+${marginDiff.toFixed(1)}% de marge</span>` 
        : `<span style="color:#ef4444; font-weight:700;">${marginDiff.toFixed(1)}% de marge</span>`;

    container.innerHTML = `
      <!-- Scorecard Differential -->
      <div style="grid-column:1/-1; background:var(--bg-alt); padding:1rem; border-radius:14px; border:1px solid var(--surface-border); display:flex; justify-content:space-around; text-align:center;">
        <div>
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Écart de coût / portion</div>
          <div style="font-size:1.15rem; margin-top:4px;">${diffCostText}</div>
        </div>
        <div style="width:1px; background:var(--surface-border);"></div>
        <div>
          <div style="font-size:0.75rem; color:var(--text-muted); text-transform:uppercase;">Écart de marge brute</div>
          <div style="font-size:1.15rem; margin-top:4px;">${diffMarginText}</div>
        </div>
      </div>

      <!-- Column A -->
      <div style="border-right:1px solid var(--surface-border); padding-right:1rem;">
        <h4 style="color:#10b981; font-size:1.1rem; border-bottom:2px solid #10b981; padding-bottom:6px; margin:0 0 1rem;">${_escHtml(rA.name)}</h4>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:0.9rem;">
          <div style="display:flex; justify-content:space-between;"><span>Portions :</span><strong>${rA.portions}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Coût technique global :</span><strong>${costsA.totalFullCost.toFixed(2)} €</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Coût / portion :</span><strong>${costsA.costPerPortion.toFixed(2)} €</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Prix de vente conseillé :</span><strong>${costsA.sellingPrice.toFixed(2)} €</strong></div>
          <div style="display:flex; justify-content:space-between; color:var(--accent);"><span>Marge brute :</span><strong>${costsA.marginPct.toFixed(1)}%</strong></div>
        </div>
        
        <h5 style="margin:1.5rem 0 0.5rem; font-size:0.8rem; text-transform:uppercase; color:var(--text-muted);">🛡️ Allergènes déclarés</h5>
        <div style="display:flex; flex-wrap:wrap; gap:4px;">
          ${allergensA.length === 0 ? '<span style="color:#10b981; font-size:0.8rem;">Aucun allergène</span>' : 
            allergensA.map(a => `<span style="background:rgba(239,68,68,0.08); border:1px solid #f87171; color:#ef4444; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">${a}</span>`).join('')}
        </div>
      </div>

      <!-- Column B -->
      <div>
        <h4 style="color:#f59e0b; font-size:1.1rem; border-bottom:2px solid #f59e0b; padding-bottom:6px; margin:0 0 1rem;">${_escHtml(rB.name)}</h4>
        <div style="display:flex; flex-direction:column; gap:8px; font-size:0.9rem;">
          <div style="display:flex; justify-content:space-between;"><span>Portions :</span><strong>${rB.portions}</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Coût technique global :</span><strong>${costsB.totalFullCost.toFixed(2)} €</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Coût / portion :</span><strong>${costsB.costPerPortion.toFixed(2)} €</strong></div>
          <div style="display:flex; justify-content:space-between;"><span>Prix de vente conseillé :</span><strong>${costsB.sellingPrice.toFixed(2)} €</strong></div>
          <div style="display:flex; justify-content:space-between; color:var(--accent);"><span>Marge brute :</span><strong>${costsB.marginPct.toFixed(1)}%</strong></div>
        </div>
        
        <h5 style="margin:1.5rem 0 0.5rem; font-size:0.8rem; text-transform:uppercase; color:var(--text-muted);">🛡️ Allergènes déclarés</h5>
        <div style="display:flex; flex-wrap:wrap; gap:4px;">
          ${allergensB.length === 0 ? '<span style="color:#10b981; font-size:0.8rem;">Aucun allergène</span>' : 
            allergensB.map(a => `<span style="background:rgba(239,68,68,0.08); border:1px solid #f87171; color:#ef4444; padding:2px 8px; border-radius:6px; font-size:0.75rem; font-weight:700;">${a}</span>`).join('')}
        </div>
      </div>`;
}

function _calcRecipeCompCosts(recipe, inflationFactor = 0) {
    if (!recipe || !recipe.ingredients) return { totalFullCost: 0, costPerPortion: 0, sellingPrice: 0, marginPct: 70 };
    
    // Total raw ingredient cost with inflation applied
    const ingCost = recipe.ingredients.reduce((sum, ing) => {
        const baseCost = ing.quantity * (ing.pricePerUnit || 0);
        return sum + (baseCost * (1 + inflationFactor));
    }, 0);

    const srCost = (window.SousRecettes && recipe.sousRecettes)
        ? recipe.sousRecettes.reduce((sum, sr) => {
            const baseCost = SousRecettes.calcCoutSousRecette(sr);
            return sum + (baseCost * (1 + inflationFactor));
          }, 0)
        : 0;

    const rawCost = ingCost + srCost;
    
    // Re-run standard business model calculations
    const margins = calcFullCost(recipe.margin || 70, { ...recipe, costs: { materialCost: rawCost } });
    return {
        totalFullCost: margins.totalFullCost || rawCost,
        costPerPortion: margins.costPerPortion || (rawCost / (recipe.portions || 1)),
        sellingPrice: margins.sellingPrice || 0,
        marginPct: margins.marginPct || 70
    };
}

function _getRecipeAllergens(recipe) {
    if (!recipe || !recipe.ingredients) return [];
    
    // Query local ingredientDb to match allergens
    const db = (window.APP && window.APP.ingredientDb) || [];
    const list = new Set();
    
    recipe.ingredients.forEach(ing => {
        const matched = db.find(x => x.name && x.name.toLowerCase().trim() === ing.name.toLowerCase().trim());
        if (matched && matched.allergens) {
            matched.allergens.forEach(a => list.add(a));
        }
    });

    if (window.SousRecettes && recipe.sousRecettes) {
        recipe.sousRecettes.forEach(sr => {
            // Find child recipe and aggregate
            const saved = window.APP.savedRecipes || [];
            const child = saved.find(x => x.id === sr.recetteEnfantId);
            if (child) {
                _getRecipeAllergens(child).forEach(a => list.add(a));
            }
        });
    }

    return [...list];
}

// Global safety escHtml
function _escHtml(str) {
    if (typeof str !== 'string') return String(str || '');
    return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}


// ============================================================================
// WIDGET INJECTION ON DASHBOARD
// ============================================================================

window.injectSeasonalWidgetIntoDashboard = function() {
    const list = document.getElementById('dashSeasonalAlerts');
    if (!list) return;

    // Get forecasts from existing engine in crm-enhanced-v2
    if (typeof getSeasonalAIForecasts !== 'function') return;
    const forecasts = getSeasonalAIForecasts();

    if (forecasts.length === 0) {
        list.innerHTML = `<p style="font-size:0.8rem; color:var(--cockpit-text-muted); text-align:center; padding:10px 0;">Optimal — aucune alerte de saison.</p>`;
        return;
    }

    list.innerHTML = forecasts.slice(0, 3).map(f => {
        const color = f.urgency === 'high' ? 'var(--cockpit-danger)' : (f.urgency === 'medium' ? '#f59e0b' : 'var(--cockpit-accent)');
        return `
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; padding:6px 0; border-bottom:1px solid rgba(0,0,0,0.05);">
            <div style="display:flex; align-items:center; gap:8px;">
              <span>${f.emoji}</span>
              <span style="font-weight:700;">${f.event}</span>
            </div>
            <span style="color:${color}; font-weight:800; font-size:0.75rem;">J-${f.daysUntil}</span>
          </div>`;
    }).join('');
};

// Hook into dashboard refresh
const _origHydratePremium = window.hydratePremiumDashboard;
window.hydratePremiumDashboard = function() {
    if (typeof _origHydratePremium === 'function') _origHydratePremium();
    setTimeout(() => {
        injectSeasonalWidgetIntoDashboard();
    }, 100);
};
