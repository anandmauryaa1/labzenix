import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ============================================================================


  // ============================================================================
  // PERFORMANCE & OPTIMIZATION
  // ============================================================================
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    // Cache optimized images for 1 year (immutable)
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  // ============================================================================
  // SECURITY HEADERS
  // ============================================================================
  
  async headers() {
    // Build the Content-Security-Policy directives
    const ContentSecurityPolicy = [
      `default-src 'self'`,
      // Next.js requires unsafe-inline + unsafe-eval; Tawk.to loads from embed.tawk.to
      `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://embed.tawk.to https://*.tawk.to https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com`,
      `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.tawk.to`,
      // Cloudinary images + Tawk.to agent avatars
      `img-src 'self' data: blob: https://res.cloudinary.com https://images.pexels.com https://images.unsplash.com https://*.tawk.to https://www.googletagmanager.com`,
      `font-src 'self' https://fonts.gstatic.com https://*.tawk.to`,
      // Tawk.to uses wss:// WebSocket for real-time chat
      `connect-src 'self' https://*.tawk.to wss://*.tawk.to https://www.google-analytics.com https://stats.g.doubleclick.net`,
      `media-src 'self' https://res.cloudinary.com https://*.tawk.to`,
      // Tawk.to widget renders inside an iframe — must allow it
      `frame-src 'self' https://tawk.to https://*.tawk.to`,
      // Prevent THIS site from being embedded inside other sites (anti-clickjacking)
      // Note: 'none' here means no external site can embed us — Tawk.to embeds itself, not us
      `frame-ancestors 'self'`,
      `form-action 'self'`,
      `object-src 'none'`,
      `upgrade-insecure-requests`,
    ].join('; ');

    return [
      {
        source: '/:path*',
        headers: [
          // ── Core Security Headers ──────────────────────────────────
          {
            key: 'Content-Security-Policy',
            value: ContentSecurityPolicy,
          },
          {
            // Force HTTPS for 1 year (preload-ready)
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          {
            // Prevents MIME type sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // Blocks site from being embedded in iframes on other origins
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            // Legacy XSS filter (still needed for old browsers)
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // Controls referrer info sent with requests
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // Restricts browser features / sensor access
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), gyroscope=(), speaker=()',
          },
          // ── Cross-Origin Policies ──────────────────────────────────
          {
            // Prevents cross-origin info leakage via SharedArrayBuffer, etc.
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            // Prevents cross-origin window references
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
          {
            // Controls how resources can be shared cross-origin
            key: 'Cross-Origin-Resource-Policy',
            value: 'cross-origin',
          },
          // ── Cache / Info Leakage Prevention ───────────────────────
          {
            // Hides server technology info
            key: 'X-Powered-By',
            value: '',
          },
          {
            // Prevents caching of sensitive pages on shared caches
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
        ],
      },
      // Static assets can be cached aggressively — override Cache-Control
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ============================================================================
  // CONTENT SECURITY POLICY (API routes can override if needed)
  // ============================================================================
  
  async redirects() {
    return [
      // Redirect http to https in production - Disabled for IP testing
      /*
      {
        source: '/:path*',
        destination: 'https://app.labzenix.com/:path*',
        permanent: true,
        has: [
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
      },
      */
    ];
  },

  // ============================================================================
  // COMPRESSION & BUILD OPTIMIZATION
  // ============================================================================
  
  compress: true,
  
  // Generate static manifests for PWA capability
  generateEtags: true,

  // ============================================================================
  // DEVELOPMENT & BUILD OPTIONS
  // ============================================================================
  
  // Properly handle experimental features
  experimental: {
    // Enable optimizations
    optimizeServerReact: true,
    serverActions: {
      allowedOrigins: ['82.25.105.115', 'localhost:3000'],
    },
  },

  // Production source maps for better error tracking (disable for smaller bundle)
  productionBrowserSourceMaps: false,

  // Strict React mode in development
  reactStrictMode: true,

  // ============================================================================
  // ENVIRONMENT VALIDATION
  // ============================================================================
  
  env: {
    // These are only available on the server if not prefixed with NEXT_PUBLIC_
    // This helps prevent accidental exposure of sensitive variables
  },

  // ============================================================================
  // TYPESCRIPT
  // ============================================================================
  
  typescript: {
    // Fail build on TypeScript errors
    tsconfigPath: './tsconfig.json',
  },
};

export default nextConfig;

// Ensure this is treated as a module
export {};