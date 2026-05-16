const fs = require('fs');
const path = require('path');

const filesToClean = ['index.html', 'app.js', 'auth-ui.js', 'pro-features.js', 'i18n.js', 'landing.html', 'blog.html'];

const replacements = [
    // Complex patterns reported by user
    { from: "pà¢tissiers", to: "pâtissiers" },
    { from: "œuvre", to: "Œuvre" },
    { from: "cà´tés", to: "côtés" },
    { from: "Å“Å\"", to: "Œ" },
    { from: "½", to: "é" }, // Usually é in this context
    { from: "¥§", to: "à" },
    { from: "—", to: "à" },
    
    // Email correction
    { from: "contact@gourmetrevient.fr", to: "julian31.peresson@gmail.com" }
];

filesToClean.forEach(file => {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let originalContent = content;
        
        replacements.forEach(r => {
            while (content.includes(r.from)) {
                content = content.replace(r.from, r.to);
            }
        });
        
        if (content !== originalContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log(`Cleaned: ${file}`);
        }
    }
});
