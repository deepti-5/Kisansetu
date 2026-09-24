'use client';

import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight, FileText, Shield, RotateCcw, CreditCard, Store } from 'lucide-react';
import Icon from '@/components/ui/AppIcon';


const POLICIES = {
  terms: {
    title: 'Terms of Use',
    icon: FileText,
    lastUpdated: 'August 1, 2026',
    sections: [
      {
        heading: '1. Acceptance of Terms',
        content: 'By accessing or using the KisanSetu platform ("Platform"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Platform. KisanSetu Technologies Pvt. Ltd. reserves the right to modify these terms at any time.'
      },
      {
        heading: '2. Eligibility',
        content: 'You must be at least 18 years of age and a resident of India to use this Platform. By using the Platform, you represent and warrant that you meet these requirements and have the legal capacity to enter into binding agreements.'
      },
      {
        heading: '3. User Accounts',
        content: 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. KisanSetu is not liable for any loss resulting from unauthorized use of your account.'
      },
      {
        heading: '4. Equipment Rental & Purchase',
        content: 'KisanSetu acts as an intermediary marketplace connecting equipment owners (Suppliers) with farmers (Users). All rental agreements are between the User and the Supplier. KisanSetu does not own any equipment listed on the Platform.'
      },
      {
        heading: '5. Prohibited Activities',
        content: 'Users may not: (a) post false or misleading information; (b) use the Platform for illegal purposes; (c) attempt to circumvent payment systems; (d) harass other users or suppliers; (e) scrape or copy Platform content without permission.'
      },
      {
        heading: '6. Limitation of Liability',
        content: 'KisanSetu shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Platform. Our total liability shall not exceed the amount paid by you in the 3 months preceding the claim.'
      },
      {
        heading: '7. Governing Law',
        content: 'These Terms shall be governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Pune, Maharashtra.'
      },
    ]
  },
  privacy: {
    title: 'Privacy Policy',
    icon: Shield,
    lastUpdated: 'August 1, 2026',
    sections: [
      {
        heading: '1. Information We Collect',
        content: 'We collect: (a) Personal information (name, phone, email, Aadhaar, PAN) during registration; (b) Location data to show nearby equipment and labour; (c) Transaction data for bookings and payments; (d) Device and usage data for improving our services.'
      },
      {
        heading: '2. How We Use Your Information',
        content: 'Your information is used to: process bookings and payments; verify supplier identities; send booking confirmations and updates; improve Platform features; comply with legal obligations; prevent fraud and abuse.'
      },
      {
        heading: '3. Data Sharing',
        content: 'We share your data with: Suppliers (to fulfill bookings); Payment processors (Razorpay) for transactions; Government authorities when required by law; Analytics providers (anonymized data only). We never sell your personal data to third parties.'
      },
      {
        heading: '4. Data Security',
        content: 'We implement industry-standard security measures including SSL encryption, secure data storage, and regular security audits. Aadhaar and PAN data is encrypted at rest and in transit.'
      },
      {
        heading: '5. Your Rights',
        content: 'You have the right to: access your personal data; correct inaccurate data; request deletion of your account and data; opt out of marketing communications; data portability. Contact privacy@kisansetu.in to exercise these rights.'
      },
      {
        heading: '6. Cookies',
        content: 'We use cookies to maintain your session, remember preferences, and analyze Platform usage. You can disable cookies in your browser settings, but some features may not work correctly.'
      },
      {
        heading: '7. Contact',
        content: 'For privacy-related queries, contact our Data Protection Officer at privacy@kisansetu.in or write to: KisanSetu Technologies Pvt. Ltd., 5th Floor, Baner Road, Pune – 411045, Maharashtra, India.'
      },
    ]
  },
  cancellation: {
    title: 'Cancellation Policy',
    icon: RotateCcw,
    lastUpdated: 'August 1, 2026',
    sections: [
      {
        heading: '1. Equipment Rental Cancellations',
        content: 'Cancellations made 48+ hours before start: 100% refund. Cancellations 24–48 hours before start: 80% refund (20% cancellation fee). Cancellations within 24 hours: 50% refund. No-shows: No refund.'
      },
      {
        heading: '2. Equipment Purchase Cancellations',
        content: 'Orders can be cancelled before dispatch for a full refund. Once dispatched, cancellation is not possible. You may initiate a return after receiving the equipment as per our Return Policy.'
      },
      {
        heading: '3. Labour Hiring Cancellations',
        content: 'Labour hire requests can be cancelled up to 12 hours before the work start time for a full refund. Cancellations within 12 hours are subject to a 25% cancellation fee to compensate the worker for lost income.'
      },
      {
        heading: '4. Agri Product Cancellations',
        content: 'Agri product orders can be cancelled within 2 hours of placing the order for a full refund. After 2 hours, cancellation is subject to supplier approval. Perishable items cannot be cancelled once dispatched.'
      },
      {
        heading: '5. Supplier-Initiated Cancellations',
        content: 'If a supplier cancels a confirmed booking, the user receives a 100% refund plus a ₹200 compensation credit. Repeated supplier cancellations may result in account suspension.'
      },
      {
        heading: '6. How to Cancel',
        content: 'To cancel a booking, go to My Bookings → Select the booking → Click "Cancel Booking". Refunds are processed within 5–7 business days to the original payment method.'
      },
    ]
  },
  refund: {
    title: 'Refund Policy',
    icon: CreditCard,
    lastUpdated: 'August 1, 2026',
    sections: [
      {
        heading: '1. Refund Eligibility',
        content: 'Refunds are issued for: cancelled bookings as per Cancellation Policy; equipment not delivered; equipment significantly different from listing; defective agri products; duplicate payments; payment failures where amount was debited.'
      },
      {
        heading: '2. Refund Timeline',
        content: 'UPI payments: 1–3 business days. Credit/Debit cards: 5–7 business days. Net banking: 3–5 business days. Wallet payments: 1–2 business days. KisanSetu credits: Instant.'
      },
      {
        heading: '3. Security Deposit Refunds',
        content: 'Security deposits for equipment rentals are refunded within 3–5 business days after the equipment is returned and inspected. Deductions may apply for damage beyond normal wear and tear.'
      },
      {
        heading: '4. Non-Refundable Items',
        content: 'The following are non-refundable: convenience fees; delivery charges (unless delivery failed); insurance premiums; platform service fees for completed transactions.'
      },
      {
        heading: '5. Dispute Resolution',
        content: 'If you believe a refund was incorrectly processed, raise a support ticket within 30 days. Our team will investigate and respond within 48 hours. Unresolved disputes can be escalated to our Grievance Officer.'
      },
      {
        heading: '6. Grievance Officer',
        content: 'Name: Priya Mehta. Email: grievance@kisansetu.in. Phone: +91 20-4567-8900. Address: KisanSetu Technologies Pvt. Ltd., 5th Floor, Baner Road, Pune – 411045.'
      },
    ]
  },
  supplier: {
    title: 'Supplier Agreement',
    icon: Store,
    lastUpdated: 'August 1, 2026',
    sections: [
      {
        heading: '1. Supplier Eligibility',
        content: 'To become a KisanSetu supplier, you must: be an Indian resident aged 18+; own or have legal rights to the equipment listed; provide valid Aadhaar, PAN, and bank account details; pass KisanSetu\'s KYC verification process.'
      },
      {
        heading: '2. Listing Obligations',
        content: 'Suppliers must: provide accurate equipment descriptions and photos; keep availability calendars updated; respond to booking requests within 4 hours; maintain equipment in good working condition; honor all confirmed bookings.'
      },
      {
        heading: '3. Commission Structure',
        content: 'KisanSetu charges a platform commission of 8–12% on each successful transaction. The exact rate depends on your supplier tier (Standard: 12%, Silver: 10%, Gold: 8%). Payouts are processed weekly every Monday.'
      },
      {
        heading: '4. Supplier Responsibilities',
        content: 'Suppliers are responsible for: equipment maintenance and safety; providing operators when required; ensuring equipment is insured; complying with local regulations; resolving disputes with users in good faith.'
      },
      {
        heading: '5. Account Suspension',
        content: 'KisanSetu may suspend supplier accounts for: repeated cancellations; false listings; poor ratings (below 3.0); fraud or misrepresentation; violation of these terms. Suspended accounts may appeal within 30 days.'
      },
      {
        heading: '6. Intellectual Property',
        content: 'By listing on KisanSetu, you grant us a non-exclusive license to use your equipment photos and descriptions for marketing purposes. You retain ownership of all content you upload.'
      },
    ]
  }
};

type PolicySlug = keyof typeof POLICIES;

const POLICY_NAV: { slug: PolicySlug; label: string }[] = [
  { slug: 'terms', label: 'Terms of Use' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'cancellation', label: 'Cancellation Policy' },
  { slug: 'refund', label: 'Refund Policy' },
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Policies</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-4 sticky top-24">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3 px-2">Legal Documents</p>
              <nav className="space-y-1">
                {POLICY_NAV.map(item => {
                  const Icon = POLICIES[item.slug].icon;
                  return (
                    <button
                      key={item.slug}
                      onClick={() => setActivePolicy(item.slug)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors text-left ${
                        activePolicy === item.slug
                          ? 'bg-primary/10 text-primary' :'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon size={16} className={activePolicy === item.slug ? 'text-primary' : 'text-muted-foreground'} />
                      {item.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-2xl p-6 lg:p-8">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <PolicyIcon size={24} className="text-primary" />
                </div>
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground">{policy.title}</h1>
                  <p className="text-sm text-muted-foreground mt-0.5">Last updated: {policy.lastUpdated}</p>
                </div>
              </div>

              <div className="space-y-6">
                {policy.sections.map((section, i) => (
                  <div key={i}>
                    <h2 className="text-base font-bold text-foreground mb-2">{section.heading}</h2>
                    <p className="text-sm text-muted-foreground leading-relaxed">{section.content}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  For questions about this policy, contact us at{' '}
                  <a href="mailto:legal@kisansetu.in" className="text-primary hover:underline">legal@kisansetu.in</a>
                  {' '}or call{' '}
                  <a href="tel:18001234526" className="text-primary hover:underline">1800-123-KISAN</a>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
