# jest-swagger 테스트 가이드

> Jest 테스트로 Swagger/OpenAPI 문서를 자동 생성하는 완벽 가이드

## 목차

- [개요](#개요)
- [프로젝트 설정](#프로젝트-설정)
- [기본 테스트 작성](#기본-테스트-작성)
- [데코레이터 활용법](#데코레이터-활용법)
- [E2E 테스트 패턴](#e2e-테스트-패턴)
- [테스트 유틸리티](#테스트-유틸리티)
- [실전 예제](#실전-예제)
- [고급 기능](#고급-기능)
- [문제 해결](#문제-해결)

---

## 개요

### jest-swagger란?

`jest-swagger`는 Jest 테스트 코드에서 Swagger/OpenAPI 문서를 자동으로 생성하는 TypeScript 라이브러리입니다. 테스트를 작성하면서 동시에 API 문서가 만들어지므로, 문서와 코드가 항상 동기화됩니다.

### 핵심 개념

```
테스트 작성 (데코레이터 추가)
    ↓
Jest 실행
    ↓
SwaggerReporter가 메타데이터 수집
    ↓
OpenAPI 문서 자동 생성 (YAML/JSON)
```

### 주요 장점

- **테스트 = 문서**: 테스트 코드가 곧 API 문서가 됩니다
- **자동 동기화**: 코드 변경 시 문서도 자동 업데이트
- **실제 응답 활용**: E2E 테스트의 실제 HTTP 응답을 문서에 포함
- **타입 안전성**: TypeScript로 작성되어 컴파일 타임에 오류 검출

### test 디렉토리 구조

```
test/
├── CLAUDE.md                  # 이 문서
├── app.e2e-spec.ts            # E2E 테스트 예제
├── setup.ts                   # 테스트 전역 설정
├── utils/                     # 테스트 유틸리티
│   ├── test-module.builder.ts # 테스트 모듈 생성 헬퍼
│   ├── factory-helper.ts      # 팩토리 헬퍼
│   └── index.ts
├── factories/                 # 테스트 데이터 팩토리
│   ├── user.factory.ts        # 사용자 팩토리 (Fishery)
│   ├── post.factory.ts
│   └── index.ts
└── fixtures/                  # 정적 테스트 데이터
    ├── users.fixture.ts       # 고정된 사용자 데이터
    └── index.ts
```

---

## 프로젝트 설정

### 1. 필수 요구사항

- Node.js >= 16.0.0
- TypeScript >= 5.0.0
- Jest >= 29.0.0
- NestJS (선택적, 프레임워크 통합 시)

### 2. TypeScript 설정

프로젝트의 `tsconfig.json`에 데코레이터 지원이 활성화되어 있어야 합니다:

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

**현재 프로젝트 상태**: ✅ 이미 설정되어 있음 (`experimentalDecorators: true`)

### 3. Jest 설정

`jest.config.js`에 다음 설정이 필요합니다:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',

  // TypeScript 변환 설정
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    }],
  },

  // SwaggerReporter 설정 (문서 자동 생성)
  reporters: [
    'default',
    [
      'jest-swagger/dist/reporters',
      {
        outputDir: './docs',           // 문서 출력 디렉토리
        filename: 'openapi',           // 파일명 (openapi.yaml)
        format: 'yaml',                // yaml 또는 json
        multiFormat: true,             // YAML + JSON 모두 생성
        printPath: true,               // 생성 경로 출력
        printStats: true,              // 통계 정보 출력
        validate: true,                // OpenAPI 스펙 검증
      },
    ],
  ],
};
```

**현재 프로젝트 상태**:
- ✅ `ts-jest` 설정 완료
- ⚠️ `SwaggerReporter` 미설정 (필요 시 추가)

### 4. SwaggerReporter 옵션 상세

| 옵션 | 타입 | 기본값 | 설명 |
|------|------|--------|------|
| `outputDir` | string | `'./docs'` | 문서 출력 디렉토리 |
| `filename` | string | `'openapi'` | 파일명 (확장자 제외) |
| `format` | `'json' \| 'yaml'` | `'yaml'` | 출력 포맷 |
| `multiFormat` | boolean | `false` | JSON과 YAML 모두 생성 |
| `pretty` | boolean | `true` | 보기 좋게 포맷팅 |
| `indent` | number | `2` | 들여쓰기 공백 수 |
| `printPath` | boolean | `true` | 생성 경로 콘솔 출력 |
| `printStats` | boolean | `false` | 문서 통계 출력 |
| `validate` | boolean | `true` | OpenAPI 스펙 검증 |
| `includeFailedTests` | boolean | `false` | 실패한 테스트 포함 |
| `includeSkippedTests` | boolean | `false` | 스킵된 테스트 포함 |

---

## 기본 테스트 작성

### 1. 데코레이터 import

```typescript
import {
  api,
  path,
  response,
  query,
  pathParam,
  body,
  header,
  cookie,
} from 'jest-swagger';
```

### 2. 기본 GET 엔드포인트

```typescript
import { api, path, response } from 'jest-swagger';

describe('사용자 API', () => {
  @api({
    tags: ['users'],                          // Swagger 태그 (그룹화)
    summary: '사용자 조회',                    // 간단한 설명
    description: 'ID로 특정 사용자를 조회합니다.'  // 상세 설명
  })
  @path('get', '/users/{id}')                 // HTTP 메서드 + 경로
  @response(200, {                            // 응답 정의
    description: '성공',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
            email: { type: 'string', format: 'email' }
          }
        }
      }
    }
  })
  test('ID로 사용자를 조회할 수 있어야 함', async () => {
    // 실제 테스트 로직
    const userId = 1;
    const response = await fetch(`/api/users/${userId}`);

    expect(response.status).toBe(200);
    // 추가 검증...
  });
});
```

### 3. POST 요청 (생성)

```typescript
describe('사용자 API', () => {
  @api({
    tags: ['users'],
    summary: '사용자 생성'
  })
  @path('post', '/users')
  @body({                                    // 요청 본문 정의
    description: '사용자 생성 정보',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['name', 'email'],       // 필수 필드
          properties: {
            name: {
              type: 'string',
              minLength: 2,
              maxLength: 50
            },
            email: {
              type: 'string',
              format: 'email'
            },
            age: {
              type: 'number',
              minimum: 1,
              maximum: 120
            }
          }
        }
      }
    }
  })
  @response(201, {                           // 201 Created
    description: '사용자가 성공적으로 생성됨'
  })
  @response(400, {                           // 400 Bad Request
    description: '잘못된 요청 데이터'
  })
  test('새로운 사용자를 생성할 수 있어야 함', async () => {
    const newUser = {
      name: '홍길동',
      email: 'hong@example.com',
      age: 30
    };

    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUser)
    });

    expect(response.status).toBe(201);
  });
});
```

### 4. 쿼리 파라미터 (페이지네이션)

```typescript
describe('사용자 API', () => {
  @api({
    tags: ['users'],
    summary: '사용자 목록 조회'
  })
  @path('get', '/users')
  @query({                                   // 쿼리 파라미터
    name: 'page',
    description: '페이지 번호',
    required: false,                         // 선택적 파라미터
    schema: {
      type: 'number',
      minimum: 1,
      default: 1
    }
  })
  @query({
    name: 'limit',
    description: '페이지 당 항목 수',
    required: false,
    schema: {
      type: 'number',
      minimum: 1,
      maximum: 100,
      default: 10
    }
  })
  @response(200, {
    description: '성공',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' }
                }
              }
            },
            meta: {
              type: 'object',
              properties: {
                total: { type: 'number' },
                page: { type: 'number' },
                limit: { type: 'number' }
              }
            }
          }
        }
      }
    }
  })
  test('페이지네이션된 사용자 목록을 조회할 수 있어야 함', async () => {
    const response = await fetch('/api/users?page=1&limit=10');

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(data).toHaveProperty('meta');
  });
});
```

---

## 데코레이터 활용법

### 1. @api() - 기본 정보

API 엔드포인트의 기본 메타데이터를 정의합니다.

```typescript
@api({
  tags: ['users', 'admin'],           // 여러 태그 지정 가능
  summary: '사용자 조회',              // 한 줄 요약
  description: '상세한 설명...',       // 상세 설명
  operationId: 'getUserById',         // 고유 식별자 (선택)
  deprecated: false                   // 사용 중단 여부 (선택)
})
```

### 2. @path() - HTTP 메서드 및 경로

```typescript
@path('get', '/users/{id}')          // GET /users/{id}
@path('post', '/users')              // POST /users
@path('put', '/users/{id}')          // PUT /users/{id}
@path('patch', '/users/{id}')        // PATCH /users/{id}
@path('delete', '/users/{id}')       // DELETE /users/{id}
```

### 3. @pathParam() - 경로 파라미터

```typescript
@pathParam({
  name: 'id',                         // 파라미터 이름
  description: '사용자 ID',
  required: true,                     // 경로 파라미터는 항상 필수
  schema: {
    type: 'number',
    example: 1                        // 예제 값
  }
})
```

### 4. @query() - 쿼리 파라미터

```typescript
@query({
  name: 'filter',
  description: '필터 조건',
  required: false,
  schema: {
    type: 'string',
    enum: ['active', 'inactive', 'all'],  // 허용 값 제한
    default: 'all'
  }
})
```

### 5. @header() - 헤더 파라미터

```typescript
@header({
  name: 'Authorization',
  description: 'Bearer 토큰',
  required: true,
  schema: {
    type: 'string',
    pattern: '^Bearer .+$',           // 정규식 패턴
    example: 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
  }
})
```

### 6. @cookie() - 쿠키 파라미터

```typescript
@cookie({
  name: 'session',
  description: '세션 ID',
  required: false,
  schema: {
    type: 'string'
  }
})
```

### 7. @body() - 요청 본문

```typescript
@body({
  description: '요청 본문 설명',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        required: ['name', 'email'],
        properties: {
          name: {
            type: 'string',
            minLength: 2,
            maxLength: 50
          },
          email: {
            type: 'string',
            format: 'email'
          }
        }
      },
      example: {                      // 예제 데이터
        name: '홍길동',
        email: 'hong@example.com'
      }
    }
  }
})
```

### 8. @response() - 응답 정의

```typescript
// 성공 응답
@response(200, {
  description: '성공',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' }
        }
      },
      example: {
        id: 1,
        name: '홍길동'
      }
    }
  }
})

// 에러 응답
@response(404, {
  description: '사용자를 찾을 수 없음',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          statusCode: { type: 'number' },
          message: { type: 'string' }
        }
      }
    }
  }
})

// 여러 응답 정의 가능
@response(200, { /* ... */ })
@response(400, { /* ... */ })
@response(404, { /* ... */ })
@response(500, { /* ... */ })
```

---

## E2E 테스트 패턴

### 1. NestJS E2E 테스트 기본 구조

`test/app.e2e-spec.ts`를 참고하여 E2E 테스트를 작성합니다:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { api, path, response } from 'jest-swagger';

describe('UserController (e2e)', () => {
  let app: INestApplication;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    // 테스트 모듈 생성
    moduleFixture = await Test.createTestingModule({
      imports: [
        // 필요한 모듈들 import
        UserModule,
        ConfigModule.forRoot({ /* ... */ }),
      ],
    }).compile();

    app = moduleFixture.createNestApplication();

    // 전역 파이프 설정 (프로덕션 환경과 동일하게)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // 테스트 케이스들...
});
```

### 2. CRUD 테스트 + 문서화

```typescript
describe('UserController (e2e)', () => {
  // ... beforeAll, afterAll ...

  describe('POST /users', () => {
    @api({
      tags: ['users'],
      summary: '사용자 생성'
    })
    @path('post', '/users')
    @body({
      description: '사용자 생성 데이터',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          }
        }
      }
    })
    @response(201, {
      description: '생성 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          }
        }
      }
    })
    @response(400, {
      description: '잘못된 요청'
    })
    test('사용자를 생성할 수 있어야 함', async () => {
      const createDto = {
        name: '홍길동',
        email: 'hong@example.com'
      };

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(createDto)
        .expect(201);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe(createDto.name);
      expect(response.body.data.email).toBe(createDto.email);
    });

    test('잘못된 이메일 형식은 거부되어야 함', async () => {
      const invalidDto = {
        name: '홍길동',
        email: 'invalid-email'  // 잘못된 형식
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /users', () => {
    @api({
      tags: ['users'],
      summary: '사용자 목록 조회'
    })
    @path('get', '/users')
    @query({
      name: 'page',
      schema: { type: 'number', default: 1 }
    })
    @query({
      name: 'limit',
      schema: { type: 'number', default: 10 }
    })
    @response(200, {
      description: '조회 성공'
    })
    test('페이지네이션된 사용자 목록을 조회할 수 있어야 함', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body).toHaveProperty('meta');
    });
  });

  describe('GET /users/:id', () => {
    @api({
      tags: ['users'],
      summary: '특정 사용자 조회'
    })
    @path('get', '/users/{id}')
    @pathParam({
      name: 'id',
      schema: { type: 'number' }
    })
    @response(200, {
      description: '조회 성공'
    })
    @response(404, {
      description: '사용자를 찾을 수 없음'
    })
    test('ID로 사용자를 조회할 수 있어야 함', async () => {
      const userId = 1;

      const response = await request(app.getHttpServer())
        .get(`/users/${userId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', userId);
    });

    test('존재하지 않는 사용자 조회 시 404 반환', async () => {
      const nonExistentId = 99999;

      await request(app.getHttpServer())
        .get(`/users/${nonExistentId}`)
        .expect(404);
    });
  });

  describe('PATCH /users/:id', () => {
    @api({
      tags: ['users'],
      summary: '사용자 수정'
    })
    @path('patch', '/users/{id}')
    @pathParam({
      name: 'id',
      schema: { type: 'number' }
    })
    @body({
      description: '수정할 데이터',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              email: { type: 'string', format: 'email' }
            }
          }
        }
      }
    })
    @response(200, {
      description: '수정 성공'
    })
    @response(404, {
      description: '사용자를 찾을 수 없음'
    })
    test('사용자 정보를 수정할 수 있어야 함', async () => {
      const userId = 1;
      const updateDto = {
        name: '김철수'
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${userId}`)
        .send(updateDto)
        .expect(200);

      expect(response.body.data.name).toBe(updateDto.name);
    });
  });

  describe('DELETE /users/:id', () => {
    @api({
      tags: ['users'],
      summary: '사용자 삭제'
    })
    @path('delete', '/users/{id}')
    @pathParam({
      name: 'id',
      schema: { type: 'number' }
    })
    @response(204, {
      description: '삭제 성공'
    })
    @response(404, {
      description: '사용자를 찾을 수 없음'
    })
    test('사용자를 삭제할 수 있어야 함', async () => {
      const userId = 1;

      await request(app.getHttpServer())
        .delete(`/users/${userId}`)
        .expect(204);
    });
  });
});
```

### 3. 실제 HTTP 응답 캡처

`CaptureResponse` 데코레이터를 사용하여 실제 응답을 자동으로 캡처할 수 있습니다:

```typescript
import { api, path, CaptureResponse } from 'jest-swagger';

describe('UserController (e2e)', () => {
  @api({
    tags: ['users'],
    summary: '사용자 조회'
  })
  @path('get', '/users/{id}')
  @CaptureResponse({
    statusCode: 200,
    autoInferSchema: true,    // 응답에서 스키마 자동 추론
    validateSchema: false     // 스키마 검증 비활성화
  })
  test('실제 응답을 캡처하여 문서화', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/1')
      .expect(200);

    // 응답이 자동으로 캡처되어 OpenAPI 문서에 포함됨
    expect(response.body).toHaveProperty('data');
  });
});
```

---

## 테스트 유틸리티

### 1. test/utils/test-module.builder.ts

테스트 모듈을 쉽게 생성할 수 있는 헬퍼 함수들입니다.

#### createTestingModule

```typescript
import { createTestingModule } from '@test/utils';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';

describe('UserService', () => {
  it('모킹된 리포지토리로 테스트', async () => {
    const module = await createTestingModule({
      providers: [UserService],
      mocks: [UserRepository],  // 자동으로 모든 메서드 모킹
    });

    const service = module.get(UserService);
    const repository = module.get(UserRepository);

    // repository의 모든 메서드가 jest.fn()으로 모킹됨
    repository.findOne.mockResolvedValue({ id: 1, name: '홍길동' });

    const result = await service.findOne(1);
    expect(result).toEqual({ id: 1, name: '홍길동' });
  });
});
```

#### createMockRepository

TypeORM 스타일 리포지토리를 모킹합니다:

```typescript
import { createMockRepository } from '@test/utils';

describe('UserService', () => {
  it('리포지토리 모킹', () => {
    const mockRepository = createMockRepository();

    // 모든 주요 메서드가 jest.fn()으로 제공됨
    mockRepository.find.mockResolvedValue([]);
    mockRepository.findOne.mockResolvedValue(null);
    mockRepository.save.mockResolvedValue({ id: 1 });
  });
});
```

#### createMockService

서비스를 모킹합니다:

```typescript
import { createMockService } from '@test/utils';

describe('UserController', () => {
  it('서비스 모킹', () => {
    const mockService = createMockService<UserService>([
      'findAll',
      'findOne',
      'create',
      'update',
      'remove'
    ]);

    mockService.findAll.mockResolvedValue([]);
    mockService.findOne.mockResolvedValue({ id: 1, name: '홍길동' });
  });
});
```

### 2. test/factories (Fishery 팩토리)

동적으로 테스트 데이터를 생성하는 팩토리 패턴입니다.

#### 기본 사용법

```typescript
import { userFactory } from '@test/factories';

describe('User 테스트', () => {
  it('랜덤 사용자 생성', () => {
    // 기본 사용자 생성
    const user = userFactory.build();

    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('name');
    expect(user).toHaveProperty('email');
  });

  it('특정 속성 오버라이드', () => {
    // 특정 속성만 지정
    const admin = userFactory.build({
      email: 'admin@example.com',
      isActive: true
    });

    expect(admin.email).toBe('admin@example.com');
    expect(admin.isActive).toBe(true);
  });

  it('여러 사용자 생성', () => {
    // 10명의 사용자 생성
    const users = userFactory.buildList(10);

    expect(users).toHaveLength(10);
    expect(users[0]).toHaveProperty('id');
  });

  it('트랜지언트 파라미터 사용', () => {
    // 젊은 사용자 (18-30세)
    const youngUser = userFactory.build({}, {
      transient: { isYoung: true }
    });

    expect(youngUser.age).toBeGreaterThanOrEqual(18);
    expect(youngUser.age).toBeLessThanOrEqual(30);
  });
});
```

#### 팩토리 확장

```typescript
// test/factories/user.factory.ts에서 제공하는 확장 팩토리들

import { adminUserFactory, inactiveUserFactory } from '@test/factories';

describe('User 테스트', () => {
  it('관리자 사용자', () => {
    const admin = adminUserFactory.build();

    expect(admin.isActive).toBe(true);
    expect(admin.email).toContain('admin.example.com');
  });

  it('비활성 사용자', () => {
    const inactive = inactiveUserFactory.build();

    expect(inactive.isActive).toBe(false);
  });
});
```

#### E2E 테스트에서 팩토리 활용

```typescript
import { userFactory } from '@test/factories';
import request from 'supertest';
import { api, path, body, response } from 'jest-swagger';

describe('UserController (e2e)', () => {
  @api({ tags: ['users'], summary: '사용자 생성' })
  @path('post', '/users')
  @body({ /* ... */ })
  @response(201, { /* ... */ })
  test('팩토리로 생성한 데이터로 테스트', async () => {
    // 팩토리로 테스트 데이터 생성
    const userData = userFactory.build({
      id: undefined,  // API에서 생성될 것이므로 제외
    });

    const response = await request(app.getHttpServer())
      .post('/users')
      .send(userData)
      .expect(201);

    expect(response.body.data).toMatchObject({
      name: userData.name,
      email: userData.email,
    });
  });
});
```

### 3. test/fixtures (정적 데이터)

고정된 테스트 데이터로, 특정 시나리오에서 재사용합니다.

```typescript
import { ADMIN_USER, REGULAR_USER, INACTIVE_USER, TEST_USERS } from '@test/fixtures';

describe('User 테스트', () => {
  it('관리자 계정 테스트', () => {
    // 항상 동일한 관리자 데이터
    expect(ADMIN_USER.email).toBe('admin@example.com');
    expect(ADMIN_USER.id).toBe('00000000-0000-0000-0000-000000000001');
  });

  it('일반 사용자 테스트', () => {
    expect(REGULAR_USER.email).toBe('user@example.com');
  });

  it('비활성 사용자 테스트', () => {
    expect(INACTIVE_USER.isActive).toBe(false);
  });

  it('여러 사용자 목록 테스트', () => {
    // 3명의 고정 사용자
    expect(TEST_USERS).toHaveLength(3);
  });
});
```

#### 팩토리 vs 픽스처 선택 가이드

| 상황 | 사용 도구 | 이유 |
|------|----------|------|
| 랜덤 데이터 필요 | Factory | 다양한 케이스 테스트 |
| 고정 데이터 필요 | Fixture | 일관된 결과 보장 |
| 대량 데이터 필요 | Factory | `buildList(100)` 간편 |
| 특정 시나리오 재현 | Fixture | 정확한 재현성 |
| 엣지 케이스 테스트 | Fixture | 특수한 값 사용 |
| 통합 테스트 | Fixture | 환경 일관성 |

---

## 실전 예제

### 1. User CRUD 완전 예제

```typescript
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { api, path, query, pathParam, body, response } from 'jest-swagger';
import { userFactory } from '@test/factories';

describe('User CRUD (e2e)', () => {
  let app: INestApplication;
  let createdUserId: number;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      // ... 모듈 설정
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // CREATE
  describe('POST /users', () => {
    @api({
      tags: ['users'],
      summary: '사용자 생성',
      description: '새로운 사용자를 생성합니다.'
    })
    @path('post', '/users')
    @body({
      description: '사용자 생성 데이터',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            required: ['name', 'email'],
            properties: {
              name: {
                type: 'string',
                minLength: 2,
                maxLength: 50,
                example: '홍길동'
              },
              email: {
                type: 'string',
                format: 'email',
                example: 'hong@example.com'
              },
              age: {
                type: 'number',
                minimum: 1,
                maximum: 120,
                example: 30
              }
            }
          }
        }
      }
    })
    @response(201, {
      description: '생성 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  age: { type: 'number' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    })
    @response(400, {
      description: '잘못된 요청 데이터',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              message: { type: 'array', items: { type: 'string' } },
              error: { type: 'string' }
            }
          }
        }
      }
    })
    test('사용자를 생성할 수 있어야 함', async () => {
      const userData = userFactory.build({
        id: undefined,  // 서버에서 생성
      });

      const response = await request(app.getHttpServer())
        .post('/users')
        .send(userData)
        .expect(201);

      createdUserId = response.body.data.id;

      expect(response.body.data).toMatchObject({
        name: userData.name,
        email: userData.email,
      });
      expect(response.body.data.id).toBeDefined();
      expect(response.body.message).toBeDefined();
    });

    test('필수 필드 누락 시 400 에러', async () => {
      const invalidData = {
        name: '홍길동'
        // email 누락
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidData)
        .expect(400);
    });

    test('잘못된 이메일 형식은 거부', async () => {
      const invalidData = {
        name: '홍길동',
        email: 'invalid-email'
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(invalidData)
        .expect(400);
    });
  });

  // READ (List)
  describe('GET /users', () => {
    @api({
      tags: ['users'],
      summary: '사용자 목록 조회',
      description: '페이지네이션을 지원하는 사용자 목록 조회입니다.'
    })
    @path('get', '/users')
    @query({
      name: 'page',
      description: '페이지 번호 (1부터 시작)',
      required: false,
      schema: { type: 'number', minimum: 1, default: 1 }
    })
    @query({
      name: 'limit',
      description: '페이지 당 항목 수',
      required: false,
      schema: { type: 'number', minimum: 1, maximum: 100, default: 10 }
    })
    @query({
      name: 'search',
      description: '검색어 (이름 또는 이메일)',
      required: false,
      schema: { type: 'string' }
    })
    @response(200, {
      description: '조회 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    email: { type: 'string' },
                    age: { type: 'number' },
                    isActive: { type: 'boolean' }
                  }
                }
              },
              meta: {
                type: 'object',
                properties: {
                  total: { type: 'number' },
                  page: { type: 'number' },
                  limit: { type: 'number' },
                  totalPages: { type: 'number' }
                }
              }
            }
          }
        }
      }
    })
    test('기본 페이지네이션', async () => {
      const response = await request(app.getHttpServer())
        .get('/users')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.meta).toHaveProperty('total');
      expect(response.body.meta).toHaveProperty('page', 1);
      expect(response.body.meta).toHaveProperty('limit', 10);
    });

    test('커스텀 페이지네이션', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?page=2&limit=5')
        .expect(200);

      expect(response.body.meta.page).toBe(2);
      expect(response.body.meta.limit).toBe(5);
    });

    test('검색 필터링', async () => {
      const response = await request(app.getHttpServer())
        .get('/users?search=hong')
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
    });
  });

  // READ (Single)
  describe('GET /users/:id', () => {
    @api({
      tags: ['users'],
      summary: '특정 사용자 조회',
      description: 'ID로 특정 사용자의 상세 정보를 조회합니다.'
    })
    @path('get', '/users/{id}')
    @pathParam({
      name: 'id',
      description: '사용자 ID',
      required: true,
      schema: { type: 'number', example: 1 }
    })
    @response(200, {
      description: '조회 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' },
                  age: { type: 'number' },
                  isActive: { type: 'boolean' },
                  createdAt: { type: 'string', format: 'date-time' },
                  updatedAt: { type: 'string', format: 'date-time' }
                }
              }
            }
          }
        }
      }
    })
    @response(404, {
      description: '사용자를 찾을 수 없음',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              statusCode: { type: 'number' },
              message: { type: 'string' },
              error: { type: 'string' }
            }
          }
        }
      }
    })
    test('ID로 사용자 조회', async () => {
      const response = await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(200);

      expect(response.body.data).toHaveProperty('id', createdUserId);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('email');
    });

    test('존재하지 않는 사용자 조회 시 404', async () => {
      await request(app.getHttpServer())
        .get('/users/99999')
        .expect(404);
    });
  });

  // UPDATE
  describe('PATCH /users/:id', () => {
    @api({
      tags: ['users'],
      summary: '사용자 수정',
      description: '사용자 정보를 부분적으로 수정합니다.'
    })
    @path('patch', '/users/{id}')
    @pathParam({
      name: 'id',
      description: '사용자 ID',
      required: true,
      schema: { type: 'number' }
    })
    @body({
      description: '수정할 데이터 (부분 수정)',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              name: { type: 'string', minLength: 2, maxLength: 50 },
              email: { type: 'string', format: 'email' },
              age: { type: 'number', minimum: 1, maximum: 120 }
            }
          }
        }
      }
    })
    @response(200, {
      description: '수정 성공',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              message: { type: 'string' },
              data: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  email: { type: 'string' }
                }
              }
            }
          }
        }
      }
    })
    @response(404, {
      description: '사용자를 찾을 수 없음'
    })
    test('사용자 정보 수정', async () => {
      const updateData = {
        name: '김철수'
      };

      const response = await request(app.getHttpServer())
        .patch(`/users/${createdUserId}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.name).toBe(updateData.name);
      expect(response.body.message).toBeDefined();
    });

    test('존재하지 않는 사용자 수정 시 404', async () => {
      await request(app.getHttpServer())
        .patch('/users/99999')
        .send({ name: '테스트' })
        .expect(404);
    });
  });

  // DELETE
  describe('DELETE /users/:id', () => {
    @api({
      tags: ['users'],
      summary: '사용자 삭제',
      description: '사용자를 삭제합니다. (Soft Delete)'
    })
    @path('delete', '/users/{id}')
    @pathParam({
      name: 'id',
      description: '사용자 ID',
      required: true,
      schema: { type: 'number' }
    })
    @response(204, {
      description: '삭제 성공 (응답 본문 없음)'
    })
    @response(404, {
      description: '사용자를 찾을 수 없음'
    })
    test('사용자 삭제', async () => {
      await request(app.getHttpServer())
        .delete(`/users/${createdUserId}`)
        .expect(204);

      // 삭제 확인
      await request(app.getHttpServer())
        .get(`/users/${createdUserId}`)
        .expect(404);
    });

    test('존재하지 않는 사용자 삭제 시 404', async () => {
      await request(app.getHttpServer())
        .delete('/users/99999')
        .expect(404);
    });
  });
});
```

### 2. 관계 데이터 테스트

```typescript
describe('Article with Author (e2e)', () => {
  @api({
    tags: ['articles'],
    summary: '게시글 조회 (작성자 포함)',
    description: '게시글과 작성자 정보를 함께 조회합니다.'
  })
  @path('get', '/articles/{id}')
  @pathParam({
    name: 'id',
    schema: { type: 'number' }
  })
  @query({
    name: 'include',
    description: '포함할 관계 데이터',
    schema: {
      type: 'string',
      enum: ['author', 'comments', 'author,comments'],
      example: 'author'
    }
  })
  @response(200, {
    description: '조회 성공',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            data: {
              type: 'object',
              properties: {
                id: { type: 'number' },
                title: { type: 'string' },
                content: { type: 'string' },
                author: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    email: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  test('게시글과 작성자를 함께 조회', async () => {
    const response = await request(app.getHttpServer())
      .get('/articles/1?include=author')
      .expect(200);

    expect(response.body.data).toHaveProperty('author');
    expect(response.body.data.author).toHaveProperty('id');
    expect(response.body.data.author).toHaveProperty('name');
  });
});
```

### 3. 에러 응답 테스트

```typescript
describe('Error Responses', () => {
  @api({
    tags: ['users'],
    summary: '사용자 생성 (검증 에러)'
  })
  @path('post', '/users')
  @body({ /* ... */ })
  @response(400, {
    description: '검증 실패',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 400 },
            message: {
              type: 'array',
              items: { type: 'string' },
              example: [
                'name must be longer than or equal to 2 characters',
                'email must be an email'
              ]
            },
            error: { type: 'string', example: 'Bad Request' }
          }
        }
      }
    }
  })
  test('검증 에러 응답 형식 확인', async () => {
    const response = await request(app.getHttpServer())
      .post('/users')
      .send({
        name: 'a',              // 너무 짧음
        email: 'invalid-email'  // 잘못된 형식
      })
      .expect(400);

    expect(response.body).toHaveProperty('statusCode', 400);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error', 'Bad Request');
    expect(Array.isArray(response.body.message)).toBe(true);
  });

  @api({
    tags: ['users'],
    summary: '존재하지 않는 리소스 조회'
  })
  @path('get', '/users/{id}')
  @pathParam({ name: 'id', schema: { type: 'number' } })
  @response(404, {
    description: '리소스를 찾을 수 없음',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            statusCode: { type: 'number', example: 404 },
            message: { type: 'string', example: 'User with ID 99999 not found' },
            error: { type: 'string', example: 'Not Found' }
          }
        }
      }
    }
  })
  test('404 에러 응답 형식 확인', async () => {
    const response = await request(app.getHttpServer())
      .get('/users/99999')
      .expect(404);

    expect(response.body).toHaveProperty('statusCode', 404);
    expect(response.body).toHaveProperty('message');
    expect(response.body).toHaveProperty('error', 'Not Found');
  });
});
```

---

## 고급 기능

### 1. 스키마 자동 추론

JavaScript 객체로부터 자동으로 OpenAPI 스키마를 생성합니다.

```typescript
import { inferSchema } from 'jest-swagger';

const user = {
  id: 1,
  name: '홍길동',
  email: 'hong@example.com',
  age: 30,
  isActive: true,
  tags: ['developer', 'typescript'],
  address: {
    city: 'Seoul',
    zipCode: '12345'
  }
};

const schema = inferSchema(user);

// 생성된 스키마:
// {
//   type: 'object',
//   properties: {
//     id: { type: 'number' },
//     name: { type: 'string' },
//     email: { type: 'string' },
//     age: { type: 'number' },
//     isActive: { type: 'boolean' },
//     tags: { type: 'array', items: { type: 'string' } },
//     address: {
//       type: 'object',
//       properties: {
//         city: { type: 'string' },
//         zipCode: { type: 'string' }
//       }
//     }
//   }
// }

// 테스트에서 활용
@response(200, {
  description: '성공',
  content: {
    'application/json': {
      schema: inferSchema(user)  // 자동 추론된 스키마 사용
    }
  }
})
test('스키마 자동 추론', async () => {
  // 테스트 로직...
});
```

### 2. Zod 스키마 변환

Zod 스키마를 OpenAPI 스키마로 변환합니다.

```typescript
import { z } from 'zod';
import { convertZodToOpenAPI } from 'jest-swagger';

// Zod 스키마 정의
const CreateUserSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  age: z.number().min(0).max(120).optional(),
  role: z.enum(['admin', 'user', 'guest']),
  tags: z.array(z.string()).optional(),
  address: z.object({
    city: z.string(),
    zipCode: z.string().regex(/^\d{5}$/)
  }).optional()
});

// OpenAPI 스키마로 변환
const openAPISchema = convertZodToOpenAPI(CreateUserSchema);

// 테스트에서 활용
@body({
  description: '사용자 생성 데이터',
  content: {
    'application/json': {
      schema: openAPISchema  // Zod에서 변환된 스키마 사용
    }
  }
})
test('Zod 스키마 변환', async () => {
  const validData = {
    name: '홍길동',
    email: 'hong@example.com',
    age: 30,
    role: 'user'
  };

  // Zod로 검증
  const parsed = CreateUserSchema.parse(validData);

  const response = await request(app.getHttpServer())
    .post('/users')
    .send(parsed)
    .expect(201);
});
```

### 3. Joi 스키마 변환

Joi 스키마를 OpenAPI 스키마로 변환합니다.

```typescript
import Joi from 'joi';
import { convertJoiToOpenAPI } from 'jest-swagger';

// Joi 스키마 정의
const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  age: Joi.number().min(0).max(120),
  role: Joi.string().valid('admin', 'user', 'guest').required(),
  tags: Joi.array().items(Joi.string()),
  address: Joi.object({
    city: Joi.string().required(),
    zipCode: Joi.string().pattern(/^\d{5}$/).required()
  })
});

// OpenAPI 스키마로 변환
const openAPISchema = convertJoiToOpenAPI(createUserSchema);

// 테스트에서 활용
@body({
  description: '사용자 생성 데이터',
  content: {
    'application/json': {
      schema: openAPISchema  // Joi에서 변환된 스키마 사용
    }
  }
})
test('Joi 스키마 변환', async () => {
  // 테스트 로직...
});
```

### 4. 타입 생성

OpenAPI 문서로부터 TypeScript 타입을 자동 생성합니다.

```typescript
import { generateTypesFromDocument } from 'jest-swagger';

const document = {
  // OpenAPI 문서
  openapi: '3.0.0',
  info: { title: 'API', version: '1.0.0' },
  paths: {
    '/users': {
      get: {
        responses: {
          '200': {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' },
                    email: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

// TypeScript 타입 생성
generateTypesFromDocument(document, {
  outputDir: './src/types',
  filename: 'api.types.ts',
  exportType: 'named'  // 'named' | 'default'
});

// 생성된 파일: src/types/api.types.ts
// export interface User {
//   id: number;
//   name: string;
//   email: string;
// }
```

### 5. DocumentBuilder 사용

프로그래매틱하게 OpenAPI 문서를 생성합니다.

```typescript
import { DocumentBuilder } from 'jest-swagger';

const document = new DocumentBuilder('My API', '1.0.0')
  .setDescription('API 설명')
  .addServer('http://localhost:3000', '로컬 서버')
  .addServer('https://api.example.com', '프로덕션 서버')
  .addTag('users', '사용자 관리 API')
  .addTag('articles', '게시글 관리 API')
  .addPath('/users', {
    get: {
      tags: ['users'],
      summary: '사용자 목록 조회',
      responses: {
        '200': {
          description: '성공',
          content: {
            'application/json': {
              schema: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'number' },
                    name: { type: 'string' }
                  }
                }
              }
            }
          }
        }
      }
    }
  })
  .setSecurityScheme('bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
  })
  .addSecurityRequirement({ bearerAuth: [] })
  .build();

// document를 파일로 저장하거나 사용
```

---

## 문제 해결

### 1. 데코레이터가 작동하지 않을 때

**증상**: 테스트는 통과하지만 OpenAPI 문서에 엔드포인트가 나타나지 않음

**원인**: TypeScript 데코레이터 설정이 활성화되지 않음

**해결 방법**:

```json
// tsconfig.json 확인
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

```javascript
// jest.config.js 확인
module.exports = {
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        experimentalDecorators: true,
        emitDecoratorMetadata: true,
      },
    }],
  },
};
```

### 2. 문서가 생성되지 않을 때

**증상**: 테스트 실행 후 `docs/` 디렉토리에 파일이 생성되지 않음

**원인**: SwaggerReporter가 설정되지 않았거나 테스트가 실패함

**해결 방법**:

1. Jest 설정 확인:

```javascript
// jest.config.js
module.exports = {
  reporters: [
    'default',
    [
      'jest-swagger/dist/reporters',
      {
        outputDir: './docs',
        filename: 'openapi',
        format: 'yaml',
        printPath: true,
        printStats: true,
      },
    ],
  ],
};
```

2. 테스트 실행 및 로그 확인:

```bash
npm test -- --verbose
```

3. 로그 레벨 증가:

```javascript
reporters: [
  'default',
  [
    'jest-swagger/dist/reporters',
    {
      logLevel: 'debug',  // 상세 로그 출력
      printPath: true,
      printStats: true,
    },
  ],
];
```

4. 수동으로 디렉토리 생성:

```bash
mkdir -p docs
```

### 3. 스키마 추론이 정확하지 않을 때

**증상**: `inferSchema()`로 생성된 스키마가 예상과 다름

**원인**: 복잡한 객체나 특수 타입의 자동 추론 한계

**해결 방법**:

**방법 1**: 명시적으로 스키마 정의

```typescript
@response(200, {
  description: '성공',
  content: {
    'application/json': {
      schema: {
        type: 'object',
        properties: {
          id: { type: 'number' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          // 명시적으로 모든 필드 정의
        }
      }
    }
  }
})
```

**방법 2**: Zod/Joi 스키마 사용

```typescript
import { z } from 'zod';
import { convertZodToOpenAPI } from 'jest-swagger';

const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().email()
});

@response(200, {
  description: '성공',
  content: {
    'application/json': {
      schema: convertZodToOpenAPI(UserSchema)
    }
  }
})
```

### 4. E2E 테스트에서 타임아웃 발생

**증상**: 테스트가 타임아웃으로 실패

**원인**: 데이터베이스 연결 또는 초기화 시간 부족

**해결 방법**:

```javascript
// jest.config.js
module.exports = {
  testTimeout: 30000,  // 30초 (기본값: 5초)
};
```

또는 개별 테스트:

```typescript
test('긴 작업 테스트', async () => {
  // 테스트 로직...
}, 30000);  // 30초 타임아웃
```

### 5. 데코레이터 순서 문제

**증상**: 일부 데코레이터가 무시됨

**원인**: 데코레이터 적용 순서가 잘못됨

**해결 방법**:

올바른 순서:

```typescript
@api({ /* ... */ })       // 1. 기본 정보
@path('get', '/users')    // 2. HTTP 메서드 및 경로
@query({ /* ... */ })     // 3. 파라미터들
@pathParam({ /* ... */ })
@header({ /* ... */ })
@body({ /* ... */ })
@response(200, { /* ... */ })  // 4. 응답들
@response(400, { /* ... */ })
test('테스트', async () => {
  // 테스트 로직
});
```

### 6. 중복 엔드포인트 경고

**증상**: 같은 경로의 엔드포인트가 여러 번 정의됨

**원인**: 테스트 파일 구조 문제

**해결 방법**:

각 엔드포인트를 `describe` 블록으로 분리:

```typescript
describe('User API', () => {
  describe('GET /users', () => {
    @api({ /* ... */ })
    @path('get', '/users')
    test('목록 조회', async () => {
      // ...
    });
  });

  describe('POST /users', () => {
    @api({ /* ... */ })
    @path('post', '/users')
    test('생성', async () => {
      // ...
    });
  });
});
```

---

## 체크리스트

### 새 엔드포인트 추가 시

- [ ] `@api()` - 기본 정보 (tags, summary)
- [ ] `@path()` - HTTP 메서드와 경로
- [ ] 파라미터 데코레이터 (`@query`, `@pathParam`, `@body` 등)
- [ ] `@response()` - 최소 200 응답 정의
- [ ] 에러 응답 정의 (400, 404, 500 등)
- [ ] 실제 HTTP 요청 테스트
- [ ] 예제 값 제공 (`example` 속성)
- [ ] 검증 규칙 명시 (`minLength`, `pattern` 등)

### 문서 생성 전

- [ ] TypeScript 설정 확인 (`experimentalDecorators`)
- [ ] Jest 설정 확인 (`SwaggerReporter`)
- [ ] 모든 테스트 통과
- [ ] 출력 디렉토리 존재 여부

### 품질 보증

- [ ] 성공 케이스 테스트
- [ ] 에러 케이스 테스트 (400, 404, 500)
- [ ] 엣지 케이스 테스트
- [ ] 검증 로직 테스트 (최소/최대 길이, 형식 등)
- [ ] 관계 데이터 테스트 (필요 시)
- [ ] 페이지네이션 테스트 (목록 API)

---

## 추가 참조

- **프로젝트 개요**: `/CLAUDE.md`
- **모듈 작성 가이드**: `src/modules/CLAUDE.md`
- **API 문서**: `docs/CLAUDE.md`
- **jest-swagger 전체 문서**: `docs/package/jest-swagger/HOWTOUSE.md`

---

**최종 수정일**: 2024-01-24
**작성자**: Claude (AI Assistant)
**버전**: 1.0.0
