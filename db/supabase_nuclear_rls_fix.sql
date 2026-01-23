-- NUCLEAR RLS RECURSION FIX
-- This script replaces all recursive policies with SECURITY DEFINER functions

-- 1. Helper function for Team access (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.check_equipe_access_v2(target_equipe_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.equipes 
        WHERE id = target_equipe_id AND createur_id = auth.uid()
    ) OR EXISTS (
        SELECT 1 FROM public.equipe_membres 
        WHERE equipe_id = target_equipe_id AND utilisateur_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Helper function for Exam access (SECURITY DEFINER)
-- This BROKEN the recursion by querying the tables directly without invoking RLS again
CREATE OR REPLACE FUNCTION public.check_examen_access_v2(target_examen_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    -- Is owner?
    IF EXISTS (SELECT 1 FROM public.examens WHERE id = target_examen_id AND utilisateur_id = auth.uid()) THEN
        RETURN TRUE;
    END IF;

    -- Is collaborator via team?
    RETURN EXISTS (
        SELECT 1 FROM public.equipe_examens ee
        JOIN public.equipe_membres em ON em.equipe_id = ee.equipe_id
        WHERE ee.examen_id = target_examen_id AND em.utilisateur_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Reset Policies for 'examens'
ALTER TABLE public.examens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "examens_select_owner" ON public.examens;
DROP POLICY IF EXISTS "examens_select_collaborative" ON public.examens;
DROP POLICY IF EXISTS "examens_select_collaboration" ON public.examens;
DROP POLICY IF EXISTS "examens_select_global" ON public.examens;
DROP POLICY IF EXISTS "examens_all_v2" ON public.examens;

-- Single comprehensive policy using the helper function
CREATE POLICY "examens_visibility_final" ON public.examens FOR ALL
USING (public.check_examen_access_v2(id));


-- 4. Reset Policies for 'equipe_examens'
ALTER TABLE public.equipe_examens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "equipe_examens_select" ON public.equipe_examens;
DROP POLICY IF EXISTS "equipe_examens_all" ON public.equipe_examens;
DROP POLICY IF EXISTS "exam_owner_manage_links" ON public.equipe_examens;

-- Use team access checker to break recruitment
CREATE POLICY "equipe_examens_visibility_final" ON public.equipe_examens FOR ALL
USING (
    public.check_equipe_access_v2(equipe_id) 
    OR 
    EXISTS (SELECT 1 FROM public.examens WHERE id = examen_id AND utilisateur_id = auth.uid())
);


-- 5. Fix for Invitations (ensure owner can see)
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "invitations_owner" ON public.invitations;
DROP POLICY IF EXISTS "invitations_recipient" ON public.invitations;

CREATE POLICY "invitations_access" ON public.invitations FOR ALL
USING (
    createur_id = auth.uid() 
    OR email = (SELECT email FROM public.utilisateurs WHERE id = auth.uid())
    OR (token IS NOT NULL AND statut = 'en_attente')
);

-- 6. Ensure 'equipes' and 'equipe_membres' are safe
DROP POLICY IF EXISTS "equipes_access" ON public.equipes;
CREATE POLICY "equipes_access" ON public.equipes FOR ALL
USING (createur_id = auth.uid() OR public.check_equipe_access_v2(id));

DROP POLICY IF EXISTS "membres_access" ON public.equipe_membres;
CREATE POLICY "membres_access" ON public.equipe_membres FOR ALL
USING (utilisateur_id = auth.uid() OR public.check_equipe_access_v2(equipe_id));
