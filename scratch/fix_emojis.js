const fs = require('fs');

const replacements = {
    'Ã°Å¸â€™Å½': '💎',
    'âËœ€ïÂ¸Â': '☀️',
    'Ã°Å¸Å’™': '🌙',
    'Ã°Å¸â€˜Â¨“Â Ã°Å¸Â ³': '👨‍🍳',
    'Ã°Å¸â€˜Â¨“Â Ã°Å¸Â ³': '👨‍🍳',
    'Ã°Å¸â€˜Â¤': '👤',
    'Ã°Å¸€™³': '💳',
    'Ã°Å¸Â¡ÂÂª': '🚪',
    'Ã°Ã…Â¸“Å“ÂÂ ': '📍',
    'Ã°Ã…Â¸“ËœÂÂ¨âââ€šÂ¬ÂÂ Ã°Ã…Â¸ÂÂ ³': '👨‍🍳',
    'Ã°Ã…Â¸“ËœÂÂ¨âââ€šÂ¬ÂÂ Ã°Ã…Â¸ÂÂ ³': '👨‍🍳',
    'Ã°Ã…Â¸Ã…Â¡ÂÂª': '🚪',
    'Ã°Ã…Â¸’³': '💳',
    'Ã°Ã…Â¸“ËœÂÂ¤': '👤',
    'Ã°Ã…Â¸“Å¡©': '🏠',
    'Ã°Ã…Â¸“Å¡ÂÂ ': '🏠',
    'ðŸ  ': '🏠',
    'ðŸ“Š': '📊',
    'ðŸ‘¨â€ ðŸ ³': '👨‍🍳',
    'ðŸ›¡ï¸ ': '🛡️',
    'ðŸ“ ': '📍',
    'â“¼': '▼',
    'â–¼': '▼'
};

function fixEncoding() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        for (const [scrambled, correct] of Object.entries(replacements)) {
            content = content.split(scrambled).join(correct);
        }
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Encoding fixed successfully");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixEncoding();
