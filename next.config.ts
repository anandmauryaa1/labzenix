import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ============================================================================
  // SERVER ACTIONS & SECURITY
  // ============================================================================
  serverActions: {
    allowedOrigins: ['82.25.105.115', 'localhost:3000'],
  },

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
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      // Cache static assets
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