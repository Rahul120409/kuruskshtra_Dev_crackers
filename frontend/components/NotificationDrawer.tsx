'use client';

import React from 'react';
import Link from 'next/link';
import { X, Bell, CheckCheck, Clock, ArrowRight, Sparkles } from 'lucide-react';
import { useCustomer } from '../context/CustomerContext';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const { notifications, markNotifAsRead } = useCustomer();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose} 
      />

      {/* Slide-over panel */}
      <div className="relative w-full max-w-md h-full bg-slate-950 border-l border-zinc-800 p-6 flex flex-col shadow-2xl z-10 overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Notifications</h2>
              <p className="text-xs text-zinc-400">In-App Live Queue & Booking Updates</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of notifications */}
        <div className="flex-1 py-4 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16">
              <Bell className="w-10 h-10 text-zinc-600 mx-auto mb-3 opacity-50" />
              <p className="text-sm font-medium text-zinc-400">No notifications yet</p>
              <p className="text-xs text-zinc-600 mt-1">Updates regarding your live queue position and booking will appear here.</p>
            </div>
          ) : (
            notifications.map((notif) => {
              const isTurnAlert = notif.type === 'TURN_CALLED' || notif.type === 'TURN_APPROACHING';
              return (
                <div
                  key={notif.id}
                  onClick={() => markNotifAsRead(notif.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    !notif.isRead
                      ? isTurnAlert
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/5'
                        : 'bg-zinc-900/90 border-amber-500/20'
                      : 'bg-zinc-900/40 border-zinc-800/80 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm font-semibold ${isTurnAlert ? 'text-amber-300' : 'text-zinc-100'}`}>
                      {notif.title}
                    </h3>
                    {!notif.isRead && (
                      <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0 mt-1.5" />
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{notif.message}</p>
                  
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60">
                    <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>

                    {notif.actionUrl && (
                      <Link
                        href={notif.actionUrl}
                        onClick={onClose}
                        className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer note */}
        <div className="pt-3 border-t border-zinc-800 text-[11px] text-zinc-500 text-center">
          SalonFlow Realtime In-App Notification System (LLD Section 12)
        </div>
      </div>
    </div>
  );
};
