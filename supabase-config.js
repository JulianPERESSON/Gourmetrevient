/**
 * GOURMETREVIENT — Configuration Supabase
 * 
 * ⚠️  SÉCURITÉ :
 * - SUPABASE_ANON_KEY = clé publique (anon), conçue pour être exposée côté client.
 *   Elle ne donne accès qu'aux données autorisées par les Row Level Security (RLS).
 * - La service_role_key (clé admin) n'est JAMAIS stockée ici.
 *   Elle doit rester uniquement dans les Edge Functions Supabase (côté serveur).
 */

const SUPABASE_URL = 'https://hogfrddigcojdmjjpbno.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_9iePEQdGSdnjXaw4I1s0Nw_wyitVBla';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
window.supabase = supabase; // Objet global standard

/**
 * GESTION DE L'ÉTAT ET NAVIGATION
 */
function setCurrentUser(profile) {
    if (!profile) return;
    window.GOURMET_USER = profile;
    window.GOURMET_PLAN = profile.plan || 'free';
    localStorage.setItem('gourmet_auth', 'true');
    localStorage.setItem('gourmet_current_user', profile.email);
}

function afficherDashboard() {
    // Si on est sur la landing page, on redirige vers l'index
    if (window.location.pathname.includes('landing.html')) {
        window.location.href = 'index.html';
    } else {
        // Sinon on rafraîchit l'UI (si les fonctions existent)
        if (typeof updateDashboard === 'function') updateDashboard();
        if (typeof AuthUI !== 'undefined' && AuthUI._updateUI) AuthUI._updateUI(window.GOURMET_USER);
    }
}

function afficherLandingPage() {
    // Ne pas boucler si on y est déjà
    if (window.location.pathname.includes('landing.html')) return;
    window.location.href = 'landing.html';
}

async function initApp() {
    try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .single();
            
            if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows found
            
            if (profile) {
                setCurrentUser(profile);
                // Déclenche la migration du localStorage vers Supabase une seule fois
                if (typeof GourmetSync !== 'undefined') {
                    GourmetSync.migrerLocalStorageVersSupabase();
                }
            } else {
                // Fallback si le trigger n'a pas encore créé le profil
                setCurrentUser({ id: session.user.id, email: session.user.email, plan: 'free' });
            }
            afficherDashboard();
        } else {
            // Mode démo fallback (autorisé par le client)
            if (localStorage.getItem('gourmet_demo_mode') === 'true') {
                return; // On laisse faire auth-ui.js
            }
            afficherLandingPage();
        }
    } catch (err) {
        console.error('Erreur initApp:', err);
        afficherLandingPage();
    }
}

// Écouteur global de session
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event);
    if (event === 'SIGNED_IN') initApp();
    if (event === 'SIGNED_OUT') {
        localStorage.removeItem('gourmet_auth');
        localStorage.removeItem('gourmet_current_user');
        afficherLandingPage();
    }
});


/**
 * Fonctions utilitaires pour le projet
 */
const db = {
    // Récupérer le profil de l'utilisateur connecté
    async getProfile() {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return null;
        
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
        return data;
    },

    // Sauvegarder une recette
    async saveRecipe(recipe) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return { error: 'Utilisateur non connecté' };

        const { data, error } = await supabase
            .from('recipes')
            .upsert({
                user_id: user.id,
                name: recipe.name,
                category: recipe.category,
                total_cost: recipe.total_cost,
                selling_price: recipe.selling_price
            });

        return { data, error };
    }
};
