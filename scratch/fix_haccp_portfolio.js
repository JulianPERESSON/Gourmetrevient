const fs = require('fs');

function fixBugs() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        // 1. Fix Portfolio Mojibake
        content = content.replace(/§“Â <\/div>/, '👨‍🍳</div>');
        content = content.replace(/Pà¢tissier/g, 'Pâtissier');
        content = content.replace(/algorithmie/g, "algorithmique");
        
        // 2. Fix HACCP Traceability structure (prematurely closed div)
        const traceTarget = `<!-- Traceability View (Requested by user) -->
                  <div id="haccpViewTrace" class="haccp-view" style="display:none;">
                    <div class="card glass-widget" style="padding: 2.5rem;">
                       <div class="flex-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                          <h3 class="widget-title-modern"> · Traçabilité des Productions</h3>
                          <div style="display:flex; gap:0.5rem;">
                             <button class="btn btn-sm btn-outline" onclick="openProductionLogger()"> Tracer une sortie</button>
                             <button class="btn btn-sm btn-primary" onclick="exportTraceability()">Exporter Registre</button>
                           </div>
                        </div>
                          </div>
                       </div>
                       <div class="table-responsive">
                          <table class="premium-table">`;
                          
        // Using a more robust regex to find the problematic block
        const traceRegex = /<div id="haccpViewTrace"[\s\S]+?<h3 class="widget-title-modern">[\s\S]+?<\/div>[\s\S]+?<\/div>[\s\S]+?<\/div>[\s\S]+?<div class="table-responsive">/;
        
        const traceReplacement = `<!-- Traceability View -->
                  <div id="haccpViewTrace" class="haccp-view" style="display:none;">
                    <div class="card glass-widget" style="padding: 2.5rem;">
                       <div class="flex-title" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:2rem;">
                          <h3 class="widget-title-modern"> 📦 Traçabilité des Productions</h3>
                          <div style="display:flex; gap:0.5rem;">
                             <button class="btn btn-sm btn-outline" onclick="openProductionLogger()"> Tracer une sortie</button>
                             <button class="btn btn-sm btn-primary" onclick="exportTraceability()">Exporter Registre</button>
                           </div>
                        </div>
                        <div class="table-responsive">
                           <table class="premium-table">`;

        content = content.replace(traceRegex, traceReplacement);

        // 3. Ensure Reception and Allergens take full width (fix mgmt-glass-card if needed)
        // Actually, the main issue is usually missing closing divs or extra ones that break the layout.
        
        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Portfolio and HACCP structure fixed");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixBugs();
