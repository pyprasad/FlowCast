import { FastifyInstance } from 'fastify';
import { loadGatewayConfig } from '@creatorflow/config';
import { createHttpClient, proxyRequest } from '../lib/http-client';

const config = loadGatewayConfig();
const platformClient = createHttpClient(config.platformServiceUrl);

export default async function platformProxy(server: FastifyInstance) {
  server.addHook('onRequest', server.authenticate as any);

  server.get('/accounts', async (request, reply) => {
    const data = await proxyRequest(platformClient, {
      method: 'GET',
      url: '/platforms/accounts',
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.post('/connect/:platform', async (request, reply) => {
    const data = await proxyRequest(platformClient, {
      method: 'POST',
      url: `/platforms/connect/${(request.params as any).platform}`,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.get('/callback/:platform', async (request, reply) => {
    const data = await proxyRequest(platformClient, {
      method: 'GET',
      url: `/platforms/callback/${(request.params as any).platform}`,
      params: request.query,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });

  server.delete('/disconnect/:accountId', async (request, reply) => {
    const data = await proxyRequest(platformClient, {
      method: 'DELETE',
      url: `/platforms/disconnect/${(request.params as any).accountId}`,
      headers: { 'x-user-id': request.user!.userId },
    });
    return reply.send(data);
  });
}
