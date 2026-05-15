const fs = require('fs');

function finalizeSupportModal() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // Locate the support modal content area
        const supportModalAreaPattern = /<div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">[\s\S]+?<a href="mailto:julian31\.peresson@gmail\.com"[\s\S]+?<\/a>/;
        
        const newSupportLinks = `<div style="display: flex; flex-direction: column; gap: 1rem; margin-bottom: 2rem;">
          
          <a href="mailto:julian31.peresson@gmail.com" style="display: flex; align-items: center; gap: 1rem; background: #f1f5f9; color: #1e293b; padding: 1.2rem 1.5rem; border-radius: 18px; text-decoration: none; font-weight: 700; transition: all 0.3s;" onmouseover="this.style.background='#e2e8f0'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#f1f5f9'; this.style.transform='translateY(0)'">
            <span style="font-size: 1.5rem;">📧</span>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.9rem;">Email Support</span>
              <span style="font-size: 0.75rem; color: #64748b; font-weight: 500;">julian31.peresson@gmail.com</span>
            </div>
          </a>

          <a href="https://wa.me/33601869997" target="_blank" style="display: flex; align-items: center; gap: 1rem; background: #dcfce7; color: #166534; padding: 1.2rem 1.5rem; border-radius: 18px; text-decoration: none; font-weight: 700; transition: all 0.3s; border: 1px solid #bbf7d0;" onmouseover="this.style.background='#bbf7d0'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='#dcfce7'; this.style.transform='translateY(0)'">
            <span style="font-size: 1.5rem;">💬</span>
            <div style="display: flex; flex-direction: column;">
              <span style="font-size: 0.9rem;">WhatsApp Direct</span>
              <span style="font-size: 0.75rem; color: #166534; font-weight: 500;">06 01 86 99 97</span>
            </div>
          </a>`;

        content = content.replace(supportModalAreaPattern, newSupportLinks);

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Support modal updated with email and WhatsApp links.");
    } catch (err) {
        console.error("Error:", err);
    }
}

finalizeSupportModal();
