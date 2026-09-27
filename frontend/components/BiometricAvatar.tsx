'use client';

import React from 'react';

interface BiometricAvatarProps {
  gender?: 'boy' | 'girl';
  faceShape?: string;
  styleId?: string;
  mode?: 'mesh-only' | 'styled' | 'minimal';
  hairColor?: string;
  isScanning?: boolean;
  className?: string;
}

/**
 * High-Tech Cybernetic Biometric Cranial Avatar
 * Renders a futuristic vector face mesh with cranial landmarks, biometric nodes,
 * and dynamically applied hairstyle silhouettes (including Clean Bald Head,
 * Textured Crop, Quiff, Pompadour, Buzz Cut, etc.).
 */
export const BiometricAvatar: React.FC<BiometricAvatarProps> = ({
  gender = 'boy',
  faceShape = 'Oval',
  styleId = 'HS-B01',
  mode = 'styled',
  isScanning = false,
  className = 'w-full h-full'
}) => {
  // Determine cranial contour adjustments based on detected face shape
  const isRound = faceShape.toLowerCase().includes('round');
  const isSquare = faceShape.toLowerCase().includes('square');
  const isHeart = faceShape.toLowerCase().includes('heart');
  const isOblong = faceShape.toLowerCase().includes('oblong');

  // Head contour path coordinates
  // Base oval: center 200, 220
  const jawWidth = isRound ? 84 : isSquare ? 88 : isHeart ? 62 : 74;
  const chinY = isOblong ? 330 : 315;
  const templeWidth = isHeart ? 98 : isRound ? 92 : 88;

  const headPath = `
    M ${200 - templeWidth} 160
    C ${200 - templeWidth} 80, ${200 + templeWidth} 80, ${200 + templeWidth} 160
    C ${200 + templeWidth} 220, ${200 + jawWidth} 270, ${200 + jawWidth * 0.55} 295
    C ${200 + jawWidth * 0.3} 310, 208 ${chinY}, 200 ${chinY}
    C 192 ${chinY}, ${200 - jawWidth * 0.3} 310, ${200 - jawWidth * 0.55} 295
    C ${200 - jawWidth} 270, ${200 - templeWidth} 220, ${200 - templeWidth} 160
    Z
  `;

  // Check if style is clean bald head
  const isBald = styleId === 'HS-B09';
  const isBuzz = styleId === 'HS-B04';
  const isCrop = styleId === 'HS-B01';
  const isQuiff = styleId === 'HS-B02';
  const isPompadour = styleId === 'HS-B03';
  const isSidePart = styleId === 'HS-B05';
  const isLongWaves = styleId === 'HS-G01';
  const isBob = styleId === 'HS-G02';
  const isCurtainBangs = styleId === 'HS-G03';
  const isPixie = styleId === 'HS-G04';

  return (
    <div className={`relative flex items-center justify-center select-none bg-[#050811] overflow-hidden ${className}`}>
      {/* Background Cybernetic Grid */}
      <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#38bdf8" strokeWidth="0.5" strokeOpacity="0.4" />
          </pattern>
          <radialGradient id="radial-glow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.18" />
            <stop offset="60%" stopColor="#0284c7" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#050811" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-pattern)" />
        <rect width="100%" height="100%" fill="url(#radial-glow)" />
      </svg>

      {/* Main Avatar SVG */}
      <svg
        viewBox="0 0 400 420"
        className="w-full h-full max-h-[380px] drop-shadow-[0_10px_25px_rgba(0,0,0,0.8)]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Skin & Cranial Gradients */}
          <linearGradient id="skin-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1a2538" />
            <stop offset="50%" stopColor="#111928" />
            <stop offset="100%" stopColor="#0c121e" />
          </linearGradient>

          <linearGradient id="bald-scalp-glow" x1="50%" y1="0%" x2="50%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#38bdf8" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#0e1726" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="hair-base-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#283548" />
            <stop offset="50%" stopColor="#1e2736" />
            <stop offset="100%" stopColor="#111824" />
          </linearGradient>

          <linearGradient id="gold-stroke" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#d97706" />
          </linearGradient>

          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. NECK & SHOULDERS */}
        <g id="body-base">
          {/* Shoulders */}
          <path
            d="M 80 420 C 110 370, 140 340, 160 330 L 240 330 C 260 340, 290 370, 320 420 Z"
            fill="#0f172a"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Clavicle / Sternum guides */}
          <line x1="160" y1="365" x2="200" y2="385" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          <line x1="240" y1="365" x2="200" y2="385" stroke="#334155" strokeWidth="1" strokeDasharray="3 3" />
          {/* Neck */}
          <path
            d="M 160 270 L 160 335 C 175 340, 225 340, 240 335 L 240 270 Z"
            fill="#111928"
            stroke="#1e293b"
            strokeWidth="1.5"
          />
          {/* Neck muscle contour */}
          <path d="M 175 285 L 182 335" stroke="#1e293b" strokeWidth="1" />
          <path d="M 225 285 L 218 335" stroke="#1e293b" strokeWidth="1" />
        </g>

        {/* 2. EARS */}
        <g id="ears">
          {/* Left Ear */}
          <path
            d={`M ${200 - templeWidth + 2} 185 C ${200 - templeWidth - 14} 185, ${200 - templeWidth - 16} 230, ${200 - templeWidth + 4} 242 Z`}
            fill="#131c2d"
            stroke="#283548"
            strokeWidth="1.5"
          />
          <path
            d={`M ${200 - templeWidth - 5} 198 C ${200 - templeWidth - 10} 210, ${200 - templeWidth - 6} 228, ${200 - templeWidth + 2} 232`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            opacity="0.6"
          />
          {/* Right Ear */}
          <path
            d={`M ${200 + templeWidth - 2} 185 C ${200 + templeWidth + 14} 185, ${200 + templeWidth + 16} 230, ${200 + templeWidth - 4} 242 Z`}
            fill="#131c2d"
            stroke="#283548"
            strokeWidth="1.5"
          />
          <path
            d={`M ${200 + templeWidth + 5} 198 C ${200 + templeWidth + 10} 210, ${200 + templeWidth + 6} 228, ${200 + templeWidth - 2} 232`}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="1"
            opacity="0.6"
          />
        </g>

        {/* 3. HEAD SILHOUETTE */}
        <path
          d={headPath}
          fill="url(#skin-gradient)"
          stroke="#334155"
          strokeWidth="1.5"
        />

        {/* 4. BALD SCALP POLISH / FINISH (if HS-B09) */}
        {isBald && (
          <g id="bald-finish">
            <path
              d={`
                M ${200 - templeWidth} 160
                C ${200 - templeWidth} 80, ${200 + templeWidth} 80, ${200 + templeWidth} 160
                C 200 135, 200 135, ${200 - templeWidth} 160
                Z
              `}
              fill="url(#bald-scalp-glow)"
            />
            {/* Specular Highlight Sheen */}
            <ellipse cx="185" cy="115" rx="35" ry="14" fill="#ffffff" opacity="0.12" />
            <ellipse cx="178" cy="112" rx="15" ry="6" fill="#ffffff" opacity="0.25" />
            {/* Shaved fade micro-gradient on temples */}
            <path
              d={`M ${200 - templeWidth + 4} 150 C ${200 - templeWidth + 15} 180, ${200 - templeWidth + 15} 230, ${200 - jawWidth} 260`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="2 3"
              opacity="0.7"
            />
            <path
              d={`M ${200 + templeWidth - 4} 150 C ${200 + templeWidth - 15} 180, ${200 + templeWidth - 15} 230, ${200 + jawWidth} 260`}
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2"
              strokeDasharray="2 3"
              opacity="0.7"
            />
          </g>
        )}

        {/* 5. FACIAL LANDMARKS & SENSORS */}
        <g id="facial-features">
          {/* Eyebrows */}
          <path
            d={gender === 'girl' ? 'M 148 185 Q 170 176 186 182' : 'M 145 186 Q 168 178 188 184'}
            fill="none"
            stroke="#475569"
            strokeWidth={gender === 'girl' ? '2.5' : '3.5'}
            strokeLinecap="round"
          />
          <path
            d={gender === 'girl' ? 'M 214 182 Q 230 176 252 185' : 'M 212 184 Q 232 178 255 186'}
            fill="none"
            stroke="#475569"
            strokeWidth={gender === 'girl' ? '2.5' : '3.5'}
            strokeLinecap="round"
          />

          {/* Eyes (Cybernetic Biometric style) */}
          <g id="eyes">
            {/* Left Eye */}
            <path d="M 152 198 Q 168 190 184 198 Q 168 206 152 198 Z" fill="#090d16" stroke="#38bdf8" strokeWidth="1.2" />
            <circle cx="168" cy="198" r="4" fill="#38bdf8" opacity="0.9" />
            <circle cx="169" cy="197" r="1.5" fill="#ffffff" />

            {/* Right Eye */}
            <path d="M 216 198 Q 232 190 248 198 Q 232 206 216 198 Z" fill="#090d16" stroke="#38bdf8" strokeWidth="1.2" />
            <circle cx="232" cy="198" r="4" fill="#38bdf8" opacity="0.9" />
            <circle cx="233" cy="197" r="1.5" fill="#ffffff" />
          </g>

          {/* Nose */}
          <path
            d="M 200 185 L 199 232 Q 192 238 188 238 L 212 238 Q 208 238 201 232"
            fill="none"
            stroke="#334155"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <circle cx="194" cy="236" r="1.5" fill="#475569" />
          <circle cx="206" cy="236" r="1.5" fill="#475569" />

          {/* Mouth / Lips */}
          <path
            d="M 180 268 Q 200 264 220 268 Q 200 274 180 268 Z"
            fill="#1e293b"
            stroke="#475569"
            strokeWidth="1.2"
          />
          <line x1="183" y1="268" x2="217" y2="268" stroke="#334155" strokeWidth="1" />

          {/* Chin Apex Indicator */}
          <circle cx="200" cy={chinY - 14} r="2" fill="#f59e0b" opacity="0.6" />
        </g>

        {/* 6. BIOMETRIC WIREFRAME MESH (Visible in 'mesh-only' or as HUD background) */}
        {mode === 'mesh-only' && (
          <g id="cranial-mesh-delaunay" opacity="0.85">
            {/* Polygonal Wireframe Lines */}
            <polygon points="200,105 168,145 200,150" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeOpacity="0.5" />
            <polygon points="200,105 232,145 200,150" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeOpacity="0.5" />
            <polygon points="168,145 130,165 148,185" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.5" />
            <polygon points="232,145 270,165 252,185" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.5" />
            <polygon points="148,185 200,185 186,182" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.4" />
            <polygon points="252,185 200,185 214,182" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.4" />
            <polygon points="168,198 200,185 200,232" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeOpacity="0.6" />
            <polygon points="232,198 200,185 200,232" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeOpacity="0.6" />
            <polygon points="168,198 126,220 188,238" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.4" />
            <polygon points="232,198 274,220 212,238" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.4" />
            <polygon points="188,238 200,268 212,238" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeOpacity="0.7" />
            <polygon points="188,238 135,270 180,268" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.4" />
            <polygon points="212,238 265,270 220,268" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.4" />
            <polygon points="180,268 200,312 220,268" fill="none" stroke="#f59e0b" strokeWidth="0.75" strokeOpacity="0.8" />
            <polygon points="180,268 152,295 200,312" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.5" />
            <polygon points="220,268 248,295 200,312" fill="none" stroke="#38bdf8" strokeWidth="0.75" strokeOpacity="0.5" />

            {/* Glowing Biometric Landmark Points */}
            <circle cx="200" cy="105" r="2.5" fill="#f59e0b" filter="url(#glow)" />
            <circle cx="168" cy="145" r="2" fill="#38bdf8" />
            <circle cx="232" cy="145" r="2" fill="#38bdf8" />
            <circle cx="200" cy="185" r="3" fill="#f59e0b" filter="url(#glow)" />
            <circle cx="168" cy="198" r="2.5" fill="#38bdf8" />
            <circle cx="232" cy="198" r="2.5" fill="#38bdf8" />
            <circle cx="200" cy="232" r="2.5" fill="#f59e0b" />
            <circle cx="188" cy="238" r="2" fill="#38bdf8" />
            <circle cx="212" cy="238" r="2" fill="#38bdf8" />
            <circle cx="200" cy="268" r="2.5" fill="#f59e0b" />
            <circle cx="180" cy="268" r="2" fill="#38bdf8" />
            <circle cx="220" cy="268" r="2" fill="#38bdf8" />
            <circle cx="200" cy="312" r="3" fill="#f59e0b" filter="url(#glow)" />

            {/* Horizontal Cranial Proportions Rule Lines */}
            <line x1="85" y1="185" x2="315" y2="185" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
            <text x="320" y="188" fill="#f59e0b" fontSize="8" fontFamily="monospace" opacity="0.8">ZYGOMATIC</text>

            <line x1="95" y1="238" x2="305" y2="238" stroke="#38bdf8" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
            <text x="310" y="241" fill="#38bdf8" fontSize="8" fontFamily="monospace" opacity="0.8">SUB-NASALE</text>

            <line x1="120" y1="312" x2="280" y2="312" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="3 3" opacity="0.6" />
            <text x="285" y="315" fill="#f59e0b" fontSize="8" fontFamily="monospace" opacity="0.8">GNATHION</text>
          </g>
        )}

        {/* 7. HAIRSTYLE SILHOUETTE (Applied dynamically for 'styled' mode) */}
        {mode === 'styled' && !isBald && (
          <g id="tailored-hair-geometry">
            {/* STYLE: Textured Crop (HS-B01) */}
            {isCrop && (
              <g id="textured-crop-cut">
                {/* Hair Mass */}
                <path
                  d="
                    M 110 165
                    C 110 70, 290 70, 290 165
                    C 285 160, 275 165, 270 160
                    C 260 168, 245 158, 235 165
                    C 225 158, 215 167, 200 160
                    C 185 167, 175 158, 165 165
                    C 155 158, 140 168, 130 160
                    C 125 165, 115 160, 110 165
                    Z
                  "
                  fill="url(#hair-base-gradient)"
                  stroke="#3b82f6"
                  strokeWidth="1.5"
                />
                {/* Forward textured fringe strands */}
                <path d="M 135 125 Q 145 162 148 172" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                <path d="M 160 115 Q 170 160 172 174" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                <path d="M 185 110 Q 195 158 200 175" stroke="#93c5fd" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                <path d="M 215 110 Q 218 158 222 174" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                <path d="M 240 115 Q 242 160 248 172" stroke="#93c5fd" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
                {/* Clean Temple Fade lines */}
                <path d="M 112 175 L 118 215" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 3" />
                <path d="M 288 175 L 282 215" stroke="#f59e0b" strokeWidth="1.5" strokeDasharray="2 3" />
              </g>
            )}

            {/* STYLE: Modern Quiff (HS-B02) */}
            {isQuiff && (
              <g id="modern-quiff-cut">
                {/* Volumetric swept-up quiff crest */}
                <path
                  d="
                    M 112 165
                    C 108 85, 160 45, 205 40
                    C 245 42, 288 80, 288 165
                    C 275 160, 260 162, 250 152
                    C 235 145, 215 140, 195 142
                    C 170 142, 145 148, 130 155
                    Z
                  "
                  fill="url(#hair-base-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                {/* Upward brush sweep strokes */}
                <path d="M 165 135 Q 185 70 205 50" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
                <path d="M 180 135 Q 200 75 220 54" stroke="#38bdf8" strokeWidth="1.8" strokeLinecap="round" opacity="0.7" />
                <path d="M 200 135 Q 218 80 238 65" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                {/* Tapered side lines */}
                <path d="M 114 170 L 120 220" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
                <path d="M 286 170 L 280 220" stroke="#38bdf8" strokeWidth="1.2" strokeDasharray="3 2" />
              </g>
            )}

            {/* STYLE: Pompadour Fade (HS-B03) */}
            {isPompadour && (
              <g id="pompadour-fade-cut">
                <path
                  d="
                    M 112 165
                    C 105 75, 150 40, 200 38
                    C 255 40, 290 75, 288 165
                    C 278 155, 255 148, 230 148
                    C 200 148, 160 150, 125 160
                    Z
                  "
                  fill="url(#hair-base-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                {/* Sculpted pompadour roll contour */}
                <path d="M 140 110 Q 200 58 260 110" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" opacity="0.8" />
                <path d="M 155 125 Q 200 75 245 125" stroke="#ffffff" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
              </g>
            )}

            {/* STYLE: Military Buzz Cut (HS-B04) */}
            {isBuzz && (
              <g id="military-buzz-cut">
                <path
                  d={`
                    M ${200 - templeWidth - 2} 165
                    C ${200 - templeWidth - 2} 75, ${200 + templeWidth + 2} 75, ${200 + templeWidth + 2} 165
                    C ${200 + templeWidth - 10} 145, ${200 - templeWidth + 10} 145, ${200 - templeWidth - 2} 165
                    Z
                  `}
                  fill="#172233"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                {/* Sharp hairline edge-up */}
                <path d="M 130 152 L 270 152" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="130" y1="152" x2="126" y2="175" stroke="#f59e0b" strokeWidth="1.5" />
                <line x1="270" y1="152" x2="274" y2="175" stroke="#f59e0b" strokeWidth="1.5" />
              </g>
            )}

            {/* STYLE: Executive Side Part (HS-B05) */}
            {isSidePart && (
              <g id="side-part-cut">
                <path
                  d="
                    M 112 165
                    C 110 80, 290 80, 288 165
                    C 270 155, 235 150, 200 150
                    C 165 150, 135 155, 112 165
                    Z
                  "
                  fill="url(#hair-base-gradient)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                {/* Razor side part line */}
                <line x1="155" y1="100" x2="148" y2="160" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" />
                {/* Comb-over flow strokes */}
                <path d="M 160 115 Q 210 110 260 135" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
                <path d="M 162 135 Q 210 130 255 150" stroke="#94a3b8" strokeWidth="1.5" opacity="0.6" />
              </g>
            )}

            {/* FEMININE STYLES */}
            {isLongWaves && (
              <g id="long-waves">
                <path
                  d="
                    M 100 170
                    C 95 60, 305 60, 300 170
                    C 315 240, 325 320, 310 390
                    C 290 390, 280 340, 275 270
                    C 255 160, 145 160, 125 270
                    C 120 340, 110 390, 90 390
                    C 75 320, 85 240, 100 170
                    Z
                  "
                  fill="url(#hair-base-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                <path d="M 140 180 Q 115 280 120 370" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.7" />
                <path d="M 260 180 Q 285 280 280 370" stroke="#f59e0b" strokeWidth="1.5" fill="none" opacity="0.7" />
              </g>
            )}

            {isBob && (
              <g id="classic-bob">
                <path
                  d="
                    M 105 165
                    C 100 65, 300 65, 295 165
                    C 305 230, 285 275, 275 285
                    C 265 240, 255 165, 200 165
                    C 145 165, 135 240, 125 285
                    C 115 275, 95 230, 105 165
                    Z
                  "
                  fill="url(#hair-base-gradient)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {isCurtainBangs && (
              <g id="curtain-bangs">
                <path
                  d="
                    M 105 165
                    C 100 65, 300 65, 295 165
                    C 305 240, 315 320, 295 380
                    C 285 360, 275 290, 270 230
                    C 255 170, 215 165, 200 175
                    C 185 165, 145 170, 130 230
                    C 125 290, 115 360, 105 380
                    C 85 320, 95 240, 105 165
                    Z
                  "
                  fill="url(#hair-base-gradient)"
                  stroke="#f59e0b"
                  strokeWidth="1.5"
                />
                {/* Parted curtain fringe curves */}
                <path d="M 200 145 Q 170 170 150 210" stroke="#f59e0b" strokeWidth="2" fill="none" />
                <path d="M 200 145 Q 230 170 250 210" stroke="#f59e0b" strokeWidth="2" fill="none" />
              </g>
            )}

            {isPixie && (
              <g id="pixie-cut">
                <path
                  d="
                    M 112 165
                    C 105 75, 295 75, 288 165
                    C 275 160, 255 165, 235 155
                    C 215 150, 185 150, 165 155
                    C 145 165, 125 160, 112 165
                    Z
                  "
                  fill="url(#hair-base-gradient)"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                />
                <path d="M 145 120 Q 185 150 210 160" stroke="#38bdf8" strokeWidth="1.5" fill="none" opacity="0.8" />
              </g>
            )}
          </g>
        )}

        {/* 8. ACTIVE SCANNING LASER BEAM */}
        {isScanning && (
          <g id="scan-laser" className="animate-pulse">
            <line x1="60" y1="180" x2="340" y2="180" stroke="#f59e0b" strokeWidth="2" filter="url(#glow)" />
            <line x1="60" y1="180" x2="340" y2="180" stroke="#ffffff" strokeWidth="0.8" />
          </g>
        )}
      </svg>
    </div>
  );
};
