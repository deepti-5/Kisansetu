'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  CheckCircle, Calendar, MapPin, Phone, User, IndianRupee,
  Download, Share2, Truck, Clock, Copy, ArrowRight,
  Shield, Printer, ChevronRight, Star, Package, Home
} from 'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface ConfirmedOrder {
  bookingRef: string;
  equipmentName: string;
  equipmentCategory: string;
  equipmentImage: string;
  supplierName: string;
  supplierPhone: string;
  supplierLocation: string;
  farmerName: string;
  farmerPhone: string;
  farmerEmail: string;
  startDate: string;
  endDate: string;
  days: number;
  dailyRate: number;
  subtotal: number;
  deposit: number;
  platformFee: number;
  insuranceFee: number;
  discount: number;
  totalAmount: number;
  amountPaid: number;
  paymentMethod: string;
  meetingPoint: string;
  meetingTime: string;
  driverName?: string;
  driverPhone?: string;
  confirmedAt: string;
}

const MOCK_CONFIRMED: Record<string, ConfirmedOrder> = {
  'BKG71209': {
    bookingRef: 'BKG71209',
    equipmentName: 'Rotavator 7-Feet Heavy Duty',
    equipmentCategory: 'Tillage Equipment',
    equipmentImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_1bafb5581-1765266098370.png',
    supplierName: 'Singh Farm Machinery',
    supplierPhone: '+91 97654 32109',
    supplierLocation: 'Nashik, Maharashtra',
    farmerName: 'Suresh Yadav',
    farmerPhone: '+91 98765 11111',
    farmerEmail: 'suresh.yadav@kisansetu.in',
    startDate: '2026-09-28',
    endDate: '2026-09-30',
    days: 2,
    dailyRate: 1200,
    subtotal: 2400,
    deposit: 800,
    platformFee: 120,
    insuranceFee: 80,
    discount: 0,
    totalAmount: 3400,
    amountPaid: 3400,
    paymentMethod: 'Stripe',
    meetingPoint: 'Near Nashik Highway Toll, Gate 2',
    meetingTime: '7:30 AM on 28 Sep 2026',
    confirmedAt: new Date().toISOString(),
  },
  'BKG65890': {
    bookingRef: 'BKG65890',
    equipmentName: 'Paddy Transplanter 8-Row',
    equipmentCategory: 'Planting Equipment',
    equipmentImage: 'https://img.rocket.new/generatedImages/rocket_gen_img_12deca88b-1785221208089.png',
    supplierName: 'Green Fields Equipment',
    supplierPhone: '+91 96543 21098',
    supplierLocation: 'Kolhapur, Maharashtra',
    farmerName: 'Mohan Kulkarni',
    farmerPhone: '+91 76543 33333',
    farmerEmail: 'mohan.kulkarni@kisansetu.in',
    startDate: '2026-10-05',
    endDate: '2026-10-07',
    days: 2,
    dailyRate: 3500,
    subtotal: 7000,
    deposit: 1500,
    platformFee: 350,
    insuranceFee: 150,
    discount: 200,
    totalAmount: 8800,
    amountPaid: 8800,
    paymentMethod: 'Stripe',
    meetingPoint: 'Kolhapur Bus Stand, Gate No. 3',
    meetingTime: '8:00 AM on 5 Oct 2026',
    driverName: 'Ganesh Shinde',
    driverPhone: '+91 87654 32109',
    confirmedAt: new Date().toISOString(),
  },
};

const DEFAULT_ORDER = MOCK_CONFIRMED['BKG71209'];

function formatDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

function formatDateTime(isoStr: string) {
  try {
    return new Date(isoStr).toLocaleString('en-IN', {
      day: 'numeric', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch {
    return isoStr;
  }
}

function OrderConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingRef = searchParams.get('id') || 'BKG71209';
  const [order, setOrder] = useState<ConfirmedOrder>(MOCK_CONFIRMED[bookingRef] || DEFAULT_ORDER);
  const [copied, setCopied] = useState(false);
  const supabase = createClient();

  const loadFromDB = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_ref', bookingRef)
        .single();

      if (error || !data) return;

      setOrder({
        bookingRef: data.booking_ref,
        equipmentName: data.equipment_name,
        equipmentCategory: data.equipment_category || '',
        equipmentImage: data.equipment_image || '',
        supplierName: data.supplier_name,
        supplierPhone: data.supplier_phone,
        supplierLocation: data.supplier_location || '',
        farmerName: data.buyer_name,
        farmerPhone: data.buyer_phone,
        farmerEmail: data.buyer_email || '',
        startDate: data.start_date,
        endDate: data.end_date,
        days: data.days,
        dailyRate: data.daily_rate,
        subtotal: data.subtotal,
        deposit: data.deposit,
        platformFee: data.platform_fee,
        insuranceFee: data.insurance_fee || 0,
        discount: data.discount || 0,
        totalAmount: data.total_amount,
        amountPaid: data.amount_paid || data.total_amount,
        paymentMethod: data.payment_method || 'Stripe',
        meetingPoint: data.meeting_point || '',
        meetingTime: data.meeting_time || '',
        driverName: data.driver_name,
        driverPhone: data.driver_phone,
        confirmedAt: data.updated_at || data.created_at || new Date().toISOString(),
      });
    } catch (err) {
      console.error('Error loading order:', err);
    }
  }, [bookingRef, supabase]);

  useEffect(() => {
    loadFromDB();
  }, [loadFromDB]);

  function copyBookingId() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(order.bookingRef).then(() => {
        setCopied(true);
        toast.success('Booking ID copied!');
        setTimeout(() => setCopied(false), 2000);
      });
    }
  }

  const receiptLines = [
    { label: `Rental (${order.days}d × ₹${order.dailyRate.toLocaleString('en-IN')})`, value: order.subtotal, color: 'text-foreground' },
    { label: 'Refundable Security Deposit', value: order.deposit, color: 'text-warning' },
    { label: 'Platform Service Fee (5%)', value: order.platformFee, color: 'text-foreground' },
    ...(order.insuranceFee > 0 ? [{ label: 'Equipment Insurance', value: order.insuranceFee, color: 'text-foreground' }] : []),
    ...(order.discount > 0 ? [{ label: 'Discount Applied', value: -order.discount, color: 'text-success' }] : []),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-lg mx-auto px-4 lg:px-8 py-6">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/farmer/rentals" className="hover:text-primary transition-colors">My Rentals</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Order Confirmation</span>
        </div>

        {/* ── Hero Confirmation Banner ── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary via-primary/90 to-accent p-6 mb-8 text-white">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />

          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Check icon */}
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0 border border-white/30">
              <CheckCircle size={32} className="text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-white/70">Payment Successful</span>
              </div>
              <h1 className="text-2xl font-extrabold leading-tight">Rental Confirmed! 🎉</h1>
              <p className="text-sm text-white/80 mt-1">
                Your equipment is locked in. A receipt has been sent to <span className="font-semibold text-white">{order.farmerEmail}</span>
              </p>
            </div>

            {/* Booking ID chip */}
            <div className="sm:text-right shrink-0">
              <p className="text-xs text-white/60 mb-1">Booking ID</p>
              <div className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-xl px-3 py-2">
                <span className="font-extrabold text-lg tracking-wider font-tabular">{order.bookingRef}</span>
                <button
                  onClick={copyBookingId}
                  className="p-1 rounded-lg hover:bg-white/20 transition-colors"
                  title="Copy booking ID"
                >
                  {copied
                    ? <CheckCircle size={14} className="text-white" />
                    : <Copy size={14} className="text-white/70" />
                  }
                </button>
              </div>
              <p className="text-xs text-white/50 mt-1.5">Confirmed {formatDateTime(order.confirmedAt)}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Details ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Equipment Details */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <Package size={16} className="text-primary" /> Equipment Details
              </h2>
              <div className="flex items-start gap-4">
                {order.equipmentImage && (
                  <img
                    src={order.equipmentImage}
                    alt={order.equipmentName}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-border"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base leading-tight">{order.equipmentName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{order.equipmentCategory}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-muted-foreground" />
                      <span className="text-xs font-semibold text-foreground">{order.supplierName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-muted-foreground" />
                      <a href={`tel:${order.supplierPhone}`} className="text-xs text-primary hover:underline">{order.supplierPhone}</a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{order.supplierLocation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Pickup Schedule */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Pickup Schedule
              </h2>

              {/* Date strip */}
              <div className="grid grid-cols-3 gap-3 mb-4">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Pickup Date</p>
                  <p className="font-bold text-foreground text-sm">{formatDate(order.startDate)}</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-bold text-primary text-sm">{order.days} {order.days === 1 ? 'Day' : 'Days'}</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Return Date</p>
                  <p className="font-bold text-foreground text-sm">{formatDate(order.endDate)}</p>
                </div>
              </div>

              {/* Meeting point */}
              {order.meetingPoint && (
                <div className="flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/15">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <MapPin size={16} className="text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-0.5">Pickup Location</p>
                    <p className="text-sm text-foreground font-medium">{order.meetingPoint}</p>
                    {order.meetingTime && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <Clock size={12} className="text-primary" />
                        <p className="text-xs font-bold text-primary">{order.meetingTime}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Driver info */}
              {order.driverName && (
                <div className="flex items-start gap-3 p-4 bg-success/5 rounded-xl border border-success/15 mt-3">
                  <div className="w-9 h-9 rounded-xl bg-success/10 flex items-center justify-center shrink-0">
                    <Truck size={16} className="text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground uppercase tracking-wide mb-0.5">Driver Assigned</p>
                    <p className="text-sm font-semibold text-foreground">{order.driverName}</p>
                    {order.driverPhone && (
                      <a href={`tel:${order.driverPhone}`} className="text-xs text-primary hover:underline mt-0.5 block">{order.driverPhone}</a>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Payment Receipt */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-bold text-base text-foreground flex items-center gap-2">
                  <IndianRupee size={16} className="text-primary" /> Payment Receipt
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 text-success text-xs font-bold border border-success/20">
                  <CheckCircle size={11} /> Paid
                </span>
              </div>

              {/* Receipt lines */}
              <div className="space-y-0">
                {receiptLines.map((line, i) => (
                  <div key={i} className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
                    <span className="text-sm text-muted-foreground">{line.label}</span>
                    <span className={`text-sm font-semibold ${line.color}`}>
                      {line.value < 0 ? '−' : ''}₹{Math.abs(line.value).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>

              {/* Total paid */}
              <div className="mt-4 flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/15">
                <div>
                  <p className="font-bold text-foreground">Amount Paid</p>
                  <p className="text-xs text-muted-foreground mt-0.5">via {order.paymentMethod}</p>
                </div>
                <p className="font-extrabold text-2xl text-primary">₹{order.amountPaid.toLocaleString('en-IN')}</p>
              </div>

              {/* Deposit note */}
              {order.deposit > 0 && (
                <div className="mt-3 flex items-start gap-2 p-3 bg-warning/5 rounded-xl border border-warning/15">
                  <Shield size={14} className="text-warning mt-0.5 shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Security deposit of <span className="font-bold text-warning">₹{order.deposit.toLocaleString('en-IN')}</span> is refundable after equipment is returned in good condition.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* ── Right: Summary & Actions ── */}
          <div className="space-y-5">

            {/* What's Next */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <ArrowRight size={16} className="text-primary" /> What's Next
              </h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 text-white text-xs font-bold">1</div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Check your email</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Receipt sent to {order.farmerEmail}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-accent flex items-center justify-center shrink-0 text-white text-xs font-bold">2</div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Reach pickup point</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.meetingTime || `By ${formatDate(order.startDate)}`}</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-success flex items-center justify-center shrink-0 text-white text-xs font-bold">3</div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Return by {formatDate(order.endDate)}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Deposit refunded on safe return</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Summary Card */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-sm text-foreground mb-3">Booking Summary</h2>
              <div className="space-y-2.5">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Booking ID</span>
                  <span className="font-bold text-foreground font-tabular">{order.bookingRef}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Equipment</span>
                  <span className="font-medium text-foreground text-right max-w-[140px] leading-tight">{order.equipmentName}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pickup</span>
                  <span className="font-medium text-foreground">{formatDate(order.startDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Return</span>
                  <span className="font-medium text-foreground">{formatDate(order.endDate)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium text-foreground">{order.days} {order.days === 1 ? 'day' : 'days'}</span>
                </div>
                <div className="pt-2 border-t border-border flex justify-between">
                  <span className="font-bold text-foreground">Total Paid</span>
                  <span className="font-extrabold text-primary">₹{order.amountPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-sm text-foreground mb-3">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={() => toast.success('Receipt downloaded!')}
                  className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  <Download size={14} className="text-primary" /> Download Receipt
                </button>
                <button
                  onClick={() => {
                    if (typeof navigator !== 'undefined') {
                      navigator.clipboard.writeText(`KisanSetu Booking ${order.bookingRef} confirmed! Equipment: ${order.equipmentName}. Pickup: ${order.meetingTime || formatDate(order.startDate)}`);
                      toast.success('Booking details copied to share!');
                    }
                  }}
                  className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  <Share2 size={14} className="text-accent" /> Share Booking
                </button>
                <button
                  onClick={() => typeof window !== 'undefined' && window.print()}
                  className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors"
                >
                  <Printer size={14} className="text-muted-foreground" /> Print Receipt
                </button>
              </div>
            </div>

            {/* Rating prompt */}
            <div className="bg-warning/5 rounded-2xl border border-warning/20 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Star size={15} className="text-warning" />
                <p className="font-bold text-sm text-foreground">Enjoyed the service?</p>
              </div>
              <p className="text-xs text-muted-foreground mb-3">Rate your experience after the rental to help other farmers.</p>
              <Link
                href="/farmer/rentals"
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-warning/10 border border-warning/20 text-warning text-xs font-bold hover:bg-warning/20 transition-colors"
              >
                <Star size={12} /> Leave a Review Later
              </Link>
            </div>

            {/* Navigation links */}
            <div className="space-y-2">
              <Link
                href="/farmer/rentals"
                className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
              >
                <Truck size={14} /> View My Rentals
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home size={14} /> Back to Home
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">Loading your confirmation...</p>
          </div>
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  );
}
