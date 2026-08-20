import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Time Twist — Smart Clock & Time Tools',
  description: 'A beautiful, lightweight, feature-rich clock, world clock, stopwatch, countdown timer, Pomodoro, and alarm application. Works fully offline.',
  applicationName: 'Time Twist',
  authors: [{ name: 'Time Twist Team' }],
  keywords: ['clock', 'world clock', 'stopwatch', 'timer', 'alarm', 'pomodoro', 'pwa', 'time twist', 'offline', 'productivity'],
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],

  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Time Twist',
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
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'msapplication-TileColor': '#3b82f6',
    'msapplication-TileImage': '/icons/icon-144.png',
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
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased selection:bg-blue-500 selection:text-white pb-16 md:pb-0">
        {children}

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(registration) {
                      console.log('[PWA] Service Worker registered with scope:', registration.scope);
                      
                      // Check for updates every hour
                      setInterval(function() {
                        registration.update();
                      }, 60 * 60 * 1000);
                      
                      // Listen for new service worker waiting
                      if (registration.waiting) {
                        registration.waiting.postMessage('skipWaiting');
                      }
                      
                      registration.addEventListener('updatefound', function() {
                        var newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'activated') {
                              console.log('[PWA] New Service Worker activated');
                              // Reload to use new cache
                              window.location.reload();
                            }
                          });
                        }
                      });
                    })
                    .catch(function(err) {
                      console.warn('[PWA] Service Worker registration failed:', err);
                    });
                });
              }

              // Handle install prompt
              var deferredPrompt = null;
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                deferredPrompt = e;
                window.__pwaInstallPrompt = e;
                console.log('[PWA] Install prompt available');
              });

              window.addEventListener('appinstalled', function() {
                console.log('[PWA] App installed successfully');
                deferredPrompt = null;
                window.__pwaInstallPrompt = null;
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
