const fs = require('fs');

function deepRepair() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        const repairs = [
            // Ordonnancement
            { from: /Stratgie & <span class="accent">Ordonnanceur CAP<\/span>/, to: 'Stratégie & <span class="accent">Ordonnanceur CAP</span>' },
            { from: /Matrisez votre temps/, to: 'Maîtrisez votre temps' },
            { from: /épreuve/, to: 'épreuve' },
            { from: /sujets/, to: 'sujets' },
            { from: /Chronogramme/, to: 'Chronogramme' },
            
            // Logistique / Suppliers
            { from: /Radar Logistique/, to: 'Radar Logistique' },
            { from: /Grez les passages/, to: 'Gérez les passages' },
            { from: /Grossiste/, to: 'Grossiste' },
            { from: /Marchandises/, to: 'Marchandises' },
            { from: /Rception/, to: 'Réception' },
            { from: /Fournisseurs/, to: 'Fournisseurs' },
            
            // About / Chef d'Oeuvre
            { from: /Chef d'ǟ\?ǽ'"uvre/, to: "Chef d'Œuvre" },
            { from: /Ralis en tant que/, to: 'Réalisé en tant que' },
            { from: /Mtiers et de l'Artisanat/, to: "Métiers et de l'Artisanat" },
            { from: /viabilit commerciale/, to: 'viabilité commerciale' },
            { from: /mtiers de bouche/, to: 'métiers de bouche' },
            { from: /À propos du projet/, to: 'À propos du projet' },
            { from: /électricit/, to: 'électricité' },
            
            // Common UI
            { from: /Prnom/, to: 'Prénom' },
            { from: / Email/, to: '📧 Email' },
            { from: /Dconnexion/, to: 'Déconnexion' },
            { from: /rcupration/, to: 'récupération' },
            { from: / l'cole/, to: "à l'école" }
        ];

        repairs.forEach(r => {
            content = content.replace(new RegExp(r.from, 'g'), r.to);
        });

        // Specific fix for "Chef d'Oeuvre" weirdness
        content = content.replace(/Chef d'ǟ\?ǽ'"uvre/g, "Chef d'Œuvre");
        content = content.replace(/Mtiers/g, "Métiers");

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Deep repair of Ordonnancement, Logistics and About sections completed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

deepRepair();
