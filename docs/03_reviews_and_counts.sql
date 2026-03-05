-- ============================================================
-- PULZ — Migration: Race Reviews + Favorites Count
-- Ejecutar DESPUÉS de 01_schema.sql en Supabase SQL Editor
-- ============================================================

-- 1. Tabla de reviews
CREATE TABLE race_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  race_id UUID NOT NULL REFERENCES races(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  category TEXT,
  finish_time TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, race_id)
);

CREATE INDEX idx_reviews_race ON race_reviews(race_id);
CREATE INDEX idx_reviews_user ON race_reviews(user_id);

-- 2. RLS para reviews
ALTER TABLE race_reviews ENABLE ROW LEVEL SECURITY;

-- Todos pueden leer reviews (son publicas)
CREATE POLICY "reviews_read_public" ON race_reviews
  FOR SELECT USING (true);

-- Usuarios autenticados crean sus propias reviews
CREATE POLICY "reviews_insert_own" ON race_reviews
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Usuarios pueden editar sus propias reviews
CREATE POLICY "reviews_update_own" ON race_reviews
  FOR UPDATE USING (auth.uid() = user_id);

-- Usuarios pueden borrar sus propias reviews
CREATE POLICY "reviews_delete_own" ON race_reviews
  FOR DELETE USING (auth.uid() = user_id);

-- Admin puede todo
CREATE POLICY "reviews_admin_all" ON race_reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 3. Funcion RPC para contar favoritos por carrera (no expone user_ids)
CREATE OR REPLACE FUNCTION get_favorites_count()
RETURNS TABLE(race_id UUID, fav_count BIGINT) AS $$
  SELECT race_id, COUNT(*) as fav_count FROM favorites GROUP BY race_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- 4. Funcion RPC para obtener reviews con display_name del usuario
CREATE OR REPLACE FUNCTION get_race_reviews(p_race_id UUID)
RETURNS TABLE(
  id UUID,
  rating INT,
  category TEXT,
  finish_time TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ,
  user_id UUID,
  display_name TEXT
) AS $$
  SELECT
    r.id, r.rating, r.category, r.finish_time, r.comment, r.created_at,
    r.user_id, p.display_name
  FROM race_reviews r
  JOIN profiles p ON p.id = r.user_id
  WHERE r.race_id = p_race_id
  ORDER BY r.created_at DESC;
$$ LANGUAGE sql SECURITY DEFINER;
