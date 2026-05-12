import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
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

    let origin = req.headers.get('origin') || 'https://julianperesson.github.io/Gourmetrevient'
    if (origin === 'null' || !origin.startsWith('http')) {
      origin = 'https://julianperesson.github.io/Gourmetrevient'
    }

    console.log('--- Origin détectée :', origin)

    // Configuration de la session Checkout
    const sessionOptions: any = {
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      // ✅ Query params (?) lisibles par le Stripe Return Handler dans index.html
      // {CHECKOUT_SESSION_ID} est remplacé automatiquement par Stripe
      success_url: `${origin}/index.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url:  `${origin}/index.html?canceled=true`,
      // Essai gratuit 14 jours (mentionné dans les CGV)
      subscription_data: {
        trial_period_days: 14,
        metadata: { userId: userId || '' },
      },
      // Autoriser les codes promo
      allow_promotion_codes: true,
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
