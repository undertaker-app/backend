import { Module } from '@nestjs/common';
import { SubwayController } from './subway.controller';
import { SubwayApiService } from './subway-api.service';

@Module({
  controllers: [SubwayController],
  providers: [SubwayApiService],
  exports: [SubwayApiService],
})
export class SubwayModule {}
