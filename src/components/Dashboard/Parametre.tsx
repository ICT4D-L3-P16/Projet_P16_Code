import React, { useState } from 'react'
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Settings, 
  Save, 
  Camera,
  LogOut,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Check
} from 'lucide-react'
import { useNotifications } from '../../notifications'

export const Parametres: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const { preferences, updatePreferences } = useNotifications()

  const tabs = [
    { id: 'profile', label: 'Profil', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Sécurité', icon: Lock },
    { id: 'preferences', label: 'Préférences', icon: Globe },
  ]

  // Fix: The Globes icon was a typo, it should be Globe
  const tabIcons = {
    profile: User,
    notifications: Bell,
    security: Lock,
    preferences: Globe
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-google-bold text-textcol mb-2">Paramètres du compte</h1>
          <p className="text-secondary font-medium">Gérez vos informations personnelles et vos préférences.</p>
        </div>
        <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-google-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
          <Save size={18} />
          Sauvegarder
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <div className="space-y-2">
          {tabs.map((tab) => {
            const Icon = tabIcons[tab.id as keyof typeof tabIcons]
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-google-bold transition-all ${
                  activeTab === tab.id 
                    ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                    : 'text-secondary hover:bg-surface hover:text-textcol'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            )
          })}
          <hr className="my-4 border-border-subtle" />
          <button className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl font-google-bold text-red-600 hover:bg-red-50 transition-all">
            <LogOut size={20} />
            Déconnexion
          </button>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3 space-y-8">
          {activeTab === 'profile' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              {/* Profile Card */}
              <section className="bg-surface border border-border-subtle rounded-[2rem] p-8 card-shadow shadow-sm">
                <h2 className="text-xl font-google-bold text-textcol mb-8">Informations publiques</h2>
                <div className="flex flex-col sm:flex-row items-center gap-8 mb-10 pb-10 border-b border-border-subtle">
                  <div className="relative group">
                    <div className="w-32 h-32 rounded-[2.5rem] bg-indigo-100 flex items-center justify-center border-4 border-background overflow-hidden card-shadow">
                      <img src="https://ui-avatars.com/api/?name=Admin&background=6366f1&color=fff&size=128" alt="Profile" className="w-full h-full object-cover" />
                    </div>
                    <button className="absolute -bottom-2 -right-2 p-3 bg-primary text-white rounded-2xl shadow-lg hover:scale-110 transition-transform border-4 border-background">
                      <Camera size={20} />
                    </button>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl font-google-bold text-textcol">Administrateur</h3>
                    <p className="text-secondary font-medium">admin@saje.com • Rôle : Super-admin</p>
                    <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
                      <span className="px-3 py-1 bg-green-50 text-green-600 border border-green-200 rounded-full text-[10px] font-google-bold uppercase tracking-wider">Vérifié</span>
                      <span className="px-3 py-1 bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full text-[10px] font-google-bold uppercase tracking-wider">Abonnement Pro</span>
                    </div>
                  </div>
                </div>

                <form className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-google-bold text-secondary ml-1">Nom complet</label>
                    <input 
                      type="text" 
                      defaultValue="Administrateur" 
                      className="w-full px-5 py-4 bg-background border border-border-subtle rounded-2xl text-textcol outline-none focus:border-primary/50 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-google-bold text-secondary ml-1">Adresse Email</label>
                    <input 
                      type="email" 
                      defaultValue="admin@saje.com" 
                      className="w-full px-5 py-4 bg-background border border-border-subtle rounded-2xl text-textcol outline-none focus:border-primary/50 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-google-bold text-secondary ml-1">Ville</label>
                    <input 
                      type="text" 
                      defaultValue="Yaoundé" 
                      className="w-full px-5 py-4 bg-background border border-border-subtle rounded-2xl text-textcol outline-none focus:border-primary/50 transition-all text-sm font-medium"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-google-bold text-secondary ml-1">Bio (250 caractères max)</label>
                    <textarea 
                      defaultValue="Expert en correction automatique et IA..." 
                      className="w-full px-5 py-4 bg-background border border-border-subtle rounded-2xl text-textcol outline-none focus:border-primary/50 transition-all text-sm font-medium h-14 resize-none"
                    />
                  </div>
                </form>
              </section>

              {/* Security Summary Card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 bg-indigo-600 rounded-[2rem] text-white shadow-xl shadow-indigo-600/20 group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                      <ShieldCheck size={20} />
                    </div>
                    <h4 className="font-google-bold">2FA Activée</h4>
                  </div>
                  <p className="text-sm text-indigo-100 mb-4 font-medium leading-relaxed">Votre compte est protégé par une authentification à deux facteurs.</p>
                  <button className="text-xs font-google-bold text-white flex items-center gap-1 group-hover:gap-2 transition-all">
                    Gérer la sécurité
                    <ChevronRight size={14} />
                  </button>
                </div>
                <div className="p-6 bg-surface border border-border-subtle rounded-[2rem] card-shadow shadow-sm group">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-2 bg-primary/5 rounded-xl text-primary">
                      <Smartphone size={20} />
                    </div>
                    <h4 className="font-google-bold text-textcol">Appareils connectés</h4>
                  </div>
                  <p className="text-sm text-secondary mb-4 font-medium leading-relaxed">2 sessions actives détectées sur des appareils connus.</p>
                  <button className="text-xs font-google-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                    Voir la liste
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
              <section className="bg-surface border border-border-subtle rounded-[2rem] p-8 card-shadow shadow-sm">
                <h2 className="text-xl font-google-bold text-textcol mb-2">Préférences de notification</h2>
                <p className="text-sm text-secondary mb-8">Choisissez les alertes que vous souhaitez recevoir.</p>
                
                <div className="space-y-6">
                  {/* Correction Notification */}
                  <div className="flex items-center justify-between p-6 bg-background border border-border-subtle rounded-2xl group hover:border-primary/30 transition-all">
                    <div className="space-y-1">
                      <h4 className="font-google-bold text-textcol">Nouvelle correction</h4>
                      <p className="text-xs text-secondary leading-relaxed">Recevoir une notification lorsqu'une nouvelle correction est terminée.</p>
                    </div>
                    <button 
                      onClick={() => updatePreferences({ newCorrection: !preferences.newCorrection })}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.newCorrection ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.newCorrection ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                  </div>

                  {/* Validation Notification */}
                  <div className="flex items-center justify-between p-6 bg-background border border-border-subtle rounded-2xl group hover:border-primary/30 transition-all">
                    <div className="space-y-1">
                      <h4 className="font-google-bold text-textcol">Validation de copie</h4>
                      <p className="text-xs text-secondary leading-relaxed">Recevoir une notification quand une correction est validée officiellement.</p>
                    </div>
                    <button 
                      onClick={() => updatePreferences({ validation: !preferences.validation })}
                      className={`relative inline-flex h-7 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${preferences.validation ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-800'}`}
                    >
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${preferences.validation ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>
              </section>

              <div className="p-6 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-900/20 rounded-[2rem] flex items-start gap-4">
                <div className="p-2 bg-indigo-600 rounded-xl text-white">
                  <Check size={20} />
                </div>
                <div>
                  <h4 className="font-google-bold text-textcol text-sm">Synchronisation active</h4>
                  <p className="text-xs text-secondary mt-1">Vos préférences sont automatiquement synchronisées sur tous vos appareils.</p>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'profile' && activeTab !== 'notifications' && (
            <div className="bg-surface border border-border-subtle rounded-[2.5rem] p-12 text-center space-y-4 animate-in fade-in duration-300 h-full flex flex-col items-center justify-center card-shadow">
              <div className="p-6 bg-background rounded-[2rem] border border-dashed border-border-subtle">
                <Settings size={64} className="text-border-subtle animate-spin-slow" />
              </div>
              <h3 className="text-2xl font-google-bold text-textcol">Configuration en cours</h3>
              <p className="text-secondary max-w-sm mx-auto font-medium">Les paramètres de {activeTab} seront disponibles dans la prochaine mise à jour majeure du dashboard.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}