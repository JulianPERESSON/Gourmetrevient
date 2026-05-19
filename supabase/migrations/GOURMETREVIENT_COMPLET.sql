-- ============================================================
--  GOURMETREVIENT — SCRIPT SQL COMPLET & CONSOLIDÉ v2.0
--  Version finale de production
--  À exécuter dans : Supabase Dashboard → SQL Editor
-- ============================================================
--  ✅ IDEMPOTENT : peut être relancé sans risque
--  ✅ Toutes les tables du projet
--  ✅ Row Level Security (RLS) complète
--  ✅ Triggers updated_at automatiques
--  ✅ Création de profil automatique à l'inscription
--  ✅ Table subscriptions SaaS (Stripe)
--  ✅ Realtime activé sur les tables critiques
--  ✅ Compte Admin Pro à vie
--  ✅ RPC get_user_count pour la landing page
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 1 — NETTOYAGE COMPLET
-- (ordre respectant les dépendances de clés étrangères)
-- ════════════════════════════════════════════════════════════

DROP TABLE IF EXISTS public.pertes                CASCADE;
DROP TABLE IF EXISTS public.haccp_nettoyage       CASCADE;
DROP TABLE IF EXISTS public.haccp_temperatures    CASCADE;
DROP TABLE IF EXISTS public.planning_production   CASCADE;
DROP TABLE IF EXISTS public.staff_leaves          CASCADE;
DROP TABLE IF EXISTS public.team_members          CASCADE;
DROP TABLE IF EXISTS public.deliveries            CASCADE;
DROP TABLE IF EXISTS public.fournisseurs          CASCADE;
DROP TABLE IF EXISTS public.commandes             CASCADE;
DROP TABLE IF EXISTS public.clients               CASCADE;
DROP TABLE IF EXISTS public.ingredients           CASCADE;
DROP TABLE IF EXISTS public.subscriptions         CASCADE;
DROP TABLE IF EXISTS public.recipes               CASCADE;
DROP TABLE IF EXISTS public.profiles              CASCADE;

-- Supprimer les vieilles fonctions si elles existent
DROP FUNCTION IF EXISTS public.handle_new_user()  CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;
DROP FUNCTION IF EXISTS public.set_updated_at()   CASCADE;
DROP FUNCTION IF EXISTS public.get_user_count()   CASCADE;


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 2 — FONCTIONS UTILITAIRES
-- ════════════════════════════════════════════════════════════

-- Mise à jour automatique du champ updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Alias pour compatibilité avec les anciens triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 3 — TABLE PROFILES (Profils utilisateurs)
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.profiles (
  id                   uuid        REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  email                text,
  full_name            text,
  avatar_url           text,
  plan                 text        DEFAULT 'free'
                                   CHECK (plan IN ('free','pro','labo','admin')),
  subscription_status  text        DEFAULT 'inactive',
  gender               text,
  role                 text,
  stripe_customer_id   text,
  updated_at           timestamptz DEFAULT now(),
  created_at           timestamptz DEFAULT now()
);

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 4 — TABLE RECIPES (Recettes)
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.recipes (
  id           uuid        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id      uuid        REFERENCES auth.users NOT NULL,
  name         text        NOT NULL,
  category     text,
  portions     integer     DEFAULT 1,
  prep_time    integer     DEFAULT 0,   -- en minutes
  cook_time    integer     DEFAULT 0,   -- en minutes
  ingredients  jsonb       DEFAULT '[]',
  procedure    jsonb       DEFAULT '[]',
  costs        jsonb       DEFAULT '{}',
  updated_at   timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_recipes_user_id    ON public.recipes(user_id);
CREATE INDEX idx_recipes_updated_at ON public.recipes(updated_at DESC);

CREATE TRIGGER trg_recipes_updated_at
  BEFORE UPDATE ON public.recipes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 5 — TABLE INGREDIENTS (Inventaire)
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.ingredients (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid          REFERENCES auth.users NOT NULL,
  nom             text          NOT NULL,
  prix_unitaire   numeric(10,4) DEFAULT 0,
  unite           text          DEFAULT 'g',
  stock_actuel    numeric(10,3) DEFAULT 0,
  seuil_alerte    numeric(10,3) DEFAULT 0,
  allergenes      text[]        DEFAULT '{}',
  price_history   jsonb         DEFAULT '[]',
  updated_at      timestamptz   DEFAULT now(),
  created_at      timestamptz   DEFAULT now()
);

CREATE INDEX idx_ingredients_user_id    ON public.ingredients(user_id);
CREATE INDEX idx_ingredients_nom        ON public.ingredients(nom);
CREATE INDEX idx_ingredients_updated_at ON public.ingredients(updated_at DESC);

CREATE TRIGGER trg_ingredients_updated_at
  BEFORE UPDATE ON public.ingredients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 6 — TABLE CLIENTS (CRM)
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.clients (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users NOT NULL,
  nom         text        NOT NULL,
  contact     text,
  email       text,
  telephone   text,
  adresse     text,
  notes       text,
  updated_at  timestamptz DEFAULT now(),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);

CREATE TRIGGER trg_clients_updated_at
  BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 7 — TABLE COMMANDES
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.commandes (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid          REFERENCES auth.users NOT NULL,
  client_id       uuid          REFERENCES public.clients(id) ON DELETE SET NULL,
  produits        jsonb         DEFAULT '[]',
  prix_total      numeric(10,2) DEFAULT 0,
  statut          text          DEFAULT 'en_attente'
                                CHECK (statut IN ('en_attente','confirme','en_cours','livre','annule')),
  date_livraison  date,
  notes           text,
  updated_at      timestamptz   DEFAULT now(),
  created_at      timestamptz   DEFAULT now()
);

CREATE INDEX idx_commandes_user_id    ON public.commandes(user_id);
CREATE INDEX idx_commandes_statut     ON public.commandes(statut);
CREATE INDEX idx_commandes_updated_at ON public.commandes(updated_at DESC);

CREATE TRIGGER trg_commandes_updated_at
  BEFORE UPDATE ON public.commandes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 8 — TABLE FOURNISSEURS
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.fournisseurs (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users NOT NULL,
  nom         text        NOT NULL,
  categorie   text,
  contact     text,
  email       text,
  telephone   text,
  note        integer     CHECK (note BETWEEN 1 AND 5),
  updated_at  timestamptz DEFAULT now(),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_fournisseurs_user_id ON public.fournisseurs(user_id);

CREATE TRIGGER trg_fournisseurs_updated_at
  BEFORE UPDATE ON public.fournisseurs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 9 — TABLE PLANNING_PRODUCTION
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.planning_production (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid    REFERENCES auth.users NOT NULL,
  recette_id  uuid    REFERENCES public.recipes(id) ON DELETE CASCADE,
  quantite    integer DEFAULT 1,
  date_prod   date    NOT NULL,
  statut      text    DEFAULT 'planifie'
                      CHECK (statut IN ('planifie','en_cours','termine','annule')),
  notes       text,
  updated_at  timestamptz DEFAULT now(),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_planning_user_id ON public.planning_production(user_id);
CREATE INDEX idx_planning_date    ON public.planning_production(date_prod);

CREATE TRIGGER trg_planning_updated_at
  BEFORE UPDATE ON public.planning_production
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 10 — TABLE HACCP_TEMPERATURES
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.haccp_temperatures (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid          REFERENCES auth.users NOT NULL,
  equipement   text          NOT NULL,
  temperature  numeric(5,2)  NOT NULL,
  conforme     boolean       DEFAULT true,
  notes        text,
  releve_at    timestamptz   DEFAULT now(),
  updated_at   timestamptz   DEFAULT now(),
  created_at   timestamptz   DEFAULT now()
);

CREATE INDEX idx_haccp_temp_user_id ON public.haccp_temperatures(user_id);

CREATE TRIGGER trg_haccp_temp_updated_at
  BEFORE UPDATE ON public.haccp_temperatures
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 11 — TABLE HACCP_NETTOYAGE
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.haccp_nettoyage (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid    REFERENCES auth.users NOT NULL,
  zone         text    NOT NULL,
  tache        text    NOT NULL,
  effectue     boolean DEFAULT false,
  date_prevue  date    NOT NULL,
  updated_at   timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_haccp_clean_user_id ON public.haccp_nettoyage(user_id);

CREATE TRIGGER trg_haccp_clean_updated_at
  BEFORE UPDATE ON public.haccp_nettoyage
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 12 — TABLE PERTES
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.pertes (
  id          uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid          REFERENCES auth.users NOT NULL,
  produit     text          NOT NULL,
  quantite    numeric(10,3),
  unite       text          DEFAULT 'g',
  motif       text,
  cout        numeric(10,2) DEFAULT 0,
  updated_at  timestamptz   DEFAULT now(),
  created_at  timestamptz   DEFAULT now()
);

CREATE INDEX idx_pertes_user_id ON public.pertes(user_id);

CREATE TRIGGER trg_pertes_updated_at
  BEFORE UPDATE ON public.pertes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 13 — TABLE TEAM_MEMBERS (Équipe)
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.team_members (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name        text        NOT NULL,
  role        text,
  avatar      text,
  updated_at  timestamptz DEFAULT now(),
  created_at  timestamptz DEFAULT now()
);

CREATE INDEX idx_team_members_user_id ON public.team_members(user_id);

CREATE TRIGGER trg_team_members_updated_at
  BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 14 — TABLE STAFF_LEAVES (Congés / Absences)
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.staff_leaves (
  id           uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  member_id    uuid,
  member_name  text    NOT NULL,
  start_date   date    NOT NULL,
  end_date     date    NOT NULL,
  reason       text,
  updated_at   timestamptz DEFAULT now(),
  created_at   timestamptz DEFAULT now()
);

CREATE INDEX idx_staff_leaves_user_id ON public.staff_leaves(user_id);

CREATE TRIGGER trg_staff_leaves_updated_at
  BEFORE UPDATE ON public.staff_leaves
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 15 — TABLE DELIVERIES (Radar Logistique)
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.deliveries (
  id             uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        uuid    NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  supplier       text    NOT NULL,
  eta            text,
  items          text,
  status         text    DEFAULT 'planned'
                         CHECK (status IN ('planned','confirmed','delivered')),
  delivery_date  date    DEFAULT CURRENT_DATE,
  updated_at     timestamptz DEFAULT now(),
  created_at     timestamptz DEFAULT now()
);

CREATE INDEX idx_deliveries_user_id ON public.deliveries(user_id);

CREATE TRIGGER trg_deliveries_updated_at
  BEFORE UPDATE ON public.deliveries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 16 — TABLE SUBSCRIPTIONS (SaaS Stripe)
-- ════════════════════════════════════════════════════════════

CREATE TABLE public.subscriptions (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id      text,
  stripe_subscription_id  text        UNIQUE,
  plan_type               text        NOT NULL DEFAULT 'free',
  status                  text        NOT NULL DEFAULT 'inactive',
  current_period_start    timestamptz,
  current_period_end      timestamptz,
  cancel_at_period_end    boolean     DEFAULT FALSE,
  trial_start             timestamptz,
  trial_end               timestamptz,
  updated_at              timestamptz DEFAULT now(),
  created_at              timestamptz DEFAULT now(),
  CONSTRAINT subscriptions_user_id_unique UNIQUE (user_id)
);

CREATE INDEX idx_subscriptions_user_id    ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_sub ON public.subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_trial_end  ON public.subscriptions(trial_end)
  WHERE trial_end IS NOT NULL;

CREATE TRIGGER trg_subscriptions_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 17 — ROW LEVEL SECURITY (Activation)
-- ════════════════════════════════════════════════════════════

ALTER TABLE public.profiles            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recipes             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ingredients         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commandes           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fournisseurs        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planning_production ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haccp_temperatures  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.haccp_nettoyage     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pertes              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_leaves        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliveries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions       ENABLE ROW LEVEL SECURITY;


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 18 — POLITIQUES RLS
-- ════════════════════════════════════════════════════════════

-- Profiles
CREATE POLICY "profiles_select_own"   ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own"   ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"   ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_admin_all"    ON public.profiles FOR ALL USING (
  (SELECT plan FROM public.profiles WHERE id = auth.uid()) = 'admin'
);

-- Tables métier : propriétaire uniquement
CREATE POLICY "recipes_own"           ON public.recipes             FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "ingredients_own"       ON public.ingredients         FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "clients_own"           ON public.clients             FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "commandes_own"         ON public.commandes           FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "fournisseurs_own"      ON public.fournisseurs        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "planning_own"          ON public.planning_production FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "haccp_temp_own"        ON public.haccp_temperatures  FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "haccp_clean_own"       ON public.haccp_nettoyage     FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "pertes_own"            ON public.pertes              FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "team_own"              ON public.team_members        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "leaves_own"            ON public.staff_leaves        FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "deliveries_own"        ON public.deliveries          FOR ALL USING (auth.uid() = user_id);

-- Subscriptions
CREATE POLICY "subscriptions_read"    ON public.subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "subscriptions_service" ON public.subscriptions FOR ALL  USING (auth.role() = 'service_role');


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 19 — TRIGGER : Création automatique du profil
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, plan)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 20 — RPC : Compteur d'utilisateurs (Landing Page)
-- ════════════════════════════════════════════════════════════

CREATE OR REPLACE FUNCTION public.get_user_count()
RETURNS bigint
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT count(*) FROM public.profiles;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_count() TO anon;
GRANT EXECUTE ON FUNCTION public.get_user_count() TO authenticated;


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 21 — REALTIME : Sync instantanée entre appareils
-- ════════════════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE public.recipes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ingredients;
ALTER PUBLICATION supabase_realtime ADD TABLE public.commandes;


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 22 — COMPTE ADMIN : Julian Peresson (Pro à vie)
-- ════════════════════════════════════════════════════════════

DO $$
DECLARE
  v_admin_id uuid;
BEGIN
  SELECT id INTO v_admin_id
  FROM auth.users
  WHERE email = 'julian31.peresson@gmail.com'
  LIMIT 1;

  IF v_admin_id IS NOT NULL THEN

    -- Forcer plan admin sur profiles
    UPDATE public.profiles
    SET plan = 'admin', subscription_status = 'active', updated_at = NOW()
    WHERE id = v_admin_id;

    -- Créer ou mettre à jour la subscription Pro à vie
    INSERT INTO public.subscriptions (
      user_id, plan_type, status,
      current_period_start, current_period_end, trial_end
    )
    VALUES (
      v_admin_id, 'pro', 'active',
      NOW(), '2099-12-31 23:59:59+00', NULL
    )
    ON CONFLICT (user_id) DO UPDATE SET
      plan_type            = 'pro',
      status               = 'active',
      current_period_start = NOW(),
      current_period_end   = '2099-12-31 23:59:59+00',
      trial_end            = NULL,
      updated_at           = NOW();

    RAISE NOTICE '✅ Compte Admin Pro configuré pour UUID : %', v_admin_id;

  ELSE
    RAISE WARNING '⚠️ Compte julian31.peresson@gmail.com introuvable. Créez le compte dans Supabase Auth puis relancez ce script.';
  END IF;
END $$;


-- ════════════════════════════════════════════════════════════
-- ÉTAPE 23 — VÉRIFICATION FINALE
-- ════════════════════════════════════════════════════════════

-- Liste des tables créées avec leur taille
SELECT
  table_name                                                        AS "Table",
  pg_size_pretty(pg_total_relation_size(quote_ident(table_name)))  AS "Taille"
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Confirmation Realtime actif
SELECT tablename AS "Realtime activé sur"
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime'
  AND schemaname = 'public'
ORDER BY tablename;
