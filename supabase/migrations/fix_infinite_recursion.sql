-- ============================================================
-- GOURMETREVIENT — Migration : Résolution de la récursion infinie RLS
-- ============================================================

-- 1. Fonctions utilitaires sécurisées (définies avec SECURITY DEFINER pour contourner la récursion RLS)
CREATE OR REPLACE FUNCTION public.get_user_plan()
RETURNS text AS $$
DECLARE
  v_plan text;
BEGIN
  -- Cette requête s'exécute sans récursion RLS grâce à SECURITY DEFINER
  SELECT plan INTO v_plan FROM public.profiles WHERE id = auth.uid();
  RETURN COALESCE(v_plan, 'free');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN (public.get_user_plan() = 'admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Recréation des politiques RLS sur public.profiles
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;
CREATE POLICY "profiles_admin_all" ON public.profiles FOR ALL USING (
  public.is_admin()
);


-- 3. Recréation des politiques de sécurité pour toutes les tables métier
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
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "ingredients_own" ON public.ingredients FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "ingredient_prices_own" ON public.ingredient_prices FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "clients_own" ON public.clients FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "commandes_own" ON public.commandes FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "fournisseurs_own" ON public.fournisseurs FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "planning_own" ON public.planning_production FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "haccp_temp_own" ON public.haccp_temperatures FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "haccp_clean_own" ON public.haccp_nettoyage FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "pertes_own" ON public.pertes FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "team_own" ON public.team_members FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "leaves_own" ON public.staff_leaves FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "deliveries_own" ON public.deliveries FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
CREATE POLICY "recette_sous_recettes_own" ON public.recette_sous_recettes FOR ALL USING (
  auth.uid() = user_id AND public.get_user_plan() IN ('pro', 'admin')
);
