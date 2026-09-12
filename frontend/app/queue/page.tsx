'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Clock, 
  Users, 
  Scissors, 
  Sparkles, 
  CheckCircle2, 
  QrCode, 
  AlertCircle, 
  FastForward, 
  RotateCcw, 
  ArrowRight,
  ArrowLeft,
  MapPin,
  Phone,
  ShieldCheck,
  RefreshCw,
  Store,
  ChevronRight,
  Zap,
  Star
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCustomer } from '../../context/CustomerContext';
import { queueWebSocket, LiveQueueBoardData } from '../../services/websocketService';
import { customerService } from '../../services/customerService';

export default function LiveQueuePage() {
  const router = useRouter();
  const { 
    activeToken, 
    advanceDemoQueue, 
    cancelActiveToken,
    isLoadingToken,
    isLoggedIn 
  } = useCustomer();

  // Authentication protection (DESIGN.md Section 6)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('salonflow_auth_user');
      if (!savedUser && !isLoggedIn) {
        router.push('/login?redirect=/queue');
      }
    }
  }, [isLoggedIn, router]);

  // Live WebSocket state
  const [liveBoard, setLiveBoard] = useState<LiveQueueBoardData | null>(null);
  const [isWsConnected, setIsWsConnected] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [showCancelModal, setShowCancelModal] = useState<boolean>(false);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Track live WebSocket status
  useEffect(() => {
    const unsub = queueWebSocket.onStatusChange((connected) => {
      setIsWsConnected(connected);
    });
    return () => unsub();
  }, []);

  // Subscribe to live queue updates for the active salon
  useEffect(() => {
    const salonId = activeToken?.salonId;
    if (!salonId) return;

    // Load initial snapshot once
    customerService.getLiveQueueBoard(salonId).then((data) => {
      if (data) setLiveBoard(data);
    }).catch(() => {});

    // 1. Topic subscription for this salon
    const unsubSalon = queueWebSocket.subscribeToSalon(salonId, (data) => {
      if (data) {
        console.log('⚡ [QUEUE WS] Live queue board update:', data);
        setLiveBoard(data);
      }
    });

    // 2. Fallback global topic
    const unsubGlobal = queueWebSocket.subscribeToGlobal((data) => {
      if (data && (!data.salonId || data.salonId.toLowerCase() === salonId.toLowerCase())) {
        console.log('⚡ [QUEUE WS] Global queue board update:', data);
        setLiveBoard(data);
      }
    });

    return () => {
      unsubSalon();
      unsubGlobal();
    };
  }, [activeToken?.salonId]);

  const handleManualSync = async () => {
    if (!activeToken?.salonId || isSyncing) return;
    setIsSyncing(true);
    try {
      const data = await customerService.getLiveQueueBoard(activeToken.salonId);
      if (data) setLiveBoard(data);
      queueWebSocket.reconnect();
    } catch (e) {
      console.warn('Manual sync notice:', e);
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  const handleStepAdvance = async () => {
    setIsAdvancing(true);
    await advanceDemoQueue();
    setIsAdvancing(false);
  };

  // Loading Screen (Quiet Luxury)
  if (isLoadingToken) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/90 dark:bg-[#11141e]/90 border border-slate-200 dark:border-slate-800 shadow-2xl text-center space-y-4 backdrop-blur-xl">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500 animate-spin">
            <RotateCcw className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">Connecting to Atelier Queue Concierge</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading your real-time token pass and live chair status...</p>
        </div>
      </div>
    );
  }

  // Empty State: No Active Token (DESIGN.md Section 4 & 5)
  if (!activeToken) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-white transition-colors duration-200 py-16 px-4 relative overflow-x-hidden flex items-center justify-center">
        {/* Ambient background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative max-w-md w-full p-8 rounded-3xl bg-white/95 dark:bg-[#11141e]/95 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl text-center space-y-6 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 dark:bg-amber-500/20 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-8 h-8" />
          </div>

          <div className="space-y-1.5">
            <span className="text-[10px] font-mono font-bold tracking-wider text-amber-600 dark:text-amber-400 uppercase bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
              No Active Live Pass
            </span>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-2">
              You Are Not in Any Queue
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
              Select a luxury salon to reserve your chair, get an instant digital token pass, and track your turn live.
            </p>
          </div>

          <div className="pt-2 space-y-3">
            <Link
              href="/home"
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Scissors className="w-4 h-4" />
              <span>Explore Salons & Join Live Queue</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              href="/ai-recommend"
              className="w-full py-3 px-6 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Hairstyle Consultation Match</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Active status flags
  const isLate = (activeToken as any).status === 'LATE' || (activeToken as any).status === 'ON_HOLD' || (activeToken as any).status === 'NO_SHOW';
  const isTurnApproaching = (activeToken.position === 1 || activeToken.position === 2) && activeToken.status === 'WAITING';
  const isTurnCalled = activeToken.status === 'CALLED';
  const isInService = activeToken.status === 'IN_SERVICE';
  const isCompleted = activeToken.status === 'COMPLETED';

  // Derived real-time queue numbers
  const liveServingToken = liveBoard?.currentServingTokenNumber || liveBoard?.lastCalledTokenNumber || null;
  const customersAhead = typeof activeToken.position === 'number' ? Math.max(0, activeToken.position - 1) : 0;
  const estimatedWaitDisplay = activeToken.estimatedWait || (liveBoard?.totalWaiting ? Math.max(5, liveBoard.totalWaiting * 15) : 15);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-white transition-colors duration-200 pb-24 relative overflow-x-hidden">
      
      {/* Ambient Luxury Glow (Haute Coiffure Atelier) */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <main className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
        
        {/* Top Header & Navigation Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-2">
          <div className="flex items-center gap-3">
            <Link
              href="/home"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition-all border border-slate-200 dark:border-slate-800 cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Salons</span>
            </Link>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <span className="hidden sm:inline">Concierge</span>
              <ChevronRight className="w-3.5 h-3.5 hidden sm:inline" />
              <span className="font-bold text-slate-900 dark:text-white">Live Queue Pass</span>
            </div>
          </div>

          {/* Real-time WebSocket Status Pill (DESIGN.md Section 4.4) */}
          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-mono ${
              isWsConnected 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400' 
                : 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
            }`}>
              <span className={`w-2 h-2 rounded-full ${isWsConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'}`} />
              <span className="font-bold">{isWsConnected ? 'WebSocket Live' : 'Connecting to Live Queue...'}</span>
            </span>

            <button
              type="button"
              onClick={handleManualSync}
              disabled={isSyncing}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-mono transition-all cursor-pointer disabled:opacity-50 shadow-xs"
              title="Sync latest live token count from salon"
            >
              <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-amber-500' : 'text-slate-400'}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          </div>
        </div>

        {/* ========================================================
            DYNAMIC REAL-TIME STATUS ALERTS (LLD Section 12)
           ======================================================== */}
        {isLate ? (
          <div className="rounded-3xl bg-amber-950/80 border-2 border-amber-500/60 p-5 text-amber-100 shadow-xl shadow-amber-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-500/30">
                <Clock className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">MARKED ON HOLD (Token #{activeToken.tokenNumber})</h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    Client Late
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  Your token was passed because you were not at the salon when called. Please notify the concierge upon arrival to resume priority seating!
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/home')}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 transition-all shadow cursor-pointer"
            >
              Contact Desk
            </button>
          </div>
        ) : isTurnCalled ? (
          <div className="rounded-3xl bg-rose-950/85 border-2 border-rose-500/80 p-5 text-rose-100 shadow-2xl shadow-rose-500/20 ring-2 ring-rose-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-rose-500/40 animate-pulse">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">YOUR CHAIR IS READY! (Token #{activeToken.tokenNumber})</h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-500 text-white">
                    Proceed Now
                  </span>
                </div>
                <p className="text-xs text-rose-200 leading-relaxed">
                  Please proceed directly to <strong>{activeToken.stationNumber ? `Station #${activeToken.stationNumber}` : 'your assigned styling chair'}</strong>. {activeToken.staffName ? <>Stylist <strong>{activeToken.staffName}</strong> is waiting for you.</> : 'Your stylist is ready.'}
                </p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-white text-rose-950 font-black text-xs uppercase tracking-wider shrink-0 shadow">
              Chair Ready
            </span>
          </div>
        ) : isTurnApproaching ? (
          <div className="rounded-3xl bg-amber-950/85 border-2 border-amber-500/70 p-5 text-amber-100 shadow-xl shadow-amber-500/20 ring-2 ring-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-amber-500/30">
                <Zap className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-extrabold text-white">
                    {activeToken.position === 1 ? "YOU'RE NEXT IN LINE!" : "2 TURNS AWAY!"}
                  </h3>
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-slate-950">
                    {activeToken.position === 1 ? 'Next Up' : 'Standby'}
                  </span>
                </div>
                <p className="text-xs text-amber-200/90 leading-relaxed">
                  {activeToken.position === 1 
                    ? "Only 1 customer ahead of you! Please head to the styling area or front reception."
                    : "Only 2 turns remaining. Please get ready and move toward the salon styling lounge."}
                </p>
              </div>
            </div>
            <span className="px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-xs font-bold shrink-0 uppercase">
              ~{estimatedWaitDisplay} mins wait
            </span>
          </div>
        ) : isInService ? (
          <div className="rounded-3xl bg-purple-950/85 border-2 border-purple-500/70 p-5 text-purple-100 shadow-xl shadow-purple-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center font-bold shrink-0 shadow-lg shadow-purple-500/30">
                <Scissors className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-white">Currently In Service (Token #{activeToken.tokenNumber})</h3>
                <p className="text-xs text-purple-200/90 leading-relaxed">
                  Your luxury grooming transformation is currently underway. Enjoy your atelier experience!
                </p>
              </div>
            </div>
            <span className="px-3.5 py-1.5 rounded-xl bg-purple-500/30 border border-purple-500/40 text-purple-200 text-xs font-bold uppercase">
              In Chair
            </span>
          </div>
        ) : isCompleted ? (
          <div className="rounded-3xl bg-emerald-950/85 border-2 border-emerald-500/70 p-5 text-emerald-100 shadow-xl shadow-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 backdrop-blur-xl">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold shrink-0 shadow-lg shadow-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <h3 className="text-base font-extrabold text-white">Service Completed!</h3>
                <p className="text-xs text-emerald-200/90 leading-relaxed">
                  Thank you for visiting {activeToken.salonName || 'our atelier'}. Please rate your stylist to complete your session.
                </p>
              </div>
            </div>
            <Link
              href="/feedback"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              <Star className="w-4 h-4 fill-slate-950" />
              <span>Rate Experience</span>
            </Link>
          </div>
        ) : null}

        {/* ========================================================
            MASTER HAUTE ATELIER PASS (Theme Responsive Digital Card)
           ======================================================== */}
        <div className="rounded-3xl bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:via-[#121622] dark:to-slate-950 border-2 border-amber-500/40 p-6 sm:p-9 shadow-2xl text-slate-900 dark:text-white relative overflow-hidden space-y-8 transition-colors duration-200">
          
          {/* Ambient Card Corner Glow */}
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Card Top Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-200 dark:border-amber-500/20 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono font-bold px-3 py-1 rounded-full bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30 uppercase tracking-wider">
                  OFFICIAL QUEUE PASS
                </span>
                <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-amber-500" />
                  <strong className="text-slate-900 dark:text-white">{activeToken.salonName || 'Luxury Atelier'}</strong>
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                {activeToken.serviceName || 'Signature Atelier Service'}
              </h1>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-zinc-400">
                <p>Stylist: <strong className="text-emerald-600 dark:text-emerald-400">{activeToken.staffName || 'First Available Master Barber'}</strong></p>
                <span>•</span>
                <p>Station: <strong className="text-amber-600 dark:text-amber-400">{activeToken.stationNumber ? `Station #${activeToken.stationNumber}` : 'Front Chair Lounge'}</strong></p>
              </div>
            </div>

            {/* Token Badge Crest */}
            <div className="flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-50 dark:bg-slate-950/90 border-2 border-amber-500/50 min-w-[160px] shadow-xl shadow-amber-500/15 text-center relative group">
              <span className="text-[10px] font-mono tracking-widest uppercase font-extrabold text-amber-600 dark:text-amber-400">YOUR PASS</span>
              <span className="text-5xl font-black text-slate-900 dark:text-white tracking-tight mt-1 font-mono">
                #{activeToken.tokenNumber}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-2 uppercase ${
                isTurnCalled 
                  ? 'bg-rose-500 text-white' 
                  : isTurnApproaching
                  ? 'bg-amber-500 text-slate-950'
                  : isInService
                  ? 'bg-purple-500 text-white'
                  : 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-500/30'
              }`}>
                {activeToken.status}
              </span>
            </div>
          </div>

          {/* Real-time 4-Column Metric Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
            
            {/* 1. Ongoing Token */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-slate-950/85 border border-emerald-500/30 dark:border-emerald-500/40 space-y-1 shadow-xs">
              <span className="text-[10px] text-emerald-700 dark:text-emerald-400 uppercase tracking-wider font-bold block">Ongoing Token</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono block">
                {liveServingToken ? `#${liveServingToken}` : 'Chairs Open'}
              </span>
              <span className="text-[11px] text-emerald-800 dark:text-emerald-300/80 block">
                {liveServingToken ? 'Currently in chair' : 'Ready for immediate seating'}
              </span>
            </div>

            {/* 2. Your Assigned Token */}
            <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-slate-950/85 border border-amber-500/30 dark:border-amber-500/40 space-y-1 shadow-xs">
              <span className="text-[10px] text-amber-700 dark:text-amber-400 uppercase tracking-wider font-bold block">Your Token</span>
              <span className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 font-mono block">
                #{activeToken.tokenNumber}
              </span>
              <span className="text-[11px] text-amber-800 dark:text-amber-200/80 block">
                Assigned to your session
              </span>
            </div>

            {/* 3. Queue Position */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">Queue Position</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono block">
                {activeToken.position === 1 ? 'Next' : `#${activeToken.position || 1}`}
              </span>
              <span className="text-[11px] text-slate-600 dark:text-zinc-400 block">
                {customersAhead > 0 ? `${customersAhead} guest${customersAhead > 1 ? 's' : ''} ahead` : 'You are next in line'}
              </span>
            </div>

            {/* 4. Estimated Wait */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 space-y-1 shadow-xs">
              <span className="text-[10px] text-slate-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">Estimated Wait</span>
              <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-mono block">
                ~{estimatedWaitDisplay} <span className="text-sm font-normal text-slate-500 dark:text-zinc-400">mins</span>
              </span>
              <span className="text-[11px] text-slate-600 dark:text-zinc-400 block">
                Live calculated queue time
              </span>
            </div>

          </div>

          {/* Queue State Machine Progress Timeline (DESIGN.md Section 4.4) */}
          <div className="space-y-3 pt-2 relative z-10">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">Queue Lifecycle Progression</span>
              <span className="font-mono text-amber-600 dark:text-amber-400 text-[11px] font-bold">
                Status: {activeToken.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { key: 'WAITING', num: '01', title: 'In Queue', desc: 'Pass Recorded' },
                { key: 'CALLED', num: '02', title: 'Chair Called', desc: 'Standby At Station' },
                { key: 'IN_SERVICE', num: '03', title: 'In Service', desc: 'Styling Session' },
                { key: 'COMPLETED', num: '04', title: 'Completed', desc: 'Session Done' },
              ].map((step, idx) => {
                const statusOrder: Record<string, number> = {
                  WAITING: 1,
                  CALLED: 2,
                  IN_SERVICE: 3,
                  COMPLETED: 4,
                };
                const currentWeight = statusOrder[activeToken.status] || 1;
                const stepWeight = idx + 1;
                const isPast = stepWeight < currentWeight;
                const isCurrent = stepWeight === currentWeight;

                return (
                  <div
                    key={step.key}
                    className={`p-3.5 rounded-2xl border transition-all relative overflow-hidden ${
                      isCurrent
                        ? 'bg-gradient-to-br from-amber-500 to-amber-600 text-slate-950 font-bold border-amber-400 shadow-xl shadow-amber-500/25'
                        : isPast
                        ? 'bg-emerald-50 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-500/30'
                        : 'bg-slate-50 dark:bg-slate-950/60 text-slate-400 dark:text-zinc-500 border-slate-200 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className={`text-[10px] font-mono font-black ${isCurrent ? 'text-slate-950' : 'text-slate-400 dark:text-zinc-500'}`}>
                        {step.num}
                      </span>
                      {isPast ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : isCurrent ? (
                        <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
                      ) : null}
                    </div>
                    <p className="text-xs font-black truncate">{step.title}</p>
                    <p className={`text-[10px] mt-0.5 truncate ${isCurrent ? 'text-slate-900 font-semibold' : 'text-slate-500 dark:text-zinc-400'}`}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Digital Check-In QR & Quick Controls */}
          <div className="pt-6 border-t border-slate-200 dark:border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="p-3 rounded-2xl bg-slate-100 dark:bg-white text-slate-900 dark:text-slate-950 shadow-md shrink-0 border border-slate-200 dark:border-slate-800">
                <QrCode className="w-12 h-12" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">Fast Desk Scanner QR</p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">Present this code upon arrival for instant priority seat confirmation.</p>
                <p className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1 font-bold">ID: {activeToken.tokenId}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
              <button
                type="button"
                onClick={() => setShowCancelModal(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/80 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-all cursor-pointer"
              >
                Cancel Token
              </button>

              <button
                type="button"
                onClick={handleStepAdvance}
                disabled={isAdvancing}
                className="px-4 py-2.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 dark:bg-amber-500/20 dark:hover:bg-amber-500/30 border border-amber-500/30 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
                title="Simulate queue lifecycle advance"
              >
                <FastForward className="w-3.5 h-3.5" />
                <span>{isAdvancing ? 'Advancing...' : 'Advance Queue (Demo)'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* AI Consultation Hairstyle Attached (if available) */}
        {activeToken.selectedHairstyleName && (
          <div className="p-5 rounded-3xl bg-white dark:bg-[#11141e] border border-slate-200 dark:border-slate-800 shadow-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-500 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold text-amber-600 dark:text-amber-400 tracking-wider">
                  Attached AI Style Consultation
                </span>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
                  {activeToken.selectedHairstyleName}
                </h4>
              </div>
            </div>
            <span className="text-xs font-mono text-slate-400 dark:text-slate-500">
              Style #{activeToken.selectedHairstyleId}
            </span>
          </div>
        )}

        {/* Salon Verification & Security Badge */}
        <div className="p-4 rounded-2xl bg-white/70 dark:bg-[#11141e]/60 border border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="font-medium text-slate-700 dark:text-slate-300">{activeToken.salonName || 'Verified Atelier'} • Real-Time STOMP Connected</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Encrypted Queue Pass • Guaranteed Chair Priority</span>
          </div>
        </div>

      </main>

      {/* ========================================================
          5% CANCELLATION FEE CONFIRMATION MODAL (DESIGN.md)
         ======================================================== */}
      {showCancelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#121622] border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5 text-left text-slate-900 dark:text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Cancel Token Pass</h3>
                  <span className="text-[11px] text-rose-500 font-semibold">5% Booking Deduction Applies</span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white text-lg p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <p className="leading-relaxed">
                Are you sure you want to cancel Token <strong className="text-amber-500 font-mono">#{activeToken.tokenNumber}</strong> for <strong className="text-slate-900 dark:text-white">{activeToken.serviceName || 'Haircut'}</strong>?
              </p>

              {/* Price Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Pass Value:</span>
                  <span className="text-slate-900 dark:text-white font-bold">₹{activeToken.servicePrice || 650}.00</span>
                </div>
                <div className="flex items-center justify-between text-rose-500">
                  <span>5% Reservation Fee:</span>
                  <span>- ₹{(((activeToken.servicePrice || 650)) * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2 flex items-center justify-between font-bold text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">Net Refund / Credit:</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{(((activeToken.servicePrice || 650)) * 0.95).toFixed(2)}</span>
                </div>
              </div>

              <p className="text-[11px] text-amber-700 dark:text-amber-300/90 leading-relaxed bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                According to salon queue policy, 5% is deducted for slot reservation. The remaining 95% is immediately refunded or credited to your customer account.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowCancelModal(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Keep Token
              </button>
              <button
                type="button"
                disabled={isCancelling}
                onClick={async () => {
                  setIsCancelling(true);
                  try {
                    await cancelActiveToken();
                  } finally {
                    setIsCancelling(false);
                    setShowCancelModal(false);
                  }
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isCancelling ? "Cancelling..." : "Confirm & Deduct 5%"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
