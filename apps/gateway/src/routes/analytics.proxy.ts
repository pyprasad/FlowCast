import { FastifyInstance } from 'fastify';
import { loadGatewayConfig } from '@creatorflow/config';
import { createHttpClient, proxyRequest } from '../lib/http-client';

const config = loadGatewayConfig();
const analyticsClient = createHttpClient(config.analyticsServiceUrl);

export default async function analyticsProxy(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate as any);

  server.get('/overview', async (request, reply) => {
    const data = await proxyRequest(analyticsClient, {
      method: 'GET',
      url: '/analytics/overview',
      params: request.query,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.get('/posts/:postId', async (request, reply) => {
    const data = await proxyRequest(analyticsClient, {
      method: 'GET',
      url: `/analytics/posts/${(request.params as any).postId}`,
      params: request.query,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.get('/trends', async (request, reply) => {
    const data = await proxyRequest(analyticsClient, {
      method: 'GET',
      url: '/analytics/trends',
      params: request.query,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });
}
