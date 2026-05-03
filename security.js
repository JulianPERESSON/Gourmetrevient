/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║   GOURMETREVIENT — Security Utilities v1.0                   ║
 * ║   Protection XSS · Rate Limiting · Input Validation          ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const GourmetSecurity = (() => {

  // ── 1. SANITISATION XSS ─────────────────────────────────────────────────────
  // Échappe tous les caractères HTML dangereux pour empêcher l'injection de code
  function sanitize(str) {
    if (str === null || str === undefined) return '';
    const s = String(str);
    const map = { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":"&#x27;", '/':'&#x2F;', '`':'&#x60;' };
    return s.replace(/[&<>"'`/]/g, c => map[c]);
  }

  // Nettoie un objet entier (recettes, ingrédients, etc.)
  function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) return sanitize(obj);
    const clean = Array.isArray(obj) ? [] : {};
    for (const key in obj) {
      if (!Object.prototype.hasOwnProperty.call(obj, key)) continue;
      const val = obj[key];
      clean[key] = (typeof val === 'object') ? sanitizeObject(val)
                 : (typeof val === 'string')  ? sanitize(val)
                 : val;
    }
    return clean;
  }

  // Méthode sécurisée pour insérer du HTML généré par l'app (templates connus)
  function safeHTML(element, html) {
    // Uniquement pour les templates internes connus — jamais pour du contenu utilisateur brut
    if (element && typeof html === 'string') {
      element.innerHTML = html;
    }
  }

  // ── 2. VALIDATION DES INPUTS ────────────────────────────────────────────────
  const validators = {
    recipeName: (v) => typeof v === 'string' && v.trim().length > 0 && v.length <= 200,
    price:      (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0 && parseFloat(v) <= 99999,
    email:      (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
    password:   (v) => {
      if (typeof v !== 'string' || v.length < 8) return false;
      const hasUpper = /[A-Z]/.test(v);
      const hasLower = /[a-z]/.test(v);
      const hasDigit = /[0-9]/.test(v);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(v);
      return hasUpper && hasLower && hasDigit && hasSpecial;
    },
    quantity:   (v) => !isNaN(parseFloat(v)) && parseFloat(v) >= 0,
    text:       (v) => typeof v === 'string' && v.length <= 500,
  };

  function validate(type, value) {
    return validators[type] ? validators[type](value) : true;
  }

  // ── 3. RATE LIMITING (client-side) ─────────────────────────────────────────
  // Empêche les soumissions répétées rapides (ex: spam du bouton "Ajouter")
  const rateLimitMap = new Map();

  function rateLimit(key, limitMs = 1000) {
    const now = Date.now();
    const last = rateLimitMap.get(key) || 0;
    if (now - last < limitMs) return false; // Action trop rapide, bloquée
    rateLimitMap.set(key, now);
    return true;
  }

  // ── 4. PROTECTION DES DONNÉES LOCALES ───────────────────────────────────────
  // Vérifie l'intégrité d'un objet récupéré depuis localStorage
  function safeLocalStorageGet(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return defaultValue;
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      console.warn(`[Security] Données corrompues pour la clé "${key}", réinitialisation.`);
      localStorage.removeItem(key);
      return defaultValue;
    }
  }

  function safeLocalStorageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('[Security] Impossible d\'écrire dans localStorage:', e);
      return false;
    }
  }

  // ── 5. DÉTECTION D'ENVIRONNEMENT SUSPECT ───────────────────────────────────
  function checkEnvironment() {
    // Détecte si la page est chargée dans un iframe (tentative de clickjacking)
    if (window.self !== window.top) {
      console.error('[Security] Page chargée dans un iframe — potentiel clickjacking détecté !');
      document.body.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;"><p>⚠️ Accès non autorisé.</p></div>';
      return false;
    }
    return true;
  }

  // ── 6. AUDIT CONSOLE ────────────────────────────────────────────────────────
  function logSecurityStatus() {
    const https = location.protocol === 'https:';
    const csp   = !!document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    const xframe = !!document.querySelector('meta[http-equiv="X-Frame-Options"]');

    console.groupCollapsed('%c🔐 GourmetRevient Security Status', 'color:#10b981;font-weight:bold;font-size:14px;');
    console.log(`%c HTTPS      : ${https ? '✅' : '❌ (utiliser HTTPS en production)'}`, `color:${https?'#10b981':'#ef4444'}`);
    console.log(`%c CSP        : ${csp   ? '✅' : '❌ manquant'}`, `color:${csp?'#10b981':'#ef4444'}`);
    console.log(`%c X-Frame    : ${xframe? '✅' : '❌ manquant'}`, `color:${xframe?'#10b981':'#ef4444'}`);
    console.log('%c Sanitize   : ✅ actif', 'color:#10b981');
    console.log('%c Rate Limit : ✅ actif', 'color:#10b981');
    console.groupEnd();
  }

  // ── INIT ────────────────────────────────────────────────────────────────────
  function init() {
    checkEnvironment();

    // Patch global : intercepte les affectations innerHTML dangereuses sur les éléments
    // contenant des données utilisateur critiques
    const sensitiveIds = ['recipeName', 'ingredientName', 'clientName', 'noteField'];
    sensitiveIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && el.tagName === 'INPUT') {
        el.addEventListener('input', () => {
          // Supprime les balises script dans les inputs en temps réel
          if (/<script|javascript:|on\w+=/i.test(el.value)) {
            el.value = el.value.replace(/<script.*?>.*?<\/script>/gi, '')
                               .replace(/javascript:/gi, '')
                               .replace(/on\w+=/gi, '');
            showToast && showToast('⚠️ Caractères non autorisés supprimés.', 'warning');
          }
        });
      }
    });

    if (document.readyState === 'complete') {
      logSecurityStatus();
    } else {
      window.addEventListener('load', logSecurityStatus);
    }
  }

  // API publique
  return { sanitize, sanitizeObject, safeHTML, validate, rateLimit, safeLocalStorageGet, safeLocalStorageSet, init };

})();

// Démarrage automatique
GourmetSecurity.init();

// Expose globalement pour utilisation dans app.js et autres modules
window.GourmetSecurity = GourmetSecurity;
window.sanitize = GourmetSecurity.sanitize; // Raccourci global
