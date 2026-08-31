export interface CapabilityProjectRef {
  readonly name: string;
  readonly slug: string;
  readonly context: string;
}

export interface CapabilityGroupConfig {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly technologies: readonly string[];
  readonly projects: readonly CapabilityProjectRef[];
}

export const CAPABILITY_GROUPS_CONFIG: readonly CapabilityGroupConfig[] = [
  {
    id: 'interactive-games',
    title: 'Interactive Software & Games',
    summary:
      'Real-time animation loops, continuous collision detection, and arcade physics engines.',
    technologies: ['C++', 'Canvas 2D', 'Emscripten', 'AABB Physics'],
    projects: [
      {
        name: 'Breakout Ball',
        slug: 'breakout-ball',
        context: 'C++ arcade engine compiled to WebAssembly at 60 FPS',
      },
      {
        name: 'Edu Khel Games',
        slug: 'edu-khel-games',
        context: 'Educational browser game suites with logic puzzles',
      },
    ],
  },
  {
    id: 'creative-tools',
    title: 'Creative Tools & Canvas',
    summary:
      'Client-side photo manipulation, non-destructive adjustment matrices, and pixel transformations.',
    technologies: ['HTML5 Canvas', 'ImageData API', 'TypeScript', 'Web Workers'],
    projects: [
      {
        name: 'Img Editor',
        slug: 'img-editor',
        context: 'Zero-upload client-side image filter and crop studio',
      },
    ],
  },
  {
    id: 'ai-ml',
    title: 'AI & Machine Learning Experimentation',
    summary:
      'Browser extension AI pipelines, on-device OCR, and matrix-based neural network implementations.',
    technologies: ['Manifest V3', 'WebAssembly OCR', 'LLM Streaming', 'Matrix Math'],
    projects: [
      {
        name: 'SpectraLens AI',
        slug: 'spectralens-ai',
        context: 'Chrome extension with on-device OCR and streaming AI',
      },
      {
        name: 'Neural Network Number Recognition',
        slug: 'nn-number-rec',
        context: 'Matrix multiplication neural net from scratch',
      },
    ],
  },
  {
    id: 'automation',
    title: 'Automation & Workflow Engines',
    summary:
      'Batch data reconciliation, multi-seller SKU parsing, and institutional process automation.',
    technologies: ['Web Workers', 'Regex Engines', 'CSV/Excel Pipelines', 'Async I/O'],
    projects: [
      {
        name: 'ES Automation',
        slug: 'es-automation',
        context: 'Multi-seller catalog batch parsing and SKU reconciliation',
      },
      {
        name: 'GCELT Automate',
        slug: 'gcelt-automate',
        context: 'Institutional workflow and routine task automation',
      },
      {
        name: 'Seller PDF Cropper',
        slug: 'seller-pdf-cropper',
        context: 'Multi-page shipping invoice slicing utility',
      },
    ],
  },
  {
    id: 'systems-wasm',
    title: 'Systems Programming & WebAssembly',
    summary:
      'Compiling low-level C++ architectures for native-speed execution in modern browser runtimes.',
    technologies: ['C++', 'WebAssembly', 'Emscripten', 'Memory Buffers'],
    projects: [
      {
        name: 'Particle Chain WASM',
        slug: 'particle-chain-wasm',
        context: 'C++ Verlet integration physics solver in WASM',
      },
      {
        name: 'Breakout Ball Engine',
        slug: 'breakout-ball',
        context: 'Native C++ physics core compiled to browser binary',
      },
    ],
  },
  {
    id: 'graphics-simulations',
    title: 'Graphics & Simulations (The Lab)',
    summary:
      'Procedural generation, cellular automata sandboxes, and mathematical physics simulations.',
    technologies: ['Cellular Automata', 'WFC Algorithm', 'Constraint Solvers', 'Canvas'],
    projects: [
      {
        name: 'Falling Sands Sandbox',
        slug: 'falling-sands',
        context: 'Cellular automata particulate dispersion sandbox',
      },
      {
        name: 'Wave Function Collapse',
        slug: 'wave-function-collapse',
        context: 'Procedural 2D tile map constraint satisfaction engine',
      },
    ],
  },
  {
    id: 'mobile-offline',
    title: 'Mobile & Offline-First Systems',
    summary:
      'Cross-platform mobile applications with offline persistence and structured state management.',
    technologies: ['React Native', 'AsyncStorage', 'Local State', 'Notifications'],
    projects: [
      {
        name: 'Meal Tracker Mobile',
        slug: 'meal-tracker',
        context: 'Offline-first dietary habit tracking with smart alerts',
      },
    ],
  },
  {
    id: 'web-applications',
    title: 'Full-Stack Web Applications',
    summary:
      'High-performance web applications with end-to-end type safety, accessible UI, and relational data.',
    technologies: ['TypeScript', 'Next.js 15', 'PostgreSQL', 'Prisma', 'Tailwind CSS'],
    projects: [
      {
        name: 'Seller Hub',
        slug: 'seller-hub',
        context: 'Unified e-commerce management and analytics platform',
      },
      {
        name: 'Terminal Station',
        slug: 'terminal-station',
        context: 'Web-based developer command center and workstation',
      },
    ],
  },
];
