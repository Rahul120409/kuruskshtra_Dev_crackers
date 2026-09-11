'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { QrCode, X, Sparkles, ArrowRight, CheckCircle2, Zap } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

interface WalkinQrModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WalkinQrModal: React.FC<WalkinQrModalProps> = ({ isOpen, onClose }) => {
  const router = useRouter();
  const { joinLiveQueue } = useCustomer();
  const [isJoining, setIsJoining] = useState(false);

  if (!isOpen) return null;

  const handleQuickJoin = async () => {
    setIsJoining(true);
    try {
      // Default to Signature Haircut for quick walk-in
      await joinLiveQueue('srv-02');
      router.push('/queue');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsJoining(false);
    }
  };

  const handleWithAI = () => {
    router.push('/ai-recommend');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/75 backdrop-blur-md"
        onClick={onClose} 
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-sm rounded-2xl bg-slate-950 border border-amber-500/30 p-6 shadow-2xl z-10 text-center">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900"
        >
          <X className="w-4 h-4" />
        </button>

        {/* QR Visual */}
        <div className="mx-auto w-40 h-40 p-3 rounded-2xl bg-white flex flex-col items-center justify-center shadow-lg relative my-3">
          <div className="w-full h-full border-2 border-dashed border-zinc-900 rounded-xl flex flex-col items-center justify-center p-2 text-zinc-900">
            <QrCode className="w-20 h-20 text-slate-950 mb-1" />
            <span className="text-[10px] font-mono font-bold tracking-widest uppercase">SALONFLOW-QR-01</span>
          </div>
          <div className="absolute -bottom-2.5 px-2.5 py-0.5 rounded-full bg-amber-500 text-black text-[10px] font-bold shadow">
            Koregaon Park Pune
          </div>
        </div>

        <h3 className="text-lg font-bold text-white mt-4">Salon Walk-In Scanner</h3>
        <p className="text-xs text-zinc-400 mt-1">
          Scan verified! Check in instantly to secure your spot in the live queue.
        </p>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={handleQuickJoin}
            disabled={isJoining}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 transition-all"
          >
            <Zap className="w-4 h-4 fill-slate-950" />
            {isJoining ? 'Securing Token...' : '1-Tap Fast Check-In'}
          </button>

          <button
            onClick={handleWithAI}
            className="w-full py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700/80 text-xs font-semibold text-amber-300 flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Take Quick AI Selfie First
          </button>
        </div>
      </div>
    </div>
  );
};
