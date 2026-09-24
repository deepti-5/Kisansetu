'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Globe, Check, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

const GREETINGS: Record<string, string> = {
  en: 'Language saved! The platform is now set to English.',
  hi: 'भाषा सहेजी गई! प्लेटफ़ॉर्म अब हिंदी में सेट है।',
  mr: 'भाषा जतन केली! प्लॅटफॉर्म आता मराठीत सेट आहे.',
  kn: 'ಭಾಷೆ ಉಳಿಸಲಾಗಿದೆ! ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಈಗ ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ.',
};

export default function LanguagePage() {
  const { t, language, setLanguage } = useLanguage();
  const [selected, setSelected] = useState(language);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSelected(language);
  }, [language]);

  function handleSave() {
    setLanguage(selected);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === selected);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/account/profile" className="hover:text-primary">{t('account')}</a>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{t('changeLanguage')}</span>
        </div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Globe size={24} className="text-primary" /></div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">{t('chooseLanguage')}</h1>
            <p className="text-sm text-muted-foreground">{t('chooseLanguageDesc')}</p>
          </div>
        </div>
        <div className="mb-5 flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
          <Check size={16} className="text-primary shrink-0" />
          <p className="text-sm text-foreground">{t('currentLanguage')} <span className="font-bold text-primary">{SUPPORTED_LANGUAGES.find((l) => l.code === language)?.nativeName || 'English'}</span></p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {SUPPORTED_LANGUAGES?.map(lang => (
            <button key={lang?.code} onClick={() => setSelected(lang?.code)} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${selected === lang?.code ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card'}`}>
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang?.flag}</span>
                <div><p className="font-bold text-foreground text-sm">{lang?.nativeName}</p><p className="text-xs text-muted-foreground">{lang?.name} · {lang?.region}</p></div>
              </div>
              {selected === lang?.code && <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0"><Check size={14} className="text-white" /></div>}
            </button>
          ))}
        </div>
        <button onClick={handleSave} className={`w-full py-3.5 rounded-xl font-bold text-base transition-all ${saved ? 'bg-success text-white' : 'btn-primary'}`}>
          {saved ? `✓ ${selectedLang?.nativeName || 'Language'} ${t('languageApplied')}` : `${t('saveLanguage')} — ${selectedLang?.nativeName || 'English'}`}
        </button>
        {saved && <div className="mt-4 bg-success/10 border border-success/30 rounded-xl px-4 py-3 text-center"><p className="text-sm font-medium text-success">{GREETINGS[selected] || GREETINGS['en']}</p></div>}
        {!saved && <p className="text-center text-xs text-muted-foreground mt-4">{t('languageSavedDevice')}</p>}
      </main>
      <Footer />
    </div>
  );
}
