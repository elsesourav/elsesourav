export const CREATOR_CONFIG = {
  name: 'Sourav',
  fullName: 'Sourav Barui',
  handle: 'elsesourav',

  identity: {
    title: 'Software Engineer & Creator',
    role: 'Independent Software Creator',
    location: 'Remote',
  },

  positioning:
    'Building thoughtful software, useful tools, and digital experiences with a focus on usability, performance, accessibility, and engineering quality.',

  shortBio:
    'Software engineer and independent creator building practical software, developer tools, and thoughtful web experiences.',

  longBio:
    'I’m Sourav, a software engineer and independent creator. ElseSourav is my personal space for building, sharing, and exploring software, tools, applications, and ideas. I care about creating useful experiences that are thoughtfully designed, accessible, performant, and built with strong engineering fundamentals.',

  focus: [
    'Software Engineering',
    'Web Applications',
    'Developer Tools',
    'Product Design',
    'Performance',
    'Accessible Interfaces',
  ],

  technologies: [
    'TypeScript',
    'React',
    'Next.js',
    'Node.js',
    'PostgreSQL',
    'Prisma',
    'Tailwind CSS',
  ],

  principles: [
    'Build for real users',
    'Design with purpose',
    'Keep interfaces accessible',
    'Prefer simplicity over unnecessary complexity',
    'Treat performance as part of the product',
    'Use technology as a tool, not the identity',
  ],

  links: {
    github: 'https://github.com/elsesourav',
    twitter: 'https://twitter.com/elsesourav',
  },

  contact: {
    email: 'contact@elsesourav.com',
    support: 'https://elsesourav.com/support',
  },
} as const;

export const SITE_CONFIG = {
  name: 'ElseSourav',

  tagline: 'Software, Tools & Ideas',

  description:
    'ElseSourav is the personal platform of Sourav, featuring software, applications, developer tools, technical writing, experiments, and ideas.',

  url: 'https://elsesourav.com',

  author: 'Sourav',

  creator: CREATOR_CONFIG,

  links: CREATOR_CONFIG.links,
} as const;
