-- ============================================================
-- PULZ — Supabase Schema v1.0
-- Ejecutar en Supabase SQL Editor (supabase.com → tu proyecto → SQL Editor)
-- IMPORTANTE: Ejecutar en ORDEN, sección por sección
-- ============================================================

-- ============================================================
-- PARTE 1: TABLAS
-- ============================================================

-- 1.1 Países (catálogo)
CREATE TABLE countries (
  id TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  name_pt TEXT,
  sort_order INT DEFAULT 0
);

-- 1.2 Perfiles de usuario (extiende auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'runner' CHECK (role IN ('runner', 'organizer', 'admin')),
  display_name TEXT,
  avatar_url TEXT,
  -- Campos organizador
  org_name TEXT,
  org_website TEXT,
  org_description TEXT,
  org_logo_url TEXT,
  org_social_ig TEXT,
  org_social_fb TEXT,
  org_country TEXT REFERENCES countries(id),
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Carreras (tabla principal)
CREATE TABLE races (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- Datos básicos (obligatorios)
  name TEXT NOT NULL,
  date DATE NOT NULL,
  country_id TEXT NOT NULL REFERENCES countries(id),
  location TEXT NOT NULL,
  categories TEXT[] NOT NULL DEFAULT '{}',
  type TEXT NOT NULL CHECK (type IN ('road', 'trail')),
  
  -- Datos extendidos (opcionales)
  website TEXT,
  description TEXT,
  description_en TEXT,
  description_pt TEXT,
  start_time TIME,
  start_point TEXT,
  price TEXT,
  registration_url TEXT,
  
  -- Datos completos (opcionales)
  logo_url TEXT,
  banner_url TEXT,
  elevation_gain INT,
  surface TEXT,
  kit_description TEXT,
  contact_email TEXT,
  social_ig TEXT,
  social_fb TEXT,
  max_participants INT,
  
  -- Coordenadas (para futuro mapa)
  latitude DECIMAL(10,7),
  longitude DECIMAL(10,7),
  
  -- Clasificación
  is_iconic BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'estimated' CHECK (status IN ('confirmed', 'estimated')),
  source TEXT DEFAULT 'pulz' CHECK (source IN ('pulz', 'organizer', 'community')),
  
  -- Relaciones
  created_by UUID REFERENCES profiles(id),
  organizer_id UUID REFERENCES profiles(id),
  
  -- Moderación (solo para source='community')
  moderation_status TEXT DEFAULT 'approved' 
    CHECK (moderation_status IN ('pending', 'approved', 'rejected')),
  moderation_note TEXT,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Favoritos
CREATE TABLE favorites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);

-- 1.5 Sugerencias de runners
CREATE TABLE race_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_by UUID REFERENCES profiles(id),
  name TEXT NOT NULL,
  date DATE,
  country_id TEXT REFERENCES countries(id),
  location TEXT,
  website TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PARTE 2: ÍNDICES
-- ============================================================

CREATE INDEX idx_races_country ON races(country_id);
CREATE INDEX idx_races_date ON races(date);
CREATE INDEX idx_races_type ON races(type);
CREATE INDEX idx_races_source ON races(source);
CREATE INDEX idx_races_moderation ON races(moderation_status);
CREATE INDEX idx_races_organizer ON races(organizer_id);
CREATE INDEX idx_favorites_user ON favorites(user_id);
CREATE INDEX idx_favorites_race ON favorites(race_id);
CREATE INDEX idx_profiles_role ON profiles(role);

-- ============================================================
-- PARTE 3: FUNCIONES Y TRIGGERS
-- ============================================================

-- 3.1 Auto-crear perfil cuando se registra un usuario
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, role, display_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'role', 'runner'),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 3.2 Auto-actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER races_updated_at
  BEFORE UPDATE ON races
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- PARTE 4: ROW LEVEL SECURITY (RLS)
-- ============================================================

-- Activar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE races ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE race_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE countries ENABLE ROW LEVEL SECURITY;

-- 4.1 Countries — todos leen
CREATE POLICY "countries_read" ON countries
  FOR SELECT USING (true);

-- 4.2 Profiles
CREATE POLICY "profiles_read_public" ON profiles
  FOR SELECT USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4.3 Races — lectura
CREATE POLICY "races_read_approved" ON races
  FOR SELECT USING (moderation_status = 'approved');

-- 4.3b Races — lectura de propias pendientes (organizador ve sus carreras pendientes)
CREATE POLICY "races_read_own_pending" ON races
  FOR SELECT USING (
    created_by = auth.uid() AND moderation_status IN ('pending', 'rejected')
  );

-- 4.4 Races — organizador crea (source='organizer', aprobación automática)
CREATE POLICY "races_insert_organizer" ON races
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- 4.5 Races — organizador edita solo las suyas
CREATE POLICY "races_update_organizer" ON races
  FOR UPDATE USING (
    organizer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('organizer', 'admin')
    )
  );

-- 4.6 Races — admin puede todo
CREATE POLICY "races_admin_all" ON races
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4.7 Favorites — cada usuario gestiona los suyos
CREATE POLICY "favorites_select_own" ON favorites
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "favorites_insert_own" ON favorites
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "favorites_delete_own" ON favorites
  FOR DELETE USING (user_id = auth.uid());

-- 4.8 Sugerencias — cualquier logueado crea, admin lee todas
CREATE POLICY "suggestions_insert_auth" ON race_suggestions
  FOR INSERT WITH CHECK (auth.uid() = suggested_by);

CREATE POLICY "suggestions_read_own" ON race_suggestions
  FOR SELECT USING (suggested_by = auth.uid());

CREATE POLICY "suggestions_admin" ON race_suggestions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- ============================================================
-- PARTE 5: STORAGE (para logos e imágenes)
-- ============================================================

-- Ejecutar esto desde la sección Storage de Supabase o por SQL:
INSERT INTO storage.buckets (id, name, public) 
VALUES ('race-images', 'race-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public) 
VALUES ('org-logos', 'org-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Políticas de storage
CREATE POLICY "race_images_read" ON storage.objects
  FOR SELECT USING (bucket_id IN ('race-images', 'org-logos'));

CREATE POLICY "race_images_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id IN ('race-images', 'org-logos')
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "race_images_update" ON storage.objects
  FOR UPDATE USING (
    bucket_id IN ('race-images', 'org-logos')
    AND auth.uid() = owner
  );
