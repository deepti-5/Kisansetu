'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { LayoutDashboard, Package, Calendar, IndianRupee, User, Settings, Plus, Star, CheckCircle, XCircle, Eye, Edit, Bell, ChevronRight, ArrowUpRight, Phone, Save, TrendingUp, Tractor, LogOut, Shield, Edit3, BarChart2, MessageSquare, Wifi } from 'lucide-react';
import { toast } from 'sonner';
import ReviewsList, { SAMPLE_REVIEWS } from '@/app/components/ReviewsList';
import { createClient } from '@/lib/supabase/client';

interface Listing {
  id: string; name: string; category: string; type: 'tractor' | 'equipment';
  image: string; rentPerDay: number; status: 'active' | 'paused' | 'pending';
  bookings: number; rating: number; earnings: number; location: string;
}

interface BookingReq {
  id: string; equipment: string; farmer: string; phone: string;
  startDate: string; endDate: string; amount: number;
  status: 'pending' | 'accepted' | 'declined'; type: 'rent' | 'buy';
  dbId?: string;
}

const WEEKLY_REVENUE = [
  { week: 'W1 Aug', amount: 12500 }, { week: 'W2 Aug', amount: 18200 },
  { week: 'W3 Aug', amount: 9800 }, { week: 'W4 Aug', amount: 22400 },
  { week: 'W1 Sep', amount: 15600 }, { week: 'W2 Sep', amount: 28900 },
  { week: 'W3 Sep', amount: 19300 }, { week: 'W4 Sep', amount: 15000 },
];

const MONTHLY_REVENUE = [
  { month: 'Apr', amount: 38000 }, { month: 'May', amount: 52000 },
  { month: 'Jun', amount: 61000 }, { month: 'Jul', amount: 47000 },
  { month: 'Aug', amount: 62900 }, { month: 'Sep', amount: 78800 },
];

const UPCOMING_BOOKINGS = [
  { id: 'BKG12350', equipment: 'Mahindra Yuvo 575 DI Tractor', farmer: 'Anil Sharma', startDate: '2026-09-26', endDate: '2026-09-28', amount: 7500, daysUntil: 2 },
  { id: 'BKG12351', equipment: 'John Deere 5050D Tractor', farmer: 'Kavita More', startDate: '2026-09-30', endDate: '2026-10-02', amount: 9600, daysUntil: 6 },
];

type Tab = 'overview' | 'listings' | 'bookings' | 'earnings' | 'reviews' | 'profile' | 'settings';

interface ProfileData { name: string; phone: string; email: string; village: string; district: string; state: string; pincode: string; businessName: string; experience: string; }

export default function SupplierHub() {
  const [tab, setTab] = useState<Tab>('overview');
  const [listings, setListings] = useState<Listing[]>([]);
  const [bookings, setBookings] = useState<BookingReq[]>([]);
  const [listingFilter, setListingFilter] = useState<'all' | 'tractor' | 'equipment'>('all');
  const [editing, setEditing] = useState(false);
  const [revenuePeriod, setRevenuePeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [newBookingAlert, setNewBookingAlert] = useState<BookingReq | null>(null);
  const [loadingListings, setLoadingListings] = useState(true);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Loading...', phone: '', email: '',
    village: '', district: '', state: '', pincode: '',
    businessName: '', experience: ''
  });
  const [draft, setDraft] = useState<ProfileData>(profile);
  const supabase = createClient();

  // Load provider profile
  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      if (data) {
        const p: ProfileData = {
          name: data.full_name || 'Provider',
          phone: data.phone || '',
          email: data.email || '',
          village: data.village || '',
          district: data.district || '',
          state: data.state || '',
          pincode: data.pin_code || '',
          businessName: data.business_name || '',
          experience: data.experience_years ? `${data.experience_years} years` : '',
        };
        setProfile(p);
        setDraft(p);
      }
    } catch (err) {
      console.error('Profile load error:', err);
    }
  }, [supabase]);

  // Load equipment listings from DB
  const loadListings = useCallback(async () => {
    setLoadingListings(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingListings(false); return; }

      const { data, error } = await supabase
        .from('equipment')
        .select('id, name, category, rent_per_day, status, is_available, location, avg_rating, review_count')
        .eq('provider_id', user.id)
        .order('created_at', { ascending: false });

      if (error || !data) { setLoadingListings(false); return; }

      // Also get booking counts per equipment
      const equipmentIds = data.map(e => e.id);
      let bookingCounts: Record<string, number> = {};
      if (equipmentIds.length > 0) {
        const { data: bData } = await supabase
          .from('bookings')
          .select('equipment_name')
          .in('booking_status', ['accepted', 'active', 'completed']);
        if (bData) {
          bData.forEach(b => {
            const match = data.find(e => e.name === b.equipment_name);
            if (match) bookingCounts[match.id] = (bookingCounts[match.id] || 0) + 1;
          });
        }
      }

      const mapped: Listing[] = data.map(e => ({
        id: e.id,
        name: e.name,
        category: e.category,
        type: e.category?.toLowerCase() === 'tractor' ? 'tractor' : 'equipment',
        image: 'https://images.unsplash.com/photo-1644828320537-35456847a8c6',
        rentPerDay: Number(e.rent_per_day) || 0,
        status: e.status === 'active' ? 'active' : e.status === 'paused' ? 'paused' : 'pending',
        bookings: bookingCounts[e.id] || 0,
        rating: Number(e.avg_rating) || 0,
        earnings: (bookingCounts[e.id] || 0) * (Number(e.rent_per_day) || 0),
        location: e.location || '',
      }));

      setListings(mapped);
    } catch (err) {
      console.error('Listings load error:', err);
    } finally {
      setLoadingListings(false);
    }
  }, [supabase]);

  // Load bookings from Supabase
  const loadBookingsFromDB = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingBookings(false); return; }

      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('supplier_id', user.id)
        .order('created_at', { ascending: false })
        .limit(30);

      if (error || !data || data.length === 0) {
        // Also try loading all bookings (for demo mode where supplier_id may not be set)
        const { data: allData } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(20);

        if (allData && allData.length > 0) {
          const dbBookings: BookingReq[] = allData.map((b) => ({
            id: b.booking_ref,
            equipment: b.equipment_name,
            farmer: b.buyer_name,
            phone: b.buyer_phone || '',
            startDate: b.start_date,
            endDate: b.end_date,
            amount: Number(b.total_amount),
            status: b.booking_status === 'accepted' ? 'accepted' : b.booking_status === 'declined' ? 'declined' : 'pending',
            type: 'rent' as const,
            dbId: b.id,
          }));
          setBookings(dbBookings);
        }
        setLoadingBookings(false);
        return;
      }

      const dbBookings: BookingReq[] = data.map((b) => ({
        id: b.booking_ref,
        equipment: b.equipment_name,
        farmer: b.buyer_name,
        phone: b.buyer_phone || '',
        startDate: b.start_date,
        endDate: b.end_date,
        amount: Number(b.total_amount),
        status: b.booking_status === 'accepted' ? 'accepted' : b.booking_status === 'declined' ? 'declined' : 'pending',
        type: 'rent' as const,
        dbId: b.id,
      }));
      setBookings(dbBookings);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [supabase]);

  // Real-time listener for new bookings
  useEffect(() => {
    loadProfile();
    loadListings();
    loadBookingsFromDB();

    const channel = supabase
      .channel('supplier-bookings-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const newBooking = payload.new as Record<string, unknown>;
        const bookingReq: BookingReq = {
          id: newBooking.booking_ref as string,
          equipment: newBooking.equipment_name as string,
          farmer: newBooking.buyer_name as string,
          phone: (newBooking.buyer_phone as string) || '',
          startDate: newBooking.start_date as string,
          endDate: newBooking.end_date as string,
          amount: newBooking.total_amount as number,
          status: 'pending',
          type: 'rent',
          dbId: newBooking.id as string,
        };
        setBookings((prev) => [bookingReq, ...prev]);
        setNewBookingAlert(bookingReq);
        toast.success(`🔔 New booking from ${newBooking.buyer_name}!`, { duration: 6000 });
        setTimeout(() => setNewBookingAlert(null), 8000);
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
        const updated = payload.new as Record<string, unknown>;
        setBookings((prev) =>
          prev.map((b) =>
            b.id === updated.booking_ref
              ? { ...b, status: updated.booking_status === 'accepted' ? 'accepted' : updated.booking_status === 'declined' ? 'declined' : 'pending' }
              : b
          )
        );
      })
      .subscribe((status) => {
        setIsRealtimeConnected(status === 'SUBSCRIBED');
      });

    return () => { supabase.removeChannel(channel); };
  }, [loadProfile, loadListings, loadBookingsFromDB, supabase]);

  async function handleBookingAction(bookingId: string, action: 'accepted' | 'declined') {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (booking.dbId) {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: action })
        .eq('id', booking.dbId);
      if (error) { console.error('Error updating booking:', error); }
    }

    setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status: action } : b)));
    toast.success(`Booking ${action === 'accepted' ? 'accepted ✅' : 'declined'}!`);
  }

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
        pin_code: draft.pincode,
        business_name: draft.businessName,
        experience_years: parseInt(draft.experience) || 0,
      }).eq('id', user.id);
      setProfile(draft);
      setEditing(false);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to save profile');
    }
  }

  const totalEarnings = listings.reduce((s, l) => s + l.earnings, 0);
  const activeListings = listings.filter((l) => l.status === 'active').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted').length;
  const filteredListings = listings.filter((l) => listingFilter === 'all' ? true : l.type === listingFilter);

  const revenueData = revenuePeriod === 'weekly' ? WEEKLY_REVENUE : MONTHLY_REVENUE;
  const maxRevenue = Math.max(...revenueData.map((d) => d.amount));
  const topEquipment = [...listings].sort((a, b) => b.earnings - a.earnings).slice(0, 3);

  const TABS: { key: Tab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: LayoutDashboard },
    { key: 'listings', label: 'My Listings', icon: Package },
    { key: 'bookings', label: 'Bookings', icon: Calendar },
    { key: 'earnings', label: 'Earnings', icon: IndianRupee },
    { key: 'reviews', label: 'Reviews', icon: Star },
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">🚜 Supplier Hub</span>
              {isRealtimeConnected && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />Live
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Welcome, {profile.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{profile.businessName || 'Supplier'} · {profile.state || 'India'}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
              <Bell size={18} />
              {pendingBookings > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">{pendingBookings}</span>}
            </button>
            <Link href="/supplier/add-listing" className="btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
              <Plus size={16} /> Add Listing
            </Link>
          </div>
        </div>

        {/* New Booking Alert Banner */}
        {newBookingAlert && (
          <div className="bg-success/10 border border-success/30 rounded-xl p-4 mb-4 flex items-center gap-3">
            <Wifi size={18} className="text-success shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-sm text-foreground">🔔 New Booking Request!</p>
              <p className="text-xs text-muted-foreground">{newBookingAlert.farmer} wants to rent <strong>{newBookingAlert.equipment}</strong> — ₹{newBookingAlert.amount.toLocaleString('en-IN')}</p>
            </div>
            <button onClick={() => { setTab('bookings'); setNewBookingAlert(null); }} className="text-xs font-semibold text-success hover:underline shrink-0">View →</button>
          </div>
        )}

        {/* Tab Nav */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon size={15} /> {t.label}
              {t.key === 'bookings' && pendingBookings > 0 && <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{pendingBookings}</span>}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success', bg: 'bg-success/10', change: `${listings.length} listings` },
                { label: 'Active Listings', value: activeListings, icon: Package, color: 'text-primary', bg: 'bg-primary/10', change: `${listings.length} total` },
                { label: 'Active Bookings', value: acceptedBookings, icon: Calendar, color: 'text-accent', bg: 'bg-accent/10', change: `${pendingBookings} pending` },
                { label: 'Avg Rating', value: listings.length > 0 ? `${(listings.reduce((s, l) => s + l.rating, 0) / listings.length || 0).toFixed(1)} ★` : '—', icon: Star, color: 'text-warning', bg: 'bg-warning/10', change: `${listings.reduce((s, l) => s + l.bookings, 0)} bookings` }
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-0.5"><ArrowUpRight size={12} />{s.change}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Revenue Chart */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                <h2 className="font-bold text-base text-foreground flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Revenue Trends</h2>
                <div className="flex items-center gap-1 bg-muted/50 rounded-lg p-1">
                  {(['weekly', 'monthly'] as const).map((p) => (
                    <button key={p} onClick={() => setRevenuePeriod(p)} className={`px-3 py-1 rounded-md text-xs font-semibold transition-all capitalize ${revenuePeriod === p ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{p}</button>
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-2 h-32">
                {revenueData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full">
                      <div className="w-full bg-primary/20 rounded-t-md group-hover:bg-primary/40 transition-colors cursor-pointer" style={{ height: `${(d.amount / maxRevenue) * 100}px` }}>
                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap">₹{(d.amount / 1000).toFixed(0)}k</div>
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground text-center leading-tight">{revenuePeriod === 'weekly' ? (d as typeof WEEKLY_REVENUE[0]).week : (d as typeof MONTHLY_REVENUE[0]).month}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Top Equipment */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-base text-foreground flex items-center gap-2"><BarChart2 size={16} className="text-primary" /> Top Equipment</h2>
                  <button onClick={() => setTab('listings')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></button>
                </div>
                {loadingListings ? (
                  <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-12 bg-muted rounded-xl animate-pulse" />)}</div>
                ) : topEquipment.length > 0 ? (
                  <div className="space-y-3">
                    {topEquipment.map((l, idx) => (
                      <div key={l.id} className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-extrabold shrink-0 ${idx === 0 ? 'bg-warning text-white' : idx === 1 ? 'bg-muted-foreground/30 text-foreground' : 'bg-muted text-muted-foreground'}`}>{idx + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{l.name}</p>
                          <p className="text-xs text-muted-foreground">{l.bookings} bookings · {l.rating > 0 ? `${l.rating}★` : 'No ratings yet'}</p>
                        </div>
                        <p className="font-bold text-success text-sm shrink-0">₹{l.earnings.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No listings yet.</p>
                    <Link href="/supplier/add-listing" className="text-primary text-sm font-semibold hover:underline mt-1 inline-block">Add your first listing →</Link>
                  </div>
                )}
              </div>

              {/* Upcoming Bookings */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-base text-foreground flex items-center gap-2"><Calendar size={16} className="text-primary" /> Upcoming Bookings</h2>
                  <button onClick={() => setTab('bookings')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">All <ChevronRight size={14} /></button>
                </div>
                {loadingBookings ? (
                  <div className="space-y-3">{[1,2].map(i => <div key={i} className="h-14 bg-muted rounded-xl animate-pulse" />)}</div>
                ) : bookings.filter(b => b.status === 'accepted').length > 0 ? (
                  <div className="space-y-3">
                    {bookings.filter(b => b.status === 'accepted').slice(0, 3).map((b) => (
                      <div key={b.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex flex-col items-center justify-center shrink-0">
                          <Calendar size={16} className="text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{b.equipment}</p>
                          <p className="text-xs text-muted-foreground">{b.farmer} · {b.startDate}</p>
                        </div>
                        <p className="font-bold text-success text-sm shrink-0">₹{b.amount.toLocaleString('en-IN')}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No upcoming bookings.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* LISTINGS TAB */}
        {tab === 'listings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1">
                {(['all', 'tractor', 'equipment'] as const).map((f) => (
                  <button key={f} onClick={() => setListingFilter(f)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${listingFilter === f ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>{f === 'all' ? 'All' : f === 'tractor' ? '🚜 Tractors' : '⚙️ Equipment'}</button>
                ))}
              </div>
              <Link href="/supplier/add-listing" className="btn-primary px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2"><Plus size={14} /> Add New</Link>
            </div>
            {loadingListings ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{[1,2,3,4].map(i => <div key={i} className="h-32 bg-muted rounded-2xl animate-pulse" />)}</div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredListings.map((l) => (
                  <div key={l.id} className="bg-card rounded-2xl border border-border p-4 flex gap-4">
                    <div className="w-20 h-20 rounded-xl bg-muted shrink-0 flex items-center justify-center">
                      <Tractor size={28} className="text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm text-foreground truncate">{l.name}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${l.status === 'active' ? 'bg-success/10 text-success' : l.status === 'paused' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>{l.status}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{l.category} · {l.location}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-semibold text-primary">₹{l.rentPerDay.toLocaleString('en-IN')}/day</span>
                        <span className="text-xs text-muted-foreground">{l.bookings} bookings</span>
                        {l.rating > 0 && <span className="text-xs text-warning">{l.rating}★</span>}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <button className="text-xs text-primary font-semibold flex items-center gap-1 hover:underline"><Edit size={11} /> Edit</button>
                        <button className="text-xs text-muted-foreground font-semibold flex items-center gap-1 hover:underline"><Eye size={11} /> View</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Package size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground mb-2">No listings yet</p>
                <p className="text-sm text-muted-foreground mb-4">Add your first equipment to start receiving bookings.</p>
                <Link href="/supplier/add-listing" className="btn-primary px-6 py-3 inline-flex items-center gap-2"><Plus size={16} /> Add First Listing</Link>
              </div>
            )}
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-base text-foreground">Booking Requests</h2>
              <div className="flex items-center gap-2">
                {isRealtimeConnected && <span className="flex items-center gap-1 text-xs text-success font-medium"><Wifi size={12} /><span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />Live</span>}
                {pendingBookings > 0 && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-danger/10 text-danger border border-danger/20">{pendingBookings} pending</span>}
              </div>
            </div>
            {loadingBookings ? (
              <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}</div>
            ) : bookings.length > 0 ? (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b.id} className={`bg-card rounded-2xl border p-4 ${b.status === 'pending' ? 'border-warning/30' : 'border-border'}`}>
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-bold text-sm text-foreground">{b.equipment}</p>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'pending' ? 'bg-warning/10 text-warning' : b.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>{b.status}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                          <span className="flex items-center gap-1"><User size={11} /> {b.farmer}</span>
                          {b.phone && <span className="flex items-center gap-1"><Phone size={11} /> {b.phone}</span>}
                          <span className="flex items-center gap-1"><Calendar size={11} /> {b.startDate} → {b.endDate}</span>
                        </div>
                        <p className="font-bold text-success text-sm mt-1">₹{b.amount.toLocaleString('en-IN')}</p>
                      </div>
                      {b.status === 'pending' && (
                        <div className="flex items-center gap-2 shrink-0">
                          <button onClick={() => handleBookingAction(b.id, 'accepted')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-semibold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Accept</button>
                          <button onClick={() => handleBookingAction(b.id, 'declined')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors"><XCircle size={13} /> Decline</button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Calendar size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground mb-2">No bookings yet</p>
                <p className="text-sm text-muted-foreground">Bookings will appear here when farmers rent your equipment.</p>
              </div>
            )}
          </div>
        )}

        {/* EARNINGS TAB */}
        {tab === 'earnings' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { label: 'Total Earned', value: `₹${totalEarnings.toLocaleString('en-IN')}`, color: 'text-success' },
                { label: 'Active Bookings', value: acceptedBookings, color: 'text-primary' },
                { label: 'Pending Payout', value: '—', color: 'text-warning' }
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4 text-center">
                  <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Revenue by Equipment</h2>
              {listings.length > 0 ? (
                <div className="space-y-3">
                  {listings.map((l) => (
                    <div key={l.id} className="flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{l.name}</p>
                        <div className="w-full bg-muted rounded-full h-1.5 mt-1">
                          <div className="bg-primary h-1.5 rounded-full" style={{ width: totalEarnings > 0 ? `${(l.earnings / totalEarnings) * 100}%` : '0%' }} />
                        </div>
                      </div>
                      <p className="font-bold text-success text-sm shrink-0">₹{l.earnings.toLocaleString('en-IN')}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No earnings data yet. Add listings and receive bookings to see earnings.</p>
              )}
            </div>
          </div>
        )}

        {/* REVIEWS TAB */}
        {tab === 'reviews' && <ReviewsList reviews={SAMPLE_REVIEWS} />}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="bg-card rounded-2xl border border-border p-5 max-w-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-base text-foreground">Profile Information</h2>
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
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === 'settings' && (
          <div className="space-y-4 max-w-2xl">
            {[
              { icon: Bell, label: 'Push Notifications', desc: 'Get notified for new bookings', checked: true },
              { icon: MessageSquare, label: 'SMS Alerts', desc: 'Receive SMS for booking updates', checked: true },
              { icon: Shield, label: 'Two-Factor Auth', desc: 'Extra security for your account', checked: false },
            ].map((s) => (
              <div key={s.label} className="bg-card rounded-2xl border border-border p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><s.icon size={18} className="text-primary" /></div>
                  <div><p className="font-semibold text-sm text-foreground">{s.label}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                </div>
                <button className={`w-11 h-6 rounded-full transition-colors ${s.checked ? 'bg-primary' : 'bg-muted'} relative`}>
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${s.checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
            ))}
            <button className="flex items-center gap-3 w-full p-4 rounded-2xl border border-danger/20 bg-danger/5 text-danger font-semibold text-sm hover:bg-danger/10 transition-colors">
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}