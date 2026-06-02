-- ============================================================
--  GOURMETREVIENT — MIGRATION v3.1 : Partage de Laboratoire
--  À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================
--  ✅ Nouvelle table lab_shares
--  ✅ Politiques RLS mises à jour pour planning et inventaire
--  ✅ Réaltime activé sur lab_shares
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 1 — TABLE LAB_SHARES (Partage de laboratoire)
-- ════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS public.lab_shares (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id   UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_email    TEXT        NOT NULL,
  member_user_id  UUID        REFERENCES auth.users(id) ON DELETE CASCADE,
  role            TEXT        NOT NULL DEFAULT 'viewer'
                              CHECK (role IN ('viewer', 'editor')),
  status          TEXT        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'active', 'refused')),
  updated_at      TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  UNIQUE(owner_user_id, member_email)
);

CREATE INDEX IF NOT EXISTS idx_lab_shares_owner  ON public.lab_shares(owner_user_id);
CREATE INDEX IF NOT EXISTS idx_lab_shares_member ON public.lab_shares(member_user_id);
CREATE INDEX IF NOT EXISTS idx_lab_shares_email  ON public.lab_shares(member_email);

-- Créer la fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER trg_lab_shares_updated_at
  BEFORE UPDATE ON public.lab_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 2 — RLS sur lab_shares
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.lab_shares ENABLE ROW LEVEL SECURITY;

-- Le propriétaire voit et gère tous ses partages
CREATE POLICY "lab_shares_owner"
  ON public.lab_shares
  FOR ALL
  USING (auth.uid() = owner_user_id);

-- Le membre invité voit sa propre invitation et peut l'accepter/refuser
CREATE POLICY "lab_shares_member_read"
  ON public.lab_shares
  FOR SELECT
  USING (auth.uid() = member_user_id);

CREATE POLICY "lab_shares_member_update"
  ON public.lab_shares
  FOR UPDATE
  USING (auth.uid() = member_user_id);

-- Permettre à un membre de lire les invitations par son email
-- (avant qu'il soit lié par member_user_id)
CREATE POLICY "lab_shares_email_lookup"
  ON public.lab_shares
  FOR SELECT
  USING (
    member_email = (
      SELECT email FROM auth.users WHERE id = auth.uid() LIMIT 1
    )
  );


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 3 — MISE À JOUR DES POLITIQUES RLS
--           planning_production & ingredients
--           → Accès en lecture aux membres actifs du labo
-- ════════════════════════════════════════════════════════════

-- Planning : supprimer l'ancienne politique et en créer deux nouvelles
DROP POLICY IF EXISTS "planning_own" ON public.planning_production;

-- Propriétaire : accès total
CREATE POLICY "planning_owner_all"
  ON public.planning_production
  FOR ALL
  USING (auth.uid() = user_id);

-- Membre viewer ou editor : lecture seule
CREATE POLICY "planning_shared_read"
  ON public.planning_production
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_shares
      WHERE owner_user_id = planning_production.user_id
        AND member_user_id = auth.uid()
        AND status = 'active'
    )
  );

-- Membre editor : peut aussi écrire
CREATE POLICY "planning_shared_editor"
  ON public.planning_production
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.lab_shares
      WHERE owner_user_id = planning_production.user_id
        AND member_user_id = auth.uid()
        AND status = 'active'
        AND role = 'editor'
    )
  );

CREATE POLICY "planning_shared_editor_update"
  ON public.planning_production
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_shares
      WHERE owner_user_id = planning_production.user_id
        AND member_user_id = auth.uid()
        AND status = 'active'
        AND role = 'editor'
    )
  );

-- Ingrédients : même logique
DROP POLICY IF EXISTS "ingredients_own" ON public.ingredients;

CREATE POLICY "ingredients_owner_all"
  ON public.ingredients
  FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "ingredients_shared_read"
  ON public.ingredients
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_shares
      WHERE owner_user_id = ingredients.user_id
        AND member_user_id = auth.uid()
        AND status = 'active'
    )
  );

CREATE POLICY "ingredients_shared_editor"
  ON public.ingredients
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.lab_shares
      WHERE owner_user_id = ingredients.user_id
        AND member_user_id = auth.uid()
        AND status = 'active'
        AND role = 'editor'
    )
  );


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 4 — FONCTION RPC : Accepter une invitation
--           Lie le member_user_id à l'invitation par email
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.accept_lab_invitation(p_share_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_share public.lab_shares;
  v_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur connecté
  SELECT email INTO v_email FROM auth.users WHERE id = auth.uid();

  -- Vérifier que l'invitation existe et correspond à cet email
  SELECT * INTO v_share FROM public.lab_shares
  WHERE id = p_share_id AND member_email = v_email AND status = 'pending';

  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Invitation introuvable ou déjà traitée');
  END IF;

  -- Accepter : lier le member_user_id et activer
  UPDATE public.lab_shares
  SET member_user_id = auth.uid(),
      status = 'active',
      updated_at = now()
  WHERE id = p_share_id;

  RETURN json_build_object(
    'success', true,
    'owner_user_id', v_share.owner_user_id,
    'role', v_share.role
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.accept_lab_invitation(UUID) TO authenticated;


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 5 — FONCTION RPC : Mes labs partagés
--           Retourne les labs auxquels l'utilisateur a accès
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_my_shared_labs()
RETURNS TABLE (
  share_id       UUID,
  owner_user_id  UUID,
  owner_name     TEXT,
  owner_email    TEXT,
  role           TEXT,
  status         TEXT
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    ls.id           AS share_id,
    ls.owner_user_id,
    p.full_name     AS owner_name,
    u.email         AS owner_email,
    ls.role,
    ls.status
  FROM public.lab_shares ls
  JOIN auth.users u ON u.id = ls.owner_user_id
  LEFT JOIN public.profiles p ON p.id = ls.owner_user_id
  WHERE ls.member_user_id = auth.uid()
     OR (ls.member_email = (SELECT email FROM auth.users WHERE id = auth.uid()) AND ls.status = 'pending')
  ORDER BY ls.created_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_my_shared_labs() TO authenticated;


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 6 — REALTIME sur lab_shares
-- ════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_shares;


-- ════════════════════════════════════════════════════════════
-- VÉRIFICATION FINALE
-- ════════════════════════════════════════════════════════════

SELECT table_name AS "Nouvelle table"
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name = 'lab_shares';

SELECT tablename AS "Realtime activé sur"
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
ORDER BY tablename;
