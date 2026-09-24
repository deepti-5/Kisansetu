import React from 'react';

const FEATURES = [
  { id: 'multilingual', emoji: '🗣️', title: 'Multilingual', desc: '9 Indian Languages', detail: 'English, Hindi, Marathi, Kannada, Telugu, Tamil, Malayalam, Gujarati, Bengali' },
  { id: 'voice', emoji: '🎙️', title: 'Voice Help', desc: 'How to use KisanSetu', detail: 'Ask questions like "How do I rent a tractor?" in your language' },
  { id: 'notifications', emoji: '🔔', title: 'Live Notifications', desc: 'Real-time updates', detail: 'Booking confirmations, payment alerts, labour acceptance — instant' },
  { id: 'location', emoji: '📍', title: 'Location Based', desc: 'Nearby search', detail: 'Find equipment, labour, and supplies within your radius' },
  { id: 'payments', emoji: '🔒', title: 'Secure Payments', desc: '100% Safe & Secure', detail: 'Razorpay-powered: UPI, Cards, Net Banking, Pay on Delivery' },
  { id: 'support', emoji: '💬', title: '24/7 Support', desc: 'We are here to help', detail: 'Toll-free helpline, in-app chat, ticket system — always available' },
];

export default function KeyFeaturesSection() {
  return (
    <section className="py-12 bg-muted/30">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="text-center mb-8">
          <h2 className="section-title text-2xl mb-1">Other Key Features</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {FEATURES?.map((feat) => (
            <div key={`feat-${feat?.id}`} className="card-base p-4 text-center hover:border-primary/40 hover:shadow-card-hover transition-all duration-200 group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform duration-200">{feat?.emoji}</div>
              <h4 className="font-bold text-sm text-foreground mb-0.5">{feat?.title}</h4>
              <p className="text-xs font-semibold text-primary mb-1">{feat?.desc}</p>
              <p className="text-xs text-muted-foreground leading-relaxed hidden md:block">{feat?.detail}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
