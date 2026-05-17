const fs = require('fs');

let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/Ééquipe/g, 'Équipe');
index = index.replace(/Ééquipement/g, 'Équipement');
index = index.replace(/<title>GourmetRevient —  Le Copilote/g, '<title>GourmetRevient — 🧁 Le Copilote');
index = index.replace(/Cloud : Actif/g, '☁️ 🟢');
fs.writeFileSync('index.html', index, 'utf8');

let landing = fs.readFileSync('landing.html', 'utf8');
landing = landing.replace(/<title>GourmetRevient — Le Copilote/g, '<title>GourmetRevient — 🧁 Le Copilote');
landing = landing.replace(/Ééquipe/g, 'Équipe');
landing = landing.replace(/Ééquipement/g, 'Équipement');
fs.writeFileSync('landing.html', landing, 'utf8');

let dash = fs.readFileSync('dashboard-premium.js', 'utf8');
dash = dash.replace(/text\.textContent = isOnline \? 'Cloud Sync : Actif' : 'Mode Hors Ligne';/, "text.textContent = isOnline ? '☁️ 🟢' : '☁️ 🔴';");
fs.writeFileSync('dashboard-premium.js', dash, 'utf8');

console.log('Fixed everything!');
