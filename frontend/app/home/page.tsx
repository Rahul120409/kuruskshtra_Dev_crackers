'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { 
  Sparkles, 
  Clock, 
  Calendar, 
  Scissors, 
  ArrowRight, 
  QrCode, 
  CheckCircle2, 
  Users,
  ChevronRight,
  Star,
  Search,
  MapPin,
  Phone,
  Store,
  Zap,
  Filter,
  LogOut,
  X,
  RotateCw,
  Navigation,
  Compass
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { DEMO_HAIRSTYLES } from '../../services/mockData';
import { salonService } from '../../services/salonService';
import { Salon } from '../../types';
import { WalkinQrModal } from '../../components/WalkinQrModal';
import { BookingWizardModal } from '../../components/BookingWizardModal';
import { LocationModal } from '../../components/LocationModal';
import { 
  LocationData, 
  DEFAULT_USER_LOCATION, 
  getSalonDistanceKm, 
  buildGoogleMapsDirectionsUrl 
} from '../../services/locationService';

export default function CustomerHomePage() {
  const { user, activeToken, logoutUser } = useCustomer();
  const [isQrOpen, setIsQrOpen] = useState(false);

  // Real-time Salons State from Backend (zero mock data)
  const [salons, setSalons] = useState<Salon[]>([]);
  const [isLoadingSalons, setIsLoadingSalons] = useState<boolean>(true);

  // User Proximity Location State (e.g. Palghar 401404, Baner 411045)
  const [userLocation, setUserLocation] = useState<LocationData>(DEFAULT_USER_LOCATION);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState<boolean>(false);

  // Search & Filtering state for Salons
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('All');

  // Booking Wizard Modal state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSalonForBooking, setSelectedSalonForBooking] = useState<Salon | null>(null);

  const hasActiveToken = activeToken && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(activeToken.status);
  const displayName = user ? user.name.split(' ')[0] : 'Customer';

  const areas = ['All', 'Near Me (< 15km)', 'Baner', 'Koregaon Park', 'Viman Nagar', 'Kalyani Nagar', 'Palghar / Mumbai'];

  // Fetch real-time salons directly from backend API
  const fetchLiveSalons = async () => {
    setIsLoadingSalons(true);
    try {
      const live = await salonService.getSalons();
      setSalons(live || []);
    } catch (err) {
      console.error('Failed to load salons from backend:', err);
      setSalons([]);
    } finally {
      setIsLoadingSalons(false);
    }
  };

  // Check on mount if location prompt should open and start auto-polling for new salons
  useEffect(() => {
    fetchLiveSalons();

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('salonflow_user_location');
      const shouldPrompt = sessionStorage.getItem('salonflow_show_location_prompt');

      if (saved) {
        try {
          setUserLocation(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved location', e);
        }
      }

      // Automatically trigger the location popup if newly logged in or no location chosen yet
      if (shouldPrompt === 'true' || !saved) {
        setIsLocationModalOpen(true);
        sessionStorage.removeItem('salonflow_show_location_prompt');
      }
    }

    // Auto-poll every 8 seconds so newly registered salons appear immediately without manual reload
    const interval = setInterval(() => {
      salonService.getSalons().then((live) => {
        if (live && live.length > 0) {
          setSalons(live);
        }
      }).catch(() => {});
    }, 8000);

    const onFocus = () => fetchLiveSalons();
    window.addEventListener('focus', onFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, []);

  const handleUpdateLocation = (loc: LocationData) => {
    setUserLocation(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('salonflow_user_location', JSON.stringify(loc));
    }
    // Instantly refresh live salons and recalculate proximities
    fetchLiveSalons();
  };

  const handleNavigateGoogleMaps = (salon: Salon) => {
    const url = buildGoogleMapsDirectionsUrl(salon, userLocation);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Enhance each salon with distanceKm and sort nearest first
  const salonsWithDistance = useMemo(() => {
    return salons
      .map((salon) => {
        const distanceKm = getSalonDistanceKm(userLocation, salon);
        return {
          ...salon,
          distanceKm,
        };
      })
      .sort((a, b) => (a.distanceKm || 0) - (b.distanceKm || 0));
  }, [salons, userLocation]);

  // Filter salons by search query and area / distance
  const filteredSalons = useMemo(() => {
    return salonsWithDistance.filter((salon) => {
      const areaStr = (salon.area || '').toLowerCase();
      const cityStr = (salon.city || '').toLowerCase();
      const pincodeStr = (salon.pincode || '').toLowerCase();
      const addressStr = (salon.address || '').toLowerCase();
      
      let matchesArea = true;
      if (selectedArea === 'Near Me (< 15km)') {
        // Included if computed distance <= 15km or if both user and salon are in Pune metro
        const isUserInPune = (userLocation.city || '').toLowerCase().includes('pune') || userLocation.pincode.startsWith('411');
        const isSalonInPune = cityStr.includes('pune') || areaStr.includes('pune') || addressStr.includes('pune') || pincodeStr.startsWith('411');
        matchesArea = (salon.distanceKm || 0) <= 15 || (isUserInPune && isSalonInPune);
      } else if (selectedArea === 'Palghar / Mumbai') {
        matchesArea = cityStr.includes('palghar') || cityStr.includes('mumbai') || areaStr.includes('palghar');
      } else if (selectedArea !== 'All') {
        matchesArea = 
          areaStr.includes(selectedArea.toLowerCase()) || 
          cityStr.includes(selectedArea.toLowerCase()) ||
          addressStr.includes(selectedArea.toLowerCase());
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery = 
        !q ||
        salon.name.toLowerCase().includes(q) ||
        areaStr.includes(q) ||
        addressStr.includes(q) ||
        cityStr.includes(q) ||
        pincodeStr.includes(q);

      return matchesArea && matchesQuery;
    });
  }, [salonsWithDistance, searchQuery, selectedArea, userLocation]);

  const handleOpenBooking = (salon: Salon) => {
    setSelectedSalonForBooking(salon);
    setIsBookingModalOpen(true);
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Welcome Bar with Profile info & Sign Out */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Customer Hub
            </span>
            <span className="text-xs text-slate-400">• Pune Metro Region</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Discover premier salons, check real-time queue times, and book your haircut in 4 easy steps.
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            onClick={() => setIsQrOpen(true)}
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-xs font-semibold text-slate-200 flex items-center justify-center gap-2 transition-colors shadow-sm"
          >
            <QrCode className="w-4 h-4 text-indigo-400" />
            <span>Walk-In QR</span>
          </button>
          
          <Link
            href="/ai-recommend"
            className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/20"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Hairstyle Match</span>
          </Link>

          {/* Quick Sign Out */}
          <button
            onClick={logoutUser}
            title="Sign Out"
            className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Active Live Queue Token Banner (If in Queue) */}
      {hasActiveToken ? (
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-indigo-500/40 p-6 sm:p-7 shadow-xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600 text-white flex flex-col items-center justify-center font-mono shadow-lg shadow-indigo-600/30 flex-shrink-0 border border-indigo-400/30">
                <span className="text-[10px] uppercase font-bold tracking-wider">TOKEN</span>
                <span className="text-2xl font-extrabold">#{activeToken.tokenNumber}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    activeToken.status === 'CALLED' 
                      ? 'bg-emerald-500 text-black animate-pulse' 
                      : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                  }`}>
                    {activeToken.status === 'CALLED' ? "It's Your Turn!" : 'Active Queue Pass'}
                  </span>
                  <span className="text-xs text-slate-400">
                    Station {activeToken.stationNumber || 3} • Barber: {activeToken.staffName || 'Vikram Joshi'}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-white mt-1">
                  {activeToken.serviceName || 'Precision Haircut & Styling'}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-400 mt-1">
                  <span>
                    Queue Position: <strong className="text-indigo-400">{activeToken.position > 0 ? `${activeToken.position}th in line` : 'At Barber Chair'}</strong>
                  </span>
                  <span>•</span>
                  <span>Estimated Wait: <strong className="text-white">~{activeToken.estimatedWait} mins</strong></span>
                </div>
              </div>
            </div>

            <Link
              href="/queue"
              className="w-full md:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition-all"
            >
              <span>Track Live Queue Progress</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : null}

      {/* ======================================================== */}
      {/* ACTIVE LOCATION & PINCODE STATUS BAR                     */}
      {/* ======================================================== */}
      <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center shadow-inner flex-shrink-0">
            <MapPin className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                Your Browsing Location
              </span>
              {userLocation.isGps && (
                <span className="px-2 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  GPS Active
                </span>
              )}
            </div>
            <div className="text-base font-black text-white flex flex-wrap items-center gap-2 mt-0.5">
              <span>{userLocation.area}, {userLocation.city}</span>
              <span className="px-2.5 py-0.5 rounded-md bg-slate-800/90 text-indigo-300 font-mono text-xs font-bold border border-slate-700 shadow-sm">
                PIN: {userLocation.pincode}
              </span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setIsLocationModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-all shadow-sm w-full sm:w-auto"
        >
          <Compass className="w-4 h-4 text-indigo-400" />
          <span>Change Pincode / Area</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SALON SEARCH & DISCOVERY SECTION                         */}
      {/* ======================================================== */}
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                Salon Proximity Network
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
              Salons Near {userLocation.area}, {userLocation.city}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Salons sorted by proximity from your pincode ({userLocation.pincode}) with real-time Google Maps directions.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live API (Port 8081)</span>
            </div>

            <button
              onClick={fetchLiveSalons}
              disabled={isLoadingSalons}
              title="Refresh live salons"
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 transition-colors"
            >
              <RotateCw className={`w-3.5 h-3.5 ${isLoadingSalons ? 'animate-spin text-indigo-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Search Bar & Area Filters */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3.5 shadow-lg">
          {/* Main Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search salon by name, area, or locality (e.g. Koregaon Park, Baner, Viman Nagar)..."
              className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl pl-11 pr-10 py-3 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Area Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-400 font-medium flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5 text-indigo-400" />
              <span>Location:</span>
            </span>
            <div className="flex items-center gap-2">
              {areas.map((area) => (
                <button
                  key={area}
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-1.5 rounded-lg font-semibold whitespace-nowrap transition-all border ${
                    selectedArea === area
                      ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600 hover:bg-slate-800'
                  }`}
                >
                  {area}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Salon Cards Grid / Loading / Empty States */}
        {isLoadingSalons ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <div
                key={i}
                className="rounded-2xl bg-slate-900/40 border border-slate-800/80 p-5 space-y-4 animate-pulse"
              >
                <div className="h-44 w-full bg-slate-800/60 rounded-xl" />
                <div className="space-y-2">
                  <div className="h-5 w-3/5 bg-slate-800/80 rounded" />
                  <div className="h-3.5 w-4/5 bg-slate-800/50 rounded" />
                  <div className="h-3.5 w-2/5 bg-slate-800/40 rounded" />
                </div>
                <div className="pt-3 border-t border-slate-800/60 flex gap-3">
                  <div className="h-9 flex-1 bg-slate-800/60 rounded-xl" />
                  <div className="h-9 w-28 bg-slate-800/40 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredSalons.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredSalons.map((salon) => (
              <div
                key={salon.id}
                className="rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all overflow-hidden flex flex-col justify-between group shadow-lg"
              >
                {/* Card Top: Image & Live Queue Badge */}
                <div className="relative h-48 w-full overflow-hidden bg-slate-950">
                  <img
                    src={salon.imageUrl}
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      {salon.area}
                    </span>
                    {salon.distanceKm !== undefined && (
                      <span className={`px-2.5 py-1 rounded-full backdrop-blur-md text-xs font-bold border flex items-center gap-1.5 shadow-sm ${
                        salon.distanceKm <= 8
                          ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50'
                          : 'bg-slate-950/80 text-slate-300 border-slate-700'
                      }`}>
                        <Navigation className="w-3 h-3 text-emerald-400" />
                        <span>
                          {salon.distanceKm <= 1 ? `Near You (${Math.round(salon.distanceKm * 1000)}m)` : `${salon.distanceKm} km away`}
                        </span>
                      </span>
                    )}
                  </div>

                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {filteredSalons[0]?.id === salon.id ? (
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-400 text-black text-[10px] font-black uppercase tracking-wider shadow flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        Nearest to You
                      </span>
                    ) : (salon.distanceKm !== undefined && salon.distanceKm <= 7) ? (
                      <span className="px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-500/40 text-[10px] font-bold uppercase tracking-wider shadow">
                        Near Salon
                      </span>
                    ) : null}
                    <span className="px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md text-amber-400 text-xs font-bold border border-amber-500/30 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      {salon.rating} ({salon.reviewCount})
                    </span>
                  </div>


                  {/* Bottom Live Wait Badge on Image */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-xs">
                    <div className="px-2.5 py-1 rounded-lg bg-emerald-500/20 backdrop-blur-md text-emerald-300 font-semibold border border-emerald-500/40 flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      <span>{salon.totalWaiting || 1} in Queue • ~{salon.currentWaitMinutes || 15}m wait</span>
                    </div>

                    <span className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-md text-slate-300 text-[11px]">
                      Open {salon.openingTime} - {salon.closingTime}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                      {salon.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="truncate">{salon.address}</span>
                    </p>
                    <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span>{salon.phone}</span>
                    </p>
                  </div>

                  {/* Feature Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/80 text-[11px] text-slate-300">
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">✂️ Precision Cut</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">💈 Beard Styling</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400">🤖 AI Face Scan</span>
                  </div>

                  {/* Booking & Navigation Action Buttons */}
                  <div className="pt-3 border-t border-slate-800 flex items-center gap-2">
                    <button
                      onClick={() => handleOpenBooking(salon)}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </button>

                    <button
                      onClick={() => handleNavigateGoogleMaps(salon)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-emerald-400 hover:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 hover:border-emerald-500/40 transition-all shadow-sm"
                      title="Open turn-by-turn directions in Google Maps"
                    >
                      <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Directions</span>
                    </button>

                    <button
                      onClick={() => handleOpenBooking(salon)}
                      className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all"
                      title="Quick Queue Token"
                    >
                      <Zap className="w-3.5 h-3.5 text-amber-400" />
                      <span className="hidden sm:inline">Token</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : salons.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Store className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Registered Salons</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              There are currently no registered salons available in the system.
            </p>
          </div>
        ) : (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3">
            <Store className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-white">No Matching Salons</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              We couldn't find any salon matching "{searchQuery}" in "{selectedArea}". Try another search term or reset filters.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedArea('All');
              }}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-xs font-semibold text-white border border-slate-700 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 4 CORE QUICK ACTION CARDS                                */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
        
        {/* Action 1: AI Hairstyle Consultation */}
        <Link
          href="/ai-recommend"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-sm"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">
              AI Style Consultation
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload selfie for facial geometry analysis & catalog cut matching.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-indigo-400 mt-4">
            <span>Start Scan</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action 2: Live Queue */}
        <Link
          href="/queue"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-sm"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
              Live Queue & Token
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Track live position, countdown wait time, and reception check-in pass.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-emerald-400 mt-4">
            <span>Track Queue</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action 3: Appointments */}
        <Link
          href="/appointments"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-sm text-left"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors">
              My Appointments
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              View active queue passes, upcoming slots, and booking records.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-cyan-400 mt-4">
            <span>View Bookings</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        {/* Action 4: Salon Services */}
        <Link
          href="/services"
          className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between group shadow-sm"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
              <Scissors className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              Services Catalog
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Explore haircut techniques, beard grooming, and scalp therapies.
            </p>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-purple-400 mt-4">
            <span>View Pricing</span>
            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

      </div>

      {/* Curated Style Recommendations */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Tailored for You</span>
            <h2 className="text-xl font-bold text-white mt-0.5">Recommended Hairstyles</h2>
          </div>
          <Link href="/ai-recommend" className="text-xs text-indigo-400 hover:underline flex items-center gap-1">
            <span>Retake AI Scan</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_HAIRSTYLES.slice(0, 3).map((style) => (
            <div
              key={style.id}
              className="rounded-2xl bg-slate-900/50 border border-slate-800 overflow-hidden hover:border-indigo-500/30 transition-all flex flex-col justify-between group shadow-md"
            >
              <div className="relative h-48 w-full overflow-hidden">
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-0.5 rounded-full bg-emerald-500 text-black text-[10px] font-extrabold shadow">
                  95% Match
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">{style.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">{style.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">ID: {style.id}</span>
                  <button
                    onClick={() => {
                      if (salons.length > 0) {
                        handleOpenBooking(salons[0]);
                      }
                    }}
                    disabled={salons.length === 0}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors shadow-sm ${
                      salons.length > 0
                        ? 'bg-indigo-600 hover:bg-indigo-500 text-white'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Book This Style
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Step Booking Wizard Modal */}
      <BookingWizardModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        salon={selectedSalonForBooking}
      />

      {/* Walk-in QR Modal */}
      <WalkinQrModal isOpen={isQrOpen} onClose={() => setIsQrOpen(false)} />

      {/* Turn On Location & Pincode Selection Modal */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleUpdateLocation}
        currentLocation={userLocation}
      />
    </div>
  );
}
