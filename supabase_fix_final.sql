-- RLS FIX: Correction des relations (Foreign Keys) et des accès Notifications

-- 1. Utilisation de la table existante 'utilisateurs' au lieu de 'profiles'
-- Ajout des contraintes Foreign Key manquantes pour permettre les Joins (PostgREST)
DO $$ 
BEGIN
    -- Contrainte pour equipe_membres -> utilisateurs
    IF EXISTS (SELECT 1 FROM pg_tables WHERE tablename = 'utilisateurs') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'equipe_membres_utilisateur_id_fkey') THEN
            ALTER TABLE public.equipe_membres 
            ADD CONSTRAINT equipe_membres_utilisateur_id_fkey 
            FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;
        END IF;
    END IF;
END $$;

-- --- TABLE: notification_preferences ---
-- S'assurer que la table existe
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    new_correction BOOLEAN DEFAULT true,
    validation BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres préférences" ON public.notification_preferences;
CREATE POLICY "Les utilisateurs peuvent voir leurs propres préférences" 
ON public.notification_preferences FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres préférences" ON public.notification_preferences;
CREATE POLICY "Les utilisateurs peuvent modifier leurs propres préférences" 
ON public.notification_preferences FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs préférences" ON public.notification_preferences;
CREATE POLICY "Les utilisateurs peuvent créer leurs préférences" 
ON public.notification_preferences FOR INSERT 
WITH CHECK (auth.uid() = user_id);


-- --- RE-SYNC: Vérification de la visibilité globale pour les collaborateurs ---

-- S'assurer que les examens partagés sont bien lisibles
DROP POLICY IF EXISTS "examens_select_collaboration" ON public.examens;
CREATE POLICY "examens_select_collaboration" ON public.examens FOR SELECT 
USING (
    EXISTS (
        SELECT 1 FROM public.equipe_examens ee
        WHERE ee.examen_id = public.examens.id AND public.check_equipe_access(ee.equipe_id)
    )
);

-- S'assurer que les utilisateurs sont lisibles entre membres
DROP POLICY IF EXISTS "utilisateurs_select_collaboration" ON public.utilisateurs;
CREATE POLICY "utilisateurs_select_collaboration" ON public.utilisateurs FOR SELECT 
USING (true); -- Visibilité basique des noms/emails pour la collaboration
