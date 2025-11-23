import { Throttle, SkipThrottle } from '@nestjs/throttler';

/**
 * Rate Limiting 데코레이터 재수출
 *
 * @example
 * // 특정 엔드포인트에 커스텀 Rate Limit 설정
 * @Throttle({ default: { limit: 5, ttl: 60000 } })
 * async sensitiveEndpoint() {}
 *
 * @example
 * // Rate Limiting 건너뛰기
 * @SkipThrottle()
 * async publicEndpoint() {}
 */
export { Throttle, SkipThrottle };

/**
 * 일반적으로 사용되는 Rate Limit 프리셋
 */
export const RateLimitPresets = {
  // 엄격한 제한 (인증, 결제 등)
  STRICT: { default: { limit: 3, ttl: 60000 } },

  // 보통 제한 (일반 API)
  NORMAL: { default: { limit: 10, ttl: 60000 } },

  // 느슨한 제한 (공개 API)
  RELAXED: { default: { limit: 30, ttl: 60000 } },

  // 파일 업로드용
  FILE_UPLOAD: { default: { limit: 5, ttl: 300000 } }, // 5분당 5개
};
