'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { Star, MapPin, Shield, ChevronLeft, ChevronRight, Heart, Share2, Phone, CheckCircle, Truck, Wrench, ShoppingCart, Tag } from 'lucide-react';
import { ALL_EQUIPMENT } from '@/app/equipment-listing-page/components/EquipmentListingContent';
import RazorpayCheckout, { PaymentResult } from '@/components/RazorpayCheckout';
import { toast } from 'sonner';

const EXTRA_IMAGES = [
  'https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=800',
  'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
  'https://images.unsplash.com/photo-1560493676-04071c5f467b?w=800',
];

type ModalType = 'rent' | 'buy' | null;
type RentStep = 'dates' | 'summary' | 'payment' | 'done';

export default function EquipmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = React.use(params);
  const equipment = ALL_EQUIPMENT.find((e) => e.id === resolvedParams.id) || ALL_EQUIPMENT[0];
  const images = [equipment.image, ...EXTRA_IMAGES.slice(0, 2)];

  const [activeImg, setActiveImg] = useState(0);
  const [wishlist, setWishlist] = useState(false);
  const [modal, setModal] = useState<ModalType>(null);
  const [rentStep, setRentStep] = useState<RentStep>('dates');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [bookingId, setBookingId] = useState('');
  const [paidId, setPaidId] = useState('');

  const days = startDate && endDate ? Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000) + 1) : 1;
  const rentalAmt = days * equipment.rentPerDay;
  const platformFee = Math.round(rentalAmt * 0.02);
  const totalRent = rentalAmt + equipment.deposit + platformFee;
  const buyFee = Math.round(equipment.buyPrice * 0.01);
  const totalBuy = equipment.buyPrice + buyFee;

  function handleRentSuccess(result: PaymentResult) {
    const id = 'BKG' + Math.floor(Math.random() * 90000 + 10000);
    setBookingId(id); setPaidId(result.paymentId); setRentStep('done');
    toast.success('Booking confirmed! ✅');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/equipment-listing-page" className="hover:text-primary">Equipment</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium line-clamp-1">{equipment.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-3 space-y-6">
            <div className="space-y-3">
              <div className="relative rounded-2xl overflow-hidden bg-muted aspect-[16/10]">
                <img src={images[activeImg]} alt={equipment.imageAlt} className="w-full h-full object-cover" />
                {activeImg > 0 && <button onClick={() => setActiveImg(activeImg - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"><ChevronLeft size={18} /></button>}
                {activeImg < images.length - 1 && <button onClick={() => setActiveImg(activeImg + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 shadow flex items-center justify-center hover:bg-white"><ChevronRight size={18} /></button>}
                <div className="absolute top-3 left-3"><span className={`px-2.5 py-1 rounded-full text-xs font-bold ${equipment.available ? 'bg-success text-white' : 'bg-danger text-white'}`}>{equipment.available ? '✓ Available' : 'Unavailable'}</span></div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {images.map((img, i) => <button key={`thumb-${i}`} onClick={() => setActiveImg(i)} className={`shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImg === i ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'}`}><img src={img} alt={`View ${i + 1}`} className="w-full h-full object-cover" /></button>)}
              </div>
            </div>

            <div className="flex items-start justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{equipment.category}</span>
                <h1 className="text-2xl font-extrabold text-foreground mt-2 leading-tight">{equipment.name}</h1>
                <div className="flex items-center gap-3 mt-2 flex-wrap">
                  <div className="flex items-center gap-1">{[1,2,3,4,5].map(s => <Star key={s} size={14} className={s <= Math.round(equipment.rating) ? 'text-accent fill-accent' : 'text-muted-foreground'} />)}<span className="text-sm font-semibold text-foreground ml-1">{equipment.rating}</span><span className="text-sm text-muted-foreground">({equipment.reviews} reviews)</span></div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground"><MapPin size={13} className="text-primary" />{equipment.location} · {equipment.distance} km away</div>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setWishlist(!wishlist)} className={`p-2.5 rounded-xl border transition-all ${wishlist ? 'border-danger bg-danger/10 text-danger' : 'border-border hover:bg-muted text-muted-foreground'}`}><Heart size={18} className={wishlist ? 'fill-danger' : ''} /></button>
                <button className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-all"><Share2 size={18} /></button>
              </div>
            </div>

            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-base text-foreground mb-4 flex items-center gap-2"><Wrench size={16} className="text-primary" /> Specifications</h2>
              <div className="grid grid-cols-2 gap-3">
                {[{ label: 'Brand', value: equipment.brand }, { label: 'Year', value: equipment.yearMade }, { label: 'Category', value: equipment.category }, { label: 'Specs', value: equipment.specs }, { label: 'Location', value: equipment.location }, { label: 'Owner', value: equipment.owner }].map((row) => (
                  <div key={`spec-${row.label}`} className="bg-muted/40 rounded-xl p-3"><p className="text-xs text-muted-foreground mb-0.5">{row.label}</p><p className="text-sm font-semibold text-foreground">{String(row.value)}</p></div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-4">
            <div className="bg-card rounded-2xl border border-border p-5 sticky top-20">
              <div className="space-y-3 mb-5">
                <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-sm text-muted-foreground"><Tag size={14} />Rent per day</div><span className="text-2xl font-extrabold text-primary font-tabular">₹{equipment.rentPerDay.toLocaleString('en-IN')}</span></div>
                <div className="flex items-center justify-between"><div className="flex items-center gap-1.5 text-sm text-muted-foreground"><ShoppingCart size={14} />Buy price</div><span className="text-lg font-bold text-foreground font-tabular">₹{(equipment.buyPrice / 100000).toFixed(1)}L</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">Security deposit</span><span className="text-sm font-bold text-warning font-tabular">₹{equipment.deposit.toLocaleString('en-IN')} (refundable)</span></div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <button disabled={!equipment.available} onClick={() => { setModal('rent'); setRentStep('dates'); }} className={`py-3 rounded-xl font-bold text-sm transition-all ${equipment.available ? 'btn-primary' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>Rent Now</button>
                <button disabled={!equipment.available} onClick={() => setModal('buy')} className={`py-3 rounded-xl font-bold text-sm transition-all ${equipment.available ? 'btn-accent' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>Buy Now</button>
              </div>
              <a href={`tel:${equipment.ownerPhone}`} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-border text-sm font-semibold hover:bg-muted transition-colors"><Phone size={16} />Call {equipment.owner}</a>
              <div className="mt-4 space-y-2">
                {[{ icon: Shield, text: 'Verified supplier' }, { icon: Truck, text: 'Delivery available' }, { icon: CheckCircle, text: 'Deposit refundable' }].map(item => (
                  <div key={item.text} className="flex items-center gap-2 text-xs text-muted-foreground"><item.icon size={13} className="text-success" />{item.text}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {modal === 'rent' && (
        <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-card w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-modal max-h-[95vh] overflow-y-auto fade-in">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <div><h3 className="font-bold text-base text-foreground">Rent Equipment</h3><p className="text-xs text-muted-foreground line-clamp-1">{equipment.name}</p></div>
              <button onClick={() => setModal(null)} className="p-1.5 rounded-lg hover:bg-muted">✕</button>
            </div>
            <div className="p-5">
              {rentStep === 'dates' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-sm font-semibold text-foreground mb-1.5">Start Date</label><input type="date" value={startDate} min={new Date().toISOString().split('T')[0]} onChange={(e) => setStartDate(e.target.value)} className="input-field text-sm" /></div>
                    <div><label className="block text-sm font-semibold text-foreground mb-1.5">End Date</label><input type="date" value={endDate} min={startDate || new Date().toISOString().split('T')[0]} onChange={(e) => setEndDate(e.target.value)} className="input-field text-sm" /></div>
                  </div>
                  {startDate && endDate && <div className="bg-secondary/60 rounded-xl p-3 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Duration</span><span className="font-bold text-primary">{days} day{days > 1 ? 's' : ''}</span></div><div className="flex justify-between mt-1"><span className="text-muted-foreground">Estimated rental</span><span className="font-bold font-tabular">₹{rentalAmt.toLocaleString('en-IN')}</span></div></div>}
                  <button onClick={() => startDate && endDate && setRentStep('summary')} disabled={!startDate || !endDate} className="w-full btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed">Continue →</button>
                </div>
              )}
              {rentStep === 'summary' && (
                <div className="space-y-4">
                  <h4 className="font-bold text-sm text-foreground">Booking Summary</h4>
                  <div className="space-y-2.5 text-sm">
                    {[{ label: 'Equipment', value: equipment.name }, { label: 'Start', value: startDate }, { label: 'End', value: endDate }, { label: 'Duration', value: `${days} day${days > 1 ? 's' : ''}` }].map(row => <div key={row.label} className="flex justify-between"><span className="text-muted-foreground">{row.label}</span><span className="font-semibold text-foreground">{row.value}</span></div>)}
                    <div className="border-t border-border pt-2.5 space-y-2">
                      <div className="flex justify-between"><span className="text-muted-foreground">Rental</span><span className="font-tabular">₹{rentalAmt.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Deposit</span><span className="text-warning font-tabular">₹{equipment.deposit.toLocaleString('en-IN')}</span></div>
                      <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (2%)</span><span className="font-tabular">₹{platformFee.toLocaleString('en-IN')}</span></div>
                    </div>
                    <div className="border-t border-border pt-2.5 flex justify-between"><span className="font-bold text-foreground text-base">Total Payable</span><span className="font-bold text-xl text-primary font-tabular">₹{totalRent.toLocaleString('en-IN')}</span></div>
                  </div>
                  <div className="flex gap-3"><button onClick={() => setRentStep('dates')} className="btn-secondary py-3 px-5">← Back</button><button onClick={() => setRentStep('payment')} className="flex-1 btn-primary py-3 font-bold">Continue →</button></div>
                </div>
              )}
              {rentStep === 'payment' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between"><h4 className="font-bold text-sm text-foreground">Secure Payment</h4><span className="font-bold text-primary font-tabular">₹{totalRent.toLocaleString('en-IN')}</span></div>
                  <RazorpayCheckout amount={totalRent} receipt={`kisan_${equipment.id}_${Date.now()}`} description={`Rental: ${equipment.name} (${days} day${days > 1 ? 's' : ''})`} buttonText={`Pay ₹${totalRent.toLocaleString('en-IN')} via Razorpay`} loadingText="Processing Payment..." onSuccess={handleRentSuccess} onError={(error) => toast.error(`Payment failed: ${error}`)} onDismiss={() => toast.info('Payment cancelled')} />
                  <button onClick={() => setRentStep('summary')} className="btn-secondary py-3 px-5 w-full">← Back to Summary</button>
                </div>
              )}
              {rentStep === 'done' && (
                <div className="text-center py-4">
                  <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-success" /></div>
                  <h3 className="font-bold text-xl text-foreground mb-2">Booking Confirmed!</h3>
                  <p className="text-sm text-muted-foreground mb-4">Booking ID: <span className="font-bold text-primary">{bookingId}</span></p>
                  <button onClick={() => setModal(null)} className="w-full btn-primary py-3">View My Bookings</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {modal === 'buy' && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-modal w-full max-w-md p-6 fade-in">
            <h3 className="font-bold text-lg text-foreground mb-4">Purchase {equipment.name}</h3>
            <div className="bg-muted/40 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Equipment Price</span><span className="font-tabular">₹{equipment.buyPrice.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Platform Fee (1%)</span><span className="font-tabular">₹{buyFee.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between font-bold text-foreground border-t border-border pt-2"><span>Total</span><span className="text-primary font-tabular">₹{totalBuy.toLocaleString('en-IN')}</span></div>
            </div>
            <RazorpayCheckout amount={totalBuy} description={`Purchase: ${equipment.name}`} buttonText={`Pay ₹${totalBuy.toLocaleString('en-IN')}`} onSuccess={(result) => { toast.success('Purchase confirmed! ✅'); setModal(null); }} onError={(error) => toast.error(`Payment failed: ${error}`)} onDismiss={() => setModal(null)} />
            <button onClick={() => setModal(null)} className="w-full mt-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
