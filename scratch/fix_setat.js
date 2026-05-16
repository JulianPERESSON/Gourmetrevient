const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    { from: /sÉtat/g, to: 'stat' },
    { from: /SÉtats/g, to: 'Stats' },
    { from: /SÉtat/g, to: 'Stat' },
    { from: /éÉtats/g, to: 'états' },
    { from: /éÉtat/g, to: 'état' },
    { from: /ÉÉtats/g, to: 'États' },
    { from: /ÉÉtat/g, to: 'État' },
    { from: /dégusÉtation/g, to: 'dégustation' }
];

let fixedContent = content;
replacements.forEach(rep => {
    fixedContent = fixedContent.replace(rep.from, rep.to);
});

if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log('Fixed index.html');
} else {
    console.log('No changes needed for index.html');
}
