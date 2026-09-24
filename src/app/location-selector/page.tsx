'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ChevronRight, MapPin, Navigation, CheckCircle, ChevronDown, Search, Loader2, X } from 'lucide-react';

// India location hierarchy data
const LOCATION_DATA: Record<string, Record<string, Record<string, string[]>>> = {
  Maharashtra: {
    Pune: {
      'Haveli': ['Hadapsar', 'Kharadi', 'Wagholi', 'Manjri', 'Uruli Kanchan'],
      'Mulshi': ['Paud', 'Pirangut', 'Lavale', 'Nande', 'Bhugaon'],
      'Maval': ['Talegaon', 'Vadgaon', 'Kanhe', 'Dehu Road', 'Pimpri'],
      'Bhor': ['Bhor', 'Nasrapur', 'Velhe', 'Nira', 'Saswad'],
    },
    Nashik: {
      'Nashik': ['Nashik Road', 'Deolali', 'Satpur', 'Ambad', 'Cidco'],
      'Igatpuri': ['Igatpuri', 'Ghoti', 'Kasara', 'Khardi', 'Vashind'],
      'Sinnar': ['Sinnar', 'Nandur Madhyameshwar', 'Wadivarhe', 'Palkhed', 'Chandori'],
      'Dindori': ['Dindori', 'Vani', 'Nandgaon', 'Peth', 'Surgana'],
    },
    Kolhapur: {
      'Karvir': ['Kolhapur City', 'Kasaba Bawada', 'Shiroli', 'Kagal', 'Hatkanangle'],
      'Panhala': ['Panhala', 'Kodoli', 'Kowad', 'Kasarwadi', 'Walwa'],
      'Shahuwadi': ['Shahuwadi', 'Malkapur', 'Radhanagari', 'Gaganbawada', 'Bhudargad'],
    },
    Aurangabad: {
      'Aurangabad': ['Cidco', 'Waluj', 'Chikalthana', 'Garkheda', 'Satara'],
      'Paithan': ['Paithan', 'Apegaon', 'Newasa', 'Shrirampur', 'Rahuri'],
      'Gangapur': ['Gangapur', 'Vaijapur', 'Sillod', 'Soygaon', 'Kannad'],
    },
  },
  Karnataka: {
    Bengaluru: {
      'Bengaluru North': ['Yelahanka', 'Devanahalli', 'Doddaballapur', 'Nelamangala', 'Hoskote'],
      'Bengaluru South': ['Kanakapura', 'Ramanagara', 'Channapatna', 'Magadi', 'Bidadi'],
      'Bengaluru East': ['Whitefield', 'Hosakote', 'Malur', 'Anekal', 'Sarjapur'],
    },
    Mysuru: {
      'Mysuru': ['Mysuru City', 'Nanjangud', 'T. Narasipur', 'Hunsur', 'Periyapatna'],
      'Hunsur': ['Hunsur', 'Piriyapatna', 'Sargur', 'H D Kote', 'Gundlupet'],
    },
    Dharwad: {
      'Dharwad': ['Dharwad City', 'Hubli', 'Kundgol', 'Kalghatgi', 'Navalgund'],
      'Hubli': ['Hubli City', 'Dharwad Rural', 'Annigeri', 'Shiggaon', 'Savanur'],
    },
  },
  'Uttar Pradesh': {
    Lucknow: {
      'Lucknow': ['Lucknow City', 'Malihabad', 'Bakshi Ka Talab', 'Mohanlalganj', 'Sarojini Nagar'],
      'Kakori': ['Kakori', 'Gosainganj', 'Chinhat', 'Itaunja', 'Malhour'],
    },
    Agra: {
      'Agra': ['Agra City', 'Fatehabad', 'Khandauli', 'Etmadpur', 'Bah'],
      'Firozabad': ['Firozabad', 'Shikohabad', 'Tundla', 'Jasrana', 'Sirsaganj'],
    },
    Varanasi: {
      'Varanasi': ['Varanasi City', 'Pindra', 'Arajiline', 'Harhua', 'Cholapur'],
      'Mirzapur': ['Mirzapur', 'Chunar', 'Lalganj', 'Marihan', 'Rajgarh'],
    },
  },
  Punjab: {
    Ludhiana: {
      'Ludhiana East': ['Ludhiana City', 'Khanna', 'Samrala', 'Machhiwara', 'Payal'],
      'Ludhiana West': ['Jagraon', 'Raikot', 'Dakha', 'Sahnewal', 'Doraha'],
    },
    Amritsar: {
      'Amritsar': ['Amritsar City', 'Ajnala', 'Baba Bakala', 'Majitha', 'Rayya'],
      'Tarn Taran': ['Tarn Taran', 'Patti', 'Khem Karan', 'Bhikhiwind', 'Harike'],
    },
  },
};

const STATES = Object.keys(LOCATION_DATA);

interface SelectedLocation {
  state: string;
  district: string;
  taluk: string;
  village: string;
  lat?: number;
  lng?: number;
  gpsAddress?: string;
}

export default function LocationSelectorPage() {
  const [selected, setSelected] = useState<SelectedLocation>({ state: '', district: '', taluk: '', village: '' });
  const [gpsEnabled, setGpsEnabled] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [stateSearch, setStateSearch] = useState('');
  const [districtSearch, setDistrictSearch] = useState('');
  const [openDropdown, setOpenDropdown] = useState<'state' | 'district' | 'taluk' | 'village' | null>(null);

  const districts = selected.state ? Object.keys(LOCATION_DATA[selected.state] || {}) : [];
  const taluks = selected.state && selected.district ? Object.keys(LOCATION_DATA[selected.state]?.[selected.district] || {}) : [];
  const villages = selected.state && selected.district && selected.taluk ? LOCATION_DATA[selected.state]?.[selected.district]?.[selected.taluk] || [] : [];

  const filteredStates = STATES.filter((s) => s.toLowerCase().includes(stateSearch.toLowerCase()));
  const filteredDistricts = districts.filter((d) => d.toLowerCase().includes(districtSearch.toLowerCase()));

  const isComplete = selected.state && selected.district && selected.taluk && selected.village;

  const reverseGeocode = useCallback(async (lat: number, lng: number): Promise<string> => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`, {
        headers: { 'Accept-Language': 'en' }
      });
      const data = await res.json();
      return data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    } catch {
      return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
    }
  }, []);

  function handleGPSToggle() {
    if (gpsEnabled) {
      setGpsEnabled(false);
      setSelected((p) => ({ ...p, lat: undefined, lng: undefined, gpsAddress: undefined }));
      return;
    }
    setGpsLoading(true);
    setGpsError('');
    if (!navigator.geolocation) {
      setGpsError('Geolocation not supported by your browser.');
      setGpsLoading(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await reverseGeocode(lat, lng);
        setSelected((p) => ({ ...p, lat, lng, gpsAddress: address }));
        setGpsEnabled(true);
        setGpsLoading(false);
      },
      (err) => {
        setGpsError(err.code === err.PERMISSION_DENIED ? 'Location permission denied.' : 'Could not get location. Try again.');
        setGpsLoading(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function selectState(s: string) {
    setSelected({ state: s, district: '', taluk: '', village: '' });
    setOpenDropdown(null);
    setStateSearch('');
  }

  function selectDistrict(d: string) {
    setSelected((p) => ({ ...p, district: d, taluk: '', village: '' }));
    setOpenDropdown(null);
    setDistrictSearch('');
  }

  function selectTaluk(t: string) {
    setSelected((p) => ({ ...p, taluk: t, village: '' }));
    setOpenDropdown(null);
  }

  function selectVillage(v: string) {
    setSelected((p) => ({ ...p, village: v }));
    setOpenDropdown(null);
  }

  function handleConfirm() {
    if (isComplete) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('kisan_service_location', JSON.stringify(selected));
      }
      setConfirmed(true);
    }
  }

  useEffect(() => {
    function handleClickOutside() { setOpenDropdown(null); }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center px-4">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={40} className="text-success" />
          </div>
          <h2 className="text-2xl font-extrabold text-foreground mb-2">Location Saved!</h2>
          <p className="text-sm text-muted-foreground mb-2">{selected.village}, {selected.taluk}</p>
          <p className="text-sm text-muted-foreground mb-6">{selected.district}, {selected.state}</p>
          {selected.gpsAddress && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 mb-6 text-xs text-muted-foreground">
              <MapPin size={12} className="inline mr-1 text-primary" />
              {selected.gpsAddress.split(',').slice(0, 4).join(', ')}
            </div>
          )}
          <div className="flex gap-3 justify-center">
            <Link href="/equipment-listing-page" className="btn-primary px-6 py-3">Find Equipment Nearby</Link>
            <Link href="/" className="btn-secondary px-6 py-3">Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="max-w-screen-sm mx-auto px-4 py-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Select Service Area</span>
        </div>

        <div className="mb-6">
          <h1 className="text-2xl font-extrabold text-foreground mb-1">Select Your Service Area</h1>
          <p className="text-sm text-muted-foreground">Choose your exact location to find equipment and services nearby</p>
        </div>

        {/* GPS Toggle */}
        <div className="bg-card rounded-2xl border border-border p-4 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${gpsEnabled ? 'bg-primary/10' : 'bg-muted'}`}>
                <Navigation size={20} className={gpsEnabled ? 'text-primary' : 'text-muted-foreground'} />
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">Use GPS Location</p>
                <p className="text-xs text-muted-foreground">Auto-detect your current location</p>
              </div>
            </div>
            <button
              onClick={handleGPSToggle}
              disabled={gpsLoading}
              className={`relative w-12 h-6 rounded-full transition-colors ${gpsEnabled ? 'bg-primary' : 'bg-muted-foreground/30'} disabled:opacity-50`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${gpsEnabled ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          {gpsLoading && (
            <div className="flex items-center gap-2 mt-3 text-sm text-primary">
              <Loader2 size={14} className="animate-spin" />
              <span>Detecting your location...</span>
            </div>
          )}

          {gpsError && (
            <div className="mt-3 flex items-center gap-2 text-sm text-danger bg-danger/5 rounded-lg p-2">
              <X size={14} />
              <span>{gpsError}</span>
            </div>
          )}

          {gpsEnabled && selected.gpsAddress && (
            <div className="mt-3 bg-primary/5 border border-primary/20 rounded-xl p-3">
              <div className="flex items-start gap-2">
                <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-semibold text-primary mb-0.5">GPS Location Detected</p>
                  <p className="text-xs text-muted-foreground">{selected.gpsAddress.split(',').slice(0, 5).join(', ')}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {selected.lat?.toFixed(5)}, {selected.lng?.toFixed(5)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Hierarchical Selectors */}
        <div className="space-y-3 mb-6">
          {/* State */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">State</label>
            <button
              onClick={() => setOpenDropdown(openDropdown === 'state' ? null : 'state')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-card text-sm font-medium transition-all ${selected.state ? 'border-primary text-foreground' : 'border-border text-muted-foreground'} ${openDropdown === 'state' ? 'border-primary' : ''}`}
            >
              <span>{selected.state || 'Select State'}</span>
              <ChevronDown size={16} className={`transition-transform ${openDropdown === 'state' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'state' && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-border">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <Search size={14} className="text-muted-foreground" />
                    <input autoFocus value={stateSearch} onChange={(e) => setStateSearch(e.target.value)} placeholder="Search state..." className="flex-1 bg-transparent text-sm outline-none" />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredStates.map((s) => (
                    <button key={s} onClick={() => selectState(s)} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${selected.state === s ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'}`}>{s}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* District */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">District</label>
            <button
              disabled={!selected.state}
              onClick={() => setOpenDropdown(openDropdown === 'district' ? null : 'district')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-card text-sm font-medium transition-all ${selected.district ? 'border-primary text-foreground' : 'border-border text-muted-foreground'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{selected.district || 'Select District'}</span>
              <ChevronDown size={16} className={`transition-transform ${openDropdown === 'district' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'district' && selected.state && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="p-2 border-b border-border">
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <Search size={14} className="text-muted-foreground" />
                    <input autoFocus value={districtSearch} onChange={(e) => setDistrictSearch(e.target.value)} placeholder="Search district..." className="flex-1 bg-transparent text-sm outline-none" />
                  </div>
                </div>
                <div className="max-h-48 overflow-y-auto">
                  {filteredDistricts.map((d) => (
                    <button key={d} onClick={() => selectDistrict(d)} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${selected.district === d ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'}`}>{d}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Taluk */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Taluk / Tehsil</label>
            <button
              disabled={!selected.district}
              onClick={() => setOpenDropdown(openDropdown === 'taluk' ? null : 'taluk')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-card text-sm font-medium transition-all ${selected.taluk ? 'border-primary text-foreground' : 'border-border text-muted-foreground'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{selected.taluk || 'Select Taluk / Tehsil'}</span>
              <ChevronDown size={16} className={`transition-transform ${openDropdown === 'taluk' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'taluk' && selected.district && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {taluks.map((t) => (
                    <button key={t} onClick={() => selectTaluk(t)} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${selected.taluk === t ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'}`}>{t}</button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Village */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            <label className="block text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1.5">Village / Area</label>
            <button
              disabled={!selected.taluk}
              onClick={() => setOpenDropdown(openDropdown === 'village' ? null : 'village')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border-2 bg-card text-sm font-medium transition-all ${selected.village ? 'border-primary text-foreground' : 'border-border text-muted-foreground'} disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <span>{selected.village || 'Select Village / Area'}</span>
              <ChevronDown size={16} className={`transition-transform ${openDropdown === 'village' ? 'rotate-180' : ''}`} />
            </button>
            {openDropdown === 'village' && selected.taluk && (
              <div className="absolute z-50 w-full mt-1 bg-card border border-border rounded-xl shadow-lg overflow-hidden">
                <div className="max-h-48 overflow-y-auto">
                  {villages.map((v) => (
                    <button key={v} onClick={() => selectVillage(v)} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${selected.village === v ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'}`}>{v}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Selected location preview */}
        {isComplete && (
          <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                <MapPin size={18} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-foreground text-sm">{selected.village}</p>
                <p className="text-xs text-muted-foreground">{selected.taluk} Taluk · {selected.district} District</p>
                <p className="text-xs text-muted-foreground">{selected.state}</p>
                {gpsEnabled && selected.lat && (
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Navigation size={10} /> GPS: {selected.lat.toFixed(4)}, {selected.lng?.toFixed(4)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Progress indicator */}
        <div className="flex items-center gap-2 mb-5">
          {[
            { label: 'State', done: !!selected.state },
            { label: 'District', done: !!selected.district },
            { label: 'Taluk', done: !!selected.taluk },
            { label: 'Village', done: !!selected.village },
          ].map((step, i) => (
            <React.Fragment key={step.label}>
              <div className="flex flex-col items-center gap-1">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${step.done ? 'bg-success text-white' : 'bg-muted text-muted-foreground'}`}>
                  {step.done ? '✓' : i + 1}
                </div>
                <span className={`text-[10px] font-medium ${step.done ? 'text-success' : 'text-muted-foreground'}`}>{step.label}</span>
              </div>
              {i < 3 && <div className={`flex-1 h-0.5 transition-colors ${step.done ? 'bg-success' : 'bg-border'}`} />}
            </React.Fragment>
          ))}
        </div>

        <button
          disabled={!isComplete}
          onClick={handleConfirm}
          className="w-full btn-primary py-3.5 text-base font-bold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <MapPin size={16} className="inline mr-2" />
          Confirm Service Area
        </button>

        <p className="text-xs text-muted-foreground text-center mt-3">
          This helps us show equipment and services available in your exact area
        </p>
      </main>
      <Footer />
    </div>
  );
}
