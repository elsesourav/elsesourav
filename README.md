# ElseSourav Monorepo

Welcome to the **ElseSourav** monorepo — the high-performance creator platform, personal brand, and developer utility ecosystem.

---

> ## ⚠️ Mandatory UI Development Workflow (Skill-First Policy)
>
> **Every developer and AI coding agent (including Gemini Code, Antigravity, Claude, etc.) must strictly adhere to the following mandatory workflow for all UI tasks:**
>
> 1. **Read & Follow Skills/Docs First**: Before making any UI changes or creating new components, always read and follow the relevant UI development skill or documentation first ([`packages/ui/README.md`](file:///Users/sourav/Developer/WEB/elsesourav/packages/ui/README.md), [`docs/design/DESIGN_CONSTITUTION.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/design/DESIGN_CONSTITUTION.md), [`docs/design/THEME_TOKEN_ARCHITECTURE.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/design/THEME_TOKEN_ARCHITECTURE.md)).
> 2. **Mandatory Step**: Treat this as a mandatory step for every UI-related task, including updates, redesigns, bug fixes, and new components.
> 3. **Design, Accessibility & Maintainability**: Use the skill's guidelines to ensure consistent design, WCAG AA accessibility, fluid responsive layouts, and maintainable code (**strictly under 500 lines of code per file**).
> 4. **Synchronize Documentation**: After creating or modifying components, update `README.md` to document the changes and keep it synchronized with the actual codebase.
> 5. **Anti-Duplication Principle**: Avoid duplicating existing components. Reuse and extend existing components whenever practical.
> 6. **Clarity for Future Collaborators**: Keep the documentation detailed, well-organized, and easy for future AI coding agents and developers to understand.

---

## Workspace Structure

This monorepo is managed via **Turborepo** and **pnpm**:

```
elsesourav/
├── apps/
│   └── web/                     # Next.js 15 App Router web application
├── packages/
│   ├── ui/                      # Official design system & component library (128+ components)
│   │   ├── src/components/      # Core primitives, layouts, forms, surfaces, navigation
│   │   ├── src/components/interior/ # 54 Interior.dev physics components
│   │   ├── src/components/micro/    # 34 ReactBits micro-interactions & physics toys
│   │   └── README.md            # Comprehensive UI Component Guide
│   ├── database/                # Prisma ORM, migrations, and seed scripts
│   ├── types/                   # Shared TypeScript definitions
│   └── utils/                   # Shared helpers, formatters, and utilities
└── docs/                        # Architecture specs, design constitutions, runbooks
```

---

## UI Component Library Quick Navigation

For complete documentation on all existing and newly created UI components, see **[`packages/ui/README.md`](file:///Users/sourav/Developer/WEB/elsesourav/packages/ui/README.md)**.

### Subpath Summary:

- **`@elsesourav/ui`**: Core accessible primitives (`Button`, `Card`, `Dialog`, `Input`, `PageShell`, `Tabs`, `Table`, `MarkdownRenderer`, etc.).
- **`@elsesourav/ui/interior`**: 54 fluid physics & tactile components (`BlurUpImage`, `HoldToConfirm`, `LoadingButton`, `OtpInput`, `PasswordStrength`, `SegmentedControl`, `SnapCarousel`, `CopyButton`, `PressDepth`, `ShowMore`, etc.).
- **`@elsesourav/ui/micro`**: 34 high-energy micro-interactions (`BellToggle`, `RubberSegment`, `SquishSwitch`, `CallChip`, `FlipCard`, `HoldButton`, `SwipeRow`, etc.).

---

## Getting Started

### Prerequisites

- Node.js >= 22.x
- pnpm >= 9.15.x

### Installation & Development

```bash
# Install dependencies
pnpm install

# Start development servers across the workspace
pnpm dev

# Run strict TypeScript verification across all packages
pnpm typecheck

# Lint all packages
pnpm lint
```
