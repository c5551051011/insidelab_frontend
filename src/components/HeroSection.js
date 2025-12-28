import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { colors, gradients, spacing, sectionSpacing, textStyles } from '../theme';
import { useBreakpoint } from '../hooks/useBreakpoint';
import { buildLocalizedPath, isKoreanPath } from '../utils/locale';

const HeroSection = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isKorean = isKoreanPath(location.pathname);
  const currentLang = isKorean ? 'ko' : 'en';
  const [searchValue, setSearchValue] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { isMobile } = useBreakpoint();
  const { t, i18n } = useTranslation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchValue.trim()) {
      const target = buildLocalizedPath(`/search?q=${encodeURIComponent(searchValue.trim())}`, currentLang);
      navigate(target);
    }
  };

  if (i18n.language !== currentLang) {
    i18n.changeLanguage(currentLang);
  }

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
              marginBottom: isMobile ? spacing[6] : spacing[10],
              width: '100%',
            }}
          >
            <h1
              style={{
                ...(isMobile ? textStyles.heroTitleMobile : textStyles.heroTitle),
                color: colors.heroText,
                marginBottom: isMobile ? spacing[3] : spacing[6],
                textAlign: 'center',
                overflow: 'visible',
                padding: isMobile ? '0 16px' : '0',
              }}
            >
              {t('hero.title', 'Your Gateway to Graduate School Success')}
            </h1>

            <p
              style={{
                ...(isMobile ? textStyles.heroSubtitleMobile : textStyles.heroSubtitle),
                color: colors.heroSubtext,
                maxWidth: isMobile ? '100%' : '760px',
                margin: '0 auto',
                padding: isMobile ? '0 16px' : '0',
              }}
            >
              {t('hero.subtitle', 'Search labs with detailed ratings, read honest reviews from current grad students, and find the perfect research environment for your goals.')}
            </p>
          </div>

          {/* Search Container - Fixed height */}
          <div
            style={{
              width: '100%',
              maxWidth: isMobile ? '90%' : '600px',
              height: isMobile ? '48px' : '60px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              marginBottom: isMobile ? spacing[6] : spacing[10],
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
                size={isMobile ? 18 : 20}
                style={{
                  position: 'absolute',
                  left: isMobile ? spacing[3] : spacing[4],
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
                placeholder={isMobile ? t('hero.placeholderMobile', 'Search labs, professors...') : t('hero.placeholderDesktop', 'Search by university, professor, lab name, or research area')}
                style={{
                  width: '100%',
                  height: isMobile ? '48px' : '60px',
                  padding: isMobile ? `0 ${spacing[3]} 0 ${spacing[10]}` : `0 ${spacing[4]} 0 ${spacing[12]}`,
                  ...(isMobile ? textStyles.inputTextMobile : textStyles.inputText),
                  border: 'none',
                  borderRadius: isMobile ? '10px' : '12px',
                  outline: 'none',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(10px)',
                  boxShadow: searchFocused
                    ? '0 12px 40px rgba(0, 0, 0, 0.15)'
                    : '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'box-shadow 0.2s ease',
                }}
              />
            </form>

          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
