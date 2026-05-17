const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const target = '<div class="hub-kpi-icon" style="background: rgba(99,102,241,0.10); color: var(--accent);"> °</div>';
const replacement = '<div class="hub-kpi-icon" style="background: rgba(99,102,241,0.10); color: var(--accent);">👨‍🍳</div>';

if (content.includes(target)) {
  content = content.replace(target, replacement);
  fs.writeFileSync('index.html', content, 'utf8');
  console.log('Successfully replaced corrupted production icon with Chef emoji!');
} else {
  console.error('Could not find target string in index.html!');
}
