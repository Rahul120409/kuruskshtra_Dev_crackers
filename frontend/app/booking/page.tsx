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
  QrCode,
  RefreshCw,
  Check,
  ChevronRight
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
import { salonService } from '../../services/salonService';
import { customerService } from '../../services/customerService';
import { QueueToken } from '../../types';

function FullPageBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, selectedHairstyle, joinLiveQueue, addAppointment } = useCustomer();

  const [salonDetails, setSalonDetails] = useState<{ id: string; name: string; area: string; wait: number }>({
    id: searchParams.get('salonId') || '',
    name: searchParams.get('salonName') || '',
    area: searchParams.get('area') || searchParams.get('city') || '',
    wait: Number(searchParams.get('wait')) || 0,
  });

  // Active step in the 5-step process
  // 1: Type & Category, 2: Specific Style, 3: Barber, 4: Token Screen, 5: Payment Summary
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Real-time Style Types & Specific Styles state
  const [styleTypes, setStyleTypes] = useState<StyleTypeResponse[]>([]);
  const [specificStyles, setSpecificStyles] = useState<SpecificStyleResponse[]>([]);
  const [isLoadingStyles, setIsLoadingStyles] = useState<boolean>(true);
  const [selectedStyleTypeId, setSelectedStyleTypeId] = useState<string>('');
  const [selectedSpecificStyleId, setSelectedSpecificStyleId] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<'ALL' | 'MALE' | 'FEMALE'>('ALL');

  // Barber / Staff state
  const [staffMembers, setStaffMembers] = useState<StaffResponse[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState<boolean>(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('any');

  // Booking mode & schedule
  const [bookingMode, setBookingMode] = useState<'WALK_IN' | 'SCHEDULED'>('WALK_IN');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('02:30 PM');
  const TIME_SLOTS = ['10:30 AM', '11:45 AM', '01:15 PM', '02:30 PM', '04:00 PM', '05:30 PM', '07:00 PM'];

  // Customer Contact info (for guest or confirmed user)
  const [guestName, setGuestName] = useState<string>(user?.name || '');
  const [guestPhone, setGuestPhone] = useState<string>(user?.phone || '');

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<'COUNTER' | 'UPI' | 'CARD'>('COUNTER');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [confirmedToken, setConfirmedToken] = useState<QueueToken | null>(null);

  // Live Queue Board state queried from backend /api/queue/live/{salonId}
  const [liveQueueBoard, setLiveQueueBoard] = useState<{
    nextAvailableTokenNumber?: number;
    currentServingTokenNumber?: number | null;
    totalWaiting?: number;
  } | null>(null);

  useEffect(() => {
    if (user?.name && !guestName) setGuestName(user.name);
    if (user?.phone && !guestPhone) setGuestPhone(user.phone);
  }, [user]);

  // Poll/fetch live queue board when entering Step 4
  useEffect(() => {
    if (currentStep === 4 && salonDetails.id) {
      customerService.getLiveQueueBoard(salonDetails.id).then((board: any) => {
        if (board) setLiveQueueBoard(board);
      }).catch(() => {});
    }
  }, [currentStep, salonDetails.id]);

  // Fetch real-time style types and specific styles from backend DB
  const fetchRealTimeData = async () => {
    setIsLoadingStyles(true);
    setIsLoadingStaff(true);
    console.log("💈 [BOOKING] Fetching real-time Style Types, Specific Styles, and Salon Staff from API...");
    try {
      let currentSalonId = salonDetails.id;
      if (!currentSalonId || !salonDetails.name) {
        try {
          const liveSalons = await salonService.getSalons();
          if (liveSalons && liveSalons.length > 0) {
            const target = currentSalonId ? (liveSalons.find(s => s.id === currentSalonId) || liveSalons[0]) : liveSalons[0];
            currentSalonId = target.id;
            setSalonDetails({
              id: target.id,
              name: target.name,
              area: target.area || target.address || target.city || '',
              wait: target.currentWaitMinutes || 0,
            });
          }
        } catch (salonErr) {
          console.warn("Salon fetch notice:", salonErr);
        }
      }

      if (currentSalonId) {
        customerService.getLiveQueueBoard(currentSalonId).then((board: any) => {
          if (board) {
            console.log("🎫 [BOOKING] Loaded live queue board:", board);
            setLiveQueueBoard(board);
          }
        }).catch(() => {});
      }

      const [typesData, stylesData, staffData] = await Promise.allSettled([
        styleService.getStyleTypes(),
        styleService.getAllSpecificStyles(),
        staffService.getStaffBySalon(currentSalonId),
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

      if (staffData.status === 'fulfilled' && staffData.value.length > 0) {
        console.log(`✅ [BOOKING] Loaded ${staffData.value.length} live staff:`, staffData.value);
        setStaffMembers(staffData.value);
      }
    } catch (err) {
      console.warn("⚠️ [BOOKING] Network fetch notice:", err);
    } finally {
      setIsLoadingStyles(false);
      setIsLoadingStaff(false);
    }
  };

  useEffect(() => {
    fetchRealTimeData();
  }, [salonDetails.id]);

  // Active Category/Type
  const activeStyleType = useMemo(() => {
    return styleTypes.find(t => t.id === selectedStyleTypeId) || styleTypes[0];
  }, [styleTypes, selectedStyleTypeId]);

  // Specific Styles filtered by category and gender
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

  // Active Specific Style
  const activeSpecificStyle = useMemo(() => {
    return specificStyles.find(s => s.id === selectedSpecificStyleId) || filteredSpecificStyles[0] || specificStyles[0];
  }, [specificStyles, selectedSpecificStyleId, filteredSpecificStyles]);

  // Active Staff
  const activeStaff = useMemo(() => {
    if (selectedStaffId === 'any') return null;
    return staffMembers.find(st => st.id === selectedStaffId) || null;
  }, [staffMembers, selectedStaffId]);

  // Computed Token Preview Details from Live Backend Queue
  const previewTokenNumber = useMemo(() => {
    if (liveQueueBoard?.nextAvailableTokenNumber && liveQueueBoard.nextAvailableTokenNumber > 0) {
      return liveQueueBoard.nextAvailableTokenNumber;
    }
    return Math.max(1, Math.floor((salonDetails.wait || 0) / 10) + 1);
  }, [liveQueueBoard, salonDetails.wait]);

  const previewGuestsAhead = useMemo(() => {
    if (bookingMode === 'SCHEDULED') return 0;
    if (typeof liveQueueBoard?.totalWaiting === 'number') {
      return liveQueueBoard.totalWaiting;
    }
    return Math.max(0, previewTokenNumber - 1);
  }, [bookingMode, liveQueueBoard, previewTokenNumber]);

  const ongoingTokenNumber = useMemo(() => {
    if (liveQueueBoard?.currentServingTokenNumber && liveQueueBoard.currentServingTokenNumber > 0) {
      return liveQueueBoard.currentServingTokenNumber;
    }
    return Math.max(1, previewTokenNumber - previewGuestsAhead);
  }, [liveQueueBoard, previewTokenNumber, previewGuestsAhead]);

  const previewEstimatedWait = useMemo(() => {
    if (bookingMode === 'SCHEDULED') return 0;
    if (typeof liveQueueBoard?.totalWaiting === 'number') {
      return Math.max(5, liveQueueBoard.totalWaiting * 15);
    }
    return salonDetails.wait || 15;
  }, [bookingMode, liveQueueBoard, salonDetails.wait]);

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#10B981', '#6366F1', '#EC4899'],
      });
    } catch {}
  };

  const handleConfirmBookingAndPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const effectiveCustomerName = user?.name || guestName.trim() || 'Guest Customer';
    const effectiveCustomerPhone = user?.phone || guestPhone.trim() || '';

    console.log("🚀 [BOOKING FLOW] Confirming booking with Spring Boot backend APIs:", {
      salonId: salonDetails.id,
      salonName: salonDetails.name,
      styleType: activeStyleType?.name,
      specificStyle: activeSpecificStyle?.name,
      price: activeSpecificStyle?.price,
      staff: activeStaff ? activeStaff.name : 'First Available',
      bookingMode,
      paymentMethod,
    });

    if (effectiveCustomerPhone && typeof window !== 'undefined') {
      localStorage.setItem('salonflow_customer_phone', effectiveCustomerPhone);
    }

    let targetSalonId = salonDetails.id;
    let targetSalonName = salonDetails.name || 'Salon';
    if (!targetSalonId) {
      try {
        const liveSalons = await salonService.getSalons();
        if (liveSalons && liveSalons.length > 0) {
          targetSalonId = liveSalons[0].id;
          targetSalonName = liveSalons[0].name;
        }
      } catch {}
    }

    try {
      // 1. Join Queue -> POST /api/queue/join
      const token = await joinLiveQueue(
        activeSpecificStyle?.id || '',
        selectedStaffId === 'any' ? undefined : selectedStaffId,
        selectedHairstyle?.id,
        targetSalonId
      );

      setConfirmedToken(token);

      // 2. Add Appointment -> POST /api/appointments
      await addAppointment({
        customerId: user ? user.id : undefined,
        customerName: effectiveCustomerName,
        customerPhone: effectiveCustomerPhone,
        salonId: targetSalonId,
        salonName: targetSalonName,
        salonAddress: salonDetails.area || '',
        salonArea: salonDetails.area || '',
        serviceId: activeSpecificStyle?.id,
        serviceName: activeSpecificStyle ? activeSpecificStyle.name : 'Haircut & Styling',
        servicePrice: activeSpecificStyle ? activeSpecificStyle.price : 0,
        serviceDuration: activeSpecificStyle ? activeSpecificStyle.durationMinutes : 30,
        staffId: activeStaff ? activeStaff.id : undefined,
        staffName: activeStaff ? activeStaff.name : 'First Available Barber',
        staffAvatar: activeStaff?.profileImage || undefined,
        appointmentDate: bookingMode === 'SCHEDULED' ? selectedDate : new Date().toISOString().split('T')[0],
        appointmentTime: selectedTime,
        status: 'CONFIRMED',
        source: 'ONLINE',
        bookingType: bookingMode,
        tokenNumber: token?.tokenNumber || previewTokenNumber,
        paymentMethod: paymentMethod === 'COUNTER' ? 'Pay at Salon Counter' : paymentMethod === 'UPI' ? 'UPI' : 'Credit/Debit Card',
        paymentStatus: paymentMethod === 'COUNTER' ? 'PENDING_AT_COUNTER' : 'PAID',
      });

      triggerCelebration();
      setIsSuccess(true);
    } catch (err) {
      console.error("❌ [BOOKING FLOW] Booking failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, title: 'Category' },
    { num: 2, title: 'Haircut & Style' },
    { num: 3, title: 'Barber' },
    { num: 4, title: 'Live Token Pass' },
    { num: 5, title: 'Payment & Confirm' },
  ];

  return (
    <div className="w-full min-h-screen bg-[#0d1017] text-zinc-100 pb-24">
      
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
            <span className="text-zinc-200 font-medium truncate max-w-[200px]">{salonDetails.name || 'Salon'}</span>
            <span>/</span>
            <span className="text-amber-400 font-semibold">Booking Flow</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={fetchRealTimeData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#181e2b] text-zinc-300 hover:text-white text-xs font-medium border border-[#2b354b] transition-colors cursor-pointer"
            title="Refresh style catalog and staff from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(isLoadingStyles || isLoadingStaff) ? 'animate-spin text-amber-400' : ''}`} />
            <span className="hidden sm:inline">Sync Real Data</span>
          </button>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Real-time Sync</span>
          </div>
        </div>
      </header>

      {/* Salon Identification Hero */}
      <section className="px-4 sm:px-8 lg:px-12 pt-6 pb-2">
        <div className="rounded-3xl bg-gradient-to-r from-[#171d2b] via-[#141926] to-[#0f1420] border border-[#273248] p-6 sm:p-7 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-400 text-[11px] font-bold uppercase tracking-wider border border-amber-500/30">
                  Concierge Booking Portal
                </span>
                <span className="px-3 py-0.5 rounded-full bg-[#202738] text-zinc-300 text-[11px] font-medium border border-[#2b354b] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-400" />
                  {salonDetails.area || 'Verified Studio'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {salonDetails.name || 'Salon'}
              </h1>
              <p className="text-xs text-zinc-400 max-w-xl">
                Select your style category, specific haircut, assigned barber, preview your digital token pass, and complete checkout.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-[#0d1017]/80 backdrop-blur-md p-3.5 rounded-2xl border border-[#232a3b]">
              <div className="text-right">
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Estimated Wait</span>
                <span className="text-xl font-black text-amber-400">~{salonDetails.wait || 0} mins</span>
              </div>
              <div className="w-px h-8 bg-[#2b354b]"></div>
              <div>
                <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Queue Status</span>
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Active Now
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-STEP WIZARD PROGRESS BAR */}
      <section className="px-4 sm:px-8 lg:px-12 py-4">
        <div className="p-3 sm:p-4 rounded-2xl bg-[#121622] border border-[#232a3b] shadow-md">
          <div className="grid grid-cols-5 gap-2 text-center">
            {stepsList.map((st) => {
              const isCurrent = currentStep === st.num;
              const isCompleted = currentStep > st.num;

              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    // Only allow navigating backward or to previously visited steps
                    if (st.num < currentStep) {
                      setCurrentStep(st.num as any);
                    }
                  }}
                  disabled={st.num > currentStep}
                  className={`py-2 px-1 sm:px-3 rounded-xl border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                      : isCompleted
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-[#181e2b]/50 text-zinc-500 border-[#2b354b]/40 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCurrent
                      ? 'bg-slate-950 text-amber-400'
                      : isCompleted
                      ? 'bg-amber-500 text-slate-950'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}>
                    {isCompleted ? '✓' : st.num}
                  </span>
                  <span className="truncate text-[10px] sm:text-xs font-semibold">{st.title}</span>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* SUCCESS PASS MODAL OVERLAY (POST-BOOKING) */}
      {isSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn">
          <div className="relative w-full max-w-lg rounded-3xl bg-[#121622] border-2 border-emerald-500/50 p-6 sm:p-8 shadow-2xl text-center space-y-6">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Booking Confirmed & Live Pass Issued
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-3">
                Token Pass #{confirmedToken?.tokenNumber || previewTokenNumber}
              </h2>
              <p className="text-xs text-zinc-300 mt-1">
                Your appointment and live queue pass have been officially recorded in the salon database!
              </p>
            </div>

            {/* Token Badge Card */}
            <div className="p-5 rounded-2xl bg-slate-950/80 border border-amber-500/30 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-[#232a3b] pb-2.5">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Confirmed Booking Pass</span>
                <span className="text-xs font-bold text-amber-400 font-mono">Token #{confirmedToken?.tokenNumber || previewTokenNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-[#121622] border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 block uppercase font-bold">Ongoing Token (Serving)</span>
                  <span className="font-extrabold text-white text-sm font-mono mt-0.5 block">#{ongoingTokenNumber}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-[#121622] border border-amber-500/30">
                  <span className="text-[10px] text-amber-400 block uppercase font-bold">Your Booked Token</span>
                  <span className="font-extrabold text-amber-400 text-sm font-mono mt-0.5 block">#{confirmedToken?.tokenNumber || previewTokenNumber}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Salon Studio</span>
                  <span className="font-semibold text-white truncate block">{salonDetails.name || 'Salon'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Haircut / Style</span>
                  <span className="font-semibold text-white truncate block">{activeSpecificStyle?.name}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Stylist</span>
                  <span className="font-semibold text-emerald-400 block">{activeStaff ? activeStaff.name : 'First Available Barber'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block uppercase">Estimated Seat Wait</span>
                  <span className="font-semibold text-amber-300 block">~{previewEstimatedWait} mins</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={() => router.push('/queue')}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02]"
              >
                <span>View Live Queue Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/appointments')}
                className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs border border-zinc-700/60 flex items-center justify-center gap-1.5"
              >
                <span>View in Appointments Tab</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <main className="px-4 sm:px-8 lg:px-12">
        <div className="max-w-4xl mx-auto">
          
          {/* ========================================================
              STEP 1: CHOOSE STYLE TYPE & CATEGORY
             ======================================================== */}
          {currentStep === 1 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#232a3b]">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Step 1 of 5</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Choose Style Type & Category</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Select your primary grooming focus area</p>
                </div>

                {/* Gender Filter Pills */}
                <div className="flex items-center gap-1 bg-[#181e2b] p-1 rounded-xl border border-[#2b354b] self-start sm:self-auto">
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

              {/* Style Type Cards */}
              {isLoadingStyles ? (
                <div className="p-12 text-center">
                  <div className="w-10 h-10 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-3" />
                  <p className="text-xs text-zinc-400">Loading live style categories from database...</p>
                </div>
              ) : styleTypes.length === 0 ? (
                <div className="p-8 text-center bg-[#181e2b] rounded-2xl border border-[#283247]">
                  <p className="text-xs text-zinc-400">No style types returned from database. Please sync again.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {styleTypes.map(st => {
                    const isSelected = selectedStyleTypeId === st.id;
                    const categoryIcon = 
                      st.code?.toUpperCase().includes('BEARD') ? '🧔' :
                      st.code?.toUpperCase().includes('SPA') ? '💆' :
                      st.code?.toUpperCase().includes('COLOR') ? '🎨' : '✂️';

                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStyleTypeId(st.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500 shadow-xl shadow-amber-500/10'
                            : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966] hover:bg-[#1a2130]'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-2xl">{categoryIcon}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-amber-400 border border-amber-500/20">
                              {st.code}
                            </span>
                          </div>
                          <h4 className="text-base font-bold text-white">{st.name}</h4>
                          <p className="text-xs text-zinc-400 line-clamp-2">
                            {st.description || 'Premium styling crafted for modern gentleman and couture precision.'}
                          </p>
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#263147] flex items-center justify-between text-xs">
                          <span className="text-[11px] text-zinc-400">Tap to select</span>
                          {isSelected && <span className="text-amber-400 font-bold flex items-center gap-1">Selected ✓</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 flex items-center justify-end border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedStyleTypeId}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                >
                  <span>Next: Choose Specific Style</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================
              STEP 2: CHOOSE SPECIFIC HAIRCUT / STYLE
             ======================================================== */}
          {currentStep === 2 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#232a3b]">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Step 2 of 5</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">
                    Choose Specific Haircut / Style ({filteredSpecificStyles.length})
                  </h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Category: <strong className="text-white">{activeStyleType?.name}</strong></p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 self-start sm:self-auto"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Category</span>
                </button>
              </div>

              {filteredSpecificStyles.length === 0 ? (
                <div className="p-12 text-center bg-[#181e2b] rounded-2xl border border-[#283247] space-y-2">
                  <p className="text-sm font-semibold text-white">No Specific Styles In This Category Yet</p>
                  <p className="text-xs text-zinc-400">Try changing the category or gender filter to view available cuts.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSpecificStyles.map(style => {
                    const isSelected = selectedSpecificStyleId === style.id;

                    return (
                      <div
                        key={style.id}
                        onClick={() => setSelectedSpecificStyleId(style.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500 shadow-xl shadow-amber-500/10'
                            : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966] hover:bg-[#1a2130]'
                        }`}
                      >
                        <div className="space-y-3">
                          {style.imageUrl && (
                            <img
                              src={style.imageUrl}
                              alt={style.name}
                              className="w-full h-32 object-cover rounded-xl border border-[#2b354b]"
                            />
                          )}
                          <div>
                            <h4 className="text-base font-bold text-white leading-snug">{style.name}</h4>
                            <p className="text-xs text-zinc-400 line-clamp-2 mt-1">
                              {style.description || 'Precision haircut crafted by master stylists.'}
                            </p>
                          </div>

                          {(style.suitableFaceShapes || style.suitableHairTypes) && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {style.suitableFaceShapes && (
                                <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[10px] text-zinc-300 font-medium">
                                  Face: {style.suitableFaceShapes}
                                </span>
                              )}
                              {style.suitableHairTypes && (
                                <span className="px-2 py-0.5 rounded bg-[#222a3d] text-[10px] text-zinc-300 font-medium">
                                  Hair: {style.suitableHairTypes}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-[#263147] flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-zinc-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-400" />
                            {style.durationMinutes}m duration
                          </span>
                          <span className="text-base font-extrabold text-white">
                            ₹{style.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 flex items-center justify-between border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-[#181e2b] hover:bg-[#222b3d] text-zinc-300 text-xs font-semibold border border-[#2b354b] flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedSpecificStyleId && filteredSpecificStyles.length > 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Next: Select Barber</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================
              STEP 3: SELECT BARBER / STYLIST
             ======================================================== */}
          {currentStep === 3 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-6 animate-fadeIn">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#232a3b]">
                <div>
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Step 3 of 5</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Choose Barber & Schedule</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">Assign your preferred stylist or select fastest chair</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingMode('WALK_IN')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bookingMode === 'WALK_IN'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                        : 'bg-[#181e2b] text-zinc-400 border border-[#2b354b]'
                    }`}
                  >
                    ⚡ Instant Walk-In
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode('SCHEDULED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      bookingMode === 'SCHEDULED'
                        ? 'bg-amber-500 text-slate-950 font-extrabold shadow-md'
                        : 'bg-[#181e2b] text-zinc-400 border border-[#2b354b]'
                    }`}
                  >
                    📅 Schedule Later
                  </button>
                </div>
              </div>

              {/* Barbers Roster */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
                  Available Salon Barbers
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* First Available Option */}
                  <div
                    onClick={() => setSelectedStaffId('any')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                      selectedStaffId === 'any'
                        ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500 shadow-lg'
                        : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966]'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-xl flex-shrink-0">
                      ⚡
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-white">First Available Barber</h5>
                      <p className="text-[11px] text-emerald-400 font-semibold">Fastest Chair</p>
                      <span className="text-[10px] text-zinc-400 mt-0.5 block">Next barber who finishes</span>
                    </div>
                  </div>

                  {/* Real Staff Members */}
                  {staffMembers.map(st => {
                    const isSelected = selectedStaffId === st.id;
                    const statusColor = 
                      st.status === 'AVAILABLE' ? 'text-emerald-400' :
                      st.status === 'BUSY' ? 'text-amber-400' :
                      st.status === 'BREAK' ? 'text-orange-400' : 'text-zinc-500';
                    const statusDot = 
                      st.status === 'AVAILABLE' ? 'bg-emerald-400' :
                      st.status === 'BUSY' ? 'bg-amber-400' :
                      st.status === 'BREAK' ? 'bg-orange-400' : 'bg-zinc-500';

                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStaffId(st.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'bg-amber-500/15 border-amber-500 ring-2 ring-amber-500 shadow-lg'
                            : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966]'
                        }`}
                      >
                        {st.profileImage ? (
                          <img
                            src={st.profileImage}
                            alt={st.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-[#2b354b] flex-shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-sm flex-shrink-0">
                            {st.name ? st.name.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-bold text-white truncate">{st.name}</h5>
                          <p className="text-xs text-zinc-400 truncate">{st.specialization || 'Hair Stylist'}</p>
                          <div className={`text-[10px] font-semibold flex items-center gap-1.5 mt-1 ${statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                            <span>{st.status || 'AVAILABLE'}</span>
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
                <div className="space-y-4 pt-4 border-t border-[#263147] animate-fadeIn">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Pick Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-[#181e2b] border border-[#2b354b] text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-zinc-300 block mb-1.5">Selected Time Slot</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {TIME_SLOTS.map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              selectedTime === t
                                ? 'bg-amber-500 text-slate-950 font-bold border-amber-400'
                                : 'bg-[#181e2b] text-zinc-400 border-[#283247] hover:text-white'
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 flex items-center justify-between border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-[#181e2b] hover:bg-[#222b3d] text-zinc-300 text-xs font-semibold border border-[#2b354b] flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Next: Preview Live Token Pass</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================
              STEP 4: LIVE TOKEN SCREEN & QUEUE PASS PREVIEW
             ======================================================== */}
          {currentStep === 4 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-6 animate-fadeIn">
              
              <div className="pb-4 border-b border-[#232a3b]">
                <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Step 4 of 5</span>
                <h2 className="text-xl sm:text-2xl font-bold text-white">Your Live Queue Token Screen</h2>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Review your digital queue pass and estimated chair time before checkout
                </p>
              </div>

              {/* Gold Visual Token Card */}
              <div className="rounded-3xl bg-gradient-to-br from-[#1a2130] via-[#121622] to-slate-950 p-6 sm:p-8 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden space-y-6">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-amber-500/20">
                  <div className="space-y-1 text-center sm:text-left">
                    <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      LIVE DIGITAL PASS PREVIEW
                    </span>
                    <h3 className="text-2xl font-extrabold text-white mt-2">{activeSpecificStyle?.name}</h3>
                    <p className="text-xs text-zinc-400">
                      Salon: <strong className="text-white">{salonDetails.name || 'Salon'}</strong> • {salonDetails.area || 'Verified Studio'}
                    </p>
                    <p className="text-xs text-zinc-400">
                      Barber: <strong className="text-emerald-400">{activeStaff ? activeStaff.name : 'First Available Barber'}</strong>
                    </p>
                  </div>

                  {/* Next Available Token Badge */}
                  <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-950 border-2 border-amber-500/50 min-w-[170px] shadow-lg shadow-amber-500/20 text-center">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-extrabold">NEXT AVAILABLE TOKEN</span>
                    <span className="text-4xl font-extrabold text-white tracking-tight mt-1 font-mono">
                      #{previewTokenNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                      Will Be Issued To You
                    </span>
                  </div>
                </div>

                {/* Grid Metrics with explicit clear naming */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold block">Ongoing Token</span>
                    <span className="text-2xl font-extrabold text-white font-mono mt-0.5 block">
                      #{ongoingTokenNumber}
                    </span>
                    <span className="text-[11px] text-emerald-300">Currently in chair</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-amber-500/40">
                    <span className="text-[10px] text-amber-400 uppercase tracking-wider font-bold block">Next Available Token</span>
                    <span className="text-2xl font-extrabold text-amber-400 font-mono mt-0.5 block">
                      #{previewTokenNumber}
                    </span>
                    <span className="text-[11px] text-amber-200">Your pass upon booking</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-[#232a3b]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Estimated Wait</span>
                    <span className="text-2xl font-extrabold text-white font-mono mt-0.5 block">
                      ~{previewEstimatedWait}
                    </span>
                    <span className="text-[11px] text-zinc-400">{previewGuestsAhead} waiting ahead</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-950/70 border border-[#232a3b]">
                    <span className="text-[10px] text-zinc-400 uppercase tracking-wider block">Station Assigned</span>
                    <span className="text-lg font-bold text-white mt-1 block">Station #1</span>
                    <span className="text-[11px] text-zinc-400">Front Chair</span>
                  </div>
                </div>

                {/* QR Check-In Instruction */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-white text-slate-950 shadow">
                      <QrCode className="w-10 h-10" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">Digital Check-In QR</p>
                      <p className="text-[11px] text-zinc-400">Will be activated immediately upon checkout</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Pass</span>
                  </span>
                </div>

              </div>

              {/* Navigation */}
              <div className="pt-4 flex items-center justify-between border-t border-[#232a3b]">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-[#181e2b] hover:bg-[#222b3d] text-zinc-300 text-xs font-semibold border border-[#2b354b] flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
                >
                  <span>Next: Payment Summary & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {/* ========================================================
              STEP 5: FINAL PAYMENT SUMMARY & PAY NOW
             ======================================================== */}
          {currentStep === 5 && (
            <form onSubmit={handleConfirmBookingAndPay} className="space-y-6 animate-fadeIn">
              
              <div className="p-6 sm:p-8 rounded-3xl bg-[#121622] border border-[#232a3b] shadow-xl space-y-6">
                
                <div className="pb-4 border-b border-[#232a3b]">
                  <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Step 5 of 5</span>
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Payment Summary & Checkout</h2>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    Review your order and select your payment method
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Guest/Customer Details + Payment Method */}
                  <div className="space-y-5">
                    
                    {/* Customer Info */}
                    <div className="p-4 rounded-2xl bg-[#181e2b] border border-[#283247] space-y-3">
                      <span className="text-xs font-bold text-white uppercase tracking-wider block">Customer Details</span>
                      {user ? (
                        <div className="text-xs space-y-1">
                          <p className="text-zinc-200">Logged in as: <strong>{user.name}</strong></p>
                          <p className="text-zinc-400">Phone: {user.phone || 'Saved on file'}</p>
                          <p className="text-zinc-400">Email: {user.email}</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Your Full Name</label>
                            <input
                              type="text"
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              placeholder="e.g. Rahul Sharma"
                              required
                              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-[#2b354b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-zinc-400 block mb-1">Mobile Number (for SMS & WhatsApp Pass)</label>
                            <input
                              type="tel"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value)}
                              placeholder="e.g. 9876543210"
                              required
                              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-[#2b354b] text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider block">
                        Choose Payment Method
                      </label>

                      <div className="space-y-2">
                        {[
                          { id: 'COUNTER', label: 'Pay at Salon Counter', desc: 'Pay with cash, UPI or card when seated', icon: Banknote },
                          { id: 'UPI', label: 'Instant UPI Payment', desc: 'Google Pay, PhonePe, Paytm QR', icon: Smartphone },
                          { id: 'CARD', label: 'Credit or Debit Card', desc: 'Visa, Mastercard, RuPay', icon: CreditCard },
                        ].map((m) => {
                          const isSelected = paymentMethod === m.id;
                          const IconComp = m.icon;

                          return (
                            <div
                              key={m.id}
                              onClick={() => setPaymentMethod(m.id as any)}
                              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-amber-500/15 border-amber-500 ring-1 ring-amber-500 shadow-md'
                                  : 'bg-[#181e2b]/80 border-[#283247] hover:border-[#3b4966]'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                  isSelected ? 'bg-amber-500 text-slate-950' : 'bg-slate-950 text-zinc-400'
                                }`}>
                                  <IconComp className="w-5 h-5" />
                                </div>
                                <div>
                                  <h6 className="text-xs font-bold text-white">{m.label}</h6>
                                  <p className="text-[11px] text-zinc-400">{m.desc}</p>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-amber-400 bg-amber-400' : 'border-zinc-600'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Itemized Receipt Summary */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-[#283247] flex flex-col justify-between space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-[#232a3b] pb-3">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Order Receipt</span>
                        <div className="text-right">
                          <span className="text-[10px] text-zinc-400 block uppercase font-medium">Next Available Token</span>
                          <span className="text-xs text-amber-400 font-mono font-bold">#{previewTokenNumber}</span>
                        </div>
                      </div>

                      <div className="space-y-2 text-xs">
                        <div className="flex items-center justify-between text-zinc-300">
                          <span>Salon Studio:</span>
                          <strong className="text-white">{salonDetails.name || 'Salon'}</strong>
                        </div>
                        <div className="flex items-center justify-between text-zinc-300">
                          <span>Ongoing Token (In Chair):</span>
                          <strong className="text-emerald-400 font-mono">Token #{ongoingTokenNumber}</strong>
                        </div>
                        <div className="flex items-center justify-between text-zinc-300">
                          <span>Your Next Available Token:</span>
                          <strong className="text-amber-400 font-mono">Token #{previewTokenNumber}</strong>
                        </div>
                        <div className="flex items-center justify-between text-zinc-300">
                          <span>Haircut Style:</span>
                          <strong className="text-white">{activeSpecificStyle?.name}</strong>
                        </div>
                        <div className="flex items-center justify-between text-zinc-300">
                          <span>Assigned Stylist:</span>
                          <strong className="text-emerald-400">{activeStaff ? activeStaff.name : 'First Available'}</strong>
                        </div>
                        <div className="flex items-center justify-between text-zinc-300">
                          <span>Booking Type:</span>
                          <span className="text-zinc-200">{bookingMode === 'WALK_IN' ? 'Instant Live Queue' : `Scheduled for ${selectedDate}`}</span>
                        </div>
                      </div>

                      <div className="border-t border-[#232a3b] pt-3 space-y-1.5 text-xs">
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Service Charge</span>
                          <span className="text-white font-mono">₹{activeSpecificStyle?.price || 0}.00</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>Platform & Convenience Fee</span>
                          <span className="text-emerald-400 font-mono">FREE (₹0.00)</span>
                        </div>
                        <div className="flex items-center justify-between text-zinc-400">
                          <span>GST & Taxes</span>
                          <span className="text-zinc-300 font-mono">₹0.00</span>
                        </div>
                      </div>

                      <div className="border-t border-amber-500/30 pt-3 flex items-center justify-between">
                        <span className="text-sm font-bold text-white uppercase">Total Amount</span>
                        <span className="text-2xl font-black text-amber-400 font-mono">
                          ₹{activeSpecificStyle?.price || 0}.00
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 text-[11px] text-amber-200 leading-relaxed flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      <span>Zero cancellation fees before seating. Official verified appointment ticket.</span>
                    </div>

                  </div>

                </div>

                {/* Form Footer Action */}
                <div className="pt-4 flex items-center justify-between border-t border-[#232a3b]">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-[#181e2b] hover:bg-[#222b3d] text-zinc-300 text-xs font-semibold border border-[#2b354b] flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Token Screen</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-transform hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isSubmitting ? 'Confirming Booking...' : 'Book & Pay Now'}</span>
                  </button>
                </div>

              </div>

            </form>
          )}

        </div>
      </main>

    </div>
  );
}

export default function FullPageBooking() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0d1017] flex items-center justify-center text-zinc-400 text-xs">
        Loading booking concierge...
      </div>
    }>
      <FullPageBookingContent />
    </Suspense>
  );
}
