import { registerAs } from '@nestjs/config';

/**
 * AUTR FDW 환경 설정
 * AUTR_DATABASE_* 환경변수를 사용하여 FDW 설정을 로드합니다.
 */
export const fdwConfig = registerAs('fdw', () => ({
  autr: {
    /** FDW 서버 이름 */
    serverName: process.env.AUTR_FDW_SERVER_NAME || 'autr_server',
    /** 원격 데이터베이스 호스트 */
    host: process.env.AUTR_DATABASE_HOST || 'localhost',
    /** 원격 데이터베이스 포트 */
    port: parseInt(process.env.AUTR_DATABASE_PORT || '5432', 10),
    /** 원격 데이터베이스 이름 */
    dbname: process.env.AUTR_DATABASE_NAME || 'autr_db',
    /** 원격 데이터베이스 사용자 */
    user: process.env.AUTR_DATABASE_USER || 'postgres',
    /** 원격 데이터베이스 비밀번호 */
    password: process.env.AUTR_DATABASE_PASSWORD || '',
    /** FDW 활성화 여부 */
    enabled: process.env.AUTR_FDW_ENABLED !== 'false',
    /** 로컬 스키마 이름 (Foreign Table이 생성될 스키마) */
    localSchema: process.env.AUTR_FDW_LOCAL_SCHEMA || 'autr',
  },
}));
