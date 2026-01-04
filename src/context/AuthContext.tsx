import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

// --- Types ---
interface UserProfile {
  id: string
  email: string
  nom?: string
  prenom?: string
  etablissement?: string
  role?: string
}

type AuthContextType = {
  user: SupabaseUser | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: any }>
  signIn: (email: string, password: string) => Promise<{ error: any }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// --- Provider ---
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    // 1. Récupérer la session initiale au montage
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // 2. Écouter les changements d'état (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Si l'utilisateur se connecte, on vérifie/crée son profil en DB
      if (session?.user && event === 'SIGNED_IN') {
        await ensureUserProfile(session.user)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  /**
   * S'assure qu'une entrée existe dans la table 'utilisateurs' pour l'ID Auth
   */
  const ensureUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { data: existingProfile, error: fetchError } = await supabase
        .from('utilisateurs')
        .select('id')
        .eq('id', supabaseUser.id)
        .single()

      // Si le profil n'existe pas (Erreur code PGRST116 = aucun résultat), on le crée
      if (fetchError && fetchError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('utilisateurs')
          .insert({
            id: supabaseUser.id,
            email: supabaseUser.email,
            nom: supabaseUser.user_metadata?.nom || '',
            prenom: supabaseUser.user_metadata?.prenom || '',
            etablissement: supabaseUser.user_metadata?.etablissement || '',
            role: 'enseignant' // Role par défaut
          })

        if (insertError) console.error('Erreur création profil:', insertError)
      }
    } catch (error) {
      console.error('Erreur lors de la synchronisation du profil:', error)
    }
  }

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nom: userData?.nom || '',
            prenom: userData?.prenom || '',
            etablissement: userData?.etablissement || ''
          }
        }
      })

      if (error) return { error }
      
      // Note: ensureUserProfile sera également déclenché par onAuthStateChange
      if (data.user) await ensureUserProfile(data.user)
      
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setSession(null)
      navigate('/login')
    } catch (error) {
      console.error('Erreur déconnexion:', error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!session,
        signUp,
        signIn,
        signOut
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// --- Hook ---
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
  }
  return context
}

export default AuthProvider