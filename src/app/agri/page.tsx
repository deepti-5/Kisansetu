'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import { Search, X, Star, Heart, ShoppingCart, Package, Check, Leaf } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface Product { id: string; name: string; category: string; image: string; imageAlt: string; price: number; mrp: number; unit: string; rating: number; reviews: number; seller: string; inStock: boolean; badge?: string; tags: string[]; }

const ALL_PRODUCTS: Product[] = [
  { id: 'agri-001', name: 'Paddy Seeds — Hybrid IR-64', category: 'Seeds', image: 'https://images.unsplash.com/photo-1661396153002-e3d5ed09a0a9', imageAlt: 'Green paddy rice seedlings growing in water-filled agricultural nursery field', price: 950, mrp: 1100, unit: 'per kg', rating: 4.5, reviews: 234, seller: 'AgroMart Pune', inStock: true, badge: 'Best Seller', tags: ['organic', 'high-yield'] },
  { id: 'agri-002', name: 'Organic Pesticide (1 Ltr)', category: 'Pesticides', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1a4e63949-1764677535125.png', imageAlt: 'Green pesticide spray bottle with organic certification label on white background', price: 320, mrp: 380, unit: 'per bottle', rating: 4.4, reviews: 178, seller: 'GreenShield Agro', inStock: true, badge: 'Organic', tags: ['organic', 'eco-friendly'] },
  { id: 'agri-003', name: 'DAP Fertilizer (50 Kg)', category: 'Fertilizers', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c6527fd8-1773210925312.png', imageAlt: 'White DAP fertilizer bag with blue label stacked in agricultural supply warehouse', price: 1350, mrp: 1500, unit: 'per bag', rating: 4.6, reviews: 312, seller: 'Krishak Inputs', inStock: true, badge: 'High Yield', tags: ['high-yield'] },
  { id: 'agri-004', name: 'Neem Cake (5 Kg)', category: 'Crop Care', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b3baeab9-1764855371470.png', imageAlt: 'Brown neem cake organic fertilizer in burlap sack surrounded by neem leaves', price: 210, mrp: 250, unit: 'per pack', rating: 4.3, reviews: 95, seller: 'NatureFarm Store', inStock: false, badge: 'Natural', tags: ['organic', 'eco-friendly'] },
  { id: 'agri-005', name: 'Wheat Seeds — HD-2967', category: 'Seeds', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_196405c92-1772059982644.png', imageAlt: 'Golden wheat seeds in a wooden bowl with wheat stalks in background', price: 780, mrp: 900, unit: 'per kg', rating: 4.7, reviews: 189, seller: 'AgroMart Pune', inStock: true, badge: 'Premium', tags: ['high-yield'] },
  { id: 'agri-006', name: 'Urea Fertilizer (45 Kg)', category: 'Fertilizers', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1efa0b162-1767018520192.png', imageAlt: 'White urea fertilizer granules in open bag in agricultural warehouse', price: 1100, mrp: 1200, unit: 'per bag', rating: 4.2, reviews: 267, seller: 'Krishak Inputs', inStock: true, tags: ['high-yield'] },
  { id: 'agri-007', name: 'Chlorpyrifos 20% EC (1 Ltr)', category: 'Pesticides', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_12663dcce-1771271995876.png', imageAlt: 'Agricultural pesticide bottle with yellow label on white background', price: 450, mrp: 520, unit: 'per bottle', rating: 4.1, reviews: 143, seller: 'GreenShield Agro', inStock: true, tags: [] },
  { id: 'agri-008', name: 'Vermicompost (10 Kg)', category: 'Fertilizers', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1006394c4-1767472778777.png', imageAlt: 'Dark brown vermicompost organic fertilizer in open bag with earthworms visible', price: 350, mrp: 400, unit: 'per bag', rating: 4.8, reviews: 82, seller: 'NatureFarm Store', inStock: true, badge: 'Organic', tags: ['organic', 'eco-friendly'] },
  { id: 'agri-009', name: 'Drip Irrigation Kit (1 Acre)', category: 'Tools & Equipment', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_19cfa9045-1772387560531.png', imageAlt: 'Drip irrigation system with black tubes and emitters installed in vegetable farm', price: 4500, mrp: 5500, unit: 'per kit', rating: 4.5, reviews: 56, seller: 'IrriTech Solutions', inStock: true, badge: 'Save Water', tags: ['eco-friendly'] },
  { id: 'agri-010', name: 'Tomato Seeds F1 Hybrid', category: 'Seeds', image: 'https://images.unsplash.com/photo-1689495203267-81dd1f2d8202', imageAlt: 'Red ripe tomatoes on vine in greenhouse with green leaves', price: 280, mrp: 320, unit: 'per 10g pack', rating: 4.6, reviews: 201, seller: 'AgroMart Pune', inStock: true, tags: ['high-yield'] },
  { id: 'agri-011', name: 'Hand Sprayer (16 Ltr)', category: 'Tools & Equipment', image: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d', imageAlt: 'Blue hand-operated backpack sprayer for agricultural pesticide application', price: 1200, mrp: 1500, unit: 'per unit', rating: 4.3, reviews: 167, seller: 'FarmTools India', inStock: true, tags: [] },
  { id: 'agri-012', name: 'Bio-Fungicide (500ml)', category: 'Crop Care', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1e0265782-1784879752762.png', imageAlt: 'Green bio-fungicide bottle with organic label on white background', price: 390, mrp: 450, unit: 'per bottle', rating: 4.4, reviews: 78, seller: 'GreenShield Agro', inStock: true, badge: 'Bio', tags: ['organic', 'eco-friendly'] },
];

const CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Crop Care', 'Tools & Equipment'];

export default function AgriPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [inStockOnly, setInStockOnly] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);

  function toggleWish(id: string) { setWishlist((p) => p.includes(id) ? p.filter((w) => w !== id) : [...p, id]); }
  function addToCart(id: string, name: string) { if (!cart.includes(id)) { setCart((p) => [...p, id]); toast.success(`${name} added to cart`); } }

  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchStock = !inStockOnly || p.inStock;
      const matchOrganic = !organicOnly || p.tags.includes('organic');
      return matchSearch && matchCat && matchStock && matchOrganic;
    });
    list.sort((a, b) => sortBy === 'popular' ? b.reviews - a.reviews : sortBy === 'price_asc' ? a.price - b.price : sortBy === 'price_desc' ? b.price - a.price : b.rating - a.rating);
    return list;
  }, [search, selectedCategory, sortBy, inStockOnly, organicOnly]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Agri Supplies</h1>
          <p className="text-sm text-muted-foreground mt-0.5"><span className="font-semibold text-primary font-tabular">{filtered.length}</span> products found</p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary mb-4">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search seeds, fertilizers, pesticides..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          {search && <button onClick={() => setSearch('')} className="p-1 rounded hover:bg-muted"><X size={14} className="text-muted-foreground" /></button>}
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedCategory === cat ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>{cat}</button>)}
          </div>
          <div className="flex items-center gap-3 ml-auto flex-wrap">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground focus:outline-none cursor-pointer">
              <option value="popular">Most Popular</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Top Rated</option>
            </select>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
              <div onClick={() => setInStockOnly(!inStockOnly)} className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${inStockOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}><div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${inStockOnly ? 'translate-x-4' : 'translate-x-0.5'}`} /></div>
              In Stock
            </label>
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-foreground">
              <div onClick={() => setOrganicOnly(!organicOnly)} className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${organicOnly ? 'bg-success' : 'bg-muted-foreground/30'}`}><div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${organicOnly ? 'translate-x-4' : 'translate-x-0.5'}`} /></div>
              <Leaf size={12} className="text-success" />Organic
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((product) => {
            const discount = Math.round((product.mrp - product.price) / product.mrp * 100);
            return (
              <div key={product.id} className="card-base card-hover overflow-hidden group">
                <div className="relative h-40 overflow-hidden">
                  <AppImage src={product.image} alt={product.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                  <button suppressHydrationWarning onClick={() => toggleWish(product.id)} className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${wishlist.includes(product.id) ? 'bg-danger text-white' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white'}`}>
                    <Heart size={14} fill={wishlist.includes(product.id) ? 'currentColor' : 'none'} />
                  </button>
                  {product.badge && <div className="absolute top-2.5 left-2.5"><span className="badge-amber text-xs">{product.badge}</span></div>}
                  {discount > 0 && <div className="absolute bottom-2.5 right-2.5"><span className="bg-danger text-white text-xs font-bold px-1.5 py-0.5 rounded">{discount}% off</span></div>}
                  {!product.inStock && <div className="absolute inset-0 bg-black/40 flex items-center justify-center"><span className="bg-danger text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span></div>}
                </div>
                <div className="p-4">
                  <div className="mb-1"><span className="badge-green text-xs mb-1.5 inline-block">{product.category}</span><h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug">{product.name}</h3></div>
                  <div className="flex items-center gap-1.5 mb-2"><Star size={12} className="text-accent fill-accent" /><span className="text-xs font-semibold font-tabular">{product.rating}</span><span className="text-xs text-muted-foreground">({product.reviews})</span></div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3"><Package size={11} className="text-primary" />{product.seller}</div>
                  <div className="flex items-end justify-between mb-3">
                    <div><p className="text-xs text-muted-foreground">{product.unit}</p><div className="flex items-baseline gap-1.5"><p className="text-lg font-bold text-primary font-tabular">₹{product.price}</p>{product.mrp > product.price && <p className="text-xs text-muted-foreground line-through font-tabular">₹{product.mrp}</p>}</div></div>
                    <span className="text-xs text-success font-medium">Free delivery</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/agri/${product.id}`} className={`text-xs py-2 rounded-lg font-semibold transition-all btn-press text-center ${product.inStock ? 'gradient-green text-white hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}>Buy Now</Link>
                    <button suppressHydrationWarning disabled={!product.inStock || cart.includes(product.id)} onClick={() => addToCart(product.id, product.name)} className={`flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-semibold border-2 transition-all btn-press ${cart.includes(product.id) ? 'border-success text-success bg-success-bg' : product.inStock ? 'border-primary text-primary hover:bg-secondary' : 'border-muted text-muted-foreground cursor-not-allowed'}`}>
                      {cart.includes(product.id) ? <><Check size={12} />Added</> : <><ShoppingCart size={12} />Cart</>}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20"><div className="text-5xl mb-4">🌱</div><h3 className="font-bold text-lg text-foreground mb-2">No Products Found</h3><p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p></div>
        )}
      </main>
      <Footer />
    </div>
  );
}
