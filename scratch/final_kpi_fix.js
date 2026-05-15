const fs = require('fs');

function finalKpiFix() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // Fix KPI Labels and Footers
        content = content.replace(/Dernier Relev/g, 'Dernier Relevé');
        content = content.replace(/Aucun relev/g, 'Aucun relevé');
        content = content.replace(/Tches du jour/g, 'Tâches du jour');
        content = content.replace(/Traabilit/g, 'Traçabilité');
        
        // Fix corrupted icons in KPIs
        content = content.replace(/<span class="v2-kpi-label"> Nettoyage<\/span>/g, '<span class="v2-kpi-label">🧻 Nettoyage</span>');
        content = content.replace(/<span class="v2-kpi-label"> Lots Actifs<\/span>/g, '<span class="v2-kpi-label">📦 Lots Actifs</span>');
        
        // Global cleanup for any remaining weird symbols in that area
        content = content.replace(/-- C/g, '-- °C');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Final KPI labels fixed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

finalKpiFix();
