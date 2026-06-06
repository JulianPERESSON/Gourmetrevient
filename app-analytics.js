// STATISTICS & CHARTS (V2)
// =====================================================================

// =====================================================================
// STATISTICS & CHARTS (V2)
// =====================================================================

function filterStatsCat(cat) {
  window.currentStatsCat = cat;
  const btns = document.querySelectorAll('#statsCategoryFilters .stats-toggle-btn');
  btns.forEach(b => {
    if (b.getAttribute('data-cat') === cat) b.classList.add('active');
    else b.classList.remove('active');
  });
  renderStats();
}

function renderStats() {
  const container = document.getElementById('mgmtViewDashboard');
  if (!container || container.style.display === 'none') return;

  const saved = APP.savedRecipes || [];
  const library = typeof RECIPES !== 'undefined' ? RECIPES : [];
  let recipes = [...saved, ...library];

  if (recipes.length === 0) {
    const grid = document.querySelector('.stats-main-grid');
    if (grid) {
      grid.style.opacity = '0.5';
      grid.style.pointerEvents = 'none';
    }
    const insightText = document.getElementById('statsInsightText');
    if (insightText) insightText.innerHTML = "Créez vos premières recettes pour activer l'analyse stratégique.";
    const vigilanceList = document.getElementById('statsVigilanceList');
    if (vigilanceList) vigilanceList.innerHTML = '<div style="text-align:center; padding:1rem; color:var(--text-muted); font-size:0.8rem;">Aucune donnée à analyser.</div>';
    return;
  } else {
    const grid = document.querySelector('.stats-main-grid');
    if (grid) {
      grid.style.opacity = '1';
      grid.style.pointerEvents = 'auto';
    }
  }

  // Calculate full data for all recipes
  const allResults = recipes.map(r => ({
    ...r,
    data: calcFullCost(r.margin || 70, r)
  }));

  // Filter based on selected category
  const filteredResults = window.currentStatsCat === 'all'
    ? allResults
    : allResults.filter(r => r.category === window.currentStatsCat);

  // --- 0. POPULATE CATEGORY FILTERS ---
  const catFilterContainer = document.getElementById('statsCategoryFilters');
  if (catFilterContainer) {
    const categories = [...new Set(allResults.map(r => r.category).filter(Boolean))];
    let html = `<button class="stats-toggle-btn ${window.currentStatsCat === 'all' ? 'active' : ''}" 
                 onclick="filterStatsCat('all')" data-cat="all" data-i18n="ui.all">${i18n.t('ui.all') || 'Toutes'}</button>`;

    categories.forEach(cat => {
      html += `<button class="stats-toggle-btn ${window.currentStatsCat === cat ? 'active' : ''}" 
                onclick="filterStatsCat('${cat}')" data-cat="${cat}">${cat}</button>`;
    });
    catFilterContainer.innerHTML = html;
  }

  if (filteredResults.length === 0) {
    const vigilanceList = document.getElementById('statsVigilanceList');
    if (vigilanceList) vigilanceList.innerHTML = '<div style="text-align:center; padding:1rem; color:var(--text-muted); font-size:0.8rem;">Aucune recette dans cette catégorie.</div>';
    return;
  }

  // --- 1. KPI UPDATES ---
  const avgMargin = filteredResults.reduce((sum, r) => sum + r.data.marginPct, 0) / filteredResults.length;
  const sortedByMargin = [...filteredResults].sort((a, b) => b.data.marginPct - a.data.marginPct);
  const bestRecipe = sortedByMargin[0];
  const worstRecipe = sortedByMargin[sortedByMargin.length - 1];
  const avgCost = filteredResults.reduce((sum, r) => sum + r.data.costPerPortion, 0) / filteredResults.length;
  const avgPrice = filteredResults.reduce((sum, r) => sum + r.data.sellingPrice, 0) / filteredResults.length;

  if ($('#v2KpiAvgMargin')) $('#v2KpiAvgMargin').textContent = avgMargin.toFixed(1) + '%';
  if ($('#v2KpiBestRecipe')) $('#v2KpiBestRecipe').textContent = bestRecipe.name;
  if ($('#v2KpiWorstRecipe')) $('#v2KpiWorstRecipe').textContent = worstRecipe.name;
  if ($('#v2KpiAvgCost')) $('#v2KpiAvgCost').textContent = avgCost.toFixed(2) + '€';
  if ($('#v2KpiAvgPrice')) $('#v2KpiAvgPrice').textContent = avgPrice.toFixed(2) + '€';

  // --- 2. INSIGHTS ---
  let insightText = i18n.t('stats.insight.template', {
    avg: avgMargin.toFixed(1),
    best: bestRecipe.name,
    bestMargin: bestRecipe.data.marginPct.toFixed(1)
  }) || `Votre marge moyenne est de <strong>${avgMargin.toFixed(1)}%</strong>. Le produit le plus rentable est <strong>${bestRecipe.name}</strong> (${bestRecipe.data.marginPct.toFixed(1)}%).`;

  if (worstRecipe.data.marginPct < 50) {
    insightText += " " + (i18n.t('stats.insight.attention', {
      worst: worstRecipe.name,
      worstMargin: worstRecipe.data.marginPct.toFixed(1)
    }) || `Attention à <strong>${worstRecipe.name}</strong> dont la marge est faible (${worstRecipe.data.marginPct.toFixed(1)}%).`);
  } else {
    insightText += " " + (i18n.t('stats.insight.balanced') || "Vos marges sont globalement saines et équilibrées.");
  }

  if ($('#statsInsightText')) $('#statsInsightText').innerHTML = insightText;

  // --- 3. CHARTS ---
  renderV2MarginDonut(filteredResults);
  renderV2PerformanceBars(filteredResults);
  renderV2ScatterPlot(filteredResults);
  renderV2Alerts(filteredResults);
  renderV2Table(filteredResults);
  setupStatsListeners(filteredResults);
}

async function exportStatsPDF() {
  const container = document.getElementById('appStats');
  if (!container) return;

  const opt = {
    margin: 10,
    filename: `Rapport_Performance_${new Date().toISOString().split('T')[0]}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
  };

  showToast(i18n.t('ui.toast.exporting') || "Génération du PDF...");

  // Clone element to avoid modifying live view
  const clone = container.cloneNode(true);
  clone.style.display = 'block';
  clone.style.background = '#ffffff';
  clone.classList.add('pdf-export-mode');

  // Remove buttons and inputs from clone
  clone.querySelectorAll('button, input').forEach(el => el.remove());
  clone.querySelector('.stats-filter-bar')?.remove();

  // Create positioned container so html2canvas doesn't capture a void
  const exportContainer = document.createElement('div');
  exportContainer.style.position = 'fixed';
  exportContainer.style.top = '0';
  exportContainer.style.left = '0';
  exportContainer.style.zIndex = '-9999';
  exportContainer.style.width = '1200px';
  exportContainer.appendChild(clone);
  document.body.appendChild(exportContainer);
  opt.html2canvas.windowWidth = 1200;
  opt.html2canvas.scrollY = 0;
  opt.html2canvas.scrollX = 0;

  try {
    await html2pdf().set(opt).from(exportContainer).save();
    showToast(i18n.t('ui.toast.exported') || "Rapport exporté avec succès", "success");
  } catch (err) {
    console.error("PDF Export Error:", err);
    showToast("Erreur lors de l'export PDF", "error");
  } finally {
    if (document.body.contains(exportContainer)) document.body.removeChild(exportContainer);
  }
}

function renderV2MarginDonut(results) {
  const ctx = document.getElementById('v2MarginChart')?.getContext('2d');
  if (!ctx) return;
  if (v2Charts.margin) v2Charts.margin.destroy();

  const buckets = { critical: 0, warning: 0, good: 0, excellent: 0 };
  results.forEach(r => {
    const m = r.data.marginPct;
    if (m < 30) buckets.critical++;
    else if (m < 50) buckets.warning++;
    else if (m < 70) buckets.good++;
    else buckets.excellent++;
  });

  v2Charts.margin = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['< 30%', '30-50%', '50-70%', '> 70%'],
      datasets: [{
        data: [buckets.critical, buckets.warning, buckets.good, buckets.excellent],
        backgroundColor: ['#EF4444', '#F59E0B', '#6366F1', '#22C55E'],
        borderWidth: 2,
        borderColor: '#ffffff'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '75%',
      plugins: {
        legend: { position: 'bottom', labels: { usePointStyle: true, font: { size: 10, weight: '600' } } },
        tooltip: { padding: 12, backgroundColor: '#1E293B' }
      }
    }
  });

  const excellentPct = (buckets.excellent / results.length * 100).toFixed(0);
  const analysisEl = $('#v2MarginAnalysis');
  if (analysisEl) {
    analysisEl.innerHTML = i18n.t('stats.analysis.excellent_pct', {
      pct: excellentPct,
      status: Number(excellentPct) > 50 ? i18n.t('stats.analysis.profitable') : i18n.t('stats.analysis.to_optimize')
    });
  }
}

function renderV2PerformanceBars(results) {
  const ctx = document.getElementById('v2PerformanceChart')?.getContext('2d');
  if (!ctx) return;
  if (v2Charts.performance) v2Charts.performance.destroy();

  const sorted = [...results].sort((a, b) =>
    perfMode === 'top' ? b.data.marginPct - a.data.marginPct : a.data.marginPct - b.data.marginPct
  ).slice(0, 5);

  v2Charts.performance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: sorted.map(r => r.name),
      datasets: [{
        label: i18n.t('stats.chart.margin_label'),
        data: sorted.map(r => r.data.marginPct),
        backgroundColor: perfMode === 'top' ? 'rgba(34, 197, 94, 0.8)' : 'rgba(239, 68, 68, 0.8)',
        borderRadius: 6,
        barThickness: 24
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { max: 100, grid: { display: false }, ticks: { font: { weight: '600' } } },
        y: { grid: { display: false }, ticks: { color: '#1E293B', font: { weight: '700' } } }
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${i18n.t('stats.chart.tooltip_margin')}: ${ctx.raw.toFixed(1)}% | ${i18n.t('stats.chart.tooltip_price')}: ${sorted[ctx.dataIndex].data.sellingPrice.toFixed(2)}€`
          }
        }
      }
    }
  });
}

function renderV2ScatterPlot(results) {
  const ctx = document.getElementById('v2ScatterChart')?.getContext('2d');
  if (!ctx) return;
  if (v2Charts.scatter) v2Charts.scatter.destroy();

  const data = results.map(r => ({
    x: r.data.totalMaterial,
    y: r.data.marginPct,
    name: r.name
  }));

  // Plugin for Quadrants Background
  const quadrantPlugin = {
    id: 'quadrants',
    beforeDraw(chart) {
      const { ctx, chartArea: { left, top, right, bottom }, scales: { x, y } } = chart;
      const midX = x.getPixelForValue((x.max + x.min) / 2);
      const midY = y.getPixelForValue(50); // 50% margin is mid-point strictly for quadrants

      ctx.save();
      // TL: Low Cost, High Margin (Stars)
      ctx.fillStyle = 'rgba(34, 197, 94, 0.05)';
      ctx.fillRect(left, top, midX - left, midY - top);
      // TR: High Cost, High Margin (Premium)
      ctx.fillStyle = 'rgba(99, 102, 241, 0.05)';
      ctx.fillRect(midX, top, right - midX, midY - top);
      // BL: Low Cost, Low Margin (Volume)
      ctx.fillStyle = 'rgba(245, 158, 11, 0.05)';
      ctx.fillRect(left, midY, midX - left, bottom - midY);
      // BR: High Cost, Low Margin (Danger)
      ctx.fillStyle = 'rgba(239, 68, 68, 0.05)';
      ctx.fillRect(midX, midY, right - midX, bottom - midY);
      ctx.restore();
    }
  };

  v2Charts.scatter = new Chart(ctx, {
    type: 'scatter',
    plugins: [quadrantPlugin],
    data: {
      datasets: [{
        label: i18n.t('stats.chart.recipes_label') || 'Recettes',
        data: data,
        backgroundColor: '#6366F1',
        pointRadius: 8,
        pointHoverRadius: 12,
        borderColor: '#ffffff',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: { display: true, text: i18n.t('stats.chart.cost_axis') || 'Coût Matière (€)', font: { weight: '800', size: 12 } },
          grid: { color: 'rgba(0,0,0,0.05)' }
        },
        y: {
          title: { display: true, text: i18n.t('stats.chart.margin_axis') || 'Marge (%)', font: { weight: '800', size: 12 } },
          min: 0, max: 100,
          grid: { color: 'rgba(0,0,0,0.05)' }
        }
      },
      plugins: {
        tooltip: {
          padding: 15,
          backgroundColor: 'rgba(30, 41, 59, 0.9)',
          titleFont: { size: 14, weight: 'bold' },
          callbacks: {
            label: (ctx) => {
              const r = data[ctx.dataIndex];
              return [
                ` ${r.name}`,
                ` • ${i18n.t('stats.chart.tooltip_cost') || 'Coût'}: ${ctx.parsed.x.toFixed(2)}€`,
                ` • ${i18n.t('stats.chart.tooltip_margin') || 'Marge'}: ${ctx.parsed.y.toFixed(1)}%`
              ];
            }
          }
        }
      }
    }
  });
}

function renderV2Alerts(results) {
  const container = document.getElementById('statsVigilanceList');
  if (!container) return;

  const threshold = (APP.config?.criticalMargin || 65);
  const problematic = results.filter(r => r.data.marginPct < threshold).sort((a, b) => a.data.marginPct - b.data.marginPct);

  if (problematic.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding:1.5rem; background:rgba(34,197,94,0.05); border-radius:15px; border:1px dashed rgba(34,197,94,0.2);">
        <div style="font-size:1.5rem; margin-bottom:0.5rem;">🎉</div>
        <div style="color:#166534; font-weight:700; font-size:0.85rem;">Tout est sous contrôle</div>
        <div style="color:#166534; font-size:0.75rem; opacity:0.8;">Toutes vos marges sont au-dessus de ${threshold}%.</div>
      </div>`;
    return;
  }

  container.innerHTML = problematic.map(r => {
    const isCritical = r.data.marginPct < (threshold - 10);
    const suggestion = isCritical
      ? `Augmentez le prix de ~${(r.data.sellingPrice * 0.15).toFixed(2)}€`
      : `Optimisez les coûts matières`;
    
    return `
      <div class="vigilance-item">
        <div class="vigilance-icon ${isCritical ? 'critical' : 'warn'}">
          ${isCritical ? '🚨' : '⚠️'}
        </div>
        <div class="vigilance-content">
          <span class="vigilance-title">${escapeHtml(r.name)} : ${r.data.marginPct.toFixed(1)}%</span>
          <span class="vigilance-desc">${suggestion}</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderV2Table(results) {
  const body = $('#v2DetailedTableBody');
  if (!body) return;

  const searchInput = $('#statsSearch');
  if (searchInput) {
    searchInput.placeholder = i18n.t('stats.table.search_ph');
  }

  const searchTerm = (searchInput?.value || '').toLowerCase();
  const filtered = results.filter(r => r.name.toLowerCase().includes(searchTerm));

  body.innerHTML = filtered.map(r => {
    const m = r.data.marginPct;
    const color = m > 70 ? '#22C55E' : (m > 50 ? '#6366F1' : (m > 30 ? '#F59E0B' : '#EF4444'));
    return `
      <tr>
        <td style="font-weight:700;">${escapeHtml(r.name)}</td>
        <td>${r.data.totalMaterial.toFixed(2)} €</td>
        <td>${r.data.costPerPortion.toFixed(2)} €</td>
        <td style="font-weight:800; color:var(--primary);">${r.data.sellingPrice.toFixed(2)} €</td>
        <td>
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <span style="font-weight:700; min-width:35px;">${m.toFixed(0)}%</span>
            <div class="progress-bar-container">
              <div class="progress-bar-fill" style="width:${m}%; background:${color};"></div>
            </div>
          </div>
        </td>
        <td style="text-align:right;">
          <button class="btn btn-sm btn-outline" onclick="loadRecipe('${r.id}'); showRecettes();">🔍</button>
        </td>
      </tr>
    `;
  }).join('');
}

function setupStatsListeners(results) {
  const btnTop = $('#toggleTopProfitable');
  const btnWorst = $('#toggleWorstProfitable');
  const searchInput = $('#statsSearch');

  if (btnTop && btnWorst) {
    btnTop.onclick = () => {
      perfMode = 'top';
      btnTop.classList.add('active');
      btnWorst.classList.remove('active');
      renderV2PerformanceBars(results);
    };
    btnWorst.onclick = () => {
      perfMode = 'worst';
      btnWorst.classList.add('active');
      btnTop.classList.remove('active');
      renderV2PerformanceBars(results);
    };
  }

  if (searchInput) {
    searchInput.oninput = () => renderV2Table(results);
  }
}

// =====================================================================