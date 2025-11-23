import { applyDecorators, Type } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';

/**
 * API 응답 데코레이터
 * @param model 응답 모델 타입
 * @param isArray 배열 응답 여부
 */
export const ApiResponseType = <TModel extends Type<any>>(model: TModel, isArray = false) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      schema: isArray
        ? {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          }
        : {
            $ref: getSchemaPath(model),
          },
    }),
  );
};

/**
 * 성공 응답 데코레이터
 */
export const ApiSuccessResponse = <TModel extends Type<any>>(model: TModel, isArray = false) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 200,
      description: '성공',
      schema: isArray
        ? {
            type: 'array',
            items: { $ref: getSchemaPath(model) },
          }
        : {
            $ref: getSchemaPath(model),
          },
    }),
  );
};

/**
 * 생성 성공 응답 데코레이터
 */
export const ApiCreatedResponse = <TModel extends Type<any>>(model: TModel) => {
  return applyDecorators(
    ApiExtraModels(model),
    ApiResponse({
      status: 201,
      description: '생성 성공',
      schema: {
        $ref: getSchemaPath(model),
      },
    }),
  );
};
