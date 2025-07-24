import { DynamicModule, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CacheModuleOptions } from './interfaces/cache-options.interface';
import { InMemoryCacheStore } from './providers/in-memory.provider';
import { RedisCacheStore } from './providers/redis.provider';
import { UpstashCacheStore } from './providers/upstash.provider';

@Module({})
export class CacheModule {
  static registerAsync(options?: {
    imports?: any[];
    inject?: any[];
    useFactory?: (
      ...args: any[]
    ) => Promise<CacheModuleOptions> | CacheModuleOptions;
  }): DynamicModule {
    const cacheProvider = {
      provide: 'CACHE_STORE',
      useFactory: async (...args: any[]) => {
        let config: CacheModuleOptions;

        if (options?.useFactory) {
          // Custom factory provided
          config = await options.useFactory(...args);
        } else {
          // Default behavior: use ConfigService to read environment variables
          const configService = args[0] as ConfigService;
          const provider =
            configService.get<string>('CACHE_PROVIDER') || 'redis';

          if (provider === 'upstash') {
            const url = configService.get<string>('UPSTASH_REDIS_REST_URL');
            const token = configService.get<string>('UPSTASH_REDIS_REST_TOKEN');

            if (!url || !token) {
              throw new Error(
                'UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are required for upstash provider',
              );
            }

            config = {
              provider: 'upstash',
              upstash: { url, token },
            };
          } else if (provider === 'memory') {
            config = {
              provider: 'memory',
            };
          } else {
            // Default to redis (ioredis)
            config = {
              provider: 'redis',
              redis: {
                url: configService.get<string>('REDIS_URL'),
              },
            };
          }
        }

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
      inject: options?.inject || [ConfigService],
    };

    return {
      module: CacheModule,
      imports: options?.imports || [],
      providers: [cacheProvider],
      exports: ['CACHE_STORE'],
      global: true,
    };
  }
}
