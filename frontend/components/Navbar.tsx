'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Menu, 
  X, 
  LogOut, 
  LogIn, 
  UserPlus,
  User as UserIcon,
  LayoutDashboard,
  Calendar,
  Shield,
  Sparkles,
  PlayCircle
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { NotificationDrawer } from './NotificationDrawer';
import { DemoControlDrawer } from './DemoControlDrawer';
import { WalkinQrModal } from './WalkinQrModal';
import { LocationModal } from './LocationModal';
import { ThemeToggle } from './ThemeToggle';
import { LocationData, DEFAULT_USER_LOCATION } from '../services/locationService';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeToken, unreadNotifCount, user, isLoggedIn, logoutUser } = useCustomer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [userLocation, setUserLocation] = useState<LocationData>(DEFAULT_USER_LOCATION);

  // Do not render customer navbar on dedicated Admin Panel or Salon Portal
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/salon')) {
    return null;
  }

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

  const handleSelectLocation = (loc: LocationData) => {
    setUserLocation(loc);
    if (typeof window !== 'undefined') {
      localStorage.setItem('salonflow_user_location', JSON.stringify(loc));
      window.dispatchEvent(new Event('storage'));
    }
  };

  const isAdmin = user && (user.role?.toUpperCase() === 'ADMIN' || user.role?.toUpperCase() === 'ROLE_ADMIN');

  const navLinks = [
    { name: 'Discover Salons', href: '/home' },
    { name: 'Live Queues', href: '/queue' },
    { name: 'AI Style Match', href: '/ai-recommend', highlight: true },
    { name: 'My Appointments', href: '/appointments' },
    { name: 'Concierge & VIP Club', href: '/services' },
    ...(isAdmin ? [{ name: 'Admin Panel', href: '/admin', highlight: true }] : []),
  ];

  const hasActiveToken = activeToken && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(activeToken.status);
  const displayDistrict = userLocation?.area ? `${userLocation.area}, ${userLocation.city || 'Beverly Hills'}` : 'Downtown West, Beverly Hills';

  return (
    <>
      <header className="fixed top-0 w-full z-50 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.25)] transition-colors duration-200">
        <div className="h-20 w-full px-margin-desktop flex items-center justify-between">
          
          {/* Left: Brand Crest & District Location Button */}
          <div className="flex items-center gap-space-lg">
            <Link href="/" className="flex items-center gap-space-sm group">
              <img
                alt="LuxeTrim Crest Icon"
                className="h-8 w-auto object-contain group-hover:scale-105 transition-transform"
                src="https://lh3.googleusercontent.com/aida/AEtjO1WqI_yLFEXpYRxhPJLhzsvEUoujuSmfBPFaXqFFG_WFmogffK_d4BSGEtdDdFACGggt6kQL-R9FVJwSja0K6cLHB1UMsc2O8GrU2ehEpVQjmiJvXXAYu0gibt4kxJ72I3E5iJfBkIp0Ko58hUHcdHOb3EwO6wE7Y-QtFO4hFRF8HnWMipJ7-a5LMbK-4oXkosht4cvD_DpiKvRT_-peA8DArqHHSHCMBlYc6_AP50tKczE0wQKOq-yuH-o"
              />
              <div className="flex flex-col">
                <span className="font-headline-sm text-headline-sm tracking-tight text-primary">LuxeTrim</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-widest">Atelier Concierge</span>
              </div>
            </Link>

            <div className="h-8 w-px bg-surface-container-highest hidden sm:block"></div>

            {/* District Atelier Selector */}
            <button
              type="button"
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high transition-colors text-left cursor-pointer"
            >
              <span className="material-symbols-outlined text-primary text-base">location_on</span>
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">District Atelier</span>
                <span className="font-body-sm text-body-sm text-on-surface font-medium max-w-[160px] truncate">{displayDistrict}</span>
              </div>
              <span className="material-symbols-outlined text-outline text-sm ml-space-xs">expand_more</span>
            </button>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden xl:flex items-center gap-space-md">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || (pathname === '/' && link.href === '/home');
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-space-md py-space-xs transition-colors ${
                    isActive
                      ? 'bg-primary-container text-on-primary-container font-semibold rounded-lg'
                      : link.highlight
                      ? 'font-label-lg text-label-lg text-primary font-bold hover:text-primary-container'
                      : 'font-label-lg text-label-lg text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons & Controls */}
          <div className="flex items-center gap-space-md">
            
            {/* Quick Search */}
            <Link
              href="/home"
              className="relative hidden md:flex items-center cursor-pointer"
            >
              <div className="flex items-center gap-space-sm px-space-md py-space-xs rounded-lg bg-surface-container text-outline hover:text-on-surface-variant transition-colors">
                <span className="material-symbols-outlined text-lg">search</span>
                <span className="font-body-sm text-body-sm">Search stylists, cuts, suites...</span>
                <kbd className="px-space-xs py-0.5 rounded bg-surface-container-high font-label-sm text-label-sm text-outline">⌘K</kbd>
              </div>
            </Link>

            {/* Notifications Button */}
            <button
              type="button"
              onClick={() => setIsNotifOpen(true)}
              aria-label="View alerts"
              className="relative p-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.8)]"></span>
            </button>

            {/* Dark/Light Theme Switcher */}
            <ThemeToggle />

            {/* Auth Area: Logged In vs Guest */}
            {isLoggedIn && user ? (
              <div className="flex items-center gap-space-xs pl-space-xs">
                {/* User Profile Badge */}
                <Link
                  href="/profile"
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high border border-outline-variant transition-colors"
                  title="View Profile"
                >
                  <img
                    src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-7 h-7 rounded-full object-cover ring-1 ring-outline"
                  />
                  <span className="font-body-sm text-body-sm text-on-surface font-medium hidden lg:inline truncate max-w-[100px]">
                    {user.name.split(' ')[0]}
                  </span>
                </Link>

                {isAdmin && (
                  <Link
                    href="/admin"
                    className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold transition-all shadow-sm"
                    title="Open Admin Portal"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin</span>
                  </Link>
                )}

                {/* Sign Out Button */}
                <button
                  onClick={logoutUser}
                  title="Sign Out of Account"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-sm cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5 text-rose-400" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-3 py-1.5 rounded-lg text-on-surface-variant hover:text-on-surface text-xs font-semibold transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-bold transition-all shadow-sm shadow-primary/20"
                >
                  Register
                </Link>
              </div>
            )}

            {/* Demo Script Controller */}
            <button
              onClick={() => setIsDemoOpen(true)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant text-xs font-semibold transition-all ml-1 cursor-pointer"
              title="Open Hackathon Demo Controller"
            >
              <PlayCircle className="w-3.5 h-3.5 text-primary" />
              <span className="hidden xl:inline">Demo</span>
            </button>

            {/* Mobile Hamburger Menu Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="xl:hidden p-space-xs rounded-lg bg-surface-container text-on-surface-variant hover:text-on-surface cursor-pointer"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="xl:hidden border-t border-outline-variant/30 bg-surface px-margin-desktop py-space-md space-y-2 shadow-2xl">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="block px-space-md py-space-xs font-label-lg text-label-lg text-on-surface hover:bg-surface-container rounded-lg"
              >
                {link.name}
              </Link>
            ))}
            <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-on-surface-variant">Theme</span>
              <ThemeToggle showLabel={true} />
            </div>
            {isLoggedIn ? (
              <div className="pt-2 border-t border-outline-variant/30 flex items-center justify-between">
                <span className="font-body-sm text-body-sm text-on-surface">{user?.name}</span>
                <button
                  onClick={logoutUser}
                  className="px-3 py-1 rounded bg-rose-500/10 text-rose-300 text-xs font-bold"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="pt-2 border-t border-outline-variant/30 flex items-center gap-2">
                <Link href="/login" className="px-3 py-1 text-xs font-semibold text-on-surface">Sign In</Link>
                <Link href="/register" className="px-3 py-1 text-xs font-bold bg-primary text-on-primary rounded">Register</Link>
              </div>
            )}
          </div>
        )}
      </header>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <DemoControlDrawer isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <WalkinQrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
      <LocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onSelectLocation={handleSelectLocation}
        currentLocation={userLocation}
      />
    </>
  );
};
