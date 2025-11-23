import { ApiProperty } from '@nestjs/swagger';
import { BaseResponseDto } from '../../../common/base/base.dto';

/**
 * 예제 응답 DTO
 */
export class ExampleResponseDto extends BaseResponseDto {
  @ApiProperty({
    description: '제목',
    example: '샘플 제목',
  })
  title!: string;

  @ApiProperty({
    description: '설명',
    example: '샘플 설명입니다.',
  })
  description!: string;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  isActive!: boolean;
}
