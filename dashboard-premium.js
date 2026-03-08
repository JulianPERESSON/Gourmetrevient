// dashboard-premium.js: Dedicated script for populating the Bento Premium Dashboard

document.addEventListener('DOMContentLoaded', () => {
    // We hook into the existing updateDashboard if possible, or an interval
    setInterval(hydratePremiumDashboard, 3000);
});

window.hydratePremiumDashboard = function () {
    if (!window.APP || !document.getElementById('hubSection') || document.getElementById('hubSection').style.display === 'none') {
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
    const recipes = (window.APP && window.APP.savedRecipes && window.APP.savedRecipes.length > 0)
        ? window.APP.savedRecipes
        : JSON.parse(localStorage.getItem(`gourmetrevient_recipes_${(localStorage.getItem('gourmet_current_user') || 'Ami').toLowerCase()}`) || '[]');

    const kpiRecEl = document.getElementById('kpiRecipes');
    if (kpiRecEl) kpiRecEl.textContent = recipes.length;

    // Averages
    let totalMargin = 0;
    let totalCost = 0;
    let count = 0;

    if (recipes.length > 0) {
        recipes.forEach(r => {
            // Priority: r.costs (saved) or r.data (live) or calculate if missing
            let m = r.costs || r.data;
            if (!m && typeof window.calcFullCost === 'function') {
                try { m = window.calcFullCost(r.margin || 70, r); } catch (e) { }
            }
            if (m) {
                totalMargin += m.marginPct || 0;
                totalCost += m.costPerPortion || 0;
                count++;
            }
        });

        const avgM = count > 0 ? (totalMargin / count) : 0;
        const avgC = count > 0 ? (totalCost / count) : 0;

        const kpiMargEl = document.getElementById('kpiMargin');
        if (kpiMargEl) kpiMargEl.textContent = avgM.toFixed(1) + '%';
        const dashPerfMargEl = document.getElementById('dashPerfMargin');
        if (dashPerfMargEl) dashPerfMargEl.textContent = avgM.toFixed(1) + '%';

        const kpiCostEl = document.getElementById('kpiAvgCost');
        if (kpiCostEl) kpiCostEl.textContent = avgC.toFixed(2) + ' €';

        // Update trends if they were 0
        const trendM = document.getElementById('trendMargin');
        if (trendM && avgM > 0 && trendM.textContent.includes('0.0')) {
            trendM.textContent = '▲ ' + (avgM - 65 > 0 ? (avgM - 65).toFixed(1) : '0.4') + '%';
        }
    } else {
        if (document.getElementById('kpiMargin')) document.getElementById('kpiMargin').textContent = '0%';
        if (document.getElementById('kpiAvgCost')) document.getElementById('kpiAvgCost').textContent = '0.00 €';
    }

    // Team
    const team = (window.APP && window.APP.teamMembers && window.APP.teamMembers.length > 0)
        ? window.APP.teamMembers
        : JSON.parse(localStorage.getItem(`gourmet_team_members_${(localStorage.getItem('gourmet_current_user') || 'Ami').toLowerCase()}`) || '[]');
    const kpiTeamEl = document.getElementById('kpiTeam');
    if (kpiTeamEl) kpiTeamEl.textContent = `${team.length}/6`;

    // 4. Inventaire/Logistics alerts
    const inv = (window.APP && window.APP.inventory && window.APP.inventory.length > 0)
        ? window.APP.inventory
        : JSON.parse(localStorage.getItem(`gourmet_inventory_${(localStorage.getItem('gourmet_current_user') || 'Ami').toLowerCase()}`) || '[]');
    let alerts = 0;
    inv.forEach(i => {
        if ((i.stock || i.qty) <= (i.alertThreshold || i.minStock || 0)) alerts++;
    });
    const kpiAlertsEl = document.getElementById('kpiAlerts');
    if (kpiAlertsEl) kpiAlertsEl.textContent = alerts;
    const healthStockDot = document.getElementById('healthStockDot');
    if (healthStockDot) {
        healthStockDot.className = alerts > 0 ? 'health-status-dot err' : 'health-status-dot ok';
        healthStockDot.nextElementSibling.textContent = alerts > 0 ? (i18n.t('dash.stock_alert') || 'Stock: Alerte') : (i18n.t('dash.stock_ok') || 'Stock: OK');
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
