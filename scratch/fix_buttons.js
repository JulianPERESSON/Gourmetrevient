const fs = require('fs');

// 1. Fix styles.css
let css = fs.readFileSync('styles.css', 'utf8');
const oldCss = `.library-card-pdf {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  padding: 0.5rem;
  border-radius: 8px;
  background: var(--bg-alt);
  color: var(--text-secondary);
  border: 1px solid var(--surface-border);
  font-size: 0.7rem;
  font-weight: 700;
  transition: all 0.2s;
}`;

const newCss = `.library-card-pdf {
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  background: var(--bg-alt);
  color: var(--text-secondary);
  border: 1px solid var(--surface-border);
  font-size: 0.75rem;
  font-weight: 700;
  transition: all 0.2s;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
}`;

if (css.includes(oldCss)) {
  css = css.replace(oldCss, newCss);
  fs.writeFileSync('styles.css', css, 'utf8');
  console.log('Fixed styles.css!');
} else {
  console.error('Could not find old .library-card-pdf in styles.css!');
}

// 2. Fix app.js wrapper div
let app = fs.readFileSync('app.js', 'utf8');
const oldApp = '<div style="position:absolute; top:10px; right:10px; display:flex; gap:5px;">';
const newApp = '<div style="position:absolute; top:1.2rem; right:1.2rem; display:flex; gap:0.5rem; z-index:10; align-items:center;">';

if (app.includes(oldApp)) {
  app = app.replace(oldApp, newApp);
  fs.writeFileSync('app.js', app, 'utf8');
  console.log('Fixed app.js wrapper div!');
} else {
  console.error('Could not find old wrapper div in app.js!');
}
