export interface CacheModuleOptions {
  provider: 'memory' | 'redis' | 'upstash';
  redis?: {
    url?: string;
  };
  upstash?: {
    url: string;
    token: string;
  };
}
