'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  UserCheck, 
  Ticket, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowRight, 
  Plus, 
  Store, 
  Banknote, 
  Smartphone, 
  Navigation, 
  Star, 
  Sparkles,
  MessageSquareHeart,
  ThumbsUp
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { Appointment, Salon } from '../../types';
import { salonService } from '../../services/salonService';
import { BookingWizardModal } from '../../components/BookingWizardModal';

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, appointments, cancelAppointment, rateAppointment, markAppointmentLate, activeToken, refreshAppointments } = useCustomer();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'LATE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [markingLateId, setMarkingLateId] = useState<string | null>(null);
  const [selectedAptToCancel, setSelectedAptToCancel] = useState<Appointment | null>(null);

  // Rating & Feedback Modal State
  const [selectedAptToRate, setSelectedAptToRate] = useState<Appointment | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [feedbackComment, setFeedbackComment] = useState<string>('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSubmittingRating, setIsSubmittingRating] = useState<boolean>(false);
  const [ratingSuccessToast, setRatingSuccessToast] = useState<string | null>(null);

  // Live Salons from Backend API
  const [salons, setSalons] = useState<Salon[]>([]);
  // Modal state for booking a new appointment
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  useEffect(() => {
    refreshAppointments();
    salonService.getSalons().then((list) => {
      setSalons(list || []);
      if (list && list.length > 0) {
        setSelectedSalon(list[0]);
      }
    });
  }, []);

  // Filter appointments
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      if (filter === 'ALL') return true;
      if (filter === 'ACTIVE') return apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN';
      if (filter === 'LATE') return apt.status === 'LATE';
      if (filter === 'COMPLETED') return apt.status === 'COMPLETED';
      if (filter === 'CANCELLED') return apt.status === 'CANCELLED';
      return true;
    });
  }, [appointments, filter]);

  const activeCount = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN').length;
  const lateCount = appointments.filter((a) => a.status === 'LATE').length;
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length;
  const cancelledCount = appointments.filter((a) => a.status === 'CANCELLED').length;

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

  const handleMarkLate = async (aptId: string) => {
    setMarkingLateId(aptId);
    try {
      await markAppointmentLate(aptId);
    } catch (err) {
      console.error('Failed to mark appointment late:', err);
    } finally {
      setMarkingLateId(null);
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
      const combinedFeedback = selectedTags.length > 0
        ? (feedbackComment ? `${feedbackComment} [${selectedTags.join(', ')}]` : selectedTags.join(', '))
        : feedbackComment;

      await rateAppointment(selectedAptToRate.id, ratingScore, combinedFeedback);
      setRatingSuccessToast(`Thank you! Your ${ratingScore}★ review for ${selectedAptToRate.salonName || 'the salon'} was submitted and sent to the salon panel.`);
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
      router.push(`/booking?salonId=${encodeURIComponent(target.id)}&salonName=${encodeURIComponent(target.name)}&area=${encodeURIComponent(area)}&wait=${wait}`);
    } else {
      router.push('/booking');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              Booking Manager
            </span>
            <span className="text-xs text-slate-400">• Pune Salon Network</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white mt-1 tracking-tight">
            My Appointments & Queue Passes
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage your live haircut tokens, scheduled salon visits, and styling records.
          </p>
        </div>

        <button
          onClick={() => handleOpenBooking()}
          className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Book New Haircut</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setFilter('ALL')}
          className={`px-4 py-2 rounded-xl font-bold transition-all border whitespace-nowrap ${
            filter === 'ALL'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          All Appointments ({appointments.length})
        </button>

        <button
          onClick={() => setFilter('ACTIVE')}
          className={`px-4 py-2 rounded-xl font-bold transition-all border whitespace-nowrap ${
            filter === 'ACTIVE'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          Active & Upcoming ({activeCount})
        </button>

        <button
          onClick={() => setFilter('LATE')}
          className={`px-4 py-2 rounded-xl font-bold transition-all border whitespace-nowrap ${
            filter === 'LATE'
              ? 'bg-rose-600 text-white border-rose-500 shadow-md shadow-rose-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          Late ({lateCount})
        </button>

        <button
          onClick={() => setFilter('COMPLETED')}
          className={`px-4 py-2 rounded-xl font-bold transition-all border whitespace-nowrap ${
            filter === 'COMPLETED'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          Completed ({completedCount})
        </button>

        <button
          onClick={() => setFilter('CANCELLED')}
          className={`px-4 py-2 rounded-xl font-bold transition-all border whitespace-nowrap ${
            filter === 'CANCELLED'
              ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
          }`}
        >
          Cancelled ({cancelledCount})
        </button>
      </div>

      {/* Appointment Cards List */}
      {filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((apt) => {
            const isLive = apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN' || apt.status === 'LATE';
            const isWalkin = apt.bookingType === 'WALK_IN';

            return (
              <div
                key={apt.id}
                className={`rounded-2xl border transition-all p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-lg ${
                  apt.status === 'LATE'
                    ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-rose-950/30 border-rose-500/40 hover:border-rose-500/60'
                    : isLive
                    ? 'bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/30 border-indigo-500/30 hover:border-indigo-500/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Top Section: Salon & Status Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex-shrink-0">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-white tracking-wide">
                          {apt.salonName || 'SalonFlow Studio & Lounge'}
                        </h3>
                        {apt.salonArea && (
                          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                            {apt.salonArea}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{apt.salonAddress}</span>
                      </p>
                    </div>
                  </div>

                  {/* Status Pill */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {apt.status === 'CONFIRMED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {isWalkin ? 'Live Queue Pass' : 'Confirmed Slot'}
                      </span>
                    )}
                    {apt.status === 'CHECKED_IN' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                        Checked In
                      </span>
                    )}
                    {apt.status === 'LATE' && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1.5 animate-pulse">
                          <span className="w-2 h-2 rounded-full bg-rose-400" />
                          LATE Check-in
                        </span>
                        {apt.lateTimestamp && (
                          <span className="text-[11px] text-rose-400 font-mono font-semibold">
                            Late at {new Date(apt.lateTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}
                    {apt.status === 'COMPLETED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        Completed
                      </span>
                    )}
                    {apt.status === 'CANCELLED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" />
                        Cancelled
                      </span>
                    )}
                  </div>
                </div>

                {/* Middle Section: Booking Specifics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 py-2 text-xs">
                  
                  {/* Service & Price */}
                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                      Haircut / Service
                    </span>
                    <div className="flex items-center gap-2">
                      <Scissors className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      <span className="text-sm font-bold text-white truncate">
                        {apt.serviceName}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="font-semibold text-emerald-400">₹{apt.servicePrice}</span>
                      <span>•</span>
                      <span>{apt.serviceDuration || 30} mins</span>
                    </div>
                  </div>

                  {/* Stylist Details */}
                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                      Hair Stylist
                    </span>
                    <div className="flex items-center gap-2">
                      <img
                        src={apt.staffAvatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'}
                        alt={apt.staffName || 'Stylist'}
                        className="w-7 h-7 rounded-full object-cover border border-slate-700"
                      />
                      <div className="min-w-0">
                        <span className="text-sm font-bold text-white truncate block">
                          {apt.staffName || 'Vikram Joshi'}
                        </span>
                      </div>
                    </div>
                    <span className="text-[11px] text-amber-400 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-amber-400" />
                      Top Rated Stylist
                    </span>
                  </div>

                  {/* Date & Time Slot */}
                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                      Date & Time Slot
                    </span>
                    <div className="flex items-center gap-1.5 text-white font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{apt.appointmentDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{apt.appointmentTime}</span>
                    </div>
                  </div>

                  {/* Token & Payment Mode */}
                  <div className="space-y-1">
                    <span className="text-slate-500 uppercase tracking-wider text-[10px] font-bold block">
                      Pass & Payment
                    </span>
                    {apt.tokenNumber ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 font-mono font-bold text-xs">
                        <Ticket className="w-3.5 h-3.5" />
                        <span>Token #{apt.tokenNumber}</span>
                      </div>
                    ) : (
                      <div className="text-slate-300 font-semibold text-xs">Reserved Slot</div>
                    )}
                    <div className="text-[11px] text-slate-400 flex items-center gap-1 mt-0.5">
                      {apt.paymentMethod?.includes('Counter') ? (
                        <Banknote className="w-3 h-3 text-emerald-400" />
                      ) : (
                        <Smartphone className="w-3 h-3 text-indigo-400" />
                      )}
                      <span>{apt.paymentMethod || 'Pay at Counter'}</span>
                    </div>
                  </div>

                </div>

                {/* Rating & Customer Review Snippet */}
                {apt.rating ? (
                  <div className="mt-3 p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5 min-w-0">
                      <div className="flex items-center gap-1 text-amber-400 bg-amber-500/20 px-2 py-0.5 rounded-md font-bold text-xs shrink-0 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{apt.rating}.0</span>
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-300">Your Rating</span>
                          <span className="text-[10px] text-slate-400 font-medium">• Visible in Salon Portal</span>
                        </div>
                        {apt.feedback ? (
                          <p className="text-xs text-slate-300 italic mt-0.5">"{apt.feedback}"</p>
                        ) : (
                          <p className="text-xs text-slate-400 mt-0.5">Rated {apt.rating} out of 5 stars.</p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleOpenRateModal(apt)}
                      className="text-[11px] font-semibold text-amber-300 hover:text-amber-200 underline underline-offset-2 shrink-0 cursor-pointer"
                    >
                      Edit Review
                    </button>
                  </div>
                ) : null}

                {/* Bottom Actions Bar */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Booking Ref: {apt.id}
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isLive ? (
                      <>
                        {apt.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleMarkLate(apt.id)}
                            disabled={markingLateId === apt.id}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white shadow-md shadow-rose-500/20 hover:scale-[1.02] transition-all flex items-center gap-1.5"
                          >
                            <AlertCircle className="w-3.5 h-3.5" />
                            <span>{markingLateId === apt.id ? 'Marking...' : 'Mark Late'}</span>
                          </button>
                        )}

                        <button
                          onClick={() => setSelectedAptToCancel(apt)}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 transition-colors cursor-pointer"
                        >
                          Cancel Appointment
                        </button>

                        <Link
                          href="/queue"
                          className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                        >
                          <span>Track Live Queue</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </>
                    ) : (
                      <>
                        {apt.rating ? (
                          <button
                            onClick={() => handleOpenRateModal(apt)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-amber-300 hover:text-amber-200 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                          >
                            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                            <span>Rated {apt.rating}★ (Edit)</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenRateModal(apt)}
                            className="px-3.5 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 shadow-md shadow-amber-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-slate-950 text-slate-950" />
                            <span>Rate Service</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenBooking()}
                          className="px-4 py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white text-xs font-bold border border-indigo-500/30 transition-all"
                        >
                          Book Again
                        </button>
                      </>
                    )}
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-16 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4 shadow-lg">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-500/20">
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">No Appointments Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              {filter === 'ALL'
                ? "You don't have any appointments booked yet. Browse salons to book your first haircut!"
                : `You don't have any ${filter.toLowerCase()} appointments.`}
            </p>
          </div>
          <button
            onClick={() => handleOpenBooking()}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs inline-flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Book Appointment Now</span>
          </button>
        </div>
      )}

      {/* Booking Wizard Modal */}
      <BookingWizardModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        salon={selectedSalon}
      />

      {/* 5% CANCELLATION FEE CONFIRMATION MODAL */}
      {selectedAptToCancel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-rose-500/30 p-6 sm:p-7 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Cancellation Policy</h3>
                  <span className="text-[11px] text-rose-400 font-semibold">5% Booking Deduction</span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAptToCancel(null)}
                className="text-slate-400 hover:text-white text-lg p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                Are you sure you want to cancel your appointment for <strong className="text-white">{selectedAptToCancel.serviceName}</strong> at <strong className="text-white">{selectedAptToCancel.salonName}</strong>?
              </p>

              {/* Breakdown Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 font-mono">
                <div className="flex items-center justify-between text-slate-400">
                  <span>Booking Amount:</span>
                  <span className="text-white font-bold">₹{selectedAptToCancel.servicePrice || 0}.00</span>
                </div>
                <div className="flex items-center justify-between text-rose-400">
                  <span>5% Cancellation Fee:</span>
                  <span>- ₹{((selectedAptToCancel.servicePrice || 0) * 0.05).toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-800 pt-2 flex items-center justify-between font-bold text-sm">
                  <span className="text-emerald-400">Net Refund / Adjusted:</span>
                  <span className="text-emerald-400">₹{((selectedAptToCancel.servicePrice || 0) * 0.95).toFixed(2)}</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 leading-relaxed">
                As per salon cancellation policy, 5% of the total amount is retained to cover barber slot reservation and processing costs. The remaining 95% is refunded.
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setSelectedAptToCancel(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs transition-colors cursor-pointer"
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
                {cancellingId === selectedAptToCancel.id ? "Processing..." : "Confirm & Deduct 5%"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RATING & FEEDBACK MODAL */}
      {selectedAptToRate && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 shadow-2xl space-y-5 relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center">
                  <Star className="w-5 h-5 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Rate Your Experience</h3>
                  <span className="text-xs text-slate-400">
                    {selectedAptToRate.salonName || 'Salon'} • {selectedAptToRate.serviceName}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedAptToRate(null)}
                className="text-slate-400 hover:text-white text-lg p-1 rounded-lg transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              {/* Star Selection Area */}
              <div className="flex flex-col items-center justify-center py-2 space-y-2">
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => {
                    const activeScore = ratingHover || ratingScore;
                    const isFilled = star <= activeScore;
                    return (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRatingScore(star)}
                        onMouseEnter={() => setRatingHover(star)}
                        onMouseLeave={() => setRatingHover(0)}
                        className="p-1 rounded-lg hover:scale-125 transition-transform duration-150 cursor-pointer focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 transition-colors ${
                            isFilled
                              ? 'fill-amber-400 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                              : 'text-slate-600 fill-transparent'
                          }`}
                        />
                      </button>
                    );
                  })}
                </div>

                <span className="text-xs font-bold text-amber-300">
                  {(ratingHover || ratingScore) === 5 && '🌟 Exceptional - 5.0 Stars!'}
                  {(ratingHover || ratingScore) === 4 && '✨ Very Good - 4.0 Stars'}
                  {(ratingHover || ratingScore) === 3 && '👍 Good Service - 3.0 Stars'}
                  {(ratingHover || ratingScore) === 2 && '😐 Could Be Better - 2.0 Stars'}
                  {(ratingHover || ratingScore) === 1 && '👎 Poor Experience - 1.0 Star'}
                </span>
              </div>

              {/* Quick Feedback Tags */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick Compliments & Highlights
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Punctual & Fast',
                    'Master Haircut',
                    'Clean & Hygienic',
                    'Polite Stylist',
                    'Great Ambience',
                    'Fair Value',
                  ].map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => handleToggleTag(tag)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-750 hover:text-white border border-slate-700/60'
                        }`}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Textarea */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
                  Detailed Feedback (Visible to Salon Manager)
                </label>
                <textarea
                  rows={3}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share what you enjoyed or what the salon can improve..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70 focus:ring-1 focus:ring-amber-500/30 transition-all font-sans"
                />
              </div>

              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Your rating and feedback will be directly visible on the salon management panel to improve service quality.</span>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAptToRate(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-white font-semibold text-xs transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingRating}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-extrabold text-xs shadow-lg shadow-amber-500/20 transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Star className="w-3.5 h-3.5 fill-slate-950" />
                  <span>{isSubmittingRating ? 'Submitting...' : 'Submit Rating & Feedback'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast */}
      {ratingSuccessToast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 rounded-2xl bg-slate-900 border border-amber-500/40 text-slate-200 shadow-2xl flex items-center gap-3 animate-bounce">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <p className="text-xs font-medium leading-snug">{ratingSuccessToast}</p>
        </div>
      )}

    </div>
  );
}
