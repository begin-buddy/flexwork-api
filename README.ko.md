# NestJS Template - Enterprise Grade

[English](./README.md) | 한국어

프로덕션 수준의 NestJS 프로젝트 템플릿입니다. 보안, 국제화, 테스트, CI/CD가 모두 설정되어 있습니다.

[![CI](https://github.com/your-org/template-typescript-nestjs/workflows/CI/badge.svg)](https://github.com/your-org/template-typescript-nestjs/actions)
[![codecov](https://codecov.io/gh/your-org/template-typescript-nestjs/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/template-typescript-nestjs)
[![Docker](https://github.com/your-org/template-typescript-nestjs/workflows/Docker%20Build%20%26%20Push/badge.svg)](https://github.com/your-org/template-typescript-nestjs/actions)

## ✨ 주요 기능

### 🏗️ 아키텍처
- **Layered Architecture** - Controller, Service, Repository 계층 분리
- **Domain-Driven Design** - 도메인 중심 설계
- **Dependency Injection** - NestJS DI 컨테이너 활용
- **모듈화 구조** - 기능별 모듈 분리

### 🔒 보안
- **Helmet** - HTTP 헤더 보안 강화
- **Rate Limiting** - 요청 속도 제한 (Throttler)
- **CORS** - Cross-Origin Resource Sharing 설정
- **Input Validation** - class-validator를 통한 입력 검증
- **환경 변수 관리** - .env 파일 및 ConfigModule

### 🌍 국제화 (i18n)
- **다국어 지원** - nestjs-i18n 라이브러리
- **언어별 메시지** - 한국어, 영어 등 지원
- **유효성 검증 메시지** - 다국어 에러 메시지
- **Accept-Language 헤더** - 자동 언어 감지

### 📊 데이터베이스
- **TypeORM** - 강력한 ORM 지원
- **MySQL** - 프로덕션 레벨 RDBMS
- **Migration** - 데이터베이스 스키마 버전 관리
- **Repository Pattern** - 데이터 접근 계층 추상화

### 📝 로깅
- **Winston** - 구조화된 로그 관리
- **로그 레벨** - error, warn, info, debug
- **파일 로깅** - 로그 파일 자동 로테이션
- **컨텍스트 로그** - 요청별 추적 가능

### 🧪 테스트
- **Jest** - 단위 테스트 및 통합 테스트
- **E2E 테스트** - 엔드투엔드 테스트
- **Faker & Fishery** - 테스트 데이터 생성
- **코드 커버리지** - 테스트 커버리지 측정

### 📚 API 문서
- **Swagger/OpenAPI** - 자동 API 문서화
- **DTO 스키마** - 자동 스키마 생성
- **API 테스트** - Swagger UI에서 직접 테스트

### 🚀 DevOps
- **Docker** - 멀티 스테이지 빌드
- **Docker Compose** - 개발 및 프로덕션 환경
- **GitHub Actions** - CI/CD 파이프라인
- **헬스체크** - 애플리케이션 상태 모니터링

### 📋 코드 품질
- **ESLint** - TypeScript 린팅
- **Prettier** - 코드 포맷팅
- **Husky** - Git hooks
- **Lint-staged** - 커밋 전 자동 검사
- **Commitlint** - 커밋 메시지 규칙

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 20.x
- pnpm 8.x
- Docker & Docker Compose (선택사항)

### 설치

```bash
# 저장소 클론
git clone https://github.com/your-org/template-typescript-nestjs.git
cd template-typescript-nestjs

# 의존성 설치
pnpm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 수정하여 환경 변수 설정
```

### 개발 서버 실행

```bash
# 개발 모드
pnpm run start:dev

# 디버그 모드
pnpm run start:debug
```

애플리케이션이 http://localhost:3000 에서 실행됩니다.

- **API 문서**: http://localhost:3000/api-docs
- **헬스체크**: http://localhost:3000/health

### Docker로 실행

```bash
# 개발 환경
pnpm run docker:dev

# 프로덕션 환경
pnpm run docker:up
```

## 📖 문서

자세한 문서는 [docs](./docs) 디렉토리를 참고하세요:

- [아키텍처 설명](./docs/ARCHITECTURE.ko.md)
- [API 문서](./docs/API.ko.md)
- [개발 가이드](./docs/DEVELOPMENT.ko.md)
- [배포 가이드](./docs/DEPLOYMENT.ko.md)

## 🧪 테스트

```bash
# 단위 테스트
pnpm run test

# E2E 테스트
pnpm run test:e2e

# 테스트 커버리지
pnpm run test:cov

# 테스트 watch 모드
pnpm run test:watch
```

## 🏗️ 빌드

```bash
# 프로덕션 빌드
pnpm run build

# 프로덕션 실행
pnpm run start:prod
```

## 📁 프로젝트 구조

```
template-typescript-nestjs/
├── src/
│   ├── common/           # 공통 모듈
│   │   ├── config/       # 설정 (database, app)
│   │   ├── decorators/   # 커스텀 데코레이터
│   │   ├── filters/      # 예외 필터
│   │   ├── guards/       # 가드
│   │   ├── interceptors/ # 인터셉터
│   │   └── pipes/        # 파이프
│   ├── modules/          # 기능 모듈
│   │   ├── auth/         # 인증 모듈
│   │   └── users/        # 사용자 모듈
│   ├── app.module.ts     # 루트 모듈
│   └── main.ts           # 진입점
├── test/                 # E2E 테스트
├── docker/               # Docker 설정
├── i18n/                 # 국제화 파일
├── docs/                 # 문서
└── .github/              # GitHub Actions
```

## 🤝 기여하기

기여는 언제나 환영합니다! [CONTRIBUTING.md](./CONTRIBUTING.md)를 참고해주세요.

### 개발 워크플로우

1. 이슈 확인 또는 생성
2. Feature 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'feat: add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 생성

## 📝 라이선스

이 프로젝트는 UNLICENSED 라이선스입니다.

## 📧 문의

프로젝트 관련 문의사항은 이슈를 생성해주세요.

---

Made with ❤️ using NestJS
