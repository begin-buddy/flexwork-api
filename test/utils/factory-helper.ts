import { faker } from '@faker-js/faker';

/**
 * 팩토리 헬퍼 유틸리티
 *
 * 팩토리에서 자주 사용되는 헬퍼 함수들을 제공합니다.
 */

/**
 * 랜덤 한글 이름 생성
 */
export function generateKoreanName(): string {
  const lastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임'];
  const firstNames = [
    '민준',
    '서준',
    '예준',
    '도윤',
    '시우',
    '주원',
    '하준',
    '지호',
    '준서',
    '준우',
    '서연',
    '서윤',
    '지우',
    '서현',
    '민서',
  ];

  return faker.helpers.arrayElement(lastNames) + faker.helpers.arrayElement(firstNames);
}

/**
 * 랜덤 한국 전화번호 생성
 */
export function generateKoreanPhoneNumber(): string {
  const prefix = faker.helpers.arrayElement(['010', '011', '016', '017', '018', '019']);
  const middle = faker.string.numeric(4);
  const last = faker.string.numeric(4);
  return `${prefix}-${middle}-${last}`;
}

/**
 * 랜덤 한국 주소 생성
 */
export function generateKoreanAddress(): string {
  const cities = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종'];
  const districts = ['강남구', '서초구', '송파구', '강동구', '마포구', '용산구', '종로구', '중구'];
  const streets = ['테헤란로', '강남대로', '논현로', '봉은사로', '삼성로', '영동대로'];

  const city = faker.helpers.arrayElement(cities);
  const district = faker.helpers.arrayElement(districts);
  const street = faker.helpers.arrayElement(streets);
  const number = faker.number.int({ min: 1, max: 999 });

  return `${city} ${district} ${street} ${number}`;
}

/**
 * 랜덤 날짜 범위 생성
 */
export function generateDateRange(
  startDaysAgo: number = 30,
  endDaysAgo: number = 0,
): {
  startDate: Date;
  endDate: Date;
} {
  const endDate = faker.date.recent({ days: endDaysAgo });
  const startDate = faker.date.recent({ days: startDaysAgo });

  return { startDate, endDate };
}

/**
 * 랜덤 이메일 도메인 생성
 */
export function generateEmailWithDomain(domain: string): string {
  const username = faker.internet.username().toLowerCase();
  return `${username}@${domain}`;
}

/**
 * 랜덤 UUID 배열 생성
 */
export function generateUuidArray(count: number): string[] {
  return Array.from({ length: count }, () => faker.string.uuid());
}

/**
 * 랜덤 숫자 배열 생성
 */
export function generateNumberArray(count: number, min: number = 0, max: number = 100): number[] {
  return Array.from({ length: count }, () => faker.number.int({ min, max }));
}

/**
 * 랜덤 문자열 배열 생성
 */
export function generateStringArray(
  count: number,
  options?: { minLength?: number; maxLength?: number },
): string[] {
  const minLength = options?.minLength || 5;
  const maxLength = options?.maxLength || 20;

  return Array.from({ length: count }, () =>
    faker.string.alpha({ length: faker.number.int({ min: minLength, max: maxLength }) }),
  );
}

/**
 * 랜덤 불린 배열 생성
 */
export function generateBooleanArray(count: number): boolean[] {
  return Array.from({ length: count }, () => faker.datatype.boolean());
}

/**
 * 시드 설정 (재현 가능한 테스트 데이터 생성)
 */
export function setSeed(seed: number): void {
  faker.seed(seed);
}

/**
 * 시드 리셋
 */
export function resetSeed(): void {
  faker.seed();
}
