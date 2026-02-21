-- même pour les utilisateurs non encore enregistrés dans la table 'utilisateurs'

-- 0. Ajout de la colonne permissions si manquante
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='equipe_membres' AND column_name='permissions') THEN
        ALTER TABLE public.equipe_membres ADD COLUMN permissions JSONB DEFAULT '{
            "can_view_details": true,
            "can_add_copies": false,
            "can_correct": false,
            "can_validate": false,
            "can_export": false
        }'::jsonb;
    END IF;
END $$;

-- 1. On s'assure que RLS est activé
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- 2. Suppression des anciennes politiques potentiellement restrictives
DROP POLICY IF EXISTS "invitations_owner" ON public.invitations;
DROP POLICY IF EXISTS "invitations_recipient" ON public.invitations;
DROP POLICY IF EXISTS "invitations_access" ON public.invitations;

-- 3. Nouvelle politique d'accès universelle par token
-- Autorise SELECT si :
-- - L'utilisateur est le créateur
-- - L'utilisateur a le bon email (si logué)
-- - OU le token est fourni et l'invitation est en attente (accès public par token)
CREATE POLICY "invitations_public_token_access" ON public.invitations
FOR SELECT TO anon, authenticated
USING (
    auth.uid() = createur_id 
    OR email = auth.jwt() ->> 'email'
    OR (token IS NOT NULL AND statut = 'en_attente')
);

-- 4. Politique pour la création (INSERT)
CREATE POLICY "invitations_insert_access" ON public.invitations
FOR INSERT TO authenticated
WITH CHECK (auth.uid() = createur_id);

-- 5. Politique pour l'acceptation (UPDATE)
-- L'utilisateur doit être authentifié pour accepter
CREATE POLICY "invitations_update_access" ON public.invitations
FOR UPDATE TO authenticated
USING (
    auth.uid() = createur_id 
    OR email = auth.jwt() ->> 'email'
    OR (token IS NOT NULL AND statut = 'en_attente')
)
WITH CHECK (
    statut IN ('acceptee', 'refusee')
);

-- 6. Politique pour la suppression (DELETE)
CREATE POLICY "invitations_delete_access" ON public.invitations
FOR DELETE TO authenticated
USING (auth.uid() = createur_id);

-- Note: Assurez-vous aussi que la table 'utilisateurs' permet la lecture
-- pour que le check d'email fonctionne si on utilise une jointure
