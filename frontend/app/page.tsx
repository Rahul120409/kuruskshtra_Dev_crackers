'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Clock, 
  Scissors, 
  ArrowRight, 
  ShieldCheck, 
  QrCode, 
  CheckCircle2, 
  Users, 
  Star, 
  Flame, 
  Zap, 
  MapPin, 
  Phone, 
  Calendar, 
  LayoutDashboard, 
  Shield,
  Sliders,
  Volume2,
  ChevronRight,
  RefreshCw,
  Eye,
  Award,
  Sparkle,
  Compass,
  Check,
  AlertCircle
} from 'lucide-react';
import { useCustomer } from '@/context/CustomerContext';
import { salonService } from '@/services/salonService';
import { Salon } from '@/types';
import { WalkinQrModal } from '@/components/WalkinQrModal';
import { LandingNavbar } from '@/components/LandingNavbar';
import { AIHairstyleConsultationPage } from '@/components/AIHairstyleConsultationPage';
import AdminPortal from './admin/page';

// Re-export for any deep links / sub-routes
export { AIHairstyleConsultationPage };

interface FeatureStyleDemo {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  faceMatch: string;
  score: number;
  originalImg: string;
  styledImg: string;
  description: string;
}

const FEATURE_STYLES: FeatureStyleDemo[] = [
  {
    id: 'crop',
    name: 'Textured French Crop',
    gender: 'boy',
    faceMatch: 'Oval & Square',
    score: 98,
    originalImg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80',
    styledImg: '/looks/boy_textured_crop.jpg',
    description: 'High skin fade with natural forward matte texture. Sharpens cheekbones and jawline.'
  },
  {
    id: 'pompadour',
    name: 'Executive Pompadour Fade',
    gender: 'boy',
    faceMatch: 'Round & Oval',
    score: 95,
    originalImg: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80',
    styledImg: '/looks/boy_pompadour.jpg',
    description: 'Volumetric swept top with low drop fade. Adds vertical height and slim profile.'
  },
  {
    id: 'butterfly',
    name: 'Bespoke Butterfly Layers',
    gender: 'girl',
    faceMatch: 'Oval & Heart',
    score: 97,
    originalImg: '/looks/girl_original.jpg',
    styledImg: '/looks/girl_butterfly.jpg',
    description: 'Cascading airy layers with curtain bangs that frame facial cheek structure.'
  },
  {
    id: 'bob',
    name: 'Modern Curtain French Bob',
    gender: 'girl',
    faceMatch: 'Heart & Diamond',
    score: 94,
    originalImg: '/looks/girl_original.jpg',
    styledImg: '/looks/girl_curtain_bob.jpg',
    description: 'Sharp jawline length with soft feathered texture and face-framing sweep.'
  }
];

export default function Home() {
  const router = useRouter();
  const { activeToken, joinLiveQueue, isLoggedIn } = useCustomer();

  const handleFeatureNavigation = (targetPath: string) => {
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(targetPath)}`);
    } else {
      router.push(targetPath);
    }
  };

  // Portal query param check (?portal=admin, ?portal=ai)
  const [activePortal, setActivePortal] = useState<'landing' | 'admin' | 'ai'>('landing');

  // Modals & UI state
  const [isQrModalOpen, setIsQrModalOpen] = useState<boolean>(false);
  const [liveSalons, setLiveSalons] = useState<Salon[]>([]);
  const [isLoadingSalons, setIsLoadingSalons] = useState<boolean>(true);

  // Interactive Split Slider Demo
  const [selectedStyleIndex, setSelectedStyleIndex] = useState<number>(0);
  const [sliderPos, setSliderPos] = useState<number>(52);
  const currentDemoStyle = FEATURE_STYLES[selectedStyleIndex];

  // Interactive Live Queue Simulator State
  const [simToken, setSimToken] = useState<number>(14);
  const [simGuestsAhead, setSimGuestsAhead] = useState<number>(1);
  const [simWaitMins, setSimWaitMins] = useState<number>(12);
  const [simStatus, setSimStatus] = useState<'WAITING' | 'CALLED' | 'IN_CHAIR'>('WAITING');
  const [simAudioPlayed, setSimAudioPlayed] = useState<boolean>(false);

  // Interactive Salon Admin Board Simulator State
  const [adminTokens, setAdminTokens] = useState([
    { token: '#14', name: 'James Wilson', service: 'Signature Haircut', wait: 'In Chair', status: 'IN_SERVICE' },
    { token: '#15', name: 'David Chen', service: 'Beard Sculpt & Shave', wait: 'Next Up (Ready)', status: 'CALLED' },
    { token: '#16', name: 'Michael Ross', service: 'Haircut + Scalp Ritual', wait: '12m wait', status: 'WAITING' },
    { token: '#17', name: 'Robert Taylor', service: 'Hot Lather Shave', wait: '25m wait', status: 'WAITING' },
  ]);
  const [adminStatusMessage, setAdminStatusMessage] = useState<string>('Live WebSocket connection established. All client boards synchronized.');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || params.get('admin') === 'true' || params.get('view') === 'admin') {
        setActivePortal('admin');
      } else if (params.get('portal') === 'ai' || params.get('ai') === 'true' || params.get('view') === 'ai') {
        setActivePortal('ai');
      }
    }
  }, []);

  // Fetch real salons
  useEffect(() => {
    let isMounted = true;
    salonService.getSalons()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setLiveSalons(data);
        }
      })
      .catch((e) => console.warn('Could not load live salons:', e))
      .finally(() => {
        if (isMounted) setIsLoadingSalons(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Simulator step actions
  const handleSimulateCallNext = () => {
    if (simGuestsAhead > 0) {
      setSimGuestsAhead(0);
      setSimWaitMins(2);
      setSimStatus('CALLED');
      setSimAudioPlayed(true);
      setTimeout(() => setSimAudioPlayed(false), 3000);
    } else if (simStatus === 'CALLED') {
      setSimStatus('IN_CHAIR');
      setSimWaitMins(0);
    } else {
      setSimToken(prev => prev + 1);
      setSimGuestsAhead(2);
      setSimWaitMins(18);
      setSimStatus('WAITING');
    }
  };

  // Play audio chime test
  const playChimeTone = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
      setSimAudioPlayed(true);
      setTimeout(() => setSimAudioPlayed(false), 2000);
    } catch (e) {
      console.warn('Audio chime warning:', e);
    }
  };

  // Salon Admin Simulator Action
  const handleAdminCallNext = () => {
    setAdminTokens(prev => {
      const updated = [...prev];
      if (updated.length > 1) {
        const completed = updated.shift();
        if (updated[0]) {
          updated[0].status = 'IN_SERVICE';
          updated[0].wait = 'In Chair';
        }
        if (updated[1]) {
          updated[1].status = 'CALLED';
          updated[1].wait = 'Called Now';
        }
        setAdminStatusMessage(`Token ${completed?.token} completed. Chime broadcasted to Token ${updated[1]?.token || updated[0]?.token}.`);
      }
      return updated;
    });
  };

  if (activePortal === 'admin') {
    return (
      <div>
        <div className="bg-slate-950 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 sticky top-20 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">NovaQ Enterprise Admin Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePortal('landing')}
              className="px-3 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 font-semibold text-xs border border-indigo-500/40 transition-colors cursor-pointer"
            >
              ← Back to Landing Showcase
            </button>
            <Link
              href="/admin"
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-colors"
            >
              Full Admin Page ↗
            </Link>
          </div>
        </div>
        <AdminPortal />
      </div>
    );
  }

  if (activePortal === 'ai') {
    return (
      <div>
        <div className="bg-slate-950 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 sticky top-20 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">NovaQ AI Facial Biometric Consultation</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePortal('landing')}
              className="px-3 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 font-semibold text-xs border border-indigo-500/40 transition-colors cursor-pointer"
            >
              ← Back to Landing Showcase
            </button>
            <Link
              href="/ai-recommend"
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-colors"
            >
              Full AI Studio ↗
            </Link>
          </div>
        </div>
        <AIHairstyleConsultationPage onBackToHome={() => setActivePortal('landing')} />
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full min-h-screen bg-surface text-on-surface overflow-x-hidden selection:bg-amber-500/30">
      
      {/* Static Website Landing Navbar (Home, Features, How It Works, Salons, Privacy Policy, Contact, ThemeToggle) */}
      <LandingNavbar />

      {/* =========================================================================
          HERO SECTION: High-Tech Luxury & Live Status
          ========================================================================= */}
      <section className="relative w-full pt-8 pb-16 md:pt-14 md:pb-24 px-4 sm:px-6 lg:px-margin-desktop overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-amber-500/10 via-emerald-500/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute -top-24 -left-20 w-96 h-96 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 -right-24 w-96 h-96 rounded-full bg-secondary/10 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          


          {/* Hero Headline & Value Proposition */}
          <div className="text-center max-w-4xl mx-auto space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-headline-lg font-extrabold tracking-tight text-on-surface leading-[1.12] sm:leading-[1.08] break-words">
              Precision Styling Meets <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent italic font-serif font-normal">
                Zero-Wait Smart Queues.
              </span>
            </h1>

            <p className="text-sm sm:text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto leading-relaxed px-2 sm:px-0">
              Never sit in a crowded salon lobby again. NovaQ gives you real-time live digital tokens, AI biometric haircut recommendations, and instant chair reservations across premier grooming ateliers.
            </p>

            {/* Hero CTAs - Full-width on mobile, inline on desktop */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-3 sm:pt-4 w-full max-w-xl mx-auto px-2 sm:px-0">
              <button
                type="button"
                onClick={() => handleFeatureNavigation('/ai-recommend')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-12 transition-transform" />
                <span>Try AI Style Match</span>
                <ArrowRight className="w-4 h-4 text-slate-950 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                type="button"
                onClick={() => handleFeatureNavigation('/home')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-bold text-sm border border-outline-variant transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
              >
                <Compass className="w-4 h-4 text-primary" />
                <span>Find Salons &amp; Join Queue</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (!isLoggedIn) {
                    router.push('/login?redirect=/home');
                  } else {
                    setIsQrModalOpen(true);
                  }
                }}
                className="w-full sm:w-auto px-4 py-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface font-semibold text-sm border border-outline-variant/50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <QrCode className="w-4 h-4 text-amber-400" />
                <span>Scan Walk-In QR</span>
              </button>
            </div>

            {/* Quick Metrics Bar - Responsive 2x2 on small mobile, 4 cols on desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 pt-6 sm:pt-8 max-w-3xl mx-auto text-left px-1 sm:px-0">
              <div className="p-3 sm:p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">0 min</div>
                <div className="text-[11px] sm:text-xs text-on-surface-variant font-medium mt-0.5 leading-snug">Physical Waiting Line</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">98.4%</div>
                <div className="text-[11px] sm:text-xs text-on-surface-variant font-medium mt-0.5 leading-snug">AI Match Accuracy</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-black text-blue-400 font-mono">&lt;50ms</div>
                <div className="text-[11px] sm:text-xs text-on-surface-variant font-medium mt-0.5 leading-snug">Live WebSocket Sync</div>
              </div>
              <div className="p-3 sm:p-3.5 rounded-xl bg-surface-container-low border border-outline-variant/30 backdrop-blur-sm">
                <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">100%</div>
                <div className="text-[11px] sm:text-xs text-on-surface-variant font-medium mt-0.5 leading-snug">Chair Availability</div>
              </div>
            </div>
          </div>

          {/* =====================================================================
              HERO DUAL INTERACTIVE PREVIEW CARDS
              Card A: Live Queue Pass Mockup
              Card B: AI Facial Landmark & Haircut Matcher Mockup
              ===================================================================== */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-12 items-stretch">
            
            {/* CARD A: Live Queue Digital Pass (7 Cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-gradient-to-b from-surface-container-high via-surface-container to-surface-container-low border border-amber-500/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />
              
              <div>
                {/* Header - Stacked on narrow mobile, row on desktop */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 pb-4 border-b border-outline-variant/30">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-black shrink-0">
                      NQ
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-widest text-amber-400 font-bold">NovaQ Smart Pass</div>
                      <div className="text-base font-bold text-on-surface">Beverly Hills Atelier #01</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-mono font-bold text-xs">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      LIVE SYNC
                    </span>
                  </div>
                </div>

                {/* Token Display Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 my-5 sm:my-6">
                  {/* Token Number */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Your Live Token</div>
                    <div className="text-4xl sm:text-5xl font-black font-mono text-amber-400 mt-1">
                      #{simToken}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center justify-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Confirmed in Queue</span>
                    </div>
                  </div>

                  {/* Guests Ahead */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Guests Ahead</div>
                    <div className="text-4xl sm:text-5xl font-black font-mono text-on-surface mt-1">
                      {simGuestsAhead}
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-medium mt-1">
                      {simGuestsAhead === 0 ? 'You are next in chair!' : 'Moving rapidly'}
                    </div>
                  </div>

                  {/* Est Wait */}
                  <div className="p-3.5 sm:p-4 rounded-xl bg-surface-container-lowest/80 border border-outline-variant/30 text-center">
                    <div className="text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">Estimated Arrival</div>
                    <div className="text-4xl sm:text-5xl font-black font-mono text-blue-400 mt-1">
                      ~{simWaitMins}m
                    </div>
                    <div className="text-[10px] text-on-surface-variant font-medium mt-1">
                      Chair turns around fast
                    </div>
                  </div>
                </div>

                {/* Current Status Banner */}
                <div className={`p-3 sm:p-3.5 rounded-xl border flex items-center justify-between gap-3 transition-colors ${
                  simStatus === 'CALLED' 
                    ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200 animate-pulse'
                    : simStatus === 'IN_CHAIR'
                    ? 'bg-purple-500/20 border-purple-500/50 text-purple-200'
                    : 'bg-surface-container-lowest/60 border-outline-variant/30 text-on-surface'
                }`}>
                  <div className="flex items-center gap-2.5">
                    <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                    <div>
                      <div className="text-xs font-bold leading-tight">
                        {simStatus === 'CALLED' 
                          ? 'Chair Ready: Please step into Chair #02 with Master Barber Marco!'
                          : simStatus === 'IN_CHAIR'
                          ? 'Service In Progress: Enjoy your luxury bespoke cut.'
                          : 'In Queue: Waiting comfortably at nearby cafe or lounge.'}
                      </div>
                      <div className="text-[11px] text-on-surface-variant mt-0.5">
                        Instant audio chime &amp; browser notification on turn
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={playChimeTone}
                    title="Test chime sound"
                    className="px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high border border-outline-variant/40 text-amber-400 font-bold text-xs flex items-center gap-1 shrink-0 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Chime</span>
                  </button>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-4 sm:pt-5 border-t border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
                  <span>Interactive Simulator: Test live turn advancement</span>
                </div>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleSimulateCallNext}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition-all text-center cursor-pointer"
                  >
                    {simGuestsAhead > 0 ? 'Simulate Chair Turn' : 'Reset Simulator'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeatureNavigation('/queue')}
                    className="w-full sm:w-auto px-3.5 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Full Live Board</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* CARD B: AI Facial Biometric Matcher Mockup (5 Cols) */}
            <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-surface-container-high via-surface-container to-surface-container-low border border-outline-variant/40 p-5 sm:p-6 shadow-2xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">AI Facial Biometrics</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    98.4% Confidence
                  </span>
                </div>

                {/* Face Contour Metrics */}
                <div className="grid grid-cols-3 gap-2 my-4 text-center">
                  <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20">
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold">Face Shape</div>
                    <div className="text-xs font-black text-on-surface mt-0.5">Oval / Strong</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20">
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold">Hair Texture</div>
                    <div className="text-xs font-black text-on-surface mt-0.5">Wavy / Medium</div>
                  </div>
                  <div className="p-2 rounded-lg bg-surface-container-lowest/80 border border-outline-variant/20">
                    <div className="text-[10px] text-on-surface-variant uppercase font-bold">Top Match</div>
                    <div className="text-xs font-black text-amber-400 mt-0.5">Textured Fade</div>
                  </div>
                </div>

                {/* Image Visualizer */}
                <div className="relative rounded-xl overflow-hidden aspect-[4/3] border border-outline-variant/40 bg-slate-950 mb-3 shadow-inner">
                  <img
                    src="/looks/boy_crop.jpg"
                    alt="AI Hairstyle Preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  
                  {/* Overlay Tags */}
                  <div className="absolute top-2 left-2 bg-black/75 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-mono text-amber-300 border border-amber-500/30">
                    Biometric Contour Mapped
                  </div>
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-white">
                    <div>
                      <div className="text-xs font-black text-amber-300 leading-tight">Textured French Crop</div>
                      <div className="text-[10px] text-slate-300">Natural Fade • Fits Oval Contours</div>
                    </div>
                    <span className="text-xs font-bold text-emerald-400 font-mono bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                      98% Fit
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="text-xs text-on-surface-variant">Test your real face with camera:</span>
                <button
                  type="button"
                  onClick={() => handleFeatureNavigation('/ai-recommend')}
                  className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer"
                >
                  <span>Open AI Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          PILLAR 1: REAL-TIME SMART QUEUE & DIGITAL TOKEN PASS
          Focusing strictly on the app's actual feature: /queue
          ========================================================================= */}
      <section id="features" className="w-full py-16 md:py-20 px-4 sm:px-6 lg:px-margin-desktop bg-surface-container-low border-y border-outline-variant/30 relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5" />
                <span>Feature 01 • Zero Physical Waiting</span>
              </div>

              <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline-lg font-extrabold text-on-surface tracking-tight">
                Live Smart Queue &amp; <br />
                <span className="text-primary font-serif italic font-normal">Digital Chair Token.</span>
              </h2>

              <p className="text-base text-on-surface-variant leading-relaxed">
                Waiting room exhaustion is over. NovaQ turns salon lines into a friction-free digital queue. Receive your live token from home, coffee shop, or car, and receive real-time alerts as the queue advances.
              </p>

              {/* Feature Points */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 mt-0.5">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Sub-Second WebSocket Queue Broadcasts</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      Token counts, estimated wait times, and chair statuses update on your screen instantly with under 50ms latency.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Audio Chimes &amp; Browser Push Alerts</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      Receive an audible salon chime and phone push notification when only 1 guest remains ahead of you, so you arrive precisely when your chair is sanitized and ready.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                    <QrCode className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Instant Walk-In QR Code Check-In</h3>
                    <p className="text-xs text-on-surface-variant mt-0.5 leading-relaxed">
                      Walk into any participating salon, scan the QR plaque at the entrance, and jump directly into the live digital lineup without waiting for counter staff.
                    </p>
                  </div>
                </div>
              </div>

              {/* CTA */}
              <div className="flex flex-wrap items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => handleFeatureNavigation('/queue')}
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-all flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <Clock className="w-4 h-4" />
                  <span>View Live Queue Board</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (!isLoggedIn) {
                      router.push('/login?redirect=/queue');
                    } else {
                      setIsQrModalOpen(true);
                    }
                  }}
                  className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <QrCode className="w-4 h-4 text-amber-400" />
                  <span>Open Walk-In QR Modal</span>
                </button>
              </div>
            </div>

            {/* Right Interactive Ticket Card (6 cols) */}
            <div className="lg:col-span-6">
              <div className="rounded-2xl bg-surface-container border border-outline-variant p-6 shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-outline-variant/40">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Live Atelier Token Board</span>
                  </div>
                  <span className="text-xs text-on-surface-variant font-mono">ID: TK-9042</span>
                </div>

                <div className="my-6 text-center">
                  <div className="inline-block px-4 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold font-mono uppercase mb-2">
                    Active Guest Token
                  </div>
                  <div className="text-6xl sm:text-7xl font-black font-mono text-amber-400 tracking-tight">
                    #{simToken}
                  </div>
                  <div className="text-sm font-semibold text-on-surface mt-2">
                    Signature Fade &amp; Beard Sculpt
                  </div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Stylist: Marco V. • Chair #02
                  </div>
                </div>

                {/* Progress bar */}
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-xs font-mono text-on-surface-variant">
                    <span>Queue Position: {simGuestsAhead} ahead</span>
                    <span className="text-amber-400 font-bold">~{simWaitMins}m wait remaining</span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-surface-container-highest overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(15, 100 - (simGuestsAhead * 35))}%` }}
                    />
                  </div>
                </div>

                {/* Call simulator button */}
                <div className="p-4 rounded-xl bg-surface-container-low border border-outline-variant/30 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-on-surface">Experience the Live Transition</div>
                    <div className="text-[11px] text-on-surface-variant">Test the token advance sequence</div>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateCallNext}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer shrink-0 shadow-md flex items-center gap-1.5"
                  >
                    <span>Next Turn</span>
                    <Zap className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          PILLAR 2: AI FACIAL BIOMETRIC ANALYSIS & VIRTUAL HAIRSTYLE STUDIO
          Focusing strictly on the app's actual feature: /ai-recommend & /ai-demo
          ========================================================================= */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-margin-desktop bg-surface relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Feature 02 • Biometric Facial Engine</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline-lg font-extrabold text-on-surface tracking-tight">
              Virtual Hairstyle Studio <br />
              <span className="bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent font-serif italic font-normal">
                Matched to Your Exact Face Geometry.
              </span>
            </h2>

            <p className="text-base text-on-surface-variant leading-relaxed">
              Never gamble with an ill-fitting haircut again. Our AI engine scans your jawline, cheekbones, and forehead ratios, matching your natural hair density with verified catalog styles you can try on instantly.
            </p>
          </div>

          {/* Interactive Split-Slider Showcase Widget */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center rounded-2xl sm:rounded-3xl bg-surface-container-low border border-outline-variant/40 p-4 sm:p-8 shadow-2xl">
            
            {/* Split Slider Canvas (7 cols) */}
            <div className="lg:col-span-7 flex flex-col items-center w-full">
              
              <div className="relative w-full max-w-[320px] sm:max-w-md aspect-[3/4] rounded-2xl overflow-hidden border-2 border-amber-500/40 bg-slate-950 shadow-2xl select-none mx-auto">
                
                {/* Styled Haircut Image (Underneath) */}
                <div className="absolute inset-0">
                  <img
                    src={currentDemoStyle.styledImg}
                    alt={currentDemoStyle.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                  <span className="absolute top-3 right-3 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow-lg z-20 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    <span>With {currentDemoStyle.name}</span>
                  </span>
                </div>

                {/* Original Face Image (Clipped by slider width) */}
                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={currentDemoStyle.originalImg}
                    alt="Original Face"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow z-20">
                    Original Face
                  </span>
                </div>

                {/* Dividing Draggable Line */}
                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.9)] z-10"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center shadow-2xl">
                    ↔
                  </div>
                </div>

                {/* Range Input overlay */}
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={(e) => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
                  aria-label="Interactive before and after hairstyle split slider"
                />

                {/* Bottom Details Overlay */}
                <div className="absolute bottom-3 left-3 right-3 z-20 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-black text-amber-300">{currentDemoStyle.name}</div>
                      <div className="text-xs text-slate-300">{currentDemoStyle.faceMatch} Contour Match</div>
                    </div>
                    <span className="text-xs font-black text-emerald-400 font-mono bg-slate-950/80 px-2 py-1 rounded border border-emerald-500/40">
                      {currentDemoStyle.score}% Fit
                    </span>
                  </div>
                </div>
              </div>

              <div className="text-xs text-on-surface-variant mt-3 flex items-center gap-1.5 font-medium text-center">
                <span>👈 Drag slider left and right to compare 👉</span>
              </div>
            </div>

            {/* Right Controls & Style Switcher (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div>
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">Interactive Catalog Try-On</span>
                <h3 className="text-2xl font-bold text-on-surface mt-1">Select A Hairstyle to Preview</h3>
                <p className="text-xs text-on-surface-variant mt-1 leading-relaxed">
                  Toggle styles below to observe how different contours and weight balances harmonize with facial proportions:
                </p>
              </div>

              {/* Hairstyle buttons list */}
              <div className="space-y-2.5">
                {FEATURE_STYLES.map((style, idx) => {
                  const isSelected = idx === selectedStyleIndex;
                  return (
                    <div
                      key={style.id}
                      onClick={() => setSelectedStyleIndex(idx)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                        isSelected 
                          ? 'bg-surface-container-high border-amber-500/80 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-surface-container border-outline-variant/30 hover:border-outline-variant'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-outline-variant/40">
                          <img src={style.styledImg} alt={style.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-on-surface flex items-center gap-2">
                            <span>{style.name}</span>
                            <span className="text-[10px] font-normal px-1.5 py-0.2 rounded bg-surface-container-highest text-on-surface-variant uppercase">
                              {style.gender}
                            </span>
                          </div>
                          <div className="text-[11px] text-on-surface-variant">{style.faceMatch}</div>
                        </div>
                      </div>

                      <div className="text-xs font-bold font-mono text-emerald-400 shrink-0">
                        {style.score}%
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Direct Link to full AI Studio */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => handleFeatureNavigation('/ai-recommend')}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-slate-950" />
                  <span>Analyze Your Own Face with Camera</span>
                  <ArrowRight className="w-4 h-4 text-slate-950" />
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          PILLAR 3: HYPERLOCAL ATELIER DISCOVERY & BESPOKE CHAIR BOOKING
          Focusing strictly on the app's actual feature: /home & /booking
          ========================================================================= */}
      <section id="salons" className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-margin-desktop bg-surface-container-low border-y border-outline-variant/30">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
                <MapPin className="w-3.5 h-3.5" />
                <span>Feature 03 • Hyperlocal Discovery</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-headline-lg font-extrabold text-on-surface tracking-tight">
                Discover Premier Salons with <br />
                <span className="text-primary font-serif italic font-normal">Real-Time Chair Transparency.</span>
              </h2>
              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Filter nearby salons by live queue length, distance, and luxury grooming rituals (Hot Lather Shave, Keratin Scalp Therapy, Beard Sculpting).
              </p>
            </div>

            <button
              type="button"
              onClick={() => handleFeatureNavigation('/home')}
              className="px-5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-bold text-xs transition-all flex items-center gap-2 shrink-0 cursor-pointer self-start md:self-auto"
            >
              <span>Explore All Salons</span>
              <ArrowRight className="w-4 h-4 text-primary" />
            </button>
          </div>

          {/* Salons Grid / Dynamic Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveSalons.slice(0, 3).map((salon, i) => {
              const waitMins = salon.currentWaitMinutes ?? (i * 12);
              const totalWaiting = salon.totalWaiting ?? (i + 1);
              const isOpen = salon.status === 'OPEN';

              return (
                <div
                  key={salon.id || i}
                  className="rounded-2xl bg-surface-container border border-outline-variant/40 overflow-hidden shadow-lg hover:border-amber-500/60 transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Image Header */}
                    <div className="relative aspect-[16/10] overflow-hidden bg-slate-900">
                      <img
                        src={salon.imageUrl || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80'}
                        alt={salon.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Live Badge */}
                      <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1.5 ${
                        isOpen
                          ? 'bg-emerald-500/90 text-slate-950'
                          : 'bg-slate-800 text-slate-300'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-pulse" />
                        <span>{isOpen ? (waitMins <= 5 ? 'Chairs Ready Now' : `~${waitMins}m Wait`) : 'Closed'}</span>
                      </span>

                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-base font-bold truncate">{salon.name}</div>
                        <div className="text-xs text-slate-300 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-400" />
                          <span className="truncate">{salon.area || salon.city || 'Downtown West'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Body Info */}
                    <div className="p-4 space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-1 text-amber-400 font-bold">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{salon.rating || '4.9'}</span>
                          <span className="text-on-surface-variant font-normal">({salon.reviewCount || 128})</span>
                        </div>
                        <span className="font-mono text-xs font-semibold text-emerald-400">
                          {totalWaiting} guests waiting
                        </span>
                      </div>

                      <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                        {salon.salonDescription || 'Haute coiffure and bespoke grooming salon offering master haircutting, beard sculpting, and private chair suites.'}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="p-4 pt-0">
                    <button
                      type="button"
                      onClick={() => {
                        const q = new URLSearchParams({
                          salonId: salon.id || '',
                          salonName: salon.name || '',
                          area: salon.area || '',
                          city: salon.city || '',
                          wait: String(waitMins)
                        }).toString();
                        if (!isLoggedIn) {
                          router.push(`/login?redirect=${encodeURIComponent(`/booking?${q}`)}`);
                        } else {
                          router.push(`/booking?${q}`);
                        }
                      }}
                      className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <Scissors className="w-3.5 h-3.5" />
                      <span>Book Chair Reservation</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* =========================================================================
          PILLAR 4: SALON ENTERPRISE CONTROL & QUEUE MANAGEMENT PORTAL
          Focusing strictly on the app's actual feature: /admin
          ========================================================================= */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-margin-desktop bg-surface relative">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Content (5 cols) */}
            <div className="lg:col-span-5 space-y-5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5" />
                <span>Feature 04 • Enterprise Controller</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-headline-lg font-extrabold text-on-surface tracking-tight">
                Enterprise Command Portal for <br />
                <span className="text-primary font-serif italic font-normal">Barbers &amp; Atelier Owners.</span>
              </h2>

              <p className="text-sm sm:text-base text-on-surface-variant leading-relaxed">
                Control your chairs with surgical precision. One-click token calling broadcasts sound chimes directly to clients' smartphones, eliminating counter congestion and accelerating service turnover.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>1-Tap Token Advancement with Instant Broadcast</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Real-Time Chair Turnover &amp; Daily Velocity Analytics</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-on-surface">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Automated Counter QR Code Plaque Generation</span>
                </div>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => handleFeatureNavigation('/admin')}
                  className="px-5 py-2.5 rounded-xl bg-surface-container-high hover:bg-surface-container-highest border border-outline-variant text-on-surface font-bold text-xs transition-all inline-flex items-center gap-2 cursor-pointer shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4 text-amber-400" />
                  <span>Launch Admin Operations Console</span>
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Right Interactive Admin Controller Card (7 cols) */}
            <div className="lg:col-span-7 rounded-2xl bg-surface-container-low border border-outline-variant/40 p-5 sm:p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-on-surface">Live Chair Queue Controller</span>
                </div>
                <button
                  type="button"
                  onClick={handleAdminCallNext}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Call Next Token</span>
                </button>
              </div>

              {/* Status Feed */}
              <div className="my-4 p-3 rounded-xl bg-surface-container border border-outline-variant/30 text-xs text-on-surface-variant flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
                  <span className="truncate">{adminStatusMessage}</span>
                </div>
                <span className="font-mono text-[10px] text-emerald-400 shrink-0">ONLINE</span>
              </div>

              {/* Live Queue Items Table */}
              <div className="space-y-2">
                {adminTokens.map((item, idx) => (
                  <div
                    key={item.token + idx}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs transition-all ${
                      item.status === 'IN_SERVICE'
                        ? 'bg-purple-500/15 border-purple-500/40 text-purple-200'
                        : item.status === 'CALLED'
                        ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200'
                        : 'bg-surface-container border-outline-variant/30 text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-amber-400 shrink-0">{item.token}</span>
                      <div className="min-w-0">
                        <div className="font-bold truncate">{item.name}</div>
                        <div className="text-[11px] text-on-surface-variant truncate">{item.service}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pt-1.5 sm:pt-0 border-t sm:border-t-0 border-outline-variant/20">
                      <span className="font-mono font-semibold text-[11px] sm:text-xs">{item.wait}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        item.status === 'IN_SERVICE' ? 'bg-purple-900/60 text-purple-300' :
                        item.status === 'CALLED' ? 'bg-emerald-900/60 text-emerald-300' :
                        'bg-surface-container-highest text-on-surface-variant'
                      }`}>
                        {item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS: THE ZERO-WAIT 3-STEP JOURNEY
          ========================================================================= */}
      <section id="how-it-works" className="w-full py-16 md:py-20 px-4 sm:px-6 lg:px-margin-desktop bg-surface-container-low border-b border-outline-variant/30">
        <div className="max-w-7xl mx-auto space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">The NovaQ Experience</span>
            <h2 className="text-3xl sm:text-4xl font-headline-lg font-extrabold text-on-surface tracking-tight">
              Three Steps to Zero-Wait Perfection
            </h2>
            <p className="text-sm text-on-surface-variant">
              From discovering styles to stepping straight into the barber chair.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            
            {/* Step 1 */}
            <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-mono font-black flex items-center justify-center text-base">
                01
              </div>
              <h3 className="text-base font-bold text-on-surface">Book or Scan at the Door</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Choose an appointment in advance or scan the physical QR code at the salon entrance to automatically join the live chair queue.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-black flex items-center justify-center text-base">
                02
              </div>
              <h3 className="text-base font-bold text-on-surface">Track Live Token from Anywhere</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Enjoy a coffee, catch up on work, or stroll the block. Your digital pass updates dynamically as stylists complete previous clients.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-6 rounded-2xl bg-surface-container border border-outline-variant/30 space-y-3 relative">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-400 font-mono font-black flex items-center justify-center text-base">
                03
              </div>
              <h3 className="text-base font-bold text-on-surface">Direct Chair Handoff</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Receive an audio chime and notification when your number turns green. Walk in and sit straight down in the chair with zero waiting room delay.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* =========================================================================
          BOTTOM CALL TO ACTION: Direct Navigation
          ========================================================================= */}
      <section className="w-full py-16 md:py-24 px-4 sm:px-6 lg:px-margin-desktop bg-surface relative overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-500/5 to-transparent pointer-events-none" />

        <div className="max-w-4xl mx-auto relative z-10 space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-headline-lg font-extrabold text-on-surface tracking-tight">
            Ready to Upgrade Your Grooming Routine?
          </h2>

          <p className="text-base text-on-surface-variant max-w-xl mx-auto leading-relaxed">
            Experience the future of personal grooming with intelligent live queues and facial biometric hairstyle consultation.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 pt-2 w-full max-w-lg mx-auto">
            <button
              type="button"
              onClick={() => handleFeatureNavigation('/home')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Explore Salons</span>
            </button>

            <button
              type="button"
              onClick={() => handleFeatureNavigation('/ai-recommend')}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-slate-950" />
              <span>Launch AI Style Match</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isLoggedIn) {
                  router.push('/login?redirect=/home');
                } else {
                  setIsQrModalOpen(true);
                }
              }}
              className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-400" />
              <span>Scan Walk-In QR</span>
            </button>
          </div>
        </div>
      </section>

      {/* Walk-in QR Modal */}
      <WalkinQrModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
      />

    </div>
  );
}
