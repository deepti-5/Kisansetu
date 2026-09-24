'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Mic, Camera, MapPin, X, Loader2 } from 'lucide-react';
import AppImage from '@/components/ui/AppImage';

const POPULAR_SEARCHES = [
'Tractor', 'Harvester', 'Rotavator', 'Seeds', 'Labour', 'Pesticides', 'Seed Drill', 'Sprayer'];


export default function HeroSection() {
  const [query, setQuery] = useState('');
  const [voiceActive, setVoiceActive] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [location, setLocation] = useState<string>('Detecting...');
  const [locationLoading, setLocationLoading] = useState(true);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    detectLocation();
  }, []);

  function detectLocation() {
    if (!navigator.geolocation) {
      setLocation('Pune, Maharashtra');
      setLocationLoading(false);
      return;
    }
    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.county ||
            'Unknown';
          const state = data.address?.state || '';
          setLocation(state ? `${city}, ${state}` : city);
        } catch {
          setLocation('Pune, Maharashtra');
        } finally {
          setLocationLoading(false);
        }
      },
      () => {
        setLocation('Pune, Maharashtra');
        setLocationLoading(false);
      },
      { timeout: 8000 }
    );
  }

  function handleVoice() {
    setVoiceActive(true);
    // BACKEND: Connect to Web Speech API or Twilio voice recognition
    setTimeout(() => {
      setQuery('Mahindra Tractor near Pune');
      setVoiceActive(false);
    }, 2000);
  }

  function handleSearch() {
    if (!query.trim()) return;
    const q = query.trim().toLowerCase();
    if (q.includes('labour') || q.includes('worker') || q.includes('farm hand')) {
      router.push(`/labour?q=${encodeURIComponent(query)}`);
    } else if (q.includes('seed') || q.includes('fertilizer') || q.includes('pesticide') || q.includes('agri')) {
      router.push(`/agri?q=${encodeURIComponent(query)}`);
    } else {
      router.push(`/equipment-listing-page?q=${encodeURIComponent(query)}`);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') handleSearch();
  }

  function handleCameraUpload(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files?.[0]) return;
    setCameraLoading(true);
    // BACKEND: Send image to OpenAI Vision API for equipment/crop identification
    setTimeout(() => {
      setCameraLoading(false);
      setCameraOpen(false);
      setQuery('Rotavator (identified from image)');
    }, 2500);
  }

  return (
    <section className="relative overflow-hidden gradient-hero min-h-[520px] flex items-center">
      {/* Background farm image overlay */}
      <div className="absolute inset-0 opacity-20">
        <AppImage
          src="https://images.unsplash.com/photo-1714786654492-a78602ed7b8c"
          alt="Green agricultural farmland with crops stretching to horizon under blue sky"
          fill
          className="object-cover"
          priority />
        
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/60 to-transparent" />

      <div className="relative z-10 max-w-screen-2xl mx-auto px-4 lg:px-8 xl:px-10 2xl:px-16 w-full py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left: Copy + Search */}
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 border border-white/25 text-white text-xs font-semibold mb-5 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              Available in 12 Indian States · 9 Languages
            </div>

            <h1 className="text-hero-xl font-extrabold text-white leading-tight mb-2">
              Find Equipment.<br />
              Hire Labour.<br />
              <span className="text-accent">Get Agri Supplies.</span>
            </h1>
            <p className="text-white/80 text-lg font-medium mt-3 mb-7">Farm Smarter.</p>

            {/* Search Bar */}
            <div className="bg-white rounded-2xl shadow-modal p-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center gap-2 px-3">
                  <Search size={18} className="text-muted-foreground shrink-0" />
                  <input
                    suppressHydrationWarning
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search for Equipments, Labours, Seeds, Pesticides..."
                    className="flex-1 py-2.5 text-sm text-foreground placeholder:text-muted-foreground bg-transparent outline-none" />
                  
                  {query &&
                  <button suppressHydrationWarning onClick={() => setQuery('')} className="p-1 rounded hover:bg-muted">
                      <X size={14} className="text-muted-foreground" />
                    </button>
                  }
                </div>
                <div className="flex items-center gap-1">
                  <button
                    suppressHydrationWarning
                    onClick={handleVoice}
                    className={`p-2.5 rounded-xl transition-all duration-150 ${
                    voiceActive ? 'bg-danger text-white animate-pulse' : 'bg-muted hover:bg-secondary text-muted-foreground hover:text-primary'}`
                    }
                    title="Voice search">
                    
                    <Mic size={18} />
                  </button>
                  <button
                    suppressHydrationWarning
                    onClick={() => setCameraOpen(true)}
                    className="p-2.5 rounded-xl bg-muted hover:bg-secondary text-muted-foreground hover:text-primary transition-all duration-150"
                    title="Image search">
                    
                    <Camera size={18} />
                  </button>
                  <button suppressHydrationWarning onClick={handleSearch} className="btn-primary px-5 py-2.5 rounded-xl whitespace-nowrap">
                    Search
                  </button>
                </div>
              </div>
            </div>

            {/* Popular Searches */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-white/70 text-xs font-medium">Popular:</span>
              {POPULAR_SEARCHES.map((term) =>
              <button
                suppressHydrationWarning
                key={`pop-${term}`}
                onClick={() => setQuery(term)}
                className="px-3 py-1 rounded-full bg-white/15 border border-white/25 text-white text-xs font-medium hover:bg-white/25 transition-colors duration-150 backdrop-blur-sm">
                
                  {term}
                </button>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center gap-2 mt-4">
              {locationLoading ? (
                <Loader2 size={14} className="text-accent animate-spin" />
              ) : (
                <MapPin size={14} className="text-accent" />
              )}
              <span className="text-white/80 text-sm">Showing results near</span>
              <button
                suppressHydrationWarning
                onClick={detectLocation}
                className="text-accent text-sm font-semibold hover:underline flex items-center gap-1"
              >
                {locationLoading ? 'Detecting...' : location}
                <span className="text-white/50">↓</span>
              </button>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3 mt-6">
              <Link href="/equipment-listing-page" className="btn-accent px-6 py-3 text-base">
                Get Started
              </Link>
              <Link href="/how-it-works" className="btn-secondary px-6 py-3 text-base border-white/40 text-white hover:bg-white/15">
                How It Works
              </Link>
            </div>
          </div>

          {/* Right: Stats */}
          <div className="hidden lg:flex flex-col items-end gap-4">
            <div className="grid grid-cols-2 gap-3">
              {[
              { label: 'Equipment Listed', value: '2,345+', icon: '🚜' },
              { label: 'Labour Providers', value: '3,210+', icon: '👨‍🌾' },
              { label: 'Agri Products', value: '1,845+', icon: '🌱' },
              { label: 'Happy Farmers', value: '12,540+', icon: '😊' }].
              map((stat) =>
              <div
                key={`stat-${stat.label}`}
                className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white">
                
                  <div className="text-2xl mb-1">{stat.icon}</div>
                  <div className="text-2xl font-bold font-tabular">{stat.value}</div>
                  <div className="text-xs text-white/70 font-medium mt-0.5">{stat.label}</div>
                </div>
              )}
            </div>
            <div className="bg-white/15 backdrop-blur-sm border border-white/20 rounded-xl p-4 text-white w-full">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span className="text-xs font-semibold text-white/80">DEMO MODE ACTIVE</span>
              </div>
              <p className="text-xs text-white/65">
                OTP, Payments, Maps &amp; AI features are in demo mode. Real credentials shown on login screen.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Camera Search Modal */}
      {cameraOpen &&
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card rounded-2xl shadow-modal w-full max-w-md p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg text-foreground">Search by Image</h3>
              <button suppressHydrationWarning onClick={() => setCameraOpen(false)} className="p-1.5 rounded-lg hover:bg-muted">
                <X size={18} />
              </button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">
              Upload or take a photo of equipment, crop, or pest — our AI will identify it and find matches near you.
            </p>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCameraUpload} />
            {cameraLoading ?
          <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 size={32} className="text-primary animate-spin" />
                <p className="text-sm font-medium text-muted-foreground">Identifying via AI...</p>
                <p className="text-xs text-muted-foreground">DEMO MODE — no actual API call</p>
              </div> :

          <div className="grid grid-cols-2 gap-3">
                <button
              suppressHydrationWarning
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-primary/30 hover:border-primary hover:bg-secondary transition-all duration-150">
              
                  <Camera size={28} className="text-primary" />
                  <span className="text-sm font-semibold text-primary">Upload Photo</span>
                  <span className="text-xs text-muted-foreground">from gallery</span>
                </button>
                <button
              suppressHydrationWarning
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 p-5 rounded-xl border-2 border-dashed border-accent/40 hover:border-accent hover:bg-warning-bg transition-all duration-150">
              
                  <span className="text-2xl">📷</span>
                  <span className="text-sm font-semibold text-warning">Take Photo</span>
                  <span className="text-xs text-muted-foreground">use camera</span>
                </button>
              </div>
          }
          </div>
        </div>
      }
    </section>);

}