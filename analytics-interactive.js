// analytics-interactive.js — GourmetRevient v3.0
// Charts interactifs avec zoom, filtres période/catégorie + PWA offline manager

// ── PWA Offline Manager ──────────────────────────────────────────────────────
(function initPWA() {
  if (!('serviceWorker' in navigator)) return;

  const banner = document.getElementById('offlineBanner');
  const badge  = document.getElementById('syncPendingBadge');
  const count  = document.getElementById('syncCount');

  function showBanner() { banner && banner.classList.add('visible'); }
  function hideBanner() { banner && banner.classList.remove('visible'); }

  window.addEventListener('offline', showBanner);
  window.addEventListener('online', () => {
    hideBanner();
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    }
    if (typeof showToast === 'function') showToast('🌐 Connexion rétablie — synchronisation en cours…', 'success');
  });

  if (!navigator.onLine) showBanner();

  // Messages du SW
  if (navigator.serviceWorker) {
    navigator.serviceWorker.addEventListener('message', ({ data }) => {
      if (!data) return;
      if (data.type === 'SYNC_COMPLETE' && typeof showToast === 'function') {
        showToast(`✅ ${data.synced} opération(s) synchronisée(s)`, 'success');
        if (badge) badge.classList.remove('has-pending');
      }
    });
  }

  // Queue une opération pour sync offline
  window.queueOfflineOp = function(op) {
    if (!navigator.serviceWorker.controller) return;
    navigator.serviceWorker.controller.postMessage({ type: 'QUEUE_OP', payload: op });
    const n = parseInt((count && count.textContent) || '0') + 1;
    if (count) count.textContent = n;
    if (badge) badge.classList.add('has-pending');
  };
})();

// ── Analytics Interactif ─────────────────────────────────────────────────────
window.AnalyticsInteractive = (function() {
  'use strict';

  // État partagé
  let state = {
    period:   'all',   // '7d' | '30d' | '90d' | 'all'
    category: 'all',
    recipes:  [],
    charts:   {}
  };

  // Couleurs palette cohérente
  const PALETTE = {
    accent:  '#6366f1',
    success: '#10b981',
    warning: '#f59e0b',
    danger:  '#ef4444',
    info:    '#3b82f6',
    muted:   '#8e8f93',
    gradient: (ctx, color1, color2) => {
      if (!ctx) return color1;
      const g = ctx.createLinearGradient(0, 0, 0, ctx.canvas.height);
      g.addColorStop(0, color1);
      g.addColorStop(1, color2);
      return g;
    }
  };

  // Filtre les recettes selon l'état courant
  function getFilteredRecipes() {
    let recipes = [...(window.APP?.savedRecipes || state.recipes)];
    if (state.category !== 'all') {
      recipes = recipes.filter(r => (r.category || '').toLowerCase() === state.category.toLowerCase());
    }
    if (state.period !== 'all') {
      const days = state.period === '7d' ? 7 : state.period === '30d' ? 30 : 90;
      const cutoff = new Date(Date.now() - days * 86400000);
      recipes = recipes.filter(r => r.savedAt && new Date(r.savedAt) >= cutoff);
    }
    return recipes;
  }

  // Calcule les KPIs agrégés
  function calcKPIs(recipes) {
    if (!recipes.length) return { avgMargin: 0, avgCost: 0, avgPrice: 0, best: null, worst: null, total: 0 };
    const margins = recipes.map(r => r.costs?.marginPct || 70);
    const costs   = recipes.map(r => r.costs?.costPerPortion || 0);
    const prices  = recipes.map(r => r.costs?.sellingPrice || 0);
    const sorted  = [...recipes].sort((a, b) => (b.costs?.marginPct || 0) - (a.costs?.marginPct || 0));
    return {
      avgMargin: margins.reduce((s, v) => s + v, 0) / margins.length,
      avgCost:   costs.reduce((s, v) => s + v, 0)   / costs.length,
      avgPrice:  prices.reduce((s, v) => s + v, 0)  / prices.length,
      best:  sorted[0],
      worst: sorted[sorted.length - 1],
      total: recipes.length
    };
  }

  // Détecte toutes les catégories disponibles
  function getCategories() {
    const recipes = window.APP?.savedRecipes || [];
    const cats = [...new Set(recipes.map(r => r.category).filter(Boolean))];
    return cats;
  }

  // ── Rendu du header Analytics interactif ──
  function renderAnalyticsHeader(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const cats = getCategories();
    const catPills = cats.map(c => `
      <button class="cat-pill${state.category === c ? ' active' : ''}"
        onclick="AnalyticsInteractive.setCategory('${c.replace(/'/g, "\\'")}')">
        ${c}
      </button>`).join('');

    el.innerHTML = `
      <div class="analytics-header">
        <h2 class="analytics-title">📊 Cockpit de Pilotage Pro</h2>
        <div class="analytics-toolbar">
          <div class="period-filter-group" id="periodFilters">
            ${['7d','30d','90d','all'].map(p => `
              <button class="period-filter-btn${state.period === p ? ' active' : ''}"
                onclick="AnalyticsInteractive.setPeriod('${p}')">
                ${p === 'all' ? 'Tout' : p}
              </button>`).join('')}
          </div>
          <button class="btn btn-sm btn-primary" onclick="exportStatsPDF()" style="font-size:0.78rem;">📄 PDF</button>
        </div>
      </div>
      ${cats.length > 1 ? `
      <div class="category-filter-pills" style="margin-bottom:1.5rem;">
        <button class="cat-pill${state.category === 'all' ? ' active' : ''}"
          onclick="AnalyticsInteractive.setCategory('all')">Toutes</button>
        ${catPills}
      </div>` : ''}
    `;
  }

  // ── KPI Row ──
  function renderKPIRow(containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;
    const recipes = getFilteredRecipes();
    const kpi = calcKPIs(recipes);

    const trendClass = kpi.avgMargin >= 70 ? 'up' : kpi.avgMargin >= 60 ? 'flat' : 'down';
    const trendIcon  = kpi.avgMargin >= 70 ? '↑' : kpi.avgMargin >= 60 ? '→' : '↓';

    el.innerHTML = `
      <div class="analytics-kpi-card">
        <div class="analytics-kpi-label">📈 Marge Moyenne</div>
        <div class="analytics-kpi-value">${kpi.avgMargin.toFixed(1)}%</div>
        <div class="analytics-kpi-trend ${trendClass}">${trendIcon} Cible : 70%</div>
      </div>
      <div class="analytics-kpi-card">
        <div class="analytics-kpi-label">💎 Star Performeur</div>
        <div class="analytics-kpi-value" style="font-size:1.1rem;">${kpi.best?.name || '—'}</div>
        <div class="analytics-kpi-trend up">↑ ${Math.round(kpi.best?.costs?.marginPct || 0)}% marge</div>
      </div>
      <div class="analytics-kpi-card">
        <div class="analytics-kpi-label">⚖️ Coût Moyen</div>
        <div class="analytics-kpi-value">${kpi.avgCost.toFixed(2)} €</div>
        <div class="analytics-kpi-trend flat">→ Par portion</div>
      </div>
      <div class="analytics-kpi-card">
        <div class="analytics-kpi-label">🏷️ Prix Moyen</div>
        <div class="analytics-kpi-value">${kpi.avgPrice.toFixed(2)} €</div>
        <div class="analytics-kpi-trend flat">→ Vente HT</div>
      </div>
      <div class="analytics-kpi-card">
        <div class="analytics-kpi-label">📋 Recettes</div>
        <div class="analytics-kpi-value">${kpi.total}</div>
        <div class="analytics-kpi-trend flat">→ Filtrées</div>
      </div>
    `;

    // Animation compteurs
    if (typeof animateTicker === 'function') {
      el.querySelectorAll('.analytics-kpi-value').forEach(v => {
        const txt = v.textContent;
        const num = parseFloat(txt);
        if (!isNaN(num) && num > 0) {
          const suffix = txt.replace(/[\d.]/g, '');
          animateTicker(v, num.toFixed(suffix.includes('%') ? 1 : 2), 800, suffix);
        }
      });
    }
  }

  // ── Chart Répartition des Marges (Doughnut interactif) ──
  function renderMarginChart(canvasId, resetBtnId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const recipes = getFilteredRecipes();
    const bands = [
      { label: '> 80% — Excellent', min: 80, max: 999, color: PALETTE.success },
      { label: '70–80% — Cible',    min: 70, max: 80,  color: PALETTE.accent  },
      { label: '60–70% — Acceptable',min:60, max: 70,  color: PALETTE.warning },
      { label: '< 60% — Critique',  min: 0,  max: 60,  color: PALETTE.danger  },
    ];

    const data = bands.map(b =>
      recipes.filter(r => {
        const m = r.costs?.marginPct || 70;
        return m >= b.min && m < b.max;
      }).length
    );

    if (state.charts[canvasId]) {
      state.charts[canvasId].destroy();
      delete state.charts[canvasId];
    }

    const ctx = canvas.getContext('2d');
    state.charts[canvasId] = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: bands.map(b => b.label),
        datasets: [{
          data,
          backgroundColor: bands.map(b => b.color + 'CC'),
          borderColor:     bands.map(b => b.color),
          borderWidth: 2,
          hoverBorderWidth: 3,
          hoverOffset: 8
        }]
      },
      plugins: [ChartDataLabels],
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '68%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.parsed} recette(s) — ${ctx.label.split('—')[0].trim()}`
            }
          },
          datalabels: {
            color: '#fff',
            font: { weight: 'bold', size: 13 },
            formatter: (val) => val > 0 ? val : '',
          }
        },
        animation: { animateRotate: true, duration: 800 }
      }
    });
  }

  // ── Chart Top 5 Performance (Bar horizontal zoomable) ──
  function renderPerformanceChart(canvasId, resetBtnId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const recipes = getFilteredRecipes()
      .sort((a, b) => (b.costs?.marginPct || 0) - (a.costs?.marginPct || 0))
      .slice(0, 8);

    const labels  = recipes.map(r => r.name.length > 18 ? r.name.slice(0, 16) + '…' : r.name);
    const margins = recipes.map(r => r.costs?.marginPct || 0);
    const colors  = margins.map(m =>
      m >= 80 ? PALETTE.success : m >= 70 ? PALETTE.accent : m >= 60 ? PALETTE.warning : PALETTE.danger
    );

    if (state.charts[canvasId]) { state.charts[canvasId].destroy(); delete state.charts[canvasId]; }

    const ctx = canvas.getContext('2d');
    const resetBtn = document.getElementById(resetBtnId);

    state.charts[canvasId] = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Marge (%)',
          data: margins,
          backgroundColor: colors.map(c => c + 'BB'),
          borderColor: colors,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        indexAxis: 'y',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` Marge : ${ctx.parsed.x.toFixed(1)}%`
            }
          },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'x',
              onZoom: () => { if (resetBtn) resetBtn.classList.add('visible'); }
            },
            pan: {
              enabled: true,
              mode: 'x',
            }
          }
        },
        scales: {
          x: {
            min: 0, max: 100,
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: {
              callback: v => v + '%',
              font: { family: "'Outfit', sans-serif", weight: '700', size: 11 }
            }
          },
          y: {
            grid: { display: false },
            ticks: { font: { family: "'Plus Jakarta Sans', sans-serif", size: 11 } }
          }
        },
        animation: { duration: 700, easing: 'easeOutQuart' }
      }
    });

    if (resetBtn) {
      resetBtn.onclick = () => {
        state.charts[canvasId].resetZoom();
        resetBtn.classList.remove('visible');
      };
    }
  }

  // ── Chart Matrice de Rentabilité (Scatter zoomable) ──
  function renderScatterChart(canvasId, resetBtnId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || !window.Chart) return;

    const recipes = getFilteredRecipes();
    const resetBtn = document.getElementById(resetBtnId);

    const datasets = [
      { label: '⭐ Stars',   filter: r => r.costs?.marginPct >= 70 && r.costs?.costPerPortion <= 3, color: PALETTE.success },
      { label: '💎 Premium', filter: r => r.costs?.marginPct >= 70 && r.costs?.costPerPortion > 3,  color: PALETTE.accent  },
      { label: '📦 Volume',  filter: r => r.costs?.marginPct < 70  && r.costs?.costPerPortion <= 3, color: PALETTE.warning },
      { label: '⚠️ Critique',filter: r => r.costs?.marginPct < 70  && r.costs?.costPerPortion > 3,  color: PALETTE.danger  },
    ].map(ds => ({
      label: ds.label,
      data: recipes.filter(ds.filter).map(r => ({
        x: r.costs?.costPerPortion || 0,
        y: r.costs?.marginPct || 0,
        name: r.name
      })),
      backgroundColor: ds.color + 'AA',
      borderColor: ds.color,
      borderWidth: 2,
      pointRadius: 8,
      pointHoverRadius: 11
    }));

    if (state.charts[canvasId]) { state.charts[canvasId].destroy(); delete state.charts[canvasId]; }

    const ctx = canvas.getContext('2d');
    state.charts[canvasId] = new Chart(ctx, {
      type: 'scatter',
      data: { datasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              font: { family: "'Plus Jakarta Sans', sans-serif", weight: '700', size: 11 },
              padding: 16,
              usePointStyle: true,
              pointStyleWidth: 10
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ${ctx.raw.name} — Coût: ${ctx.parsed.x.toFixed(2)}€ | Marge: ${ctx.parsed.y.toFixed(1)}%`
            }
          },
          zoom: {
            zoom: {
              wheel: { enabled: true },
              pinch: { enabled: true },
              mode: 'xy',
              onZoom: () => { if (resetBtn) resetBtn.classList.add('visible'); }
            },
            pan: { enabled: true, mode: 'xy' }
          }
        },
        scales: {
          x: {
            title: {
              display: true, text: 'Coût par portion (€)',
              font: { family: "'Outfit', sans-serif", weight: '800', size: 12 }
            },
            grid: { color: 'rgba(0,0,0,0.05)' },
            ticks: { callback: v => v.toFixed(2) + '€' }
          },
          y: {
            title: {
              display: true, text: 'Marge (%)',
              font: { family: "'Outfit', sans-serif", weight: '800', size: 12 }
            },
            min: 0, max: 100,
            ticks: { callback: v => v + '%' },
            grid: {
              color: ctx => ctx.tick.value === 70
                ? 'rgba(99,102,241,0.25)'
                : 'rgba(0,0,0,0.04)',
              lineWidth: ctx => ctx.tick.value === 70 ? 2 : 1
            }
          }
        },
        animation: { duration: 600 }
      }
    });

    if (resetBtn) {
      resetBtn.onclick = () => {
        state.charts[canvasId].resetZoom();
        resetBtn.classList.remove('visible');
      };
    }
  }

  // ── API publique ─────────────────────────────────────────────────────────────
  function refresh() {
    renderAnalyticsHeader('statsAnalyticsHeader');
    renderKPIRow('statsKPIRow');
    renderMarginChart('v2MarginChart', 'marginZoomReset');
    renderPerformanceChart('v2PerformanceChart', 'perfZoomReset');
    renderScatterChart('v2ScatterChart', 'scatterZoomReset');
  }

  function setPeriod(p) {
    state.period = p;
    document.querySelectorAll('.period-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === (p === 'all' ? 'Tout' : p));
    });
    refresh();
  }

  function setCategory(c) {
    state.category = c;
    document.querySelectorAll('.cat-pill').forEach(btn => {
      btn.classList.toggle('active', btn.textContent.trim() === (c === 'all' ? 'Toutes' : c));
    });
    refresh();
  }

  // Injecter les conteneurs HTML manquants dans le tab Dashboard
  function injectContainers() {
    const dashView = document.getElementById('mgmtViewDashboard');
    if (!dashView || dashView.dataset.analyticsReady) return;
    dashView.dataset.analyticsReady = '1';

    // Ajouter le header analytics et la row KPI avant le contenu existant
    const existingHeader = dashView.querySelector('.stats-header');
    if (existingHeader) {
      const headerDiv = document.createElement('div');
      headerDiv.id = 'statsAnalyticsHeader';
      dashView.insertBefore(headerDiv, existingHeader);
      existingHeader.style.display = 'none'; // remplacé par le nouveau

      const kpiRow = document.createElement('div');
      kpiRow.id = 'statsKPIRow';
      kpiRow.className = 'analytics-kpi-row';
      dashView.insertBefore(kpiRow, existingHeader.nextSibling);
    }

    // Ajouter les boutons reset zoom aux charts existants
    addResetBtn('v2PerformanceChart', 'perfZoomReset');
    addResetBtn('v2ScatterChart', 'scatterZoomReset');
    addResetBtn('v2MarginChart', 'marginZoomReset');
  }

  function addResetBtn(canvasId, btnId) {
    const canvas = document.getElementById(canvasId);
    if (!canvas || document.getElementById(btnId)) return;

    // On remonte jusqu'à la mgmt-glass-card parente pour placer
    // le hint/reset APRÈS le canvas, jamais en overlay dessus.
    const canvasWrapper = canvas.parentElement; // div avec height fixe
    const card = canvasWrapper ? canvasWrapper.closest('.mgmt-glass-card, .analytics-chart-card') : null;
    const insertTarget = card || canvasWrapper;
    if (!insertTarget) return;

    // Footer sous le chart (flex row : hint à gauche, reset à droite)
    const footer = document.createElement('div');
    footer.id = `${btnId}-footer`;
    footer.style.cssText = [
      'display:flex',
      'align-items:center',
      'justify-content:space-between',
      'margin-top:8px',
      'padding:0 2px',
      'min-height:22px',
    ].join(';');

    // Hint discret (à gauche)
    const hint = document.createElement('span');
    hint.className = 'chart-zoom-hint-label';
    hint.textContent = '🖱 Molette : zoom  ·  Clic-glisser : naviguer';
    hint.style.cssText = [
      'font-size:0.68rem',
      'color:var(--text-muted)',
      'font-weight:500',
      'opacity:0.65',
      'pointer-events:none',
      'white-space:nowrap',
      'overflow:hidden',
      'text-overflow:ellipsis',
    ].join(';');

    // Bouton reset (à droite, caché par défaut)
    const btn = document.createElement('button');
    btn.id = btnId;
    btn.className = 'chart-zoom-reset';
    btn.innerHTML = '↺ Reset zoom';
    // Pas de position absolute — il est dans le flow du footer
    btn.style.cssText = 'position:static; margin-left:auto; flex-shrink:0;';

    footer.appendChild(hint);
    footer.appendChild(btn);

    // Insérer le footer après le canvasWrapper (pas dedans)
    if (canvasWrapper && canvasWrapper.parentElement) {
      canvasWrapper.parentElement.insertBefore(footer, canvasWrapper.nextSibling);
    } else {
      insertTarget.appendChild(footer);
    }
  }

  // Hooker sur le changement de tab Dashboard
  const _origSwitchMgmtTab = window.switchMgmtTab;
  window.switchMgmtTab = function(tab) {
    if (typeof _origSwitchMgmtTab === 'function') _origSwitchMgmtTab(tab);
    if (tab === 'dashboard') {
      setTimeout(() => {
        injectContainers();
        refresh();
      }, 80);
    }
  };

  // Init au chargement si le dashboard est déjà visible
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
      const dash = document.getElementById('mgmtViewDashboard');
      if (dash && dash.style.display !== 'none') {
        injectContainers();
        refresh();
      }
    }, 500);
  });

  return { refresh, setPeriod, setCategory };
})();
