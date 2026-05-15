const fs = require('fs');

function forceHaccpReset() {
    try {
        let content = fs.readFileSync('auth-ui.js', 'utf8');

        // Ensure the global haccpLogs object is completely emptied
        const resetHaccpLogic = `
      // Reset HACCP in-memory
      if (typeof window.APP !== 'undefined') {
        window.APP.haccpLogs = { temp: [], trace: [], clean: [], reception: [], allergens: [] };
        if (typeof window.saveHaccpLogs === 'function') window.saveHaccpLogs();
        if (typeof window.updateHaccpDashboard === 'function') window.updateHaccpDashboard();
        if (typeof window.loadHaccpLogs === 'function') window.loadHaccpLogs();
      }
      
      // Force clear specific localstorage keys just in case
      const haccpKeys = ['gourmet_haccp_logs', 'gourmetrevient_haccp_temp', 'gourmetrevient_haccp_clean', 'gourmetrevient_haccp_trace', 'gourmetrevient_haccp_reception'];
      haccpKeys.forEach(k => {
          localStorage.removeItem(k);
          localStorage.removeItem(k + '_' + userName);
      });
`;
        
        // Inject this logic into the resetUserData function
        if (content.includes('// Reset HACCP in-memory')) {
            // Already partially there, let's make it robust
            const oldLogic = /\/\/ Reset HACCP in-memory[\s\S]+?\}\s+\}/;
            content = content.replace(oldLogic, resetHaccpLogic + '    }');
        }

        fs.writeFileSync('auth-ui.js', content, 'utf8');
        console.log("HACCP reset logic hardened in auth-ui.js.");
    } catch (err) {
        console.error("Error:", err);
    }
}

forceHaccpReset();
