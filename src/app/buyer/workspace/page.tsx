'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ShoppingBag, Heart, Package, User, Truck, RotateCcw, MapPin, Star, ChevronRight, Search, Bell, Calendar, Eye, Tractor, Wrench, Users, LogOut, Shield, Edit3, Save, Camera, Phone, Mail, TrendingUp, BarChart2, IndianRupee, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import ReviewModal from '@/app/components/ReviewModal';

type BookingStatus = 'confirmed' | 'preparing' | 'rental_active' | 'returned' | 'cancelled' | 'pending';
type Tab = 'overview' | 'rentals' | 'purchases' | 'bookings' | 'saved' | 'account';

interface ActiveRental {
  id: string;equipment: string;category: string;image: string;
  supplier: string;location: string;startDate: string;endDate: string;
  dailyRate: number;totalPaid: number;status: BookingStatus;daysLeft: number;
}

interface SavedItem {
  id: string;name: string;category: string;image: string;
  supplier: string;location: string;rentPerDay: number;rating: number;type: 'equipment' | 'labour';
}

const ACTIVE_RENTALS: ActiveRental[] = [
{ id: 'BKG82341', equipment: 'Mahindra 575 DI Tractor', category: 'Tractor', image: 'https://images.unsplash.com/photo-1708417134916-234bb4b33881', supplier: 'Ramesh Agro Services', location: 'Pune, Maharashtra', startDate: '2026-09-20', endDate: '2026-09-24', dailyRate: 2500, totalPaid: 10000, status: 'rental_active', daysLeft: 2 },
{ id: 'BKG71209', equipment: 'Rotavator 7-Feet Heavy Duty', category: 'Tillage', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_163ecef60-1784222686661.png', supplier: 'Singh Farm Machinery', location: 'Nashik, Maharashtra', startDate: '2026-09-15', endDate: '2026-09-17', dailyRate: 1200, totalPaid: 3600, status: 'returned', daysLeft: 0 },
{ id: 'BKG65890', equipment: 'Paddy Transplanter 8-Row', category: 'Planting', image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d', supplier: 'Green Fields Equipment', location: 'Kolhapur, Maharashtra', startDate: '2026-09-25', endDate: '2026-09-27', dailyRate: 3500, totalPaid: 7000, status: 'confirmed', daysLeft: 3 },
{ id: 'BKG55123', equipment: 'John Deere 5050D Tractor', category: 'Tractor', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449', supplier: 'Patil Agro Services', location: 'Pune, Maharashtra', startDate: '2026-08-10', endDate: '2026-08-13', dailyRate: 3200, totalPaid: 9600, status: 'returned', daysLeft: 0 },
{ id: 'BKG44890', equipment: 'Massey Ferguson 241 DI', category: 'Tractor', image: 'https://images.unsplash.com/photo-1644828320537-35456847a8c6', supplier: 'Rajesh Patil Agro', location: 'Pune, Maharashtra', startDate: '2026-07-20', endDate: '2026-07-22', dailyRate: 2500, totalPaid: 5000, status: 'returned', daysLeft: 0 }];

const PURCHASES = [
{ id: 'PUR001', name: 'Organic Fertilizer 50kg Bag', category: 'Agri Supplies', image: "https://img.rocket.new/generatedImages/rocket_gen_img_13a690c93-1767884141665.png", supplier: 'KisanMart', date: '2026-09-10', amount: 1200, status: 'delivered' },
{ id: 'PUR002', name: 'Drip Irrigation Kit 1 Acre', category: 'Irrigation', image: "https://img.rocket.new/generatedImages/rocket_gen_img_155d1b283-1769227974139.png", supplier: 'AgroTech Solutions', date: '2026-09-05', amount: 4500, status: 'delivered' }];

const SAVED_ITEMS: SavedItem[] = [
{ id: 's1', name: 'John Deere 5050D Tractor', category: 'Tractor', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449', supplier: 'Patil Agro Services', location: 'Pune, Maharashtra', rentPerDay: 3200, rating: 4.7, type: 'equipment' },
{ id: 's2', name: 'Mini Power Tiller 7HP', category: 'Tiller', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e7a72901-1768249566100.png', supplier: 'Kisan Tools Hub', location: 'Aurangabad, Maharashtra', rentPerDay: 800, rating: 4.3, type: 'equipment' },
{ id: 's3', name: 'Ramesh Yadav — Harvesting Expert', category: 'Labour', image: "https://img.rocket.new/generatedImages/rocket_gen_img_19cff3ddb-1763296180195.png", supplier: 'Individual', location: 'Solapur, Maharashtra', rentPerDay: 600, rating: 4.8, type: 'labour' }];

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

interface ProfileData {name: string;phone: string;email: string;village: string;district: string;state: string;farmSize: string;crops: string;}

// Monthly spend data for analytics
const MONTHLY_SPEND = [
  { month: 'Apr', amount: 5000 },
  { month: 'May', amount: 12500 },
  { month: 'Jun', amount: 7000 },
  { month: 'Jul', amount: 5000 },
  { month: 'Aug', amount: 14600 },
  { month: 'Sep', amount: 20600 },
];

export default function BuyerWorkspace() {
  const [tab, setTab] = useState<Tab>('overview');
  const [savedItems, setSavedItems] = useState(SAVED_ITEMS);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState(false);
  const [rentalFilter, setRentalFilter] = useState<'all' | 'active' | 'upcoming' | 'completed'>('all');
  const [reviewTarget, setReviewTarget] = useState<ActiveRental | null>(null);
  const [submittedReviews, setSubmittedReviews] = useState<Set<string>>(new Set());
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Suresh Yadav', phone: '+91 98765 11111', email: 'suresh.yadav@gmail.com',
    village: 'Hadapsar', district: 'Pune', state: 'Maharashtra', farmSize: '8 acres', crops: 'Wheat, Sugarcane'
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  const activeRentals = ACTIVE_RENTALS.filter((r) => r.status === 'rental_active' || r.status === 'confirmed');
  const completedRentals = ACTIVE_RENTALS.filter((r) => r.status === 'returned');
  const totalSpent = ACTIVE_RENTALS.reduce((s, r) => s + r.totalPaid, 0) + PURCHASES.reduce((s, p) => s + p.amount, 0);
  const avgRentalCost = completedRentals.length > 0 ? Math.round(completedRentals.reduce((s, r) => s + r.totalPaid, 0) / completedRentals.length) : 0;
  const maxSpend = Math.max(...MONTHLY_SPEND.map((d) => d.amount));

  const savedEquipmentCount = savedItems.filter((s) => s.type === 'equipment').length;
  const savedLabourCount = savedItems.filter((s) => s.type === 'labour').length;
  const avgSavedRating = savedItems.length > 0 ? (savedItems.reduce((s, i) => s + i.rating, 0) / savedItems.length).toFixed(1) : '—';
  const avgSavedRate = savedItems.filter((s) => s.type === 'equipment').length > 0
    ? Math.round(savedItems.filter((s) => s.type === 'equipment').reduce((s, i) => s + i.rentPerDay, 0) / savedItems.filter((s) => s.type === 'equipment').length)
    : 0;

  const filteredRentals = ACTIVE_RENTALS.filter((r) => {
    if (rentalFilter === 'active') return r.status === 'rental_active';
    if (rentalFilter === 'upcoming') return r.status === 'confirmed';
    if (rentalFilter === 'completed') return r.status === 'returned';
    return true;
  });

  const TABS: {key: Tab;label: string;icon: React.FC<{size?: number;className?: string;}>;}[] = [
  { key: 'overview', label: 'Overview', icon: ShoppingBag },
  { key: 'rentals', label: 'My Rentals', icon: Tractor },
  { key: 'purchases', label: 'Purchases', icon: Package },
  { key: 'bookings', label: 'Bookings', icon: Calendar },
  { key: 'saved', label: 'Saved Items', icon: Heart },
  { key: 'account', label: 'Account', icon: User }];

  function removeFromSaved(id: string) {
    setSavedItems((prev) => prev.filter((s) => s.id !== id));
    toast.success('Removed from saved items');
  }

  function handleReviewSubmit(review: { rating: number; comment: string }) {
    if (reviewTarget) {
      setSubmittedReviews((prev) => new Set(prev).add(reviewTarget.id));
      toast.success(`Review submitted! You gave ${review.rating}★`);
    }
  }

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
            <p className="text-sm text-muted-foreground mt-0.5">{profile.farmSize} farm · {profile.state}</p>
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
          {TABS.map((t) =>
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon size={15} /> {t.label}
              {t.key === 'saved' && savedItems.length > 0 && <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[10px] font-bold flex items-center justify-center">{savedItems.length}</span>}
            </button>
          )}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' &&
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
            { label: 'Active Rentals', value: activeRentals.length, icon: Tractor, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Total Bookings', value: ACTIVE_RENTALS.length, icon: Calendar, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Total Spent', value: `₹${(totalSpent / 1000).toFixed(0)}k`, icon: IndianRupee, color: 'text-accent', bg: 'bg-accent/10' },
            { label: 'Saved Items', value: savedItems.length, icon: Heart, color: 'text-danger', bg: 'bg-danger/10' }].
            map((s) =>
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                  <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center mb-3`}><s.icon size={18} className={s.color} /></div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
            )}
            </div>

            {/* Rental History Analytics */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Rental Spend Analytics</h2>
              <div className="flex items-end gap-2 h-28 mb-3">
                {MONTHLY_SPEND.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="relative w-full flex items-end justify-center" style={{ height: '100px' }}>
                      <div
                        className="w-full bg-accent/20 hover:bg-accent/40 rounded-t-md transition-colors cursor-pointer relative"
                        style={{ height: `${(d.amount / maxSpend) * 90}px` }}
                      >
                        <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background text-[10px] font-bold px-1.5 py-0.5 rounded whitespace-nowrap z-10">
                          ₹{(d.amount / 1000).toFixed(1)}k
                        </div>
                      </div>
                    </div>
                    <span className="text-[9px] text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="font-bold text-sm text-foreground">₹{totalSpent.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Avg per Rental</p>
                  <p className="font-bold text-sm text-foreground">₹{avgRentalCost.toLocaleString('en-IN')}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">Completed</p>
                  <p className="font-bold text-sm text-success">{completedRentals.length} rentals</p>
                </div>
              </div>
            </div>

            {activeRentals.length > 0 &&
          <div className="bg-success/5 border border-success/20 rounded-2xl p-4">
                <p className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><Truck size={15} className="text-success" /> Active Rentals</p>
                <div className="space-y-3">
                  {activeRentals.map((r) =>
              <div key={r.id} className="bg-card rounded-xl p-3 flex items-center gap-3 flex-wrap">
                      <img src={r.image} alt={r.equipment} className="w-14 h-14 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{r.equipment}</p>
                        <p className="text-xs text-muted-foreground">{r.supplier} · {r.location}</p>
                        <p className="text-xs text-muted-foreground">{r.startDate} → {r.endDate}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                        {r.daysLeft > 0 && <p className="text-xs text-warning font-semibold mt-1">{r.daysLeft} days left</p>}
                      </div>
                    </div>
              )}
                </div>
              </div>
          }

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Saved Items Stats */}
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-base text-foreground flex items-center gap-2"><Heart size={15} className="text-danger" /> Saved Items Stats</h2>
                  <button onClick={() => setTab('saved')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></button>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  {[
                { label: 'Equipment', value: savedEquipmentCount, color: 'text-primary', bg: 'bg-primary/10' },
                { label: 'Labour', value: savedLabourCount, color: 'text-accent', bg: 'bg-accent/10' },
                { label: 'Avg Rating', value: `${avgSavedRating}★`, color: 'text-warning', bg: 'bg-warning/10' },
                { label: 'Avg Rate/Day', value: avgSavedRate > 0 ? `₹${avgSavedRate}` : '—', color: 'text-success', bg: 'bg-success/10' }].
                map((s) =>
                <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                      <p className={`font-extrabold text-lg ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                    </div>
                )}
                </div>
                <div className="space-y-2">
                  {savedItems.slice(0, 2).map((s) =>
                <div key={s.id} className="flex items-center gap-3">
                      <img src={s.image} alt={s.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{s.name}</p>
                        <p className="text-xs text-muted-foreground">₹{s.rentPerDay}/day · {s.rating}★</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.type === 'labour' ? 'bg-accent/10 text-accent' : 'bg-primary/10 text-primary'}`}>{s.type === 'labour' ? 'Labour' : 'Equipment'}</span>
                    </div>
                )}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-base text-foreground">Recent Bookings</h2>
                  <button onClick={() => setTab('bookings')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></button>
                </div>
                <div className="space-y-3">
                  {ACTIVE_RENTALS.slice(0, 3).map((r) =>
                <div key={r.id} className="flex items-center gap-3">
                      <img src={r.image} alt={r.equipment} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{r.equipment}</p>
                        <p className="text-xs text-muted-foreground">{r.startDate} → {r.endDate}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                    </div>
                )}
                </div>
              </div>
            </div>
          </div>
        }

        {/* RENTALS TAB */}
        {tab === 'rentals' &&
        <div className="space-y-4">
            {/* Rental Analytics Summary */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h2 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><BarChart2 size={15} className="text-primary" /> Rental History Analytics</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
              { label: 'Total Rentals', value: ACTIVE_RENTALS.length, color: 'text-foreground' },
              { label: 'Completed', value: completedRentals.length, color: 'text-success' },
              { label: 'Total Spent', value: `₹${ACTIVE_RENTALS.reduce((s, r) => s + r.totalPaid, 0).toLocaleString('en-IN')}`, color: 'text-primary' },
              { label: 'Avg Cost', value: `₹${avgRentalCost.toLocaleString('en-IN')}`, color: 'text-accent' }].
              map((s) =>
              <div key={s.label} className="bg-muted/40 rounded-xl p-3 text-center">
                    <p className={`font-extrabold text-base ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
              )}
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {(['all', 'active', 'upcoming', 'completed'] as const).map((f) =>
            <button key={f} onClick={() => setRentalFilter(f)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all capitalize ${rentalFilter === f ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>{f === 'all' ? 'All' : f === 'active' ? 'Active' : f === 'upcoming' ? 'Upcoming' : 'Completed'}</button>
            )}
            </div>
            <div className="space-y-4">
              {filteredRentals.map((r) =>
            <div key={r.id} className="bg-card rounded-2xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <img src={r.image} alt={r.equipment} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                        <div>
                          <p className="font-bold text-foreground">{r.equipment}</p>
                          <p className="text-xs text-muted-foreground">{r.category} · {r.supplier}</p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={10} />{r.location}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap mb-3">
                        <span className="flex items-center gap-1"><Calendar size={11} />{r.startDate} → {r.endDate}</span>
                        <span className="font-bold text-primary">₹{r.totalPaid.toLocaleString('en-IN')} paid</span>
                        <span>₹{r.dailyRate.toLocaleString('en-IN')}/day</span>
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {(r.status === 'rental_active' || r.status === 'confirmed') &&
                    <Link href={`/booking-confirmation?id=${r.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"><Eye size={13} /> View Details</Link>
                    }
                        {r.status === 'rental_active' &&
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-semibold hover:bg-warning/20 transition-colors"><RotateCcw size={13} /> Return Equipment</button>
                    }
                        {r.status === 'returned' && !submittedReviews.has(r.id) &&
                    <button onClick={() => setReviewTarget(r)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"><Star size={13} /> Write Review</button>
                    }
                        {r.status === 'returned' && submittedReviews.has(r.id) &&
                    <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold"><CheckCircle size={13} /> Reviewed</span>
                    }
                      </div>
                    </div>
                  </div>
                </div>
            )}
              {filteredRentals.length === 0 &&
            <div className="bg-card rounded-2xl border border-border p-12 text-center">
                  <Tractor size={40} className="text-muted-foreground mx-auto mb-3" />
                  <p className="font-bold text-foreground">No rentals found</p>
                  <p className="text-sm text-muted-foreground mt-1">Try a different filter</p>
                </div>
            }
            </div>
          </div>
        }

        {/* PURCHASES TAB */}
        {tab === 'purchases' &&
        <div className="space-y-4">
            {PURCHASES.length === 0 ?
          <div className="bg-card rounded-2xl border border-border p-16 text-center">
                <Package size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold text-xl text-foreground mb-2">No purchases yet</h3>
                <p className="text-muted-foreground text-sm mb-6">Browse agri supplies and equipment to buy</p>
                <Link href="/agri" className="btn-primary">Browse Supplies</Link>
              </div> :
          PURCHASES.map((p) =>
          <div key={p.id} className="bg-card rounded-2xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <img src={p.image} alt={p.name} className="w-20 h-20 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                        <div>
                          <p className="font-bold text-foreground">{p.name}</p>
                          <p className="text-xs text-muted-foreground">{p.category} · {p.supplier}</p>
                          <p className="text-xs text-muted-foreground">#{p.id} · {p.date}</p>
                        </div>
                        <span className="text-xs font-bold px-2.5 py-1 rounded-full border bg-success/10 text-success border-success/20 shrink-0">{p.status}</span>
                      </div>
                      <p className="font-bold text-primary text-sm">₹{p.amount.toLocaleString('en-IN')}</p>
                      <div className="flex gap-2 mt-3">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"><Eye size={13} /> View Invoice</button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"><Star size={13} /> Review</button>
                      </div>
                    </div>
                  </div>
                </div>
          )
          }
          </div>
        }

        {/* BOOKINGS TAB */}
        {tab === 'bookings' &&
        <div className="space-y-4">
            <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm">
              <Search size={18} className="text-muted-foreground shrink-0" />
              <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search bookings by ID or equipment..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
            <div className="space-y-4">
              {ACTIVE_RENTALS.filter((r) => !search || r.equipment.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase())).map((r) =>
            <div key={r.id} className="bg-card rounded-2xl border border-border p-5">
                  <div className="flex items-start gap-4">
                    <img src={r.image} alt={r.equipment} className="w-16 h-16 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                        <div>
                          <p className="font-bold text-foreground">{r.equipment}</p>
                          <p className="text-xs text-muted-foreground">{r.supplier} · #{r.id}</p>
                        </div>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${STATUS_COLORS[r.status]}`}>{STATUS_LABELS[r.status]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-2">{r.startDate} → {r.endDate}</p>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-bold text-primary text-sm">₹{r.totalPaid.toLocaleString('en-IN')}</span>
                        <Link href={`/booking-confirmation?id=${r.id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"><Eye size={13} /> View Confirmation</Link>
                        {r.status === 'returned' && !submittedReviews.has(r.id) &&
                      <button onClick={() => setReviewTarget(r)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors"><Star size={13} /> Review</button>
                      }
                      </div>
                    </div>
                  </div>
                </div>
            )}
            </div>
          </div>
        }

        {/* SAVED ITEMS TAB */}
        {tab === 'saved' &&
        <div className="space-y-4">
            {/* Saved Items Stats */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h2 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><BarChart2 size={15} className="text-primary" /> Saved Items Overview</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
              { label: 'Total Saved', value: savedItems.length, color: 'text-foreground', bg: 'bg-muted/50' },
              { label: 'Equipment', value: savedEquipmentCount, color: 'text-primary', bg: 'bg-primary/10' },
              { label: 'Labour', value: savedLabourCount, color: 'text-accent', bg: 'bg-accent/10' },
              { label: 'Avg Rating', value: `${avgSavedRating}★`, color: 'text-warning', bg: 'bg-warning/10' }].
              map((s) =>
              <div key={s.label} className={`${s.bg} rounded-xl p-3 text-center`}>
                    <p className={`font-extrabold text-lg ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                  </div>
              )}
              </div>
              {savedItems.filter((s) => s.type === 'equipment').length > 0 && (
                <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">Avg equipment rate</p>
                  <p className="font-bold text-sm text-primary">₹{avgSavedRate.toLocaleString('en-IN')}/day</p>
                </div>
              )}
            </div>

            {savedItems.length === 0 ?
          <div className="bg-card rounded-2xl border border-border p-16 text-center">
                <Heart size={48} className="text-muted-foreground mx-auto mb-4" />
                <h3 className="font-bold text-xl text-foreground mb-2">No saved items</h3>
                <p className="text-muted-foreground text-sm mb-6">Save equipment and labour profiles to compare later</p>
                <Link href="/equipment-listing-page" className="btn-primary">Browse Equipment</Link>
              </div> :

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedItems.map((s) =>
            <div key={s.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                    <div className="relative h-40">
                      <img src={s.image} alt={s.name} className="w-full h-full object-cover" />
                      <button onClick={() => removeFromSaved(s.id)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center hover:bg-danger/10 transition-colors">
                        <Heart size={14} className="text-danger fill-danger" />
                      </button>
                      <span className={`absolute top-3 left-3 px-2 py-0.5 rounded-full text-xs font-bold ${s.type === 'labour' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                        {s.type === 'labour' ? <Users size={10} className="inline mr-1" /> : <Wrench size={10} className="inline mr-1" />}
                        {s.type === 'labour' ? 'Labour' : 'Equipment'}
                      </span>
                    </div>
                    <div className="p-4">
                      <p className="font-bold text-sm text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.category} · {s.supplier}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={10} />{s.location}</p>
                      <div className="flex items-center justify-between mt-3">
                        <div>
                          <p className="font-bold text-primary text-sm">₹{s.rentPerDay.toLocaleString('en-IN')}/day</p>
                          <p className="text-xs text-warning">{s.rating}★ rating</p>
                        </div>
                        <Link href={s.type === 'labour' ? '/labour' : '/equipment-listing-page'} className="btn-primary px-3 py-1.5 rounded-xl text-xs font-semibold">
                          {s.type === 'labour' ? 'Hire Now' : 'Rent Now'}
                        </Link>
                      </div>
                    </div>
                  </div>
            )}
              </div>
          }
          </div>
        }

        {/* ACCOUNT TAB */}
        {tab === 'account' &&
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full gradient-green flex items-center justify-center mx-auto"><User size={40} className="text-white" /></div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md hover:bg-primary/90 transition-colors"><Camera size={14} /></button>
                </div>
                <p className="font-extrabold text-lg text-foreground">{profile.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{profile.phone}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  <span className="text-xs text-success font-semibold">Verified Farmer</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                  {[{ label: 'Rentals', value: ACTIVE_RENTALS.length }, { label: 'Saved', value: savedItems.length }, { label: 'Purchases', value: PURCHASES.length }].map((s) =>
                <div key={s.label} className="text-center"><p className="font-bold text-base text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                )}
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {[
              { icon: Tractor, label: 'My Rentals', action: () => setTab('rentals') },
              { icon: Package, label: 'Purchases', action: () => setTab('purchases') },
              { icon: Heart, label: 'Saved Items', action: () => setTab('saved') },
              { icon: Shield, label: 'Privacy & Security', action: () => {} }].
              map((item, i, arr) =>
              <button key={item.label} onClick={item.action} className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-muted transition-colors text-left ${i < arr.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0"><item.icon size={15} className="text-primary" /></div>
                    <span className="text-sm font-semibold text-foreground flex-1">{item.label}</span>
                    <ChevronRight size={15} className="text-muted-foreground" />
                  </button>
              )}
                <Link href="/sign-up-login-screen" className="flex items-center gap-3 px-4 py-3.5 hover:bg-danger/5 transition-colors text-danger">
                  <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0"><LogOut size={15} className="text-danger" /></div>
                  <span className="text-sm font-semibold">Logout</span>
                </Link>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-extrabold text-lg text-foreground">Personal Info</h2>
                  {!editing ?
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"><Edit3 size={14} /> Edit</button> :
                <div className="flex gap-2">
                      <button onClick={() => {setDraft(profile);setEditing(false);}} className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                      <button onClick={() => {setProfile(draft);setEditing(false);toast.success('Profile updated!');}} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm font-semibold"><Save size={14} /> Save</button>
                    </div>
                }
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                { key: 'name', label: 'Full Name', icon: User },
                { key: 'phone', label: 'Phone Number', icon: Phone },
                { key: 'email', label: 'Email Address', icon: Mail },
                { key: 'village', label: 'Village / Area', icon: MapPin },
                { key: 'district', label: 'District', icon: MapPin },
                { key: 'state', label: 'State', icon: MapPin },
                { key: 'farmSize', label: 'Farm Size', icon: User },
                { key: 'crops', label: 'Crops Grown', icon: User }] as
                {key: keyof ProfileData;label: string;icon: React.FC<{size?: number;className?: string;}>;}[]).map((f) =>
                <div key={f.key} className={f.key === 'crops' ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
                      {editing ?
                  <div className="relative">
                          <f.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" value={draft[f.key]} onChange={(e) => setDraft((prev) => ({ ...prev, [f.key]: e.target.value }))} className="input-field pl-9 text-sm w-full" />
                        </div> :
                  <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/40 rounded-xl">
                          <f.icon size={14} className="text-muted-foreground shrink-0" />
                          <span className="text-sm text-foreground font-medium">{profile[f.key] || '—'}</span>
                        </div>
                  }
                    </div>
                )}
                </div>
              </div>
            </div>
          </div>
        }
      </main>
      <Footer />

      {reviewTarget && (
        <ReviewModal
          equipmentName={reviewTarget.equipment}
          bookingId={reviewTarget.id}
          supplierName={reviewTarget.supplier}
          onClose={() => setReviewTarget(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>);
}