---
name: aiwf-error-tracking
description: Capture application errors and performance data with the error-tracking provider the host project already uses. Use when adding error handling, creating controllers or routes, instrumenting cron jobs and background workers, or tracking slow database calls. Discover the installed provider first and reuse its helpers; do not add a new SDK or assume a particular base class.
---

# Error Tracking

## How to use this skill

This skill is provider-agnostic. It helps you wire error capture the way the host project already does, instead of imposing a specific product or library.

1. Detect the installed provider. Check the dependency manifest and lockfile for an error-tracking or observability SDK (for example Sentry, OpenTelemetry, Datadog, New Relic, Bugsnag, Highlight, Rollbar, Axiom), and search the codebase for how errors are currently reported.
2. Read the project's initialization. Find where the provider is configured and started (an `instrument` module, a bootstrap file, a framework plugin, or middleware) and reuse the helpers, wrappers, and base classes already built around it.
3. If the project has no provider, use the project's existing logger and error conventions. Only propose adding a provider if the user explicitly asks; do not add dependencies on your own.
4. Match the project's existing error shape and naming. Do not introduce a new base class or wrapper unless that pattern already exists.

## When to use this skill

- Adding error handling to new or existing code
- Creating controllers, handlers, or routes
- Instrumenting cron jobs, queues, or background workers
- Tracking slow database operations or external calls
- Reviewing code for swallowed or unhandled errors

## Core rules

- Report through the project's provider or logger; avoid using a bare `console.error` as the only reporting path where reporting is expected.
- Do not swallow errors silently.
- Add useful context such as the operation, entity id, and user id, never secrets or personal data.
- Pick a severity level that matches the project's existing conventions.
- For background jobs, ensure the provider is initialized before the job logic runs, using the same mechanism the project uses elsewhere.
- Keep provider-specific API calls inside the project's existing adapter or helper layer so a future provider change stays contained.

## Provider detection checklist

- [ ] Error-tracking or logging SDK found in the dependency manifest and lockfile
- [ ] Initialization location identified (instrument, bootstrap, plugin, or middleware)
- [ ] Existing helpers, base classes, and wrappers located and reused
- [ ] Severity and tagging conventions identified
- [ ] Background-job initialization pattern identified
- [ ] Confirmed no new dependency is needed, unless the user explicitly requested one

## Example: reusing an existing wrapper

Assume the project exposes a helper for its provider. Call it rather than the provider's raw API:

```ts
// The helper already knows the provider, tags, and severity conventions.
import { captureError } from '<project>/observability';

try {
  await doWork();
} catch (error) {
  captureError(error, { operation: 'doWork', entityId: id });
  throw error;
}
```

## Example: reporting with the raw provider SDK

If the project reports directly (no wrapper), follow the call shape the project already uses. This is the shape of a Sentry v8 call from one historical project; substitute whatever the host project installs:

```ts
import * as Sentry from '@sentry/node';

Sentry.withScope((scope) => {
  scope.setTag('operation', 'doWork');
  scope.setContext('entity', { id });
  Sentry.captureException(error);
});
```

## Example: instrumenting a background job

Initialize the provider before the job body runs, using the project's own bootstrap:

```ts
import './bootstrap-observability'; // project-provided initialization

async function main() {
  try {
    await runJob();
  } catch (error) {
    captureError(error, { job: 'my-job' });
    process.exitCode = 1;
  }
}

void main();
```

## Anti-patterns

- Adding a new monitoring SDK without being asked
- Assuming a specific base class or helper exists
- Reporting only through `console.error` in a project that already has a provider
- Hardcoding DSNs, API keys, or other credentials
- Logging secrets or personal data in error context
- Instrumenting background jobs before the provider is initialized

## Related skills

- `aiwf-backend-dev-guidelines` - layered backend patterns
- `aiwf-route-tester` - exercise routes and observe captured errors
