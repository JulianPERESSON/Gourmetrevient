-- ============================================================
-- GOURMETREVIENT — Migration : Téléphone Unique & Sécurisation Essai
-- Tables : public.profiles, public.used_trials
-- ============================================================

-- 1. S'assurer que l'extension pgcrypto est active pour sha256
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Ajouter la colonne phone si elle n'existe pas
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone TEXT;

-- 3. Ajouter la contrainte d'unicité sur le numéro de téléphone
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conrelid = 'public.profiles'::regclass
      AND conname = 'profiles_phone_unique'
  ) THEN
    ALTER TABLE public.profiles
      ADD CONSTRAINT profiles_phone_unique UNIQUE (phone);
  END IF;
END $$;

-- 4. Créer la table pour enregistrer les essais consommés (RGPD-compliant : stocke des hashes)
CREATE TABLE IF NOT EXISTS public.used_trials (
  phone_hash TEXT PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexation et RLS pour used_trials
ALTER TABLE public.used_trials ENABLE ROW LEVEL SECURITY;
-- Seul le service_role peut lire et écrire cette table. Pas de politique SELECT/INSERT publique.

-- 5. RPC public.check_phone_exists pour vérification pré-inscription
CREATE OR REPLACE FUNCTION public.check_phone_exists(p_phone TEXT)
RETURNS BOOLEAN
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_normalized_digits TEXT;
  v_phone_hash TEXT;
  v_exists BOOLEAN;
BEGIN
  -- Nettoyer le numéro (conserver uniquement les chiffres)
  v_normalized_digits := regexp_replace(p_phone, '[^\d]', '', 'g');
  
  -- Si moins de 9 chiffres, ce n'est pas un numéro valide
  IF length(v_normalized_digits) < 9 THEN
    RETURN FALSE;
  END IF;
  
  -- Extraire les 9 derniers chiffres (normalisation internationale/nationale)
  v_normalized_digits := right(v_normalized_digits, 9);
  
  -- Calculer le hash SHA-256
  v_phone_hash := encode(digest(v_normalized_digits, 'sha256'), 'hex');
  
  -- Vérifier s'il est déjà associé à un profil actif, ou dans la table des essais consommés
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE right(regexp_replace(phone, '[^\d]', '', 'g'), 9) = v_normalized_digits
    UNION
    SELECT 1 FROM public.used_trials 
    WHERE phone_hash = v_phone_hash
  ) INTO v_exists;
  
  RETURN v_exists;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION public.check_phone_exists(TEXT) TO anon, authenticated;

-- 6. Mettre à jour le trigger de création de nouvel utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_raw_phone TEXT;
  v_normalized_digits TEXT;
  v_phone_hash TEXT;
BEGIN
  v_raw_phone := new.raw_user_meta_data->>'phone';
  
  IF v_raw_phone IS NOT NULL AND v_raw_phone <> '' THEN
    -- Nettoyer et normaliser le numéro (9 derniers chiffres)
    v_normalized_digits := right(regexp_replace(v_raw_phone, '[^\d]', '', 'g'), 9);
    
    IF length(v_normalized_digits) >= 9 THEN
      v_phone_hash := encode(digest(v_normalized_digits, 'sha256'), 'hex');
      
      -- Vérification anti-abus d'essais multiples
      IF EXISTS (SELECT 1 FROM public.used_trials WHERE phone_hash = v_phone_hash) THEN
        RAISE EXCEPTION 'Ce numéro de téléphone a déjà été utilisé pour une période d''essai.';
      END IF;
      
      -- Insérer le hash dans used_trials
      INSERT INTO public.used_trials (phone_hash)
      VALUES (v_phone_hash)
      ON CONFLICT DO NOTHING;
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, plan, phone)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    'free',
    v_raw_phone
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    phone = EXCLUDED.phone;

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
