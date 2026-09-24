'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import { Search, X, MapPin, Star, Heart, Phone, UserCheck, Zap } from 'lucide-react';

interface Labour { id: string; name: string; role: string; image: string; imageAlt: string; ratePerDay: number; rating: number; reviews: number; location: string; distance: number; skills: string[]; experience: string; available: boolean; category: string; phone: string; }

const ALL_LABOUR: Labour[] = [
  { id: 'lab-001', name: 'Ramesh Yadav', role: 'Harvesting Worker', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_19b54ab7f-1772435023997.png', imageAlt: 'Indian male farm worker in his 30s wearing a blue shirt with confident expression', ratePerDay: 500, rating: 4.6, reviews: 89, location: 'Hadapsar, Pune', distance: 1.8, skills: ['Harvesting', 'Threshing', 'Winnowing'], experience: '6 years', available: true, category: 'Harvesting', phone: '+919876543210' },
  { id: 'lab-002', name: 'Suresh Patil', role: 'Tractor Operator', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_19b54ab7f-1772435023997.png', imageAlt: 'Indian male tractor operator in his 40s wearing white shirt and cap outdoors', ratePerDay: 700, rating: 4.4, reviews: 142, location: 'Kothrud, Pune', distance: 3.5, skills: ['Tractor Operation', 'Ploughing', 'Rotavation'], experience: '11 years', available: true, category: 'Tractor Operator', phone: '+919876543211' },
  { id: 'lab-003', name: 'Ganesh More', role: 'Spraying Worker', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_115c14105-1763296551367.png', imageAlt: 'Young Indian male agricultural worker wearing green shirt smiling outdoors', ratePerDay: 450, rating: 4.5, reviews: 63, location: 'Wagholi, Pune', distance: 6.2, skills: ['Pesticide Spraying', 'Crop Care', 'Irrigation'], experience: '4 years', available: false, category: 'Spraying', phone: '+919876543212' },
  { id: 'lab-004', name: 'Kavita Jadhav', role: 'Seed Sowing Expert', image: 'https://images.unsplash.com/photo-1708417145375-ed79c7131fab', imageAlt: 'Indian female agricultural worker in colorful saree working in green crop field', ratePerDay: 400, rating: 4.8, reviews: 47, location: 'Sinhagad, Pune', distance: 4.1, skills: ['Seed Sowing', 'Transplanting', 'Weeding'], experience: '8 years', available: true, category: 'Sowing', phone: '+919876543213' },
  { id: 'lab-005', name: 'Vijay Shinde', role: 'Irrigation Specialist', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f4ab96d7-1772387562840.png', imageAlt: 'Indian male farmer in his 50s standing near irrigation canal in farm field', ratePerDay: 600, rating: 4.3, reviews: 55, location: 'Baner, Pune', distance: 5.0, skills: ['Drip Irrigation', 'Sprinkler Setup', 'Canal Management'], experience: '9 years', available: true, category: 'Irrigation', phone: '+919876543214' },
  { id: 'lab-006', name: 'Sunita Devi', role: 'Weeding & Transplanting', image: 'https://images.unsplash.com/photo-1628164918084-ab8bc823b17d', imageAlt: 'Indian female farm worker in yellow saree transplanting rice seedlings in paddy field', ratePerDay: 380, rating: 4.7, reviews: 72, location: 'Mundhwa, Pune', distance: 7.3, skills: ['Weeding', 'Transplanting', 'Nursery Management'], experience: '5 years', available: true, category: 'Sowing', phone: '+919876543215' },
  { id: 'lab-007', name: 'Prakash Kamble', role: 'Combine Harvester Operator', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1551bdb60-1772435022148.png', imageAlt: 'Indian male combine harvester operator in his 35s wearing orange vest in field', ratePerDay: 900, rating: 4.9, reviews: 118, location: 'Hadapsar, Pune', distance: 2.1, skills: ['Combine Harvesting', 'Threshing', 'Grain Storage'], experience: '13 years', available: true, category: 'Harvesting', phone: '+919876543216' },
  { id: 'lab-008', name: 'Meena Kumari', role: 'Organic Farming Expert', image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1f343fdd6-1773135120051.png', imageAlt: 'Indian female organic farmer in green dupatta tending to vegetable garden', ratePerDay: 550, rating: 4.6, reviews: 39, location: 'Kothrud, Pune', distance: 3.8, skills: ['Organic Farming', 'Composting', 'Bio-pesticide Application'], experience: '7 years', available: false, category: 'Crop Care', phone: '+919876543217' },
];

const CATEGORIES = ['All', 'Harvesting', 'Tractor Operator', 'Spraying', 'Sowing', 'Irrigation', 'Crop Care'];

export default function LabourPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [emergencyOpen, setEmergencyOpen] = useState(false);

  function toggleWish(id: string) { setWishlist((p) => p.includes(id) ? p.filter((w) => w !== id) : [...p, id]); }

  const filtered = useMemo(() => {
    let list = ALL_LABOUR.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.role.toLowerCase().includes(q) || l.skills.some((s) => s.toLowerCase().includes(q));
      const matchCat = selectedCategory === 'All' || l.category === selectedCategory;
      const matchAvail = !availableOnly || l.available;
      return matchSearch && matchCat && matchAvail;
    });
    list.sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : sortBy === 'rate_asc' ? a.ratePerDay - b.ratePerDay : sortBy === 'rate_desc' ? b.ratePerDay - a.ratePerDay : a.distance - b.distance);
    return list;
  }, [search, selectedCategory, sortBy, availableOnly]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Farm Labour</h1>
          <p className="text-sm text-muted-foreground mt-0.5"><span className="font-semibold text-primary font-tabular">{filtered.length}</span> workers found near Pune, MH</p>
        </div>

        <div className="flex items-center gap-2 bg-card border border-border rounded-xl px-4 py-2.5 shadow-sm focus-within:border-primary mb-4">
          <Search size={18} className="text-muted-foreground shrink-0" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search workers by name, skill, or role..." className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
          {search && <button onClick={() => setSearch('')} className="p-1 rounded hover:bg-muted"><X size={14} className="text-muted-foreground" /></button>}
        </div>

        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => <button key={cat} onClick={() => setSelectedCategory(cat)} className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${selectedCategory === cat ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>{cat}</button>)}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="appearance-none pl-3 pr-8 py-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground focus:outline-none cursor-pointer">
              <option value="rating">Top Rated</option>
              <option value="rate_asc">Rate: Low to High</option>
              <option value="rate_desc">Rate: High to Low</option>
              <option value="distance">Nearest First</option>
            </select>
            <label className="flex items-center gap-2 cursor-pointer">
              <div onClick={() => setAvailableOnly(!availableOnly)} className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${availableOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${availableOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-xs font-medium text-foreground">Available only</span>
            </label>
          </div>
        </div>

        <div className="mb-4 bg-gradient-to-r from-danger/10 to-danger/5 border border-danger/20 rounded-xl p-4 flex items-center justify-between gap-4">
          <div><p className="font-bold text-sm text-foreground">🚨 Emergency Labour Needed?</p><p className="text-xs text-muted-foreground">Get workers within 2 hours for urgent farm work</p></div>
          <button onClick={() => setEmergencyOpen(true)} className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg bg-danger text-white text-xs font-bold hover:bg-danger/90 transition-colors"><Zap size={14} /> Emergency Hire</button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((person) => (
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
                    <div className="flex items-center gap-1 mt-0.5"><Star size={11} className="text-accent fill-accent" /><span className="text-xs font-semibold font-tabular">{person.rating}</span><span className="text-xs text-muted-foreground">({person.reviews})</span></div>
                  </div>
                  <button suppressHydrationWarning onClick={() => toggleWish(person.id)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${wishlist.includes(person.id) ? 'bg-danger text-white' : 'bg-muted text-muted-foreground hover:bg-danger/10 hover:text-danger'}`}>
                    <Heart size={13} fill={wishlist.includes(person.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {person.skills.slice(0, 2).map((skill) => <span key={`skill-${person.id}-${skill}`} className="badge-green text-xs">{skill}</span>)}
                  {person.skills.length > 2 && <span className="badge-blue text-xs">+{person.skills.length - 2}</span>}
                </div>
                <div className="flex items-center justify-between mb-3">
                  <div><p className="text-xs text-muted-foreground">Daily Rate</p><p className="text-base font-bold text-primary font-tabular">₹{person.ratePerDay}/day</p></div>
                  <div className="text-right"><p className="text-xs text-muted-foreground">Experience</p><p className="text-sm font-semibold text-foreground">{person.experience}</p></div>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4"><MapPin size={11} className="text-primary" />{person.location} · {person.distance} km</div>
                <div className="grid grid-cols-2 gap-2">
                  <a href={`/labour/${person.id}`} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${person.available ? 'gradient-green text-white hover:opacity-90 btn-press' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}>
                    <UserCheck size={13} />{person.available ? 'Hire Now' : 'Unavailable'}
                  </a>
                  <a href={`tel:${person.phone}`} className="btn-secondary text-xs py-2 gap-1.5 flex items-center justify-center"><Phone size={13} />Call</a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-20"><div className="text-5xl mb-4">👨‍🌾</div><h3 className="font-bold text-lg text-foreground mb-2">No Workers Found</h3><p className="text-sm text-muted-foreground">Try adjusting your filters or search terms.</p></div>
        )}
      </main>

      {emergencyOpen && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-modal w-full max-w-md p-6 fade-in">
            <h3 className="font-bold text-lg text-foreground mb-2">🚨 Emergency Labour Request</h3>
            <p className="text-sm text-muted-foreground mb-4">We&apos;ll match you with available workers within 2 hours.</p>
            <div className="space-y-3">
              <input placeholder="Type of work needed" className="input-field w-full" />
              <input placeholder="Number of workers" type="number" className="input-field w-full" />
              <input placeholder="Your phone number" type="tel" className="input-field w-full" />
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setEmergencyOpen(false)} className="flex-1 btn-secondary py-3 rounded-xl">Cancel</button>
              <button onClick={() => setEmergencyOpen(false)} className="flex-1 bg-danger text-white py-3 rounded-xl font-bold hover:bg-danger/90 transition-colors">Send Request</button>
            </div>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
