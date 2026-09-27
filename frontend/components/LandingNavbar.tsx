'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  Menu, 
  Sparkles, 
  ShieldCheck, 
  Compass, 
  Calendar, 
  Clock, 
  Crown, 
  ChevronRight, 
  Phone, 
  Mail, 
  MapPin, 
  LogIn, 
  UserPlus, 
  SlidersHorizontal,
  LogOut,
  Scissors
} from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';
import { useCustomer } from '@/context/CustomerContext';

export const LandingNavbar: React.FC = () => {
  const router = useRouter();
  const { user, isLoggedIn, logoutUser } = useCustomer();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState<boolean>(false);
  const [isPrivacyModalOpen, setIsPrivacyModalOpen] = useState<boolean>(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState<boolean>(false);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (typeof window !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleProtectedAction = (path: string) => {
    setIsMobileMenuOpen(false);
    if (!isLoggedIn) {
      router.push(`/login?redirect=${encodeURIComponent(path)}`);
    } else {
      router.push(path);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-surface/90 backdrop-blur-xl border-b border-outline-variant/30 transition-colors duration-200 shadow-sm">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-margin-desktop flex items-center justify-between">
          
          {/* Left: Brand Crest & Logo - Strictly Single Line */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <BrandLogo size="md" variant="full" tagline="HAUTE SALON PASS" asLink href="/" />
          </div>

          {/* Center Navigation Links (Desktop) - Balanced Middle */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-2 xl:mx-4 gap-1 xl:gap-2">
            <Link
              href="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="px-3 py-2 rounded-lg text-xs font-bold text-on-surface hover:text-primary transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Home
            </Link>

            <button
              type="button"
              onClick={() => scrollToSection('features')}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              Features
            </button>

            <button
              type="button"
              onClick={() => scrollToSection('how-it-works')}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              How It Works
            </button>

            <button
              type="button"
              onClick={() => handleProtectedAction('/ai-recommend')}
              className="px-3 py-2 rounded-lg text-xs font-bold text-amber-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 shrink-0" />
              <span className="whitespace-nowrap">AI Studio</span>
            </button>

            <button
              type="button"
              onClick={() => handleProtectedAction('/queue')}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="whitespace-nowrap">Live Queues</span>
            </button>

            <button
              type="button"
              onClick={() => handleProtectedAction('/home')}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="whitespace-nowrap">Salons</span>
            </button>

            <button
              type="button"
              onClick={() => setIsPrivacyModalOpen(true)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="whitespace-nowrap">Privacy Policy</span>
            </button>

            <button
              type="button"
              onClick={() => setIsContactModalOpen(true)}
              className="px-3 py-2 rounded-lg text-xs font-semibold text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="whitespace-nowrap">Contact</span>
            </button>
          </nav>

          {/* Right Controls & CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-2.5">
            
            {/* Theme Toggle Button */}
            <div className="p-1 rounded-xl bg-surface-container border border-outline-variant/40 flex items-center">
              <ThemeToggle />
            </div>

            {/* Login / Auth State Button */}
            {isLoggedIn ? (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  href="/profile"
                  className="h-10 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-semibold text-on-surface flex items-center gap-2 transition-all shadow-xs"
                >
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white text-[10px] font-bold shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                  <span className="truncate max-w-[90px]">{user?.name?.split(' ')[0] || 'Member'}</span>
                </Link>
                <button
                  type="button"
                  onClick={logoutUser}
                  className="h-10 px-3 rounded-xl bg-surface-container hover:bg-rose-500/10 border border-outline-variant hover:border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shadow-xs group active:scale-95"
                  title="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-2.5 sm:px-3 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant text-xs font-bold text-on-surface transition-all flex items-center gap-1 cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5 text-primary" />
                <span className="hidden xs:inline">Sign In</span>
              </Link>
            )}

            {/* Primary Action Button: Find Salons (Requires Login) */}
            <button
              type="button"
              onClick={() => handleProtectedAction('/home')}
              className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-xs shadow-md transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Scissors className="w-3.5 h-3.5" />
              <span>Find Salons</span>
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-surface-container border border-outline-variant text-on-surface hover:text-primary transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-outline-variant/30 bg-surface/98 backdrop-blur-2xl px-6 py-5 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 pb-3 border-b border-outline-variant/20">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2.5 rounded-lg bg-surface-container font-semibold text-xs text-on-surface hover:text-primary transition-colors whitespace-nowrap truncate"
              >
                Home
              </Link>
              <button
                type="button"
                onClick={() => scrollToSection('features')}
                className="p-2.5 rounded-lg bg-surface-container text-left font-semibold text-xs text-on-surface hover:text-primary transition-colors cursor-pointer whitespace-nowrap truncate"
              >
                Features
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="p-2.5 rounded-lg bg-surface-container text-left font-semibold text-xs text-on-surface hover:text-primary transition-colors cursor-pointer whitespace-nowrap truncate"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => handleProtectedAction('/ai-recommend')}
                className="p-2.5 rounded-lg bg-amber-500/15 border border-amber-500/30 font-bold text-xs text-amber-400 flex items-center gap-1.5 text-left cursor-pointer whitespace-nowrap truncate"
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span className="whitespace-nowrap truncate">AI Studio</span>
              </button>
              <button
                type="button"
                onClick={() => handleProtectedAction('/queue')}
                className="p-2.5 rounded-lg bg-surface-container font-semibold text-xs text-on-surface hover:text-primary transition-colors text-left cursor-pointer whitespace-nowrap truncate"
              >
                Live Queues
              </button>
              <button
                type="button"
                onClick={() => handleProtectedAction('/home')}
                className="p-2.5 rounded-lg bg-surface-container font-semibold text-xs text-on-surface hover:text-primary transition-colors text-left cursor-pointer whitespace-nowrap truncate"
              >
                Salons &amp; Booking
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsPrivacyModalOpen(true);
                }}
                className="p-2.5 rounded-lg bg-surface-container text-left font-semibold text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer whitespace-nowrap truncate"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsContactModalOpen(true);
                }}
                className="p-2.5 rounded-lg bg-surface-container text-left font-semibold text-xs text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer whitespace-nowrap truncate"
              >
                Contact Concierge
              </button>
            </div>

            <div className="pt-2 flex items-center justify-between">
              <span className="text-xs font-semibold text-on-surface-variant">Switch Theme</span>
              <ThemeToggle showLabel={false} />
            </div>

            <div className="pt-2 flex gap-2">
              {isLoggedIn ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logoutUser();
                  }}
                  className="flex-1 min-h-[44px] py-2.5 px-3 text-center rounded-xl bg-rose-500/10 hover:bg-rose-500/15 border border-rose-500/30 text-xs font-bold text-rose-600 dark:text-rose-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                  <span>Sign Out ({user?.name?.split(' ')[0]})</span>
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex-1 py-2.5 text-center rounded-xl bg-surface-container border border-outline-variant text-xs font-bold text-on-surface"
                >
                  Sign In
                </Link>
              )}
              <button
                type="button"
                onClick={() => handleProtectedAction('/home')}
                className="flex-1 py-2.5 text-center rounded-xl bg-primary text-on-primary text-xs font-bold shadow-md cursor-pointer"
              >
                Find Salons
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =====================================================================
          PRIVACY POLICY MODAL
          ===================================================================== */}
      {isPrivacyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-surface border border-outline-variant/50 p-6 sm:p-8 shadow-2xl space-y-5 text-on-surface">
            
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-lg font-bold">NovaQ Privacy &amp; Biometric Security Policy</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs sm:text-sm text-on-surface-variant leading-relaxed">
              <div>
                <h4 className="font-bold text-on-surface text-sm mb-1">1. Zero Permanent Biometric Retention</h4>
                <p>
                  When utilizing our AI Facial Biometrics and Hairstyle Consultation Studio, face contour landmarks and webcam video feeds are processed locally and transiently in your browser session. NovaQ never permanently stores or sells your facial geometry data to third-party brokers.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-on-surface text-sm mb-1">2. Real-Time Smart Queue Data</h4>
                <p>
                  Information provided during digital queue token check-in (such as phone numbers or guest names) is solely used for queue advancement notifications, push alerts, and SMS arrival verifications at your designated salon atelier.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-on-surface text-sm mb-1">3. Location &amp; Proximity Discovery</h4>
                <p>
                  Geolocation permissions are utilized exclusively to calculate travel distances to nearby partner salons and provide turn-by-turn navigation via Google Maps. Your location coordinates are not tracked when the application is closed.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-on-surface text-sm mb-1">4. Contact &amp; Data Rights</h4>
                <p>
                  You have the right to request deletion of your booking history, reviews, and customer profile at any time by contacting our concierge team at <span className="font-mono text-primary font-semibold">privacy@novaq.in</span>.
                </p>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/30 flex justify-end">
              <button
                type="button"
                onClick={() => setIsPrivacyModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer shadow-md"
              >
                I Understand &amp; Agree
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =====================================================================
          CONTACT CONCIERGE MODAL
          ===================================================================== */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-outline-variant/50 p-6 sm:p-8 shadow-2xl space-y-6 text-on-surface">
            
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/30">
              <div className="flex items-center gap-2.5">
                <Mail className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold">Contact NovaQ Concierge</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-start gap-3">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-on-surface">General Support &amp; Concierge</div>
                  <div className="text-xs text-on-surface-variant">concierge@novaq.in</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-start gap-3">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-on-surface">Direct Atelier Line</div>
                  <div className="text-xs text-on-surface-variant">+91 (020) 589-3874 • Mon - Sat 8AM - 9PM</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-on-surface">Headquarters</div>
                  <div className="text-xs text-on-surface-variant">Baner High Street, Pune, Maharashtra 411045</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-surface-container border border-outline-variant/30 flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-on-surface">Salon Owner Inquiries</div>
                  <div className="text-xs text-on-surface-variant">partner@novaq.in • Enterprise smart queue integration</div>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setIsContactModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-primary text-on-primary font-bold text-xs cursor-pointer shadow-md"
              >
                Close Concierge
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};
