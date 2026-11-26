import type { Metadata, Viewport } from 'next';
import './globals.css';

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'Allmax Video Studio — Create Product Mockup Videos',
  description:
    'Easily create product mockup videos with Allmax Nutrition supplements for TikTok & Instagram.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Allmax Studio',
  },
  icons: {
    icon: '/icon-192.png',
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Allmax Studio" />
        <meta name="theme-color" content="#FFFFFF" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
      </head>
      <body className="h-full w-full bg-[#080B12] md:bg-[#222222] text-slate-900 antialiased overflow-hidden md:flex md:items-center md:justify-center md:p-4">
        {/* Desktop-Only Mobile Simulator Frame (Mobile & Android App stay 100% full-screen) */}
        <div className="relative h-full w-full md:w-[392px] md:h-[min(835px,calc(100vh-2rem))] md:rounded-[52px] md:p-[11px] md:bg-gradient-to-b md:from-[#3B3B45] md:via-[#1B1B21] md:to-[#2E2E37] md:shadow-[0_32px_90px_-15px_rgba(0,0,0,0.88),0_0_0_1px_rgba(255,255,255,0.12)]">
          {/* Decorative Side Hardware Buttons (Desktop Only) */}
          <div className="hidden md:block absolute -left-[3px] top-28 w-[3px] h-8 bg-[#3E3E48] rounded-l" />
          <div className="hidden md:block absolute -left-[3px] top-40 w-[3px] h-12 bg-[#3E3E48] rounded-l" />
          <div className="hidden md:block absolute -left-[3px] top-56 w-[3px] h-12 bg-[#3E3E48] rounded-l" />
          <div className="hidden md:block absolute -right-[3px] top-44 w-[3px] h-16 bg-[#3E3E48] rounded-r" />

          {/* Inner Screen (transform-gpu keeps fixed modals inside the simulator on desktop) */}
          <div className="relative h-full w-full md:rounded-[41px] md:bg-[#080B12] overflow-hidden flex flex-col md:transform-gpu">
            {/* Simulator Top Status Bar & Dynamic Island (Desktop Only) */}
            <div className="hidden md:flex shrink-0 items-center justify-between px-7 pt-3 pb-1.5 bg-[#0A0E18] text-white text-[11px] font-bold select-none z-40">
              <span>9:41</span>
              <div className="w-24 h-6 bg-black rounded-full border border-white/10 flex items-center justify-end pr-2.5 shadow-inner">
                <span className="w-2 h-2 rounded-full bg-[#1E293B] ring-1 ring-white/15" />
              </div>
              <span className="text-[10px] tracking-tight">5G • 100%</span>
            </div>

            {/* App Viewport */}
            <div className="flex-1 min-h-0 relative overflow-hidden">{children}</div>

            {/* Simulator Bottom Home Indicator (Desktop Only) */}
            <div className="hidden md:flex shrink-0 items-center justify-center py-2 bg-[#06080D] z-40">
              <div className="w-28 h-1 rounded-full bg-white/30" />
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
