import { IsString, IsNotEmpty, IsOptional, MinLength, MaxLength, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 예제 생성 DTO
 * class-validator 데코레이터를 사용한 유효성 검증 예시
 */
export class CreateExampleDto {
  @ApiProperty({
    description: '제목',
    example: '샘플 제목',
    minLength: 2,
    maxLength: 100,
  })
  @IsString({ message: 'validation.isString' })
  @IsNotEmpty({ message: 'validation.isNotEmpty' })
  @MinLength(2, { message: 'validation.minLength' })
  @MaxLength(100, { message: 'validation.maxLength' })
  title!: string;

  @ApiProperty({
    description: '설명',
    example: '샘플 설명입니다.',
    required: false,
    maxLength: 500,
  })
  @IsString({ message: 'validation.isString' })
  @IsOptional()
  @MaxLength(500, { message: 'validation.maxLength' })
  description?: string;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean({ message: 'validation.isBoolean' })
  @IsOptional()
  isActive?: boolean = true;
}
