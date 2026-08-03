import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import Stripe from "https://esm.sh/stripe@12.4.0";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  httpClient: Stripe.createFetchHttpClient(),
});

const allowedOrigins = new Set([
  "https://gourmetrevient.fr",
  "https://www.gourmetrevient.fr",
]);

function getOrigin(req: Request) {
  const origin = req.headers.get("origin") || "https://gourmetrevient.fr";
  return allowedOrigins.has(origin) ? origin : "https://gourmetrevient.fr";
}

function corsHeaders(req: Request) {
  return {
    "Access-Control-Allow-Origin": getOrigin(req),
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
    "Vary": "Origin",
  };
}

function json(req: Request, body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders(req), "Content-Type": "application/json" },
  });
}

function timestampToIso(value?: number | null) {
  return value ? new Date(value * 1000).toISOString() : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders(req) });
  }

  if (req.method !== "POST") {
    return json(req, { error: "Methode non autorisee" }, 405);
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return json(req, { error: "Signature manquante" }, 400);
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      Deno.env.get("STRIPE_WEBHOOK_SECRET") || "",
    );

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") || "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "",
    );

    console.log(`Stripe event received: ${event.type}`);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as any;
      const userId = session.metadata?.userId;

      if (!userId) {
        throw new Error("Missing userId metadata");
      }

      const stripeSubId = session.subscription || null;
      let periodStart: string | null = null;
      let periodEnd: string | null = null;
      let trialStart: string | null = null;
      let trialEnd: string | null = null;

      if (stripeSubId) {
        const subscription = await stripe.subscriptions.retrieve(stripeSubId);
        periodStart = timestampToIso(subscription.current_period_start);
        periodEnd = timestampToIso(subscription.current_period_end);
        trialStart = timestampToIso(subscription.trial_start);
        trialEnd = timestampToIso(subscription.trial_end);
      }

      const isTrialing = trialEnd && new Date(trialEnd).getTime() > Date.now();
      const planStatus = isTrialing ? "trialing" : "active";

      await supabase.from("subscriptions").upsert({
        user_id: userId,
        stripe_customer_id: session.customer,
        stripe_subscription_id: stripeSubId,
        plan_type: "pro",
        status: planStatus,
        current_period_start: periodStart,
        current_period_end: periodEnd,
        trial_start: trialStart,
        trial_end: trialEnd,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      await supabase.from("profiles").upsert({
        id: userId,
        plan: "pro",
        subscription_status: planStatus,
        stripe_customer_id: session.customer,
        updated_at: new Date().toISOString(),
      }, { onConflict: "id" });
    }

    if (event.type === "invoice.paid") {
      const invoice = event.data.object as any;
      const stripeSubId = invoice.subscription;
      if (!stripeSubId) return json(req, { received: true });

      const subscription = await stripe.subscriptions.retrieve(stripeSubId);
      const periodStart = timestampToIso(subscription.current_period_start);
      const periodEnd = timestampToIso(subscription.current_period_end);
      const trialEnd = timestampToIso(subscription.trial_end);

      const { data: subData } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", stripeSubId)
        .maybeSingle();

      if (subData) {
        await supabase.from("subscriptions").update({
          status: "active",
          current_period_start: periodStart,
          current_period_end: periodEnd,
          trial_end: trialEnd,
          updated_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", stripeSubId);

        await supabase.from("profiles").update({
          plan: "pro",
          subscription_status: "active",
          updated_at: new Date().toISOString(),
        }).eq("id", subData.user_id);
      }
    }

    if (event.type === "customer.subscription.updated") {
      const subscription = event.data.object as any;
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();

      if (subData) {
        const periodEnd = timestampToIso(subscription.current_period_end);
        const trialEnd = timestampToIso(subscription.trial_end);
        const isActivePlan = ["active", "trialing"].includes(subscription.status);

        await supabase.from("subscriptions").update({
          status: subscription.status,
          current_period_end: periodEnd,
          trial_end: trialEnd,
          cancel_at_period_end: Boolean(subscription.cancel_at_period_end),
          updated_at: new Date().toISOString(),
        }).eq("stripe_subscription_id", subscription.id);

        await supabase.from("profiles").update({
          plan: isActivePlan ? "pro" : "free",
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        }).eq("id", subData.user_id);
      }
    }

    if (event.type === "customer.subscription.deleted") {
      const subscription = event.data.object as any;
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_subscription_id", subscription.id)
        .maybeSingle();

      if (subData) {
        await supabase.from("profiles").update({
          plan: "free",
          subscription_status: "inactive",
          updated_at: new Date().toISOString(),
        }).eq("id", subData.user_id);
      }

      await supabase
        .from("subscriptions")
        .update({ status: "canceled", updated_at: new Date().toISOString() })
        .eq("stripe_subscription_id", subscription.id);
    }

    if (event.type === "invoice.payment_failed") {
      const invoice = event.data.object as any;
      const customerId = invoice.customer;
      const { data: subData } = await supabase
        .from("subscriptions")
        .select("user_id")
        .eq("stripe_customer_id", customerId)
        .maybeSingle();

      if (subData) {
        await supabase.from("subscriptions").update({
          status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("user_id", subData.user_id);

        await supabase.from("profiles").update({
          subscription_status: "past_due",
          updated_at: new Date().toISOString(),
        }).eq("id", subData.user_id);
      }
    }

    return json(req, { received: true });
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return json(req, { error: "Evenement Stripe refuse" }, 400);
  }
});
