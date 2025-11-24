# 모듈 작성 가이드

> JSON:API 리소스 및 NestJS 모듈 개발 가이드

## 모듈 구조

각 모듈은 다음과 같은 구조를 따릅니다:

```
src/modules/{module-name}/
├── dto/                        # Data Transfer Objects
│   ├── create-{name}.dto.ts   # 생성 DTO
│   ├── update-{name}.dto.ts   # 수정 DTO
│   └── response-{name}.dto.ts # 응답 DTO
├── entities/                   # 엔티티
│   └── {name}.entity.ts       # TypeORM 엔티티
├── {name}.controller.ts       # 컨트롤러
├── {name}.service.ts          # 서비스
└── {name}.module.ts           # 모듈 정의
```

## 1단계: 엔티티 정의

### 기본 엔티티 작성

모든 엔티티는 `BaseEntity`를 상속받습니다. 이를 통해 `id`, `createdAt`, `updatedAt`, `deletedAt` 필드가 자동으로 추가됩니다.

```typescript
// src/modules/users/entities/user.entity.ts
import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @Column()
  name!: string;

  @ApiProperty({
    description: '이메일',
    example: 'hong@example.com',
  })
  @Column({ unique: true })
  email!: string;

  @ApiProperty({
    description: '나이',
    example: 30,
    required: false,
  })
  @Column({ nullable: true })
  age?: number;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  @Column({ default: true })
  isActive!: boolean;
}
```

### BaseEntity의 기본 필드

```typescript
// 자동으로 포함되는 필드들
id: number;           // 자동 생성되는 고유 ID
createdAt: Date;      // 생성 일시
updatedAt: Date;      // 수정 일시
deletedAt?: Date;     // 소프트 삭제 일시 (null이면 삭제되지 않음)
```

### 엔티티 작성 팁

1. **NOT NULL 필드는 `!` 사용**: `name!: string`
2. **NULL 허용 필드는 `?` 사용**: `age?: number`
3. **기본값 설정**: `@Column({ default: true })`
4. **유니크 제약**: `@Column({ unique: true })`
5. **Swagger 문서화**: `@ApiProperty()` 데코레이터 필수

## 2단계: DTO 정의

### 생성 DTO (Create DTO)

```typescript
// src/modules/users/dto/create-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsInt, IsBoolean, IsOptional, Min, Max } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  @IsString()
  name!: string;

  @ApiProperty({
    description: '이메일',
    example: 'hong@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: '나이',
    example: 30,
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
```

### 수정 DTO (Update DTO)

```typescript
// src/modules/users/dto/update-user.dto.ts
import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

// PartialType을 사용하면 모든 필드가 선택적(optional)이 됨
export class UpdateUserDto extends PartialType(CreateUserDto) {}
```

### 응답 DTO (Response DTO)

```typescript
// src/modules/users/dto/response-user.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from '../../../common/base/base.dto';

export class UserResponseDto extends BaseDto {
  @ApiProperty({
    description: '사용자 이름',
    example: '홍길동',
  })
  name!: string;

  @ApiProperty({
    description: '이메일',
    example: 'hong@example.com',
  })
  email!: string;

  @ApiProperty({
    description: '나이',
    example: 30,
    required: false,
  })
  age?: number;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  isActive!: boolean;
}
```

### DTO 작성 팁

1. **검증 데코레이터 사용**: `class-validator` 패키지의 데코레이터 활용
2. **Swagger 문서화**: `@ApiProperty()` 필수
3. **선택적 필드**: `@IsOptional()` + `?` 타입
4. **UpdateDto**: `PartialType`을 사용하여 자동 생성
5. **ResponseDto**: `BaseDto` 상속으로 기본 필드 포함

## 3단계: 서비스 작성

```typescript
// src/modules/users/user.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { paginate } from '../../common/utils/pagination.util';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 생성
  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);
    return await this.userRepository.save(user);
  }

  // 전체 조회 (페이지네이션)
  async findAll(page: number = 1, limit: number = 10) {
    return await paginate(this.userRepository, { page, limit });
  }

  // 단일 조회
  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }

  // 수정
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  // 삭제 (Soft Delete)
  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.softRemove(user);
  }

  // 커스텀 메서드 예제: 활성 사용자만 조회
  async findActive(page: number = 1, limit: number = 10) {
    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .where('user.isActive = :isActive', { isActive: true });

    return await paginate(queryBuilder, { page, limit });
  }
}
```

### 서비스 작성 팁

1. **Repository 주입**: `@InjectRepository()` 사용
2. **에러 처리**: 찾지 못한 경우 `NotFoundException` 발생
3. **Soft Delete**: `softRemove()` 사용 (물리 삭제는 `remove()`)
4. **페이지네이션**: `paginate()` 유틸리티 함수 활용
5. **QueryBuilder**: 복잡한 쿼리는 QueryBuilder 사용

## 4단계: 컨트롤러 작성

```typescript
// src/modules/users/user.controller.ts
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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam, ApiQuery } from '@nestjs/swagger';
import { I18nService } from 'nestjs-i18n';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/response-user.dto';
import {
  ApiSuccessResponse,
  ApiCreatedResponse,
} from '../../common/decorators/api-response.decorator';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  // 생성
  @Post()
  @Public()
  @ApiOperation({ summary: '새로운 사용자 생성' })
  @ApiCreatedResponse(UserResponseDto)
  async create(@Body() createUserDto: CreateUserDto) {
    const result = await this.userService.create(createUserDto);
    const message = await this.i18n.translate('common.created');

    return {
      message,
      data: result,
    };
  }

  // 전체 조회
  @Get()
  @Public()
  @ApiOperation({ summary: '모든 사용자 조회' })
  @ApiSuccessResponse(UserResponseDto, true)
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  async findAll(
    @Query('page', new ParseIntPipe({ optional: true })) page?: number,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
  ) {
    return await this.userService.findAll(page, limit);
  }

  // 단일 조회
  @Get(':id')
  @Public()
  @ApiOperation({ summary: '특정 사용자 조회' })
  @ApiParam({ name: 'id', type: Number, description: '사용자 ID' })
  @ApiSuccessResponse(UserResponseDto)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const result = await this.userService.findOne(id);
    return {
      data: result,
    };
  }

  // 수정
  @Patch(':id')
  @Public()
  @ApiOperation({ summary: '사용자 수정' })
  @ApiParam({ name: 'id', type: Number, description: '사용자 ID' })
  @ApiSuccessResponse(UserResponseDto)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const result = await this.userService.update(id, updateUserDto);
    const message = await this.i18n.translate('common.updated');

    return {
      message,
      data: result,
    };
  }

  // 삭제
  @Delete(':id')
  @Public()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: '사용자 삭제' })
  @ApiParam({ name: 'id', type: Number, description: '사용자 ID' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.userService.remove(id);
  }
}
```

### 컨트롤러 작성 팁

1. **@ApiTags()**: Swagger 그룹화
2. **@ApiOperation()**: 각 엔드포인트 설명
3. **@Public()**: 인증 불필요한 엔드포인트 (예제용)
4. **ParseIntPipe**: 자동 타입 변환 및 검증
5. **다국어 메시지**: `i18n.translate()` 사용
6. **응답 구조**: `{ message, data }` 형태 권장

## 5단계: 모듈 정의

```typescript
// src/modules/users/user.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]), // 엔티티 등록
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService], // 다른 모듈에서 사용할 경우
})
export class UserModule {}
```

## 6단계: 앱 모듈에 등록

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { UserModule } from './modules/users/user.module';
// ... 기타 import

@Module({
  imports: [
    // ... 기타 모듈
    UserModule, // 여기에 추가
  ],
})
export class AppModule {}
```

## 관계(Relationship) 정의

### One-to-Many 관계 예제

```typescript
// article.entity.ts
import { Entity, Column, ManyToOne, JoinColumn } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('articles')
export class Article extends BaseEntity {
  @ApiProperty({ description: '제목' })
  @Column()
  title!: string;

  @ApiProperty({ description: '내용' })
  @Column('text')
  content!: string;

  @ApiProperty({ description: '작성자 ID' })
  @Column()
  authorId!: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'authorId' })
  author!: User;
}
```

### 관계 포함 조회

```typescript
// article.service.ts
async findOne(id: number): Promise<Article> {
  const article = await this.articleRepository.findOne({
    where: { id },
    relations: ['author'], // 관계 포함
  });

  if (!article) {
    throw new NotFoundException(`Article with ID ${id} not found`);
  }

  return article;
}
```

## 고급 기능

### 커스텀 쿼리

```typescript
// 복잡한 필터링 예제
async findByConditions(conditions: any, page: number = 1, limit: number = 10) {
  const queryBuilder = this.userRepository
    .createQueryBuilder('user')
    .where('1 = 1'); // 동적 쿼리 시작

  if (conditions.name) {
    queryBuilder.andWhere('user.name LIKE :name', {
      name: `%${conditions.name}%`
    });
  }

  if (conditions.isActive !== undefined) {
    queryBuilder.andWhere('user.isActive = :isActive', {
      isActive: conditions.isActive
    });
  }

  return await paginate(queryBuilder, { page, limit });
}
```

### 트랜잭션 처리

```typescript
import { DataSource } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly dataSource: DataSource,
  ) {}

  async createWithTransaction(createUserDto: CreateUserDto): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const user = queryRunner.manager.create(User, createUserDto);
      const result = await queryRunner.manager.save(user);

      // 추가 작업들...

      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
```

## 참조

### Example 모듈
실제 구현 예제는 `src/modules/example/` 디렉토리를 참조하세요.

### 추가 문서
- **공통 유틸리티**: `src/common/CLAUDE.md`
- **JSON:API 상세 가이드**: `docs/CLAUDE.md`
- **패키지 사용법**: `docs/package/nestjs-crud/HOWTOUSE.md`

## 체크리스트

새 모듈 생성 시 확인사항:

- [ ] 엔티티 정의 (`BaseEntity` 상속)
- [ ] Create/Update/Response DTO 작성
- [ ] 서비스 구현 (CRUD + 커스텀 메서드)
- [ ] 컨트롤러 구현 (API 문서화 포함)
- [ ] 모듈 정의 및 등록
- [ ] 앱 모듈에 추가
- [ ] TypeORM 엔티티 등록
- [ ] 테스트 코드 작성
- [ ] Swagger 문서 확인
