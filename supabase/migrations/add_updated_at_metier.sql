-- ============================================================
-- GOURMETREVIENT — Migration : updated_at sur les tables métier
-- Tables : recettes, ingredients, commandes, clients, fournisseurs
-- ============================================================
-- Contexte : supabase-sync.js v2.0 utilise updated_at pour le
-- Last-Write-Wins conflict resolution. Sans cette colonne sur les
-- tables métier, la fusion est impossible et le cloud prime toujours.
--
-- ▶ À exécuter dans : Supabase → SQL Editor → New Query
-- ▶ Totalement idempotent (IF NOT EXISTS + OR REPLACE)
-- ============================================================

-- ── 1. Ajouter updated_at sur chaque table métier ────────────────────────────

ALTER TABLE public.recettes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.ingredients
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.commandes
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.clients
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.fournisseurs
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.recette_ingredients
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

ALTER TABLE public.planning_production
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- ── 2. Fonction trigger partagée (réutilise celle des subscriptions si existe) ─

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ── 3. Triggers auto-updated_at sur chaque table ─────────────────────────────
-- (DROP IF EXISTS + CREATE pour garantir l'idempotence)

DROP TRIGGER IF EXISTS trg_recettes_updated_at           ON public.recettes;
DROP TRIGGER IF EXISTS trg_ingredients_updated_at         ON public.ingredients;
DROP TRIGGER IF EXISTS trg_commandes_updated_at           ON public.commandes;
DROP TRIGGER IF EXISTS trg_clients_updated_at             ON public.clients;
DROP TRIGGER IF EXISTS trg_fournisseurs_updated_at        ON public.fournisseurs;
DROP TRIGGER IF EXISTS trg_recette_ingredients_updated_at ON public.recette_ingredients;
DROP TRIGGER IF EXISTS trg_planning_production_updated_at ON public.planning_production;

CREATE TRIGGER trg_recettes_updated_at
  BEFORE UPDATE ON public.recettes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_commandes_updated_at
  BEFORE UPDATE ON public.commandes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_fournisseurs_updated_at
  BEFORE UPDATE ON public.fournisseurs
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_recette_ingredients_updated_at
  BEFORE UPDATE ON public.recette_ingredients
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_planning_production_updated_at
  BEFORE UPDATE ON public.planning_production
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ── 4. Index pour accélérer les requêtes de sync (ORDER BY updated_at) ────────

CREATE INDEX IF NOT EXISTS idx_recettes_updated_at
  ON public.recettes(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_ingredients_updated_at
  ON public.ingredients(updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_commandes_updated_at
  ON public.commandes(updated_at DESC);

-- ============================================================
-- VÉRIFICATION — Après exécution :
-- SELECT table_name, column_name, data_type
-- FROM information_schema.columns
-- WHERE column_name = 'updated_at'
--   AND table_schema = 'public'
-- ORDER BY table_name;
-- ============================================================
