/**
 * GOURMETREVIENT — Module de Synchronisation Cloud
 * Gère la migration localStorage -> Supabase et la persistence
 */

const GourmetCloud = {
    /**
     * Lance la migration des données locales vers le cloud
     * Appelé après une connexion réussie
     */
    async migrateLocalToCloud() {
        const user = AuthUI.getCurrentUser();
        if (!user) return;

        const userKey = (user.user_metadata?.full_name || user.email.split('@')[0]).toLowerCase();
        const storageKey = `gourmetrevient_recipes_${userKey}`;
        const localRecipes = JSON.parse(localStorage.getItem(storageKey) || '[]');

        if (localRecipes.length === 0) return;

        console.log(`☁️ CloudSync : Analyse de ${localRecipes.length} recettes pour migration...`);

        // Récupérer les recettes déjà présentes sur le cloud pour éviter les doublons
        const { data: cloudRecipes, error } = await supabase
            .from('recipes')
            .select('name')
            .eq('user_id', user.id);

        if (error) {
            console.error('❌ CloudSync : Erreur lors de la lecture du cloud', error);
            return;
        }

        const cloudNames = new Set(cloudRecipes.map(r => r.name));
        const toUpload = localRecipes.filter(r => !cloudNames.has(r.name));

        if (toUpload.length === 0) {
            console.log('✅ CloudSync : Tout est déjà synchronisé.');
            return;
        }

        // Proposer la migration à l'utilisateur
        const confirmMigration = confirm(`☁️ Synchronisation Cloud : ${toUpload.length} recettes locales ont été détectées. Souhaitez-vous les sauvegarder sur votre compte sécurisé ?`);
        
        if (!confirmMigration) return;

        showToast(`🚀 Synchronisation de ${toUpload.length} recettes...`, 'info');

        let successCount = 0;
        for (const recipe of toUpload) {
            const { error: uploadError } = await supabase
                .from('recipes')
                .upsert({
                    user_id: user.id,
                    name: recipe.name,
                    category: recipe.category,
                    data: recipe, // On stocke l'objet recette complet en JSON
                    total_cost: recipe.total_cost || 0,
                    selling_price: recipe.selling_price || 0,
                    updated_at: new Date().toISOString()
                });

            if (!uploadError) successCount++;
        }

        if (successCount > 0) {
            showToast(`✅ ${successCount} recettes synchronisées avec succès !`, 'success');
        }
    },

    /**
     * Récupère toutes les recettes du cloud pour l'utilisateur actuel
     */
    async fetchCloudRecipes() {
        const user = AuthUI.getCurrentUser();
        if (!user) return [];

        const { data, error } = await supabase
            .from('recipes')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false });

        if (error) {
            console.error('❌ CloudSync : Erreur lors de la récupération', error);
            return [];
        }

        return data.filter(r => r.category !== '_SYSTEM_USERS_').map(r => r.data);
    },

    /**
     * Synchronise la base des utilisateurs locaux (comptes PIN) avec le cloud
     */
    async syncUsersToCloud() {
        const user = AuthUI.getCurrentUser();
        if (!user) return;

        const usersDb = JSON.parse(localStorage.getItem('gourmet_users') || '{}');
        if (Object.keys(usersDb).length === 0) return;

        console.log(`☁️ CloudSync : Sauvegarde des profils utilisateurs locaux...`);

        await supabase
            .from('recipes')
            .upsert({
                user_id: user.id,
                name: '_sys_gourmet_users_',
                category: '_SYSTEM_USERS_',
                data: usersDb,
                updated_at: new Date().toISOString()
            });
    },

    /**
     * Récupère les profils utilisateurs depuis le cloud et fusionne avec le local
     */
    async fetchCloudUsers() {
        const user = AuthUI.getCurrentUser();
        if (!user) return;

        const { data, error } = await supabase
            .from('recipes')
            .select('data')
            .eq('user_id', user.id)
            .eq('category', '_SYSTEM_USERS_')
            .single();

        if (!error && data && data.data) {
            const localDb = JSON.parse(localStorage.getItem('gourmet_users') || '{}');
            const cloudDb = data.data;
            
            // Fusion: le cloud prend la priorité
            const mergedDb = { ...localDb, ...cloudDb };
            localStorage.setItem('gourmet_users', JSON.stringify(mergedDb));
            console.log('✅ CloudSync : Profils utilisateurs (PIN) synchronisés depuis le cloud.');
        }
    }
};

// Initialisation globale
window.GourmetCloud = GourmetCloud;

// Écouter les événements d'authentification pour déclencher la migration
window.addEventListener('load', () => {
    if (window.supabase) {
        window.supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                // Délai court pour laisser l'app s'initialiser
                setTimeout(() => {
                    GourmetCloud.fetchCloudUsers();
                    GourmetCloud.migrateLocalToCloud();
                    GourmetCloud.syncUsersToCloud();
                }, 2000);
            }
        });
    }
});
