import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { RedisService } from './redis/redis.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  async getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      redis: {
        connected: this.redisService.isConnected(),
      },
    };
  }

  @Get('redis/status')
  async getRedisStatus() {
    try {
      const isConnected = this.redisService.isConnected();

      // Redis에 간단한 테스트 수행
      if (isConnected) {
        const testKey = 'health_check';
        await this.redisService.set(testKey, 'ok', 10);
        const result = await this.redisService.get(testKey);
        await this.redisService.del(testKey);

        return {
          status: 'connected',
          test: result === 'ok' ? 'passed' : 'failed',
          timestamp: new Date().toISOString(),
        };
      } else {
        return {
          status: 'disconnected',
          test: 'skipped',
          timestamp: new Date().toISOString(),
        };
      }
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
