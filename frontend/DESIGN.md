# LuxeTrim UI/UX Design System & Master Interface Specification

> **Purpose**: This document serves as the single source of truth for the LuxeTrim application interface. Whenever designing, building, or refactoring any page, modal, or component, refer directly to this specification to guarantee visual continuity, luxury aesthetic standards, and seamless responsive behavior across mobile and desktop.

---

## 1. Brand Identity & Design Philosophy

LuxeTrim merges **Quiet Luxury / Haute Coiffure** with **Cyber-Precision Real-Time Architecture**:
- **Aesthetic**: Modern, high-end atelier grooming lounge. Deep obsidian blacks, warm slate tones, polished champagne/amber gold highlights, and clean typography.
- **Atmosphere**: Confident, sleek, and frictionless. Zero clutter, no cheap-looking primary colors (pure red/blue/green are strictly forbidden).
- **Core Rule**: No page or component should ever look like a generic Bootstrap or plain Tailwind template. All interactive states, cards, and buttons must feel bespoke and state-of-the-art.

---

## 2. Color Palette & Theme Tokens

The application supports **Flawless Dual-Theme Architecture (Light Mode & Dark Mode)** with dynamic switching via the `ThemeToggle` component.

### 2.1 Accent Colors (Brand Identity)
| Token / Utility | Hex / Definition | Usage |
| :--- | :--- | :--- |
| **Amber Gold Primary** | `#f59e0b` to `#d97706` | Primary action buttons, active token badges, brand crest glows |
| **Champagne Highlight** | `#fef3c7` / `#fde68a` | Gradient text highlights, subtle borders, accent pill text |
| **Emerald Indicator** | `#10b981` / `#059669` | Live queue status, WebSocket sync ping, verified validation checks |
| **Rose / Crimson Alert** | `#f43f5e` / `#e11d48` | Error messages, cancel actions, closed salon indicators |
| **Electric Blue Info** | `#3b82f6` / `#2563eb` | Estimated arrival minutes, directions, navigation coordinates |
| **Royal Purple VIP** | `#a855f7` / `#9333ea` | Chair in-service status, VIP chair upgrades, premium stylist suite |

### 2.2 Background & Surface Tokens

#### Light Mode
```css
/* Background */
bg-gradient-to-br from-slate-100 via-amber-50/25 to-slate-50
/* Page Base */
text-slate-900
/* Cards & Containers */
bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-[0_20px_50px_rgba(0,0,0,0.08)]
/* Inputs */
bg-slate-50 border-slate-300 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/15
/* Inner secondary panels */
bg-slate-50/80 border border-slate-200/60
```

#### Dark Mode
```css
/* Background */
dark:from-[#08090d] dark:via-[#0f131c] dark:to-[#07080c]
/* Page Base */
dark:text-white
/* Cards & Containers */
dark:bg-[#11141e]/95 dark:backdrop-blur-xl dark:border-slate-800/90 dark:shadow-[0_25px_60px_rgba(0,0,0,0.6)]
/* Inputs */
dark:bg-[#090b11] dark:border-slate-800 dark:text-white dark:placeholder:text-slate-500 dark:focus:bg-[#0d1017] dark:focus:border-amber-500 dark:focus:ring-amber-500/20
/* Inner secondary panels */
dark:bg-[#0c0e16]/80 dark:border-slate-800/60
```

---

## 3. Typography Standards

The system loads Google Fonts (`Outfit`, `Inter`, `Bodoni Moda`, and `Manrope`):

| Hierarchy | Tailwind Classes | Example Usage |
| :--- | :--- | :--- |
| **Flagship Headline** | `text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]` | Landing page hero titles |
| **Luxury Serif Accent** | `font-serif italic font-normal bg-gradient-to-r from-amber-400 via-amber-200 to-amber-500 bg-clip-text text-transparent` | Editorial subtitle phrases |
| **Card / Section Heading**| `text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white` | Card headers, modal titles |
| **Field Label** | `text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200` | Input labels, table column headers |
| **Body & Explanations** | `text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed` | Descriptions, helper notes |
| **Digital Monospace** | `font-mono font-black text-amber-400` | Token numbers (`#14`), countdowns, live sync timestamps |

---

## 4. Reusable UI Components & Patterns

### 4.1 Buttons

#### Primary Luxury Action Button
Always use the amber gold gradient with smooth hover and active micro-scaling:
```tsx
<button
  type="button"
  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-600 hover:to-amber-800 text-white font-bold text-sm shadow-lg shadow-amber-500/25 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
>
  <span>Action Title</span>
  <ArrowRight className="w-4 h-4" />
</button>
```

#### Secondary Outline Button
For secondary or dismissive actions:
```tsx
<button
  type="button"
  className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer"
>
  <span>Secondary Action</span>
</button>
```

### 4.2 Form Inputs & Mobile Auto-Zoom Protection

> **CRITICAL RULE FOR MOBILE**:
> Input font size must **ALWAYS** be `text-base sm:text-sm`. Setting text size smaller than `16px` on mobile causes iOS Safari and mobile Chrome to automatically zoom into the input, which ruins the user experience.

```tsx
<div className="space-y-1.5">
  <div className="flex items-center justify-between">
    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
      Input Label
    </label>
    {/* Optional live indicator badge */}
    <span className="text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
      ✓ Valid
    </span>
  </div>

  <div className="relative flex items-center">
    <Mail className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 pointer-events-none" />
    <input
      type="text"
      placeholder="Placeholder text"
      className="w-full pl-10 pr-4 py-3 sm:py-3.5 rounded-xl bg-slate-50 dark:bg-[#090b11] border border-slate-300 dark:border-slate-800 text-base sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/25 focus:border-amber-500 dark:focus:border-amber-500 transition-all shadow-inner"
    />
  </div>
</div>
```

### 4.3 Validation Checklist Box
Used on `/login` and `/register` to clearly communicate requirement fulfillment:
```tsx
<div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 space-y-2">
  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
    <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
    <span>Input Validation Requirements</span>
  </div>
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400">
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
        isValid ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
      }`}>
        {isValid ? '✓' : '•'}
      </span>
      <span>Requirement specification</span>
    </div>
  </div>
</div>
```

### 4.4 Live Status Badges
```tsx
{/* Live Pulsing Sync Badge */}
<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-mono font-bold text-xs">
  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
  LIVE SYNC
</span>

{/* Token Counter Badge */}
<div className="text-4xl sm:text-5xl font-black font-mono text-amber-400">
  #{tokenNumber}
</div>
```

---

## 5. Mobile & Desktop Responsiveness Guidelines

| Viewport Category | Breakpoint Range | Strategy |
| :--- | :--- | :--- |
| **Mobile (Small & Medium)** | `< 640px` (360px–430px) | Single-column stacks (`grid-cols-1`, `flex-col`), full-width buttons (`w-full`), comfortable `px-4 py-6` padding, 48px minimum touch targets, no horizontal scroll. |
| **Tablet** | `640px – 1024px` | 2-column layouts (`sm:grid-cols-2`), compact navigation, medium card widths. |
| **Desktop & Wide** | `>= 1024px` (1280px–1920px) | Multi-column grid (`grid-cols-3` or 12-column layouts), inline button groups (`sm:flex-row sm:w-auto`), centered cards with `max-w-md` / `max-w-xl` / `max-w-7xl`. |

### Responsive Layout Checklist:
1. **Container Widths**:
   - Authentication (Sign In): `max-w-md`
   - Registration: `max-w-xl`
   - Dashboards & Catalogs: `max-w-7xl`
2. **Hero & CTA Containers**: Always wrap hero CTA buttons in `flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-xl mx-auto`.
3. **No Overflow**: Always ensure top-level pages use `overflow-x-hidden`.
4. **Interactive Demos**: Constrain preview sliders and images (e.g. `w-full max-w-[320px] sm:max-w-md mx-auto`) so small 360px screens never experience viewport distortion.

---

## 6. Authentication & Route Guard Architecture

### 6.1 Unauthenticated Access Rule
Visitors **CANNOT access internal platform features without logging in first**. This includes:
- `/home` (Hyperlocal Salons Discovery)
- `/queue` (Live Token & Digital Pass)
- `/ai-recommend` (Biometric AI Hairstyle Consultation Studio)
- `/booking` (Atelier Chair Reservation)
- `/admin` (Salon Enterprise Operations Controller)

### 6.2 Standard Implementation Pattern
Every protected feature page must include the following client-side guard:
```tsx
import { useRouter } from 'next/navigation';
import { useCustomer } from '@/context/CustomerContext';

export default function ProtectedFeaturePage() {
  const router = useRouter();
  const { isLoggedIn } = useCustomer();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedUser = localStorage.getItem('salonflow_auth_user');
      if (!savedUser && !isLoggedIn) {
        router.push('/login?redirect=/current-feature-path');
      }
    }
  }, [isLoggedIn, router]);

  // Render feature content...
}
```

---

## 7. Navigation Shell Policy

| Route | Navbar Shown | Footer Shown | Notes |
| :--- | :--- | :--- | :--- |
| `/` (Landing) | `LandingNavbar.tsx` | Built-in Landing Footer | Static-style menu (Home, Features, AI Studio, Salons, Privacy, Contact, Theme Toggle, Find Salons). |
| `/login` | **None** (Clean floating top bar: `← Back to Home` + `ThemeToggle`) | **None** | Focused auth card, 0 top margin waste. |
| `/register` | **None** (Clean floating top bar: `← Back to Home` + `ThemeToggle`) | **None** | Focused auth card, 0 top margin waste. |
| `/home`, `/queue`, `/ai-recommend`, `/booking` | Customer `Navbar.tsx` | Standard `Footer.tsx` | Full app shell with active token alerts and drawer controls. |
| `/admin`, `/salon` | Dedicated Portal Header | **None** | Full-screen enterprise operations interface. |

---

## 8. Summary Checklist for Any New UI Screen

When creating a new page or modifying an existing one, verify:
- [ ] Uses high-contrast typography (`text-slate-900 dark:text-white` for headings).
- [ ] Looks equally stunning in **both** Light Mode and Dark Mode.
- [ ] All input fields have `text-base sm:text-sm` font size (preventing mobile iOS zoom).
- [ ] Action buttons have `min-h-[48px]` and full width (`w-full sm:w-auto`) on mobile.
- [ ] Responsive grid: 1 column on mobile, 2 or 3 columns on desktop.
- [ ] Unauthenticated users are redirected to `/login?redirect=...`.
- [ ] Zero horizontal overflow (`overflow-x-hidden`).
