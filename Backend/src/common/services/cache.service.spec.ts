import type { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

import { CacheService } from './cache.service';

jest.mock('ioredis', () => ({
  __esModule: true,
  default: jest.fn(),
}));

describe('CacheService', () => {
  const RedisMock = Redis as unknown as jest.Mock;

  const createConfigService = (redisUrl?: string) =>
    ({
      get: jest.fn().mockImplementation((key: string) =>
        key === 'REDIS_URL' ? redisUrl : undefined,
      ),
    }) as unknown as ConfigService;

  const createRedisClient = () => ({
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
    quit: jest.fn(),
  });

  beforeEach(() => {
    RedisMock.mockReset();
    jest.restoreAllMocks();
  });

  it('stays disabled when REDIS_URL is not configured', async () => {
    const service = new CacheService(createConfigService());

    expect(service.isCacheEnabled()).toBe(false);
    await expect(service.get('key')).resolves.toBeNull();
  });

  it('reads and writes cached values when redis is enabled', async () => {
    const client = createRedisClient();
    client.get.mockResolvedValue(JSON.stringify({ ok: true }));
    RedisMock.mockImplementation(() => client);

    const service = new CacheService(createConfigService('redis://localhost'));

    await expect(service.get('session')).resolves.toEqual({ ok: true });

    await service.set('session', { ok: true }, 120);
    await service.delete('session');
    await service.onModuleDestroy();

    expect(service.isCacheEnabled()).toBe(true);
    expect(client.set).toHaveBeenCalledWith(
      'session',
      JSON.stringify({ ok: true }),
      'EX',
      120,
    );
    expect(client.del).toHaveBeenCalledWith('session');
    expect(client.quit).toHaveBeenCalled();
  });

  it('returns null when cached data is corrupted', async () => {
    const client = createRedisClient();
    client.get.mockResolvedValue('not-json');
    RedisMock.mockImplementation(() => client);

    const service = new CacheService(createConfigService('redis://localhost'));

    await expect(service.get('broken')).resolves.toBeNull();
  });

  it('returns null when redis operations fail', async () => {
    const client = createRedisClient();
    client.get.mockRejectedValue(new Error('boom'));
    client.set.mockRejectedValue(new Error('boom'));
    client.del.mockRejectedValue(new Error('boom'));
    RedisMock.mockImplementation(() => client);

    const service = new CacheService(createConfigService('redis://localhost'));

    await expect(service.get('x')).resolves.toBeNull();
    await expect(service.set('x', { a: 1 })).resolves.toBeUndefined();
    await expect(service.delete('x')).resolves.toBeUndefined();
  });

  it('uses the factory only on cache miss in getOrSet', async () => {
    const client = createRedisClient();
    client.get
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(JSON.stringify({ answer: 42 }));
    RedisMock.mockImplementation(() => client);

    const service = new CacheService(createConfigService('redis://localhost'));
    const factory = jest.fn().mockResolvedValue({ answer: 42 });

    await expect(service.getOrSet('computed', factory, 30)).resolves.toEqual({
      answer: 42,
    });
    await expect(service.getOrSet('computed', factory, 30)).resolves.toEqual({
      answer: 42,
    });

    expect(factory).toHaveBeenCalledTimes(1);
  });
});
