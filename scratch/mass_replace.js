const fs = require('fs');
const path = require('path');

const directory = 'c:\\Users\\julia\\Desktop\\cout de revient';

const searchTerms = [
    { from: /contact@gourmetrevient\.fr/g, to: 'support@gourmetrevient.fr' }
];

// Avoid replacing in .git or scratch or node_modules
const ignoreDirs = ['.git', 'scratch', 'node_modules'];
// Only process text based files
const validExts = ['.js', '.html', '.css', '.md', '.sql', '.ts'];

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        if (ignoreDirs.includes(file)) return;
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(filePath));
        } else {
            const ext = path.extname(filePath);
            if (validExts.includes(ext)) {
                results.push(filePath);
            }
        }
    });
    return results;
}

const files = walk(directory);
let modifiedCount = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    
    searchTerms.forEach(term => {
        content = content.replace(term.from, term.to);
    });
    
    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log('Updated:', file);
        modifiedCount++;
    }
});

console.log(`\nReplacement complete! ${modifiedCount} files updated.`);
