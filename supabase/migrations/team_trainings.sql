-- =====================================================
-- TEAM TRAININGS — Cronograma semanal del team
-- Actividades diversas (carrera, fuerza, estiramientos, técnica,
-- yoga, charla técnica, etc.) por día de la semana.
-- Lectura pública (cualquier visitante del perfil del team).
-- Escritura solo team owner (auth.uid() = team_id).
-- =====================================================

CREATE TABLE IF NOT EXISTS public.team_trainings (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    team_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Lun … 6=Dom
    track text NOT NULL DEFAULT 'training' CHECK (track IN ('training','extra','tip')),
    activity_type text,              -- 'run', 'strength', 'stretching', 'yoga', etc. (lista en js/auth.js _ACTIVITY_TYPES)
    shift text CHECK (shift IS NULL OR shift IN ('morning','afternoon','night')), -- legacy, opcional
    time_local text NOT NULL,        -- "HH:MM"
    location text NOT NULL,
    focus text,                      -- texto libre / detalle (ej: "6x1km a ritmo 21K")
    duration_min smallint,           -- duración estimada en minutos (opcional)
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para querys por team
CREATE INDEX IF NOT EXISTS idx_team_trainings_team_id ON public.team_trainings(team_id);
CREATE INDEX IF NOT EXISTS idx_team_trainings_team_day ON public.team_trainings(team_id, day_of_week);
CREATE INDEX IF NOT EXISTS idx_team_trainings_team_track ON public.team_trainings(team_id, track);

-- Trigger para updated_at automático
CREATE OR REPLACE FUNCTION public.set_team_trainings_updated_at()
RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS team_trainings_updated_at ON public.team_trainings;
CREATE TRIGGER team_trainings_updated_at
    BEFORE UPDATE ON public.team_trainings
    FOR EACH ROW EXECUTE FUNCTION public.set_team_trainings_updated_at();

-- RLS
ALTER TABLE public.team_trainings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read team trainings" ON public.team_trainings;
CREATE POLICY "Anyone can read team trainings"
    ON public.team_trainings
    FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Team owner can insert trainings" ON public.team_trainings;
CREATE POLICY "Team owner can insert trainings"
    ON public.team_trainings
    FOR INSERT
    WITH CHECK (auth.uid() = team_id);

DROP POLICY IF EXISTS "Team owner can update trainings" ON public.team_trainings;
CREATE POLICY "Team owner can update trainings"
    ON public.team_trainings
    FOR UPDATE
    USING (auth.uid() = team_id)
    WITH CHECK (auth.uid() = team_id);

DROP POLICY IF EXISTS "Team owner can delete trainings" ON public.team_trainings;
CREATE POLICY "Team owner can delete trainings"
    ON public.team_trainings
    FOR DELETE
    USING (auth.uid() = team_id);
