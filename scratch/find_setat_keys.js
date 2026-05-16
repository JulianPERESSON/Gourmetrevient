// find_setat_keys.js — Trouver d'où vient DASH.SETAT / dash.setat
const fs   = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');

const JS_FILES = fs.readdirSync(ROOT)
  .filter(f => f.endsWith('.js') || f.endsWith('.html'))
  .map(f => path.join(ROOT, f));

const RE = /[sS][eéÉE][tT][aA][tT]|dash\.s|dash\.\u00e9|dash\.stat|dash\.etat|\u00e9tat|setat|rentab|RENTAB/g;

for (const fp of JS_FILES) {
  const src = fs.readFileSync(fp, 'utf8');
  const lines = src.split('\n');
  let found = false;
  lines.forEach((line, i) => {
    if (/setat|etat|rentab|dash\.[a-z]/i.test(line) && /t\(|data-i18n|label/i.test(line)) {
      if (!found) { console.log('\n=== ' + path.basename(fp) + ' ==='); found = true; }
      console.log(`  ${i+1}: ${line.trim().slice(0, 140)}`);
    }
  });
}

// Chercher aussi dans i18n.js les clés qui ressemblent à STAT
const i18n = fs.readFileSync(path.join(ROOT, 'i18n.js'), 'utf8');
console.log('\n=== Clés dans i18n.js avec stat/etat/rentab ===');
const i18nLines = i18n.split('\n');
i18nLines.forEach((line, i) => {
  if (/['"](dash|stat|etat|rentab)[.'"]/i.test(line)) {
    console.log(`  ${i+1}: ${line.trim().slice(0, 140)}`);
  }
});
