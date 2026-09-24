'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { User, Phone, Mail, MapPin, Camera, Save, ChevronRight, ShoppingBag, CreditCard, Heart, Bell, Shield, LogOut, Edit3, CheckCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface ProfileData { name: string; phone: string; email: string; village: string; district: string; state: string; pincode: string; farmSize: string; crops: string; }

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({ name: '', phone: '', email: '', village: '', district: '', state: '', pincode: '', farmSize: '', crops: '' });
  const [draft, setDraft] = useState<ProfileData>(profile);

  const loadProfile = useCallback(async () => {
    if (!user) { setLoading(false); return; }
    setLoading(true);
    try {
      const { data } = await supabase.from('user_profiles').select('*').eq('id', user.id).single();
      const p: ProfileData = {
        name: data?.full_name || user.user_metadata?.full_name || '',
        phone: data?.phone || user.user_metadata?.phone || '',
        email: user.email || '',
        village: data?.village || '',
        district: data?.district || '',
        state: data?.state || '',
        pincode: data?.pincode || '',
        farmSize: data?.farm_size || '',
        crops: data?.crops_grown || '',
      };
      setProfile(p);
      setDraft(p);
    } catch {
      // Use auth metadata as fallback
      const p: ProfileData = {
        name: user.user_metadata?.full_name || '',
        phone: user.user_metadata?.phone || '',
        email: user.email || '',
        village: '', district: '', state: '', pincode: '', farmSize: '', crops: '',
      };
      setProfile(p);
      setDraft(p);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const ACCOUNT_LINKS = [
    { icon: ShoppingBag, label: t('myBookingsOrders'), href: '/account/bookings', desc: t('viewRentalPurchaseHistory') },
    { icon: CreditCard, label: t('paymentRefundHistory'), href: '/account/payments', desc: t('transactionsRefunds') },
    { icon: Heart, label: t('wishlist'), href: '/account/wishlist', desc: t('savedEquipmentProducts') },
    { icon: Bell, label: t('notifications'), href: '/account/notifications', desc: t('alertsUpdates') },
    { icon: Shield, label: t('privacySecurity'), href: '#', desc: t('passwordTwoFAData') },
  ];

  async function handleSave() {
    if (!user) return;
    setSaving(true);
    try {
      await supabase.from('user_profiles').upsert({
        id: user.id,
        full_name: draft.name,
        phone: draft.phone,
        village: draft.village,
        district: draft.district,
        state: draft.state,
        pincode: draft.pincode,
        farm_size: draft.farmSize,
        crops_grown: draft.crops,
      });
      setProfile(draft);
      setEditing(false);
      setSaved(true);
      toast.success(t('profileUpdated'));
      setTimeout(() => setSaved(false), 3000);
    } catch {
      toast.error('Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/sign-up-login-screen');
    } catch {
      toast.error('Failed to log out');
    }
  }

  function handleCancel() { setDraft(profile); setEditing(false); }

  const fields: { key: keyof ProfileData; labelKey: string; icon: React.FC<{ size?: number; className?: string }>; type?: string; placeholderKey: string }[] = [
    { key: 'name', labelKey: 'fullName', icon: User, placeholderKey: 'fullName' },
    { key: 'phone', labelKey: 'phoneNumber', icon: Phone, type: 'tel', placeholderKey: 'phoneNumber' },
    { key: 'email', labelKey: 'emailAddress', icon: Mail, type: 'email', placeholderKey: 'emailAddress' },
    { key: 'village', labelKey: 'villageArea', icon: MapPin, placeholderKey: 'villageArea' },
    { key: 'district', labelKey: 'district', icon: MapPin, placeholderKey: 'district' },
    { key: 'state', labelKey: 'state', icon: MapPin, placeholderKey: 'state' },
    { key: 'pincode', labelKey: 'pinCode', icon: MapPin, placeholderKey: 'pinCode' },
    { key: 'farmSize', labelKey: 'farmSize', icon: User, placeholderKey: 'farmSize' },
    { key: 'crops', labelKey: 'cropsGrown', icon: User, placeholderKey: 'cropsGrown' },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="flex items-center justify-center py-20">
          <Loader2 size={32} className="text-primary animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-20 text-center">
          <User size={48} className="text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Sign In Required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to view your profile.</p>
          <Link href="/sign-up-login-screen" className="btn-primary px-8 py-3 rounded-xl font-semibold">Sign In</Link>
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
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{t('profileTitle')}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-24 h-24 rounded-full gradient-green flex items-center justify-center mx-auto"><User size={40} className="text-white" /></div>
                <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"><Camera size={14} /></button>
              </div>
              <p className="font-extrabold text-lg text-foreground">{profile.name || 'Farmer'}</p>
              <p className="text-sm text-muted-foreground mt-0.5">{profile.phone || profile.email}</p>
              <div className="flex items-center justify-center gap-1.5 mt-2"><span className="w-2 h-2 rounded-full bg-success" /><span className="text-xs text-success font-semibold">{t('verifiedFarmer')}</span></div>
              <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                {[{ labelKey: 'bookings', value: 0 }, { labelKey: 'reviews', value: 0 }, { labelKey: 'wishlist', value: 0 }].map(s => (
                  <div key={s.labelKey} className="text-center"><p className="font-bold text-base text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{t(s.labelKey)}</p></div>
                ))}
              </div>
            </div>
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              {ACCOUNT_LINKS.map((item, i) => (
                <Link key={item.href} href={item.href} className={`flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors ${i < ACCOUNT_LINKS.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><item.icon size={15} className="text-primary" /></div>
                  <div className="flex-1 min-w-0"><p className="text-sm font-semibold text-foreground">{item.label}</p><p className="text-xs text-muted-foreground">{item.desc}</p></div>
                  <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                </Link>
              ))}
              <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-danger/5 transition-colors text-danger">
                <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0"><LogOut size={15} className="text-danger" /></div>
                <span className="text-sm font-semibold">{t('logout')}</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-extrabold text-lg text-foreground">{t('personalInfo')}</h2>
                {!editing ? (
                  <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"><Edit3 size={14} /> {t('editProfile')}</button>
                ) : (
                  <div className="flex gap-2">
                    <button onClick={handleCancel} className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">{t('cancel')}</button>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm font-semibold disabled:opacity-60">
                      {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} {t('saveChanges')}
                    </button>
                  </div>
                )}
              </div>
              {saved && <div className="flex items-center gap-2 bg-success/10 border border-success/30 rounded-xl px-4 py-3 mb-4 text-sm text-success font-semibold"><CheckCircle size={16} /> {t('profileUpdated')}</div>}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {fields.map(f => (
                  <div key={f.key} className={f.key === 'crops' ? 'sm:col-span-2' : ''}>
                    <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{t(f.labelKey)}</label>
                    {editing ? (
                      <div className="relative">
                        <f.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <input type={f.type || 'text'} value={draft[f.key]} onChange={e => setDraft(prev => ({ ...prev, [f.key]: e.target.value }))} placeholder={t(f.placeholderKey)} className="input-field pl-9 text-sm w-full" disabled={f.key === 'email'} />
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
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
