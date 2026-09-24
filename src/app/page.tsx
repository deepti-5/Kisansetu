'use client';

import React, { useState, useRef, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroSection from '@/app/components/HeroSection';
import CategoryCards from '@/app/components/CategoryCards';
import FeaturedEquipment from '@/app/components/FeaturedEquipment';
import FeaturedLabour from '@/app/components/FeaturedLabour';
import FeaturedAgri from '@/app/components/FeaturedAgri';
import BookingFlowSection from '@/app/components/BookingFlowSection';
import HowItWorksSection from '@/app/components/HowItWorksSection';
import KeyFeaturesSection from '@/app/components/KeyFeaturesSection';
import TestimonialsSection from '@/app/components/TestimonialsSection';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

function TopLanguageBar() {
  const { language, setLanguage, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <div className="w-full bg-primary text-white py-2 px-4">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        <p className="text-xs font-medium opacity-90 hidden sm:block">
          🌾 KisanSetu — Smart Farming Platform for Indian Farmers
        </p>
        <p className="text-xs font-medium opacity-90 sm:hidden">🌾 KisanSetu</p>

        <div className="relative flex items-center gap-2" ref={ref}>
          <span className="text-xs opacity-80 hidden md:inline">{t('changeLanguage')}:</span>
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors rounded-lg px-3 py-1.5 text-sm font-semibold"
          >
            <Globe size={14} />
            <span>{currentLang?.flag} {currentLang?.nativeName || 'English'}</span>
            <ChevronDown size={12} className={`transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-xl border border-border shadow-modal z-[100] py-1.5">
              <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
                {t('changeLanguage')}
              </p>
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => { setLanguage(lang.code); setOpen(false); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-muted ${language === lang.code ? 'text-primary font-semibold' : 'text-foreground'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base">{lang.flag}</span>
                    <div className="text-left">
                      <p className="font-semibold text-sm leading-none">{lang.nativeName}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{lang.region}</p>
                    </div>
                  </div>
                  {language === lang.code && <Check size={14} className="text-primary shrink-0" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <TopLanguageBar />
      <Header />
      <main>
        <HeroSection />
        <CategoryCards />
        <FeaturedEquipment />
        <FeaturedLabour />
        <FeaturedAgri />
        <BookingFlowSection />
        <HowItWorksSection />
        <KeyFeaturesSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </div>
  );
}
