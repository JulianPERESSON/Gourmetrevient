import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.4.0";

const stripeSecretKey = Deno.env.get("STRIPE_SECRET_KEY") || "";
const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const stripe = new Stripe(stripeSecretKey, {
  httpClient: Stripe.createFetchHttpClient(),
});

const allowedOrigins = new Set([
  "https://gourmetrevient.fr",
  "https://www.gourmetrevient.fr",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
]);

function getOrigin(req: Request) {
  const origin = req.headers.get("origin") || "https://gourmetrevient.fr";
  return allowedOrigins.has(origin) ? origin : "https://gourmetrevient.fr";
}

function corsHeaders(req: Request) {
  return {
    "Access-Control-Allow-Origin": getOrigin(req),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, accept",
    "Vary": "Origin",
  };
}

function json(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return json(req, { error: "Methode non autorisee" }, 405);
  }

  try {
    const authHeader = req.headers.get("authorization") || "";
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await userClient.auth.getUser();
    if (authError || !user) {
      return json(req, { error: "Connexion requise" }, 401);
    }

    const serviceClient = createClient(supabaseUrl, supabaseServiceKey);
    const { data: subscription, error: subscriptionError } = await serviceClient
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("user_id", user.id)
      .maybeSingle();

    if (subscriptionError) {
      console.error("Portal subscription lookup error:", subscriptionError);
      return json(req, { error: "Impossible d'ouvrir le portail client" }, 500);
    }

    if (!subscription?.stripe_customer_id) {
      return json(req, { error: "Aucun abonnement Stripe associe a ce compte" }, 404);
    }

    const origin = getOrigin(req);
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/index.html?billing=portal`,
    });

    return json(req, { url: session.url });
  } catch (error) {
    console.error("Portal session error:", error);
    return json(req, { error: "Impossible d'ouvrir le portail client" }, 500);
  }
});
