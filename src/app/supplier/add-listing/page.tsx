'use client';

import React, { useState, useEffect } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight, CheckCircle, Plus, Loader2, MapPin, Tractor, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const CATEGORIES = ['Tractor', 'Harvester', 'Rotavator', 'Seed Drill', 'Sprayer', 'Plough', 'Thresher', 'Transplanter', 'Irrigation Pump', 'Other'];

interface DriverDetails {
  name: string;
  phone: string;
  experience: string;
  availability: string;
  serviceArea: string;
}

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
  latitude: string;
  longitude: string;
  address: string;
  rentalType: 'tractor-only' | 'tractor-with-driver';
  driver: DriverDetails;
}

const AVAILABILITY_OPTIONS = ['Monday–Friday', 'Weekends Only', 'All Days', 'On Request', 'Seasonal (Kharif)', 'Seasonal (Rabi)'];

const EMPTY_FORM: FormData = {
  name: '', category: '', brand: '', model: '', year: '', condition: 'Good',
  description: '', rentPerDay: '', buyPrice: '', deposit: '',
  forRent: true, forSale: false, location: '', pincode: '',
  latitude: '', longitude: '', address: '',
  rentalType: 'tractor-only',
  driver: { name: '', phone: '', experience: '', availability: '', serviceArea: '' }
};

export default function AddListingPage() {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedId, setSubmittedId] = useState('');
  const [form, setForm] = useState<FormData>(EMPTY_FORM);
  const supabase = createClient();

  // Pick up location data from location picker (via sessionStorage)
  useEffect(() => {
    const stored = sessionStorage.getItem('kisan_picked_location');
    if (stored) {
      try {
        const loc = JSON.parse(stored);
        setForm(prev => ({
          ...prev,
          latitude: loc.latitude ?? '',
          longitude: loc.longitude ?? '',
          address: loc.address ?? '',
          location: loc.address ?? prev.location,
        }));
        sessionStorage.removeItem('kisan_picked_location');
      } catch {}
    }
  }, []);

  function update(field: keyof FormData, value: string | boolean) {
    setForm(prev => ({ ...prev, [field]: value }));
  }

  function updateDriver(field: keyof DriverDetails, value: string) {
    setForm(prev => ({ ...prev, driver: { ...prev.driver, [field]: value } }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login to add a listing');
        setSubmitting(false);
        return;
      }

      // Determine listing type
      let listingType: 'rent' | 'buy' | 'both' = 'both';
      if (form.forRent && !form.forSale) listingType = 'rent';
      if (!form.forRent && form.forSale) listingType = 'buy';

      // Map condition
      const conditionMap: Record<string, string> = {
        'Excellent': 'excellent', 'Good': 'good', 'Fair': 'fair'
      };

      const hasDriver = form.rentalType === 'tractor-with-driver';

      const equipmentData = {
        provider_id: user.id,
        name: form.name.trim(),
        category: form.category,
        brand: form.brand.trim(),
        model: form.model.trim(),
        year: form.year ? parseInt(form.year) : null,
        condition: conditionMap[form.condition] || 'good',
        description: form.description.trim(),
        listing_type: listingType,
        rent_per_day: form.forRent && form.rentPerDay ? parseFloat(form.rentPerDay) : 0,
        buy_price: form.forSale && form.buyPrice ? parseFloat(form.buyPrice) : 0,
        deposit: form.deposit ? parseFloat(form.deposit) : 0,
        location: form.location.trim(),
        pin_code: form.pincode.trim(),
        latitude: form.latitude ? parseFloat(form.latitude) : null,
        longitude: form.longitude ? parseFloat(form.longitude) : null,
        has_driver: hasDriver,
        driver_name: hasDriver ? form.driver.name.trim() : '',
        driver_phone: hasDriver ? form.driver.phone.trim() : '',
        driver_experience: hasDriver ? form.driver.experience.trim() : '',
        delivery_available: false,
        status: 'pending',
        is_available: true,
      };

      const { data: inserted, error } = await supabase
        .from('equipment')
        .insert(equipmentData)
        .select('id')
        .single();

      if (error) {
        console.error('Equipment insert error:', error);
        toast.error('Failed to submit listing. Please try again.');
        setSubmitting(false);
        return;
      }

      // Update provider flag
      await supabase
        .from('user_profiles')
        .update({ is_provider: true, provider_type: 'equipment' })
        .eq('id', user.id);

      setSubmittedId(inserted.id);
      setSubmitted(true);
      toast.success('Listing submitted for review!');
    } catch (err) {
      console.error('Submit error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  const isTractor = form.category === 'Tractor' || form.name.toLowerCase().includes('tractor');

  if (submitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-screen-sm mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h1 className="text-2xl font-extrabold text-foreground mb-3">Listing Submitted!</h1>
          <p className="text-muted-foreground mb-2">Our team will verify and approve it within <strong>24 hours</strong>.</p>
          {submittedId && (
            <p className="text-xs text-muted-foreground mb-8">Listing ID: <span className="font-mono text-primary">{submittedId.slice(0, 8).toUpperCase()}</span></p>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/supplier/hub" className="btn-primary px-6 py-3">Go to Dashboard</Link>
            <button onClick={() => { setSubmitted(false); setForm(EMPTY_FORM); }} className="btn-secondary px-6 py-3">Add Another</button>
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
          <Link href="/supplier/hub" className="hover:text-primary">Supplier Dashboard</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Add Listing</span>
        </div>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center"><Plus size={20} className="text-white" /></div>
          <div><h1 className="text-2xl font-extrabold text-foreground">Add New Listing</h1><p className="text-sm text-muted-foreground">List your equipment for rent or sale on KisanSetu</p></div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
          {/* Equipment Details */}
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
                  {['Excellent', 'Good', 'Fair'].map(c => (
                    <button key={c} type="button" onClick={() => update('condition', c)} className={`flex-1 py-2 rounded-lg text-xs font-semibold border-2 transition-all ${form.condition === c ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:border-primary/50'}`}>{c}</button>
                  ))}
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

          {/* Rental Type */}
          {(isTractor || form.forRent) && (
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Tractor size={18} className="text-primary" />
                <h2 className="font-bold text-foreground">Rental Type</h2>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {(['tractor-only', 'tractor-with-driver'] as const).map((rt) => (
                  <button
                    key={rt}
                    type="button"
                    onClick={() => update('rentalType', rt)}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${form.rentalType === rt ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${form.rentalType === rt ? 'bg-primary/10' : 'bg-muted'}`}>
                      {rt === 'tractor-only' ? <Tractor size={20} className={form.rentalType === rt ? 'text-primary' : 'text-muted-foreground'} /> : <User size={20} className={form.rentalType === rt ? 'text-primary' : 'text-muted-foreground'} />}
                    </div>
                    <span className={`text-sm font-bold ${form.rentalType === rt ? 'text-primary' : 'text-foreground'}`}>{rt === 'tractor-only' ? 'Equipment Only' : 'Equipment + Driver'}</span>
                    <span className="text-xs text-muted-foreground text-center">{rt === 'tractor-only' ? 'Renter brings own operator' : 'Includes experienced operator'}</span>
                    {form.rentalType === rt && <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-primary flex items-center justify-center"><CheckCircle size={12} className="text-white" /></div>}
                  </button>
                ))}
              </div>

              {form.rentalType === 'tractor-with-driver' && (
                <div className="pt-4 border-t border-border space-y-4">
                  <div className="flex items-center gap-2"><User size={15} className="text-primary" /><span className="text-sm font-bold text-foreground">Driver / Operator Details</span></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-foreground mb-1.5">Driver Name *</label><input value={form.driver.name} onChange={e => updateDriver('name', e.target.value)} placeholder="e.g. Ramesh Kumar" className="input-field w-full" required={form.rentalType === 'tractor-with-driver'} /></div>
                    <div><label className="block text-sm font-semibold text-foreground mb-1.5">Driver Phone *</label><input value={form.driver.phone} onChange={e => updateDriver('phone', e.target.value)} placeholder="+91 98765 43210" type="tel" className="input-field w-full" required={form.rentalType === 'tractor-with-driver'} /></div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-semibold text-foreground mb-1.5">Years of Experience</label><input value={form.driver.experience} onChange={e => updateDriver('experience', e.target.value)} placeholder="e.g. 8 years" className="input-field w-full" /></div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-1.5">Availability</label>
                      <select value={form.driver.availability} onChange={e => updateDriver('availability', e.target.value)} className="input-field w-full">
                        <option value="">Select availability</option>
                        {AVAILABILITY_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                  <div><label className="block text-sm font-semibold text-foreground mb-1.5">Service Area</label><input value={form.driver.serviceArea} onChange={e => updateDriver('serviceArea', e.target.value)} placeholder="e.g. Pune District, within 30 km radius" className="input-field w-full" /></div>
                </div>
              )}
            </div>
          )}

          {/* Pricing */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <h2 className="font-bold text-foreground">Pricing & Listing Type</h2>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.forRent} onChange={e => update('forRent', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-sm font-semibold text-foreground">For Rent</span></label>
              <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.forSale} onChange={e => update('forSale', e.target.checked)} className="w-4 h-4 accent-primary" /><span className="text-sm font-semibold text-foreground">For Sale</span></label>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {form.forRent && <div><label className="block text-sm font-semibold text-foreground mb-1.5">Rent per Day (₹) *</label><input value={form.rentPerDay} onChange={e => update('rentPerDay', e.target.value)} placeholder="2500" type="number" min="0" className="input-field w-full" /></div>}
              {form.forSale && <div><label className="block text-sm font-semibold text-foreground mb-1.5">Buy Price (₹) *</label><input value={form.buyPrice} onChange={e => update('buyPrice', e.target.value)} placeholder="750000" type="number" min="0" className="input-field w-full" /></div>}
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Security Deposit (₹)</label><input value={form.deposit} onChange={e => update('deposit', e.target.value)} placeholder="10000" type="number" min="0" className="input-field w-full" /></div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-foreground">Location</h2>
              <Link href="/supplier/location-picker?returnTo=/supplier/add-listing" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
                <MapPin size={15} />
                {form.latitude ? 'Change Location' : 'Pick on Map'}
              </Link>
            </div>
            {form.latitude && form.longitude && (
              <div className="flex items-start gap-3 p-3 bg-primary/5 border border-primary/20 rounded-xl">
                <MapPin size={16} className="text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-foreground truncate">{form.address || 'Location selected'}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{parseFloat(form.latitude).toFixed(5)}°N, {parseFloat(form.longitude).toFixed(5)}°E</p>
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Village / Area *</label><input value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Hadapsar, Pune" className="input-field w-full" required /></div>
              <div><label className="block text-sm font-semibold text-foreground mb-1.5">Pincode</label><input value={form.pincode} onChange={e => update('pincode', e.target.value)} placeholder="411028" className="input-field w-full" /></div>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="w-full btn-primary py-4 rounded-xl font-bold text-base disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
            {submitting ? <><Loader2 size={18} className="animate-spin" />Submitting...</> : 'Submit Listing for Review'}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
