'use client';

import React, { useState, useEffect } from 'react';
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

export default function Home() {
  const { isLoggedIn, user } = useCustomer();
  const [firstSalon, setFirstSalon] = useState<Salon | null>(null);
  const [activePortal, setActivePortal] = useState<'customer' | 'admin'>('customer');

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

  return (
    <div className="space-y-20 pb-16">
      {/* Portal Switcher Bar */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="hidden sm:inline">SalonFlow Dual-Engine (Customer & Admin Operations)</span>
        </div>
        <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/90 border border-slate-800 text-xs shadow-inner">
          <button
            type="button"
            onClick={() => setActivePortal('customer')}
            className="px-3 py-1 rounded-lg font-semibold transition-all cursor-pointer bg-indigo-600 text-white shadow-sm"
          >
            Customer View
          </button>
          <button
            type="button"
            onClick={() => setActivePortal('admin')}
            className="px-3 py-1 rounded-lg font-semibold transition-all flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-amber-300"
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
                  onClick={() => setActivePortal('admin')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-amber-500/30 text-amber-300 hover:text-amber-200 font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-amber-400" />
                  <span>Admin Portal</span>
                </button>
              </>
            )}
          </div>

          <div className="pt-4">
            <Link
              href="/ai-recommend"
              className="text-xs font-semibold text-slate-400 hover:text-indigo-400 inline-flex items-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Or try the AI Hairstyle Consultation directly</span>
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
