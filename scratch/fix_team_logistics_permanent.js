const fs = require('fs');

let dash = fs.readFileSync('dashboard-premium.js', 'utf8');

// 1. Remove deliveries seeding
dash = dash.replace(/const deliveries = JSON\.parse\(localStorage\.getItem\('gourmet_deliveries'\) \|\| '\[\]'\);\s*if \(deliveries\.length === 0\) \{[\s\S]*?\n\s*\}/, `const deliveries = JSON.parse(localStorage.getItem('gourmet_deliveries') || '[]');`);

// 2. Remove demo team seeding
dash = dash.replace(/const team = JSON\.parse\(localStorage\.getItem\(teamKey\) \|\| '\[\]'\);\s*if \(team\.length === 0 && isDemo\) \{[\s\S]*?\n\s*\}/, `const team = JSON.parse(localStorage.getItem(teamKey) || '[]');`);

fs.writeFileSync('dashboard-premium.js', dash, 'utf8');
console.log('Successfully removed demo team and deliveries seeding from dashboard-premium.js!');
