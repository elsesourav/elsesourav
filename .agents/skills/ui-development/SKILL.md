---
name: ui-development
description: Mandatory skill and workflow for all UI tasks in ElseSourav. Use whenever creating, updating, or redesigning UI components, styling, layouts, or forms.
---

# UI Development Skill & Workflow

> **CRITICAL POLICY FOR ALL AI CODING AGENTS (GEMINI CODE, ANTIGRAVITY, CLAUDE, ETC.) & DEVELOPERS:**
>
> 1. **Read & Follow Skills/Docs First**: Before making ANY UI changes or creating new components, ALWAYS read and follow this skill and [`packages/ui/README.md`](file:///Users/sourav/Developer/WEB/elsesourav/packages/ui/README.md) first.
> 2. **Mandatory Step**: Treat this as a mandatory first step for every UI-related task, including bug fixes, updates, redesigns, and new components.
> 3. **Design Guidelines**:
>    - Adhere strictly to the design token architecture defined in [`docs/design/THEME_TOKEN_ARCHITECTURE.md`](file:///Users/sourav/Developer/WEB/elsesourav/docs/design/THEME_TOKEN_ARCHITECTURE.md).
>    - Ensure WCAG 2.1 AA accessibility (keyboard focus, ARIA attributes, >4.5:1 text contrast).
>    - Support fluid responsive layouts across mobile, tablet, and desktop viewports.
>    - Enforce the **500-line file limit**: No single UI component file may exceed 500 lines of code. Split large components into focused, composable subcomponents.
> 4. **Anti-Duplication Principle**:
>    - Always check [`packages/ui/README.md`](file:///Users/sourav/Developer/WEB/elsesourav/packages/ui/README.md) before building anything new.
>    - Reuse and extend existing primitives (`@elsesourav/ui`), physics components (`@elsesourav/ui/interior`), and micro-interactions (`@elsesourav/ui/micro`).
> 5. **Subpath Import Rules**:
>    - Core primitives: `import { ... } from '@elsesourav/ui'`
>    - Interior physics: `import { ... } from '@elsesourav/ui/interior'`
>    - Micro-interactions: `import { ... } from '@elsesourav/ui/micro'`
>    - NEVER cross-import micro or interior components directly from the root `@elsesourav/ui` export!
> 6. **Documentation Synchronization**:
>    - After creating or modifying any UI component, update [`packages/ui/README.md`](file:///Users/sourav/Developer/WEB/elsesourav/packages/ui/README.md) to document changes and keep documentation in sync with code.
