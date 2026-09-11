import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { CustomerProvider } from '../context/CustomerContext';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

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
          <main className="flex-1">{children}</main>
          <Footer />
        </CustomerProvider>
      </body>
    </html>
  );
}
