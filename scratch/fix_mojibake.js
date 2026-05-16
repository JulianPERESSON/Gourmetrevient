#!/usr/bin/env node
// fix_mojibake.js — Correction brute-force des mojibake — GourmetRevient
// Usage : node scratch/fix_mojibake.js

const fs   = require('fs');
const path = require('path');

const ROOT       = path.dirname(__dirname || path.resolve('.'));
const EXTENSIONS = new Set(['.js', '.html', '.css', '.json', '.md', '.txt', '.xml']);
const EXCLUDE    = new Set(['.git', 'node_modules', '.agents', 'img', 'fiches']);

// ── Table de remplacement (ordre important : du plus long au plus court) ────
const REPLACEMENTS = [
  // ── Triple encodage (ÃƒÆ') ────────────────────────────────────────────────
  ["é",   "é"],
  ["è",   "è"],
  ["ê",   "ê"],
  ["à",   "à"],
  ["â",   "â"],
  ["î",   "î"],
  ["ô",   "ô"],
  ["ç",   "ç"],
  ["û",   "û"],
  ["ù",   "ù"],
  ["É",   "É"],
  ["È",   "È"],
  ["À",   "À"],
  ["Ç",   "Ç"],
  ["ÃƒÆ'ÂÂ\u008a","Ê"],
  // ── Séquences spéciales chef-d'œuvre ────────────────────────────────────
  ["œuvre", "œuvre"],
  ["chef-dâ€™Å\x93uvre",  "chef-d\u2019\u0153uvre"],
  ["chef-d\u2019oeuvre",   "chef-d\u2019\u0153uvre"],
  // ── à(double encodage) ─────────────────────────────────────────────────
  ["é",  "é"],
  ["è",  "è"],
  ["ê",  "ê"],
  ["ë",  "ë"],
  ["à",  "à"],
  ["â",  "â"],
  ["ä",  "ä"],
  ["î",  "î"],
  ["ï",  "ï"],
  ["ô",  "ô"],
  ["ö",  "ö"],
  ["ù",  "ù"],
  ["û",  "û"],
  ["ü",  "ü"],
  ["ç",  "ç"],
  ["ñ",  "ñ"],
  ["É",  "É"],
  ["È",  "È"],
  ["Ê",  "Ê"],
  ["À",  "À"],
  ["Â",  "Â"],
  ["Ç",  "Ç"],
  ["Ã",   "Ã"],
  // ── Ãƒâ€ (Ô Ö Ü Û Ù Ø Å Œ…) ───────────────────────────────────────────
  // Note: clés avec guillemets typographiques encodées en \uXXXX pour éviter erreurs syntaxe
  ["\u00c3\u0192\u00e2\u20ac\u009d",  "\u00d6"],  // Ö → Ö
  ["\u00c3\u0192\u00e2\u20ac\u02dc",  "\u00d8"],  // Ø → Ø
  ["\u00c3\u0192\u00e2\u20ac\u2122",  "\u00d9"],  // Ù → Ù
  ["\u00c3\u0192\u00e2\u20ac\u0161",  "\u00da"],  // Ú → Ú
  ["\u00c3\u0192\u00e2\u20ac\u203a",  "\u00db"],  // Û → Û
  ["Å",  "\u00c5"],  // Å
  ["Ä",  "\u00c4"],  // Ä
  // ── —  (tiret long) ────────────────────────────────────────────
  ["—",   "\u2014"],
  // ── “ (guillemets, apostrophes, tirets) ──────────────────────────────
  ["’",   "\u2019"],  // '
  ["\u00c3\u00a2\u00e2\u201a\u00ac\u00c5\u0092",  "\u201c"],  // ââ€˜ → “
  ["“\u009d","\u201d"],  // "
  ["“",   "\u201c"],  // "
  ["—",    "\u2014"],  // —
  ["—™",   "\u2013"],  // –
  ["…",     "\u2026"],  // …
  ["•",     "\u2022"],  // •
  ["“",      "\u201c"],  // " fallback
  // ── Â + caractère ─────────────────────────────────────────────────────────
  ["°",   "\u00b0"],  // °
  ["²",   "\u00b2"],  // ²
  ["³",   "\u00b3"],  // ³
  ["½",   "\u00bd"],  // ½
  ["¼",   "\u00bc"],  // ¼
  ["¾",   "\u00be"],  // ¾
  ["£",   "\u00a3"],  // £
  ["€",  "\u20ac"],  // €
  ["©",   "\u00a9"],  // ©
  ["®",   "\u00ae"],  // ®
  ["™",  "\u2122"],  // ™
  ["·",   "\u00b7"],  // ·
  ["»",   "\u00bb"],  // »
  ["«",   "\u00ab"],  // «
  ["Â\u00a0","  "],
  ["Â\u00ad","-"],
  ["±",   "\u00b1"],  // ±
  // ── à+ lettre simple (encodage simple) ───────────────────────────────────
  ["é",   "é"],
  ["è",   "è"],
  ["ê",   "ê"],
  ["ë",   "ë"],
  ["à",   "à"],
  ["â",   "â"],
  ["ä",   "ä"],
  ["î",   "î"],
  ["ï",   "ï"],
  ["ô",   "ô"],
  ["ö",   "ö"],
  ["ù",   "ù"],
  ["û",   "û"],
  ["ü",   "ü"],
  ["ç",   "ç"],
  ["ñ",   "ñ"],
  ["ý",   "ý"],
  ["æ",   "æ"],
  ["þ",   "þ"],
  ["\u00c3\u20ac",  "\u00c0"],  // À → À
  ["É",   "É"],
  ["È",   "È"],
  ["Ê",   "Ê"],
  ["Ë",   "Ë"],
  ["Â",   "Â"],
  ["Ç",   "Ç"],
  ["Ã\u008e","Î"],
  ["Ã\u0094","Ô"],
  ["Ã\u009b","Û"],
  ["Ã\u009c","Ü"],
  // ── Å (OE, oe, etc.) ──────────────────────────────────────────────────────
  ["Å\u0092","Œ"],   // Œ
  ["Å\u0093","œ"],   // œ
  ["Å\u0099","™"],
  ["Å\u00a0","Ÿ"],
  // ── Mots courants mal encodés ────────────────────────────────────────────
  ["pâtissier",   "pâtissier"],
  ["pâtissiers",  "pâtissiers"],
  ["pâtisserie",  "pâtisserie"],
  ["pâtisseries", "pâtisseries"],
  ["pâte",        "pâte"],
  ["pâtes",       "pâtes"],
  ["côté",       "côté"],
  ["côtés",      "côtés"],
  ["côte",        "côte"],
  ["côtes",       "côtes"],
  // ── Fallbacks Â seul ─────────────────────────────────────────────────────
  ["\u00c2\u00a0",  "\u00a0"],  // NBSP
];

function fixString(text) {
  let prev;
  // 4 passes max pour attraper les encodages imbriqués
  for (let pass = 0; pass < 4; pass++) {
    prev = text;
    for (const [bad, good] of REPLACEMENTS) {
      if (text.includes(bad)) {
        text = text.split(bad).join(good);
      }
    }
    if (text === prev) break;
  }
  return text;
}

function processFile(filepath) {
  let raw;
  try { raw = fs.readFileSync(filepath, 'utf8'); }
  catch(e) {
    try { raw = fs.readFileSync(filepath, 'latin1'); }
    catch(e2) { console.error(`  [ERREUR] ${filepath}: ${e2.message}`); return 0; }
  }
  const fixed = fixString(raw);
  if (fixed === raw) return 0;
  const count = [...raw].filter((c, i) => c !== fixed[i]).length;
  fs.writeFileSync(filepath, fixed, 'utf8');
  return count;
}

function walk(dir, results = []) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); }
  catch(e) { return results; }
  for (const e of entries) {
    if (EXCLUDE.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      walk(full, results);
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (EXTENSIONS.has(ext)) results.push(full);
    }
  }
  return results;
}

// ── Main ────────────────────────────────────────────────────────────────────
const rootDir = path.resolve(__dirname, '..');
console.log(`\n${'='.repeat(60)}`);
console.log(`  fix_mojibake.js — Racine : ${rootDir}`);
console.log(`${'='.repeat(60)}\n`);

const files = walk(rootDir);
console.log(`  ${files.length} fichiers à analyser...\n`);

let totalFiles = 0, totalCorrections = 0;

for (const fp of files.sort()) {
  const count = processFile(fp);
  if (count > 0) {
    const rel = path.relative(rootDir, fp);
    console.log(`  ✔  ${rel}  (${count} corrections)`);
    totalFiles++;
    totalCorrections += count;
  }
}

console.log(`\n${'='.repeat(60)}`);
console.log(`  Résultat : ${totalFiles} fichiers modifiés, ~${totalCorrections} corrections`);
console.log(`${'='.repeat(60)}\n`);
