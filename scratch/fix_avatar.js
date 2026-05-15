const fs = require('fs');

function fixAvatar() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        // Find the bio-avatar div and replace its content
        content = content.replace(/(<div class="bio-avatar"[\s\S]+?>)[\s\S]+?(<\/div>)/, '$1👨‍🍳$2');
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Avatar fixed with regex");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixAvatar();
