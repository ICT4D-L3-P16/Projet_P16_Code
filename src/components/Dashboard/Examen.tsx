import { useState } from 'react'
import { useExams } from '../../exams'
import { useNavigate } from 'react-router-dom'

export const Examens: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const { exams, createExam, isLoading } = useExams()
  const navigate = useNavigate()

  // form state
  const [titre, setTitre] = useState('')
  const [classe, setClasse] = useState('')
  const [matiere, setMatiere] = useState('')
  const [dateExamen, setDateExamen] = useState('')
  const [dureeMinutes, setDureeMinutes] = useState(60)
  const [epreuveFile, setEpreuveFile] = useState<File | null>(null)
  const [correctionFile, setCorrectionFile] = useState<File | null>(null)
  const [creating, setCreating] = useState(false)

  function resetForm() {
    setTitre('')
    setClasse('')
    setMatiere('')
    setDateExamen('')
    setDureeMinutes(60)
    setEpreuveFile(null)
    setCorrectionFile(null)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!titre || !matiere || !dateExamen) {
      alert('Veuillez renseigner le titre, la matière et la date.')
      return
    }

    setCreating(true)
    try {
      const exam = await createExam({ 
        titre, 
        classe: classe || undefined, 
        matiere, 
        dateExamen, 
        dureeMinutes,
        epreuveFile, 
        correctionFile 
      })
      
      if (exam) {
        resetForm()
        setShowModal(false)
        navigate(`/dashboard/examens/${exam.id}`)
      } else {
        alert('Erreur lors de la création de l\'examen')
      }
    } catch (error) {
      console.error('Erreur:', error)
      alert('Erreur lors de la création de l\'examen')
    } finally {
      setCreating(false)
    }
  }

  const getStatutBadge = (statut: string) => {
    const badges = {
      brouillon: { text: 'Brouillon', className: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400' },
      publie: { text: 'Publié', className: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
      termine: { text: 'Terminé', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' }
    }
    const badge = badges[statut as keyof typeof badges] || badges.brouillon
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-google-bold ${badge.className}`}>
        {badge.text}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-textcol/70">Chargement des examens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-google-bold text-textcol mb-2">Gestion des examens</h1>
          <p className="text-textcol/60">Créez et gérez vos examens et leurs corrections</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-6 py-3 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all flex items-center gap-2 shadow-lg shadow-primary/20"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Créer un examen
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <div>
              <p className="text-textcol/60 text-sm">Total examens</p>
              <p className="text-3xl font-google-bold text-textcol">{exams.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/10 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 dark:text-green-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-textcol/60 text-sm">Publiés</p>
              <p className="text-3xl font-google-bold text-textcol">
                {exams.filter(e => e.statut === 'publie').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-600 dark:text-purple-400">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
              </svg>
            </div>
            <div>
              <p className="text-textcol/60 text-sm">Total copies</p>
              <p className="text-3xl font-google-bold text-textcol">
                {exams.reduce((sum, e) => sum + e.copies.length, 0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.length === 0 ? (
          <div className="col-span-full">
            <div className="bg-surface border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center">
              <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-10 h-10 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="text-xl font-google-bold text-textcol mb-2">Aucun examen</h3>
              <p className="text-textcol/60 mb-6">Créez votre premier examen pour commencer</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all inline-flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Créer mon premier examen
              </button>
            </div>
          </div>
        ) : (
          exams.map((ex) => (
            <div
              key={ex.id}
              onClick={() => navigate(`/dashboard/examens/${ex.id}`)}
              className="cursor-pointer bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6 hover:shadow-xl hover:scale-[1.02] transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <h3 className="font-google-bold text-xl text-textcol group-hover:text-primary transition-colors flex-1">
                  {ex.titre}
                </h3>
                {getStatutBadge(ex.statut)}
              </div>

              <div className="space-y-2 mb-4">
                <p className="text-sm text-textcol/70 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
                  </svg>
                  {ex.matiere}
                </p>
                {ex.classe && (
                  <p className="text-sm text-textcol/70 flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                    </svg>
                    Classe {ex.classe}
                  </p>
                )}
                <p className="text-sm text-textcol/70 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {new Date(ex.dateExamen).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4 text-sm">
                  {ex.epreuve && (
                    <span className="text-textcol/70 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                      </svg>
                      Épreuve
                    </span>
                  )}
                  {ex.corrige && (
                    <span className="text-textcol/70 flex items-center gap-1">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Corrigé
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-primary font-google-bold">
                  <span>{ex.copies.length}</span>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 00-3.375-3.375h-1.5a1.125 1.125 0 01-1.125-1.125v-1.5a3.375 3.375 0 00-3.375-3.375H9.75" />
                  </svg>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Exam Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-surface rounded-2xl p-8 max-w-2xl w-full my-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-google-bold text-textcol">Créer un nouvel examen</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-textcol/70">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="space-y-5" onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="md:col-span-2">
                  <label className="block text-sm font-google-bold text-textcol mb-2">
                    Titre de l'examen *
                  </label>
                  <input
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    type="text"
                    placeholder="Ex: Examen de Mathématiques - Trimestre 1"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">
                    Matière *
                  </label>
                  <input
                    value={matiere}
                    onChange={(e) => setMatiere(e.target.value)}
                    type="text"
                    placeholder="Ex: Mathématiques"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">
                    Classe (optionnel)
                  </label>
                  <input
                    value={classe}
                    onChange={(e) => setClasse(e.target.value)}
                    type="text"
                    placeholder="Ex: 3ème A"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">
                    Date de l'examen *
                  </label>
                  <input
                    value={dateExamen}
                    onChange={(e) => setDateExamen(e.target.value)}
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">
                    Durée (minutes)
                  </label>
                  <input
                    value={dureeMinutes}
                    onChange={(e) => setDureeMinutes(Number(e.target.value))}
                    type="number"
                    min="1"
                    placeholder="60"
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-gray-200 dark:border-gray-800">
                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">
                    📄 Fichier de l'épreuve (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setEpreuveFile(e.target.files?.[0] ?? null)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-google-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>
                  {epreuveFile && (
                    <p className="text-sm text-textcol/70 mt-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {epreuveFile.name}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">
                    ✅ Fichier du corrigé (PDF)
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => setCorrectionFile(e.target.files?.[0] ?? null)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-background text-textcol focus:ring-2 focus:ring-primary outline-none transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-google-bold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                    />
                  </div>
                  {correctionFile && (
                    <p className="text-sm text-textcol/70 mt-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-green-600">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {correctionFile.name}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={creating}
                  className="flex-1 px-6 py-4 bg-background rounded-xl font-google-bold hover:bg-gray-100 dark:hover:bg-gray-800 transition-all disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-4 bg-primary text-white rounded-xl font-google-bold hover:brightness-110 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                      </svg>
                      Créer l'examen
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Examens