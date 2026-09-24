'use client';

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { Equipment } from './EquipmentListingContent';
import { MapPin, Star, Heart, Tag, Phone } from 'lucide-react';
import { toast } from 'sonner';
import RentNowModal from './RentNowModal';

interface Props { equipment: Equipment[]; }

export default function EquipmentListView({ equipment }: Props) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  function toggleWish(id: string, name: string) {
    setWishlist((prev) => {
      if (prev.includes(id)) { toast.success(`${name} removed from wishlist`); return prev.filter((w) => w !== id); }
      toast.success(`${name} saved to wishlist ❤️`); return [...prev, id];
    });
  }

  return (
    <>
      <div className="space-y-3">
        {equipment.map((item) => (
          <div key={item.id} className="card-base overflow-hidden hover:border-primary/30 hover:shadow-card-hover transition-all duration-200 group">
            <div className="flex gap-0">
              <div className="relative w-40 sm:w-48 shrink-0 overflow-hidden">
                <AppImage src={item.image} alt={item.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/20" />
                <div className="absolute top-2 left-2"><span className="badge-green text-xs">{item.category}</span></div>
                <button onClick={() => toggleWish(item.id, item.name)} className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all ${wishlist.includes(item.id) ? 'bg-danger text-white' : 'bg-white/80 text-muted-foreground hover:text-danger'}`}>
                  <Heart size={12} fill={wishlist.includes(item.id) ? 'currentColor' : 'none'} />
                </button>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-foreground line-clamp-1">{item.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{item.brand} · {item.specs} · {item.yearMade}</p>
                    <div className="flex flex-wrap items-center gap-3 text-xs">
                      <div className="flex items-center gap-1"><Star size={12} className="text-accent fill-accent" /><span className="font-bold font-tabular">{item.rating}</span><span className="text-muted-foreground">({item.reviews})</span></div>
                      <div className="flex items-center gap-1 text-muted-foreground"><MapPin size={11} className="text-primary" />{item.location} · {item.distance} km</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.available ? 'bg-success-bg text-success' : 'bg-danger-bg text-danger'}`}>{item.available ? `Available (${item.units} units)` : 'Booked'}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0 hidden sm:block">
                    <p className="text-xs text-muted-foreground">Rent/day</p>
                    <p className="text-xl font-bold text-primary font-tabular">₹{item.rentPerDay.toLocaleString('en-IN')}</p>
                    {item.listingType !== 'rent' && <p className="text-xs text-muted-foreground font-tabular">Buy: ₹{(item.buyPrice / 100000).toFixed(1)}L</p>}
                    <p className="text-xs text-warning font-semibold font-tabular">Dep: ₹{item.deposit.toLocaleString('en-IN')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2 sm:hidden">
                  <div className="flex items-center gap-1 text-xs text-muted-foreground"><Tag size={10} /><span className="font-bold text-primary font-tabular">₹{item.rentPerDay}/day</span></div>
                  <span className="text-xs text-warning font-tabular">Dep: ₹{item.deposit.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mr-auto">
                    <div className="w-5 h-5 rounded-full gradient-green flex items-center justify-center"><span className="text-white text-[8px] font-bold">{item.owner.split(' ').map((n) => n[0]).join('')}</span></div>
                    {item.owner}
                  </div>
                  <button disabled={!item.available} onClick={() => item.available && setSelectedEquipment(item)} className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all btn-press ${item.available ? 'gradient-green text-white hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>Rent Now</button>
                  {item.listingType !== 'rent' && <button className="btn-accent text-xs py-1.5 px-4">Buy Now</button>}
                  <button className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted transition-colors"><Phone size={12} /> Call</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedEquipment && <RentNowModal equipment={selectedEquipment} onClose={() => setSelectedEquipment(null)} />}
    </>
  );
}
