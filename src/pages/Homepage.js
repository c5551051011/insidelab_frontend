import React from 'react';
import Header from '../components/Header';
import HeroSection from '../components/HeroSection';
import ActiveRecruitmentsSection from '../components/ActiveRecruitmentsSection';
import TrustedMetricsSection from '../components/TrustedMetricsSection';
import MockInterviewSection from '../components/MockInterviewSection';
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
        {/* <ActiveRecruitmentsSection /> */}
        <MockInterviewSection />
        <TestimonialsSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
};

export default Homepage;