'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from './translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('language');
      if (savedLang && Object.keys(translations).includes(savedLang)) {
        setLanguage(savedLang as Language);
      }
    } catch (error) {
      console.warn('Failed to load language preference:', error);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    try {
      setLanguage(lang);
      localStorage.setItem('language', lang);
      document.documentElement.lang = lang;
    } catch (error) {
      console.warn('Failed to save language preference:', error);
    }
  };

  const t = (key: TranslationKey): string => {
    try {
      return translations[language]?.[key] ?? translations.en[key] ?? key;
    } catch (error) {
      console.warn('Translation error:', error);
      return key;
    }
  };

  const value = React.useMemo(
    () => ({
      language,
      setLanguage: handleSetLanguage,
      t,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 