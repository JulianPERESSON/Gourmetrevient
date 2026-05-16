const fs = require('fs');

const finalFixMap = {
    // Quality Tab Icons
    'Ã°Ã…Â¸“ ï¸ ': '✍️',
    'âÃ…Â¡“ï¸ ': '⚖️',
    'Ã°Ã…Â¸“Å“Ã…â€œ': '📜',
    
    // Inventory / CRM / Other Icons
    'Ã°Ã…Â¸“Å“ÂÂ¹': '🎥',
    'Ã°Ã…Â¸“Å“ÂÂ ': '📍',
    'Ã°Ã…Â¸’°': '💰',
    'Ã°Ã…Â¸ÂÂ§Â  ': '🧠',
    'Ã°Ã…Â¸ÂÂ ÂÂµ': '💡',
    'Ã°Ã…Â¸“Â ÂÂ¥': '🔥',
    'Ã°Ã…Â¸ÂÂ °': '🥐',
    'Ã°Ã…Â¸“ËœÂÂ¨âââ€šÂ¬ÂÂ Ã°Ã…Â¸ÂÂ ³': '👨‍🍳',
    
    // Common Corruptions
    'ÃƒÆ’“°': 'É',
    'ÃƒÆ’©': 'é',
    'ÃƒÆ’ÂÂ¨': 'è',
    'ÃƒÆ’ÂÂ ': 'à',
    'ÃƒÆ’ÂÂª': 'ê',
    'ÃƒÆ’ÂÂ§': 'ç',
    'ÃƒÆ’«': 'ë',
    'ÃƒÆ’®': 'î',
    'ÃƒÆ’ÂÂ´': 'ô',
    'ÃƒÆ’ÂÂ¹': 'ù',
    'ÃƒÆ’»': 'û',
    
    // Layered garbage
    'âââ€šÂ¬ÂÂ¢': '•',
    'âââ€šÂ¬“Â': '—',
    'âââ€šÂ¬ÂÂ¦': '...',
    'â“  ’': '→',
    'â“  “Ëœ': '↑',
    'â“¼': '▼',
    
    // Specific words found in screenshot
    'ÃƒÆ’“°rosion': 'Érosion',
    'Valeur des pertes': 'Valeur des pertes',
    'Rapport d\'Analyse': 'Rapport d\'Analyse',
    'Répartition par Cause': 'Répartition par Cause',
    'Priorités du Jour': 'Priorités du Jour'
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
        content = content.replace(/Ã[^\s<"]+/g, (match) => {
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
