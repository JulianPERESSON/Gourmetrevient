const fs = require('fs');

function removeFloatingWhatsapp() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');

        // 1. Remove the floating support div entirely
        const pattern = /<!-- FLOATING SUPPORT WIDGET -->[\s\S]+?<div id="whatsappSupport"[\s\S]+?<\/div>/;
        content = content.replace(pattern, '<!-- Floating WhatsApp removed -->');

        // 2. Remove associated CSS for floating-support to be clean
        const cssPattern = /\.floating-support \{[\s\S]+?\}[\s\S]+?\.floating-support:hover \{[\s\S]+?\}/;
        content = content.replace(cssPattern, '');
        
        // 3. Just in case, add a CSS rule to hide it if it's still there
        const hideRule = `
#whatsappSupport, .floating-support { display: none !important; pointer-events: none !important; opacity: 0 !important; visibility: hidden !important; }
`;
        content = content.replace('</style>', hideRule + '\n</style>');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Floating WhatsApp support widget REMOVED from the code.");
    } catch (err) {
        console.error("Error:", err);
    }
}

removeFloatingWhatsapp();
