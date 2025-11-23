import { Test, TestingModule } from '@nestjs/testing';
import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = module.get<AppService>(AppService);
  });

  it('서비스가 정의되어야 함', () => {
    expect(service).toBeDefined();
  });

  describe('getHello', () => {
    it('Hello World!를 반환해야 함', () => {
      // Given
      const expectedMessage = 'Hello World!';

      // When
      const result = service.getHello();

      // Then
      expect(result).toBe(expectedMessage);
    });

    it('문자열 타입을 반환해야 함', () => {
      // When
      const result = service.getHello();

      // Then
      expect(typeof result).toBe('string');
    });

    it('빈 문자열이 아니어야 함', () => {
      // When
      const result = service.getHello();

      // Then
      expect(result).not.toBe('');
      expect(result.length).toBeGreaterThan(0);
    });
  });
});
