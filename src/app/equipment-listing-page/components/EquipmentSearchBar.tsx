'use client';

import React from 'react';
import { Search, Mic, X } from 'lucide-react';

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export default function EquipmentSearchBar({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary focus-within:ring-2 focus-within:ring-ring transition-all mb-4">
      <Search size={18} className="text-muted-foreground shrink-0" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search equipment by name, category, brand..."
        className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
        suppressHydrationWarning
      />
      {value && (
        <button onClick={() => onChange('')} className="p-1 rounded hover:bg-muted">
          <X size={14} className="text-muted-foreground" />
        </button>
      )}
      <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors" title="Voice search" suppressHydrationWarning>
        <Mic size={16} />
      </button>
    </div>
  );
}
