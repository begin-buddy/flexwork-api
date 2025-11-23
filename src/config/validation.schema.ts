import * as Joi from 'joi';

/**
 * Joi 스키마를 사용한 환경 변수 검증
 * 애플리케이션 시작 시 필수 환경 변수가 올바르게 설정되었는지 확인합니다.
 */
export const validationSchema = Joi.object({
  // 필수 환경 설정
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(3000),
  API_PREFIX: Joi.string().default('api'),

  // 로깅 설정
  LOG_LEVEL: Joi.string()
    .valid('error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly')
    .default('info'),
  LOG_FILE_ENABLED: Joi.boolean().default(false),
  LOG_FILE_PATH: Joi.string().default('./logs'),

  // CORS 설정
  CORS_ENABLED: Joi.boolean().default(true),
  CORS_ORIGINS: Joi.string().default('http://localhost:3000'),

  // Rate Limiting 설정
  THROTTLE_TTL: Joi.number().default(60000),
  THROTTLE_LIMIT: Joi.number().default(10),

  // 데이터베이스 설정 (향후 Phase 3에서 사용)
  DATABASE_HOST: Joi.string().default('localhost'),
  DATABASE_PORT: Joi.number().default(5432),
  DATABASE_NAME: Joi.string().default('nestjs_db'),
  DATABASE_USER: Joi.string().default('postgres'),
  DATABASE_PASSWORD: Joi.string().default('postgres'),
});
