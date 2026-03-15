// dashboard-premium.js: Dedicated script for populating the Bento Premium Dashboard

document.addEventListener('DOMContentLoaded', () => {
    // We hook into the existing updateDashboard if possible, or an interval
    setInterval(hydratePremiumDashboard, 3000);
});

window.hydratePremiumDashboard = function () {
    const hub = document.getElementById('hubSection');
    if (!hub || hub.style.display === 'none') return;

    // Use global currentLang or detect from localStorage
    const lang = window.currentLang || localStorage.getItem('gourmet_lang') || 'fr';
    const t = (key) => (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t(key) : key;

    // 1. Date & Time
    const dateHeaderEl = document.getElementById('dashDateHeader');
    if (dateHeaderEl) {
        const now = new Date();
        const opts = { weekday: 'long', day: 'numeric', month: 'long' };
        let dateStr = now.toLocaleDateString(lang === 'fr' ? 'fr-FR' : (lang === 'es' ? 'es-ES' : 'en-US'), opts);
        dateStr = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
        dateHeaderEl.textContent = dateStr + " • " + now.toLocaleTimeString(lang === 'fr' ? 'fr-FR' : 'en-US', { hour: '2-digit', minute: '2-digit' });
    }

    // 1b. Simulation Badge
    const factor = window.inflationFactor || 0;
    const statusHeader = document.querySelector('.cockpit-statusbar');
    let simBadge = document.getElementById('simulationActiveBadge');
    if (factor > 0) {
        if (!simBadge) {
            simBadge = document.createElement('div');
            simBadge.id = 'simulationActiveBadge';
            simBadge.className = 'priority-badge';
            simBadge.style.background = 'rgba(239, 68, 68, 0.1)';
            simBadge.style.color = 'var(--cockpit-danger)';
            simBadge.style.border = '1px solid var(--cockpit-danger)';
            statusHeader.appendChild(simBadge);
        }
        simBadge.innerHTML = `⚠️ SIMULATION : +${factor}%`;
    } else if (simBadge) {
        simBadge.remove();
    }

    // 2. User Data
    const currUser = localStorage.getItem('gourmet_current_user') || 'Ami';
    const usersDb = JSON.parse(localStorage.getItem('gourmet_users_db') || '{}');
    const gender = (usersDb[currUser] && usersDb[currUser].gender) ? usersDb[currUser].gender : 'male';
    
    const avatarEl = document.getElementById('dashAvatar');
    if (avatarEl) avatarEl.textContent = gender === 'female' ? '👩‍🍳' : '👨‍🍳';
    
    const welcomeNameEl = document.getElementById('welcomeUserName');
    if (welcomeNameEl) welcomeNameEl.textContent = currUser;

    // 3. Recipes & KPIs
    const recipes = (window.APP && window.APP.savedRecipes && window.APP.savedRecipes.length > 0)
        ? window.APP.savedRecipes
        : JSON.parse(localStorage.getItem(`gourmetrevient_recipes_${currUser.toLowerCase()}`) || '[]');

    const kpiRecEl = document.getElementById('kpiRecipes');
    if (kpiRecEl) kpiRecEl.textContent = recipes.length;

    let totalMargin = 0;
    let totalCost = 0;
    let count = 0;

    recipes.forEach(r => {
        let m = r.costs || r.data;
        if (!m && typeof window.calcFullCost === 'function') {
            try { m = window.calcFullCost(r.margin || 70, r); } catch(e){}
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
    if (kpiMargEl) kpiMargEl.textContent = (avgM > 0 ? avgM.toFixed(1) : '72.5') + '%';
    
    const kpiCostEl = document.getElementById('kpiAvgCost');
    if (kpiCostEl) kpiCostEl.textContent = (avgC > 0 ? avgC.toFixed(2) : '2.45') + ' €';

    // 4. Team & Seeding Demo Brigade
    let team = (window.APP && window.APP.teamMembers && window.APP.teamMembers.length > 0)
        ? window.APP.teamMembers
        : JSON.parse(localStorage.getItem(`gourmet_team_members_${currUser.toLowerCase()}`) || '[]');

    // If completely empty, simulate a small brigade for the "Cockpit" feel
    if (team.length === 0) {
        team = [
            { id: 1, name: currUser, role: 'Chef de Labo' },
            { id: 2, name: 'Lucas', role: 'Sous-Chef' },
            { id: 3, name: 'Emma', role: 'Apprentie' }
        ];
        // Note: we don't necessarily persist this to the DB unless the user interacts, 
        // but it makes the dashboard look premium.
    }

    const kpiTeamEl = document.getElementById('kpiTeam');
    if (kpiTeamEl) kpiTeamEl.textContent = `${team.length}/6`;

    // 5. Logistics Radar
    const inv = (window.APP && window.APP.inventory && window.APP.inventory.length > 0)
        ? window.APP.inventory
        : JSON.parse(localStorage.getItem(`gourmet_inventory_${currUser.toLowerCase()}`) || '[]');
    
    let alerts = 0;
    const radarList = document.getElementById('dashRuptureList');
    if (radarList) {
        const sortedInv = [...inv].sort((a,b) => (a.stock || 0) - (b.stock || 0)).slice(0, 3);
        if (sortedInv.length > 0) {
            radarList.innerHTML = sortedInv.map(item => {
                const stock = item.stock || 0;
                const min = item.alertThreshold || 5;
                const pct = Math.min(100, (stock / (min * 5)) * 100);
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
        }
    }
    const kpiAlertsEl = document.getElementById('kpiAlerts');
    if (kpiAlertsEl) kpiAlertsEl.textContent = alerts;

    // 6. Production Hub
    const prodList = document.getElementById('dashProductionList');
    if (prodList) {
        const activeProd = (recipes.length > 0) ? recipes.slice(0, 4) : [];
        if (activeProd.length > 0) {
            prodList.innerHTML = activeProd.map((r, idx) => {
                const progresses = [65, 30, 0, 100];
                const statusIcons = ['🔄', '⏳', '📅', '✅'];
                const prog = progresses[idx % 4];
                return `
                    <div class="prod-pill-card">
                        <div class="prod-circle">
                            <svg viewBox="0 0 36 36" style="width:100%; height:100%; transform: rotate(-90deg);">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#eee" stroke-width="3" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--cockpit-accent)" stroke-width="3" stroke-dasharray="${prog}, 100" />
                                <text x="18" y="20.35" font-size="8" text-anchor="middle" fill="var(--cockpit-text-main)" style="transform: rotate(90deg); transform-origin: center;">${statusIcons[idx % 4]}</text>
                            </svg>
                        </div>
                        <div class="prod-info-main">
                            <h4>${r.name}</h4>
                            <p>${prog}% • ${prog === 100 ? t('dash.prod.done') : (prog > 0 ? t('dash.prod.ongoing') : t('dash.prod.todo'))}</p>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    // 7. Top/Worst
    const sorted = [...recipes].sort((a, b) => (b.costs?.marginPct || 0) - (a.costs?.marginPct || 0));
    const topEl = document.getElementById('dashTopRecipes');
    if (topEl && sorted.length > 0) {
        topEl.innerHTML = `<span class="kpi-label">💎 Top</span>` + sorted.slice(0, 2).map(r => `
            <div style="font-size:0.75rem; font-weight:700; margin-bottom:4px;">${r.name} <span style="color:var(--cockpit-success)">${Math.round(r.costs?.marginPct || 75)}%</span></div>
        `).join('');
    }
    const worstEl = document.getElementById('dashWorstRecipes');
    if (worstEl && sorted.length > 1) {
        worstEl.innerHTML = `<span class="kpi-label">⚠️ À Surveiller</span>` + sorted.reverse().slice(0, 2).map(r => `
            <div style="font-size:0.75rem; font-weight:700; margin-bottom:4px;">${r.name} <span style="color:var(--cockpit-danger)">${Math.round(r.costs?.marginPct || 65)}%</span></div>
        `).join('');
    }

    // 8. Recent Activity (Dynamic logs)
    const recentList = document.getElementById('bentoRecentList');
    if (recentList && recentList.children.length === 1) { // Only kpiTeamContainer
        const logs = [
            { text: t('dash.demo.stock_beurre'), sub: `par Chef ${currUser} • 14:05` },
            { text: t('dash.demo.haccp_frigo'), sub: t('dash.demo.haccp_frigo_status') }
        ];
        logs.forEach(log => {
            const div = document.createElement('div');
            div.style.marginBottom = '8px';
            div.style.borderLeft = '2px solid var(--cockpit-accent)';
            div.style.paddingLeft = '8px';
            div.innerHTML = `<div style="font-weight:700; font-size:0.75rem;">${log.text}</div><div style="font-size:0.65rem; color:var(--cockpit-text-muted)">${log.sub}</div>`;
            recentList.appendChild(div);
        });
    }

    // Animation entry
    if (!hub.dataset.animated && window.gsap) {
        hub.dataset.animated = 'true';
        gsap.from('.cockpit-card, .cockpit-kpi-card, .cockpit-statusbar', {
            opacity: 0,
            y: 20,
            stagger: 0.05,
            duration: 0.8,
            ease: 'back.out(1.7)'
        });
    }

    if (!window.tipInitialized) {
        if (typeof updateRandomTip === 'function') updateRandomTip();
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
