import React from 'react';

export const Testimonial: React.FC = () => {
  return (
    <section className="py-24 px-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />
      
      <div className="container mx-auto relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Quote icon */}
          <div className="flex justify-center mb-8">
            <svg className="w-16 h-16 text-primary/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/>
            </svg>
          </div>

          {/* Testimonial text */}
          <blockquote className="text-center space-y-8">
            <p className="text-2xl lg:text-3xl font-google-bold text-textcol leading-relaxed">
              "SAJE transformed how we handle mid-terms. What used to take our faculty two weeks of grading now happens in an afternoon. It's magic."
            </p>

            {/* Author info */}
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white text-2xl font-google-bold">
                SJ
              </div>
              <div>
                <p className="font-google-bold text-textcol">Sarah Jenkins</p>
                <p className="text-textcol/60 text-sm">Principal, Westridge High School</p>
              </div>
            </div>
          </blockquote>
        </div>
      </div>
    </section>
  );
};
