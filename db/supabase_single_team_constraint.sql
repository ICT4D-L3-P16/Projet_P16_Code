-- SQL Migration: Single Team Constraint, Team Transfer & Permissions

-- 1. Enforce 0 or 1 team per exam
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'equipe_examens_examen_id_key') THEN
        ALTER TABLE public.equipe_examens ADD CONSTRAINT equipe_examens_examen_id_key UNIQUE (examen_id);
    END IF;
END $$;

-- 2. Add permissions column to equipe_membres to persist rights
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'equipe_membres' AND column_name = 'permissions') THEN
        ALTER TABLE public.equipe_membres ADD COLUMN permissions JSONB DEFAULT '{"can_add_copies": true, "can_correct": true, "can_validate": false, "can_view_details": true, "can_export": false}'::JSONB;
    END IF;
END $$;

-- 3. Function to change an exam's team (for the owner)
CREATE OR REPLACE FUNCTION public.transfer_exam_to_team(target_exam_id UUID, target_team_id UUID)
RETURNS VOID AS $$
BEGIN
    DELETE FROM public.equipe_examens WHERE examen_id = target_exam_id;
    
    IF target_team_id IS NOT NULL THEN
        INSERT INTO public.equipe_examens (equipe_id, examen_id)
        VALUES (target_team_id, target_exam_id);
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Ensure RLS allows the creator of an exam to manage its team links
DROP POLICY IF EXISTS "exam_owner_manage_links" ON public.equipe_examens;
CREATE POLICY "exam_owner_manage_links" ON public.equipe_examens FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM public.examens 
        WHERE id = examen_id AND utilisateur_id = auth.uid()
    )
);
