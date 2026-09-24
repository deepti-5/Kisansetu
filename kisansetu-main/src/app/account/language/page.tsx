'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Globe, Check, ChevronRight } from 'lucide-react';

const LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English', region: 'All India', flag: '🇮🇳' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिंदी', region: 'North India', flag: '🇮🇳' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', region: 'Maharashtra', flag: '🇮🇳' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', region: 'Karnataka', flag: '🇮🇳' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', region: 'Andhra Pradesh & Telangana', flag: '🇮🇳' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', region: 'Tamil Nadu', flag: '🇮🇳' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', region: 'Gujarat', flag: '🇮🇳' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', region: 'Punjab & Haryana', flag: '🇮🇳' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', region: 'West Bengal', flag: '🇮🇳' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', region: 'Odisha', flag: '🇮🇳' },
];

// Greeting translations for the confirmation message
const GREETINGS: Record<string, string> = {
  en: 'Language saved! The platform is now set to English.',
  hi: 'भाषा सहेजी गई! प्लेटफ़ॉर्म अब हिंदी में सेट है।',
  mr: 'भाषा जतन केली! प्लॅटफॉर्म आता मराठीत सेट आहे.',
  kn: 'ಭಾಷೆ ಉಳಿಸಲಾಗಿದೆ! ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ ಈಗ ಕನ್ನಡಕ್ಕೆ ಹೊಂದಿಸಲಾಗಿದೆ.',
  te: 'భాష సేవ్ చేయబడింది! ప్లాట్‌ఫారమ్ ఇప్పుడు తెలుగులో సెట్ చేయబడింది.',
  ta: 'மொழி சேமிக்கப்பட்டது! தளம் இப்போது தமிழில் அமைக்கப்பட்டுள்ளது.',
  gu: 'ભાષા સાચવી! પ્લેટફોર્મ હવે ગુજરાતીમાં સેટ છે.',
  pa: 'ਭਾਸ਼ਾ ਸੁਰੱਖਿਅਤ ਕੀਤੀ! ਪਲੇਟਫਾਰਮ ਹੁਣ ਪੰਜਾਬੀ ਵਿੱਚ ਸੈੱਟ ਹੈ।',
  bn: 'ভাষা সংরক্ষিত! প্ল্যাটফর্ম এখন বাংলায় সেট করা হয়েছে।',
  or: 'ଭାଷା ସଞ୍ଚୟ ହୋଇଛି! ପ୍ଲାଟଫର୍ମ ବର୍ତ୍ତମାନ ଓଡ଼ିଆରେ ସେଟ୍ ହୋଇଛି।',
};

export default function LanguagePage() {
  const [selected, setSelected] = useState('en');
  const [saved, setSaved] = useState(false);
  const [savedLang, setSavedLang] = useState('en');

  // Load saved language from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('kisansetu_language');
    if (stored) {
      setSelected(stored);
      setSavedLang(stored);
    }
  }, []);

  function handleSave() {
    // Persist to localStorage
    localStorage.setItem('kisansetu_language', selected);
    // Also set as html lang attribute for accessibility
    document.documentElement.lang = selected;
    setSavedLang(selected);
    setSaved(true);
    // Dispatch storage event so Header updates immediately on same page
    window.dispatchEvent(new StorageEvent('storage', { key: 'kisansetu_language', newValue: selected }));
    setTimeout(() => setSaved(false), 3000);
  }

  const selectedLang = LANGUAGES.find((l) => l.code === selected);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <a href="/account/profile" className="hover:text-primary">Account</a>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Language</span>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Globe size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Choose Language</h1>
            <p className="text-sm text-muted-foreground">Select your preferred language for the KisanSetu platform</p>
          </div>
        </div>

        {/* Currently active language indicator */}
        {savedLang && (
          <div className="mb-5 flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-xl px-4 py-3">
            <Check size={16} className="text-primary shrink-0" />
            <p className="text-sm text-foreground">
              Current language:{' '}
              <span className="font-bold text-primary">
                {LANGUAGES.find((l) => l.code === savedLang)?.nativeName || 'English'}
              </span>
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
          {LANGUAGES?.map(lang => (
            <button
              key={lang?.code}
              onClick={() => setSelected(lang?.code)}
              className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${
                selected === lang?.code
                  ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30 bg-card'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{lang?.flag}</span>
                <div>
                  <p className="font-bold text-foreground text-sm">{lang?.nativeName}</p>
                  <p className="text-xs text-muted-foreground">{lang?.name} · {lang?.region}</p>
                </div>
              </div>
              {selected === lang?.code && (
                <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center shrink-0">
                  <Check size={14} className="text-white" />
                </div>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleSave}
          className={`w-full py-3.5 rounded-xl font-bold text-base transition-all ${saved ? 'bg-success text-white' : 'btn-primary'}`}
        >
          {saved ? `✓ ${selectedLang?.nativeName || 'Language'} Applied!` : `Save — ${selectedLang?.nativeName || 'English'}`}
        </button>

        {/* Confirmation message in selected language */}
        {saved && (
          <div className="mt-4 bg-success/10 border border-success/30 rounded-xl px-4 py-3 text-center">
            <p className="text-sm font-medium text-success">{GREETINGS[selected] || GREETINGS['en']}</p>
          </div>
        )}

        {!saved && (
          <p className="text-center text-xs text-muted-foreground mt-4">
            Language preference is saved to your device and will be remembered on your next visit.
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
