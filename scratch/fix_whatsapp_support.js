const fs = require('fs');

function fixWhatsappAndSupport() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Remove floating WhatsApp button
        // Looking for the floating button (likely an <a> or <button> with a WhatsApp icon)
        const floatingWhatsappPattern = /<a href="https:\/\/wa\.me\/33601869997"[\s\S]+?<\/a>/;
        content = content.replace(floatingWhatsappPattern, '');
        
        // Also remove potential CSS for it if it's a fixed position element
        content = content.replace(/#whatsapp-float \{[\s\S]+?\}/g, '');
        content = content.replace(/\.whatsapp-btn \{[\s\S]+?\}/g, '');

        // 2. Add WhatsApp link inside Support Modal
        // Assuming there's a support modal content somewhere
        const supportModalContentPattern = /<div class="support-options"[\s\S]+?<\/div>/;
        const whatsappSupportHTML = `<div class="support-options" style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-top:1.5rem;">
            <a href="https://wa.me/33601869997" target="_blank" class="support-card" style="text-decoration:none; color:inherit; background:rgba(37, 211, 102, 0.1); border:1px solid #25d366; padding:1.5rem; border-radius:15px; display:flex; flex-direction:column; align-items:center; gap:0.5rem; transition:transform 0.2s;">
                <span style="font-size:2rem;">💬</span>
                <span style="font-weight:700;">WhatsApp Direct</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">06 01 86 99 97</span>
            </a>
            <a href="mailto:julian31.peresson@gmail.com" class="support-card" style="text-decoration:none; color:inherit; background:rgba(99, 102, 241, 0.1); border:1px solid var(--primary); padding:1.5rem; border-radius:15px; display:flex; flex-direction:column; align-items:center; gap:0.5rem; transition:transform 0.2s;">
                <span style="font-size:2rem;">📧</span>
                <span style="font-weight:700;">Email Support</span>
                <span style="font-size:0.75rem; color:var(--text-muted);">Réponse sous 24h</span>
            </a>
        </div>`;
        
        content = content.replace(supportModalContentPattern, whatsappSupportHTML);

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("WhatsApp button moved into Support modal and floating button removed.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixWhatsappAndSupport();
