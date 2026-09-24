'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { Star, MapPin, Phone, MessageSquare, Heart, Share2, ChevronLeft, CheckCircle, IndianRupee, Shield, Award, Languages, Briefcase, Users, AlertTriangle, ChevronRight } from 'lucide-react';
import RazorpayCheckout from '@/components/RazorpayCheckout';

const WORKER = {
  id: 'lab-001',
  name: 'Ramesh Yadav',
  role: 'Harvesting Worker',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1579523d5-1763293623618.png',
  imageAlt: 'Indian male farm worker in his 30s wearing a blue shirt with confident expression',
  ratePerDay: 500,
  rating: 4.6,
  reviews: 89,
  location: 'Hadapsar, Pune',
  distance: 1.8,
  skills: ['Harvesting', 'Threshing', 'Winnowing', 'Crop Cutting', 'Bundling'],
  experience: '6 years',
  available: true,
  category: 'Harvesting',
  gender: 'male' as const,
  languages: ['Hindi', 'Marathi'],
  bio: 'Experienced harvesting worker with 6 years of expertise in paddy, wheat, and sugarcane harvesting. Reliable, punctual, and skilled with both manual and mechanized harvesting tools.',
  completedJobs: 234,
  repeatClients: 67,
  responseTime: '< 1 hour',
  verified: true,
  aadhaarVerified: true,
  reviews_list: [
    { name: 'Suresh Patil', rating: 5, date: '2026-07-15', comment: 'Excellent worker, very punctual and efficient. Completed the paddy harvest in record time.' },
    { name: 'Kavita Sharma', rating: 4, date: '2026-06-28', comment: 'Good work, knows his craft well. Would hire again for next season.' },
    { name: 'Mohan Kulkarni', rating: 5, date: '2026-06-10', comment: 'Very professional. Brought his own tools and worked without supervision.' },
  ]
};

type Step = 'details' | 'form' | 'confirm' | 'success';

export default function LabourDetailPage() {
  const [step, setStep] = useState<Step>('details');
  const [wishlist, setWishlist] = useState(false);
  const [paymentError, setPaymentError] = useState('');
  const [form, setForm] = useState({
    startDate: '',
    days: '1',
    workType: 'Harvesting',
    location: '',
    notes: '',
    workers: '1',
    contactName: '',
    contactPhone: '',
  });
  const [bookingId] = useState('LBR' + Math.floor(100000 + Math.random() * 900000));

  const totalCost = WORKER.ratePerDay * parseInt(form.days || '1') * parseInt(form.workers || '1');

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Hire Request Sent!</h1>
          <p className="text-muted-foreground mb-6">
            Your request has been sent to <strong>{WORKER.name}</strong>. You'll get a confirmation within 1 hour.
          </p>
          <div className="bg-card border border-border rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Booking ID</span>
              <span className="font-bold text-foreground">{bookingId}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Worker</span>
              <span className="font-semibold text-foreground">{WORKER.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Start Date</span>
              <span className="font-semibold text-foreground">{form.startDate}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Duration</span>
              <span className="font-semibold text-foreground">{form.days} day(s)</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Workers</span>
              <span className="font-semibold text-foreground">{form.workers}</span>
            </div>
            <div className="border-t border-border pt-3 flex justify-between">
              <span className="font-semibold text-foreground">Total Amount</span>
              <span className="font-extrabold text-primary text-lg">₹{totalCost.toLocaleString('en-IN')}</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/account/bookings" className="btn-primary w-full py-3 rounded-xl font-semibold text-center block">
              View My Bookings
            </Link>
            <Link href="/labour" className="btn-outline w-full py-3 rounded-xl font-semibold text-center block">
              Browse More Workers
            </Link>
          </div>
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
          <button onClick={() => setStep('form')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Back
          </button>
          <h1 className="text-xl font-extrabold text-foreground mb-6">Confirm Hire Request</h1>

          <div className="bg-card border border-border rounded-2xl p-5 mb-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
              <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0">
                <AppImage src={WORKER.image} alt={WORKER.imageAlt} className="w-full h-full object-cover" />
              </div>
              <div>
                <p className="font-bold text-foreground">{WORKER.name}</p>
                <p className="text-sm text-muted-foreground">{WORKER.role}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} className="text-warning fill-warning" />
                  <span className="text-xs font-semibold">{WORKER.rating}</span>
                  <span className="text-xs text-muted-foreground">({WORKER.reviews} reviews)</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Work Type</span><span className="font-semibold">{form.workType}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Start Date</span><span className="font-semibold">{form.startDate}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold">{form.days} day(s)</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Workers Needed</span><span className="font-semibold">{form.workers}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Location</span><span className="font-semibold">{form.location || 'Not specified'}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Rate/Day/Worker</span><span className="font-semibold">₹{WORKER.ratePerDay}</span></div>
              <div className="border-t border-border pt-3 flex justify-between">
                <span className="font-bold text-foreground">Total Estimate</span>
                <span className="font-extrabold text-primary text-lg">₹{totalCost.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-6 flex gap-3">
            <AlertTriangle size={18} className="text-warning shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">Payment is collected securely via Razorpay. Complete payment to confirm your hire request.</p>
          </div>

          {paymentError && (
            <div className="bg-danger/10 border border-danger/20 rounded-xl p-4 mb-4 flex gap-3">
              <AlertTriangle size={18} className="text-danger shrink-0 mt-0.5" />
              <p className="text-sm text-danger">{paymentError}</p>
            </div>
          )}

          <RazorpayCheckout
            amount={totalCost}
            receipt={bookingId}
            description={`Labour hire: ${WORKER.name} – ${form.days} day(s)`}
            buttonText="Pay & Confirm Hire"
            notes={{
              worker: WORKER.name,
              workType: form.workType,
              startDate: form.startDate,
              days: form.days,
              workers: form.workers,
              location: form.location,
            }}
            prefill={{
              name: form.contactName,
              contact: form.contactPhone,
            }}
            onSuccess={() => {
              setPaymentError('');
              setStep('success');
            }}
            onError={(err) => {
              setPaymentError(err);
            }}
            onDismiss={() => setPaymentError('')}
          />
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
          <button onClick={() => setStep('details')} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6">
            <ChevronLeft size={16} /> Back to Profile
          </button>
          <h1 className="text-xl font-extrabold text-foreground mb-6">Hire Request Form</h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Work Type *</label>
              <select name="workType" value={form.workType} onChange={handleFormChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {WORKER.skills.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Start Date *</label>
                <input type="date" name="startDate" value={form.startDate} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Duration (Days) *</label>
                <select name="days" value={form.days} onChange={handleFormChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {[1,2,3,4,5,6,7,10,14,21,30].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Number of Workers *</label>
              <select name="workers" value={form.workers} onChange={handleFormChange}
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {[1,2,3,4,5,6,8,10].map(n => <option key={n} value={n}>{n} worker{n > 1 ? 's' : ''}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Farm Location / Address *</label>
              <input type="text" name="location" value={form.location} onChange={handleFormChange}
                placeholder="e.g. Survey No. 45, Hadapsar, Pune"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Your Name *</label>
              <input type="text" name="contactName" value={form.contactName} onChange={handleFormChange}
                placeholder="Full name"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Contact Phone *</label>
              <input type="tel" name="contactPhone" value={form.contactPhone} onChange={handleFormChange}
                placeholder="+91 XXXXX XXXXX"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Special Instructions (Optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleFormChange} rows={3}
                placeholder="Any specific requirements, tools needed, crop type, etc."
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center">
              <div>
                <p className="text-sm text-muted-foreground">Estimated Total</p>
                <p className="text-2xl font-extrabold text-primary">₹{totalCost.toLocaleString('en-IN')}</p>
                <p className="text-xs text-muted-foreground">₹{WORKER.ratePerDay} × {form.days} day(s) × {form.workers} worker(s)</p>
              </div>
              <IndianRupee size={32} className="text-primary/30" />
            </div>

            <button
              onClick={() => setStep('confirm')}
              disabled={!form.startDate || !form.location || !form.contactName || !form.contactPhone}
              className="w-full btn-primary py-3.5 rounded-xl font-bold text-base disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review & Confirm
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Details view
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/labour" className="hover:text-primary">Labour</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{WORKER.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Card */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-primary/20">
                  <AppImage src={WORKER.image} alt={WORKER.imageAlt} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-extrabold text-foreground">{WORKER.name}</h1>
                        {WORKER.verified && (
                          <span className="flex items-center gap-1 text-xs font-semibold text-success bg-success/10 px-2 py-0.5 rounded-full">
                            <Shield size={11} /> Verified
                          </span>
                        )}
                      </div>
                      <p className="text-muted-foreground text-sm mt-0.5">{WORKER.role}</p>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-warning fill-warning" />
                          <span className="font-bold text-sm">{WORKER.rating}</span>
                          <span className="text-xs text-muted-foreground">({WORKER.reviews})</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <MapPin size={13} className="text-primary" />
                          {WORKER.location} · {WORKER.distance} km
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => setWishlist(!wishlist)}
                        className={`p-2.5 rounded-xl border transition-colors ${wishlist ? 'bg-danger/10 border-danger/30 text-danger' : 'border-border hover:bg-muted text-muted-foreground'}`}>
                        <Heart size={18} className={wishlist ? 'fill-danger' : ''} />
                      </button>
                      <button className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors">
                        <Share2 size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-3">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${WORKER.available ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {WORKER.available ? '● Available Now' : '● Unavailable'}
                    </span>
                    <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                      Responds in {WORKER.responseTime}
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-sm text-muted-foreground mt-4 leading-relaxed">{WORKER.bio}</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Jobs Done', value: WORKER.completedJobs, icon: Briefcase },
                { label: 'Repeat Clients', value: `${WORKER.repeatClients}%`, icon: Users },
                { label: 'Experience', value: WORKER.experience, icon: Award },
              ].map(stat => (
                <div key={stat.label} className="bg-card border border-border rounded-xl p-4 text-center">
                  <stat.icon size={20} className="text-primary mx-auto mb-2" />
                  <p className="text-xl font-extrabold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Skills */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground mb-3">Skills & Expertise</h2>
              <div className="flex flex-wrap gap-2">
                {WORKER.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 bg-primary/10 text-primary text-sm font-medium rounded-lg">{skill}</span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Languages size={18} className="text-primary" /> Languages
              </h2>
              <div className="flex gap-2 flex-wrap">
                {WORKER.languages.map(lang => (
                  <span key={lang} className="px-3 py-1.5 bg-muted text-foreground text-sm font-medium rounded-lg">{lang}</span>
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card border border-border rounded-2xl p-5">
              <h2 className="font-bold text-foreground mb-4">Reviews ({WORKER.reviews})</h2>
              <div className="space-y-4">
                {WORKER.reviews_list.map((rev, i) => (
                  <div key={i} className={`pb-4 ${i < WORKER.reviews_list.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="font-semibold text-sm text-foreground">{rev.name}</p>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) => (
                          <Star key={j} size={12} className={j < rev.rating ? 'text-warning fill-warning' : 'text-muted-foreground'} />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">{rev.date}</p>
                    <p className="text-sm text-foreground">{rev.comment}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Booking Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 bg-card border border-border rounded-2xl p-5 shadow-md">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <span className="text-2xl font-extrabold text-foreground">₹{WORKER.ratePerDay}</span>
                  <span className="text-muted-foreground text-sm">/day/worker</span>
                </div>
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-warning fill-warning" />
                  <span className="font-bold text-sm">{WORKER.rating}</span>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle size={16} className="text-success shrink-0" />
                  Aadhaar Verified Worker
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle size={16} className="text-success shrink-0" />
                  No advance payment required
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle size={16} className="text-success shrink-0" />
                  Pay after work completion
                </div>
                <div className="flex items-center gap-2.5 text-sm text-foreground">
                  <CheckCircle size={16} className="text-success shrink-0" />
                  KisanSetu dispute protection
                </div>
              </div>

              <button
                onClick={() => setStep('form')}
                disabled={!WORKER.available}
                className="w-full btn-primary py-3.5 rounded-xl font-bold text-base mb-3 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {WORKER.available ? 'Send Hire Request' : 'Currently Unavailable'}
              </button>

              <div className="grid grid-cols-2 gap-2">
                <a href={`tel:+919876543210`}
                  className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-semibold text-foreground">
                  <Phone size={15} /> Call
                </a>
                <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border hover:bg-muted transition-colors text-sm font-semibold text-foreground">
                  <MessageSquare size={15} /> Message
                </button>
              </div>

              <div className="mt-4 pt-4 border-t border-border text-center">
                <p className="text-xs text-muted-foreground">
                  🔒 Secure hiring via KisanSetu. Worker identity verified.
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
