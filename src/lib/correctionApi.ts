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
  const res = await fetch(`${API_BASE}/results`)
  if (!res.ok) throw new Error('Failed to load results')
  return res.json()
}

export default {
  submitFormData,
  submitRemoteUrls,
  submitLocalFiles,
  getResults
}
