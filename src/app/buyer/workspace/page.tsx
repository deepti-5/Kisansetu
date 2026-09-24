'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShoppingBag, Heart, Package, User, Truck, Star, Search, Bell, Calendar, Tractor, Users, LogOut, Edit3, Save, TrendingUp, IndianRupee } from 'lucide-react';
import { toast } from 'sonner';
import ReviewModal from '@/app/components/ReviewModal';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

type BookingStatus = 'confirmed' | 'preparing' | 'rental_active' | 'returned' | 'cancelled' | 'pending';
type Tab = 'overview' | 'rentals' | 'purchases' | 'bookings' | 'saved' | 'account';

interface ActiveRental {
  id: string; equipment: string; category: string; image: string;
  supplier: string; location: string; startDate: string; endDate: string;
  dailyRate: number; totalPaid: number; status: BookingStatus; daysLeft: number;
}

interface SavedItem {
  id: string; name: string; category: string; image: string;
  supplier: string; location: string; rentPerDay: number; rating: number; type: 'equipment' | 'labour';
}

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'text-info bg-info/10 border-info/20',
  preparing: 'text-warning bg-warning/10 border-warning/20',
  rental_active: 'text-success bg-success/10 border-success/20',
  returned: 'text-muted-foreground bg-muted border-border',
  cancelled: 'text-danger bg-danger/10 border-danger/20',
  pending: 'text-warning bg-warning/10 border-warning/20'
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed', preparing: 'Preparing', rental_active: 'Active Rental',
  returned: 'Returned', cancelled: 'Cancelled', pending: 'Pending'
};

interface ProfileData { name: string; phone: string; email: string; village: string; district: string; state: string; farmSize: string; crops: string; }

const MONTHLY_SPEND = [
  { month: 'Apr', amount: 0 }, { month: 'May', amount: 0 },
  { month: 'Jun', amount: 0 }, { month: 'Jul', amount: 0 },
  { month: 'Aug', amount: 0 }, { month: 'Sep', amount: 0 },
];

export default function BuyerWorkspace() {
  const [tab, setTab] = useState<Tab>('overview');
  const [rentals, setRentals] = useState<ActiveRental[]>([]);
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);
  const [loadingRentals, setLoadingRentals] = useState(true);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [editing, setEditing] = useState(false);
  const [rentalFilter, setRentalFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [reviewTarget, setReviewTarget] = useState<ActiveRental | null>(null);
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());
  const [monthlySpend, setMonthlySpend] = useState(MONTHLY_SPEND);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Loading...', phone: '', email: '',
    village: '', district: '', state: '', farmSize: '', crops: ''
  });
  const [draft, setDraft] = useState<ProfileData>(profile);
  const supabase = createClient();
  const { signOut } = useAuth();
  const router = useRouter();

  // Load user profile
  const loadProfile = useCallback(async () => {
    setLoadingProfile(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingProfile(false); return; }
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        const p: ProfileData = {
          name: data.full_name || 'Farmer',
          phone: data.phone || '',
          email: data.email || '',
          village: data.village || '',
          district: data.district || '',
          state: data.state || '',
          farmSize: data.farm_size || '',
          crops: data.crops_grown || '',
        };
        setProfile(p);
        setDraft(p);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    } finally {
      setLoadingProfile(false);
    }
  }, [supabase]);

  // Load bookings/rentals from Supabase
  const loadRentals = useCallback(async () => {
    setLoadingRentals(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingRentals(false); return; }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('buyer_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) { setLoadingRentals(false); return; }

      const mapped: ActiveRental[] = data.map(b => {
        const endDate = new Date(b.end_date);
        const today = new Date();
        const daysLeft = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / 86400000));

        let status: BookingStatus = 'pending';
        if (b.booking_status === 'accepted') status = 'confirmed';
        else if (b.booking_status === 'active') status = 'rental_active';
        else if (b.booking_status === 'completed') status = 'returned';
        else if (b.booking_status === 'cancelled') status = 'cancelled';
        else if (b.booking_status === 'pending') status = 'pending';

        return {
          id: b.booking_ref,
          equipment: b.equipment_name,
          category: b.equipment_category || 'Equipment',
          image: b.equipment_image || 'https://images.unsplash.com/photo-1644828320537-35456847a8c6',
          supplier: b.supplier_name || 'Provider',
          location: b.supplier_location || '',
          startDate: b.start_date,
          endDate: b.end_date,
          dailyRate: Number(b.daily_rate) || 0,
          totalPaid: Number(b.amount_paid) || 0,
          status,
          daysLeft,
        };
      });

      setRentals(mapped);

      // Build monthly spend from real data
      const spendByMonth: Record<string, number> = {};
      data.forEach(b => {
        const month = new Date(b.created_at).toLocaleString('en-US', { month: 'short' });
        spendByMonth[month] = (spendByMonth[month] || 0) + Number(b.amount_paid || 0);
      });
      setMonthlySpend(MONTHLY_SPEND.map(m => ({ ...m, amount: spendByMonth[m.month] || 0 })));

    } catch (err) {
      console.error('Rentals load error:', err);
    } finally {
      setLoadingRentals(false);
    }
  }, [supabase]);

  // Load wishlist from Supabase
  const loadWishlist = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('wishlist')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (data) {
        const mapped: SavedItem[] = data.map(w => ({
          id: w.id,
          name: w.item_name || 'Item',
          category: w.item_type,
          image: w.item_image || 'https://images.unsplash.com/photo-1644828320537-35456847a8c6',
          supplier: 'Provider',
          location: '',
          rentPerDay: Number(w.item_price) || 0,
          rating: 0,
          type: w.item_type === 'labour' ? 'labour' : 'equipment',
        }));
        setSavedItems(mapped);
      }
    } catch (err) {
      console.error('Wishlist load error:', err);
    }
  }, [supabase]);

  useEffect(() => {
    loadProfile();
    loadRentals();
    loadWishlist();
  }, [loadProfile, loadRentals, loadWishlist]);

  async function handleSaveProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      await supabase.from('user_profiles').update({
        full_name: draft.name,
        phone: draft.phone,
        village: draft.village,
        district: draft.district,
        state: draft.state,
        farm_size: draft.farmSize,
        crops_grown: draft.crops,
      }).eq('id', user.id);
      setProfile(draft);
      setEditing(false);
      toast.success('Profile updated!');
    } catch {
      toast.error('Failed to save profile');
    }
  }

  async function removeFromSaved(id: string) {
    try {
      await supabase.from('wishlist').delete().eq('id', id);
      setSavedItems((prev) => prev.filter((s) => s.id !== id));
      toast.success('Removed from saved items');
    } catch {
      setSavedItems((prev) => prev.filter((s) => s.id !== id));
      toast.success('Removed from saved items');
    }
  }

  async function handleSignOut() {
    try {
      await signOut();
      toast.success('Logged out successfully');
      router.push('/sign-up-login-screen');
    } catch {
      toast.error('Failed to log out');
    }
  }

  function handleReviewSubmit(review: { rating: number; comment: string }) {
    if (reviewTarget) {
      setSubmittedReviews((prev) => new Set(prev).add(reviewTarget.id));
      toast.success(`Review submitted! You gave ${review.rating}★`);
    }
  }

  const activeRentals = rentals.filter((r) => r.status === 'rental_active' || r.status === 'confirmed');
  const completedRentals = rentals.filter((r) => r.status === 'returned');
  const totalSpent = rentals.reduce((s, r) => s + r.totalPaid, 0);
  const avgRentalCost = completedRentals.length > 0 ? Math.round(completedRentals.reduce((s, r) => s + r.totalPaid, 0) / completedRentals.length) : 0;
  const maxSpend = Math.max(...monthlySpend.map((d) => d.amount), 1);

  const filteredRentals = rentals.filter((r) => {
    if (rentalFilter === 'active') return r.status === 'rental_active';
    if (rentalFilter === 'upcoming') return r.status === 'confirmed';
    if (rentalFilter === 'completed') return r.status === 'returned';
    return true;
  });

  const TABS: { key: Tab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: ShoppingBag },
    { key: 'rentals', label: 'My Rentals', icon: Tractor },
    { key: 'purchases', label: 'Purchases', icon: Package },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'saved', label: 'Saved Items', icon: Heart },
    { key: 'account', label: 'Account', icon: User }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent/10 text-accent border border-accent/20">🌾 Buyer Workspace</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Welcome, {profile.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{profile.farmSize ? `${profile.farmSize} farm` : 'Farmer'} · {profile.state || 'India'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
              <Bell size={18} />
              {activeRentals.length > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-success text-white text-[9px] font-bold flex items-center justify-center">{activeRentals.length}</span>}
            </button>
            <Link href="/equipment-listing-page" className="btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
              <Search size={16} /> Browse Equipment
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon size={15} /> {t.label}
              {t.key === 'saved' && savedItems.length > 0 && <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">{savedItems.length}</span>}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Active Rentals', value: activeRentals.length, icon: Tractor, color: 'text-success', bg: 'bg-success/10' },
                { label: 'Total Bookings', value: rentals.length, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Total Spent', value: `₹${(totalSpent / 1000).toFixed(0)}k`, icon: IndianRupee, color: 'text-accent', bg: 'bg-accent/10' },
                { label: 'Saved Items', value: savedItems.length, icon: Heart, color: 'text-danger', bg: 'bg-danger/10' }
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon size={18} className={s.color} /></div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Spend Analytics */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Rental Spend Analytics</h2>
              <div className="flex items-end gap-2 h-28 mb-3">
                {monthlySpend.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                      <div className="w-full bg-accent/20 hover:bg-accent/40 rounded-t-md transition-colors cursor-pointer relative" style={{ height: `${(d.amount / maxSpend) * 90}px` }}>
                        {d.amount > 0 && (
                          <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                            ₹{(d.amount / 1000).toFixed(1)}k
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div className="text-center"><p className="text-xs text-muted-foreground">Total Spent</p><p className="font-bold text-sm text-foreground">₹{totalSpent.toLocaleString('en-IN')}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Avg per Rental</p><p className="font-bold text-sm text-foreground">₹{avgRentalCost.toLocaleString('en-IN')}</p></div>
                <div className="text-center"><p className="text-xs text-muted-foreground">Completed</p><p className="font-bold text-sm text-success">{completedRentals.length} rentals</p></div>
              </div>
            </div>

            {activeRentals.length > 0 && (
              <div className="bg-success/5 border border-success/20 rounded-2xl p-4">
                <p className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><Truck size={15} className="text-success" /> Active Rentals</p>
                <div className="space-y-3">
                  {activeRentals.map((r) => (
                    <div key={r.id} className="bg-card rounded-xl p-3 flex items-center gap-3 flex-wrap">
                      <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center shrink-0"><Tractor size={24} className="text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{r.equipment}</p>
                        <p className="text-xs text-muted-foreground">{r.supplier}</p>
                        <p className="text-xs text-muted-foreground">{r.startDate} → {r.endDate}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                        {r.daysLeft > 0 && <p className="text-xs text-warning font-semibold mt-1">{r.daysLeft} days left</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {rentals.length === 0 && !loadingRentals && (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <Tractor size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground mb-2">No bookings yet</p>
                <p className="text-sm text-muted-foreground mb-4">Browse equipment and make your first booking.</p>
                <Link href="/equipment-listing-page" className="btn-primary px-6 py-3 inline-flex items-center gap-2"><Search size={16} /> Browse Equipment</Link>
              </div>
            )}
          </div>
        )}

        {/* RENTALS TAB */}
        {tab === 'rentals' && (
          <div className="space-y-4">
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 overflow-x-auto">
              {(['all', 'active', 'upcoming', 'completed'] as const).map((f) => (
                <button key={f} onClick={() => setRentalFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize whitespace-nowrap ${rentalFilter === f ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{f === 'all' ? 'All' : f === 'active' ? '🟢 Active' : f === 'upcoming' ? '📅 Upcoming' : '✅ Completed'}</button>
              ))}
            </div>
            {loadingRentals ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-28 bg-muted rounded-2xl animate-pulse" />)}</div>
            ) : filteredRentals.length > 0 ? (
              <div className="space-y-3">
                {filteredRentals.map((r) => (
                  <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0"><Tractor size={24} className="text-muted-foreground" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-bold text-sm text-foreground">{r.equipment}</p>
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{r.supplier}</p>
                        <p className="text-xs text-muted-foreground">{r.startDate} → {r.endDate}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-xs font-semibold text-primary">₹{r.totalPaid.toLocaleString('en-IN')} paid</span>
                          {r.daysLeft > 0 && <span className="text-xs text-warning font-semibold">{r.daysLeft} days left</span>}
                        </div>
                        {r.status === 'returned' && !submittedReviews.has(r.id) && (
                          <button onClick={() => setReviewTarget(r)} className="mt-2 text-xs text-accent font-semibold hover:underline flex items-center gap-1"><Star size={11} /> Write Review</button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-card rounded-2xl border border-border">
                <Tractor size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No {rentalFilter !== 'all' ? rentalFilter : ''} rentals found.</p>
              </div>
            )}
          </div>
        )}

        {/* PURCHASES TAB */}
        {tab === 'purchases' && (
          <div className="text-center py-16 bg-card rounded-2xl border border-border">
            <Package size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-bold text-foreground mb-2">No purchases yet</p>
            <p className="text-sm text-muted-foreground mb-4">Browse agri supplies and equipment to buy.</p>
            <Link href="/agri" className="btn-primary px-6 py-3 inline-flex items-center gap-2"><Search size={16} /> Browse Agri Supplies</Link>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div className="space-y-3">
            {loadingRentals ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
            ) : rentals.length > 0 ? (
              rentals.map((r) => (
                <div key={r.id} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="font-bold text-sm text-foreground">{r.equipment}</p>
                      <p className="text-xs text-muted-foreground">{r.supplier} · {r.startDate} → {r.endDate}</p>
                      <p className="text-xs font-semibold text-primary mt-1">₹{r.totalPaid.toLocaleString('en-IN')}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Calendar size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground mb-2">No bookings yet</p>
                <Link href="/equipment-listing-page" className="btn-primary px-6 py-3 inline-flex items-center gap-2"><Search size={16} /> Browse Equipment</Link>
              </div>
            )}
          </div>
        )}

        {/* SAVED ITEMS TAB */}
        {tab === 'saved' && (
          <div className="space-y-4">
            {savedItems.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {savedItems.map((s) => (
                  <div key={s.id} className="bg-card rounded-2xl border border-border p-4 flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      {s.type === 'labour' ? <Users size={24} className="text-muted-foreground" /> : <Tractor size={24} className="text-muted-foreground" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-foreground truncate">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.category}</p>
                      {s.rentPerDay > 0 && <p className="text-xs font-semibold text-primary mt-1">₹{s.rentPerDay.toLocaleString('en-IN')}/day</p>}
                    </div>
                    <button onClick={() => removeFromSaved(s.id)} className="text-danger hover:text-danger/80 transition-colors shrink-0 self-start">✕</button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Heart size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground mb-2">Wishlist is empty</p>
                <p className="text-sm text-muted-foreground mb-4">Save equipment and workers you like.</p>
                <Link href="/equipment-listing-page" className="btn-primary px-6 py-3 inline-flex items-center gap-2"><Search size={16} /> Browse Equipment</Link>
              </div>
            )}
          </div>
        )}

        {/* ACCOUNT TAB */}
        {tab === 'account' && (
          <div className="bg-card rounded-2xl border border-border p-5 max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base text-foreground">My Account</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors"><Edit3 size={14} /> Edit</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { setEditing(false); setDraft(profile); }} className="px-3 py-1.5 rounded-lg border border-border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                  <button onClick={handleSaveProfile} className="flex items-center gap-2 px-3 py-1.5 rounded-lg btn-primary text-sm font-semibold"><Save size={14} /> Save</button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(Object.keys(draft) as (keyof ProfileData)[]).map((key) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground capitalize">{key.replace(/([A-Z])/g, ' $1')}</label>
                  {editing ? (
                    <input value={draft[key]} onChange={(e) => setDraft((p) => ({ ...p, [key]: e.target.value }))} className="w-full mt-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  ) : (
                    <p className="text-sm font-semibold text-foreground mt-1">{profile[key] || '—'}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-5 pt-5 border-t border-border">
              <Link href="/supplier/hub" className="flex items-center gap-3 p-3 rounded-xl border border-primary/20 bg-primary/5 text-primary font-semibold text-sm hover:bg-primary/10 transition-colors mb-3">
                <Tractor size={16} /> Switch to Supplier Mode
              </Link>
              <button onClick={handleSignOut} className="flex items-center gap-3 w-full p-3 rounded-xl border border-danger/20 bg-danger/5 text-danger font-semibold text-sm hover:bg-danger/10 transition-colors">
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />

      {reviewTarget && (
        <ReviewModal
          isOpen={!!reviewTarget}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReviewSubmit}
          equipmentName={reviewTarget.equipment}
          bookingId={reviewTarget.id}
          supplierName={reviewTarget.supplier}
        />
      )}
    </div>
  );
}