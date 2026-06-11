/**
 * GOURMETREVIENT — Supabase Sync Engine v4.0 (Cloud-First & Omnipresent)
 * ============================================================
 * ✅ 100% cloud-first, real-time bidirectional synchronization
 * ✅ Full bidirectional mappings for all 10 tables:
 *    recipes, ingredients, clients, commandes, fournisseurs,
 *    planning_production, haccp_temperatures, haccp_nettoyage,
 *    pertes, team_members, staff_leaves, deliveries
 * ✅ Automatic client-side RFC4122 UUID generation
 * ✅ Graceful localstorage caching & optimistic updates
 * ✅ Offline resilience with exponential backoff retry queue
 * ✅ Row Level Security (RLS) isolation by user_id
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
    // UTILITAIRES & UUID
    // ══════════════════════════════════════════════════════════════

    /**
     * Génère un UUID RFC4122 v4 robuste
     */
    uuid() {
        if (typeof self.crypto !== 'undefined' && typeof self.crypto.randomUUID === 'function') {
            return self.crypto.randomUUID();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },

    /**
     * Formate une date string en YYYY-MM-DD pour PostgreSQL
     */
    _formatDateToSQL(dateStr) {
        if (!dateStr) return new Date().toISOString().substring(0, 10);
        if (dateStr.includes('/')) {
            const parts = dateStr.split('/');
            if (parts.length === 3) {
                const day = parts[0].padStart(2, '0');
                const month = parts[1].padStart(2, '0');
                const year = parts[2];
                return `${year}-${month}-${day}`;
            }
        }
        return dateStr.substring(0, 10);
    },

    // ══════════════════════════════════════════════════════════════
    // MAPPINGS : App Object ↔ Ligne Supabase
    // ══════════════════════════════════════════════════════════════

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
            costs: {
                ...(recipe.costs || {}),
                margin: recipe.margin || 70,
                advanced: recipe.advanced || null,
                savedAt: recipe.savedAt || new Date().toISOString()
            },
            updated_at: new Date().toISOString()
        };
    },

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

    _clientToRow(client, userId) {
        const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        return {
            id: (!client.id || !isValidUUID(client.id)) ? this.uuid() : client.id,
            user_id: userId,
            nom: client.name,
            contact: client.contact || '',
            notes: client.notes || '',
            updated_at: new Date().toISOString()
        };
    },

    _rowToClient(row) {
        return {
            id: row.id,
            name: row.nom,
            contact: row.contact || '',
            notes: row.notes || ''
        };
    },

    _orderToRow(order, userId) {
        const statusMap = {
            pending: 'en_attente',
            paid: 'confirme',
            delivered: 'livre'
        };
        const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const clientId = isValidUUID(order.clientId) ? order.clientId : null;

        return {
            id: (!order.id || !isValidUUID(order.id)) ? this.uuid() : order.id,
            user_id: userId,
            client_id: clientId,
            produits: [order.products || ''],
            prix_total: parseFloat(order.price) || 0,
            statut: statusMap[order.status] || 'en_attente',
            date_livraison: order.date ? order.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
            notes: JSON.stringify({
                originalDate: order.date || '',
                originalProducts: order.products || '',
                originalNotes: order.notes || '',
                originalClientId: order.clientId || ''
            }),
            updated_at: new Date().toISOString()
        };
    },

    _rowToOrder(row) {
        const statusMap = {
            en_attente: 'pending',
            confirme: 'paid',
            livre: 'delivered',
            en_cours: 'pending',
            annule: 'pending'
        };
        let originalDate = row.date_livraison || '';
        let products = Array.isArray(row.produits) ? row.produits[0] : '';
        let notes = '';
        try {
            if (row.notes && row.notes.startsWith('{')) {
                const parsed = JSON.parse(row.notes);
                if (parsed.originalDate) originalDate = parsed.originalDate;
                if (parsed.originalProducts) products = parsed.originalProducts;
                if (parsed.originalNotes) notes = parsed.originalNotes;
            } else {
                notes = row.notes || '';
            }
        } catch (e) {
            notes = row.notes || '';
        }
        return {
            id: row.id,
            clientId: row.client_id || '',
            products: products || '',
            date: originalDate,
            price: (row.prix_total || 0).toString(),
            status: statusMap[row.statut] || 'pending',
            notes: notes
        };
    },

    /**
     * Maps a catering quote (from crm-enhanced-v2.js) to a commandes row.
     * Uses statut='en_attente' and stores isQuote:true in the notes JSON.
     */
    _quoteToRow(quote, userId) {
        const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        // Ensure the quote has a stable UUID — the quote.id might be a doc number like "DEV-001"
        const stableId = (quote._syncId && isValidUUID(quote._syncId)) ? quote._syncId : this.uuid();
        const clientId = (quote.clientId && isValidUUID(quote.clientId)) ? quote.clientId : null;
        return {
            id: stableId,
            user_id: userId,
            client_id: clientId,
            produits: [quote.clientName || 'Devis catering'],
            prix_total: parseFloat(quote.totalTTC) || 0,
            statut: 'en_attente',
            date_livraison: quote.date ? quote.date.substring(0, 10) : new Date().toISOString().substring(0, 10),
            notes: JSON.stringify({
                isQuote: true,
                quoteId: quote.id,
                clientName: quote.clientName || '',
                clientId: quote.clientId || '',
                date: quote.date || '',
                validity: quote.validity || 30,
                notes: quote.notes || '',
                shopAddr: quote.shopAddr || '',
                type: quote.type || 'devis',
                lines: quote.lines || [],
                eventType: quote.eventType || '',
                deliveryDetails: quote.deliveryDetails || '',
                eventTheme: quote.eventTheme || '',
                deliveryCost: quote.deliveryCost || 0,
                staffingCost: quote.staffingCost || 0,
                eventOverheads: quote.eventOverheads || 0,
                totalTTC: quote.totalTTC || 0
            }),
            updated_at: new Date().toISOString()
        };
    },

    /**
     * Maps a commandes row (with isQuote=true in notes) back to a quote object.
     */
    _rowToQuote(row) {
        let quoteData = {};
        try {
            if (row.notes && row.notes.startsWith('{')) {
                quoteData = JSON.parse(row.notes);
            }
        } catch (e) {}
        return {
            _syncId: row.id,           // The stable Supabase UUID
            id: quoteData.quoteId || row.id,  // The user-facing doc number
            clientId: quoteData.clientId || row.client_id || '',
            clientName: quoteData.clientName || '',
            date: quoteData.date || row.date_livraison || '',
            validity: quoteData.validity || 30,
            notes: quoteData.notes || '',
            shopAddr: quoteData.shopAddr || '',
            type: quoteData.type || 'devis',
            lines: quoteData.lines || [],
            eventType: quoteData.eventType || '',
            deliveryDetails: quoteData.deliveryDetails || '',
            eventTheme: quoteData.eventTheme || '',
            deliveryCost: quoteData.deliveryCost || 0,
            staffingCost: quoteData.staffingCost || 0,
            eventOverheads: quoteData.eventOverheads || 0,
            totalTTC: quoteData.totalTTC || row.prix_total || 0
        };
    },

    _supplierToRow(supplier, userId) {
        let rating = Math.round(supplier.rating || supplier.note || 5);
        if (rating < 1) rating = 1;
        if (rating > 5) rating = 5;
        return {
            id: (typeof supplier.id !== 'string' || supplier.id.startsWith('sup_') || !supplier.id.includes('-')) ? this.uuid() : supplier.id,
            user_id: userId,
            nom: supplier.name,
            categorie: Array.isArray(supplier.categories) ? supplier.categories.join(', ') : (supplier.categories || 'Général'),
            contact: supplier.contact || '',
            email: supplier.email || '',
            telephone: supplier.contact || '',
            note: rating,
            updated_at: new Date().toISOString()
        };
    },

    _rowToSupplier(row) {
        return {
            id: row.id,
            name: row.nom,
            contact: row.contact || '',
            email: row.email || '',
            categories: row.categorie ? row.categorie.split(',').map(s => s.trim()) : ['Général'],
            rating: row.note || 5,
            leadTime: 3
        };
    },

    _planningToRow(item, userId) {
        const statusMap = {
            todo: 'planifie',
            ongoing: 'en_cours',
            done: 'termine'
        };
        const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const recipeId = isValidUUID(item.recipeId) ? item.recipeId : null;

        return {
            id: (!item.id || item.id.startsWith('plan_')) ? this.uuid() : item.id,
            user_id: userId,
            recette_id: recipeId,
            quantite: parseInt(item.qty) || 1,
            date_prod: this._formatDateToSQL(item.date),
            statut: statusMap[item.status] || 'planifie',
            notes: JSON.stringify({
                name: item.name || '',
                originalRecipeId: item.recipeId || ''
            }),
            updated_at: new Date().toISOString()
        };
    },

    _rowToPlanning(row) {
        const statusMap = {
            planifie: 'todo',
            en_cours: 'ongoing',
            termine: 'done',
            annule: 'todo'
        };
        let name = 'Recette';
        let recipeId = row.recette_id || '';
        try {
            if (row.notes && row.notes.startsWith('{')) {
                const parsed = JSON.parse(row.notes);
                if (parsed.name) name = parsed.name;
                if (parsed.originalRecipeId) recipeId = parsed.originalRecipeId;
            }
        } catch (e) {}
        return {
            id: row.id,
            name: name,
            recipeId: recipeId,
            qty: row.quantite || 1,
            status: statusMap[row.statut] || 'todo',
            date: row.date_prod
        };
    },

    _tempToRow(log, userId) {
        const val = parseFloat(log.val);
        const isWarn = val > 5 || val < -22;
        return {
            id: (!log.id || log.id.startsWith('t_')) ? this.uuid() : log.id,
            user_id: userId,
            equipement: log.equipKey || 'haccp.equip.frigo1',
            temperature: isNaN(val) ? 0 : val,
            conforme: !isWarn,
            notes: JSON.stringify({
                user: log.user || '',
                action: log.action || null,
                shift: log.shift || 'matin'
            }),
            releve_at: log.date || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    },

    _rowToTemp(row) {
        let user = 'Chef';
        let action = null;
        let shift = 'matin';
        try {
            if (row.notes && row.notes.startsWith('{')) {
                const parsed = JSON.parse(row.notes);
                user = parsed.user || 'Chef';
                action = parsed.action || null;
                shift = parsed.shift || 'matin';
            }
        } catch(e) {}
        return {
            id: row.id,
            date: row.releve_at || row.created_at,
            equipKey: row.equipement,
            val: parseFloat(row.temperature),
            user: user,
            action: action,
            shift: shift
        };
    },

    _cleanToRow(task, userId) {
        return {
            id: (!task.id || (task.id.startsWith('c') && !task.id.includes('-'))) ? this.uuid() : task.id,
            user_id: userId,
            zone: task.areaKey || 'haccp.clean.c1',
            tache: task.icon || '🧼',
            effectue: !!task.done,
            date_prevue: new Date().toISOString().substring(0, 10),
            updated_at: new Date().toISOString()
        };
    },

    _rowToClean(row) {
        return {
            id: row.id,
            areaKey: row.zone,
            done: !!row.effectue,
            icon: row.tache || '🧼'
        };
    },

    _wasteToRow(log, userId) {
        return {
            id: (!log.id || log.id.startsWith('perte_')) ? this.uuid() : log.id,
            user_id: userId,
            produit: log.recipeName || 'Recette',
            quantite: parseFloat(log.qty) || 0,
            unite: 'portions',
            motif: JSON.stringify({
                reason: log.reason || 'invendu',
                notes: log.notes || '',
                recipeId: log.recipeId || ''
            }),
            cout: parseFloat(log.lossValue) || 0,
            created_at: log.date || new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
    },

    _rowToWaste(row) {
        let reason = 'invendu';
        let notes = '';
        let recipeId = '';
        try {
            if (row.motif && row.motif.startsWith('{')) {
                const parsed = JSON.parse(row.motif);
                reason = parsed.reason || 'invendu';
                notes = parsed.notes || '';
                recipeId = parsed.recipeId || '';
            } else {
                reason = row.motif || 'invendu';
            }
        } catch(e) {
            reason = row.motif || 'invendu';
        }
        return {
            id: row.id,
            date: row.created_at,
            recipeId: recipeId,
            recipeName: row.produit,
            qty: parseFloat(row.quantite || 0),
            reason: reason,
            notes: notes,
            lossValue: parseFloat(row.cout || 0)
        };
    },

    _memberToRow(member, userId) {
        return {
            id: (!member.id || member.id.startsWith('team_') || !member.id.includes('-')) ? this.uuid() : member.id,
            user_id: userId,
            name: member.name,
            role: member.role || 'Consultant',
            avatar: (member.colorIdx !== undefined ? member.colorIdx : 0).toString(),
            updated_at: new Date().toISOString()
        };
    },

    _rowToMember(row) {
        return {
            id: row.id,
            name: row.name,
            role: row.role || 'Consultant',
            colorIdx: parseInt(row.avatar) || 0
        };
    },

    _leaveToRow(leave, userId) {
        const isValidUUID = (str) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
        const memberId = isValidUUID(leave.memberId) ? leave.memberId : null;
        return {
            id: (!leave.id || leave.id.startsWith('leave_') || !leave.id.includes('-')) ? this.uuid() : leave.id,
            user_id: userId,
            member_id: memberId,
            member_name: leave.memberName,
            start_date: this._formatDateToSQL(leave.startDate),
            end_date: this._formatDateToSQL(leave.endDate),
            reason: JSON.stringify({
                originalReason: leave.reason || '',
                originalMemberId: leave.memberId || ''
            }),
            updated_at: new Date().toISOString()
        };
    },

    _rowToLeave(row) {
        let reason = '';
        let memberId = row.member_id || '';
        try {
            if (row.reason && row.reason.startsWith('{')) {
                const parsed = JSON.parse(row.reason);
                reason = parsed.originalReason || '';
                memberId = parsed.originalMemberId || row.member_id || '';
            } else {
                reason = row.reason || '';
            }
        } catch(e) {
            reason = row.reason || '';
        }
        return {
            id: row.id,
            memberId: memberId,
            memberName: row.member_name,
            startDate: row.start_date,
            endDate: row.end_date,
            reason: reason
        };
    },

    _deliveryToRow(d, userId) {
        return {
            id: (!d.id || d.id.startsWith('del_') || !d.id.includes('-')) ? this.uuid() : d.id,
            user_id: userId,
            supplier: d.supplier,
            eta: d.eta || '',
            items: d.items || '',
            status: d.status || 'planned',
            delivery_date: d.delivery_date || new Date().toISOString().substring(0, 10),
            updated_at: new Date().toISOString()
        };
    },

    _rowToDelivery(row) {
        return {
            id: row.id,
            supplier: row.supplier,
            eta: row.eta || '',
            items: row.items || '',
            status: row.status || 'planned',
            delivery_date: row.delivery_date
        };
    },

    // ══════════════════════════════════════════════════════════════
    // MÉTHODES DE CHARGEMENT GÉNÉRIQUES ET SPÉCIALISÉES
    // ══════════════════════════════════════════════════════════════

    async chargerTable(table, rowConverter) {
        if (!navigator.onLine || !window.gourmetSupabase) return null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return null;

            const { data, error } = await gourmetSupabase
                .from(table)
                .select('*')
                .eq('user_id', session.user.id);

            if (error) throw error;
            return (data || []).map(row => rowConverter(row));
        } catch (err) {
            console.error(`[GourmetSync] Erreur chargement ${table}:`, err.message);
            return null;
        }
    },

    async chargerRecettes() {
        return this.chargerTable('recipes', row => this._rowToRecipe(row));
    },

    async chargerClients() {
        return this.chargerTable('clients', row => this._rowToClient(row));
    },

    async chargerCommandes() {
        // Exclude rows that are catering quotes (isQuote flag in notes JSON)
        if (!navigator.onLine || !window.gourmetSupabase) return null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return null;
            const { data, error } = await gourmetSupabase
                .from('commandes')
                .select('*')
                .eq('user_id', session.user.id);
            if (error) throw error;
            return (data || [])
                .filter(row => {
                    try {
                        if (!row.notes || !row.notes.startsWith('{')) return true;
                        const parsed = JSON.parse(row.notes);
                        return !parsed.isQuote;
                    } catch (e) { return true; }
                })
                .map(row => this._rowToOrder(row));
        } catch (err) {
            console.error('[GourmetSync] Erreur chargement commandes:', err.message);
            return null;
        }
    },

    async chargerDevis() {
        // Load only rows that are catering quotes (isQuote=true in notes)
        if (!navigator.onLine || !window.gourmetSupabase) return null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return null;
            const { data, error } = await gourmetSupabase
                .from('commandes')
                .select('*')
                .eq('user_id', session.user.id);
            if (error) throw error;
            return (data || [])
                .filter(row => {
                    try {
                        if (!row.notes || !row.notes.startsWith('{')) return false;
                        const parsed = JSON.parse(row.notes);
                        return parsed.isQuote === true;
                    } catch (e) { return false; }
                })
                .map(row => this._rowToQuote(row));
        } catch (err) {
            console.error('[GourmetSync] Erreur chargement devis:', err.message);
            return null;
        }
    },

    async chargerFournisseurs() {
        return this.chargerTable('fournisseurs', row => this._rowToSupplier(row));
    },

    async chargerPlanning() {
        return this.chargerTable('planning_production', row => this._rowToPlanning(row));
    },

    async chargerTemps() {
        return this.chargerTable('haccp_temperatures', row => this._rowToTemp(row));
    },

    async chargerNettoyage() {
        return this.chargerTable('haccp_nettoyage', row => this._rowToClean(row));
    },

    async chargerPertes() {
        return this.chargerTable('pertes', row => this._rowToWaste(row));
    },

    async chargerTeam() {
        return this.chargerTable('team_members', row => this._rowToMember(row));
    },

    async chargerLeaves() {
        return this.chargerTable('staff_leaves', row => this._rowToLeave(row));
    },

    async chargerDeliveries() {
        return this.chargerTable('deliveries', row => this._rowToDelivery(row));
    },

    // ══════════════════════════════════════════════════════════════
    // SAUVEGARDE & SUPPRESSION DES MODULES
    // ══════════════════════════════════════════════════════════════

    async sauvegarderRecette(recipe) {
        if (!window.gourmetSupabase) return;
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._recipeToRow(recipe, userId);
            await this.sauvegarderRow('recipes', row);
        } catch (err) {
            if (!row) row = this._recipeToRow(recipe, 'offline');
            this.addToQueue('recipes', 'upsert', row);
        }
    },

    async supprimerRecette(id) {
        await this.supprimerRow('recipes', id);
    },

    async sauvegarderClient(client) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._clientToRow(client, userId);
            client.id = row.id; // Garder la même id locale
            await this.sauvegarderRow('clients', row);
        } catch (e) {
            if (!row) row = this._clientToRow(client, 'offline');
            this.addToQueue('clients', 'upsert', row);
        }
    },

    async supprimerClient(id) {
        await this.supprimerRow('clients', id);
    },

    async sauvegarderCommande(order) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._orderToRow(order, userId);
            order.id = row.id;
            await this.sauvegarderRow('commandes', row);
        } catch (e) {
            if (!row) row = this._orderToRow(order, 'offline');
            this.addToQueue('commandes', 'upsert', row);
        }
    },

    async supprimerCommande(id) {
        await this.supprimerRow('commandes', id);
    },

    async sauvegarderDevis(quote) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._quoteToRow(quote, userId);
            quote._syncId = row.id;
            await this.sauvegarderRow('commandes', row);
        } catch (e) {
            console.warn('[GourmetSync] sauvegarderDevis échoué, mise en queue:', e.message);
            if (!row) row = this._quoteToRow(quote, 'offline');
            this.addToQueue('commandes', 'upsert', row);
        }
    },

    async supprimerDevis(quote) {
        // quote may be the full object (with _syncId) or just an id string
        const syncId = (quote && quote._syncId) ? quote._syncId : null;
        const docId  = (quote && quote.id)      ? quote.id      : (typeof quote === 'string' ? quote : null);
        // If we have the stable Supabase UUID, delete by that
        if (syncId) {
            await this.supprimerRow('commandes', syncId);
        } else if (docId) {
            // Fallback: try to find the row by scanning notes
            try {
                const { data: { session } } = await gourmetSupabase.auth.getSession();
                if (!session?.user?.id) return;
                const { data } = await gourmetSupabase
                    .from('commandes')
                    .select('id, notes')
                    .eq('user_id', session.user.id);
                const match = (data || []).find(row => {
                    try {
                        const parsed = JSON.parse(row.notes || '{}');
                        return parsed.isQuote && parsed.quoteId === docId;
                    } catch (e) { return false; }
                });
                if (match) await this.supprimerRow('commandes', match.id);
            } catch (e) {}
        }
    },

    async sauvegarderFournisseur(supplier) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._supplierToRow(supplier, userId);
            supplier.id = row.id;
            await this.sauvegarderRow('fournisseurs', row);
        } catch (e) {
            if (!row) row = this._supplierToRow(supplier, 'offline');
            this.addToQueue('fournisseurs', 'upsert', row);
        }
    },

    async supprimerFournisseur(id) {
        await this.supprimerRow('fournisseurs', id);
    },

    async sauvegarderPlanning(item) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._planningToRow(item, userId);
            item.id = row.id;
            await this.sauvegarderRow('planning_production', row);
        } catch (e) {
            if (!row) row = this._planningToRow(item, 'offline');
            this.addToQueue('planning_production', 'upsert', row);
        }
    },

    async supprimerPlanning(id) {
        await this.supprimerRow('planning_production', id);
    },

    async sauvegarderTemp(log) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._tempToRow(log, userId);
            log.id = row.id;
            await this.sauvegarderRow('haccp_temperatures', row);
        } catch (e) {
            if (!row) row = this._tempToRow(log, 'offline');
            this.addToQueue('haccp_temperatures', 'upsert', row);
        }
    },

    async supprimerTemp(id) {
        await this.supprimerRow('haccp_temperatures', id);
    },

    async sauvegarderNettoyage(task) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._cleanToRow(task, userId);
            task.id = row.id;
            await this.sauvegarderRow('haccp_nettoyage', row);
        } catch (e) {
            if (!row) row = this._cleanToRow(task, 'offline');
            this.addToQueue('haccp_nettoyage', 'upsert', row);
        }
    },

    async supprimerNettoyage(id) {
        await this.supprimerRow('haccp_nettoyage', id);
    },

    async sauvegarderPerte(log) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._wasteToRow(log, userId);
            log.id = row.id;
            await this.sauvegarderRow('pertes', row);
        } catch (e) {
            if (!row) row = this._wasteToRow(log, 'offline');
            this.addToQueue('pertes', 'upsert', row);
        }
    },

    async supprimerPerte(id) {
        await this.supprimerRow('pertes', id);
    },

    async sauvegarderMember(member) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._memberToRow(member, userId);
            member.id = row.id;
            await this.sauvegarderRow('team_members', row);
        } catch (e) {
            if (!row) row = this._memberToRow(member, 'offline');
            this.addToQueue('team_members', 'upsert', row);
        }
    },

    async supprimerMember(id) {
        await this.supprimerRow('team_members', id);
    },

    async sauvegarderLeave(leave) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._leaveToRow(leave, userId);
            leave.id = row.id;
            await this.sauvegarderRow('staff_leaves', row);
        } catch (e) {
            if (!row) row = this._leaveToRow(leave, 'offline');
            this.addToQueue('staff_leaves', 'upsert', row);
        }
    },

    async supprimerLeave(id) {
        await this.supprimerRow('staff_leaves', id);
    },

    async sauvegarderDelivery(d) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._deliveryToRow(d, userId);
            d.id = row.id;
            await this.sauvegarderRow('deliveries', row);
        } catch (e) {
            if (!row) row = this._deliveryToRow(d, 'offline');
            this.addToQueue('deliveries', 'upsert', row);
        }
    },

    async supprimerDelivery(id) {
        await this.supprimerRow('deliveries', id);
    },

    // ── GESTION DE SYNCHRONISATION DES INGRÉDIENTS (STOCKS) ────────
    _ingredientToRow(item, userId) {
        return {
            id: item.id,
            user_id: userId,
            nom: item.name,
            stock_actuel: parseFloat(item.stock) || 0,
            unite: item.unit,
            prix_unitaire: parseFloat(item.price) || 0,
            seuil_alerte: parseFloat(item.alertThreshold) || 0,
            updated_at: new Date().toISOString()
        };
    },

    async sauvegarderIngredient(item) {
        let row = null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            const userId = session?.user?.id || 'offline';
            row = this._ingredientToRow(item, userId);
            await this.sauvegarderRow('ingredients', row);
        } catch (e) {
            if (!row) row = this._ingredientToRow(item, 'offline');
            this.addToQueue('ingredients', 'upsert', row);
        }
    },

    async supprimerIngredient(id) {
        await this.supprimerRow('ingredients', id);
    },

    // ══════════════════════════════════════════════════════════════
    // SAUVEGARDE GÉNÉRIQUE ÉCRITURE (Rows directs)
    // ══════════════════════════════════════════════════════════════

    async sauvegarderRow(table, row) {
        if (navigator.onLine && window.gourmetSupabase) {
            try {
                const { error } = await gourmetSupabase.from(table).upsert(row, { onConflict: 'id' });
                if (error) throw error;
            } catch (err) {
                console.warn(`[GourmetSync] Upsert échoué pour ${table}, mise en queue...`, err.message);
                this.addToQueue(table, 'upsert', row);
            }
        } else {
            this.addToQueue(table, 'upsert', row);
        }
    },

    async supprimerRow(table, id) {
        if (navigator.onLine && window.gourmetSupabase) {
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

    // ── Pour compatibilité avec les anciens modules de base ────────
    async sauvegarder(table, item, localStorageKey) {
        if (!window.gourmetSupabase) return;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (session?.user?.id) item.user_id = session.user.id;
        } catch (e) {}
        item.updated_at = new Date().toISOString();

        if (localStorageKey) {
            try {
                const cached = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                const idx = cached.findIndex(r => r.id === item.id);
                if (idx >= 0) cached[idx] = item; else cached.unshift(item);
                localStorage.setItem(localStorageKey, JSON.stringify(cached));
            } catch (e) {}
        }
        await this.sauvegarderRow(table, item);
    },

    async supprimer(table, id, localStorageKey) {
        if (localStorageKey) {
            try {
                const cached = JSON.parse(localStorage.getItem(localStorageKey) || '[]');
                localStorage.setItem(localStorageKey, JSON.stringify(cached.filter(r => r.id !== id)));
            } catch (e) {}
        }
        await this.supprimerRow(table, id);
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

        let currentUserId = null;
        try {
            if (window.gourmetSupabase) {
                const { data: { session } } = await gourmetSupabase.auth.getSession();
                currentUserId = session?.user?.id || null;
            }
        } catch (e) {
            console.warn('[GourmetSync] processQueue could not fetch session:', e.message);
        }

        const MAX = 5;
        const remaining = [];

        for (const op of this.queue) {
            const backoffMs = Math.pow(2, op.attempts || 0) * 1000;
            if (op.attempts > 0 && (Date.now() - (op.timestamp || 0)) < backoffMs) {
                remaining.push(op); continue;
            }
            try {
                // Dynamic mapping of 'offline' user_id to actual authenticated user_id
                if (op.data && op.data.user_id === 'offline' && currentUserId) {
                    op.data.user_id = currentUserId;
                }

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

        const uid = () => localStorage.getItem('gourmet_user_id');
        const isMine = (payload) => {
            const myUid = uid();
            const changedUid = payload.new?.user_id || payload.old?.user_id;
            return !myUid || !changedUid || myUid === changedUid;
        };

        // ── Recettes ───────────────────────────
        gourmetSupabase.channel('recipes-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'recipes' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Recette modifiée');
                if (typeof loadSavedRecipes === 'function') {
                    await loadSavedRecipes();
                    if (typeof renderRecipeList === 'function') renderRecipeList();
                    if (typeof updateDashboard === 'function') updateDashboard();
                }
            }).subscribe();

        // ── Inventaire ────────────────────────
        gourmetSupabase.channel('ingredients-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'ingredients' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Inventaire modifié');
                if (typeof loadInventory === 'function') {
                    await loadInventory();
                    if (typeof renderInventory === 'function') renderInventory();
                }
            }).subscribe();

        // ── Clients CRM ──────────────────────
        gourmetSupabase.channel('clients-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Clients CRM modifiés');
                if (typeof loadCrm === 'function') {
                    await loadCrm();
                    if (typeof renderCrmClients === 'function') renderCrmClients();
                }
            }).subscribe();

        // ── Commandes ────────────────────────
        gourmetSupabase.channel('commandes-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'commandes' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Commandes modifiées');
                if (typeof loadCrm === 'function') {
                    await loadCrm();
                    if (typeof renderCrmOrders === 'function') renderCrmOrders();
                }
            }).subscribe();

        // ── Fournisseurs ──────────────────────
        gourmetSupabase.channel('fournisseurs-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'fournisseurs' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Fournisseurs modifiés');
                if (typeof loadSuppliers === 'function') {
                    await loadSuppliers();
                    if (typeof renderSuppliers === 'function') renderSuppliers();
                }
            }).subscribe();

        // ── Planning ─────────────────────────
        gourmetSupabase.channel('planning-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'planning_production' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Planning modifié');
                if (typeof renderProductionPlan === 'function') renderProductionPlan();
            }).subscribe();

        // ── HACCP Températures ────────────────
        gourmetSupabase.channel('haccp-temp-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'haccp_temperatures' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] HACCP Températures modifiées');
                if (typeof loadHaccpLogs === 'function') {
                    await loadHaccpLogs();
                    if (typeof renderTempLogs === 'function') renderTempLogs();
                }
            }).subscribe();

        // ── HACCP Nettoyage ───────────────────
        gourmetSupabase.channel('haccp-clean-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'haccp_nettoyage' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] HACCP Nettoyage modifié');
                if (typeof loadHaccpLogs === 'function') {
                    await loadHaccpLogs();
                    if (typeof renderCleaningChecklist === 'function') renderCleaningChecklist();
                }
            }).subscribe();

        // ── Pertes ────────────────────────────
        gourmetSupabase.channel('pertes-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'pertes' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Pertes modifiées');
                if (typeof loadWasteLogs === 'function') {
                    await loadWasteLogs();
                    if (typeof renderWasteAnalysis === 'function') renderWasteAnalysis();
                }
            }).subscribe();

        // ── Équipe ────────────────────────────
        gourmetSupabase.channel('team-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'team_members' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Équipe modifiée');
                if (typeof loadTeamMembers === 'function') {
                    await loadTeamMembers();
                    if (typeof renderTeam === 'function') renderTeam();
                }
            }).subscribe();

        // ── Congés ────────────────────────────
        gourmetSupabase.channel('leaves-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'staff_leaves' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Absences modifiées');
                if (typeof loadTeamMembers === 'function') {
                    await loadTeamMembers();
                    if (typeof renderTeam === 'function') renderTeam();
                }
            }).subscribe();

        // ── Radar Logistique ──────────────────
        gourmetSupabase.channel('deliveries-realtime')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'deliveries' }, async (payload) => {
                if (!isMine(payload)) return;
                console.info('[Realtime] Radar logistique modifié');
                if (window.LogisticsManager && typeof window.LogisticsManager.hydrateLogistics === 'function') {
                    window.LogisticsManager.hydrateLogistics();
                }
            }).subscribe();
    },

    // ══════════════════════════════════════════════════════════════
    // MIGRATION localStorage → Supabase (exécutée une seule fois)
    // ══════════════════════════════════════════════════════════════

    async migrerLocalStorageVersSupabase() {
        if (localStorage.getItem('gourmet_migration_done_v4') === 'true') return;
        if (!window.gourmetSupabase) return;

        const { data: { session } } = await gourmetSupabase.auth.getSession();
        if (!session?.user?.id) return;

        const uid = session.user.id;
        console.info('🚀 Migration localStorage → Supabase v4 en cours...');
        if (typeof showToast === 'function') showToast('Synchronisation Cloud Globale... ⏳', 'info');

        // 1. Recettes
        const newRecKey = `gourmet_recettes_${uid}`;
        const owner = localStorage.getItem('gourmet_current_user') || '';
        const oldRecKey = `gourmetrevient_recipes_${owner.toLowerCase()}`;
        const localRecipes = JSON.parse(localStorage.getItem(newRecKey) || localStorage.getItem(oldRecKey) || '[]');
        if (localRecipes.length > 0) {
            const { data: ext } = await gourmetSupabase.from('recipes').select('id').eq('user_id', uid);
            const extIds = new Set((ext || []).map(r => r.id));
            for (const r of localRecipes) {
                if (extIds.has(r.id)) continue;
                try {
                    await gourmetSupabase.from('recipes').upsert(this._recipeToRow(r, uid));
                } catch(e){}
            }
        }

        // 2. CRM & Commandes
        const localCrm = JSON.parse(localStorage.getItem('gourmet_crm_data') || '{"clients":[],"orders":[]}');
        if (localCrm.clients && localCrm.clients.length > 0) {
            for (const c of localCrm.clients) {
                try {
                    await gourmetSupabase.from('clients').upsert(this._clientToRow(c, uid));
                } catch(e){}
            }
        }
        if (localCrm.orders && localCrm.orders.length > 0) {
            for (const o of localCrm.orders) {
                try {
                    await gourmetSupabase.from('commandes').upsert(this._orderToRow(o, uid));
                } catch(e){}
            }
        }

        // 3. Fournisseurs
        const localSuppliers = JSON.parse(localStorage.getItem('gourmet_suppliers') || '[]');
        if (localSuppliers.length > 0) {
            for (const s of localSuppliers) {
                // Pas les démos par défaut (id numérique 1-8)
                if (typeof s.id === 'number' && s.id <= 8) continue;
                try {
                    await gourmetSupabase.from('fournisseurs').upsert(this._supplierToRow(s, uid));
                } catch(e){}
            }
        }

        // 4. Planning de Production
        const localPlan = JSON.parse(localStorage.getItem('gourmet_production_plan') || '[]');
        if (localPlan.length > 0) {
            for (const item of localPlan) {
                try {
                    await gourmetSupabase.from('planning_production').upsert(this._planningToRow(item, uid));
                } catch(e){}
            }
        }

        // 5. HACCP Logs
        const localHaccp = JSON.parse(localStorage.getItem('gourmet_haccp_logs') || '{"temp":[],"clean":[]}');
        if (localHaccp.temp && localHaccp.temp.length > 0) {
            for (const t of localHaccp.temp) {
                if (t.id.startsWith('t_demo')) continue;
                try {
                    await gourmetSupabase.from('haccp_temperatures').upsert(this._tempToRow(t, uid));
                } catch(e){}
            }
        }
        if (localHaccp.clean && localHaccp.clean.length > 0) {
            for (const c of localHaccp.clean) {
                try {
                    await gourmetSupabase.from('haccp_nettoyage').upsert(this._cleanToRow(c, uid));
                } catch(e){}
            }
        }

        // 6. Pertes / Losses
        const localWaste = JSON.parse(localStorage.getItem('gourmet_waste_logs') || '[]');
        if (localWaste.length > 0) {
            for (const w of localWaste) {
                try {
                    await gourmetSupabase.from('pertes').upsert(this._wasteToRow(w, uid));
                } catch(e){}
            }
        }

        // 7. Équipe & Congés
        const teamKey = `gourmet_team_${uid}`;
        const oldTeamKey = `gourmet_team_members_${owner.toLowerCase()}`;
        const localTeam = JSON.parse(localStorage.getItem(teamKey) || localStorage.getItem(oldTeamKey) || '[]');
        if (localTeam.length > 0) {
            for (const m of localTeam) {
                try {
                    await gourmetSupabase.from('team_members').upsert(this._memberToRow(m, uid));
                } catch(e){}
            }
        }

        const leavesKey = `gourmet_leaves_${uid}`;
        const oldLeavesKey = `gourmet_staff_leaves_${owner.toLowerCase()}`;
        const localLeaves = JSON.parse(localStorage.getItem(leavesKey) || localStorage.getItem(oldLeavesKey) || '[]');
        if (localLeaves.length > 0) {
            for (const l of localLeaves) {
                try {
                    await gourmetSupabase.from('staff_leaves').upsert(this._leaveToRow(l, uid));
                } catch(e){}
            }
        }

        // 8. Radar Logistique / Deliveries
        const localDeliv = JSON.parse(localStorage.getItem('gourmet_deliveries') || '[]');
        if (localDeliv.length > 0) {
            for (const d of localDeliv) {
                try {
                    await gourmetSupabase.from('deliveries').upsert(this._deliveryToRow(d, uid));
                } catch(e){}
            }
        }

        localStorage.setItem('gourmet_migration_done_v4', 'true');
        if (typeof showToast === 'function') showToast('✅ Gourmet Sync 100% en ligne !', 'success');
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

        const tables = ['recipes', 'recette_sous_recettes', 'clients', 'commandes', 'fournisseurs',
            'planning_production', 'haccp_temperatures', 'haccp_nettoyage', 'pertes', 'team_members', 'staff_leaves', 'deliveries'];
        for (const table of tables) {
            try { await gourmetSupabase.from(table).delete().eq('user_id', user.id); } catch (e) {}
        }
        try {
            await gourmetSupabase.from('ingredients')
                .update({ stock_actuel: 0, updated_at: new Date().toISOString() })
                .eq('user_id', user.id);
        } catch (e) {}

        const protectedKeys = ['gourmet_auth', 'gourmet_current_user', 'gourmet_user_id',
            'gourmet_demo_mode', 'gourmet_ingredient_db', 'gourmet_migration_done_v4'];
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
            'recipes', 'recette_sous_recettes', 'ingredients', 'commandes', 'clients', 'fournisseurs',
            'planning_production', 'haccp_temperatures', 'haccp_nettoyage',
            'pertes', 'team_members', 'staff_leaves', 'deliveries', 'subscriptions', 'profiles'
        ];

        for (const table of cascadeTables) {
            try {
                await gourmetSupabase.from(table).delete().eq('user_id', user.id);
            } catch (e) { console.warn(`deleteFullAccount — ${table}:`, e.message); }
        }

        Object.keys(localStorage)
            .filter(k => k.includes('gourmet') || k.includes('labpatiss'))
            .forEach(k => localStorage.removeItem(k));
        this.queue = [];
        localStorage.removeItem('gourmet_sync_queue');

        await gourmetSupabase.auth.signOut();
        if (typeof showToast === 'function') showToast('✅ Compte supprimé définitivement. Au revoir !', 'success');
        setTimeout(() => { window.location.href = './landing.html'; }, 2000);
        return true;
    },

    // ══════════════════════════════════════════════════════════════
    // PRIX INGRÉDIENTS PAR FOURNISSEUR (ingredient_prices)
    // ══════════════════════════════════════════════════════════════

    /**
     * Charge tous les prix fournisseurs de l'utilisateur connecté
     * @returns {Array} liste de { id, ingredient_name, fournisseur_id, prix_unitaire, unite }
     */
    async chargerIngredientPrices() {
        if (!navigator.onLine || !window.gourmetSupabase) return null;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return null;
            const { data, error } = await gourmetSupabase
                .from('ingredient_prices')
                .select('*')
                .eq('user_id', session.user.id);
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('[GourmetSync] Erreur chargement ingredient_prices:', err.message);
            return null;
        }
    },

    /**
     * Sauvegarde (upsert) un prix fournisseur pour un ingrédient
     * @param {Object} price - { ingredient_name, fournisseur_id, prix_unitaire, unite }
     */
    async sauvegarderIngredientPrice(price) {
        if (!window.gourmetSupabase) return;
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return;
            const row = {
                id: price.id || this.uuid(),
                user_id: session.user.id,
                ingredient_name: price.ingredient_name,
                fournisseur_id: price.fournisseur_id,
                prix_unitaire: parseFloat(price.prix_unitaire) || 0,
                unite: price.unite || 'kg',
                updated_at: new Date().toISOString()
            };
            const { error } = await gourmetSupabase
                .from('ingredient_prices')
                .upsert(row, { onConflict: 'user_id,ingredient_name,fournisseur_id' });
            if (error) throw error;
            return row;
        } catch (err) {
            console.error('[GourmetSync] Erreur sauvegarde ingredient_prices:', err.message);
            if (typeof showToast === 'function') showToast('⚠️ Erreur sauvegarde prix fournisseur', 'warning');
        }
    },

    /**
     * Supprime un prix fournisseur par id
     * @param {string} id
     */
    async supprimerIngredientPrice(id) {
        await this.supprimerRow('ingredient_prices', id);
    },

    // ══════════════════════════════════════════════════════════════
    // PARTAGE COLLABORATIF DE LABORATOIRE (lab_shares)
    // ══════════════════════════════════════════════════════════════

    /**
     * Invite un membre à accéder au labo courant par email
     * @param {string} email - Email du membre invité
     * @param {string} role  - 'viewer' ou 'editor'
     */
    async inviterMembreLab(email, role = 'viewer') {
        if (!window.gourmetSupabase) return { success: false, error: 'Non connecté' };
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return { success: false, error: 'Session expirée' };

            const row = {
                id: this.uuid(),
                owner_user_id: session.user.id,
                member_email: email.toLowerCase().trim(),
                role,
                status: 'pending',
                updated_at: new Date().toISOString()
            };
            const { error } = await gourmetSupabase
                .from('lab_shares')
                .upsert(row, { onConflict: 'owner_user_id,member_email' });
            if (error) throw error;
            return { success: true };
        } catch (err) {
            console.error('[GourmetSync] Erreur invitation lab:', err.message);
            return { success: false, error: err.message };
        }
    },

    /**
     * Charge tous les partages émis par le labo courant (membres invités)
     * @returns {Array} membres invités
     */
    async chargerMembresPartages() {
        if (!navigator.onLine || !window.gourmetSupabase) return [];
        try {
            const { data: { session } } = await gourmetSupabase.auth.getSession();
            if (!session?.user?.id) return [];
            const { data, error } = await gourmetSupabase
                .from('lab_shares')
                .select('*')
                .eq('owner_user_id', session.user.id)
                .order('created_at', { ascending: false });
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('[GourmetSync] Erreur chargement membres partagés:', err.message);
            return [];
        }
    },

    /**
     * Charge tous les labs auxquels l'utilisateur a été invité
     * @returns {Array} labs partagés avec moi
     */
    async chargerLabsPartagesAvecMoi() {
        if (!navigator.onLine || !window.gourmetSupabase) return [];
        try {
            const { data, error } = await gourmetSupabase.rpc('get_my_shared_labs');
            if (error) throw error;
            return data || [];
        } catch (err) {
            console.error('[GourmetSync] Erreur chargement labs partagés:', err.message);
            return [];
        }
    },

    /**
     * Accepte une invitation au labo
     * @param {string} shareId - UUID de l'invitation
     */
    async accepterInvitationLab(shareId) {
        if (!window.gourmetSupabase) return { success: false };
        try {
            const { data, error } = await gourmetSupabase.rpc('accept_lab_invitation', { p_share_id: shareId });
            if (error) throw error;
            return data;
        } catch (err) {
            console.error('[GourmetSync] Erreur acceptation invitation:', err.message);
            return { success: false, error: err.message };
        }
    },

    /**
     * Refuse ou révoque un accès (owner ou member peut l'appeler)
     * @param {string} shareId - UUID du partage
     */
    async revoquerAccesLab(shareId) {
        await this.supprimerRow('lab_shares', shareId);
    },

    /**
     * Charge le planning de production d'un autre labo (lab partagé)
     * @param {string} ownerUserId - user_id du propriétaire du labo
     * @returns {Array} liste des éléments de planning
     */
    async chargerPlanningPartage(ownerUserId) {
        if (!navigator.onLine || !window.gourmetSupabase) return null;
        try {
            const { data, error } = await gourmetSupabase
                .from('planning_production')
                .select('*')
                .eq('user_id', ownerUserId)
                .order('date_prod', { ascending: true });
            if (error) throw error;
            return (data || []).map(row => this._rowToPlanning(row));
        } catch (err) {
            console.error('[GourmetSync] Erreur planning partagé:', err.message);
            return null;
        }
    },

    /**
     * Charge l'inventaire d'un autre labo (lab partagé)
     * @param {string} ownerUserId - user_id du propriétaire du labo
     * @returns {Array} liste des ingrédients
     */
    async chargerInventairePartage(ownerUserId) {
        if (!navigator.onLine || !window.gourmetSupabase) return null;
        try {
            const { data, error } = await gourmetSupabase
                .from('ingredients')
                .select('*')
                .eq('user_id', ownerUserId)
                .order('nom', { ascending: true });
            if (error) throw error;
            return (data || []).map(row => ({
                id: row.id,
                name: row.nom || row.name || '',
                stock: row.stock_actuel || 0,
                unit: row.unite || 'g',
                price: row.prix_unitaire || 0,
                alertThreshold: row.seuil_alerte || 0,
                lastUpdate: row.updated_at || new Date().toISOString(),
                priceHistory: row.price_history || []
            }));
        } catch (err) {
            console.error('[GourmetSync] Erreur inventaire partagé:', err.message);
            return null;
        }
    }
};

window.GourmetSync = GourmetSync;
GourmetSync.init();
GourmetSync.initRealtime();
