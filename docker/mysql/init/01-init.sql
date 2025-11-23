-- 초기 데이터베이스 설정
-- 이 파일은 MySQL 컨테이너 최초 실행 시 자동으로 실행됩니다.

-- 문자 인코딩 설정
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;

-- 타임존 설정
SET time_zone = '+00:00';

-- 데이터베이스 생성 (이미 docker-compose에서 생성하지만 명시적으로 추가)
CREATE DATABASE IF NOT EXISTS `nestjs_db`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `nestjs_dev`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 개발용 테스트 데이터베이스
CREATE DATABASE IF NOT EXISTS `nestjs_test`
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

-- 권한 설정
GRANT ALL PRIVILEGES ON `nestjs_db`.* TO 'nestjs'@'%';
GRANT ALL PRIVILEGES ON `nestjs_dev`.* TO 'nestjs'@'%';
GRANT ALL PRIVILEGES ON `nestjs_test`.* TO 'nestjs'@'%';

FLUSH PRIVILEGES;
