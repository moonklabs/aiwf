# Amendment: Auth Flow Update (EXAMPLE)

## Date: 2023-05-17

## Overview

This amendment updates the authentication flow requirements to incorporate OAuth 2.0 support for social logins in addition to the existing email/password authentication.

**Note: This is an example amendment document to demonstrate how requirement changes might be tracked in the AIWF framework.**

## Changes to Product Requirements

### User Management (FR-1)

**Added Requirements:**

- FR-1.6: The system shall allow users to register and log in using Google OAuth
- FR-1.7: The system shall allow users to register and log in using GitHub OAuth
- FR-1.8: The system shall link social login accounts with existing email accounts when the email matches

### Data Models (FR-2)

**Updated FR-2.1 (User model):**

Add the following fields to the User model:

- `oauth_provider`: string (null, 'google', 'github')
- `oauth_id`: string (provider-specific user ID)

### API Endpoints (FR-3)

**Added Endpoints to FR-3.1:**

- GET /api/auth/oauth/google (Redirect URL for Google OAuth)
- GET /api/auth/oauth/github (Redirect URL for GitHub OAuth)
- GET /api/auth/oauth/callback (OAuth provider callback)

## Changes to Non-Functional Requirements

**Updated NFR-5:**

- NFR-5: The system shall implement JWT-based authentication with support for OAuth 2.0 providers

**Added NFR:**

- NFR-9: The system shall securely store OAuth provider credentials in environment variables

## Implementation Impact

- Required libraries: `passport`, `passport-google-oauth20`, `passport-github2`
- Additional environment variables needed:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
  - `GITHUB_CLIENT_ID`
  - `GITHUB_CLIENT_SECRET`
  - `OAUTH_CALLBACK_URL`

## Test Cases

- TC-1: User can log in with Google account
- TC-2: User can log in with GitHub account
- TC-3: Social login with matching email links to existing account
- TC-4: JWT token works correctly regardless of authentication method

## Timeline Impact

Implementation of these changes is expected to add 3 days to the original timeline.

## Approvals

- Requested by: Sarah Chen (Product Manager)
- Approved by: Mike Johnson (Technical Lead)
- Approved by: David Lee (Project Manager)
