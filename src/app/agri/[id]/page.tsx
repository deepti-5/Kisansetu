'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Zap, ChevronRight, Shield, Truck, RotateCcw, CheckCircle, Minus, Plus, Share2 } from 'lucide-react';
import RazorpayCheckout, { PaymentResult } from '@/components/RazorpayCheckout';

const PRODUCT = {
  id: 'agri-001', name: 'Paddy Seeds — Hybrid IR-64', category: 'Seeds',
  image: 'https://images.unsplash.com/photo-1661396153002-e3d5ed09a0a9',
  imageAlt: 'Green paddy rice seedlings growing in water-filled agricultural nursery field',
  price: 950, mrp: 1100, unit: 'per kg', rating: 4.5, reviews: 234,
  seller: 'AgroMart Pune', inStock: true, badge: 'Best Seller',
  description: 'High-yield hybrid paddy seeds suitable for Kharif season. IR-64 is a semi-dwarf, high-yielding variety known for its excellent grain quality, disease resistance, and adaptability to various soil conditions.',
  highlights: ['Yield: 5–6 tonnes/hectare', 'Duration: 110–120 days', 'Suitable for: Kharif season', 'Grain type: Long slender', 'Disease resistance: Blast, BLB'],
};

export default function AgriProductDetailPage() {
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyDone, setBuyDone] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [payError, setPayError] = useState('');

  const discount = Math.round((PRODUCT.mrp - PRODUCT.price) / PRODUCT.mrp * 100);
  const totalAmount = PRODUCT.price * qty;

  function handlePaySuccess(result: PaymentResult) {
    const id = 'ORD' + Math.floor(Math.random() * 90000 + 10000);
    setOrderId(id); setBuyDone(true);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/agri" className="hover:text-primary">Agri Supplies</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">{PRODUCT.name}</span>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted mb-3">
              <AppImage src={PRODUCT.image} alt={PRODUCT.imageAlt} fill className="object-cover" />
              {PRODUCT.badge && <span className="absolute top-3 left-3 bg-warning text-white text-xs font-bold px-2.5 py-1 rounded-lg">{PRODUCT.badge}</span>}
              {discount > 0 && <span className="absolute top-3 right-3 bg-danger text-white text-xs font-bold px-2.5 py-1 rounded-lg">{discount}% OFF</span>}
            </div>
          </div>
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{PRODUCT.category}</span>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setWishlist(!wishlist)} className={`p-2.5 rounded-xl border transition-colors ${wishlist ? 'bg-danger/10 border-danger/30 text-danger' : 'border-border hover:bg-muted text-muted-foreground'}`}><Heart size={18} className={wishlist ? 'fill-danger' : ''} /></button>
                <button className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors"><Share2 size={18} /></button>
              </div>
            </div>
            <h1 className="text-2xl font-extrabold text-foreground mb-2">{PRODUCT.name}</h1>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">{Array.from({ length: 5 }).map((_, i) => <Star key={i} size={14} className={i < Math.floor(PRODUCT.rating) ? 'text-warning fill-warning' : 'text-muted-foreground'} />)}<span className="font-bold text-sm ml-1">{PRODUCT.rating}</span></div>
              <span className="text-sm text-muted-foreground">({PRODUCT.reviews} reviews)</span>
              <span className="text-sm text-muted-foreground">by <span className="text-primary font-semibold">{PRODUCT.seller}</span></span>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-extrabold text-foreground">₹{PRODUCT.price.toLocaleString('en-IN')}</span>
              <span className="text-lg text-muted-foreground line-through">₹{PRODUCT.mrp.toLocaleString('en-IN')}</span>
              <span className="text-sm font-bold text-success">{discount}% off</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{PRODUCT.unit}</p>
            <div className="bg-muted/50 rounded-xl p-4 mb-5">
              <p className="text-sm font-bold text-foreground mb-2">Key Highlights</p>
              <ul className="space-y-1.5">{PRODUCT.highlights.map((h, i) => <li key={i} className="flex items-center gap-2 text-sm text-foreground"><CheckCircle size={14} className="text-success shrink-0" />{h}</li>)}</ul>
            </div>
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm font-semibold text-foreground">Quantity (kg):</span>
              <div className="flex items-center gap-2 border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"><Minus size={16} /></button>
                <span className="w-12 text-center font-bold text-foreground">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"><Plus size={16} /></button>
              </div>
              <span className="text-sm text-muted-foreground">Total: <strong className="text-foreground">₹{totalAmount.toLocaleString('en-IN')}</strong></span>
            </div>
            <div className="flex gap-3 mb-6">
              <button onClick={() => { setAddedToCart(true); setTimeout(() => setAddedToCart(false), 2000); }} className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold border-2 transition-all ${addedToCart ? 'bg-success/10 border-success text-success' : 'border-primary text-primary hover:bg-primary/5'}`}>
                {addedToCart ? <><CheckCircle size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button onClick={() => setShowBuyModal(true)} className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold btn-primary"><Zap size={18} /> Buy Now</button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[{ icon: Shield, label: 'Quality Assured', sub: 'Certified seeds' }, { icon: Truck, label: 'Fast Delivery', sub: '2–4 days' }, { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' }].map((badge) => (
                <div key={badge.label} className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-xl"><badge.icon size={18} className="text-primary mb-1" /><p className="text-xs font-semibold text-foreground">{badge.label}</p><p className="text-xs text-muted-foreground">{badge.sub}</p></div>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-bold text-lg text-foreground mb-3">Description</h2>
          <p className="text-foreground leading-relaxed">{PRODUCT.description}</p>
        </div>
      </main>

      {showBuyModal && !buyDone && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-modal w-full max-w-md p-6 fade-in">
            <h3 className="font-bold text-lg text-foreground mb-4">Complete Purchase</h3>
            <div className="bg-muted/40 rounded-xl p-4 mb-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">{PRODUCT.name}</span><span className="font-tabular">₹{PRODUCT.price.toLocaleString('en-IN')} × {qty}</span></div>
              <div className="flex justify-between font-bold text-foreground border-t border-border pt-2"><span>Total</span><span className="text-primary font-tabular">₹{totalAmount.toLocaleString('en-IN')}</span></div>
            </div>
            {payError && <p className="text-danger text-sm mb-3">{payError}</p>}
            <RazorpayCheckout amount={totalAmount} description={`${PRODUCT.name} × ${qty} kg`} buttonText={`Pay ₹${totalAmount.toLocaleString('en-IN')}`} onSuccess={handlePaySuccess} onError={setPayError} onDismiss={() => setShowBuyModal(false)} />
            <button onClick={() => setShowBuyModal(false)} className="w-full mt-3 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">Cancel</button>
          </div>
        </div>
      )}

      {buyDone && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-modal w-full max-w-md p-8 text-center fade-in">
            <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4"><CheckCircle size={32} className="text-success" /></div>
            <h3 className="font-bold text-xl text-foreground mb-2">Order Placed!</h3>
            <p className="text-muted-foreground mb-4">Order ID: <span className="font-bold text-foreground">{orderId}</span></p>
            <Link href="/account/bookings" onClick={() => setBuyDone(false)} className="btn-primary w-full py-3 rounded-xl font-semibold text-center block">View My Orders</Link>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
