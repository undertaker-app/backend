import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: Redis;

  constructor() {
    this.client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });

    this.client.on('error', (error) => {
      this.logger.error('Redis connection error:', error);
    });

    this.client.on('ready', () => {
      this.logger.log('Redis client is ready');
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
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

  /**
   * Set a key-value pair with TTL
   * @param key - Cache key
   * @param value - Cache value
   * @param ttl - Time to live in seconds
   */
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

  /**
   * Get value by key
   * @param key - Cache key
   * @returns Cache value or null if not found
   */
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

  /**
   * Delete a key
   * @param key - Cache key
   */
  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
      this.logger.debug(`Deleted cache: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to delete cache for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Check if key exists
   * @param key - Cache key
   * @returns True if key exists
   */
  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check existence for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get TTL for a key
   * @param key - Cache key
   * @returns TTL in seconds, -1 if no expiry, -2 if key doesn't exist
   */
  async ttl(key: string): Promise<number> {
    try {
      return await this.client.ttl(key);
    } catch (error) {
      this.logger.error(`Failed to get TTL for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Set expiry for a key
   * @param key - Cache key
   * @param ttl - Time to live in seconds
   */
  async expire(key: string, ttl: number): Promise<void> {
    try {
      await this.client.expire(key, ttl);
      this.logger.debug(`Set expiry for ${key}: ${ttl}s`);
    } catch (error) {
      this.logger.error(`Failed to set expiry for key ${key}:`, error);
      throw error;
    }
  }

  /**
   * Get keys by pattern
   * @param pattern - Search pattern
   * @returns Array of matching keys
   */
  async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      this.logger.error(`Failed to get keys with pattern ${pattern}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple values
   * @param keys - Array of cache keys
   * @returns Array of values
   */
  async mget(...keys: string[]): Promise<(string | null)[]> {
    try {
      return await this.client.mget(...keys);
    } catch (error) {
      this.logger.error('Failed to get multiple keys:', error);
      throw error;
    }
  }

  /**
   * Set multiple key-value pairs
   * @param keyValues - Object with key-value pairs
   */
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

  /**
   * Get raw Redis client for advanced operations
   * @returns Redis client instance
   */
  getClient(): Redis {
    return this.client;
  }

  /**
   * Check if Redis is connected
   * @returns Connection status
   */
  isConnected(): boolean {
    return this.client.status === 'ready';
  }
}
