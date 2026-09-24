'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  CheckCircle, Calendar, MapPin, Phone, User, IndianRupee,
  Download, Share2, MessageCircle, Truck, Clock, AlertCircle,
  ChevronRight, Copy, Star, ArrowLeft, Shield } from
'lucide-react';
import { toast } from 'sonner';

interface BookingData {
  id: string;equipment: string;category: string;image: string;
  supplier: string;supplierPhone: string;supplierLocation: string;
  farmer: string;farmerPhone: string;
  startDate: string;endDate: string;days: number;
  dailyRate: number;subtotal: number;deposit: number;
  platformFee: number;totalAmount: number;amountPaid: number;
  paymentStatus: 'paid' | 'partial' | 'pending';paymentMethod: string;
  status: 'confirmed' | 'rental_active' | 'returned';
  meetingPoint: string;meetingTime: string;driverName?: string;driverPhone?: string;
  nextPaymentDue?: string;nextPaymentAmount?: number;
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
    nextPaymentDue: undefined, nextPaymentAmount: undefined
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
  const booking = BOOKING_DATA[bookingId] || DEFAULT_BOOKING;

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

        {/* Success Banner */}
        <div className={`rounded-2xl border p-5 mb-6 ${sc.bg}`}>
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${booking.status === 'rental_active' ? 'bg-success' : 'bg-info'}`}>
              <sc.icon size={28} className="text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-extrabold text-foreground">{sc.label}!</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Your booking has been successfully processed</p>
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
                <img src={booking.image} alt={booking.equipment} className="w-24 h-24 rounded-xl object-cover shrink-0" />
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
                  <p className="text-xs text-muted-foreground">via {booking.paymentMethod}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="font-bold text-foreground">₹{booking.amountPaid.toLocaleString('en-IN')}</p>
                  <p className="text-xs text-muted-foreground">Amount paid</p>
                </div>
              </div>

              {booking.paymentStatus === 'partial' && booking.nextPaymentDue &&
              <div className="bg-warning/5 border border-warning/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock size={14} className="text-warning" />
                    <p className="font-bold text-sm text-foreground">Payment Due</p>
                  </div>
                  <p className="text-sm text-muted-foreground">Remaining amount of <span className="font-bold text-warning">₹{booking.nextPaymentAmount?.toLocaleString('en-IN')}</span> is due on <span className="font-bold text-foreground">{booking.nextPaymentDue}</span></p>
                  <button className="mt-3 w-full btn-primary py-2.5 rounded-xl text-sm font-semibold">Pay Now ₹{booking.nextPaymentAmount?.toLocaleString('en-IN')}</button>
                </div>
              }
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

                {booking.driverName &&
                <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0 text-white text-xs font-bold">2</div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">Driver Details</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{booking.driverName}</p>
                      <p className="text-xs font-semibold text-primary mt-1">{booking.driverPhone}</p>
                    </div>
                  </div>
                }

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
                {booking.status === 'returned' &&
                <button className="w-full flex items-center gap-3 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors">
                    <Star size={15} className="text-warning" /> Write Review
                  </button>
                }
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
    </div>);

}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={
    <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center"><div className="w-10 h-10 rounded-full border-4 border-primary border-t-transparent animate-spin mx-auto mb-3" /><p className="text-sm text-muted-foreground">Loading booking details...</p></div>
      </div>
    }>
      <BookingConfirmationContent />
    </Suspense>);

}