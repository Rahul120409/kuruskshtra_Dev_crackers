'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Salon } from '../../types';
import { useCustomer } from '../../context/CustomerContext';
import { salonService } from '../../services/salonService';
import { WalkinQrModal } from '../../components/WalkinQrModal';
import { BookingWizardModal } from '../../components/BookingWizardModal';
import { LocationModal } from '../../components/LocationModal';
import {
  LocationData,
  DEFAULT_USER_LOCATION,
  getSalonDistanceKm,
  buildGoogleMapsDirectionsUrl
} from '../../services/locationService';
import { queueWebSocket } from '../../services/websocketService';

interface LuxurySalonItem {
  id: string;
  name: string;
  location: string;
  rating: number;
  reviews: string;
  price: string;
  tags: string[];
  stylistName: string;
  stylistStatus: string;
  stylistAvatar: string;
  interiorImage: string;
  waitBadgeText: string;
  waitMinutes: number;
  distanceMi: string;
  distanceNum: number;
  vipTag: string;
  isOpenNow?: boolean;
  category: string;
  rawSalon?: Salon;
  ongoingToken: number;
  nextAvailableToken: number;
}

function mapBackendSalonToLuxury(s: Salon, index: number, userLoc: LocationData): LuxurySalonItem {
  const distKm = getSalonDistanceKm(userLoc, s);
  const distMi = distKm * 0.621371;
  const waitMins = s.currentWaitMinutes ?? 0;
  const totalWaiting = s.totalWaiting ?? 0;
  const isOpen = s.status === 'OPEN';
  const isAvailableNow = isOpen && waitMins <= 8;
  const ongoingToken = Math.max(1, totalWaiting > 0 ? totalWaiting : 1);
  const nextAvailableToken = totalWaiting + 1;

  let tags: string[] = [];
  if (s.salonDescription && s.salonDescription.trim()) {
    tags = s.salonDescription.split(',').map(w => w.trim()).filter(Boolean).slice(0, 3);
  }

  const locationDisplay = s.area
    ? `${s.area}${s.city ? ` • ${s.city}` : ''}`
    : (s.address || s.city || '');

  return {
    id: s.id,
    name: s.name,
    location: locationDisplay,
    rating: s.rating ?? 0,
    reviews: s.reviewCount ? `${s.reviewCount} reviews` : '',
    price: '',
    tags,
    stylistName: s.ownerName || '',
    stylistStatus: isAvailableNow ? 'Ready now' : (waitMins > 0 ? `~${waitMins} mins wait` : (isOpen ? 'Available' : 'Closed')),
    stylistAvatar: '',
    interiorImage: (s.imageUrl && s.imageUrl.startsWith('http')) ? s.imageUrl : '',
    waitBadgeText: isAvailableNow
      ? `Open Now • Next Token #${nextAvailableToken}`
      : (waitMins > 0 ? `~${waitMins}m Wait • Next #${nextAvailableToken}` : (isOpen ? 'Open' : 'Closed')),
    waitMinutes: waitMins,
    distanceMi: distMi > 0 ? `${distMi.toFixed(1)} mi away` : '',
    distanceNum: distMi,
    vipTag: isOpen ? (isAvailableNow ? 'Chair Open' : 'Open') : 'Closed',
    isOpenNow: isOpen,
    category: s.area || s.city || 'Salon',
    rawSalon: s,
    ongoingToken,
    nextAvailableToken
  };
}

export default function CustomerHomePage() {
  const router = useRouter();
  const { activeToken, user } = useCustomer();
  const [liveSalons, setLiveSalons] = useState<Salon[]>([]);
  const [isLoadingSalons, setIsLoadingSalons] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Salons');
  const [selectedRitual, setSelectedRitual] = useState<'All' | 'Haircut' | 'Beard Trim' | 'Hot Shave' | 'Scalp Ritual'>('Haircut');
  const [selectedRadius, setSelectedRadius] = useState<'all' | '1mi' | '3mi'>('all');
  const [under15m, setUnder15m] = useState(false);
  const [sortTab, setSortTab] = useState<'shortest' | 'top' | 'nearest' | 'openNow'>('shortest');

  // Modals state
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData>(DEFAULT_USER_LOCATION);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedSalonForBooking, setSelectedSalonForBooking] = useState<Salon | null>(null);
  const [streamModalOpen, setStreamModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedSalonForDetails, setSelectedSalonForDetails] = useState<Salon | null>(null);

  // Fetch real-time salons from API
  const fetchLiveSalons = async (showSyncIndicator = false) => {
    if (showSyncIndicator) setIsSyncing(true);
    try {
      const list = await salonService.getSalons();
      if (list && list.length > 0) {
        setLiveSalons(list);
      }
    } catch (err) {
      console.warn('Real-time salon API call status:', err);
    } finally {
      setIsLoadingSalons(false);
      if (showSyncIndicator) {
        setTimeout(() => setIsSyncing(false), 600);
      }
    }
  };

  useEffect(() => {
    fetchLiveSalons();

    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('salonflow_user_location');
      if (saved) {
        try {
          setUserLocation(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse saved location in home page', e);
        }
      }
    }

    // Subscribe to live WebSocket broadcasts so queue counts and tokens update dynamically without reloading
    const unsubWs = queueWebSocket.subscribeToGlobal((board) => {
      if (!board || !board.salonId) return;
      setLiveSalons((prev) =>
        prev.map((s) => {
          if (s.id === board.salonId) {
            return {
              ...s,
              totalWaiting: typeof board.totalWaiting === 'number' ? board.totalWaiting : s.totalWaiting,
              currentWaitMinutes: typeof board.totalWaiting === 'number' ? board.totalWaiting * 15 : s.currentWaitMinutes,
              currentServingTokenNumber: board.currentServingTokenNumber !== undefined ? board.currentServingTokenNumber : s.currentServingTokenNumber,
            };
          }
          return s;
        })
      );
    });

    return () => {
      unsubWs();
    };
  }, []);

  const categories = [
    { label: 'All Salons' },
    { label: 'Signature Haircut' },
    { label: 'Beard & Mustache Sculpt' },
    { label: 'Hot Lather Shave' },
    { label: 'Keratin & Scalp Therapy' },
    { label: 'VIP Grooming Lounge', icon: 'workspace_premium' }
  ];

  // Convert live salons from DB API into luxury Haute Atelier items
  const luxurySalonsList = useMemo<LuxurySalonItem[]>(() => {
    return (liveSalons || []).map((s, idx) => mapBackendSalonToLuxury(s, idx, userLocation));
  }, [liveSalons, userLocation]);

  const filteredSalons = useMemo(() => {
    return luxurySalonsList.filter((salon) => {
      // Multi-field Search (Name, City, State/Address, Area, Pincode, Stylist, Owner)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const raw = salon.rawSalon;
        const match =
          salon.name.toLowerCase().includes(q) ||
          salon.location.toLowerCase().includes(q) ||
          (raw?.city && raw.city.toLowerCase().includes(q)) ||
          (raw?.address && raw.address.toLowerCase().includes(q)) ||
          (raw?.area && raw.area.toLowerCase().includes(q)) ||
          (raw?.pincode && raw.pincode.toLowerCase().includes(q)) ||
          (raw?.ownerName && raw.ownerName.toLowerCase().includes(q)) ||
          salon.stylistName.toLowerCase().includes(q) ||
          salon.tags.some(t => t.toLowerCase().includes(q));
        if (!match) return false;
      }

      // Radius
      if (selectedRadius === '1mi' && salon.distanceNum > 1.0) return false;
      if (selectedRadius === '3mi' && salon.distanceNum > 3.0) return false;

      // Under 15m
      if (under15m && salon.waitMinutes > 15) return false;

      // Category tab
      if (selectedCategory !== 'All Salons') {
        if (selectedCategory === 'Signature Haircut' && salon.category !== 'Haircut') return false;
        if (selectedCategory === 'Beard & Mustache Sculpt' && salon.category !== 'Beard & Mustache Sculpt') return false;
        if (selectedCategory === 'Hot Lather Shave' && salon.category !== 'Hot Lather Shave') return false;
        if (selectedCategory === 'Keratin & Scalp Therapy' && salon.category !== 'Keratin & Scalp Therapy') return false;
        if (selectedCategory === 'VIP Grooming Lounge' && salon.category !== 'VIP Grooming Lounge') return false;
      }

      // Open now tab
      if (sortTab === 'openNow' && !salon.isOpenNow && salon.waitMinutes > 5) return false;

      return true;
    }).sort((a, b) => {
      if (sortTab === 'shortest') return a.waitMinutes - b.waitMinutes;
      if (sortTab === 'top') return b.rating - a.rating;
      if (sortTab === 'nearest') return a.distanceNum - b.distanceNum;
      if (sortTab === 'openNow') return a.waitMinutes - b.waitMinutes;
      return 0;
    });
  }, [luxurySalonsList, searchQuery, selectedRadius, under15m, selectedCategory, sortTab]);

  const handleOpenDetails = (item?: LuxurySalonItem | Salon | null) => {
    if (!item) return;
    let s: Salon;
    if ('rawSalon' in item && item.rawSalon) {
      s = item.rawSalon;
    } else if ('id' in item && 'name' in item) {
      s = item as Salon;
    } else {
      return;
    }
    setSelectedSalonForDetails(s);
    setIsDetailsModalOpen(true);
  };

  const handleOpenBooking = (item?: LuxurySalonItem | Salon | null) => {
    let s: Salon | null = null;
    if (item && 'rawSalon' in item && item.rawSalon) {
      s = item.rawSalon;
    } else if (item && 'id' in item && 'name' in item) {
      s = item as Salon;
    } else if (liveSalons.length > 0) {
      s = liveSalons[0];
    }

    if (!s) {
      router.push('/booking');
      return;
    }

    const salonId = s.id || '';
    const salonName = s.name || '';
    const area = s.area || s.address || s.city || '';
    const city = s.city || '';
    const wait = s.currentWaitMinutes || 0;
    const query = new URLSearchParams({
      salonId,
      salonName,
      area,
      city,
      wait: String(wait)
    }).toString();

    router.push(`/booking?${query}`);
  };

  const handleOpenDirections = (targetSalon?: Salon) => {
    const s: Salon | null = targetSalon || (liveSalons.length > 0 ? liveSalons[0] : null);
    if (!s) return;
    const url = buildGoogleMapsDirectionsUrl(s, userLocation);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const hasLiveActiveToken = activeToken && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(activeToken.status);
  const activeSalonName = activeToken?.salonName || (liveSalons[0]?.name ?? '');
  const activeStylistName = activeToken?.staffName || '';
  const userBookedTokenNumber = activeToken?.tokenNumber ?? null;
  const activeGuestsAhead = activeToken?.position ? Math.max(0, activeToken.position - 1) : (liveSalons[0]?.totalWaiting ?? 0);
  const ongoingTokenNumber = userBookedTokenNumber
    ? Math.max(1, userBookedTokenNumber - activeGuestsAhead)
    : Math.max(1, liveSalons[0]?.totalWaiting ?? 1);
  const nextAvailableTokenNumber = userBookedTokenNumber
    ? userBookedTokenNumber + 1
    : (liveSalons[0]?.totalWaiting ?? 0) + 1;
  const activeEstimatedWait = activeToken?.estimatedWait ?? (liveSalons[0]?.currentWaitMinutes ?? (activeGuestsAhead * 15));

  return (
    <div className="flex flex-col w-full">

      {/* SECTION 1: DISTRICT LEAD & ACTIVE QUEUE PASS */}
      <section className="relative w-full px-margin-desktop py-space-xl overflow-hidden">
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-secondary/5 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-gutter-desktop items-start">

          {/* Left Column (7 cols) */}
          <div className="lg:col-span-7 flex flex-col gap-space-lg">
            <div className="flex flex-col gap-space-xs">
              <div className="flex items-center gap-space-sm flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-space-sm py-0.5 rounded-full bg-surface-container-high text-secondary font-label-sm text-label-sm tracking-wider uppercase font-semibold">
                  <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.9)] animate-pulse"></span>
                  GPS Live Satellite Lock
                </span>
                <span className="font-body-sm text-body-sm text-outline">•</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant tracking-widest uppercase">
                  {filteredSalons.length} Salons Within Reach
                </span>
              </div>

              <div className="flex items-center gap-space-md pt-space-xs flex-wrap">
                <h1 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                  Beverly Hills, <span className="text-primary font-serif italic font-normal">Downtown West</span>
                </h1>
                <button
                  type="button"
                  onClick={() => setIsLocationModalOpen(true)}
                  className="flex items-center gap-1 px-space-sm py-1 rounded-md bg-surface-container hover:bg-surface-container-high text-primary font-label-sm text-label-sm transition-all duration-200 cursor-pointer"
                >
                  <span>Change District</span>
                  <span className="material-symbols-outlined text-sm">tune</span>
                </button>
              </div>

              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Live atelier occupancy, real-time wait estimation, and instant chair reservations across premier grooming sanctuaries.
              </p>
            </div>

            {/* Quick Parameter Filter Card */}
            <div className="p-space-md rounded-xl bg-surface-container-low shadow-xl flex flex-col gap-space-md border border-outline-variant/30">
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-space-md text-primary text-xl">search</span>
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-space-md py-3 rounded-lg bg-surface-container text-on-surface placeholder:text-outline font-body-md text-body-md focus:outline-none focus:bg-surface-container-high transition-colors"
                  placeholder="Search master barbers, tailored suites, razor rituals, or private parlors..."
                  type="text"
                />
                <span className="absolute right-3 px-2 py-1 rounded bg-surface-container-highest font-label-sm text-label-sm text-outline">
                  ⌘K
                </span>
              </div>

              <div className="flex flex-col gap-space-sm pt-space-xs">
                <div className="flex items-center justify-between text-on-surface-variant font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                  <span>Quick Parameter Filters</span>
                  {(searchQuery || selectedRadius !== 'all' || under15m || selectedRitual !== 'Haircut') && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedRadius('all');
                        setUnder15m(false);
                        setSelectedRitual('Haircut');
                      }}
                      className="text-primary hover:underline lowercase text-xs tracking-normal cursor-pointer"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-space-xs">
                  <span className="font-label-sm text-label-sm text-outline self-center mr-1">Ritual:</span>
                  {(['Haircut', 'Beard Trim', 'Hot Shave', 'Scalp Ritual'] as const).map((rit) => (
                    <button
                      key={rit}
                      type="button"
                      onClick={() => setSelectedRitual(rit)}
                      className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-all cursor-pointer ${selectedRitual === rit
                          ? 'bg-primary text-on-primary font-semibold shadow-sm active:scale-95'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                        }`}
                    >
                      {rit}
                    </button>
                  ))}

                  <span className="text-surface-container-highest font-light mx-1">|</span>
                  <span className="font-label-sm text-label-sm text-outline self-center mr-1">Radius:</span>
                  <button
                    type="button"
                    onClick={() => setSelectedRadius(selectedRadius === '1mi' ? 'all' : '1mi')}
                    className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-colors cursor-pointer ${selectedRadius === '1mi'
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'bg-surface-container hover:bg-surface-container-high text-primary'
                      }`}
                  >
                    &lt; 1 mi
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedRadius(selectedRadius === '3mi' ? 'all' : '3mi')}
                    className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm transition-colors cursor-pointer ${selectedRadius === '3mi'
                        ? 'bg-primary text-on-primary font-semibold'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                  >
                    &lt; 3 mi
                  </button>

                  <span className="text-surface-container-highest font-light mx-1">|</span>
                  <button
                    type="button"
                    onClick={() => setUnder15m(!under15m)}
                    className={`px-space-sm py-1 rounded-full font-label-sm text-label-sm flex items-center gap-1 font-semibold transition-all cursor-pointer ${under15m
                        ? 'bg-secondary text-on-secondary-fixed shadow-sm'
                        : 'bg-secondary/15 text-secondary'
                      }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                    Under 15m Wait
                  </button>
                </div>
              </div>
            </div>

            {/* Quality Standard Triplet */}
            <div className="flex items-center gap-space-lg pt-space-xs text-on-surface-variant font-body-sm text-body-sm flex-wrap">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary text-base">verified</span>
                <span>Sanitized Straight-Edge Standards</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">local_bar</span>
                <span>Artisanal Beverage Curation</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-base">nest_clock_farsight_analog</span>
                <button
                  type="button"
                  onClick={() => fetchLiveSalons(true)}
                  className="hover:text-primary transition-colors flex items-center gap-1 cursor-pointer"
                  title="Click to refresh salons from API"
                >
                  <span>{isSyncing ? 'Syncing...' : 'Real-time Sync'}</span>
                  {isSyncing && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-ping"></span>}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Active Queue Pass Widget (5 cols) */}
          <div className="lg:col-span-5 w-full">
            <div className="relative rounded-2xl p-6 bg-gradient-to-br from-surface-container to-surface-container-low shadow-2xl overflow-hidden border border-outline-variant/30">
              <div className="absolute -right-12 -bottom-12 w-48 h-48 rounded-full bg-primary/10 blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between pb-space-sm">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-secondary animate-ping"></span>
                  <span className="font-label-sm text-label-sm text-secondary font-semibold uppercase tracking-widest">
                    {hasLiveActiveToken ? 'Live Queue Pass' : 'Active Queue Pass'}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm px-2 py-0.5 rounded bg-surface-container-highest text-primary font-medium tracking-wide">
                  {hasLiveActiveToken ? 'Confirmed Ticket' : 'Lounge Priority'}
                </span>
              </div>

              <div className="mt-space-xs flex items-start justify-between">
                <div>
                  <h2 className="font-headline-md text-headline-md text-on-surface font-semibold">{activeSalonName}</h2>
                  <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-xs text-primary">location_on</span>
                    {liveSalons[0]?.area ? `${liveSalons[0].area}, ${liveSalons[0].city || 'Pune'} • Chair #03` : 'Wilshire Corridor • Chair #03'}
                  </p>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider font-semibold">
                    {hasLiveActiveToken ? 'Your Booked Token' : 'Next Available Token'}
                  </span>
                  <span className="font-numeric-ticket text-numeric-ticket leading-none text-primary font-bold tracking-tighter">
                    {hasLiveActiveToken ? `#${userBookedTokenNumber}` : `#${nextAvailableTokenNumber}`}
                  </span>
                  <span className="text-[11px] font-semibold text-secondary mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                    Ongoing Token: #{ongoingTokenNumber}
                  </span>
                </div>
              </div>

              <div className="my-space-md p-space-sm rounded-xl bg-surface-container-high/80 flex items-center justify-between">
                <div className="flex items-center gap-space-sm">
                  <img
                    alt={activeStylistName}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-primary/40"
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuB8sbMI547xs2EeETUONLQx5ZWomrYu0cUUqJCvA6PrUH5qGc5zRVSoxs5HtitCitbdmMlVqYKT0jLa3wbF1EQvr67H8T9yTw8PmgL7jV4PeCHhWcERGcUQ_6jzo-txy7xQIXCxlQy8uM5u_eSEk1bne7U8Mhvd4_xoKSApTHwzEjSGPOzGkxH0glBLxrHSI3zQtWrdvKGFvJIsxTQROP348GsvH8Ft8E19fQ-_2aLBq9UdIUXZVC9_"
                  />
                  <div>
                    <span className="font-label-sm text-label-sm text-on-surface-variant block uppercase tracking-wider">Assigned Professional</span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold">{activeStylistName}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-label-sm text-label-sm text-secondary font-semibold block uppercase tracking-wider">Estimated Seat</span>
                  <span className="font-headline-sm text-headline-sm text-on-surface font-bold">~{activeEstimatedWait} mins</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 pb-space-md">
                <div className="flex items-center justify-between font-label-sm text-label-sm">
                  <span className="text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-secondary">group</span>
                    {hasLiveActiveToken
                      ? `${activeGuestsAhead} guests ahead • Ongoing Token in Chair: #${ongoingTokenNumber}`
                      : `Currently Serving: Token #${ongoingTokenNumber} • Next in Line: Token #${nextAvailableTokenNumber}`}
                  </span>
                  <span className="text-primary font-semibold">{hasLiveActiveToken ? 'Live Synced' : 'Ready to Join'}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-surface-container-highest overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-secondary-container via-secondary to-primary w-3/4 shadow-[0_0_12px_rgba(78,222,163,0.7)] transition-all duration-500"></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                <button
                  type="button"
                  onClick={() => handleOpenDirections()}
                  className="flex items-center justify-center gap-1.5 py-space-sm px-space-sm rounded-lg bg-surface-container-highest hover:bg-surface-bright text-on-surface font-label-lg text-label-lg transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base text-primary">navigation</span>
                  <span>Directions (0.3 mi)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setStreamModalOpen(true)}
                  className="flex items-center justify-center gap-1.5 py-space-sm px-space-sm rounded-lg bg-gradient-to-r from-primary-container to-primary text-on-primary font-label-lg text-label-lg font-semibold shadow-lg hover:opacity-95 transition-transform active:scale-95 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">videocam</span>
                  <span>Live Chair Stream</span>
                </button>
              </div>

              {!hasLiveActiveToken && (
                <button
                  type="button"
                  onClick={() => handleOpenBooking(liveSalons[0] || null)}
                  className="w-full mt-3 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-container via-primary to-primary-fixed text-on-primary font-bold text-xs flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20 transition-all cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">confirmation_number</span>
                  <span>Instant Join Queue (Select Haircut & Token Pass)</span>
                </button>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: RITUALS FILTER CAROUSEL */}
      <section className="w-full px-margin-desktop py-space-sm">
        <div className="flex items-center gap-space-sm overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.label;
            return (
              <button
                key={cat.label}
                type="button"
                onClick={() => setSelectedCategory(cat.label)}
                className={`px-space-md py-2 rounded-full font-label-lg text-label-lg whitespace-nowrap transition-colors flex items-center gap-1.5 cursor-pointer ${isActive
                    ? 'bg-primary text-on-primary shadow-md font-semibold'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface'
                  }`}
              >
                {cat.icon && (
                  <span className={`material-symbols-outlined text-base ${isActive ? 'text-on-primary' : 'text-primary'}`}>
                    {cat.icon}
                  </span>
                )}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* SECTION 3: SALONS GRID */}
      <section className="w-full px-margin-desktop py-space-lg flex flex-col gap-space-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-space-md">
          <div>
            <h2 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
              District Salons &amp; Live Queues
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Instant step-in passes with accurate chair telemetry updated 3 seconds ago.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 rounded-lg bg-surface-container-low self-start md:self-auto border border-outline-variant/30">
            <button
              type="button"
              onClick={() => setSortTab('shortest')}
              className={`px-space-md py-1.5 rounded-md font-label-sm text-label-sm transition-colors cursor-pointer ${sortTab === 'shortest'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
            >
              Shortest Wait Time
            </button>
            <button
              type="button"
              onClick={() => setSortTab('top')}
              className={`px-space-md py-1.5 rounded-md font-label-sm text-label-sm transition-colors cursor-pointer ${sortTab === 'top'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
            >
              Top Rated
            </button>
            <button
              type="button"
              onClick={() => setSortTab('nearest')}
              className={`px-space-md py-1.5 rounded-md font-label-sm text-label-sm transition-colors cursor-pointer ${sortTab === 'nearest'
                  ? 'bg-surface-container-high text-primary font-semibold shadow-sm'
                  : 'hover:bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
            >
              Nearest to Me
            </button>
            <button
              type="button"
              onClick={() => setSortTab('openNow')}
              className={`px-space-md py-1.5 rounded-md font-label-sm text-label-sm transition-colors flex items-center gap-1 cursor-pointer ${sortTab === 'openNow'
                  ? 'bg-secondary text-on-secondary-fixed font-bold shadow-sm'
                  : 'hover:bg-surface-container text-secondary'
                }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
              Chair Open Now
            </button>
          </div>
        </div>

        {/* Real-time DB Salons 3-Column Grid */}
        {isLoadingSalons ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter-desktop">
            {[1, 2, 3].map((n) => (
              <div key={n} className="flex flex-col rounded-2xl bg-surface-container overflow-hidden shadow-xl border border-outline-variant/30 animate-pulse">
                <div className="h-56 bg-surface-container-high"></div>
                <div className="p-space-lg flex flex-col gap-4">
                  <div className="h-6 w-3/4 bg-surface-container-high rounded"></div>
                  <div className="h-4 w-1/2 bg-surface-container-high rounded"></div>
                  <div className="h-14 bg-surface-container-low rounded-xl"></div>
                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <div className="h-10 bg-surface-container-high rounded-lg"></div>
                    <div className="h-10 bg-primary/20 rounded-lg"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="rounded-2xl bg-surface-container-low p-12 text-center border border-outline-variant/30 flex flex-col items-center justify-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-3xl">storefront</span>
            </div>
            <div className="flex flex-col gap-1 max-w-md">
              <h3 className="font-headline-md text-xl font-bold text-on-surface">No Salons in Database Yet</h3>
              <p className="font-body-md text-sm text-on-surface-variant">
                {searchQuery || selectedCategory !== 'All Salons'
                  ? 'No salon matches your search or filter parameters. Try clearing your filters.'
                  : 'There are currently no salons returned from the database API. Any salon registered via the Admin Portal or API will appear here live.'}
              </p>
            </div>
            <div className="flex items-center gap-3 pt-2 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All Salons');
                  setSelectedRadius('all');
                  setUnder15m(false);
                  fetchLiveSalons(true);
                }}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-semibold text-sm shadow-md hover:bg-primary-fixed cursor-pointer transition-all"
              >
                {searchQuery ? 'Clear Filters' : 'Refresh from DB'}
              </button>
              <a
                href="/admin"
                className="px-5 py-2.5 rounded-xl bg-surface-container-high text-on-surface font-semibold text-sm hover:bg-surface-bright cursor-pointer transition-all"
              >
                Open Admin Portal ↗
              </a>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-gutter-desktop">
            {filteredSalons.map((salon) => (
              <div
                key={salon.id}
                className="flex flex-col rounded-2xl bg-surface-container overflow-hidden shadow-xl hover:-translate-y-1 transition-transform duration-300 group border border-outline-variant/30"
              >
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    alt={salon.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    src={salon.interiorImage}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface-container via-surface-container/30 to-transparent"></div>

                  <div className="absolute top-space-md left-space-md flex items-center gap-space-xs flex-wrap">
                    <span className="px-2.5 py-1 rounded-md bg-surface-container-lowest/90 backdrop-blur-md text-primary font-label-sm text-label-sm font-semibold uppercase tracking-wider shadow-xs">
                      {salon.vipTag}
                    </span>
                    <span className={`px-2.5 py-1 rounded-md backdrop-blur-md font-label-sm text-label-sm font-semibold flex items-center gap-1 ${salon.isOpenNow
                        ? 'bg-secondary text-on-secondary-fixed shadow-[0_0_12px_rgba(78,222,163,0.5)] font-bold'
                        : 'bg-secondary/90 text-on-secondary-fixed'
                      }`}>
                      <span className={`w-1.5 h-1.5 rounded-full bg-on-secondary-fixed ${salon.isOpenNow ? 'animate-ping' : ''}`}></span>
                      {salon.waitBadgeText}
                    </span>
                  </div>

                  <div className="absolute bottom-3 right-space-md px-2 py-1 rounded bg-surface-container-lowest/80 backdrop-blur-sm text-on-surface font-label-sm text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-primary text-sm">near_me</span>
                    {salon.distanceMi}
                  </div>
                </div>

                <div className="p-space-lg flex flex-col gap-space-md flex-1 justify-between">
                  <div className="flex flex-col gap-space-xs">
                    <div className="flex items-center justify-between">
                      <h3 className="font-headline-md text-headline-md text-on-surface font-semibold group-hover:text-primary transition-colors">
                        {salon.name}
                      </h3>
                    </div>
                    <div className="flex items-center gap-space-sm">
                      <div className="flex items-center gap-1 text-primary">
                        <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                        <span className="font-label-md text-label-md font-bold">{salon.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-outline font-body-sm text-body-sm">({salon.reviews})</span>
                      <span className="text-outline">•</span>
                      <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">{salon.price}</span>
                    </div>
                    <div className="flex items-center gap-space-xs pt-1 flex-wrap">
                      {salon.tags.map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-container-low flex items-center justify-between border border-outline-variant/20">
                    <div className="flex items-center gap-2.5">
                      {salon.stylistAvatar ? (
                        <img
                          alt={salon.stylistName}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-primary/40"
                          src={salon.stylistAvatar}
                        />
                      ) : null}




                      <div className="flex flex-col">
                        <span className="font-body-sm text-body-sm font-semibold text-on-surface">{salon.stylistName}</span>
                        <span className={`font-label-sm text-label-sm ${salon.isOpenNow ? 'text-secondary font-semibold' : 'text-secondary'}`}>
                          {salon.stylistStatus}
                        </span>
                      </div>
                    </div>
                    <span className="material-symbols-outlined text-outline text-lg">
                      {salon.isOpenNow ? 'offline_bolt' : 'event_available'}
                    </span>
                  </div>

                  {/* Clear Token Flow: Ongoing vs Next Available */}
                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-surface-container/70 border border-outline-variant/30 text-center">
                    <div className="flex flex-col items-center">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-secondary flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-pulse"></span>
                        Ongoing Token
                      </span>
                      <span className="text-xs font-black text-on-surface mt-0.5">
                        #{salon.ongoingToken} <span className="text-[10px] font-normal text-on-surface-variant">(In Chair)</span>
                      </span>
                    </div>
                    <div className="flex flex-col items-center border-l border-outline-variant/30">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Next Available
                      </span>
                      <span className="text-xs font-black text-primary mt-0.5">
                        #{salon.nextAvailableToken} <span className="text-[10px] font-normal text-on-surface-variant">(Your Pass)</span>
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-space-sm pt-space-xs">
                    <button
                      type="button"
                      onClick={() => handleOpenDetails(salon)}
                      className="py-2.5 px-space-sm rounded-lg bg-surface-container-high hover:bg-surface-bright text-on-surface font-label-md text-label-md transition-colors text-center cursor-pointer border border-outline-variant/30 flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      <span>View Details</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenBooking(salon)}
                      className="py-2.5 px-space-sm rounded-lg bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-label-md text-label-md font-bold transition-transform active:scale-95 text-center shadow-lg shadow-amber-500/20 cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">calendar_today</span>
                      <span>Book Now</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* SECTION 4: LUXETRIM CLUB BLACK VIP BANNER */}
      <section className="w-full px-margin-desktop my-space-lg">
        <div className="relative w-full rounded-2xl p-space-lg md:p-space-xl bg-gradient-to-r from-surface-container-lowest via-surface-container to-surface-container-low shadow-2xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-space-lg border border-primary/20">
          <div className="absolute -top-16 -left-16 w-64 h-64 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
          <div className="absolute right-0 bottom-0 w-80 h-80 rounded-full bg-tertiary/5 blur-3xl pointer-events-none"></div>

          <div className="flex items-center gap-space-lg z-10">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary-container to-primary flex items-center justify-center text-on-primary shadow-lg shrink-0">
              <span className="material-symbols-outlined text-3xl">diamond</span>
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-space-sm">
                <span className="font-label-sm text-label-sm text-primary tracking-widest uppercase font-semibold">Concierge Privilege</span>
                <span className="px-2 py-0.5 rounded-full bg-surface-container-highest text-on-surface font-label-sm text-label-sm">Tier IV Invite</span>
              </div>
              <h3 className="font-headline-lg text-headline-lg text-on-surface font-semibold tracking-tight">
                LuxeTrim Club Black
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-xl">
                Priority queue jumping, reserved chair access, complimentary ritual trims, and private suite buyouts across global metropolitan ateliers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-space-md z-10 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => alert('LuxeTrim Club Black invitation request sent to VIP concierge desk.')}
              className="w-full md:w-auto px-space-xl py-space-sm rounded-xl bg-gradient-to-r from-primary-container via-primary to-primary-fixed text-on-primary font-label-lg text-label-lg font-semibold tracking-wide shadow-lg hover:shadow-primary/20 hover:scale-[1.02] transition-all duration-200 text-center whitespace-nowrap cursor-pointer"
            >
              Upgrade Membership
            </button>
          </div>
        </div>
      </section>

      {/* Interactive Modals */}
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={(loc) => setUserLocation(loc)}
        currentLocation={userLocation}
      />

      <BookingWizardModal
        isOpen={isBookingModalOpen}
        onClose={() => {
          setIsBookingModalOpen(false);
          setSelectedSalonForBooking(null);
        }}
        salon={selectedSalonForBooking}
      />

      <WalkinQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

      {/* SALON VIEW DETAILS MODAL */}
      {isDetailsModalOpen && selectedSalonForDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121622] border border-[#2b354b] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

            {/* Header / Hero image */}
            <div className="relative h-48 w-full bg-gradient-to-br from-amber-500/20 via-slate-900 to-black overflow-hidden flex items-center justify-center">
              {selectedSalonForDetails.imageUrl ? (
                <img
                  src={selectedSalonForDetails.imageUrl}
                  alt={selectedSalonForDetails.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-center space-y-2">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto border border-amber-500/30">
                    <span className="material-symbols-outlined text-3xl">storefront</span>
                  </div>
                  <h4 className="text-lg font-bold text-white">{selectedSalonForDetails.name}</h4>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#121622] via-[#121622]/40 to-transparent"></div>

              <button
                onClick={() => setIsDetailsModalOpen(false)}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer border border-white/10"
              >
                ✕
              </button>

              <div className="absolute bottom-4 left-6 right-6">
                <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold bg-amber-500/10 px-2.5 py-0.5 rounded-full border border-amber-500/20">
                  Salon Profile
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                  {selectedSalonForDetails.name}
                </h3>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5 overflow-y-auto">

              {/* Timing & Wait Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-[#232a3b]">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Hours</span>
                  <p className="text-xs font-semibold text-white mt-1 truncate">
                    {selectedSalonForDetails.openingTime || '09:00 AM'} - {selectedSalonForDetails.closingTime || '09:00 PM'}
                  </p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-[#232a3b]">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Ongoing Token
                  </span>
                  <p className="text-xs font-extrabold text-white mt-1">
                    #{Math.max(1, selectedSalonForDetails.totalWaiting || 1)}
                  </p>
                  <span className="text-[9px] text-zinc-400 block">Serving in chair</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-[#232a3b]">
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block">Next Available</span>
                  <p className="text-xs font-extrabold text-amber-400 mt-1">
                    #{(selectedSalonForDetails.totalWaiting || 0) + 1}
                  </p>
                  <span className="text-[9px] text-zinc-400 block">Assigned upon booking</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-950/60 border border-[#232a3b]">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Estimated Wait</span>
                  <p className="text-xs font-bold text-white mt-1">
                    ~{selectedSalonForDetails.currentWaitMinutes || 0} mins
                  </p>
                  <span className="text-[9px] text-zinc-400 block">{selectedSalonForDetails.totalWaiting || 0} waiting ahead</span>
                </div>
              </div>

              {/* Location & Address */}
              <div className="p-4 rounded-2xl bg-slate-950/40 border border-[#232a3b] space-y-2">
                <div className="flex items-start gap-2.5">
                  <span className="material-symbols-outlined text-amber-400 text-lg flex-shrink-0 mt-0.5">location_on</span>
                  <div>
                    <span className="text-xs font-bold text-white block">Location & Address</span>
                    <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                      {selectedSalonForDetails.address || 'Verified Salon Location'}
                      {selectedSalonForDetails.city ? `, ${selectedSalonForDetails.city}` : ''}
                      {selectedSalonForDetails.pincode ? ` - ${selectedSalonForDetails.pincode}` : ''}
                    </p>
                  </div>
                </div>

                {selectedSalonForDetails.locationLink && (
                  <a
                    href={selectedSalonForDetails.locationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 pt-1"
                  >
                    <span>Open in Google Maps</span>
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                  </a>
                )}
              </div>

              {/* Contact Information */}
              {((selectedSalonForDetails.phone || selectedSalonForDetails.phoneNumber) || selectedSalonForDetails.email) && (
                <div className="p-3.5 rounded-2xl bg-slate-950/40 border border-[#232a3b] space-y-1.5 text-xs">
                  {(selectedSalonForDetails.phone || selectedSalonForDetails.phoneNumber) && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="material-symbols-outlined text-sm text-zinc-400">call</span>
                      <span>Phone: <strong className="text-white">{selectedSalonForDetails.phone || selectedSalonForDetails.phoneNumber}</strong></span>
                    </div>
                  )}
                  {selectedSalonForDetails.email && (
                    <div className="flex items-center gap-2 text-zinc-300">
                      <span className="material-symbols-outlined text-sm text-zinc-400">mail</span>
                      <span>Email: <strong className="text-white">{selectedSalonForDetails.email}</strong></span>
                    </div>
                  )}
                </div>
              )}

              {/* Description */}
              {(selectedSalonForDetails.salonDescription || selectedSalonForDetails.description) && (
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider block">About Studio</span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {selectedSalonForDetails.salonDescription || selectedSalonForDetails.description}
                  </p>
                </div>
              )}

            </div>

            {/* Footer Action Buttons */}
            <div className="p-5 border-t border-[#232a3b] bg-slate-950/80 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsDetailsModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700/60 transition-all cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsDetailsModalOpen(false);
                  handleOpenBooking(selectedSalonForDetails);
                }}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-amber-500/20 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Proceed to Book Now</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Live Chair Stream Modal */}
      {streamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl rounded-2xl bg-surface-container border border-primary/40 p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                <span className="font-headline-sm text-lg font-bold text-on-surface">Live Chair Stream • Cam 03</span>
              </div>
              <button
                onClick={() => setStreamModalOpen(false)}
                className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface"
              >
                ✕
              </button>
            </div>
            <div className="relative aspect-video rounded-xl bg-black overflow-hidden flex items-center justify-center border border-outline-variant/30">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNWAe7WitvyHwb3fnmRawgFneMKE6J15PBh_n3_dJMhsOacjoNBPBM3Y-r0Ovu_SjxqMm6a01qlztlYcPb9-xp7utEYDdgn2J6Po0tUVudQ_PMay0cLssHyThY8U8hLjj_or-ASD_ZQHWxHWfPRZTFPr4Eo9DgKnzxee0FqOetpTsGysM4vY-f1sKCc2p376_HAjs6czo5eWe3tsdUvsapla92TJccL2CbpXizWEYRsu4z2DNLHSJM"
                alt="Live stream feed"
                className="w-full h-full object-cover opacity-80"
              />
              <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 text-white font-mono text-xs flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping"></span>
                <span>REC • 1080P 60FPS • ENCRYPTED</span>
              </div>
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded bg-black/80 text-primary font-mono text-xs">
                Master Jean-Luc • Wilshire Chair #03
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-on-surface-variant">
              <span>Chair telemetry synced</span>
              <button
                onClick={() => setStreamModalOpen(false)}
                className="px-4 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-semibold hover:bg-surface-bright"
              >
                Close Stream
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
