const fs = require('fs');

function fixStyles() {
    try {
        let content = fs.readFileSync('styles.css', 'utf8');
        
        // Fix media query for header actions
        const target = `#btnSavedRecipes span, 
    #btnSubscribePro span,
    #userNameHeader {
      display: none !important; /* On ne garde que les ic`;
        
        const replacement = `#btnSavedRecipes span, 
    #btnSubscribePro span,
    #userNameHeader,
    .status-text {
      display: none !important; /* On ne garde que les icônes/avatar/dot */
    }
    .sync-status {
      padding: 4px !important;
      border: none !important;
      background: none !important;
    }`;

        // Find the block and replace
        content = content.replace(/#btnSavedRecipes span, \s*#btnSubscribePro span, \s*#userNameHeader \{[^}]+\}/g, replacement);
        
        fs.writeFileSync('styles.css', content, 'utf8');
        console.log("Styles fixed successfully");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixStyles();
