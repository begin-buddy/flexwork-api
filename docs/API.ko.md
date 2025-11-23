# API 문서

[English](./API.md) | 한국어

NestJS Template 프로젝트의 API 엔드포인트를 설명합니다.

## 목차

- [개요](#개요)
- [인증](#인증)
- [사용자 API](#사용자-api)
- [헬스체크 API](#헬스체크-api)
- [에러 코드](#에러-코드)

## 개요

### Base URL

```
개발: http://localhost:3000
프로덕션: https://api.your-domain.com
```

### API 문서 (Swagger)

```
http://localhost:3000/api-docs
```

### 응답 형식

#### 성공 응답

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "홍길동",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### 에러 응답

```json
{
  "statusCode": 400,
  "message": "잘못된 요청입니다",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users"
}
```

### 헤더

#### 공통 헤더

```http
Content-Type: application/json
Accept-Language: ko-KR, en-US
```

#### 인증 헤더

```http
Authorization: Bearer {access_token}
```

## 인증

### 로그인

사용자 인증 및 JWT 토큰 발급

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
    "name": "홍길동"
  }
}
```

**Status Codes**:
- `200 OK`: 로그인 성공
- `401 Unauthorized`: 인증 실패
- `400 Bad Request`: 잘못된 요청

### 회원가입

새 사용자 등록

**Endpoint**: `POST /auth/register`

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "김철수"
}
```

**Validation Rules**:
- `email`: 유효한 이메일 형식, 중복 불가
- `password`: 최소 8자, 대소문자/숫자/특수문자 포함
- `name`: 2-50자

**Response**:
```json
{
  "id": 2,
  "email": "newuser@example.com",
  "name": "김철수",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `201 Created`: 회원가입 성공
- `400 Bad Request`: 유효성 검증 실패
- `409 Conflict`: 이메일 중복

## 사용자 API

### 사용자 목록 조회

전체 사용자 목록 조회 (페이지네이션)

**Endpoint**: `GET /users`

**Authentication**: Required

**Query Parameters**:
```
page: number = 1           # 페이지 번호
limit: number = 10         # 페이지당 항목 수
sort: string = 'createdAt' # 정렬 기준
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
      "name": "홍길동",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": 2,
      "email": "user2@example.com",
      "name": "김철수",
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
- `200 OK`: 조회 성공
- `401 Unauthorized`: 인증 필요

### 사용자 상세 조회

특정 사용자의 상세 정보 조회

**Endpoint**: `GET /users/:id`

**Authentication**: Required

**Path Parameters**:
- `id` (number): 사용자 ID

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
  "name": "홍길동",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

**Status Codes**:
- `200 OK`: 조회 성공
- `401 Unauthorized`: 인증 필요
- `404 Not Found`: 사용자 없음

### 사용자 생성

새 사용자 생성 (관리자 전용)

**Endpoint**: `POST /users`

**Authentication**: Required (Admin)

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "name": "이영희"
}
```

**Response**:
```json
{
  "id": 3,
  "email": "newuser@example.com",
  "name": "이영희",
  "createdAt": "2024-01-03T00:00:00.000Z"
}
```

**Status Codes**:
- `201 Created`: 생성 성공
- `400 Bad Request`: 유효성 검증 실패
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `409 Conflict`: 이메일 중복

### 사용자 수정

사용자 정보 수정

**Endpoint**: `PATCH /users/:id`

**Authentication**: Required

**Path Parameters**:
- `id` (number): 사용자 ID

**Request Body**:
```json
{
  "name": "홍길동(수정)",
  "email": "updated@example.com"
}
```

**Response**:
```json
{
  "id": 1,
  "email": "updated@example.com",
  "name": "홍길동(수정)",
  "updatedAt": "2024-01-04T00:00:00.000Z"
}
```

**Status Codes**:
- `200 OK`: 수정 성공
- `400 Bad Request`: 유효성 검증 실패
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 사용자 없음

### 사용자 삭제

사용자 삭제 (소프트 삭제)

**Endpoint**: `DELETE /users/:id`

**Authentication**: Required (Admin)

**Path Parameters**:
- `id` (number): 사용자 ID

**Response**:
```json
{
  "message": "사용자가 삭제되었습니다"
}
```

**Status Codes**:
- `200 OK`: 삭제 성공
- `401 Unauthorized`: 인증 필요
- `403 Forbidden`: 권한 없음
- `404 Not Found`: 사용자 없음

## 헬스체크 API

### 헬스체크

애플리케이션 상태 확인

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
- `200 OK`: 정상
- `503 Service Unavailable`: 비정상

## 에러 코드

### HTTP 상태 코드

| 코드 | 설명 |
|------|------|
| 200 | OK - 요청 성공 |
| 201 | Created - 리소스 생성 성공 |
| 400 | Bad Request - 잘못된 요청 |
| 401 | Unauthorized - 인증 필요 |
| 403 | Forbidden - 권한 없음 |
| 404 | Not Found - 리소스 없음 |
| 409 | Conflict - 리소스 충돌 |
| 422 | Unprocessable Entity - 유효성 검증 실패 |
| 429 | Too Many Requests - 요청 제한 초과 |
| 500 | Internal Server Error - 서버 오류 |
| 503 | Service Unavailable - 서비스 불가 |

### 비즈니스 에러 코드

```json
{
  "statusCode": 400,
  "message": "사용자를 찾을 수 없습니다",
  "error": "USER_NOT_FOUND",
  "code": "E1001"
}
```

| 코드 | 에러 | 설명 |
|------|------|------|
| E1001 | USER_NOT_FOUND | 사용자를 찾을 수 없음 |
| E1002 | EMAIL_ALREADY_EXISTS | 이메일 중복 |
| E1003 | INVALID_CREDENTIALS | 잘못된 인증 정보 |
| E2001 | INVALID_TOKEN | 유효하지 않은 토큰 |
| E2002 | TOKEN_EXPIRED | 토큰 만료 |
| E3001 | VALIDATION_ERROR | 유효성 검증 실패 |

## Rate Limiting

API는 요청 속도 제한을 적용합니다:

- **기본 제한**: 60 requests/minute
- **인증된 사용자**: 120 requests/minute
- **관리자**: 제한 없음

**Rate Limit 헤더**:
```http
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 59
X-RateLimit-Reset: 1609459200
```

**제한 초과 시 응답**:
```json
{
  "statusCode": 429,
  "message": "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  "error": "Too Many Requests"
}
```

## 국제화 (i18n)

API는 다국어를 지원합니다.

**지원 언어**:
- `ko-KR`: 한국어 (기본)
- `en-US`: 영어

**사용 방법**:
```http
Accept-Language: ko-KR
```

**응답 예시**:
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

## 예제

### cURL

```bash
# 로그인
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# 사용자 목록 조회
curl -X GET http://localhost:3000/users \
  -H "Authorization: Bearer {token}"

# 사용자 생성
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"email":"new@example.com","password":"pass123","name":"홍길동"}'
```

### JavaScript (Fetch)

```javascript
// 로그인
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

// 사용자 목록 조회
const getUsers = async (token) => {
  const response = await fetch('http://localhost:3000/users', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });
  return response.json();
};
```

## 참고 자료

- [Swagger UI](http://localhost:3000/api-docs)
- [OpenAPI Specification](https://swagger.io/specification/)
