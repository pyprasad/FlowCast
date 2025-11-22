import { config as dotenvConfig } from 'dotenv';
import { z } from 'zod';
import { Environment } from '@creatorflow/types';

// Load environment variables
dotenvConfig();

const environmentSchema = z.enum(['development', 'staging', 'production', 'test']);

export interface BaseConfig {
  env: Environment;
  port: number;
  logLevel: string;
  corsOrigins: string[];
  databaseUrl: string;
  redisUrl: string;
}

export interface AuthConfig extends BaseConfig {
  jwtSecret: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
  emailProvider: {
    apiKey: string;
    from: string;
  };
  bcryptRounds: number;
}

export interface GatewayConfig extends BaseConfig {
  authServiceUrl: string;
  billingServiceUrl: string;
  apiKeysServiceUrl: string;
  platformServiceUrl: string;
  videoServiceUrl: string;
  schedulerServiceUrl: string;
  analyticsServiceUrl: string;
  commentsServiceUrl: string;
  aiServiceUrl: string;
  rateLimitWindowMs: number;
  rateLimitMaxRequests: number;
}

export interface BillingConfig extends BaseConfig {
  stripeSecretKey: string;
  stripeWebhookSecret: string;
  stripePriceIds: {
    creator: string;
    agency: string;
    enterprise: string;
  };
}

export interface PlatformConfig extends BaseConfig {
  oauth: {
    tiktok: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    youtube: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
    instagram: {
      clientId: string;
      clientSecret: string;
      redirectUri: string;
    };
  };
  encryptionKey: string;
}

export interface VideoConfig extends BaseConfig {
  storage: {
    provider: 'local' | 's3';
    localPath?: string;
    s3Bucket?: string;
    s3Region?: string;
    s3AccessKey?: string;
    s3SecretKey?: string;
  };
  ffmpegPath: string;
  maxFileSizeMB: number;
  tempDir: string;
}

export interface AnalyticsConfig extends BaseConfig {
  syncIntervalMinutes: number;
  batchSize: number;
}

export interface AiConfig extends BaseConfig {
  provider: 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
  maxTokens: number;
}

function getEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

function getEnvAsNumber(key: string, defaultValue?: number): number {
  const value = process.env[key];
  if (!value && defaultValue === undefined) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value ? parseInt(value, 10) : defaultValue!;
}

function getEnvAsArray(key: string, defaultValue: string[] = []): string[] {
  const value = process.env[key];
  if (!value) return defaultValue;
  return value.split(',').map((item) => item.trim());
}

export function loadBaseConfig(serviceName: string, defaultPort: number): BaseConfig {
  return {
    env: environmentSchema.parse(process.env.NODE_ENV || 'development') as Environment,
    port: getEnvAsNumber('PORT', defaultPort),
    logLevel: getEnv('LOG_LEVEL', 'info'),
    corsOrigins: getEnvAsArray('CORS_ORIGINS', ['http://localhost:5173']),
    databaseUrl: getEnv('DATABASE_URL'),
    redisUrl: getEnv('REDIS_URL', 'redis://localhost:6379'),
  };
}

export function loadAuthConfig(): AuthConfig {
  return {
    ...loadBaseConfig('auth-service', 4001),
    jwtSecret: getEnv('JWT_SECRET'),
    jwtAccessExpiry: getEnv('JWT_ACCESS_EXPIRY', '15m'),
    jwtRefreshExpiry: getEnv('JWT_REFRESH_EXPIRY', '7d'),
    emailProvider: {
      apiKey: getEnv('EMAIL_PROVIDER_API_KEY', 'mock'),
      from: getEnv('EMAIL_FROM', 'noreply@creatorflow.app'),
    },
    bcryptRounds: getEnvAsNumber('BCRYPT_ROUNDS', 10),
  };
}

export function loadGatewayConfig(): GatewayConfig {
  return {
    ...loadBaseConfig('gateway', 4000),
    authServiceUrl: getEnv('AUTH_SERVICE_URL', 'http://localhost:4001'),
    billingServiceUrl: getEnv('BILLING_SERVICE_URL', 'http://localhost:4002'),
    apiKeysServiceUrl: getEnv('API_KEYS_SERVICE_URL', 'http://localhost:4003'),
    platformServiceUrl: getEnv('PLATFORM_SERVICE_URL', 'http://localhost:4004'),
    videoServiceUrl: getEnv('VIDEO_SERVICE_URL', 'http://localhost:4005'),
    schedulerServiceUrl: getEnv('SCHEDULER_SERVICE_URL', 'http://localhost:4006'),
    analyticsServiceUrl: getEnv('ANALYTICS_SERVICE_URL', 'http://localhost:4007'),
    commentsServiceUrl: getEnv('COMMENTS_SERVICE_URL', 'http://localhost:4008'),
    aiServiceUrl: getEnv('AI_SERVICE_URL', 'http://localhost:4009'),
    rateLimitWindowMs: getEnvAsNumber('RATE_LIMIT_WINDOW_MS', 60000),
    rateLimitMaxRequests: getEnvAsNumber('RATE_LIMIT_MAX_REQUESTS', 100),
  };
}

export function loadBillingConfig(): BillingConfig {
  return {
    ...loadBaseConfig('billing-service', 4002),
    stripeSecretKey: getEnv('STRIPE_SECRET_KEY'),
    stripeWebhookSecret: getEnv('STRIPE_WEBHOOK_SECRET'),
    stripePriceIds: {
      creator: getEnv('STRIPE_PRICE_ID_CREATOR'),
      agency: getEnv('STRIPE_PRICE_ID_AGENCY'),
      enterprise: getEnv('STRIPE_PRICE_ID_ENTERPRISE'),
    },
  };
}

export function loadPlatformConfig(): PlatformConfig {
  return {
    ...loadBaseConfig('platform-service', 4004),
    oauth: {
      tiktok: {
        clientId: getEnv('TIKTOK_CLIENT_ID'),
        clientSecret: getEnv('TIKTOK_CLIENT_SECRET'),
        redirectUri: getEnv('TIKTOK_REDIRECT_URI'),
      },
      youtube: {
        clientId: getEnv('YOUTUBE_CLIENT_ID'),
        clientSecret: getEnv('YOUTUBE_CLIENT_SECRET'),
        redirectUri: getEnv('YOUTUBE_REDIRECT_URI'),
      },
      instagram: {
        clientId: getEnv('INSTAGRAM_CLIENT_ID'),
        clientSecret: getEnv('INSTAGRAM_CLIENT_SECRET'),
        redirectUri: getEnv('INSTAGRAM_REDIRECT_URI'),
      },
    },
    encryptionKey: getEnv('ENCRYPTION_KEY'),
  };
}

export function loadVideoConfig(): VideoConfig {
  const provider = (process.env.STORAGE_PROVIDER || 'local') as 'local' | 's3';

  return {
    ...loadBaseConfig('video-service', 4005),
    storage: {
      provider,
      ...(provider === 'local' && {
        localPath: getEnv('STORAGE_LOCAL_PATH', './storage'),
      }),
      ...(provider === 's3' && {
        s3Bucket: getEnv('S3_BUCKET'),
        s3Region: getEnv('S3_REGION'),
        s3AccessKey: getEnv('S3_ACCESS_KEY'),
        s3SecretKey: getEnv('S3_SECRET_KEY'),
      }),
    },
    ffmpegPath: getEnv('FFMPEG_PATH', 'ffmpeg'),
    maxFileSizeMB: getEnvAsNumber('MAX_FILE_SIZE_MB', 500),
    tempDir: getEnv('TEMP_DIR', '/tmp/creatorflow'),
  };
}

export function loadAnalyticsConfig(): AnalyticsConfig {
  return {
    ...loadBaseConfig('analytics-service', 4007),
    syncIntervalMinutes: getEnvAsNumber('SYNC_INTERVAL_MINUTES', 60),
    batchSize: getEnvAsNumber('BATCH_SIZE', 50),
  };
}

export function loadAiConfig(): AiConfig {
  const provider = (process.env.AI_PROVIDER || 'local') as 'openai' | 'anthropic' | 'local';

  return {
    ...loadBaseConfig('ai-service', 4009),
    provider,
    apiKey: provider !== 'local' ? getEnv('AI_API_KEY') : undefined,
    model: process.env.AI_MODEL,
    maxTokens: getEnvAsNumber('AI_MAX_TOKENS', 4000),
  };
}

// Validation helper
export function validateConfig<T>(config: T): T {
  const requiredKeys = Object.keys(config as object);
  const missingKeys = requiredKeys.filter(
    (key) => (config as any)[key] === undefined || (config as any)[key] === null
  );

  if (missingKeys.length > 0) {
    throw new Error(`Missing required configuration keys: ${missingKeys.join(', ')}`);
  }

  return config;
}
