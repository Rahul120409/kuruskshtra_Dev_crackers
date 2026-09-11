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
  BookmarkCheck
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { DEMO_HAIRSTYLES } from '../../services/mockData';

const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300&q=80',
];

const PUNE_AREAS = [
  'Koregaon Park',
  'Baner',
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

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dob: user?.dob || '1998-05-14',
    gender: user?.gender || 'Male',
    preferredArea: user?.preferredArea || 'Koregaon Park',
    hairNotes: user?.hairNotes || 'Medium fade on sides, textured scissor crop on top',
    profileImage: user?.profileImage || AVATAR_PRESETS[0],
  });

  const handleStartEdit = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        dob: user.dob || '1998-05-14',
        gender: user.gender || 'Male',
        preferredArea: user.preferredArea || 'Koregaon Park',
        hairNotes: user.hairNotes || 'Medium fade on sides, textured crop on top',
        profileImage: user.profileImage || AVATAR_PRESETS[0],
      });
    }
    setIsEditing(true);
    setSavedSuccess(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateUserProfile({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender as any,
        preferredArea: formData.preferredArea,
        hairNotes: formData.hairNotes,
        profileImage: formData.profileImage,
      });

      setIsSaving(false);
      setIsEditing(false);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to update profile:', err);
      setIsSaving(false);
    }
  };

  const pastVisits = [
    {
      id: 'visit-01',
      date: '24 Aug 2026',
      service: 'Precision Signature Haircut',
      stylist: 'Vikram Joshi',
      price: 499,
      status: 'COMPLETED',
      hairstyle: 'Textured Crop (HS01)',
    },
    {
      id: 'visit-02',
      date: '12 Jul 2026',
      service: 'Royal Beard Sculpt & Hot Towel',
      stylist: 'Karan Malhotra',
      price: 349,
      status: 'COMPLETED',
      hairstyle: 'Beard Sculpt & Fade',
    },
  ];

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
          <User className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Sign In to View Profile</h2>
        <p className="text-xs text-slate-400">
          Sign in to manage your styling records, appointments, and personal preferences.
        </p>
        <div className="pt-2">
          <Link
            href="/login?redirect=/profile"
            className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
          >
            <span>Sign In to Your Account</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Notification */}
      {savedSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>Profile information updated successfully!</span>
          </div>
          <button onClick={() => setSavedSuccess(false)} className="text-emerald-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Main Profile Presentation or Edit Form */}
      <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-xl">
        
        {!isEditing ? (
          /* ================= VIEW MODE ================= */
          <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
              <img
                src={user.profileImage || AVATAR_PRESETS[0]}
                alt={user.name}
                className="w-24 h-24 rounded-2xl object-cover border-2 border-indigo-500 shadow-xl shadow-indigo-500/10 flex-shrink-0"
              />
              <div className="space-y-2">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h1 className="text-2xl font-extrabold text-white tracking-tight">{user.name}</h1>
                  <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase border border-indigo-500/30">
                    {user.role}
                  </span>
                </div>
                
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-indigo-400" />
                    {user.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-indigo-400" />
                    {user.phone}
                  </span>
                </div>

                {/* Additional Profile Attributes */}
                <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-xs">
                  {user.gender && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                      Gender: <strong className="text-white">{user.gender}</strong>
                    </span>
                  )}
                  {user.dob && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium">
                      DOB: <strong className="text-white">{user.dob}</strong>
                    </span>
                  )}
                  {user.preferredArea && (
                    <span className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-indigo-400" />
                      <span>{user.preferredArea}</span>
                    </span>
                  )}
                  <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-bold">
                    ★ 2 Pune Visits
                  </span>
                </div>

                {user.hairNotes && (
                  <div className="pt-1 text-xs text-slate-400 flex items-center gap-1.5 justify-center sm:justify-start">
                    <Scissors className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Cut Preference: <strong className="text-slate-200">{user.hairNotes}</strong></span>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Profile & Action Buttons */}
            <div className="flex sm:flex-col items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={handleStartEdit}
                className="flex-1 sm:flex-initial w-full px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-indigo-600/20 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile</span>
              </button>

              <Link
                href="/appointments"
                className="flex-1 sm:flex-initial w-full px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-colors"
              >
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>My Appointments ({appointments.length})</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ================= EDIT MODE FORM ================= */
          <form onSubmit={handleSaveProfile} className="space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Edit Your Profile</h3>
                  <p className="text-xs text-slate-400">Update your personal details, preferred location, and styling notes.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                title="Cancel Edit"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Avatar Selection */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                Profile Avatar
              </label>
              <div className="flex items-center gap-4">
                <img
                  src={formData.profileImage}
                  alt="Selected Avatar"
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-indigo-500 shadow-md"
                />
                <div className="space-y-1.5">
                  <span className="text-[11px] text-slate-400 block">Choose an avatar preset:</span>
                  <div className="flex items-center gap-2">
                    {AVATAR_PRESETS.map((url, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormData({ ...formData, profileImage: url })}
                        className={`w-9 h-9 rounded-xl overflow-hidden border-2 transition-all ${
                          formData.profileImage === url
                            ? 'border-indigo-500 ring-2 ring-indigo-500/40 scale-105'
                            : 'border-slate-700 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={url} alt="Preset" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Inputs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Mobile Number</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. rahul@example.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Date of Birth (DOB) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Date of Birth (DOB)</label>
                <input
                  type="date"
                  value={formData.dob}
                  onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Gender */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as any })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              {/* Preferred Salon Area */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Preferred Pune Locality</label>
                <select
                  value={formData.preferredArea}
                  onChange={(e) => setFormData({ ...formData, preferredArea: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none transition-colors"
                >
                  {PUNE_AREAS.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

            </div>

            {/* Styling Notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">
                Personal Haircut & Barber Styling Instructions
              </label>
              <textarea
                rows={2}
                value={formData.hairNotes}
                onChange={(e) => setFormData({ ...formData, hairNotes: e.target.value })}
                placeholder="e.g. Low skin fade, leave length on top, blend sideburns..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white placeholder-slate-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
              >
                {isSaving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving Changes...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Profile Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

      </div>

      {/* Active Token Quick Access */}
      {activeToken && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(activeToken.status) && (
        <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold font-mono shadow">
              #{activeToken.tokenNumber}
            </div>
            <div>
              <p className="text-xs font-bold text-white">Active Live Queue Pass #{activeToken.tokenNumber}</p>
              <p className="text-[11px] text-slate-400">
                Position {activeToken.position} • {activeToken.estimatedWait} mins wait • {activeToken.serviceName}
              </p>
            </div>
          </div>
          <Link
            href="/queue"
            className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors"
          >
            Track Live
          </Link>
        </div>
      )}

      {/* Saved AI Hairstyle Styles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Saved AI Hairstyle Matches</span>
          </h2>
          <Link href="/ai-recommend" className="text-xs text-indigo-400 hover:underline">
            Retake Scan
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {DEMO_HAIRSTYLES.slice(0, 2).map((style) => (
            <div
              key={style.id}
              className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <img
                  src={style.imageUrl}
                  alt={style.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-800"
                />
                <div>
                  <span className="text-[10px] font-mono text-indigo-400 font-bold">[{style.id}] 95% Match</span>
                  <h3 className="text-sm font-bold text-white">{style.name}</h3>
                  <p className="text-[11px] text-slate-400 line-clamp-1">{style.description}</p>
                </div>
              </div>
              <Link
                href={`/appointments`}
                className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-300 text-xs font-semibold transition-colors"
                title="Book this style"
              >
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Past Salon Visits History */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <History className="w-4 h-4 text-indigo-400" />
          <span>Past Visits & Receipts</span>
        </h2>

        <div className="space-y-3">
          {pastVisits.map((visit) => (
            <div
              key={visit.id}
              className="p-4 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">{visit.service}</span>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/30">
                    {visit.status}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Stylist: <span className="text-slate-200">{visit.stylist}</span> • Style: {visit.hairstyle} • {visit.date}
                </p>
              </div>

              <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                <span className="text-sm font-mono font-bold text-indigo-300">₹{visit.price}</span>
                <Link
                  href="/feedback"
                  className="text-xs font-semibold text-slate-400 hover:text-indigo-400 transition-colors"
                >
                  View Review
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Dedicated Full-Width Logout Action Card */}
      <div className="pt-4 border-t border-slate-800">
        <button
          onClick={logoutUser}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
        >
          <LogOut className="w-4 h-4 text-rose-400" />
          <span>Log Out of SalonFlow AI Account</span>
        </button>
      </div>

    </div>
  );
}
