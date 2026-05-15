const fs = require('fs');

function fixLine1404() {
    try {
        const lines = fs.readFileSync('index.html', 'utf8').split('\n');
        lines[1403] = '          <div class="hub-hero-avatar" id="dashAvatar">👨‍🍳</div>'; // 1404 is index 1403
        
        // Also fix the other card icon around 1466
        lines[1465] = '              <span class="hub-card-icon" style="color:#ec4899;">👨‍🍳</span>';
        
        fs.writeFileSync('index.html', lines.join('\n'), 'utf8');
        console.log("Lines fixed by index");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixLine1404();
