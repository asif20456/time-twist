import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Time Twist — Smart Clock & Time Tools',
  description: 'A beautiful, lightweight, feature-rich clock, world clock, stopwatch, countdown timer, Pomodoro, and alarm application. Works fully offline.',
  applicationName: 'Time Twist',
  authors: [{ name: 'Time Twist Team' }],
  keywords: ['clock', 'world clock', 'stopwatch', 'timer', 'alarm', 'pomodoro', 'time twist', 'offline', 'productivity'],
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    title: 'Time Twist — Smart Clock & Time Tools',
    description: 'Beautiful, lightweight, feature-rich clock and time management app. Works fully offline.',
    siteName: 'Time Twist',
    type: 'website',
    images: ['/icons/icon-512.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Time Twist — Smart Clock & Time Tools',
    description: 'Beautiful, lightweight, feature-rich clock and time management app.',
    images: ['/icons/icon-512.png'],
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'theme-color': '#3b82f6',
  },
};

export const viewport: Viewport = {
  themeColor: '#3b82f6',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        {/* Preconnect to Google Fonts for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Favicon */}
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-touch-icon.png" />

        {/* Service Worker Registration — production only */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator && location.protocol === 'https:') {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />

        {/* Anti-FOUC theme script */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('time-twist-theme') || 'dark';
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  } else {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  }
                  var accent = localStorage.getItem('time-twist-accent') || 'ocean';
                  var accents = ['emerald', 'sunset', 'royal', 'rose', 'cyan'];
                  accents.forEach(function(a) { document.documentElement.classList.remove('accent-' + a); });
                  if (accent !== 'ocean' && accents.indexOf(accent) !== -1) {
                    document.documentElement.classList.add('accent-' + accent);
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-blue-500 selection:text-white pb-16 md:pb-0">
        {children}

      </body>
    </html>
  );
}
