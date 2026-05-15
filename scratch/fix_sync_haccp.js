const fs = require('fs');

function fixProFeatures() {
    try {
        let content = fs.readFileSync('pro-features.js', 'utf8');

        // Update syncToCloud data object
        const syncDataPattern = /const data = \{[\s\S]+?user: getViewOwner\(\),[\s\S]+?recipes: JSON\.stringify\(APP\.savedRecipes\),[\s\S]+?ingredientDb: JSON\.stringify\(APP\.ingredientDb\),/;
        const syncDataReplacement = `const data = {
      user: getViewOwner(),
      recipes: JSON.stringify(APP.savedRecipes),
      ingredientDb: JSON.stringify(APP.ingredientDb),
      haccp: JSON.stringify(APP.haccpLogs),`;
        
        content = content.replace(syncDataPattern, syncDataReplacement);

        // Update syncFromCloud restoration logic
        const syncFromPattern = /if \(data\?\.\[0\]\?\.recipes\) \{[\s\S]+?APP\.savedRecipes = JSON\.parse\(data\[0\]\.recipes\);[\s\S]+?saveSavedRecipes\(\);[\s\S]+?showToast\('Données restaurées', 'success'\);[\s\S]+?\}/;
        const syncFromReplacement = `if (data?.[0]) {
      if (data[0].recipes) {
        APP.savedRecipes = JSON.parse(data[0].recipes);
        saveSavedRecipes();
      }
      if (data[0].haccp) {
        APP.haccpLogs = JSON.parse(data[0].haccp);
        if (typeof saveHaccpLogs === 'function') saveHaccpLogs();
      }
      showToast('Données restaurées', 'success');
    }`;
        
        content = content.replace(syncFromPattern, syncFromReplacement);

        fs.writeFileSync('pro-features.js', content, 'utf8');
        console.log("Pro-features.js updated: HACCP sync integrated.");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixProFeatures();
