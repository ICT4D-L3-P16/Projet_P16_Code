import React, { useState } from 'react'
import { 
  Users, 
  Plus, 
  Search, 
  MoreVertical, 
  Shield, 
  Clock, 
  Check, 
  X,
  ChevronRight,
  UserPlus,
  FileText
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useTeams } from '../../teams'
import type { Invitation, Team } from '../../teams'
import { useAuth } from '../../context/AuthContext'

export const Equipes: React.FC = () => {
  const { teams, userInvitations, sharedExams, createTeam, acceptInvitation, refuseInvitation, isLoading } = useTeams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTeamName, setNewTeamName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return
    setCreating(true)
    await createTeam(newTeamName)
    setNewTeamName('')
    setShowCreateModal(false)
    setCreating(false)
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-google-bold text-textcol mb-2">Collaboration & Équipes</h1>
          <p className="text-secondary font-medium">Gérez vos projets partagés et vos collaborateurs</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-google-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20"
        >
          <Plus size={18} />
          Créer une équipe
        </button>
      </div>

      {/* Invitations en attente */}
      {userInvitations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-google-bold text-textcol flex items-center gap-2">
            <Clock size={20} className="text-amber-500" />
            Invitations en attente
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userInvitations.map((invite: Invitation) => (
              <div key={invite.id} className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-amber-100 rounded-xl text-amber-600">
                    <UserPlus size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-google-bold text-textcol">Invitation à l'équipe</p>
                    <p className="text-xs text-secondary">Auteur: {invite.createur_id === user?.id ? 'Vous' : 'Collaborateur'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => acceptInvitation(invite.id)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => refuseInvitation(invite.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Liste des Équipes */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-google-bold text-textcol">Mes Équipes ({teams.length})</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary" size={16} />
            <input 
              type="text" 
              placeholder="Rechercher une équipe..." 
              className="pl-10 pr-4 py-2 bg-surface border border-border-subtle rounded-xl text-sm focus:ring-2 focus:ring-primary/20 transition-all w-64"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : teams.length === 0 ? (
          <div className="bg-surface border border-dashed border-border-subtle rounded-[2rem] p-12 text-center">
            <div className="p-4 bg-background rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <Users size={32} className="text-secondary/40" />
            </div>
            <h3 className="text-lg font-google-bold text-textcol">Aucune équipe trouvée</h3>
            <p className="text-secondary max-w-sm mx-auto mt-2">Commencez par créer une équipe pour inviter vos collaborateurs et partager vos examens.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teams.map((team: Team) => (
              <div key={team.id} className="bg-surface border border-border-subtle rounded-3xl p-6 card-shadow shadow-sm hover:shadow-md transition-all group flex flex-col">
                <div className="flex items-start justify-between mb-6">
                  <div className="p-3 bg-primary/5 text-primary rounded-2xl group-hover:scale-110 transition-transform">
                    <Users size={24} />
                  </div>
                  <button className="p-2 hover:bg-background rounded-lg transition-colors">
                    <MoreVertical size={20} className="text-secondary" />
                  </button>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-google-bold text-textcol mb-2 capitalize">{team.nom}</h3>
                  <div className="flex items-center gap-2 mb-4">
                    <Shield size={14} className="text-blue-600" />
                    <span className="text-xs font-google-bold text-blue-600 uppercase tracking-wider">Équipe Standard</span>
                  </div>
                  
                  <div className="flex -space-x-2 mb-6">
                    {[1, 2].map((i) => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-surface bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                        U{i}
                      </div>
                    ))}
                    <div className="w-8 h-8 rounded-full border-2 border-surface bg-primary text-white flex items-center justify-center text-[10px] font-bold">
                      +1
                    </div>
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/dashboard/equipes/${team.id}`)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-background border border-border-subtle rounded-xl text-sm font-google-bold text-textcol hover:bg-surface transition-all"
                >
                  Ouvrir l'espace
                  <ChevronRight size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Examens Partagés */}
      <div className="space-y-6 pt-10 border-t border-border-subtle">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-google-bold text-textcol">Examens Partagés</h2>
            <p className="text-xs text-secondary mt-1">Examens où vous intervenez en tant que collaborateur</p>
          </div>
        </div>

        {sharedExams.length === 0 ? (
          <div className="bg-surface/50 border border-border-subtle rounded-[2rem] p-8 text-center">
            <p className="text-sm text-secondary">Aucun examen n'est partagé avec vous pour le moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sharedExams.map((exam: any) => (
              <div 
                key={exam.id} 
                className="bg-surface border border-border-subtle rounded-3xl p-5 hover:shadow-md transition-all cursor-pointer group"
                onClick={() => navigate(`/dashboard/examens/${exam.id}`)}
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition-all">
                    <FileText size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-google-bold text-textcol truncate">{exam.titre}</h3>
                    <p className="text-xs text-secondary truncate">{exam.classe}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-[10px] font-google-bold">
                  <span className={`px-2 py-0.5 rounded-full ${
                    exam.statut === 'valide' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                  }`}>
                    {exam.statut?.toUpperCase() || 'BROUILLON'}
                  </span>
                  <span className="text-secondary uppercase">
                    {new Date(exam.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-textcol/20 backdrop-blur-sm" onClick={() => setShowCreateModal(false)}></div>
          <div className="relative bg-surface border border-border-subtle rounded-3xl p-8 w-full max-w-md card-shadow animate-in zoom-in-95 duration-200">
            <h2 className="text-2xl font-google-bold text-textcol mb-2">Nouvelle équipe</h2>
            <p className="text-secondary mb-6">Donnez un nom à votre équipe de collaboration.</p>
            <form onSubmit={handleCreateTeam} className="space-y-6">
              <div>
                <label className="block text-sm font-google-bold text-textcol mb-2">Nom de l'équipe</label>
                <input 
                  type="text" 
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="ex: Département Informatique"
                  className="w-full px-4 py-3 bg-background border border-border-subtle rounded-xl focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  autoFocus
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-3 bg-surface border border-border-subtle rounded-xl text-sm font-google-bold text-textcol hover:bg-background transition-all"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  disabled={creating}
                  className="flex-1 px-4 py-3 bg-primary text-white rounded-xl text-sm font-google-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
                >
                  {creating ? 'Création...' : 'Créer l\'équipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
