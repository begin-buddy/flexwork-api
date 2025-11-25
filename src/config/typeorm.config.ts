import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

// .env 파일 로드
dotenv.config();

const configService = new ConfigService();

/**
 * 데이터베이스 타입 결정
 */
const databaseType = configService.get<string>('DATABASE_TYPE') || 'mysql';

/**
 * TypeORM CLI용 DataSource 설정
 * 마이그레이션 생성 및 실행에 사용됩니다.
 */
export const AppDataSource = new DataSource({
  type: databaseType as 'mysql' | 'postgres' | 'mariadb',
  host: configService.get<string>('DATABASE_HOST') || 'localhost',
  port: Number(configService.get<string>('DATABASE_PORT')) || 3306,
  username: configService.get<string>('DATABASE_USER') || 'root',
  password: configService.get<string>('DATABASE_PASSWORD') || '',
  database: configService.get<string>('DATABASE_NAME') || 'nestjs_db',
  entities: ['src/**/*.entity.ts'],
  migrations: ['src/migrations/*.ts'],
  synchronize: false, // 마이그레이션 사용 시 false로 설정
  logging: configService.get<string>('DATABASE_LOGGING') === 'true',
});
