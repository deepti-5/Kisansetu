'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight, FileText, Shield, RotateCcw, CreditCard, Store } from 'lucide-react';
import Icon from '../../../kisansetu-main/src/components/ui/AppIcon';


const POLICIES = {
  terms: { title: 'Terms of Use', icon: FileText, lastUpdated: 'August 1, 2026', sections: [{ heading: '1. Acceptance of Terms', content: 'By accessing or using the KisanSetu platform, you agree to be bound by these Terms of Use. KisanSetu Technologies Pvt. Ltd. reserves the right to modify these terms at any time.' }, { heading: '2. Eligibility', content: 'You must be at least 18 years of age and a resident of India to use this Platform.' }, { heading: '3. Equipment Rental & Purchase', content: 'KisanSetu acts as an intermediary marketplace connecting equipment owners with farmers. All rental agreements are between the User and the Supplier.' }, { heading: '4. Governing Law', content: 'These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.' }] },
  privacy: { title: 'Privacy Policy', icon: Shield, lastUpdated: 'August 1, 2026', sections: [{ heading: '1. Information We Collect', content: 'We collect personal information (name, phone, email) during registration, location data, transaction data, and device usage data.' }, { heading: '2. How We Use Your Information', content: 'Your information is used to process bookings and payments, verify supplier identities, send booking confirmations, and improve Platform features.' }, { heading: '3. Data Security', content: 'We implement industry-standard security measures including SSL encryption, secure data storage, and regular security audits.' }, { heading: '4. Contact', content: 'For privacy-related queries, contact privacy@kisansetu.in or write to: KisanSetu Technologies Pvt. Ltd., 5th Floor, Baner Road, Pune – 411045.' }] },
  cancellation: { title: 'Cancellation Policy', icon: RotateCcw, lastUpdated: 'August 1, 2026', sections: [{ heading: '1. Equipment Rental Cancellations', content: 'Cancellations made 48+ hours before start: 100% refund. Cancellations 24–48 hours before start: 80% refund. Cancellations within 24 hours: 50% refund. No-shows: No refund.' }, { heading: '2. How to Cancel', content: 'To cancel a booking, go to My Bookings → Select the booking → Click "Cancel Booking". Refunds are processed within 5–7 business days.' }] },
  refund: { title: 'Refund Policy', icon: CreditCard, lastUpdated: 'August 1, 2026', sections: [{ heading: '1. Refund Timeline', content: 'UPI payments: 1–3 business days. Credit/Debit cards: 5–7 business days. Net banking: 3–5 business days.' }, { heading: '2. Security Deposit Refunds', content: 'Security deposits are refunded within 3–5 business days after equipment return and inspection.' }] },
  supplier: { title: 'Supplier Agreement', icon: Store, lastUpdated: 'August 1, 2026', sections: [{ heading: '1. Supplier Eligibility', content: 'To become a KisanSetu supplier, you must be an Indian resident aged 18+, own or have legal rights to the equipment listed, and pass KYC verification.' }, { heading: '2. Commission Structure', content: 'KisanSetu charges a platform commission of 8–12% on each successful transaction. Payouts are processed weekly every Monday.' }] },
};

type PolicySlug = keyof typeof POLICIES;
const POLICY_NAV: { slug: PolicySlug; label: string }[] = [
  { slug: 'terms', label: 'Terms of Use' }, { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'cancellation', label: 'Cancellation Policy' }, { slug: 'refund', label: 'Refund Policy' },
  { slug: 'supplier', label: 'Supplier Agreement' },
];

export default function PoliciesPage() {
  const [activePolicy, setActivePolicy] = React.useState<PolicySlug>('terms');
  const policy = POLICIES[activePolicy];
  const PolicyIcon = policy.icon;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Policies</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Legal Documents</p>
              <nav className="space-y-1">
                {POLICY_NAV.map(item => {
                  const Icon = POLICIES[item.slug].icon;
                  return (
                    <button key={item.slug} onClick={() => setActivePolicy(item.slug)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${activePolicy === item.slug ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'}`}>
                      <Icon size={16} className={activePolicy === item.slug ? 'text-primary' : 'text-muted-foreground'} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0"><PolicyIcon size={24} className="text-primary" /></div>
                <div><h1 className="text-2xl font-extrabold text-foreground">{policy.title}</h1><p className="text-sm text-muted-foreground mt-0.5">Last updated: {policy.lastUpdated}</p></div>
              </div>
              <div className="space-y-6">
                {policy.sections.map((section, i) => (
                  <div key={i}><h2 className="text-base font-bold text-foreground mb-2">{section.heading}</h2><p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p></div>
                ))}
              </div>
              <div className="mt-8 pt-6 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">Questions? Contact us at <a href="mailto:legal@kisansetu.in" className="text-primary hover:underline">legal@kisansetu.in</a></p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
