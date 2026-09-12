'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  User as UserIcon,
  MapPin,
  ChevronDown,
  Sparkles, 
  Clock, 
  Compass, 
  Calendar, 
  Bell, 
  SlidersHorizontal,
  PlayCircle
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { NotificationDrawer } from './NotificationDrawer';
import { DemoControlDrawer } from './DemoControlDrawer';
import { LocationModal } from './LocationModal';
import { ThemeToggle } from './ThemeToggle';
import { BrandLogo } from './BrandLogo';
import { LocationData, DEFAULT_USER_LOCATION } from '../services/locationService';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeToken, unreadNotifCount, user, isLoggedIn, logoutUser } = useCustomer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const [userLocation, setUserLocation] = useState<LocationData>(DEFAULT_USER_LOCATION);

  // Close menus on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  // Click outside to close profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    if (isProfileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('salonflow_user_location');
      if (saved) {
        try {
          setUserLocation(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse location in navbar', e);
        }
      }
    }
  }, []);

  // Do not render customer navbar on landing screen, login, register, dedicated Admin Panel or Salon Portal
  if (
    pathname === '/' ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register') ||
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/salon')
  ) {
    return null;
  }

  const handleSelectLocation = (loc: LocationData) => {
    setUserLocation(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('salonflow_user_location', JSON.stringify(loc));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const navLinks = [
    { name: 'Discover Salons', href: '/home', icon: Compass },
    { name: 'Live Queues', href: '/queue', icon: Clock, hasBadge: !!activeToken },
    { name: 'AI Style Match', href: '/ai-recommend', icon: Sparkles, isHighlight: true },
    { name: 'Appointments', href: '/appointments', icon: Calendar },
  ];

  const hasActiveToken = activeToken && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(activeToken.status);
  const displayDistrict = userLocation?.area ? `${userLocation.area}, ${userLocation.city || 'Pune'}` : 'Baner, Pune';

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white/85 dark:bg-[#0c0e16]/85 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800/80 shadow-[0_4px_25px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.4)] transition-colors duration-200">
        <div className="max-w-7xl mx-auto h-20 px-4 sm:px-6 lg:px-8 flex items-center justify-between lg:grid lg:grid-cols-[1fr_auto_1fr] gap-2 sm:gap-4">
          
          {/* Column 1 (Left): Brand Crest & District Location Pill */}
          <div className="flex items-center gap-2.5 sm:gap-3 justify-start min-w-0">
            <BrandLogo size="md" variant="compact" asLink href="/home" />

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden md:block shrink-0" />

            {/* Location Selector Pill - Compact Luxury Single Line */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-left transition-all cursor-pointer shadow-xs whitespace-nowrap shrink-0"
              title="Change location or district"
            >
              <div className="w-5 h-5 rounded-lg bg-amber-500/15 flex items-center justify-center text-amber-500 shrink-0">
                <MapPin className="w-3 h-3" />
              </div>
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[120px]">{displayDistrict}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>
          </div>

          {/* Column 2 (Center): Navigation Links in True Middle with Zero Overlap */}
          <nav className="hidden lg:flex items-center justify-center gap-1 xl:gap-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 shadow-xs'
                      : link.isHighlight
                      ? 'text-amber-500 hover:text-amber-600 dark:hover:text-amber-300 hover:bg-amber-500/10'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-500' : 'opacity-70'}`} />
                  <span className="whitespace-nowrap">{link.name}</span>
                  {link.hasBadge && (
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping ml-0.5 shrink-0" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Column 3 (Right): Controls & User Profile Aligned to End */}
          <div className="flex items-center gap-1.5 sm:gap-2 justify-end min-w-0">
            
            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => setIsNotifOpen(true)}
              aria-label="View notifications"
              className="h-10 w-10 flex items-center justify-center relative rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 transition-all cursor-pointer shadow-xs shrink-0"
              title="Notifications"
            >
              <Bell className="w-4 h-4 text-slate-600 dark:text-slate-300" />
              {unreadNotifCount > 0 ? (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-[10px] font-black text-white flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900">
                  {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
                </span>
              ) : hasActiveToken ? (
                <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
              ) : null}
            </button>

            {/* Theme Toggle Button */}
            <div className="h-10 px-1.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center shadow-xs shrink-0">
              <ThemeToggle />
            </div>

            {/* User Profile & Sign Out Area */}
            {isLoggedIn && user ? (
              <div className="flex items-center gap-1.5 pl-0.5 sm:pl-1">
                
                {/* Profile Pill & Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    className="h-10 flex items-center gap-2 px-2 sm:px-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 transition-all shadow-xs cursor-pointer select-none"
                    title="Account & Profile Menu"
                    aria-expanded={isProfileMenuOpen}
                  >
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 overflow-hidden">
                      {user.profileImage ? (
                        <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        user.name ? user.name.charAt(0).toUpperCase() : 'U'
                      )}
                    </div>
                    <span className="text-xs font-bold text-slate-900 dark:text-white hidden xl:inline truncate max-w-[85px]">
                      {user.name.split(' ')[0]}
                    </span>
                    <ChevronDown className={`w-3.5 h-3.5 text-slate-400 hidden sm:inline transition-transform duration-200 ${isProfileMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Luxury Dropdown Menu */}
                  {isProfileMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl bg-white dark:bg-[#0c0e16] border border-slate-200/90 dark:border-slate-800/90 shadow-2xl p-2 z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                      
                      {/* User Info Header */}
                      <div className="px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/60 mb-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0 overflow-hidden">
                            {user.profileImage ? (
                              <img src={user.profileImage} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                              user.name ? user.name.charAt(0).toUpperCase() : 'U'
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 dark:text-white truncate">
                              {user.name}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {user.email || user.phone || 'NovaQ VIP Member'}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Navigation Links */}
                      <div className="space-y-0.5">
                        <Link
                          href="/profile"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <UserIcon className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>My Profile & Preferences</span>
                        </Link>
                        <Link
                          href="/queue"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <Clock className="w-4 h-4 text-amber-500 shrink-0" />
                          <span>Live Queue Pass</span>
                        </Link>
                        <Link
                          href="/notifications"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <div className="flex items-center gap-2.5">
                            <Bell className="w-4 h-4 text-amber-500 shrink-0" />
                            <span>Notifications</span>
                          </div>
                          {unreadNotifCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-slate-950 font-mono text-[10px] font-bold">
                              {unreadNotifCount}
                            </span>
                          )}
                        </Link>
                      </div>

                      <div className="my-1.5 border-t border-slate-100 dark:border-slate-800/80" />

                      {/* Dropdown Sign Out Button */}
                      <button
                        type="button"
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logoutUser();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 transition-colors cursor-pointer text-left"
                      >
                        <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Direct Luxury Sign Out Button on Desktop */}
                <button
                  type="button"
                  onClick={logoutUser}
                  title="Sign Out of Account"
                  className="hidden sm:flex h-10 items-center gap-1.5 px-3 rounded-xl bg-slate-100/90 dark:bg-slate-900/90 hover:bg-rose-500/10 dark:hover:bg-rose-500/15 border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 text-slate-700 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 text-xs font-bold transition-all shadow-xs cursor-pointer group active:scale-95 shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 group-hover:text-rose-500 dark:group-hover:text-rose-400 transition-colors shrink-0" />
                  <span className="whitespace-nowrap">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link
                  href="/login"
                  className="h-10 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 transition-all cursor-pointer flex items-center shadow-xs"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="h-10 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold shadow-md hover:from-amber-600 hover:to-amber-700 transition-all cursor-pointer flex items-center"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden h-10 w-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:text-amber-500 transition-colors cursor-pointer shrink-0 shadow-xs"
              aria-label="Toggle navigation menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-slate-200/80 dark:border-slate-800/80 bg-white/98 dark:bg-[#0c0e16]/98 backdrop-blur-2xl px-5 py-4 space-y-3 shadow-2xl animate-in slide-in-from-top-2 duration-200">
            
            {/* Mobile Location Selector */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                setIsLocationModalOpen(true);
              }}
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer shadow-xs"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-500" />
                <span className="font-semibold">{displayDistrict}</span>
              </div>
              <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">Change</span>
            </button>

            {/* Navigation Links Grid */}
            <div className="grid grid-cols-2 gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap min-w-0 ${
                      isActive
                        ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <Icon className="w-4 h-4 text-amber-500 shrink-0" />
                    <span className="truncate whitespace-nowrap">{link.name}</span>
                  </Link>
                );
              })}
            </div>

            {/* User Account & Sign Out in Mobile Drawer */}
            {isLoggedIn && user && (
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold text-sm shadow-xs shrink-0">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-slate-900 dark:text-white truncate">{user.name}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{user.email || user.phone}</div>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20 shrink-0 transition-colors"
                  >
                    Profile
                  </Link>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    logoutUser();
                  }}
                  className="w-full min-h-[44px] py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/15 active:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-rose-600 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <LogOut className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            )}

          </div>
        )}
      </header>

      {/* Spacer so layout main content never hides under the fixed navbar */}
      <div className="h-20 w-full shrink-0" aria-hidden="true" />

      {/* Connected Modals & Drawers */}
      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <DemoControlDrawer isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={userLocation}
      />
    </>
  );
};
