# 개발 가이드

NestJS Template 프로젝트의 개발 가이드입니다.

## 목차

- [개발 환경 설정](#개발-환경-설정)
- [프로젝트 구조](#프로젝트-구조)
- [개발 워크플로우](#개발-워크플로우)
- [코딩 가이드](#코딩-가이드)
- [테스트 작성](#테스트-작성)
- [디버깅](#디버깅)
- [문제 해결](#문제-해결)

## 개발 환경 설정

### 필수 도구

1. **Node.js 20.x**
```bash
# nvm 사용
nvm install 20
nvm use 20

# 또는 직접 설치
# https://nodejs.org/
```

2. **pnpm**
```bash
npm install -g pnpm
```

3. **Git**
```bash
# 설치 확인
git --version
```

4. **IDE**
   - VS Code (권장)
   - WebStorm
   - 기타 TypeScript 지원 IDE

### VS Code 확장 프로그램

권장 확장 프로그램:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- REST Client
- GitLens
- Thunder Client (API 테스트)

`.vscode/extensions.json`:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "rangav.vscode-thunder-client",
    "eamodio.gitlens"
  ]
}
```

### 프로젝트 초기 설정

```bash
# 1. 저장소 클론
git clone https://github.com/your-org/template-typescript-nestjs.git
cd template-typescript-nestjs

# 2. 의존성 설치
pnpm install

# 3. 환경 변수 설정
cp .env.example .env

# 4. 데이터베이스 설정 (Docker 사용)
pnpm run docker:dev

# 또는 로컬 MySQL 사용
# MySQL 8.0 설치 및 데이터베이스 생성

# 5. 개발 서버 실행
pnpm run start:dev
```

### 환경 변수 설정

`.env` 파일 예시:
```env
# 애플리케이션
NODE_ENV=development
PORT=3000

# 데이터베이스
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=nestjs
DB_PASSWORD=nestjs_password
DB_DATABASE=nestjs_dev

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# 로깅
LOG_LEVEL=debug
```

## 프로젝트 구조

```
template-typescript-nestjs/
├── src/
│   ├── common/              # 공통 모듈
│   │   ├── config/          # 설정
│   │   │   ├── app.config.ts
│   │   │   └── database.config.ts
│   │   ├── decorators/      # 커스텀 데코레이터
│   │   ├── filters/         # 예외 필터
│   │   ├── guards/          # 가드
│   │   ├── interceptors/    # 인터셉터
│   │   └── pipes/           # 파이프
│   ├── modules/             # 기능 모듈
│   │   ├── auth/            # 인증 모듈
│   │   │   ├── dto/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   └── users/           # 사용자 모듈
│   │       ├── dto/
│   │       ├── entities/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── users.module.ts
│   ├── app.module.ts        # 루트 모듈
│   └── main.ts              # 진입점
├── test/                    # E2E 테스트
├── i18n/                    # 국제화 파일
└── docker/                  # Docker 설정
```

### 파일 명명 규칙

- **Module**: `users.module.ts`
- **Controller**: `users.controller.ts`
- **Service**: `users.service.ts`
- **Entity**: `user.entity.ts`
- **DTO**: `create-user.dto.ts`, `update-user.dto.ts`
- **Test**: `users.service.spec.ts`, `users.e2e-spec.ts`

## 개발 워크플로우

### 1. 새 기능 개발

```bash
# Feature 브랜치 생성
git checkout -b feature/user-profile

# 코드 작성
# 1. DTO 작성
# 2. Entity 작성
# 3. Service 작성
# 4. Controller 작성
# 5. Module에 등록

# 테스트 작성 및 실행
pnpm run test

# 린트 검사
pnpm run lint

# 커밋
git add .
git commit -m "feat(users): 사용자 프로필 조회 추가"

# 푸시 및 PR 생성
git push origin feature/user-profile
```

### 2. 버그 수정

```bash
# Bugfix 브랜치 생성
git checkout -b fix/login-error

# 버그 수정
# 1. 문제 재현 테스트 작성
# 2. 버그 수정
# 3. 테스트 통과 확인

# 커밋 및 푸시
git commit -m "fix(auth): 로그인 에러 수정"
git push origin fix/login-error
```

## 코딩 가이드

### Module 생성

```bash
# NestJS CLI 사용
nest g module posts
nest g controller posts
nest g service posts
```

또는 수동 생성:

```typescript
// posts.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Post])],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
```

### DTO 작성

```typescript
// create-post.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreatePostDto {
  @ApiProperty({
    description: '게시글 제목',
    example: '안녕하세요',
    minLength: 1,
    maxLength: 100,
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  @MinLength(1, {
    message: i18nValidationMessage('validation.MIN_LENGTH'),
  })
  @MaxLength(100, {
    message: i18nValidationMessage('validation.MAX_LENGTH'),
  })
  title: string;

  @ApiProperty({
    description: '게시글 내용',
    example: '게시글 내용입니다',
  })
  @IsString({
    message: i18nValidationMessage('validation.IS_STRING'),
  })
  @IsNotEmpty({
    message: i18nValidationMessage('validation.IS_NOT_EMPTY'),
  })
  content: string;
}
```

### Entity 작성

```typescript
// post.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  title: string;

  @Column('text')
  content: string;

  @ManyToOne(() => User, (user) => user.posts)
  author: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

### Service 작성

```typescript
// posts.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private postsRepository: Repository<Post>,
    private readonly i18n: I18nService,
  ) {}

  async create(createPostDto: CreatePostDto, userId: number): Promise<Post> {
    const post = this.postsRepository.create({
      ...createPostDto,
      author: { id: userId },
    });
    return this.postsRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    return this.postsRepository.find({
      relations: ['author'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postsRepository.findOne({
      where: { id },
      relations: ['author'],
    });

    if (!post) {
      throw new NotFoundException(
        await this.i18n.translate('errors.POST_NOT_FOUND'),
      );
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    Object.assign(post, updatePostDto);
    return this.postsRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postsRepository.remove(post);
  }
}
```

### Controller 작성

```typescript
// posts.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 생성' })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: '게시글 목록 조회' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: '게시글 상세 조회' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 수정' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '게시글 삭제' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
```

## 테스트 작성

### 단위 테스트

```typescript
// posts.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { I18nService } from 'nestjs-i18n';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';

describe('PostsService', () => {
  let service: PostsService;
  let repository: Repository<Post>;

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockI18nService = {
    translate: jest.fn((key) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PostsService,
        {
          provide: getRepositoryToken(Post),
          useValue: mockRepository,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    service = module.get<PostsService>(PostsService);
    repository = module.get<Repository<Post>>(getRepositoryToken(Post));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('게시글 목록을 반환해야 한다', async () => {
      const posts = [
        { id: 1, title: '제목1', content: '내용1' },
        { id: 2, title: '제목2', content: '내용2' },
      ];

      mockRepository.find.mockResolvedValue(posts);

      const result = await service.findAll();

      expect(result).toEqual(posts);
      expect(mockRepository.find).toHaveBeenCalledWith({
        relations: ['author'],
        order: { createdAt: 'DESC' },
      });
    });
  });

  describe('findOne', () => {
    it('게시글을 찾으면 반환해야 한다', async () => {
      const post = { id: 1, title: '제목', content: '내용' };
      mockRepository.findOne.mockResolvedValue(post);

      const result = await service.findOne(1);

      expect(result).toEqual(post);
    });

    it('게시글을 찾지 못하면 예외를 발생시켜야 한다', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow();
    });
  });
});
```

### E2E 테스트

```typescript
// posts.e2e-spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('PostsController (e2e)', () => {
  let app: INestApplication;
  let accessToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // 로그인하여 토큰 획득
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });

    accessToken = loginResponse.body.accessToken;
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/posts (POST)', () => {
    it('게시글을 생성해야 한다', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: '테스트 게시글',
          content: '테스트 내용',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('테스트 게시글');
        });
    });
  });

  describe('/posts (GET)', () => {
    it('게시글 목록을 조회해야 한다', () => {
      return request(app.getHttpServer())
        .get('/posts')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBeTruthy();
        });
    });
  });
});
```

## 디버깅

### VS Code 디버깅 설정

`.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug NestJS",
      "runtimeExecutable": "pnpm",
      "runtimeArgs": ["run", "start:debug"],
      "console": "integratedTerminal",
      "restart": true,
      "protocol": "inspector"
    }
  ]
}
```

### 로깅

```typescript
// Winston 로거 사용
import { Logger } from '@nestjs/common';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  async findOne(id: number): Promise<Post> {
    this.logger.log(`Finding post with id: ${id}`);

    try {
      const post = await this.postsRepository.findOne({ where: { id } });
      this.logger.debug(`Found post: ${JSON.stringify(post)}`);
      return post;
    } catch (error) {
      this.logger.error(`Error finding post: ${error.message}`, error.stack);
      throw error;
    }
  }
}
```

## 문제 해결

### 일반적인 문제

**1. 포트가 이미 사용 중**
```bash
# 포트 사용 프로세스 확인
lsof -i :3000

# 프로세스 종료
kill -9 [PID]
```

**2. 데이터베이스 연결 실패**
```bash
# .env 파일 확인
# Docker 컨테이너 상태 확인
docker ps

# MySQL 로그 확인
docker logs nestjs-mysql-dev
```

**3. 의존성 설치 오류**
```bash
# 캐시 삭제
pnpm store prune

# 재설치
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**4. 테스트 실패**
```bash
# 테스트 캐시 삭제
jest --clearCache

# 단일 테스트 실행
pnpm run test -- posts.service.spec.ts
```

## 유용한 명령어

```bash
# 개발 서버
pnpm run start:dev      # 개발 모드 (watch)
pnpm run start:debug    # 디버그 모드

# 빌드
pnpm run build          # 프로덕션 빌드

# 테스트
pnpm run test           # 단위 테스트
pnpm run test:watch     # Watch 모드
pnpm run test:cov       # 커버리지
pnpm run test:e2e       # E2E 테스트

# 코드 품질
pnpm run lint           # ESLint
pnpm run format         # Prettier
pnpm run format:check   # 포맷 검사

# Docker
pnpm run docker:build   # 이미지 빌드
pnpm run docker:up      # 컨테이너 실행
pnpm run docker:down    # 컨테이너 중지
pnpm run docker:dev     # 개발 환경 실행
```

## 참고 자료

- [NestJS 공식 문서](https://docs.nestjs.com/)
- [TypeORM 문서](https://typeorm.io/)
- [Jest 문서](https://jestjs.io/)
- [Swagger 문서](https://swagger.io/docs/)
