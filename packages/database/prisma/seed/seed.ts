import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../../');

dotenv.config({ path: path.join(rootDir, '.env.local') });
dotenv.config({ path: path.join(rootDir, '.env') });

import { CREATOR_CONFIG, SITE_CONFIG } from '@elsesourav/config';
import { PublishStatus, UserRole, prisma } from '../../src/index';

async function main() {
  console.info('🌱 Seeding ElseSourav Database with canonical portfolio records...');

  // ===========================================================================
  // 1. SEED CANONICAL ADMIN USER
  // ===========================================================================
  console.info('  → Seeding Canonical Admin User...');

  const adminUser = await prisma.user.upsert({
    where: { email: 'elsesourav.auth@gmail.com' },
    update: {
      role: UserRole.ADMIN,
      displayName: 'Sourav',
      username: 'elsesourav',
      bio: CREATOR_CONFIG.shortBio,
    },
    create: {
      supabaseAuthId: '00000000-0000-0000-0000-000000000001',
      email: 'elsesourav.auth@gmail.com',
      displayName: 'Sourav',
      username: 'elsesourav',
      bio: CREATOR_CONFIG.shortBio,
      role: UserRole.ADMIN,
      preferences: { theme: 'dark', emailNotifications: true, reducedMotion: false },
    },
  });

  // ===========================================================================
  // 2. SEED APP CATEGORIES
  // ===========================================================================
  console.info('  → Seeding App Categories...');

  const categories = [
    {
      name: 'AI & Machine Learning',
      slug: 'ai-ml',
      description: 'Neural networks, multi-model AI assistants, computer vision, and on-device machine intelligence.',
      icon: 'Sparkles',
      orderIndex: 0,
    },
    {
      name: 'Automation & E-Commerce',
      slug: 'automation',
      description: 'Marketplace seller automation, SKU mapping, batch data pipelines, and workflow optimizations.',
      icon: 'Cpu',
      orderIndex: 1,
    },
    {
      name: 'Web Applications & CMS',
      slug: 'web-apps',
      description: 'Production web platforms, custom content management systems, and specialized client platforms.',
      icon: 'Globe',
      orderIndex: 2,
    },
    {
      name: 'Algorithms & Simulations',
      slug: 'simulations',
      description: 'Cellular automata, physics solvers, constraint satisfaction, and interactive canvas graphics.',
      icon: 'Layers',
      orderIndex: 3,
    },
    {
      name: 'Hardware & Embedded IoT',
      slug: 'hardware-iot',
      description: 'Microcontroller firmware, real-time video streaming, robotics control, and sensor telemetry.',
      icon: 'Radio',
      orderIndex: 4,
    },
    {
      name: 'Media & Design Tools',
      slug: 'media-design',
      description: 'Layer-based photo editors, canvas tools, SVG pipelines, and creative utilities.',
      icon: 'Palette',
      orderIndex: 5,
    },
    {
      name: 'Developer Utilities & Mobile',
      slug: 'utilities',
      description: 'Client-side PDF processors, invoice makers, mobile apps, and privacy-first helpers.',
      icon: 'Wrench',
      orderIndex: 6,
    },
  ];

  const catMap: Record<string, string> = {};
  for (const cat of categories) {
    const created = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, description: cat.description, icon: cat.icon, orderIndex: cat.orderIndex },
      create: cat,
    });
    catMap[cat.slug] = created.id;
  }

  // ===========================================================================
  // 3. SEED TAGS
  // ===========================================================================
  console.info('  → Seeding Tags...');

  const tagsList = [
    { name: 'AI', slug: 'ai' },
    { name: 'WebAssembly', slug: 'webassembly' },
    { name: 'Chrome Extension', slug: 'chrome-extension' },
    { name: 'TypeScript', slug: 'typescript' },
    { name: 'React 19', slug: 'react' },
    { name: 'React Native', slug: 'react-native' },
    { name: 'Expo', slug: 'expo' },
    { name: 'C++', slug: 'cpp' },
    { name: 'Embedded', slug: 'embedded' },
    { name: 'IoT', slug: 'iot' },
    { name: 'Firebase', slug: 'firebase' },
    { name: 'Supabase', slug: 'supabase' },
    { name: 'Canvas', slug: 'canvas' },
    { name: 'Algorithms', slug: 'algorithms' },
    { name: 'PDF Tools', slug: 'pdf-tools' },
    { name: 'Tailwind CSS', slug: 'tailwindcss' },
    { name: 'Open Source', slug: 'open-source' },
    { name: 'Game Dev', slug: 'game-dev' },
  ];

  const tagMap: Record<string, string> = {};
  for (const tag of tagsList) {
    const created = await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name },
      create: tag,
    });
    tagMap[tag.slug] = created.id;
  }

  // ===========================================================================
  // 4. CANONICAL PORTFOLIO PROJECTS
  // ===========================================================================
  console.info('  → Seeding Canonical Portfolio Projects across 4 Tiers...');

  const appsData = [
    // -------------------------------------------------------------------------
    // TIER A: FEATURED (3 Projects)
    // -------------------------------------------------------------------------
    {
      name: 'SpectraLens AI',
      slug: 'spectralens-ai',
      shortDescription: 'Multi-engine parallel AI browser assistant, visual DOM element scanner, and on-device WASM OCR.',
      description:
        'A Manifest V3 Chrome extension enabling simultaneous multi-model AI querying across active web sessions with zero API token costs, point-and-click DOM inspection, and offline WebAssembly OCR.',
      documentationMd: `## Overview

**SpectraLens AI** is a browser companion built on Manifest V3. It allows researchers and developers to query multiple AI models simultaneously through their active web sessions, compare responses side-by-side, and extract structured page data without subscription token costs.

## What It Does

- **Simultaneous Multi-Model Querying**: Dispatch prompts across multiple AI engines in parallel without tab switching.
- **Visual Element Scanner**: Point-and-click DOM inspector that formats tables, code snippets, and text into Markdown.
- **On-Device Screen OCR**: Crop screen areas and extract text using bundled Tesseract.js WebAssembly.
- **Zero API Costs**: Connects directly via signed-in browser sessions.
- **Privacy First**: 100% on-device operation with zero telemetry.

## Technical Architecture

- **Extension Framework**: Chrome Manifest V3 with event-driven background service worker.
- **WASM Engine**: Client-side Tesseract.js compiled for local optical character recognition.
- **Content Bridge**: Isolated context script for non-intrusive DOM inspection and element highlights.`,
      iconUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/spectralens-ai',
      categoryId: catMap['ai-ml']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      currentVersion: '1.0.0',
      publishedAt: new Date('2026-08-26T12:00:00Z'),
      tags: ['ai', 'chrome-extension', 'webassembly', 'typescript', 'open-source'],
    },
    {
      name: 'ES Automation',
      slug: 'es-automation',
      shortDescription: 'Multi-seller marketplace automation platform for product mapping, bulk catalog generation, and SKU management.',
      description:
        'A Chrome extension and operational platform built for Flipkart and Shopsy sellers to automate catalog operations, sync internal SKU codes, process bulk inventory, and eliminate manual order workflows.',
      documentationMd: `## Overview

**ES Automation** is an operational platform and browser extension engineered for high-volume marketplace sellers. It automates repetitive catalog operations, SKU mapping, and cross-platform listing transfers.

## What It Does

- **SKU Mapping Engine**: Audit, bulk import, and reconcile \`old_sku -> new_sku\` relationships with conflict detection.
- **Catalog Generator**: Automated XLSX catalog export with customizable schema transformations.
- **Cross-Marketplace Sync**: One-click listing porting from Flipkart to Shopsy marketplace formats.
- **Order & Inventory Tracking**: Direct integration with Supabase PostgreSQL backend.

## Implementation Details

- Built using **React 19**, **TypeScript**, and **Tailwind CSS**.
- Employs Web Workers for in-memory parsing of multi-thousand-row spreadsheet files without freezing the browser UI.`,
      iconUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/es-automation',
      categoryId: catMap['automation']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      currentVersion: '2.4.6',
      publishedAt: new Date('2026-08-25T14:00:00Z'),
      tags: ['automation', 'react', 'typescript', 'supabase'],
    },
    {
      name: 'Dr. Debayan Ganguly Portfolio & CMS',
      slug: 'debayan-ganguly-portfolio',
      shortDescription: 'Bilingual academic and research portfolio platform with custom CMS and LaTeX math typesetting.',
      description:
        'An academic portfolio and administrative CMS built for Dr. Debayan Ganguly (Deputy Director OSD & Ex-officio, Govt of West Bengal), featuring Bengali/English i18n, KaTeX math rendering, and Cloud Firestore.',
      documentationMd: `## Overview

An academic and research portfolio website engineered for **Dr. Debayan Ganguly**, Deputy Director OSD & Ex-officio at the Directorate of Technical Education, Government of West Bengal.

## What It Does

- **Bilingual i18n**: Real-time seamless toggle between English and Bengali (বাংলা).
- **Custom Admin CMS**: Full administrative management for research grants, publications, honors, and workshops.
- **LaTeX Math Rendering**: KaTeX integration for mathematical proofs and formula typesetting.
- **Cloud Firestore**: Real-time reactive data store with zero layout shift skeleton loading.

## Live Deployment

- Available at: [debayanganguly.web.app](https://debayanganguly.web.app)`,
      iconUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&q=80',
      demoUrl: 'https://debayanganguly.web.app',
      githubUrl: 'https://github.com/elsesourav/debayan-ganguly-portfolio',
      categoryId: catMap['web-apps']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: true,
      currentVersion: '1.0.0',
      publishedAt: new Date('2026-08-14T09:00:00Z'),
      tags: ['react', 'typescript', 'firebase', 'tailwindcss'],
    },

    // -------------------------------------------------------------------------
    // TIER B: SELECTED WORK (8 Projects)
    // -------------------------------------------------------------------------
    {
      name: 'Breakout Ball',
      slug: 'breakout-ball',
      shortDescription: 'WebAssembly and C++ arcade game with AABB collision physics, custom level builder, and gyroscope controls.',
      description:
        'An arcade brick-breaking game built with C++ compiled to WebAssembly, featuring high frame-rate physics, in-game level editor, gyroscope tilt controls, and Firebase ranking.',
      documentationMd: `## Overview

**Breakout Ball** combines classic arcade brick-breaking gameplay with modern WebAssembly performance, custom level creation tools, and mobile sensor input.

## What It Does

- **High-Performance Physics**: Game loop and collision resolution execute in compiled C++ WebAssembly.
- **Custom Level Editor**: Design custom brick patterns and save them publicly or privately to Firebase.
- **Multi-Input Controls**: Supports touch swipe, keyboard/mouse, and mobile device gyroscope tilt controls.
- **Global Leaderboards**: Tracks completion times and high scores per level.

## Technical Notes

- Compiles C++ logic to WebAssembly via Emscripten.
- Uses Axis-Aligned Bounding Box (AABB) collision algorithms for accurate block rebounds at 60 FPS.`,
      iconUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1200&q=80',
      demoUrl: 'https://elsesourav.github.io/breakout-ball',
      githubUrl: 'https://github.com/elsesourav/breakout-ball',
      categoryId: catMap['simulations']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2024-07-13T14:00:00Z'),
      tags: ['cpp', 'webassembly', 'game-dev', 'canvas', 'firebase', 'open-source'],
    },
    {
      name: 'Meal Tracker Mobile',
      slug: 'meal-tracker',
      shortDescription: 'React Native & Expo mobile application with smart reminder notifications, offline storage, and calendar views.',
      description:
        'A cross-platform mobile application for tracking daily dietary consumption with intelligent notification scheduling, intentional meal skipping states, and offline JSON data portability.',
      documentationMd: `## Overview

**Meal Tracker** is a mobile application built with React Native and Expo designed for tracking daily meals, managing dietary routines, and scheduling non-intrusive meal reminders.

## What It Does

- **Daily Meal Logging**: Record daytime, evening, and extra meal items with a clean touch interface.
- **Smart "OFF" State**: Flag deliberate fasting or skipped meals, automatically pausing scheduled notifications.
- **Local-First Storage**: Operates entirely offline using AsyncStorage with JSON backup and export.
- **Background Notifications**: Uses Expo Notifications for scheduled reminder alerts.

## Architecture

- Built using **React Native**, **Expo Router**, **TypeScript**, and **NativeWind**.
- Configured with automated EAS Cloud and native Gradle build pipelines.`,
      iconUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/meal-tracker',
      categoryId: catMap['utilities']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2025-05-18T10:00:00Z'),
      tags: ['react-native', 'expo', 'typescript', 'open-source'],
    },
    {
      name: 'Neural Network Number Recognition',
      slug: 'nn-number-rec',
      shortDescription: 'Handwritten digit recognition neural network built from scratch in C++ and compiled to WebAssembly.',
      description:
        'A machine learning demonstration featuring a custom matrix math and backpropagation engine written in C++, compiled with Emscripten SIMD optimizations, with live drawing and neural layer visualization.',
      documentationMd: `## Overview

This project implements a Feedforward Neural Network with Backpropagation from scratch in **C++**, compiled to **WebAssembly** via Emscripten.

## What It Does

- **Near-Native Performance**: Core training matrix computations execute in WebAssembly with \`-msimd128\` vector instructions.
- **Live Canvas Drawing**: Draw digits (0–9) and inspect real-time classification probabilities.
- **Layer & Weight Visualization**: Interactive visualizer showing activations across input, hidden, and output neuron layers.`,
      iconUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
      demoUrl: 'https://elsesourav.github.io/nn-number-rec',
      githubUrl: 'https://github.com/elsesourav/nn-number-rec',
      categoryId: catMap['ai-ml']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2025-11-29T10:00:00Z'),
      tags: ['cpp', 'webassembly', 'ai', 'canvas', 'open-source'],
    },
    {
      name: 'ESP32-CAM WiFi RC Vehicle',
      slug: 'esp32-cam-with-car-control',
      shortDescription: 'Single-board WiFi vehicle control system with real-time MJPEG streaming and MPU6050 telemetry.',
      description:
        'A standalone microcontroller robotics project eliminating secondary Arduino Uno hardware. Serves an embedded web controller and drives an L298N motor controller using a 4-pin PWM technique.',
      documentationMd: `## Overview

A standalone WiFi car control system where the **ESP32-CAM** functions as the complete brain: handling video streaming, WebSocket server, direct PWM motor drive, and I2C sensor telemetry.

## Technical Highlights

- **4-Pin PWM Trick**: Applies PWM directly to L298N directional inputs, preserving GPIO pins for camera operations.
- **Real-Time Video**: Streams live MJPEG camera feed directly to connected web clients.
- **Embedded Web Server**: All HTML and JavaScript controller assets are compiled into microcontroller Flash memory.
- **MPU6050 Telemetry**: Live accelerometer and tilt display in the mobile touch controller.`,
      iconUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/esp32-cam-with-car-control',
      categoryId: catMap['hardware-iot']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2026-06-22T08:00:00Z'),
      tags: ['cpp', 'embedded', 'iot', 'open-source'],
    },
    {
      name: 'ES GST Return',
      slug: 'gst-return',
      shortDescription: 'Web application for marketplace sales report parsing and GST return discrepancy reconciliation.',
      description:
        'A web application for parsing multi-channel marketplace reports (Flipkart, Amazon), validating GST tax liabilities, diffing mismatch records, and rendering interactive sales analytics.',
      documentationMd: `## Overview

A specialized financial reconciliation tool designed to parse marketplace sales reports, detect GST calculation discrepancies, and produce verified return summaries.

## Features

- **Multi-Format Excel Parser**: Drag-and-drop parsing for diverse marketplace spreadsheet layouts.
- **Discrepancy Diff Engine**: Side-by-side comparison highlighting missing invoices and tax mismatches.
- **Interactive Analytics**: State-wise GST breakdown and sales trend visualizations using Recharts.`,
      iconUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/gst-return',
      categoryId: catMap['web-apps']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2026-05-10T11:00:00Z'),
      tags: ['react', 'typescript', 'tailwindcss', 'firebase'],
    },
    {
      name: 'Img Editor',
      slug: 'img-editor',
      shortDescription: 'Modular, layer-based browser image and graphics editor with non-destructive adjustments.',
      description:
        'A modular web graphic editor featuring layer hierarchy, pan/zoom canvas, crop and rotate tools, filter pipelines, undo/redo history manager, and JSON template workflows.',
      documentationMd: `## Overview

A modular browser photo and graphics editor built using vanilla JavaScript modules and HTML5 Canvas.

## Features

- **Layer Graph**: Parent/child layer management with drag reordering.
- **Transform Tools**: Precise pan, zoom, snap guides, crop, and rotation workflows.
- **History Pipeline**: Robust undo/redo state manager tracking discrete user actions.
- **Template System**: Import and export editor project states as JSON files.`,
      iconUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=1200&q=80',
      demoUrl: 'https://elsesourav.github.io/img-editor',
      githubUrl: 'https://github.com/elsesourav/img-editor',
      categoryId: catMap['media-design']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2026-03-28T16:00:00Z'),
      tags: ['canvas', 'algorithms', 'open-source'],
    },
    {
      name: 'Seller PDF Cropper',
      slug: 'seller-pdf-cropper',
      shortDescription: 'Client-side shipping label and invoice PDF cropper with dynamic text measurement.',
      description:
        'A client-side privacy-first utility for cropping multi-page marketplace shipping labels, adding sequential numbering, and rendering print-ready PDFs without uploading data to servers.',
      documentationMd: `## Overview

Processes multi-page shipping PDFs directly in the browser using \`pdf-lib\` and \`pdfjs-dist\`.

## Features

- **Label Dimension Cropping**: Automatically isolates shipping labels from invoice sheets.
- **Sequential Numbering**: Dynamic canvas font measurement for numbering packages.
- **Zero Server Uploads**: Full confidentiality for customer and order data.`,
      iconUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/seller-pdf-cropper',
      categoryId: catMap['utilities']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2025-04-04T12:00:00Z'),
      tags: ['pdf-tools', 'typescript', 'open-source'],
    },
    {
      name: 'Professional Invoice Maker',
      slug: 'professional-invoice-maker',
      shortDescription: 'Print-ready invoice generation web utility with automatic GST calculations and custom branding.',
      description:
        'A responsive React 19 web utility for generating clean A4 invoice documents with automatic itemized tax breakdown, company branding, and client-side print formatting.',
      documentationMd: `## Overview

A responsive web utility for generating clean, print-optimized A4 invoices.

## Features

- **Clean A4 Layout**: Print-optimized stylesheet for crisp paper and PDF exports.
- **Automatic Tax Calculations**: Handles Indian GST rate breakdowns seamlessly.
- **Custom Branding**: Company logo, header, and signature customization.`,
      iconUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/professional-invoice-maker',
      categoryId: catMap['utilities']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2025-08-25T15:00:00Z'),
      tags: ['react', 'tailwindcss', 'typescript'],
    },

    // -------------------------------------------------------------------------
    // TIER C: LAB & EXPERIMENTS (8 Projects)
    // -------------------------------------------------------------------------
    {
      name: 'Particle Chain WASM',
      slug: 'particle-chain-wasm',
      shortDescription: 'Real-time particle physics chain simulation in C++ compiled to WebAssembly.',
      description:
        'Physics simulation implementing Verlet integration and particle chain constraints in C++, compiled via Emscripten to WebAssembly with HTML5 canvas output.',
      documentationMd: `## Overview

Real-time particle chain dynamics written in modern C++ and compiled to WebAssembly.

- **Verlet Integration**: Physical constraints for linked particle chains.
- **Optimized Compilation**: Built using Emscripten with \`-Os\` and zero exception overhead.
- **Canvas Rendering**: High-performance browser rendering loop.`,
      iconUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1509228468518-180dd4864904?w=1200&q=80',
      demoUrl: 'https://elsesourav.github.io/particle-chain-wasm',
      githubUrl: 'https://github.com/elsesourav/particle-chain-wasm',
      categoryId: catMap['simulations']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2025-04-06T14:00:00Z'),
      tags: ['cpp', 'webassembly', 'canvas', 'algorithms'],
    },
    {
      name: 'Wave Function Collapse Visualizer',
      slug: 'wave-function-collapse',
      shortDescription: 'Procedural tile and texture generation using the quantum-inspired Wave Function Collapse algorithm.',
      description:
        'An interactive JavaScript visualization of constraint satisfaction and entropy reduction generating continuous seamless procedural maps and tile grids.',
      documentationMd: `## Overview

Visualizes the **Wave Function Collapse (WFC)** algorithm for 2D bitmap and tile generation.

- **Entropy Tracking**: Calculates lowest-entropy superpositions across grid nodes.
- **Constraint Propagation**: Collapses neighboring adjacency rules dynamically.
- **Interactive Step Mode**: Inspect generation step-by-step on canvas.`,
      iconUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
      demoUrl: 'https://elsesourav.github.io/wave-function-collapse',
      githubUrl: 'https://github.com/elsesourav/wave-function-collapse',
      categoryId: catMap['simulations']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2024-04-14T18:00:00Z'),
      tags: ['algorithms', 'canvas', 'open-source'],
    },
    {
      name: 'Falling Sands Sandbox',
      slug: 'falling-sands',
      shortDescription: 'Cellular automata physics simulation for particulate materials (sand, water, solids).',
      description:
        'A real-time cellular automata engine modeling gravity, dispersion, and liquid displacement across thousands of particles on canvas.',
      documentationMd: `## Overview

Simulates granular materials and fluids using grid-based neighborhood rules.

- **Material States**: Sand (falling solid), Water (liquid dispersion), Stone (static barrier).
- **High-Performance Loop**: Optimized grid buffer swapping for 60 FPS interaction.`,
      iconUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80',
      demoUrl: 'https://elsesourav.github.io/falling-sands',
      githubUrl: 'https://github.com/elsesourav/falling-sands',
      categoryId: catMap['simulations']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2024-04-09T17:00:00Z'),
      tags: ['algorithms', 'canvas', 'open-source'],
    },
    {
      name: 'GCELT Automate',
      slug: 'gcelt-automate',
      shortDescription: 'Chrome extension automating form submissions, PDF document uploads, and marks tabulation for faculty.',
      description:
        'A browser extension developed for GCELT faculty to automate repetitive academic portal tasks including PDF document uploads, form auto-filling, and answer sheet tabulation.',
      documentationMd: `## Overview

**GCELT Automate** is a Chrome extension designed to streamline academic portal interactions for college faculty members.

## Features

- **Automated Form Filling**: Identifies required input fields and auto-populates batch data.
- **PDF Upload Automation**: Manages document queue submissions without manual re-navigation.
- **Smart Field Detection**: Dynamic content script detection for form structures.`,
      iconUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/gcelt-automate',
      categoryId: catMap['automation']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2024-09-15T11:00:00Z'),
      tags: ['chrome-extension', 'automation', 'open-source'],
    },
    {
      name: 'Auto Flipkart OTP',
      slug: 'auto-flipkart-otp',
      shortDescription: 'Chrome extension integrating Gmail API and OAuth 2.0 to detect and auto-fill seller verification OTPs.',
      description:
        'A browser extension using Google OAuth 2.0 and the Gmail API to securely read incoming verification emails and automatically paste OTP codes into Flipkart Seller login pages.',
      documentationMd: `## Overview

**Auto Flipkart OTP** streamlines multi-seller logins by capturing verification emails in the background and auto-filling authentication fields.

## Features

- **OAuth 2.0 Integration**: Authenticates with Gmail API via Chrome Identity API.
- **Automated Parsing**: Uses regex to extract one-time passwords from incoming marketplace emails.
- **Domain Isolation**: Restricts execution to authorized seller domains for security.`,
      iconUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/auto-flipkart-otp',
      categoryId: catMap['automation']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2024-08-10T14:00:00Z'),
      tags: ['chrome-extension', 'automation', 'open-source'],
    },
    {
      name: 'Typing Test Speed Calculator',
      slug: 'typing-test',
      shortDescription: 'Real-time typing speed and accuracy testing utility with dynamic WPM calculation and mistake highlighting.',
      description:
        'A responsive web utility for measuring typing speed (Words Per Minute), accuracy percentages, and keystroke metrics with real-time text diffing and error analysis.',
      documentationMd: `## Overview

A browser typing speed test measuring WPM and keystroke accuracy in real time.

## Features

- **Live WPM Calculation**: Real-time computation using standard 5-character word metrics.
- **Visual Diff Highlighting**: Instant visual feedback on correctly typed versus errant characters.
- **Summary Analytics**: Breakdown of raw WPM, net WPM, accuracy, and error frequency.`,
      iconUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=1200&q=80',
      demoUrl: 'https://elsesourav.github.io/typing-test',
      githubUrl: 'https://github.com/elsesourav/typing-test',
      categoryId: catMap['utilities']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2024-05-12T16:00:00Z'),
      tags: ['react', 'typescript', 'canvas', 'open-source'],
    },
    {
      name: 'Edu Khel Games',
      slug: 'edu-khel-games',
      shortDescription: 'Interactive educational canvas mini-games designed for elementary learning and cognitive development.',
      description:
        'A collection of lightweight educational mini-games built with HTML5 Canvas and JavaScript to teach foundational math, memory recall, and pattern recognition.',
      documentationMd: `## Overview

**Edu Khel Games** provides interactive educational mini-games built for young learners.

## Features

- **Pattern Matching**: Interactive puzzles for spatial recognition.
- **Math Drills**: Gamified arithmetic exercises with progressive difficulty.
- **Canvas Physics**: Lightweight animations and touch-responsive game loops.`,
      iconUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=1200&q=80',
      demoUrl: 'https://elsesourav.github.io/edu-khel-games',
      githubUrl: 'https://github.com/elsesourav/edu-khel-games',
      categoryId: catMap['simulations']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2024-03-20T10:00:00Z'),
      tags: ['game-dev', 'canvas', 'open-source'],
    },
    {
      name: 'Travel Plans Planner',
      slug: 'travel-plans',
      shortDescription: 'Interactive travel itinerary planner with map coordinates, destination notes, and expense tracking.',
      description:
        'A responsive web application for organizing multi-day trip itineraries, mapping destination coordinates, cataloging packing checklists, and tracking estimated travel expenses.',
      documentationMd: `## Overview

A travel itinerary planning utility for structuring multi-destination journeys.

## Features

- **Day-by-Day Itinerary**: Chronological timeline of activities, bookings, and transit.
- **Expense Estimator**: Itemized budgeting for lodging, food, and transport.
- **Checklist Manager**: Packing and preparation item tracking.`,
      iconUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/travel-plans',
      categoryId: catMap['web-apps']!,
      status: PublishStatus.PUBLISHED,
      isFeatured: false,
      currentVersion: '1.0.0',
      publishedAt: new Date('2024-02-14T12:00:00Z'),
      tags: ['react', 'typescript', 'open-source'],
    },

    // -------------------------------------------------------------------------
    // TIER D: ARCHIVE / PROTOTYPES (2 Projects)
    // -------------------------------------------------------------------------
    {
      name: 'NEO CLI Utility',
      slug: 'neo',
      shortDescription: 'Experimental developer command-line interface tool for personal workspace automation.',
      description:
        'A command-line interface prototype exploring task automation, terminal formatting, and developer workflow shortcuts.',
      documentationMd: `## Overview

**NEO** is an experimental CLI exploration for local developer task management.

## Status

Archived experimental prototype for terminal automation patterns.`,
      iconUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/neo',
      categoryId: catMap['utilities']!,
      status: PublishStatus.ARCHIVED,
      isFeatured: false,
      currentVersion: '0.1.0',
      publishedAt: new Date('2023-11-10T10:00:00Z'),
      tags: ['open-source'],
    },
    {
      name: 'User Manager Prototype',
      slug: 'user-manager',
      shortDescription: 'Full-stack user management prototype exploring CRUD workflows, pagination, and role-based permissions.',
      description:
        'A prototype web application evaluating user directory interfaces, search query debouncing, and permission administration.',
      documentationMd: `## Overview

Prototype interface exploring administrative user table controls and search performance.`,
      iconUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=200&q=80',
      featuredImageUrl: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=1200&q=80',
      githubUrl: 'https://github.com/elsesourav/user-manager',
      categoryId: catMap['web-apps']!,
      status: PublishStatus.DRAFT,
      isFeatured: false,
      currentVersion: '0.1.0',
      publishedAt: new Date('2023-09-05T15:00:00Z'),
      tags: ['react', 'open-source'],
    },
  ];

  for (const app of appsData) {
    const { tags, githubUrl, ...appFields } = app;
    const createdApp = await prisma.app.upsert({
      where: { slug: app.slug },
      update: {
        ...appFields,
      },
      create: {
        ...appFields,
      },
    });

    // Sync app links (GitHub & Demo)
    await prisma.appLink.deleteMany({ where: { appId: createdApp.id } });
    if (githubUrl) {
      await prisma.appLink.create({
        data: {
          appId: createdApp.id,
          platform: 'github',
          label: 'GitHub Repository',
          url: githubUrl,
          isPrimary: true,
          displayOrder: 0,
        },
      });
    }
    if (appFields.demoUrl) {
      await prisma.appLink.create({
        data: {
          appId: createdApp.id,
          platform: 'web',
          label: 'Live Preview',
          url: appFields.demoUrl,
          isPrimary: false,
          displayOrder: 1,
        },
      });
    }

    // Sync app tags
    await prisma.appTag.deleteMany({ where: { appId: createdApp.id } });
    for (const tagSlug of tags) {
      if (tagMap[tagSlug]) {
        await prisma.appTag.create({
          data: {
            appId: createdApp.id,
            tagId: tagMap[tagSlug]!,
          },
        });
      }
    }
  }

  // ===========================================================================
  // 5. SEED BLOG CATEGORIES & DEVLOG ARTICLES
  // ===========================================================================
  console.info('  → Seeding Blog Articles & Engineering Notes...');

  const blogCatArchitecture = await prisma.blogCategory.upsert({
    where: { slug: 'architecture-design' },
    update: { name: 'Architecture & Design' },
    create: {
      name: 'Architecture & Design',
      slug: 'architecture-design',
      description: 'System design, monorepos, and architectural lessons learned from building software.',
    },
  });

  const blogCatWasm = await prisma.blogCategory.upsert({
    where: { slug: 'systems-webassembly' },
    update: { name: 'Systems & WebAssembly' },
    create: {
      name: 'Systems & WebAssembly',
      slug: 'systems-webassembly',
      description: 'C++, WebAssembly compilation pipelines, SIMD, and low-level web performance.',
    },
  });

  const blogCatHardware = await prisma.blogCategory.upsert({
    where: { slug: 'hardware-robotics' },
    update: { name: 'Hardware & Robotics' },
    create: {
      name: 'Hardware & Robotics',
      slug: 'hardware-robotics',
      description: 'Microcontroller engineering, ESP32, motor controllers, and real-time telemetry.',
    },
  });

  const articlesData = [
    {
      title: 'Inside SpectraLens AI: Architecture for Multi-Engine Browser AI with Zero API Costs',
      slug: 'inside-spectralens-multi-engine-ai-architecture',
      excerpt:
        'How I designed a Manifest V3 Chrome extension that queries leading AI models simultaneously through signed-in web sessions without token costs.',
      content: `# Inside SpectraLens AI: Architecture for Multi-Engine Browser AI with Zero API Costs

When building research workflows with LLMs, switching between different model interfaces is frustrating and disjointed. Commercial API keys are expensive for personal experimentation, while web chat interfaces are isolated in separate tabs.

With **SpectraLens AI**, I wanted to answer a practical engineering question:

> *Can we execute parallel multi-model queries directly inside any active webpage by orchestrating existing browser sessions with zero API token overhead?*

## 1. The Multi-Model Session Gateway

Rather than requiring users to maintain paid third-party API subscriptions, SpectraLens AI communicates directly with active session endpoints.

### Key Architectural Challenges:
1. **Manifest V3 Worker Constraints**: Background service workers in Manifest V3 are ephemeral and can terminate unexpectedly during long streaming responses.
2. **CORS & Session Token Handling**: Ensuring session authorization cookies are forwarded cleanly without compromising user security.
3. **DOM Content Extraction**: Parsing arbitrary HTML structures into clean Markdown formatted inputs for prompt assembly.

## 2. On-Device OCR with WebAssembly

To capture text from non-selectable web graphics or video frames, SpectraLens integrates an offline Tesseract.js WebAssembly build. Text extraction happens 100% locally on the client without uploading screenshots to external servers.

## 3. Key Takeaways

- Browser extensions can act as powerful personal orchestration layers.
- Local-first WebAssembly pipelines give users privacy without server hosting bills.
- Designing with strict Manifest V3 lifecycle constraints creates resilient, memory-efficient software.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&q=80',
      categoryId: blogCatArchitecture.id,
      readingTime: 6,
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date('2026-08-20T10:00:00Z'),
    },
    {
      title: 'Compiling C++ Neural Networks to WebAssembly: Matrix Math & SIMD in the Browser',
      slug: 'compiling-cpp-neural-networks-to-webassembly',
      excerpt:
        'Lessons learned writing custom backpropagation matrix routines in C++ and compiling them with Emscripten -msimd128 for real-time handwriting recognition.',
      content: `# Compiling C++ Neural Networks to WebAssembly: Matrix Math & SIMD in the Browser

Building machine learning models from scratch in low-level languages is one of the most effective ways to understand how backpropagation, matrix multiplication, and memory layout affect computational throughput.

In \`nn-number-rec\`, I built a multilayer perceptron in **C++** and compiled it to **WebAssembly (WASM)** using Emscripten to achieve near-native digit classification in the browser.

## 1. Cache-Friendly Matrix Operations

In standard JavaScript, array allocations can introduce GC pauses and irregular memory strides. In C++, we control memory layout precisely:

\`\`\`cpp
// Contiguous flat buffer for weights to maximize L1/L2 cache hits
std::vector<float> weights;
\`\`\`

## 2. Emscripten Compilation & Vectorization

By targeting the WebAssembly SIMD specification (\`-msimd128\`), 128-bit vector registers process multiple float multiplications in parallel per CPU cycle:

\`\`\`bash
em++ -std=c++11 ./cpp/wasm.cpp -O3 -flto -msimd128 -s WASM=1 -o ./js/logic.js
\`\`\`

## 3. Real-Time Canvas Interactivity

The compiled WASM module exposes a fast C function to JavaScript that accepts pixel buffers directly from an HTML5 Canvas drawing element, classifying the digit in under 1 millisecond.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
      categoryId: blogCatWasm.id,
      readingTime: 8,
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date('2026-08-10T14:30:00Z'),
    },
    {
      title: 'Eliminating the Arduino Uno: Standalone ESP32-CAM Robotics & 4-Pin PWM Tricks',
      slug: 'standalone-esp32-cam-robotics-and-pwm-tricks',
      excerpt:
        'How to build a single-board WiFi RC car by serving an embedded web controller and driving an L298N motor controller directly with ESP32-CAM GPIOs.',
      content: `# Eliminating the Arduino Uno: Standalone ESP32-CAM Robotics & 4-Pin PWM Tricks

Most hobbyist WiFi camera robot designs use two microcontrollers: an **ESP32-CAM** for video streaming and an **Arduino Uno** to control motor drivers. This dual-board approach adds unnecessary wiring, weight, and serial communication latency.

For the \`esp32-cam-with-car-control\` project, my goal was to make the ESP32-CAM the **sole brain** of the vehicle.

## 1. Overcoming the GPIO Pin Shortage

The ESP32-CAM exposes very few usable GPIOs because most are consumed by the OV2640 camera and onboard flash.

### The 4-Pin PWM Solution
Standard L298N motor driver wiring requires 6 pins (2 enable pins for PWM speed control + 4 directional inputs). By leaving the hardware jumpers on the ENA and ENB pins permanently enabled, we apply PWM directly to the IN1–IN4 directional pins, reducing our required GPIO count from 6 to 4!

## 2. In-Memory Web Server & Telemetry

Instead of relying on SD card filesystems, all HTML, CSS, and WebSocket controller assets are compiled directly into microcontroller program memory. The car streams live MJPEG video and telemetry from an onboard MPU6050 accelerometer at low latency.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=80',
      categoryId: blogCatHardware.id,
      readingTime: 7,
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date('2026-07-28T09:00:00Z'),
    },
    {
      title: 'Architecting E-Commerce Automation: Reverse Engineering Seller Workflows & Bulk Data Transforms',
      slug: 'architecting-marketplace-seller-automation',
      excerpt:
        'Building tools to solve real seller friction: mapping legacy SKU codes, batching XLSX catalog transformations, and automating cross-marketplace synchronization.',
      content: `# Architecting E-Commerce Automation: Reverse Engineering Seller Workflows & Bulk Data Transforms

Online sellers spend hundreds of manual hours every month formatting spreadsheets, copying listing attributes across platforms, and verifying shipping labels.

In building \`es-automation\` and its companion tools, the focus was creating real utility for high-volume marketplace operations.

## 1. Schema Inconsistencies Across Marketplaces

Every e-commerce platform enforces distinct catalog schemas. Porting a catalog from Flipkart to Shopsy requires automated pricing adjustments, prefix mapping, and attribute normalization.

## 2. Client-Side Batch Processing

Handling thousands of catalog rows without server timeouts requires client-side chunking. By utilizing Web Workers and fast in-memory spreadsheet parsing, sellers can process large SKU listings in seconds right inside their browser.`,
      coverImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
      categoryId: blogCatArchitecture.id,
      readingTime: 9,
      status: PublishStatus.PUBLISHED,
      publishedAt: new Date('2026-07-15T16:00:00Z'),
    },
  ];

  for (const article of articlesData) {
    await prisma.blogPost.upsert({
      where: { slug: article.slug },
      update: {
        ...article,
        authorId: adminUser.id,
      },
      create: {
        ...article,
        authorId: adminUser.id,
      },
    });
  }

  // ===========================================================================
  // 6. SEED HELP CENTER & DOCUMENTATION
  // ===========================================================================
  console.info('  → Seeding Help Center Categories & Articles...');

  const helpCatGeneral = await prisma.helpCategory.upsert({
    where: { slug: 'getting-started' },
    update: { name: 'Getting Started & Studio Overview' },
    create: {
      name: 'Getting Started & Studio Overview',
      slug: 'getting-started',
      description: 'Overview of ElseSourav, navigating the catalog, and understanding project architectures.',
      icon: 'BookOpen',
      orderIndex: 0,
    },
  });

  const helpCatApps = await prisma.helpCategory.upsert({
    where: { slug: 'applications-guides' },
    update: { name: 'Applications & Installation Guides' },
    create: {
      name: 'Applications & Installation Guides',
      slug: 'applications-guides',
      description: 'Setup instructions, extension installation, and running tools locally.',
      icon: 'Layers',
      orderIndex: 1,
    },
  });

  const helpCatPrivacy = await prisma.helpCategory.upsert({
    where: { slug: 'privacy-account' },
    update: { name: 'Privacy & User Accounts' },
    create: {
      name: 'Privacy & User Accounts',
      slug: 'privacy-account',
      description: 'Account settings, notification preferences, and local-first data privacy guarantees.',
      icon: 'Shield',
      orderIndex: 2,
    },
  });

  const helpArticles = [
    {
      title: 'Exploring the Studio Catalog & Launching Applications',
      slug: 'exploring-the-studio-catalog',
      excerpt: 'Learn how to discover, filter, inspect, and launch tools in the ElseSourav software archive.',
      content: `# Exploring the Studio Catalog

Welcome to the **ElseSourav** application catalog. This archive contains software applications, browser extensions, developer utilities, and technical simulations created by Sourav.

## How to Navigate the Catalog

- **Category Filtering**: Filter applications by domain (AI, Automation, Systems, Tools).
- **Search**: Fast client-side search across app titles, descriptions, and technology tags.
- **Inspect Code**: Every open-source project links directly to its source repository on GitHub.`,
      categoryId: helpCatGeneral.id,
      status: PublishStatus.PUBLISHED,
      orderIndex: 0,
    },
    {
      title: 'Installing SpectraLens AI Chrome Extension',
      slug: 'installing-spectralens-ai-chrome-extension',
      excerpt: 'Step-by-step instructions for loading the unpacked SpectraLens AI browser extension in developer mode.',
      content: `# Installing SpectraLens AI (Unpacked Extension)

To install SpectraLens AI in any Chromium-based browser (Chrome, Edge, Brave, Opera):

1. **Clone the Repository**: Clone \`https://github.com/elsesourav/spectralens-ai\` to your local computer.
2. **Open Extensions Page**: Navigate to \`chrome://extensions/\`.
3. **Enable Developer Mode**: Toggle the switch in the top-right corner.
4. **Load Unpacked**: Click **Load unpacked** and select the \`extension/\` folder.
5. **Pin Extension**: Pin SpectraLens AI to your browser toolbar for quick access.`,
      categoryId: helpCatApps.id,
      status: PublishStatus.PUBLISHED,
      orderIndex: 0,
    },
    {
      title: 'Using the Client-Side Seller PDF Cropper',
      slug: 'using-the-seller-pdf-cropper',
      excerpt: 'How to crop marketplace shipping labels with zero server uploads and complete privacy.',
      content: `# Using the Seller PDF Cropper

The **Seller PDF Cropper** processes shipping documents 100% inside your browser using WebAssembly and canvas text measurement.

## Steps:
1. Open the tool and drag your multi-page shipping PDF into the dropzone.
2. Select your crop preset (Label or Full Invoice).
3. Toggle sequential page numbering if packaging batch orders.
4. Click **Process PDF** to immediately download the optimized PDF. No file is ever transmitted over the network.`,
      categoryId: helpCatApps.id,
      status: PublishStatus.PUBLISHED,
      orderIndex: 1,
    },
    {
      title: 'Data Privacy & Local-First Philosophy',
      slug: 'data-privacy-and-local-first-storage',
      excerpt: 'Why ElseSourav tools prioritize client-side processing, zero telemetry, and user privacy.',
      content: `# Data Privacy & Local-First Philosophy

ElseSourav is built with respect for user privacy:

- **Local Execution**: Wherever possible, utilities (PDF manipulation, OCR, simulations) execute entirely on your device.
- **No Intrusive Tracking**: We do not use third-party behavioral trackers or sell user telemetry.
- **Open Source Transparency**: Source code is available on GitHub for community inspection.`,
      categoryId: helpCatPrivacy.id,
      status: PublishStatus.PUBLISHED,
      orderIndex: 0,
    },
  ];

  for (const article of helpArticles) {
    await prisma.helpArticle.upsert({
      where: { slug: article.slug },
      update: {
        ...article,
        authorId: adminUser.id,
      },
      create: {
        ...article,
        authorId: adminUser.id,
      },
    });
  }

  // ===========================================================================
  // 7. SEED CANONICAL SITE SETTINGS
  // ===========================================================================
  console.info('  → Seeding Site Settings...');

  const siteSettings = [
    { key: 'site_name', value: 'ElseSourav' },
    { key: 'site_tagline', value: 'Software, Tools & Ideas' },
    { key: 'site_description', value: SITE_CONFIG.description },
    { key: 'hero_badge', value: 'SOURAV / ELSESOURAV' },
    { key: 'hero_headline', value: 'Building software, tools, games, and experiments that solve real problems and spark new ideas.' },
    { key: 'hero_subtitle', value: 'ElseSourav is my personal space for the applications I build, the ideas I explore, and the things I learn along the way.' },
    { key: 'primary_cta_label', value: 'Explore Apps' },
    { key: 'secondary_cta_label', value: 'About Me' },
    { key: 'homepage_apps_title', value: 'Selected Apps' },
    { key: 'homepage_apps_subtitle', value: 'A curated selection of software, developer tools, games, and systems.' },
    { key: 'homepage_blog_title', value: 'Field Notes & Reflections' },
    { key: 'homepage_blog_subtitle', value: 'Things I write about while building software, learning tools, and solving architectural problems.' },
    { key: 'creator_name', value: 'Sourav' },
    { key: 'creator_full_name', value: 'Sourav Barui' },
    { key: 'creator_title', value: CREATOR_CONFIG.identity.title },
    { key: 'creator_role', value: CREATOR_CONFIG.identity.role },
    { key: 'creator_location', value: CREATOR_CONFIG.identity.location },
    { key: 'creator_short_bio', value: CREATOR_CONFIG.shortBio },
    { key: 'creator_long_bio', value: CREATOR_CONFIG.longBio },
    { key: 'creator_principles_json', value: JSON.stringify(CREATOR_CONFIG.principles) },
    { key: 'creator_focus_json', value: JSON.stringify(CREATOR_CONFIG.focus) },
    { key: 'github_url', value: CREATOR_CONFIG.links.github },
    { key: 'twitter_url', value: CREATOR_CONFIG.links.twitter },
    { key: 'contact_email', value: CREATOR_CONFIG.contact.email },
    { key: 'support_url', value: CREATOR_CONFIG.contact.support },
    { key: 'footer_status_text', value: '● All Systems Operational' },
  ];

  for (const setting of siteSettings) {
    await prisma.siteSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }

  console.info('✅ ElseSourav Database successfully seeded with canonical 4-tier portfolio!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
