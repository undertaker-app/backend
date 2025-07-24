import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import { ICacheService } from '../interfaces/cache.interface';

@Injectable()
export class IoRedisCacheService implements ICacheService, OnModuleDestroy {
  private readonly logger = new Logger(IoRedisCacheService.name);
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis (ioredis)');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client is ready (ioredis)');
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed (ioredis)');
    });

    // Connect to Redis
    this.client.connect().catch((error) => {
      this.logger.error('Failed to connect to Redis:', error);
    });
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.disconnect();
      this.logger.log('Redis connection closed');
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setex(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
      this.logger.debug(`Set cache: ${key} (TTL: ${ttl || 'none'})`);
    } catch (error) {
      this.logger.error(`Failed to set cache for key ${key}:`, error);
      throw error;
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      const value = await this.client.get(key);
      this.logger.debug(`Get cache: ${key} = ${value}`);
      return value;
    } catch (error) {
      this.logger.error(`Failed to get cache for key ${key}:`, error);
      throw error;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug(`Deleted cache: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key ${key}:`, error);
      throw error;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence for key ${key}:`, error);
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key ${key}:`, error);
      throw error;
    }
  }

  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
      this.logger.debug(`Set expiry for ${key}: ${ttl}s`);
    } catch (error) {
      this.logger.error(`Failed to set expiry for key ${key}:`, error);
      throw error;
    }
  }

  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get keys with pattern ${pattern}:`, error);
      throw error;
    }
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(...keys);
    } catch (error) {
      this.logger.error('Failed to get multiple keys:', error);
      throw error;
    }
  }

  async mset(keyValues: Record<string, string>): Promise<void> {
    try {
      await this.client.mset(keyValues);
      this.logger.debug(
        `Set multiple keys: ${Object.keys(keyValues).length} items`,
      );
    } catch (error) {
      this.logger.error('Failed to set multiple keys:', error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    return this.client.status === 'ready';
  }

  async disconnect(): Promise<void> {
    await this.client.disconnect();
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hset(key, field, value);
      this.logger.debug(`HSET: ${key}.${field} = ${value}`);
    } catch (error) {
      this.logger.error(`Failed to HSET ${key}.${field}:`, error);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.client.hget(key, field);
    } catch (error) {
      this.logger.error(`Failed to HGET ${key}.${field}:`, error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      return await this.client.hgetall(key);
    } catch (error) {
      this.logger.error(`Failed to HGETALL ${key}:`, error);
      throw error;
    }
  }

  async hdel(key: string, field: string): Promise<void> {
    try {
      await this.client.hdel(key, field);
      this.logger.debug(`HDEL: ${key}.${field}`);
    } catch (error) {
      this.logger.error(`Failed to HDEL ${key}.${field}:`, error);
      throw error;
    }
  }

  // List operations
  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.lpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to LPUSH ${key}:`, error);
      throw error;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.client.rpush(key, ...values);
    } catch (error) {
      this.logger.error(`Failed to RPUSH ${key}:`, error);
      throw error;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      return await this.client.lpop(key);
    } catch (error) {
      this.logger.error(`Failed to LPOP ${key}:`, error);
      throw error;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.client.rpop(key);
    } catch (error) {
      this.logger.error(`Failed to RPOP ${key}:`, error);
      throw error;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.lrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to LRANGE ${key}:`, error);
      throw error;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to SADD ${key}:`, error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.client.smembers(key);
    } catch (error) {
      this.logger.error(`Failed to SMEMBERS ${key}:`, error);
      throw error;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.srem(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to SREM ${key}:`, error);
      throw error;
    }
  }

  async spop(key: string, count?: number): Promise<string | string[] | null> {
    try {
      return await this.client.spop(key, count);
    } catch (error) {
      this.logger.error(`Failed to SPOP ${key}:`, error);
      throw error;
    }
  }

  // Sorted set operations
  async zadd(
    key: string,
    scoreOrItems: number | { score: number; member: string }[],
    member?: string,
  ): Promise<number> {
    try {
      if (typeof scoreOrItems === 'number' && member !== undefined) {
        return await this.client.zadd(key, scoreOrItems, member);
      } else if (Array.isArray(scoreOrItems)) {
        const args: (string | number)[] = [key];
        scoreOrItems.forEach((item) => {
          args.push(item.score, item.member);
        });
        return await (this.client.zadd as any)(...args);
      }
      throw new Error('Invalid zadd arguments');
    } catch (error) {
      this.logger.error(`Failed to ZADD ${key}:`, error);
      throw error;
    }
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      return await this.client.zrange(key, start, stop);
    } catch (error) {
      this.logger.error(`Failed to ZRANGE ${key}:`, error);
      throw error;
    }
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.client.zrem(key, ...members);
    } catch (error) {
      this.logger.error(`Failed to ZREM ${key}:`, error);
      throw error;
    }
  }

  // Get raw client for advanced operations
  getClient(): Redis {
    return this.client;
  }
}
