import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, FileText, Video } from 'lucide-react';
import { colors, gradients, textStyles, spacing, sectionSpacing } from '../theme';

const HeroSection = () => {
  const [searchValue, setSearchValue] = useState('');
  const [overlayOpen, setOverlayOpen] = useState(false);

  const isMobile = window.innerWidth < 768;

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search:', searchValue);
  };

  return (
    <section
      style={{
        height: '90vh',
        minHeight: '300px',
        backgroundImage: `${gradients.heroOverlay}, url('/assets/images/hero_background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          width: '100%',
          padding: `${isMobile ? sectionSpacing.mobile.large : sectionSpacing.desktop.large} ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '600px',
        }}
      >
        {/* Hero Content */}
        <div
          style={{
            maxWidth: '920px',
            textAlign: 'center',
            marginBottom: isMobile ? spacing[8] : spacing[10],
          }}
        >
          {/* Main Headline */}
          <h1
            style={{
              ...textStyles[isMobile ? 'heroTitleMobile' : 'heroTitle'],
              color: colors.heroText,
              marginBottom: isMobile ? spacing[4] : spacing[6],
            }}
          >
            Your Gateway to Graduate School Success
          </h1>

          {/* Subheading */}
          <p
            style={{
              ...textStyles[isMobile ? 'heroSubtitleMobile' : 'heroSubtitle'],
              color: colors.heroSubtext,
              maxWidth: '760px',
              margin: '0 auto',
            }}
          >
            Search labs with detailed ratings, read honest reviews from current grad students,
            and find the perfect research environment for your goals.
          </p>
        </div>

        {/* Search Section */}
        <div
          style={{
            width: '100%',
            maxWidth: '600px',
            marginBottom: !overlayOpen ? (isMobile ? spacing[6] : spacing[8]) : spacing[4],
          }}
        >
          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ position: 'relative' }}>
            <Search
              size={20}
              style={{
                position: 'absolute',
                left: spacing[4],
                top: '50%',
                transform: 'translateY(-50%)',
                color: colors.textTertiary,
                zIndex: 1,
              }}
            />
            <input
              type="text"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onFocus={() => setOverlayOpen(true)}
              onBlur={() => setOverlayOpen(false)}
              placeholder="Search by university, professor, lab name, or research area"
              style={{
                width: '100%',
                padding: `${spacing[4]} ${spacing[4]} ${spacing[4]} ${spacing[12]}`,
                fontSize: isMobile ? '16px' : '18px',
                border: 'none',
                borderRadius: '12px',
                outline: 'none',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                transition: 'all 0.2s ease',
              }}
            />
          </form>

          {/* Help Guide */}
          {!overlayOpen && (
            <p
              style={{
                textAlign: 'center',
                marginTop: isMobile ? spacing[2] : spacing[4],
                fontSize: isMobile ? '14px' : '16px',
                color: `${colors.heroSubtext}CC`, // 80% opacity
                maxWidth: '500px',
                margin: `${isMobile ? spacing[2] : spacing[4]} auto 0`,
              }}
            >
              Search by university, professor, lab name, or research area
            </p>
          )}
        </div>

        {/* Action Buttons */}
        {!overlayOpen && (
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? spacing[3] : spacing[4],
              alignItems: 'center',
            }}
          >
            <Link
              to="/write-review"
              style={{
                ...textStyles.buttonText,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[4]} ${spacing[8]}`,
                backgroundColor: colors.primary,
                color: colors.buttonText,
                textDecoration: 'none',
                borderRadius: '8px',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = colors.primaryHover;
                e.target.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = colors.primary;
                e.target.style.transform = 'translateY(0)';
              }}
            >
              <FileText size={20} />
              Write Review
            </Link>

            <Link
              to="/services/mock-interview"
              style={{
                ...textStyles.buttonText,
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[4]} ${spacing[8]}`,
                backgroundColor: 'transparent',
                color: colors.heroText,
                textDecoration: 'none',
                borderRadius: '8px',
                border: `2px solid ${colors.heroText}`,
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.08)';
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = 'transparent';
              }}
            >
              <Video size={20} />
              Book Mock Interview
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default HeroSection;