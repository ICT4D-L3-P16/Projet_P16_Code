// Resolve backend URL from env: prefer VITE_BACKEND_URL, then BACKEND_URL (for existing .env), then VITE_API_BASE for compatibility.
const API_BASE = import.meta.env.VITE_BACKEND_URL || import.meta.env.BACKEND_URL || import.meta.env.VITE_API_BASE || 'http://localhost:3000'

// Helpful debug log (will appear in dev console)
if (typeof window !== 'undefined') console.debug('[correctionApi] API base URL:', API_BASE)

async function fetchRemoteAsFile(url: string, filename?: string): Promise<File> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch ${url}`)
  const blob = await res.blob()
  const name = filename || (url.split('/').pop() || 'file')
  return new File([blob], name, { type: blob.type })
}

export async function submitFormData(formData: FormData) {
  const res = await fetch(`${API_BASE}/api/full`, {
    method: 'POST',
    body: formData
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

export async function submitRemoteUrls(urls: { url: string; filename?: string }[]) {
  const formData = new FormData()
  for (const item of urls) {
    const file = await fetchRemoteAsFile(item.url, item.filename)
    formData.append('files', file)
  }
  return submitFormData(formData)
}

export async function submitLocalFiles(files: FileList | File[]) {
  const formData = new FormData()
  const fl = Array.from(files as any) as File[]
  fl.forEach((f) => formData.append('files', f))
  return submitFormData(formData)
}

export async function getResults() {
  const res = await fetch(`${API_BASE}/api/results`)
  if (!res.ok) throw new Error('Failed to load results')
  return res.json()
}

export const transformResults = (backendRes: any, examCopies: any[], exam: any) => {
  const rawResultats = backendRes.resultat || {}
  const transformCopy = (key: string, data: any) => {
    const copyIndex = parseInt(key.replace('copie_', '')) - 1
    const originalFile = examCopies[copyIndex]
    const maxNote = exam?.corrige?.totalPoints || 20
    
    return {
      id: data.db_id || key,
      nomEleve: originalFile?.name || data.nom_fichier || key,
      note: Number(data.note_totale) || 0,
      maxNote: maxNote,
      pourcent: Math.round(((Number(data.note_totale) || 0) / maxNote) * 100),
      details: (data.questions || []).map((q: any) => {
        const maxPoints = Number(q.max_points) || (maxNote / (data.questions.length || 1)) || 5
        return {
          question: q.num,
          points: q.point,
          maxPoints: Math.round(maxPoints),
          type: q.type || 'open',
          reponse: 'Extraite par OCR',
          status: q.point > 0 ? (q.point >= (maxPoints * 0.8) ? 'full' : 'partial') : 'none',
          comment: q.commentaire
        }
      })
    }
  }

  const transformedCopies = Object.entries(rawResultats).map(([key, data]) => transformCopy(key, data))
  const notes = transformedCopies.map(c => c.note)
  const moyenne = notes.length > 0 ? (notes.reduce((a, b) => a + b, 0) / notes.length) : 0

  return {
    ...backendRes,
    copies: transformedCopies,
    summary: {
      total: examCopies.length,
      graded: transformedCopies.length,
      moyenne: moyenne,
      max: notes.length > 0 ? Math.max(...notes) : 0,
      distribution: {
        excellent: notes.filter(n => n >= 16).length,
        bien: notes.filter(n => n >= 12 && n < 16).length,
        pass: notes.filter(n => n >= 10 && n < 12).length
      }
    }
  }
}

export default {
  submitFormData,
  submitRemoteUrls,
  submitLocalFiles,
  getResults,
  transformResults
}
