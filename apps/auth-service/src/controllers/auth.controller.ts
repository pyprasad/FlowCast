import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { EmailService } from '../services/email.service';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string(),
});

const verifyEmailSchema = z.object({
  token: z.string(),
});

const requestPasswordResetSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(8),
});

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService(
      new UserRepository(),
      new TokenRepository(),
      new EmailService()
    );
  }

  async register(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = registerSchema.parse(request.body);
      const result = await this.authService.register(body.email, body.password);

      return reply.status(201).send({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            emailVerified: result.user.emailVerified,
          },
          tokens: result.tokens,
        },
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'REGISTRATION_FAILED',
          message: error.message,
        },
      });
    }
  }

  async login(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = loginSchema.parse(request.body);
      const result = await this.authService.login(body.email, body.password);

      return reply.send({
        success: true,
        data: {
          user: {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
            emailVerified: result.user.emailVerified,
          },
          tokens: result.tokens,
        },
      });
    } catch (error: any) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'LOGIN_FAILED',
          message: error.message,
        },
      });
    }
  }

  async refreshToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = refreshTokenSchema.parse(request.body);
      const tokens = await this.authService.refreshToken(body.refreshToken);

      return reply.send({
        success: true,
        data: { tokens },
      });
    } catch (error: any) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'REFRESH_FAILED',
          message: error.message,
        },
      });
    }
  }

  async logout(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = refreshTokenSchema.parse(request.body);
      await this.authService.logout(body.refreshToken);

      return reply.send({
        success: true,
        data: { message: 'Logged out successfully' },
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'LOGOUT_FAILED',
          message: error.message,
        },
      });
    }
  }

  async verifyEmail(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = verifyEmailSchema.parse(request.query);
      const user = await this.authService.verifyEmail(query.token);

      return reply.send({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            emailVerified: user.emailVerified,
          },
        },
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'VERIFICATION_FAILED',
          message: error.message,
        },
      });
    }
  }

  async requestPasswordReset(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = requestPasswordResetSchema.parse(request.body);
      await this.authService.requestPasswordReset(body.email);

      return reply.send({
        success: true,
        data: { message: 'If an account exists, a reset email has been sent' },
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'RESET_REQUEST_FAILED',
          message: error.message,
        },
      });
    }
  }

  async resetPassword(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = resetPasswordSchema.parse(request.body);
      await this.authService.resetPassword(body.token, body.newPassword);

      return reply.send({
        success: true,
        data: { message: 'Password reset successfully' },
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'RESET_FAILED',
          message: error.message,
        },
      });
    }
  }

  async verifyToken(request: FastifyRequest, reply: FastifyReply) {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        throw new Error('No token provided');
      }

      const token = authHeader.substring(7);
      const payload = await this.authService.verifyAccessToken(token);

      return reply.send({
        success: true,
        data: { payload },
      });
    } catch (error: any) {
      return reply.status(401).send({
        success: false,
        error: {
          code: 'TOKEN_INVALID',
          message: error.message,
        },
      });
    }
  }
}
