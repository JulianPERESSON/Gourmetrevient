const ToolGuide = (() => {

    const config = {
        'hubSection': {
            title: "Cockpit Gourmet",
            steps: [
                { target: '.hub-hero-left', icon: '👤', title: 'Bienvenue Chef ! 👋', text: 'Configurez votre espace de pilotage en quelques étapes pour retrouver vos informations et préférences.' },
                { target: '.hub-hero-actions', icon: '🚀', title: 'Actions Rapides', text: 'Créez une nouvelle fiche recette ou consultez vos statistiques clés en un clic.' },
                { target: '.hub-kpi-strip', icon: '📊', title: 'Indicateurs Clés', text: 'Suivez en temps réel votre volume de production, vos alertes stock et votre rentabilité moyenne.' },
                { target: '.hub-card-production', icon: '👨‍🍳', title: 'Planning du Jour', text: 'Visualisez les recettes à produire aujourd\'hui et demain. Organisez votre laboratoire efficacement.' },
                { target: '.hub-card-priorities', icon: '🔥', title: 'Priorités Stratégiques', text: 'Retrouvez ici la liste des tâches et urgences critiques pour optimiser votre organisation quotidienne.' },
                { target: '.hub-card-ai', icon: '🤖', title: 'Analyses Prédictives', text: 'Recevez des conseils basés sur vos données pour optimiser votre marge et vos coûts matières.' },
                { target: '.hub-card-stock', icon: '📦', title: 'Radar des Stocks', text: 'Gardez un œil sur vos ingrédients critiques pour ne jamais être à court de matières premières.' },
                { target: '.hub-card-pricewatch', icon: '🌡️', title: 'Météo des Prix', text: 'Suivez l\'évolution des cours de vos ingrédients et anticipez l\'inflation sur vos marges.' },
                { target: '.hub-card-team', icon: '👥', title: 'Équipe & HACCP', text: 'Gérez la présence de votre staff et assurez la conformité totale de vos relevés sanitaires.' }
            ]
        },
        'appRecettes': {
            title: "Calculateur de Recettes",
            steps: [
                { target: '#btnCreateRecipe', icon: '⚖️', title: 'Nouvelle Recette', text: 'Commencez à créer votre fiche technique pas à pas avec notre calculateur intelligent.' },
                { target: '#recipeLibraryGrid', icon: '📖', title: 'Bibliothèque', text: 'Retrouvez toutes vos recettes sauvegardées et les classiques pré-calculés du catalogue.' },
                { target: '.library-filters', icon: '🔍', title: 'Filtres & Recherche', text: 'Trouvez instantanément une recette par catégorie, ingrédient ou mot-clé.' }
            ]
        },
        'appInventaire': {
            title: "Gestion des Stocks",
            steps: [
                { target: '.inv-stats', icon: '📊', title: 'Résumé des Stocks', text: 'Visualisez en un coup d\'œil vos alertes critiques et la valeur totale de votre réserve.' },
                { target: '.inv-main-table', icon: '📦', title: 'Registre d\'Inventaire', text: 'Gérez vos quantités, suivez vos DLC et ajustez vos prix d\'achat.' },
                { target: '[onclick="showRestockModal()"]', icon: '➕', title: 'Réception Marchandises', text: 'Enregistrez vos nouveaux arrivages pour mettre à jour vos stocks instantanément.' },
                { target: '[onclick="simulateInvoiceScan()"]', icon: '📸', title: 'Scan Intelligent', text: 'Gagnez du temps en scannant vos factures pour mettre à jour vos prix.' }
            ]
        },
        'mgmtViewDashboard': {
            title: "Tableau de Bord & Stats",
            steps: [
                { target: '#v2MarginChart', icon: '🍩', title: 'Répartition des Marges', text: 'Visualisez la santé financière globale de votre catalogue : Critique, Vigilance ou Excellent.' },
                { target: '#v2PerformanceChart', icon: '📈', title: 'Top Performances', text: 'Identifiez vos produits les plus rentables et ceux nécessitant une révision.' },
                { target: '#v2ScatterChart', icon: '⚖️', title: 'Analyse Coût/Marge', text: 'Positionnez vos produits tactiquement : Stars, Premium, Volume ou Risque.' },
                { target: '#statsVigilanceList', icon: '🚨', title: 'Points de Vigilance', text: 'Liste des produits nécessitant une révision immédiate suite aux variations de prix matières.' }
            ]
        },
        'appHACCP': {
            title: "Traçabilité & Hygiène",
            steps: [
                { target: '.hygiene-kpi-grid', icon: '🧼', title: 'Tableau de Bord Sanitaire', text: 'Suivez vos indicateurs d\'hygiène, vos relevés de température et vos tâches de nettoyage.' },
                { target: '.sidebar-nav-group', icon: '📂', title: 'Modules Qualité', text: 'Basculez entre le suivi des températures, le plan de nettoyage et le registre des allergènes.' }
            ]
        },
        'mgmtViewProTools': {
            title: "Outils Métier",
            steps: [
                { target: '#proToolsGrid', icon: '🛠️', title: 'Centre de Ressources', text: 'Retrouvez tous les utilitaires indispensables au quotidien du pâtissier.' },
                { target: '.protools-card:nth-child(1)', icon: '📷', title: 'Scan OCR', text: 'Extrayez les prix de vos factures automatiquement grâce à l\'intelligence artificielle.' },
                { target: '#mcProToolCard', icon: '📏', title: 'Master Converter', text: 'Adaptez vos recettes à n\'importe quelle taille de moule en gardant les proportions parfaites.' }
            ]
        }
    };

    let overlay = null;
    let tourStep = 0;
    let currentToolId = null;

    function init() {
        console.log('❓ ToolGuide : Restauration de la couverture globale...');
        createUI();
        startSafetyInjections();
    }

    function createUI() {
        if (document.getElementById('toolTourBubble')) return;
        overlay = document.createElement('div');
        overlay.id = 'toolTourOverlay';
        overlay.style.cssText = "position:absolute; top:0; left:0; width:0; height:0; z-index:2147483647;";
        overlay.innerHTML = `
            <style>
                .tool-tour-backdrop { position: fixed; inset: 0; pointer-events: none; z-index: 2147483640; background: transparent; }
                .tool-tour-spotlight { position: fixed; border-radius: 24px; z-index: 2147483641; pointer-events: none; box-shadow: 0 0 0 9999px rgba(17, 24, 39, 0.85); transition: all 0.4s ease; opacity: 0; border: 2.5px solid white; }
                #toolTourBubble {
                    position: fixed; z-index: 2147483647 !important; width: 480px !important; 
                    background: #FFFFFF !important; border-radius: 40px !important; 
                    box-shadow: 0 40px 150px rgba(0,0,0,0.6) !important;
                    display: none; flex-direction: column !important; align-items: center !important;
                    text-align: center !important; padding: 45px !important; border: 1px solid rgba(0,0,0,0.1) !important;
                    opacity: 0; transition: opacity 0.3s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .tt-avatar-box {
                    width: 170px; height: 170px; margin-bottom: 30px;
                    border-radius: 50%; background: #FFFFFF;
                    overflow: hidden; box-shadow: 0 10px 40px rgba(0,0,0,0.15);
                    background-image: url('personnage2.png');
                    background-size: 110%; 
                    background-position: center 2%; 
                    background-repeat: no-repeat;
                    image-rendering: auto;
                }
                .tt-title { font-size: 30px !important; font-weight: 950 !important; color: #0f172a !important; margin: 0 0 15px 0 !important; }
                .tt-text { font-size: 19px !important; line-height: 1.7 !important; color: #5B6475 !important; margin: 0 0 45px 0 !important; }
                .tt-footer { display: flex !important; align-items: center !important; justify-content: space-between !important; width: 100% !important; }
                .tt-dot { width: 10px; height: 10px; border-radius: 50%; background: #E2E8F0; }
                .tt-dot.active { background: #6D5DFB; transform: scale(1.3); }
                .tt-btn {
                    background: linear-gradient(135deg, #6D5DFB, #5A4FF3) !important; color: white !important; 
                    border: none !important; border-radius: 20px !important; padding: 16px 36px !important; 
                    font-size: 19px !important; font-weight: 700 !important; cursor: pointer !important; 
                }
            </style>
            <div id="toolTourBackdrop" class="tool-tour-backdrop"></div>
            <div id="toolTourSpotlight" class="tool-tour-spotlight"></div>
            <div id="toolTourBubble">
                <div class="tt-avatar-box"></div>
                <h4 id="toolTourTitle" class="tt-title"></h4>
                <p id="toolTourText" class="tt-text"></p>
                <div class="tt-footer">
                    <div id="toolTourStepper" style="display:flex; gap:10px;"></div>
                    <button class="tt-btn" onclick="ToolGuide.nextStep()"><span>Suivant</span></button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
        document.getElementById('toolTourBackdrop').addEventListener('click', close);
    }

    function startSafetyInjections() {
        setInterval(() => {
            const loader = document.getElementById('premiumSplash');
            const auth = document.getElementById('authManualOverlay');
            if ((!loader || window.getComputedStyle(loader).display === 'none') && (!auth || window.getComputedStyle(auth).display === 'none')) {
                injectTriggers();
            } else { hideAllTriggers(); }
        }, 1500);
    }

    function hideAllTriggers() { document.querySelectorAll('.tool-help-trigger').forEach(t => t.style.display = 'none'); }

    function injectTriggers() {
        Object.keys(config).forEach(toolId => {
            const container = document.getElementById(toolId);
            if (container) {
                // Smart Docking: Target action bars with PDF/Export buttons first
                const pdfBtn = container.querySelector('[onclick*="PDF"], [onclick*="Pdf"], [onclick*="export"]');
                let target = pdfBtn ? pdfBtn.parentElement : (
                             container.querySelector('.stats-header > div:last-child') || 
                             container.querySelector('.header-actions') || 
                             container.querySelector('.widget-header .header-actions')
                );
                             
                let isFlex = !!target;
                if (!target) target = container;

                let trigger = target.querySelector('.tool-help-trigger');
                if (!trigger) {
                    trigger = document.createElement('button');
                    trigger.className = 'tool-help-trigger';
                    trigger.innerHTML = '❓';
                    
                    if (isFlex) {
                        // Premium White Style for better integration
                        trigger.style.cssText = "background:#FFFFFF; color:#5A4FF3; border:2px solid #5A4FF3; width:38px; height:38px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:18px; box-shadow:0 4px 15px rgba(0,0,0,0.1); flex-shrink:0; margin-left:8px; transition:transform 0.2s; font-weight:bold;";
                        
                        // Precise corner docking for the Dashboard header
                        if (toolId === 'mgmtViewDashboard') {
                             const header = container.querySelector('.stats-header');
                             if (header) {
                                 header.style.position = 'relative';
                                 trigger.style.position = 'absolute';
                                 trigger.style.top = '-5px';
                                 trigger.style.right = '-5px';
                                 trigger.style.margin = '0';
                                 target = header; // Inject directly into header for absolute positioning
                             }
                        }
                    } else {
                        // Fallback to absolute positioning if no header found
                        trigger.style.cssText = "position:absolute; top:15px; right:15px; background:#FFFFFF; color:#5A4FF3; border:2px solid #5A4FF3; width:44px; height:44px; border-radius:50%; display:flex; align-items:center; justify-content:center; cursor:pointer; font-size:20px; box-shadow:0 10px 20px rgba(0,0,0,0.15); z-index:2147483647; transition:transform 0.2s; font-weight:bold;";
                    }

                    trigger.onmouseover = () => trigger.style.transform = "scale(1.1)";
                    trigger.onmouseout = () => trigger.style.transform = "scale(1)";
                    trigger.onclick = (e) => { e.stopPropagation(); startTour(toolId); };
                    
                    if (!isFlex && window.getComputedStyle(container).position === 'static') container.style.position = 'relative';
                    target.appendChild(trigger);
                } else { trigger.style.display = 'flex'; }
            }
        });
    }

    function startTour(toolId) {
        currentToolId = toolId; tourStep = 0;
        const bubble = document.getElementById('toolTourBubble');
        bubble.style.display = 'flex';
        setTimeout(() => { bubble.style.opacity = '1'; }, 50);
        showStep();
    }

    function nextStep() {
        tourStep++;
        const steps = config[currentToolId].steps;
        if (tourStep >= steps.length) close(); else showStep();
    }

    function showStep() {
        const steps = config[currentToolId].steps;
        const step = steps[tourStep];
        const bubble = document.getElementById('toolTourBubble');
        const spotlight = document.getElementById('toolTourSpotlight');
        const titleEl = document.getElementById('toolTourTitle');
        const textEl = document.getElementById('toolTourText');
        const stepperEl = document.getElementById('toolTourStepper');

        titleEl.textContent = step.title;
        textEl.textContent = step.text;
        stepperEl.innerHTML = steps.map((_, i) => `<div class="tt-dot ${i === tourStep ? 'active' : ''}"></div>`).join('');

        const avatarBox = document.querySelector('.tt-avatar-box');
        if (avatarBox) {
            const isHub = currentToolId === 'hubSection';
            avatarBox.style.backgroundImage = isHub ? "url('personnage.png')" : "url('personnage2.png')";
            avatarBox.style.backgroundSize = isHub ? "145%" : "110%";
            avatarBox.style.backgroundPosition = isHub ? "center 6%" : "center 2%";
        }

        const target = document.querySelector(step.target);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
                const rect = target.getBoundingClientRect();
                spotlight.style.top = (rect.top - 10) + 'px';
                spotlight.style.left = (rect.left - 10) + 'px';
                spotlight.style.width = (rect.width + 20) + 'px';
                spotlight.style.height = (rect.height + 20) + 'px';
                spotlight.style.opacity = '1';

                const cardHeight = bubble.offsetHeight || 500;
                const cardWidth = bubble.offsetWidth || 480;
                let top, left;

                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                const spaceRight = window.innerWidth - rect.right;
                const spaceLeft = rect.left;

                if (spaceBelow > cardHeight + 100) {
                    top = rect.bottom + 80;
                    left = rect.left + (rect.width / 2) - (cardWidth / 2);
                } else if (spaceAbove > cardHeight + 100) {
                    top = rect.top - cardHeight - 80;
                    left = rect.left + (rect.width / 2) - (cardWidth / 2);
                } else if (spaceRight > cardWidth + 100) {
                    top = rect.top + (rect.height / 2) - (cardHeight / 2);
                    left = rect.right + 80;
                } else if (spaceLeft > cardWidth + 100) {
                    top = rect.top + (rect.height / 2) - (cardHeight / 2);
                    left = rect.left - cardWidth - 80;
                } else {
                    top = (window.innerHeight - cardHeight) / 2;
                    left = (window.innerWidth - cardWidth) / 2;
                }

                left = Math.max(20, Math.min(left, window.innerWidth - cardWidth - 20));
                top = Math.max(20, Math.min(top, window.innerHeight - cardHeight - 20));

                bubble.style.transform = `translate3d(${left}px, ${top}px, 0) scale(1)`;
            }, 400);
        }
    }

    function close() {
        const bubble = document.getElementById('toolTourBubble');
        if (bubble) { bubble.style.opacity = '0'; setTimeout(() => { bubble.style.display = 'none'; }, 300); }
        const spotlight = document.getElementById('toolTourSpotlight');
        if (spotlight) spotlight.style.opacity = '0';
    }

    return { init, startTour, nextStep, close };
})();

window.ToolGuide = ToolGuide;
ToolGuide.init();
