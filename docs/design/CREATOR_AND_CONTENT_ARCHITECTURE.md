# ElseSourav Creator Identity & Content Architecture

> **Authoritative Specification**: `@elsesourav/config/site.ts` & `apps/web/app/(public)/*`  
> **Mandate**: No invented personal facts. Authentic creator positioning, value-focused site copywriting, and structured domain metadata.

---

## 1. Creator Professional Identity

All creator identity details are centralized in `@elsesourav/config` (`CREATOR_CONFIG`):

```typescript
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
```

---

## 2. Content Separation & Taxonomy

To prevent data drift and circular configurations, content is divided into 4 strict tiers:

```
┌────────────────────────────────────────────────────────────────────────┐
│                      CONTENT LAYER ARCHITECTURE                        │
├─────────────────────┬────────────────────┬───────────────┬─────────────┤
│      IDENTITY       │    SITE CONTENT    │PRODUCT CONTENT│  METADATA   │
├─────────────────────┼────────────────────┼───────────────┼─────────────┤
│ • Name & Title      │ • Hero & Headlines │ • App Details │ • OpenGraph │
│ • Creator Bios      │ • About narrative  │ • Devlogs     │ • Schema.org│
│ • Social Channels   │ • Values & Pillars │ • Help Guides │ • Twitter   │
│ • Direct Contact    │ • Footer notices   │ • Changelogs  │ • Dynamic   │
│                     │                    │               │   Sitemaps  │
└─────────────────────┴────────────────────┴───────────────┴─────────────┘
```

---

## 3. Page-Specific Tone & Voice Guidelines

| Route / Context | Tone & Character | Content Focus | Negative Rule |
| :--- | :--- | :--- | :--- |
| **Homepage (`/`)** | Short, confident, value-focused | What tools exist, how they save developer time, featured tools & devlogs. | **Do NOT** make the homepage a framework tech-stack checklist. |
| **About (`/about`)** | Personal, professional depth | Creator background, engineering philosophy, long-term ecosystem vision. | Avoid corporate buzzwords or generic template biographies. |
| **Apps (`/apps`, `/apps/[slug]`)** | Product-focused, precise | Exact capabilities, supported platforms, live demos, version changelogs. | Avoid vague marketing adjectives ("revolutionary", "disruptive"). |
| **Blog (`/blog`, `/blog/[slug]`)** | Editorial, technical depth | Real system design, benchmarks, trade-offs, architecture decisions. | Do not publish low-value AI summaries or listicles. |
| **Help (`/help`, `/help/*`)** | Clear, task-oriented | Step-by-step resolution, exact commands, troubleshooting checklists. | Avoid storytelling; prioritize rapid scanning. |
| **Admin (`/admin/*`)** | Functional, operational | High-density tables, error logs, triage priority, transactional actions. | Zero decorative copy; strict operational clarity. |

---

## 4. Homepage Content Rule (Strict Governance)

The homepage must **never** be structured as a framework marketing showcase.

**Forbidden on Homepage Hero/Pillars**:
- "Built with Next.js 15"
- "Powered by PostgreSQL"
- "Zero-Trust RBAC Stack"
- "Server Components Architecture"
- "Production-Ready Fullstack SaaS"

**Approved Homepage Value Pillars**:
1. **Focused Software Craft**: Standalone utilities built for speed, privacy, and distraction-free developer workflows.
2. **Deep Engineering Notes**: Real benchmarks, architectural breakdowns, and systems engineering devlogs.
3. **Dedicated Knowledge & Support**: Clear documentation guides, task-oriented troubleshooting, and direct developer communication.

*Technical framework details belong in the Blog devlogs, about architecture sections, or repository READMEs—not as the primary customer-facing value proposition on the homepage.*

---

## 5. Verified Facts vs. Information Requiring Confirmation

### Verified Facts (Rooted in Source Code):
- **Creator Name**: Sourav
- **Brand & Platform**: ElseSourav
- **Core Software Artifacts**: Terminal Pro, Palette Studio, FocusFlow, DevDock, RegexLens
- **Published GitHub**: `https://github.com/elsesourav`
- **Published Twitter/X**: `https://twitter.com/elsesourav`

### Items Requiring Creator Confirmation:
1. **Official Contact Email**: Currently default is `contact@elsesourav.com`.
2. **Personal Location**: Currently set to `Global / Remote`.
3. **Extended Creator Journey**: Extended career history, past milestones, and formal education (deliberately omitted until authored by Sourav).
