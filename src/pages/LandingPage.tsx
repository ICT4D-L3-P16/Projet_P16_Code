import React from 'react';
import { Header } from '../components/LandingPage/Header';
import { Hero } from '../components/LandingPage/Hero';
import { Stats } from '../components/LandingPage/Stats';
import { CoreCapabilities } from '../components/LandingPage/CoreCapabilities';
import { Workflow } from '../components/LandingPage/Workflow';
import { Testimonial } from '../components/LandingPage/Testimonial';
import { CTA } from '../components/LandingPage/CTA';
import { Footer } from '../components/LandingPage/Footer';
import { ThemeToggle } from '../components/LandingPage/ThemeToggle';

const LandingPage: React.FC = () => {
  // Handlers for CTA buttons
  const handleRequestDemo = () => {
    console.log('Request Demo clicked');
    // Add your demo request logic here
  };

  const handleContactSales = () => {
    console.log('Contact Sales clicked');
    // Add your contact sales logic here
  };

  const handleStartFreeTrial = () => {
    console.log('Start Free Trial clicked');
    // Add your free trial logic here
  };

  const handleWatchVideo = () => {
    console.log('Watch Video clicked');
    // Add your video modal logic here
  };

  return (
    <div className="min-h-screen bg-background">
      <Header onRequestDemo={handleRequestDemo} />
      
      <main>
        <Hero 
          onStartFreeTrial={handleStartFreeTrial}
          onWatchVideo={handleWatchVideo}
        />
        
        <Stats />
        
        <CoreCapabilities />
        
        <Workflow />
        
        <Testimonial />
        
        <CTA 
          onRequestDemo={handleRequestDemo}
          onContactSales={handleContactSales}
        />
      </main>
      
      <Footer />
      
      {/* Theme Toggle Button */}
      <ThemeToggle />
    </div>
  );
};

export default LandingPage;
