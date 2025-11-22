import { FastifyRequest, FastifyReply } from 'fastify';
import axios from 'axios';
import { loadGatewayConfig } from '@creatorflow/config';
import { JWTPayload } from '@creatorflow/types';

const config = loadGatewayConfig();

declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

export async function authMiddleware(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: 'No authorization token provided',
        },
      });
    }

    const token = authHeader.substring(7);

    // Verify token with auth service
    const response = await axios.post(
      `${config.authServiceUrl}/auth/verify-token`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (response.data.success) {
      request.user = response.data.data.payload;
    } else {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'INVALID_TOKEN',
          message: 'Invalid authorization token',
        },
      });
    }
  } catch (error: any) {
    return reply.status(401).send({
      success: false,
      error: {
        code: 'AUTHENTICATION_FAILED',
        message: 'Authentication failed',
      },
    });
  }
}
