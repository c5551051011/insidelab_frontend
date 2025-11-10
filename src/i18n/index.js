// Internationalization system
import { useState, useEffect, createContext, useContext } from 'react';

// Language context
const LanguageContext = createContext();

// Available languages
export const LANGUAGES = {
  en: { code: 'en', name: 'English', nativeName: 'English' },
  ko: { code: 'ko', name: 'Korean', nativeName: '한국어' },
  fr: { code: 'fr', name: 'French', nativeName: 'Français' },
  zh: { code: 'zh', name: 'Chinese', nativeName: '中文' }
};

// Default language
const DEFAULT_LANGUAGE = 'en';

// Get saved language or default
const getSavedLanguage = () => {
  try {
    return localStorage.getItem('language') || DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

// Language Provider Component
export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(getSavedLanguage);

  const changeLanguage = (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
      try {
        localStorage.setItem('language', languageCode);
      } catch (error) {
        console.warn('Could not save language preference:', error);
      }
    }
  };

  useEffect(() => {
    // Set document language attribute
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      changeLanguage,
      languages: LANGUAGES
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Translation function
export const useTranslation = () => {
  const { currentLanguage } = useLanguage();

  const t = (key, defaultValue = key) => {
    try {
      // Import translations dynamically
      const translations = require(`./translations/${currentLanguage}.json`);

      // Support nested keys like 'common.buttons.submit'
      const keys = key.split('.');
      let value = translations;

      for (const k of keys) {
        value = value?.[k];
      }

      return value || defaultValue;
    } catch (error) {
      console.warn(`Translation not found for key: ${key} in language: ${currentLanguage}`);
      return defaultValue;
    }
  };

  return { t, currentLanguage };
};