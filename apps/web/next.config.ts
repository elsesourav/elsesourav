import type { NextConfig } from 'next';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', 'pg', '@prisma/adapter-pg'],
  transpilePackages: [
    '@elsesourav/ui',
    '@elsesourav/types',
    '@elsesourav/validation',
    '@elsesourav/utils',
    '@elsesourav/config',
    '@elsesourav/auth',
    '@elsesourav/media',
    '@elsesourav/database',
  ],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value:
              "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https://res.cloudinary.com https://images.unsplash.com https://*.supabase.co; font-src 'self' data: https://fonts.gstatic.com; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.cloudinary.com; frame-ancestors 'none'; form-action 'self'; base-uri 'self';",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/posts',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/posts/:slug*',
        destination: '/blog/:slug*',
        permanent: true,
      },
      {
        source: '/work',
        destination: '/apps',
        permanent: true,
      },
      {
        source: '/work/:slug*',
        destination: '/apps/:slug*',
        permanent: true,
      },
      {
        source: '/lab',
        destination: '/apps',
        permanent: true,
      },
      {
        source: '/lab/:slug*',
        destination: '/apps/:slug*',
        permanent: true,
      },
      {
        source: '/docs',
        destination: '/help',
        permanent: true,
      },
      {
        source: '/docs/:slug*',
        destination: '/help/:slug*',
        permanent: true,
      },
      {
        source: '/doc',
        destination: '/help',
        permanent: true,
      },
      {
        source: '/doc/:slug*',
        destination: '/help/:slug*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
