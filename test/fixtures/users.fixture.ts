import { User } from '../factories/user.factory';

/**
 * 사용자 픽스처 (정적 테스트 데이터)
 *
 * 특정 시나리오에서 재사용 가능한 고정된 테스트 데이터입니다.
 * 팩토리와 달리 매번 동일한 데이터를 반환합니다.
 */

/**
 * 기본 관리자 사용자
 */
export const ADMIN_USER: User = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'admin@example.com',
  name: 'Admin User',
  age: 35,
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  isActive: true,
};

/**
 * 기본 일반 사용자
 */
export const REGULAR_USER: User = {
  id: '00000000-0000-0000-0000-000000000002',
  email: 'user@example.com',
  name: 'Regular User',
  age: 28,
  createdAt: new Date('2024-01-02T00:00:00Z'),
  updatedAt: new Date('2024-01-02T00:00:00Z'),
  isActive: true,
};

/**
 * 비활성 사용자
 */
export const INACTIVE_USER: User = {
  id: '00000000-0000-0000-0000-000000000003',
  email: 'inactive@example.com',
  name: 'Inactive User',
  age: 45,
  createdAt: new Date('2024-01-03T00:00:00Z'),
  updatedAt: new Date('2024-01-03T00:00:00Z'),
  isActive: false,
};

/**
 * 테스트용 사용자 목록
 */
export const TEST_USERS: User[] = [ADMIN_USER, REGULAR_USER, INACTIVE_USER];
