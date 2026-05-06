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

    // Cas 1 : Le paiement de l'abonnement est réussi
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const userId = session.metadata?.userId;
      
      if (!userId) {
        throw new Error("ID Utilisateur manquant dans les métadonnées de la session");
      }

      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        plan_type: 'pro',
        status: 'active',
        current_period_end: new Date(Date.now() + 31 * 24 * 60 * 60 * 1000).toISOString()
      });

      if (error) throw error;
      console.log(`✅ Abonnement activé avec succès pour : ${userId}`);
    }

    // Cas 2 : L'abonnement est mis à jour (ex: renouvellement)
    if (event.type === 'customer.subscription.updated') {
      const subscription = event.data.object;
      const { error } = await supabase
        .from('subscriptions')
        .update({
          status: subscription.status,
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('stripe_subscription_id', subscription.id);
      
      if (error) throw error;
      console.log(`🔄 Abonnement mis à jour : ${subscription.id}`);
    }

    // Cas 3 : L'abonnement est annulé
    if (event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const { error } = await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);
      
      if (error) throw error;
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
