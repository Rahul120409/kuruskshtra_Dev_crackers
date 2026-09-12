'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  X, 
  Bell, 
  CheckCheck, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Scissors, 
  Calendar, 
  Crown, 
  ExternalLink,
  ChevronRight,
  Inbox
} from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';
import { pushNotificationService } from '../services/pushNotificationService';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotifAsRead, markAllNotifsAsRead } = useCustomer();
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [chimeTriggered, setChimeTriggered] = useState(false);
  const [filterMode, setFilterMode] = useState<'ALL' | 'UNREAD' | 'TURNS'>('ALL');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, [isOpen]);

  const handleEnablePush = async () => {
    const granted = await pushNotificationService.requestPermission();
    if (granted) {
      setPermission('granted');
      pushNotificationService.notify({
        title: '🔔 Push Notifications Active!',
        body: 'Instant audio chimes and turn alerts are enabled for your visits.',
        soundType: 'alert',
      });
    } else {
      setPermission('denied');
    }
  };

  const handleTestChime = () => {
    setChimeTriggered(true);
    pushNotificationService.notify({
      title: "🔔 Test Chime: You're 2 Numbers Away!",
      body: 'Token #14 is approaching your turn! High-priority audio alert triggered.',
      soundType: 'alert',
    });
    setTimeout(() => setChimeTriggered(false), 3000);
  };

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const displayedNotifs = notifications.filter((n) => {
    if (filterMode === 'UNREAD') return !n.isRead;
    if (filterMode === 'TURNS') return n.type === 'TURN_CALLED' || n.type === 'TURN_APPROACHING';
    return true;
  });

  const getBadgeInfo = (type: string) => {
    switch (type) {
      case 'TURN_CALLED':
        return {
          icon: Scissors,
          label: 'Chair Ready',
          badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        };
      case 'TURN_APPROACHING':
        return {
          icon: Clock,
          label: '2 Away',
          badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
        };
      case 'BOOKING_CONFIRMED':
        return {
          icon: Calendar,
          label: 'Booking',
          badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        };
      case 'SYSTEM_PROMO':
      default:
        return {
          icon: Crown,
          label: 'VIP Alert',
          badgeClass: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />

      {/* Slide-over Luxury Panel */}
      <div className="relative w-full max-w-md h-full bg-white dark:bg-[#0c0e17] border-l border-slate-200/90 dark:border-slate-800/90 text-slate-900 dark:text-white p-5 sm:p-6 flex flex-col shadow-2xl z-10 animate-in slide-in-from-right duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-500">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white">
                  Notifications
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.2 rounded-full bg-amber-500 text-slate-950 text-[10px] font-mono font-black shadow-xs">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Live Queue Passes & Appointment Alerts
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllNotifsAsRead}
                className="p-2 rounded-xl text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 transition-colors text-xs font-semibold flex items-center gap-1 cursor-pointer"
                title="Mark all as read"
              >
                <CheckCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Mark Read</span>
              </button>
            )}

            <button 
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close panel"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Browser Push Notification Banner */}
        <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Real-Time Turn Alerts</span>
            </div>
            <button
              type="button"
              onClick={handleTestChime}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-600 dark:text-amber-400 text-[11px] font-bold transition-all cursor-pointer active:scale-95"
              title="Test sound alert chime"
            >
              <Volume2 className={`w-3 h-3 text-amber-500 ${chimeTriggered ? 'animate-bounce' : ''}`} />
              <span>{chimeTriggered ? 'Chiming...' : 'Test Chime'}</span>
            </button>
          </div>

          <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
            Sends an audio chime alert to your device when your token is 2 numbers away and when your station is ready.
          </p>

          {permission !== 'granted' ? (
            <button
              type="button"
              onClick={handleEnablePush}
              className="w-full mt-1 py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-amber-500/20 active:scale-95"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Enable Browser Push Notifications</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 pt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Browser push & proximity chime active</span>
            </div>
          )}
        </div>

        {/* Filter Chips */}
        <div className="flex items-center gap-1.5 py-3 border-b border-slate-200/60 dark:border-slate-800/60">
          {(['ALL', 'UNREAD', 'TURNS'] as const).map((mode) => {
            const isActive = filterMode === mode;
            const labels = { ALL: 'All', UNREAD: 'Unread', TURNS: 'Live Turns' };
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                {labels[mode]}
              </button>
            );
          })}
        </div>

        {/* List of Notifications */}
        <div className="flex-1 py-3 space-y-2.5 overflow-y-auto pr-0.5">
          {displayedNotifs.length === 0 ? (
            <div className="text-center py-16 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto opacity-70">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  No notifications
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 max-w-[240px] mx-auto mt-1 leading-relaxed">
                  Real-time updates regarding your queue turns and appointments will appear here.
                </p>
              </div>
            </div>
          ) : (
            displayedNotifs.map((notif) => {
              const isTurnAlert = notif.type === 'TURN_CALLED' || notif.type === 'TURN_APPROACHING';
              const badge = getBadgeInfo(notif.type);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={notif.id}
                  onClick={() => markNotifAsRead(notif.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer group ${
                    !notif.isRead
                      ? isTurnAlert
                        ? 'bg-amber-500/[0.08] dark:bg-amber-500/15 border-amber-500/40 shadow-xs'
                        : 'bg-amber-500/5 dark:bg-slate-900/90 border-amber-500/25'
                      : 'bg-slate-50/70 dark:bg-slate-900/40 border-slate-200/70 dark:border-slate-800/70 opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="flex items-center gap-2">
                      <div className={`p-1 rounded-lg border text-[10px] font-mono font-bold flex items-center gap-1 ${badge.badgeClass}`}>
                        <BadgeIcon className="w-3 h-3" />
                        <span>{badge.label}</span>
                      </div>
                      <h3 className={`text-xs font-bold line-clamp-1 ${isTurnAlert ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-white'}`}>
                        {notif.title}
                      </h3>
                    </div>

                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1" />
                    )}
                  </div>

                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed font-normal">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-800/60">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={onClose}
                        className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
                      >
                        <span>View</span>
                        <ChevronRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer & Full Page Link */}
        <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800/80 space-y-2">
          <Link
            href="/notifications"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200/90 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-xs"
          >
            <span>Open Full Notification Dossier</span>
            <ExternalLink className="w-3.5 h-3.5 text-amber-500" />
          </Link>
          <div className="text-[10px] text-slate-400 text-center font-mono">
            NovaQ Realtime Push Alert Network
          </div>
        </div>

      </div>
    </div>
  );
};
