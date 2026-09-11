'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, Shield, ArrowRight, Scissors } from 'lucide-react';
import CustomerHomePage from './home/page';
import AdminPortal from './admin/page';

export { default as AIHairstyleConsultationPage } from './ai-recommend/page';

export default function Home() {
  const [activePortal, setActivePortal] = useState<'customer' | 'admin'>('customer');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || params.get('admin') === 'true' || params.get('view') === 'admin') {
        setActivePortal('admin');
      }
    }
  }, []);

  if (activePortal === 'admin') {
    return (
      <div>
        <div className="bg-slate-950 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 sticky top-20 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">SalonFlow AI Enterprise Admin Portal</span>
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

  return (
    <div>
      {/* Portal Switcher & AI Highlight Banner */}
      <div className="w-full bg-[#0d1322] border-b border-[#1e293b] py-2.5 px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs">
        
        {/* Left: AI Feature Announcement */}
        <Link
          href="/ai-recommend"
          className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
        >
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500" />
          </span>
          <span className="font-bold text-amber-300">New: Person 3 AI Studio</span>
          <span className="text-slate-400 hidden md:inline">— Real-time Face Consultation, Virtual Try-On &amp; Congestion Intelligence</span>
          <span className="text-amber-400 font-semibold group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
            <span>Launch Studio</span>
            <ArrowRight className="w-3 h-3" />
          </span>
        </Link>

        {/* Right: Portal Quick Selectors */}
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-900 border border-slate-700/80 text-xs shadow-inner gap-1">
          <button
            type="button"
            onClick={() => setActivePortal('customer')}
            className="px-3 py-1 rounded-lg font-bold transition-all cursor-pointer bg-amber-500 text-slate-950 shadow-sm"
          >
            Customer Atelier
          </button>
          <Link
            href="/ai-recommend"
            className="px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-amber-300"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI Studio</span>
          </Link>
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className="px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-slate-300 hover:text-amber-300"
          >
            <Shield className="w-3 h-3 text-amber-400" />
            <span>Admin</span>
          </button>
        </div>
      </div>

      {/* Customer Home Page Experience */}
      <CustomerHomePage />
    </div>
  );
}
