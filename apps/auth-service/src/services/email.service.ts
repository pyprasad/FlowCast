import { loadAuthConfig } from '@creatorflow/config';
import { createLogger } from '@creatorflow/logger';

const config = loadAuthConfig();
const logger = createLogger({ name: 'email-service' });

export interface EmailProvider {
  sendEmail(to: string, subject: string, html: string): Promise<void>;
}

// Mock email provider for development
class MockEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    logger.info({ to, subject }, 'Mock email sent');
    logger.debug({ html }, 'Email content');
  }
}

// Real email provider (e.g., SendGrid, AWS SES)
// Implement this when integrating with a real email service
class RealEmailProvider implements EmailProvider {
  async sendEmail(to: string, subject: string, html: string): Promise<void> {
    // TODO: Implement real email provider
    throw new Error('Real email provider not implemented');
  }
}

export class EmailService {
  private provider: EmailProvider;

  constructor() {
    // Use mock provider in development/test
    this.provider =
      config.emailProvider.apiKey === 'mock'
        ? new MockEmailProvider()
        : new RealEmailProvider();
  }

  async sendVerificationEmail(email: string, token: string): Promise<void> {
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email?token=${token}`;
    const html = `
      <h1>Verify Your Email</h1>
      <p>Thank you for registering with CreatorFlow!</p>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationUrl}">${verificationUrl}</a>
      <p>This link will expire in 24 hours.</p>
    `;

    await this.provider.sendEmail(email, 'Verify Your Email - CreatorFlow', html);
  }

  async sendPasswordResetEmail(email: string, token: string): Promise<void> {
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
    const html = `
      <h1>Reset Your Password</h1>
      <p>You requested to reset your password for CreatorFlow.</p>
      <p>Please click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `;

    await this.provider.sendEmail(email, 'Reset Your Password - CreatorFlow', html);
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
      <h1>Welcome to CreatorFlow!</h1>
      <p>Hi ${name},</p>
      <p>Thank you for verifying your email. You're all set to start creating amazing content!</p>
      <p>Get started by connecting your social media accounts and uploading your first video.</p>
    `;

    await this.provider.sendEmail(email, 'Welcome to CreatorFlow!', html);
  }
}
