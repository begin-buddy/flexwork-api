import { Controller } from '@nestjs/common';
import { JsonApiController } from '@nestjs-jsonapi/core';
import { ExampleService } from './example.service';
import { Article } from './article.entity';

/**
 * Example Controller
 *
 * JSON:API 표준을 준수하는 Article 리소스 컨트롤러
 *
 * 기본 제공 엔드포인트:
 * - GET    /articles         - 목록 조회 (필터링, 정렬, 페이징 지원)
 * - GET    /articles/:id     - 단일 조회
 * - POST   /articles         - 생성
 * - PATCH  /articles/:id     - 수정
 * - DELETE /articles/:id     - 삭제
 *
 * JSON:API 쿼리 파라미터 예시:
 * - ?filter[status]=published          - 필터링
 * - ?sort=-createdAt                   - 정렬 (내림차순)
 * - ?page[number]=1&page[size]=10      - 페이징
 * - ?fields[articles]=title,author     - Sparse Fieldsets
 * - ?include=author                    - 관계 포함
 */
@Controller('articles')
export class ExampleController extends JsonApiController<Article> {
  constructor(private readonly exampleService: ExampleService) {
    super(exampleService);
  }
}
