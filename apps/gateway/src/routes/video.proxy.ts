import { FastifyInstance } from 'fastify';
import { loadGatewayConfig } from '@creatorflow/config';
import { createHttpClient, proxyRequest } from '../lib/http-client';

const config = loadGatewayConfig();
const videoClient = createHttpClient(config.videoServiceUrl);

export default async function videoProxy(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate as any);

  server.post('/upload', async (request, reply) => {
    const data = await proxyRequest(videoClient, {
      method: 'POST',
      url: '/videos/upload',
      data: request.body,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.get('/', async (request, reply) => {
    const data = await proxyRequest(videoClient, {
      method: 'GET',
      url: '/videos',
      params: request.query,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.get('/:videoId', async (request, reply) => {
    const data = await proxyRequest(videoClient, {
      method: 'GET',
      url: `/videos/${(request.params as any).videoId}`,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.get('/:videoId/status', async (request, reply) => {
    const data = await proxyRequest(videoClient, {
      method: 'GET',
      url: `/videos/${(request.params as any).videoId}/status`,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.delete('/:videoId', async (request, reply) => {
    const data = await proxyRequest(videoClient, {
      method: 'DELETE',
      url: `/videos/${(request.params as any).videoId}`,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });
}
