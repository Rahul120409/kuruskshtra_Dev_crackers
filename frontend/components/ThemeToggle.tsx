'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  className = '',
  showLabel = false,
}) => {
  const { resolvedTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = mounted ? resolvedTheme === 'dark' : true;

  if (showLabel) {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full py-2.5 px-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer ${
          isDark
            ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-amber-500/40 hover:bg-slate-850'
            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:bg-slate-50 shadow-sm'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <div className="flex items-center gap-2 text-xs font-semibold">
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-400" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
          )}
          <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </div>
        <span
          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
            isDark
              ? 'bg-indigo-500/15 text-indigo-300 border border-indigo-500/30'
              : 'bg-amber-500/15 text-amber-700 border border-amber-500/30'
          }`}
        >
          {isDark ? 'Active' : 'Active'}
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl border transition-all flex items-center justify-center cursor-pointer group ${
        isDark
          ? 'bg-slate-900 border-slate-800 text-amber-400 hover:text-amber-300 hover:border-amber-500/30 hover:bg-slate-850 shadow-sm'
          : 'bg-white border-slate-200 text-indigo-600 hover:text-indigo-700 hover:border-indigo-300 hover:bg-slate-50 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-4 h-4 overflow-hidden flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 transition-transform duration-300 group-hover:rotate-45 group-hover:scale-110" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600 transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />
        )}
      </div>
      <span className="sr-only">Toggle theme</span>
    </button>
  );
};
