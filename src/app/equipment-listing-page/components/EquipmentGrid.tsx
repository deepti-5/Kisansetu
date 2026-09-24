'use client';

import React, { useState } from 'react';
import AppImage from '@/components/ui/AppImage';
import { Equipment } from './EquipmentListingContent';
import { MapPin, Star, Heart, Tag, ShoppingCart, Phone, Eye } from 'lucide-react';
import { toast } from 'sonner';
import RentNowModal from './RentNowModal';
import Link from 'next/link';

interface Props { equipment: Equipment[]; }

export default function EquipmentGrid({ equipment }: Props) {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {equipment.map((item) => (
          <div key={item.id} className="card-base card-hover overflow-hidden group flex flex-col">
            <div className="relative h-48 overflow-hidden shrink-0">
              <AppImage src={item.image} alt={item.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <button onClick={() => toggleWish(item.id, item.name)} className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${wishlist.includes(item.id) ? 'bg-danger text-white scale-110' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white hover:text-danger'}`}>
                <Heart size={14} fill={wishlist.includes(item.id) ? 'currentColor' : 'none'} />
              </button>
              <div className="absolute top-3 left-3"><span className="badge-green text-xs">{item.category}</span></div>
              <div className="absolute bottom-3 left-3">
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.available ? 'bg-success text-white' : 'bg-danger/90 text-white'}`}>
                  {item.available ? `✓ Available (${item.units} unit${item.units > 1 ? 's' : ''})` : '✕ Currently Booked'}
                </span>
              </div>
              <div className="absolute bottom-3 right-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.listingType === 'rent' ? 'bg-blue-500 text-white' : item.listingType === 'buy' ? 'bg-accent text-white' : 'bg-primary text-white'}`}>
                  {item.listingType === 'both' ? 'Rent & Buy' : item.listingType === 'rent' ? 'Rent Only' : 'Buy Only'}
                </span>
              </div>
            </div>

            <div className="p-4 flex flex-col flex-1">
              <div className="mb-2">
                <h3 className="font-bold text-sm text-foreground line-clamp-2 leading-snug mb-1">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.brand} · {item.specs}</p>
              </div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-1">
                  <Star size={12} className="text-accent fill-accent" />
                  <span className="text-xs font-bold text-foreground font-tabular">{item.rating}</span>
                  <span className="text-xs text-muted-foreground">({item.reviews} reviews)</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin size={11} className="text-primary" />
                  <span className="font-tabular">{item.distance} km away</span>
                </div>
              </div>

              <div className="bg-muted/60 rounded-lg p-3 mb-3 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Tag size={11} />Rent per day</div>
                  <span className="text-base font-bold text-primary font-tabular">₹{item.rentPerDay.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Tag size={11} />Rent per hour</div>
                  <span className="text-xs font-semibold text-foreground font-tabular">₹{item.rentPerHour}/hr</span>
                </div>
                {item.listingType !== 'rent' && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><ShoppingCart size={11} />Buy price</div>
                    <span className="text-xs font-semibold text-foreground font-tabular">₹{(item.buyPrice / 100000).toFixed(1)}L</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">Security deposit</span>
                  <span className="text-xs font-bold text-warning font-tabular">₹{item.deposit.toLocaleString('en-IN')} (refundable)</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-5 h-5 rounded-full gradient-green flex items-center justify-center">
                    <span className="text-white text-[9px] font-bold">{item.owner.split(' ').map((n) => n[0]).join('')}</span>
                  </div>
                  <span className="line-clamp-1">{item.owner}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin size={10} className="text-primary shrink-0" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>
              </div>

              <div className="mt-auto grid grid-cols-3 gap-2">
                <button disabled={!item.available} onClick={() => item.available && setSelectedEquipment(item)} className={`col-span-1 flex items-center justify-center gap-1 py-2 rounded-lg text-xs font-bold transition-all btn-press ${item.available ? 'gradient-green text-white hover:opacity-90' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>Rent</button>
                {item.listingType !== 'rent' ? (
                  <button className="col-span-1 btn-accent text-xs py-2 justify-center">Buy</button>
                ) : (
                  <button className="col-span-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-border text-xs font-semibold text-muted-foreground hover:bg-muted transition-colors"><Phone size={12} /> Call</button>
                )}
                <Link href={`/equipment/${item.id}`} className="col-span-1 flex items-center justify-center gap-1 py-2 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"><Eye size={12} /> View</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      {selectedEquipment && <RentNowModal equipment={selectedEquipment} onClose={() => setSelectedEquipment(null)} />}
    </>
  );
}
