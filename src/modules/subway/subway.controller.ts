import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { SubwayApiService } from './subway-api.service';
import { Public } from '../../common/decorators/public.decorator';
import {
  ApiSuccessResponse,
  ApiErrorResponse,
} from '../../common/decorators/api-response.decorator';

@ApiTags('지하철 API (Subway)')
@Controller('subway')
export class SubwayController {
  constructor(private readonly subwayApiService: SubwayApiService) {}

  @Get('line4')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '4호선 실시간 데이터 조회' })
  @ApiSuccessResponse(undefined, '4호선 실시간 데이터 조회 성공')
  @ApiErrorResponse(500, 'API 호출 실패')
  async getLine4Data() {
    const data = await this.subwayApiService.getLine4Data();
    return {
      success: true,
      message: '4호선 실시간 데이터를 조회했습니다.',
      data,
    };
  }
}
