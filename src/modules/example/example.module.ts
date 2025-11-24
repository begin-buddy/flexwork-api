import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExampleController } from './example.controller';
import { ExampleService } from './example.service';
import { Article } from './article.entity';

/**
 * Example 모듈
 *
 * JSON:API 표준을 준수하는 Article 리소스 모듈
 *
 * 주요 기능:
 * - JSON:API 표준 CRUD 작업
 * - 자동 필터링, 정렬, 페이징
 * - Sparse Fieldsets 지원
 * - 관계형 데이터 포함 지원
 */
@Module({
  imports: [
    // TypeORM 리포지토리 등록
    TypeOrmModule.forFeature([Article]),
  ],
  controllers: [ExampleController],
  providers: [ExampleService],
  exports: [ExampleService],
})
export class ExampleModule {}
