const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// 1. Extract the premium-app-layout block for Quality
const startTag = '<div class="premium-app-layout" style="display:grid; grid-template-columns: 280px 1fr; min-height: 700px; background: rgba(255,255,255,0.4); backdrop-filter: blur(20px); border-radius: 30px; border: 1px solid rgba(255,255,255,0.5); overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.1);">';
const startIndex = content.indexOf(startTag);
if (startIndex === -1) {
   console.error('Could not find premium-app-layout start tag!');
   process.exit(1);
}

// Find the closing tag before <!-- TAB: ALLERGENS MATRIX -->
const nextTab = '<!-- TAB: ALLERGENS MATRIX -->';
const nextTabIndex = content.indexOf(nextTab, startIndex);
if (nextTabIndex === -1) {
   console.error('Could not find next tab index!');
   process.exit(1);
}

const qualityBlock = content.substring(startIndex, nextTabIndex);

// Remove the standalone qualityBlock from its current position
content = content.substring(0, startIndex) + content.substring(nextTabIndex);

// Now find <div id="mgmtViewQuality" class="mgmt-view" style="display:none;"> and replace its contents with qualityBlock
const targetDivStart = '<div id="mgmtViewQuality" class="mgmt-view" style="display:none;">';
const targetStart = content.indexOf(targetDivStart);
if (targetStart === -1) {
   console.error('Could not find mgmtViewQuality div!');
   process.exit(1);
}
const targetEnd = content.indexOf('</div>', targetStart);

content = content.substring(0, targetStart + targetDivStart.length) + '\n' + qualityBlock + '\n' + content.substring(targetEnd);

// 2. Fix switchQualitySubTab to call renderWasteAnalysis on 'history'
content = content.replace("if (sub === 'waste-dash') { if (typeof renderWasteAnalysis === 'function') renderWasteAnalysis(); }", "if (sub === 'waste-dash' || sub === 'history') { if (typeof renderWasteAnalysis === 'function') renderWasteAnalysis(); }");

fs.writeFileSync('index.html', content, 'utf8');
console.log('Successfully fixed Quality DOM structure and history rendering!');
