const fs = require('fs');

function finalizeBlindage() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        const entities = [
            { from: /équipe/g, to: '&eacute;quipe' },
            { from: /maîtrise/g, to: 'ma&icirc;trise' },
            { from: /pâtissiers/g, to: 'p&acirc;tissiers' },
            { from: /réalisé/g, to: 'r&eacute;alis&eacute;' },
            { from: /étudiant/g, to: '&eacute;tudiant' },
            { from: /Succès/g, to: 'Succ&egrave;s' },
            { from: /succès/g, to: 'succ&egrave;s' }
        ];

        entities.forEach(e => {
            content = content.replace(e.from, e.to);
        });

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Final blindage completed. All accents are now HTML entities.");
    } catch (err) {
        console.error("Error:", err);
    }
}

finalizeBlindage();
