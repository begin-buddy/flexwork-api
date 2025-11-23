/**
 * Jest 전역 테스트 설정
 *
 * 모든 테스트 실행 전에 로드되는 설정 파일입니다.
 */

// Jest 타임아웃 전역 설정
jest.setTimeout(10000);

// 콘솔 경고 억제 (필요한 경우)
const originalWarn = console.warn;
const originalError = console.error;

beforeAll(() => {
  // 테스트 중 발생하는 특정 경고 메시지 억제
  console.warn = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      (message.includes('ExperimentalWarning') || message.includes('deprecated'))
    ) {
      return;
    }
    originalWarn(...args);
  };

  console.error = (...args: any[]) => {
    const message = args[0];
    if (
      typeof message === 'string' &&
      message.includes('Not implemented: HTMLFormElement.prototype.submit')
    ) {
      return;
    }
    originalError(...args);
  };
});

afterAll(() => {
  // 원래 콘솔 함수 복원
  console.warn = originalWarn;
  console.error = originalError;
});

// 전역 테스트 헬퍼
global.flushPromises = () => new Promise(setImmediate);

// TypeScript 타입 정의
declare global {
  var flushPromises: () => Promise<void>;
}
