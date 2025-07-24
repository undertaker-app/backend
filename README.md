<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->

## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository with Prisma ORM integration.

## Database Setup with Prisma

This project uses [Prisma](https://www.prisma.io/) as the ORM for database operations.

### Prerequisites

Make sure you have PostgreSQL and Redis running. You have two options:

#### Option 1: Using Docker Compose (Recommended)

Start both PostgreSQL and Redis with non-standard ports:

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:

- PostgreSQL on port `5487` (instead of standard 5432)
- Redis on port `6380` (instead of standard 6379)
- Redis Commander UI on port `8081` for Redis management

#### Option 2: Manual Setup

PostgreSQL:

```bash
docker run --name postgres-db -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres
```

Redis:

```bash
docker run --name redis-cache -p 6379:6379 -d redis
```

### Environment Setup

1. Create your `.env` file:

```bash
touch .env
```

2. Add the appropriate environment variables based on your setup:

#### For Docker Compose Setup:

```env
# Database (Docker Compose - non-standard port)
DATABASE_URL="postgresql://undertaker_user:undertaker_password@localhost:5487/undertaker_db?schema=public"

# Redis (Docker Compose - non-standard port with password)
REDIS_URL="redis://:undertaker_redis_password@localhost:6380"

# Application
NODE_ENV="development"
PORT=3000
```

#### For Manual Setup:

```env
# Database (Manual setup - standard port)
DATABASE_URL="postgresql://username:password@localhost:5432/undertaker_db?schema=public"

# Redis (Manual setup - standard port, no password)
REDIS_URL="redis://localhost:6379"

# Application
NODE_ENV="development"
PORT=3000
```

#### For Production with Upstash Redis:

```env
# Database (Production)
DATABASE_URL="postgresql://username:password@your-host:5432/undertaker_db?schema=public"

# Redis (Upstash)
REDIS_URL="rediss://username:password@your-upstash-url:port"

# Application
NODE_ENV="production"
PORT=3000
JWT_SECRET="your-secure-jwt-secret"
```

### Database Migration and Setup

```bash
# Generate Prisma client
$ yarn prisma:generate

# Run database migrations
$ yarn prisma:migrate

# Seed the database with sample data
$ yarn db:seed

# Open Prisma Studio (database GUI)
$ yarn prisma:studio
```

### Available Prisma Scripts

```bash
# Generate Prisma client
$ yarn prisma:generate

# Create and apply migrations
$ yarn prisma:migrate

# Push schema changes without migrations
$ yarn prisma:push

# Open Prisma Studio
$ yarn prisma:studio

# Reset database
$ yarn prisma:reset

# Seed database
$ yarn db:seed
```

## Redis Setup

This project uses Redis for caching. You can use either a local Redis instance or Upstash Redis.

### Local Redis Setup

Install and run Redis locally:

```bash
# Using Docker
docker run --name redis-cache -p 6379:6379 -d redis

# Or using Homebrew (macOS)
brew install redis
brew services start redis
```

### Upstash Redis Setup

1. Sign up for [Upstash](https://upstash.com/)
2. Create a new Redis database
3. Copy the Redis URL from your dashboard
4. Update the `REDIS_URL` in your `.env` file:

```env
REDIS_URL="rediss://your-username:your-password@your-upstash-endpoint:port"
```

### Available Redis Methods

The `RedisService` provides the following methods:

- `set(key, value, ttl?)` - Set a key-value pair with optional TTL
- `get(key)` - Get value by key
- `del(key)` - Delete a key
- `exists(key)` - Check if key exists
- `ttl(key)` - Get TTL for a key
- `expire(key, ttl)` - Set expiry for a key
- `keys(pattern)` - Get keys by pattern
- `mget(...keys)` - Get multiple values
- `mset(keyValues)` - Set multiple key-value pairs

## Project setup

```bash
$ yarn install
```

## Compile and run the project

```bash
# development
$ yarn run start

# watch mode
$ yarn run start:dev

# production mode
$ yarn run start:prod
```

## Run tests

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

## Docker Scripts

Convenient scripts for Docker Compose management:

```bash
# Start all services (PostgreSQL, Redis, Redis Commander)
$ yarn docker:up

# Stop all services
$ yarn docker:down

# View service logs
$ yarn docker:logs

# Check service status
$ yarn docker:ps

# Restart services
$ yarn docker:restart
```

## API Endpoints

### Health Check

- `GET /health` - General health check with Redis connection status
- `GET /redis/status` - Detailed Redis connection test

Example responses:

```bash
# Health check
curl http://localhost:3000/health

# Redis status check
curl http://localhost:3000/redis/status
```

### Users API

- `GET /users` - Get all users
- `GET /users/:id` - Get user by ID
- `POST /users` - Create new user
- `PATCH /users/:id` - Update user
- `DELETE /users/:id` - Delete user

Example usage:

```bash
# Create a user
curl -X POST http://localhost:3000/users \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "name": "Test User"}'

# Get all users
curl http://localhost:3000/users
```

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
