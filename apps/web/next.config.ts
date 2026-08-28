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
};

export default nextConfig;
