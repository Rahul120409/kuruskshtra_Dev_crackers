'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Scissors, 
  Sparkles, 
  Clock, 
  Bell, 
  Menu, 
  X, 
  PlayCircle, 
  QrCode, 
  LogOut, 
  LogIn, 
  UserPlus,
  User as UserIcon,
  LayoutDashboard,
  Calendar
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { NotificationDrawer } from './NotificationDrawer';
import { DemoControlDrawer } from './DemoControlDrawer';
import { WalkinQrModal } from './WalkinQrModal';

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const { activeToken, unreadNotifCount, user, isLoggedIn, logoutUser } = useCustomer();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  // Authenticated vs Guest Navigation Links
  const navLinks = isLoggedIn
    ? [
        { name: 'Dashboard', href: '/home', icon: LayoutDashboard },
        { name: 'Services', href: '/services' },
        { 
          name: 'AI Style Match', 
          href: '/ai-recommend', 
          highlight: true,
          icon: Sparkles 
        },
        { name: 'Appointments', href: '/appointments', icon: Calendar },
        { name: 'Live Queue', href: '/queue' },
        { name: 'Feedback', href: '/feedback' },
      ]
    : [
        { name: 'Landing', href: '/' },
        { name: 'Services Menu', href: '/services' },
        { 
          name: 'AI Style Match', 
          href: '/ai-recommend', 
          highlight: true,
          icon: Sparkles 
        },
        { name: 'Live Queue Pass', href: '/queue' },
      ];

  const hasActiveToken = activeToken && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(activeToken.status);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Brand Logo (Always links to Landing / for public or Home if logged in) */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 p-0.5 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-indigo-400 transform -rotate-45" />
                </div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-bold tracking-tight text-white">SalonFlow</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-mono font-bold border border-indigo-500/30">
                    AI
                  </span>
                </div>
                <span className="text-[9px] text-slate-400 tracking-wider uppercase font-medium">Smart Studio & Queue</span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-slate-800 text-indigo-300 border border-slate-700'
                        : link.highlight
                        ? 'text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    {link.name}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons & Auth Controls */}
            <div className="flex items-center gap-2">
              
              {/* Active Token Pill (if in queue) */}
              {hasActiveToken && (
                <Link
                  href="/queue"
                  className={`hidden sm:flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                    activeToken.status === 'CALLED'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 animate-pulse'
                      : 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/25'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${
                    activeToken.status === 'CALLED' ? 'bg-emerald-400' : 'bg-indigo-400'
                  }`} />
                  <span>#{activeToken.tokenNumber}</span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-300">
                    {activeToken.status === 'CALLED' ? 'Your Turn' : `${activeToken.estimatedWait}m wait`}
                  </span>
                </Link>
              )}

              {/* Fast Walk-In QR Scan */}
              <button
                onClick={() => setIsQrModalOpen(true)}
                title="Salon Walk-in QR Check-in"
                className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-indigo-400 transition-colors"
              >
                <QrCode className="w-4 h-4" />
              </button>

              {/* Notification Bell */}
              <button
                onClick={() => setIsNotifOpen(true)}
                className="relative p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadNotifCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {unreadNotifCount}
                  </span>
                )}
              </button>

              {/* Auth Area: Logged In vs Guest */}
              {isLoggedIn && user ? (
                <div className="flex items-center gap-2 pl-1">
                  {/* User Profile Badge */}
                  <Link
                    href="/profile"
                    className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 transition-colors"
                    title="View Profile"
                  >
                    <img
                      src={user.profileImage || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'}
                      alt={user.name}
                      className="w-5 h-5 rounded-full object-cover border border-indigo-400"
                    />
                    <span className="text-xs font-semibold text-slate-200 hidden lg:inline">
                      {user.name.split(' ')[0]}
                    </span>
                  </Link>

                  {/* PROMINENT LOGOUT BUTTON */}
                  <button
                    onClick={logoutUser}
                    title="Sign Out of Account"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all shadow-sm"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white text-xs font-semibold transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-sm shadow-indigo-600/20"
                  >
                    Register
                  </Link>
                </div>
              )}

              {/* Demo Script Controller */}
              <button
                onClick={() => setIsDemoOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-xs font-semibold transition-all ml-1"
                title="Open Hackathon Demo Controller"
              >
                <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden xl:inline">Demo</span>
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
              >
                {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-800 bg-slate-950 px-4 pt-2 pb-4 space-y-1">
            {hasActiveToken && (
              <Link
                href="/queue"
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-between p-3 mb-2 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300"
              >
                <span className="font-semibold text-xs">Active Queue: Token #{activeToken.tokenNumber}</span>
                <span className="text-xs text-slate-300">{activeToken.estimatedWait}m wait</span>
              </Link>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                  pathname === link.href
                    ? 'bg-slate-800 text-indigo-300'
                    : 'text-slate-300 hover:bg-slate-900'
                }`}
              >
                {link.name}
              </Link>
            ))}

            {/* Mobile Auth Bar with Logout */}
            <div className="pt-3 border-t border-slate-800">
              {isLoggedIn && user ? (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <img
                      src={user.profileImage}
                      alt={user.name}
                      className="w-7 h-7 rounded-full object-cover border border-indigo-400"
                    />
                    <div>
                      <p className="text-xs text-white font-bold">{user.name}</p>
                      <p className="text-[10px] text-slate-400">{user.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      logoutUser();
                      setIsMenuOpen(false);
                    }}
                    className="w-full py-2.5 px-3 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4 text-rose-400" />
                    <span>Sign Out of Account</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 text-center rounded-lg bg-slate-900 text-xs font-semibold text-slate-200 border border-slate-800"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="py-2.5 text-center rounded-lg bg-indigo-600 text-xs font-bold text-white shadow-sm"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <NotificationDrawer isOpen={isNotifOpen} onClose={() => setIsNotifOpen(false)} />
      <DemoControlDrawer isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <WalkinQrModal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} />
    </>
  );
};
