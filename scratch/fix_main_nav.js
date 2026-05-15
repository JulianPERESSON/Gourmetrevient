const fs = require('fs');

function fixMainNav() {
    try {
        const content = fs.readFileSync('index.html', 'utf8');
        const startMarker = '<div class="header-nav" id="mainNav"';
        const endMarker = '<!-- SYNC STATUS INDICATOR -->'; // Wait, I removed this comment, let's use the next marker

        const startIdx = content.indexOf(startMarker);
        if (startIdx === -1) {
            console.log("Start marker not found");
            return;
        }

        const nextMarker = '<div class="header-actions" id="userProfileArea"';
        const endIdx = content.indexOf(nextMarker);
        if (endIdx === -1) {
            console.log("End marker not found");
            return;
        }

        const newNav = `    <div class="header-nav" id="mainNav" style="display:none; align-items:center; flex: 1; justify-content: center; gap: 0.8rem;">
      <!-- Cockpit -->
      <button class="nav-link" id="navHub" onclick="showHub()">🏠 <span data-i18n="nav.home">Cockpit</span></button>

      <!-- 1. Pilotage & Business -->
      <div class="nav-dropdown">
        <button class="nav-dropdown-trigger">📊 <span data-i18n="nav.category.analysis">Pilotage & Business</span> <span class="nav-arrow">▼</span></button>
        <div class="nav-dropdown-content">
          <button class="nav-link nav-dropdown-link" id="navStats"><span data-i18n="nav.stats">Tableau de Bord & Stats</span></button>
          <button class="nav-link nav-dropdown-link" id="navCRM"><span data-i18n="nav.crm">Commandes & CRM</span></button>
          <button class="nav-link nav-dropdown-link" id="navBilling"><span data-i18n="nav.billing">Factures & Abonnement</span></button>
          <button class="nav-link nav-dropdown-link" id="navCatalogue"><span data-i18n="nav.catalogue">E-Catalogue Client</span></button>
          <button class="nav-link nav-dropdown-link" id="navProTools"><span data-i18n="mgmt.tab.protools">Outils de Gestion</span></button>
        </div>
      </div>

      <!-- 2. Atelier & Production -->
      <div class="nav-dropdown">
        <button class="nav-dropdown-trigger">👨‍🍳 <span data-i18n="nav.category.atelier">Atelier & Prod</span> <span class="nav-arrow">▼</span></button>
        <div class="nav-dropdown-content">
          <button class="nav-link nav-dropdown-link" id="navRecettes"><span data-i18n="nav.recipes">Calculateur de Recettes</span></button>
          <button class="nav-link nav-dropdown-link" id="navInventaire"><span data-i18n="nav.inventory">Stocks & Inventaire</span></button>
          <button class="nav-link nav-dropdown-link" id="navChefsBrain"><span data-i18n="nav.creative.brain">Cerveau du Chef</span></button>
          <button class="nav-link nav-dropdown-link" id="navAssembly"><span data-i18n="nav.creative.assembly">Simulateur Montage</span></button>
          <button class="nav-link nav-dropdown-link" id="navConverter"><span data-i18n="nav.creative.converter">Convertisseur Moules</span></button>
        </div>
      </div>

      <!-- 3. Labo & Qualité -->
      <div class="nav-dropdown">
        <button class="nav-dropdown-trigger">🛡️ <span data-i18n="nav.category.mgmt">Labo & Qualité</span> <span class="nav-arrow">▼</span></button>
        <div class="nav-dropdown-content">
          <button class="nav-link nav-dropdown-link" id="navHygiene"><span data-i18n="nav.hygiene">Hygiène & HACCP</span></button>
          <button class="nav-link nav-dropdown-link" id="navPlanning"><span data-i18n="nav.team">Équipe & Planning</span></button>
          <button class="nav-link nav-dropdown-link" id="navLabo"><span data-i18n="nav.creative.lab">Agencement Labo (2D)</span></button>
          <button class="nav-link nav-dropdown-link" id="navSuppliers"><span data-i18n="nav.suppliers">Fournisseurs</span></button>
          <button class="nav-link nav-dropdown-link" id="navScheduler"><span data-i18n="nav.scheduler">Ordonnancement CAP</span></button>
        </div>
      </div>

      <!-- 4. Projet & Info -->
      <div class="nav-dropdown">
        <button class="nav-dropdown-trigger">📍 Projet & Portfolio <span class="nav-arrow">▼</span></button>
        <div class="nav-dropdown-content">
          <button class="nav-link nav-dropdown-link" id="navPortfolio"><span data-i18n="nav.portfolio">Mon Portfolio</span></button>
          <button class="nav-link nav-dropdown-link" id="navAbout"><span data-i18n="nav.about">À propos du projet</span></button>
        </div>
      </div>

      <button class="nav-link" id="navAdmin" style="display:none;"><span data-i18n="nav.admin">Admin</span></button>
    </div>
\n    `;

        const finalContent = content.substring(0, startIdx) + newNav + content.substring(endIdx);
        fs.writeFileSync('index.html', finalContent, 'utf8');
        console.log("Main Nav fixed successfully");
    } catch (err) {
        console.error("Error:", err);
    }
}

fixMainNav();
