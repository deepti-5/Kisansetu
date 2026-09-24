'use client';

import React, { useState, useMemo } from 'react';
import EquipmentFilters from './EquipmentFilters';
import EquipmentGrid from './EquipmentGrid';
import EquipmentListView from './EquipmentListView';
import EquipmentSortBar from './EquipmentSortBar';
import EquipmentSearchBar from './EquipmentSearchBar';
import { SlidersHorizontal, X, Users } from 'lucide-react';
import Link from 'next/link';

export interface Equipment {
  id: string;name: string;category: string;image: string;imageAlt: string;
  rentPerDay: number;rentPerHour: number;buyPrice: number;deposit: number;
  location: string;district: string;state: string;distance: number;
  rating: number;reviews: number;available: boolean;units: number;
  owner: string;ownerPhone: string;specs: string;yearMade: number;
  horsepower?: number;brand: string;listingType: 'rent' | 'buy' | 'both';
  hasDriver?: boolean;
}

export const ALL_EQUIPMENT: Equipment[] = [
{ id: 'eq-001', name: 'Massey Ferguson 241 DI Tractor', category: 'Tractor', image: "https://images.unsplash.com/photo-1644828320537-35456847a8c6", imageAlt: 'Red Massey Ferguson 241 DI tractor parked outdoors on farm — real photograph from equipment listing', rentPerDay: 2500, rentPerHour: 350, buyPrice: 750000, deposit: 10000, location: 'Hadapsar, Pune', district: 'Pune', state: 'Maharashtra', distance: 2.4, rating: 4.6, reviews: 128, available: true, units: 2, owner: 'Rajesh Patil', ownerPhone: '+91 98765 43210', specs: '47 HP, 2WD, Power Steering', yearMade: 2022, horsepower: 47, brand: 'Massey Ferguson', listingType: 'both', hasDriver: true },
{ id: 'eq-002', name: 'Kubota A211N Tractor with Rotavator', category: 'Tractor', image: "https://images.unsplash.com/photo-1699815987163-89b6643e90e2", imageAlt: 'Orange Kubota A211N tractor with rotary tiller attachment parked outdoors beside green bush — real photograph', rentPerDay: 2200, rentPerHour: 300, buyPrice: 620000, deposit: 8000, location: 'Kothrud, Pune', district: 'Pune', state: 'Maharashtra', distance: 3.1, rating: 4.3, reviews: 74, available: true, units: 1, owner: 'Priya Deshmukh', ownerPhone: '+91 87654 32109', specs: '21 HP, 4WD, Rotavator Included', yearMade: 2021, horsepower: 21, brand: 'Kubota', listingType: 'both', hasDriver: false },
{ id: 'eq-003', name: 'John Deere W70 Combine Harvester', category: 'Harvester', image: 'https://images.unsplash.com/photo-1653474351870-0c89db2d1654', imageAlt: 'Yellow John Deere combine harvester cutting golden wheat crop at sunset in large agricultural field', rentPerDay: 8000, rentPerHour: 1100, buyPrice: 3200000, deposit: 25000, location: 'Sinhagad Road, Pune', district: 'Pune', state: 'Maharashtra', distance: 5.7, rating: 4.7, reviews: 203, available: false, units: 1, owner: 'Sunil Mane', ownerPhone: '+91 76543 21098', specs: '110 HP, AC Cabin, GPS Guidance', yearMade: 2023, horsepower: 110, brand: 'John Deere', listingType: 'rent', hasDriver: true },
{ id: 'eq-004', name: 'Claas Crop Tiger Harvester', category: 'Harvester', image: 'https://images.unsplash.com/photo-1656348144347-eb3e32c98e75', imageAlt: 'Red Claas harvester working in green paddy rice field during harvest season', rentPerDay: 7500, rentPerHour: 1000, buyPrice: 2800000, deposit: 20000, location: 'Wagholi, Pune', district: 'Pune', state: 'Maharashtra', distance: 8.2, rating: 4.5, reviews: 156, available: true, units: 1, owner: 'Anil Shinde', ownerPhone: '+91 65432 10987', specs: '83 HP, 4WD, Paddy Special', yearMade: 2022, horsepower: 83, brand: 'Claas', listingType: 'rent', hasDriver: false },
{ id: 'eq-005', name: 'Maschio Rotary Tiller', category: 'Rotavator', image: "https://images.unsplash.com/photo-1616760268759-9baf33753d5c", imageAlt: 'Red Maschio brand rotary tiller agricultural implement sitting in a field — real photograph from equipment listing', rentPerDay: 800, rentPerHour: 120, buyPrice: 85000, deposit: 2000, location: 'Baner, Pune', district: 'Pune', state: 'Maharashtra', distance: 4.5, rating: 4.2, reviews: 89, available: true, units: 3, owner: 'Kavita Jadhav', ownerPhone: '+91 54321 09876', specs: '5 ft Width, L-Type Blades, 48 Blades', yearMade: 2021, brand: 'Maschio', listingType: 'both', hasDriver: false },
{ id: 'eq-006', name: 'PTO Rotary Tiller Attachment', category: 'Rotavator', image: "https://images.unsplash.com/photo-1620388151647-1b7eb4d62c04", imageAlt: 'Red agricultural rotary tiller attachment viewed from above connected to tractor PTO shaft — real photograph', rentPerDay: 1000, rentPerHour: 140, buyPrice: 95000, deposit: 2500, location: 'Mundhwa, Pune', district: 'Pune', state: 'Maharashtra', distance: 6.3, rating: 4.4, reviews: 62, available: true, units: 2, owner: 'Ganesh More', ownerPhone: '+91 43210 98765', specs: '6 ft Width, C-Type Blades, PTO Driven', yearMade: 2022, brand: 'Generic', listingType: 'both', hasDriver: false },
{ id: 'eq-007', name: 'Fieldking Seed Drill 9 Row', category: 'Seed Drill', image: "https://img.rocket.new/generatedImages/rocket_gen_img_104eaccee-1768761568871.png", imageAlt: 'Agricultural seed drill implement attached to tractor being towed through brown ploughed field', rentPerDay: 1200, rentPerHour: 160, buyPrice: 95000, deposit: 3000, location: 'Wagholi, Nashik', district: 'Nashik', state: 'Maharashtra', distance: 8.2, rating: 4.2, reviews: 56, available: true, units: 2, owner: 'Anil Shinde', ownerPhone: '+91 32109 87654', specs: '9 Row, 225mm Row Spacing, Fertilizer Box', yearMade: 2020, brand: 'Fieldking', listingType: 'both', hasDriver: false },
{ id: 'eq-008', name: 'Mahindra Seed-o-Matic Drill', category: 'Seed Drill', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1359c274a-1772795523390.png", imageAlt: 'Tractor-mounted seed drill implement working in agricultural field with rows visible', rentPerDay: 1100, rentPerHour: 150, buyPrice: 88000, deposit: 2800, location: 'Hadapsar, Pune', district: 'Pune', state: 'Maharashtra', distance: 3.8, rating: 4.0, reviews: 41, available: false, units: 1, owner: 'Rajesh Patil', ownerPhone: '+91 98765 43210', specs: '11 Row, Zero Till, Inclined Plate', yearMade: 2021, brand: 'Mahindra', listingType: 'both', hasDriver: false },
{ id: 'eq-009', name: 'YARA Agriculture Knapsack Sprayer', category: 'Sprayer', image: "https://images.unsplash.com/photo-1718149055064-5b247e93380c", imageAlt: 'Blue YARA Agriculture knapsack sprayer with yellow nozzle standing in field at sunset — real photograph from equipment listing', rentPerDay: 300, rentPerHour: 50, buyPrice: 4500, deposit: 500, location: 'Kothrud, Pune', district: 'Pune', state: 'Maharashtra', distance: 2.9, rating: 4.1, reviews: 112, available: true, units: 5, owner: 'Priya Deshmukh', ownerPhone: '+91 87654 32109', specs: '16 Litre, Battery Powered, YARA Brand', yearMade: 2022, brand: 'YARA', listingType: 'both', hasDriver: false },
{ id: 'eq-010', name: 'Honda Power Tiller FJ500', category: 'Power Tiller', image: "https://img.rocket.new/generatedImages/rocket_gen_img_1e7a72901-1768249566100.png", imageAlt: 'Red Honda power tiller machine being operated in small agricultural field', rentPerDay: 600, rentPerHour: 90, buyPrice: 55000, deposit: 1500, location: 'Sinhagad, Pune', district: 'Pune', state: 'Maharashtra', distance: 7.1, rating: 4.3, reviews: 78, available: true, units: 2, owner: 'Sunil Mane', ownerPhone: '+91 76543 21098', specs: '5 HP, 4 Stroke, 600mm Width', yearMade: 2021, brand: 'Honda', listingType: 'both', hasDriver: false },
{ id: 'eq-011', name: 'Three-Bottom Moldboard Plough', category: 'Plough', image: "https://images.unsplash.com/photo-1588586528138-a52b589a399c", imageAlt: 'Rusty three-bottom moldboard plow with hydraulic cylinder attached to tractor in dry agricultural field — real photograph', rentPerDay: 700, rentPerHour: 100, buyPrice: 32000, deposit: 1500, location: 'Baner, Pune', district: 'Pune', state: 'Maharashtra', distance: 5.0, rating: 4.0, reviews: 34, available: true, units: 3, owner: 'Kavita Jadhav', ownerPhone: '+91 54321 09876', specs: '3 Bottom, Hydraulic Cylinder, Heavy Duty', yearMade: 2020, brand: 'Generic', listingType: 'both', hasDriver: false },
{ id: 'eq-012', name: 'AARAIKk Agricultural Thresher PH-254042', category: 'Thresher', image: "https://img.rocket.new/generatedImages/rocket_gen_img_40554b628-1790275730699.png", imageAlt: 'Orange agricultural thresher machine with AARAIKk branding in farm yard — real photograph from equipment listing', rentPerDay: 1800, rentPerHour: 250, buyPrice: 145000, deposit: 5000, location: 'Mundhwa, Pune', district: 'Pune', state: 'Maharashtra', distance: 9.4, rating: 4.4, reviews: 67, available: true, units: 1, owner: 'Ganesh More', ownerPhone: '+91 43210 98765', specs: '15 HP, 4000 kg/hr Capacity, Model PH-254042', yearMade: 2022, brand: 'AARAIKk', listingType: 'rent', hasDriver: false },
{ id: 'eq-013', name: 'Sonalika Farm Trailer', category: 'Trailer', image: "https://images.unsplash.com/photo-1618337018520-3b792841c0bc", imageAlt: 'Blue Sonalika brand farm trailer with black chassis and large off-road tires parked in a field — real photograph', rentPerDay: 1500, rentPerHour: 200, buyPrice: 180000, deposit: 4000, location: 'Hadapsar, Pune', district: 'Pune', state: 'Maharashtra', distance: 3.2, rating: 4.5, reviews: 91, available: true, units: 2, owner: 'Rajesh Patil', ownerPhone: '+91 98765 43210', specs: 'Heavy Duty, Off-Road Tires, Wheat Stalk Icons', yearMade: 2021, brand: 'Sonalika', listingType: 'both', hasDriver: false },
{ id: 'eq-014', name: 'Disc Harrow (Heavy Duty)', category: 'Disc Harrow', image: "https://images.unsplash.com/photo-1692397742537-689460d949ec", imageAlt: 'Weathered blue-painted metal disc harrow agricultural implement on dirt ground beside white wall — real photograph', rentPerDay: 900, rentPerHour: 130, buyPrice: 45000, deposit: 2000, location: 'Kothrud, Pune', district: 'Pune', state: 'Maharashtra', distance: 4.8, rating: 4.1, reviews: 48, available: true, units: 2, owner: 'Priya Deshmukh', ownerPhone: '+91 87654 32109', specs: 'Heavy Duty, Blue Painted, Multiple Discs', yearMade: 2019, brand: 'Generic', listingType: 'both', hasDriver: false }];


export const CATEGORIES = ['All', 'Tractor', 'Harvester', 'Rotavator', 'Seed Drill', 'Sprayer', 'Power Tiller', 'Plough', 'Thresher', 'Trailer', 'Disc Harrow', 'Cultivator'];

export interface FilterState {
  categories: string[];listingType: 'all' | 'rent' | 'buy';
  minPrice: number;maxPrice: number;minRating: number;
  availableOnly: boolean;maxDistance: number;searchQuery: string;
  supplierType: 'all' | 'tractor-only' | 'with-driver';
  locationFilter: string;
}

const DEFAULT_FILTERS: FilterState = { categories: [], listingType: 'all', minPrice: 0, maxPrice: 10000, minRating: 0, availableOnly: false, maxDistance: 50, searchQuery: '', supplierType: 'all', locationFilter: '' };

export default function EquipmentListingContent() {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState<string>('nearest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filtered = useMemo(() => {
    let result = [...ALL_EQUIPMENT];
    if (filters.searchQuery) {
      const q = filters.searchQuery.toLowerCase();
      result = result.filter((e) => e.name.toLowerCase().includes(q) || e.category.toLowerCase().includes(q) || e.brand.toLowerCase().includes(q) || e.location.toLowerCase().includes(q));
    }
    if (filters.categories.length > 0) result = result.filter((e) => filters.categories.includes(e.category));
    if (filters.listingType !== 'all') result = result.filter((e) => e.listingType === filters.listingType || e.listingType === 'both');
    result = result.filter((e) => e.rentPerDay >= filters.minPrice && e.rentPerDay <= filters.maxPrice);
    if (filters.minRating > 0) result = result.filter((e) => e.rating >= filters.minRating);
    if (filters.availableOnly) result = result.filter((e) => e.available);
    result = result.filter((e) => e.distance <= filters.maxDistance);
    if (filters.supplierType === 'with-driver') result = result.filter((e) => e.hasDriver === true);
    if (filters.supplierType === 'tractor-only') result = result.filter((e) => !e.hasDriver);
    if (filters.locationFilter) result = result.filter((e) => e.district === filters.locationFilter || e.location.includes(filters.locationFilter));
    switch (sortBy) {
      case 'price-asc':result.sort((a, b) => a.rentPerDay - b.rentPerDay);break;
      case 'price-desc':result.sort((a, b) => b.rentPerDay - a.rentPerDay);break;
      case 'nearest':result.sort((a, b) => a.distance - b.distance);break;
      case 'rating':result.sort((a, b) => b.rating - a.rating);break;
      case 'available':result.sort((a, b) => a.available === b.available ? 0 : a.available ? -1 : 1);break;
    }
    return result;
  }, [filters, sortBy]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function clearFilter(key: keyof FilterState) {setFilters((prev) => ({ ...prev, [key]: DEFAULT_FILTERS[key] }));setCurrentPage(1);}
  function clearAllFilters() {setFilters(DEFAULT_FILTERS);setCurrentPage(1);}

  const activeFilterChips: {label: string;key: keyof FilterState;}[] = [];
  if (filters.categories.length > 0) activeFilterChips.push({ label: filters.categories.join(', '), key: 'categories' });
  if (filters.listingType !== 'all') activeFilterChips.push({ label: filters.listingType === 'rent' ? 'For Rent' : 'For Buy', key: 'listingType' });
  if (filters.availableOnly) activeFilterChips.push({ label: 'Available Only', key: 'availableOnly' });
  if (filters.minRating > 0) activeFilterChips.push({ label: `${filters.minRating}★+`, key: 'minRating' });
  if (filters.maxDistance < 50) activeFilterChips.push({ label: `Within ${filters.maxDistance} km`, key: 'maxDistance' });
  if (filters.supplierType !== 'all') activeFilterChips.push({ label: filters.supplierType === 'with-driver' ? 'With Driver' : 'Tractor Only', key: 'supplierType' });
  if (filters.locationFilter) activeFilterChips.push({ label: filters.locationFilter, key: 'locationFilter' });

  return (
    <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
      <div className="mb-5">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2"><span>Home</span><span>/</span><span className="text-primary font-medium">Equipment</span></div>
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agricultural Equipment</h1>
            <p className="text-sm text-muted-foreground mt-0.5"><span className="font-semibold text-primary font-tabular">{filtered.length}</span> equipment found near Pune, MH</p>
          </div>
          <button onClick={() => setMobileFiltersOpen(true)} className="lg:hidden btn-secondary gap-2 py-2" suppressHydrationWarning>
            <SlidersHorizontal size={16} />Filters
            {activeFilterChips.length > 0 && <span className="w-5 h-5 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">{activeFilterChips.length}</span>}
          </button>
        </div>
      </div>

      <EquipmentSearchBar value={filters.searchQuery} onChange={(v) => {setFilters((p) => ({ ...p, searchQuery: v }));setCurrentPage(1);}} />

      <div className="mt-4 mb-2 bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/20 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center shrink-0"><Users size={20} className="text-primary" /></div>
          <div><p className="font-bold text-sm text-foreground">Group Booking Available</p><p className="text-xs text-muted-foreground">Share equipment costs with neighboring farmers and save up to 60%</p></div>
        </div>
        <Link href="/equipment/group-booking" className="shrink-0 px-4 py-2 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-colors whitespace-nowrap">Book as Group</Link>
      </div>

      {activeFilterChips.length > 0 &&
      <div className="flex flex-wrap items-center gap-2 mt-3 mb-4">
          <span className="text-xs text-muted-foreground font-medium">Active filters:</span>
          {activeFilterChips.map((chip) =>
        <button key={`chip-${chip.key}`} onClick={() => clearFilter(chip.key)} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-secondary border border-primary/20 text-primary text-xs font-semibold hover:bg-danger-bg hover:text-danger hover:border-danger/20 transition-colors duration-150">
              {chip.label}<X size={11} />
            </button>
        )}
          <button onClick={clearAllFilters} className="text-xs text-danger font-semibold hover:underline">Clear All</button>
        </div>
      }

      <div className="flex gap-6">
        <div className={`hidden lg:block shrink-0 transition-all duration-300 ${filtersOpen ? 'w-64 xl:w-72' : 'w-0 overflow-hidden'}`}>
          <EquipmentFilters filters={filters} onChange={(f) => {setFilters(f);setCurrentPage(1);}} onToggle={() => setFiltersOpen(!filtersOpen)} isOpen={filtersOpen} />
        </div>

        <div className="flex-1 min-w-0">
          <EquipmentSortBar sortBy={sortBy} onSortChange={setSortBy} viewMode={viewMode} onViewChange={setViewMode} totalCount={filtered.length} filtersOpen={filtersOpen} onToggleFilters={() => setFiltersOpen(!filtersOpen)} />

          {paginated.length === 0 ?
          <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="text-5xl mb-4">🚜</div>
              <h3 className="font-bold text-lg text-foreground mb-2">No Equipment Found</h3>
              <p className="text-sm text-muted-foreground mb-4 max-w-sm">No equipment matches your current filters near Pune. Try adjusting the category, price range, or distance.</p>
              <button onClick={clearAllFilters} className="btn-primary">Clear All Filters</button>
            </div> :
          viewMode === 'grid' ? <EquipmentGrid equipment={paginated} /> : <EquipmentListView equipment={paginated} />}

          {totalPages > 1 &&
          <div className="flex items-center justify-between mt-8 flex-wrap gap-3">
              <p className="text-sm text-muted-foreground">Showing <span className="font-semibold font-tabular text-foreground">{(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filtered.length)}</span> of <span className="font-semibold font-tabular text-foreground">{filtered.length}</span> equipment</p>
              <div className="flex items-center gap-1.5">
                <button onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">← Prev</button>
                {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                const show = page === 1 || page === totalPages || Math.abs(page - currentPage) <= 1;
                if (!show) {if (page === 2 || page === totalPages - 1) return <span key={`page-ellipsis-${page}`} className="px-1 text-muted-foreground">...</span>;return null;}
                return <button key={`page-${page}`} onClick={() => setCurrentPage(page)} className={`w-9 h-9 rounded-lg text-sm font-semibold transition-all duration-150 ${currentPage === page ? 'gradient-green text-white shadow-sm' : 'border border-border hover:bg-secondary text-foreground'}`}>{page}</button>;
              })}
                <button onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg border border-border text-sm font-medium hover:bg-secondary disabled:opacity-40 disabled:cursor-not-allowed transition-colors">Next →</button>
              </div>
            </div>
          }
        </div>
      </div>

      {mobileFiltersOpen &&
      <div className="fixed inset-0 z-[60] lg:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
          <div className="absolute left-0 top-0 h-full w-80 max-w-full bg-card shadow-modal overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border sticky top-0 bg-card z-10">
              <h3 className="font-bold text-base text-foreground">Filters</h3>
              <button onClick={() => setMobileFiltersOpen(false)} className="p-1.5 rounded-lg hover:bg-muted"><X size={18} /></button>
            </div>
            <div className="p-4"><EquipmentFilters filters={filters} onChange={(f) => {setFilters(f);setCurrentPage(1);}} onToggle={() => setMobileFiltersOpen(false)} isOpen /></div>
            <div className="sticky bottom-0 bg-card border-t border-border p-4">
              <button onClick={() => setMobileFiltersOpen(false)} className="w-full btn-primary py-3">Show {filtered.length} Results</button>
            </div>
          </div>
        </div>
      }
    </div>);

}