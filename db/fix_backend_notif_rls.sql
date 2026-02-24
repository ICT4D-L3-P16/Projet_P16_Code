-- FIX: Autoriser le backend (utilisant la clé anon) à insérer des notifications
-- Cela permet l'envoi de notifications système lors des invitations

-- Supprimer l'ancienne politique restrictive
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer des notifications" ON public.notifications;

-- Créer une nouvelle politique permettant l'insertion :
-- 1. Par l'utilisateur lui-même (auth.uid() = user_id)
-- 2. Par le backend système (auth.uid() IS NULL lors de l'usage de la clé anon sans session)
CREATE POLICY "système_et_utilisateurs_insertion_notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

-- Note: Les politiques SELECT/UPDATE/DELETE restent sécurisées (auth.uid() = user_id)
-- afin que seul le destinataire puisse voir et gérer ses propres notifications.
