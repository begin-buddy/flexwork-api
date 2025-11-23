import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';
import { User, userFactory } from './user.factory';

/**
 * 게시글 엔티티 인터페이스 (예제)
 */
export interface Post {
  id: string;
  title: string;
  content: string;
  author: User;
  authorId: string;
  tags: string[];
  viewCount: number;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * 게시글 팩토리
 *
 * @example
 * ```typescript
 * // 기본 게시글 생성
 * const post = postFactory.build();
 *
 * // 특정 작성자로 게시글 생성
 * const user = userFactory.build();
 * const post = postFactory.build({ author: user, authorId: user.id });
 *
 * // 발행된 게시글만 생성
 * const publishedPost = postFactory.build({ isPublished: true });
 * ```
 */
export const postFactory = Factory.define<Post>(({ sequence, associations }) => {
  const author = associations.author || userFactory.build();
  const isPublished = faker.datatype.boolean();

  return {
    id: faker.string.uuid(),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    author,
    authorId: author.id,
    tags: faker.helpers.arrayElements(
      ['javascript', 'typescript', 'nestjs', 'testing', 'react'],
      3,
    ),
    viewCount: faker.number.int({ min: 0, max: 10000 }),
    isPublished,
    publishedAt: isPublished ? faker.date.past() : null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  };
});

/**
 * 발행된 게시글 팩토리
 */
export const publishedPostFactory = postFactory.params({
  isPublished: true,
  publishedAt: () => faker.date.past(),
});

/**
 * 초안 게시글 팩토리
 */
export const draftPostFactory = postFactory.params({
  isPublished: false,
  publishedAt: null,
});
