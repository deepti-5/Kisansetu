'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { MapPin, Star, Heart, ArrowRight, Tag, ShoppingCart } from 'lucide-react';

const EQUIPMENT = [
{
  id: 'eq-001',
  name: 'Mahindra Yuvo 575 DI',
  category: 'Tractor',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_10815e2b9-1779367071248.png",
  imageAlt: 'Red Mahindra Yuvo 575 DI tractor parked on farm with green fields in background',
  rentPerDay: 2500,
  buyPrice: 750000,
  deposit: 10000,
  location: 'Hadapsar, Pune',
  distance: 2.4,
  rating: 4.6,
  reviews: 128,
  available: true,
  owner: 'Rajesh Patil'
},
{
  id: 'eq-002',
  name: 'Kubota Rotavator 5ft',
  category: 'Rotavator',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1d6979e39-1772085566274.png",
  imageAlt: 'Orange Kubota rotavator attachment on tractor tilling brown agricultural soil',
  rentPerDay: 800,
  buyPrice: 85000,
  deposit: 2000,
  location: 'Kothrud, Pune',
  distance: 3.1,
  rating: 4.3,
  reviews: 74,
  available: true,
  owner: 'Priya Deshmukh'
},
{
  id: 'eq-003',
  name: 'John Deere W70 Harvester',
  category: 'Harvester',
  image: "https://images.unsplash.com/photo-1653474351870-0c89db2d1654",
  imageAlt: 'Yellow John Deere combine harvester working in golden wheat field at sunset',
  rentPerDay: 8000,
  buyPrice: 3200000,
  deposit: 25000,
  location: 'Sinhagad Road, Pune',
  distance: 5.7,
  rating: 4.7,
  reviews: 203,
  available: false,
  owner: 'Sunil Mane'
},
{
  id: 'eq-004',
  name: 'Fieldking Seed Drill',
  category: 'Seed Drill',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_104eaccee-1768761568871.png",
  imageAlt: 'Green seed drill agricultural implement attached to tractor in brown ploughed field',
  rentPerDay: 1200,
  buyPrice: 95000,
  deposit: 3000,
  location: 'Wagholi, Pune',
  distance: 8.2,
  rating: 4.2,
  reviews: 56,
  available: true,
  owner: 'Anil Shinde'
}];


export default function FeaturedEquipment() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  function toggleWish(id: string) {
    setWishlist((prev) => prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]);
  }

  return (
    <section className="py-10 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🚜</span>
              <h2 className="section-title">Equipment</h2>
            </div>
            <p className="section-subtitle">Browse, rent or buy agricultural machinery near Pune, MH</p>
          </div>
          <Link
            href="/equipment-listing-page"
            className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            
            View All Equipment <ArrowRight size={16} />
          </Link>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EQUIPMENT.map((item) =>
          <div key={item.id} className="card-base card-hover overflow-hidden group">
              {/* Image */}
              <div className="relative h-44 overflow-hidden">
                <AppImage
                src={item.image}
                alt={item.imageAlt}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300" />
              
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                {/* Wishlist */}
                <button
                suppressHydrationWarning
                onClick={() => toggleWish(item.id)}
                className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${
                wishlist.includes(item.id) ?
                'bg-danger text-white' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white'}`
                }>
                
                  <Heart size={14} fill={wishlist.includes(item.id) ? 'currentColor' : 'none'} />
                </button>
                {/* Availability */}
                <div className="absolute bottom-2.5 left-2.5">
                  <span
                  className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  item.available ? 'bg-success text-white' : 'bg-danger text-white'}`
                  }>
                  
                    {item.available ? '✓ Available' : 'Booked'}
                  </span>
                </div>
                {/* Category */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="badge-green text-xs">{item.category}</span>
                </div>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-1">{item.name}</h3>

                {/* Rating + Location */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star size={12} className="text-accent fill-accent" />
                    <span className="text-xs font-semibold text-foreground font-tabular">{item.rating}</span>
                    <span className="text-xs text-muted-foreground">({item.reviews})</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={11} className="text-primary" />
                    {item.distance} km
                  </div>
                </div>

                {/* Pricing */}
                <div className="bg-muted rounded-lg p-2.5 mb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Tag size={10} />
                      Rent/day
                    </div>
                    <span className="text-sm font-bold text-primary font-tabular">
                      ₹{item.rentPerDay.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ShoppingCart size={10} />
                      Buy price
                    </div>
                    <span className="text-xs font-semibold text-foreground font-tabular">
                      ₹{(item.buyPrice / 100000).toFixed(1)}L
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Deposit</span>
                    <span className="text-xs text-warning font-semibold font-tabular">
                      ₹{item.deposit.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Location */}
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin size={11} className="text-primary shrink-0" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-2">
                  <Link
                  href={`/equipment/${item.id}`}
                  className="btn-primary text-xs py-2 px-3 justify-center">
                  
                    Rent Now
                  </Link>
                  <Link
                  href={`/equipment/${item.id}`}
                  className="btn-secondary text-xs py-2 px-3 justify-center">
                  
                    Buy Now
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center md:hidden">
          <Link href="/equipment-listing-page" className="btn-secondary gap-2">
            View All Equipment <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>);

}