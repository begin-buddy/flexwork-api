module.exports = {
  // 프리셋 설정
  preset: 'ts-jest',

  // 파일 확장자 설정
  moduleFileExtensions: ['js', 'json', 'ts'],

  // 루트 디렉토리 (프로젝트 루트)
  rootDir: '.',

  // 테스트 파일 위치
  roots: ['<rootDir>/src', '<rootDir>/test'],

  // 테스트 파일 패턴
  testRegex: '.*\\.spec\\.ts$',

  // 변환 설정
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
    '^.+\\.js$': ['ts-jest', {
      tsconfig: {
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
      },
    }],
  },

  // node_modules 변환 예외 설정 (ESM 패키지 처리)
  transformIgnorePatterns: [
    'node_modules/(?!(@faker-js|fishery)/)',
  ],

  // 커버리지 수집 대상
  collectCoverageFrom: [
    'src/**/*.(t|j)s',
    '!src/**/*.module.ts',
    '!src/main.ts',
    '!src/**/index.ts',
    '!src/**/*.interface.ts',
    '!src/**/*.dto.ts',
    '!src/**/*.entity.ts',
  ],

  // 커버리지 디렉토리
  coverageDirectory: './coverage',

  // 테스트 환경
  testEnvironment: 'node',

  // 모듈 경로 매핑 (tsconfig paths + ESM 패키지 지원)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@test/(.*)$': '<rootDir>/test/$1',
    '^@faker-js/faker$': '<rootDir>/node_modules/@faker-js/faker/dist/cjs/index.js',
  },

  // 테스트 셋업 파일
  setupFilesAfterEnv: ['<rootDir>/test/setup.ts'],

  // 커버리지 임계값 (프로젝트 템플릿 - 실제 프로젝트에서는 80%로 설정 권장)
  coverageThreshold: {
    global: {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
  },

  // 커버리지 리포터
  coverageReporters: ['text', 'text-summary', 'html', 'lcov'],

  // 타임아웃 설정
  testTimeout: 10000,

  // 병렬 실행 설정
  maxWorkers: '50%',

  // 에러 발생 시 즉시 중단 (CI/CD 환경에서 유용)
  bail: false,

  // 상세 출력
  verbose: true,
};
