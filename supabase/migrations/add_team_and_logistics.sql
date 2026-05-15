-- ============================================================
-- GOURMETREVIENT — Migration : Équipe, Congés et Radar Logistique
-- Tables : team_members, staff_leaves, deliveries
-- ============================================================

-- ── 1. Table Équipe ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.team_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  role        TEXT,
  avatar      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_team" ON public.team_members
  FOR ALL USING (auth.uid() = user_id);

-- ── 2. Table Congés / Absences ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.staff_leaves (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id   UUID, -- Référence optionnelle à team_members.id si on utilise des UUID
  member_name TEXT NOT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.staff_leaves ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_leaves" ON public.staff_leaves
  FOR ALL USING (auth.uid() = user_id);

-- ── 3. Table Radar Logistique (Livraisons) ────────────────────
CREATE TABLE IF NOT EXISTS public.deliveries (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier    TEXT NOT NULL,
  eta         TEXT, -- Format libre (ex: "08h00 - 10h00")
  items       TEXT,
  status      TEXT DEFAULT 'planned', -- 'planned', 'confirmed', 'delivered'
  delivery_date DATE DEFAULT CURRENT_DATE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.deliveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users_manage_own_deliveries" ON public.deliveries
  FOR ALL USING (auth.uid() = user_id);

-- ── 4. Triggers updated_at ────────────────────────────────────
CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_staff_leaves_updated_at
  BEFORE UPDATE ON public.staff_leaves
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
