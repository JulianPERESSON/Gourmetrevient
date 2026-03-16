// dashboard-premium.js: Dedicated script for populating the Bento Premium Dashboard (V2)

document.addEventListener('DOMContentLoaded', () => {
    // Initial hydration
    setTimeout(hydratePremiumDashboard, 500);
    // Refresh periodically
    setInterval(hydratePremiumDashboard, 10000);
});

window.hydratePremiumDashboard = function () {
    const hub = document.getElementById('hubSection');
    if (!hub || hub.style.display === 'none') return;

    // 0. Context & Utils
    const lang = window.currentLang || localStorage.getItem('gourmet_lang') || 'fr';
    const currUser = localStorage.getItem('gourmet_current_user') || 'Chef';
    const recipes = (window.APP && window.APP.savedRecipes && window.APP.savedRecipes.length > 0)
        ? window.APP.savedRecipes
        : JSON.parse(localStorage.getItem(`gourmetrevient_recipes_${currUser.toLowerCase()}`) || '[]');
    const inv = (window.APP && window.APP.inventory && window.APP.inventory.length > 0)
        ? window.APP.inventory
        : JSON.parse(localStorage.getItem(`gourmet_inventory_${currUser.toLowerCase()}`) || '[]');
    const team = (window.APP && window.APP.teamMembers && window.APP.teamMembers.length > 0)
        ? window.APP.teamMembers
        : JSON.parse(localStorage.getItem(`gourmet_team_members_${currUser.toLowerCase()}`) || '[]');

    const t = (key) => (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t(key) : key;

    // 1. Briefing Header: Date & User
    const dateHeaderEl = document.getElementById('dashDateHeader');
    if (dateHeaderEl) {
        const now = new Date();
        const opts = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateStr = now.toLocaleDateString(lang === 'fr' ? 'fr-FR' : (lang === 'es' ? 'es-ES' : 'en-US'), opts);
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        dateHeaderEl.textContent = dateStr + " • " + now.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    }
    
    const welcomeNameEl = document.getElementById('welcomeUserName');
    if (welcomeNameEl) welcomeNameEl.textContent = currUser;

    // 2. Metrics Calculation
    let totalMargin = 0;
    let marginCount = 0;
    recipes.forEach(r => {
        const m = r.costs?.marginPct || 70;
        totalMargin += m;
        marginCount++;
    });
    const avgMargin = marginCount > 0 ? (totalMargin / marginCount) : 72;

    let stockAlerts = inv.filter(item => (item.stock || 0) <= (item.alertThreshold || 5));
    
    // Simulate production for the demo if empty
    let prodCountToday = recipes.length > 0 ? recipes.length : 12;

    // Update Briefing Stats
    const bProd = document.getElementById('briefingProdCount');
    if (bProd) bProd.textContent = prodCountToday;
    
    const bAlert = document.getElementById('briefingAlertCount');
    if (bAlert) bAlert.textContent = stockAlerts.length;
    
    const bMargin = document.getElementById('briefingMarginValue');
    if (bMargin) bMargin.textContent = Math.round(avgMargin) + '%';

    // 3. Priorities List
    const priorityList = document.getElementById('dashPriorityList');
    if (priorityList) {
        let pHTML = '';
        
        // Priority 1: Launch Production (Always high)
        if (recipes.length > 0) {
            const topR = recipes[0];
            pHTML += `
                <div class="priority-item urgent">
                    <div class="p-icon">🍰</div>
                    <div class="p-content">
                        <div class="p-title">Lancer ${topR.name}</div>
                        <div class="p-desc">Production hebdomadaire à initier</div>
                    </div>
                    <button class="p-action-btn" onclick="document.getElementById('navMgmt').click(); switchMgmtTab('production');">Lancer</button>
                </div>
            `;
        }
        
        // Priority 2: Low Stock
        if (stockAlerts.length > 0) {
            const alertItem = stockAlerts[0];
            pHTML += `
                <div class="priority-item warning">
                    <div class="p-icon">🛒</div>
                    <div class="p-content">
                        <div class="p-title">Commander ${alertItem.name}</div>
                        <div class="p-desc">Stock critique: ${alertItem.stock} ${alertItem.unit || 'kg'}</div>
                    </div>
                    <button class="p-action-btn" onclick="document.getElementById('navSuppliers').click();">Commander</button>
                </div>
            `;
        }

        // Priority 3: Low Margins
        const lowMarginRecipes = recipes.filter(r => (r.costs?.marginPct || 70) < 68);
        if (lowMarginRecipes.length > 0) {
            const lowPerf = lowMarginRecipes[0];
            pHTML += `
                <div class="priority-item info">
                    <div class="p-icon">💰</div>
                    <div class="p-content">
                        <div class="p-title">Ajuster prix ${lowPerf.name}</div>
                        <div class="p-desc">Marge actuelle: ${Math.round(lowPerf.costs?.marginPct)}%</div>
                    </div>
                    <button class="p-action-btn" onclick="openRecipeEditorByName('${lowPerf.name}')">Réviser</button>
                </div>
            `;
        } else {
             pHTML += `
                <div class="priority-item info">
                    <div class="p-icon">⚖️</div>
                    <div class="p-content">
                        <div class="p-title">Vérification Inventaire</div>
                        <div class="p-desc">Mise à jour mensuelle recommandée</div>
                    </div>
                    <button class="p-action-btn" onclick="document.getElementById('navInventaire').click();">Ouvrir</button>
                </div>
            `;
        }
        
        priorityList.innerHTML = pHTML || '<p class="timeline-empty">Aucune priorité détectée.</p>';
    }

    // 4. AI Expert Advice
    const aiAdvice = document.getElementById('dashAIAdvice');
    if (aiAdvice) {
        const worst = [...recipes].sort((a,b) => (a.costs?.marginPct || 70) - (b.costs?.marginPct || 70))[0];
        if (worst) {
            const currentM = Math.round(worst.costs?.marginPct || 65);
            const targetM = 72;
            const diff = targetM - currentM;
            const suggestionPrice = (worst.costs?.sellingPriceHT || 5) * (diff / 100);
            
            aiAdvice.innerHTML = `
                <div class="ai-bubble">
                    <p><strong>${worst.name}</strong> : Votre marge est faible (${currentM}%). L'inflation impacte vos coûts.</p>
                    <div class="ai-actions">
                        <span class="ai-tip">💡 Suggéré: +${suggestionPrice.toFixed(2)}€ sur le prix de vente</span>
                        <span class="ai-tip">💡 Cibler une marge de ${targetM}%</span>
                    </div>
                </div>
            `;
        }
    }

    // 5. Production Timeline
    const prodTimeline = document.getElementById('dashProdTimeline');
    if (prodTimeline) {
        const dateFilter = window.dashProdDateFilter || 'today';
        if (recipes.length > 0) {
            let displayRecipes = (dateFilter === 'today') ? recipes.slice(0, 3) : recipes.slice(Math.min(recipes.length-1, 1), Math.min(recipes.length, 4));
            if (displayRecipes.length === 0) displayRecipes = recipes.slice(0,1);

            prodTimeline.innerHTML = displayRecipes.map((r, i) => {
                const progresses = (dateFilter === 'today') ? [75, 40, 0] : [0, 0, 0];
                const statusLabels = (dateFilter === 'today') ? ['En cours', 'À lancer', 'Planifié'] : ['Demain', 'Demain', 'Planifié'];
                const prog = progresses[i % 3];
                return `
                    <div class="prod-pill-v2">
                        <div class="prod-progress-circle">
                             <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform: rotate(-90deg);">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--cockpit-border)" stroke-width="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--cockpit-accent)" stroke-width="3" stroke-dasharray="${prog}, 100" />
                            </svg>
                            <span style="position:absolute; inset:0; display:flex; align-items:center; justify-content:center; font-size:0.65rem; font-weight:800;">${prog}%</span>
                        </div>
                        <div class="prod-info-v2">
                            <h4>${r.name}</h4>
                            <p>${statusLabels[i % 3]}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            prodTimeline.innerHTML = `<div class="timeline-empty">Aucune production planifiée pour ${dateFilter === 'today' ? "aujourd'hui" : "demain"}.</div>`;
        }
    }

    // 6. Stock Alerts Mini
    const stockMini = document.getElementById('dashStockAlerts');
    if (stockMini) {
        if (stockAlerts.length > 0) {
            stockMini.innerHTML = stockAlerts.slice(0, 3).map(item => `
                <div class="radar-item-mini">
                    <span>${item.name}</span>
                    <span style="color:var(--cockpit-danger)">${item.stock} ${item.unit || 'u'}</span>
                </div>
            `).join('');
        } else {
            stockMini.innerHTML = '<p style="font-size:0.8rem; color:var(--cockpit-success)">✅ Stocks optimaux</p>';
        }
    }

    // 7. Business Mini
    const topPerf = document.getElementById('dashTopPerf');
    if (topPerf) {
        const best = [...recipes].sort((a,b) => (b.costs?.marginPct || 0) - (a.costs?.marginPct || 0))[0];
        topPerf.textContent = best ? best.name : 'Veuillez ajouter des recettes';
    }
    const avgMarginEl = document.getElementById('dashAvgMargin');
    if (avgMarginEl) avgMarginEl.textContent = Math.round(avgMargin) + '%';

    // 8. Team Summary
    const presenceEl = document.getElementById('dashPresenceCount');
    if (presenceEl) presenceEl.textContent = (team.length || 3) + ' présents';

    // 9. Sparkline Chart (Mini-demo)
    renderMiniSparkline();
};

function renderMiniSparkline() {
    const canvas = document.getElementById('businessTrendSparkMini');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0,0,width,height);
    ctx.beginPath();
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    
    const points = [height*0.8, height*0.7, height*0.9, height*0.4, height*0.5, height*0.2, height*0.3];
    const step = width / (points.length - 1);
    
    ctx.moveTo(0, points[0]);
    points.forEach((p, i) => {
        ctx.lineTo(i * step, p);
    });
    ctx.stroke();
    
    // Fill
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.fillStyle = 'rgba(16, 185, 129, 0.1)';
    ctx.fill();
}

// Helper to find a recipe by name and open the editor
window.openRecipeEditorByName = function(name) {
    const recipes = window.APP?.savedRecipes || JSON.parse(localStorage.getItem(`gourmetrevient_recipes_${(localStorage.getItem('gourmet_current_user') || 'Chef').toLowerCase()}`) || '[]');
    const recipe = recipes.find(r => r.name === name);
    if (recipe && typeof window.openRecipeEditor === 'function') {
        window.openRecipeEditor(recipe);
    } else {
        document.getElementById('navRecettes').click();
    }
};

// Theme Toggle & Animations
document.addEventListener('DOMContentLoaded', () => {
    // Theme Toggle Handler
    const themeBtn = document.getElementById('themeToggleBtn');
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-theme');
            const isDark = document.body.classList.contains('dark-theme');
            localStorage.setItem('gourmet_theme', isDark ? 'dark' : 'light');
            updateThemeIcons(isDark);
        });

        // Initialize theme from localStorage
        const savedTheme = localStorage.getItem('gourmet_theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-theme');
            updateThemeIcons(true);
        }
    }

    // Hub Production Tabs
    const btnToday = document.getElementById('btnProdToday');
    const btnTomorrow = document.getElementById('btnProdTomorrow');
    if (btnToday && btnTomorrow) {
        btnToday.addEventListener('click', () => {
            btnToday.classList.add('active');
            btnTomorrow.classList.remove('active');
            window.dashProdDateFilter = 'today';
            hydratePremiumDashboard();
        });
        btnTomorrow.addEventListener('click', () => {
            btnTomorrow.classList.add('active');
            btnToday.classList.remove('active');
            window.dashProdDateFilter = 'tomorrow';
            hydratePremiumDashboard();
        });
    }

    // Animation entry
    const hub = document.getElementById('hubSection');
    if (window.gsap && hub) {
        gsap.from('.cockpit-card, .morning-briefing', {
            opacity: 0,
            y: 30,
            stagger: 0.1,
            duration: 1,
            ease: "expo.out"
        });
    }
});

function updateThemeIcons(isDark) {
    const sun = document.querySelector('.theme-icon-sun');
    const moon = document.querySelector('.theme-icon-moon');
    if (sun && moon) {
        sun.style.display = isDark ? 'none' : 'block';
        moon.style.display = isDark ? 'block' : 'none';
    }
}

// Language persistence & Sync
const originalSetLanguage = window.setLanguage;
window.setLanguage = function (lang) {
    if (typeof originalSetLanguage === 'function') originalSetLanguage(lang);

    // Update active state in switcher
    const btns = document.querySelectorAll('#headerLangSwitcher .lang-switcher-btn');
    btns.forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick') || '';
        const btnLang = onclickAttr.includes("'") ? onclickAttr.split("'")[1] : '';
        if (btnLang === lang) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Refresh dashboard to match language
    setTimeout(() => {
        if (typeof hydratePremiumDashboard === 'function') hydratePremiumDashboard();
    }, 100);
};

// Hook into showHub to ensure dashboard is always hydrated when shown
const originalShowHub = window.showHub;
window.showHub = function () {
    if (typeof originalShowHub === 'function') originalShowHub();
    setTimeout(() => {
        if (typeof hydratePremiumDashboard === 'function') hydratePremiumDashboard();
    }, 50);
};
