import { DynamicModule, Module } from '@nestjs/common';
import { CacheModuleOptions } from './interfaces/cache-options.interface';
import { InMemoryCacheStore } from './providers/in-memory.provider';
import { RedisCacheStore } from './providers/redis.provider';
import { UpstashCacheStore } from './providers/upstash.provider';

@Module({})
export class CacheModule {
  static registerAsync(options: {
    imports?: any[];
    useFactory: (
      ...args: any[]
    ) => Promise<CacheModuleOptions> | CacheModuleOptions;
    inject?: any[];
  }): DynamicModule {
    const cacheProvider = {
      provide: 'CACHE_STORE',
      useFactory: async (...args: any[]) => {
        const config = await options.useFactory(...args);

        switch (config.provider) {
          case 'redis':
            return new RedisCacheStore(config.redis);
          case 'upstash':
            if (!config.upstash?.url || !config.upstash?.token) {
              throw new Error(
                'Upstash URL and token are required for upstash provider',
              );
            }
            return new UpstashCacheStore(config.upstash);
          case 'memory':
          default:
            return new InMemoryCacheStore();
        }
      },
      inject: options.inject || [],
    };

    return {
      module: CacheModule,
      imports: options.imports || [],
      providers: [cacheProvider],
      exports: ['CACHE_STORE'],
      global: true,
    };
  }
}
