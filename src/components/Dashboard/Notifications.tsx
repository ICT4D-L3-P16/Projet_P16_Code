import React from 'react'
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Trash2, 
  Check, 
  MoreVertical,
  Clock,
  ShieldCheck
} from 'lucide-react'

export const Notifications: React.FC = () => {
  const notifications = [
    {
      id: 1,
      title: 'Correction terminée',
      message: 'L\'examen d\'Algorithmique a été corrigé avec succès. 45 copies analysées.',
      time: 'Il y a 10 min',
      type: 'success',
      icon: CheckCircle2,
      unread: true,
      color: 'text-green-600',
      bg: 'bg-green-50'
    },
    {
      id: 2,
      title: 'Alerte de sécurité',
      message: 'Nouvelle connexion détectée depuis un nouvel appareil à Yaoundé.',
      time: 'Il y a 2 heures',
      type: 'warning',
      icon: ShieldCheck,
      unread: true,
      color: 'text-amber-600',
      bg: 'bg-amber-50'
    },
    {
      id: 3,
      title: 'Mise à jour système',
      message: 'La version 2.4 de SAJE est maintenant disponible avec de nouveaux modèles OCR.',
      time: 'Il y a 5 heures',
      type: 'info',
      icon: Info,
      unread: false,
      color: 'text-blue-600',
      bg: 'bg-blue-50'
    },
    {
      id: 4,
      title: 'Erreur d\'importation',
      message: 'Le fichier "examen_maths.pdf" est corrompu et n\'a pas pu être importé.',
      time: 'Hier, 16:45',
      type: 'error',
      icon: AlertCircle,
      unread: false,
      color: 'text-red-600',
      bg: 'bg-red-50'
    }
  ]

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-google-bold text-textcol mb-2">Centre de notifications</h1>
          <p className="text-secondary font-medium">Restez informé de l'activité de votre compte.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-subtle rounded-xl text-xs font-google-bold text-secondary hover:text-textcol transition-all">
            <Check size={16} />
            Marquer tout comme lu
          </button>
          <button className="p-2.5 bg-surface border border-border-subtle rounded-xl text-secondary hover:text-textcol transition-all">
            <Trash2 size={18} />
          </button>
        </div>
      </div>

      {/* Stats/Filters Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {['Toutes', 'Non lues', 'Correction', 'Sécurité', 'Système'].map((filter, i) => (
          <button key={i} className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-google-bold border transition-all ${i === 1 ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border-subtle text-secondary hover:border-border-strong'}`}>
            {filter} {i === 1 && <span className="ml-1 bg-white/20 px-1.5 rounded-full text-[10px]">2</span>}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.map((notif) => (
          <div 
            key={notif.id} 
            className={`group flex items-start gap-5 p-6 rounded-[2rem] border transition-all cursor-pointer ${
              notif.unread 
                ? 'bg-surface border-primary/20 shadow-md shadow-primary/5' 
                : 'bg-surface/50 border-border-subtle opacity-80 hover:opacity-100 hover:bg-surface'
            }`}
          >
            <div className={`p-3.5 ${notif.bg} rounded-2xl shrink-0 group-hover:scale-110 transition-transform`}>
              <notif.icon className={notif.color} size={24} />
            </div>
            
            <div className="flex-1 min-w-0 space-y-1">
              <div className="flex items-center justify-between">
                <h3 className={`font-google-bold text-base ${notif.unread ? 'text-textcol' : 'text-secondary'}`}>
                  {notif.title}
                </h3>
                <span className="text-[10px] font-google-bold text-secondary/60 flex items-center gap-1 bg-background px-2 py-1 rounded-full border border-border-subtle">
                  <Clock size={10} />
                  {notif.time}
                </span>
              </div>
              <p className={`text-sm leading-relaxed ${notif.unread ? 'text-secondary' : 'text-secondary/60'}`}>
                {notif.message}
              </p>
              <div className="pt-2 flex items-center gap-4">
                <button className="text-[11px] font-google-bold text-primary hover:underline">Voir l'examen</button>
                {notif.unread && (
                  <button className="text-[11px] font-google-bold text-secondary hover:text-textcol">Marquer comme lu</button>
                )}
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              {notif.unread && <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/20"></div>}
              <button className="p-2 text-secondary/30 hover:text-secondary rounded-xl transition-all">
                <MoreVertical size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State Mockup */}
      {notifications.length === 0 && (
        <div className="py-20 text-center space-y-4">
          <div className="mx-auto w-24 h-24 bg-surface border border-dashed border-border-subtle rounded-full flex items-center justify-center">
            <Bell size={40} className="text-secondary/20" />
          </div>
          <div>
            <h3 className="text-xl font-google-bold text-textcol">Aucune notification</h3>
            <p className="text-secondary">Vous êtes à jour ! Repassez plus tard.</p>
          </div>
        </div>
      )}
    </div>
  )
}
