'use client';

import React from 'react';
import { usePathname } from 'next/navigation';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on full-screen Admin Panel and Salon Panel
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/salon')) {
    return null;
  }

  return (
    <footer className="border-t border-zinc-800/80 bg-slate-950 py-8 text-center text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p>© 2026 SalonFlow AI. Built for 24-Hour Parallel Hackathon.</p>
        <div className="flex items-center gap-4 text-zinc-400">
          <a href="/admin" className="text-amber-400 hover:text-amber-300 transition-colors font-medium">
            Admin Operations Portal
          </a>
          <span>•</span>
          <span>Customer Experience</span>
          <span>•</span>
          <span className="font-mono text-[11px] text-amber-500/90">API: 192.168.137.199:8081</span>
        </div>
      </div>
    </footer>
  );
};
