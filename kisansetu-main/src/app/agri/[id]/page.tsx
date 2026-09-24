'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { Star, Heart, ShoppingCart, Zap, ChevronRight, Shield, Truck, RotateCcw, CheckCircle, Leaf, Minus, Plus, Share2 } from 'lucide-react';
import RazorpayCheckout, { PaymentResult } from '@/components/RazorpayCheckout';

const PRODUCT = {
  id: 'agri-001',
  name: 'Paddy Seeds — Hybrid IR-64',
  category: 'Seeds',
  images: [
  { src: 'https://images.unsplash.com/photo-1661396153002-e3d5ed09a0a9', alt: 'Green paddy rice seedlings growing in water-filled agricultural nursery field' },
  { src: "https://images.unsplash.com/photo-1707627600174-10ca22151058", alt: 'Close-up of paddy rice seeds in a wooden bowl' },
  { src: "https://images.unsplash.com/photo-1700906310080-65a7d9718929", alt: 'Agricultural field with paddy crop growing in rows' },
  { src: "https://images.unsplash.com/photo-1602775937398-5a66169b310a", alt: 'Farmer inspecting paddy crop in green field' }],

  price: 950,
  mrp: 1100,
  unit: 'per kg',
  rating: 4.5,
  reviews: 234,
  seller: 'AgroMart Pune',
  sellerRating: 4.7,
  inStock: true,
  badge: 'Best Seller',
  isOrganic: false,
  description: 'High-yield hybrid paddy seeds suitable for Kharif season. IR-64 is a semi-dwarf, high-yielding variety known for its excellent grain quality, disease resistance, and adaptability to various soil conditions.',
  highlights: [
  'Yield: 5–6 tonnes/hectare',
  'Duration: 110–120 days',
  'Suitable for: Kharif season',
  'Grain type: Long slender',
  'Disease resistance: Blast, BLB'],

  specifications: {
    'Variety': 'IR-64 Hybrid',
    'Seed Type': 'Certified Seeds',
    'Germination Rate': '≥ 85%',
    'Moisture Content': '≤ 12%',
    'Purity': '≥ 98%',
    'Season': 'Kharif',
    'Suitable Soil': 'Loamy, Clay-loam',
    'Water Requirement': 'Medium'
  },
  reviews_list: [
  { name: 'Suresh Patil', rating: 5, date: '2026-07-10', verified: true, comment: 'Excellent germination rate. Got over 90% germination. Very happy with the yield this season.' },
  { name: 'Kavita Sharma', rating: 4, date: '2026-06-25', verified: true, comment: 'Good quality seeds. Packaging was intact. Delivery was fast.' },
  { name: 'Mohan Kulkarni', rating: 5, date: '2026-06-08', verified: false, comment: 'Best paddy seeds I have used. Will buy again next season.' }]
};

export default function AgriProductDetailPage() {
  const [activeImg, setActiveImg] = useState(0);
  const [qty, setQty] = useState(1);
  const [wishlist, setWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'reviews'>('description');
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [buyDone, setBuyDone] = useState(false);
  const [orderId, setOrderId] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [payError, setPayError] = useState('');
  const [buyReceipt] = useState(`agri_${PRODUCT.id}_${Math.floor(Math.random() * 1000000)}`);

  const discount = Math.round((PRODUCT.mrp - PRODUCT.price) / PRODUCT.mrp * 100);
  const totalAmount = PRODUCT.price * qty;

  function handleAddToCart() {
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    setPayError('');
    setBuyDone(false);
    setShowBuyModal(true);
  }

  function handlePaySuccess(result: PaymentResult) {
    const id = 'ORD' + Math.floor(Math.random() * 90000 + 10000);
    setOrderId(id);
    setPaymentId(result.paymentId);
    setBuyDone(true);
  }

  function handlePayError(err: string) {
    setPayError(err);
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 lg:px-8 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6 flex-wrap">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <Link href="/agri" className="hover:text-primary">Agri Supplies</Link>
          <ChevronRight size={14} />
          <span className="text-muted-foreground">{PRODUCT.category}</span>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium truncate max-w-[200px]">{PRODUCT.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-10">
          {/* Images */}
          <div>
            <div className="relative aspect-square rounded-2xl overflow-hidden border border-border bg-muted mb-3">
              <AppImage src={PRODUCT.images[activeImg].src} alt={PRODUCT.images[activeImg].alt} className="w-full h-full object-cover" />
              {PRODUCT.badge &&
              <span className="absolute top-3 left-3 bg-warning text-white text-xs font-bold px-2.5 py-1 rounded-lg">{PRODUCT.badge}</span>
              }
              {discount > 0 &&
              <span className="absolute top-3 right-3 bg-danger text-white text-xs font-bold px-2.5 py-1 rounded-lg">{discount}% OFF</span>
              }
            </div>
            <div className="flex gap-2">
              {PRODUCT.images.map((img, i) =>
              <button key={i} onClick={() => setActiveImg(i)}
              className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${activeImg === i ? 'border-primary' : 'border-border hover:border-primary/40'}`}>
                  <AppImage src={img.src} alt={img.alt} className="w-full h-full object-cover" />
                </button>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full">{PRODUCT.category}</span>
                {PRODUCT.isOrganic &&
                <span className="ml-2 text-xs font-semibold text-success bg-success/10 px-2.5 py-1 rounded-full flex-inline items-center gap-1">
                    <Leaf size={11} className="inline" /> Organic
                  </span>
                }
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setWishlist(!wishlist)}
                className={`p-2.5 rounded-xl border transition-colors ${wishlist ? 'bg-danger/10 border-danger/30 text-danger' : 'border-border hover:bg-muted text-muted-foreground'}`}>
                  <Heart size={18} className={wishlist ? 'fill-danger' : ''} />
                </button>
                <button className="p-2.5 rounded-xl border border-border hover:bg-muted text-muted-foreground transition-colors">
                  <Share2 size={18} />
                </button>
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-foreground mb-2">{PRODUCT.name}</h1>

            <div className="flex items-center gap-3 mb-4">
              <div className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) =>
                <Star key={i} size={14} className={i < Math.floor(PRODUCT.rating) ? 'text-warning fill-warning' : 'text-muted-foreground'} />
                )}
                <span className="font-bold text-sm ml-1">{PRODUCT.rating}</span>
              </div>
              <span className="text-sm text-muted-foreground">({PRODUCT.reviews} reviews)</span>
              <span className="text-sm text-muted-foreground">by <span className="text-primary font-semibold">{PRODUCT.seller}</span></span>
            </div>

            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-3xl font-extrabold text-foreground">₹{PRODUCT.price.toLocaleString('en-IN')}</span>
              <span className="text-lg text-muted-foreground line-through">₹{PRODUCT.mrp.toLocaleString('en-IN')}</span>
              <span className="text-sm font-bold text-success">{discount}% off</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5">{PRODUCT.unit}</p>

            {/* Highlights */}
            <div className="bg-muted/50 rounded-xl p-4 mb-5">
              <p className="text-sm font-bold text-foreground mb-2">Key Highlights</p>
              <ul className="space-y-1.5">
                {PRODUCT.highlights.map((h, i) =>
                <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                    <CheckCircle size={14} className="text-success shrink-0" />
                    {h}
                  </li>
                )}
              </ul>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <span className="text-sm font-semibold text-foreground">Quantity (kg):</span>
              <div className="flex items-center gap-2 border border-border rounded-xl overflow-hidden">
                <button onClick={() => setQty(Math.max(1, qty - 1))}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors">
                  <Minus size={16} />
                </button>
                <span className="w-12 text-center font-bold text-foreground">{qty}</span>
                <button onClick={() => setQty(qty + 1)}
                className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors">
                  <Plus size={16} />
                </button>
              </div>
              <span className="text-sm text-muted-foreground">Total: <strong className="text-foreground">₹{totalAmount.toLocaleString('en-IN')}</strong></span>
            </div>

            {/* CTA Buttons */}
            <div className="flex gap-3 mb-6">
              <button onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold border-2 transition-all ${addedToCart ? 'bg-success/10 border-success text-success' : 'border-primary text-primary hover:bg-primary/5'}`}>
                {addedToCart ? <><CheckCircle size={18} /> Added!</> : <><ShoppingCart size={18} /> Add to Cart</>}
              </button>
              <button onClick={handleBuyNow}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold btn-primary">
                <Zap size={18} /> Buy Now
              </button>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-3 gap-3">
              {[
              { icon: Shield, label: 'Quality Assured', sub: 'Certified seeds' },
              { icon: Truck, label: 'Fast Delivery', sub: '2–4 days' },
              { icon: RotateCcw, label: 'Easy Returns', sub: '7-day policy' }].
              map((badge) =>
              <div key={badge.label} className="flex flex-col items-center text-center p-3 bg-muted/50 rounded-xl">
                  <badge.icon size={18} className="text-primary mb-1" />
                  <p className="text-xs font-semibold text-foreground">{badge.label}</p>
                  <p className="text-xs text-muted-foreground">{badge.sub}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="flex border-b border-border">
            {(['description', 'specs', 'reviews'] as const).map((tab) =>
            <button key={tab} onClick={() => setActiveTab(tab)}
            className={`flex-1 py-4 text-sm font-semibold capitalize transition-colors ${activeTab === tab ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab === 'specs' ? 'Specifications' : tab === 'reviews' ? `Reviews (${PRODUCT.reviews})` : 'Description'}
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === 'description' &&
            <p className="text-foreground leading-relaxed">{PRODUCT.description}</p>
            }

            {activeTab === 'specs' &&
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {Object.entries(PRODUCT.specifications).map(([key, val]) =>
              <div key={key} className="flex justify-between py-2.5 px-4 bg-muted/50 rounded-xl">
                    <span className="text-sm text-muted-foreground">{key}</span>
                    <span className="text-sm font-semibold text-foreground">{val}</span>
                  </div>
              )}
              </div>
            }

            {activeTab === 'reviews' &&
            <div className="space-y-5">
                {PRODUCT.reviews_list.map((rev, i) =>
              <div key={i} className={`pb-5 ${i < PRODUCT.reviews_list.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-sm text-foreground">{rev.name}</p>
                        {rev.verified &&
                    <span className="text-xs text-success bg-success/10 px-2 py-0.5 rounded-full font-medium">✓ Verified</span>
                    }
                      </div>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, j) =>
                    <Star key={j} size={12} className={j < rev.rating ? 'text-warning fill-warning' : 'text-muted-foreground'} />
                    )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">{rev.comment}</p>
                    <p className="text-xs text-muted-foreground mt-1">{rev.date}</p>
                  </div>
              )}
              </div>
            }
          </div>
        </div>
      </main>
      <Footer />

      {/* Buy Now Modal */}
      {showBuyModal &&
      <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
          <div className="bg-card w-full sm:max-w-md rounded-t-3xl sm:rounded-2xl shadow-modal max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-bold text-base text-foreground">{buyDone ? '🎉 Order Confirmed' : 'Buy Now'}</h3>
              <button onClick={() => setShowBuyModal(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">✕</button>
            </div>
            <div className="p-5">
              {!buyDone ?
            <div className="space-y-4">
                  <div className="flex items-center gap-3 bg-muted/40 rounded-xl p-3">
                    <AppImage src={PRODUCT.images[0].src} alt={PRODUCT.images[0].alt} className="w-14 h-14 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-sm">{PRODUCT.name}</p>
                      <p className="text-xs text-muted-foreground">{PRODUCT.seller}</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">Price per kg</span><span className="font-semibold">₹{PRODUCT.price.toLocaleString('en-IN')}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-semibold">{qty} kg</span></div>
                    <div className="flex justify-between border-t border-border pt-2"><span className="font-bold">Total</span><span className="font-bold text-primary text-lg">₹{totalAmount.toLocaleString('en-IN')}</span></div>
                  </div>
                  {payError &&
              <div className="bg-danger/10 border border-danger/20 rounded-xl p-3 text-sm text-danger">{payError}</div>
              }
                  <RazorpayCheckout
                amount={totalAmount}
                description={`Purchase: ${PRODUCT.name} x${qty}kg`}
                receipt={buyReceipt}
                buttonText={`Pay ₹${totalAmount.toLocaleString('en-IN')}`}
                onSuccess={handlePaySuccess}
                onError={handlePayError}
                onDismiss={() => setShowBuyModal(false)} />
              
                </div> :

            <div className="text-center space-y-4 py-4">
                  <div className="w-16 h-16 rounded-full bg-success/15 flex items-center justify-center mx-auto">
                    <CheckCircle size={36} className="text-success" />
                  </div>
                  <div>
                    <p className="font-bold text-lg text-foreground">Order Confirmed!</p>
                    <p className="text-sm text-muted-foreground mt-1">Order ID: <span className="font-bold text-primary">{orderId}</span></p>
                    <p className="text-xs text-muted-foreground mt-1">Payment ID: {paymentId}</p>
                  </div>
                  <div className="bg-muted/40 rounded-xl p-3 text-sm text-left space-y-1">
                    <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-semibold">{PRODUCT.name}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Quantity</span><span className="font-semibold">{qty} kg</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Amount Paid</span><span className="font-bold text-primary">₹{totalAmount.toLocaleString('en-IN')}</span></div>
                  </div>
                  <div className="flex gap-2">
                    <Link href="/account/bookings" className="flex-1 btn-primary py-2.5 rounded-xl font-semibold text-sm text-center">View Orders</Link>
                    <button onClick={() => setShowBuyModal(false)} className="flex-1 btn-secondary py-2.5 rounded-xl font-semibold text-sm">Close</button>
                  </div>
                </div>
            }
            </div>
          </div>
        </div>
      }
    </div>);

}