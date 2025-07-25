# Undertaker Backend

NestJS 기반의 백엔드 애플리케이션입니다. PostgreSQL과 Redis를 사용하며, Prisma ORM을 통해 데이터베이스를 관리합니다.

## 🚀 빠른 시작

### 1. 의존성 서비스 실행 (Docker)

로컬 개발을 위해 PostgreSQL과 Redis를 Docker Compose로 실행합니다:

```bash
# 모든 서비스 시작 (PostgreSQL, Redis, Redis Commander)
yarn docker:up

# 서비스 상태 확인
yarn docker:ps

# 서비스 중지
yarn docker:down
```

실행되는 서비스:

- **PostgreSQL**: `localhost:5487` (비표준 포트)
- **Redis**: `localhost:6380` (비표준 포트)
- **Redis Commander**: `localhost:8081` (Redis 관리 UI)

### 2. 환경변수 설정

`.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# 데이터베이스 (Docker Compose)
DATABASE_URL="postgresql://undertaker_user:undertaker_password@localhost:5487/undertaker_db?schema=public"

# 캐시 설정
CACHE_PROVIDER="redis"
REDIS_URL="redis://:undertaker_redis_password@localhost:6380"

# 애플리케이션
NODE_ENV="development"
PORT=3000
```

### 3. 애플리케이션 빌드 및 실행

```bash
# 패키지 설치
yarn install

# Prisma 클라이언트 생성
yarn prisma:generate

# 데이터베이스 마이그레이션
yarn prisma:push

# 개발 모드 실행
yarn start:dev

# 프로덕션 빌드
yarn build

# 프로덕션 모드 실행
yarn start:prod
```

## 📊 데이터베이스 관리 (Prisma)

### 기본 명령어

```bash
# Prisma 클라이언트 생성
yarn prisma:generate

# 스키마를 데이터베이스에 적용 (개발용)
yarn prisma:push

# 마이그레이션 생성 및 적용 (프로덕션용)
yarn prisma:migrate

# 데이터베이스 초기화
yarn prisma:reset

# 샘플 데이터 입력
yarn db:seed

# Prisma Studio 실행 (DB GUI)
yarn prisma:studio
```

### 스키마 변경 시 워크플로우

1. `prisma/schema.prisma` 파일 수정
2. `yarn prisma:push` (개발 환경)
3. `yarn prisma:generate` (클라이언트 재생성)

## 🗂️ 캐시 시스템 특이사항

본 프로젝트는 환경에 따라 다른 캐시 시스템을 사용합니다:

### 로컬 개발 환경

- **Redis (ioredis)**: Docker Compose로 로컬 Redis 인스턴스 실행
- 빠른 개발과 디버깅을 위해 로컬 환경 선택

### 클라우드/프로덕션 환경

- **Upstash Redis**: 서버리스 Redis 서비스 사용
- 인프라 관리 부담 없이 확장 가능한 캐시 제공

### 캐시 제공자 설정

환경변수 `CACHE_PROVIDER`로 제어:

```env
# 로컬 Redis (Docker)
CACHE_PROVIDER="redis"
REDIS_URL="redis://:password@localhost:6380"

# Upstash Redis (클라우드)
CACHE_PROVIDER="upstash"
UPSTASH_REDIS_REST_URL="https://your-endpoint.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"

# 인메모리 캐시 (테스트용)
CACHE_PROVIDER="memory"
```

## 📋 사용 가능한 스크립트

```bash
# 개발
yarn start:dev          # 개발 모드 (핫 리로드)
yarn start:debug        # 디버그 모드

# 빌드
yarn build              # 프로덕션 빌드
yarn start:prod         # 프로덕션 실행

# 테스트
yarn test               # 단위 테스트
yarn test:e2e          # E2E 테스트

# Docker
yarn docker:up         # 서비스 시작
yarn docker:down       # 서비스 중지
yarn docker:logs       # 로그 확인

# Prisma
yarn prisma:generate   # 클라이언트 생성
yarn prisma:push       # 스키마 적용
yarn prisma:studio     # DB GUI
```

## 🔍 API 엔드포인트

### 상태 확인

- `GET /health` - 전체 상태 체크
- `GET /cache/status` - 캐시 연결 테스트

### 사용자 API

- `GET /users` - 사용자 목록
- `POST /users` - 사용자 생성
- `GET /users/:id` - 사용자 조회
- `PATCH /users/:id` - 사용자 수정
- `DELETE /users/:id` - 사용자 삭제

## 🛠️ 기술 스택

- **Framework**: NestJS
- **Database**: PostgreSQL + Prisma ORM
- **Cache**: Redis (ioredis) / Upstash Redis
- **Container**: Docker & Docker Compose
- **Testing**: Jest
