'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Store,
  MapPin,
  Star,
  Smartphone,
  Banknote,
  CreditCard,
  AlertCircle,
  Tag,
  Flame,
  ChevronRight,
  RefreshCw
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCustomer } from '../../context/CustomerContext';
import { 
  styleService, 
  StyleTypeResponse, 
  SpecificStyleResponse
} from '../../services/styleService';
import {
  staffService,
  StaffResponse,
  StaffStatus
} from '../../services/staffService';

function FullPageBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, selectedHairstyle, joinLiveQueue, addAppointment } = useCustomer();

  const urlSalonId = searchParams.get('salonId') || 'salon-pune-01';
  const urlSalonName = searchParams.get('salonName') || 'The Golden Blade Studio';
  const urlSalonArea = searchParams.get('area') || 'Wilshire Corridor • Beverly Hills';
  const urlWaitMins = Number(searchParams.get('wait')) || 18;

  // Real-time Style Types & Specific Styles state
  const [styleTypes, setStyleTypes] = useState<StyleTypeResponse[]>([]);
  const [specificStyles, setSpecificStyles] = useState<SpecificStyleResponse[]>([]);
  const [isLoadingStyles, setIsLoadingStyles] = useState<boolean>(true);
  const [selectedStyleTypeId, setSelectedStyleTypeId] = useState<string>('');
  const [selectedSpecificStyleId, setSelectedSpecificStyleId] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  // Booking details state
  const [bookingMode, setBookingMode] = useState<'WALK_IN' | 'SCHEDULED'>('WALK_IN');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('02:30 PM');
  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'UPI' | 'CARD'>('COUNTER');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const TIME_SLOTS = ['10:30 AM', '11:45 AM', '01:15 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'];

  const [staffMembers, setStaffMembers] = useState<StaffResponse[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(true);

  // Fetch real-time style types and specific styles from backend DB
  const fetchRealTimeData = async () => {
    setIsLoadingStyles(true);
    setIsLoadingStaff(true);
    try {
      const [typesData, stylesData, staffData] = await Promise.allSettled([
        styleService.getStyleTypes(),
        styleService.getAllSpecificStyles(),
        staffService.getStaffBySalon(urlSalonId),
      ]);

      if (typesData.status === 'fulfilled') {
        setStyleTypes(typesData.value);
        if (typesData.value.length > 0 && !typesData.value.some(t => t.id === selectedStyleTypeId)) {
          setSelectedStyleTypeId(typesData.value[0].id);
        }
      }

      if (stylesData.status === 'fulfilled') {
        setSpecificStyles(stylesData.value);
        if (stylesData.value.length > 0 && !stylesData.value.some(s => s.id === selectedSpecificStyleId)) {
          setSelectedSpecificStyleId(stylesData.value[0].id);
        }
      }

      if (staffData.status === 'fulfilled') {
        setStaffMembers(staffData.value);
      }
    } catch (err) {
      console.warn("Could not load booking data from backend:", err);
    } finally {
      setIsLoadingStyles(false);
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
  }, [urlSalonId]);

  // Filter specific styles by selected Style Type and gender
  const activeStyleType = useMemo(() => {
    return styleTypes.find(t => t.id === selectedStyleTypeId) || styleTypes[0];
  }, [styleTypes, selectedStyleTypeId]);

  const filteredSpecificStyles = useMemo(() => {
    return specificStyles.filter(style => {
      const matchesType = style.styleTypeId === selectedStyleTypeId || 
        (activeStyleType && style.styleTypeCode?.toUpperCase() === activeStyleType.code?.toUpperCase());
      
      const matchesGender = genderFilter === 'ALL' || 
        !style.gender || 
        style.gender === 'UNISEX' || 
        style.gender.toUpperCase() === genderFilter;

      return matchesType && matchesGender;
    });
  }, [specificStyles, selectedStyleTypeId, activeStyleType, genderFilter]);

  const activeSpecificStyle = useMemo(() => {
    return specificStyles.find(s => s.id === selectedSpecificStyleId) || filteredSpecificStyles[0] || specificStyles[0];
  }, [specificStyles, selectedSpecificStyleId, filteredSpecificStyles]);

  const activeStaff = useMemo(() => {
    if (selectedStaffId === 'any') return null;
    return staffMembers.find(st => st.id === selectedStaffId) || null;
  }, [staffMembers, selectedStaffId]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#6366F1', '#10B981', '#F59E0B'],
      });
    } catch {}
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    console.log("🚀 [BOOKING FULL-PAGE] Confirming full-page appointment & token pass:", {
      salonId: urlSalonId,
      salonName: urlSalonName,
      styleType: activeStyleType?.name,
      specificStyle: activeSpecificStyle?.name,
      price: activeSpecificStyle?.price,
      staff: activeStaff ? activeStaff.name : 'First Available',
      bookingMode,
      paymentMethod,
    });

    try {
      const token = await joinLiveQueue(
        activeSpecificStyle?.id || 'srv-custom',
        selectedStaffId === 'any' ? undefined : selectedStaffId,
        selectedHairstyle?.id,
        urlSalonId
      );

      console.log("✅ [BOOKING FULL-PAGE] Live Queue Token generated:", token);

      await addAppointment({
        customerId: user ? user.id : 'usr-customer-001',
        salonId: urlSalonId,
        salonName: urlSalonName,
        salonAddress: urlSalonArea,
        salonArea: urlSalonArea,
        serviceId: activeSpecificStyle?.id || 'srv-custom',
        serviceName: activeSpecificStyle ? activeSpecificStyle.name : 'Custom Haircut Ritual',
        servicePrice: activeSpecificStyle ? activeSpecificStyle.price : 650,
        serviceDuration: activeSpecificStyle ? activeSpecificStyle.durationMinutes : 30,
        staffId: activeStaff ? activeStaff.id : undefined,
        staffName: activeStaff ? activeStaff.name : 'First Available Master Barber',
        staffAvatar: activeStaff?.profileImage || undefined,
        appointmentDate: bookingMode === 'SCHEDULED' ? selectedDate : new Date().toISOString().split('T')[0],
        appointmentTime: bookingMode === 'SCHEDULED' ? selectedTime : '02:30 PM',
        status: 'CONFIRMED',
        source: 'ONLINE',
        bookingType: bookingMode,
        tokenNumber: token?.tokenNumber || 108,
        paymentMethod: paymentMethod === 'COUNTER' ? 'Pay at Salon Counter' : paymentMethod === 'UPI' ? 'UPI' : 'Credit/Debit Card',
        paymentStatus: paymentMethod === 'COUNTER' ? 'PENDING_AT_COUNTER' : 'PAID',
      });

      triggerCelebration();
      setIsSuccess(true);

      setTimeout(() => {
        setIsSubmitting(false);
        router.push('/appointments');
      }, 1600);
    } catch (err) {
      console.error("❌ [BOOKING FULL-PAGE] Booking failed:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#0d1017] text-zinc-100 pb-20">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#121622]/90 backdrop-blur-xl border-b border-[#232a3b] px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/home"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181e2b] hover:bg-[#222b3d] text-zinc-300 hover:text-white text-xs font-semibold transition-all border border-[#2b354b]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Salons</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400">
            <span>/</span>
            <span className="text-zinc-200 font-medium truncate max-w-[200px]">{urlSalonName}</span>
            <span>/</span>
            <span className="text-amber-400 font-semibold">Appointment Booking & Queue</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchRealTimeData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181e2b] text-zinc-300 hover:text-white text-xs font-medium border border-[#2b354b] transition-colors cursor-pointer"
            title="Refresh style catalog and staff from API"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(isLoadingStyles || isLoadingStaff) ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Sync Catalog & Staff</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-time Sync</span>
          </div>
        </div>
      </header>

      {/* Hero Banner with Salon Identification */}
      <section className="px-4 sm:px-8 lg:px-12 pt-6 pb-4">
        <div className="rounded-3xl bg-gradient-to-r from-[#171d2b] via-[#141926] to-[#0f1420] border border-[#273248] p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold uppercase tracking-wider border border-amber-500/30">
                  Full Page Booking Concierge
                </span>
                <span className="px-3 py-1 rounded-full bg-[#202738] text-zinc-300 text-xs font-medium border border-[#2b354b] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  {urlSalonArea}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                {urlSalonName}
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-2xl">
                Choose your specific haircut style, master barber, and claim a live queue token or schedule your private chair. Real-time sync with database.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#0d1017]/80 backdrop-blur-md p-4 rounded-2xl border border-[#232a3b]">
              <div className="text-right">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Estimated Wait</span>
                <span className="text-xl sm:text-2xl font-black text-amber-400">~{urlWaitMins} mins</span>
              </div>
              <div className="w-px h-10 bg-[#2b354b]"></div>
              <div>
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider block">Current Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Chairs Open
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Full Page Content Grid */}
      <main className="px-4 sm:px-8 lg:px-12 pt-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left / Center: Selection Steps (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* STEP 1: Select Style Type (Haircut, Beard, Spa, Color) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#232a3b]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
                    1
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">Select Style Type & Category</h2>
                    <p className="text-xs text-zinc-400">Live categories fetched directly from <code className="text-amber-400/90 font-mono">/api/styles/types</code></p>
                  </div>
                </div>

                {/* Gender Filter Pills */}
                <div className="flex items-center gap-1 bg-[#181e2b] p-1 rounded-xl border border-[#2b354b]">
                  {(['ALL', 'MALE', 'FEMALE'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        genderFilter === g
                          ? 'bg-amber-500 text-slate-950 shadow-md font-bold'
                          : 'text-zinc-400 hover:text-white'
                      }`}
                    >
                      {g === 'ALL' ? 'All Genders' : g}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Type Option Cards (No Photos - Options Only) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
                {styleTypes.map(st => {
                  const isSelected = selectedStyleTypeId === st.id;
                  const categoryIcon = 
                    st.code?.toUpperCase().includes('BEARD') ? '🧔' :
                    st.code?.toUpperCase().includes('SPA') ? '💆' :
                    st.code?.toUpperCase().includes('COLOR') ? '🎨' : '✂️';

                  return (
                    <div
                      key={st.id}
                      onClick={() => {
                        setSelectedStyleTypeId(st.id);
                        console.log("✂️ [BOOKING FULL-PAGE] Selected Style Type:", st.name, `(${st.code})`);
                      }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between group ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500'
                          : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966] hover:bg-[#1c2333]'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base transition-colors ${
                            isSelected ? 'bg-amber-500 text-slate-950 font-black' : 'bg-[#232a3b] text-amber-400'
                          }`}>
                            {categoryIcon}
                          </div>
                          {isSelected ? (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center gap-1">
                              <span>Selected</span>
                              <span>✓</span>
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-zinc-400 uppercase">
                              {st.code}
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className={`text-sm font-bold transition-colors ${
                            isSelected ? 'text-amber-400' : 'text-white group-hover:text-amber-400'
                          }`}>
                            {st.name}
                          </h3>
                          {st.description && (
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                              {st.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#263147] text-[11px]">
                        <span className="text-zinc-400 flex items-center gap-1">
                          <Tag className="w-3 h-3 text-amber-400/70" />
                          <span>Option {st.code}</span>
                        </span>
                        <span className="text-amber-400 font-semibold font-mono">
                          {st.specificStyleCount || 3}+ Styles
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* STEP 2: Choose Specific Style (Taper Fade, Buzz Cut, Pompadour, French Crop) */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#232a3b]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
                    2
                  </div>
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-white">
                      Choose Specific Haircut / Style ({filteredSpecificStyles.length})
                    </h2>
                    <p className="text-xs text-zinc-400">Live specific styles from <code className="text-amber-400/90 font-mono">/api/styles/specific</code></p>
                  </div>
                </div>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  {activeStyleType?.name}
                </span>
              </div>

              {filteredSpecificStyles.length === 0 ? (
                <div className="p-8 text-center text-xs text-zinc-400 bg-[#181e2b] rounded-2xl border border-[#283247]">
                  No specific styles found matching this category and gender filter.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredSpecificStyles.map(spec => {
                    const isSelected = selectedSpecificStyleId === spec.id;
                    return (
                      <div
                        key={spec.id}
                        onClick={() => {
                          setSelectedSpecificStyleId(spec.id);
                          console.log("✂️ [BOOKING FULL-PAGE] Chosen Specific Style:", spec.name, `₹${spec.price}`);
                        }}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex gap-3.5 items-start ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 shadow-xl ring-1 ring-amber-500'
                            : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966]'
                        }`}
                      >
                        {spec.imageUrl && (
                          <img
                            src={spec.imageUrl}
                            alt={spec.name}
                            className="w-20 h-20 rounded-xl object-cover border border-[#2b354b] flex-shrink-0"
                          />
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-between h-full">
                          <div>
                            <div className="flex items-center justify-between gap-1">
                              <h4 className="text-xs font-bold text-white truncate">{spec.name}</h4>
                              <span className="text-xs font-extrabold text-amber-400 font-mono">₹{spec.price}</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-2 mt-1">
                              {spec.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-2 mt-2 border-t border-[#263147] text-[10px] text-zinc-400 flex-wrap gap-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {spec.durationMinutes} mins
                            </span>
                            {spec.suitableFaceShapes && (
                              <span className="truncate max-w-[120px] text-zinc-300">
                                {spec.suitableFaceShapes}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* STEP 3: Barber Selection & Booking Mode */}
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-5">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#232a3b]">
                <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold text-sm border border-amber-500/30">
                  3
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-white">Select Barber & Queue Mode</h2>
                  <p className="text-xs text-zinc-400">Choose between immediate walk-in queue countdown or scheduled seat</p>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="grid grid-cols-2 p-1.5 rounded-2xl bg-[#181e2b] border border-[#283247]">
                <button
                  type="button"
                  onClick={() => setBookingMode('WALK_IN')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    bookingMode === 'WALK_IN'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Instant Walk-In Queue (Now)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode('SCHEDULED')}
                  className={`py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    bookingMode === 'SCHEDULED'
                      ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>Schedule For Later Date</span>
                </button>
              </div>

              {/* Staff Roster */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Select Barber / Stylist
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* First Available Option */}
                  <div
                    onClick={() => setSelectedStaffId('any')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                      selectedStaffId === 'any'
                        ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                        : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-lg flex-shrink-0">
                      ⚡
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">First Available</h5>
                      <p className="text-[10px] text-emerald-400 font-semibold">Fastest Chair</p>
                    </div>
                  </div>

                  {staffMembers.map(st => {
                    const isSelected = selectedStaffId === st.id;
                    const avatar = st.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400';
                    const statusColor = 
                      st.status === 'AVAILABLE' ? 'text-emerald-400' :
                      st.status === 'BUSY' ? 'text-amber-400' :
                      st.status === 'BREAK' ? 'text-orange-400' : 'text-zinc-500';
                    const statusDot = 
                      st.status === 'AVAILABLE' ? 'bg-emerald-400' :
                      st.status === 'BUSY' ? 'bg-amber-400' :
                      st.status === 'BREAK' ? 'bg-orange-400' : 'bg-zinc-500';
                    const statusText = 
                      st.status === 'AVAILABLE' ? 'Available' :
                      st.status === 'BUSY' ? 'With Client' :
                      st.status === 'BREAK' ? 'On Break' : 'Offline';

                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStaffId(st.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center gap-3 ${
                          isSelected
                            ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500 shadow-md'
                            : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966]'
                        }`}
                      >
                        <img
                          src={avatar}
                          alt={st.name}
                          className="w-10 h-10 rounded-full object-cover border border-[#2b354b] flex-shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-bold text-white truncate">{st.name}</h5>
                          <p className="text-[10px] text-zinc-400 truncate">{st.specialization}</p>
                          <div className={`text-[10px] font-semibold flex items-center gap-1.5 mt-0.5 ${statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot} ${st.status === 'AVAILABLE' ? 'animate-pulse' : ''}`}></span>
                            <span>{statusText}</span>
                            {st.experienceYears && (
                              <span className="text-zinc-400 font-normal">• {st.experienceYears}y exp</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Slot picker if SCHEDULED */}
              {bookingMode === 'SCHEDULED' && (
                <div className="space-y-4 pt-3 border-t border-[#263147] animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Pick Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#181e2b] border border-[#283247] text-xs text-white focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Pick Chair Slot</label>
                      <div className="flex flex-wrap gap-1.5">
                        {TIME_SLOTS.map(slot => (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                              selectedTime === slot
                                ? 'bg-amber-500 text-slate-950 font-bold'
                                : 'bg-[#181e2b] text-zinc-300 border border-[#283247] hover:text-white'
                            }`}
                          >
                            {slot}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Live Token Pass & Booking Summary (4 cols) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-20">
            
            {/* Live Token Pass Preview Card */}
            <div className="rounded-3xl bg-gradient-to-b from-[#1c1d2e] via-[#121622] to-[#0d1017] border border-indigo-500/40 p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

              <div className="flex items-center justify-between pb-3 border-b border-[#273248]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="text-[11px] font-bold uppercase tracking-widest text-indigo-400">
                    Digital Queue Pass
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Ready to Issue
                </span>
              </div>

              {/* Big Token Number */}
              <div className="py-5 text-center">
                <span className="text-[10px] uppercase font-semibold text-zinc-400 tracking-wider">
                  Allocated Token
                </span>
                <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-white to-amber-200 tracking-tight my-1">
                  #108
                </div>
                <p className="text-xs text-zinc-400 flex items-center justify-center gap-1 mt-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Estimated wait: <strong className="text-white">~{urlWaitMins} mins</strong>
                </p>
              </div>

              {/* Ticket Details Grid */}
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-[#0a0d14]/70 border border-[#232a3b] text-xs mb-4">
                <div>
                  <span className="text-[10px] text-zinc-400 block">Queue Position</span>
                  <span className="text-xs font-bold text-white">4th in Line</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Assigned Station</span>
                  <span className="text-xs font-bold text-amber-400">Station #3</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Assigned Barber</span>
                  <span className="text-xs font-bold text-white truncate block">
                    {activeStaff ? activeStaff.name : 'First Available'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block">Mode</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {bookingMode === 'WALK_IN' ? 'Live Queue' : 'Reserved Slot'}
                  </span>
                </div>
              </div>

              {/* Selected Style Itemization */}
              <div className="space-y-2 text-xs pt-1 border-t border-[#232a3b]">
                <div className="flex items-center justify-between text-zinc-300">
                  <span className="flex items-center gap-1.5 truncate max-w-[180px]">
                    <Scissors className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                    {activeSpecificStyle ? activeSpecificStyle.name : 'Selected Cut'}
                  </span>
                  <span className="font-bold text-amber-400 font-mono">
                    ₹{activeSpecificStyle ? activeSpecificStyle.price : 650}
                  </span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Barber Consultation</span>
                  <span className="text-emerald-400 font-semibold">FREE</span>
                </div>
                <div className="flex items-center justify-between text-zinc-400">
                  <span>Salon Hospitality Ritual</span>
                  <span className="text-emerald-400 font-semibold">COMPLIMENTARY</span>
                </div>
                <div className="pt-2 mt-2 border-t border-[#232a3b] flex items-center justify-between text-sm font-bold text-white">
                  <span>Total Payable</span>
                  <span className="text-base text-amber-400 font-mono">
                    ₹{activeSpecificStyle ? activeSpecificStyle.price : 650}.00
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="p-6 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-3">
              <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                Select Payment Option
              </label>

              {/* Option 1: Counter */}
              <div
                onClick={() => setPaymentMethod('COUNTER')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'COUNTER'
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-[#181e2b] border-[#283247] hover:border-[#3b4966]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Banknote className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <div>
                    <h6 className="text-xs font-bold text-white">Pay at Salon Counter</h6>
                    <p className="text-[10px] text-zinc-400">Pay cash/card after your haircut</p>
                  </div>
                </div>
                {paymentMethod === 'COUNTER' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>

              {/* Option 2: UPI */}
              <div
                onClick={() => setPaymentMethod('UPI')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'UPI'
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-[#181e2b] border-[#283247] hover:border-[#3b4966]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                  <div>
                    <h6 className="text-xs font-bold text-white">Instant UPI</h6>
                    <p className="text-[10px] text-zinc-400">GPay, PhonePe, Paytm</p>
                  </div>
                </div>
                {paymentMethod === 'UPI' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>

              {/* Option 3: Card */}
              <div
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  paymentMethod === 'CARD'
                    ? 'bg-amber-500/10 border-amber-500 ring-1 ring-amber-500'
                    : 'bg-[#181e2b] border-[#283247] hover:border-[#3b4966]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <div>
                    <h6 className="text-xs font-bold text-white">Credit / Debit Card</h6>
                    <p className="text-[10px] text-zinc-400">Visa, MasterCard, RuPay</p>
                  </div>
                </div>
                {paymentMethod === 'CARD' && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
              </div>

              {/* Final Confirm Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || isSuccess}
                className="w-full mt-4 py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Issuing Token #108...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm & Get Live Token #108 (₹{activeSpecificStyle ? activeSpecificStyle.price : 650})</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>SSL 256-bit Encrypted • Zero Cancellation Penalty</span>
              </div>
            </div>

          </div>

        </form>
      </main>

      {/* Success Full-Screen Modal Overlay */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-3xl bg-emerald-500/20 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-2xl shadow-emerald-500/30">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">Token #108 Confirmed!</h2>
          <p className="text-sm text-zinc-300 mt-2 max-w-md">
            You are officially in line at <strong className="text-white">{urlSalonName}</strong> for <strong className="text-amber-400">{activeSpecificStyle?.name}</strong>.
          </p>
          <div className="flex items-center gap-2.5 mt-6 px-4 py-2 rounded-xl bg-[#181e2b] border border-[#2b354b] text-xs text-amber-400 font-semibold">
            <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
            <span>Redirecting to your live queue & appointment dashboard...</span>
          </div>
        </div>
      )}

    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1017] flex items-center justify-center text-zinc-400 text-sm gap-2">
        <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
        <span>Loading Full-Page Haute Atelier Booking Portal...</span>
      </div>
    }>
      <FullPageBookingContent />
    </Suspense>
  );
}
