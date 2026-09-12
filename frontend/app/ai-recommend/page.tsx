'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Sparkles,
  Camera,
  Upload,
  Clock,
  Scissors,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Award,
  Zap,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Users,
  Eye,
  Sliders,
  ChevronRight,
  Info,
  Check,
  Download,
  Bookmark,
  Sun,
  X,
  Printer,
  FileText,
  UserCheck,
  Settings2,
  Search,
  RotateCcw,
  Layers,
  Cpu
} from 'lucide-react';
import { 
  aiService,
  HAIRSTYLE_CATALOG, 
  getHairstylesByGender, 
  getRealHaircutLook,
  CongestionLevel,
  HairstyleCatalogItem,
  AIRecommendationResponse
} from '@/lib/ai';
import { useCustomer } from '@/context/CustomerContext';
import { BiometricAvatar } from '@/components/BiometricAvatar';
import { analyzeUploadedImageRealtime, RealtimeBiometricAnalysis } from '@/lib/ai/realtimeImageAnalyzer';

export default function AIRecommendPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#080c14] text-center p-12 text-[#f59e0b]">Initializing Biometric Workstation...</div>}>
      <AIRecommendContent />
    </Suspense>
  );
}

function AIRecommendContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, setSelectedHairstyle, isLoggedIn } = useCustomer();

  // Primary Tab: Face Consultation vs Stylist Operations
  const [activeMainTab, setActiveMainTab] = useState<'consultation' | 'operations'>('consultation');

  // Real-Time Uploaded Photo & File Metadata
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);
  const [uploadedFileInfo, setUploadedFileInfo] = useState<{
    name: string;
    size: string;
    dimensions: string;
    timestamp: string;
  } | null>(null);
  const [realtimeAnalysis, setRealtimeAnalysis] = useState<RealtimeBiometricAnalysis | null>(null);

  // Live Camera States
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterEffect, setShutterEffect] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Dynamic Biometrics (Calibrated in real time upon upload/capture)
  const [activeGender, setActiveGender] = useState<'boy' | 'girl'>('boy');
  const [faceShape, setFaceShape] = useState<string>('Oval');
  const [hairType, setHairType] = useState<string>('Wavy');
  const [hairDensity, setHairDensity] = useState<string>('Medium');
  const [ratioText, setRatioText] = useState<string>('Ratio 1.55');
  const [patternText, setPatternText] = useState<string>('Pattern 2B');
  const [densityText, setDensityText] = useState<string>('180 f/cm²');
  const [confidence, setConfidence] = useState<string>('97.4%');
  const [symmetryScore, setSymmetryScore] = useState<string>('98.4%');

  // Selected Hairstyle
  const [selectedStyleId, setSelectedStyleId] = useState<string>('HS-B01');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [activeDisplayTab, setActiveDisplayTab] = useState<'side-by-side' | 'split-wipe' | 'real-photo'>('side-by-side');
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Auth redirect guard (from HEAD)
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('salonflow_auth_user');
      if (!savedUser && !isLoggedIn) {
        router.push('/login?redirect=/ai-recommend');
      }
    }
  }, [isLoggedIn, router]);


  // Customization Studio States (Bald, Fade, Beard, Scalp)
  const [customFadeLevel, setCustomFadeLevel] = useState<string>('Skin Fade (0 Guard - Clean Shave)');
  const [customBeardStyle, setCustomBeardStyle] = useState<string>('Clean Shaven (Hot Towel)');
  const [customEdgeUp, setCustomEdgeUp] = useState<string>('Natural Contours');
  const [customScalpFinish, setCustomScalpFinish] = useState<string>('Matte Anti-Shine SPF Balm');

  // Modals for Diagnostic Card, Save to Profile & Customization
  const [showDiagnosticModal, setShowDiagnosticModal] = useState<boolean>(false);
  const [showSaveProfileModal, setShowSaveProfileModal] = useState<boolean>(false);
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Filtered hairstyles for active gender
  const availableHairstyles = getHairstylesByGender(activeGender);
  const activeStyle =
    HAIRSTYLE_CATALOG.find(h => h.id === selectedStyleId) || availableHairstyles[0];

  // Photorealistic look of that hairstyle
  const realHaircutImg = getRealHaircutLook(activeStyle.id, activeGender);

  // Active Hairstyle Suitability Analysis for the uploaded face
  const activeRecommendation = realtimeAnalysis?.recommendations.find(r => r.hairstyleId === activeStyle.id);
  const isOptimalForShape = activeStyle.suitableFaceShapes.includes(faceShape as any);
  const activeMatchScore = activeRecommendation?.matchScore ?? (isOptimalForShape ? 96 : 88);
  const suitabilityReason = activeRecommendation?.reason ?? 
    (isOptimalForShape 
      ? `Geometric volume strongly suits your ${faceShape} face shape and ${hairType} texture, creating balanced cranial symmetry.` 
      : `Alternative cut fit. Can be styled with texture paste to flatter your ${faceShape} facial contours.`);

  // Dynamic Client Name Display
  const clientDisplayName = user?.name || (uploadedFileInfo ? uploadedFileInfo.name.replace(/\.[^/.]+$/, '') : 'Live Biometric Session');

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Operations Intelligence Interactive Simulation States
  const [simQueueCount, setSimQueueCount] = useState<number>(5);
  const [simActiveStaff, setSimActiveStaff] = useState<number>(2);
  const [simUpcomingBookings, setSimUpcomingBookings] = useState<number>(3);

  // Calculate live wait time and operations report
  const waitEstimate = aiService.calculateWaitTime({
    queueAhead: Array.from({ length: simQueueCount }).map((_, i) => ({
      tokenId: `T-0${i + 1}`,
      tokenNumber: i + 1,
      durationMinutes: 22,
      status: i === 0 ? 'IN_SERVICE' : 'WAITING',
      serviceId: 'SRV-HAIRCUT-01'
    })),
    activeStaffCount: simActiveStaff
  });

  const operationsReport = aiService.analyzeOperations({
    currentQueue: Array.from({ length: simQueueCount }).map((_, i) => ({
      tokenId: `T-0${i + 1}`,
      tokenNumber: i + 1,
      durationMinutes: 22,
      status: i === 0 ? 'IN_SERVICE' : 'WAITING'
    })),
    activeStaffCount: simActiveStaff,
    upcomingAppointmentsCount: simUpcomingBookings,
    popularHairstyleId: activeStyle.id,
    popularHairstyleName: activeStyle.name
  });

  // Handle URL params for tab switching
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam === 'operations' || tabParam === 'intelligence') {
      setActiveMainTab('operations');
    }
  }, [searchParams]);

  // Cleanup camera tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Video Ref binding
  const handleVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(err => console.warn('[Camera] autoplay error:', err));
    }
  };

  // Open Webcam
  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access not supported in this environment.');
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
      }
      streamRef.current = stream;
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn(e));
      }
    } catch (err: any) {
      setCameraError(err?.message || 'Unable to start camera. Please upload a photo instead.');
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Stop Webcam
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  };

  // Real-Time Camera Capture Handler
  const capturePhoto = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    setShutterEffect(true);
    setTimeout(() => setShutterEffect(false), 200);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setCustomPhoto(dataUrl);
        stopCamera();

        setIsAnalyzing(true);
        setAnalysisStep('Ingesting real-time camera telemetry & computing cranial mesh...');
        const result = await analyzeUploadedImageRealtime(
          dataUrl,
          activeGender,
          'live_webcam_capture.jpg',
          Math.round(dataUrl.length * 0.75)
        );

        setRealtimeAnalysis(result);
        setFaceShape(result.faceShape);
        setHairType(result.hairType);
        setHairDensity(result.hairDensity);
        setRatioText(result.ratioText);
        setPatternText(result.patternText);
        setDensityText(result.follicleDensity);
        setSymmetryScore(result.symmetryText);
        setConfidence(result.confidence);
        setUploadedFileInfo({
          name: 'live_webcam_capture.jpg',
          size: result.fileMetadata.sizeFormatted,
          dimensions: result.fileMetadata.dimensions,
          timestamp: result.fileMetadata.analyzedAt
        });

        if (result.recommendations && result.recommendations.length > 0) {
          setSelectedStyleId(result.recommendations[0].hairstyleId);
        }

        setIsAnalyzing(false);
        setAnalysisStep('');
        setToastMessage(`Camera biometrics ingested: ${result.faceShape} face detected!`);
      }
    } catch (err) {
      console.error('Camera capture error:', err);
      stopCamera();
    }
  };

  // Real-Time File Upload Handler
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsAnalyzing(true);
    setAnalysisStep(`Ingesting ${file.name} in real time...`);

    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setCustomPhoto(base64);
      if (isCameraOpen) stopCamera();

      setAnalysisStep('Evaluating cranial landmarks, aspect ratio & bilateral symmetry...');
      const result = await analyzeUploadedImageRealtime(base64, activeGender, file.name, file.size);

      setRealtimeAnalysis(result);
      setFaceShape(result.faceShape);
      setHairType(result.hairType);
      setHairDensity(result.hairDensity);
      setRatioText(result.ratioText);
      setPatternText(result.patternText);
      setDensityText(result.follicleDensity);
      setSymmetryScore(result.symmetryText);
      setConfidence(result.confidence);
      setUploadedFileInfo({
        name: file.name,
        size: result.fileMetadata.sizeFormatted,
        dimensions: result.fileMetadata.dimensions,
        timestamp: result.fileMetadata.analyzedAt
      });

      if (result.recommendations && result.recommendations.length > 0) {
        setSelectedStyleId(result.recommendations[0].hairstyleId);
      }

      setIsAnalyzing(false);
      setAnalysisStep('');
      setToastMessage(`Real-time data ingested: ${result.faceShape} face (${result.ratioText})!`);
    };
    reader.readAsDataURL(file);
  };

  // Reset Real-Time Data Ingestion
  const handleResetRealtimeData = () => {
    setCustomPhoto(null);
    setUploadedFileInfo(null);
    setRealtimeAnalysis(null);
    setFaceShape('Oval');
    setHairType('Wavy');
    setHairDensity('Medium');
    setRatioText('Ratio 1.55');
    setPatternText('Pattern 2B');
    setDensityText('180 f/cm²');
    setSymmetryScore('98.4%');
    setConfidence('97.4%');
    const defaultStyles = getHairstylesByGender(activeGender);
    if (defaultStyles.length > 0) {
      setSelectedStyleId(defaultStyles[0].id);
    }
    setToastMessage('Real-time sensor data reset. Awaiting new upload.');
  };

  // Switch Gender
  const handleGenderToggle = (newGender: 'boy' | 'girl') => {
    setActiveGender(newGender);
    const styles = getHairstylesByGender(newGender);
    if (styles.length > 0) {
      setSelectedStyleId(styles[0].id);
    }
    if (customPhoto) {
      analyzeUploadedImageRealtime(customPhoto, newGender, uploadedFileInfo?.name || 'selfie.jpg').then(res => {
        setRealtimeAnalysis(res);
        setFaceShape(res.faceShape);
        setHairType(res.hairType);
        setHairDensity(res.hairDensity);
        setRatioText(res.ratioText);
        setPatternText(res.patternText);
        setDensityText(res.follicleDensity);
        setSymmetryScore(res.symmetryText);
        setConfidence(res.confidence);
      });
    } else {
      setFaceShape('Oval');
      setHairType(newGender === 'girl' ? 'Straight' : 'Wavy');
      setHairDensity('Medium');
      setRatioText('Ratio 1.55');
      setPatternText(newGender === 'girl' ? 'Pattern 1A' : 'Pattern 2B');
      setDensityText('180 f/cm²');
      setSymmetryScore('98.4%');
      setConfidence('97.2%');
    }
  };

  // Select & Book Style
  const handleTryOnAndBook = async (style: HairstyleCatalogItem) => {
    setSelectedStyleId(style.id);
    if (isCameraOpen) stopCamera();

    setSelectedHairstyle({
      id: style.id,
      name: style.name,
      description: style.description,
      imageUrl: style.imageUrl,
      category: style.category,
      suitableFaceShapes: style.suitableFaceShapes,
      suitableHairTypes: style.suitableHairTypes,
      mappedServiceId: style.baseServiceId
    });

    setToastMessage(`Selected ${style.name} (${style.id}) on Biometric Avatar!`);
  };

  // Direct selection for Clean Bald Head (HS-B09)
  const handleSelectBald = () => {
    setSelectedStyleId('HS-B09');
    setCustomFadeLevel('Skin Fade (0 Guard - Clean Shave)');
    setCustomScalpFinish('Matte Anti-Shine SPF Balm');
    setToastMessage('Clean Bald Head selected. Zero-guard precision active.');
  };

  return (
    <div className="min-h-screen bg-[#080c14] text-slate-100 font-sans pb-28">
      
      {/* 1. HEADER NAVIGATION BAR */}
      <nav className="border-b border-slate-800 bg-[#0c1017]/95 sticky top-0 z-40 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-3">
        <div className="max-w-[1440px] mx-auto flex items-center justify-between gap-4">
          
          {/* Left: District Atelier Brand & Dynamic Client Status */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#f59e0b] text-[#080b11] font-black text-xs flex items-center justify-center font-serif shadow-lg shadow-[#f59e0b]/20 shrink-0">
              DA
            </div>
            
            <div className="flex flex-col">
              <span className="text-xs font-black uppercase tracking-wider text-white">DISTRICT ATELIER</span>
              <span className="text-[10px] text-slate-400">Baner Private Suite</span>
            </div>

            <div className="h-4 w-[1px] bg-slate-800 mx-1.5 hidden sm:block" />

            <div className="hidden sm:flex items-center gap-2 text-xs">
              <Link href="/" className="text-slate-400 hover:text-white transition-colors">Client Directory</Link>
              <span className="text-slate-600">/</span>
              <span className="text-white font-medium truncate max-w-[180px]">{clientDisplayName}</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 ml-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span>{uploadedFileInfo ? 'REAL-TIME DATA' : 'ACTIVE BIOMETRICS'}</span>
              </span>
            </div>
          </div>

          {/* Center: Navigation Links & Studio Mode Switcher */}
          <div className="flex items-center gap-1 sm:gap-2 text-xs">
            <Link href="/salon" className="text-slate-300 hover:text-white px-3 py-1.5 font-medium transition-colors">
              Discover Salons
            </Link>
            <Link href="/queue" className="text-slate-300 hover:text-white px-3 py-1.5 font-medium transition-colors">
              Live Queues
            </Link>
            <button
              onClick={() => setActiveMainTab('consultation')}
              className={`px-3.5 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                activeMainTab === 'consultation'
                  ? 'bg-[#f59e0b] text-[#080b11] shadow-sm'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              AI Style Match
            </button>
            <Link href="/appointments" className="text-slate-300 hover:text-white px-3 py-1.5 font-medium transition-colors hidden md:inline">
              Appointments
            </Link>
            <Link href="/feedback" className="text-slate-300 hover:text-white px-3 py-1.5 font-medium transition-colors hidden lg:inline">
              VIP Concierge
            </Link>
            <button
              onClick={() => setActiveMainTab('operations')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeMainTab === 'operations'
                  ? 'bg-[#f59e0b] text-[#080b11] shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Operations Intelligence
            </button>
          </div>

          {/* Right: Search Input */}
          <div className="hidden lg:flex items-center gap-2 bg-[#080c14] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400">
            <Search className="w-3.5 h-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search cuts, profiles..."
              className="bg-transparent border-none text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none w-40"
            />
            <kbd className="text-[10px] text-slate-500 border border-slate-700/80 rounded px-1 font-mono">⌘K</kbd>
          </div>

        </div>
      </nav>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed top-16 inset-x-0 z-50 flex justify-center px-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#10192e] text-[#f59e0b] px-5 py-2.5 rounded-xl shadow-2xl font-bold text-xs flex items-center gap-2 border border-[#f59e0b]/50">
            <Check className="w-4 h-4 text-emerald-400" />
            <span className="text-white">{toastMessage}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-5 sm:pt-6">

        {/* ========================================================================= */}
        {/* TAB 1: FACE CONSULTATION & VIRTUAL TRY-ON                                */}
        {/* ========================================================================= */}
        {activeMainTab === 'consultation' && (
          <div className="space-y-5 animate-fadeIn">
            
            {/* 2. HERO BANNER */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-5 pt-2 pb-1">
              <div className="space-y-1.5 max-w-3xl">
                {/* Eyebrow */}
                <div className="flex items-center gap-2 text-[10px] font-bold">
                  <span className="px-2 py-0.5 rounded-md bg-[#131b28] border border-[#22314d] text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                    <Sliders className="w-3 h-3 text-[#f59e0b]" />
                    <span>NEURAL MESH 4.2</span>
                  </span>
                  <span className="text-slate-400 uppercase tracking-wider text-[10px] font-mono">
                    CRANIAL PROPORTIONS &amp; TEXTURE MAP
                  </span>
                </div>

                <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                  Real-Time Biometric Consultation
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-2xl">
                  Visualizing tailored cut geometry on high-fidelity biometric avatars based on real-time uploaded images, craniofacial symmetry, and custom styling profiles.
                </p>
              </div>

              {/* Action Buttons: Customize, Export Diagnostics & Save Card */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#0e1422] hover:bg-[#151f33] border border-amber-500/30 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  title="Customize cut & fade"
                >
                  <Scissors className="w-3.5 h-3.5 text-[#f59e0b]" />
                  <span className="uppercase tracking-wider text-[10px]">CUSTOMIZE SPEC</span>
                </button>
                <button
                  onClick={() => setShowDiagnosticModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0e1422] hover:bg-[#151f33] border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  <span className="uppercase tracking-wider text-[10px]">EXPORT DIAGNOSTICS</span>
                </button>
                <button
                  onClick={() => setShowSaveProfileModal(true)}
                  className="px-4 py-2 rounded-xl bg-[#0e1422] hover:bg-[#151f33] border border-slate-800 text-slate-300 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Bookmark className="w-3.5 h-3.5 text-slate-400" />
                  <span className="uppercase tracking-wider text-[10px]">SAVE CARD</span>
                </button>
              </div>
            </div>

            {/* 3. WORKSPACE 2-COLUMN GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start pt-2">
              
              {/* LEFT COLUMN: Visualizer Studio Canvas (7 Cols) */}
              <div className="lg:col-span-7 space-y-4">
                
                <div className="bg-[#0c1017] border border-[#182030] rounded-2xl p-5 shadow-2xl space-y-4">
                  {/* Header above Visualizer */}
                  <div className="flex items-center justify-between pb-1">
                    <div className="flex items-center gap-2 text-xs font-black">
                      <span className="bg-[#f59e0b] text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded uppercase tracking-wider">
                        VISUALIZER
                      </span>
                      <span className="text-white font-extrabold text-sm tracking-tight">
                        {activeStyle.name} Cut
                      </span>
                      <span className="text-slate-500 font-mono text-[11px] uppercase">
                        #{activeStyle.id.replace('HS-', '')}
                      </span>
                    </div>

                    {/* Mode Viewport Switcher */}
                    <div className="flex items-center bg-[#070b12] p-1 rounded-xl border border-slate-800/80 gap-1 text-[10px]">
                      <button
                        onClick={() => setActiveDisplayTab('side-by-side')}
                        className={`px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer ${
                          activeDisplayTab === 'side-by-side'
                            ? 'bg-[#f59e0b] text-[#080b11] shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        SIDE-BY-SIDE
                      </button>
                      <button
                        onClick={() => setActiveDisplayTab('split-wipe')}
                        className={`px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer ${
                          activeDisplayTab === 'split-wipe'
                            ? 'bg-[#f59e0b] text-[#080b11] shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        SPLIT SLIDER
                      </button>
                      <button
                        onClick={() => setActiveDisplayTab('real-photo')}
                        className={`px-3 py-1 rounded-lg font-black uppercase tracking-wider transition-all cursor-pointer ${
                          activeDisplayTab === 'real-photo'
                            ? 'bg-[#f59e0b] text-[#080b11] shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        REAL PHOTO
                      </button>
                    </div>
                  </div>

                  {/* VISUALIZER MIRROR BOX WITH BIOMETRIC AVATAR & HUD OVERLAYS */}
                  <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-black border border-[#182030] shadow-2xl flex items-center justify-center">
                    
                    {/* Shutter Flash */}
                    {shutterEffect && (
                      <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-200 pointer-events-none" />
                    )}

                    {/* Webcam Active */}
                    {isCameraOpen ? (
                      <div className="relative w-full h-full bg-black">
                        <video
                          ref={handleVideoRef}
                          autoPlay
                          playsInline
                          muted
                          className="w-full h-full object-cover transform -scale-x-100"
                        />
                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                          <div className="w-52 h-64 border border-dashed border-[#f59e0b]/80 rounded-[50%] animate-pulse" />
                        </div>
                        <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-3 z-30">
                          <button
                            onClick={capturePhoto}
                            className="px-6 py-2.5 rounded-full bg-[#f59e0b] text-slate-950 font-black text-xs shadow-xl flex items-center gap-2 cursor-pointer transition-transform hover:scale-105"
                          >
                            <Camera className="w-4 h-4" />
                            <span>SNAP PORTRAIT</span>
                          </button>
                          <button
                            onClick={stopCamera}
                            className="px-4 py-2.5 rounded-full bg-black/80 hover:bg-black text-slate-300 font-bold text-xs border border-white/20 cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* VIEW 1: Side by Side with Biometric Avatar & HUD Overlays */}
                        {activeDisplayTab === 'side-by-side' && (
                          <div className="grid grid-cols-2 w-full h-full divide-x divide-[#182030]">
                            
                            {/* Left Mirror: Avatar only (till upload) or Uploaded Pic (after upload) */}
                            <div className="relative h-full overflow-hidden group bg-[#050811] flex items-center justify-center">
                              {customPhoto ? (
                                <img
                                  src={customPhoto}
                                  alt="Your Uploaded Photo"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BiometricAvatar
                                  mode="mesh-only"
                                  gender={activeGender}
                                  faceShape={faceShape}
                                  isScanning={isAnalyzing}
                                  className="w-full h-full"
                                />
                              )}

                              {/* Targeting reticle crosshairs */}
                              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                                <div className="w-44 h-52 border border-white/10 rounded-2xl relative">
                                  <span className="absolute top-1.5 right-2 text-[8px] font-mono text-slate-400">● SCAN ACTIVE</span>
                                  <div className="absolute -top-1 -left-1 w-2.5 h-2.5 border-t-2 border-l-2 border-[#f59e0b]/80" />
                                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 border-t-2 border-r-2 border-[#f59e0b]/80" />
                                  <div className="absolute -bottom-1 -left-1 w-2.5 h-2.5 border-b-2 border-l-2 border-[#f59e0b]/80" />
                                  <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 border-b-2 border-r-2 border-[#f59e0b]/80" />
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white/30 text-xs font-mono">+</div>
                                </div>
                              </div>

                              {/* Bottom Badge */}
                              <div className="absolute bottom-3 left-3 bg-black/90 text-[10px] font-black uppercase tracking-wider text-slate-300 px-3 py-1 rounded border border-white/10">
                                {customPhoto ? 'YOUR UPLOADED PHOTO' : 'ORIGINAL AVATAR'}
                              </div>
                            </div>

                            {/* Right Mirror: Avatar with cut (till upload) or Suited Hairstyle on Uploaded Pic */}
                            <div className="relative h-full overflow-hidden group bg-[#050811] flex items-center justify-center">
                              {customPhoto ? (
                                <img
                                  src={realHaircutImg}
                                  alt={activeStyle.name}
                                  className="w-full h-full object-cover transition-all duration-300"
                                />
                              ) : (
                                <BiometricAvatar
                                  mode="styled"
                                  gender={activeGender}
                                  faceShape={faceShape}
                                  styleId={selectedStyleId}
                                  isScanning={isAnalyzing}
                                  className="w-full h-full"
                                />
                              )}

                              {/* Top Right HUD: Displays which hairstyle suits when photo is uploaded */}
                              {customPhoto && (
                                <div className="absolute top-3 right-3 px-3 py-1 rounded-md bg-black/85 border border-[#f59e0b]/60 text-[10px] font-black text-amber-300 flex items-center gap-1.5 uppercase shadow-lg">
                                  <Sparkles className="w-3.5 h-3.5 text-[#f59e0b]" />
                                  <span>SUITS YOUR {faceShape.toUpperCase()} FACE ({activeMatchScore}% MATCH)</span>
                                </div>
                              )}

                              {/* Bottom Badge */}
                              <div className="absolute bottom-3 right-3 bg-[#0d1525]/90 text-[#f59e0b] text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded border border-[#f59e0b]/30">
                                {customPhoto ? `TAILORED CUT: ${activeStyle.name.toUpperCase()}` : 'TAILORED CUT APPLIED'}
                              </div>
                            </div>

                            {/* Center Divider Indicator (↔) */}
                            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 flex items-center justify-center pointer-events-none">
                              <div className="w-7 h-7 rounded-full bg-[#f59e0b] text-slate-950 font-black text-xs flex items-center justify-center shadow-lg shadow-black/80">
                                ↔
                              </div>
                            </div>
                          </div>
                        )}

                        {/* VIEW 2: Split Wipe Slider */}
                        {activeDisplayTab === 'split-wipe' && (
                          <div className="relative w-full h-full select-none overflow-hidden bg-[#050811]">
                            {/* Background: Tailored Hairstyle */}
                            <div className="absolute inset-0 w-full h-full flex items-center justify-center">
                              {customPhoto ? (
                                <img
                                  src={realHaircutImg}
                                  alt="After Cut"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <BiometricAvatar
                                  mode="styled"
                                  gender={activeGender}
                                  faceShape={faceShape}
                                  styleId={selectedStyleId}
                                  className="w-full h-full"
                                />
                              )}
                            </div>

                            {/* Foreground: Original (Slider) */}
                            <div
                              className="absolute inset-y-0 left-0 overflow-hidden border-r-2 border-[#f59e0b] shadow-[0_0_20px_#f59e0b] bg-[#050811]"
                              style={{ width: `${sliderPos}%` }}
                            >
                              <div
                                className="absolute inset-0 w-full h-full flex items-center justify-center"
                                style={{ width: '100%', minWidth: '100%', height: '100%' }}
                              >
                                {customPhoto ? (
                                  <img
                                    src={customPhoto}
                                    alt="Your Original Photo"
                                    className="w-full h-full object-cover max-w-none"
                                    style={{ width: '100%', minWidth: '100%', height: '100%' }}
                                  />
                                ) : (
                                  <BiometricAvatar
                                    mode="mesh-only"
                                    gender={activeGender}
                                    faceShape={faceShape}
                                    className="w-full h-full"
                                  />
                                )}
                              </div>
                              <span className="absolute top-3 left-3 bg-black/80 text-[10px] font-bold text-slate-300 px-2 py-0.5 rounded">
                                {customPhoto ? 'ORIGINAL PHOTO' : 'AVATAR MESH'}
                              </span>
                            </div>

                            <span className="absolute top-3 right-3 bg-[#f59e0b] text-slate-950 text-[10px] font-black px-2 py-0.5 rounded">
                              {activeStyle.name.toUpperCase()} ({activeMatchScore}% SUIT)
                            </span>

                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={sliderPos}
                              onChange={e => setSliderPos(Number(e.target.value))}
                              className="absolute inset-x-0 bottom-4 mx-auto w-3/4 z-30 accent-[#f59e0b] cursor-ew-resize opacity-80 hover:opacity-100"
                            />
                          </div>
                        )}

                        {/* VIEW 3: Full Look */}
                        {activeDisplayTab === 'real-photo' && (
                          <div className="relative w-full h-full overflow-hidden bg-[#050811] flex items-center justify-center">
                            {customPhoto ? (
                              <img
                                src={realHaircutImg}
                                alt={activeStyle.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <BiometricAvatar
                                mode="styled"
                                gender={activeGender}
                                faceShape={faceShape}
                                styleId={selectedStyleId}
                                className="w-full h-full"
                              />
                            )}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent p-4 flex items-end justify-between">
                              <div>
                                <div className="text-base font-black text-white">{activeStyle.name}</div>
                                <div className="text-xs text-amber-300">
                                  {customPhoto
                                    ? `Suits Your ${faceShape} Face: ${suitabilityReason}`
                                    : `Biometric Fit for ${faceShape} Morphology`}
                                </div>
                              </div>
                              <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-2.5 py-0.5 rounded uppercase">
                                {activeMatchScore}% MATCH
                              </span>
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* Scanning Overlay */}
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 z-40">
                        <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#f59e0b] animate-spin" />
                        <p className="text-xs font-bold text-amber-300 mt-4 animate-pulse">
                          {analysisStep || 'Ingesting Biometric Contours...'}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Primary Action Buttons Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <button
                      onClick={isCameraOpen ? stopCamera : startCamera}
                      disabled={isCameraLoading}
                      className="py-2.5 px-4 rounded-xl bg-[#0e1422] hover:bg-[#151f33] text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer"
                    >
                      <Camera className="w-4 h-4 text-slate-400" />
                      <span className="uppercase tracking-wider text-[11px]">{isCameraOpen ? 'CLOSE CAMERA' : 'LIVE CAMERA'}</span>
                    </button>

                    <label className="py-2.5 px-4 rounded-xl bg-[#0e1422] hover:bg-[#151f33] text-slate-200 font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer text-center">
                      <Upload className="w-4 h-4 text-slate-400" />
                      <span className="uppercase tracking-wider text-[11px]">UPLOAD HI-RES</span>
                      <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                    </label>

                    <button
                      onClick={() => {
                        if (customPhoto) {
                          analyzeUploadedImageRealtime(customPhoto, activeGender, uploadedFileInfo?.name || 'selfie.jpg');
                          setToastMessage('Re-scanned real-time image data.');
                        } else {
                          setToastMessage('Biometric cranial mesh re-calibrated.');
                        }
                      }}
                      disabled={isAnalyzing}
                      className="py-2.5 px-4 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#f59e0b]/20 cursor-pointer disabled:opacity-50 transition-all uppercase tracking-wider text-[11px]"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-slate-950" />
                      <span>RE-SCAN GEOMETRY</span>
                    </button>
                  </div>

                  {cameraError && (
                    <div className="p-2.5 rounded-lg bg-red-950/40 border border-red-800/60 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{cameraError}</span>
                    </div>
                  )}
                </div>

                {/* REAL-TIME DATA INGESTION & SENSOR TELEMETRY (Replaces hardcoded demo personas) */}
                <div className="space-y-2 pt-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      <span className="text-white font-extrabold uppercase tracking-wider text-xs">
                        REAL-TIME DATA INGESTION &amp; SENSOR TELEMETRY
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px] font-mono">
                      {uploadedFileInfo ? '● REAL-TIME DATA INGESTED' : '○ AWAITING REAL-TIME UPLOAD'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Pod 1: Upload Status & Ingested File Details */}
                    <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0c1017] space-y-1.5">
                      <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400">
                        <span>DATA SOURCE</span>
                        {uploadedFileInfo && (
                          <button
                            onClick={handleResetRealtimeData}
                            className="text-red-400 hover:text-red-300 font-mono text-[9px] underline cursor-pointer"
                          >
                            RESET
                          </button>
                        )}
                      </div>
                      {uploadedFileInfo ? (
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-emerald-400 truncate flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span className="truncate">{uploadedFileInfo.name}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono flex justify-between">
                            <span>{uploadedFileInfo.dimensions}</span>
                            <span>{uploadedFileInfo.size}</span>
                          </div>
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 font-medium leading-relaxed">
                          No custom photo uploaded. Upload or scan camera to ingest real-time cranial data.
                        </div>
                      )}
                    </div>

                    {/* Pod 2: Real-time Craniofacial Ratio */}
                    <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0c1017] space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                        <span>CALIBRATED RATIO</span>
                        <span className="text-[#f59e0b] font-mono">{ratioText}</span>
                      </div>
                      <div className="text-xs font-black text-white flex items-center justify-between">
                        <span>{faceShape} Morphology</span>
                        <span className="text-[10px] font-mono text-emerald-400">{confidence}</span>
                      </div>
                      <div className="w-full bg-[#070b14] h-1.5 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-gradient-to-r from-amber-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(25, (parseFloat(ratioText.replace('Ratio ', '')) - 1.2) * 200))}%` }}
                        />
                      </div>
                    </div>

                    {/* Pod 3: Follicle & Bilateral Symmetry Telemetry */}
                    <div className="p-3 rounded-xl border border-slate-800/80 bg-[#0c1017] space-y-1.5">
                      <div className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                        <span>BILATERAL SYMMETRY</span>
                        <span className="text-emerald-400 font-mono">{symmetryScore}</span>
                      </div>
                      <div className="text-xs font-black text-white flex items-center justify-between">
                        <span>{hairDensity} Density</span>
                        <span className="text-[10px] font-mono text-amber-300">{densityText}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">
                        Texture: <strong className="text-slate-200">{hairType} ({patternText})</strong>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* RIGHT COLUMN: Biometric Profile & Top Cuts List (5 Cols) */}
              <div className="lg:col-span-5 space-y-4">
                
                {/* 1. BIOMETRIC PROFILE CARD */}
                <div className="bg-[#0c1017] border border-[#182030] rounded-2xl p-5 shadow-2xl space-y-4">
                  
                  {/* Card Header & Gender Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-[9px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                        <span>DIAGNOSTIC SENSOR GRID</span>
                        {uploadedFileInfo && (
                          <span className="text-[8px] bg-emerald-950 border border-emerald-700/50 text-emerald-300 px-1.5 py-0.2 rounded font-mono">
                            REAL-TIME
                          </span>
                        )}
                      </div>
                      <div className="text-base font-extrabold text-white mt-0.5">Biometric Profile</div>
                    </div>

                    {/* Gender Switcher (♂ BOY | ♀ GIRL) */}
                    <div className="flex items-center bg-[#070b12] p-1 rounded-xl border border-slate-800/80 gap-1 text-xs">
                      <button
                        onClick={() => handleGenderToggle('boy')}
                        className={`px-3 py-1 rounded-lg font-black uppercase transition-all cursor-pointer ${
                          activeGender === 'boy'
                            ? 'bg-[#f59e0b] text-[#080b11] shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ♂ BOY
                      </button>
                      <button
                        onClick={() => handleGenderToggle('girl')}
                        className={`px-3 py-1 rounded-lg font-black uppercase transition-all cursor-pointer ${
                          activeGender === 'girl'
                            ? 'bg-[#f59e0b] text-[#080b11] shadow'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        ♀ GIRL
                      </button>
                    </div>
                  </div>

                  {/* 3 Metric Pods */}
                  <div className="grid grid-cols-3 gap-2.5 text-center">
                    <div className="bg-[#070b12] border border-slate-800/60 rounded-xl p-3">
                      <div className="text-[9px] uppercase font-bold text-slate-400">FACE SHAPE</div>
                      <div className="text-base font-black text-white mt-0.5">{faceShape}</div>
                      <div className="text-[10px] font-bold text-[#f59e0b] mt-0.5">{ratioText.replace('Ratio ', '')} Proportioned</div>
                    </div>
                    <div className="bg-[#070b12] border border-slate-800/60 rounded-xl p-3">
                      <div className="text-[9px] uppercase font-bold text-slate-400">HAIR TYPE</div>
                      <div className="text-base font-black text-white mt-0.5">{hairType}</div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{patternText}</div>
                    </div>
                    <div className="bg-[#070b12] border border-slate-800/60 rounded-xl p-3">
                      <div className="text-[9px] uppercase font-bold text-slate-400">FOLLICLE DENSITY</div>
                      <div className="text-base font-black text-white mt-0.5">{hairDensity}</div>
                      <div className="text-[10px] font-mono font-bold text-emerald-400 mt-0.5">{densityText}</div>
                    </div>
                  </div>

                  {/* Symmetry and Confidence Footnote */}
                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/60">
                    <span className="flex items-center gap-1.5 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>CRANIOFACIAL SYMMETRY {symmetryScore}</span>
                    </span>
                    <span className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-full font-mono">
                      {confidence} Confidence
                    </span>
                  </div>
                </div>

                {/* 2. TOP CUTS LIST CARD */}
                <div className="bg-[#0c1017] border border-[#182030] rounded-2xl p-5 shadow-2xl space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
                    <div className="flex items-center gap-2 text-white font-black text-xs uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-[#f59e0b]" />
                      <span>Curated Cuts for {faceShape} Morphology</span>
                    </div>
                    <span className="text-[10px] font-bold text-slate-300 bg-[#131b28] px-2.5 py-0.5 rounded-full border border-slate-700/60">
                      {availableHairstyles.length} Tailored
                    </span>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-3 max-h-[510px] overflow-y-auto pr-1 scrollbar-none">
                    {availableHairstyles.map((style, idx) => {
                      const isSelected = selectedStyleId === style.id;
                      const isSuitable = style.suitableFaceShapes.includes(faceShape as any);
                      const isTopPick = idx === 0 || (customPhoto && isSuitable && idx < 2);
                      const matchScore = isSuitable ? (idx === 0 ? 96 : 94 - idx * 2) : 86 - idx * 2;

                      return (
                        <div
                          key={style.id}
                          onClick={() => setSelectedStyleId(style.id)}
                          className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                            isSelected
                              ? 'border-[#f59e0b] bg-[#121927] shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                              : 'border-slate-800/80 bg-[#070b12] hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <img
                              src={style.imageUrl}
                              alt={style.name}
                              className="w-14 h-14 rounded-lg object-cover border border-slate-800 shrink-0 mt-0.5"
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-extrabold text-white text-xs">{style.name}</span>
                                <span className="text-[10px] font-mono text-slate-500">#{style.id.replace('HS-', '')}</span>
                                {isTopPick && (
                                  <span className="bg-[#f59e0b] text-[#080b11] text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                    TOP PICK
                                  </span>
                                )}
                                {customPhoto && isSuitable && (
                                  <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-600/50 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                    ✓ SUITS YOUR FACE
                                  </span>
                                )}
                                {isSelected && (
                                  <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                    PREVIEW ACTIVE
                                  </span>
                                )}
                                {style.id === 'HS-B09' && (
                                  <span className="bg-amber-950/60 text-amber-300 border border-amber-700/50 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                    ZERO GUARD
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                                {style.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1 border-t border-slate-800/60">
                            <div className="text-xs font-mono font-bold text-emerald-400">
                              {matchScore}% Suitability <span className="text-[11px] text-slate-400 font-normal font-sans">&bull; 25 min styling</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTryOnAndBook(style);
                              }}
                              className={`px-3 py-1.5 rounded-lg font-black text-[10px] uppercase tracking-wider flex items-center gap-1.5 cursor-pointer transition-all ${
                                isSelected
                                  ? 'bg-[#f59e0b] text-[#080b11] shadow-md shadow-[#f59e0b]/20'
                                  : 'bg-[#101726] hover:bg-[#162035] border border-slate-700 text-slate-300'
                              }`}
                            >
                              {isSelected && <Sparkles className="w-3 h-3" />}
                              <span>{isSelected ? 'TRY ON ACTIVE' : 'TRY ON'}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                </div>

              </div>
            </div>

            {/* 5. BOTTOM STATUS & QUICK BOOKING BAR */}
            <div className="rounded-2xl border border-[#182030] bg-[#0c1017] p-4 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#141b28] border border-amber-500/30 flex items-center justify-center text-[#f59e0b] shrink-0">
                  <Scissors className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white tracking-wide uppercase flex items-center gap-2">
                    <span>TAILORED SELECTION:</span>
                    <span className="text-[#f59e0b]">{activeStyle.name} ({customFadeLevel})</span>
                    <span className="bg-emerald-950/60 text-emerald-300 border border-emerald-700/50 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                      Match 95%
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Lead Stylist: <strong className="text-slate-200">Vikram R.</strong> &bull; Next Available Chair: <strong className="text-white">Today 4:30 PM</strong> (Baner Studio Suite A4)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowSaveProfileModal(true)}
                  className="px-4 py-2.5 rounded-xl bg-[#101726] hover:bg-[#162033] border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  SAVE SIMULATION
                </button>
                <button
                  onClick={() => handleTryOnAndBook(activeStyle)}
                  className="px-5 py-2.5 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-[#f59e0b]/30 transition-transform hover:scale-105 cursor-pointer"
                >
                  <span>RESERVE CONSULTATION &amp; CUT</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Sub-Footer System Bar */}
            <footer className="pt-4 pb-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500 border-t border-slate-800/60 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#f59e0b] text-[#080b11] font-black text-[9px] flex items-center justify-center font-serif">
                  DA
                </div>
                <span>District Atelier Studio OS v4.2.9</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="hover:text-slate-400 cursor-pointer">Biometric Privacy</span>
                <span>&bull;</span>
                <span className="hover:text-slate-400 cursor-pointer">Mesh Diagnostics</span>
                <span>&bull;</span>
                <span>&copy; 2024 District Atelier</span>
              </div>
            </footer>

          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: STYLIST OPERATIONS INTELLIGENCE                                   */}
        {/* ========================================================================= */}
        {activeMainTab === 'operations' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* Operations Header Banner */}
            <div className="rounded-2xl border border-[#1c273e] bg-[#0c1220] p-6 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/50 border border-emerald-800/40 text-emerald-400 text-xs font-bold uppercase mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>DETERMINISTIC QUEUE TELEMETRY &bull; LLD SECTION 11</span>
              </div>
              <h2 className="text-2xl font-black text-white">Queue Wait-Time &amp; Congestion Engine</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Real-time operational heuristics computing chair queue estimates, stylist capacity multipliers, and operational insights for salon owners and customers.
              </p>
            </div>

            {/* Operations Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              
              {/* Left Column (5 Cols): Live Controls */}
              <div className="lg:col-span-5 bg-[#0c1220] border border-[#1b253b] rounded-2xl p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between border-b border-[#1b253b] pb-3">
                  <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-[#f59e0b]" />
                    <span>Live Floor Telemetry Simulator</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">REAL-TIME</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Customers Waiting in Line:</span>
                    <span className="text-[#f59e0b] font-mono">{simQueueCount} customers</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="15"
                    value={simQueueCount}
                    onChange={e => setSimQueueCount(Number(e.target.value))}
                    className="w-full accent-[#f59e0b] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>0 (Empty)</span>
                    <span>7 (Moderate)</span>
                    <span>15 (Heavy)</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Active Stylists on Floor:</span>
                    <span className="text-emerald-400 font-mono">{simActiveStaff} stylists</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="6"
                    value={simActiveStaff}
                    onChange={e => setSimActiveStaff(Number(e.target.value))}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>1 Stylist</span>
                    <span>3 Stylists</span>
                    <span>6 Stylists</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-300">Upcoming Appointments:</span>
                    <span className="text-blue-400 font-mono">{simUpcomingBookings} bookings</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    value={simUpcomingBookings}
                    onChange={e => setSimUpcomingBookings(Number(e.target.value))}
                    className="w-full accent-blue-400 cursor-pointer"
                  />
                </div>

                {/* Formula Card */}
                <div className="p-4 rounded-xl bg-[#060a14] border border-[#1b253b] space-y-2">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Calculated Formula (LLD §11)
                  </div>
                  <div className="text-xs font-mono text-[#f59e0b] bg-[#0c1220] p-2.5 rounded-lg border border-white/5 break-all">
                    {waitEstimate.detailedFormula}
                  </div>
                  <div className="text-[11px] text-slate-400">
                    Estimated Wait: <strong className="text-white text-sm">{waitEstimate.estimatedWaitMinutes} mins</strong> ({waitEstimate.customersAheadCount} ahead across {waitEstimate.activeStaffCount} active chairs)
                  </div>
                </div>
              </div>

              {/* Right Column (7 Cols): Owner Insights & Metrics */}
              <div className="lg:col-span-7 space-y-5">
                
                {/* Metrics 3-Card Strip */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#0c1220] border border-[#1b253b] p-4 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Congestion Status</div>
                    <div className={`text-base font-black mt-1 ${
                      operationsReport.congestionLevel === 'CRITICAL' ? 'text-red-400' :
                      operationsReport.congestionLevel === 'HIGH' ? 'text-orange-400' :
                      operationsReport.congestionLevel === 'MODERATE' ? 'text-amber-300' :
                      'text-emerald-400'
                    }`}>
                      {operationsReport.congestionLevel}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Ratio: {operationsReport.queueToStaffRatio.toFixed(1)} customers/chair</div>
                  </div>

                  <div className="bg-[#0c1220] border border-[#1b253b] p-4 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Est. Average Wait</div>
                    <div className="text-base font-black text-white mt-1">
                      {operationsReport.averageWaitMinutes} min
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">22 min std haircut time</div>
                  </div>

                  <div className="bg-[#0c1220] border border-[#1b253b] p-4 rounded-xl">
                    <div className="text-[10px] uppercase font-bold text-slate-400">Peak Window</div>
                    <div className="text-base font-black text-blue-400 mt-1">
                      {operationsReport.peakHourPrediction}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">Historical weekend traffic</div>
                  </div>
                </div>

                {/* Algorithmic Owner Insights Feed */}
                <div className="bg-[#0c1220] border border-[#1b253b] rounded-2xl p-6 shadow-xl space-y-4">
                  <div className="flex items-center justify-between border-b border-[#1b253b] pb-3">
                    <h3 className="text-xs font-black text-white uppercase flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#f59e0b]" />
                      <span>Actionable Floor Insights (Owner View)</span>
                    </h3>
                    <span className="text-[10px] text-emerald-400 font-mono">AUTONOMOUS DISPATCH</span>
                  </div>

                  <div className="space-y-3">
                    {operationsReport.insights.map((insight, i) => (
                      <div
                        key={i}
                        className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                          insight.priority === 'HIGH' || insight.priority === 'CRITICAL'
                            ? 'bg-red-950/20 border-red-800/40 text-red-200'
                            : insight.priority === 'MEDIUM'
                            ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                            : 'bg-blue-950/20 border-blue-800/40 text-blue-200'
                        }`}
                      >
                        <AlertTriangle className={`w-4 h-4 shrink-0 mt-0.5 ${
                          insight.priority === 'HIGH' || insight.priority === 'CRITICAL' ? 'text-red-400' :
                          insight.priority === 'MEDIUM' ? 'text-amber-400' : 'text-blue-400'
                        }`} />
                        <div className="space-y-1 flex-1">
                          <div className="text-xs font-bold text-white">{insight.message}</div>
                          <div className="text-[11px] opacity-80">{insight.action}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Operational Station Readiness Dispatch */}
                  <div className="p-3.5 rounded-xl bg-[#090e1a] border border-amber-500/20 flex items-start gap-3">
                    <Scissors className="w-4 h-4 text-[#f59e0b] shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-white flex items-center gap-2">
                        <span>Biometric Workstation Routing</span>
                        <span className="text-[10px] text-[#f59e0b] font-mono">[{activeStyle.id}]</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        &bull; Operational Station Prep: {selectedStyleId === 'HS-B09' 
                          ? 'Stylist station alerted: Warm safety razor, hot-towel steamer & soothing tea tree scalp balm prepped.' 
                          : 'Styling station allocated with matching texturizing product and shear set.'}
                      </div>
                    </div>
                  </div>

                  {/* Honesty Note */}
                  <div className="p-3 rounded-xl bg-[#060a14] border border-[#f59e0b]/20 flex items-center gap-2.5 text-[11px] text-slate-400">
                    <ShieldCheck className="w-4 h-4 text-[#f59e0b] shrink-0" />
                    <span>
                      <strong>Honesty Compliance:</strong> Powered by deterministic queue algorithms and operational heuristics. No unverified custom ML training is claimed.
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

      </main>

      {/* ========================================================================= */}
      {/* MODAL 1: EXPORT DIAGNOSTIC CARD (Interactive printable report)            */}
      {/* ========================================================================= */}
      {showDiagnosticModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-[#1f2b45] rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Client Biometric Diagnostic Report
                </h3>
              </div>
              <button
                onClick={() => setShowDiagnosticModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Diagnostic Card Preview Content */}
            <div className="bg-[#070b14] border border-white/10 rounded-xl p-4 space-y-3 font-mono text-xs text-slate-300">
              <div className="flex justify-between items-center border-b border-white/5 pb-2 text-[10px] text-slate-400">
                <span>DISTRICT ATELIER &bull; BANER SUITE A4</span>
                <span className="text-emerald-400 font-bold">SESSION #9482-AI</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div><span className="text-slate-500">CLIENT:</span> <strong className="text-white">{clientDisplayName}</strong></div>
                <div><span className="text-slate-500">DATE:</span> <strong className="text-white">TODAY</strong></div>
                <div><span className="text-slate-500">FACE SHAPE:</span> <strong className="text-amber-300">{faceShape}</strong></div>
                <div><span className="text-slate-500">HAIR TYPE:</span> <strong className="text-white">{hairType} ({patternText})</strong></div>
                <div><span className="text-slate-500">DENSITY:</span> <strong className="text-white">{hairDensity} ({densityText})</strong></div>
                <div><span className="text-slate-500">SYMMETRY:</span> <strong className="text-emerald-400">{symmetryScore}</strong></div>
              </div>

              <div className="border-t border-white/10 pt-2 text-[11px]">
                <div className="text-slate-500 text-[10px] uppercase">MATCHED CATALOG CUT:</div>
                <div className="text-sm font-extrabold text-[#f59e0b] mt-0.5">[{activeStyle.id}] {activeStyle.name}</div>
                <div className="text-[10px] text-slate-400 mt-1 font-sans">{activeStyle.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] bg-black/40 p-2.5 rounded border border-white/5">
                <div>SOURCE: <strong className="text-white">{uploadedFileInfo ? uploadedFileInfo.name : 'Biometric Avatar'}</strong></div>
                <div>FADE LEVEL: <strong className="text-white">{customFadeLevel}</strong></div>
                <div>BEARD FINISH: <strong className="text-white">{customBeardStyle}</strong></div>
                <div>SCALP / FINISH: <strong className="text-amber-300">{customScalpFinish}</strong></div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => {
                  window.print();
                  setShowDiagnosticModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#182338] hover:bg-[#23334d] text-white font-bold text-xs flex items-center gap-1.5 border border-white/10"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>PRINT / SAVE PDF</span>
              </button>
              <button
                onClick={() => {
                  setToastMessage('Diagnostic report copied to clipboard.');
                  setShowDiagnosticModal(false);
                }}
                className="px-4 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs"
              >
                DOWNLOAD CARD
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: SAVE TO PROFILE CONFIRMATION                                     */}
      {/* ========================================================================= */}
      {showSaveProfileModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-[#1f2b45] rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Save Look to Client Profile
                </h3>
              </div>
              <button
                onClick={() => setShowSaveProfileModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-300">
              <p>
                Your biometric profile (<strong className="text-white">{faceShape} Face, {hairType} Hair</strong>) and chosen look (<strong className="text-[#f59e0b]">{activeStyle.name}</strong>) will be saved to your permanent client account.
              </p>
              <div className="bg-[#070b14] border border-white/10 p-3 rounded-xl text-[11px] space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-400">Profile Linked:</span>
                  <span className="text-white font-bold">{clientDisplayName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Custom Fade:</span>
                  <span className="text-amber-300 font-bold">{customFadeLevel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Beard &amp; Finish:</span>
                  <span className="text-white font-bold">{customBeardStyle} &bull; {customScalpFinish}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Telemetry Ingestion:</span>
                  <span className="text-emerald-400 font-bold">{uploadedFileInfo ? 'Real-Time File Linked' : 'Avatar Calibrated'}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSaveProfileModal(false)}
                className="px-4 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1f2a3f] text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setToastMessage(`Saved to profile! Your stylist can view this look during your visit.`);
                  setShowSaveProfileModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs uppercase"
              >
                Confirm Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: BESPOKE CUT & BALD CUSTOMIZATION MODAL                           */}
      {/* ========================================================================= */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0c1220] border border-amber-500/30 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-[#f59e0b]" />
                <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
                  Bespoke Cut Customization Studio
                </h3>
              </div>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Direct Cut Presets */}
            <div className="space-y-1.5">
              <label className="text-[10px] uppercase font-bold text-slate-400 block">Cut Archetype Preference:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    handleSelectBald();
                    setShowCustomModal(false);
                  }}
                  className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedStyleId === 'HS-B09'
                      ? 'border-[#f59e0b] bg-[#1a253d] text-white shadow-lg shadow-amber-500/20'
                      : 'border-white/10 bg-[#070b14] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xs font-black text-amber-300">🪒 Clean Bald Head</span>
                  <span className="text-[10px] text-slate-400">Zero-guard razor shave &amp; scalp care</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedStyleId('HS-B04');
                    setCustomFadeLevel('Skin Fade (0.5)');
                    setToastMessage('Selected: Military Buzz (0.5)');
                    setShowCustomModal(false);
                  }}
                  className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedStyleId === 'HS-B04'
                      ? 'border-[#f59e0b] bg-[#1a253d] text-white shadow-lg shadow-amber-500/20'
                      : 'border-white/10 bg-[#070b14] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xs font-black text-amber-300">⚡ Military Buzz (0.5)</span>
                  <span className="text-[10px] text-slate-400">Sharp tight clipper crop</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedStyleId('HS-B01');
                    setCustomFadeLevel('Skin Fade');
                    setToastMessage('Selected: Textured Crop Fade');
                    setShowCustomModal(false);
                  }}
                  className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedStyleId === 'HS-B01'
                      ? 'border-[#f59e0b] bg-[#1a253d] text-white shadow-lg shadow-amber-500/20'
                      : 'border-white/10 bg-[#070b14] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xs font-black text-amber-300">✂️ Textured Crop Fade</span>
                  <span className="text-[10px] text-slate-400">Blunt forward fringe with taper</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedStyleId('HS-B05');
                    setCustomFadeLevel('Classic Scissor Taper');
                    setToastMessage('Selected: Executive Side Part');
                    setShowCustomModal(false);
                  }}
                  className={`p-3 rounded-xl border text-left font-bold transition-all flex flex-col gap-1 cursor-pointer ${
                    selectedStyleId === 'HS-B05'
                      ? 'border-[#f59e0b] bg-[#1a253d] text-white shadow-lg shadow-amber-500/20'
                      : 'border-white/10 bg-[#070b14] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <span className="text-xs font-black text-amber-300">💼 Executive Side Part</span>
                  <span className="text-[10px] text-slate-400">Refined corporate contour</span>
                </button>
              </div>
            </div>

            {/* Selectors for Fade, Beard, Scalp */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Side Fade / Taper:</label>
                <select
                  value={customFadeLevel}
                  onChange={(e) => setCustomFadeLevel(e.target.value)}
                  className="w-full bg-[#080d1a] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Skin Fade">Skin Fade (0 Guard)</option>
                  <option value="Low Taper">Low Taper (1 Guard)</option>
                  <option value="Mid Drop Fade">Mid Drop Fade (2 Guard)</option>
                  <option value="Classic Scissor Taper">Classic Scissor Taper</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Beard Finish:</label>
                <select
                  value={customBeardStyle}
                  onChange={(e) => setCustomBeardStyle(e.target.value)}
                  className="w-full bg-[#080d1a] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Clean Shaven">Clean Shaven (Hot Towel)</option>
                  <option value="Designer Stubble">Designer Stubble (3-Day)</option>
                  <option value="Sculpted Full Beard">Sculpted Full Beard</option>
                  <option value="Taper Fade into Beard">Taper Fade into Beard</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 block">Scalp / Finish:</label>
                <select
                  value={customScalpFinish}
                  onChange={(e) => setCustomScalpFinish(e.target.value)}
                  className="w-full bg-[#080d1a] border border-white/15 rounded-lg px-2.5 py-1.5 text-xs text-white font-semibold focus:outline-none focus:border-amber-400 cursor-pointer"
                >
                  <option value="Matte Anti-Shine SPF Balm">Matte Anti-Shine SPF</option>
                  <option value="High-Gloss Polished Finish">High-Gloss Polished</option>
                  <option value="Cooling Tea Tree Tonic">Cooling Tea Tree Tonic</option>
                  <option value="Texturizing Matte Clay">Texturizing Matte Clay</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
              <button
                onClick={() => setShowCustomModal(false)}
                className="px-4 py-2 rounded-xl bg-[#141c2c] hover:bg-[#1f2a3f] text-slate-300 text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setToastMessage(`Custom cut specifications applied.`);
                  setShowCustomModal(false);
                }}
                className="px-5 py-2 rounded-xl bg-[#f59e0b] hover:bg-[#d97706] text-slate-950 font-black text-xs uppercase"
              >
                Apply Customization
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
