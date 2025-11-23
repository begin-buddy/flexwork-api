# Deployment Guide

[English](./DEPLOYMENT.en.md) | [한국어](./DEPLOYMENT.md)

Deployment guide for the NestJS Template project.

## Table of Contents

- [Deployment Preparation](#deployment-preparation)
- [Environment Configuration](#environment-configuration)
- [Docker Deployment](#docker-deployment)
- [Cloud Deployment](#cloud-deployment)
- [CI/CD](#cicd)
- [Monitoring](#monitoring)
- [Security Checklist](#security-checklist)

## Deployment Preparation

### 1. Environment Variable Configuration

Prepare production environment variables:

```env
# .env.production
NODE_ENV=production
PORT=3000

# Database
DB_HOST=production-db-host
DB_PORT=3306
DB_USERNAME=prod_user
DB_PASSWORD=secure_password_here
DB_DATABASE=nestjs_prod

# JWT (use strong secret key)
JWT_SECRET=very-secure-random-secret-key-change-this
JWT_EXPIRES_IN=1d

# Logging
LOG_LEVEL=error

# CORS
CORS_ORIGIN=https://yourdomain.com
```

### 2. Build Testing

```bash
# Production build
pnpm run build

# Check build results
ls -la dist/

# Test in production mode locally
NODE_ENV=production node dist/main.js
```

### 3. Security Review

- [ ] Verify no sensitive information is hardcoded in environment variables
- [ ] Set strong JWT secret key
- [ ] Check database password strength
- [ ] Verify CORS configuration
- [ ] Check Rate Limiting configuration
- [ ] Verify Helmet security headers are enabled
- [ ] Ensure all input validation is working properly
- [ ] Verify SSL/TLS certificate is installed
- [ ] Check logs don't contain sensitive information
- [ ] Verify database backup is configured

## Environment Configuration

### Production Optimization

#### package.json Scripts

```json
{
  "scripts": {
    "start:prod": "node dist/main"
  }
}
```

#### Install Production Dependencies Only

```bash
pnpm install --prod --frozen-lockfile
```

### Node.js Process Management

#### Using PM2

```bash
# Install PM2
npm install -g pm2

# Start application
pm2 start dist/main.js --name nestjs-app

# Cluster mode (utilize multiple cores)
pm2 start dist/main.js -i max --name nestjs-app

# Check status
pm2 status

# View logs
pm2 logs nestjs-app

# Restart
pm2 restart nestjs-app

# Stop
pm2 stop nestjs-app
```

#### PM2 Ecosystem File

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

Run:
```bash
pm2 start ecosystem.config.js
```

## Docker Deployment

### 1. Build Docker Image

```bash
# Build production image
docker build -f docker/Dockerfile -t nestjs-app:latest .

# Check image
docker images | grep nestjs-app

# Check image size
docker image inspect nestjs-app:latest --format='{{.Size}}' | numfmt --to=iec
```

### 2. Deploy with Docker Compose

```bash
# Run production environment
docker-compose -f docker/docker-compose.yml up -d

# View logs
docker-compose -f docker/docker-compose.yml logs -f app

# Check status
docker-compose -f docker/docker-compose.yml ps

# Stop
docker-compose -f docker/docker-compose.yml down
```

### 3. Push to Docker Registry

#### Docker Hub

```bash
# Login
docker login

# Tag
docker tag nestjs-app:latest username/nestjs-app:latest
docker tag nestjs-app:latest username/nestjs-app:1.0.0

# Push
docker push username/nestjs-app:latest
docker push username/nestjs-app:1.0.0
```

#### GitHub Container Registry

```bash
# Login
echo $GITHUB_TOKEN | docker login ghcr.io -u USERNAME --password-stdin

# Tag
docker tag nestjs-app:latest ghcr.io/username/nestjs-app:latest

# Push
docker push ghcr.io/username/nestjs-app:latest
```

## Cloud Deployment

### AWS EC2

#### 1. EC2 Instance Setup

```bash
# SSH to EC2 instance
ssh -i key.pem ec2-user@ec2-xx-xx-xx-xx.compute.amazonaws.com

# Install Docker
sudo yum update -y
sudo yum install docker -y
sudo service docker start
sudo usermod -a -G docker ec2-user

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/your-org/template-typescript-nestjs.git
cd template-typescript-nestjs

# Configure environment variables
cp .env.example .env
vim .env  # Edit with production values

# Run with Docker Compose
docker-compose -f docker/docker-compose.yml up -d
```

#### 3. Nginx Reverse Proxy Setup

```bash
# Install Nginx
sudo yum install nginx -y

# Create configuration file
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
# Start Nginx
sudo service nginx start
sudo systemctl enable nginx
```

#### 4. SSL Certificate Setup (Let's Encrypt)

```bash
# Install Certbot
sudo yum install certbot python3-certbot-nginx -y

# Issue SSL certificate
sudo certbot --nginx -d yourdomain.com

# Set up automatic renewal
sudo certbot renew --dry-run
```

### AWS ECS (Fargate)

#### 1. Push Image to ECR

```bash
# ECR login
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com

# Tag image
docker tag nestjs-app:latest ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nestjs-app:latest

# Push
docker push ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/nestjs-app:latest
```

#### 2. ECS Task Definition

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
# Authenticate gcloud CLI
gcloud auth login

# Set project
gcloud config set project PROJECT_ID

# Build and push image
gcloud builds submit --tag gcr.io/PROJECT_ID/nestjs-app

# Deploy to Cloud Run
gcloud run deploy nestjs-app \
  --image gcr.io/PROJECT_ID/nestjs-app \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production
```

### Heroku

```bash
# Login to Heroku CLI
heroku login

# Create app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set DB_HOST=your-db-host
heroku config:set JWT_SECRET=your-secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

## CI/CD

### GitHub Actions

Use the already configured `.github/workflows/ci.yml` and `.github/workflows/docker.yml`.

#### Add Deployment Workflow

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

## Monitoring

### Health Checks

Use the already implemented health check endpoint in the application:

```bash
# Health check
curl http://your-domain.com/health

# Response
{
  "status": "ok",
  "info": {
    "database": {
      "status": "up"
    }
  }
}
```

### Logging

#### CloudWatch (AWS)

```bash
# Create CloudWatch log group
aws logs create-log-group --log-group-name /ecs/nestjs-app

# View logs
aws logs tail /ecs/nestjs-app --follow
```

#### Log Collection Tools

- **ELK Stack**: Elasticsearch, Logstash, Kibana
- **Grafana Loki**: Lightweight log collection
- **Datadog**: Integrated monitoring

### APM (Application Performance Monitoring)

#### New Relic

```bash
# Install New Relic agent
pnpm add newrelic

# Configure newrelic.js
cp node_modules/newrelic/newrelic.js .
```

`main.ts`:
```typescript
import 'newrelic';  // Add at the top
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

## Security Checklist

### Pre-Deployment Checklist

- [ ] Are all environment variables securely managed?
- [ ] Is the production database password strong?
- [ ] Is the JWT secret key sufficiently complex?
- [ ] Is CORS properly configured?
- [ ] Is Rate Limiting enabled?
- [ ] Are Helmet security headers configured?
- [ ] Is all input validation working properly?
- [ ] Is SSL/TLS certificate installed?
- [ ] Do logs not contain sensitive information?
- [ ] Is database backup configured?

### Regular Security Checks

```bash
# Check dependency vulnerabilities
pnpm audit

# Show only critical vulnerabilities
pnpm audit --audit-level=moderate

# Auto fix
pnpm audit fix
```

## Rollback Strategy

### Docker Image Rollback

```bash
# Rollback to previous version
docker-compose down
docker-compose up -d nestjs-app:1.0.0
```

### ECS Rollback

```bash
# Update to previous task definition version
aws ecs update-service \
  --cluster production-cluster \
  --service nestjs-app \
  --task-definition nestjs-app:PREVIOUS_VERSION
```

## Performance Optimization

### 1. Connection Pool Configuration

`database.config.ts`:
```typescript
extra: {
  connectionLimit: 10,
  queueLimit: 0,
},
```

### 2. Caching Strategy

Add Redis cache layer:
```bash
pnpm add @nestjs/cache-manager cache-manager cache-manager-redis-store
```

### 3. Compression

Enable Gzip compression (already configured in `main.ts`):
```typescript
app.use(compression());
```

## Troubleshooting

### Common Deployment Issues

**1. Out of memory**
```bash
# Increase Node.js memory limit
NODE_OPTIONS="--max-old-space-size=2048" node dist/main.js
```

**2. Port conflict**
```bash
# Check port usage
lsof -i :3000

# Kill process
kill -9 [PID]
```

**3. Database connection failure**
- Check firewall rules
- Verify security group settings
- Check database host and port

## References

- [NestJS Deployment Guide](https://docs.nestjs.com/deployment)
- [Docker Official Documentation](https://docs.docker.com/)
- [AWS ECS Documentation](https://docs.aws.amazon.com/ecs/)
- [PM2 Documentation](https://pm2.keymetrics.io/docs/)
