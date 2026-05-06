const ToolGuide = (() => {

    const config = {
        'hubSection': {
            title: "Cockpit Gourmet",
            steps: [
                { target: '.hub-hero-actions', icon: '🚀', title: 'Actions Rapides', text: 'Lancez instantanément une nouvelle recette ou consultez vos statistiques globales ici.' },
                { target: '.hub-kpi-strip', icon: '📊', title: 'Indicateurs de Performance', text: 'Suivez vos indicateurs clés : production prévue, alertes stock critiques et marge moyenne du laboratoire.' },
                { target: '.hub-card-production', icon: '👨‍🍳', title: 'Planning de Production', text: 'Visualisez l\'ordre de fabrication du jour et préparez celui de demain en un clic.' },
                { target: '.hub-card-priorities', icon: '🔥', title: 'Priorités du Jour', text: 'L\'IA analyse vos urgences (commandes, péremptions) et vous dresse la liste des tâches critiques.' },
                { target: '.hub-card-ai', icon: '🤖', title: 'Assistant Expert', text: 'Recevez des conseils stratégiques personnalisés pour optimiser votre rentabilité et vos stocks.' },
                { target: '.hub-card-stock', icon: '📦', title: 'Radar Logistique', text: 'Surveillez en temps réel les ingrédients qui passent sous le seuil de sécurité pour ne jamais manquer de rien.' },
                { target: '.hub-card-pricewatch', icon: '🌡️', title: 'Météo des Prix', text: 'Suivez les variations de prix de vos ingrédients phares et anticipez l\'impact de l\'inflation sur vos marges.' },
                { target: '.hub-card-team', icon: '👥', title: 'Équipe & Sécurité', text: 'Gardez un œil sur les présences du jour et l\'état de vos relevés sanitaires HACCP en un coup d\'œil.' }
            ]
        },
        'appRecettes': {
            title: "Calculateur de Recettes",
            steps: [
                { target: '#btnCreateRecipe', icon: '⚖️', title: 'Nouvelle Recette', text: 'Cliquez ici pour commencer à créer votre fiche technique pas à pas.' },
                { target: '#recipeLibraryGrid', icon: '📖', title: 'Bibliothèque', text: 'Retrouvez toutes vos recettes sauvegardées et les classiques pré-calculés.' },
                { target: '#librarySearchInput', icon: '🔍', title: 'Recherche Rapide', text: 'Trouvez instantanément une recette par son nom ou sa catégorie.' }
            ]
        },
        'appInventaire': {
            title: "Gestion des Stocks",
            steps: [
                { target: '#invAddBtn', icon: '➕', title: 'Ajouter un Article', text: 'Enregistrez vos nouveaux produits et fixez vos seuils d\'alerte.' },
                { target: '#invStatsGrid', icon: '⚠️', title: 'Alertes Critiques', text: 'Surveillez les produits qui passent sous le seuil de sécurité.' },
                { target: '#invSearchInput', icon: '🔍', title: 'Filtres', text: 'Recherchez un ingrédient ou filtrez par catégorie (Laiterie, Sec, etc.).' }
            ]
        },
        'appLaboratoire': {
            title: "Laboratoire 2D",
            steps: [
                { target: '#budgetSlider', icon: '💰', title: 'Configuration Budget', text: 'Ajustez votre budget pour voir l\'équipement recommandé pour votre labo.' },
                { target: '#modeGrid', icon: '🍰', title: 'Type d\'Activité', text: 'Choisissez votre spécialité pour adapter les machines proposées.' },
                { target: '#canvasWrap', icon: '📐', title: 'Plan Interactif', text: 'Glissez-déposez vos équipements sur le plan pour optimiser vos flux.' }
            ]
        },
        'appMgmt': {
            title: "Pilotage & ERP",
            steps: [
                { target: '#mgmtTabDashboard', icon: '📊', title: 'Statistiques & Rentabilité', text: 'Analysez vos marges en temps réel, suivez la performance de vos produits et anticipez l\'impact de l\'inflation sur votre bénéfice.' },
                { target: '#mgmtTabProduction', icon: '📅', title: 'Production', text: 'Gérez vos bons de commande et vos besoins en matières premières.' },
                { target: '#mgmtTabQuality', icon: '🧼', title: 'Qualité & Pertes', text: 'Suivez vos déchets et maintenez votre matrice d\'allergènes à jour.' },
                { target: '#mgmtTabProTools', icon: '🛠️', title: 'Outils Métier', text: 'Accédez aux calculateurs spécifiques : étiquetage INCO, scanner OCR de factures et outils de conversion.' }
            ]
        }
    };

    let overlay = null;
    let tourStep = 0;
    let currentToolId = null;

    function init() {
        console.log('❓ ToolTour : Initialisation...');
        createUI();
        injectTriggers();
    }

    function createUI() {
        if (document.getElementById('toolTourBubble')) return;

        overlay = document.createElement('div');
        overlay.id = 'toolTourOverlay';
        overlay.className = 'tool-guide-overlay';
        overlay.innerHTML = `
            <div id="toolTourBackdrop" class="tool-tour-backdrop"></div>
            <div id="toolTourSpotlight" class="tool-tour-spotlight"></div>
            <div id="toolTourBubble" class="tool-tour-bubble">
                <div class="tool-tour-mascot">
                    <img src="personnage2.png" id="toolTourMascot" alt="Mascotte">
                </div>
                <div class="tool-tour-content">
                    <h4 id="toolTourTitle">Aide</h4>
                    <p id="toolTourText">Texte d'aide ici...</p>
                    <div class="tool-tour-footer">
                        <div class="tool-tour-progress-wrap">
                            <div class="tool-tour-progress-fill" id="toolTourProgress"></div>
                        </div>
                        <div class="tool-tour-btns">
                            <button class="btn btn-primary" id="toolTourNext" onclick="ToolGuide.nextStep()">Suivant</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(overlay);

        // Close on backdrop click
        document.getElementById('toolTourBackdrop').addEventListener('click', close);
    }

    function injectTriggers() {
        Object.keys(config).forEach(toolId => {
            const container = document.getElementById(toolId);
            if (container) {
                const existing = container.querySelector('.tool-help-trigger');
                if (existing) existing.remove();

                const trigger = document.createElement('button');
                trigger.className = 'tool-help-trigger';
                trigger.innerHTML = '❓';
                trigger.onclick = (e) => {
                    e.stopPropagation();
                    startTour(toolId);
                };
                container.appendChild(trigger);
            }
        });
    }

    function startTour(toolId) {
        currentToolId = toolId;
        tourStep = 0;
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        showStep();
    }

    function nextStep() {
        tourStep++;
        const steps = config[currentToolId].steps;
        if (tourStep >= steps.length) {
            close();
        } else {
            showStep();
        }
    }

    function showStep() {
        const steps = config[currentToolId].steps;
        const step = steps[tourStep];
        const bubble = document.getElementById('toolTourBubble');
        const spotlight = document.getElementById('toolTourSpotlight');
        const titleEl = document.getElementById('toolTourTitle');
        const textEl = document.getElementById('toolTourText');
        const progressEl = document.getElementById('toolTourProgress');
        const nextBtn = document.getElementById('toolTourNext');

        bubble.style.opacity = '0';
        spotlight.style.opacity = '0';
        
        titleEl.textContent = step.title;
        textEl.textContent = step.text;
        
        const progressPct = ((tourStep + 1) / steps.length) * 100;
        progressEl.style.width = `${progressPct}%`;
        
        nextBtn.textContent = (tourStep === steps.length - 1) ? 'Terminer' : 'Suivant';

        const target = document.querySelector(step.target);
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
            
            setTimeout(() => {
                const rect = target.getBoundingClientRect();
                const cardHeight = bubble.offsetHeight || 380;
                const cardWidth = bubble.offsetWidth || 720;

                // Position spotlight
                spotlight.style.top = (rect.top - 10) + 'px';
                spotlight.style.left = (rect.left - 10) + 'px';
                spotlight.style.width = (rect.width + 20) + 'px';
                spotlight.style.height = (rect.height + 20) + 'px';
                spotlight.style.opacity = '1';

                // Intelligent positioning to avoid overlap
                let top, left;
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;

                if (spaceBelow > cardHeight + 80) {
                    // Plenty of space below
                    top = rect.bottom + 60;
                } else if (spaceAbove > cardHeight + 80) {
                    // Plenty of space above
                    top = rect.top - cardHeight - 60;
                } else {
                    // Not enough space above OR below, center vertically and move to side if possible
                    top = Math.max(20, (window.innerHeight - cardHeight) / 2);
                }

                left = rect.left + (rect.width / 2) - (cardWidth / 2);
                left = Math.max(20, Math.min(left, window.innerWidth - cardWidth - 20));

                // Final collision check with spotlight
                const bubbleRect = { top, left, bottom: top + cardHeight, right: left + cardWidth };
                const spotlightRect = { top: rect.top - 20, left: rect.left - 20, bottom: rect.bottom + 20, right: rect.right + 20 };

                const overlaps = !(bubbleRect.right < spotlightRect.left || 
                                   bubbleRect.left > spotlightRect.right || 
                                   bubbleRect.bottom < spotlightRect.top || 
                                   bubbleRect.top > spotlightRect.bottom);

                if (overlaps) {
                    // If still overlaps, force to the side
                    if (rect.left > cardWidth + 40) {
                        left = rect.left - cardWidth - 40;
                    } else if (window.innerWidth - rect.right > cardWidth + 40) {
                        left = rect.right + 40;
                    }
                }

                bubble.style.transform = `translate3d(${left}px, ${top}px, 0)`;
                bubble.style.opacity = '1';
                
                // Highlight classes
                document.querySelectorAll('.tool-tour-highlight').forEach(el => el.classList.remove('tool-tour-highlight'));
                target.classList.add('tool-tour-highlight');
            }, 700);
        } else {
            spotlight.style.opacity = '0';
            bubble.style.top = '50%';
            bubble.style.left = '50%';
            bubble.style.transform = 'translate(-50%, -50%)';
            bubble.style.opacity = '1';
        }
    }

    function close() {
        if (!overlay) return;
        overlay.classList.remove('active');
        document.body.style.overflow = '';
        document.querySelectorAll('.tool-tour-highlight').forEach(el => el.classList.remove('tool-tour-highlight'));
    }

    return { init, startTour, nextStep, close };

})();

window.ToolGuide = ToolGuide;
document.addEventListener('DOMContentLoaded', () => ToolGuide.init());
