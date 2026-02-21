import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useExams } from '../exams'
import { useNotifications } from '../notifications'
import { useTeams } from '../teams'
import type { TeamPermission } from '../teams'
import { useAuth } from '../context/AuthContext'
import { 
  ChevronLeft, 
  Trash2, 
  BookOpen, 
  GraduationCap, 
  Calendar, 
  Download, 
  Play, 
  AlertTriangle,
  UploadCloud,
  FileText,
  Clock,
  Loader2,
  FileCheck,
  Settings,
  LayoutDashboard,
  CheckCircle2,
  X,
  Share2
} from 'lucide-react'
import { InviteModal } from '../components/Dashboard/InviteModal'
import { transformResults } from '../lib/correctionApi'

const ExamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { exams, addStudentFiles, deleteExam, isLoading, updateExamStatus, updateExamDocuments, refreshExams } = useExams()
  const { addNotification } = useNotifications()
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<'management' | 'results'>('management')
  const [hasStoredResults, setHasStoredResults] = useState(false)

  // Correction state
  const [grading, setGrading] = useState(false)
  const [gradingProgress, setGradingProgress] = useState(0)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showSettingsModal, setShowSettingsModal] = useState(false)
  const [updatingDoc, setUpdatingDoc] = useState<'epreuve' | 'corrige' | null>(null)

  // Team & Permissions mapping
  const { user } = useAuth()
  const { teams, changeExamTeam, getTeamMembers } = useTeams()
  const [permissions, setPermissions] = useState<TeamPermission>({
    can_add_copies: true,
    can_correct: true,
    can_validate: true,
    can_view_details: true,
    can_export: true
  })

  const exam = exams.find((e) => e.id === id)

  useEffect(() => {
    if (!isLoading && !exam) {
      navigate('/dashboard/examens')
    }
    
    // Check for existing results
    if (id) {
      const saved = sessionStorage.getItem(`correction_${id}`)
      if (saved) {
        setHasStoredResults(true)
        // Auto-switch to results view if already corrected or validated
        if (exam?.statut === 'valide' || exam?.statut === 'termine') {
          setViewMode('results')
        }
      }
    }
  }, [exam, isLoading, navigate, id])

  useEffect(() => {
    const fetchPermissions = async () => {
      if (!exam || !user) return
      
      const isOwner = exam.utilisateur_id === user.id
      if (isOwner) {
        setPermissions({
          can_add_copies: true,
          can_correct: true,
          can_validate: true,
          can_view_details: true,
          can_export: true
        })
        return
      }

      if (exam.team_id) {
        const members = await getTeamMembers(exam.team_id)
        const myMember = members.find(m => m.utilisateur_id === user.id)
        if (myMember) {
          setPermissions(myMember.permissions || {
            can_add_copies: true,
            can_correct: true,
            can_validate: false,
            can_view_details: true,
            can_export: false
          })
        }
      }
    }

    fetchPermissions()
  }, [exam, user, getTeamMembers])


  useEffect(() => {
    const fetchExistingResults = async () => {
      if (!id || !exam || exam.copies.length === 0 || hasStoredResults) return
      
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'
      try {
        const response = await fetch(`${API_BASE_URL}/api/results`)
        if (response.ok) {
          const allResults = await response.json()
          const examFileNames = exam.copies.map((c: any) => c.name)
          const relevantResults = allResults.filter((r: any) => 
            examFileNames.includes(r.transcriptions?.nom_fichier)
          )

          if (relevantResults.length > 0) {
            const resultsData: any = { resultat: {} }
            relevantResults.forEach((r: any, idx: number) => {
              const key = `copie_${idx + 1}`
              resultsData.resultat[key] = {
                ...r.details_json,
                db_id: r.id,
                nom_fichier: r.transcriptions?.nom_fichier
              }
            })
            
            const finalResults = transformResults(resultsData, exam.copies, exam)
            // Use original creation date if available
            finalResults.generatedAt = relevantResults[0].transcriptions?.created_at || new Date().toISOString()
            
            sessionStorage.setItem(`correction_${id}`, JSON.stringify(finalResults))
            setHasStoredResults(true)
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des résultats existants:", error)
      }
    }

    fetchExistingResults()
  }, [exam, id, hasStoredResults])

  const handleCorrection = async () => {
    if (grading) return
    if (!exam) return
    if (exam.copies.length === 0) {
      alert('Aucune copie à corriger')
      return
    }

    if (!exam.epreuve || !exam.corrige) {
      const missing = [!exam.epreuve ? 'épreuve' : null, !exam.corrige ? 'corrigé' : null].filter(Boolean).join(' et ')
      const ok = window.confirm(`Aucun ${missing} détecté. Voulez-vous continuer la correction sans ces documents ?`)
      if (!ok) return
    }

    setGrading(true)
    setGradingProgress(5)

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

    try {
      const progressInterval = setInterval(() => {
        setGradingProgress((p) => Math.min(90, p + Math.floor(Math.random() * 8) + 2))
      }, 500)

      const copyFiles: File[] = []
      
      for (const copie of exam.copies) {
        if (copie.url) {
          if (copie.name.toLowerCase().endsWith('.pdf')) {
            alert(`Attention: Le fichier ${copie.name} est un PDF. Le backend OCR ne supporte actuellement que les images (JPG, PNG).`)
            setGrading(false)
            setGradingProgress(0)
            return
          }
          try {
            const response = await fetch(copie.url)
            const blob = await response.blob()
            const file = new File([blob], copie.name, { type: blob.type })
            copyFiles.push(file)
          } catch (error) {
            console.error(`Erreur chargement copie ${copie.name}:`, error)
          }
        }
      }

      if (copyFiles.length === 0) throw new Error('Impossible de charger les fichiers des copies')

      const formData = new FormData()
      copyFiles.forEach(file => formData.append('files', file))

      // Note: The backend currently ignores these extra fields in /api/full, 
      // but we keep them for future compatibility if the backend is updated.
      if (exam.epreuve?.cheminFichier) {
        const epreuveResp = await fetch(exam.epreuve.cheminFichier)
        const epreuveBlob = await epreuveResp.blob()
        formData.append('epreuve', epreuveBlob, 'epreuve.pdf')
      }
      if (exam.corrige?.cheminFichier) {
        const corrigeResp = await fetch(exam.corrige.cheminFichier)
        const corrigeBlob = await corrigeResp.blob()
        formData.append('corrige', corrigeBlob, 'corrige.pdf')
      }

      // Updated endpoint to /api/full as per backend README for complete pipeline
      const response = await fetch(`${API_BASE_URL}/api/full`, {
        method: 'POST',
        body: formData,
      })

      clearInterval(progressInterval)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || errorData.detail || 'Erreur lors de la correction')
      }

      const results = await response.json()
      setGradingProgress(100)

      const resultsWithSummary = transformResults(results, exam.copies, exam)
      resultsWithSummary.generatedAt = new Date().toISOString()
      
      sessionStorage.setItem(`correction_${id}`, JSON.stringify(resultsWithSummary))
      
      await addNotification({
        title: 'Correction terminée',
        message: `L'examen "${exam.titre}" a été corrigé avec succès.`,
        type: 'success',
        link: `/dashboard/examens/${id}`
      })

      setHasStoredResults(true)
      setViewMode('results')

    } catch (error: any) {
      console.error('Erreur correction:', error)
      alert(error.message || 'Une erreur est survenue pendant la correction')
    } finally {
      setGrading(false)
      setGradingProgress(0)
    }
  }

  const handleFileUpload = async () => {
    if (!files || !id) return
    setUploading(true)
    try {
      await addStudentFiles(id, Array.from(files))
      setFiles(null)
      alert('Documents ajoutés avec succès')
    } catch (error) {
      console.error(error)
      alert('Erreur lors de l\'upload')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async () => {
    if (!id) return
    setDeleting(true)
    try {
      await deleteExam(id)
      navigate('/dashboard/examens')
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la suppression')
    } finally {
      setDeleting(false)
    }
  }

  const handleValidateChange = async () => {
    if (!id || !exam) return
    const newStatus = exam.statut === 'valide' ? 'termine' : 'valide'
    try {
      await updateExamStatus(id, newStatus)
      if (newStatus === 'valide') {
        await addNotification({
          title: 'Examen validé',
          message: `L'examen "${exam.titre}" a été validé.`,
          type: 'info'
        })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const handleDocumentUpdate = async (type: 'epreuve' | 'corrige', file: File) => {
    if (!id || !exam) return
    setUpdatingDoc(type)
    try {
      const success = await updateExamDocuments(id, type, file)
      if (success) {
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} mis à jour avec succès`)
      }
    } catch (error) {
      console.error(error)
      alert('Erreur lors de la mise à jour du document')
    } finally {
      setUpdatingDoc(null)
    }
  }

  if (isLoading || !exam) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <Link 
          to="/dashboard/examens"
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors w-fit border border-border-subtle px-3 py-1 rounded-lg"
        >
          <ChevronLeft size={20} />
          Retour aux examens
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface p-8 rounded-[2rem] border border-border-subtle card-shadow">
          <div className="flex gap-6 items-start">
            <div className="p-4 bg-primary/5 text-primary rounded-[1.5rem] border border-primary/10">
              <BookOpen size={36} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-google-bold text-textcol capitalize">{exam.titre}</h1>
                <span className={`px-3 py-1 rounded-full text-xs font-google-bold uppercase tracking-wider ${
                  exam.statut === 'valide' 
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30' 
                    : 'bg-amber-100 text-amber-600 dark:bg-amber-900/30'
                }`}>
                  {exam.statut === 'valide' ? 'Validé' : exam.statut}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-secondary font-medium">
                {exam.classe && (
                  <span className="flex items-center gap-2">
                    <GraduationCap size={16} className="text-primary" />
                    {exam.classe}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar size={16} className="text-primary" />
                  {new Date(exam.dateExamen).toLocaleDateString('fr-FR', {
                    day: 'numeric', month: 'long', year: 'numeric'
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {hasStoredResults && (
              <button
                disabled={!permissions.can_export && exam.utilisateur_id !== user?.id}
                onClick={() => navigate(`/dashboard/examens/${id}/resultats`)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-google-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                title={!permissions.can_export ? "Vous n'avez pas la permission d'exporter" : ""}
              >
                <FileCheck size={16} />
                Voir les résultats
              </button>
            )}
            
            {!exam?.team_id && exam?.utilisateur_id === user?.id && (
              <button 
                onClick={() => setShowInviteModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-subtle hover:bg-background rounded-xl text-sm font-google-bold transition-all"
              >
                <Share2 size={16} className="text-secondary" />
                Partager
              </button>
            )}

            {exam.utilisateur_id === user?.id && (
              <button 
                onClick={() => setShowSettingsModal(true)}
                className="p-2 bg-surface border border-border-subtle hover:bg-background rounded-xl text-secondary transition-all"
                title="Paramètres de l'examen"
              >
                <Settings size={20} />
              </button>
            )}

            <button
              onClick={() => setShowDeleteModal(true)}
              disabled={exam.utilisateur_id !== user?.id}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-xl text-sm font-google-bold transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 size={16} />
              Supprimer
            </button>
          </div>
        </div>

        {/* Mode Switcher if Results Exist */}
        {hasStoredResults && (
          <div className="flex bg-background dark:bg-black/20 p-1 rounded-2xl border border-border-subtle w-fit mb-4">
            <button
              onClick={() => setViewMode('results')}
              className={`px-6 py-2 rounded-xl text-sm font-google-bold transition-all flex items-center gap-2 ${
                viewMode === 'results' ? 'bg-indigo-600 text-white shadow-md' : 'text-secondary hover:text-textcol'
              }`}
            >
              <LayoutDashboard size={16} />
              Vue Résultats
            </button>
            <button
              onClick={() => setViewMode('management')}
              className={`px-6 py-2 rounded-xl text-sm font-google-bold transition-all flex items-center gap-2 ${
                viewMode === 'management' ? 'bg-indigo-600 text-white shadow-md' : 'text-secondary hover:text-textcol'
              }`}
            >
              <Settings size={16} />
              Gestion & Files
            </button>
          </div>
        )}
      </div>

      {(viewMode === 'results' && hasStoredResults) ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Results Summary */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-8 card-shadow shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <h2 className="text-2xl font-google-bold text-textcol">Résumé de la Correction</h2>
                  <button 
                    onClick={handleValidateChange}
                    disabled={!permissions.can_validate && exam.utilisateur_id !== user?.id}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-google-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                      exam.statut === 'valide' 
                        ? 'bg-green-100 text-green-600' 
                        : 'bg-primary text-white shadow-lg shadow-primary/20'
                    }`}
                    title={!permissions.can_validate ? "Permission de validation manquante" : ""}
                 >
                   {exam.statut === 'valide' ? <CheckCircle2 size={16} /> : <FileCheck size={16} />}
                   {exam.statut === 'valide' ? 'Validé' : 'Valider maintenant'}
                 </button>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {(() => {
                  const saved = sessionStorage.getItem(`correction_${id}`)
                  if (!saved) return null
                  const summary = JSON.parse(saved).summary
                  return (
                    <>
                      <div className="p-4 bg-background rounded-2xl border border-border-subtle">
                        <p className="text-[10px] font-google-bold text-secondary uppercase tracking-wider mb-1">Copies</p>
                        <p className="text-2xl font-google-bold text-textcol">{summary.total}</p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border-subtle">
                        <p className="text-[10px] font-google-bold text-secondary uppercase tracking-wider mb-1">Moyenne</p>
                        <p className="text-2xl font-google-bold text-textcol">{summary.moyenne.toFixed(1)}/20</p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border-subtle">
                        <p className="text-[10px] font-google-bold text-secondary uppercase tracking-wider mb-1">Max</p>
                        <p className="text-2xl font-google-bold text-textcol text-green-600">{summary.max.toFixed(1)}</p>
                      </div>
                      <div className="p-4 bg-background rounded-2xl border border-border-subtle">
                        <p className="text-[10px] font-google-bold text-secondary uppercase tracking-wider mb-1">Réussite</p>
                        <p className="text-2xl font-google-bold text-indigo-600">{Math.round(((summary.distribution.excellent + summary.distribution.bien + summary.distribution.pass) / summary.total) * 100)}%</p>
                      </div>
                    </>
                  )
                })()}
              </div>
            </div>

            <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-8 card-shadow shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-6">
                 <div className="p-4 bg-indigo-50 text-indigo-600 rounded-[1.5rem]">
                   <FileText size={32} />
                 </div>
                 <div>
                    <h3 className="text-xl font-google-bold text-textcol">Tableau des Résultats</h3>
                    <p className="text-sm text-secondary">Accédez à l'analyse détaillée par étudiant et exportez les notes.</p>
                 </div>
              </div>
              <Link 
                to={`/dashboard/examens/${id}/resultats`}
                className="px-6 py-3 bg-textcol text-surface rounded-xl text-sm font-google-bold hover:brightness-125 transition-all"
              >
                Ouvrir les détails
              </Link>
            </div>
          </div>

          {/* Right Column - Sidebar style info */}
          <div className="space-y-6">
            <div className="bg-textcol text-surface rounded-[2.5rem] p-8 shadow-xl">
               <h3 className="text-lg font-google-bold mb-6 flex items-center gap-2">
                 <FileCheck size={20} className="text-indigo-400" />
                 Points clés
               </h3>
               <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2"></div>
                    <p className="text-sm font-medium text-surface/80">Tous les étudiants ont été identifiés par l'IA.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2"></div>
                    <p className="text-sm font-medium text-surface/80">Le barème a été appliqué uniformément sur 20 points.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2"></div>
                    <p className="text-sm font-medium text-surface/80">Prêt pour l'exportation officielle.</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Files Section */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-8 card-shadow shadow-sm">
              <h2 className="text-2xl font-google-bold text-textcol mb-8">Documents de l'examen</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Epreuve Card */}
                <div 
                  onClick={() => document.getElementById('epreuve-upload')?.click()}
                  className={`group p-6 bg-background border border-border-subtle rounded-[2rem] hover:border-primary/30 transition-all flex flex-col justify-between min-h-[160px] cursor-pointer relative ${updatingDoc === 'epreuve' ? 'opacity-50' : ''}`}
                >
                  <input 
                    type="file" 
                    id="epreuve-upload" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleDocumentUpdate('epreuve', file)
                    }}
                  />
                  {updatingDoc === 'epreuve' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-[2rem] z-10">
                      <Loader2 className="animate-spin text-primary" size={24} />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-primary/5 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                      <FileText size={24} />
                    </div>
                    {exam.epreuve?.cheminFichier && (
                      <a 
                        href={exam.epreuve.cheminFichier} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-secondary hover:text-textcol hover:bg-surface rounded-lg"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </div>
                  <div>
                    <h3 className="font-google-bold text-textcol">Épreuve</h3>
                    <p className="text-xs text-secondary mt-1">{exam.epreuve?.cheminFichier ? 'Document disponible' : 'Cliquer pour uploader'}</p>
                  </div>
                </div>

                {/* Corrige Card */}
                <div 
                  onClick={() => document.getElementById('corrige-upload')?.click()}
                  className={`group p-6 bg-background border border-border-subtle rounded-[2rem] hover:border-amber-300 transition-all flex flex-col justify-between min-h-[160px] cursor-pointer relative ${updatingDoc === 'corrige' ? 'opacity-50' : ''}`}
                >
                  <input 
                    type="file" 
                    id="corrige-upload" 
                    className="hidden" 
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleDocumentUpdate('corrige', file)
                    }}
                  />
                  {updatingDoc === 'corrige' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/50 rounded-[2rem] z-10">
                      <Loader2 className="animate-spin text-amber-600" size={24} />
                    </div>
                  )}
                  <div className="flex items-start justify-between">
                    <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl group-hover:scale-110 transition-transform">
                      <FileCheck size={24} />
                    </div>
                    {exam.corrige?.cheminFichier && (
                      <a 
                        href={exam.corrige.cheminFichier} 
                        target="_blank" 
                        rel="noreferrer" 
                        onClick={(e) => e.stopPropagation()}
                        className="p-2 text-secondary hover:text-textcol hover:bg-surface rounded-lg"
                      >
                        <Download size={18} />
                      </a>
                    )}
                  </div>
                  <div>
                    <h3 className="font-google-bold text-textcol">Corrigé type</h3>
                    <p className="text-xs text-secondary mt-1">{exam.corrige?.cheminFichier ? 'Document disponible' : 'Cliquer pour uploader'}</p>
                  </div>
                </div>
              </div>

              {/* Action Correction */}
              <div className="mt-8 pt-8 border-t border-border-subtle">
                <button 
                  onClick={handleCorrection}
                  disabled={grading || (!permissions.can_correct && exam.utilisateur_id !== user?.id)}
                  className="w-full relative group overflow-hidden bg-primary text-white rounded-[1.5rem] p-4 font-google-bold hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-xl shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  title={!permissions.can_correct ? "Permission de correction manquante" : ""}
                >
                  {grading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      <span>Correction par IA en cours ({gradingProgress}%)</span>
                      <div className="absolute bottom-0 left-0 h-1 bg-white/30 transition-all duration-300" style={{ width: `${gradingProgress}%` }}></div>
                    </>
                  ) : (
                    <>
                      <Play size={20} />
                      <span>Lancer la correction intelligente</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Copies Section */}
            <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-8 card-shadow shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <h2 className="text-2xl font-google-bold text-textcol">Copies des étudiants</h2>
                {exam.copies.length > 0 && (
                  <span className="px-4 py-1.5 bg-background border border-border-subtle rounded-xl text-xs font-google-bold text-secondary">
                    {exam.copies.length} copies importées
                  </span>
                )}
              </div>

              {exam.copies.length === 0 ? (
                <div className="bg-background/50 border-2 border-dashed border-border-subtle rounded-[2rem] p-12 text-center group hover:border-primary/30 transition-all">
                  <div className="p-4 bg-surface rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <UploadCloud size={32} className="text-secondary/40 group-hover:text-primary/40" />
                  </div>
                  <h3 className="text-lg font-google-bold text-textcol">Ajoutez les copies</h3>
                  <p className="text-secondary max-w-xs mx-auto mt-2 text-sm leading-relaxed">Glissez-déposez les scans des copies de vos étudiants pour lancer l'analyse.</p>
                  <label className="mt-6 inline-flex cursor-pointer px-6 py-2.5 bg-primary text-white rounded-xl text-sm font-google-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
                    Parcourir les fichiers
                    <input type="file" multiple className="hidden" onChange={(e) => setFiles(e.target.files)} />
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                   <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {exam.copies.map((copie: any, idx: number) => (
                        <div key={idx} className="group p-3 bg-background border border-border-subtle rounded-2xl hover:border-primary/30 transition-all">
                           <div className="aspect-[3/4] bg-surface rounded-xl flex items-center justify-center mb-3 relative overflow-hidden">
                              <FileText size={32} className="text-secondary/20" />
                              <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors"></div>
                              <a 
                                href={copie.url} 
                                target="_blank" 
                                rel="noreferrer"
                                className="absolute bottom-2 right-2 p-2 bg-surface rounded-lg opacity-0 group-hover:opacity-100 transition-all hover:text-primary shadow-sm"
                              >
                                <Download size={14} />
                              </a>
                           </div>
                           <p className="text-[10px] font-google-bold text-textcol truncate">{copie.name}</p>
                           <p className="text-[9px] text-secondary font-medium flex items-center gap-1 mt-1">
                             <Clock size={10} />
                             {new Date().toLocaleDateString()}
                           </p>
                        </div>
                      ))}
                      
                      <label className={`aspect-[3/4] border-2 border-dashed border-border-subtle rounded-2xl flex flex-col items-center justify-center gap-2 transition-all bg-background/30 ${
                        permissions.can_add_copies || exam.utilisateur_id === user?.id 
                        ? 'hover:border-primary/30 cursor-pointer hover:bg-primary/5' 
                        : 'opacity-50 cursor-not-allowed'
                      }`}>
                        <UploadCloud size={24} className="text-secondary/40" />
                        <span className="text-[10px] font-google-bold text-secondary">Ajouter</span>
                        {(permissions.can_add_copies || exam.utilisateur_id === user?.id) && (
                          <input type="file" multiple className="hidden" onChange={(e) => setFiles(e.target.files)} />
                        )}
                        {!(permissions.can_add_copies || exam.utilisateur_id === user?.id) && (
                          <span className="text-[8px] text-red-500 font-bold px-2 text-center">Permission requise</span>
                        )}
                      </label>
                   </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Status & Progress */}
          <div className="space-y-8">
            <div className="bg-textcol text-surface rounded-[2.5rem] p-8 shadow-xl">
               <h3 className="text-lg font-google-bold mb-6 flex items-center gap-2">
                 <LayoutDashboard size={20} className="text-indigo-400" />
                 Espace Correction
               </h3>
               
               <div className="space-y-6">
                 <div className="bg-surface/10 rounded-2xl p-4 border border-surface/5">
                    <p className="text-xs font-medium text-surface/60 uppercase tracking-widest mb-3">Statut actuel</p>
                    <div className="flex items-center gap-3">
                       <div className={`w-3 h-3 rounded-full animate-pulse ${exam.statut === 'valide' ? 'bg-green-400' : 'bg-amber-400'}`}></div>
                       <span className="text-lg font-google-bold capitalize">{exam.statut === 'valide' ? 'Prêt pour export' : 'En attente'}</span>
                    </div>
                 </div>

                 <div className="space-y-4">
                    <div className="flex items-center justify-between text-xs font-google-bold">
                       <span className="text-surface/70 flex items-center gap-2">
                         <FileText size={14} className="text-indigo-400" />
                         Documents
                       </span>
                       <span className="text-surface">{[exam.epreuve?.cheminFichier, exam.corrige?.cheminFichier].filter(Boolean).length}/2</span>
                    </div>
                    <div className="h-1.5 bg-surface/10 rounded-full overflow-hidden">
                       <div 
                        className="h-full bg-indigo-400 transition-all duration-500" 
                        style={{ width: `${([exam.epreuve?.cheminFichier, exam.corrige?.cheminFichier].filter(Boolean).length / 2) * 100}%` }}
                       ></div>
                    </div>
                 </div>
               </div>

               <div className="mt-8 pt-8 border-t border-surface/10">
                  <Link 
                    to="/dashboard/examens"
                    className="flex items-center justify-center gap-2 py-3 bg-indigo-600 rounded-xl text-sm font-google-bold hover:brightness-125 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Tableau de bord
                  </Link>
               </div>
            </div>

            {/* Info Message */}
            <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-8 card-shadow shadow-sm">
               <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl w-fit mb-4">
                  <AlertTriangle size={24} />
               </div>
               <h3 className="text-lg font-google-bold text-textcol mb-2">Note Importante</h3>
               <p className="text-sm text-secondary leading-relaxed">
                 Assurez-vous que tous les scans sont de bonne qualité (300dpi minimum) pour une interprétation optimale par l'intelligence artificielle.
               </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Progress Modal Overlay */}
      {uploading && (
        <div className="fixed inset-0 z-[100] bg-textcol/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle rounded-3xl p-8 w-full max-w-sm card-shadow text-center">
            <Loader2 className="animate-spin h-10 w-10 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-google-bold text-textcol mb-2">Importation en cours</h3>
            <p className="text-sm text-secondary mb-6">Veuillez patienter pendant l'upload des fichiers.</p>
            <div className="w-full h-2 bg-background rounded-full overflow-hidden">
              <div className="h-full bg-primary animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      {/* Selection Confirmation Modal (Triggered by files selection) */}
      {files && !uploading && (
        <div className="fixed inset-0 z-[100] bg-textcol/20 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle rounded-3xl p-8 w-full max-w-md card-shadow">
            <h3 className="text-xl font-google-bold text-textcol mb-2">Confirmer l'importation</h3>
            <p className="text-sm text-secondary mb-6">Vous avez sélectionné <span className="text-textcol font-google-bold">{files.length}</span> copies à ajouter à cet examen.</p>
            <div className="flex gap-4">
               <button 
                onClick={() => setFiles(null)}
                className="flex-1 px-4 py-3 bg-background border border-border-subtle rounded-xl text-sm font-google-bold text-textcol hover:bg-surface transition-all"
               >
                 Annuler
               </button>
               <button 
                onClick={handleFileUpload}
                className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-google-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
               >
                 Importer
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[100] bg-textcol/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle rounded-3xl p-8 w-full max-w-md card-shadow animate-in zoom-in-95 duration-200">
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl w-fit mb-6">
              <AlertTriangle size={32} />
            </div>
            <h2 className="text-2xl font-google-bold text-textcol mb-2">Supprimer l'examen ?</h2>
            <p className="text-secondary mb-8 leading-relaxed">Cette action est irréversible. Toutes les copies et les résultats associés seront définitivement effacés.</p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 px-6 py-3 bg-background border border-border-subtle rounded-xl text-sm font-google-bold text-textcol hover:bg-surface transition-all"
              >
                Annuler
              </button>
              <button 
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl text-sm font-google-bold hover:bg-red-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {deleting ? <Loader2 className="animate-spin" size={18} /> : 'Supprimer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && exam && (
        <div className="fixed inset-0 z-[100] bg-textcol/20 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-surface border border-border-subtle rounded-3xl p-8 w-full max-w-md shadow-2xl relative">
            <button
               onClick={() => setShowSettingsModal(false)}
               className="absolute top-6 right-6 p-2 text-secondary hover:bg-background rounded-full transition-colors"
            >
               <X size={20} />
            </button>

            <h2 className="text-2xl font-google-bold text-textcol mb-2">Paramètres de partage</h2>
            <p className="text-sm text-secondary mb-8">Gérez l'équipe associée à cet examen. Seul le propriétaire peut modifier ce réglage.</p>

            <div className="space-y-6">
              <div>
                 <label className="block text-sm font-google-bold text-textcol mb-3">Équipe associée</label>
                 <select 
                   value={exam.team_id || ''}
                    onChange={async (e) => {
                      const teamId = e.target.value || null
                      if (window.confirm("Voulez-vous vraiment changer l'équipe de cet examen ?")) {
                        const success = await changeExamTeam(exam.id, teamId)
                        if (success) {
                          await refreshExams()
                          alert("L'équipe a été mise à jour.")
                          setShowSettingsModal(false)
                        } else {
                          alert("Erreur lors de la mise à jour.")
                        }
                      }
                    }}
                   className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-background outline-none transition-all"
                 >
                   <option value="">Aucune équipe (Privé)</option>
                   {teams.map(t => (
                     <option key={t.id} value={t.id}>{t.nom}</option>
                   ))}
                 </select>
              </div>

              <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl flex items-start gap-3">
                 <Settings size={18} className="text-indigo-600 mt-1 shrink-0" />
                 <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
                   Lier un examen à une équipe permet à tous les membres de cette équipe d'y accéder selon leurs permissions respectives.
                 </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {showInviteModal && exam && (
        <InviteModal 
          examId={exam.id}
          examTitle={exam.titre}
          onClose={() => setShowInviteModal(false)}
        />
      )}
    </div>
  )
}

export default ExamDetail