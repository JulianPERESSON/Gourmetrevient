const fs = require('fs');

function fixAuthLogoAndSEO() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Fix the corrupted logo in auth modal (Line 1185 approx)
        content = content.replace(/<div class="auth-modal-logo">.*?<\/div>/g, '<div class="auth-modal-logo">🤴 <span style="font-family:var(--font-display); font-weight:900;">Gourmet<span style="color:var(--accent);">Revient</span></span></div>');

        // 2. Fix Favicon emoji (Line 7 approx)
        content = content.replace(/<text y=".9em" font-size="90">.*?<\/text>/g, '<text y=".9em" font-size="90">👨‍🍳</text>');

        // 3. Update all Meta/SEO descriptions to remove "restaurateurs"
        content = content.replace(/artisans ptissiers : calcul/g, 'artisans pâtissiers : calcul');
        content = content.replace(/Logiciel SaaS professionnel pour ptissiers/g, 'Logiciel SaaS professionnel pour pâtissiers');
        
        // Comprehensive meta replacement
        const metaPattern = /content="Logiciel de gestion tout-en-un pour artisans p.*?pâtissiers : calcul de co.*?t de revient, conformit.*? HACCP, planning d'.*?quipe et agencement de laboratoire\."/g;
        const metaReplacement = 'content="Logiciel de gestion tout-en-un pour artisans pâtissiers : calcul de coût de revient, conformité HACCP, planning d\'équipe et agencement de laboratoire professionnel."';
        content = content.replace(metaPattern, metaReplacement);

        // 4. Cleanup any remaining diamond questions in the header area
        content = content.replace(/Le Copilote des Artisans Ptissiers/g, 'Le Copilote des Artisans Pâtissiers');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Auth logo, Favicon and SEO descriptions updated successfully.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixAuthLogoAndSEO();
