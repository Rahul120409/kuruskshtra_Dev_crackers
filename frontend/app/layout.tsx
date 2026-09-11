import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '../context/ThemeContext';
import { CustomerProvider } from '../context/CustomerContext';
import { Navbar } from '../components/Navbar';

export const metadata: Metadata = {
  title: 'LuxeTrim — Haute Coiffure & Bespoke Grooming Lounge',
  description: 'Live atelier occupancy, real-time wait estimation, and instant chair reservations across premier grooming sanctuaries.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className="dark"
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900&family=Inter:wght@300;400;500;600&family=Manrope:wght@300;400;500;600;700&family=Outfit:wght@400;500;600;700&family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('salonflow_theme');
                  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  var theme = saved || (prefersDark ? 'dark' : 'light');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                    document.documentElement.setAttribute('data-theme', 'light');
                    document.documentElement.style.colorScheme = 'light';
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                    document.documentElement.setAttribute('data-theme', 'dark');
                    document.documentElement.style.colorScheme = 'dark';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="bg-surface font-body-md text-on-surface antialiased transition-colors duration-200 min-h-screen flex flex-col">
        <ThemeProvider>
          <CustomerProvider>
            <Navbar />
            <main className="w-full pt-20 bg-surface flex-1">
              {children}
            </main>
            <footer className="w-full bg-surface-container-lowest mt-space-xl transition-colors duration-200">
              <div className="w-full px-margin-desktop py-space-xl flex flex-col md:flex-row items-center justify-between gap-space-md">
                <div className="flex items-center gap-space-sm">
                  <span className="font-headline-sm text-headline-sm text-primary">LuxeTrim</span>
                  <span className="font-body-sm text-body-sm text-on-surface-variant">— Haute Coiffure &amp; Bespoke Grooming Lounge</span>
                </div>
                <div className="flex items-center gap-space-lg flex-wrap justify-center">
                  <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Private Concierge</a>
                  <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Salon Code &amp; Ethics</a>
                  <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Bespoke Suites</a>
                  <a className="font-body-sm text-body-sm text-on-surface-variant hover:text-primary transition-colors" href="#">Client Care</a>
                  <a className="font-body-sm text-body-sm text-primary font-bold hover:underline transition-colors" href="/admin">Admin Portal</a>
                </div>
                <div className="font-body-sm text-body-sm text-outline">
                  © 2025 LuxeTrim Atelier International. All privileges reserved.
                </div>
              </div>
            </footer>
          </CustomerProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
