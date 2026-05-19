-- ============================================================
-- GOURMETREVIENT — SQL Final de Production
-- À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================
-- Ce script est IDEMPOTENT (peut être relancé sans risque)
-- ============================================================

-- ── 1. COLONNE updated_at SUR LA TABLE recipes ───────────────
-- La table recipes n'avait pas de colonne updated_at
-- Nécessaire pour le tri LWW (Last-Write-Wins) et le Realtime

ALTER TABLE public.recipes
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Trigger pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recipes_updated_at ON public.recipes;
CREATE TRIGGER trg_recipes_updated_at
    BEFORE UPDATE ON public.recipes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Pareil pour ingredients (si pas déjà fait)
ALTER TABLE public.ingredients
    ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

DROP TRIGGER IF EXISTS trg_ingredients_updated_at ON public.ingredients;
CREATE TRIGGER trg_ingredients_updated_at
    BEFORE UPDATE ON public.ingredients
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ── 2. COLONNE seuil_alerte SUR ingredients (si manquante) ───
ALTER TABLE public.ingredients
    ADD COLUMN IF NOT EXISTS seuil_alerte numeric(10,3) DEFAULT 0;

-- ── 3. ACTIVATION REALTIME SUR LES BONNES TABLES ─────────────
-- ⚠️ La table s'appelle "recipes" PAS "recettes"

ALTER PUBLICATION supabase_realtime ADD TABLE public.recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ingredients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commandes;

-- ── 4. VÉRIFICATION FINALE ────────────────────────────────────

-- Vérifier que recipes a bien updated_at
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'recipes'
ORDER BY ordinal_position;

-- Vérifier que le Realtime est actif
SELECT schemaname, tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND tablename IN ('recipes', 'ingredients', 'commandes');
