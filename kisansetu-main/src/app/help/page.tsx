'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { HelpCircle, MessageSquare, Phone, Mail, ChevronDown, ChevronUp, CheckCircle, Clock, AlertCircle, Send, Search, FileText, Zap, BookOpen, Headphones, ChevronRight } from 'lucide-react';

interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  lastUpdate: string;
  messages: number;
}

const MOCK_TICKETS: Ticket[] = [
  { id: 'TKT-001', subject: 'Equipment not delivered on time', category: 'Booking Issue', status: 'in_progress', priority: 'high', createdAt: '2026-08-08', lastUpdate: '2026-08-10', messages: 3 },
  { id: 'TKT-002', subject: 'Refund not received for cancelled booking', category: 'Payment', status: 'open', priority: 'medium', createdAt: '2026-08-05', lastUpdate: '2026-08-05', messages: 1 },
  { id: 'TKT-003', subject: 'Labour worker did not show up', category: 'Labour', status: 'resolved', priority: 'high', createdAt: '2026-07-28', lastUpdate: '2026-08-01', messages: 5 },
  { id: 'TKT-004', subject: 'Wrong product delivered from Agri store', category: 'Order', status: 'closed', priority: 'low', createdAt: '2026-07-20', lastUpdate: '2026-07-25', messages: 4 },
];

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

const STATUS_COLORS = {
  open: 'text-warning bg-warning/10 border-warning/20',
  in_progress: 'text-info bg-info/10 border-info/20',
  resolved: 'text-success bg-success/10 border-success/20',
  closed: 'text-muted-foreground bg-muted border-border',
};

const PRIORITY_COLORS = {
  low: 'text-muted-foreground',
  medium: 'text-warning',
  high: 'text-danger',
};

type View = 'home' | 'tickets' | 'new_ticket' | 'faq';

export default function HelpPage() {
  const [view, setView] = useState<View>('home');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'Booking Issue', priority: 'medium', description: '' });
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  function handleTicketChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setTicketForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  const filteredFaqs = FAQS.filter(faq =>
    searchQuery === '' || faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (view === 'new_ticket') {
    if (ticketSubmitted) {
      return (
        <div className="min-h-screen bg-background">
          <Header />
          <main className="max-w-lg mx-auto px-4 py-16 text-center">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle size={40} className="text-success" />
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">Ticket Submitted!</h1>
            <p className="text-muted-foreground mb-6">Our support team will respond within <strong>4–6 hours</strong>. You'll receive updates via SMS and email.</p>
            <div className="bg-card border border-border rounded-2xl p-5 text-left mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Ticket ID</span>
                <span className="font-bold text-foreground">TKT-{Math.floor(100 + Math.random() * 900)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-semibold text-foreground truncate max-w-[180px]">{ticketForm.subject}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Category</span>
                <span className="font-semibold text-foreground">{ticketForm.category}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status</span>
                <span className="font-bold text-warning">Open</span>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              <button onClick={() => { setView('tickets'); setTicketSubmitted(false); }}
                className="btn-primary w-full py-3 rounded-xl font-semibold">View My Tickets</button>
              <button onClick={() => { setView('home'); setTicketSubmitted(false); }}
                className="btn-outline w-full py-3 rounded-xl font-semibold">Back to Help</button>
            </div>
          </main>
          <Footer />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronRight size={16} className="rotate-180" /> Back to Help
          </button>
          <h1 className="text-xl font-extrabold text-foreground mb-6">Create Support Ticket</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Subject *</label>
              <input name="subject" value={ticketForm.subject} onChange={handleTicketChange}
                placeholder="Brief description of your issue"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Category *</label>
                <select name="category" value={ticketForm.category} onChange={handleTicketChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['Booking Issue', 'Payment', 'Labour', 'Order', 'Account', 'Technical', 'Other'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Priority</label>
                <select name="priority" value={ticketForm.priority} onChange={handleTicketChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Description *</label>
              <textarea name="description" value={ticketForm.description} onChange={handleTicketChange} rows={5}
                placeholder="Please describe your issue in detail. Include booking IDs, dates, and any relevant information."
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            <button
              onClick={() => setTicketSubmitted(true)}
              disabled={!ticketForm.subject || !ticketForm.description}
              className="w-full btn-primary py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={18} /> Submit Ticket
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (view === 'tickets') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-3xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <button onClick={() => setView('home')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-2">
                <ChevronRight size={16} className="rotate-180" /> Back
              </button>
              <h1 className="text-xl font-extrabold text-foreground">My Support Tickets</h1>
            </div>
            <button onClick={() => setView('new_ticket')} className="btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
              <MessageSquare size={16} /> New Ticket
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_TICKETS.map(ticket => (
              <div key={ticket.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="font-bold text-foreground">{ticket.subject}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{ticket.id} · {ticket.category}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_COLORS[ticket.status]}`}>
                    {ticket.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <AlertCircle size={12} className={PRIORITY_COLORS[ticket.priority]} />
                    <span className={`font-semibold capitalize ${PRIORITY_COLORS[ticket.priority]}`}>{ticket.priority}</span> priority
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare size={12} /> {ticket.messages} messages
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock size={12} /> Updated {ticket.lastUpdate}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Home view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-foreground mb-2">How can we help you?</h1>
          <p className="text-muted-foreground mb-6">Search our help center or contact our support team</p>
          <div className="relative max-w-md mx-auto">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); if (e.target.value) setView('faq'); }}
              placeholder="Search for help..."
              className="w-full pl-11 pr-4 py-3.5 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { icon: MessageSquare, label: 'My Tickets', sub: `${MOCK_TICKETS.filter(t => t.status !== 'closed').length} active`, action: () => setView('tickets'), color: 'text-primary bg-primary/10' },
            { icon: FileText, label: 'New Ticket', sub: 'Report an issue', action: () => setView('new_ticket'), color: 'text-warning bg-warning/10' },
            { icon: BookOpen, label: 'FAQs', sub: `${FAQS.length} articles`, action: () => setView('faq'), color: 'text-success bg-success/10' },
            { icon: Headphones, label: 'Call Support', sub: '1800-123-KISAN', action: () => {}, color: 'text-info bg-info/10' },
          ].map(item => (
            <button key={item.label} onClick={item.action}
              className="bg-card border border-border rounded-2xl p-5 text-center hover:border-primary/30 hover:shadow-sm transition-all group">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${item.color}`}>
                <item.icon size={22} />
              </div>
              <p className="font-bold text-sm text-foreground">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{item.sub}</p>
            </button>
          ))}
        </div>

        {/* Contact Options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { icon: Phone, label: 'Call Us', value: '1800-123-KISAN', sub: 'Mon–Sat, 8am–8pm', color: 'text-success' },
            { icon: Mail, label: 'Email Us', value: 'support@kisansetu.in', sub: 'Response within 4 hours', color: 'text-primary' },
            { icon: Zap, label: 'Live Chat', value: 'Chat Now', sub: 'Available 24/7', color: 'text-warning' },
          ].map(contact => (
            <div key={contact.label} className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-muted flex items-center justify-center shrink-0`}>
                <contact.icon size={22} className={contact.color} />
              </div>
              <div>
                <p className="font-bold text-sm text-foreground">{contact.label}</p>
                <p className={`text-sm font-semibold ${contact.color}`}>{contact.value}</p>
                <p className="text-xs text-muted-foreground">{contact.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* FAQs */}
        <div id="faq">
          <h2 className="text-xl font-extrabold text-foreground mb-5">Frequently Asked Questions</h2>
          <div className="space-y-2">
            {(view === 'faq' ? filteredFaqs : FAQS.slice(0, 5)).map((faq, i) => (
              <div key={i} className="bg-card border border-border rounded-xl overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="font-semibold text-sm text-foreground pr-4">{faq.q}</span>
                  {openFaq === i ? <ChevronUp size={18} className="text-muted-foreground shrink-0" /> : <ChevronDown size={18} className="text-muted-foreground shrink-0" />}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
          {view !== 'faq' && (
            <button onClick={() => setView('faq')} className="mt-4 text-sm text-primary font-semibold hover:underline">
              View all {FAQS.length} FAQs →
            </button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
