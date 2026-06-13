-- ============================================================
-- GOURMETREVIENT — Migration : Auto-confirm & RLS Sécurisé
-- ============================================================

-- 1. Trigger d'auto-confirmation des emails (évite les bugs SMTP à l'inscription)
CREATE OR REPLACE FUNCTION public.auto_confirm_user()
RETURNS trigger AS $$
BEGIN
  new.email_confirmed_at := NOW();
  new.confirmed_at := NOW();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_auto_confirm_user ON auth.users;
CREATE TRIGGER trg_auto_confirm_user
  BEFORE INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.auto_confirm_user();


-- 2. Renforcement de la sécurité des politiques RLS
-- Toutes les tables métier n'autorisent l'accès que si le plan n'est pas 'free' (pro, labo, admin)
DROP POLICY IF EXISTS "recipes_own" ON public.recipes;
DROP POLICY IF EXISTS "ingredients_own" ON public.ingredients;
DROP POLICY IF EXISTS "ingredient_prices_own" ON public.ingredient_prices;
DROP POLICY IF EXISTS "clients_own" ON public.clients;
DROP POLICY IF EXISTS "commandes_own" ON public.commandes;
DROP POLICY IF EXISTS "fournisseurs_own" ON public.fournisseurs;
DROP POLICY IF EXISTS "planning_own" ON public.planning_production;
DROP POLICY IF EXISTS "haccp_temp_own" ON public.haccp_temperatures;
DROP POLICY IF EXISTS "haccp_clean_own" ON public.haccp_nettoyage;
DROP POLICY IF EXISTS "pertes_own" ON public.pertes;
DROP POLICY IF EXISTS "team_own" ON public.team_members;
DROP POLICY IF EXISTS "leaves_own" ON public.staff_leaves;
DROP POLICY IF EXISTS "deliveries_own" ON public.deliveries;
DROP POLICY IF EXISTS "recette_sous_recettes_own" ON public.recette_sous_recettes;

CREATE POLICY "recipes_own" ON public.recipes FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "ingredients_own" ON public.ingredients FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "ingredient_prices_own" ON public.ingredient_prices FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "clients_own" ON public.clients FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "commandes_own" ON public.commandes FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "fournisseurs_own" ON public.fournisseurs FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "planning_own" ON public.planning_production FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "haccp_temp_own" ON public.haccp_temperatures FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "haccp_clean_own" ON public.haccp_nettoyage FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "pertes_own" ON public.pertes FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "team_own" ON public.team_members FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "leaves_own" ON public.staff_leaves FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "deliveries_own" ON public.deliveries FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
CREATE POLICY "recette_sous_recettes_own" ON public.recette_sous_recettes FOR ALL USING (
  auth.uid() = user_id AND (SELECT plan FROM public.profiles WHERE id = auth.uid()) IN ('pro', 'admin')
);
