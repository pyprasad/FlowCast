import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { prisma } from '../lib/prisma';
import { redis } from '../lib/redis';

export default async function healthRoutes(server: FastifyInstance) {
  server.get(
    '/',
    {
      schema: {
        description: 'Health check',
        tags: ['health'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({
        success: true,
        data: {
          status: 'healthy',
          service: 'auth-service',
          timestamp: new Date().toISOString(),
        },
      });
    }
  );

  server.get(
    '/ready',
    {
      schema: {
        description: 'Readiness check',
        tags: ['health'],
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        // Check database connection
        await prisma.$queryRaw`SELECT 1`;

        // Check Redis connection
        await redis.ping();

        return reply.send({
          success: true,
          data: {
            status: 'ready',
            database: 'connected',
            redis: 'connected',
          },
        });
      } catch (error: any) {
        return reply.status(503).send({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: 'Service not ready',
            details: error.message,
          },
        });
      }
    }
  );
}
