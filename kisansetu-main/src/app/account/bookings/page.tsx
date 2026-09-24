'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import {
  Package, Clock, CheckCircle, Truck, RotateCcw, ChevronDown,
  ChevronUp, MapPin, CreditCard, Star, AlertCircle, Search,
  Filter, Calendar, Phone, MessageSquare, ArrowLeft, X, Shield } from
'lucide-react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';


// ─── Types ────────────────────────────────────────────────────────────────────

type BookingStatus = 'confirmed' | 'preparing' | 'received' | 'rental_active' | 'returned' | 'cancelled';
type BookingType = 'rental' | 'purchase';

interface StatusStep {
  key: BookingStatus;
  label: string;
  icon: React.FC<{size?: number;className?: string;}>;
}

interface Booking {
  id: string;
  type: BookingType;
  equipmentName: string;
  equipmentCategory: string;
  equipmentImage: string;
  supplierName: string;
  supplierPhone: string;
  location: string;
  startDate: string;
  endDate?: string;
  status: BookingStatus;
  paymentMethod: string;
  amountPaid: number;
  deposit?: number;
  razorpayPaymentId?: string;
  createdAt: string;
  canTrack: boolean;
  canReturn: boolean;
  canReview: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_STEPS: StatusStep[] = [
{ key: 'confirmed', label: 'Confirmed', icon: CheckCircle },
{ key: 'preparing', label: 'Preparing', icon: Package },
{ key: 'received', label: 'Received', icon: Truck },
{ key: 'rental_active', label: 'Rental Active', icon: Clock },
{ key: 'returned', label: 'Returned', icon: RotateCcw }];


const STATUS_ORDER: BookingStatus[] = ['confirmed', 'preparing', 'received', 'rental_active', 'returned'];

const STATUS_COLORS: Record<BookingStatus, string> = {
  confirmed: 'text-info bg-info/10 border-info/20',
  preparing: 'text-warning bg-warning/10 border-warning/20',
  received: 'text-primary bg-primary/10 border-primary/20',
  rental_active: 'text-success bg-success/10 border-success/20',
  returned: 'text-muted-foreground bg-muted border-border',
  cancelled: 'text-danger bg-danger/10 border-danger/20'
};

const STATUS_LABELS: Record<BookingStatus, string> = {
  confirmed: 'Confirmed',
  preparing: 'Preparing',
  received: 'Received',
  rental_active: 'Rental Active',
  returned: 'Returned',
  cancelled: 'Cancelled'
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_BOOKINGS: Booking[] = [
{
  id: 'BKG82341',
  type: 'rental',
  equipmentName: 'Mahindra 575 DI Tractor',
  equipmentCategory: 'Tractor',
  equipmentImage: 'https://images.unsplash.com/photo-1605338803155-f7b4e9c0d6a4?w=400&q=80',
  supplierName: 'Ramesh Agro Services',
  supplierPhone: '+91 98765 43210',
  location: 'Pune, Maharashtra',
  startDate: '2026-08-10',
  endDate: '2026-08-14',
  status: 'rental_active',
  paymentMethod: 'UPI',
  amountPaid: 8500,
  deposit: 2000,
  razorpayPaymentId: 'pay_QXz8Abc123',
  createdAt: '2026-08-09',
  canTrack: true,
  canReturn: true,
  canReview: false
},
{
  id: 'BKG71209',
  type: 'rental',
  equipmentName: 'Rotavator 7-Feet Heavy Duty',
  equipmentCategory: 'Tillage Equipment',
  equipmentImage: "https://img.rocket.new/generatedImages/rocket_gen_img_163ecef60-1784222686661.png",
  supplierName: 'Singh Farm Machinery',
  supplierPhone: '+91 87654 32109',
  location: 'Nashik, Maharashtra',
  startDate: '2026-07-20',
  endDate: '2026-07-22',
  status: 'returned',
  paymentMethod: 'Net Banking',
  amountPaid: 3200,
  deposit: 1000,
  razorpayPaymentId: 'pay_PYw7Def456',
  createdAt: '2026-07-19',
  canTrack: false,
  canReturn: false,
  canReview: true
},
{
  id: 'BKG65890',
  type: 'rental',
  equipmentName: 'Paddy Transplanter 8-Row',
  equipmentCategory: 'Planting Equipment',
  equipmentImage: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=400&q=80',
  supplierName: 'Green Fields Equipment',
  supplierPhone: '+91 76543 21098',
  location: 'Kolhapur, Maharashtra',
  startDate: '2026-08-15',
  endDate: '2026-08-17',
  status: 'confirmed',
  paymentMethod: 'Credit Card',
  amountPaid: 4800,
  deposit: 1500,
  razorpayPaymentId: 'pay_OXv6Ghi789',
  createdAt: '2026-08-11',
  canTrack: true,
  canReturn: false,
  canReview: false
},
{
  id: 'BKG54321',
  type: 'purchase',
  equipmentName: 'Drip Irrigation Kit (1 Acre)',
  equipmentCategory: 'Irrigation',
  equipmentImage: "https://img.rocket.new/generatedImages/rocket_gen_img_155d1b283-1769227974139.png",
  supplierName: 'AquaFarm Solutions',
  supplierPhone: '+91 65432 10987',
  location: 'Solapur, Maharashtra',
  startDate: '2026-07-05',
  status: 'returned',
  paymentMethod: 'Debit Card',
  amountPaid: 12500,
  razorpayPaymentId: 'pay_NWu5Jkl012',
  createdAt: '2026-07-04',
  canTrack: false,
  canReturn: false,
  canReview: true
},
{
  id: 'BKG43210',
  type: 'rental',
  equipmentName: 'Mini Power Tiller 7HP',
  equipmentCategory: 'Tiller',
  equipmentImage: 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?w=400&q=80',
  supplierName: 'Kisan Tools Hub',
  supplierPhone: '+91 54321 09876',
  location: 'Aurangabad, Maharashtra',
  startDate: '2026-08-12',
  endDate: '2026-08-13',
  status: 'preparing',
  paymentMethod: 'UPI',
  amountPaid: 1800,
  deposit: 500,
  razorpayPaymentId: 'pay_MVt4Mno345',
  createdAt: '2026-08-11',
  canTrack: true,
  canReturn: false,
  canReview: false
}];


const FILTER_TABS = [
{ key: 'all', label: 'All Bookings' },
{ key: 'rental', label: 'Rentals' },
{ key: 'purchase', label: 'Purchases' },
{ key: 'active', label: 'Active' },
{ key: 'completed', label: 'Completed' }];


// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusTimeline({ status }: {status: BookingStatus;}) {
  if (status === 'cancelled') {
    return (
      <div className="flex items-center gap-2 py-3">
        <AlertCircle size={16} className="text-danger" />
        <span className="text-sm font-medium text-danger">Booking Cancelled</span>
      </div>);

  }

  const currentIndex = STATUS_ORDER.indexOf(status);

  return (
    <div className="flex items-center gap-0 w-full overflow-x-auto pb-1">
      {STATUS_STEPS.map((step, idx) => {
        const isCompleted = idx < currentIndex;
        const isActive = idx === currentIndex;
        const isPending = idx > currentIndex;
        const Icon = step.icon;

        return (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                isCompleted ?
                'bg-primary border-primary' :
                isActive ?
                'bg-primary/10 border-primary' : 'bg-muted border-border'}`
                }>
                
                <Icon
                  size={14}
                  className={
                  isCompleted ?
                  'text-white' :
                  isActive ?
                  'text-primary' : 'text-muted-foreground'
                  } />
                
              </div>
              <span
                className={`text-[10px] font-medium text-center leading-tight ${
                isCompleted || isActive ? 'text-foreground' : 'text-muted-foreground'}`
                }>
                
                {step.label}
              </span>
            </div>
            {idx < STATUS_STEPS.length - 1 &&
            <div
              className={`flex-1 h-0.5 mb-5 min-w-[12px] transition-all ${
              idx < currentIndex ? 'bg-primary' : 'bg-border'}`
              } />

            }
          </React.Fragment>);

      })}
    </div>);

}

function BookingCard({ booking }: {booking: Booking;}) {
  const [expanded, setExpanded] = useState(false);
  const [returnModal, setReturnModal] = useState(false);
  const [otpModal, setOtpModal] = useState(false);
  const [returnStep, setReturnStep] = useState<'form' | 'otp' | 'success'>('form');
  const [returnReason, setReturnReason] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [otpError, setOtpError] = useState(false);

  const nights =
  booking.endDate ?
  Math.max(1, Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24))) :
  null;

  function handleReturnSubmit() {
    setReturnStep('otp');
  }

  function handleOtpVerify() {
    if (otpValue === '1234') {
      setReturnStep('success');
      setOtpError(false);
    } else {
      setOtpError(true);
    }
  }

  return (
    <>
    <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200">
      {/* Card Header */}
      <div className="flex items-start gap-3 p-4">
        {/* Equipment Image */}
        <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-muted">
          <img
              src={booking.equipmentImage}
              alt={`${booking.equipmentName} - ${booking.equipmentCategory} available for ${booking.type}`}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/images/no_image.png';
              }} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="font-bold text-sm text-foreground leading-tight line-clamp-1">
                {booking.equipmentName}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">{booking.equipmentCategory}</p>
            </div>
            <span
                className={`shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_COLORS[booking.status]}`}>
              {STATUS_LABELS[booking.status]}
            </span>
          </div>

          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar size={11} />
              {booking.startDate}
              {booking.endDate && ` → ${booking.endDate}`}
            </span>
            {nights &&
              <span className="text-xs text-muted-foreground">{nights} day{nights > 1 ? 's' : ''}</span>
              }
            <span
                className={`text-[10px] font-medium px-1.5 py-0.5 rounded-md ${
                booking.type === 'rental' ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent-foreground'}`
                }>
              {booking.type === 'rental' ? 'Rental' : 'Purchase'}
            </span>
          </div>
        </div>
      </div>

      {/* Booking ID + Amount Row */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-t border-border">
        <div>
          <p className="text-[10px] text-muted-foreground">Booking ID</p>
          <p className="text-xs font-bold text-foreground font-mono">{booking.id}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Amount Paid</p>
          <p className="text-sm font-bold text-foreground">₹{booking.amountPaid.toLocaleString('en-IN')}</p>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">Payment</p>
          <div className="flex items-center gap-1">
            <CreditCard size={11} className="text-muted-foreground" />
            <p className="text-xs font-medium text-foreground">{booking.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Status Timeline */}
      <div className="px-4 pt-3 pb-1">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          Order Status
        </p>
        <StatusTimeline status={booking.status} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 px-4 pb-4 pt-2 flex-wrap">
        {booking.canTrack &&
          <button
            suppressHydrationWarning
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors">
            <MapPin size={12} />
            Track Order
          </button>
          }
        {booking.canReturn &&
          <button
            suppressHydrationWarning
            onClick={() => {setReturnModal(true);setReturnStep('form');setReturnReason('');setOtpValue('');setOtpError(false);}}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-warning text-warning text-xs font-semibold hover:bg-warning/10 transition-colors">
            <RotateCcw size={12} />
            Return Request
          </button>
          }
        {booking.canReview &&
          <button
            suppressHydrationWarning
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-foreground text-xs font-semibold hover:bg-muted transition-colors">
            <Star size={12} />
            Write Review
          </button>
          }
        <button
            suppressHydrationWarning
            onClick={() => setExpanded(!expanded)}
            className="ml-auto flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
          {expanded ? 'Less' : 'Details'}
          {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        </button>
      </div>

      {/* Expanded Details */}
      {expanded &&
        <div className="border-t border-border px-4 py-4 space-y-3 bg-muted/20 fade-in">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Supplier</p>
              <p className="text-xs font-semibold text-foreground">{booking.supplierName}</p>
              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                <Phone size={10} />
                {booking.supplierPhone}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Location</p>
              <p className="text-xs font-semibold text-foreground flex items-center gap-1">
                <MapPin size={11} className="text-primary" />
                {booking.location}
              </p>
            </div>
            {booking.deposit &&
            <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Security Deposit</p>
                <p className="text-xs font-semibold text-foreground">₹{booking.deposit.toLocaleString('en-IN')}</p>
              </div>
            }
            {booking.razorpayPaymentId &&
            <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Payment ID</p>
                <p className="text-xs font-mono text-foreground">{booking.razorpayPaymentId}</p>
              </div>
            }
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button
              suppressHydrationWarning
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
              <MessageSquare size={12} />
              Contact Supplier
            </button>
            <button
              suppressHydrationWarning
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium text-foreground hover:bg-muted transition-colors">
              <AlertCircle size={12} />
              Report Issue
            </button>
          </div>
        </div>
        }
    </div>

    {/* Return Request Modal */}
    {returnModal &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50" onClick={() => setReturnModal(false)} />
        <div className="relative bg-card rounded-2xl shadow-modal w-full max-w-md p-6 fade-in">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-bold text-lg text-foreground">
              {returnStep === 'form' ? 'Return Request' : returnStep === 'otp' ? 'Handover OTP' : 'Return Initiated'}
            </h2>
            <button onClick={() => setReturnModal(false)} className="p-1.5 rounded-lg hover:bg-muted">
              <X size={18} />
            </button>
          </div>

          {returnStep === 'form' &&
          <div className="space-y-4">
              <div className="bg-muted/50 rounded-xl p-4 text-sm">
                <p className="font-semibold text-foreground mb-1">{booking.equipmentName}</p>
                <p className="text-muted-foreground">Booking ID: {booking.id}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Reason for Return *</label>
                <select value={returnReason} onChange={(e) => setReturnReason(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30">
                  <option value="">Select reason</option>
                  <option value="work_completed">Work Completed</option>
                  <option value="equipment_issue">Equipment Issue</option>
                  <option value="no_longer_needed">No Longer Needed</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="bg-warning/10 border border-warning/20 rounded-xl p-3 text-sm text-foreground flex gap-2">
                <AlertCircle size={16} className="text-warning shrink-0 mt-0.5" />
                Security deposit of ₹{booking.deposit?.toLocaleString('en-IN')} will be refunded within 3–5 business days after inspection.
              </div>
              <button onClick={handleReturnSubmit} disabled={!returnReason}
            className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                Proceed to OTP Verification
              </button>
            </div>
          }

          {returnStep === 'otp' &&
          <div className="space-y-4">
              <div className="text-center py-2">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <Shield size={28} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">An OTP has been sent to the supplier's phone. Ask the supplier for the OTP to confirm handover.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5 text-center">Enter Handover OTP</label>
                <input
                type="text"
                maxLength={4}
                value={otpValue}
                onChange={(e) => {setOtpValue(e.target.value.replace(/\D/g, ''));setOtpError(false);}}
                placeholder="_ _ _ _"
                className={`w-full text-center text-2xl font-bold tracking-[0.5em] px-4 py-4 rounded-xl border-2 bg-background text-foreground focus:outline-none transition-colors ${otpError ? 'border-danger' : 'border-border focus:border-primary'}`} />
              
                {otpError && <p className="text-xs text-danger text-center mt-1.5">Incorrect OTP. Please try again. (Hint: 1234)</p>}
              </div>
              <p className="text-xs text-muted-foreground text-center">Didn't receive OTP? <button className="text-primary font-semibold">Resend</button></p>
              <button onClick={handleOtpVerify} disabled={otpValue.length !== 4}
            className="w-full btn-primary py-3 rounded-xl font-bold disabled:opacity-50 disabled:cursor-not-allowed">
                Verify & Confirm Handover
              </button>
            </div>
          }

          {returnStep === 'success' &&
          <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-success" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Return Confirmed!</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Equipment handover verified. Your security deposit of <strong>₹{booking.deposit?.toLocaleString('en-IN')}</strong> will be refunded within 3–5 business days.
              </p>
              <button onClick={() => setReturnModal(false)} className="w-full btn-primary py-3 rounded-xl font-bold">
                Done
              </button>
            </div>
          }
        </div>
      </div>
      }
    </>);

}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MyBookingsPage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = MOCK_BOOKINGS.filter((b) => {
    const matchesSearch =
    !searchQuery ||
    b.equipmentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
    activeFilter === 'all' ||
    activeFilter === 'rental' && b.type === 'rental' ||
    activeFilter === 'purchase' && b.type === 'purchase' ||
    activeFilter === 'active' && ['confirmed', 'preparing', 'received', 'rental_active'].includes(b.status) ||
    activeFilter === 'completed' && b.status === 'returned';

    return matchesSearch && matchesFilter;
  });

  const totalSpent = MOCK_BOOKINGS.reduce((sum, b) => sum + b.amountPaid, 0);
  const activeCount = MOCK_BOOKINGS.filter((b) =>
  ['confirmed', 'preparing', 'received', 'rental_active'].includes(b.status)
  ).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-lg mx-auto px-4 lg:px-8 py-8">
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/"
            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
            
            <ArrowLeft size={18} />
          </Link>
          <div>
            <h1 className="text-xl font-extrabold text-foreground">My Bookings</h1>
            <p className="text-sm text-muted-foreground">Track your rentals and purchases</p>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
            <p className="text-lg font-extrabold text-foreground">{MOCK_BOOKINGS.length}</p>
            <p className="text-xs text-muted-foreground">Total Bookings</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
            <p className="text-lg font-extrabold text-success">{activeCount}</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-3 text-center shadow-card">
            <p className="text-lg font-extrabold text-primary">₹{(totalSpent / 1000).toFixed(1)}K</p>
            <p className="text-xs text-muted-foreground">Total Spent</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            suppressHydrationWarning
            type="text"
            placeholder="Search by equipment name or booking ID…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-5 scrollbar-hide">
          {FILTER_TABS.map((tab) =>
          <button
            suppressHydrationWarning
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
            activeFilter === tab.key ?
            'bg-primary text-white border-primary' : 'bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground'}`
            }>
            
              {tab.label}
            </button>
          )}
          <div className="ml-auto shrink-0">
            <button
              suppressHydrationWarning
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card text-xs font-medium text-muted-foreground hover:text-foreground hover:border-primary/40 transition-all">
              
              <Filter size={12} />
              Sort
            </button>
          </div>
        </div>

        {/* Booking List */}
        {filtered.length > 0 ?
        <div className="space-y-4">
            {filtered.map((booking) =>
          <BookingCard key={booking.id} booking={booking} />
          )}
          </div> :

        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Package size={28} className="text-muted-foreground" />
            </div>
            <h3 className="font-bold text-foreground mb-1">No bookings found</h3>
            <p className="text-sm text-muted-foreground mb-5">
              {searchQuery ? 'Try a different search term' : 'You have no bookings in this category yet'}
            </p>
            <Link
            href="/equipment-listing-page"
            className="px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors">
            
              Browse Equipment
            </Link>
          </div>
        }
      </main>
      <Footer />
    </div>);

}