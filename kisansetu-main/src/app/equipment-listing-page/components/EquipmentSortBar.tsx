'use client';

import React from 'react';
import { LayoutGrid, List, SlidersHorizontal, ChevronDown } from 'lucide-react';

interface Props {
  sortBy: string;
  onSortChange: (s: string) => void;
  viewMode: 'grid' | 'list';
  onViewChange: (v: 'grid' | 'list') => void;
  totalCount: number;
  filtersOpen: boolean;
  onToggleFilters: () => void;
}

const SORT_OPTIONS = [
  { value: 'nearest', label: 'Nearest First' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'available', label: 'Most Available' },
];

export default function EquipmentSortBar({
  sortBy, onSortChange, viewMode, onViewChange, totalCount, filtersOpen, onToggleFilters,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleFilters}
          className="hidden lg:flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-secondary transition-colors"
        >
          <SlidersHorizontal size={15} className="text-primary" />
          {filtersOpen ? 'Hide Filters' : 'Show Filters'}
        </button>
        <span className="text-sm text-muted-foreground hidden sm:block">
          <span className="font-semibold text-foreground font-tabular">{totalCount}</span> results
        </span>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Sort */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:border-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-ring transition-all cursor-pointer"
            suppressHydrationWarning
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={`sort-${opt.value}`} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>

        {/* View Toggle */}
        <div className="flex items-center border border-border rounded-lg overflow-hidden">
          <button
            onClick={() => onViewChange('grid')}
            className={`p-2.5 transition-colors ${viewMode === 'grid' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}
          >
            <LayoutGrid size={16} />
          </button>
          <button
            onClick={() => onViewChange('list')}
            className={`p-2.5 transition-colors ${viewMode === 'list' ? 'bg-primary text-white' : 'bg-card text-muted-foreground hover:bg-muted'}`}
          >
            <List size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}