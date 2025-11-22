import Redis from 'ioredis';
import { loadGatewayConfig } from '@creatorflow/config';
import { createLogger } from '@creatorflow/logger';

const config = loadGatewayConfig();
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
