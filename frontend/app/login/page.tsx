'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Lock, 
  Mail, 
  Phone, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  ArrowLeft,
  Check,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { ThemeToggle } from '../../components/ThemeToggle';
import { BrandLogo } from '../../components/BrandLogo';

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginUser } = useCustomer();

  const redirectUrl = searchParams.get('redirect') || '/home';

  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [loggedInRole, setLoggedInRole] = useState<string>('');

  // Live criteria validation
  const trimmed = emailOrPhone.trim();
  const isInputEmail = trimmed.includes('@');
  const cleanDigits = trimmed.replace(/\D/g, '');
  const isInputExact10Phone = !isInputEmail && cleanDigits.length === 10;
  const isEmailValidFormat = isInputEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
  const isIdentifierValid = isEmailValidFormat || isInputExact10Phone;
  const isPasswordMin8 = password.length >= 8;
  const isFormReady = isIdentifierValid && isPasswordMin8;

  const handleIdentifierChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // If user starts typing numeric digits without @, restrict to 10 digits
    if (!val.includes('@') && /^\d+$/.test(val)) {
      setEmailOrPhone(val.slice(0, 10));
    } else {
      setEmailOrPhone(val);
    }
    setErrorMessage(null);
    setIsNotRegistered(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsNotRegistered(false);

    if (!trimmed) {
      setErrorMessage('Please enter your email or 10-digit mobile number.');
      return;
    }

    if (trimmed.includes('@')) {
      if (!isEmailValidFormat) {
        setErrorMessage('Please enter a valid email address containing @ and a valid domain (e.g., user@example.com).');
        return;
      }
    } else {
      if (cleanDigits.length !== 10) {
        setErrorMessage('Mobile phone number must be exactly 10 digits.');
        return;
      }
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    if (password.length < 8) {
      setErrorMessage('Password must be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser(trimmed, password);

      if (!res.success) {
        setErrorMessage(res.error || 'Invalid credentials. Please verify your email/phone and password.');
        if (res.error?.toLowerCase().includes('not registered') || res.error?.toLowerCase().includes('not found')) {
          setIsNotRegistered(true);
        }
      } else {
        setIsSuccess(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('salonflow_show_location_prompt', 'true');
        }

        const userRole = (res.user?.role || '').toUpperCase();
        setLoggedInRole(userRole);
        const isAdmin = userRole === 'ADMIN' || userRole === 'ROLE_ADMIN';
        const isStaff = userRole === 'STAFF' || userRole === 'ROLE_STAFF' || userRole === 'SALON';

        let targetUrl = redirectUrl;
        if (isAdmin) {
          targetUrl = '/admin';
        } else if (isStaff) {
          targetUrl = '/salon';
        } else if (redirectUrl === '/home' || redirectUrl === '/admin') {
          targetUrl = '/home';
        }

        setTimeout(() => {
          router.push(targetUrl);
        }, 500);
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
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 dark:bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Top Navigation Row: Back to Home + Theme Toggle */}
      <div className="w-full max-w-md flex items-center justify-between mb-4 sm:mb-6 relative z-10">
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

      {/* Main Login Card */}
      <div className="w-full max-w-md rounded-2xl sm:rounded-3xl bg-white/95 dark:bg-[#11141e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 p-5 sm:p-9 shadow-[0_20px_50px_rgba(0,0,0,0.08)] dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)] relative z-10 space-y-5 sm:space-y-6">
        
        {/* Brand Crest & Heading */}
        <div className="text-center space-y-2.5 flex flex-col items-center">
          <BrandLogo size="lg" variant="full" showTagline tagline="SMART SALON NETWORK" />

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white pt-1">
            Sign In to NovaQ
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
            Enter your credentials to access live smart queues, AI hairstyle studio, and atelier chair bookings.
          </p>
        </div>

        {/* Error Notification */}
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-start gap-2.5 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold leading-relaxed">{errorMessage}</p>
              {isNotRegistered && (
                <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-900/50">
                  <Link
                    href={`/register?email=${encodeURIComponent(emailOrPhone)}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                  >
                    <span>Create a new account now</span>
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
              {loggedInRole === 'ADMIN' || loggedInRole === 'ROLE_ADMIN'
                ? 'Admin verified! Opening operations portal...'
                : loggedInRole === 'STAFF' || loggedInRole === 'ROLE_STAFF' || loggedInRole === 'SALON'
                ? 'Staff verified! Opening salon portal...'
                : 'Login successful! Opening your dashboard...'}
            </span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email or Phone Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Email or Mobile Number
              </label>
              {trimmed && (
                <span className={`text-[11px] font-mono font-bold ${
                  isIdentifierValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'
                }`}>
                  {isInputEmail 
                    ? (isEmailValidFormat ? 'Valid Email' : 'Include @ and domain') 
                    : `${cleanDigits.length}/10 digits`}
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              {isInputEmail ? (
                <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
              ) : (
                <Phone className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
              )}
              <input
                type="text"
                placeholder="name@example.com or 10-digit mobile"
                value={emailOrPhone}
                onChange={handleIdentifierChange}
                className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                Password
              </label>
              {password && (
                <span className={`text-[11px] font-mono font-bold ${
                  isPasswordMin8 ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'
                }`}>
                  {password.length}/8 min chars
                </span>
              )}
            </div>

            <div className="relative flex items-center">
              <Lock className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter password (at least 8 characters)"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMessage(null);
                }}
                className="w-full pl-10 pr-11 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 absolute right-2.5 cursor-pointer rounded-lg transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Validation Requirements Checklist Box */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              <span>Input Validation Criteria</span>
            </div>
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              
              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isIdentifierValid ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isIdentifierValid ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                </span>
                <span>Email containing <strong>@</strong> OR exact <strong>10-digit</strong> mobile</span>
              </div>

              <div className="flex items-center gap-2">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
                  isPasswordMin8 ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                }`}>
                  {isPasswordMin8 ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : '•'}
                </span>
                <span>Password must be at least <strong>8 characters</strong></span>
              </div>

            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || isSuccess}
            className="w-full h-12 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm sm:text-base shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 mt-4 cursor-pointer"
          >
            <span>{isLoading ? 'Verifying Credentials...' : 'Sign In & Access Platform'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Alternate link to Register */}
        <div className="text-center pt-3 border-t border-slate-200 dark:border-slate-800 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
          Don't have an account yet?{' '}
          <Link
            href={`/register?redirect=${encodeURIComponent(redirectUrl)}`}
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline ml-1"
          >
            Create an Account →
          </Link>
        </div>

      </div>

      {/* Security note */}
      <div className="w-full max-w-md text-center text-[11px] sm:text-xs text-slate-500 dark:text-slate-500 mt-4 sm:mt-6">
        Protected by NovaQ 256-Bit SSL Atelier Encryption.
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 text-sm">Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
