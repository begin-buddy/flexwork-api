import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../../shared/logger/logger.service';

/**
 * 로깅 인터셉터
 * 모든 요청/응답을 로깅하여 API 호출 추적
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly logger: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, query, params } = request;
    const now = Date.now();

    // 요청 로깅
    this.logger.logWithMeta('info', 'Incoming Request', {
      method,
      url,
      body,
      query,
      params,
    });

    return next.handle().pipe(
      tap({
        next: data => {
          const response = context.switchToHttp().getResponse();
          const delay = Date.now() - now;

          // 응답 성공 로깅
          this.logger.logWithMeta('info', 'Outgoing Response', {
            method,
            url,
            statusCode: response.statusCode,
            delay: `${delay}ms`,
          });
        },
        error: error => {
          const delay = Date.now() - now;

          // 응답 에러 로깅
          this.logger.logWithMeta('error', 'Response Error', {
            method,
            url,
            error: error.message,
            delay: `${delay}ms`,
          });
        },
      }),
    );
  }
}
