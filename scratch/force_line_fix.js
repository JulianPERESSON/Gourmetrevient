const fs = require('fs');

function forceLineFix() {
    try {
        let lines = fs.readFileSync('index.html', 'utf8').split('\n');

        for (let i = 0; i < lines.length; i++) {
            // Fix the splash tagline
            if (lines[i].includes('splash-tagline')) {
                lines[i] = '    <div class="splash-tagline">L\'ART DE LA PÂTISSERIE</div>';
            }
            // Fix hero title
            if (lines[i].includes('hero.title')) {
                lines[i] = '        <h2 data-i18n="hero.title">Calculateur de <span class="accent">recettes</span><br>pour la pâtisserie</h2>';
            }
            // Fix portfolio bio
            if (lines[i].includes('portfolio.bio.passion_title')) {
                lines[i] = '                    <strong data-i18n="portfolio.bio.passion_title">Pâtisserie & Digital</strong>';
            }
        }

        fs.writeFileSync('index.html', lines.join('\n'), 'utf8');
        console.log("Forced line replacement for critical UI text completed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

forceLineFix();
