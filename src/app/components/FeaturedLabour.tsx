'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import { MapPin, Star, Heart, ArrowRight, Phone, UserCheck } from 'lucide-react';

const LABOUR = [
{
  id: 'lab-001',
  name: 'Ramesh Yadav',
  role: 'Harvesting Worker',
  image: "/assets/images/farmer-man-hoe-yellow.png",
  imageAlt: 'Indian male farmer in yellow shirt and white turban carrying a hoe over his shoulder in a green agricultural field',
  ratePerDay: 500,
  rating: 4.6,
  reviews: 89,
  location: 'Hadapsar, Pune',
  distance: 1.8,
  skills: ['Harvesting', 'Threshing', 'Winnowing'],
  experience: '6 years',
  available: true,
  phone: '+919876543210'
},
{
  id: 'lab-002',
  name: 'Sunita Devi',
  role: 'Seed Sowing Expert',
  image: "/assets/images/farmer-woman-wheat.png",
  imageAlt: 'Smiling Indian woman farmer in pink headscarf and green sari holding a bundle of harvested wheat in agricultural field',
  ratePerDay: 400,
  rating: 4.8,
  reviews: 47,
  location: 'Sinhagad, Pune',
  distance: 4.1,
  skills: ['Seed Sowing', 'Transplanting', 'Weeding'],
  experience: '8 years',
  available: true,
  phone: '+919876543213'
},
{
  id: 'lab-003',
  name: 'Suresh Patil',
  role: 'Tractor Operator',
  image: "/assets/images/farmer-man-hoe-pink-turban.png",
  imageAlt: 'Indian male farmer with grey beard and pink turban holding a hoe over his shoulder in a green agricultural field',
  ratePerDay: 700,
  rating: 4.4,
  reviews: 142,
  location: 'Kothrud, Pune',
  distance: 3.5,
  skills: ['Tractor Operation', 'Ploughing', 'Rotavation'],
  experience: '11 years',
  available: true,
  phone: '+919876543211'
},
{
  id: 'lab-004',
  name: 'Prakash Kamble',
  role: 'Combine Harvester Operator',
  image: "/assets/images/farmer-young-sickle.png",
  imageAlt: 'Young Indian male farmer with pink turban and striped shirt holding a sickle in a green agricultural field',
  ratePerDay: 900,
  rating: 4.9,
  reviews: 118,
  location: 'Hadapsar, Pune',
  distance: 2.1,
  skills: ['Combine Harvesting', 'Threshing', 'Grain Storage'],
  experience: '13 years',
  available: true,
  phone: '+919876543216'
}];


export default function FeaturedLabour() {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const router = useRouter();

  function toggleWish(id: string) {
    setWishlist((prev) => prev.includes(id) ? prev.filter((w) => w !== id) : [...prev, id]);
  }

  return (
    <section className="py-10 bg-muted/40">
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-2xl">👨‍🌾</span>
              <h2 className="section-title">Labour</h2>
            </div>
            <p className="section-subtitle">Find skilled farm workers near Pune, MH</p>
          </div>
          <Link href="/labour" className="hidden md:flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            View All Labour <ArrowRight size={16} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {LABOUR.map((person) =>
          <div key={person.id} className="card-base card-hover overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="relative shrink-0">
                    <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-border">
                      <AppImage src={person.image} alt={person.imageAlt} width={56} height={56} className="object-cover w-full h-full" />
                    </div>
                    <span className={`absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full border-2 border-card ${person.available ? 'bg-success' : 'bg-muted-foreground'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-sm text-foreground line-clamp-1">{person.name}</h3>
                    <p className="text-xs text-muted-foreground">{person.role}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="text-accent fill-accent" />
                      <span className="text-xs font-semibold font-tabular">{person.rating}</span>
                      <span className="text-xs text-muted-foreground">({person.reviews})</span>
                    </div>
                  </div>
                  <button
                  suppressHydrationWarning
                  onClick={() => toggleWish(person.id)}
                  className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${wishlist.includes(person.id) ? 'bg-danger text-white' : 'bg-muted text-muted-foreground hover:bg-danger/10 hover:text-danger'}`}>
                  
                    <Heart size={13} fill={wishlist.includes(person.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {person.skills.slice(0, 2).map((skill) =>
                <span key={`skill-${person.id}-${skill}`} className="badge-green text-xs">{skill}</span>
                )}
                  {person.skills.length > 2 && <span className="badge-blue text-xs">+{person.skills.length - 2}</span>}
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Daily Rate</p>
                    <p className="text-base font-bold text-primary font-tabular">₹{person.ratePerDay}/day</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Experience</p>
                    <p className="text-sm font-semibold text-foreground">{person.experience}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                  <MapPin size={11} className="text-primary" />
                  {person.location} · {person.distance} km
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                  suppressHydrationWarning
                  disabled={!person.available}
                  onClick={() => person.available && router.push(`/labour/${person.id}`)}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${person.available ? 'gradient-green text-white hover:opacity-90 btn-press' : 'bg-muted text-muted-foreground cursor-not-allowed'}`}>
                  
                    <UserCheck size={13} />
                    {person.available ? 'Hire Now' : 'Unavailable'}
                  </button>
                  <a href={`tel:${person.phone}`} className="btn-secondary text-xs py-2 gap-1.5 flex items-center justify-center">
                    <Phone size={13} />
                    Call
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>);

}