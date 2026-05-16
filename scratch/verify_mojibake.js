// verify_mojibake.js — Vérifie s'il reste des mojibake dans les fichiers principaux
const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

const MAINS = [
  'app.js','i18n.js','auth-ui.js','commercial-features.js',
  'creative-tools.js','advanced-modules.js','dashboard-premium.js',
  'pro-features.js','core-upgrade.js','analytics-interactive.js',
  'lab-logic.js','crm-enhanced-v2.js','crm-enhanced.js','onboarding.js',
  'tool-guide.js','equipment.js','master-converter.js','billing.js',
  'billing-pdf.js','cloud-sync.js','security.js','support-service.js',
  'premium-effects.js','rgpd-banner.js','supabase-sync.js',
  'index.html','landing.html','blog.html','legal.html',
  'confirmation.html','success.html','404.html',
  'styles.css',
];

// Patterns mojibake détectables — encodés en \uXXXX pour éviter les problèmes de parsing
const BAD_PATTERNS = [
  '\u00c3\u00a9',  // Ã©
  '\u00c3\u00a8',  // Ã¨
  '\u00c3\u00aa',  // Ãª
  '\u00c3\u00a0',  // Ã 
  '\u00c3\u00a2',  // Ã¢
  '\u00c3\u00b4',  // Ã´
  '\u00c3\u00a7',  // Ã§
  '\u00c3\u00bb',  // Ã»
  '\u00c3\u00b9',  // Ã¹
  '\u00c3\u00ae',  // Ã®
  '\u00c3\u2030',  // Ã‰
  '\u00c3\u02c6',  // Ãˆ
  '\u00c3\u20ac',  // Ã€
  '\u00c3\u2021',  // Ã‡
  '\u00c3\u00b1',  // Ã±
  '\u00c3\u0192\u00e2\u20ac',  // ÃƒÆ'â€ (triple)
  '\u00c3\u0192\u00c2',        // ÃƒÂ  (double)
  '\u00c2\u00b0',  // Â°
  '\u00e2\u20ac\u2122',        // â€™
  '\u00e2\u20ac\u201c',        // â€"
  '\u00e2\u20ac\u009d',        // â€
  '\u00e2\u20ac\u0153',        // â€œ
  '\u00e2\u20ac\u00a6',        // â€¦
  '\u00e2\u20ac\u00a2',        // â€¢
  '\u00e2\u20ac\u02dc',        // â€˜
  '\u00e2\u201a\u00ac',        // â‚¬
  '\u00e2\u201e\u00a2',        // â„¢
];

let totalBad = 0;

for (const fname of MAINS) {
  const fp = path.join(ROOT, fname);
  if (!fs.existsSync(fp)) continue;

  let txt;
  try { txt = fs.readFileSync(fp, 'utf8'); }
  catch(e) { console.log(`  [SKIP] ${fname}: ${e.message}`); continue; }

  const hits = [];
  for (const pat of BAD_PATTERNS) {
    if (txt.includes(pat)) {
      const idx = txt.indexOf(pat);
      const ctx = txt.slice(Math.max(0, idx - 15), idx + pat.length + 15)
                     .replace(/\n/g, ' ').replace(/\r/g, '');
      hits.push(`  ⚠ "${pat}" → contexte: "${ctx}"`);
    }
  }

  if (hits.length > 0) {
    console.log(`\nMOJIBAKE in ${fname}:`);
    hits.forEach(h => console.log(h));
    totalBad++;
  }
}

if (totalBad === 0) {
  console.log('\n✅ Aucun mojibake détecté dans les fichiers principaux !\n');
} else {
  console.log(`\n⚠️  ${totalBad} fichier(s) encore affecté(s)\n`);
}
