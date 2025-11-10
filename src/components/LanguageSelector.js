import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { colors, spacing } from '../theme';
import { useLanguage, LANGUAGES } from '../i18n';

const LanguageSelector = ({ compact = false }) => {
  const { currentLanguage, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = LANGUAGES[currentLanguage];

  if (compact) {
    // Compact version for mobile menu
    return (
      <div style={{ position: 'relative' }} ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: spacing[2],
            padding: `${spacing[2]} ${spacing[3]}`,
            backgroundColor: 'transparent',
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontFamily: 'Inter',
            color: colors.textPrimary,
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = colors.backgroundLight;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = 'transparent';
          }}
        >
          <Globe size={16} />
          <span>{currentLang.nativeName}</span>
          <ChevronDown size={14} style={{
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} />
        </button>

        {isOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            marginTop: spacing[1],
            backgroundColor: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            zIndex: 1000,
            minWidth: '140px',
            overflow: 'hidden'
          }}>
            {Object.values(LANGUAGES).map((lang) => (
              <button
                key={lang.code}
                onClick={() => handleLanguageChange(lang.code)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing[2],
                  padding: `${spacing[2]} ${spacing[3]}`,
                  backgroundColor: currentLanguage === lang.code ? `${colors.primary}10` : 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'Inter',
                  color: currentLanguage === lang.code ? colors.primary : colors.textPrimary,
                  textAlign: 'left',
                  transition: 'background-color 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (currentLanguage !== lang.code) {
                    e.target.style.backgroundColor = colors.backgroundLight;
                  }
                }}
                onMouseLeave={(e) => {
                  if (currentLanguage !== lang.code) {
                    e.target.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <span>{lang.nativeName}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop version
  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: spacing[2],
          padding: `${spacing[2]} ${spacing[3]}`,
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontSize: '14px',
          fontFamily: 'Inter',
          color: colors.textSecondary,
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={(e) => {
          e.target.style.backgroundColor = colors.backgroundLight;
          e.target.style.color = colors.primary;
        }}
        onMouseLeave={(e) => {
          e.target.style.backgroundColor = 'transparent';
          e.target.style.color = colors.textSecondary;
        }}
      >
        <Globe size={16} />
        <span>{currentLang.nativeName}</span>
        <ChevronDown size={12} style={{
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          transition: 'transform 0.2s ease'
        }} />
      </button>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: spacing[1],
          backgroundColor: colors.background,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          zIndex: 1000,
          minWidth: '140px',
          overflow: 'hidden'
        }}>
          {Object.values(LANGUAGES).map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageChange(lang.code)}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: spacing[2],
                padding: `${spacing[2]} ${spacing[3]}`,
                backgroundColor: currentLanguage === lang.code ? `${colors.primary}10` : 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'Inter',
                color: currentLanguage === lang.code ? colors.primary : colors.textPrimary,
                textAlign: 'left',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (currentLanguage !== lang.code) {
                  e.target.style.backgroundColor = colors.backgroundLight;
                }
              }}
              onMouseLeave={(e) => {
                if (currentLanguage !== lang.code) {
                  e.target.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span>{lang.nativeName}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;