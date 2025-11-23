import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

/**
 * 전역 유효성 검증 파이프
 * class-validator 데코레이터를 사용한 DTO 검증
 */
@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    // 메타타입이 없거나 네이티브 타입인 경우 검증 생략
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    // plain object를 class instance로 변환
    const object = plainToInstance(metatype, value);

    // 유효성 검증 수행
    const errors = await validate(object);

    if (errors.length > 0) {
      // 유효성 검증 실패 시 에러 메시지 구성
      const messages = errors.map(error => {
        return Object.values(error.constraints || {}).join(', ');
      });

      throw new BadRequestException({
        statusCode: 400,
        message: 'Validation failed',
        errors: messages,
      });
    }

    return object;
  }

  /**
   * 검증이 필요한 타입인지 확인
   */
  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
