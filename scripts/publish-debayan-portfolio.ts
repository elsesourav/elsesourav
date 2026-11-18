import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFileSync, existsSync } from 'fs';
import { prisma } from '../packages/database/src/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = resolve(__dirname, '..');

// Simple .env loader
function loadEnvFile(envPath: string) {
  if (!existsSync(envPath)) return;
  const content = readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      let val = trimmed.slice(eqIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

loadEnvFile(resolve(rootDir, '.env'));
loadEnvFile(resolve(rootDir, 'apps/web/.env.local'));

async function main() {
  console.log('=== Step 1: Connecting Cloudinary Assets ===');

  const iconUrl = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/app-icon-512x512-1794987802554.webp';
  const coverLandscapeUrl = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/app-cover-landscape-16x9-1794987803948.webp';
  const coverMobileUrl = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/app-cover-mobile-3x4-1794987820169.webp';

  const screenshot01 = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/screen-01-academic-hero-profile-1794987824578.webp';
  const screenshot02 = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/screen-02-research-portfolio-grants-1794987862834.webp';
  const screenshot03 = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/screen-03-peer-reviewed-publications-1794987915370.webp';
  const screenshot04 = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/screen-04-honors-and-awards-1794987934168.webp';
  const screenshot05 = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/screen-05-workshops-and-keynotes-1794987950491.webp';
  const screenshot06 = 'https://res.cloudinary.com/diqw2sjl8/image/upload/q_auto,f_auto/elsesourav/apps/debayan-ganguly-portfolio/screen-06-academic-visual-identity-1794987993308.webp';

  const screenshots = [
    screenshot01,
    screenshot02,
    screenshot03,
    screenshot04,
    screenshot05,
    screenshot06,
  ];

  console.log('✓ All 9 Cloudinary media assets confirmed.');

  console.log('\n=== Step 2: Updating App Record in Database ===');

  const documentationMd = `## Overview

**Dr. Debayan Ganguly Portfolio & CMS** is a state-of-the-art, high-performance academic portfolio and administrative content management system engineered for **Dr. Debayan Ganguly**, Deputy Director OSD & Ex-officio at the Directorate of Technical Education, Higher Education Department, Government of West Bengal.

Holding a Ph.D. in Computer Science & Engineering from the University of Calcutta (with doctoral research conducted at the prestigious **Indian Statistical Institute, Kolkata**), Dr. Ganguly required an authoritative digital platform that balances academic rigor with frictionless administrative autonomy.

---

## Architectural Highlights

### 1. Bilingual Internationalization (EN / বাংলা)
- **Seamless Language Toggle**: Real-time language switching between English and Bengali across every page, research brief, and navigation bar.
- **Bi-directional Typography**: Specialized font pairing combining Google Fonts *Inter* and *Merriweather* for Latin script, alongside native Unicode Bengali typography.
- **Admin System Switch**: The administrative control panel allows instant toggle and fallback configuration for bilingual content.

### 2. Full Administrative CMS Engine
A secure, custom-built management portal empowering instant updates without redeploying code:
- **Academic Profile Manager**: Real-time bio, designations, affiliations, and 1:1 canvas-based photo cropper studio.
- **Research Projects & Grants**: Dynamic grant tracking, active funding agencies (ISI, CSIR, DST), and collaborative research domains.
- **Peer-Reviewed Publications**: Comprehensive library of journal articles, IEEE/ACM conference papers, DOI resolver links, and citation stats.
- **Academic Honors & Timeline**: Mathematically aligned vertical timeline showcasing awards, fellowships, and peer-review recognitions.
- **Workshops & FDP Keynotes**: Event manager for keynote addresses, faculty development seminars, and student participant feedback.
- **Standalone Custom Pages**: Markdown-driven custom page authoring (e.g. \`/page/teaching-philosophy\`, \`/page/lab-team\`).
- **Student & Researcher Inbox**: Direct messaging inbox with read tracking and inquiry filtering.

### 3. Precision LaTeX Mathematical Typesetting
- Integrated **KaTeX** math engine rendering complex quantum formulas, automata state transitions, and complexity theory equations at 60 FPS without layout shifts.
- Support for inline equations ($|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$) and standalone KaTeX proof blocks.

### 4. Zero Layout Shift Reactivity
- **Firebase Cloud Firestore**: Real-time data streams with optimistic UI updates.
- **Skeleton Shimmer Loaders**: Exact geometrical skeleton placeholders preventing cumulative layout shift (CLS: 0.00).
- **Glassmorphism Toast Stack**: Hardware-accelerated feedback notifications with smooth cubic-bezier physics.

---

## Technical Specifications

| Layer | Architecture & Technology |
| :--- | :--- |
| **Frontend Framework** | React 18 + Vite + TypeScript (Strict Type Safety) |
| **Styling & Theme** | Tailwind CSS (Academic Navy, Emerald, Gold & Slate Palette) |
| **Backend & Realtime** | Firebase Cloud Firestore + Firebase Authentication |
| **Hosting & Edge CDN** | Firebase Hosting (Multisite 301 Redirect Rules) |
| **Math Typesetting** | React Markdown + KaTeX LaTeX Parsing |
| **Asset Pipeline** | Cloudinary Responsive Media Delivery |

---

## Live Links & Resources

- **Production Deployment**: [debayanganguly.web.app](https://debayanganguly.web.app)
- **Source Code**: [github.com/elsesourav/debayan-ganguly-portfolio](https://github.com/elsesourav/debayan-ganguly-portfolio)
`;

  const webAppCat = await prisma.category.findUnique({ where: { slug: 'web-apps' } });
  const designCat = await prisma.category.findUnique({ where: { slug: 'design' } });
  const archCat = await prisma.category.findUnique({ where: { slug: 'architecture' } });

  const categoryIds = [webAppCat?.id, designCat?.id, archCat?.id].filter(Boolean) as string[];

  const updatedApp = await prisma.app.update({
    where: { slug: 'debayan-ganguly-portfolio' },
    data: {
      name: 'Dr. Debayan Ganguly Portfolio & CMS',
      shortDescription: 'Bilingual academic and research portfolio platform with custom CMS, Cloud Firestore, and LaTeX math typesetting.',
      description: 'An academic portfolio and administrative CMS engineered for Dr. Debayan Ganguly (Deputy Director OSD & Ex-officio, Higher Education Department, Govt. of West Bengal). Features seamless Bengali/English i18n, KaTeX mathematical proofs typesetting, real-time Cloud Firestore integration, and an administrative control panel.',
      iconUrl,
      featuredImageUrl: coverLandscapeUrl,
      featuredImageMobileUrl: coverMobileUrl,
      screenshots,
      documentationMd,
      status: 'PUBLISHED',
      isFeatured: true,
      isPinned: true,
      sortOrder: 1,
      seoTitle: 'Dr. Debayan Ganguly Portfolio & CMS — Bilingual Academic Platform',
      seoDescription: 'Explore the bilingual academic portfolio, research projects, publications, and administrative CMS built for Dr. Debayan Ganguly by ElseSourav.',
      categoryId: webAppCat?.id,
      categories: {
        deleteMany: {},
        create: categoryIds.map((cid) => ({ categoryId: cid })),
      },
    },
    include: {
      category: true,
      categories: { include: { category: true } },
    },
  });

  console.log('✓ Successfully updated App record:');
  console.log(`  Name: ${updatedApp.name}`);
  console.log(`  Icon: ${updatedApp.iconUrl}`);
  console.log(`  Cover: ${updatedApp.featuredImageUrl}`);
  console.log(`  Screenshots: ${updatedApp.screenshots.length} assets`);
  console.log(`  Categories: ${updatedApp.categories.map((c) => c.category.name).join(', ')}`);

  console.log('\n=== Step 3: Publishing Devlog Update Article in BlogPost ===');

  const postSlug = 'debayan-ganguly-portfolio-cms-architecture';

  const blogPostContent = `![Dr. Debayan Ganguly Portfolio & CMS Cover](${coverLandscapeUrl})

## Executive Summary & Background

We are excited to officially feature the **Dr. Debayan Ganguly Portfolio & CMS** platform across the **ElseSourav** engineering ecosystem. Built as a specialized client application, this platform serves as the public academic presence and administrative operations hub for **Dr. Debayan Ganguly**, Deputy Director OSD & Ex-officio at the Directorate of Technical Education, Higher Education Department, Government of West Bengal.

Prior to this engagement, academic portfolios for senior government education officials and computational researchers frequently suffered from rigid static designs, high maintenance barriers, and total inability to represent Indian regional languages natively alongside rigorous LaTeX scientific notation.

Our objective was clear: engineer an authoritative, responsive, bilingual web application coupled with a real-time headless CMS that empowers effortless administrative curation without sacrificing typographic grace or computational performance.

---

## Core Architectural Pillars

### 1. Bilingual Internationalization (EN / বাংলা)

A foundational requirement was full cultural and linguistic fidelity for the academic community in West Bengal and international research venues alike:

- **Instant Zero-Reload Switching**: Users can toggle between **English** and **বাংলা (Bengali)** with a single click. The language state synchronizes across local storage and reactive context.
- **Dual-Font System**: The layout dynamically pairs **Google Inter** and **Merriweather** for English typography with clean, anti-aliased Bengali rendering that respects diacritics and ligatures.
- **Admin Configuration**: The administrative portal features an overarching toggle allowing the site owner to enable or disable public Bengali translations globally or on a per-page basis.

![Dr. Debayan Ganguly Academic Profile Hero](${screenshot01})

---

### 2. Tailored Administrative Content Management System (CMS)

Rather than resorting to heavy, generic third-party CMS platforms, we engineered a dedicated administrative control center powered by **Firebase Cloud Firestore**:

- **Academic Profile Studio**: Update designations, contact coordinates, research interests, and biographical statements. Includes an in-browser HTML5 canvas image cropper maintaining precise 1:1 aspect ratios.
- **Research Initiatives & Grants**: Manage active and historical research domains (e.g., *Watson-Crick Quantum Finite Automata*, *Medical Image Analysis & Brain Segmentation*) with grant metadata, sponsoring bodies (CSIR, ISI, University of Calcutta), and project timelines.
- **Peer-Reviewed Publications Library**: Searchable index of international journal papers, IEEE/ACM conference proceedings, book chapters, and direct DOI resolvers.
- **Honors & Recognition Timeline**: Mathematically aligned vertical milestones documenting reviewer certifications (Elsevier, IEEE, Springer), honors, and fellowship appointments.
- **Workshops & Faculty Development Programs (FDP)**: Event management for keynote lectures, technical symposiums, and student engagement initiatives.
- **Custom Markdown Pages**: Dynamic routing engine allowing the creation of bespoke academic subpages (e.g., laboratory facilities, teaching philosophy, or student guidance).

![Research Projects & Grants Showcase](${screenshot02})

---

### 3. Scientific Formula Typesetting with KaTeX

Representing theoretical computer science, quantum finite automata, and discrete mathematics requires flawless mathematical formula notation. 

The platform integrates **KaTeX** directly within the Markdown rendering pipeline:
- High-speed formula compilation at 60 FPS without client layout shifts.
- Mathematical equations render inline (such as quantum state vectors $|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$) as well as complex multi-line mathematical proofs.

![Peer-Reviewed Publications and Proceedings](${screenshot03})

---

### 4. Zero Layout Shift & Glassmorphism Design System

- **Zero Cumulative Layout Shift (CLS: 0.00)**: Carefully calibrated geometric skeleton shimmer loaders (\`SkeletonLoader\`) mirror exact component boundaries during asynchronous Firestore data retrieval.
- **Glassmorphism Notification Deck**: Dynamic toast notifications utilize layered backdrop filters (\`backdrop-blur-md\`), specular ambient highlights, and Sonner-inspired stacking physics.
- **Government Academic Color Palette**: Deep Academic Navy (\`#0b1329\`), Imperial Gold (\`#f59e0b\`), Slate accents, and Emerald badges establish an authoritative yet modern aesthetic.

![Academic Achievements and Honors Timeline](${screenshot04})

---

## Technical Stack & Production Footprint

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + Vite | Lightning-fast HMR and optimized production bundles |
| **Language** | TypeScript 5.x | Strict type safety across all Firestore models |
| **Styling** | Tailwind CSS 3.x | Custom academic design system and responsive grid |
| **Database & Auth** | Firebase Cloud Firestore | Real-time reactive data sync and secure role-based access |
| **Hosting** | Firebase Hosting Edge | Global SSL CDN with custom domain multisite rewrites |
| **Math Engine** | KaTeX + React Markdown | High-performance LaTeX scientific formula typesetting |
| **Media Delivery** | Cloudinary CDN | Next-gen WebP image transformations and Retina scaling |

![Faculty Development Programmes and Keynotes](${screenshot05})

---

## Live Links & Verification

- **Live Platform**: [https://debayanganguly.web.app](https://debayanganguly.web.app)
- **GitHub Repository**: [https://github.com/elsesourav/debayan-ganguly-portfolio](https://github.com/elsesourav/debayan-ganguly-portfolio)
- **Catalog Entry**: [Dr. Debayan Ganguly Portfolio & CMS on ElseSourav](/apps/debayan-ganguly-portfolio)
`;

  // Upsert blog post with UPPERCASE enum status
  const blogPost = await prisma.blogPost.upsert({
    where: { slug: postSlug },
    create: {
      title: 'Dr. Debayan Ganguly Portfolio & CMS: Academic Architecture with Bilingual i18n, LaTeX Typesetting, and Firebase',
      slug: postSlug,
      excerpt: 'A deep dive into the architecture of Dr. Debayan Ganguly\'s academic portfolio and administrative CMS, featuring real-time Bengali/English internationalization, KaTeX proof rendering, and Cloud Firestore synchronization.',
      content: blogPostContent,
      coverImageUrl: coverLandscapeUrl,
      categoryId: webAppCat?.id,
      status: 'PUBLISHED',
      publishedAt: new Date(),
      authorName: 'Sourav Barui',
      authorRole: 'Founder & Full-Stack Architect',
      authorUrl: 'https://elsesourav.com',
      authorImageUrl: 'https://res.cloudinary.com/diqw2sjl8/image/upload/v1794570406/elsesourav/about/souravbarui_dark_1x1.webp',
      seoTitle: 'Dr. Debayan Ganguly Portfolio & CMS Architecture Overview',
      seoDescription: 'Technical case study and architectural breakdown of Dr. Debayan Ganguly\'s academic portfolio and CMS built with React 18, Tailwind CSS, KaTeX, and Firebase.',
      categories: {
        create: categoryIds.map((cid) => ({ categoryId: cid })),
      },
    },
    update: {
      title: 'Dr. Debayan Ganguly Portfolio & CMS: Academic Architecture with Bilingual i18n, LaTeX Typesetting, and Firebase',
      excerpt: 'A deep dive into the architecture of Dr. Debayan Ganguly\'s academic portfolio and administrative CMS, featuring real-time Bengali/English internationalization, KaTeX proof rendering, and Cloud Firestore synchronization.',
      content: blogPostContent,
      coverImageUrl: coverLandscapeUrl,
      categoryId: webAppCat?.id,
      status: 'PUBLISHED',
      authorName: 'Sourav Barui',
      authorRole: 'Founder & Full-Stack Architect',
      authorUrl: 'https://elsesourav.com',
      authorImageUrl: 'https://res.cloudinary.com/diqw2sjl8/image/upload/v1794570406/elsesourav/about/souravbarui_dark_1x1.webp',
      seoTitle: 'Dr. Debayan Ganguly Portfolio & CMS Architecture Overview',
      seoDescription: 'Technical case study and architectural breakdown of Dr. Debayan Ganguly\'s academic portfolio and CMS built with React 18, Tailwind CSS, KaTeX, and Firebase.',
      categories: {
        deleteMany: {},
        create: categoryIds.map((cid) => ({ categoryId: cid })),
      },
    },
    include: {
      category: true,
      categories: { include: { category: true } },
    },
  });

  console.log('\n✓ Successfully published Devlog Update Article:');
  console.log(`  ID: ${blogPost.id}`);
  console.log(`  Title: ${blogPost.title}`);
  console.log(`  Slug: ${blogPost.slug}`);
  console.log(`  Cover: ${blogPost.coverImageUrl}`);
  console.log(`  Categories: ${blogPost.categories.map((c) => c.category.name).join(', ')}`);
  console.log(`  Status: ${blogPost.status}`);
}

main()
  .catch((err) => {
    console.error('Execution failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
