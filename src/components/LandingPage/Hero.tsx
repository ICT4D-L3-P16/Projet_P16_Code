import React from 'react';

interface HeroProps {
  onStartFreeTrial?: () => void;
  onWatchVideo?: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onStartFreeTrial, onWatchVideo }) => {
  return (
    <section className="relative pt-32 pb-20 px-6 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="inline-block">
              <span className="text-sm text-textcol/60 tracking-wide uppercase">
                ✨ NEW AI ENGINE V2.0 LIVE
              </span>
            </div>

            <h1 className="text-5xl lg:text-6xl xl:text-5.5xl font-google-bold leading-tight">
              <span className="text-textcol">Automatiser</span>
              <br />
              <span className="text-textcol">Vos Evaluations.</span>
              <br />
              <span className="text-primary">Renforcer</span>
              <br />
              <span className="text-primary">L'Education.</span>
            </h1>

            <p className="text-lg text-textcol/70 max-w-lg leading-relaxed">
              La plateforme de notation intelligente qui simplifie l'ensemble du cycle d'examen pour les enseignants et les Institutions, de la création à la correction, avec une précision de 99.9% propulsée par l'IA.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap gap-4">
              <button 
                onClick={onStartFreeTrial}
                className="bg-primary text-white px-8 py-4 rounded-xl hover:opacity-90 transition-all hover:scale-105 font-google-bold flex items-center gap-2 shadow-lg shadow-primary/20"
              >
                Commencer l'essai gratuit
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
              
              <button 
                onClick={onWatchVideo}
                className="bg-background border-2 border-textcol/10 text-textcol px-8 py-4 rounded-xl hover:border-primary/30 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Voir un tutoriel
              </button>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center gap-4 pt-6">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div 
                    key={i}
                    className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background"
                  />
                ))}
              </div>
              <p className="text-sm text-textcol/60">
                +500 Institutions Nous font confiance
              </p>
            </div>
          </div>

          {/* Right Content - Dashboard Preview */}
          <div className="relative">
            <div className="relative bg-background border border-textcol/10 rounded-2xl overflow-hidden shadow-2xl shadow-primary/10">
              {/* Mock Dashboard */}
              <div className="aspect-[4/3] bg-gradient-to-br from-primary/5 to-secondary/5 p-6">
                <div className="bg-background/80 backdrop-blur-sm rounded-xl p-4 space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="h-3 bg-textcol/20 rounded w-32" />
                    <div className="h-3 bg-textcol/20 rounded w-20" />
                  </div>
                  
                  {/* Chart Area */}
                  <div className="h-40 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-end gap-2 p-4">
                    {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                      <div 
                        key={i}
                        className="flex-1 bg-primary rounded-t"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                  
                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="h-2 bg-textcol/20 rounded w-24" />
                      <div className="h-4 bg-textcol/20 rounded w-16" />
                    </div>
                    <div className="space-y-2">
                      <div className="h-2 bg-textcol/20 rounded w-24" />
                      <div className="h-4 bg-textcol/20 rounded w-16" />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="absolute top-8 right-8 bg-background border border-textcol/10 rounded-xl px-4 py-3 shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs text-textcol/60">Examen #502 terminé</p>
                    <p className="text-sm font-google-bold text-textcol">1,247 copies corrigées en 2m</p>
                  </div>
                </div>
              </div>
              
              {/* Accuracy Badge */}
              <div className="absolute bottom-8 left-8 bg-background border border-textcol/10 rounded-xl px-4 py-3 shadow-lg">
                <div className="text-center">
                  <p className="text-2xl font-google-bold text-primary">99.9%</p>
                  <p className="text-xs text-textcol/60">De Précision</p>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl opacity-20 blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-gradient-to-br from-secondary to-accent rounded-2xl opacity-20 blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
