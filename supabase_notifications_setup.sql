-- Script SQL pour configurer le système de notifications dans Supabase

-- 1. Table des notifications
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Index pour la performance
CREATE INDEX IF NOT EXISTS notifications_user_id_idx ON public.notifications(user_id);

-- Activer Row Level Security (RLS)
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité (RLS)
CREATE POLICY "Les utilisateurs peuvent voir leurs propres notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent mettre à jour leurs propres notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres notifications" 
ON public.notifications FOR DELETE 
USING (auth.uid() = user_id);

-- Note: Pour l'ajout de notifications, si c'est fait côté client :
CREATE POLICY "Les utilisateurs peuvent créer des notifications" 
ON public.notifications FOR INSERT 
WITH CHECK (auth.uid() = user_id);


-- 2. Table des préférences de notifications
CREATE TABLE IF NOT EXISTS public.notification_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    new_correction BOOLEAN DEFAULT true,
    validation BOOLEAN DEFAULT true,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Activer RLS
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les préférences
CREATE POLICY "Les utilisateurs peuvent voir leurs propres préférences" 
ON public.notification_preferences FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres préférences" 
ON public.notification_preferences FOR ALL 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
