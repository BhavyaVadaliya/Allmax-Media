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
      <body className="h-full w-full bg-[#080B12] md:bg-[#1E1E1E] text-slate-900 antialiased overflow-hidden md:flex md:items-center md:justify-center md:p-4">
        {/* Desktop-Only Realistic 9:16 iPhone Simulator Frame (Mobile & Android App stay 100% full-screen) */}
        <div className="relative h-full w-full md:h-[min(860px,calc(100vh-2rem))] md:aspect-[9/16] md:w-auto md:rounded-[54px] md:p-[3px] md:bg-gradient-to-b md:from-[#8C8794] md:via-[#4A4652] md:to-[#76717D] md:shadow-[0_35px_95px_-15px_rgba(0,0,0,0.9)]">
          {/* Decorative Side Hardware Buttons (Desktop Only) */}
          <div className="hidden md:block absolute -left-[3px] top-24 w-[3px] h-7 bg-[#6B6673] rounded-l-sm" />
          <div className="hidden md:block absolute -left-[3px] top-36 w-[3px] h-12 bg-[#6B6673] rounded-l-sm" />
          <div className="hidden md:block absolute -left-[3px] top-52 w-[3px] h-12 bg-[#6B6673] rounded-l-sm" />
          <div className="hidden md:block absolute -right-[3px] top-40 w-[3px] h-16 bg-[#6B6673] rounded-r-sm" />

          {/* Inner Black Glass Bezel */}
          <div className="h-full w-full md:rounded-[51px] md:p-[9px] md:bg-[#050507] md:shadow-inner">
            {/* Inner Screen (transform-gpu keeps fixed modals inside the simulator on desktop) */}
            <div className="relative h-full w-full md:rounded-[42px] md:bg-[#080B12] overflow-hidden flex flex-col md:transform-gpu">
              {/* Realistic iPhone Orange Status Bar & Dynamic Island (Desktop Only) */}
              <div className="hidden md:flex shrink-0 items-center justify-between px-6 pt-2.5 pb-2 bg-[#FF4800] text-white text-[12px] font-bold select-none z-40">
                <span className="tracking-tight w-12">9:41</span>

                {/* Dynamic Island with Realistic Front Camera Lens */}
                <div className="w-[96px] h-[26px] bg-black rounded-full flex items-center justify-end pr-2 shadow-md">
                  <div className="w-3.5 h-3.5 rounded-full bg-[#0F172A] ring-1 ring-white/10 flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#38BDF8]/50" />
                  </div>
                </div>

                {/* Signal, Wi-Fi & Battery Icons */}
                <div className="flex items-center justify-end space-x-1.5 w-12">
                  <svg className="w-3.5 h-3 fill-white" viewBox="0 0 18 12">
                    <rect x="0" y="8" width="3" height="4" rx="0.8" />
                    <rect x="4.5" y="5.5" width="3" height="6.5" rx="0.8" />
                    <rect x="9" y="3" width="3" height="9" rx="0.8" />
                    <rect x="13.5" y="0" width="3" height="12" rx="0.8" />
                  </svg>
                  <svg className="w-3.5 h-3 fill-white" viewBox="0 0 16 12">
                    <path d="M8 9.6a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8Zm-3.6-2a5.2 5.2 0 0 1 7.2 0 .9.9 0 0 0 1.2-1.3 7 7 0 0 0-9.6 0 .9.9 0 0 0 1.2 1.3Zm-2.6-2.7a9 9 0 0 1 12.4 0 .9.9 0 0 0 1.2-1.3 10.8 10.8 0 0 0-14.8 0 .9.9 0 0 0 1.2 1.3Z" />
                  </svg>
                  <div className="flex items-center">
                    <div className="w-5 h-2.5 rounded-[3px] border border-white/80 p-[1.5px] flex items-center">
                      <div className="w-full h-full bg-white rounded-[1px]" />
                    </div>
                    <div className="w-[1.5px] h-1 bg-white/80 rounded-r-sm ml-[1px]" />
                  </div>
                </div>
              </div>

              {/* App Viewport */}
              <div className="flex-1 min-h-0 relative overflow-hidden">{children}</div>

              {/* Simulator Bottom Home Indicator (Desktop Only) */}
              <div className="hidden md:flex shrink-0 items-center justify-center py-2 bg-[#06080D] z-40">
                <div className="w-28 h-1 rounded-full bg-white/75" />
              </div>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
