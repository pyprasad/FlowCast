import { AuthService } from '../../src/services/auth.service';
import { UserRepository } from '../../src/repositories/user.repository';
import { TokenRepository } from '../../src/repositories/token.repository';
import { EmailService } from '../../src/services/email.service';
import { UserRole } from '@creatorflow/types';

// Mock dependencies
jest.mock('../../src/repositories/user.repository');
jest.mock('../../src/repositories/token.repository');
jest.mock('../../src/services/email.service');

describe('AuthService', () => {
  let authService: AuthService;
  let userRepo: jest.Mocked<UserRepository>;
  let tokenRepo: jest.Mocked<TokenRepository>;
  let emailService: jest.Mocked<EmailService>;

  beforeEach(() => {
    userRepo = new UserRepository() as jest.Mocked<UserRepository>;
    tokenRepo = new TokenRepository() as jest.Mocked<TokenRepository>;
    emailService = new EmailService() as jest.Mocked<EmailService>;
    authService = new AuthService(userRepo, tokenRepo, emailService);
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      userRepo.findByEmail.mockResolvedValue(null);
      userRepo.create.mockResolvedValue({
        id: '123',
        email,
        passwordHash: 'hashed',
        role: UserRole.USER,
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      tokenRepo.createVerificationToken.mockResolvedValue(undefined);
      emailService.sendVerificationEmail.mockResolvedValue(undefined);

      const result = await authService.register(email, password);

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(email);
      expect(result.tokens).toBeDefined();
      expect(result.tokens.accessToken).toBeDefined();
      expect(result.tokens.refreshToken).toBeDefined();
    });

    it('should throw error if user already exists', async () => {
      const email = 'existing@example.com';
      const password = 'password123';

      userRepo.findByEmail.mockResolvedValue({
        id: '123',
        email,
        passwordHash: 'hashed',
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(authService.register(email, password)).rejects.toThrow(
        'User already exists'
      );
    });
  });

  describe('login', () => {
    it('should login user with valid credentials', async () => {
      const email = 'test@example.com';
      const password = 'password123';

      // Mock bcrypt to avoid actual hashing in tests
      const bcrypt = require('bcrypt');
      bcrypt.compare = jest.fn().mockResolvedValue(true);

      userRepo.findByEmail.mockResolvedValue({
        id: '123',
        email,
        passwordHash: 'hashed',
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await authService.login(email, password);

      expect(result.user).toBeDefined();
      expect(result.tokens).toBeDefined();
    });

    it('should throw error with invalid credentials', async () => {
      const email = 'test@example.com';
      const password = 'wrongpassword';

      userRepo.findByEmail.mockResolvedValue(null);

      await expect(authService.login(email, password)).rejects.toThrow('Invalid credentials');
    });
  });

  describe('verifyEmail', () => {
    it('should verify email with valid token', async () => {
      const token = 'valid-token';
      const userId = '123';

      tokenRepo.findVerificationToken.mockResolvedValue({
        id: '1',
        userId,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        user: {
          id: userId,
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: UserRole.USER,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      userRepo.verifyEmail.mockResolvedValue({
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashed',
        role: UserRole.USER,
        emailVerified: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      tokenRepo.deleteVerificationToken.mockResolvedValue(undefined);

      const result = await authService.verifyEmail(token);

      expect(result.emailVerified).toBe(true);
      expect(tokenRepo.deleteVerificationToken).toHaveBeenCalledWith(token);
    });

    it('should throw error with invalid token', async () => {
      tokenRepo.findVerificationToken.mockResolvedValue(null);

      await expect(authService.verifyEmail('invalid-token')).rejects.toThrow(
        'Invalid verification token'
      );
    });

    it('should throw error with expired token', async () => {
      const token = 'expired-token';

      tokenRepo.findVerificationToken.mockResolvedValue({
        id: '1',
        userId: '123',
        token,
        expiresAt: new Date(Date.now() - 1000), // Expired
        createdAt: new Date(),
        user: {
          id: '123',
          email: 'test@example.com',
          passwordHash: 'hashed',
          role: UserRole.USER,
          emailVerified: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      await expect(authService.verifyEmail(token)).rejects.toThrow(
        'Verification token expired'
      );
    });
  });
});
