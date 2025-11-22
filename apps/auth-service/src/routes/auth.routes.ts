import { FastifyInstance } from 'fastify';
import { AuthController } from '../controllers/auth.controller';

const authController = new AuthController();

export default async function authRoutes(server: FastifyInstance) {
  server.post('/register', {
    schema: {
      description: 'Register a new user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string', minLength: 8 },
        },
      },
    },
    handler: authController.register.bind(authController),
  });

  server.post('/login', {
    schema: {
      description: 'Login user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
    },
    handler: authController.login.bind(authController),
  });

  server.post('/refresh', {
    schema: {
      description: 'Refresh access token',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
    handler: authController.refreshToken.bind(authController),
  });

  server.post('/logout', {
    schema: {
      description: 'Logout user',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
    },
    handler: authController.logout.bind(authController),
  });

  server.get('/verify-email', {
    schema: {
      description: 'Verify user email',
      tags: ['auth'],
      querystring: {
        type: 'object',
        required: ['token'],
        properties: {
          token: { type: 'string' },
        },
      },
    },
    handler: authController.verifyEmail.bind(authController),
  });

  server.post('/request-password-reset', {
    schema: {
      description: 'Request password reset',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['email'],
        properties: {
          email: { type: 'string', format: 'email' },
        },
      },
    },
    handler: authController.requestPasswordReset.bind(authController),
  });

  server.post('/reset-password', {
    schema: {
      description: 'Reset password',
      tags: ['auth'],
      body: {
        type: 'object',
        required: ['token', 'newPassword'],
        properties: {
          token: { type: 'string' },
          newPassword: { type: 'string', minLength: 8 },
        },
      },
    },
    handler: authController.resetPassword.bind(authController),
  });

  server.post('/verify-token', {
    schema: {
      description: 'Verify JWT access token',
      tags: ['auth'],
      headers: {
        type: 'object',
        required: ['authorization'],
        properties: {
          authorization: { type: 'string' },
        },
      },
    },
    handler: authController.verifyToken.bind(authController),
  });
}
