import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, Clock, Users, Award, Play } from 'lucide-react';
import { colors, shadows, spacing, sectionSpacing, borderRadius, textStyles } from '../theme';
import { useBreakpoint } from '../hooks/useBreakpoint';

const MockInterviewSection = () => {
  const navigate = useNavigate();
  const { isMobile, isTablet } = useBreakpoint();

  const handleBookInterview = () => {
    navigate('/services/mock-interview');
  };


  const benefits = [
    {
      icon: Video,
      title: 'AI-Powered Interview Simulation',
      description: 'Practice with our advanced AI that simulates real PhD admission interviews'
    },
    {
      icon: Clock,
      title: 'Flexible Scheduling',
      description: 'Book sessions anytime that fits your schedule, available 24/7'
    },
    {
      icon: Users,
      title: 'Field-Specific Questions',
      description: 'Customized questions based on your research area and target programs'
    },
    {
      icon: Award,
      title: 'Expert Feedback',
      description: 'Detailed analysis and improvement suggestions from experienced reviewers'
    }
  ];



  return (
    <section
      style={{
        background: 'linear-gradient(180deg, #fafbff 0%, #f0f6ff 50%, #e6f3ff 100%)',
        padding: `${sectionSpacing[isMobile ? 'mobile' : 'desktop'].medium} 0`,
        position: 'relative',
      }}
    >
      {/* Decorative background elements */}
      <div
        style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'rgba(37, 99, 235, 0.05)',
          filter: 'blur(40px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '15%',
          left: '8%',
          width: '100px',
          height: '100px',
          borderRadius: '50%',
          background: 'rgba(124, 58, 237, 0.08)',
          filter: 'blur(30px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: `0 ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: spacing[10],
            position: 'relative',
          }}
        >

          <h2
            style={{
              ...(isMobile ? textStyles.sectionTitleMobile : textStyles.sectionTitle),
              color: colors.textPrimary,
              lineHeight: 1.2,
              marginBottom: spacing[6],
            }}
          >
            Ace Your PhD Interview<br />
            with AI-Powered Practice
          </h2>

          <p
            style={{
              ...(isMobile ? textStyles.bodyMedium : textStyles.heroSubtitle),
              color: colors.textSecondary,
              lineHeight: 1.6,
              maxWidth: '680px',
              margin: '0 auto',
              marginBottom: spacing[10],
            }}
          >
            Get personalized mock interview sessions tailored to your field and target programs.
            Build confidence with realistic practice and expert feedback.
          </p>

          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: spacing[4], justifyContent: 'center', alignItems: 'center' }}>
            <button
              onClick={handleBookInterview}
              style={{
                padding: `${spacing[3]} ${spacing[6]}`,
                backgroundColor: colors.primary,
                border: 'none',
                borderRadius: '8px',
                color: 'white',
                ...textStyles.buttonText,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[2],
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 24px rgba(59, 130, 246, 0.3)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Book Mock Interview
            </button>
            <button
              style={{
                padding: `calc(${spacing[3]} - 2px) calc(${spacing[6]} - 2px)`,
                backgroundColor: 'transparent',
                border: `2px solid ${colors.primary}`,
                borderRadius: '8px',
                color: colors.primary,
                ...textStyles.buttonText,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: spacing[2],
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
                e.target.style.color = colors.primary;
              }}
            >
              <Play size={16} />
              Watch Demo
            </button>
          </div>
        </div>


        {/* Benefits */}
        <div style={{ marginBottom: spacing[16] }}>
          <h3
            style={{
              ...(isMobile ? textStyles.sectionTitleMobile : textStyles.sectionTitle),
              color: colors.textPrimary,
              textAlign: 'center',
              marginBottom: spacing[10],
            }}
          >
            Why Choose Our Mock Interviews?
          </h3>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: spacing[6],
            }}
          >
            {benefits.map((benefit, index) => {
              const IconComponent = benefit.icon;
              return (
                <div
                  key={index}
                  style={{
                    padding: spacing[6],
                    backgroundColor: colors.surface,
                    borderRadius: borderRadius.md,
                    boxShadow: shadows.cardShadowNarrow,
                    textAlign: 'center',
                    transition: 'transform 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div
                    style={{
                      width: '60px',
                      height: '60px',
                      backgroundColor: colors.primary + '10',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto',
                      marginBottom: spacing[4],
                    }}
                  >
                    <IconComponent size={24} color={colors.primary} />
                  </div>
                  <h4
                    style={{
                      ...textStyles.cardTitle,
                      color: colors.textPrimary,
                      marginBottom: spacing[3],
                    }}
                  >
                    {benefit.title}
                  </h4>
                  <p
                    style={{
                      ...textStyles.cardDescription,
                      color: colors.textSecondary,
                    }}
                  >
                    {benefit.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};

export default MockInterviewSection;