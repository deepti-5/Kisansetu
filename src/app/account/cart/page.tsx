'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import RazorpayCheckout, { PaymentResult } from '@/components/RazorpayCheckout';
import { ShoppingCart, Trash2, Plus, Minus, Package, Tag, ShieldCheck, Truck, ArrowRight, CheckCircle } from 'lucide-react';

interface CartItem { id: string; name: string; image: string; imageAlt: string; price: number; mrp: number; unit: string; seller: string; quantity: number; inStock: boolean; category: string; }

const INITIAL_CART: CartItem[] = [
  { id: 'c-001', name: 'DAP Fertilizer (50 Kg)', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c6527fd8-1773210925312.png', imageAlt: 'White DAP fertilizer bag with blue label stacked in agricultural supply warehouse', price: 1350, mrp: 1500, unit: 'per bag', seller: 'Krishak Inputs', quantity: 2, inStock: true, category: 'Fertilizers' },
  { id: 'c-002', name: 'Paddy Seeds — Hybrid IR-64', image: 'https://images.unsplash.com/photo-1661396153002-e3d5ed09a0a9', imageAlt: 'Green paddy rice seedlings growing in water-filled agricultural nursery field', price: 950, mrp: 1100, unit: 'per kg', seller: 'AgroMart Pune', quantity: 3, inStock: true, category: 'Seeds' },
  { id: 'c-003', name: 'Organic Pesticide (1 Ltr)', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1a4e63949-1764677535125.png', imageAlt: 'Green pesticide spray bottle with organic certification label on white background', price: 320, mrp: 380, unit: 'per bottle', seller: 'GreenShield Agro', quantity: 1, inStock: true, category: 'Pesticides' },
];

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>(INITIAL_CART);
  const [coupon, setCoupon] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponError, setCouponError] = useState('');
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentResult, setPaymentResult] = useState<PaymentResult | null>(null);

  function updateQty(id: string, delta: number) { setItems((p) => p.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item)); }
  function removeItem(id: string) { setItems((p) => p.filter((item) => item.id !== id)); }

  function applyCoupon() {
    if (coupon.toUpperCase() === 'KISAN10') { setAppliedCoupon('KISAN10'); setCouponError(''); }
    else if (coupon.toUpperCase() === 'MONSOON20') { setAppliedCoupon('MONSOON20'); setCouponError(''); }
    else { setCouponError('Invalid coupon code. Try KISAN10 or MONSOON20'); setAppliedCoupon(''); }
  }

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const mrpTotal = items.reduce((sum, item) => sum + item.mrp * item.quantity, 0);
  const savings = mrpTotal - subtotal;
  const deliveryFee = subtotal >= 2000 ? 0 : 99;
  const couponDiscount = appliedCoupon === 'KISAN10' ? Math.round(subtotal * 0.1) : appliedCoupon === 'MONSOON20' ? Math.round(subtotal * 0.2) : 0;
  const total = subtotal + deliveryFee - couponDiscount;

  if (paymentDone && paymentResult) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="max-w-lg mx-auto px-4 py-16 text-center">
          <div className="card-base p-10">
            <div className="w-20 h-20 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-5"><CheckCircle size={40} className="text-success" /></div>
            <h2 className="text-2xl font-extrabold text-foreground mb-2">Order Placed!</h2>
            <p className="text-muted-foreground mb-1">Your payment was successful.</p>
            <p className="text-sm text-muted-foreground mb-6">Payment ID: <span className="font-semibold text-foreground font-tabular">{paymentResult.paymentId}</span></p>
            <div className="bg-muted/50 rounded-xl p-4 text-left mb-6 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Amount Paid</span><span className="font-bold text-primary font-tabular">₹{total.toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-muted-foreground">Estimated Delivery</span><span className="font-semibold text-foreground">3–5 Business Days</span></div>
            </div>
            <div className="flex flex-col gap-3">
              <Link href="/account/bookings" className="btn-primary w-full justify-center">View My Orders</Link>
              <Link href="/agri" className="btn-secondary w-full justify-center">Continue Shopping</Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingCart size={22} className="text-primary" />
          <h1 className="text-2xl font-extrabold text-foreground">My Cart</h1>
          {items.length > 0 && <span className="badge-green">{items.length} items</span>}
        </div>

        {items.length === 0 ? (
          <div className="card-base p-16 text-center max-w-lg mx-auto">
            <ShoppingCart size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-xl text-foreground mb-2">Your cart is empty</h3>
            <p className="text-muted-foreground text-sm mb-6">Add seeds, fertilizers, pesticides and more from our Agri Supplies store.</p>
            <Link href="/agri" className="btn-primary inline-flex">Browse Agri Supplies <ArrowRight size={16} /></Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 min-w-0 space-y-3">
              {items.map((item) => {
                const itemTotal = item.price * item.quantity;
                const itemMrp = item.mrp * item.quantity;
                const itemDiscount = Math.round((item.mrp - item.price) / item.mrp * 100);
                return (
                  <div key={item.id} className="card-base p-4">
                    <div className="flex gap-4">
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden shrink-0"><AppImage src={item.image} alt={item.imageAlt} fill className="object-cover" /></div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="badge-green text-xs mb-1 inline-block">{item.category}</span>
                            <h3 className="font-bold text-sm text-foreground line-clamp-2">{item.name}</h3>
                            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5"><Package size={11} className="text-primary" />{item.seller}</p>
                          </div>
                          <button suppressHydrationWarning onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-danger-bg text-muted-foreground hover:text-danger transition-colors shrink-0"><Trash2 size={15} /></button>
                        </div>
                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <button suppressHydrationWarning onClick={() => updateQty(item.id, -1)} disabled={item.quantity <= 1} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Minus size={13} /></button>
                            <span className="w-8 text-center font-bold text-sm font-tabular">{item.quantity}</span>
                            <button suppressHydrationWarning onClick={() => updateQty(item.id, 1)} className="w-7 h-7 rounded-lg border border-border flex items-center justify-center hover:bg-muted transition-colors"><Plus size={13} /></button>
                            <span className="text-xs text-muted-foreground">{item.unit}</span>
                          </div>
                          <div className="text-right">
                            <div className="flex items-baseline gap-1.5"><p className="font-bold text-base text-primary font-tabular">₹{itemTotal.toLocaleString('en-IN')}</p>{itemMrp > itemTotal && <p className="text-xs text-muted-foreground line-through font-tabular">₹{itemMrp.toLocaleString('en-IN')}</p>}</div>
                            {itemDiscount > 0 && <p className="text-xs text-success font-medium">{itemDiscount}% off</p>}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              <div className="card-base p-4">
                <div className="flex items-center gap-2 mb-3"><Tag size={16} className="text-primary" /><h3 className="font-semibold text-sm text-foreground">Apply Coupon</h3></div>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between bg-success-bg border border-success/30 rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2"><CheckCircle size={16} className="text-success" /><span className="font-bold text-sm text-success">{appliedCoupon}</span><span className="text-xs text-success">— {appliedCoupon === 'KISAN10' ? '10%' : '20%'} discount applied!</span></div>
                    <button suppressHydrationWarning onClick={() => { setAppliedCoupon(''); setCoupon(''); }} className="text-xs text-danger font-medium hover:underline">Remove</button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input type="text" placeholder="Enter coupon code (try KISAN10)" value={coupon} onChange={(e) => { setCoupon(e.target.value.toUpperCase()); setCouponError(''); }} className="input-field flex-1 uppercase" />
                    <button suppressHydrationWarning onClick={applyCoupon} disabled={!coupon} className="btn-secondary px-5 shrink-0 disabled:opacity-50">Apply</button>
                  </div>
                )}
                {couponError && <p className="text-xs text-danger mt-2">{couponError}</p>}
              </div>

              <div className="card-base p-4 bg-secondary/40">
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Truck size={16} className="text-primary" />
                  {deliveryFee === 0 ? <span><span className="font-semibold text-success">Free delivery</span> on this order!</span> : <span>Add <span className="font-semibold text-primary">₹{(2000 - subtotal).toLocaleString('en-IN')}</span> more for free delivery</span>}
                </div>
              </div>
            </div>

            <div className="lg:w-80 xl:w-96 shrink-0">
              <div className="card-base p-5 sticky top-20">
                <h3 className="font-bold text-base text-foreground mb-4">Order Summary</h3>
                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span className="font-semibold font-tabular">₹{subtotal.toLocaleString('en-IN')}</span></div>
                  {savings > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">You save</span><span className="font-semibold text-success font-tabular">-₹{savings.toLocaleString('en-IN')}</span></div>}
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Delivery</span><span className={`font-semibold font-tabular ${deliveryFee === 0 ? 'text-success' : ''}`}>{deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}</span></div>
                  {couponDiscount > 0 && <div className="flex justify-between text-sm"><span className="text-muted-foreground">Coupon ({appliedCoupon})</span><span className="font-semibold text-success font-tabular">-₹{couponDiscount.toLocaleString('en-IN')}</span></div>}
                  <div className="border-t border-border pt-3 flex justify-between"><span className="font-bold text-foreground">Total</span><span className="font-bold text-xl text-primary font-tabular">₹{total.toLocaleString('en-IN')}</span></div>
                </div>
                <RazorpayCheckout amount={total} description="KisanSetu Agri Supplies Order" buttonText={`Pay ₹${total.toLocaleString('en-IN')}`} onSuccess={(result) => { setPaymentResult(result); setPaymentDone(true); setItems([]); }} onError={(err) => console.error(err)} />
                <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground"><ShieldCheck size={13} className="text-success" />100% secure payments via Razorpay</div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
