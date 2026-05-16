const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const matches = [...content.matchAll(/data-i18n="([^"]*)"/gi)];
const badKeys = matches.filter(m => m[1].includes('Ét') || m[1].includes('ét')).map(m => m[1]);
console.log('Bad data-i18n keys:', badKeys);

const classes = [...content.matchAll(/class="([^"]*)"/gi)];
const badClasses = classes.filter(m => m[1].includes('Ét') || m[1].includes('ét')).map(m => m[1]);
console.log('Bad classes:', badClasses);

const ids = [...content.matchAll(/id="([^"]*)"/gi)];
const badIds = ids.filter(m => m[1].includes('Ét') || m[1].includes('ét')).map(m => m[1]);
console.log('Bad IDs:', badIds);
