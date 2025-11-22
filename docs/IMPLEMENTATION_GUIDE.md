# CreatorFlow - Complete Implementation Guide

## Overview

This guide provides complete implementation patterns for all CreatorFlow microservices. Each service follows the same architectural pattern established in the Auth and Gateway services.

## Service Implementation Pattern

Each microservice follows this structure:

```
service-name/
├── package.json
├── tsconfig.json
├── .env.example
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts (entry point)
│   ├── lib/ (shared utilities, DB, Redis)
│   ├── repositories/ (data access layer)
│   ├── services/ (business logic)
│   ├── controllers/ (request handlers)
│   └── routes/ (route definitions)
└── tests/
    ├── unit/
    ├── integration/
    └── e2e/
```

## Billing Service Implementation

### Database Schema (prisma/schema.prisma)

```prisma
model UserProfile {
  id            String   @id @default(uuid())
  userId        String   @unique
  displayName   String?
  bio           String?
  avatar        String?
  workspaceName String?
  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@map("user_profiles")
}

model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique
  plan                 SubscriptionPlan
  stripeCustomerId     String             @unique
  stripeSubscriptionId String?            @unique
  status               SubscriptionStatus
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  cancelAtPeriodEnd    Boolean            @default(false)
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt

  payments Payment[]
  usageLogs UsageLog[]

  @@map("subscriptions")
}

model Payment {
  id               String        @id @default(uuid())
  userId           String
  subscriptionId   String
  stripeInvoiceId  String        @unique
  amount           Int
  currency         String
  status           PaymentStatus
  paidAt           DateTime?
  createdAt        DateTime      @default(now())

  subscription Subscription @relation(fields: [subscriptionId], references: [id])

  @@index([userId])
  @@map("payments")
}

model UsageLog {
  id             String   @id @default(uuid())
  userId         String
  subscriptionId String
  usageType      String
  amount         Int
  createdAt      DateTime @default(now())

  subscription Subscription @relation(fields: [subscriptionId], references: [id])

  @@index([userId])
  @@index([subscriptionId])
  @@map("usage_logs")
}

enum SubscriptionPlan {
  FREE
  CREATOR
  AGENCY
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  PAST_DUE
  CANCELED
  INCOMPLETE
  TRIALING
}

enum PaymentStatus {
  PENDING
  SUCCEEDED
  FAILED
  REFUNDED
}
```

### Core Service (src/services/billing.service.ts)

```typescript
import Stripe from 'stripe';
import { loadBillingConfig } from '@creatorflow/config';
import { SubscriptionPlan, SubscriptionStatus } from '@creatorflow/types';

const config = loadBillingConfig();
const stripe = new Stripe(config.stripeSecretKey, {
  apiVersion: '2023-10-16',
});

export class BillingService {
  async createCheckoutSession(userId: string, plan: SubscriptionPlan) {
    // Get or create customer
    let subscription = await this.subscriptionRepo.findByUserId(userId);

    if (!subscription) {
      const customer = await stripe.customers.create({
        metadata: { userId },
      });

      subscription = await this.subscriptionRepo.create({
        userId,
        stripeCustomerId: customer.id,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.ACTIVE,
      });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: subscription.stripeCustomerId,
      line_items: [
        {
          price: this.getPriceId(plan),
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.FRONTEND_URL}/billing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/billing/cancel`,
    });

    return session;
  }

  async handleWebhook(payload: Buffer, signature: string) {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      config.stripeWebhookSecret
    );

    switch (event.type) {
      case 'invoice.paid':
        await this.handleInvoicePaid(event.data.object);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object);
        break;
    }
  }

  private getPriceId(plan: SubscriptionPlan): string {
    const priceIds = config.stripePriceIds;
    switch (plan) {
      case SubscriptionPlan.CREATOR:
        return priceIds.creator;
      case SubscriptionPlan.AGENCY:
        return priceIds.agency;
      case SubscriptionPlan.ENTERPRISE:
        return priceIds.enterprise;
      default:
        throw new Error('Invalid plan');
    }
  }
}
```

## Platform Integrations Service

### OAuth Flow Implementation

```typescript
// src/services/oauth.service.ts
export class OAuthService {
  async getAuthUrl(platform: Platform, userId: string): Promise<string> {
    const config = this.getOAuthConfig(platform);
    const state = await this.generateState(userId, platform);

    switch (platform) {
      case Platform.YOUTUBE:
        return `https://accounts.google.com/o/oauth2/v2/auth?${new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          response_type: 'code',
          scope: 'https://www.googleapis.com/auth/youtube.upload https://www.googleapis.com/auth/youtube.readonly',
          state,
          access_type: 'offline',
          prompt: 'consent',
        })}`;

      case Platform.TIKTOK:
        return `https://www.tiktok.com/auth/authorize?${new URLSearchParams({
          client_key: config.clientId,
          scope: 'user.info.basic,video.upload,video.list',
          response_type: 'code',
          redirect_uri: config.redirectUri,
          state,
        })}`;

      case Platform.INSTAGRAM:
        return `https://api.instagram.com/oauth/authorize?${new URLSearchParams({
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
          scope: 'user_profile,user_media',
          response_type: 'code',
          state,
        })}`;
    }
  }

  async handleCallback(platform: Platform, code: string, state: string) {
    // Verify state
    const stateData = await this.verifyState(state);

    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(platform, code);

    // Get user info from platform
    const platformUser = await this.getPlatformUserInfo(platform, tokens.accessToken);

    // Store platform account and encrypted tokens
    const account = await this.platformAccountRepo.create({
      userId: stateData.userId,
      platform,
      platformUserId: platformUser.id,
      platformUsername: platformUser.username,
      displayName: platformUser.displayName,
      profilePicture: platformUser.profilePicture,
    });

    await this.tokenRepo.create({
      platformAccountId: account.id,
      accessToken: await this.encrypt(tokens.accessToken),
      refreshToken: tokens.refreshToken ? await this.encrypt(tokens.refreshToken) : null,
      expiresAt: tokens.expiresIn ? new Date(Date.now() + tokens.expiresIn * 1000) : null,
    });

    return account;
  }
}

// src/services/platform-publisher.service.ts
export class PlatformPublisher {
  async publishToYouTube(accountId: string, videoAsset: VideoAsset, metadata: PostMetadata) {
    const tokens = await this.getDecryptedTokens(accountId);
    const youtube = google.youtube({ version: 'v3', auth: this.createOAuth2Client(tokens) });

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: metadata.caption?.slice(0, 100) || 'Untitled',
          description: metadata.caption || '',
          tags: metadata.hashtags,
        },
        status: {
          privacyStatus: 'public',
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(videoAsset.fileUrl),
      },
    });

    return response.data;
  }

  async publishToTikTok(accountId: string, videoAsset: VideoAsset, metadata: PostMetadata) {
    // TikTok API implementation
    const tokens = await this.getDecryptedTokens(accountId);
    // Implementation details...
  }

  async publishToInstagram(accountId: string, videoAsset: VideoAsset, metadata: PostMetadata) {
    // Instagram Graph API implementation
    const tokens = await this.getDecryptedTokens(accountId);
    // Implementation details...
  }
}
```

## Video Processing Service

### FFmpeg Integration

```typescript
// src/services/video-processor.service.ts
import ffmpeg from 'fluent-ffmpeg';
import { createLogger } from '@creatorflow/logger';

export class VideoProcessor {
  async processVideo(videoId: string, rawFilePath: string) {
    const logger = createLogger({ name: 'video-processor' });

    try {
      // Get video metadata
      const metadata = await this.getVideoMetadata(rawFilePath);

      // Generate variants for different aspect ratios
      const variants = await Promise.all([
        this.generateVariant(rawFilePath, '9:16', 1080, 1920),
        this.generateVariant(rawFilePath, '1:1', 1080, 1080),
        this.generateVariant(rawFilePath, '16:9', 1920, 1080),
      ]);

      // Generate thumbnail
      const thumbnail = await this.generateThumbnail(rawFilePath);

      // Extract audio for subtitle generation
      const audioPath = await this.extractAudio(rawFilePath);

      // Generate subtitles (integrate with Whisper or similar)
      const subtitles = await this.generateSubtitles(audioPath);

      return {
        variants,
        thumbnail,
        subtitles,
        metadata,
      };
    } catch (error) {
      logger.error({ err: error, videoId }, 'Video processing failed');
      throw error;
    }
  }

  private generateVariant(
    inputPath: string,
    aspectRatio: string,
    width: number,
    height: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `${this.config.tempDir}/${nanoid()}-${aspectRatio.replace(':', 'x')}.mp4`;

      ffmpeg(inputPath)
        .size(`${width}x${height}`)
        .aspect(aspectRatio)
        .videoBitrate('5000k')
        .audioBitrate('192k')
        .videoCodec('libx264')
        .audioCodec('aac')
        .outputOptions([
          '-preset fast',
          '-crf 22',
          '-pix_fmt yuv420p',
          '-movflags +faststart',
        ])
        .on('end', () => resolve(outputPath))
        .on('error', reject)
        .save(outputPath);
    });
  }

  private generateThumbnail(inputPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `${this.config.tempDir}/${nanoid()}-thumb.jpg`;

      ffmpeg(inputPath)
        .screenshots({
          count: 1,
          folder: this.config.tempDir,
          filename: path.basename(outputPath),
          size: '1920x1080',
        })
        .on('end', () => resolve(outputPath))
        .on('error', reject);
    });
  }
}

// src/workers/video-processor.worker.ts
import { Queue, Worker } from 'bullmq';
import { redis } from '../lib/redis';

const videoQueue = new Queue('video-processing', { connection: redis });

export const videoWorker = new Worker(
  'video-processing',
  async (job) => {
    const { videoId, rawFilePath } = job.data;

    const processor = new VideoProcessor();
    const result = await processor.processVideo(videoId, rawFilePath);

    // Update video status
    await videoRepo.update(videoId, {
      status: VideoStatus.READY,
      thumbnailUrl: result.thumbnail,
    });

    // Store variants
    for (const variant of result.variants) {
      await videoAssetRepo.create({
        videoId,
        aspectRatio: variant.aspectRatio,
        fileUrl: variant.url,
        // ... other metadata
      });
    }

    return result;
  },
  { connection: redis }
);
```

## Scheduler Service

### Cron-based Publishing

```typescript
// src/workers/scheduler.worker.ts
import cron from 'node-cron';
import { ScheduledPostRepository } from '../repositories/scheduled-post.repository';
import { PlatformPublisher } from '../services/platform-publisher.service';

export class PublishingScheduler {
  private scheduledPostRepo: ScheduledPostRepository;
  private publisher: PlatformPublisher;

  start() {
    // Run every minute to check for due posts
    cron.schedule('* * * * *', async () => {
      await this.processScheduledPosts();
    });
  }

  private async processScheduledPosts() {
    const duePosts = await this.scheduledPostRepo.findDuePosts();

    for (const post of duePosts) {
      try {
        // Update status to publishing
        await this.scheduledPostRepo.update(post.id, {
          status: ScheduleStatus.PUBLISHING,
        });

        // Get video asset for the platform
        const asset = await this.getVideoAssetForPlatform(
          post.videoId,
          post.platform
        );

        // Publish to platform
        const result = await this.publisher.publish(
          post.platform,
          post.platformAccountId,
          asset,
          {
            caption: post.caption,
            hashtags: post.hashtags,
          }
        );

        // Create published post record
        await this.publishedPostRepo.create({
          scheduledPostId: post.id,
          userId: post.userId,
          videoId: post.videoId,
          platform: post.platform,
          platformAccountId: post.platformAccountId,
          platformPostId: result.id,
          platformUrl: result.url,
          publishedAt: new Date(),
          caption: post.caption,
          hashtags: post.hashtags,
        });

        // Update scheduled post status
        await this.scheduledPostRepo.update(post.id, {
          status: ScheduleStatus.PUBLISHED,
        });
      } catch (error) {
        // Log error and update status
        await this.scheduledPostRepo.update(post.id, {
          status: ScheduleStatus.FAILED,
        });

        await this.publishingLogRepo.create({
          scheduledPostId: post.id,
          level: LogLevel.ERROR,
          message: error.message,
          metadata: { error: error.stack },
        });
      }
    }
  }
}
```

## Analytics Service

### Stats Collection Worker

```typescript
// src/workers/analytics-collector.worker.ts
import cron from 'node-cron';

export class AnalyticsCollector {
  start() {
    // Run every hour
    cron.schedule('0 * * * *', async () => {
      await this.collectAnalytics();
    });
  }

  private async collectAnalytics() {
    const publishedPosts = await this.publishedPostRepo.findAll();

    for (const post of publishedPosts) {
      try {
        const stats = await this.fetchStatsFromPlatform(
          post.platform,
          post.platformAccountId,
          post.platformPostId
        );

        await this.analyticsSnapshotRepo.create({
          publishedPostId: post.id,
          platform: post.platform,
          snapshotAt: new Date(),
          views: stats.views,
          likes: stats.likes,
          comments: stats.comments,
          shares: stats.shares,
          // ... other metrics
        });
      } catch (error) {
        logger.error({ err: error, postId: post.id }, 'Failed to collect analytics');
      }
    }
  }

  private async fetchStatsFromPlatform(
    platform: Platform,
    accountId: string,
    postId: string
  ) {
    const tokens = await this.getDecryptedTokens(accountId);

    switch (platform) {
      case Platform.YOUTUBE:
        return await this.fetchYouTubeStats(tokens, postId);
      case Platform.TIKTOK:
        return await this.fetchTikTokStats(tokens, postId);
      case Platform.INSTAGRAM:
        return await this.fetchInstagramStats(tokens, postId);
    }
  }
}
```

## AI Advisor Service

### Content Recommendations

```typescript
// src/services/ai-advisor.service.ts
export class AiAdvisorService {
  async getNextVideoIdea(userId: string) {
    // Analyze user's top performing videos
    const topVideos = await this.analyticsRepo.getTopPerformingVideos(userId, 10);

    // Extract common patterns
    const patterns = this.analyzePatterns(topVideos);

    // Generate recommendations using AI
    const recommendation = await this.generateRecommendation(patterns);

    return {
      title: recommendation.title,
      description: recommendation.description,
      suggestedHooks: recommendation.hooks,
      suggestedHashtags: recommendation.hashtags,
      targetPlatforms: recommendation.platforms,
      estimatedPerformance: recommendation.score,
    };
  }

  async getOptimalPostingTimes(userId: string) {
    // Analyze historical performance by time
    const analytics = await this.analyticsRepo.getHistoricalData(userId);

    // Group by day of week and hour
    const timePerformance = this.groupByTime(analytics);

    // Calculate scores
    const optimalTimes = this.calculateOptimalTimes(timePerformance);

    return optimalTimes.slice(0, 5); // Top 5 times
  }

  private async generateRecommendation(patterns: any) {
    if (this.config.provider === 'local') {
      // Rule-based local implementation
      return this.localRecommendation(patterns);
    } else {
      // Call external AI API (OpenAI, Anthropic, etc.)
      return this.aiRecommendation(patterns);
    }
  }
}
```

## Summary

All services follow the same pattern:
1. **Prisma schema** for database models
2. **Repositories** for data access
3. **Services** for business logic
4. **Controllers** for HTTP handlers
5. **Routes** for endpoint definitions
6. **Workers** for background jobs (where applicable)
7. **Tests** for unit, integration, and E2E testing

Each service is independently deployable and communicates via:
- HTTP/REST for synchronous operations
- Redis/BullMQ for asynchronous jobs
- Database per service pattern (logical separation)
