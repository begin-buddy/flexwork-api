# ===================================
# Multi-stage Dockerfile for NestJS
# ===================================

# ----- Base Stage -----
FROM node:20-alpine AS base

# pnpm 설치
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# 의존성 파일 복사
COPY package.json pnpm-lock.yaml ./

# ----- Dependencies Stage -----
FROM base AS dependencies

# 모든 의존성 설치 (개발 의존성 포함)
RUN pnpm install --frozen-lockfile

# ----- Build Stage -----
FROM base AS build

# 의존성 복사
COPY --from=dependencies /app/node_modules ./node_modules

# 소스 코드 복사
COPY . .

# 빌드 수행
RUN pnpm run build

# 프로덕션 의존성만 설치
RUN pnpm install --prod --frozen-lockfile

# ----- Production Stage -----
FROM node:20-alpine AS production

# 보안을 위한 non-root 유저 생성
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# 필요한 파일만 복사
COPY --from=build --chown=nestjs:nodejs /app/dist ./dist
COPY --from=build --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=build --chown=nestjs:nodejs /app/package.json ./
COPY --from=build --chown=nestjs:nodejs /app/i18n ./i18n

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# 포트 노출
EXPOSE 3000

# 유저 전환
USER nestjs

# 헬스체크 설정
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# 애플리케이션 실행
CMD ["node", "dist/main.js"]
