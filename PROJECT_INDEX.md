# Project Index: template-typescript-nestjs

Generated: 2025-11-23

> **토큰 절약**: 이 인덱스를 읽으면 전체 코드베이스 스캔 대비 94% 토큰 절약 (58K → 3K)

## 📁 프로젝트 구조

```
template-typescript-nestjs/
├── src/                    # 소스 코드
│   ├── main.ts            # 애플리케이션 진입점
│   ├── app.module.ts      # 루트 모듈
│   ├── app.controller.ts  # 루트 컨트롤러
│   ├── app.service.ts     # 루트 서비스
│   ├── config/            # 설정 파일
│   ├── common/            # 공통 유틸리티
│   │   ├── base/         # 기본 엔티티/DTO
│   │   ├── decorators/   # 커스텀 데코레이터
│   │   ├── filters/      # 예외 필터
│   │   ├── interceptors/ # 인터셉터
│   │   ├── pipes/        # 파이프
│   │   └── utils/        # 유틸 함수
│   ├── shared/           # 공유 모듈
│   │   ├── logger/       # 로깅 모듈
│   │   ├── health/       # 헬스체크 모듈
│   │   └── i18n/         # 국제화 모듈
│   └── modules/          # 기능 모듈
│       └── example/      # 예제 모듈
├── test/                 # 테스트 파일
│   ├── factories/        # 테스트 데이터 팩토리
│   ├── fixtures/         # 테스트 픽스처
│   └── utils/            # 테스트 유틸리티
├── docker/               # Docker 설정
├── docs/                 # 문서
├── i18n/                 # 다국어 메시지
│   ├── ko/              # 한국어
│   └── en/              # 영어
└── .github/             # GitHub Actions CI/CD
```

## 🚀 진입점

### CLI
- **경로**: `src/main.ts`
- **설명**: NestJS 애플리케이션 부트스트랩 및 전역 설정
- **포트**: 3000 (기본값, 환경변수로 변경 가능)
- **주요 기능**:
  - Helmet 보안 설정
  - CORS 설정
  - 전역 파이프/필터/인터셉터 등록
  - 로거 설정

### 개발 서버
```bash
pnpm run start:dev      # 개발 모드
pnpm run start:debug    # 디버그 모드
pnpm run start:prod     # 프로덕션 모드
```

### Docker
```bash
pnpm run docker:dev     # 개발 환경
pnpm run docker:up      # 프로덕션 환경
```

## 📦 핵심 모듈

### 1. AppModule (`src/app.module.ts`)
- **용도**: 루트 모듈, 전체 애플리케이션 구성
- **주요 임포트**:
  - ConfigModule (전역 설정)
  - TypeOrmModule (데이터베이스)
  - ThrottlerModule (Rate Limiting)
  - LoggerModule (로깅)
  - HealthModule (헬스체크)
  - I18nConfigModule (국제화)
  - ExampleModule (예제 기능)

### 2. LoggerModule (`src/shared/logger/`)
- **용도**: Winston 기반 로깅
- **내보내기**: LoggerService
- **로그 레벨**: error, warn, info, debug
- **기능**: 파일 로깅, 콘솔 로깅, 컨텍스트 추적

### 3. HealthModule (`src/shared/health/`)
- **용도**: 애플리케이션 헬스체크
- **엔드포인트**: `/health`
- **체크 항목**: DB 연결, 메모리, 디스크

### 4. I18nConfigModule (`src/shared/i18n/`)
- **용도**: 다국어 지원 (nestjs-i18n)
- **지원 언어**: 한국어(ko), 영어(en)
- **자동 감지**: Accept-Language 헤더

### 5. ExampleModule (`src/modules/example/`)
- **용도**: CRUD 예제 모듈
- **구조**:
  - Controller: HTTP 요청 처리
  - Service: 비즈니스 로직
  - Entity: 데이터베이스 엔티티
  - DTO: 데이터 전송 객체

## 🔧 설정

### 환경 설정 (`src/config/`)
- **configuration.ts**: 환경변수 로드 및 구조화
- **validation.schema.ts**: Joi를 통한 환경변수 검증

### 주요 설정 항목
```typescript
{
  nodeEnv: 'development' | 'production' | 'test',
  port: 3000,
  apiPrefix: 'api',
  database: {
    type: 'mysql',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    name: 'nestjs',
  },
  throttle: {
    ttl: 60000,    // 60초
    limit: 10,     // 60초당 10개 요청
  },
  cors: {
    enabled: true,
    origins: ['http://localhost:3000'],
  },
}
```

## 🧩 공통 컴포넌트

### Decorators (`src/common/decorators/`)
- `@Public()`: 인증 우회
- `@Roles()`: 역할 기반 접근 제어
- `@CurrentUser()`: 현재 사용자 추출
- `@Throttle()`: Rate Limiting 설정
- `@ApiResponse()`: Swagger 응답 문서화

### Filters (`src/common/filters/`)
- **HttpExceptionFilter**: HTTP 예외 처리 및 로깅
- **AllExceptionsFilter**: 모든 예외 포착 및 안전한 응답

### Interceptors (`src/common/interceptors/`)
- **LoggingInterceptor**: 요청/응답 로깅
- **TransformInterceptor**: 응답 데이터 변환

### Pipes (`src/common/pipes/`)
- **ValidationPipe**: DTO 유효성 검사 (class-validator)

### Utils (`src/common/utils/`)
- **pagination.util**: 페이지네이션 헬퍼
- **string.util**: 문자열 변환 (camelCase, snake_case 등)
- **date.util**: 날짜 포맷팅
- **hash.util**: 비밀번호 해싱 (bcrypt)

### Base Classes (`src/common/base/`)
- **BaseEntity**: 공통 엔티티 필드 (id, createdAt, updatedAt)
- **BaseDto**: 공통 DTO 필드

## 📚 문서

### 문서 파일 (`docs/`)
- **ARCHITECTURE.md/ko.md**: 아키텍처 가이드
- **API.md/ko.md**: API 문서
- **DEVELOPMENT.md/ko.md**: 개발 가이드
- **DEPLOYMENT.md/ko.md**: 배포 가이드

### API 문서
- Swagger UI: `http://localhost:3000/api-docs`
- OpenAPI 자동 생성 (@nestjs/swagger)

## 🧪 테스트

### 테스트 구조 (`test/`)
- **E2E 테스트**: `test/*.e2e-spec.ts`
- **팩토리**: `test/factories/*.factory.ts` (Fishery 사용)
- **픽스처**: `test/fixtures/*.fixture.ts` (Faker 사용)
- **유틸리티**: `test/utils/*.ts`

### 테스트 커버리지
```bash
pnpm run test           # 단위 테스트
pnpm run test:e2e       # E2E 테스트
pnpm run test:cov       # 커버리지 리포트
```

### 테스트 목표
- 단위 테스트 커버리지: ≥80%
- 통합 테스트 커버리지: ≥70%

## 🔗 주요 종속성

### 프로덕션 의존성
| 패키지 | 버전 | 용도 |
|--------|------|------|
| @nestjs/core | ^11.0.1 | 핵심 프레임워크 |
| @nestjs/typeorm | ^11.0.0 | TypeORM 통합 |
| @nestjs/config | ^4.0.2 | 환경설정 관리 |
| @nestjs/swagger | ^11.2.3 | API 문서화 |
| @nestjs/terminus | ^11.0.0 | 헬스체크 |
| @nestjs/throttler | ^6.4.0 | Rate Limiting |
| typeorm | ^0.3.27 | ORM |
| mysql2 | ^3.15.3 | MySQL 드라이버 |
| helmet | ^8.1.0 | 보안 헤더 |
| class-validator | ^0.14.2 | DTO 검증 |
| class-transformer | ^0.5.1 | 객체 변환 |
| joi | ^18.0.2 | 환경변수 검증 |
| winston | ^3.18.3 | 로깅 |
| nestjs-i18n | ^10.5.1 | 국제화 |

### 개발 의존성
| 패키지 | 버전 | 용도 |
|--------|------|------|
| typescript | ^5.7.3 | TypeScript 컴파일러 |
| jest | ^30.0.0 | 테스트 프레임워크 |
| eslint | ^9.18.0 | 코드 린팅 |
| prettier | ^3.4.2 | 코드 포맷팅 |
| husky | ^9.1.7 | Git 훅 |
| @faker-js/faker | ^10.1.0 | 테스트 데이터 생성 |
| fishery | ^2.3.1 | 팩토리 패턴 |
| supertest | ^7.0.0 | E2E 테스트 |

## 📝 빠른 시작

### 1. 설치
```bash
git clone <repository-url>
cd template-typescript-nestjs
pnpm install
cp .env.example .env
```

### 2. 데이터베이스 설정
```bash
# Docker로 MySQL 실행
pnpm run docker:dev
```

### 3. 개발 서버 실행
```bash
pnpm run start:dev
```

### 4. 접속
- API: http://localhost:3000/api
- Swagger: http://localhost:3000/api-docs
- Health: http://localhost:3000/health

## 🏗️ 아키텍처 특징

### 계층 구조
- **Controller Layer**: HTTP 요청 처리, 라우팅
- **Service Layer**: 비즈니스 로직
- **Repository Layer**: 데이터 접근 (TypeORM)

### 설계 원칙
- **의존성 주입**: NestJS DI 컨테이너 활용
- **모듈화**: 기능별 모듈 분리
- **도메인 주도 설계**: 도메인 중심 구조
- **관심사 분리**: 각 계층의 책임 명확화

### 보안
- Helmet 보안 헤더
- Rate Limiting (Throttler)
- CORS 설정
- Input Validation (class-validator)
- 환경변수 관리

## 🚀 DevOps

### Docker
- **Dockerfile**: `docker/Dockerfile`
- **docker-compose.yml**: 프로덕션 환경
- **docker-compose.dev.yml**: 개발 환경
- Multi-stage 빌드로 이미지 크기 최적화

### CI/CD
- **GitHub Actions**: `.github/workflows/`
- 자동 테스트, 린트, 빌드
- Docker 이미지 빌드 및 푸시

### 코드 품질
- **ESLint**: TypeScript 린팅
- **Prettier**: 코드 포맷팅
- **Husky**: 커밋 전 자동 검사
- **Commitlint**: 커밋 메시지 규칙

## 📊 프로젝트 통계

- **총 소스 파일**: 40개 (TypeScript)
- **테스트 파일**: 10개
- **문서 파일**: 8개 (한/영)
- **지원 언어**: 2개 (한국어, 영어)
- **주요 모듈**: 4개 (Logger, Health, I18n, Example)

## 🔍 주요 파일 참조

### 진입점
- `src/main.ts:1` - 애플리케이션 부트스트랩

### 모듈
- `src/app.module.ts:15` - 루트 모듈 설정
- `src/modules/example/example.module.ts:1` - 예제 모듈

### 설정
- `src/config/configuration.ts:1` - 환경설정 로드
- `src/config/validation.schema.ts:1` - 환경변수 검증

### 공통
- `src/common/filters/http-exception.filter.ts:1` - 예외 필터
- `src/common/pipes/validation.pipe.ts:1` - 검증 파이프
- `src/common/base/base.entity.ts:1` - 기본 엔티티

### 유틸리티
- `src/common/utils/pagination.util.ts:1` - 페이지네이션
- `src/common/utils/hash.util.ts:1` - 비밀번호 해싱

---

**인덱스 사용 팁**:
- 새로운 기능 추가 시 `src/modules/` 참조
- 공통 기능 필요 시 `src/common/` 확인
- 설정 변경 시 `src/config/` 및 `.env` 확인
- API 문서는 Swagger UI에서 확인
