'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { User, Store, FileText, CheckCircle, ChevronRight, Tractor, Package, Sprout, Wrench } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

const STEPS = [{ num: 1, label: 'Personal Info', icon: User }, { num: 2, label: 'Business Details', icon: Store }, { num: 3, label: 'Documents', icon: FileText }, { num: 4, label: 'Review & Submit', icon: CheckCircle }];
const EQUIPMENT_CATEGORIES = [{ id: 'tractor', label: 'Tractors', icon: Tractor }, { id: 'harvester', label: 'Harvesters', icon: Package }, { id: 'irrigation', label: 'Irrigation', icon: Sprout }, { id: 'tillage', label: 'Tillage', icon: Wrench }, { id: 'sprayer', label: 'Sprayers', icon: Package }, { id: 'planting', label: 'Planting', icon: Sprout }];

export default function SupplierOnboarding() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);
  const [personal, setPersonal] = useState({ fullName: '', phone: '', email: '', aadhaar: '', pan: '', city: '', state: '', pincode: '' });
  const [business, setBusiness] = useState({ businessName: '', businessType: 'individual', categories: [] as string[], description: '' });
  const [docs, setDocs] = useState({ aadhaarUploaded: false, panUploaded: false, bankProofUploaded: false, photoUploaded: false });

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-success" /></div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground mb-6">Your supplier application is under review. We&apos;ll activate your account within <strong>24–48 hours</strong>.</p>
          <div className="bg-card border border-border rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Application ID</span><span className="font-bold text-foreground">SUP-{Math.floor(100000 + Math.random() * 900000)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Name</span><span className="font-semibold text-foreground">{personal.fullName || 'Rajesh Patil'}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Status</span><span className="font-bold text-warning">Under Review</span></div>
          </div>
          <Link href="/supplier/dashboard" className="btn-primary w-full py-3 rounded-xl font-semibold text-center block">Go to Supplier Dashboard</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Become a Supplier</h1>
          <p className="text-muted-foreground">List your equipment and start earning. Setup takes less than 5 minutes.</p>
        </div>
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${step > s.num ? 'bg-success text-white' : step === s.num ? 'bg-primary text-white shadow-lg' : 'bg-muted text-muted-foreground'}`}>
                  {step > s.num ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s.num ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > s.num ? 'bg-success' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[{ name: 'fullName', label: 'Full Name *', placeholder: 'As per Aadhaar' }, { name: 'phone', label: 'Mobile Number *', placeholder: '+91 XXXXX XXXXX' }, { name: 'email', label: 'Email Address', placeholder: 'your@email.com' }, { name: 'aadhaar', label: 'Aadhaar Number *', placeholder: 'XXXX XXXX XXXX' }, { name: 'city', label: 'City *', placeholder: 'Pune' }, { name: 'pincode', label: 'Pincode *', placeholder: '411001' }].map(f => (
                <div key={f.name}>
                  <label className="block text-sm font-semibold text-foreground mb-1.5">{f.label}</label>
                  <input name={f.name} value={(personal as any)[f.name]} onChange={e => setPersonal(prev => ({ ...prev, [e.target.name]: e.target.value }))} placeholder={f.placeholder} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="w-full btn-primary py-3.5 rounded-xl font-bold mt-2">Continue <ChevronRight size={18} className="inline" /></button>
          </div>
        )}

        {step === 2 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Business Details</h2>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Business / Farm Name *</label>
              <input name="businessName" value={business.businessName} onChange={e => setBusiness(prev => ({ ...prev, businessName: e.target.value }))} placeholder="e.g. Patil Farm Equipment" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Equipment Categories You Offer *</label>
              <div className="grid grid-cols-3 gap-2">
                {EQUIPMENT_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => setBusiness(prev => ({ ...prev, categories: prev.categories.includes(cat.id) ? prev.categories.filter(c => c !== cat.id) : [...prev.categories, cat.id] }))} className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-colors ${business.categories.includes(cat.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted text-foreground'}`}>
                    <cat.icon size={18} />{cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 btn-secondary py-3.5 rounded-xl font-bold">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 btn-primary py-3.5 rounded-xl font-bold">Continue <ChevronRight size={18} className="inline" /></button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Upload Documents</h2>
            <div className="space-y-3">
              {[{ key: 'aadhaarUploaded' as const, label: 'Aadhaar Card *', desc: 'Front and back' }, { key: 'panUploaded' as const, label: 'PAN Card', desc: 'Optional but recommended' }, { key: 'bankProofUploaded' as const, label: 'Bank Passbook / Statement *', desc: 'For payouts' }, { key: 'photoUploaded' as const, label: 'Profile Photo *', desc: 'Clear face photo' }].map(doc => (
                <div key={doc.key} className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${docs[doc.key] ? 'border-success bg-success/5' : 'border-border'}`}>
                  <div><p className="font-semibold text-sm text-foreground">{doc.label}</p><p className="text-xs text-muted-foreground">{doc.desc}</p></div>
                  {docs[doc.key] ? <span className="flex items-center gap-1.5 text-success text-xs font-bold"><CheckCircle size={14} /> Uploaded</span> : <button onClick={() => setDocs(prev => ({ ...prev, [doc.key]: true }))} className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">Upload</button>}
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 btn-secondary py-3.5 rounded-xl font-bold">Back</button>
              <button onClick={() => setStep(4)} className="flex-1 btn-primary py-3.5 rounded-xl font-bold">Continue <ChevronRight size={18} className="inline" /></button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Review & Submit</h2>
            <div className="space-y-3 text-sm">
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <p className="font-bold text-foreground">Personal Info</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Name</span><span className="font-semibold">{personal.fullName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-semibold">{personal.phone || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">City</span><span className="font-semibold">{personal.city || '—'}</span></div>
              </div>
              <div className="bg-muted/40 rounded-xl p-4 space-y-2">
                <p className="font-bold text-foreground">Business Info</p>
                <div className="flex justify-between"><span className="text-muted-foreground">Business Name</span><span className="font-semibold">{business.businessName || '—'}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Categories</span><span className="font-semibold">{business.categories.length > 0 ? business.categories.join(', ') : '—'}</span></div>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <input type="checkbox" id="terms" required className="mt-0.5 w-4 h-4 rounded accent-primary" />
              <label htmlFor="terms" className="text-xs text-muted-foreground leading-relaxed">I agree to KisanSetu&apos;s <Link href="/policies" className="text-primary font-medium hover:underline">Terms of Use</Link> and <Link href="/policies" className="text-primary font-medium hover:underline">Supplier Agreement</Link></label>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 btn-secondary py-3.5 rounded-xl font-bold">Back</button>
              <button onClick={() => setSubmitted(true)} className="flex-1 btn-primary py-3.5 rounded-xl font-bold">Submit Application</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
