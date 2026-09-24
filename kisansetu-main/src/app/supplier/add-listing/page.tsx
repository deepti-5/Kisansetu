'use client';

import React, { useState, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ChevronRight, Upload, X, CheckCircle, Tractor, Package,
  IndianRupee, MapPin, Info, Plus, Loader2, Camera
} from 'lucide-react';

const CATEGORIES = [
  'Tractor', 'Harvester', 'Rotavator', 'Seed Drill', 'Sprayer',
  'Plough', 'Thresher', 'Transplanter', 'Irrigation Pump', 'Other'
];

const CONDITION_OPTIONS = ['Excellent', 'Good', 'Fair'];

interface FormData {
  name: string;
  category: string;
  brand: string;
  model: string;
  year: string;
  condition: string;
  description: string;
  rentPerDay: string;
  buyPrice: string;
  deposit: string;
  forRent: boolean;
  forSale: boolean;
  location: string;
  pincode: string;
  minRentalDays: string;
  images: string[];
}

export default function AddListingPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const [form, setForm] = useState<FormData>({
    name: '',
    category: '',
    brand: '',
    model: '',
    year: '',
    condition: 'Good',
    description: '',
    rentPerDay: '',
    buyPrice: '',
    deposit: '',
    forRent: true,
    forSale: false,
    location: '',
    pincode: '',
    minRentalDays: '1',
    images: []
  });

  function update(field: keyof FormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: undefined }));
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    // Demo: use placeholder images
    const newImages = Array.from(files).slice(0, 5 - form.images.length).map((_, i) =>
      `https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=400&sig=${Date.now() + i}`
    );
    setForm(prev => ({ ...prev, images: [...prev.images, ...newImages] }));
  }

  function removeImage(idx: number) {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  }

  function validate(): boolean {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!form.name.trim()) newErrors.name = 'Equipment name is required';
    if (!form.category) newErrors.category = 'Please select a category';
    if (!form.description.trim()) newErrors.description = 'Description is required';
    if (!form.forRent && !form.forSale) newErrors.forRent = 'Select at least one option (rent or sale)';
    if (form.forRent && !form.rentPerDay) newErrors.rentPerDay = 'Rent per day is required';
    if (form.forSale && !form.buyPrice) newErrors.buyPrice = 'Buy price is required';
    if (!form.location.trim()) newErrors.location = 'Location is required';
    if (form.images.length === 0) newErrors.images = 'Please upload at least one image';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    // BACKEND: POST to /api/supplier/listings
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 2000);
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-screen-sm mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-3">Listing Submitted!</h1>
          <p className="text-muted-foreground mb-2">
            Your equipment listing has been submitted for review.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            Our team will verify and approve it within <strong>24 hours</strong>. You'll receive a notification once it's live.
          </p>
          <div className="bg-muted/40 rounded-2xl p-4 mb-8 text-left space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Equipment</span>
              <span className="font-semibold text-foreground">{form.name}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Category</span>
              <span className="font-semibold text-foreground">{form.category}</span>
            </div>
            {form.forRent && (
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Rent/day</span>
                <span className="font-semibold text-primary">₹{form.rentPerDay}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="badge-amber text-xs">Pending Review</span>
            </div>
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/supplier/dashboard" className="btn-primary px-6 py-3">
              Go to Dashboard
            </Link>
            <button onClick={() => { setSubmitted(false); setForm({ name: '', category: '', brand: '', model: '', year: '', condition: 'Good', description: '', rentPerDay: '', buyPrice: '', deposit: '', forRent: true, forSale: false, location: '', pincode: '', minRentalDays: '1', images: [] }); }} className="btn-secondary px-6 py-3">
              Add Another
            </button>
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
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/supplier/dashboard" className="hover:text-primary transition-colors">Supplier Dashboard</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Add Listing</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
            <Plus size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Add New Listing</h1>
            <p className="text-sm text-muted-foreground">List your equipment for rent or sale on KisanSetu</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-2 space-y-6">

              {/* Basic Info */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Tractor size={18} className="text-primary" /> Equipment Details
                </h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      Equipment Name <span className="text-danger">*</span>
                    </label>
                    <input
                      value={form.name}
                      onChange={e => update('name', e.target.value)}
                      placeholder="e.g. Mahindra Yuvo 575 DI Tractor"
                      className={`input-field w-full ${errors.name ? 'border-danger' : ''}`}
                    />
                    {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Category <span className="text-danger">*</span>
                      </label>
                      <select
                        value={form.category}
                        onChange={e => update('category', e.target.value)}
                        className={`input-field w-full ${errors.category ? 'border-danger' : ''}`}
                      >
                        <option value="">Select category</option>
                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      {errors.category && <p className="text-xs text-danger mt-1">{errors.category}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Condition</label>
                      <div className="flex gap-2">
                        {CONDITION_OPTIONS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => update('condition', c)}
                            className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${form.condition === c ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}
                          >
                            {c}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Brand</label>
                      <input value={form.brand} onChange={e => update('brand', e.target.value)} placeholder="e.g. Mahindra" className="input-field w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Model</label>
                      <input value={form.model} onChange={e => update('model', e.target.value)} placeholder="e.g. Yuvo 575" className="input-field w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Year</label>
                      <input value={form.year} onChange={e => update('year', e.target.value)} placeholder="e.g. 2022" type="number" min="1990" max="2026" className="input-field w-full" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      Description <span className="text-danger">*</span>
                    </label>
                    <textarea
                      value={form.description}
                      onChange={e => update('description', e.target.value)}
                      rows={4}
                      placeholder="Describe your equipment — condition, features, usage history, what it's best suited for..."
                      className={`input-field w-full resize-none ${errors.description ? 'border-danger' : ''}`}
                    />
                    {errors.description && <p className="text-xs text-danger mt-1">{errors.description}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{form.description.length}/500 characters</p>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <IndianRupee size={18} className="text-primary" /> Pricing & Availability
                </h2>

                <div className="flex gap-4 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.forRent} onChange={e => update('forRent', e.target.checked)} className="w-4 h-4 accent-primary" />
                    <span className="text-sm font-semibold text-foreground">Available for Rent</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.forSale} onChange={e => update('forSale', e.target.checked)} className="w-4 h-4 accent-primary" />
                    <span className="text-sm font-semibold text-foreground">Available for Sale</span>
                  </label>
                </div>
                {errors.forRent && <p className="text-xs text-danger mb-3">{errors.forRent}</p>}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {form.forRent && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Rent per Day (₹) <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <input value={form.rentPerDay} onChange={e => update('rentPerDay', e.target.value)} type="number" min="0" placeholder="2500" className={`input-field w-full pl-7 ${errors.rentPerDay ? 'border-danger' : ''}`} />
                      </div>
                      {errors.rentPerDay && <p className="text-xs text-danger mt-1">{errors.rentPerDay}</p>}
                    </div>
                  )}
                  {form.forSale && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">
                        Buy Price (₹) <span className="text-danger">*</span>
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <input value={form.buyPrice} onChange={e => update('buyPrice', e.target.value)} type="number" min="0" placeholder="750000" className={`input-field w-full pl-7 ${errors.buyPrice ? 'border-danger' : ''}`} />
                      </div>
                      {errors.buyPrice && <p className="text-xs text-danger mt-1">{errors.buyPrice}</p>}
                    </div>
                  )}
                  {form.forRent && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Security Deposit (₹)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                        <input value={form.deposit} onChange={e => update('deposit', e.target.value)} type="number" min="0" placeholder="10000" className="input-field w-full pl-7" />
                      </div>
                    </div>
                  )}
                  {form.forRent && (
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Min. Rental Days</label>
                      <input value={form.minRentalDays} onChange={e => update('minRentalDays', e.target.value)} type="number" min="1" max="30" className="input-field w-full" />
                    </div>
                  )}
                </div>
              </div>

              {/* Location */}
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <MapPin size={18} className="text-primary" /> Location
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">
                      Area / Village / City <span className="text-danger">*</span>
                    </label>
                    <input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Hadapsar, Pune" className={`input-field w-full ${errors.location ? 'border-danger' : ''}`} />
                    {errors.location && <p className="text-xs text-danger mt-1">{errors.location}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Pincode</label>
                    <input value={form.pincode} onChange={e => update('pincode', e.target.value)} placeholder="411028" maxLength={6} className="input-field w-full" />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — Images */}
            <div className="space-y-6">
              <div className="bg-card rounded-2xl border border-border p-6">
                <h2 className="font-bold text-foreground mb-4 flex items-center gap-2">
                  <Camera size={18} className="text-primary" /> Photos
                </h2>
                <p className="text-xs text-muted-foreground mb-4">Upload up to 5 photos. Clear images get 3× more bookings.</p>

                <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />

                {form.images.length < 5 && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="w-full h-32 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-secondary transition-all flex flex-col items-center justify-center gap-2 mb-3"
                  >
                    <Upload size={24} className="text-primary" />
                    <span className="text-sm font-semibold text-primary">Upload Photos</span>
                    <span className="text-xs text-muted-foreground">{form.images.length}/5 uploaded</span>
                  </button>
                )}

                {errors.images && <p className="text-xs text-danger mb-2">{errors.images}</p>}

                <div className="grid grid-cols-2 gap-2">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                      <img src={img} alt={`Equipment photo ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 rounded-full bg-danger text-white flex items-center justify-center hover:bg-danger/80 transition-colors"
                      >
                        <X size={12} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded">Cover</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div className="bg-primary/5 rounded-2xl border border-primary/20 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Info size={16} className="text-primary" />
                  <span className="font-semibold text-sm text-foreground">Listing Tips</span>
                </div>
                <ul className="space-y-2 text-xs text-muted-foreground">
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-success mt-0.5 shrink-0" /> Add clear photos from multiple angles</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-success mt-0.5 shrink-0" /> Mention maintenance history in description</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-success mt-0.5 shrink-0" /> Set competitive pricing to get more bookings</li>
                  <li className="flex items-start gap-1.5"><CheckCircle size={12} className="text-success mt-0.5 shrink-0" /> Listings are reviewed within 24 hours</li>
                </ul>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full btn-primary py-3.5 font-bold text-base flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <><Loader2 size={18} className="animate-spin" /> Submitting...</>
                ) : (
                  <><Package size={18} /> Submit for Review</>
                )}
              </button>

              <Link href="/supplier/dashboard" className="w-full btn-secondary py-3 font-semibold text-sm flex items-center justify-center gap-2">
                Cancel
              </Link>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
