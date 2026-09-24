'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ChevronLeft, ChevronRight, Trash2, Clock, Calendar, CheckCircle, XCircle, Loader2, AlertCircle, Info, Save, RefreshCw, Car } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Link from 'next/link';

interface BlockedDate {
  id: string;
  driver_id: string;
  date: string;
  start_hour: number;
  end_hour: number;
  is_blocked: boolean;
  note: string;
  created_at: string;
}

interface DaySlot {
  date: string;
  isBlocked: boolean;
  startHour: number;
  endHour: number;
  id?: string;
  note?: string;
}

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const HOUR_OPTIONS = Array.from({ length: 24 }, (_, i) => ({
  value: i,
  label: i === 0 ? '12:00 AM' : i < 12 ? `${i}:00 AM` : i === 12 ? '12:00 PM' : `${i - 12}:00 PM`,
}));

function toDateStr(date: Date): string {
  return date.toISOString().split('T')[0];
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

export default function DriverAvailabilityPage() {
  const { user } = useAuth();
  const supabase = createClient();
  const today = toDateStr(new Date());

  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [blockedDates, setBlockedDates] = useState<BlockedDate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showSlotForm, setShowSlotForm] = useState(false);
  const [slotForm, setSlotForm] = useState({ startHour: 6, endHour: 18, isBlocked: true, note: '' });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [driverEquipment, setDriverEquipment] = useState<{ id: string; name: string }[]>([]);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [availRes, equipRes] = await Promise.all([
        supabase
          .from('driver_availability')
          .select('*')
          .eq('driver_id', user.id)
          .order('date', { ascending: true }),
        supabase
          .from('equipment')
          .select('id, name')
          .eq('provider_id', user.id)
          .eq('has_driver', true)
          .eq('status', 'active'),
      ]);
      if (!availRes.error) setBlockedDates(availRes.data || []);
      if (!equipRes.error) setDriverEquipment(equipRes.data || []);
    } catch {
      toast.error('Failed to load availability data');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function prevMonth() {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }

  function nextMonth() {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }

  function getDateSlot(dateStr: string): BlockedDate | undefined {
    return blockedDates.find(b => b.date === dateStr);
  }

  function handleDayClick(dateStr: string) {
    if (dateStr < today) return;
    setSelectedDate(dateStr);
    const existing = getDateSlot(dateStr);
    if (existing) {
      setSlotForm({
        startHour: existing.start_hour,
        endHour: existing.end_hour,
        isBlocked: existing.is_blocked,
        note: existing.note || '',
      });
    } else {
      setSlotForm({ startHour: 6, endHour: 18, isBlocked: true, note: '' });
    }
    setShowSlotForm(true);
  }

  async function saveSlot() {
    if (!selectedDate || !user) return;
    setSaving(true);
    try {
      const existing = getDateSlot(selectedDate);
      const payload = {
        driver_id: user.id,
        date: selectedDate,
        start_hour: slotForm.startHour,
        end_hour: slotForm.endHour,
        is_blocked: slotForm.isBlocked,
        note: slotForm.note.trim(),
      };

      if (existing) {
        const { error } = await supabase
          .from('driver_availability')
          .update({ ...payload, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
        toast.success('Availability updated');
      } else {
        const { error } = await supabase
          .from('driver_availability')
          .insert(payload);
        if (error) throw error;
        toast.success(slotForm.isBlocked ? 'Date blocked' : 'Hours set');
      }

      // Also update equipment_availability for linked equipment (Equipment+Driver slots)
      if (driverEquipment.length > 0 && slotForm.isBlocked) {
        for (const equip of driverEquipment) {
          // Check if already blocked for this date
          const { data: existing_avail } = await supabase
            .from('equipment_availability')
            .select('id')
            .eq('equipment_id', equip.id)
            .eq('start_date', selectedDate)
            .eq('end_date', selectedDate)
            .eq('status', 'blocked')
            .maybeSingle();

          if (!existing_avail) {
            await supabase.from('equipment_availability').insert({
              equipment_id: equip.id,
              start_date: selectedDate,
              end_date: selectedDate,
              status: 'blocked',
              notes: `Driver unavailable: ${slotForm.note || 'Blocked by driver'}`,
            });
          }
        }
      }

      setShowSlotForm(false);
      setSelectedDate(null);
      fetchData();
    } catch (err: any) {
      toast.error(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function removeSlot(id: string, date: string) {
    setDeletingId(id);
    try {
      const { error } = await supabase
        .from('driver_availability')
        .delete()
        .eq('id', id)
        .eq('driver_id', user!.id);
      if (error) throw error;

      // Remove from equipment_availability too
      if (driverEquipment.length > 0) {
        for (const equip of driverEquipment) {
          await supabase
            .from('equipment_availability')
            .delete()
            .eq('equipment_id', equip.id)
            .eq('start_date', date)
            .eq('end_date', date)
            .eq('status', 'blocked');
        }
      }

      toast.success('Slot removed');
      fetchData();
    } catch {
      toast.error('Failed to remove slot');
    } finally {
      setDeletingId(null);
    }
  }

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const calendarDays: (string | null)[] = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let d = 1; d <= daysInMonth; d++) {
    calendarDays.push(`${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`);
  }

  const canGoPrev = currentYear > new Date().getFullYear() ||
    (currentYear === new Date().getFullYear() && currentMonth > new Date().getMonth());

  // Upcoming blocked dates
  const upcomingBlocked = blockedDates
    .filter(b => b.date >= today && b.is_blocked)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, 8);

  const blockedThisMonth = blockedDates.filter(b => {
    const [y, m] = b.date.split('-').map(Number);
    return y === currentYear && m === currentMonth + 1 && b.is_blocked;
  }).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-screen-sm mx-auto px-4 py-20 text-center">
          <AlertCircle size={48} className="text-warning mx-auto mb-4" />
          <h1 className="text-xl font-bold text-foreground mb-2">Sign in required</h1>
          <p className="text-muted-foreground mb-6">Please sign in to manage your driver availability.</p>
          <Link href="/sign-up-login-screen" className="btn-primary px-6 py-3">Sign In</Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground flex items-center gap-2">
              <Car size={24} className="text-primary" /> Driver Availability
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">Block dates or set working hours — syncs to Equipment+Driver booking slots</p>
          </div>
          <button onClick={fetchData} className="p-2.5 rounded-xl border border-border hover:bg-muted transition-colors" title="Refresh">
            <RefreshCw size={16} />
          </button>
        </div>

        {/* Linked Equipment Notice */}
        {driverEquipment.length > 0 && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-6 flex items-start gap-3">
            <Info size={16} className="text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-foreground">Synced with {driverEquipment.length} Equipment+Driver listing{driverEquipment.length > 1 ? 's' : ''}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Blocking a date here will also block it in: {driverEquipment.map(e => e.name).join(', ')}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-2xl border border-border p-5">
              {/* Month Nav */}
              <div className="flex items-center justify-between mb-5">
                <button onClick={prevMonth} disabled={!canGoPrev}
                  className="p-2 rounded-xl hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={18} />
                </button>
                <div className="text-center">
                  <p className="font-extrabold text-foreground">{MONTH_NAMES[currentMonth]} {currentYear}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{blockedThisMonth} day{blockedThisMonth !== 1 ? 's' : ''} blocked this month</p>
                </div>
                <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-muted transition-colors">
                  <ChevronRight size={18} />
                </button>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {DAY_NAMES.map(d => (
                  <div key={d} className="text-center text-xs font-bold text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Calendar Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 size={24} className="animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-7 gap-1">
                  {calendarDays.map((dateStr, idx) => {
                    if (!dateStr) return <div key={`empty-${idx}`} />;
                    const slot = getDateSlot(dateStr);
                    const isPast = dateStr < today;
                    const isToday = dateStr === today;
                    const isSelected = dateStr === selectedDate;
                    const isBlocked = slot?.is_blocked;
                    const hasHours = slot && !slot.is_blocked;

                    let cls = 'relative flex flex-col items-center justify-center h-11 rounded-xl text-sm font-medium transition-all select-none ';
                    if (isSelected) cls += 'bg-primary text-white shadow-md z-10 ';
                    else if (isBlocked) cls += 'bg-danger/15 text-danger border border-danger/30 ';
                    else if (hasHours) cls += 'bg-success/15 text-success border border-success/30 ';
                    else if (isPast) cls += 'text-muted-foreground/40 cursor-not-allowed ';
                    else if (isToday) cls += 'border-2 border-primary text-primary font-bold cursor-pointer hover:bg-primary/10 ';
                    else cls += 'text-foreground cursor-pointer hover:bg-primary/10 hover:text-primary ';

                    const day = parseInt(dateStr.split('-')[2]);

                    return (
                      <button key={dateStr} onClick={() => !isPast && handleDayClick(dateStr)}
                        disabled={isPast} className={cls} title={slot ? `${isBlocked ? 'Blocked' : `${slot.start_hour}:00–${slot.end_hour}:00`}${slot.note ? ` · ${slot.note}` : ''}` : undefined}>
                        <span>{day}</span>
                        {isBlocked && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-danger" />}
                        {hasHours && <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-success" />}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Legend */}
              <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border flex-wrap">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-danger/40 border border-danger/50" />
                  Blocked / Unavailable
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-success/40 border border-success/50" />
                  Custom Hours Set
                </div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  Selected
                </div>
                <p className="text-xs text-muted-foreground ml-auto">Click any future date to set availability</p>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="space-y-4">
            {/* Slot Form */}
            {showSlotForm && selectedDate && (
              <div className="bg-card rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-foreground text-sm">
                    {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </h3>
                  {getDateSlot(selectedDate) && (
                    <button onClick={() => { const s = getDateSlot(selectedDate); if (s) removeSlot(s.id, selectedDate); }}
                      disabled={!!deletingId}
                      className="p-1.5 rounded-lg hover:bg-danger/10 text-danger transition-colors disabled:opacity-50">
                      {deletingId ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  )}
                </div>

                {/* Block toggle */}
                <div className="flex gap-2 mb-4">
                  <button onClick={() => setSlotForm(p => ({ ...p, isBlocked: true }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${slotForm.isBlocked ? 'border-danger bg-danger/5 text-danger' : 'border-border text-muted-foreground hover:border-danger/50'}`}>
                    <XCircle size={14} /> Block Day
                  </button>
                  <button onClick={() => setSlotForm(p => ({ ...p, isBlocked: false }))}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${!slotForm.isBlocked ? 'border-success bg-success/5 text-success' : 'border-border text-muted-foreground hover:border-success/50'}`}>
                    <Clock size={14} /> Set Hours
                  </button>
                </div>

                {/* Hours (only when not fully blocked) */}
                {!slotForm.isBlocked && (
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">Start Time</label>
                      <select value={slotForm.startHour} onChange={e => setSlotForm(p => ({ ...p, startHour: parseInt(e.target.value) }))}
                        className="input-field w-full text-sm">
                        {HOUR_OPTIONS.map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-foreground mb-1.5">End Time</label>
                      <select value={slotForm.endHour} onChange={e => setSlotForm(p => ({ ...p, endHour: parseInt(e.target.value) }))}
                        className="input-field w-full text-sm">
                        {HOUR_OPTIONS.filter(h => h.value > slotForm.startHour).map(h => <option key={h.value} value={h.value}>{h.label}</option>)}
                      </select>
                    </div>
                  </div>
                )}

                {/* Note */}
                <div className="mb-4">
                  <label className="block text-xs font-semibold text-foreground mb-1.5">Note (optional)</label>
                  <input value={slotForm.note} onChange={e => setSlotForm(p => ({ ...p, note: e.target.value }))}
                    placeholder="e.g. Personal work, Festival, etc." className="input-field w-full text-sm" />
                </div>

                <div className="flex gap-2">
                  <button onClick={() => { setShowSlotForm(false); setSelectedDate(null); }}
                    className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted transition-colors">
                    Cancel
                  </button>
                  <button onClick={saveSlot} disabled={saving}
                    className="flex-1 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5">
                    {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
                    Save
                  </button>
                </div>
              </div>
            )}

            {/* Upcoming Blocked Dates */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                <Calendar size={15} className="text-primary" /> Upcoming Blocked Dates
              </h3>
              {loading ? (
                <div className="flex justify-center py-4"><Loader2 size={18} className="animate-spin text-primary" /></div>
              ) : upcomingBlocked.length === 0 ? (
                <div className="text-center py-6">
                  <CheckCircle size={28} className="text-success mx-auto mb-2" />
                  <p className="text-sm font-semibold text-foreground">All clear!</p>
                  <p className="text-xs text-muted-foreground mt-1">No upcoming blocked dates</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {upcomingBlocked.map(b => (
                    <div key={b.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {new Date(b.date + 'T00:00:00').toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </p>
                        {b.note && <p className="text-xs text-muted-foreground">{b.note}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-danger bg-danger/10 px-2 py-0.5 rounded-full">Blocked</span>
                        <button onClick={() => removeSlot(b.id, b.date)} disabled={deletingId === b.id}
                          className="p-1 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors disabled:opacity-50">
                          {deletingId === b.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Stats */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h3 className="font-bold text-foreground text-sm mb-3">This Month</h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-danger/5 rounded-xl p-3 text-center">
                  <p className="text-xl font-extrabold text-danger">{blockedThisMonth}</p>
                  <p className="text-xs text-muted-foreground">Days Blocked</p>
                </div>
                <div className="bg-success/5 rounded-xl p-3 text-center">
                  <p className="text-xl font-extrabold text-success">{daysInMonth - blockedThisMonth}</p>
                  <p className="text-xs text-muted-foreground">Days Available</p>
                </div>
              </div>
              {driverEquipment.length > 0 && (
                <p className="text-xs text-muted-foreground mt-3 text-center">
                  Synced to {driverEquipment.length} equipment listing{driverEquipment.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
