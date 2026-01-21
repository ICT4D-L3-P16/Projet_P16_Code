import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../../notifications'
import type { NotificationType } from '../../notifications'
import { 
  Bell, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Trash2, 
  Check, 
  Clock,
  ShieldCheck,
  Loader2
} from 'lucide-react'

export const Notifications: React.FC = () => {
  const navigate = useNavigate()
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification 
  } = useNotifications()

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case 'success': return CheckCircle2
      case 'warning': return ShieldCheck
      case 'error': return AlertCircle
      case 'info':
      default: return Info
    }
  }

  const getColor = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'text-green-600'
      case 'warning': return 'text-amber-600'
      case 'error': return 'text-red-600'
      case 'info':
      default: return 'text-blue-600'
    }
  }

  const getBg = (type: NotificationType) => {
    switch (type) {
      case 'success': return 'bg-green-50'
      case 'warning': return 'bg-amber-50'
      case 'error': return 'bg-red-50'
      case 'info':
      default: return 'bg-blue-50'
    }
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000)
    
    if (diffInMinutes < 1) return 'À l\'instant'
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)} h`
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-google-bold text-textcol mb-2">Centre de notifications</h1>
          <p className="text-secondary font-medium">Restez informé de l'activité de votre compte.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
            className="flex items-center gap-2 px-4 py-2 bg-surface border border-border-subtle rounded-xl text-xs font-google-bold text-secondary hover:text-textcol transition-all disabled:opacity-50"
          >
            <Check size={16} />
            Marquer tout comme lu
          </button>
        </div>
      </div>

      {/* Stats/Filters Summary */}
      <div className="flex gap-4 overflow-x-auto pb-2 custom-scrollbar">
        {['Toutes', 'Non lues'].map((filter, i) => (
          <button key={i} className={`whitespace-nowrap px-6 py-2.5 rounded-2xl text-xs font-google-bold border transition-all ${i === 0 ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' : 'bg-surface border-border-subtle text-secondary hover:border-border-strong'}`}>
            {filter} {i === 1 && unreadCount > 0 && <span className="ml-1 bg-white/20 px-1.5 rounded-full text-[10px]">{unreadCount}</span>}
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="animate-spin text-primary mb-4" size={40} />
            <p className="text-secondary font-medium">Chargement des notifications...</p>
          </div>
        ) : notifications.map((notif) => {
          const Icon = getIcon(notif.type)
          return (
            <div 
              key={notif.id} 
              onClick={() => {
                if (!notif.isRead) markAsRead(notif.id)
                if (notif.link) navigate(notif.link)
              }}
              className={`group flex items-start gap-5 p-6 rounded-[2rem] border transition-all cursor-pointer ${
                !notif.isRead 
                  ? 'bg-surface border-primary/20 shadow-md shadow-primary/5' 
                  : 'bg-surface/50 border-border-subtle opacity-80 hover:opacity-100 hover:bg-surface'
              }`}
            >
              <div className={`p-3.5 ${getBg(notif.type)} rounded-2xl shrink-0 group-hover:scale-110 transition-transform`}>
                <Icon className={getColor(notif.type)} size={24} />
              </div>
              
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center justify-between">
                  <h3 className={`font-google-bold text-base ${!notif.isRead ? 'text-textcol' : 'text-secondary'}`}>
                    {notif.title}
                  </h3>
                  <span className="text-[10px] font-google-bold text-secondary/60 flex items-center gap-1 bg-background px-2 py-1 rounded-full border border-border-subtle">
                    <Clock size={10} />
                    {formatTime(notif.createdAt)}
                  </span>
                </div>
                <p className={`text-sm leading-relaxed ${!notif.isRead ? 'text-secondary' : 'text-secondary/60'}`}>
                  {notif.message}
                </p>
                <div className="pt-2 flex items-center gap-4">
                  {notif.link && <button className="text-[11px] font-google-bold text-primary hover:underline">Voir l'examen</button>}
                  {!notif.isRead && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); markAsRead(notif.id) }} 
                      className="text-[11px] font-google-bold text-secondary hover:text-textcol"
                    >
                      Marquer comme lu
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                {!notif.isRead && <div className="w-2.5 h-2.5 bg-primary rounded-full shadow-lg shadow-primary/20"></div>}
                <button 
                  onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id) }}
                  className="p-2 text-secondary/30 hover:text-red-500 rounded-xl transition-all"
                  title="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          )
        })}
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
