# 테스트 설정 가이드

이 프로젝트는 Jest, Fishery, Faker를 사용한 포괄적인 테스트 환경을 제공합니다.

## 디렉토리 구조

```
test/
├── factories/          # Fishery 팩토리 정의
│   ├── user.factory.ts
│   ├── post.factory.ts
│   └── index.ts
├── fixtures/           # 정적 테스트 데이터
│   ├── users.fixture.ts
│   └── index.ts
├── utils/              # 테스트 유틸리티
│   ├── factory-helper.ts
│   ├── test-module.builder.ts
│   └── index.ts
├── setup.ts            # Jest 전역 설정
├── jest-e2e.json       # E2E 테스트 설정
└── app.e2e-spec.ts     # E2E 테스트 예제
```

## 테스트 실행

### Unit 테스트

```bash
# 모든 테스트 실행
npm test

# Watch 모드
npm run test:watch

# 커버리지 리포트
npm run test:cov

# 디버그 모드
npm run test:debug
```

### E2E 테스트

```bash
# E2E 테스트 실행
npm run test:e2e
```

## 팩토리 사용 예제

### 기본 사용

```typescript
import { userFactory, postFactory } from '@test/factories';

describe('User Service', () => {
  it('사용자 생성 테스트', () => {
    // 기본 사용자 생성
    const user = userFactory.build();

    expect(user.id).toBeDefined();
    expect(user.email).toContain('@');
  });
});
```

### 속성 오버라이드

```typescript
const adminUser = userFactory.build({
  email: 'admin@example.com',
  isActive: true,
});
```

### 여러 객체 생성

```typescript
const users = userFactory.buildList(10);
```

### 관계 설정

```typescript
const author = userFactory.build();
const post = postFactory.build({
  author,
  authorId: author.id,
});
```

## 테스트 유틸리티

### TestModule Builder

```typescript
import { createTestingModule, createMockRepository } from '@test/utils';

const module = await createTestingModule({
  providers: [MyService],
  mocks: [MyRepository],
});

const service = module.get(MyService);
```

### Factory Helpers

```typescript
import {
  generateKoreanName,
  generateKoreanPhoneNumber,
  setSeed,
} from '@test/utils';

// 재현 가능한 테스트 데이터 생성
setSeed(12345);
const user1 = userFactory.build();

setSeed(12345);
const user2 = userFactory.build();

// user1과 user2는 동일한 데이터
```

## 픽스처 사용

```typescript
import { ADMIN_USER, REGULAR_USER } from '@test/fixtures';

it('관리자 권한 테스트', () => {
  const result = checkPermissions(ADMIN_USER);
  expect(result).toBe(true);
});
```

## 커버리지 목표

- **Unit 테스트**: 80% 이상
- **E2E 테스트**: 70% 이상

현재 설정은 템플릿 프로젝트이므로 70%로 설정되어 있습니다. 실제 프로젝트에서는 `jest.config.js`의 `coverageThreshold`를 80%로 상향 조정하세요.

## 모범 사례

### Given-When-Then 패턴

```typescript
it('사용자 생성 테스트', () => {
  // Given - 테스트 준비
  const userData = userFactory.build();

  // When - 테스트 실행
  const result = service.create(userData);

  // Then - 결과 검증
  expect(result).toBeDefined();
  expect(result.id).toBe(userData.id);
});
```

### 테스트 격리

```typescript
describe('UserService', () => {
  let service: UserService;
  let repository: MockType<UserRepository>;

  beforeEach(async () => {
    const module = await createTestingModule({
      providers: [UserService],
      mocks: [UserRepository],
    });

    service = module.get(UserService);
    repository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
```

### 모킹

```typescript
// 리포지토리 모킹
const mockRepository = createMockRepository();
mockRepository.findOne.mockResolvedValue(userFactory.build());

// 서비스 모킹
const mockService = createMockService(['create', 'findAll']);
mockService.create.mockResolvedValue(result);
```

## 주의사항

- 팩토리는 테스트 데이터 생성에만 사용하세요
- 픽스처는 특정 시나리오에서 재사용 가능한 고정 데이터입니다
- 테스트 간 독립성을 유지하세요 (beforeEach, afterEach 활용)
- Mock 객체는 테스트 종료 후 정리하세요

## 추가 리소스

- [Jest 공식 문서](https://jestjs.io/)
- [Fishery 공식 문서](https://github.com/thoughtbot/fishery)
- [Faker 공식 문서](https://fakerjs.dev/)
- [NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
