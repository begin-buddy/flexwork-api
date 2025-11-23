# 배포 가이드

[English](./DEPLOYMENT.md) | 한국어

NestJS Template 프로젝트의 배포 가이드입니다.

## 목차

- [배포 준비](#배포-준비)
- [환경 설정](#환경-설정)
- [Docker 배포](#docker-배포)
- [클라우드 배포](#클라우드-배포)
- [CI/CD](#cicd)
- [모니터링](#모니터링)
- [보안 체크리스트](#보안-체크리스트)

## 배포 준비

### 1. 환경 변수 설정

프로덕션 환경 변수 준비:

```env
# .env.production
NODE_ENV=production
PORT=3000

# 데이터베이스
DB_HOST=production-db-host
DB_PORT=3306
DB_USERNAME=prod_user
DB_PASSWORD=secure_password_here
DB_DATABASE=nestjs_prod

# JWT (강력한 시크릿 키 사용)
JWT_SECRET=very-secure-random-secret-key-change-this
JWT_EXPIRES_IN=1d

# 로깅
LOG_LEVEL=error

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### 2. 빌드 테스트

```bash
# 프로덕션 빌드
pnpm run build

# 빌드 결과 확인
ls -la dist/

# 프로덕션 모드 로컬 테스트
NODE_ENV=production node dist/main.js
```

### 3. 보안 검토

- [ ] 환경 변수에 민감한 정보가 하드코딩되지 않았는지 확인
- [ ] 강력한 JWT 시크릿 키 설정
- [ ] 데이터베이스 비밀번호 강도 확인
- [ ] CORS 설정 확인
- [ ] Rate Limiting 설정 확인
- [ ] Helmet 보안 헤더 활성화 확인

## 환경 설정

### 프로덕션 최적화

#### package.json 스크립트

```json
{
  "scripts": {
    "start:prod": "node dist/main"
  }
}
```

#### 프로덕션 의존성만 설치

```bash
pnpm install --prod --frozen-lockfile
```

### Node.js 프로세스 관리

#### PM2 사용

```bash
# PM2 설치
npm install -g pm2

# 애플리케이션 시작
pm2 start dist/main.js --name nestjs-app

# 클러스터 모드 (멀티코어 활용)
pm2 start dist/main.js -i max --name nestjs-app

# 상태 확인
pm2 status

# 로그 확인
pm2 logs nestjs-app

# 재시작
pm2 restart nestjs-app

# 중지
pm2 stop nestjs-app
```

#### PM2 Ecosystem 파일

`ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'nestjs-app',
      script: 'dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
      error_file: './logs/err.log',
      out_file: './logs/out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
    },
  ],
};
```

실행:
```bash
pm2 start ecosystem.config.js
```

## Docker 배포

### 1. Docker 이미지 빌드

```bash
# 프로덕션 이미지 빌드
docker build -f docker/Dockerfile -t nestjs-app:latest .

# 이미지 확인
docker images | grep nestjs-app

# 이미지 크기 확인
docker image inspect nestjs-app:latest --format='{{.Size}}' | numfmt --to=iec
```

### 2. Docker Compose 배포

```bash
# 프로덕션 환경 실행
docker-compose -f docker/docker-compose.yml up -d

# 로그 확인
docker-compose -f docker/docker-compose.yml logs -f app

# 상태 확인
docker-compose -f docker/docker-compose.yml ps

# 중지
docker-compose -f docker/docker-compose.yml down
```

### 3. Docker 레지스트리에 푸시

#### Docker Hub

```bash
# 로그인
docker login

# 태그
docker tag nestjs-app:latest username/nestjs-app:latest
docker tag nestjs-app:latest username/nestjs-app:1.0.0

# 푸시
docker push username/nestjs-app:latest
docker push username/nestjs-app:1.0.0
```

#### GitHub Container Registry

```bash
# 로그인
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# 태그
docker tag nestjs-app:latest ghcr.io/username/nestjs-app:latest

# 푸시
docker push ghcr.io/username/nestjs-app:latest
```

## 클라우드 배포

### AWS EC2

#### 1. EC2 인스턴스 설정

```bash
# EC2 인스턴스에 SSH 접속
ssh -i key.pem ec2-user@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Docker 설치
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Docker Compose 설치
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. 애플리케이션 배포

```bash
# 저장소 클론
git clone https://github.com/your-org/template-typescript-nestjs.git
cd template-typescript-nestjs

# 환경 변수 설정
cp .env.example .env
vim .env  # 프로덕션 값으로 수정

# Docker Compose로 실행
docker-compose -f docker/docker-compose.yml up -d
```

#### 3. Nginx 리버스 프록시 설정

```bash
# Nginx 설치
sudo yum install nginx -y

# 설정 파일 작성
sudo vim /etc/nginx/conf.d/nestjs.conf
```

`/etc/nginx/conf.d/nestjs.conf`:
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Nginx 시작
sudo service nginx start
sudo systemctl enable nginx
```

#### 4. SSL 인증서 설정 (Let's Encrypt)

```bash
# Certbot 설치
sudo yum install certbot python3-certbot-nginx -y

# SSL 인증서 발급
sudo certbot --nginx -d yourdomain.com

# 자동 갱신 설정
sudo certbot renew --dry-run
```

### AWS ECS (Fargate)

#### 1. ECR에 이미지 푸시

```bash
# ECR 로그인
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# 이미지 태그
docker tag nestjs-app:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nestjs-app:latest

# 푸시
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nestjs-app:latest
```

#### 2. ECS 태스크 정의

`task-definition.json`:
```json
{
  "family": "nestjs-app",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "containerDefinitions": [
    {
      "name": "nestjs-app",
      "image": "ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nestjs-app:latest",
      "portMappings": [
        {
          "containerPort": 3000,
          "protocol": "tcp"
        }
      ],
      "environment": [
        {
          "name": "NODE_ENV",
          "value": "production"
        }
      ],
      "secrets": [
        {
          "name": "DB_PASSWORD",
          "valueFrom": "arn:aws:secretsmanager:region:account-id:secret:db-password"
        }
      ],
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/nestjs-app",
          "awslogs-region": "us-east-1",
          "awslogs-stream-prefix": "ecs"
        }
      }
    }
  ]
}
```

### Google Cloud Run

```bash
# gcloud CLI 인증
gcloud auth login

# 프로젝트 설정
gcloud config set project PROJECT_ID

# 이미지 빌드 및 푸시
gcloud builds submit --tag gcr.io/PROJECT_ID/nestjs-app

# Cloud Run에 배포
gcloud run deploy nestjs-app \
  --image gcr.io/PROJECT_ID/nestjs-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Heroku

```bash
# Heroku CLI 로그인
heroku login

# 앱 생성
heroku create your-app-name

# 환경 변수 설정
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set JWT_SECRET=your-secret

# 배포
git push heroku main

# 로그 확인
heroku logs --tail
```

## CI/CD

### GitHub Actions

이미 설정된 `.github/workflows/ci.yml`과 `.github/workflows/docker.yml`을 사용합니다.

#### 배포 워크플로우 추가

`.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production

on:
  push:
    tags:
      - 'v*.*.*'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2

      - name: Build and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.ref_name }}
        run: |
          docker build -f docker/Dockerfile -t $ECR_REGISTRY/nestjs-app:$IMAGE_TAG .
          docker push $ECR_REGISTRY/nestjs-app:$IMAGE_TAG

      - name: Deploy to ECS
        run: |
          aws ecs update-service \
            --cluster production-cluster \
            --service nestjs-app \
            --force-new-deployment
```

## 모니터링

### 헬스체크

애플리케이션에 이미 구현된 헬스체크 엔드포인트 활용:

```bash
# 헬스체크
curl http://your-domain.com/health

# 응답
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

### 로깅

#### CloudWatch (AWS)

```bash
# CloudWatch 로그 그룹 생성
aws logs create-log-group --log-group-name /ecs/nestjs-app

# 로그 확인
aws logs tail /ecs/nestjs-app --follow
```

#### 로그 수집 도구

- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Grafana Loki**: 경량 로그 수집
- **Datadog**: 통합 모니터링

### APM (Application Performance Monitoring)

#### New Relic

```bash
# New Relic 에이전트 설치
pnpm add newrelic

# newrelic.js 설정
cp node_modules/newrelic/newrelic.js .
```

`main.ts`:
```typescript
import 'newrelic';  // 첫 줄에 추가
```

#### Datadog

```bash
pnpm add dd-trace
```

`main.ts`:
```typescript
import tracer from 'dd-trace';
tracer.init();
```

## 보안 체크리스트

### 배포 전 체크리스트

- [ ] 모든 환경 변수가 안전하게 관리되고 있는가?
- [ ] 프로덕션 데이터베이스 비밀번호가 강력한가?
- [ ] JWT 시크릿 키가 충분히 복잡한가?
- [ ] CORS가 적절히 설정되어 있는가?
- [ ] Rate Limiting이 활성화되어 있는가?
- [ ] Helmet 보안 헤더가 설정되어 있는가?
- [ ] 모든 입력 검증이 제대로 작동하는가?
- [ ] SSL/TLS 인증서가 설치되어 있는가?
- [ ] 로그에 민감한 정보가 포함되지 않는가?
- [ ] 데이터베이스 백업이 설정되어 있는가?

### 정기 보안 점검

```bash
# 의존성 취약점 검사
pnpm audit

# 심각한 취약점만 표시
pnpm audit --audit-level=moderate

# 자동 수정
pnpm audit fix
```

## 롤백 전략

### Docker 이미지 롤백

```bash
# 이전 버전으로 롤백
docker-compose down
docker-compose up -d nestjs-app:1.0.0
```

### ECS 롤백

```bash
# 태스크 정의 이전 버전으로 업데이트
aws ecs update-service \
  --cluster production-cluster \
  --service nestjs-app \
  --task-definition nestjs-app:PREVIOUS_VERSION
```

## 성능 최적화

### 1. Connection Pool 설정

`database.config.ts`:
```typescript
extra: {
  connectionLimit: 10,
  queueLimit: 0,
},
```

### 2. 캐싱 전략

Redis 캐시 레이어 추가:
```bash
pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-store
```

### 3. 압축

Gzip 압축 활성화 (이미 `main.ts`에 설정됨):
```typescript
app.use(compression());
```

## 문제 해결

### 일반적인 배포 문제

**1. 메모리 부족**
```bash
# Node.js 메모리 제한 증가
NODE_OPTIONS="--max-old-space-size=2048" node dist/main.js
```

**2. 포트 충돌**
```bash
# 사용 중인 포트 확인
lsof -i :3000

# 프로세스 종료
kill -9 [PID]
```

**3. 데이터베이스 연결 실패**
- 방화벽 규칙 확인
- 보안 그룹 설정 확인
- 데이터베이스 호스트 및 포트 확인

## 참고 자료

- [NestJS 배포 가이드](https://docs.nestjs.com/deployment)
- [Docker 공식 문서](https://docs.docker.com/)
- [AWS ECS 문서](https://docs.aws.amazon.com/ecs/)
- [PM2 문서](https://pm2.keymetrics.io/docs/)
