import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SalonFlow AI — Admin Portal",
  description: "Enterprise Salon Operations, Intelligence & Management Portal",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className="dark h-full antialiased bg-[#0b0d13] text-zinc-100"
    >
      <body className="min-h-full flex flex-col bg-[#0b0d13] text-zinc-100">{children}</body>
    </html>
  );
}
