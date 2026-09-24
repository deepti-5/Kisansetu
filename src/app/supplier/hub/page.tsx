'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { LayoutDashboard, Package, Calendar, IndianRupee, User, Settings, Plus, Star, CheckCircle, Clock, XCircle, Eye, Edit, Bell, ChevronRight, ArrowUpRight, Phone, MapPin, Camera, Save, TrendingUp, Tractor, Wrench, LogOut, Shield, Edit3, BarChart2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Listing {
  id: string;name: string;category: string;type: 'tractor' | 'equipment';
  image: string;rentPerDay: number;status: 'active' | 'paused' | 'pending';
  bookings: number;rating: number;earnings: number;location: string;
}

interface BookingReq {
  id: string;equipment: string;farmer: string;phone: string;
  startDate: string;endDate: string;amount: number;
  status: 'pending' | 'accepted' | 'declined';type: 'rent' | 'buy';
}

const LISTINGS: Listing[] = [
{ id: 'l1', name: 'Mahindra Yuvo 575 DI Tractor', category: 'Tractor', type: 'tractor', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1315e840e-1765250553872.png', rentPerDay: 2500, status: 'active', bookings: 34, rating: 4.6, earnings: 85000, location: 'Pune, Maharashtra' },
{ id: 'l2', name: 'Rotavator 7 Feet Heavy Duty', category: 'Tillage', type: 'equipment', image: "https://img.rocket.new/generatedImages/rocket_gen_img_163ecef60-1784222686661.png", rentPerDay: 1200, status: 'active', bookings: 18, rating: 4.4, earnings: 21600, location: 'Nashik, Maharashtra' },
{ id: 'l3', name: 'Paddy Transplanter 8-Row', category: 'Planting', type: 'equipment', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b', rentPerDay: 3500, status: 'paused', bookings: 9, rating: 4.2, earnings: 31500, location: 'Kolhapur, Maharashtra' },
{ id: 'l4', name: 'John Deere 5050D Tractor', category: 'Tractor', type: 'tractor', image: 'https://images.unsplash.com/photo-1625246333195-78d9c38ad449', rentPerDay: 3200, status: 'active', bookings: 22, rating: 4.7, earnings: 70400, location: 'Pune, Maharashtra' }];


const BOOKINGS: BookingReq[] = [
{ id: 'BKG12345', equipment: 'Mahindra Yuvo 575 DI Tractor', farmer: 'Suresh Yadav', phone: '+91 98765 11111', startDate: '2026-09-18', endDate: '2026-09-20', amount: 7500, status: 'pending', type: 'rent' },
{ id: 'BKG12346', equipment: 'Rotavator 7 Feet Heavy Duty', farmer: 'Priya Deshmukh', phone: '+91 87654 22222', startDate: '2026-09-22', endDate: '2026-09-23', amount: 2400, status: 'pending', type: 'rent' },
{ id: 'BKG12340', equipment: 'Mahindra Yuvo 575 DI Tractor', farmer: 'Mohan Kulkarni', phone: '+91 76543 33333', startDate: '2026-09-10', endDate: '2026-09-12', amount: 7500, status: 'accepted', type: 'rent' },
{ id: 'BKG12338', equipment: 'John Deere 5050D Tractor', farmer: 'Ramesh Patil', phone: '+91 65432 44444', startDate: '2026-09-05', endDate: '2026-09-07', amount: 9600, status: 'accepted', type: 'rent' }];


type Tab = 'overview' | 'listings' | 'bookings' | 'earnings' | 'profile' | 'settings';

interface ProfileData {name: string;phone: string;email: string;village: string;district: string;state: string;pincode: string;businessName: string;experience: string;}

export default function SupplierHub() {
  const [tab, setTab] = useState<Tab>('overview');
  const [bookings, setBookings] = useState(BOOKINGS);
  const [listingFilter, setListingFilter] = useState<'all' | 'tractor' | 'equipment'>('all');
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Rajesh Patil', phone: '+91 98765 43210', email: 'rajesh.patil@kisansetu.in',
    village: 'Hadapsar', district: 'Pune', state: 'Maharashtra', pincode: '411028',
    businessName: 'Patil Agro Services', experience: '8 years'
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  const totalEarnings = LISTINGS.reduce((s, l) => s + l.earnings, 0);
  const activeListings = LISTINGS.filter((l) => l.status === 'active').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const acceptedBookings = bookings.filter((b) => b.status === 'accepted').length;

  const filteredListings = LISTINGS.filter((l) =>
  listingFilter === 'all' ? true : l.type === listingFilter
  );

  const TABS: {key: Tab;label: string;icon: React.FC<{size?: number;className?: string;}>;}[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'listings', label: 'My Listings', icon: Package },
  { key: 'bookings', label: 'Bookings', icon: Calendar },
  { key: 'earnings', label: 'Earnings', icon: IndianRupee },
  { key: 'profile', label: 'Profile', icon: User },
  { key: 'settings', label: 'Settings', icon: Settings }];


  function handleSaveProfile() {
    setProfile(draft);
    setEditing(false);
    toast.success('Profile updated successfully!');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">🚜 Supplier Hub</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Welcome, {profile.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{profile.businessName} · {profile.state}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
              <Bell size={18} />
              {pendingBookings > 0 &&
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">{pendingBookings}</span>
              }
            </button>
            <Link href="/supplier/add-listing" className="btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
              <Plus size={16} /> Add Listing
            </Link>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) =>
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
            
              <t.icon size={15} /> {t.label}
              {t.key === 'bookings' && pendingBookings > 0 &&
            <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{pendingBookings}</span>
            }
            </button>
          )}
        </div>

        {/* OVERVIEW TAB */}
        {tab === 'overview' &&
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
            { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success', bg: 'bg-success/10', change: '+18%' },
            { label: 'Active Listings', value: activeListings, icon: Package, color: 'text-primary', bg: 'bg-primary/10', change: `${activeListings} active` },
            { label: 'Active Bookings', value: acceptedBookings, icon: Calendar, color: 'text-accent', bg: 'bg-accent/10', change: `${pendingBookings} pending` },
            { label: 'Avg Rating', value: '4.5 ★', icon: Star, color: 'text-warning', bg: 'bg-warning/10', change: '+0.2' }].
            map((s) =>
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                    <span className="text-xs font-semibold text-success flex items-center gap-0.5"><ArrowUpRight size={12} />{s.change}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
            )}
            </div>

            {pendingBookings > 0 &&
          <div className="bg-warning-bg border border-warning/30 rounded-2xl p-4">
                <p className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                  <Clock size={15} className="text-warning" /> {pendingBookings} Pending Booking Request{pendingBookings > 1 ? 's' : ''}
                </p>
                <div className="space-y-3">
                  {bookings.filter((b) => b.status === 'pending').map((b) =>
              <div key={b.id} className="bg-card rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{b.farmer}</p>
                        <p className="text-xs text-muted-foreground">{b.equipment} · {b.startDate} → {b.endDate}</p>
                        <p className="text-xs font-bold text-primary mt-0.5">₹{b.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, status: 'accepted' } : bk))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-bold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Accept</button>
                        <button onClick={() => setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, status: 'declined' } : bk))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><XCircle size={13} /> Decline</button>
                      </div>
                    </div>
              )}
                </div>
              </div>
          }

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-base text-foreground">Recent Listings</h2>
                  <button onClick={() => setTab('listings')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></button>
                </div>
                <div className="space-y-3">
                  {LISTINGS.slice(0, 3).map((l) =>
                <div key={l.id} className="flex items-center gap-3">
                      <img src={l.image} alt={l.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-foreground truncate">{l.name}</p>
                        <p className="text-xs text-muted-foreground">₹{l.rentPerDay.toLocaleString('en-IN')}/day · {l.bookings} bookings</p>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${l.status === 'active' ? 'bg-success/15 text-success' : l.status === 'paused' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'}`}>{l.status}</span>
                    </div>
                )}
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-bold text-base text-foreground">Earnings Summary</h2>
                  <button onClick={() => setTab('earnings')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">Details <ChevronRight size={14} /></button>
                </div>
                <div className="space-y-3">
                  {[
                { label: 'Total Earned', value: `₹${totalEarnings.toLocaleString('en-IN')}`, color: 'text-success' },
                { label: 'This Month', value: '₹15,000', color: 'text-foreground' },
                { label: 'Pending Payout', value: '₹8,500', color: 'text-warning' },
                { label: 'Platform Fee (5%)', value: '₹1,040', color: 'text-muted-foreground' }].
                map((e) =>
                <div key={e.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <span className="text-sm text-muted-foreground">{e.label}</span>
                      <span className={`font-bold text-sm ${e.color}`}>{e.value}</span>
                    </div>
                )}
                </div>
              </div>
            </div>
          </div>
        }

        {/* LISTINGS TAB */}
        {tab === 'listings' &&
        <div className="space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                {(['all', 'tractor', 'equipment'] as const).map((f) =>
              <button key={f} onClick={() => setListingFilter(f)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${listingFilter === f ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
                    {f === 'tractor' && <Tractor size={12} />}
                    {f === 'equipment' && <Wrench size={12} />}
                    {f === 'all' ? 'All Listings' : f === 'tractor' ? 'Tractors' : 'Equipment'}
                  </button>
              )}
              </div>
              <Link href="/supplier/add-listing" className="btn-primary px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2">
                <Plus size={14} /> Add New
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredListings.map((l) =>
            <div key={l.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="relative h-40">
                    <img src={l.image} alt={l.name} className="w-full h-full object-cover" />
                    <div className="absolute top-3 left-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 ${l.type === 'tractor' ? 'bg-primary text-white' : 'bg-accent text-white'}`}>
                        {l.type === 'tractor' ? <Tractor size={10} /> : <Wrench size={10} />}
                        {l.category}
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${l.status === 'active' ? 'bg-success text-white' : l.status === 'paused' ? 'bg-warning text-white' : 'bg-muted-foreground text-white'}`}>{l.status}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-sm text-foreground">{l.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><MapPin size={10} />{l.location}</p>
                    <div className="grid grid-cols-3 gap-2 text-center my-3">
                      <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Bookings</p><p className="font-bold text-sm text-foreground">{l.bookings}</p></div>
                      <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Rating</p><p className="font-bold text-sm text-foreground">{l.rating > 0 ? `${l.rating}★` : '—'}</p></div>
                      <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Earned</p><p className="font-bold text-sm text-success">₹{(l.earnings / 1000).toFixed(0)}k</p></div>
                    </div>
                    <p className="text-xs font-bold text-primary mb-3">₹{l.rentPerDay.toLocaleString('en-IN')}/day</p>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"><Eye size={13} /> View</button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"><Edit size={13} /> Edit</button>
                      <button className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-colors ${l.status === 'active' ? 'border border-warning text-warning hover:bg-warning/10' : 'border border-success text-success hover:bg-success/10'}`}>
                        {l.status === 'active' ? 'Pause' : 'Activate'}
                      </button>
                    </div>
                  </div>
                </div>
            )}
            </div>
          </div>
        }

        {/* BOOKINGS TAB */}
        {tab === 'bookings' &&
        <div className="space-y-4">
            {(['pending', 'accepted', 'declined'] as const).map((status) => {
            const filtered = bookings.filter((b) => b.status === status);
            if (filtered.length === 0) return null;
            return (
              <div key={status}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{status} ({filtered.length})</p>
                  <div className="space-y-3">
                    {filtered.map((b) =>
                  <div key={b.id} className="bg-card rounded-2xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-foreground">{b.equipment}</p>
                            <p className="text-sm text-muted-foreground">Farmer: <span className="font-semibold text-foreground">{b.farmer}</span></p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={11} />{b.phone}</p>
                            <p className="text-xs text-muted-foreground">{b.startDate} → {b.endDate}</p>
                            <p className="font-bold text-primary">₹{b.amount.toLocaleString('en-IN')}</p>
                          </div>
                          {status === 'pending' &&
                      <div className="flex gap-2">
                              <button onClick={() => setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, status: 'accepted' } : bk))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success text-white text-xs font-bold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Accept</button>
                              <button onClick={() => setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, status: 'declined' } : bk))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><XCircle size={13} /> Decline</button>
                            </div>
                      }
                          {status === 'accepted' &&
                      <div className="flex flex-col items-end gap-2">
                              <span className="flex items-center gap-1.5 text-success text-xs font-bold"><CheckCircle size={14} /> Accepted</span>
                              <Link href={`/booking-confirmation?id=${b.id}`} className="text-xs text-primary font-semibold hover:underline flex items-center gap-1">View Details <ChevronRight size={12} /></Link>
                            </div>
                      }
                          {status === 'declined' && <span className="flex items-center gap-1.5 text-danger text-xs font-bold"><XCircle size={14} /> Declined</span>}
                        </div>
                      </div>
                  )}
                  </div>
                </div>);

          })}
          </div>
        }

        {/* EARNINGS TAB */}
        {tab === 'earnings' &&
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Total Earnings</p>
                <p className="text-2xl font-extrabold text-success">₹{totalEarnings.toLocaleString('en-IN')}</p>
                <p className="text-xs text-success mt-1 flex items-center gap-1"><TrendingUp size={11} /> +18% vs last month</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">This Month</p>
                <p className="text-2xl font-extrabold text-foreground">₹15,000</p>
                <p className="text-xs text-muted-foreground mt-1">Sep 2026</p>
              </div>
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-xs text-muted-foreground mb-1">Pending Payout</p>
                <p className="text-2xl font-extrabold text-warning">₹8,500</p>
                <p className="text-xs text-muted-foreground mt-1">Processing in 2-3 days</p>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><BarChart2 size={16} className="text-primary" /> Earnings by Listing</h2>
              <div className="space-y-3">
                {LISTINGS.map((l) =>
              <div key={l.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <img src={l.image} alt={l.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.bookings} bookings · {l.rating}★</p>
                    </div>
                    <p className="font-bold text-success shrink-0">₹{l.earnings.toLocaleString('en-IN')}</p>
                  </div>
              )}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4">Recent Transactions</h2>
              <div className="space-y-3">
                {[
              { id: 'TXN001', desc: 'Tractor rental — Suresh Yadav', date: '2026-09-12', amount: 7500, type: 'credit' },
              { id: 'TXN002', desc: 'Rotavator rental — Priya Deshmukh', date: '2026-09-08', amount: 2400, type: 'credit' },
              { id: 'TXN003', desc: 'Platform fee deduction', date: '2026-09-08', amount: 495, type: 'debit' },
              { id: 'TXN004', desc: 'Payout to bank account', date: '2026-09-01', amount: 12000, type: 'debit' }].
              map((tx) =>
              <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{tx.desc}</p>
                      <p className="text-xs text-muted-foreground">{tx.date} · #{tx.id}</p>
                    </div>
                    <span className={`font-bold text-sm ${tx.type === 'credit' ? 'text-success' : 'text-danger'}`}>
                      {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                    </span>
                  </div>
              )}
              </div>
            </div>
          </div>
        }

        {/* PROFILE TAB */}
        {tab === 'profile' &&
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
                  <span className="text-xs text-success font-semibold">Verified Supplier</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                  {[{ label: 'Listings', value: LISTINGS.length }, { label: 'Bookings', value: acceptedBookings }, { label: 'Rating', value: '4.5★' }].map((s) =>
                <div key={s.label} className="text-center"><p className="font-bold text-base text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                )}
                </div>
              </div>
              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                {[
              { icon: Package, label: 'My Listings', action: () => setTab('listings') },
              { icon: Calendar, label: 'Bookings', action: () => setTab('bookings') },
              { icon: IndianRupee, label: 'Earnings', action: () => setTab('earnings') },
              { icon: Settings, label: 'Settings', action: () => setTab('settings') }].
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
                  <h2 className="font-extrabold text-lg text-foreground">Supplier Profile</h2>
                  {!editing ?
                <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"><Edit3 size={14} /> Edit Profile</button> :

                <div className="flex gap-2">
                      <button onClick={() => {setDraft(profile);setEditing(false);}} className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                      <button onClick={handleSaveProfile} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm font-semibold"><Save size={14} /> Save</button>
                    </div>
                }
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                { key: 'name', label: 'Full Name', icon: User },
                { key: 'phone', label: 'Phone Number', icon: Phone },
                { key: 'email', label: 'Email Address', icon: User },
                { key: 'businessName', label: 'Business Name', icon: User },
                { key: 'experience', label: 'Experience', icon: User },
                { key: 'village', label: 'Village / Area', icon: MapPin },
                { key: 'district', label: 'District', icon: MapPin },
                { key: 'state', label: 'State', icon: MapPin },
                { key: 'pincode', label: 'PIN Code', icon: MapPin }] as
                {key: keyof ProfileData;label: string;icon: React.FC<{size?: number;className?: string;}>;}[]).map((f) =>
                <div key={f.key}>
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

        {/* SETTINGS TAB */}
        {tab === 'settings' &&
        <div className="max-w-2xl space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><Bell size={16} className="text-primary" /> Notification Preferences</h2>
              <div className="space-y-3">
                {[
              { label: 'New booking requests', desc: 'Get notified when a farmer requests your equipment', enabled: true },
              { label: 'Booking confirmations', desc: 'Alerts when bookings are confirmed or cancelled', enabled: true },
              { label: 'Payment received', desc: 'Notify when payment is credited to your account', enabled: true },
              { label: 'Promotional updates', desc: 'Tips, offers, and platform news', enabled: false }].
              map((n) =>
              <div key={n.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div><p className="text-sm font-semibold text-foreground">{n.label}</p><p className="text-xs text-muted-foreground">{n.desc}</p></div>
                    <div className={`w-10 h-6 rounded-full transition-colors cursor-pointer ${n.enabled ? 'bg-success' : 'bg-muted'} relative`}>
                      <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${n.enabled ? 'right-1' : 'left-1'}`} />
                    </div>
                  </div>
              )}
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><Shield size={16} className="text-primary" /> Account Security</h2>
              <div className="space-y-3">
                {[
              { label: 'Change Password', desc: 'Update your account password' },
              { label: 'Two-Factor Authentication', desc: 'Add extra security with OTP verification' },
              { label: 'Linked Bank Account', desc: 'Manage payout bank account details' }].
              map((s) =>
              <button key={s.label} className="w-full flex items-center justify-between py-3 border-b border-border last:border-0 hover:bg-muted/30 rounded-lg px-2 transition-colors text-left">
                    <div><p className="text-sm font-semibold text-foreground">{s.label}</p><p className="text-xs text-muted-foreground">{s.desc}</p></div>
                    <ChevronRight size={15} className="text-muted-foreground shrink-0" />
                  </button>
              )}
              </div>
            </div>

            <div className="bg-danger-bg border border-danger/30 rounded-2xl p-5">
              <h2 className="font-bold text-base text-danger mb-2 flex items-center gap-2"><AlertCircle size={16} /> Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">These actions are irreversible. Please proceed with caution.</p>
              <div className="flex gap-3 flex-wrap">
                <button className="px-4 py-2 rounded-xl border border-danger text-danger text-sm font-semibold hover:bg-danger/10 transition-colors">Deactivate Account</button>
                <button className="px-4 py-2 rounded-xl bg-danger text-white text-sm font-semibold hover:bg-danger/90 transition-colors">Delete Account</button>
              </div>
            </div>
          </div>
        }
      </main>
      <Footer />
    </div>);

}