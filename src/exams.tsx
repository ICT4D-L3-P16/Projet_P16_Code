import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './lib/supabaseClient'
import { useAuth } from './context/AuthContext'

export type StudentFile = {
  id: string
  name: string
  url?: string
  uploadedAt: string
  etudiantId?: string
}

export type Epreuve = {
  id: string
  codeEpreuve: string
  nomFichier?: string
  cheminFichier?: string
  dureeMinutes: number
}

export type Corrige = {
  id: string
  epreuveId: string
  nomFichier?: string
  cheminFichier?: string
  baremeJson?: any
  reponsesAttendues?: string
  totalPoints: number
}

export type Exam = {
  id: string
  titre: string
  classe?: string
  matiere: string
  dateExamen: string
  statut: 'brouillon' | 'publie' | 'termine'
  epreuve?: Epreuve
  corrige?: Corrige
  copies: StudentFile[]
  createdAt?: string
  updatedAt?: string
}

type CreateExamPayload = {
  titre: string
  classe?: string
  matiere: string
  dateExamen: string
  dureeMinutes?: number
  epreuveFile?: File | null
  correctionFile?: File | null
}

type ExamsContextType = {
  exams: Exam[]
  isLoading: boolean
  error: string | null
  createExam: (payload: CreateExamPayload) => Promise<Exam | null>
  addStudentFiles: (examId: string, files: File[]) => Promise<StudentFile[]>
  refreshExams: () => Promise<void>
  deleteExam: (examId: string) => Promise<boolean>
}

const ExamsContext = createContext<ExamsContextType | undefined>(undefined)

export const ExamsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, session } = useAuth()
  const [exams, setExams] = useState<Exam[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Charger les examens de l'utilisateur au montage
  useEffect(() => {
    console.debug('[ExamsProvider] session/user changed', { session: !!session, userId: user?.id })

    if (session && user) {
      refreshExams()
    } else {
      setExams([])
      setIsLoading(false)
    }
  }, [session, user])

  // Fonction pour rafraîchir les examens
  const refreshExams = async () => {
    if (!user) return

    try {
      console.debug('[ExamsProvider] refreshExams start for user', user.id)
      setIsLoading(true)
      setError(null)

      // Récupérer les examens avec leurs relations
      const { data: examensData, error: examensError } = await supabase
        .from('examens')
        .select(`
          *,
          epreuves (*),
          copies (*)
        `)
        .eq('utilisateur_id', user.id)
        .order('created_at', { ascending: false })

      if (examensError) throw examensError

      // Récupérer les corrigés pour chaque épreuve
      const examsWithDetails: Exam[] = await Promise.all(
        (examensData || []).map(async (examen) => {
          let corrige: Corrige | undefined

          if (examen.epreuves && examen.epreuves.length > 0) {
            const epreuveId = examen.epreuves[0].id

            const { data: corrigeData } = await supabase
              .from('corriges')
              .select('*')
              .eq('epreuve_id', epreuveId)
              .single()

            if (corrigeData) {
              corrige = {
                id: corrigeData.id,
                epreuveId: corrigeData.epreuve_id,
                nomFichier: corrigeData.nom_fichier,
                cheminFichier: corrigeData.chemin_fichier,
                baremeJson: corrigeData.bareme_json,
                reponsesAttendues: corrigeData.reponses_attendues,
                totalPoints: corrigeData.total_points
              }
            }
          }

          return {
            id: examen.id,
            titre: examen.titre,
            classe: examen.classe,
            matiere: examen.matiere,
            dateExamen: examen.date_examen,
            statut: examen.statut,
            epreuve: examen.epreuves?.[0] ? {
              id: examen.epreuves[0].id,
              codeEpreuve: examen.epreuves[0].code_epreuve,
              nomFichier: examen.epreuves[0].nom_fichier,
              cheminFichier: examen.epreuves[0].chemin_fichier,
              dureeMinutes: examen.epreuves[0].duree_minutes
            } : undefined,
            corrige,
            copies: (examen.copies || []).map((copie: any) => ({
              id: copie.id,
              name: copie.nom_fichier,
              url: copie.chemin_image,
              uploadedAt: copie.created_at,
              etudiantId: copie.etudiant_id
            })),
            createdAt: examen.created_at,
            updatedAt: examen.updated_at
          }
        })
      )

      setExams(examsWithDetails)
    } catch (err: any) {
      console.error('Erreur lors du chargement des examens:', err)
      setError(err.message || 'Erreur lors du chargement des examens')
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour créer un examen
  const createExam = async (payload: CreateExamPayload): Promise<Exam | null> => {
    if (!user) {
      setError('Utilisateur non authentifié')
      return null
    }

    try {
      setError(null)

      // CORRECTION: Vérifier d'abord si l'utilisateur existe dans la table utilisateurs
      const { data: utilisateurData, error: utilisateurCheckError } = await supabase
        .from('utilisateurs')
        .select('id')
        .eq('id', user.id)
        .single()

      // Si l'utilisateur n'existe pas dans la table utilisateurs, le créer
      if (utilisateurCheckError || !utilisateurData) {
        console.log('Utilisateur non trouvé dans la table utilisateurs, création...')
        
        const { data: newUtilisateur, error: createUtilisateurError } = await supabase
          .from('utilisateurs')
          .insert({
            id: user.id,
            email: user.email,
            nom: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Utilisateur',
            role: 'enseignant'
          })
          .select()
          .single()

        if (createUtilisateurError) {
          console.error('Erreur lors de la création de l\'utilisateur:', createUtilisateurError)
          throw new Error(`Impossible de créer l'utilisateur: ${createUtilisateurError.message}`)
        }

        console.log('Utilisateur créé avec succès:', newUtilisateur)
      }

      // 1. Créer l'examen
      const { data: examenData, error: examenError } = await supabase
        .from('examens')
        .insert({
          utilisateur_id: user.id,
          titre: payload.titre,
          classe: payload.classe,
          date_examen: payload.dateExamen,
          matiere: payload.matiere,
          statut: 'brouillon'
        })
        .select()
        .single()

      if (examenError) throw examenError

      let epreuve: Epreuve | undefined
      let corrige: Corrige | undefined

      // 2. Uploader le fichier d'épreuve si présent
      if (payload.epreuveFile) {
        const fileName = `${Date.now()}_${payload.epreuveFile.name}`
        const filePath = `${user.id}/${examenData.id}/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('epreuves')
          .upload(filePath, payload.epreuveFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('epreuves')
          .getPublicUrl(filePath)

        // 3. Créer l'épreuve
        const { data: epreuveData, error: epreuveError } = await supabase
          .from('epreuves')
          .insert({
            examen_id: examenData.id,
            code_epreuve: `EPR-${examenData.id.slice(0, 8)}`,
            nom_fichier: payload.epreuveFile.name,
            chemin_fichier: publicUrlData.publicUrl,
            duree_minutes: payload.dureeMinutes || 60
          })
          .select()
          .single()

        if (epreuveError) throw epreuveError

        epreuve = {
          id: epreuveData.id,
          codeEpreuve: epreuveData.code_epreuve,
          nomFichier: epreuveData.nom_fichier,
          cheminFichier: epreuveData.chemin_fichier,
          dureeMinutes: epreuveData.duree_minutes
        }

        // 4. Uploader le corrigé si présent
        if (payload.correctionFile) {
          const correctionFileName = `${Date.now()}_${payload.correctionFile.name}`
          const correctionFilePath = `${user.id}/${examenData.id}/${correctionFileName}`

          const { error: correctionUploadError } = await supabase.storage
            .from('corriges')
            .upload(correctionFilePath, payload.correctionFile)

          if (correctionUploadError) throw correctionUploadError

          const { data: correctionPublicUrlData } = supabase.storage
            .from('corriges')
            .getPublicUrl(correctionFilePath)

          // 5. Créer le corrigé
          const { data: corrigeData, error: corrigeError } = await supabase
            .from('corriges')
            .insert({
              epreuve_id: epreuveData.id,
              nom_fichier: payload.correctionFile.name,
              chemin_fichier: correctionPublicUrlData.publicUrl,
              total_points: 0
            })
            .select()
            .single()

          if (corrigeError) throw corrigeError

          corrige = {
            id: corrigeData.id,
            epreuveId: corrigeData.epreuve_id,
            nomFichier: corrigeData.nom_fichier,
            cheminFichier: corrigeData.chemin_fichier,
            totalPoints: corrigeData.total_points
          }
        }
      }

      const newExam: Exam = {
        id: examenData.id,
        titre: examenData.titre,
        classe: examenData.classe,
        matiere: examenData.matiere,
        dateExamen: examenData.date_examen,
        statut: examenData.statut,
        epreuve,
        corrige,
        copies: [],
        createdAt: examenData.created_at
      }

      setExams((prev) => [newExam, ...prev])
      return newExam

    } catch (err: any) {
      console.error('Erreur lors de la création de l\'examen:', err)
      setError(err.message || 'Erreur lors de la création de l\'examen')
      return null
    }
  }

  // Fonction pour ajouter des copies d'étudiants
  const addStudentFiles = async (examId: string, files: File[]): Promise<StudentFile[]> => {
    if (!user) {
      setError('Utilisateur non authentifié')
      return []
    }

    try {
      setError(null)
      const uploadedFiles: StudentFile[] = []

      for (const file of files) {
        const fileName = `${Date.now()}_${file.name}`
        const filePath = `${user.id}/${examId}/${fileName}`

        // Upload vers Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('copies')
          .upload(filePath, file)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('copies')
          .getPublicUrl(filePath)

        // Créer l'enregistrement dans la table copies
        const { data: copieData, error: copieError } = await supabase
          .from('copies')
          .insert({
            examen_id: examId,
            nom_fichier: file.name,
            chemin_image: publicUrlData.publicUrl,
            statut_correction: 'en_attente'
          })
          .select()
          .single()

        if (copieError) throw copieError

        uploadedFiles.push({
          id: copieData.id,
          name: copieData.nom_fichier,
          url: copieData.chemin_image,
          uploadedAt: copieData.created_at
        })
      }

      // Mettre à jour l'état local
      setExams((prev) =>
        prev.map((ex) =>
          ex.id === examId
            ? { ...ex, copies: [...ex.copies, ...uploadedFiles] }
            : ex
        )
      )

      return uploadedFiles

    } catch (err: any) {
      console.error('Erreur lors de l\'ajout des copies:', err)
      setError(err.message || 'Erreur lors de l\'ajout des copies')
      return []
    }
  }

  // Fonction pour supprimer un examen
  const deleteExam = async (examId: string): Promise<boolean> => {
    if (!user) {
      setError('Utilisateur non authentifié')
      return false
    }

    try {
      setError(null)

      // Supabase gère la suppression en cascade grâce aux contraintes ON DELETE CASCADE
      const { error: deleteError } = await supabase
        .from('examens')
        .delete()
        .eq('id', examId)

      if (deleteError) throw deleteError

      // Mettre à jour l'état local
      setExams((prev) => prev.filter((ex) => ex.id !== examId))
      return true

    } catch (err: any) {
      console.error('Erreur lors de la suppression de l\'examen:', err)
      setError(err.message || 'Erreur lors de la suppression de l\'examen')
      return false
    }
  }

  return (
    <ExamsContext.Provider
      value={{
        exams,
        isLoading,
        error,
        createExam,
        addStudentFiles,
        refreshExams,
        deleteExam
      }}
    >
      {children}
    </ExamsContext.Provider>
  )
}

export function useExams() {
  const ctx = useContext(ExamsContext)
  if (!ctx) throw new Error('useExams must be used within ExamsProvider')
  return ctx
}

export default ExamsProvider