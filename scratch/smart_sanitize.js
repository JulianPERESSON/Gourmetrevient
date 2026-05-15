const fs = require('fs');

function smartSanitize() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        const map = {
            'BANNIǟ\'<?RE': 'BANNIÈRE',
            'ǽ\'?o': '📋',
            'ǽ\'??': '📈',
            'ǽ\' Dgustation': '🍷 Dégustation',
            '60ǟ\'ǽ\'??40mm': '60x40mm',
            '?ǽ\' Top 5': '🏆 Top 5',
            '?T Assistant': '🤖 Assistant',
            'ǽ?? Minuteur': '⏳ Minuteur',
            'ǽ\' Ingrdients': '🥄 Ingrédients',
            '?. Profil': '🍎 Profil',
            'prvisions': 'prévisions',
            'Dconnexion': 'Déconnexion',
            ' propos': 'À propos',
            'Termine': 'Terminée'
        };

        for (const [key, val] of Object.entries(map)) {
            content = content.split(key).join(val);
        }

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Smart sanitize completed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

smartSanitize();
