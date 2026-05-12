-- ============================================================
-- GOURMETREVIENT — Migration : Ajout colonnes trial_end / trial_start
-- Table : public.subscriptions
-- ============================================================
-- Contexte : billing.js v2.0 vérifie trial_end pour valider l'accès Pro
-- pendant la période d'essai gratuit (14 jours).
-- Sans ces colonnes, la vérification tombe à false et l'accès est refusé.
--
-- ▶ À exécuter dans : Supabase → SQL Editor → New Query
-- ============================================================

-- 1. Ajout de trial_start et trial_end (idempotent)
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS trial_start TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS trial_end   TIMESTAMPTZ;

-- 2. Commentaires pour la documentation du schéma
COMMENT ON COLUMN public.subscriptions.trial_start IS 'Date de début de la période d''essai gratuit (fournie par Stripe)';
COMMENT ON COLUMN public.subscriptions.trial_end   IS 'Date de fin de la période d''essai gratuit (fournie par Stripe). NULL = pas d''essai en cours.';

-- 3. Index pour accélérer les requêtes de vérification d'accès
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_end
  ON public.subscriptions(trial_end)
  WHERE trial_end IS NOT NULL;

-- ============================================================
-- VÉRIFICATION — Après exécution :
-- SELECT column_name, data_type
-- FROM information_schema.columns
-- WHERE table_name = 'subscriptions'
-- ORDER BY ordinal_position;
-- ============================================================
