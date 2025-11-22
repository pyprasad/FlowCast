import { FastifyInstance } from 'fastify';
import { loadGatewayConfig } from '@creatorflow/config';
import { createHttpClient, proxyRequest } from '../lib/http-client';

const config = loadGatewayConfig();
const aiClient = createHttpClient(config.aiServiceUrl);

export default async function aiProxy(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate as any);

  server.get('/advice/next-video', async (request, reply) => {
    const data = await proxyRequest(aiClient, {
      method: 'GET',
      url: '/ai/advice/next-video',
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.get('/advice/posting-times', async (request, reply) => {
    const data = await proxyRequest(aiClient, {
      method: 'GET',
      url: '/ai/advice/posting-times',
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.post('/advice/hashtags', async (request, reply) => {
    const data = await proxyRequest(aiClient, {
      method: 'POST',
      url: '/ai/advice/hashtags',
      data: request.body,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });
}
