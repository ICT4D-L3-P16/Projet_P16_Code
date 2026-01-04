import React from 'react';

export const Footer: React.FC = () => {
  const footerSections = [
    {
      title: 'PRODUCT',
      links: ['Features', 'Integrations', 'Pricing', 'Changelog']
    },
    {
      title: 'RESOURCES',
      links: ['Documentation', 'API Reference', 'Community', 'Support']
    },
    {
      title: 'LEGAL',
      links: ['Privacy Policy', 'Terms of Service', 'Security']
    }
  ];

  return (
    <footer className="bg-background border-t border-textcol/10 py-16 px-6">
      <div className="container mx-auto">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-12 mb-12">
          {/* Brand section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.86-.96-7-5.06-7-9V8.3l7-3.12 7 3.12V11c0 3.94-3.14 8.04-7 9z"/>
                </svg>
              </div>
              <span className="text-xl font-google-bold text-textcol">SAJE</span>
            </div>
            <p className="text-textcol/60 leading-relaxed max-w-sm">
              Empowering educators with AI-driven assessment tools. Grading made smart, fast, and fair.
            </p>
          </div>

          {/* Footer links */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h4 className="font-google-bold text-textcol text-sm mb-4 tracking-wide">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <a 
                      href="#" 
                      className="text-textcol/60 hover:text-primary transition-colors text-sm"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-textcol/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-textcol/60 text-sm">
            © 2025 SAJE Platform. All rights reserved.
          </p>
          
          {/* Social links */}
          <div className="flex items-center gap-4">
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-textcol/5 hover:bg-primary/10 flex items-center justify-center transition-colors group"
            >
              <svg className="w-5 h-5 text-textcol/60 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/>
              </svg>
            </a>
            <a 
              href="#" 
              className="w-10 h-10 rounded-full bg-textcol/5 hover:bg-primary/10 flex items-center justify-center transition-colors group"
            >
              <svg className="w-5 h-5 text-textcol/60 group-hover:text-primary transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
