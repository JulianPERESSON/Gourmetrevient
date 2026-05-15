const fs = require('fs');

function fixIndex() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Remove ALL icons from HACCP sidebar
        content = content.replace(/<span class="icon"><\/span> <span>Températures<\/span>/g, '<span>Températures</span>');
        content = content.replace(/<span class="icon">🧻<\/span> <span>Nettoyage<\/span>/g, '<span>Nettoyage</span>');
        content = content.replace(/<span class="icon"> ·<\/span> <span>Traçabilité<\/span>/g, '<span>Traçabilité</span>');
        content = content.replace(/<span class="icon"><\/span> <span>Réception<\/span>/g, '<span>Réception</span>');
        content = content.replace(/<span class="icon">🛡️ <\/span> <span>Allergènes<\/span>/g, '<span>Allergènes</span>');
        
        // Secondary patterns if first ones fail
        content = content.replace(/<span class="icon">.*?<\/span>\s*<span>(.*?)<\/span>/g, '<span>$1</span>');

        // 2. Fix Button Overlap in Recipe Calc
        const exportActionsPattern = /\.export-actions \{[\s\S]+?\}/;
        const exportActionsReplacement = `.export-actions {
  display: flex;
  flex-direction: row;
  gap: 1.2rem;
  margin-top: 2rem;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
.export-actions .btn {
  flex: 1;
  min-width: 160px;
  margin: 0 !important;
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}`;
        content = content.replace(exportActionsPattern, exportActionsReplacement);

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Index.html updated: Sidebar cleaned and buttons fixed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixIndex();
