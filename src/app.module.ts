import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { UsersModule } from './users/users.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [UsersModule, RedisModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
