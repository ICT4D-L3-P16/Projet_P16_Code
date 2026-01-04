import React, { createContext, useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import type { Session, User as SupabaseUser } from '@supabase/supabase-js'

// --- Types ---
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  // --- Initialisation ---
  useEffect(() => {
    let mounted = true

    const initializeAuth = async () => {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession()
        
        if (error) throw error

        if (mounted) {
          setSession(initialSession)
          setUser(initialSession?.user ?? null)
        }
      } catch (err) {
        console.error('[AuthContext] Erreur session initiale:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    initializeAuth()

    // --- Écouteur de changements d'état ---
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      console.debug('[AuthContext] Event:', event)
      
      setSession(currentSession)
      setUser(currentSession?.user ?? null)

      if (event === 'SIGNED_IN' && currentSession?.user) {
        // On vérifie le profil en arrière-plan (non bloquant)
        ensureUserProfile(currentSession.user)
        setLoading(false)
      }

      if (event === 'SIGNED_OUT') {
        setLoading(false)
        navigate('/login')
      }

      // Sécurité : on s'assure que le loader s'arrête sur les autres événements
      if (event === 'INITIAL_SESSION' || event === 'USER_UPDATED') {
        setLoading(false)
      }
    })

    // --- Gestion de la visibilité du navigateur (Tab focus) ---
    const onVisibility = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)

    return () => {
      mounted = false
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [navigate])

  /**
   * S'assure qu'une entrée existe dans la table 'utilisateurs'
   * Utilise UPSERT pour éviter les erreurs de duplication (ON CONFLICT)
   */
  const ensureUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      const { error } = await supabase
        .from('utilisateurs')
        .upsert({
          id: supabaseUser.id,
          email: supabaseUser.email,
          nom: supabaseUser.user_metadata?.nom || '',
          role: 'enseignant',
          updated_at: new Date().toISOString()
        }, { onConflict: 'id' })

      if (error) {
        console.warn('[AuthContext] Note: Erreur mineure lors du check profil (souvent ignorée par le trigger SQL):', error.message)
      }
    } catch (err) {
      console.error('[AuthContext] Erreur critique sync profil:', err)
    }
  }

  // --- Méthodes d'action ---

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
      if (data.user) await ensureUserProfile(data.user)
      return { error: null }
    } catch (error) {
      return { error }
    }
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true) // On relance le loader pendant la tentative
    try {
      const result = await supabase.auth.signInWithPassword({ email, password })
      return result
    } catch (error) {
      setLoading(false)
      return { error }
    }
  }

  const signOut = async () => {
    setLoading(true)
    try {
      // 1. Déconnexion Supabase
      await supabase.auth.signOut()
    } catch (error) {
      console.error('[AuthContext] Erreur pendant signOut:', error)
    } finally {
      // 2. Nettoyage Forcé (même si Supabase échoue)
      setUser(null)
      setSession(null)
      localStorage.clear() // Nettoie les tokens corrompus
      setLoading(false)
      navigate('/login')
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

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider')
  }
  return context
}

export default AuthProvider