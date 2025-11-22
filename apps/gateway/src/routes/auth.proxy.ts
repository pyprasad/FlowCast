import { FastifyInstance } from 'fastify';
import { loadGatewayConfig } from '@creatorflow/config';
import { createHttpClient, proxyRequest } from '../lib/http-client';

const config = loadGatewayConfig();
const authClient = createHttpClient(config.authServiceUrl);

export default async function authProxy(server: FastifyInstance) {
  // Public routes - no authentication required
  server.post('/register', async (request, reply) => {
    const data = await proxyRequest(authClient, {
      method: 'POST',
      url: '/auth/register',
      data: request.body,
    });
    return reply.send(data);
  });

  server.post('/login', async (request, reply) => {
    const data = await proxyRequest(authClient, {
      method: 'POST',
      url: '/auth/login',
      data: request.body,
    });
    return reply.send(data);
  });

  server.post('/refresh', async (request, reply) => {
    const data = await proxyRequest(authClient, {
      method: 'POST',
      url: '/auth/refresh',
      data: request.body,
    });
    return reply.send(data);
  });

  server.post('/logout', async (request, reply) => {
    const data = await proxyRequest(authClient, {
      method: 'POST',
      url: '/auth/logout',
      data: request.body,
    });
    return reply.send(data);
  });

  server.get('/verify-email', async (request, reply) => {
    const data = await proxyRequest(authClient, {
      method: 'GET',
      url: '/auth/verify-email',
      params: request.query,
    });
    return reply.send(data);
  });

  server.post('/request-password-reset', async (request, reply) => {
    const data = await proxyRequest(authClient, {
      method: 'POST',
      url: '/auth/request-password-reset',
      data: request.body,
    });
    return reply.send(data);
  });

  server.post('/reset-password', async (request, reply) => {
    const data = await proxyRequest(authClient, {
      method: 'POST',
      url: '/auth/reset-password',
      data: request.body,
    });
    return reply.send(data);
  });
}
