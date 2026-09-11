'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Scissors, 
  UserCheck, 
  Ticket, 
  CreditCard, 
  Clock, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft, 
  Sparkles, 
  ShieldCheck, 
  Store, 
  Calendar, 
  Zap, 
  Smartphone,
  Banknote,
  Star,
  MapPin,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Salon, SalonService, SalonStaff } from '../types';
import { DEMO_SERVICES, DEMO_STAFF, DEMO_HAIRSTYLES } from '../services/mockData';
import { useCustomer } from '../context/CustomerContext';

interface BookingWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  salon: Salon | null;
  preselectedServiceId?: string;
}

type BookingStep = 1 | 2 | 3 | 4;
type BookingMode = 'WALK_IN' | 'SCHEDULED';
type PaymentMethod = 'COUNTER' | 'UPI' | 'CARD';

export const BookingWizardModal: React.FC<BookingWizardModalProps> = ({
  isOpen,
  onClose,
  salon,
  preselectedServiceId,
}) => {
  const router = useRouter();
  const { user, joinLiveQueue, addAppointment } = useCustomer();

  const [step, setStep] = useState<BookingStep>(1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId || 'srv-02');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  
  // Step 2 state
  const [bookingMode, setBookingMode] = useState<BookingMode>('WALK_IN');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('stf-01');
  const [selectedDate, setSelectedDate] = useState<string>('Today');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>('04:30 PM');

  // Step 4 state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COUNTER');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Available services
  const services = useMemo(() => DEMO_SERVICES, []);
  const staffMembers = useMemo(() => DEMO_STAFF, []);

  const filteredServices = useMemo(() => {
    if (categoryFilter === 'All') return services;
    return services.filter((s) => s.category === categoryFilter);
  }, [services, categoryFilter]);

  const selectedService = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  const selectedStaff = useMemo(() => {
    if (selectedStaffId === 'any') return null;
    return staffMembers.find((st) => st.id === selectedStaffId) || staffMembers[0];
  }, [staffMembers, selectedStaffId]);

  if (!isOpen || !salon) return null;

  const categories = ['All', 'Haircuts', 'Beard & Shave', 'Spa & Treatments', 'Color & Styling'];
  const timeSlots = ['11:30 AM', '12:45 PM', '02:15 PM', '04:30 PM', '06:00 PM', '07:30 PM'];

  const triggerCelebration = () => {
    try {
      confetti({
        particleCount: 90,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#4F46E5', '#6366F1', '#10B981', '#F59E0B'],
      });
    } catch {
      // Fallback
    }
  };

  const handleCompleteBooking = async () => {
    setIsSubmitting(true);
    try {
      const token = await joinLiveQueue(
        selectedService.id,
        selectedStaffId === 'any' ? undefined : selectedStaffId,
        undefined,
        salon.id
      );

      // Also record as an appointment in appointments store
      await addAppointment({
        customerId: user ? user.id : 'usr-customer-001',
        salonId: salon.id,
        salonName: salon.name,
        salonAddress: salon.address,
        salonArea: salon.area,
        serviceId: selectedService.id,
        serviceName: selectedService.name,
        servicePrice: selectedService.price,
        serviceDuration: selectedService.durationMinutes,
        staffId: selectedStaff ? selectedStaff.id : undefined,
        staffName: selectedStaff ? selectedStaff.name : 'First Available Stylist',
        staffAvatar: selectedStaff?.avatarUrl,
        appointmentDate: bookingMode === 'SCHEDULED' ? selectedDate : new Date().toISOString().split('T')[0],
        appointmentTime: bookingMode === 'SCHEDULED' ? selectedTimeSlot : '04:30 PM',
        status: 'CONFIRMED',
        source: 'ONLINE',
        bookingType: bookingMode,
        tokenNumber: token?.tokenNumber || 108,
        paymentMethod: paymentMethod === 'COUNTER' ? 'Pay at Salon Counter' : paymentMethod === 'UPI' ? 'UPI' : 'Credit/Debit Card',
        paymentStatus: paymentMethod === 'COUNTER' ? 'PENDING_AT_COUNTER' : 'PAID',
      });

      triggerCelebration();
      setIsSuccess(true);

      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
        router.push('/appointments');
      }, 1600);
    } catch (err) {
      console.error('Booking failed:', err);
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (step < 4) {
      setStep((prev) => (prev + 1) as BookingStep);
    } else {
      handleCompleteBooking();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as BookingStep);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/75 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-white tracking-wide">{salon.name}</h3>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  {salon.area}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                {salon.address}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Indicator */}
        <div className="px-6 py-3 bg-slate-900/90 border-b border-slate-800/80">
          <div className="flex items-center justify-between relative">
            {/* Step 1 */}
            <button
              onClick={() => step > 1 && setStep(1)}
              className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                step === 1 ? 'text-indigo-400' : step > 1 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 1
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : step > 1
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : <Scissors className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline">1. Haircut & Service</span>
            </button>

            <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 1 ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />

            {/* Step 2 */}
            <button
              onClick={() => step > 2 && setStep(2)}
              className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                step === 2 ? 'text-indigo-400' : step > 2 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 2
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : step > 2
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : <UserCheck className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline">2. Stylist & Slot</span>
            </button>

            <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 2 ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />

            {/* Step 3 */}
            <button
              onClick={() => step > 3 && setStep(3)}
              className={`flex items-center gap-2 text-xs font-semibold transition-all ${
                step === 3 ? 'text-indigo-400' : step > 3 ? 'text-emerald-400' : 'text-slate-500'
              }`}
            >
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 3
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : step > 3
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {step > 3 ? <CheckCircle2 className="w-4 h-4" /> : <Ticket className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline">3. Token Review</span>
            </button>

            <div className={`flex-1 h-0.5 mx-3 transition-colors ${step > 3 ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />

            {/* Step 4 */}
            <div className={`flex items-center gap-2 text-xs font-semibold ${
              step === 4 ? 'text-indigo-400' : 'text-slate-500'
            }`}>
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                step === 4
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span className="hidden sm:inline">4. Payment</span>
            </div>
          </div>
        </div>

        {/* Modal Body / Steps */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* STEP 1: HAIRCUT & SERVICE */}
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h4 className="text-lg font-bold text-white">Select Haircut or Grooming Package</h4>
                <p className="text-sm text-slate-400">
                  Pick your desired haircut, beard sculpt, or combo tailored to your face shape.
                </p>
              </div>

              {/* Category Pills */}
              <div className="flex flex-wrap gap-2 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                      categoryFilter === cat
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:border-slate-600'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Services Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                {filteredServices.map((service) => {
                  const isSelected = selectedServiceId === service.id;
                  return (
                    <div
                      key={service.id}
                      onClick={() => setSelectedServiceId(service.id)}
                      className={`relative flex flex-col justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500 shadow-lg shadow-indigo-500/10'
                          : 'bg-slate-800/50 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex gap-3">
                        <img
                          src={service.imageUrl}
                          alt={service.name}
                          className="w-16 h-16 rounded-lg object-cover border border-slate-700 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h5 className="text-sm font-semibold text-white leading-snug truncate">
                              {service.name}
                            </h5>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            )}
                          </div>
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                            {service.description}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800/80 text-xs">
                        <span className="flex items-center gap-1 text-slate-400">
                          <Clock className="w-3.5 h-3.5 text-slate-500" />
                          {service.durationMinutes} mins
                        </span>
                        <span className="font-bold text-base text-white">
                          ₹{service.price}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hairstyle AI Match Callout */}
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/50 to-purple-950/40 border border-indigo-800/40 mt-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-white">Need an AI Hairstyle Recommendation?</p>
                    <p className="text-[11px] text-slate-400">
                      Our AI scans your face shape to recommend optimal fades & crops.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/hairstyles')}
                  className="px-3 py-1 text-xs font-semibold text-indigo-300 hover:text-white bg-indigo-600/30 hover:bg-indigo-600 border border-indigo-500/30 rounded-lg transition-all"
                >
                  Explore Styles
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: STYLIST & APPOINTMENT MODE */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Choose Booking Mode & Stylist</h4>
                <p className="text-sm text-slate-400">
                  Join the live walk-in queue immediately or reserve a future appointment slot.
                </p>
              </div>

              {/* Booking Mode Selector */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  onClick={() => setBookingMode('WALK_IN')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    bookingMode === 'WALK_IN'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">Live Walk-in Token</h5>
                        <p className="text-xs text-slate-400">Real-time dynamic queue</p>
                      </div>
                    </div>
                    {bookingMode === 'WALK_IN' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Current Wait:</span>
                    <span className="font-semibold text-amber-400">~{salon.currentWaitMinutes} mins</span>
                  </div>
                </div>

                <div
                  onClick={() => setBookingMode('SCHEDULED')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    bookingMode === 'SCHEDULED'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-800/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">Scheduled Slot</h5>
                        <p className="text-xs text-slate-400">Fixed reservation time</p>
                      </div>
                    </div>
                    {bookingMode === 'SCHEDULED' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    <span className="text-slate-400">Guaranteed:</span>
                    <span className="font-semibold text-emerald-400">Zero Wait Time</span>
                  </div>
                </div>
              </div>

              {/* If Scheduled, show date/time pickers */}
              {bookingMode === 'SCHEDULED' && (
                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 space-y-3 animate-in fade-in">
                  <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                    <Clock className="w-4 h-4 text-indigo-400" />
                    <span>Select Date & Preferred Time Slot</span>
                  </div>

                  <div className="flex gap-2">
                    {['Today', 'Tomorrow', 'Day After'].map((d) => (
                      <button
                        key={d}
                        onClick={() => setSelectedDate(d)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                          selectedDate === d
                            ? 'bg-indigo-600 text-white border-indigo-500'
                            : 'bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {d}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => setSelectedTimeSlot(slot)}
                        className={`py-2 text-center text-xs font-semibold rounded-lg border transition-all ${
                          selectedTimeSlot === slot
                            ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/20'
                            : 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Stylist Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                    Select Hair Stylist
                  </label>
                  <span className="text-xs text-slate-400">Available at {salon.area}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {/* Any Stylist Option */}
                  <div
                    onClick={() => setSelectedStaffId('any')}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedStaffId === 'any'
                        ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                        : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-indigo-400 font-bold text-sm">
                        ⚡
                      </div>
                      <div>
                        <h6 className="text-xs font-bold text-white">First Available</h6>
                        <p className="text-[11px] text-emerald-400 font-medium">Fastest Queue</p>
                      </div>
                    </div>
                  </div>

                  {/* Individual Staff */}
                  {staffMembers.map((staff) => {
                    const isSelected = selectedStaffId === staff.id;
                    return (
                      <div
                        key={staff.id}
                        onClick={() => setSelectedStaffId(staff.id)}
                        className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                            : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <img
                            src={staff.avatarUrl}
                            alt={staff.name}
                            className="w-10 h-10 rounded-full object-cover border border-slate-700"
                          />
                          <div className="min-w-0">
                            <h6 className="text-xs font-bold text-white truncate">{staff.name}</h6>
                            <p className="text-[10px] text-slate-400 truncate">{staff.specialization}</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/60 text-[11px]">
                          <span className="flex items-center gap-1 text-amber-400 font-medium">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {staff.rating}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                            staff.status === 'AVAILABLE'
                              ? 'bg-emerald-500/20 text-emerald-400'
                              : 'bg-amber-500/20 text-amber-400'
                          }`}>
                            {staff.status === 'AVAILABLE' ? 'Available' : 'Busy'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: TOKEN DETAILS REVIEW */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Review Your Live Token Pass</h4>
                <p className="text-sm text-slate-400">
                  Verify your queue allocation, station number, and estimated call time before confirming.
                </p>
              </div>

              {/* The Live Token Pass Card */}
              <div className="relative rounded-2xl bg-gradient-to-b from-indigo-900/40 via-slate-900 to-slate-950 border border-indigo-500/40 p-6 shadow-2xl overflow-hidden">
                {/* Background glow & watermark */}
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

                {/* Ticket Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase">
                      SalonFlow Digital Pass
                    </span>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Ready to Issue
                  </span>
                </div>

                {/* Big Token Number Callout */}
                <div className="py-6 flex flex-col items-center justify-center text-center">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Allocated Token Number
                  </span>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-white to-purple-400 tracking-tight my-1">
                    #108
                  </div>
                  <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    Estimated wait time: <strong className="text-white">~{salon.currentWaitMinutes || 24} minutes</strong>
                  </p>
                </div>

                {/* Key Ticket Details Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-t border-b border-slate-800/80 bg-slate-950/40 rounded-xl px-4 my-2">
                  <div>
                    <span className="text-[11px] text-slate-400 block">Queue Position</span>
                    <span className="text-sm font-bold text-white">4th in Line</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Assigned Station</span>
                    <span className="text-sm font-bold text-indigo-300">Station #3</span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Customer</span>
                    <span className="text-sm font-bold text-white truncate block">
                      {user?.name || 'Rahul Sharma'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[11px] text-slate-400 block">Mode</span>
                    <span className="text-sm font-bold text-emerald-400">
                      {bookingMode === 'WALK_IN' ? 'Live Queue' : 'Reserved Slot'}
                    </span>
                  </div>
                </div>

                {/* Selected Service & Stylist Summary */}
                <div className="pt-3 space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                      {selectedService.name} ({selectedService.durationMinutes} mins)
                    </span>
                    <span className="font-bold text-white">₹{selectedService.price}</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                      Stylist: {selectedStaff ? selectedStaff.name : 'First Available Stylist'}
                    </span>
                    <span className="text-slate-500">Free Assignment</span>
                  </div>

                  <div className="flex items-center justify-between text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-indigo-400" />
                      {salon.name} ({salon.area})
                    </span>
                    <span className="text-emerald-400">Open until {salon.closingTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>
                  Once confirmed, your token position updates in real-time. You can relax at home or nearby cafes until your turn approaches!
                </span>
              </div>
            </div>
          )}

          {/* STEP 4: PAYMENT & CHECKOUT */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-bold text-white">Payment & Booking Confirmation</h4>
                <p className="text-sm text-slate-400">
                  Select how you would like to pay for your service. Zero upfront risk.
                </p>
              </div>

              {/* Price Breakdown */}
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-800 space-y-2.5 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span>{selectedService.name}</span>
                  <span className="font-semibold text-white">₹{selectedService.price}.00</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Stylist Consultation Fee</span>
                  <span className="text-emerald-400">FREE</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>GST & Service Taxes (18%)</span>
                  <span className="text-slate-400">₹0.00 (Promo)</span>
                </div>
                <div className="pt-2 mt-2 border-t border-slate-700/80 flex justify-between text-sm font-bold text-white">
                  <span>Total Amount Due</span>
                  <span className="text-base text-indigo-400">₹{selectedService.price}.00</span>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-3">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Select Payment Option
                </label>

                {/* Option 1: Pay at Salon Counter */}
                <div
                  onClick={() => setPaymentMethod('COUNTER')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'COUNTER'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400">
                        <Banknote className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h5 className="text-sm font-semibold text-white">Pay at Salon Counter (1-Tap)</h5>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Recommended
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">
                          No advance payment required. Pay via cash, card, or UPI after your haircut.
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'COUNTER' && <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
                  </div>
                </div>

                {/* Option 2: Instant UPI */}
                <div
                  onClick={() => setPaymentMethod('UPI')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'UPI'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">Instant UPI (GPay, PhonePe, Paytm)</h5>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Instant digital checkout via your preferred UPI app.
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'UPI' && <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
                  </div>

                  {paymentMethod === 'UPI' && (
                    <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center gap-3">
                      <input
                        type="text"
                        placeholder="yourname@okhdfcbank"
                        defaultValue={user?.email ? `${user.email.split('@')[0]}@okaxis` : 'rahul@okhdfcbank'}
                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="button"
                        className="px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"
                      >
                        Verify UPI ID
                      </button>
                    </div>
                  )}
                </div>

                {/* Option 3: Credit/Debit Card */}
                <div
                  onClick={() => setPaymentMethod('CARD')}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === 'CARD'
                      ? 'bg-indigo-950/40 border-indigo-500 ring-1 ring-indigo-500'
                      : 'bg-slate-800/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400">
                        <CreditCard className="w-5 h-5" />
                      </div>
                      <div>
                        <h5 className="text-sm font-semibold text-white">Credit / Debit Card</h5>
                        <p className="text-xs text-slate-400 mt-0.5">
                          Visa, MasterCard, RuPay with 3D Secure OTP verification.
                        </p>
                      </div>
                    </div>
                    {paymentMethod === 'CARD' && <CheckCircle2 className="w-5 h-5 text-indigo-400 flex-shrink-0" />}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-400 justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>Safe & Secure 256-bit SSL encrypted transaction</span>
              </div>
            </div>
          )}

          {/* Success Dialog Overlay */}
          {isSuccess && (
            <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-4 shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Token #108 Confirmed!</h3>
              <p className="text-sm text-slate-300 mt-2 max-w-sm">
                You are in line at <strong className="text-white">{salon.name}</strong>. Estimated wait time is ~{salon.currentWaitMinutes} mins.
              </p>
              <div className="flex items-center gap-2 mt-5 text-xs text-indigo-400 font-semibold">
                <div className="w-3.5 h-3.5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
                <span>Redirecting to your live queue tracker...</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between">
          <div>
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                disabled={isSubmitting || isSuccess}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleNext}
              disabled={isSubmitting || isSuccess}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all ${
                step === 4
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30'
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing...</span>
                </>
              ) : step === 1 ? (
                <>
                  <span>Select Stylist & Slot</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : step === 2 ? (
                <>
                  <span>Review Token Details</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : step === 3 ? (
                <>
                  <span>Proceed to Payment</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm & Issue Token #108 (₹{selectedService.price})</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
