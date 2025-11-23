import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggerService } from './shared/logger/logger.service';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter, AllExceptionsFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });

  // ConfigService를 통한 설정 로드
  const configService = app.get(ConfigService);
  const nodeEnv = configService.get<string>('nodeEnv', 'development');

  // Helmet 보안 헤더 설정
  app.use(
    helmet({
      contentSecurityPolicy: nodeEnv === 'production' ? undefined : false,
      hsts: nodeEnv === 'production',
      frameguard: { action: 'deny' },
    }),
  );

  // 전역 로거 설정
  const loggerService = app.get(LoggerService);
  app.useLogger(loggerService);

  // 전역 필터 설정 (순서 중요: AllExceptionsFilter가 마지막)
  app.useGlobalFilters(
    new HttpExceptionFilter(loggerService),
    new AllExceptionsFilter(loggerService),
  );

  // 전역 인터셉터 설정
  app.useGlobalInterceptors(new LoggingInterceptor(loggerService), new TransformInterceptor());

  // 전역 ValidationPipe 설정
  app.useGlobalPipes(new ValidationPipe());

  // 포트 및 API 프리픽스 설정
  const port = configService.get<number>('port', 3000);
  const apiPrefix = configService.get<string>('apiPrefix', 'api');

  // API 경로 프리픽스 설정
  app.setGlobalPrefix(apiPrefix);

  // CORS 설정
  const corsEnabled = configService.get<boolean>('cors.enabled', true);
  if (corsEnabled) {
    const corsOrigins = configService.get<string[]>('cors.origins', ['http://localhost:3000']);
    app.enableCors({
      origin: corsOrigins,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
      exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
      maxAge: 3600,
    });
  }

  await app.listen(port);
  loggerService.log(
    `Application is running on: http://localhost:${port}/${apiPrefix}`,
    'Bootstrap',
  );
}
void bootstrap();
