const fs = require('fs');

// 1. index.html
let index = fs.readFileSync('index.html', 'utf8');
index = index.replace(/>Le Blog des Pâtissiers<\/span>/g, '>Blog</span>');
fs.writeFileSync('index.html', index, 'utf8');
console.log('Updated index.html');

// 2. i18n.js
let i18n = fs.readFileSync('i18n.js', 'utf8');
i18n = i18n.replace(/'nav\.blog': 'Le Blog des Pâtissiers',/g, "'nav.blog': 'Blog',");
fs.writeFileSync('i18n.js', i18n, 'utf8');
console.log('Updated i18n.js');

// 3. article-template.html
let art = fs.readFileSync('article-template.html', 'utf8');
art = art.replace(/>Le Blog des Pâtissiers<\/a>/g, '>Blog</a>');
fs.writeFileSync('article-template.html', art, 'utf8');
console.log('Updated article-template.html');
