// EVENT BINDINGS
// ============================================================================

function bindEvents() {
  const btnCreateRecipe = $('#btnCreateRecipe');
  if (btnCreateRecipe) {
    btnCreateRecipe.addEventListener('click', () => {
      newRecipe();
      populateStep1();
      goToStep(1);
    });
  }

  // Step navigation
  const btnBackToHero = $('#btnBackToHero');
  if (btnBackToHero) btnBackToHero.addEventListener('click', () => goToStep(0));

  const btnToStep2 = $('#btnToStep2');
  if (btnToStep2) {
    btnToStep2.addEventListener('click', () => {
      if (!$('#recipeName').value.trim()) {
        showToast(t('toast.recipe.name_required'), 'error');
        $('#recipeName').focus();
        return;
      }
      goToStep(2);
    });
  }

  const btnToStep1 = $('#btnToStep1');
  if (btnToStep1) btnToStep1.addEventListener('click', () => goToStep(1));

  const btnToStep3 = $('#btnToStep3');
  if (btnToStep3) btnToStep3.addEventListener('click', () => goToStep(3));

  const btnToStep2b = $('#btnToStep2b');
  if (btnToStep2b) btnToStep2b.addEventListener('click', () => goToStep(2));

  const btnToStep4 = $('#btnToStep4');
  if (btnToStep4) btnToStep4.addEventListener('click', () => goToStep(4));

  const btnToStep3b = $('#btnToStep3b');
  if (btnToStep3b) btnToStep3b.addEventListener('click', () => goToStep(3));

  const btnToStep5 = $('#btnToStep5');
  if (btnToStep5) {
    btnToStep5.addEventListener('click', () => {
      goToStep(5);
      if (typeof renderAntiGaspi === 'function') renderAntiGaspi();
    });
  }

  const btnToStep4b = $('#btnToStep4b');
  if (btnToStep4b) btnToStep4b.addEventListener('click', () => goToStep(4));

  const btnNewRecipeInStep = $('#btnNewRecipe');
  if (btnNewRecipeInStep) btnNewRecipeInStep.addEventListener('click', newRecipe);

  // Step indicator click navigation
  $$('.step-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      const step = parseInt(dot.dataset.step);
      if (step <= APP.currentStep || step === APP.currentStep + 1) {
        goToStep(step);
      }
    });
  });

  // Ingredients
  const btnAddIng = $('#btnAddIngredient');
  if (btnAddIng) btnAddIng.addEventListener('click', () => addIngredient());

  const btnAddSousRecette = $('#btnAddSousRecette');
  if (btnAddSousRecette) {
    btnAddSousRecette.addEventListener('click', () => {
      if (window.SousRecettes) SousRecettes.openAddModal();
    });
  }

  const btnVoirStructure = $('#btnVoirStructure');
  if (btnVoirStructure) {
    btnVoirStructure.addEventListener('click', () => {
      if (window.SousRecettes) SousRecettes.openTreeModal();
    });
  }

  const btnAddFromDb = $('#btnAddFromDb');
  if (btnAddFromDb) btnAddFromDb.addEventListener('click', showIngredientDbModal);

  const btnSearchOff = $('#btnSearchOff');
  if (btnSearchOff) btnSearchOff.addEventListener('click', showOffModal);

  const dbModalClose = $('#dbModalClose');
  if (dbModalClose) dbModalClose.addEventListener('click', hideIngredientDbModal);

  const btnComp = $('#btnOpenComparator');
  if (btnComp) {
    btnComp.addEventListener('click', () => {
      if (!APP.baselineCosts) APP.baselineCosts = JSON.parse(JSON.stringify(calcFullCost(APP.margin)));
      $('#comparatorModal').style.display = 'flex';
      updateComparator();
    });
  }

  const btnCompClose = $('#comparatorClose');
  if (btnCompClose) btnCompClose.addEventListener('click', () => $('#comparatorModal').style.display = 'none');

  const btnSnap = $('#btnSnapBaseline');
  if (btnSnap) btnSnap.addEventListener('click', snapBaseline);

  const offModalClose = $('#offModalClose');
  if (offModalClose) offModalClose.addEventListener('click', hideOffModal);
  
  const btnOffSearch = $('#btnOffSearch');
  if (btnOffSearch) btnOffSearch.addEventListener('click', searchOffProduct);

  const offSearchInput = $('#offSearchInput');
  if (offSearchInput) {
    offSearchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') searchOffProduct();
    });
  }

  // Close DB modal on backdrop click
  const dbModal = $('#dbModal');
  if (dbModal) {
    dbModal.addEventListener('click', (e) => {
      if (e.target.id === 'dbModal') hideIngredientDbModal();
    });
  }

  const offModal = $('#offModal');
  if (offModal) {
    offModal.addEventListener('click', (e) => {
      if (e.target.id === 'offModal') hideOffModal();
    });
  }

  // Procedure
  const btnAddStep = $('#btnAddStep');
  if (btnAddStep) btnAddStep.addEventListener('click', addProcedureStep);

  const marginSlider = $('#marginSlider');
  if (marginSlider) {
    marginSlider.addEventListener('input', (e) => {
      APP.margin = parseInt(e.target.value);
      renderCostAnalysis();
    });
  }

  // Advanced cost inputs
  ['advLaborRate', 'advFixedCharges', 'advProductions', 'advEnergy', 'advAmortization', 'advPackagingCost', 'advApprenticeTime', 'advCommisTime', 'advChefTime'].forEach(id => {
    const el = $('#' + id);
    if (el) el.addEventListener('input', () => renderCostAnalysis());
  });
  const tvaSelectorEl = $('#recipeTvaRate');
  if (tvaSelectorEl) tvaSelectorEl.addEventListener('change', () => renderCostAnalysis());

  // Exports
  const btnExportPdf = $('#btnExportPdf');
  if (btnExportPdf && typeof exportPdf === 'function') btnExportPdf.addEventListener('click', exportPdf);
  
  const btnGenQR = $('#btnGenerateQR');
  if (btnGenQR && typeof generateQRLable === 'function') btnGenQR.addEventListener('click', generateQRLable);
  
  const btnExportDevis = $('#btnExportDevis');
  if (btnExportDevis && typeof exportDevisPdf === 'function') btnExportDevis.addEventListener('click', exportDevisPdf);
  
  const btnExportJson = $('#btnExportJson');
  if (btnExportJson && typeof exportJson === 'function') btnExportJson.addEventListener('click', exportJson);
  
  const btnSaveRecipe = $('#btnSaveRecipe');
  if (btnSaveRecipe) btnSaveRecipe.addEventListener('click', saveCurrentRecipe);

  const btnLaunchProd = $('#btnLaunchProd');
  if (btnLaunchProd) btnLaunchProd.addEventListener('click', launchProductionFromRecipe);

  // Saved recipes
  const btnSavedRecipes = $('#btnSavedRecipes');
  if (btnSavedRecipes) btnSavedRecipes.addEventListener('click', toggleSavedRecipes);

  // Logout
  const btnLogout = $('#btnLogout');
  if (btnLogout) {
    btnLogout.addEventListener('click', () => {
      localStorage.removeItem('gourmet_auth');
      localStorage.removeItem('gourmet_current_user');
      location.reload();
    });
  }

  // Profile Dropdown
  const btnProfile = $('#btnProfile');
  if (btnProfile) {
    btnProfile.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleProfileDropdown();
    });
  }

  document.addEventListener('click', (e) => {
    const dropdown = $('#profileDropdown');
    if (dropdown && !e.target.closest('.profile-dropdown')) {
      dropdown.classList.remove('show');
    }
  });

  // PIN Modal
  const btnChangePin = $('#btnChangePin');
  if (btnChangePin) btnChangePin.addEventListener('click', showPinModal);

  const pinModalClose = $('#pinModalClose');
  if (pinModalClose) pinModalClose.addEventListener('click', hidePinModal);

  const btnSaveProfile = $('#btnSaveProfile');
  if (btnSaveProfile) btnSaveProfile.addEventListener('click', saveNewProfile);

  const pinModal = $('#pinModal');
  if (pinModal) {
    pinModal.addEventListener('click', (e) => {
      if (e.target.id === 'pinModal') hidePinModal();
    });
  }

  // Planning & Sharing
  const btnAddMember = $('#btnAddMember');
  if (btnAddMember) btnAddMember.addEventListener('click', addTeamMember);

  const btnAddLeave = $('#btnAddLeave');
  if (btnAddLeave) btnAddLeave.addEventListener('click', showAddLeaveModal);

  const memberName = $('#memberName');
  if (memberName) {
    memberName.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTeamMember(); });
    memberName.addEventListener('input', typeof handleMemberAutocomplete === 'function' ? handleMemberAutocomplete : null);
  }

  const memberRole = $('#memberRole');
  if (memberRole) memberRole.addEventListener('keypress', (e) => { if (e.key === 'Enter') addTeamMember(); });

  const btnInviteMember = $('#btnInviteMember');
  if (btnInviteMember) btnInviteMember.addEventListener('click', showInviteModal);

  const inviteUser = $('#inviteUser');
  if (inviteUser) {
    inviteUser.addEventListener('input', typeof handleInviteAutocomplete === 'function' ? handleInviteAutocomplete : null);
    inviteUser.addEventListener('keypress', (e) => { if (e.key === 'Enter') inviteUserToPlanning(); });
  }

  const teamNameInput = $('#teamNameInput');
  if (teamNameInput) teamNameInput.addEventListener('change', saveTeamMembers);

  const btnSyncToCloud = $('#btnSyncToCloud');
  if (btnSyncToCloud) btnSyncToCloud.addEventListener('click', () => syncToCloud());

  const btnSyncFromCloud = $('#btnSyncFromCloud');
  if (btnSyncFromCloud) btnSyncFromCloud.addEventListener('click', () => syncFromCloud());

  const btnPrintRecipe = $('#btnPrintRecipe');
  if (btnPrintRecipe) btnPrintRecipe.addEventListener('click', () => window.print());

  const btnExportFullPdf = $('#btnExportFullPdf');
  if (btnExportFullPdf && typeof exportFullRecipePdf === 'function') {
    btnExportFullPdf.addEventListener('click', exportFullRecipePdf);
  }

  // Notifications
  const notifArea = $('#notificationArea');
  if (notifArea) {
    notifArea.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = $('#notifDropdown');
      if (dropdown) dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });
  }

  document.addEventListener('click', (e) => {
    if (!e.target.closest('#notificationArea')) {
      const dropdown = $('#notifDropdown');
      if (dropdown) dropdown.style.display = 'none';
    }
    if (!e.target.closest('#inviteUser')) {
      const auto = $('#inviteAutocomplete');
      if (auto) auto.style.display = 'none';
    }
    if (!e.target.closest('#memberName')) {
      const auto = $('#memberAutocomplete');
      if (auto) auto.style.display = 'none';
    }
  });

  // Navigation context reset
  const navPlan = $('#navPlanning');
  if (navPlan) {
    navPlan.addEventListener('click', () => {
      const currentUser = localStorage.getItem(STORAGE_KEYS.currentUser);
      if (APP.viewOwner !== currentUser) {
        APP.viewOwner = currentUser;
        loadTeamMembers();
        if (typeof renderTeam === 'function') renderTeam();
        if (typeof renderLeaves === 'function') renderLeaves();
        if (typeof renderAnnualCalendar === 'function') renderAnnualCalendar();
        if (typeof renderSharedList === 'function') renderSharedList();
      }
    });
  }

  // Handle responsive navigation on resize
  window.addEventListener('resize', () => {
    if (window.AuthUI?.getCurrentUser?.()) {
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
  });

  // Gender selection in profile
  $$('.gender-btn-profile').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.gender-btn-profile').forEach(b => b.classList.remove('active', 'btn-primary'));
      $$('.gender-btn-profile').forEach(b => b.classList.add('btn-outline'));
      btn.classList.add('active', 'btn-primary');
      btn.classList.remove('btn-outline');
    });
  });

  // Admin Moderation
  // Les événements de modération admin sont désormais gérés par des onclick directs dans le HTML

  const adminModal = $('#adminUserModal');
  if (adminModal) {
    adminModal.addEventListener('click', (e) => {
      if (e.target.id === 'adminUserModal') adminModal.style.display = 'none';
    });
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

function init() {
  checkAuth();
  loadIngredientDb();
  loadSavedRecipes();
  loadTeamMembers();
  loadInventory();
  loadNotifications();
  loadSuppliers();
  loadWasteLogs();
  loadProductionPlan();
  bindEvents();
  renderSavedRecipes();
  renderInvitations();

  // Start at hero screen
  goToStep(0);
  renderLibraryRecipes();
  updateRandomTip();
  // L'affichage du Hub est maintenant géré uniquement par checkAuth(wasPending)
  // pour éviter de téléporter l'utilisateur s'il a déjà navigué ailleurs.

  // Optimized Dashboard Update
  const throttledDashboard = throttle(updateDashboard, 500);
  window.updateDashboardThrottled = throttledDashboard;

  // Listen for language changes - optimized to only re-render visible components
  document.addEventListener('languageChanged', (e) => {
    if (APP.currentStep >= 1 && APP.currentStep <= 3) collectCurrentStepData();

    const isVisible = (selector) => {
      const el = document.querySelector(selector);
      return el && el.offsetParent !== null;
    };

    updateRandomTip();
    updateDashboard();

    if (APP.currentStep === 2) renderIngredients();
    if (APP.currentStep === 3) renderProcedure();
    if (APP.currentStep === 4) renderCostAnalysis();
    if (APP.currentStep === 5) renderSummary();

    if (typeof renderLibraryRecipes === 'function') renderLibraryRecipes();
    if (typeof renderSavedRecipes === 'function') renderSavedRecipes();

    if (isVisible('#appPlanning')) {
      renderTeam();
      renderLeaves();
      renderAnnualCalendar();
      if (typeof updateVacationZone === 'function') updateVacationZone();
    }
    if (isVisible('#appLaboratoire') && typeof renderDevis === 'function') renderDevis();
    if (isVisible('#appInventaire')) renderInventory();
    if (isVisible('#appHygiene') && typeof renderHygiene === 'function') renderHygiene();
    if (isVisible('#appSuppliers')) renderSuppliers();
    if (isVisible('#appStats')) renderStats();
    if (isVisible('#appMgmt')) {
      if (typeof renderAllergenMatrix === 'function') renderAllergenMatrix();
      if (typeof renderWasteAnalysis === 'function') renderWasteAnalysis();
    }
  });

  loadHaccpLogs();
  renderHygiene();
}

document.addEventListener('DOMContentLoaded', init);

// Capitalization helper
function capitalizeFirstLetter(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/* ============================================================================ */
/* LABELING & ALLERGEN TRACKING                                                */
/* ============================================================================ */

let selectedLabelRecipe = null;

function showLabelingDropdown() {
  const userRecipes = (APP.savedRecipes || []).map(r => ({ ...r, origin: 'user' }));
  const defaultRecipes = (typeof RECIPES !== 'undefined' ? RECIPES : []).map(r => ({ ...r, origin: 'default' }));
  const recipes = [...userRecipes, ...defaultRecipes];

  const dropdown = $('#labelingRecipeDropdown');
  if (!dropdown) return;

  if (recipes.length === 0) {
    dropdown.innerHTML = `<div class="autocomplete-item disabled">${t('recipe.lib.empty')}</div>`;
  } else {
    dropdown.innerHTML = recipes.map(r => `
      <div class="autocomplete-item" onclick="selectLabelingRecipe('${r.id}', '${r.origin}')">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; width: 100%;">
          <div>
            <strong>${escapeHtml(r.name)}</strong>
            <small style="display: block;">${r.category || ''}</small>
          </div>
          <span class="badge" style="font-size: 0.65rem; padding: 2px 6px; background: ${r.origin === 'user' ? 'var(--primary-light)' : 'var(--bg-alt)'}; color: ${r.origin === 'user' ? 'var(--primary)' : 'var(--text-muted)'};">
            ${r.origin === 'user' ? 'Mien' : 'Site'}
          </span>
        </div>
      </div>
    `).join('');
  }
  dropdown.style.display = 'block';

  // Close dropdown when clicking outside
  const closeHandler = (e) => {
    if (!e.target.closest('#labelingSearchInput') && !e.target.closest('#labelingRecipeDropdown')) {
      dropdown.style.display = 'none';
      document.removeEventListener('click', closeHandler);
    }
  };
  document.addEventListener('click', closeHandler);
}

function filterLabelingRecipes() {
  const val = $('#labelingSearchInput').value.toLowerCase();
  const dropdown = $('#labelingRecipeDropdown');
  const items = dropdown.querySelectorAll('.autocomplete-item');

  items.forEach(item => {
    const text = item.textContent.toLowerCase();
    item.style.display = text.includes(val) ? 'flex' : 'none';
  });
}

function selectLabelingRecipe(id, origin) {
  if (origin === 'user') {
    selectedLabelRecipe = APP.savedRecipes.find(r => r.id === id);
  } else {
    const list = typeof RECIPES !== 'undefined' ? RECIPES : [];
    selectedLabelRecipe = list.find(r => r.id === id);
  }

  if (!selectedLabelRecipe) return;

  $('#labelingSearchInput').value = selectedLabelRecipe.name;
  $('#labelingRecipeDropdown').style.display = 'none';

  // Enable form fields
  $('#labelingFields').style.opacity = '1';
  $('#labelingFields').style.pointerEvents = 'auto';

  // Auto-fill some data
  const costs = calcFullCost(APP.margin, selectedLabelRecipe);
  $('#labelPrice').value = costs.sellingPrice;

  let totalWeight = selectedLabelRecipe.advanced?.weight || 0;
  if (!totalWeight) {
    totalWeight = selectedLabelRecipe.ingredients.reduce((sum, ing) => {
      return sum + (ing.unit === 'g' || ing.unit === 'ml' ? parseFloat(ing.quantity) || 0 : 0);
    }, 0);
    const portions = selectedLabelRecipe.portions || 10;
    totalWeight = Math.round(totalWeight / portions);
  }
  $('#labelWeight').value = totalWeight;

  // Dates
  const today = new Date().toISOString().split('T')[0];
  $('#labelFabDate').value = today;

  // Exp info: default 3 days for fresh pastries
  const expDate = new Date();
  expDate.setDate(expDate.getDate() + 3);
  $('#labelExpDate').value = expDate.toISOString().split('T')[0];

  $('#labelStorage').value = t('labeling.form.storage_ph') || 'À conserver entre 0°C et +4°C';

  updateLabelPreview();
}

function updateLabelPreview() {
  if (!selectedLabelRecipe) return;

  $('#prevRecipeName').textContent = selectedLabelRecipe.name.toUpperCase();
  $('#prevProducer').textContent = t('labeling.producer') || 'ARTISAN PÂTISSIER';

  // Ingredients list (comma separated)
  const ings = selectedLabelRecipe.ingredients.map(ing => {
    const translatedName = t(ing.name);
    return translatedName;
  }).join(', ');
  $('#prevIngredients').textContent = ings + '.';

  // Allergen tracking
  const allergenSet = new Set();
  selectedLabelRecipe.ingredients.forEach(ing => {
    let dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
    if (dbItem && dbItem.allergens && dbItem.allergens.length > 0) {
      dbItem.allergens.forEach(a => allergenSet.add(a));
    } else {
      // Let's try to find it in DEFAULT_INGREDIENT_DB directly just in case local db lacks allergens
      let defItem = DEFAULT_INGREDIENT_DB.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
      if (defItem && defItem.allergens) {
        defItem.allergens.forEach(a => allergenSet.add(a));
      } else {
        // Try reverse lookup if it's a French name
        const key = REVERSE_LOOKUP[ing.name.toLowerCase()] || REVERSE_LOOKUP[ing.name];
        if (key) {
          let item = APP.ingredientDb.find(db => db.name === t(key));
          if (item && item.allergens && item.allergens.length > 0) {
            item.allergens.forEach(a => allergenSet.add(a));
          } else {
            let defItem2 = DEFAULT_INGREDIENT_DB.find(db => db.name === t(key) || db.name.toLowerCase() === ing.name.toLowerCase());
            if (defItem2 && defItem2.allergens) defItem2.allergens.forEach(a => allergenSet.add(a));
          }
        }
      }
    }
  });

  const allergenList = Array.from(allergenSet);
  const prevAllergens = $('#prevAllergens');
  if (allergenList.length > 0) {
    prevAllergens.textContent = allergenList.join(', ');
  } else {
    prevAllergens.textContent = t('labeling.preview.no_allergens') || 'Aucun';
  }

  // Form fields
  $('#prevWeight').textContent = $('#labelWeight').value || '0';
  $('#prevPrice').textContent = (parseFloat($('#labelPrice').value) || 0).toFixed(2) + ' €';

  const fabDate = $('#labelFabDate').value;
  $('#prevFabDate').textContent = fabDate ? new Date(fabDate).toLocaleDateString() : '--/--/----';

  const expDate = $('#labelExpDate').value;
  $('#prevExpDate').textContent = expDate ? new Date(expDate).toLocaleDateString() : '--/--/----';

  $('#prevStorage').textContent = $('#labelStorage').value;

  if (typeof renderLabelingStats === 'function') renderLabelingStats();
}

function printLabel() {
  if (!selectedLabelRecipe) {
    showToast(t('labeling.toast.no_recipe'), 'warning');
    return;
  }

  // Add class to body for print styles
  document.body.classList.add('printing-label');
  window.print();

  // Clean up
  setTimeout(() => {
    document.body.classList.remove('printing-label');
  }, 100);
}

function downloadLabelImage() {
  if (!selectedLabelRecipe) {
    showToast(t('labeling.toast.no_recipe'), 'warning');
    return;
  }

  if (typeof html2pdf === 'undefined') {
    showToast('Bibliothèque html2pdf non chargée', 'error');
    return;
  }

  const element = document.getElementById('labelCaptureArea');
  const opt = {
    margin: [0, 0],
    filename: `Etiquette_${selectedLabelRecipe.name.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { 
      scale: 2, 
      logging: false,
      windowWidth: 800,
      scrollY: 0,
      scrollX: 0
    },
    jsPDF: { unit: 'mm', format: [100, 100], orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
  showToast(t('labeling.toast.print_success'), 'success');
}

function renderLabelingStats() {
  const total = APP.savedRecipes.length;
  $('#labTotalRecipes').textContent = total;

  if (selectedLabelRecipe) {
    const allergenSet = new Set();
    selectedLabelRecipe.ingredients.forEach(ing => {
      let dbItem = APP.ingredientDb.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
      if (dbItem && dbItem.allergens && dbItem.allergens.length > 0) {
        dbItem.allergens.forEach(a => allergenSet.add(a));
      } else {
        let defItem = DEFAULT_INGREDIENT_DB.find(db => db.name.toLowerCase() === ing.name.toLowerCase());
        if (defItem && defItem.allergens) {
          defItem.allergens.forEach(a => allergenSet.add(a));
        } else {
          const key = REVERSE_LOOKUP[ing.name.toLowerCase()] || REVERSE_LOOKUP[ing.name];
          if (key) {
            let item = APP.ingredientDb.find(db => db.name === t(key));
            if (item && item.allergens && item.allergens.length > 0) {
              item.allergens.forEach(a => allergenSet.add(a));
            } else {
              let defItem2 = DEFAULT_INGREDIENT_DB.find(db => db.name === t(key) || db.name.toLowerCase() === ing.name.toLowerCase());
              if (defItem2 && defItem2.allergens) defItem2.allergens.forEach(a => allergenSet.add(a));
            }
          }
        }
      }
    });
    $('#labAllergenCount').textContent = allergenSet.size;

    const box = $('#labAllergenStatusBox');
    if (allergenSet.size > 0) {
      box.classList.add('warning');
      box.classList.remove('success');
    } else {
      box.classList.remove('warning');
      box.classList.add('success');
    }
  } else {
    $('#labAllergenCount').textContent = '0';
    $('#labAllergenStatusBox').classList.remove('warning', 'success');
  }
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================================================
