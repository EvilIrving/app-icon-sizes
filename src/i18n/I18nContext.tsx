import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import type { Language, TranslationKey } from './translations';
import { translations } from './translations';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

const STORAGE_KEY = 'icon-sizes-language';

function getSystemLanguage(): Language {
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language.toLowerCase();
    if (lang.startsWith('zh')) return 'zh';
  }
  return 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Language | null;
      if (stored === 'en' || stored === 'zh') return stored;
    } catch {
      // localStorage not available
    }
    return getSystemLanguage();
  });

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage not available
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[language][key] || translations.en[key] || key;
    },
    [language]
  );

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
