import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 인증을 제외하는 데코레이터
 * @example
 * @Public()
 * @Get('public')
 * publicRoute() {
 *   return 'This is public route';
 * }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
