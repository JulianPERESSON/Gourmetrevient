// dashboard-premium.js: Dedicated script for populating the Bento Premium Dashboard

document.addEventListener('DOMContentLoaded', () => {
    // We hook into the existing updateDashboard if possible, or an interval
    setInterval(hydratePremiumDashboard, 3000);
});

window.hydratePremiumDashboard = function () {
    if (!window.APP || !document.getElementById('hubSection') || document.getElementById('hubSection').style.display === 'none') {
        return;
    }

    // 1. Date & Time
    const dateHeaderEl = document.getElementById('dashDateHeader');
    if (dateHeaderEl) {
        const now = new Date();
        const opts = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateStr = now.toLocaleDateString(i18n.currentLang === 'fr' ? 'fr-FR' : (i18n.currentLang === 'es' ? 'es-ES' : 'en-US'), opts);
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        dateHeaderEl.textContent = dateStr + " • " + now.toLocaleTimeString(i18n.currentLang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // 2. Avatar
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

    // 3. Lab Weather & Priority
    const labWeatherEl = document.getElementById('labWeather');
    const priorityEl = document.getElementById('nextPriorityTime');
    if (priorityEl) {
        // Mock next priority: +2 hours from now
        const now = new Date();
        now.setHours(now.getHours() + 2);
        priorityEl.textContent = now.getHours() + ":" + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes();
    }

    // 4. KPIs
    const recipes = (window.APP && window.APP.savedRecipes && window.APP.savedRecipes.length > 0)
        ? window.APP.savedRecipes
        : JSON.parse(localStorage.getItem(`gourmetrevient_recipes_${(localStorage.getItem('gourmet_current_user') || 'Ami').toLowerCase()}`) || '[]');

    const kpiRecEl = document.getElementById('kpiRecipes');
    if (kpiRecEl) kpiRecEl.textContent = recipes.length;

    let totalMargin = 0;
    let totalCost = 0;
    let count = 0;

    if (recipes.length > 0) {
        recipes.forEach(r => {
            let m = r.costs || r.data;
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
        const kpiCostEl = document.getElementById('kpiAvgCost');
        if (kpiCostEl) kpiCostEl.textContent = avgC.toFixed(2) + ' €';
    }

    // 5. Team
    const team = (window.APP && window.APP.teamMembers && window.APP.teamMembers.length > 0)
        ? window.APP.teamMembers
        : JSON.parse(localStorage.getItem(`gourmet_team_members_${(localStorage.getItem('gourmet_current_user') || 'Ami').toLowerCase()}`) || '[]');
    const kpiTeamEl = document.getElementById('kpiTeam');
    if (kpiTeamEl) kpiTeamEl.textContent = `${team.length}/6`;

    // 6. Logistics Radar (Stocks)
    const inv = (window.APP && window.APP.inventory && window.APP.inventory.length > 0)
        ? window.APP.inventory
        : JSON.parse(localStorage.getItem(`gourmet_inventory_${(localStorage.getItem('gourmet_current_user') || 'Ami').toLowerCase()}`) || '[]');
    
    let alerts = 0;
    const radarList = document.getElementById('dashRuptureList');
    if (radarList) {
        const sortedInv = [...inv].sort((a,b) => (a.stock || 0) - (b.stock || 0)).slice(0, 3);
        if (sortedInv.length > 0) {
            radarList.innerHTML = sortedInv.map(item => {
                const stock = item.stock || 0;
                const min = item.alertThreshold || 5;
                const pct = Math.min(100, (stock / (min * 2)) * 100);
                const isLow = stock <= min;
                if (isLow) alerts++;
                return `
                    <div class="radar-item">
                        <div class="radar-meta">
                            <span>${item.name}</span>
                            <span style="color:${isLow ? 'var(--cockpit-danger)' : 'inherit'}">${stock} ${item.unit || 'kg'}</span>
                        </div>
                        <div class="radar-gauge">
                            <div class="radar-fill" style="width:${pct}%; background:${isLow ? 'var(--cockpit-danger)' : 'var(--cockpit-success)'}"></div>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
            radarList.innerHTML = `<p style="font-size:0.8rem; color:var(--cockpit-text-muted); text-align:center;">${i18n.t('dash.no_stock_alerts') || 'Stocks OK'}</p>`;
        }
    }

    const kpiAlertsEl = document.getElementById('kpiAlerts');
    if (kpiAlertsEl) {
        kpiAlertsEl.textContent = alerts;
        if (labWeatherEl) {
            const icon = document.getElementById('labWeatherIcon');
            const text = document.getElementById('labWeatherText');
            if (alerts > 2) {
                labWeatherEl.className = 'lab-weather storm';
                if (icon) icon.textContent = '⛈️';
                if (text) text.textContent = i18n.t('dash.cockpit.status.storm');
            } else {
                labWeatherEl.className = 'lab-weather';
                if (icon) icon.textContent = '☀️';
                if (text) text.textContent = i18n.t('dash.cockpit.status.ok');
            }
        }
    }

    // 7. Production Hub
    const prodList = document.getElementById('dashProductionList');
    if (prodList) {
        // In a real app, this would come from a production planning state.
        // For the demo/cockpit, we use a mix of real recipes and mock status.
        const activeProd = recipes.slice(0, 4);
        if (activeProd.length > 0) {
            prodList.innerHTML = activeProd.map((r, idx) => {
                const progresses = [65, 0, 0, 100];
                const statusIcons = ['🔄', '⏳', '📅', '✅'];
                const prog = progresses[idx] || 0;
                return `
                    <div class="prod-pill-card">
                        <div class="prod-circle">
                            <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform: rotate(-90deg);">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" stroke-width="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--cockpit-accent)" stroke-width="3" stroke-dasharray="${prog}, 100" />
                                <text x="18" y="20.35" font-size="8" text-anchor="middle" fill="var(--cockpit-text-main)" style="transform: rotate(90deg); transform-origin: center;">${statusIcons[idx] || '•'}</text>
                            </svg>
                        </div>
                        <div class="prod-info-main">
                            <h4>${r.name}</h4>
                            <p>${prog}% • ${prog === 100 ? i18n.t('dash.prod.done') : (prog > 0 ? i18n.t('dash.prod.ongoing') : i18n.t('dash.prod.todo'))}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else {
             prodList.innerHTML = `<div style="grid-column:span 2; text-align:center; padding:20px; color:var(--cockpit-text-muted); font-size:0.85rem;">${i18n.t('mgmt.production.no_recipes')}</div>`;
        }
    }

    // 8. Performance Sparkline & Lists
    const sortedByMargin = [...recipes].sort((a, b) => (b.costs?.marginPct || 0) - (a.costs?.marginPct || 0));
    const topDash = document.getElementById('dashTopRecipes');
    if (topDash) {
        const top2 = sortedByMargin.slice(0, 2);
        topDash.innerHTML = `<span class="kpi-label">💎 Top</span>` + top2.map(r => `
            <div style="font-size:0.75rem; font-weight:700; margin-bottom:4px;">${r.name} <span style="color:var(--cockpit-success)">${Math.round(r.costs?.marginPct || 0)}%</span></div>
        `).join('');
    }
    const worstDash = document.getElementById('dashWorstRecipes');
    if (worstDash) {
        const worst2 = [...sortedByMargin].reverse().slice(0, 2);
        worstDash.innerHTML = `<span class="kpi-label">⚠️ À Surveiller</span>` + worst2.map(r => `
            <div style="font-size:0.75rem; font-weight:700; margin-bottom:4px;">${r.name} <span style="color:var(--cockpit-danger)">${Math.round(r.costs?.marginPct || 0)}%</span></div>
        `).join('');
    }

    // Animation entrance
    const hubSection = document.getElementById('hubSection');
    if (hubSection && !hubSection.dataset.animated && window.gsap) {
        hubSection.dataset.animated = 'true';
        gsap.from('.cockpit-card, .cockpit-kpi-card, .cockpit-statusbar', {
            opacity: 0,
            y: 20,
            stagger: 0.1,
            duration: 0.8,
            ease: 'power4.out'
        });
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
