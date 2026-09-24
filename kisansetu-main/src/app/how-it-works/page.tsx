import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  Search, Calendar, CreditCard, Truck, Star, Shield,
  Users, Package, Tractor, Sprout, ChevronRight, CheckCircle,
  Phone, MessageCircle, HelpCircle
} from 'lucide-react';

const FARMER_STEPS = [
  { icon: Search, step: '01', title: 'Search & Discover', desc: 'Browse 500+ verified equipment, labour, and agri supplies near your farm. Filter by distance, price, and availability.', color: 'bg-primary/10 text-primary' },
  { icon: Calendar, step: '02', title: 'Book Instantly', desc: 'Select your dates, review pricing with zero hidden charges, and confirm your booking in under 2 minutes.', color: 'bg-accent/10 text-accent' },
  { icon: CreditCard, step: '03', title: 'Pay Securely', desc: 'Pay via UPI, card, or net banking through Razorpay. Your deposit is held safely and refunded after return.', color: 'bg-success/10 text-success' },
  { icon: Truck, step: '04', title: 'Get & Return', desc: 'Equipment delivered to your farm or pick up from the supplier. Return after use and get your deposit back within 48 hours.', color: 'bg-warning/10 text-warning' },
];

const SUPPLIER_STEPS = [
  { icon: Package, step: '01', title: 'List Your Equipment', desc: 'Add photos, specs, and pricing. Our team verifies and approves your listing within 24 hours.', color: 'bg-primary/10 text-primary' },
  { icon: Users, step: '02', title: 'Receive Requests', desc: 'Get booking requests from farmers near you. Accept or decline with one tap. You\'re always in control.', color: 'bg-accent/10 text-accent' },
  { icon: CreditCard, step: '03', title: 'Earn Reliably', desc: 'Payments are processed instantly after booking confirmation. Weekly payouts directly to your bank account.', color: 'bg-success/10 text-success' },
  { icon: Star, step: '04', title: 'Build Reputation', desc: 'Earn reviews from farmers. Higher ratings = more bookings. Top suppliers get featured placement.', color: 'bg-warning/10 text-warning' },
];

const FEATURES = [
  { icon: Shield, title: 'Fully Insured', desc: 'All equipment on KisanSetu is covered under our rental insurance policy.' },
  { icon: CheckCircle, title: 'Verified Suppliers', desc: 'Every supplier goes through KYC verification and equipment inspection.' },
  { icon: Phone, title: '24/7 Support', desc: 'Call 1800-123-KISAN anytime. Voice support available in 5 regional languages.' },
  { icon: CreditCard, title: 'Secure Payments', desc: 'Razorpay-powered checkout with UPI, cards, net banking, and EMI options.' },
  { icon: MessageCircle, title: 'Direct Chat', desc: 'Message suppliers directly before booking. No middlemen, no confusion.' },
  { icon: Sprout, title: 'Agri Expertise', desc: 'Our team includes agronomists who can recommend the right equipment for your crop.' },
];

const FAQS = [
  { q: 'What happens if the equipment breaks down during my rental?', a: 'Contact us immediately at 1800-123-KISAN. We will arrange a replacement within 4 hours or issue a full refund for unused days.' },
  { q: 'How is the security deposit refunded?', a: 'After you return the equipment and it passes inspection, the deposit is refunded to your original payment method within 48 hours.' },
  { q: 'Can I cancel a booking?', a: 'Yes. Cancellations made 24+ hours before the start date are fully refunded. Cancellations within 24 hours incur a 10% fee.' },
  { q: 'How do I become a supplier?', a: 'Click "Become a Supplier" in your account menu. Submit your equipment details and KYC documents. Approval takes 24-48 hours.' },
  { q: 'Is there a minimum rental period?', a: 'Most equipment has a 1-day minimum. Some heavy machinery like combine harvesters may have a 2-day minimum.' },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <section className="bg-gradient-to-br from-primary/5 via-background to-accent/5 py-16 px-4">
          <div className="max-w-screen-lg mx-auto text-center">
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-4">How KisanSetu Works</span>
            <h1 className="text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-4">
              Farm smarter.<br />
              <span className="text-primary">Rent, hire, grow.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              KisanSetu connects farmers with equipment suppliers, skilled labour, and agri supplies — all in one platform. No brokers, no delays.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/equipment-listing-page" className="btn-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                <Tractor size={18} /> Browse Equipment
              </Link>
              <Link href="/supplier/onboarding" className="btn-secondary px-6 py-3 rounded-xl font-bold flex items-center gap-2">
                <Package size={18} /> Become a Supplier
              </Link>
            </div>
          </div>
        </section>

        {/* For Farmers */}
        <section className="py-16 px-4">
          <div className="max-w-screen-lg mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-success/10 text-success text-xs font-bold mb-2">FOR FARMERS</span>
              <h2 className="text-3xl font-extrabold text-foreground">Rent equipment in 4 simple steps</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {FARMER_STEPS?.map((s, i) => (
                <div key={s?.step} className="relative">
                  <div className="bg-card rounded-2xl border border-border p-5 h-full">
                    <div className={`w-12 h-12 rounded-2xl ${s?.color} flex items-center justify-center mb-4`}>
                      <s.icon size={22} />
                    </div>
                    <span className="text-xs font-black text-muted-foreground/50 tracking-widest">STEP {s?.step}</span>
                    <h3 className="font-extrabold text-base text-foreground mt-1 mb-2">{s?.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s?.desc}</p>
                  </div>
                  {i < FARMER_STEPS?.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ChevronRight size={20} className="text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* For Suppliers */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-screen-lg mx-auto">
            <div className="text-center mb-10">
              <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-2">FOR SUPPLIERS</span>
              <h2 className="text-3xl font-extrabold text-foreground">Start earning from your equipment</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {SUPPLIER_STEPS?.map((s, i) => (
                <div key={s?.step} className="relative">
                  <div className="bg-card rounded-2xl border border-border p-5 h-full">
                    <div className={`w-12 h-12 rounded-2xl ${s?.color} flex items-center justify-center mb-4`}>
                      <s.icon size={22} />
                    </div>
                    <span className="text-xs font-black text-muted-foreground/50 tracking-widest">STEP {s?.step}</span>
                    <h3 className="font-extrabold text-base text-foreground mt-1 mb-2">{s?.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{s?.desc}</p>
                  </div>
                  {i < SUPPLIER_STEPS?.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                      <ChevronRight size={20} className="text-muted-foreground/40" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust Features */}
        <section className="py-16 px-4">
          <div className="max-w-screen-lg mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-foreground">Why farmers trust KisanSetu</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {FEATURES?.map(f => (
                <div key={f?.title} className="flex gap-4 bg-card rounded-2xl border border-border p-5">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <f.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-foreground mb-1">{f?.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{f?.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-12 px-4 bg-foreground text-white">
          <div className="max-w-screen-lg mx-auto">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
              {[
                { value: '50,000+', label: 'Farmers Served' },
                { value: '2,800+', label: 'Equipment Listed' },
                { value: '18 States', label: 'Pan India Coverage' },
                { value: '₹12 Cr+', label: 'Transactions Processed' },
              ]?.map(s => (
                <div key={s?.label}>
                  <p className="text-3xl font-extrabold text-accent">{s?.value}</p>
                  <p className="text-sm text-white/70 mt-1">{s?.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 px-4">
          <div className="max-w-screen-md mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-extrabold text-foreground flex items-center justify-center gap-2">
                <HelpCircle size={28} className="text-primary" /> Frequently Asked Questions
              </h2>
            </div>
            <div className="space-y-3">
              {FAQS?.map((faq, i) => (
                <details key={i} className="bg-card rounded-2xl border border-border group">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-sm text-foreground list-none">
                    {faq?.q}
                    <ChevronRight size={16} className="text-muted-foreground group-open:rotate-90 transition-transform shrink-0 ml-3" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {faq?.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 px-4 bg-gradient-to-br from-primary/5 to-accent/5">
          <div className="max-w-screen-sm mx-auto text-center">
            <h2 className="text-3xl font-extrabold text-foreground mb-3">Ready to get started?</h2>
            <p className="text-muted-foreground mb-6">Join 50,000+ farmers already using KisanSetu to grow smarter.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link href="/equipment-listing-page" className="btn-primary px-6 py-3 rounded-xl font-bold">Browse Equipment</Link>
              <Link href="/sign-up-login-screen" className="btn-secondary px-6 py-3 rounded-xl font-bold">Create Account</Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
