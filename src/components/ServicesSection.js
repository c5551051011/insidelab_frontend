import React from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Video, Check } from 'lucide-react';
import { colors, shadows, textStyles, spacing, sectionSpacing, borderRadius } from '../theme';

const ServicesSection = () => {
  const screenWidth = window.innerWidth;
  const isMobile = screenWidth < 768;
  const isTablet = screenWidth >= 768 && screenWidth < 1024;

  const services = [
    {
      emoji: '🔍',
      title: 'Search Lab Reviews',
      description: 'Discover authentic reviews from current and former graduate students about research labs, professors, and programs.',
      features: [
        'Filter by university, department, or research area',
        'Read detailed anonymous reviews',
        'Compare lab ratings and metrics',
        'Save labs to your watchlist',
      ],
      buttonText: 'Explore Reviews',
      imagePath: '/assets/images/review_image.png',
      route: '/search',
      icon: Search,
    },
    {
      emoji: '📄',
      title: 'CV & Resume Feedback',
      description: 'Get professional feedback on your academic CV and resume from experienced graduate students and industry professionals.',
      features: [
        'AI-powered initial screening',
        'Human expert review and comments',
        'Field-specific formatting guidelines',
        'Before/after improvement tracking',
      ],
      buttonText: 'Upload Document',
      imagePath: '/assets/images/resume_image.png',
      route: '/services/cv-review',
      icon: FileText,
    },
    {
      emoji: '🎤',
      title: 'Mock Interview Sessions',
      description: 'Practice PhD admissions and job interviews with personalized mock sessions tailored to your field and target programs.',
      features: [
        'AI-powered interview simulation',
        'Field-specific question databases',
        'Real-time feedback and scoring',
        'Video analysis and improvement tips',
      ],
      buttonText: 'Start Practice',
      imagePath: '/assets/images/interview_image.png',
      route: '/services/mock-interview',
      icon: Video,
    },
  ];

  const renderServices = () => {
    if (isMobile) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      );
    } else if (isTablet) {
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: spacing[6] }}>
          <div style={{ display: 'flex', gap: spacing[6] }}>
            <div style={{ flex: 1 }}>
              <ServiceCard service={services[0]} />
            </div>
            <div style={{ flex: 1 }}>
              <ServiceCard service={services[1]} />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ maxWidth: '400px', width: '100%' }}>
              <ServiceCard service={services[2]} />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: spacing[6] }}>
          {services.map((service, index) => (
            <ServiceCard key={index} service={service} />
          ))}
        </div>
      );
    }
  };

  return (
    <section
      style={{
        backgroundColor: colors.background,
        padding: `${sectionSpacing[isMobile ? 'mobile' : 'desktop'].medium} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
        }}
      >
        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: isMobile ? spacing[10] : spacing[16] }}>
          <h2
            style={{
              ...textStyles[isMobile ? 'sectionTitleMobile' : 'sectionTitle'],
              color: colors.textPrimary,
            }}
          >
            Everything You Need for Graduate School Success
          </h2>
        </div>

        {/* Service Cards */}
        {renderServices()}
      </div>
    </section>
  );
};

const ServiceCard = ({ service }) => {
  const { emoji, title, description, features, buttonText, imagePath, route, icon: Icon } = service;

  return (
    <Link
      to={route}
      style={{
        textDecoration: 'none',
        color: 'inherit',
        display: 'block',
        height: '100%',
      }}
    >
      <div
        style={{
          backgroundColor: colors.surface,
          borderRadius: borderRadius.md,
          boxShadow: shadows.cardShadowNarrow,
          overflow: 'hidden',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'all 0.2s ease',
          cursor: 'pointer',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = shadows.cardShadowHover;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = shadows.cardShadowNarrow;
        }}
      >
        {/* Image Thumbnail */}
        <div
          style={{
            height: '208px',
            width: '100%',
            backgroundColor: '#f3f4f6',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <img
            src={imagePath}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            onError={(e) => {
              // Fallback placeholder with icon
              e.target.style.display = 'none';
              e.target.parentNode.innerHTML = `
                <div style="
                  width: 100%;
                  height: 100%;
                  background-color: rgba(37, 99, 235, 0.1);
                  display: flex;
                  flex-direction: column;
                  align-items: center;
                  justify-content: center;
                  color: ${colors.primary};
                ">
                  <div style="font-size: 48px; margin-bottom: 8px;">${emoji}</div>
                  <div style="font-size: 14px; font-weight: 600; text-align: center;">${title}</div>
                </div>
              `;
            }}
          />
        </div>

        {/* Card Content */}
        <div
          style={{
            padding: spacing[5],
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {/* Title with Emoji */}
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: spacing[3] }}>
              <span style={{ fontSize: '20px', marginRight: spacing[2] }}>{emoji}</span>
              <h3
                style={{
                  ...textStyles.cardTitle,
                  color: colors.textPrimary,
                  flex: 1,
                }}
              >
                {title}
              </h3>
            </div>

            {/* Description */}
            <p
              style={{
                ...textStyles.cardDescription,
                color: colors.textSecondary,
                marginBottom: spacing[4],
                lineHeight: 1.5,
              }}
            >
              {description}
            </p>

            {/* Features */}
            <div style={{ marginBottom: spacing[5] }}>
              {features.map((feature, index) => (
                <div
                  key={index}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    marginBottom: spacing[2],
                  }}
                >
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      backgroundColor: colors.success,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginRight: spacing[2],
                      marginTop: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <Check size={10} color="white" />
                  </div>
                  <span
                    style={{
                      fontSize: '14px',
                      color: colors.textSecondary,
                      lineHeight: 1.4,
                    }}
                  >
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Button */}
          <button
            style={{
              ...textStyles.buttonTextSmall,
              width: '100%',
              padding: `${spacing[3]} ${spacing[4]}`,
              backgroundColor: colors.primary,
              color: colors.buttonText,
              border: 'none',
              borderRadius: borderRadius.base,
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = colors.primaryHover;
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = colors.primary;
            }}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </Link>
  );
};

export default ServicesSection;