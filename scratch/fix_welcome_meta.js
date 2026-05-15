const fs = require('fs');

function fixWelcomeAndMeta() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Fix the broken Logo in the Login/Welcome screen
        // Looking for the pattern shown in screenshot: emoji + broken chars
        content = content.replace(/🤴 ▯▯³/g, '🤴 <span style="font-family:var(--font-display); font-weight:900; color:var(--primary);">Gourmet<span style="color:var(--accent);">Revient</span></span>');
        
        // Also check for other variations of broken logo
        content = content.replace(/🤴 GOURMETREVIENT/g, '🤴 GourmetRevient');

        // 2. Update Meta Descriptions
        content = content.replace(/destinée aux restaurateurs/g, 'destinée aux pâtissiers et artisans de bouche');
        content = content.replace(/pour les restaurateurs/g, 'pour les pâtissiers');
        content = content.replace(/Gestion de restaurant/g, 'Gestion de laboratoire de pâtisserie');
        
        // Final polish on the welcome text
        content = content.replace(/Bienvenue dans votre Laboratoire/g, 'Bienvenue dans votre <span class="accent">Laboratoire</span>');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Welcome screen logo and meta descriptions fixed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixWelcomeAndMeta();
