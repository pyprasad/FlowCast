import { PrismaClient } from '@prisma/client';
import { createLogger } from '@creatorflow/logger';

const logger = createLogger({ name: 'prisma' });

export const prisma = new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'event' },
    { level: 'warn', emit: 'event' },
  ],
});

// Log queries in development
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug({ query: e.query, params: e.params, duration: e.duration }, 'Database query');
  });
}

prisma.$on('error', (e: any) => {
  logger.error({ error: e }, 'Database error');
});

prisma.$on('warn', (e: any) => {
  logger.warn({ warning: e }, 'Database warning');
});
