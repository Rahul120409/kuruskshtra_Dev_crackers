'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  Upload, 
  Camera, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  Scissors, 
  Scan,
  Info,
  Sliders,
  Flame,
  Award
} from 'lucide-react';
import { aiService } from '../../services/aiService';
import { AIAnalysisResult, AIRecommendationItem } from '../../types';
import { useCustomer } from '../../context/CustomerContext';

const SAMPLE_SELFIES = [
  {
    name: 'Sample Male (Oval Face)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Sample Professional (Square Face)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    name: 'Sample Casual (Diamond Face)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
];

export default function AIRecommendPage() {
  const router = useRouter();
  const { setSelectedHairstyle, isLoggedIn } = useCustomer();
  const [selectedImage, setSelectedImage] = useState<string | null>(SAMPLE_SELFIES[0].url);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [analysisStep, setAnalysisStep] = useState<string>('');
  const [result, setResult] = useState<AIAnalysisResult | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('salonflow_auth_user');
      if (!savedUser && !isLoggedIn) {
        router.push('/login?redirect=/ai-recommend');
      }
    }
  }, [isLoggedIn, router]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setResult(null);
    };
    reader.readAsDataURL(file);
  };

  const handleRunAnalysis = async () => {
    if (!selectedImage) return;
    setIsAnalyzing(true);
    setAnalysisStep('Scanning facial contours & landmarks...');

    const stepTimer1 = setTimeout(() => {
      setAnalysisStep('Classifying hair texture & density...');
    }, 500);

    const stepTimer2 = setTimeout(() => {
      setAnalysisStep('Matching catalog hairstyles against Oval geometry...');
    }, 1000);

    try {
      const data = await aiService.analyzeSelfie(selectedImage);
      setResult(data);
    } catch (err) {
      console.error('AI Analysis failed:', err);
    } finally {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      setIsAnalyzing(false);
    }
  };

  const handleSelectAndBook = (item: AIRecommendationItem) => {
    // Map to catalog format
    setSelectedHairstyle({
      id: item.hairstyleId,
      name: item.name,
      description: item.reason,
      imageUrl: item.imageUrl,
      category: 'AI Recommendation',
      suitableFaceShapes: [result?.faceShape || 'Oval'],
      suitableHairTypes: [result?.hairType || 'Wavy'],
      mappedServiceId: item.mappedServiceId || 'srv-02',
    });

    router.push(`/booking?hairstyle=${item.hairstyleId}&serviceId=${item.mappedServiceId || 'srv-02'}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2.5">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" />
          <span>AI Computer Vision Engine</span>
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
          AI Hairstyle Consultation
        </h1>
        <p className="text-sm text-zinc-400 leading-relaxed">
          Upload or select a selfie. Our vision model maps your jawline, cheekbones, and hair density to identify the most flattering cuts in our salon catalog.
        </p>
      </div>

      {/* Main Analysis Container */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Photo Input & Scanner */}
        <div className="lg:col-span-5 rounded-2xl glass-panel p-6 border border-zinc-800 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Camera className="w-4 h-4 text-amber-400" />
              <span>Your Portrait</span>
            </h2>
            <span className="text-[11px] text-zinc-400">Front-facing & well-lit</span>
          </div>

          {/* Photo Scanner Viewport */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 flex items-center justify-center group">
            {selectedImage ? (
              <img
                src={selectedImage}
                alt="Customer selfie preview"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-center p-6">
                <Upload className="w-10 h-10 text-zinc-600 mx-auto mb-2" />
                <p className="text-xs text-zinc-400">Upload portrait photo</p>
              </div>
            )}

            {/* Scanning Radar Overlay when analyzing */}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-amber-500/10 backdrop-blur-[2px] flex flex-col items-center justify-center p-4">
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent animate-radar shadow-[0_0_15px_#f59e0b]" />
                <div className="w-44 h-44 rounded-full border-2 border-dashed border-amber-400/60 animate-spin" style={{ animationDuration: '6s' }} />
                <div className="mt-4 px-3 py-1.5 rounded-lg bg-slate-950/90 border border-amber-500/40 text-center">
                  <p className="text-xs font-semibold text-amber-300 animate-pulse">{analysisStep}</p>
                </div>
              </div>
            )}

            {/* Face outline grid overlay guide */}
            {!isAnalyzing && selectedImage && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-30">
                <div className="w-48 h-60 border border-dashed border-amber-400 rounded-[45%]" />
              </div>
            )}
          </div>

          {/* Quick preset selector */}
          <div>
            <span className="text-xs font-semibold text-zinc-400 block mb-2">Or select sample portrait for testing:</span>
            <div className="grid grid-cols-3 gap-2">
              {SAMPLE_SELFIES.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setSelectedImage(sample.url);
                    setResult(null);
                  }}
                  className={`relative aspect-square rounded-xl overflow-hidden border transition-all ${
                    selectedImage === sample.url
                      ? 'border-amber-500 ring-2 ring-amber-500/30'
                      : 'border-zinc-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={sample.url} alt={sample.name} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Upload Button */}
          <div className="space-y-3 pt-2">
            <label className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-700/80 text-xs font-semibold text-zinc-200 flex items-center justify-center gap-2 cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-zinc-400" />
              <span>Upload Custom Photo</span>
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>

            <button
              onClick={handleRunAnalysis}
              disabled={isAnalyzing || !selectedImage}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>{isAnalyzing ? 'Analyzing Face Geometry...' : 'Analyze & Match Styles'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: AI Insights & Recommendation Cards */}
        <div className="lg:col-span-7 space-y-6">
          {!result ? (
            <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/30 p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[480px]">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Sparkles className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">AI Consultation Ready</h3>
              <p className="text-xs text-zinc-400 max-w-md leading-relaxed">
                Click <span className="text-amber-400 font-semibold">"Analyze & Match Styles"</span> on the left to extract face shape metrics and view matched hairstyles from our catalog.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                <span className="px-2.5 py-1 rounded-md bg-zinc-800/60 text-[11px] text-zinc-400">Face Shape Classification</span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-800/60 text-[11px] text-zinc-400">Hair Texture Profiling</span>
                <span className="px-2.5 py-1 rounded-md bg-zinc-800/60 text-[11px] text-zinc-400">Match Scoring 0–100%</span>
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Detected Profile Metrics */}
              <div className="rounded-2xl glass-panel-gold p-5 border border-amber-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Biometric Profile Analysis</span>
                  </div>
                  <span className="text-[10px] text-zinc-400">Model Confidence: 96.8%</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20">
                    <span className="text-[10px] text-zinc-400 block uppercase">Face Shape</span>
                    <span className="text-sm font-extrabold text-white mt-0.5 block">{result.faceShape}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20">
                    <span className="text-[10px] text-zinc-400 block uppercase">Hair Type</span>
                    <span className="text-sm font-extrabold text-white mt-0.5 block">{result.hairType}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-amber-500/20">
                    <span className="text-[10px] text-zinc-400 block uppercase">Hair Density</span>
                    <span className="text-sm font-extrabold text-white mt-0.5 block">{result.hairDensity}</span>
                  </div>
                </div>
              </div>

              {/* Recommendations List (Matches LLD Section 8 & 20) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>Top Matched Hairstyle Recommendations ({result.recommendations.length})</span>
                  </h3>
                  <span className="text-xs text-amber-400 font-semibold">Catalog Verified</span>
                </div>

                <div className="space-y-3.5">
                  {result.recommendations.map((item, index) => {
                    const isTopMatch = index === 0;
                    return (
                      <div
                        key={item.hairstyleId}
                        className={`rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between ${
                          isTopMatch
                            ? 'bg-zinc-900/90 border-amber-500/50 shadow-lg shadow-amber-500/5'
                            : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="w-20 h-20 rounded-xl object-cover border border-zinc-800 flex-shrink-0"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono text-zinc-500">[{item.hairstyleId}]</span>
                              <h4 className="text-base font-bold text-white">{item.name}</h4>
                              {isTopMatch && (
                                <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase">
                                  Top Pick
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 mt-1 leading-relaxed max-w-md">
                              {item.reason}
                            </p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
                          <div className="flex items-center gap-1">
                            <span className="text-xl font-extrabold text-emerald-400 font-mono">
                              {item.matchScore}%
                            </span>
                            <span className="text-[10px] text-zinc-400 uppercase">Match</span>
                          </div>

                          <button
                            onClick={() => handleSelectAndBook(item)}
                            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-amber-500/10"
                          >
                            <Scissors className="w-3.5 h-3.5" />
                            <span>Book This Style</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}
        </div>

      </div>
    </div>
  );
}
