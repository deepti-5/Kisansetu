'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Star, MapPin, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

type WishlistItemType = 'product' | 'labour' | 'equipment';
interface WishlistItem { id: string; type: WishlistItemType; name: string; image: string; imageAlt: string; price: string; priceLabel: string; rating: number; reviews: number; badge?: string; inStock: boolean; meta: string; addedOn: string; }

const INITIAL_WISHLIST: WishlistItem[] = [
  { id: 'w-001', type: 'product', name: 'DAP Fertilizer (50 Kg)', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c6527fd8-1773210925312.png', imageAlt: 'White DAP fertilizer bag with blue label stacked in agricultural supply warehouse', price: '₹1,350', priceLabel: 'per bag', rating: 4.6, reviews: 312, badge: 'High Yield', inStock: true, meta: 'Krishak Inputs', addedOn: '2 days ago' },
  { id: 'w-002', type: 'labour', name: 'Kavita Jadhav', image: 'https://images.unsplash.com/photo-1708417145375-ed79c7131fab', imageAlt: 'Indian female agricultural worker in colorful saree working in green crop field', price: '₹400', priceLabel: 'per day', rating: 4.8, reviews: 47, badge: 'Seed Sowing Expert', inStock: true, meta: 'Sinhagad, Pune · 4.1 km', addedOn: '3 days ago' },
  { id: 'w-003', type: 'equipment', name: 'Mahindra Yuvo 575 DI Tractor', image: 'https://images.unsplash.com/photo-1708417134916-234bb4b33881', imageAlt: 'Red Mahindra Yuvo 575 DI tractor in green farm field with blue sky background', price: '₹2,500', priceLabel: 'per day', rating: 4.6, reviews: 128, badge: 'Available', inStock: true, meta: 'Hadapsar, Pune · 2.4 km', addedOn: '1 week ago' },
  { id: 'w-004', type: 'product', name: 'Paddy Seeds — Hybrid IR-64', image: 'https://images.unsplash.com/photo-1661396153002-e3d5ed09a0a9', imageAlt: 'Green paddy rice seedlings growing in water-filled agricultural nursery field', price: '₹950', priceLabel: 'per kg', rating: 4.5, reviews: 234, badge: 'Best Seller', inStock: true, meta: 'AgroMart Pune', addedOn: '1 week ago' },
];

export default function WishlistPage() {
  const { t } = useLanguage();
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [cartAdded, setCartAdded] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | WishlistItemType>('all');

  const TYPE_LABELS: Record<WishlistItemType, string> = {
    product: t('agriProduct'),
    labour: t('farmWorker'),
    equipment: t('equipment'),
  };

  function removeItem(id: string) { setItems((p) => p.filter((i) => i.id !== id)); }
  function addToCart(id: string) { if (!cartAdded.includes(id)) setCartAdded((p) => [...p, id]); }

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.type === activeTab);
  const counts = { all: items.length, product: items.filter((i) => i.type === 'product').length, labour: items.filter((i) => i.type === 'labour').length, equipment: items.filter((i) => i.type === 'equipment').length };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1"><Heart size={22} className="text-danger fill-danger" /><h1 className="text-2xl font-extrabold text-foreground">{t('myWishlist')}</h1></div>
            <p className="text-sm text-muted-foreground">{items.length} {t('savedItems')}</p>
          </div>
          {items.length > 0 && <button suppressHydrationWarning onClick={() => setItems([])} className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 font-medium transition-colors"><Trash2 size={15} />{t('clearAllWishlist')}</button>}
        </div>
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {(['all', 'product', 'labour', 'equipment'] as const).map((tab) => (
            <button suppressHydrationWarning key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeTab === tab ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>
              {tab === 'all' ? t('allItems') : TYPE_LABELS[tab]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>{counts[tab]}</span>
            </button>
          ))}
        </div>
        {filtered.length === 0 ? (
          <div className="card-base p-16 text-center">
            <Heart size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-xl text-foreground mb-2">{t('wishlistEmpty')}</h3>
            <p className="text-muted-foreground text-sm mb-6">{t('wishlistEmptyDesc')}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link href="/equipment-listing-page" className="btn-primary">{t('browseEquipment')}</Link>
              <Link href="/agri" className="btn-secondary">{t('agriSupplies')}</Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) => (
              <div key={item.id} className="bg-card rounded-2xl border border-border overflow-hidden group">
                <div className="relative h-44 overflow-hidden">
                  <AppImage src={item.image} alt={item.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <button suppressHydrationWarning onClick={() => removeItem(item.id)} className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-danger hover:text-white transition-colors"><Trash2 size={14} /></button>
                  {item.badge && <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-primary text-white text-xs font-bold">{item.badge}</span>}
                </div>
                <div className="p-4">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full mb-2 inline-block ${item.type === 'product' ? 'bg-amber-100 text-amber-700' : item.type === 'labour' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'}`}>{TYPE_LABELS[item.type]}</span>
                  <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-2">{item.name}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    <Star size={12} className="text-accent fill-accent" />
                    <span className="text-xs font-semibold text-foreground">{item.rating}</span>
                    <span className="text-xs text-muted-foreground">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <MapPin size={11} />{item.meta}
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <div><span className="font-extrabold text-base text-primary">{item.price}</span><span className="text-xs text-muted-foreground ml-1">{item.priceLabel}</span></div>
                    <span className={`text-xs font-semibold ${item.inStock ? 'text-success' : 'text-danger'}`}>{item.inStock ? t('inStock') : t('outOfStock')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button suppressHydrationWarning onClick={() => addToCart(item.id)} className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-semibold transition-all ${cartAdded.includes(item.id) ? 'bg-success/10 text-success' : 'btn-primary'}`}>
                      <ShoppingCart size={13} />{cartAdded.includes(item.id) ? t('addedToCart') : t('addToCart')}
                    </button>
                    <button suppressHydrationWarning className="p-2 rounded-xl border border-border hover:bg-muted transition-colors"><ArrowRight size={14} className="text-muted-foreground" /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
