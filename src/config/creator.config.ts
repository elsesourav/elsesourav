export interface SocialLink {
  readonly id: string;
  readonly label: string;
  readonly platform: 'github' | 'twitter' | 'linkedin' | 'email';
  readonly url: string;
  readonly username: string;
}

export interface TechnologyCategory {
  readonly category: string;
  readonly items: readonly string[];
}

export interface PhilosophyPillar {
  readonly title: string;
  readonly description: string;
}

export interface BuildCategory {
  readonly title: string;
  readonly description: string;
  readonly iconName: 'globe' | 'puzzle' | 'wrench' | 'sparkles';
}

export interface CreatorProfile {
  readonly name: string;
  readonly handle: string;
  readonly initials: string;
  readonly role: string;
  readonly tagline: string;
  readonly bioParagraphs: readonly string[];
  readonly philosophy: readonly PhilosophyPillar[];
  readonly whatIBuild: readonly BuildCategory[];
  readonly techStack: readonly TechnologyCategory[];
  readonly currentFocus: readonly string[];
  readonly socialLinks: readonly SocialLink[];
  readonly contactEmail: string;
}

export const creatorConfig: CreatorProfile = {
  name: 'Sourav',
  handle: 'elsesourav',
  initials: 'S',
  role: 'Software Engineer & Independent Builder',
  tagline: 'Serious software, built by someone who cares.',
  bioParagraphs: [
    'I build fast, purposeful, and transparent web applications, browser extensions, and developer utilities. ElseSourav is my independent software lab where every tool is designed from the ground up to solve real problems reliably.',
    'I believe the best software is lean, visually refined, and respectful of the user’s time and privacy. No dark patterns, unnecessary tracking scripts, or artificial feature paywalls.',
  ],
  philosophy: [
    {
      title: 'Speed & Simplicity',
      description:
        'Software should load instantaneously and operate smoothly without unnecessary framework bloat or excessive client-side bundles.',
    },
    {
      title: 'Refined Craftsmanship',
      description:
        'Attention to detail in typography, keyboard accessibility, micro-interactions, and visual harmony makes daily tools a pleasure to use.',
    },
    {
      title: 'Privacy & Transparency',
      description:
        'User data belongs to the user. Applications prioritize local client computation and minimal telemetry without intrusive analytics.',
    },
  ],
  whatIBuild: [
    {
      title: 'Web Applications',
      description:
        'Modern, cloud-integrated applications built with React and TypeScript, designed for speed, resilience, and offline capability.',
      iconName: 'globe',
    },
    {
      title: 'Browser Extensions',
      description:
        'Lightweight Manifest V3 extensions for Chrome and Edge that enhance productivity directly inside your active browser workflow.',
      iconName: 'puzzle',
    },
    {
      title: 'Developer Tools',
      description:
        'Formatters, compilers, CLI utilities, and calculators that remove friction from everyday software engineering.',
      iconName: 'wrench',
    },
    {
      title: 'Digital Experiments',
      description:
        'Creative explorations in modern Web APIs, algorithms, fluid physics animations, and performant user interface design.',
      iconName: 'sparkles',
    },
  ],
  techStack: [
    {
      category: 'Frontend & UI',
      items: ['React 19', 'TypeScript', 'Vite', 'Modern CSS & Tokens', 'HTML5 Web APIs'],
    },
    {
      category: 'Cloud & Data',
      items: ['Firebase Auth', 'Cloud Firestore', 'Serverless Functions', 'REST APIs'],
    },
    {
      category: 'Platforms & Tooling',
      items: ['Chrome Extensions (MV3)', 'PWA / Offline', 'Vitest', 'ESLint', 'Git & CI/CD'],
    },
  ],
  currentFocus: [
    'Building reliable developer productivity tools with instantaneous local responsiveness.',
    'Designing keyboard-first web interfaces with refined glass aesthetics and accessibility.',
    'Expanding the ElseSourav open catalog with community-requested tools and extensions.',
  ],
  socialLinks: [
    {
      id: 'github',
      label: 'GitHub',
      platform: 'github',
      url: 'https://github.com/elsesourav',
      username: '@elsesourav',
    },
    {
      id: 'twitter',
      label: 'Twitter / X',
      platform: 'twitter',
      url: 'https://x.com/elsesourav',
      username: '@elsesourav',
    },
    {
      id: 'linkedin',
      label: 'LinkedIn',
      platform: 'linkedin',
      url: 'https://linkedin.com/in/elsesourav',
      username: 'Sourav',
    },
    {
      id: 'email',
      label: 'Email',
      platform: 'email',
      url: 'mailto:contact@elsesourav.com',
      username: 'contact@elsesourav.com',
    },
  ],
  contactEmail: 'contact@elsesourav.com',
};
