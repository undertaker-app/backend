export interface SubwayRealtimeResponse {
  // 정상 응답 시
  errorMessage?: {
    status: number;
    code: string;
    message: string;
    link: string;
    developerMessage: string;
    total: number;
  };
  realtimePositionList?: Array<{
    beginRow: any;
    endRow: any;
    curPage: any;
    pageRow: any;
    totalCount: number;
    rowNum: number;
    selectedCount: number;
    subwayId: string;
    subwayNm: string;
    statnId: string;
    statnNm: string;
    trainNo: string;
    lastRecptnDt: string;
    recptnDt: string;
    updnLine: string;
    statnTid: string;
    statnTnm: string;
    trainSttus: string;
    directAt: string;
    lstcarAt: string;
  }>;

  // 에러 응답 시
  RESULT?: {
    CODE: string;
    MESSAGE: string;
  };
}
