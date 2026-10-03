---
name: aiwf-route-tester
description: Exercise and validate HTTP routes and API endpoints by discovering the host project's own authentication, credentials, running services, and test harness. Use when verifying a new or changed endpoint, debugging authentication failures (401/403), or checking request and response behavior. Reuse the project's existing auth and tests; never rely on hardcoded credentials or an assumed development bypass.
---

# Route Tester

## How to use this skill

This skill helps you exercise real routes against a running instance of the host project. It assumes nothing about the project's auth scheme, ports, prefixes, or test scripts. Discover those first, then use the project's own mechanisms.

## Step 1: Discover the project surface

1. Find the service or services and their start scripts in the package manifest or workspace config.
2. Find each service's base URL and port from config files, an example env file (`.env.example`), framework defaults, or the dev server output.
3. Find route registration (the app or bootstrap file, router modules, or framework conventions) to learn the route prefixes.
4. Identify the authentication scheme: bearer token, cookie, session, API key, OAuth/OIDC, or none. Read the auth middleware and any existing auth helper.
5. Find how the project obtains credentials for tests: fixtures, seed data, a token helper script, a test user created by migrations, or documented environment variables. Use that source; never invent credentials.
6. Find the project's existing test tooling (unit and integration suites, HTTP client helpers, `.http` files, Postman or Bruno collections, curl scripts). Prefer running or extending those over hand-rolled requests.

## Step 2: Choose an approach

- If an integration or end-to-end test covers the route, run it first.
- If the project ships a helper that authenticates requests, use it.
- Otherwise issue a direct HTTP request using the project's own credential mechanism.
- Only if the project documents a development-only auth bypass, and only outside production, may you use it. Confirm the bypass exists in the code; do not assume one.

## Step 3: Exercise the route

Fill in the template below with values you discovered. Replace every placeholder with a real, project-specific value.

```bash
# METHOD, URL, HEADERS, and BODY come from the discovered route + auth scheme.
curl -i -X <METHOD> "<BASE_URL><PREFIX><PATH>" \
  -H "<AUTH_HEADER>: <CREDENTIAL_FROM_PROJECT>" \
  -H "Content-Type: application/json" \
  -d '<REQUEST_BODY>'
```

If the project uses cookies, capture and reuse the project's own cookie (for example via a cookie jar from a login call the project already supports) rather than fabricating one.

## Step 4: Verify

- Response status and body shape match expectations.
- Any data change is confirmed through the project's own query path (its client, ORM, or an existing script), not an ad hoc connection string.
- Failures surface through the project's configured error-tracking provider.

## Debugging 401 Unauthorized

- Credential or session expired: regenerate it with the project's helper.
- Wrong header or cookie name: re-read the auth middleware.
- Issuer or secret mismatch: compare the running service config with the token source.
- Auth provider not running: start it the way the project documents.

## Debugging 403 Forbidden

- The principal lacks a required role or permission: check the project's authorization rules and use a test fixture that actually has the role.
- Route or resource permissions are misconfigured: inspect the guard or policy code.

## Debugging 404 Not Found

- URL is wrong or missing a route prefix: re-check route registration.
- Route is not registered or the service is not running: verify both.

## Debugging 500 Internal Server Error

- Check the service logs and the configured error-tracking provider.
- Verify the request body matches the expected schema.
- Check database or dependency connectivity.

## Testing checklist

- [ ] Service identified and confirmed running
- [ ] Base URL and port confirmed from project config
- [ ] Route prefix confirmed from route registration
- [ ] Full URL constructed from base URL + prefix + path
- [ ] Request body prepared for POST/PUT/PATCH
- [ ] Credentials obtained from the project's own source
- [ ] Request sent, status and body verified
- [ ] Data change verified through the project's query path (if applicable)

## Do not

- Do not hardcode usernames, passwords, tokens, DSNs, or secrets in the skill or the commands.
- Do not assume a mock-auth header or development bypass exists.
- Do not reference files outside the project, such as scripts under another user's home directory.
- Do not modify production data; use a test environment.

## Related skills

- `aiwf-error-tracking` - confirm errors are captured after a failing call
- `aiwf-backend-dev-guidelines` - layered route and controller patterns
