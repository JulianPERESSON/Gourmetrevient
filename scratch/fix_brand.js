const fs = require('fs');

function fixBrand() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        // Fix logo icon and title
        content = content.replace(/<div class="logo-icon" aria-label="Logo GourmetRevient">[^<]+<\/div>/, '<div class="logo-icon" aria-label="Logo GourmetRevient">🧁</div>');
        content = content.replace(/<h1 title="GourmetRevient [^"]+">GourmetRevient<\/h1>/, '<h1 title="GourmetRevient — Retour à l\'accueil">GourmetRevient</h1>');
        content = content.replace('FranÃƒÆ’ÂÂ§ais', 'Français');
        content = content.replace('EspaÃƒÆ’±ol', 'Español');
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Brand fixed successfully");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixBrand();
