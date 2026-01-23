import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { 
  Users, 
  ChevronLeft, 
  FileText, 
  UserPlus,
  Trash2,
  Settings,
  Loader2
} from 'lucide-react'
import { useTeams } from '../../teams'
import { useAuth } from '../../context/AuthContext'

export const EquipeDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { teams, getTeamMembers, getTeamExams, isLoading: teamsLoading } = useTeams()
  const { user } = useAuth()
  
  const [members, setMembers] = useState<any[]>([])
  const [exams, setExams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const team = teams.find(t => t.id === id)

  useEffect(() => {
    if (!teamsLoading && !team) {
      navigate('/dashboard/equipes')
      return
    }

    if (id) {
      loadData()
    }
  }, [id, team, teamsLoading])

  const loadData = async () => {
    if (!id) return
    setLoading(true)
    const [membersData, examsData] = await Promise.all([
      getTeamMembers(id),
      getTeamExams(id)
    ])
    setMembers(membersData)
    setExams(examsData)
    setLoading(false)
  }

  if (teamsLoading || (loading && members.length === 0)) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    )
  }

  if (!team) return null

  const isCreator = team.createur_id === user?.id

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-6">
        <Link 
          to="/dashboard/equipes"
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors w-fit border border-border-subtle px-3 py-1 rounded-lg"
        >
          <ChevronLeft size={20} />
          Retour aux équipes
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-surface p-8 rounded-[2rem] border border-border-subtle card-shadow">
          <div className="flex gap-6 items-start text-left">
            <div className="p-4 bg-primary/5 text-primary rounded-[1.5rem] border border-primary/10">
              <Users size={36} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-google-bold text-textcol capitalize">{team.nom}</h1>
                <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-xs font-google-bold uppercase tracking-wider">
                  Équipe
                </span>
              </div>
              <p className="text-sm text-secondary font-medium">
                Créée le {new Date(team.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isCreator && (
              <button className="flex items-center gap-2 px-4 py-2 bg-textcol text-surface rounded-xl text-sm font-google-bold hover:brightness-125 transition-all shadow-lg">
                <Settings size={16} />
                Paramètres
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Exams */}
        <div className="lg:col-span-2 space-y-8 text-left">
          <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-8 card-shadow shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-google-bold text-textcol">Examens de l'équipe</h2>
            </div>

            {exams.length === 0 ? (
              <div className="bg-background/50 border-2 border-dashed border-border-subtle rounded-[2rem] p-12 text-center">
                <FileText size={40} className="text-secondary/20 mx-auto mb-4" />
                <p className="text-sm text-secondary">Aucun examen lié à cette équipe.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam: any) => (
                  <div 
                    key={exam.id} 
                    className="p-4 bg-background border border-border-subtle rounded-2xl hover:border-primary/30 transition-all cursor-pointer group"
                    onClick={() => navigate(`/dashboard/examens/${exam.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                        <FileText size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-google-bold text-textcol truncate">{exam.titre}</h4>
                        <p className="text-xs text-secondary">{exam.classe}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Members */}
        <div className="space-y-6 text-left">
          <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-8 card-shadow shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-google-bold text-textcol">Membres</h3>
              <span className="bg-background px-2 py-1 rounded-lg border border-border-subtle text-xs font-bold">
                {members.length}
              </span>
            </div>

            <div className="space-y-4">
              {members.map((m: any) => (
                <div key={m.utilisateur_id} className="flex items-center justify-between p-3 bg-background rounded-2xl border border-border-subtle">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {m.utilisateurs?.nom?.charAt(0) || 'U'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-google-bold text-textcol truncate">{m.utilisateurs?.nom || 'Utilisateur'}</p>
                      <p className="text-[10px] text-secondary truncate">{m.utilisateurs?.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                    m.role === 'admin' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>

            {isCreator && (
              <button 
                className="w-full mt-6 py-3 bg-primary/5 text-primary border border-primary/20 rounded-xl text-xs font-google-bold flex items-center justify-center gap-2 hover:bg-primary hover:text-white transition-all"
              >
                <UserPlus size={14} />
                Inviter un membre
              </button>
            )}
          </div>

          <div className="bg-red-50 border border-red-100 rounded-[2rem] p-6">
            <h4 className="text-red-600 font-google-bold text-sm mb-2 flex items-center gap-2">
              <Trash2 size={16} />
              Zone dangereuse
            </h4>
            <p className="text-xs text-red-500/80 mb-4 leading-relaxed">
              En quittant cette équipe, vous perdrez l'accès à tous les examens partagés.
            </p>
            <button className="w-full py-2 bg-white text-red-600 border border-red-200 rounded-xl text-xs font-bold hover:bg-red-600 hover:text-white transition-all">
               {isCreator ? 'Supprimer l\'équipe' : 'Quitter l\'équipe'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
