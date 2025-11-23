import {
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 기본 엔티티 클래스
 * 모든 엔티티에서 상속받아 사용
 */
export abstract class BaseEntity {
  @ApiProperty({
    description: '고유 ID',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id!: number;

  @ApiProperty({
    description: '생성일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @CreateDateColumn()
  createdAt!: Date;

  @ApiProperty({
    description: '수정일시',
    example: '2024-01-01T00:00:00.000Z',
  })
  @UpdateDateColumn()
  updatedAt!: Date;

  @ApiProperty({
    description: '삭제일시',
    example: null,
    required: false,
  })
  @DeleteDateColumn()
  deletedAt?: Date;
}
