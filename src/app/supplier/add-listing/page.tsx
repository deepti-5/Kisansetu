'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight, CheckCircle, Plus, Loader2 } from 'lucide-react';

const CATEGORIES = ['Tractor', 'Harvester', 'Rotavator', 'Seed Drill', 'Sprayer', 'Plough', 'Thresher', 'Transplanter', 'Irrigation Pump', 'Other'];

interface FormData { name: string; category: string; brand: string; model: string; year: string; condition: string; description: string; rentPerDay: string; buyPrice: string; deposit: string; forRent: boolean; forSale: boolean; location: string; pincode: string; }

export default function AddListingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState<FormData>({ name: '', category: '', brand: '', model: '', year: '', condition: 'Good', description: '', rentPerDay: '', buyPrice: '', deposit: '', forRent: true, forSale: false, location: '', pincode: '' });

  function update(field: keyof FormData, value: string | boolean) { setForm(prev => ({ ...prev, [field]: value })); }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => { setSubmitting(false); setSubmitted(true); }, 2000);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-screen-sm mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-success" /></div>
          <h1 className="text-2xl font-extrabold text-foreground mb-3">Listing Submitted!</h1>
          <p className="text-muted-foreground mb-8">Our team will verify and approve it within <strong>24 hours</strong>.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/supplier/dashboard" className="btn-primary px-6 py-3">Go to Dashboard</Link>
            <button onClick={() => { setSubmitted(false); setForm({ name: '', category: '', brand: '', model: '', year: '', condition: 'Good', description: '', rentPerDay: '', buyPrice: '', deposit: '', forRent: true, forSale: false, location: '', pincode: '' }); }} className="btn-secondary px-6 py-3">Add Another</button>
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
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/supplier/dashboard" className="hover:text-primary">Supplier Dashboard</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Add Listing</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center"><Plus size={20} className="text-white" /></div>
          <div><h1 className="text-2xl font-extrabold text-foreground">Add New Listing</h1><p className="text-sm text-muted-foreground">List your equipment for rent or sale on KisanSetu</p></div>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-foreground">Equipment Details</h2>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Equipment Name *</label>
              <input value={form.name} onChange={e => update('name', e.target.value)} placeholder="e.g. Mahindra Yuvo 575 DI Tractor" className="input-field w-full" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Category *</label>
                <select value={form.category} onChange={e => update('category', e.target.value)} className="input-field w-full" required>
                  <option value="">Select category</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Condition</label>
                <div className="flex gap-2">
                  {['Excellent', 'Good', 'Fair'].map(c => <button key={c} type="button" onClick={() => update('condition', c)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${form.condition === c ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{c}</button>)}
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Brand</label><input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="e.g. Mahindra" className="input-field w-full" /></div>
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Model</label><input value={form.model} onChange={e => update('model', e.target.value)} placeholder="e.g. Yuvo 575" className="input-field w-full" /></div>
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Year</label><input value={form.year} onChange={e => update('year', e.target.value)} placeholder="2022" type="number" className="input-field w-full" /></div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Description *</label>
              <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Describe your equipment, its condition, and any special features..." rows={4} className="input-field w-full resize-none" required />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-foreground">Pricing & Listing Type</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.forRent} onChange={e => update('forRent', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-sm font-semibold text-foreground">For Rent</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.forSale} onChange={e => update('forSale', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-sm font-semibold text-foreground">For Sale</span></label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {form.forRent && <div><label className="block text-sm font-semibold text-foreground mb-1.5">Rent per Day (₹) *</label><input value={form.rentPerDay} onChange={e => update('rentPerDay', e.target.value)} placeholder="2500" type="number" className="input-field w-full" /></div>}
              {form.forSale && <div><label className="block text-sm font-semibold text-foreground mb-1.5">Buy Price (₹) *</label><input value={form.buyPrice} onChange={e => update('buyPrice', e.target.value)} placeholder="750000" type="number" className="input-field w-full" /></div>}
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Security Deposit (₹)</label><input value={form.deposit} onChange={e => update('deposit', e.target.value)} placeholder="10000" type="number" className="input-field w-full" /></div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-foreground">Location</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Village / Area *</label><input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Hadapsar, Pune" className="input-field w-full" required /></div>
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Pincode *</label><input value={form.pincode} onChange={e => update('pincode', e.target.value)} placeholder="411028" className="input-field w-full" /></div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full btn-primary py-4 rounded-xl font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed">
            {submitting ? <><Loader2 size={18} className="animate-spin inline mr-2" />Submitting...</> : 'Submit Listing for Review'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
