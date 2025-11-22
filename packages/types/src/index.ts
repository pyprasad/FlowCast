// Auth Types
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  emailVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

// User Profile & Billing Types
export interface UserProfile {
  id: string;
  userId: string;
  displayName: string | null;
  bio: string | null;
  avatar: string | null;
  workspaceName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  CREATOR = 'CREATOR',
  AGENCY = 'AGENCY',
  ENTERPRISE = 'ENTERPRISE',
}

export interface Subscription {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  stripeCustomerId: string;
  stripeSubscriptionId: string | null;
  status: SubscriptionStatus;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  PAST_DUE = 'PAST_DUE',
  CANCELED = 'CANCELED',
  INCOMPLETE = 'INCOMPLETE',
  TRIALING = 'TRIALING',
}

export interface Payment {
  id: string;
  userId: string;
  subscriptionId: string;
  stripeInvoiceId: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  paidAt: Date | null;
  createdAt: Date;
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export interface PlanLimits {
  maxConnectedAccounts: number;
  maxVideosPerMonth: number;
  maxScheduledPosts: number;
  aiTokensPerMonth: number;
  apiAccessEnabled: boolean;
}

export const PLAN_LIMITS: Record<SubscriptionPlan, PlanLimits> = {
  [SubscriptionPlan.FREE]: {
    maxConnectedAccounts: 2,
    maxVideosPerMonth: 10,
    maxScheduledPosts: 5,
    aiTokensPerMonth: 1000,
    apiAccessEnabled: false,
  },
  [SubscriptionPlan.CREATOR]: {
    maxConnectedAccounts: 5,
    maxVideosPerMonth: 100,
    maxScheduledPosts: 50,
    aiTokensPerMonth: 10000,
    apiAccessEnabled: false,
  },
  [SubscriptionPlan.AGENCY]: {
    maxConnectedAccounts: 20,
    maxVideosPerMonth: 500,
    maxScheduledPosts: 200,
    aiTokensPerMonth: 50000,
    apiAccessEnabled: true,
  },
  [SubscriptionPlan.ENTERPRISE]: {
    maxConnectedAccounts: 100,
    maxVideosPerMonth: -1, // unlimited
    maxScheduledPosts: -1,
    aiTokensPerMonth: 200000,
    apiAccessEnabled: true,
  },
};

// API Keys Types
export interface ApiKey {
  id: string;
  userId: string;
  name: string;
  keyHash: string;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  revoked: boolean;
  createdAt: Date;
}

// Platform Integration Types
export enum Platform {
  TIKTOK = 'TIKTOK',
  YOUTUBE = 'YOUTUBE',
  INSTAGRAM = 'INSTAGRAM',
  FACEBOOK = 'FACEBOOK',
  LINKEDIN = 'LINKEDIN',
  TWITTER = 'TWITTER',
}

export interface PlatformAccount {
  id: string;
  userId: string;
  platform: Platform;
  platformUserId: string;
  platformUsername: string;
  displayName: string;
  profilePicture: string | null;
  isActive: boolean;
  connectedAt: Date;
  lastSyncedAt: Date | null;
}

export interface OAuthToken {
  id: string;
  platformAccountId: string;
  accessToken: string; // encrypted
  refreshToken: string | null; // encrypted
  tokenType: string;
  expiresAt: Date | null;
  scope: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PlatformCapabilities {
  supportsScheduling: boolean;
  supportsComments: boolean;
  supportsAnalytics: boolean;
  supportsDrafts: boolean;
  maxVideoSizeMB: number;
  maxVideoDurationSeconds: number;
  supportedAspectRatios: AspectRatio[];
}

export enum AspectRatio {
  VERTICAL = '9:16',
  SQUARE = '1:1',
  HORIZONTAL = '16:9',
  PORTRAIT = '4:5',
}

export const PLATFORM_CAPABILITIES: Record<Platform, PlatformCapabilities> = {
  [Platform.TIKTOK]: {
    supportsScheduling: true,
    supportsComments: true,
    supportsAnalytics: true,
    supportsDrafts: false,
    maxVideoSizeMB: 287,
    maxVideoDurationSeconds: 600,
    supportedAspectRatios: [AspectRatio.VERTICAL],
  },
  [Platform.YOUTUBE]: {
    supportsScheduling: true,
    supportsComments: true,
    supportsAnalytics: true,
    supportsDrafts: true,
    maxVideoSizeMB: 256,
    maxVideoDurationSeconds: 60,
    supportedAspectRatios: [AspectRatio.VERTICAL],
  },
  [Platform.INSTAGRAM]: {
    supportsScheduling: true,
    supportsComments: true,
    supportsAnalytics: true,
    supportsDrafts: false,
    maxVideoSizeMB: 100,
    maxVideoDurationSeconds: 90,
    supportedAspectRatios: [AspectRatio.VERTICAL, AspectRatio.SQUARE, AspectRatio.PORTRAIT],
  },
  [Platform.FACEBOOK]: {
    supportsScheduling: true,
    supportsComments: true,
    supportsAnalytics: true,
    supportsDrafts: false,
    maxVideoSizeMB: 100,
    maxVideoDurationSeconds: 90,
    supportedAspectRatios: [AspectRatio.VERTICAL, AspectRatio.SQUARE],
  },
  [Platform.LINKEDIN]: {
    supportsScheduling: false,
    supportsComments: true,
    supportsAnalytics: true,
    supportsDrafts: false,
    maxVideoSizeMB: 200,
    maxVideoDurationSeconds: 600,
    supportedAspectRatios: [AspectRatio.VERTICAL, AspectRatio.SQUARE, AspectRatio.HORIZONTAL],
  },
  [Platform.TWITTER]: {
    supportsScheduling: false,
    supportsComments: true,
    supportsAnalytics: false,
    supportsDrafts: false,
    maxVideoSizeMB: 512,
    maxVideoDurationSeconds: 140,
    supportedAspectRatios: [AspectRatio.VERTICAL, AspectRatio.SQUARE, AspectRatio.HORIZONTAL],
  },
};

// Video Processing Types
export interface Video {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  originalFilename: string;
  rawFileUrl: string;
  thumbnailUrl: string | null;
  durationSeconds: number;
  status: VideoStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum VideoStatus {
  UPLOADING = 'UPLOADING',
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  FAILED = 'FAILED',
}

export interface VideoAsset {
  id: string;
  videoId: string;
  aspectRatio: AspectRatio;
  fileUrl: string;
  fileSizeMB: number;
  width: number;
  height: number;
  codec: string;
  bitrate: number;
  createdAt: Date;
}

export interface ProcessingJob {
  id: string;
  videoId: string;
  status: ProcessingStatus;
  progress: number; // 0-100
  errorMessage: string | null;
  startedAt: Date | null;
  completedAt: Date | null;
  createdAt: Date;
}

export enum ProcessingStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface SubtitleTrack {
  id: string;
  videoId: string;
  language: string;
  fileUrl: string;
  format: SubtitleFormat;
  createdAt: Date;
}

export enum SubtitleFormat {
  SRT = 'SRT',
  VTT = 'VTT',
  ASS = 'ASS',
}

// Scheduling & Publishing Types
export interface ScheduledPost {
  id: string;
  userId: string;
  videoId: string;
  platform: Platform;
  platformAccountId: string;
  scheduledFor: Date;
  status: ScheduleStatus;
  caption: string | null;
  hashtags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum ScheduleStatus {
  PENDING = 'PENDING',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
  CANCELED = 'CANCELED',
}

export interface PublishedPost {
  id: string;
  scheduledPostId: string;
  userId: string;
  videoId: string;
  platform: Platform;
  platformAccountId: string;
  platformPostId: string;
  platformUrl: string;
  publishedAt: Date;
  caption: string | null;
  hashtags: string[];
  createdAt: Date;
}

export interface PublishingLog {
  id: string;
  scheduledPostId: string;
  level: LogLevel;
  message: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

// Analytics Types
export interface AnalyticsSnapshot {
  id: string;
  publishedPostId: string;
  platform: Platform;
  snapshotAt: Date;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  watchTimeSeconds: number;
  averageWatchPercentage: number;
  createdAt: Date;
}

export interface AnalyticsAggregate {
  id: string;
  userId: string;
  platform: Platform | null; // null means all platforms
  periodStart: Date;
  periodEnd: Date;
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  totalReach: number;
  averageEngagementRate: number;
  topPerformingPostId: string | null;
  createdAt: Date;
}

export interface PerformanceMetrics {
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  impressions: number;
  watchTimeSeconds: number;
  engagementRate: number;
  completionRate: number;
}

// Comments & Engagement Types
export interface Comment {
  id: string;
  publishedPostId: string;
  platform: Platform;
  platformCommentId: string;
  authorId: string;
  authorUsername: string;
  authorDisplayName: string;
  authorProfilePicture: string | null;
  text: string;
  likes: number;
  replies: number;
  sentiment: CommentSentiment | null;
  classification: CommentClassification | null;
  isRead: boolean;
  createdAt: Date;
  platformCreatedAt: Date;
}

export enum CommentSentiment {
  POSITIVE = 'POSITIVE',
  NEUTRAL = 'NEUTRAL',
  NEGATIVE = 'NEGATIVE',
}

export enum CommentClassification {
  QUESTION = 'QUESTION',
  PRAISE = 'PRAISE',
  CRITICISM = 'CRITICISM',
  SPAM = 'SPAM',
  HATE = 'HATE',
  GENERAL = 'GENERAL',
}

export interface CommentReply {
  id: string;
  commentId: string;
  userId: string;
  platform: Platform;
  platformReplyId: string | null;
  text: string;
  status: ReplyStatus;
  createdAt: Date;
  publishedAt: Date | null;
}

export enum ReplyStatus {
  DRAFT = 'DRAFT',
  PUBLISHING = 'PUBLISHING',
  PUBLISHED = 'PUBLISHED',
  FAILED = 'FAILED',
}

// AI Advisor Types
export interface AiInsight {
  id: string;
  userId: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number; // 0-1
  metadata: Record<string, any>;
  createdAt: Date;
  expiresAt: Date | null;
}

export enum InsightType {
  CONTENT_IDEA = 'CONTENT_IDEA',
  POSTING_TIME = 'POSTING_TIME',
  HASHTAG_SUGGESTION = 'HASHTAG_SUGGESTION',
  PERFORMANCE_ANALYSIS = 'PERFORMANCE_ANALYSIS',
  AUDIENCE_INSIGHT = 'AUDIENCE_INSIGHT',
}

export interface ContentRecommendation {
  id: string;
  userId: string;
  title: string;
  description: string;
  suggestedHooks: string[];
  suggestedHashtags: string[];
  targetPlatforms: Platform[];
  estimatedPerformance: number; // 0-100 score
  createdAt: Date;
}

export interface OptimalPostingTime {
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  hour: number; // 0-23
  score: number; // 0-100
  platform: Platform;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export interface ResponseMeta {
  page?: number;
  pageSize?: number;
  total?: number;
  hasMore?: boolean;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

// Event Types for Inter-Service Communication
export interface DomainEvent {
  id: string;
  type: string;
  aggregateId: string;
  payload: Record<string, any>;
  timestamp: Date;
  version: number;
}

export enum EventType {
  USER_REGISTERED = 'user.registered',
  USER_EMAIL_VERIFIED = 'user.email_verified',
  SUBSCRIPTION_CREATED = 'subscription.created',
  SUBSCRIPTION_UPDATED = 'subscription.updated',
  PLATFORM_CONNECTED = 'platform.connected',
  PLATFORM_DISCONNECTED = 'platform.disconnected',
  VIDEO_UPLOADED = 'video.uploaded',
  VIDEO_PROCESSING_STARTED = 'video.processing.started',
  VIDEO_PROCESSING_COMPLETED = 'video.processing.completed',
  VIDEO_PROCESSING_FAILED = 'video.processing.failed',
  POST_SCHEDULED = 'post.scheduled',
  POST_PUBLISHED = 'post.published',
  POST_FAILED = 'post.failed',
  ANALYTICS_UPDATED = 'analytics.updated',
  COMMENT_RECEIVED = 'comment.received',
}

// Configuration Types
export interface ServiceConfig {
  port: number;
  env: Environment;
  logLevel: string;
  corsOrigins: string[];
  jwtSecret: string;
  jwtAccessExpiry: string;
  jwtRefreshExpiry: string;
  databaseUrl: string;
  redisUrl: string;
}

export enum Environment {
  DEVELOPMENT = 'development',
  STAGING = 'staging',
  PRODUCTION = 'production',
  TEST = 'test',
}

// ============================================================================
// PHASE 2 EXPORTS - Advanced Creator Intelligence Features
// ============================================================================
export * from './phase2';
