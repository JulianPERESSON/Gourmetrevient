const fs = require('fs');

const replacements = {
    'Ã°Å¸â€™Å½': '💎',
    'Ã¢Ëœâ‚¬Ã¯Â¸Â': '☀️',
    'Ã°Å¸Å’â„¢': '🌙',
    'Ã°Å¸â€˜Â¨Ã¢â‚¬Â Ã°Å¸Â Â³': '👨‍🍳',
    'Ã°Å¸â€˜Â¨Ã¢â‚¬Â Ã°Å¸Â Â³': '👨‍🍳',
    'Ã°Å¸â€˜Â¤': '👤',
    'Ã°Å¸â‚¬â„¢Ã‚Â³': '💳',
    'Ã°Å¸Â¡Ã‚Âª': '🚪',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å“Ã‚Â ': '📍',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â³': '👨‍🍳',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â³': '👨‍🍳',
    'ÃƒÂ°Ã…Â¸Ã…Â¡Ã‚Âª': '🚪',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬â„¢Ã‚Â³': '💳',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬ËœÃ‚Â¤': '👤',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å¡Ã‚Â©': '🏠',
    'ÃƒÂ°Ã…Â¸Ã¢â‚¬Å¡Ã‚Â ': '🏠',
    'ðŸ  ': '🏠',
    'ðŸ“Š': '📊',
    'ðŸ‘¨â€ ðŸ ³': '👨‍🍳',
    'ðŸ›¡ï¸ ': '🛡️',
    'ðŸ“ ': '📍',
    'ÃƒÂ¢Ã¢â‚¬â€œÃ‚Â¼': '▼',
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
