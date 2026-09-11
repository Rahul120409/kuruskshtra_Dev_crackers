'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CustomerHomePage from './home/page';
import AdminPortal from './admin/page';

export default function Home() {
  const [activePortal, setActivePortal] = useState<'customer' | 'admin'>('customer');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('portal') === 'admin' || params.get('admin') === 'true' || params.get('view') === 'admin') {
        setActivePortal('admin');
      }
    }
  }, []);

  if (activePortal === 'admin') {
    return (
      <div>
        <div className="bg-slate-950 border-b border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-200 sticky top-20 z-30 shadow-md">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <span className="font-semibold text-white">SalonFlow AI Enterprise Admin Portal</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActivePortal('customer')}
              className="px-3 py-1 rounded-lg bg-indigo-600/40 hover:bg-indigo-600/60 text-indigo-200 font-semibold text-xs border border-indigo-500/40 transition-colors cursor-pointer"
            >
              ← Switch to Customer View
            </button>
            <Link
              href="/admin"
              className="px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 font-semibold text-xs border border-amber-500/30 transition-colors hidden sm:inline-block"
            >
              Standalone /admin ↗
            </Link>
          </div>
        </div>
        <AdminPortal />
      </div>
    );
  }

  return <CustomerHomePage />;
}
