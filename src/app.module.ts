import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { CacheModule } from './shared/cache';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const provider = configService.get<string>('CACHE_PROVIDER') || 'redis';

        if (provider === 'upstash') {
          return {
            provider: 'upstash',
            upstash: {
              url: configService.get<string>('UPSTASH_REDIS_REST_URL')!,
              token: configService.get<string>('UPSTASH_REDIS_REST_TOKEN')!,
            },
          };
        } else if (provider === 'memory') {
          return {
            provider: 'memory',
          };
        } else {
          // Default to redis (ioredis)
          return {
            provider: 'redis',
            redis: {
              url: configService.get<string>('REDIS_URL'),
            },
          };
        }
      },
    }),
    UsersModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
