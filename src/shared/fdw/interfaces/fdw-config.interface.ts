/**
 * FDW (Foreign Data Wrapper) 설정 인터페이스
 */

/**
 * FDW 서버 연결 설정
 */
export interface FdwServerConfig {
  /** FDW 서버 이름 */
  serverName: string;
  /** 원격 데이터베이스 호스트 */
  host: string;
  /** 원격 데이터베이스 포트 */
  port: number;
  /** 원격 데이터베이스 이름 */
  dbname: string;
  /** 원격 데이터베이스 사용자 */
  user: string;
  /** 원격 데이터베이스 비밀번호 */
  password: string;
}

/**
 * FDW 상태 정보
 */
export interface FdwStatus {
  /** FDW 서버 존재 여부 */
  exists: boolean;
  /** 현재 설정 (존재하는 경우) */
  currentConfig?: {
    host: string;
    port: string;
    dbname: string;
  };
  /** User Mapping 존재 여부 */
  userMappingExists: boolean;
}

/**
 * FDW 설정 해시 메타데이터
 */
export interface FdwConfigHash {
  /** 서버 이름 */
  serverName: string;
  /** 설정 해시 값 */
  configHash: string;
  /** 마지막 업데이트 시간 */
  updatedAt: Date;
}

/**
 * FDW 작업 결과
 */
export interface FdwOperationResult {
  /** 작업 성공 여부 */
  success: boolean;
  /** 수행된 작업 타입 */
  operation: 'created' | 'updated' | 'skipped' | 'error';
  /** 상세 메시지 */
  message: string;
}
