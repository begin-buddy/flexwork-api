import { ApiProperty } from '@nestjs/swagger';

/**
 * 기본 응답 DTO
 */
export class BaseResponseDto {
  @ApiProperty({
    description: '고유 ID',
    example: 1,
  })
  id!: number;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  createdAt!: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  updatedAt!: Date;

  @ApiProperty({
    description: '삭제일시',
    example: null,
    required: false,
  })
  deletedAt?: Date;
}

/**
 * 페이지네이션 쿼리 DTO
 */
export class PaginationQueryDto {
  @ApiProperty({
    description: '페이지 번호',
    example: 1,
    default: 1,
    required: false,
  })
  page?: number = 1;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
    default: 10,
    required: false,
  })
  limit?: number = 10;
}

/**
 * 페이지네이션 메타 DTO
 */
export class PaginationMetaDto {
  @ApiProperty({
    description: '현재 페이지',
    example: 1,
  })
  page!: number;

  @ApiProperty({
    description: '페이지당 항목 수',
    example: 10,
  })
  limit!: number;

  @ApiProperty({
    description: '전체 항목 수',
    example: 100,
  })
  totalItems!: number;

  @ApiProperty({
    description: '전체 페이지 수',
    example: 10,
  })
  totalPages!: number;

  @ApiProperty({
    description: '다음 페이지 존재 여부',
    example: true,
  })
  hasNextPage!: boolean;

  @ApiProperty({
    description: '이전 페이지 존재 여부',
    example: false,
  })
  hasPreviousPage!: boolean;
}

/**
 * 페이지네이션 응답 DTO
 */
export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: '데이터 목록',
    isArray: true,
  })
  data!: T[];

  @ApiProperty({
    description: '페이지네이션 메타 정보',
    type: PaginationMetaDto,
  })
  meta!: PaginationMetaDto;
}
