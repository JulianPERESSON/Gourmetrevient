const fs = require('fs');

function finalFix() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        // Use a very specific replacement for the broken chef emoji
        content = content.replace(/👨âââ€šÂ¬ÂÂ Ã°Ã…Â¸ÂÂ ³/g, '👨‍🍳');
        content = content.replace(/👨“Â Ã°Å¸Â ³/g, '👨‍🍳');
        
        // General cleanup of any remaining àsequences
        content = content.replace(/âââ€šÂ¬ÂÂ/g, '');
        content = content.replace(/Ã°Ã…Â¸ÂÂ/g, '');
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Final fix complete");
    } catch (err) {
        console.error("Error:", err);
    }
}

finalFix();
