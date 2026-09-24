'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { MapPin, Bell, ChevronDown, User, ShoppingBag, CreditCard, Heart, Globe, Store, HelpCircle, FileText, LogOut, Menu, X, ChevronRight, ShoppingCart, Loader2, Check } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SUPPORTED_LANGUAGES } from '@/lib/i18n';

export default function Header() {
  const { t, language, setLanguage } = useLanguage();
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [notifCount] = useState(3);
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<string>('Detecting...');
  const [locationLoading, setLocationLoading] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    detectLocation();
  }, []);

  const NAV_LINKS = [
    { label: t('home'), href: '/' },
    { label: t('equipment'), href: '/equipment-listing-page' },
    { label: t('labour'), href: '/labour' },
    { label: t('agri'), href: '/agri' },
    { label: t('howItWorks'), href: '/how-it-works' },
    { label: t('help'), href: '/help' },
  ];

  const ACCOUNT_MENU = [
    { icon: User, label: t('yourInfo'), href: '/account/profile' },
    { icon: ShoppingBag, label: t('bookings'), href: '/account/bookings' },
    { icon: CreditCard, label: t('payments'), href: '/account/payments' },
    { icon: Heart, label: t('wishlist'), href: '/account/wishlist' },
    { icon: Bell, label: t('notifications'), href: '/account/notifications' },
    { icon: Globe, label: t('changeLanguage'), href: '/account/language' },
    { icon: Store, label: t('supplierDashboard'), href: '/supplier/dashboard' },
    { icon: HelpCircle, label: t('helpSupport'), href: '/help' },
    { icon: FileText, label: t('policies'), href: '/policies' },
    { icon: LogOut, label: t('logout'), href: '/sign-up-login-screen', danger: true },
  ];

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocation('Pune, Maharashtra');
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Unknown';
          const state = data.address?.state || '';
          setLocation(state ? `${city}, ${state}` : city);
        } catch {
          setLocation('Pune, Maharashtra');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocation('Pune, Maharashtra');
        setLocationLoading(false);
      },
      { timeout: 8000 }
    );
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
        setAccountOpen(false);
      }
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const currentLang = SUPPORTED_LANGUAGES.find((l) => l.code === language);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-nav">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <AppLogo size={36} />
              <div className="hidden sm:block">
                <span className="font-extrabold text-lg text-primary leading-none">KisanSetu</span>
                <p className="text-xs text-muted-foreground leading-none mt-0.5">{t('smartFarming')}</p>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={`nav-${link.href}`}
                  href={link.href}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-foreground hover:bg-secondary hover:text-primary transition-colors duration-150"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <button
                suppressHydrationWarning
                onClick={detectLocation}
                title="Click to refresh location"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-white hover:bg-secondary transition-colors duration-150 text-sm font-medium text-foreground"
              >
                {locationLoading ? (
                  <Loader2 size={15} className="text-primary animate-spin" />
                ) : (
                  <MapPin size={15} className="text-primary" />
                )}
                <span className="hidden xl:inline max-w-[140px] truncate">
                  {locationLoading ? t('heroDetecting') : location}
                </span>
                <ChevronDown size={13} className="text-muted-foreground" />
              </button>

              {/* Global Language Switcher */}
              <div className="relative" ref={langRef}>
                <button
                  suppressHydrationWarning
                  onClick={() => setLangOpen(!langOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-border bg-white hover:bg-secondary transition-colors duration-150 text-sm font-medium text-foreground"
                  title={t('changeLanguage')}
                >
                  <Globe size={15} className="text-primary" />
                  <span className="hidden sm:inline font-semibold text-xs">{currentLang?.nativeName || 'EN'}</span>
                  <ChevronDown size={12} className="text-muted-foreground" />
                </button>
                {langOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-card rounded-xl border border-border shadow-modal z-50 py-1.5 fade-in">
                    <p className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider border-b border-border mb-1">
                      {t('changeLanguage')}
                    </p>
                    {SUPPORTED_LANGUAGES.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => { setLanguage(lang.code); setLangOpen(false); }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors hover:bg-muted ${language === lang.code ? 'text-primary font-semibold' : 'text-foreground'}`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="text-base">{lang.flag}</span>
                          <div className="text-left">
                            <p className="font-semibold text-sm leading-none">{lang.nativeName}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{lang.name}</p>
                          </div>
                        </div>
                        {language === lang.code && <Check size={14} className="text-primary shrink-0" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Link
                href="/account/notifications"
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors duration-150"
              >
                <Bell size={20} className="text-foreground" />
                {notifCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {notifCount}
                  </span>
                )}
              </Link>

              <Link
                href="/account/cart"
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors duration-150"
              >
                <ShoppingCart size={20} className="text-foreground" />
              </Link>

              <div className="relative" ref={accountRef}>
                <button
                  suppressHydrationWarning
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white hover:bg-secondary transition-colors duration-150"
                >
                  <div className="w-7 h-7 rounded-full gradient-green flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="hidden md:inline text-sm font-semibold text-foreground">{t('accounts')}</span>
                  <ChevronDown size={14} className="text-muted-foreground" />
                </button>

                {accountOpen && (
                  <div className="absolute right-0 top-full mt-2 w-64 bg-card rounded-xl border border-border shadow-modal z-50 py-2 fade-in">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="font-semibold text-sm text-foreground">Johan Rame</p>
                      <p className="text-xs text-muted-foreground">+91 98765 43210</p>
                    </div>
                    {ACCOUNT_MENU.map((item) => (
                      <Link
                        key={`acct-${item.href}`}
                        href={item.href}
                        onClick={() => setAccountOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-muted ${
                          (item as { danger?: boolean }).danger ? 'text-danger hover:bg-danger-bg' : 'text-foreground'
                        }`}
                      >
                        <item.icon size={16} className={(item as { danger?: boolean }).danger ? 'text-danger' : 'text-muted-foreground'} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <button
                suppressHydrationWarning
                onClick={() => setMobileOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
              >
                <Menu size={22} className="text-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {mounted && mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-card shadow-modal flex flex-col slide-up">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AppLogo size={32} />
                <span className="font-extrabold text-base text-primary">KisanSetu</span>
              </div>
              <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X size={20} className="text-foreground" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto py-2">
              <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('navigation')}</p>
              {NAV_LINKS.map((link) => (
                <Link
                  key={`mob-${link.href}`}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {link.label}
                  <ChevronRight size={15} className="text-muted-foreground" />
                </Link>
              ))}
              <div className="border-t border-border mt-2 pt-2">
                <p className="px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('account')}</p>
                {ACCOUNT_MENU.map((item) => (
                  <Link
                    key={`mob-acct-${item.href}`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 text-sm font-medium transition-colors hover:bg-muted ${
                      (item as { danger?: boolean }).danger ? 'text-danger' : 'text-foreground'
                    }`}
                  >
                    <item.icon size={16} className={(item as { danger?: boolean }).danger ? 'text-danger' : 'text-muted-foreground'} />
                    {item.label}
                  </Link>
                ))}
              </div>
              {/* Mobile Language Switcher */}
              <div className="border-t border-border mt-2 pt-2 px-4 pb-4">
                <p className="py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{t('changeLanguage')}</p>
                <div className="grid grid-cols-2 gap-2">
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => { setLanguage(lang.code); setMobileOpen(false); }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                        language === lang.code
                          ? 'border-primary bg-primary/5 text-primary' :'border-border text-foreground hover:border-primary/40'
                      }`}
                    >
                      <span>{lang.flag}</span>
                      <span className="font-semibold">{lang.nativeName}</span>
                      {language === lang.code && <Check size={12} className="text-primary ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
