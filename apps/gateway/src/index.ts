import Fastify from 'fastify';
import cors from '@fastify/cors';
import rateLimit from '@fastify/rate-limit';
import swagger from '@fastify/swagger';
import swaggerUi from '@fastify/swagger-ui';
import { loadGatewayConfig } from '@creatorflow/config';
import { createLogger } from '@creatorflow/logger';
import { authMiddleware } from './middleware/auth.middleware';
import authProxy from './routes/auth.proxy';
import billingProxy from './routes/billing.proxy';
import platformProxy from './routes/platform.proxy';
import videoProxy from './routes/video.proxy';
import schedulerProxy from './routes/scheduler.proxy';
import analyticsProxy from './routes/analytics.proxy';
import commentsProxy from './routes/comments.proxy';
import aiProxy from './routes/ai.proxy';
import healthRoutes from './routes/health.routes';

const config = loadGatewayConfig();
const logger = createLogger({ name: 'gateway', level: config.logLevel });

const server = Fastify({ logger });

async function start() {
  try {
    // Register CORS
    await server.register(cors, {
      origin: config.corsOrigins,
      credentials: true,
    });

    // Register rate limiting
    await server.register(rateLimit, {
      max: config.rateLimitMaxRequests,
      timeWindow: config.rateLimitWindowMs,
      redis: require('./lib/redis').redis,
    });

    // Register Swagger
    await server.register(swagger, {
      openapi: {
        info: {
          title: 'CreatorFlow API Gateway',
          description: 'Unified API for CreatorFlow platform',
          version: '1.0.0',
        },
        servers: [
          {
            url: `http://localhost:${config.port}`,
            description: 'Development server',
          },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: 'http',
              scheme: 'bearer',
              bearerFormat: 'JWT',
            },
          },
        },
      },
    });

    await server.register(swaggerUi, {
      routePrefix: '/docs',
    });

    // Register auth decorator
    server.decorate('authenticate', authMiddleware);

    // Register routes
    await server.register(healthRoutes, { prefix: '/health' });
    await server.register(authProxy, { prefix: '/auth' });
    await server.register(billingProxy, { prefix: '/billing' });
    await server.register(platformProxy, { prefix: '/platforms' });
    await server.register(videoProxy, { prefix: '/videos' });
    await server.register(schedulerProxy, { prefix: '/scheduler' });
    await server.register(analyticsProxy, { prefix: '/analytics' });
    await server.register(commentsProxy, { prefix: '/comments' });
    await server.register(aiProxy, { prefix: '/ai' });

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

    // Start server
    await server.listen({ port: config.port, host: '0.0.0.0' });
    logger.info(`API Gateway running on port ${config.port}`);
    logger.info(`Swagger docs available at http://localhost:${config.port}/docs`);
  } catch (err) {
    logger.error(err, 'Failed to start server');
    process.exit(1);
  }
}

start();

export { server };
