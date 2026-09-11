'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Play,
  RotateCcw,
  FastForward,
  Sparkles,
  CheckCircle2,
  Clock,
  Users,
  X,
  MessageSquareHeart,
  Server
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

interface DemoControlDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DemoControlDrawer: React.FC<DemoControlDrawerProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { activeToken, advanceDemoQueue, resetDemoQueue } = useCustomer();

  if (!isOpen) return null;

  const handleStep1AI = () => {
    router.push('/ai-recommend');
    onClose();
  };

  const handleStep2Queue = () => {
    router.push('/queue');
    onClose();
  };

  const handleAdvance = async () => {
    await advanceDemoQueue();
    router.push('/queue');
  };

  const handleFeedback = () => {
    router.push('/feedback');
    onClose();
  };

  const handleReset = async () => {
    await resetDemoQueue();
    router.push('/');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-amber-500/20 p-6 flex flex-col shadow-2xl z-10 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Play className="w-5 h-5 fill-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Winning Demo Script</h2>
              <p className="text-xs text-zinc-400">Section 20 LLD Demo Flow Runner</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current State Summary */}
        <div className="my-4 p-4 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
            <span className="font-semibold text-zinc-300">Live Active Token Status:</span>
            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] bg-amber-500/10 text-amber-300 border border-amber-500/30">
              {activeToken ? activeToken.status : 'NO TOKEN'}
            </span>
          </div>
          {activeToken ? (
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-400">Token Number:</span>
                <span className="font-mono text-white font-bold">#{activeToken.tokenNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Queue Position:</span>
                <span className="text-amber-400 font-semibold">{activeToken.position > 0 ? `${activeToken.position}th in line` : 'Currently Serving'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Estimated Wait:</span>
                <span className="text-zinc-200">{activeToken.estimatedWait} minutes</span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No active token. Join queue or run Step 1.</p>
          )}
        </div>

        {/* Script Steps */}
        <div className="flex-1 space-y-3">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-zinc-400">Script Flow Actions</h3>

          {/* Step 1 */}
          <button
            onClick={handleStep1AI}
            className="w-full p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-amber-300">AI Selfie & Style Match</p>
                <p className="text-xs text-zinc-400">Detect face shape & get 3 recommendations</p>
              </div>
            </div>
            <Sparkles className="w-4 h-4 text-amber-400 opacity-70 group-hover:opacity-100" />
          </button>

          {/* Step 2 */}
          <button
            onClick={handleStep2Queue}
            className="w-full p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center font-bold text-xs">
                2
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-amber-300">View Token #108 in Live Queue</p>
                <p className="text-xs text-zinc-400">Position 4 • 24 mins estimated wait</p>
              </div>
            </div>
            <Clock className="w-4 h-4 text-amber-400 opacity-70 group-hover:opacity-100" />
          </button>

          {/* Step 3 */}
          <button
            onClick={handleAdvance}
            className="w-full p-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-black flex items-center justify-center font-bold text-xs">
                3
              </div>
              <div>
                <p className="text-sm font-bold text-amber-300">Advance Queue State</p>
                <p className="text-xs text-amber-200/80">Simulate customer completion (Pos 4 → 2 → CALLED)</p>
              </div>
            </div>
            <FastForward className="w-4 h-4 text-amber-400" />
          </button>

          {/* Step 4 */}
          <button
            onClick={handleFeedback}
            className="w-full p-3 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 hover:border-amber-500/40 text-left transition-all flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                4
              </div>
              <div>
                <p className="text-sm font-semibold text-white group-hover:text-emerald-300">Customer Feedback & Rating</p>
                <p className="text-xs text-zinc-400">Post-service evaluation & score submit</p>
              </div>
            </div>
            <MessageSquareHeart className="w-4 h-4 text-emerald-400 opacity-70 group-hover:opacity-100" />
          </button>

          {/* Reset Demo */}
          <div className="pt-4 border-t border-zinc-800">
            <button
              onClick={handleReset}
              className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/60 text-xs font-semibold text-zinc-300 hover:text-white flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Demo to Initial Seed State
            </button>
          </div>
        </div>

        {/* Backend Target Info */}
        <div className="mt-4 p-3 rounded-xl bg-black/40 border border-zinc-800 flex items-center justify-between text-[11px] text-zinc-400">
          <span className="flex items-center gap-1.5">
            <Server className="w-3.5 h-3.5 text-zinc-500" />
            Target Backend:
          </span>
          <span className="font-mono text-zinc-300">{process.env.NEXT_PUBLIC_API_BASE_URL || 'Configured via .env'}</span>
        </div>
      </div>
    </div>
  );
};
