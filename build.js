const fs = require('fs');
const path = require('path');

const rootDir = __dirname;

const files = [
  'app-state.js',
  'app-core.js',
  'app-recipes.js',
  'app-inventory.js',
  'app-auth.js',
  'app-planning.js',
  'app-analytics.js',
  'app-production.js',
  'app-haccp.js',
  'app-omnisearch.js',
  'app-main.js'
];

console.log('--- GourmetRevient Bundle Builder ---');
console.log(`Starting compilation of ${files.length} modules...`);

let bundledCode = `/* 
  =============================================================================
  GourmetRevient Application Bundle (Production)
  Généré automatiquement le : ${new Date().toISOString()}
  =============================================================================
*/\n\n`;

for (const file of files) {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`ERROR: Source file not found: ${file}`);
    process.exit(1);
  }
  
  console.log(`- Bundling: ${file}`);
  let code = fs.readFileSync(filePath, 'utf8');
  
  // 1. Remove block comments (/* ... */)
  code = code.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // 2. Process line by line to remove comments safely
  const lines = code.split(/\r?\n/);
  const cleanLines = [];
  
  for (let line of lines) {
    let cleanLine = line.trim();
    
    // If the line is a pure comment line
    if (cleanLine.startsWith('//')) {
      continue;
    }
    
    // Inline comment check (safe regex: check if // is present, but not in http://, https:// or inside strings)
    // To be perfectly safe, if it contains quotes (', ", `) and //, we don't strip inline comments on this line.
    if (cleanLine.includes('//') && !cleanLine.includes('http://') && !cleanLine.includes('https://')) {
      if (!cleanLine.includes("'") && !cleanLine.includes('"') && !cleanLine.includes('`')) {
        cleanLine = cleanLine.split('//')[0].trim();
      }
    }
    
    if (cleanLine.length > 0) {
      cleanLines.push(cleanLine);
    }
  }
  
  // Combine the lines
  bundledCode += `\n// --- MODULE: ${file} ---\n` + cleanLines.join('\n') + '\n';
}

const outputPath = path.join(rootDir, 'app.bundle.js');
fs.writeFileSync(outputPath, bundledCode, 'utf8');

console.log('-------------------------------------');
console.log(`SUCCESS: Created production bundle: ${outputPath}`);
console.log(`Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
console.log('-------------------------------------');
