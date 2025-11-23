# 기여 가이드

프로젝트에 기여해 주셔서 감사합니다! 이 문서는 프로젝트에 기여하는 방법을 설명합니다.

## 목차

- [코드 컨벤션](#코드-컨벤션)
- [커밋 메시지 규칙](#커밋-메시지-규칙)
- [Pull Request 프로세스](#pull-request-프로세스)
- [개발 환경 설정](#개발-환경-설정)
- [테스트](#테스트)

## 코드 컨벤션

### TypeScript 스타일 가이드

프로젝트는 ESLint와 Prettier를 사용하여 코드 스타일을 자동으로 관리합니다.

```bash
# 린트 검사
pnpm run lint

# 자동 수정
pnpm run lint --fix

# 포맷팅 검사
pnpm run format:check

# 자동 포맷팅
pnpm run format
```

### 주요 규칙

1. **들여쓰기**: 2 스페이스 사용
2. **세미콜론**: 항상 사용
3. **따옴표**: 싱글 쿼테이션 사용
4. **줄바꿈**: LF (Unix 스타일)
5. **파일명**: kebab-case 사용 (예: `user-service.ts`)
6. **클래스명**: PascalCase 사용 (예: `UserService`)
7. **함수/변수명**: camelCase 사용 (예: `getUserById`)
8. **상수명**: UPPER_SNAKE_CASE 사용 (예: `MAX_RETRY_COUNT`)

### NestJS 패턴

1. **모듈**: 기능별로 모듈 분리
2. **컨트롤러**: HTTP 요청 처리만 담당
3. **서비스**: 비즈니스 로직 구현
4. **리포지토리**: 데이터 접근 로직
5. **DTO**: 데이터 전송 객체, class-validator 사용
6. **엔티티**: TypeORM 엔티티

### 폴더 구조

```
src/
├── common/              # 공통 모듈
│   ├── config/          # 설정
│   ├── decorators/      # 커스텀 데코레이터
│   ├── filters/         # 예외 필터
│   ├── guards/          # 가드
│   ├── interceptors/    # 인터셉터
│   └── pipes/           # 파이프
├── modules/             # 기능 모듈
│   └── [module-name]/   # 각 모듈
│       ├── dto/         # DTO
│       ├── entities/    # 엔티티
│       ├── [module].controller.ts
│       ├── [module].service.ts
│       └── [module].module.ts
├── app.module.ts
└── main.ts
```

## 커밋 메시지 규칙

프로젝트는 [Conventional Commits](https://www.conventionalcommits.org/) 규칙을 따릅니다.

### 형식

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Type

- `feat`: 새로운 기능 추가
- `fix`: 버그 수정
- `docs`: 문서 변경
- `style`: 코드 포맷팅, 세미콜론 누락 등 (로직 변경 없음)
- `refactor`: 코드 리팩토링
- `test`: 테스트 코드 추가/수정
- `chore`: 빌드 프로세스, 도구 설정 등

### 예시

```bash
# 기능 추가
git commit -m "feat(users): 사용자 프로필 조회 API 추가"

# 버그 수정
git commit -m "fix(auth): JWT 토큰 만료 시간 오류 수정"

# 문서 업데이트
git commit -m "docs(readme): 설치 가이드 업데이트"

# 리팩토링
git commit -m "refactor(users): UserService 로직 개선"

# 테스트 추가
git commit -m "test(auth): 로그인 E2E 테스트 추가"
```

### Breaking Changes

Breaking change가 있는 경우 footer에 명시:

```
feat(api): API 응답 형식 변경

BREAKING CHANGE: API 응답 구조가 변경되었습니다.
이전: { data: {...} }
이후: { success: true, data: {...} }
```

## Pull Request 프로세스

### 1. 이슈 생성 (선택사항)

- 큰 변경사항의 경우 먼저 이슈를 생성하여 논의
- 이슈 템플릿 활용

### 2. 브랜치 생성

```bash
# Feature 브랜치
git checkout -b feature/issue-number-feature-name

# Bugfix 브랜치
git checkout -b fix/issue-number-bug-name

# 예시
git checkout -b feature/123-user-profile
git checkout -b fix/456-login-error
```

### 3. 개발

- 코드 작성
- 테스트 추가/수정
- 린트 및 포맷 확인

### 4. 커밋

```bash
# 변경사항 스테이징
git add .

# 커밋 (자동으로 lint-staged 실행)
git commit -m "feat(users): 사용자 프로필 조회 추가"
```

### 5. 푸시

```bash
git push origin feature/123-user-profile
```

### 6. Pull Request 생성

- GitHub에서 PR 생성
- PR 템플릿 작성
- 리뷰어 지정
- 라벨 추가

### PR 체크리스트

- [ ] 코드가 프로젝트의 코드 스타일 가이드를 따릅니다
- [ ] 테스트를 추가/수정했습니다
- [ ] 모든 테스트가 통과합니다
- [ ] 문서를 업데이트했습니다
- [ ] 커밋 메시지가 규칙을 따릅니다
- [ ] Breaking change가 있다면 명시했습니다

## 개발 환경 설정

### 1. 저장소 클론

```bash
git clone https://github.com/your-org/template-typescript-nestjs.git
cd template-typescript-nestjs
```

### 2. 의존성 설치

```bash
pnpm install
```

### 3. 환경 변수 설정

```bash
cp .env.example .env
# .env 파일 수정
```

### 4. 개발 서버 실행

```bash
pnpm run start:dev
```

### 5. Git Hooks 설정 확인

프로젝트는 Husky를 사용하여 Git hooks를 관리합니다:

- **pre-commit**: lint-staged 실행
- **commit-msg**: commitlint 실행

## 테스트

### 단위 테스트

```bash
# 모든 단위 테스트 실행
pnpm run test

# Watch 모드
pnpm run test:watch

# 커버리지 포함
pnpm run test:cov
```

### E2E 테스트

```bash
# E2E 테스트 실행
pnpm run test:e2e
```

### 테스트 작성 가이드

1. **파일 위치**:
   - 단위 테스트: `*.spec.ts` (소스 파일과 같은 위치)
   - E2E 테스트: `test/` 디렉토리

2. **테스트 구조**:
```typescript
describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  describe('findOne', () => {
    it('사용자를 조회해야 한다', async () => {
      // Arrange
      const userId = 1;

      // Act
      const result = await service.findOne(userId);

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(userId);
    });
  });
});
```

3. **테스트 데이터**:
   - Faker 사용: 랜덤 데이터 생성
   - Fishery 사용: Factory 패턴

## 리뷰 프로세스

### 리뷰어 가이드

1. **코드 품질 검토**
   - 코드 스타일 준수
   - 로직의 정확성
   - 에러 처리

2. **테스트 검토**
   - 테스트 커버리지
   - 테스트의 적절성

3. **문서 검토**
   - 주석의 적절성
   - README 업데이트 필요 여부

### PR 작성자 가이드

1. **설명 작성**
   - 변경사항 요약
   - 관련 이슈 링크
   - 스크린샷 (UI 변경 시)

2. **리뷰 반영**
   - 리뷰 코멘트에 대응
   - 변경사항 커밋

3. **Merge**
   - 승인 후 Squash and Merge

## 질문이 있나요?

- GitHub Issues를 통해 질문
- 디스커션 참여

## 라이선스

프로젝트에 기여함으로써 귀하의 기여가 프로젝트와 동일한 라이선스 하에 있다는 것에 동의합니다.
