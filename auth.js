/*
  =====================================================================
  AUTH.JS — Gestion de la session utilisateur locale
  =====================================================================
*/

const AUTH_USER_KEY = 'patisserie_auth_user';

function getLoggedInUser() {
    const user = localStorage.getItem(AUTH_USER_KEY);
    return user ? JSON.parse(user) : null;
}

function login(name, pin) {
    const user = {
        id: 'user_' + btoa(name + pin).substring(0, 12), // Consistent ID based on name and pin
        name: name,
        pin: pin,
        joinedAt: new Date().toISOString()
    };
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
}

function logout() {
    localStorage.removeItem(AUTH_USER_KEY);
    window.location.href = 'index.html';
}

function updateHeaderUser() {
    const user = getLoggedInUser();
    const userNav = document.getElementById('userNav');
    if (!userNav) return;

    if (user) {
        userNav.innerHTML = `
            <div class="user-profile">
                <span class="user-name">${user.name}</span>
                <button onclick="logout()" class="btn-logout" title="Déconnexion">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </button>
            </div>
        `;
    } else {
        userNav.innerHTML = `
            <a href="login.html" class="btn-login">Connexion</a>
        `;
    }
}

// Custom Recipes Storage
const BASE_STORAGE_KEY = 'patisserie_custom_recipes';

function getStorageKey() {
    const user = getLoggedInUser();
    return user ? `${BASE_STORAGE_KEY}_${user.id}` : BASE_STORAGE_KEY;
}

function loadCustomRecipes() {
    try {
        const key = getStorageKey();
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function saveCustomRecipes(recipes) {
    const key = getStorageKey();
    localStorage.setItem(key, JSON.stringify(recipes));
}

function getAllRecipes() {
    // RECIPES is defined in data.js which must be loaded before auth.js/script.js
    const standard = typeof RECIPES !== 'undefined' ? RECIPES : [];
    return [...standard, ...loadCustomRecipes()];
}

// Auto-init header if DOM is ready
document.addEventListener('DOMContentLoaded', updateHeaderUser);
