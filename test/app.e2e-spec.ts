import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    // 테스트 모듈 생성
    moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    // NestJS 애플리케이션 생성
    app = moduleFixture.createNestApplication();

    // 전역 파이프 설정 (프로덕션 환경과 동일하게)
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    // 애플리케이션 초기화
    await app.init();
  });

  afterAll(async () => {
    // 테스트 종료 후 정리
    await app.close();
  });

  describe('/ (Root)', () => {
    it('GET / - 성공적으로 Hello World 반환', () => {
      return request(app.getHttpServer()).get('/').expect(200).expect('Hello World!');
    });
  });

  describe('Health Check', () => {
    it('GET / - 서버 응답 확인', async () => {
      const response = await request(app.getHttpServer()).get('/');

      expect(response.status).toBe(200);
      expect(response.text).toBe('Hello World!');
    });
  });
});
