const fs = require('fs');

function addBostonAndResponsive() {
    try {
        let content = fs.readFileSync('index.html', 'utf8');
        
        // 1. Add mgmtViewBoston div
        const bostonHTML = `
        <!-- TAB: BOSTON MATRIX (BCG) -->
        <div id="mgmtViewBoston" class="mgmt-view" style="display:none;">
            <div class="stats-header" style="margin-bottom:2.5rem;">
                <h2 style="margin:0; font-family:var(--font-display); font-size:1.8rem; color:var(--primary);">🎯 Matrice Stratégique de Boston (BCG)</h2>
                <p style="color:var(--text-muted); margin:0; font-size:0.9rem;">Analysez la performance de votre catalogue : Rentabilité vs Volume de production.</p>
            </div>

            <div class="bcg-grid-container" style="display:grid; grid-template-columns: 1fr 1fr; grid-template-rows: 1fr 1fr; gap:1.5rem; height:600px; position:relative;">
                <!-- Stars -->
                <div class="bcg-quadrant stars" style="background:rgba(99, 102, 241, 0.05); border:2px dashed var(--primary); border-radius:20px; padding:2rem; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                        <h3 style="margin:0; color:var(--primary);">⭐  VOS STARS</h3>
                        <span class="badge" style="background:var(--primary); color:white;">Haute Marge / Haute Prod</span>
                    </div>
                    <div id="bcgStarsList" class="bcg-recipe-list"></div>
                </div>
                
                <!-- Question Marks -->
                <div class="bcg-quadrant questions" style="background:rgba(245, 158, 11, 0.05); border:2px dashed #f59e0b; border-radius:20px; padding:2rem; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                        <h3 style="margin:0; color:#f59e0b;">❓ DILEMMES</h3>
                        <span class="badge" style="background:#f59e0b; color:white;">Basse Marge / Haute Prod</span>
                    </div>
                    <div id="bcgQuestionsList" class="bcg-recipe-list"></div>
                </div>

                <!-- Cash Cows -->
                <div class="bcg-quadrant cows" style="background:rgba(16, 185, 129, 0.05); border:2px dashed #10b981; border-radius:20px; padding:2rem; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                        <h3 style="margin:0; color:#10b981;">💰 VACHES À LAIT</h3>
                        <span class="badge" style="background:#10b981; color:white;">Haute Marge / Basse Prod</span>
                    </div>
                    <div id="bcgCowsList" class="bcg-recipe-list"></div>
                </div>

                <!-- Dogs -->
                <div class="bcg-quadrant dogs" style="background:rgba(239, 68, 68, 0.05); border:2px dashed #ef4444; border-radius:20px; padding:2rem; display:flex; flex-direction:column;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1.5rem;">
                        <h3 style="margin:0; color:#ef4444;">📉 POIDS MORTS</h3>
                        <span class="badge" style="background:#ef4444; color:white;">Basse Marge / Basse Prod</span>
                    </div>
                    <div id="bcgDogsList" class="bcg-recipe-list"></div>
                </div>
            </div>
        </div>`;

        content = content.replace('<!-- TAB: INFLATION SIMULATOR -->', bostonHTML + '\n\n        <!-- TAB: INFLATION SIMULATOR -->');

        // 2. Add responsive CSS for HACCP tables
        const responsiveCSS = `
/* --- Responsive HACCP Security --- */
@media (max-width: 1200px) {
  .app-content-area { padding: 1.5rem !important; }
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    border-radius: 12px;
    box-shadow: inset 0 0 10px rgba(0,0,0,0.05);
  }
  .premium-table { min-width: 800px; }
  .bcg-grid-container { height: auto !important; grid-template-columns: 1fr !important; }
}
`;
        content = content.replace('</style>', responsiveCSS + '\n</style>');

        fs.writeFileSync('index.html', content, 'utf8');
        console.log("Boston Matrix restored and responsive CSS added.");
    } catch (err) {
        console.error("Error:", err);
    }
}

addBostonAndResponsive();
