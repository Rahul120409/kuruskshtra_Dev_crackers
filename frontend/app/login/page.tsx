'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Scissors, 
  Lock, 
  Mail, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsNotRegistered(false);

    if (!emailOrPhone.trim()) {
      setErrorMessage('Please enter your email or phone number.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await loginUser(emailOrPhone, password);

      if (!res.success) {
        setErrorMessage(res.error || 'Login failed. Please check your credentials.');
        if (res.error?.toLowerCase().includes('not registered')) {
          setIsNotRegistered(true);
        }
      } else {
        setIsSuccess(true);
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('salonflow_show_location_prompt', 'true');
        }

        // Check user role verified from database
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
        }, 600);
      }
    } catch (err) {
      setErrorMessage('A network error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 p-0.5 shadow-lg shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Scissors className="w-6 h-6 text-indigo-400 transform -rotate-45" />
              </div>
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mt-3">
            Sign In to SalonFlow
          </h1>
          <p className="text-xs text-slate-400">
            Enter your credentials to access your dashboard.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl bg-slate-900/80 border border-slate-800 p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-5">
          
          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-3">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{errorMessage}</p>
                {isNotRegistered && (
                  <div className="mt-2.5 pt-2 border-t border-rose-500/20">
                    <Link
                      href={`/register?email=${encodeURIComponent(emailOrPhone)}`}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-500 transition-colors shadow-sm"
                    >
                      <span>Create Account Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Success Banner */}
          {isSuccess && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>
                {loggedInRole === 'ADMIN' || loggedInRole === 'ROLE_ADMIN'
                  ? 'Admin Verified! Opening Admin Panel...'
                  : loggedInRole === 'STAFF' || loggedInRole === 'ROLE_STAFF' || loggedInRole === 'SALON'
                  ? 'Staff Verified! Opening Staff / Salon Portal...'
                  : 'Login successful! Opening your dashboard...'}
              </span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email / Phone Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">
                Email or Mobile Number
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Enter your email or phone number"
                  value={emailOrPhone}
                  onChange={(e) => {
                    setEmailOrPhone(e.target.value);
                    setErrorMessage(null);
                    setIsNotRegistered(false);
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 block">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage(null);
                  }}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-500 hover:text-slate-300 absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading || isSuccess}
              className="w-full py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20 transition-all disabled:opacity-50 mt-2 cursor-pointer"
            >
              <span>{isLoading ? 'Verifying Credentials...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Registration Redirect Link */}
          <div className="text-center pt-2 text-xs text-slate-400">
            Don't have an account yet?{' '}
            <Link
              href="/register"
              className="font-bold text-indigo-400 hover:text-indigo-300 underline"
            >
              Register here
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-400 text-sm">Loading login...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
