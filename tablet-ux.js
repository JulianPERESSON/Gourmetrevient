(function initTabletExperience() {
  'use strict';

  const TABLET_MAX = 1180;
  const PHONE_MAX = 700;
  const body = document.body;
  const tabletQuery = window.matchMedia(`(max-width: ${TABLET_MAX}px)`);
  const phoneQuery = window.matchMedia(`(max-width: ${PHONE_MAX}px)`);
  let previousFocus = null;
  let enhancementFrame = 0;

  const q = (selector, root = document) => root.querySelector(selector);
  const qa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  function callAction(action) {
    const fn = action.call && window[action.call];
    if (typeof fn === 'function') {
      fn.apply(window, action.args || []);
      return;
    }

    const fallback = action.fallback && document.getElementById(action.fallback);
    if (fallback) {
      fallback.click();
      return;
    }

    if (action.href) window.location.href = action.href;
  }

  const menus = {
    atelier: {
      title: 'Atelier & production',
      items: [
        { icon: '📖', label: 'Recettes & coûts', call: 'showRecettes', fallback: 'navRecettes' },
        { icon: '🗓️', label: 'Plan de production', call: 'showMgmt', args: ['production'], fallback: 'navPlanningProd' },
        { icon: '📦', label: 'Stocks & inventaire', call: 'showInventaire', fallback: 'navInventaire' },
        { icon: '🛒', label: 'Liste d’achats', call: 'showMgmt', args: ['shopping'], fallback: 'navShopping' },
        { icon: '🎓', label: 'Ordonnancement CAP', call: 'showScheduler', fallback: 'navScheduler' },
        { icon: '📋', label: 'Sous-recettes', fallback: 'navRecettes' }
      ]
    },
    pilotage: {
      title: 'Pilotage & activité',
      items: [
        { icon: '📊', label: 'Tableau de bord', call: 'showStats', fallback: 'navStats' },
        { icon: '👥', label: 'Commandes & CRM', call: 'showCRM', fallback: 'navCRM' },
        { icon: '💶', label: 'Factures & abonnement', call: 'showMgmt', args: ['billing'], fallback: 'navBilling' },
        { icon: '📈', label: 'Inflation & marges', call: 'showMgmt', args: ['inflation'], fallback: 'navInflation' },
        { icon: '🗂️', label: 'E-catalogue client', call: 'generateECatalogue', fallback: 'navCatalogue' },
        { icon: '🧰', label: 'Outils de gestion', call: 'showProTools', fallback: 'navProTools' }
      ]
    },
    labo: {
      title: 'Laboratoire & qualité',
      items: [
        { icon: '🧼', label: 'Hygiène & HACCP', call: 'showHygiene', fallback: 'navHygiene' },
        { icon: '📅', label: 'Équipe & planning', call: 'showPlanning', fallback: 'navPlanning' },
        { icon: '🤝', label: 'Fournisseurs', call: 'showSuppliers', fallback: 'navSuppliers' },
        { icon: '🧪', label: 'Agencement du labo', call: 'showLabo', fallback: 'navLabo' },
        { icon: '♻️', label: 'Pertes & qualité', call: 'showMgmt', args: ['quality'], fallback: 'navWaste' },
        { icon: '🔎', label: 'Traçabilité', call: 'showHygiene', args: ['trace'], fallback: 'navTrace' }
      ]
    },
    more: {
      title: 'Outils complémentaires',
      items: [
        { icon: '🧠', label: 'Cerveau du Chef', call: 'openChefsBrain', fallback: 'navChefsBrain' },
        { icon: '🍰', label: 'Simulateur montage', call: 'openAssemblySimulator', fallback: 'navAssembly' },
        { icon: '🎛️', label: 'Convertisseur moules', call: 'openMasterConverter', fallback: 'navConverter' },
        { icon: '📍', label: 'Portfolio', call: 'showPortfolio', fallback: 'navPortfolio' },
        { icon: '📖', label: 'À propos', call: 'showAPropos', fallback: 'navAbout' },
        { icon: '📰', label: 'Blog', href: 'blog.html' }
      ]
    }
  };

  function setActiveNav(id) {
    qa('.mobile-nav-item').forEach((item) => {
      const active = item.id === id;
      item.classList.toggle('active', active);
      item.setAttribute('aria-current', active ? 'page' : 'false');
    });
  }

  function closeTabletMenu(options = {}) {
    const drawer = q('#mobileMoreMenu');
    if (!drawer) return;
    drawer.classList.remove('show');
    drawer.setAttribute('aria-hidden', 'true');
    body.classList.remove('tablet-drawer-open');
    window.setTimeout(() => {
      if (!drawer.classList.contains('show')) drawer.style.display = 'none';
    }, 220);
    if (options.restoreFocus !== false && previousFocus && typeof previousFocus.focus === 'function') {
      previousFocus.focus();
    }
  }

  function openTabletMenu(menuKey, sourceButton) {
    const drawer = q('#mobileMoreMenu');
    const grid = q('#moreMenuGrid');
    const title = q('#moreMenuTitle');
    const menu = menus[menuKey];
    if (!drawer || !grid || !title || !menu) return;

    previousFocus = sourceButton || document.activeElement;
    title.textContent = menu.title;
    grid.replaceChildren();

    menu.items.forEach((action) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'menu-item';
      button.innerHTML = `<span class="icon" aria-hidden="true">${action.icon}</span><span>${action.label}</span>`;
      button.setAttribute('aria-label', action.label);
      button.addEventListener('click', () => {
        closeTabletMenu({ restoreFocus: false });
        callAction(action);
      });
      grid.appendChild(button);
    });

    drawer.style.display = 'flex';
    drawer.classList.add('show');
    drawer.setAttribute('role', 'dialog');
    drawer.setAttribute('aria-modal', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    drawer.setAttribute('aria-labelledby', 'moreMenuTitle');
    body.classList.add('tablet-drawer-open');
    q('#closeMoreMenu')?.focus();
  }

  function bindTabletNavigation() {
    const nav = q('#mobileNavBar');
    if (!nav || nav.dataset.tabletBound === 'true') return;
    nav.dataset.tabletBound = 'true';
    nav.setAttribute('aria-label', 'Navigation principale sur tablette et mobile');

    const bindings = {
      mNavAtelier: 'atelier',
      mNavPilotage: 'pilotage',
      mNavCatalogue: 'labo',
      mNavMore: 'more'
    };

    Object.entries(bindings).forEach(([id, menuKey]) => {
      const button = document.getElementById(id);
      if (!button) return;
      button.setAttribute('aria-haspopup', 'dialog');
      button.setAttribute('aria-controls', 'mobileMoreMenu');
      button.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopImmediatePropagation();
        setActiveNav(id);
        openTabletMenu(menuKey, button);
      }, true);
    });

    const home = q('#mNavHub');
    home?.addEventListener('click', () => {
      setActiveNav('mNavHub');
      closeTabletMenu({ restoreFocus: false });
    });

    const close = q('#closeMoreMenu');
    if (close) {
      close.setAttribute('aria-label', 'Fermer le menu');
      close.addEventListener('click', () => closeTabletMenu(), true);
    }

    const drawer = q('#mobileMoreMenu');
    drawer?.addEventListener('click', (event) => {
      if (event.target === drawer) closeTabletMenu();
    });
    drawer?.addEventListener('keydown', (event) => {
      if (event.key !== 'Tab' || !drawer.classList.contains('show')) return;
      const focusable = qa('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])', drawer)
        .filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function updateViewportMode() {
    const mode = phoneQuery.matches ? 'phone' : tabletQuery.matches ? 'tablet' : 'desktop';
    body.dataset.viewport = mode;
    const authApiReady = Boolean(window.AuthUI && typeof window.AuthUI.getCurrentUser === 'function');
    const authenticated = authApiReady ? Boolean(window.AuthUI.getCurrentUser()) : true;
    const appReady = !body.classList.contains('auth-pending') && authenticated;
    body.dataset.tabletNavReady = String(tabletQuery.matches && appReady);
    if (!tabletQuery.matches) closeTabletMenu({ restoreFocus: false });
  }

  function updateVisualViewport() {
    const viewport = window.visualViewport;
    const height = viewport ? viewport.height : window.innerHeight;
    document.documentElement.style.setProperty('--gr-visual-viewport-height', `${Math.round(height)}px`);
    const keyboardOpen = tabletQuery.matches && height < window.innerHeight * 0.72;
    body.classList.toggle('tablet-keyboard-open', keyboardOpen);
  }

  function findTableLabel(table) {
    const region = table.closest('section, .modal-content, .modal-card, .modal-box, .card, .glass-panel');
    const heading = region && region.querySelector('h1, h2, h3, h4');
    return heading?.textContent?.trim() || table.getAttribute('aria-label') || 'Tableau de données';
  }

  function enhanceTable(table) {
    if (!(table instanceof HTMLTableElement) || table.dataset.tabletEnhanced === 'true') return;
    table.dataset.tabletEnhanced = 'true';
    const firstRow = table.rows && table.rows[0];
    const columns = firstRow ? firstRow.cells.length : 0;
    if (columns < 4 && !table.matches('.premium-table, .bon-table')) return;

    table.classList.add('tablet-wide-table');
    const parent = table.parentElement;
    if (parent?.classList.contains('table-responsive')) {
      parent.classList.add('tablet-table-scroll');
      parent.tabIndex = parent.tabIndex >= 0 ? parent.tabIndex : 0;
      parent.setAttribute('role', 'region');
      parent.setAttribute('aria-label', findTableLabel(table));
      parent.style.setProperty('--gr-table-columns', String(columns || 5));
      return;
    }

    const wrapper = document.createElement('div');
    wrapper.className = 'tablet-table-scroll';
    wrapper.tabIndex = 0;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', findTableLabel(table));
    wrapper.style.setProperty('--gr-table-columns', String(columns || 5));
    parent?.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  }

  function enhanceModal(modal) {
    if (!(modal instanceof HTMLElement) || modal.dataset.tabletModal === 'true') return;
    modal.dataset.tabletModal = 'true';
    modal.setAttribute('role', modal.getAttribute('role') || 'dialog');
    modal.setAttribute('aria-modal', 'true');
    const heading = q('h1, h2, h3, h4', modal);
    if (heading && !modal.hasAttribute('aria-label') && !modal.hasAttribute('aria-labelledby')) {
      if (!heading.id) heading.id = `modal-title-${Math.random().toString(36).slice(2, 8)}`;
      modal.setAttribute('aria-labelledby', heading.id);
    }
    qa('.btn-icon, .modal-close, .close', modal).forEach((button) => {
      const text = button.textContent.trim();
      if (!button.getAttribute('aria-label') && (text === '×' || text === '✖' || text === '✕' || text.length <= 2)) {
        button.setAttribute('aria-label', 'Fermer');
      }
    });
  }

  function enhanceScrollStrip(element) {
    if (!(element instanceof HTMLElement)) return;
    element.classList.add('tablet-scroll-strip');
    if (!element.hasAttribute('tabindex')) element.tabIndex = 0;
  }

  function enhanceRoot(root) {
    const scope = root instanceof Element ? root : document;
    if (scope.matches?.('table')) enhanceTable(scope);
    qa('table', scope).forEach(enhanceTable);

    if (scope.matches?.('.modal-overlay, dialog')) enhanceModal(scope);
    qa('.modal-overlay, dialog', scope).forEach(enhanceModal);

    qa('.haccp-tabs, .mgmt-tabs-premium, .hub-card-tabs, .category-filters, #tabsBar', scope)
      .forEach(enhanceScrollStrip);
  }

  function scheduleEnhancement(root) {
    window.cancelAnimationFrame(enhancementFrame);
    enhancementFrame = window.requestAnimationFrame(() => enhanceRoot(root || document));
  }

  function bindGlobalKeys() {
    document.addEventListener('keydown', (event) => {
      if (event.key !== 'Escape') return;
      const drawer = q('#mobileMoreMenu.show');
      if (drawer) {
        event.preventDefault();
        closeTabletMenu();
        return;
      }

      const visibleModal = qa('.modal-overlay, dialog').find((modal) => {
        const style = window.getComputedStyle(modal);
        return style.display !== 'none' && style.visibility !== 'hidden' && modal.getAttribute('open') !== 'false';
      });
      const close = visibleModal && q('.modal-close, .btn-icon, .close, [data-close]', visibleModal);
      if (close) close.click();
    });
  }

  function renameTabletNavigation() {
    const labels = {
      mNavPilotage: 'Pilotage',
      mNavCatalogue: 'Labo',
      mNavMore: 'Plus'
    };
    Object.entries(labels).forEach(([id, text]) => {
      const label = q(`#${id} .label`);
      if (label) {
        label.textContent = text;
        label.removeAttribute('data-i18n');
      }
    });
  }

  function boot() {
    bindTabletNavigation();
    renameTabletNavigation();
    bindGlobalKeys();
    updateViewportMode();
    updateVisualViewport();
    enhanceRoot(document);

    tabletQuery.addEventListener?.('change', updateViewportMode);
    phoneQuery.addEventListener?.('change', updateViewportMode);
    window.addEventListener('focus', updateViewportMode);
    window.addEventListener('pageshow', updateViewportMode);
    window.addEventListener('resize', updateVisualViewport, { passive: true });
    window.visualViewport?.addEventListener('resize', updateVisualViewport, { passive: true });
    window.setTimeout(updateViewportMode, 500);
    window.setTimeout(updateViewportMode, 2000);

    new MutationObserver((mutations) => {
      let bodyClassChanged = false;
      let contentAdded = false;
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.target === body) bodyClassChanged = true;
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) contentAdded = true;
        });
      });
      if (bodyClassChanged) updateViewportMode();
      if (contentAdded) scheduleEnhancement(document);
    }).observe(body, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'] });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot, { once: true });
  else boot();
})();
