-- ============================================================
-- GOURMETREVIENT — Migration : Contrainte UNIQUE user_id
-- Table : public.subscriptions
-- ============================================================
-- Contexte : Le webhook utilise .upsert({ onConflict: 'user_id' })
-- et le bloc admin utilise ON CONFLICT (user_id).
-- Sans contrainte UNIQUE sur user_id, ces opérations échouent
-- silencieusement et créent des doublons.
--
-- ▶ À exécuter dans : Supabase → SQL Editor → New Query
-- ▶ Idempotent : ne fait rien si la contrainte existe déjà
-- ============================================================

-- 1. Dédupliquer les lignes existantes avant d'ajouter la contrainte
--    (garde la ligne la plus récente pour chaque user_id)
DELETE FROM public.subscriptions s1
USING public.subscriptions s2
WHERE s1.user_id = s2.user_id
  AND s1.created_at < s2.created_at
  AND s1.id <> s2.id;

-- 2. Ajouter la contrainte UNIQUE sur user_id
ALTER TABLE public.subscriptions
  DROP CONSTRAINT IF EXISTS subscriptions_user_id_unique;

ALTER TABLE public.subscriptions
  ADD CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id);

-- 3. Vérification
-- SELECT conname, contype FROM pg_constraint
-- WHERE conrelid = 'public.subscriptions'::regclass
-- ORDER BY conname;
