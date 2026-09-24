'use client';

import React, { useState } from 'react';
import { FilterState, CATEGORIES } from './EquipmentListingContent';
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  onToggle: () => void;
  isOpen: boolean;
}

const RATINGS = [4.5, 4.0, 3.5, 3.0];
const DISTANCES = [5, 10, 20, 30, 50];

export default function EquipmentFilters({ filters, onChange }: Props) {
  const [openSections, setOpenSections] = React.useState({
    category: true,
    listingType: true,
    price: true,
    rating: true,
    availability: true,
    distance: true,
  });

  function toggleSection(key: keyof typeof openSections) {
    setOpenSections((p) => ({ ...p, [key]: !p[key] }));
  }

  function toggleCategory(cat: string) {
    const cats = filters.categories.includes(cat)
      ? filters.categories.filter((c) => c !== cat)
      : [...filters.categories, cat];
    onChange({ ...filters, categories: cats });
  }

  return (
    <div className="card-base overflow-hidden sticky top-20">
      <div className="px-4 py-3 border-b border-border bg-muted/30">
        <h3 className="font-bold text-sm text-foreground">Filters</h3>
      </div>

      <div className="divide-y divide-border max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
        {/* Category */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('category')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-semibold text-foreground">Category</span>
            {openSections.category ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {openSections.category && (
            <div className="space-y-2">
              {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                <label key={`filter-cat-${cat}`} className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={filters.categories.includes(cat)}
                    onChange={() => toggleCategory(cat)}
                    className="w-4 h-4 rounded accent-primary"
                  />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Listing Type */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('listingType')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-semibold text-foreground">Listing Type</span>
            {openSections.listingType ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {openSections.listingType && (
            <div className="flex gap-2">
              {(['all', 'rent', 'buy'] as const).map((type) => (
                <button
                  key={`type-${type}`}
                  onClick={() => onChange({ ...filters, listingType: type })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-150 capitalize ${
                    filters.listingType === type
                      ? 'gradient-green text-white border-transparent' :'border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {type === 'all' ? 'All' : type === 'rent' ? 'For Rent' : 'For Buy'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('price')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-semibold text-foreground">Rent Price / Day</span>
            {openSections.price ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {openSections.price && (
            <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span className="font-tabular">₹{filters.minPrice.toLocaleString('en-IN')}</span>
                <span className="font-tabular">₹{filters.maxPrice.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={100}
                value={filters.maxPrice}
                onChange={(e) => onChange({ ...filters, maxPrice: Number(e.target.value) })}
                className="w-full accent-primary"
              />
              <div className="flex gap-2 mt-2">
                {[500, 1000, 2000, 5000].map((p) => (
                  <button
                    key={`price-chip-${p}`}
                    onClick={() => onChange({ ...filters, maxPrice: p })}
                    className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${
                      filters.maxPrice === p ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    ≤{p >= 1000 ? `${p / 1000}k` : p}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Rating */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('rating')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-semibold text-foreground">Minimum Rating</span>
            {openSections.rating ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {openSections.rating && (
            <div className="space-y-1.5">
              {RATINGS.map((r) => (
                <button
                  key={`rating-${r}`}
                  onClick={() => onChange({ ...filters, minRating: filters.minRating === r ? 0 : r })}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                    filters.minRating === r
                      ? 'bg-secondary border border-primary/30 text-primary' :'hover:bg-muted text-foreground border border-transparent'
                  }`}
                >
                  <span className="text-accent">{'★'.repeat(Math.floor(r))}</span>
                  <span className="font-semibold font-tabular">{r}+</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Availability */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('availability')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-semibold text-foreground">Availability</span>
            {openSections.availability ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {openSections.availability && (
            <label className="flex items-center gap-2.5 cursor-pointer">
              <div
                onClick={() => onChange({ ...filters, availableOnly: !filters.availableOnly })}
                className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${
                  filters.availableOnly ? 'bg-primary' : 'bg-muted-foreground/30'
                }`}
              >
                <div
                  className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${
                    filters.availableOnly ? 'translate-x-5' : 'translate-x-0.5'
                  }`}
                />
              </div>
              <span className="text-sm text-foreground">Available equipment only</span>
            </label>
          )}
        </div>

        {/* Distance */}
        <div className="p-4">
          <button
            onClick={() => toggleSection('distance')}
            className="flex items-center justify-between w-full mb-3"
          >
            <span className="text-sm font-semibold text-foreground">Max Distance</span>
            {openSections.distance ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {openSections.distance && (
            <div className="flex flex-wrap gap-2">
              {DISTANCES.map((d) => (
                <button
                  key={`dist-${d}`}
                  onClick={() => onChange({ ...filters, maxDistance: d })}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filters.maxDistance === d
                      ? 'gradient-green text-white border-transparent' :'border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {d} km
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}