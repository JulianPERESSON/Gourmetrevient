-- ============================================================
-- GOURMETREVIENT — Table subscriptions
-- À exécuter dans : Supabase > SQL Editor > New Query
-- ============================================================

-- 1. Création de la table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id  TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_type           TEXT NOT NULL DEFAULT 'free',   -- 'free' | 'pro' | 'atelier'
  status              TEXT NOT NULL DEFAULT 'inactive', -- 'active' | 'trialing' | 'canceled' | 'past_due' | 'inactive'
  current_period_start TIMESTAMPTZ,
  current_period_end  TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Index pour les requêtes rapides (lookup par user_id)
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);

-- 3. Row Level Security (RLS) — chaque utilisateur ne voit QUE sa ligne
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- L'utilisateur peut lire son propre abonnement
CREATE POLICY "users_read_own_subscription"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Seul le service (service_role) peut écrire (Webhooks Stripe via Edge Function)
CREATE POLICY "service_role_manage_subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');

-- 4. Trigger : met à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- 5. Insérer l'abonnement admin (Ju) — lookup dynamique par email
--    Pas besoin de connaître l'UUID à l'avance.
DO $$
DECLARE
  v_admin_id UUID;
BEGIN
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'julian31.peresson@gmail.com'
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN
    INSERT INTO public.subscriptions (
      user_id, plan_type, status,
      current_period_end, trial_end
    )
    VALUES (
      v_admin_id,
      'pro',
      'active',
      '2099-12-31 23:59:59+00',
      NULL  -- Pas de trial pour l'admin
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
      plan_type          = 'pro',
      status             = 'active',
      current_period_end = '2099-12-31 23:59:59+00',
      updated_at         = NOW();

    RAISE NOTICE '✅ Abonnement admin créé/mis à jour pour : %', v_admin_id;
  ELSE
    RAISE WARNING '⚠️ Compte admin non trouvé (julian31.peresson@gmail.com). Créez-le d''abord dans Supabase Auth.';
  END IF;
END $$;

-- ============================================================
-- VÉRIFICATION — Après exécution, tester avec :
-- SELECT * FROM subscriptions;
-- ============================================================
