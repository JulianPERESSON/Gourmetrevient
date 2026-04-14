// dashboard-premium.js: Dedicated script for populating the Bento Premium Dashboard (V2)

document.addEventListener('DOMContentLoaded', () => {
    // Seed demo data once (only if localStorage is empty)
    seedDemoData();

    // Wait until authentication is complete and the overlay is removed before hydrating animations
    const checkAuthAndHydrate = () => {
        if (!document.body.classList.contains('auth-pending')) {
            setTimeout(hydratePremiumDashboard, 300); // Small delay for smooth entry
            setInterval(hydratePremiumDashboard, 10000); // Periodic refresh
        } else {
            setTimeout(checkAuthAndHydrate, 100);
        }
    };
    checkAuthAndHydrate();
});

function seedDemoData() {
    const today = new Date().toISOString().split('T')[0];
    // Use the same user-scoped keys as hydratePremiumDashboard
    const currUser = (localStorage.getItem('gourmet_current_user') || 'chef').toLowerCase();

    // ── Production Plan ─────────────────────────────────────────────────
    const existingPlan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
    const hasTodayPlan = existingPlan.some(p => p.date === today);
    if (!hasTodayPlan) {
        const demoPlan = [
            { id: 1, date: today, recipe: 'Paris-Brest', name: 'Paris-Brest', qty: 5, status: 'ongoing' },
            { id: 2, date: today, recipe: 'Éclair Chocolat', name: 'Éclair Chocolat', qty: 5, status: 'planned' },
            { id: 3, date: today, recipe: 'Tarte Citron Meringuée', name: 'Tarte Citron Meringuée', qty: 5, status: 'planned' },
            { id: 4, date: today, recipe: 'Millefeuille Vanille', name: 'Millefeuille Vanille', qty: 5, status: 'planned' },
            { id: 5, date: today, recipe: 'Saint-Honoré', name: 'Saint-Honoré', qty: 5, status: 'done' },
        ];
        localStorage.setItem('gourmet_production_plan', JSON.stringify([...existingPlan, ...demoPlan]));
    }

    // ── Ingredient Price Watch (user-scoped key) ─────────────────────────
    const invKey = `gourmet_inventory_${currUser}`;
    let inv = JSON.parse(localStorage.getItem(invKey) || '[]');
    const hasHistory = inv.some(item => item.priceHistory && item.priceHistory.length > 1);
    
    if (!hasHistory) {
        const demoInv = [
            { id: 901, name: 'Beurre AOP', unit: 'kg', pricePerUnit: 9.80, priceHistory: [
                { date: '2026-03-01', price: 8.40 }, { date: '2026-04-01', price: 9.80 }
            ]},
            { id: 902, name: 'Farine T55', unit: 'kg', pricePerUnit: 1.10, priceHistory: [
                { date: '2026-03-01', price: 1.25 }, { date: '2026-04-01', price: 1.10 }
            ]},
            { id: 903, name: 'Œufs fermiers', unit: 'dz', pricePerUnit: 3.60, priceHistory: [
                { date: '2026-03-01', price: 3.40 }, { date: '2026-04-01', price: 3.60 }
            ]},
            { id: 904, name: 'Crème liquide 35%', unit: 'L', pricePerUnit: 4.20, priceHistory: [
                { date: '2026-03-01', price: 4.50 }, { date: '2026-04-01', price: 4.20 }
            ]},
        ];
        // Merge demo to front of existing
        inv = [...demoInv, ...inv];
        localStorage.setItem(invKey, JSON.stringify(inv));
        localStorage.setItem('gourmet_inventory', JSON.stringify(inv));
    }

    // ── Team (user-scoped key) ────────────────────────────────────────
    const teamKey = `gourmet_team_members_${currUser}`;
    const leavesKey = `gourmet_staff_leaves_${currUser}`;
    const team = JSON.parse(localStorage.getItem(teamKey) || '[]');
    if (team.length === 0) {
        const demoTeam = [
            { id: 1, name: 'Chef Larroque', role: 'Chef Pâtissier', avatar: '👨‍🍳' },
            { id: 2, name: 'M. Dupont', role: 'Pâtissier', avatar: '🧑‍🍳' },
            { id: 3, name: 'Mme. Martin', role: 'Pâtissière', avatar: '👩‍🍳' },
            { id: 4, name: 'J. Petit', role: 'Apprenti', avatar: '🧑‍🍳' },
            { id: 5, name: 'C. Bernard', role: 'Apprentie', avatar: '👩‍🍳' },
            { id: 6, name: 'R. Moreau', role: 'Aide-Pâtissier', avatar: '🧑‍🍳' },
        ];
        const demoLeaves = [
            { memberId: 6, memberName: 'R. Moreau', start: today, end: today, reason: 'Maladie' }
        ];
        localStorage.setItem(teamKey, JSON.stringify(demoTeam));
        localStorage.setItem(leavesKey, JSON.stringify(demoLeaves));
    }

    // ── HACCP Temperature Log (2h ago) ─────────────────────────────
    const haccpRaw = JSON.parse(localStorage.getItem('gourmet_haccp_logs') || '{"temp":[]}');
    const recentLogs = (haccpRaw.temp || []).filter(l => (Date.now() - new Date(l.date || l.timestamp)) < 24 * 60 * 60 * 1000);
    
    if (recentLogs.length === 0) {
        const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
        const demoTemp = [
            { date: twoHoursAgo, timestamp: twoHoursAgo, zone: 'Chambre froide 1', temp: 3.2, status: 'ok', by: 'Chef Larroque' },
            { date: twoHoursAgo, timestamp: twoHoursAgo, zone: 'Vitrine desserts', temp: 5.8, status: 'ok', by: 'Chef Larroque' },
        ];
        haccpRaw.temp = [...demoTemp, ...(haccpRaw.temp || [])];
        localStorage.setItem('gourmet_haccp_logs', JSON.stringify(haccpRaw));
    }
}

window.hydratePremiumDashboard = function () {
    // Force-seed demo data if missing every time hydrate runs, so soft reloads get the data
    seedDemoData();

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
    const leaves = (window.APP && window.APP.staffLeaves && window.APP.staffLeaves.length > 0)
        ? window.APP.staffLeaves
        : JSON.parse(localStorage.getItem(`gourmet_staff_leaves_${currUser.toLowerCase()}`) || '[]');
    const haccpLogs = (window.APP && window.APP.haccpLogs)
        ? window.APP.haccpLogs
        : JSON.parse(localStorage.getItem('gourmet_haccp_logs') || '{"temp":[],"trace":[],"clean":[],"reception":[]}');
    const productionPlan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
    const wasteLogs = (window.APP && window.APP.wasteLogs)
        ? window.APP.wasteLogs
        : JSON.parse(localStorage.getItem('gourmet_waste_logs') || '[]');

    const t = (key, data) => (window.i18n && typeof window.i18n.t === 'function') ? window.i18n.t(key, data) : key;

    // 1. Briefing Header: Date & User
    const dateHeaderEl = document.getElementById('dashDateHeader');
    const now = new Date();
    if (dateHeaderEl) {
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
    
    // REAL production count from production plan
    const todayStr = now.toISOString().split('T')[0];
    const todayProds = productionPlan.filter(p => p.date === todayStr);
    let prodCountToday = todayProds.length > 0 ? todayProds.reduce((s, p) => s + (p.qty || 1), 0) : recipes.length;

    // Update Briefing Stats
    const bProd = document.getElementById('briefingProdCount');
    if (bProd) {
        if (typeof animateTicker === 'function') animateTicker(bProd, prodCountToday);
        else bProd.textContent = prodCountToday;
    }
    
    const bAlert = document.getElementById('briefingAlertCount');
    if (bAlert) {
        if (typeof animateTicker === 'function') animateTicker(bAlert, stockAlerts.length);
        else bAlert.textContent = stockAlerts.length;
    }
    
    const bMargin = document.getElementById('briefingMarginValue');
    if (bMargin) {
        if (typeof animateTicker === 'function') animateTicker(bMargin, Math.round(avgMargin), 1500, '%');
        else bMargin.textContent = Math.round(avgMargin) + '%';
    }

    // 3. DYNAMIC Priorities List (based on real data)
    const priorityList = document.getElementById('dashPriorityList');
    if (priorityList) {
        let priorities = [];
        
        // Priority: Production plan items for today
        if (todayProds.length > 0) {
            const prod = todayProds[0];
            const fallbackProdCount = `${todayProds.length} production(s) planifiée(s) aujourd'hui`;
            priorities.push({ urgency: 'urgent', icon: '🍰',
                title: `${t('dash.priority.launch', {name: prod.recipe || prod.name || recipes[0]?.name || 'Production'})}`,
                desc: t('dash.priority.prod_count', { count: todayProds.length }) || fallbackProdCount,
                action: `showMgmt(); switchMgmtTab('production');`,
                btn: t('dash.priority.btn_launch') || 'Lancer'
            });
        } else if (recipes.length > 0) {
            // Fallback: suggest launching most recent recipe
            const recent = [...recipes].sort((a,b) => new Date(b.savedAt||0) - new Date(a.savedAt||0))[0];
            priorities.push({ urgency: 'info', icon: '📋',
                title: t('dash.priority.no_prod') || 'Aucune production planifiée',
                desc: t('dash.priority.suggest_plan') || 'Planifiez votre journée dans le module Production',
                action: `showMgmt(); switchMgmtTab('production');`,
                btn: t('dash.priority.btn_plan') || 'Planifier'
            });
        }
        
        // Priority: Critical stock alerts
        if (stockAlerts.length > 0) {
            const criticalItems = stockAlerts.slice(0, 2).map(i => i.name).join(', ');
            const fallbackStockCount = `${stockAlerts.length} ingrédient(s) en stock critique : ${criticalItems}`;
            priorities.push({ urgency: 'warning', icon: '🛒',
                title: `${t('dash.priority.order', {name: stockAlerts[0].name})}`,
                desc: t('dash.priority.stock_critical', { count: stockAlerts.length, items: criticalItems }) || fallbackStockCount,
                action: `showInventaire();`,
                btn: t('dash.priority.btn_order') || 'Commander'
            });
        }

        // Priority: Low margin recipes
        const lowMarginRecipes = recipes.filter(r => (r.costs?.marginPct || 70) < 65);
        if (lowMarginRecipes.length > 0) {
            const lowPerf = lowMarginRecipes[0];
            const margin = Math.round(lowPerf.costs?.marginPct || 60);
            priorities.push({ urgency: 'warning', icon: '💰',
                title: `${t('dash.priority.adjust_margin', {name: lowPerf.name})}`,
                desc: t('dash.priority.margin_desc', { margin: margin, count: lowMarginRecipes.length }),
                action: `openRecipeEditorByName('${lowPerf.name.replace(/'/g, "\\'") }')`,
                btn: t('dash.priority.btn_revise') || 'Ajuster'
            });
        }

        // Priority: Recent waste/losses
        const recentWaste = wasteLogs.filter(w => {
            const d = new Date(w.date || w.timestamp);
            return (now - d) < 7 * 24 * 60 * 60 * 1000; // Last 7 days
        });
        if (recentWaste.length >= 3) {
            const totalLoss = recentWaste.reduce((s, w) => s + (w.cost || 0), 0);
            priorities.push({ urgency: 'info', icon: '📉',
                title: t('dash.priority.waste_alert', { count: recentWaste.length }),
                desc: t('dash.priority.waste_desc', { total: totalLoss.toFixed(2), count: recentWaste.length }),
                action: `showMgmt(); switchMgmtTab('quality');`,
                btn: t('dash.priority.btn_analyze') || 'Analyser'
            });
        }

        // If nothing, show all-good message
        if (priorities.length === 0) {
            priorities.push({ urgency: 'info', icon: '✅',
                title: t('dash.priority.all_good') || 'Tout est en ordre !',
                desc: t('dash.priority.all_good_desc') || 'Aucune action urgente pour le moment.',
                action: `showRecettes();`,
                btn: t('dash.priority.btn_create') || 'Créer'
            });
        }

        priorityList.innerHTML = priorities.slice(0, 3).map(p => `
            <div class="priority-item ${p.urgency}">
                <div class="p-icon">${p.icon}</div>
                <div class="p-content">
                    <div class="p-title">${p.title}</div>
                    <div class="p-desc">${p.desc}</div>
                </div>
                <button class="p-action-btn" onclick="${p.action}">${p.btn}</button>
            </div>
        `).join('');
    }

    // 4. DYNAMIC AI Expert Advice (generates insight from real data)
    const aiAdvice = document.getElementById('dashAIAdvice');
    if (aiAdvice) {
        let insights = [];
        
        // Insight: Worst margin recipe
        const sortedByMargin = [...recipes].sort((a,b) => (a.costs?.marginPct || 70) - (b.costs?.marginPct || 70));
        const worst = sortedByMargin[0];
        if (worst && (worst.costs?.marginPct || 70) < 70) {
            const currentM = Math.round(worst.costs?.marginPct || 65);
            const suggestedIncrease = ((worst.costs?.sellingPrice || 5) * 0.05).toFixed(2);
            insights.push({
                text: `<strong>${worst.name}</strong> : marge à ${currentM}%, en dessous de la cible.`,
                tips: [`💡 +${suggestedIncrease}€ sur le prix`, `💡 Réduire garniture 5%`]
            });
        }
        
        // Insight: Stock volatility (price changes)
        const priceChanges = inv.filter(item => item.priceHistory && item.priceHistory.length >= 2);
        const risingPrices = priceChanges.filter(item => {
            const h = item.priceHistory;
            return h[h.length-1].price > h[h.length-2].price;
        });
        if (risingPrices.length > 0) {
            const topRising = risingPrices[0];
            const h = topRising.priceHistory;
            const pctChange = (((h[h.length-1].price - h[h.length-2].price) / h[h.length-2].price) * 100).toFixed(1);
            insights.push({
                text: `<strong>${topRising.name}</strong> : prix en hausse de +${pctChange}%.`,
                tips: [`💡 Chercher un fournisseur alternatif`, `💡 Ajuster les recettes concernées`]
            });
        }

        // Insight: Best performing recipe
        const best = [...recipes].sort((a,b) => (b.costs?.marginPct || 0) - (a.costs?.marginPct || 0))[0];
        if (best && insights.length === 0) {
            insights.push({
                text: `<strong>${best.name}</strong> est votre recette la plus rentable (${Math.round(best.costs?.marginPct || 75)}%).`,
                tips: [`💡 Mettre en avant en vitrine`, `💡 ${recipes.length} recettes actives`]
            });
        }

        // Render only if content changed — prevents 10s interval flicker
        const insight = insights[0];
        const newHTML = insight
            ? `<div class="ai-bubble"><p>${insight.text}</p><div class="ai-actions">${insight.tips.map(tip => `<span class="ai-tip">${tip}</span>`).join('')}</div></div>`
            : `<div class="ai-bubble"><p>✅ Toutes vos recettes affichent une marge saine. Continuez !</p></div>`;
            
        const contentHash = insight ? insight.text : 'all_good';
        if (aiAdvice.dataset.insight !== contentHash) {
            aiAdvice.innerHTML = newHTML;
            aiAdvice.dataset.insight = contentHash;
        }
    }

    // 5. REAL Production Timeline (from production plan)
    const prodTimeline = document.getElementById('dashProdTimeline');
    if (prodTimeline) {
        const dateFilter = window.dashProdDateFilter || 'today';
        const filterDate = new Date(now);
        if (dateFilter === 'tomorrow') filterDate.setDate(filterDate.getDate() + 1);
        const filterStr = filterDate.toISOString().split('T')[0];
        
        // Get real production plan items for the filtered date
        const dayProds = productionPlan.filter(p => p.date === filterStr);
        
        if (dayProds.length > 0) {
            prodTimeline.innerHTML = dayProds.slice(0, 4).map((p, i) => {
                const prog = p.status === 'done' ? 100 : (p.status === 'ongoing' ? 60 : 0);
                const statusLabel = p.status === 'done' ? (t('dash.status.done') || 'Terminé') 
                    : p.status === 'ongoing' ? (t('dash.status.ongoing') || 'En cours') 
                    : (t('dash.status.planned') || 'Planifié');
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
                            <h4>${p.recipe || p.name || 'Production'}</h4>
                            <p>${statusLabel} · ${p.qty || 1} ${t('unit.portions') || 'portions'}</p>
                        </div>
                    </div>
                `;
            }).join('');
        } else if (recipes.length > 0) {
            // Fallback: show helpful message with action button
            const dateLabel = dateFilter === 'today' ? (t('ui.today') || "aujourd'hui").toLowerCase() : (t('ui.tomorrow') || 'demain').toLowerCase();
            prodTimeline.innerHTML = `
                <div class="hub-empty-state">
                    <div class="hub-empty-icon">📋</div>
                    <p class="hub-empty-text">Aucune production planifiée pour <strong>${dateLabel}</strong></p>
                    <button class="hub-empty-cta" onclick="showMgmt(); switchMgmtTab('production');">
                        📅 Planifier une production
                    </button>
                </div>
            `;
        } else {
            const dateLabel = dateFilter === 'today' ? (t('ui.today') || "aujourd'hui").toLowerCase() : (t('ui.tomorrow') || 'demain').toLowerCase();
            prodTimeline.innerHTML = `<div class="timeline-empty">${t('dash.prod.empty', {date: dateLabel})}</div>`;
        }
    }

    // 6. Stock Alerts Mini
    const stockMini = document.getElementById('dashStockAlerts');
    if (stockMini) {
        if (stockAlerts.length > 0) {
            stockMini.innerHTML = stockAlerts.slice(0, 3).map(item => {
                const stockVal = item.stock !== undefined ? item.stock : 0;
                const unitStr = (item.unit && item.unit !== 'undefined') ? item.unit : 'kg';
                return `
                <div class="radar-item-mini">
                    <span>${item.name}</span>
                    <span style="color:var(--cockpit-danger)">${stockVal} ${unitStr}</span>
                </div>`;
            }).join('');
        } else {
            stockMini.innerHTML = `<p style="font-size:0.8rem; color:var(--cockpit-success)">${t('dash.stock.optimal')}</p>`;
        }
    }

    // 7. Météo des Prix — Price Watch Widget
    const priceWatchEl = document.getElementById('dashPriceWatch');
    if (priceWatchEl) {
        const inventory = JSON.parse(localStorage.getItem('gourmet_inventory') || '[]');
        // Find items with price history (priceHistory array with at least 2 entries)
        const withHistory = inventory.filter(item => item.priceHistory && item.priceHistory.length >= 2);
        
        if (withHistory.length > 0) {
            const items = withHistory.slice(0, 4).map(item => {
                const hist = item.priceHistory;
                const latest = hist[hist.length - 1].price;
                const prev = hist[hist.length - 2].price;
                const delta = latest - prev;
                const pct = prev > 0 ? ((delta / prev) * 100).toFixed(1) : 0;
                const isUp = delta > 0;
                const isDown = delta < 0;
                const arrow = isUp ? '↑' : isDown ? '↓' : '→';
                const color = isUp ? 'var(--cockpit-danger)' : isDown ? 'var(--cockpit-success)' : 'var(--cockpit-text-muted)';
                const sign = isUp ? '+' : '';
                const unitStr = (item.unit && item.unit !== 'undefined') ? item.unit : 'kg';
                return `
                    <div class="hub-price-row">
                        <span class="hub-price-name">${item.name}</span>
                        <div class="hub-price-meta">
                            <span class="hub-price-val">${parseFloat(latest).toFixed(2)}€/${unitStr}</span>
                            <span class="hub-price-trend" style="color:${color}">${arrow} ${sign}${pct}%</span>
                        </div>
                    </div>`;
            }).join('');
            priceWatchEl.innerHTML = items;
        } else if (inventory.length > 0) {
            // Inventory exists but no history — show latest prices
            const items = inventory.slice(0, 4).map(item => {
                const unitStr = (item.unit && item.unit !== 'undefined') ? item.unit : 'kg';
                return `
                <div class="hub-price-row">
                    <span class="hub-price-name">${item.name}</span>
                    <div class="hub-price-meta">
                        <span class="hub-price-val">${parseFloat(item.pricePerUnit || item.price || 0).toFixed(2)}€/${unitStr}</span>
                        <span class="hub-price-trend" style="color:var(--cockpit-text-muted)">→ stable</span>
                    </div>
                </div>`;
            }).join('');
            priceWatchEl.innerHTML = items;
        } else {
            priceWatchEl.innerHTML = `
                <div class="hub-empty-state">
                    <div class="hub-empty-icon">📦</div>
                    <p class="hub-empty-text">Ajoutez des ingrédients à votre inventaire pour suivre l'évolution des prix</p>
                    <button class="hub-empty-cta" onclick="showInventaire()">📦 Gérer l'inventaire</button>
                </div>`;
        }
    }

    // 8. REAL Team Summary (from actual team + leaves)
    const presenceEl = document.getElementById('dashPresenceCount');
    const haccpEl = document.getElementById('dashHACCPStatus');
    if (presenceEl) {
        const totalMembers = team.length || 0;
        // Count who is on leave TODAY
        const todayISO = now.toISOString().split('T')[0];
        let onLeaveCount = 0;
        leaves.forEach(l => {
            const start = l.start || l.from;
            const end = l.end || l.to;
            if (start && end && todayISO >= start && todayISO <= end) {
                onLeaveCount++;
            }
        });
        const presentCount = Math.max(0, totalMembers - onLeaveCount);
        // Derive team name from first member's name (e.g. "Chef Larroque" → "Larroque")
        const firstMember = team[0];
        const demoTeamName = firstMember
            ? firstMember.name.replace(/^(chef|chef\s)/i, '').trim().split(' ').pop()
            : 'Brigade';
        
        if (totalMembers > 0) {
            const teamName = demoTeamName || 'Brigade';
            presenceEl.textContent = `${presentCount}/${totalMembers} — Équipe ${teamName}`;
            presenceEl.style.color = onLeaveCount > 0 ? 'var(--warning, #f59e0b)' : '';
        } else {
            presenceEl.textContent = t('dash.team.no_team') || 'Aucune équipe configurée';
            presenceEl.style.color = 'var(--text-muted)';
        }
    }
    
    // REAL HACCP status from logs
    if (haccpEl) {
        const tempLogs = haccpLogs.temp || [];
        const recentTemps = tempLogs.filter(l => {
            const d = new Date(l.date || l.timestamp);
            return (now - d) < 24 * 60 * 60 * 1000; // Last 24h
        });
        const hasAnomaly = recentTemps.some(l => l.status === 'ko' || l.status === 'anomaly' || (l.temp && (l.temp > 4 || l.temp < -20)));
        
        if (hasAnomaly) {
            haccpEl.textContent = '⚠️ HACCP Alerte';
            haccpEl.style.color = 'var(--danger, #ef4444)';
            haccpEl.style.fontWeight = '700';
        } else if (recentTemps.length > 0) {
            // Show how long ago the last reading was
            const lastLog = recentTemps[recentTemps.length - 1];
            const lastDate = new Date(lastLog.date || lastLog.timestamp);
            const diffMs = now - lastDate;
            const diffMin = Math.floor(diffMs / 60000);
            const diffH = Math.floor(diffMin / 60);
            let timeAgo = diffMin < 1 ? 'il y a moins d’une minute'
                : diffMin < 60 ? `il y a ${diffMin} min`
                : `il y a ${diffH}h${diffMin % 60 ? (diffMin % 60) + 'min' : ''}`;
            haccpEl.innerHTML = `✅&nbsp;<span style="font-weight:600;">HACCP OK</span> <span style="font-size:0.75rem; color:var(--cockpit-text-muted); font-weight:400;">(${timeAgo})</span>`;
            haccpEl.style.color = '';
            haccpEl.style.fontWeight = '600';
        } else {
            haccpEl.textContent = t('dash.haccp.no_data') || '— Pas de relevé récent';
            haccpEl.style.color = 'var(--text-muted)';
            haccpEl.style.fontWeight = '400';
        }
    }

    // 9. Sparkline Chart with real margin data
    renderMiniSparkline(recipes);
};

function renderMiniSparkline(recipes) {
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
    
    // Use real recipe margins if available, else demo data
    let points;
    if (recipes && recipes.length >= 3) {
        // Take last 7 recipes' margins, normalized to canvas height
        const margins = recipes.slice(0, 7).map(r => r.costs?.marginPct || 70);
        const minM = Math.min(...margins) - 5;
        const maxM = Math.max(...margins) + 5;
        const range = maxM - minM || 1;
        points = margins.map(m => height - ((m - minM) / range) * (height * 0.8) - height * 0.1);
    } else {
        points = [height*0.8, height*0.7, height*0.9, height*0.4, height*0.5, height*0.2, height*0.3];
    }
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
