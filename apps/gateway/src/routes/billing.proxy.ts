import { FastifyInstance } from 'fastify';
import { loadGatewayConfig } from '@creatorflow/config';
import { createHttpClient, proxyRequest } from '../lib/http-client';

const config = loadGatewayConfig();
const billingClient = createHttpClient(config.billingServiceUrl);

export default async function billingProxy(server: FastifyInstance) {
  // All billing routes require authentication
  server.addHook('onRequest', server.authenticate as any);

  server.get('/subscription', async (request, reply) => {
    const data = await proxyRequest(billingClient, {
      method: 'GET',
      url: '/billing/subscription',
      headers: {
        'x-user-id': request.user!.userId,
      },
    });
    return reply.send(data);
  });

  server.post('/create-checkout', async (request, reply) => {
    const data = await proxyRequest(billingClient, {
      method: 'POST',
      url: '/billing/create-checkout',
      data: request.body,
      headers: {
        'x-user-id': request.user!.userId,
      },
    });
    return reply.send(data);
  });

  server.post('/cancel-subscription', async (request, reply) => {
    const data = await proxyRequest(billingClient, {
      method: 'POST',
      url: '/billing/cancel-subscription',
      headers: {
        'x-user-id': request.user!.userId,
      },
    });
    return reply.send(data);
  });

  server.get('/usage', async (request, reply) => {
    const data = await proxyRequest(billingClient, {
      method: 'GET',
      url: '/billing/usage',
      headers: {
        'x-user-id': request.user!.userId,
      },
    });
    return reply.send(data);
  });

  // Webhook endpoint (no auth)
  server.post('/webhook', { onRequest: [] }, async (request, reply) => {
    const data = await proxyRequest(billingClient, {
      method: 'POST',
      url: '/billing/webhook',
      data: request.body,
      headers: {
        'stripe-signature': request.headers['stripe-signature'] as string,
      },
    });
    return reply.send(data);
  });
}
