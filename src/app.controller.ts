import { Controller, Get, Inject } from '@nestjs/common';
import { AppService } from './app.service';
import { ICacheService } from './shared/cache';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    @Inject('CACHE_STORE') private readonly cacheService: ICacheService,
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
      cache: {
        connected: await this.cacheService.isConnected(),
      },
    };
  }

  @Get('cache/status')
  async getCacheStatus() {
    try {
      const isConnected = await this.cacheService.isConnected();

      // Cache에 간단한 테스트 수행
      if (isConnected) {
        const testKey = 'health_check';
        await this.cacheService.set(testKey, 'ok', 10);
        const result = await this.cacheService.get(testKey);
        await this.cacheService.del(testKey);

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

  // Advanced cache operations demo
  @Get('cache/demo')
  async getCacheDemo() {
    try {
      const demoData: any = {
        basic: {},
        advanced: {},
      };

      // Basic operations
      await this.cacheService.set('demo:string', 'Hello Cache!', 60);
      demoData.basic.string = await this.cacheService.get('demo:string');

      await this.cacheService.mset({
        'demo:key1': 'value1',
        'demo:key2': 'value2',
        'demo:key3': 'value3',
      });
      demoData.basic.multiGet = await this.cacheService.mget(
        'demo:key1',
        'demo:key2',
        'demo:key3',
      );

      // Advanced operations (if supported)
      if (this.cacheService.hset && this.cacheService.hget) {
        await this.cacheService.hset('demo:hash', 'name', 'John Doe');
        await this.cacheService.hset('demo:hash', 'age', '30');
        demoData.advanced.hash = await this.cacheService.hget(
          'demo:hash',
          'name',
        );
      }

      if (this.cacheService.lpush && this.cacheService.lrange) {
        await this.cacheService.lpush('demo:list', 'item1', 'item2', 'item3');
        demoData.advanced.list = await this.cacheService.lrange(
          'demo:list',
          0,
          -1,
        );
      }

      if (this.cacheService.sadd && this.cacheService.smembers) {
        await this.cacheService.sadd(
          'demo:set',
          'member1',
          'member2',
          'member3',
        );
        demoData.advanced.set = await this.cacheService.smembers('demo:set');
      }

      if (this.cacheService.zadd && this.cacheService.zrange) {
        await this.cacheService.zadd('demo:sortedset', 1, 'first');
        await this.cacheService.zadd('demo:sortedset', 2, 'second');
        await this.cacheService.zadd('demo:sortedset', 3, 'third');
        demoData.advanced.sortedSet = await this.cacheService.zrange(
          'demo:sortedset',
          0,
          -1,
        );
      }

      return {
        status: 'success',
        data: demoData,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
}
