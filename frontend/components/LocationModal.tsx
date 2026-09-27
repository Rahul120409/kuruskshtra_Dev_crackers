'use client';

import React, { useState, useEffect } from 'react';
import { 
  MapPin, 
  Navigation, 
  Search, 
  CheckCircle2, 
  X, 
  Compass, 
  Sparkles, 
  Loader2, 
  AlertCircle,
  Building,
  Check,
  ArrowRight
} from 'lucide-react';
import { 
  LocationData, 
  POPULAR_LOCATIONS, 
  lookupLocation, 
  findClosestLocation, 
  DEFAULT_USER_LOCATION 
} from '../services/locationService';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (loc: LocationData) => void;
  currentLocation?: LocationData | null;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  onSelectLocation,
  currentLocation,
}) => {
  const [query, setQuery] = useState('');
  const [selectedLoc, setSelectedLoc] = useState<LocationData>(currentLocation || DEFAULT_USER_LOCATION);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<LocationData[]>([]);

  useEffect(() => {
    if (currentLocation) {
      setSelectedLoc(currentLocation);
    }
  }, [currentLocation]);

  // Handle instant search when query changes
  useEffect(() => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const q = query.toLowerCase().trim();
    const results = POPULAR_LOCATIONS.filter(
      (l) =>
        l.pincode.includes(q) ||
        l.area.toLowerCase().includes(q) ||
        l.city.toLowerCase().includes(q) ||
        l.district.toLowerCase().includes(q)
    );

    // If query is a 3 to 6 digit pincode not in array
    if (results.length === 0 && /^\d{3,6}$/.test(q)) {
      const generated = lookupLocation(q);
      if (generated) {
        setSearchResults([generated]);
        return;
      }
    }

    setSearchResults(results);
  }, [query]);

  if (!isOpen) return null;

  const handleUseGps = () => {
    setIsDetectingGps(true);
    setGpsError(null);

    if (!navigator.geolocation) {
      setGpsError('Geolocation is not supported by your browser.');
      setIsDetectingGps(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const resolved = findClosestLocation(latitude, longitude);
        setSelectedLoc(resolved);
        setIsDetectingGps(false);
      },
      (error) => {
        console.warn('GPS detection failed, falling back to Baner, Pune:', error);
        setSelectedLoc(DEFAULT_USER_LOCATION);
        setGpsError('Could not get GPS permission. Defaulted to Baner, Pune (411045).');
        setIsDetectingGps(false);
      },
      { timeout: 8000, enableHighAccuracy: true }
    );
  };

  const handleConfirm = () => {
    if (query.trim()) {
      const resolved = lookupLocation(query) || (searchResults.length > 0 ? searchResults[0] : null);
      if (resolved) {
        onSelectLocation(resolved);
        onClose();
        return;
      }
    }
    onSelectLocation(selectedLoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 dark:bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#11141e] border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[92vh] flex flex-col justify-between text-slate-900 dark:text-white transition-colors duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient brand glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/15 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shadow-inner shrink-0">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                  Location Concierge
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">• Step 1 of 1</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1">
                Select Your Location
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                Pinpoint your city or GPS to discover luxury salons, live wait times, and driving directions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-5 overflow-y-auto pr-1 relative z-10">
          
          {/* GPS Auto-Detect Button */}
          <button
            type="button"
            onClick={handleUseGps}
            disabled={isDetectingGps}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:to-slate-900/60 border border-amber-500/30 hover:border-amber-500/60 transition-all flex items-center justify-between group shadow-sm cursor-pointer"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center shadow-md shadow-amber-500/25 group-hover:scale-105 transition-transform shrink-0">
                {isDetectingGps ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Compass className="w-5 h-5" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Use Device GPS Location</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                    Instant
                  </span>
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Automatically detects your coordinates to sort closest salons
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-600 dark:text-amber-400 group-hover:translate-x-1 transition-transform flex items-center gap-1 shrink-0">
              <span>Detect</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </button>

          {gpsError && (
            <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider">
              Or Search by Pincode / City
            </span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Search Input (DESIGN.md Section 4.2: text-base sm:text-sm) */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Pincode (e.g. 401404 or 411045) or Area (Palghar, Baner)..."
              className="w-full bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 focus:border-amber-500 dark:focus:border-amber-500 rounded-xl pl-10 pr-4 py-3 sm:py-3.5 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20 transition-all shadow-inner"
            />
          </div>

          {/* Instant Search Results dropdown if typing */}
          {searchResults.length > 0 && (
            <div className="p-2 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-1 max-h-48 overflow-y-auto shadow-xl">
              {searchResults.map((item) => (
                <button
                  key={item.pincode + item.area}
                  type="button"
                  onClick={() => {
                    setSelectedLoc(item);
                    setQuery('');
                  }}
                  className="w-full p-2.5 rounded-xl hover:bg-amber-50/70 dark:hover:bg-slate-900 flex items-center justify-between text-left transition-colors text-xs cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-amber-500" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">{item.area}, {item.city}</span>
                      <span className="text-slate-500 dark:text-slate-400 ml-1.5 font-mono text-[11px]">({item.pincode})</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">Select</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Pincode Suggestion Chips */}
          <div className="space-y-2.5">
            <span className="text-xs text-slate-600 dark:text-slate-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Popular Luxury Hubs:</span>
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { name: 'Palghar, Mumbai', pin: '401404' },
                { name: 'Baner, Pune', pin: '411045' },
                { name: 'Koregaon Park', pin: '411001' },
                { name: 'Viman Nagar', pin: '411014' },
                { name: 'Bandra, Mumbai', pin: '400050' },
                { name: 'Hinjawadi, Pune', pin: '411057' },
              ].map((chip) => {
                const isSelected = selectedLoc.pincode === chip.pin;
                return (
                  <button
                    key={chip.pin}
                    type="button"
                    onClick={() => {
                      const found = lookupLocation(chip.pin);
                      if (found) setSelectedLoc(found);
                    }}
                    className={`p-3 rounded-2xl border text-xs text-left flex items-center justify-between transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-amber-900 dark:text-amber-200 font-bold shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-500/40 hover:bg-amber-50/50 dark:hover:bg-slate-900'
                    }`}
                  >
                    <div className="truncate">
                      <div className="truncate font-semibold text-slate-900 dark:text-white">{chip.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{chip.pin}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0 ml-1.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selection Summary Card */}
          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-500/10 border border-amber-500/30 flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold shadow-sm shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono font-extrabold text-amber-700 dark:text-amber-400">
                  Target Proximity Radius
                </div>
                <div className="text-sm font-black text-slate-900 dark:text-white">
                  {selectedLoc.area}, {selectedLoc.city}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                  Pincode: {selectedLoc.pincode} • {selectedLoc.state}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1 shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready</span>
            </span>
          </div>

        </div>

        {/* Modal Actions (DESIGN.md Section 4.1) */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center gap-3 relative z-10">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
            <span>Apply Location & Discover Salons</span>
          </button>
        </div>

      </div>
    </div>
  );
};
