import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * 역할 기반 접근 제어 데코레이터
 * @param roles 허용할 역할 목록
 * @example
 * @Roles('admin', 'moderator')
 * @Get('admin-only')
 * adminOnlyRoute() {
 *   return 'This is admin only route';
 * }
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
