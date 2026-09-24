'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import { Heart, ShoppingCart, Trash2, Star, MapPin, Package, UserCheck, Phone, ArrowRight } from 'lucide-react';

type WishlistItemType = 'product' | 'labour' | 'equipment';

interface WishlistItem {
  id: string;
  type: WishlistItemType;
  name: string;
  image: string;
  imageAlt: string;
  price: string;
  priceLabel: string;
  rating: number;
  reviews: number;
  badge?: string;
  inStock: boolean;
  meta: string;
  addedOn: string;
}

const INITIAL_WISHLIST: WishlistItem[] = [
{
  id: 'w-001', type: 'product', name: 'DAP Fertilizer (50 Kg)',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c6527fd8-1773210925312.png',
  imageAlt: 'White DAP fertilizer bag with blue label stacked in agricultural supply warehouse',
  price: '₹1,350', priceLabel: 'per bag', rating: 4.6, reviews: 312,
  badge: 'High Yield', inStock: true, meta: 'Krishak Inputs', addedOn: '2 days ago'
},
{
  id: 'w-002', type: 'labour', name: 'Kavita Jadhav',
  image: 'https://images.unsplash.com/photo-1708417145375-ed79c7131fab',
  imageAlt: 'Indian female agricultural worker in colorful saree working in green crop field',
  price: '₹400', priceLabel: 'per day', rating: 4.8, reviews: 47,
  badge: 'Seed Sowing Expert', inStock: true, meta: 'Sinhagad, Pune · 4.1 km', addedOn: '3 days ago'
},
{
  id: 'w-003', type: 'equipment', name: 'Mahindra Yuvo 575 DI Tractor',
  image: 'https://images.unsplash.com/photo-1708417134916-234bb4b33881',
  imageAlt: 'Red Mahindra Yuvo 575 DI tractor in green farm field with blue sky background',
  price: '₹2,500', priceLabel: 'per day', rating: 4.6, reviews: 128,
  badge: 'Available', inStock: true, meta: 'Hadapsar, Pune · 2.4 km', addedOn: '1 week ago'
},
{
  id: 'w-004', type: 'product', name: 'Paddy Seeds — Hybrid IR-64',
  image: 'https://images.unsplash.com/photo-1661396153002-e3d5ed09a0a9',
  imageAlt: 'Green paddy rice seedlings growing in water-filled agricultural nursery field',
  price: '₹950', priceLabel: 'per kg', rating: 4.5, reviews: 234,
  badge: 'Best Seller', inStock: true, meta: 'AgroMart Pune', addedOn: '1 week ago'
},
{
  id: 'w-005', type: 'product', name: 'Neem Cake (5 Kg)',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b3baeab9-1764855371470.png',
  imageAlt: 'Brown neem cake organic fertilizer in burlap sack surrounded by neem leaves',
  price: '₹210', priceLabel: 'per pack', rating: 4.3, reviews: 95,
  badge: 'Natural', inStock: false, meta: 'NatureFarm Store', addedOn: '2 weeks ago'
},
{
  id: 'w-006', type: 'labour', name: 'Prakash Kamble',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1551bdb60-1772435022148.png",
  imageAlt: 'Indian male combine harvester operator in his 35s wearing orange vest in field',
  price: '₹900', priceLabel: 'per day', rating: 4.9, reviews: 118,
  badge: 'Combine Operator', inStock: true, meta: 'Hadapsar, Pune · 2.1 km', addedOn: '2 weeks ago'
}];


const TYPE_LABELS: Record<WishlistItemType, string> = {
  product: 'Agri Product',
  labour: 'Farm Worker',
  equipment: 'Equipment'
};

const TYPE_COLORS: Record<WishlistItemType, string> = {
  product: 'badge-green',
  labour: 'badge-blue',
  equipment: 'badge-amber'
};

export default function WishlistPage() {
  const [items, setItems] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [cartAdded, setCartAdded] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | WishlistItemType>('all');

  function removeItem(id: string) {
    setItems((p) => p.filter((i) => i.id !== id));
  }

  function addToCart(id: string) {
    if (!cartAdded.includes(id)) setCartAdded((p) => [...p, id]);
  }

  function clearAll() {
    setItems([]);
  }

  const filtered = activeTab === 'all' ? items : items.filter((i) => i.type === activeTab);
  const counts = {
    all: items.length,
    product: items.filter((i) => i.type === 'product').length,
    labour: items.filter((i) => i.type === 'labour').length,
    equipment: items.filter((i) => i.type === 'equipment').length
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Heart size={22} className="text-danger fill-danger" />
              <h1 className="text-2xl font-extrabold text-foreground">My Wishlist</h1>
            </div>
            <p className="text-sm text-muted-foreground">{items.length} saved items across equipment, labour & agri supplies</p>
          </div>
          {items.length > 0 &&
          <button suppressHydrationWarning onClick={clearAll} className="flex items-center gap-1.5 text-sm text-danger hover:text-danger/80 font-medium transition-colors">
              <Trash2 size={15} />Clear All
            </button>
          }
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto scrollbar-hide pb-1">
          {(['all', 'product', 'labour', 'equipment'] as const).map((tab) =>
          <button suppressHydrationWarning key={tab} onClick={() => setActiveTab(tab)} className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${activeTab === tab ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>
              {tab === 'all' ? 'All Items' : TYPE_LABELS[tab]}
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground'}`}>{counts[tab]}</span>
            </button>
          )}
        </div>

        {filtered.length === 0 ?
        <div className="card-base p-16 text-center">
            <Heart size={48} className="text-muted-foreground mx-auto mb-4" />
            <h3 className="font-bold text-xl text-foreground mb-2">{items.length === 0 ? 'Your wishlist is empty' : 'No items in this category'}</h3>
            <p className="text-muted-foreground text-sm mb-6">{items.length === 0 ? 'Save equipment, workers, and products you love to find them easily later.' : 'Switch to another tab to see your saved items.'}</p>
            {items.length === 0 &&
          <div className="flex flex-wrap gap-3 justify-center">
                <Link href="/equipment-listing-page" className="btn-primary">Browse Equipment</Link>
                <Link href="/labour" className="btn-secondary">Find Labour</Link>
                <Link href="/agri" className="btn-secondary">Agri Supplies</Link>
              </div>
          }
          </div> :

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((item) =>
          <div key={item.id} className="card-base card-hover overflow-hidden group">
                <div className="relative h-44 overflow-hidden">
                  <AppImage src={item.image} alt={item.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                  <button suppressHydrationWarning onClick={() => removeItem(item.id)} className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-danger hover:bg-danger hover:text-white transition-all">
                    <Heart size={14} fill="currentColor" />
                  </button>
                  <div className="absolute top-2.5 left-2.5">
                    <span className={`${TYPE_COLORS[item.type]} text-xs`}>{TYPE_LABELS[item.type]}</span>
                  </div>
                  {!item.inStock &&
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <span className="bg-danger text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
                    </div>
              }
                  <div className="absolute bottom-2.5 left-2.5 right-2.5">
                    <p className="text-white text-xs font-medium">{item.addedOn}</p>
                  </div>
                </div>

                <div className="p-4">
                  {item.badge && <span className="badge-amber text-xs mb-1.5 inline-block">{item.badge}</span>}
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug mb-1">{item.name}</h3>

                  <div className="flex items-center gap-1.5 mb-2">
                    <Star size={12} className="text-accent fill-accent" />
                    <span className="text-xs font-semibold font-tabular">{item.rating}</span>
                    <span className="text-xs text-muted-foreground">({item.reviews})</span>
                  </div>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    {item.type === 'labour' || item.type === 'equipment' ? <MapPin size={11} className="text-primary" /> : <Package size={11} className="text-primary" />}
                    <span className="line-clamp-1">{item.meta}</span>
                  </div>

                  <div className="flex items-baseline gap-1 mb-4">
                    <p className="text-lg font-bold text-primary font-tabular">{item.price}</p>
                    <p className="text-xs text-muted-foreground">{item.priceLabel}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {item.type === 'labour' ?
                <>
                        <Link href={`/labour/${item.id.replace('w-', 'lab-0')}`} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${item.inStock ? 'gradient-green text-white hover:opacity-90 btn-press' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}>
                          <UserCheck size={12} />Hire
                        </Link>
                        <a href="tel:+911800123KISAN" className="btn-secondary text-xs py-2 gap-1.5 flex items-center justify-center">
                          <Phone size={12} />Call
                        </a>
                      </> :

                <>
                        <Link href={item.type === 'equipment' ? `/equipment/${item.id.replace('w-', 'eq-0')}` : `/agri/${item.id.replace('w-', 'agri-0')}`} className={`text-xs py-2 rounded-lg font-semibold transition-all btn-press text-center ${item.inStock ? 'gradient-green text-white hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}>
                          {item.type === 'equipment' ? 'Rent Now' : 'Buy Now'}
                        </Link>
                        <button suppressHydrationWarning disabled={!item.inStock || item.type !== 'product'} onClick={() => item.type === 'product' && addToCart(item.id)} className={`flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-semibold border-2 transition-all btn-press ${cartAdded.includes(item.id) ? 'border-success text-success bg-success-bg' : item.inStock && item.type === 'product' ? 'border-primary text-primary hover:bg-secondary' : 'border-muted text-muted-foreground cursor-not-allowed'}`}>
                          <ShoppingCart size={12} />
                          {cartAdded.includes(item.id) ? 'Added' : 'Cart'}
                        </button>
                      </>
                }
                  </div>

                  <button suppressHydrationWarning onClick={() => removeItem(item.id)} className="w-full mt-2 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-danger transition-colors py-1.5">
                    <Trash2 size={12} />Remove from wishlist
                  </button>
                </div>
              </div>
          )}
          </div>
        }

        {/* Browse More */}
        {items.length > 0 &&
        <div className="mt-10 card-base p-6 bg-secondary/50">
            <h3 className="font-bold text-foreground mb-3">Continue Browsing</h3>
            <div className="flex flex-wrap gap-3">
              <Link href="/equipment-listing-page" className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Browse Equipment <ArrowRight size={14} /></Link>
              <Link href="/labour" className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Find Labour <ArrowRight size={14} /></Link>
              <Link href="/agri" className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline">Agri Supplies <ArrowRight size={14} /></Link>
            </div>
          </div>
        }
      </main>
      <Footer />
    </div>);

}