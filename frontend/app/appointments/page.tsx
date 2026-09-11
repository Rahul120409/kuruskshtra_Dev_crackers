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
  Sparkles 
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { Appointment, Salon } from '../../types';
import { salonService } from '../../services/salonService';
import { BookingWizardModal } from '../../components/BookingWizardModal';

export default function AppointmentsPage() {
  const router = useRouter();
  const { user, appointments, cancelAppointment, activeToken } = useCustomer();
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // Live Salons from Backend API
  const [salons, setSalons] = useState<Salon[]>([]);
  // Modal state for booking a new appointment
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);

  useEffect(() => {
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
      if (filter === 'COMPLETED') return apt.status === 'COMPLETED';
      if (filter === 'CANCELLED') return apt.status === 'CANCELLED';
      return true;
    });
  }, [appointments, filter]);

  const activeCount = appointments.filter((a) => a.status === 'CONFIRMED' || a.status === 'CHECKED_IN').length;
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
            const isLive = apt.status === 'CONFIRMED' || apt.status === 'CHECKED_IN';
            const isWalkin = apt.bookingType === 'WALK_IN';

            return (
              <div
                key={apt.id}
                className={`rounded-2xl border transition-all p-5 sm:p-6 flex flex-col justify-between gap-5 shadow-lg ${
                  isLive
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
                  <div className="flex items-center gap-2">
                    {apt.status === 'CONFIRMED' && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                        {isWalkin ? 'Live Queue Pass' : 'Confirmed Slot'}
                      </span>
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

                {/* Bottom Actions Bar */}
                <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] text-slate-500 font-mono">
                    Booking Ref: {apt.id}
                  </span>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    {isLive ? (
                      <>
                        <button
                          onClick={() => handleCancel(apt.id)}
                          disabled={cancellingId === apt.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 border border-slate-700 hover:border-rose-500/30 transition-colors"
                        >
                          {cancellingId === apt.id ? 'Cancelling...' : 'Cancel Appointment'}
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
                        <Link
                          href="/feedback"
                          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-750 transition-colors"
                        >
                          Rate Service
                        </Link>

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

    </div>
  );
}
