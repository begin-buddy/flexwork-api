import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import * as path from 'path';

/**
 * Winston 기반 로거 서비스
 * JSON 포맷 로깅, 파일 및 콘솔 출력 지원
 */
@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    this.logger = this.createLogger();
  }

  /**
   * Winston 로거 인스턴스 생성
   */
  private createLogger(): winston.Logger {
    const logLevel = this.configService.get<string>('logging.level', 'info');
    const fileEnabled = this.configService.get<boolean>('logging.fileEnabled', false);
    const filePath = this.configService.get<string>('logging.filePath', './logs');
    const env = this.configService.get<string>('env', 'development');

    // 콘솔 포맷 설정 (개발/프로덕션 환경에 따라 다름)
    const consoleFormat =
      env === 'production'
        ? winston.format.json()
        : winston.format.combine(
            winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            winston.format.colorize(),
            winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
              let msg = `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
              if (Object.keys(meta).length > 0) {
                msg += ` ${JSON.stringify(meta)}`;
              }
              return msg;
            }),
          );

    // 트랜스포트 설정
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: consoleFormat,
      }),
    ];

    // 파일 로깅 활성화 시 파일 트랜스포트 추가
    if (fileEnabled) {
      transports.push(
        new winston.transports.File({
          filename: path.join(filePath, 'error.log'),
          level: 'error',
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
        new winston.transports.File({
          filename: path.join(filePath, 'combined.log'),
          format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
        }),
      );
    }

    return winston.createLogger({
      level: logLevel,
      format: winston.format.json(),
      transports,
      exceptionHandlers: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
      ],
      rejectionHandlers: [
        new winston.transports.Console({
          format: consoleFormat,
        }),
      ],
    });
  }

  /**
   * 로그 레벨별 메서드
   */
  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, trace?: string, context?: string) {
    this.logger.error(message, { trace, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  /**
   * 구조화된 로깅을 위한 메서드
   */
  logWithMeta(level: string, message: string, meta: Record<string, any>) {
    this.logger.log(level, message, meta);
  }
}
