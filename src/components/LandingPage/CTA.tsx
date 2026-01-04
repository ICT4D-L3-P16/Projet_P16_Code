import React from 'react';

interface CTAProps {
  onRequestDemo?: () => void;
  onContactSales?: () => void;
}

export const CTA: React.FC<CTAProps> = ({ onRequestDemo, onContactSales }) => {
  return (
    <section className="py-24 px-6">
      <div className="container mx-auto">
        <div className="relative bg-gradient-to-br from-primary to-secondary rounded-3xl overflow-hidden p-12 lg:p-16">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative z-10 text-center space-y-8">
            <h2 className="text-3xl lg:text-4xl xl:text-5xl font-google-bold text-white leading-tight">
              Ready to modernize your assessments?
            </h2>
            <p className="text-white/90 text-lg max-w-2xl mx-auto leading-relaxed">
              Join hundreds of forward-thinking institutions. Try SAJE free for 14 days, no credit card required.
            </p>

            <div className="flex flex-wrap justify-center gap-4 pt-4">
              <button 
                onClick={onRequestDemo}
                className="bg-white text-primary px-8 py-4 rounded-xl hover:shadow-xl transition-all hover:scale-105 font-google-bold"
              >
                Request Demo
              </button>
              <button 
                onClick={onContactSales}
                className="bg-transparent border-2 border-white text-white px-8 py-4 rounded-xl hover:bg-white/10 transition-all font-google-bold"
              >
                Contact Sales
              </button>
            </div>
          </div>

          {/* Decorative circles */}
          <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
        </div>
      </div>
    </section>
  );
};
