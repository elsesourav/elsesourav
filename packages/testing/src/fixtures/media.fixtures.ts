import type { MediaAsset } from '@elsesourav/types';

export const fixtureMediaFolders: readonly string[] = ['users', 'apps', 'blog', 'help', 'general'];

export const fixtureMediaAssets: readonly MediaAsset[] = [
  {
    id: 'media-1',
    publicId: 'v2/icons/terminal-pro',
    secureUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/icons/terminal-pro.png',
    mediaType: 'app_icon',
    folder: 'apps',
    format: 'png',
    width: 512,
    height: 512,
    bytes: 48920,
    createdAt: 1704067200000,
  },
  {
    id: 'media-2',
    publicId: 'v2/banners/terminal-pro-hero',
    secureUrl:
      'https://res.cloudinary.com/elsesourav/image/upload/v2/banners/terminal-pro-hero.png',
    mediaType: 'app_screenshot',
    folder: 'apps',
    format: 'png',
    width: 1200,
    height: 630,
    bytes: 184520,
    createdAt: 1704067200000,
  },
  {
    id: 'media-3',
    publicId: 'v2/avatars/admin',
    secureUrl: 'https://res.cloudinary.com/elsesourav/image/upload/v2/avatars/admin.png',
    mediaType: 'avatar',
    folder: 'users',
    format: 'png',
    width: 256,
    height: 256,
    bytes: 24190,
    createdAt: 1704067200000,
  },
];
