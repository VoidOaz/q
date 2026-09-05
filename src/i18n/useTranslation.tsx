import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations, TranslationDictionary } from './translations.ts';

interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: TranslationDictionary;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('flux_language');
      if (saved === 'en' || saved === 'tr') return saved;
      // Default to browser language or EN
      const navLang = navigator.language.slice(0, 2);
      return navLang === 'tr' ? 'tr' : 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('flux_language', lang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value: TranslationContextType = {
    language,
    setLanguage,
    t: translations[language],
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

export function useTranslation(): TranslationContextType {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}
