const fs = require('fs');

function fixGateaux() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        content = content.replace(/gteau/g, 'gâteau');
        content = content.replace(/gteaux/g, 'gâteaux');
        content = content.replace(/matrise/g, 'maîtrise');
        content = content.replace(/cot/g, 'coût');
        content = content.replace(/ptissier/g, 'pâtissier');
        content = content.replace(/ptissière/g, 'pâtissière');
        content = content.replace(/ptisserie/g, 'pâtisserie');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Common French characters (gâteaux, maîtrise, coût) fixed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixGateaux();
