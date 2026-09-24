'use client';

import React, { Suspense, useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  ChevronRight, Shield, Lock, Truck, Calendar, MapPin, Phone,
  User, IndianRupee, CheckCircle, AlertCircle, Loader2, ArrowLeft,
  Tag, Info, Clock, Star, CreditCard } from
'lucide-react';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';
import StripePaymentModal from '@/components/StripePaymentModal';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RentalOrder {
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
  meetingPoint: string;
  meetingTime: string;
  driverIncluded: boolean;
  paymentStatus: 'pending' | 'partial' | 'paid';
  amountPaid: number;
  dbId?: string;
}

// ─── Mock Orders ──────────────────────────────────────────────────────────────

const MOCK_ORDERS: Record<string, RentalOrder> = {
  'BKG71209': {
    bookingRef: 'BKG71209',
    equipmentName: 'Rotavator 7-Feet Heavy Duty',
    equipmentCategory: 'Tillage Equipment',
    equipmentImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1bafb5581-1765266098370.png",
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
    meetingPoint: 'Near Nashik Highway Toll, Gate 2',
    meetingTime: '7:30 AM on 28 Sep 2026',
    driverIncluded: false,
    paymentStatus: 'pending',
    amountPaid: 0
  },
  'BKG65890': {
    bookingRef: 'BKG65890',
    equipmentName: 'Paddy Transplanter 8-Row',
    equipmentCategory: 'Planting Equipment',
    equipmentImage: "https://img.rocket.new/generatedImages/rocket_gen_img_12deca88b-1785221208089.png",
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
    meetingPoint: 'Kolhapur Bus Stand, Gate No. 3',
    meetingTime: '8:00 AM on 5 Oct 2026',
    driverIncluded: true,
    paymentStatus: 'pending',
    amountPaid: 0
  }
};

const DEFAULT_ORDER = MOCK_ORDERS['BKG71209'];

// ─── Payment Option ───────────────────────────────────────────────────────────

type PaymentOption = 'full' | 'deposit';

// ─── Main Content ─────────────────────────────────────────────────────────────

function RentalPaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const bookingRef = searchParams.get('id') || 'BKG71209';

  const [order, setOrder] = useState<RentalOrder>(MOCK_ORDERS[bookingRef] || DEFAULT_ORDER);
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('full');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [isInitiatingPayment, setIsInitiatingPayment] = useState(false);
  const supabase = createClient();

  const remainingAmount = order.totalAmount - order.amountPaid;
  const payNowAmount = paymentOption === 'deposit' ? order.deposit : remainingAmount;

  // Load from Supabase if available
  const loadOrderFromDB = useCallback(async () => {
    try {
      const { data, error } = await supabase.
      from('bookings').
      select('*').
      eq('booking_ref', bookingRef).
      single();

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
        farmerEmail: data.buyer_email || 'farmer@kisansetu.in',
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
        meetingPoint: data.meeting_point || '',
        meetingTime: data.meeting_time || '',
        driverIncluded: !!data.driver_name,
        paymentStatus: data.payment_status as 'pending' | 'partial' | 'paid',
        amountPaid: data.amount_paid || 0,
        dbId: data.id
      });
    } catch (err) {
      console.error('Error loading order:', err);
    }
  }, [bookingRef, supabase]);

  useEffect(() => {
    loadOrderFromDB();
  }, [loadOrderFromDB]);

  async function handleProceedToPayment() {
    if (!agreedToTerms) {
      toast.error('Please agree to the rental terms before proceeding.');
      return;
    }

    setIsInitiatingPayment(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: {
          paymentData: {
            amount: payNowAmount,
            description: `KisanSetu Rental - ${order.equipmentName} (${order.bookingRef})`,
            equipmentName: order.equipmentName
          },
          customerInfo: {
            userId: null,
            firstName: order.farmerName.split(' ')[0] || 'Farmer',
            lastName: order.farmerName.split(' ').slice(1).join(' ') || '',
            email: order.farmerEmail || 'farmer@kisansetu.in',
            phone: order.farmerPhone,
            stripeCustomerId: null,
            billing: {
              address_line_1: order.supplierLocation || 'India',
              city: 'Pune',
              state: 'Maharashtra',
              postal_code: '411001',
              country: 'IN'
            }
          },
          bookingId: order.dbId || null
        }
      });

      if (error) {
        const errMsg = (data as {error?: string;})?.error ?? error.message ?? 'Payment setup failed';
        toast.error(errMsg);
        return;
      }

      setClientSecret(data.clientSecret);
      setPaymentAmount(payNowAmount);
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

    try {
      await supabase.functions.invoke('send-booking-email', {
        body: {
          type: 'payment_receipt',
          buyerEmail: order.farmerEmail,
          bookingRef: order.bookingRef,
          equipmentName: order.equipmentName,
          supplierName: order.supplierName,
          supplierPhone: order.supplierPhone,
          buyerName: order.farmerName,
          startDate: order.startDate,
          endDate: order.endDate,
          days: order.days,
          dailyRate: order.dailyRate,
          subtotal: order.subtotal,
          deposit: order.deposit,
          platformFee: order.platformFee,
          totalAmount: order.totalAmount,
          amountPaid: payNowAmount,
          paymentMethod: 'Stripe'
        }
      });
    } catch (err) {
      console.error('Email send error:', err);
    }

    toast.success('Payment successful! Redirecting to booking confirmation...');
    setTimeout(() => {
      router.push(`/booking-confirmation?id=${order.bookingRef}`);
    }, 1500);
  }

  // Format date for display
  function formatDate(dateStr: string) {
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  }

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
          <span className="text-foreground font-medium">Complete Payment</span>
        </div>

        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <CreditCard size={20} className="text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-foreground">Complete Rental Payment</h1>
              <p className="text-sm text-muted-foreground">Review your order and pay to confirm equipment pickup</p>
            </div>
          </div>
        </div>

        {/* Already Paid Banner */}
        {order.paymentStatus === 'paid' &&
        <div className="bg-success/10 border border-success/20 rounded-2xl p-4 mb-6 flex items-center gap-3">
            <CheckCircle size={20} className="text-success shrink-0" />
            <div>
              <p className="font-bold text-success text-sm">Payment Already Completed</p>
              <p className="text-xs text-muted-foreground">This booking has been fully paid. View your booking confirmation.</p>
            </div>
            <Link href={`/booking-confirmation?id=${order.bookingRef}`} className="ml-auto btn-primary px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap">
              View Booking
            </Link>
          </div>
        }

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ── Left: Order Summary + Payment Options ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Equipment Card */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <Truck size={16} className="text-primary" /> Equipment Details
              </h2>
              <div className="flex items-start gap-4">
                {order.equipmentImage &&
                <img
                  src={order.equipmentImage}
                  alt={order.equipmentName}
                  className="w-24 h-24 rounded-xl object-cover shrink-0 border border-border" />

                }
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-foreground text-base leading-tight">{order.equipmentName}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">{order.equipmentCategory}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                    <div className="flex items-center gap-1.5">
                      <User size={12} className="text-muted-foreground" />
                      <span className="text-xs text-foreground font-medium">{order.supplierName}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{order.supplierPhone}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{order.supplierLocation}</span>
                    </div>
                  </div>
                  {order.driverIncluded &&
                  <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold border border-success/20">
                      <CheckCircle size={10} /> Driver Included
                    </span>
                  }
                </div>
              </div>
            </div>

            {/* Rental Period */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Rental Period
              </h2>
              <div className="grid grid-cols-3 gap-3">
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
              {order.meetingPoint &&
              <div className="mt-4 flex items-start gap-2.5 p-3 bg-muted/30 rounded-xl">
                  <MapPin size={14} className="text-primary mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-foreground">Pickup Location</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.meetingPoint}</p>
                    {order.meetingTime &&
                  <p className="text-xs font-semibold text-primary mt-1 flex items-center gap-1">
                        <Clock size={10} /> {order.meetingTime}
                      </p>
                  }
                  </div>
                </div>
              }
            </div>

            {/* Cost Breakdown */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <IndianRupee size={16} className="text-primary" /> Cost Breakdown
              </h2>
              <div className="space-y-0">
                <div className="flex items-center justify-between py-3 border-b border-border/60">
                  <div>
                    <span className="text-sm text-foreground">Daily Rate</span>
                    <span className="text-xs text-muted-foreground ml-2">× {order.days} {order.days === 1 ? 'day' : 'days'}</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Refundable Security Deposit</span>
                    <div className="group relative">
                      <Info size={12} className="text-muted-foreground cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-48 bg-foreground text-background text-xs rounded-lg px-2.5 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 text-center">
                        Refunded after equipment is returned in good condition
                      </div>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-warning">₹{order.deposit.toLocaleString('en-IN')}</span>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-border/60">
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm text-muted-foreground">Platform Service Fee</span>
                    <span className="text-xs text-muted-foreground">(5%)</span>
                  </div>
                  <span className="text-sm font-semibold text-foreground">₹{order.platformFee.toLocaleString('en-IN')}</span>
                </div>

                {order.insuranceFee > 0 &&
                <div className="flex items-center justify-between py-3 border-b border-border/60">
                    <div className="flex items-center gap-1.5">
                      <Shield size={12} className="text-success" />
                      <span className="text-sm text-muted-foreground">Equipment Insurance</span>
                    </div>
                    <span className="text-sm font-semibold text-foreground">₹{order.insuranceFee.toLocaleString('en-IN')}</span>
                  </div>
                }

                {order.discount > 0 &&
                <div className="flex items-center justify-between py-3 border-b border-border/60">
                    <div className="flex items-center gap-1.5">
                      <Tag size={12} className="text-success" />
                      <span className="text-sm text-success font-medium">Discount Applied</span>
                    </div>
                    <span className="text-sm font-semibold text-success">−₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                }

                <div className="flex items-center justify-between py-4 mt-1 bg-primary/5 rounded-xl px-4 border border-primary/15">
                  <div>
                    <span className="font-bold text-foreground">Total Amount</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Inclusive of all charges</p>
                  </div>
                  <span className="font-extrabold text-xl text-primary">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </div>

            {/* Payment Options */}
            {order.paymentStatus !== 'paid' &&
            <div className="bg-card rounded-2xl border border-border p-5">
                <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                  <CreditCard size={16} className="text-primary" /> Payment Options
                </h2>
                <div className="space-y-3">
                  {/* Full Payment */}
                  <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentOption === 'full' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                    <input
                    type="radio"
                    name="paymentOption"
                    value="full"
                    checked={paymentOption === 'full'}
                    onChange={() => setPaymentOption('full')}
                    className="mt-0.5 accent-primary" />
                  
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-sm text-foreground">Pay Full Amount</p>
                        <span className="font-extrabold text-primary">₹{remainingAmount.toLocaleString('en-IN')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">Complete payment now and confirm your booking instantly</p>
                      <span className="inline-flex items-center gap-1 mt-1.5 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-semibold">
                        <Star size={9} /> Recommended
                      </span>
                    </div>
                  </label>

                  {/* Deposit Only */}
                  {order.deposit > 0 &&
                <label className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentOption === 'deposit' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'}`}>
                      <input
                    type="radio"
                    name="paymentOption"
                    value="deposit"
                    checked={paymentOption === 'deposit'}
                    onChange={() => setPaymentOption('deposit')}
                    className="mt-0.5 accent-primary" />
                  
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-sm text-foreground">Pay Deposit Only</p>
                          <span className="font-extrabold text-foreground">₹{order.deposit.toLocaleString('en-IN')}</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Secure your booking now. Remaining ₹{(remainingAmount - order.deposit).toLocaleString('en-IN')} due before pickup.
                        </p>
                      </div>
                    </label>
                }
                </div>

                {/* Selected amount summary */}
                <div className="mt-4 flex items-center justify-between p-3 bg-muted/40 rounded-xl">
                  <span className="text-sm font-semibold text-foreground">You Pay Now</span>
                  <span className="font-extrabold text-lg text-primary">₹{payNowAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>
            }

            {/* Terms Agreement */}
            {order.paymentStatus !== 'paid' &&
            <div className="bg-card rounded-2xl border border-border p-5">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary rounded" />
                
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    I agree to the{' '}
                    <Link href="/policies" className="text-primary font-semibold hover:underline">Rental Terms & Conditions</Link>
                    {' '}and{' '}
                    <Link href="/policies" className="text-primary font-semibold hover:underline">Cancellation Policy</Link>.
                    I understand the security deposit of ₹{order.deposit.toLocaleString('en-IN')} is refundable upon return of equipment in good condition.
                  </p>
                </label>
              </div>
            }
          </div>

          {/* ── Right: Order Summary Sidebar ── */}
          <div className="space-y-5">

            {/* Order Summary Card */}
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-24">
              <h2 className="font-bold text-base text-foreground mb-4">Order Summary</h2>

              {/* Booking Ref */}
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <span className="text-xs text-muted-foreground">Booking Reference</span>
                <span className="font-bold text-sm text-foreground font-tabular">{order.bookingRef}</span>
              </div>

              {/* Summary Lines */}
              <div className="space-y-2.5 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Rental ({order.days}d × ₹{order.dailyRate.toLocaleString('en-IN')})</span>
                  <span className="font-medium text-foreground">₹{order.subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Security Deposit</span>
                  <span className="font-medium text-warning">₹{order.deposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Platform Fee</span>
                  <span className="font-medium text-foreground">₹{order.platformFee.toLocaleString('en-IN')}</span>
                </div>
                {order.insuranceFee > 0 &&
                <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Insurance</span>
                    <span className="font-medium text-foreground">₹{order.insuranceFee.toLocaleString('en-IN')}</span>
                  </div>
                }
                {order.discount > 0 &&
                <div className="flex justify-between text-sm">
                    <span className="text-success font-medium">Discount</span>
                    <span className="font-medium text-success">−₹{order.discount.toLocaleString('en-IN')}</span>
                  </div>
                }
              </div>

              <div className="border-t border-border pt-3 mb-5">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-foreground">Total</span>
                  <span className="font-extrabold text-xl text-primary">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                {order.paymentStatus !== 'paid' &&
                <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-muted-foreground">Paying Now</span>
                    <span className="font-bold text-base text-foreground">₹{payNowAmount.toLocaleString('en-IN')}</span>
                  </div>
                }
              </div>

              {/* Pay Button */}
              {order.paymentStatus !== 'paid' ?
              <button
                onClick={handleProceedToPayment}
                disabled={isInitiatingPayment || !agreedToTerms}
                className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                
                  {isInitiatingPayment ?
                <><Loader2 size={16} className="animate-spin" /> Setting up payment...</> :

                <><Lock size={14} /> Pay ₹{payNowAmount.toLocaleString('en-IN')} Securely</>
                }
                </button> :

              <Link
                href={`/booking-confirmation?id=${order.bookingRef}`}
                className="w-full btn-primary py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                
                  <CheckCircle size={14} /> View Booking Confirmation
                </Link>
              }

              {!agreedToTerms && order.paymentStatus !== 'paid' &&
              <p className="text-xs text-muted-foreground text-center mt-2 flex items-center justify-center gap-1">
                  <AlertCircle size={11} /> Accept terms to proceed
                </p>
              }

              {/* Security Badges */}
              <div className="mt-4 pt-4 border-t border-border space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Lock size={11} className="text-success shrink-0" />
                  <span>256-bit SSL encrypted payment</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Shield size={11} className="text-success shrink-0" />
                  <span>Secured by Stripe — PCI DSS compliant</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle size={11} className="text-success shrink-0" />
                  <span>Deposit refunded after safe return</span>
                </div>
              </div>
            </div>

            {/* Farmer Info */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-sm text-foreground mb-3">Booking For</h2>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center shrink-0">
                  <User size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm text-foreground">{order.farmerName}</p>
                  <p className="text-xs text-muted-foreground">{order.farmerPhone}</p>
                  <p className="text-xs text-muted-foreground">{order.farmerEmail}</p>
                </div>
              </div>
            </div>

            {/* Back Link */}
            <Link
              href="/farmer/rentals"
              className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline">
              
              <ArrowLeft size={14} /> Back to My Rentals
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
        bookingRef={order.bookingRef}
        onSuccess={handlePaymentSuccess}
        onClose={() => {
          setPaymentModalOpen(false);
          setClientSecret('');
        }} />
      
    </div>);

}

export default function RentalPaymentPage() {
  return (
    <Suspense fallback={
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Loading payment details...</p>
        </div>
      </div>
    }>
      <RentalPaymentContent />
    </Suspense>);

}