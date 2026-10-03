import type { Metadata, Viewport } from 'next';
import { Cairo } from 'next/font/google';
import './globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  display: 'swap',
  variable: '--font-cairo',
});

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export const metadata: Metadata = {
  title: 'عدسة الأنشطة الطلابية | توثيق الفعاليات المدرسية والجامعية',
  description: 'تطبيق سريع وبسيط لرفع وتوثيق صور وفيديوهات الأنشطة والبرامج الطلابية مباشرة من كاميرا الجوال على أجهزة أندرويد وآيفون.',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'عدسة الأنشطة',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/apple-touch-icon.png',
  },
  openGraph: {
    title: 'عدسة الأنشطة الطلابية | توثيق الفعاليات',
    description: 'تطبيق سريع لرفع وتوثيق صور وفيديوهات الأنشطة والبرامج الطلابية بالجوال على أندرويد وآيفون.',
    type: 'website',
    locale: 'ar_SA',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'عدسة الأنشطة الطلابية',
    description: 'تطبيق رفع وتوثيق صور وفيديوهات الأنشطة الطلابية بالجوال على أندرويد وآيفون.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full antialiased selection:bg-blue-600 selection:text-white`}>
      <body className="h-full bg-slate-950 text-slate-100 font-sans overflow-x-hidden" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
