const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// Use regex to match the exact div regardless of the corrupted characters inside
content = content.replace(/<div class="hub-kpi-icon" style="background: rgba\(99,102,241,0\.10\); color: var\(--accent\);">[^<]+<\/div>/, '<div class="hub-kpi-icon" style="background: rgba(99,102,241,0.10); color: var(--accent);">👨‍🍳</div>');

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully replaced corrupted production icon using regex!');
