import { Logger } from '@nestjs/common';
import { Redis } from '@upstash/redis';
import { ICacheService } from '../interfaces/cache.interface';

export class UpstashCacheStore implements ICacheService {
  private readonly logger = new Logger(UpstashCacheStore.name);
  private client: Redis;

  constructor(options: { url: string; token: string }) {
    this.client = new Redis({
      url: options.url,
      token: options.token,
    });

    this.logger.log('Upstash Redis client initialized');
  }

  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.set(key, value, { ex: ttl });
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
      return value as string | null;
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
      const result = await this.client.ttl(key);
      return result as number;
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
      const result = await this.client.keys(pattern);
      return result as string[];
    } catch (error) {
      this.logger.error(`Failed to get keys with pattern ${pattern}:`, error);
      throw error;
    }
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    try {
      const result = await this.client.mget(...keys);
      return result as (string | null)[];
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
    try {
      // Test connection by pinging
      await this.client.ping();
      return true;
    } catch (error) {
      this.logger.error('Failed to ping Upstash Redis:', error);
      return false;
    }
  }

  // Hash operations
  async hset(key: string, field: string, value: string): Promise<void> {
    try {
      await this.client.hset(key, { [field]: value });
      this.logger.debug(`HSET: ${key}.${field} = ${value}`);
    } catch (error) {
      this.logger.error(`Failed to HSET ${key}.${field}:`, error);
      throw error;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      const result = await this.client.hget(key, field);
      return result as string | null;
    } catch (error) {
      this.logger.error(`Failed to HGET ${key}.${field}:`, error);
      throw error;
    }
  }

  async hgetall(key: string): Promise<Record<string, string>> {
    try {
      const result = await this.client.hgetall(key);
      return result as Record<string, string>;
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
      const result = await (this.client.lpush as any)(key, ...values);
      return result as number;
    } catch (error) {
      this.logger.error(`Failed to LPUSH ${key}:`, error);
      throw error;
    }
  }

  async rpush(key: string, ...values: string[]): Promise<number> {
    try {
      const result = await this.client.rpush(key, ...values);
      return result as number;
    } catch (error) {
      this.logger.error(`Failed to RPUSH ${key}:`, error);
      throw error;
    }
  }

  async lpop(key: string): Promise<string | null> {
    try {
      const result = await this.client.lpop(key);
      return result as string | null;
    } catch (error) {
      this.logger.error(`Failed to LPOP ${key}:`, error);
      throw error;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      const result = await this.client.rpop(key);
      return result as string | null;
    } catch (error) {
      this.logger.error(`Failed to RPOP ${key}:`, error);
      throw error;
    }
  }

  async lrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      const result = await this.client.lrange(key, start, stop);
      return result as string[];
    } catch (error) {
      this.logger.error(`Failed to LRANGE ${key}:`, error);
      throw error;
    }
  }

  // Set operations
  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      const result = await (this.client.sadd as any)(key, ...members);
      return result as number;
    } catch (error) {
      this.logger.error(`Failed to SADD ${key}:`, error);
      throw error;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      const result = await this.client.smembers(key);
      return result as string[];
    } catch (error) {
      this.logger.error(`Failed to SMEMBERS ${key}:`, error);
      throw error;
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      const result = await this.client.srem(key, ...members);
      return result as number;
    } catch (error) {
      this.logger.error(`Failed to SREM ${key}:`, error);
      throw error;
    }
  }

  async spop(key: string, count?: number): Promise<string | string[] | null> {
    try {
      const result = await this.client.spop(key, count);
      return result as string | string[] | null;
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
        const result = await this.client.zadd(key, {
          score: scoreOrItems,
          member,
        });
        return result as number;
      } else if (Array.isArray(scoreOrItems)) {
        const result = await (this.client.zadd as any)(key, ...scoreOrItems);
        return result as number;
      }
      throw new Error('Invalid zadd arguments');
    } catch (error) {
      this.logger.error(`Failed to ZADD ${key}:`, error);
      throw error;
    }
  }

  async zrange(key: string, start: number, stop: number): Promise<string[]> {
    try {
      const result = await this.client.zrange(key, start, stop);
      return result as string[];
    } catch (error) {
      this.logger.error(`Failed to ZRANGE ${key}:`, error);
      throw error;
    }
  }

  async zrem(key: string, ...members: string[]): Promise<number> {
    try {
      const result = await this.client.zrem(key, ...members);
      return result as number;
    } catch (error) {
      this.logger.error(`Failed to ZREM ${key}:`, error);
      throw error;
    }
  }
}
