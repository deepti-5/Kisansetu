import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import { MapPin, Phone, Mail } from 'lucide-react';

const FacebookIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);
const TwitterIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
  </svg>
);
const YoutubeIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46a2.78 2.78 0 0 0-1.95 1.96A29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white"/>
  </svg>
);
const InstagramIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
  </svg>
);

const SOCIAL_ICONS: Array<{ icon: React.ComponentType<{ size?: number }>; label: string }> = [
  { icon: FacebookIcon, label: 'Facebook' },
  { icon: TwitterIcon, label: 'Twitter' },
  { icon: YoutubeIcon, label: 'Youtube' },
  { icon: InstagramIcon, label: 'Instagram' },
];

const FOOTER_LINKS = {
  Platform: [
    { label: 'Equipment', href: '/equipment-listing-page' },
    { label: 'Labour', href: '/labour' },
    { label: 'Agri Supplies', href: '/agri' },
    { label: 'How It Works', href: '/how-it-works' },
    { label: 'Become a Supplier', href: '/supplier/onboarding' },
  ],
  Support: [
    { label: 'Help & Support', href: '/help' },
    { label: 'Contact Us', href: '/help' },
    { label: 'FAQs', href: '/help' },
    { label: 'Voice Help', href: '/help' },
    { label: 'Report an Issue', href: '/help' },
  ],
  Policies: [
    { label: 'Terms of Use', href: '/policies' },
    { label: 'Privacy Policy', href: '/policies' },
    { label: 'Cancellation Policy', href: '/policies' },
    { label: 'Refund Policy', href: '/policies' },
    { label: 'Supplier Agreement', href: '/policies' },
  ],
  Languages: [
    { label: 'English', href: '/account/language' },
    { label: 'हिंदी', href: '/account/language' },
    { label: 'मराठी', href: '/account/language' },
    { label: 'ಕನ್ನಡ', href: '/account/language' },
    { label: 'తెలుగు', href: '/account/language' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-foreground text-white">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <AppLogo size={36} />
              <span className="font-extrabold text-xl text-white">KisanSetu</span>
            </div>
            <p className="text-sm text-white/70 leading-relaxed mb-4">
              Smart Farming Equipment, Labour &amp; Agri Supplies Platform. Connecting farmers across India with the resources they need.
            </p>
            <div className="space-y-2 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-accent shrink-0" />
                Pune, Maharashtra, India — 411001
              </div>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-accent shrink-0" />
                1800-123-KISAN (Toll Free)
              </div>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-accent shrink-0" />
                support@kisansetu.in
              </div>
            </div>
            <div className="flex items-center gap-3 mt-5">
              {SOCIAL_ICONS?.map(({ icon: SocialIcon, label }, i) => (
                <a
                  key={`social-${i}`}
                  href="#"
                  aria-label={label}
                  className="w-8 h-8 rounded-lg bg-white/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-colors duration-150"
                >
                  {React.createElement(SocialIcon, { size: 15 })}
                </a>
              ))}
            </div>
          </div>

          {Object.entries(FOOTER_LINKS)?.map(([section, links]) => (
            <div key={`footer-${section}`}>
              <p className="font-semibold text-sm text-white mb-3 uppercase tracking-wider">{section}</p>
              <ul className="space-y-2">
                {links?.map((link) => (
                  <li key={`footer-${section}-${link?.label}`}>
                    <Link
                      href={link?.href}
                      className="text-sm text-white/65 hover:text-accent transition-colors duration-150"
                    >
                      {link?.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/15 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <p>© 2026 KisanSetu Technologies Pvt. Ltd. All rights reserved. CIN: U01400MH2024PTC123456</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              All systems operational
            </span>
            <span>v2.4.1</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
