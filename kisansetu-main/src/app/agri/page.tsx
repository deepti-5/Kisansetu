'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import {
  Search, X, Star, Heart, ShoppingCart, Package, Filter,
  ArrowUpDown, ChevronDown, ChevronUp, Check, Leaf } from
'lucide-react';
import Link from 'next/link';

interface Product {
  id: string;
  name: string;
  category: string;
  image: string;
  imageAlt: string;
  price: number;
  mrp: number;
  unit: string;
  rating: number;
  reviews: number;
  seller: string;
  inStock: boolean;
  badge?: string;
  description: string;
  tags: string[];
}

const ALL_PRODUCTS: Product[] = [
{
  id: 'agri-001', name: 'Paddy Seeds — Hybrid IR-64', category: 'Seeds',
  image: 'https://images.unsplash.com/photo-1661396153002-e3d5ed09a0a9',
  imageAlt: 'Green paddy rice seedlings growing in water-filled agricultural nursery field',
  price: 950, mrp: 1100, unit: 'per kg', rating: 4.5, reviews: 234,
  seller: 'AgroMart Pune', inStock: true, badge: 'Best Seller',
  description: 'High-yield hybrid paddy seeds suitable for Kharif season', tags: ['organic', 'high-yield']
},
{
  id: 'agri-002', name: 'Organic Pesticide (1 Ltr)', category: 'Pesticides',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1a4e63949-1764677535125.png',
  imageAlt: 'Green pesticide spray bottle with organic certification label on white background',
  price: 320, mrp: 380, unit: 'per bottle', rating: 4.4, reviews: 178,
  seller: 'GreenShield Agro', inStock: true, badge: 'Organic',
  description: 'OMRI-listed organic pesticide safe for all crops', tags: ['organic', 'eco-friendly']
},
{
  id: 'agri-003', name: 'DAP Fertilizer (50 Kg)', category: 'Fertilizers',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1c6527fd8-1773210925312.png',
  imageAlt: 'White DAP fertilizer bag with blue label stacked in agricultural supply warehouse',
  price: 1350, mrp: 1500, unit: 'per bag', rating: 4.6, reviews: 312,
  seller: 'Krishak Inputs', inStock: true, badge: 'High Yield',
  description: 'Di-Ammonium Phosphate for strong root development', tags: ['high-yield']
},
{
  id: 'agri-004', name: 'Neem Cake (5 Kg)', category: 'Crop Care',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1b3baeab9-1764855371470.png',
  imageAlt: 'Brown neem cake organic fertilizer in burlap sack surrounded by neem leaves',
  price: 210, mrp: 250, unit: 'per pack', rating: 4.3, reviews: 95,
  seller: 'NatureFarm Store', inStock: false, badge: 'Natural',
  description: 'Natural soil conditioner and pest repellent', tags: ['organic', 'eco-friendly']
},
{
  id: 'agri-005', name: 'Wheat Seeds — HD-2967', category: 'Seeds',
  image: "https://images.unsplash.com/photo-1630349592160-2ccf1174f126",
  imageAlt: 'Golden wheat seeds in a wooden bowl with wheat stalks in background',
  price: 780, mrp: 900, unit: 'per kg', rating: 4.7, reviews: 189,
  seller: 'AgroMart Pune', inStock: true, badge: 'Premium',
  description: 'Rust-resistant wheat variety with excellent yield potential', tags: ['high-yield']
},
{
  id: 'agri-006', name: 'Urea Fertilizer (45 Kg)', category: 'Fertilizers',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1efa0b162-1767018520192.png",
  imageAlt: 'White urea fertilizer granules in open bag in agricultural warehouse',
  price: 1100, mrp: 1200, unit: 'per bag', rating: 4.2, reviews: 267,
  seller: 'Krishak Inputs', inStock: true,
  description: 'High nitrogen content for vegetative growth', tags: ['high-yield']
},
{
  id: 'agri-007', name: 'Chlorpyrifos 20% EC (1 Ltr)', category: 'Pesticides',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_12663dcce-1771271995876.png",
  imageAlt: 'Agricultural pesticide bottle with yellow label on white background',
  price: 450, mrp: 520, unit: 'per bottle', rating: 4.1, reviews: 143,
  seller: 'GreenShield Agro', inStock: true,
  description: 'Broad-spectrum insecticide for soil and foliar pests', tags: []
},
{
  id: 'agri-008', name: 'Vermicompost (10 Kg)', category: 'Fertilizers',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1006394c4-1767472778777.png",
  imageAlt: 'Dark brown vermicompost organic fertilizer in open bag with earthworms visible',
  price: 350, mrp: 400, unit: 'per bag', rating: 4.8, reviews: 82,
  seller: 'NatureFarm Store', inStock: true, badge: 'Organic',
  description: 'Nutrient-rich worm castings for all crops', tags: ['organic', 'eco-friendly']
},
{
  id: 'agri-009', name: 'Drip Irrigation Kit (1 Acre)', category: 'Tools & Equipment',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_19cfa9045-1772387560531.png",
  imageAlt: 'Drip irrigation system with black tubes and emitters installed in vegetable farm',
  price: 4500, mrp: 5500, unit: 'per kit', rating: 4.5, reviews: 56,
  seller: 'IrriTech Solutions', inStock: true, badge: 'Save Water',
  description: 'Complete drip irrigation kit for 1 acre coverage', tags: ['eco-friendly']
},
{
  id: 'agri-010', name: 'Tomato Seeds F1 Hybrid', category: 'Seeds',
  image: "https://images.unsplash.com/photo-1689495203267-81dd1f2d8202",
  imageAlt: 'Red ripe tomatoes on vine in greenhouse with green leaves',
  price: 280, mrp: 320, unit: 'per 10g pack', rating: 4.6, reviews: 201,
  seller: 'AgroMart Pune', inStock: true,
  description: 'Disease-resistant F1 hybrid tomato seeds for high yield', tags: ['high-yield']
},
{
  id: 'agri-011', name: 'Hand Sprayer (16 Ltr)', category: 'Tools & Equipment',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1736ac5d8-1764657819365.png",
  imageAlt: 'Blue hand-operated backpack sprayer for agricultural pesticide application',
  price: 1200, mrp: 1500, unit: 'per unit', rating: 4.3, reviews: 167,
  seller: 'FarmTools India', inStock: true,
  description: 'Ergonomic knapsack sprayer with adjustable nozzle', tags: []
},
{
  id: 'agri-012', name: 'Bio-Fungicide (500ml)', category: 'Crop Care',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e0265782-1784879752762.png",
  imageAlt: 'Green bio-fungicide bottle with organic label on white background',
  price: 390, mrp: 450, unit: 'per bottle', rating: 4.4, reviews: 78,
  seller: 'GreenShield Agro', inStock: true, badge: 'Bio',
  description: 'Trichoderma-based bio-fungicide for soil-borne diseases', tags: ['organic', 'eco-friendly']
}];


const CATEGORIES = ['All', 'Seeds', 'Fertilizers', 'Pesticides', 'Crop Care', 'Tools & Equipment'];
const SORT_OPTIONS = [
{ value: 'popular', label: 'Most Popular' },
{ value: 'price_asc', label: 'Price: Low to High' },
{ value: 'price_desc', label: 'Price: High to Low' },
{ value: 'rating', label: 'Top Rated' },
{ value: 'discount', label: 'Best Discount' }];


export default function AgriPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('popular');
  const [maxPrice, setMaxPrice] = useState(6000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [organicOnly, setOrganicOnly] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<string[]>([]);
  const [filterSections, setFilterSections] = useState({ category: true, price: true, rating: true, availability: true });

  function toggleWish(id: string) {
    setWishlist((p) => p.includes(id) ? p.filter((w) => w !== id) : [...p, id]);
  }

  function addToCart(id: string) {
    if (!cart.includes(id)) setCart((p) => [...p, id]);
  }

  function toggleSection(key: keyof typeof filterSections) {
    setFilterSections((p) => ({ ...p, [key]: !p[key] }));
  }

  const filtered = useMemo(() => {
    let list = ALL_PRODUCTS.filter((p) => {
      const q = search.toLowerCase();
      const matchSearch = !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q) || p.seller.toLowerCase().includes(q);
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      const matchPrice = p.price <= maxPrice;
      const matchRating = p.rating >= minRating;
      const matchStock = !inStockOnly || p.inStock;
      const matchOrganic = !organicOnly || p.tags.includes('organic');
      return matchSearch && matchCat && matchPrice && matchRating && matchStock && matchOrganic;
    });

    list.sort((a, b) => {
      if (sortBy === 'popular') return b.reviews - a.reviews;
      if (sortBy === 'price_asc') return a.price - b.price;
      if (sortBy === 'price_desc') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'discount') return (b.mrp - b.price) / b.mrp - (a.mrp - a.price) / a.mrp;
      return 0;
    });
    return list;
  }, [search, selectedCategory, sortBy, maxPrice, minRating, inStockOnly, organicOnly]);

  const FiltersPanel = () =>
  <div className="card-base overflow-hidden sticky top-20">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground">Filters</h3>
        <button suppressHydrationWarning onClick={() => {setMaxPrice(6000);setMinRating(0);setInStockOnly(false);setOrganicOnly(false);setSelectedCategory('All');}} className="text-xs text-primary font-medium hover:underline">Reset</button>
      </div>
      <div className="divide-y divide-border max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
        <div className="p-4">
          <button suppressHydrationWarning onClick={() => toggleSection('category')} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold text-foreground">Category</span>
            {filterSections.category ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {filterSections.category &&
        <div className="space-y-2">
              {CATEGORIES.filter((c) => c !== 'All').map((cat) =>
          <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={selectedCategory === cat} onChange={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)} className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{cat}</span>
                </label>
          )}
            </div>
        }
        </div>
        <div className="p-4">
          <button suppressHydrationWarning onClick={() => toggleSection('price')} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold text-foreground">Max Price</span>
            {filterSections.price ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {filterSections.price &&
        <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>₹0</span><span className="font-tabular">₹{maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min={100} max={6000} step={100} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2000, 5000].map((p) =>
            <button suppressHydrationWarning key={p} onClick={() => setMaxPrice(p)} className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${maxPrice === p ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>≤{p >= 1000 ? `${p / 1000}k` : p}</button>
            )}
              </div>
            </div>
        }
        </div>
        <div className="p-4">
          <button suppressHydrationWarning onClick={() => toggleSection('rating')} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold text-foreground">Min Rating</span>
            {filterSections.rating ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {filterSections.rating &&
        <div className="space-y-1.5">
              {[4.5, 4.0, 3.5].map((r) =>
          <button suppressHydrationWarning key={r} onClick={() => setMinRating(minRating === r ? 0 : r)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${minRating === r ? 'bg-secondary border border-primary/30 text-primary' : 'hover:bg-muted text-foreground border border-transparent'}`}>
                  <span className="text-accent">{'★'.repeat(Math.floor(r))}</span>
                  <span className="font-semibold font-tabular">{r}+</span>
                </button>
          )}
            </div>
        }
        </div>
        <div className="p-4 space-y-3">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div onClick={() => setInStockOnly(!inStockOnly)} className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${inStockOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${inStockOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-foreground">In Stock Only</span>
          </label>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <div onClick={() => setOrganicOnly(!organicOnly)} className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${organicOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
              <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${organicOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </div>
            <span className="text-sm text-foreground flex items-center gap-1"><Leaf size={13} className="text-success" />Organic Only</span>
          </label>
        </div>
      </div>
    </div>;


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero */}
        <div className="gradient-hero text-white py-10 px-4">
          <div className="max-w-screen-2xl mx-auto lg:px-8 xl:px-10 2xl:px-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">🌱</span>
                  <h1 className="text-2xl md:text-3xl font-extrabold">Agri Supplies</h1>
                </div>
                <p className="text-white/80 text-sm md:text-base">Seeds, Fertilizers, Pesticides & Tools — delivered to your farm</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                  <span>{ALL_PRODUCTS.filter((p) => p.inStock).length} Products In Stock</span>
                  <span>{ALL_PRODUCTS.length} Total Products</span>
                  <span className="flex items-center gap-1"><Leaf size={13} />Organic Options Available</span>
                </div>
              </div>
              {cart.length > 0 &&
              <Link href="/account/cart" className="flex items-center gap-2 bg-white text-primary font-bold px-5 py-3 rounded-xl transition-all btn-press shadow-lg shrink-0 hover:bg-secondary">
                  <ShoppingCart size={18} />
                  View Cart ({cart.length})
                </Link>
              }
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
          {/* Search + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input type="text" placeholder="Search products, seeds, fertilizers..." value={search} onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 pr-9" />
              {search && <button suppressHydrationWarning onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={15} /></button>}
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="input-field pl-8 pr-8 appearance-none cursor-pointer min-w-[180px]">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button suppressHydrationWarning onClick={() => setFiltersOpen(!filtersOpen)} className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${filtersOpen ? 'border-primary bg-secondary text-primary' : 'border-border text-foreground hover:border-primary'}`}>
                <Filter size={15} />Filters
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-5">
            {CATEGORIES.map((cat) =>
            <button suppressHydrationWarning key={cat} onClick={() => setSelectedCategory(cat)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selectedCategory === cat ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>{cat}</button>
            )}
          </div>

          <div className="flex gap-6">
            <aside className="hidden lg:block w-64 shrink-0">
              <FiltersPanel />
            </aside>

            {filtersOpen &&
            <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
                <div className="absolute left-0 top-0 h-full w-72 bg-card shadow-modal overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-bold text-foreground">Filters</h3>
                    <button suppressHydrationWarning onClick={() => setFiltersOpen(false)}><X size={20} /></button>
                  </div>
                  <FiltersPanel />
                </div>
              </div>
            }

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> products found</p>
                {cart.length > 0 &&
                <Link href="/account/cart" className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">
                    <ShoppingCart size={15} />{cart.length} in cart
                  </Link>
                }
              </div>

              {filtered.length === 0 ?
              <div className="card-base p-12 text-center">
                  <span className="text-5xl mb-4 block">🌱</span>
                  <h3 className="font-bold text-lg text-foreground mb-2">No products found</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your filters or search query</p>
                </div> :

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                  {filtered.map((product) => {
                  const discount = Math.round((product.mrp - product.price) / product.mrp * 100);
                  const inCart = cart.includes(product.id);
                  const inWish = wishlist.includes(product.id);
                  return (
                    <div key={product.id} className="card-base card-hover overflow-hidden group">
                        <div className="relative h-44 overflow-hidden">
                          <AppImage src={product.image} alt={product.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <button suppressHydrationWarning onClick={() => toggleWish(product.id)} className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all ${inWish ? 'bg-danger text-white' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white'}`}>
                            <Heart size={14} fill={inWish ? 'currentColor' : 'none'} />
                          </button>
                          {product.badge && <div className="absolute top-2.5 left-2.5"><span className="badge-amber text-xs">{product.badge}</span></div>}
                          {discount > 0 && <div className="absolute bottom-2.5 left-2.5"><span className="bg-danger text-white text-xs font-bold px-2 py-0.5 rounded-full">{discount}% OFF</span></div>}
                          {!product.inStock &&
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                              <span className="bg-danger text-white text-xs font-bold px-3 py-1.5 rounded-full">Out of Stock</span>
                            </div>
                        }
                        </div>
                        <div className="p-4">
                          <span className="badge-green text-xs mb-1.5 inline-block">{product.category}</span>
                          <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug mb-1">{product.name}</h3>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{product.description}</p>
                          <div className="flex items-center gap-1.5 mb-2">
                            <Star size={12} className="text-accent fill-accent" />
                            <span className="text-xs font-semibold font-tabular">{product.rating}</span>
                            <span className="text-xs text-muted-foreground">({product.reviews})</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                            <Package size={11} className="text-primary" />{product.seller}
                          </div>
                          <div className="flex items-end justify-between mb-3">
                            <div>
                              <p className="text-xs text-muted-foreground">{product.unit}</p>
                              <div className="flex items-baseline gap-1.5">
                                <p className="text-lg font-bold text-primary font-tabular">₹{product.price}</p>
                                {product.mrp > product.price && <p className="text-xs text-muted-foreground line-through font-tabular">₹{product.mrp}</p>}
                              </div>
                            </div>
                            <span className="text-xs text-success font-medium">Free delivery</span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Link href={`/agri/${product.id}`} className={`text-xs py-2 rounded-lg font-semibold transition-all btn-press text-center ${product.inStock ? 'gradient-green text-white hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}>
                              Buy Now
                            </Link>
                            <button suppressHydrationWarning disabled={!product.inStock} onClick={() => addToCart(product.id)} className={`flex items-center justify-center gap-1.5 text-xs py-2 rounded-lg font-semibold border-2 transition-all btn-press ${inCart ? 'border-success text-success bg-success-bg' : product.inStock ? 'border-primary text-primary hover:bg-secondary' : 'border-muted text-muted-foreground cursor-not-allowed'}`}>
                              {inCart ? <><Check size={12} />Added</> : <><ShoppingCart size={12} />Add to Cart</>}
                            </button>
                          </div>
                        </div>
                      </div>);

                })}
                </div>
              }
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>);

}