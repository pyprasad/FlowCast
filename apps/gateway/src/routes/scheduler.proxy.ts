import { FastifyInstance } from 'fastify';
import { loadGatewayConfig } from '@creatorflow/config';
import { createHttpClient, proxyRequest } from '../lib/http-client';

const config = loadGatewayConfig();
const schedulerClient = createHttpClient(config.schedulerServiceUrl);

export default async function schedulerProxy(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate as any);

  server.post('/schedule', async (request, reply) => {
    const data = await proxyRequest(schedulerClient, {
      method: 'POST',
      url: '/scheduler/schedule',
      data: request.body,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.get('/posts', async (request, reply) => {
    const data = await proxyRequest(schedulerClient, {
      method: 'GET',
      url: '/scheduler/posts',
      params: request.query,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.delete('/:postId', async (request, reply) => {
    const data = await proxyRequest(schedulerClient, {
      method: 'DELETE',
      url: `/scheduler/${(request.params as any).postId}`,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });
}
