# NestJS Template - Enterprise Grade

English | [한국어](./README.ko.md)

A production-ready NestJS project template with security, internationalization, testing, and CI/CD all configured.

[![CI](https://github.com/your-org/template-typescript-nestjs/workflows/CI/badge.svg)](https://github.com/your-org/template-typescript-nestjs/actions)
[![codecov](https://codecov.io/gh/your-org/template-typescript-nestjs/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/template-typescript-nestjs)
[![Docker](https://github.com/your-org/template-typescript-nestjs/workflows/Docker%20Build%20%26%20Push/badge.svg)](https://github.com/your-org/template-typescript-nestjs/actions)

## ✨ Key Features

### 🏗️ Architecture
- **Layered Architecture** - Separation of Controller, Service, and Repository layers
- **Domain-Driven Design** - Domain-centric design
- **Dependency Injection** - Utilizing NestJS DI container
- **Modular Structure** - Feature-based module separation

### 🔒 Security
- **Helmet** - Enhanced HTTP header security
- **Rate Limiting** - Request rate limiting (Throttler)
- **CORS** - Cross-Origin Resource Sharing configuration
- **Input Validation** - Input validation via class-validator
- **Environment Variable Management** - .env files and ConfigModule

### 🌍 Internationalization (i18n)
- **Multi-language Support** - nestjs-i18n library
- **Language-specific Messages** - Support for Korean, English, etc.
- **Validation Messages** - Multi-language error messages
- **Accept-Language Header** - Automatic language detection

### 📊 Database
- **TypeORM** - Powerful ORM support
- **MySQL** - Production-level RDBMS
- **Migration** - Database schema version management
- **Repository Pattern** - Data access layer abstraction

### 📝 Logging
- **Winston** - Structured log management
- **Log Levels** - error, warn, info, debug
- **File Logging** - Automatic log file rotation
- **Context Logging** - Request-level traceability

### 🧪 Testing
- **Jest** - Unit and integration testing
- **E2E Testing** - End-to-end testing
- **Faker & Fishery** - Test data generation
- **Code Coverage** - Test coverage measurement

### 📚 API Documentation
- **Swagger/OpenAPI** - Automatic API documentation
- **DTO Schema** - Automatic schema generation
- **API Testing** - Direct testing in Swagger UI

### 🚀 DevOps
- **Docker** - Multi-stage builds
- **Docker Compose** - Development and production environments
- **GitHub Actions** - CI/CD pipeline
- **Health Checks** - Application status monitoring

### 📋 Code Quality
- **ESLint** - TypeScript linting
- **Prettier** - Code formatting
- **Husky** - Git hooks
- **Lint-staged** - Automatic pre-commit checks
- **Commitlint** - Commit message rules

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x
- pnpm 8.x
- Docker & Docker Compose (optional)

### Installation

```bash
# Clone repository
git clone https://github.com/your-org/template-typescript-nestjs.git
cd template-typescript-nestjs

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env file to configure environment variables
```

### Running Development Server

```bash
# Development mode
pnpm run start:dev

# Debug mode
pnpm run start:debug
```

The application will run at http://localhost:3000

- **API Documentation**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health

### Running with Docker

```bash
# Development environment
pnpm run docker:dev

# Production environment
pnpm run docker:up
```

## 📖 Documentation

For detailed documentation, see the [docs](./docs) directory:

- [Architecture](./docs/ARCHITECTURE.md)
- [API Documentation](./docs/API.md)
- [Development Guide](./docs/DEVELOPMENT.md)
- [Deployment Guide](./docs/DEPLOYMENT.md)

## 🧪 Testing

```bash
# Unit tests
pnpm run test

# E2E tests
pnpm run test:e2e

# Test coverage
pnpm run test:cov

# Test watch mode
pnpm run test:watch
```

## 🏗️ Build

```bash
# Production build
pnpm run build

# Run production
pnpm run start:prod
```

## 📁 Project Structure

```
template-typescript-nestjs/
├── src/
│   ├── common/           # Common modules
│   │   ├── config/       # Configuration (database, app)
│   │   ├── decorators/   # Custom decorators
│   │   ├── filters/      # Exception filters
│   │   ├── guards/       # Guards
│   │   ├── interceptors/ # Interceptors
│   │   └── pipes/        # Pipes
│   ├── modules/          # Feature modules
│   │   ├── auth/         # Authentication module
│   │   └── users/        # User module
│   ├── app.module.ts     # Root module
│   └── main.ts           # Entry point
├── test/                 # E2E tests
├── docker/               # Docker configuration
├── i18n/                 # Internationalization files
├── docs/                 # Documentation
└── .github/              # GitHub Actions
```

## 🤝 Contributing

Contributions are always welcome! Please refer to [CONTRIBUTING.md](./CONTRIBUTING.md).

### Development Workflow

1. Check or create an issue
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'feat: add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Create a Pull Request

## 📝 License

This project is UNLICENSED.

## 📧 Contact

For project inquiries, please create an issue.

---

Made with ❤️ using NestJS
