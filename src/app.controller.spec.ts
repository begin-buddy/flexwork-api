import { Test, TestingModule } from '@nestjs/testing';
import { I18nService } from 'nestjs-i18n';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  const mockI18nService = {
    translate: jest.fn((key: string, options?: any) => {
      if (key === 'common.welcome') return Promise.resolve('환영합니다!');
      if (key === 'common.hello') return Promise.resolve(`${options?.args?.name}님 안녕하세요!`);
      return Promise.resolve(key);
    }),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return welcome message with i18n', async () => {
      const result = await appController.getHello();
      expect(result).toHaveProperty('message', 'Hello World!');
      expect(result).toHaveProperty('i18n');
      expect(result.i18n).toHaveProperty('welcome', '환영합니다!');
      expect(result.i18n).toHaveProperty('hello', 'NestJS님 안녕하세요!');
    });
  });
});
