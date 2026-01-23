-- RLS FIX: Suppression de la récursion infinie et ajout de la visibilité pour les collaborateurs

-- 1. Fonction de vérification (SECURITY DEFINER pour bypasser RLS et casser la récursion)
CREATE OR REPLACE FUNCTION public.check_equipe_access(target_equipe_id UUID)
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

-- --- TABLE: equipes ---
ALTER TABLE public.equipes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipes_select" ON public.equipes;
DROP POLICY IF EXISTS "equipes_insert" ON public.equipes;
DROP POLICY IF EXISTS "equipes_update_delete" ON public.equipes;

CREATE POLICY "equipes_select" ON public.equipes FOR SELECT 
USING (createur_id = auth.uid() OR public.check_equipe_access(id));

CREATE POLICY "equipes_insert" ON public.equipes FOR INSERT 
WITH CHECK (auth.uid() = createur_id);

CREATE POLICY "equipes_update_delete" ON public.equipes FOR ALL 
USING (auth.uid() = createur_id);


-- --- TABLE: equipe_membres ---
ALTER TABLE public.equipe_membres ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "membres_select" ON public.equipe_membres;
DROP POLICY IF EXISTS "membres_insert" ON public.equipe_membres;
DROP POLICY IF EXISTS "membres_delete" ON public.equipe_membres;

CREATE POLICY "membres_select" ON public.equipe_membres FOR SELECT 
USING (utilisateur_id = auth.uid() OR public.check_equipe_access(equipe_id));

CREATE POLICY "membres_insert" ON public.equipe_membres FOR INSERT 
WITH CHECK (
    utilisateur_id = auth.uid() 
    OR 
    EXISTS (SELECT 1 FROM public.equipes WHERE id = equipe_id AND createur_id = auth.uid())
);

CREATE POLICY "membres_delete" ON public.equipe_membres FOR DELETE 
USING (utilisateur_id = auth.uid() OR EXISTS (SELECT 1 FROM public.equipes WHERE id = equipe_id AND createur_id = auth.uid()));


-- --- TABLE: invitations ---
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invitations_owner" ON public.invitations;
DROP POLICY IF EXISTS "invitations_recipient" ON public.invitations;

CREATE POLICY "invitations_owner" ON public.invitations FOR ALL 
USING (auth.uid() = createur_id);

CREATE POLICY "invitations_recipient" ON public.invitations FOR SELECT 
USING (
    email = auth.jwt() ->> 'email' 
    OR 
    auth.uid() = createur_id 
    OR 
    (token IS NOT NULL AND statut = 'en_attente')
);


-- --- TABLE: equipe_examens ---
ALTER TABLE public.equipe_examens ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "equipe_examens_select" ON public.equipe_examens;
DROP POLICY IF EXISTS "equipe_examens_all" ON public.equipe_examens;

CREATE POLICY "equipe_examens_select" ON public.equipe_examens FOR SELECT 
USING (public.check_equipe_access(equipe_id));

CREATE POLICY "equipe_examens_all" ON public.equipe_examens FOR ALL 
USING (public.check_equipe_access(equipe_id));


-- --- EXTENSION: Visibilité des examens et profils ---

-- 2. Autoriser les membres d'une équipe à voir les examens partagés
ALTER TABLE public.examens ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "examens_select_collaboration" ON public.examens;
CREATE POLICY "examens_select_collaboration" ON public.examens FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.equipe_examens ee
        WHERE ee.examen_id = public.examens.id AND public.check_equipe_access(ee.equipe_id)
    )
);

-- 3. Autoriser la lecture des profils pour les membres de l'équipe
-- Note: On vérifie si la table existe avant d'appliquer
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'profiles') THEN
        ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
        DROP POLICY IF EXISTS "profiles_select_collaboration" ON public.profiles;
        CREATE POLICY "profiles_select_collaboration" ON public.profiles FOR SELECT 
        USING (true); -- Plus simple pour commencer, peut être restreint si besoin
    END IF;
END $$;
