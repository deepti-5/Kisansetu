'use client';

import React, { useState, useCallback, useEffect, useRef, Suspense } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { MapPin, Navigation, Search, CheckCircle, Loader2, ChevronRight, AlertCircle, X, Map } from 'lucide-react';

interface LocationResult {
  latitude: number;
  longitude: number;
  address: string;
}

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
}

// Dynamic Leaflet map component — loaded only on client
function InteractiveMap({
  lat,
  lng,
  draggable,
  onPinMove,
}: {
  lat: number;
  lng: number;
  draggable: boolean;
  onPinMove?: (lat: number, lng: number) => void;
}) {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    import('leaflet').then((L) => {
      // Fix default icon paths
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [lat, lng],
        zoom: 14,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      const marker = L.marker([lat, lng], { draggable }).addTo(map);

      if (draggable && onPinMove) {
        marker.on('dragend', () => {
          const pos = marker.getLatLng();
          onPinMove(pos.lat, pos.lng);
        });

        // Also allow clicking on map to move pin
        map.on('click', (e: any) => {
          marker.setLatLng(e.latlng);
          onPinMove(e.latlng.lat, e.latlng.lng);
        });
      }

      leafletMapRef.current = map;
      markerRef.current = marker;
    });

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update marker + pan map when lat/lng changes externally
  useEffect(() => {
    if (!leafletMapRef.current || !markerRef.current) return;
    markerRef.current.setLatLng([lat, lng]);
    leafletMapRef.current.panTo([lat, lng]);
  }, [lat, lng]);

  return (
    <>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      />
      <div
        ref={mapRef}
        className="w-full rounded-xl overflow-hidden border border-border"
        style={{ height: '280px', zIndex: 0 }}
      />
      {draggable && (
        <p className="text-xs text-muted-foreground text-center mt-1.5">
          📍 Drag the pin or tap on the map to adjust location
        </p>
      )}
    </>
  );
}

function LocationPickerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/supplier/add-listing';

  const [mode, setMode] = useState<'choose' | 'gps' | 'manual'>('choose');
  const [gpsState, setGpsState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [gpsError, setGpsError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<LocationResult | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [mapAddress, setMapAddress] = useState('');
  const [reversingGeo, setReversingGeo] = useState(false);

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

  const searchAddress = useCallback(async (query: string) => {
    if (!query.trim() || query.length < 3) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&countrycodes=in&format=json&limit=5&addressdetails=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const data: NominatimResult[] = await res.json();
      setSearchResults(data);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => { if (mode === 'manual') searchAddress(searchQuery); }, 600);
    return () => clearTimeout(timer);
  }, [searchQuery, mode, searchAddress]);

  function handleUseGPS() {
    setMode('gps');
    setGpsState('loading');
    if (!navigator.geolocation) {
      setGpsState('error');
      setGpsError('Geolocation is not supported by your browser.');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const address = await reverseGeocode(lat, lng);
        setPickedLocation({ latitude: lat, longitude: lng, address });
        setGpsState('success');
      },
      (err) => {
        setGpsState('error');
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Location permission denied. Please allow location access in your browser settings.');
        } else if (err.code === err.POSITION_UNAVAILABLE) {
          setGpsError('Location information is unavailable. Try manual search instead.');
        } else {
          setGpsError('Could not get your location. Please try again or use manual search.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }

  function handleSelectResult(result: NominatimResult) {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setPickedLocation({ latitude: lat, longitude: lng, address: result.display_name });
    setSearchResults([]);
    setSearchQuery(result.display_name.split(',').slice(0, 3).join(','));
    setMapAddress(result.display_name);
  }

  // Called when user drags pin or clicks map
  const handlePinMove = useCallback(async (lat: number, lng: number) => {
    setReversingGeo(true);
    const address = await reverseGeocode(lat, lng);
    setPickedLocation({ latitude: lat, longitude: lng, address });
    setMapAddress(address);
    setSearchQuery(address.split(',').slice(0, 3).join(','));
    setReversingGeo(false);
  }, [reverseGeocode]);

  function handleConfirm() {
    if (!pickedLocation) return;
    sessionStorage.setItem('kisan_picked_location', JSON.stringify(pickedLocation));
    setConfirmed(true);
    setTimeout(() => router.push(returnTo), 1200);
  }

  if (confirmed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-success" />
          </div>
          <p className="font-bold text-foreground">Location saved!</p>
          <p className="text-sm text-muted-foreground mt-1">Returning to listing form…</p>
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
          <Link href="/supplier/add-listing" className="hover:text-primary">Add Listing</Link>
          <ChevronRight size={14} />
          <span className="text-foreground font-medium">Pick Location</span>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl gradient-green flex items-center justify-center">
            <MapPin size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-foreground">Pick Location</h1>
            <p className="text-sm text-muted-foreground">Set where your equipment is available</p>
          </div>
        </div>

        {/* Choose mode */}
        {mode === 'choose' && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">How would you like to set your equipment location?</p>

            {/* Auto-detect GPS */}
            <button
              onClick={handleUseGPS}
              className="w-full flex items-center gap-4 p-5 bg-card border-2 border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/15 transition-colors">
                <Navigation size={22} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">Detect automatically</p>
                <p className="text-sm text-muted-foreground mt-0.5">Use GPS to detect your current location instantly</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">Most Accurate</span>
                  <span className="text-xs text-muted-foreground">· Requires browser permission</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground shrink-0" />
            </button>

            {/* Manual map pick */}
            <button
              onClick={() => setMode('manual')}
              className="w-full flex items-center gap-4 p-5 bg-card border-2 border-border rounded-2xl hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
            >
              <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center shrink-0 group-hover:bg-amber-100 transition-colors">
                <Map size={22} className="text-amber-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground">Choose manually</p>
                <p className="text-sm text-muted-foreground mt-0.5">Search an address or drag the map pin to your exact spot</p>
                <div className="flex items-center gap-1 mt-2">
                  <span className="text-xs bg-amber-100 text-amber-700 font-semibold px-2 py-0.5 rounded-full">Interactive Map</span>
                  <span className="text-xs text-muted-foreground">· Search + drag pin</span>
                </div>
              </div>
              <ChevronRight size={18} className="text-muted-foreground shrink-0" />
            </button>

            {/* Info banner */}
            <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-100 rounded-xl">
              <MapPin size={16} className="text-blue-500 mt-0.5 shrink-0" />
              <p className="text-xs text-blue-700">
                Your location helps buyers find equipment near them. You can always change it later.
              </p>
            </div>
          </div>
        )}

        {/* GPS / Auto-detect Mode */}
        {mode === 'gps' && (
          <div className="space-y-4">
            <button
              onClick={() => { setMode('choose'); setGpsState('idle'); setPickedLocation(null); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              ← Back
            </button>

            {/* Mode label */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Navigation size={14} className="text-primary" />
              </div>
              <span className="text-sm font-semibold text-foreground">Detect automatically</span>
            </div>

            {gpsState === 'loading' && (
              <div className="bg-card border border-border rounded-2xl p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Loader2 size={28} className="text-primary animate-spin" />
                </div>
                <p className="font-bold text-foreground">Detecting your location…</p>
                <p className="text-sm text-muted-foreground mt-1">Please allow location access when prompted</p>
              </div>
            )}

            {gpsState === 'error' && (
              <div className="bg-card border border-red-200 rounded-2xl p-6">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-foreground">Location access failed</p>
                    <p className="text-sm text-muted-foreground mt-1">{gpsError}</p>
                  </div>
                </div>
                <div className="flex gap-3 mt-4">
                  <button onClick={handleUseGPS} className="btn-primary px-4 py-2 text-sm">Try Again</button>
                  <button onClick={() => setMode('manual')} className="btn-secondary px-4 py-2 text-sm">Choose Manually</button>
                </div>
              </div>
            )}

            {gpsState === 'success' && pickedLocation && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <CheckCircle size={16} className="text-success" />
                    <span className="text-sm font-bold text-foreground">Location detected</span>
                  </div>

                  {/* Live map preview */}
                  <InteractiveMap
                    lat={pickedLocation.latitude}
                    lng={pickedLocation.longitude}
                    draggable={false}
                  />

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
                    <MapPin size={15} className="text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-semibold text-foreground leading-snug">{pickedLocation.address}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pickedLocation.latitude.toFixed(6)}°N, {pickedLocation.longitude.toFixed(6)}°E
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => { setMode('manual'); setPickedLocation(null); }}
                    className="btn-secondary flex-1 py-3 text-sm font-semibold"
                  >
                    Choose Manually
                  </button>
                  <button onClick={handleConfirm} className="btn-primary flex-1 py-3 text-sm font-semibold">
                    Use This Location
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Mode — search + draggable map */}
        {mode === 'manual' && (
          <div className="space-y-4">
            <button
              onClick={() => { setMode('choose'); setPickedLocation(null); setSearchQuery(''); setSearchResults([]); }}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2"
            >
              ← Back
            </button>

            {/* Mode label */}
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
                <Map size={14} className="text-amber-600" />
              </div>
              <span className="text-sm font-semibold text-foreground">Choose manually</span>
            </div>

            {/* Search bar */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                {searching ? (
                  <Loader2 size={16} className="text-muted-foreground animate-spin" />
                ) : (
                  <Search size={16} className="text-muted-foreground" />
                )}
              </div>
              <input
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); if (!pickedLocation) return; setPickedLocation(null); }}
                placeholder="Search village, town, district…"
                className="input-field w-full pl-9 pr-9"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => { setSearchQuery(''); setSearchResults([]); setPickedLocation(null); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Search results dropdown */}
            {searchResults.length > 0 && !pickedLocation && (
              <div className="bg-card border border-border rounded-xl overflow-hidden shadow-sm">
                {searchResults.map((result, i) => (
                  <button
                    key={result.place_id}
                    onClick={() => handleSelectResult(result)}
                    className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors ${i > 0 ? 'border-t border-border' : ''}`}
                  >
                    <MapPin size={15} className="text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {result.display_name.split(',').slice(0, 3).join(',')}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">{result.display_name}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 3 && !searching && searchResults.length === 0 && !pickedLocation && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No results found. Try a different search term.
              </p>
            )}

            {/* Interactive draggable map — shown once a location is picked */}
            {pickedLocation && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-success" />
                      <span className="text-sm font-bold text-foreground">Location selected</span>
                    </div>
                    {reversingGeo && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Loader2 size={12} className="animate-spin" />
                        <span>Updating…</span>
                      </div>
                    )}
                  </div>

                  {/* Draggable map */}
                  <InteractiveMap
                    lat={pickedLocation.latitude}
                    lng={pickedLocation.longitude}
                    draggable={true}
                    onPinMove={handlePinMove}
                  />

                  <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl">
                    <MapPin size={15} className="text-primary mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground leading-snug">
                        {pickedLocation.address.split(',').slice(0, 4).join(',')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pickedLocation.latitude.toFixed(6)}°N, {pickedLocation.longitude.toFixed(6)}°E
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => { setPickedLocation(null); setSearchQuery(''); setSearchResults([]); }}
                    className="btn-secondary flex-1 py-3 text-sm font-semibold"
                  >
                    Search Again
                  </button>
                  <button onClick={handleConfirm} className="btn-primary flex-1 py-3 text-sm font-semibold">
                    Use This Location
                  </button>
                </div>
              </div>
            )}

            {/* Empty state */}
            {!pickedLocation && searchQuery.length < 3 && (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Search size={24} className="text-muted-foreground" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">Search for your location</p>
                  <p className="text-xs text-muted-foreground mt-1">Type at least 3 characters to search</p>
                </div>

                {/* Hint card */}
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                  <p className="text-xs font-semibold text-amber-800 mb-2">💡 Tips for finding your location</p>
                  <ul className="text-xs text-amber-700 space-y-1">
                    <li>• Search by village name, tehsil, or district</li>
                    <li>• After selecting, drag the pin to fine-tune the exact spot</li>
                    <li>• Tap anywhere on the map to move the pin</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function LocationPickerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="text-primary animate-spin" />
      </div>
    }>
      <LocationPickerContent />
    </Suspense>
  );
}
