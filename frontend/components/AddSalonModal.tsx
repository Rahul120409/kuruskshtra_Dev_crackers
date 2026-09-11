'use client';

import React, { useState, useEffect } from 'react';
import { 
  X, 
  Store, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  Clock, 
  Image as ImageIcon, 
  FileText, 
  Link as LinkIcon, 
  CheckCircle2, 
  Plus,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { salonService, CreateSalonRequest } from '../services/salonService';
import { getAllStaffApi } from '../app/services/staff';
import { getAllUsersApi } from '../app/services/auth';
import { Salon } from '../types';

interface AddSalonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSalonCreated: (newSalon: Salon) => void;
}

export const AddSalonModal: React.FC<AddSalonModalProps> = ({
  isOpen,
  onClose,
  onSalonCreated,
}) => {
  const [formData, setFormData] = useState<CreateSalonRequest>({
    salonName: 'Style Studio',
    ownerName: '',
    phoneNumber: '9876543210',
    email: 'stylestudio.baner@gmail.com',
    salonAddress: 'High Street, Baner, Pune',
    city: 'Pune',
    pincode: '411045',
    salonLogo: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=500',
    salonDescription: 'Premium unisex salon providing bespoke haircuts, styling, beard grooming, and beauty treatments.',
    locationLink: 'https://maps.google.com/?q=Baner+Pune+Style+Studio',
    openingTime: '09:00',
    closingTime: '21:00',
  });

  const [staffOptions, setStaffOptions] = useState<{ id: string; name: string; email: string; phone: string; role?: string }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadStaff() {
      try {
        const staffRes = await getAllStaffApi();
        const usersRes = await getAllUsersApi();
        const list: { id: string; name: string; email: string; phone: string; role?: string }[] = [];
        const seen = new Set<string>();

        if (usersRes.success && Array.isArray(usersRes.data)) {
          usersRes.data
            .filter((u) => {
              const roleUpper = (u.role || '').toUpperCase();
              return roleUpper === 'STAFF' || roleUpper === 'ROLE_STAFF';
            })
            .forEach((u) => {
              const key = u.name ? u.name.trim().toLowerCase() : '';
              if (key && !seen.has(key)) {
                seen.add(key);
                list.push({
                  id: u.id,
                  name: u.name,
                  email: u.email || '',
                  phone: u.mobileNumber || u.phone || '',
                  role: 'STAFF',
                });
              }
            });
        }

        setStaffOptions(list);
        if (list.length > 0 && !formData.ownerName) {
          setFormData((prev) => ({
            ...prev,
            ownerName: list[0].name,
            email: list[0].email || prev.email,
            phoneNumber: list[0].phone || prev.phoneNumber,
          }));
        }
      } catch (e) {
        console.warn('Failed to fetch staff for salon modal:', e);
      }
    }

    if (isOpen) {
      loadStaff();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await salonService.createSalon(formData);
      if (res.success && res.salon) {
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
          });
        } catch {
          // Ignore
        }

        onSalonCreated(res.salon);
        onClose();
      } else {
        setErrorMsg(res.message || 'Failed to create salon');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error communicating with backend');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-950/80 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Register Partner Salon</h3>
              <p className="text-xs text-slate-400">Live integration with POST /api/salons</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Salon Name */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-indigo-400" />
                <span>Salon Name</span>
              </label>
              <input
                type="text"
                required
                value={formData.salonName}
                onChange={(e) => setFormData({ ...formData, salonName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Owner Name Dropdown */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Owner Name (Staff)</span>
                </span>
                <span className="text-[10px] text-indigo-400">Database Staff</span>
              </label>
              <select
                required
                value={formData.ownerName}
                onChange={(e) => {
                  const selectedName = e.target.value;
                  const matched = staffOptions.find((s) => s.name === selectedName);
                  setFormData({
                    ...formData,
                    ownerName: selectedName,
                    ...(matched?.email ? { email: matched.email } : {}),
                    ...(matched?.phone ? { phoneNumber: matched.phone } : {}),
                  });
                }}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              >
                <option value="">-- Select Staff Member (Owner) --</option>
                {staffOptions.map((staff) => (
                  <option key={staff.id || staff.name} value={staff.name}>
                    {staff.name} {staff.role ? `(${staff.role})` : ''} {staff.email ? `• ${staff.email}` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Phone Number */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Phone Number</span>
              </label>
              <input
                type="tel"
                required
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-indigo-400" />
                <span>Email Address</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Address */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Salon Address</span>
              </label>
              <input
                type="text"
                required
                value={formData.salonAddress}
                onChange={(e) => setFormData({ ...formData, salonAddress: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* City */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">City</label>
              <input
                type="text"
                required
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Pincode */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Pincode</label>
              <input
                type="text"
                required
                value={formData.pincode}
                onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Opening Time */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Opening Time (HH:mm)</span>
              </label>
              <input
                type="text"
                required
                value={formData.openingTime}
                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                placeholder="09:00"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Closing Time */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-indigo-400" />
                <span>Closing Time (HH:mm)</span>
              </label>
              <input
                type="text"
                required
                value={formData.closingTime}
                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
                placeholder="21:00"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Logo URL */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Salon Logo Image URL</span>
              </label>
              <input
                type="url"
                required
                value={formData.salonLogo}
                onChange={(e) => setFormData({ ...formData, salonLogo: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Location Link */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Maps Location Link</span>
              </label>
              <input
                type="url"
                value={formData.locationLink || ''}
                onChange={(e) => setFormData({ ...formData, locationLink: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

            {/* Description */}
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>Salon Description</span>
              </label>
              <textarea
                rows={2}
                value={formData.salonDescription}
                onChange={(e) => setFormData({ ...formData, salonDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 focus:border-indigo-500 text-xs text-white focus:outline-none"
              />
            </div>

          </div>

          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/20 transition-all"
            >
              {isSubmitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Register Salon on Live Server</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
