import { Entity, Column } from 'typeorm';
import { BaseEntity } from '../../../common/base/base.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('examples')
export class Example extends BaseEntity {
  @ApiProperty({
    description: '제목',
    example: '샘플 제목',
  })
  @Column()
  title!: string;

  @ApiProperty({
    description: '설명',
    example: '샘플 설명입니다.',
  })
  @Column()
  description!: string;

  @ApiProperty({
    description: '활성화 여부',
    example: true,
  })
  @Column({ default: true })
  isActive!: boolean;
}
