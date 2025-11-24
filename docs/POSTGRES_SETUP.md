# PostgreSQL 설정 가이드

FlexWork API 프로젝트를 위한 PostgreSQL Docker 컨테이너 설정 가이드입니다.

## 전제 조건

- Docker Desktop이 설치되어 있어야 합니다
- Docker가 실행 중이어야 합니다

## 빠른 시작

### 1. PostgreSQL 컨테이너 시작

```bash
npm run docker:postgres:up
```

또는

```bash
docker-compose -f docker/docker-compose.postgres.yml up -d
```

### 2. 환경 변수 확인

`.env` 파일이 프로젝트 루트에 생성되어 있어야 합니다:

```env
DATABASE_TYPE=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=flexwork_dev
DATABASE_USER=flexwork
DATABASE_PASSWORD=flexwork_password
DATABASE_SYNCHRONIZE=true
DATABASE_LOGGING=false
```

### 3. 의존성 설치

```bash
npm install
```

## 컨테이너 관리

### 컨테이너 시작

```bash
npm run docker:postgres:up
```

### 컨테이너 중지

```bash
npm run docker:postgres:down
```

### 로그 확인

```bash
npm run docker:postgres:logs
```

## 포트 정보

- **PostgreSQL**: `localhost:5432`
- **pgAdmin**: `localhost:5050`

## pgAdmin 접속

웹 브라우저에서 `http://localhost:5050`로 접속:

- Email: `admin@flexwork.com`
- Password: `admin`

### 서버 연결 설정

1. pgAdmin에서 "Add New Server" 클릭
2. 다음 정보 입력:
   - **Name**: FlexWork Development
   - **Host**: `postgres-dev` (컨테이너 이름)
   - **Port**: `5432`
   - **Username**: `flexwork`
   - **Password**: `flexwork_password`
   - **Database**: `flexwork_dev`

## 데이터베이스 연결 테스트

```bash
docker exec flexwork-postgres-dev psql -U flexwork -d flexwork_dev -c "\l"
```

## 설치된 확장

- `uuid-ossp`: UUID 생성 지원

## 데이터 영속성

데이터는 Docker volume에 저장되어 컨테이너를 재시작해도 유지됩니다:

- Volume 이름: `docker_postgres-dev-data`

## 데이터베이스 초기화

데이터베이스를 초기 상태로 되돌리려면:

```bash
# 컨테이너와 볼륨 삭제
docker-compose -f docker/docker-compose.postgres.yml down -v

# 다시 시작
npm run docker:postgres:up
```

## 트러블슈팅

### 포트 충돌

기존에 5432 포트를 사용 중인 경우:

1. `docker/docker-compose.postgres.yml` 파일 수정:
   ```yaml
   ports:
     - '5433:5432'  # 호스트 포트 변경
   ```

2. `.env` 파일 수정:
   ```env
   DATABASE_PORT=5433
   ```

### 연결 오류

1. Docker Desktop이 실행 중인지 확인
2. 컨테이너가 정상 실행 중인지 확인:
   ```bash
   docker ps --filter name=flexwork-postgres
   ```

3. 컨테이너 로그 확인:
   ```bash
   npm run docker:postgres:logs
   ```

## 프로덕션 환경

프로덕션 환경에서는:

- 강력한 비밀번호 사용
- DATABASE_SYNCHRONIZE를 false로 설정
- 마이그레이션 사용
- 정기적인 백업 수행
