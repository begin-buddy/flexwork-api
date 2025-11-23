/**
 * 테스트 팩토리 통합 export
 *
 * 이 파일은 모든 팩토리를 한 곳에서 import할 수 있도록 합니다.
 *
 * @example
 * ```typescript
 * import { userFactory, postFactory } from '@test/factories';
 *
 * const user = userFactory.build();
 * const post = postFactory.build({ author: user });
 * ```
 */

export * from './user.factory';
export * from './post.factory';
