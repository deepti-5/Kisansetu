'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { MapPin, Bell, ChevronDown, User, ShoppingBag, CreditCard, Heart, Globe, Store, HelpCircle, FileText, LogOut, Menu, X, ChevronRight, ShoppingCart, Loader2 } from 'lucide-react';

// Language translations for Header UI
const HEADER_TRANSLATIONS: Record<string, {
  home: string; equipment: string; labour: string; agri: string; howItWorks: string; help: string;
  accounts: string; yourInfo: string; bookings: string; payments: string; wishlist: string;
  notifications: string; changeLanguage: string; supplierDashboard: string; helpSupport: string;
  policies: string; logout: string; navigation: string; account: string; smartFarming: string;
}> = {
  en: { home: 'Home', equipment: 'Equipment', labour: 'Labour', agri: 'Agri', howItWorks: 'How It Works', help: 'Help', accounts: 'Accounts', yourInfo: 'Your Information', bookings: 'My Bookings / Orders', payments: 'Payment & Refund History', wishlist: 'Wishlist', notifications: 'Notifications', changeLanguage: 'Change Language', supplierDashboard: 'Supplier Dashboard', helpSupport: 'Help & Support', policies: 'Policies', logout: 'Logout', navigation: 'Navigation', account: 'Account', smartFarming: 'Smart Farming Platform' },
  hi: { home: 'होम', equipment: 'उपकरण', labour: 'मजदूर', agri: 'कृषि', howItWorks: 'कैसे काम करता है', help: 'सहायता', accounts: 'खाता', yourInfo: 'आपकी जानकारी', bookings: 'मेरी बुकिंग / ऑर्डर', payments: 'भुगतान इतिहास', wishlist: 'विशलिस्ट', notifications: 'सूचनाएं', changeLanguage: 'भाषा बदलें', supplierDashboard: 'आपूर्तिकर्ता डैशबोर्ड', helpSupport: 'सहायता', policies: 'नीतियां', logout: 'लॉग आउट', navigation: 'नेविगेशन', account: 'खाता', smartFarming: 'स्मार्ट खेती प्लेटफॉर्म' },
  mr: { home: 'मुख्यपृष्ठ', equipment: 'उपकरणे', labour: 'मजूर', agri: 'शेती', howItWorks: 'कसे कार्य करते', help: 'मदत', accounts: 'खाते', yourInfo: 'तुमची माहिती', bookings: 'माझ्या बुकिंग', payments: 'पेमेंट इतिहास', wishlist: 'विशलिस्ट', notifications: 'सूचना', changeLanguage: 'भाषा बदला', supplierDashboard: 'पुरवठादार डॅशबोर्ड', helpSupport: 'मदत', policies: 'धोरणे', logout: 'लॉग आउट', navigation: 'नेव्हिगेशन', account: 'खाते', smartFarming: 'स्मार्ट शेती प्लॅटफॉर्म' },
  kn: { home: 'ಮನೆ', equipment: 'ಉಪಕರಣ', labour: 'ಕಾರ್ಮಿಕ', agri: 'ಕೃಷಿ', howItWorks: 'ಹೇಗೆ ಕೆಲಸ ಮಾಡುತ್ತದೆ', help: 'ಸಹಾಯ', accounts: 'ಖಾತೆ', yourInfo: 'ನಿಮ್ಮ ಮಾಹಿತಿ', bookings: 'ನನ್ನ ಬುಕಿಂಗ್', payments: 'ಪಾವತಿ ಇತಿಹಾಸ', wishlist: 'ವಿಶ್‌ಲಿಸ್ಟ್', notifications: 'ಅಧಿಸೂಚನೆಗಳು', changeLanguage: 'ಭಾಷೆ ಬದಲಿಸಿ', supplierDashboard: 'ಸರಬರಾಜುದಾರ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್', helpSupport: 'ಸಹಾಯ', policies: 'ನೀತಿಗಳು', logout: 'ಲಾಗ್ ಔಟ್', navigation: 'ನ್ಯಾವಿಗೇಶನ್', account: 'ಖಾತೆ', smartFarming: 'ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ವೇದಿಕೆ' },
  te: { home: 'హోమ్', equipment: 'పరికరాలు', labour: 'కూలీ', agri: 'వ్యవసాయం', howItWorks: 'ఎలా పని చేస్తుంది', help: 'సహాయం', accounts: 'ఖాతా', yourInfo: 'మీ సమాచారం', bookings: 'నా బుకింగ్‌లు', payments: 'చెల్లింపు చరిత్ర', wishlist: 'విష్‌లిస్ట్', notifications: 'నోటిఫికేషన్లు', changeLanguage: 'భాష మార్చు', supplierDashboard: 'సప్లయర్ డాష్‌బోర్డ్', helpSupport: 'సహాయం', policies: 'విధానాలు', logout: 'లాగ్ అవుట్', navigation: 'నావిగేషన్', account: 'ఖాతా', smartFarming: 'స్మార్ట్ వ్యవసాయ వేదిక' },
  ta: { home: 'முகப்பு', equipment: 'உபகரணங்கள்', labour: 'தொழிலாளர்', agri: 'விவசாயம்', howItWorks: 'எப்படி செயல்படுகிறது', help: 'உதவி', accounts: 'கணக்கு', yourInfo: 'உங்கள் தகவல்', bookings: 'என் முன்பதிவுகள்', payments: 'கட்டண வரலாறு', wishlist: 'விஷ்லிஸ்ட்', notifications: 'அறிவிப்புகள்', changeLanguage: 'மொழி மாற்று', supplierDashboard: 'சப்ளையர் டாஷ்போர்டு', helpSupport: 'உதவி', policies: 'கொள்கைகள்', logout: 'வெளியேறு', navigation: 'வழிசெலுத்தல்', account: 'கணக்கு', smartFarming: 'ஸ்மார்ட் விவசாய தளம்' },
  gu: { home: 'હોમ', equipment: 'સાધનો', labour: 'મજૂર', agri: 'ખેતી', howItWorks: 'કેવી રીતે કામ કરે છે', help: 'મદદ', accounts: 'ખાતું', yourInfo: 'તમારી માહિતી', bookings: 'મારી બુકિંગ', payments: 'ચુકવણી ઇતિહાસ', wishlist: 'વિશ્લિસ્ટ', notifications: 'સૂચનાઓ', changeLanguage: 'ભાષા બદલો', supplierDashboard: 'સપ્લાયર ડેશબોર્ડ', helpSupport: 'મદદ', policies: 'નીતિઓ', logout: 'લૉગ આઉટ', navigation: 'નેવિગેશન', account: 'ખાતું', smartFarming: 'સ્માર્ટ ખેતી પ્લેટફોર્મ' },
  pa: { home: 'ਹੋਮ', equipment: 'ਉਪਕਰਣ', labour: 'ਮਜ਼ਦੂਰ', agri: 'ਖੇਤੀ', howItWorks: 'ਕਿਵੇਂ ਕੰਮ ਕਰਦਾ ਹੈ', help: 'ਮਦਦ', accounts: 'ਖਾਤਾ', yourInfo: 'ਤੁਹਾਡੀ ਜਾਣਕਾਰੀ', bookings: 'ਮੇਰੀਆਂ ਬੁਕਿੰਗਾਂ', payments: 'ਭੁਗਤਾਨ ਇਤਿਹਾਸ', wishlist: 'ਵਿਸ਼ਲਿਸਟ', notifications: 'ਸੂਚਨਾਵਾਂ', changeLanguage: 'ਭਾਸ਼ਾ ਬਦਲੋ', supplierDashboard: 'ਸਪਲਾਇਰ ਡੈਸ਼ਬੋਰਡ', helpSupport: 'ਮਦਦ', policies: 'ਨੀਤੀਆਂ', logout: 'ਲੌਗ ਆਉਟ', navigation: 'ਨੈਵੀਗੇਸ਼ਨ', account: 'ਖਾਤਾ', smartFarming: 'ਸਮਾਰਟ ਖੇਤੀ ਪਲੇਟਫਾਰਮ' },
  bn: { home: 'হোম', equipment: 'সরঞ্জাম', labour: 'শ্রমিক', agri: 'কৃষি', howItWorks: 'কীভাবে কাজ করে', help: 'সাহায্য', accounts: 'অ্যাকাউন্ট', yourInfo: 'আপনার তথ্য', bookings: 'আমার বুকিং', payments: 'পেমেন্ট ইতিহাস', wishlist: 'উইশলিস্ট', notifications: 'বিজ্ঞপ্তি', changeLanguage: 'ভাষা পরিবর্তন', supplierDashboard: 'সাপ্লায়ার ড্যাশবোর্ড', helpSupport: 'সাহায্য', policies: 'নীতিমালা', logout: 'লগ আউট', navigation: 'নেভিগেশন', account: 'অ্যাকাউন্ট', smartFarming: 'স্মার্ট কৃষি প্ল্যাটফর্ম' },
  or: { home: 'ହୋମ', equipment: 'ଉପକରଣ', labour: 'ଶ୍ରମିକ', agri: 'କୃଷି', howItWorks: 'କିପରି କାମ କରେ', help: 'ସାହାଯ୍ୟ', accounts: 'ଖାତା', yourInfo: 'ଆପଣଙ୍କ ସୂଚନା', bookings: 'ମୋ ବୁକିଂ', payments: 'ଦେୟ ଇତିହାସ', wishlist: 'ୱିଶ୍‌ଲିଷ୍ଟ', notifications: 'ବିଜ୍ଞପ୍ତି', changeLanguage: 'ଭାଷା ବଦଳାନ୍ତୁ', supplierDashboard: 'ସପ୍ଲାୟର ଡ୍ୟାଶ୍‌ବୋର୍ଡ', helpSupport: 'ସାହାଯ୍ୟ', policies: 'ନୀତି', logout: 'ଲଗ ଆଉଟ', navigation: 'ନ୍ୟାଭିଗେସନ', account: 'ଖାତା', smartFarming: 'ସ୍ମାର୍ଟ କୃଷି ପ୍ଲାଟଫର୍ମ' },
};

export default function Header() {
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifCount] = useState(3);
  const [mounted, setMounted] = useState(false);
  const [location, setLocation] = useState<string>('Detecting...');
  const [locationLoading, setLocationLoading] = useState(false);
  const [lang, setLang] = useState('en');
  const accountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    detectLocation();
    // Load saved language
    const savedLang = localStorage.getItem('kisansetu_language');
    if (savedLang && HEADER_TRANSLATIONS[savedLang]) {
      setLang(savedLang);
    }
    // Listen for language changes from other tabs/pages
    function onStorage(e: StorageEvent) {
      if (e.key === 'kisansetu_language' && e.newValue && HEADER_TRANSLATIONS[e.newValue]) {
        setLang(e.newValue);
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const t = HEADER_TRANSLATIONS[lang] || HEADER_TRANSLATIONS['en'];

  const NAV_LINKS = [
    { label: t.home, href: '/' },
    { label: t.equipment, href: '/equipment-listing-page' },
    { label: t.labour, href: '/labour' },
    { label: t.agri, href: '/agri' },
    { label: t.howItWorks, href: '/how-it-works' },
    { label: t.help, href: '/help' },
  ];

  const ACCOUNT_MENU = [
    { icon: User, label: t.yourInfo, href: '/account/profile' },
    { icon: ShoppingBag, label: t.bookings, href: '/account/bookings' },
    { icon: CreditCard, label: t.payments, href: '/account/payments' },
    { icon: Heart, label: t.wishlist, href: '/account/wishlist' },
    { icon: Bell, label: t.notifications, href: '/account/notifications' },
    { icon: Globe, label: t.changeLanguage, href: '/account/language' },
    { icon: Store, label: t.supplierDashboard, href: '/supplier/dashboard' },
    { icon: HelpCircle, label: t.helpSupport, href: '/help' },
    { icon: FileText, label: t.policies, href: '/policies' },
    { icon: LogOut, label: t.logout, href: '/sign-up-login-screen', danger: true },
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
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 bg-card border-b border-border shadow-nav">
        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <AppLogo size={36} />
              <div className="hidden sm:block">
                <span className="font-extrabold text-lg text-primary leading-none">KisanSetu</span>
                <p className="text-xs text-muted-foreground leading-none mt-0.5">{t.smartFarming}</p>
              </div>
            </Link>

            {/* Desktop Nav */}
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

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Location */}
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
                  {locationLoading ? 'Detecting...' : location}
                </span>
                <ChevronDown size={13} className="text-muted-foreground" />
              </button>

              {/* Notifications */}
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

              {/* Cart */}
              <Link
                href="/account/cart"
                className="relative p-2 rounded-lg hover:bg-secondary transition-colors duration-150"
              >
                <ShoppingCart size={20} className="text-foreground" />
              </Link>

              {/* Account Dropdown */}
              <div className="relative" ref={accountRef}>
                <button
                  suppressHydrationWarning
                  onClick={() => setAccountOpen(!accountOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-white hover:bg-secondary transition-colors duration-150"
                >
                  <div className="w-7 h-7 rounded-full gradient-green flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="hidden md:inline text-sm font-semibold text-foreground">{t.accounts}</span>
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
                          item.danger ? 'text-danger hover:bg-danger-bg' : 'text-foreground'
                        }`}
                      >
                        <item.icon size={16} className={item.danger ? 'text-danger' : 'text-muted-foreground'} />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Hamburger */}
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

      {/* Mobile Drawer — only rendered after client mount to prevent hydration mismatch */}
      {mounted && mobileOpen && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-72 bg-card shadow-modal flex flex-col slide-up">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <div className="flex items-center gap-2">
                <AppLogo size={32} />
                <span className="font-extrabold text-primary">KisanSetu</span>
              </div>
              <button suppressHydrationWarning onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">{t.navigation}</p>
                {NAV_LINKS.map((link) => (
                  <Link
                    key={`mob-${link.href}`}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-foreground hover:bg-secondary hover:text-primary transition-colors"
                  >
                    {link.label}
                    <ChevronRight size={15} className="text-muted-foreground" />
                  </Link>
                ))}
              </div>

              <div className="border-t border-border px-3 py-2 mt-1">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-1">{t.account}</p>
                {ACCOUNT_MENU.map((item) => (
                  <Link
                    key={`mob-acct-${item.href}`}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      item.danger ? 'text-danger hover:bg-danger-bg' : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <item.icon size={16} className={item.danger ? 'text-danger' : 'text-muted-foreground'} />
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="px-4 py-4 border-t border-border">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                {locationLoading ? (
                  <Loader2 size={14} className="text-primary animate-spin" />
                ) : (
                  <MapPin size={14} className="text-primary" />
                )}
                {locationLoading ? 'Detecting location...' : location}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}