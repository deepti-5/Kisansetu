'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { Star, Heart, ArrowRight, ShoppingCart, Package } from 'lucide-react';
import { toast } from 'sonner';

const AGRI_PRODUCTS = [
  { id: 'agri-001', name: 'Paddy Seeds — Hybrid', category: 'Seeds', image: 'https://images.unsplash.com/photo-1661396153002-e3d5ed09a0a9', imageAlt: 'Green paddy rice seedlings growing in water-filled agricultural nursery field', price: 950, unit: 'per kg', rating: 4.5, reviews: 234, seller: 'AgroMart Pune', inStock: true, badge: 'Best Seller' },
  { id: 'agri-002', name: 'Organic Pesticide (1 Ltr)', category: 'Pesticides', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1a4e63949-1764677535125.png', imageAlt: 'Green pesticide spray bottle with organic certification label on white background', price: 320, unit: 'per bottle', rating: 4.4, reviews: 178, seller: 'GreenShield Agro', inStock: true, badge: 'Organic' },
  { id: 'agri-003', name: 'DAP Fertilizer (50 Kg)', category: 'Fertilizers', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c6527fd8-1773210925312.png', imageAlt: 'White DAP fertilizer bag with blue label stacked in agricultural supply warehouse', price: 1350, unit: 'per bag', rating: 4.6, reviews: 312, seller: 'Krishak Inputs', inStock: true, badge: 'High Yield' },
  { id: 'agri-004', name: 'Neem Cake (5 Kg)', category: 'Crop Care', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b3baeab9-1764855371470.png', imageAlt: 'Brown neem cake organic fertilizer in burlap sack surrounded by neem leaves', price: 210, unit: 'per pack', rating: 4.3, reviews: 95, seller: 'NatureFarm Store', inStock: false, badge: 'Natural' },
];

export default function FeaturedAgri() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartAdded, setCartAdded] = useState<string[]>([]);

  function toggleWish(id: string) {
    setWishlist((prev) => prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]);
  }

  function addToCart(id: string, name: string) {
    setCartAdded((prev) => [...prev, id]);
    toast.success(`${name} added to cart`);
  }

  return (
    <section className="py-10 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🌱</span>
              <h2 className="section-title">Agri Supplies</h2>
            </div>
            <p className="section-subtitle">Seeds, Pesticides, Fertilizers — delivered near Pune, MH</p>
          </div>
          <Link href="/agri" className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View All Products <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {AGRI_PRODUCTS.map((product) => (
            <div key={product.id} className="card-base card-hover overflow-hidden group">
              <div className="relative h-40 overflow-hidden">
                <AppImage src={product.image} alt={product.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                <button
                  suppressHydrationWarning
                  onClick={() => toggleWish(product.id)}
                  className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wishlist.includes(product.id) ? 'bg-danger text-white' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white'}`}
                >
                  <Heart size={14} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="absolute top-2.5 left-2.5">
                  <span className="badge-amber text-xs">{product.badge}</span>
                </div>
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-danger text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="mb-1">
                  <span className="badge-green text-xs mb-1.5 inline-block">{product.category}</span>
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">{product.name}</h3>
                </div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Star size={12} className="text-accent fill-accent" />
                  <span className="text-xs font-semibold font-tabular">{product.rating}</span>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <Package size={11} className="text-primary" />
                  {product.seller}
                </div>
                <div className="flex items-end justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">{product.unit}</p>
                    <p className="text-lg font-bold text-primary font-tabular">₹{product.price}</p>
                  </div>
                  <span className="text-xs text-success font-medium">Free delivery</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href={`/agri/${product.id}`}
                    className={`text-xs py-2 rounded-lg font-semibold transition-all btn-press text-center ${product.inStock ? 'gradient-green text-white hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}
                  >
                    Buy Now
                  </Link>
                  <button
                    suppressHydrationWarning
                    disabled={!product.inStock || cartAdded.includes(product.id)}
                    onClick={() => addToCart(product.id, product.name)}
                    className={`flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-semibold border-2 transition-all btn-press ${cartAdded.includes(product.id) ? 'border-success text-success bg-success-bg' : product.inStock ? 'border-primary text-primary hover:bg-secondary' : 'border-muted text-muted-foreground cursor-not-allowed'}`}
                  >
                    <ShoppingCart size={12} />
                    {cartAdded.includes(product.id) ? 'Added' : 'Add to Cart'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
