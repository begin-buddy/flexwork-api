# 문서화 및 참조 가이드

> API 문서 작성, 패키지 참조, 코드 예제 가이드

## 문서 구조

```
docs/
├── CLAUDE.md              # 이 문서
├── ARCHITECTURE.md        # 아키텍처 문서
├── API.md                 # API 문서
├── DEVELOPMENT.md         # 개발 가이드
├── DEPLOYMENT.md          # 배포 가이드
└── package/               # 패키지 문서
    ├── nestjs-crud/       # JSON:API 패키지 문서
    │   └── HOWTOUSE.md    # 사용법 가이드
    └── jest-swagger/      # jest-swagger 패키지 문서
        └── HOWTOUSE.md    # 사용법 가이드
```

## JSON:API 패키지 문서

### 주요 참조: HOWTOUSE.md

`docs/package/nestjs-crud/HOWTOUSE.md` 파일은 NestJS JSON:API 패키지의 완전한 사용 가이드입니다.

**문서 구성:**
- 개요 및 주요 기능
- 설치 방법 (ORM 어댑터별)
- 빠른 시작 가이드
- 기본 사용법 (CRUD 작업)
- 고급 기능 (관계, 라이프사이클 훅, 권한 제어)
- 문제 해결

### 빠른 참조: 핵심 개념

#### 1. JSON:API 리소스 정의

```typescript
@JsonApiResource({
  type: 'users',      // JSON:API 타입 (복수형 권장)
  entity: User,       // TypeORM 엔티티
})
export class UserResource {
  @JsonApiAttribute()
  name: string;

  @JsonApiAttribute()
  email: string;
}
```

#### 2. 자동 CRUD 엔드포인트

```typescript
@Controller('users')
@JsonApiController(UserResource)
export class UsersController {
  // 자동으로 생성되는 엔드포인트:
  // GET    /users         - 목록 조회
  // GET    /users/:id     - 단일 조회
  // POST   /users         - 생성
  // PATCH  /users/:id     - 수정
  // DELETE /users/:id     - 삭제
}
```

#### 3. 관계 정의

```typescript
@JsonApiResource({
  type: 'articles',
  entity: Article,
})
export class ArticleResource {
  @JsonApiAttribute()
  title: string;

  @JsonApiRelationship({
    type: 'users',                    // 관계 타입
    resource: () => UserResource,     // 관계 리소스
  })
  author: UserResource;
}
```

#### 4. 쿼리 파라미터

**필터링:**
```bash
GET /users?filter[email]=hong@example.com
GET /users?filter[isActive]=true
```

**정렬:**
```bash
GET /users?sort=name           # 오름차순
GET /users?sort=-createdAt     # 내림차순 (-)
GET /users?sort=name,-email    # 다중 정렬
```

**페이징:**
```bash
GET /users?page[offset]=0&page[limit]=10
GET /users?page[number]=1&page[size]=20
```

**관계 포함:**
```bash
GET /articles?include=author
GET /articles?include=author,comments
GET /articles?include=author,comments.author  # 중첩 관계
```

**필드 선택:**
```bash
GET /users?fields[users]=name,email
```

#### 5. JSON:API 응답 형식

**단일 리소스:**
```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "data": {
    "type": "users",
    "id": "1",
    "attributes": {
      "name": "홍길동",
      "email": "hong@example.com"
    }
  }
}
```

**관계 포함:**
```json
{
  "jsonapi": {
    "version": "1.1"
  },
  "data": {
    "type": "articles",
    "id": "1",
    "attributes": {
      "title": "게시글 제목"
    },
    "relationships": {
      "author": {
        "data": { "type": "users", "id": "1" }
      }
    }
  },
  "included": [
    {
      "type": "users",
      "id": "1",
      "attributes": {
        "name": "홍길동"
      }
    }
  ]
}
```

## API 문서 작성 규칙

### Swagger/OpenAPI 문서화

모든 API 엔드포인트는 Swagger를 통해 자동 문서화됩니다.

#### 컨트롤러 레벨 설정

```typescript
import { ApiTags } from '@nestjs/swagger';

@ApiTags('users')  // Swagger 그룹 지정
@Controller('users')
export class UserController {}
```

#### 엔드포인트 문서화

```typescript
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';

@Get(':id')
@ApiOperation({
  summary: '특정 사용자 조회',
  description: 'ID를 통해 사용자 정보를 조회합니다.',
})
@ApiParam({
  name: 'id',
  type: Number,
  description: '사용자 ID',
  example: 1,
})
@ApiResponse({
  status: 200,
  description: '성공',
  type: UserResponseDto,
})
@ApiResponse({
  status: 404,
  description: '사용자를 찾을 수 없음',
})
async findOne(@Param('id') id: number) {
  return await this.userService.findOne(id);
}
```

#### DTO 문서화

```typescript
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
    minLength: 2,
    maxLength: 50,
  })
  @IsString()
  @Length(2, 50)
  name!: string;

  @ApiProperty({
    description: '이메일 주소',
    example: 'hong@example.com',
    format: 'email',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: '나이',
    example: 30,
    minimum: 1,
    maximum: 120,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;
}
```

#### 커스텀 응답 데코레이터 활용

```typescript
import {
  ApiSuccessResponse,
  ApiCreatedResponse,
} from '../../common/decorators/api-response.decorator';

// 200 OK 응답
@Get()
@ApiSuccessResponse(UserResponseDto, true)  // true = 배열
async findAll() {}

// 201 Created 응답
@Post()
@ApiCreatedResponse(UserResponseDto)
async create(@Body() dto: CreateUserDto) {}
```

### 문서화 체크리스트

엔드포인트 추가 시 확인사항:

- [ ] `@ApiTags()` - 컨트롤러 그룹 지정
- [ ] `@ApiOperation()` - 엔드포인트 설명
- [ ] `@ApiParam()` - 경로 파라미터 문서화
- [ ] `@ApiQuery()` - 쿼리 파라미터 문서화
- [ ] `@ApiBody()` - 요청 본문 문서화 (필요시)
- [ ] `@ApiResponse()` - 응답 코드별 문서화
- [ ] DTO의 모든 필드에 `@ApiProperty()` 추가
- [ ] 예제 값 제공 (`example` 속성)

## 코드 예제 작성 가이드

### 1. 기본 CRUD 예제

#### 엔티티 정의
```typescript
@Entity('examples')
export class Example extends BaseEntity {
  @Column()
  title!: string;

  @Column()
  description!: string;

  @Column({ default: true })
  isActive!: boolean;
}
```

#### 리소스 정의 (JSON:API)
```typescript
@JsonApiResource({
  type: 'examples',
  entity: Example,
})
export class ExampleResource {
  @JsonApiAttribute()
  title: string;

  @JsonApiAttribute()
  description: string;

  @JsonApiAttribute()
  isActive: boolean;
}
```

#### DTO 정의
```typescript
export class CreateExampleDto {
  @ApiProperty({ description: '제목' })
  @IsString()
  title!: string;

  @ApiProperty({ description: '설명' })
  @IsString()
  description!: string;
}

export class UpdateExampleDto extends PartialType(CreateExampleDto) {}

export class ExampleResponseDto extends BaseDto {
  @ApiProperty({ description: '제목' })
  title!: string;

  @ApiProperty({ description: '설명' })
  description!: string;

  @ApiProperty({ description: '활성화 여부' })
  isActive!: boolean;
}
```

#### 서비스 구현
```typescript
@Injectable()
export class ExampleService {
  constructor(
    @InjectRepository(Example)
    private readonly exampleRepository: Repository<Example>,
  ) {}

  async create(createDto: CreateExampleDto): Promise<Example> {
    const example = this.exampleRepository.create(createDto);
    return await this.exampleRepository.save(example);
  }

  async findAll(page: number = 1, limit: number = 10) {
    return await paginate(this.exampleRepository, { page, limit });
  }

  async findOne(id: number): Promise<Example> {
    const example = await this.exampleRepository.findOne({
      where: { id },
    });

    if (!example) {
      throw new NotFoundException(`Example with ID ${id} not found`);
    }

    return example;
  }

  async update(id: number, updateDto: UpdateExampleDto): Promise<Example> {
    const example = await this.findOne(id);
    Object.assign(example, updateDto);
    return await this.exampleRepository.save(example);
  }

  async remove(id: number): Promise<void> {
    const example = await this.findOne(id);
    await this.exampleRepository.softRemove(example);
  }
}
```

#### 컨트롤러 구현
```typescript
@ApiTags('examples')
@Controller('examples')
export class ExampleController {
  constructor(
    private readonly exampleService: ExampleService,
    private readonly i18n: I18nService,
  ) {}

  @Post()
  @Public()
  @ApiOperation({ summary: '새로운 예제 생성' })
  @ApiCreatedResponse(ExampleResponseDto)
  async create(@Body() createDto: CreateExampleDto) {
    const result = await this.exampleService.create(createDto);
    const message = await this.i18n.translate('common.created');

    return {
      message,
      data: result,
    };
  }

  @Get()
  @Public()
  @ApiOperation({ summary: '모든 예제 조회' })
  @ApiSuccessResponse(ExampleResponseDto, true)
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.exampleService.findAll(page, limit);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: '특정 예제 조회' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(ExampleResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.exampleService.findOne(id);
    return {
      data: result,
    };
  }

  @Patch(':id')
  @Public()
  @ApiOperation({ summary: '예제 수정' })
  @ApiParam({ name: 'id', type: Number })
  @ApiSuccessResponse(ExampleResponseDto)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateExampleDto,
  ) {
    const result = await this.exampleService.update(id, updateDto);
    const message = await this.i18n.translate('common.updated');

    return {
      message,
      data: result,
    };
  }

  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '예제 삭제' })
  @ApiParam({ name: 'id', type: Number })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.exampleService.remove(id);
  }
}
```

### 2. 관계 정의 예제

#### One-to-Many 관계

```typescript
// user.entity.ts
@Entity('users')
export class User extends BaseEntity {
  @Column()
  name!: string;

  @OneToMany(() => Article, article => article.author)
  articles!: Article[];
}

// article.entity.ts
@Entity('articles')
export class Article extends BaseEntity {
  @Column()
  title!: string;

  @Column()
  authorId!: number;

  @ManyToOne(() => User, user => user.articles)
  @JoinColumn({ name: 'authorId' })
  author!: User;
}
```

#### JSON:API 관계 리소스

```typescript
@JsonApiResource({
  type: 'users',
  entity: User,
})
export class UserResource {
  @JsonApiAttribute()
  name: string;

  @JsonApiRelationship({
    type: 'articles',
    resource: () => ArticleResource,
  })
  articles: ArticleResource[];
}

@JsonApiResource({
  type: 'articles',
  entity: Article,
})
export class ArticleResource {
  @JsonApiAttribute()
  title: string;

  @JsonApiRelationship({
    type: 'users',
    resource: () => UserResource,
  })
  author: UserResource;
}
```

### 3. 고급 쿼리 예제

```typescript
// 복잡한 필터링
async findByConditions(filters: any, page: number = 1, limit: number = 10) {
  const queryBuilder = this.repository
    .createQueryBuilder('item')
    .where('1 = 1');

  if (filters.search) {
    queryBuilder.andWhere(
      '(item.title LIKE :search OR item.description LIKE :search)',
      { search: `%${filters.search}%` }
    );
  }

  if (filters.isActive !== undefined) {
    queryBuilder.andWhere('item.isActive = :isActive', {
      isActive: filters.isActive
    });
  }

  if (filters.dateFrom) {
    queryBuilder.andWhere('item.createdAt >= :dateFrom', {
      dateFrom: filters.dateFrom
    });
  }

  return await paginate(queryBuilder, { page, limit });
}
```

## 문서 참조 흐름

```
처음 시작
    ↓
/CLAUDE.md (프로젝트 개요)
    ↓
새 모듈 생성?
    ↓ YES
src/modules/CLAUDE.md (모듈 작성 가이드)
    ↓
공통 유틸 필요?
    ↓ YES
src/common/CLAUDE.md (공통 유틸리티)
    ↓
┌───────────────────────┬─────────────────────┐
│ API 문서화 필요?     │ 테스트 작성 필요?  │
│       ↓ YES          │       ↓ YES        │
│ docs/CLAUDE.md       │ test/CLAUDE.md     │
│ (JSON:API 가이드)    │ (jest-swagger)     │
└───────────────────────┴─────────────────────┘
    ↓                           ↓
패키지 전체 문서          패키지 전체 문서
    ↓                           ↓
nestjs-crud/HOWTOUSE.md   jest-swagger/HOWTOUSE.md
```

## 실전 팁

### 1. Swagger 문서 확인

서버 실행 후 http://localhost:3000/api-docs 에서 실시간 API 문서 확인:
- 모든 엔드포인트 목록
- 요청/응답 스키마
- 직접 테스트 가능 (Try it out)

### 2. JSON:API 표준 준수

- **타입명은 복수형 사용**: `users`, `articles` (단수형 `user` 아님)
- **HTTP 메서드 올바르게 사용**:
  - GET: 조회
  - POST: 생성
  - PATCH: 부분 수정 (JSON:API 표준)
  - DELETE: 삭제
- **Content-Type 헤더**: `application/vnd.api+json`
- **응답 구조**: `{ jsonapi, data, included, meta, links }`

### 3. 일관된 응답 형식

```typescript
// 성공 응답
{
  message: "리소스가 생성되었습니다.",
  data: { ... }
}

// 에러 응답 (자동 처리됨)
{
  success: false,
  statusCode: 404,
  message: "User with ID 1 not found",
  timestamp: "2024-01-01T00:00:00.000Z",
  path: "/users/1"
}
```

### 4. 다국어 메시지

```typescript
// i18n/ko/common.json
{
  "created": "리소스가 생성되었습니다.",
  "updated": "리소스가 수정되었습니다.",
  "deleted": "리소스가 삭제되었습니다."
}

// 컨트롤러에서 사용
const message = await this.i18n.translate('common.created');
```

## jest-swagger 패키지 문서

### 주요 참조: test/CLAUDE.md

`test/CLAUDE.md` 파일은 jest-swagger를 사용한 테스트 기반 API 문서화 가이드입니다.

**문서 구성:**
- jest-swagger 개요 및 설정
- 데코레이터 기반 API 문서화
- E2E 테스트 패턴
- 스키마 자동 추론 및 변환
- 문제 해결

### 빠른 참조: 핵심 개념

#### 1. 테스트에서 API 문서 생성

```typescript
import { api, path, response } from 'jest-swagger';

describe('사용자 API', () => {
  @api({
    tags: ['users'],
    summary: '사용자 조회',
  })
  @path('get', '/users/{id}')
  @response(200, {
    description: '성공',
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            id: { type: 'number' },
            name: { type: 'string' },
          },
        },
      },
    },
  })
  test('ID로 사용자를 조회할 수 있어야 함', async () => {
    // 테스트 코드
  });
});
```

#### 2. Jest Reporter 설정

```typescript
// jest.config.ts
reporters: [
  'default',
  [
    'jest-swagger/dist/reporters',
    {
      outputDir: './docs',
      filename: 'openapi',
      format: 'yaml',
      printPath: true,
    },
  ],
],
```

#### 3. 실제 응답 캡처

```typescript
import { CaptureResponse } from 'jest-swagger';

@CaptureResponse({
  statusCode: 200,
  autoInferSchema: true,  // 스키마 자동 추론
})
test('사용자 조회', async () => {
  const response = await fetch('/api/users/1');
  // 응답이 자동으로 캡처되어 문서에 포함됨
});
```

**상세 가이드**: `test/CLAUDE.md` 참조
**전체 문서**: `docs/package/jest-swagger/HOWTOUSE.md` 참조

## 추가 참조

- **프로젝트 개요**: `/CLAUDE.md`
- **모듈 작성 가이드**: `src/modules/CLAUDE.md`
- **공통 유틸리티**: `src/common/CLAUDE.md`
- **테스트 가이드**: `test/CLAUDE.md`
- **JSON:API 패키지 문서**: `docs/package/nestjs-crud/HOWTOUSE.md`
- **jest-swagger 패키지 문서**: `docs/package/jest-swagger/HOWTOUSE.md`
- **아키텍처 문서**: `docs/ARCHITECTURE.md`
- **배포 가이드**: `docs/DEPLOYMENT.md`

## 문제 해결

### Swagger 문서가 보이지 않을 때

1. 서버가 실행 중인지 확인
2. http://localhost:3000/api-docs 접근
3. `@ApiTags()`, `@ApiOperation()` 데코레이터 확인
4. DTO에 `@ApiProperty()` 누락 확인

### JSON:API 응답 형식이 아닐 때

1. `@JsonApiController()` 데코레이터 확인
2. `JsonApiModule.forRoot()` 등록 확인
3. 요청 헤더에 `Accept: application/vnd.api+json` 포함 확인

### 관계 데이터가 포함되지 않을 때

1. 엔티티에 관계 정의 확인 (`@ManyToOne`, `@OneToMany` 등)
2. 리소스에 `@JsonApiRelationship()` 정의 확인
3. 쿼리에 `include` 파라미터 포함 확인
4. 서비스에서 `relations` 옵션 확인

## 버전 관리

문서를 수정할 때는 다음을 기록하세요:

```markdown
---
최종 수정일: 2024-01-01
수정자: Your Name
수정 내용: 새로운 관계 예제 추가
---
```
