import React, { useState } from 'react'
import { 
  X, 
  Mail, 
  Check, 
  Copy,
  Users,
  Shield,
  Plus,
  FileText,
  Zap,
  CheckCircle2,
  Download
} from 'lucide-react'
import { useTeams } from '../../teams'
import type { TeamPermission } from '../../teams'
import { sendInvitationEmail } from '../../lib/emailService'

interface InviteModalProps {
  examId?: string
  examTitle?: string
  onClose: () => void
  initialTeamId?: string
}

export const InviteModal: React.FC<InviteModalProps> = ({ examId, examTitle, onClose, initialTeamId }) => {
  const { teams, inviteToExam } = useTeams()
  const [emailInput, setEmailInput] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(initialTeamId || '')
  const [inviting, setInviting] = useState(false)
  const [inviteToken, setInviteToken] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [inviteCount, setInviteCount] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const [permissions, setPermissions] = useState<TeamPermission>({
    can_add_copies: false,
    can_correct: false,
    can_validate: false,
    can_view_details: true,
    can_export: false
  })

  const togglePermission = (key: keyof TeamPermission) => {
    setPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const handleInvite = async () => {
    if (!selectedTeam) {
      alert('Veuillez sélectionner une équipe')
      return
    }

    const team = teams.find(t => t.id === selectedTeam)
    const emails = emailInput.split(',').map(e => e.trim()).filter(e => e.length > 0)
    
    if (emails.length > 5) {
      setError('Limite de 5 invitations par envoi dépassée.')
      return
    }

    setInviting(true)
    setError(null)
    let lastToken = null
    let count = 0

    try {
      if (emails.length === 0) {
        lastToken = await inviteToExam({
          examId,
          teamId: selectedTeam,
          permissions
        })
        count = 1
      } else {
        for (const email of emails) {
          const token = await inviteToExam({
            examId,
            teamId: selectedTeam,
            email,
            permissions
          })
          if (token) {
            lastToken = token
            count++
            await sendInvitationEmail(
              email, 
              team?.nom || 'Équipe pédagogique', 
              examTitle || 'Collaboration d\'équipe', 
              `${window.location.origin}/join/${token}`
            )
          }
        }
      }

      setInviteToken(lastToken)
      setInviteCount(count)
    } catch (error) {
      console.error('Erreur lors de l\'invitation:', error)
      setError('Une erreur est survenue lors de l\'envoi.')
    } finally {
      setInviting(false)
    }
  }

  const copyLink = () => {
    if (!inviteToken) return
    const url = `${window.location.origin}/join/${inviteToken}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-textcol/40 backdrop-blur-md" onClick={onClose}></div>
      <div className="relative bg-surface border border-border-subtle rounded-[2.5rem] p-8 w-full max-w-2xl card-shadow animate-in zoom-in-95 duration-200 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Side: General Info & Permissions */}
        <div className="space-y-6">
          <div className="flex items-center justify-between md:hidden">
             <h2 className="text-2xl font-google-bold text-textcol">Inviter des collaborateurs</h2>
             <button onClick={onClose} className="p-2 hover:bg-background rounded-full transition-colors">
               <X size={24} />
             </button>
          </div>
          <div className="hidden md:block text-left">
            <h2 className="text-2xl font-google-bold text-textcol">Partager {examId ? 'l\'examen' : 'l\'accès'}</h2>
            {examTitle && <p className="text-sm text-secondary mt-1">"{examTitle}"</p>}
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-google-bold text-textcol uppercase tracking-wider flex items-center gap-2">
              <Shield size={16} className="text-primary" />
              Permissions assignées
            </h3>
            
            <div className="space-y-3">
              {[
                { key: 'can_view_details', label: 'Voir les détails', icon: <FileText size={14} />, desc: 'Consulter les copies et notes' },
                { key: 'can_add_copies', label: 'Ajouter des copies', icon: <Plus size={14} />, desc: 'Importer de nouveaux fichiers' },
                { key: 'can_correct', label: 'Lancer correction', icon: <Zap size={14} />, desc: 'Utiliser l\'IA pour corriger' },
                { key: 'can_validate', label: 'Valider correction', icon: <CheckCircle2 size={14} />, desc: 'Approuver les résultats finaux' },
                { key: 'can_export', label: 'Exporter résultats', icon: <Download size={14} />, desc: 'Télécharger PDF et JSON' },
              ].map((item) => (
                <div 
                  key={item.key}
                  onClick={() => togglePermission(item.key as keyof TeamPermission)}
                  className={`flex items-start gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${permissions[item.key as keyof TeamPermission] ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-background border-transparent hover:border-border-subtle'}`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg ${permissions[item.key as keyof TeamPermission] ? 'bg-primary text-white' : 'bg-surface text-secondary border border-border-subtle'}`}>
                    {item.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <p className={`text-sm font-google-bold ${permissions[item.key as keyof TeamPermission] ? 'text-primary' : 'text-textcol'}`}>{item.label}</p>
                    <p className="text-[10px] text-secondary font-medium">{item.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${permissions[item.key as keyof TeamPermission] ? 'bg-primary border-primary text-white' : 'border-border-subtle bg-surface'}`}>
                    {permissions[item.key as keyof TeamPermission] && <Check size={12} />}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Invitation Form */}
        <div className="bg-background/50 rounded-[2rem] p-6 flex flex-col justify-between border border-border-subtle">
          <div className="space-y-6">
            <div className="hidden md:flex justify-end">
               <button onClick={onClose} className="p-2 hover:bg-surface rounded-full transition-colors border border-transparent hover:border-border-subtle">
                 <X size={20} />
               </button>
            </div>

            {!inviteToken ? (
              <>
                <div className="space-y-4">
                  <div className="text-left">
                    <label className="block text-xs font-google-bold text-secondary uppercase mb-2">1. Sélectionner une équipe</label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                      <select 
                        value={selectedTeam}
                        onChange={(e) => setSelectedTeam(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-primary/20 appearance-none outline-none"
                      >
                        <option value="">Choisir une équipe...</option>
                        {teams.map(t => (
                          <option key={t.id} value={t.id}>{t.nom}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="text-left">
                    <label className="block text-xs font-google-bold text-secondary uppercase mb-2">2. Emails (séparés par des virgules)</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
                      <input 
                        type="email" 
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="un@exemple.fr, deux@exemple.com"
                        className="w-full pl-10 pr-4 py-3 bg-surface border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-3 text-red-600 text-[11px] font-google-bold text-left">
                    {error}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 text-left">
                  <div className="flex gap-3">
                    <Zap size={18} className="text-blue-600 shrink-0" />
                    <p className="text-[11px] text-blue-700 leading-relaxed font-medium">
                      L'invitation créera un lien unique ou enverra un email si l'utilisateur possède déjà un compte (Max 5 par batch).
                    </p>
                  </div>
                </div>

                <button 
                  onClick={handleInvite}
                  disabled={inviting || !selectedTeam}
                  className="w-full py-3.5 bg-primary text-white rounded-2xl font-google-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none"
                >
                  {inviting ? 'Traitement...' : 'Générer l\'invitation'}
                </button>
              </>
            ) : (
              <div className="space-y-6 text-center animate-in fade-in slide-in-from-bottom-4">
                <div className="p-4 bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-2">
                  <Check size={32} className="text-green-600" />
                </div>
                <div>
                  <h3 className="text-lg font-google-bold text-textcol">
                    {inviteCount > 1 ? `${inviteCount} invitations prêtes !` : 'Invitation prête !'}
                  </h3>
                  <p className="text-xs text-secondary mt-1">
                    {inviteCount > 1 
                      ? 'Les invitations ont été envoyées par mail.' 
                      : 'L\'invitation a été créée et envoyée avec succès.'}
                  </p>
                </div>

                <div className="space-y-3 text-left">
                  <label className="block text-xs font-google-bold text-secondary uppercase">Dernier lien généré</label>
                  <div className="flex gap-2">
                    <div className="flex-1 px-4 py-3 bg-surface border border-border-subtle rounded-xl text-xs font-mono truncate text-secondary">
                      {window.location.origin}/join/{inviteToken}
                    </div>
                    <button 
                      onClick={copyLink}
                      className="p-3 bg-primary text-white rounded-xl hover:brightness-110 transition-all shrink-0"
                    >
                      {copied ? <Check size={18} /> : <Copy size={18} />}
                    </button>
                  </div>
                </div>

                <div className="pt-4">
                   <button 
                    onClick={onClose}
                    className="w-full py-3 border border-border-subtle rounded-xl text-sm font-google-bold text-textcol hover:bg-surface transition-all"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
