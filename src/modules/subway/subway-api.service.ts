import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '../../shared/http';
import { SubwayRealtimeResponse } from './dto/subway-response.dto';

@Injectable()
export class SubwayApiService {
  private readonly logger = new Logger(SubwayApiService.name);
  private readonly API_KEY = '42656c5372736f6f39357451716148';
  private readonly BASE_URL = 'http://openapi.seoul.go.kr:8088';

  constructor(private readonly httpService: HttpService) {}

  async getLine4Data(): Promise<SubwayRealtimeResponse> {
    const url = `${this.BASE_URL}/${this.API_KEY}/json/realtimePosition/1/100/4호선`;

    try {
      this.logger.log('🚇 4호선 실시간 데이터 요청 중...');

      const response = await this.httpService.get<SubwayRealtimeResponse>(url);

      this.logger.log('===== 4호선 실시간 데이터 =====');
      console.log(JSON.stringify(response.data, null, 2));

      return response.data;
    } catch (error) {
      this.logger.error('❌ 4호선 API 호출 실패:', error.message);
      throw error;
    }
  }
}
