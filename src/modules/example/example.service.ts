import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JsonApiService } from '@nestjs-jsonapi/core';
import { Article } from './article.entity';

/**
 * Article 서비스
 *
 * JSON:API 표준을 준수하는 Article 리소스 서비스
 */
@Injectable()
export class ExampleService extends JsonApiService<Article> {
  constructor(
    @InjectRepository(Article)
    private readonly articleRepository: Repository<Article>,
  ) {
    // JsonApiService에 리포지토리와 리소스 타입 전달
    super(articleRepository as any, 'articles');
  }
}
