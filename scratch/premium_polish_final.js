const fs = require('fs');

function premiumPolish() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Fix Reception View (HACCP) - Syntax and Mojibake
        content = content.replace(/id="haccpViewReception" class="haccp-view" style="display:none; width:100%;">\s*<div class="mgmt-glass-card" style="padding: 2.5rem; width: 100%;" style="padding: 2.5rem;">/g, 
                                 'id="haccpViewReception" class="haccp-view" style="display:none; width:100%;">\n                     <div class="mgmt-glass-card" style="padding: 2.5rem; width: 100%;">');
        
        content = content.replace(/Contrles  la Rception/g, 'Contrôles à la Réception');
        content = content.replace(/Vrification des marchandises  l'arrive/g, "Vérification des marchandises à l'arrivée");
        content = content.replace(/temprature, hygine/g, 'température, hygiène');
        content = content.replace(/Nouveau Contrle/g, 'Nouveau Contrôle');
        content = content.replace(/tat Hygine/g, 'État Hygiène');

        // 2. Fix other HACCP Mojibake
        content = content.replace(/Dernier Relev/g, 'Dernier Relevé');
        content = content.replace(/Aucun relev/g, 'Aucun relevé');
        content = content.replace(/Tà¢ches du jour/g, 'Tâches du jour');
        content = content.replace(/Traabilit/g, 'Traçabilité');
        
        // 3. Add Premium Shadow to Calc Buttons
        const buttonShadowStyle = `.export-actions .btn {
  flex: 1;
  min-width: 160px;
  margin: 0 !important;
  position: relative !important;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.2);
  border-radius: 12px;
  font-weight: 700;
  transition: all 0.3s ease;
}
.export-actions .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(99, 102, 241, 0.3);
}`;
        content = content.replace(/\.export-actions \.btn \{[\s\S]+?\}/, buttonShadowStyle);

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Premium Polish applied: Reception view fixed, Mojibake cleaned, Buttons enhanced.");
    } catch (err) {
        console.error("Error:", err);
    }
}

premiumPolish();
