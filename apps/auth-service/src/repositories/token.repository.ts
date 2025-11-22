import { prisma } from '../lib/prisma';
import { RefreshToken } from '@creatorflow/types';

export class TokenRepository {
  async createRefreshToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<RefreshToken> {
    return prisma.refreshToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    }) as Promise<RefreshToken>;
  }

  async findRefreshToken(token: string): Promise<RefreshToken | null> {
    return prisma.refreshToken.findUnique({
      where: { token },
    }) as Promise<RefreshToken | null>;
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await prisma.refreshToken.delete({
      where: { token },
    });
  }

  async deleteUserRefreshTokens(userId: string): Promise<void> {
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });
  }

  async createVerificationToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await prisma.verificationToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findVerificationToken(token: string) {
    return prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async deleteVerificationToken(token: string): Promise<void> {
    await prisma.verificationToken.delete({
      where: { token },
    });
  }

  async createPasswordResetToken(
    userId: string,
    token: string,
    expiresAt: Date
  ): Promise<void> {
    await prisma.passwordResetToken.create({
      data: {
        userId,
        token,
        expiresAt,
      },
    });
  }

  async findPasswordResetToken(token: string) {
    return prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });
  }

  async markPasswordResetTokenUsed(token: string): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { token },
      data: { used: true },
    });
  }
}
