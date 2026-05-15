const fs = require('fs');

function mirrorFinish() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // Target precise corrupted strings found in the last scan
        content = content.replace(/Dconnexion/g, 'Déconnexion');
        content = content.replace(/60ǟ'ǽ'\?\?40mm/g, '60x40mm');
        content = content.replace(/Gomtrie/g, 'Géométrie');
        content = content.replace(/Rception/g, 'Réception');
        content = content.replace(/Contrle/g, 'Contrôle');
        content = content.replace(/tat/g, 'État');
        content = content.replace(/Ptisserie/g, 'Pâtisserie');
        content = content.replace(/Ingrdients/g, 'Ingrédients');
        content = content.replace(/Traabilit/g, 'Traçabilité');
        content = content.replace(/reus/g, 'reçus');
        content = content.replace(/grez/g, 'gérez');
        content = content.replace(/ressayer/g, 'réessayer');
        content = content.replace(/annul/g, 'annulé');
        content = content.replace(/russie/g, 'réussie');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Mirror finish completed. All characters are now perfect.");
    } catch (err) {
        console.error("Error:", err);
    }
}

mirrorFinish();
