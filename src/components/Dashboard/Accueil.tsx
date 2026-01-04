import React from 'react';
import { useAuth } from '../../context/AuthContext'

export const Accueil: React.FC = () => {
    const { user } = useAuth()

    const getDisplayName = () => {
        if (!user) return 'Utilisateur'
        if (user.user_metadata?.prenom) return user.user_metadata.prenom
        return user.email?.split('@')[0] || 'Utilisateur'
    }

    const stats = [
        { label: 'Examens créés', value: '12', icon: '📝', color: 'bg-blue-500' },
        { label: 'Étudiants actifs', value: '248', icon: '👥', color: 'bg-green-500' },
        { label: 'Taux de réussite', value: '87%', icon: '📈', color: 'bg-purple-500' },
        { label: 'Support tickets', value: '3', icon: '🎫', color: 'bg-orange-500' }
    ]

    return (
        <div className="space-y-8">
            <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 text-white shadow-xl">
                <h1 className="text-4xl font-google-bold mb-2">Bienvenue, {getDisplayName()} ! 👋</h1>
                <p className="text-lg opacity-90">Ravi de vous revoir. Voici un aperçu de votre activité.</p>
                {user?.email && <p className="text-sm opacity-75 mt-2">Connecté en tant que {user.email}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-surface border border-gray-200 dark:border-gray-800 rounded-xl p-6 hover:shadow-lg transition-all">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-2xl`}>{stat.icon}</div>
                        </div>
                        <p className="text-3xl font-google-bold text-textcol mb-1">{stat.value}</p>
                        <p className="text-sm opacity-60">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="bg-surface border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="text-2xl font-google-bold mb-6 text-textcol">Activités récentes</h2>
                <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4 p-4 bg-background rounded-lg">
                            <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">📄</div>
                            <div className="flex-1">
                                <p className="font-google-bold text-textcol">Nouvel examen créé</p>
                                <p className="text-sm opacity-60">Il y a {i} heure(s)</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}