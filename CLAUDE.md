# NestJS Template - 프로젝트 개요

> NestJS 기반 엔터프라이즈급 템플릿 프로젝트

## 프로젝트 목적

이 프로젝트는 **NestJS JSON:API 1.1 스펙**을 준수하는 엔터프라이즈급 백엔드 애플리케이션 템플릿입니다. 프로덕션 환경에서 바로 사용 가능한 보안, 다국어 지원, 테스팅, CI/CD 설정이 모두 구성되어 있습니다.

## 핵심 기술 스택

### 프레임워크 & ORM

- **NestJS** ^11.0.1 - 프로그레시브 Node.js 프레임워크
- **TypeORM** ^0.3.27 - 강력한 ORM 지원
- **MySQL** 2 - 프로덕션급 RDBMS
- **@nestjs-jsonapi/monorepo** - JSON:API 1.1 스펙 구현

### 보안 & 검증

- **Helmet** ^8.1.0 - HTTP 헤더 보안 강화
- **@nestjs/throttler** ^6.4.0 - Rate Limiting
- **class-validator** ^0.14.2 - 입력 검증
- **class-transformer** ^0.5.1 - 데이터 변환

### 문서화 & API

- **@nestjs/swagger** ^11.2.3 - OpenAPI/Swagger 자동 문서화
- **nestjs-i18n** ^10.5.1 - 다국어 지원

### 로깅 & 모니터링

- **nest-winston** ^1.10.2 - 구조화된 로그 관리
- **winston** ^3.18.3 - 로깅 라이브러리
- **@nestjs/terminus** ^11.0.0 - 헬스체크

### 테스팅

- **Jest** ^30.0.0 - 테스팅 프레임워크
- **@faker-js/faker** ^10.1.0 - 테스트 데이터 생성
- **fishery** ^2.3.1 - 팩토리 패턴 테스트 데이터

## 프로젝트 구조

```
template-typescript-nestjs/
├── src/
│   ├── common/              # 공통 모듈 및 유틸리티
│   │   ├── base/           # Base 엔티티 및 DTO
│   │   ├── decorators/     # 커스텀 데코레이터
│   │   ├── filters/        # 예외 필터
│   │   ├── interceptors/   # 인터셉터
│   │   ├── pipes/          # 파이프
│   │   └── utils/          # 유틸리티 함수
│   ├── config/             # 환경 설정
│   ├── modules/            # 기능 모듈
│   │   └── example/        # Example 모듈 (참조용)
│   ├── shared/             # 공유 모듈
│   │   ├── health/         # 헬스체크
│   │   ├── i18n/           # 다국어 설정
│   │   └── logger/         # 로거 설정
│   ├── app.module.ts       # 루트 모듈
│   └── main.ts             # 진입점
├── test/                   # E2E 테스트
├── docker/                 # Docker 설정
├── i18n/                   # 다국어 리소스 파일
│   ├── ko/                 # 한국어
│   └── en/                 # 영어
├── docs/                   # 문서
│   └── package/            # 패키지 문서
│       └── nestjs-crud/    # JSON:API 사용법
└── .github/                # GitHub Actions
```

## JSON:API 패키지 개요

이 프로젝트는 `@nestjs-jsonapi/monorepo` 패키지를 사용하여 JSON:API 1.1 스펙을 구현합니다.

### 주요 기능

- ✅ 완전한 JSON:API 1.1 준수
- ✅ TypeScript 완벽 지원 (Strict 모드)
- ✅ TypeORM 어댑터 지원
- ✅ 자동 필터링, 정렬, 페이징
- ✅ 관계 데이터 지원 (include)
- ✅ OpenAPI/Swagger 통합

### 핵심 컴포넌트

- **@JsonApiResource()** - 리소스 정의 데코레이터 (타입 및 라우트 설정)
- **@JsonApiController()** - 컨트롤러 데코레이터 (경로 설정)
- **일반 TypeORM 엔티티** - 별도의 속성 데코레이터 없이 TypeORM 엔티티 직접 사용
- **JSON:API 자동 변환** - 엔티티 데이터를 JSON:API 형식으로 자동 변환

## 개발 시작 가이드

### 필수 요구사항

- Node.js >= 20.x
- pnpm >= 8.x
- MySQL (또는 Docker)

### 1. 프로젝트 설정

```bash
# 저장소 클론
git clone <repository-url>
cd template-typescript-nestjs

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일 편집
```

### 2. 데이터베이스 설정

```bash
# Docker로 MySQL 실행
pnpm run docker:dev

# 또는 로컬 MySQL 사용
# .env 파일에서 DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD 설정
```

### 3. 개발 서버 실행

```bash
# 개발 모드
pnpm run start:dev

# 디버그 모드
pnpm run start:debug
```

### 4. API 문서 확인

서버 실행 후 다음 URL에 접근:

- **API 문서**: http://localhost:3000/api-docs
- **헬스체크**: http://localhost:3000/health

### 5. 테스트 실행

```bash
# 단위 테스트
pnpm run test

# E2E 테스트
pnpm run test:e2e

# 커버리지
pnpm run test:cov
```

## 새 리소스 생성하기

새로운 API 리소스를 만들 때는 다음 순서를 따릅니다:

1. **엔티티 정의** - `src/modules/{name}/entities/{name}.entity.ts`
2. **DTO 정의** - `src/modules/{name}/dto/`
3. **서비스 생성** - `src/modules/{name}/{name}.service.ts`
4. **컨트롤러 생성** - `src/modules/{name}/{name}.controller.ts`
5. **모듈 등록** - `src/modules/{name}/{name}.module.ts`
6. **앱 모듈에 추가** - `src/app.module.ts`

자세한 내용은 다음 문서를 참조하세요:

- 모듈 작성: `src/modules/CLAUDE.md`
- 공통 유틸리티: `src/common/CLAUDE.md`
- 패키지 사용법: `docs/CLAUDE.md`

## 주요 명령어

### 개발

```bash
pnpm run start:dev         # 개발 서버 실행 (핫 리로드)
pnpm run start:debug       # 디버그 모드 실행
pnpm run build             # 프로덕션 빌드
pnpm run start:prod        # 프로덕션 실행
```

### 코드 품질

```bash
pnpm run lint              # ESLint 실행 (자동 수정)
pnpm run lint:check        # ESLint 검사만
pnpm run format            # Prettier 포맷팅
pnpm run format:check      # 포맷 검사만
pnpm run typecheck         # TypeScript 타입 검사
```

### 테스트

```bash
pnpm run test              # 단위 테스트
pnpm run test:watch        # 테스트 watch 모드
pnpm run test:e2e          # E2E 테스트
pnpm run test:cov          # 커버리지 리포트
```

### Docker

```bash
pnpm run docker:build      # Docker 이미지 빌드
pnpm run docker:up         # 프로덕션 환경 실행
pnpm run docker:down       # 프로덕션 환경 종료
pnpm run docker:dev        # 개발 환경 실행
pnpm run docker:dev:down   # 개발 환경 종료
```

## 환경 변수 설정

`.env` 파일에서 다음 환경 변수를 설정하세요:

```env
# 애플리케이션
NODE_ENV=development
PORT=3000
API_PREFIX=api/v1

# 데이터베이스
DB_TYPE=mysql
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=password
DB_DATABASE=nestjs_template
DB_SYNCHRONIZE=true  # 프로덕션에서는 false

# 보안
JWT_SECRET=your-secret-key
JWT_EXPIRATION=1d

# Rate Limiting
THROTTLE_TTL=60
THROTTLE_LIMIT=10

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 아키텍처 특징

### 계층형 아키텍처

- **Controller Layer**: HTTP 요청 처리 및 응답
- **Service Layer**: 비즈니스 로직
- **Repository Layer**: 데이터 접근 (TypeORM)

### 도메인 주도 설계 (DDD)

- 기능별 모듈 분리
- 도메인 중심 설계
- 명확한 책임 분리

### 의존성 주입 (DI)

- NestJS DI 컨테이너 활용
- 느슨한 결합
- 테스트 용이성

## 보안 기능

- **Helmet**: HTTP 헤더 보안 강화
- **Rate Limiting**: 요청 속도 제한
- **CORS**: 교차 출처 리소스 공유 설정
- **Input Validation**: class-validator를 통한 입력 검증
- **Environment Variables**: 민감 정보 환경 변수 관리

## 다국어 지원

nestjs-i18n을 사용한 다국어 지원:

- 지원 언어: 한국어(ko), 영어(en)
- `Accept-Language` 헤더 자동 감지
- 번역 파일: `i18n/{lang}/`
- 컨트롤러에서 사용: `this.i18n.translate('key')`

## 로깅

Winston을 사용한 구조화된 로깅:

- 로그 레벨: error, warn, info, debug
- 파일 로그: `logs/` 디렉토리
- 자동 로그 로테이션
- 요청 수준 추적성

## 추가 문서

- **상세 사용법**: `docs/package/nestjs-crud/HOWTOUSE.md`
- **모듈 개발 가이드**: `src/modules/CLAUDE.md`
- **공통 유틸리티**: `src/common/CLAUDE.md`
- **문서화 가이드**: `docs/CLAUDE.md`
- **아키텍처**: `docs/ARCHITECTURE.md`
- **배포 가이드**: `docs/DEPLOYMENT.md`

## 문제 해결

### 일반적인 문제

1. **모듈을 찾을 수 없음**

   ```bash
   pnpm install
   pnpm store prune && pnpm install
   ```

2. **데이터베이스 연결 실패**
   - `.env` 파일의 DB 설정 확인
   - MySQL 서버 실행 확인
   - Docker 사용 시: `pnpm run docker:dev`

3. **타입 오류**
   - TypeScript 버전 확인 (>= 5.0)
   - `pnpm run typecheck` 실행

4. **포트 충돌**
   - `.env`에서 `PORT` 변경
   - 또는 실행 중인 프로세스 종료

## 기여하기

1. 이슈 확인 또는 생성
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 라이선스

이 프로젝트는 UNLICENSED 라이선스를 따릅니다.
