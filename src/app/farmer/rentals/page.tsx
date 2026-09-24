'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Package, Clock, RotateCcw, CheckCircle, XCircle, AlertTriangle, Search, ChevronDown, ChevronUp, Phone, MapPin, Star, Calendar, IndianRupee, Truck, Eye, RefreshCw, Filter } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Icon from '../../../../kisansetu-main/src/components/ui/AppIcon';


// ─── Types ────────────────────────────────────────────────────────────────────

type RentalStatus = 'pending' | 'accepted' | 'active' | 'completed' | 'cancelled' | 'declined';

interface Rental {
  id: string;
  bookingRef: string;
  equipmentName: string;
  equipmentCategory: string;
  equipmentImage: string;
  supplierName: string;
  supplierPhone: string;
  supplierLocation: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  totalAmount: number;
  deposit: number;
  amountPaid: number;
  paymentMethod: string;
  status: RentalStatus;
  meetingPoint: string;
  driverName?: string;
  driverPhone?: string;
  notes?: string;
  createdAt: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RENTALS: Rental[] = [
{
  id: 'r1', bookingRef: 'BKG82341',
  equipmentName: 'Mahindra 575 DI Tractor', equipmentCategory: 'Tractor',
  equipmentImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1315e840e-1765250553872.png',
  supplierName: 'Ramesh Agro Services', supplierPhone: '+91 98765 43210',
  supplierLocation: 'Pune, Maharashtra',
  startDate: '2026-09-22', endDate: '2026-09-26', days: 4,
  dailyRate: 2500, totalAmount: 12000, deposit: 2000, amountPaid: 12000,
  paymentMethod: 'UPI', status: 'active',
  meetingPoint: 'Village Chowk, Hadapsar', driverName: 'Raju Patil', driverPhone: '+91 99887 12345',
  createdAt: '2026-09-20'
},
{
  id: 'r2', bookingRef: 'BKG71209',
  equipmentName: 'Rotavator 7-Feet Heavy Duty', equipmentCategory: 'Tillage Equipment',
  equipmentImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_163ecef60-1784222686661.png',
  supplierName: 'Singh Farm Machinery', supplierPhone: '+91 97654 32109',
  supplierLocation: 'Nashik, Maharashtra',
  startDate: '2026-09-28', endDate: '2026-09-30', days: 2,
  dailyRate: 1200, totalAmount: 3400, deposit: 800, amountPaid: 0,
  paymentMethod: '', status: 'accepted',
  meetingPoint: 'Near Nashik Highway Toll', createdAt: '2026-09-23'
},
{
  id: 'r3', bookingRef: 'BKG65890',
  equipmentName: 'Paddy Transplanter 8-Row', equipmentCategory: 'Planting Equipment',
  equipmentImage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80',
  supplierName: 'Green Fields Equipment', supplierPhone: '+91 96543 21098',
  supplierLocation: 'Kolhapur, Maharashtra',
  startDate: '2026-10-05', endDate: '2026-10-07', days: 2,
  dailyRate: 3500, totalAmount: 8500, deposit: 1500, amountPaid: 0,
  paymentMethod: '', status: 'pending',
  meetingPoint: '', createdAt: '2026-09-24'
},
{
  id: 'r4', bookingRef: 'BKG43210',
  equipmentName: 'Mini Power Tiller 7HP', equipmentCategory: 'Tiller',
  equipmentImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e7a72901-1768249566100.png',
  supplierName: 'Kisan Tools Hub', supplierPhone: '+91 95432 10987',
  supplierLocation: 'Aurangabad, Maharashtra',
  startDate: '2026-09-10', endDate: '2026-09-12', days: 2,
  dailyRate: 900, totalAmount: 2300, deposit: 500, amountPaid: 2300,
  paymentMethod: 'Net Banking', status: 'completed',
  meetingPoint: 'Aurangabad Bus Stand', createdAt: '2026-09-08'
},
{
  id: 'r5', bookingRef: 'BKG31100',
  equipmentName: 'Disc Harrow 20-Disc', equipmentCategory: 'Tillage Equipment',
  equipmentImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f72a525d-1776095395384.png',
  supplierName: 'Agro Power Rentals', supplierPhone: '+91 94321 09876',
  supplierLocation: 'Solapur, Maharashtra',
  startDate: '2026-08-20', endDate: '2026-08-22', days: 2,
  dailyRate: 1500, totalAmount: 3500, deposit: 700, amountPaid: 3500,
  paymentMethod: 'Credit Card', status: 'completed',
  meetingPoint: 'Solapur Market Yard', createdAt: '2026-08-18'
},
{
  id: 'r6', bookingRef: 'BKG20099',
  equipmentName: 'Combine Harvester 4WD', equipmentCategory: 'Harvesting',
  equipmentImage: "https://images.unsplash.com/photo-1482228647413-9bf148c1dd4a",
  supplierName: 'Harvest Pro Machines', supplierPhone: '+91 93210 98765',
  supplierLocation: 'Latur, Maharashtra',
  startDate: '2026-09-15', endDate: '2026-09-15', days: 1,
  dailyRate: 8000, totalAmount: 8500, deposit: 2000, amountPaid: 0,
  paymentMethod: '', status: 'cancelled',
  meetingPoint: '', notes: 'Cancelled due to rain forecast', createdAt: '2026-09-12'
}];


// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<RentalStatus, {label: string;color: string;icon: React.ElementType;}> = {
  pending: { label: 'Awaiting Approval', color: 'text-warning bg-warning/10 border-warning/30', icon: Clock },
  accepted: { label: 'Confirmed', color: 'text-info bg-info/10 border-info/30', icon: CheckCircle },
  active: { label: 'Active Rental', color: 'text-success bg-success/10 border-success/30', icon: Truck },
  completed: { label: 'Returned', color: 'text-muted-foreground bg-muted border-border', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'text-danger bg-danger/10 border-danger/30', icon: XCircle },
  declined: { label: 'Declined', color: 'text-danger bg-danger/10 border-danger/30', icon: XCircle }
};

// ─── Tab Config ───────────────────────────────────────────────────────────────

const TABS = [
{ key: 'all', label: 'All Rentals' },
{ key: 'active', label: 'Active' },
{ key: 'upcoming', label: 'Upcoming Returns' },
{ key: 'history', label: 'History' }];


// ─── Helpers ──────────────────────────────────────────────────────────────────

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── Rental Card ──────────────────────────────────────────────────────────────

function RentalCard({
  rental,
  onCancel,
  onReview,
  reviewedIds





}: {rental: Rental;onCancel: (id: string) => void;onReview: (rental: Rental) => void;reviewedIds: Set<string>;}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = STATUS_CONFIG[rental.status];
  const StatusIcon = cfg.icon;
  const returnDays = daysUntil(rental.endDate);
  const isUpcomingReturn = rental.status === 'active' && returnDays >= 0 && returnDays <= 3;

  return (
    <div className={`bg-card rounded-2xl border transition-all duration-200 ${isUpcomingReturn ? 'border-warning/50 shadow-md' : 'border-border'}`}>
      {isUpcomingReturn &&
      <div className="flex items-center gap-2 px-4 py-2 bg-warning/8 rounded-t-2xl border-b border-warning/20">
          <AlertTriangle size={14} className="text-warning shrink-0" />
          <p className="text-xs font-semibold text-warning">
            {returnDays === 0 ? 'Return due TODAY' : `Return due in ${returnDays} day${returnDays > 1 ? 's' : ''}`}
          </p>
        </div>
      }

      <div className="p-4 sm:p-5">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden shrink-0 bg-muted">
            <img src={rental.equipmentImage} alt={rental.equipmentName} className="w-full h-full object-cover" />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap mb-1.5">
              <div className="min-w-0">
                <p className="font-bold text-foreground text-sm sm:text-base leading-tight truncate">{rental.equipmentName}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{rental.equipmentCategory} · {rental.supplierName}</p>
                <p className="text-xs text-muted-foreground">#{rental.bookingRef}</p>
              </div>
              <span className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-full border shrink-0 ${cfg.color}`}>
                <StatusIcon size={11} />
                {cfg.label}
              </span>
            </div>

            <div className="flex items-center gap-3 sm:gap-4 text-xs text-muted-foreground flex-wrap mt-2">
              <span className="flex items-center gap-1"><Calendar size={11} />{formatDate(rental.startDate)} → {formatDate(rental.endDate)}</span>
              <span className="flex items-center gap-1 font-bold text-primary"><IndianRupee size={11} />₹{rental.totalAmount.toLocaleString('en-IN')}</span>
              {rental.deposit > 0 && <span className="text-warning">Deposit: ₹{rental.deposit.toLocaleString('en-IN')}</span>}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 mt-3 flex-wrap">
              {rental.status === 'active' &&
              <Link
                href="/rental-return"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-warning/10 text-warning text-xs font-semibold hover:bg-warning/20 transition-colors">
                
                  <RotateCcw size={12} /> Initiate Return
                </Link>
              }
              {(rental.status === 'active' || rental.status === 'accepted') &&
              <a
                href={`tel:${rental.supplierPhone}`}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors">
                
                  <Phone size={12} /> Call Supplier
                </a>
              }
              {rental.status === 'pending' &&
              <button
                onClick={() => onCancel(rental.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-danger/10 text-danger text-xs font-semibold hover:bg-danger/20 transition-colors">
                
                  <XCircle size={12} /> Cancel Request
                </button>
              }
              {rental.status === 'completed' && !reviewedIds.has(rental.id) &&
              <button
                onClick={() => onReview(rental)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent/10 text-accent text-xs font-semibold hover:bg-accent/20 transition-colors">
                
                  <Star size={12} /> Write Review
                </button>
              }
              {rental.status === 'completed' && reviewedIds.has(rental.id) &&
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-success/10 text-success text-xs font-semibold">
                  <Star size={12} /> Reviewed
                </span>
              }
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-muted text-muted-foreground text-xs font-semibold hover:bg-secondary transition-colors ml-auto">
                
                <Eye size={12} /> Details {expanded ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
              </button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded &&
        <div className="mt-4 pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Rental Details</p>
              <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-semibold text-foreground">{rental.days} day{rental.days > 1 ? 's' : ''}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Daily Rate</span><span className="font-semibold text-foreground">₹{rental.dailyRate.toLocaleString('en-IN')}/day</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Total Amount</span><span className="font-bold text-primary">₹{rental.totalAmount.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span className="font-semibold text-warning">₹{rental.deposit.toLocaleString('en-IN')}</span></div>
              {rental.paymentMethod && <div className="flex justify-between"><span className="text-muted-foreground">Payment</span><span className="font-semibold text-foreground">{rental.paymentMethod}</span></div>}
            </div>
            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Supplier & Pickup</p>
              <div className="flex items-start gap-1.5"><MapPin size={13} className="text-muted-foreground mt-0.5 shrink-0" /><span className="text-foreground text-xs">{rental.supplierLocation}</span></div>
              {rental.meetingPoint && <div className="flex items-start gap-1.5"><MapPin size={13} className="text-primary mt-0.5 shrink-0" /><span className="text-foreground text-xs">{rental.meetingPoint}</span></div>}
              {rental.driverName &&
            <div className="flex items-center gap-1.5">
                  <Truck size={13} className="text-muted-foreground shrink-0" />
                  <span className="text-xs text-foreground">{rental.driverName} · {rental.driverPhone}</span>
                </div>
            }
              {rental.notes && <p className="text-xs text-muted-foreground italic">"{rental.notes}"</p>}
            </div>
          </div>
        }
      </div>
    </div>);

}

// ─── Review Modal ─────────────────────────────────────────────────────────────

function ReviewModal({ rental, onClose, onSubmit }: {rental: Rental;onClose: () => void;onSubmit: () => void;}) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (rating === 0) {toast.error('Please select a rating');return;}
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitting(false);
    onSubmit();
    toast.success('Review submitted successfully!');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-card rounded-2xl border border-border shadow-modal w-full max-w-md p-6">
        <h3 className="font-bold text-lg text-foreground mb-1">Rate Your Rental</h3>
        <p className="text-sm text-muted-foreground mb-4">{rental.equipmentName} · {rental.supplierName}</p>
        <div className="flex items-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((s) =>
          <button key={s} onClick={() => setRating(s)} onMouseEnter={() => setHovered(s)} onMouseLeave={() => setHovered(0)}>
              <Star size={28} className={`transition-colors ${s <= (hovered || rating) ? 'text-warning fill-warning' : 'text-muted-foreground'}`} />
            </button>
          )}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience with this equipment and supplier..."
          rows={3}
          className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary resize-none mb-4" />
        
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleSubmit} disabled={submitting || rating === 0} className="flex-1 px-4 py-2.5 rounded-xl gradient-green text-white text-sm font-semibold disabled:opacity-50 transition-opacity">
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </div>
    </div>);

}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function FarmerRentalsPage() {
  const { user } = useAuth();
  const [rentals, setRentals] = useState<Rental[]>(MOCK_RENTALS);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [reviewTarget, setReviewTarget] = useState<Rental | null>(null);
  const [reviewedIds, setReviewedIds] = useState<Set<string>>(new Set());

  // Stats
  const activeCount = rentals.filter((r) => r.status === 'active').length;
  const upcomingCount = rentals.filter((r) => r.status === 'accepted' || r.status === 'pending').length;
  const upcomingReturnCount = rentals.filter((r) => r.status === 'active' && daysUntil(r.endDate) >= 0 && daysUntil(r.endDate) <= 3).length;
  const completedCount = rentals.filter((r) => r.status === 'completed').length;

  // Fetch from Supabase if user is logged in
  const fetchRentals = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase.
      from('bookings').
      select('*').
      eq('buyer_id', user.id).
      order('created_at', { ascending: false });
      if (error) throw error;
      if (data && data.length > 0) {
        const mapped: Rental[] = data.map((b: any) => ({
          id: b.id,
          bookingRef: b.booking_ref,
          equipmentName: b.equipment_name,
          equipmentCategory: b.equipment_category,
          equipmentImage: b.equipment_image || '',
          supplierName: b.supplier_name,
          supplierPhone: b.supplier_phone || '',
          supplierLocation: b.supplier_location || '',
          startDate: b.start_date,
          endDate: b.end_date,
          days: b.days,
          dailyRate: b.daily_rate,
          totalAmount: b.total_amount,
          deposit: b.deposit,
          amountPaid: b.amount_paid,
          paymentMethod: b.payment_method || '',
          status: b.booking_status as RentalStatus,
          meetingPoint: b.meeting_point || '',
          driverName: b.driver_name,
          driverPhone: b.driver_phone,
          notes: b.notes,
          createdAt: b.created_at
        }));
        setRentals(mapped);
      }
    } catch {

      // fallback to mock data
    } finally {setLoading(false);
    }
  }, [user]);

  useEffect(() => {fetchRentals();}, [fetchRentals]);

  function handleCancel(id: string) {
    setRentals((prev) => prev.map((r) => r.id === id ? { ...r, status: 'cancelled' } : r));
    toast.success('Booking request cancelled');
  }

  // Filter logic
  const filtered = rentals.filter((r) => {
    const matchSearch = !search ||
    r.equipmentName.toLowerCase().includes(search.toLowerCase()) ||
    r.bookingRef.toLowerCase().includes(search.toLowerCase()) ||
    r.supplierName.toLowerCase().includes(search.toLowerCase());

    const matchTab =
    activeTab === 'all' ? true :
    activeTab === 'active' ? r.status === 'active' :
    activeTab === 'upcoming' ? r.status === 'accepted' || r.status === 'pending' || r.status === 'active' && daysUntil(r.endDate) >= 0 && daysUntil(r.endDate) <= 3 :
    activeTab === 'history' ? r.status === 'completed' || r.status === 'cancelled' || r.status === 'declined' :
    true;

    return matchSearch && matchTab;
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-lg mx-auto px-4 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <span className="text-foreground font-medium">My Rentals</span>
        </div>

        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">My Rentals</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track active rentals, upcoming returns, and booking history</p>
          </div>
          <button
            onClick={fetchRentals}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted transition-colors disabled:opacity-50">
            
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
          { label: 'Active Rentals', value: activeCount, color: 'text-success', bg: 'bg-success/8 border-success/20', icon: Truck },
          { label: 'Upcoming / Pending', value: upcomingCount, color: 'text-info', bg: 'bg-info/8 border-info/20', icon: Clock },
          { label: 'Returns Due Soon', value: upcomingReturnCount, color: 'text-warning', bg: 'bg-warning/8 border-warning/20', icon: AlertTriangle },
          { label: 'Completed', value: completedCount, color: 'text-muted-foreground', bg: 'bg-muted border-border', icon: CheckCircle }].
          map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={`rounded-xl border p-3.5 ${stat.bg}`}>
                <div className="flex items-center gap-2 mb-1">
                  <Icon size={15} className={stat.color} />
                  <p className="text-xs text-muted-foreground font-medium leading-tight">{stat.label}</p>
                </div>
                <p className={`text-2xl font-extrabold ${stat.color}`}>{stat.value}</p>
              </div>);

          })}
        </div>

        {/* Search */}
        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm mb-4">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by equipment name, booking ID, or supplier..."
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          
          {search &&
          <button onClick={() => setSearch('')} className="text-muted-foreground hover:text-foreground transition-colors">
              <XCircle size={15} />
            </button>
          }
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
          {TABS.map((tab) =>
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${
            activeTab === tab.key ?
            'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`
            }>
            
              {tab.label}
              {tab.key === 'upcoming' && upcomingReturnCount > 0 &&
            <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full bg-warning text-white text-[10px] font-bold">{upcomingReturnCount}</span>
            }
            </button>
          )}
        </div>

        {/* Rental List */}
        {loading ?
        <div className="space-y-4">
            {[1, 2, 3].map((i) =>
          <div key={i} className="bg-card rounded-2xl border border-border p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-muted shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-2/3" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              </div>
          )}
          </div> :
        filtered.length === 0 ?
        <div className="bg-card rounded-2xl border border-border p-16 text-center">
            <Package size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-xl text-foreground mb-2">No rentals found</h3>
            <p className="text-muted-foreground text-sm mb-6">
              {search ? 'Try a different search term.' : 'You have no rentals in this category yet.'}
            </p>
            <Link href="/equipment-listing-page" className="btn-primary">Browse Equipment</Link>
          </div> :

        <div className="space-y-4">
            {filtered.map((rental) =>
          <RentalCard
            key={rental.id}
            rental={rental}
            onCancel={handleCancel}
            onReview={(r) => setReviewTarget(r)}
            reviewedIds={reviewedIds} />

          )}
          </div>
        }
      </main>
      <Footer />

      {reviewTarget &&
      <ReviewModal
        rental={reviewTarget}
        onClose={() => setReviewTarget(null)}
        onSubmit={() => setReviewedIds((prev) => new Set(prev).add(reviewTarget!.id))} />

      }
    </div>);

}