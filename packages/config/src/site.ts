export const CREATOR_CONFIG = {
  name: 'Sourav',
  handle: 'elsesourav',
  title: 'Systems Engineer & Software Creator',
  role: 'Creator & Software Architect',
  location: 'Global / Remote',
  positioning:
    'Crafting high-performance developer tools, terminal environments, and accessible web software.',
  shortBio:
    'Full-stack software engineer and open-source creator focused on precision tooling, low-latency architecture, and elegant developer workflows.',
  longBio:
    'Sourav is a systems and frontend software engineer passionate about developer ergonomics, modern browser capabilities, terminal multiplexing, and robust distributed web applications. ElseSourav serves as his central lab and archive for production-ready software tools.',
  skills: [
    'TypeScript',
    'React 19',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'Prisma ORM',
    'WebGL / Terminal Emulation',
    'Tailwind CSS',
    'Distributed Systems',
  ],
  links: {
    github: 'https://github.com/elsesourav',
    twitter: 'https://twitter.com/elsesourav',
  },
  contact: {
    email: 'contact@elsesourav.com',
    supportUrl: 'https://elsesourav.com/support',
  },
} as const;

export const SITE_CONFIG = {
  name: 'ElseSourav',
  tagline: 'Developer Tools & Engineering Logs',
  description:
    'High-performance developer tools, terminal environments, native applications, and engineering logs by Sourav.',
  author: 'Sourav',
  url: 'https://elsesourav.com',
  creator: CREATOR_CONFIG,
  links: {
    github: 'https://github.com/elsesourav',
    twitter: 'https://twitter.com/elsesourav',
  },
} as const;
