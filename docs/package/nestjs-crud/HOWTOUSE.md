# NestJS JSON:API 패키지 사용 방법

> NestJS JSON:API 1.1 스펙을 준수하는 엔터프라이즈급 JSON:API 프레임워크

## 목차

- [개요](#개요)
- [주요 기능](#주요-기능)
- [설치](#설치)
- [빠른 시작](#빠른-시작)
- [기본 사용법](#기본-사용법)
- [고급 기능](#고급-기능)
- [패키지 구성](#패키지-구성)
- [예제 프로젝트](#예제-프로젝트)
- [문제 해결](#문제-해결)

## 개요

NestJS JSON:API는 NestJS 프레임워크를 위한 완전한 JSON:API 1.1 구현입니다. 여러 ORM 어댑터를 지원하며, 엔터프라이즈급 애플리케이션을 위한 확장 가능한 아키텍처를 제공합니다.

### 주요 기능

- ✅ **완전한 JSON:API 1.1 준수** - 최신 JSON:API 스펙 완벽 지원
- ✅ **TypeScript 완벽 지원** - Strict 모드 지원으로 타입 안정성 보장
- ✅ **다중 ORM 어댑터** - TypeORM, Prisma, Sequelize, MikroORM 지원
- ✅ **자동 필터링, 정렬, 페이징** - 쿼리 파라미터 자동 파싱 및 처리
- ✅ **관계 데이터 지원** - 복잡한 관계 매핑 및 포함(include) 처리
- ✅ **프로파일 기반 설정** - 환경별 유연한 구성 관리
- ✅ **확장 시스템** - 플러그인 아키텍처로 기능 확장
- ✅ **OpenAPI/Swagger 통합** - API 문서 자동 생성

## 설치

### 필수 요구사항

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0
- **NestJS** >= 10.0.0
- **TypeScript** >= 5.0.0

### 코어 패키지와 ORM 어댑터 설치

프로젝트에 사용할 ORM에 맞는 어댑터를 선택하여 설치하세요.

#### TypeORM 사용 시

```bash
pnpm add @nestjs-jsonapi/core @nestjs-jsonapi/typeorm-adapter
pnpm add @nestjs/typeorm typeorm
```

#### Prisma 사용 시

```bash
pnpm add @nestjs-jsonapi/core @nestjs-jsonapi/prisma-adapter
pnpm add @prisma/client
pnpm add -D prisma
```

#### Sequelize 사용 시

```bash
pnpm add @nestjs-jsonapi/core @nestjs-jsonapi/sequelize-adapter
pnpm add @nestjs/sequelize sequelize sequelize-typescript
```

#### MikroORM 사용 시

```bash
pnpm add @nestjs-jsonapi/core @nestjs-jsonapi/mikroorm-adapter
pnpm add @mikro-orm/core @mikro-orm/nestjs
```

### 선택적 패키지

```bash
# CLI 도구 (리소스 자동 생성)
pnpm add -D @nestjs-jsonapi/cli

# 테스팅 유틸리티
pnpm add -D @nestjs-jsonapi/testing
```

## 빠른 시작

### 1. 엔티티 정의

먼저 데이터베이스 엔티티를 정의합니다.

```typescript
// src/users/user.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  age?: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 2. JSON:API 리소스 정의

엔티티를 JSON:API 리소스로 변환하기 위한 리소스 클래스를 정의합니다.

```typescript
// src/users/user.resource.ts
import { JsonApiResource, JsonApiAttribute } from '@nestjs-jsonapi/core';
import { User } from './user.entity';

@JsonApiResource({
  type: 'users',
  entity: User,
})
export class UserResource {
  @JsonApiAttribute()
  name: string;

  @JsonApiAttribute()
  email: string;

  @JsonApiAttribute()
  age?: number;

  @JsonApiAttribute()
  isActive: boolean;

  @JsonApiAttribute()
  createdAt: Date;

  @JsonApiAttribute()
  updatedAt: Date;
}
```

### 3. 컨트롤러 생성

JSON:API 컨트롤러를 생성합니다. `@JsonApiController` 데코레이터가 모든 CRUD 엔드포인트를 자동으로 생성합니다.

```typescript
// src/users/users.controller.ts
import { Controller } from '@nestjs/common';
import { JsonApiController } from '@nestjs-jsonapi/core';
import { UserResource } from './user.resource';

@Controller('users')
@JsonApiController(UserResource)
export class UsersController {
  // CRUD 엔드포인트가 자동으로 생성됩니다:
  // GET    /users
  // GET    /users/:id
  // POST   /users
  // PATCH  /users/:id
  // DELETE /users/:id
}
```

### 4. 모듈 구성

모듈에 컨트롤러와 엔티티를 등록합니다.

```typescript
// src/users/users.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
})
export class UsersModule {}
```

### 5. 앱 모듈 설정

루트 모듈에 JSON:API 모듈과 ORM 어댑터를 설정합니다.

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JsonApiModule } from '@nestjs-jsonapi/core';
import { TypeOrmJsonApiModule } from '@nestjs-jsonapi/typeorm-adapter';
import { UsersModule } from './users/users.module';
import { User } from './users/user.entity';

@Module({
  imports: [
    // TypeORM 데이터베이스 설정
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: './database.sqlite',
      entities: [User],
      synchronize: true, // 개발 환경에서만 사용
      logging: process.env.NODE_ENV === 'development',
    }),

    // JSON:API 모듈 설정
    JsonApiModule.forRoot({
      baseUrl: 'http://localhost:3000',
      version: '1.1',
      defaultPageSize: 20,
      maxPageSize: 100,
      maxIncludeDepth: 3,
      namespace: 'api/v1', // API 네임스페이스
    }),

    // TypeORM 어댑터 등록
    TypeOrmJsonApiModule.forRoot(),

    // 기능 모듈
    UsersModule,
  ],
})
export class AppModule {}
```

### 6. 서버 실행

```bash
pnpm run start:dev
```

## 기본 사용법

### API 엔드포인트

서버가 실행되면 다음과 같은 JSON:API 표준 엔드포인트를 사용할 수 있습니다:

#### 전체 리소스 조회 (Collection)

```bash
curl http://localhost:3000/api/v1/users
```

**응답 예제:**

```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "data": [
    {
      "type": "users",
      "id": "1",
      "attributes": {
        "name": "홍길동",
        "email": "hong@example.com",
        "age": 30,
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "updatedAt": "2024-01-01T00:00:00.000Z"
      }
    }
  ],
  "meta": {
    "total": 1
  }
}
```

#### 단일 리소스 조회

```bash
curl http://localhost:3000/api/v1/users/1
```

#### 리소스 생성

```bash
curl -X POST http://localhost:3000/api/v1/users \
  -H "Content-Type: application/vnd.api+json" \
  -d '{
    "data": {
      "type": "users",
      "attributes": {
        "name": "김철수",
        "email": "kim@example.com",
        "age": 25
      }
    }
  }'
```

#### 리소스 수정

```bash
curl -X PATCH http://localhost:3000/api/v1/users/1 \
  -H "Content-Type: application/vnd.api+json" \
  -d '{
    "data": {
      "type": "users",
      "id": "1",
      "attributes": {
        "name": "김철수(수정)"
      }
    }
  }'
```

#### 리소스 삭제

```bash
curl -X DELETE http://localhost:3000/api/v1/users/1
```

### 쿼리 파라미터

JSON:API는 풍부한 쿼리 기능을 제공합니다.

#### 필터링

```bash
# 이메일로 필터링
curl "http://localhost:3000/api/v1/users?filter[email]=hong@example.com"

# 활성 사용자만 조회
curl "http://localhost:3000/api/v1/users?filter[isActive]=true"

# 나이로 필터링
curl "http://localhost:3000/api/v1/users?filter[age]=30"
```

#### 정렬

```bash
# 이름으로 오름차순 정렬
curl "http://localhost:3000/api/v1/users?sort=name"

# 생성일로 내림차순 정렬
curl "http://localhost:3000/api/v1/users?sort=-createdAt"

# 다중 정렬 (이름 오름차순, 이메일 내림차순)
curl "http://localhost:3000/api/v1/users?sort=name,-email"
```

#### 페이징

```bash
# 오프셋 기반 페이징
curl "http://localhost:3000/api/v1/users?page[offset]=0&page[limit]=10"

# 페이지 번호 기반 페이징
curl "http://localhost:3000/api/v1/users?page[number]=1&page[size]=20"
```

#### 필드 선택 (Sparse Fieldsets)

```bash
# 특정 필드만 조회
curl "http://localhost:3000/api/v1/users?fields[users]=name,email"
```

## 고급 기능

### 관계(Relationship) 정의

```typescript
// article.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, { eager: true })
  author: User;
}
```

```typescript
// article.resource.ts
import { JsonApiResource, JsonApiAttribute, JsonApiRelationship } from '@nestjs-jsonapi/core';
import { Article } from './article.entity';
import { UserResource } from '../users/user.resource';

@JsonApiResource({
  type: 'articles',
  entity: Article,
})
export class ArticleResource {
  @JsonApiAttribute()
  title: string;

  @JsonApiAttribute()
  content: string;

  @JsonApiRelationship({
    type: 'users',
    resource: () => UserResource,
  })
  author: UserResource;
}
```

### 관계 포함 (Include)

```bash
# 게시글과 작성자 정보를 함께 조회
curl "http://localhost:3000/api/v1/articles?include=author"

# 다중 관계 포함
curl "http://localhost:3000/api/v1/articles?include=author,comments"

# 중첩된 관계 포함
curl "http://localhost:3000/api/v1/articles?include=author,comments.author"
```

**응답 예제:**

```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "첫 번째 게시글",
      "content": "내용..."
    },
    "relationships": {
      "author": {
        "data": { "type": "users", "id": "1" },
        "links": {
          "self": "http://localhost:3000/api/v1/articles/1/relationships/author",
          "related": "http://localhost:3000/api/v1/articles/1/author"
        }
      }
    }
  },
  "included": [
    {
      "type": "users",
      "id": "1",
      "attributes": {
        "name": "홍길동",
        "email": "hong@example.com"
      }
    }
  ]
}
```

### 라이프사이클 훅

리소스 처리 과정에서 커스텀 로직을 실행할 수 있습니다.

```typescript
import {
  JsonApiResource,
  BeforeRoute,
  AfterRoute,
  BeforeAssign,
  AfterAssign,
} from '@nestjs-jsonapi/core';

@JsonApiResource({
  type: 'users',
  entity: User,
})
export class UserResource {
  @JsonApiAttribute()
  name: string;

  @JsonApiAttribute()
  email: string;

  // 라우트 실행 전
  @BeforeRoute('create')
  async validateBeforeCreate(data: any) {
    // 이메일 중복 검사 등
    console.log('Before create:', data);
  }

  // 라우트 실행 후
  @AfterRoute('create')
  async notifyAfterCreate(result: any) {
    // 생성 알림 전송 등
    console.log('After create:', result);
  }

  // 속성 할당 전
  @BeforeAssign('email')
  normalizeEmail(value: string) {
    return value.toLowerCase();
  }

  // 속성 할당 후
  @AfterAssign('name')
  logNameChange(value: string) {
    console.log('Name changed to:', value);
  }
}
```

### 권한 제어

```typescript
import { JsonApiResource, ResourcePermissions, FieldPermissions } from '@nestjs-jsonapi/core';

@JsonApiResource({
  type: 'users',
  entity: User,
})
@ResourcePermissions({
  create: ['admin'], // 관리자만 생성 가능
  update: ['admin', 'owner'], // 관리자 또는 소유자만 수정 가능
  delete: ['admin'], // 관리자만 삭제 가능
  read: ['*'], // 모두 읽기 가능
})
export class UserResource {
  @JsonApiAttribute()
  name: string;

  @JsonApiAttribute()
  @FieldPermissions({
    read: ['admin', 'owner'], // 관리자 또는 소유자만 읽기 가능
    write: ['admin'], // 관리자만 쓰기 가능
  })
  email: string;
}
```

### CLI를 사용한 리소스 자동 생성

```bash
# 기본 리소스 생성
npx nestjs-jsonapi generate resource Article

# TypeORM과 함께 생성
npx nestjs-jsonapi generate resource Article --orm typeorm --crud all

# Prisma와 함께 생성
npx nestjs-jsonapi generate resource Article --orm prisma --crud all
```

자동으로 생성되는 파일:

- `article.entity.ts` - 엔티티
- `article.resource.ts` - JSON:API 리소스
- `articles.controller.ts` - 컨트롤러
- `articles.service.ts` - 서비스
- `articles.module.ts` - 모듈

## 패키지 구성

이 프로젝트는 모노레포 구조로 구성되어 있습니다:

### 코어 패키지

| 패키지                              | 설명               | 버전  |
| ----------------------------------- | ------------------ | ----- |
| `@nestjs-jsonapi/core`              | 핵심 JSON:API 구현 | 1.0.0 |
| `@nestjs-jsonapi/typeorm-adapter`   | TypeORM 어댑터     | 1.0.0 |
| `@nestjs-jsonapi/prisma-adapter`    | Prisma 어댑터      | 1.0.0 |
| `@nestjs-jsonapi/sequelize-adapter` | Sequelize 어댑터   | 1.0.0 |
| `@nestjs-jsonapi/mikroorm-adapter`  | MikroORM 어댑터    | 1.0.0 |
| `@nestjs-jsonapi/cli`               | CLI 도구           | 1.0.0 |
| `@nestjs-jsonapi/testing`           | 테스팅 유틸리티    | 1.0.0 |

### @nestjs-jsonapi/core 주요 기능

코어 패키지는 다음과 같은 모듈을 제공합니다:

#### 데코레이터

- `@JsonApiResource` - 리소스 정의
- `@JsonApiAttribute` - 속성 정의
- `@JsonApiRelationship` - 관계 정의
- `@JsonApiController` - 컨트롤러 자동 생성
- `@BeforeRoute`, `@AfterRoute` - 라우트 훅
- `@ResourcePermissions`, `@FieldPermissions` - 권한 제어

#### 모듈

- `JsonApiModule` - 메인 모듈
- `JsonApiCoreModule` - 코어 기능 모듈

#### 파서

- 쿼리 파라미터 파서 (필터, 정렬, 페이징, 포함, 필드)
- 유효성 검증

#### 빌더

- 쿼리 빌더
- 데이터베이스 어댑터 인터페이스

#### 직렬화

- JSON:API 응답 직렬화
- 관계 데이터 처리
- 메타 데이터 생성

#### 성능 최적화

- 캐싱
- 트랜잭션 관리
- 지연 로딩

#### 플러그인 시스템

- 확장 가능한 플러그인 아키텍처
- Introspection 플러그인

## 예제 프로젝트

### Basic CRUD 예제

`examples/basic-crud` 디렉토리에 기본 CRUD 작업 예제가 포함되어 있습니다.

```bash
# 예제 실행
cd examples/basic-crud
pnpm install
pnpm run start:dev
```

**예제 엔드포인트:**

```bash
# 사용자 목록 조회
curl http://localhost:3000/users

# 사용자 생성
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/vnd.api+json" \
  -d '{
    "data": {
      "type": "users",
      "attributes": {
        "name": "홍길동",
        "email": "hong@example.com",
        "age": 30
      }
    }
  }'

# 사용자 조회
curl http://localhost:3000/users/1

# 사용자 수정
curl -X PATCH http://localhost:3000/users/1 \
  -H "Content-Type: application/vnd.api+json" \
  -d '{
    "data": {
      "type": "users",
      "id": "1",
      "attributes": {
        "name": "홍길동(수정)"
      }
    }
  }'

# 사용자 삭제
curl -X DELETE http://localhost:3000/users/1
```

## 문제 해결

### 일반적인 문제

#### 1. 모듈을 찾을 수 없음

```
Error: Cannot find module '@nestjs-jsonapi/core'
```

**해결방법:**

```bash
# 패키지 재설치
pnpm install

# 캐시 삭제 후 재설치
pnpm store prune
pnpm install
```

#### 2. 타입 오류

```
Type 'User' is not assignable to type 'JsonApiResource'
```

**해결방법:**

- `@JsonApiResource` 데코레이터가 올바르게 적용되었는지 확인
- TypeScript 버전이 5.0.0 이상인지 확인

#### 3. 데이터베이스 연결 실패

```
Error: Connection refused
```

**해결방법:**

```typescript
// 환경 변수를 활용한 설정
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'myapp',
  synchronize: process.env.NODE_ENV === 'development',
});
```

#### 4. JSON:API 응답 형식이 아님

**해결방법:**

- `@JsonApiController` 데코레이터가 컨트롤러에 적용되었는지 확인
- `JsonApiModule.forRoot()`가 앱 모듈에 등록되었는지 확인
- 요청 헤더에 `Accept: application/vnd.api+json` 포함 확인

### 디버깅 팁

#### 1. 디버그 모드 활성화

```typescript
JsonApiModule.forRoot({
  debug: true, // 상세한 로그 출력
  baseUrl: 'http://localhost:3000',
});
```

#### 2. 로그 확인

```typescript
import { Logger } from '@nestjs/common';

const logger = new Logger('JsonApi');
logger.debug('Request:', request);
logger.error('Error:', error);
```

#### 3. 요청/응답 검증

필수 헤더:

```
Content-Type: application/vnd.api+json
Accept: application/vnd.api+json
```

## 추가 리소스

### 문서

- [시작하기](./docs/getting-started.md) - 자세한 설치 및 설정 가이드
- [설정 가이드](./docs/configuration.md) - 모듈 설정 및 환경별 구성
- [고급 사용법](./docs/advanced-usage.md) - 복잡한 필터링, 관계, 확장 기능
- [API 레퍼런스](./docs/api-reference.md) - 완전한 API 문서
- [마이그레이션 가이드](./docs/migration-guide.md) - 버전 업그레이드 가이드
- [CI/CD 파이프라인](./docs/CI_CD.md) - 자동화된 빌드 및 배포

### 외부 링크

- [JSON:API 공식 명세](https://jsonapi.org/format/)
- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 문서](https://typeorm.io/)
- [Prisma 문서](https://www.prisma.io/docs/)

### 지원

- [GitHub 이슈 트래커](https://github.com/your-org/nestjs-jsonapi/issues)
- [GitHub 토론](https://github.com/your-org/nestjs-jsonapi/discussions)
- [기여 가이드](./CONTRIBUTING.md)

## 라이선스

MIT License - 자세한 내용은 [LICENSE](./LICENSE) 파일을 참조하세요.

---

**개발팀 연락처:** [이메일 주소]
**최종 업데이트:** 2024년 1월
