/**
 * GOURMETREVIENT — Supabase Sync Engine v1.0
 * Centralise toutes les opérations CRUD Supabase avec gestion du cache local (Offline-first)
 */

const GourmetSync = {
    // File d'attente pour la synchronisation hors-ligne
    queue: JSON.parse(localStorage.getItem('gourmet_sync_queue') || '[]'),

    async init() {
        window.addEventListener('online', () => this.processQueue());
        if (navigator.onLine) this.processQueue();
    },

    // --- GENERIC CRUD ---
    async charger(table, localStorageKey) {
        // 1. Lire le cache local d'abord
        const cached = localStorage.getItem(localStorageKey);
        let data = cached ? JSON.parse(cached) : null;

        // 2. Si en ligne, synchroniser depuis Supabase
        if (navigator.onLine && window.supabase) {
            try {
                const { data: cloudData, error } = await supabase
                    .from(table)
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;
                if (cloudData) {
                    data = cloudData;
                    localStorage.setItem(localStorageKey, JSON.stringify(data));
                }
            } catch (err) {
                console.error(`Erreur chargement ${table}:`, err);
            }
        }
        return data;
    },

    async sauvegarder(table, item, localStorageKey) {
        // 1. Mise à jour locale immédiate (Optimistic UI)
        // Note: l'item doit avoir un user_id
        const user = (await gourmetSupabase.auth.getSession()).data.session?.user;
        if (user) item.user_id = user.id;

        // 2. Tentative de push vers Supabase
        if (navigator.onLine && window.supabase) {
            try {
                const { error } = await gourmetSupabase.from(table).upsert(item);
                if (error) throw error;
            } catch (err) {
                console.error(`Erreur sauvegarde ${table}, mise en file d'attente...`);
                this.addToQueue(table, 'upsert', item);
            }
        } else {
            this.addToQueue(table, 'upsert', item);
        }
    },

    async supprimer(table, id, localStorageKey) {
        if (navigator.onLine && window.supabase) {
            try {
                const { error } = await gourmetSupabase.from(table).delete().eq('id', id);
                if (error) throw error;
            } catch (err) {
                this.addToQueue(table, 'delete', { id });
            }
        } else {
            this.addToQueue(table, 'delete', { id });
        }
    },

    // --- QUEUE MANAGEMENT ---
    addToQueue(table, action, data) {
        this.queue.push({ table, action, data, timestamp: Date.now() });
        localStorage.setItem('gourmet_sync_queue', JSON.stringify(this.queue));
        this.updateOfflineBanner();
    },

    async processQueue() {
        if (this.queue.length === 0) return;
        console.log(`🔄 Sync : Traitement de ${this.queue.length} opérations en attente...`);
        
        const remaining = [];
        for (const op of this.queue) {
            try {
                let error;
                if (op.action === 'upsert') {
                    const { error: err } = await gourmetSupabase.from(op.table).upsert(op.data);
                    error = err;
                } else if (op.action === 'delete') {
                    const { error: err } = await gourmetSupabase.from(op.table).delete().eq('id', op.data.id);
                    error = err;
                }
                if (error) throw error;
            } catch (err) {
                remaining.push(op);
            }
        }
        this.queue = remaining;
        localStorage.setItem('gourmet_sync_queue', JSON.stringify(this.queue));
        this.updateOfflineBanner();
    },

    updateOfflineBanner() {
        const banner = document.getElementById('offlineBanner');
        const badge = document.getElementById('syncPendingBadge');
        if (badge) {
            badge.textContent = `${this.queue.length} en attente`;
            badge.classList.toggle('has-pending', this.queue.length > 0);
        }
    },

    // --- MODULE SPECIFIC CRUD ---
    async chargerRecettes() {
        const recettes = await this.charger('recettes', 'gourmet_recettes');
        if (recettes) {
            // Pour chaque recette, charger ses ingrédients
            for (let r of recettes) {
                const { data: ing } = await gourmetSupabase.from('recette_ingredients').select('*').eq('recette_id', r.id);
                r.ingredients = ing || [];
            }
        }
        return recettes;
    },

    async sauvegarderRecette(recette) {
        // 1. Sauvegarder la recette
        const { ingredients, ...recetteData } = recette;
        await this.sauvegarder('recettes', recetteData, 'gourmet_recettes');
        
        // 2. Sauvegarder les ingrédients (en cascade si possible, sinon manuel)
        if (ingredients && ingredients.length > 0) {
            const ings = ingredients.map(i => ({ ...i, recette_id: recette.id }));
            await this.sauvegarder('recette_ingredients', ings, null);
        }
    }
};

    // --- REALTIME ---
    initRealtime() {
        if (!window.supabase) return;

        // Alerte stock
        gourmetSupabase.channel('stock-alerts')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ingredients' }, payload => {
                if (payload.new.stock_actuel <= payload.new.seuil_alerte) {
                    if (typeof showToast === 'function') showToast(`⚠️ Stock critique : ${payload.new.name}`, 'warning');
                }
            })
            .subscribe();

        // Nouvelles commandes
        gourmetSupabase.channel('new-orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'commandes' }, payload => {
                if (typeof showToast === 'function') showToast(`🔔 Nouvelle commande reçue !`, 'success');
                if (typeof renderCommandes === 'function') renderCommandes();
            })
            .subscribe();
    },

    // --- MIGRATION ---
    async migrerLocalStorageVersSupabase() {
        if (localStorage.getItem('gourmet_migration_done') === 'true') return;
        
        const user = (await gourmetSupabase.auth.getSession()).data.session?.user;
        if (!user) return;

        console.info('🚀 Migration localStorage -> Supabase...');
        showToast('Migration de vos données vers le Cloud... ⏳', 'info');

        const mappings = [
            { key: 'gourmet_recettes', table: 'recettes' },
            { key: 'gourmet_ingredients', table: 'ingredients' },
            { key: 'gourmet_haccp_temperatures', table: 'haccp_temperatures' },
            { key: 'gourmet_commandes', table: 'commandes' },
            { key: 'gourmet_clients', table: 'clients' }
        ];

        for (const m of mappings) {
            const data = JSON.parse(localStorage.getItem(m.key) || '[]');
            if (Array.isArray(data) && data.length > 0) {
                for (const item of data) {
                    item.user_id = user.id;
                    await gourmetSupabase.from(m.table).upsert(item);
                }
            }
        }

        localStorage.setItem('gourmet_migration_done', 'true');
        showToast('✅ Migration terminée ! Vos données sont sécurisées sur le Cloud.', 'success');
    },

    async resetUserData() {
        const { data: { session } } = await gourmetSupabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        if (!confirm('⚠️ Êtes-vous sûr de vouloir vider TOUTES vos données ?\n\nCela supprimera vos recettes, votre inventaire, votre équipe et votre planning définitivement.\n\nCette action est irréversible.')) return;

        showToast('Nettoyage intégral en cours... ⏳', 'info');

        const tables = [
            'recettes', 
            'recette_ingredients', 
            'ingredients', 
            'commandes', 
            'clients', 
            'fournisseurs', 
            'planning_production', 
            'haccp_temperatures', 
            'haccp_nettoyage', 
            'pertes',
            'team_members',
            'staff_leaves'
        ];
        
        for (const table of tables) {
            try {
                // Suppression Cloud
                await gourmetSupabase.from(table).delete().eq('user_id', user.id);
            } catch(e) { 
                console.warn(`Note: Reset table ${table} ignoré ou erreur.`); 
            }
        }

        // Nettoyage LocalStorage Intégral (Sweep)
        const userPrefix = (user.email.split('@')[0]).toLowerCase();
        const allKeys = Object.keys(localStorage);
        
        allKeys.forEach(key => {
            const k = key.toLowerCase();
            if (k.includes('gourmet') || k.includes('labpatiss') || k.includes(userPrefix)) {
                localStorage.removeItem(key);
            }
        });
        
        showToast('✅ Espace de travail réinitialisé.', 'success');
        setTimeout(() => window.location.reload(), 1200);
    }
};

window.GourmetSync = GourmetSync;
GourmetSync.init();
GourmetSync.initRealtime();
