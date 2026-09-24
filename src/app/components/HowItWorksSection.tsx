import React from 'react';
import Link from 'next/link';

const SECTIONS = [
  {
    id: 'equipment', emoji: '🚜', title: 'Rent Equipment', color: 'border-primary/30 bg-secondary/40',
    steps: ['Search equipment by category, location, or name', 'Filter by price, availability, and distance', 'View details, owner info, and reviews', 'Select rental dates and confirm booking', 'Pay via UPI, Card, or Net Banking', 'Receive handover OTP — collect equipment', 'Return equipment and get deposit refunded'],
  },
  {
    id: 'labour', emoji: '👨‍🌾', title: 'Hire Labour', color: 'border-blue-200 bg-blue-50/40',
    steps: ['Search workers by skill, location, or crop type', 'View profiles, experience, and daily rates', 'Send hire request with work details', 'Labour provider accepts or declines', 'Confirm booking and pay advance if needed', 'Worker arrives at your farm on scheduled date', 'Rate and review after work completion'],
  },
  {
    id: 'agri', emoji: '🌱', title: 'Buy Agri Supplies', color: 'border-amber-200 bg-amber-50/40',
    steps: ['Browse Seeds, Pesticides, Fertilizers by category', 'Filter by crop type, price, and seller rating', 'Add items to cart or buy directly', 'Choose delivery or pickup from nearby store', 'Pay via UPI, Card, or Pay on Delivery', 'Track delivery status in My Orders', 'Rate product after receiving'],
  },
];

export default function HowItWorksSection() {
  return (
    <section className="py-12 bg-background" id="how-it-works">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-10">
          <h2 className="section-title text-3xl mb-2">How It Works</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Three simple workflows for every farming need — designed for Indian farmers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {SECTIONS?.map((section) => (
            <div key={`hiw-${section?.id}`} className={`rounded-2xl border-2 p-6 ${section?.color}`}>
              <div className="flex items-center gap-3 mb-5">
                <span className="text-3xl">{section?.emoji}</span>
                <h3 className="font-bold text-lg text-foreground">{section?.title}</h3>
              </div>
              <ol className="space-y-3">
                {section?.steps?.map((step, i) => (
                  <li key={`hiw-${section?.id}-step-${i + 1}`} className="flex items-start gap-3">
                    <span className="w-5 h-5 rounded-full gradient-green text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                    <span className="text-sm text-foreground leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Link href="/sign-up-login-screen" className="btn-primary px-8 py-3 text-base">Start Farming Smarter →</Link>
        </div>
      </div>
    </section>
  );
}
