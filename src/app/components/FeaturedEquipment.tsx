'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppImage from '@/components/ui/AppImage';
import { MapPin, Star, Heart, ArrowRight, Tag, ShoppingCart } from 'lucide-react';

const EQUIPMENT = [
{
  id: 'eq-001',
  name: 'Massey Ferguson 241 DI Tractor',
  category: 'Tractor',
  image: "https://images.unsplash.com/photo-1644828320537-35456847a8c6",
  imageAlt: 'Red Massey Ferguson 241 DI tractor parked outdoors on farm — real photograph matching PDF equipment listing',
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
  id: 'eq-005',
  name: 'Maschio Rotary Tiller',
  category: 'Rotavator',
  image: "https://images.unsplash.com/photo-1521619179741-b5f97af5e982",
  imageAlt: 'Red Maschio brand rotary tiller agricultural implement sitting in a field — real photograph from PDF equipment collection',
  rentPerDay: 800,
  buyPrice: 85000,
  deposit: 2000,
  location: 'Baner, Pune',
  distance: 4.5,
  rating: 4.2,
  reviews: 89,
  available: true,
  owner: 'Kavita Jadhav'
},
{
  id: 'eq-009',
  name: 'YARA Agriculture Knapsack Sprayer',
  category: 'Sprayer',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1b80e26e4-1764852457679.png",
  imageAlt: 'Blue YARA Agriculture knapsack sprayer with yellow nozzle standing in field at sunset — real photograph from PDF equipment collection',
  rentPerDay: 300,
  buyPrice: 4500,
  deposit: 500,
  location: 'Kothrud, Pune',
  distance: 2.9,
  rating: 4.1,
  reviews: 112,
  available: true,
  owner: 'Priya Deshmukh'
},
{
  id: 'eq-013',
  name: 'Sonalika Farm Trailer',
  category: 'Trailer',
  image: "https://images.unsplash.com/photo-1618337018520-3b792841c0bc",
  imageAlt: 'Blue Sonalika brand farm trailer with black chassis and large off-road tires parked in a field — real photograph from PDF equipment collection',
  rentPerDay: 1500,
  buyPrice: 180000,
  deposit: 4000,
  location: 'Hadapsar, Pune',
  distance: 3.2,
  rating: 4.5,
  reviews: 91,
  available: true,
  owner: 'Rajesh Patil'
}];


export default function FeaturedEquipment() {
  const [wishlist, setWishlist] = useState<string[]>([]);

  function toggleWish(id: string) {
    setWishlist((prev) => prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]);
  }

  return (
    <section className="py-10 bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">🚜</span>
              <h2 className="section-title">Equipment</h2>
            </div>
            <p className="section-subtitle">Browse, rent or buy agricultural machinery near Pune, MH</p>
          </div>
          <Link href="/equipment-listing-page" className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View All Equipment <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {EQUIPMENT.map((item) =>
          <div key={item.id} className="card-base card-hover overflow-hidden group">
              <div className="relative h-44 overflow-hidden">
                <AppImage src={item.image} alt={item.imageAlt} fill className="object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <button
                suppressHydrationWarning
                onClick={() => toggleWish(item.id)}
                className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 ${wishlist.includes(item.id) ? 'bg-danger text-white' : 'bg-white/80 backdrop-blur-sm text-muted-foreground hover:bg-white'}`}>
                
                  <Heart size={14} fill={wishlist.includes(item.id) ? 'currentColor' : 'none'} />
                </button>
                <div className="absolute bottom-2.5 left-2.5">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.available ? 'bg-success text-white' : 'bg-danger text-white'}`}>
                    {item.available ? '✓ Available' : 'Booked'}
                  </span>
                </div>
                <div className="absolute top-2.5 left-2.5">
                  <span className="badge-green text-xs">{item.category}</span>
                </div>
              </div>

              <div className="p-4">
                <h3 className="font-bold text-sm text-foreground line-clamp-1 mb-1">{item.name}</h3>
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

                <div className="bg-muted rounded-lg p-2.5 mb-3 space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><Tag size={10} />Rent/day</div>
                    <span className="text-sm font-bold text-primary font-tabular">₹{item.rentPerDay.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground"><ShoppingCart size={10} />Buy price</div>
                    <span className="text-xs font-semibold text-foreground font-tabular">₹{(item.buyPrice / 100000).toFixed(1)}L</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Deposit</span>
                    <span className="text-xs text-warning font-semibold font-tabular">₹{item.deposit.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                  <MapPin size={11} className="text-primary shrink-0" />
                  <span className="line-clamp-1">{item.location}</span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link href={`/equipment/${item.id}`} className="btn-primary text-xs py-2 px-3 justify-center">Rent Now</Link>
                  <Link href={`/equipment/${item.id}`} className="btn-secondary text-xs py-2 px-3 justify-center">Buy Now</Link>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-center md:hidden">
          <Link href="/equipment-listing-page" className="btn-secondary gap-2">View All Equipment <ArrowRight size={16} /></Link>
        </div>
      </div>
    </section>);

}