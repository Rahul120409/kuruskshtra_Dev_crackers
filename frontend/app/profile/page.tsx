'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  Clock, 
  Sparkles, 
  Scissors, 
  ArrowRight, 
  LogOut,
  History,
  CheckCircle2,
  Edit3,
  Save,
  X,
  MapPin,
  Camera,
  ShieldCheck,
  BookmarkCheck,
  Award,
  Crown,
  Zap,
  Star,
  ChevronRight,
  Receipt
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
];

const PUNE_AREAS = [
  'Baner',
  'Koregaon Park',
  'Viman Nagar',
  'Kalyani Nagar',
  'Aundh',
  'Kothrud',
  'Hinjawadi',
  'Wakad'
];

export default function ProfilePage() {
  const { user, activeToken, logoutUser, updateUserProfile, appointments } = useCustomer();

  // Edit Mode state
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);
  const [customAvatarInput, setCustomAvatarInput] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob ? user.dob.split('T')[0] : '',
    gender: user?.gender || 'Male',
    preferredArea: user?.preferredArea || 'Baner',
    hairNotes: user?.hairNotes || '',
    profileImage: user?.profileImage || AVATAR_PRESETS[0],
  });

  // Keep form fields synchronized with user state when not actively editing
  React.useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: user.gender || 'Male',
        preferredArea: user.preferredArea || 'Baner',
        hairNotes: user.hairNotes || '',
        profileImage: user.profileImage || AVATAR_PRESETS[0],
      });
    }
  }, [user, isEditing]);

  const handleStartEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: user.gender || 'Male',
        preferredArea: user.preferredArea || 'Baner',
        hairNotes: user.hairNotes || '',
        profileImage: user.profileImage || AVATAR_PRESETS[0],
      });
    }
    setErrorMessage(null);
    setIsEditing(true);
    setSavedSuccess(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);

    // Form input validations
    if (!formData.name.trim()) {
      setErrorMessage('Please provide your full name.');
      setIsSaving(false);
      return;
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      setErrorMessage('Please enter a valid email address.');
      setIsSaving(false);
      return;
    }

    const cleanPhone = formData.phone.replace(/\D/g, '');
    if (!cleanPhone || cleanPhone.length < 10) {
      setErrorMessage('Please enter a valid 10-digit mobile number.');
      setIsSaving(false);
      return;
    }

    try {
      const res = await updateUserProfile({
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: cleanPhone,
        dob: formData.dob || undefined,
        gender: formData.gender as any,
        preferredArea: formData.preferredArea,
        hairNotes: formData.hairNotes.trim(),
        profileImage: formData.profileImage,
      });

      if (res && !res.success) {
        setErrorMessage(res.error || 'Server rejected profile update. Please verify your details.');
        setIsSaving(false);
        return;
      }

      setIsSaving(false);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4500);
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      setErrorMessage(err?.message || 'An unexpected connection error occurred.');
      setIsSaving(false);
    }
  };

  const completedVisits = appointments.filter((a) => a.status === 'COMPLETED');
  const loyaltyPoints = Math.max(150, completedVisits.length * 100 + 50);

  if (!user) {
    return (
      <div className="w-full min-h-[70vh] flex items-center justify-center px-4 py-20 bg-slate-50 dark:bg-[#07080c] text-slate-900 dark:text-white transition-colors">
        <div className="max-w-md w-full p-8 rounded-3xl bg-white/95 dark:bg-[#11141e]/95 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-center mx-auto text-amber-500 shadow-inner">
            <User className="w-8 h-8" />
          </div>
          <div className="space-y-1.5">
            <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              Member Sign-In Required
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Sign in to manage your styling specifications, live token passes, and atelier privileges.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/login?redirect=/profile"
              className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all"
            >
              <span>Sign In to Your Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#07080c] text-slate-900 dark:text-white transition-colors duration-200">
      
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 space-y-8 sm:space-y-10">
        
        {/* =========================================================================
            HEADER: CLIENT DOSSIER & VIP STATUS
            ========================================================================= */}
        <div className="space-y-2 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Crown className="w-3.5 h-3.5" />
            <span>NovaQ VIP Haute Membership</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Client Dossier •{' '}
              <span className="font-serif italic font-normal bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                {user.name.split(' ')[0]}
              </span>
            </h1>
            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
              Member ID: NQ-{user.id?.slice(-6).toUpperCase() || 'VIP01'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
            Manage your personal grooming passport, styling specifications, and past atelier appointment receipts.
          </p>
        </div>

        {/* Toast Notification */}
        {savedSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
              <span>Profile information and styling specifications updated successfully!</span>
            </div>
            <button 
              type="button"
              onClick={() => setSavedSuccess(false)} 
              className="text-emerald-600 dark:text-emerald-400 hover:opacity-80 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* =========================================================================
            SECTION 1: VIP PRESENTATION CARD OR EDIT FORM
            ========================================================================= */}
        <div className="rounded-3xl bg-white/95 dark:bg-[#11141e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 p-6 sm:p-8 shadow-sm">
          
          {!isEditing ? (
            /* ================= VIEW MODE: LUXURY MEMBERSHIP PASSPORT ================= */
            <div className="space-y-6">
              
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                
                {/* Avatar & Main Identity */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                  <div className="relative shrink-0 group">
                    <img
                      src={user.profileImage || AVATAR_PRESETS[0]}
                      alt={user.name}
                      className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl object-cover ring-4 ring-amber-500/25 dark:ring-amber-500/35 shadow-2xl transition-transform duration-300 group-hover:scale-[1.02]"
                    />
                    <div className="absolute -bottom-2 -left-2 p-1.5 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 text-white shadow-md">
                      <Crown className="w-4 h-4" />
                    </div>
                    {/* Quick Avatar Edit Trigger */}
                    <button
                      type="button"
                      onClick={handleStartEdit}
                      className="absolute -bottom-2 -right-2 p-2 rounded-xl bg-gradient-to-tr from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white shadow-lg ring-2 ring-white dark:ring-[#11141e] hover:scale-110 active:scale-95 transition-all cursor-pointer"
                      title="Edit photo & details"
                    >
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                      <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                        {user.name}
                      </h2>
                      <span className="px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-mono font-bold uppercase">
                        {user.role || 'VIP Client'}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-600 dark:text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-amber-500" />
                        <span>{user.email || 'No email specified'}</span>
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-amber-500" />
                        <span>{user.phone || 'No mobile linked'}</span>
                      </span>
                    </div>

                    {/* Member Details Pills */}
                    <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                      {user.gender && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          Gender: <strong className="text-slate-900 dark:text-white">{user.gender}</strong>
                        </span>
                      )}
                      {user.dob && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                          DOB: <strong className="text-slate-900 dark:text-white">{user.dob}</strong>
                        </span>
                      )}
                      {user.preferredArea && (
                        <span className="px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-medium flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-amber-500" />
                          <span>{user.preferredArea}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Primary Profile Actions */}
                <div className="flex sm:flex-row lg:flex-col items-center gap-3 w-full lg:w-52 shrink-0">
                  <button
                    type="button"
                    onClick={handleStartEdit}
                    className="relative group overflow-hidden w-full rounded-2xl p-[1px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer"
                  >
                    <div className="h-12 w-full px-5 rounded-[15px] bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 group-hover:from-amber-600 group-hover:to-amber-800 flex items-center justify-center gap-2.5 text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all">
                      <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:rotate-12 transition-transform duration-200 shrink-0">
                        <Edit3 className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span>Edit Profile</span>
                      <ChevronRight className="w-4 h-4 text-white/70 group-hover:translate-x-0.5 transition-transform shrink-0" />
                    </div>
                    {/* Shimmer effect on hover */}
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
                  </button>

                  <Link
                    href="/home"
                    className="w-full h-12 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-900/80 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5 active:translate-y-0"
                  >
                    <Scissors className="w-3.5 h-3.5 text-amber-500" />
                    <span>Find Ateliers</span>
                  </Link>
                </div>

              </div>

              {/* 4-Metric Membership Privileges Bar */}
              <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                
                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Atelier Visits</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white">
                    {completedVisits.length}
                  </div>
                  <div className="text-[11px] font-semibold text-emerald-500">
                    Completed Sessions
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">LuxePoints</div>
                  <div className="text-xl sm:text-2xl font-black font-mono text-amber-500">
                    {loyaltyPoints}
                  </div>
                  <div className="text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                    Reward Tier Available
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Priority Pass</div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-500">
                    Active
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Fast-Track Turnaround
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Preferred District</div>
                  <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white truncate">
                    {user.preferredArea || 'Baner, Pune'}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    Primary Atelier Hub
                  </div>
                </div>

              </div>

              {/* Personal Styling Specifications Card */}
              {user.hairNotes && (
                <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
                    <Scissors className="w-3.5 h-3.5" />
                    <span>Styling Specifications for Your Master Barber</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                    "{user.hairNotes}"
                  </p>
                </div>
              )}

            </div>
          ) : (
            /* ================= EDIT MODE: LUXURY ATELIER FORM ================= */
            <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in duration-200">
              
              <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                    <Edit3 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      Edit Client Dossier
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Update your contact information, preferred district, and styling notes.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Cancel Edit"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Error Notification Banner */}
              {errorMessage && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs sm:text-sm font-semibold flex items-center justify-between shadow-xs animate-in fade-in">
                  <div className="flex items-center gap-2.5">
                    <div className="w-5 h-5 rounded-full bg-rose-500/20 text-rose-500 flex items-center justify-center font-bold text-xs shrink-0">
                      !
                    </div>
                    <span>{errorMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-rose-500 hover:text-rose-700 dark:hover:text-rose-300 p-1 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Avatar Preset Selection */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block">
                  Profile Avatar Selection
                </label>
                <div className="flex items-center gap-5 flex-wrap">
                  <img
                    src={formData.profileImage || AVATAR_PRESETS[0]}
                    alt="Selected Avatar"
                    className="w-16 h-16 rounded-2xl object-cover ring-2 ring-amber-500 shadow-md shrink-0"
                  />
                  <div className="space-y-2">
                    <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                      Choose an atelier portrait preset:
                    </span>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      {AVATAR_PRESETS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setFormData({ ...formData, profileImage: url })}
                          className={`w-10 h-10 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                            formData.profileImage === url
                              ? 'border-amber-500 ring-2 ring-amber-500/40 scale-105 shadow-md'
                              : 'border-slate-200 dark:border-slate-800 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>

                    <div>
                      <button
                        type="button"
                        onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                        className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer pt-0.5"
                      >
                        <Camera className="w-3 h-3" />
                        <span>{showCustomAvatarInput ? 'Hide custom URL' : 'Or enter custom photo link'}</span>
                      </button>
                      {showCustomAvatarInput && (
                        <div className="mt-2 flex items-center gap-2 max-w-sm animate-in fade-in">
                          <input
                            type="url"
                            value={customAvatarInput}
                            onChange={(e) => setCustomAvatarInput(e.target.value)}
                            placeholder="https://example.com/photo.jpg"
                            className="flex-1 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              if (customAvatarInput.trim()) {
                                setFormData({ ...formData, profileImage: customAvatarInput.trim() });
                                setCustomAvatarInput('');
                                setShowCustomAvatarInput(false);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs cursor-pointer"
                          >
                            Apply
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Input Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                
                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                {/* Mobile Number */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                {/* Email Address */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="e.g. rahul@example.com"
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all"
                  />
                </div>

                {/* Date of Birth */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Date of Birth (DOB)
                  </label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-all"
                  />
                </div>

                {/* Gender */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Gender
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-all cursor-pointer"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                {/* Preferred Area */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                    Preferred Pune Locality
                  </label>
                  <select
                    value={formData.preferredArea}
                    onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none transition-all cursor-pointer"
                  >
                    {PUNE_AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Personal Styling Instructions */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
                  Personal Haircut & Barber Styling Instructions
                </label>
                <textarea
                  rows={3}
                  value={formData.hairNotes}
                  onChange={(e) => setFormData({ ...formData, hairNotes: e.target.value })}
                  placeholder="e.g. Low skin taper, keep length on crown, textured scissor cut, natural beard blend..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/25 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none transition-all"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setErrorMessage(null);
                  }}
                  className="h-12 px-6 rounded-2xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 transition-all cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSaving}
                  className="relative group overflow-hidden rounded-2xl p-[1px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  <div className="h-12 px-7 rounded-[15px] bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 group-hover:from-amber-600 group-hover:to-amber-800 flex items-center justify-center gap-2.5 text-white font-extrabold text-xs sm:text-sm tracking-wide transition-all">
                    {isSaving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin shrink-0" />
                        <span>Saving to Database...</span>
                      </>
                    ) : (
                      <>
                        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                          <Save className="w-3.5 h-3.5 text-white" />
                        </div>
                        <span>Save Profile Changes</span>
                      </>
                    )}
                  </div>
                  {/* Shimmer line */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
                </button>
              </div>

            </form>
          )}

        </div>

        {/* =========================================================================
            SECTION 2: ACTIVE TOKEN PASS (WHEN CUSTOMER HAS A LIVE TICKET)
            ========================================================================= */}
        {activeToken && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(activeToken.status) && (
          <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/40 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 font-black font-mono text-lg flex items-center justify-center shadow-md shrink-0">
                #{activeToken.tokenNumber}
              </div>
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <p className="text-xs font-bold text-slate-900 dark:text-white">
                    Live Token Pass at {activeToken.salonName}
                  </p>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Position {activeToken.position} • ~{activeToken.estimatedWait} mins wait • {activeToken.serviceName}
                </p>
              </div>
            </div>

            <Link
              href="/queue"
              className="h-11 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs flex items-center gap-2 shadow-md hover:from-amber-600 hover:to-amber-700 transition-all shrink-0 cursor-pointer"
            >
              <span>Track Live Queue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}

        {/* =========================================================================
            SECTION 3: SAVED AI HAIRSTYLE MATCHES & CONSULTATIONS
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Saved AI Hairstyle Matches
              </h2>
            </div>
            <Link 
              href="/ai-recommend" 
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Launch Face Scan</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#11141e]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-slate-900 dark:text-white">
                No custom AI hairstyles saved yet
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Scan your facial geometry to receive personalized cut &amp; beard recommendations tailored to your face shape.
              </p>
            </div>
            <Link
              href="/ai-recommend"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white text-xs font-bold transition-all cursor-pointer"
            >
              <span>Scan Face Geometry</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* =========================================================================
            SECTION 4: PAST APPOINTMENTS & DIGITAL RECEIPTS
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Visit History &amp; Receipts
              </h2>
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {completedVisits.length} Records
            </span>
          </div>

          {completedVisits.length === 0 ? (
            <div className="p-6 sm:p-8 rounded-3xl bg-white/80 dark:bg-[#11141e]/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 text-center space-y-2 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
                <Receipt className="w-6 h-6" />
              </div>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                No past completed salon visits yet. Your appointment receipts will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedVisits.map((visit) => (
                <div
                  key={visit.id}
                  className="p-4 sm:p-5 rounded-2xl bg-white/90 dark:bg-[#11141e]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-amber-500/40 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-white">
                        {visit.serviceName}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                        {visit.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Atelier: <strong className="text-slate-800 dark:text-slate-200">{visit.salonName}</strong> • Master Barber: {visit.staffName || 'Artisan'} • {visit.appointmentDate}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 shrink-0">
                    <span className="text-base font-mono font-black text-amber-500">
                      ₹{visit.servicePrice}
                    </span>
                    <Link
                      href="/feedback"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 dark:hover:text-slate-950 text-slate-700 dark:text-slate-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      Leave Review
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            SECTION 5: DEDICATED LOGOUT CARD
            ========================================================================= */}
        <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80">
          <button
            type="button"
            onClick={logoutUser}
            className="w-full min-h-[48px] py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/15 active:bg-rose-500/20 border border-rose-500/25 hover:border-rose-500/40 text-rose-600 dark:text-rose-400 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
            <span>Sign Out of SalonFlow AI Account</span>
          </button>
        </div>

      </div>

    </div>
  );
}
