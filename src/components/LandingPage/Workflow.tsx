import React from 'react';

interface WorkflowStepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const WorkflowStep: React.FC<WorkflowStepProps> = ({ number, title, description, icon }) => (
  <div className="flex gap-6 items-start group">
    <div className="flex-shrink-0 w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white font-google-bold group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <div className="flex-1">
      <h3 className="text-xl font-google-bold text-textcol mb-2">{title}</h3>
      <p className="text-textcol/70 leading-relaxed">{description}</p>
    </div>
  </div>
);

export const Workflow: React.FC = () => {
  const steps = [
    {
      number: 1,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/>
        </svg>
      ),
      title: '1. Create Exam',
      description: 'Build exams using our drag-and-drop builder or import from Word/PDF. AI suggests questions based on your curriculum.'
    },
    {
      number: 2,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      title: '2. Students Take Assessment',
      description: 'Seamlessly take exams online, with secure browser lockdown or offline on paper (which you scan easily).'
    },
    {
      number: 3,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      title: '3. AI-Powered Correction',
      description: 'Upload scans or submit online. Our engine grades instantly, detects ambiguity, cross AI-dedicated "return instant" grading.'
    },
    {
      number: 4,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      title: '4. Pedagogical Analytics',
      description: 'Export reports, generate for students, teachers, and parents. Sight trends and intervene early.'
    }
  ];

  return (
    <section className="py-24 px-6 bg-gradient-to-b from-background to-primary/5" id="workflow">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left side - Illustration */}
          <div className="relative order-2 lg:order-1">
            <div className="relative bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl p-8 overflow-hidden">
              {/* Illustration of person with laptop */}
              <div className="relative z-10 flex items-center justify-center py-12">
                <div className="w-64 h-64 bg-primary/20 rounded-full flex items-center justify-center">
                  <svg className="w-32 h-32 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              
              {/* Decorative circles */}
              <div className="absolute top-8 right-8 w-16 h-16 bg-secondary/20 rounded-full blur-xl" />
              <div className="absolute bottom-8 left-8 w-24 h-24 bg-primary/20 rounded-full blur-xl" />
            </div>
          </div>

          {/* Right side - Steps */}
          <div className="space-y-8 order-1 lg:order-2">
            <div className="space-y-4">
              <h2 className="text-4xl lg:text-5xl font-google-bold text-textcol">
                Streamlined Workflow
              </h2>
              <p className="text-textcol/60 leading-relaxed">
                From the moment you scan a question to the final report card, SAJE simplifies every step. Our intuitive interface requires zero training.
              </p>
            </div>

            <div className="space-y-8">
              {steps.map((step, index) => (
                <WorkflowStep key={index} {...step} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
