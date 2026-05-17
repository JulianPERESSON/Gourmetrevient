const fs = require('fs');
const path = require('path');

const generateCover = (emoji, colorStart, colorEnd) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${colorStart}" /><stop offset="100%" stop-color="${colorEnd}" /></linearGradient></defs><rect width="800" height="400" fill="url(#g)" /><text x="50%" y="55%" font-size="140" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif">${emoji}</text></svg>`;
  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
};

const articlesConfig = [
  { id: "cout-de-revient-guide", emoji: "📊", c1: "#e0e7ff", c2: "#a5b4fc" },
  { id: "haccp-releves-temperature", emoji: "🌡️", c1: "#d1fae5", c2: "#6ee7b7" },
  { id: "fixer-prix-vente-patisserie", emoji: "🏷️", c1: "#e0e7ff", c2: "#a5b4fc" },
  { id: "cout-revient-macaron", emoji: "🧁", c1: "#e0e7ff", c2: "#a5b4fc" },
  { id: "allergenes-inco-patisserie", emoji: "🛡️", c1: "#d1fae5", c2: "#6ee7b7" },
  { id: "ouvrir-patisserie-artisanale", emoji: "🏪", c1: "#fef3c7", c2: "#fcd34d" },
  { id: "gerer-stock-patisserie", emoji: "📦", c1: "#fef3c7", c2: "#fcd34d" },
  { id: "planning-production-patisserie", emoji: "📅", c1: "#fef3c7", c2: "#fcd34d" },
  { id: "inflation-marge-patisserie", emoji: "📉", c1: "#e0e7ff", c2: "#a5b4fc" },
  { id: "cap-patisserie-ep1-ep2", emoji: "🎓", c1: "#f3e8ff", c2: "#d8b4fe" },
  { id: "excel-vs-logiciel-patisserie", emoji: "💻", c1: "#e0e7ff", c2: "#a5b4fc" },
  { id: "5-erreurs-prix-patissier", emoji: "⚠️", c1: "#e0e7ff", c2: "#a5b4fc" },
  { id: "digitaliser-laboratoire-budget", emoji: "📱", c1: "#f3e8ff", c2: "#d8b4fe" }
];

// 1. Fix blog-data.js
let blogDataPath = path.join(__dirname, '../blog-data.js');
let blogData = fs.readFileSync(blogDataPath, 'utf8');

// Inject generateCover at the top
if (!blogData.includes('generateCover')) {
    blogData = `const generateCover = (emoji, colorStart, colorEnd) => {\n  const svg = \\\`<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400" viewBox="0 0 800 400"><defs><linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="\${colorStart}" /><stop offset="100%" stop-color="\${colorEnd}" /></linearGradient></defs><rect width="800" height="400" fill="url(#g)" /><text x="50%" y="55%" font-size="140" text-anchor="middle" dominant-baseline="middle" font-family="system-ui, sans-serif">\${emoji}</text></svg>\\\`;\n  return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);\n};\n\n` + blogData;
}

// Replace image strings
articlesConfig.forEach(cfg => {
  const regex = new RegExp(`(id:\\s*"${cfg.id}"[\\s\\S]*?image:\\s*)"https?://[^"]+"`, "g");
  blogData = blogData.replace(regex, `$1generateCover('${cfg.emoji}', '${cfg.c1}', '${cfg.c2}')`);
});

fs.writeFileSync(blogDataPath, blogData, 'utf8');

// 2. Fix all article-*.html files
const dirPath = path.join(__dirname, '..');
const files = fs.readdirSync(dirPath).filter(f => f.startsWith('article-') && f.endsWith('.html') && f !== 'article-template.html');

files.forEach(file => {
  const articleId = file.replace('article-', '').replace('.html', '');
  const cfg = articlesConfig.find(c => c.id === articleId) || articlesConfig[0];
  const coverUrl = generateCover(cfg.emoji, cfg.c1, cfg.c2);
  
  const filePath = path.join(dirPath, file);
  let html = fs.readFileSync(filePath, 'utf8');
  
  // Replace og:image
  html = html.replace(/<meta property="og:image" content="https?:\/\/[^"]+">/g, `<meta property="og:image" content="${coverUrl}">`);
  
  // Replace background-image URL
  html = html.replace(/background-image:\s*url\(['"]https?:\/\/[^'"]+['"]\)/g, `background-image: url('${coverUrl}')`);
  
  fs.writeFileSync(filePath, html, 'utf8');
});

console.log('Successfully replaced all images with SVG covers!');
