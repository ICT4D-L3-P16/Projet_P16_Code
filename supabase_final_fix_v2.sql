-- FINAL ROBUST FIX: Relations, Permissions et Notifications

-- 1. Réparation des relations pour PostgREST (Joins)
-- On utilise 'utilisateurs' car c'est la table réelle du projet.
DO $$ 
BEGIN
    -- Lien equipe_membres -> utilisateurs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'utilisateurs') THEN
        ALTER TABLE public.equipe_membres DROP CONSTRAINT IF EXISTS equipe_membres_utilisateur_id_fkey;
        ALTER TABLE public.equipe_membres 
        ADD CONSTRAINT equipe_membres_utilisateur_id_fkey 
        FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;
    END IF;
END $$;

-- 2. Initialisation propre de la table des préférences (pour éviter Erreur 406)
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    new_correction BOOLEAN DEFAULT true,
    validation BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activation RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Suppression et recréation des politiques pour être sûr
DROP POLICY IF EXISTS "notification_preferences_select" ON public.notification_preferences;
CREATE POLICY "notification_preferences_select" ON public.notification_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_insert" ON public.notification_preferences;
CREATE POLICY "notification_preferences_insert" ON public.notification_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "notification_preferences_update" ON public.notification_preferences;
CREATE POLICY "notification_preferences_update" ON public.notification_preferences FOR UPDATE USING (auth.uid() = user_id);


-- 3. Visibilité des Examens pour les collaborateurs
-- Cette politique permet à tout membre d'une équipe de voir les examens liés à cette équipe
DROP POLICY IF EXISTS "examens_select_collaborative" ON public.examens;
CREATE POLICY "examens_select_collaborative" ON public.examens FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.equipe_examens ee
        JOIN public.equipe_membres em ON em.equipe_id = ee.equipe_id
        WHERE ee.examen_id = public.examens.id AND em.utilisateur_id = auth.uid()
    )
);

-- Assurer que le créateur voit toujours ses examens
DROP POLICY IF EXISTS "examens_select_owner" ON public.examens;
CREATE POLICY "examens_select_owner" ON public.examens FOR SELECT 
USING (auth.uid() = utilisateur_id);


-- 4. Visibilité des utilisateurs (pour afficher les noms dans l'espace équipe)
DROP POLICY IF EXISTS "utilisateurs_select_public" ON public.utilisateurs;
CREATE POLICY "utilisateurs_select_public" ON public.utilisateurs FOR SELECT 
USING (true); -- Permet de voir les noms/emails basiques
