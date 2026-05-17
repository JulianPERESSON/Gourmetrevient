const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');
content = content.replace(/<link rel="icon" href="[^>]+>[\s\S]*?<title>[^<]+<\/title>/, '<link rel="icon" href="data:image/svg+xml,<svg xmlns=\\"http://www.w3.org/2000/svg\\" viewBox=\\"0 0 100 100\\"><text y=\\".9em\\" font-size=\\"90\\">🧁</text></svg>">\n  <title>GourmetRevient — 🧁 Le Copilote des Artisans Pâtissiers</title>');
fs.writeFileSync('index.html', content, 'utf8');
console.log('Fixed index.html head!');
