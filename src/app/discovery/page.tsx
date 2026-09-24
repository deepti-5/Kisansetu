'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import {
  Search, SlidersHorizontal, X, Star, MapPin, ChevronDown, ChevronUp,
  Truck, Users, Filter, ChevronRight, Heart, Phone } from
'lucide-react';

// ─── Types ────────────────────────────────────────────────────────────────────

type ListingKind = 'equipment' | 'labour';

interface DiscoveryItem {
  id: string;
  kind: ListingKind;
  name: string;
  image: string;
  imageAlt: string;
  category: string;
  rating: number;
  reviews: number;
  pricePerDay: number;
  village: string;
  district: string;
  available: boolean;
  hasDriver?: boolean;
  specialty?: string;
  languages?: string[];
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const ITEMS: DiscoveryItem[] = [
{ id: 'e1', kind: 'equipment', name: 'Mahindra 575 DI Tractor', image: "https://img.rocket.new/generatedImages/rocket_gen_img_185285227-1765250552336.png", imageAlt: 'Mahindra 575 DI tractor in a field', category: 'Tractor', rating: 4.8, reviews: 124, pricePerDay: 1800, village: 'Shirur', district: 'Pune', available: true, hasDriver: true },
{ id: 'e2', kind: 'equipment', name: 'Massey Ferguson 241 DI', image: "https://images.unsplash.com/photo-1657527582260-72c560a653ac", imageAlt: 'Massey Ferguson tractor on farm', category: 'Tractor', rating: 4.6, reviews: 89, pricePerDay: 1600, village: 'Baramati', district: 'Pune', available: true, hasDriver: false },
{ id: 'e3', kind: 'equipment', name: 'Disc Harrow 7-Disc', image: '/assets/images/disc-harrow.png', imageAlt: 'Disc harrow attachment for soil preparation', category: 'Tillage', rating: 4.5, reviews: 56, pricePerDay: 600, village: 'Rahuri', district: 'Ahmednagar', available: false, hasDriver: false },
{ id: 'e4', kind: 'equipment', name: 'Rotary Tiller PTO', image: '/assets/images/pto-rotary-tiller.png', imageAlt: 'PTO rotary tiller for field cultivation', category: 'Tillage', rating: 4.7, reviews: 73, pricePerDay: 700, village: 'Kopargaon', district: 'Ahmednagar', available: true, hasDriver: false },
{ id: 'e5', kind: 'equipment', name: 'Yara Knapsack Sprayer', image: '/assets/images/yara-knapsack-sprayer.png', imageAlt: 'Yara knapsack sprayer for crop protection', category: 'Sprayer', rating: 4.4, reviews: 41, pricePerDay: 350, village: 'Sangamner', district: 'Ahmednagar', available: true, hasDriver: false },
{ id: 'e6', kind: 'equipment', name: 'Aaraik Thresher', image: '/assets/images/aaraik-thresher.png', imageAlt: 'Aaraik thresher machine for grain harvesting', category: 'Harvesting', rating: 4.9, reviews: 98, pricePerDay: 2200, village: 'Niphad', district: 'Nashik', available: true, hasDriver: true },
{ id: 'e7', kind: 'equipment', name: 'Sonalika Farm Trailer', image: '/assets/images/sonalika-farm-trailer.png', imageAlt: 'Sonalika farm trailer for transporting produce', category: 'Transport', rating: 4.3, reviews: 32, pricePerDay: 900, village: 'Dindori', district: 'Nashik', available: true, hasDriver: false },
{ id: 'e8', kind: 'equipment', name: 'Moldboard Plough', image: '/assets/images/moldboard-plough.png', imageAlt: 'Moldboard plough for deep soil turning', category: 'Tillage', rating: 4.6, reviews: 61, pricePerDay: 550, village: 'Yeola', district: 'Nashik', available: false, hasDriver: false },
{ id: 'l1', kind: 'labour', name: 'Ramesh Yadav', image: '/assets/images/farmer-man-hoe-pink-turban.png', imageAlt: 'Experienced male farm worker with hoe', category: 'Field Worker', rating: 4.9, reviews: 87, pricePerDay: 450, village: 'Shirur', district: 'Pune', available: true, specialty: 'Wheat & Sugarcane', languages: ['Marathi', 'Hindi'] },
{ id: 'l2', kind: 'labour', name: 'Sunita Devi', image: '/assets/images/farmer-woman-wheat.png', imageAlt: 'Female farm worker harvesting wheat', category: 'Harvesting', rating: 4.7, reviews: 63, pricePerDay: 400, village: 'Baramati', district: 'Pune', available: true, specialty: 'Paddy Harvesting', languages: ['Marathi'] },
{ id: 'l3', kind: 'labour', name: 'Vijay Patil', image: '/assets/images/farmer-man-hoe-walking.png', imageAlt: 'Male farm worker walking with hoe', category: 'Irrigation', rating: 4.5, reviews: 44, pricePerDay: 500, village: 'Rahuri', district: 'Ahmednagar', available: false, specialty: 'Drip Irrigation', languages: ['Marathi', 'Hindi'] },
{ id: 'l4', kind: 'labour', name: 'Meena Bai', image: '/assets/images/farmer-woman-fodder.png', imageAlt: 'Female farm worker carrying fodder', category: 'Field Worker', rating: 4.8, reviews: 72, pricePerDay: 380, village: 'Kopargaon', district: 'Ahmednagar', available: true, specialty: 'Vegetable Farming', languages: ['Marathi'] },
{ id: 'l5', kind: 'labour', name: 'Suresh Kumar', image: '/assets/images/farmer-man-hoe-yellow.png', imageAlt: 'Male farm worker in yellow shirt with hoe', category: 'Spraying', rating: 4.6, reviews: 55, pricePerDay: 520, village: 'Niphad', district: 'Nashik', available: true, specialty: 'Pesticide Application', languages: ['Marathi', 'Hindi', 'English'] },
{ id: 'l6', kind: 'labour', name: 'Kavita Shinde', image: '/assets/images/farmer-young-red-scarf.png', imageAlt: 'Young female farm worker with red scarf', category: 'Harvesting', rating: 4.4, reviews: 38, pricePerDay: 360, village: 'Dindori', district: 'Nashik', available: true, specialty: 'Grape Harvesting', languages: ['Marathi'] }];


const EQUIPMENT_CATEGORIES = ['All', 'Tractor', 'Tillage', 'Harvesting', 'Sprayer', 'Transport'];
const LABOUR_CATEGORIES = ['All', 'Field Worker', 'Harvesting', 'Irrigation', 'Spraying'];
const DISTRICTS = ['All Districts', 'Pune', 'Ahmednagar', 'Nashik'];
const VILLAGES = ['All Villages', 'Shirur', 'Baramati', 'Rahuri', 'Kopargaon', 'Sangamner', 'Niphad', 'Dindori', 'Yeola'];

interface Filters {
  kind: ListingKind | 'all';
  search: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  district: string;
  village: string;
  availableOnly: boolean;
  driverOnly: boolean;
}

const DEFAULT_FILTERS: Filters = {
  kind: 'all',
  search: '',
  category: 'All',
  minPrice: 0,
  maxPrice: 5000,
  minRating: 0,
  district: 'All Districts',
  village: 'All Villages',
  availableOnly: false,
  driverOnly: false
};

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({ filters, onChange, onReset }: {filters: Filters;onChange: (f: Filters) => void;onReset: () => void;}) {
  const [open, setOpen] = useState({ price: true, rating: true, location: true, availability: true });
  const toggle = (k: keyof typeof open) => setOpen((p) => ({ ...p, [k]: !p[k] }));

  const categories = filters.kind === 'labour' ? LABOUR_CATEGORIES : EQUIPMENT_CATEGORIES;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden sticky top-20">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
        <span className="font-bold text-sm text-foreground flex items-center gap-2"><Filter size={14} className="text-primary" /> Filters</span>
        <button onClick={onReset} className="text-sm text-primary font-semibold hover:underline min-h-[44px] min-w-[44px] flex items-center justify-end">Reset all</button>
      </div>

      <div className="divide-y divide-border max-h-[calc(100vh-200px)] overflow-y-auto">
        {/* Category */}
        <div className="p-4">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-3">Category</p>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) =>
            <button key={cat} onClick={() => onChange({ ...filters, category: cat })}
            className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-all min-h-[44px] ${filters.category === cat ? 'bg-primary text-white border-primary' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-primary'}`}>
                {cat}
              </button>
            )}
          </div>
        </div>

        {/* Price */}
        <div className="p-4">
          <button onClick={() => toggle('price')} className="flex items-center justify-between w-full mb-3 min-h-[44px]">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Price / Day</span>
            {open.price ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
          {open.price &&
          <div>
              <div className="flex justify-between text-sm text-muted-foreground mb-2">
                <span>₹{filters.minPrice}</span><span>₹{filters.maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input type="range" min={0} max={5000} step={100} value={filters.maxPrice}
            onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
            className="w-full accent-primary h-2" style={{ touchAction: 'none' }} />
              <div className="flex gap-2 mt-3">
                {[500, 1000, 2000, 5000].map((p) =>
              <button key={p} onClick={() => onChange({ ...filters, maxPrice: p })}
              className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${filters.maxPrice === p ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>
                    ≤{p >= 1000 ? `${p / 1000}k` : p}
                  </button>
              )}
              </div>
            </div>
          }
        </div>

        {/* Rating */}
        <div className="p-4">
          <button onClick={() => toggle('rating')} className="flex items-center justify-between w-full mb-3 min-h-[44px]">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Min Rating</span>
            {open.rating ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
          {open.rating &&
          <div className="space-y-1">
              {[4.5, 4.0, 3.5, 3.0].map((r) =>
            <button key={r} onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
            className={`w-full flex items-center gap-2 px-3 py-3 rounded-xl text-sm transition-all min-h-[48px] ${filters.minRating === r ? 'bg-secondary border border-primary/30 text-primary' : 'hover:bg-muted text-foreground border border-transparent'}`}>
                  <span className="text-accent text-sm">{'★'.repeat(Math.floor(r))}</span>
                  <span className="font-semibold text-sm">{r}+</span>
                </button>
            )}
            </div>
          }
        </div>

        {/* Location */}
        <div className="p-4">
          <button onClick={() => toggle('location')} className="flex items-center justify-between w-full mb-3 min-h-[44px]">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Location</span>
            {open.location ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
          {open.location &&
          <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">District</label>
                <select value={filters.district} onChange={(e) => onChange({ ...filters, district: e.target.value, village: 'All Villages' })}
              className="w-full input-field text-sm py-3 min-h-[48px]">
                  {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-1.5">Village</label>
                <select value={filters.village} onChange={(e) => onChange({ ...filters, village: e.target.value })}
              className="w-full input-field text-sm py-3 min-h-[48px]">
                  {VILLAGES.map((v) => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          }
        </div>

        {/* Availability */}
        <div className="p-4">
          <button onClick={() => toggle('availability')} className="flex items-center justify-between w-full mb-3 min-h-[44px]">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Availability</span>
            {open.availability ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </button>
          {open.availability &&
          <div className="space-y-3">
              <label className="flex items-center gap-3 cursor-pointer min-h-[48px]">
                <div onClick={() => onChange({ ...filters, availableOnly: !filters.availableOnly })}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${filters.availableOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.availableOnly ? 'translate-x-7' : 'translate-x-1'}`} />
                </div>
                <span className="text-sm text-foreground">Available now only</span>
              </label>
              {filters.kind !== 'labour' &&
            <label className="flex items-center gap-3 cursor-pointer min-h-[48px]">
                  <div onClick={() => onChange({ ...filters, driverOnly: !filters.driverOnly })}
              className={`relative w-12 h-6 rounded-full transition-colors cursor-pointer shrink-0 ${filters.driverOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${filters.driverOnly ? 'translate-x-7' : 'translate-x-1'}`} />
                  </div>
                  <span className="text-sm text-foreground">With driver only</span>
                </label>
            }
            </div>
          }
        </div>
      </div>
    </div>);

}

// ─── Item Card ────────────────────────────────────────────────────────────────

function DiscoveryCard({ item }: {item: DiscoveryItem;}) {
  const [wishlisted, setWishlisted] = useState(false);
  const href = item.kind === 'equipment' ? `/equipment/${item.id}` : `/labour/${item.id}`;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden group hover:shadow-lg transition-all duration-200 flex flex-col">
      <div className="relative h-48 sm:h-44 overflow-hidden shrink-0">
        <AppImage src={item.image} alt={item.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <button onClick={() => setWishlisted((p) => !p)}
        className={`absolute top-3 right-3 w-11 h-11 rounded-full flex items-center justify-center transition-all ${wishlisted ? 'bg-danger text-white scale-110' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white hover:text-danger'}`}>
          <Heart size={16} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute top-3 left-3 flex gap-1.5">
          <span className="badge-green text-xs">{item.category}</span>
          {item.kind === 'equipment' && item.hasDriver &&
          <span className="flex items-center gap-0.5 text-[10px] font-bold text-white bg-primary/90 px-2 py-0.5 rounded-full">
              <Truck size={9} /> Driver
            </span>
          }
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.available ? 'bg-success text-white' : 'bg-danger/90 text-white'}`}>
            {item.available ? '✓ Available' : '✕ Booked'}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-1">{item.name}</h3>
        {item.kind === 'labour' && item.specialty &&
        <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Users size={10} /> {item.specialty}</p>
        }

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-accent fill-accent" />
            <span className="text-xs font-bold text-foreground">{item.rating}</span>
            <span className="text-xs text-muted-foreground">({item.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={10} className="text-primary" />
            <span>{item.village}, {item.district}</span>
          </div>
        </div>

        <div className="bg-muted/50 rounded-xl p-3 mb-3 flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Per day</span>
          <span className="text-base font-extrabold text-primary">₹{item.pricePerDay.toLocaleString('en-IN')}</span>
        </div>

        {item.kind === 'labour' && item.languages &&
        <div className="flex flex-wrap gap-1 mb-3">
            {item.languages.map((l) =>
          <span key={l} className="text-[10px] font-semibold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{l}</span>
          )}
          </div>
        }

        <div className="mt-auto flex gap-2">
          <Link href={href} className="flex-1 btn-primary py-3 text-sm text-center font-bold min-h-[48px] flex items-center justify-center">
            {item.kind === 'equipment' ? 'Rent Now' : 'Hire Now'}
          </Link>
          <button className="w-12 h-12 rounded-xl border border-border flex items-center justify-center hover:bg-muted transition-colors">
            <Phone size={16} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>);

}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DiscoveryPage() {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);

  const results = useMemo(() => {
    return ITEMS.filter((item) => {
      if (filters.kind !== 'all' && item.kind !== filters.kind) return false;
      if (filters.search && !item.name.toLowerCase().includes(filters.search.toLowerCase()) &&
      !item.category.toLowerCase().includes(filters.search.toLowerCase()) &&
      !item.village.toLowerCase().includes(filters.search.toLowerCase()) &&
      !item.district.toLowerCase().includes(filters.search.toLowerCase())) return false;
      if (filters.category !== 'All' && item.category !== filters.category) return false;
      if (item.pricePerDay > filters.maxPrice) return false;
      if (filters.minRating > 0 && item.rating < filters.minRating) return false;
      if (filters.district !== 'All Districts' && item.district !== filters.district) return false;
      if (filters.village !== 'All Villages' && item.village !== filters.village) return false;
      if (filters.availableOnly && !item.available) return false;
      if (filters.driverOnly && item.kind === 'equipment' && !item.hasDriver) return false;
      return true;
    });
  }, [filters]);

  const equipmentCount = results.filter((i) => i.kind === 'equipment').length;
  const labourCount = results.filter((i) => i.kind === 'labour').length;

  const activeFilterCount = [
  filters.kind !== 'all',
  filters.category !== 'All',
  filters.maxPrice < 5000,
  filters.minRating > 0,
  filters.district !== 'All Districts',
  filters.village !== 'All Villages',
  filters.availableOnly,
  filters.driverOnly].
  filter(Boolean).length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-5">
          <Link href="/" className="hover:text-primary min-h-[44px] flex items-center">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Discover</span>
        </div>

        {/* Hero search bar */}
        <div className="bg-card rounded-2xl border border-border p-4 sm:p-5 mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-foreground mb-1">Find Equipment & Labour</h1>
          <p className="text-sm text-muted-foreground mb-4">Search by name, category, village, or district</p>
          <div className="flex gap-2 sm:gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="Search tractors, harvesters, labourers..."
                className="input-field pl-9 pr-4 py-3 w-full text-sm min-h-[48px]" />
              
              {filters.search &&
              <button onClick={() => setFilters((p) => ({ ...p, search: '' }))} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground w-8 h-8 flex items-center justify-center">
                  <X size={14} />
                </button>
              }
            </div>
            <button onClick={() => setShowFilters((p) => !p)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl border font-semibold text-sm transition-all lg:hidden min-h-[48px] ${showFilters ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:border-primary'}`}>
              <SlidersHorizontal size={15} />
              <span className="hidden xs:inline">Filters</span>
              {activeFilterCount > 0 && <span className="w-5 h-5 rounded-full bg-white text-primary text-xs font-bold flex items-center justify-center">{activeFilterCount}</span>}
            </button>
          </div>

          {/* Kind tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-1">
            {([
            { value: 'all', label: `All (${ITEMS.length})` },
            { value: 'equipment', label: `Equipment (${ITEMS.filter((i) => i.kind === 'equipment').length})` },
            { value: 'labour', label: `Labour (${ITEMS.filter((i) => i.kind === 'labour').length})` }] as
            const).map((tab) =>
            <button key={tab.value} onClick={() => setFilters((p) => ({ ...p, kind: tab.value, category: 'All' }))}
            className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all whitespace-nowrap min-h-[44px] ${filters.kind === tab.value ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>
                {tab.label}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters — desktop */}
          <aside className="hidden lg:block w-64 shrink-0">
            <FilterPanel filters={filters} onChange={setFilters} onReset={() => setFilters(DEFAULT_FILTERS)} />
          </aside>

          {/* Mobile filter drawer — full screen bottom sheet style */}
          {showFilters &&
          <div className="fixed inset-0 z-50 lg:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setShowFilters(false)} />
              <div className="absolute inset-x-0 bottom-0 top-16 bg-background rounded-t-3xl overflow-y-auto shadow-2xl">
                <div className="flex items-center justify-between p-4 border-b border-border sticky top-0 bg-background z-10">
                  <span className="font-bold text-foreground text-base">Filters</span>
                  <button onClick={() => setShowFilters(false)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"><X size={20} /></button>
                </div>
                <FilterPanel filters={filters} onChange={setFilters} onReset={() => {setFilters(DEFAULT_FILTERS);setShowFilters(false);}} />
                <div className="p-4 border-t border-border sticky bottom-0 bg-background">
                  <button onClick={() => setShowFilters(false)} className="w-full btn-primary py-3 text-base font-bold min-h-[52px]">
                    Show {results.length} Results
                  </button>
                </div>
              </div>
            </div>
          }

          {/* Results */}
          <div className="flex-1 min-w-0">
            {/* Results count */}
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-foreground">{results.length} results found</p>
                <p className="text-xs text-muted-foreground">
                  {equipmentCount > 0 && `${equipmentCount} equipment`}
                  {equipmentCount > 0 && labourCount > 0 && ' · '}
                  {labourCount > 0 && `${labourCount} labour`}
                </p>
              </div>
              {activeFilterCount > 0 &&
              <button onClick={() => setFilters(DEFAULT_FILTERS)} className="flex items-center gap-1.5 text-sm text-danger font-semibold hover:underline min-h-[44px] px-2">
                  <X size={14} /> Clear {activeFilterCount} filter{activeFilterCount > 1 ? 's' : ''}
                </button>
              }
            </div>

            {results.length === 0 ?
            <div className="text-center py-16 bg-card rounded-2xl border border-border">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Search size={28} className="text-muted-foreground" />
                </div>
                <h3 className="font-bold text-foreground mb-2">No results found</h3>
                <p className="text-sm text-muted-foreground mb-4">Try adjusting your filters or search term</p>
                <button onClick={() => setFilters(DEFAULT_FILTERS)} className="btn-primary px-6 py-3 text-sm min-h-[48px]">Clear all filters</button>
              </div> :

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {results.map((item) => <DiscoveryCard key={item.id} item={item} />)}
              </div>
            }
          </div>
        </div>
      </main>
      <Footer />
    </div>);

}