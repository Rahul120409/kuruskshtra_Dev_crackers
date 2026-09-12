'use client';

import React from 'react';
import Link from 'next/link';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'icon-only';
  showTagline?: boolean;
  tagline?: string;
  asLink?: boolean;
  href?: string;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  variant = 'full',
  showTagline = false,
  tagline = 'HAUTE COIFFURE & QUEUE',
  asLink = false,
  href = '/home',
  className = '',
}) => {
  // Dimension definitions
  const dimensions = {
    sm: {
      box: 'w-7 h-7 rounded-lg',
      svg: 18,
      textSize: 'text-base',
      taglineSize: 'text-[8px]',
      gap: 'gap-2',
    },
    md: {
      box: 'w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl',
      svg: 22,
      textSize: 'text-lg sm:text-xl',
      taglineSize: 'text-[9px]',
      gap: 'gap-2.5',
    },
    lg: {
      box: 'w-12 h-12 sm:w-14 sm:h-14 rounded-2xl',
      svg: 30,
      textSize: 'text-2xl sm:text-3xl',
      taglineSize: 'text-[10px]',
      gap: 'gap-3',
    },
    xl: {
      box: 'w-16 h-16 sm:w-20 sm:h-20 rounded-3xl',
      svg: 42,
      textSize: 'text-3xl sm:text-4xl',
      taglineSize: 'text-xs',
      gap: 'gap-4',
    },
  }[size];

  const content = (
    <div className={`inline-flex items-center ${dimensions.gap} group select-none ${className}`}>
      
      {/* Geometric Luxury NovaQ Emblem */}
      <div 
        className={`relative ${dimensions.box} p-[1px] bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-600 shadow-md shadow-amber-500/20 group-hover:shadow-lg group-hover:shadow-amber-500/35 transition-all duration-300 shrink-0`}
      >
        <div className="w-full h-full rounded-[inherit] bg-[#0c0e17] flex items-center justify-center overflow-hidden relative">
          
          {/* Subtle ambient radial inner glow */}
          <div className="absolute inset-0 bg-radial from-amber-500/30 via-transparent to-transparent pointer-events-none" />

          {/* Bespoke NovaQ SVG Monogram */}
          <svg
            width={dimensions.svg}
            height={dimensions.svg}
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="transition-transform duration-300 group-hover:scale-105"
          >
            <defs>
              <linearGradient id="novaqGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
              <linearGradient id="novaqSheen" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Architectural "N" structure */}
            <path
              d="M10 36V14L22 32V14"
              stroke="url(#novaqGoldGrad)"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Smart "Q" Queue Pass Loop & Chair Portal */}
            <circle
              cx="32"
              cy="24"
              r="10"
              stroke="url(#novaqGoldGrad)"
              strokeWidth="4"
              strokeDasharray="50 8"
            />

            {/* Tail of "Q" - Dynamic queue advance arrow / scissor pivot */}
            <path
              d="M38 30L44 38"
              stroke="url(#novaqGoldGrad)"
              strokeWidth="4"
              strokeLinecap="round"
            />

            {/* Nova Starburst Sparkle at Apex */}
            <path
              d="M26 8L27.5 12L31.5 13.5L27.5 15L26 19L24.5 15L20.5 13.5L24.5 12L26 8Z"
              fill="url(#novaqGoldGrad)"
            />
          </svg>
        </div>
      </div>

      {/* Typography: NOVA + Q */}
      {variant !== 'icon-only' && (
        <div className="flex flex-col">
          <div className="flex items-baseline tracking-tight">
            <span className={`font-black text-slate-900 dark:text-white ${dimensions.textSize} font-sans tracking-tight`}>
              NOVA
            </span>
            <span 
              className={`font-black ${dimensions.textSize} bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 bg-clip-text text-transparent ml-0.5`}
            >
              Q
            </span>
          </div>

          {(showTagline || variant === 'full') && (
            <span 
              className={`font-mono font-bold tracking-widest uppercase text-amber-600 dark:text-amber-400/90 -mt-0.5 ${dimensions.taglineSize}`}
            >
              {tagline}
            </span>
          )}
        </div>
      )}

    </div>
  );

  if (asLink) {
    return (
      <Link href={href} className="inline-flex items-center cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
};

export default BrandLogo;
