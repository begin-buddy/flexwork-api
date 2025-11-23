import * as crypto from 'crypto';

/**
 * 해싱 유틸리티 함수
 */

/**
 * 비밀번호를 해싱합니다 (bcrypt 대체)
 * @param password 해싱할 비밀번호
 * @param salt 솔트 (선택사항)
 * @returns 해싱된 비밀번호
 */
export function hashPassword(password: string, salt?: string): string {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 1000, 64, 'sha512').toString('hex');
  return `${actualSalt}:${hash}`;
}

/**
 * 비밀번호를 검증합니다
 * @param password 검증할 비밀번호
 * @param hashedPassword 저장된 해시
 * @returns 일치 여부
 */
export function verifyPassword(password: string, hashedPassword: string): boolean {
  const [salt, originalHash] = hashedPassword.split(':');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === originalHash;
}

/**
 * SHA256 해시를 생성합니다
 * @param data 해싱할 데이터
 * @returns SHA256 해시
 */
export function sha256(data: string): string {
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * MD5 해시를 생성합니다
 * @param data 해싱할 데이터
 * @returns MD5 해시
 */
export function md5(data: string): string {
  return crypto.createHash('md5').update(data).digest('hex');
}

/**
 * 랜덤 토큰을 생성합니다
 * @param length 토큰 길이 (바이트)
 * @returns 랜덤 토큰
 */
export function generateRandomToken(length: number = 32): string {
  return crypto.randomBytes(length).toString('hex');
}

/**
 * UUID v4를 생성합니다
 * @returns UUID v4
 */
export function generateUUID(): string {
  return crypto.randomUUID();
}
