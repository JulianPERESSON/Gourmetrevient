// ============================================================================
// LAB CONFIGURATOR LOGIC (Merged from Chef d'Oeuvre)
// ============================================================================

// --- CONFIGURATEUR ---
let labCurrentCategory = 'all';
let labCurrentMode = 'standard';
let labCurrentResults = [];
let labCurrentTotal = 0;

function getLabPlacementsKey() {
    const user = localStorage.getItem('gourmet_current_user') || 'Ami';
    return `labpatiss_placements_${user.toLowerCase()}`;
}

function getLabStatusKey() {
    const user = localStorage.getItem('gourmet_current_user') || 'Ami';
    return `gourmet_lab_plan_${user.toLowerCase()}`;
}

function formatLabPrice(n) {
    const locale = (typeof getLang === 'function') ? (getLang() === 'en' ? 'en-GB' : (getLang() === 'es' ? 'es-ES' : 'fr-FR')) : 'fr-FR';
    return n.toLocaleString(locale) + ' €';
}

function getLabTagline(budget) {
    for (const t of window.BUDGET_TAGLINES) { if (budget <= t.max) return t; }
    return window.BUDGET_TAGLINES[window.BUDGET_TAGLINES.length - 1];
}

let labBudgetAnimateState = { val: 0 };
function updateLabBudgetDisplay(budget) {
    const amountEl = document.getElementById('budgetAmount');
    if (!amountEl) return;
    
    // Smooth Counter Animation using GSAP if available, or simple lerp
    if (window.gsap) {
        gsap.to(labBudgetAnimateState, {
            val: budget,
            duration: 0.8,
            ease: "power3.out",
            overwrite: true,
            onUpdate: () => {
                amountEl.textContent = formatLabPrice(Math.round(labBudgetAnimateState.val));
            }
        });
    } else {
        amountEl.textContent = formatLabPrice(budget);
    }
    
    amountEl.classList.add('pulse');
    setTimeout(() => amountEl.classList.remove('pulse'), 150);

    let levelIndex = 0;
    for (let i = 0; i < window.BUDGET_TAGLINES.length; i++) {
        if (budget <= window.BUDGET_TAGLINES[i].max) {
            levelIndex = i;
            break;
        }
        if (i === window.BUDGET_TAGLINES.length - 1) levelIndex = i;
    }

    const badge = document.getElementById('taglineBadge');
    const text = document.getElementById('taglineText');
    if (badge) {
        badge.style.opacity = 0;
        setTimeout(() => {
            badge.textContent = t(`lab.budget.level.${levelIndex}.label`);
            badge.style.opacity = 1;
        }, 150);
    }
    if (text) text.textContent = t(`lab.budget.level.${levelIndex}.tagline`);
}

function createLabEquipmentCard(eq) {
    const card = document.createElement('div');
    card.className = 'card lab-card mt-2';
    const boostTag = eq.boosted ? `<span style="color:var(--accent);font-size:.65rem;font-weight:700;position:absolute;top:12px;right:12px;letter-spacing:.05em">${t('lab.tag.priority')}</span>` : '';
    const essTag = !eq.boosted && eq.essential ? `<span style="color:var(--primary);font-size:.65rem;font-weight:700;position:absolute;top:12px;right:12px;letter-spacing:.05em">${t('lab.tag.essential')}</span>` : '';

    // Tiers often have level labels like "Entrée de gamme"
    const levelMap = { "Entrée de gamme": t('lab.tier.1'), "Intermédiaire": t('lab.tier.2'), "Professionnel": t('lab.tier.3'), "Premium": t('lab.tier.4') };
    const levelTrans = levelMap[eq.selected.level] || eq.selected.level;

    const eqNameTrans = t('eq.name.' + eq.id);
    const eqName = eqNameTrans !== 'eq.name.' + eq.id ? eqNameTrans : eq.name;
    const qty = eq.qty || 1;
    const totalItemPrice = eq.selected.price * qty;

    card.innerHTML = `${boostTag}${essTag}
    <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
      <div style="font-size:2rem">${eq.icon}</div>
      <div style="flex:1">
        <h3 class="card-title" style="margin:0; font-size:1rem; display:flex; justify-content:space-between; align-items:center;">
          <span>${eqName}</span>
          ${qty > 1 ? `<span style="background:var(--accent); color:#fff; font-size:0.7rem; padding:2px 6px; border-radius:10px; font-weight:800;">×${qty}</span>` : ''}
        </h3>
        <span class="card-subtitle" style="margin:0; font-size:0.75rem">${eq.sub}</span>
      </div>
    </div>
    <div style="margin-bottom:10px;">
      <p style="margin:0; font-weight:600; font-size:0.9rem">${eq.selected.brand}</p>
      <p style="margin:0; color:var(--text-muted); font-size:0.8rem">${eq.selected.model}</p>
    </div>
    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--surface-border); padding-top:10px;">
      <div style="display:flex; flex-direction:column;">
        <span style="font-weight:800; color:var(--accent); font-size:1.1rem">${formatLabPrice(totalItemPrice)}</span>
        ${qty > 1 ? `<span style="font-size:0.65rem; color:var(--text-muted);">${formatLabPrice(eq.selected.price)} / ${t('unit.piece')}</span>` : ''}
      </div>
      <span style="background:var(--bg-alt); padding:3px 8px; border-radius:4px; font-size:0.7rem; font-weight:700">${levelTrans}</span>
    </div>`;
    return card;
}

function renderLabGrid(results, category, animateOverride = false) {
    const gridEl = document.getElementById('equipmentGrid');
    if (!gridEl) return;

    const filtered = category === 'all' ? results : results.filter(r => r.category === category);
    const animate = animateOverride || (window.innerWidth > 768); // Always subtle animate on desktop

    const renderCards = () => {
        gridEl.innerHTML = '';
        if (!filtered.length) {
            gridEl.innerHTML = `<p style="text-align:center;color:var(--text-muted);padding:3rem;grid-column:1/-1;">${t('lab.empty_cat')}</p>`;
            return;
        }
        const sorted = [...filtered].sort((a, b) => {
            if (a.boosted !== b.boosted) return b.boosted ? 1 : -1;
            if (a.essential !== b.essential) return a.essential ? -1 : 1;
            return a.category.localeCompare(b.category);
        });

        sorted.forEach((eq, i) => {
            const card = createLabEquipmentCard(eq);
            // Hide initially for stagger
            card.style.opacity = '0';
            card.style.transform = 'translateY(10px)';
            gridEl.appendChild(card);
        });

        if (window.gsap && filtered.length > 0) {
            gsap.to('#equipmentGrid .lab-card', {
                opacity: 1,
                y: 0,
                duration: 0.3,
                stagger: {
                    each: 0.03,
                    from: "start"
                },
                ease: 'power1.out',
                overwrite: true
            });
        }
    };

    // Use skeleton only for tab switches (manual animateOverride), not for slider moves
    if (animateOverride === 'skeleton') {
        gridEl.innerHTML = Array(6).fill(0).map(() => `
            <div class="card skeleton" style="height:180px; margin-top:0.5rem;"></div>
        `).join('');
        setTimeout(renderCards, 150);
    } else {
        renderCards();
    }
}

function updateLabCounts(results) {
    const c = { all: results.length, ustensiles: 0, machines: 0, cuisson: 0, stockage: 0 };
    results.forEach(r => { if (c[r.category] !== undefined) c[r.category]++; });
    const setC = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    setC('countAll', c.all);
    setC('countUstensiles', c.ustensiles);
    setC('countMachines', c.machines);
    setC('countCuisson', c.cuisson);
    setC('countStockage', c.stockage);
}

let labSummaryAnimateState = { total: 0, remain: 0 };
function updateLabSummary(budget, total, count) {
    const remaining = budget - total;
    const totalEl = document.getElementById('summaryTotal');
    const remainEl = document.getElementById('summaryRemaining');
    const statusEl = document.getElementById('summaryStatus');
    if (!totalEl) return;

    if (window.gsap) {
        gsap.to(labSummaryAnimateState, {
            total: total,
            remain: Math.abs(remaining),
            duration: 0.7,
            ease: "power2.out",
            overwrite: true,
            onUpdate: () => {
                totalEl.textContent = formatLabPrice(Math.round(labSummaryAnimateState.total));
                remainEl.textContent = formatLabPrice(Math.round(labSummaryAnimateState.remain));
            }
        });
    } else {
        totalEl.textContent = formatLabPrice(total);
        remainEl.textContent = formatLabPrice(Math.abs(remaining));
    }
    
    document.getElementById('summaryCount').textContent = count;

    if (remaining >= 0) {
        remainEl.style.color = 'var(--success)';
        statusEl.textContent = t('lab.budget.ok');
        statusEl.style.color = 'var(--success)';
    } else {
        remainEl.style.color = 'var(--danger)';
        statusEl.textContent = t('lab.budget.exceeded');
        statusEl.style.color = 'var(--danger)';
    }
}

function updateLab() {
    const slider = document.getElementById('budgetSlider');
    if (!slider || !window.selectEquipment) return;
    const budget = parseInt(slider.value);
    updateLabBudgetDisplay(budget);
    const { results, total } = window.selectEquipment(budget, labCurrentMode);
    labCurrentResults = results;
    labCurrentTotal = total;
    renderLabGrid(results, labCurrentCategory);
    updateLabCounts(results);
    updateLabSummary(budget, total, results.length);
    window.saveConfig(budget, labCurrentMode, results, total);
    initPlan2D(); // refresh plan
}


// --- PLAN 2D ---
let planRoomW = 6, planRoomL = 8;
let planScale = 1, planOffX = 0, planOffY = 0;
let planPlaced = [];
let planDragging = null, planDragOff = { x: 0, y: 0 };

const PLAN_AISLE = 1.2;
const PLAN_WALL_T = 0.15;
const PLAN_GRID = 0.25;
const PLAN_MARGIN = 0.15;

const PLAN_ZONES = {
    cuisson: { color: '#e74c3c', bg: 'rgba(231,76,60,0.06)', label: t('lab.zone.cuisson'), icon: '🔥' },
    froid: { color: '#2196f3', bg: 'rgba(33,150,243,0.06)', label: t('lab.zone.froid'), icon: '❄️' },
    stockage: { color: '#27ae60', bg: 'rgba(39,174,96,0.06)', label: t('lab.zone.stockage'), icon: '📦' },
    prepa: { color: '#f39c12', bg: 'rgba(243,156,18,0.06)', label: t('lab.zone.prepa'), icon: '👨‍🍳' },
    lavage: { color: '#00bcd4', bg: 'rgba(0,188,212,0.06)', label: t('lab.zone.lavage'), icon: '🚰' },
    infra: { color: '#795548', bg: 'rgba(121,85,72,0.06)', label: t('lab.zone.infra'), icon: '🚪' }
};

const PLAN_ZONE_MAP = {
    'four': 'cuisson', 'four-sole': 'cuisson', 'fermentation': 'cuisson', 'induction': 'cuisson',
    'frigo': 'froid', 'congelateur': 'froid', 'cellule': 'froid', 'chambre-froide': 'froid',
    'etageres': 'stockage', 'armoire': 'stockage',
    'batteur': 'prepa', 'robot-coupe': 'prepa', 'laminoir': 'prepa', 'tempereuse': 'prepa', 'petrin': 'prepa',
    'evier': 'lavage',
    'porte': 'infra', 'table': 'prepa'
};

function initPlan2D() {
    const canvas = document.getElementById('planCanvas');
    if (!canvas) return;
    const wEl = document.getElementById('roomW');
    const lEl = document.getElementById('roomL');
    if (wEl) planRoomW = Math.max(3, Math.min(20, parseFloat(wEl.value) || 6));
    if (lEl) planRoomL = Math.max(3, Math.min(20, parseFloat(lEl.value) || 8));

    const sb = document.getElementById('surfaceBadge');
    if (sb) sb.textContent = `📐 ${(planRoomW * planRoomL).toFixed(0)} m²`;

    generatePlan2D();
}

function resizePlan2D() {
    const canvas = document.getElementById('planCanvas');
    const wrap = document.getElementById('canvasWrap');
    if (!canvas || !wrap) return;
    const ctx = canvas.getContext('2d');

    const rect = wrap.getBoundingClientRect();
    if (rect.width === 0) return; // not visible
    canvas.width = rect.width * devicePixelRatio;
    canvas.height = rect.height * devicePixelRatio;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';
    ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
    const pad = 50;
    const sw = (rect.width - pad * 2) / planRoomW;
    const sh = (rect.height - pad * 2) / planRoomL;
    planScale = Math.min(sw, sh);
    planOffX = (rect.width - planRoomW * planScale) / 2;
    planOffY = (rect.height - planRoomL * planScale) / 2;
}

function pMToPx(mx, my) { return [planOffX + mx * planScale, planOffY + my * planScale]; }
function pPxToM(px, py) { return [(px - planOffX) / planScale, (py - planOffY) / planScale]; }
function pSnap(v) { return Math.round(v / PLAN_GRID) * PLAN_GRID; }

function generatePlan2D() {
    resizePlan2D();
    planPlaced = [];
    const config = window.loadConfig() || {};
    let rawEqList = [];
    if (config.results) {
        config.results.forEach(r => {
            const dim = window.EQUIPMENT_DIMS ? window.EQUIPMENT_DIMS[r.id] : null;
            if (dim && dim.floor) {
                const qty = r.qty || 1;
                for (let q = 0; q < qty; q++) {
                    const name = qty > 1 ? `${r.name || dim.label} ${q + 1}` : (r.name || dim.label);
                    rawEqList.push({ id: r.id, name: name, zone: PLAN_ZONE_MAP[r.id] || 'prepa', ...dim });
                }
            }
        });
    }

    // --- DYNAMIC OPTIMIZATION ---
    // We add extra items based on Budget and Surface
    const budget = config.budget || 5000;
    const area = planRoomW * planRoomL;
    const D = window.EQUIPMENT_DIMS;
    let eqList = [...rawEqList];

    // Logic: More area & budget = Need more workspace and storage
    // Tables: 1 per 10m2 approx, min 2
    const tableCount = Math.max(2, Math.floor(area / 10));
    for (let i = 0; i < tableCount; i++) {
        eqList.push({ id: 'table', name: `${t('lab.item.table')} ${i + 1}`, zone: 'prepa', ...D['table'] });
    }

    // Frigos: If budget > 15k and area > 30m2, add an extra frigo if not already multi
    const extraFrigos = (budget > 15000 && area > 30) ? 1 : 0;
    for (let i = 0; i < extraFrigos; i++) {
        eqList.push({ id: 'frigo', name: t('lab.item.frigo_sup'), zone: 'froid', ...D['frigo'] });
    }

    // Armoires: 1 per 15m2
    const armoireCount = Math.max(1, Math.floor(area / 15));
    for (let i = 0; i < armoireCount; i++) {
        eqList.push({ id: 'armoire', name: `${t('lab.item.armoire')} ${i + 1}`, zone: 'stockage', ...D['armoire'] });
    }

    // Infrastructure items
    eqList.push({ id: 'evier', name: t('lab.item.evier'), zone: 'lavage', ...D['evier'] });
    eqList.push({ id: 'porte', name: t('lab.item.porte'), zone: 'infra', ...D['porte'] });

    const groups = {};
    eqList.forEach(eq => {
        if (!groups[eq.zone]) groups[eq.zone] = [];
        groups[eq.zone].push(eq);
    });
    Object.values(groups).forEach(g => g.sort((a, b) => (b.w * b.d) - (a.w * a.d)));

    const M = PLAN_MARGIN;

    // 1 Porte
    if (groups.infra) groups.infra.forEach(eq => planPlaced.push(makePlanItem(eq, planRoomW / 2 - eq.d / 2, planRoomL - eq.w - M)));

    // 2 Cuisson
    let cx = M;
    if (groups.cuisson) groups.cuisson.forEach(eq => {
        if (cx + eq.w <= planRoomW - M) { planPlaced.push(makePlanItem(eq, cx, M)); cx += eq.w + 0.2; }
    });

    // 3 Froid
    let fy = M;
    const coldItems = groups.froid || [];
    coldItems.forEach(eq => {
        const ex = planRoomW - eq.w - M;
        if (fy + eq.d <= planRoomL - PLAN_AISLE - M && ex >= PLAN_AISLE) {
            planPlaced.push(makePlanItem(eq, ex, fy)); fy += eq.d + 0.2;
        }
    });

    // 4 Stockage
    let sy = M;
    if (groups.stockage) groups.stockage.forEach(eq => {
        if (sy + eq.d <= planRoomL - PLAN_AISLE - M) { planPlaced.push(makePlanItem(eq, M, sy)); sy += eq.d + 0.2; }
    });

    // 5 Prepa
    const getLargestD = (items) => items && items.length ? Math.max(...items.map(eq => eq.w)) : 0; // Using w or d approx
    const leftEdge = Math.max(M, getLargestD(groups.stockage) + M + 0.3);
    const rightEdge = Math.min(planRoomW - M, planRoomW - getLargestD(coldItems) - M - 0.3);
    const topEdge = Math.max(M, getLargestD(groups.cuisson) + M + PLAN_AISLE * 0.8);
    const bottomLimit = planRoomL - PLAN_AISLE - 0.5;
    const centerW = rightEdge - leftEdge;

    let py = topEdge;
    if (groups.prepa) groups.prepa.forEach(eq => {
        const ex = leftEdge + (centerW - eq.w) / 2;
        if (py + eq.d <= bottomLimit && ex >= leftEdge && ex + eq.w <= rightEdge) {
            planPlaced.push(makePlanItem(eq, Math.max(leftEdge, pSnap(ex)), pSnap(py))); py += eq.d + 0.35;
        }
    });

    // 6 Lavage
    if (groups.lavage) groups.lavage.forEach(eq => {
        const ex = planRoomW - eq.w - M;
        const ey = planRoomL - eq.d - PLAN_AISLE * 0.5;
        planPlaced.push(makePlanItem(eq, pSnap(ex), pSnap(Math.min(ey, bottomLimit))));
    });

    savePlanPlacements();
    buildPlanLegend(groups);
    drawPlan2D();
    renderDevis(); // Update devis if generated
}

function makePlanItem(eq, x, y) {
    return {
        id: eq.id, name: eq.name, zone: eq.zone,
        x: pSnap(Math.max(0, Math.min(planRoomW - eq.w, x))),
        y: pSnap(Math.max(0, Math.min(planRoomL - eq.d, y))),
        w: eq.w, d: eq.d, color: eq.color || '#999', label: eq.label || eq.name
    };
}

function savePlanPlacements() {
    localStorage.setItem(getLabPlacementsKey(), JSON.stringify({
        roomW: planRoomW, roomL: planRoomL,
        placed: planPlaced.map(p => ({ id: p.id, x: p.x, y: p.y, w: p.w, d: p.d, zone: p.zone, label: p.label, color: p.color }))
    }));
    localStorage.setItem(getLabStatusKey(), 'true');
}

function drawPlan2D() {
    const canvas = document.getElementById('planCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cw = canvas.width / devicePixelRatio;
    const ch = canvas.height / devicePixelRatio;
    ctx.clearRect(0, 0, cw, ch);

    ctx.fillStyle = '#eef0f5';
    ctx.fillRect(0, 0, cw, ch);

    const [rx, ry] = pMToPx(0, 0);
    const rw = planRoomW * planScale, rh = planRoomL * planScale;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(rx, ry, rw, rh);

    // Walls
    const wt = PLAN_WALL_T * planScale;
    ctx.fillStyle = 'var(--primary)';
    ctx.fillRect(rx - wt, ry - wt, rw + wt * 2, wt);
    ctx.fillRect(rx - wt, ry + rh, rw + wt * 2, wt);
    ctx.fillRect(rx - wt, ry, wt, rh);
    ctx.fillRect(rx + rw, ry, wt, rh);

    // Placed
    planPlaced.forEach((p, i) => {
        const [px, py] = pMToPx(p.x, p.y);
        const pw = p.w * planScale, pd = p.d * planScale;

        ctx.fillStyle = p.color;
        ctx.fillRect(px, py, pw, pd);
        ctx.strokeStyle = (planDragging === i) ? 'var(--accent)' : 'rgba(0,0,0,0.2)';
        ctx.lineWidth = (planDragging === i) ? 3 : 1;
        ctx.strokeRect(px, py, pw, pd);

        const maxFontSize = Math.min(12, pw * 0.85 / Math.max(1, p.label.length) * 1.8);
        if (maxFontSize >= 6) {
            ctx.fillStyle = '#fff';
            ctx.font = `bold ${Math.round(maxFontSize)}px Inter`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(p.label.substring(0, 10), px + pw / 2, py + pd / 2);
        }
    });
}

function buildPlanLegend(groups) {
    const el = document.getElementById('legendContent');
    if (!el) return;
    let html = '';
    planPlaced.forEach(p => {
        html += `<div style="display:flex;align-items:center;gap:8px;padding:4px;border-bottom:1px solid #eee;font-size:0.8rem">
            <span style="width:10px;height:10px;background:${p.color};display:inline-block;border-radius:2px"></span>
            <span style="flex:1">${p.name}</span>
            <span style="color:var(--text-muted);font-size:0.7rem">${p.w}x${p.d}m</span>
        </div>`;
    });
    el.innerHTML = html;
}

// DRAG AND DROP
function pOnMouseDown(e) {
    const canvas = document.getElementById('planCanvas');
    const rect = canvas.getBoundingClientRect();
    const [mx, my] = pPxToM(e.clientX - rect.left, e.clientY - rect.top);
    for (let i = planPlaced.length - 1; i >= 0; i--) {
        const p = planPlaced[i];
        if (mx >= p.x && mx <= p.x + p.w && my >= p.y && my <= p.y + p.d) {
            planDragging = i;
            planDragOff = { x: mx - p.x, y: my - p.y };
            canvas.style.cursor = 'grabbing';
            drawPlan2D();
            return;
        }
    }
}

function pOnMouseMove(e) {
    if (planDragging === null) return;
    const canvas = document.getElementById('planCanvas');
    const rect = canvas.getBoundingClientRect();
    const [mx, my] = pPxToM(e.clientX - rect.left, e.clientY - rect.top);
    const p = planPlaced[planDragging];
    p.x = pSnap(Math.max(0, Math.min(planRoomW - p.w, mx - planDragOff.x)));
    p.y = pSnap(Math.max(0, Math.min(planRoomL - p.d, my - planDragOff.y)));
    drawPlan2D();
}

function pOnMouseUp() {
    if (planDragging === null) return;
    planDragging = null;
    const canvas = document.getElementById('planCanvas');
    if (canvas) canvas.style.cursor = 'grab';
    savePlanPlacements();
    drawPlan2D();
    renderDevis();
}


// --- DEVIS ---
function renderDevis() {
    const container = document.getElementById('devisContainer');
    if (!container) return;

    const config = window.loadConfig() || {};
    const placementsLocal = JSON.parse(localStorage.getItem(getLabPlacementsKey())) || { roomW: 6, roomL: 8, placed: [] };

    if (!config.results || config.results.length === 0) {
        container.innerHTML = `<div style="text-align:center; padding:3rem;"><p>${t('devis.empty')}</p></div>`;
        return;
    }

    // Translate mode
    const modeLabel = t('lab.mode.' + config.mode);

    let tableRows = '';
    config.results.forEach((r, idx) => {
        // Find tier level label localized
        const tierLevel = r.selected.level;
        const levelMap = { "Entrée de gamme": t('lab.tier.1'), "Intermédiaire": t('lab.tier.2'), "Professionnel": t('lab.tier.3'), "Premium": t('lab.tier.4') };
        const levelTrans = levelMap[tierLevel] || tierLevel;

        tableRows += `
            <tr class="ing-row">
                <td>${idx + 1}</td>
                <td><strong>${r.name || r.id}</strong> <span style="color:var(--text-muted);font-size:0.8rem">(${r.selected.brand} · ${levelTrans})</span></td>
                <td style="text-align:right">${r.selected.price.toLocaleString(getLang() === 'en' ? 'en-GB' : (getLang() === 'es' ? 'es-ES' : 'fr-FR'))} €</td>
            </tr>
        `;
    });

    container.innerHTML = `
        <div class="card">
            <h2 class="card-title">${t('devis.title')}</h2>
            <p class="card-subtitle">${t('devis.config')}: ${modeLabel}</p>
            <div style="margin-top:1.5rem">
                <canvas id="planCanvasPreview" style="background:#f9fafb; border:1px solid var(--surface-border); border-radius:var(--radius-sm); max-width:100%; height:auto;"></canvas>
            </div>
            
            <table style="width:100%; margin-top:1.5rem; text-align:left; border-collapse:collapse;" class="table">
                <thead style="border-bottom:2px solid var(--surface-border); font-size:0.8rem; color:var(--text-muted); text-transform:uppercase;">
                    <tr><th>${t('devis.col.idx')}</th><th>${t('devis.col.item')}</th><th style="text-align:right">${t('devis.col.price')}</th></tr>
                </thead>
                <tbody>
                    ${tableRows}
                </tbody>
            </table>
            
            <div style="margin-top:1rem; padding-top:1rem; border-top:2px solid var(--primary); display:flex; justify-content:space-between; align-items:center; font-weight:800;">
                <span>${t('devis.total')}</span>
                <span style="font-size:1.4rem; color:var(--accent);">${config.total.toLocaleString(getLang() === 'en' ? 'en-GB' : (getLang() === 'es' ? 'es-ES' : 'fr-FR'))} € HT</span>
            </div>
            
            <button class="btn btn-primary btn-full" style="margin-top:1.5rem;" onclick="window.print()">${t('devis.print')}</button>
        </div>
    `;

    setTimeout(drawPlanPreviewCustom, 100);
}

function drawPlanPreviewCustom() {
    const canvas = document.getElementById('planCanvasPreview');
    if (!canvas) return;
    const placementsLocal = JSON.parse(localStorage.getItem(getLabPlacementsKey()));
    if (!placementsLocal) return;

    const ctx = canvas.getContext('2d');
    const width = 800;
    const height = 400;
    canvas.width = width;
    canvas.height = height;

    const rw = placementsLocal.roomW;
    const rl = placementsLocal.roomL;

    const pad = 20;
    const scale = Math.min((width - pad * 2) / rw, (height - pad * 2) / rl);
    const ox = (width - rw * scale) / 2;
    const oy = (height - rl * scale) / 2;

    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 4;
    ctx.strokeRect(ox, oy, rw * scale, rl * scale);
    ctx.fillRect(ox, oy, rw * scale, rl * scale);

    placementsLocal.placed.forEach(p => {
        ctx.fillStyle = p.color || '#9ca3af';
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.lineWidth = 1;
        const px = ox + p.x * scale;
        const py = oy + p.y * scale;
        const pw = p.w * scale;
        const pd = p.d * scale;
        ctx.fillRect(px, py, pw, pd);
        ctx.strokeRect(px, py, pw, pd);
    });
}


// --- BIND EVENTS ---
function initLabConfigurator() {
    const slider = document.getElementById('budgetSlider');
    const throttledUpdateLab = (typeof throttle === 'function') ? throttle(updateLab, 50) : updateLab;
    if (slider) slider.addEventListener('input', throttledUpdateLab);

    const modeGrid = document.getElementById('modeGrid');
    if (modeGrid) {
        modeGrid.addEventListener('click', (e) => {
            const btn = e.target.closest('.card');
            if (!btn) return;
            modeGrid.querySelectorAll('.card').forEach(b => { b.style.borderColor = 'var(--surface-border)'; b.style.boxShadow = 'none'; });
            btn.style.borderColor = 'var(--accent)';
            btn.style.boxShadow = 'var(--shadow-accent)';
            labCurrentMode = btn.dataset.mode;
            updateLab();
        });
    }

    const tabsBar = document.getElementById('tabsBar');
    if (tabsBar) {
        tabsBar.addEventListener('click', (e) => {
            const btn = e.target.closest('.btn-outline');
            if (!btn) return;
            tabsBar.querySelectorAll('.btn-outline').forEach(b => { b.style.background = 'transparent'; b.style.color = 'var(--text-secondary)'; });
            btn.style.background = 'var(--accent-glow)';
            btn.style.color = 'var(--accent)';
            btn.style.borderColor = 'var(--accent)';
            labCurrentCategory = btn.dataset.cat;
            renderLabGrid(labCurrentResults, labCurrentCategory, 'skeleton');
        });
    }

    const c = document.getElementById('planCanvas');
    if (c) {
        c.addEventListener('mousedown', pOnMouseDown);
        c.addEventListener('mousemove', pOnMouseMove);
        c.addEventListener('mouseup', pOnMouseUp);
        c.addEventListener('mouseleave', pOnMouseUp);
    }

    const bgtn = document.getElementById('btnGenerate');
    if (bgtn) bgtn.addEventListener('click', generatePlan2D);
    const rwEl = document.getElementById('roomW');
    const rlEl = document.getElementById('roomL');
    if (rwEl) rwEl.addEventListener('change', initPlan2D);
    if (rlEl) rlEl.addEventListener('change', initPlan2D);

    window.addEventListener('resize', resizePlan2D);
}

document.addEventListener('DOMContentLoaded', () => {
    // We delay slightly so `app.js` runs first if needed.
    setTimeout(() => {
        initLabConfigurator();
    }, 100);
});
