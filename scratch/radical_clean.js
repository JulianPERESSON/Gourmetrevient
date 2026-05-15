const fs = require('fs');

function radicalClean() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Target the specific loading screen corruption
        content = content.replace(/PÀ¢TISSERIE/g, 'PÂTISSERIE');
        content = content.replace(/pà¢tissier/g, 'pâtissier');
        content = content.replace(/Pà¢tisserie/g, 'Pâtisserie');
        content = content.replace(/pà¢tisserie/g, 'pâtisserie');
        
        // 2. Comprehensive cleanup of any other weird characters
        const replacements = {
            'À¢': 'Â',
            'pà¢': 'pâ',
            'Pà¢': 'Pâ',
            'Â¢': 'Â',
            'Ã‚Â ': ' ', // Clean up weird spaces
            'Ã‚': ''    // Clean up floating fragments
        };

        for (const [key, val] of Object.entries(replacements)) {
            content = content.split(key).join(val);
        }

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Radical cleanup completed. No more corrupted characters allowed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

radicalClean();
