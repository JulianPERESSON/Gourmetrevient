const fs = require('fs');
let css = fs.readFileSync('styles.css', 'utf8');

css = css.replace(/\.library-card-pdf\s*\{[^}]+\}/, `.library-card-pdf {
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
}`);

fs.writeFileSync('styles.css', css, 'utf8');
console.log('Successfully updated styles.css!');
