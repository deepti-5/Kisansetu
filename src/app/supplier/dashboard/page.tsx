'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { LayoutDashboard, Package, Calendar, IndianRupee, Plus, Star, CheckCircle, Clock, XCircle, Eye, Edit, Bell, ChevronRight, ArrowUpRight, Filter } from 'lucide-react';

interface Listing {id: string;name: string;category: string;image: string;rentPerDay: number;status: 'active' | 'paused' | 'pending';bookings: number;rating: number;earnings: number;}
interface BookingReq {id: string;equipment: string;farmer: string;phone: string;startDate: string;endDate: string;amount: number;status: 'pending' | 'accepted' | 'declined';type: 'rent' | 'buy';}

const LISTINGS: Listing[] = [
{ id: 'l1', name: 'Mahindra Yuvo 575 DI Tractor', category: 'Tractor', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1315e840e-1765250553872.png", rentPerDay: 2500, status: 'active', bookings: 34, rating: 4.6, earnings: 85000 },
{ id: 'l2', name: 'Rotavator 7 Feet', category: 'Tillage', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f72a525d-1776095395384.png', rentPerDay: 1200, status: 'active', bookings: 18, rating: 4.4, earnings: 21600 },
{ id: 'l3', name: 'Paddy Transplanter 8-Row', category: 'Planting', image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b', rentPerDay: 3500, status: 'paused', bookings: 9, rating: 4.2, earnings: 31500 }];


const BOOKINGS: BookingReq[] = [
{ id: 'BKG12345', equipment: 'Mahindra Yuvo 575 DI Tractor', farmer: 'Suresh Yadav', phone: '+91 98765 11111', startDate: '2026-08-18', endDate: '2026-08-20', amount: 7500, status: 'pending', type: 'rent' },
{ id: 'BKG12346', equipment: 'Rotavator 7 Feet', farmer: 'Priya Deshmukh', phone: '+91 87654 22222', startDate: '2026-08-22', endDate: '2026-08-23', amount: 2400, status: 'pending', type: 'rent' },
{ id: 'BKG12340', equipment: 'Mahindra Yuvo 575 DI Tractor', farmer: 'Mohan Kulkarni', phone: '+91 76543 33333', startDate: '2026-08-10', endDate: '2026-08-12', amount: 7500, status: 'accepted', type: 'rent' }];


type Tab = 'overview' | 'listings' | 'bookings' | 'earnings';

export default function SupplierDashboard() {
  const [tab, setTab] = useState<Tab>('overview');
  const [bookings, setBookings] = useState(BOOKINGS);

  const totalEarnings = LISTINGS.reduce((s, l) => s + l.earnings, 0);
  const activeListings = LISTINGS.filter((l) => l.status === 'active').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;

  const TABS: {key: Tab;label: string;icon: React.FC<{size?: number;className?: string;}>;}[] = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard },
  { key: 'listings', label: 'My Listings', icon: Package },
  { key: 'bookings', label: 'Bookings', icon: Calendar },
  { key: 'earnings', label: 'Earnings', icon: IndianRupee }];


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-6">
          <div><h1 className="text-2xl font-extrabold text-foreground">Supplier Dashboard</h1><p className="text-sm text-muted-foreground mt-0.5">Welcome back, Rajesh Patil</p></div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl border border-border hover:bg-muted transition-colors"><Bell size={18} />{pendingBookings > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">{pendingBookings}</span>}</button>
            <Link href="/supplier/add-listing" className="btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2"><Plus size={16} /> Add Listing</Link>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) =>
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon size={15} /> {t.label}
              {t.key === 'bookings' && pendingBookings > 0 && <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{pendingBookings}</span>}
            </button>
          )}
        </div>

        {tab === 'overview' &&
        <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
            { label: 'Total Earnings', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success', bg: 'bg-success/10', change: '+18%' },
            { label: 'Active Listings', value: activeListings, icon: Package, color: 'text-primary', bg: 'bg-primary/10', change: '+2' },
            { label: 'Total Bookings', value: bookings.filter((b) => b.status === 'accepted').length, icon: Calendar, color: 'text-accent', bg: 'bg-accent/10', change: '+5' },
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
                <p className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><Clock size={15} className="text-warning" /> {pendingBookings} Pending Booking Request{pendingBookings > 1 ? 's' : ''}</p>
                <div className="space-y-3">
                  {bookings.filter((b) => b.status === 'pending').map((b) =>
              <div key={b.id} className="bg-card rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                      <div><p className="font-semibold text-sm text-foreground">{b.farmer}</p><p className="text-xs text-muted-foreground">{b.equipment} · {b.startDate} → {b.endDate}</p><p className="text-xs font-bold text-primary mt-0.5">₹{b.amount.toLocaleString('en-IN')}</p></div>
                      <div className="flex gap-2">
                        <button onClick={() => setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, status: 'accepted' } : bk))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-bold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Accept</button>
                        <button onClick={() => setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, status: 'declined' } : bk))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><XCircle size={13} /> Decline</button>
                      </div>
                    </div>
              )}
                </div>
              </div>
          }
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4"><h2 className="font-bold text-base text-foreground">Recent Listings</h2><button onClick={() => setTab('listings')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></button></div>
              <div className="space-y-3">
                {LISTINGS.slice(0, 3).map((l) =>
              <div key={l.id} className="flex items-center gap-3">
                    <img src={l.image} alt={l.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="flex-1 min-w-0"><p className="font-semibold text-sm text-foreground truncate">{l.name}</p><p className="text-xs text-muted-foreground">₹{l.rentPerDay.toLocaleString('en-IN')}/day · {l.bookings} bookings</p></div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${l.status === 'active' ? 'bg-success/15 text-success' : l.status === 'paused' ? 'bg-warning/15 text-warning' : 'bg-muted text-muted-foreground'}`}>{l.status}</span>
                  </div>
              )}
              </div>
            </div>
          </div>
        }

        {tab === 'listings' &&
        <div className="space-y-4">
            <div className="flex items-center justify-between"><p className="text-sm text-muted-foreground">{LISTINGS.length} listings total</p><button className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors"><Filter size={14} /> Filter</button></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {LISTINGS.map((l) =>
            <div key={l.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                  <div className="relative h-40"><img src={l.image} alt={l.name} className="w-full h-full object-cover" /><div className="absolute top-3 right-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${l.status === 'active' ? 'bg-success text-white' : l.status === 'paused' ? 'bg-warning text-white' : 'bg-muted-foreground text-white'}`}>{l.status}</span></div></div>
                  <div className="p-4">
                    <p className="font-bold text-sm text-foreground">{l.name}</p>
                    <p className="text-xs text-muted-foreground mb-3">{l.category}</p>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Bookings</p><p className="font-bold text-sm text-foreground">{l.bookings}</p></div>
                      <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Rating</p><p className="font-bold text-sm text-foreground">{l.rating > 0 ? `${l.rating}★` : '—'}</p></div>
                      <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Earned</p><p className="font-bold text-sm text-success">₹{(l.earnings / 1000).toFixed(0)}k</p></div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"><Eye size={13} /> View</button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors"><Edit size={13} /> Edit</button>
                    </div>
                  </div>
                </div>
            )}
            </div>
          </div>
        }

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
                            <p className="text-sm text-muted-foreground">Farmer: <span className="font-semibold text-foreground">{b.farmer}</span> · {b.phone}</p>
                            <p className="text-xs text-muted-foreground">{b.startDate} → {b.endDate}</p>
                            <p className="font-bold text-primary">₹{b.amount.toLocaleString('en-IN')}</p>
                          </div>
                          {status === 'pending' &&
                      <div className="flex gap-2">
                              <button onClick={() => setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, status: 'accepted' } : bk))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success text-white text-xs font-bold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Accept</button>
                              <button onClick={() => setBookings((prev) => prev.map((bk) => bk.id === b.id ? { ...bk, status: 'declined' } : bk))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><XCircle size={13} /> Decline</button>
                            </div>
                      }
                          {status === 'accepted' && <span className="flex items-center gap-1.5 text-success text-xs font-bold"><CheckCircle size={14} /> Accepted</span>}
                          {status === 'declined' && <span className="flex items-center gap-1.5 text-danger text-xs font-bold"><XCircle size={14} /> Declined</span>}
                        </div>
                      </div>
                  )}
                  </div>
                </div>);

          })}
          </div>
        }

        {tab === 'earnings' &&
        <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground mb-1">Total Earnings</p><p className="text-2xl font-extrabold text-success">₹{totalEarnings.toLocaleString('en-IN')}</p></div>
              <div className="bg-card rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground mb-1">This Month</p><p className="text-2xl font-extrabold text-foreground">₹15,000</p></div>
              <div className="bg-card rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground mb-1">Pending Payout</p><p className="text-2xl font-extrabold text-warning">₹8,500</p></div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4">Earnings by Listing</h2>
              <div className="space-y-3">
                {LISTINGS.map((l) =>
              <div key={l.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div><p className="font-semibold text-sm text-foreground">{l.name}</p><p className="text-xs text-muted-foreground">{l.bookings} bookings</p></div>
                    <p className="font-bold text-success">₹{l.earnings.toLocaleString('en-IN')}</p>
                  </div>
              )}
              </div>
            </div>
          </div>
        }
      </main>
      <Footer />
    </div>);

}