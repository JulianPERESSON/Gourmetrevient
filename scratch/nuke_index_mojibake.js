// nuke_index_mojibake.js — Correction ciblée et agressive de index.html
const fs   = require('fs');
const path = require('path');

const fp = path.resolve(__dirname, '..', 'index.html');

// Lire le fichier en UTF-8
let txt = fs.readFileSync(fp, 'utf8');
const before = txt;

// ── 1. Table principale (ordre : plus long en premier) ─────────────────────
const TABLE = [
  // Triple-encodage Ãƒ Æ'
  ['\u00c3\u0192\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u20ac\u0161\u00c3\u2026\u00c3\u00a2\u00e2\u201a\u00ac\u00e2\u201e\u00a2uvre', '\u0153uvre'], // Ã¢â‚¬â„¢uvre
  // Double-encodage ÃƒÂ
  ['\u00c3\u0192\u00c2\u00a9', '\u00e9'], // é
  ['\u00c3\u0192\u00c2\u00a8', '\u00e8'], // è
  ['\u00c3\u0192\u00c2\u00aa', '\u00ea'], // ê
  ['\u00c3\u0192\u00c2\u00a0', '\u00e0'], // à
  ['\u00c3\u0192\u00c2\u00a2', '\u00e2'], // â
  ['\u00c3\u0192\u00c2\u00ae', '\u00ee'], // î
  ['\u00c3\u0192\u00c2\u00b4', '\u00f4'], // ô
  ['\u00c3\u0192\u00c2\u00a7', '\u00e7'], // ç
  ['\u00c3\u0192\u00c2\u00bb', '\u00fb'], // û
  ['\u00c3\u0192\u00c2\u00b9', '\u00f9'], // ù
  ['\u00c3\u0192\u00c2\u2030', '\u00c9'], // É
  ['\u00c3\u0192\u00c2\u02c6', '\u00c8'], // È
  ['\u00c3\u0192\u00c2\u20ac', '\u00c0'], // À
  ['\u00c3\u0192\u00c2\u2021', '\u00c7'], // Ç
  // Simple-encodage Ã
  ['\u00c3\u00a9', '\u00e9'], // é
  ['\u00c3\u00a8', '\u00e8'], // è
  ['\u00c3\u00aa', '\u00ea'], // ê
  ['\u00c3\u00ab', '\u00eb'], // ë
  ['\u00c3\u00a0', '\u00e0'], // à
  ['\u00c3\u00a2', '\u00e2'], // â
  ['\u00c3\u00a4', '\u00e4'], // ä
  ['\u00c3\u00ae', '\u00ee'], // î
  ['\u00c3\u00af', '\u00ef'], // ï
  ['\u00c3\u00b4', '\u00f4'], // ô
  ['\u00c3\u00b6', '\u00f6'], // ö
  ['\u00c3\u00b9', '\u00f9'], // ù
  ['\u00c3\u00bb', '\u00fb'], // û
  ['\u00c3\u00bc', '\u00fc'], // ü
  ['\u00c3\u00a7', '\u00e7'], // ç
  ['\u00c3\u00b1', '\u00f1'], // ñ
  ['\u00c3\u00bd', '\u00fd'], // ý
  ['\u00c3\u00a6', '\u00e6'], // æ
  ['\u00c3\u2030', '\u00c9'], // É
  ['\u00c3\u02c6', '\u00c8'], // È
  ['\u00c3\u0160', '\u00ca'], // Ê
  ['\u00c3\u20ac', '\u00c0'], // À
  ['\u00c3\u201a', '\u00c2'], // Â
  ['\u00c3\u2021', '\u00c7'], // Ç
  ['\u00c3\u008e', '\u00ce'], // Î
  ['\u00c3\u0094', '\u00d4'], // Ô
  ['\u00c3\u009b', '\u00db'], // Û
  ['\u00c3\u009c', '\u00dc'], // Ü
  // Å (OE ligature)
  ['\u00c5\u0092', '\u0152'], // Œ
  ['\u00c5\u0093', '\u0153'], // œ
  // Guillemets/apostrophes/tirets — â€
  ['\u00e2\u20ac\u2122', '\u2019'], // '
  ['\u00e2\u20ac\u0153', '\u201c'], // "
  ['\u00e2\u20ac\u009d', '\u201d'], // "
  ['\u00e2\u20ac\u201c', '\u201c'], // "  (â€œ)
  ['\u00e2\u20ac\u2014', '\u2014'], // — (em dash)
  ['\u00e2\u20ac\u2013', '\u2013'], // – (en dash)
  ['\u00e2\u20ac\u00a6', '\u2026'], // …
  ['\u00e2\u20ac\u00a2', '\u2022'], // •
  ['\u00e2\u20ac\u02dc', '\u2018'], // '
  // â‚¬ → €
  ['\u00e2\u201a\u00ac', '\u20ac'], // €
  // â„¢ → ™
  ['\u00e2\u201e\u00a2', '\u2122'], // ™
  // Â + lettre
  ['\u00c2\u00b0', '\u00b0'], // °
  ['\u00c2\u00b2', '\u00b2'], // ²
  ['\u00c2\u00b3', '\u00b3'], // ³
  ['\u00c2\u00bd', '\u00bd'], // ½
  ['\u00c2\u00bc', '\u00bc'], // ¼
  ['\u00c2\u00be', '\u00be'], // ¾
  ['\u00c2\u00a3', '\u00a3'], // £
  ['\u00c2\u00a9', '\u00a9'], // ©
  ['\u00c2\u00ae', '\u00ae'], // ®
  ['\u00c2\u00b7', '\u00b7'], // ·
  ['\u00c2\u00bb', '\u00bb'], // »
  ['\u00c2\u00ab', '\u00ab'], // «
  ['\u00c2\u00b1', '\u00b1'], // ±
  ['\u00c2\u00a0', '\u00a0'], // NBSP
  // Séquences d'emojis cassés (Ã°Å¸)
  // On les efface proprement
];

// ── 2. Appliquer la table en plusieurs passes ──────────────────────────────
for (let pass = 0; pass < 6; pass++) {
  const prev = txt;
  for (const [bad, good] of TABLE) {
    if (txt.includes(bad)) txt = txt.split(bad).join(good);
  }
  if (txt === prev) break;
}

// ── 3. Éliminer les séquences d'emojis doublement-encodés résiduels ────────
// Pattern: Ã° + byte haut = début d'un emoji 4-octets mal encodé
// On ne peut pas reconstruire l'emoji, on retire juste le bruit
txt = txt.replace(/\u00c3[\u00b0-\u00bf][\u00c4-\u00c5][\u00b0-\u00bf]/g, '');
txt = txt.replace(/\u00c3[\u00b0-\u00bf][\u00c5-\u00c6][\u00b8-\u00bf]/g, '');
txt = txt.replace(/[\u00c4-\u00c5][\u00b0-\u00bf]/g, (m) => {
  // Séquence haute restante — supprimer
  return '';
});

// ── 4. Éliminer les Ã solitaires restants ────────────────────────────────
// Ã suivi d'un char >0xA0 non traité = mojibake résiduel → espace
txt = txt.replace(/\u00c3(?![\u00c0-\u00ff])/g, '');
// Â solitaire résiduel
txt = txt.replace(/\u00c2(?![\u00a0-\u00ff])/g, '');

// ── 5. Écriture ───────────────────────────────────────────────────────────
if (txt !== before) {
  fs.writeFileSync(fp, txt, 'utf8');
  // Compter les différences approximatives
  let diff = 0;
  const ml = Math.min(before.length, txt.length);
  for (let i = 0; i < ml; i++) { if (before[i] !== txt[i]) diff++; }
  console.log(`\u2714 index.html corrigé (${diff} différences, ${before.length - txt.length} chars retirés)`);
} else {
  console.log('Aucune correction nécessaire dans index.html');
}
