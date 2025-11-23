# Development Guide

English | [한국어](./DEVELOPMENT.ko.md)

Development guide for the NestJS Template project.

## Table of Contents

- [Development Environment Setup](#development-environment-setup)
- [Project Structure](#project-structure)
- [Development Workflow](#development-workflow)
- [Coding Guidelines](#coding-guidelines)
- [Writing Tests](#writing-tests)
- [Debugging](#debugging)
- [Troubleshooting](#troubleshooting)

## Development Environment Setup

### Required Tools

1. **Node.js 20.x**
```bash
# Using nvm
nvm install 20
nvm use 20

# Or install directly
# https://nodejs.org/
```

2. **pnpm**
```bash
npm install -g pnpm
```

3. **Git**
```bash
# Check installation
git --version
```

4. **IDE**
   - VS Code (recommended)
   - WebStorm
   - Other TypeScript-supporting IDEs

### VS Code Extensions

Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features
- REST Client
- GitLens
- Thunder Client (API testing)

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

### Initial Project Setup

```bash
# 1. Clone repository
git clone https://github.com/your-org/template-typescript-nestjs.git
cd template-typescript-nestjs

# 2. Install dependencies
pnpm install

# 3. Set up environment variables
cp .env.example .env

# 4. Database setup (using Docker)
pnpm run docker:dev

# Or use local MySQL
# Install MySQL 8.0 and create database

# 5. Run development server
pnpm run start:dev
```

### Environment Variables Configuration

`.env` file example:
```env
# Application
NODE_ENV=development
PORT=3000

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=nestjs
DB_PASSWORD=nestjs_password
DB_DATABASE=nestjs_dev

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=1d

# Logging
LOG_LEVEL=debug
```

## Project Structure

```
template-typescript-nestjs/
├── src/
│   ├── common/              # Common modules
│   │   ├── config/          # Configuration
│   │   │   ├── app.config.ts
│   │   │   └── database.config.ts
│   │   ├── decorators/      # Custom decorators
│   │   ├── filters/         # Exception filters
│   │   ├── guards/          # Guards
│   │   ├── interceptors/    # Interceptors
│   │   └── pipes/           # Pipes
│   ├── modules/             # Feature modules
│   │   ├── auth/            # Authentication module
│   │   │   ├── dto/
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   └── auth.module.ts
│   │   └── users/           # User module
│   │       ├── dto/
│   │       ├── entities/
│   │       ├── users.controller.ts
│   │       ├── users.service.ts
│   │       └── users.module.ts
│   ├── app.module.ts        # Root module
│   └── main.ts              # Entry point
├── test/                    # E2E tests
├── i18n/                    # Internationalization files
└── docker/                  # Docker configuration
```

### File Naming Conventions

- **Module**: `users.module.ts`
- **Controller**: `users.controller.ts`
- **Service**: `users.service.ts`
- **Entity**: `user.entity.ts`
- **DTO**: `create-user.dto.ts`, `update-user.dto.ts`
- **Test**: `users.service.spec.ts`, `users.e2e-spec.ts`

## Development Workflow

### 1. New Feature Development

```bash
# Create feature branch
git checkout -b feature/user-profile

# Write code
# 1. Write DTOs
# 2. Write Entities
# 3. Write Services
# 4. Write Controllers
# 5. Register in Module

# Write and run tests
pnpm run test

# Lint check
pnpm run lint

# Commit
git add .
git commit -m "feat(users): add user profile query"

# Push and create PR
git push origin feature/user-profile
```

### 2. Bug Fix

```bash
# Create bugfix branch
git checkout -b fix/login-error

# Fix bug
# 1. Write test to reproduce issue
# 2. Fix bug
# 3. Verify test passes

# Commit and push
git commit -m "fix(auth): fix login error"
git push origin fix/login-error
```

## Coding Guidelines

### Module Creation

```bash
# Using NestJS CLI
nest g module posts
nest g controller posts
nest g service posts
```

Or manual creation:

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

### Writing DTOs

```typescript
// create-post.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreatePostDto {
  @ApiProperty({
    description: 'Post title',
    example: 'Hello',
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
    description: 'Post content',
    example: 'This is the post content',
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

### Writing Entities

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

### Writing Services

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

### Writing Controllers

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
  @ApiOperation({ summary: 'Create post' })
  create(@Body() createPostDto: CreatePostDto, @Request() req) {
    return this.postsService.create(createPostDto, req.user.id);
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts' })
  findAll() {
    return this.postsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post details' })
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(+id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update post' })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postsService.update(+id, updatePostDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete post' })
  remove(@Param('id') id: string) {
    return this.postsService.remove(+id);
  }
}
```

## Writing Tests

### Unit Tests

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
    it('should return an array of posts', async () => {
      const posts = [
        { id: 1, title: 'Title 1', content: 'Content 1' },
        { id: 2, title: 'Title 2', content: 'Content 2' },
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
    it('should return a post when found', async () => {
      const post = { id: 1, title: 'Title', content: 'Content' };
      mockRepository.findOne.mockResolvedValue(post);

      const result = await service.findOne(1);

      expect(result).toEqual(post);
    });

    it('should throw an exception when post not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow();
    });
  });
});
```

### E2E Tests

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

    // Login to get token
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
    it('should create a post', () => {
      return request(app.getHttpServer())
        .post('/posts')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({
          title: 'Test Post',
          content: 'Test Content',
        })
        .expect(201)
        .expect((res) => {
          expect(res.body).toHaveProperty('id');
          expect(res.body.title).toBe('Test Post');
        });
    });
  });

  describe('/posts (GET)', () => {
    it('should get all posts', () => {
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

## Debugging

### VS Code Debug Configuration

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

### Logging

```typescript
// Using Winston logger
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

## Troubleshooting

### Common Issues

**1. Port already in use**
```bash
# Check process using port
lsof -i :3000

# Kill process
kill -9 [PID]
```

**2. Database connection failure**
```bash
# Check .env file
# Check Docker container status
docker ps

# Check MySQL logs
docker logs nestjs-mysql-dev
```

**3. Dependency installation error**
```bash
# Clear cache
pnpm store prune

# Reinstall
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

**4. Test failures**
```bash
# Clear test cache
jest --clearCache

# Run single test
pnpm run test -- posts.service.spec.ts
```

## Useful Commands

```bash
# Development server
pnpm run start:dev      # Development mode (watch)
pnpm run start:debug    # Debug mode

# Build
pnpm run build          # Production build

# Tests
pnpm run test           # Unit tests
pnpm run test:watch     # Watch mode
pnpm run test:cov       # Coverage
pnpm run test:e2e       # E2E tests

# Code quality
pnpm run lint           # ESLint
pnpm run format         # Prettier
pnpm run format:check   # Format check

# Docker
pnpm run docker:build   # Build image
pnpm run docker:up      # Run container
pnpm run docker:down    # Stop container
pnpm run docker:dev     # Run development environment
```

## References

- [NestJS Official Documentation](https://docs.nestjs.com/)
- [TypeORM Documentation](https://typeorm.io/)
- [Jest Documentation](https://jestjs.io/)
- [Swagger Documentation](https://swagger.io/docs/)
