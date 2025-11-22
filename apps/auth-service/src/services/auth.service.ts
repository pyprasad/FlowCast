import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { nanoid } from 'nanoid';
import { loadAuthConfig } from '@creatorflow/config';
import { User, JWTPayload, AuthTokens, UserRole } from '@creatorflow/types';
import { UserRepository } from '../repositories/user.repository';
import { TokenRepository } from '../repositories/token.repository';
import { EmailService } from './email.service';
import { createLogger } from '@creatorflow/logger';

const config = loadAuthConfig();
const logger = createLogger({ name: 'auth-service' });

export class AuthService {
  constructor(
    private userRepo: UserRepository,
    private tokenRepo: TokenRepository,
    private emailService: EmailService
  ) {}

  async register(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user exists
    const existingUser = await this.userRepo.findByEmail(email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, config.bcryptRounds);

    // Create user
    const user = await this.userRepo.create({
      email,
      passwordHash,
      role: UserRole.USER,
    });

    // Generate verification token
    const verificationToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    await this.tokenRepo.createVerificationToken(user.id, verificationToken, expiresAt);

    // Send verification email
    await this.emailService.sendVerificationEmail(user.email, verificationToken);

    // Generate auth tokens
    const tokens = await this.generateTokens(user);

    logger.info({ userId: user.id, email: user.email }, 'User registered');

    return { user, tokens };
  }

  async login(email: string, password: string): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate tokens
    const tokens = await this.generateTokens(user);

    logger.info({ userId: user.id, email: user.email }, 'User logged in');

    return { user, tokens };
  }

  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Find refresh token
    const token = await this.tokenRepo.findRefreshToken(refreshToken);
    if (!token) {
      throw new Error('Invalid refresh token');
    }

    // Check expiration
    if (token.expiresAt < new Date()) {
      await this.tokenRepo.deleteRefreshToken(refreshToken);
      throw new Error('Refresh token expired');
    }

    // Find user
    const user = await this.userRepo.findById(token.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete old refresh token
    await this.tokenRepo.deleteRefreshToken(refreshToken);

    // Generate new tokens
    const tokens = await this.generateTokens(user);

    logger.info({ userId: user.id }, 'Token refreshed');

    return tokens;
  }

  async logout(refreshToken: string): Promise<void> {
    await this.tokenRepo.deleteRefreshToken(refreshToken);
    logger.info('User logged out');
  }

  async verifyEmail(token: string): Promise<User> {
    // Find verification token
    const verificationToken = await this.tokenRepo.findVerificationToken(token);
    if (!verificationToken) {
      throw new Error('Invalid verification token');
    }

    // Check expiration
    if (verificationToken.expiresAt < new Date()) {
      throw new Error('Verification token expired');
    }

    // Verify email
    const user = await this.userRepo.verifyEmail(verificationToken.userId);

    // Delete verification token
    await this.tokenRepo.deleteVerificationToken(token);

    logger.info({ userId: user.id }, 'Email verified');

    return user;
  }

  async requestPasswordReset(email: string): Promise<void> {
    // Find user
    const user = await this.userRepo.findByEmail(email);
    if (!user) {
      // Don't reveal if user exists
      return;
    }

    // Generate reset token
    const resetToken = nanoid(32);
    const expiresAt = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour
    await this.tokenRepo.createPasswordResetToken(user.id, resetToken, expiresAt);

    // Send reset email
    await this.emailService.sendPasswordResetEmail(user.email, resetToken);

    logger.info({ userId: user.id }, 'Password reset requested');
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    // Find reset token
    const resetToken = await this.tokenRepo.findPasswordResetToken(token);
    if (!resetToken) {
      throw new Error('Invalid reset token');
    }

    // Check if already used
    if (resetToken.used) {
      throw new Error('Reset token already used');
    }

    // Check expiration
    if (resetToken.expiresAt < new Date()) {
      throw new Error('Reset token expired');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, config.bcryptRounds);

    // Update password
    await this.userRepo.updatePassword(resetToken.userId, passwordHash);

    // Mark token as used
    await this.tokenRepo.markPasswordResetTokenUsed(token);

    // Delete all refresh tokens for this user
    await this.tokenRepo.deleteUserRefreshTokens(resetToken.userId);

    logger.info({ userId: resetToken.userId }, 'Password reset');
  }

  async verifyAccessToken(token: string): Promise<JWTPayload> {
    try {
      const payload = jwt.verify(token, config.jwtSecret) as JWTPayload;
      return payload;
    } catch (error) {
      throw new Error('Invalid access token');
    }
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: Omit<JWTPayload, 'iat' | 'exp'> = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // Generate access token
    const accessToken = jwt.sign(payload, config.jwtSecret, {
      expiresIn: config.jwtAccessExpiry,
    });

    // Generate refresh token
    const refreshTokenValue = nanoid(64);
    const refreshTokenExpiry = this.parseExpiry(config.jwtRefreshExpiry);
    await this.tokenRepo.createRefreshToken(user.id, refreshTokenValue, refreshTokenExpiry);

    return {
      accessToken,
      refreshToken: refreshTokenValue,
    };
  }

  private parseExpiry(expiry: string): Date {
    const match = expiry.match(/^(\d+)([dhms])$/);
    if (!match) {
      throw new Error('Invalid expiry format');
    }

    const value = parseInt(match[1]);
    const unit = match[2];

    const now = new Date();
    switch (unit) {
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      case 's':
        return new Date(now.getTime() + value * 1000);
      default:
        throw new Error('Invalid expiry unit');
    }
  }
}
