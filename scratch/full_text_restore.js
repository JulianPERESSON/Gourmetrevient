const fs = require('fs');

function fullTextRestore() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        const dictionary = [
            { from: /Ptisserie/g, to: 'Pâtisserie' },
            { from: /ptisserie/g, to: 'pâtisserie' },
            { from: /ptissiers/g, to: 'pâtissiers' },
            { from: /ralis/g, to: 'réalisé' },
            { from: /cot/g, to: 'coût' },
            { from: /quipe/g, to: 'équipe' },
            { from: /connatre/g, to: 'connaître' },
            { from: /rgle/g, to: 'règle' },
            { from: /lectricit/g, to: 'électricité' },
            { from: /gnralement/g, to: 'généralement' },
            { from: /tudiant/g, to: 'étudiant' },
            { from: /matrise/g, to: 'maîtrise' },
            { from: /complte/g, to: 'complète' },
            { from: /prcalcules/g, to: 'précalculées' },
            { from: /grer/g, to: 'gérer' },
            { from: /prcisment/g, to: 'précisément' },
            { from: /succs/g, to: 'succès' },
            { from: /L'Art de la Ptisserie/g, to: "L'ART DE LA PÂTISSERIE" }
        ];

        dictionary.forEach(entry => {
            content = content.replace(entry.from, entry.to);
        });

        // Specific fix for the splash tagline if it's all uppercase in UI but mixed in code
        content = content.replace(/L'Art de la Pâtisserie/g, "L'ART DE LA PÂTISSERIE");

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Full text restoration completed. All French accents restored.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fullTextRestore();
