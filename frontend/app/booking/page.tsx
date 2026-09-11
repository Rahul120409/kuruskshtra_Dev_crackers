'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Calendar, 
  Clock, 
  Scissors, 
  User, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ArrowRight,
  Info,
  ShieldCheck
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCustomer } from '../../context/CustomerContext';
import { DEMO_SERVICES, DEMO_STAFF, DEMO_HAIRSTYLES } from '../../services/mockData';
import { customerService } from '../../services/customerService';
import { SalonService, SalonStaff } from '../../types';

function BookingForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, selectedHairstyle, joinLiveQueue, addAppointment } = useCustomer();

  const urlServiceId = searchParams.get('serviceId');
  const urlHairstyleId = searchParams.get('hairstyle');

  const [bookingMode, setBookingMode] = useState<'WALK_IN' | 'SCHEDULED'>('WALK_IN');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(urlServiceId || 'srv-02');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('stf-01');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState<string>('02:30 PM');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const matchedHairstyle = selectedHairstyle || DEMO_HAIRSTYLES.find((h) => h.id === urlHairstyleId);
  const activeService = DEMO_SERVICES.find((s) => s.id === selectedServiceId) || DEMO_SERVICES[0];
  const activeStaff = DEMO_STAFF.find((st) => st.id === selectedStaffId) || DEMO_STAFF[0];

  const TIME_SLOTS = ['11:00 AM', '12:15 PM', '01:30 PM', '02:30 PM', '04:00 PM', '05:30 PM', '06:45 PM'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (bookingMode === 'WALK_IN') {
        // Issue Live Queue Token (Canonical #108 in LLD)
        await joinLiveQueue(selectedServiceId, selectedStaffId, matchedHairstyle?.id);
      } else {
        // Create Scheduled Appointment
        await customerService.createAppointment({
          salonId: 'salon-pune-01',
          serviceId: selectedServiceId,
          customerId: user ? user.id : 'usr-customer-001',
          staffId: selectedStaffId,
          appointmentDate: selectedDate,
          appointmentTime: selectedTime,
        });
      }

      await addAppointment({
        customerId: user ? user.id : 'usr-customer-001',
        salonId: 'salon-pune-01',
        salonName: 'SalonFlow Studio & Lounge',
        salonAddress: 'Lane 7, Koregaon Park, Pune, Maharashtra 411001',
        salonArea: 'Koregaon Park',
        serviceId: selectedServiceId,
        serviceName: activeService.name,
        servicePrice: activeService.price,
        serviceDuration: activeService.durationMinutes,
        staffId: activeStaff.id,
        staffName: activeStaff.name,
        staffAvatar: activeStaff.avatarUrl,
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        status: 'CONFIRMED',
        source: 'ONLINE',
        bookingType: bookingMode,
        tokenNumber: 108,
        paymentMethod: 'Pay at Salon Counter',
        paymentStatus: 'PENDING_AT_COUNTER',
      });

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (err) {
        // Ignore in environments without canvas
      }

      router.push('/appointments');
    } catch (err) {
      console.error('Booking failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/25 inline-flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" />
          <span>Queue Token & Reservation</span>
        </span>
        <h1 className="text-3xl font-extrabold text-white">
          {bookingMode === 'WALK_IN' ? 'Join Live Salon Queue' : 'Schedule Appointment'}
        </h1>
        <p className="text-xs text-zinc-400">
          Select your service and preferred barber. Join immediately with live wait countdown or pick an appointment slot.
        </p>
      </div>

      {/* Booking Mode Selector (Walk-In vs Scheduled) */}
      <div className="max-w-md mx-auto grid grid-cols-2 p-1.5 rounded-2xl bg-zinc-900 border border-zinc-800">
        <button
          type="button"
          onClick={() => setBookingMode('WALK_IN')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            bookingMode === 'WALK_IN'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 fill-current" />
          <span>Walk-In Queue (Now)</span>
        </button>

        <button
          type="button"
          onClick={() => setBookingMode('SCHEDULED')}
          className={`py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            bookingMode === 'SCHEDULED'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-zinc-400 hover:text-white'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Schedule for Later</span>
        </button>
      </div>

      {/* AI Matched Style Banner (If linked) */}
      {matchedHairstyle && (
        <div className="rounded-2xl glass-panel-gold p-4 border border-amber-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={matchedHairstyle.imageUrl}
              alt={matchedHairstyle.name}
              className="w-14 h-14 rounded-xl object-cover border border-amber-500/30"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-bold uppercase text-amber-300">Selected AI Hairstyle</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">{matchedHairstyle.name}</h3>
              <p className="text-[11px] text-zinc-400">Stylist will reference this photo and facial cut notes.</p>
            </div>
          </div>
          <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 font-mono font-bold">
            Mapped
          </span>
        </div>
      )}

      {/* Main Booking Form */}
      <form onSubmit={handleSubmit} className="rounded-2xl glass-panel p-6 sm:p-8 border border-zinc-800 space-y-6">
        
        {/* Step 1: Select Service */}
        <div className="space-y-3">
          <label className="text-sm font-bold text-white flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Scissors className="w-4 h-4 text-amber-400" />
              <span>1. Choose Salon Service</span>
            </span>
            <span className="text-xs text-amber-400 font-semibold font-mono">₹{activeService.price}</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DEMO_SERVICES.map((srv) => (
              <div
                key={srv.id}
                onClick={() => setSelectedServiceId(srv.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-start justify-between ${
                  selectedServiceId === srv.id
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div>
                  <h4 className="text-xs font-bold text-white">{srv.name}</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">{srv.durationMinutes} mins • {srv.category}</p>
                </div>
                <span className="text-xs font-mono font-bold text-amber-300">₹{srv.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Step 2: Select Stylist */}
        <div className="space-y-3 pt-4 border-t border-zinc-800">
          <label className="text-sm font-bold text-white flex items-center gap-2">
            <User className="w-4 h-4 text-amber-400" />
            <span>2. Select Barber / Stylist</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {DEMO_STAFF.map((staff) => (
              <div
                key={staff.id}
                onClick={() => setSelectedStaffId(staff.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                  selectedStaffId === staff.id
                    ? 'bg-amber-500/10 border-amber-500/50 shadow-sm'
                    : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <img
                  src={staff.avatarUrl}
                  alt={staff.name}
                  className="w-10 h-10 rounded-full object-cover border border-zinc-700"
                />
                <div>
                  <h4 className="text-xs font-bold text-white">{staff.name}</h4>
                  <p className="text-[10px] text-zinc-400">{staff.specialization}</p>
                  <span className="text-[10px] font-semibold text-emerald-400">★ {staff.rating} • {staff.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 3: Date & Slot (Only if SCHEDULED) */}
        {bookingMode === 'SCHEDULED' && (
          <div className="space-y-4 pt-4 border-t border-zinc-800">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Appointment Date</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-zinc-300 block mb-1.5">Select Time Slot</label>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTime(slot)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        selectedTime === slot
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Live Wait Intelligence Summary Box */}
        <div className="p-4 rounded-xl bg-zinc-900/90 border border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-zinc-300">
                {bookingMode === 'WALK_IN' ? 'Live Estimated Wait Time' : 'Confirmed Slot'}
              </p>
              <p className="text-sm font-bold text-white">
                {bookingMode === 'WALK_IN' ? '~24 mins (4 customers in queue)' : `${selectedDate} at ${selectedTime}`}
              </p>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-zinc-400 block uppercase">Total Payable</span>
            <span className="text-lg font-extrabold text-amber-400 font-mono">₹{activeService.price}</span>
          </div>
        </div>

        {/* Submit Action */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-xl shadow-amber-500/25 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          {bookingMode === 'WALK_IN' ? (
            <>
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>{isSubmitting ? 'Issuing Token...' : 'Get Queue Token #108'}</span>
            </>
          ) : (
            <>
              <Calendar className="w-4 h-4" />
              <span>{isSubmitting ? 'Confirming...' : 'Confirm Appointment'}</span>
            </>
          )}
          <ArrowRight className="w-4 h-4" />
        </button>

      </form>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-zinc-400 text-sm">Loading booking portal...</div>}>
      <BookingForm />
    </Suspense>
  );
}
