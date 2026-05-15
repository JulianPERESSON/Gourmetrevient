const fs = require('fs');

function cleanHaccp() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        // Remove the double table and fix the traceability section cleanup
        content = content.replace(/<table class="premium-table">\s+<table class="premium-table">/, '<table class="premium-table">');
        
        // Ensure the haccpViewReception and haccpViewAllergens have proper width and spacing
        content = content.replace(/id="haccpViewReception" class="haccp-view" style="display:none;">\s+<div class="mgmt-glass-card"/, 'id="haccpViewReception" class="haccp-view" style="display:none; width:100%;">\n                     <div class="mgmt-glass-card" style="padding: 2.5rem; width: 100%;"');
        content = content.replace(/id="haccpViewAllergens" class="haccp-view" style="display:none;">\s+<div class="mgmt-glass-card"/, 'id="haccpViewAllergens" class="haccp-view" style="display:none; width:100%;">\n                     <div class="mgmt-glass-card" style="padding: 2.5rem; width: 100%;"');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("HACCP clean and width forced");
    } catch (err) {
        console.error("Error:", err);
    }
}

cleanHaccp();
