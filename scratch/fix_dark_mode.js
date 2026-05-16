const fs = require('fs');

function fixDarkModeReadability() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Force High Contrast in Cockpit (Dark Mode)
        const darkModeFix = `
/* --- Ultra Contrast Dark Mode Fix --- */
[data-theme="dark"] .v2-kpi-label, 
[data-theme="dark"] .v2-kpi-value,
[data-theme="dark"] .hub-card h3,
[data-theme="dark"] .hub-card p,
[data-theme="dark"] .priority-item p,
[data-theme="dark"] .priority-item span {
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
}

[data-theme="dark"] .v2-kpi-card {
  background: rgba(255, 255, 255, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  backdrop-filter: blur(12px);
}

[data-theme="dark"] .v2-kpi-footer {
  color: #cbd5e1 !important;
  font-weight: 600;
}

[data-theme="dark"] .priority-item {
  background: rgba(255, 255, 255, 0.05) !important;
  border-left: 4px solid var(--accent) !important;
}

[data-theme="dark"] .hub-card {
  background: rgba(30, 41, 59, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

[data-theme="dark"] h1, [data-theme="dark"] h2 {
    color: #ffffff !important;
}
`;
        content = content.replace('</style>', darkModeFix + '\n</style>');

        // 2. Fix the specific Mojibake in Assistant Expert
        content = content.replace(/“œAssistant Expert/g, '🤖 Assistant Expert');
        content = content.replace(/“œ/g, ''); // Global cleanup of this specific pattern

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Dark mode contrast fixed and Mojibake removed from Assistant Expert.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixDarkModeReadability();
