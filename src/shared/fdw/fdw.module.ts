import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { FdwService } from './fdw.service';
import { fdwConfig } from './fdw.config';

/**
 * FDW (Foreign Data Wrapper) 모듈
 *
 * PostgreSQL postgres_fdw를 사용하여 원격 데이터베이스 연결을 자동으로 관리합니다.
 *
 * 기능:
 * - 애플리케이션 시작 시 FDW 자동 설정
 * - 환경변수 변경 감지 및 자동 업데이트
 * - 설정 해시를 통한 변경 추적
 *
 * 환경변수:
 * - AUTR_DATABASE_HOST: 원격 데이터베이스 호스트
 * - AUTR_DATABASE_PORT: 원격 데이터베이스 포트
 * - AUTR_DATABASE_NAME: 원격 데이터베이스 이름
 * - AUTR_DATABASE_USER: 원격 데이터베이스 사용자
 * - AUTR_DATABASE_PASSWORD: 원격 데이터베이스 비밀번호
 * - AUTR_FDW_ENABLED: FDW 활성화 여부 (기본값: true)
 * - AUTR_FDW_SERVER_NAME: FDW 서버 이름 (기본값: autr_server)
 * - AUTR_FDW_LOCAL_SCHEMA: 로컬 스키마 이름 (기본값: autr)
 */
@Module({
  imports: [ConfigModule.forFeature(fdwConfig)],
  providers: [FdwService],
  exports: [FdwService],
})
export class FdwModule {}
