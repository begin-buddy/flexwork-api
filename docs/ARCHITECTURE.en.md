# Architecture Documentation

[English](./ARCHITECTURE.en.md) | [한국어](./ARCHITECTURE.md)

This document describes the architecture of the NestJS Template project.

## Table of Contents

- [Overall Structure](#overall-structure)
- [Layered Architecture](#layered-architecture)
- [Module Structure](#module-structure)
- [Design Patterns](#design-patterns)
- [Security Architecture](#security-architecture)

## Overall Structure

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

## Layered Architecture

### 1. Presentation Layer

**Role**: HTTP request/response handling, input validation

**Components**:
- **Controllers**: HTTP endpoint definition
- **DTOs**: Data Transfer Objects, input validation
- **Swagger**: API documentation

**Example**:
```typescript
@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get user' })
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(+id);
  }
}
```

### 2. Application Layer

**Role**: Business logic implementation, transaction management

**Components**:
- **Services**: Business logic
- **Use Cases**: Application use cases

**Example**:
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
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
```

### 3. Domain Layer

**Role**: Core business entities and rules

**Components**:
- **Entities**: Domain objects
- **Value Objects**: Value objects
- **Domain Events**: Domain events

**Example**:
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

### 4. Infrastructure Layer

**Role**: Communication with external systems

**Components**:
- **Database**: TypeORM connection
- **External APIs**: External API clients
- **File Storage**: File storage
- **Messaging**: Message queues

## Module Structure

### Core Modules

#### AppModule
- **Role**: Root module, overall application configuration
- **Dependencies**: Imports all feature modules

#### ConfigModule
- **Role**: Environment variable management
- **Features**:
  - Validation via Joi
  - Type safety
  - Environment-specific configuration separation

#### DatabaseModule
- **Role**: Database connection configuration
- **Features**:
  - TypeORM configuration
  - Connection pool management
  - Migration support

### Feature Modules

Each feature module follows this structure:

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
- **Role**: User management
- **Features**:
  - User CRUD
  - Profile management
  - Permission management

#### AuthModule
- **Role**: Authentication/Authorization
- **Features**:
  - Login/Logout
  - JWT token issuance
  - Password management

### Common Modules

#### Filters
- **AllExceptionsFilter**: Global exception handling
- **HttpExceptionFilter**: HTTP exception handling

#### Guards
- **JwtAuthGuard**: JWT authentication guard
- **RolesGuard**: Role-based access control

#### Interceptors
- **LoggingInterceptor**: Request/response logging
- **TransformInterceptor**: Response transformation

#### Pipes
- **ValidationPipe**: Input validation
- **ParseIntPipe**: Parameter transformation

## Design Patterns

### 1. Dependency Injection

Implementing loose coupling using NestJS DI container:

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

### 2. Repository Pattern

Abstracting data access logic:

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

### 3. Factory Pattern

Test data generation:

```typescript
export const userFactory = Factory.define<User>(({ sequence }) => ({
  id: sequence,
  email: faker.internet.email(),
  name: faker.person.fullName(),
}));
```

### 4. Decorator Pattern

Handling cross-cutting concerns:

```typescript
@UseGuards(JwtAuthGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('users')
export class UsersController {}
```

### 5. Strategy Pattern

Various authentication strategies:

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

## Security Architecture

### 1. Authentication

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│ Client  │─────▶│  Guard   │─────▶│ Service │
└─────────┘      └──────────┘      └─────────┘
                      │
                      ▼
                 JWT Verify
```

### 2. Authorization

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│ Request │─────▶│  Roles   │─────▶│  Allow  │
└─────────┘      │  Guard   │      │  Deny   │
                 └──────────┘      └─────────┘
```

### 3. Input Validation

```
┌─────────┐      ┌──────────┐      ┌─────────┐
│  Input  │─────▶│   Pipe   │─────▶│   DTO   │
└─────────┘      └──────────┘      └─────────┘
                      │
                      ▼
              Validation Rules
```

## Data Flow

### Request Processing Flow

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

## Scalability Considerations

### 1. Horizontal Scaling

- Stateless architecture
- Session externalization (Redis)
- Load balancer support

### 2. Vertical Scaling

- Connection pool optimization
- Caching strategy
- Query optimization

### 3. Microservices Transition

Transitioning from current monolithic structure to microservices:

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

## Performance Optimization

### 1. Database

- Index optimization
- Connection pool configuration
- Query optimization

### 2. Caching

- Redis cache layer
- HTTP cache headers
- Result caching

### 3. Asynchronous Processing

- Message queues (Bull, RabbitMQ)
- Event-driven architecture

## Monitoring and Logging

### Logging Strategy

```typescript
// Structured logging
logger.log({
  context: 'UsersService',
  method: 'findOne',
  userId: id,
  timestamp: new Date(),
});
```

### Metrics Collection

- Response time
- Error rate
- Active connections
- Throughput

## References

- [NestJS Official Documentation](https://docs.nestjs.com/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
