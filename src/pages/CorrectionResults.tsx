import React, { useMemo, useState } from 'react'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import { useExams } from '../exams'

const CorrectionResults: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { exams } = useExams()
  const exam = exams.find((e) => e.id === id)

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

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(results, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `correction_${results.examId}.json`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
  }

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
        <div className="flex items-center gap-3">
          <button onClick={downloadJson} className="px-4 py-2 bg-primary text-white rounded-xl">Télécharger JSON</button>
          <button onClick={() => navigate('/dashboard/examens')} className="px-4 py-2 bg-background rounded-xl">Retour aux examens</button>
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
                <div className="flex items-center gap-3">
                  <div className={`px-3 py-1 rounded-full text-sm font-google-bold ${c.pourcent >= 80 ? 'bg-green-100 text-green-700' : c.pourcent >= 50 ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                    {c.pourcent}%
                  </div>
                  <button
                    className="px-3 py-2 bg-primary text-white rounded-lg"
                    onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                  >{expandedId === c.id ? 'Fermer' : 'Détails'}</button>
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
      </div>
    </div>
  )
}

export default CorrectionResults
