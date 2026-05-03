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

// Création du client global (clé anon publique — sans privilèges admin)
// On utilise 'var' pour garantir que la variable est accessible par TOUS les autres scripts .js du projet
var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// On garde aussi ce nom pour le module billing.js
window.supabaseClient = supabase;

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
