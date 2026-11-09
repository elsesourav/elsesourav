export interface AvatarPreset {
  id: string;
  name: string;
  url: string;
  category: 'portrait' | 'stylized';
}

export const DEFAULT_AVATAR_PRESETS: readonly AvatarPreset[] = [
  {
    id: 'sourav-dark',
    name: 'Sourav Dark Portrait',
    url: '/about/souravbarui-dark-512.webp',
    category: 'portrait',
  },
  {
    id: 'sourav-light',
    name: 'Sourav Light Portrait',
    url: '/about/souravbarui-light-512.webp',
    category: 'portrait',
  },
  {
    id: 'cosmic',
    name: 'Cosmic Indigo',
    url: '/avatars/avatar-1.svg',
    category: 'stylized',
  },
  {
    id: 'emerald',
    name: 'Terminal Emerald',
    url: '/avatars/avatar-2.svg',
    category: 'stylized',
  },
  {
    id: 'amber',
    name: 'Solar Amber',
    url: '/avatars/avatar-3.svg',
    category: 'stylized',
  },
  {
    id: 'cyan',
    name: 'Systems Cyan',
    url: '/avatars/avatar-4.svg',
    category: 'stylized',
  },
  {
    id: 'rose',
    name: 'Visual Rose',
    url: '/avatars/avatar-5.svg',
    category: 'stylized',
  },
  {
    id: 'violet',
    name: 'Neural Violet',
    url: '/avatars/avatar-6.svg',
    category: 'stylized',
  },
] as const;
