import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useExams } from '../exams'

const ExamDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { exams, addStudentFiles, deleteExam, isLoading } = useExams()
  const [files, setFiles] = useState<FileList | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  // Correction simulation state
  const [grading, setGrading] = useState(false)
  const [gradingProgress, setGradingProgress] = useState(0)

  const handleCorrection = async () => {
    if (grading) return
    if (!exam) return
    if (exam.copies.length === 0) {
      alert('Aucune copie à corriger')
      return
    }

    setGrading(true)
    setGradingProgress(0)

    // Simulate processing progress
    await new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        setGradingProgress((p) => {
          const step = Math.floor(Math.random() * 12) + 6 // 6..18
          const next = Math.min(100, p + step)
          if (next >= 100) {
            clearInterval(interval)
            resolve()
          }
          return next
        })
      }, 400)
    })

    // Create mocked results with richer details: types, weights (barêmes), and teacher comments
    const mockResults = {
      examId: exam.id,
      generatedAt: Date.now(),
      summary: {},
      copies: exam.copies.map((c) => {
        const numQuestions = 5

        // helper to choose weighted random type
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
          // set maxPoints depending on type
          let maxPoints = 1
          if (type === 'mcq') maxPoints = Math.floor(Math.random() * 2) + 1 // 1..2
          if (type === 'short') maxPoints = Math.floor(Math.random() * 3) + 2 // 2..4
          if (type === 'essay') maxPoints = Math.floor(Math.random() * 4) + 3 // 3..6

          // scoring rules per type
          let points = 0
          let comment = ''
          if (type === 'mcq') {
            const correct = Math.random() < 0.6
            points = correct ? maxPoints : 0
            comment = correct ? commentsPool.full[Math.floor(Math.random() * commentsPool.full.length)] : commentsPool.zero[Math.floor(Math.random() * commentsPool.zero.length)]
          } else if (type === 'short') {
            // partial chance
            const p = Math.random()
            if (p < 0.25) points = 0
            else if (p < 0.65) points = Math.floor(Math.random() * (maxPoints - 0)) // partial 0..max-1
            else points = maxPoints
            comment = points === maxPoints ? commentsPool.full[Math.floor(Math.random() * commentsPool.full.length)] : points === 0 ? commentsPool.zero[Math.floor(Math.random() * commentsPool.zero.length)] : commentsPool.partial[Math.floor(Math.random() * commentsPool.partial.length)]
          } else {
            // essay: more nuanced partials and richer comments
            const p = Math.random()
            if (p < 0.15) points = 0
            else if (p < 0.5) points = Math.floor(Math.random() * Math.max(1, Math.floor(maxPoints / 2))) // small partial
            else if (p < 0.85) points = Math.floor(Math.random() * (maxPoints - 1)) + 1 // medium partial
            else points = maxPoints
            comment = points === maxPoints ? 'Très bon développement, arguments et exemples pertinents' : points === 0 ? 'Travail insuffisant, développer vos arguments' : 'Bonne structure, développer davantage certains points'
          }

          const status = points === 0 ? 'zero' : points === maxPoints ? 'full' : 'partial'
          const color = status === 'full' ? 'green' : status === 'partial' ? 'blue' : 'red'

          return {
            question: qIdx + 1,
            type,
            reponse: type === 'mcq' ? ['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)] : (Math.random() < 0.5 ? 'Réponse courte' : 'Réponse rédigée'),
            maxPoints,
            points,
            status,
            color,
            comment
          }
        })

        const note = questions.reduce((a, b) => a + b.points, 0)
        const maxNote = questions.reduce((a, b) => a + b.maxPoints, 0)
        const pourcent = Number(((note / (maxNote || 1)) * 100).toFixed(1))

        return {
          id: c.id,
          nomEleve: c.name,
          note,
          maxNote,
          pourcent,
          details: questions
        }
      })
    }

    // compute summary including distribution and median
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

    // persist in session for refresh resilience
    try {
      sessionStorage.setItem(`correction_${exam.id}`, JSON.stringify(mockResults))
    } catch (e) {
      console.warn('sessionStorage unavailable')
    }

    setGrading(false)
    setGradingProgress(0)

    // navigate to results page with state
    navigate(`/dashboard/examens/${exam.id}/resultats`, { state: { results: mockResults } })
  }

  const exam = exams.find((e) => e.id === id)

  useEffect(() => {
    if (!isLoading && !exam) {
      navigate('/dashboard/examens')
    }
  }, [exam, isLoading, navigate])

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
      termine: { text: 'Terminé', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' }
    }
    const badge = badges[exam.statut] || badges.brouillon
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-google-bold ${badge.className}`}>
        {badge.text}
      </span>
    )
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border border-primary/20">
        <div className="flex items-start justify-between mb-6">
          <div className="flex-1">
            <div className="flex items-center gap-4 mb-4">
              <Link
                to="/dashboard/examens"
                className="text-textcol/70 hover:text-primary transition-colors flex items-center gap-2 group"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                Retour aux examens
              </Link>
            </div>
            <h1 className="text-4xl font-google-bold text-textcol mb-3">{exam.titre}</h1>
            <div className="flex items-center gap-4 text-textcol/70">
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                </svg>
                {exam.matiere}
              </span>
              {exam.classe && (
                <span className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                  </svg>
                  {exam.classe}
                </span>
              )}
              <span className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                {new Date(exam.dateExamen).toLocaleDateString('fr-FR', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {getStatutBadge()}
            <button
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500/10 text-red-600 dark:text-red-400 rounded-xl font-google-bold hover:bg-red-500/20 transition-all flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Files Section */}
        <div className="lg:col-span-1 space-y-6">
          {/* Épreuve */}
          <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600 dark:text-blue-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-lg font-google-bold text-textcol">Épreuve</h3>
            </div>
            {exam.epreuve ? (
              <div>
                <p className="text-sm text-textcol/70 mb-3 wrap-break-word">{exam.epreuve.nomFichier}</p>
                <button
                  onClick={() => exam.epreuve?.cheminFichier && downloadFile(exam.epreuve.cheminFichier, exam.epreuve.nomFichier || 'epreuve.pdf')}
                  className="w-full px-4 py-2 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Télécharger
                </button>
              </div>
            ) : (
              <p className="text-sm text-textcol/50">Aucune épreuve téléchargée</p>
            )}
          </div>

          {/* Corrigé */}
          <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-lg transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-600 dark:text-green-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-google-bold text-textcol">Corrigé</h3>
            </div>
            {exam.corrige ? (
              <div>
                <p className="text-sm text-textcol/70 mb-3 wrap-break-word">{exam.corrige.nomFichier}</p>
                <button
                  onClick={() => exam.corrige?.cheminFichier && downloadFile(exam.corrige.cheminFichier, exam.corrige.nomFichier || 'corrige.pdf')}
                  className="w-full px-4 py-2 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all flex items-center justify-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                  </svg>
                  Télécharger
                </button>
              </div>
            ) : (
              <p className="text-sm text-textcol/50">Aucun corrigé téléchargé</p>
            )}
          </div>

          {/* Stats */}
          <div className="bg-linear-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-2xl p-6">
            <h3 className="text-lg font-google-bold text-textcol mb-4">Statistiques</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-textcol/70">Copies importées</span>
                <span className="text-2xl font-google-bold text-primary">{exam.copies.length}</span>
              </div>
              {exam.epreuve && (
                <div className="flex items-center justify-between">
                  <span className="text-textcol/70">Durée</span>
                  <span className="text-lg font-google-bold text-textcol">{exam.epreuve.dureeMinutes} min</span>
                </div>
              )}
            </div>

            {/* Corriger Button */}
            <div className="mt-6">
              <button
                onClick={handleCorrection}
                id="btn-corriger"
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-xl font-google-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                disabled={grading || exam.copies.length === 0 || !exam.epreuve || !exam.corrige}
              >
                {grading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Correction en cours...
                  </>
                ) : (
                  'Corriger les copies'
                )}
              </button>
              <p className="text-sm text-textcol/60 mt-2">Le bouton lancera une correction simulée (mock API).</p>
            </div>
          </div>
        </div>

        {/* Right Column - Upload & Copies */}
        <div className="lg:col-span-2 space-y-6">
          {/* Upload Section */}
          <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-google-bold text-textcol mb-6 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
              Importer des copies d'étudiants
            </h2>
            
            <form onSubmit={handleUpload} className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
                <input
                  type="file"
                  id="student-files"
                  accept="application/pdf,image/*"
                  multiple
                  onChange={(e) => setFiles(e.target.files)}
                  className="hidden"
                />
                <label htmlFor="student-files" className="cursor-pointer block">
                  <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" />
                    </svg>
                  </div>
                  <p className="text-textcol font-google-bold mb-1">
                    Cliquez pour sélectionner des fichiers
                  </p>
                  <p className="text-sm text-textcol/50">
                    PDF ou images • Plusieurs fichiers acceptés
                  </p>
                </label>
              </div>

              {files && files.length > 0 && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <p className="text-sm font-google-bold text-blue-900 dark:text-blue-100 mb-2">
                    {files.length} fichier(s) sélectionné(s)
                  </p>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {Array.from(files).map((file, idx) => (
                      <p key={idx} className="text-xs text-blue-700 dark:text-blue-300 truncate">
                        • {file.name}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {uploading && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-textcol/70">Import en cours...</span>
                    <span className="font-google-bold text-primary">{Math.round(uploadProgress)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
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
                className="w-full px-6 py-4 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Import en cours...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    Importer les copies
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Copies List */}
          <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
            <h2 className="text-2xl font-google-bold text-textcol mb-6 flex items-center gap-3">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
              Copies importées ({exam.copies.length})
            </h2>

            {exam.copies.length === 0 ? (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                </div>
                <p className="text-textcol/70 font-google-bold mb-2">Aucune copie importée</p>
                <p className="text-sm text-textcol/50">
                  Importez les copies des étudiants pour commencer la correction
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {exam.copies.map((copie) => (
                  <div
                    key={copie.id}
                    className="flex items-center justify-between p-4 bg-background rounded-xl border border-gray-200 dark:border-gray-800 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-primary">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-google-bold text-textcol truncate">{copie.name}</p>
                        <p className="text-sm text-textcol/50">
                          {new Date(copie.uploadedAt).toLocaleString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copie.url && downloadFile(copie.url, copie.name)}
                      className="px-4 py-2 bg-primary text-white rounded-lg font-google-bold hover:brightness-110 transition-all opacity-0 group-hover:opacity-100 flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                      </svg>
                      Télécharger
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Grading Modal */}
      {grading && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-indigo-600 dark:text-indigo-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-google-bold text-textcol">Traitement des copies</h3>
                <p className="text-sm text-textcol/70 mt-1">La correction est en cours. Ceci est une simulation.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-textcol/70">Progression</span>
                <span className="font-google-bold text-indigo-600">{Math.round(gradingProgress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-indigo-600 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${gradingProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl p-8 max-w-md w-full shadow-2xl">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-red-600 dark:text-red-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-google-bold text-textcol">Confirmer la suppression</h3>
                <p className="text-sm text-textcol/70 mt-1">Cette action est irréversible</p>
              </div>
            </div>
            
            <p className="text-textcol/70 mb-6">
              Êtes-vous sûr de vouloir supprimer l'examen <span className="font-google-bold text-textcol">"{exam.titre}"</span> ? 
              Toutes les copies et données associées seront également supprimées.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-background rounded-xl font-google-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl font-google-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Suppression...
                  </>
                ) : (
                  'Supprimer'
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