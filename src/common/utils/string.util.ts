/**
 * 문자열 유틸리티 함수
 */

/**
 * 문자열을 카멜케이스로 변환합니다
 * @param str 변환할 문자열
 * @returns 카멜케이스 문자열
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
      return index === 0 ? word.toLowerCase() : word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * 문자열을 스네이크케이스로 변환합니다
 * @param str 변환할 문자열
 * @returns 스네이크케이스 문자열
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '_$1')
    .toLowerCase()
    .replace(/^_/, '');
}

/**
 * 문자열을 케밥케이스로 변환합니다
 * @param str 변환할 문자열
 * @returns 케밥케이스 문자열
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([A-Z])/g, '-$1')
    .toLowerCase()
    .replace(/^-/, '');
}

/**
 * 문자열을 파스칼케이스로 변환합니다
 * @param str 변환할 문자열
 * @returns 파스칼케이스 문자열
 */
export function toPascalCase(str: string): string {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, word => {
      return word.toUpperCase();
    })
    .replace(/\s+/g, '');
}

/**
 * 문자열을 자릅니다
 * @param str 자를 문자열
 * @param length 최대 길이
 * @param suffix 접미사 (기본값: '...')
 * @returns 잘린 문자열
 */
export function truncate(str: string, length: number, suffix: string = '...'): string {
  if (str.length <= length) {
    return str;
  }
  return str.substring(0, length - suffix.length) + suffix;
}

/**
 * 문자열의 첫 글자를 대문자로 변환합니다
 * @param str 변환할 문자열
 * @returns 첫 글자가 대문자인 문자열
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 문자열에서 HTML 태그를 제거합니다
 * @param str HTML이 포함된 문자열
 * @returns HTML이 제거된 문자열
 */
export function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '');
}

/**
 * 문자열이 비어있는지 확인합니다 (null, undefined, 빈 문자열, 공백)
 * @param str 확인할 문자열
 * @returns 비어있는지 여부
 */
export function isEmpty(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * 슬러그를 생성합니다
 * @param str 슬러그로 변환할 문자열
 * @returns 슬러그
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
