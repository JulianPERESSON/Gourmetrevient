// scan_dash_stats.js — Trouve les clés PRODUCTION/ALERTS/RENTABILITY dans les fichiers du projet
const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const FILES = [
  'dashboard-premium.js',
  'commercial-features.js',
  'core-upgrade.js',
  'app.js',
  'i18n.js',
  'index.html',
];

const PATTERNS = [
  /PRODUCTION/i, /RENTAB/i, /ALERT/i, /PLANIF/i,
  /DASH\.S/i, /stat.*card/i, /dash.*stat/i,
  /data-i18n/i, /t\(['"][^'"]{3,}['"]\)/,
];

for (const fname of FILES) {
  const fp = path.join(ROOT, fname);
  if (!fs.existsSync(fp)) { console.log(`[SKIP] ${fname}`); continue; }
  const lines = fs.readFileSync(fp, 'utf8').split('\n');
  let printed = false;
  lines.forEach((line, i) => {
    if (PATTERNS.some(re => re.test(line))) {
      if (!printed) { console.log(`\n=== ${fname} ===`); printed = true; }
      console.log(`  ${i+1}: ${line.trim().slice(0, 130)}`);
    }
  });
}
