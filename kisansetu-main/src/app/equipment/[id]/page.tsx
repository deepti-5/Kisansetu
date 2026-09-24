'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Star, MapPin, Shield, ChevronLeft, ChevronRight, Heart, Share2, Phone, MessageCircle, CheckCircle, Truck, Wrench, Calendar, Info, ZoomIn, ShoppingCart, Tag } from 'lucide-react';
import { ALL_EQUIPMENT } from '@/app/equipment-listing-page/components/EquipmentListingContent';
import RazorpayCheckout, { PaymentResult } from '@/components/RazorpayCheckout';
import { toast } from 'sonner';

const EXTRA_IMAGES = [
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
  'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
];

const AVAILABILITY = {
  booked: ['2026-08-15', '2026-08-16', '2026-08-17', '2026-08-22', '2026-08-23'],
  available: true,
};

const REVIEWS = [
  { name: 'Suresh Yadav', rating: 5, date: '2 weeks ago', text: 'Excellent tractor, well maintained. Rajesh bhai was very cooperative. Will rent again!', avatar: 'SY' },
  { name: 'Priya Deshmukh', rating: 4, date: '1 month ago', text: 'Good condition, delivered on time. Minor fuel issue but resolved quickly.', avatar: 'PD' },
  { name: 'Mohan Kulkarni', rating: 5, date: '1 month ago', text: 'Best rental experience. Equipment was clean and powerful. Highly recommended.', avatar: 'MK' },
];

type ModalType = 'rent' | 'buy' | null;
type RentStep = 'dates' | 'summary' | 'payment' | 'done';

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const equipment = ALL_EQUIPMENT.find((e) => e.id === resolvedParams.id) || ALL_EQUIPMENT[0];
  const images = [equipment.image, ...EXTRA_IMAGES.slice(0, 3)];

  const [activeImg, setActiveImg] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [rentStep, setRentStep] = useState<RentStep>('dates');
  const [buyStep, setBuyStep] = useState<'payment' | 'done'>('payment');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [paidId, setPaidId] = useState('');
  const [lightbox, setLightbox] = useState(false);
  const [rentReceipt, setRentReceipt] = useState('');
  const [buyReceipt, setBuyReceipt] = useState('');

  const today = new Date().toISOString().split('T')[0];
  const days = startDate && endDate
    ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1)
    : 1;
  const rentalAmt = days * equipment.rentPerDay;
  const platformFee = Math.round(rentalAmt * 0.02);
  const totalRent = rentalAmt + equipment.deposit + platformFee;
  const buyFee = Math.round(equipment.buyPrice * 0.01);
  const totalBuy = equipment.buyPrice + buyFee;

  function openModal(type: ModalType) {
    setModal(type);
    setRentStep('dates');
    setBuyStep('payment');
    setStartDate('');
    setEndDate('');
    setBookingId('');
    setPaidId('');
    if (type === 'rent') {
      setRentReceipt(`rent_${equipment.id}_${Date.now()}`);
    } else if (type === 'buy') {
      setBuyReceipt(`buy_${equipment.id}_${Date.now()}`);
    }
  }

  function handleRentSuccess(result: PaymentResult) {
    const id = 'BKG' + Math.floor(Math.random() * 90000 + 10000);
    setBookingId(id);
    setPaidId(result.paymentId);
    setRentStep('done');
    toast.success('Booking confirmed! ✅');
  }

  function handleBuySuccess(result: PaymentResult) {
    const id = 'ORD' + Math.floor(Math.random() * 90000 + 10000);
    setBookingId(id);
    setPaidId(result.paymentId);
    setBuyStep('done');
    toast.success('Purchase confirmed! ✅');
  }

  const specRows = [
    { label: 'Brand', value: equipment.brand },
    { label: 'Year', value: equipment.yearMade },
    { label: 'Category', value: equipment.category },
    { label: 'Specs', value: equipment.specs },
    ...(equipment.horsepower ? [{ label: 'Horsepower', value: `${equipment.horsepower} HP` }] : []),
    { label: 'Location', value: equipment.location },
    { label: 'Units Available', value: equipment.units },
    { label: 'Owner', value: equipment.owner },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight size={14} />
          <Link href="/equipment-listing-page" className="hover:text-primary transition-colors">Equipment</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium line-clamp-1">{equipment.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* LEFT: Gallery + Details */}
          <div className="lg:col-span-3 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[16/10] cursor-zoom-in group" onClick={() => setLightbox(true)}>
                <img src={images[activeImg]} alt={equipment.imageAlt} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn size={28} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                {/* Nav arrows */}
                {activeImg > 0 && (
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg(activeImg - 1); }} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronLeft size={18} />
                  </button>
                )}
                {activeImg < images.length - 1 && (
                  <button onClick={(e) => { e.stopPropagation(); setActiveImg(activeImg + 1); }} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white transition-colors">
                    <ChevronRight size={18} />
                  </button>
                )}
                {/* Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${equipment.available ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                    {equipment.available ? '✓ Available' : 'Unavailable'}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                  {activeImg + 1} / {images.length}
                </div>
              </div>
              {/* Thumbnails */}
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => (
                  <button key={`thumb-${i}`} onClick={() => setActiveImg(i)} className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                    <img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            {/* Title + Actions */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{equipment.category}</span>
                <h1 className="text-2xl font-extrabold text-foreground mt-2 leading-tight">{equipment.name}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    {[1,2,3,4,5].map(s => (
                      <Star key={s} size={14} className={s <= Math.round(equipment.rating) ? 'text-accent fill-accent' : 'text-muted-foreground'} />
                    ))}
                    <span className="text-sm font-semibold text-foreground ml-1">{equipment.rating}</span>
                    <span className="text-sm text-muted-foreground">({equipment.reviews} reviews)</span>
                  </div>
                  <span className="text-muted-foreground">·</span>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin size={13} className="text-primary" />
                    {equipment.location} · {equipment.distance} km away
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setWishlist(!wishlist)} className={`p-2.5 rounded-xl border transition-all ${wishlist ? 'border-danger bg-danger/10 text-danger' : 'border-border hover:bg-muted text-muted-foreground'}`}>
                  <Heart size={18} className={wishlist ? 'fill-danger' : ''} />
                </button>
                <button className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            {/* Specs */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <Wrench size={16} className="text-primary" /> Specifications
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {specRows.map((row) => (
                  <div key={`spec-${row.label}`} className="bg-muted/40 rounded-xl p-3">
                    <p className="text-xs text-muted-foreground mb-0.5">{row.label}</p>
                    <p className="text-sm font-semibold text-foreground">{String(row.value)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Availability Calendar */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <Calendar size={16} className="text-primary" /> Availability
              </h2>
              <div className="grid grid-cols-7 gap-1 text-center text-xs mb-2">
                {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
                  <div key={d} className="font-semibold text-muted-foreground py-1">{d}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center text-xs">
                {Array.from({ length: 35 }, (_, i) => {
                  const d = new Date(2026, 7, i - 3);
                  const ds = d.toISOString().split('T')[0];
                  const isBooked = AVAILABILITY.booked.includes(ds);
                  const isPast = d < new Date();
                  const dayNum = d.getDate();
                  const inMonth = d.getMonth() === 7;
                  return (
                    <div key={`cal-${i}`} className={`py-1.5 rounded-lg font-medium transition-colors ${!inMonth ? 'opacity-0' : isPast ? 'text-muted-foreground/40' : isBooked ? 'bg-danger/15 text-danger' : 'bg-success/15 text-success hover:bg-success/25 cursor-pointer'}`}>
                      {inMonth ? dayNum : ''}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-success/30 inline-block" />Available</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-danger/20 inline-block" />Booked</span>
              </div>
            </div>

            {/* Reviews */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
                <Star size={16} className="text-accent fill-accent" /> Reviews ({equipment.reviews})
              </h2>
              <div className="space-y-4">
                {REVIEWS.map((r, i) => (
                  <div key={`rev-${i}`} className="flex gap-3">
                    <div className="w-9 h-9 rounded-full gradient-green flex items-center justify-center text-white text-xs font-bold shrink-0">{r.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm text-foreground">{r.name}</p>
                        <span className="text-xs text-muted-foreground">{r.date}</span>
                      </div>
                      <div className="flex items-center gap-0.5 my-1">
                        {[1,2,3,4,5].map(s => <Star key={s} size={11} className={s <= r.rating ? 'text-accent fill-accent' : 'text-muted-foreground'} />)}
                      </div>
                      <p className="text-sm text-muted-foreground">{r.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Booking Card */}
          <div className="lg:col-span-2">
            <div className="sticky top-20 space-y-4">
              <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
                {/* Pricing */}
                <div className="space-y-2 mb-4">
                  {(equipment.listingType === 'rent' || equipment.listingType === 'both') && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground text-sm">Rent</span>
                      <div className="text-right">
                        <span className="text-2xl font-extrabold text-primary">₹{equipment.rentPerDay.toLocaleString('en-IN')}</span>
                        <span className="text-sm text-muted-foreground">/day</span>
                      </div>
                    </div>
                  )}
                  {(equipment.listingType === 'buy' || equipment.listingType === 'both') && (
                    <div className="flex items-baseline justify-between">
                      <span className="text-muted-foreground text-sm">Buy</span>
                      <div className="text-right">
                        <span className="text-xl font-bold text-foreground">₹{equipment.buyPrice.toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Shield size={12} className="text-primary" />
                    ₹{equipment.deposit.toLocaleString('en-IN')} refundable deposit
                  </div>
                </div>

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { icon: Shield, label: 'Insured' },
                    { icon: CheckCircle, label: 'Verified' },
                    { icon: Truck, label: 'Delivery' },
                  ].map((b) => (
                    <div key={b.label} className="flex flex-col items-center gap-1 bg-muted/40 rounded-xl py-2.5 px-1">
                      <b.icon size={16} className="text-primary" />
                      <span className="text-xs font-medium text-foreground">{b.label}</span>
                    </div>
                  ))}
                </div>

                {/* CTA Buttons */}
                <div className="space-y-2.5">
                  <button onClick={() => openModal('rent')} disabled={!equipment.available} className="w-full btn-primary py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                    <Calendar size={17} /> Rent Now
                  </button>
                  <button onClick={() => openModal('buy')} className="w-full btn-secondary py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2">
                    <ShoppingCart size={17} /> Buy Now
                  </button>
                </div>

                <div className="border-t border-border mt-4 pt-4 space-y-2.5">
                  <p className="text-xs font-semibold text-foreground">Owner: {equipment.owner}</p>
                  <div className="flex gap-2">
                    <a href={`tel:${equipment.ownerPhone}`} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                      <Phone size={14} className="text-primary" /> Call
                    </a>
                    <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
                      <MessageCircle size={14} className="text-primary" /> Chat
                    </button>
                  </div>
                </div>
              </div>

              {/* Info box */}
              <div className="bg-warning-bg rounded-xl p-3.5 flex gap-2.5">
                <Info size={15} className="text-warning shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">Deposit is fully refundable within 48 hours of return inspection. Cancellation free up to 24 hours before start.</p>
              </div>

              {/* Delivery info */}
              <div className="bg-card rounded-xl border border-border p-3.5 flex items-center gap-3">
                <Truck size={18} className="text-primary shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Free Delivery Available</p>
                  <p className="text-xs text-muted-foreground">Within {equipment.distance + 5} km radius</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(false)}>
          <img src={images[activeImg]} alt={equipment.imageAlt} className="max-w-full max-h-full rounded-xl object-contain" />
          <button className="absolute top-4 right-4 text-white bg-white/20 rounded-full p-2 hover:bg-white/30 transition-colors" onClick={() => setLightbox(false)}>✕</button>
        </div>
      )}

      {/* Rent Modal */}
      {modal === 'rent' && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-modal max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-bold text-base text-foreground">{rentStep === 'done' ? '🎉 Booking Confirmed' : 'Rent Equipment'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">✕</button>
            </div>
            <div className="p-5">
              {rentStep === 'dates' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">Start Date</label>
                      <input type="date" value={startDate} min={today} onChange={e => setStartDate(e.target.value)} className="input-field text-sm w-full" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1.5">End Date</label>
                      <input type="date" value={endDate} min={startDate || today} onChange={e => setEndDate(e.target.value)} className="input-field text-sm w-full" />
                    </div>
                  </div>
                  {startDate && endDate && (
                    <div className="bg-secondary/60 rounded-xl p-3 text-sm space-y-1">
                      <div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-bold text-primary">{days} day{days > 1 ? 's' : ''}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Rental</span><span className="font-semibold">₹{rentalAmt.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span className="font-semibold text-warning">₹{equipment.deposit.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee</span><span>₹{platformFee.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between border-t border-border pt-1"><span className="font-bold">Total</span><span className="font-bold text-primary text-lg">₹{totalRent.toLocaleString('en-IN')}</span></div>
                    </div>
                  )}
                  <button onClick={() => { if (!startDate || !endDate) { toast.error('Select dates'); return; } setRentStep('payment'); }} className="w-full btn-primary py-3 rounded-xl font-bold">Continue to Payment</button>
                </div>
              )}
              {rentStep === 'payment' && (
                <div className="space-y-4">
                  <div className="bg-muted/40 rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Equipment</span><span className="font-semibold text-right max-w-[180px]">{equipment.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Dates</span><span className="font-semibold">{startDate} → {endDate}</span></div>
                    <div className="flex justify-between border-t border-border pt-2"><span className="font-bold">Total</span><span className="font-bold text-primary text-lg">₹{totalRent.toLocaleString('en-IN')}</span></div>
                  </div>
                  <RazorpayCheckout
                    amount={totalRent}
                    description={`Rental: ${equipment.name}`}
                    receipt={rentReceipt}
                    buttonText={`Pay ₹${totalRent.toLocaleString('en-IN')}`}
                    onSuccess={handleRentSuccess}
                    onError={(e) => toast.error(e)}
                  />
                  <button onClick={() => setRentStep('dates')} className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors py-2">← Back</button>
                </div>
              )}
              {rentStep === 'done' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                    <CheckCircle size={36} className="text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">Booking Confirmed!</p>
                    <p className="text-sm text-muted-foreground mt-1">Booking ID: <span className="font-bold text-primary">{bookingId}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Payment ID: {paidId}</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3 text-sm text-left space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Equipment</span><span className="font-semibold">{equipment.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Dates</span><span className="font-semibold">{startDate} → {endDate}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-bold text-primary">₹{totalRent.toLocaleString('en-IN')}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/account/bookings" className="flex-1 btn-primary py-2.5 rounded-xl font-semibold text-sm text-center">View Bookings</Link>
                    <button onClick={() => setModal(null)} className="flex-1 btn-secondary py-2.5 rounded-xl font-semibold text-sm">Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {modal === 'buy' && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-modal max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-bold text-base text-foreground">{buyStep === 'done' ? '🎉 Purchase Confirmed' : 'Buy Equipment'}</h3>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">✕</button>
            </div>
            <div className="p-5">
              {buyStep !== 'done' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                    <img src={equipment.image} alt={equipment.imageAlt} className="w-14 h-14 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-sm">{equipment.name}</p>
                      <p className="text-xs text-muted-foreground">{equipment.brand} · {equipment.yearMade}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Equipment Price</span><span className="font-semibold">₹{equipment.buyPrice.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (1%)</span><span>₹{buyFee.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between border-t border-border pt-2"><span className="font-bold">Total</span><span className="font-bold text-primary text-lg">₹{totalBuy.toLocaleString('en-IN')}</span></div>
                  </div>
                  <div className="flex items-center gap-2 bg-warning-bg rounded-lg p-3 text-xs text-muted-foreground">
                    <Tag size={13} className="text-warning shrink-0" />
                    Ownership transfer documents will be provided within 7 working days.
                  </div>
                  <RazorpayCheckout
                    amount={totalBuy}
                    description={`Purchase: ${equipment.name}`}
                    receipt={buyReceipt}
                    buttonText={`Pay ₹${totalBuy.toLocaleString('en-IN')}`}
                    onSuccess={handleBuySuccess}
                    onError={(e) => toast.error(e)}
                  />
                </div>
              )}
              {buyStep === 'done' && (
                <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                    <CheckCircle size={36} className="text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">Purchase Confirmed!</p>
                    <p className="text-sm text-muted-foreground mt-1">Order ID: <span className="font-bold text-primary">{bookingId}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Payment ID: {paidId}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/account/bookings" className="flex-1 btn-primary py-2.5 rounded-xl font-semibold text-sm text-center">View Orders</Link>
                    <button onClick={() => setModal(null)} className="flex-1 btn-secondary py-2.5 rounded-xl font-semibold text-sm">Close</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
