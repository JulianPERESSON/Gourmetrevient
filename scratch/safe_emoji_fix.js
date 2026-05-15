const fs = require('fs');

function safeEmojiFix() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // Use HTML Entities to prevent encoding issues with emojis
        // 129332 is Prince/Chef (🤴)
        content = content.replace(/<div class="auth-modal-logo">.*?<\/div>/g, '<div class="auth-modal-logo">&#129332; <span style="font-family:var(--font-display); font-weight:900;">Gourmet<span style="color:var(--accent);">Revient</span></span></div>');

        // 128104 8205 127859 is Pastry Chef (👨‍🍳)
        content = content.replace(/<text y=".9em" font-size="90">.*?<\/text>/g, '<text y=".9em" font-size="90">&#128104;&#8205;&#127859;</text>');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Safe emoji entities applied to logo and favicon.");
    } catch (err) {
        console.error("Error:", err);
    }
}

safeEmojiFix();
