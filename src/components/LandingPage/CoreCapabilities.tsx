import React from 'react';

interface CapabilityCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const CapabilityCard: React.FC<CapabilityCardProps> = ({ icon, title, description }) => (
  <div className="bg-background border border-textcol/10 rounded-2xl p-8 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5 group">
    <div className="inline-flex items-center justify-center w-14 h-14 bg-primary/10 rounded-xl mb-6 group-hover:bg-primary/20 transition-colors group-hover:scale-110 transform duration-300">
      {icon}
    </div>
    <h3 className="text-xl font-google-bold text-textcol mb-3">{title}</h3>
    <p className="text-textcol/70 leading-relaxed">{description}</p>
  </div>
);

export const CoreCapabilities: React.FC = () => {
  const capabilities = [
    {
      icon: (
        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: 'Automated Correction',
      description: 'Upload scanned or paper sheets and let our AI grade exams with near-perfect accuracy, handling handwriting and multiple-choice questions with ease.'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-primary" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: 'Cheat Detection AI',
      description: 'Advanced proactive AI-detection that scans answers carefully and assigns suspicion to assign confidence to less authentic answers.'
    },
    {
      icon: (
        <svg className="w-7 h-7 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: 'Pedagogical Tracking',
      description: 'Go beyond grades. Get realtime insights to identify strengths, weaknesses across difficult topics and improve individual student progress.'
    }
  ];

  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl lg:text-5xl font-google-bold text-textcol">
            Core Capabilities
          </h2>
          <p className="text-textcol/60 max-w-2xl mx-auto leading-relaxed">
            Experience the future of educational assessment. Our AI-driven tools handle the heavy lifting so you can focus on teaching.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {capabilities.map((capability, index) => (
            <CapabilityCard key={index} {...capability} />
          ))}
        </div>
      </div>
    </section>
  );
};
