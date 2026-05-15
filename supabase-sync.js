/**
 * GOURMETREVIENT — Supabase Sync Engine v2.0
 * ✅ Conflit LWW (Last-Write-Wins) via updated_at
 * ✅ Retry exponentiel (max 5 tentatives)
 * ✅ deleteFullAccount — RGPD cascade complète
 * ✅ Indicateur visuel offline/sync
 */

const GourmetSync = {
    queue: JSON.parse(localStorage.getItem('gourmet_sync_queue') || '[]'),

    async init() {
        window.addEventListener('online', () => {
            console.log('🌐 GourmetSync : Retour en ligne...');
            this.processQueue();
        });
        window.addEventListener('offline', () => this.updateOfflineBanner());
        navigator.serviceWorker?.addEventListener('message', (ev) => {
            if (ev.data?.type === 'SYNC_OP') this._replayOp(ev.data.payload);
            if (ev.data?.type === 'SYNC_COMPLETE') this.updateOfflineBanner();
        });
        if (navigator.onLine) this.processQueue();
    },

    // ── CHARGER (Last-Write-Wins) ─────────────────────────────────────────────
    async charger(table, localStorageKey) {
        const cached = localStorage.getItem(localStorageKey);
        let localData = cached ? JSON.parse(cached) : null;

        if (navigator.onLine && window.gourmetSupabase) {
            try {
                const { data: cloudData, error } = await gourmetSupabase
                    .from(table).select('*').order('updated_at', { ascending: false });
                if (error) throw error;

                if (cloudData && cloudData.length > 0) {
                    if (!localData || !Array.isArray(localData)) {
                        localData = cloudData;
                    } else {
                        // Fusionner : garder l'item le plus récent (LWW)
                        const cloudMap = new Map(cloudData.map(r => [r.id, r]));
                        const localMap = new Map(localData.map(r => [r.id, r]));
                        const merged = [];
                        for (const id of new Set([...cloudMap.keys(), ...localMap.keys()])) {
                            const c = cloudMap.get(id), l = localMap.get(id);
                            if (c && l) {
                                merged.push(new Date(c.updated_at||0) >= new Date(l.updated_at||0) ? c : l);
                            } else {
                                merged.push(c || l);
                            }
                        }
                        localData = merged;
                    }
                    localStorage.setItem(localStorageKey, JSON.stringify(localData));
                }
            } catch (err) {
                console.error(`GourmetSync — Erreur chargement ${table}:`, err);
            }
        }
        return localData;
    },

    // ── SAUVEGARDER (Optimistic UI + timestamp LWW) ────────────────────────────
    async sauvegarder(table, item, localStorageKey) {
        const session = await gourmetSupabase.auth.getSession();
        const user = session.data.session?.user;
        if (user) item.user_id = user.id;
        item.updated_at = new Date().toISOString();

        // Mise à jour locale optimiste
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
                console.warn(`GourmetSync — Mise en queue ${table}:`, err.message);
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

    // ── QUEUE + RETRY EXPONENTIEL ─────────────────────────────────────────────
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
        if (this.queue.length === 0) return;
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
                else { console.error(`GourmetSync — Opération abandonnée (${MAX} tentatives):`, op); }
            }
        }

        this.queue = remaining;
        localStorage.setItem('gourmet_sync_queue', JSON.stringify(this.queue));
        this.updateOfflineBanner();
        if (remaining.length > 0) this._scheduleRetry();
    },

    async _replayOp(op) {
        if (!op?.table || !op?.action) return;
        try {
            if (op.action === 'upsert') await gourmetSupabase.from(op.table).upsert(op.data);
            if (op.action === 'delete') await gourmetSupabase.from(op.table).delete().eq('id', op.data?.id);
        } catch (e) { this.addToQueue(op.table, op.action, op.data); }
    },

    updateOfflineBanner() {
        const badge = document.getElementById('syncPendingBadge');
        const dot   = document.getElementById('offlineStatusDot');
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
                : 'Hors ligne — modifs sauvegardées localement';
        }
    },

    // ── MODULE RECETTES ───────────────────────────────────────────────────────
    async chargerRecettes() {
        const recettes = await this.charger('recettes', 'gourmet_recettes');
        if (recettes && navigator.onLine && window.gourmetSupabase) {
            for (let r of recettes) {
                try {
                    const { data: ing } = await gourmetSupabase
                        .from('recette_ingredients').select('*').eq('recette_id', r.id);
                    r.ingredients = ing || [];
                } catch (e) { r.ingredients = r.ingredients || []; }
            }
        }
        return recettes;
    },

    async sauvegarderRecette(recette) {
        const { ingredients, ...recetteData } = recette;
        await this.sauvegarder('recettes', recetteData, 'gourmet_recettes');
        if (ingredients?.length > 0) {
            const ings = ingredients.map(i => ({ ...i, recette_id: recette.id, updated_at: new Date().toISOString() }));
            if (navigator.onLine && window.gourmetSupabase) {
                try {
                    await gourmetSupabase.from('recette_ingredients').upsert(ings, { onConflict: 'id' });
                } catch (e) { ings.forEach(ing => this.addToQueue('recette_ingredients', 'upsert', ing)); }
            } else {
                ings.forEach(ing => this.addToQueue('recette_ingredients', 'upsert', ing));
            }
        }
    },

    // ── REALTIME ──────────────────────────────────────────────────────────────
    initRealtime() {
        if (!window.gourmetSupabase) return;
        gourmetSupabase.channel('stock-alerts')
            .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'ingredients' }, payload => {
                if (payload.new.stock_actuel <= payload.new.seuil_alerte)
                    if (typeof showToast === 'function') showToast(`⚠️ Stock critique : ${payload.new.name}`, 'warning');
            }).subscribe();
        gourmetSupabase.channel('new-orders')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'commandes' }, () => {
                if (typeof showToast === 'function') showToast(`🔔 Nouvelle commande reçue !`, 'success');
                if (typeof renderCommandes === 'function') renderCommandes();
            }).subscribe();
    },

    // ── MIGRATION localStorage → Supabase ────────────────────────────────────
    async migrerLocalStorageVersSupabase() {
        if (localStorage.getItem('gourmet_migration_done') === 'true') return;
        const user = (await gourmetSupabase.auth.getSession()).data.session?.user;
        if (!user) return;
        console.info('🚀 Migration localStorage → Supabase...');
        if (typeof showToast === 'function') showToast('Migration vers le Cloud... ⏳', 'info');
        const mappings = [
            { key: 'gourmet_recettes', table: 'recettes' },
            { key: 'gourmet_ingredients', table: 'ingredients' },
            { key: 'gourmet_haccp_temperatures', table: 'haccp_temperatures' },
            { key: 'gourmet_commandes', table: 'commandes' },
            { key: 'gourmet_clients', table: 'clients' },
            { key: 'gourmet_team_members', table: 'team_members' },
            { key: 'gourmet_staff_leaves', table: 'staff_leaves' },
            { key: 'gourmet_deliveries', table: 'deliveries' }
        ];
        for (const m of mappings) {
            const data = JSON.parse(localStorage.getItem(m.key) || '[]');
            if (Array.isArray(data) && data.length > 0) {
                for (const item of data) {
                    item.user_id = user.id;
                    item.updated_at = item.updated_at || new Date().toISOString();
                    await gourmetSupabase.from(m.table).upsert(item, { onConflict: 'id' });
                }
            }
        }
        localStorage.setItem('gourmet_migration_done', 'true');
        if (typeof showToast === 'function') showToast('✅ Migration terminée !', 'success');
    },

    // ── RESET DONNÉES ─────────────────────────────────────────────────────────
    async resetUserData(skipConfirm = false) {
        const { data: { session } } = await gourmetSupabase.auth.getSession();
        const user = session?.user;
        if (!user) return;
        if (!skipConfirm && !confirm('⚠️ Êtes-vous sûr de vouloir vider TOUTES vos données ?\n\nCette action est irréversible.')) return;
        if (typeof showToast === 'function') showToast('Nettoyage en cours... ⏳', 'info');

        const tables = ['recettes','recette_ingredients','commandes','clients','fournisseurs',
            'planning_production','haccp_temperatures','haccp_nettoyage','pertes','team_members','staff_leaves','deliveries'];
        for (const table of tables) {
            try { await gourmetSupabase.from(table).delete().eq('user_id', user.id); } catch (e) {}
        }
        try { await gourmetSupabase.from('ingredients').update({ stock_actuel: 0 }).eq('user_id', user.id); } catch (e) {}

        const userPrefix = (user.email.split('@')[0]).toLowerCase();
        const protectedKeys = ['gourmet_auth','gourmet_current_user','gourmet_demo_mode','gourmet_ingredient_db'];
        Object.keys(localStorage).forEach(key => {
            const k = key.toLowerCase();
            if (protectedKeys.includes(k)) return;
            if (k.includes('gourmet_inventory')) {
                try { const inv = JSON.parse(localStorage.getItem(key)||'[]'); inv.forEach(i => i.stock = 0); localStorage.setItem(key, JSON.stringify(inv)); } catch(e) {}
                return;
            }
            if (k.includes('gourmet') || k.includes('labpatiss') || k.includes(userPrefix)) localStorage.removeItem(key);
        });

        // Nettoyage forcé des clés spécifiques à l'utilisateur qui pourraient avoir été oubliées
        localStorage.removeItem(`gourmet_team_members_${userPrefix}`);
        localStorage.removeItem(`gourmet_staff_leaves_${userPrefix}`);
        localStorage.removeItem(`gourmet_deliveries`);
        localStorage.removeItem(`gourmet_production_plan`);
        localStorage.removeItem(`gourmet_custom_priorities_${userPrefix}`);

        if (typeof showToast === 'function') showToast('✅ Espace de travail réinitialisé.', 'success');
        setTimeout(() => window.location.reload(), 1200);
    },

    // ── SUPPRESSION RGPD COMPLÈTE ────────────────────────────────────────────
    /**
     * resetCloudData — Vide les données métier du Cloud (sauf Profil/Subscription)
     * Utile pour "Vider mes données" sans supprimer le compte.
     */
    async resetCloudData() {
        const { data: { session } } = await gourmetSupabase.auth.getSession();
        const user = session?.user;
        if (!user) return;

        const tablesToDelete = [
            'recette_ingredients', 'recettes', 'commandes', 'clients',
            'fournisseurs', 'planning_production', 'haccp_temperatures',
            'haccp_nettoyage', 'pertes', 'staff_leaves', 'team_members', 'deliveries'
        ];

        for (const table of tablesToDelete) {
            try {
                await gourmetSupabase.from(table).delete().eq('user_id', user.id);
            } catch (e) { console.warn(`resetCloudData — ${table}:`, e); }
        }

        try {
            await gourmetSupabase.from('ingredients').update({ 
                stock_actuel: 0,
                updated_at: new Date().toISOString()
            }).eq('user_id', user.id);
        } catch (e) { console.warn(`resetCloudData — ingredients:`, e); }
    },

    /**
     * deleteFullAccount — Art. 17 RGPD (Droit à l'effacement)
     * Nettoie en cascade toutes les tables + localStorage + ferme la session.
     */
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
            '• Recettes, ingrédients, inventaire\n' +
            '• CRM (clients, commandes, fournisseurs)\n' +
            '• Planning, HACCP, profil\n\n' +
            'Continuez ?'
        );
        if (!ok1) return false;

        const confirmText = prompt('Tapez "SUPPRIMER" (en majuscules) pour confirmer :');
        if (confirmText !== 'SUPPRIMER') {
            if (typeof showToast === 'function') showToast('Suppression annulée.', 'info');
            return false;
        }

        if (typeof showToast === 'function') showToast('🗑️ Suppression en cours... ⏳', 'info');

        const cascadeTables = [
            'recette_ingredients', 'recettes', 'ingredients',
            'commandes', 'clients', 'fournisseurs',
            'planning_production', 'haccp_temperatures', 'haccp_nettoyage',
            'pertes', 'team_members', 'staff_leaves',
            'subscriptions', 'profiles'
        ];

        for (const table of cascadeTables) {
            try {
                const { error } = await gourmetSupabase.from(table).delete().eq('user_id', user.id);
                if (error && !error.message?.includes('does not exist'))
                    console.warn(`deleteFullAccount — ${table}:`, error.message);
            } catch (e) { console.warn(`deleteFullAccount — ${table}:`, e.message); }
        }

        // Nettoyage localStorage intégral
        const toRemove = Object.keys(localStorage).filter(k =>
            k.toLowerCase().includes('gourmet') ||
            k.toLowerCase().includes('labpatiss') ||
            k.toLowerCase().includes('gourmetrevient')
        );
        toRemove.forEach(k => localStorage.removeItem(k));
        this.queue = [];
        localStorage.removeItem('gourmet_sync_queue');

        // Fermer la session
        await gourmetSupabase.auth.signOut();

        if (typeof showToast === 'function') showToast('✅ Compte supprimé définitivement. Au revoir !', 'success');
        setTimeout(() => { window.location.href = './landing.html'; }, 2000);
        return true;
    }
};

window.GourmetSync = GourmetSync;
GourmetSync.init();
GourmetSync.initRealtime();
