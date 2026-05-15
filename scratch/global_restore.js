const fs = require('fs');

const replacements = [
    // Layer 3 (Deep corruption)
    [/ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â/g, '🧁'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â³/g, '👨‍🍳'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…Â /g, '📊'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬â€œ/g, '📖'],
    [/ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â°/g, '🥐'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¦/g, '📦'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‹â€ /g, '📈'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã¢â‚¬Â¦/g, '📅'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬Â Ã‚Â¥/g, '🔥'],
    [/ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Âª/g, '🚪'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â³/g, '💳'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¤/g, '👤'],
    [/ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â /g, '🏠'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬ÂºÃ‚Â¡ÃƒÂ¯Ã‚Â¸Ã‚Â/g, '🛡️'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â/g, '📍'],
    [/ÃƒÂ°Ã…Â¸Ã…Â¡Ã¢â€šÂ¬/g, '🚀'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¹/g, '🎥'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â°/g, '💰'],
    [/ÃƒÂ°Ã…Â¸Ã…Â½Ã¢â‚¬Å“/g, '🎓'],
    [/ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â¬/g, '💬'],
    [/ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â /g, '🧠'],
    [/ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â /g, '🧠'],
    [/ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â¡/g, '🧡'],
    [/ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Âµ/g, '💡'],
    
    // Layer 2 (Standard corruption)
    [/ÃƒÆ’Ã‚Â©/g, 'é'],
    [/ÃƒÆ’Ã‚Â¨/g, 'è'],
    [/ÃƒÆ’Ã‚Â /g, 'à'],
    [/ÃƒÆ’Ã‚Â«/g, 'ë'],
    [/ÃƒÆ’Ã‚Â®/g, 'î'],
    [/ÃƒÆ’Ã‚Â»/g, 'û'],
    [/ÃƒÆ’Ã‚Âª/g, 'ê'],
    [/ÃƒÆ’Ã‚Â§/g, 'ç'],
    [/ÃƒÆ’Ã‚Â´/g, 'ô'],
    [/ÃƒÆ’Ã‚Â¹/g, 'ù'],
    [/ÃƒÆ’Ã‚Â»/g, 'û'],
    [/ÃƒÆ’Ã¢â‚¬Â°/g, 'É'],
    [/ÃƒÆ’Ã¢â€šÂ¬/g, 'À'],
    
    // Punctuation & Specials
    [/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢/g, '•'],
    [/ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â/g, '—'],
    [/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦/g, '...'],
    [/ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢/g, '→'],
    [/ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Ëœ/g, '↑'],
    [/ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¼/g, '▼'],
    [/ÃƒÂ¢Ã‚Â Ã‚Â³/g, '⏳'],
    [/ÃƒÂ¢Ã…â€œÃ¢â‚¬Â¢/g, '✖'],
    [/ÃƒÂ¢Ã¢â‚¬Â¢Ã‚Â/g, '·'],
    
    // Clean up stubborn debris
    [/Ã‚Â/g, ''],
    [/Ãƒâ€š/g, ''],
    [/Ãƒâ€°/g, 'É'],
    [/ÃƒÂ /g, 'à'],
    [/ÃƒÂ©/g, 'é'],
    [/ÃƒÂ¨/g, 'è']
];

function globalRestore() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        console.log("Starting global restoration...");
        
        for (const [regex, replacement] of replacements) {
            content = content.replace(regex, replacement);
        }
        
        // Final polish for words found in screenshot
        content = content.replace(/QualitÃ©/g, 'Qualité');
        content = content.replace(/Pertes/g, 'Pertes');
        content = content.replace(/Ã‰rosion/g, 'Érosion');
        content = content.replace(/RÃ©partition/g, 'Répartition');
        content = content.replace(/Analyse/g, 'Analyse');
        content = content.replace(/MÃ©tier/g, 'Métier');
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Global restoration complete!");
    } catch (err) {
        console.error("Critical error during restoration:", err);
    }
}

globalRestore();
