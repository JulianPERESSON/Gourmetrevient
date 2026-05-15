const fs = require('fs');

function htmlEntityFix() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // Replace with HTML Entities to be 100% browser-safe
        content = content.replace(/L'ART DE LA P.*?TISSERIE/g, "L'ART DE LA P&Acirc;TISSERIE");
        content = content.replace(/pâtisserie/g, "p&acirc;tisserie");
        content = content.replace(/Pâtisserie/g, "P&acirc;tisserie");
        content = content.replace(/coût/g, "co&ucirc;t");
        content = content.replace(/gâteau/g, "g&acirc;teau");
        content = content.replace(/gâteaux/g, "g&acirc;teaux");

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("HTML Entities applied for French accents. This should be 100% stable.");
    } catch (err) {
        console.error("Error:", err);
    }
}

htmlEntityFix();
