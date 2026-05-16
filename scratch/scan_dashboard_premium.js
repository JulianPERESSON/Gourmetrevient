// scan_dashboard_premium.js — Cherche les clés stat du cockpit dans dashboard-premium.js
const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const src = fs.readFileSync(path.join(ROOT, 'dashboard-premium.js'), 'utf8');
const lines = src.split('\n');

console.log('=== Lignes contenant PRODUCTION/RENTAB/ALERT/PLANIF/stat/kpi dans dashboard-premium.js ===');
lines.forEach((line, i) => {
  if (/PRODUCTION|RENTAB|ALERT|PLANIF|stat[_-]?label|kpi.*label|label.*kpi|data-i18n|\.label|setat|SETAT/i.test(line)) {
    console.log(`${i+1}: ${line.trim().slice(0, 140)}`);
  }
});

// Chercher les clés t('...') utilisées
const tCalls = [...src.matchAll(/t\(['"]([^'"]+)['"]\)/g)].map(m => m[1]);
const unique = [...new Set(tCalls)].sort();
console.log('\n=== Clés t() dans dashboard-premium.js (' + unique.length + ' uniques) ===');
unique.forEach(k => console.log(' ', k));
