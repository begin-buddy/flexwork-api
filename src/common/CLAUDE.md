# 공통 유틸리티 가이드

> 프로젝트 전반에서 사용되는 공통 컴포넌트 활용법

## 디렉토리 구조

```
src/common/
├── base/               # 기본 클래스
│   ├── base.entity.ts # 기본 엔티티
│   └── base.dto.ts    # 기본 DTO
├── decorators/         # 커스텀 데코레이터
│   ├── api-response.decorator.ts
│   ├── current-user.decorator.ts
│   ├── public.decorator.ts
│   ├── roles.decorator.ts
│   └── throttle.decorator.ts
├── filters/            # 예외 필터
│   └── http-exception.filter.ts
├── interceptors/       # 인터셉터
│   ├── logging.interceptor.ts
│   └── transform.interceptor.ts
├── pipes/              # 파이프
│   └── validation.pipe.ts
└── utils/              # 유틸리티 함수
    ├── pagination.util.ts
    ├── string.util.ts
    ├── hash.util.ts
    └── date.util.ts
```

## Base 클래스

### BaseEntity

모든 엔티티가 상속받아야 하는 기본 엔티티 클래스입니다.

```typescript
// src/common/base/base.entity.ts
import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseEntity {
  @ApiProperty({
    description: '고유 ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({
    description: '삭제일시',
    example: null,
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}
```

**사용 예제:**

```typescript
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../common/base/base.entity';

@Entity('users')
export class User extends BaseEntity {
  // id, createdAt, updatedAt, deletedAt이 자동으로 포함됨
  @Column()
  name!: string;
}
```

**제공 필드:**
- `id`: 자동 증가하는 Primary Key
- `createdAt`: 레코드 생성 시각 (자동 설정)
- `updatedAt`: 레코드 수정 시각 (자동 갱신)
- `deletedAt`: Soft Delete 시각 (null이면 삭제되지 않음)

### BaseDto

응답 DTO가 상속받는 기본 클래스입니다.

```typescript
// src/common/base/base.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export abstract class BaseDto {
  @ApiProperty({
    description: '고유 ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;
}
```

**사용 예제:**

```typescript
import { BaseDto } from '../../common/base/base.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto extends BaseDto {
  // id, createdAt, updatedAt이 자동으로 포함됨
  @ApiProperty({ description: '사용자 이름' })
  name!: string;
}
```

## 데코레이터

### @Public() - 인증 우회

인증이 필요 없는 엔드포인트를 표시합니다.

```typescript
import { Public } from '../../common/decorators/public.decorator';

@Controller('users')
export class UserController {
  @Get()
  @Public() // 이 엔드포인트는 인증 불필요
  async findAll() {
    // ...
  }
}
```

### @CurrentUser() - 현재 사용자 정보

요청에서 현재 사용자 정보를 추출합니다.

```typescript
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('profile')
export class ProfileController {
  @Get()
  async getProfile(@CurrentUser() user: User) {
    return user; // 현재 로그인한 사용자 정보
  }
}
```

### @Roles() - 역할 기반 접근 제어

특정 역할만 접근 가능한 엔드포인트를 정의합니다.

```typescript
import { Roles } from '../../common/decorators/roles.decorator';

@Controller('admin')
export class AdminController {
  @Get('users')
  @Roles('admin') // 관리자만 접근 가능
  async getAllUsers() {
    // ...
  }

  @Delete(':id')
  @Roles('admin', 'moderator') // 관리자 또는 중재자
  async deleteUser(@Param('id') id: number) {
    // ...
  }
}
```

### @ApiSuccessResponse() / @ApiCreatedResponse()

Swagger 응답 문서화를 간편하게 합니다.

```typescript
import {
  ApiSuccessResponse,
  ApiCreatedResponse,
} from '../../common/decorators/api-response.decorator';
import { UserResponseDto } from './dto/response-user.dto';

@Controller('users')
export class UserController {
  // 단일 리소스 응답 (200 OK)
  @Get(':id')
  @ApiSuccessResponse(UserResponseDto)
  async findOne(@Param('id') id: number) {
    // ...
  }

  // 목록 응답 (200 OK)
  @Get()
  @ApiSuccessResponse(UserResponseDto, true) // true = 배열
  async findAll() {
    // ...
  }

  // 생성 응답 (201 Created)
  @Post()
  @ApiCreatedResponse(UserResponseDto)
  async create(@Body() createDto: CreateUserDto) {
    // ...
  }
}
```

### @CustomThrottle() - 개별 Rate Limiting

특정 엔드포인트에 대한 Rate Limiting을 설정합니다.

```typescript
import { CustomThrottle } from '../../common/decorators/throttle.decorator';

@Controller('auth')
export class AuthController {
  @Post('login')
  @CustomThrottle({ ttl: 60, limit: 5 }) // 60초당 5번만 허용
  async login(@Body() loginDto: LoginDto) {
    // ...
  }
}
```

## 파이프

### ValidationPipe - 입력 검증

자동으로 DTO 검증을 수행합니다. `main.ts`에서 전역으로 설정되어 있습니다.

```typescript
// main.ts (이미 설정됨)
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,        // DTO에 정의되지 않은 속성 제거
    forbidNonWhitelisted: true, // 허용되지 않은 속성 있으면 에러
    transform: true,        // 타입 자동 변환
  }),
);
```

**사용 예제:**

```typescript
import { IsString, IsInt, Min, Max } from 'class-validator';

export class CreateUserDto {
  @IsString()
  name!: string; // 문자열이 아니면 자동으로 400 에러

  @IsInt()
  @Min(1)
  @Max(120)
  age!: number; // 1~120 범위가 아니면 에러
}
```

## 인터셉터

### LoggingInterceptor - 요청/응답 로깅

모든 HTTP 요청과 응답을 자동으로 로깅합니다.

```typescript
// main.ts (이미 설정됨)
app.useGlobalInterceptors(new LoggingInterceptor());
```

**로그 출력 예:**
```
[HTTP] GET /users - 127.0.0.1 - 150ms
```

### TransformInterceptor - 응답 변환

응답을 일관된 형식으로 변환합니다.

```typescript
// main.ts (이미 설정됨)
app.useGlobalInterceptors(new TransformInterceptor());
```

**변환 전:**
```json
{ "id": 1, "name": "홍길동" }
```

**변환 후:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "홍길동" },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## 필터

### HttpExceptionFilter - 예외 처리

모든 HTTP 예외를 일관된 형식으로 처리합니다.

```typescript
// main.ts (이미 설정됨)
app.useGlobalFilters(new HttpExceptionFilter());
```

**에러 응답 형식:**
```json
{
  "success": false,
  "statusCode": 404,
  "message": "User with ID 1 not found",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/users/1"
}
```

## 유틸리티 함수

### pagination.util.ts - 페이지네이션

Repository나 QueryBuilder에 페이지네이션을 쉽게 적용합니다.

```typescript
import { paginate } from '../../common/utils/pagination.util';

// Repository와 함께 사용
async findAll(page: number = 1, limit: number = 10) {
  return await paginate(this.userRepository, { page, limit });
}

// QueryBuilder와 함께 사용
async findActive(page: number = 1, limit: number = 10) {
  const queryBuilder = this.userRepository
    .createQueryBuilder('user')
    .where('user.isActive = :isActive', { isActive: true });

  return await paginate(queryBuilder, { page, limit });
}
```

**응답 형식:**
```json
{
  "data": [...],
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

### string.util.ts - 문자열 유틸리티

```typescript
import {
  toCamelCase,
  toSnakeCase,
  toKebabCase,
  capitalize,
  truncate,
} from '../../common/utils/string.util';

// 카멜 케이스 변환
toCamelCase('hello_world'); // 'helloWorld'

// 스네이크 케이스 변환
toSnakeCase('helloWorld'); // 'hello_world'

// 케밥 케이스 변환
toKebabCase('helloWorld'); // 'hello-world'

// 첫 글자 대문자
capitalize('hello'); // 'Hello'

// 문자열 자르기
truncate('매우 긴 텍스트입니다', 10); // '매우 긴 텍스트...'
```

### hash.util.ts - 해시 및 암호화

```typescript
import {
  hashPassword,
  comparePassword,
  generateRandomString,
} from '../../common/utils/hash.util';

// 비밀번호 해시화
const hashed = await hashPassword('mypassword');

// 비밀번호 비교
const isMatch = await comparePassword('mypassword', hashed); // true

// 랜덤 문자열 생성 (토큰 등)
const token = generateRandomString(32); // 32자리 랜덤 문자열
```

### date.util.ts - 날짜 유틸리티

```typescript
import {
  formatDate,
  addDays,
  subtractDays,
  diffInDays,
  isExpired,
} from '../../common/utils/date.util';

// 날짜 포맷팅
formatDate(new Date(), 'YYYY-MM-DD'); // '2024-01-01'

// 날짜 더하기
const tomorrow = addDays(new Date(), 1);

// 날짜 빼기
const yesterday = subtractDays(new Date(), 1);

// 날짜 차이 (일 단위)
const diff = diffInDays(date1, date2);

// 만료 확인
const expired = isExpired(expiryDate); // true/false
```

## 실전 사용 예제

### 완전한 컨트롤러 예제

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

// 공통 데코레이터
import {
  ApiSuccessResponse,
  ApiCreatedResponse,
} from '../../common/decorators/api-response.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CustomThrottle } from '../../common/decorators/throttle.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // 공개 엔드포인트 + Rate Limiting
  @Post()
  @Public()
  @CustomThrottle({ ttl: 60, limit: 10 })
  @ApiOperation({ summary: '사용자 등록' })
  @ApiCreatedResponse(UserResponseDto)
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  // 역할 제한 엔드포인트
  @Get('all')
  @Roles('admin')
  @ApiOperation({ summary: '모든 사용자 조회 (관리자 전용)' })
  @ApiSuccessResponse(UserResponseDto, true)
  async findAll() {
    return await this.userService.findAll();
  }

  // 현재 사용자 정보 활용
  @Get('me')
  @ApiOperation({ summary: '내 정보 조회' })
  @ApiSuccessResponse(UserResponseDto)
  async getMyProfile(@CurrentUser() user: User) {
    return user;
  }

  // 페이지네이션
  @Get()
  @Public()
  @ApiOperation({ summary: '사용자 목록 조회' })
  @ApiSuccessResponse(UserResponseDto, true)
  async findPaginated(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.userService.findAll(page, limit);
  }
}
```

### 완전한 서비스 예제

```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

// 공통 유틸리티
import { paginate } from '../../common/utils/pagination.util';
import { hashPassword } from '../../common/utils/hash.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 생성 (비밀번호 해시화)
  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await hashPassword(createUserDto.password);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return await this.userRepository.save(user);
  }

  // 페이지네이션 조회
  async findAll(page: number = 1, limit: number = 10) {
    return await paginate(this.userRepository, { page, limit });
  }

  // 단일 조회 (에러 처리)
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
```

## 모범 사례

### 1. 항상 BaseEntity 상속
```typescript
// ✅ 좋은 예
@Entity('users')
export class User extends BaseEntity {
  @Column()
  name!: string;
}

// ❌ 나쁜 예
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // 수동으로 정의하지 말 것
}
```

### 2. 데코레이터 적극 활용
```typescript
// ✅ 좋은 예
@Get()
@Public()
@CustomThrottle({ ttl: 60, limit: 10 })
@ApiSuccessResponse(UserResponseDto, true)
async findAll() {}

// ❌ 나쁜 예
@Get()
async findAll() {
  // Rate limiting, 문서화 등이 누락됨
}
```

### 3. 유틸리티 함수 재사용
```typescript
// ✅ 좋은 예
import { paginate } from '../../common/utils/pagination.util';
return await paginate(this.repository, { page, limit });

// ❌ 나쁜 예
const skip = (page - 1) * limit;
const data = await this.repository.find({ skip, take: limit });
// 중복 코드, 메타 정보 누락
```

### 4. 에러 처리 일관성
```typescript
// ✅ 좋은 예
if (!user) {
  throw new NotFoundException(`User with ID ${id} not found`);
}

// ❌ 나쁜 예
if (!user) {
  return null; // 에러를 명확하게 표현하지 않음
}
```

## 추가 참조

- **모듈 작성 가이드**: `src/modules/CLAUDE.md`
- **프로젝트 개요**: `/CLAUDE.md`
- **문서화 가이드**: `docs/CLAUDE.md`
