import { Test, TestingModule, TestingModuleBuilder } from '@nestjs/testing';
import { ModuleMetadata, Provider } from '@nestjs/common';

/**
 * 테스트 모듈 빌더 헬퍼
 *
 * NestJS 테스트 모듈을 쉽게 생성할 수 있도록 도와주는 유틸리티입니다.
 *
 * @example
 * ```typescript
 * const module = await createTestingModule({
 *   providers: [MyService],
 *   mocks: [MyRepository],
 * });
 *
 * const service = module.get(MyService);
 * ```
 */

export interface TestModuleOptions extends ModuleMetadata {
  /**
   * 자동으로 모킹할 프로바이더 목록
   */
  mocks?: Array<any>;

  /**
   * 커스텀 프로바이더 오버라이드
   */
  overrides?: Array<{
    provide: any;
    useValue?: any;
    useClass?: any;
    useFactory?: (...args: any[]) => any;
  }>;
}

/**
 * 테스트 모듈 생성 헬퍼
 */
export async function createTestingModule(options: TestModuleOptions): Promise<TestingModule> {
  const { mocks = [], overrides = [], ...metadata } = options;

  let builder: TestingModuleBuilder = Test.createTestingModule(metadata);

  // 자동 모킹
  for (const mock of mocks) {
    const mockValue = createMockProvider(mock);
    builder = builder.overrideProvider(mock).useValue(mockValue);
  }

  // 커스텀 오버라이드
  for (const override of overrides) {
    if (override.useValue !== undefined) {
      builder = builder.overrideProvider(override.provide).useValue(override.useValue);
    } else if (override.useClass !== undefined) {
      builder = builder.overrideProvider(override.provide).useClass(override.useClass);
    } else if (override.useFactory !== undefined) {
      builder = builder
        .overrideProvider(override.provide)
        .useFactory({ factory: override.useFactory });
    }
  }

  return builder.compile();
}

/**
 * 프로바이더의 모든 메서드를 자동으로 모킹
 */
export function createMockProvider<T = any>(provider: any): T {
  const mockProvider: any = {};

  // 프로토타입에서 모든 메서드 추출
  const prototype = provider.prototype || provider;
  const methodNames = Object.getOwnPropertyNames(prototype).filter(
    name => name !== 'constructor' && typeof prototype[name] === 'function',
  );

  // 각 메서드를 jest.fn()으로 모킹
  for (const methodName of methodNames) {
    mockProvider[methodName] = jest.fn();
  }

  return mockProvider as T;
}

/**
 * 리포지토리 모킹 헬퍼 (TypeORM 스타일)
 */
export function createMockRepository<T = any>(): {
  find: jest.Mock;
  findOne: jest.Mock;
  findOneBy: jest.Mock;
  save: jest.Mock;
  create: jest.Mock;
  update: jest.Mock;
  delete: jest.Mock;
  remove: jest.Mock;
  count: jest.Mock;
} {
  return {
    find: jest.fn(),
    findOne: jest.fn(),
    findOneBy: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };
}

/**
 * 서비스 모킹 헬퍼
 */
export function createMockService<T extends Record<string, any>>(methods: Array<keyof T>): T {
  const mockService: any = {};

  for (const method of methods) {
    mockService[method] = jest.fn();
  }

  return mockService as T;
}

/**
 * 테스트 모듈에서 프로바이더 가져오기 헬퍼
 */
export function getProvider<T>(module: TestingModule, provider: any): T {
  return module.get<T>(provider);
}

/**
 * 여러 프로바이더를 한 번에 가져오기
 */
export function getProviders<T extends any[]>(
  module: TestingModule,
  providers: [...T],
): { [K in keyof T]: T[K] } {
  return providers.map(provider => module.get(provider)) as any;
}

/**
 * 테스트 모듈 정리 헬퍼
 */
export async function cleanupTestingModule(module: TestingModule): Promise<void> {
  if (module) {
    await module.close();
  }
}
