import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ICacheService } from './shared/cache';

describe('AppController', () => {
  let appController: AppController;

  // Mock cache service
  const mockCacheService: Partial<ICacheService> = {
    isConnected: jest.fn().mockResolvedValue(true),
    set: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockResolvedValue('ok'),
    del: jest.fn().mockResolvedValue(undefined),
    mset: jest.fn().mockResolvedValue(undefined),
    mget: jest.fn().mockResolvedValue(['value1', 'value2', 'value3']),
    hset: jest.fn().mockResolvedValue(undefined),
    hget: jest.fn().mockResolvedValue('John Doe'),
    lpush: jest.fn().mockResolvedValue(3),
    lrange: jest.fn().mockResolvedValue(['item1', 'item2', 'item3']),
    sadd: jest.fn().mockResolvedValue(3),
    smembers: jest.fn().mockResolvedValue(['member1', 'member2', 'member3']),
    zadd: jest.fn().mockResolvedValue(3),
    zrange: jest.fn().mockResolvedValue(['first', 'second', 'third']),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        {
          provide: 'CACHE_STORE',
          useValue: mockCacheService,
        },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });

  describe('health', () => {
    it('should return health status with cache connection', async () => {
      const result = await appController.getHealth();

      expect(result).toEqual({
        status: 'ok',
        timestamp: expect.any(String),
        cache: {
          connected: true,
        },
      });
      expect(mockCacheService.isConnected).toHaveBeenCalled();
    });
  });

  describe('cache status', () => {
    it('should return cache status with test result', async () => {
      const result = await appController.getCacheStatus();

      expect(result).toEqual({
        status: 'connected',
        test: 'passed',
        timestamp: expect.any(String),
      });
      expect(mockCacheService.isConnected).toHaveBeenCalled();
      expect(mockCacheService.set).toHaveBeenCalledWith(
        'health_check',
        'ok',
        10,
      );
      expect(mockCacheService.get).toHaveBeenCalledWith('health_check');
      expect(mockCacheService.del).toHaveBeenCalledWith('health_check');
    });
  });
});
