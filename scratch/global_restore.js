const fs = require('fs');

const replacements = [
    // Layer 3 (Deep corruption)
    [/Ã°Ã…Â¸ÂÂ§ÂÂ/g, '🧁'],
    [/Ã°Ã…Â¸“ËœÂÂ¨âââ€šÂ¬ÂÂ Ã°Ã…Â¸ÂÂ ³/g, '👨‍🍳'],
    [/Ã°Ã…Â¸“Å“Ã…  /g, '📊'],
    [/Ã°Ã…Â¸“Å““/g, '📖'],
    [/Ã°Ã…Â¸ÂÂ °/g, '🥐'],
    [/Ã°Ã…Â¸“Å“ÂÂ¦/g, '📦'],
    [/Ã°Ã…Â¸“Å“Ëâ€ /g, '📈'],
    [/Ã°Ã…Â¸“Å““Â¦/g, '📅'],
    [/Ã°Ã…Â¸“Â ÂÂ¥/g, '🔥'],
    [/Ã°Ã…Â¸Ã…Â¡ÂÂª/g, '🚪'],
    [/Ã°Ã…Â¸’³/g, '💳'],
    [/Ã°Ã…Â¸“ËœÂÂ¤/g, '👤'],
    [/Ã°Ã…Â¸ÂÂ Â  /g, '🏠'],
    [/Ã°Ã…Â¸“ÂºÂÂ¡ïÂÂ¸ÂÂ/g, '🛡️'],
    [/Ã°Ã…Â¸“Å“ÂÂ/g, '📍'],
    [/Ã°Ã…Â¸Ã…Â¡ââ€šÂ¬/g, '🚀'],
    [/Ã°Ã…Â¸“Å“ÂÂ¹/g, '🎥'],
    [/Ã°Ã…Â¸’°/g, '💰'],
    [/Ã°Ã…Â¸Ã…½“Å“/g, '🎓'],
    [/Ã°Ã…Â¸’ÂÂ¬/g, '💬'],
    [/Ã°Ã…Â¸ÂÂ§Â  /g, '🧠'],
    [/Ã°Ã…Â¸ÂÂ§Â  /g, '🧠'],
    [/Ã°Ã…Â¸ÂÂ§ÂÂ¡/g, '🧡'],
    [/Ã°Ã…Â¸ÂÂ ÂÂµ/g, '💡'],
    
    // Layer 2 (Standard corruption)
    [/ÃƒÆ’©/g, 'é'],
    [/ÃƒÆ’ÂÂ¨/g, 'è'],
    [/ÃƒÆ’Â  /g, 'à'],
    [/ÃƒÆ’«/g, 'ë'],
    [/ÃƒÆ’®/g, 'î'],
    [/ÃƒÆ’»/g, 'û'],
    [/ÃƒÆ’ÂÂª/g, 'ê'],
    [/ÃƒÆ’ÂÂ§/g, 'ç'],
    [/ÃƒÆ’ÂÂ´/g, 'ô'],
    [/ÃƒÆ’ÂÂ¹/g, 'ù'],
    [/ÃƒÆ’»/g, 'û'],
    [/ÃƒÆ’“°/g, 'É'],
    [/ÃƒÆ’ââ€šÂ¬/g, 'À'],
    
    // Punctuation & Specials
    [/âââ€šÂ¬ÂÂ¢/g, '•'],
    [/âââ€šÂ¬“Â/g, '—'],
    [/âââ€šÂ¬ÂÂ¦/g, '...'],
    [/â“  ’/g, '→'],
    [/â“  “Ëœ/g, '↑'],
    [/â“¼/g, '▼'],
    [/âÂÂ ³/g, '⏳'],
    [/âÃ…â€œ“Â¢/g, '✖'],
    [/â“Â¢ÂÂ/g, '·'],
    
    // Clean up stubborn debris
    [/ÂÂ/g, ''],
    [/Ú/g, ''],
    [/Ãƒâ€°/g, 'É'],
    [/Ã /g, 'à'],
    [/é/g, 'é'],
    [/è/g, 'è']
];

function globalRestore() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        console.log("Starting global restoration...");
        
        for (const [regex, replacement] of replacements) {
            content = content.replace(regex, replacement);
        }
        
        // Final polish for words found in screenshot
        content = content.replace(/Qualité/g, 'Qualité');
        content = content.replace(/Pertes/g, 'Pertes');
        content = content.replace(/Érosion/g, 'Érosion');
        content = content.replace(/Répartition/g, 'Répartition');
        content = content.replace(/Analyse/g, 'Analyse');
        content = content.replace(/Métier/g, 'Métier');
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Global restoration complete!");
    } catch (err) {
        console.error("Critical error during restoration:", err);
    }
}

globalRestore();
