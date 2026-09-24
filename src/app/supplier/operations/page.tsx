'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Package, Calendar, CheckCircle, XCircle, Clock, Plus, Edit3, Camera, ToggleLeft, ToggleRight, ChevronDown, User, Phone, IndianRupee, MapPin, Star, Bell, Upload, X, Save, AlertCircle, Eye } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

interface Equipment {
  id: string;
  name: string;
  category: string;
  rentPerDay: number;
  status: 'active' | 'paused' | 'pending';
  location: string;
  photos: string[];
  availableDays: string[];
  rating: number;
  bookings: number;
  dbId?: string;
}

interface BookingRequest {
  id: string;
  bookingRef: string;
  equipment: string;
  farmer: string;
  phone: string;
  startDate: string;
  endDate: string;
  amount: number;
  status: 'pending' | 'accepted' | 'declined';
  message?: string;
  dbId?: string;
}

interface PhotoUploadState {
  equipmentId: string;
  previews: string[];
  uploading: boolean;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MOCK_EQUIPMENT: Equipment[] = [
  {
    id: 'eq1', name: 'Mahindra Yuvo 575 DI Tractor', category: 'Tractor',
    rentPerDay: 2500, status: 'active', location: 'Pune, Maharashtra',
    photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_1315e840e-1765250553872.png'],
    availableDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    rating: 4.6, bookings: 34,
  },
  {
    id: 'eq2', name: 'Rotavator 7 Feet', category: 'Tillage',
    rentPerDay: 1200, status: 'active', location: 'Nashik, Maharashtra',
    photos: ['https://img.rocket.new/generatedImages/rocket_gen_img_1f72a525d-1776095395384.png'],
    availableDays: ['Mon', 'Wed', 'Fri', 'Sat', 'Sun'],
    rating: 4.4, bookings: 18,
  },
  {
    id: 'eq3', name: 'Paddy Transplanter 8-Row', category: 'Planting',
    rentPerDay: 3500, status: 'paused', location: 'Kolhapur, Maharashtra',
    photos: [],
    availableDays: ['Sat', 'Sun'],
    rating: 4.2, bookings: 9,
  },
];

const MOCK_BOOKINGS: BookingRequest[] = [
  {
    id: 'b1', bookingRef: 'BKG12345', equipment: 'Mahindra Yuvo 575 DI Tractor',
    farmer: 'Suresh Yadav', phone: '+91 98765 11111',
    startDate: '2026-09-28', endDate: '2026-09-30', amount: 7500,
    status: 'pending', message: 'Need for wheat harvesting, will pick up from your location.',
  },
  {
    id: 'b2', bookingRef: 'BKG12346', equipment: 'Rotavator 7 Feet',
    farmer: 'Priya Deshmukh', phone: '+91 87654 22222',
    startDate: '2026-10-02', endDate: '2026-10-03', amount: 2400,
    status: 'pending', message: 'For soil preparation before sowing.',
  },
  {
    id: 'b3', bookingRef: 'BKG12340', equipment: 'Mahindra Yuvo 575 DI Tractor',
    farmer: 'Mohan Kulkarni', phone: '+91 76543 33333',
    startDate: '2026-09-20', endDate: '2026-09-22', amount: 7500,
    status: 'accepted',
  },
  {
    id: 'b4', bookingRef: 'BKG12338', equipment: 'Rotavator 7 Feet',
    farmer: 'Anita Patil', phone: '+91 65432 44444',
    startDate: '2026-09-15', endDate: '2026-09-16', amount: 1200,
    status: 'declined',
  },
];

type Tab = 'listings' | 'availability' | 'bookings';

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SupplierOperationsPage() {
  const [tab, setTab] = useState<Tab>('listings');
  const [equipment, setEquipment] = useState<Equipment[]>(MOCK_EQUIPMENT);
  const [bookings, setBookings] = useState<BookingRequest[]>(MOCK_BOOKINGS);
  const [photoUpload, setPhotoUpload] = useState<PhotoUploadState | null>(null);
  const [editingAvail, setEditingAvail] = useState<string | null>(null);
  const [expandedBooking, setExpandedBooking] = useState<string | null>(null);
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [loadingBookings, setLoadingBookings] = useState(false);
  const [bookingFilter, setBookingFilter] = useState<'all' | 'pending' | 'accepted' | 'declined'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const pendingCount = bookings.filter((b) => b.status === 'pending').length;
  const activeCount = bookings.filter((b) => b.status === 'accepted').length;

  // ── Load bookings from Supabase ──
  const loadBookings = useCallback(async () => {
    setLoadingBookings(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoadingBookings(false); return; }

      const { data } = await supabase
        .from('bookings')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);

      if (data && data.length > 0) {
        const mapped: BookingRequest[] = data.map((b) => ({
          id: b.id,
          bookingRef: b.booking_ref,
          equipment: b.equipment_name,
          farmer: b.buyer_name,
          phone: b.buyer_phone || '',
          startDate: b.start_date,
          endDate: b.end_date,
          amount: Number(b.total_amount),
          status: b.booking_status === 'accepted' ? 'accepted' : b.booking_status === 'declined' ? 'declined' : 'pending',
          message: b.notes || '',
          dbId: b.id,
        }));
        setBookings(mapped);
      }
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoadingBookings(false);
    }
  }, [supabase]);

  // ── Real-time subscription ──
  useEffect(() => {
    loadBookings();

    const channel = supabase
      .channel('ops-bookings-rt')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bookings' }, (payload) => {
        const nb = payload.new as Record<string, unknown>;
        const newReq: BookingRequest = {
          id: nb.id as string,
          bookingRef: nb.booking_ref as string,
          equipment: nb.equipment_name as string,
          farmer: nb.buyer_name as string,
          phone: (nb.buyer_phone as string) || '',
          startDate: nb.start_date as string,
          endDate: nb.end_date as string,
          amount: nb.total_amount as number,
          status: 'pending',
          dbId: nb.id as string,
        };
        setBookings((prev) => [newReq, ...prev]);
        toast.success(`🔔 New rental request from ${nb.buyer_name}!`, { duration: 6000 });
      })
      .subscribe((status) => setIsRealtimeConnected(status === 'SUBSCRIBED'));

    return () => { supabase.removeChannel(channel); };
  }, [loadBookings, supabase]);

  // ── Booking action ──
  async function handleBookingAction(bookingId: string, action: 'accepted' | 'declined') {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (booking.dbId) {
      const { error } = await supabase
        .from('bookings')
        .update({ booking_status: action })
        .eq('id', booking.dbId);
      if (error) console.error('Booking update error:', error);
    }

    setBookings((prev) => prev.map((b) => b.id === bookingId ? { ...b, status: action } : b));
    toast.success(action === 'accepted' ? '✅ Booking accepted!' : 'Booking declined.');
    setExpandedBooking(null);
  }

  // ── Toggle equipment status ──
  function toggleStatus(id: string) {
    setEquipment((prev) => prev.map((e) =>
      e.id === id ? { ...e, status: e.status === 'active' ? 'paused' : 'active' } : e
    ));
    const eq = equipment.find((e) => e.id === id);
    toast.success(`${eq?.name} is now ${eq?.status === 'active' ? 'paused' : 'active'}`);
  }

  // ── Photo upload (preview only — real upload would go to Supabase Storage) ──
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (!photoUpload || !e.target.files) return;
    const files = Array.from(e.target.files);
    const readers = files.map((file) => new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target?.result as string);
      reader.readAsDataURL(file);
    }));
    Promise.all(readers).then((previews) => {
      setEquipment((prev) => prev.map((eq) =>
        eq.id === photoUpload.equipmentId
          ? { ...eq, photos: [...eq.photos, ...previews].slice(0, 6) }
          : eq
      ));
      setPhotoUpload(null);
      toast.success(`${previews.length} photo(s) added!`);
    });
  }

  function removePhoto(equipmentId: string, photoIdx: number) {
    setEquipment((prev) => prev.map((eq) =>
      eq.id === equipmentId ? { ...eq, photos: eq.photos.filter((_, i) => i !== photoIdx) } : eq
    ));
  }

  // ── Availability toggle ──
  function toggleDay(equipmentId: string, day: string) {
    setEquipment((prev) => prev.map((eq) => {
      if (eq.id !== equipmentId) return eq;
      const days = eq.availableDays.includes(day)
        ? eq.availableDays.filter((d) => d !== day)
        : [...eq.availableDays, day];
      return { ...eq, availableDays: days };
    }));
  }

  function saveAvailability(id: string) {
    setEditingAvail(null);
    toast.success('Availability updated!');
  }

  const filteredBookings = bookingFilter === 'all'
    ? bookings
    : bookings.filter((b) => b.status === bookingFilter);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hidden file input for photo upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={handlePhotoSelect}
      />

      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">

        {/* Page Header */}
        <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary border border-primary/20">⚙️ Operations</span>
              {isRealtimeConnected && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success/10 text-success border border-success/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />Live
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-foreground">Supplier Operations</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage listings, photos, availability &amp; rental requests</p>
          </div>
          <div className="flex items-center gap-2">
            {pendingCount > 0 && (
              <button
                onClick={() => setTab('bookings')}
                className="relative flex items-center gap-2 px-3 py-2.5 rounded-xl border border-warning/30 bg-warning/5 text-warning text-sm font-semibold hover:bg-warning/10 transition-colors"
              >
                <Bell size={15} />
                <span>{pendingCount} pending</span>
              </button>
            )}
            <Link
              href="/supplier/add-listing"
              className="btn-primary px-4 py-2.5 rounded-xl font-semibold text-sm flex items-center gap-2 min-h-[44px]"
            >
              <Plus size={16} /> Add Listing
            </Link>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Active Listings', value: equipment.filter((e) => e.status === 'active').length, icon: Package, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Pending Requests', value: pendingCount, icon: Clock, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Active Bookings', value: activeCount, icon: CheckCircle, color: 'text-success', bg: 'bg-success/10' },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-3 sm:p-4 flex items-center gap-3">
              <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                <s.icon size={16} className={s.color} />
              </div>
              <div className="min-w-0">
                <p className="text-lg sm:text-xl font-extrabold text-foreground leading-none">{s.value}</p>
                <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 leading-tight">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Tab Bar */}
        <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 mb-6 overflow-x-auto scrollbar-hide">
          {([
            { key: 'listings' as Tab, label: 'Equipment & Photos', icon: Package },
            { key: 'availability' as Tab, label: 'Availability', icon: Calendar },
            { key: 'bookings' as Tab, label: 'Rental Requests', icon: Clock },
          ]).map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all whitespace-nowrap min-h-[44px] ${tab === t.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
            >
              <t.icon size={15} />
              {t.label}
              {t.key === 'bookings' && pendingCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-danger text-white text-[10px] font-bold flex items-center justify-center">{pendingCount}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── TAB: Equipment & Photos ── */}
        {tab === 'listings' && (
          <div className="space-y-4">
            {equipment.map((eq) => (
              <div key={eq.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                {/* Equipment Header */}
                <div className="p-4 sm:p-5 flex items-start gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-bold text-base text-foreground">{eq.name}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${eq.status === 'active' ? 'bg-success/10 text-success' : eq.status === 'paused' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'}`}>
                        {eq.status}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                      <span>{eq.category}</span>
                      <span className="flex items-center gap-1"><MapPin size={11} />{eq.location}</span>
                      <span className="font-semibold text-primary">₹{eq.rentPerDay.toLocaleString('en-IN')}/day</span>
                      {eq.rating > 0 && <span className="flex items-center gap-1 text-warning"><Star size={11} fill="currentColor" />{eq.rating}</span>}
                      <span>{eq.bookings} bookings</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => toggleStatus(eq.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${eq.status === 'active' ? 'bg-warning/10 text-warning hover:bg-warning/20' : 'bg-success/10 text-success hover:bg-success/20'}`}
                    >
                      {eq.status === 'active' ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
                      {eq.status === 'active' ? 'Pause' : 'Activate'}
                    </button>
                    <Link
                      href="/supplier/add-listing"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors min-h-[36px]"
                    >
                      <Edit3 size={13} /> Edit
                    </Link>
                  </div>
                </div>

                {/* Photo Gallery */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Photos ({eq.photos.length}/6)</p>
                    <button
                      onClick={() => {
                        setPhotoUpload({ equipmentId: eq.id, previews: [], uploading: false });
                        fileInputRef.current?.click();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors min-h-[36px]"
                    >
                      <Camera size={13} /> Upload Photos
                    </button>
                  </div>

                  {eq.photos.length > 0 ? (
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                      {eq.photos.map((photo, idx) => (
                        <div key={idx} className="relative shrink-0 w-24 h-20 sm:w-28 sm:h-24 rounded-xl overflow-hidden group border border-border">
                          <img src={photo} alt={`${eq.name} photo ${idx + 1}`} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(eq.id, idx)}
                            className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-danger"
                          >
                            <X size={12} />
                          </button>
                          {idx === 0 && (
                            <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white">Cover</span>
                          )}
                        </div>
                      ))}
                      {eq.photos.length < 6 && (
                        <button
                          onClick={() => {
                            setPhotoUpload({ equipmentId: eq.id, previews: [], uploading: false });
                            fileInputRef.current?.click();
                          }}
                          className="shrink-0 w-24 h-20 sm:w-28 sm:h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 hover:border-primary hover:bg-primary/5 transition-colors"
                        >
                          <Upload size={16} className="text-muted-foreground" />
                          <span className="text-[10px] text-muted-foreground">Add more</span>
                        </button>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setPhotoUpload({ equipmentId: eq.id, previews: [], uploading: false });
                        fileInputRef.current?.click();
                      }}
                      className="w-full h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center gap-2 hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <Camera size={20} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">No photos yet — click to upload</span>
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Add new listing CTA */}
            <Link
              href="/supplier/add-listing"
              className="flex items-center justify-center gap-3 w-full py-5 rounded-2xl border-2 border-dashed border-border hover:border-primary hover:bg-primary/5 transition-colors group"
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus size={18} className="text-primary" />
              </div>
              <div className="text-left">
                <p className="font-bold text-sm text-foreground">Add New Equipment</p>
                <p className="text-xs text-muted-foreground">List a tractor, harvester, or any farm equipment</p>
              </div>
            </Link>
          </div>
        )}

        {/* ── TAB: Availability ── */}
        {tab === 'availability' && (
          <div className="space-y-4">
            <div className="bg-card rounded-2xl border border-border p-4 flex items-start gap-3">
              <AlertCircle size={16} className="text-primary shrink-0 mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Set which days each equipment is available for rental. Farmers will only see available slots when booking.
              </p>
            </div>

            {equipment.map((eq) => (
              <div key={eq.id} className="bg-card rounded-2xl border border-border p-4 sm:p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{eq.name}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{eq.category} · {eq.location}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${eq.status === 'active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'}`}>
                      {eq.status}
                    </span>
                    {editingAvail === eq.id ? (
                      <button
                        onClick={() => saveAvailability(eq.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg btn-primary text-xs font-semibold min-h-[36px]"
                      >
                        <Save size={13} /> Save
                      </button>
                    ) : (
                      <button
                        onClick={() => setEditingAvail(eq.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors min-h-[36px]"
                      >
                        <Edit3 size={13} /> Edit
                      </button>
                    )}
                  </div>
                </div>

                {/* Day toggles */}
                <div className="flex gap-2 flex-wrap">
                  {DAYS_OF_WEEK.map((day) => {
                    const isAvail = eq.availableDays.includes(day);
                    const isEditing = editingAvail === eq.id;
                    return (
                      <button
                        key={day}
                        onClick={() => isEditing && toggleDay(eq.id, day)}
                        disabled={!isEditing}
                        className={`w-12 h-12 rounded-xl text-xs font-bold transition-all ${
                          isAvail
                            ? 'bg-primary text-white shadow-sm'
                            : 'bg-muted text-muted-foreground'
                        } ${isEditing ? 'cursor-pointer hover:scale-105' : 'cursor-default'}`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>

                {/* Availability summary */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 bg-muted rounded-full h-1.5">
                    <div
                      className="bg-primary h-1.5 rounded-full transition-all"
                      style={{ width: `${(eq.availableDays.length / 7) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {eq.availableDays.length}/7 days available
                  </span>
                </div>

                {eq.availableDays.length === 0 && (
                  <p className="text-xs text-danger mt-2 flex items-center gap-1">
                    <AlertCircle size={12} /> No days selected — equipment won&apos;t appear in search results
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB: Rental Requests / Bookings ── */}
        {tab === 'bookings' && (
          <div className="space-y-4">
            {/* Filter bar */}
            <div className="flex items-center gap-1 bg-muted/50 rounded-xl p-1 overflow-x-auto scrollbar-hide">
              {([
                { key: 'all' as const, label: 'All', count: bookings.length },
                { key: 'pending' as const, label: 'Pending', count: pendingCount },
                { key: 'accepted' as const, label: 'Active', count: activeCount },
                { key: 'declined' as const, label: 'Declined', count: bookings.filter((b) => b.status === 'declined').length },
              ]).map((f) => (
                <button
                  key={f.key}
                  onClick={() => setBookingFilter(f.key)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${bookingFilter === f.key ? 'bg-card shadow text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  {f.label}
                  {f.count > 0 && (
                    <span className={`w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center ${f.key === 'pending' && f.count > 0 ? 'bg-danger text-white' : 'bg-muted text-muted-foreground'}`}>
                      {f.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {loadingBookings ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="h-24 bg-muted rounded-2xl animate-pulse" />)}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <Calendar size={40} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground mb-1">No {bookingFilter === 'all' ? '' : bookingFilter} bookings</p>
                <p className="text-sm text-muted-foreground">Rental requests will appear here when farmers book your equipment.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookings.map((b) => (
                  <div
                    key={b.id}
                    className={`bg-card rounded-2xl border overflow-hidden transition-all ${b.status === 'pending' ? 'border-warning/40' : 'border-border'}`}
                  >
                    {/* Booking summary row */}
                    <div className="p-4 sm:p-5">
                      <div className="flex items-start gap-3 flex-wrap">
                        {/* Status icon */}
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${b.status === 'pending' ? 'bg-warning/10' : b.status === 'accepted' ? 'bg-success/10' : 'bg-muted'}`}>
                          {b.status === 'pending' && <Clock size={18} className="text-warning" />}
                          {b.status === 'accepted' && <CheckCircle size={18} className="text-success" />}
                          {b.status === 'declined' && <XCircle size={18} className="text-muted-foreground" />}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <p className="font-bold text-sm text-foreground">{b.equipment}</p>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.status === 'pending' ? 'bg-warning/10 text-warning' : b.status === 'accepted' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                              {b.status === 'accepted' ? 'Active' : b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                            <span className="flex items-center gap-1"><User size={11} />{b.farmer}</span>
                            {b.phone && <span className="flex items-center gap-1"><Phone size={11} />{b.phone}</span>}
                            <span className="flex items-center gap-1"><Calendar size={11} />{b.startDate} → {b.endDate}</span>
                          </div>
                          <div className="flex items-center gap-3 mt-1.5">
                            <span className="font-bold text-success text-sm">₹{b.amount.toLocaleString('en-IN')}</span>
                            <span className="text-xs text-muted-foreground">Ref: {b.bookingRef}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => setExpandedBooking(expandedBooking === b.id ? null : b.id)}
                          className="p-2 rounded-lg hover:bg-muted transition-colors shrink-0"
                        >
                          <ChevronDown size={16} className={`text-muted-foreground transition-transform ${expandedBooking === b.id ? 'rotate-180' : ''}`} />
                        </button>
                      </div>

                      {/* Pending quick-action buttons */}
                      {b.status === 'pending' && (
                        <div className="flex gap-2 mt-3">
                          <button
                            onClick={() => handleBookingAction(b.id, 'accepted')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-success text-white text-sm font-bold hover:bg-success/90 transition-colors min-h-[48px]"
                          >
                            <CheckCircle size={15} /> Accept Booking
                          </button>
                          <button
                            onClick={() => handleBookingAction(b.id, 'declined')}
                            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-danger/10 text-danger text-sm font-bold hover:bg-danger/20 transition-colors min-h-[48px]"
                          >
                            <XCircle size={15} /> Decline
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Expanded detail panel */}
                    {expandedBooking === b.id && (
                      <div className="border-t border-border bg-muted/30 px-4 sm:px-5 py-4 space-y-3">
                        {b.message && (
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Farmer&apos;s Message</p>
                            <p className="text-sm text-foreground bg-card rounded-xl p-3 border border-border">{b.message}</p>
                          </div>
                        )}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          <div className="bg-card rounded-xl p-3 border border-border">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Start Date</p>
                            <p className="text-sm font-semibold text-foreground">{b.startDate}</p>
                          </div>
                          <div className="bg-card rounded-xl p-3 border border-border">
                            <p className="text-[10px] text-muted-foreground mb-0.5">End Date</p>
                            <p className="text-sm font-semibold text-foreground">{b.endDate}</p>
                          </div>
                          <div className="bg-card rounded-xl p-3 border border-border">
                            <p className="text-[10px] text-muted-foreground mb-0.5">Total Amount</p>
                            <p className="text-sm font-bold text-success">₹{b.amount.toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link
                            href="/messages"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors"
                          >
                            <Eye size={13} /> Message Farmer
                          </Link>
                          {b.status === 'accepted' && (
                            <Link
                              href="/rental-return"
                              className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors"
                            >
                              <IndianRupee size={13} /> Process Return
                            </Link>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
