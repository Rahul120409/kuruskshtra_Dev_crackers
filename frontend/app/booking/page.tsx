'use client';

import React, { useState, useEffect, useMemo, useRef, Suspense } from 'react';
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
  ChevronRight,
  Palette,
  Heart
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCustomer } from '../../context/CustomerContext';
import { ThemeToggle } from '../../components/ThemeToggle';
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
import { queueWebSocket, LiveQueueBoardData } from '../../services/websocketService';
import { QueueToken } from '../../types';

function FullPageBookingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, selectedHairstyle, joinLiveQueue, addAppointment, isLoggedIn } = useCustomer();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('salonflow_auth_user');
      if (!savedUser && !isLoggedIn) {
        const fullUrl = `/booking?${searchParams.toString()}`;
        router.push(`/login?redirect=${encodeURIComponent(fullUrl)}`);
      }
    }
  }, [isLoggedIn, router, searchParams]);

  const [salonDetails, setSalonDetails] = useState<{ id: string; name: string; area: string; wait: number }>({
    id: searchParams.get('salonId') || '',
    name: searchParams.get('salonName') || '',
    area: searchParams.get('area') || searchParams.get('city') || '',
    wait: Number(searchParams.get('wait')) || 0,
  });

  useEffect(() => {
    const sId = searchParams.get('salonId');
    const sName = searchParams.get('salonName');
    const sArea = searchParams.get('area') || searchParams.get('city');
    const sWait = searchParams.get('wait');
    if (sId) {
      setSalonDetails({
        id: sId,
        name: sName || '',
        area: sArea || '',
        wait: Number(sWait) || 0,
      });
    }
  }, [searchParams]);

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
  const [liveQueueBoard, setLiveQueueBoard] = useState<LiveQueueBoardData | null>(null);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const hasLoadedDataRef = useRef(false);
  const lastLoadedSalonIdRef = useRef<string>('');

  useEffect(() => {
    if (user?.name && !guestName) setGuestName(user.name);
    if (user?.phone && !guestPhone) setGuestPhone(user.phone);
  }, [user]);

  // Track live WebSocket STOMP connection status
  useEffect(() => {
    const unsubStatus = queueWebSocket.onStatusChange((connected) => {
      setIsWsConnected(connected);
    });
    return () => {
      unsubStatus();
    };
  }, []);

  // Fetch real-time style types, specific styles, and staff from backend API (runs once on mount)
  const fetchRealTimeData = async () => {
    if (hasLoadedDataRef.current) return;
    hasLoadedDataRef.current = true;

    setIsLoadingStyles(true);
    setIsLoadingStaff(true);
    console.log("💈 [BOOKING] Initial load of Style Types, Specific Styles, and Salon Staff...");
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

      const [typesData, stylesData, staffData] = await Promise.allSettled([
        styleService.getStyleTypes(),
        styleService.getAllSpecificStyles(),
        staffService.getStaffBySalon(currentSalonId),
      ]);

      if (typesData.status === 'fulfilled' && typesData.value.length > 0) {
        setStyleTypes(typesData.value);
        if (!typesData.value.some(t => t.id === selectedStyleTypeId)) {
          setSelectedStyleTypeId(typesData.value[0].id);
        }
      }

      if (stylesData.status === 'fulfilled' && stylesData.value.length > 0) {
        setSpecificStyles(stylesData.value);
        if (!stylesData.value.some(s => s.id === selectedSpecificStyleId)) {
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

  // Real-time WebSocket listener for Live Queue Board (pure WebSocket events, zero polling)
  useEffect(() => {
    const sId = salonDetails.id;
    if (!sId) return;

    // Load initial queue board snapshot ONCE for this specific salon ID
    if (lastLoadedSalonIdRef.current !== sId) {
      lastLoadedSalonIdRef.current = sId;
      customerService.getLiveQueueBoard(sId).then((board: any) => {
        if (board) {
          console.log("🎫 [BOOKING] Live queue snapshot loaded for salon:", sId, board);
          setLiveQueueBoard(board);
        }
      }).catch((e) => {
        console.warn("Notice: could not load initial queue board snapshot:", e);
      });
    }

    // 1. WebSocket topic subscription for this salon (/topic/salon/{id}/queue)
    const unsubSalon = queueWebSocket.subscribeToSalon(sId, (board) => {
      if (board) {
        console.log('⚡ [BOOKING WS] Live queue update received for salon:', board);
        setLiveQueueBoard(board);
      }
    });

    // 2. Global topic subscription fallback (/topic/queue/live)
    const unsubGlobal = queueWebSocket.subscribeToGlobal((board) => {
      if (board && (!board.salonId || board.salonId.toLowerCase() === sId.toLowerCase())) {
        console.log('⚡ [BOOKING WS] Global queue update received for salon:', board);
        setLiveQueueBoard(board);
      }
    });

    return () => {
      unsubSalon();
      unsubGlobal();
    };
  }, [salonDetails.id]);

  // Manual on-demand sync & WebSocket reconnection for user verification
  const handleManualSyncQueue = async () => {
    if (!salonDetails.id || isSyncing) return;
    setIsSyncing(true);
    try {
      const board = await customerService.getLiveQueueBoard(salonDetails.id);
      if (board) {
        setLiveQueueBoard(board);
      }
      queueWebSocket.reconnect();
    } catch (e) {
      console.warn('Manual sync notice:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

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

  // Determine if there is actually a token currently occupying or called to a chair
  const hasOngoingChair = useMemo(() => {
    if (liveQueueBoard?.currentServingTokenNumber && liveQueueBoard.currentServingTokenNumber > 0) {
      return true;
    }
    if (liveQueueBoard?.lastCalledTokenNumber && liveQueueBoard.lastCalledTokenNumber > 0) {
      return true;
    }
    if (Array.isArray(liveQueueBoard?.activeQueue) && liveQueueBoard.activeQueue.some((t: any) => t.status === 'IN_SERVICE' || t.status === 'CALLED')) {
      return true;
    }
    return false;
  }, [liveQueueBoard]);

  const ongoingTokenNumber = useMemo(() => {
    // 1. Direct serving token from backend
    if (liveQueueBoard?.currentServingTokenNumber && liveQueueBoard.currentServingTokenNumber > 0) {
      return liveQueueBoard.currentServingTokenNumber;
    }
    // 2. Last called token from backend
    if (liveQueueBoard?.lastCalledTokenNumber && liveQueueBoard.lastCalledTokenNumber > 0) {
      return liveQueueBoard.lastCalledTokenNumber;
    }
    // 3. From activeQueue array
    if (Array.isArray(liveQueueBoard?.activeQueue)) {
      const active = liveQueueBoard.activeQueue.find((t: any) => t.status === 'IN_SERVICE' || t.status === 'CALLED');
      if (active?.tokenNumber) return active.tokenNumber;
    }
    return null;
  }, [liveQueueBoard]);

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
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#080a0f] text-slate-900 dark:text-white transition-colors duration-200 pb-24 relative overflow-hidden">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/85 dark:bg-[#0c0e16]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-8 py-3 flex items-center justify-between transition-colors duration-200 shadow-xs">
        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/home"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Return to Salons</span>
            <span className="xs:hidden">Back</span>
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>/</span>
            <span className="text-slate-800 dark:text-slate-200 font-bold truncate max-w-[180px]">{salonDetails.name || 'Salon'}</span>
            <span>/</span>
            <span className="text-amber-600 dark:text-amber-400 font-semibold">Booking Concierge</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={fetchRealTimeData}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-colors cursor-pointer"
            title="Refresh style catalog and staff from backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${(isLoadingStyles || isLoadingStaff) ? 'animate-spin text-amber-500' : ''}`} />
            <span className="hidden sm:inline">Sync Real Data</span>
          </button>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold border border-emerald-500/30">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="hidden xs:inline">Live Telemetry</span>
          </div>
          <div className="p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Salon Identification Hero */}
      <section className="px-4 sm:px-8 lg:px-12 pt-6 pb-2 max-w-5xl mx-auto">
        <div className="rounded-3xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-slate-800/80 p-5 sm:p-7 shadow-lg dark:shadow-2xl relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 text-[10px] sm:text-[11px] font-bold uppercase tracking-wider border border-amber-500/30">
                  Concierge Booking Portal
                </span>
                <span className="px-3 py-0.5 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-[10px] sm:text-[11px] font-medium border border-slate-200 dark:border-slate-800 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-amber-500" />
                  {salonDetails.area || 'Verified Studio'}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                {salonDetails.name || 'Salon'}
              </h1>
              <p className="text-xs text-slate-600 dark:text-slate-400 max-w-xl">
                Select your style category, specific haircut, assigned barber, preview your digital token pass, and complete checkout.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-slate-50 dark:bg-[#0c0e16]/80 backdrop-blur-md p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="text-right">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Estimated Wait</span>
                <span className="text-xl font-black text-amber-500 dark:text-amber-400">~{salonDetails.wait || 0} mins</span>
              </div>
              <div className="w-px h-8 bg-slate-200 dark:bg-slate-800"></div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block font-semibold">Queue Status</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active Now
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5-STEP WIZARD PROGRESS BAR */}
      <section className="px-4 sm:px-8 lg:px-12 py-3 max-w-5xl mx-auto">
        <div className="p-2 sm:p-2.5 rounded-2xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
          <div className="grid grid-cols-5 gap-1.5 sm:gap-2 text-center">
            {stepsList.map((st) => {
              const isCurrent = currentStep === st.num;
              const isCompleted = currentStep > st.num;

              return (
                <button
                  key={st.num}
                  type="button"
                  onClick={() => {
                    if (st.num < currentStep) {
                      setCurrentStep(st.num as any);
                    }
                  }}
                  disabled={st.num > currentStep}
                  className={`py-2 px-1 sm:px-3 rounded-xl border text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 cursor-pointer ${
                    isCurrent
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white border-amber-500 shadow-md shadow-amber-500/20'
                      : isCompleted
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-slate-100 dark:bg-slate-900/60 text-slate-400 dark:text-slate-600 border-slate-200 dark:border-slate-800 cursor-not-allowed'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                    isCurrent
                      ? 'bg-white text-amber-600'
                      : isCompleted
                      ? 'bg-amber-500 text-white'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                  }`}>
                    {isCompleted ? <Check className="w-3 h-3 stroke-[3]" /> : st.num}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-3xl bg-white dark:bg-[#11141e] border-2 border-emerald-500/50 p-6 sm:p-8 shadow-2xl text-center space-y-6">
            
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30">
                Booking Confirmed & Live Pass Issued
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-3">
                Token Pass #{confirmedToken?.tokenNumber || previewTokenNumber}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                Your appointment and live queue pass have been officially recorded in the salon database!
              </p>
            </div>

            {/* Token Badge Card */}
            <div className="p-5 rounded-2xl bg-slate-950 border border-amber-500/40 text-left space-y-3 text-white shadow-xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Confirmed Booking Pass</span>
                <span className="text-xs font-bold text-amber-400 font-mono">Token #{confirmedToken?.tokenNumber || previewTokenNumber}</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-emerald-500/30">
                  <span className="text-[10px] text-emerald-400 block uppercase font-bold">Ongoing Token (Serving)</span>
                  <span className="font-extrabold text-white text-sm font-mono mt-0.5 block">
                    {hasOngoingChair && ongoingTokenNumber ? `#${ongoingTokenNumber}` : 'Chairs Open'}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-amber-500/30">
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
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/25 transition-transform hover:scale-[1.02] cursor-pointer"
              >
                <span>View Live Queue Status</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => router.push('/appointments')}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs border border-slate-200 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>View in Appointments Tab</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* STEP CONTENT CONTAINER */}
      <main className="px-4 sm:px-8 lg:px-12 mt-2">
        <div className="max-w-5xl mx-auto">
          
          {/* ========================================================
              STEP 1: CHOOSE STYLE TYPE & CATEGORY
             ======================================================== */}
          {currentStep === 1 && (
            <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200 transition-colors duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Step 1 of 5</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Choose Style Type & Category</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Select your primary grooming focus area</p>
                </div>

                {/* Gender Filter Pills */}
                <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
                  {(['ALL', 'MALE', 'FEMALE'] as const).map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGenderFilter(g)}
                      className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        genderFilter === g
                          ? 'bg-amber-500 text-white shadow-md font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                  <p className="text-xs text-slate-500 dark:text-slate-400">Loading live style categories from database...</p>
                </div>
              ) : styleTypes.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400">No style types returned from database. Please sync again.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {styleTypes.map(st => {
                    const isSelected = selectedStyleTypeId === st.id;
                    const c = st.code?.toUpperCase() || '';
                    const CategoryIcon = 
                      c.includes('BEARD') || c.includes('SHAVE') ? Sparkles :
                      c.includes('SPA') || c.includes('TREAT') || c.includes('FACIAL') ? Heart :
                      c.includes('COLOR') || c.includes('DYE') ? Palette : Scissors;

                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStyleTypeId(st.id)}
                        className={`p-5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/60 shadow-xl shadow-amber-500/10'
                            : 'bg-slate-50 dark:bg-[#151926] border-slate-200 dark:border-slate-800 hover:border-amber-500/40 hover:bg-slate-100 dark:hover:bg-[#181e2e]'
                        }`}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 shadow-xs">
                              <CategoryIcon className="w-5 h-5" />
                            </div>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200/80 dark:bg-black/40 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-bold">
                              {st.code}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white">{st.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                              {st.description || 'Premium styling crafted for modern precision.'}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 dark:text-slate-500">Tap to select</span>
                          {isSelected && (
                            <span className="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                              <span>Selected</span>
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 flex items-center justify-end border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedStyleTypeId}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
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
            <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200 transition-colors duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Step 2 of 5</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    Choose Specific Haircut / Style ({filteredSpecificStyles.length})
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Category: <strong className="text-slate-900 dark:text-white">{activeStyleType?.name}</strong></p>
                </div>
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs text-amber-600 dark:text-amber-400 hover:text-amber-500 font-semibold flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Change Category</span>
                </button>
              </div>

              {filteredSpecificStyles.length === 0 ? (
                <div className="p-12 text-center bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">No Specific Styles In This Category Yet</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Try changing the category or gender filter to view available cuts.</p>
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
                            ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/60 shadow-xl shadow-amber-500/10'
                            : 'bg-slate-50 dark:bg-[#151926] border-slate-200 dark:border-slate-800 hover:border-amber-500/40 hover:bg-slate-100 dark:hover:bg-[#181e2e]'
                        }`}
                      >
                        <div className="space-y-3">
                          {style.imageUrl && (
                            <img
                              src={style.imageUrl}
                              alt={style.name}
                              className="w-full h-32 object-cover rounded-xl border border-slate-200 dark:border-slate-800"
                            />
                          )}
                          <div>
                            <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">{style.name}</h4>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                              {style.description || 'Precision haircut crafted by master stylists.'}
                            </p>
                          </div>

                          {(style.suitableFaceShapes || style.suitableHairTypes) && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {style.suitableFaceShapes && (
                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-[#222a3d] text-[10px] text-slate-700 dark:text-zinc-300 font-medium">
                                  Face: {style.suitableFaceShapes}
                                </span>
                              )}
                              {style.suitableHairTypes && (
                                <span className="px-2 py-0.5 rounded bg-slate-200 dark:bg-[#222a3d] text-[10px] text-slate-700 dark:text-zinc-300 font-medium">
                                  Hair: {style.suitableHairTypes}
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                            {style.durationMinutes}m duration
                          </span>
                          <span className="text-base font-black text-amber-600 dark:text-amber-400">
                            ₹{style.price}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Navigation */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedSpecificStyleId && filteredSpecificStyles.length > 0}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
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
            <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200 transition-colors duration-200">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Step 3 of 5</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Choose Barber & Schedule</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Assign your preferred stylist or select fastest chair</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setBookingMode('WALK_IN')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      bookingMode === 'WALK_IN'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Instant Walk-In</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingMode('SCHEDULED')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      bookingMode === 'SCHEDULED'
                        ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-extrabold shadow-md'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Later</span>
                  </button>
                </div>
              </div>

              {/* Barbers Roster */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Available Salon Barbers
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {/* First Available Option */}
                  <div
                    onClick={() => setSelectedStaffId('any')}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                      selectedStaffId === 'any'
                        ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/60 shadow-lg'
                        : 'bg-slate-50 dark:bg-[#151926] border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                    }`}
                  >
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold text-xl shrink-0">
                      <Zap className="w-6 h-6 text-amber-500" />
                    </div>
                    <div>
                      <h5 className="text-sm font-bold text-slate-900 dark:text-white">First Available Barber</h5>
                      <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold">Fastest Chair</p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 block">Next barber who finishes</span>
                    </div>
                  </div>

                  {/* Real Staff Members */}
                  {staffMembers.map(st => {
                    const isSelected = selectedStaffId === st.id;
                    const statusColor = 
                      st.status === 'AVAILABLE' ? 'text-emerald-600 dark:text-emerald-400' :
                      st.status === 'BUSY' ? 'text-amber-600 dark:text-amber-400' :
                      st.status === 'BREAK' ? 'text-orange-500' : 'text-slate-400';
                    const statusDot = 
                      st.status === 'AVAILABLE' ? 'bg-emerald-500' :
                      st.status === 'BUSY' ? 'bg-amber-500' :
                      st.status === 'BREAK' ? 'bg-orange-500' : 'bg-slate-400';

                    return (
                      <div
                        key={st.id}
                        onClick={() => setSelectedStaffId(st.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-2 ring-amber-500/60 shadow-lg'
                            : 'bg-slate-50 dark:bg-[#151926] border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                        }`}
                      >
                        {st.profileImage ? (
                          <img
                            src={st.profileImage}
                            alt={st.name}
                            className="w-12 h-12 rounded-2xl object-cover border border-slate-200 dark:border-slate-800 shrink-0"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-600/30 text-amber-600 dark:text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-sm shrink-0">
                            {st.name ? st.name.slice(0, 2).toUpperCase() : 'ST'}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h5 className="text-sm font-bold text-slate-900 dark:text-white truncate">{st.name}</h5>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{st.specialization || 'Hair Stylist'}</p>
                          <div className={`text-[10px] font-semibold flex items-center gap-1.5 mt-1 ${statusColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></span>
                            <span>{st.status || 'AVAILABLE'}</span>
                            {st.experienceYears && (
                              <span className="text-slate-400 font-normal">• {st.experienceYears}y exp</span>
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
                <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Pick Date</label>
                      <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1.5">Selected Time Slot</label>
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-1.5">
                        {TIME_SLOTS.map(t => (
                          <button
                            key={t}
                            type="button"
                            onClick={() => setSelectedTime(t)}
                            className={`py-1.5 px-2 rounded-lg text-[11px] font-semibold border transition-all cursor-pointer ${
                              selectedTime === t
                                ? 'bg-amber-500 text-white font-bold border-amber-500 shadow-xs'
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white'
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
              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(4)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
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
            <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 animate-in fade-in duration-200 transition-colors duration-200">
              
              <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Step 4 of 5</span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Your Live Queue Token Screen</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Review your digital queue pass and estimated chair time before checkout
                </p>
              </div>

              {/* Theme Responsive Visual Token Card */}
              <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-[#121622] dark:to-slate-950 p-6 sm:p-8 border-2 border-amber-500/40 shadow-2xl relative overflow-hidden space-y-6 text-slate-900 dark:text-white transition-colors duration-200">
                <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 dark:bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-amber-500/20">
                  <div className="space-y-1 text-center sm:text-left">
                    <div className="flex items-center gap-2 justify-center sm:justify-start">
                      <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                        LIVE DIGITAL PASS PREVIEW
                      </span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono ${
                        isWsConnected 
                          ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                          : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
                        <span>{isWsConnected ? 'WebSocket Live' : 'Connecting to Live Queue...'}</span>
                      </span>
                      <button
                        type="button"
                        onClick={handleManualSyncQueue}
                        disabled={isSyncing}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white text-[10px] font-mono transition-all cursor-pointer disabled:opacity-50 shadow-xs"
                        title="Sync latest live queue state"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-500' : 'text-slate-400 dark:text-zinc-400'}`} />
                        <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
                      </button>
                    </div>
                    <h3 className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">{activeSpecificStyle?.name}</h3>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Salon: <strong className="text-slate-900 dark:text-white">{salonDetails.name || 'Salon'}</strong> • {salonDetails.area || 'Verified Studio'}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-zinc-400">
                      Barber: <strong className="text-emerald-600 dark:text-emerald-400">{activeStaff ? activeStaff.name : 'First Available Barber'}</strong>
                    </p>
                  </div>

                  {/* Next Available Token Badge */}
                  <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-950 border-2 border-amber-500/50 min-w-[170px] shadow-lg shadow-amber-500/15 text-center relative group">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      NEXT AVAILABLE TOKEN
                    </span>
                    <span className="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1 font-mono">
                      #{previewTokenNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full mt-1.5 bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase">
                      Will Be Issued To You
                    </span>
                  </div>
                </div>

                {/* Grid Metrics with explicit clear naming */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
                  <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-950/80 border border-emerald-500/30 dark:border-emerald-500/40">
                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold block">Ongoing Token</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                      {hasOngoingChair ? `#${ongoingTokenNumber}` : 'Chairs Open'}
                    </span>
                    <span className="text-[11px] text-emerald-800 dark:text-emerald-300">
                      {hasOngoingChair ? 'Currently in chair' : 'Ready for immediate seating'}
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-950/80 border border-amber-500/30 dark:border-amber-500/40">
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider font-bold block">Next Available Token</span>
                    <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400 font-mono mt-0.5 block">
                      #{previewTokenNumber}
                    </span>
                    <span className="text-[11px] text-amber-800 dark:text-amber-200">Your pass upon booking</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">Estimated Wait</span>
                    <span className="text-2xl font-extrabold text-slate-900 dark:text-white font-mono mt-0.5 block">
                      ~{previewEstimatedWait}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">{previewGuestsAhead} waiting ahead</span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">Station Assigned</span>
                    <span className="text-lg font-bold text-slate-900 dark:text-white mt-1 block">Station #1</span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">Front Chair</span>
                  </div>
                </div>

                {/* QR Check-In Instruction */}
                <div className="pt-2 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white text-slate-900 dark:text-slate-950 shadow border border-slate-200 dark:border-slate-800">
                      <QrCode className="w-9 h-9" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900 dark:text-white">Digital Check-In QR</p>
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400">Will be activated immediately upon checkout</p>
                    </div>
                  </div>
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verified Pass</span>
                  </span>
                </div>

              </div>

              {/* Navigation */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(5)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all hover:scale-[1.02] cursor-pointer"
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
            <form onSubmit={handleConfirmBookingAndPay} className="space-y-6 animate-in fade-in duration-200">
              
              <div className="p-5 sm:p-8 rounded-3xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-slate-800 shadow-xl space-y-6 transition-colors duration-200">
                
                <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Step 5 of 5</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">Payment Summary & Checkout</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Review your order and select your payment method
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Left Column: Guest/Customer Details + Payment Method */}
                  <div className="space-y-5">
                    
                    {/* Customer Info */}
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-[#151926] border border-slate-200 dark:border-slate-800 space-y-3">
                      <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider block">Customer Details</span>
                      {user ? (
                        <div className="text-xs space-y-1 text-slate-600 dark:text-slate-300">
                          <p>Logged in as: <strong className="text-slate-900 dark:text-white">{user.name}</strong></p>
                          <p className="text-slate-500 dark:text-slate-400">Phone: {user.phone || 'Saved on file'}</p>
                          <p className="text-slate-500 dark:text-slate-400">Email: {user.email}</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5">
                          <div>
                            <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Your Full Name</label>
                            <input
                              type="text"
                              value={guestName}
                              onChange={(e) => setGuestName(e.target.value)}
                              placeholder="e.g. Rahul Sharma"
                              required
                              className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] text-slate-600 dark:text-slate-400 block mb-1">Mobile Number (10 Digits)</label>
                            <input
                              type="tel"
                              value={guestPhone}
                              onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                              placeholder="e.g. 9876543210"
                              required
                              maxLength={10}
                              className="w-full py-2.5 px-3 rounded-xl bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 text-base sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-amber-500"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Payment Method Selector */}
                    <div className="space-y-2.5">
                      <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
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
                                  ? 'bg-amber-500/10 dark:bg-amber-500/15 border-amber-500 ring-1 ring-amber-500 shadow-md'
                                  : 'bg-slate-50 dark:bg-[#151926] border-slate-200 dark:border-slate-800 hover:border-amber-500/40'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                  isSelected ? 'bg-amber-500 text-white' : 'bg-slate-200 dark:bg-slate-900 text-slate-500 dark:text-slate-400'
                                }`}>
                                  <IconComp className="w-5 h-5" />
                                </div>
                                <div>
                                  <h6 className="text-xs font-bold text-slate-900 dark:text-white">{m.label}</h6>
                                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.desc}</p>
                                </div>
                              </div>
                              <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                                isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-400 dark:border-slate-600'
                              }`}>
                                {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>

                  {/* Right Column: Itemized Receipt Summary */}
                  <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 text-white flex flex-col justify-between space-y-4 shadow-xl">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
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
                          <strong className="text-emerald-400 font-mono">
                            {hasOngoingChair ? `Token #${ongoingTokenNumber}` : 'Chairs Open'}
                          </strong>
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

                      <div className="border-t border-slate-800 pt-3 space-y-1.5 text-xs">
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
                      <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Zero cancellation fees before seating. Official verified appointment ticket.</span>
                    </div>

                  </div>

                </div>

                {/* Form Footer Action */}
                <div className="pt-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setCurrentStep(4)}
                    className="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Token Screen</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-black text-sm flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-transform hover:scale-[1.02] disabled:opacity-50 cursor-pointer"
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
      <div className="min-h-screen bg-slate-50 dark:bg-[#080a0f] flex items-center justify-center text-slate-500 dark:text-slate-400 text-xs">
        Loading booking concierge...
      </div>
    }>
      <FullPageBookingContent />
    </Suspense>
  );
}
