export interface ICacheService {
  // Basic key-value operations
  set(key: string, value: string, ttl?: number): Promise<void>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
  ttl(key: string): Promise<number>;
  expire(key: string, ttl: number): Promise<void>;

  // Multi operations
  mget(...keys: string[]): Promise<(string | null)[]>;
  mset(keyValues: Record<string, string>): Promise<void>;

  // Pattern operations
  keys(pattern: string): Promise<string[]>;

  // Connection
  isConnected(): Promise<boolean>;
  disconnect?(): Promise<void>;

  // Advanced operations (optional for different implementations)

  // Hash operations
  hset?(key: string, field: string, value: string): Promise<void>;
  hget?(key: string, field: string): Promise<string | null>;
  hgetall?(key: string): Promise<Record<string, string>>;
  hdel?(key: string, field: string): Promise<void>;

  // List operations
  lpush?(key: string, ...values: string[]): Promise<number>;
  rpush?(key: string, ...values: string[]): Promise<number>;
  lpop?(key: string): Promise<string | null>;
  rpop?(key: string): Promise<string | null>;
  lrange?(key: string, start: number, stop: number): Promise<string[]>;

  // Set operations
  sadd?(key: string, ...members: string[]): Promise<number>;
  smembers?(key: string): Promise<string[]>;
  srem?(key: string, ...members: string[]): Promise<number>;
  spop?(key: string, count?: number): Promise<string | string[] | null>;

  // Sorted set operations
  zadd?(key: string, score: number, member: string): Promise<number>;
  zadd?(
    key: string,
    items: { score: number; member: string }[],
  ): Promise<number>;
  zrange?(key: string, start: number, stop: number): Promise<string[]>;
  zrem?(key: string, ...members: string[]): Promise<number>;
}
