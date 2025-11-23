import { Global, Module } from '@nestjs/common';
import { LoggerService } from './logger.service';

/**
 * 로거 모듈
 * 전역 모듈로 설정하여 애플리케이션 전체에서 사용 가능
 */
@Global()
@Module({
  providers: [LoggerService],
  exports: [LoggerService],
})
export class LoggerModule {}
