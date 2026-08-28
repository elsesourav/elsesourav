# Feature Modules (`src/features/`)

Features are vertically sliced, cohesive domain modules. Each feature encapsulates its own UI components, hooks, services, schemas, and types.

## Typical Feature Structure

```
src/features/<feature-name>/
├── components/     # Feature-specific UI components
├── hooks/          # Feature-specific React hooks
├── services/       # Feature-specific business logic & repository calls
├── schemas/        # Feature-specific Zod schemas
├── types/          # Feature-specific type definitions
└── index.ts        # Public API surface of the feature
```

## Rules for Feature Modules

1. **Encapsulation**: Feature internals (subcomponents, internal helpers) should only be exposed through `index.ts`.
2. **Cross-Feature Communication**: Features should interact via shared services, shared types, or global state, not by reaching into another feature's private internal files.
3. **Reusable Primitives**: If a component or utility is generic and not tied to the feature domain, place it in `src/components/ui/` or `src/utils/` instead.
