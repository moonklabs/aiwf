---
trigger: always_on
---
# Coding Principles Guide

High-level architectural principles for the project.

## Architecture Principles

**Do:**

- Apply Clean Architecture principles to create decoupled, testable, and maintainable systems.
- Follow SOLID principles (Single Responsibility, Open/Closed, Liskov Substitution, Interface Segregation, Dependency Inversion).
- Explicitly define architectural boundaries and module responsibilities.
- Use dependency inversion to decouple high-level and low-level modules.

**Don't:**

- Don't create tightly coupled modules that are hard to change or test independently.
- Don't violate core architectural boundaries or mix unrelated concerns.
- Don't ignore the separation of business logic and infrastructure.

## 2. General Coding Philosophy

**Do:**

- Write concise, highly readable TypeScript code.
- Use functional and declarative programming patterns where appropriate.
- Apply the DRY (Don't Repeat Yourself) principle to avoid code duplication.
- Use early return statements to improve readability and reduce nesting.
- Organize components logically: exports, subcomponents, helpers, types.

**Don't:**

- Don't write overly complex or deeply nested logic.
- Don't sacrifice clarity for cleverness.
