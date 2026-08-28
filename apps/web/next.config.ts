import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
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
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
