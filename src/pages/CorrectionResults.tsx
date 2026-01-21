import React, { useMemo, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useExams } from '../exams'
import { useNotifications } from '../notifications'
import { CheckCircle, FileText, FileJson, ChevronDown, ChevronUp, Settings } from 'lucide-react'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const CorrectionResults: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { exams, validateExam } = useExams()
  const { addNotification } = useNotifications()
  const exam = exams.find((e) => e.id === id)
  const [isValidating, setIsValidating] = useState(false)

  // Try location state first, then fallback to sessionStorage
  const results = useMemo(() => {
    if (location.state && (location.state as any).results) return (location.state as any).results
    if (id) {
      try {
        const raw = sessionStorage.getItem(`correction_${id}`)
        if (raw) return JSON.parse(raw)
      } catch (e) {
        console.warn('sessionStorage not available')
      }
    }
    return null
  }, [location.state, id])

  const [expandedId, setExpandedId] = useState<string | null>(null)

  if (!results) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-8">
          <h2 className="text-2xl font-google-bold">Résultats non disponibles</h2>
          <p className="text-textcol/70 mt-2">Aucun résultat de correction trouvé pour cet examen. Lancez d'abord une correction depuis la page de l'examen.</p>
          <div className="mt-6">
            <button onClick={() => navigate(-1)} className="px-4 py-2 bg-primary text-white rounded-xl">Retour</button>
          </div>
        </div>
      </div>
    )
  }

  const downloadJson = (data: any, fileName: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const downloadCsv = (data: any[], headers: string[], fileName: string) => {
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => {
        const value = row[header] ?? ''
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      }).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${fileName}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

  const exportBulkPdf = () => {
    if (!results) return
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text(`Rapport de Correction : ${exam?.titre || 'Examen'}`, 14, 20)
    
    doc.setFontSize(12)
    doc.text(`Matière: ${exam?.matiere || 'N/A'}`, 14, 30)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 14, 37)
    
    const tableData = results.copies.map((c: any) => [
      c.nomEleve,
      `${c.note}/${c.maxNote}`,
      `${c.pourcent}%`
    ])

    autoTable(doc, {
      startY: 45,
      head: [['Étudiant', 'Note', 'Pourcentage']],
      body: tableData,
    })

    doc.save(`resultats_${exam?.titre || id}.pdf`)
  }

  const exportIndividualPdf = (copy: any) => {
    const doc = new jsPDF()
    
    doc.setFontSize(18)
    doc.text(`Copie : ${copy.nomEleve}`, 14, 20)
    doc.setFontSize(12)
    doc.text(`Examen: ${exam?.titre || 'Examen'}`, 14, 30)
    doc.text(`Matière: ${exam?.matiere || 'N/A'}`, 14, 37)
    doc.text(`Note Totale: ${copy.note}/${copy.maxNote} (${copy.pourcent}%)`, 14, 44)
    
    const tableData = copy.details.map((d: any) => [
      `Q${d.question}`,
      d.type.toUpperCase(),
      d.reponse,
      `${d.points}/${d.maxPoints}`,
      d.comment || '-'
    ])

    autoTable(doc, {
      startY: 55,
      head: [['Question', 'Type', 'Réponse', 'Points', 'Commentaire']],
      body: tableData,
    })

    doc.save(`copie_${copy.nomEleve}_${exam?.titre || id}.pdf`)
  }

  const handleValidation = async () => {
    if (!id || isValidating) return
    setIsValidating(true)
    try {
      const success = await validateExam(id)
      if (success) {
        await addNotification({
          title: 'Examen validé',
          message: `La correction de l'examen "${exam?.titre}" a été validée officiellement.`,
          link: `/dashboard/examens/${id}`,
          type: 'success'
        })
        alert('Correction validée avec succès !')
      }
    } catch (err) {
      console.error('Erreur lors de la validation:', err)
      alert('Une erreur est survenue lors de la validation.')
    } finally {
      setIsValidating(false)
    }
  }

  // History fetching disabled
  const history: any[] = []

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="bg-linear-to-br from-primary/10 via-primary/5 to-transparent rounded-2xl p-8 border border-primary/20 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-google-bold text-textcol mb-2">Résultats de la correction</h1>
          <p className="text-textcol/70">Examen: <span className="font-google-bold">{exam?.titre || results.examId}</span></p>
          <div className="mt-3 flex items-center gap-3 text-sm">
            <div className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
              <span className="text-textcol/70">Complet</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" />
              <span className="text-textcol/70">Partiel</span>
            </div>
            <div className="inline-flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
              <span className="text-textcol/70">0 pt</span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-white/50 dark:bg-black/20 p-1 rounded-xl border border-primary/10">
            <button 
              onClick={() => downloadJson(results, `resultats_${id}`)} 
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="Exporter tout en JSON"
            >
              <FileJson size={16} /> JSON
            </button>
            <button 
              onClick={() => downloadCsv(results.copies, ['nomEleve', 'note', 'maxNote', 'pourcent'], `resultats_${id}`)} 
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="Exporter tout en CSV"
            >
              <FileText size={16} /> CSV
            </button>
            <button 
              onClick={exportBulkPdf} 
              className="p-2 hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
              title="Exporter tout en PDF"
            >
              <FileText size={16} /> PDF
            </button>
          </div>

          <button 
            onClick={handleValidation} 
            disabled={isValidating || exam?.statut === 'valide'}
            className={`px-4 py-2 rounded-xl font-google-bold flex items-center gap-2 shadow-lg transition-all ${
              exam?.statut === 'valide' 
                ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                : 'bg-green-600 text-white hover:bg-green-700 shadow-green-600/20'
            }`}
          >
            {isValidating ? 'Validation...' : exam?.statut === 'valide' ? <><CheckCircle size={18} /> Validé</> : <><CheckCircle size={18} /> Valider la correction</>}
          </button>
          
          <button onClick={() => navigate(`/dashboard/examens/${id}`)} className="px-4 py-2 bg-background border border-border-subtle rounded-xl text-sm font-google-bold flex items-center gap-2">
            <Settings size={16} /> Gérer l'examen
          </button>
          <button onClick={() => navigate('/dashboard/examens')} className="px-4 py-2 bg-background border border-border-subtle rounded-xl text-sm font-google-bold">Quitter</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm text-textcol/70">Nombre de copies</h3>
          <div className="text-2xl font-google-bold text-primary mt-2">{results.summary.total}</div>
        </div>
        <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm text-textcol/70">Copies corrigées</h3>
          <div className="text-2xl font-google-bold text-primary mt-2">{results.summary.graded}</div>
        </div>
        <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
          <h3 className="text-sm text-textcol/70">Moyenne</h3>
          <div className="text-2xl font-google-bold text-primary mt-2">{results.summary.moyenne}</div>
        </div>
      </div>

      {/* Copies List */}
      <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h2 className="text-xl font-google-bold mb-4">Résultats par copie</h2>
        <div className="space-y-3">
          {results.copies.map((c: any) => (
            <div key={c.id} className="border border-gray-100 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-google-bold text-textcol">{c.nomEleve}</div>
                  <div className="text-sm text-textcol/70">Note: <span className="font-google-bold">{c.note}/{c.maxNote}</span> • <span className="font-google-bold">{c.pourcent}%</span></div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex border border-border-subtle rounded-lg overflow-hidden mr-2">
                    <button 
                      onClick={() => downloadJson(c, `copie_${c.nomEleve}`)} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      title="JSON"
                    >
                      <FileJson size={14} className="text-secondary" />
                    </button>
                    <button 
                      onClick={() => downloadCsv(c.details, ['question', 'type', 'reponse', 'points', 'maxPoints'], `copie_${c.nomEleve}`)} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-l border-border-subtle"
                      title="CSV"
                    >
                      <FileText size={14} className="text-secondary" />
                    </button>
                    <button 
                      onClick={() => exportIndividualPdf(c)} 
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-l border-border-subtle"
                      title="PDF"
                    >
                      <FileText size={14} className="text-secondary" />
                    </button>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-google-bold ${c.pourcent >= 80 ? 'bg-green-100 text-green-700' : c.pourcent >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {c.pourcent}%
                  </div>
                  <button
                    className="p-2 hover:bg-primary/5 rounded-lg text-primary transition-all"
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  >
                    {expandedId === c.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </button>
                </div>
              </div>

              {expandedId === c.id && (
                <div className="mt-4 bg-background rounded-md p-4">
                  <h4 className="font-google-bold mb-2">Détails des questions</h4>
                  <div className="space-y-2">
                    {c.details.map((d: any) => (
                      <div key={d.question} className="flex items-start justify-between text-sm">
                        <div className="min-w-0">
                          <div className="flex items-center gap-3">
                            <div className="font-google-bold">Q{d.question}</div>
                            <div className="text-xs px-2 py-0.5 rounded bg-background text-textcol/70">{(d.type || 'mcq').toUpperCase()}</div>
                          </div>
                          <div className="text-xs text-textcol/70 truncate">Réponse: <span className="font-google-bold">{d.reponse}</span></div>
                          {d.comment && <div className="text-xs text-textcol/60 mt-1 italic">Commentaire: {d.comment}</div>}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-google-bold ${d.status === 'full' ? 'bg-green-100 text-green-700' : d.status === 'partial' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                            {d.points}/{d.maxPoints}
                          </span>
                          <div className="text-sm text-textcol/70">{d.points} pt</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* History list fetched from API */}
        <div className="mt-6">
          <h3 className="text-lg font-google-bold mb-3">Historique corrections</h3>
          <div className="space-y-2">
            {history ? (
              history.length === 0 ? <div className="text-textcol/70">Aucun résultat enregistré</div> : (
                history.map((h: any) => (
                  <div key={h.id} className="p-3 border rounded-lg bg-background flex items-center justify-between">
                    <div>
                      <div className="font-google-bold">{h.transcriptions?.nom_fichier || `id:${h.id}`}</div>
                      <div className="text-sm text-textcol/70">Note: <span className="font-google-bold">{h.note_totale}</span> • <span className="text-xs text-textcol/50">{new Date(h.transcriptions?.created_at || h.created_at || '').toLocaleString()}</span></div>
                    </div>
                    <div>
                      <button onClick={() => navigator.clipboard.writeText(JSON.stringify(h.details || h.details_json || h))} className="px-3 py-2 bg-primary text-white rounded-lg">Copier JSON</button>
                    </div>
                  </div>
                ))
              )
            ) : (
              <div className="text-textcol/70">Appuyez sur "Rafraîchir l'historique" pour charger</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CorrectionResults
