'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import Link from 'next/link';
import {
  MapPin, Star, Heart, Tag, Search, SlidersHorizontal, X,
  ChevronDown, Truck, CheckCircle, ArrowRight, Filter, Tractor,
  Zap, Wheat, Droplets, Package, Wrench, LayoutGrid, List
} from 'lucide-react';
import { toast } from 'sonner';
import Icon from '../../../kisansetu-main/src/components/ui/AppIcon';


// ─── Types ────────────────────────────────────────────────────────────────────

interface RentalEquipment {
  id: string;
  name: string;
  category: string;
  image: string;
  imageAlt: string;
  rentPerDay: number;
  deposit: number;
  location: string;
  district: string;
  distance: number;
  rating: number;
  reviews: number;
  available: boolean;
  owner: string;
  specs: string;
  brand: string;
  hasDriver: boolean;
  bookingRef: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const RENTAL_EQUIPMENT: RentalEquipment[] = [
  {
    id: 'br-001', name: 'Massey Ferguson 241 DI Tractor', category: 'Tractor',
    image: '/assets/images/massey-ferguson-241di-tractor.png',
    imageAlt: 'Red Massey Ferguson 241 DI tractor parked on farm ready for rental',
    rentPerDay: 2500, deposit: 10000, location: 'Hadapsar, Pune', district: 'Pune',
    distance: 2.4, rating: 4.6, reviews: 128, available: true,
    owner: 'Rajesh Patil', specs: '47 HP, 2WD, Power Steering', brand: 'Massey Ferguson',
    hasDriver: true, bookingRef: 'BKG71209'
  },
  {
    id: 'br-002', name: 'Kubota A211N Tractor', category: 'Tractor',
    image: '/assets/images/kubota-a211n-tractor.png',
    imageAlt: 'Orange Kubota A211N compact tractor with rotavator attachment for farm rental',
    rentPerDay: 2200, deposit: 8000, location: 'Kothrud, Pune', district: 'Pune',
    distance: 3.1, rating: 4.3, reviews: 74, available: true,
    owner: 'Priya Deshmukh', specs: '21 HP, 4WD, Rotavator Included', brand: 'Kubota',
    hasDriver: false, bookingRef: 'BKG65890'
  },
  {
    id: 'br-003', name: 'Maschio Rotary Tiller', category: 'Rotavator',
    image: '/assets/images/maschio-rotary-tiller.png',
    imageAlt: 'Red Maschio rotary tiller implement for soil preparation available for rent',
    rentPerDay: 800, deposit: 2000, location: 'Baner, Pune', district: 'Pune',
    distance: 4.5, rating: 4.2, reviews: 89, available: true,
    owner: 'Kavita Jadhav', specs: '5 ft Width, L-Type Blades, 48 Blades', brand: 'Maschio',
    hasDriver: false, bookingRef: 'BKG71209'
  },
  {
    id: 'br-004', name: 'PTO Rotary Tiller Attachment', category: 'Rotavator',
    image: '/assets/images/pto-rotary-tiller.png',
    imageAlt: 'Red PTO-driven rotary tiller attachment for tractor rental in Maharashtra',
    rentPerDay: 1000, deposit: 2500, location: 'Mundhwa, Pune', district: 'Pune',
    distance: 6.3, rating: 4.4, reviews: 62, available: true,
    owner: 'Ganesh More', specs: '6 ft Width, C-Type Blades, PTO Driven', brand: 'Generic',
    hasDriver: false, bookingRef: 'BKG71209'
  },
  {
    id: 'br-005', name: 'YARA Knapsack Sprayer', category: 'Sprayer',
    image: '/assets/images/yara-knapsack-sprayer.png',
    imageAlt: 'Blue YARA knapsack battery-powered sprayer for crop protection rental',
    rentPerDay: 300, deposit: 500, location: 'Kothrud, Pune', district: 'Pune',
    distance: 2.9, rating: 4.1, reviews: 112, available: true,
    owner: 'Priya Deshmukh', specs: '16 Litre, Battery Powered', brand: 'YARA',
    hasDriver: false, bookingRef: 'BKG71209'
  },
  {
    id: 'br-006', name: 'Three-Bottom Moldboard Plough', category: 'Plough',
    image: '/assets/images/moldboard-plough.png',
    imageAlt: 'Heavy-duty three-bottom moldboard plough implement for deep soil tillage rental',
    rentPerDay: 700, deposit: 1500, location: 'Baner, Pune', district: 'Pune',
    distance: 5.0, rating: 4.0, reviews: 34, available: true,
    owner: 'Kavita Jadhav', specs: '3 Bottom, Hydraulic Cylinder, Heavy Duty', brand: 'Generic',
    hasDriver: false, bookingRef: 'BKG71209'
  },
  {
    id: 'br-007', name: 'AARAIKk Agricultural Thresher', category: 'Thresher',
    image: '/assets/images/aaraik-thresher.png',
    imageAlt: 'Orange AARAIKk agricultural thresher machine for grain separation rental',
    rentPerDay: 1800, deposit: 5000, location: 'Mundhwa, Pune', district: 'Pune',
    distance: 9.4, rating: 4.4, reviews: 67, available: true,
    owner: 'Ganesh More', specs: '15 HP, 4000 kg/hr Capacity', brand: 'AARAIKk',
    hasDriver: false, bookingRef: 'BKG71209'
  },
  {
    id: 'br-008', name: 'Disc Harrow Heavy Duty', category: 'Disc Harrow',
    image: '/assets/images/disc-harrow.png',
    imageAlt: 'Blue heavy-duty disc harrow implement for secondary tillage available for rent',
    rentPerDay: 900, deposit: 2000, location: 'Kothrud, Pune', district: 'Pune',
    distance: 4.8, rating: 4.1, reviews: 48, available: true,
    owner: 'Priya Deshmukh', specs: 'Heavy Duty, Multiple Discs', brand: 'Generic',
    hasDriver: false, bookingRef: 'BKG71209'
  },
  {
    id: 'br-009', name: 'Sonalika Farm Trailer', category: 'Trailer',
    image: '/assets/images/sonalika-farm-trailer.png',
    imageAlt: 'Blue Sonalika farm trailer with off-road tires for agricultural transport rental',
    rentPerDay: 1500, deposit: 4000, location: 'Hadapsar, Pune', district: 'Pune',
    distance: 3.2, rating: 4.5, reviews: 91, available: true,
    owner: 'Rajesh Patil', specs: 'Heavy Duty, Off-Road Tires', brand: 'Sonalika',
    hasDriver: false, bookingRef: 'BKG71209'
  },
];

// ─── Category Config ──────────────────────────────────────────────────────────

const CATEGORIES = [
  { label: 'All', icon: LayoutGrid, color: 'bg-primary/10 text-primary border-primary/30' },
  { label: 'Tractor', icon: Tractor, color: 'bg-green-50 text-green-700 border-green-200' },
  { label: 'Rotavator', icon: Zap, color: 'bg-amber-50 text-amber-700 border-amber-200' },
  { label: 'Harvester', icon: Wheat, color: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  { label: 'Sprayer', icon: Droplets, color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { label: 'Plough', icon: Wrench, color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { label: 'Thresher', icon: Package, color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { label: 'Disc Harrow', icon: Zap, color: 'bg-rose-50 text-rose-700 border-rose-200' },
  { label: 'Trailer', icon: Truck, color: 'bg-teal-50 text-teal-700 border-teal-200' },
];

const LOCATIONS = ['All Locations', 'Pune', 'Nashik', 'Kolhapur', 'Aurangabad', 'Nagpur'];
const PRICE_RANGES = [
  { label: 'Any Price', min: 0, max: 99999 },
  { label: 'Under ₹500', min: 0, max: 500 },
  { label: '₹500–₹1,000', min: 500, max: 1000 },
  { label: '₹1,000–₹2,500', min: 1000, max: 2500 },
  { label: 'Above ₹2,500', min: 2500, max: 99999 },
];

// ─── Equipment Card ───────────────────────────────────────────────────────────

function EquipmentCard({ item, viewMode }: { item: RentalEquipment; viewMode: 'grid' | 'list' }) {
  const [wishlisted, setWishlisted] = useState(false);

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    setWishlisted((prev) => {
      toast.success(prev ? `${item.name} removed from wishlist` : `${item.name} saved ❤️`);
      return !prev;
    });
  }

  const bookNowHref = `/rental-payment?id=${item.bookingRef}&equipment=${encodeURIComponent(item.name)}&rate=${item.rentPerDay}`;

  if (viewMode === 'list') {
    return (
      <div className="card-base card-hover flex gap-4 p-4 group">
        <div className="relative w-32 h-24 shrink-0 rounded-xl overflow-hidden">
          <AppImage src={item.image} alt={item.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
          <div className={`absolute top-2 left-2 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${item.available ? 'bg-success text-white' : 'bg-danger/90 text-white'}`}>
            {item.available ? '✓ Available' : '✕ Booked'}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div>
              <h3 className="font-bold text-sm text-foreground line-clamp-1">{item.name}</h3>
              <p className="text-xs text-muted-foreground">{item.brand} · {item.specs}</p>
            </div>
            <button onClick={handleWishlist} className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all ${wishlisted ? 'bg-danger text-white' : 'bg-muted text-muted-foreground hover:text-danger'}`}>
              <Heart size={13} fill={wishlisted ? 'currentColor' : 'none'} />
            </button>
          </div>
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            <div className="flex items-center gap-1">
              <Star size={11} className="text-accent fill-accent" />
              <span className="text-xs font-bold font-tabular">{item.rating}</span>
              <span className="text-xs text-muted-foreground">({item.reviews})</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <MapPin size={10} className="text-primary" />
              <span>{item.location} · {item.distance} km</span>
            </div>
            {item.hasDriver && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                <Truck size={9} /> Driver incl.
              </span>
            )}
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-primary font-tabular">₹{item.rentPerDay.toLocaleString('en-IN')}</span>
              <span className="text-xs text-muted-foreground">/day</span>
            </div>
            <Link
              href={bookNowHref}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold transition-all btn-press ${item.available ? 'gradient-green text-white hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}
            >
              Book Now <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card-base card-hover overflow-hidden group flex flex-col">
      <div className="relative h-44 overflow-hidden shrink-0">
        <AppImage src={item.image} alt={item.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        <button onClick={handleWishlist} className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${wishlisted ? 'bg-danger text-white scale-110' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white hover:text-danger'}`}>
          <Heart size={14} fill={wishlisted ? 'currentColor' : 'none'} />
        </button>
        <div className="absolute top-3 left-3">
          <span className="badge-green text-xs">{item.category}</span>
        </div>
        <div className="absolute bottom-3 left-3">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.available ? 'bg-success text-white' : 'bg-danger/90 text-white'}`}>
            {item.available ? '✓ Available' : '✕ Booked'}
          </span>
        </div>
        {item.hasDriver && (
          <div className="absolute bottom-3 right-3">
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary text-white text-[10px] font-bold">
              <Truck size={9} /> Driver
            </span>
          </div>
        )}
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug mb-1">{item.name}</h3>
        <p className="text-xs text-muted-foreground mb-2">{item.brand} · {item.specs}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1">
            <Star size={12} className="text-accent fill-accent" />
            <span className="text-xs font-bold font-tabular">{item.rating}</span>
            <span className="text-xs text-muted-foreground">({item.reviews})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin size={11} className="text-primary" />
            <span className="font-tabular">{item.distance} km away</span>
          </div>
        </div>

        <div className="bg-muted/60 rounded-lg p-3 mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Tag size={11} />Rent per day</div>
            <span className="text-base font-bold text-primary font-tabular">₹{item.rentPerDay.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex items-center justify-between pt-1.5 border-t border-border">
            <span className="text-xs text-muted-foreground">Security deposit</span>
            <span className="text-xs font-semibold text-warning font-tabular">₹{item.deposit.toLocaleString('en-IN')} refundable</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 mb-4 text-xs text-muted-foreground">
          <div className="w-5 h-5 rounded-full gradient-green flex items-center justify-center shrink-0">
            <span className="text-white text-[9px] font-bold">{item.owner.split(' ').map((n) => n[0]).join('')}</span>
          </div>
          <span className="line-clamp-1">{item.owner}</span>
          <span className="mx-1">·</span>
          <MapPin size={10} className="text-primary shrink-0" />
          <span className="line-clamp-1">{item.location}</span>
        </div>

        <div className="mt-auto flex gap-2">
          <Link
            href={`/equipment/${item.id}`}
            className="flex-1 flex items-center justify-center py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
          >
            View Details
          </Link>
          <Link
            href={bookNowHref}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-bold transition-all btn-press ${item.available ? 'gradient-green text-white hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}
          >
            Book Now <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function BrowseEquipmentPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedPriceRange, setSelectedPriceRange] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [driverOnly, setDriverOnly] = useState(false);
  const [sortBy, setSortBy] = useState<'nearest' | 'price-asc' | 'price-desc' | 'rating'>('nearest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(false);

  const priceRange = PRICE_RANGES[selectedPriceRange];

  const filtered = useMemo(() => {
    let result = [...RENTAL_EQUIPMENT];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((e) =>
        e.name.toLowerCase().includes(q) ||
        e.category.toLowerCase().includes(q) ||
        e.brand.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q)
      );
    }
    if (selectedCategory !== 'All') result = result.filter((e) => e.category === selectedCategory);
    if (selectedLocation !== 'All Locations') result = result.filter((e) => e.district === selectedLocation || e.location.includes(selectedLocation));
    result = result.filter((e) => e.rentPerDay >= priceRange.min && e.rentPerDay <= priceRange.max);
    if (availableOnly) result = result.filter((e) => e.available);
    if (driverOnly) result = result.filter((e) => e.hasDriver);

    switch (sortBy) {
      case 'price-asc': result.sort((a, b) => a.rentPerDay - b.rentPerDay); break;
      case 'price-desc': result.sort((a, b) => b.rentPerDay - a.rentPerDay); break;
      case 'nearest': result.sort((a, b) => a.distance - b.distance); break;
      case 'rating': result.sort((a, b) => b.rating - a.rating); break;
    }
    return result;
  }, [searchQuery, selectedCategory, selectedLocation, priceRange, availableOnly, driverOnly, sortBy]);

  const activeFiltersCount = [
    selectedCategory !== 'All',
    selectedLocation !== 'All Locations',
    selectedPriceRange !== 0,
    availableOnly,
    driverOnly,
  ].filter(Boolean).length;

  function clearAllFilters() {
    setSelectedCategory('All');
    setSelectedLocation('All Locations');
    setSelectedPriceRange(0);
    setAvailableOnly(false);
    setDriverOnly(false);
    setSearchQuery('');
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* ── Hero Banner ── */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-b border-border">
          <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-8">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
              <Link href="/" className="hover:text-primary transition-colors">Home</Link>
              <span>/</span>
              <span className="text-primary font-medium">Browse Equipment</span>
            </div>
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-foreground mb-1">
                  Browse Rental Equipment
                </h1>
                <p className="text-sm text-muted-foreground max-w-lg">
                  Discover tractors, harvesters, rotavators and more near you. Filter by category, location, and daily rate — then book in minutes.
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 px-3 py-2 bg-success/10 border border-success/20 rounded-xl">
                  <CheckCircle size={14} className="text-success" />
                  <span className="text-xs font-semibold text-success">{RENTAL_EQUIPMENT.filter(e => e.available).length} Available Now</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl">
                  <Tractor size={14} className="text-primary" />
                  <span className="text-xs font-semibold text-primary">{RENTAL_EQUIPMENT.length} Total Listings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
          {/* ── Search Bar ── */}
          <div className="relative mb-5">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by equipment name, category, brand, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={14} />
              </button>
            )}
          </div>

          {/* ── Category Chips ── */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-5">
            {CATEGORIES.map(({ label, icon: Icon, color }) => (
              <button
                key={`cat-${label}`}
                onClick={() => setSelectedCategory(label)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold whitespace-nowrap transition-all duration-150 shrink-0 ${
                  selectedCategory === label
                    ? 'gradient-green text-white border-transparent shadow-sm scale-[1.02]'
                    : `${color} hover:scale-[1.02]`
                }`}
              >
                <Icon size={13} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Filter Bar ── */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {/* Location */}
            <div className="relative">
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="appearance-none pl-8 pr-8 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
              >
                {LOCATIONS.map((loc) => (
                  <option key={`loc-${loc}`} value={loc}>{loc}</option>
                ))}
              </select>
              <MapPin size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {/* Price Range */}
            <div className="relative">
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(Number(e.target.value))}
                className="appearance-none pl-8 pr-8 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
              >
                {PRICE_RANGES.map((range, i) => (
                  <option key={`price-${i}`} value={i}>{range.label}</option>
                ))}
              </select>
              <Tag size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-8 pr-8 py-2 rounded-xl border border-border bg-card text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary cursor-pointer"
              >
                <option value="nearest">Nearest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Rated</option>
              </select>
              <SlidersHorizontal size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-primary pointer-events-none" />
              <ChevronDown size={12} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            </div>

            {/* More Filters toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl border text-xs font-semibold transition-all ${filtersOpen ? 'bg-primary text-white border-primary' : 'border-border text-foreground hover:border-primary hover:text-primary'}`}
            >
              <Filter size={13} />
              More Filters
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-primary text-[10px] font-bold flex items-center justify-center">{activeFiltersCount}</span>
              )}
            </button>

            {/* View toggle */}
            <div className="ml-auto flex items-center gap-1 bg-muted rounded-xl p-1">
              <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <LayoutGrid size={15} />
              </button>
              <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-lg transition-all ${viewMode === 'list' ? 'bg-card shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                <List size={15} />
              </button>
            </div>
          </div>

          {/* ── Expanded Filters ── */}
          {filtersOpen && (
            <div className="mb-5 p-4 bg-card border border-border rounded-xl flex flex-wrap gap-4 items-center fade-in">
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setAvailableOnly(!availableOnly)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${availableOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${availableOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs font-semibold text-foreground">Available only</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setDriverOnly(!driverOnly)}
                  className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${driverOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                >
                  <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${driverOnly ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-xs font-semibold text-foreground">With driver included</span>
              </label>
              {activeFiltersCount > 0 && (
                <button onClick={clearAllFilters} className="ml-auto text-xs text-danger font-semibold hover:underline flex items-center gap-1">
                  <X size={12} /> Clear all filters
                </button>
              )}
            </div>
          )}

          {/* ── Results Header ── */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-bold text-foreground font-tabular">{filtered.length}</span> rental{filtered.length !== 1 ? 's' : ''} found
              {selectedLocation !== 'All Locations' && <span> in <span className="text-primary font-semibold">{selectedLocation}</span></span>}
              {selectedCategory !== 'All' && <span> · <span className="text-primary font-semibold">{selectedCategory}</span></span>}
            </p>
            {activeFiltersCount > 0 && (
              <button onClick={clearAllFilters} className="text-xs text-danger font-semibold hover:underline flex items-center gap-1">
                <X size={11} /> Clear filters
              </button>
            )}
          </div>

          {/* ── Equipment Grid / List ── */}
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🚜</div>
              <h3 className="font-bold text-lg text-foreground mb-2">No Equipment Found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">
                No rentals match your current filters. Try adjusting the category, location, or price range.
              </p>
              <button onClick={clearAllFilters} className="btn-primary">Clear All Filters</button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((item) => (
                <EquipmentCard key={item.id} item={item} viewMode="grid" />
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((item) => (
                <EquipmentCard key={item.id} item={item} viewMode="list" />
              ))}
            </div>
          )}

          {/* ── Bottom CTA ── */}
          {filtered.length > 0 && (
            <div className="mt-10 p-6 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-base text-foreground mb-1">Can't find what you need?</h3>
                <p className="text-sm text-muted-foreground">Browse the full equipment catalogue or list your own equipment for rent.</p>
              </div>
              <div className="flex gap-3 shrink-0">
                <Link href="/equipment-listing-page" className="btn-secondary text-sm py-2.5 px-5">
                  Full Catalogue
                </Link>
                <Link href="/supplier/add-listing" className="btn-primary text-sm py-2.5 px-5">
                  List Equipment
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
