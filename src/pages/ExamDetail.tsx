import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useExams } from '../exams'
import { useNotifications } from '../notifications'
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
  X
} from 'lucide-react'

const ExamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { exams, addStudentFiles, deleteExam, isLoading, updateExamStatus } = useExams()
  const { addNotification } = useNotifications()
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [viewMode, setViewMode] = useState<'management' | 'results'>('management')
  const [hasStoredResults, setHasStoredResults] = useState(false)

  // Correction state
  const [grading, setGrading] = useState(false)
  const [gradingProgress, setGradingProgress] = useState(0)

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

 const handleCorrection = async () => {
  if (grading) return
  if (!exam) return
  if (exam.copies.length === 0) {
    alert('Aucune copie à corriger')
    return
  }

  // If epreuve or corrige is missing, ask user to confirm proceeding
  if (!exam.epreuve || !exam.corrige) {
    const missing = [!exam.epreuve ? 'épreuve' : null, !exam.corrige ? 'corrigé' : null].filter(Boolean).join(' et ')
    const ok = window.confirm(`Aucun ${missing} détecté. Voulez-vous continuer la correction sans ces documents ?`)
    if (!ok) return
  }

  setGrading(true)
  setGradingProgress(5)

  // Récupérer l'URL du backend depuis les variables d'environnement
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

  try {
    // Progress simulation
    const progressInterval = setInterval(() => {
      setGradingProgress((p) => Math.min(90, p + Math.floor(Math.random() * 8) + 2))
    }, 500)

    // Préparer les fichiers des copies pour l'upload
    const copyFiles: File[] = []
    
    // Récupérer les fichiers des copies depuis les URLs
    for (const copie of exam.copies) {
      if (copie.url) {
        try {
          const response = await fetch(copie.url)
          const blob = await response.blob()
          const file = new File([blob], copie.name, { type: blob.type })
          copyFiles.push(file)
        } catch (error) {
          console.warn(`Impossible de récupérer le fichier: ${copie.name}`, error)
        }
      }
    }

    if (copyFiles.length === 0) {
      throw new Error('Aucun fichier de copie disponible')
    }

    // Étape 1: OCR des copies
    setGradingProgress(30)
    const formData = new FormData()
    copyFiles.forEach((file) => {
      formData.append('files', file)
    })

    const ocrResponse = await fetch(`${API_BASE_URL}/api/ocr`, {
      method: 'POST',
      body: formData
    })

    if (!ocrResponse.ok) {
      throw new Error('Erreur lors de l\'OCR')
    }

    const ocrData = await ocrResponse.json()
    setGradingProgress(60)

    // Étape 2: Correction via LLM
    const correctResponse = await fetch(`${API_BASE_URL}/api/correct`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        evalData: ocrData.eval
      })
    })

    if (!correctResponse.ok) {
      throw new Error('Erreur lors de la correction')
    }

    const correctionData = await correctResponse.json()
    clearInterval(progressInterval)
    setGradingProgress(100)

    // Transformer les résultats de l'API au format interne
    const resultat = correctionData.resultat || correctionData
    const copiesFromApi: any[] = []
    
    Object.keys(resultat).forEach((key, index) => {
      const entry = resultat[key]
      const originalCopy = exam.copies[index] || exam.copies.find(c => c.name.includes(key))
      
      const details = (entry.questions || []).map((q: any) => ({
        question: q.num || q.question,
        type: q.type || 'auto',
        reponse: q.reponse || '–',
        maxPoints: q.maxPoint || q.point || 1,
        points: q.point || 0,
        status: (q.point || 0) === 0 ? 'zero' : (q.point || 0) === (q.maxPoint || q.point || 1) ? 'full' : 'partial',
        comment: q.commentaire || q.comment || ''
      }))

      const note = entry.note_totale ?? details.reduce((a: number, b: any) => a + b.points, 0)
      const maxNote = details.reduce((a: number, b: any) => a + b.maxPoints, 0) || 20
      const pourcent = Number(((note / maxNote) * 100).toFixed(1))

      copiesFromApi.push({
        id: originalCopy?.id || key,
        nomEleve: originalCopy?.name || key,
        note,
        maxNote,
        pourcent,
        details
      })
    })

    // Calculer les statistiques
    const total = copiesFromApi.length
    const percents = copiesFromApi.map((c: any) => c.pourcent).sort((a: number, b: number) => a - b)
    const moy = total > 0 ? Number((percents.reduce((a: number, b: number) => a + b, 0) / total).toFixed(2)) : 0
    const min = percents[0] ?? 0
    const max = percents[percents.length - 1] ?? 0
    const median = total > 0 ? percents[Math.floor(total / 2)] : 0
    const distribution = {
      excellent: copiesFromApi.filter((c: any) => c.pourcent >= 80).length,
      pass: copiesFromApi.filter((c: any) => c.pourcent >= 50 && c.pourcent < 80).length,
      fail: copiesFromApi.filter((c: any) => c.pourcent < 50).length
    }

    const finalResults = {
      examId: exam.id,
      generatedAt: Date.now(),
      summary: {
        total,
        graded: total,
        moyenne: moy,
        min,
        max,
        median,
        distribution
      },
      copies: copiesFromApi
    }

    // Sauvegarder dans sessionStorage
    try {
      sessionStorage.setItem(`correction_${exam.id}`, JSON.stringify(finalResults))
    } catch (e) {
      console.warn('sessionStorage unavailable')
    }

    setGrading(false)
    setGradingProgress(0)

    // Reset status to brouillon and send notification
    await updateExamStatus(exam.id, 'brouillon')
    await addNotification({
      title: 'Nouvelle correction effectuée',
      message: `Une nouvelle correction a été effectuée sur l'examen "${exam.titre}".`,
      link: `/dashboard/examens/${exam.id}/resultats`,
      type: 'info'
    })

    navigate(`/dashboard/examens/${exam.id}/resultats`, { state: { results: finalResults } })

  } catch (error) {
    console.error('Erreur pendant la correction:', error)
    setGrading(false)
    setGradingProgress(0)
    
    // Fallback vers données mockées en cas d'erreur
    const useMock = window.confirm(
      'La correction via l\'API a échoué. Voulez-vous utiliser des données de démonstration à la place ?'
    )
    
    if (useMock) {
      generateMockResults()
    } else {
      alert('Erreur lors de la correction. Veuillez réessayer.')
    }
  }
}

  const generateMockResults = () => {
    if (!exam) return

    setGrading(true)
    setGradingProgress(50)

    const mockResults = {
      examId: exam.id,
      generatedAt: Date.now(),
      summary: {},
      copies: exam.copies.map((c) => {
        const numQuestions = 5
        const chooseType = () => {
          const r = Math.random()
          if (r < 0.5) return 'mcq'
          if (r < 0.8) return 'short'
          return 'essay'
        }
        const commentsPool = {
          full: ['Très bonne réponse', 'Excellent', 'Réponse complète'],
          partial: ['Réponse partielle, développer un exemple', 'Manque de précision', 'Bonne idée, mais manque de détails'],
          zero: ['Réponse incorrecte', 'Hors sujet', 'Aucune réponse']
        }
        const questions = Array.from({ length: numQuestions }).map((_, qIdx) => {
          const type = chooseType()
          let maxPoints = 1
          if (type === 'mcq') maxPoints = Math.floor(Math.random() * 2) + 1
          if (type === 'short') maxPoints = Math.floor(Math.random() * 3) + 2
          if (type === 'essay') maxPoints = Math.floor(Math.random() * 4) + 3
          let points = 0
          let comment = ''
          if (type === 'mcq') {
            const correct = Math.random() < 0.6
            points = correct ? maxPoints : 0
            comment = correct ? commentsPool.full[Math.floor(Math.random() * commentsPool.full.length)] : commentsPool.zero[Math.floor(Math.random() * commentsPool.zero.length)]
          } else if (type === 'short') {
            const p = Math.random()
            if (p < 0.25) points = 0
            else if (p < 0.65) points = Math.floor(Math.random() * (maxPoints - 0))
            else points = maxPoints
            comment = points === maxPoints ? commentsPool.full[Math.floor(Math.random() * commentsPool.full.length)] : points === 0 ? commentsPool.zero[Math.floor(Math.random() * commentsPool.zero.length)] : commentsPool.partial[Math.floor(Math.random() * commentsPool.partial.length)]
          } else {
            const p = Math.random()
            if (p < 0.15) points = 0
            else if (p < 0.5) points = Math.floor(Math.random() * Math.max(1, Math.floor(maxPoints / 2)))
            else if (p < 0.85) points = Math.floor(Math.random() * (maxPoints - 1)) + 1
            else points = maxPoints
            comment = points === maxPoints ? 'Très bon développement, arguments et exemples pertinents' : points === 0 ? 'Travail insuffisant, développer vos arguments' : 'Bonne structure, développer davantage certains points'
          }
          const status = points === 0 ? 'zero' : points === maxPoints ? 'full' : 'partial'
          return { question: qIdx + 1, type, reponse: type === 'mcq' ? ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] : (Math.random() < 0.5 ? 'Réponse courte' : 'Réponse rédigée'), maxPoints, points, status, comment }
        })
        const note = questions.reduce((a, b) => a + b.points, 0)
        const maxNote = questions.reduce((a, b) => a + b.maxPoints, 0)
        const pourcent = Number(((note / (maxNote || 1)) * 100).toFixed(1))
        return { id: c.id, nomEleve: c.name, note, maxNote, pourcent, details: questions }
      })
    }

    const total = mockResults.copies.length
    const percents = mockResults.copies.map((c: any) => c.pourcent).sort((a: number, b: number) => a - b)
    const moy = total > 0 ? Number((percents.reduce((a: number, b: number) => a + b, 0) / total).toFixed(2)) : 0
    const min = percents[0] ?? 0
    const max = percents[percents.length - 1] ?? 0
    const median = total > 0 ? percents[Math.floor(total / 2)] : 0
    const distribution = {
      excellent: mockResults.copies.filter((c: any) => c.pourcent >= 80).length,
      pass: mockResults.copies.filter((c: any) => c.pourcent >= 50 && c.pourcent < 80).length,
      fail: mockResults.copies.filter((c: any) => c.pourcent < 50).length
    }
    mockResults.summary = { total, graded: total, moyenne: moy, min, max, median, distribution }

    setGradingProgress(100)

    try {
      sessionStorage.setItem(`correction_${exam.id}`, JSON.stringify(mockResults))
    } catch (e) {
      console.warn('sessionStorage unavailable')
    }

    setTimeout(() => {
      setGrading(false)
      setGradingProgress(0)

      // Reset status and send notification for mock too
      updateExamStatus(exam.id, 'brouillon')
      addNotification({
        title: 'Nouvelle correction effectuée (Mock)',
        message: `Une nouvelle correction a été effectuée sur l'examen "${exam.titre}".`,
        link: `/dashboard/examens/${exam.id}/resultats`,
        type: 'info'
      })

      navigate(`/dashboard/examens/${exam.id}/resultats`, { state: { results: mockResults } })
    }, 500)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textcol/70">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!exam) {
    return null
  }

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!files || files.length === 0) {
      alert('Veuillez sélectionner des fichiers à importer')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const fileArray = Array.from(files)
      const totalFiles = fileArray.length

      for (let i = 0; i < fileArray.length; i++) {
        await addStudentFiles(exam.id, [fileArray[i]])
        setUploadProgress(((i + 1) / totalFiles) * 100)
      }

      setFiles(null)
      const fileInput = document.getElementById('student-files') as HTMLInputElement
      if (fileInput) fileInput.value = ''

      alert(`${totalFiles} copie(s) importée(s) avec succès !`)
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error)
      alert('Erreur lors de l\'import des copies')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const success = await deleteExam(exam.id)
      if (success) {
        navigate('/dashboard/examens')
      } else {
        alert('Erreur lors de la suppression de l\'examen')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la suppression de l\'examen')
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  const downloadFile = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error)
      alert('Erreur lors du téléchargement du fichier')
    }
  }

  const getStatutBadge = () => {
    const badges = {
      brouillon: { text: 'Brouillon', className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
      publie: { text: 'Publié', className: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
      termine: { text: 'Terminé', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
      valide: { text: 'Validé', className: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' }
    }
    const badge = badges[exam.statut] || badges.brouillon
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-google-bold ${badge.className}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header Section */}
      <section className="bg-surface border border-border-subtle rounded-3xl p-8 card-shadow shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
          <div className="space-y-4">
            <Link
              to="/dashboard/examens"
              className="inline-flex items-center gap-2 text-sm font-google-bold text-secondary hover:text-primary transition-colors group"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
              Retour aux examens
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-google-bold text-textcol">{exam.titre}</h1>
                {getStatutBadge()}
              </div>
              <div className="flex flex-wrap items-center gap-6 text-sm text-secondary font-medium">
                <span className="flex items-center gap-2">
                  <BookOpen size={16} className="text-primary" />
                  {exam.matiere}
                </span>
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
                onClick={() => navigate(`/dashboard/examens/${id}/resultats`)}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-google-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-600/20"
              >
                <FileCheck size={16} />
                Voir les résultats
              </button>
            )}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 dark:bg-red-900/10 dark:hover:bg-red-900/20 rounded-xl text-sm font-google-bold transition-all"
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
                viewMode === 'management' ? 'bg-primary text-white shadow-md' : 'text-secondary hover:text-textcol'
              }`}
            >
              <Settings size={16} />
              Gestion & Imports
            </button>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {(viewMode === 'results' && hasStoredResults) ? (
          <div className="lg:col-span-3">
             {/* Quick Results Summary Component (Inline) */}
             <div className="bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-3xl p-10 text-center space-y-6">
                <div className="mx-auto w-24 h-24 bg-white dark:bg-indigo-900/30 rounded-full flex items-center justify-center shadow-inner">
                  <CheckCircle2 size={48} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-google-bold text-textcol">Examen déjà corrigé</h3>
                  <p className="text-secondary max-w-md mx-auto mt-2">
                    Tous les résultats sont disponibles. Vous pouvez les consulter, exporter les copies ou valider officiellement la session.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-4">
                  <button 
                    onClick={() => navigate(`/dashboard/examens/${id}/resultats`)}
                    className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-google-bold shadow-xl shadow-indigo-600/20 hover:scale-[1.02] transition-all flex items-center gap-2"
                  >
                    <LayoutDashboard size={20} />
                    Accéder aux résultats complets
                  </button>
                  <button 
                    onClick={() => setViewMode('management')}
                    className="px-8 py-3 bg-white dark:bg-black/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900/30 rounded-xl font-google-bold hover:bg-indigo-50 transition-all flex items-center gap-2"
                  >
                    <Settings size={20} />
                    Retour au mode gestion
                  </button>
                </div>
             </div>
          </div>
        ) : (
          <>
            {/* Left Column - Files Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Épreuve */}
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 card-shadow shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl">
                <FileText className="text-blue-600" size={20} />
              </div>
              <h3 className="text-lg font-google-bold text-textcol">Épreuve</h3>
            </div>
            {exam.epreuve ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-background rounded-xl border border-border-subtle">
                  <FileText className="text-secondary shrink-0 mt-0.5" size={14} />
                  <p className="text-xs text-secondary font-medium truncate">{exam.epreuve.nomFichier}</p>
                </div>
                <button
                  onClick={() => exam.epreuve?.cheminFichier && downloadFile(exam.epreuve.cheminFichier, exam.epreuve.nomFichier || 'epreuve.pdf')}
                  className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-google-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Télécharger
                </button>
              </div>
            ) : (
              <div className="p-8 text-center bg-background rounded-2xl border border-dashed border-border-subtle">
                <p className="text-xs text-secondary font-medium">Aucune épreuve</p>
              </div>
            )}
          </div>

          {/* Corrigé */}
          <div className="bg-surface border border-border-subtle rounded-3xl p-6 card-shadow shadow-sm hover:shadow-md transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl">
                <CheckCircle2 className="text-green-600" size={20} />
              </div>
              <h3 className="text-lg font-google-bold text-textcol">Corrigé</h3>
            </div>
            {exam.corrige ? (
              <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-background rounded-xl border border-border-subtle">
                  <FileCheck className="text-secondary shrink-0 mt-0.5" size={14} />
                  <p className="text-xs text-secondary font-medium truncate">{exam.corrige.nomFichier}</p>
                </div>
                <button
                  onClick={() => exam.corrige?.cheminFichier && downloadFile(exam.corrige.cheminFichier, exam.corrige.nomFichier || 'corrige.pdf')}
                  className="w-full px-4 py-2.5 bg-primary text-white rounded-xl font-google-bold text-sm hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Télécharger
                </button>
              </div>
            ) : (
              <div className="p-8 text-center bg-background rounded-2xl border border-dashed border-border-subtle">
                <p className="text-xs text-secondary font-medium">Aucun corrigé</p>
              </div>
            )}
          </div>

          {/* Action Card */}
          <div className="bg-indigo-600 rounded-3xl p-6 shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-google-bold">Analyse & IA</h3>
                <Play size={20} className="text-white/40" />
              </div>
              <div className="space-y-2 pb-2">
                <div className="flex justify-between text-sm text-indigo-100">
                  <span>Copies importées</span>
                  <span className="font-google-bold">{exam.copies.length}</span>
                </div>
                {exam.epreuve && (
                  <div className="flex justify-between text-sm text-indigo-100">
                    <span>Durée prévue</span>
                    <span className="font-google-bold">{exam.epreuve.dureeMinutes} min</span>
                  </div>
                )}
              </div>
              <button
                onClick={handleCorrection}
                className="w-full py-3 bg-white text-indigo-600 rounded-xl font-google-bold text-sm hover:bg-indigo-50 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                disabled={grading || exam.copies.length === 0}
              >
                {grading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <>
                    <Play size={16} fill="currentColor" />
                    Lancer la correction
                  </>
                )}
              </button>
              {(!exam.epreuve || !exam.corrige) && (
                <div className="flex items-start gap-2 p-2 bg-white/10 rounded-lg">
                  <AlertTriangle className="text-yellow-300 shrink-0" size={14} />
                  <p className="text-[10px] text-white/80 leading-tight">Documents de référence manquants. La correction peut être moins précise.</p>
                </div>
              )}
            </div>
            <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
          </div>
        </div>

        {/* Right Column - Upload & Copies */}
        <div className="lg:col-span-2 space-y-8">
          {/* Upload Section */}
          <section className="bg-surface border border-border-subtle rounded-3xl p-8 card-shadow shadow-sm transition-all">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-primary/10 rounded-xl">
                <UploadCloud className="text-primary" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-google-bold text-textcol">Importer des copies</h2>
                <p className="text-sm text-secondary">Formats acceptés : PDF, PNG, JPG</p>
              </div>
            </div>
            
            <form onSubmit={handleUpload} className="space-y-6">
              <div className="group relative border-2 border-dashed border-border-subtle rounded-2xl p-10 text-center hover:border-primary/50 transition-all hover:bg-primary/[0.02]">
                <input
                  type="file"
                  id="student-files"
                  accept="application/pdf,image/*"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                />
                <label htmlFor="student-files" className="cursor-pointer block space-y-4">
                  <div className="mx-auto w-16 h-16 bg-background rounded-2xl flex items-center justify-center card-shadow group-hover:scale-110 transition-transform">
                    <FileText className="text-primary" size={32} />
                  </div>
                  <div>
                    <p className="text-textcol font-google-bold">
                      {files && files.length > 0 ? `${files.length} fichiers sélectionnés` : 'Glissez-déposez vos fichiers ici'}
                    </p>
                    <p className="text-sm text-secondary mt-1">
                      ou cliquez pour parcourir vos dossiers
                    </p>
                  </div>
                </label>
              </div>

              {files && files.length > 0 && (
                <div className="bg-background border border-border-subtle rounded-2xl p-4 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2 text-sm font-google-bold text-textcol mb-3">
                    <CheckCircle2 size={16} className="text-green-500" />
                    Fichiers prêts pour l'import
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {Array.from(files).map((file, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-surface border border-border-subtle rounded-lg text-[11px] font-medium text-secondary truncate">
                        <FileText size={12} className="shrink-0" />
                        {file.name}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-google-bold">
                    <span className="text-secondary flex items-center gap-2">
                      <Loader2 className="animate-spin text-primary" size={14} />
                      Importation en cours...
                    </span>
                    <span className="text-primary">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-1.5 overflow-hidden border border-border-subtle">
                    <div
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={!files || files.length === 0 || uploading}
                className="w-full px-6 py-3.5 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:grayscale flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
              >
                {uploading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <UploadCloud size={20} />
                    Démarrer l'importation
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Copies List */}
          <section className="bg-surface border border-border-subtle rounded-3xl p-8 card-shadow shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-secondary/10 rounded-xl">
                  <LayoutDashboard className="text-secondary" size={24} />
                </div>
                <div>
                  <h2 className="text-xl font-google-bold text-textcol">Copies importées</h2>
                  <p className="text-sm text-secondary">{exam.copies.length} document{exam.copies.length > 1 ? 's' : ''} au total</p>
                </div>
              </div>
            </div>

            {exam.copies.length === 0 ? (
              <div className="text-center py-16 bg-background rounded-3xl border border-dashed border-border-subtle">
                <div className="mx-auto w-16 h-16 bg-surface rounded-2xl flex items-center justify-center mb-4 card-shadow">
                  <FileText className="text-border-subtle" size={32} />
                </div>
                <p className="text-textcol font-google-bold">Liste vide</p>
                <p className="text-sm text-secondary mt-1">Aucune copie n'a été importée pour cet examen.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {exam.copies.map((copie) => (
                  <div
                    key={copie.id}
                    className="group flex items-center justify-between p-4 bg-background border border-border-subtle rounded-2xl hover:border-primary/30 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="p-2.5 bg-surface rounded-xl border border-border-subtle group-hover:bg-primary/5 group-hover:border-primary/20 transition-colors">
                        <FileText className="text-secondary group-hover:text-primary transition-colors" size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-google-bold text-textcol truncate text-sm">{copie.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <Clock size={12} className="text-secondary/50" />
                          <p className="text-[11px] font-medium text-secondary/60">
                            {new Date(copie.uploadedAt).toLocaleString('fr-FR', {
                              day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                            })}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() => copie.url && downloadFile(copie.url, copie.name)}
                        className="p-2 text-secondary hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                        title="Télécharger"
                      >
                        <Download size={18} />
                      </button>
                      <button className="p-2 text-secondary hover:text-red-600 hover:bg-red-50 rounded-lg transition-all">
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </>
    )}
  </div>

      {/* Grading Modal */}
      {grading && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in duration-300">
          <div className="bg-surface rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-border-subtle text-center space-y-8">
            <div className="relative mx-auto w-24 h-24">
              <div className="absolute inset-0 bg-indigo-600/20 rounded-full animate-ping"></div>
              <div className="relative bg-indigo-600 rounded-[1.5rem] w-full h-full flex items-center justify-center shadow-xl shadow-indigo-600/30">
                <Loader2 className="text-white animate-spin" size={40} />
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-2xl font-google-bold text-textcol">Correction intelligente</h3>
              <p className="text-sm text-secondary px-4 leading-relaxed">
                {gradingProgress < 30 ? 'Initialisation de l\'analyse...' : 
                 gradingProgress < 60 ? 'Extraction des textes manuscrits...' : 
                 gradingProgress < 90 ? 'Évaluation par l\'intelligence artificielle...' : 
                 'Finalisation des résultats...'}
              </p>
            </div>

            <div className="space-y-4 pt-4">
              <div className="flex items-center justify-between text-sm font-google-bold">
                <span className="text-secondary">Progression globale</span>
                <span className="text-indigo-600">{Math.round(gradingProgress)}%</span>
              </div>
              <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border-subtle p-0.5">
                <div
                  className="bg-indigo-600 h-full transition-all duration-700 rounded-full shadow-sm"
                  style={{ width: `${gradingProgress}%` }}
                ></div>
              </div>
            </div>

            <div className="pt-4">
              <p className="text-[10px] text-secondary/50 font-medium bg-background border border-border-subtle py-2 rounded-xl">
                Veuillez ne pas fermer cette fenêtre pendant le processus.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-6 animate-in fade-in transition-all">
          <div className="bg-surface rounded-[2rem] p-10 max-w-md w-full shadow-2xl border border-border-subtle space-y-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-red-50 dark:bg-red-900/10 rounded-full flex items-center justify-center">
                <AlertTriangle className="text-red-600" size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-google-bold text-textcol">Supprimer l'examen</h3>
                <p className="text-sm text-secondary leading-relaxed">
                  Êtes-vous sûr de vouloir supprimer <span className="text-textcol font-google-bold">"{exam.titre}"</span> ?
                  Cette action est définitive et supprimera toutes les données associées.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-6 py-3.5 bg-background border border-border-subtle text-textcol rounded-xl font-google-bold hover:bg-gray-50 transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-xl font-google-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
              >
                {deleting ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <Trash2 size={20} />
                    Confirmer
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamDetail