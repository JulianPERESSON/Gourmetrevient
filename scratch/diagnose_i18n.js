// diagnose_i18n.js — Diagnostic du problème d'affichage des clés i18n brutes
const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

// ── 1. Lire i18n.js et extraire toutes les clés DASH et les traductions FR ─
const i18nSrc = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');

// Chercher les blocs fr: { ... }
const frMatch = i18nSrc.match(/\bfr\s*:\s*\{([\s\S]{1,200000}?)\},?\s*\n\s*(?:en|de|es|it|nl|pt)\s*:/);
const frBlock = frMatch ? frMatch[1] : '';

// Clés de type DASH.xxx
const dashKeys = [...frBlock.matchAll(/['"]([A-Z][A-Z0-9_.]{2,60})['"]\s*:/g)]
  .map(m => m[1])
  .filter(k => k.includes('.'));

console.log('=== Clés dotted dans fr{} :', dashKeys.length);
dashKeys.slice(0, 30).forEach(k => console.log('  ', k));

// ── 2. Chercher les clés affichées dans la capture écran ──────────────────
const KEYS_TO_FIND = [
  'DASH.SETAT.PRODUCTION', 'DASH.STAT.PRODUCTION',
  'DASH.SETAT.ALERTS',     'DASH.STAT.ALERTS',
  'DASH.SETAT.RENTABILITY','DASH.STAT.RENTABILITY',
  'SETAT', 'STAT.PRODUCTION', 'STAT.ALERTS',
  'production', 'rentab', 'alerts',
];

console.log('\n=== Recherche dans i18n.js :');
for (const k of KEYS_TO_FIND) {
  if (i18nSrc.includes(k)) console.log('  TROUVÉ:', k);
}

// ── 3. Chercher les appels t() ou i18n() dans app.js ─────────────────────
const appSrc = fs.readFileSync(path.join(ROOT, 'app.js'), 'utf8');
const lines  = appSrc.split('\n');

console.log('\n=== Lignes app.js avec clés de stat/dash :');
lines.forEach((line, i) => {
  if (/DASH\.|SETAT|STAT\./.test(line)) {
    console.log(`  ${i+1}: ${line.trim().slice(0, 120)}`);
  }
});

// ── 4. Chercher dans index.html ───────────────────────────────────────────
const htmlSrc = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const htmlLines = htmlSrc.split('\n');

console.log('\n=== Lignes index.html avec clés de stat/dash :');
htmlLines.forEach((line, i) => {
  if (/DASH\.|SETAT|STAT\./.test(line)) {
    console.log(`  ${i+1}: ${line.trim().slice(0, 120)}`);
  }
});

// ── 5. Chercher le rendu des KPI cards dans app.js ───────────────────────
console.log('\n=== KPI card rendering dans app.js :');
lines.forEach((line, i) => {
  if (/kpi|stat.card|dashboard.stat|stat-label|\.label|labelKey/i.test(line)) {
    console.log(`  ${i+1}: ${line.trim().slice(0, 120)}`);
  }
});
