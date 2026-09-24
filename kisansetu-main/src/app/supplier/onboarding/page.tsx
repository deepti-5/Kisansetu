'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { User, Store, FileText, CheckCircle, ChevronRight, Upload, Phone, Shield, Package, Tractor, Sprout, Wrench } from 'lucide-react';

type Step = 1 | 2 | 3 | 4;

const STEPS = [
  { num: 1, label: 'Personal Info', icon: User },
  { num: 2, label: 'Business Details', icon: Store },
  { num: 3, label: 'Documents', icon: FileText },
  { num: 4, label: 'Review & Submit', icon: CheckCircle },
];

const EQUIPMENT_CATEGORIES = [
  { id: 'tractor', label: 'Tractors', icon: Tractor },
  { id: 'harvester', label: 'Harvesters', icon: Package },
  { id: 'irrigation', label: 'Irrigation', icon: Sprout },
  { id: 'tillage', label: 'Tillage', icon: Wrench },
  { id: 'sprayer', label: 'Sprayers', icon: Package },
  { id: 'planting', label: 'Planting', icon: Sprout },
];

export default function SupplierOnboarding() {
  const [step, setStep] = useState<Step>(1);
  const [submitted, setSubmitted] = useState(false);

  const [personal, setPersonal] = useState({
    fullName: '', phone: '', email: '', aadhaar: '', pan: '',
    address: '', city: '', state: '', pincode: '',
  });

  const [business, setBusiness] = useState({
    businessName: '', businessType: 'individual', gst: '',
    bankAccount: '', ifsc: '', bankName: '',
    categories: [] as string[], description: '',
    yearsInBusiness: '1',
  });

  const [docs, setDocs] = useState({
    aadhaarUploaded: false, panUploaded: false,
    bankProofUploaded: false, photoUploaded: false,
  });

  function handlePersonalChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setPersonal(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function handleBusinessChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    setBusiness(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }

  function toggleCategory(id: string) {
    setBusiness(prev => ({
      ...prev,
      categories: prev.categories.includes(id)
        ? prev.categories.filter(c => c !== id)
        : [...prev.categories, id]
    }));
  }

  function simulateUpload(field: keyof typeof docs) {
    setDocs(prev => ({ ...prev, [field]: true }));
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Application Submitted!</h1>
          <p className="text-muted-foreground mb-6">
            Your supplier application is under review. We'll verify your documents and activate your account within <strong>24–48 hours</strong>.
          </p>
          <div className="bg-card border border-border rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Application ID</span>
              <span className="font-bold text-foreground">SUP-{Math.floor(100000 + Math.random() * 900000)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Name</span>
              <span className="font-semibold text-foreground">{personal.fullName || 'Rajesh Patil'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Business</span>
              <span className="font-semibold text-foreground">{business.businessName || 'My Farm Equipment'}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="font-bold text-warning">Under Review</span>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Link href="/supplier/dashboard" className="btn-primary w-full py-3 rounded-xl font-semibold text-center block">
              Go to Supplier Dashboard
            </Link>
            <Link href="/" className="btn-outline w-full py-3 rounded-xl font-semibold text-center block">
              Back to Home
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Become a Supplier</h1>
          <p className="text-muted-foreground">List your equipment and start earning. Setup takes less than 5 minutes.</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                  step > s.num ? 'bg-success text-white' :
                  step === s.num ? 'bg-primary text-white shadow-lg': 'bg-muted text-muted-foreground'
                }`}>
                  {step > s.num ? <CheckCircle size={18} /> : s.num}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${step === s.num ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 transition-colors ${step > s.num ? 'bg-success' : 'bg-border'}`} />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Full Name *</label>
                <input name="fullName" value={personal.fullName} onChange={handlePersonalChange}
                  placeholder="As per Aadhaar"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Mobile Number *</label>
                <input name="phone" value={personal.phone} onChange={handlePersonalChange}
                  placeholder="+91 XXXXX XXXXX" type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Email Address</label>
                <input name="email" value={personal.email} onChange={handlePersonalChange}
                  placeholder="your@email.com" type="email"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Aadhaar Number *</label>
                <input name="aadhaar" value={personal.aadhaar} onChange={handlePersonalChange}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">PAN Number</label>
                <input name="pan" value={personal.pan} onChange={handlePersonalChange}
                  placeholder="ABCDE1234F"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">City *</label>
                <input name="city" value={personal.city} onChange={handlePersonalChange}
                  placeholder="Pune"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">State *</label>
                <select name="state" value={personal.state} onChange={handlePersonalChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select State</option>
                  {['Maharashtra', 'Karnataka', 'Telangana', 'Andhra Pradesh', 'Tamil Nadu', 'Gujarat', 'Rajasthan', 'Uttar Pradesh', 'Punjab', 'Haryana'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Pincode *</label>
                <input name="pincode" value={personal.pincode} onChange={handlePersonalChange}
                  placeholder="411001"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>
            <button onClick={() => setStep(2)}
              className="w-full btn-primary py-3.5 rounded-xl font-bold mt-2">
              Continue <ChevronRight size={18} className="inline" />
            </button>
          </div>
        )}

        {/* Step 2: Business Details */}
        {step === 2 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Business Details</h2>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Business / Farm Name *</label>
              <input name="businessName" value={business.businessName} onChange={handleBusinessChange}
                placeholder="e.g. Patil Farm Equipment"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Business Type *</label>
              <div className="grid grid-cols-3 gap-2">
                {['individual', 'partnership', 'company'].map(type => (
                  <button key={type} onClick={() => setBusiness(prev => ({ ...prev, businessType: type }))}
                    className={`py-2.5 rounded-xl border text-sm font-semibold capitalize transition-colors ${business.businessType === type ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted text-foreground'}`}>
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Equipment Categories You Offer *</label>
              <div className="grid grid-cols-3 gap-2">
                {EQUIPMENT_CATEGORIES.map(cat => (
                  <button key={cat.id} onClick={() => toggleCategory(cat.id)}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-semibold transition-colors ${business.categories.includes(cat.id) ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted text-foreground'}`}>
                    <cat.icon size={18} />
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">GST Number (Optional)</label>
                <input name="gst" value={business.gst} onChange={handleBusinessChange}
                  placeholder="22AAAAA0000A1Z5"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Years in Business</label>
                <select name="yearsInBusiness" value={business.yearsInBusiness} onChange={handleBusinessChange}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  {['< 1', '1', '2', '3', '4', '5', '6–10', '10+'].map(y => <option key={y} value={y}>{y} year{y !== '1' ? 's' : ''}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Bank Account Number *</label>
              <input name="bankAccount" value={business.bankAccount} onChange={handleBusinessChange}
                placeholder="Account number for payouts"
                className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">IFSC Code *</label>
                <input name="ifsc" value={business.ifsc} onChange={handleBusinessChange}
                  placeholder="SBIN0001234"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Bank Name *</label>
                <input name="bankName" value={business.bankName} onChange={handleBusinessChange}
                  placeholder="State Bank of India"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="flex-1 btn-outline py-3.5 rounded-xl font-bold">Back</button>
              <button onClick={() => setStep(3)} className="flex-1 btn-primary py-3.5 rounded-xl font-bold">
                Continue <ChevronRight size={18} className="inline" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Documents */}
        {step === 3 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground mb-2">Upload Documents</h2>
            <p className="text-sm text-muted-foreground mb-4">All documents are securely stored and used only for verification.</p>

            {[
              { key: 'aadhaarUploaded' as const, label: 'Aadhaar Card', desc: 'Front & back of Aadhaar card', required: true },
              { key: 'panUploaded' as const, label: 'PAN Card', desc: 'Clear photo of PAN card', required: false },
              { key: 'bankProofUploaded' as const, label: 'Bank Passbook / Cancelled Cheque', desc: 'For payout verification', required: true },
              { key: 'photoUploaded' as const, label: 'Profile Photo', desc: 'Recent passport-size photo', required: true },
            ].map(doc => (
              <div key={doc.key} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${docs[doc.key] ? 'border-success bg-success/5' : 'border-border bg-background'}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${docs[doc.key] ? 'bg-success/10' : 'bg-muted'}`}>
                    {docs[doc.key] ? <CheckCircle size={20} className="text-success" /> : <Upload size={20} className="text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {doc.label} {doc.required && <span className="text-danger">*</span>}
                    </p>
                    <p className="text-xs text-muted-foreground">{doc.desc}</p>
                  </div>
                </div>
                <button onClick={() => simulateUpload(doc.key)}
                  className={`text-sm font-semibold px-4 py-2 rounded-lg transition-colors ${docs[doc.key] ? 'text-success bg-success/10' : 'text-primary bg-primary/10 hover:bg-primary/20'}`}>
                  {docs[doc.key] ? 'Uploaded ✓' : 'Upload'}
                </button>
              </div>
            ))}

            <div className="bg-muted/50 rounded-xl p-4 flex gap-3">
              <Shield size={18} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">Your documents are encrypted and stored securely. They are only used for KYC verification and will never be shared with third parties.</p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="flex-1 btn-outline py-3.5 rounded-xl font-bold">Back</button>
              <button onClick={() => setStep(4)} className="flex-1 btn-primary py-3.5 rounded-xl font-bold">
                Continue <ChevronRight size={18} className="inline" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h2 className="text-lg font-bold text-foreground mb-2">Review & Submit</h2>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Personal Info</p>
                  <button onClick={() => setStep(1)} className="text-xs text-primary font-semibold">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Name: </span><span className="font-medium">{personal.fullName || '—'}</span></div>
                  <div><span className="text-muted-foreground">Phone: </span><span className="font-medium">{personal.phone || '—'}</span></div>
                  <div><span className="text-muted-foreground">City: </span><span className="font-medium">{personal.city || '—'}</span></div>
                  <div><span className="text-muted-foreground">State: </span><span className="font-medium">{personal.state || '—'}</span></div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Business Details</p>
                  <button onClick={() => setStep(2)} className="text-xs text-primary font-semibold">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Business: </span><span className="font-medium">{business.businessName || '—'}</span></div>
                  <div><span className="text-muted-foreground">Type: </span><span className="font-medium capitalize">{business.businessType}</span></div>
                  <div className="col-span-2"><span className="text-muted-foreground">Categories: </span><span className="font-medium">{business.categories.length > 0 ? business.categories.join(', ') : '—'}</span></div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-foreground">Documents</p>
                  <button onClick={() => setStep(3)} className="text-xs text-primary font-semibold">Edit</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {[
                    { label: 'Aadhaar', uploaded: docs.aadhaarUploaded },
                    { label: 'PAN', uploaded: docs.panUploaded },
                    { label: 'Bank Proof', uploaded: docs.bankProofUploaded },
                    { label: 'Photo', uploaded: docs.photoUploaded },
                  ].map(d => (
                    <div key={d.label} className="flex items-center gap-1.5">
                      {d.uploaded ? <CheckCircle size={14} className="text-success" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-muted-foreground" />}
                      <span className={d.uploaded ? 'text-success font-medium' : 'text-muted-foreground'}>{d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="text-sm font-semibold text-foreground mb-1">What happens next?</p>
              <ul className="space-y-1.5 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle size={13} className="text-success" /> Document verification (24–48 hrs)</li>
                <li className="flex items-center gap-2"><CheckCircle size={13} className="text-success" /> Account activation via SMS/Email</li>
                <li className="flex items-center gap-2"><CheckCircle size={13} className="text-success" /> Start listing equipment immediately</li>
                <li className="flex items-center gap-2"><CheckCircle size={13} className="text-success" /> Receive bookings and earn money</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 btn-outline py-3.5 rounded-xl font-bold">Back</button>
              <button onClick={() => setSubmitted(true)} className="flex-1 btn-primary py-3.5 rounded-xl font-bold">
                Submit Application
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
