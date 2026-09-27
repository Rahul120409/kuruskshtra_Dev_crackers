'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bell, Sparkles, Volume2, X, ArrowRight, Zap, Scissors } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

export const QueueAlertBanner: React.FC = () => {
  const pathname = usePathname();
  const { activeToken } = useCustomer();
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  if (
    pathname === '/' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/salon')
  ) {
    return null;
  }
  if (!activeToken) return null;

  const isCalled = activeToken.status === 'CALLED';
  const isOneAway = activeToken.position === 1 && activeToken.status === 'WAITING';
  const isTwoAway = activeToken.position === 2 && activeToken.status === 'WAITING';

  if (!isCalled && !isOneAway && !isTwoAway) return null;

  const currentKey = `${activeToken.tokenId}_${activeToken.status}_${activeToken.position}`;
  if (dismissedKey === currentKey) return null;

  const title = isCalled
    ? `It's Your Turn! Token #${activeToken.tokenNumber} Called`
    : isOneAway
    ? `You're Next in Line! (Token #${activeToken.tokenNumber})`
    : `You're 2 Numbers Away (Token #${activeToken.tokenNumber})`;

  const badgeText = isCalled 
    ? 'Chair Ready' 
    : isOneAway 
    ? '1 Turn Away' 
    : '2 Turns Away';

  const message = isCalled
    ? `Your chair is ready at ${activeToken.salonName || 'the atelier'}. Please take your seat now.`
    : isOneAway
    ? "Only 1 client ahead of you! Please proceed to your styling station."
    : "Only 2 turns remain! Please make your way towards the styling lounge.";

  return (
    <div className="fixed top-20 sm:top-22 left-1/2 -translate-x-1/2 z-50 w-full max-w-2xl px-4 animate-in slide-in-from-top duration-300 pointer-events-auto">
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl backdrop-blur-2xl p-3.5 sm:p-4 shadow-2xl border transition-all ${
          isCalled
            ? 'bg-white/95 dark:bg-[#0d101a]/95 border-emerald-500/50 shadow-emerald-500/15 ring-1 ring-emerald-500/30'
            : isOneAway
            ? 'bg-white/95 dark:bg-[#0d101a]/95 border-amber-500/50 shadow-amber-500/20 ring-1 ring-amber-500/30'
            : 'bg-white/95 dark:bg-[#0d101a]/95 border-slate-200/90 dark:border-slate-800/90 shadow-slate-900/10'
        }`}
      >
        {/* Subtle accent glow line at top */}
        <div 
          className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            isCalled 
              ? 'from-emerald-500 via-teal-400 to-emerald-600' 
              : 'from-amber-400 via-amber-500 to-amber-600'
          }`}
        />

        <div className="flex items-center justify-between gap-3 sm:gap-4">
          
          {/* Left: Glowing Icon & Text Content */}
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
                isCalled
                  ? 'bg-gradient-to-tr from-emerald-500 to-emerald-600 text-white shadow-emerald-500/30 animate-pulse'
                  : isOneAway
                  ? 'bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 text-white shadow-amber-500/30 animate-pulse'
                  : 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
              }`}
            >
              {isCalled ? (
                <Scissors className="w-5 h-5" />
              ) : isOneAway ? (
                <Zap className="w-5 h-5" />
              ) : (
                <Sparkles className="w-5 h-5" />
              )}
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                  {title}
                </span>
                
                <span
                  className={`whitespace-nowrap px-2.5 py-0.5 rounded-full text-[10px] font-mono font-black uppercase tracking-wider shadow-xs ${
                    isCalled
                      ? 'bg-emerald-500 text-slate-950'
                      : isOneAway
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white'
                      : 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {badgeText}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 truncate font-medium">
                {message}
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/queue"
              className="h-9 px-3.5 sm:px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white text-xs font-extrabold shadow-md shadow-amber-500/20 active:scale-95 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
            >
              <span>Live Queue</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            <button
              type="button"
              onClick={() => setDismissedKey(currentKey)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Dismiss alert"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};
