/**
 * 날짜 유틸리티 함수
 */

/**
 * 날짜를 포맷팅합니다
 * @param date 포맷팅할 날짜
 * @param format 포맷 문자열 (기본값: 'YYYY-MM-DD')
 * @returns 포맷팅된 날짜 문자열
 */
export function formatDate(date: Date | string, format: string = 'YYYY-MM-DD'): string {
  const d = new Date(date);

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const seconds = String(d.getSeconds()).padStart(2, '0');

  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds);
}

/**
 * 두 날짜 사이의 차이를 일 단위로 계산합니다
 * @param date1 첫 번째 날짜
 * @param date2 두 번째 날짜
 * @returns 일 수 차이
 */
export function getDaysDifference(date1: Date | string, date2: Date | string): number {
  const d1 = new Date(date1);
  const d2 = new Date(date2);

  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * 날짜에 일 수를 더합니다
 * @param date 기준 날짜
 * @param days 더할 일 수
 * @returns 새로운 날짜
 */
export function addDays(date: Date | string, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * 날짜가 유효한지 확인합니다
 * @param date 확인할 날짜
 * @returns 유효 여부
 */
export function isValidDate(date: any): boolean {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * ISO 8601 형식으로 날짜를 포맷팅합니다
 * @param date 포맷팅할 날짜
 * @returns ISO 8601 형식의 날짜 문자열
 */
export function toISOString(date: Date | string): string {
  return new Date(date).toISOString();
}

/**
 * 현재 시간을 타임스탬프로 반환합니다
 * @returns 현재 타임스탬프
 */
export function now(): number {
  return Date.now();
}
