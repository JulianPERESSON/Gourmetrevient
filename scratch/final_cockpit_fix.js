const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

// Target specific lines for the cockpit cards
content = content.replace(/<div class="hub-kpi-icon" style="background: rgba\(99,102,241,0\.10\); color: var\(--accent\);"> °<\/div>/g, 
                        '<div class="hub-kpi-icon" style="background: rgba(99,102,241,0.10); color: var(--accent);">👨‍🍳</div>');

content = content.replace(/<span class="hub-kpi-value">Planifier<\/span>\s*<span class="hub-kpi-label">Gérer ma production<\/span>/g,
                        '<span class="hub-kpi-value" data-i18n="dash.priority.btn_plan">Planifier</span> <span class="hub-kpi-label" data-i18n="dash.cockpit.manage_planning">Gérer ma production</span>');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Final cockpit polish applied.');
