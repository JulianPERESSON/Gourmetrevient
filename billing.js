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
    /**
     * Vérifie le statut d'abonnement depuis la table `subscriptions` Supabase.
     * Retour sécurisé : si erreur réseau → plan 'free' (pas d'accès Pro par défaut).
     * Politique : subscription_active = (status === 'active' ET plan_type !== 'free')
     */
    async checkSubscriptionStatus() {
        const client = window.gourmetSupabase || window.supabase;
        if (!client) return { plan: 'free', status: 'inactive', subscription_active: false };

        try {
            const { data: { user }, error: authErr } = await client.auth.getUser();
            if (authErr || !user) return { plan: 'free', status: 'inactive', subscription_active: false };

            const { data, error } = await client
                .from('subscriptions')
                .select('plan_type, status, current_period_end, trial_end')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error) throw error;
            if (!data) return { plan: 'free', status: 'inactive', subscription_active: false };

            // Vérification stricte : actif ET pas plan gratuit ET période non expirée
            const now = Date.now();
            const periodEnd = data.current_period_end ? new Date(data.current_period_end).getTime() : 0;
            const trialEnd  = data.trial_end ? new Date(data.trial_end).getTime() : 0;
            const inTrial   = trialEnd > now;
            const inPeriod  = periodEnd > now;

            const subscription_active =
                data.status === 'active' &&
                data.plan_type !== 'free' &&
                (inPeriod || inTrial);

            return {
                plan: data.plan_type,
                status: data.status,
                current_period_end: data.current_period_end,
                subscription_active
            };
        } catch (e) {
            console.error('GourmetBilling — Erreur vérification abonnement:', e);
            // Fail-closed : en cas d'erreur, pas d'accès Pro
            return { plan: 'free', status: 'error', subscription_active: false };
        }
    },

    /**
     * Vérifie si l'utilisateur est Pro (gate d'accès aux Outils Pro).
     * Priorité : AuthUI.isPro() (mémorisé) > checkSubscriptionStatus() (fresh)
     */
    async isPro() {
        // 1. Vérification rapide via AuthUI (déjà chargé en mémoire)
        if (window.AuthUI && typeof window.AuthUI.isPro === 'function') {
            return window.AuthUI.isPro();
        }
        // 2. Fallback : requête fraîche
        const status = await this.checkSubscriptionStatus();
        return status.subscription_active;
    },

    /**
     * Bloque l'accès aux Outils Pro si l'abonnement n'est pas actif.
     * À appeler en début de chaque fonction Pro.
     */
    async requirePro(featureName = 'cette fonctionnalité') {
        const pro = await this.isPro();
        if (!pro) {
            const toastFn = typeof showToast === 'function' ? showToast : console.log;
            toastFn(`🔒 ${featureName} est réservé aux membres Pro. Passez à l'offre Pro pour y accéder.`, 'info');
            if (window.GourmetBilling) {
                setTimeout(() => this.renderUpgradePrompt(), 300);
            }
            return false;
        }
        return true;
    },

    /**
     * Vérifie si l'utilisateur peut sauvegarder une nouvelle recette (Limite 5 pour Free)
     */
    async canSaveRecipe() {
        const pro = await this.isPro();
        if (pro) return true; // Les pros n'ont pas de limite

        // Compte les recettes sauvegardées localement ou dans l'APP
        const count = (window.APP && window.APP.savedRecipes) ? window.APP.savedRecipes.length : 0;
        
        if (count >= 5) {
            const toastFn = typeof showToast === 'function' ? showToast : console.log;
            toastFn("🛑 Limite de 5 recettes atteinte (Plan Gratuit). Passez Pro pour en ajouter d'autres !", "warning");
            this.renderUpgradePrompt();
            return false;
        }
        return true;
    },

    /**
     * Redirige l'utilisateur vers Stripe Checkout pour s'abonner
     */
    async checkout(planKey, optionalEmail = null) {
        // Détermine le Price ID : soit une clé (pro_monthly/yearly), soit l'ID direct
        let priceId = planKey;
        if (planKey === 'pro_monthly') priceId = this.CONFIG.pricing.pro.monthly;
        if (planKey === 'pro_yearly')  priceId = this.CONFIG.pricing.pro.yearly;
        
        console.log('🔄 Initialisation du paiement Stripe pour:', priceId);

        const toastFn = typeof showToast === 'function' ? showToast : (m) => console.log(m);
        toastFn('Préparation du paiement sécurisé... ⏳', 'info');

        // Récupère l'utilisateur s'il est connecté (optionnel)
        let userEmail = optionalEmail;
        let userId = null;
        try {
            const client = window.supabase; 
            if (client) {
                const { data: { user } } = await client.auth.getUser();
                if (user) { 
                    if (!userEmail) userEmail = user.email; 
                    userId = user.id; 
                }
            }
        } catch(e) { /* non connecté, on continue quand même */ }

        // Appel direct à la Edge Function Supabase (plus fiable que le SDK)
        const SUPABASE_URL = 'https://hogfrddigcojdmjjpbno.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_9iePEQdGSdnjXaw4I1s0Nw_wyitVBla';
        const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-checkout-session`;

        try {
            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ priceId, userEmail, userId })
            });

            const data = await response.json();

            if (data?.url) {
                toastFn('Redirection vers le paiement sécurisé... 🔒', 'success');
                setTimeout(() => { window.location.href = data.url; }, 500);
            } else if (data?.error) {
                console.error('Stripe Logic Error:', data.error);
                toastFn(`Erreur Stripe : ${data.error}`, 'error');
            } else {
                throw new Error('URL de paiement non reçue');
            }
        } catch (err) {
            console.error('Erreur Checkout:', err);
            toastFn(`Erreur technique : ${err.message || 'inconnue'}. Veuillez réessayer.`, 'error');
        }
    },

    /**
     * Ouvre le portail de gestion client Stripe
     */
    async openCustomerPortal() {
        const toastFn = typeof showToast === 'function' ? showToast : (m) => console.log(m);
        toastFn("Ouverture du portail sécurisé... 🔒", "info");

        const SUPABASE_URL = 'https://hogfrddigcojdmjjpbno.supabase.co';
        const SUPABASE_ANON_KEY = 'sb_publishable_9iePEQdGSdnjXaw4I1s0Nw_wyitVBla';
        const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/create-portal-session`;

        try {
            // Détection robuste du client Supabase
            const client = window.gourmetSupabase || window.supabase;
            if (!client) throw new Error("Client Supabase non initialisé");

            const { data: { user } } = await client.auth.getUser();
            
            // Cas spécial : Authentification Admin Prioritaire (via localStorage)
            const isAdminBypass = localStorage.getItem('gourmet_auth') === 'true';

            if (!user) {
                if (isAdminBypass) {
                    toastFn("Le portail Stripe est désactivé en mode 'Admin Prioritaire'. Veuillez vous connecter avec un compte client réel pour le tester.", "warning");
                } else {
                    toastFn("Vous devez être connecté via Supabase pour gérer votre abonnement.", "error");
                }
                return;
            }

            const response = await fetch(FUNCTION_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
                    'apikey': SUPABASE_ANON_KEY
                },
                body: JSON.stringify({ userId: user.id })
            });

            const data = await response.json();

            if (data?.url) {
                setTimeout(() => { window.location.href = data.url; }, 500);
            } else {
                throw new Error(data?.error || 'URL du portail non reçue');
            }
        } catch (err) {
            console.error('Erreur Portail:', err);
            toastFn(`Erreur : ${err.message}. Veuillez contacter le support.`, 'error');
        }
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
                    <div style="position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--primary); color:white; padding:2px 12px; border-radius:20px; font-size:0.75rem; font-weight:800;">14 JOURS D'ESSAI OFFERTS</div>
                    <h3 style="margin-bottom:1rem;">👨‍🍳 Pro Chef</h3>
                    <div style="font-size:2rem; font-weight:800; margin-bottom:1.5rem;">14,99€ <small style="font-size:1rem; font-weight:400;">/mois</small></div>
                    <ul style="text-align:left; margin-bottom:2rem; list-style:none; padding:0; color:var(--muted);">
                        <li style="margin-bottom:0.5rem;">✅ Essai gratuit de 14 jours</li>
                        <li style="margin-bottom:0.5rem;">✅ Recettes Illimitées</li>
                        <li style="margin-bottom:0.5rem;">✅ Synchronisation Cloud</li>
                        <li style="margin-bottom:0.5rem;">✅ Gestion Clients & Commandes</li>
                        <li style="margin-bottom:0.5rem;">✅ Export PDF Premium</li>
                    </ul>
                    <button class="btn btn-primary" style="width:100%;" onclick="GourmetBilling.checkout('pro_monthly')">Commencer l'essai gratuit</button>
                </div>
            </div>
        `;
    }
    /**
     * Affiche un prompt d'upgrade rapide (bannière non-bloquante).
     */
    renderUpgradePrompt() {
        if (document.getElementById('grUpgradePrompt')) return;
        const el = document.createElement('div');
        el.id = 'grUpgradePrompt';
        el.style.cssText = 'position:fixed;bottom:80px;right:24px;z-index:9998;background:linear-gradient(135deg,#6366f1,#4f46e5);color:#fff;padding:1rem 1.4rem;border-radius:16px;box-shadow:0 8px 32px rgba(99,102,241,0.4);font-family:Inter,sans-serif;max-width:280px;cursor:pointer;';
        el.innerHTML = `<div style="font-weight:800;margin-bottom:4px;">💎 Passez Pro</div><div style="font-size:0.82rem;opacity:0.85;">14 jours gratuits, sans engagement.</div>`;
        el.onclick = () => { el.remove(); this.checkout('pro_monthly'); };
        document.body.appendChild(el);
        setTimeout(() => el?.remove(), 8000);
    },

    /**
     * Déclenche la suppression RGPD complète du compte via GourmetSync.
     */
    async deleteAccount() {
        if (window.GourmetSync?.deleteFullAccount) {
            return window.GourmetSync.deleteFullAccount();
        }
        // Fallback si GourmetSync non chargé
        const toastFn = typeof showToast === 'function' ? showToast : console.log;
        toastFn('❌ Module de suppression non disponible. Contactez le support.', 'error');
        return false;
    }
};

window.GourmetBilling = GourmetBilling;
