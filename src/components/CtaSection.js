import React from 'react';
import { Link } from 'react-router-dom';
import { colors, spacing, sectionSpacing } from '../theme';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { useTranslation } from '../i18n';

const CtaSection = () => {
  const { isMobile } = useBreakpoint();
  const { t } = useTranslation();

  return (
    <section
      style={{
        background: 'linear-gradient(135deg, #7C3AED 0%, #2563EB 100%)',
        padding: `${isMobile ? '80px' : '112px'} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
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
              fontWeight: '800',
              color: 'white',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
              fontFamily: 'Inter',
              margin: 0,
              marginBottom: isMobile ? spacing[4] : spacing[5],
            }}
          >
            {t('home.cta.title', 'Ready to Start Your Graduate School Journey?')}
          </h2>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <p
              style={{
                fontSize: isMobile ? '16px' : '18px',
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.5,
                fontFamily: 'Inter',
                margin: 0,
              }}
            >
              {t('home.cta.subtitle', 'Join thousands of students who have successfully navigated their graduate school applications with our expert guidance and insider insights.')}
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
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 32px',
              backgroundColor: 'white',
              color: colors.primary || '#2563EB',
              textDecoration: 'none',
              borderRadius: '12px',
              fontWeight: '600',
              fontSize: '16px',
              fontFamily: 'Inter',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              minWidth: isMobile ? '100%' : 'auto',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#F9F9F9';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 24px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'white';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.1)';
            }}
          >
            {t('home.cta.startButton', 'Get Started Free')}
          </Link>

          <Link
            to="/search"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '16px 32px',
              backgroundColor: 'transparent',
              color: 'white',
              textDecoration: 'none',
              borderRadius: '12px',
              border: '2px solid white',
              fontWeight: '600',
              fontSize: '16px',
              fontFamily: 'Inter',
              transition: 'all 0.2s ease',
              minWidth: isMobile ? '100%' : 'auto',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
              e.target.style.borderColor = 'white';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = 'transparent';
              e.target.style.borderColor = 'white';
            }}
          >
            {t('home.cta.browseLabs', 'Browse Labs')}
          </Link>
        </div>

        {/* Bottom Text */}
        <div
          style={{
            fontSize: '14px',
            color: 'rgba(255, 255, 255, 0.7)',
            fontFamily: 'Inter',
          }}
        >
          No credit card required · Join 15,000+ students worldwide
        </div>
      </div>
    </section>
  );
};

export default CtaSection;
