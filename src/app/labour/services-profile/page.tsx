'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { User, Phone, MapPin, Star, Calendar, IndianRupee, CheckCircle, Edit3, Save, Camera, Bell, ChevronRight, Clock, Briefcase, ArrowUpRight, LogOut, Settings, Plus, XCircle, Users } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'overview' | 'services' | 'bookings' | 'earnings' | 'profile';

interface ServiceData { id: string; name: string; category: string; ratePerDay: number; experience: string; availability: string; status: 'available' | 'busy'; bookings: number; rating: number; }
interface JobRequest { id: string; farmer: string; phone: string; service: string; location: string; startDate: string; endDate: string; amount: number; status: 'pending' | 'accepted' | 'declined'; }

const SERVICES: ServiceData[] = [
  { id: 'sv1', name: 'Paddy Harvesting', category: 'Harvesting', ratePerDay: 700, experience: '5 years', availability: 'Mon–Sat', status: 'available', bookings: 28, rating: 4.8 },
  { id: 'sv2', name: 'Wheat Sowing & Planting', category: 'Planting', ratePerDay: 600, experience: '4 years', availability: 'All days', status: 'available', bookings: 19, rating: 4.6 },
  { id: 'sv3', name: 'Irrigation & Watering', category: 'Irrigation', ratePerDay: 500, experience: '3 years', availability: 'Mon–Fri', status: 'busy', bookings: 12, rating: 4.4 },
];

const JOB_REQUESTS: JobRequest[] = [
  { id: 'JOB001', farmer: 'Suresh Yadav', phone: '+91 98765 11111', service: 'Paddy Harvesting', location: 'Pune, Maharashtra', startDate: '2026-09-25', endDate: '2026-09-27', amount: 2100, status: 'pending' },
  { id: 'JOB002', farmer: 'Priya Deshmukh', phone: '+91 87654 22222', service: 'Wheat Sowing', location: 'Nashik, Maharashtra', startDate: '2026-09-20', endDate: '2026-09-21', amount: 1200, status: 'accepted' },
  { id: 'JOB003', farmer: 'Mohan Kulkarni', phone: '+91 76543 33333', service: 'Irrigation', location: 'Kolhapur, Maharashtra', startDate: '2026-09-15', endDate: '2026-09-16', amount: 1000, status: 'accepted' },
];

interface ProfileData { name: string; phone: string; email: string; village: string; district: string; state: string; skills: string; experience: string; }

export default function LabourServicesProfile() {
  const [tab, setTab] = useState<Tab>('overview');
  const [jobs, setJobs] = useState(JOB_REQUESTS);
  const [editing, setEditing] = useState(false);
  const [profile, setProfile] = useState<ProfileData>({
    name: 'Ramesh Yadav', phone: '+91 65432 11111', email: 'ramesh.yadav@gmail.com',
    village: 'Solapur', district: 'Solapur', state: 'Maharashtra',
    skills: 'Harvesting, Planting, Irrigation, Spraying', experience: '6 years',
  });
  const [draft, setDraft] = useState<ProfileData>(profile);

  const pendingJobs = jobs.filter((j) => j.status === 'pending').length;
  const acceptedJobs = jobs.filter((j) => j.status === 'accepted').length;
  const totalEarnings = jobs.filter((j) => j.status === 'accepted').reduce((s, j) => s + j.amount, 0);

  const TABS: { key: Tab; label: string; icon: React.FC<{ size?: number; className?: string }> }[] = [
    { key: 'overview', label: 'Overview', icon: User },
    { key: 'services', label: 'My Services', icon: Briefcase },
    { key: 'bookings', label: 'Job Requests', icon: Calendar },
    { key: 'earnings', label: 'Earnings', icon: IndianRupee },
    { key: 'profile', label: 'Profile', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-success/10 text-success border border-success/20">👨‍🌾 Labour Provider</span>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Welcome, {profile.name}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{profile.skills.split(',')[0].trim()} Specialist · {profile.state}</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2.5 rounded-xl border border-border hover:bg-muted transition-colors">
              <Bell size={18} />
              {pendingJobs > 0 && <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-danger text-white text-[9px] font-bold flex items-center justify-center">{pendingJobs}</span>}
            </button>
            <button className="btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2">
              <Plus size={16} /> Add Service
            </button>
          </div>
        </div>

        {/* Tab Nav */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon size={15} /> {t.label}
              {t.key === 'bookings' && pendingJobs > 0 && <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{pendingJobs}</span>}
            </button>
          ))}
        </div>

        {/* OVERVIEW */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Earned', value: `₹${totalEarnings.toLocaleString('en-IN')}`, icon: IndianRupee, color: 'text-success', bg: 'bg-success/10', change: '+12%' },
                { label: 'Active Services', value: SERVICES.filter((s) => s.status === 'available').length, icon: Briefcase, color: 'text-primary', bg: 'bg-primary/10', change: 'available' },
                { label: 'Jobs Completed', value: acceptedJobs, icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10', change: `${pendingJobs} pending` },
                { label: 'Avg Rating', value: '4.6 ★', icon: Star, color: 'text-warning', bg: 'bg-warning/10', change: '+0.1' },
              ].map((s) => (
                <div key={s.label} className="bg-card rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon size={18} className={s.color} /></div>
                    <span className="text-xs font-semibold text-success flex items-center gap-0.5"><ArrowUpRight size={12} />{s.change}</span>
                  </div>
                  <p className="text-2xl font-extrabold text-foreground">{s.value}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {pendingJobs > 0 && (
              <div className="bg-warning-bg border border-warning/30 rounded-2xl p-4">
                <p className="font-bold text-sm text-foreground mb-3 flex items-center gap-2"><Clock size={15} className="text-warning" /> {pendingJobs} Pending Job Request{pendingJobs > 1 ? 's' : ''}</p>
                <div className="space-y-3">
                  {jobs.filter((j) => j.status === 'pending').map((j) => (
                    <div key={j.id} className="bg-card rounded-xl p-3 flex items-center justify-between gap-3 flex-wrap">
                      <div>
                        <p className="font-semibold text-sm text-foreground">{j.farmer}</p>
                        <p className="text-xs text-muted-foreground">{j.service} · {j.location}</p>
                        <p className="text-xs text-muted-foreground">{j.startDate} → {j.endDate}</p>
                        <p className="text-xs font-bold text-primary mt-0.5">₹{j.amount.toLocaleString('en-IN')}</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setJobs((prev) => prev.map((jb) => jb.id === j.id ? { ...jb, status: 'accepted' } : jb))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success text-white text-xs font-bold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Accept</button>
                        <button onClick={() => setJobs((prev) => prev.map((jb) => jb.id === j.id ? { ...jb, status: 'declined' } : jb))} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><XCircle size={13} /> Decline</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base text-foreground">My Services</h2>
                <button onClick={() => setTab('services')} className="text-sm text-primary font-semibold flex items-center gap-1 hover:underline">View All <ChevronRight size={14} /></button>
              </div>
              <div className="space-y-3">
                {SERVICES.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-semibold text-sm text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.category} · {s.experience} exp · {s.bookings} jobs</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary text-sm">₹{s.ratePerDay}/day</p>
                      <span className={`text-xs font-bold ${s.status === 'available' ? 'text-success' : 'text-warning'}`}>{s.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SERVICES TAB */}
        {tab === 'services' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {SERVICES.map((s) => (
                <div key={s.id} className="bg-card rounded-2xl border border-border p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-bold text-foreground">{s.name}</p>
                      <p className="text-xs text-muted-foreground">{s.category}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${s.status === 'available' ? 'bg-success/15 text-success' : 'bg-warning/15 text-warning'}`}>{s.status}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center mb-4">
                    <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Jobs</p><p className="font-bold text-sm text-foreground">{s.bookings}</p></div>
                    <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Rating</p><p className="font-bold text-sm text-foreground">{s.rating}★</p></div>
                    <div className="bg-muted/40 rounded-lg py-2"><p className="text-xs text-muted-foreground">Rate</p><p className="font-bold text-sm text-success">₹{s.ratePerDay}</p></div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                    <Clock size={12} />{s.availability} · {s.experience} experience
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors">Edit</button>
                    <button className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors ${s.status === 'available' ? 'border border-warning text-warning hover:bg-warning/10' : 'border border-success text-success hover:bg-success/10'}`}>
                      {s.status === 'available' ? 'Mark Busy' : 'Mark Available'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOOKINGS TAB */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            {(['pending', 'accepted', 'declined'] as const).map((status) => {
              const filtered = jobs.filter((j) => j.status === status);
              if (filtered.length === 0) return null;
              return (
                <div key={status}>
                  <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">{status} ({filtered.length})</p>
                  <div className="space-y-3">
                    {filtered.map((j) => (
                      <div key={j.id} className="bg-card rounded-2xl border border-border p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="space-y-1">
                            <p className="font-bold text-sm text-foreground">{j.service}</p>
                            <p className="text-sm text-muted-foreground">Farmer: <span className="font-semibold text-foreground">{j.farmer}</span></p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={11} />{j.phone}</p>
                            <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin size={11} />{j.location}</p>
                            <p className="text-xs text-muted-foreground">{j.startDate} → {j.endDate}</p>
                            <p className="font-bold text-primary">₹{j.amount.toLocaleString('en-IN')}</p>
                          </div>
                          {status === 'pending' && (
                            <div className="flex gap-2">
                              <button onClick={() => setJobs((prev) => prev.map((jb) => jb.id === j.id ? { ...jb, status: 'accepted' } : jb))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-success text-white text-xs font-bold hover:bg-success/90 transition-colors"><CheckCircle size={13} /> Accept</button>
                              <button onClick={() => setJobs((prev) => prev.map((jb) => jb.id === j.id ? { ...jb, status: 'declined' } : jb))} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><XCircle size={13} /> Decline</button>
                            </div>
                          )}
                          {status === 'accepted' && <span className="flex items-center gap-1.5 text-success text-xs font-bold"><CheckCircle size={14} /> Accepted</span>}
                          {status === 'declined' && <span className="flex items-center gap-1.5 text-danger text-xs font-bold"><XCircle size={14} /> Declined</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* EARNINGS TAB */}
        {tab === 'earnings' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground mb-1">Total Earned</p><p className="text-2xl font-extrabold text-success">₹{totalEarnings.toLocaleString('en-IN')}</p></div>
              <div className="bg-card rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground mb-1">This Month</p><p className="text-2xl font-extrabold text-foreground">₹3,300</p></div>
              <div className="bg-card rounded-2xl border border-border p-4"><p className="text-xs text-muted-foreground mb-1">Pending</p><p className="text-2xl font-extrabold text-warning">₹2,100</p></div>
            </div>
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4">Earnings by Service</h2>
              <div className="space-y-3">
                {SERVICES.map((s) => (
                  <div key={s.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div><p className="font-semibold text-sm text-foreground">{s.name}</p><p className="text-xs text-muted-foreground">{s.bookings} jobs · {s.rating}★</p></div>
                    <p className="font-bold text-success">₹{(s.ratePerDay * s.bookings).toLocaleString('en-IN')}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === 'profile' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-4">
              <div className="bg-card rounded-2xl border border-border p-6 text-center">
                <div className="relative inline-block mb-4">
                  <div className="w-24 h-24 rounded-full gradient-green flex items-center justify-center mx-auto"><User size={40} className="text-white" /></div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-md"><Camera size={14} /></button>
                </div>
                <p className="font-extrabold text-lg text-foreground">{profile.name}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{profile.phone}</p>
                <div className="flex items-center justify-center gap-1.5 mt-2"><span className="w-2 h-2 rounded-full bg-success" /><span className="text-xs text-success font-semibold">Verified Labour Provider</span></div>
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-border">
                  {[{ label: 'Services', value: SERVICES.length }, { label: 'Jobs', value: acceptedJobs }, { label: 'Rating', value: '4.6★' }].map((s) => (
                    <div key={s.label} className="text-center"><p className="font-bold text-base text-foreground">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
                  ))}
                </div>
              </div>
              <Link href="/sign-up-login-screen" className="flex items-center gap-3 px-4 py-3.5 bg-card rounded-2xl border border-border hover:bg-danger/5 transition-colors text-danger">
                <div className="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center shrink-0"><LogOut size={15} className="text-danger" /></div>
                <span className="text-sm font-semibold">Logout</span>
              </Link>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-card rounded-2xl border border-border p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-extrabold text-lg text-foreground">Labour Profile</h2>
                  {!editing ? (
                    <button onClick={() => setEditing(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"><Edit3 size={14} /> Edit</button>
                  ) : (
                    <div className="flex gap-2">
                      <button onClick={() => { setDraft(profile); setEditing(false); }} className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">Cancel</button>
                      <button onClick={() => { setProfile(draft); setEditing(false); toast.success('Profile updated!'); }} className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm font-semibold"><Save size={14} /> Save</button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {([
                    { key: 'name', label: 'Full Name', icon: User },
                    { key: 'phone', label: 'Phone Number', icon: Phone },
                    { key: 'email', label: 'Email Address', icon: User },
                    { key: 'village', label: 'Village / Area', icon: MapPin },
                    { key: 'district', label: 'District', icon: MapPin },
                    { key: 'state', label: 'State', icon: MapPin },
                    { key: 'experience', label: 'Experience', icon: Briefcase },
                    { key: 'skills', label: 'Skills', icon: Users },
                  ] as { key: keyof ProfileData; label: string; icon: React.FC<{ size?: number; className?: string }> }[]).map((f) => (
                    <div key={f.key} className={f.key === 'skills' ? 'sm:col-span-2' : ''}>
                      <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">{f.label}</label>
                      {editing ? (
                        <div className="relative">
                          <f.icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                          <input type="text" value={draft[f.key]} onChange={(e) => setDraft((prev) => ({ ...prev, [f.key]: e.target.value }))} className="input-field pl-9 text-sm w-full" />
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
        )}
      </main>
      <Footer />
    </div>
  );
}
