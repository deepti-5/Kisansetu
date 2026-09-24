'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { Star, MapPin, Phone, Heart, ChevronLeft, CheckCircle, Shield, AlertTriangle, ChevronRight, MessageCircle } from 'lucide-react';
import RazorpayCheckout from '@/components/RazorpayCheckout';
import MessagingModal from '@/components/MessagingModal';

const WORKER = {
  id: 'lab-001', name: 'Ramesh Yadav', role: 'Harvesting Worker',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_19b54ab7f-1772435023997.png',
  imageAlt: 'Indian male farm worker in his 30s wearing a blue shirt with confident expression',
  ratePerDay: 500, rating: 4.6, reviews: 89, location: 'Hadapsar, Pune', distance: 1.8,
  skills: ['Harvesting', 'Threshing', 'Winnowing', 'Crop Cutting', 'Bundling'],
  experience: '6 years', available: true, bio: 'Experienced harvesting worker with 6 years of expertise in paddy, wheat, and sugarcane harvesting.',
  completedJobs: 234, verified: true, languages: ['Hindi', 'Marathi'],
};

type Step = 'details' | 'form' | 'confirm' | 'success';

export default function LabourDetailPage() {
  const [step, setStep] = useState<Step>('details');
  const [wishlist, setWishlist] = useState(false);
  const [messagingOpen, setMessagingOpen] = useState(false);
  const [form, setForm] = useState({ startDate: '', days: '1', workType: 'Harvesting', location: '', notes: '', workers: '1', contactName: '', contactPhone: '' });
  const [bookingId] = useState('LBR' + Math.floor(100000 + Math.random() * 900000));

  const totalCost = WORKER.ratePerDay * parseInt(form.days || '1') * parseInt(form.workers || '1');

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-success" /></div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Hire Request Sent!</h1>
          <p className="text-muted-foreground mb-6">Your request has been sent to <strong>{WORKER.name}</strong>. You&apos;ll get a confirmation within 1 hour.</p>
          <div className="bg-card border border-border rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booking ID</span><span className="font-bold text-foreground">{bookingId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Worker</span><span className="font-semibold text-foreground">{WORKER.name}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Start Date</span><span className="font-semibold text-foreground">{form.startDate}</span></div>
            <div className="border-t border-border pt-3 flex justify-between"><span className="font-semibold text-foreground">Total Amount</span><span className="font-extrabold text-primary text-lg">₹{totalCost.toLocaleString('en-IN')}</span></div>
          </div>
          <Link href="/account/bookings" className="btn-primary w-full py-3 rounded-xl font-semibold text-center block">View My Bookings</Link>
        </main>
        <Footer />
      </div>
    );
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => setStep('form')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ChevronLeft size={16} /> Back</button>
          <h1 className="text-xl font-extrabold text-foreground mb-6">Confirm Hire Request</h1>
          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Worker</span><span className="font-semibold">{WORKER.name}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Work Type</span><span className="font-semibold">{form.workType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start Date</span><span className="font-semibold">{form.startDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{form.days} day(s)</span></div>
              <div className="border-t border-border pt-3 flex justify-between"><span className="font-bold text-foreground">Total Estimate</span><span className="font-extrabold text-primary text-lg">₹{totalCost.toLocaleString('en-IN')}</span></div>
            </div>
          </div>
          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 flex gap-3">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">Payment is collected securely via Razorpay.</p>
          </div>
          <RazorpayCheckout amount={totalCost} receipt={bookingId} description={`Labour hire: ${WORKER.name} – ${form.days} day(s)`} buttonText="Pay & Confirm Hire" notes={{ worker: WORKER.name, workType: form.workType, startDate: form.startDate, days: form.days }} prefill={{ name: form.contactName, contact: form.contactPhone }} onSuccess={() => setStep('success')} onError={(err) => console.error(err)} onDismiss={() => {}} />
        </main>
        <Footer />
      </div>
    );
  }

  if (step === 'form') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-8">
          <button onClick={() => setStep('details')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6"><ChevronLeft size={16} /> Back to Profile</button>
          <h1 className="text-xl font-extrabold text-foreground mb-6">Hire Request Form</h1>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Work Type *</label>
              <select name="workType" value={form.workType} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {WORKER.skills.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Start Date *</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Duration (Days) *</label>
                <select name="days" value={form.days} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[1, 2, 3, 4, 5, 7, 10, 14].map((d) => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Number of Workers *</label>
              <select name="workers" value={form.workers} onChange={handleFormChange} className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n} worker{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Farm Location *</label>
              <input type="text" name="location" value={form.location} onChange={handleFormChange} placeholder="e.g. Survey No. 45, Hadapsar, Pune" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Your Name *</label>
              <input type="text" name="contactName" value={form.contactName} onChange={handleFormChange} placeholder="Full name" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Your Phone *</label>
              <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleFormChange} placeholder="+91 XXXXX XXXXX" className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="bg-secondary/60 rounded-xl p-4 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Estimated Cost</span><span className="font-bold text-primary text-lg">₹{totalCost.toLocaleString('en-IN')}</span></div>
            </div>
            <button onClick={() => setStep('confirm')} disabled={!form.startDate || !form.location || !form.contactName || !form.contactPhone} className="w-full btn-primary py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">Review & Pay <ChevronRight size={18} className="inline" /></button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-lg mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/labour" className="hover:text-primary">Labour</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{WORKER.name}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start gap-5">
                <div className="relative shrink-0">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-border">
                    <AppImage src={WORKER.image} alt={WORKER.imageAlt} width={96} height={96} className="object-cover w-full h-full" />
                  </div>
                  {WORKER.available && <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-success border-2 border-card" />}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className="text-2xl font-extrabold text-foreground">{WORKER.name}</h1>
                      <p className="text-muted-foreground">{WORKER.role}</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => setWishlist(!wishlist)} className={`p-2.5 rounded-xl border transition-all ${wishlist ? 'border-danger bg-danger/10 text-danger' : 'border-border hover:bg-muted text-muted-foreground'}`}><Heart size={18} className={wishlist ? 'fill-danger' : ''} /></button>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 mt-2 flex-wrap">
                    <div className="flex items-center gap-1"><Star size={14} className="text-accent fill-accent" /><span className="font-bold text-sm">{WORKER.rating}</span><span className="text-sm text-muted-foreground">({WORKER.reviews} reviews)</span></div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={13} className="text-primary" />{WORKER.location} · {WORKER.distance} km</div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-5 pt-5 border-t border-border">
                <div className="text-center"><p className="text-xl font-bold text-foreground">{WORKER.completedJobs}</p><p className="text-xs text-muted-foreground">Jobs Done</p></div>
                <div className="text-center"><p className="text-xl font-bold text-foreground">{WORKER.experience}</p><p className="text-xs text-muted-foreground">Experience</p></div>
                <div className="text-center"><p className="text-xl font-bold text-foreground">{WORKER.languages.length}</p><p className="text-xs text-muted-foreground">Languages</p></div>
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-3">About</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{WORKER.bio}</p>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">{WORKER.skills.map(s => <span key={s} className="badge-green text-sm">{s}</span>)}</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-20">
              <div className="text-center mb-4">
                <p className="text-3xl font-extrabold text-primary">₹{WORKER.ratePerDay}</p>
                <p className="text-sm text-muted-foreground">per day per worker</p>
              </div>
              <div className="space-y-2 mb-5">
                {WORKER.verified && <div className="flex items-center gap-2 text-sm text-success"><Shield size={14} /><span>Aadhaar Verified</span></div>}
                <div className="flex items-center gap-2 text-sm text-foreground"><Star size={14} className="text-accent" /><span>{WORKER.rating} rating · {WORKER.reviews} reviews</span></div>
              </div>
              <button onClick={() => setStep('form')} disabled={!WORKER.available} className={`w-full py-3.5 rounded-xl font-bold text-base mb-3 ${WORKER.available ? 'btn-primary' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                {WORKER.available ? 'Hire Now' : 'Currently Unavailable'}
              </button>
              <button onClick={() => setMessagingOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-primary/10 border-2 border-primary/30 text-primary font-semibold hover:bg-primary/20 transition-colors mb-3">
                <MessageCircle size={16} />Message Worker
              </button>
              <a href={`tel:+911800123KISAN`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-primary text-primary font-semibold hover:bg-secondary transition-colors"><Phone size={16} />Call Worker</a>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Messaging Modal */}
      <MessagingModal
        isOpen={messagingOpen}
        onClose={() => setMessagingOpen(false)}
        listingType="labour"
        listingId={WORKER.id}
        listingName={`${WORKER.name} – ${WORKER.role}`}
        listingImage={WORKER.image}
        providerId={WORKER.id}
        providerName={WORKER.name}
      />
    </div>
  );
}
