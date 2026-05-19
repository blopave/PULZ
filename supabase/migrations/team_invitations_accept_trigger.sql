-- =====================================================
-- TEAM INVITATIONS — Trigger de aceptación
-- Cuando una invitación pasa de 'pending' a 'accepted', insertamos
-- automáticamente el row en team_members con status='member'.
-- Idempotente (ON CONFLICT) — si ya existe, solo actualiza decided_at.
--
-- También cubre el caso opuesto: si pasa a 'rejected'/'cancelled' y existe
-- un row 'pending' previo en team_members (de un flow viejo de postulación),
-- queda marcado 'removed' para que no aparezca como pendiente.
--
-- Modelo: PULZ teams son invite-only — el row 'member' nace SOLO del
-- accept de una invitación del captain, nunca de auto-postulación.
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_team_invitation_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    -- Solo procesar transiciones desde 'pending'
    IF OLD.status IS DISTINCT FROM 'pending' THEN
        RETURN NEW;
    END IF;

    IF NEW.status = 'accepted' THEN
        INSERT INTO public.team_members (user_id, team_id, status, decided_at, updated_at)
        VALUES (NEW.runner_id, NEW.team_id, 'member', now(), now())
        ON CONFLICT (user_id, team_id) DO UPDATE
            SET status = 'member',
                decided_at = now(),
                updated_at = now();
    ELSIF NEW.status IN ('rejected', 'cancelled') THEN
        UPDATE public.team_members
            SET status = 'removed',
                decided_at = now(),
                updated_at = now()
            WHERE user_id = NEW.runner_id
              AND team_id = NEW.team_id
              AND status = 'pending';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS team_invitations_change_trigger ON public.team_invitations;
CREATE TRIGGER team_invitations_change_trigger
    AFTER UPDATE OF status ON public.team_invitations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_team_invitation_change();
