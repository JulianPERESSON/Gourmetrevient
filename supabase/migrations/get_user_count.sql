-- ============================================================
-- GOURMETREVIENT — Migration : get_user_count RPC
-- Permet de récupérer le nombre total d'utilisateurs inscrits
-- pour l'affichage du compteur social sur la landing page.
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER -- IMPORTANT : permet de contourner les RLS pour le comptage
SET search_path = public
AS $$
  SELECT count(*) FROM public.profiles;
$$;

-- Accorder l'accès à l'utilisateur anonyme (visiteur landing page)
GRANT EXECUTE ON FUNCTION public.get_user_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_count() TO authenticated;
