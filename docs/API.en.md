# API Documentation

[English](./API.en.md) | [한국어](./API.md)

This document describes the API endpoints of the NestJS Template project.

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
- [User API](#user-api)
- [Health Check API](#health-check-api)
- [Error Codes](#error-codes)

## Overview

### Base URL

```
Development: http://localhost:3000
Production: https://api.your-domain.com
```

### API Documentation (Swagger)

```
http://localhost:3000/api-docs
```

### Response Format

#### Success Response

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### Error Response

```json
{
  "statusCode": 400,
  "message": "Bad request",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users"
}
```

### Headers

#### Common Headers

```http
Content-Type: application/json
Accept-Language: ko-KR, en-US
```

#### Authentication Header

```http
Authorization: Bearer {access_token}
```

## Authentication

### Login

User authentication and JWT token issuance

**Endpoint**: `POST /auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response**:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "name": "John Doe"
  }
}
```

**Status Codes**:
- `200 OK`: Login successful
- `401 Unauthorized`: Authentication failed
- `400 Bad Request`: Invalid request

### Register

New user registration

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Jane Smith"
}
```

**Validation Rules**:
- `email`: Valid email format, must be unique
- `password`: Minimum 8 characters, must include uppercase/lowercase/numbers/special characters
- `name`: 2-50 characters

**Response**:
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "name": "Jane Smith",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `201 Created`: Registration successful
- `400 Bad Request`: Validation failed
- `409 Conflict`: Email already exists

## User API

### List Users

Retrieve list of all users (with pagination)

**Endpoint**: `GET /users`

**Authentication**: Required

**Query Parameters**:
```
page: number = 1           # Page number
limit: number = 10         # Items per page
sort: string = 'createdAt' # Sort field
order: 'ASC' | 'DESC' = 'DESC'
```

**Request Example**:
```http
GET /users?page=1&limit=20&sort=name&order=ASC
Authorization: Bearer {token}
```

**Response**:
```json
{
  "data": [
    {
      "id": 1,
      "email": "user1@example.com",
      "name": "John Doe",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "email": "user2@example.com",
      "name": "Jane Smith",
      "createdAt": "2024-01-02T00:00:00.000Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5
  }
}
```

**Status Codes**:
- `200 OK`: Query successful
- `401 Unauthorized`: Authentication required

### Get User Details

Retrieve detailed information of a specific user

**Endpoint**: `GET /users/:id`

**Authentication**: Required

**Path Parameters**:
- `id` (number): User ID

**Request Example**:
```http
GET /users/1
Authorization: Bearer {token}
```

**Response**:
```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `200 OK`: Query successful
- `401 Unauthorized`: Authentication required
- `404 Not Found`: User not found

### Create User

Create new user (Admin only)

**Endpoint**: `POST /users`

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "Bob Johnson"
}
```

**Response**:
```json
{
  "id": 3,
  "email": "newuser@example.com",
  "name": "Bob Johnson",
  "createdAt": "2024-01-03T00:00:00.000Z"
}
```

**Status Codes**:
- `201 Created`: Creation successful
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `409 Conflict`: Email already exists

### Update User

Update user information

**Endpoint**: `PATCH /users/:id`

**Authentication**: Required

**Path Parameters**:
- `id` (number): User ID

**Request Body**:
```json
{
  "name": "John Doe (Updated)",
  "email": "updated@example.com"
}
```

**Response**:
```json
{
  "id": 1,
  "email": "updated@example.com",
  "name": "John Doe (Updated)",
  "updatedAt": "2024-01-04T00:00:00.000Z"
}
```

**Status Codes**:
- `200 OK`: Update successful
- `400 Bad Request`: Validation failed
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

### Delete User

Delete user (soft delete)

**Endpoint**: `DELETE /users/:id`

**Authentication**: Required (Admin)

**Path Parameters**:
- `id` (number): User ID

**Response**:
```json
{
  "message": "User has been deleted"
}
```

**Status Codes**:
- `200 OK`: Deletion successful
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: User not found

## Health Check API

### Health Check

Check application status

**Endpoint**: `GET /health`

**Authentication**: Not Required

**Response**:
```json
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  },
  "error": {},
  "details": {
    "database": {
      "status": "up"
    }
  }
}
```

**Status Codes**:
- `200 OK`: Normal
- `503 Service Unavailable`: Abnormal

## Error Codes

### HTTP Status Codes

| Code | Description |
|------|------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource not found |
| 409 | Conflict - Resource conflict |
| 422 | Unprocessable Entity - Validation failed |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - Service unavailable |

### Business Error Codes

```json
{
  "statusCode": 400,
  "message": "User not found",
  "error": "USER_NOT_FOUND",
  "code": "E1001"
}
```

| Code | Error | Description |
|------|------|------|
| E1001 | USER_NOT_FOUND | User not found |
| E1002 | EMAIL_ALREADY_EXISTS | Email already exists |
| E1003 | INVALID_CREDENTIALS | Invalid credentials |
| E2001 | INVALID_TOKEN | Invalid token |
| E2002 | TOKEN_EXPIRED | Token expired |
| E3001 | VALIDATION_ERROR | Validation failed |

## Rate Limiting

API applies request rate limiting:

- **Default limit**: 60 requests/minute
- **Authenticated users**: 120 requests/minute
- **Administrators**: No limit

**Rate Limit Headers**:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1609459200
```

**Response when limit exceeded**:
```json
{
  "statusCode": 429,
  "message": "Too many requests. Please try again later.",
  "error": "Too Many Requests"
}
```

## Internationalization (i18n)

API supports multiple languages.

**Supported Languages**:
- `ko-KR`: Korean (default)
- `en-US`: English

**Usage**:
```http
Accept-Language: ko-KR
```

**Response Example**:
```json
{
  "message": "사용자를 찾을 수 없습니다"
}
```

```http
Accept-Language: en-US
```

```json
{
  "message": "User not found"
}
```

## Examples

### cURL

```bash
# Login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# List users
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer {token}"

# Create user
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"pass123","name":"John Doe"}'
```

### JavaScript (Fetch)

```javascript
// Login
const login = async () => {
  const response = await fetch('http://localhost:3000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: 'user@example.com',
      password: 'password123',
    }),
  });
  const data = await response.json();
  return data.accessToken;
};

// Get users
const getUsers = async (token) => {
  const response = await fetch('http://localhost:3000/users', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## References

- [Swagger UI](http://localhost:3000/api-docs)
- [OpenAPI Specification](https://swagger.io/specification/)
