import { useState } from 'react'
import { useExams } from '../../exams'
import { useNavigate } from 'react-router-dom'
import { 
  Plus, 
  FileText, 
  CheckCircle2, 
  ClipboardList, 
  Users, 
  Calendar, 
  Clock, 
  Download, 
  X,
  Filter
} from 'lucide-react'

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
      brouillon: { text: 'Brouillon', className: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400' },
      publie: { text: 'Publié', className: 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400' },
      termine: { text: 'Terminé', className: 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' },
      valide: { text: 'Validé', className: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' }
    }
    const badge = badges[statut as keyof typeof badges] || badges.brouillon
    return (
      <span className={`px-2.5 py-0.5 rounded-full text-xs font-google-bold ${badge.className}`}>
        {badge.text}
      </span>
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary text-sm">Chargement des examens...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-google-bold text-textcol">Gestion des examens</h1>
          <p className="text-secondary mt-1">Gérez vos épreuves et supervisez les corrections automatiques.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-border-subtle rounded-xl text-sm font-medium hover:bg-surface transition-colors font-google-bold">
            <Filter size={16} />
            Filtrer
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="px-6 py-2.5 bg-primary text-white rounded-xl font-google-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all flex items-center gap-2"
          >
            <Plus size={18} />
            Créer un examen
          </button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total examens', value: exams.length, icon: <FileText className="text-blue-600" />, color: 'bg-blue-50' },
          { label: 'Examens publiés', value: exams.filter(e => e.statut === 'publie').length, icon: <CheckCircle2 className="text-green-600" />, color: 'bg-green-50' },
          { label: 'Copies à traiter', value: exams.reduce((sum, e) => sum + e.copies.length, 0), icon: <ClipboardList className="text-purple-600" />, color: 'bg-purple-50' }
        ].map((stat, i) => (
          <div key={i} className="bg-surface border border-border-subtle rounded-2xl p-6 card-shadow flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-secondary mb-1">{stat.label}</p>
              <p className="text-3xl font-google-bold text-textcol">{stat.value}</p>
            </div>
            <div className={`p-4 ${stat.color} dark:bg-surface-dark/50 rounded-2xl`}>
              {stat.icon}
            </div>
          </div>
        ))}
      </section>

      {/* Content Section */}
      <section>
        {exams.length === 0 ? (
          <div className="bg-surface border-2 border-dashed border-border-subtle rounded-3xl p-20 text-center">
            <div className="mx-auto w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center mb-6">
              <FileText className="text-primary" size={32} />
            </div>
            <h3 className="text-xl font-google-bold text-textcol mb-2">Aucun examen trouvé</h3>
            <p className="text-secondary mb-8 max-w-sm mx-auto">Commencez par créer votre premier examen pour gérer les copies et les corrections.</p>
            <button
              onClick={() => setShowModal(true)}
              className="px-8 py-3 bg-primary text-white rounded-xl font-google-bold hover:scale-[1.02] transition-all shadow-lg shadow-primary/20 flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Créer mon premier examen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map((ex) => (
              <div
                key={ex.id}
                onClick={() => navigate(`/dashboard/examens/${ex.id}`)}
                className="bg-surface border border-border-subtle rounded-2xl p-6 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full card-shadow"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="p-2.5 bg-background dark:bg-surface-dark border border-border-subtle rounded-xl group-hover:bg-primary/5 transition-colors">
                    <FileText className="text-secondary group-hover:text-primary" size={20} />
                  </div>
                  {getStatutBadge(ex.statut)}
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-google-bold text-textcol mb-1 group-hover:text-primary transition-colors truncate">
                    {ex.titre}
                  </h3>
                  <div className="flex flex-wrap gap-2 mb-3">
                    <p className="text-sm text-secondary font-medium">{ex.matiere}</p>
                    {ex.team_nom && (
                      <span className="flex items-center gap-1 text-[10px] bg-primary/5 text-primary px-2 py-0.5 rounded-lg border border-primary/10 font-google-bold">
                        <Users size={10} />
                        {ex.team_nom}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2.5">
                    {ex.classe && (
                      <div className="flex items-center gap-2 text-[13px] text-secondary">
                        <Users size={14} />
                        <span>Classe {ex.classe}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-[13px] text-secondary">
                      <Calendar size={14} />
                      <span>{new Date(ex.dateExamen).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-5 border-t border-border-subtle flex items-center justify-between">
                  <div className="flex -space-x-2">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="w-6 h-6 rounded-full border-2 border-surface bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                        U
                      </div>
                    ))}
                    {ex.copies.length > 3 && (
                      <div className="w-6 h-6 rounded-full border-2 border-surface bg-background flex items-center justify-center text-[8px] font-bold text-secondary">
                        +{ex.copies.length - 3}
                      </div>
                    )}
                  </div>
                  <div className="text-[13px] font-google-bold text-textcol bg-background px-3 py-1 rounded-full border border-border-subtle">
                    {ex.copies.length} copies
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal - Professeional Design */}
      {showModal && (
        <div className="fixed inset-0 bg-accent/20 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-surface rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative border border-border-subtle">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-6 right-6 p-2 text-secondary hover:bg-background rounded-full transition-colors"
            >
              <X size={20} />
            </button>

            <div className="mb-8">
              <h2 className="text-2xl font-google-bold text-textcol">Nouvel examen</h2>
              <p className="text-secondary text-sm">Remplissez les informations pour préparer votre session d'examen.</p>
            </div>

            <form className="space-y-6" onSubmit={handleCreate}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-google-bold text-textcol mb-2">Titre de l'examen</label>
                  <input
                    value={titre}
                    onChange={(e) => setTitre(e.target.value)}
                    type="text"
                    placeholder="Ex: Examen de Mathématiques - S1"
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">Matière</label>
                  <input
                    value={matiere}
                    onChange={(e) => setMatiere(e.target.value)}
                    type="text"
                    placeholder="Physique, Histoire..."
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">Classe</label>
                  <input
                    value={classe}
                    onChange={(e) => setClasse(e.target.value)}
                    type="text"
                    placeholder="Licence 3, Terminale A..."
                    className="w-full px-4 py-3 rounded-xl border border-border-subtle bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">Date de session</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                    <input
                      value={dateExamen}
                      onChange={(e) => setDateExamen(e.target.value)}
                      type="date"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-google-bold text-textcol mb-2">Durée (min)</label>
                  <div className="relative">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                    <input
                      value={dureeMinutes}
                      onChange={(e) => setDureeMinutes(Number(e.target.value))}
                      type="number"
                      className="w-full pl-11 pr-4 py-3 rounded-xl border border-border-subtle bg-background focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-background dark:bg-surface-dark border border-border-subtle rounded-2xl">
                <div className="space-y-4">
                  <p className="text-[13px] font-google-bold text-textcol flex items-center gap-2">
                    <FileText size={16} className="text-primary" />
                    Enoncé de l'épreuve
                  </p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-subtle rounded-2xl cursor-pointer hover:bg-primary/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Download size={24} className="text-secondary mb-2" />
                      <p className="text-xs text-secondary font-medium">PDF seulement</p>
                    </div>
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setEpreuveFile(e.target.files?.[0] ?? null)} />
                  </label>
                  {epreuveFile && <p className="text-[11px] text-green-600 truncate">{epreuveFile.name}</p>}
                </div>

                <div className="space-y-4">
                  <p className="text-[13px] font-google-bold text-textcol flex items-center gap-2">
                    <CheckCircle2 size={16} className="text-primary" />
                    Corrigé de référence
                  </p>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border-subtle rounded-2xl cursor-pointer hover:bg-primary/5 transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Download size={24} className="text-secondary mb-2" />
                      <p className="text-xs text-secondary font-medium">PDF seulement</p>
                    </div>
                    <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setCorrectionFile(e.target.files?.[0] ?? null)} />
                  </label>
                  {correctionFile && <p className="text-[11px] text-green-600 truncate">{correctionFile.name}</p>}
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 bg-background border border-border-subtle rounded-xl font-google-bold text-sm hover:bg-surface transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-google-bold text-sm shadow-xl shadow-primary/20 hover:brightness-110 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"
                >
                  {creating ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                  ) : 'Créer l\'examen'}
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
