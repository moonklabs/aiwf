# API Specifications V1

This document provides detailed specifications for the API endpoints to be implemented in the backend.

## Base URL

All API endpoints are prefixed with: `/api/v1`

## Authentication

All authenticated endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

Common error codes:
- `UNAUTHORIZED`: Authentication required or invalid
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `VALIDATION_ERROR`: Request validation failed
- `INTERNAL_ERROR`: Server-side error

## Endpoints

### Authentication

#### POST /api/v1/auth/register

Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response (201 Created):**
```json
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-07-10T12:00:00Z"
  },
  "token": "jwt.token.here"
}
```

#### POST /api/v1/auth/login

Authenticate a user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response (200 OK):**
```json
{
  "user": {
    "id": "user123",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2023-07-10T12:00:00Z"
  },
  "token": "jwt.token.here"
}
```

### Users

#### GET /api/v1/users/me

Get current authenticated user profile.

**Response (200 OK):**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2023-07-10T12:00:00Z",
  "role": "user",
  "status": "active"
}
```

#### PUT /api/v1/users/me

Update current user profile.

**Request:**
```json
{
  "name": "John Smith",
  "avatar_url": "https://example.com/avatar.jpg"
}
```

**Response (200 OK):**
```json
{
  "id": "user123",
  "email": "user@example.com",
  "name": "John Smith",
  "avatar_url": "https://example.com/avatar.jpg",
  "created_at": "2023-07-10T12:00:00Z",
  "role": "user",
  "status": "active"
}
```

### Projects

#### GET /api/v1/projects

List all projects accessible to the authenticated user.

**Query Parameters:**
- `status` (optional): Filter by status (active, archived)
- `limit` (optional): Maximum number of results (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "total": 42,
  "data": [
    {
      "id": "proj123",
      "title": "Project Alpha",
      "description": "This is project alpha",
      "created_at": "2023-07-10T12:00:00Z",
      "owner": {
        "id": "user123",
        "name": "John Doe"
      },
      "status": "active"
    },
    ...
  ]
}
```

#### POST /api/v1/projects

Create a new project.

**Request:**
```json
{
  "title": "New Project",
  "description": "Description of the project"
}
```

**Response (201 Created):**
```json
{
  "id": "proj456",
  "title": "New Project",
  "description": "Description of the project",
  "created_at": "2023-07-15T14:30:00Z",
  "owner": {
    "id": "user123",
    "name": "John Doe"
  },
  "status": "active"
}
```

### Tasks

#### GET /api/v1/projects/:projectId/tasks

List tasks for a specific project.

**Query Parameters:**
- `status` (optional): Filter by status (todo, in_progress, done)
- `assigned_to` (optional): Filter by assigned user ID
- `limit` (optional): Maximum number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)

**Response (200 OK):**
```json
{
  "total": 24,
  "data": [
    {
      "id": "task123",
      "title": "Implement login page",
      "description": "Create the login page with email and password fields",
      "due_date": "2023-08-01T00:00:00Z",
      "status": "in_progress",
      "priority": "high",
      "assigned_to": {
        "id": "user123",
        "name": "John Doe"
      },
      "project_id": "proj123"
    },
    ...
  ]
}
```

## Rate Limiting

API requests are rate-limited to 100 requests per minute per user. When the limit is exceeded, the API will respond with status code 429 (Too Many Requests).
