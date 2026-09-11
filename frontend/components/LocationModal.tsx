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
  Check
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

    // If query is a 6 digit pincode not in array
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
        // Fallback gracefully to default
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden max-h-[92vh] flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top ambient glow */}
        <div className="absolute -top-20 -right-20 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner">
              <Navigation className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Location Setup
                </span>
                <span className="text-xs text-slate-400">• Step 1 of 1</span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                Turn On Location
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Set your pincode or GPS to find the nearest salons, live wait times, and get driving directions.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="space-y-5 overflow-y-auto pr-1">
          
          {/* GPS Auto-Detect Button */}
          <button
            onClick={handleUseGps}
            disabled={isDetectingGps}
            className="w-full p-4 rounded-2xl bg-gradient-to-r from-indigo-950/60 to-slate-900 border border-indigo-500/40 hover:border-indigo-400 transition-all flex items-center justify-between group shadow-md"
          >
            <div className="flex items-center gap-3.5 text-left">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/30 group-hover:scale-105 transition-transform">
                {isDetectingGps ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Compass className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Use Device GPS Location</span>
                  <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-semibold border border-emerald-500/30">
                    Fast
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  Automatically detects your coordinates to sort closest salons
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
              Detect &rarr;
            </span>
          </button>

          {gpsError && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{gpsError}</span>
            </div>
          )}

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
              Or Search by Pincode / City
            </span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Pincode (e.g. 401404 or 411045) or Area (Palghar, Baner)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
          </div>

          {/* Instant Search Results dropdown if typing */}
          {searchResults.length > 0 && (
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 space-y-1 max-h-48 overflow-y-auto">
              {searchResults.map((item) => (
                <button
                  key={item.pincode + item.area}
                  onClick={() => {
                    setSelectedLoc(item);
                    setQuery('');
                  }}
                  className="w-full p-2.5 rounded-lg hover:bg-slate-900 flex items-center justify-between text-left transition-colors text-xs"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-400" />
                    <div>
                      <span className="font-bold text-white">{item.area}, {item.city}</span>
                      <span className="text-slate-400 ml-1.5 font-mono text-[11px]">({item.pincode})</span>
                    </div>
                  </div>
                  <span className="text-[11px] text-indigo-400 font-semibold">Select</span>
                </button>
              ))}
            </div>
          )}

          {/* Popular Pincode Suggestion Chips */}
          <div className="space-y-2">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Popular Locations (Click to Select):</span>
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
                    className={`p-2.5 rounded-xl border text-xs text-left flex items-center justify-between transition-all ${
                      isSelected
                        ? 'bg-indigo-600/20 border-indigo-500 text-white font-bold shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-850'
                    }`}
                  >
                    <div>
                      <div className="truncate font-semibold">{chip.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{chip.pin}</div>
                    </div>
                    {isSelected && <Check className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Selection Summary Card */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] uppercase font-mono font-bold text-indigo-300">
                  Target Proximity Location
                </div>
                <div className="text-sm font-extrabold text-white">
                  {selectedLoc.area}, {selectedLoc.city}
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  Pincode: {selectedLoc.pincode} • {selectedLoc.state}
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Ready</span>
            </span>
          </div>

        </div>

        {/* Modal Actions */}
        <div className="pt-4 border-t border-slate-800 flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 text-xs font-semibold transition-colors"
          >
            Skip for now
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="flex-1 py-3 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01]"
          >
            <MapPin className="w-4 h-4" />
            <span>Apply Location & Find Near Salons</span>
          </button>
        </div>

      </div>
    </div>
  );
};
