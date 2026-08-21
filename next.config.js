/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  // Disable in dev to avoid caching issues during development
  disable: process.env.NODE_ENV === 'development',
  // Use the existing offline page as fallback
  fallbacks: {
    document: '/offline',
  },
  // Cache strategies
  runtimeCaching: [
    // Google Fonts stylesheets — stale-while-revalidate
    {
      urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-stylesheets',
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    // Google Fonts files — cache first
    {
      urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'google-fonts-webfonts',
        expiration: { maxEntries: 20, maxAgeSeconds: 60 * 60 * 24 * 365 },
      },
    },
    // Static assets (JS, CSS, images) — cache first
    {
      urlPattern: /\.(?:js|css|woff|woff2|ttf|eot|png|jpg|jpeg|gif|webp|svg|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      },
    },
    // App pages — network-first, offline fallback
    {
      urlPattern: /^https?:\/\/.+\/((?!api\/).)*$/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'pages-cache',
        networkTimeoutSeconds: 10,
        expiration: { maxEntries: 50, maxAgeSeconds: 60 * 60 * 24 * 7 },
      },
    },
  ],
  // Skip waiting so new SW activates immediately
  skipWaiting: true,
  clientsClaim: true,
  // Register the SW automatically
  register: true,
  // Clean old caches
  cleanupOutdatedCaches: true,
  // Don't cache the SW itself or manifest
  buildExcludes: [/middleware-manifest\.json$/, /app-build-manifest\.json$/],
  // Public path for icons to be precached
  publicExcludes: ['!icons/**/*', '!favicon.ico'],
});

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,

  // Disable image optimization for PWA icons (serve from public/)
  images: {
    unoptimized: true,
  },

  // Custom headers for PWA reliability
  async headers() {
    return [
      {
        // Service worker must never be cached by the browser
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
      {
        // Manifest should be revalidated
        source: '/manifest.json',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Content-Type',
            value: 'application/manifest+json',
          },
        ],
      },
      {
        // Icons can be cached aggressively
        source: '/icons/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Favicon caching
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Security headers for all pages
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
