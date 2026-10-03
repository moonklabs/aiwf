---
name: aiwf-backend-dev-guidelines
description: Backend development guidance for Node.js/Express/TypeScript services. Use when adding or changing routes, controllers, services, repositories, middleware, validation, error handling, configuration, database access, or backend tests. Start by discovering the host project's actual framework, versions, helper modules, and conventions; the bundled pattern notes are contextual examples, not a required stack.
---

# Backend Development Guidelines

## How to use this skill

This skill is portable and makes no assumption about a specific project, framework version, or helper library. Before writing code, discover what the host project already provides and follow that:

1. Read the package manifest (`package.json`, `pyproject.toml`, etc.) to confirm the real framework and versions (for example Express 4 vs 5, which ORM, which validator).
2. Search the repository for existing base classes, error helpers, config modules, validation schemas, middleware, and logging, and reuse them.
3. Match the directory layout, naming, and test conventions already in use instead of imposing the structure shown below.
4. Fall back to the bundled examples only when the project has no established pattern. Treat them as illustration, not a mandate.

## When to use this skill

- Adding or changing HTTP routes, endpoints, controllers, or middleware
- Moving business logic between layers (routes -> controllers -> services -> repositories)
- Input validation, error handling, or configuration management
- Database access and repository patterns
- Backend testing and refactoring

## Discovery checklist

- [ ] Framework and version confirmed from the package manifest
- [ ] Existing request-handler / base-controller pattern located (if any)
- [ ] Error capture mechanism identified (logger, tracker, or none) - reuse it, do not add a new provider
- [ ] Config access pattern identified - reuse it instead of reading environment variables directly in new code
- [ ] Validation library identified - reuse it
- [ ] Data-access layer identified (ORM, query builder, repositories)
- [ ] Test runner and existing test layout identified

## Layered architecture (common shape)

Many Node.js/TypeScript services separate responsibilities like this:

```
HTTP request
    ->
Routes (HTTP wiring only)
    ->
Controllers (request handling)
    ->
Services (business logic)
    ->
Repositories (data access)
    ->
Database
```

Confirm the layer names and boundaries against the host project before relying on them. Where the project uses different names (handlers, use-cases, gateways), use the project's terms.

## Core principles

1. Keep HTTP wiring thin; delegate to a handler or service.
2. Give each layer one responsibility.
3. Capture errors through whatever mechanism the project already uses; never swallow them silently.
4. Read configuration through the project's existing config module.
5. Validate untrusted input with the project's validation library.
6. Isolate data access behind the project's existing data layer.
7. Cover new behavior with tests in the project's existing test setup.

## Bundled reference examples (contextual)

The files below illustrate one mature Node.js/Express/TypeScript setup that used Express, Prisma, Zod, Sentry, and a shared config module. Read them after you have checked the host project, and adapt anything you borrow to the project's real stack.

| Need to understand... | Reference |
|-----------------------|-----------|
| Architecture and request lifecycle | [resources/architecture-overview.md](resources/architecture-overview.md) |
| Routes and controllers | [resources/routing-and-controllers.md](resources/routing-and-controllers.md) |
| Services and repositories | [resources/services-and-repositories.md](resources/services-and-repositories.md) |
| Validation | [resources/validation-patterns.md](resources/validation-patterns.md) |
| Error tracking and monitoring | [resources/sentry-and-monitoring.md](resources/sentry-and-monitoring.md) |
| Middleware | [resources/middleware-guide.md](resources/middleware-guide.md) |
| Database patterns | [resources/database-patterns.md](resources/database-patterns.md) |
| Configuration | [resources/configuration.md](resources/configuration.md) |
| Async and errors | [resources/async-and-errors.md](resources/async-and-errors.md) |
| Testing | [resources/testing-guide.md](resources/testing-guide.md) |
| Complete examples | [resources/complete-examples.md](resources/complete-examples.md) |

## Related skills

- `aiwf-error-tracking` - capture errors using the provider the project already runs
- `aiwf-skill-developer` - author and maintain new skills
