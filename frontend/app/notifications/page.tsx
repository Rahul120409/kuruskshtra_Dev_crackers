'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Bell, 
  CheckCheck, 
  Clock, 
  ArrowRight, 
  Sparkles, 
  Volume2, 
  ShieldCheck, 
  Trash2, 
  Filter, 
  Calendar, 
  Scissors, 
  AlertCircle, 
  CheckCircle2, 
  Compass, 
  ExternalLink,
  ChevronRight,
  Crown,
  Inbox
} from 'lucide-react';
import { useCustomer } from '../../context/CustomerContext';
import { pushNotificationService } from '../../services/pushNotificationService';
import type { Notification } from '../../types';

type FilterType = 'ALL' | 'UNREAD' | 'TURNS' | 'APPOINTMENTS' | 'VIP';

const INITIAL_SHOWCASE_NOTIFS: Notification[] = [
  {
    id: 'notif-showcase-1',
    userId: 'user-vip',
    title: "You're Next in Line! (Turn Alert)",
    message: "Token #12 is now next for Master Barber Vikram at Truefitt & Hill Baner. Please make your way to Station 1.",
    type: 'TURN_CALLED',
    isRead: false,
    createdAt: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
    actionUrl: '/queue',
  },
  {
    id: 'notif-showcase-2',
    userId: 'user-vip',
    title: "Queue Proximity: 2 Numbers Away",
    message: "Only 2 turns remain before your chair is ready. Estimated turnaround time is ~8 minutes.",
    type: 'TURN_APPROACHING',
    isRead: false,
    createdAt: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
    actionUrl: '/queue',
  },
  {
    id: 'notif-showcase-3',
    userId: 'user-vip',
    title: "Haute Coiffure VIP Privileges Activated",
    message: "Welcome to NovaQ Haute Atelier Network! Your Priority Pass and LuxePoints rewards tier are now active.",
    type: 'SYSTEM_PROMO',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString(),
    actionUrl: '/profile',
  },
  {
    id: 'notif-showcase-4',
    userId: 'user-vip',
    title: "Appointment Confirmed • Toni&Guy Koregaon Park",
    message: "Your Bespoke Haircut & Beard Sculpting session is confirmed for tomorrow at 4:30 PM.",
    type: 'BOOKING_CONFIRMED',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    actionUrl: '/appointments',
  },
];

export default function NotificationsPage() {
  const { 
    notifications, 
    markNotifAsRead, 
    markAllNotifsAsRead, 
    clearAllNotifications, 
    activeToken,
    user 
  } = useCustomer();

  const [activeFilter, setActiveFilter] = useState<FilterType>('ALL');
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [chimeTriggered, setChimeTriggered] = useState(false);
  const [localNotifsList, setLocalNotifsList] = useState<Notification[]>([]);

  // Initialize permission status
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // Merge customer notifications with showcase fallback if customer has zero items
  useEffect(() => {
    if (notifications.length > 0) {
      setLocalNotifsList(notifications);
    } else {
      setLocalNotifsList(INITIAL_SHOWCASE_NOTIFS);
    }
  }, [notifications]);

  const handleEnablePush = async () => {
    const granted = await pushNotificationService.requestPermission();
    if (granted) {
      setPermission('granted');
      pushNotificationService.notify({
        title: '🔔 Push Notifications Active!',
        body: 'Real-time queue proximity audio chimes and turn alerts are now enabled.',
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
      body: 'Token #14 is approaching your chair turn! Audio alert chime triggered.',
      soundType: 'alert',
    });
    setTimeout(() => setChimeTriggered(false), 3000);
  };

  const handleMarkItemRead = async (id: string) => {
    await markNotifAsRead(id);
    setLocalNotifsList((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const handleMarkAllRead = async () => {
    await markAllNotifsAsRead();
    setLocalNotifsList((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleClearAll = () => {
    clearAllNotifications();
    setLocalNotifsList([]);
  };

  const handleDeleteItem = (id: string) => {
    setLocalNotifsList((prev) => prev.filter((n) => n.id !== id));
  };

  // Filtered items
  const filteredNotifs = useMemo(() => {
    return localNotifsList.filter((n) => {
      if (activeFilter === 'UNREAD') return !n.isRead;
      if (activeFilter === 'TURNS') return n.type === 'TURN_CALLED' || n.type === 'TURN_APPROACHING';
      if (activeFilter === 'APPOINTMENTS') return n.type === 'BOOKING_CONFIRMED' || n.type === 'APPOINTMENT_REMINDER';
      if (activeFilter === 'VIP') return n.type === 'SYSTEM_PROMO';
      return true;
    });
  }, [localNotifsList, activeFilter]);

  const unreadCount = localNotifsList.filter((n) => !n.isRead).length;
  const turnAlertCount = localNotifsList.filter(
    (n) => (n.type === 'TURN_CALLED' || n.type === 'TURN_APPROACHING') && !n.isRead
  ).length;

  const formatTimestamp = (iso: string) => {
    try {
      const date = new Date(iso);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (60 * 1000));
      const diffHours = Math.floor(diffMins / 60);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m ago`;
      if (diffHours < 24) return `${diffHours}h ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Recently';
    }
  };

  const getNotifBadge = (type: string) => {
    switch (type) {
      case 'TURN_CALLED':
        return {
          icon: Scissors,
          label: 'Chair Ready',
          bgColor: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
          borderAccent: 'border-emerald-500/50 ring-1 ring-emerald-500/30',
        };
      case 'TURN_APPROACHING':
        return {
          icon: Clock,
          label: '2 Away Alert',
          bgColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          borderAccent: 'border-amber-500/50 ring-1 ring-amber-500/30',
        };
      case 'BOOKING_CONFIRMED':
        return {
          icon: Calendar,
          label: 'Appointment',
          bgColor: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
          borderAccent: 'border-blue-500/40',
        };
      case 'SYSTEM_PROMO':
      default:
        return {
          icon: Crown,
          label: 'VIP Privilege',
          bgColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30',
          borderAccent: 'border-purple-500/40',
        };
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-50 dark:bg-[#07080c] text-slate-900 dark:text-white transition-colors duration-200">
      
      {/* Ambient background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-500/10 dark:bg-amber-500/15 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 space-y-8">
        
        {/* =========================================================================
            HEADER: TITLE & ACTIONS
            ========================================================================= */}
        <div className="space-y-3 pb-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Bell className="w-3.5 h-3.5" />
            <span>Real-Time Alert Dossier</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
                <span>Notification Center</span>
                {unreadCount > 0 && (
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 font-mono font-black text-xs shadow-md shadow-amber-500/30">
                    {unreadCount} New
                  </span>
                )}
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Live updates for your queue turns, chair call proximity chime alerts, and bespoke salon reservations.
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <button
                type="button"
                onClick={handleTestChime}
                className="h-10 px-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                title="Play test audio chime and notification"
              >
                <Volume2 className={`w-3.5 h-3.5 text-amber-500 ${chimeTriggered ? 'animate-bounce' : ''}`} />
                <span>{chimeTriggered ? 'Playing Chime...' : 'Test Chime'}</span>
              </button>

              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAllRead}
                  className="h-10 px-3.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-95"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All Read</span>
                </button>
              )}

              {localNotifsList.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="h-10 px-3 rounded-xl bg-slate-100 hover:bg-rose-500/10 dark:bg-slate-900/90 dark:hover:bg-rose-500/15 border border-slate-200 dark:border-slate-800 hover:border-rose-500/30 text-slate-500 hover:text-rose-500 transition-all cursor-pointer shadow-xs"
                  title="Clear all alerts"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* =========================================================================
            METRICS & PUSH NOTIFICATION CONTROLS BAR
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Push Permission Status Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#11141e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Browser Push Alerts
              </span>
              {permission === 'granted' ? (
                <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-500">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Active</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold text-amber-500">
                  Permission Needed
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              {permission === 'granted' 
                ? 'Desktop & mobile browser chime active when your token is 2 turns away.'
                : 'Allow notifications to receive immediate audio alerts when called to chair.'}
            </p>
            {permission !== 'granted' && (
              <button
                type="button"
                onClick={handleEnablePush}
                className="w-full mt-2 h-9 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Enable Browser Alerts</span>
              </button>
            )}
          </div>

          {/* Turn Proximity Alerts Status */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#11141e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-1.5">
            <div className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Live Queue Proximity
            </div>
            <div className="text-2xl font-black font-mono text-slate-900 dark:text-white flex items-center gap-2">
              <span className={turnAlertCount > 0 ? 'text-amber-500' : 'text-slate-700 dark:text-slate-300'}>
                {turnAlertCount}
              </span>
              <span className="text-xs font-sans font-bold text-slate-500 dark:text-slate-400">
                Turn Calls Pending
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              High-priority audio alerts chime 2 numbers before your station is called.
            </p>
          </div>

          {/* Active Queue Token Link Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white/95 dark:bg-[#11141e]/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Active Queue Token
              </span>
              {activeToken && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              )}
            </div>

            {activeToken && ['WAITING', 'CALLED', 'IN_SERVICE'].includes(activeToken.status) ? (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xl font-black font-mono text-amber-500">
                    Token #{activeToken.tokenNumber}
                  </span>
                  <span className="text-xs font-bold text-emerald-500">
                    Position {activeToken.position}
                  </span>
                </div>
                <Link
                  href="/queue"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline pt-0.5"
                >
                  <span>Track Live Queue Pass</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            ) : (
              <div className="space-y-1">
                <div className="text-sm font-bold text-slate-700 dark:text-slate-300">
                  No Active Queue Ticket
                </div>
                <Link
                  href="/home"
                  className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  <span>Find Ateliers & Join Queue</span>
                  <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* =========================================================================
            FILTER TABS
            ========================================================================= */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200/60 dark:border-slate-800/60">
          {[
            { id: 'ALL', label: 'All Alerts', count: localNotifsList.length },
            { id: 'UNREAD', label: 'Unread', count: unreadCount },
            { id: 'TURNS', label: 'Queue & Turn Calls', count: localNotifsList.filter(n => n.type === 'TURN_CALLED' || n.type === 'TURN_APPROACHING').length },
            { id: 'APPOINTMENTS', label: 'Bookings', count: localNotifsList.filter(n => n.type === 'BOOKING_CONFIRMED' || n.type === 'APPOINTMENT_REMINDER').length },
            { id: 'VIP', label: 'VIP Privileges', count: localNotifsList.filter(n => n.type === 'SYSTEM_PROMO').length },
          ].map((tab) => {
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id as FilterType)}
                className={`h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900/90 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800'
                }`}
              >
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    isActive
                      ? 'bg-white text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* =========================================================================
            NOTIFICATION FEED LIST
            ========================================================================= */}
        <div className="space-y-3">
          {filteredNotifs.length === 0 ? (
            <div className="py-20 text-center rounded-3xl bg-white/60 dark:bg-[#11141e]/60 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl p-8 space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center mx-auto shadow-inner">
                <Inbox className="w-8 h-8 opacity-70" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                  No Notifications Found
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                  {activeFilter === 'UNREAD' 
                    ? 'All your salon queue alerts and booking notifications have been read.'
                    : 'Your alert dossier is currently empty. New live queue updates will appear here.'}
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/home"
                  className="inline-flex items-center gap-2 h-11 px-5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-bold text-xs shadow-md shadow-amber-500/20 hover:from-amber-600 hover:to-amber-700 transition-all"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>Discover Pune Ateliers</span>
                </Link>
              </div>
            </div>
          ) : (
            filteredNotifs.map((notif) => {
              const badge = getNotifBadge(notif.type);
              const IconComponent = badge.icon;
              const isTurnAlert = notif.type === 'TURN_CALLED' || notif.type === 'TURN_APPROACHING';

              return (
                <div
                  key={notif.id}
                  className={`group relative rounded-2xl p-4 sm:p-5 transition-all duration-200 border ${
                    !notif.isRead
                      ? isTurnAlert
                        ? 'bg-amber-500/[0.07] dark:bg-amber-500/10 border-amber-500/40 shadow-md shadow-amber-500/5 ring-1 ring-amber-500/25'
                        : 'bg-white dark:bg-[#11141e] border-amber-500/30 dark:border-amber-500/35 shadow-xs'
                      : 'bg-white/80 dark:bg-[#0e1018]/80 border-slate-200/80 dark:border-slate-800/80 opacity-85 hover:opacity-100'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    
                    {/* Left: Icon & Content */}
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${badge.bgColor}`}>
                        <IconComponent className="w-5 h-5" />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${badge.bgColor}`}>
                            {badge.label}
                          </span>
                          {!notif.isRead && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                              <span>New Alert</span>
                            </span>
                          )}
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 ml-auto">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(notif.createdAt)}</span>
                          </span>
                        </div>

                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                          {notif.title}
                        </h3>

                        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                          {notif.message}
                        </p>

                        {/* Action Link if provided */}
                        {notif.actionUrl && (
                          <div className="pt-1">
                            <Link
                              href={notif.actionUrl}
                              className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                            >
                              <span>
                                {notif.type === 'TURN_CALLED' || notif.type === 'TURN_APPROACHING' 
                                  ? 'View Live Queue Pass' 
                                  : notif.type === 'BOOKING_CONFIRMED' 
                                  ? 'View Appointment Receipt'
                                  : 'View Member Privileges'}
                              </span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </Link>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Individual Item Actions */}
                    <div className="flex items-center gap-1.5 sm:self-center shrink-0 ml-auto sm:ml-0">
                      {!notif.isRead && (
                        <button
                          type="button"
                          onClick={() => handleMarkItemRead(notif.id)}
                          className="h-8 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          title="Mark as read"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span className="hidden sm:inline">Read</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDeleteItem(notif.id)}
                        className="h-8 w-8 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-all flex items-center justify-center cursor-pointer"
                        title="Delete notification"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Note */}
        <div className="pt-6 border-t border-slate-200/80 dark:border-slate-800/80 text-center text-xs text-slate-500 dark:text-slate-400">
          NovaQ • Realtime WebPush & Queue Proximity Dispatch Architecture
        </div>

      </div>

    </div>
  );
}
