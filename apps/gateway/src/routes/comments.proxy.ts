import { FastifyInstance } from 'fastify';
import { loadGatewayConfig } from '@creatorflow/config';
import { createHttpClient, proxyRequest } from '../lib/http-client';

const config = loadGatewayConfig();
const commentsClient = createHttpClient(config.commentsServiceUrl);

export default async function commentsProxy(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate as any);

  server.get('/', async (request, reply) => {
    const data = await proxyRequest(commentsClient, {
      method: 'GET',
      url: '/comments',
      params: request.query,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.post('/:commentId/reply', async (request, reply) => {
    const data = await proxyRequest(commentsClient, {
      method: 'POST',
      url: `/comments/${(request.params as any).commentId}/reply`,
      data: request.body,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.put('/:commentId/read', async (request, reply) => {
    const data = await proxyRequest(commentsClient, {
      method: 'PUT',
      url: `/comments/${(request.params as any).commentId}/read`,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });
}
