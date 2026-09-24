'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Users, ChevronRight, CheckCircle, Plus, Tractor, X } from 'lucide-react';

const EQUIPMENT_OPTIONS = [
  { id: 'eq-001', name: 'Mahindra Yuvo 575 DI Tractor', category: 'Tractor', rentPerDay: 2500, available: true },
  { id: 'eq-002', name: 'Rotavator 7 Feet', category: 'Tillage', rentPerDay: 1200, available: true },
  { id: 'eq-003', name: 'Paddy Transplanter 8-Row', category: 'Planting', rentPerDay: 3500, available: true },
  { id: 'eq-004', name: 'Combine Harvester', category: 'Harvesting', rentPerDay: 8000, available: false },
];

interface GroupMember { id: string; name: string; phone: string; acres: string; }
type Step = 'equipment' | 'members' | 'schedule' | 'success';

export default function GroupBookingPage() {
  const [step, setStep] = useState<Step>('equipment');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([{ id: '1', name: '', phone: '', acres: '' }, { id: '2', name: '', phone: '', acres: '' }]);
  const [schedule, setSchedule] = useState({ startDate: '', days: '3', location: '' });
  const [bookingId] = useState('GRP' + Math.floor(100000 + Math.random() * 900000));

  const selectedItems = EQUIPMENT_OPTIONS.filter(e => selectedEquipment.includes(e.id));
  const totalPerDay = selectedItems.reduce((s, e) => s + e.rentPerDay, 0);
  const totalDays = parseInt(schedule.days || '1');
  const totalCost = totalPerDay * totalDays;
  const validMembers = members.filter(m => m.name && m.phone);
  const costPerMember = validMembers.length > 0 ? Math.ceil(totalCost / validMembers.length) : totalCost;

  const STEPS = [{ key: 'equipment', label: 'Equipment' }, { key: 'members', label: 'Members' }, { key: 'schedule', label: 'Schedule' }, { key: 'success', label: 'Done' }];
  const stepIndex = STEPS.findIndex(s => s.key === step);

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6"><CheckCircle size={40} className="text-success" /></div>
          <h1 className="text-2xl font-extrabold text-foreground mb-2">Group Booking Confirmed!</h1>
          <p className="text-muted-foreground mb-6">All {validMembers.length} members will receive booking confirmation via SMS.</p>
          <div className="bg-card border border-border rounded-2xl p-5 text-left mb-6 space-y-3">
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Booking ID</span><span className="font-bold text-foreground">{bookingId}</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Equipment</span><span className="font-semibold text-foreground">{selectedItems.length} item(s)</span></div>
            <div className="flex justify-between text-sm"><span className="text-muted-foreground">Members</span><span className="font-semibold text-foreground">{validMembers.length} farmers</span></div>
            <div className="border-t border-border pt-3 flex justify-between"><span className="font-semibold text-foreground">Per Member</span><span className="font-extrabold text-primary text-lg">₹{costPerMember.toLocaleString('en-IN')}</span></div>
          </div>
          <Link href="/account/bookings" className="btn-primary w-full py-3 rounded-xl font-semibold text-center block">View My Bookings</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/equipment-listing-page" className="hover:text-primary">Equipment</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Group Booking</span>
        </div>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users size={24} className="text-primary" /></div>
          <div><h1 className="text-2xl font-extrabold text-foreground">Group Equipment Booking</h1><p className="text-sm text-muted-foreground">Share equipment costs with neighboring farmers</p></div>
        </div>
        <div className="flex items-center justify-between mb-8">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.key}>
              <div className="flex flex-col items-center gap-1.5">
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm transition-all ${stepIndex > i ? 'bg-success text-white' : stepIndex === i ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  {stepIndex > i ? <CheckCircle size={16} /> : i + 1}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${stepIndex === i ? 'text-primary' : 'text-muted-foreground'}`}>{s.label}</span>
              </div>
              {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 transition-colors ${stepIndex > i ? 'bg-success' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        {step === 'equipment' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Select Equipment</h2>
            <div className="space-y-3">
              {EQUIPMENT_OPTIONS.map(eq => (
                <button key={eq.id} onClick={() => eq.available && setSelectedEquipment(prev => prev.includes(eq.id) ? prev.filter(e => e !== eq.id) : [...prev, eq.id])} disabled={!eq.available} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all text-left ${!eq.available ? 'opacity-50 cursor-not-allowed border-border bg-muted/30' : selectedEquipment.includes(eq.id) ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40 bg-background'}`}>
                  <div className="flex items-center gap-3">
                    <Tractor size={20} className={selectedEquipment.includes(eq.id) ? 'text-primary' : 'text-muted-foreground'} />
                    <div><p className="font-semibold text-sm text-foreground">{eq.name}</p><p className="text-xs text-muted-foreground">{eq.category} · ₹{eq.rentPerDay.toLocaleString('en-IN')}/day</p></div>
                  </div>
                  {!eq.available ? <span className="text-xs text-danger font-semibold">Unavailable</span> : selectedEquipment.includes(eq.id) ? <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center"><CheckCircle size={14} className="text-white" /></div> : <div className="w-6 h-6 rounded-full border-2 border-border" />}
                </button>
              ))}
            </div>
            {selectedEquipment.length > 0 && <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 flex justify-between items-center"><div><p className="text-sm text-muted-foreground">{selectedEquipment.length} equipment selected</p><p className="font-bold text-primary">₹{totalPerDay.toLocaleString('en-IN')}/day total</p></div></div>}
            <button onClick={() => setStep('members')} disabled={selectedEquipment.length === 0} className="w-full btn-primary py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">Continue <ChevronRight size={18} className="inline" /></button>
          </div>
        )}

        {step === 'members' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Add Group Members</h2>
            <div className="space-y-3">
              {members.map((member, i) => (
                <div key={member.id} className="bg-muted/30 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-foreground">Member {i + 1} {i === 0 ? '(You)' : ''}</p>
                    {i >= 2 && <button onClick={() => setMembers(prev => prev.filter(m => m.id !== member.id))} className="p-1 rounded-lg hover:bg-muted text-muted-foreground hover:text-danger transition-colors"><X size={16} /></button>}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input value={member.name} onChange={e => setMembers(prev => prev.map(m => m.id === member.id ? { ...m, name: e.target.value } : m))} placeholder="Full name" className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                    <input value={member.phone} onChange={e => setMembers(prev => prev.map(m => m.id === member.id ? { ...m, phone: e.target.value } : m))} placeholder="Phone number" type="tel" className="px-3 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => setMembers(prev => [...prev, { id: Date.now().toString(), name: '', phone: '', acres: '' }])} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed border-border hover:border-primary/40 text-sm font-semibold text-muted-foreground hover:text-primary transition-colors"><Plus size={16} /> Add Another Member</button>
            <div className="flex gap-3">
              <button onClick={() => setStep('equipment')} className="flex-1 btn-secondary py-3.5 rounded-xl font-bold">Back</button>
              <button onClick={() => setStep('schedule')} disabled={validMembers.length < 2} className="flex-1 btn-primary py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">Continue <ChevronRight size={18} className="inline" /></button>
            </div>
          </div>
        )}

        {step === 'schedule' && (
          <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
            <h2 className="text-lg font-bold text-foreground">Booking Schedule</h2>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Start Date *</label>
              <input type="date" value={schedule.startDate} onChange={e => setSchedule(prev => ({ ...prev, startDate: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Duration (Days) *</label>
              <select value={schedule.days} onChange={e => setSchedule(prev => ({ ...prev, days: e.target.value }))} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                {[1,2,3,4,5,6,7,10,14].map(d => <option key={d} value={d}>{d} day{d > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">Primary Location *</label>
              <input value={schedule.location} onChange={e => setSchedule(prev => ({ ...prev, location: e.target.value }))} placeholder="Village/Area, District" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Total Cost ({schedule.days} days)</span><span className="font-bold text-foreground font-tabular">₹{totalCost.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Per Member ({validMembers.length} members)</span><span className="font-extrabold text-primary font-tabular">₹{costPerMember.toLocaleString('en-IN')}</span></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep('members')} className="flex-1 btn-secondary py-3.5 rounded-xl font-bold">Back</button>
              <button onClick={() => setStep('success')} disabled={!schedule.startDate || !schedule.location} className="flex-1 btn-primary py-3.5 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">Confirm Booking</button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
