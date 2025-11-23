/**
 * 페이지네이션 유틸리티 함수
 */

/**
 * 페이지네이션 옵션 인터페이스
 */
export interface PaginationOptions {
  page: number;
  limit: number;
}

/**
 * 페이지네이션 메타 정보 인터페이스
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * 페이지네이션 결과 인터페이스
 */
export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

/**
 * 페이지네이션을 계산합니다
 * @param page 현재 페이지 (1부터 시작)
 * @param limit 페이지당 항목 수
 * @returns skip과 take 값
 */
export function calculatePagination(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const take = limit;

  return { skip, take };
}

/**
 * 페이지네이션 메타 정보를 생성합니다
 * @param page 현재 페이지
 * @param limit 페이지당 항목 수
 * @param totalItems 전체 항목 수
 * @returns 페이지네이션 메타 정보
 */
export function createPaginationMeta(
  page: number,
  limit: number,
  totalItems: number,
): PaginationMeta {
  const totalPages = Math.ceil(totalItems / limit);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  };
}

/**
 * 페이지네이션 결과를 생성합니다
 * @param data 데이터 배열
 * @param page 현재 페이지
 * @param limit 페이지당 항목 수
 * @param totalItems 전체 항목 수
 * @returns 페이지네이션 결과
 */
export function createPaginatedResult<T>(
  data: T[],
  page: number,
  limit: number,
  totalItems: number,
): PaginatedResult<T> {
  const meta = createPaginationMeta(page, limit, totalItems);

  return {
    data,
    meta,
  };
}

/**
 * 페이지네이션 옵션을 검증하고 정규화합니다
 * @param page 페이지 번호
 * @param limit 페이지당 항목 수
 * @param maxLimit 최대 제한 (기본값: 100)
 * @returns 정규화된 페이지네이션 옵션
 */
export function normalizePaginationOptions(
  page: number = 1,
  limit: number = 10,
  maxLimit: number = 100,
): PaginationOptions {
  const normalizedPage = Math.max(1, page);
  const normalizedLimit = Math.min(Math.max(1, limit), maxLimit);

  return {
    page: normalizedPage,
    limit: normalizedLimit,
  };
}
