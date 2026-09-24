'use client';

import React, { useState, useMemo } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AppImage from '@/components/ui/AppImage';
import { Search, X, MapPin, Star, Heart, Phone, UserCheck, ChevronDown, ChevronUp, AlertTriangle, Filter, ArrowUpDown, Zap } from 'lucide-react';

interface Labour {
  id: string;
  name: string;
  role: string;
  image: string;
  imageAlt: string;
  ratePerDay: number;
  rating: number;
  reviews: number;
  location: string;
  distance: number;
  skills: string[];
  experience: string;
  available: boolean;
  category: string;
  gender: 'male' | 'female';
  languages: string[];
}

const ALL_LABOUR: Labour[] = [
{
  id: 'lab-001', name: 'Ramesh Yadav', role: 'Harvesting Worker',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_1579523d5-1763293623618.png',
  imageAlt: 'Indian male farm worker in his 30s wearing a blue shirt with confident expression',
  ratePerDay: 500, rating: 4.6, reviews: 89, location: 'Hadapsar, Pune', distance: 1.8,
  skills: ['Harvesting', 'Threshing', 'Winnowing'], experience: '6 years', available: true,
  category: 'Harvesting', gender: 'male', languages: ['Hindi', 'Marathi']
},
{
  id: 'lab-002', name: 'Suresh Patil', role: 'Tractor Operator',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_19b54ab7f-1772435023997.png',
  imageAlt: 'Indian male tractor operator in his 40s wearing white shirt and cap outdoors',
  ratePerDay: 700, rating: 4.4, reviews: 142, location: 'Kothrud, Pune', distance: 3.5,
  skills: ['Tractor Operation', 'Ploughing', 'Rotavation'], experience: '11 years', available: true,
  category: 'Tractor Operator', gender: 'male', languages: ['Marathi', 'Hindi']
},
{
  id: 'lab-003', name: 'Ganesh More', role: 'Spraying Worker',
  image: 'https://img.rocket.new/generatedImages/rocket_gen_img_115c14105-1763296551367.png',
  imageAlt: 'Young Indian male agricultural worker wearing green shirt smiling outdoors',
  ratePerDay: 450, rating: 4.5, reviews: 63, location: 'Wagholi, Pune', distance: 6.2,
  skills: ['Pesticide Spraying', 'Crop Care', 'Irrigation'], experience: '4 years', available: false,
  category: 'Spraying', gender: 'male', languages: ['Marathi']
},
{
  id: 'lab-004', name: 'Kavita Jadhav', role: 'Seed Sowing Expert',
  image: 'https://images.unsplash.com/photo-1708417145375-ed79c7131fab',
  imageAlt: 'Indian female agricultural worker in colorful saree working in green crop field',
  ratePerDay: 400, rating: 4.8, reviews: 47, location: 'Sinhagad, Pune', distance: 4.1,
  skills: ['Seed Sowing', 'Transplanting', 'Weeding'], experience: '8 years', available: true,
  category: 'Sowing', gender: 'female', languages: ['Marathi', 'Hindi']
},
{
  id: 'lab-005', name: 'Vijay Shinde', role: 'Irrigation Specialist',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f4ab96d7-1772387562840.png",
  imageAlt: 'Indian male farmer in his 50s standing near irrigation canal in farm field',
  ratePerDay: 600, rating: 4.3, reviews: 55, location: 'Baner, Pune', distance: 5.0,
  skills: ['Drip Irrigation', 'Sprinkler Setup', 'Canal Management'], experience: '9 years', available: true,
  category: 'Irrigation', gender: 'male', languages: ['Marathi', 'Hindi', 'English']
},
{
  id: 'lab-006', name: 'Sunita Devi', role: 'Weeding & Transplanting',
  image: "https://images.unsplash.com/photo-1628164918084-ab8bc823b17d",
  imageAlt: 'Indian female farm worker in yellow saree transplanting rice seedlings in paddy field',
  ratePerDay: 380, rating: 4.7, reviews: 72, location: 'Mundhwa, Pune', distance: 7.3,
  skills: ['Weeding', 'Transplanting', 'Nursery Management'], experience: '5 years', available: true,
  category: 'Sowing', gender: 'female', languages: ['Hindi', 'Bhojpuri']
},
{
  id: 'lab-007', name: 'Prakash Kamble', role: 'Combine Harvester Operator',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1551bdb60-1772435022148.png",
  imageAlt: 'Indian male combine harvester operator in his 35s wearing orange vest in field',
  ratePerDay: 900, rating: 4.9, reviews: 118, location: 'Hadapsar, Pune', distance: 2.1,
  skills: ['Combine Harvesting', 'Threshing', 'Grain Storage'], experience: '13 years', available: true,
  category: 'Harvesting', gender: 'male', languages: ['Marathi', 'Hindi']
},
{
  id: 'lab-008', name: 'Meena Kumari', role: 'Organic Farming Expert',
  image: "https://img.rocket.new/generatedImages/rocket_gen_img_1f343fdd6-1773135120051.png",
  imageAlt: 'Indian female organic farmer in green dupatta tending to vegetable garden',
  ratePerDay: 550, rating: 4.6, reviews: 39, location: 'Kothrud, Pune', distance: 3.8,
  skills: ['Organic Farming', 'Composting', 'Bio-pesticide Application'], experience: '7 years', available: false,
  category: 'Crop Care', gender: 'female', languages: ['Hindi', 'Marathi']
}];


const CATEGORIES = ['All', 'Harvesting', 'Tractor Operator', 'Spraying', 'Sowing', 'Irrigation', 'Crop Care'];
const SORT_OPTIONS = [
{ value: 'rating', label: 'Top Rated' },
{ value: 'rate_asc', label: 'Rate: Low to High' },
{ value: 'rate_desc', label: 'Rate: High to Low' },
{ value: 'distance', label: 'Nearest First' },
{ value: 'reviews', label: 'Most Reviewed' }];


export default function LabourPage() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('rating');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [maxRate, setMaxRate] = useState(1000);
  const [minRating, setMinRating] = useState(0);
  const [maxDistance, setMaxDistance] = useState(50);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [emergencyOpen, setEmergencyOpen] = useState(false);
  const [emergencyForm, setEmergencyForm] = useState({ crop: '', workers: '2', date: '', notes: '' });
  const [emergencySubmitted, setEmergencySubmitted] = useState(false);
  const [filterSections, setFilterSections] = useState({ category: true, rate: true, rating: true, availability: true, distance: true });

  function toggleWish(id: string) {
    setWishlist((p) => p.includes(id) ? p.filter((w) => w !== id) : [...p, id]);
  }

  function toggleSection(key: keyof typeof filterSections) {
    setFilterSections((p) => ({ ...p, [key]: !p[key] }));
  }

  const filtered = useMemo(() => {
    let list = ALL_LABOUR.filter((l) => {
      const q = search.toLowerCase();
      const matchSearch = !q || l.name.toLowerCase().includes(q) || l.role.toLowerCase().includes(q) || l.skills.some((s) => s.toLowerCase().includes(q));
      const matchCat = selectedCategory === 'All' || l.category === selectedCategory;
      const matchAvail = !availableOnly || l.available;
      const matchRate = l.ratePerDay <= maxRate;
      const matchRating = l.rating >= minRating;
      const matchDist = l.distance <= maxDistance;
      return matchSearch && matchCat && matchAvail && matchRate && matchRating && matchDist;
    });

    list.sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'rate_asc') return a.ratePerDay - b.ratePerDay;
      if (sortBy === 'rate_desc') return b.ratePerDay - a.ratePerDay;
      if (sortBy === 'distance') return a.distance - b.distance;
      if (sortBy === 'reviews') return b.reviews - a.reviews;
      return 0;
    });
    return list;
  }, [search, selectedCategory, sortBy, availableOnly, maxRate, minRating, maxDistance]);

  function handleEmergencySubmit(e: React.FormEvent) {
    e.preventDefault();
    setEmergencySubmitted(true);
  }

  const FiltersPanel = () =>
  <div className="card-base overflow-hidden sticky top-20">
      <div className="px-4 py-3 border-b border-border bg-muted/30 flex items-center justify-between">
        <h3 className="font-bold text-sm text-foreground">Filters</h3>
        <button suppressHydrationWarning onClick={() => {setAvailableOnly(false);setMaxRate(1000);setMinRating(0);setMaxDistance(50);setSelectedCategory('All');}} className="text-xs text-primary font-medium hover:underline">Reset</button>
      </div>
      <div className="divide-y divide-border max-h-[calc(100vh-180px)] overflow-y-auto scrollbar-hide">
        {/* Category */}
        <div className="p-4">
          <button suppressHydrationWarning onClick={() => toggleSection('category')} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold text-foreground">Category</span>
            {filterSections.category ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {filterSections.category &&
        <div className="space-y-2">
              {CATEGORIES.filter((c) => c !== 'All').map((cat) =>
          <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
                  <input type="checkbox" checked={selectedCategory === cat} onChange={() => setSelectedCategory(selectedCategory === cat ? 'All' : cat)} className="w-4 h-4 rounded accent-primary" />
                  <span className="text-sm text-foreground group-hover:text-primary transition-colors">{cat}</span>
                </label>
          )}
            </div>
        }
        </div>
        {/* Daily Rate */}
        <div className="p-4">
          <button suppressHydrationWarning onClick={() => toggleSection('rate')} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold text-foreground">Daily Rate</span>
            {filterSections.rate ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {filterSections.rate &&
        <div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                <span>₹0</span><span className="font-tabular">₹{maxRate}/day</span>
              </div>
              <input type="range" min={200} max={1000} step={50} value={maxRate} onChange={(e) => setMaxRate(Number(e.target.value))} className="w-full accent-primary" />
              <div className="flex gap-2 mt-2">
                {[400, 600, 800, 1000].map((p) =>
            <button suppressHydrationWarning key={p} onClick={() => setMaxRate(p)} className={`flex-1 py-1 rounded text-xs font-medium transition-colors ${maxRate === p ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-secondary'}`}>≤{p}</button>
            )}
              </div>
            </div>
        }
        </div>
        {/* Rating */}
        <div className="p-4">
          <button suppressHydrationWarning onClick={() => toggleSection('rating')} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold text-foreground">Min Rating</span>
            {filterSections.rating ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {filterSections.rating &&
        <div className="space-y-1.5">
              {[4.5, 4.0, 3.5].map((r) =>
          <button suppressHydrationWarning key={r} onClick={() => setMinRating(minRating === r ? 0 : r)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${minRating === r ? 'bg-secondary border border-primary/30 text-primary' : 'hover:bg-muted text-foreground border border-transparent'}`}>
                  <span className="text-accent">{'★'.repeat(Math.floor(r))}</span>
                  <span className="font-semibold font-tabular">{r}+</span>
                </button>
          )}
            </div>
        }
        </div>
        {/* Availability */}
        <div className="p-4">
          <button suppressHydrationWarning onClick={() => toggleSection('availability')} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold text-foreground">Availability</span>
            {filterSections.availability ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {filterSections.availability &&
        <label className="flex items-center gap-2.5 cursor-pointer">
              <div onClick={() => setAvailableOnly(!availableOnly)} className={`relative w-10 h-5 rounded-full transition-colors duration-200 cursor-pointer ${availableOnly ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform duration-200 ${availableOnly ? 'translate-x-5' : 'translate-x-0.5'}`} />
              </div>
              <span className="text-sm text-foreground">Available only</span>
            </label>
        }
        </div>
        {/* Distance */}
        <div className="p-4">
          <button suppressHydrationWarning onClick={() => toggleSection('distance')} className="flex items-center justify-between w-full mb-3">
            <span className="text-sm font-semibold text-foreground">Max Distance</span>
            {filterSections.distance ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
          </button>
          {filterSections.distance &&
        <div className="flex flex-wrap gap-2">
              {[5, 10, 20, 30, 50].map((d) =>
          <button suppressHydrationWarning key={d} onClick={() => setMaxDistance(d)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${maxDistance === d ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground hover:border-primary hover:text-primary'}`}>{d} km</button>
          )}
            </div>
        }
        </div>
      </div>
    </div>;


  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero Banner */}
        <div className="gradient-hero text-white py-10 px-4">
          <div className="max-w-screen-2xl mx-auto lg:px-8 xl:px-10 2xl:px-16">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-3xl">👨‍🌾</span>
                  <h1 className="text-2xl md:text-3xl font-extrabold">Labour Marketplace</h1>
                </div>
                <p className="text-white/80 text-sm md:text-base">Find skilled farm workers near you — hire by day, week, or season</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-white/70">
                  <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />{ALL_LABOUR.filter((l) => l.available).length} Available Now</span>
                  <span>{ALL_LABOUR.length} Total Workers</span>
                  <span className="flex items-center gap-1"><MapPin size={13} />Pune, MH</span>
                </div>
              </div>
              <button suppressHydrationWarning onClick={() => setEmergencyOpen(true)} className="flex items-center gap-2 bg-danger hover:bg-danger/90 text-white font-bold px-5 py-3 rounded-xl transition-all btn-press shadow-lg shrink-0">
                <Zap size={18} />
                Emergency Labour Request
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 py-6">
          {/* Search + Sort Bar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-5">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, role, or skill..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                suppressHydrationWarning
                className="input-field pl-9 pr-9" />
              
              {search && <button suppressHydrationWarning onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"><X size={15} /></button>}
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <ArrowUpDown size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} suppressHydrationWarning className="input-field pl-8 pr-8 appearance-none cursor-pointer min-w-[160px]">
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <button suppressHydrationWarning onClick={() => setFiltersOpen(!filtersOpen)} className={`lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 text-sm font-semibold transition-all ${filtersOpen ? 'border-primary bg-secondary text-primary' : 'border-border text-foreground hover:border-primary'}`}>
                <Filter size={15} />Filters
              </button>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-5">
            {CATEGORIES.map((cat) =>
            <button suppressHydrationWarning key={cat} onClick={() => setSelectedCategory(cat)} className={`shrink-0 px-4 py-2 rounded-full text-sm font-semibold border transition-all ${selectedCategory === cat ? 'gradient-green text-white border-transparent' : 'border-border text-muted-foreground bg-card hover:border-primary hover:text-primary'}`}>{cat}</button>
            )}
          </div>

          <div className="flex gap-6">
            {/* Desktop Filters */}
            <aside className="hidden lg:block w-64 shrink-0">
              <FiltersPanel />
            </aside>

            {/* Mobile Filters Drawer */}
            {filtersOpen &&
            <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/40" onClick={() => setFiltersOpen(false)} />
                <div className="absolute left-0 top-0 h-full w-72 bg-card shadow-modal overflow-y-auto">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <h3 className="font-bold text-foreground">Filters</h3>
                    <button suppressHydrationWarning onClick={() => setFiltersOpen(false)}><X size={20} /></button>
                  </div>
                  <FiltersPanel />
                </div>
              </div>
            }

            {/* Results */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-muted-foreground"><span className="font-semibold text-foreground">{filtered.length}</span> workers found</p>
              </div>

              {filtered.length === 0 ?
              <div className="card-base p-12 text-center">
                  <span className="text-5xl mb-4 block">🔍</span>
                  <h3 className="font-bold text-lg text-foreground mb-2">No workers found</h3>
                  <p className="text-muted-foreground text-sm">Try adjusting your filters or search query</p>
                </div> :

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {filtered.map((person) =>
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
                          <button suppressHydrationWarning onClick={() => toggleWish(person.id)} className={`w-7 h-7 rounded-full flex items-center justify-center transition-all shrink-0 ${wishlist.includes(person.id) ? 'bg-danger text-white' : 'bg-muted text-muted-foreground hover:bg-danger/10 hover:text-danger'}`}>
                            <Heart size={13} fill={wishlist.includes(person.id) ? 'currentColor' : 'none'} />
                          </button>
                        </div>

                        <div className="flex flex-wrap gap-1.5 mb-3">
                          {person.skills.slice(0, 2).map((skill) => <span key={skill} className="badge-green text-xs">{skill}</span>)}
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

                        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                          <MapPin size={11} className="text-primary" />
                          {person.location} · {person.distance} km
                        </div>

                        <div className="flex gap-1.5 text-xs text-muted-foreground mb-4">
                          {person.languages.map((lang) => <span key={lang} className="px-2 py-0.5 bg-muted rounded-full">{lang}</span>)}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <a href={`/labour/${person.id}`} className={`flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-semibold transition-all ${person.available ? 'gradient-green text-white hover:opacity-90 btn-press' : 'bg-muted text-muted-foreground cursor-not-allowed pointer-events-none'}`}>
                            <UserCheck size={13} />
                            {person.available ? 'Hire Now' : 'Unavailable'}
                          </a>
                          <button suppressHydrationWarning className="btn-secondary text-xs py-2 gap-1.5">
                            <Phone size={13} />Call
                          </button>
                        </div>
                      </div>
                    </div>
                )}
                </div>
              }
            </div>
          </div>
        </div>
      </main>

      {/* Emergency Labour Modal */}
      {emergencyOpen &&
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => {setEmergencyOpen(false);setEmergencySubmitted(false);}} />
          <div className="relative bg-card rounded-2xl shadow-modal w-full max-w-md p-6 fade-in">
            {!emergencySubmitted ?
          <>
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-danger-bg flex items-center justify-center">
                    <AlertTriangle size={20} className="text-danger" />
                  </div>
                  <div>
                    <h2 className="font-bold text-lg text-foreground">Emergency Labour Request</h2>
                    <p className="text-xs text-muted-foreground">We'll connect you with available workers within 2 hours</p>
                  </div>
                  <button suppressHydrationWarning onClick={() => setEmergencyOpen(false)} className="ml-auto p-1.5 rounded-lg hover:bg-muted"><X size={18} /></button>
                </div>
                <form onSubmit={handleEmergencySubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Crop / Work Type *</label>
                    <input type="text" required placeholder="e.g. Wheat Harvesting, Paddy Transplanting" value={emergencyForm.crop} onChange={(e) => setEmergencyForm((p) => ({ ...p, crop: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Number of Workers Needed</label>
                    <select value={emergencyForm.workers} onChange={(e) => setEmergencyForm((p) => ({ ...p, workers: e.target.value }))} className="input-field">
                      {['1', '2', '3', '4', '5', '6', '8', '10', '15', '20+'].map((n) => <option key={n} value={n}>{n} workers</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Required Date *</label>
                    <input type="date" required value={emergencyForm.date} onChange={(e) => setEmergencyForm((p) => ({ ...p, date: e.target.value }))} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-1.5">Additional Notes</label>
                    <textarea rows={3} placeholder="Any specific skills, tools required, or location details..." value={emergencyForm.notes} onChange={(e) => setEmergencyForm((p) => ({ ...p, notes: e.target.value }))} className="input-field resize-none" />
                  </div>
                  <button suppressHydrationWarning type="submit" className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-danger text-white font-bold text-sm hover:bg-danger/90 transition-all btn-press">
                    <Zap size={16} />Send Emergency Request
                  </button>
                </form>
              </> :

          <div className="text-center py-6">
                <div className="w-16 h-16 rounded-full bg-success-bg flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">✅</span>
                </div>
                <h3 className="font-bold text-xl text-foreground mb-2">Request Sent!</h3>
                <p className="text-muted-foreground text-sm mb-1">Your emergency labour request has been submitted.</p>
                <p className="text-muted-foreground text-sm mb-6">Our team will call you within <span className="font-semibold text-primary">30 minutes</span> with available workers.</p>
                <button suppressHydrationWarning onClick={() => {setEmergencyOpen(false);setEmergencySubmitted(false);}} className="btn-primary w-full">Done</button>
              </div>
          }
          </div>
        </div>
      }

      <Footer />
    </div>);

}