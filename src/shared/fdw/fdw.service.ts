import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as crypto from 'crypto';
import { FdwServerConfig, FdwStatus, FdwOperationResult } from './interfaces/fdw-config.interface';

/**
 * FDW (Foreign Data Wrapper) 관리 서비스
 *
 * PostgreSQL postgres_fdw를 사용하여 원격 PostgreSQL 데이터베이스에 연결합니다.
 * 애플리케이션 시작 시 자동으로 FDW 설정을 확인하고 필요한 경우 생성/업데이트합니다.
 *
 * 주요 기능:
 * - FDW 존재 여부 확인
 * - FDW 자동 생성
 * - 설정 변경 감지 및 업데이트
 * - 설정 해시를 통한 변경 추적
 */
@Injectable()
export class FdwService implements OnModuleInit {
  private readonly logger = new Logger(FdwService.name);

  /** FDW 설정 해시 저장 테이블 이름 */
  private readonly FDW_META_TABLE = '_fdw_config_meta';

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 모듈 초기화 시 FDW 설정을 자동으로 확인하고 동기화합니다.
   */
  async onModuleInit(): Promise<void> {
    const enabled = this.configService.get<boolean>('fdw.autr.enabled', true);

    if (!enabled) {
      this.logger.log('AUTR FDW가 비활성화되어 있습니다. (AUTR_FDW_ENABLED=false)');
      return;
    }

    try {
      const result = await this.syncFdw();
      this.logger.log(`FDW 동기화 완료: ${result.operation} - ${result.message}`);
    } catch (error) {
      this.logger.error('FDW 동기화 실패:', error);
      // FDW 실패가 애플리케이션 시작을 막지 않도록 에러를 throw하지 않음
    }
  }

  /**
   * FDW 설정을 동기화합니다.
   * - FDW가 없으면 생성
   * - 설정이 변경되었으면 업데이트
   * - 설정이 동일하면 스킵
   */
  async syncFdw(): Promise<FdwOperationResult> {
    const config = this.getAustrConfig();
    const currentHash = this.generateConfigHash(config);

    // 메타데이터 테이블 확인/생성
    await this.ensureMetaTable();

    // 현재 FDW 상태 확인
    const status = await this.getFdwStatus(config.serverName);

    // 저장된 해시 조회
    const storedHash = await this.getStoredConfigHash(config.serverName);

    if (!status.exists) {
      // FDW가 존재하지 않음 → 생성
      await this.createFdw(config);
      await this.saveConfigHash(config.serverName, currentHash);
      return {
        success: true,
        operation: 'created',
        message: `FDW 서버 '${config.serverName}'가 생성되었습니다.`,
      };
    }

    if (storedHash === currentHash) {
      // 설정이 변경되지 않음 → 스킵
      return {
        success: true,
        operation: 'skipped',
        message: `FDW 서버 '${config.serverName}' 설정이 동일합니다. 변경사항 없음.`,
      };
    }

    // 설정이 변경됨 → 업데이트
    await this.updateFdw(config);
    await this.saveConfigHash(config.serverName, currentHash);
    return {
      success: true,
      operation: 'updated',
      message: `FDW 서버 '${config.serverName}' 설정이 업데이트되었습니다.`,
    };
  }

  /**
   * 환경변수에서 AUTR FDW 설정을 로드합니다.
   */
  private getAustrConfig(): FdwServerConfig {
    return {
      serverName: this.configService.get<string>('fdw.autr.serverName', 'autr_server'),
      host: this.configService.get<string>('fdw.autr.host', 'localhost'),
      port: this.configService.get<number>('fdw.autr.port', 5432),
      dbname: this.configService.get<string>('fdw.autr.dbname', 'autr_db'),
      user: this.configService.get<string>('fdw.autr.user', 'postgres'),
      password: this.configService.get<string>('fdw.autr.password', ''),
    };
  }

  /**
   * FDW 서버의 현재 상태를 조회합니다.
   */
  async getFdwStatus(serverName: string): Promise<FdwStatus> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      // Foreign Server 존재 여부 확인
      const serverResult = await queryRunner.query(
        `SELECT srvname, srvoptions
         FROM pg_foreign_server
         WHERE srvname = $1`,
        [serverName],
      );

      if (serverResult.length === 0) {
        return { exists: false, userMappingExists: false };
      }

      // 옵션 파싱
      const options = this.parseServerOptions(serverResult[0].srvoptions);

      // User Mapping 존재 여부 확인
      const mappingResult = await queryRunner.query(
        `SELECT 1 FROM pg_user_mappings
         WHERE srvname = $1
         LIMIT 1`,
        [serverName],
      );

      return {
        exists: true,
        currentConfig: options,
        userMappingExists: mappingResult.length > 0,
      };
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 새로운 FDW를 생성합니다.
   */
  private async createFdw(config: FdwServerConfig): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`FDW 서버 '${config.serverName}' 생성 중...`);

      // 1. postgres_fdw 확장 설치
      await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS postgres_fdw`);

      // 2. Foreign Server 생성
      await queryRunner.query(
        `CREATE SERVER ${this.escapeIdentifier(config.serverName)}
         FOREIGN DATA WRAPPER postgres_fdw
         OPTIONS (host '${this.escapeString(config.host)}',
                  port '${config.port}',
                  dbname '${this.escapeString(config.dbname)}')`,
      );

      // 3. User Mapping 생성
      await queryRunner.query(
        `CREATE USER MAPPING FOR CURRENT_USER
         SERVER ${this.escapeIdentifier(config.serverName)}
         OPTIONS (user '${this.escapeString(config.user)}',
                  password '${this.escapeString(config.password)}')`,
      );

      // 4. 로컬 스키마 생성 (Foreign Table 저장용)
      const localSchema = this.configService.get<string>('fdw.autr.localSchema', 'autr');
      await queryRunner.query(`CREATE SCHEMA IF NOT EXISTS ${this.escapeIdentifier(localSchema)}`);

      await queryRunner.commitTransaction();
      this.logger.log(`FDW 서버 '${config.serverName}' 생성 완료`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`FDW 생성 실패:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 기존 FDW 설정을 업데이트합니다.
   */
  private async updateFdw(config: FdwServerConfig): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`FDW 서버 '${config.serverName}' 업데이트 중...`);

      // 1. Foreign Server 옵션 업데이트
      await queryRunner.query(
        `ALTER SERVER ${this.escapeIdentifier(config.serverName)}
         OPTIONS (SET host '${this.escapeString(config.host)}',
                  SET port '${config.port}',
                  SET dbname '${this.escapeString(config.dbname)}')`,
      );

      // 2. User Mapping 업데이트 (DROP + CREATE)
      await queryRunner.query(
        `DROP USER MAPPING IF EXISTS FOR CURRENT_USER
         SERVER ${this.escapeIdentifier(config.serverName)}`,
      );

      await queryRunner.query(
        `CREATE USER MAPPING FOR CURRENT_USER
         SERVER ${this.escapeIdentifier(config.serverName)}
         OPTIONS (user '${this.escapeString(config.user)}',
                  password '${this.escapeString(config.password)}')`,
      );

      await queryRunner.commitTransaction();
      this.logger.log(`FDW 서버 '${config.serverName}' 업데이트 완료`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`FDW 업데이트 실패:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 원격 스키마를 로컬 스키마로 임포트합니다.
   *
   * @param remoteSchema 원격 스키마 이름 (기본값: 'public')
   * @param tables 임포트할 테이블 목록 (비어있으면 전체 스키마)
   */
  async importForeignSchema(remoteSchema: string = 'public', tables?: string[]): Promise<void> {
    const config = this.getAustrConfig();
    const localSchema = this.configService.get<string>('fdw.autr.localSchema', 'autr');
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      let importQuery = `IMPORT FOREIGN SCHEMA ${this.escapeIdentifier(remoteSchema)}`;

      if (tables && tables.length > 0) {
        const tableList = tables.map(t => this.escapeIdentifier(t)).join(', ');
        importQuery += ` LIMIT TO (${tableList})`;
      }

      importQuery += ` FROM SERVER ${this.escapeIdentifier(config.serverName)}`;
      importQuery += ` INTO ${this.escapeIdentifier(localSchema)}`;

      await queryRunner.query(importQuery);
      this.logger.log(`Foreign Schema 임포트 완료: ${remoteSchema} → ${localSchema}`);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 설정 해시를 저장할 메타데이터 테이블을 생성합니다.
   */
  private async ensureMetaTable(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS ${this.escapeIdentifier(this.FDW_META_TABLE)} (
          server_name VARCHAR(255) PRIMARY KEY,
          config_hash VARCHAR(64) NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `);
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 저장된 설정 해시를 조회합니다.
   */
  private async getStoredConfigHash(serverName: string): Promise<string | null> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      const result = await queryRunner.query(
        `SELECT config_hash FROM ${this.escapeIdentifier(this.FDW_META_TABLE)}
         WHERE server_name = $1`,
        [serverName],
      );

      return result.length > 0 ? result[0].config_hash : null;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * 설정 해시를 저장합니다.
   */
  private async saveConfigHash(serverName: string, hash: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.query(
        `INSERT INTO ${this.escapeIdentifier(this.FDW_META_TABLE)}
         (server_name, config_hash, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP)
         ON CONFLICT (server_name)
         DO UPDATE SET config_hash = $2, updated_at = CURRENT_TIMESTAMP`,
        [serverName, hash],
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * FDW 설정의 해시를 생성합니다.
   */
  private generateConfigHash(config: FdwServerConfig): string {
    const configString = JSON.stringify({
      host: config.host,
      port: config.port,
      dbname: config.dbname,
      user: config.user,
      password: config.password,
    });

    return crypto.createHash('sha256').update(configString).digest('hex');
  }

  /**
   * pg_foreign_server의 srvoptions를 파싱합니다.
   */
  private parseServerOptions(options: string[]): { host: string; port: string; dbname: string } {
    const result: Record<string, string> = {};

    if (options) {
      for (const opt of options) {
        const [key, value] = opt.split('=');
        result[key] = value;
      }
    }

    return {
      host: result['host'] || '',
      port: result['port'] || '',
      dbname: result['dbname'] || '',
    };
  }

  /**
   * SQL 식별자를 이스케이프합니다.
   */
  private escapeIdentifier(identifier: string): string {
    // 유효한 식별자 문자만 허용
    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(identifier)) {
      return `"${identifier.replace(/"/g, '""')}"`;
    }
    return identifier;
  }

  /**
   * SQL 문자열 값을 이스케이프합니다.
   */
  private escapeString(value: string): string {
    return value.replace(/'/g, "''");
  }
}
