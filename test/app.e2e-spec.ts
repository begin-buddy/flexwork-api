import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppController } from './../src/app.controller';
import { AppService } from './../src/app.service';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from './../src/shared/logger/logger.module';
import { HealthModule } from './../src/shared/health/health.module';
import { I18nConfigModule } from './../src/shared/i18n/i18n.module';
import configuration from './../src/config/configuration';
import { validationSchema } from './../src/config/validation.schema';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;
  let moduleFixture: TestingModule;

  beforeAll(async () => {
    // 테스트 모듈 생성 - DB 의존성 제거 (템플릿 프로젝트용)
    // ExampleModule과 TypeORM은 제외하고 기본 앱 기능만 테스트
    moduleFixture = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          load: [configuration],
          validationSchema,
          validationOptions: {
            allowUnknown: true,
            abortEarly: false,
          },
        }),
        ThrottlerModule.forRoot([
          {
            ttl: 60000,
            limit: 10,
          },
        ]),
        LoggerModule,
        HealthModule,
        I18nConfigModule,
        // ExampleModule은 제외 - DB 필요
      ],
      controllers: [AppController],
      providers: [AppService],
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
    it('GET / - 성공적으로 Hello World 반환', async () => {
      const response = await request(app.getHttpServer()).get('/').expect(200);

      expect(response.body).toHaveProperty('message', 'Hello World!');
      expect(response.body).toHaveProperty('i18n');
    });
  });

  describe('Health Check', () => {
    it('GET / - 서버 응답 확인', async () => {
      const response = await request(app.getHttpServer()).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('message', 'Hello World!');
      expect(response.body).toHaveProperty('i18n');
      expect(response.body.i18n).toHaveProperty('welcome');
      expect(response.body.i18n).toHaveProperty('hello');
    });
  });
});
