const fs = require('fs');

const finalFixMap = {
    // Quality Tab Icons
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬â€œ ÃƒÂ¯¸ ': '✍️',
    'ÃƒÂ¢Ã…Â¡Ã¢â‚¬â€œÃƒÂ¯¸ ': '⚖️',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã…â€œ': '📜',
    
    // Inventory / CRM / Other Icons
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â¹': '🎥',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â ': '📍',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â°': '💰',
    'ÃƒÂ°Ã…Â¸Ã‚Â§Ã‚Â ': '🧠',
    'ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Âµ': '💡',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬Â Ã‚Â¥': '🔥',
    'ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â°': '🥐',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â³': '👨‍🍳',
    
    // Common Corruptions
    'ÃƒÆ’Ã¢â‚¬Â°': 'É',
    'ÃƒÆ’Ã‚Â©': 'é',
    'ÃƒÆ’Ã‚Â¨': 'è',
    'ÃƒÆ’Ã‚Â ': 'à',
    'ÃƒÆ’Ã‚Âª': 'ê',
    'ÃƒÆ’Ã‚Â§': 'ç',
    'ÃƒÆ’Ã‚Â«': 'ë',
    'ÃƒÆ’Ã‚Â®': 'î',
    'ÃƒÆ’Ã‚Â´': 'ô',
    'ÃƒÆ’Ã‚Â¹': 'ù',
    'ÃƒÆ’Ã‚Â»': 'û',
    
    // Layered garbage
    'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¢': '•',
    'ÃƒÂ¢Ã¢â€šÂ¬Ã¢â‚¬Â': '—',
    'ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â¦': '...',
    'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬â„¢': '→',
    'ÃƒÂ¢Ã¢â‚¬Â Ã¢â‚¬Ëœ': '↑',
    'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¼': '▼',
    
    // Specific words found in screenshot
    'ÃƒÆ’Ã¢â‚¬Â°rosion': 'Érosion',
    'Valeur des pertes': 'Valeur des pertes',
    'Rapport d\'Analyse': 'Rapport d\'Analyse',
    'RÃ©partition par Cause': 'Répartition par Cause',
    'PrioritÃ©s du Jour': 'Priorités du Jour'
};

function deepClean() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        console.log("Starting deep clean...");
        
        const sortedKeys = Object.keys(finalFixMap).sort((a, b) => b.length - a.length);
        for (const key of sortedKeys) {
            content = content.split(key).join(finalFixMap[key]);
        }
        
        // Clean up remaining mojibake patterns
        content = content.replace(/ÃƒÂ[^\s<"]+/g, (match) => {
            // If we find a long sequence of garbage, try to see if it's a known one
            // or just remove it if it's too broken
            return ''; 
        });

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Deep clean complete!");
    } catch (err) {
        console.error("Error during deep clean:", err);
    }
}

deepClean();
