import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { SkipThrottle } from '@nestjs/throttler';

/**
 * 헬스체크 컨트롤러
 * 애플리케이션의 상태를 모니터링하는 엔드포인트를 제공
 */
@Controller('health')
@SkipThrottle()
export class HealthController {
  constructor(
    private readonly health: HealthCheckService,
    private readonly memory: MemoryHealthIndicator,
    private readonly disk: DiskHealthIndicator,
  ) {}

  /**
   * 전체 헬스체크
   * 메모리, 디스크 상태를 포함한 종합 헬스체크
   */
  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // 메모리 힙 사용량 체크 (150MB 이하)
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      // 메모리 RSS 사용량 체크 (300MB 이하)
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
      // 디스크 사용량 체크 (90% 이하)
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.9,
        }),
    ]);
  }

  /**
   * Liveness 프로브
   * 애플리케이션이 실행 중인지 확인 (Kubernetes 등에서 사용)
   */
  @Get('live')
  @HealthCheck()
  checkLiveness() {
    return this.health.check([]);
  }

  /**
   * Readiness 프로브
   * 애플리케이션이 트래픽을 받을 준비가 되었는지 확인 (Kubernetes 등에서 사용)
   */
  @Get('ready')
  @HealthCheck()
  checkReadiness() {
    return this.health.check([
      // 메모리 체크
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
    ]);
  }
}
