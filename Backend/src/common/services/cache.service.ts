import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

/**
 * Cache service using Redis for improved performance
 * Provides in-memory caching for frequently accessed data
 */
@Injectable()
export class CacheService implements OnModuleDestroy {
  private readonly redis: Redis | null = null;
  private readonly isEnabled: boolean;
  private readonly logger = new Logger(CacheService.name);

  constructor(private readonly configService: ConfigService) {
    const redisUrl = this.configService.get<string>('REDIS_URL');

    if (redisUrl) {
      try {
        this.redis = new Redis(redisUrl);
        this.isEnabled = true;
        this.logger.log('Redis cache enabled');
      } catch (error) {
        this.logger.warn(`Failed to connect to Redis, caching disabled: ${error}`);
        this.isEnabled = false;
      }
    } else {
      this.isEnabled = false;
      this.logger.debug('REDIS_URL not configured, caching disabled');
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
    }
  }

  /**
   * Get value from cache
   */
  async get<T>(key: string): Promise<T | null> {
    if (!this.isEnabled || !this.redis) {
      return null;
    }

    try {
      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }

      try {
        return JSON.parse(value) as T;
      } catch {
        // JSON parse failed - data corruption, not a cache miss
        this.logger.error(`Cache data corruption for key "${key}": invalid JSON`);
        return null;
      }
    } catch (error) {
      this.logger.warn(`Cache get failed for key "${key}": ${error}`);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
    } catch (error) {
      this.logger.warn(`Cache set failed for key "${key}": ${error}`);
    }
  }

  /**
   * Delete value from cache
   */
  async delete(key: string): Promise<void> {
    if (!this.isEnabled || !this.redis) {
      return;
    }

    try {
      await this.redis.del(key);
    } catch (error) {
      this.logger.warn(`Cache delete failed for key "${key}": ${error}`);
    }
  }

  /**
   * Check if cache is enabled
   */
  isCacheEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * Get or set cache pattern
   * If value exists in cache, return it
   * Otherwise, execute the factory function and cache the result
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    ttlSeconds: number = 300,
  ): Promise<T> {
    const cached = await this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const value = await factory();
    await this.set(key, value, ttlSeconds);
    return value;
  }
}
