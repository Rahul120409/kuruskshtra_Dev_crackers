'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  Lock, 
  Calendar,
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useCustomer } from '../../context/CustomerContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BrandLogo } from '../../components/BrandLogo';

function RegisterFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { registerUser } = useCustomer();

  const redirectUrl = searchParams.get('redirect') || '/home';
  const initialEmail = searchParams.get('email') || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState(initialEmail);
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAlreadyRegistered, setIsAlreadyRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live Criteria checks
  const isEmailValid = email.includes('@') && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const isPhoneExact10 = phone.length === 10;
  const isPasswordMin8 = password.length >= 8;
  const isPasswordMatch = password.length > 0 && password === confirmPassword;
  const isNameValid = name.trim().length >= 2;

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Strictly numeric digits, cap at 10 digits
    const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(digitsOnly);
    setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsAlreadyRegistered(false);

    if (!name.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please enter a valid email address containing @.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrorMessage('Please enter a complete email address (e.g., user@example.com).');
      return;
    }

    if (!phone.trim() || phone.length !== 10) {
      setErrorMessage('Mobile phone number must be exactly 10 digits.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please verify your confirm password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await registerUser({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        dob: dob || undefined,
        gender,
        password,
        confirmPassword,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed. Please try again.');
        if (res.error?.toLowerCase().includes('already exists')) {
          setIsAlreadyRegistered(true);
        }
      } else {
        setIsSuccess(true);
        try {
          confetti({
            particleCount: 90,
            spread: 60,
            origin: { y: 0.6 },
          });
        } catch {}

        setTimeout(() => {
          router.push(redirectUrl);
        }, 600);
      }
    } catch (err) {
      setErrorMessage('A connection error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-8 sm:py-12 bg-gradient-to-br from-slate-100 via-amber-50/25 to-slate-50 dark:from-[#08090d] dark:via-[#0f131c] dark:to-[#07080c] text-slate-900 dark:text-white relative overflow-hidden transition-colors duration-200">
      
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Row: Back to Home + Theme Toggle */}
      <div className="w-full max-w-xl flex items-center justify-between mb-4 sm:mb-6 relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-semibold text-slate-700 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-500/50 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        <div className="p-1 rounded-xl bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 flex items-center shadow-sm">
          <ThemeToggle />
        </div>
      </div>

      {/* Main Registration Card */}
      <div className="w-full max-w-xl rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-[#11141e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative z-10 space-y-5 sm:space-y-6">
        
        {/* Brand Crest & Heading */}
        <div className="text-center space-y-2.5 flex flex-col items-center">
          <BrandLogo size="lg" variant="full" showTagline tagline="HAUTE MEMBERSHIP" />

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white pt-1">
            Join NovaQ Haute Membership
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
            Register to unlock live smart queue passes, AI hairstyle analysis, and luxury chair reservations.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold leading-relaxed">{errorMessage}</p>
              {isAlreadyRegistered && (
                <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/50">
                  <Link
                    href={`/login?email=${encodeURIComponent(email)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>Sign in with this account instead</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Success Notification */}
        {isSuccess && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5 animate-in fade-in duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="font-semibold">
              Account created successfully! Redirecting to dashboard...
            </span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Full Name */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Full Name
              </label>
              {name && (
                <span className={`text-[11px] font-mono font-bold ${
                  isNameValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {isNameValid ? '✓ Valid' : 'Min 2 characters'}
                </span>
              )}
            </div>
            <div className="relative flex items-center">
              <User className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type="text"
                placeholder="e.g. Alexander Vance"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Email & Phone Responsive Grid (Stacked on Mobile, 2 Cols on Desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Email Address */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Email Address
                </label>
                {email && (
                  <span className={`text-[11px] font-mono font-bold ${
                    isEmailValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {isEmailValid ? '✓ Contains @' : 'Must include @'}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Mobile Phone (Exact 10 digits) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Mobile Number
                </label>
                <span className={`text-[11px] font-mono font-bold ${
                  isPhoneExact10 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {phone.length}/10 digits
                </span>
              </div>
              <div className="relative flex items-center">
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={phone}
                  onChange={handlePhoneChange}
                  maxLength={10}
                  className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner font-mono"
                />
              </div>
            </div>

          </div>

          {/* DOB & Gender Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* DOB */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Date of Birth
              </label>
              <div className="relative flex items-center">
                <Calendar className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="date"
                  value={dob}
                  max={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Gender Preference
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as any)}
                className="w-full px-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner cursor-pointer"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

          </div>

          {/* Password & Confirm Responsive Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            
            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Password
                </label>
                {password && (
                  <span className={`text-[11px] font-mono font-bold ${
                    isPasswordMin8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                  }`}>
                    {password.length}/8 chars
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Min 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Confirm
                </label>
                {confirmPassword && (
                  <span className={`text-[11px] font-mono font-bold ${
                    isPasswordMatch ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                  }`}>
                    {isPasswordMatch ? '✓ Matches' : 'Mismatch'}
                  </span>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="password"
                  placeholder="Repeat password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
                />
              </div>
            </div>

          </div>

          {/* Validation Requirements Checklist Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Input Validation Requirements</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
              
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isEmailValid ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isEmailValid ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                </span>
                <span>Email containing <strong>@</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isPhoneExact10 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isPhoneExact10 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                </span>
                <span>Phone: <strong>exact 10 digits</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isPasswordMin8 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isPasswordMin8 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                </span>
                <span>Password: <strong>min 8 characters</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isPasswordMatch ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isPasswordMatch ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                </span>
                <span>Passwords must match</span>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
          >
            <span>{isLoading ? 'Creating Account...' : 'Complete Registration & Access App'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Alternate Link to Sign In */}
        <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{' '}
          <Link
            href={`/login?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline ml-1"
          >
            Sign In here →
          </Link>
        </div>

      </div>

      {/* Security note */}
      <div className="w-full max-w-xl text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-500 mt-4 sm:mt-6">
        Protected by NovaQ 256-Bit SSL Atelier Encryption.
      </div>

    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 text-sm">Loading registration...</div>}>
      <RegisterFormContent />
    </Suspense>
  );
}
