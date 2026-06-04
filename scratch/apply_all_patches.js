const fs = require('fs');

// ============================================================================
// 1. INDEX.HTML PATCHES
// ============================================================================
(function patchIndex() {
  const path = 'index.html';
  const lines = fs.readFileSync(path, 'utf8').split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Mobile Bottom Nav Bar button icons
    if (line.includes('id="mNavHub"')) {
      if (lines[i+1].includes('class="icon"')) {
        lines[i+1] = '      <span class="icon">🏠</span>';
      }
    }
    if (line.includes('id="mNavAtelier"')) {
      if (lines[i+1].includes('class="icon"')) {
        lines[i+1] = '      <span class="icon">👨‍🍳</span>';
      }
    }
    if (line.includes('id="mNavPilotage"')) {
      if (lines[i+1].includes('class="icon"')) {
        lines[i+1] = '      <span class="icon">📊</span>';
      }
    }
    if (line.includes('id="mNavCatalogue"')) {
      if (lines[i+1].includes('class="icon"')) {
        lines[i+1] = '      <span class="icon">📍</span>';
      }
    }
    if (line.includes('id="mNavMore"')) {
      if (lines[i+1].includes('class="icon"')) {
        lines[i+1] = '      <span class="icon">⚙️</span>';
      }
    }

    // Mobile Drawer link actions and icons
    if (line.includes("id: 'mLinkAssembly'") || line.includes('id: "mLinkAssembly"')) {
      lines[i] = "          { id: 'mLinkAssembly', icon: '🍰', label: 'nav.creative.assembly', action: () => { if (typeof window.openAssemblySimulator === 'function') window.openAssemblySimulator(); } },";
    }
    if (line.includes("id: 'mLinkConverter'") || line.includes('id: "mLinkConverter"')) {
      lines[i] = "          { id: 'mLinkConverter', icon: '🎚️', label: 'nav.creative.converter', action: () => { if (typeof window.openMasterConverter === 'function') window.openMasterConverter(); } },";
    }
    if (line.includes("id: 'mLinkPortfolio'") || line.includes('id: "mLinkPortfolio"')) {
      lines[i] = "          { id: 'mLinkPortfolio', icon: '📍', label: 'nav.portfolio', action: showPortfolio },";
    }
    if (line.includes("id: 'mLinkCatalogue'") || line.includes('id: "mLinkCatalogue"')) {
      lines[i] = "          { id: 'mLinkCatalogue', icon: '💼', label: 'nav.catalogue', action: () => { if (typeof window.generateECatalogue === 'function') window.generateECatalogue(); } },";
    }
    if (line.includes("id: 'mLinkCRM'") || line.includes('id: "mLinkCRM"')) {
      lines[i] = "          { id: 'mLinkCRM', icon: '👥', label: 'nav.crm', action: showCRM }";
    }
    if (line.includes("id: 'mLinkPlanning'") || line.includes('id: "mLinkPlanning"')) {
      lines[i] = "          { id: 'mLinkPlanning', icon: '📅', label: 'nav.team', action: showPlanning },";
    }
    if (line.includes("id: 'mLinkSuppliers'") || line.includes('id: "mLinkSuppliers"')) {
      lines[i] = "          { id: 'mLinkSuppliers', icon: '🤝', label: 'nav.suppliers', action: showSuppliers },";
    }
    if (line.includes("id: 'mLinkLabo'") || line.includes('id: "mLinkLabo"')) {
      lines[i] = "          { id: 'mLinkLabo', icon: '🧪', label: 'nav.lab', action: showLabo },";
    }

    // Modal onclick backdrop close triggers
    if (line.includes('id="chefsBrainModal" class="modal-overlay"')) {
      lines[i] = lines[i].replace('class="modal-overlay" style="display:none;"', 'class="modal-overlay" style="display:none;" onclick="if(event.target===this)closeChefsBrain()"');
    }
    if (line.includes('id="assemblyModal" class="modal-overlay"')) {
      lines[i] = lines[i].replace('class="modal-overlay" style="display:none;"', 'class="modal-overlay" style="display:none;" onclick="if(event.target===this)closeAssemblySimulator()"');
    }
    if (line.includes('id="masterConverterModal" class="modal-overlay"')) {
      lines[i] = lines[i].replace('class="modal-overlay" style="display:none;"', 'class="modal-overlay" style="display:none;" onclick="if(event.target===this)closeMasterConverter()"');
    }

    // Misspelled saveLayerAnnoÉtation
    if (line.includes('saveLayerAnnoÉtation()')) {
      lines[i] = lines[i].replace('saveLayerAnnoÉtation()', 'saveLayerAnnotation()');
    }

    // Clean up corrupted templates in assemblyModal
    if (line.includes('value="foret_noire"')) {
      lines[i] = '            <option value="foret_noire">🌲 Forêt-Noire</option>';
    }
    if (line.includes('value="tarte_citron"')) {
      lines[i] = '            <option value="tarte_citron">🍋 Tarte Citron Meringuée</option>';
    }
    if (line.includes('value="royal"')) {
      lines[i] = '            <option value="royal">🍫 Royal Chocolat</option>';
    }
    if (line.includes('value="Étatin"')) {
      lines[i] = '            <option value="Étatin">🍎 Entremet Pomme Tatin</option>';
    }
    if (line.includes('value="bourdaloue"')) {
      lines[i] = '            <option value="bourdaloue">🍐 Tarte Bourdaloue</option>';
    }
    if (line.includes('value="negresco"')) {
      lines[i] = '            <option value="negresco">👑 Negresco Signature</option>';
    }
    if (line.includes('value="buche"')) {
      lines[i] = '                <option value="buche">🪵 Bûche</option>';
    }
    if (line.includes('value="tarte"')) {
      lines[i] = '                <option value="tarte">🥧 Tarte</option>';
    }
    if (line.includes('value="verrine"')) {
      lines[i] = '                <option value="verrine">🥃 Verrine</option>';
    }
  }

  fs.writeFileSync(path, lines.join('\n'), 'utf8');
  console.log("index.html fully clean-patched!");
})();

// ============================================================================
// 2. APP.JS PATCHES
// ============================================================================
(function patchApp() {
  const path = 'app.js';
  let content = fs.readFileSync(path, 'utf8');

  // Normalize line endings to LF
  content = content.replace(/\r\n/g, '\n');

  // Replace checkAuth visibility forcing logic
  content = content.replace(
    `    // On s'assure que le menu et la zone utilisateur sont visibles dès qu'on est logué
    ['mainNav', 'mobileNavBar', 'userProfileArea', 'headerBrand', 'appMain'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        const displayType = (id === 'appMain') ? 'block' : 'flex';
        el.style.setProperty('display', displayType, 'important');
      }
    });`,
    `    // On s'assure que le menu et la zone utilisateur sont visibles dès qu'on est logué
    const isMobile = window.innerWidth <= 768;
    ['mainNav', 'mobileNavBar', 'userProfileArea', 'headerBrand', 'appMain'].forEach(id => {
      const el = document.getElementById(id);
      if (el) {
        if (id === 'mobileNavBar') {
          el.style.setProperty('display', isMobile ? 'flex' : 'none', 'important');
        } else if (id === 'mainNav') {
          el.style.setProperty('display', isMobile ? 'none' : 'flex', 'important');
        } else {
          const displayType = (id === 'appMain') ? 'block' : 'flex';
          el.style.setProperty('display', displayType, 'important');
        }
      }
    });`
  );

  // Replace resize listener to use setProperty with important
  content = content.replace(
    `  // Handle responsive navigation on resize
  window.addEventListener('resize', () => {
    if (localStorage.getItem('gourmet_auth') === 'true') {
      const mainNav = $('#mainNav');
      const mobNav = $('#mobileNavBar');
      if (window.innerWidth <= 768) {
        if (mainNav) mainNav.style.display = 'none';
        if (mobNav) mobNav.style.display = 'flex';
      } else {
        if (mainNav) mainNav.style.display = 'flex';
        if (mobNav) mobNav.style.display = 'none';
      }
    }
  });`,
    `  // Handle responsive navigation on resize
  window.addEventListener('resize', () => {
    if (localStorage.getItem('gourmet_auth') === 'true') {
      const mainNav = $('#mainNav');
      const mobNav = $('#mobileNavBar');
      if (window.innerWidth <= 768) {
        if (mainNav) mainNav.style.setProperty('display', 'none', 'important');
        if (mobNav) mobNav.style.setProperty('display', 'flex', 'important');
      } else {
        if (mainNav) mainNav.style.setProperty('display', 'flex', 'important');
        if (mobNav) mobNav.style.setProperty('display', 'none', 'important');
      }
    }
  });`
  );

  fs.writeFileSync(path, content, 'utf8');
  console.log("app.js successfully and safely updated!");
})();

// ============================================================================
// 3. CREATIVE-TOOLS.JS PATCHES
// ============================================================================
(function patchCreativeTools() {
  const path = 'creative-tools.js';
  let content = fs.readFileSync(path, 'utf8');

  // Normalize line endings to LF
  content = content.replace(/\r\n/g, '\n');

  // Patch openChefsBrain
  content = content.replace(
    `function openChefsBrain() {
  const modal = document.getElementById('chefsBrainModal');
  if (modal) modal.style.display = 'flex';`,
    `function openChefsBrain() {
  if (typeof window.openModal === 'function') {
    window.openModal('chefsBrainModal');
  } else {
    const modal = document.getElementById('chefsBrainModal');
    if (modal) modal.style.display = 'flex';
  }`
  );

  // Patch closeChefsBrain
  content = content.replace(
    `function closeChefsBrain() {
  const modal = document.getElementById('chefsBrainModal');
  if (modal) modal.style.display = 'none';`,
    `function closeChefsBrain() {
  if (typeof window.closeModal === 'function') {
    window.closeModal('chefsBrainModal');
  } else {
    const modal = document.getElementById('chefsBrainModal');
    if (modal) modal.style.display = 'none';
  }`
  );

  // Patch openAssemblySimulator
  content = content.replace(
    `function openAssemblySimulator() {
  const modal = document.getElementById('assemblyModal');
  if (modal) modal.style.display = 'flex';`,
    `function openAssemblySimulator() {
  if (typeof window.openModal === 'function') {
    window.openModal('assemblyModal');
  } else {
    const modal = document.getElementById('assemblyModal');
    if (modal) modal.style.display = 'flex';
  }`
  );

  // Patch closeAssemblySimulator
  content = content.replace(
    `function closeAssemblySimulator() {
  const modal = document.getElementById('assemblyModal');
  if (modal) modal.style.display = 'none';`,
    `function closeAssemblySimulator() {
  if (typeof window.closeModal === 'function') {
    window.closeModal('assemblyModal');
  } else {
    const modal = document.getElementById('assemblyModal');
    if (modal) modal.style.display = 'none';
  }`
  );

  // Patch selectLayerForAnnotation ReferenceError
  content = content.replace(
    `  var heightEl = document.getElementById('asmAnnotHeight');
  if (tempEl) tempEl.value = (layer.annotation && layer.annotation.temp) || '';
  if (restEl) restEl.value = (layer.annotation && layer.annotation.rest) || '';
  if (noteEl) noteEl.value = (layer.annotation && layer.annotation.note) || '';`,
    `  var heightEl = document.getElementById('asmAnnotHeight');
  var tempEl = document.getElementById('asmAnnotTemp');
  var restEl = document.getElementById('asmAnnotRest');
  var noteEl = document.getElementById('asmAnnotNote');
  if (tempEl) tempEl.value = (layer.annotation && layer.annotation.temp) || '';
  if (restEl) restEl.value = (layer.annotation && layer.annotation.rest) || '';
  if (noteEl) noteEl.value = (layer.annotation && layer.annotation.note) || '';`
  );

  fs.writeFileSync(path, content, 'utf8');
  console.log("creative-tools.js successfully patched!");
})();

// ============================================================================
// 4. MASTER-CONVERTER.JS PATCHES
// ============================================================================
(function patchMasterConverter() {
  const path = 'master-converter.js';
  let content = fs.readFileSync(path, 'utf8');

  // Normalize line endings to LF
  content = content.replace(/\r\n/g, '\n');

  // Patch openMasterConverter
  content = content.replace(
    `function openMasterConverter() {
  const modal = document.getElementById('masterConverterModal');
  if (modal) modal.style.display = 'flex';
  initMCShapeSelectors();
  populateMCRecipeSelect();
  mcCalculate();
}`,
    `function openMasterConverter() {
  if (typeof window.openModal === 'function') {
    window.openModal('masterConverterModal');
  } else {
    const modal = document.getElementById('masterConverterModal');
    if (modal) modal.style.display = 'flex';
  }
  initMCShapeSelectors();
  populateMCRecipeSelect();
  mcCalculate();
}`
  );

  // Patch closeMasterConverter
  content = content.replace(
    `function closeMasterConverter() {
  const modal = document.getElementById('masterConverterModal');
  if (modal) modal.style.display = 'none';
}`,
    `function closeMasterConverter() {
  if (typeof window.closeModal === 'function') {
    window.closeModal('masterConverterModal');
  } else {
    const modal = document.getElementById('masterConverterModal');
    if (modal) modal.style.display = 'none';
  }
}`
  );

  fs.writeFileSync(path, content, 'utf8');
  console.log("master-converter.js successfully patched!");
})();
