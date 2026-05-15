const fs = require('fs');

function finalFix() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        // Use a very specific replacement for the broken chef emoji
        content = content.replace(/👨ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â ÃƒÂ°Ã…Â¸Ã‚Â Ã‚Â³/g, '👨‍🍳');
        content = content.replace(/👨Ã¢â‚¬Â Ã°Å¸Â Â³/g, '👨‍🍳');
        
        // General cleanup of any remaining ÃƒÂ sequences
        content = content.replace(/ÃƒÂ¢Ã¢â€šÂ¬Ã‚Â/g, '');
        content = content.replace(/ÃƒÂ°Ã…Â¸Ã‚Â/g, '');
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Final fix complete");
    } catch (err) {
        console.error("Error:", err);
    }
}

finalFix();
