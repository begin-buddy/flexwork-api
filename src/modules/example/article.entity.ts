import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * Article 엔티티
 *
 * 블로그 게시글을 표현하는 엔티티
 */
@Entity('articles')
export class Article {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  author!: string;

  @Column({ type: 'varchar', length: 50, default: 'draft' })
  status!: 'draft' | 'published' | 'archived';

  @Column({ type: 'int', default: 0 })
  viewCount!: number;

  @Column({ type: 'simple-array', nullable: true })
  tags!: string[];

  @CreateDateColumn({ type: 'timestamp' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamp' })
  updatedAt!: Date;

  @Column({ type: 'timestamp', nullable: true })
  publishedAt!: Date | null;
}
