// Phase 2: Advanced Creator Intelligence Types

// ============================================================================
// 1. Auto-Viral Optimization Engine
// ============================================================================

export interface ViralityAnalysis {
  id: string;
  videoId: string;
  score: number; // 0-100
  analysisDate: Date;
  factors: ViralityFactor[];
  suggestions: Virality Suggestion[];
  metadata: Record<string, any>;
}

export interface ViralityFactor {
  name: string;
  score: number; // 0-100
  weight: number; // How important this factor is
  description: string;
}

export enum ViralityFactorType {
  HOOK_STRENGTH = 'HOOK_STRENGTH',
  PACING = 'PACING',
  SILENCE_RATIO = 'SILENCE_RATIO',
  SUBTITLE_DENSITY = 'SUBTITLE_DENSITY',
  CUT_FREQUENCY = 'CUT_FREQUENCY',
  VISUAL_VARIETY = 'VISUAL_VARIETY',
  AUDIO_ENERGY = 'AUDIO_ENERGY',
}

export interface ViralitySuggestion {
  type: SuggestionType;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  timestamp?: number; // Seconds into video
  actionable: boolean;
  implementation?: string;
}

export enum SuggestionType {
  CUT_SECTION = 'CUT_SECTION',
  ADD_ZOOM = 'ADD_ZOOM',
  ADD_TEXT_OVERLAY = 'ADD_TEXT_OVERLAY',
  INCREASE_PACING = 'INCREASE_PACING',
  IMPROVE_HOOK = 'IMPROVE_HOOK',
  ADD_MUSIC = 'ADD_MUSIC',
  ENHANCE_SUBTITLES = 'ENHANCE_SUBTITLES',
}

// ============================================================================
// 2. CreatorPreset™ – Style & Template System
// ============================================================================

export interface CreatorPreset {
  id: string;
  name: string;
  description: string;
  category: PresetCategory;
  thumbnailUrl: string;
  isBuiltIn: boolean;
  userId?: string; // null for built-in presets
  config: PresetConfig;
  createdAt: Date;
  updatedAt: Date;
}

export enum PresetCategory {
  MRBEAST_STYLE = 'MRBEAST_STYLE',
  PODCAST = 'PODCAST',
  MEME = 'MEME',
  FITNESS = 'FITNESS',
  EDUCATIONAL = 'EDUCATIONAL',
  VLOG = 'VLOG',
  GAMING = 'GAMING',
  CUSTOM = 'CUSTOM',
}

export interface PresetConfig {
  subtitles: SubtitleStyle;
  overlays: OverlayConfig[];
  borders: BorderConfig;
  background: BackgroundConfig;
  effects: EffectConfig[];
}

export interface SubtitleStyle {
  font: string;
  fontSize: number;
  color: string;
  backgroundColor: string;
  outlineColor?: string;
  outlineWidth?: number;
  position: 'top' | 'center' | 'bottom';
  alignment: 'left' | 'center' | 'right';
  animation?: 'fade' | 'slide' | 'pop' | 'none';
  maxWordsPerLine: number;
  uppercase: boolean;
  bold: boolean;
}

export interface OverlayConfig {
  type: 'emoji' | 'text' | 'image' | 'shape';
  content: string;
  position: { x: number; y: number }; // Percentage of screen
  size: { width: number; height: number };
  duration?: { start: number; end: number }; // Seconds
  animation?: string;
}

export interface BorderConfig {
  enabled: boolean;
  width: number;
  color: string;
  style: 'solid' | 'gradient';
  rounded: boolean;
}

export interface BackgroundConfig {
  type: 'color' | 'gradient' | 'blur' | 'image';
  value: string | string[]; // color hex, gradient colors, or image URL
  opacity: number;
}

export interface EffectConfig {
  type: 'zoom' | 'shake' | 'flash' | 'glitch' | 'transition';
  intensity: number;
  timestamp: number;
  duration: number;
}

// ============================================================================
// 3. AI-Generated Thumbnail Frame
// ============================================================================

export interface ThumbnailFrame {
  id: string;
  videoId: string;
  frameUrl: string;
  insertPosition: number; // Seconds into video
  config: ThumbnailFrameConfig;
  createdAt: Date;
}

export interface ThumbnailFrameConfig {
  text: string;
  textColor: string;
  backgroundColor: string;
  faceEmphasis: boolean;
  template: 'bold' | 'minimal' | 'dramatic' | 'custom';
  elements: ThumbnailElement[];
}

export interface ThumbnailElement {
  type: 'text' | 'face' | 'emoji' | 'arrow' | 'circle';
  position: { x: number; y: number };
  size: { width: number; height: number };
  style: Record<string, any>;
}

// ============================================================================
// 4. Real-Time Performance Prediction
// ============================================================================

export interface PerformancePrediction {
  id: string;
  videoId: string;
  platform: Platform;
  predictedAt: Date;
  scheduledTime?: Date;
  metrics: PredictedMetrics;
  confidence: number; // 0-1
  factors: PredictionFactor[];
}

export interface PredictedMetrics {
  viewsRange: { min: number; max: number; expected: number };
  likesRange: { min: number; max: number; expected: number };
  commentsRange: { min: number; max: number; expected: number };
  engagementRate: { min: number; max: number; expected: number };
  viralityProbability: number; // 0-1 chance of going viral
}

export interface PredictionFactor {
  name: string;
  impact: 'positive' | 'negative' | 'neutral';
  weight: number;
  description: string;
}

// ============================================================================
// 5. Competitor Tracking & Intelligence
// ============================================================================

export interface CompetitorProfile {
  id: string;
  userId: string;
  platform: Platform;
  handle: string;
  displayName: string;
  profilePicture: string | null;
  followerCount: number;
  isActive: boolean;
  addedAt: Date;
  lastSyncedAt: Date | null;
}

export interface CompetitorVideo {
  id: string;
  competitorProfileId: string;
  platformVideoId: string;
  title: string;
  description: string | null;
  publishedAt: Date;
  thumbnailUrl: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  duration: number;
  topics: string[];
  createdAt: Date;
}

export interface CompetitorAnalytics {
  competitorProfileId: string;
  period: { start: Date; end: Date };
  summary: {
    totalVideos: number;
    postingFrequency: number; // Videos per week
    avgViews: number;
    avgEngagementRate: number;
    topPerformingVideo: CompetitorVideo;
  };
  topTopics: Array<{ topic: string; count: number; avgViews: number }>;
  postingPattern: Array<{ dayOfWeek: number; hour: number; frequency: number }>;
}

// ============================================================================
// 6. A/B Testing for Short Videos
// ============================================================================

export interface Experiment {
  id: string;
  userId: string;
  name: string;
  status: ExperimentStatus;
  variantA: ExperimentVariant;
  variantB: ExperimentVariant;
  targetPlatforms: Platform[];
  startDate: Date;
  endDate: Date | null;
  results: ExperimentResults | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum ExperimentStatus {
  DRAFT = 'DRAFT',
  RUNNING = 'RUNNING',
  COMPLETED = 'COMPLETED',
  CANCELED = 'CANCELED',
}

export interface ExperimentVariant {
  videoId: string;
  assetId: string;
  caption?: string;
  hashtags?: string[];
  scheduledPosts: string[]; // IDs of scheduled posts
}

export interface ExperimentResults {
  winner: 'A' | 'B' | 'TIE';
  confidence: number; // Statistical confidence
  variantAMetrics: VariantMetrics;
  variantBMetrics: VariantMetrics;
  analysis: string;
  completedAt: Date;
}

export interface VariantMetrics {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalShares: number;
  engagementRate: number;
  avgWatchTime: number;
  completionRate: number;
}

// ============================================================================
// 7. Creator "Brain" – Knowledge Graph
// ============================================================================

export interface ContentGraph {
  userId: string;
  nodes: ContentNode[];
  edges: ContentEdge[];
  generatedAt: Date;
}

export interface ContentNode {
  id: string;
  type: NodeType;
  label: string;
  metadata: Record<string, any>;
  performance?: {
    avgViews: number;
    avgEngagementRate: number;
    totalPosts: number;
  };
}

export enum NodeType {
  VIDEO = 'VIDEO',
  TOPIC = 'TOPIC',
  THEME = 'THEME',
  TAG = 'TAG',
  QUESTION = 'QUESTION',
  TREND = 'TREND',
}

export interface ContentEdge {
  from: string; // Node ID
  to: string; // Node ID
  type: EdgeType;
  weight: number; // Strength of relationship
  metadata?: Record<string, any>;
}

export enum EdgeType {
  SAME_TOPIC = 'SAME_TOPIC',
  RELATED_THEME = 'RELATED_THEME',
  HIGH_PERFORMANCE = 'HIGH_PERFORMANCE',
  AUDIENCE_INTEREST = 'AUDIENCE_INTEREST',
  SIMILAR_CONTENT = 'SIMILAR_CONTENT',
}

export interface ContentOpportunity {
  type: OpportunityType;
  title: string;
  description: string;
  priority: number; // 0-100
  supportingData: {
    relatedNodes: ContentNode[];
    performanceIndicators: Record<string, number>;
  };
  suggestions: string[];
}

export enum OpportunityType {
  DOUBLE_DOWN = 'DOUBLE_DOWN', // Topic is performing well
  CONTENT_GAP = 'CONTENT_GAP', // Missing content on interested topic
  EXPAND_THEME = 'EXPAND_THEME', // Branch into related theme
  ANSWER_QUESTIONS = 'ANSWER_QUESTIONS', // Address audience questions
  RIDE_TREND = 'RIDE_TREND', // Capitalize on trending topic
}

// ============================================================================
// 8. Viral Content Recycler
// ============================================================================

export interface RecycleSuggestion {
  id: string;
  userId: string;
  originalVideoId: string;
  reason: RecycleReason;
  score: number; // 0-100 recommendation strength
  analysis: {
    originalPerformance: PerformanceMetrics;
    ageInDays: number;
    currentRelevance: number;
    estimatedNewReach: number;
  };
  suggestions: string[];
  createdAt: Date;
}

export enum RecycleReason {
  HIGH_EVERGREEN = 'HIGH_EVERGREEN', // Evergreen content
  UNDEREXPOSED = 'UNDEREXPOSED', // Good engagement but low views
  SEASONAL_TIMING = 'SEASONAL_TIMING', // Relevant again
  TRENDING_TOPIC = 'TRENDING_TOPIC', // Topic is trending again
  AUDIENCE_GROWTH = 'AUDIENCE_GROWTH', // New audience hasn't seen it
}

// ============================================================================
// 9. Weekly Creator Growth Report
// ============================================================================

export interface WeeklyDigest {
  id: string;
  userId: string;
  weekStart: Date;
  weekEnd: Date;
  generatedAt: Date;
  sections: DigestSection[];
}

export interface DigestSection {
  title: string;
  type: DigestSectionType;
  content: any; // Type varies by section
  priority: number;
}

export enum DigestSectionType {
  TOP_PERFORMERS = 'TOP_PERFORMERS',
  WORST_PERFORMERS = 'WORST_PERFORMERS',
  CONTENT_IDEAS = 'CONTENT_IDEAS',
  OPTIMAL_TIMES = 'OPTIMAL_TIMES',
  COMPETITOR_SUMMARY = 'COMPETITOR_SUMMARY',
  GROWTH_METRICS = 'GROWTH_METRICS',
  ACTION_ITEMS = 'ACTION_ITEMS',
}

export interface DigestTopPerformers {
  videos: Array<{
    videoId: string;
    title: string;
    metrics: PerformanceMetrics;
    whyItWorked: string;
  }>;
}

export interface DigestContentIdeas {
  ideas: Array<{
    title: string;
    description: string;
    reasoning: string;
    estimatedPerformance: number;
    topics: string[];
  }>;
}

export interface DigestOptimalTimes {
  recommendations: OptimalPostingTime[];
  reasoning: string;
}

export interface DigestCompetitorSummary {
  competitors: Array<{
    name: string;
    topVideo: {
      title: string;
      views: number;
    };
    weeklyGrowth: number;
  }>;
  insights: string[];
}

// ============================================================================
// Extended Comment Types for AI Moderation
// ============================================================================

export interface CommentClassification {
  commentId: string;
  classification: CommentClassification;
  sentiment: CommentSentiment;
  toxicity: number; // 0-1
  suggestedAction: 'approve' | 'hide' | 'delete' | 'review';
  suggestedReply?: string;
  confidence: number;
  analyzedAt: Date;
}

export interface BrandVoice {
  userId: string;
  tone: 'professional' | 'friendly' | 'humorous' | 'educational' | 'casual';
  keywords: string[];
  examples: string[];
  prohibitedWords: string[];
}
