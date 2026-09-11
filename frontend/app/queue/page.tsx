'use client';

import React, { useState } from 'react';
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
  MapPin,
  Phone,
  ShieldCheck
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

export default function LiveQueuePage() {
  const { 
    activeToken, 
    advanceDemoQueue, 
    resetDemoQueue, 
    cancelActiveToken,
    isLoadingToken 
  } = useCustomer();

  const [isAdvancing, setIsAdvancing] = useState(false);

  const handleStepAdvance = async () => {
    setIsAdvancing(true);
    await advanceDemoQueue();
    setIsAdvancing(false);
  };

  if (isLoadingToken) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-24 text-center">
        <div className="w-12 h-12 rounded-full border-2 border-amber-500 border-t-transparent animate-spin mx-auto mb-4" />
        <p className="text-xs text-zinc-400">Loading your live queue status...</p>
      </div>
    );
  }

  if (!activeToken) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto text-zinc-500">
          <Clock className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">No Active Queue Token</h2>
        <p className="text-xs text-zinc-400">
          You are not currently in any salon queue. Browse our services or take an AI style match to get a token.
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Link
            href="/home?joinQueue=true"
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-amber-500/20"
          >
            <Scissors className="w-4 h-4" />
            <span>Join Live Queue (Choose Haircut & Token)</span>
          </Link>
          <Link
            href="/ai-recommend"
            className="w-full py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold text-xs border border-zinc-700/60 flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI Style Match & Recommendations</span>
          </Link>
          <button
            onClick={resetDemoQueue}
            className="w-full py-2 rounded-xl text-zinc-400 hover:text-zinc-200 text-xs transition-all"
          >
            Load Sample Token #108
          </button>
        </div>
      </div>
    );
  }

  const isTurnApproaching = activeToken.position === 2 && activeToken.status === 'WAITING';
  const isTurnCalled = activeToken.status === 'CALLED';
  const isInService = activeToken.status === 'IN_SERVICE';
  const isCompleted = activeToken.status === 'COMPLETED';

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Top Status Alert (LLD Section 12) */}
      {isTurnCalled ? (
        <div className="rounded-2xl bg-emerald-500/15 border-2 border-emerald-500/60 p-5 text-emerald-300 emerald-glow-shadow animate-pulse-glow flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">IT'S YOUR TURN! (Token #{activeToken.tokenNumber})</h3>
              <p className="text-xs text-emerald-200 mt-0.5">
                Please proceed immediately to <strong>Station {activeToken.stationNumber || 3}</strong>. Stylist <strong>{activeToken.staffName || 'Vikram Joshi'}</strong> is ready.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider">
            Ready
          </span>
        </div>
      ) : isTurnApproaching ? (
        <div className="rounded-2xl bg-amber-500/15 border-2 border-amber-500/50 p-5 text-amber-300 gold-glow-shadow flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">2 CUSTOMERS AWAY!</h3>
              <p className="text-xs text-amber-200 mt-0.5">
                You are next up soon. Please stay near the lounge or front reception.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full bg-amber-500 text-slate-950 text-xs font-bold uppercase tracking-wider">
            Heads Up
          </span>
        </div>
      ) : isCompleted ? (
        <div className="rounded-2xl bg-purple-500/15 border border-purple-500/40 p-5 text-purple-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white">Service Completed!</h3>
              <p className="text-xs text-purple-300 mt-0.5">
                Thank you for visiting {activeToken?.salonName || 'our salon'}. Please take 15 seconds to review your stylist.
              </p>
            </div>
          </div>
          <Link
            href="/feedback"
            className="px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-500/20"
          >
            <span>Rate Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : null}

      {/* Main Token Visual Card */}
      <div className="rounded-3xl glass-panel-gold p-6 sm:p-8 border border-amber-500/30 gold-glow-shadow relative overflow-hidden">
        {/* Background ambient pattern */}
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pb-6 border-b border-amber-500/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                LIVE QUEUE PASS
              </span>
              <span className="text-xs text-zinc-400">• {activeToken?.salonName || 'Live Salon'}</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white mt-1.5">
              {activeToken.serviceName || 'Precision Haircut'}
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Barber: <span className="text-zinc-200 font-semibold">{activeToken.staffName || 'Vikram Joshi'}</span> • Station: {activeToken.stationNumber || 3}
            </p>
          </div>

          {/* Big Token Badge */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-950/80 border-2 border-amber-500/40 min-w-[130px] shadow-lg shadow-amber-500/10">
            <span className="text-[10px] font-mono tracking-widest uppercase font-bold text-amber-400">YOUR TOKEN</span>
            <span className="text-4xl font-extrabold text-white tracking-tight mt-0.5 font-mono">
              #{activeToken.tokenNumber}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 uppercase ${
              isTurnCalled 
                ? 'bg-emerald-500 text-black' 
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {activeToken.status}
            </span>
          </div>
        </div>

        {/* Dynamic Position & Estimated Wait Counter */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 my-6">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block uppercase font-medium">Position Ahead</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-amber-400 font-mono">
                {activeToken.position > 0 ? `${activeToken.position}` : '0'}
              </span>
              <span className="text-xs text-zinc-400">{activeToken.position > 0 ? 'customers ahead' : 'Being Served'}</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-zinc-800">
            <span className="text-[11px] text-zinc-400 block uppercase font-medium">Estimated Wait</span>
            <div className="flex items-baseline gap-1.5 mt-1">
              <span className="text-2xl font-extrabold text-white font-mono">
                {activeToken.estimatedWait}
              </span>
              <span className="text-xs text-zinc-400">minutes</span>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-4 rounded-2xl bg-slate-950/60 border border-zinc-800 flex flex-col justify-between">
            <span className="text-[11px] text-zinc-400 block uppercase font-medium">Queue Status</span>
            <span className="text-sm font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              {activeToken.status === 'WAITING' ? 'Moving Smoothly' : activeToken.status}
            </span>
          </div>
        </div>

        {/* State Machine Step Visualizer (LLD Section 10) */}
        <div className="pt-2">
          <span className="text-xs font-semibold text-zinc-400 block mb-2.5">Queue Lifecycle Progress:</span>
          <div className="grid grid-cols-4 gap-2">
            {[
              { key: 'WAITING', label: '1. In Queue' },
              { key: 'CALLED', label: '2. Called' },
              { key: 'IN_SERVICE', label: '3. In Chair' },
              { key: 'COMPLETED', label: '4. Done' },
            ].map((step, idx) => {
              const statusWeights: Record<string, number> = {
                WAITING: 1,
                CALLED: 2,
                IN_SERVICE: 3,
                COMPLETED: 4,
              };
              const currentWeight = statusWeights[activeToken.status] || 1;
              const stepWeight = idx + 1;
              const isPastOrCurrent = stepWeight <= currentWeight;
              const isCurrent = stepWeight === currentWeight;

              return (
                <div
                  key={step.key}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-amber-500 text-slate-950 font-bold border-amber-400 shadow-md shadow-amber-500/20'
                      : isPastOrCurrent
                      ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                      : 'bg-zinc-950/50 text-zinc-500 border-zinc-800'
                  }`}
                >
                  <p className="text-[11px] whitespace-nowrap">{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* QR Code & Desk Instructions */}
        <div className="mt-6 pt-6 border-t border-amber-500/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-white text-slate-950 shadow">
              <QrCode className="w-12 h-12" />
            </div>
            <div>
              <p className="text-xs font-bold text-white">Digital Check-In QR</p>
              <p className="text-[11px] text-zinc-400 mt-0.5">Show this at front desk scanner on arrival.</p>
              <span className="text-[10px] font-mono text-amber-400 font-semibold">{activeToken.tokenId}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={cancelActiveToken}
              className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
            >
              Cancel Token
            </button>
            <button
              onClick={handleStepAdvance}
              disabled={isAdvancing}
              className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
              title="Simulate queue advance for winning demo"
            >
              <FastForward className="w-3.5 h-3.5" />
              <span>{isAdvancing ? 'Updating...' : 'Advance Queue (Demo)'}</span>
            </button>
          </div>
        </div>

      </div>

      {/* Selected Hairstyle Reference (if booked via AI) */}
      {activeToken.selectedHairstyleName && (
        <div className="rounded-2xl bg-zinc-900/60 border border-zinc-800 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400">Attached AI Consultation Style</span>
              <p className="text-sm font-bold text-white mt-0.5">{activeToken.selectedHairstyleName}</p>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-mono">ID: {activeToken.selectedHairstyleId}</span>
        </div>
      )}

      {/* Salon Details & Location */}
      <div className="p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-400 gap-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 flex-shrink-0" />
          <span>{activeToken?.salonName ? `${activeToken.salonName} • Pune` : 'Verified Salon Location'}</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>Verified Queue Pass • Official Booking</span>
        </div>
      </div>

    </div>
  );
}
