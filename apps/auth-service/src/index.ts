import Fastify from 'fastify';
import cors from '@fastify/cors';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { loadAuthConfig } from '@creatorflow/config';
import { createLogger } from '@creatorflow/logger';
import { prisma } from './lib/prisma';
import { redis } from './lib/redis';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import healthRoutes from './routes/health.routes';

const config = loadAuthConfig();
const logger = createLogger({ name: 'auth-service', level: config.logLevel });

const server = Fastify({ logger });

async function start() {
  try {
    // Register CORS
    await server.register(cors, {
      origin: config.corsOrigins,
      credentials: true,
    });

    // Register Swagger
    await server.register(swagger, {
      openapi: {
        info: {
          title: 'CreatorFlow Auth Service',
          description: 'Authentication and user management service',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.port}`,
            description: 'Development server',
          },
        ],
      },
    });

    await server.register(swaggerUi, {
      routePrefix: '/docs',
    });

    // Register routes
    await server.register(healthRoutes, { prefix: '/health' });
    await server.register(authRoutes, { prefix: '/auth' });
    await server.register(userRoutes, { prefix: '/users' });

    // Error handler
    server.setErrorHandler((error, request, reply) => {
      logger.error({ err: error, req: request }, 'Request error');
      reply.status(error.statusCode || 500).send({
        success: false,
        error: {
          code: error.code || 'INTERNAL_ERROR',
          message: error.message || 'Internal server error',
        },
      });
    });

    // Graceful shutdown
    const signals = ['SIGINT', 'SIGTERM'];
    signals.forEach((signal) => {
      process.on(signal, async () => {
        logger.info(`Received ${signal}, shutting down gracefully`);
        await server.close();
        await prisma.$disconnect();
        await redis.quit();
        process.exit(0);
      });
    });

    // Start server
    await server.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`Auth service running on port ${config.port}`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

start();

export { server };
