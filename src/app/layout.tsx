import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Allmax Video Studio — Create Product Mockup Videos',
  description:
    'Easily create product mockup videos with Allmax Nutrition supplements for TikTok & Instagram.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F8FAFC] text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
