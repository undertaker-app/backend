import { Logger } from '@nestjs/common';
import { ICacheService } from '../interfaces/cache.interface';

export class InMemoryCacheStore implements ICacheService {
  private readonly logger = new Logger(InMemoryCacheStore.name);
  private store: Map<string, { value: string; expiry?: number }> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();

  async set(key: string, value: string, ttl?: number): Promise<void> {
    // Clear existing timer if any
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
      this.timers.delete(key);
    }

    const expiry = ttl ? Date.now() + ttl * 1000 : undefined;
    this.store.set(key, { value, expiry });

    if (ttl) {
      const timer = setTimeout(() => {
        this.store.delete(key);
        this.timers.delete(key);
        this.logger.debug(`Expired key: ${key}`);
      }, ttl * 1000);
      this.timers.set(key, timer);
    }

    this.logger.debug(`Set cache: ${key} (TTL: ${ttl || 'none'})`);
  }

  async get(key: string): Promise<string | null> {
    const item = this.store.get(key);
    if (!item) {
      return null;
    }

    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      const timer = this.timers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(key);
      }
      return null;
    }

    this.logger.debug(`Get cache: ${key} = ${item.value}`);
    return item.value;
  }

  async del(key: string): Promise<void> {
    this.store.delete(key);
    const timer = this.timers.get(key);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(key);
    }
    this.logger.debug(`Deleted cache: ${key}`);
  }

  async exists(key: string): Promise<boolean> {
    const item = this.store.get(key);
    if (!item) {
      return false;
    }

    if (item.expiry && Date.now() > item.expiry) {
      this.store.delete(key);
      const timer = this.timers.get(key);
      if (timer) {
        clearTimeout(timer);
        this.timers.delete(key);
      }
      return false;
    }

    return true;
  }

  async ttl(key: string): Promise<number> {
    const item = this.store.get(key);
    if (!item) {
      return -2; // Key doesn't exist
    }

    if (!item.expiry) {
      return -1; // No expiry set
    }

    const remaining = Math.ceil((item.expiry - Date.now()) / 1000);
    return remaining > 0 ? remaining : -2;
  }

  async expire(key: string, ttl: number): Promise<void> {
    const item = this.store.get(key);
    if (!item) {
      return;
    }

    // Clear existing timer
    const existingTimer = this.timers.get(key);
    if (existingTimer) {
      clearTimeout(existingTimer);
    }

    const expiry = Date.now() + ttl * 1000;
    this.store.set(key, { ...item, expiry });

    const timer = setTimeout(() => {
      this.store.delete(key);
      this.timers.delete(key);
      this.logger.debug(`Expired key: ${key}`);
    }, ttl * 1000);
    this.timers.set(key, timer);

    this.logger.debug(`Set expiry for ${key}: ${ttl}s`);
  }

  async keys(pattern: string): Promise<string[]> {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    const matchingKeys: string[] = [];

    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        // Check if key is still valid
        const valid = await this.exists(key);
        if (valid) {
          matchingKeys.push(key);
        }
      }
    }

    return matchingKeys;
  }

  async mget(...keys: string[]): Promise<(string | null)[]> {
    const results: (string | null)[] = [];
    for (const key of keys) {
      results.push(await this.get(key));
    }
    return results;
  }

  async mset(keyValues: Record<string, string>): Promise<void> {
    for (const [key, value] of Object.entries(keyValues)) {
      await this.set(key, value);
    }
    this.logger.debug(
      `Set multiple keys: ${Object.keys(keyValues).length} items`,
    );
  }

  async isConnected(): Promise<boolean> {
    return true; // In-memory store is always "connected"
  }

  async disconnect?(): Promise<void> {
    // Clear all timers
    for (const timer of this.timers.values()) {
      clearTimeout(timer);
    }
    this.timers.clear();
    this.store.clear();
    this.logger.log('In-memory cache cleared');
  }
}
