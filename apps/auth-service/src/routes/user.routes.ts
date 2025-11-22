import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { UserRepository } from '../repositories/user.repository';

const userRepo = new UserRepository();

export default async function userRoutes(server: FastifyInstance) {
  server.get(
    '/me',
    {
      schema: {
        description: 'Get current user',
        tags: ['users'],
        headers: {
          type: 'object',
          required: ['authorization'],
          properties: {
            authorization: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest, reply: FastifyReply) => {
      // This would normally be protected by auth middleware
      // For now, just return a placeholder
      return reply.send({
        success: true,
        data: {
          message: 'This endpoint requires authentication middleware',
        },
      });
    }
  );

  server.get(
    '/:id',
    {
      schema: {
        description: 'Get user by ID',
        tags: ['users'],
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: { type: 'string' },
          },
        },
      },
    },
    async (request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) => {
      try {
        const user = await userRepo.findById(request.params.id);
        if (!user) {
          return reply.status(404).send({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          });
        }

        return reply.send({
          success: true,
          data: {
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              emailVerified: user.emailVerified,
            },
          },
        });
      } catch (error: any) {
        return reply.status(500).send({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: error.message,
          },
        });
      }
    }
  );
}
