'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, CheckCircle, Send, Search, BookOpen, Headphones } from 'lucide-react';

const FAQS = [
  { q: 'How do I book equipment?', a: 'Browse equipment on the Equipment page, select your dates, and click "Rent Now". Complete the payment via Razorpay to confirm your booking.' },
  { q: 'What is the cancellation policy?', a: 'You can cancel up to 24 hours before the booking start date for a full refund. Cancellations within 24 hours are subject to a 20% cancellation fee.' },
  { q: 'How do I become a supplier?', a: 'Click "Become a Supplier" in the header or visit /supplier/onboarding. Complete the 4-step verification process and start listing your equipment.' },
  { q: 'How are payments processed?', a: 'All payments are processed securely via Razorpay. We support UPI, credit/debit cards, net banking, and EMI options.' },
  { q: 'What if the equipment is damaged?', a: 'Report damage immediately via the booking page. KisanSetu has a dispute resolution process and insurance coverage for verified damage claims.' },
  { q: 'How do I hire labour workers?', a: 'Visit the Labour page, browse workers by skill and location, and send a hire request. Workers respond within 1 hour on average.' },
  { q: 'Is there a security deposit?', a: 'Yes, a refundable security deposit is collected for equipment rentals. It is returned within 3–5 business days after the equipment is returned in good condition.' },
  { q: 'How do I track my order?', a: 'Go to My Bookings in your account. Each booking has a status timeline and a "Track Order" button for active rentals.' },
];

type View = 'home' | 'faq' | 'new_ticket';

export default function HelpPage() {
  const [view, setView] = useState<View>('home');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Booking Issue', description: '' });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  const filteredFaqs = FAQS.filter(faq => searchQuery === '' || faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase()));

  if (view === 'new_ticket' && ticketSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-success" /></div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Ticket Submitted!</h1>
          <p className="text-muted-foreground mb-6">Our support team will respond within <strong>4–6 hours</strong>.</p>
          <button onClick={() => { setView('home'); setTicketSubmitted(false); setTicketForm({ subject: '', category: 'Booking Issue', description: '' }); }} className="btn-primary w-full py-3 rounded-xl font-semibold">Back to Help</button>
        </main>
        <Footer />
      </div>
    );
  }

  if (view === 'new_ticket') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">← Back to Help</button>
          <h1 className="text-xl font-extrabold text-foreground mb-6">Create Support Ticket</h1>
          <div className="space-y-4">
            <div><label className="block text-sm font-semibold text-foreground mb-1.5">Subject *</label><input value={ticketForm.subject} onChange={e => setTicketForm(prev => ({ ...prev, subject: e.target.value }))} placeholder="Brief description of your issue" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" /></div>
            <div><label className="block text-sm font-semibold text-foreground mb-1.5">Category *</label>
              <select value={ticketForm.category} onChange={e => setTicketForm(prev => ({ ...prev, category: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {['Booking Issue', 'Payment', 'Labour', 'Order', 'Account', 'Technical', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="block text-sm font-semibold text-foreground mb-1.5">Description *</label><textarea value={ticketForm.description} onChange={e => setTicketForm(prev => ({ ...prev, description: e.target.value }))} rows={5} placeholder="Please describe your issue in detail..." className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" /></div>
            <button onClick={() => setTicketSubmitted(true)} disabled={!ticketForm.subject || !ticketForm.description} className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"><Send size={18} /> Submit Ticket</button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4"><HelpCircle size={32} className="text-primary" /></div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">How can we help you?</h1>
          <p className="text-muted-foreground mb-6">Search our help center or contact our support team</p>
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={searchQuery} onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setView('faq'); }} placeholder="Search for help..." className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: MessageSquare, label: 'New Ticket', sub: 'Report an issue', action: () => setView('new_ticket'), color: 'text-warning bg-warning/10' },
            { icon: BookOpen, label: 'FAQs', sub: `${FAQS.length} articles`, action: () => setView('faq'), color: 'text-success bg-success/10' },
            { icon: Headphones, label: 'Call Support', sub: '1800-123-KISAN', action: () => {}, color: 'text-info bg-info/10' },
            { icon: Mail, label: 'Email Us', sub: 'support@kisansetu.in', action: () => {}, color: 'text-primary bg-primary/10' },
          ].map(item => (
            <button key={item.label} onClick={item.action} className="bg-card border border-border rounded-2xl p-5 text-center hover:border-primary/30 hover:shadow-sm transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${item.color}`}><item.icon size={22} /></div>
              <p className="font-bold text-sm text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>

        <div>
          <h2 className="text-xl font-extrabold text-foreground mb-5 flex items-center gap-2"><HelpCircle size={20} className="text-primary" /> Frequently Asked Questions</h2>
          <div className="space-y-3">
            {(view === 'faq' ? filteredFaqs : FAQS.slice(0, 5)).map((faq, i) => (
              <div key={i} className="bg-card rounded-2xl border border-border overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between px-5 py-4 text-left font-semibold text-sm text-foreground">
                  {faq.q}
                  {openFaq === i ? <ChevronUp size={16} className="text-muted-foreground shrink-0 ml-3" /> : <ChevronDown size={16} className="text-muted-foreground shrink-0 ml-3" />}
                </button>
                {openFaq === i && <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">{faq.a}</div>}
              </div>
            ))}
          </div>
          {view !== 'faq' && <button onClick={() => setView('faq')} className="mt-4 text-sm text-primary font-semibold hover:underline">View all {FAQS.length} FAQs →</button>}
        </div>

        <div className="mt-10 bg-gradient-to-r from-primary/5 to-accent/5 rounded-2xl p-6 text-center">
          <h3 className="font-bold text-foreground mb-2">Still need help?</h3>
          <p className="text-sm text-muted-foreground mb-4">Our support team is available 24/7 to assist you.</p>
          <div className="flex flex-wrap gap-3 justify-center">
            <a href="tel:18001234526" className="flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl"><Phone size={16} /> Call 1800-123-KISAN</a>
            <button onClick={() => setView('new_ticket')} className="flex items-center gap-2 btn-secondary px-5 py-2.5 rounded-xl"><MessageSquare size={16} /> Create Ticket</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
