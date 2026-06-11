import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.4.0"

const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY');

const stripe = new Stripe(stripeSecretKey || '', {
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, accept',
}

serve(async (req) => {
  console.log('--- Nouvelle requête reçue ---')
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, userEmail, userId } = await req.json()

    let origin = req.headers.get('origin') || 'https://gourmetrevient.fr/'
    if (origin === 'null' || !origin.startsWith('http')) {
      origin = 'https://gourmetrevient.fr/'
    }

    console.log('--- Origin détectée :', origin)

    // Initialiser le client Supabase en service_role pour outrepasser les RLS lors de la lecture du profil/abonnement
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let trialEndTimestamp: number | null = null;

    if (userId) {
      // 1. Récupérer la date de création du compte utilisateur
      const { data: profile, error: profileErr } = await supabase
        .from('profiles')
        .select('created_at')
        .eq('id', userId)
        .single();

      if (profileErr) {
        console.error('Erreur récupération profil user_id :', userId, profileErr);
      } else if (profile && profile.created_at) {
        // 2. Vérifier si l'utilisateur possède déjà un historique d'abonnement
        const { data: existingSub, error: subErr } = await supabase
          .from('subscriptions')
          .select('id, status')
          .eq('user_id', userId)
          .maybeSingle();

        if (subErr) {
          console.error('Erreur récupération abonnement existant :', subErr);
        }

        // Si l'utilisateur n'a jamais eu d'abonnement (y compris résilié/impayé)
        if (!existingSub) {
          const signupDate = new Date(profile.created_at);
          const trialEndDate = new Date(signupDate.getTime() + 14 * 24 * 60 * 60 * 1000); // 14 jours d'essai
          const remainingSeconds = Math.floor((trialEndDate.getTime() - Date.now()) / 1000);

          // Stripe exige que trial_end soit au moins à 48 heures dans le futur
          if (remainingSeconds >= 172800) {
            trialEndTimestamp = Math.floor(trialEndDate.getTime() / 1000);
            console.log(`Période d'essai valide. Fin dans ${remainingSeconds} secondes (Timestamp Stripe: ${trialEndTimestamp}).`);
          } else {
            console.log(`Moins de 48 heures restantes (${remainingSeconds}s), aucun essai gratuit accordé.`);
          }
        } else {
          console.log(`L'utilisateur a déjà un historique d'abonnement (statut : ${existingSub.status}). Pas d'essai gratuit.`);
        }
      }
    }

    // Configuration de la session Checkout
    const sessionOptions: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // success_url / cancel_url lisibles par index.html
      success_url: `${origin}/index.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/index.html?canceled=true`,
      // Autoriser les codes promo
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: userId || '' },
      }
    }

    // Si on a droit à un essai gratuit dynamique (basé sur date d'inscription)
    if (trialEndTimestamp) {
      sessionOptions.subscription_data.trial_end = trialEndTimestamp;
    }

    // Ajouter l'email si disponible, sinon Stripe le demandera
    if (userEmail) {
      sessionOptions.customer_email = userEmail
    }

    // Ajouter l'ID utilisateur dans les métadonnées pour le webhook
    if (userId) {
      sessionOptions.metadata = { userId: userId }
    }

    const session = await stripe.checkout.sessions.create(sessionOptions)

    console.log(`✅ Session Checkout créée : ${session.id} pour userId=${userId}`)

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error) {
    console.error('Stripe Error:', error)
    return new Response(
      JSON.stringify({ error: error.message, stack: error.stack }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  }
})

