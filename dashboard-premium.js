// dashboard-premium.js: Dedicated script for populating the Bento Premium Dashboard

document.addEventListener('DOMContentLoaded', () => {
    // We hook into the existing updateDashboard if possible, or an interval
    setInterval(hydratePremiumDashboard, 3000);
});

window.hydratePremiumDashboard = function () {
    if (!document.getElementById('hubSection') || document.getElementById('hubSection').style.display === 'none') {
        return;
    }

    // 1. Live Time
    const liveTimeEl = document.getElementById('dashLiveTime');
    const dateHeaderEl = document.getElementById('dashDateHeader');
    if (dateHeaderEl) {
        const now = new Date();
        const opts = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateStr = now.toLocaleDateString('fr-FR', opts);
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        dateHeaderEl.childNodes[0].nodeValue = dateStr + " ";
    }
    if (liveTimeEl) {
        liveTimeEl.textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    }

    // 2. Avatar & Global State
    const currentUser = JSON.parse(localStorage.getItem('gourmet_users_db') || '{}');
    const currName = localStorage.getItem('gourmet_current_user');
    let gender = 'male';
    if (currName && currentUser[currName] && currentUser[currName].gender) {
        gender = currentUser[currName].gender;
    }
    const avatarEl = document.getElementById('dashAvatar');
    if (avatarEl) {
        avatarEl.textContent = gender === 'female' ? '👩‍🍳' : '👨‍🍳';
    }

    // 3. Populate KPIs
    // Recipes count
    const recipes = JSON.parse(localStorage.getItem('gourmet_saved_recipes') || '[]');
    const kpiRecEl = document.getElementById('kpiRecipes');
    if (kpiRecEl) kpiRecEl.textContent = recipes.length;

    // Averages
    let totalMargin = 0;
    let totalCost = 0;
    if (recipes.length > 0) {
        recipes.forEach(r => {
            totalMargin += r.costs?.marginPct || 0;
            totalCost += r.costs?.costPerPortion || 0;
        });
        const avgM = totalMargin / recipes.length;
        const avgC = totalCost / recipes.length;

        const kpiMargEl = document.getElementById('kpiMargin');
        if (kpiMargEl) kpiMargEl.textContent = avgM.toFixed(1) + '%';
        const dashPerfMargEl = document.getElementById('dashPerfMargin');
        if (dashPerfMargEl) dashPerfMargEl.textContent = avgM.toFixed(1) + '%';

        const kpiCostEl = document.getElementById('kpiAvgCost');
        if (kpiCostEl) kpiCostEl.textContent = avgC.toFixed(2) + ' €';
    } else {
        const kpiMargEl = document.getElementById('kpiMargin');
        if (kpiMargEl) kpiMargEl.textContent = '0%';
        const kpiCostEl = document.getElementById('kpiAvgCost');
        if (kpiCostEl) kpiCostEl.textContent = '0.00 €';
    }

    // Team
    const team = JSON.parse(localStorage.getItem('gourmet_team_members') || '[]');
    const kpiTeamEl = document.getElementById('kpiTeam');
    if (kpiTeamEl) kpiTeamEl.textContent = `${team.length}/6`;

    // 4. Inventaire/Logistics alerts
    const inv = JSON.parse(localStorage.getItem('gourmet_inventory') || '[]');
    let alerts = 0;
    inv.forEach(i => {
        if (i.qty <= (i.minStock || 0)) alerts++;
    });
    const kpiAlertsEl = document.getElementById('kpiAlerts');
    if (kpiAlertsEl) kpiAlertsEl.textContent = alerts;
    const healthStockDot = document.getElementById('healthStockDot');
    if (healthStockDot) {
        healthStockDot.className = alerts > 0 ? 'health-status-dot err' : 'health-status-dot ok';
        healthStockDot.nextElementSibling.textContent = alerts > 0 ? 'Stock: Alerte' : 'Stock: OK';
    }

    // Top and Worst Recipes
    const sortedByMargin = [...recipes].sort((a, b) => (b.costs?.marginPct || 0) - (a.costs?.marginPct || 0));
    const topDash = document.getElementById('dashTopRecipes');
    if (topDash) {
        const top3 = sortedByMargin.slice(0, 3);
        topDash.innerHTML = top3.map(r => `
            <div class="recipe-row" style="margin-bottom:2px; font-size:0.75rem;">
                <span>${r.name}</span><span class="recipe-label-badge badge-success" style="font-size:0.65rem;">${r.costs?.marginPct ? Math.round(r.costs.marginPct) : 0}%</span>
            </div>
        `).join('') || '<div class="recipe-row"><span style="color:#aaa;">Aucune recette</span></div>';
    }


    const worstDash = document.getElementById('dashWorstRecipes');
    if (worstDash) {
        // reversed order
        const reverse = [...sortedByMargin].reverse();
        const worst3 = reverse.slice(0, 3);
        worstDash.innerHTML = worst3.map(r => `
            <div class="recipe-row" style="margin-bottom:2px; font-size:0.75rem;">
                <span>${r.name}</span><span class="recipe-label-badge badge-danger" style="font-size:0.65rem;">${r.costs?.marginPct ? Math.round(r.costs.marginPct) : 0}%</span>
            </div>
        `).join('') || `<div class="recipe-row"><span style="color:#aaa;">${i18n.t('dash.no_recipes')}</span></div>`;
    }

    if (!window.tipInitialized) {
        updateRandomTip();
        window.tipInitialized = true;
    }
};

window.updateRandomTip = function () {
    const tipBody = document.getElementById('dashTipBody');
    if (!tipBody) return;

    // Check if t() function is available (from i18n.js)
    if (typeof t !== 'function') return;

    const tips = [];
    for (let i = 1; i <= 11; i++) {
        const val = t(`tip.${i}`);
        if (val && val !== `tip.${i}`) tips.push(val);
    }

    if (tips.length > 0) {
        const randomTip = tips[Math.floor(Math.random() * tips.length)];
        tipBody.textContent = randomTip;

        // Add a small fade animation if possible
        tipBody.style.opacity = 0;
        setTimeout(() => {
            tipBody.style.opacity = 1;
        }, 50);
    }
};

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', () => {
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
});

function updateThemeIcons(isDark) {
    const sun = document.querySelector('.theme-icon-sun');
    const moon = document.querySelector('.theme-icon-moon');
    if (sun && moon) {
        sun.style.display = isDark ? 'none' : 'block';
        moon.style.display = isDark ? 'block' : 'none';
    }
}

// Language persistence for premium dash
const originalSetLanguage = window.setLanguage;
window.setLanguage = function (lang) {
    if (originalSetLanguage) originalSetLanguage(lang);

    // Update active state in switcher
    const btns = document.querySelectorAll('#headerLangSwitcher .lang-switcher-btn');
    btns.forEach(btn => {
        const btnLang = btn.getAttribute('onclick').match(/'(.*)'/)[1];
        if (btnLang === lang) btn.classList.add('active');
        else btn.classList.remove('active');
    });

    // Refresh tip to match language
    setTimeout(window.updateRandomTip, 100);
    setTimeout(window.hydratePremiumDashboard, 100);
};

// Also attach to window.showHub to ensure it triggers on navigation
const originalShowHub = window.showHub;
window.showHub = function () {
    if (originalShowHub) originalShowHub();
    setTimeout(window.hydratePremiumDashboard, 50);
};
