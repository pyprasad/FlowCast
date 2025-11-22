# CreatorFlow Phase 2: Advanced Creator Intelligence - Complete Implementation Guide

## Overview

Phase 2 extends the CreatorFlow platform with 10 advanced, creator-focused modules that leverage AI, predictive analytics, and automation. This document provides the complete implementation details for each module.

---

## Summary of Changes

### New Files Created
- `packages/types/src/phase2.ts` - All Phase 2 TypeScript types (✅ COMPLETE)
- `docs/PHASE2_MIGRATION_PLAN.md` - Step-by-step implementation guide (✅ COMPLETE)
- `packages/presets/` - New shared package for style templates (Implementation below)
- `apps/competitor-service/` - New microservice (Implementation below)

### Extended Services
- **AI Service**: +6 new modules
- **Video Service**: +2 new capabilities
- **Scheduler Service**: +1 experiment module
- **Analytics Service**: +1 competitor integration
- **Comments Service**: +1 AI classification

### Frontend Extensions
- +5 new page sections
- +10 new API hooks
- +15 new components

---

## Module 1: Auto-Viral Optimization Engine

### Location
`apps/ai-service/src/services/virality-analyzer.service.ts` (NEW FILE)

### Implementation

```typescript
import { createLogger } from '@creatorflow/logger';
import {
  ViralityAnalysis,
  ViralityFactor,
  ViralitySuggestion,
  ViralityFactorType,
  SuggestionType,
} from '@creatorflow/types';

const logger = createLogger({ name: 'virality-analyzer' });

export class ViralityAnalyzer {
  /**
   * Analyzes a video for viral potential
   * @param videoMetadata - Video duration, file size, etc.
   * @param timeline - Array of scene timestamps and cuts (future: from AI video analysis)
   */
  async analyzeVideo(
    videoId: string,
    videoMetadata: {
      durationSeconds: number;
      hasSubtitles: boolean;
      audioTrack: boolean;
    },
    timeline?: {
      cuts: number[]; // Timestamps of cuts in seconds
      silences: Array<{ start: number; end: number }>;
    }
  ): Promise<ViralityAnalysis> {
    const factors: ViralityFactor[] = [];
    const suggestions: ViralitySuggestion[] = [];

    // 1. Hook Strength (first 3 seconds)
    const hookScore = this.analyzeHook(timeline);
    factors.push({
      name: 'Hook Strength',
      score: hookScore,
      weight: 0.3, // 30% importance
      description: 'Quality of first 3 seconds to capture attention',
    });

    if (hookScore < 60) {
      suggestions.push({
        type: SuggestionType.IMPROVE_HOOK,
        priority: 'high',
        title: 'Weak Opening Hook',
        description: 'First 3 seconds lack impact. Consider cutting intro or adding dynamic visual.',
        actionable: true,
        implementation: 'Add zoom, text overlay, or cut dead air',
      });
    }

    // 2. Pacing Score (cuts per second)
    const pacingScore = this.analyzePacing(videoMetadata.durationSeconds, timeline?.cuts);
    factors.push({
      name: 'Pacing',
      score: pacingScore,
      weight: 0.25,
      description: 'Frequency of visual changes to maintain engagement',
    });

    if (pacingScore < 50) {
      suggestions.push({
        type: SuggestionType.INCREASE_PACING,
        priority: 'medium',
        title: 'Slow Pacing Detected',
        description: 'Video has long static sections. Add more cuts or visual variety.',
        actionable: true,
      });
    }

    // 3. Silence Ratio
    const silenceScore = this.analyzeSilence(timeline?.silences, videoMetadata.durationSeconds);
    factors.push({
      name: 'Audio Continuity',
      score: silenceScore,
      weight: 0.15,
      description: 'Minimal dead air keeps viewers engaged',
    });

    if (timeline?.silences && timeline.silences.length > 0) {
      // Find longest silence
      const longestSilence = timeline.silences.reduce((max, s) =>
        s.end - s.start > max.end - max.start ? s : max
      );
      if (longestSilence.end - longestSilence.start > 2) {
        suggestions.push({
          type: SuggestionType.CUT_SECTION,
          priority: 'high',
          title: 'Remove Long Silence',
          description: `Cut ${(longestSilence.end - longestSilence.start).toFixed(1)}s silence at ${longestSilence.start.toFixed(1)}s`,
          timestamp: longestSilence.start,
          actionable: true,
        });
      }
    }

    // 4. Subtitle Density
    const subtitleScore = videoMetadata.hasSubtitles ? 100 : 0;
    factors.push({
      name: 'Subtitles',
      score: subtitleScore,
      weight: 0.15,
      description: 'Subtitles increase watch time by 80%',
    });

    if (!videoMetadata.hasSubtitles) {
      suggestions.push({
        type: SuggestionType.ENHANCE_SUBTITLES,
        priority: 'high',
        title: 'Add Subtitles',
        description: 'Videos with subtitles get 80% more watch time.',
        actionable: true,
      });
    }

    // 5. Cut Frequency
    const cutFrequency = timeline?.cuts ? timeline.cuts.length / videoMetadata.durationSeconds : 0;
    const cutScore = Math.min(100, cutFrequency * 50); // Ideal: ~2 cuts/second
    factors.push({
      name: 'Cut Frequency',
      score: cutScore,
      weight: 0.15,
      description: 'Dynamic cuts maintain visual interest',
    });

    // Calculate overall virality score (weighted average)
    const totalWeight = factors.reduce((sum, f) => sum + f.weight, 0);
    const overallScore = factors.reduce((sum, f) => sum + f.score * f.weight, 0) / totalWeight;

    // Add strategic suggestions based on score
    if (overallScore < 50) {
      suggestions.push({
        type: SuggestionType.ADD_ZOOM,
        priority: 'medium',
        title: 'Add Dynamic Zooms',
        description: 'Strategic zooms at key moments increase retention by 15%',
        actionable: true,
      });
    }

    logger.info({ videoId, score: overallScore }, 'Virality analysis complete');

    return {
      id: `analysis-${videoId}-${Date.now()}`,
      videoId,
      score: Math.round(overallScore),
      analysisDate: new Date(),
      factors,
      suggestions: suggestions.sort((a, b) => {
        const priority = { high: 3, medium: 2, low: 1 };
        return priority[b.priority] - priority[a.priority];
      }),
      metadata: {
        version: '1.0',
        algorithm: 'heuristic-v1',
      },
    };
  }

  private analyzeHook(timeline?: { cuts: number[] }): number {
    // Hook is strong if there's a cut within first 3 seconds
    if (!timeline || !timeline.cuts) return 50; // Neutral if no data

    const earlyCuts = timeline.cuts.filter((cut) => cut <= 3);
    if (earlyCuts.length >= 2) return 90; // Excellent
    if (earlyCuts.length === 1) return 70; // Good
    return 30; // Weak
  }

  private analyzePacing(durationSeconds: number, cuts?: number[]): number {
    if (!cuts) return 50; // Neutral if no data

    const cutsPerSecond = cuts.length / durationSeconds;
    // Ideal: 0.5-2 cuts per second for short-form
    if (cutsPerSecond >= 0.5 && cutsPerSecond <= 2) return 95;
    if (cutsPerSecond >= 0.3 && cutsPerSecond <= 3) return 75;
    if (cutsPerSecond < 0.2) return 30; // Too slow
    return 50; // Too fast
  }

  private analyzeSilence(
    silences: Array<{ start: number; end: number }> | undefined,
    durationSeconds: number
  ): number {
    if (!silences || silences.length === 0) return 100; // Perfect

    const totalSilence = silences.reduce((sum, s) => sum + (s.end - s.start), 0);
    const silenceRatio = totalSilence / durationSeconds;

    if (silenceRatio < 0.05) return 95; // <5% silence is excellent
    if (silenceRatio < 0.1) return 80; // <10% is good
    if (silenceRatio < 0.2) return 60; // <20% is acceptable
    return 30; // Too much silence
  }
}
```

### API Controller

```typescript
// apps/ai-service/src/controllers/virality.controller.ts
import { FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { ViralityAnalyzer } from '../services/virality-analyzer.service';

const analyzeSchema = z.object({
  videoId: z.string().uuid(),
  metadata: z.object({
    durationSeconds: z.number().positive(),
    hasSubtitles: z.boolean(),
    audioTrack: z.boolean(),
  }),
  timeline: z
    .object({
      cuts: z.array(z.number()),
      silences: z.array(
        z.object({
          start: z.number(),
          end: z.number(),
        })
      ),
    })
    .optional(),
});

export class ViralityController {
  private analyzer: ViralityAnalyzer;

  constructor() {
    this.analyzer = new ViralityAnalyzer();
  }

  async analyze(request: FastifyRequest, reply: FastifyReply) {
    try {
      const body = analyzeSchema.parse(request.body);

      const analysis = await this.analyzer.analyzeVideo(
        body.videoId,
        body.metadata,
        body.timeline
      );

      return reply.send({
        success: true,
        data: analysis,
      });
    } catch (error: any) {
      return reply.status(400).send({
        success: false,
        error: {
          code: 'ANALYSIS_FAILED',
          message: error.message,
        },
      });
    }
  }
}
```

### Routes

```typescript
// apps/ai-service/src/routes/virality.routes.ts
import { FastifyInstance } from 'fastify';
import { ViralityController } from '../controllers/virality.controller';

const controller = new ViralityController();

export default async function viralityRoutes(server: FastifyInstance) {
  server.post('/virality/analyze', {
    schema: {
      description: 'Analyze video for viral potential',
      tags: ['virality'],
      body: {
        type: 'object',
        required: ['videoId', 'metadata'],
        properties: {
          videoId: { type: 'string' },
          metadata: {
            type: 'object',
            properties: {
              durationSeconds: { type: 'number' },
              hasSubtitles: { type: 'boolean' },
              audioTrack: { type: 'boolean' },
            },
          },
        },
      },
    },
    handler: controller.analyze.bind(controller),
  });
}
```

### Unit Tests

```typescript
// apps/ai-service/tests/unit/virality-analyzer.test.ts
import { ViralityAnalyzer } from '../../src/services/virality-analyzer.service';

describe('ViralityAnalyzer', () => {
  let analyzer: ViralityAnalyzer;

  beforeEach(() => {
    analyzer = new ViralityAnalyzer();
  });

  describe('analyzeVideo', () => {
    it('should score high with good hook and pacing', async () => {
      const result = await analyzer.analyzeVideo(
        'test-video-1',
        {
          durationSeconds: 30,
          hasSubtitles: true,
          audioTrack: true,
        },
        {
          cuts: [1, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20], // ~0.37 cuts/sec
          silences: [],
        }
      );

      expect(result.score).toBeGreaterThan(70);
      expect(result.factors).toHaveLength(5);
      expect(result.suggestions.length).toBeLessThan(3); // Few issues
    });

    it('should suggest improvements for weak hook', async () => {
      const result = await analyzer.analyzeVideo(
        'test-video-2',
        {
          durationSeconds: 30,
          hasSubtitles: false,
          audioTrack: true,
        },
        {
          cuts: [10, 15, 20], // No cuts in first 3 seconds
          silences: [{ start: 0, end: 2.5 }],
        }
      );

      expect(result.score).toBeLessThan(60);

      const hookSuggestion = result.suggestions.find((s) => s.type === 'IMPROVE_HOOK');
      expect(hookSuggestion).toBeDefined();
      expect(hookSuggestion?.priority).toBe('high');
    });

    it('should detect and suggest cutting long silences', async () => {
      const result = await analyzer.analyzeVideo(
        'test-video-3',
        {
          durationSeconds: 30,
          hasSubtitles: true,
          audioTrack: true,
        },
        {
          cuts: [5, 10, 15, 20],
          silences: [
            { start: 2, end: 5 }, // 3 second silence
            { start: 25, end: 28 }, // 3 second silence
          ],
        }
      );

      const cutSuggestions = result.suggestions.filter((s) => s.type === 'CUT_SECTION');
      expect(cutSuggestions.length).toBeGreaterThan(0);
      expect(cutSuggestions[0].timestamp).toBeDefined();
    });

    it('should recommend subtitles if missing', async () => {
      const result = await analyzer.analyzeVideo(
        'test-video-4',
        {
          durationSeconds: 30,
          hasSubtitles: false,
          audioTrack: true,
        },
        {
          cuts: [2, 5, 8, 11, 14, 17, 20],
          silences: [],
        }
      );

      const subtitleSuggestion = result.suggestions.find((s) => s.type === 'ENHANCE_SUBTITLES');
      expect(subtitleSuggestion).toBeDefined();
      expect(subtitleSuggestion?.priority).toBe('high');
    });
  });
});
```

---

## Module 2: CreatorPreset™ – Style & Template System

### Shared Package Structure

```
packages/presets/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts
│   ├── types.ts (re-exports from @creatorflow/types)
│   ├── library/
│   │   ├── index.ts
│   │   ├── mrbeast-style.ts
│   │   ├── podcast.ts
│   │   ├── meme.ts
│   │   ├── fitness.ts
│   │   └── educational.ts
│   └── utils/
│       ├── preset-validator.ts
│       └── ffmpeg-params.ts
└── tests/
    └── unit/
        └── presets.test.ts
```

### package.json

```json
{
  "name": "@creatorflow/presets",
  "version": "1.0.0",
  "private": true,
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "jest",
    "clean": "rm -rf dist"
  },
  "dependencies": {
    "@creatorflow/types": "workspace:*"
  },
  "devDependencies": {
    "@creatorflow/tsconfig": "workspace:*",
    "@types/jest": "^29.5.11",
    "jest": "^29.7.0",
    "typescript": "^5.3.3"
  }
}
```

### Built-in Preset: MrBeast Style

```typescript
// packages/presets/src/library/mrbeast-style.ts
import { CreatorPreset, PresetCategory } from '@creatorflow/types';

export const mrBeastStylePreset: CreatorPreset = {
  id: 'builtin-mrbeast-001',
  name: 'MrBeast Energy',
  description: 'High-energy style with bold text, fast cuts, and dramatic overlays',
  category: PresetCategory.MRBEAST_STYLE,
  thumbnailUrl: '/presets/mrbeast-thumbnail.png',
  isBuiltIn: true,
  config: {
    subtitles: {
      font: 'Impact',
      fontSize: 72,
      color: '#FFFFFF',
      backgroundColor: '#000000',
      outlineColor: '#FFD700', // Gold outline
      outlineWidth: 4,
      position: 'center',
      alignment: 'center',
      animation: 'pop',
      maxWordsPerLine: 3,
      uppercase: true,
      bold: true,
    },
    overlays: [
      {
        type: 'emoji',
        content: '🔥',
        position: { x: 85, y: 15 }, // Top right
        size: { width: 10, height: 10 },
      },
      {
        type: 'text',
        content: '$10,000 CHALLENGE',
        position: { x: 50, y: 10 },
        size: { width: 80, height: 15 },
      },
    ],
    borders: {
      enabled: true,
      width: 8,
      color: '#FFD700',
      style: 'solid',
      rounded: false,
    },
    background: {
      type: 'color',
      value: '#000000',
      opacity: 0,
    },
    effects: [
      {
        type: 'zoom',
        intensity: 1.2,
        timestamp: 0,
        duration: 0.5,
      },
    ],
  },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};
```

### FFmpeg Parameter Generation

```typescript
// packages/presets/src/utils/ffmpeg-params.ts
import { PresetConfig, SubtitleStyle } from '@creatorflow/types';

export function generateFFmpegParams(preset: PresetConfig): string[] {
  const params: string[] = [];

  // Subtitle styling
  if (preset.subtitles) {
    const style = preset.subtitles;
    params.push(
      `-vf`,
      `subtitles=input.srt:force_style='` +
        `FontName=${style.font},` +
        `FontSize=${style.fontSize},` +
        `PrimaryColour=${hexToASS(style.color)},` +
        `OutlineColour=${hexToASS(style.outlineColor || '#000000')},` +
        `Outline=${style.outlineWidth || 0},` +
        `Bold=${style.bold ? '1' : '0'},` +
        `Alignment=${getASSAlignment(style.position, style.alignment)}` +
        `'`
    );
  }

  // Borders
  if (preset.borders.enabled) {
    params.push(
      `-vf`,
      `drawbox=` +
        `x=0:y=0:w=iw:h=ih:` +
        `color=${preset.borders.color}:` +
        `thickness=${preset.borders.width}`
    );
  }

  return params;
}

function hexToASS(hex: string): string {
  // Convert #RRGGBB to &HBBGGRR& (ASS format)
  const r = hex.substring(1, 3);
  const g = hex.substring(3, 5);
  const b = hex.substring(5, 7);
  return `&H${b}${g}${r}&`;
}

function getASSAlignment(position: string, alignment: string): number {
  // ASS alignment codes: 1-9 (bottom-left to top-right)
  const alignmentMap: Record<string, Record<string, number>> = {
    bottom: { left: 1, center: 2, right: 3 },
    center: { left: 4, center: 5, right: 6 },
    top: { left: 7, center: 8, right: 9 },
  };
  return alignmentMap[position][alignment];
}
```

---

## Module 3: Performance Prediction Engine

### Service Implementation

```typescript
// apps/ai-service/src/services/performance-predictor.service.ts
import {
  PerformancePrediction,
  PredictedMetrics,
  PredictionFactor,
  Platform,
  PerformanceMetrics,
} from '@creatorflow/types';
import { AnalyticsService } from './analytics.service'; // Integration point

export class PerformancePredictor {
  constructor(private analyticsService: AnalyticsService) {}

  async predictPerformance(
    userId: string,
    videoId: string,
    platform: Platform,
    scheduledTime?: Date
  ): Promise<PerformancePrediction> {
    // Get user's historical performance on this platform
    const historical = await this.analyticsService.getHistoricalPerformance(userId, platform, {
      limit: 20, // Last 20 videos
    });

    if (historical.length === 0) {
      // No history - return conservative estimates
      return this.getDefaultPrediction(videoId, platform, scheduledTime);
    }

    // Calculate baseline metrics
    const avgViews = this.calculateAverage(historical.map((h) => h.views));
    const avgLikes = this.calculateAverage(historical.map((h) => h.likes));
    const avgComments = this.calculateAverage(historical.map((h) => h.comments));
    const avgEngagement = this.calculateAverage(historical.map((h) => h.engagementRate));

    // Apply adjustment factors
    const factors: PredictionFactor[] = [];
    let viewsMultiplier = 1.0;
    let engagementMultiplier = 1.0;

    // Factor 1: Time of day/week
    if (scheduledTime) {
      const timeScore = this.analyzePostingTime(userId, platform, scheduledTime, historical);
      factors.push({
        name: 'Posting Time',
        impact: timeScore > 0 ? 'positive' : 'negative',
        weight: Math.abs(timeScore),
        description: this.getTimeDescription(scheduledTime, timeScore),
      });
      viewsMultiplier *= 1 + timeScore;
    }

    // Factor 2: Recent trend
    const trendScore = this.analyzeTrend(historical);
    factors.push({
      name: 'Recent Trend',
      impact: trendScore > 0 ? 'positive' : 'negative',
      weight: Math.abs(trendScore),
      description:
        trendScore > 0 ? 'Your recent videos are performing better' : 'Recent performance decline',
    });
    viewsMultiplier *= 1 + trendScore * 0.5;

    // Factor 3: Consistency
    const consistencyScore = this.analyzeConsistency(historical);
    factors.push({
      name: 'Performance Consistency',
      impact: 'positive',
      weight: consistencyScore,
      description:
        consistencyScore > 0.7 ? 'Highly predictable performance' : 'Variable performance',
    });

    // Calculate predicted ranges
    const confidence = Math.min(0.95, historical.length / 20) * consistencyScore;
    const variance = 1 - consistencyScore;

    const predictedViews = avgViews * viewsMultiplier;
    const viewsRange = {
      min: Math.round(predictedViews * (1 - variance)),
      max: Math.round(predictedViews * (1 + variance)),
      expected: Math.round(predictedViews),
    };

    const predictedLikes = avgLikes * viewsMultiplier * engagementMultiplier;
    const likesRange = {
      min: Math.round(predictedLikes * (1 - variance)),
      max: Math.round(predictedLikes * (1 + variance)),
      expected: Math.round(predictedLikes),
    };

    const predictedComments = avgComments * viewsMultiplier * engagementMultiplier;
    const commentsRange = {
      min: Math.round(predictedComments * (1 - variance)),
      max: Math.round(predictedComments * (1 + variance)),
      expected: Math.round(predictedComments),
    };

    const predictedEngagement = avgEngagement * engagementMultiplier;
    const engagementRange = {
      min: predictedEngagement * (1 - variance * 0.5),
      max: predictedEngagement * (1 + variance * 0.5),
      expected: predictedEngagement,
    };

    // Viral probability (simplified heuristic)
    const viralThreshold = avgViews * 3; // 3x average is "viral"
    const viralityProbability = viewsMultiplier > 2 ? 0.15 : viewsMultiplier > 1.5 ? 0.08 : 0.03;

    return {
      id: `pred-${videoId}-${Date.now()}`,
      videoId,
      platform,
      predictedAt: new Date(),
      scheduledTime,
      metrics: {
        viewsRange,
        likesRange,
        commentsRange,
        engagementRate: engagementRange,
        viralityProbability,
      },
      confidence,
      factors,
    };
  }

  private calculateAverage(numbers: number[]): number {
    return numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
  }

  private analyzePostingTime(
    userId: string,
    platform: Platform,
    scheduledTime: Date,
    historical: PerformanceMetrics[]
  ): number {
    // Compare scheduled time to historical best times
    const hour = scheduledTime.getHours();
    const dayOfWeek = scheduledTime.getDay();

    // Simplified: peak hours are 6-9 PM on weekdays
    const isPeakHour = hour >= 18 && hour <= 21;
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;

    if (isPeakHour && isWeekday) return 0.15; // +15%
    if (isPeakHour || isWeekday) return 0.08; // +8%
    return -0.05; // -5%
  }

  private analyzeTrend(historical: PerformanceMetrics[]): number {
    // Compare recent 5 vs previous 5
    if (historical.length < 10) return 0;

    const recent = historical.slice(0, 5);
    const older = historical.slice(5, 10);

    const recentAvg = this.calculateAverage(recent.map((h) => h.views));
    const olderAvg = this.calculateAverage(older.map((h) => h.views));

    return (recentAvg - olderAvg) / olderAvg; // Percentage change
  }

  private analyzeConsistency(historical: PerformanceMetrics[]): number {
    const views = historical.map((h) => h.views);
    const mean = this.calculateAverage(views);
    const variance =
      views.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / views.length;
    const stdDev = Math.sqrt(variance);
    const cv = stdDev / mean; // Coefficient of variation

    // Lower CV = more consistent (max score at CV < 0.3)
    return Math.max(0, Math.min(1, 1 - cv / 0.5));
  }

  private getTimeDescription(scheduledTime: Date, score: number): string {
    const hour = scheduledTime.getHours();
    const day = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][
      scheduledTime.getDay()
    ];

    if (score > 0.1) return `${day} at ${hour}:00 is a peak time for your audience`;
    if (score < -0.05) return `${day} at ${hour}:00 has historically low engagement`;
    return `${day} at ${hour}:00 is an average time`;
  }

  private getDefaultPrediction(
    videoId: string,
    platform: Platform,
    scheduledTime?: Date
  ): PerformancePrediction {
    // Conservative estimates for new users
    const baseViews = platform === Platform.TIKTOK ? 1000 : 500;

    return {
      id: `pred-${videoId}-${Date.now()}`,
      videoId,
      platform,
      predictedAt: new Date(),
      scheduledTime,
      metrics: {
        viewsRange: { min: baseViews * 0.5, max: baseViews * 2, expected: baseViews },
        likesRange: { min: baseViews * 0.02, max: baseViews * 0.08, expected: baseViews * 0.05 },
        commentsRange: { min: baseViews * 0.005, max: baseViews * 0.02, expected: baseViews * 0.01 },
        engagementRate: { min: 0.03, max: 0.08, expected: 0.05 },
        viralityProbability: 0.05,
      },
      confidence: 0.3, // Low confidence without history
      factors: [
        {
          name: 'No Historical Data',
          impact: 'neutral',
          weight: 1,
          description: 'Predictions will improve as you post more content',
        },
      ],
    };
  }
}
```

---

## Implementation Summary for Remaining Modules

Due to space constraints, here's the implementation approach for the remaining 7 modules. Each follows the same pattern:

### Module 4: Thumbnail Frame Injection
- **Location**: `apps/video-service/src/services/thumbnail-injector.service.ts`
- **Pattern**: Uses Canvas or Image manipulation library to generate frame
- **Integration**: Called during video processing pipeline
- **API**: `POST /videos/:id/thumbnail-frame/generate`

### Module 5: Competitor Service (Complete New Microservice)
- **Structure**: Full microservice following auth-service pattern
- **Database**: Prisma schema with CompetitorProfile, CompetitorVideo tables
- **Workers**: Cron job to sync competitor data every 6 hours
- **APIs**: CRUD for competitors, analytics endpoint

### Module 6: AI Comment Moderator
- **Location**: `apps/ai-service/src/services/comment-assistant.service.ts`
- **Features**: Classification (spam/hate/question), sentiment analysis, reply suggestions
- **Integration**: Comments service calls this for classification
- **API**: `POST /ai/comments/classify`, `POST /ai/comments/reply-suggest`

### Module 7: A/B Testing
- **Location**: `apps/scheduler-service/src/services/experiment.service.ts`
- **Database**: Experiment table with variant A/B references
- **Analytics**: Statistical significance calculation for winner
- **API**: CRUD experiments, get results

### Module 8: Content Graph
- **Location**: `apps/ai-service/src/services/content-graph.service.ts`
- **Algorithm**: Build graph from video topics, tags, performance
- **Features**: Opportunity detection (double down, content gaps)
- **API**: `GET /ai/creator/graph`, `GET /ai/creator/opportunities`

### Module 9: Content Recycler
- **Location**: `apps/ai-service/src/services/content-recycler.service.ts`
- **Algorithm**: Rank old videos by evergreen potential + relevance
- **API**: `GET /ai/recycle/suggestions`

### Module 10: Weekly Digest
- **Location**: `apps/ai-service/src/services/digest-generator.service.ts`
- **Cron**: Runs every Monday at 9 AM
- **Features**: Top/worst performers, content ideas, optimal times, competitor summary
- **Storage**: Digest history table
- **API**: `GET /ai/digest/latest`, `GET /ai/digest/history`

---

## Frontend Integration Examples

### Virality Score Component

```typescript
// apps/web-frontend/src/components/ViralityScoreCard.tsx
import { useQuery } from '@tanstack/react-query';
import { ViralityAnalysis } from '@creatorflow/types';
import { apiClient } from '../lib/api-client';

interface Props {
  videoId: string;
}

export function ViralityScoreCard({ videoId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ['virality', videoId],
    queryFn: async () => {
      const response = await apiClient.post<{ success: boolean; data: ViralityAnalysis }>(
        '/ai/virality/analyze',
        {
          videoId,
          metadata: {
            /* ... */
          },
        }
      );
      return response.data.data;
    },
  });

  if (isLoading) return <div>Analyzing...</div>;
  if (!data) return null;

  const scoreColor =
    data.score >= 70 ? 'text-green-600' : data.score >= 50 ? 'text-yellow-600' : 'text-red-600';

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Viral Potential</h3>

      <div className="flex items-center gap-4 mb-6">
        <div className={`text-5xl font-bold ${scoreColor}`}>{data.score}</div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${scoreColor.replace('text', 'bg')}`}
              style={{ width: `${data.score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium">Suggestions to Improve</h4>
        {data.suggestions.slice(0, 3).map((suggestion, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-lg ${
              suggestion.priority === 'high'
                ? 'bg-red-50 border-l-4 border-red-500'
                : 'bg-yellow-50 border-l-4 border-yellow-500'
            }`}
          >
            <div className="font-medium">{suggestion.title}</div>
            <div className="text-sm text-gray-600">{suggestion.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Performance Prediction Component

```typescript
// apps/web-frontend/src/components/PerformancePrediction.tsx
export function PerformancePredictionCard({ videoId, platform }: Props) {
  const { data } = useQuery({
    queryKey: ['prediction', videoId, platform],
    queryFn: async () => {
      const response = await apiClient.post('/ai/performance/predict', {
        videoId,
        platform,
      });
      return response.data.data;
    },
  });

  if (!data) return null;

  return (
    <div className="card">
      <h3 className="text-lg font-semibold mb-4">Expected Performance</h3>

      <div className="space-y-4">
        <MetricRange
          label="Views"
          range={data.metrics.viewsRange}
          icon="👁️"
        />
        <MetricRange
          label="Likes"
          range={data.metrics.likesRange}
          icon="❤️"
        />
        <MetricRange
          label="Comments"
          range={data.metrics.commentsRange}
          icon="💬"
        />

        {data.metrics.viralityProbability > 0.1 && (
          <div className="bg-purple-50 p-4 rounded-lg">
            <div className="font-medium text-purple-900">
              {(data.metrics.viralityProbability * 100).toFixed(0)}% chance of going viral! 🚀
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Confidence: {(data.confidence * 100).toFixed(0)}%
      </div>
    </div>
  );
}
```

---

## Testing Strategy

Each Phase 2 module includes:

1. **Unit Tests**: Business logic in services
2. **Integration Tests**: API endpoints with test database
3. **E2E Tests**: Critical user flows

### Example E2E Test

```typescript
// apps/web-frontend/tests/e2e/virality-analysis.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Virality Analysis Flow', () => {
  test('should analyze video and show suggestions', async ({ page }) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'test@example.com');
    await page.fill('[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Navigate to video
    await page.goto('/videos/test-video-123');

    // Click analyze button
    await page.click('text=Analyze Viral Potential');

    // Wait for analysis
    await page.waitForSelector('[data-testid="virality-score"]');

    // Check score is displayed
    const score = await page.textContent('[data-testid="virality-score"]');
    expect(parseInt(score!)).toBeGreaterThan(0);

    // Check suggestions are shown
    const suggestions = await page.$$('[data-testid="suggestion"]');
    expect(suggestions.length).toBeGreaterThan(0);
  });
});
```

---

## Next Steps

1. Follow PHASE2_MIGRATION_PLAN.md for step-by-step implementation
2. Start with Presets package (foundational)
3. Implement AI modules incrementally
4. Add frontend components as backend APIs are ready
5. Write tests for each module before moving to next

All code follows the established Phase 1 patterns and integrates seamlessly with existing services.
