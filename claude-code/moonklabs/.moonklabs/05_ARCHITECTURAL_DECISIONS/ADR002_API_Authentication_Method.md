# ADR 002: API Authentication Method (EXAMPLE)

## Status

Accepted

## Date

2023-07-08

## Context

Our API requires a secure authentication mechanism to identify users, protect resources, and control access to endpoints. We needed to select an approach that balances security, usability, and compatibility with our chosen tech stack.

**Note: This is an example Architecture Decision Record to demonstrate how ADRs might be structured in the AIWF framework.**

Several authentication strategies were considered:

- Session-based authentication with cookies
- JWT (JSON Web Tokens)
- OAuth 2.0
- API keys
- Combinations of the above

## Decision

We will use **JWT (JSON Web Tokens)** as our primary authentication method, with OAuth 2.0 support for social logins.

## Rationale

Our decision was based on the following factors:

1. **Statelessness**: JWTs are self-contained and don't require server-side session storage, aligning well with our API-first, potentially distributed architecture.

2. **Performance**: Token validation can happen without database lookups for each request, improving API response times.

3. **Cross-domain compatibility**: JWTs work well across different domains and in mobile applications, supporting our multi-client strategy.

4. **Security feature support**: JWTs support expiration, audience validation, and can be cryptographically signed to ensure integrity.

5. **OAuth Integration**: For social logins (Google, GitHub), we can still issue JWTs after OAuth authentication, maintaining a consistent authorization approach.

6. **Client-side storage**: JWTs can be securely stored in client-side mechanisms like localStorage or HTTP-only cookies, giving us flexibility in implementation.

7. **Industry standard**: JWT is widely adopted, well-documented, and has strong library support in our tech stack.

We acknowledged some concerns with JWT:

- Token revocation requires additional mechanisms (blacklisting or short expiration with refresh tokens)
- Token size can be larger than simple session IDs
- Token payload is encoded, not encrypted (sensitive data shouldn't be included)

## Alternatives Considered

### Session-based Authentication

Pros:

- Well-established, traditional approach
- Easy to implement and understand
- Simple to revoke (delete the session)

Cons:

- Requires session storage on the server
- Can be problematic in distributed/scaled environments
- Typically relies on cookies which have cross-domain limitations

### API Keys

Pros:

- Very simple to implement
- Good for service-to-service communication
- No expiration management needed

Cons:

- Not suitable for user authentication
- Limited granularity for permissions
- No built-in standard for claims or payload

## Consequences

### Positive

- Simplified server architecture with no session storage requirements
- Improved performance for authentication checks
- Enhanced cross-domain and mobile app support
- Ability to include standard claims (exp, iat, sub, etc.) in the token

### Negative

- Need to implement token refresh mechanism for long-lived sessions
- Need for a token blacklist/revocation strategy
- More complex client-side token management compared to cookies

### Neutral

- Need to carefully design token payload to balance size and information needs
- Will use short-lived access tokens (15 minutes) with longer-lived refresh tokens (7 days)
- Client applications must properly handle token storage and renewal

## Implementation Notes

- We will use the `jsonwebtoken` library for token creation and validation
- Tokens will be signed with RS256 (asymmetric) algorithm
- Access tokens will have a 15-minute expiration
- Refresh tokens will have a 7-day expiration and be single-use
- We will implement a token blacklist using Redis for immediate revocation when needed
- Social login (OAuth) will use Passport.js strategies
- Authentication middleware will validate tokens on protected routes

## Related Decisions

- ADR001: Chosen Database System
- ADR003: API Security Measures (pending)

## References

- [JWT.io](https://jwt.io/)
- [IETF RFC 7519 - JSON Web Token](https://tools.ietf.org/html/rfc7519)
- [Auth0: JWTs vs Sessions](https://auth0.com/blog/cookies-vs-tokens-definitive-guide/)
- [OWASP: JSON Web Token Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/JSON_Web_Token_for_Java_Cheat_Sheet.html)
