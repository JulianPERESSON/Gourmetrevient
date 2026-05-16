const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'index.html');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
    // Broken names from over-aggressive "état" replacement
    { from: /asmAnnoÉtationPanel/g, to: 'asmAnnotationPanel' },
    { from: /SÉtatus/g, to: 'Status' },
    { from: /sÉtatus/g, to: 'status' },
    { from: /SÉtat/g, to: 'Stat' }, // Just in case some were missed
    { from: /sÉtat/g, to: 'stat' },
    
    // Mojibake in icons and text
    { from: /"hub-kpi-icon"[^>]*>\s*°/g, to: '"hub-kpi-icon" style="background: rgba(99,102,241,0.10); color: var(--accent);">📊' }, // Prod icon
    { from: /"hub-card-icon"[^>]*>¤“/g, to: '"hub-card-icon" style="color:#8b5cf6;">🧠' }, // AI icon
    { from: /"hub-tip-icon">💰¡/g, to: '"hub-tip-icon">💡' }, // Tip icon
    { from: /"hub-card-icon" style="color:#ef4444;">/g, to: '"hub-card-icon" style="color:#ef4444;">🔥' }, // Priority icon
    { from: /"hub-card-icon" style="color:#f59e0b;">\s*<\/h3>/g, to: '"hub-card-icon" style="color:#f59e0b;">🏷️</h3>' }, // Price watch icon (empty)
    { from: /"hub-card-icon" style="color:#6366f1;">\s*<\/h3>/g, to: '"hub-card-icon" style="color:#6366f1;">👥</h3>' }, // Team icon (empty)

    // Text corrections
    { from: /ÀÀ propos/g, to: 'À propos' },
    { from: /Ééquipe/g, to: 'Équipe' },
    { from: /dégusÉtation/g, to: 'dégustation' },
    { from: /p&acirc;tisserie/g, to: 'pâtisserie' },
    { from: /&eacute;quipe/g, to: 'équipe' },
    { from: /succ&egrave;s/g, to: 'succès' }
];

let fixedContent = content;
replacements.forEach(rep => {
    fixedContent = fixedContent.replace(rep.from, rep.to);
});

// Final check for common double-encoded patterns that might have survived
fixedContent = fixedContent.replace(/Ã©/g, 'é');
fixedContent = fixedContent.replace(/Ã /g, 'à');
fixedContent = fixedContent.replace(/Ã¨/g, 'è');
fixedContent = fixedContent.replace(/Ã´/g, 'ô');
fixedContent = fixedContent.replace(/Ã¹/g, 'ù');
fixedContent = fixedContent.replace(/Ã¢/g, 'â');
fixedContent = fixedContent.replace(/Ã«/g, 'ë');
fixedContent = fixedContent.replace(/Ã®/g, 'î');

if (content !== fixedContent) {
    fs.writeFileSync(filePath, fixedContent, 'utf8');
    console.log('Polished index.html');
} else {
    console.log('No changes needed for index.html');
}
