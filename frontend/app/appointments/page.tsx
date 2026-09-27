'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Calendar,
  Clock,
  Scissors,
  Ticket,
  MapPin,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Plus,
  Store,
  Banknote,
  Smartphone,
  Star,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Zap,
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { Appointment, Salon } from '../../types';
import { salonService } from '../../services/salonService';

// ─── Status Config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
  label: string;
  pill: string;
  dot?: string;
  icon: React.ReactNode;
}> = {
  CONFIRMED: {
    label: 'Confirmed',
    pill: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30',
    dot: 'bg-emerald-500 animate-pulse',
    icon: <CheckCircle2 className="w-3 h-3" />,
  },
  CHECKED_IN: {
    label: 'Checked In',
    pill: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30',
    dot: 'bg-amber-500 animate-pulse',
    icon: <Zap className="w-3 h-3" />,
  },
  COMPLETED: {
    label: 'Completed',
    pill: 'bg-slate-200 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700',
    icon: <CheckCircle2 className="w-3 h-3 text-slate-400" />,
  },
  CANCELLED: {
    label: 'Cancelled',
    pill: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/25',
    icon: <XCircle className="w-3 h-3" />,
  },
};

function getStatusCfg(status: string) {
  return STATUS_CONFIG[status] ?? STATUS_CONFIG['CONFIRMED'];
}

// ─── Page ────────────────────────────────────────────────────────────────────
export default function AppointmentsPage() {
  const router = useRouter();
  const {
    user,
    isLoggedIn,
    appointments,
    cancelAppointment,
    rateAppointment,
    refreshAppointments,
  } = useCustomer();

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [selectedAptToCancel, setSelectedAptToCancel] = useState<Appointment | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Rating modal state
  const [selectedAptToRate, setSelectedAptToRate] = useState<Appointment | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingSuccessToast, setRatingSuccessToast] = useState<string | null>(null);

  const [salons, setSalons] = useState<Salon[]>([]);

  // Auth guard
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('salonflow_auth_user');
      if (!savedUser && !isLoggedIn) {
        router.push('/login?redirect=/appointments');
      }
    }
  }, [isLoggedIn, router]);

  useEffect(() => {
    refreshAppointments();
    salonService.getSalons().then((list) => setSalons(list || []));
  }, []);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (filter === 'ALL') return true;
      if (filter === 'ACTIVE') return apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN';
      if (filter === 'COMPLETED') return apt.status === 'COMPLETED';
      if (filter === 'CANCELLED') return apt.status === 'CANCELLED';
      return true;
    });
  }, [appointments, filter]);

  const activeCount = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAppointments();
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const handleCancel = async (aptId: string) => {
    setCancellingId(aptId);
    try {
      await cancelAppointment(aptId);
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleOpenRateModal = (apt: Appointment) => {
    setSelectedAptToRate(apt);
    setRatingScore(apt.rating || 5);
    setFeedbackComment(apt.feedback || '');
    setSelectedTags([]);
  };

  const handleToggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmitRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAptToRate) return;
    setIsSubmittingRating(true);
    try {
      const combinedFeedback =
        selectedTags.length > 0
          ? feedbackComment
            ? `${feedbackComment} [${selectedTags.join(', ')}]`
            : selectedTags.join(', ')
          : feedbackComment;
      await rateAppointment(selectedAptToRate.id, ratingScore, combinedFeedback);
      setRatingSuccessToast(
        `Thank you! Your ${ratingScore}★ review for ${selectedAptToRate.salonName || 'the salon'} was submitted.`
      );
      setTimeout(() => setRatingSuccessToast(null), 5000);
      setSelectedAptToRate(null);
    } catch (err) {
      console.error('Failed to submit rating:', err);
    } finally {
      setIsSubmittingRating(false);
    }
  };

  const handleOpenBooking = (salonToBook?: Salon) => {
    const target = salonToBook || (salons.length > 0 ? salons[0] : null);
    if (target) {
      const area = (target as any).area || target.city || target.address || '';
      const wait = target.currentWaitMinutes || 18;
      router.push(
        `/booking?salonId=${encodeURIComponent(target.id)}&salonName=${encodeURIComponent(target.name)}&area=${encodeURIComponent(area)}&wait=${wait}`
      );
    } else {
      router.push('/booking');
    }
  };

  // ─── RENDER ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#08090d] text-slate-900 dark:text-white transition-colors duration-200 pb-28 relative overflow-x-hidden">

      {/* Ambient glow — subtle in light, visible in dark */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-72 bg-amber-500/5 dark:bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-10 space-y-7">

        {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="space-y-1.5">
            {/* Breadcrumb */}
            <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
              <Link href="/home" className="hover:text-amber-500 transition-colors">Salons</Link>
              <ChevronRight className="w-3 h-3" />
              <span className="text-slate-700 dark:text-slate-300 font-semibold">My Appointments</span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                  My Appointments
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {user?.name
                    ? `${user.name}'s booking history & live queue passes`
                    : 'Your booking history & live queue passes'}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer disabled:opacity-50 shadow-sm"
              title="Refresh appointments"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-amber-500' : ''}`} />
            </button>
            <button
              onClick={() => handleOpenBooking()}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Book Haircut</span>
            </button>
          </div>
        </div>

        {/* ── STATS STRIP ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              label: 'Active',
              count: activeCount,
              text: 'text-emerald-600 dark:text-emerald-400',
              bg: 'bg-white dark:bg-emerald-500/10 border-emerald-500/25',
              dot: 'bg-emerald-500 animate-pulse',
            },
            {
              label: 'Completed',
              count: completedCount,
              text: 'text-slate-600 dark:text-slate-300',
              bg: 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700',
              dot: 'bg-slate-400 dark:bg-slate-500',
            },
            {
              label: 'Cancelled',
              count: cancelledCount,
              text: 'text-rose-600 dark:text-rose-400',
              bg: 'bg-white dark:bg-rose-500/10 border-rose-500/20',
              dot: 'bg-rose-500',
            },
          ].map((stat) => (
            <div key={stat.label} className={`rounded-2xl border p-4 shadow-sm ${stat.bg} flex items-center gap-3`}>
              <span className={`w-2 h-2 rounded-full shrink-0 ${stat.dot}`} />
              <div>
                <span className={`text-2xl font-black font-mono ${stat.text}`}>{stat.count}</span>
                <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-bold mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTER TABS ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {([
            { key: 'ALL', label: `All (${appointments.length})` },
            { key: 'ACTIVE', label: `Active (${activeCount})` },
            { key: 'COMPLETED', label: `Completed (${completedCount})` },
            { key: 'CANCELLED', label: `Cancelled (${cancelledCount})` },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all border whitespace-nowrap cursor-pointer ${
                filter === tab.key
                  ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40 shadow-inner'
                  : 'bg-white dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── APPOINTMENT CARDS ────────────────────────────────────────────── */}
        {filteredAppointments.length > 0 ? (
          <div className="space-y-5">
            {filteredAppointments.map((apt) => {
              const isLive = apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN';
              const isCompleted = apt.status === 'COMPLETED';
              const isCancelled = apt.status === 'CANCELLED';
              const cfg = getStatusCfg(apt.status);

              return (
                <div
                  key={apt.id}
                  className={`relative rounded-3xl border overflow-hidden transition-all duration-200 shadow-sm ${
                    isLive
                      ? 'bg-white dark:bg-gradient-to-br dark:from-[#11141e] dark:via-[#0f1320] dark:to-[#0c1028] border-amber-500/40 dark:border-amber-500/30 shadow-amber-500/8 hover:border-amber-500/60 dark:hover:border-amber-500/50 hover:shadow-md hover:shadow-amber-500/10'
                      : isCancelled
                      ? 'bg-slate-50 dark:bg-[#0f1118]/80 border-slate-200 dark:border-slate-800/60 opacity-80 hover:opacity-100'
                      : 'bg-white dark:bg-[#11141e]/90 border-slate-200 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {/* Gold top accent line for active */}
                  {isLive && (
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/70 to-transparent" />
                  )}

                  <div className="p-5 sm:p-6 space-y-5">

                    {/* ── TOP: Salon + Status ─────────────────────────────── */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${
                          isLive
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400'
                            : 'bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/60 text-slate-400 dark:text-slate-500'
                        }`}>
                          <Store className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base font-bold text-slate-900 dark:text-white truncate">
                              {apt.salonName || 'SalonFlow Studio'}
                            </h3>
                            {apt.salonArea && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 uppercase tracking-wider whitespace-nowrap">
                                {apt.salonArea}
                              </span>
                            )}
                          </div>
                          {apt.salonAddress && (
                            <p className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0" />
                              <span className="truncate">{apt.salonAddress}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Status pill */}
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold self-start sm:self-auto whitespace-nowrap ${cfg.pill}`}>
                        {cfg.dot && <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />}
                        {cfg.label}
                        {apt.bookingType === 'WALK_IN' && isLive && (
                          <span className="ml-1 text-[9px] font-black uppercase bg-amber-500/20 text-amber-600 dark:text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-500/30">
                            Live Pass
                          </span>
                        )}
                      </span>
                    </div>

                    {/* ── DETAIL GRID ─────────────────────────────────────── */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                      {/* Service */}
                      <div className="col-span-2 md:col-span-1 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/80 dark:text-amber-500/70 block">
                          Service
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Scissors className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{apt.serviceName}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{apt.servicePrice}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>{apt.serviceDuration || 30} mins</span>
                        </div>
                      </div>

                      {/* Stylist */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/80 dark:text-amber-500/70 block">
                          Stylist
                        </span>
                        <div className="flex items-center gap-2">
                          <img
                            src={apt.staffAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                            alt={apt.staffName || 'Stylist'}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                          />
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {apt.staffName || 'First Available'}
                          </span>
                        </div>
                        <span className="text-[10px] text-amber-600 dark:text-amber-400 flex items-center gap-1 font-semibold">
                          <Star className="w-2.5 h-2.5 fill-amber-500 dark:fill-amber-400" />
                          Top Rated
                        </span>
                      </div>

                      {/* Schedule */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/80 dark:text-amber-500/70 block">
                          Schedule
                        </span>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{apt.appointmentDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{apt.appointmentTime}</span>
                        </div>
                      </div>

                      {/* Pass & Pay */}
                      <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/60 space-y-1.5">
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600/80 dark:text-amber-500/70 block">
                          Pass & Pay
                        </span>
                        {apt.tokenNumber ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 font-mono font-black text-sm">
                            <Ticket className="w-3 h-3" />
                            #{apt.tokenNumber}
                          </div>
                        ) : (
                          <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Reserved Slot</span>
                        )}
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                          {apt.paymentMethod?.includes('Counter') ? (
                            <Banknote className="w-3 h-3 text-emerald-500" />
                          ) : (
                            <Smartphone className="w-3 h-3 text-indigo-500" />
                          )}
                          <span className="truncate">{apt.paymentMethod || 'Pay at Counter'}</span>
                        </div>
                      </div>
                    </div>

                    {/* ── RATING SNIPPET ──────────────────────────────────── */}
                    {apt.rating && (
                      <div className="flex items-start justify-between gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="flex items-center gap-1 bg-amber-100 dark:bg-amber-500/20 px-2 py-1 rounded-lg font-bold text-xs text-amber-700 dark:text-amber-400 shrink-0">
                            <Star className="w-3 h-3 fill-amber-500 dark:fill-amber-400" />
                            {apt.rating}.0
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-amber-700 dark:text-amber-300 block">Your Review</span>
                            {apt.feedback ? (
                              <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-0.5 truncate">"{apt.feedback}"</p>
                            ) : (
                              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Rated {apt.rating} out of 5 stars.</p>
                            )}
                          </div>
                        </div>
                        <button
                          onClick={() => handleOpenRateModal(apt)}
                          className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 underline underline-offset-2 shrink-0 cursor-pointer"
                        >
                          Edit
                        </button>
                      </div>
                    )}

                    {/* ── BOTTOM ACTION BAR ───────────────────────────────── */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-800/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                      <span className="text-[10px] text-slate-400 dark:text-slate-600 font-mono tracking-wider">
                        REF: {apt.id?.slice(-12)?.toUpperCase()}
                      </span>

                      <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap justify-end">
                        {isLive ? (
                          <>
                            <button
                              onClick={() => setSelectedAptToCancel(apt)}
                              className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/30 transition-all cursor-pointer"
                            >
                              Cancel
                            </button>
                            <Link
                              href="/queue"
                              className="px-4 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 text-amber-700 dark:text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                            >
                              <Zap className="w-3.5 h-3.5" />
                              <span>Track Live Queue</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </Link>
                          </>
                        ) : isCompleted ? (
                          <>
                            {apt.rating ? (
                              <button
                                onClick={() => handleOpenRateModal(apt)}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 hover:bg-amber-100 dark:hover:bg-amber-500/20 border border-amber-200 dark:border-amber-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                                Rated {apt.rating}★ (Edit)
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenRateModal(apt)}
                                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                              >
                                <Star className="w-3.5 h-3.5 fill-slate-950" />
                                Rate Service
                              </button>
                            )}
                            <button
                              onClick={() => handleOpenBooking()}
                              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer"
                            >
                              Book Again
                            </button>
                          </>
                        ) : null}
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── EMPTY STATE ──────────────────────────────────────────────── */
          <div className="rounded-3xl border-2 border-dashed border-slate-200 dark:border-slate-700/70 bg-white/60 dark:bg-[#0d1018]/60 py-20 px-6 text-center space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
              <Calendar className="w-8 h-8" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {filter === 'ALL' ? 'No Appointments Yet' : `No ${filter.charAt(0) + filter.slice(1).toLowerCase()} Appointments`}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                {filter === 'ALL'
                  ? "You haven't booked any services yet. Explore premium salons and reserve your first luxury styling session."
                  : `You don't have any ${filter.toLowerCase()} appointments at this time.`}
              </p>
            </div>
            {filter === 'ALL' && (
              <button
                onClick={() => handleOpenBooking()}
                className="mt-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Book First Appointment
              </button>
            )}
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════════
          CANCELLATION MODAL
         ═══════════════════════════════════════════════════════════════════ */}
      {selectedAptToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 dark:bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative w-full max-w-md rounded-3xl bg-white dark:bg-[#0f1018] border border-rose-300 dark:border-rose-500/25 p-6 sm:p-7 shadow-2xl shadow-rose-500/10 space-y-5">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-rose-500/50 to-transparent rounded-t-3xl" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/25 text-rose-500 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Cancel Appointment</h3>
                  <span className="text-[11px] text-rose-500 dark:text-rose-400 font-semibold">5% Booking Fee Applies</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAptToCancel(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Cancel <strong className="text-slate-900 dark:text-white">{selectedAptToCancel.serviceName}</strong> at{' '}
                <strong className="text-slate-900 dark:text-white">{selectedAptToCancel.salonName}</strong>?
              </p>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-2.5 font-mono">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Booking Amount</span>
                  <span className="text-slate-900 dark:text-white font-bold">₹{selectedAptToCancel.servicePrice || 0}.00</span>
                </div>
                <div className="flex items-center justify-between text-rose-500 dark:text-rose-400">
                  <span>5% Cancellation Fee</span>
                  <span>- ₹{((selectedAptToCancel.servicePrice || 0) * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex items-center justify-between font-bold text-sm">
                  <span className="text-emerald-600 dark:text-emerald-400">Net Refund</span>
                  <span className="text-emerald-600 dark:text-emerald-400">₹{((selectedAptToCancel.servicePrice || 0) * 0.95).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/20 text-amber-700 dark:text-amber-300/90 leading-relaxed">
                5% is retained to cover slot reservation costs. The remaining 95% is refunded immediately.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-1">
              <button
                type="button"
                onClick={() => setSelectedAptToCancel(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                disabled={cancellingId === selectedAptToCancel.id}
                onClick={async () => {
                  const targetId = selectedAptToCancel.id;
                  setSelectedAptToCancel(null);
                  await handleCancel(targetId);
                }}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-600/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {cancellingId === selectedAptToCancel.id ? 'Processing...' : 'Confirm & Deduct 5%'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          RATING MODAL
         ═══════════════════════════════════════════════════════════════════ */}
      {selectedAptToRate && (
        <div className="fixed inset-0 z-50 bg-black/70 dark:bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="relative bg-white dark:bg-[#0f1018] border border-amber-200 dark:border-amber-500/25 w-full max-w-lg rounded-3xl p-6 shadow-2xl shadow-amber-500/10 space-y-5 overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-500/5 dark:bg-amber-500/8 rounded-full blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-500/15 border border-amber-200 dark:border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-500 dark:fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Rate Your Experience</h3>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedAptToRate.salonName} • {selectedAptToRate.serviceName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAptToRate(null)}
                className="text-slate-400 hover:text-slate-900 dark:hover:text-white text-lg p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="relative space-y-5">
              {/* Stars */}
              <div className="flex flex-col items-center py-2 space-y-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const active = ratingHover || ratingScore;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingScore(star)}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        className="p-1 rounded-lg hover:scale-125 transition-transform duration-150 cursor-pointer"
                      >
                        <Star
                          className={`w-9 h-9 transition-colors duration-100 ${
                            star <= active
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                              : 'text-slate-300 dark:text-slate-700 fill-transparent'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>
                <span className="text-xs font-bold text-amber-600 dark:text-amber-400 h-4">
                  {(ratingHover || ratingScore) === 5 && 'Exceptional • 5.0 Stars'}
                  {(ratingHover || ratingScore) === 4 && 'Very Good • 4.0 Stars'}
                  {(ratingHover || ratingScore) === 3 && 'Good Service • 3.0 Stars'}
                  {(ratingHover || ratingScore) === 2 && 'Fair • 2.0 Stars'}
                  {(ratingHover || ratingScore) === 1 && 'Needs Improvement • 1.0 Star'}
                </span>
              </div>

              {/* Quick Tags */}
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                  Quick Highlights
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {['Punctual & Fast', 'Master Haircut', 'Clean & Hygienic', 'Polite Stylist', 'Great Ambience', 'Fair Value'].map((tag) => {
                    const sel = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          sel
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                            : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700/60'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback text */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 block">
                  Detailed Feedback
                </label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share what you enjoyed or what can be improved..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 p-3 text-sm text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-600 focus:outline-none focus:border-amber-500/60 focus:ring-1 focus:ring-amber-500/20 transition-all resize-none"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-500/8 border border-amber-200 dark:border-amber-500/15 text-[11px] text-amber-700 dark:text-amber-300/80 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>Your rating will appear directly in the salon management panel.</span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setSelectedAptToRate(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-800 dark:text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── SUCCESS TOAST ─────────────────────────────────────────────────── */}
      {ratingSuccessToast && (
        <div className="fixed bottom-6 right-4 sm:right-6 z-[60] max-w-sm p-4 rounded-2xl bg-white dark:bg-[#11141e] border border-amber-200 dark:border-amber-500/30 text-slate-900 dark:text-white shadow-2xl shadow-amber-500/10 flex items-center gap-3 animate-in slide-in-from-bottom-4 duration-300">
          <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium leading-snug text-slate-600 dark:text-slate-200">{ratingSuccessToast}</p>
        </div>
      )}
    </div>
  );
}
