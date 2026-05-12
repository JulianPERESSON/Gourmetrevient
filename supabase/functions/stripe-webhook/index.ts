import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from "https://esm.sh/stripe@12.4.0"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Gestion CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const signature = req.headers.get('stripe-signature');
  const body = await req.text();

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET')!
    );

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    console.log(`🔔 Événement Stripe reçu : ${event.type}`);

    // Cas 1 : Checkout complété (1er paiement ou essai gratuit)
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;

      if (!userId) {
        throw new Error("ID Utilisateur manquant dans les métadonnées de la session");
      }

      // Récupérer les détails de l'abonnement Stripe pour obtenir les vraies dates
      let periodEnd: string | null = null;
      let periodStart: string | null = null;
      let trialStart: string | null = null;
      let trialEnd: string | null = null;
      let stripeSubId: string | null = session.subscription || null;

      if (stripeSubId) {
        try {
          const sub = await stripe.subscriptions.retrieve(stripeSubId);
          periodStart = sub.current_period_start
            ? new Date(sub.current_period_start * 1000).toISOString()
            : null;
          periodEnd = sub.current_period_end
            ? new Date(sub.current_period_end * 1000).toISOString()
            : null;
          trialStart = sub.trial_start
            ? new Date(sub.trial_start * 1000).toISOString()
            : null;
          trialEnd = sub.trial_end
            ? new Date(sub.trial_end * 1000).toISOString()
            : null;
        } catch (e) {
          console.warn(`⚠️ Impossible de récupérer l'abonnement Stripe ${stripeSubId}:`, e);
          // Fallback : +30 jours calendaires si l'API échoue
          periodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
        }
      }

      const isTrialing = trialEnd && new Date(trialEnd).getTime() > Date.now();
      const planStatus = isTrialing ? 'trialing' : 'active';

      await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: stripeSubId,
        plan_type: 'pro',
        status: planStatus,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        trial_start: trialStart,
        trial_end: trialEnd,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' });

      // Mise à jour du profil
      await supabase.from('profiles').update({
        plan: 'pro',
        subscription_status: planStatus
      }).eq('id', userId);

      console.log(`✅ Abonnement ${planStatus} activé pour : ${userId} (fin : ${periodEnd ?? 'N/A'}, trial fin : ${trialEnd ?? 'aucun'}`);
    }

    // Cas 2 : Renouvellement réussi (facture payée) — met à jour les dates Stripe
    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as any;
      const stripeSubId = invoice.subscription;
      if (!stripeSubId) return new Response(JSON.stringify({ received: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 });

      // Récupérer les vraies dates depuis Stripe
      let periodStart: string | null = null;
      let periodEnd: string | null = null;
      let trialEnd: string | null = null;
      try {
        const sub = await stripe.subscriptions.retrieve(stripeSubId);
        periodStart = sub.current_period_start ? new Date(sub.current_period_start * 1000).toISOString() : null;
        periodEnd   = sub.current_period_end   ? new Date(sub.current_period_end   * 1000).toISOString() : null;
        trialEnd    = sub.trial_end            ? new Date(sub.trial_end            * 1000).toISOString() : null;
      } catch (e) {
        console.warn(`⚠️ Récup dates renouvellement échouée pour ${stripeSubId}:`, e);
      }

      const { data: subData } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', stripeSubId)
        .single();

      if (subData) {
        await supabase.from('subscriptions').update({
          status: 'active',
          current_period_start: periodStart,
          current_period_end: periodEnd,
          trial_end: trialEnd,
          updated_at: new Date().toISOString()
        }).eq('stripe_subscription_id', stripeSubId);

        await supabase.from('profiles').update({
          subscription_status: 'active'
        }).eq('id', subData.user_id);

        console.log(`🔄 Renouvellement OK pour user ${subData.user_id} — fin : ${periodEnd ?? 'N/A'}`);
      }
    }

    // Cas 2b : Mise à jour abonnement (changement de plan, etc.)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object as any;
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (subData) {
        const periodEnd = subscription.current_period_end
          ? new Date(subscription.current_period_end * 1000).toISOString()
          : null;
        const trialEnd = subscription.trial_end
          ? new Date(subscription.trial_end * 1000).toISOString()
          : null;

        await supabase.from('subscriptions').update({
          status: subscription.status,
          current_period_end: periodEnd,
          trial_end: trialEnd,
          updated_at: new Date().toISOString()
        }).eq('stripe_subscription_id', subscription.id);

        await supabase.from('profiles').update({
          subscription_status: subscription.status
        }).eq('id', subData.user_id);
      }
    }

    // Cas 3 : L'abonnement est annulé
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      
      const { data: subData } = await supabase
        .from('subscriptions')
        .select('user_id')
        .eq('stripe_subscription_id', subscription.id)
        .single();

      if (subData) {
          await supabase.from('profiles').update({ 
            plan: 'free', 
            subscription_status: 'inactive' 
          }).eq('id', subData.user_id);
      }
      
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);
      
      console.log(`🚫 Abonnement résilié : ${subscription.id}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    });

  } catch (err) {
    console.error(`❌ Erreur Webhook : ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    });
  }
});
