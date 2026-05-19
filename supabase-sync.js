/**
 * GOURMETREVIENT — Supabase Sync Engine v3.0
 * ============================================================
 * ✅ Table "recipes" (schéma réel Supabase)
 * ✅ Mapping bidirectionnel app ↔ base (prepTime ↔ prep_time, etc.)
 * ✅ Realtime cross-device : recipes + ingredients
 * ✅ Cloud-first : le cloud est TOUJOURS la source de vérité
 * ✅ Retry exponentiel offline (max 5 tentatives)
 * ✅ Isolation par user_id (jamais de fuite inter-utilisateurs)
 * ============================================================
 */

const GourmetSync = {
    queue: JSON.parse(localStorage.getItem('gourmet_sync_queue') || '[]'),

    async init() {
        window.addEventListener('online', () => {
            console.log('🌐 GourmetSync : Retour en ligne, vidage de la file...');
            this.processQueue();
        });
        window.addEventListener('offline', () => this.updateOfflineBanner());
        if (navigator.onLine) this.processQueue();
    },

    // ══════════════════════════════════════════════════════════════
    // MAPPING RECETTE : App Object ↔ Ligne Supabase
    // ══════════════════════════════════════════════════════════════

    /**
     * Convertit un objet recette de l'app vers le format de la table Supabase `recipes`
     */
    _recipeToRow(recipe, userId) {
        return {
            id: recipe.id,
            user_id: userId,
            name: recipe.name,
            category: recipe.category || null,
            portions: parseInt(recipe.portions) || 1,
            prep_time: Math.round(parseFloat(recipe.prepTime) || 0),
            cook_time: Math.round(parseFloat(recipe.cookTime) || 0),
            ingredients: recipe.ingredients || [],
            procedure: recipe.procedure || [],
            // On stocke les métadonnées dans costs (margin, advanced, savedAt)
            costs: {
                ...(recipe.costs || {}),
                margin: recipe.margin || 70,
                advanced: recipe.advanced || null,
                savedAt: recipe.savedAt || new Date().toISOString()
            },
            updated_at: new Date().toISOString()
        };
    },

    /**
     * Convertit une ligne Supabase `recipes` vers le format objet de l'app
     */
    _rowToRecipe(row) {
        return {
            id: row.id,
            name: row.name,
            category: row.category || '',
            portions: row.portions || 1,
            prepTime: row.prep_time || 0,
            cookTime: row.cook_time || 0,
            ingredients: row.ingredients || [],
            procedure: row.procedure || [],
            costs: row.costs || {},
            margin: row.costs?.margin || 70,
            advanced: row.costs?.advanced || null,
            savedAt: row.costs?.savedAt || row.created_at,
            updated_at: row.updated_at || row.created_at
        };
    },

    // ══════════════════════════════════════════════════════════════
    // RECETTES — Lecture & Écriture
    // ══════════════════════════════════════════════════════════════

    /**
     * Charge toutes les recettes depuis le cloud (cloud-first).
     * Retourne null en cas d'erreur ou si non connecté.
     */
    async chargerRecettes() {
        if (!navigator.onLine || !window.gourmetSupabase) return null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return null;

            const { data, error } = await gourmetSupabase
                .from('recipes')
                .select('*')
                .eq('user_id', session.user.id)
                .order('updated_at', { ascending: false });

            if (error) throw error;
            return (data || []).map(row => this._rowToRecipe(row));
        } catch (err) {
            console.error('[GourmetSync] Erreur chargement recettes:', err.message);
            return null;
        }
    },

    /**
     * Sauvegarde une recette dans le cloud.
     * Si hors ligne, met en file d'attente.
     */
    async sauvegarderRecette(recipe) {
        if (!window.gourmetSupabase) return;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return;

            const row = this._recipeToRow(recipe, session.user.id);

            if (navigator.onLine) {
                const { error } = await gourmetSupabase
                    .from('recipes')
                    .upsert(row, { onConflict: 'id' });
                if (error) throw error;
            } else {
                this.addToQueue('recipes', 'upsert', row);
            }
        } catch (err) {
            console.warn('[GourmetSync] Mise en queue recipe:', err.message);
            // On essaie de récupérer l'objet row si la session a échoué
            this.addToQueue('recipes', 'upsert', recipe);
        }
    },

    /**
     * Supprime une recette du cloud.
     */
    async supprimerRecette(id) {
        if (!window.gourmetSupabase) return;
        if (navigator.onLine) {
            try {
                const { error } = await gourmetSupabase.from('recipes').delete().eq('id', id);
                if (error) throw error;
            } catch (err) {
                this.addToQueue('recipes', 'delete', { id });
            }
        } else {
            this.addToQueue('recipes', 'delete', { id });
        }
    },

    // ══════════════════════════════════════════════════════════════
    // GÉNÉRIQUE — Sauvegarder / Supprimer (autres tables)
    // ══════════════════════════════════════════════════════════════

    async sauvegarder(table, item, localStorageKey) {
        if (!window.gourmetSupabase) return;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (session?.user?.id) item.user_id = session.user.id;
        } catch (e) {}
        item.updated_at = new Date().toISOString();

        // Mise à jour locale optimiste (affichage immédiat)
        if (localStorageKey) {
            try {
                const cached = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                const idx = cached.findIndex(r => r.id === item.id);
                if (idx >= 0) cached[idx] = item; else cached.unshift(item);
                localStorage.setItem(localStorageKey, JSON.stringify(cached));
            } catch (e) {}
        }

        if (navigator.onLine && window.gourmetSupabase) {
            try {
                const { error } = await gourmetSupabase.from(table).upsert(item, { onConflict: 'id' });
                if (error) throw error;
            } catch (err) {
                console.warn(`[GourmetSync] Mise en queue ${table}:`, err.message);
                this.addToQueue(table, 'upsert', item);
            }
        } else {
            this.addToQueue(table, 'upsert', item);
        }
    },

    async supprimer(table, id, localStorageKey) {
        if (localStorageKey) {
            try {
                const cached = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                localStorage.setItem(localStorageKey, JSON.stringify(cached.filter(r => r.id !== id)));
            } catch (e) {}
        }
        if (navigator.onLine && window.gourmetSupabase) {
            try {
                const { error } = await gourmetSupabase.from(table).delete().eq('id', id);
                if (error) throw error;
            } catch (err) { this.addToQueue(table, 'delete', { id }); }
        } else {
            this.addToQueue(table, 'delete', { id });
        }
    },

    // ══════════════════════════════════════════════════════════════
    // FILE D'ATTENTE OFFLINE — Retry exponentiel
    // ══════════════════════════════════════════════════════════════

    addToQueue(table, action, data) {
        this.queue.push({ table, action, data, timestamp: Date.now(), attempts: 0 });
        localStorage.setItem('gourmet_sync_queue', JSON.stringify(this.queue));
        this.updateOfflineBanner();
        if (navigator.onLine) this._scheduleRetry();
    },

    _retryTimer: null,
    _scheduleRetry() {
        if (this._retryTimer) return;
        this._retryTimer = setTimeout(() => { this._retryTimer = null; this.processQueue(); }, 3000);
    },

    async processQueue() {
        if (this.queue.length === 0) { this.updateOfflineBanner(); return; }
        console.log(`🔄 GourmetSync : ${this.queue.length} opération(s) en attente...`);
        const MAX = 5;
        const remaining = [];

        for (const op of this.queue) {
            const backoffMs = Math.pow(2, op.attempts || 0) * 1000;
            if (op.attempts > 0 && (Date.now() - (op.timestamp || 0)) < backoffMs) {
                remaining.push(op); continue;
            }
            try {
                if (op.action === 'upsert') {
                    const { error } = await gourmetSupabase.from(op.table).upsert(op.data, { onConflict: 'id' });
                    if (error) throw error;
                } else if (op.action === 'delete') {
                    const { error } = await gourmetSupabase.from(op.table).delete().eq('id', op.data.id);
                    if (error) throw error;
                }
            } catch (err) {
                op.attempts = (op.attempts || 0) + 1;
                op.timestamp = Date.now();
                if (op.attempts < MAX) { remaining.push(op); }
                else { console.error(`[GourmetSync] Opération abandonnée (${MAX} tentatives):`, op); }
            }
        }

        this.queue = remaining;
        localStorage.setItem('gourmet_sync_queue', JSON.stringify(this.queue));
        this.updateOfflineBanner();
        if (remaining.length > 0) this._scheduleRetry();
    },

    // ══════════════════════════════════════════════════════════════
    // INDICATEUR VISUEL OFFLINE / SYNC
    // ══════════════════════════════════════════════════════════════

    updateOfflineBanner() {
        const badge = document.getElementById('syncPendingBadge');
        const dot = document.getElementById('offlineStatusDot');
        const count = this.queue.length;
        const online = navigator.onLine;
        if (badge) {
            badge.textContent = count > 0 ? `${count} en attente` : '';
            badge.classList.toggle('has-pending', count > 0);
        }
        if (dot) {
            dot.className = online
                ? (count > 0 ? 'sync-dot sync-dot--syncing' : 'sync-dot sync-dot--online')
                : 'sync-dot sync-dot--offline';
            dot.title = online
                ? (count > 0 ? `${count} op. en attente de sync` : 'Synchronisé ✓')
                : 'Hors ligne — modifications sauvegardées localement';
        }
    },

    // ══════════════════════════════════════════════════════════════
    // REALTIME — Sync instantanée entre appareils
    // ══════════════════════════════════════════════════════════════

    initRealtime() {
        if (!window.gourmetSupabase) return;

        // ── Recettes : sync temps réel ───────────────────────────
        gourmetSupabase.channel('recipes-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, async (payload) => {
                // Filtrer : ne réagir qu'aux changements de cet utilisateur
                const uid = localStorage.getItem('gourmet_user_id');
                const changedUid = payload.new?.user_id || payload.old?.user_id;
                if (uid && changedUid && uid !== changedUid) return;

                console.info('[Realtime] Recette modifiée sur un autre appareil → rechargement');
                if (typeof loadSavedRecipes === 'function') {
                    await loadSavedRecipes();
                    if (typeof renderRecipeList === 'function') renderRecipeList();
                    if (typeof updateDashboard === 'function') updateDashboard();
                    if (typeof showToast === 'function') showToast('🔄 Recettes synchronisées depuis un autre appareil', 'info');
                }
            }).subscribe();

        // ── Inventaire : sync temps réel ────────────────────────
        gourmetSupabase.channel('ingredients-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ingredients' }, async (payload) => {
                const uid = localStorage.getItem('gourmet_user_id');
                const changedUid = payload.new?.user_id || payload.old?.user_id;
                if (uid && changedUid && uid !== changedUid) return;

                console.info('[Realtime] Inventaire modifié sur un autre appareil → rechargement');
                if (typeof loadInventory === 'function') {
                    await loadInventory();
                    if (typeof renderInventory === 'function') renderInventory();
                }
            }).subscribe();

        // ── Alertes stock critique ───────────────────────────────
        gourmetSupabase.channel('stock-alerts')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ingredients' }, payload => {
                const seuil = payload.new.seuil_alerte || 0;
                if (payload.new.stock_actuel <= seuil)
                    if (typeof showToast === 'function')
                        showToast(`⚠️ Stock critique : ${payload.new.nom}`, 'warning');
            }).subscribe();

        // ── Nouvelles commandes ──────────────────────────────────
        gourmetSupabase.channel('new-orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'commandes' }, () => {
                if (typeof showToast === 'function') showToast(`🔔 Nouvelle commande reçue !`, 'success');
                if (typeof renderCommandes === 'function') renderCommandes();
            }).subscribe();
    },

    // ══════════════════════════════════════════════════════════════
    // MIGRATION localStorage → Supabase (exécutée une seule fois)
    // ══════════════════════════════════════════════════════════════

    async migrerLocalStorageVersSupabase() {
        if (localStorage.getItem('gourmet_migration_done_v3') === 'true') return;
        if (!window.gourmetSupabase) return;

        const { data: { session } } = await gourmetSupabase.auth.getSession();
        if (!session?.user?.id) return;

        const uid = session.user.id;
        console.info('🚀 Migration localStorage → Supabase v3...');
        if (typeof showToast === 'function') showToast('Synchronisation Cloud... ⏳', 'info');

        // Chercher les recettes dans localStorage (ancienne ou nouvelle clé)
        const newKey = `gourmet_recettes_${uid}`;
        const owner = localStorage.getItem('gourmet_current_user') || '';
        const oldKey = `gourmetrevient_recipes_${owner.toLowerCase()}`;
        const localRecipes = JSON.parse(
            localStorage.getItem(newKey) || localStorage.getItem(oldKey) || '[]'
        );

        if (localRecipes.length > 0) {
            // Vérifier ce qui existe déjà sur le cloud
            const { data: existing } = await gourmetSupabase
                .from('recipes').select('id').eq('user_id', uid);
            const existingIds = new Set((existing || []).map(r => r.id));

            for (const recipe of localRecipes) {
                if (existingIds.has(recipe.id)) continue; // Ne pas écraser
                try {
                    const row = this._recipeToRow(recipe, uid);
                    await gourmetSupabase.from('recipes').upsert(row, { onConflict: 'id' });
                } catch (e) { console.warn('[Migration] Erreur recipe:', e.message); }
            }
        }

        localStorage.setItem('gourmet_migration_done_v3', 'true');
        if (typeof showToast === 'function') showToast('✅ Synchronisation terminée !', 'success');
    },

    // ══════════════════════════════════════════════════════════════
    // RESET DONNÉES UTILISATEUR
    // ══════════════════════════════════════════════════════════════

    async resetUserData(skipConfirm = false) {
        const { data: { session } } = await gourmetSupabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        if (!skipConfirm && !confirm('⚠️ Êtes-vous sûr de vouloir vider TOUTES vos données ?\n\nCette action est irréversible.')) return;
        if (typeof showToast === 'function') showToast('Nettoyage en cours... ⏳', 'info');

        const tables = ['recipes', 'clients', 'commandes', 'fournisseurs',
            'planning_production', 'haccp_temperatures', 'haccp_nettoyage', 'pertes'];
        for (const table of tables) {
            try { await gourmetSupabase.from(table).delete().eq('user_id', user.id); } catch (e) {}
        }
        try {
            await gourmetSupabase.from('ingredients')
                .update({ stock_actuel: 0, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);
        } catch (e) {}

        // Nettoyage localStorage (préserver auth et UUID)
        const protectedKeys = ['gourmet_auth', 'gourmet_current_user', 'gourmet_user_id',
            'gourmet_demo_mode', 'gourmet_ingredient_db'];
        Object.keys(localStorage).forEach(key => {
            if (protectedKeys.includes(key)) return;
            if (key.includes('gourmet') || key.includes('labpatiss')) localStorage.removeItem(key);
        });

        if (typeof showToast === 'function') showToast('✅ Espace de travail réinitialisé.', 'success');
        setTimeout(() => window.location.reload(), 1200);
    },

    // ══════════════════════════════════════════════════════════════
    // SUPPRESSION COMPLÈTE DU COMPTE (Art. 17 RGPD)
    // ══════════════════════════════════════════════════════════════

    async deleteFullAccount() {
        const { data: { session } } = await gourmetSupabase.auth.getSession();
        const user = session?.user;
        if (!user) {
            if (typeof showToast === 'function') showToast('❌ Aucune session active.', 'error');
            return false;
        }

        const ok1 = confirm(
            '⚠️ SUPPRESSION DÉFINITIVE DU COMPTE\n\n' +
            'Toutes vos données seront effacées :\n' +
            '• Recettes, inventaire\n• CRM, commandes\n• Planning, HACCP, profil\n\nContinuez ?'
        );
        if (!ok1) return false;

        const confirmText = prompt('Tapez "SUPPRIMER" (en majuscules) pour confirmer :');
        if (confirmText !== 'SUPPRIMER') {
            if (typeof showToast === 'function') showToast('Suppression annulée.', 'info');
            return false;
        }

        if (typeof showToast === 'function') showToast('🗑️ Suppression en cours... ⏳', 'info');

        const cascadeTables = [
            'recipes', 'ingredients', 'commandes', 'clients', 'fournisseurs',
            'planning_production', 'haccp_temperatures', 'haccp_nettoyage',
            'pertes', 'subscriptions', 'profiles'
        ];

        for (const table of cascadeTables) {
            try {
                await gourmetSupabase.from(table).delete().eq('user_id', user.id);
            } catch (e) { console.warn(`deleteFullAccount — ${table}:`, e.message); }
        }

        // Nettoyage total localStorage
        Object.keys(localStorage)
            .filter(k => k.includes('gourmet') || k.includes('labpatiss'))
            .forEach(k => localStorage.removeItem(k));
        this.queue = [];
        localStorage.removeItem('gourmet_sync_queue');

        await gourmetSupabase.auth.signOut();
        if (typeof showToast === 'function') showToast('✅ Compte supprimé définitivement. Au revoir !', 'success');
        setTimeout(() => { window.location.href = './landing.html'; }, 2000);
        return true;
    }
};

window.GourmetSync = GourmetSync;
GourmetSync.init();
GourmetSync.initRealtime();
