import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { DataSource, QueryRunner } from 'typeorm';
import { FdwService } from './fdw.service';

describe('FdwService', () => {
  let service: FdwService;
  let dataSource: jest.Mocked<DataSource>;
  let configService: jest.Mocked<ConfigService>;
  let queryRunner: jest.Mocked<QueryRunner>;

  const mockFdwConfig = {
    serverName: 'autr_server',
    host: 'localhost',
    port: 5432,
    dbname: 'autr_db',
    user: 'postgres',
    password: 'password123',
  };

  beforeEach(async () => {
    queryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      query: jest.fn(),
    } as unknown as jest.Mocked<QueryRunner>;

    dataSource = {
      createQueryRunner: jest.fn().mockReturnValue(queryRunner),
    } as unknown as jest.Mocked<DataSource>;

    configService = {
      get: jest.fn((key: string, defaultValue?: unknown) => {
        const config: Record<string, unknown> = {
          'fdw.autr.enabled': true,
          'fdw.autr.serverName': mockFdwConfig.serverName,
          'fdw.autr.host': mockFdwConfig.host,
          'fdw.autr.port': mockFdwConfig.port,
          'fdw.autr.dbname': mockFdwConfig.dbname,
          'fdw.autr.user': mockFdwConfig.user,
          'fdw.autr.password': mockFdwConfig.password,
          'fdw.autr.localSchema': 'autr',
        };
        return config[key] ?? defaultValue;
      }),
    } as unknown as jest.Mocked<ConfigService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FdwService,
        { provide: DataSource, useValue: dataSource },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    service = module.get<FdwService>(FdwService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getFdwStatus', () => {
    it('FDW 서버가 존재하지 않을 때 exists: false 반환', async () => {
      queryRunner.query.mockResolvedValueOnce([]); // pg_foreign_server 조회

      const status = await service.getFdwStatus('autr_server');

      expect(status.exists).toBe(false);
      expect(status.userMappingExists).toBe(false);
    });

    it('FDW 서버가 존재할 때 exists: true 및 옵션 반환', async () => {
      queryRunner.query
        .mockResolvedValueOnce([
          {
            srvname: 'autr_server',
            srvoptions: ['host=localhost', 'port=5432', 'dbname=autr_db'],
          },
        ]) // pg_foreign_server 조회
        .mockResolvedValueOnce([{ 1: 1 }]); // pg_user_mappings 조회

      const status = await service.getFdwStatus('autr_server');

      expect(status.exists).toBe(true);
      expect(status.currentConfig).toEqual({
        host: 'localhost',
        port: '5432',
        dbname: 'autr_db',
      });
      expect(status.userMappingExists).toBe(true);
    });
  });

  describe('syncFdw', () => {
    beforeEach(() => {
      // 메타 테이블 생성 쿼리
      queryRunner.query.mockImplementation(async (query: string) => {
        if (query.includes('CREATE TABLE IF NOT EXISTS')) {
          return [];
        }
        return [];
      });
    });

    it('FDW가 존재하지 않을 때 새로 생성', async () => {
      // 메타 테이블 생성
      queryRunner.query.mockResolvedValueOnce([]);
      // pg_foreign_server 조회 (존재하지 않음)
      queryRunner.query.mockResolvedValueOnce([]);
      // 저장된 해시 조회 (없음)
      queryRunner.query.mockResolvedValueOnce([]);
      // CREATE EXTENSION
      queryRunner.query.mockResolvedValueOnce([]);
      // CREATE SERVER
      queryRunner.query.mockResolvedValueOnce([]);
      // CREATE USER MAPPING
      queryRunner.query.mockResolvedValueOnce([]);
      // CREATE SCHEMA
      queryRunner.query.mockResolvedValueOnce([]);
      // 해시 저장
      queryRunner.query.mockResolvedValueOnce([]);

      const result = await service.syncFdw();

      expect(result.success).toBe(true);
      expect(result.operation).toBe('created');
      expect(result.message).toContain('생성되었습니다');
    });

    it('설정이 동일할 때 스킵', async () => {
      const expectedHash = service['generateConfigHash'](mockFdwConfig);

      // 메타 테이블 생성
      queryRunner.query.mockResolvedValueOnce([]);
      // pg_foreign_server 조회 (존재함)
      queryRunner.query.mockResolvedValueOnce([
        {
          srvname: 'autr_server',
          srvoptions: ['host=localhost', 'port=5432', 'dbname=autr_db'],
        },
      ]);
      // pg_user_mappings 조회
      queryRunner.query.mockResolvedValueOnce([{ 1: 1 }]);
      // 저장된 해시 조회 (동일한 해시)
      queryRunner.query.mockResolvedValueOnce([{ config_hash: expectedHash }]);

      const result = await service.syncFdw();

      expect(result.success).toBe(true);
      expect(result.operation).toBe('skipped');
      expect(result.message).toContain('변경사항 없음');
    });

    it('설정이 변경되었을 때 업데이트', async () => {
      const oldHash = 'old_hash_value';

      // 메타 테이블 생성
      queryRunner.query.mockResolvedValueOnce([]);
      // pg_foreign_server 조회 (존재함)
      queryRunner.query.mockResolvedValueOnce([
        {
          srvname: 'autr_server',
          srvoptions: ['host=old_host', 'port=5432', 'dbname=old_db'],
        },
      ]);
      // pg_user_mappings 조회
      queryRunner.query.mockResolvedValueOnce([{ 1: 1 }]);
      // 저장된 해시 조회 (다른 해시)
      queryRunner.query.mockResolvedValueOnce([{ config_hash: oldHash }]);
      // ALTER SERVER
      queryRunner.query.mockResolvedValueOnce([]);
      // DROP USER MAPPING
      queryRunner.query.mockResolvedValueOnce([]);
      // CREATE USER MAPPING
      queryRunner.query.mockResolvedValueOnce([]);
      // 해시 저장
      queryRunner.query.mockResolvedValueOnce([]);

      const result = await service.syncFdw();

      expect(result.success).toBe(true);
      expect(result.operation).toBe('updated');
      expect(result.message).toContain('업데이트되었습니다');
    });
  });

  describe('importForeignSchema', () => {
    it('전체 스키마 임포트', async () => {
      queryRunner.query.mockResolvedValueOnce([]);

      await service.importForeignSchema('public');

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('IMPORT FOREIGN SCHEMA public'),
      );
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('FROM SERVER autr_server'),
      );
      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('INTO autr'),
      );
    });

    it('특정 테이블만 임포트', async () => {
      queryRunner.query.mockResolvedValueOnce([]);

      await service.importForeignSchema('public', ['users', 'orders']);

      expect(queryRunner.query).toHaveBeenCalledWith(
        expect.stringContaining('LIMIT TO (users, orders)'),
      );
    });
  });

  describe('onModuleInit', () => {
    it('FDW가 비활성화되어 있으면 동기화하지 않음', async () => {
      configService.get.mockImplementation((key: string, defaultValue?: unknown) => {
        if (key === 'fdw.autr.enabled') return false;
        return defaultValue;
      });

      await service.onModuleInit();

      expect(queryRunner.query).not.toHaveBeenCalled();
    });
  });
});
