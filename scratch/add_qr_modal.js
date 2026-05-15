const fs = require('fs');

function addQRModal() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        const qrModalHTML = `
  <!-- QR Code / Label Modal -->
  <div id="qrModal" class="modal-overlay" style="display:none; z-index: 10005;">
    <div class="modal-content glass-panel" style="max-width: 500px; text-align: center; padding: 2rem;">
      <button class="auth-close" onclick="document.getElementById('qrModal').style.display='none'">✖</button>
      <div id="labelPreview" style="background: white; padding: 2rem; border-radius: 16px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 2rem; border: 1px solid #e2e8f0; text-align: left;">
        <div style="font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.1em; color: #64748b; font-weight: 800; margin-bottom: 4px;" id="qrCategory">Pâtisserie</div>
        <div style="font-size: 1.5rem; font-weight: 850; color: #1e293b; line-height: 1.2; margin-bottom: 1rem;" id="qrRecipeName">Nom de la recette</div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
          <div style="font-size: 2.2rem; font-weight: 900; color: #6366f1;" id="qrRecipePrice">0,00 €</div>
          <div id="qrcode" style="width: 100px; height: 100px; background: #f8fafc; border-radius: 8px; display: flex; align-items: center; justify-content: center;"></div>
        </div>
        
        <div style="padding: 10px; background: #fef2f2; border: 1px solid #fee2e2; border-radius: 8px; font-size: 0.8rem; color: #dc2626; font-weight: 700;">
          ⚠️ Allergènes : <span id="qrAllergens" style="font-weight: 600;">Gluten, Lactose</span>
        </div>
        
        <div style="margin-top: 1rem; border-top: 1px dashed #e2e8f0; padding-top: 1rem; font-size: 0.65rem; color: #94a3b8; display: flex; justify-content: space-between;">
          <span>GourmetRevient Pro</span>
          <span>Scannez pour la composition</span>
        </div>
      </div>
      
      <div style="display: flex; gap: 1rem;">
        <button class="btn btn-primary" onclick="exportQRLabelPdf()" style="flex: 1;">📥 Télécharger le PDF</button>
        <button class="btn btn-outline" onclick="window.print()" style="flex: 1;">🖨️ Imprimer</button>
      </div>
    </div>
  </div>`;

        // Inject before end of body
        content = content.replace('</body>', qrModalHTML + '\n</body>');
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("QR Modal added to index.html");
    } catch (err) {
        console.error("Error:", err);
    }
}

addQRModal();
