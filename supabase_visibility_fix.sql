-- EXAM VISIBILITY FIX (Owner + Collaborators)

-- 1. Ensure RLS is enabled on examens
ALTER TABLE public.examens ENABLE ROW LEVEL SECURITY;

-- 2. Clean up existing select policies to avoid conflicts
DROP POLICY IF EXISTS "examens_select_owner" ON public.examens;
DROP POLICY IF EXISTS "examens_select_collaborative" ON public.examens;
DROP POLICY IF EXISTS "examens_select_collaboration" ON public.examens;
DROP POLICY IF EXISTS "examens_select_global" ON public.examens;

-- 3. Policy: Owners can see their own exams
CREATE POLICY "examens_select_owner" ON public.examens FOR SELECT 
USING (auth.uid() = utilisateur_id);

-- 4. Policy: Collaborators can see exams shared with their teams
-- We use a direct join for maximum reliability
CREATE POLICY "examens_select_collaborative" ON public.examens FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.equipe_examens ee
        JOIN public.equipe_membres em ON em.equipe_id = ee.equipe_id
        WHERE ee.examen_id = public.examens.id AND em.utilisateur_id = auth.uid()
    )
);

-- 5. Ensure other tables related to exams also have proper policies if needed
-- (Assuming epreuves, copies, and corriges are linked and visible based on exam visibility or foreign keys)
-- Usually, we allow internal lookups if the parent exam is visible.
