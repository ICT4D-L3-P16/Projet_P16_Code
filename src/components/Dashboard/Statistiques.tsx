import React from 'react'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileCheck, 
  Target, 
  Award, 
  Clock, 
  Calendar,
  ChevronRight,
  Filter,
  Download
} from 'lucide-react'

export const Statistiques: React.FC = () => {
  const stats = [
    { label: 'Correction totale', value: '1,284', trend: '+12%', icon: FileCheck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Étudiants évalués', value: '856', trend: '+5.4%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Taux de réussite', value: '78.2%', trend: '+2.1%', icon: Target, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Moyenne générale', value: '13.45', trend: '+0.8', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-google-bold text-textcol mb-2">Analyses & Statistiques</h1>
          <p className="text-secondary font-medium">Suivez les performances et l'évolution des examens</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 bg-surface border border-border-subtle rounded-xl text-sm font-google-bold text-textcol hover:bg-background transition-all">
            <Filter size={18} className="text-secondary" />
            Filtrer
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl text-sm font-google-bold hover:brightness-110 transition-all shadow-lg shadow-primary/20">
            <Download size={18} />
            Exporter le rapport
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-surface border border-border-subtle rounded-3xl p-6 card-shadow shadow-sm hover:shadow-md transition-all group">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 ${stat.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                <stat.icon className={stat.color} size={24} />
              </div>
              <span className="flex items-center gap-1 text-xs font-google-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                <TrendingUp size={12} />
                {stat.trend}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-secondary mb-1">{stat.label}</p>
              <h3 className="text-2xl font-google-bold text-textcol">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Main Charts Section (Placeholders for UI) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Main Chart Placeholder */}
          <div className="bg-surface border border-border-subtle rounded-[2rem] p-8 card-shadow shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-google-bold text-textcol">Évolution des performances</h3>
              <div className="flex items-center gap-2 p-1 bg-background rounded-lg border border-border-subtle">
                {['7j', '30j', '3m', '1a'].map((t) => (
                  <button key={t} className={`px-3 py-1 text-xs font-google-bold rounded-md transition-all ${t === '30j' ? 'bg-surface text-primary shadow-sm' : 'text-secondary hover:text-textcol'}`}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-64 flex items-end justify-between gap-2 px-2">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 50, 95].map((val, i) => (
                <div key={i} className="flex-1 space-y-2 group cursor-pointer">
                  <div 
                    className="w-full bg-indigo-600/10 group-hover:bg-indigo-600/20 rounded-t-lg transition-all relative overflow-hidden" 
                    style={{ height: `${val}%` }}
                  >
                    <div className="absolute inset-0 bg-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity translate-y-full group-hover:translate-y-0 duration-500"></div>
                  </div>
                  <div className="h-1 w-full bg-transparent group-hover:bg-indigo-600 rounded-full transition-all"></div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-4 px-2 text-[10px] font-google-bold text-secondary uppercase tracking-wider">
              <span>Jan</span>
              <span>Fév</span>
              <span>Mar</span>
              <span>Avr</span>
              <span>Mai</span>
              <span>Juin</span>
              <span>Juil</span>
              <span>Août</span>
              <span>Sep</span>
              <span>Oct</span>
              <span>Nov</span>
              <span>Déc</span>
            </div>
          </div>

          {/* Performance Table Placeholder */}
          <div className="bg-surface border border-border-subtle rounded-[2rem] p-8 card-shadow shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-xl font-google-bold text-textcol">Dernières évaluations</h3>
              <button className="text-sm font-google-bold text-primary hover:underline flex items-center gap-1">
                Voir tout
                <ChevronRight size={16} />
              </button>
            </div>
            <div className="space-y-4">
              {[
                { name: 'Algorithmique & C++', date: 'Hier', score: '14.5/20', status: 'Terminé' },
                { name: 'Base de données SQL', date: 'Il y a 2 jours', score: '12.8/20', status: 'Terminé' },
                { name: 'Architecture Réseau', date: '08 Mai 2024', score: '--/20', status: 'En cours' },
              ].map((exam, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-2xl border border-border-subtle hover:border-primary/30 transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-surface rounded-xl card-shadow group-hover:bg-primary/5 transition-colors">
                      <BarChart3 size={18} className="text-secondary group-hover:text-primary" />
                    </div>
                    <div>
                      <p className="font-google-bold text-textcol text-sm">{exam.name}</p>
                      <p className="text-xs text-secondary mt-0.5 flex items-center gap-1">
                        <Calendar size={12} />
                        {exam.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-google-bold text-textcol text-sm">{exam.score}</p>
                    <p className={`text-[10px] font-google-bold mt-1 ${exam.status === 'Terminé' ? 'text-green-600' : 'text-blue-600'}`}>{exam.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 space-y-8">
          {/* Distribution Card */}
          <div className="bg-surface border border-border-subtle rounded-[2rem] p-8 card-shadow shadow-sm">
            <h3 className="text-xl font-google-bold text-textcol mb-8">Répartition des notes</h3>
            <div className="space-y-6">
              {[
                { label: 'Excellent (16-20)', value: 15, color: 'bg-green-500' },
                { label: 'Bien (12-16)', value: 45, color: 'bg-blue-500' },
                { label: 'Passable (10-12)', value: 25, color: 'bg-amber-500' },
                { label: 'Échec (<10)', value: 15, color: 'bg-red-500' },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between text-xs font-google-bold">
                    <span className="text-secondary">{item.label}</span>
                    <span className="text-textcol">{item.value}%</span>
                  </div>
                  <div className="w-full bg-background rounded-full h-2 overflow-hidden border border-border-subtle p-0.5">
                    <div className={`${item.color} h-full rounded-full`} style={{ width: `${item.value}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 bg-primary/5 rounded-2xl border border-primary/10">
              <div className="flex items-center gap-2 text-primary font-google-bold text-sm mb-2">
                <TrendingUp size={16} />
                Conseil IA
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Les résultats en <span className="text-textcol font-google-bold">Base de données</span> sont en hausse de 15% par rapport au mois dernier.
              </p>
            </div>
          </div>

          {/* Time Analysis */}
          <div className="bg-indigo-600 rounded-[2rem] p-8 shadow-xl shadow-indigo-600/20 text-white relative overflow-hidden group">
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-google-bold">Temps de correction</h3>
              </div>
              <div>
                <p className="text-3xl font-google-bold mb-1">2.4s</p>
                <p className="text-xs text-indigo-100 font-medium">Temps moyen par copie</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-google-bold text-indigo-100">
                  <span>Gain de temps total</span>
                  <span>142 Heures</span>
                </div>
                <div className="w-full bg-white/20 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-white h-full w-[85%] rounded-full shadow-lg"></div>
                </div>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000"></div>
          </div>
        </div>
      </div>
    </div>
  )
}