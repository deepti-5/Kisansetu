'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  User, Phone, Mail, MapPin, Camera, Save, ChevronRight,
  ShoppingBag, CreditCard, Heart, Bell, Shield, LogOut, Edit3, CheckCircle
} from 'lucide-react';
import { toast } from 'sonner';

interface ProfileData {
  name: string; phone: string; email: string; village: string;
  district: string; state: string; pincode: string; farmSize: string; crops: string;
}

const ACCOUNT_LINKS = [
  { icon: ShoppingBag, label: 'My Bookings / Orders', href: '/account/bookings', desc: 'View rental & purchase history' },
  { icon: CreditCard, label: 'Payment & Refund History', href: '/account/payments', desc: 'Transactions and refunds' },
  { icon: Heart, label: 'Wishlist', href: '/account/wishlist', desc: 'Saved equipment & products' },
  { icon: Bell, label: 'Notifications', href: '/account/notifications', desc: 'Alerts and updates' },
  { icon: Shield, label: 'Privacy & Security', href: '#', desc: 'Password, 2FA, data' },
];

export default function ProfilePage() {
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Johan Rame',
    phone: '+91 98765 43210',
    email: 'johan.rame@email.com',
    village: 'Hadapsar',
    district: 'Pune',
    state: 'Maharashtra',
    pincode: '411028',
    farmSize: '5 acres',
    crops: 'Wheat, Sugarcane, Onion',
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  function handleSave() {
    setProfile(draft);
    setEditing(false);
    setSaved(true);
    toast.success('Profile updated successfully!');
    setTimeout(() => setSaved(false), 3000);
  }

  function handleCancel() {
    setDraft(profile);
    setEditing(false);
  }

  const fields: { key: keyof ProfileData; label: string; icon: React.FC<{ size?: number; className?: string }>; type?: string; placeholder: string }[] = [
    { key: 'name', label: 'Full Name', icon: User, placeholder: 'Enter your full name' },
    { key: 'phone', label: 'Phone Number', icon: Phone, type: 'tel', placeholder: '+91 XXXXX XXXXX' },
    { key: 'email', label: 'Email Address', icon: Mail, type: 'email', placeholder: 'your@email.com' },
    { key: 'village', label: 'Village / Area', icon: MapPin, placeholder: 'Village name' },
    { key: 'district', label: 'District', icon: MapPin, placeholder: 'District' },
    { key: 'state', label: 'State', icon: MapPin, placeholder: 'State' },
    { key: 'pincode', label: 'PIN Code', icon: MapPin, placeholder: '6-digit PIN' },
    { key: 'farmSize', label: 'Farm Size', icon: User, placeholder: 'e.g. 5 acres' },
    { key: 'crops', label: 'Crops Grown', icon: User, placeholder: 'e.g. Wheat, Rice' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-lg mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">My Profile</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Avatar + Quick Links */}
          <div className="space-y-4">
            {/* Avatar card */}
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full gradient-green flex items-center justify-center mx-auto">
                  <User size={40} className="text-white" />
                </div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <p className="font-extrabold text-lg text-foreground">{profile.name}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{profile.phone}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="text-xs text-success font-semibold">Verified Farmer</span>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                {[
                  { label: 'Bookings', value: 12 },
                  { label: 'Reviews', value: 8 },
                  { label: 'Saved', value: 5 },
                ].map(s => (
                  <div key={s.label} className="text-center">
                    <p className="font-bold text-base text-foreground">{s.value}</p>
                    <p className="text-xs text-muted-foreground">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {ACCOUNT_LINKS.map((item, i) => (
                <Link key={item.label} href={item.href} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${i < ACCOUNT_LINKS.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <item.icon size={15} className="text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                </Link>
              ))}
              <Link href="/sign-up-login-screen" className="flex items-center gap-3 px-4 py-3.5 hover:bg-danger/5 transition-colors text-danger">
                <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0">
                  <LogOut size={15} className="text-danger" />
                </div>
                <span className="text-sm font-semibold">Logout</span>
              </Link>
            </div>
          </div>

          {/* RIGHT: Profile Form */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-lg text-foreground">Personal Information</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                    <Edit3 size={14} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleCancel} className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm font-semibold">
                      <Save size={14} /> Save Changes
                    </button>
                  </div>
                )}
              </div>

              {saved && (
                <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-4 py-3 mb-4 text-sm text-success font-semibold">
                  <CheckCircle size={16} /> Profile updated successfully!
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(f => (
                  <div key={f.key} className={f.key === 'crops' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">
                      {f.label}
                    </label>
                    {editing ? (
                      <div className="relative">
                        <f.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input
                          type={f.type || 'text'}
                          value={draft[f.key]}
                          onChange={e => setDraft(prev => ({ ...prev, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="input-field pl-9 text-sm w-full"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/40 rounded-xl">
                        <f.icon size={14} className="text-muted-foreground shrink-0" />
                        <span className="text-sm text-foreground font-medium">{profile[f.key] || '—'}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!editing && (
                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Account Details</p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-muted/40 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Member Since</p>
                      <p className="font-semibold text-foreground">January 2026</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Account Type</p>
                      <p className="font-semibold text-foreground">Farmer</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">KYC Status</p>
                      <p className="font-semibold text-success">Verified ✓</p>
                    </div>
                    <div className="bg-muted/40 rounded-xl p-3">
                      <p className="text-xs text-muted-foreground mb-0.5">Language</p>
                      <p className="font-semibold text-foreground">English</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
