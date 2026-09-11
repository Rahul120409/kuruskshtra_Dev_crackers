'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
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
  LogIn, 
  UserPlus, 
  LayoutDashboard, 
  Shield 
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { DEMO_HAIRSTYLES, DEMO_SERVICES } from '../services/mockData';
import { salonService } from '../services/salonService';
import { Salon } from '../types';
import AdminPortal from './admin/page';
import { getHairstylesByGender, HAIRSTYLE_CATALOG } from '@/lib/ai/catalog';
import { getRealHaircutLook } from '@/lib/ai/mockAiService';

interface Persona {
  id: string;
  name: string;
  gender: 'boy' | 'girl';
  faceShape: string;
  hairType: string;
  hairDensity: string;
  confidence: string;
  portraitUrl: string;
}

const DEMO_PERSONAS: Persona[] = [
  {
    id: 'p1',
    name: 'Alex (Boy)',
    gender: 'boy',
    faceShape: 'Oval',
    hairType: 'Wavy',
    hairDensity: 'Medium',
    confidence: '96.8%',
    portraitUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'p2',
    name: 'Marcus (Boy)',
    gender: 'boy',
    faceShape: 'Round',
    hairType: 'Straight',
    hairDensity: 'Medium',
    confidence: '94.2%',
    portraitUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&auto=format&fit=crop&q=80'
  },
  {
    id: 'p3',
    name: 'Sophia (Girl)',
    gender: 'girl',
    faceShape: 'Oval',
    hairType: 'Wavy',
    hairDensity: 'Medium',
    confidence: '97.4%',
    portraitUrl: '/looks/girl_original.jpg'
  },
  {
    id: 'p4',
    name: 'Chloe (Girl)',
    gender: 'girl',
    faceShape: 'Heart',
    hairType: 'Straight',
    hairDensity: 'Thin',
    confidence: '95.1%',
    portraitUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&auto=format&fit=crop&q=80'
  }
];

const COLOR_TINTS = [
  { name: 'Natural', hex: '#2b1d14' },
  { name: 'Jet Black', hex: '#111111' },
  { name: 'Espresso Brown', hex: '#442817' },
  { name: 'Honey Blonde', hex: '#c59a4c' },
  { name: 'Platinum Ash', hex: '#b3b5b7' },
  { name: 'Auburn Red', hex: '#7a291d' }
];

function getColorFilter(color: string): string {
  switch (color) {
    case 'Jet Black':
      return 'brightness(0.65) contrast(1.25)';
    case 'Espresso Brown':
      return 'sepia(0.35) hue-rotate(-15deg) brightness(0.9)';
    case 'Honey Blonde':
      return 'sepia(0.75) hue-rotate(20deg) saturate(1.8) brightness(1.35)';
    case 'Platinum Ash':
      return 'grayscale(1) brightness(1.35) contrast(0.95)';
    case 'Auburn Red':
      return 'sepia(0.85) hue-rotate(330deg) saturate(2.2) brightness(0.95)';
    default:
      return 'none';
  }
}

export function AIHairstyleConsultationPage({ onBackToHome }: { onBackToHome?: () => void }) {
  // Active Persona & Custom Captured Photo
  const [selectedPersona, setSelectedPersona] = useState<Persona>(DEMO_PERSONAS[0]);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  // Live Camera States
  const [isCameraOpen, setIsCameraOpen] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [shutterEffect, setShutterEffect] = useState<boolean>(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Biometrics & Detected Gender
  const [activeGender, setActiveGender] = useState<'boy' | 'girl'>('boy');
  const [faceShape, setFaceShape] = useState<string>('Oval');
  const [hairType, setHairType] = useState<string>('Wavy');
  const [hairDensity, setHairDensity] = useState<string>('Medium');
  const [confidence, setConfidence] = useState<string>('96.8%');

  // Selected Hairstyle & Color
  const [selectedStyleId, setSelectedStyleId] = useState<string>('HS-B01');
  const [selectedColor, setSelectedColor] = useState<string>('Natural');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeDisplayTab, setActiveDisplayTab] = useState<'side-by-side' | 'split-wipe' | 'real-photo'>('side-by-side');
  const [sliderPos, setSliderPos] = useState<number>(50);

  // Active Portrait Image (custom upload, camera snap, or sample persona)
  const currentPortrait = customPhoto || selectedPersona.portraitUrl;

  // Filtered hairstyles for the active gender
  const availableHairstyles = getHairstylesByGender(activeGender);

  // Selected hairstyle object
  const activeStyle =
    HAIRSTYLE_CATALOG.find(h => h.id === selectedStyleId) || availableHairstyles[0];

  // Photorealistic generated haircut image of that person in reality
  const realHaircutImg = getRealHaircutLook(activeStyle.id, activeGender);

  // Cleanup camera tracks on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Callback ref that attaches stream the moment the <video> element mounts in the DOM
  const handleVideoRef = (node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && streamRef.current) {
      node.srcObject = streamRef.current;
      node.play().catch(err => {
        console.warn('[Camera] autoplay error:', err);
      });
    }
  };

  // Ensure stream is bound whenever isCameraOpen changes
  useEffect(() => {
    if (isCameraOpen && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(err => {
        console.warn('[Camera] play error on state change:', err);
      });
    }
  }, [isCameraOpen]);

  // Open Webcam Camera with fallback constraints
  const startCamera = async () => {
    setIsCameraLoading(true);
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported by your browser.');
      }
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
          },
          audio: false
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }
      streamRef.current = stream;
      setIsCameraOpen(true);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(e => console.warn(e));
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      setCameraError(err?.message || 'Unable to access camera. You can snap a simulated pic or upload a photo.');
    } finally {
      setIsCameraLoading(false);
    }
  };

  // Stop Webcam Camera
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

  // Capture Photo from Camera
  const capturePhoto = () => {
    if (!videoRef.current) {
      simulateCameraSnap();
      return;
    }
    const video = videoRef.current;
    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    // Shutter flash animation
    setShutterEffect(true);
    setTimeout(() => setShutterEffect(false), 250);

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mirror horizontally to match front-facing camera view
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(video, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
        setCustomPhoto(dataUrl);
        stopCamera();
        setActiveDisplayTab('side-by-side');
        analyzeUploadedImage(dataUrl);
      } else {
        simulateCameraSnap();
      }
    } catch (err) {
      console.error('Snapshot capture error:', err);
      simulateCameraSnap();
    }
  };

  // Simulated Snap for testing when camera hardware is absent
  const simulateCameraSnap = () => {
    setShutterEffect(true);
    setTimeout(() => {
      setShutterEffect(false);
      const snapSample = activeGender === 'girl'
        ? '/looks/girl_original.jpg'
        : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&auto=format&fit=crop&q=80';
      setCustomPhoto(snapSample);
      stopCamera();
      setActiveDisplayTab('side-by-side');
      analyzeUploadedImage(snapSample);
    }, 250);
  };

  // Handle custom photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setCustomPhoto(base64);
        stopCamera();
        setActiveDisplayTab('side-by-side');
        analyzeUploadedImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  // Mock analysis logic for fast, realistic response
  const analyzeUploadedImage = async (_base64Img?: string) => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setConfidence('97.6%');
    }, 600);
  };

  // Switch persona
  const handleSelectPersona = (p: Persona) => {
    stopCamera();
    setSelectedPersona(p);
    setCustomPhoto(null);
    setActiveGender(p.gender);
    setFaceShape(p.faceShape);
    setHairType(p.hairType);
    setHairDensity(p.hairDensity);
    setConfidence(p.confidence);

    const genderStyles = getHairstylesByGender(p.gender);
    if (genderStyles.length > 0) {
      setSelectedStyleId(genderStyles[0].id);
    }
  };

  // Switch gender toggle
  const handleGenderToggle = (newGender: 'boy' | 'girl') => {
    setActiveGender(newGender);
    if (newGender === 'girl') {
      const girlPersona = DEMO_PERSONAS.find(p => p.gender === 'girl') || DEMO_PERSONAS[2];
      handleSelectPersona(girlPersona);
    } else {
      const boyPersona = DEMO_PERSONAS.find(p => p.gender === 'boy') || DEMO_PERSONAS[0];
      handleSelectPersona(boyPersona);
    }
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 font-sans selection:bg-amber-500/30">
      {/* TOP HEADER */}
      <nav className="border-b border-[#1b2333] bg-[#0b0f19]/90 backdrop-blur px-4 py-2.5 flex items-center justify-between text-xs sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/30">
            ✂️
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-extrabold text-sm text-white tracking-tight">
              <span>SalonFlow</span>
              <span className="bg-blue-600/30 text-blue-400 text-[10px] font-bold px-1.5 py-0.2 rounded border border-blue-500/40">
                AI
              </span>
            </div>
            <div className="text-[9px] text-slate-400 font-mono tracking-wider -mt-0.5 uppercase">
              SMART STUDIO &amp; QUEUE
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {onBackToHome && (
            <button
              onClick={onBackToHome}
              className="px-3 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 font-semibold text-xs border border-indigo-500/40 transition-colors cursor-pointer"
            >
              ← Back to Main Home
            </button>
          )}

          <div className="bg-[#131b2e] border border-blue-500/30 px-3 py-1 rounded-full text-[11px] font-mono flex items-center gap-2 text-slate-200">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>#108 | 24m wait</span>
          </div>

          <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#151c2c] border border-slate-800">
            <div className="w-5 h-5 rounded-full bg-purple-600 flex items-center justify-center text-[10px] font-bold text-white">
              S
            </div>
            <span className="text-xs font-semibold text-slate-200">sham</span>
          </div>

          <span className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 text-xs font-semibold hidden sm:inline">
            Real-Time Face Match
          </span>
        </div>
      </nav>

      {/* MAIN WORKSPACE */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider mb-2.5">
            <span>⚡</span> AI Real-Time Face Customization
          </div>
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">
            AI Hairstyle Consultation
          </h1>
          <p className="text-slate-400 text-xs md:text-sm max-w-xl mx-auto mt-2 leading-relaxed">
            Upload or click a selfie. Your exact face is customized with flattering haircuts in real-time, showing how each hairstyle looks on YOU in reality.
          </p>
        </div>

        {/* TWO-COLUMN CONSULTATION PANEL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* LEFT COLUMN: YOUR PORTRAIT & REAL LOOK */}
          <div className="lg:col-span-5 bg-[#0f1422] border border-[#1d263b] rounded-2xl p-5 shadow-2xl">
            {/* Header & Display Mode */}
            <div className="flex items-center justify-between mb-3 text-xs">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <span>📷</span>
                <span>{isCameraOpen ? 'Live Camera' : 'Your Portrait & Look'}</span>
              </div>
              {isCameraOpen ? (
                <span className="text-rose-400 text-[11px] font-mono animate-pulse flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span> Camera Active
                </span>
              ) : (
                <span className="text-slate-400 text-[11px] font-mono">Front-facing &amp; well-lit</span>
              )}
            </div>

            {/* Display Mode Tabs */}
            {!isCameraOpen && (
              <div className="flex items-center justify-between mb-3 bg-[#0a0d17] p-1.5 rounded-xl border border-[#1b2336] text-[11px]">
                <span className="text-slate-400 font-semibold px-1">View:</span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setActiveDisplayTab('side-by-side')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeDisplayTab === 'side-by-side'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Side-by-Side
                  </button>
                  <button
                    onClick={() => setActiveDisplayTab('split-wipe')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeDisplayTab === 'split-wipe'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Split Wipe
                  </button>
                  <button
                    onClick={() => setActiveDisplayTab('real-photo')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      activeDisplayTab === 'real-photo'
                        ? 'bg-amber-500 text-slate-950 shadow-md'
                        : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    Full Look
                  </button>
                </div>
              </div>
            )}

            {/* VIEWPORT CONTAINER */}
            {isCameraOpen ? (
              /* LIVE CAMERA VIEWFINDER */
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-4 border-2 border-amber-400 bg-slate-950 shadow-2xl">
                <video
                  ref={handleVideoRef}
                  autoPlay
                  playsInline
                  muted
                  onLoadedMetadata={(e) => {
                    (e.target as HTMLVideoElement).play().catch(err => console.warn('play error', err));
                  }}
                  className="w-full h-full object-cover -scale-x-100 bg-slate-900"
                />

                {/* Face Guide */}
                <div className="absolute inset-0 border-2 border-white/20 rounded-xl pointer-events-none flex items-center justify-center">
                  <div className="w-48 h-64 border border-dashed border-amber-400/50 rounded-full"></div>
                </div>

                {/* Shutter flash effect */}
                {shutterEffect && (
                  <div className="absolute inset-0 bg-white z-50 animate-out fade-out duration-300 pointer-events-none"></div>
                )}

                <div className="absolute top-3 left-3 bg-red-600 text-white font-bold text-[10px] px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shadow">
                  <span className="w-2 h-2 rounded-full bg-white animate-ping"></span>
                  <span>LIVE CAMERA</span>
                </div>

                <div className="absolute top-3 right-3 bg-black/70 text-slate-200 text-[10px] font-mono px-2 py-0.5 rounded border border-slate-700">
                  Position face inside guide
                </div>

                {/* Shutter Capture Button Group */}
                <div className="absolute bottom-4 inset-x-0 flex items-center justify-center gap-5 z-30">
                  <button
                    onClick={stopCamera}
                    className="w-10 h-10 rounded-full bg-black/70 text-white border border-slate-700 flex items-center justify-center text-xs font-bold hover:bg-black cursor-pointer"
                    title="Close Camera"
                  >
                    ✕
                  </button>

                  <button
                    onClick={capturePhoto}
                    className="relative w-16 h-16 rounded-full border-4 border-white bg-amber-400 hover:bg-amber-300 active:scale-95 transition-all flex items-center justify-center shadow-[0_0_25px_rgba(251,191,36,0.8)] cursor-pointer"
                    title="Click Pic!"
                  >
                    <div className="w-11 h-11 rounded-full border-2 border-slate-900 bg-amber-400 flex items-center justify-center text-lg">
                      📸
                    </div>
                  </button>

                  <div className="w-10 h-10"></div>
                </div>
              </div>
            ) : activeDisplayTab === 'side-by-side' ? (
              /* SIDE-BY-SIDE VIEW */
              <div className="grid grid-cols-2 gap-3 rounded-xl overflow-hidden mb-4 border border-[#222d46] bg-[#090d18] p-2.5 shadow-inner">
                {/* Left: Original Upload / Captured Selfie */}
                <div className="relative rounded-lg overflow-hidden border border-slate-700/80 bg-slate-950 aspect-[3/4]">
                  <img
                    src={currentPortrait}
                    alt="Original Upload"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent"></div>
                  <span className="absolute top-2 left-2 bg-slate-950/90 text-slate-200 text-[9px] font-bold px-1.5 py-0.5 rounded border border-slate-700 shadow">
                    📷 Original Pic
                  </span>
                  <div className="absolute bottom-2 left-2 right-2">
                    <div className="text-[10px] font-bold text-white leading-tight">
                      {customPhoto ? 'Your Photo' : selectedPersona.name}
                    </div>
                    <div className="text-[9px] text-slate-400 font-mono">{faceShape} • {hairType}</div>
                  </div>
                </div>

                {/* Right: Real Haircut Photo corresponding to the chosen hairstyle */}
                <div className="relative rounded-lg overflow-hidden border-2 border-amber-500/80 bg-slate-950 aspect-[3/4] shadow-[0_0_20px_rgba(245,158,11,0.25)]">
                  <img
                    src={realHaircutImg}
                    alt={`Real look of ${activeStyle.name}`}
                    className="w-full h-full object-cover transition-all duration-300"
                    style={{
                      filter: selectedColor !== 'Natural' ? getColorFilter(selectedColor) : 'none'
                    }}
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none"></div>

                  <span className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded shadow flex items-center gap-1 z-20">
                    <span>✨ Customized</span>
                  </span>
                  <div className="absolute bottom-2 left-2 right-2 pointer-events-none z-20">
                    <div className="text-[11px] font-black text-amber-300 truncate leading-tight">
                      {activeStyle.name}
                    </div>
                    <div className="text-[9px] text-emerald-400 font-bold font-mono">
                      Real Salon Look ({selectedColor})
                    </div>
                  </div>
                </div>
              </div>
            ) : activeDisplayTab === 'split-wipe' ? (
              /* Interactive Split Slider on the User's Real Face */
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-4 border border-[#222d46] bg-slate-950 select-none">
                <div className="absolute inset-0">
                  <img
                    src={realHaircutImg}
                    alt="With Haircut"
                    className="w-full h-full object-cover"
                    style={{
                      filter: selectedColor !== 'Natural' ? getColorFilter(selectedColor) : 'none'
                    }}
                  />
                </div>
                <span className="absolute top-3 right-3 bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded shadow z-20">
                  ✨ With {activeStyle.name}
                </span>

                <div
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${sliderPos}%` }}
                >
                  <img
                    src={currentPortrait}
                    alt="Original Face"
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ width: '100%', maxWidth: 'none' }}
                  />
                  <span className="absolute top-3 left-3 bg-slate-900/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow">
                    Original Face
                  </span>
                </div>

                <div
                  className="absolute top-0 bottom-0 w-1 bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.9)] z-10"
                  style={{ left: `${sliderPos}%` }}
                >
                  <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-lg">
                    ↔
                  </div>
                </div>

                <input
                  type="range"
                  min="0"
                  max="100"
                  value={sliderPos}
                  onChange={e => setSliderPos(Number(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                />
              </div>
            ) : (
              /* Full Look View */
              <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden mb-4 border border-amber-500/50 bg-slate-950 shadow-2xl">
                <img
                  src={realHaircutImg}
                  alt={activeStyle.name}
                  className="w-full h-full object-cover"
                  style={{
                    filter: selectedColor !== 'Natural' ? getColorFilter(selectedColor) : 'none'
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"></div>
                <div className="absolute top-3 left-3 bg-slate-950/90 text-slate-200 text-[10px] font-bold px-2 py-0.5 rounded border border-slate-700 shadow">
                  Real Haircut Portrait
                </div>
                <div className="absolute bottom-3 left-3 right-3 pointer-events-none">
                  <div className="text-base font-black text-amber-300">
                    {activeStyle.name}
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    {activeStyle.description}
                  </div>
                </div>
              </div>
            )}

            {/* Camera Error / Fallback Notice */}
            {cameraError && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300 flex items-center justify-between gap-2">
                <span>{cameraError}</span>
                <button
                  onClick={simulateCameraSnap}
                  className="px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold text-[10px] shrink-0"
                >
                  Snap Simulated Pic
                </button>
              </div>
            )}

            {/* Quick Hairstyle Carousel */}
            <div className="mb-4 bg-[#0a0d17] p-3 rounded-xl border border-[#1b2336]">
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <span>✂️</span>
                  <span>Try Different Hairstyles:</span>
                </span>
                <span className="text-amber-400 text-[10px] font-mono">Tap to change style on your face</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin px-1 items-center">
                {availableHairstyles.map(style => {
                  const isSelected = selectedStyleId === style.id;
                  return (
                    <button
                      key={style.id}
                      onClick={() => {
                        setSelectedStyleId(style.id);
                        if (isCameraOpen) stopCamera();
                      }}
                      className={`flex flex-col items-center gap-1 shrink-0 p-1 rounded-xl transition-all cursor-pointer ${
                        isSelected ? 'scale-105' : 'opacity-75 hover:opacity-100'
                      }`}
                    >
                      <div
                        className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all p-0.5 ${
                          isSelected
                            ? 'border-amber-400 ring-4 ring-amber-400/40 shadow-[0_0_12px_rgba(245,158,11,0.5)] bg-amber-500/20'
                            : 'border-slate-700 bg-slate-900 hover:border-slate-500'
                        }`}
                      >
                        <img
                          src={style.imageUrl}
                          alt={style.name}
                          className="w-full h-full object-cover rounded-full"
                        />
                      </div>
                      <span
                        className={`text-[9px] font-bold truncate max-w-[58px] text-center ${
                          isSelected ? 'text-amber-300 font-black' : 'text-slate-300'
                        }`}
                      >
                        {style.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hair Color Customizer */}
            <div className="mb-4 bg-[#0a0d17] p-2.5 rounded-xl border border-[#1b2336]">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                Hair Color Tint:
              </div>
              <div className="flex flex-wrap gap-1.5">
                {COLOR_TINTS.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    className={`text-[10px] px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition-all ${
                      selectedColor === c.name
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300 font-bold'
                        : 'border-[#1f283d] bg-slate-900 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <span className="w-2.5 h-2.5 rounded-full border border-black/40" style={{ backgroundColor: c.hex }}></span>
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Camera Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {isCameraOpen ? (
                <button
                  onClick={capturePhoto}
                  className="w-full py-2.5 px-3 rounded-xl border border-amber-500 bg-amber-500 text-slate-950 font-black text-xs flex items-center justify-center gap-2 hover:bg-amber-400 transition-colors shadow-lg shadow-amber-500/20 cursor-pointer col-span-2"
                >
                  <span>📸</span>
                  <span>Snap Picture Now</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={startCamera}
                    disabled={isCameraLoading}
                    className="w-full py-2.5 px-3 rounded-xl border border-amber-500/50 bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-sm cursor-pointer"
                  >
                    <span>📸</span>
                    <span>{customPhoto ? 'Click Another Pic' : 'Click Pic (Camera)'}</span>
                  </button>

                  <label className="w-full py-2.5 px-3 rounded-xl border border-[#26334d] bg-[#121829] hover:bg-[#182137] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-sm">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoUpload}
                      className="hidden"
                    />
                    <span>📤</span>
                    <span>Upload Photo</span>
                  </label>
                </>
              )}
            </div>

            {/* Sample Persona Portraits */}
            <div className="mb-4">
              <div className="text-[11px] text-slate-400 font-medium mb-2">
                Or select sample portrait for testing:
              </div>
              <div className="grid grid-cols-4 gap-2">
                {DEMO_PERSONAS.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPersona(p)}
                    className={`relative rounded-xl overflow-hidden border aspect-square transition-all ${
                      selectedPersona.id === p.id && !customPhoto && !isCameraOpen
                        ? 'border-amber-400 ring-2 ring-amber-400/30 shadow-lg shadow-amber-500/20'
                        : 'border-[#222d46] hover:border-slate-600 opacity-75 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={p.portraitUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                    <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-bold text-slate-300 text-center py-0.5">
                      {p.gender === 'boy' ? 'Boy' : 'Girl'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Run Biometric Analysis Button */}
            <button
              onClick={() => analyzeUploadedImage()}
              disabled={isAnalyzing}
              className="w-full py-3 px-4 rounded-xl font-black text-sm bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <span>✨</span>
              <span>{isAnalyzing ? 'Analyzing Biometrics...' : 'Analyze & Match Styles'}</span>
            </button>
          </div>

          {/* RIGHT COLUMN: GENDER BIOMETRICS & RECOMMENDATIONS */}
          <div className="lg:col-span-7 space-y-5">
            {/* Top Card: Biometric Profile Analysis */}
            <div className="bg-[#0f1422] border border-[#1d263b] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <span>📐</span>
                  <span>Biometric Profile Analysis</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">
                  Model Confidence: {confidence}
                </span>
              </div>

              {/* Gender Switcher */}
              <div className="flex items-center justify-between mb-4 bg-[#090d18] p-2 rounded-xl border border-[#1c2438]">
                <div className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="text-[10px] uppercase font-bold text-slate-500">Detected:</span>
                  <span className="font-extrabold text-white uppercase">{activeGender === 'boy' ? "👦 Boy" : "👧 Girl"}</span>
                </div>
                <div className="flex gap-1.5">
                  <button
                    onClick={() => handleGenderToggle('boy')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeGender === 'boy'
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👦 Boy Styles
                  </button>
                  <button
                    onClick={() => handleGenderToggle('girl')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      activeGender === 'girl'
                        ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    👧 Girl Styles
                  </button>
                </div>
              </div>

              {/* 3 Metric Boxes */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[#090d18] border border-[#1c2438] rounded-xl p-3">
                  <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                    Face Shape
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">
                    {faceShape}
                  </div>
                </div>

                <div className="bg-[#090d18] border border-[#1c2438] rounded-xl p-3">
                  <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                    Hair Type
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">
                    {hairType}
                  </div>
                </div>

                <div className="bg-[#090d18] border border-[#1c2438] rounded-xl p-3">
                  <div className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
                    Hair Density
                  </div>
                  <div className="text-lg font-black text-white mt-0.5">
                    {hairDensity}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Section: Hairstyle Recommendations */}
            <div className="bg-[#0f1422] border border-[#1d263b] rounded-2xl p-5 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-wider">
                  <span>🔥</span>
                  <span>
                    Top {activeGender === 'boy' ? "Boy" : "Girl"} Hairstyles for {faceShape} Face ({availableHairstyles.length})
                  </span>
                </div>
                <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                  Catalog Verified
                </span>
              </div>

              {/* Recommendation Cards List */}
              <div className="space-y-3.5">
                {availableHairstyles.map((style, idx) => {
                  const isSelected = selectedStyleId === style.id;
                  const isTopPick = idx === 0;
                  const matchScore = isTopPick ? 95 : 92 - idx * 3;

                  return (
                    <div
                      key={style.id}
                      onClick={() => {
                        setSelectedStyleId(style.id);
                        if (isCameraOpen) stopCamera();
                      }}
                      className={`relative rounded-xl p-4 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-2 border-amber-500/90 bg-[#141a2b] shadow-[0_0_18px_rgba(245,158,11,0.2)]'
                          : 'border border-[#1f283d] bg-[#0b0f19] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3.5 flex-1">
                        <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 shrink-0 shadow-md">
                          <img
                            src={style.imageUrl}
                            alt={style.name}
                            className="w-full h-full object-cover"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-black/80 text-[8px] font-bold text-amber-300 text-center py-0.5">
                            {style.category}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-mono font-bold text-slate-400">
                              [{style.id}]
                            </span>
                            <span className="font-extrabold text-white text-sm">
                              {style.name}
                            </span>
                            {isTopPick && (
                              <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                                TOP PICK
                              </span>
                            )}
                            {isSelected && (
                              <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase">
                                On Your Face
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-300 leading-relaxed max-w-md">
                            {style.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto gap-2 shrink-0">
                        <div className="text-xs font-black text-emerald-400 font-mono">
                          {matchScore}% <span className="text-[9px] text-slate-400 font-normal">MATCH</span>
                        </div>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setSelectedStyleId(style.id);
                            if (isCameraOpen) stopCamera();
                            alert(`Confirmed "${style.name}" in ${selectedColor}! Handoff to Person 2 Booking Module.`);
                          }}
                          className="px-3.5 py-2 rounded-lg font-extrabold text-xs bg-amber-500 hover:bg-amber-400 text-slate-950 transition-colors shadow-md shadow-amber-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>✂️</span>
                          <span>Try On &amp; Book</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  const { isLoggedIn, user } = useCustomer();
  const [firstSalon, setFirstSalon] = useState<Salon | null>(null);
  const [activePortal, setActivePortal] = useState<'customer' | 'admin' | 'ai'>('customer');

  useEffect(() => {
    salonService.getSalons().then((list) => {
      if (list && list.length > 0) {
        setFirstSalon(list[0]);
      }
    });

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || params.get('admin') === 'true' || params.get('view') === 'admin') {
        setActivePortal('admin');
      } else if (params.get('portal') === 'ai' || params.get('ai') === 'true' || params.get('view') === 'ai') {
        setActivePortal('ai');
      }
    }
  }, []);

  if (activePortal === 'admin') {
    return (
      <div>
        <div className="bg-slate-950 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 sticky top-16 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">SalonFlow AI Enterprise Admin Portal</span>
            <span className="text-zinc-500 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">Incoming from back branch</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePortal('customer')}
              className="px-3 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 font-semibold text-xs border border-indigo-500/40 transition-colors cursor-pointer"
            >
              ← Switch to Customer View
            </button>
            <Link
              href="/admin"
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-colors hidden sm:inline-block"
            >
              Standalone /admin ↗
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
        <div className="bg-slate-950 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 sticky top-16 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">SalonFlow AI Real-Time Face Consultation</span>
            <span className="text-zinc-500 hidden sm:inline">•</span>
            <span className="text-zinc-400 hidden sm:inline">AI Studio Engine</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePortal('customer')}
              className="px-3 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 font-semibold text-xs border border-indigo-500/40 transition-colors cursor-pointer"
            >
              ← Switch to Customer View
            </button>
            <Link
              href="/ai-demo"
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-colors hidden sm:inline-block"
            >
              Standalone /ai-demo ↗
            </Link>
          </div>
        </div>
        <AIHairstyleConsultationPage onBackToHome={() => setActivePortal('customer')} />
      </div>
    );
  }

  return (
    <div className="space-y-20 pb-16">
      {/* Portal Switcher Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">SalonFlow Dual-Engine (Customer, AI Studio & Admin)</span>
        </div>
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-inner gap-1">
          <button
            type="button"
            onClick={() => setActivePortal('customer')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer ${
              activePortal === 'customer'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Customer View
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('ai')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePortal === 'ai'
                ? 'bg-amber-500 text-slate-950 shadow-sm font-bold'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI Studio</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline">
              New
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className={`px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              activePortal === 'admin'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Admin Portal</span>
            <span className="text-[10px] px-1 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 hidden sm:inline">
              Back
            </span>
          </button>
        </div>
      </div>

      {/* If already signed in, show a clean banner to jump to /home */}
      {isLoggedIn && user && (
        <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="rounded-2xl bg-indigo-500/10 border border-indigo-500/30 p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <p className="text-xs text-slate-300">
                You are currently signed in as <strong className="text-white">{user.name}</strong>.
              </p>
            </div>
            <Link
              href="/home"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Go to Customer Dashboard</span>
            </Link>
          </div>
        </section>
      )}

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-800/80">

        {/* Subtle Ambient Background Gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[32rem] h-[32rem] bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI Haircut Matching & Real-Time Virtual Queue Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-tight">
            The Intelligent Salon Experience. <br />
            <span className="text-indigo-400">
              Zero Wait. AI Precision.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
            Eliminate waiting room congestion. SalonFlow AI pairs computer vision facial geometry with live queue tracking, letting you secure your spot from anywhere and arrive exactly when your chair is ready.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mt-9 max-w-md mx-auto">
            {isLoggedIn ? (
              <Link
                href="/home"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Open Customer Dashboard</span>
              </Link>
            ) : (
              <>
                <Link
                  href="/register"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all hover:scale-105"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Get Started / Register</span>
                </Link>

                <Link
                  href="/login"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:border-indigo-500/40"
                >
                  <LogIn className="w-4 h-4 text-indigo-400" />
                  <span>Sign In</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setActivePortal('ai')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Studio</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActivePortal('admin')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-indigo-500/30 text-indigo-300 hover:text-indigo-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-indigo-400" />
                  <span>Admin Portal</span>
                </button>
              </>
            )}
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
            <button
              type="button"
              onClick={() => setActivePortal('ai')}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Try Live AI Hairstyle Studio</span>
              <ArrowRight className="w-3 h-3" />
            </button>
            <span className="text-slate-600">•</span>
            <Link
              href="/ai-recommend"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-400 inline-flex items-center gap-1.5 transition-colors"
            >
              <span>Facial Contour Consultation</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

        </div>

        {/* Live Interface Preview Cards Mockup */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
          <div className="rounded-3xl bg-slate-950 border border-slate-800 p-6 sm:p-8 shadow-2xl grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Left Mockup Card: Live Queue Pass */}
            <div className="rounded-2xl bg-slate-900/90 border border-indigo-500/30 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Live Virtual Queue Pass</span>
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300">
                  TOKEN #108
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 py-2">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Queue Position</span>
                  <span className="text-xl font-extrabold text-indigo-400 font-mono">4th in line</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase block">Estimated Wait</span>
                  <span className="text-xl font-extrabold text-white font-mono">~24 mins</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Customers receive proactive notifications when they are 2 positions away, avoiding crowded waiting lounges.
              </p>
            </div>

            {/* Right Mockup Card: AI Recommendation */}
            <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Face Geometry Match</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                  95% Match
                </span>
              </div>

              <div className="flex items-center gap-3 py-1">
                <img
                  src="https://images.unsplash.com/photo-1622286342621-4bd786c2447c?auto=format&fit=crop&w=150&q=80"
                  alt="Textured Crop"
                  className="w-16 h-16 rounded-xl object-cover border border-slate-700"
                />
                <div>
                  <h4 className="text-sm font-bold text-white">Textured Crop (HS01)</h4>
                  <p className="text-xs text-slate-400">Classified: Oval Face • Wavy Texture</p>
                  <span className="text-[11px] text-indigo-400 font-semibold">Mapped to Salon Precision Cut</span>
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Stylists view the client's AI recommended cut and reference photos right at their station.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* How It Works (3-Step Standard Process) */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
            Simple Workflow
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">How SalonFlow Works</h2>
          <p className="text-xs sm:text-sm text-slate-400">
            From discovering your ideal haircut to walking out with zero waiting downtime.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          {/* Step 1 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-extrabold text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-white">AI Consultation</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Upload a front-facing portrait. Our vision model classifies face symmetry, cheekbone structure, and hair density to recommend styles.
            </p>
          </div>

          {/* Step 2 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-extrabold text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-white">Live Virtual Queue</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Join the live queue online or via walk-in QR scan. The system calculates wait time dynamically based on active stylists and queue depth.
            </p>
          </div>

          {/* Step 3 */}
          <div className="p-6 rounded-2xl bg-slate-900/50 border border-slate-800 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center font-extrabold text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-white">Zero-Wait Styling</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Get in-app alerts when you are 2 customers away. Arrive at the salon, take your chair immediately, and rate your experience afterwards.
            </p>
          </div>

        </div>
      </section>

      {/* Featured Services & Pricing Preview */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Premium Catalog</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">Salon Services & Pricing</h2>
          </div>
          <Link
            href="/services"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View Full Service Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {DEMO_SERVICES.slice(0, 3).map((srv) => (
            <div
              key={srv.id}
              className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider">{srv.category}</span>
                    <h3 className="text-base font-bold text-white mt-0.5">{srv.name}</h3>
                  </div>
                  <span className="text-base font-extrabold text-indigo-300 font-mono">₹{srv.price}</span>
                </div>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">{srv.description}</p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  {srv.durationMinutes} mins
                </span>
                <Link
                  href={isLoggedIn ? `/booking?serviceId=${srv.id}` : `/login?redirect=/booking?serviceId=${srv.id}`}
                  className="text-xs font-bold text-indigo-400 hover:text-indigo-300"
                >
                  Book Service →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Salon Location & Business Hours (Only show if salon is registered) */}
      {firstSalon && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-semibold mb-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Studio Open Today</span>
              </div>
              <h3 className="text-xl font-bold text-white">{firstSalon.name}</h3>
              <p className="text-xs text-slate-400 mt-1">{firstSalon.address}</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Hours: {firstSalon.openingTime} – {firstSalon.closingTime} {firstSalon.phone ? `• Tel: ${firstSalon.phone}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href={isLoggedIn ? '/home' : '/register'}
                className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-all shadow-md shadow-indigo-600/20"
              >
                {isLoggedIn ? 'Book Appointment' : 'Join Queue / Sign Up'}
              </Link>
            </div>
          </div>
        </section>
      )}

    </div>
  );
}
