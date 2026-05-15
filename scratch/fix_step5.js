const fs = require('fs');

function fixStep5Layout() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        const target = `<div class="export-actions" style="margin-top: 1.5rem;">
            <button class="btn btn-primary" id="btnLaunchProd" data-i18n="s5.btn.production" style="background:#8b5cf6; color:white; border-color:#8b5cf6; font-weight:700;"> Lancer la production</button>
            <button class="btn btn-primary" id="btnExportPdf" data-i18n="s5.btn.pdf"> Exporter en PDF</button>
            <button class="btn btn-success" id="btnSaveRecipe" data-i18n="s5.btn.save"> Sauvegarder la
              recette</button>
          </div>`;

        const replacement = `<div class="export-actions" style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap; justify-content: center;">
            <button class="btn btn-primary" id="btnLaunchProd" data-i18n="s5.btn.production" style="background:#8b5cf6; color:white; border-color:#8b5cf6; font-weight:700;">🚀 Lancer la production</button>
            <button class="btn btn-primary" id="btnExportPdf" data-i18n="s5.btn.pdf">📄 Exporter en PDF</button>
            <button class="btn btn-outline" id="btnGenerateQR" style="display: flex; align-items: center; gap: 8px;">🏷️ Étiquette Vitrine</button>
            <button class="btn btn-success" id="btnSaveRecipe" data-i18n="s5.btn.save">💾 Sauvegarder la recette</button>
          </div>`;

        // We use a more flexible replacement to handle potential whitespace variations
        content = content.replace(/<div class="export-actions" style="margin-top: 1\.5rem;">[\s\S]+?<\/div>/, replacement);
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Step 5 UI fixed");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixStep5Layout();
