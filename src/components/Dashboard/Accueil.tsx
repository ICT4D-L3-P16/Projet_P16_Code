import React from 'react';
import { useAuth } from '../../context/AuthContext'
import { FileText, Users, TrendingUp, AlertCircle, ChevronRight, GraduationCap, Settings2 } from 'lucide-react'

export const Accueil: React.FC = () => {
    const { user } = useAuth()

    const getDisplayName = () => {
        if (!user) return 'Utilisateur'
        if (user.user_metadata?.prenom) return user.user_metadata.prenom
        return user.email?.split('@')[0] || 'Utilisateur'
    }

    const stats = [
        { label: 'Examens créés', value: '12', trend: '+2 ce mois', icon: <FileText className="w-6 h-6" />, color: 'bg-blue-500/10 text-blue-600' },
        { label: 'Étudiants actifs', value: '248', trend: '+12%', icon: <Users className="w-6 h-6" />, color: 'bg-green-500/10 text-green-600' },
        { label: 'Taux de réussite', value: '87%', trend: '+5.4%', icon: <TrendingUp className="w-6 h-6" />, color: 'bg-indigo-500/10 text-indigo-600' },
        { label: 'Tickets support', value: '3', trend: 'Priorité haute', icon: <AlertCircle className="w-6 h-6" />, color: 'bg-orange-500/10 text-orange-600' }
    ]

    return (
        <div className="space-y-10">
            <section>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                    <div>
                        <h1 className="text-3xl font-google-bold text-textcol">Bonjour, {getDisplayName()} !</h1>
                        <p className="text-secondary mt-1">Voici ce qui se passe sur votre plateforme aujourd'hui.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="px-4 py-2 bg-primary text-white rounded-xl font-google-bold text-sm shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all">
                            Créer un examen
                        </button>
                    </div>
                </div>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-surface border border-border-subtle rounded-2xl p-6 transition-all hover:shadow-md card-shadow group">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                {stat.icon}
                            </div>
                            <span className="text-[11px] font-google-bold px-2 py-1 rounded-full bg-background text-secondary uppercase tracking-wider">
                                {stat.trend}
                            </span>
                        </div>
                        <h3 className="text-sm font-medium text-secondary mb-1">{stat.label}</h3>
                        <p className="text-3xl font-google-bold text-textcol">{stat.value}</p>
                    </div>
                ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <section className="lg:col-span-2 bg-surface border border-border-subtle rounded-2xl p-8 card-shadow">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-google-bold text-textcol">Activités récentes</h2>
                        <button className="text-sm font-google-bold text-primary hover:underline">Voir tout</button>
                    </div>
                    <div className="space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-start gap-4 pb-6 border-b border-border-subtle last:border-0 last:pb-0">
                                <div className="w-10 h-10 bg-background rounded-full flex items-center justify-center text-primary border border-border-subtle shrink-0">
                                    {i === 1 ? <FileText size={20} /> : i === 2 ? <GraduationCap size={20} /> : <Settings2 size={20} />}
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between gap-4">
                                        <p className="font-google-bold text-textcol text-[15px]">
                                            {i === 1 ? 'Nouvel examen créé' : i === 2 ? 'Correction terminée' : 'Profil mis à jour'}
                                        </p>
                                        <span className="text-xs text-secondary whitespace-nowrap">Il y a {i} heure{i > 1 ? 's' : ''}</span>
                                    </div>
                                    <p className="text-sm text-secondary leading-relaxed">
                                        {i === 1 ? 'Examen de Mathématiques pour le niveau Licence 3 a été publié.' : 
                                         i === 2 ? 'Les copies de l\'examen de Physique ont été corrigées avec succès.' : 
                                         'Votre photo de profil et vos informations de contact ont été mis à jour.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="space-y-6">
                    <div className="bg-accent text-white rounded-2xl p-8 shadow-xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-xl font-google-bold mb-4">Besoin d'aide ?</h3>
                            <p className="text-white/80 text-sm leading-relaxed mb-6">
                                Consultez notre documentation ou contactez le support pour toute assistance technique.
                            </p>
                            <button className="w-full py-3 bg-white text-accent rounded-xl font-google-bold text-sm hover:bg-white/90 transition-colors">
                                Ouvrir le centre d'aide
                            </button>
                        </div>
                        <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                    </div>

                    <div className="bg-surface border border-border-subtle rounded-2xl p-8 card-shadow">
                        <h3 className="text-lg font-google-bold text-textcol mb-6">Actions Rapides</h3>
                        <div className="grid grid-cols-1 gap-3">
                            {['Ajouter étudiant', 'Importer CSV', 'Générer rapport'].map((action, idx) => (
                                <button key={idx} className="flex items-center justify-between p-4 rounded-xl border border-border-subtle hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                                    <span className="text-sm font-medium text-textcol">{action}</span>
                                    <ChevronRight size={16} className="text-secondary" />
                                </button>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    )
}
