import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoggerService } from '../../shared/logger/logger.service';

/**
 * 전역 HTTP 예외 필터
 * 모든 HTTP 예외를 캐치하여 일관된 형식으로 응답
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();

    const exceptionResponse = exception.getResponse();
    const error =
      typeof exceptionResponse === 'string' ? { message: exceptionResponse } : exceptionResponse;

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...error,
    };

    // 에러 로깅
    this.logger.error(
      `HTTP Exception: ${exception.message}`,
      exception.stack,
      'HttpExceptionFilter',
    );

    this.logger.logWithMeta('error', 'HTTP Exception Details', {
      statusCode: status,
      path: request.url,
      method: request.method,
      error: errorResponse,
    });

    response.status(status).json(errorResponse);
  }
}

/**
 * 전역 예외 필터 (모든 예외 캐치)
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException ? exception.message : 'Internal server error';

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
    };

    // 예상치 못한 에러 로깅
    this.logger.error(
      `Unexpected Error: ${message}`,
      exception instanceof Error ? exception.stack : String(exception),
      'AllExceptionsFilter',
    );

    this.logger.logWithMeta('error', 'Unexpected Error Details', {
      statusCode: status,
      path: request.url,
      method: request.method,
      error: errorResponse,
    });

    response.status(status).json(errorResponse);
  }
}
