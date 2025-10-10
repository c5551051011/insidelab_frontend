import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import TrustedMetricsSection from '../components/TrustedMetricsSection';
import ServicesSection from '../components/ServicesSection';
import TestimonialsSection from '../components/TestimonialsSection';
import CtaSection from '../components/CtaSection';
import Footer from '../components/Footer';

const Homepage = () => {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Header />
      <main>
        <HeroSection />
        <TrustedMetricsSection />
        <ServicesSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;