import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useAuth } from './context/AuthContext'
import { useNotifications } from './notifications'

export type TeamPermission = {
  can_add_copies: boolean
  can_correct: boolean
  can_validate: boolean
  can_view_details: boolean
  can_export: boolean
}

export type Team = {
  id: string
  nom: string
  createur_id: string
  created_at: string
}

export type Invitation = {
  id: string
  equipe_id: string
  examen_id?: string
  email?: string
  token?: string
  createur_id: string
  permissions: TeamPermission
  statut: 'en_attente' | 'acceptee' | 'refusee'
  expires_at: string
  created_at: string
}

type TeamsContextType = {
  teams: Team[]
  isLoading: boolean
  userInvitations: Invitation[]
  sharedExams: any[]
  createTeam: (name: string) => Promise<Team | null>
  inviteToExam: (params: { examId?: string, teamId: string, email?: string, permissions: TeamPermission }) => Promise<string | null>
  acceptInvitation: (invitationId: string) => Promise<boolean>
  acceptInvitationByToken: (token: string) => Promise<boolean>
  refuseInvitation: (invitationId: string) => Promise<boolean>
  refreshTeams: () => Promise<void>
  refreshInvitations: () => Promise<void>
  refreshSharedExams: () => Promise<void>
  getTeamMembers: (teamId: string) => Promise<any[]>
  getTeamExams: (teamId: string) => Promise<any[]>
  getExamTeam: (examId: string) => Promise<Team | null>
  changeExamTeam: (examId: string, teamId: string | null) => Promise<boolean>
}

const TeamsContext = createContext<TeamsContextType | undefined>(undefined)

export const TeamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth()
  const { addNotification } = useNotifications()
  const [teams, setTeams] = useState<Team[]>([])
  const [userInvitations, setUserInvitations] = useState<Invitation[]>([])
  const [sharedExams, setSharedExams] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadAllData()
    } else {
      setTeams([])
      setUserInvitations([])
      setSharedExams([])
      setIsLoading(false)
    }
  }, [user])

  const loadAllData = async () => {
    setIsLoading(true)
    await Promise.all([
      refreshTeams(),
      refreshInvitations(),
      refreshSharedExams()
    ])
    setIsLoading(false)
  }

  const refreshTeams = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase
        .from('equipes')
        .select('*')
      
      if (error) {
         if (error.code === '42P01') return
         throw error
      }
      setTeams(data || [])
    } catch (err) {
      console.error('Error fetching teams:', err)
    }
  }

  const refreshInvitations = async () => {
    if (!user || !user.email) return
    try {
      const { data, error } = await supabase
        .from('invitations')
        .select('*')
        .or(`email.eq.${user.email},createur_id.eq.${user.id}`)
        .eq('statut', 'en_attente')

      if (error) {
        if (error.code === '42P01') return
        throw error
      }
      setUserInvitations(data || [])
    } catch (err) {
      console.error('Error fetching invitations:', err)
    }
  }

  const refreshSharedExams = async () => {
    if (!user) return
    try {
      const { data: memberTeams, error: memberError } = await supabase
        .from('equipe_membres')
        .select('equipe_id')
        .eq('utilisateur_id', user.id)
      
      if (memberError || !memberTeams || memberTeams.length === 0) {
        setSharedExams([])
        return
      }

      const teamIds = memberTeams.map(t => t.equipe_id)

      const { data, error } = await supabase
        .from('equipe_examens')
        .select(`
          examen_id,
          examens:examen_id (*)
        `)
        .in('equipe_id', teamIds)

      if (error) throw error

      const exams = (data || [])
        .filter((item: any) => item.examens && item.examens.utilisateur_id !== user.id)
        .map((item: any) => item.examens)
      
      const uniqueExams = Array.from(new Map(exams.map((e: any) => [e.id, e])).values())
      setSharedExams(uniqueExams)
    } catch (err) {
      console.error('Error fetching shared exams:', err)
    }
  }

  const createTeam = async (name: string): Promise<Team | null> => {
    if (!user) return null
    try {
      const { data: teamData, error: teamError } = await supabase
        .from('equipes')
        .insert({ nom: name, createur_id: user.id })
        .select()
        .single()

      if (teamError) throw teamError

      const { error: memberError } = await supabase
        .from('equipe_membres')
        .insert({ equipe_id: teamData.id, utilisateur_id: user.id, role: 'admin' })

      if (memberError) throw memberError

      setTeams(prev => [...prev, teamData])
      return teamData
    } catch (err) {
      console.error('Error creating team:', err)
      return null
    }
  }

  const inviteToExam = async ({ examId, teamId, email, permissions }: { examId?: string, teamId: string, email?: string, permissions: TeamPermission }): Promise<string | null> => {
    if (!user) return null
    try {
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      
      const { error } = await supabase
        .from('invitations')
        .insert({
          equipe_id: teamId,
          examen_id: examId || null,
          email: email?.trim() || null,
          token,
          createur_id: user.id,
          permissions,
          statut: 'en_attente'
        })

      if (error) throw error

      if (examId) {
        await supabase
          .from('equipe_examens')
          .upsert({ equipe_id: teamId, examen_id: examId })
      }

      return token
    } catch (err) {
      console.error('Error inviting to exam:', err)
      return null
    }
  }

  const acceptInvitation = async (invitationId: string): Promise<boolean> => {
    if (!user) return false
    try {
      // 0. S'assurer que l'utilisateur existe dans la table 'utilisateurs'
      // Pattern identique à exams.tsx pour garantir la cohérence des FK
      const { data: userData, error: userCheckError } = await supabase
        .from('utilisateurs')
        .select('id')
        .eq('id', user.id)
        .maybeSingle()

      if (!userData || userCheckError) {
        await supabase
          .from('utilisateurs')
          .insert({
            id: user.id,
            email: user.email,
            nom: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
            role: 'enseignant'
          })
      }

      const { data: invite, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('id', invitationId)
        .single()

      if (fetchError) throw fetchError

      const { error: updateError } = await supabase
        .from('invitations')
        .update({ statut: 'acceptee' })
        .eq('id', invitationId)

      if (updateError) throw updateError

      const { error: memberError } = await supabase
        .from('equipe_membres')
        .insert({ 
          equipe_id: invite.equipe_id, 
          utilisateur_id: user.id, 
          role: 'membre',
          permissions: invite.permissions 
        })

      if (memberError && memberError.code !== '23505') throw memberError

      if (invite.examen_id) {
         await supabase
          .from('equipe_examens')
          .upsert({ equipe_id: invite.equipe_id, examen_id: invite.examen_id })
      }

      await loadAllData()
      return true
    } catch (err) {
      console.error('Error accepting invitation:', err)
      return false
    }
  }

  const acceptInvitationByToken = async (token: string): Promise<boolean> => {
    if (!user) return false
    try {
      const { data: invite, error: fetchError } = await supabase
        .from('invitations')
        .select('*')
        .eq('token', token)
        .eq('statut', 'en_attente')
        .maybeSingle()

      if (fetchError) {
        console.error('Error fetching invitation by token:', fetchError)
        throw fetchError
      }

      if (!invite) {
        console.warn('Invitation not found or already accepted for token:', token)
        return false
      }

      // Use the existing accept logic
      return await acceptInvitation(invite.id)
    } catch (err) {
      console.error('Error accepting invitation by token:', err)
      return false
    }
  }

  const refuseInvitation = async (invitationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('invitations')
        .update({ statut: 'refusee' })
        .eq('id', invitationId)

      if (error) throw error
      await refreshInvitations()
      return true
    } catch (err) {
      console.error('Error refusing invitation:', err)
      return false
    }
  }

  const getTeamMembers = async (teamId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('equipe_membres')
        .select(`
          utilisateur_id,
          role,
          utilisateurs:utilisateur_id (nom, email)
        `)
        .eq('equipe_id', teamId)
      
      if (error) throw error
      return data || []
    } catch (err) {
      console.error('Error fetching team members:', err)
      return []
    }
  }

  const getTeamExams = async (teamId: string): Promise<any[]> => {
    try {
      const { data, error } = await supabase
        .from('equipe_examens')
        .select(`
          examen_id,
          examens:examen_id (*)
        `)
        .eq('equipe_id', teamId)
      
      if (error) throw error
      return (data || []).map((item: any) => item.examens).filter(Boolean)
    } catch (err) {
      console.error('Error fetching team exams:', err)
      return []
    }
  }

  const getExamTeam = async (examId: string): Promise<Team | null> => {
    try {
      const { data, error } = await supabase
        .from('equipe_examens')
        .select(`
          equipes:equipe_id (*)
        `)
        .eq('examen_id', examId)
        .maybeSingle()
      
      if (error) throw error
      const teamsData = data?.equipes
      return Array.isArray(teamsData) ? teamsData[0] : (teamsData || null)
    } catch (err) {
      console.error('Error fetching exam team:', err)
      return null
    }
  }

  const changeExamTeam = async (examId: string, teamId: string | null): Promise<boolean> => {
    try {
      // 1. Remove existing relation
      await supabase
        .from('equipe_examens')
        .delete()
        .eq('examen_id', examId)

      // 2. Add new relation if teamId is provided
      if (teamId) {
        const { error } = await supabase
          .from('equipe_examens')
          .insert({
            examen_id: examId,
            equipe_id: teamId
          })
        
        if (error) throw error
      }
      
      await loadAllData()
      return true
    } catch (err) {
      console.error('Error changing exam team:', err)
      return false
    }
  }

  return (
    <TeamsContext.Provider value={{
      teams,
      isLoading,
      userInvitations,
      sharedExams,
      createTeam,
      inviteToExam,
      acceptInvitation,
      acceptInvitationByToken,
      refuseInvitation,
      refreshTeams,
      refreshInvitations,
      refreshSharedExams,
      getTeamMembers,
      getTeamExams,
      getExamTeam,
      changeExamTeam
    }}>
      {children}
    </TeamsContext.Provider>
  )
}

export function useTeams() {
  const context = useContext(TeamsContext)
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamsProvider')
  }
  return context
}
