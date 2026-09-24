'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Language, SUPPORTED_LANGUAGES, getTranslations } from '@/lib/i18n';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  supportedLanguages: typeof SUPPORTED_LANGUAGES;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  t: (key) => key,
  supportedLanguages: SUPPORTED_LANGUAGES,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('kisansetu_language') as Language | null;
    if (saved && SUPPORTED_LANGUAGES.find((l) => l.code === saved)) {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === 'kisansetu_language' && e.newValue) {
        const lang = e.newValue as Language;
        if (SUPPORTED_LANGUAGES.find((l) => l.code === lang)) {
          setLanguageState(lang);
        }
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('kisansetu_language', lang);
    document.documentElement.lang = lang;
    window.dispatchEvent(new StorageEvent('storage', { key: 'kisansetu_language', newValue: lang }));
  }, []);

  const translations = getTranslations(language);

  const translate = useCallback(
    (key: string, fallback?: string): string => {
      return translations[key] || getTranslations('en')[key] || fallback || key;
    },
    [translations]
  );

  if (!mounted) {
    // SSR-safe: render with default 'en' translations until hydrated
    const enTranslations = getTranslations('en');
    const ssrTranslate = (key: string, fallback?: string) =>
      enTranslations[key] || fallback || key;
    return (
      <LanguageContext.Provider
        value={{ language: 'en', setLanguage, t: ssrTranslate, supportedLanguages: SUPPORTED_LANGUAGES }}
      >
        {children}
      </LanguageContext.Provider>
    );
  }

  return (
    <LanguageContext.Provider
      value={{ language, setLanguage, t: translate, supportedLanguages: SUPPORTED_LANGUAGES }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
