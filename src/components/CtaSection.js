import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';
import { colors, gradients, textStyles, spacing, sectionSpacing, borderRadius } from '../theme';

const CtaSection = () => {
  const isMobile = window.innerWidth < 768;

  return (
    <section
      style={{
        background: gradients.ctaGradient,
        padding: `${isMobile ? spacing[20] : spacing[28]} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
      }}
    >
      <div
        style={{
          maxWidth: '800px',
          margin: '0 auto',
          textAlign: 'center',
        }}
      >
        {/* CTA Content */}
        <div style={{ marginBottom: isMobile ? spacing[8] : spacing[10] }}>
          <h2
            style={{
              fontSize: isMobile ? '32px' : '48px',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontFamily: 'Inter',
              marginBottom: isMobile ? spacing[4] : spacing[5],
            }}
          >
            Ready to Start Your Graduate School Journey?
          </h2>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p
              style={{
                fontSize: isMobile ? '16px' : '18px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.5,
                fontFamily: 'Inter',
              }}
            >
              Join thousands of students who have successfully navigated their graduate school
              applications with our expert guidance and insider insights.
            </p>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: spacing[4],
            justifyContent: 'center',
            alignItems: 'center',
            marginBottom: isMobile ? spacing[6] : spacing[8],
          }}
        >
          <Link
            to="/signup"
            style={{
              ...textStyles.buttonText,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[4]} ${spacing[8]}`,
              backgroundColor: 'white',
              color: colors.primary,
              textDecoration: 'none',
              borderRadius: borderRadius.base,
              fontWeight: 600,
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            }}
          >
            Get Started Free
            <ArrowRight size={20} />
          </Link>

          <Link
            to="/demo"
            style={{
              ...textStyles.buttonText,
              display: 'flex',
              alignItems: 'center',
              gap: spacing[2],
              padding: `${spacing[4]} ${spacing[8]}`,
              backgroundColor: 'transparent',
              color: 'white',
              textDecoration: 'none',
              borderRadius: borderRadius.base,
              border: '2px solid rgba(255, 255, 255, 0.3)',
              fontWeight: 600,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
            }}
          >
            <Play size={16} />
            Watch Demo
          </Link>
        </div>

        {/* Bottom Text */}
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.8)',
            fontFamily: 'Inter',
          }}
        >
          <span>✨ No credit card required • </span>
          <span>🚀 Get started in under 2 minutes • </span>
          <span>💝 Free tools available</span>
        </div>
      </div>
    </section>
  );
};

export default CtaSection;