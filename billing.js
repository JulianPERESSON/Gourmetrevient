/**
 * GOURMETREVIENT — Gestion de la Facturation et des Abonnements
 * Intégration future avec Stripe
 */

const GourmetBilling = {
    // ⚠️ SÉCURITÉ :
    // - publishableKey (pk_test_...) = clé PUBLIQUE, safe côté client ✅
    // - La clé SECRÈTE (sk_test_...) ne va JAMAIS ici → uniquement dans les Edge Functions Supabase
    CONFIG: {
        publishableKey: 'pk_test_51TT7DsID7zmqELy5HGzmqoqfB88FMRZVQtyhXWzNxBlpGKPW8nI86GVbVqXtl4xLGIetnRLyM8zYwTOpyVYOxUo2004TJZJEVV',
        pricing: {
            pro: {
                monthly: 'price_1TT7I6ID7zmqELy5ZmnFJa6C', // Abonnement Pro Chef - Mensuel
                yearly: 'price_placeholder_yearly'
            }
        }
    },

    /**
     * Vérifie le statut de l'abonnement de l'utilisateur actuel
     */
    async checkSubscriptionStatus() {
        const client = window.supabaseClient;
        if (!client) return { plan: 'free', status: 'active' };

        const { data: { user } } = await client.auth.getUser();
        if (!user) return { plan: 'free', status: 'inactive' };

        try {
            const { data, error } = await client
                .from('subscriptions')
                .select('*')
                .eq('user_id', user.id)
                .single();

            if (error || !data) return { plan: 'free', status: 'active' };
            
            return {
                plan: data.plan_type, // 'pro', 'premium', 'free'
                status: data.status,  // 'active', 'canceled', 'past_due'
                current_period_end: data.current_period_end
            };
        } catch (e) {
            console.error('Erreur lors de la vérification de l\'abonnement:', e);
            return { plan: 'free', status: 'active' };
        }
    },

    /**
     * Redirige l'utilisateur vers Stripe Checkout pour s'abonner
     */
    async checkout(planKey) {
        const priceId = this.CONFIG.pricing.pro[planKey === 'pro_monthly' ? 'monthly' : 'yearly'];
        console.log('🔄 Initialisation du paiement Stripe pour:', priceId);

        const client = window.supabaseClient;

        if (!client || !client.functions) {
            alert("Erreur d'initialisation du module de paiement. Veuillez rafraîchir la page.");
            return;
        }

        // Récupère l'utilisateur s'il est connecté (optionnel)
        let userEmail = null;
        let userId = null;
        try {
            const { data: { user } } = await client.auth.getUser();
            if (user) { userEmail = user.email; userId = user.id; }
        } catch(e) { /* non connecté */ }

        const toastFn = typeof showToast === 'function' ? showToast : (m) => console.log(m);
        toastFn('Préparation du paiement sécurisé...', 'info');

        try {
            const { data, error } = await client.functions.invoke('create-checkout-session', {
                body: { priceId, userEmail, userId }
            });

            if (error) {
                console.error('Supabase Function Error:', error);
                const errorMsg = error.message || "Erreur serveur";
                toastFn(`Erreur : ${errorMsg}`, 'error');
                return;
            }

            if (data?.url) {
                window.location.href = data.url;
            } else if (data?.error) {
                console.error('Stripe Logic Error:', data.error);
                toastFn(`Stripe : ${data.error}`, 'error');
            } else {
                throw new Error('URL de paiement non reçue');
            }
        } catch (err) {
            console.error('Erreur Checkout:', err);
            toastFn(`Erreur technique : ${err.message || 'inconnue'}`, 'error');
        }
    },

    /**
     * Ouvre le portail de gestion client Stripe
     */
    async openCustomerPortal() {
        showToast("Ouverture du portail de gestion...", "info");
        // Simulation d'appel Edge Function
        console.log('🔄 Appel au portail de gestion Stripe');
    },

    /**
     * Affiche l'UI de sélection de plan
     */
    renderPricingTable(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="pricing-grid" style="display:grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap:2rem; padding:2rem 0;">
                <!-- Plan Gratuit -->
                <div class="pricing-card" style="background:var(--surface); border:1px solid var(--border); border-radius:16px; padding:2rem; text-align:center;">
                    <h3 style="margin-bottom:1rem;">👩‍🍳 Amateur</h3>
                    <div style="font-size:2rem; font-weight:800; margin-bottom:1.5rem;">0€ <small style="font-size:1rem; font-weight:400;">/mois</small></div>
                    <ul style="text-align:left; margin-bottom:2rem; list-style:none; padding:0; color:var(--muted);">
                        <li style="margin-bottom:0.5rem;">✅ Jusqu'à 5 recettes</li>
                        <li style="margin-bottom:0.5rem;">✅ Calculs de base</li>
                        <li style="margin-bottom:0.5rem;">❌ Pas de Cloud</li>
                    </ul>
                    <button class="btn btn-outline" style="width:100%;" disabled>Plan Actuel</button>
                </div>

                <!-- Plan Pro -->
                <div class="pricing-card" style="background:var(--surface); border:2px solid var(--primary); border-radius:16px; padding:2rem; text-align:center; position:relative;">
                    <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--primary); color:white; padding:2px 12px; border-radius:20px; font-size:0.75rem; font-weight:800;">RECOMMANDÉ</div>
                    <h3 style="margin-bottom:1rem;">👨‍🍳 Pro Chef</h3>
                    <div style="font-size:2rem; font-weight:800; margin-bottom:1.5rem;">14,99€ <small style="font-size:1rem; font-weight:400;">/mois</small></div>
                    <ul style="text-align:left; margin-bottom:2rem; list-style:none; padding:0; color:var(--muted);">
                        <li style="margin-bottom:0.5rem;">✅ Recettes Illimitées</li>
                        <li style="margin-bottom:0.5rem;">✅ Synchronisation Cloud</li>
                        <li style="margin-bottom:0.5rem;">✅ Gestion Clients & Commandes</li>
                        <li style="margin-bottom:0.5rem;">✅ Export PDF Premium</li>
                    </ul>
                    <button class="btn btn-primary" style="width:100%;" onclick="GourmetBilling.checkout('pro_monthly')">S'abonner maintenant</button>
                </div>
            </div>
        `;
    }
};

window.GourmetBilling = GourmetBilling;
