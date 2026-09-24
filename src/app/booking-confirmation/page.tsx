'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  CheckCircle, Calendar, MapPin, Phone, User, IndianRupee,
  Download, Share2, MessageCircle, Truck, Clock, AlertCircle,
  ChevronRight, Copy, Star, ArrowLeft, Shield, Loader2, Wifi } from
'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import StripePaymentModal from '@/components/StripePaymentModal';

interface BookingData {
  id: string; equipment: string; category: string; image: string;
  supplier: string; supplierPhone: string; supplierLocation: string;
  farmer: string; farmerPhone: string;
  startDate: string; endDate: string; days: number;
  dailyRate: number; subtotal: number; deposit: number;
  platformFee: number; totalAmount: number; amountPaid: number;
  paymentStatus: 'paid' | 'partial' | 'pending'; paymentMethod: string;
  status: 'confirmed' | 'rental_active' | 'returned';
  meetingPoint: string; meetingTime: string; driverName?: string; driverPhone?: string;
  nextPaymentDue?: string; nextPaymentAmount?: number;
  dbId?: string;
  buyerEmail?: string;
}

const BOOKING_DATA: Record<string, BookingData> = {
  'BKG82341': {
    id: 'BKG82341', equipment: 'Mahindra 575 DI Tractor', category: 'Tractor',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_14c680856-1774101700626.png",
    supplier: 'Ramesh Agro Services', supplierPhone: '+91 94567 89012',
    supplierLocation: 'Hadapsar, Pune, Maharashtra',
    farmer: 'Suresh Yadav', farmerPhone: '+91 98765 11111',
    startDate: '2026-09-20', endDate: '2026-09-24', days: 4,
    dailyRate: 2500, subtotal: 10000, deposit: 2000,
    platformFee: 500, totalAmount: 12500, amountPaid: 12500,
    paymentStatus: 'paid', paymentMethod: 'UPI (PhonePe)',
    status: 'rental_active',
    meetingPoint: 'Hadapsar Chowk, Near SBI Bank, Pune',
    meetingTime: '7:00 AM on 20 Sep 2026',
    driverName: 'Ganesh Shinde', driverPhone: '+91 87654 32109',
  },
  'BKG65890': {
    id: 'BKG65890', equipment: 'Paddy Transplanter 8-Row', category: 'Planting Equipment',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_40eb97d3c-1790277703201.png",
    supplier: 'Green Fields Equipment', supplierPhone: '+91 93456 78901',
    supplierLocation: 'Kolhapur, Maharashtra',
    farmer: 'Suresh Yadav', farmerPhone: '+91 98765 11111',
    startDate: '2026-09-25', endDate: '2026-09-27', days: 2,
    dailyRate: 3500, subtotal: 7000, deposit: 1500,
    platformFee: 350, totalAmount: 8850, amountPaid: 4500,
    paymentStatus: 'partial', paymentMethod: 'Credit Card',
    status: 'confirmed',
    meetingPoint: 'Kolhapur Bus Stand, Gate No. 3',
    meetingTime: '8:00 AM on 25 Sep 2026',
    nextPaymentDue: '2026-09-25', nextPaymentAmount: 4350
  },
  'BKG12340': {
    id: 'BKG12340', equipment: 'Mahindra Yuvo 575 DI Tractor', category: 'Tractor',
    image: "https://img.rocket.new/generatedImages/rocket_gen_img_14c680856-1774101700626.png",
    supplier: 'Patil Agro Services', supplierPhone: '+91 98765 43210',
    supplierLocation: 'Hadapsar, Pune, Maharashtra',
    farmer: 'Mohan Kulkarni', farmerPhone: '+91 76543 33333',
    startDate: '2026-09-10', endDate: '2026-09-12', days: 3,
    dailyRate: 2500, subtotal: 7500, deposit: 1500,
    platformFee: 375, totalAmount: 9375, amountPaid: 9375,
    paymentStatus: 'paid', paymentMethod: 'Net Banking',
    status: 'confirmed',
    meetingPoint: 'Hadapsar Chowk, Near SBI Bank, Pune',
    meetingTime: '7:30 AM on 10 Sep 2026',
    driverName: 'Rajesh Patil', driverPhone: '+91 98765 43210'
  }
};

const DEFAULT_BOOKING = BOOKING_DATA['BKG82341'];

function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get('id') || 'BKG82341';
  const [booking, setBooking] = useState<BookingData>(BOOKING_DATA[bookingId] || DEFAULT_BOOKING);
  const [liveStatus, setLiveStatus] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const supabase = createClient();

  // Load booking from Supabase if available
  const loadBookingFromDB = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('booking_ref', bookingId)
        .single();

      if (error || !data) return;

      setBooking({
        id: data.booking_ref,
        equipment: data.equipment_name,
        category: data.equipment_category,
        image: data.equipment_image || '',
        supplier: data.supplier_name,
        supplierPhone: data.supplier_phone,
        supplierLocation: data.supplier_location,
        farmer: data.buyer_name,
        farmerPhone: data.buyer_phone,
        startDate: data.start_date,
        endDate: data.end_date,
        days: data.days,
        dailyRate: data.daily_rate,
        subtotal: data.subtotal,
        deposit: data.deposit,
        platformFee: data.platform_fee,
        totalAmount: data.total_amount,
        amountPaid: data.amount_paid,
        paymentStatus: data.payment_status as 'paid' | 'partial' | 'pending',
        paymentMethod: data.payment_method || '',
        status: data.booking_status === 'active' ? 'rental_active' : data.booking_status === 'completed' ? 'returned' : 'confirmed',
        meetingPoint: data.meeting_point || '',
        meetingTime: data.meeting_time || '',
        driverName: data.driver_name,
        driverPhone: data.driver_phone,
        dbId: data.id,
        buyerEmail: undefined,
      });
    } catch (err) {
      console.error('Error loading booking:', err);
    }
  }, [bookingId, supabase]);

  // Real-time listener for booking status changes
  useEffect(() => {
    loadBookingFromDB();

    const channel = supabase
      .channel(`booking-${bookingId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'bookings',
          filter: `booking_ref=eq.${bookingId}`,
        },
        (payload) => {
          const updated = payload.new as Record<string, unknown>;
          const newStatus = updated.booking_status as string;
          const newPaymentStatus = updated.payment_status as string;

          // Show live notification
          if (newStatus === 'accepted') {
            setLiveStatus('accepted');
            toast.success('🎉 Your booking has been accepted by the supplier!');
          } else if (newStatus === 'declined') {
            setLiveStatus('declined');
            toast.error('Your booking was declined. Please try another equipment.');
          } else if (newPaymentStatus === 'paid') {
            toast.success('✅ Payment confirmed!');
          }

          // Update booking state
          setBooking((prev) => ({
            ...prev,
            paymentStatus: newPaymentStatus as 'paid' | 'partial' | 'pending',
            amountPaid: (updated.amount_paid as number) || prev.amountPaid,
            status: newStatus === 'active' ? 'rental_active' : newStatus === 'completed' ? 'returned' : 'confirmed',
          }));
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, loadBookingFromDB, supabase]);

  async function initiatePayment(amount: number) {
    setIsInitiatingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          paymentData: {
            amount,
            description: `KisanSetu Rental - ${booking.equipment} (${booking.id})`,
            equipmentName: booking.equipment,
          },
          customerInfo: {
            userId: null,
            firstName: booking.farmer.split(' ')[0] || 'Farmer',
            lastName: booking.farmer.split(' ').slice(1).join(' ') || '',
            email: booking.buyerEmail || 'farmer@kisansetu.in',
            phone: booking.farmerPhone,
            stripeCustomerId: null,
            billing: {
              address_line_1: booking.supplierLocation || 'India',
              city: 'Pune',
              state: 'Maharashtra',
              postal_code: '411001',
              country: 'IN',
            },
          },
          bookingId: booking.dbId || null,
        },
      });

      if (error) {
        const errMsg = (data as { error?: string })?.error ?? error.message ?? 'Payment setup failed';
        toast.error(errMsg);
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentAmount(amount);
      setPaymentModalOpen(true);
    } catch (err) {
      console.error('Payment initiation error:', err);
      toast.error('Could not initiate payment. Please try again.');
    } finally {
      setIsInitiatingPayment(false);
    }
  }

  async function handlePaymentSuccess() {
    setPaymentModalOpen(false);
    setClientSecret('');

    // Send payment receipt email
    try {
      await supabase.functions.invoke('send-booking-email', {
        body: {
          type: 'payment_receipt',
          buyerEmail: booking.buyerEmail || 'farmer@kisansetu.in',
          bookingRef: booking.id,
          equipmentName: booking.equipment,
          supplierName: booking.supplier,
          supplierPhone: booking.supplierPhone,
          buyerName: booking.farmer,
          startDate: booking.startDate,
          endDate: booking.endDate,
          days: booking.days,
          dailyRate: booking.dailyRate,
          subtotal: booking.subtotal,
          deposit: booking.deposit,
          platformFee: booking.platformFee,
          totalAmount: booking.totalAmount,
          amountPaid: paymentAmount,
          paymentMethod: 'Stripe',
        },
      });
    } catch (err) {
      console.error('Email send error:', err);
    }

    // Reload booking data
    await loadBookingFromDB();
    toast.success('Payment confirmed! Receipt sent to your email.');
  }

  function copyBookingId() {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(booking.id).then(() => toast.success('Booking ID copied!'));
    }
  }

  const statusConfig = {
    confirmed: { color: 'text-info', bg: 'bg-info/10 border-info/20', label: 'Booking Confirmed', icon: CheckCircle },
    rental_active: { color: 'text-success', bg: 'bg-success/10 border-success/20', label: 'Rental Active', icon: Truck },
    returned: { color: 'text-muted-foreground', bg: 'bg-muted border-border', label: 'Returned', icon: CheckCircle }
  };

  const sc = statusConfig[booking.status];
  const remainingAmount = booking.totalAmount - booking.amountPaid;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-lg mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/buyer/workspace" className="hover:text-primary transition-colors">My Workspace</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Booking Confirmation</span>
        </div>

        {/* Live Status Banner */}
        {liveStatus && (
          <div className={`rounded-xl border p-3 mb-4 flex items-center gap-3 ${liveStatus === 'accepted' ? 'bg-success/10 border-success/20' : 'bg-danger/10 border-danger/20'}`}>
            <Wifi size={16} className={liveStatus === 'accepted' ? 'text-success' : 'text-danger'} />
            <p className="text-sm font-semibold">
              {liveStatus === 'accepted' ? '🎉 Supplier accepted your booking!' : '❌ Supplier declined your booking.'}
            </p>
          </div>
        )}

        {/* Success Banner */}
        <div className={`rounded-2xl border p-5 mb-6 ${sc.bg}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${booking.status === 'rental_active' ? 'bg-success' : 'bg-info'}`}>
              <sc.icon size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-foreground">{sc.label}!</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-sm text-muted-foreground">Your booking has been successfully processed</p>
                {isConnected && (
                  <span className="flex items-center gap-1 text-xs text-success font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                    Live
                  </span>
                )}
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-xs text-muted-foreground">Booking ID</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="font-bold text-foreground font-tabular">{booking.id}</p>
                <button onClick={copyBookingId} className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"><Copy size={13} className="text-muted-foreground" /></button>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3 sm:hidden">
            <p className="text-xs text-muted-foreground">Booking ID:</p>
            <p className="font-bold text-foreground font-tabular text-sm">{booking.id}</p>
            <button onClick={copyBookingId} className="p-1 rounded hover:bg-white/50 transition-colors"><Copy size={12} className="text-muted-foreground" /></button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Equipment Details */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4">Equipment Details</h2>
              <div className="flex items-start gap-4">
                {booking.image && (
                  <img src={booking.image} alt={booking.equipment} className="w-24 h-24 rounded-xl object-cover shrink-0" />
                )}
                <div className="flex-1">
                  <p className="font-bold text-foreground">{booking.equipment}</p>
                  <p className="text-sm text-muted-foreground">{booking.category}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <User size={13} className="text-muted-foreground" />
                    <span className="text-sm text-foreground font-medium">{booking.supplier}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Phone size={13} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{booking.supplierPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin size={13} className="text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{booking.supplierLocation}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Dates */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><Calendar size={16} className="text-primary" /> Rental Period</h2>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                  <p className="font-bold text-foreground">{booking.startDate}</p>
                </div>
                <div className="bg-primary/5 rounded-xl p-3 text-center border border-primary/20">
                  <p className="text-xs text-muted-foreground mb-1">Duration</p>
                  <p className="font-bold text-primary">{booking.days} Days</p>
                </div>
                <div className="bg-muted/40 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground mb-1">End Date</p>
                  <p className="font-bold text-foreground">{booking.endDate}</p>
                </div>
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><IndianRupee size={16} className="text-primary" /> Price Breakdown</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Daily Rate</span>
                  <span className="text-sm font-semibold text-foreground">₹{booking.dailyRate.toLocaleString('en-IN')}/day</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Rental ({booking.days} days × ₹{booking.dailyRate.toLocaleString('en-IN')})</span>
                  <span className="text-sm font-semibold text-foreground">₹{booking.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Refundable Deposit</span>
                  <span className="text-sm font-semibold text-warning">₹{booking.deposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Platform Fee (5%)</span>
                  <span className="text-sm font-semibold text-foreground">₹{booking.platformFee.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between py-3 bg-muted/40 rounded-xl px-3">
                  <span className="font-bold text-foreground">Total Amount</span>
                  <span className="font-extrabold text-lg text-primary">₹{booking.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Status */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><Shield size={16} className="text-primary" /> Payment Status</h2>
              <div className={`flex items-center gap-3 p-3 rounded-xl border mb-4 ${booking.paymentStatus === 'paid' ? 'bg-success/10 border-success/20' : booking.paymentStatus === 'partial' ? 'bg-warning/10 border-warning/20' : 'bg-danger/10 border-danger/20'}`}>
                {booking.paymentStatus === 'paid' ? <CheckCircle size={18} className="text-success" /> : <AlertCircle size={18} className="text-warning" />}
                <div>
                  <p className={`font-bold text-sm ${booking.paymentStatus === 'paid' ? 'text-success' : 'text-warning'}`}>
                    {booking.paymentStatus === 'paid' ? 'Fully Paid' : booking.paymentStatus === 'partial' ? 'Partially Paid' : 'Payment Pending'}
                  </p>
                  {booking.paymentMethod && <p className="text-xs text-muted-foreground">via {booking.paymentMethod}</p>}
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-foreground">₹{booking.amountPaid.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground">Amount paid</p>
                </div>
              </div>

              {/* Pay Now for pending/partial */}
              {booking.paymentStatus !== 'paid' && remainingAmount > 0 && (
                <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-warning" />
                    <p className="font-bold text-sm text-foreground">
                      {booking.paymentStatus === 'pending' ? 'Payment Required' : 'Remaining Payment Due'}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {booking.paymentStatus === 'pending'
                      ? `Pay the full amount of `
                      : `Remaining amount of `}
                    <span className="font-bold text-warning">₹{remainingAmount.toLocaleString('en-IN')}</span>
                    {booking.nextPaymentDue ? ` is due on ${booking.nextPaymentDue}` : ' to confirm your booking'}
                  </p>
                  <button
                    onClick={() => initiatePayment(remainingAmount)}
                    disabled={isInitiatingPayment}
                    className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isInitiatingPayment ? (
                      <><Loader2 size={14} className="animate-spin" /> Setting up payment...</>
                    ) : (
                      <>Pay Now ₹{remainingAmount.toLocaleString('en-IN')}</>
                    )}
                  </button>
                </div>
              )}

              {/* Pay deposit for new bookings */}
              {booking.paymentStatus === 'pending' && booking.deposit > 0 && (
                <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    Or pay just the <span className="font-bold text-primary">deposit of ₹{booking.deposit.toLocaleString('en-IN')}</span> to secure your booking
                  </p>
                  <button
                    onClick={() => initiatePayment(booking.deposit)}
                    disabled={isInitiatingPayment}
                    className="w-full py-2.5 rounded-xl border border-primary text-primary text-sm font-semibold hover:bg-primary/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isInitiatingPayment ? (
                      <><Loader2 size={14} className="animate-spin" /> Setting up...</>
                    ) : (
                      <>Pay Deposit ₹{booking.deposit.toLocaleString('en-IN')}</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Next Steps */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><Truck size={16} className="text-primary" /> Next Steps</h2>
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 text-white text-xs font-bold">1</div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Meeting Point</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{booking.meetingPoint}</p>
                    <p className="text-xs font-semibold text-primary mt-1">{booking.meetingTime}</p>
                  </div>
                </div>

                {booking.driverName && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-white text-xs font-bold">2</div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Driver Details</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{booking.driverName}</p>
                      <p className="text-xs font-semibold text-primary mt-1">{booking.driverPhone}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-white text-xs font-bold ${booking.driverName ? 'bg-success' : 'bg-accent'}`}>{booking.driverName ? '3' : '2'}</div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">Return Equipment</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Return by {booking.endDate} at the same location</p>
                    {booking.deposit > 0 && <p className="text-xs text-success mt-1">Deposit ₹{booking.deposit.toLocaleString('en-IN')} refunded on return</p>}
                  </div>
                </div>
              </div>
            </div>

            {/* Supplier Contact */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4">Contact Supplier</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-xl">
                  <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center shrink-0"><User size={18} className="text-white" /></div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{booking.supplier}</p>
                    <p className="text-xs text-muted-foreground">{booking.supplierPhone}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`tel:${booking.supplierPhone}`} className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                    <Phone size={14} /> Call
                  </a>
                  <button className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-success text-white text-sm font-semibold hover:bg-success/90 transition-colors">
                    <MessageCircle size={14} /> WhatsApp
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4">Actions</h2>
              <div className="space-y-2">
                <button onClick={() => toast.success('Receipt downloaded!')} className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                  <Download size={15} className="text-primary" /> Download Receipt
                </button>
                <button onClick={() => toast.success('Booking details shared!')} className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                  <Share2 size={15} className="text-accent" /> Share Booking
                </button>
                {booking.status === 'returned' && (
                  <button className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                    <Star size={15} className="text-warning" /> Write Review
                  </button>
                )}
              </div>
            </div>

            {/* Back Link */}
            <Link href="/buyer/workspace" className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
              <ArrowLeft size={14} /> Back to My Workspace
            </Link>
          </div>
        </div>
      </main>
      <Footer />

      {/* Stripe Payment Modal */}
      <StripePaymentModal
        isOpen={paymentModalOpen}
        clientSecret={clientSecret}
        amount={paymentAmount}
        bookingRef={booking.id}
        onSuccess={handlePaymentSuccess}
        onClose={() => {
          setPaymentModalOpen(false);
          setClientSecret('');
        }}
      />
    </div>
  );
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center"><div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" /><p className="text-sm text-muted-foreground">Loading booking details...</p></div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>
  );
}