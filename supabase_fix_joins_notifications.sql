-- RLS FIX: Correction des relations (Foreign Keys) et des accès Notifications

-- 1. Ajout des contraintes Foreign Key manquantes pour permettre les Joins (PostgREST)
-- On utilise un bloc DO pour éviter les erreurs si déjà présent
DO $$ 
BEGIN
    -- Contrainte pour equipe_membres -> profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'equipe_membres_utilisateur_id_fkey') THEN
        ALTER TABLE public.equipe_membres 
        ADD CONSTRAINT equipe_membres_utilisateur_id_fkey 
        FOREIGN KEY (utilisateur_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
    END IF;
END $$;

-- --- TABLE: notification_preferences ---
-- S'assurer que la table existe et que RLS est bien configuré pour les nouveaux utilisateurs
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

-- Ajout d'une politique pour permettre l'insertion initiale si elle manque
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

-- S'assurer que les profils sont lisibles entre membres
DROP POLICY IF EXISTS "profiles_select_collaboration" ON public.profiles;
CREATE POLICY "profiles_select_collaboration" ON public.profiles FOR SELECT 
USING (true);
