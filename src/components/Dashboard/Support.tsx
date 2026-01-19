import React from 'react'
import { 
  MessageSquare, 
  Search, 
  HelpCircle, 
  Book, 
  Mail, 
  Phone, 
  ExternalLink,
  ChevronRight,
  Send,
  LifeBuoy
} from 'lucide-react'

export const Support: React.FC = () => {
  const categories = [
    { title: 'Débuter', icon: Book, count: 12, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Questions techniques', icon: HelpCircle, count: 8, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Facturation', icon: MessageSquare, count: 5, color: 'text-green-600', bg: 'bg-green-50' },
    { title: 'Compte & Sécurité', icon: LifeBuoy, count: 10, color: 'text-amber-600', bg: 'bg-amber-50' },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-500 pb-12">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-indigo-600 rounded-[2.5rem] p-12 text-white shadow-2xl shadow-indigo-600/20">
        <div className="relative z-10 text-center space-y-6 max-w-2xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-google-bold">Comment pouvons-nous vous aider ?</h1>
          <p className="text-indigo-100 text-lg">Recherchez dans notre base de connaissances ou contactez-nous directement.</p>
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 group-focus-within:text-white transition-colors" size={24} />
            <input 
              type="text" 
              placeholder="Rechercher une solution..." 
              className="w-full pl-14 pr-6 py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl outline-none focus:bg-white/20 focus:border-white/40 placeholder:text-indigo-300 text-white transition-all text-lg shadow-inner"
            />
          </div>
        </div>
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full blur-[60px] translate-y-1/2 -translate-x-1/4"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          {/* Categories Grid */}
          <section>
            <h2 className="text-2xl font-google-bold text-textcol mb-6">Parcourir par catégories</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((cat, idx) => (
                <button key={idx} className="flex items-center gap-4 p-5 bg-surface border border-border-subtle rounded-3xl hover:border-primary/30 hover:shadow-md transition-all group text-left">
                  <div className={`p-3 ${cat.bg} rounded-2xl group-hover:scale-110 transition-transform`}>
                    <cat.icon className={cat.color} size={24} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-google-bold text-textcol text-lg">{cat.title}</h3>
                    <p className="text-secondary text-sm">{cat.count} articles</p>
                  </div>
                  <ChevronRight size={20} className="text-secondary/30 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </button>
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className="bg-surface border border-border-subtle rounded-[2rem] p-10 card-shadow shadow-sm">
            <div className="flex items-center gap-4 mb-8">
              <div className="p-3 bg-primary/10 rounded-2xl">
                <Mail className="text-primary" size={28} />
              </div>
              <div>
                <h2 className="text-2xl font-google-bold text-textcol">Envoyez-nous un message</h2>
                <p className="text-secondary text-sm">Nous vous répondrons sous 24h ouvrées.</p>
              </div>
            </div>
            
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-google-bold text-secondary ml-1 uppercase tracking-wider">Sujet</label>
                  <select className="w-full px-5 py-4 bg-background border border-border-subtle rounded-2xl text-textcol outline-none focus:border-primary/50 transition-all text-sm font-medium appearance-none">
                    <option>Incident technique</option>
                    <option>Question sur une correction</option>
                    <option>Modification de compte</option>
                    <option>Autre</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-google-bold text-secondary ml-1 uppercase tracking-wider">Priorité</label>
                  <div className="flex gap-2">
                    {['Basse', 'Moyenne', 'Haute'].map((p) => (
                      <button key={p} type="button" className={`flex-1 py-4 px-2 rounded-2xl border text-xs font-google-bold transition-all ${p === 'Moyenne' ? 'bg-primary/5 border-primary/30 text-primary' : 'bg-background border-border-subtle text-secondary hover:border-border-strong'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-google-bold text-secondary ml-1 uppercase tracking-wider">Votre message</label>
                <textarea 
                  placeholder="Décrivez précisément votre demande pour une résolution rapide..." 
                  rows={6} 
                  className="w-full px-5 py-4 bg-background border border-border-subtle rounded-2xl text-textcol outline-none focus:border-primary/50 transition-all text-sm font-medium focus:ring-0"
                />
              </div>
              <button 
                type="submit" 
                className="w-full sm:w-auto px-10 py-4 bg-primary text-white rounded-2xl font-google-bold hover:brightness-110 transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/20"
              >
                <Send size={20} />
                Envoyer le ticket
              </button>
            </form>
          </section>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          {/* Quick Links */}
          <div className="bg-surface border border-border-subtle rounded-[2rem] p-8 card-shadow shadow-sm">
            <h3 className="text-xl font-google-bold text-textcol mb-6">Liens rapides</h3>
            <div className="space-y-3">
              {[
                { label: 'Documentation API', icon: ExternalLink },
                { label: 'Tutoriels vidéos', icon: ExternalLink },
                { label: 'Status du serveur', icon: ExternalLink },
                { label: 'Blog technique', icon: ExternalLink },
              ].map((link, idx) => (
                <a key={idx} href="#" className="flex items-center justify-between p-4 bg-background rounded-2xl border border-transparent hover:border-primary/20 hover:bg-primary/[0.02] transition-all group">
                  <span className="text-sm font-google-bold text-secondary group-hover:text-textcol">{link.label}</span>
                  <link.icon size={16} className="text-border-subtle group-hover:text-primary transition-colors" />
                </a>
              ))}
            </div>
          </div>

          {/* Contact Cards */}
          <div className="space-y-4">
            <div className="p-6 bg-green-500 rounded-[2rem] text-white shadow-xl shadow-green-500/10 group">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-2 bg-white/20 rounded-xl">
                  <Phone size={20} />
                </div>
                <h4 className="font-google-bold">Support direct</h4>
              </div>
              <p className="text-2xl font-google-bold mb-1">+237 6XX XXX XXX</p>
              <p className="text-xs text-green-100 font-medium">Lundi - Vendredi, 8h - 18h</p>
            </div>

            <div className="p-6 bg-surface border border-border-subtle rounded-[2rem] card-shadow shadow-sm group">
              <div className="flex items-center gap-4 mb-2">
                <div className="p-2 bg-primary/5 rounded-xl text-primary">
                  <LifeBuoy size={20} />
                </div>
                <h4 className="font-google-bold text-textcol">Assistance Premium</h4>
              </div>
              <p className="text-sm text-secondary leading-relaxed mb-4">Accédez à un support dédié 24/7 avec nos plans Entreprise.</p>
              <button className="text-sm font-google-bold text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                Voir les offres
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
