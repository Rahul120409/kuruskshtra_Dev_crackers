import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CustomerProvider } from '../context/CustomerContext';
import { Navbar } from '../components/Navbar';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'SalonFlow AI — Smart Salon, Live Queue & Admin Operations',
  description: 'Enterprise salon management, AI hairstyle recommendations, smart appointments, and live queue tracking.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-[#090d16] text-zinc-100 selection:bg-amber-500 selection:text-black">
        <CustomerProvider>
          <Navbar />
          <main className="flex-1 pb-16">{children}</main>
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
                <span className="font-mono text-[11px] text-amber-500/90">API: 192.168.137.199:8080</span>
              </div>
            </div>
          </footer>
        </CustomerProvider>
      </body>
    </html>
  );
}
