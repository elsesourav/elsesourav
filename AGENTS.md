# Agent Guidelines & Workflow Rules

## Mandatory UI Development Workflow

Every AI coding agent (Gemini Code, Antigravity, Claude, etc.) operating in this codebase must strictly observe these instructions:

1. **Mandatory First Step**: Before making ANY UI changes or creating new components, you MUST read the UI development documentation first:
   - Primary Guide: [`packages/ui/README.md`](file:///Users/sourav/Developer/WEB/elsesourav/packages/ui/README.md)
   - UI Skill: [`.agents/skills/ui-development/SKILL.md`](file:///Users/sourav/Developer/WEB/elsesourav/.agents/skills/ui-development/SKILL.md)
   - Design Constitution: [`docs/design/DESIGN_CONSTITUTION.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/design/DESIGN_CONSTITUTION.md)
   - Theme Tokens: [`docs/design/THEME_TOKEN_ARCHITECTURE.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/design/THEME_TOKEN_ARCHITECTURE.md)
2. **Quality & Maintainability Standards**:
   - **500 Lines per File Limit**: Never write or expand any UI component file beyond 500 lines of code. Modularize into subcomponents or custom hooks.
   - **Strict TypeScript**: 0 errors, 0 `any` types. Run `pnpm typecheck` to verify.
   - **Accessibility**: Support keyboard navigation, ARIA attributes, and automatic `prefers-reduced-motion` overrides.
3. **Anti-Duplication**: Check existing components in `@elsesourav/ui`, `@elsesourav/ui/interior`, and `@elsesourav/ui/micro` before creating anything new. Reuse and compose.
4. **Subpath Cleanliness**:
   - `@elsesourav/ui` -> Core primitives and layouts.
   - `@elsesourav/ui/interior` -> 54 fluid physics components.
   - `@elsesourav/ui/micro` -> 34 micro-interactions.
   - Never import interior or micro components from the root `@elsesourav/ui`.
5. **Documentation Synchronization**:
   - Immediately update [`packages/ui/README.md`](file:///Users/sourav/Developer/WEB/elsesourav/packages/ui/README.md) whenever you create or modify any UI component.
