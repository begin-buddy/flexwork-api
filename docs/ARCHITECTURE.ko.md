# 아키텍처 설명

[English](./ARCHITECTURE.md) | 한국어

NestJS Template 프로젝트의 아키텍처를 설명합니다.

## 목차

- [전체 구조](#전체-구조)
- [계층 아키텍처](#계층-아키텍처)
- [모듈 구조](#모듈-구조)
- [디자인 패턴](#디자인-패턴)
- [보안 아키텍처](#보안-아키텍처)

## 전체 구조

```
┌─────────────────────────────────────────┐
│          Presentation Layer             │
│   (Controllers, DTOs, Swagger)          │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Application Layer              │
│   (Services, Use Cases)                 │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│          Domain Layer                   │
│   (Entities, Business Logic)            │
└─────────────┬───────────────────────────┘
              │
┌─────────────▼───────────────────────────┐
│       Infrastructure Layer              │
│   (Database, External APIs)             │
└─────────────────────────────────────────┘
```

## 계층 아키텍처

### 1. Presentation Layer (표현 계층)

**역할**: HTTP 요청/응답 처리, 입력 검증

**구성요소**:
- **Controllers**: HTTP 엔드포인트 정의
- **DTOs**: 데이터 전송 객체, 입력 검증
- **Swagger**: API 문서화

**예시**:
```typescript
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: '사용자 조회' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
```

### 2. Application Layer (응용 계층)

**역할**: 비즈니스 로직 구현, 트랜잭션 관리

**구성요소**:
- **Services**: 비즈니스 로직
- **Use Cases**: 애플리케이션 유즈케이스

**예시**:
```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다');
    }
    return user;
  }
}
```

### 3. Domain Layer (도메인 계층)

**역할**: 핵심 비즈니스 엔티티 및 규칙

**구성요소**:
- **Entities**: 도메인 객체
- **Value Objects**: 값 객체
- **Domain Events**: 도메인 이벤트

**예시**:
```typescript
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### 4. Infrastructure Layer (인프라 계층)

**역할**: 외부 시스템과의 통신

**구성요소**:
- **Database**: TypeORM 연결
- **External APIs**: 외부 API 클라이언트
- **File Storage**: 파일 저장소
- **Messaging**: 메시지 큐

## 모듈 구조

### Core Modules (핵심 모듈)

#### AppModule
- **역할**: 루트 모듈, 전체 애플리케이션 설정
- **의존성**: 모든 기능 모듈 임포트

#### ConfigModule
- **역할**: 환경 변수 관리
- **특징**:
  - Joi를 통한 검증
  - 타입 안전성
  - 환경별 설정 분리

#### DatabaseModule
- **역할**: 데이터베이스 연결 설정
- **특징**:
  - TypeORM 설정
  - Connection Pool 관리
  - Migration 지원

### Feature Modules (기능 모듈)

각 기능 모듈은 다음 구조를 따릅니다:

```
users/
├── dto/
│   ├── create-user.dto.ts
│   └── update-user.dto.ts
├── entities/
│   └── user.entity.ts
├── users.controller.ts
├── users.service.ts
├── users.service.spec.ts
└── users.module.ts
```

#### UsersModule
- **역할**: 사용자 관리
- **기능**:
  - 사용자 CRUD
  - 프로필 관리
  - 권한 관리

#### AuthModule
- **역할**: 인증/인가
- **기능**:
  - 로그인/로그아웃
  - JWT 토큰 발급
  - 비밀번호 관리

### Common Modules (공통 모듈)

#### Filters
- **AllExceptionsFilter**: 전역 예외 처리
- **HttpExceptionFilter**: HTTP 예외 처리

#### Guards
- **JwtAuthGuard**: JWT 인증 가드
- **RolesGuard**: 역할 기반 접근 제어

#### Interceptors
- **LoggingInterceptor**: 요청/응답 로깅
- **TransformInterceptor**: 응답 변환

#### Pipes
- **ValidationPipe**: 입력 검증
- **ParseIntPipe**: 파라미터 변환

## 디자인 패턴

### 1. Dependency Injection (의존성 주입)

NestJS의 DI 컨테이너를 활용하여 느슨한 결합 구현:

```typescript
@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly configService: ConfigService,
  ) {}
}
```

### 2. Repository Pattern (리포지토리 패턴)

데이터 접근 로직 추상화:

```typescript
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findAll(): Promise<User[]> {
    return this.usersRepository.find();
  }
}
```

### 3. Factory Pattern (팩토리 패턴)

테스트 데이터 생성:

```typescript
export const userFactory = Factory.define<User>(({ sequence }) => ({
  id: sequence,
  email: faker.internet.email(),
  name: faker.person.fullName(),
}));
```

### 4. Decorator Pattern (데코레이터 패턴)

횡단 관심사 처리:

```typescript
@UseGuards(JwtAuthGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {}
```

### 5. Strategy Pattern (전략 패턴)

다양한 인증 전략:

```typescript
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }
}
```

## 보안 아키텍처

### 1. 인증 (Authentication)

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│ Client  │─────▶│  Guard   │─────▶│ Service │
└─────────┘      └──────────┘      └─────────┘
                      │
                      ▼
                 JWT Verify
```

### 2. 인가 (Authorization)

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│ Request │─────▶│  Roles   │─────▶│  Allow  │
└─────────┘      │  Guard   │      │  Deny   │
                 └──────────┘      └─────────┘
```

### 3. 입력 검증

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│  Input  │─────▶│   Pipe   │─────▶│   DTO   │
└─────────┘      └──────────┘      └─────────┘
                      │
                      ▼
              Validation Rules
```

## 데이터 흐름

### 요청 처리 흐름

```
1. HTTP Request
   │
2. Middleware (CORS, Helmet)
   │
3. Guard (Authentication)
   │
4. Interceptor (Before)
   │
5. Pipe (Validation)
   │
6. Controller
   │
7. Service
   │
8. Repository
   │
9. Database
   │
10. Interceptor (After)
    │
11. Filter (Exception)
    │
12. HTTP Response
```

## 확장성 고려사항

### 1. 수평 확장 (Horizontal Scaling)

- Stateless 아키텍처
- 세션 외부화 (Redis)
- 로드 밸런서 지원

### 2. 수직 확장 (Vertical Scaling)

- Connection Pool 최적화
- 캐싱 전략
- 쿼리 최적화

### 3. 마이크로서비스 전환

현재 모놀리식 구조에서 마이크로서비스로 전환 시:

```
┌──────────────────────────────────┐
│       API Gateway                │
└────────┬─────────────────────────┘
         │
    ┌────┴────┬────────┬────────┐
    │         │        │        │
┌───▼───┐ ┌──▼──┐ ┌──▼──┐ ┌───▼───┐
│ Users │ │Auth │ │Posts│ │Orders │
│Service│ │Svc  │ │Svc  │ │Service│
└───────┘ └─────┘ └─────┘ └───────┘
```

## 성능 최적화

### 1. 데이터베이스

- 인덱스 최적화
- Connection Pool 설정
- Query 최적화

### 2. 캐싱

- Redis 캐시 레이어
- HTTP 캐시 헤더
- 결과 캐싱

### 3. 비동기 처리

- 메시지 큐 (Bull, RabbitMQ)
- 이벤트 드리븐 아키텍처

## 모니터링 및 로깅

### 로깅 전략

```typescript
// 구조화된 로깅
logger.log({
  context: 'UsersService',
  method: 'findOne',
  userId: id,
  timestamp: new Date(),
});
```

### 메트릭 수집

- 응답 시간
- 에러율
- 활성 연결 수
- 처리량 (Throughput)

## 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
