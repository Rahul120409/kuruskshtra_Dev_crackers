'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from './BrandLogo';

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide footer on full-screen Admin Panel, Salon Panel, Login, and Register pages
  if (
    pathname?.startsWith('/admin') ||
    pathname?.startsWith('/salon') ||
    pathname?.startsWith('/login') ||
    pathname?.startsWith('/register')
  ) {
    return null;
  }

  return (
    <footer className="border-t border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#07080c] py-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BrandLogo size="sm" variant="compact" asLink href="/home" />
          <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
          <p className="text-xs">© 2026 NovaQ Technologies • Smart Salon & Atelier Network</p>
        </div>

        <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400 text-xs">
          <Link href="/admin" className="text-amber-600 dark:text-amber-400 hover:underline font-semibold">
            Admin Operations Portal
          </Link>
          <span>•</span>
          <Link href="/notifications" className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Alert Dossier
          </Link>
          <span>•</span>
          <span className="font-mono text-[11px] text-amber-500/90">
            API: {(process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081').replace(/^https?:\/\//, '')}
          </span>
        </div>
      </div>
    </footer>
  );
};
