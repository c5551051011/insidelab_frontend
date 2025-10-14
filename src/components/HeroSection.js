import React, { useState } from 'react';
import { Search, FileText, Video } from 'lucide-react';
import { PrimaryButton, SecondaryButton } from './Button';
import { colors, gradients, spacing, sectionSpacing } from '../theme';

const HeroSection = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const isMobile = window.innerWidth < 768;

  const handleSearch = (e) => {
    e.preventDefault();
    // TODO: Implement search functionality
    console.log('Search:', searchValue);
  };

  return (
    <section
      style={{
        minHeight: '100vh',
        height: '100vh',
        backgroundImage: `${gradients.heroOverlay}, url('/assets/images/hero_background.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Fixed Container - Prevents layout shifts */}
      <div
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: `0 ${sectionSpacing.horizontal[isMobile ? 'mobile' : 'desktop']}`,
          position: 'relative',
        }}
      >
        {/* Content Container - Fixed positioning */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: '920px',
            textAlign: 'center',
            position: 'relative',
            zIndex: 1,
          }}
        >
          {/* Hero Title - Fixed space */}
          <div
            style={{
              marginBottom: isMobile ? spacing[8] : spacing[10],
              width: '100%',
            }}
          >
            <h1
              style={{
                fontSize: isMobile ? '28px' : '56px',
                fontWeight: '800',
                color: colors.heroText,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                fontFamily: 'Inter',
                marginBottom: isMobile ? spacing[4] : spacing[6],
                textAlign: 'center',
                overflow: 'visible',
              }}
            >
              Your Gateway to Graduate School Success
            </h1>

            <p
              style={{
                fontSize: isMobile ? '14px' : '20px',
                color: colors.heroSubtext,
                lineHeight: 1.5,
                fontFamily: 'Inter',
                maxWidth: '760px',
                margin: '0 auto',
              }}
            >
              Search labs with detailed ratings, read honest reviews from current grad students,
              and find the perfect research environment for your goals.
            </p>
          </div>

          {/* Search Container - Fixed height */}
          <div
            style={{
              width: '100%',
              maxWidth: '600px',
              height: '60px', // Reduced height since help text is removed
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginBottom: isMobile ? spacing[8] : spacing[10],
            }}
          >
            {/* Search Form */}
            <form
              onSubmit={handleSearch}
              style={{
                position: 'relative',
                width: '100%',
                marginBottom: spacing[4],
              }}
            >
              <Search
                size={20}
                style={{
                  position: 'absolute',
                  left: spacing[4],
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: colors.textTertiary,
                  zIndex: 2,
                }}
              />
              <input
                type="text"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                placeholder="Search by university, professor, lab name, or research area"
                style={{
                  width: '100%',
                  height: '60px', // Fixed height
                  padding: `0 ${spacing[4]} 0 ${spacing[12]}`,
                  fontSize: isMobile ? '14px' : '18px',
                  border: 'none',
                  borderRadius: '12px',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: searchFocused
                    ? '0 12px 40px rgba(0, 0, 0, 0.15)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'box-shadow 0.2s ease',
                  fontFamily: 'Inter',
                }}
              />
            </form>

          </div>

          {/* Action Buttons - Fixed positioning */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? spacing[4] : spacing[6],
              alignItems: 'center',
              justifyContent: 'center',
              width: '100%',
              maxWidth: '500px',
              position: 'relative',
              opacity: 1,
              transition: 'none',
            }}
          >
            <PrimaryButton
              to="/write-review"
              icon={FileText}
              size="small"
              variant="outline"
            >
              Write Review
            </PrimaryButton>

            <SecondaryButton
              to="/services/mock-interview"
              icon={Video}
              size="small"
              variant="outline"
            >
              Book Mock Interview
            </SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;