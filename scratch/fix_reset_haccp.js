const fs = require('fs');

function fixAuthUI() {
    try {
        let content = fs.readFileSync('auth-ui.js', 'utf8');

        // Add more HACCP keys to the reset list
        const keysPattern = /`gourmetrevient_haccp_temp_\$\{userName\}`,\s*`gourmetrevient_haccp_clean_\$\{userName\}`/;
        const keysReplacement = `\`gourmetrevient_haccp_temp_\${userName}\`,
          \`gourmetrevient_haccp_clean_\${userName}\`,
          \`gourmetrevient_haccp_trace_\${userName}\`,
          \`gourmetrevient_haccp_reception_\${userName}\`,
          \`gourmet_haccp_logs\``; // Also the global key used in app.js
        
        content = content.replace(keysPattern, keysReplacement);

        // Add in-memory HACCP reset
        const memoryResetPattern = /if \(typeof window\.APP !== 'undefined' && Array\.isArray\(window\.APP\.inventory\)\) \{[\s\S]+?\}\s+\}/;
        const memoryResetReplacement = `if (typeof window.APP !== 'undefined' && Array.isArray(window.APP.inventory)) {
        window.APP.inventory.forEach(item => {
          item.stock = 0;
          item.lastUpdate = new Date().toISOString();
          item.priceHistory = [];
        });
      }
      
      // Reset HACCP in-memory
      if (typeof window.APP !== 'undefined' && window.APP.haccpLogs) {
        window.APP.haccpLogs = { temp: [], trace: [], clean: [], reception: [] };
        if (typeof window.saveHaccpLogs === 'function') window.saveHaccpLogs();
      }
    }`;
        
        content = content.replace(memoryResetPattern, memoryResetReplacement);

        fs.writeFileSync('auth-ui.js', content, 'utf8');
        console.log("Auth-ui.js updated: Full HACCP reset integrated.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixAuthUI();
