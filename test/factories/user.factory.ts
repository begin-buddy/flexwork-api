import { Factory } from 'fishery';
import { faker } from '@faker-js/faker';

/**
 * 사용자 엔티티 인터페이스 (예제)
 */
export interface User {
  id: string;
  email: string;
  name: string;
  age: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

/**
 * 사용자 팩토리
 *
 * @example
 * ```typescript
 * // 기본 사용자 생성
 * const user = userFactory.build();
 *
 * // 특정 속성 오버라이드
 * const admin = userFactory.build({ email: 'admin@example.com' });
 *
 * // 여러 사용자 생성
 * const users = userFactory.buildList(10);
 *
 * // 트랜지언트 파라미터 사용
 * const youngUser = userFactory.build({}, { transient: { isYoung: true } });
 * ```
 */
export const userFactory = Factory.define<User, { isYoung?: boolean }>(
  ({ sequence, transientParams }) => ({
    id: faker.string.uuid(),
    email: faker.internet.email(),
    name: faker.person.fullName(),
    age: transientParams.isYoung
      ? faker.number.int({ min: 18, max: 30 })
      : faker.number.int({ min: 18, max: 80 }),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    isActive: faker.datatype.boolean(),
  }),
);

/**
 * 관리자 사용자 팩토리 (userFactory 확장)
 */
export const adminUserFactory = userFactory.params({
  email: faker.internet.email({ provider: 'admin.example.com' }),
  isActive: true,
});

/**
 * 비활성 사용자 팩토리
 */
export const inactiveUserFactory = userFactory.params({
  isActive: false,
});
