---
name: aiwf-frontend-dev-guidelines
description: Frontend development guidance for React/TypeScript apps. Use when creating components, pages, or features, fetching data, styling, routing, or improving performance. Start by discovering the host project's framework versions, import aliases, data-fetching and styling libraries, and existing components and hooks; the bundled topic guides are contextual examples, not a required stack.
---

# Frontend Development Guidelines

## How to use this skill

This skill is portable and assumes no specific project or library version. Before writing code, discover what the host project already provides and follow that:

1. Read the package manifest to confirm the real framework and versions (for example which React major, and which styling, routing, data-fetching, and form/validation libraries are installed).
2. Find how the project resolves import aliases by reading its build config (`vite.config.ts`, `tsconfig.json`, or equivalent) before using any alias.
3. Locate the existing shared components, hooks, API clients, notification/feedback helpers, and test setup, and reuse them instead of introducing new ones.
4. Match the existing folder layout, naming, and testing conventions.
5. Adopt a pattern from the bundled guides only when it is compatible with the installed stack and does not conflict with the project's own guidance. Otherwise, follow the project.

## When to Use This Skill

- Creating new components, pages, or features
- Fetching data and wiring loading and error states
- Styling components
- Setting up or changing routes
- Organizing frontend code and TypeScript types
- Performance optimization

## Discovery checklist

- [ ] Framework and major versions confirmed from the package manifest
- [ ] Styling approach identified (plain CSS, utility classes, CSS-in-JS, or a component library)
- [ ] Routing library identified (or none)
- [ ] Data-fetching library identified (or none)
- [ ] Form and validation library identified (or none)
- [ ] Import aliases confirmed from the build config
- [ ] Existing shared components, hooks, and API client located and reused
- [ ] Notification/feedback helper identified
- [ ] Test runner and existing test layout identified

## Working with the bundled guides

Every guide under `resources/` documents one specific stack: React with Suspense-based data fetching, TanStack Query and Router, a MUI-based component library, and project-specific aliases and components such as a SuspenseLoader. Treat them as stack-specific examples, not a baseline. Before adopting anything from them:

- Confirm the library and version the guide assumes is actually installed (if it is not, translate the idea to what the project uses or skip it).
- Confirm the project's own guidance (readme, agent instructions, conventions, existing code) allows the pattern.
- Replace project-specific names (aliases, components, route conventions) with the host project's real equivalents; never import a name that does not exist in the project.

| Topic | Reference |
|-------|-----------|
| Components: lazy loading, Suspense, component structure | [resources/component-patterns.md](resources/component-patterns.md) |
| Data fetching | [resources/data-fetching.md](resources/data-fetching.md) |
| File organization (features vs components) | [resources/file-organization.md](resources/file-organization.md) |
| Styling | [resources/styling-guide.md](resources/styling-guide.md) |
| Routing | [resources/routing-guide.md](resources/routing-guide.md) |
| Loading and error states | [resources/loading-and-error-states.md](resources/loading-and-error-states.md) |
| Performance | [resources/performance.md](resources/performance.md) |
| TypeScript standards | [resources/typescript-standards.md](resources/typescript-standards.md) |
| Common patterns: forms, auth, data grid | [resources/common-patterns.md](resources/common-patterns.md) |
| Complete examples | [resources/complete-examples.md](resources/complete-examples.md) |

## Related skills

- `aiwf-error-tracking` - capture errors with the provider the project already uses
- `aiwf-backend-dev-guidelines` - backend API patterns the frontend consumes
