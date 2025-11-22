import Redis from 'ioredis';
import { loadAuthConfig } from '@creatorflow/config';
import { createLogger } from '@creatorflow/logger';

const config = loadAuthConfig();
const logger = createLogger({ name: 'redis' });

export const redis = new Redis(config.redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

redis.on('connect', () => {
  logger.info('Redis connected');
});

redis.on('error', (err) => {
  logger.error({ err }, 'Redis error');
});

redis.on('close', () => {
  logger.info('Redis connection closed');
});
