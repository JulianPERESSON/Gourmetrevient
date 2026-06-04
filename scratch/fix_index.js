const fs = require('fs');

const path = 'index.html';
const lines = fs.readFileSync(path, 'utf8').split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];

  // 1. Mobile Bottom Nav Bar button icons
  if (line.includes('id="mNavHub"')) {
    // Find the icon span in the next line
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

  // 2. Mobile Drawer link actions and icons
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

  // 3. Modal onclick backdrop close triggers
  if (line.includes('id="chefsBrainModal" class="modal-overlay"')) {
    lines[i] = lines[i].replace('class="modal-overlay" style="display:none;"', 'class="modal-overlay" style="display:none;" onclick="if(event.target===this)closeChefsBrain()"');
  }
  if (line.includes('id="assemblyModal" class="modal-overlay"')) {
    lines[i] = lines[i].replace('class="modal-overlay" style="display:none;"', 'class="modal-overlay" style="display:none;" onclick="if(event.target===this)closeAssemblySimulator()"');
  }
  if (line.includes('id="masterConverterModal" class="modal-overlay"')) {
    lines[i] = lines[i].replace('class="modal-overlay" style="display:none;"', 'class="modal-overlay" style="display:none;" onclick="if(event.target===this)closeMasterConverter()"');
  }

  // 4. Misspelled saveLayerAnnoÉtation
  if (line.includes('saveLayerAnnoÉtation()')) {
    lines[i] = lines[i].replace('saveLayerAnnoÉtation()', 'saveLayerAnnotation()');
  }

  // 5. Clean up corrupted templates in assemblyModal
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
console.log("index.html fully clean-patched with line-by-line method!");
