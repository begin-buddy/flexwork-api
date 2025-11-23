/**
 * 애플리케이션 환경 설정 타입 정의 및 로더
 */
export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  API_PREFIX: string;

  // 로깅 설정
  LOG_LEVEL: string;
  LOG_FILE_ENABLED: boolean;
  LOG_FILE_PATH: string;

  // CORS 설정
  CORS_ENABLED: boolean;
  CORS_ORIGINS: string[];

  // Rate Limiting 설정
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;

  // 데이터베이스 설정 (향후 Phase 3에서 사용)
  DATABASE_HOST: string;
  DATABASE_PORT: number;
  DATABASE_NAME: string;
  DATABASE_USER: string;
  DATABASE_PASSWORD: string;
}

/**
 * 환경 변수를 애플리케이션 설정으로 변환하는 함수
 */
export default () => ({
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3000', 10),
  apiPrefix: process.env.API_PREFIX || 'api',

  // 로깅 설정
  logging: {
    level: process.env.LOG_LEVEL || 'info',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs',
  },

  // CORS 설정
  cors: {
    enabled: process.env.CORS_ENABLED === 'true',
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(origin => origin.trim())
      : ['http://localhost:3000'],
  },

  // Rate Limiting 설정
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60000', 10), // 60초 (밀리초)
    limit: parseInt(process.env.THROTTLE_LIMIT || '10', 10), // 60초당 10개 요청
  },

  // 데이터베이스 설정
  database: {
    type: (process.env.DATABASE_TYPE as any) || 'mysql',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '3306', 10),
    name: process.env.DATABASE_NAME || 'nestjs_db',
    user: process.env.DATABASE_USER || 'root',
    password: process.env.DATABASE_PASSWORD || '',
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
    logging: process.env.DATABASE_LOGGING === 'true',
  },
});
